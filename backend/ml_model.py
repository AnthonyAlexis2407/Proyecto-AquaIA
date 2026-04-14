import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from datetime import datetime, timedelta
import random

# Phase 2 Imports (Moved to local imports to prevent boot hangs)
PROPHET_AVAILABLE = True # Assume true, check inside
XGBOOST_AVAILABLE = True
OR_TOOLS_AVAILABLE = True

class WaterFlowPredictor:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=50, random_state=42)
        self.is_trained = False
        
    def _generate_synthetic_data(self, records=1000):
        """Genera un dataset sintético basado en condiciones de Junín."""
        data = []
        base_time = datetime.now() - timedelta(hours=records)
        
        # Flujo inicial Río Mantaro ~ 40 m3/s varianza
        current_flow = 40.0
        
        for i in range(records):
            current_time = base_time + timedelta(hours=i)
            hour_of_day = current_time.hour
            
            # Temperatura en Junín (Suele bajar de noche, subir de día)
            # Rango: de 2 a 18 grados aprox
            temp_base = 10 + 8 * np.sin(np.pi * (hour_of_day - 8) / 12)
            temperature = temp_base + random.uniform(-1, 1)
            
            # Probabilidad de lluvia (mayor en ciertas horas o periodos, simulado azaroso)
            rain_prob = max(0, min(100, random.uniform(-20, 40) + (temp_base * 2)))
            if rain_prob > 20: 
                # Lluvia incrementa caudal gradualmente
                current_flow += random.uniform(0.5, 3.0) 
            else:
                # Si no llueve, el río desciende suavemente al promedio
                current_flow = current_flow - random.uniform(0.1, 1.0)
                if current_flow < 20: current_flow = 20 # Mínimo
            
            # Perturbación
            current_flow += random.uniform(-0.5, 0.5)
            
            data.append({
                'hour': hour_of_day,
                'temperature': round(temperature, 2),
                'rain_prob': round(rain_prob, 2),
                'target_flow': round(current_flow, 2)
            })
            
        return pd.DataFrame(data)

    def train_model(self):
        """Entrena el modelo en memoria utilizando datos sintéticos."""
        df = self._generate_synthetic_data(records=200) # Reducido para demo
        
        # Variables predictoras (X) y Objetivo (y)
        X = df[['hour', 'temperature', 'rain_prob']]
        y = df['target_flow']
        
        self.model.fit(X, y)
        self.is_trained = True
        print("[AquaIA Model] Entrenamiento sintetico completado: Random Forest.")

    def predict(self, hour: int, temperature: float, rain_prob: float) -> float:
        """Realiza una predicción basada en los parámetros dados."""
        if not self.is_trained:
            self.train_model()
            
        # Crear Dataframe para la predicción para evitar warning
        input_data = pd.DataFrame([{
            'hour': hour,
            'temperature': temperature,
            'rain_prob': rain_prob
        }])
        
        prediction = self.model.predict(input_data)
        return round(prediction[0], 2)

class AnomalyDetector:
    def __init__(self):
        # contamination asume un % de anomalías en los datos de entrenamiento
        self.model = IsolationForest(contamination=0.05, random_state=42)
        self.is_trained = False
        
    def _generate_normal_data(self, records=1000):
        # Generar datos normales para que el modelo aprenda el estado "sano"
        data = []
        base_flow = 40.0
        for i in range(records):
            # Agregar algo de ruido normal
            flow = base_flow + random.uniform(-5.0, 5.0)
            data.append([flow])
        return np.array(data)
        
    def train_model(self):
        """Entrena el modelo de Isolation Forest con datos normales."""
        X_train = self._generate_normal_data(records=200) # Reducido para demo
        self.model.fit(X_train)
        self.is_trained = True
        print("[AquaIA Model] Entrenamiento de AnomalyDetector completado.")
        
    def detect(self, current_flow: float) -> bool:
        """Retorna True si el caudal actual es anómalo."""
        if not self.is_trained:
            self.train_model()
            
        # El modelo espera un array 2D
        prediction = self.model.predict([[current_flow]])
        # IsolationForest retorna -1 para anomalías y 1 para inliers
        # bool() convierte numpy.bool_ a bool nativo de Python (compatible con JSON)
        return bool(prediction[0] == -1)

class DemandForecaster:
    """Implementa Prophet para predicción de demanda hídrica a 7 días (PMV2)."""
    def __init__(self):
        self.model = None
        self.is_trained = False

    def _generate_historical_series(self, days=5):
        """Genera 5 días de datos históricos para entrenar Prophet."""
        data = []
        start_date = datetime.now() - timedelta(days=days)
        base_flow = 40.0
        
        for i in range(days * 24):
            current_date = start_date + timedelta(hours=i)
            # Estacionalidad diaria
            hour_effect = 5 * np.sin(np.pi * (current_date.hour - 8) / 12)
            # Estacionalidad semanal (más consumo fines de semana)
            week_effect = 3 if current_date.weekday() >= 5 else 0
            
            flow = base_flow + hour_effect + week_effect + random.uniform(-2, 2)
            data.append({"ds": current_date, "y": flow})
            
        return pd.DataFrame(data)

    def train_model(self):
        try:
            from prophet import Prophet
        except ImportError:
            print("[AquaIA Prophet] Prophet no instalado. Usando modo simulado.")
            self.is_trained = True
            return

        try:
            df = self._generate_historical_series()
            self.model = Prophet(yearly_seasonality=False, weekly_seasonality=True, daily_seasonality=True)
            self.model.fit(df)
            self.is_trained = True
            print("[AquaIA Prophet] Entrenamiento completado.")
        except Exception as e:
            print(f"[AquaIA Prophet] Error al entrenar: {e}. Usando modo simulado.")
            self.is_trained = True # Consideramos entrenado en modo simulado
            self.model = None

    def get_forecast(self, periods=24*7):
        """Retorna predicción para los próximos N periodos (horas)."""
        if not self.is_trained:
            self.train_model()

        if not PROPHET_AVAILABLE:
            # Simulación robusta si Prophet no está
            base_time = datetime.now()
            forecast = []
            for i in range(periods):
                future_date = base_time + timedelta(hours=i)
                val = 40.0 + 5 * np.sin(np.pi * (future_date.hour - 8) / 12) + random.uniform(-1, 1)
                forecast.append({"ds": future_date.strftime("%Y-%m-%d %H:%M:%S"), "yhat": round(val, 2)})
            return forecast

        if self.model is None:
            # Simulación robusta si Prophet no está o falló el entrenamiento
            base_time = datetime.now()
            forecast = []
            for i in range(periods):
                future_date = base_time + timedelta(hours=i)
                # Patrón sinusoidal realista para caudal hídrico
                val = 40.0 + 5 * np.sin(np.pi * (future_date.hour - 8) / 12) + random.uniform(-1, 1)
                forecast.append({"ds": future_date.strftime("%Y-%m-%d %H:%M:%S"), "yhat": round(val, 2)})
            return forecast

        try:
            future = self.model.make_future_dataframe(periods=periods, freq='H')
            forecast = self.model.predict(future)
            # Retornar solo los datos futuros
            result = forecast.tail(periods)[['ds', 'yhat']]
            result['ds'] = result['ds'].dt.strftime("%Y-%m-%d %H:%M:%S")
            return result.to_dict(orient='records')
        except Exception as e:
            print(f"[AquaIA Prophet] Error en predicción: {e}")
            return []

class ZoneRiskScanner:
    """Implementa XGBoost para clasificar zonas según riesgo hídrico (PMV2)."""
    def __init__(self):
        self.model = None
        self.is_trained = False
        self.zones = ["Sector Norte", "Sector Sur", "Centro Histórico", "Jauja Centro", "El Tambo"]

    def train_model(self):
        try:
            import xgboost as xgb
        except ImportError:
            print("[AquaIA XGBoost] XGBoost no instalado. Usando clasificación heurística.")
            self.is_trained = True
            return

        # Generar datos de entrenamiento: [consumo_avg, varianza, num_anomalias] -> Riesgo (0, 1, 2)
        X = []
        y = []
        for _ in range(200):
            consumo = random.uniform(20, 60)
            varianza = random.uniform(0, 15)
            anomalias = random.randint(0, 20)
            
            # Lógica de riesgo sintética
            if anomalias > 10 or varianza > 10:
                riesgo = 2 # Alto
            elif anomalias > 4 or varianza > 5:
                riesgo = 1 # Medio
            else:
                riesgo = 0 # Bajo
                
            X.append([consumo, varianza, anomalias])
            y.append(riesgo)

        self.model = xgb.XGBClassifier(n_estimators=5, max_depth=2) # Ultraligero
        self.model.fit(np.array(X), np.array(y))
        self.is_trained = True
        print("[AquaIA XGBoost] Modelo listo.")

    def scan_zones(self):
        """Escanea todas las zonas y asigna un nivel de riesgo."""
        if not self.is_trained:
            self.train_model()

        results = []
        for zone in self.zones:
            # Stats actuales simulados por zona
            consumo = random.uniform(30, 50)
            varianza = random.uniform(2, 12)
            anomalias = random.randint(0, 12)

            if XGBOOST_AVAILABLE:
                prediction = self.model.predict(np.array([[consumo, varianza, anomalias]]))[0]
                risk_level = ["LOW", "MEDIUM", "HIGH"][int(prediction)]
            else:
                # Heurística si no hay XGBoost
                if anomalias > 8: risk_level = "HIGH"
                elif anomalias > 3: risk_level = "MEDIUM"
                else: risk_level = "LOW"

            results.append({
                "zone": zone,
                "risk_score": risk_level,
                "metrics": {
                    "avg_consumption": round(consumo, 2),
                    "volatility": round(varianza, 2),
                    "anomalies_24h": anomalias
                }
            })
        return results

class LogisticsOptimizer:
    """Implementa Google OR-Tools para optimización de rutas de mantenimiento (PMV2)."""
    def __init__(self):
        self.base_location = [-11.15, -75.99] # Represa Central

    def solve_vrp(self, locations: list):
        """
        Resuelve un problema de rutas simple.
        locations: lista de dicts con {id, lat, lon}
        """
        try:
            from ortools.constraint_solver import routing_enums_pb2
            from ortools.constraint_solver import pywrapcp
        except ImportError:
            print("[AquaIA Logistics] OR-Tools no disponible. Retornando ruta secuencial simple.")
            # Simular ruta óptima (solo ordenamos por proximidad básica o simplemente el orden dado)
            route = [self.base_location] + [[loc['lat'], loc['lon']] for loc in locations] + [self.base_location]
            return {
                "route_points": route,
                "distance_km": round(len(locations) * 12.5, 2),
                "estimated_time_mins": len(locations) * 45,
                "status": "SIMULATED_MOCK"
            }

        # Lógica real de OR-Tools simplificada para demostración
        # 1. Crear matriz de distancias (Euclidiana para este prototipo)
        all_coords = [self.base_location] + [[loc['lat'], loc['lon']] for loc in locations]
        num_locations = len(all_coords)
        
        def compute_euclidean_distance(p1, p2):
            return int(np.sqrt((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2) * 1000) # Metros aprox significativos

        distance_matrix = []
        for i in range(num_locations):
            row = []
            for j in range(num_locations):
                row.append(compute_euclidean_distance(all_coords[i], all_coords[j]))
            distance_matrix.append(row)

        # 2. Configurar OR-Tools
        manager = pywrapcp.RoutingIndexManager(num_locations, 1, 0)
        routing = pywrapcp.RoutingModel(manager)

        def distance_callback(from_index, to_index):
            return distance_matrix[manager.IndexToNode(from_index)][manager.IndexToNode(to_index)]

        transit_callback_index = routing.RegisterTransitCallback(distance_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        )

        # 3. Resolver
        solution = routing.SolveWithParameters(search_parameters)
        
        if solution:
            index = routing.Start(0)
            route_coords = []
            total_distance = 0
            while not routing.IsEnd(index):
                node_index = manager.IndexToNode(index)
                route_coords.append(all_coords[node_index])
                previous_index = index
                index = solution.Value(routing.NextVar(index))
                total_distance += routing.GetArcCostForVehicle(previous_index, index, 0)
            
            route_coords.append(all_coords[manager.IndexToNode(index)]) # Volver a base
            
            return {
                "route_points": route_coords,
                "distance_km": round(total_distance / 1000, 2),
                "estimated_time_mins": int(total_distance / 200) + (len(locations) * 30), # 12km/h sim + 30m por parada
                "status": "OPTIMIZED_OR_TOOLS"
            }
        
        return {"error": "No se pudo encontrar una solución óptima"}


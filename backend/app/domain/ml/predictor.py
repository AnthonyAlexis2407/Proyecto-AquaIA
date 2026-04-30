"""
AquaIA — Water Flow Predictor (Random Forest)
Predice el caudal hídrico basado en hora, temperatura y probabilidad de lluvia.
"""
from datetime import datetime, timedelta
import random
import math

try:
    import pandas as pd
    import numpy as np
    from sklearn.ensemble import RandomForestRegressor
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False

class WaterFlowPredictor:
    def __init__(self):
        if ML_AVAILABLE:
            self.model = RandomForestRegressor(n_estimators=50, random_state=42)
        else:
            self.model = None
        self.is_trained = False
        
    def _generate_synthetic_data(self, records=1000):
        """Genera un dataset sintético basado en condiciones de Palián/Huancayo."""
        data = []
        base_time = datetime.now() - timedelta(hours=records)
        current_flow = 40.0
        
        for i in range(records):
            current_time = base_time + timedelta(hours=i)
            hour_of_day = current_time.hour
            temp_base = 10 + 8 * math.sin(math.pi * (hour_of_day - 8) / 12)
            temperature = temp_base + random.uniform(-1, 1)
            rain_prob = max(0, min(100, random.uniform(-20, 40) + (temp_base * 2)))
            
            if rain_prob > 20: 
                current_flow += random.uniform(0.5, 3.0) 
            else:
                current_flow = current_flow - random.uniform(0.1, 1.0)
                if current_flow < 20: current_flow = 20
            
            current_flow += random.uniform(-0.5, 0.5)
            data.append({
                'hour': hour_of_day,
                'temperature': round(temperature, 2),
                'rain_prob': round(rain_prob, 2),
                'target_flow': round(current_flow, 2)
            })
        return pd.DataFrame(data) if ML_AVAILABLE else data

    def train_model(self):
        """Entrena el modelo en memoria utilizando datos sintéticos."""
        if not ML_AVAILABLE:
            self.is_trained = True
            print("[AquaIA Predictor] Modo Simulado activo: Random Forest omitido.")
            return

        df = self._generate_synthetic_data(records=200)
        X = df[['hour', 'temperature', 'rain_prob']]
        y = df['target_flow']
        self.model.fit(X, y)
        self.is_trained = True
        print("[AquaIA Predictor] Entrenamiento Random Forest completado.")

    def predict(self, hour: int, temperature: float, rain_prob: float) -> float:
        """Realiza una predicción basada en los parámetros dados."""
        if not self.is_trained:
            self.train_model()
            
        if not ML_AVAILABLE:
            flow = 40.0 + 5 * math.sin(math.pi * (hour - 8) / 12) + random.uniform(-2, 2)
            if rain_prob > 30: flow += 2.0
            return round(flow, 2)

        input_data = pd.DataFrame([{'hour': hour, 'temperature': temperature, 'rain_prob': rain_prob}])
        prediction = self.model.predict(input_data)
        return round(prediction[0], 2)

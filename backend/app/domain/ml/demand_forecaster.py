"""
AquaIA — Demand Forecaster (Prophet)
Predicción de demanda hídrica a corto y mediano plazo (RF-02).
"""
from datetime import datetime, timedelta
import random
import math

try:
    import pandas as pd
    import numpy as np
    from prophet import Prophet
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False

class DemandForecaster:
    def __init__(self):
        self.model = None
        self.is_trained = False

    def _generate_historical_series(self, days=5):
        data = []
        start_date = datetime.now() - timedelta(days=days)
        base_flow = 40.0
        for i in range(days * 24):
            current_date = start_date + timedelta(hours=i)
            hour_effect = 5 * math.sin(math.pi * (current_date.hour - 8) / 12)
            week_effect = 3 if current_date.weekday() >= 5 else 0
            flow = base_flow + hour_effect + week_effect + random.uniform(-2, 2)
            data.append({"ds": current_date, "y": flow})
        return pd.DataFrame(data)

    def train_model(self):
        if not ML_AVAILABLE:
            self.is_trained = True
            print("[AquaIA Forecaster] Modo Simulado activo: Prophet omitido.")
            return

        try:
            df = self._generate_historical_series()
            self.model = Prophet(yearly_seasonality=False, weekly_seasonality=True, daily_seasonality=True)
            self.model.fit(df)
            self.is_trained = True
            print("[AquaIA Forecaster] Entrenamiento Prophet completado.")
        except Exception as e:
            print(f"[AquaIA Forecaster] Error en entrenamiento: {e}")
            self.is_trained = True

    def get_forecast(self, periods=24*7):
        """Retorna predicción para los próximos N periodos (horas)."""
        if not self.is_trained:
            self.train_model()

        if not ML_AVAILABLE or self.model is None:
            base_time = datetime.now()
            forecast = []
            for i in range(periods):
                future_date = base_time + timedelta(hours=i)
                val = 40.0 + 5 * math.sin(math.pi * (future_date.hour - 8) / 12) + random.uniform(-1, 1)
                forecast.append({"ds": future_date.strftime("%Y-%m-%d %H:%M:%S"), "yhat": round(val, 2)})
            return forecast

        try:
            future = self.model.make_future_dataframe(periods=periods, freq='h')
            forecast = self.model.predict(future)
            result = forecast.tail(periods)[['ds', 'yhat']]
            result['ds'] = result['ds'].dt.strftime("%Y-%m-%d %H:%M:%S")
            return result.to_dict(orient='records')
        except Exception as e:
            print(f"[AquaIA Forecaster] Error en predicción: {e}")
            return []

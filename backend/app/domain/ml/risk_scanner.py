"""
AquaIA — Zone Risk Scanner (XGBoost)
Clasifica zonas según su riesgo hídrico basado en consumo y anomalías.
"""
import random
import numpy as np

try:
    import xgboost as xgb
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False

class ZoneRiskScanner:
    def __init__(self):
        self.model = None
        self.is_trained = False
        self.zones = ["Palián Centro", "Palián Norte", "Palián Sur", "Palián Este", "Palián Oeste"]

    def train_model(self):
        if not ML_AVAILABLE:
            self.is_trained = True
            print("[AquaIA Risk] Modo Simulado activo: XGBoost omitido.")
            return

        try:
            X, y = [], []
            for _ in range(200):
                consumo, var, anom = random.uniform(20, 60), random.uniform(0, 15), random.randint(0, 20)
                riesgo = 2 if anom > 10 or var > 10 else (1 if anom > 4 or var > 5 else 0)
                X.append([consumo, var, anom])
                y.append(riesgo)
            
            self.model = xgb.XGBClassifier(n_estimators=5, max_depth=2, use_label_encoder=False, eval_metric='mlogloss')
            self.model.fit(np.array(X), np.array(y))
            self.is_trained = True
            print("[AquaIA Risk] Modelo XGBoost entrenado.")
        except Exception as e:
            print(f"[AquaIA Risk] Error en entrenamiento: {e}")
            self.is_trained = True

    def scan_zones(self, zone_names=None):
        if not self.is_trained:
            self.train_model()

        target_zones = zone_names or self.zones
        results = []
        for zone in target_zones:
            consumo, var, anom = random.uniform(30, 50), random.uniform(2, 12), random.randint(0, 12)
            if ML_AVAILABLE and self.model:
                prediction = self.model.predict(np.array([[consumo, var, anom]]))[0]
                risk_level = ["LOW", "MEDIUM", "HIGH"][int(prediction)]
            else:
                risk_level = "HIGH" if anom > 8 else ("MEDIUM" if anom > 3 else "LOW")

            results.append({
                "zone": zone,
                "risk_score": risk_level,
                "metrics": {
                    "avg_consumption": round(consumo, 2),
                    "volatility": round(var, 2),
                    "anomalies_24h": anom
                }
            })
        return results

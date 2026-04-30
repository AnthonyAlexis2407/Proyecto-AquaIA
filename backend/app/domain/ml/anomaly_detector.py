"""
AquaIA — Anomaly Detector (Isolation Forest)
Detecta anomalías en el caudal hídrico en tiempo real (RF-04).
"""
import random
import numpy as np

try:
    from sklearn.ensemble import IsolationForest
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False

class AnomalyDetector:
    def __init__(self):
        if ML_AVAILABLE:
            self.model = IsolationForest(contamination=0.05, random_state=42)
        else:
            self.model = None
        self.is_trained = False
        
    def _generate_normal_data(self, records=1000):
        data = []
        base_flow = 40.0
        for _ in range(records):
            flow = base_flow + random.uniform(-5.0, 5.0)
            data.append([flow])
        return np.array(data)
        
    def train_model(self):
        if not ML_AVAILABLE:
            self.is_trained = True
            print("[AquaIA Detector] Modo Simulado activo: Isolation Forest omitido.")
            return

        try:
            X_train = self._generate_normal_data(records=200)
            self.model.fit(X_train)
            self.is_trained = True
            print("[AquaIA Detector] AnomalyDetector (Isolation Forest) entrenado.")
        except Exception as e:
            print(f"[AquaIA Detector] Error entrenando: {e}")
            self.is_trained = True
        
    def detect(self, current_flow: float) -> bool:
        """Retorna True si el caudal actual es anómalo."""
        if not self.is_trained:
            self.train_model()
            
        if not ML_AVAILABLE:
            return bool(abs(current_flow - 40.0) > 12)

        try:
            prediction = self.model.predict([[current_flow]])
            return bool(prediction[0] == -1)
        except:
            return False

    def get_score(self, current_flow: float) -> float:
        """Retorna un score de anomalía (0 a 1)."""
        if not ML_AVAILABLE:
            return min(1.0, abs(current_flow - 40.0) / 20.0)
        
        try:
            # Isolation Forest decision_function retorna valores negativos para anomalías
            # Transformamos a un rango 0-1 aproximado
            score = self.model.decision_function([[current_flow]])[0]
            return round(max(0.0, min(1.0, -score * 2 + 0.5)), 3)
        except:
            return 0.0

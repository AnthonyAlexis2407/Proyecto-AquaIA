"""
AquaIA — IoT Sensor Simulator
Simula el envío de datos de sensores a la API en tiempo real.
Este script permite ver el dashboard vivo y las alertas automáticas.
"""
import time
import requests
import random
import sys

API_URL = "http://127.0.0.1:8000/api/v1/monitoring/readings"

def run_simulator():
    print("🚀 Iniciando Simulador IoT AquaIA...")
    # Obtenemos lista de sensores primero
    try:
        sensors_res = requests.get("http://127.0.0.1:8000/api/v1/sensors")
        sensors = sensors_res.json()
        print(f"📡 {len(sensors)} sensores detectados.")
    except Exception as e:
        print(f"❌ Error conectando al backend: {e}")
        return

    while True:
        for sensor in sensors:
            # Generar valor basado en tipo y umbrales
            base = (sensor['threshold_min'] + sensor['threshold_max']) / 2
            
            # 5% de probabilidad de generar una anomalía (fuera de umbrales)
            if random.random() < 0.05:
                # Anomalía por exceso o defecto
                value = sensor['threshold_max'] + random.uniform(5, 15) if random.random() > 0.5 else sensor['threshold_min'] - random.uniform(5, 10)
                print(f"⚠️ SIMULANDO ANOMALÍA: Sensor {sensor['sensor_code']} -> {value:.2f}")
            else:
                # Valor normal con algo de ruido
                value = base + random.uniform(-2, 2)
            
            payload = {
                "sensor_code": sensor['sensor_code'],
                "value": round(value, 2),
                "timestamp": None # El backend asignará el actual
            }
            
            try:
                requests.post(API_URL, json=payload, timeout=2)
            except:
                pass # Backend offline temporalmente
            
        print(f"✅ Ciclo completado. Esperando 10 segundos...")
        time.sleep(10)

if __name__ == "__main__":
    run_simulator()

"""
AquaIA v3.0 — Main Application Entry Point
Punto de entrada delgado que importa routers y configura la aplicación.
Arquitectura Hexagonal: este archivo es un adaptador de infraestructura.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import APP_NAME, APP_VERSION, APP_DESCRIPTION, ALLOWED_ORIGINS

# Router imports
from app.adapters.api.routers import users, zones, sensors, alerts, monitoring, predictions, optimization, reports
from app.adapters.api.middleware import AuditMiddleware

app = FastAPI(
    title=APP_NAME,
    description=APP_DESCRIPTION,
    version=APP_VERSION
)

# Audit Middleware
app.add_middleware(AuditMiddleware)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción usar ALLOWED_ORIGINS
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(users.router)
app.include_router(zones.router)
app.include_router(sensors.router)
app.include_router(alerts.router)
app.include_router(monitoring.router)
app.include_router(predictions.router)
app.include_router(optimization.router)
app.include_router(reports.router)


@app.on_event("startup")
async def startup_event():
    """Inicializa base de datos, datos semilla y modelos de IA."""
    print("=" * 60)
    print("  🌊 Iniciando AquaIA v3.0 — Arquitectura Hexagonal")
    print("=" * 60)

    # 1. Inicializar base de datos
    from app.adapters.persistence.database import init_database, seed_initial_data
    try:
        init_database()
        seed_initial_data()
    except Exception as e:
        print(f"[AquaIA DB] Error inicializando BD: {e}")

    # 2. Pre-cargar modelos de IA (opcional, se cargan lazy)
    try:
        from app.domain.ml.predictor import WaterFlowPredictor
        from app.domain.ml.anomaly_detector import AnomalyDetector
        predictor = WaterFlowPredictor()
        detector = AnomalyDetector()
        predictor.train_model()
        detector.train_model()
        print("[AquaIA ML] Modelos base cargados (RandomForest + IsolationForest).")
    except Exception as e:
        print(f"[AquaIA ML] Error cargando modelos: {e}")

    print("=" * 60)
    print("  ✅ AquaIA v3.0 operativo.")
    print("  📡 Endpoints: /docs (Swagger) | /redoc")
    print("  🔑 Login: admin@aquaia.pe / admin123")
    print("=" * 60)


@app.get("/", tags=["Estado Base"])
def read_root():
    return {"message": "✅ AquaIA API v3.0 is running.", "version": APP_VERSION}


@app.get("/health", tags=["Estado Base"])
def check_health():
    from app.adapters.persistence.repositories import SQLiteSensorRepository, SQLiteZoneRepository
    sensors = SQLiteSensorRepository().get_all()
    zones = SQLiteZoneRepository().get_all()
    return {
        "status": "ok",
        "service": f"AquaIA Backend v{APP_VERSION}",
        "database": "SQLite (connected)",
        "sensors_registered": len(sensors),
        "zones_registered": len(zones),
    }

"""
AquaIA — Application Configuration
Centraliza todas las variables de configuración y constantes del sistema.
"""
import os
from datetime import timedelta

# --- Database ---
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./aquaia.db")

# --- JWT Authentication ---
SECRET_KEY = os.getenv("SECRET_KEY", "aquaia-secret-key-change-in-production-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("TOKEN_EXPIRE_MINUTES", "480"))  # 8 horas

# --- CORS ---
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")

# --- System Constants ---
APP_NAME = "AquaIA Backend API"
APP_VERSION = "3.0.0"
APP_DESCRIPTION = "Plataforma Inteligente de Monitoreo Hídrico — Distrito de Palián, Huancayo"

# --- IoT Configuration ---
DEFAULT_READING_INTERVAL_SECONDS = 60  # 1 minuto por defecto
MIN_READING_INTERVAL_SECONDS = 60      # 1 minuto mínimo
MAX_READING_INTERVAL_SECONDS = 3600    # 60 minutos máximo

# --- Alert Severities ---
SEVERITY_HIGH = "HIGH"
SEVERITY_MEDIUM = "MEDIUM"
SEVERITY_LOW = "LOW"

# --- User Roles ---
ROLE_OPERATOR = "Operador"
ROLE_ANALYST = "Analista"
ROLE_ADMIN = "Administrador"
VALID_ROLES = [ROLE_OPERATOR, ROLE_ANALYST, ROLE_ADMIN]

# --- Zones Configuration (Palián, Huancayo) ---
PALIAN_CENTER_LAT = -12.0735
PALIAN_CENTER_LNG = -75.2280

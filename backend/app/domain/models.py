"""
AquaIA — Domain Models (Entidades Puras)
Modelos de dominio sin dependencias de frameworks externos.
Representan las entidades centrales del sistema hídrico.
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum


class Severity(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class AlertStatus(str, Enum):
    ACTIVE = "ACTIVE"
    RESOLVED = "RESOLVED"
    ACKNOWLEDGED = "ACKNOWLEDGED"


class AlertSource(str, Enum):
    ISOLATION_FOREST = "ISOLATION_FOREST"
    SENSOR = "SENSOR"
    MANUAL = "MANUAL"
    PREDICTION = "PREDICTION"


class SensorStatus(str, Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    WARNING = "warning"


class UserRole(str, Enum):
    OPERATOR = "Operador"
    ANALYST = "Analista"
    ADMIN = "Administrador"


@dataclass
class Zone:
    """Zona geográfica de monitoreo hídrico en Palián."""
    id: Optional[int] = None
    name: str = ""
    description: str = ""
    latitude: float = 0.0
    longitude: float = 0.0
    radius_m: int = 500  # Radio de cobertura en metros
    is_active: bool = True
    priority: int = 1  # 1=Alta, 2=Media, 3=Baja
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


@dataclass
class Sensor:
    """Sensor IoT desplegado en el sistema hídrico."""
    id: Optional[int] = None
    sensor_code: str = ""       # Ej: IOT-SN-01
    model: str = ""             # Ej: AquaSense v4
    sensor_type: str = "flow"   # flow, pressure, quality, level
    zone_id: Optional[int] = None
    latitude: float = 0.0
    longitude: float = 0.0
    status: SensorStatus = SensorStatus.ONLINE
    battery_level: float = 100.0
    threshold_min: float = 0.0
    threshold_max: float = 100.0
    reading_interval_sec: int = 60
    last_reading_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


@dataclass
class SensorReading:
    """Lectura individual de un sensor IoT."""
    id: Optional[int] = None
    sensor_id: int = 0
    zone_id: Optional[int] = None
    value: float = 0.0
    unit: str = "m3/h"
    is_anomaly: bool = False
    anomaly_score: float = 0.0
    timestamp: Optional[datetime] = None


@dataclass
class Alert:
    """Alerta generada por el sistema de monitoreo."""
    id: Optional[int] = None
    alert_code: str = ""
    zone_id: Optional[int] = None
    sensor_id: Optional[int] = None
    location: str = ""
    severity: Severity = Severity.LOW
    status: AlertStatus = AlertStatus.ACTIVE
    source: AlertSource = AlertSource.SENSOR
    description: str = ""
    detected_value: Optional[float] = None
    threshold_value: Optional[float] = None
    # Resolución
    resolved_by: Optional[int] = None
    resolution_note: Optional[str] = None
    resolved_at: Optional[datetime] = None
    # Timestamps
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


@dataclass
class User:
    """Usuario del sistema AquaIA."""
    id: Optional[int] = None
    email: str = ""
    full_name: str = ""
    hashed_password: str = ""
    role: UserRole = UserRole.OPERATOR
    is_active: bool = True
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None


@dataclass
class AuditLog:
    """Registro de auditoría de acciones del sistema."""
    id: Optional[int] = None
    user_id: Optional[int] = None
    user_email: str = ""
    action: str = ""           # CREATE, UPDATE, DELETE, LOGIN, RESOLVE_ALERT, etc.
    resource: str = ""         # zones, sensors, alerts, users, etc.
    resource_id: Optional[str] = None
    details: str = ""
    ip_address: str = ""
    timestamp: Optional[datetime] = None


@dataclass
class PredictionResult:
    """Resultado de predicción de demanda hídrica."""
    zone_id: int = 0
    zone_name: str = ""
    horizon_hours: int = 24
    demand_min: float = 0.0
    demand_expected: float = 0.0
    demand_max: float = 0.0
    confidence: float = 0.0
    model_used: str = ""
    generated_at: Optional[datetime] = None
    forecast_points: List[Dict[str, Any]] = field(default_factory=list)


@dataclass
class OptimizationResult:
    """Resultado de optimización de rutas VRP."""
    route_points: List[List[float]] = field(default_factory=list)
    distance_km: float = 0.0
    estimated_time_mins: int = 0
    optimization_score: float = 0.0
    total_volume_m3: float = 0.0
    zones_covered: int = 0
    status: str = ""
    routes: List[Dict[str, Any]] = field(default_factory=list)

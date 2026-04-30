"""
AquaIA — Domain Ports (Interfaces / Abstract Base Classes)
Define los contratos que los adaptadores deben implementar.
Esto es el corazón del patrón hexagonal: el dominio solo depende de estas interfaces.
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from datetime import datetime
from app.domain.models import Zone, Sensor, SensorReading, Alert, User, AuditLog


# =============================================
# REPOSITORY PORTS (Outbound — Persistencia)
# =============================================

class ZoneRepository(ABC):
    @abstractmethod
    def create(self, zone: Zone) -> Zone: ...
    @abstractmethod
    def get_by_id(self, zone_id: int) -> Optional[Zone]: ...
    @abstractmethod
    def get_all(self, active_only: bool = True) -> List[Zone]: ...
    @abstractmethod
    def update(self, zone: Zone) -> Zone: ...
    @abstractmethod
    def delete(self, zone_id: int) -> bool: ...


class SensorRepository(ABC):
    @abstractmethod
    def create(self, sensor: Sensor) -> Sensor: ...
    @abstractmethod
    def get_by_id(self, sensor_id: int) -> Optional[Sensor]: ...
    @abstractmethod
    def get_by_code(self, sensor_code: str) -> Optional[Sensor]: ...
    @abstractmethod
    def get_all(self, zone_id: Optional[int] = None) -> List[Sensor]: ...
    @abstractmethod
    def update(self, sensor: Sensor) -> Sensor: ...
    @abstractmethod
    def delete(self, sensor_id: int) -> bool: ...


class SensorReadingRepository(ABC):
    @abstractmethod
    def create(self, reading: SensorReading) -> SensorReading: ...
    @abstractmethod
    def get_latest_by_sensor(self, sensor_id: int) -> Optional[SensorReading]: ...
    @abstractmethod
    def get_by_zone(self, zone_id: int, since: Optional[datetime] = None) -> List[SensorReading]: ...
    @abstractmethod
    def get_by_sensor(self, sensor_id: int, since: Optional[datetime] = None, limit: int = 100) -> List[SensorReading]: ...
    @abstractmethod
    def get_anomalies(self, zone_id: Optional[int] = None, sensor_id: Optional[int] = None, since: Optional[datetime] = None) -> List[SensorReading]: ...


class AlertRepository(ABC):
    @abstractmethod
    def create(self, alert: Alert) -> Alert: ...
    @abstractmethod
    def get_by_id(self, alert_id: int) -> Optional[Alert]: ...
    @abstractmethod
    def get_active(self, zone_id: Optional[int] = None, severity: Optional[str] = None) -> List[Alert]: ...
    @abstractmethod
    def get_history(self, zone_id: Optional[int] = None, limit: int = 50) -> List[Alert]: ...
    @abstractmethod
    def resolve(self, alert_id: int, user_id: int, note: str) -> Optional[Alert]: ...
    @abstractmethod
    def count_by_severity(self) -> dict: ...


class UserRepository(ABC):
    @abstractmethod
    def create(self, user: User) -> User: ...
    @abstractmethod
    def get_by_id(self, user_id: int) -> Optional[User]: ...
    @abstractmethod
    def get_by_email(self, email: str) -> Optional[User]: ...
    @abstractmethod
    def get_all(self) -> List[User]: ...
    @abstractmethod
    def update(self, user: User) -> User: ...
    @abstractmethod
    def delete(self, user_id: int) -> bool: ...


class AuditLogRepository(ABC):
    @abstractmethod
    def create(self, log: AuditLog) -> AuditLog: ...
    @abstractmethod
    def get_recent(self, limit: int = 100) -> List[AuditLog]: ...
    @abstractmethod
    def get_by_user(self, user_id: int, limit: int = 50) -> List[AuditLog]: ...


# =============================================
# SERVICE PORTS (Outbound — Servicios externos)
# =============================================

class AnomalyDetectorPort(ABC):
    """Puerto para el servicio de detección de anomalías."""
    @abstractmethod
    def detect(self, value: float) -> bool: ...
    @abstractmethod
    def get_score(self, value: float) -> float: ...


class DemandPredictorPort(ABC):
    """Puerto para el servicio de predicción de demanda."""
    @abstractmethod
    def predict(self, zone_id: int, horizon_hours: int) -> dict: ...


class RouteOptimizerPort(ABC):
    """Puerto para el servicio de optimización de rutas."""
    @abstractmethod
    def optimize(self, locations: list, demands: list) -> dict: ...

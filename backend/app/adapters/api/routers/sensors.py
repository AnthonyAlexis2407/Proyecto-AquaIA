"""
AquaIA — Sensors Router
CRUD de sensores IoT con umbrales configurables (HU-03).
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.adapters.api.auth import get_current_user, require_role, TokenData
from app.adapters.persistence.repositories import SQLiteSensorRepository, SQLiteAuditLogRepository
from app.domain.models import Sensor, SensorStatus, AuditLog

router = APIRouter(prefix="/api/v1/sensors", tags=["Gestión de Sensores IoT"])

sensor_repo = SQLiteSensorRepository()
audit_repo = SQLiteAuditLogRepository()


class SensorRequest(BaseModel):
    sensor_code: str
    model: str = "AquaSense v4"
    sensor_type: str = "flow"
    zone_id: Optional[int] = None
    latitude: float = 0.0
    longitude: float = 0.0
    threshold_min: float = 0.0
    threshold_max: float = 100.0
    reading_interval_sec: int = 60


class SensorUpdateRequest(BaseModel):
    sensor_code: Optional[str] = None
    model: Optional[str] = None
    sensor_type: Optional[str] = None
    zone_id: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: Optional[str] = None
    battery_level: Optional[float] = None
    threshold_min: Optional[float] = None
    threshold_max: Optional[float] = None
    reading_interval_sec: Optional[int] = None


class SensorResponse(BaseModel):
    id: int
    sensor_code: str
    model: str
    sensor_type: str
    zone_id: Optional[int]
    zone_name: Optional[str] = None
    latitude: float
    longitude: float
    status: str
    battery_level: float
    threshold_min: float
    threshold_max: float
    reading_interval_sec: int
    last_reading_at: Optional[str] = None
    created_at: Optional[str] = None


@router.get("", response_model=List[SensorResponse])
def list_sensors(zone_id: Optional[int] = None):
    """Listar todos los sensores, opcionalmente filtrados por zona."""
    from app.adapters.persistence.repositories import SQLiteZoneRepository
    zone_repo = SQLiteZoneRepository()

    sensors = sensor_repo.get_all(zone_id=zone_id)
    result = []
    for s in sensors:
        resp = _sensor_to_response(s)
        if s.zone_id:
            zone = zone_repo.get_by_id(s.zone_id)
            resp.zone_name = zone.name if zone else None
        result.append(resp)
    return result


@router.get("/{sensor_id}", response_model=SensorResponse)
def get_sensor(sensor_id: int):
    """Obtener detalle de un sensor."""
    sensor = sensor_repo.get_by_id(sensor_id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor no encontrado")
    return _sensor_to_response(sensor)


@router.post("", response_model=SensorResponse, status_code=201)
def create_sensor(request: SensorRequest, current_user: TokenData = Depends(require_role("Administrador"))):
    """Registrar nuevo sensor IoT (solo Administrador) (HU-03)."""
    existing = sensor_repo.get_by_code(request.sensor_code)
    if existing:
        raise HTTPException(status_code=400, detail=f"Ya existe un sensor con código '{request.sensor_code}'")

    sensor = Sensor(
        sensor_code=request.sensor_code, model=request.model, sensor_type=request.sensor_type,
        zone_id=request.zone_id, latitude=request.latitude, longitude=request.longitude,
        threshold_min=request.threshold_min, threshold_max=request.threshold_max,
        reading_interval_sec=request.reading_interval_sec
    )
    sensor = sensor_repo.create(sensor)

    audit_repo.create(AuditLog(
        user_id=current_user.user_id, user_email=current_user.email,
        action="CREATE", resource="sensors", resource_id=str(sensor.id),
        details=f"Sensor '{sensor.sensor_code}' desplegado en zona {sensor.zone_id}"
    ))

    return _sensor_to_response(sensor)


@router.put("/{sensor_id}", response_model=SensorResponse)
def update_sensor(sensor_id: int, request: SensorUpdateRequest, current_user: TokenData = Depends(require_role("Administrador", "Operador"))):
    """Actualizar sensor IoT (Admin u Operador)."""
    sensor = sensor_repo.get_by_id(sensor_id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor no encontrado")

    if request.sensor_code is not None:
        sensor.sensor_code = request.sensor_code
    if request.model is not None:
        sensor.model = request.model
    if request.sensor_type is not None:
        sensor.sensor_type = request.sensor_type
    if request.zone_id is not None:
        sensor.zone_id = request.zone_id
    if request.latitude is not None:
        sensor.latitude = request.latitude
    if request.longitude is not None:
        sensor.longitude = request.longitude
    if request.status is not None:
        sensor.status = SensorStatus(request.status)
    if request.battery_level is not None:
        sensor.battery_level = request.battery_level
    if request.threshold_min is not None:
        sensor.threshold_min = request.threshold_min
    if request.threshold_max is not None:
        sensor.threshold_max = request.threshold_max
    if request.reading_interval_sec is not None:
        sensor.reading_interval_sec = request.reading_interval_sec

    sensor = sensor_repo.update(sensor)

    audit_repo.create(AuditLog(
        user_id=current_user.user_id, user_email=current_user.email,
        action="UPDATE", resource="sensors", resource_id=str(sensor.id),
        details=f"Sensor '{sensor.sensor_code}' actualizado"
    ))

    return _sensor_to_response(sensor)


@router.delete("/{sensor_id}")
def delete_sensor(sensor_id: int, current_user: TokenData = Depends(require_role("Administrador"))):
    """Eliminar sensor (solo Administrador)."""
    sensor = sensor_repo.get_by_id(sensor_id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor no encontrado")

    sensor_repo.delete(sensor_id)

    audit_repo.create(AuditLog(
        user_id=current_user.user_id, user_email=current_user.email,
        action="DELETE", resource="sensors", resource_id=str(sensor_id),
        details=f"Sensor '{sensor.sensor_code}' eliminado"
    ))

    return {"message": f"Sensor '{sensor.sensor_code}' eliminado correctamente"}


def _sensor_to_response(sensor: Sensor) -> SensorResponse:
    return SensorResponse(
        id=sensor.id, sensor_code=sensor.sensor_code, model=sensor.model,
        sensor_type=sensor.sensor_type, zone_id=sensor.zone_id,
        latitude=sensor.latitude, longitude=sensor.longitude,
        status=sensor.status.value if isinstance(sensor.status, SensorStatus) else sensor.status,
        battery_level=sensor.battery_level, threshold_min=sensor.threshold_min,
        threshold_max=sensor.threshold_max, reading_interval_sec=sensor.reading_interval_sec,
        last_reading_at=sensor.last_reading_at.isoformat() if sensor.last_reading_at else None,
        created_at=sensor.created_at.isoformat() if sensor.created_at else None,
    )

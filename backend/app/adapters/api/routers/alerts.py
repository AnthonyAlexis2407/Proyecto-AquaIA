"""
AquaIA — Alerts Router
Gestión de alertas con persistencia y resolución con notas (HU-02, HU-09, HU-10).
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.adapters.api.auth import get_current_user, TokenData
from app.adapters.persistence.repositories import SQLiteAlertRepository, SQLiteAuditLogRepository, SQLiteZoneRepository
from app.domain.models import Alert, Severity, AlertStatus, AlertSource, AuditLog
import random
from datetime import datetime

router = APIRouter(prefix="/api/v1/alerts", tags=["Gestión de Alertas"])
alert_repo = SQLiteAlertRepository()
audit_repo = SQLiteAuditLogRepository()
zone_repo = SQLiteZoneRepository()

class AlertResponse(BaseModel):
    id: int
    alert_code: str
    zone_id: Optional[int] = None
    zone_name: Optional[str] = None
    sensor_id: Optional[int] = None
    location: str
    severity: str
    status: str
    source: str
    description: str
    detected_value: Optional[float] = None
    threshold_value: Optional[float] = None
    resolved_by: Optional[int] = None
    resolution_note: Optional[str] = None
    resolved_at: Optional[str] = None
    created_at: Optional[str] = None

class ResolveRequest(BaseModel):
    note: str

class CreateAlertRequest(BaseModel):
    zone_id: Optional[int] = None
    sensor_id: Optional[int] = None
    location: str
    severity: str = "MEDIUM"
    source: str = "MANUAL"
    description: str
    detected_value: Optional[float] = None
    threshold_value: Optional[float] = None

class AlertCountResponse(BaseModel):
    total: int
    high: int
    medium: int
    low: int

@router.get("", response_model=List[AlertResponse])
def get_active_alerts(zone_id: Optional[int] = None, severity: Optional[str] = None):
    alerts = alert_repo.get_active(zone_id=zone_id, severity=severity)
    return [_alert_to_response(a) for a in alerts]

@router.get("/count", response_model=AlertCountResponse)
def get_alert_counts():
    counts = alert_repo.count_by_severity()
    return AlertCountResponse(total=sum(counts.values()), high=counts.get("HIGH", 0), medium=counts.get("MEDIUM", 0), low=counts.get("LOW", 0))

@router.get("/history", response_model=List[AlertResponse])
def get_alert_history(zone_id: Optional[int] = None, limit: int = 50):
    alerts = alert_repo.get_history(zone_id=zone_id, limit=limit)
    return [_alert_to_response(a) for a in alerts]

@router.get("/{alert_id}", response_model=AlertResponse)
def get_alert(alert_id: int):
    alert = alert_repo.get_by_id(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    return _alert_to_response(alert)

@router.post("", response_model=AlertResponse, status_code=201)
def create_alert(request: CreateAlertRequest, current_user: TokenData = Depends(get_current_user)):
    alert_code = f"ALRT-{random.randint(100, 999)}-{datetime.now().strftime('%H%M')}"
    alert = Alert(
        alert_code=alert_code, zone_id=request.zone_id, sensor_id=request.sensor_id,
        location=request.location,
        severity=Severity(request.severity) if request.severity in [s.value for s in Severity] else Severity.MEDIUM,
        source=AlertSource(request.source) if request.source in [s.value for s in AlertSource] else AlertSource.MANUAL,
        description=request.description, detected_value=request.detected_value, threshold_value=request.threshold_value
    )
    alert = alert_repo.create(alert)
    audit_repo.create(AuditLog(user_id=current_user.user_id, user_email=current_user.email, action="CREATE", resource="alerts", resource_id=str(alert.id), details=f"Alerta {alert.alert_code} creada"))
    return _alert_to_response(alert)

@router.post("/{alert_id}/resolve", response_model=AlertResponse)
def resolve_alert(alert_id: int, request: ResolveRequest, current_user: TokenData = Depends(get_current_user)):
    """Resolver alerta con nota obligatoria (HU-10)."""
    if not request.note or len(request.note.strip()) < 5:
        raise HTTPException(status_code=400, detail="Nota obligatoria de al menos 5 caracteres")
    alert = alert_repo.get_by_id(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    if alert.status == AlertStatus.RESOLVED:
        raise HTTPException(status_code=400, detail="Alerta ya resuelta")
    resolved = alert_repo.resolve(alert_id, current_user.user_id, request.note.strip())
    audit_repo.create(AuditLog(user_id=current_user.user_id, user_email=current_user.email, action="RESOLVE_ALERT", resource="alerts", resource_id=str(alert_id), details=f"Nota: {request.note.strip()[:100]}"))
    return _alert_to_response(resolved)

def _alert_to_response(alert: Alert) -> AlertResponse:
    zone_name = None
    if alert.zone_id:
        zone = zone_repo.get_by_id(alert.zone_id)
        zone_name = zone.name if zone else None
    return AlertResponse(
        id=alert.id, alert_code=alert.alert_code, zone_id=alert.zone_id, zone_name=zone_name,
        sensor_id=alert.sensor_id, location=alert.location,
        severity=alert.severity.value if isinstance(alert.severity, Severity) else alert.severity,
        status=alert.status.value if isinstance(alert.status, AlertStatus) else alert.status,
        source=alert.source.value if isinstance(alert.source, AlertSource) else alert.source,
        description=alert.description, detected_value=alert.detected_value, threshold_value=alert.threshold_value,
        resolved_by=alert.resolved_by, resolution_note=alert.resolution_note,
        resolved_at=alert.resolved_at.isoformat() if alert.resolved_at else None,
        created_at=alert.created_at.isoformat() if alert.created_at else None,
    )

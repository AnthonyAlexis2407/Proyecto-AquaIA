"""
AquaIA — Zones Router
CRUD de zonas geográficas para el sistema de monitoreo (HU-14).
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.adapters.api.auth import get_current_user, require_role, TokenData
from app.adapters.persistence.repositories import SQLiteZoneRepository, SQLiteAuditLogRepository
from app.domain.models import Zone, AuditLog

router = APIRouter(prefix="/api/v1/zones", tags=["Gestión de Zonas"])

zone_repo = SQLiteZoneRepository()
audit_repo = SQLiteAuditLogRepository()


class ZoneRequest(BaseModel):
    name: str
    description: str = ""
    latitude: float
    longitude: float
    radius_m: int = 500
    is_active: bool = True
    priority: int = 1


class ZoneResponse(BaseModel):
    id: int
    name: str
    description: str
    latitude: float
    longitude: float
    radius_m: int
    is_active: bool
    priority: int
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


@router.get("", response_model=List[ZoneResponse])
def list_zones(active_only: bool = True):
    """Listar todas las zonas geográficas."""
    zones = zone_repo.get_all(active_only=active_only)
    return [_zone_to_response(z) for z in zones]


@router.get("/{zone_id}", response_model=ZoneResponse)
def get_zone(zone_id: int):
    """Obtener detalle de una zona."""
    zone = zone_repo.get_by_id(zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Zona no encontrada")
    return _zone_to_response(zone)


@router.post("", response_model=ZoneResponse, status_code=201)
def create_zone(request: ZoneRequest, current_user: TokenData = Depends(require_role("Administrador"))):
    """Crear nueva zona (solo Administrador)."""
    zone = Zone(
        name=request.name, description=request.description,
        latitude=request.latitude, longitude=request.longitude,
        radius_m=request.radius_m, is_active=request.is_active, priority=request.priority
    )
    zone = zone_repo.create(zone)

    audit_repo.create(AuditLog(
        user_id=current_user.user_id, user_email=current_user.email,
        action="CREATE", resource="zones", resource_id=str(zone.id),
        details=f"Zona '{zone.name}' creada en ({zone.latitude}, {zone.longitude})"
    ))

    return _zone_to_response(zone)


@router.put("/{zone_id}", response_model=ZoneResponse)
def update_zone(zone_id: int, request: ZoneRequest, current_user: TokenData = Depends(require_role("Administrador"))):
    """Actualizar zona (solo Administrador)."""
    zone = zone_repo.get_by_id(zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Zona no encontrada")

    zone.name = request.name
    zone.description = request.description
    zone.latitude = request.latitude
    zone.longitude = request.longitude
    zone.radius_m = request.radius_m
    zone.is_active = request.is_active
    zone.priority = request.priority
    zone = zone_repo.update(zone)

    audit_repo.create(AuditLog(
        user_id=current_user.user_id, user_email=current_user.email,
        action="UPDATE", resource="zones", resource_id=str(zone.id),
        details=f"Zona '{zone.name}' actualizada"
    ))

    return _zone_to_response(zone)


@router.delete("/{zone_id}")
def delete_zone(zone_id: int, current_user: TokenData = Depends(require_role("Administrador"))):
    """Eliminar zona (solo Administrador)."""
    zone = zone_repo.get_by_id(zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Zona no encontrada")

    zone_repo.delete(zone_id)

    audit_repo.create(AuditLog(
        user_id=current_user.user_id, user_email=current_user.email,
        action="DELETE", resource="zones", resource_id=str(zone_id),
        details=f"Zona '{zone.name}' eliminada"
    ))

    return {"message": f"Zona '{zone.name}' eliminada correctamente"}


def _zone_to_response(zone: Zone) -> ZoneResponse:
    return ZoneResponse(
        id=zone.id, name=zone.name, description=zone.description,
        latitude=zone.latitude, longitude=zone.longitude,
        radius_m=zone.radius_m, is_active=zone.is_active, priority=zone.priority,
        created_at=zone.created_at.isoformat() if zone.created_at else None,
        updated_at=zone.updated_at.isoformat() if zone.updated_at else None,
    )

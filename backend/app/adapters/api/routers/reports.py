"""
AquaIA — Reports Router
Endpoints para descargar reportes técnicos y operativos.
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from app.adapters.api.auth import get_current_user, require_role, TokenData
from app.adapters.persistence.repositories import SQLiteSensorRepository, SQLiteZoneRepository, SQLiteSensorReadingRepository
from app.adapters.services.report_service import ReportService
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/v1/reports", tags=["Reportes"])
sensor_repo = SQLiteSensorRepository()
zone_repo = SQLiteZoneRepository()
reading_repo = SQLiteSensorReadingRepository()
report_service = ReportService()

@router.get("/sensors/pdf")
def download_sensors_pdf(current_user: TokenData = Depends(get_current_user)):
    """Descargar resumen de sensores en PDF (Solo Admin y Analista)."""
    if current_user.role not in ["Administrador", "Analista"]:
        raise HTTPException(status_code=403, detail="No tiene permisos para generar reportes PDF")
        
    sensors = sensor_repo.get_all()
    zones = zone_repo.get_all()
    
    pdf_buffer = report_service.generate_sensor_summary_pdf(sensors, zones)
    
    filename = f"reporte_sensores_{datetime.now().strftime('%Y%m%d_%H%M')}.pdf"
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/readings/excel")
def download_readings_excel(days: int = 7, current_user: TokenData = Depends(get_current_user)):
    """Descargar historial de lecturas en Excel."""
    readings = reading_repo.get_recent(limit=5000) # En producción filtraríamos por 'days'
    
    excel_buffer = report_service.generate_readings_excel(readings)
    
    filename = f"historial_lecturas_{datetime.now().strftime('%Y%m%d_%H%M')}.xlsx"
    return StreamingResponse(
        excel_buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/audit/csv")
def download_audit_csv(current_user: TokenData = Depends(require_role("Administrador"))):
    """Descargar logs de auditoría en CSV (Solo Admin)."""
    from app.adapters.persistence.repositories import SQLiteAuditLogRepository
    import io
    import csv
    
    audit_repo = SQLiteAuditLogRepository()
    logs = audit_repo.get_all(limit=1000)
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Usuario", "Acción", "Recurso", "Detalles", "IP", "Fecha"])
    
    for log in logs:
        writer.writerow([log.id, log.user_email, log.action, log.resource, log.details, log.ip_address, log.created_at])
        
    output.seek(0)
    filename = f"auditoria_{datetime.now().strftime('%Y%m%d_%H%M')}.csv"
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

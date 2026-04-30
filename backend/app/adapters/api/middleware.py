"""
AquaIA — Audit Middleware
Registra automáticamente las acciones de los usuarios autenticados para cumplir con RNF-06.
"""
import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.adapters.api.auth import decode_access_token
from app.adapters.persistence.repositories import SQLiteAuditLogRepository
from app.domain.models import AuditLog

class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Procesar la petición
        response = await call_next(request)
        
        # Solo auditar métodos que modifican datos (o logins) y endpoints de la API
        if request.method in ["POST", "PUT", "DELETE", "PATCH"] and "/api/v1/" in request.url.path:
            duration = time.time() - start_time
            
            # Intentar obtener el usuario del token
            auth_header = request.headers.get("Authorization")
            user_id = None
            user_email = "Anónimo"
            
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
                token_data = decode_access_token(token)
                if token_data:
                    user_id = token_data.user_id
                    user_email = token_data.email
            
            # Determinar el recurso
            path_parts = request.url.path.split("/")
            resource = path_parts[3] if len(path_parts) > 3 else "unknown"
            resource_id = path_parts[4] if len(path_parts) > 4 else None
            
            # Crear el log de auditoría
            audit_repo = SQLiteAuditLogRepository()
            try:
                audit_repo.create(AuditLog(
                    user_id=user_id,
                    user_email=user_email,
                    action=request.method,
                    resource=resource,
                    resource_id=resource_id,
                    details=f"Petición {request.method} a {request.url.path} completada en {duration:.3f}s con status {response.status_code}",
                    ip_address=request.client.host if request.client else "unknown"
                ))
            except Exception as e:
                print(f"[AuditMiddleware] Error guardando log: {e}")
                
        return response

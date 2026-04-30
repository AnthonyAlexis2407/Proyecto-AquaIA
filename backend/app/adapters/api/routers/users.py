"""
AquaIA — Users Router
Gestión de usuarios con autenticación JWT y roles (HU-12).
"""
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, status, Request
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from app.adapters.api.auth import (
    LoginRequest, RegisterRequest, TokenResponse,
    hash_password, verify_password, create_access_token,
    get_current_user, require_role, TokenData
)
from app.adapters.persistence.repositories import SQLiteUserRepository, SQLiteAuditLogRepository
from app.domain.models import User, UserRole, AuditLog
from app.config import VALID_ROLES

router = APIRouter(prefix="/api/v1/auth", tags=["Autenticación y Usuarios"])

user_repo = SQLiteUserRepository()
audit_repo = SQLiteAuditLogRepository()


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: Optional[str] = None
    last_login: Optional[str] = None


class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest):
    """Autenticar usuario y obtener token JWT."""
    user = user_repo.get_by_email(request.email)
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cuenta deshabilitada")

    # Actualizar last_login
    user.last_login = datetime.now()
    user_repo.update(user)

    # Generar token
    token = create_access_token({
        "user_id": user.id,
        "email": user.email,
        "role": user.role.value if isinstance(user.role, UserRole) else user.role,
        "full_name": user.full_name
    })

    # Audit log
    audit_repo.create(AuditLog(
        user_id=user.id, user_email=user.email,
        action="LOGIN", resource="auth", details="Inicio de sesión exitoso"
    ))

    return TokenResponse(
        access_token=token,
        user={
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value if isinstance(user.role, UserRole) else user.role
        }
    )


@router.post("/register", response_model=UserResponse)
def register(request: RegisterRequest, current_user: TokenData = Depends(require_role("Administrador"))):
    """Registrar nuevo usuario (solo Administrador)."""
    if request.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail=f"Rol inválido. Opciones: {VALID_ROLES}")

    existing = user_repo.get_by_email(request.email)
    if existing:
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    user = User(
        email=request.email,
        full_name=request.full_name,
        hashed_password=hash_password(request.password),
        role=UserRole(request.role)
    )
    user = user_repo.create(user)

    audit_repo.create(AuditLog(
        user_id=current_user.user_id, user_email=current_user.email,
        action="CREATE", resource="users", resource_id=str(user.id),
        details=f"Usuario {request.email} creado con rol {request.role}"
    ))

    return _user_to_response(user)


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: TokenData = Depends(get_current_user)):
    """Obtener información del usuario autenticado."""
    user = user_repo.get_by_id(current_user.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return _user_to_response(user)


@router.get("/users", response_model=List[UserResponse])
def list_users(current_user: TokenData = Depends(require_role("Administrador"))):
    """Listar todos los usuarios (solo Administrador)."""
    users = user_repo.get_all()
    return [_user_to_response(u) for u in users]


@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(user_id: int, request: UserUpdateRequest, current_user: TokenData = Depends(require_role("Administrador"))):
    """Actualizar usuario (solo Administrador)."""
    user = user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if request.full_name is not None:
        user.full_name = request.full_name
    if request.role is not None:
        if request.role not in VALID_ROLES:
            raise HTTPException(status_code=400, detail=f"Rol inválido. Opciones: {VALID_ROLES}")
        user.role = UserRole(request.role)
    if request.is_active is not None:
        user.is_active = request.is_active

    user = user_repo.update(user)
    return _user_to_response(user)


def _user_to_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role.value if isinstance(user.role, UserRole) else user.role,
        is_active=user.is_active,
        created_at=user.created_at.isoformat() if user.created_at else None,
        last_login=user.last_login.isoformat() if user.last_login else None,
    )

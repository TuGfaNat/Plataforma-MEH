import re
from pydantic import BaseModel, EmailStr, HttpUrl, ConfigDict, field_validator
from typing import Optional, List
from datetime import datetime

def validate_password_strength(v: str) -> str:
    """Valida que la contraseña tenga al menos 8 caracteres, contenga letras y números."""
    if not v or len(v) < 8:
        raise ValueError("La contraseña debe tener al menos 8 caracteres")
    if not re.search(r"[A-Za-z]", v) or not re.search(r"[0-9]", v):
        raise ValueError("La contraseña debe incluir letras y números")
    return v

class UserBase(BaseModel):
    nombres: str
    apellidos: str
    correo: EmailStr
    rol: str = "MIEMBRO"
    alias: Optional[str] = None
    foto_url: Optional[str] = None
    preferencia_tema: Optional[str] = "dark"
    bio: Optional[str] = None
    
    # Nuevos campos académicos/profesionales
    institucion: Optional[str] = None
    estudia_en: Optional[str] = None # Mantenido por compatibilidad
    tipo_entidad: Optional[str] = "Estudiante" # Estudiante / Profesional
    
    # Ubicación (Métricas)
    pais: Optional[str] = "Bolivia"
    departamento: Optional[str] = None
    
    # Redes sociales extendidas
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    facebook_url: Optional[str] = None
    instagram_url: Optional[str] = None
    tiktok_url: Optional[str] = None
    learning_path_url: Optional[str] = None
    
    perfil_publico: Optional[bool] = True

class UserCreate(UserBase):
    password: str

    @field_validator("password")
    @classmethod
    def validar_password(cls, v: str) -> str:
        return validate_password_strength(v)

class UserUpdate(BaseModel):
    nombres: Optional[str] = None
    apellidos: Optional[str] = None
    alias: Optional[str] = None
    foto_url: Optional[str] = None
    preferencia_tema: Optional[str] = None
    bio: Optional[str] = None
    
    institucion: Optional[str] = None
    estudia_en: Optional[str] = None
    tipo_entidad: Optional[str] = None
    pais: Optional[str] = None
    departamento: Optional[str] = None
    
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    facebook_url: Optional[str] = None
    instagram_url: Optional[str] = None
    tiktok_url: Optional[str] = None
    learning_path_url: Optional[str] = None
    
    perfil_publico: Optional[bool] = None
    rol: Optional[str] = None
    activo: Optional[bool] = None
    modificado_por: Optional[int] = None
    id_estado: Optional[int] = None

class UserLogin(BaseModel):
    correo: EmailStr
    password: str

class UserResponse(UserBase):
    id_usuario: int
    fecha_registro: datetime
    activo: bool
    es_nuevo: Optional[bool] = False
    email_verificado: bool = False
    motivo_suspension: Optional[str] = None
    id_estado: Optional[int] = 2
    badge_count: Optional[int] = 0
    souvenir_count: Optional[int] = 0
    total_invertido: Optional[float] = 0.0
    creado_por: Optional[int] = None
    fecha_creacion: Optional[datetime] = None
    modificado_por: Optional[int] = None
    fecha_modificacion: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

from .badge import BadgeResponse

class UserBadgeDetail(BaseModel):
    id_usuario_badge: int
    fecha_obtencion: datetime
    badge: BadgeResponse
    model_config = ConfigDict(from_attributes=True)

class UserProfileResponse(UserResponse):
    badges: Optional[list[UserBadgeDetail]] = []

class Token(BaseModel):
    access_token: str
    token_type: str
    es_nuevo: bool = False

class ForgotPasswordRequest(BaseModel):
    correo: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    nuevo_password: str

    @field_validator("nuevo_password")
    @classmethod
    def validar_nuevo_password(cls, v: str) -> str:
        return validate_password_strength(v)

class CambiarPasswordRequest(BaseModel):
    password_actual: str
    nuevo_password: str

    @field_validator("nuevo_password")
    @classmethod
    def validar_nuevo_password(cls, v: str) -> str:
        return validate_password_strength(v)

class TokenData(BaseModel):
    correo: Optional[str] = None
    rol: Optional[str] = None
    id_usuario: Optional[int] = None

class VerificarEmailRequest(BaseModel):
    correo: EmailStr
    codigo: str

class ReenviarCodigoRequest(BaseModel):
    correo: EmailStr

class SuspenderUsuarioRequest(BaseModel):
    motivo: str

class AdminResetPasswordRequest(BaseModel):
    nueva_password: str

class AdminUserUpdate(BaseModel):
    nombres: Optional[str] = None
    apellidos: Optional[str] = None
    correo: Optional[EmailStr] = None
    alias: Optional[str] = None
    rol: Optional[str] = None
    institucion: Optional[str] = None
    estudia_en: Optional[str] = None
    tipo_entidad: Optional[str] = None
    pais: Optional[str] = None
    departamento: Optional[str] = None
    bio: Optional[str] = None
    email_verificado: Optional[bool] = None


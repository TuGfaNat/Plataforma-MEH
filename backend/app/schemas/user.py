from pydantic import BaseModel, EmailStr, HttpUrl
from typing import Optional
from datetime import datetime

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

class UserLogin(BaseModel):
    correo: EmailStr
    password: str

class UserResponse(UserBase):
    id_usuario: int
    fecha_registro: datetime
    activo: bool
    creado_por: Optional[int] = None
    fecha_creacion: Optional[datetime] = None
    modificado_por: Optional[int] = None
    fecha_modificacion: Optional[datetime] = None

    class Config:
        from_attributes = True

from .badge import BadgeResponse

class UserBadgeDetail(BaseModel):
    id_usuario_badge: int
    fecha_obtencion: datetime
    badge: BadgeResponse

    class Config:
        from_attributes = True

class UserProfileResponse(UserResponse):
    badges: Optional[list[UserBadgeDetail]] = []

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    correo: Optional[str] = None
    rol: Optional[str] = None
    id_usuario: Optional[int] = None

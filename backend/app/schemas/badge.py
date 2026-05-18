from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BadgeBase(BaseModel):
    nombre_badge: str
    descripcion: Optional[str] = None
    imagen_url: str
    id_evento_origen: Optional[int] = None
    id_curso_origen: Optional[int] = None
    puntos: int = 10
    requisito_nivel: str = "Beginner"

class BadgeCreate(BadgeBase):
    pass

class BadgeUpdate(BaseModel):
    nombre_badge: Optional[str] = None
    descripcion: Optional[str] = None
    imagen_url: Optional[str] = None
    puntos: Optional[int] = None
    requisito_nivel: Optional[str] = None
    activo: Optional[bool] = None

class BadgeResponse(BadgeBase):
    id_badge: int

    class Config:
        from_attributes = True

class UsuarioBadgeResponse(BaseModel):
    id_usuario_badge: int
    id_usuario: int
    id_badge: int
    fecha_obtencion: datetime

    class Config:
        from_attributes = True

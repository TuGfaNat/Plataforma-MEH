from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BadgeBase(BaseModel):
    nombre_badge: str
    descripcion: Optional[str] = None
    imagen_url: str
    id_evento_origen: Optional[int] = None
    id_curso_origen: Optional[int] = None

class BadgeCreate(BadgeBase):
    pass

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

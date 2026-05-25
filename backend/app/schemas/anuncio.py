from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime

class AnuncioBase(BaseModel):
    titulo: str
    contenido: str
    url_imagen: Optional[str] = None
    link_accion: Optional[str] = None
    tipo: str = "INFO" # INFO, EVENTO, ALERTA
    activo: bool = True

class AnuncioCreate(AnuncioBase):
    enviar_email: bool = False

class AnuncioUpdate(BaseModel):
    titulo: Optional[str] = None
    contenido: Optional[str] = None
    url_imagen: Optional[str] = None
    link_accion: Optional[str] = None
    activo: Optional[bool] = None
    id_estado: Optional[int] = None

class AnuncioResponse(AnuncioBase):
    id_anuncio: int
    fecha_publicacion: datetime
    id_autor: Optional[int] = None

    class Config:
        from_attributes = True

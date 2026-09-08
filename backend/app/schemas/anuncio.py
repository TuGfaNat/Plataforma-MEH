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
    exclusivo_embajadores: bool = False
    roles_destino: Optional[str] = "TODOS" # TODOS o lista ej. "MIEMBRO,EMBAJADOR"
    categoria: Optional[str] = "GENERAL"   # GENERAL, EVENTO, ACADEMIA, COMUNIDAD, OPORTUNIDAD, URGENTE
    id_evento: Optional[int] = None
    solo_inscritos_evento: bool = False

class AnuncioCreate(AnuncioBase):
    enviar_email: bool = False

class AnuncioUpdate(BaseModel):
    titulo: Optional[str] = None
    contenido: Optional[str] = None
    url_imagen: Optional[str] = None
    link_accion: Optional[str] = None
    tipo: Optional[str] = None
    activo: Optional[bool] = None
    id_estado: Optional[int] = None
    exclusivo_embajadores: Optional[bool] = None
    roles_destino: Optional[str] = None
    categoria: Optional[str] = None
    id_evento: Optional[int] = None
    solo_inscritos_evento: Optional[bool] = None

class AnuncioResponse(AnuncioBase):
    id_anuncio: int
    fecha_publicacion: datetime
    id_autor: Optional[int] = None
    evento_titulo: Optional[str] = None

    class Config:
        from_attributes = True

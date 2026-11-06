from pydantic import BaseModel, HttpUrl, field_validator
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
    fecha_publicacion: Optional[datetime] = None
    enviar_email: Optional[bool] = False

    @field_validator("fecha_publicacion", mode="before")
    @classmethod
    def sanitize_fecha_publicacion(cls, v):
        if v == "" or v is None:
            return None
        return v

    @field_validator("url_imagen", "link_accion", mode="before")
    @classmethod
    def sanitize_optional_strings(cls, v):
        if v == "" or (isinstance(v, str) and not v.strip()):
            return None
        return v

    @field_validator("id_evento", mode="before")
    @classmethod
    def sanitize_id_evento(cls, v):
        if v == "" or v is None:
            return None
        try:
            return int(v)
        except (ValueError, TypeError):
            return None

class AnuncioCreate(AnuncioBase):
    enviar_email: bool = False
    dry_run: bool = False

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
    fecha_publicacion: Optional[datetime] = None
    enviar_email: Optional[bool] = None

    @field_validator("fecha_publicacion", mode="before")
    @classmethod
    def sanitize_update_fecha_publicacion(cls, v):
        if v == "" or v is None:
            return None
        return v

    @field_validator("url_imagen", "link_accion", mode="before")
    @classmethod
    def sanitize_update_optional_strings(cls, v):
        if v == "" or (isinstance(v, str) and not v.strip()):
            return None
        return v

    @field_validator("id_evento", mode="before")
    @classmethod
    def sanitize_update_id_evento(cls, v):
        if v == "" or v is None:
            return None
        try:
            return int(v)
        except (ValueError, TypeError):
            return None

class AnuncioResponse(AnuncioBase):
    id_anuncio: int
    fecha_publicacion: datetime
    id_autor: Optional[int] = None
    notificar_email: bool = False
    email_enviado: bool = False
    fecha_envio_email: Optional[datetime] = None
    evento_titulo: Optional[str] = None
    evento_imagen_url: Optional[str] = None
    evento_imagen_16x9: Optional[str] = None
    evento_fecha: Optional[str] = None

    class Config:
        from_attributes = True

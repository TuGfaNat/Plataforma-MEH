from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class RecursoBase(BaseModel):
    titulo: str
    descripcion: str
    motivo: Optional[str] = None
    autor_nombre: Optional[str] = None
    url_descarga: Optional[str] = None
    tipo_archivo: Optional[str] = None
    tipo_recurso: str = "ARCHIVO" # ARCHIVO, VIDEO, BLOG, LINK
    contenido_md: Optional[str] = None
    categoria: str = "GENERAL" # VIP, SPEAKER, GENERAL
    id_curso: Optional[int] = None
    id_evento: Optional[int] = None

class RecursoCreate(RecursoBase):
    pass

class RecursoUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    motivo: Optional[str] = None
    autor_nombre: Optional[str] = None
    url_descarga: Optional[str] = None
    tipo_archivo: Optional[str] = None
    tipo_recurso: Optional[str] = None
    contenido_md: Optional[str] = None
    categoria: Optional[str] = None
    id_curso: Optional[int] = None
    id_evento: Optional[int] = None

class RecursoResponse(RecursoBase):
    id_recurso: int
    fecha_creacion: datetime
    creado_por: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)

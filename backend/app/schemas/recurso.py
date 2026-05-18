from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class RecursoBase(BaseModel):
    titulo: str
    descripcion: str
    url_descarga: Optional[str] = None
    tipo_archivo: Optional[str] = None
    tipo_recurso: str = "ARCHIVO" # ARCHIVO, VIDEO, BLOG, LINK
    contenido_md: Optional[str] = None
    categoria: str # VIP, SPEAKER, GENERAL
    id_curso: Optional[int] = None

class RecursoCreate(RecursoBase):
    pass

class RecursoResponse(RecursoBase):
    id_recurso: int
    fecha_creacion: datetime
    creado_por: int

    class Config:
        from_attributes = True

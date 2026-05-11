from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class RecursoBase(BaseModel):
    titulo: str
    descripcion: str
    url_descarga: str
    tipo_archivo: str
    categoria: str # VIP, SPEAKER, GENERAL

class RecursoCreate(RecursoBase):
    pass

class RecursoResponse(RecursoBase):
    id_recurso: int
    fecha_creacion: datetime
    creado_por: int

    class Config:
        from_attributes = True

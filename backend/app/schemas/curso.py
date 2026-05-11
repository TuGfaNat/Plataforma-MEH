from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CursoBase(BaseModel):
    nombre_curso: str
    descripcion: str
    horas_academicas: int
    imagen_url: Optional[str] = None
    plantilla_certificado_url: Optional[str] = None

class CursoCreate(CursoBase):
    pass

class CursoResponse(CursoBase):
    id_curso: int
    estado: str
    id_instructor: Optional[int] = None
    # AUDITORIA
    creado_por: Optional[int] = None
    fecha_creacion: Optional[datetime] = None
    modificado_por: Optional[int] = None
    fecha_modificacion: Optional[datetime] = None

    class Config:
        from_attributes = True

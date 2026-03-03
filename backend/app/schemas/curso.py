from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CursoBase(BaseModel):
    nombre_curso: str
    descripcion: Optional[str] = None
    horas_academicas: int
    id_instructor: Optional[int] = None
    estado: str = "ACTIVO"

class CursoCreate(CursoBase):
    pass

class CursoUpdate(BaseModel):
    nombre_curso: Optional[str] = None
    descripcion: Optional[str] = None
    horas_academicas: Optional[int] = None
    id_instructor: Optional[int] = None
    estado: Optional[str] = None
    modificado_por: Optional[int] = None

class CursoResponse(CursoBase):
    id_curso: int
    modificado_por: Optional[int] = None
    fecha_modificacion: Optional[datetime] = None

    class Config:
        from_attributes = True

class InscripcionCursoBase(BaseModel):
    id_curso: int

class InscripcionCursoCreate(InscripcionCursoBase):
    id_usuario: int

class InscripcionCursoResponse(InscripcionCursoBase):
    id_inscripcion: int
    id_usuario: int
    progreso_porcentaje: int
    finalizado: bool
    id_pago: Optional[int] = None
    estado_inscripcion: str

    class Config:
        from_attributes = True

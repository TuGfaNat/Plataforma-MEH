from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class EventoBase(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    fecha_inicio: datetime
    modalidad: str # PRESENCIAL, VIRTUAL
    token_qr: Optional[str] = None
    capacidad_max: int
    estado: str = "PROGRAMADO"

class EventoCreate(EventoBase):
    pass

class EventoUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    fecha_inicio: Optional[datetime] = None
    modalidad: Optional[str] = None
    token_qr: Optional[str] = None
    capacidad_max: Optional[int] = None
    estado: Optional[str] = None
    modificado_por: Optional[int] = None

class EventoResponse(EventoBase):
    id_evento: int
    creado_por: Optional[int] = None
    fecha_creacion: datetime
    modificado_por: Optional[int] = None
    fecha_modificacion: Optional[datetime] = None

    class Config:
        from_attributes = True

class InscripcionEventoBase(BaseModel):
    id_evento: int

class InscripcionEventoCreate(InscripcionEventoBase):
    id_usuario: int

class InscripcionEventoResponse(InscripcionEventoBase):
    id_inscripcion: int
    id_usuario: int
    fecha_inscripcion: datetime
    asistio: bool
    fecha_validacion: Optional[datetime] = None
    id_pago: Optional[int] = None
    estado_inscripcion: str

    class Config:
        from_attributes = True

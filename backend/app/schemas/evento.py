from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class EventoBase(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    fecha_inicio: datetime
    fecha_fin: Optional[datetime] = None
    modalidad: str
    ubicacion: Optional[str] = None
    capacidad_max: int
    imagen_url: Optional[str] = None
    plantilla_certificado_url: Optional[str] = None

class EventoCreate(EventoBase):
    pass

class EventoUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    fecha_inicio: Optional[datetime] = None
    estado: Optional[str] = None
    capacidad_max: Optional[int] = None
    imagen_url: Optional[str] = None
    plantilla_certificado_url: Optional[str] = None

class EventoResponse(EventoBase):
    id_evento: int
    estado: str
    token_qr: Optional[str] = None
    id_organizador: Optional[int] = None
    # AUDITORIA
    creado_por: Optional[int] = None
    fecha_creacion: Optional[datetime] = None
    modificado_por: Optional[int] = None
    fecha_modificacion: Optional[datetime] = None

    class Config:
        from_attributes = True

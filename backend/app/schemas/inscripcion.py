from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class InscripcionEventoBase(BaseModel):
    id_evento: int
    estado_inscripcion: str = "PENDIENTE"


class InscripcionEventoCreate(InscripcionEventoBase):
    pass


class InscripcionEventoResponse(BaseModel):
    id_inscripcion: int
    id_usuario: int
    id_evento: int
    fecha_inscripcion: datetime
    estado_inscripcion: str
    codigo_qr: Optional[str] = None
    asistio: bool = False
    fecha_validacion: Optional[datetime] = None
    id_pago: Optional[int] = None
    # AUDITORIA
    creado_por: Optional[int] = None
    fecha_creacion: Optional[datetime] = None
    modificado_por: Optional[int] = None
    fecha_modificacion: Optional[datetime] = None

    class Config:
        from_attributes = True


class InscripcionCursoBase(BaseModel):
    id_curso: int
    estado_inscripcion: str = "PENDIENTE"


class InscripcionCursoCreate(InscripcionCursoBase):
    pass


class InscripcionCursoResponse(BaseModel):
    id_inscripcion: int
    id_usuario: int
    id_curso: int
    fecha_inscripcion: datetime
    estado_inscripcion: str
    certificado_emitido: bool = False
    fecha_certificado: Optional[datetime] = None
    # AUDITORIA
    creado_por: Optional[int] = None
    fecha_creacion: Optional[datetime] = None
    modificado_por: Optional[int] = None
    fecha_modificacion: Optional[datetime] = None

    class Config:
        from_attributes = True

from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CheckpointBase(BaseModel):
    id_evento: int
    nombre_checkpoint: str
    hora_apertura: Optional[datetime] = None
    hora_cierre: Optional[datetime] = None
    tipo_checkpoint: str # ACCESO, COMIDA, AVANCE_CURSO, ENTREGA_KIT

class CheckpointCreate(CheckpointBase):
    pass

class CheckpointResponse(CheckpointBase):
    id_checkpoint: int

    class Config:
        from_attributes = True

class AsistenciaDetalleCreate(BaseModel):
    id_usuario: int
    id_checkpoint: int

class AsistenciaDetalleResponse(BaseModel):
    id_asistencia_det: int
    id_usuario: int
    id_checkpoint: int
    fecha_escaneo: datetime

    class Config:
        from_attributes = True

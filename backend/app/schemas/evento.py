from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List

# --- RELACIONES SIMPLES ---
class SpeakerSimple(BaseModel):
    id_speaker: int
    nombre: str
    foto_url: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class AuspiciadorSimple(BaseModel):
    id_auspiciador: int
    nombre: str
    logo_url: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class ComunidadSimple(BaseModel):
    id_comunidad: int
    nombre: str
    logo_url: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

# --- ENTIDAD EVENTO ---
class EventoBase(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    tipo_evento: str = "CONFERENCIA"
    fecha_inicio: datetime
    fecha_fin: Optional[datetime] = None
    hora_inicio: Optional[str] = None
    hora_fin: Optional[str] = None
    modalidad: str = "PRESENCIAL"
    ubicacion: Optional[str] = None
    link_mapas: Optional[str] = None
    agenda: Optional[str] = None # JSON string
    capacidad_max: int = 50
    imagen_url: Optional[str] = None
    refrigerio_incluido: bool = False

class EventoCreate(EventoBase):
    id_speakers: Optional[List[int]] = []
    id_auspiciadores: Optional[List[int]] = []
    id_comunidades: Optional[List[int]] = []

class EventoUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    tipo_evento: Optional[str] = None
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    hora_inicio: Optional[str] = None
    hora_fin: Optional[str] = None
    modalidad: Optional[str] = None
    ubicacion: Optional[str] = None
    link_mapas: Optional[str] = None
    agenda: Optional[str] = None
    estado: Optional[str] = None
    capacidad_max: Optional[int] = None
    imagen_url: Optional[str] = None
    refrigerio_incluido: Optional[bool] = None
    id_speakers: Optional[List[int]] = None
    id_auspiciadores: Optional[List[int]] = None
    id_comunidades: Optional[List[int]] = None

class EventoResponse(EventoBase):
    id_evento: int
    estado: str
    token_qr: Optional[str] = None
    id_organizador: Optional[int] = None
    
    speakers: List[SpeakerSimple] = []
    auspiciadores: List[AuspiciadorSimple] = []
    comunidades: List[ComunidadSimple] = []

    model_config = ConfigDict(from_attributes=True)

# --- CHECKPOINTS ---
class CheckpointBase(BaseModel):
    nombre_checkpoint: str
    tipo_checkpoint: Optional[str] = "ASISTENCIA"
    orden: int = 1

class CheckpointCreate(CheckpointBase):
    pass

class CheckpointResponse(CheckpointBase):
    id_checkpoint: int
    id_evento: int
    activo: bool
    model_config = ConfigDict(from_attributes=True)

class QRScanRequest(BaseModel):
    codigo_qr: str
    id_checkpoint: Optional[int] = None

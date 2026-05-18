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
    fecha_inicio: datetime
    fecha_fin: Optional[datetime] = None
    hora_inicio: Optional[str] = None
    hora_fin: Optional[str] = None
    modalidad: str
    ubicacion: Optional[str] = None
    capacidad_max: int
    imagen_url: Optional[str] = None

class EventoCreate(EventoBase):
    id_speakers: Optional[List[int]] = []
    id_auspiciadores: Optional[List[int]] = []
    id_comunidades: Optional[List[int]] = []

class EventoUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    hora_inicio: Optional[str] = None
    hora_fin: Optional[str] = None
    estado: Optional[str] = None
    capacidad_max: Optional[int] = None
    imagen_url: Optional[str] = None
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

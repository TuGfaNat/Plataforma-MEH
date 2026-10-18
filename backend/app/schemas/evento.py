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
    capacidad_maxima: Optional[int] = None
    imagen_url: Optional[str] = None
    plantilla_badge_url: Optional[str] = None
    refrigerio_incluido: bool = False
    incluidos: Optional[str] = None
    motivo_cancelacion: Optional[str] = None

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
    motivo_cancelacion: Optional[str] = None
    capacidad_max: Optional[int] = None
    capacidad_maxima: Optional[int] = None
    imagen_url: Optional[str] = None
    plantilla_badge_url: Optional[str] = None
    refrigerio_incluido: Optional[bool] = None
    incluidos: Optional[str] = None
    id_speakers: Optional[List[int]] = None
    id_auspiciadores: Optional[List[int]] = None
    id_comunidades: Optional[List[int]] = None
    id_estado: Optional[int] = None
    auto_aprobar_espera: Optional[bool] = False

class EventoResponse(EventoBase):
    id_evento: int
    estado: str
    token_qr: Optional[str] = None
    id_organizador: Optional[int] = None
    cupos_disponibles: Optional[int] = None
    cupos_ocupados: Optional[int] = None
    total_en_espera: Optional[int] = None
    capacidad_maxima: Optional[int] = None
    
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

class InscriptoConfirmadoResponse(BaseModel):
    id_inscripcion: int
    id_usuario: int
    codigo_qr: str
    asistio: bool
    nombre_completo: str
    correo: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class AcreditarParticipanteRequest(BaseModel):
    id_inscripcion: Optional[int] = None
    codigo_qr: Optional[str] = None

class AcreditacionResponse(BaseModel):
    status: str
    message: str
    id_inscripcion: int
    presente: bool
    asistio: bool
    fecha_acreditacion: Optional[str] = None
    checkpoint: Optional[str] = None

class EventoCancelarRequest(BaseModel):
    motivo: str

class EventoAvisarRequest(BaseModel):
    titulo: str
    mensaje: str
    enviar_email: Optional[bool] = False

class LoteAprobacionRequest(BaseModel):
    cantidad: Optional[int] = None

class LoteAprobacionResponse(BaseModel):
    status: str
    id_evento: int
    aprobados: int
    restantes_en_espera: int
    cupos_disponibles: int

# --- LLEGADAS POR HORA Y CHECKPOINTS (MEH-019) ---
class LlegadaHoraItem(BaseModel):
    hora: str
    cantidad: int
    acumulado: int
    model_config = ConfigDict(from_attributes=True)

class CheckpointLlegadaItem(BaseModel):
    id_checkpoint: Optional[int] = None
    nombre_checkpoint: str
    total: int
    porcentaje: float
    model_config = ConfigDict(from_attributes=True)

class EventoLlegadasResponse(BaseModel):
    id_evento: int
    titulo: str
    total_inscritos: int
    total_asistieron: int
    porcentaje_asistencia: float
    histograma_horas: List[LlegadaHoraItem]
    checkpoints: List[CheckpointLlegadaItem]
    model_config = ConfigDict(from_attributes=True)

# --- BADGE SOCIAL DE INSCRIPCIÓN (MEH-019) ---
class BadgeSocialResponse(BaseModel):
    id_evento: int
    titulo_evento: str
    fecha_evento: Optional[str] = None
    modalidad: Optional[str] = None
    ubicacion: Optional[str] = None
    plantilla_badge_url: Optional[str] = None
    id_usuario: int
    nombre_completo: str
    foto_perfil_url: Optional[str] = None
    rol_evento: str = "ASISTENTE"
    codigo_qr: Optional[str] = None
    redes_sociales: Optional[dict] = None
    copy_sugerido: str
    esta_inscrito: bool = True
    model_config = ConfigDict(from_attributes=True)




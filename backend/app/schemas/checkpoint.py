from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class CheckpointBase(BaseModel):
    nombre_checkpoint: str
    id_evento: Optional[int] = None
    hora_apertura: Optional[datetime] = None
    hora_cierre: Optional[datetime] = None
    tipo_checkpoint: Optional[str] = "ASISTENCIA" # ACCESO, COMIDA, AVANCE_CURSO, ENTREGA_KIT, ASISTENCIA
    orden: Optional[int] = 1

class CheckpointCreate(CheckpointBase):
    pass

class CheckpointResponse(CheckpointBase):
    id_checkpoint: int
    id_evento: int
    activo: bool = True
    puede_escanear: Optional[bool] = True
    model_config = ConfigDict(from_attributes=True)

class CheckpointPermisoBase(BaseModel):
    id_checkpoint: int
    id_usuario: int
    puede_escanear: bool = True

class CheckpointPermisoCreate(BaseModel):
    id_usuario: int
    puede_escanear: Optional[bool] = True

class CheckpointPermisoUsuarioInfo(BaseModel):
    id_usuario: int
    nombres: str
    apellidos: str
    correo: str
    rol: str
    model_config = ConfigDict(from_attributes=True)

class CheckpointPermisoResponse(BaseModel):
    id_permiso: int
    id_checkpoint: int
    id_usuario: int
    puede_escanear: bool
    fecha_asignacion: Optional[datetime] = None
    usuario: Optional[CheckpointPermisoUsuarioInfo] = None
    model_config = ConfigDict(from_attributes=True)

class AsistenciaDetalleCreate(BaseModel):
    id_usuario: int
    id_checkpoint: int

class AsistenciaDetalleResponse(BaseModel):
    id_asistencia_det: Optional[int] = None
    id_asistencia: Optional[int] = None
    id_usuario: Optional[int] = None
    id_inscripcion: Optional[int] = None
    id_checkpoint: int
    fecha_escaneo: datetime
    model_config = ConfigDict(from_attributes=True)

# --- UNDO ASISTENCIA (MEH-018) ---
class AsistenciaDeshacerRequest(BaseModel):
    id_asistencia: Optional[int] = None
    id_inscripcion: Optional[int] = None
    id_checkpoint: Optional[int] = None
    codigo_qr: Optional[str] = None
    motivo: Optional[str] = "Escaneo accidental deshecho"

class AsistenciaDeshacerResponse(BaseModel):
    status: str
    message: str
    id_asistencia: Optional[int] = None
    id_inscripcion: Optional[int] = None
    id_checkpoint: Optional[int] = None
    asistio_general: bool
    model_config = ConfigDict(from_attributes=True)

# --- HISTORIAL ASISTENCIA PAGINADO (MEH-018) ---
class AsistenciaHistorialUsuario(BaseModel):
    id_usuario: int
    nombre_completo: str
    correo: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class AsistenciaHistorialCheckpoint(BaseModel):
    id_checkpoint: Optional[int] = None
    nombre_checkpoint: str
    tipo_checkpoint: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class AsistenciaHistorialOperador(BaseModel):
    id_usuario: Optional[int] = None
    nombre_completo: Optional[str] = None
    correo: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class AsistenciaHistorialItem(BaseModel):
    id_asistencia: int
    id_inscripcion: int
    id_evento: int
    fecha_escaneo: datetime
    segundos_transcurridos: int
    puede_deshacer: bool
    usuario: AsistenciaHistorialUsuario
    checkpoint: Optional[AsistenciaHistorialCheckpoint] = None
    operador: Optional[AsistenciaHistorialOperador] = None
    model_config = ConfigDict(from_attributes=True)

class AsistenciaHistorialPaginadoResponse(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
    items: List[AsistenciaHistorialItem]
    model_config = ConfigDict(from_attributes=True)

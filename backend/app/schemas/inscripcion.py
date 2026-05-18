from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

# --- EVENTOS ---
class InscripcionEventoBase(BaseModel):
    id_evento: int
    estado_inscripcion: str = "PENDIENTE"

class InscripcionEventoCreate(InscripcionEventoBase):
    pass

class InscripcionEventoResponse(InscripcionEventoBase):
    id_inscripcion: int
    id_usuario: int
    fecha_inscripcion: datetime
    codigo_qr: Optional[str] = None
    asistio: bool
    id_pago: Optional[int] = None
    
    model_config = ConfigDict(from_attributes=True)

# --- CURSOS ---
class InscripcionCursoBase(BaseModel):
    id_curso: int
    estado_inscripcion: str = "PENDIENTE"

class InscripcionCursoCreate(InscripcionCursoBase):
    pass

class InscripcionCursoResponse(InscripcionCursoBase):
    id_inscripcion_curso: int
    id_usuario: int
    fecha_inscripcion: datetime
    progreso: int
    nota_final: Optional[float] = None
    finalizado: bool
    id_pago: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

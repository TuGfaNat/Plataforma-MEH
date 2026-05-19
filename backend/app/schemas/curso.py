from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class LeccionBase(BaseModel):
    titulo: str
    contenido_video_url: Optional[str] = None
    contenido_texto: Optional[str] = None
    orden: int = 1

class LeccionCreate(LeccionBase):
    id_curso: int

class LeccionResponse(LeccionBase):
    id_leccion: int
    id_curso: int
    model_config = ConfigDict(from_attributes=True)

class TareaBase(BaseModel):
    titulo: str
    instrucciones: str
    puntos_max: int = 100
    fecha_entrega_limite: Optional[datetime] = None
    archivo_adjunto_url: Optional[str] = None

class TareaCreate(TareaBase):
    id_leccion: int

class TareaResponse(TareaBase):
    id_tarea: int
    id_leccion: int
    model_config = ConfigDict(from_attributes=True)

class EntregaTareaBase(BaseModel):
    archivo_url: str
    comentario_alumno: Optional[str] = None

class EntregaTareaCreate(EntregaTareaBase):
    id_tarea: int

class EntregaTareaCalificar(BaseModel):
    nota: int
    comentario_docente: Optional[str] = None

class EntregaTareaResponse(EntregaTareaBase):
    id_entrega: int
    id_tarea: int
    id_usuario: int
    nota: Optional[int] = None
    comentario_docente: Optional[str] = None
    fecha_envio: datetime
    model_config = ConfigDict(from_attributes=True)

class PostForoBase(BaseModel):
    mensaje: str
    es_pregunta_docente: bool = False

class PostForoCreate(PostForoBase):
    id_curso: int

class PostForoResponse(PostForoBase):
    id_post: int
    id_curso: int
    id_usuario: int
    fecha_creacion: datetime
    model_config = ConfigDict(from_attributes=True)

class CursoBase(BaseModel):
    nombre_curso: str
    descripcion: str
    horas_academicas: int
    imagen_url: Optional[str] = None
    estado: str = "ACTIVO"

class CursoCreate(CursoBase):
    pass

class CursoResponse(CursoBase):
    id_curso: int
    id_instructor: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)

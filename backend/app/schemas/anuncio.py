from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AnuncioBase(BaseModel):
    titulo: str
    contenido: str
    tipo: str = "INFO"
    activo: bool = True

class AnuncioCreate(AnuncioBase):
    pass

class AnuncioResponse(AnuncioBase):
    id_anuncio: int
    fecha_publicacion: datetime
    id_autor: int

    class Config:
        from_attributes = True

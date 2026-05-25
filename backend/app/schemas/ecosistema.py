from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

# --- SPEAKERS ---
class SpeakerBase(BaseModel):
    nombre: str
    bio: Optional[str] = None
    trayectoria: Optional[str] = None
    foto_url: Optional[str] = None
    trabajo_actual: Optional[str] = None
    linkedin_url: Optional[str] = None
    twitter_url: Optional[str] = None
    facebook_url: Optional[str] = None
    instagram_url: Optional[str] = None
    correo_contacto: Optional[str] = None
    whatsapp_contacto: Optional[str] = None

class SpeakerCreate(SpeakerBase):
    pass

class SpeakerUpdate(BaseModel):
    nombre: Optional[str] = None
    bio: Optional[str] = None
    trayectoria: Optional[str] = None
    foto_url: Optional[str] = None
    trabajo_actual: Optional[str] = None
    linkedin_url: Optional[str] = None
    twitter_url: Optional[str] = None
    facebook_url: Optional[str] = None
    instagram_url: Optional[str] = None
    correo_contacto: Optional[str] = None
    whatsapp_contacto: Optional[str] = None
    id_estado: Optional[int] = None

class SpeakerResponse(SpeakerBase):
    id_speaker: int
    model_config = ConfigDict(from_attributes=True)

# --- AUSPICIADORES ---
class AuspiciadorBase(BaseModel):
    nombre: str
    logo_url: Optional[str] = None
    sitio_web: Optional[str] = None
    tipo: str = "GENERAL" # GOLD, SILVER, BRONZE, GENERAL
    correo_contacto: Optional[str] = None
    whatsapp_contacto: Optional[str] = None

class AuspiciadorCreate(AuspiciadorBase):
    pass

class AuspiciadorUpdate(BaseModel):
    nombre: Optional[str] = None
    logo_url: Optional[str] = None
    sitio_web: Optional[str] = None
    tipo: Optional[str] = None
    correo_contacto: Optional[str] = None
    whatsapp_contacto: Optional[str] = None
    id_estado: Optional[int] = None

class AuspiciadorResponse(AuspiciadorBase):
    id_auspiciador: int
    model_config = ConfigDict(from_attributes=True)

# --- COMUNIDADES ---
class ComunidadBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    logo_url: Optional[str] = None
    link_contacto: Optional[str] = None
    correo_contacto: Optional[str] = None
    whatsapp_contacto: Optional[str] = None

class ComunidadCreate(ComunidadBase):
    pass

class ComunidadUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    logo_url: Optional[str] = None
    link_contacto: Optional[str] = None
    correo_contacto: Optional[str] = None
    whatsapp_contacto: Optional[str] = None
    id_estado: Optional[int] = None

class ComunidadResponse(ComunidadBase):
    id_comunidad: int
    model_config = ConfigDict(from_attributes=True)

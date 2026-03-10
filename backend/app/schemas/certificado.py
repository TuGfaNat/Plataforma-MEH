from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class CertificadoBase(BaseModel):
    id_usuario: int
    codigo_verificacion: str
    url_pdf: str
    formato: str # DIGITAL, FISICO, AMBOS
    es_ruta_linkedin: bool = False

class CertificadoCreate(CertificadoBase):
    id_curso: Optional[int] = None
    id_evento: Optional[int] = None

class CertificadoResponse(CertificadoBase):
    id_certificado: int
    fecha_emision: datetime
    uuid_verificacion: str

    class Config:
        from_attributes = True

class CertificadoPublicResponse(BaseModel):
    codigo_verificacion: str
    nombre_usuario: str
    nombre_curso_evento: str
    fecha_emision: datetime
    formato: str
    es_valido: bool = True

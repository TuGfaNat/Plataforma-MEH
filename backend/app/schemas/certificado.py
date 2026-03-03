from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class CertificadoBase(BaseModel):
    id_usuario: int
    codigo_verificacion: str
    url_pdf: str
    formato: str # DIGITAL, FISICO, AMBOS
    entregado_fisico: bool = False

class CertificadoCreate(CertificadoBase):
    pass

class CertificadoResponse(CertificadoBase):
    id_certificado: int
    fecha_emision: date

    class Config:
        from_attributes = True

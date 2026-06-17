from pydantic import BaseModel, ConfigDict
from decimal import Decimal
from typing import Optional

class EventoPagoQRBase(BaseModel):
    nombre_paquete: str
    monto: Decimal

class EventoPagoQRCreate(EventoPagoQRBase):
    pass

class EventoPagoQRResponse(EventoPagoQRBase):
    id_qr: int
    id_evento: int
    url_qr: str
    id_estado: int

    model_config = ConfigDict(from_attributes=True)

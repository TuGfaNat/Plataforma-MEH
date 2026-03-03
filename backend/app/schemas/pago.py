from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal

class PagoBase(BaseModel):
    id_referencia: int
    tipo_referencia: str # EVENTO, CURSO
    monto: Decimal
    metodo_pago: Optional[str] = None
    comprobante_url: Optional[str] = None

class PagoCreate(PagoBase):
    id_usuario: int

class PagoUpdate(BaseModel):
    estado_pago: Optional[str] = None
    validado_por: Optional[int] = None

class PagoResponse(PagoBase):
    id_pago: int
    id_usuario: int
    estado_pago: str
    fecha_pago: datetime
    validado_por: Optional[int] = None

    class Config:
        from_attributes = True

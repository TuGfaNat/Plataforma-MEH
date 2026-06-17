from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from decimal import Decimal

class PagoBase(BaseModel):
    id_referencia: int
    tipo_referencia: str # EVENTO, CURSO, PRODUCTO
    monto: Decimal
    metodo_pago: Optional[str] = None
    url_comprobante: Optional[str] = None

class PagoCreate(PagoBase):
    pass

class PagoUpdate(BaseModel):
    estado_pago: Optional[str] = None
    notas_admin: Optional[str] = None

class PagoResponse(PagoBase):
    id_pago: int
    id_usuario: int
    estado_pago: str
    fecha_pago: datetime
    validado_por: Optional[int] = None
    fecha_validacion: Optional[datetime] = None
    porcentaje_ocr: Optional[Decimal] = None
    texto_ocr: Optional[str] = None
    
    nombre_usuario: Optional[str] = None
    detalles_referencia: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

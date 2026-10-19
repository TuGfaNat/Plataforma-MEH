from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

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

class PagoReembolsoRequest(BaseModel):
    motivo: str

class PagoHistorialItem(BaseModel):
    id_pago: int
    tipo_evento: str # CREACION, APROBADO, RECHAZADO, REINTENTO, REEMBOLSADO
    titulo: str
    descripcion: Optional[str] = None
    fecha: datetime
    responsable: Optional[str] = None
    monto: Optional[Decimal] = None
    url_comprobante: Optional[str] = None
    notas: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class PagoResponse(PagoBase):
    id_pago: int
    id_usuario: int
    estado_pago: str
    fecha_pago: datetime
    validado_por: Optional[int] = None
    fecha_validacion: Optional[datetime] = None
    porcentaje_ocr: Optional[Decimal] = None
    texto_ocr: Optional[str] = None
    notas_admin: Optional[str] = None

    fecha_reembolso: Optional[datetime] = None
    reembolsado_por: Optional[int] = None
    nombre_reembolsador: Optional[str] = None
    motivo_reembolso: Optional[str] = None
    historial_intentos: Optional[str] = None
    
    nombre_usuario: Optional[str] = None
    detalles_referencia: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

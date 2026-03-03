from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class ProductoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio: Decimal = Decimal(0)
    stock: int = 0
    es_kit_evento: bool = False
    imagen_url: Optional[str] = None

class ProductoCreate(ProductoBase):
    pass

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[Decimal] = None
    stock: Optional[int] = None
    es_kit_evento: Optional[bool] = None
    imagen_url: Optional[str] = None
    modificado_por: Optional[int] = None

class ProductoResponse(ProductoBase):
    id_producto: int
    modificado_por: Optional[int] = None
    fecha_modificacion: Optional[datetime] = None

    class Config:
        from_attributes = True

class PedidoDetalleBase(BaseModel):
    id_producto: int
    cantidad: int = 1

class PedidoDetalleResponse(PedidoDetalleBase):
    id_detalle: int
    id_pedido: int

    class Config:
        from_attributes = True

class PedidoBase(BaseModel):
    id_pago: Optional[int] = None
    estado_entrega: str = "PENDIENTE"

class PedidoCreate(PedidoBase):
    id_usuario: int
    detalles: List[PedidoDetalleBase]

class PedidoResponse(PedidoBase):
    id_pedido: int
    id_usuario: int
    fecha_pedido: datetime
    detalles: List[PedidoDetalleResponse]

    class Config:
        from_attributes = True

from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

# --- PRODUCTOS ---
class ProductoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio: Decimal = Decimal(0)
    stock: int = 0
    es_kit_evento: bool = False
    imagen_url: Optional[str] = None
    qr_url: Optional[str] = None
    categoria: str = "SOUVENIR"

class ProductoCreate(ProductoBase):
    pass

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[Decimal] = None
    stock: Optional[int] = None
    es_kit_evento: Optional[bool] = None
    imagen_url: Optional[str] = None
    qr_url: Optional[str] = None
    categoria: Optional[str] = None
    id_estado: Optional[int] = None

class ProductoResponse(ProductoBase):
    id_producto: int
    creado_por: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)

# --- VENTAS (POS) ---
class VentaItem(BaseModel):
    id_producto: int
    cantidad: int

class VentaRequest(BaseModel):
    id_usuario: int
    items: List[VentaItem]
    metodo_pago: str = "EFECTIVO" # EFECTIVO, QR, TRANSFERENCIA
    id_evento: Optional[int] = None
    notas: Optional[str] = None

class PedidoDetalleResponse(BaseModel):
    id_detalle: int
    id_producto: int
    cantidad: int
    precio_unitario: Decimal
    producto_nombre: Optional[str] = None
    producto_imagen: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class PedidoResponse(BaseModel):
    id_pedido: int
    id_usuario: int
    usuario_nombre: Optional[str] = None
    usuario_correo: Optional[str] = None
    id_evento: Optional[int] = None
    evento_titulo: Optional[str] = None
    metodo_pago: Optional[str] = None
    total: Decimal
    estado: str
    fecha_pedido: datetime
    detalles: Optional[List[PedidoDetalleResponse]] = None
    model_config = ConfigDict(from_attributes=True)

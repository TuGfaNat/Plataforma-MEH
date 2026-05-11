from fastapi import APIRouter, Depends, Request, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import models
from ..schemas import pago as pago_schema
from ..services import pagos_service
from .auth import get_current_user
from decimal import Decimal

router = APIRouter(
    prefix="/pagos",
    tags=["pagos"]
)

@router.post("/upload-comprobante", response_model=pago_schema.PagoResponse)
async def upload_comprobante(
    request: Request,
    id_referencia: int = Form(...),
    tipo_referencia: str = Form(...),
    monto: Decimal = Form(...),
    metodo_pago: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ip_address = request.client.host if request.client else None
    return await pagos_service.upload_comprobante(
        db=db,
        current_user=current_user,
        id_referencia=id_referencia,
        tipo_referencia=tipo_referencia,
        monto=monto,
        metodo_pago=metodo_pago,
        file=file,
        ip_address=ip_address
    )

@router.get("/mis-pagos", response_model=List[pago_schema.PagoResponse])
def get_mis_pagos(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    return pagos_service.list_mis_pagos(db, current_user)

# --- ENDPOINTS ADMINISTRATIVOS ---

@router.get("/admin/todos", response_model=List[pago_schema.PagoResponse])
def get_todos_los_pagos(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    return pagos_service.list_todos_pagos(db, current_user)

@router.put("/admin/{id_pago}/validar", response_model=pago_schema.PagoResponse)
def validar_pago(
    request: Request,
    id_pago: int,
    pago_update: pago_schema.PagoUpdate,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ip_address = request.client.host if request.client else None
    return pagos_service.validar_pago(db, current_user, id_pago, pago_update, ip_address)

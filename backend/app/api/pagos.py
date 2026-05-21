import os
from fastapi import APIRouter, Depends, Request, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from decimal import Decimal

from ..database import get_db
from ..models import models
from ..schemas import pago as pago_schema
from ..services import pagos_service, ocrm_service
from .auth import get_current_user

router = APIRouter(
    prefix="/pagos",
    tags=["pagos"]
)

@router.post("/upload-comprobante", response_model=pago_schema.PagoResponse, status_code=status.HTTP_201_CREATED)
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
    """Sube un comprobante de pago para validación."""
    ip_address = request.client.host if request.client else None
    
    file_content = await file.read()
    file_extension = os.path.splitext(file.filename)[1]
    
    return await pagos_service.process_comprobante_upload(
        db=db,
        user_id=current_user.id_usuario,
        id_referencia=id_referencia,
        tipo_referencia=tipo_referencia,
        monto=monto,
        metodo_pago=metodo_pago,
        file_content=file_content,
        file_extension=file_extension,
        ip_address=ip_address
    )

@router.post("/upload-comprobante-ocr", response_model=pago_schema.PagoResponse, status_code=status.HTTP_201_CREATED)
async def upload_comprobante_ocr(
    request: Request,
    id_referencia: int = Form(...),
    tipo_referencia: str = Form(...),
    monto: Decimal = Form(...),
    metodo_pago: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Sube un comprobante de pago para validación automática vía OCR."""
    ip_address = request.client.host if request.client else None

    file_content = await file.read()
    file_extension = os.path.splitext(file.filename)[1]

    return await pagos_service.process_comprobante_upload_ocr(
        db=db,
        user_id=current_user.id_usuario,
        id_referencia=id_referencia,
        tipo_referencia=tipo_referencia,
        monto=monto,
        metodo_pago=metodo_pago,
        file_content=file_content,
        file_extension=file_extension,
        ip_address=ip_address
    )


@router.get("/mis-pagos", response_model=List[pago_schema.PagoResponse])
def get_mis_pagos(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Obtiene la lista de pagos realizados por el usuario actual."""
    return pagos_service.list_mis_pagos(db, current_user.id_usuario)

# --- ENDPOINTS ADMINISTRATIVOS (Solo Staff) ---

@router.get("/admin/todos", response_model=List[pago_schema.PagoResponse])
def get_todos_los_pagos(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Lista todos los pagos del sistema (Admin/Soporte)."""
    return pagos_service.list_todos_pagos(db, current_user.rol)

@router.put("/admin/{id_pago}/validar", response_model=pago_schema.PagoResponse)
def validar_pago(
    request: Request,
    id_pago: int,
    pago_update: pago_schema.PagoUpdate,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Aprueba o rechaza un pago pendiente (Admin/Soporte)."""
    ip_address = request.client.host if request.client else None
    return pagos_service.validar_pago(db, current_user, id_pago, pago_update, ip_address)

@router.post("/admin/ocrm-match", response_model=List[Dict[str, Any]])
async def ocrm_match(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Procesa un extracto bancario para conciliación automática."""
    return await ocrm_service.procesar_extracto_bancario(db, current_user, file)

import os
from fastapi import APIRouter, Depends, Request, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
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
    
    return await pagos_service.process_comprobante_upload(
        db=db,
        user_id=current_user.id_usuario,
        id_referencia=id_referencia,
        tipo_referencia=tipo_referencia,
        monto=monto,
        metodo_pago=metodo_pago,
        file_content=file_content,
        ip_address=ip_address
    )

@router.post("/upload-comprobante-ocr", response_model=pago_schema.PagoResponse, status_code=status.HTTP_201_CREATED)
async def upload_comprobante_ocr(
    request: Request,
    id_referencia: int = Form(...),
    tipo_referencia: str = Form(...),
    monto: Decimal = Form(...),
    metodo_pago: str = Form(...),
    notas_admin: Optional[str] = Form(None),
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
        ip_address=ip_address,
        notas_admin=notas_admin
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


@router.get("/historial", response_model=List[pago_schema.PagoHistorialItem])
def get_historial_pagos(
    id_pago: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Obtiene el timeline histórico de eventos de pago (miembro o staff)."""
    return pagos_service.get_historial_pagos(db, current_user, id_pago)


@router.post("/{id_pago}/reintentar", response_model=pago_schema.PagoResponse)
async def reintentar_comprobante(
    id_pago: int,
    request: Request,
    file: UploadFile = File(...),
    monto: Optional[Decimal] = Form(None),
    metodo_pago: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Permite volver a subir un comprobante para un pago que fue RECHAZADO."""
    ip_address = request.client.host if request.client else None
    content = await file.read()
    return pagos_service.reintentar_comprobante_upload(
        db=db,
        user=current_user,
        id_pago=id_pago,
        file_content=content,
        monto=monto,
        metodo_pago=metodo_pago,
        ip_address=ip_address
    )


@router.post("/{id_pago}/reembolsar", response_model=pago_schema.PagoResponse)
def reembolsar_pago(
    id_pago: int,
    reembolso_req: pago_schema.PagoReembolsoRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Reembolsa manualmente un pago en estado APROBADO (Solo Staff con permiso)."""
    ip_address = request.client.host if request.client else None
    return pagos_service.reembolsar_pago(
        db=db,
        admin_user=current_user,
        id_pago=id_pago,
        motivo=reembolso_req.motivo,
        ip_address=ip_address
    )

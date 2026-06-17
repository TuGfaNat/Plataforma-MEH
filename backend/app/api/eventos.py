from fastapi import APIRouter, Depends, Request, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import models
from ..schemas import evento as evento_schema
from ..schemas.evento import QRScanRequest, CheckpointCreate, CheckpointResponse, InscriptoConfirmadoResponse
from ..schemas.pago_qr import EventoPagoQRResponse
from ..services import eventos_service
from .auth import get_current_user


router = APIRouter(
    prefix="/eventos",
    tags=["eventos"]
)

@router.post("/", response_model=evento_schema.EventoResponse, status_code=status.HTTP_201_CREATED)
def create_evento(
    request: Request,
    evento: evento_schema.EventoCreate, 
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Crea un nuevo evento (Solo Staff)."""
    ip_address = request.client.host if request.client else None
    return eventos_service.create_evento(db, current_user, evento, ip_address)

@router.get("/", response_model=List[evento_schema.EventoResponse])
def get_eventos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Lista todos los eventos disponibles."""
    try:
        return eventos_service.list_eventos(db, skip, limit)
    except Exception as e:
        print(f"DEBUG ERROR EN GET_EVENTOS: {str(e)}")
        import traceback
        traceback.print_exc()
        raise e

@router.get("/{id_evento}", response_model=evento_schema.EventoResponse)
def get_evento(id_evento: int, db: Session = Depends(get_db)):
    """Obtiene los detalles de un evento específico."""
    return eventos_service.get_evento_by_id(db, id_evento)

@router.put("/{id_evento}", response_model=evento_schema.EventoResponse)
def update_evento(
    request: Request,
    id_evento: int, 
    evento: evento_schema.EventoUpdate, 
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Actualiza la información de un evento (Solo Staff)."""
    ip_address = request.client.host if request.client else None
    return eventos_service.update_evento(db, current_user, id_evento, evento, ip_address)

@router.post("/asistencia-qr")
def registrar_asistencia_qr(
    request: Request,
    payload: QRScanRequest,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Registra asistencia mediante el escaneo de un código QR, soportando checkpoints dinámicos."""
    ip_address = request.client.host if request.client else None
    return eventos_service.registrar_asistencia_qr(
        db=db,
        staff_user=current_user,
        codigo_qr=payload.codigo_qr,
        ip_address=ip_address,
        id_checkpoint=payload.id_checkpoint
    )

@router.post("/{id_evento}/asistencia-qr")
def registrar_asistencia_qr_legacy(
    id_evento: int,
    request: Request,
    token_qr: str,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Compatibilidad legacy para el frontend anterior."""
    _ = id_evento
    ip_address = request.client.host if request.client else None
    return eventos_service.registrar_asistencia_qr(db, current_user, token_qr, ip_address)

@router.get("/{id_evento}/checkpoints", response_model=List[CheckpointResponse])
def get_checkpoints(id_evento: int, db: Session = Depends(get_db)):
    return eventos_service.get_checkpoints(db, id_evento)

@router.post("/{id_evento}/checkpoints", response_model=CheckpointResponse)
def create_checkpoint(
    id_evento: int,
    data: CheckpointCreate,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    return eventos_service.create_checkpoint(db, current_user, id_evento, data)

@router.delete("/{id_evento}", status_code=status.HTTP_204_NO_CONTENT)
def delete_evento(
    request: Request,
    id_evento: int,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Elimina lógicamente un evento (Solo Staff)."""
    ip_address = request.client.host if request.client else None
    eventos_service.delete_evento(db, id_evento, current_user, ip_address)

@router.get("/{id_evento}/inscritos-confirmados", response_model=List[InscriptoConfirmadoResponse])
def get_inscritos_confirmados(
    id_evento: int,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Obtiene la lista de inscritos confirmados para descargarlos localmente para escaneo offline."""
    return eventos_service.get_inscritos_confirmados(db, id_evento, current_user)

@router.get("/{id_evento}/pagos-qr", response_model=List[EventoPagoQRResponse])
def get_pagos_qr(id_evento: int, db: Session = Depends(get_db)):
    """Obtiene los paquetes y QRs de pago configurados para un evento."""
    return eventos_service.get_pagos_qr_by_event(db, id_evento)

@router.post("/{id_evento}/pagos-qr", response_model=EventoPagoQRResponse, status_code=status.HTTP_201_CREATED)
async def create_pago_qr(
    id_evento: int,
    request: Request,
    nombre_paquete: str = Form(...),
    monto: float = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Crea un paquete de pago y QR asociado a un evento (Admin, Organizador, Moderador)."""
    ip_address = request.client.host if request.client else None
    
    import os
    _, file_extension = os.path.splitext(file.filename)
    if file_extension.lower() not in [".png", ".jpg", ".jpeg", ".pdf"]:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Tipo de archivo no permitido. Solo imágenes o PDFs.")
        
    file_content = await file.read()
    
    return eventos_service.create_pago_qr(
        db=db,
        admin_user=current_user,
        id_evento=id_evento,
        nombre_paquete=nombre_paquete,
        monto=monto,
        file_content=file_content,
        file_extension=file_extension,
        ip_address=ip_address
    )

@router.delete("/pagos-qr/{id_qr}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pago_qr(
    id_qr: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Elimina lógicamente un paquete de pago QR (Admin, Organizador, Moderador)."""
    ip_address = request.client.host if request.client else None
    eventos_service.delete_pago_qr(db, current_user, id_qr, ip_address)



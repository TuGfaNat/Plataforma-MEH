from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import models
from ..schemas import evento as evento_schema
from ..schemas.evento import QRScanRequest, CheckpointCreate, CheckpointResponse
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

import os
from fastapi import APIRouter, Depends, Request, status, File, UploadFile, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import models
from ..schemas import evento as evento_schema
from ..schemas.evento import (
    QRScanRequest,
    CheckpointCreate,
    CheckpointResponse,
    InscriptoConfirmadoResponse,
    CheckpointPermisoCreate,
    CheckpointPermisoResponse,
    AsistenciaDeshacerRequest,
    AsistenciaDeshacerResponse,
    AsistenciaHistorialPaginadoResponse
)
from ..schemas.pago_qr import EventoPagoQRResponse
from ..services import eventos_service
from .auth import get_current_user, get_current_user_optional


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

@router.post("/{id_evento}/cancelar", response_model=evento_schema.EventoResponse)
def cancelar_evento(
    request: Request,
    id_evento: int,
    payload: evento_schema.EventoCancelarRequest,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Cancela un evento con un motivo específico y notifica a todos los inscritos (Solo Staff autorizado)."""
    ip_address = request.client.host if request.client else None
    return eventos_service.cancelar_evento(db, current_user, id_evento, payload.motivo, ip_address)

@router.post("/{id_evento}/avisar")
def avisar_inscritos_evento(
    request: Request,
    id_evento: int,
    payload: evento_schema.EventoAvisarRequest,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Emite un aviso oficial in-app (y opcionalmente email) exclusivamente a los inscritos confirmados (Solo Staff autorizado)."""
    ip_address = request.client.host if request.client else None
    return eventos_service.avisar_inscritos_evento(db, current_user, id_evento, payload, ip_address)


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
def get_checkpoints(
    id_evento: int,
    db: Session = Depends(get_db),
    current_user: Optional[models.Usuario] = Depends(get_current_user_optional)
):
    return eventos_service.get_checkpoints(db, id_evento, current_user)

@router.post("/{id_evento}/checkpoints", response_model=CheckpointResponse)
def create_checkpoint(
    id_evento: int,
    data: CheckpointCreate,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    return eventos_service.create_checkpoint(db, current_user, id_evento, data)

@router.get("/{id_evento}/checkpoints/{id_checkpoint}/permisos", response_model=List[CheckpointPermisoResponse])
def get_checkpoint_permisos(
    id_evento: int,
    id_checkpoint: int,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Lista operadores y permisos asignados a un checkpoint (MEH-018)."""
    return eventos_service.get_checkpoint_permisos(db, current_user, id_evento, id_checkpoint)

@router.post("/{id_evento}/checkpoints/{id_checkpoint}/permisos", response_model=CheckpointPermisoResponse)
def asignar_checkpoint_permiso(
    id_evento: int,
    id_checkpoint: int,
    payload: CheckpointPermisoCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Asigna o actualiza el permiso de un operador en un checkpoint (MEH-018)."""
    ip_address = request.client.host if request.client else None
    return eventos_service.asignar_checkpoint_permiso(db, current_user, id_evento, id_checkpoint, payload, ip_address)

@router.delete("/{id_evento}/checkpoints/{id_checkpoint}/permisos/{id_usuario}", status_code=status.HTTP_204_NO_CONTENT)
def revocar_checkpoint_permiso(
    id_evento: int,
    id_checkpoint: int,
    id_usuario: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Revoca el permiso de un operador en un checkpoint (MEH-018)."""
    ip_address = request.client.host if request.client else None
    eventos_service.revocar_checkpoint_permiso(db, current_user, id_evento, id_checkpoint, id_usuario, ip_address)

@router.post("/asistencia/deshacer", response_model=AsistenciaDeshacerResponse)
def deshacer_asistencia_evento(
    request: Request,
    payload: AsistenciaDeshacerRequest,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Deshace un escaneo accidental dentro de una ventana de 30 segundos (Admin sin límite) con auditoría (MEH-018)."""
    ip_address = request.client.host if request.client else None
    return eventos_service.deshacer_asistencia_qr(db, current_user, payload, ip_address)

@router.get("/{id_evento}/historial-asistencia", response_model=AsistenciaHistorialPaginadoResponse)
def get_historial_asistencia(
    id_evento: int,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    id_checkpoint: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Obtiene el historial paginado de escaneos de asistencia por evento (MEH-018)."""
    return eventos_service.get_historial_asistencia_paginado(
        db=db,
        current_user=current_user,
        id_evento=id_evento,
        page=page,
        limit=limit,
        id_checkpoint=id_checkpoint,
        search=search
    )

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

@router.get("/{id_evento}/token-qr")
def get_evento_token_qr(id_evento: int, db: Session = Depends(get_db)):
    """Obtiene el token_qr del evento para difusión y acreditación."""
    return eventos_service.get_evento_token_qr(db, id_evento)

@router.get("/{id_evento}/qr-image")
def get_evento_qr_image(id_evento: int, db: Session = Depends(get_db)):
    """Descarga la imagen PNG del QR del evento generada localmente en el backend."""
    from fastapi import Response
    qr_bytes, filename = eventos_service.get_evento_qr_image(db, id_evento)
    return Response(
        content=qr_bytes,
        media_type="image/png",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

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
    """Crea un paquete de pago y QR asociado a un evento con validación y anti-duplicado."""
    ip_address = request.client.host if request.client else None
    file_content = await file.read()
    
    return eventos_service.create_pago_qr(
        db=db,
        admin_user=current_user,
        id_evento=id_evento,
        nombre_paquete=nombre_paquete,
        monto=monto,
        file_content=file_content,
        ip_address=ip_address
    )

@router.put("/pagos-qr/{id_qr}", response_model=EventoPagoQRResponse)
async def update_pago_qr(
    id_qr: int,
    request: Request,
    nombre_paquete: Optional[str] = Form(None),
    monto: Optional[float] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Actualiza datos y/o código QR de un paquete de pago con anti-duplicado (Admin, Organizador, Moderador)."""
    ip_address = request.client.host if request.client else None
    file_content = await file.read() if file else None

    return eventos_service.update_pago_qr(
        db=db,
        admin_user=current_user,
        id_qr=id_qr,
        nombre_paquete=nombre_paquete,
        monto=monto,
        file_content=file_content,
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


@router.post("/{id_evento}/acreditar", response_model=evento_schema.AcreditacionResponse)
def acreditar_participante(
    id_evento: int,
    payload: evento_schema.AcreditarParticipanteRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Acredita manualmente a un participante en el evento (Solo ADMIN y ORGANIZADOR)."""
    ip_address = request.client.host if request.client else None
    return eventos_service.acreditar_participante(
        db=db,
        staff_user=current_user,
        id_evento=id_evento,
        id_inscripcion=payload.id_inscripcion,
        codigo_qr=payload.codigo_qr,
        ip_address=ip_address
    )


@router.get("/{id_evento}/inscritos.csv")
def exportar_inscritos_csv(
    id_evento: int,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Exporta la lista completa de inscritos y su asistencia en formato CSV con UTF-8 BOM (Solo Staff)."""
    from fastapi import Response
    csv_bytes, filename = eventos_service.export_inscritos_csv(db, current_user, id_evento)
    return Response(
        content=csv_bytes,
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )


@router.post("/{id_evento}/aprobar-lista-espera", response_model=evento_schema.LoteAprobacionResponse)
def aprobar_lista_espera_lote(
    id_evento: int,
    request: Request,
    payload: Optional[evento_schema.LoteAprobacionRequest] = None,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Aprueba en lote a los inscritos en lista de espera respetando los cupos disponibles (Solo Staff)."""
    ip_address = request.client.host if request.client else None
    cantidad = payload.cantidad if payload else None
    return eventos_service.aprobar_lista_espera_lote(
        db=db,
        current_user=current_user,
        id_evento=id_evento,
        cantidad=cantidad,
        ip_address=ip_address
    )


@router.post("/{id_evento}/duplicar", response_model=evento_schema.EventoResponse, status_code=status.HTTP_201_CREATED)
def duplicar_evento(
    id_evento: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Duplica un evento existente copiando su configuración, agenda, speakers y paquetes de pago (Solo Staff)."""
    ip_address = request.client.host if request.client else None
    return eventos_service.duplicar_evento(
        db=db,
        current_user=current_user,
        id_evento=id_evento,
        ip_address=ip_address
    )


@router.get("/{id_evento}/llegadas", response_model=evento_schema.EventoLlegadasResponse)
def get_llegadas_evento(
    id_evento: int,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Obtiene métricas de llegadas por hora y resumen por checkpoint (Solo Staff o Creador)."""
    return eventos_service.get_llegadas_evento(db, id_evento, current_user)


@router.get("/{id_evento}/badge-info", response_model=evento_schema.BadgeSocialResponse)
def get_badge_social_info(
    id_evento: int,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Obtiene los datos del badge social para el participante inscrito o vista previa staff."""
    return eventos_service.get_badge_social_info(db, id_evento, current_user)


@router.post("/{id_evento}/plantilla-badge")
async def upload_plantilla_badge(
    id_evento: int,
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Carga y actualiza la plantilla de badge social de un evento (Solo Staff)."""
    ip_address = request.client.host if request.client else None
    content = await file.read()
    url = eventos_service.upload_plantilla_badge(
        db=db,
        id_evento=id_evento,
        admin_user=current_user,
        file_content=content,
        ip_address=ip_address
    )
    return {"status": "success", "plantilla_badge_url": url}


@router.post("/imagen", response_model=evento_schema.EventoImagenUploadResponse)
async def upload_evento_imagen_borrador(
    file: UploadFile = File(...),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Valida y procesa una imagen de portada generando original y variantes 16:9 y 1:1 antes de guardar el evento (Solo Staff)."""
    from ..core.permissions import ADMIN_OR_ORGANIZER_ROLES, PERMISSION_EVENTS_MANAGE, has_permission
    from ..core.exceptions import PermisoDenegadoError
    from ..services import evento_imagen_service

    if current_user.rol not in ADMIN_OR_ORGANIZER_ROLES and not has_permission(current_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError("No tienes permisos para subir imágenes de portada de eventos.")

    content = await file.read()
    return evento_imagen_service.process_and_save_evento_imagen(
        file_content=content,
        id_evento=None,
        filename=file.filename,
        content_type=file.content_type,
    )


@router.post("/{id_evento}/imagen", response_model=evento_schema.EventoResponse)
async def upload_or_replace_evento_imagen(
    id_evento: int,
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Sube o reemplaza la imagen de portada de un evento existente generando sus variantes 16:9 y 1:1 (Solo Staff)."""
    from ..services import evento_imagen_service

    ip_address = request.client.host if request.client else None
    content = await file.read()
    return evento_imagen_service.upload_or_replace_evento_imagen(
        db=db,
        id_evento=id_evento,
        current_user=current_user,
        file_content=content,
        filename=file.filename,
        content_type=file.content_type,
        ip_address=ip_address,
    )


@router.delete("/{id_evento}/imagen", response_model=evento_schema.EventoResponse)
def delete_evento_imagen(
    id_evento: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Elimina la imagen de portada de un evento y limpia sus variantes en disco (Solo Staff)."""
    from ..services import evento_imagen_service

    ip_address = request.client.host if request.client else None
    return evento_imagen_service.remove_evento_imagen(
        db=db,
        id_evento=id_evento,
        current_user=current_user,
        ip_address=ip_address,
    )

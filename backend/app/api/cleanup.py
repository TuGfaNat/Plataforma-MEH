from fastapi import APIRouter, Depends, Query, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Any, Dict, List, Optional

from ..database import get_db
from ..models import models
from ..schemas import cleanup as cleanup_schema
from ..services import cleanup as cleanup_service
from ..core.permissions import ensure_admin
from .auth import get_current_user

router = APIRouter(
    prefix="/admin/cleanup",
    tags=["admin-cleanup"],
)


@router.get("/status")
def get_cleanup_status(
    current_user: models.Usuario = Depends(get_current_user),
):
    """Devuelve el estado del módulo de limpieza y configuración general (Solo ADMIN)."""
    ensure_admin(
        current_user.rol,
        "Solo los administradores (ADMIN) pueden consultar el estado de limpieza de datos",
    )
    return {
        "enabled": cleanup_service.is_cleanup_enabled(),
        "superadmin_email": cleanup_service.get_superadmin_email(),
        "backup_ttl_minutes": cleanup_service.get_backup_ttl_minutes(),
        "soft_delete_phrase": cleanup_service.SOFT_DELETE_PHRASE,
        "hard_delete_phrase": cleanup_service.HARD_DELETE_PHRASE,
    }


@router.get("/catalog", response_model=List[cleanup_schema.CleanupTableCatalogItem])
def get_cleanup_catalog(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user),
):
    """Obtiene el catálogo completo de tablas limpiables, conteos por origen y matriz de dependencias."""
    ensure_admin(current_user.rol)
    return cleanup_service.get_catalog_summary(db, current_user)


@router.get("/tables/{tabla}/rows", response_model=List[cleanup_schema.CleanupRowItem])
def get_cleanup_table_rows(
    tabla: str,
    search: Optional[str] = Query(default=None),
    origen: Optional[str] = Query(default=None),
    include_deleted: bool = Query(default=False),
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user),
):
    """Lista los registros de una tabla con creador, fechas, padre, clasificación SEED/REAL/OCR y protección."""
    ensure_admin(current_user.rol)
    return cleanup_service.list_table_rows(
        db=db,
        current_user=current_user,
        tabla=tabla,
        search=search,
        origen=origen,
        include_deleted=include_deleted,
    )


@router.get("/protected", response_model=cleanup_schema.ProtectedConfigResponse)
def get_protected_accounts(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user),
):
    """Obtiene la cuenta Superadmin, el usuario actual y la lista blanca de correos protegidos."""
    ensure_admin(current_user.rol)
    return cleanup_service.get_protected_config_response(db, current_user)


@router.put("/protected/whitelist", response_model=cleanup_schema.ProtectedConfigResponse)
def update_protected_whitelist(
    payload: cleanup_schema.WhitelistUpdateRequest,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user),
):
    """Actualiza la lista blanca configurable de correos protegidos contra limpieza."""
    ensure_admin(current_user.rol)
    return cleanup_service.update_whitelist_emails(db, current_user, payload.emails)


@router.get("/presets", response_model=List[cleanup_schema.CleanupPresetItem])
def get_cleanup_presets(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user),
):
    """Lista los presets de limpieza disponibles, incluido 'Dejar solo superadmin' y presets personalizados."""
    ensure_admin(current_user.rol)
    return cleanup_service.list_presets(db, current_user)


@router.post(
    "/presets",
    response_model=cleanup_schema.CleanupPresetItem,
    status_code=status.HTTP_201_CREATED,
)
def save_cleanup_preset(
    payload: cleanup_schema.CleanupPresetCreateRequest,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user),
):
    """Crea o actualiza un preset personalizado de limpieza."""
    ensure_admin(current_user.rol)
    return cleanup_service.save_custom_preset(db, current_user, payload)


@router.delete("/presets/{preset_id}")
def delete_cleanup_preset(
    preset_id: str,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user),
):
    """Elimina un preset personalizado."""
    ensure_admin(current_user.rol)
    return cleanup_service.delete_custom_preset(db, current_user, preset_id)


@router.post("/presets/{preset_id}/resolve")
def resolve_cleanup_preset(
    preset_id: str,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user),
) -> Dict[str, Any]:
    """Resuelve un preset a la selección concreta de tablas e IDs (excluyendo protegidos)."""
    ensure_admin(current_user.rol)
    return cleanup_service.resolve_preset_selections(db, current_user, preset_id)


@router.post("/preview", response_model=cleanup_schema.CleanupPreviewResponse)
def preview_cleanup_operation(
    payload: cleanup_schema.CleanupPreviewRequest,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user),
):
    """Calcula la previsualización de la limpieza con dependencias, bloqueos, orígenes y selection_hash."""
    ensure_admin(current_user.rol)
    return cleanup_service.preview_cleanup(db, current_user, payload)


@router.post(
    "/backup",
    response_model=cleanup_schema.CleanupBackupResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_cleanup_backup_endpoint(
    payload: cleanup_schema.CleanupBackupRequest,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user),
):
    """Genera un respaldo JSON obligatorio fuera de /static con TTL de 30 minutos para la selección actual."""
    ensure_admin(current_user.rol)
    return cleanup_service.generate_backup_for_selection(db, current_user, payload)


@router.get("/backup/{backup_id}")
def download_cleanup_backup(
    backup_id: str,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user),
):
    """Descarga el archivo JSON de un respaldo vigente (TTL de 30 min)."""
    ensure_admin(current_user.rol)
    cleanup_service.ensure_cleanup_admin(current_user)
    data = cleanup_service.get_valid_backup(backup_id)
    return JSONResponse(
        content=data,
        headers={
            "Content-Disposition": f'attachment; filename="{backup_id}.json"'
        },
    )


@router.post("/execute", response_model=cleanup_schema.CleanupExecuteResponse)
def execute_cleanup_endpoint(
    payload: cleanup_schema.CleanupExecuteRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user),
):
    """Ejecuta la limpieza selectiva en transacción atómica verificando backup, hash, frase, contraseña y motivo."""
    ensure_admin(current_user.rol)
    ip_address = request.client.host if request.client else None
    return cleanup_service.execute_cleanup(db, current_user, payload, ip_address)

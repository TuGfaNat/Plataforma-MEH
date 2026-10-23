from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from typing import Dict, List, Any
from ..database import get_db
from ..models import models
from .auth import get_current_user
from ..core.logging import registrar_log
from ..services import auth_service
from ..services.cleanup.catalog import CLEANUP_CATALOG, build_classification_context, _resolve_title_and_subtitle
from ..services.cleanup.protection import is_record_protected

router = APIRouter(
    prefix="/admin/papelera",
    tags=["papelera"]
)

# Definición de categorías principales de la Papelera
CATEGORIES = {
    "eventos": {
        "model": models.Evento,
        "id_field": "id_evento",
        "title_field": "titulo",
        "sub_field": "tipo_evento"
    },
    "cursos": {
        "model": models.Curso,
        "id_field": "id_curso",
        "title_field": "nombre_curso",
        "sub_field": "horas_academicas"
    },
    "usuarios": {
        "model": models.Usuario,
        "id_field": "id_usuario",
        "title_field": "correo",
        "sub_field": "rol"
    },
    "anuncios": {
        "model": models.Anuncio,
        "id_field": "id_anuncio",
        "title_field": "titulo",
        "sub_field": "tipo"
    },
    "recursos": {
        "model": models.Recurso,
        "id_field": "id_recurso",
        "title_field": "titulo",
        "sub_field": "categoria"
    },
    "productos": {
        "model": models.Producto,
        "id_field": "id_producto",
        "title_field": "nombre",
        "sub_field": "precio"
    },
    "speakers": {
        "model": models.Speaker,
        "id_field": "id_speaker",
        "title_field": "nombre",
        "sub_field": "correo_contacto"
    },
    "auspiciadores": {
        "model": models.Auspiciador,
        "id_field": "id_auspiciador",
        "title_field": "nombre",
        "sub_field": "tipo"
    },
    "comunidades": {
        "model": models.ComunidadAliada,
        "id_field": "id_comunidad",
        "title_field": "nombre",
        "sub_field": "link_contacto"
    }
}


def _resolve_category_info(category: str) -> Dict[str, Any]:
    if category in CATEGORIES:
        return CATEGORIES[category]
    if category in CLEANUP_CATALOG:
        c = CLEANUP_CATALOG[category]
        return {
            "model": c["model"],
            "id_field": c["pk_field"],
            "title_field": None,
            "sub_field": None,
            "catalog_key": category,
        }
    return None


def check_role_access(rol: str, category: str) -> bool:
    """Verifica si el rol del usuario tiene acceso a una categoría de la papelera."""
    if rol == "ADMIN":
        return True
    if rol == "ORGANIZADOR":
        return category in ["eventos", "speakers", "auspiciadores", "comunidades"]
    if rol == "MODERADOR":
        return category in ["cursos", "anuncios", "recursos"]
    return False


@router.get("/", response_model=Dict[str, List[Dict[str, Any]]])
def get_deleted_items(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Obtiene todos los registros en estado ELIMINADO (0) accesibles por el rol del usuario."""
    if current_user.rol not in ["ADMIN", "ORGANIZADOR", "MODERADOR"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para acceder a la papelera de reciclaje"
        )

    response = {}
    for cat_name, cat_info in CATEGORIES.items():
        if not check_role_access(current_user.rol, cat_name):
            continue

        model = cat_info["model"]
        id_field = cat_info["id_field"]
        title_field = cat_info["title_field"]
        sub_field = cat_info["sub_field"]

        # Consultar saltando el filtro global de soft-delete
        deleted_records = db.query(model).execution_options(include_deleted=True).filter(
            model.id_estado == 0
        ).all()

        items_list = []
        for record in deleted_records:
            items_list.append({
                "id": getattr(record, id_field),
                "titulo": getattr(record, title_field),
                "subtitulo": str(getattr(record, sub_field)) if getattr(record, sub_field) is not None else "",
                "fecha_eliminacion": record.fecha_modificacion_estado.isoformat() if record.fecha_modificacion_estado else None
            })

        response[cat_name] = items_list

    return response


@router.post("/restaurar/{category}/{item_id}")
def restore_item(
    category: str,
    item_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Restaura un elemento eliminado lógicamente (id_estado = 2). En usuarios reactiva cuenta y limpia suspensión."""
    if current_user.rol not in ["ADMIN", "ORGANIZADOR", "MODERADOR"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No autorizado"
        )

    cat_info = _resolve_category_info(category)
    if not cat_info:
        raise HTTPException(status_code=400, detail="Categoría de papelera inválida")

    if not check_role_access(current_user.rol, category):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para restaurar elementos de esta categoría"
        )

    model = cat_info["model"]
    id_field = cat_info["id_field"]

    # Buscar saltando el filtro global
    item = db.query(model).execution_options(include_deleted=True).filter(
        getattr(model, id_field) == item_id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Elemento no encontrado en la papelera")

    if item.id_estado != 0:
        raise HTTPException(status_code=400, detail="El elemento no está eliminado")

    ip_address = request.client.host if request.client else None

    # Si es un Usuario, reutilizar la lógica integral de restauración de usuarios (activo=True, motivo_suspension=None)
    if model is models.Usuario:
        auth_service.restaurar_usuario(db, current_user, item_id, ip_address)
        return {"message": "Elemento restaurado con éxito", "category": category, "id": item_id}

    # Cambiar estado a ACTIVO y reactivar flag 'activo' si el modelo lo posee
    item.id_estado = 2
    item.fecha_modificacion_estado = datetime.utcnow()
    if hasattr(item, "activo"):
        item.activo = True
    if hasattr(item, "modificado_por"):
        item.modificado_por = current_user.id_usuario
    if hasattr(item, "fecha_modificacion"):
        item.fecha_modificacion = datetime.utcnow()
    db.commit()

    registrar_log(
        db=db,
        id_admin=current_user.id_usuario,
        accion=f"RESTAURAR_{category.upper()}",
        tabla_afectada=model.__tablename__,
        id_registro_afectado=item_id,
        valor_anterior={"id_estado": 0},
        valor_nuevo={"id_estado": 2, **({"activo": True} if hasattr(item, "activo") else {})},
        ip_direccion=ip_address
    )

    return {"message": "Elemento restaurado con éxito", "category": category, "id": item_id}


@router.delete("/destruir/{category}/{item_id}")
def purge_item(
    category: str,
    item_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Borra físicamente un elemento de la base de datos de manera definitiva (Solo Admin)."""
    if current_user.rol != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sólo los administradores del sistema pueden vaciar o depurar físicamente la papelera"
        )

    cat_info = _resolve_category_info(category)
    if not cat_info:
        raise HTTPException(status_code=400, detail="Categoría inválida")

    model = cat_info["model"]
    id_field = cat_info["id_field"]

    # Buscar saltando el filtro global
    item = db.query(model).execution_options(include_deleted=True).filter(
        getattr(model, id_field) == item_id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Elemento no encontrado")

    # Proteger cuentas intocables (Superadmin, usuario actual, lista blanca)
    tabla_key = "usuarios" if model is models.Usuario else model.__tablename__
    prot, motivo_prot = is_record_protected(db, current_user, tabla_key, item)
    if prot:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"No se puede purgar físicamente un registro protegido ({motivo_prot})"
        )

    # Borrar físicamente
    db.delete(item)
    db.commit()

    ip_address = request.client.host if request.client else None
    registrar_log(
        db=db,
        id_admin=current_user.id_usuario,
        accion=f"PURGAR_DEFECTO_{category.upper()}",
        tabla_afectada=model.__tablename__,
        id_registro_afectado=item_id,
        ip_direccion=ip_address
    )

    return {"message": "Elemento purgado físicamente del sistema", "category": category, "id": item_id}

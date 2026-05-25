from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, List, Any
from ..database import get_db
from ..models import models
from .auth import get_current_user
from ..core.permissions import PermisoDenegadoError
from ..core.logging import registrar_log

router = APIRouter(
    prefix="/admin/papelera",
    tags=["papelera"]
)

# Definición de categorías, modelos e información de despliegue para la Papelera
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

def check_role_access(rol: str, category: str) -> bool:
    """Verifica si el rol del usuario tiene acceso a una categoría de la papelera."""
    if rol == "ADMIN":
        return True
    if rol == "ORGANIZADOR":
        # Acceso a logística y organización
        return category in ["eventos", "speakers", "auspiciadores", "comunidades"]
    if rol == "MODERADOR":
        # Acceso a moderación académica e informativa
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
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Restaura un elemento eliminado lógicamente (id_estado = 2)."""
    if current_user.rol not in ["ADMIN", "ORGANIZADOR", "MODERADOR"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No autorizado"
        )
        
    if category not in CATEGORIES:
        raise HTTPException(status_code=400, detail="Categoría de papelera inválida")
        
    if not check_role_access(current_user.rol, category):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para restaurar elementos de esta categoría"
        )
        
    cat_info = CATEGORIES[category]
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
        
    # Cambiar estado a ACTIVO
    item.id_estado = 2
    db.commit()
    
    registrar_log(
        db=db,
        id_admin=current_user.id_usuario,
        accion=f"RESTAURAR_{category.upper()}",
        tabla_afectada=model.__tablename__,
        id_registro_afectado=item_id,
        valor_nuevo={"id_estado": 2}
    )
    
    return {"message": "Elemento restaurado con éxito", "category": category, "id": item_id}

@router.delete("/destruir/{category}/{item_id}")
def purge_item(
    category: str,
    item_id: int,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Borra físicamente un elemento de la base de datos de manera definitiva (Solo Admin)."""
    if current_user.rol != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sólo los administradores del sistema pueden vaciar o depurar físicamente la papelera"
        )
        
    if category not in CATEGORIES:
        raise HTTPException(status_code=400, detail="Categoría inválida")
        
    cat_info = CATEGORIES[category]
    model = cat_info["model"]
    id_field = cat_info["id_field"]
    
    # Buscar saltando el filtro global
    item = db.query(model).execution_options(include_deleted=True).filter(
        getattr(model, id_field) == item_id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Elemento no encontrado")
        
    # Borrar físicamente
    db.delete(item)
    db.commit()
    
    registrar_log(
        db=db,
        id_admin=current_user.id_usuario,
        accion=f"PURGAR_DEFECTO_{category.upper()}",
        tabla_afectada=model.__tablename__,
        id_registro_afectado=item_id
    )
    
    return {"message": "Elemento purgado físicamente del sistema", "category": category, "id": item_id}

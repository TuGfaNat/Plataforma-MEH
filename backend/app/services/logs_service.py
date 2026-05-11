from sqlalchemy.orm import Session
from typing import List
from ..models import models
from ..core.permissions import PERMISSION_AUDIT_READ, ensure_permission

def get_logs_auditoria(
    db: Session,
    current_user: models.Usuario,
    skip: int = 0,
    limit: int = 100
) -> List[dict]:
    ensure_permission(current_user.rol, PERMISSION_AUDIT_READ, "No tienes permisos para ver los logs")
    
    # Hacemos un join con Usuarios para traer el nombre del admin
    logs = db.query(models.LogSistema, models.Usuario).join(
        models.Usuario, models.LogSistema.id_admin == models.Usuario.id_usuario
    ).order_by(models.LogSistema.fecha_hora.desc()).offset(skip).limit(limit).all()

    return [
        {
            "id_log": log.LogSistema.id_log,
            "admin_name": f"{log.Usuario.nombres} {log.Usuario.apellidos}",
            "accion": log.LogSistema.accion,
            "tabla_afectada": log.LogSistema.tabla_afectada,
            "id_registro_afectado": log.LogSistema.id_registro_afectado,
            "fecha": log.LogSistema.fecha_hora,
            "valor_anterior": log.LogSistema.valor_anterior,
            "valor_nuevo": log.LogSistema.valor_nuevo,
            "ip_direccion": log.LogSistema.ip_direccion
        }
        for log in logs
    ]

from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..models import models
from ..core.permissions import PERMISSION_AUDIT_READ, has_permission
from ..core.exceptions import PermisoDenegadoError

def get_logs_auditoria(
    db: Session,
    admin_role: str,
    fecha_inicio: Optional[datetime] = None,
    fecha_fin: Optional[datetime] = None,
    accion: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[dict]:
    """Obtiene la trazabilidad total de acciones en el sistema (Solo para Administradores)."""
    if not has_permission(admin_role, PERMISSION_AUDIT_READ):
        raise PermisoDenegadoError("No tienes privilegios para consultar la auditoría")
    
    query = db.query(models.LogSistema, models.Usuario).join(
        models.Usuario, models.LogSistema.id_admin == models.Usuario.id_usuario
    )
    
    if fecha_inicio:
        query = query.filter(models.LogSistema.fecha_hora >= fecha_inicio)
    if fecha_fin:
        query = query.filter(models.LogSistema.fecha_hora <= fecha_fin)
    if accion:
        query = query.filter(models.LogSistema.accion.ilike(f"%{accion}%"))
        
    logs = query.order_by(models.LogSistema.fecha_hora.desc()).offset(skip).limit(limit).all()

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

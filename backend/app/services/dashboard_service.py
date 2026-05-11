from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models import models
from ..core.permissions import (
    PERMISSION_PAYMENTS_VALIDATE,
    PERMISSION_AUDIT_READ,
    has_permission
)

def get_dashboard_stats(db: Session, current_user: models.Usuario):
    role = current_user.rol
    stats = {
        "user_role": role,
        "welcome_name": current_user.nombres,
        "widgets": []
    }

    # Estadísticas para MIEMBRO y roles superiores
    # (Todos los usuarios ven sus propios datos básicos)
    mis_eventos = db.query(models.InscripcionEvento).filter(
        models.InscripcionEvento.id_usuario == current_user.id_usuario
    ).count()
    
    mis_certificados = db.query(models.Certificado).filter(
        models.Certificado.id_usuario == current_user.id_usuario
    ).count()

    promedio_progreso = db.query(func.avg(models.InscripcionCurso.progreso)).filter(
        models.InscripcionCurso.id_usuario == current_user.id_usuario
    ).scalar() or 0

    stats["personal_stats"] = {
        "eventos_inscritos": mis_eventos,
        "certificados_obtenidos": mis_certificados,
        "progreso_promedio": float(promedio_progreso)
    }

    # WIDGETS DINÁMICOS BASADOS EN PERMISOS
    
    # Si puede validar pagos, mostrar pagos pendientes
    if has_permission(role, PERMISSION_PAYMENTS_VALIDATE):
        pagos_pendientes = db.query(models.Pago).filter(models.Pago.estado_pago == "PENDIENTE").count()
        stats["widgets"].append({
            "id": "pending_payments",
            "title": "Pagos por Validar",
            "value": pagos_pendientes,
            "icon": "ReceiptMoney",
            "link": "/gestion-pagos"
        })

    # Si puede leer auditoría, mostrar resumen de actividad
    if has_permission(role, PERMISSION_AUDIT_READ):
        total_usuarios = db.query(models.Usuario).count()
        stats["widgets"].append({
            "id": "total_users",
            "title": "Usuarios Totales",
            "value": total_usuarios,
            "icon": "People",
            "link": "/admin"
        })
        
        logs_hoy = db.query(models.LogSistema).filter(
            func.date(models.LogSistema.fecha_hora) == func.current_date()
        ).count()
        stats["widgets"].append({
            "id": "system_activity",
            "title": "Logs de Hoy",
            "value": logs_hoy,
            "icon": "ShieldLock",
            "link": "/auditoria"
        })

    # Eventos activos (Para Organizadores y Admins)
    if role in ["ADMIN", "ORGANIZADOR"]:
        eventos_activos = db.query(models.Evento).filter(models.Evento.estado == "PROGRAMADO").count()
        stats["widgets"].append({
            "id": "active_events",
            "title": "Eventos Programados",
            "value": eventos_activos,
            "icon": "CalendarStar",
            "link": "/admin"
        })

    return stats

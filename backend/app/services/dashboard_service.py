from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from ..models import models
from ..core.permissions import (
    PERMISSION_PAYMENTS_VALIDATE,
    PERMISSION_AUDIT_READ,
    has_permission
)

def get_personal_dashboard_stats(db: Session, user_id: int, role: str, nombres: str):
    """Genera estadísticas personales para el Dashboard de cualquier usuario."""
    stats = {
        "user_role": role,
        "welcome_name": nombres,
        "widgets": [],
        "advanced_metrics": {}
    }

    # 1. ESTADÍSTICAS PERSONALES (Para todos los miembros)
    mis_eventos = db.query(models.InscripcionEvento).filter(
        models.InscripcionEvento.id_usuario == user_id
    ).count()
    
    mis_certificados = db.query(models.Certificado).filter(
        models.Certificado.id_usuario == user_id
    ).count()

    # Obtener últimas 3 insignias con metadatos completos y fecha de obtención
    ultimas_insignias = db.query(
        models.Badge.id_badge,
        models.Badge.nombre_badge,
        models.Badge.descripcion,
        models.Badge.imagen_url,
        models.Badge.puntos,
        models.Badge.requisito_nivel,
        models.UsuarioBadge.fecha_obtencion
    ).join(
        models.UsuarioBadge, models.Badge.id_badge == models.UsuarioBadge.id_badge
    ).filter(
        models.UsuarioBadge.id_usuario == user_id,
        models.Badge.id_estado != 0
    ).order_by(models.UsuarioBadge.fecha_obtencion.desc()).limit(3).all()

    ultimas_insignias_data = [
        {
            "id_badge": row[0],
            "nombre_badge": row[1],
            "descripcion": row[2],
            "imagen_url": row[3],
            "puntos": row[4],
            "requisito_nivel": row[5],
            "fecha_obtencion": row[6].isoformat() if row[6] else None
        } for row in ultimas_insignias
    ]

    # Sincronizado con el modelo saneado (progreso)
    promedio_progreso = db.query(func.avg(models.InscripcionCurso.progreso)).filter(
        models.InscripcionCurso.id_usuario == user_id
    ).scalar() or 0

    # Calcular puntos XP acumulados sumando los puntos de sus insignias
    puntos_xp = db.query(func.sum(models.Badge.puntos)).join(
        models.UsuarioBadge, models.Badge.id_badge == models.UsuarioBadge.id_badge
    ).filter(models.UsuarioBadge.id_usuario == user_id).scalar() or 0

    stats["personal_stats"] = {
        "eventos_inscritos": mis_eventos,
        "certificados_obtenidos": mis_certificados,
        "progreso_promedio": float(promedio_progreso),
        "eventos_asistidos": mis_eventos, # Por ahora simplificado
        "eventos_esperados": 10,
        "puntos_xp": int(puntos_xp),
        "ultimas_insignias": ultimas_insignias_data
    }
    
    return stats

def get_dashboard_stats(db: Session, user_id: int, role: str, nombres: str):
    """Genera estadísticas dinámicas y KPIs para el Dashboard según el rol del usuario."""
    stats = get_personal_dashboard_stats(db, user_id, role, nombres)

    # 2. WIDGETS POR PERMISOS (Staff / Admin)
    if has_permission(role, PERMISSION_PAYMENTS_VALIDATE):
        pagos_pendientes = db.query(models.Pago).filter(models.Pago.estado_pago == "PENDIENTE").count()
        stats["widgets"].append({
            "id": "pending_payments",
            "title": "Pagos por Validar",
            "value": pagos_pendientes,
            "icon": "ReceiptMoney",
            "link": "/gestion-pagos"
        })

    if has_permission(role, PERMISSION_AUDIT_READ):
        total_usuarios = db.query(models.Usuario).count()
        stats["widgets"].append({
            "id": "total_users",
            "title": "Usuarios Totales",
            "value": total_usuarios,
            "icon": "People",
            "link": "/admin?tab=usuarios" if role == "ADMIN" else "/dashboard/users"
        })
        
        # --- MÉTRICAS ESTRATÉGICAS (BI) ---
        
        # Crecimiento de comunidad (últimos 30 días)
        hace_30_dias = date.today() - timedelta(days=30)
        nuevos_miembros = db.query(models.Usuario).filter(models.Usuario.fecha_registro >= hace_30_dias).count()
        stats["advanced_metrics"]["crecimiento_mensual"] = nuevos_miembros

        # Tendencia Estudiantes vs Profesionales
        profesionales = db.query(models.Usuario).filter(models.Usuario.tipo_entidad == "Profesional").count()
        estudiantes = db.query(models.Usuario).filter(models.Usuario.tipo_entidad == "Estudiante").count()
        stats["advanced_metrics"]["perfil_ocupacional"] = {
            "estudiantes": estudiantes,
            "profesionales": profesionales
        }

        # Distribución por Departamento
        deptos = db.query(models.Usuario.departamento, func.count(models.Usuario.id_usuario)).group_by(models.Usuario.departamento).all()
        stats["advanced_metrics"]["geografia_bolivia"] = {d[0] if d[0] else "No especificado": d[1] for d in deptos}

        # Tasa de Asistencia Global
        total_inscritos = db.query(models.InscripcionEvento).count()
        total_asistentes = db.query(models.InscripcionEvento).filter(models.InscripcionEvento.asistio == True).count()
        stats["advanced_metrics"]["tasa_asistencia"] = {
            "asistieron": total_asistentes,
            "ausentes": max(0, total_inscritos - total_asistentes)
        }

        # Rendimiento Académico (Cursos)
        aprobados = db.query(models.InscripcionCurso).filter(models.InscripcionCurso.finalizado == True, models.InscripcionCurso.nota_final >= 61).count()
        reprobados = db.query(models.InscripcionCurso).filter(models.InscripcionCurso.finalizado == True, models.InscripcionCurso.nota_final < 61).count()
        stats["advanced_metrics"]["rendimiento_academico"] = {
            "aprobados": aprobados,
            "reprobados": reprobados
        }

        hoy = date.today()
        logs_hoy = db.query(models.LogSistema).filter(
            func.date(models.LogSistema.fecha_hora) == hoy
        ).count()
        
        stats["widgets"].append({
            "id": "system_activity",
            "title": "Logs de Hoy",
            "value": logs_hoy,
            "icon": "ShieldLock",
            "link": "/auditoria"
        })

    if role in ["ADMIN", "ORGANIZADOR"]:
        eventos_activos = db.query(models.Evento).filter(models.Evento.estado == "PROGRAMADO").count()
        stats["widgets"].append({
            "id": "active_events",
            "title": "Eventos Programados",
            "value": eventos_activos,
            "icon": "CalendarStar",
            "link": "/dashboard/events-master"
        })

    return stats

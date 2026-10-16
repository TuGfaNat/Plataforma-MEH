from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_
from datetime import date, datetime, timedelta
from collections import defaultdict
from typing import Optional, List, Union, Dict, Any
from ..models import models
from ..core.permissions import (
    ADMIN_OR_ORGANIZER_ROLES,
    ensure_roles,
    PERMISSION_PAYMENTS_VALIDATE,
    PERMISSION_AUDIT_READ,
    has_permission
)

def _month_key(value):
    if not value:
        return None
    if isinstance(value, datetime):
        return value.strftime("%Y-%m")
    if isinstance(value, str):
        return value[:7]
    return str(value)[:7]

def _safe_value(getter, default=0):
    try:
        value = getter()
        return default if value is None else value
    except Exception:
        return default

def _parse_date(val):
    if not val:
        return None
    if isinstance(val, (datetime, date)):
        return val
    try:
        val_clean = str(val).strip()
        if "T" in val_clean:
            return datetime.fromisoformat(val_clean.replace("Z", "+00:00")).replace(tzinfo=None)
        return datetime.strptime(val_clean[:10], "%Y-%m-%d")
    except Exception:
        return None

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


def get_filtered_dashboard_stats(
    db: Session,
    current_user: models.Usuario,
    q: Optional[str] = None,
    fecha_inicio: Optional[str] = None,
    fecha_fin: Optional[str] = None,
    fechas: Optional[str] = None,
    modalidad: Optional[str] = None,
    estado: Optional[str] = None,
    id_eventos: Optional[Union[str, List[int]]] = None,
) -> Dict[str, Any]:
    """Obtiene estadísticas y KPIs globales o recalculados sobre el subconjunto de eventos filtrados (Solo ADMIN/ORGANIZADOR)."""
    ensure_roles(current_user.rol, ADMIN_OR_ORGANIZER_ROLES, "No tienes privilegios para consultar estadísticas")

    base_stats = get_dashboard_stats(
        db=db,
        user_id=current_user.id_usuario,
        role=current_user.rol,
        nombres=current_user.nombres
    )

    # Procesar rango de fechas si viene en string único
    if fechas and (not fecha_inicio or not fecha_fin):
        parts = [p.strip() for p in fechas.split(",") if p.strip()]
        if len(parts) >= 1 and not fecha_inicio:
            fecha_inicio = parts[0]
        if len(parts) >= 2 and not fecha_fin:
            fecha_fin = parts[1]

    dt_inicio = _parse_date(fecha_inicio)
    dt_fin = _parse_date(fecha_fin)
    if dt_fin and isinstance(dt_fin, datetime) and dt_fin.hour == 0 and dt_fin.minute == 0:
        dt_fin = dt_fin.replace(hour=23, minute=59, second=59)

    parsed_ids = []
    if id_eventos:
        if isinstance(id_eventos, str):
            parsed_ids = [int(x.strip()) for x in id_eventos.split(",") if x.strip().isdigit()]
        elif isinstance(id_eventos, (list, tuple)):
            parsed_ids = [int(x) for x in id_eventos if str(x).isdigit()]

    # Construir filtros en conjunción AND
    event_filters = []
    filtros_activos = {}

    if q and q.strip():
        term = f"%{q.strip()}%"
        event_filters.append(or_(models.Evento.titulo.ilike(term), models.Evento.descripcion.ilike(term)))
        filtros_activos["q"] = q.strip()

    if dt_inicio:
        event_filters.append(models.Evento.fecha_inicio >= dt_inicio)
        filtros_activos["fecha_inicio"] = fecha_inicio

    if dt_fin:
        event_filters.append(models.Evento.fecha_inicio <= dt_fin)
        filtros_activos["fecha_fin"] = fecha_fin

    if modalidad and modalidad.strip().upper() not in ["TODOS", "ALL", ""]:
        event_filters.append(func.upper(models.Evento.modalidad) == modalidad.strip().upper())
        filtros_activos["modalidad"] = modalidad.strip()

    if estado and estado.strip().upper() not in ["TODOS", "ALL", ""]:
        event_filters.append(func.upper(models.Evento.estado) == estado.strip().upper())
        filtros_activos["estado"] = estado.strip()

    if parsed_ids:
        event_filters.append(models.Evento.id_evento.in_(parsed_ids))
        filtros_activos["id_eventos"] = parsed_ids

    is_filtered = len(event_filters) > 0

    if not is_filtered:
        # Métricas Globales (sin filtros)
        total_eventos = int(_safe_value(lambda: db.query(func.count(models.Evento.id_evento)).scalar(), 0))
        total_miembros = int(_safe_value(lambda: db.query(func.count(models.Usuario.id_usuario)).scalar(), 0))
        miembros_activos = int(_safe_value(lambda: db.query(func.count(models.Usuario.id_usuario)).filter(models.Usuario.activo.is_(True)).scalar(), total_miembros))
        
        total_inscripciones_eventos = int(_safe_value(lambda: db.query(func.count(models.InscripcionEvento.id_inscripcion)).scalar(), 0))
        total_asistencias_eventos = int(_safe_value(lambda: db.query(func.count(models.InscripcionEvento.id_inscripcion)).filter(models.InscripcionEvento.asistio.is_(True)).scalar(), 0))
        tasa_conversion_asistencia = round((total_asistencias_eventos / total_inscripciones_eventos) * 100, 2) if total_inscripciones_eventos else 0

        eventos_list = _safe_value(
            lambda: db.query(models.Evento).order_by(models.Evento.fecha_inicio.desc()).limit(12).all(),
            [],
        )
        asistencia_series = []
        for e in reversed(eventos_list):
            inscritos = len(getattr(e, "inscripciones", []) or [])
            asistentes = sum(1 for i in (getattr(e, "inscripciones", []) or []) if getattr(i, "asistio", False))
            capacidad = int(getattr(e, "capacidad_max", 0) or 0)
            asistencia_series.append({
                "id_evento": int(getattr(e, "id_evento", 0) or 0),
                "name": str(getattr(e, "titulo", "Evento"))[:20],
                "evento": str(getattr(e, "titulo", "Evento")),
                "inscritos": inscritos,
                "asistentes": asistentes,
                "ausentes": max(inscritos - asistentes, 0),
                "capacidad": capacidad,
                "ocupacion": round((inscritos / capacidad) * 100, 1) if capacidad else 0,
                "tasa": round((asistentes / inscritos) * 100, 1) if inscritos else 0,
            })

        talleres_rows = _safe_value(
            lambda: db.query(models.Evento.modalidad, func.count(models.Evento.id_evento)).group_by(models.Evento.modalidad).all(),
            [],
        )
        talleres_por_modalidad = [{"modalidad": r[0] or "No definido", "cantidad": int(r[1] or 0)} for r in talleres_rows]

        estados_evento_rows = _safe_value(
            lambda: db.query(models.Evento.estado, func.count(models.Evento.id_evento)).group_by(models.Evento.estado).all(),
            [],
        )
        eventos_por_estado = [{"estado": r[0] or "SIN_ESTADO", "cantidad": int(r[1] or 0)} for r in estados_evento_rows]

        pagos_estado_rows = _safe_value(
            lambda: db.query(models.Pago.estado_pago, func.count(models.Pago.id_pago), func.sum(models.Pago.monto))
            .group_by(models.Pago.estado_pago).all(),
            [],
        )
        pagos_por_estado = [{"estado": r[0] or "SIN_ESTADO", "cantidad": int(r[1] or 0), "monto": float(r[2] or 0)} for r in pagos_estado_rows]

        compras_metodo_rows = _safe_value(
            lambda: db.query(models.Pago.metodo_pago, func.count(models.Pago.id_pago), func.sum(models.Pago.monto))
            .filter(models.Pago.estado_pago == "APROBADO")
            .group_by(models.Pago.metodo_pago).all(),
            [],
        )
        compras_por_metodo = [{"metodo": r[0] or "OTRO", "cantidad": int(r[1] or 0), "monto": float(r[2] or 0)} for r in compras_metodo_rows]

        ingresos_totales = float(_safe_value(lambda: db.query(func.sum(models.Pago.monto)).filter(models.Pago.estado_pago == "APROBADO").scalar(), 0) or 0)
        total_pagos = int(_safe_value(lambda: db.query(func.count(models.Pago.id_pago)).scalar(), 0))

        # Actividad mensual global
        month_users = defaultdict(int)
        month_event_ins = defaultdict(int)
        month_compras = defaultdict(int)
        month_pagos_monto = defaultdict(float)

        for row in _safe_value(lambda: db.query(models.Usuario.fecha_registro).all(), []):
            k = _month_key(row[0])
            if k: month_users[k] += 1
        for row in _safe_value(lambda: db.query(models.InscripcionEvento.fecha_inscripcion).all(), []):
            k = _month_key(row[0])
            if k: month_event_ins[k] += 1
        for row in _safe_value(lambda: db.query(models.Pedido.fecha_pedido).all(), []):
            k = _month_key(row[0])
            if k: month_compras[k] += 1
        for fecha, monto, estado_pago in _safe_value(lambda: db.query(models.Pago.fecha_pago, models.Pago.monto, models.Pago.estado_pago).all(), []):
            k = _month_key(fecha)
            if k and estado_pago == "APROBADO":
                month_pagos_monto[k] += float(monto or 0)

        all_months = sorted(set(month_users) | set(month_event_ins) | set(month_compras) | set(month_pagos_monto))
        actividad_mensual = [
            {
                "mes": m,
                "usuarios_nuevos": month_users.get(m, 0),
                "inscripciones_eventos": month_event_ins.get(m, 0),
                "compras": month_compras.get(m, 0),
                "monto_pagado_aprobado": round(month_pagos_monto.get(m, 0.0), 2)
            }
            for m in all_months
        ]

    else:
        # Métricas Filtradas sobre el subconjunto de eventos (Conjunción AND)
        filtered_events = db.query(models.Evento).filter(and_(*event_filters)).order_by(models.Evento.fecha_inicio.asc()).all()
        filtered_event_ids = [e.id_evento for e in filtered_events]
        total_eventos = len(filtered_events)

        if filtered_event_ids:
            ins_list = db.query(models.InscripcionEvento).filter(models.InscripcionEvento.id_evento.in_(filtered_event_ids)).all()
            total_inscripciones_eventos = len(ins_list)
            total_asistencias_eventos = sum(1 for i in ins_list if i.asistio)
            tasa_conversion_asistencia = round((total_asistencias_eventos / total_inscripciones_eventos) * 100, 2) if total_inscripciones_eventos else 0

            distinct_uids = list(set([i.id_usuario for i in ins_list]))
            total_miembros = len(distinct_uids)
            attended_uids = list(set([i.id_usuario for i in ins_list if i.asistio]))
            miembros_activos = len(attended_uids)

            asistencia_series = []
            for e in filtered_events:
                inscritos = len(getattr(e, "inscripciones", []) or [])
                asistentes = sum(1 for i in (getattr(e, "inscripciones", []) or []) if getattr(i, "asistio", False))
                capacidad = int(getattr(e, "capacidad_max", 0) or 0)
                asistencia_series.append({
                    "id_evento": int(getattr(e, "id_evento", 0) or 0),
                    "name": str(getattr(e, "titulo", "Evento"))[:20],
                    "evento": str(getattr(e, "titulo", "Evento")),
                    "inscritos": inscritos,
                    "asistentes": asistentes,
                    "ausentes": max(inscritos - asistentes, 0),
                    "capacidad": capacidad,
                    "ocupacion": round((inscritos / capacidad) * 100, 1) if capacidad else 0,
                    "tasa": round((asistentes / inscritos) * 100, 1) if inscritos else 0,
                })

            mod_counts = defaultdict(int)
            est_counts = defaultdict(int)
            for e in filtered_events:
                mod_counts[e.modalidad or "No definido"] += 1
                est_counts[e.estado or "SIN_ESTADO"] += 1

            talleres_por_modalidad = [{"modalidad": k, "cantidad": v} for k, v in mod_counts.items()]
            eventos_por_estado = [{"estado": k, "cantidad": v} for k, v in est_counts.items()]

            # Pagos vinculados al subconjunto
            ins_pago_ids = [i.id_pago for i in ins_list if i.id_pago is not None]
            ref_pagos = db.query(models.Pago.id_pago).filter(
                models.Pago.id_referencia.in_(filtered_event_ids),
                func.upper(models.Pago.tipo_referencia) == 'EVENTO'
            ).all()
            ref_pago_ids = [p[0] for p in ref_pagos]
            matched_pago_ids = list(set(ins_pago_ids + ref_pago_ids))

            if matched_pago_ids:
                pagos_db = db.query(models.Pago).filter(models.Pago.id_pago.in_(matched_pago_ids)).all()
                ingresos_totales = float(sum(p.monto or 0 for p in pagos_db if p.estado_pago == "APROBADO"))
                total_pagos = len(pagos_db)
                
                p_est = defaultdict(lambda: {"cantidad": 0, "monto": 0.0})
                p_met = defaultdict(lambda: {"cantidad": 0, "monto": 0.0})
                month_pagos_monto = defaultdict(float)

                for p in pagos_db:
                    st = p.estado_pago or "SIN_ESTADO"
                    p_est[st]["cantidad"] += 1
                    p_est[st]["monto"] += float(p.monto or 0)
                    if p.estado_pago == "APROBADO":
                        met = p.metodo_pago or "OTRO"
                        p_met[met]["cantidad"] += 1
                        p_met[met]["monto"] += float(p.monto or 0)
                        mk = _month_key(p.fecha_pago)
                        if mk:
                            month_pagos_monto[mk] += float(p.monto or 0)

                pagos_por_estado = [{"estado": k, "cantidad": v["cantidad"], "monto": v["monto"]} for k, v in p_est.items()]
                compras_por_metodo = [{"metodo": k, "cantidad": v["cantidad"], "monto": v["monto"]} for k, v in p_met.items()]
            else:
                ingresos_totales = 0.0
                total_pagos = 0
                pagos_por_estado = []
                compras_por_metodo = []
                month_pagos_monto = defaultdict(float)

            month_ins = defaultdict(int)
            for i in ins_list:
                mk = _month_key(i.fecha_inscripcion)
                if mk: month_ins[mk] += 1
            
            sub_months = sorted(set(month_ins) | set(month_pagos_monto))
            actividad_mensual = [
                {
                    "mes": m,
                    "usuarios_nuevos": 0,
                    "inscripciones_eventos": month_ins.get(m, 0),
                    "compras": 0,
                    "monto_pagado_aprobado": round(month_pagos_monto.get(m, 0.0), 2)
                }
                for m in sub_months
            ]

        else:
            total_inscripciones_eventos = 0
            total_asistencias_eventos = 0
            tasa_conversion_asistencia = 0.0
            total_miembros = 0
            miembros_activos = 0
            asistencia_series = []
            talleres_por_modalidad = []
            eventos_por_estado = []
            ingresos_totales = 0.0
            total_pagos = 0
            pagos_por_estado = []
            compras_por_metodo = []
            actividad_mensual = []

    # Cursos & Souvenirs globales (contexto complementario)
    total_cursos = int(_safe_value(lambda: db.query(func.count(models.Curso.id_curso)).scalar(), 0))
    total_badges_otorgados = int(_safe_value(lambda: db.query(func.count(models.UsuarioBadge.id_usuario_badge)).scalar(), 0))
    total_inscripciones_cursos = int(_safe_value(lambda: db.query(models.InscripcionCurso).count(), 0))
    cursos_finalizados = int(_safe_value(lambda: db.query(models.InscripcionCurso).filter(models.InscripcionCurso.finalizado.is_(True)).count(), 0))
    tasa_finalizacion_cursos = round((cursos_finalizados / total_inscripciones_cursos) * 100, 2) if total_inscripciones_cursos else 0

    total_compras = int(_safe_value(lambda: db.query(func.count(models.Pedido.id_pedido)).scalar(), 0))
    ingresos_souvenirs = float(_safe_value(lambda: db.query(func.sum(models.Pedido.total)).scalar(), 0) or 0)
    ventas_souvenirs = int(_safe_value(lambda: db.query(func.sum(models.PedidoDetalle.cantidad)).scalar(), 0) or 0)
    ticket_promedio_compra = round((ingresos_souvenirs / total_compras), 2) if total_compras else 0

    horas_formacion_ofertadas = int(_safe_value(lambda: db.query(func.sum(models.Curso.horas_academicas)).scalar(), 0) or 0)
    horas_formacion_estimadas = float(_safe_value(
        lambda: db.query(func.sum((models.InscripcionCurso.progreso / 100.0) * models.Curso.horas_academicas))
        .join(models.Curso, models.Curso.id_curso == models.InscripcionCurso.id_curso)
        .scalar(),
        0,
    ) or 0)

    top_productos_rows = _safe_value(
        lambda: db.query(
            models.Producto.nombre,
            func.sum(models.PedidoDetalle.cantidad).label("unidades"),
            func.sum(models.PedidoDetalle.cantidad * models.PedidoDetalle.precio_unitario).label("monto"),
        )
        .join(models.PedidoDetalle, models.PedidoDetalle.id_producto == models.Producto.id_producto)
        .group_by(models.Producto.id_producto)
        .order_by(func.sum(models.PedidoDetalle.cantidad).desc())
        .limit(10)
        .all(),
        [],
    )
    top_productos = [{"producto": r[0], "unidades": int(r[1] or 0), "monto": float(r[2] or 0)} for r in top_productos_rows]

    segmentacion_rows = _safe_value(
        lambda: db.query(models.Usuario.tipo_entidad, func.count(models.Usuario.id_usuario)).group_by(models.Usuario.tipo_entidad).all(),
        [],
    )
    segmentacion = [{"tipo": r[0] or "Otros", "cantidad": int(r[1] or 0)} for r in segmentacion_rows]

    roles_rows = _safe_value(
        lambda: db.query(models.Usuario.rol, func.count(models.Usuario.id_usuario)).group_by(models.Usuario.rol).all(),
        [],
    )
    roles = [{"rol": r[0] or "SIN_ROL", "cantidad": int(r[1] or 0)} for r in roles_rows]

    geografia_rows = _safe_value(
        lambda: db.query(models.Usuario.departamento, func.count(models.Usuario.id_usuario))
        .filter(models.Usuario.pais == "Bolivia")
        .group_by(models.Usuario.departamento)
        .all(),
        [],
    )
    geografia = [{"depto": r[0] or "Otros", "cantidad": int(r[1] or 0)} for r in geografia_rows]

    kpis = {
        "total_miembros": total_miembros,
        "miembros_activos": miembros_activos,
        "total_eventos": total_eventos,
        "total_cursos": total_cursos,
        "total_badges_otorgados": total_badges_otorgados,
        "total_inscripciones_eventos": total_inscripciones_eventos,
        "total_asistencias_eventos": total_asistencias_eventos,
        "tasa_conversion_asistencia": tasa_conversion_asistencia,
        "total_inscripciones_cursos": total_inscripciones_cursos,
        "cursos_finalizados": cursos_finalizados,
        "tasa_finalizacion_cursos": tasa_finalizacion_cursos,
        "ingresos_totales": ingresos_totales,
        "total_pagos": total_pagos,
        "total_compras": total_compras,
        "ingresos_souvenirs": ingresos_souvenirs,
        "ventas_souvenirs": ventas_souvenirs,
        "ticket_promedio_compra": ticket_promedio_compra,
        "horas_formacion_ofertadas": horas_formacion_ofertadas,
        "horas_formacion_estimadas": horas_formacion_estimadas
    }

    result = {
        **base_stats,
        "is_filtered": is_filtered,
        "indicador_filtrado": "KPIs filtrados" if is_filtered else "Globales",
        "filtros_aplicados": filtros_activos,
        "kpis": kpis,
        "asistencia_series": asistencia_series,
        "talleres_por_modalidad": talleres_por_modalidad,
        "eventos_por_estado": eventos_por_estado,
        "pagos_por_estado": pagos_por_estado,
        "compras_por_metodo": compras_por_metodo,
        "top_productos": top_productos,
        "actividad_mensual": actividad_mensual,
        "segmentacion": segmentacion,
        "roles": roles,
        "geografia": geografia,
    }

    return result

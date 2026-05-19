import logging
from collections import defaultdict
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..api.auth import get_current_user
from ..core.permissions import PERMISSION_AUDIT_READ, has_permission
from ..database import get_db
from ..models import models

router = APIRouter(prefix="/reports", tags=["reports"])
logger = logging.getLogger(__name__)


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
    except Exception as exc:
        logger.warning("reports: query fallback -> %s", exc)
        return default


@router.get("/dashboard-stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user),
):
    if not has_permission(current_user.rol, PERMISSION_AUDIT_READ):
        return {
            "kpis": {
                "total_miembros": 0, "miembros_activos": 0, "total_eventos": 0, "total_cursos": 0,
                "total_badges_otorgados": 0, "ingresos_totales": 0, "total_pagos": 0,
                "tasa_conversion_asistencia": 0, "total_inscripciones_eventos": 0,
                "total_asistencias_eventos": 0, "total_inscripciones_cursos": 0, "cursos_finalizados": 0,
                "tasa_finalizacion_cursos": 0, "total_compras": 0, "ingresos_souvenirs": 0,
                "ticket_promedio_compra": 0, "ventas_souvenirs": 0, "horas_formacion_ofertadas": 0,
                "horas_formacion_estimadas": 0,
            },
            "segmentacion": [], "roles": [], "geografia": [], "rendimiento_cursos": [],
            "asistencia_series": [], "inscripciones_por_evento": [], "talleres_por_modalidad": [],
            "eventos_por_estado": [], "pagos_por_estado": [], "compras_por_metodo": [],
            "top_productos": [], "actividad_mensual": [], "crecimiento_comunidad": [],
        }

    total_miembros = int(_safe_value(lambda: db.query(func.count(models.Usuario.id_usuario)).scalar(), 0))
    miembros_activos = int(_safe_value(lambda: db.query(func.count(models.Usuario.id_usuario)).filter(models.Usuario.activo.is_(True)).scalar(), total_miembros))
    total_eventos = int(_safe_value(lambda: db.query(func.count(models.Evento.id_evento)).scalar(), 0))
    total_cursos = int(_safe_value(lambda: db.query(func.count(models.Curso.id_curso)).scalar(), 0))
    total_badges_otorgados = int(_safe_value(lambda: db.query(func.count(models.UsuarioBadge.id_usuario_badge)).scalar(), 0))

    total_inscripciones_eventos = int(_safe_value(lambda: db.query(func.count(models.InscripcionEvento.id_inscripcion)).scalar(), 0))
    total_asistencias_eventos = int(_safe_value(lambda: db.query(func.count(models.InscripcionEvento.id_inscripcion)).filter(models.InscripcionEvento.asistio.is_(True)).scalar(), 0))
    tasa_conversion_asistencia = round((total_asistencias_eventos / total_inscripciones_eventos) * 100, 2) if total_inscripciones_eventos else 0

    total_inscripciones_cursos = int(_safe_value(lambda: db.query(models.InscripcionCurso).count(), 0))
    cursos_finalizados = int(_safe_value(lambda: db.query(models.InscripcionCurso).filter(models.InscripcionCurso.finalizado.is_(True)).count(), 0))
    tasa_finalizacion_cursos = round((cursos_finalizados / total_inscripciones_cursos) * 100, 2) if total_inscripciones_cursos else 0

    ingresos_totales = float(_safe_value(lambda: db.query(func.sum(models.Pago.monto)).filter(models.Pago.estado_pago == "APROBADO").scalar(), 0) or 0)
    total_pagos = int(_safe_value(lambda: db.query(func.count(models.Pago.id_pago)).scalar(), 0))

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
        .group_by(models.Pago.estado_pago)
        .all(),
        [],
    )
    pagos_por_estado = [{"estado": r[0] or "SIN_ESTADO", "cantidad": int(r[1] or 0), "monto": float(r[2] or 0)} for r in pagos_estado_rows]

    compras_metodo_rows = _safe_value(
        lambda: db.query(models.Pago.metodo_pago, func.count(models.Pago.id_pago), func.sum(models.Pago.monto))
        .filter(models.Pago.estado_pago == "APROBADO")
        .group_by(models.Pago.metodo_pago)
        .all(),
        [],
    )
    compras_por_metodo = [{"metodo": r[0] or "OTRO", "cantidad": int(r[1] or 0), "monto": float(r[2] or 0)} for r in compras_metodo_rows]

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

    crecimiento_comunidad = []
    actividad_mensual = []
    month_users = defaultdict(int)
    month_event_ins = defaultdict(int)
    month_compras = defaultdict(int)
    month_badges = defaultdict(int)
    month_pagos_count = defaultdict(int)
    month_pagos_monto = defaultdict(float)

    for row in _safe_value(lambda: db.query(models.Usuario.fecha_registro).all(), []):
        key = _month_key(row[0])
        if key:
            month_users[key] += 1
    for row in _safe_value(lambda: db.query(models.InscripcionEvento.fecha_inscripcion).all(), []):
        key = _month_key(row[0])
        if key:
            month_event_ins[key] += 1
    for row in _safe_value(lambda: db.query(models.Pedido.fecha_pedido).all(), []):
        key = _month_key(row[0])
        if key:
            month_compras[key] += 1
    for row in _safe_value(lambda: db.query(models.UsuarioBadge.fecha_obtencion).all(), []):
        key = _month_key(row[0])
        if key:
            month_badges[key] += 1
    for fecha, monto, estado in _safe_value(lambda: db.query(models.Pago.fecha_pago, models.Pago.monto, models.Pago.estado_pago).all(), []):
        key = _month_key(fecha)
        if not key:
            continue
        month_pagos_count[key] += 1
        if estado == "APROBADO":
            month_pagos_monto[key] += float(monto or 0)

    all_months = sorted(set(month_users) | set(month_event_ins) | set(month_compras) | set(month_badges) | set(month_pagos_count))
    acumulado = 0
    for month in all_months:
        nuevos = int(month_users.get(month, 0))
        acumulado += nuevos
        crecimiento_comunidad.append({"mes": month, "miembros": acumulado, "nuevos": nuevos})
        actividad_mensual.append({
            "mes": month,
            "usuarios_nuevos": nuevos,
            "inscripciones_eventos": int(month_event_ins.get(month, 0)),
            "compras": int(month_compras.get(month, 0)),
            "badges_otorgados": int(month_badges.get(month, 0)),
            "pagos_registrados": int(month_pagos_count.get(month, 0)),
            "monto_pagado_aprobado": round(float(month_pagos_monto.get(month, 0)), 2),
        })

    rendimiento_cursos_rows = _safe_value(
        lambda: db.query(
            models.Curso.nombre_curso,
            models.Curso.horas_academicas,
            func.count(models.InscripcionCurso.id_inscripcion_curso).label("inscritos"),
            func.count(func.nullif(models.InscripcionCurso.finalizado == False, True)).label("finalizados"),
            func.count(func.nullif(models.InscripcionCurso.nota_final < 51, True)).label("aprobados"),
            func.count(func.nullif(models.InscripcionCurso.nota_final >= 51, True)).label("reprobados"),
            func.avg(models.InscripcionCurso.progreso).label("progreso"),
        )
        .outerjoin(models.InscripcionCurso, models.InscripcionCurso.id_curso == models.Curso.id_curso)
        .group_by(models.Curso.id_curso)
        .all(),
        [],
    )

    rendimiento_cursos = []
    for r in rendimiento_cursos_rows:
        inscritos = int(r[2] or 0)
        finalizados = int(r[3] or 0)
        aprobados = int(r[4] or 0)
        reprobados = int(r[5] or 0)
        rendimiento_cursos.append({
            "curso": r[0],
            "horas": int(r[1] or 0),
            "inscritos": inscritos,
            "finalizados": finalizados,
            "aprobados": aprobados,
            "reprobados": reprobados,
            "progreso_promedio": round(float(r[6] or 0), 1),
            "ratio_aprobacion": round((aprobados / inscritos) * 100, 1) if inscritos else 0,
            "ratio_finalizacion": round((finalizados / inscritos) * 100, 1) if inscritos else 0,
        })

    return {
        "kpis": {
            "total_miembros": total_miembros,
            "miembros_activos": miembros_activos,
            "total_eventos": total_eventos,
            "total_cursos": total_cursos,
            "total_badges_otorgados": total_badges_otorgados,
            "ingresos_totales": ingresos_totales,
            "total_pagos": total_pagos,
            "tasa_conversion_asistencia": tasa_conversion_asistencia,
            "total_inscripciones_eventos": total_inscripciones_eventos,
            "total_asistencias_eventos": total_asistencias_eventos,
            "total_inscripciones_cursos": total_inscripciones_cursos,
            "cursos_finalizados": cursos_finalizados,
            "tasa_finalizacion_cursos": tasa_finalizacion_cursos,
            "total_compras": total_compras,
            "ingresos_souvenirs": round(ingresos_souvenirs, 2),
            "ticket_promedio_compra": ticket_promedio_compra,
            "ventas_souvenirs": ventas_souvenirs,
            "horas_formacion_ofertadas": horas_formacion_ofertadas,
            "horas_formacion_estimadas": round(horas_formacion_estimadas, 1),
        },
        "segmentacion": segmentacion,
        "roles": roles,
        "geografia": geografia,
        "rendimiento_cursos": rendimiento_cursos,
        "asistencia_series": asistencia_series,
        "inscripciones_por_evento": [
            {"evento": row["evento"], "inscritos": row["inscritos"], "asistentes": row["asistentes"], "tasa": row["tasa"]}
            for row in asistencia_series
        ],
        "talleres_por_modalidad": talleres_por_modalidad,
        "eventos_por_estado": eventos_por_estado,
        "pagos_por_estado": pagos_por_estado,
        "compras_por_metodo": compras_por_metodo,
        "top_productos": top_productos,
        "actividad_mensual": actividad_mensual,
        "crecimiento_comunidad": crecimiento_comunidad,
    }

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from ..database import get_db
from ..models import models
from ..api.auth import get_current_user
from ..core.permissions import PERMISSION_AUDIT_READ, ensure_permission
from datetime import datetime, timedelta

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/dashboard-stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    ensure_permission(current_user.rol, PERMISSION_AUDIT_READ, "Acceso denegado a reportes")

    # 1. KPIs Generales
    total_miembros = db.query(func.count(models.Usuario.id_usuario)).scalar()
    ingresos = db.query(func.sum(models.Pago.monto)).filter(models.Pago.estado_pago == "APROBADO").scalar() or 0
    total_inscritos = db.query(func.count(models.InscripcionEvento.id_inscripcion)).scalar() or 0
    total_asistentes = db.query(func.count(models.InscripcionEvento.id_inscripcion)).filter(models.InscripcionEvento.asistio == True).scalar() or 0
    
    tasa_conversion = round((total_asistentes / total_inscritos * 100), 2) if total_inscritos > 0 else 0

    # 2. Segmentación: Estudiante vs Profesional
    segmentacion = db.query(
        models.Usuario.tipo_entidad, 
        func.count(models.Usuario.id_usuario)
    ).group_by(models.Usuario.tipo_entidad).all()
    
    segmentacion_data = [{"tipo": s[0] or "Otros", "cantidad": s[1]} for s in segmentacion]

    # 3. Distribución Geográfica (Departamentos de Bolivia)
    geografia = db.query(
        models.Usuario.departamento, 
        func.count(models.Usuario.id_usuario)
    ).filter(models.Usuario.pais == "Bolivia").group_by(models.Usuario.departamento).all()
    
    geografia_data = [{"depto": g[0] or "Otros", "cantidad": g[1]} for g in geografia]

    # 4. Rendimiento Académico por Curso
    cursos_stats = db.query(
        models.Curso.nombre_curso,
        func.count(models.InscripcionCurso.id_inscripcion).label("total"),
        func.count(case((models.InscripcionCurso.nota_final >= 51, 1))).label("aprobados"),
        func.count(case((models.InscripcionCurso.nota_final < 51, 1))).label("reprobados")
    ).join(models.InscripcionCurso, isouter=True).group_by(models.Curso.id_curso).all()

    rendimiento_cursos = [
        {
            "curso": c[0],
            "total": c[1],
            "aprobados": c[2],
            "reprobados": c[3],
            "ratio": round((c[2]/c[1]*100), 1) if c[1] > 0 else 0
        } for c in cursos_stats
    ]

    # 5. Ventas de Souvenirs (Detallado)
    total_items_vendidos = db.query(func.sum(models.PedidoDetalle.cantidad)).scalar() or 0

    # 6. Series de Asistencia (Últimos 10 eventos)
    eventos = db.query(models.Evento).order_by(models.Evento.fecha_inicio.desc()).limit(10).all()
    asistencia_series = []
    for e in eventos:
        ins = len(e.inscripciones)
        asi = sum(1 for i in e.inscripciones if i.asistio)
        asistencia_series.append({
            "name": e.titulo[:20],
            "inscritos": ins,
            "asistentes": asi,
            "ausentes": ins - asi,
            "tasa": round((asi/ins*100), 1) if ins > 0 else 0
        })

    # 7. Crecimiento Real de Comunidad (Mes a Mes)
    # Agrupamos por año y mes
    crecimiento = db.query(
        func.to_char(models.Usuario.fecha_registro, 'YYYY-MM').label('mes'),
        func.count(models.Usuario.id_usuario)
    ).group_by('mes').order_by('mes').all()

    crecimiento_comunidad = []
    acumulado = 0
    for c in crecimiento:
        acumulado += c[1]
        crecimiento_comunidad.append({"mes": c[0], "miembros": acumulado, "nuevos": c[1]})

    return {
        "kpis": {
            "total_miembros": total_miembros,
            "ingresos_totales": float(ingresos),
            "tasa_conversion_asistencia": tasa_conversion,
            "total_eventos": len(eventos),
            "ventas_souvenirs": int(total_items_vendidos)
        },
        "segmentacion": segmentacion_data,
        "geografia": geografia_data,
        "rendimiento_cursos": rendimiento_cursos,
        "asistencia_series": asistencia_series[::-1],
        "crecimiento_comunidad": crecimiento_comunidad
    }


import os
import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from typing import List

from ..models import models
from ..core.permissions import has_permission, PERMISSION_EVENTS_MANAGE
from ..core.exceptions import PermisoDenegadoError, ValidacionNegocioError

UPLOAD_DIR = "static/certificados/backgrounds"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR, exist_ok=True)

def generate_bulk_certificates(
    db: Session,
    admin_user: models.Usuario,
    tipo: str, # EVENTO o CURSO
    id_referencia: int,
    criterio: str, # TODOS, ASISTIERON, APROBADOS
    titulo_certificado: str,
    background_path: str,
    firmas_paths: List[str]
):
    if not has_permission(admin_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError("No tienes permisos para generar certificados")

    usuarios_ids = []

    if tipo == 'EVENTO':
        query = db.query(models.InscripcionEvento).filter(models.InscripcionEvento.id_evento == id_referencia)
        if criterio == 'ASISTIERON':
            query = query.filter(models.InscripcionEvento.asistio == True)
        elif criterio == 'TODOS':
            # Solo los confirmados
            query = query.filter(models.InscripcionEvento.estado_inscripcion == "CONFIRMADA")

        inscripciones = query.all()
        usuarios_ids = [ins.id_usuario for ins in inscripciones]

    elif tipo == 'CURSO':
        query = db.query(models.InscripcionCurso).filter(models.InscripcionCurso.id_curso == id_referencia)
        if criterio == 'APROBADOS':
            query = query.filter(models.InscripcionCurso.completado == True)

        inscripciones = query.all()
        usuarios_ids = [ins.id_usuario for ins in inscripciones]

    else:
        raise ValidacionNegocioError("Tipo de referencia inválido. Debe ser EVENTO o CURSO")

    if not usuarios_ids:
        raise ValidacionNegocioError("No se encontraron usuarios que cumplan el criterio seleccionado")

    certificados_creados = 0

    for uid in usuarios_ids:
        # Check si ya existe para evitar duplicados
        query_existente = db.query(models.Certificado).filter(models.Certificado.id_usuario == uid)
        if tipo == 'EVENTO':
            query_existente = query_existente.filter(models.Certificado.id_evento == id_referencia)
        else:
            query_existente = query_existente.filter(models.Certificado.id_curso == id_referencia)

        if query_existente.first():
            continue # Ya tiene certificado

        codigo_verificacion = f"MEH-{datetime.utcnow().year}-{str(uuid.uuid4().hex[:8]).upper()}"

        # En una arquitectura real, aquí llamaríamos a un worker asíncrono para generar el PDF.
        # Por ahora, guardamos la metadata del certificado que será usada por el frontend
        # (motor jsPDF) para renderizar o mostrar.

        nuevo_certificado = models.Certificado(
            id_usuario=uid,
            id_curso=id_referencia if tipo == 'CURSO' else None,
            id_evento=id_referencia if tipo == 'EVENTO' else None,
            uuid_verificacion=str(uuid.uuid4()),
            codigo_verificacion=codigo_verificacion,
            url_pdf="generado_dinamicamente",
            formato="DIGITAL",
            metadata_adicional=f"Fondo: {background_path} | Firmas: {len(firmas_paths)}"
        )
        db.add(nuevo_certificado)
        certificados_creados += 1

    db.commit()

    # Registramos la auditoría
    from ..core.logging import registrar_log
    registrar_log(
        db=db,
        id_admin=admin_user.id_usuario,
        accion="GENERACION_MASIVA_CERTIFICADOS",
        tabla_afectada="certificados",
        id_registro_afectado=0,
        valor_nuevo={"tipo": tipo, "id_referencia": id_referencia, "criterio": criterio, "cantidad_generada": certificados_creados},
        ip_direccion="127.0.0.1"
    )

    return {
        "status": "success",
        "mensaje": f"Se han generado {certificados_creados} certificados."
    }

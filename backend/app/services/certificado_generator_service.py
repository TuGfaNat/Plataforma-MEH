import os
import uuid
import json
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
    criterio: str, # TODOS, ASISTIERON, APROBADOS, SPEAKERS
    titulo_certificado: str,
    background_path: str,
    firmas_paths: List[str]
):
    if not has_permission(admin_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError("No tienes permisos para generar certificados")

    # 1. Si son SPEAKERS, devolvemos data para impresion directa en el cliente.
    #    (Puesto que en la DB el modelo Certificado exige id_usuario, y Speaker no siempre lo es)
    if criterio == 'SPEAKERS' and tipo == 'EVENTO':
        evento = db.query(models.Evento).filter(models.Evento.id_evento == id_referencia).first()
        if not evento:
            raise ValidacionNegocioError("Evento no encontrado")

        nombres_speakers = [sp.nombre for sp in evento.speakers]
        if not nombres_speakers:
            raise ValidacionNegocioError("Este evento no tiene speakers asignados")

        # Retornamos los nombres y rutas para que el frontend genere los PDFs en loop
        return {
            "status": "success",
            "modo": "IMPRESION_DIRECTA",
            "nombres": nombres_speakers,
            "background": background_path.replace("static/", "/static/"),
            "firmas": [f.replace("static/", "/static/") for f in firmas_paths],
            "titulo": titulo_certificado,
            "mensaje": f"Listos para imprimir certificados de {len(nombres_speakers)} speakers."
        }

    # 2. Generación normal para miembros inscritos
    usuarios_ids = []

    if tipo == 'EVENTO':
        query = db.query(models.InscripcionEvento).filter(models.InscripcionEvento.id_evento == id_referencia)
        if criterio == 'ASISTIERON':
            query = query.filter(models.InscripcionEvento.asistio == True)
        elif criterio == 'TODOS':
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

    metadata_json = json.dumps({
        "titulo": titulo_certificado,
        "background": background_path.replace("static/", "/static/"),
        "firmas": [f.replace("static/", "/static/") for f in firmas_paths]
    })

    for uid in usuarios_ids:
        query_existente = db.query(models.Certificado).filter(models.Certificado.id_usuario == uid)
        if tipo == 'EVENTO':
            query_existente = query_existente.filter(models.Certificado.id_evento == id_referencia)
        else:
            query_existente = query_existente.filter(models.Certificado.id_curso == id_referencia)

        if query_existente.first():
            continue

        codigo_verificacion = f"MEH-{datetime.utcnow().year}-{str(uuid.uuid4().hex[:8]).upper()}"

        nuevo_certificado = models.Certificado(
            id_usuario=uid,
            id_curso=id_referencia if tipo == 'CURSO' else None,
            id_evento=id_referencia if tipo == 'EVENTO' else None,
            uuid_verificacion=str(uuid.uuid4()),
            codigo_verificacion=codigo_verificacion,
            url_pdf="generado_dinamicamente",
            formato="DIGITAL",
            metadata_adicional=metadata_json
        )
        db.add(nuevo_certificado)
        certificados_creados += 1

    db.commit()

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
        "modo": "BD_REGISTRO",
        "mensaje": f"Se han generado {certificados_creados} certificados con éxito."
    }

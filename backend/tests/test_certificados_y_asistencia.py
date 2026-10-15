import pytest
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi import HTTPException

from app.models import models
from app.services import asistencia_service, certificado_generator_service
from app.core.exceptions import ValidacionNegocioError

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    models.Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

@pytest.fixture
def test_users(db_session):
    admin = models.Usuario(
        nombres="Admin",
        apellidos="Principal",
        correo="admin_cert@meh.com",
        rol="ADMIN",
        password_hash="hash"
    )
    user_aprobado_nota = models.Usuario(
        nombres="Juan",
        apellidos="AprobadoNota",
        correo="juan_aprobado@meh.com",
        rol="MIEMBRO",
        password_hash="hash"
    )
    user_aprobado_sin_nota = models.Usuario(
        nombres="Maria",
        apellidos="AprobadoSinNota",
        correo="maria_sin_nota@meh.com",
        rol="MIEMBRO",
        password_hash="hash"
    )
    user_reprobado = models.Usuario(
        nombres="Carlos",
        apellidos="Reprobado",
        correo="carlos_reprobado@meh.com",
        rol="MIEMBRO",
        password_hash="hash"
    )
    user_no_finalizado = models.Usuario(
        nombres="Ana",
        apellidos="NoFinalizado",
        correo="ana_nofin@meh.com",
        rol="MIEMBRO",
        password_hash="hash"
    )
    db_session.add_all([admin, user_aprobado_nota, user_aprobado_sin_nota, user_reprobado, user_no_finalizado])
    db_session.commit()
    return {
        "admin": admin,
        "aprobado_nota": user_aprobado_nota,
        "aprobado_sin_nota": user_aprobado_sin_nota,
        "reprobado": user_reprobado,
        "no_finalizado": user_no_finalizado
    }

def test_certificados_curso_regla_dual_aprobados(db_session, test_users):
    """Valida la regla dual de certificados APROBADOS en cursos:

    - finalizado=True y nota_final >= 61 -> Recibe certificado
    - finalizado=True y nota_final IS NULL -> Recibe certificado
    - finalizado=True y nota_final < 61 -> NO recibe certificado
    - finalizado=False -> NO recibe certificado
    """
    curso = models.Curso(
        nombre_curso="Curso de Arquitectura Cloud",
        descripcion="Curso completo con evaluacion",
        horas_academicas=40,
        estado="ACTIVO"
    )
    db_session.add(curso)
    db_session.commit()

    # 1. Alumno evaluado aprobado (nota >= 61)
    ins1 = models.InscripcionCurso(
        id_usuario=test_users["aprobado_nota"].id_usuario,
        id_curso=curso.id_curso,
        progreso=100,
        nota_final=85.0,
        finalizado=True,
        estado_inscripcion="CONFIRMADA"
    )
    # 2. Alumno no evaluado aprobado (sin nota, finalizado)
    ins2 = models.InscripcionCurso(
        id_usuario=test_users["aprobado_sin_nota"].id_usuario,
        id_curso=curso.id_curso,
        progreso=100,
        nota_final=None,
        finalizado=True,
        estado_inscripcion="CONFIRMADA"
    )
    # 3. Alumno reprobado (nota < 61)
    ins3 = models.InscripcionCurso(
        id_usuario=test_users["reprobado"].id_usuario,
        id_curso=curso.id_curso,
        progreso=100,
        nota_final=50.0,
        finalizado=True,
        estado_inscripcion="CONFIRMADA"
    )
    # 4. Alumno no finalizado
    ins4 = models.InscripcionCurso(
        id_usuario=test_users["no_finalizado"].id_usuario,
        id_curso=curso.id_curso,
        progreso=50,
        nota_final=90.0,
        finalizado=False,
        estado_inscripcion="CONFIRMADA"
    )
    db_session.add_all([ins1, ins2, ins3, ins4])
    db_session.commit()

    # Generar certificados bajo criterio APROBADOS
    resultado = certificado_generator_service.generate_bulk_certificates(
        db=db_session,
        admin_user=test_users["admin"],
        tipo="CURSO",
        id_referencia=curso.id_curso,
        criterio="APROBADOS",
        titulo_certificado="Certificado de Aprobacion Cloud",
        background_path="static/bg.png",
        firmas_paths=["static/firma1.png"]
    )

    assert resultado["status"] == "success"

    # Verificar certificados en BD
    certificados = db_session.query(models.Certificado).filter(
        models.Certificado.id_curso == curso.id_curso
    ).all()

    uids_con_certificado = [c.id_usuario for c in certificados]

    # Deben recibir certificado: aprobado con nota (85) y aprobado sin nota (None)
    assert test_users["aprobado_nota"].id_usuario in uids_con_certificado
    assert test_users["aprobado_sin_nota"].id_usuario in uids_con_certificado

    # NO deben recibir certificado: reprobado (50) ni no finalizado
    assert test_users["reprobado"].id_usuario not in uids_con_certificado
    assert test_users["no_finalizado"].id_usuario not in uids_con_certificado
    assert len(certificados) == 2

def test_certificados_curso_sin_aprobados_lanza_error_negocio(db_session, test_users):
    """Si ningún alumno cumple la regla de aprobación, debe lanzar ValidacionNegocioError sin 500."""
    curso = models.Curso(
        nombre_curso="Curso Reprobados",
        descripcion="Ningún aprobado",
        horas_academicas=20,
        estado="ACTIVO"
    )
    db_session.add(curso)
    db_session.commit()

    ins = models.InscripcionCurso(
        id_usuario=test_users["reprobado"].id_usuario,
        id_curso=curso.id_curso,
        progreso=100,
        nota_final=45.0,
        finalizado=True,
        estado_inscripcion="CONFIRMADA"
    )
    db_session.add(ins)
    db_session.commit()

    with pytest.raises(ValidacionNegocioError) as exc_info:
        certificado_generator_service.generate_bulk_certificates(
            db=db_session,
            admin_user=test_users["admin"],
            tipo="CURSO",
            id_referencia=curso.id_curso,
            criterio="APROBADOS",
            titulo_certificado="Certificado Imposible",
            background_path="static/bg.png",
            firmas_paths=[]
        )
    assert "No se encontraron usuarios que cumplan el criterio seleccionado" in str(exc_info.value)

def test_asistencia_curso_asigna_finalizado_y_progreso(db_session, test_users):
    """POST /asistencia/registrar tipo=CURSO asigna finalizado=True y progreso=100 sin columnas inexistentes."""
    curso = models.Curso(
        nombre_curso="Taller de Docker",
        descripcion="Taller practico",
        horas_academicas=8,
        estado="ACTIVO"
    )
    db_session.add(curso)
    db_session.commit()

    inscripcion = models.InscripcionCurso(
        id_usuario=test_users["aprobado_nota"].id_usuario,
        id_curso=curso.id_curso,
        progreso=20,
        finalizado=False,
        estado_inscripcion="CONFIRMADA"
    )
    db_session.add(inscripcion)
    db_session.commit()

    resultado = asistencia_service.registrar_asistencia_universal(
        db=db_session,
        current_user=test_users["admin"],
        tipo="CURSO",
        id_actividad=curso.id_curso,
        id_usuario=test_users["aprobado_nota"].id_usuario
    )

    assert resultado["status"] == "success"
    assert "Asistencia confirmada" in resultado["mensaje"]

    db_session.refresh(inscripcion)
    assert inscripcion.finalizado is True
    assert inscripcion.progreso == 100

def test_asistencia_evento_permanece_intacto(db_session, test_users):
    """POST /asistencia/registrar tipo=EVENTO mantiene el flujo existente de asistio y fecha_validacion."""
    evento = models.Evento(
        titulo="Conferencia Anual MEH 2026",
        descripcion="Conferencia Magistral",
        tipo_evento="CONFERENCIA",
        modalidad="PRESENCIAL",
        fecha_inicio=datetime.utcnow(),
        capacidad_max=100,
        estado="PROGRAMADO"
    )
    db_session.add(evento)
    db_session.commit()

    inscripcion = models.InscripcionEvento(
        id_usuario=test_users["aprobado_nota"].id_usuario,
        id_evento=evento.id_evento,
        asistio=False,
        estado_inscripcion="CONFIRMADA"
    )
    db_session.add(inscripcion)
    db_session.commit()

    resultado = asistencia_service.registrar_asistencia_universal(
        db=db_session,
        current_user=test_users["admin"],
        tipo="EVENTO",
        id_actividad=evento.id_evento,
        id_usuario=test_users["aprobado_nota"].id_usuario
    )

    assert resultado["status"] == "success"
    assert "Asistencia confirmada" in resultado["mensaje"]

    db_session.refresh(inscripcion)
    assert inscripcion.asistio is True
    assert inscripcion.fecha_validacion is not None

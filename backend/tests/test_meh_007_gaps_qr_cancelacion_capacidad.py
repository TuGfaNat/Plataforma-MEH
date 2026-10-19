import pytest
import uuid
from unittest.mock import patch
from datetime import datetime, timezone, timedelta
from app.database import SessionLocal
from app.models import models
from app.services import eventos_service, inscripciones_service
from app.schemas import evento as evento_schema
from app.core.exceptions import ValidacionNegocioError, RecursoNoEncontradoError
from fastapi.testclient import TestClient
from main import app
from app.api.auth import get_current_user

@pytest.fixture
def db():
    session = SessionLocal()
    yield session
    session.close()

def _now():
    return datetime.now(timezone.utc).replace(tzinfo=None)

def test_capacidad_max_null_permite_inscripcion_sin_enlistar_a_todos(db):
    """
    MEH-007: Evento sin capacidad_max (NULL) no enlista a todos en lista de espera.
    Inscribe directamente como CONFIRMADA (gratuito) o PENDIENTE (de pago).
    """
    unique_id = uuid.uuid4().hex[:8]
    staff = models.Usuario(
        nombres="Admin",
        apellidos="Capacidad",
        correo=f"admin_cap_{unique_id}@meh.com",
        password_hash="pwd",
        rol="ADMIN"
    )
    user1 = models.Usuario(
        nombres="User1",
        apellidos="Capacidad",
        correo=f"user1_cap_{unique_id}@meh.com",
        password_hash="pwd",
        rol="MIEMBRO"
    )
    user2 = models.Usuario(
        nombres="User2",
        apellidos="Capacidad",
        correo=f"user2_cap_{unique_id}@meh.com",
        password_hash="pwd",
        rol="MIEMBRO"
    )
    db.add_all([staff, user1, user2])
    db.commit()
    for u in [staff, user1, user2]:
        db.refresh(u)

    evento = models.Evento(
        titulo=f"Evento Capacidad Ilimitada {unique_id}",
        descripcion="Evento sin capacidad maxima",
        fecha_inicio=_now() + timedelta(days=2),
        modalidad="VIRTUAL",
        capacidad_max=None,  # <-- NULL / Ilimitada
        id_organizador=staff.id_usuario,
        id_estado=2
    )
    db.add(evento)
    db.commit()
    db.refresh(evento)

    with patch("app.services.email_service.notify_ticket_qr") as mock_email:
        try:
            # Inscribir usuario 1 a evento gratuito con capacidad_max=None
            insc1 = inscripciones_service.inscribir_evento(db, user1.id_usuario, evento.id_evento)
            assert insc1.estado_inscripcion == "CONFIRMADA", "No debe enviarse a PENDIENTE_APROBACION si capacidad_max es None"
            assert insc1.codigo_qr is not None, "Debe tener QR asignado al estar confirmado"

            # Inscribir usuario 2 a evento gratuito con capacidad_max=None
            insc2 = inscripciones_service.inscribir_evento(db, user2.id_usuario, evento.id_evento)
            assert insc2.estado_inscripcion == "CONFIRMADA", "Segundo usuario tampoco debe ir a lista de espera"
            assert insc2.codigo_qr is not None

            # Verificar estadísticas de cupos
            eventos_service.populate_evento_cupos(db, evento)
            assert evento.cupos_disponibles is None, "cupos_disponibles debe ser None cuando capacidad_max es None"
            assert evento.total_en_espera == 0, "No debe haber nadie en lista de espera"
            assert evento.cupos_ocupados == 2

        finally:
            db.query(models.InscripcionEvento).filter(models.InscripcionEvento.id_evento == evento.id_evento).delete()
            db.delete(evento)
            db.delete(user1)
            db.delete(user2)
            db.delete(staff)
            db.commit()


def test_cancelacion_inscripcion_libera_cupo_y_confirmada_bloqueada(db):
    """
    MEH-007: Cancelar inscripción libera cupo; CONFIRMADA no cancelable por el usuario.
    """
    unique_id = uuid.uuid4().hex[:8]
    user_espera = models.Usuario(
        nombres="User",
        apellidos="Espera",
        correo=f"user_esp_{unique_id}@meh.com",
        password_hash="pwd",
        rol="MIEMBRO"
    )
    user_pago = models.Usuario(
        nombres="User",
        apellidos="Pago",
        correo=f"user_pag_{unique_id}@meh.com",
        password_hash="pwd",
        rol="MIEMBRO"
    )
    user_conf = models.Usuario(
        nombres="User",
        apellidos="Conf",
        correo=f"user_conf_{unique_id}@meh.com",
        password_hash="pwd",
        rol="MIEMBRO"
    )
    db.add_all([user_espera, user_pago, user_conf])
    db.commit()
    for u in [user_espera, user_pago, user_conf]:
        db.refresh(u)

    # Evento con cupo 1
    evento = models.Evento(
        titulo=f"Evento Cupo Uno {unique_id}",
        descripcion="Evento para probar cancelacion",
        fecha_inicio=_now() + timedelta(days=3),
        modalidad="PRESENCIAL",
        capacidad_max=1,
        id_estado=2
    )
    db.add(evento)
    db.commit()
    db.refresh(evento)

    try:
        # 1. user_conf ocupa el único cupo (gratuito -> CONFIRMADA)
        insc_conf = inscripciones_service.inscribir_evento(db, user_conf.id_usuario, evento.id_evento)
        assert insc_conf.estado_inscripcion == "CONFIRMADA"

        # 2. user_espera intenta inscribirse -> va a PENDIENTE_APROBACION
        insc_esp = inscripciones_service.inscribir_evento(db, user_espera.id_usuario, evento.id_evento)
        assert insc_esp.estado_inscripcion == "PENDIENTE_APROBACION"

        # 3. Intentar cancelar la inscripción CONFIRMADA debe fallar
        with pytest.raises(ValidacionNegocioError) as exc_info:
            inscripciones_service.cancelar_inscripcion_evento(db, user_conf.id_usuario, insc_conf.id_inscripcion)
        assert "ya confirmada/pagada" in str(exc_info.value).lower()

        # 4. Cancelar la inscripción de user_espera (PENDIENTE_APROBACION) debe tener éxito
        inscripciones_service.cancelar_inscripcion_evento(db, user_espera.id_usuario, insc_esp.id_inscripcion)
        db.refresh(insc_esp)
        assert insc_esp.estado_inscripcion == "CANCELADA"
        assert insc_esp.id_estado == 0

        # Verificar auditoría de cancelación
        log_canc = db.query(models.LogSistema).filter(
            models.LogSistema.accion == "CANCELAR_INSCRIPCION_EVENTO",
            models.LogSistema.id_registro_afectado == insc_esp.id_inscripcion
        ).first()
        assert log_canc is not None
        assert log_canc.id_admin == user_espera.id_usuario

    finally:
        db.query(models.InscripcionEvento).filter(models.InscripcionEvento.id_evento == evento.id_evento).delete()
        db.delete(evento)
        db.delete(user_espera)
        db.delete(user_pago)
        db.delete(user_conf)
        db.commit()


def test_cancelacion_desde_ui_libera_cupo_para_nuevo_ingreso(db):
    """
    MEH-007: Cancelación de inscripción pendiente libera cupo y permite que otro participante entre.
    """
    unique_id = uuid.uuid4().hex[:8]
    user1 = models.Usuario(nombres="U1", apellidos="T", correo=f"u1_{unique_id}@meh.com", password_hash="h", rol="MIEMBRO")
    user2 = models.Usuario(nombres="U2", apellidos="T", correo=f"u2_{unique_id}@meh.com", password_hash="h", rol="MIEMBRO")
    user3 = models.Usuario(nombres="U3", apellidos="T", correo=f"u3_{unique_id}@meh.com", password_hash="h", rol="MIEMBRO")
    db.add_all([user1, user2, user3])
    db.commit()
    for u in [user1, user2, user3]:
        db.refresh(u)

    evento = models.Evento(
        titulo=f"Evento Cupo Reutilizable {unique_id}",
        fecha_inicio=_now() + timedelta(days=5),
        modalidad="PRESENCIAL",
        capacidad_max=1,
        id_estado=2
    )
    db.add(evento)
    db.commit()
    db.refresh(evento)

    # Creamos un paquete de pago para que el estado sea PENDIENTE (de pago) y ocupe cupo
    pago_qr = models.EventoPagoQR(
        id_evento=evento.id_evento,
        nombre_paquete="General",
        monto=50.0,
        url_qr="static/qrs/test.png",
        id_estado=2
    )
    db.add(pago_qr)
    db.commit()

    try:
        # user1 se inscribe (de pago -> PENDIENTE, ocupa el único cupo)
        insc1 = inscripciones_service.inscribir_evento(db, user1.id_usuario, evento.id_evento)
        assert insc1.estado_inscripcion == "PENDIENTE"

        # user2 intenta inscribirse -> Cupo lleno -> PENDIENTE_APROBACION
        insc2 = inscripciones_service.inscribir_evento(db, user2.id_usuario, evento.id_evento)
        assert insc2.estado_inscripcion == "PENDIENTE_APROBACION"

        # user1 cancela su inscripción pendiente desde el portal
        inscripciones_service.cancelar_inscripcion_evento(db, user1.id_usuario, insc1.id_inscripcion)
        db.refresh(insc1)
        assert insc1.estado_inscripcion == "CANCELADA"

        # Ahora el cupo quedó libre; user3 puede inscribirse directamente a PENDIENTE (en vez de espera)
        insc3 = inscripciones_service.inscribir_evento(db, user3.id_usuario, evento.id_evento)
        assert insc3.estado_inscripcion == "PENDIENTE", "El cupo liberado debe permitir que user3 ingrese como PENDIENTE y no PENDIENTE_APROBACION"

    finally:
        db.query(models.InscripcionEvento).filter(models.InscripcionEvento.id_evento == evento.id_evento).delete()
        db.query(models.EventoPagoQR).filter(models.EventoPagoQR.id_evento == evento.id_evento).delete()
        db.delete(evento)
        db.delete(user1)
        db.delete(user2)
        db.delete(user3)
        db.commit()


def test_api_endpoint_cancelar_inscripcion_http(db):
    """
    MEH-007: Prueba el endpoint DELETE /api/inscripciones/eventos/{id_inscripcion} vía HTTP.
    """
    unique_id = uuid.uuid4().hex[:8]
    user = models.Usuario(
        nombres="HTTP",
        apellidos="User",
        correo=f"http_{unique_id}@meh.com",
        password_hash="h",
        rol="MIEMBRO"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    evento = models.Evento(
        titulo=f"Evento HTTP Cancel {unique_id}",
        fecha_inicio=_now() + timedelta(days=4),
        modalidad="VIRTUAL",
        capacidad_max=10,
        id_estado=2
    )
    db.add(evento)
    db.commit()
    db.refresh(evento)

    insc = models.InscripcionEvento(
        id_usuario=user.id_usuario,
        id_evento=evento.id_evento,
        fecha_inscripcion=_now(),
        estado_inscripcion="PENDIENTE_APROBACION",
        id_estado=2
    )
    db.add(insc)
    db.commit()
    db.refresh(insc)

    client = TestClient(app)
    app.dependency_overrides[get_current_user] = lambda: user

    try:
        # Cancelar vía endpoint
        resp = client.delete(f"/inscripciones/eventos/{insc.id_inscripcion}")
        assert resp.status_code == 204

        # Verificar en base de datos
        db.refresh(insc)
        assert insc.estado_inscripcion == "CANCELADA"
        assert insc.id_estado == 0

        # Intentar cancelar una inscripción inexistente -> 404
        resp404 = client.delete("/inscripciones/eventos/99999999")
        assert resp404.status_code == 404

    finally:
        app.dependency_overrides.clear()
        db.query(models.InscripcionEvento).filter(models.InscripcionEvento.id_evento == evento.id_evento).delete()
        db.delete(evento)
        db.delete(user)
        db.commit()

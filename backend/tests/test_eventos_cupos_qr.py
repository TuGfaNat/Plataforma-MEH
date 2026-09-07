import pytest
import uuid
from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta
from app.database import SessionLocal
from app.models import models
from app.services import eventos_service, inscripciones_service, pagos_service, email_service
from app.schemas import evento as evento_schema, pago as pago_schema
from app.core.exceptions import ValidacionNegocioError, PermisoDenegadoError

@pytest.fixture
def db():
    session = SessionLocal()
    yield session
    session.close()

def test_token_qr_and_auto_checkpoints_generated_on_creation(db):
    """Verifica que al crear un evento se genere su token_qr y los auto-checkpoints de incluidos."""
    unique_id = uuid.uuid4().hex[:8]
    staff = models.Usuario(
        nombres="Admin",
        apellidos="Test",
        correo=f"admin_{unique_id}@meh.com",
        password_hash="pwd",
        rol="ADMIN"
    )
    db.add(staff)
    db.commit()
    db.refresh(staff)

    try:
        evento_in = evento_schema.EventoCreate(
            titulo=f"Conferencia Cloud {unique_id}",
            descripcion="Descripción test",
            fecha_inicio=datetime.utcnow() + timedelta(days=1),
            modalidad="PRESENCIAL",
            capacidad_max=20,
            refrigerio_incluido=True,
            incluidos='["Kit de Bienvenida", "Souvenirs MEH"]'
        )

        evento = eventos_service.create_evento(db, staff, evento_in)
        assert evento.token_qr is not None
        assert evento.token_qr.startswith("EVENTO_")

        # Verificar checkpoints auto-generados
        checkpoints = eventos_service.get_checkpoints(db, evento.id_evento)
        nombres = [cp.nombre_checkpoint for cp in checkpoints]

        assert "Acreditación y Entrada" in nombres
        assert "Entrega: Kit de Bienvenida" in nombres
        assert "Entrega: Souvenirs MEH" in nombres
        assert "Entrega: Refrigerio" in nombres

        # Verificar generación de imagen QR descargable
        qr_bytes, filename = eventos_service.get_evento_qr_image(db, evento.id_evento)
        assert len(qr_bytes) > 0
        assert filename.endswith(".png")
        assert f"{evento.id_evento}" in filename

    finally:
        db.query(models.Checkpoint).filter(models.Checkpoint.id_evento == evento.id_evento).delete()
        db.delete(evento)
        db.delete(staff)
        db.commit()


def test_flujo_inscripcion_gratuita_y_doble_inscripcion(db):
    """Evento gratuito: CONFIRMADA inmediata, QR generado y envío de email sin qrserver.com."""
    unique_id = uuid.uuid4().hex[:8]
    user = models.Usuario(
        nombres="Carlos",
        apellidos="Gratis",
        correo=f"carlos_{unique_id}@meh.com",
        password_hash="pwd",
        rol="MIEMBRO"
    )
    admin = models.Usuario(
        nombres="Staff",
        apellidos="Org",
        correo=f"staff_{unique_id}@meh.com",
        password_hash="pwd",
        rol="ADMIN"
    )
    db.add_all([user, admin])
    db.commit()
    db.refresh(user)
    db.refresh(admin)

    evento = models.Evento(
        titulo=f"Taller Abierto {unique_id}",
        fecha_inicio=datetime.utcnow() + timedelta(days=2),
        modalidad="PRESENCIAL",
        capacidad_max=10,
        id_organizador=admin.id_usuario,
        incluidos='["Stickers"]'
    )
    db.add(evento)
    db.commit()
    db.refresh(evento)

    try:
        with patch("app.services.email_service.send_email", return_value=True) as mock_send_email:
            inscripcion = inscripciones_service.inscribir_evento(db, user.id_usuario, evento.id_evento)
            assert inscripcion.estado_inscripcion == "CONFIRMADA"
            assert inscripcion.codigo_qr is not None
            assert len(inscripcion.codigo_qr) > 10

            # Verificar que se intentó enviar email con QR local
            mock_send_email.assert_called_once()
            args, kwargs = mock_send_email.call_args
            assert args[0] == user.correo
            assert "TICKET DE ENTRADA" in args[2]
            assert "cid:ticket_qr" in args[2]
            assert "api.qrserver.com" not in args[2]
            assert "ticket_qr" in kwargs["images"]

        # Validar doble inscripción rechazada
        with pytest.raises(ValidacionNegocioError) as exc_dup:
            inscripciones_service.inscribir_evento(db, user.id_usuario, evento.id_evento)
        assert "Ya estás inscrito" in str(exc_dup.value)

        # Cancelación en confirmada prohibida
        with pytest.raises(ValidacionNegocioError) as exc_cancel:
            inscripciones_service.cancelar_inscripcion_evento(db, user.id_usuario, inscripcion.id_inscripcion)
        assert "ya confirmada" in str(exc_cancel.value)

    finally:
        db.delete(inscripcion)
        db.delete(evento)
        db.delete(user)
        db.delete(admin)
        db.commit()


def test_flujo_cupo_lleno_lista_espera_y_aprobacion(db):
    """Cupo lleno -> PENDIENTE_APROBACION sin QR. Al ampliar capacidad, el organizador aprueba -> CONFIRMADA con QR."""
    unique_id = uuid.uuid4().hex[:8]
    admin = models.Usuario(nombres="Admin", apellidos="C", correo=f"adm_{unique_id}@meh.com", password_hash="pwd", rol="ADMIN")
    user1 = models.Usuario(nombres="U1", apellidos="Uno", correo=f"u1_{unique_id}@meh.com", password_hash="pwd", rol="MIEMBRO")
    user2 = models.Usuario(nombres="U2", apellidos="Dos", correo=f"u2_{unique_id}@meh.com", password_hash="pwd", rol="MIEMBRO")
    db.add_all([admin, user1, user2])
    db.commit()

    # Evento con capacidad = 1
    evento = models.Evento(
        titulo=f"Seminario Exclusivo {unique_id}",
        fecha_inicio=datetime.utcnow() + timedelta(days=3),
        modalidad="PRESENCIAL",
        capacidad_max=1,
        id_organizador=admin.id_usuario
    )
    db.add(evento)
    db.commit()
    db.refresh(evento)

    try:
        # Primer usuario ocupa el único cupo
        ins1 = inscripciones_service.inscribir_evento(db, user1.id_usuario, evento.id_evento)
        assert ins1.estado_inscripcion == "CONFIRMADA"
        assert ins1.codigo_qr is not None

        # Segundo usuario intenta inscribirse: entra a lista de espera sin QR
        ins2 = inscripciones_service.inscribir_evento(db, user2.id_usuario, evento.id_evento)
        assert ins2.estado_inscripcion == "PENDIENTE_APROBACION"
        assert ins2.codigo_qr is None

        # Intentar aprobar lista de espera sin ampliar capacidad debe fallar
        with pytest.raises(ValidacionNegocioError) as exc_full:
            inscripciones_service.aprobar_inscripcion_espera(db, admin, ins2.id_inscripcion)
        assert "Capacidad máxima" in str(exc_full.value)

        # Organizador amplía capacidad a 2
        evento.capacidad_max = 2
        db.commit()

        # Ahora el organizador aprueba la inscripción en espera
        with patch("app.services.email_service.send_email", return_value=True) as mock_send_email:
            ins2_aprobada = inscripciones_service.aprobar_inscripcion_espera(db, admin, ins2.id_inscripcion)
            assert ins2_aprobada.estado_inscripcion == "CONFIRMADA"
            assert ins2_aprobada.codigo_qr is not None
            mock_send_email.assert_called_once()

    finally:
        db.delete(ins1)
        db.delete(ins2)
        db.delete(evento)
        db.delete(user1)
        db.delete(user2)
        db.delete(admin)
        db.commit()


def test_flujo_evento_pago_transicion_y_qr_unico_checkpoints(db):
    """Evento de pago: PENDIENTE sin QR -> aprobación pago -> CONFIRMADA con QR -> escaneo en acreditación y entregables."""
    unique_id = uuid.uuid4().hex[:8]
    admin = models.Usuario(nombres="Admin", apellidos="Pago", correo=f"admpago_{unique_id}@meh.com", password_hash="pwd", rol="ADMIN")
    user = models.Usuario(nombres="Roberto", apellidos="Perez", correo=f"roberto_{unique_id}@meh.com", password_hash="pwd", rol="MIEMBRO")
    db.add_all([admin, user])
    db.commit()

    evento = models.Evento(
        titulo=f"Summit Pago {unique_id}",
        fecha_inicio=datetime.utcnow() + timedelta(days=5),
        modalidad="PRESENCIAL",
        capacidad_max=50,
        id_organizador=admin.id_usuario,
        incluidos='["Almuerzo Ejecutivo", "Kit Oficial"]'
    )
    db.add(evento)
    db.commit()
    db.refresh(evento)

    # Paquete de pago bancario asociado al evento
    pago_qr = models.EventoPagoQR(
        id_evento=evento.id_evento,
        nombre_paquete="Pase General",
        monto=50.00,
        url_qr="static/qrs/fake.png",
        id_estado=2
    )
    db.add(pago_qr)
    db.commit()

    # Sincronizar checkpoints
    eventos_service.sync_evento_checkpoints(db, evento)
    checkpoints = eventos_service.get_checkpoints(db, evento.id_evento)
    cp_acreditacion = next(c for c in checkpoints if "Acreditación" in c.nombre_checkpoint)
    cp_almuerzo = next(c for c in checkpoints if "Almuerzo" in c.nombre_checkpoint)

    try:
        # 1. Inscribirse en evento de pago -> PENDIENTE, sin QR
        ins = inscripciones_service.inscribir_evento(db, user.id_usuario, evento.id_evento)
        assert ins.estado_inscripcion == "PENDIENTE"
        assert ins.codigo_qr is None

        # Intentar escanear sin estar confirmada debe fallar
        with pytest.raises(ValidacionNegocioError) as exc_scan_pend:
            eventos_service.registrar_asistencia_qr(db, admin, "CODIGO_INVENTADO", id_checkpoint=cp_acreditacion.id_checkpoint)
        # Como el QR no existe aún
        assert "no pertenece" in str(exc_scan_pend.value)

        # 2. Simular pago y aprobación por el administrador
        pago = models.Pago(
            id_usuario=user.id_usuario,
            id_referencia=ins.id_inscripcion,
            tipo_referencia="EVENTO",
            monto=50.00,
            metodo_pago="TRANSFERENCIA",
            estado_pago="PENDIENTE"
        )
        db.add(pago)
        db.commit()
        db.refresh(pago)

        with patch("app.services.email_service.send_email", return_value=True) as mock_send_email:
            pagos_service.validar_pago(
                db=db,
                admin_user=admin,
                id_pago=pago.id_pago,
                pago_update=pago_schema.PagoUpdate(estado_pago="APROBADO")
            )
            mock_send_email.assert_called()

        db.refresh(ins)
        assert ins.estado_inscripcion == "CONFIRMADA"
        assert ins.codigo_qr is not None
        ticket_qr = ins.codigo_qr

        # 3. Escaneo en Checkpoint de Acreditación con ticket_qr
        res_acred = eventos_service.registrar_asistencia_qr(
            db=db,
            staff_user=admin,
            codigo_qr=ticket_qr,
            id_checkpoint=cp_acreditacion.id_checkpoint
        )
        assert res_acred["message"] == "Asistencia registrada con éxito"

        db.refresh(ins)
        assert ins.asistio is True

        # 4. Doble escaneo en Acreditación debe fallar
        with pytest.raises(ValidacionNegocioError) as exc_double_acred:
            eventos_service.registrar_asistencia_qr(
                db=db,
                staff_user=admin,
                codigo_qr=ticket_qr,
                id_checkpoint=cp_acreditacion.id_checkpoint
            )
        assert "Ya se registró asistencia" in str(exc_double_acred.value)

        # 5. Escaneo en Checkpoint de Almuerzo con el MISMO ticket_qr
        res_alm = eventos_service.registrar_asistencia_qr(
            db=db,
            staff_user=admin,
            codigo_qr=ticket_qr,
            id_checkpoint=cp_almuerzo.id_checkpoint
        )
        assert res_alm["message"] == "Asistencia registrada con éxito"

        # 6. Doble escaneo en Checkpoint de Almuerzo debe fallar
        with pytest.raises(ValidacionNegocioError) as exc_double_alm:
            eventos_service.registrar_asistencia_qr(
                db=db,
                staff_user=admin,
                codigo_qr=ticket_qr,
                id_checkpoint=cp_almuerzo.id_checkpoint
            )
        assert "Ya se registró asistencia en el checkpoint" in str(exc_double_alm.value)

    finally:
        db.query(models.AsistenciaDetalle).filter(models.AsistenciaDetalle.id_inscripcion == ins.id_inscripcion).delete()
        db.query(models.Pago).filter(models.Pago.id_referencia == ins.id_inscripcion).delete()
        db.delete(ins)
        db.delete(pago_qr)
        db.query(models.Checkpoint).filter(models.Checkpoint.id_evento == evento.id_evento).delete()
        db.delete(evento)
        db.delete(user)
        db.delete(admin)
        db.commit()


def test_cancelacion_libera_cupo(db):
    """Cancelar una inscripción PENDIENTE libera el cupo para que otro usuario pueda inscribirse."""
    unique_id = uuid.uuid4().hex[:8]
    admin = models.Usuario(nombres="Admin", apellidos="C", correo=f"acanc_{unique_id}@meh.com", password_hash="pwd", rol="ADMIN")
    u1 = models.Usuario(nombres="User1", apellidos="A", correo=f"u1canc_{unique_id}@meh.com", password_hash="pwd", rol="MIEMBRO")
    u2 = models.Usuario(nombres="User2", apellidos="B", correo=f"u2canc_{unique_id}@meh.com", password_hash="pwd", rol="MIEMBRO")
    db.add_all([admin, u1, u2])
    db.commit()

    evento = models.Evento(
        titulo=f"Evento Cupo Único {unique_id}",
        fecha_inicio=datetime.utcnow() + timedelta(days=2),
        modalidad="VIRTUAL",
        capacidad_max=1,
        id_organizador=admin.id_usuario
    )
    db.add(evento)
    # Agregar pago qr para que sea PENDIENTE
    pqr = models.EventoPagoQR(id_evento=0, nombre_paquete="Pase", monto=10.0, url_qr="f.png", id_estado=2)
    db.commit()
    db.refresh(evento)
    pqr.id_evento = evento.id_evento
    db.add(pqr)
    db.commit()

    try:
        ins1 = inscripciones_service.inscribir_evento(db, u1.id_usuario, evento.id_evento)
        assert ins1.estado_inscripcion == "PENDIENTE"

        # u2 intenta inscribirse pero no hay cupo disponible -> entra a lista de espera
        ins2 = inscripciones_service.inscribir_evento(db, u2.id_usuario, evento.id_evento)
        assert ins2.estado_inscripcion == "PENDIENTE_APROBACION"

        # u1 cancela su inscripción pendiente -> libera cupo
        inscripciones_service.cancelar_inscripcion_evento(db, u1.id_usuario, ins1.id_inscripcion)
        db.refresh(ins1)
        assert ins1.estado_inscripcion == "CANCELADA"
        assert ins1.id_estado == 0

        # Ahora que el cupo se liberó, el organizador puede aprobar a u2
        ins2_aprobada = inscripciones_service.aprobar_inscripcion_espera(db, admin, ins2.id_inscripcion)
        assert ins2_aprobada.estado_inscripcion == "PENDIENTE"

    finally:
        db.delete(ins1)
        db.delete(ins2)
        db.delete(pqr)
        db.delete(evento)
        db.delete(u1)
        db.delete(u2)
        db.delete(admin)
        db.commit()

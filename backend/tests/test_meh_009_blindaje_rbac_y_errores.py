import pytest
import uuid
from unittest.mock import patch
import smtplib
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from main import app
from app.database import SessionLocal
from app.models import models
from app.core import auth as auth_core
from app.services import email_service, logs_service

client = TestClient(app)

@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_stats_rbac_shielding(db_session):
    """Criterio: /stats: rol sin permiso -> 403; admin -> 200.
    
    Verifica tanto /dashboard/stats como el alias directo /stats.
    """
    unique_id = uuid.uuid4().hex[:8]
    miembro = models.Usuario(
        nombres="Ana",
        apellidos="Miembro",
        correo=f"ana_miembro_{unique_id}@test.com",
        password_hash="fake",
        rol="MIEMBRO"
    )
    admin = models.Usuario(
        nombres="Beto",
        apellidos="Admin",
        correo=f"beto_admin_{unique_id}@test.com",
        password_hash="fake",
        rol="ADMIN"
    )
    db_session.add_all([miembro, admin])
    db_session.commit()
    db_session.refresh(miembro)
    db_session.refresh(admin)

    try:
        token_miembro = auth_core.create_access_token(data={"sub": miembro.correo, "rol": miembro.rol})
        token_admin = auth_core.create_access_token(data={"sub": admin.correo, "rol": admin.rol})

        headers_miembro = {"Authorization": f"Bearer {token_miembro}"}
        headers_admin = {"Authorization": f"Bearer {token_admin}"}

        # 1. /dashboard/stats - MIEMBRO bloqueado con 403
        res1 = client.get("/dashboard/stats", headers=headers_miembro)
        assert res1.status_code == 403
        assert "No tienes privilegios" in res1.json()["detail"] or "No tienes permiso" in res1.json()["detail"]

        # 2. /stats (alias directo) - MIEMBRO bloqueado con 403
        res2 = client.get("/stats", headers=headers_miembro)
        assert res2.status_code == 403

        # 3. /dashboard/stats - ADMIN autorizado con 200
        res3 = client.get("/dashboard/stats", headers=headers_admin)
        assert res3.status_code == 200
        assert "kpis" in res3.json()

        # 4. /stats - ADMIN autorizado con 200
        res4 = client.get("/stats", headers=headers_admin)
        assert res4.status_code == 200
        assert "kpis" in res4.json()

    finally:
        db_session.delete(miembro)
        db_session.delete(admin)
        db_session.commit()

def test_logs_no_admin_shielding(db_session):
    """Criterio: /logs: no-admin -> 403.
    
    Verifica que ni MIEMBRO ni ORGANIZADOR puedan acceder a /logs (estricto ADMIN).
    """
    unique_id = uuid.uuid4().hex[:8]
    miembro = models.Usuario(
        nombres="Lucas",
        apellidos="Miembro",
        correo=f"lucas_{unique_id}@test.com",
        password_hash="fake",
        rol="MIEMBRO"
    )
    organizador = models.Usuario(
        nombres="Olga",
        apellidos="Organizador",
        correo=f"olga_{unique_id}@test.com",
        password_hash="fake",
        rol="ORGANIZADOR"
    )
    admin = models.Usuario(
        nombres="Arturo",
        apellidos="Admin",
        correo=f"arturo_{unique_id}@test.com",
        password_hash="fake",
        rol="ADMIN"
    )
    db_session.add_all([miembro, organizador, admin])
    db_session.commit()
    db_session.refresh(miembro)
    db_session.refresh(organizador)
    db_session.refresh(admin)

    try:
        token_miembro = auth_core.create_access_token(data={"sub": miembro.correo, "rol": miembro.rol})
        token_organizador = auth_core.create_access_token(data={"sub": organizador.correo, "rol": organizador.rol})
        token_admin = auth_core.create_access_token(data={"sub": admin.correo, "rol": admin.rol})

        # MIEMBRO -> 403 tanto en /logs como en /logs/
        res_m1 = client.get("/logs", headers={"Authorization": f"Bearer {token_miembro}"})
        assert res_m1.status_code == 403

        res_m2 = client.get("/logs/", headers={"Authorization": f"Bearer {token_miembro}"})
        assert res_m2.status_code == 403

        # ORGANIZADOR (no-admin) -> 403
        res_o1 = client.get("/logs", headers={"Authorization": f"Bearer {token_organizador}"})
        assert res_o1.status_code == 403

        res_o2 = client.get("/logs/", headers={"Authorization": f"Bearer {token_organizador}"})
        assert res_o2.status_code == 403

        # ADMIN -> 200
        res_a1 = client.get("/logs", headers={"Authorization": f"Bearer {token_admin}"})
        assert res_a1.status_code == 200
        assert isinstance(res_a1.json(), list)

        res_a2 = client.get("/logs/", headers={"Authorization": f"Bearer {token_admin}"})
        assert res_a2.status_code == 200
        assert isinstance(res_a2.json(), list)

    finally:
        db_session.delete(miembro)
        db_session.delete(organizador)
        db_session.delete(admin)
        db_session.commit()

def test_anti_auto_escaneo_asistencia(db_session):
    """Criterio: Auto-escaneo -> error de negocio (no 500).
    
    Verifica que un operador no pueda auto-escanear o registrar su propia asistencia.
    """
    unique_id = uuid.uuid4().hex[:8]
    operador = models.Usuario(
        nombres="Operador",
        apellidos="Staff",
        correo=f"staff_{unique_id}@test.com",
        password_hash="fake",
        rol="ADMIN"
    )
    evento = models.Evento(
        titulo="Evento Test Auto Escaneo",
        descripcion="Test",
        fecha_inicio=datetime.utcnow() + timedelta(days=1),
        ubicacion="Auditorio",
        modalidad="PRESENCIAL",
        estado="PROGRAMADO",
        id_organizador=operador.id_usuario
    )
    db_session.add_all([operador, evento])
    db_session.commit()
    db_session.refresh(operador)
    db_session.refresh(evento)

    # Inscripción confirmada del operador
    qr_token = f"QR-SELF-{unique_id}"
    inscripcion = models.InscripcionEvento(
        id_usuario=operador.id_usuario,
        id_evento=evento.id_evento,
        codigo_qr=qr_token,
        estado_inscripcion="CONFIRMADA",
        id_estado=1
    )
    db_session.add(inscripcion)
    db_session.commit()
    db_session.refresh(inscripcion)

    try:
        token_operador = auth_core.create_access_token(data={"sub": operador.correo, "rol": operador.rol})
        headers = {"Authorization": f"Bearer {token_operador}"}

        # 1. Intento vía /asistencia/registrar con id_usuario propio
        res_univ = client.post(
            f"/asistencia/registrar?tipo=EVENTO&id_actividad={evento.id_evento}&id_usuario={operador.id_usuario}",
            headers=headers
        )
        assert res_univ.status_code == 400
        assert "auto-escanear" in res_univ.json()["detail"].lower() or "propia" in res_univ.json()["detail"].lower()

        # 2. Intento vía /eventos/asistencia-qr con su propio código QR
        res_qr = client.post(
            "/eventos/asistencia-qr",
            headers=headers,
            json={"codigo_qr": qr_token}
        )
        assert res_qr.status_code == 400
        assert "auto-escanear" in res_qr.json()["detail"].lower() or "propio" in res_qr.json()["detail"].lower()

    finally:
        db_session.delete(inscripcion)
        db_session.delete(evento)
        db_session.delete(operador)
        db_session.commit()

def test_fallo_smtp_registrado_en_auditoria(db_session):
    """Criterio: Fallo SMTP registrado en auditoría.
    
    Verifica que cuando el envío SMTP falla, se crea un registro de log
    en logs_sistema con accion="FALLO_ENVIO_EMAIL" y detalles del error.
    """
    unique_id = uuid.uuid4().hex[:8]
    destinatario = f"test_fail_{unique_id}@meh.org"
    asunto = f"Prueba Fallo SMTP {unique_id}"

    # Simular fallo en smtplib.SMTP levantando SMTPAuthenticationError
    with patch("smtplib.SMTP") as mock_smtp:
        mock_server = mock_smtp.return_value.__enter__.return_value
        mock_server.login.side_effect = smtplib.SMTPAuthenticationError(535, b"Authentication failed")

        exito = email_service.send_email(
            to_email=destinatario,
            subject=asunto,
            html_content="<p>Fallo intencional</p>",
            retry_count=1,
            db=db_session
        )

        assert exito is False

    # Verificar que el log fue registrado en la base de datos
    log_db = db_session.query(models.LogSistema).filter(
        models.LogSistema.accion == "FALLO_ENVIO_EMAIL",
        models.LogSistema.tabla_afectada == "notificaciones_email"
    ).order_by(models.LogSistema.id_log.desc()).first()

    assert log_db is not None
    assert log_db.valor_nuevo is not None
    assert destinatario in log_db.valor_nuevo
    assert "Authentication failed" in log_db.valor_nuevo or "Error de autenticación SMTP" in log_db.valor_nuevo

    # Limpiar log de prueba
    db_session.delete(log_db)
    db_session.commit()

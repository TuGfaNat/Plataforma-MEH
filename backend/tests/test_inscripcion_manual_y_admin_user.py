import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from main import app
from app.database import Base, get_db
from app.models import models
from app.core import auth as auth_core

client = TestClient(app)

@pytest.fixture
def db_session():
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        yield db
    finally:
        db.rollback()
        db.close()

def test_admin_create_user_and_manual_inscribe_asistio(db_session: Session):
    # 1. Crear un Admin
    admin_email = f"admin_asistio_{datetime.utcnow().timestamp()}@example.com"
    admin = models.Usuario(
        nombres="Super",
        apellidos="Admin",
        correo=admin_email,
        password_hash=auth_core.get_password_hash("Admin123!"),
        rol="ADMIN",
        email_verificado=True,
        activo=True,
        id_estado=2
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)

    token = auth_core.create_access_token(data={"sub": admin.correo, "rol": admin.rol})
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Admin crea usuario directamente con /auth/admin/users
    nuevo_correo = f"miembro_asistio_{datetime.utcnow().timestamp()}@example.com"
    res_create = client.post("/auth/admin/users", json={
        "nombres": "Maria",
        "apellidos": "Gomez",
        "correo": nuevo_correo,
        "rol": "MIEMBRO",
        "institucion": "Universidad Mayor"
    }, headers=headers)

    assert res_create.status_code == 201
    user_data = res_create.json()
    id_nuevo_usuario = user_data["id_usuario"]

    # 3. Crear un evento
    evento = models.Evento(
        titulo="Evento Asistio Directo Test",
        descripcion="Evento de prueba para registro confirmado y asistido",
        tipo_evento="CONFERENCIA",
        fecha_inicio=datetime.utcnow() + timedelta(days=1),
        hora_inicio="19:00",
        modalidad="PRESENCIAL",
        capacidad_max=100,
        id_estado=2,
        estado="ACTIVO",
        creado_por=admin.id_usuario
    )
    db_session.add(evento)
    db_session.commit()
    db_session.refresh(evento)

    # 4. Inscribir manualmente con CONFIRMADA_ASISTIO y marcar_asistio=True
    res_inscribir = client.post(f"/inscripciones/eventos/{evento.id_evento}/manual", json={
        "id_usuario": id_nuevo_usuario,
        "estado_inscripcion": "CONFIRMADA_ASISTIO",
        "marcar_asistio": True
    }, headers=headers)

    assert res_inscribir.status_code == 201
    insc_data = res_inscribir.json()
    assert insc_data["id_usuario"] == id_nuevo_usuario
    assert insc_data["estado_inscripcion"] == "CONFIRMADA"
    assert insc_data["asistio"] is True
    assert insc_data["codigo_qr"] is not None

    # Verificar que se creó el registro de AsistenciaDetalle
    asistencia = db_session.query(models.AsistenciaDetalle).filter(
        models.AsistenciaDetalle.id_inscripcion == insc_data["id_inscripcion"]
    ).first()
    assert asistencia is not None
    assert asistencia.escaneado_por == admin.id_usuario

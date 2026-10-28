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

def test_organizador_can_create_user_and_inscribe(db_session: Session):
    # 1. Crear un Organizador
    org_email = f"org_{datetime.utcnow().timestamp()}@example.com"
    organizador = models.Usuario(
        nombres="Carlos",
        apellidos="Organizador",
        correo=org_email,
        password_hash=auth_core.get_password_hash("Org12345!"),
        rol="ORGANIZADOR",
        email_verificado=True,
        activo=True,
        id_estado=2
    )
    db_session.add(organizador)
    db_session.commit()
    db_session.refresh(organizador)

    token = auth_core.create_access_token(data={"sub": organizador.correo, "rol": organizador.rol})
    headers = {"Authorization": f"Bearer {token}"}

    # 2. El Organizador crea una nueva cuenta directamente
    nuevo_correo = f"asistente_org_{datetime.utcnow().timestamp()}@example.com"
    res_create = client.post("/auth/admin/users", json={
        "nombres": "Pedro",
        "apellidos": "Alvarez",
        "correo": nuevo_correo,
        "rol": "MIEMBRO"
    }, headers=headers)

    assert res_create.status_code == 201
    user_data = res_create.json()
    id_nuevo_usuario = user_data["id_usuario"]
    assert user_data["rol"] == "MIEMBRO"

    # 3. Crear evento
    evento = models.Evento(
        titulo="Evento Org Test",
        descripcion="Evento creado para test de organizador",
        tipo_evento="TALLER",
        fecha_inicio=datetime.utcnow() + timedelta(days=2),
        hora_inicio="15:00",
        modalidad="PRESENCIAL",
        capacidad_max=50,
        id_estado=2,
        estado="ACTIVO",
        creado_por=organizador.id_usuario
    )
    db_session.add(evento)
    db_session.commit()
    db_session.refresh(evento)

    # 4. El Organizador inscribe manualmente al participante con CONFIRMADA_ASISTIO
    res_inscribir = client.post(f"/inscripciones/eventos/{evento.id_evento}/manual", json={
        "id_usuario": id_nuevo_usuario,
        "estado_inscripcion": "CONFIRMADA_ASISTIO",
        "marcar_asistio": True
    }, headers=headers)

    assert res_inscribir.status_code == 201
    insc_data = res_inscribir.json()
    assert insc_data["asistio"] is True
    assert insc_data["estado_inscripcion"] == "CONFIRMADA"

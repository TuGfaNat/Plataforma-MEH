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

def test_admin_create_user_and_manual_inscribe(db_session: Session):
    # 1. Crear un Admin
    admin_email = f"admin_test_{datetime.utcnow().timestamp()}@example.com"
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
    nuevo_correo = f"miembro_presencial_{datetime.utcnow().timestamp()}@example.com"
    res_create = client.post("/auth/admin/users", json={
        "nombres": "Juan",
        "apellidos": "Perez",
        "correo": nuevo_correo,
        "rol": "MIEMBRO",
        "institucion": "Universidad Mayor"
    }, headers=headers)

    assert res_create.status_code == 201
    user_data = res_create.json()
    assert user_data["correo"] == nuevo_correo
    assert user_data["email_verificado"] is True
    id_nuevo_usuario = user_data["id_usuario"]

    # 3. Crear un evento para probar inscripción manual
    evento = models.Evento(
        titulo="Kick Off Presencial Test",
        descripcion="Evento de prueba para registro manual",
        tipo_evento="CONFERENCIA",
        fecha_inicio=datetime.utcnow() + timedelta(days=1),
        hora_inicio="18:00",
        modalidad="PRESENCIAL",
        capacidad_max=100,
        id_estado=2,
        estado="ACTIVO",
        creado_por=admin.id_usuario
    )
    db_session.add(evento)
    db_session.commit()
    db_session.refresh(evento)

    # 4. Inscribir manualmente al nuevo usuario al evento
    res_inscribir = client.post(f"/inscripciones/eventos/{evento.id_evento}/manual", json={
        "id_usuario": id_nuevo_usuario,
        "estado_inscripcion": "CONFIRMADA"
    }, headers=headers)

    assert res_inscribir.status_code == 201
    insc_data = res_inscribir.json()
    assert insc_data["id_usuario"] == id_nuevo_usuario
    assert insc_data["id_evento"] == evento.id_evento
    assert insc_data["estado_inscripcion"] == "CONFIRMADA"
    assert insc_data["codigo_qr"] is not None

    # 5. Crear souvenir y probar venta manual al usuario
    souvenir = models.Producto(
        nombre="Polera Kick Off",
        descripcion="Polera oficial del evento",
        precio=50.0,
        stock=20,
        categoria="SOUVENIR",
        creado_por=admin.id_usuario,
        id_estado=2
    )
    db_session.add(souvenir)
    db_session.commit()
    db_session.refresh(souvenir)

    # Registrar venta manual en efectivo
    res_venta = client.post("/souvers/ventas" if False else "/souvenirs/ventas", json={
        "id_usuario": id_nuevo_usuario,
        "items": [
            {"id_producto": souvenir.id_producto, "cantidad": 2}
        ],
        "metodo_pago": "EFECTIVO"
    }, headers=headers)

    assert res_venta.status_code == 200
    venta_data = res_venta.json()
    assert float(venta_data["total"]) == 100.0
    assert venta_data["estado"] == "COMPLETADO"

    # Verificar que el stock se descontó correctamente
    db_session.refresh(souvenir)
    assert souvenir.stock == 18

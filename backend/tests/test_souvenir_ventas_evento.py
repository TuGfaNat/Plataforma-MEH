import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from decimal import Decimal

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

def test_souvenir_venta_evento_stock_and_permissions(db_session: Session):
    timestamp = datetime.utcnow().timestamp()

    # 1. Crear Organizador
    org_email = f"organizador_souv_{timestamp}@example.com"
    organizador = models.Usuario(
        nombres="Carlos",
        apellidos="Ventas",
        correo=org_email,
        password_hash=auth_core.get_password_hash("Org12345!"),
        rol="ORGANIZADOR",
        email_verificado=True,
        activo=True,
        id_estado=2
    )
    db_session.add(organizador)

    # 2. Crear Comprador (Miembro)
    buyer_email = f"comprador_{timestamp}@example.com"
    comprador = models.Usuario(
        nombres="Lucia",
        apellidos="Mendoza",
        correo=buyer_email,
        password_hash=auth_core.get_password_hash("Lucia123!"),
        rol="MIEMBRO",
        email_verificado=True,
        activo=True,
        id_estado=2
    )
    db_session.add(comprador)

    # 3. Crear Producto con stock = 10
    producto = models.Producto(
        nombre=f"Polera Oficial MEH {timestamp}",
        descripcion="Edición especial conferencia",
        precio=Decimal("80.00"),
        stock=10,
        es_kit_evento=True,
        categoria="SOUVENIR",
        id_estado=2
    )
    db_session.add(producto)

    # 4. Crear Evento
    evento = models.Evento(
        titulo=f"Conferencia Anual MEH {timestamp}",
        descripcion="Evento de tecnología",
        tipo_evento="CONFERENCIA",
        fecha_inicio=datetime.utcnow() + timedelta(days=1),
        hora_inicio="09:00",
        modalidad="PRESENCIAL",
        capacidad_max=200,
        id_estado=2,
        estado="ACTIVO",
        creado_por=organizador.id_usuario
    )
    db_session.add(evento)
    db_session.commit()
    db_session.refresh(organizador)
    db_session.refresh(comprador)
    db_session.refresh(producto)
    db_session.refresh(evento)

    token = auth_core.create_access_token(data={"sub": organizador.correo, "rol": organizador.rol})
    headers = {"Authorization": f"Bearer {token}"}

    # 5. Intentar comprar más que el stock (ej. 15 unid.) -> Debe fallar 400
    res_stock_excedido = client.post("/souvenirs/ventas", json={
        "id_usuario": comprador.id_usuario,
        "items": [{"id_producto": producto.id_producto, "cantidad": 15}],
        "metodo_pago": "EFECTIVO",
        "id_evento": evento.id_evento
    }, headers=headers)
    assert res_stock_excedido.status_code == 400
    assert "Stock insuficiente" in res_stock_excedido.json()["detail"]

    # 6. Realizar compra válida de 3 unidades en el evento
    res_venta = client.post("/souvenirs/ventas", json={
        "id_usuario": comprador.id_usuario,
        "items": [{"id_producto": producto.id_producto, "cantidad": 3}],
        "metodo_pago": "EFECTIVO",
        "id_evento": evento.id_evento,
        "notas": "Entregado en mesa 1"
    }, headers=headers)

    assert res_venta.status_code == 200
    venta_data = res_venta.json()
    assert venta_data["id_usuario"] == comprador.id_usuario
    assert venta_data["id_evento"] == evento.id_evento
    assert Decimal(str(venta_data["total"])) == Decimal("240.00")
    assert venta_data["estado"] == "COMPLETADO"

    # 7. Verificar que el stock en la BD se redujo a 7 (10 - 3 = 7)
    db_session.refresh(producto)
    assert producto.stock == 7

    # 8. Consultar ventas filtradas por id_evento
    res_list = client.get(f"/souvenirs/ventas?id_evento={evento.id_evento}", headers=headers)
    assert res_list.status_code == 200
    ventas_evento = res_list.json()
    assert len(ventas_evento) >= 1
    found = next((v for v in ventas_evento if v["id_pedido"] == venta_data["id_pedido"]), None)
    assert found is not None
    assert found["usuario_correo"] == buyer_email
    assert found["evento_titulo"] == evento.titulo
    assert len(found["detalles"]) == 1
    assert found["detalles"][0]["cantidad"] == 3
    assert found["detalles"][0]["producto_nombre"] == producto.nombre

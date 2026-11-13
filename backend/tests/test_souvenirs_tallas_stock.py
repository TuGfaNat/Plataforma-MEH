import uuid
import json
from decimal import Decimal
from fastapi.testclient import TestClient
from app.database import SessionLocal, engine
from app.models import models
from app.core import auth as auth_core
from main import app

client = TestClient(app)

def test_souvenirs_control_stock_tallas():
    """Valida que los souvenirs con tallas manejen inventario independiente y descuenten existencias."""
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    uid = uuid.uuid4().hex[:8]

    try:
        admin = models.Usuario(
            nombres="AdminSouvenirs",
            apellidos="Test",
            correo=f"admin_souv_{uid}@meh.com",
            password_hash="pwd",
            rol="ADMIN"
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

        comprador = models.Usuario(
            nombres="Comprador",
            apellidos="Souvenir",
            correo=f"comprador_souv_{uid}@meh.com",
            password_hash="pwd",
            rol="MIEMBRO"
        )
        db.add(comprador)
        db.commit()
        db.refresh(comprador)

        token_admin = auth_core.create_access_token(data={"sub": admin.correo, "rol": admin.rol})
        headers_admin = {"Authorization": f"Bearer {token_admin}"}

        # 1. Crear Souvenir Polera con tallas (S: 2, M: 10)
        stock_inicial = {"S": 2, "M": 10}
        res_prod = client.post(
            "/souvenirs/",
            headers=headers_admin,
            json={
                "nombre": f"Polera MEH Edicion Especial {uid}",
                "descripcion": "Polera de algodon",
                "precio": 50.0,
                "tiene_tallas": True,
                "tallas_stock": json.dumps(stock_inicial),
                "categoria": "SOUVENIR"
            }
        )
        assert res_prod.status_code == 201, res_prod.text
        data_prod = res_prod.json()
        id_producto = data_prod["id_producto"]
        assert data_prod["tiene_tallas"] is True
        # El stock total debe sumar 2 + 10 = 12
        assert data_prod["stock"] == 12

        # 2. Registrar venta de 2 unidades en talla S (deben quedar 0 en S)
        res_venta = client.post(
            "/souvenirs/ventas",
            headers=headers_admin,
            json={
                "id_usuario": comprador.id_usuario,
                "metodo_pago": "EFECTIVO",
                "items": [
                    {
                        "id_producto": id_producto,
                        "cantidad": 2,
                        "talla": "S"
                    }
                ]
            }
        )
        assert res_venta.status_code == 200, res_venta.text

        # 3. Verificar que el stock de S sea 0 y el total sea 10 en base de datos
        db.expire_all()
        prod_db = db.query(models.Producto).filter(models.Producto.id_producto == id_producto).first()
        tallas_actuales = json.loads(prod_db.tallas_stock)
        assert tallas_actuales["S"] == 0
        assert tallas_actuales["M"] == 10
        assert prod_db.stock == 10

        # 4. Intentar vender 1 unidad más en talla S -> debe fallar con HTTP 400 (Stock insuficiente)
        res_fail = client.post(
            "/souvenirs/ventas",
            headers=headers_admin,
            json={
                "id_usuario": comprador.id_usuario,
                "metodo_pago": "EFECTIVO",
                "items": [
                    {
                        "id_producto": id_producto,
                        "cantidad": 1,
                        "talla": "S"
                    }
                ]
            }
        )
        assert res_fail.status_code == 400
        assert "Stock insuficiente para la talla 'S'" in res_fail.json()["detail"]

        # 5. Vender 3 unidades en talla M -> debe quedar M: 7 y total: 7
        res_venta_m = client.post(
            "/souvenirs/ventas",
            headers=headers_admin,
            json={
                "id_usuario": comprador.id_usuario,
                "metodo_pago": "EFECTIVO",
                "items": [
                    {
                        "id_producto": id_producto,
                        "cantidad": 3,
                        "talla": "M"
                    }
                ]
            }
        )
        assert res_venta_m.status_code == 200
        db.expire_all()
        prod_db = db.query(models.Producto).filter(models.Producto.id_producto == id_producto).first()
        tallas_actuales_m = json.loads(prod_db.tallas_stock)
        assert tallas_actuales_m["M"] == 7
        assert prod_db.stock == 7

    finally:
        db.close()

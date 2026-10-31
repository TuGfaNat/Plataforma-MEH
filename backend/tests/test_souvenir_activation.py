import pytest
from fastapi.testclient import TestClient
from main import app
from app.database import get_db, SessionLocal
from app.models import models
from app.core import auth as auth_core

client = TestClient(app)

@pytest.fixture
def admin_token():
    db = SessionLocal()
    admin = db.query(models.Usuario).filter(models.Usuario.rol == 'ADMIN').first()
    if not admin:
        admin = models.Usuario(
            nombres="Admin",
            apellidos="Test",
            correo="admin_souv_test@meh.com",
            password_hash=auth_core.get_password_hash("password123"),
            rol="ADMIN",
            activo=True,
            id_estado=2
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
    token = auth_core.create_access_token(data={"sub": admin.correo})
    db.close()
    return token

def test_souvenir_toggle_activation(admin_token):
    # 1. Crear producto
    headers = {"Authorization": f"Bearer {admin_token}"}
    create_payload = {
        "nombre": "Souvenir Test Activacion",
        "descripcion": "Probando desactivacion y activacion",
        "precio": 50.0,
        "stock": 20,
        "categoria": "SOUVENIR",
        "id_estado": 2,
        "activo": True
    }
    create_res = client.post("/souvenirs/", json=create_payload, headers=headers)
    assert create_res.status_code == 201, create_res.text
    prod = create_res.json()
    prod_id = prod["id_producto"]
    assert prod["id_estado"] == 2
    assert prod["activo"] is True

    # 2. Desactivar producto (id_estado = 1, activo = False)
    update_res = client.put(f"/souvenirs/{prod_id}", json={"id_estado": 1, "activo": False}, headers=headers)
    assert update_res.status_code == 200, update_res.text
    updated = update_res.json()
    assert updated["id_estado"] == 1
    assert updated["activo"] is False

    # 3. Verificar que get_producto devuelve id_estado = 1 y activo = False
    get_res = client.get(f"/souvenirs/{prod_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id_estado"] == 1
    assert get_res.json()["activo"] is False

    # 4. Reactivar producto (id_estado = 2, activo = True)
    reactivate_res = client.put(f"/souvenirs/{prod_id}", json={"id_estado": 2, "activo": True}, headers=headers)
    assert reactivate_res.status_code == 200
    assert reactivate_res.json()["id_estado"] == 2
    assert reactivate_res.json()["activo"] is True

    # 5. Limpieza
    del_res = client.delete(f"/souvenirs/{prod_id}", headers=headers)
    assert del_res.status_code == 204

import uuid
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from app.database import SessionLocal, engine
from app.models import models
from app.core import auth as auth_core
from main import app

client = TestClient(app)

def test_eventos_pagos_paquetes_e_individuales():
    """Valida la creación, edición y lectura diferenciada de Paquetes e Ítems Individuales."""
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    uid = uuid.uuid4().hex[:8]

    try:
        admin = models.Usuario(
            nombres="AdminPagos",
            apellidos="Test",
            correo=f"admin_indiv_{uid}@meh.com",
            password_hash="pwd",
            rol="ADMIN"
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

        token_admin = auth_core.create_access_token(data={"sub": admin.correo, "rol": admin.rol})
        headers = {"Authorization": f"Bearer {token_admin}"}

        evento = models.Evento(
            titulo=f"Tech Fest {uid}",
            descripcion="Evento con paquetes e individuales",
            fecha_inicio=datetime.utcnow() + timedelta(days=5),
            modalidad="PRESENCIAL",
            ubicacion="Auditorio",
            capacidad_max=50,
            id_organizador=admin.id_usuario,
            estado="PROGRAMADO"
        )
        db.add(evento)
        db.commit()
        db.refresh(evento)

        fake_png = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4"

        # 1. Crear Paquete Completo
        res_pkg = client.post(
            f"/eventos/{evento.id_evento}/pagos-qr",
            headers=headers,
            data={
                "nombre_paquete": "Pack Completo VIP",
                "monto": 120.0,
                "es_individual": False,
                "descripcion": "Incluye entrada, credencial VIP, polera y stickers."
            },
            files={"file": ("qr_pkg.png", fake_png, "image/png")}
        )
        assert res_pkg.status_code == 201
        data_pkg = res_pkg.json()
        assert data_pkg["nombre_paquete"] == "Pack Completo VIP"
        assert data_pkg["es_individual"] is False
        assert "credencial VIP" in data_pkg["descripcion"]

        # 2. Crear Ítem Individual (ej. Solo Polera)
        res_indiv = client.post(
            f"/eventos/{evento.id_evento}/pagos-qr",
            headers=headers,
            data={
                "nombre_paquete": "Solo Polera Oficial",
                "monto": 45.0,
                "es_individual": True,
                "descripcion": "Adquiere solo la polera oficial sin necesidad del paquete completo."
            },
            files={"file": ("qr_polera.png", fake_png, "image/png")}
        )
        assert res_indiv.status_code == 201
        data_indiv = res_indiv.json()
        assert data_indiv["nombre_paquete"] == "Solo Polera Oficial"
        assert data_indiv["es_individual"] is True
        assert float(data_indiv["monto"]) == 45.0

        # 3. Listar opciones de pago del evento
        res_list = client.get(f"/eventos/{evento.id_evento}/pagos-qr")
        assert res_list.status_code == 200
        items = res_list.json()
        assert len(items) == 2

        paquetes = [i for i in items if not i["es_individual"]]
        individuales = [i for i in items if i["es_individual"]]
        assert len(paquetes) == 1
        assert len(individuales) == 1
        assert paquetes[0]["nombre_paquete"] == "Pack Completo VIP"
        assert individuales[0]["nombre_paquete"] == "Solo Polera Oficial"

        # 4. Actualizar ítem individual
        id_qr_indiv = data_indiv["id_qr"]
        res_update = client.put(
            f"/eventos/pagos-qr/{id_qr_indiv}",
            headers=headers,
            data={
                "nombre_paquete": "Solo Polera Oficial (Talla L)",
                "monto": 50.0,
                "es_individual": True,
                "descripcion": "Edición especial talla L"
            }
        )
        assert res_update.status_code == 200
        data_up = res_update.json()
        assert data_up["nombre_paquete"] == "Solo Polera Oficial (Talla L)"
        assert float(data_up["monto"]) == 50.0
        assert data_up["es_individual"] is True
        assert data_up["descripcion"] == "Edición especial talla L"

    finally:
        try:
            db.query(models.EventoPagoQR).filter(models.EventoPagoQR.id_evento == evento.id_evento).delete(synchronize_session=False)
            db.query(models.Evento).filter(models.Evento.id_evento == evento.id_evento).delete(synchronize_session=False)
            db.query(models.Usuario).filter(models.Usuario.id_usuario == admin.id_usuario).delete(synchronize_session=False)
            db.commit()
        except Exception:
            db.rollback()
        finally:
            db.close()

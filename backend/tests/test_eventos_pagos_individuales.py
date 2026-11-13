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


def test_eventos_pagos_control_stock_tallas():
    """Valida la creación de paquetes con tallas, el decremento al inscribirse y la restitución al cancelar."""
    import json
    db = SessionLocal()
    uid = uuid.uuid4().hex[:8]

    try:
        admin = models.Usuario(
            nombres="AdminTallas",
            apellidos="Test",
            correo=f"admin_tallas_{uid}@meh.com",
            password_hash="pwd",
            rol="ADMIN"
        )
        user = models.Usuario(
            nombres="UserComprador",
            apellidos="Test",
            correo=f"user_tallas_{uid}@meh.com",
            password_hash="pwd",
            rol="MIEMBRO"
        )
        db.add_all([admin, user])
        db.commit()
        db.refresh(admin)
        db.refresh(user)

        token_admin = auth_core.create_access_token(data={"sub": admin.correo, "rol": admin.rol})
        token_user = auth_core.create_access_token(data={"sub": user.correo, "rol": user.rol})
        headers_admin = {"Authorization": f"Bearer {token_admin}"}
        headers_user = {"Authorization": f"Bearer {token_user}"}

        evento = models.Evento(
            titulo=f"Conferencia Tallas {uid}",
            descripcion="Evento con control de stock de tallas",
            fecha_inicio=datetime.utcnow() + timedelta(days=7),
            modalidad="PRESENCIAL",
            ubicacion="Pabellón A",
            capacidad_max=100,
            id_organizador=admin.id_usuario,
            estado="PROGRAMADO"
        )
        db.add(evento)
        db.commit()
        db.refresh(evento)

        fake_png = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4"

        # 1. Crear paquete con tallas y stock
        stock_inicial = {"S": 2, "M": 5, "L": 0}
        res_pkg = client.post(
            f"/eventos/{evento.id_evento}/pagos-qr",
            headers=headers_admin,
            data={
                "nombre_paquete": "Kit con Polera Oficial",
                "monto": 80.0,
                "es_individual": False,
                "descripcion": "Incluye polera oficial de la conferencia.",
                "tiene_tallas": True,
                "tallas_stock": json.dumps(stock_inicial)
            },
            files={"file": ("qr_kit.png", fake_png, "image/png")}
        )
        assert res_pkg.status_code == 201
        data_pkg = res_pkg.json()
        assert data_pkg["tiene_tallas"] is True
        assert json.loads(data_pkg["tallas_stock"]) == stock_inicial
        id_qr = data_pkg["id_qr"]

        # 2. Intentar inscribirse con talla agotada (L = 0)
        res_fail = client.post(
            f"/inscripciones/eventos/{evento.id_evento}",
            headers=headers_user,
            json={"id_qr": id_qr, "talla": "L"}
        )
        assert res_fail.status_code == 400
        assert "agotada" in res_fail.json()["detail"].lower()

        # 3. Inscribirse exitosamente con talla M (debería decrementar de 5 a 4)
        res_ok = client.post(
            f"/inscripciones/eventos/{evento.id_evento}",
            headers=headers_user,
            json={"id_qr": id_qr, "talla": "M"}
        )
        assert res_ok.status_code == 201
        data_insc = res_ok.json()
        assert data_insc["id_qr"] == id_qr
        assert data_insc["talla"] == "M"

        # Verificar en base de datos que M bajó a 4
        db_qr = db.query(models.EventoPagoQR).filter(models.EventoPagoQR.id_qr == id_qr).first()
        updated_stock = json.loads(db_qr.tallas_stock)
        assert updated_stock["M"] == 4
        assert updated_stock["S"] == 2

        # 4. Cancelar inscripción y verificar restitución del stock a 5
        id_inscripcion = data_insc["id_inscripcion"]
        res_cancel = client.delete(
            f"/inscripciones/eventos/{id_inscripcion}",
            headers=headers_user
        )
        assert res_cancel.status_code == 204

        db.refresh(db_qr)
        restored_stock = json.loads(db_qr.tallas_stock)
        assert restored_stock["M"] == 5

    finally:
        try:
            db.query(models.InscripcionEvento).filter(models.InscripcionEvento.id_evento == evento.id_evento).delete(synchronize_session=False)
            db.query(models.EventoPagoQR).filter(models.EventoPagoQR.id_evento == evento.id_evento).delete(synchronize_session=False)
            db.query(models.Evento).filter(models.Evento.id_evento == evento.id_evento).delete(synchronize_session=False)
            db.query(models.Usuario).filter(models.Usuario.id_usuario.in_([admin.id_usuario, user.id_usuario])).delete(synchronize_session=False)
            db.commit()
        except Exception:
            db.rollback()
        finally:
            db.close()

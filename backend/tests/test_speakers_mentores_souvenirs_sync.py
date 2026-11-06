import uuid
from datetime import datetime, timedelta
from app.database import SessionLocal, engine
from app.models import models
from app.services import ecosistema_service, souvenirs_service, auth_service, pagos_service

def test_sync_users_to_speakers_and_mentores():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    uid = uuid.uuid4().hex[:8]

    try:
        # 1. Crear un usuario común
        usuario = models.Usuario(
            nombres="Valeria",
            apellidos="Rojas",
            correo=f"valeria_{uid}@meh.com",
            password_hash="fakehash",
            rol="MIEMBRO",
            roles_secundarios=None,
            institucion="Universidad Mayor",
            bio="Apasionada por la Inteligencia Artificial",
            id_estado=1
        )
        db.add(usuario)
        db.commit()
        db.refresh(usuario)

        # Inicialmente no debe estar en speakers ni mentores
        spk_init = db.query(models.Speaker).filter(models.Speaker.id_usuario == usuario.id_usuario).first()
        assert spk_init is None

        # 2. Asignarle rol SPEAKER
        usuario.rol = "SPEAKER"
        db.commit()

        # Listar speakers debe sincronizar automáticamente al usuario
        speakers = ecosistema_service.list_speakers(db)
        spk_found = next((s for s in speakers if s.id_usuario == usuario.id_usuario), None)
        assert spk_found is not None
        assert spk_found.nombre == "Valeria Rojas"
        assert spk_found.correo_contacto == f"valeria_{uid}@meh.com"
        assert spk_found.trabajo_actual == "Universidad Mayor"
        assert spk_found.bio == "Apasionada por la Inteligencia Artificial"

        # 3. Asignarle doble rol MENTOR en roles secundarios
        usuario.roles_secundarios = "MENTOR,VOLUNTARIO"
        db.commit()

        # Listar mentores debe sincronizar automáticamente al usuario como Mentor
        mentores = ecosistema_service.list_mentores(db)
        mnt_found = next((m for m in mentores if m.id_usuario == usuario.id_usuario), None)
        assert mnt_found is not None
        assert mnt_found.nombre == "Valeria Rojas"

        # Y también debe figurar en la lista de voluntarios
        voluntarios = ecosistema_service.list_voluntarios(db)
        vol_found = next((v for v in voluntarios if v["id_usuario"] == usuario.id_usuario), None)
        assert vol_found is not None
        assert "SPEAKER" in vol_found["roles"]
        assert "MENTOR" in vol_found["roles"]
        assert "VOLUNTARIO" in vol_found["roles"]
    finally:
        db.close()


def test_mis_pedidos_souvenirs_and_pagos_hydration():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    uid = uuid.uuid4().hex[:8]

    try:
        # Crear usuario comprador y admin
        admin = models.Usuario(
            nombres="Admin",
            apellidos="Central",
            correo=f"admin_souv_{uid}@meh.com",
            password_hash="hash",
            rol="ADMIN",
            id_estado=1
        )
        comprador = models.Usuario(
            nombres="Lucas",
            apellidos="Silva",
            correo=f"lucas_{uid}@meh.com",
            password_hash="hash",
            rol="MIEMBRO",
            id_estado=1
        )
        db.add_all([admin, comprador])
        db.commit()
        db.refresh(admin)
        db.refresh(comprador)

        # Crear evento
        evento = models.Evento(
            titulo=f"Seminario Cloud {uid}",
            descripcion="Seminario de Cloud Computing",
            fecha_inicio=datetime.utcnow() + timedelta(days=2),
            modalidad="PRESENCIAL",
            tipo_evento="SEMINARIO",
            id_estado=1
        )
        db.add(evento)
        db.commit()
        db.refresh(evento)

        # Crear producto souvenir
        producto = models.Producto(
            nombre=f"Polera Oficial {uid}",
            descripcion="Polera algodón azul marino",
            precio=65.0,
            stock=20,
            categoria="SOUVENIR",
            id_estado=2,
            activo=True
        )
        db.add(producto)
        db.commit()
        db.refresh(producto)

        # Registrar venta de souvenir vinculada al evento
        pedido_resp = souvenirs_service.create_pedido(
            db=db,
            id_usuario=comprador.id_usuario,
            items=[{"id_producto": producto.id_producto, "cantidad": 2}],
            admin_id=admin.id_usuario,
            metodo_pago="EFECTIVO",
            id_evento=evento.id_evento,
            notas="Entrega en mesa de bienvenida"
        )
        assert pedido_resp["total"] == 130.0

        # Consultar mis pedidos de souvenirs
        mis_pedidos = souvenirs_service.list_pedidos_usuario(db, comprador.id_usuario)
        assert len(mis_pedidos) >= 1
        p_comp = next((p for p in mis_pedidos if p["id_pedido"] == pedido_resp["id_pedido"]), None)
        assert p_comp is not None
        assert p_comp["evento_titulo"] == f"Seminario Cloud {uid}"
        assert len(p_comp["detalles"]) == 1
        assert p_comp["detalles"][0]["producto_nombre"] == f"Polera Oficial {uid}"
        assert p_comp["detalles"][0]["cantidad"] == 2

        # Verificar que el pago asociado se hidrata correctamente con nombres de productos y evento
        pago_souvenir = db.query(models.Pago).filter(
            models.Pago.id_usuario == comprador.id_usuario,
            models.Pago.tipo_referencia == "SOUVENIR"
        ).first()
        assert pago_souvenir is not None
        pagos_service._hydrate_pago_details(db, pago_souvenir)
        assert f"Polera Oficial {uid}" in pago_souvenir.detalles_referencia
        assert f"Seminario Cloud {uid}" in pago_souvenir.detalles_referencia
    finally:
        db.close()

def test_usuarios_direct_and_auth_endpoints():
    from fastapi.testclient import TestClient
    from main import app
    from app.core.auth import create_access_token

    client = TestClient(app)
    db = SessionLocal()
    uid = uuid.uuid4().hex[:8]
    try:
        admin = models.Usuario(
            nombres="AdminUser",
            apellidos="Test",
            correo=f"admin_eco_{uid}@meh.com",
            password_hash="fakehash",
            rol="ADMIN",
            id_estado=1
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

        token = create_access_token(data={"sub": admin.correo})
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Test GET /auth/usuarios
        r1 = client.get("/auth/usuarios", headers=headers)
        assert r1.status_code == 200
        assert isinstance(r1.json(), list)

        # 2. Test GET /usuarios
        r2 = client.get("/usuarios", headers=headers)
        assert r2.status_code == 200
        assert isinstance(r2.json(), list)

        # 3. Test GET /usuarios/?skip=0&limit=500
        r3 = client.get("/usuarios/?skip=0&limit=500", headers=headers)
        assert r3.status_code == 200
        assert isinstance(r3.json(), list)
    finally:
        db.close()

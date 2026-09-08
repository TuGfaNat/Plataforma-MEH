import pytest
import uuid
from datetime import datetime
from fastapi.testclient import TestClient
from main import app
from app.database import SessionLocal
from app.models import models
from app.core import auth as auth_core

client = TestClient(app)

def test_anuncios_targeting_and_category_filtering():
    """Valida la segmentación de anuncios por roles, eventos y el filtrado por categoría."""
    db = SessionLocal()
    unique_id = uuid.uuid4().hex[:8]

    try:
        # 1. Crear usuarios de prueba
        admin_user = models.Usuario(
            nombres="Admin", apellidos="Test", correo=f"admin_{unique_id}@meh.com",
            password_hash="fake", rol="ADMIN"
        )
        org_user = models.Usuario(
            nombres="Org", apellidos="Test", correo=f"org_{unique_id}@meh.com",
            password_hash="fake", rol="ORGANIZADOR"
        )
        miembro_inscrito = models.Usuario(
            nombres="Inscrito", apellidos="Test", correo=f"inscrito_{unique_id}@meh.com",
            password_hash="fake", rol="MIEMBRO"
        )
        miembro_no_inscrito = models.Usuario(
            nombres="NoInscrito", apellidos="Test", correo=f"noinsc_{unique_id}@meh.com",
            password_hash="fake", rol="MIEMBRO"
        )
        db.add_all([admin_user, org_user, miembro_inscrito, miembro_no_inscrito])
        db.commit()
        db.refresh(admin_user)
        db.refresh(org_user)
        db.refresh(miembro_inscrito)
        db.refresh(miembro_no_inscrito)

        # 2. Crear evento de prueba
        evento_test = models.Evento(
            titulo=f"Hackathon Test {unique_id}",
            descripcion="Evento de prueba para segmentación",
            tipo_evento="CONFERENCIA",
            modalidad="PRESENCIAL",
            fecha_inicio=datetime.utcnow(),
            fecha_fin=datetime.utcnow(),
            capacidad_max=50,
            id_organizador=org_user.id_usuario,
            estado="PROGRAMADO"
        )
        db.add(evento_test)
        db.commit()
        db.refresh(evento_test)

        # 3. Inscribir únicamente al miembro 1
        inscripcion = models.InscripcionEvento(
            id_usuario=miembro_inscrito.id_usuario,
            id_evento=evento_test.id_evento,
            estado_inscripcion="CONFIRMADA",
            id_estado=1
        )
        db.add(inscripcion)
        db.commit()

        # 4. Crear anuncios con diferente segmentación
        # A) Global
        anuncio_global = models.Anuncio(
            titulo=f"Global {unique_id}",
            contenido="Para todos",
            tipo="INFO",
            categoria="GENERAL",
            roles_destino="TODOS",
            activo=True,
            id_autor=admin_user.id_usuario
        )
        # B) Solo Organizadores
        anuncio_staff = models.Anuncio(
            titulo=f"Staff Only {unique_id}",
            contenido="Solo organizadores y staff",
            tipo="ALERTA",
            categoria="COMUNIDAD",
            roles_destino="ORGANIZADOR,ADMIN",
            activo=True,
            id_autor=admin_user.id_usuario
        )
        # C) Vinculado a Evento (solo inscritos)
        anuncio_evento_privado = models.Anuncio(
            titulo=f"Info Evento {unique_id}",
            contenido="Solo participantes del evento",
            tipo="INFO",
            categoria="EVENTO",
            roles_destino="TODOS",
            id_evento=evento_test.id_evento,
            solo_inscritos_evento=True,
            activo=True,
            id_autor=admin_user.id_usuario
        )
        # D) Anuncio Academia
        anuncio_academia = models.Anuncio(
            titulo=f"Curso IA {unique_id}",
            contenido="Curso especializado",
            tipo="NUEVO",
            categoria="ACADEMIA",
            roles_destino="TODOS",
            activo=True,
            id_autor=admin_user.id_usuario
        )
        db.add_all([anuncio_global, anuncio_staff, anuncio_evento_privado, anuncio_academia])
        db.commit()

        # Tokens
        token_admin = auth_core.create_access_token(data={"sub": admin_user.correo, "rol": admin_user.rol})
        token_org = auth_core.create_access_token(data={"sub": org_user.correo, "rol": org_user.rol})
        token_inscrito = auth_core.create_access_token(data={"sub": miembro_inscrito.correo, "rol": miembro_inscrito.rol})
        token_no_inscrito = auth_core.create_access_token(data={"sub": miembro_no_inscrito.correo, "rol": miembro_no_inscrito.rol})

        h_admin = {"Authorization": f"Bearer {token_admin}"}
        h_org = {"Authorization": f"Bearer {token_org}"}
        h_inscrito = {"Authorization": f"Bearer {token_inscrito}"}
        h_no_inscrito = {"Authorization": f"Bearer {token_no_inscrito}"}

        # --- Test 1: Visibilidad de ADMIN (ve todos los anuncios) ---
        res_admin = client.get("/comunidad/anuncios", headers=h_admin)
        assert res_admin.status_code == 200
        titulos_admin = [a["titulo"] for a in res_admin.json()]
        assert anuncio_global.titulo in titulos_admin
        assert anuncio_staff.titulo in titulos_admin
        assert anuncio_evento_privado.titulo in titulos_admin
        assert anuncio_academia.titulo in titulos_admin

        # --- Test 2: Visibilidad de ORGANIZADOR (ve global, staff, pero no evento privado a menos que sea autor/admin/inscrito) ---
        res_org = client.get("/comunidad/anuncios", headers=h_org)
        assert res_org.status_code == 200
        titulos_org = [a["titulo"] for a in res_org.json()]
        assert anuncio_global.titulo in titulos_org
        assert anuncio_staff.titulo in titulos_org
        assert anuncio_academia.titulo in titulos_org

        # --- Test 3: Visibilidad de MIEMBRO INSCRITO en evento ---
        res_inscrito = client.get("/comunidad/anuncios", headers=h_inscrito)
        assert res_inscrito.status_code == 200
        titulos_inscrito = [a["titulo"] for a in res_inscrito.json()]
        assert anuncio_global.titulo in titulos_inscrito
        assert anuncio_academia.titulo in titulos_inscrito
        assert anuncio_evento_privado.titulo in titulos_inscrito  # Inscrito SI debe verlo
        assert anuncio_staff.titulo not in titulos_inscrito  # Staff NO debe verlo

        # --- Test 4: Visibilidad de MIEMBRO NO INSCRITO en evento ---
        res_no_inscrito = client.get("/comunidad/anuncios", headers=h_no_inscrito)
        assert res_no_inscrito.status_code == 200
        titulos_no_inscrito = [a["titulo"] for a in res_no_inscrito.json()]
        assert anuncio_global.titulo in titulos_no_inscrito
        assert anuncio_academia.titulo in titulos_no_inscrito
        assert anuncio_evento_privado.titulo not in titulos_no_inscrito  # NO inscrito NO debe verlo
        assert anuncio_staff.titulo not in titulos_no_inscrito  # Staff NO debe verlo

        # --- Test 5: Filtrado por Categoría (categoria=ACADEMIA) ---
        res_cat = client.get("/comunidad/anuncios?categoria=ACADEMIA", headers=h_admin)
        assert res_cat.status_code == 200
        titulos_cat = [a["titulo"] for a in res_cat.json()]
        assert anuncio_academia.titulo in titulos_cat
        assert anuncio_global.titulo not in titulos_cat

        # --- Test 6: Filtrado por Evento (id_evento=...) ---
        res_ev = client.get(f"/comunidad/anuncios?id_evento={evento_test.id_evento}", headers=h_admin)
        assert res_ev.status_code == 200
        titulos_ev = [a["titulo"] for a in res_ev.json()]
        assert anuncio_evento_privado.titulo in titulos_ev
        assert anuncio_global.titulo not in titulos_ev

    finally:
        # Limpieza de registros creados en el test
        try:
            db.query(models.Anuncio).filter(models.Anuncio.titulo.like(f"%{unique_id}%")).delete(synchronize_session=False)
            db.query(models.InscripcionEvento).filter(models.InscripcionEvento.id_usuario.in_([miembro_inscrito.id_usuario, miembro_no_inscrito.id_usuario])).delete(synchronize_session=False)
            db.query(models.Evento).filter(models.Evento.id_evento == evento_test.id_evento).delete(synchronize_session=False)
            db.query(models.Usuario).filter(models.Usuario.id_usuario.in_([admin_user.id_usuario, org_user.id_usuario, miembro_inscrito.id_usuario, miembro_no_inscrito.id_usuario])).delete(synchronize_session=False)
            db.commit()
        except Exception:
            db.rollback()
        finally:
            db.close()


def test_create_anuncio_targeted_email():
    """Verifica que el envío de emails al crear un anuncio respete la segmentación."""
    from unittest.mock import patch
    db = SessionLocal()
    unique_id = uuid.uuid4().hex[:8]

    try:
        admin_user = models.Usuario(
            nombres="AdminEmail", apellidos="Test", correo=f"admin_em_{unique_id}@meh.com",
            password_hash="fake", rol="ADMIN", activo=True
        )
        org_user = models.Usuario(
            nombres="OrgEmail", apellidos="Test", correo=f"org_em_{unique_id}@meh.com",
            password_hash="fake", rol="ORGANIZADOR", activo=True
        )
        miembro_user = models.Usuario(
            nombres="MiembroEmail", apellidos="Test", correo=f"miembro_em_{unique_id}@meh.com",
            password_hash="fake", rol="MIEMBRO", activo=True
        )
        db.add_all([admin_user, org_user, miembro_user])
        db.commit()
        db.refresh(admin_user)
        db.refresh(org_user)
        db.refresh(miembro_user)

        token_admin = auth_core.create_access_token(data={"sub": admin_user.correo, "rol": admin_user.rol})
        h_admin = {"Authorization": f"Bearer {token_admin}"}

        with patch("app.services.email_service.notify_nuevo_anuncio") as mock_notify:
            # Crear anuncio segmentado solo para ORGANIZADOR
            payload = {
                "titulo": f"Solo Org {unique_id}",
                "contenido": "Mensaje para organizadores",
                "tipo": "INFO",
                "categoria": "GENERAL",
                "roles_destino": "ORGANIZADOR",
                "enviar_email": True,
                "activo": True
            }
            res = client.post("/comunidad/anuncios", json=payload, headers=h_admin)
            assert res.status_code == 201

            # Verificar a quiénes se llamó mock_notify
            called_emails = [call.kwargs.get("email") for call in mock_notify.call_args_list]
            assert org_user.correo in called_emails
            assert miembro_user.correo not in called_emails

    finally:
        try:
            db.query(models.Anuncio).filter(models.Anuncio.titulo.like(f"%{unique_id}%")).delete(synchronize_session=False)
            db.query(models.Usuario).filter(models.Usuario.id_usuario.in_([admin_user.id_usuario, org_user.id_usuario, miembro_user.id_usuario])).delete(synchronize_session=False)
            db.commit()
        except Exception:
            db.rollback()
        finally:
            db.close()


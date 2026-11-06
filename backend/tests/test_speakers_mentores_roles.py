import uuid
from fastapi.testclient import TestClient
from main import app
from app.database import SessionLocal, engine
from app.models import models
from app.core import auth as auth_core
from app.core.permissions import (
    has_permission,
    ROLE_ADMIN,
    ROLE_MIEMBRO,
    ROLE_SPEAKER,
    ROLE_MENTOR,
    PERMISSION_SPEAKER_ACCESS,
    PERMISSION_EVENTS_MANAGE,
    PERMISSION_AUDIT_READ,
)

models.Base.metadata.create_all(bind=engine)
client = TestClient(app)


def test_roles_speaker_and_mentor_permissions():
    """Valida que los roles SPEAKER y MENTOR hereden las restricciones de miembro base."""
    # Permisos técnicos directos o heredados
    assert has_permission(ROLE_SPEAKER, PERMISSION_SPEAKER_ACCESS) is True
    assert has_permission(ROLE_SPEAKER, PERMISSION_EVENTS_MANAGE) is False
    assert has_permission(ROLE_SPEAKER, PERMISSION_AUDIT_READ) is False

    assert has_permission(ROLE_MENTOR, PERMISSION_EVENTS_MANAGE) is False
    assert has_permission(ROLE_MENTOR, PERMISSION_AUDIT_READ) is False


def test_assign_roles_speaker_and_mentor():
    """Valida la asignación de roles SPEAKER y MENTOR desde administración."""
    db = SessionLocal()
    uid = uuid.uuid4().hex[:8]

    try:
        admin_user = models.Usuario(
            nombres="Admin", apellidos="Test", correo=f"adm_role_{uid}@meh.com",
            password_hash="fake", rol="ADMIN"
        )
        target_user = models.Usuario(
            nombres="Candidato", apellidos="Test", correo=f"cand_{uid}@meh.com",
            password_hash="fake", rol="MIEMBRO"
        )
        db.add_all([admin_user, target_user])
        db.commit()
        db.refresh(admin_user)
        db.refresh(target_user)

        admin_token = auth_core.create_access_token(data={"sub": admin_user.correo})
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        # 1. Asignar rol SPEAKER
        res_spk = client.put(
            f"/auth/usuarios/{target_user.id_usuario}/rol?nuevo_rol=SPEAKER",
            headers=admin_headers
        )
        assert res_spk.status_code == 200, res_spk.text
        assert res_spk.json()["rol"] == "SPEAKER"

        # 2. Verificar que un SPEAKER no puede realizar acciones administrativas (403)
        spk_token = auth_core.create_access_token(data={"sub": target_user.correo})
        spk_headers = {"Authorization": f"Bearer {spk_token}"}
        res_unauth = client.post(
            "/admin-directories/speakers",
            json={"nombre": "Intento No Autorizado"},
            headers=spk_headers
        )
        assert res_unauth.status_code == 403

        # 3. Asignar rol MENTOR
        res_mnt = client.put(
            f"/auth/usuarios/{target_user.id_usuario}/rol?nuevo_rol=MENTOR",
            headers=admin_headers
        )
        assert res_mnt.status_code == 200, res_mnt.text
        assert res_mnt.json()["rol"] == "MENTOR"

        # 4. Verificar que un MENTOR tampoco puede realizar acciones de administración (403)
        mnt_token = auth_core.create_access_token(data={"sub": target_user.correo})
        mnt_headers = {"Authorization": f"Bearer {mnt_token}"}
        res_unauth_mnt = client.post(
            "/admin-directories/mentores",
            json={"nombre": "Intento No Autorizado Mnt"},
            headers=mnt_headers
        )
        assert res_unauth_mnt.status_code == 403
    finally:
        db.close()


def test_speakers_linked_to_registered_users():
    """Valida la creación de speakers vinculados a usuarios registrados con promoción de rol."""
    db = SessionLocal()
    uid = uuid.uuid4().hex[:8]

    try:
        admin_user = models.Usuario(
            nombres="Admin", apellidos="Test", correo=f"adm_spk_{uid}@meh.com",
            password_hash="fake", rol="ADMIN"
        )
        member_user = models.Usuario(
            nombres="Carlos", apellidos="Conferencista", correo=f"carlos_{uid}@meh.com",
            password_hash="fake", rol="MIEMBRO", institucion="Microsoft"
        )
        db.add_all([admin_user, member_user])
        db.commit()
        db.refresh(admin_user)
        db.refresh(member_user)

        admin_token = auth_core.create_access_token(data={"sub": admin_user.correo})
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        # 1. Crear Speaker vinculando el id_usuario
        payload = {
            "nombre": "Carlos Conferencista",
            "id_usuario": member_user.id_usuario,
            "bio": "Especialista en IA Generativa",
            "trayectoria": "10 años en la industria",
            "trabajo_actual": "Microsoft MVP",
            "correo_contacto": member_user.correo,
            "linkedin_url": "https://linkedin.com/in/carlos",
        }
        res_create = client.post(
            "/admin-directories/speakers",
            json=payload,
            headers=admin_headers
        )
        assert res_create.status_code == 201, res_create.text
        created_spk = res_create.json()
        assert created_spk["id_usuario"] == member_user.id_usuario
        assert created_spk["nombre"] == "Carlos Conferencista"

        # 2. Verificar que el usuario miembro fue automáticamente promovido a SPEAKER
        db.refresh(member_user)
        assert member_user.rol == "SPEAKER"

        # 3. Editar speaker
        id_speaker = created_spk["id_speaker"]
        res_edit = client.put(
            f"/admin-directories/speakers/{id_speaker}",
            json={"trabajo_actual": "Director de Tecnología"},
            headers=admin_headers
        )
        assert res_edit.status_code == 200
        assert res_edit.json()["trabajo_actual"] == "Director de Tecnología"
    finally:
        db.close()


def test_mentores_crud_and_user_linking():
    """Valida el ciclo de vida completo (CRUD) de mentores y vinculación a usuarios."""
    db = SessionLocal()
    uid = uuid.uuid4().hex[:8]

    try:
        admin_user = models.Usuario(
            nombres="Admin", apellidos="Test", correo=f"adm_mnt_{uid}@meh.com",
            password_hash="fake", rol="ADMIN"
        )
        mentor_user = models.Usuario(
            nombres="Lucia", apellidos="Mentora", correo=f"lucia_{uid}@meh.com",
            password_hash="fake", rol="MIEMBRO", institucion="Universidad MEH"
        )
        db.add_all([admin_user, mentor_user])
        db.commit()
        db.refresh(admin_user)
        db.refresh(mentor_user)

        admin_token = auth_core.create_access_token(data={"sub": admin_user.correo})
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        # 1. Crear Mentor
        payload = {
            "nombre": "Lucia Mentora",
            "id_usuario": mentor_user.id_usuario,
            "area_mentoria": "Arquitectura Cloud & Azure DevOps",
            "bio": "Apasionada por formar a la próxima generación tech.",
            "trabajo_actual": "Cloud Solution Architect",
            "correo_contacto": mentor_user.correo,
            "whatsapp_contacto": "+59170012345",
        }
        res = client.post(
            "/admin-directories/mentores",
            json=payload,
            headers=admin_headers
        )
        assert res.status_code == 201, res.text
        mentor_data = res.json()
        assert mentor_data["nombre"] == "Lucia Mentora"
        assert mentor_data["id_usuario"] == mentor_user.id_usuario
        assert mentor_data["area_mentoria"] == "Arquitectura Cloud & Azure DevOps"
        id_mentor = mentor_data["id_mentor"]

        # 2. Verificar promoción automática a rol MENTOR
        db.refresh(mentor_user)
        assert mentor_user.rol == "MENTOR"

        # 3. Listar mentores
        res_list = client.get("/admin-directories/mentores")
        assert res_list.status_code == 200
        items = res_list.json()
        assert any(item["id_mentor"] == id_mentor for item in items)

        # 4. Actualizar mentor
        res_update = client.put(
            f"/admin-directories/mentores/{id_mentor}",
            json={"area_mentoria": "Azure Cloud & MLOps"},
            headers=admin_headers
        )
        assert res_update.status_code == 200
        assert res_update.json()["area_mentoria"] == "Azure Cloud & MLOps"

        # 5. Eliminar (soft delete) mentor
        res_delete = client.delete(
            f"/admin-directories/mentores/{id_mentor}",
            headers=admin_headers
        )
        assert res_delete.status_code == 204

        # 6. Ya no debe figurar en el listado activo
        res_list_after = client.get("/admin-directories/mentores")
        assert not any(item["id_mentor"] == id_mentor for item in res_list_after.json())
    finally:
        db.close()

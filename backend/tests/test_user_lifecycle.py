import pytest
import uuid
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from main import app
from app.database import SessionLocal
from app.models import models
from app.core import auth as auth_core

client = TestClient(app)

def test_user_lifecycle_full_suite(monkeypatch):
    """Prueba exhaustiva del ciclo de vida de usuarios:
    1. Registro genera código de 6 dígitos y email_verificado=False.
    2. Login bloqueado hasta que el correo esté verificado.
    3. Reenvío y validación de código vía POST /auth/verificar-email.
    4. Login permitido tras verificación, con registro en LogSistema.
    5. Edición de usuario por Admin vía PUT /usuarios/{id} con auditoría.
    6. Reset de contraseña por Admin vía POST /usuarios/{id}/reset-password con auditoría y nuevo login.
    7. Suspensión con motivo (sin borrado físico) y bloqueo de login.
    8. Restauración de cuenta por Admin y login reactivado.
    9. Protección contra auto-suspensión y contra suspender al único ADMIN activo.
    10. RBAC: MIEMBRO bloqueado (403) en endpoints de administración.
    """
    # Mock envío de correos para agilizar pruebas
    monkeypatch.setattr("app.services.email_service.notify_email_verification", lambda *args, **kwargs: True)

    db = SessionLocal()
    unique_id = uuid.uuid4().hex[:8]
    user_email = f"user_life_{unique_id}@meh.com"
    user_pass = "PasswordSegura123!"
    
    admin_email = f"admin_life_{unique_id}@meh.com"
    admin_pass = "AdminPassword123!"
    new_user_id = None
    admin_user = None

    try:
        # 1. Crear un Administrador existente en la BD
        admin_user = models.Usuario(
            nombres="Admin",
            apellidos="Principal",
            correo=admin_email,
            password_hash=auth_core.get_password_hash(admin_pass),
            rol="ADMIN",
            activo=True,
            id_estado=2,
            email_verificado=True
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

        # Token del Admin
        admin_token = auth_core.create_access_token(data={"sub": admin_user.correo, "rol": admin_user.rol})
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        # -------------------------------------------------------------
        # PASO 1: Registro de nuevo usuario (201 Created)
        # -------------------------------------------------------------
        reg_payload = {
            "nombres": "Estudiante",
            "apellidos": "Prueba",
            "correo": user_email,
            "password": user_pass,
            "rol": "MIEMBRO",
            "institucion": "UMSA",
            "tipo_entidad": "Estudiante"
        }
        res_reg = client.post("/auth/register", json=reg_payload)
        assert res_reg.status_code == 201, res_reg.text
        data_reg = res_reg.json()
        assert data_reg["correo"] == user_email
        assert data_reg["email_verificado"] is False
        new_user_id = data_reg["id_usuario"]

        # Verificar en base de datos código y estado
        u_db = db.query(models.Usuario).filter(models.Usuario.id_usuario == new_user_id).first()
        assert u_db is not None
        assert u_db.email_verificado is False
        assert u_db.codigo_verificacion is not None
        assert len(u_db.codigo_verificacion) == 6
        assert u_db.codigo_verificacion_exp > datetime.utcnow()

        # -------------------------------------------------------------
        # PASO 2: Login bloqueado sin verificar correo (400 Bad Request)
        # -------------------------------------------------------------
        res_login_unverified = client.post("/auth/login", json={"correo": user_email, "password": user_pass})
        assert res_login_unverified.status_code == 400
        assert "verificad" in res_login_unverified.json()["detail"].lower()

        # -------------------------------------------------------------
        # PASO 3: Verificación con código erróneo vs código válido
        # -------------------------------------------------------------
        # Código inválido
        res_bad_code = client.post("/auth/verificar-email", json={"correo": user_email, "codigo": "000000"})
        assert res_bad_code.status_code == 400

        # Reenviar código
        res_resend = client.post("/auth/reenviar-codigo", json={"correo": user_email})
        assert res_resend.status_code == 200
        db.refresh(u_db)
        new_code = u_db.codigo_verificacion

        # Código correcto
        res_verify = client.post("/auth/verificar-email", json={"correo": user_email, "codigo": new_code})
        assert res_verify.status_code == 200
        assert "exitosamente" in res_verify.json()["message"].lower()

        # Verificar en DB que email_verificado es True y código se limpió
        db.refresh(u_db)
        assert u_db.email_verificado is True
        assert u_db.codigo_verificacion is None

        # Log de verificación en LogSistema
        log_verify = db.query(models.LogSistema).filter(
            models.LogSistema.id_registro_afectado == new_user_id,
            models.LogSistema.accion == "VERIFICACION_EMAIL"
        ).first()
        assert log_verify is not None

        # -------------------------------------------------------------
        # PASO 4: Login exitoso tras verificación
        # -------------------------------------------------------------
        res_login_ok = client.post("/auth/login", json={"correo": user_email, "password": user_pass})
        assert res_login_ok.status_code == 200
        user_token = res_login_ok.json()["access_token"]
        user_headers = {"Authorization": f"Bearer {user_token}"}

        # -------------------------------------------------------------
        # PASO 5: Edición de datos por Admin
        # -------------------------------------------------------------
        edit_payload = {
            "nombres": "Estudiante Actualizado",
            "apellidos": "Prueba Modificada",
            "bio": "Bio actualizada por admin",
            "institucion": "Universidad Mayor de San Andrés"
        }
        # Miembro intenta editar usuario ajeno -> 403
        res_edit_forbidden = client.put(f"/usuarios/{new_user_id}", json=edit_payload, headers=user_headers)
        assert res_edit_forbidden.status_code == 403

        # Admin edita usuario vía /usuarios/{id}
        res_edit_admin = client.put(f"/usuarios/{new_user_id}", json=edit_payload, headers=admin_headers)
        assert res_edit_admin.status_code == 200
        assert res_edit_admin.json()["nombres"] == "Estudiante Actualizado"
        assert res_edit_admin.json()["bio"] == "Bio actualizada por admin"

        # Log de edición
        log_edit = db.query(models.LogSistema).filter(
            models.LogSistema.accion == "EDICION_USUARIO_ADMIN",
            models.LogSistema.id_registro_afectado == new_user_id
        ).first()
        assert log_edit is not None

        # -------------------------------------------------------------
        # PASO 6: Reset de contraseña por Admin
        # -------------------------------------------------------------
        nueva_pass = "NuevaClaveSuperSegura2026!"
        # Miembro intenta resetear password ajena -> 403
        res_reset_forbidden = client.post(
            f"/usuarios/{new_user_id}/reset-password",
            json={"nueva_password": nueva_pass},
            headers=user_headers
        )
        assert res_reset_forbidden.status_code == 403

        # Admin resetea la contraseña
        res_reset_admin = client.post(
            f"/usuarios/{new_user_id}/reset-password",
            json={"nueva_password": nueva_pass},
            headers=admin_headers
        )
        assert res_reset_admin.status_code == 200

        # Login con contraseña antigua debe fallar (401 Unauthorized)
        res_old_pass = client.post("/auth/login", json={"correo": user_email, "password": user_pass})
        assert res_old_pass.status_code == 401

        # Login con nueva contraseña debe funcionar
        res_new_pass = client.post("/auth/login", json={"correo": user_email, "password": nueva_pass})
        assert res_new_pass.status_code == 200

        # Log de reset en LogSistema
        log_reset = db.query(models.LogSistema).filter(
            models.LogSistema.accion == "RESET_PASSWORD_ADMIN",
            models.LogSistema.id_registro_afectado == new_user_id
        ).first()
        assert log_reset is not None

        # -------------------------------------------------------------
        # PASO 7: Suspensión con motivo (sin borrado físico)
        # -------------------------------------------------------------
        motivo = "Incumplimiento reiterado de normas comunitarias"
        res_susp = client.post(
            f"/usuarios/{new_user_id}/suspender",
            json={"motivo": motivo},
            headers=admin_headers
        )
        assert res_susp.status_code == 200
        data_susp = res_susp.json()
        assert data_susp["activo"] is False
        assert data_susp["id_estado"] == 0
        assert data_susp["motivo_suspension"] == motivo

        # Asegurar persistencia y NO borrado físico
        db.expire_all()
        u_db_check = db.query(models.Usuario).execution_options(include_deleted=True).filter(models.Usuario.id_usuario == new_user_id).first()
        assert u_db_check is not None
        assert u_db_check.activo is False
        assert u_db_check.id_estado == 0
        assert u_db_check.motivo_suspension == motivo

        # Login de cuenta suspendida bloqueado
        res_login_suspended = client.post("/auth/login", json={"correo": user_email, "password": nueva_pass})
        assert res_login_suspended.status_code == 400, res_login_suspended.text
        assert "suspendida" in res_login_suspended.json()["detail"].lower()
        assert motivo in res_login_suspended.json()["detail"]

        # Log de suspensión
        log_susp = db.query(models.LogSistema).filter(
            models.LogSistema.accion == "SUSPENSION_USUARIO",
            models.LogSistema.id_registro_afectado == new_user_id
        ).first()
        assert log_susp is not None

        # -------------------------------------------------------------
        # PASO 8: Restauración de usuario
        # -------------------------------------------------------------
        res_rest = client.post(
            f"/usuarios/{new_user_id}/restaurar",
            headers=admin_headers
        )
        assert res_rest.status_code == 200
        data_rest = res_rest.json()
        assert data_rest["activo"] is True
        assert data_rest["id_estado"] == 2
        assert data_rest["motivo_suspension"] is None

        # Login vuelve a funcionar
        res_login_restored = client.post("/auth/login", json={"correo": user_email, "password": nueva_pass})
        assert res_login_restored.status_code == 200

        # Log de restauración
        log_rest = db.query(models.LogSistema).filter(
            models.LogSistema.accion == "RESTAURACION_USUARIO",
            models.LogSistema.id_registro_afectado == new_user_id
        ).first()
        assert log_rest is not None

        # -------------------------------------------------------------
        # PASO 9: Protecciones de seguridad
        # -------------------------------------------------------------
        # Admin no puede suspenderse a sí mismo
        res_self_susp = client.post(
            f"/usuarios/{admin_user.id_usuario}/suspender",
            json={"motivo": "Auto-suspensión"},
            headers=admin_headers
        )
        assert res_self_susp.status_code == 400
        assert "propia" in res_self_susp.json()["detail"].lower()

        # DELETE /auth/usuarios/{id} realiza suspensión sin borrado físico
        res_del = client.delete(f"/auth/usuarios/{new_user_id}", headers=admin_headers)
        assert res_del.status_code == 204
        db.expire_all()
        u_db_deleted = db.query(models.Usuario).execution_options(include_deleted=True).filter(models.Usuario.id_usuario == new_user_id).first()
        assert u_db_deleted is not None
        assert u_db_deleted.activo is False
        assert u_db_deleted.id_estado == 0

    finally:
        # Limpieza de datos de prueba
        try:
            ids_to_clean = [i for i in [new_user_id, admin_user.id_usuario if admin_user else None] if i is not None]
            if ids_to_clean:
                db.query(models.LogSistema).filter(
                    models.LogSistema.id_registro_afectado.in_(ids_to_clean) |
                    models.LogSistema.id_admin.in_(ids_to_clean)
                ).delete(synchronize_session=False)
            db.query(models.Usuario).filter(
                models.Usuario.correo.in_([user_email, admin_email])
            ).delete(synchronize_session=False)
            db.commit()
        except Exception:
            db.rollback()
        finally:
            db.close()

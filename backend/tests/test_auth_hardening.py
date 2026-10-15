import pytest
import uuid
import os
import hashlib
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from main import app
from app.database import SessionLocal, engine
from app.models import models
from app.core import auth as auth_core
from app.core.permissions import ALL_DB_ROLES, ROLE_ADMIN, ROLE_ORGANIZADOR, ROLE_MIEMBRO
from app.services import email_service

models.Base.metadata.create_all(bind=engine)
client = TestClient(app)

@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

def create_test_user(db, rol="MIEMBRO", password="Password123", es_nuevo=True, activo=True):
    unique = uuid.uuid4().hex[:8]
    user = models.Usuario(
        nombres=f"User_{unique}",
        apellidos="Test",
        correo=f"test_{unique}@meh.com",
        password_hash=auth_core.get_password_hash(password),
        rol=rol,
        es_nuevo=es_nuevo,
        activo=activo,
        id_estado=2
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_auth_token(correo, rol="MIEMBRO"):
    return auth_core.create_access_token(data={"sub": correo, "rol": rol})


# -------------------------------------------------------------------------
# 1. Validación de Contraseña Fuerte (422 en contraseñas débiles)
# -------------------------------------------------------------------------

def test_weak_password_registration_rejected(db):
    """El registro rechaza contraseñas débiles con HTTP 422."""
    unique = uuid.uuid4().hex[:8]

    # Corta (< 8 caracteres)
    res_short = client.post("/auth/register", json={
        "nombres": "Ana", "apellidos": "Perez",
        "correo": f"ana_{unique}@meh.com", "password": "Ab1"
    })
    assert res_short.status_code == 422

    # Solo letras (sin dígitos)
    res_letters = client.post("/auth/register", json={
        "nombres": "Ana", "apellidos": "Perez",
        "correo": f"ana_l_{unique}@meh.com", "password": "SoloLetrasLargas"
    })
    assert res_letters.status_code == 422

    # Solo números (sin letras)
    res_digits = client.post("/auth/register", json={
        "nombres": "Ana", "apellidos": "Perez",
        "correo": f"ana_d_{unique}@meh.com", "password": "1234567890"
    })
    assert res_digits.status_code == 422

    # Válida (>= 8 caracteres con letras y números)
    res_valid = client.post("/auth/register", json={
        "nombres": "Ana", "apellidos": "Perez",
        "correo": f"ana_v_{unique}@meh.com", "password": "Password123"
    })
    assert res_valid.status_code == 201


def test_weak_password_reset_rejected():
    """Reset password rechaza contraseñas débiles con 422."""
    res = client.post("/auth/reset-password", json={
        "token": "dummy_token",
        "nuevo_password": "weak"
    })
    assert res.status_code == 422


def test_weak_password_cambiar_password_rejected(db):
    """PUT /auth/me/password rechaza contraseñas nuevas débiles con 422."""
    user = create_test_user(db, password="OldPassword123")
    token = get_auth_token(user.correo, user.rol)

    res = client.put(
        "/auth/me/password",
        json={"password_actual": "OldPassword123", "nuevo_password": "short"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 422


# -------------------------------------------------------------------------
# 2. Reset Token hasheado en SHA-256 e invalidación de tokens previos
# -------------------------------------------------------------------------

def test_reset_token_sha256_storage_and_invalidation(db, monkeypatch):
    """Valida almacenamiento en sha256, invalidación del token previo y expiración."""
    user = create_test_user(db, password="OldPassword123")
    captured_tokens = []

    def mock_notify_reset_password(email, nombre, token):
        captured_tokens.append(token)
        return True

    monkeypatch.setattr(email_service, "notify_reset_password", mock_notify_reset_password)

    # 1er forgot_password
    res1 = client.post("/auth/forgot-password", json={"correo": user.correo})
    assert res1.status_code == 200
    assert len(captured_tokens) == 1
    raw_token_1 = captured_tokens[0]

    # Verificar en DB que se guarda el hash sha256 y NO el token plano
    db.refresh(user)
    expected_hash_1 = hashlib.sha256(raw_token_1.encode("utf-8")).hexdigest()
    assert user.reset_token == expected_hash_1
    assert user.reset_token != raw_token_1

    # 2do forgot_password: debe invalidar el token anterior
    res2 = client.post("/auth/forgot-password", json={"correo": user.correo})
    assert res2.status_code == 200
    assert len(captured_tokens) == 2
    raw_token_2 = captured_tokens[1]
    assert raw_token_1 != raw_token_2

    db.refresh(user)
    expected_hash_2 = hashlib.sha256(raw_token_2.encode("utf-8")).hexdigest()
    assert user.reset_token == expected_hash_2

    # Intentar usar el token viejo (raw_token_1) -> rechazado 400
    res_old = client.post("/auth/reset-password", json={
        "token": raw_token_1,
        "nuevo_password": "NewPassword456"
    })
    assert res_old.status_code == 400
    assert "inválido o ha expirado" in res_old.json()["detail"]

    # Usar el token nuevo (raw_token_2) -> éxito 200
    res_new = client.post("/auth/reset-password", json={
        "token": raw_token_2,
        "nuevo_password": "NewPassword456"
    })
    assert res_new.status_code == 200

    # Token queda limpio y es_nuevo = False
    db.refresh(user)
    assert user.reset_token is None
    assert user.reset_token_exp is None
    assert user.es_nuevo is False
    assert auth_core.verify_password("NewPassword456", user.password_hash)

    # Reusar el mismo token raw_token_2 -> rechazado 400
    res_reused = client.post("/auth/reset-password", json={
        "token": raw_token_2,
        "nuevo_password": "AnotherPassword789"
    })
    assert res_reused.status_code == 400


def test_reset_token_expired_rejected(db, monkeypatch):
    """Un token expirado es rechazado con 400."""
    user = create_test_user(db)
    raw_token = "valid_token_string_123"
    token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
    
    # Expiró hace 10 minutos
    user.reset_token = token_hash
    user.reset_token_exp = datetime.utcnow() - timedelta(minutes=10)
    db.commit()

    res = client.post("/auth/reset-password", json={
        "token": raw_token,
        "nuevo_password": "NewPassword456"
    })
    assert res.status_code == 400
    assert "inválido o ha expirado" in res.json()["detail"]


# -------------------------------------------------------------------------
# 3. Flujo PUT /auth/me/password (Cambiar Contraseña Autenticado)
# -------------------------------------------------------------------------

def test_cambiar_password_flow_and_es_nuevo(db):
    """Valida PUT /auth/me/password, rechazo de contraseña actual incorrecta y actualización de es_nuevo a False."""
    user = create_test_user(db, password="InitialTempPassword123", es_nuevo=True)
    token = get_auth_token(user.correo, user.rol)

    # 1. Contraseña actual incorrecta -> 401
    res_wrong = client.put(
        "/auth/me/password",
        json={"password_actual": "WrongPassword123", "nuevo_password": "NewDefinitivePassword123"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res_wrong.status_code == 401

    # 2. Contraseña actual correcta -> 200
    res_ok = client.put(
        "/auth/me/password",
        json={"password_actual": "InitialTempPassword123", "nuevo_password": "NewDefinitivePassword123"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res_ok.status_code == 200

    db.refresh(user)
    assert user.es_nuevo is False
    assert auth_core.verify_password("NewDefinitivePassword123", user.password_hash)

    # 3. Puede iniciar sesión con la nueva contraseña
    login_res = client.post("/auth/login", json={
        "correo": user.correo,
        "password": "NewDefinitivePassword123"
    })
    assert login_res.status_code == 200
    assert login_res.json()["es_nuevo"] is False


# -------------------------------------------------------------------------
# 4. Asignación de Roles: Validación de 6 roles válidos, auto-cambio y último ADMIN
# -------------------------------------------------------------------------

def test_update_user_role_invalid_role_returns_400(db):
    """Cambio de rol rechaza roles que no pertenecen a ALL_DB_ROLES con 400."""
    admin = create_test_user(db, rol=ROLE_ADMIN)
    target_user = create_test_user(db, rol=ROLE_MIEMBRO)
    admin_token = get_auth_token(admin.correo, admin.rol)

    res = client.put(
        f"/auth/usuarios/{target_user.id_usuario}/rol?nuevo_rol=SUPERUSER",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res.status_code == 400
    assert "Rol inválido" in res.json()["detail"]


def test_update_user_role_self_change_blocked(db):
    """Un administrador no puede cambiarse el rol a sí mismo (400)."""
    admin = create_test_user(db, rol=ROLE_ADMIN)
    admin_token = get_auth_token(admin.correo, admin.rol)

    res = client.put(
        f"/auth/usuarios/{admin.id_usuario}/rol?nuevo_rol=MIEMBRO",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res.status_code == 400
    assert "No puedes cambiarte el rol a ti mismo" in res.json()["detail"]


def test_update_user_role_last_admin_protection(db):
    """No se permite degradar al único administrador activo del sistema (400 / ValidacionNegocioError)."""
    from app.core.exceptions import ValidacionNegocioError
    from app.services import auth_service

    existing_admins = db.query(models.Usuario).filter(models.Usuario.rol == ROLE_ADMIN).all()
    for ea in existing_admins:
        ea.activo = False
    db.commit()

    try:
        admin_a = create_test_user(db, rol=ROLE_ADMIN, activo=True)
        admin_b = create_test_user(db, rol=ROLE_ADMIN, activo=True)
        token_a = get_auth_token(admin_a.correo, admin_a.rol)

        # Con 2 admins activos, degradar a admin_b es permitido (200)
        res_ok = client.put(
            f"/auth/usuarios/{admin_b.id_usuario}/rol?nuevo_rol=ORGANIZADOR",
            headers={"Authorization": f"Bearer {token_a}"}
        )
        assert res_ok.status_code == 200

        # Ahora solo queda 1 admin activo (admin_a).
        # Demote del único admin activo debe arrojar ValidacionNegocioError
        mock_admin_caller = models.Usuario(id_usuario=999999, rol=ROLE_ADMIN, activo=True)
        with pytest.raises(ValidacionNegocioError) as exc_info:
            auth_service.update_user_role(db, mock_admin_caller, admin_a.id_usuario, "ORGANIZADOR")
        assert "No se puede degradar al único administrador activo" in str(exc_info.value)

    finally:
        for ea in existing_admins:
            ea.activo = True
        db.commit()


# -------------------------------------------------------------------------
# 5. Comportamiento sin SMTP (log en desarrollo, seguro en producción)
# -------------------------------------------------------------------------

def test_smtp_unconfigured_logging_behavior(monkeypatch):
    """En desarrollo se loguea la URL de reset si SMTP no está configurado; nunca en producción."""
    import logging

    logs = []
    class MockHandler(logging.Handler):
        def emit(self, record):
            logs.append(record.getMessage())

    logger = logging.getLogger("app.services.email_service")
    logger.setLevel(logging.INFO)
    handler = MockHandler()
    logger.addHandler(handler)

    monkeypatch.setattr(email_service, "is_smtp_configured", lambda: False)

    # 1. En entorno de desarrollo: registra la URL en el log
    monkeypatch.setenv("ENVIRONMENT", "development")
    res_dev = email_service.notify_reset_password("dev@test.com", "Dev User", "token_dev_123")
    assert res_dev is False
    assert any("dev@test.com" in msg and "token_dev_123" in msg for msg in logs)

    # 2. En entorno de producción: NO loguea la URL ni el token
    logs.clear()
    monkeypatch.setenv("ENVIRONMENT", "production")
    res_prod = email_service.notify_reset_password("prod@test.com", "Prod User", "token_prod_secret")
    assert res_prod is False
    assert not any("token_prod_secret" in msg for msg in logs)
    assert any("SMTP no configurado" in msg for msg in logs)

    logger.removeHandler(handler)

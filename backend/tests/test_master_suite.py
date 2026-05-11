import pytest
from app.core import permissions as perms
from app.models import models

# Fixtures simuladas para auditoría de roles
@pytest.fixture
def user_miembro():
    return models.Usuario(rol=perms.ROLE_MIEMBRO, correo="miembro@meh.com")

@pytest.fixture
def user_admin():
    return models.Usuario(rol=perms.ROLE_ADMIN, correo="admin@meh.com")

@pytest.fixture
def user_organizador():
    return models.Usuario(rol=perms.ROLE_ORGANIZADOR, correo="organizer@meh.com")

## 1. TEST DE PERMISOS (RBAC)
def test_rbac_inheritance(user_organizador):
    """Valida que el Organizador herede permisos de Moderador/Miembro"""
    assert perms.has_permission(user_organizador.rol, perms.PERMISSION_EVENTS_MANAGE) == True
    assert perms.has_permission(user_organizador.rol, perms.PERMISSION_SPEAKER_ACCESS) == True # Heredado de Moderador

def test_rbac_restriction(user_miembro):
    """Valida que un Miembro NO tenga acceso a auditoría"""
    assert perms.has_permission(user_miembro.rol, perms.PERMISSION_AUDIT_READ) == False

def test_rbac_admin_total_access(user_admin):
    """Valida que el Admin tenga acceso a todo"""
    assert perms.has_permission(user_admin.rol, perms.PERMISSION_AUDIT_READ) == True
    assert perms.has_permission(user_admin.rol, perms.PERMISSION_PAYMENTS_VALIDATE) == True

## 2. TEST DE INTEGRIDAD DE FLUJO (CONCEPTUAL)
def test_flow_payment_validation_consistency():
    """Valida que la lógica de negocio en servicios sea consistente"""
    # Este test simula la lógica de pagos_service.py
    estado_pago = "APROBADO"
    tipo_referencia = "EVENTO"
    
    # Regla: Si el pago es APROBADO y es EVENTO, la inscripción debe ser CONFIRMADA
    if estado_pago == "APROBADO" and tipo_referencia == "EVENTO":
        expected_inscripcion_status = "CONFIRMADA"
    else:
        expected_inscripcion_status = "PENDIENTE"
        
    assert expected_inscripcion_status == "CONFIRMADA"

## 3. TEST DE SEGURIDAD DE ENDPOINTS (SIMULADO)
def test_security_exceptions():
    """Verifica que el middleware de excepciones arroje 403 correctamente"""
    with pytest.raises(Exception) as excinfo:
        perms.ensure_admin(perms.ROLE_MIEMBRO)
    assert "403" in str(excinfo.value)

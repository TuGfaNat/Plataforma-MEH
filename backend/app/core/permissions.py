from typing import Dict, Iterable, List, Set
from .exceptions import PermisoDenegadoError

ROLE_VISITANTE = "VISITANTE"
ROLE_ADMIN = "ADMIN"
ROLE_ORGANIZADOR = "ORGANIZADOR"
ROLE_EMBAJADOR = "EMBAJADOR"
ROLE_MODERADOR = "MODERADOR"
ROLE_SOPORTE = "SOPORTE"
ROLE_MIEMBRO = "MIEMBRO"

ADMIN_OR_ORGANIZER_ROLES = [ROLE_ADMIN, ROLE_ORGANIZADOR]
ALL_DB_ROLES = [ROLE_ADMIN, ROLE_ORGANIZADOR, ROLE_EMBAJADOR, ROLE_MODERADOR, ROLE_SOPORTE, ROLE_MIEMBRO]

PERMISSION_USERS_READ = "users.read"
PERMISSION_EVENTS_MANAGE = "events.manage"
PERMISSION_ATTENDANCE_SCAN = "attendance.scan"
PERMISSION_COURSES_MANAGE = "courses.manage"
PERMISSION_ANNOUNCEMENTS_MANAGE = "announcements.manage"
PERMISSION_PAYMENTS_READ_ALL = "payments.read_all"
PERMISSION_PAYMENTS_VALIDATE = "payments.validate"
PERMISSION_AUDIT_READ = "audit.read"
PERMISSION_VIP_ACCESS = "vip.access"
PERMISSION_SPEAKER_ACCESS = "speaker.access"
PERMISSION_BADGES_MANAGE = "badges.manage"

_ROLE_INHERITANCE: Dict[str, List[str]] = {
    ROLE_MIEMBRO: [],
    ROLE_EMBAJADOR: [ROLE_MIEMBRO],
    ROLE_MODERADOR: [ROLE_EMBAJADOR],
    ROLE_SOPORTE: [ROLE_MIEMBRO],
    ROLE_ORGANIZADOR: [ROLE_MODERADOR],
    ROLE_ADMIN: [ROLE_ORGANIZADOR, ROLE_SOPORTE],
}

_DIRECT_PERMISSIONS: Dict[str, Set[str]] = {
    ROLE_MIEMBRO: set(),
    ROLE_EMBAJADOR: {PERMISSION_VIP_ACCESS},
    ROLE_MODERADOR: {
        PERMISSION_SPEAKER_ACCESS,
        PERMISSION_EVENTS_MANAGE,
        PERMISSION_COURSES_MANAGE,
    },
    ROLE_SOPORTE: {
        PERMISSION_USERS_READ,
        PERMISSION_PAYMENTS_READ_ALL,
        PERMISSION_PAYMENTS_VALIDATE,
        PERMISSION_COURSES_MANAGE,
        PERMISSION_BADGES_MANAGE,
    },
    ROLE_ORGANIZADOR: {
        PERMISSION_USERS_READ,
        PERMISSION_EVENTS_MANAGE,
        PERMISSION_ATTENDANCE_SCAN,
        PERMISSION_COURSES_MANAGE,
        PERMISSION_ANNOUNCEMENTS_MANAGE,
        PERMISSION_PAYMENTS_READ_ALL,
        PERMISSION_PAYMENTS_VALIDATE,
        PERMISSION_BADGES_MANAGE,
    },
    ROLE_ADMIN: {PERMISSION_AUDIT_READ},
}

def get_effective_permissions(role: str) -> Set[str]:
    """Calcula el conjunto de permisos totales de un rol, incluyendo la herencia."""
    visited: Set[str] = set()

    def _collect(current_role: str) -> Set[str]:
        if current_role in visited:
            return set()
        visited.add(current_role)

        permissions = set(_DIRECT_PERMISSIONS.get(current_role, set()))
        for parent_role in _ROLE_INHERITANCE.get(current_role, []):
            permissions.update(_collect(parent_role))
        return permissions

    return _collect(role)

def has_permission(role: str, permission: str) -> bool:
    """Verifica si un rol posee un permiso específico (directo o heredado)."""
    return permission in get_effective_permissions(role)

def ensure_roles(user_role: str, allowed_roles: Iterable[str], detail: str = "Rol no autorizado") -> None:
    """Valida que el usuario pertenezca a uno de los roles permitidos."""
    if user_role not in allowed_roles:
        raise PermisoDenegadoError(detail)

def ensure_admin(user_role: str, detail: str = "Acceso restringido a Administradores") -> None:
    """Valida que el usuario sea estrictamente ADMINISTRADOR."""
    ensure_roles(user_role, [ROLE_ADMIN], detail)

def ensure_permission(user_role: str, permission: str, detail: str = "No tienes el permiso requerido") -> None:
    """Valida que el usuario tenga el permiso técnico necesario."""
    if not has_permission(user_role, permission):
        raise PermisoDenegadoError(detail)

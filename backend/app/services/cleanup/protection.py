import os
import json
from typing import Dict, List, Optional, Set, Tuple
from sqlalchemy.orm import Session

from ...models import models
from ...core.permissions import ensure_admin
from ...core.exceptions import PermisoDenegadoError, ValidacionNegocioError
from ...schemas import cleanup as cleanup_schema

WHITELIST_CONFIG_KEY = "CLEANUP_PROTECTED_EMAILS"
PRESETS_CONFIG_KEY = "CLEANUP_CUSTOM_PRESETS"
PROTECTED_CONFIG_KEYS = {WHITELIST_CONFIG_KEY, PRESETS_CONFIG_KEY}

def _is_valid_email(value: str) -> bool:
    if not value or " " in value or value.count("@") != 1:
        return False
    local, domain = value.split("@", 1)
    return bool(local and "." in domain and not domain.startswith(".") and not domain.endswith("."))


def is_cleanup_enabled() -> bool:
    val = os.getenv("ENABLE_DATA_CLEANUP", "true").strip().lower()
    return val not in ("false", "0", "no", "off", "disabled")


def ensure_cleanup_enabled() -> None:
    if not is_cleanup_enabled():
        raise PermisoDenegadoError(
            "El módulo de limpieza selectiva de datos está deshabilitado (ENABLE_DATA_CLEANUP=false)"
        )


def ensure_cleanup_admin(current_user: models.Usuario) -> None:
    if not current_user:
        raise PermisoDenegadoError("Autenticación requerida")
    ensure_admin(
        current_user.rol,
        "Solo los administradores (ADMIN) pueden acceder al panel de limpieza de datos",
    )
    ensure_cleanup_enabled()


def get_superadmin_email() -> str:
    return os.getenv("SUPERADMIN_EMAIL", "natalygemio@gmail.com").strip().lower()


def _get_or_create_config(
    db: Session, clave: str, default_value: str, descripcion: str, admin_id: Optional[int] = None
) -> models.ConfiguracionGlobal:
    conf = (
        db.query(models.ConfiguracionGlobal)
        .execution_options(include_deleted=True)
        .filter(models.ConfiguracionGlobal.clave == clave)
        .first()
    )
    if not conf:
        conf = models.ConfiguracionGlobal(
            clave=clave,
            valor=default_value,
            descripcion=descripcion,
            creado_por=admin_id,
            id_estado=2,
        )
        db.add(conf)
        db.commit()
        db.refresh(conf)
    elif conf.id_estado == 0:
        conf.id_estado = 2
        db.commit()
        db.refresh(conf)
    return conf


def get_whitelist_emails(db: Session) -> List[str]:
    conf = (
        db.query(models.ConfiguracionGlobal)
        .execution_options(include_deleted=True)
        .filter(models.ConfiguracionGlobal.clave == WHITELIST_CONFIG_KEY)
        .first()
    )
    if not conf or not conf.valor:
        return []
    try:
        raw = json.loads(conf.valor)
        if isinstance(raw, list):
            return sorted({str(e).strip().lower() for e in raw if str(e).strip()})
    except Exception:
        pass
    return []


def update_whitelist_emails(
    db: Session, current_user: models.Usuario, emails: List[str]
) -> cleanup_schema.ProtectedConfigResponse:
    ensure_cleanup_admin(current_user)
    normalized: Set[str] = set()
    superadmin = get_superadmin_email()
    for e in emails:
        clean = str(e).strip().lower()
        if not clean:
            continue
        if not _is_valid_email(clean):
            raise ValidacionNegocioError(f"El correo '{clean}' no tiene un formato válido")
        if clean != superadmin:
            normalized.add(clean)

    sorted_emails = sorted(normalized)
    conf = _get_or_create_config(
        db,
        WHITELIST_CONFIG_KEY,
        json.dumps(sorted_emails),
        "Lista blanca de correos protegidos contra limpieza de datos",
        current_user.id_usuario,
    )
    conf.valor = json.dumps(sorted_emails)
    conf.id_estado = 2
    db.commit()
    return get_protected_config_response(db, current_user)


def get_protected_user_reasons(
    db: Session, current_user: models.Usuario
) -> Tuple[Dict[int, str], Set[str]]:
    """
    Retorna:
      - user_id -> motivo ('SUPERADMIN' | 'USUARIO_ACTUAL' | 'LISTA_BLANCA')
      - conjunto de correos protegidos en minúsculas
    """
    superadmin_email = get_superadmin_email()
    whitelist = set(get_whitelist_emails(db))
    current_email = (current_user.correo or "").strip().lower() if current_user else ""

    protected_emails = {superadmin_email} | whitelist
    if current_email:
        protected_emails.add(current_email)

    all_users = (
        db.query(models.Usuario)
        .execution_options(include_deleted=True)
        .all()
    )

    reasons: Dict[int, str] = {}
    for u in all_users:
        u_email = (u.correo or "").strip().lower()
        if u_email == superadmin_email:
            reasons[u.id_usuario] = "SUPERADMIN"
        elif current_user and u.id_usuario == current_user.id_usuario:
            reasons[u.id_usuario] = "USUARIO_ACTUAL"
        elif u_email in whitelist:
            reasons[u.id_usuario] = "LISTA_BLANCA"

    return reasons, protected_emails


def get_protected_config_response(
    db: Session, current_user: models.Usuario
) -> cleanup_schema.ProtectedConfigResponse:
    ensure_cleanup_admin(current_user)
    superadmin_email = get_superadmin_email()
    whitelist = get_whitelist_emails(db)

    users_by_id = {
        u.id_usuario: u
        for u in db.query(models.Usuario).execution_options(include_deleted=True).all()
    }
    users_by_email = {
        (u.correo or "").strip().lower(): u for u in users_by_id.values()
    }

    protected_list: List[cleanup_schema.ProtectedUserInfo] = []
    seen_emails: Set[str] = set()

    # 1. Superadmin siempre primero
    sa_user = users_by_email.get(superadmin_email)
    protected_list.append(
        cleanup_schema.ProtectedUserInfo(
            id_usuario=sa_user.id_usuario if sa_user else None,
            correo=superadmin_email,
            nombres=f"{sa_user.nombres} {sa_user.apellidos}".strip() if sa_user else "Superadmin Protegido",
            rol=sa_user.rol if sa_user else "ADMIN",
            motivo="SUPERADMIN",
        )
    )
    seen_emails.add(superadmin_email)

    # 2. Usuario actual si es distinto del superadmin
    curr_email = (current_user.correo or "").strip().lower()
    if curr_email and curr_email not in seen_emails:
        protected_list.append(
            cleanup_schema.ProtectedUserInfo(
                id_usuario=current_user.id_usuario,
                correo=curr_email,
                nombres=f"{current_user.nombres} {current_user.apellidos}".strip(),
                rol=current_user.rol,
                motivo="USUARIO_ACTUAL",
            )
        )
        seen_emails.add(curr_email)

    # 3. Lista blanca
    for w_email in whitelist:
        if w_email in seen_emails:
            continue
        w_user = users_by_email.get(w_email)
        protected_list.append(
            cleanup_schema.ProtectedUserInfo(
                id_usuario=w_user.id_usuario if w_user else None,
                correo=w_email,
                nombres=f"{w_user.nombres} {w_user.apellidos}".strip() if w_user else "En lista blanca (sin registro)",
                rol=w_user.rol if w_user else None,
                motivo="LISTA_BLANCA",
            )
        )
        seen_emails.add(w_email)

    return cleanup_schema.ProtectedConfigResponse(
        superadmin_email=superadmin_email,
        current_user_email=curr_email,
        current_user_id=current_user.id_usuario,
        whitelist_emails=whitelist,
        protected_users=protected_list,
    )


def is_record_protected(
    db: Session,
    current_user: models.Usuario,
    tabla: str,
    record: object,
    protected_user_reasons: Optional[Dict[int, str]] = None,
) -> Tuple[bool, Optional[str]]:
    if protected_user_reasons is None:
        protected_user_reasons, _ = get_protected_user_reasons(db, current_user)

    if tabla == "usuarios":
        uid = getattr(record, "id_usuario", None)
        u_email = (getattr(record, "correo", "") or "").strip().lower()
        if u_email == get_superadmin_email():
            return True, "SUPERADMIN"
        if uid in protected_user_reasons:
            return True, protected_user_reasons[uid]
        return False, None

    if tabla == "configuracion_global":
        clave = getattr(record, "clave", None)
        if clave in PROTECTED_CONFIG_KEYS:
            return True, "CONFIG_SISTEMA"

    return False, None

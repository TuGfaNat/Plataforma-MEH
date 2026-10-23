import os
import json
import uuid
import hashlib
from datetime import datetime, timedelta, date, timezone
from decimal import Decimal
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import inspect as sa_inspect

from ...models import models
from ...core.logging import json_serial
from ...core.exceptions import ValidacionNegocioError, RecursoNoEncontradoError
from ...schemas import cleanup as cleanup_schema
from .protection import ensure_cleanup_admin
from .catalog import CLEANUP_CATALOG

SENSITIVE_COLUMNS = {"password_hash", "reset_token", "reset_token_exp", "codigo_verificacion", "codigo_verificacion_exp"}


def get_backup_dir() -> str:
    """
    Retorna el directorio de backups FUERA de /static.
    Por defecto: <backend_root>/backups/cleanup
    """
    custom_dir = os.getenv("CLEANUP_BACKUP_DIR")
    if custom_dir:
        target = os.path.abspath(custom_dir)
    else:
        # __file__ = backend/app/services/cleanup/backup.py -> subir 3 niveles a backend/
        backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
        target = os.path.join(backend_root, "backups", "cleanup")

    os.makedirs(target, exist_ok=True)
    return target


def get_backup_ttl_minutes() -> int:
    try:
        return max(1, int(os.getenv("CLEANUP_BACKUP_TTL_MINUTES", "30")))
    except ValueError:
        return 30


def compute_selection_hash(effective_selections: Dict[str, List[int]], mode: str) -> str:
    """Calcula un hash SHA-256 canónico sobre la selección efectiva ordenada y el modo."""
    canonical_selections = {
        tabla: sorted({int(i) for i in ids})
        for tabla, ids in sorted(effective_selections.items())
        if ids
    }
    payload = json.dumps(
        {"mode": mode.lower().strip(), "selections": canonical_selections},
        sort_keys=True,
        separators=(",", ":"),
    )
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def record_to_snapshot_dict(record: Any) -> Dict[str, Any]:
    """Convierte una instancia SQLAlchemy a diccionario seguro (sin hashes de contraseñas)."""
    mapper = sa_inspect(record.__class__)
    data: Dict[str, Any] = {}
    for col in mapper.columns:
        key = col.key
        if key in SENSITIVE_COLUMNS:
            continue
        val = getattr(record, key, None)
        if isinstance(val, (datetime, date)):
            data[key] = val.isoformat()
        elif isinstance(val, Decimal):
            data[key] = float(val)
        elif isinstance(val, uuid.UUID):
            data[key] = str(val)
        else:
            data[key] = val
    return data


def _now_utc_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def purge_expired_backups() -> int:
    """Elimina físicamente archivos de backup cuyo TTL (30 min por defecto) haya expirado."""
    b_dir = get_backup_dir()
    now = _now_utc_naive()
    ttl = timedelta(minutes=get_backup_ttl_minutes())
    removed = 0

    for fname in os.listdir(b_dir):
        if not fname.endswith(".json"):
            continue
        fpath = os.path.join(b_dir, fname)
        try:
            with open(fpath, "r", encoding="utf-8") as f:
                meta = json.load(f)
            expires_str = meta.get("expires_at")
            if expires_str:
                exp_dt = datetime.fromisoformat(expires_str)
                if now > exp_dt:
                    os.remove(fpath)
                    removed += 1
                    continue
            else:
                mtime = datetime.fromtimestamp(os.path.getmtime(fpath), tz=timezone.utc).replace(tzinfo=None)
                if now - mtime > ttl:
                    os.remove(fpath)
                    removed += 1
        except Exception:
            pass

    return removed


def create_cleanup_backup(
    db: Session,
    current_user: models.Usuario,
    effective_selections: Dict[str, List[int]],
    mode: str,
    selection_hash: str,
) -> cleanup_schema.CleanupBackupResponse:
    """Genera un archivo de respaldo JSON fuera de /static con TTL de 30 minutos."""
    ensure_cleanup_admin(current_user)
    purge_expired_backups()

    total_records = sum(len(ids) for ids in effective_selections.values())
    if total_records == 0:
        raise ValidacionNegocioError("No hay registros efectivos seleccionados para respaldar")

    now = _now_utc_naive()
    ttl_minutes = get_backup_ttl_minutes()
    expires_at = now + timedelta(minutes=ttl_minutes)
    backup_id = f"bkp_{now.strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"

    snapshots_by_table: Dict[str, List[Dict[str, Any]]] = {}
    counts_by_table: Dict[str, int] = {}

    for tabla, ids in sorted(effective_selections.items()):
        if not ids or tabla not in CLEANUP_CATALOG:
            continue
        info = CLEANUP_CATALOG[tabla]
        model = info["model"]
        pk_col = getattr(model, info["pk_field"])
        rows = (
            db.query(model)
            .execution_options(include_deleted=True)
            .filter(pk_col.in_(ids))
            .all()
        )
        snapshots = [record_to_snapshot_dict(r) for r in rows]
        snapshots_by_table[tabla] = snapshots
        counts_by_table[tabla] = len(snapshots)

    backup_payload = {
        "backup_id": backup_id,
        "selection_hash": selection_hash,
        "mode": mode,
        "created_at": now.isoformat(),
        "expires_at": expires_at.isoformat(),
        "ttl_minutes": ttl_minutes,
        "created_by": {
            "id_usuario": current_user.id_usuario,
            "correo": current_user.correo,
            "nombres": f"{current_user.nombres} {current_user.apellidos}".strip(),
        },
        "total_records": sum(counts_by_table.values()),
        "counts_by_table": counts_by_table,
        "data": snapshots_by_table,
    }

    b_dir = get_backup_dir()
    file_path = os.path.join(b_dir, f"{backup_id}.json")
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(backup_payload, f, default=json_serial, ensure_ascii=False, indent=2)

    return cleanup_schema.CleanupBackupResponse(
        backup_id=backup_id,
        selection_hash=selection_hash,
        mode=mode,
        created_at=now.isoformat(),
        expires_at=expires_at.isoformat(),
        ttl_minutes=ttl_minutes,
        total_records=backup_payload["total_records"],
        counts_by_table=counts_by_table,
        download_url=f"/admin/cleanup/backup/{backup_id}",
    )


def get_valid_backup(backup_id: str) -> Dict[str, Any]:
    """Obtiene y valida un backup vigente (no expirado)."""
    if not backup_id or not backup_id.startswith("bkp_") or "/" in backup_id or "\\" in backup_id or ".." in backup_id:
        raise ValidacionNegocioError("Identificador de backup inválido")

    b_dir = get_backup_dir()
    file_path = os.path.join(b_dir, f"{backup_id}.json")
    if not os.path.exists(file_path):
        purge_expired_backups()
        raise RecursoNoEncontradoError(f"El respaldo '{backup_id}' no existe o ha expirado")

    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    expires_str = data.get("expires_at")
    if expires_str:
        exp_dt = datetime.fromisoformat(expires_str)
        if _now_utc_naive() > exp_dt:
            try:
                os.remove(file_path)
            except OSError:
                pass
            raise ValidacionNegocioError(
                f"El respaldo '{backup_id}' ha expirado (TTL de {data.get('ttl_minutes', 30)} minutos superado). Genera un nuevo respaldo."
            )

    return data

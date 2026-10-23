import io
import os
import re
import shutil
import uuid
from typing import Any, Dict, Optional, Tuple

from PIL import Image, ImageOps

from ..core.exceptions import PermisoDenegadoError, ValidacionNegocioError
from ..core.logging import registrar_log
from ..core.permissions import ADMIN_OR_ORGANIZER_ROLES, PERMISSION_EVENTS_MANAGE, has_permission
from ..models import models

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STATIC_DIR = os.path.normpath(os.path.join(BACKEND_DIR, "static"))
EVENTOS_STATIC_DIR = os.path.normpath(os.path.join(STATIC_DIR, "eventos"))

os.makedirs(EVENTOS_STATIC_DIR, exist_ok=True)

MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024  # 8 MB
MIN_IMAGE_DIMENSION = 64
MAX_IMAGE_PIXELS = 36_000_000
MAX_ORIGINAL_SIDE = 1920
SIZE_16X9 = (1280, 720)
SIZE_1X1 = (800, 800)

_VARIANT_ORIG_PATTERN = re.compile(r"^/static/eventos/([a-zA-Z0-9_-]+)_orig(\.(?:jpg|jpeg|png|webp))$", re.IGNORECASE)
_VARIANT_ANY_PATTERN = re.compile(
    r"^/static/eventos/([a-zA-Z0-9_-]+?)_(?:orig|16x9|1x1)(\.(?:jpg|jpeg|png|webp))$",
    re.IGNORECASE,
)


def _detect_magic_format(file_content: bytes) -> Tuple[str, str]:
    """Detecta el formato real por magic bytes y devuelve (pil_format, ext)."""
    if file_content.startswith(b"\xff\xd8\xff"):
        return "JPEG", ".jpg"
    if file_content.startswith(b"\x89PNG\r\n\x1a\n"):
        return "PNG", ".png"
    if len(file_content) >= 12 and file_content[:4] == b"RIFF" and file_content[8:12] == b"WEBP":
        return "WEBP", ".webp"
    raise ValidacionNegocioError(
        "Formato de imagen no soportado. Solo se permiten archivos PNG, JPG/JPEG o WEBP válidos."
    )


def validate_and_load_image(
    file_content: bytes,
    filename: Optional[str] = None,
    content_type: Optional[str] = None,
) -> Tuple[Image.Image, str, str]:
    """Valida tamaño, tipo MIME/extensión, magic bytes y dimensiones de la imagen."""
    if not file_content:
        raise ValidacionNegocioError("El archivo de imagen está vacío.")

    if len(file_content) > MAX_IMAGE_SIZE_BYTES:
        raise ValidacionNegocioError("La imagen supera el tamaño máximo permitido de 8 MB.")

    if content_type:
        ct_lower = content_type.lower().strip()
        allowed_mimes = {"image/jpeg", "image/jpg", "image/png", "image/webp", "application/octet-stream"}
        if ct_lower and ct_lower not in allowed_mimes:
            raise ValidacionNegocioError(
                f"Tipo de contenido no permitido ({content_type}). Usa PNG, JPG o WEBP."
            )

    if filename:
        ext_lower = os.path.splitext(filename)[1].lower()
        if ext_lower and ext_lower not in {".jpg", ".jpeg", ".png", ".webp"}:
            raise ValidacionNegocioError(
                f"Extensión de archivo no permitida ({ext_lower}). Usa .png, .jpg, .jpeg o .webp."
            )

    pil_format, safe_ext = _detect_magic_format(file_content)

    try:
        img = Image.open(io.BytesIO(file_content))
        img.verify()
        img = Image.open(io.BytesIO(file_content))
        img = ImageOps.exif_transpose(img)
    except Exception as exc:
        raise ValidacionNegocioError("El archivo proporcionado no es una imagen válida o está corrupto.") from exc

    width, height = img.size
    if width < MIN_IMAGE_DIMENSION or height < MIN_IMAGE_DIMENSION:
        raise ValidacionNegocioError(
            f"La imagen es demasiado pequeña ({width}x{height}px). El mínimo requerido es {MIN_IMAGE_DIMENSION}x{MIN_IMAGE_DIMENSION}px."
        )

    if width * height > MAX_IMAGE_PIXELS:
        raise ValidacionNegocioError("La resolución de la imagen excede el límite de seguridad permitido.")

    return img, pil_format, safe_ext


def _prepare_mode_for_format(img: Image.Image, pil_format: str) -> Image.Image:
    """Normaliza el modo de color según el formato de salida."""
    if pil_format == "JPEG":
        if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
            rgba = img.convert("RGBA")
            background = Image.new("RGB", rgba.size, (18, 18, 24))
            background.paste(rgba, mask=rgba.split()[3])
            return background
        if img.mode != "RGB":
            return img.convert("RGB")
        return img
    if img.mode not in ("RGB", "RGBA"):
        return img.convert("RGBA")
    return img


def _save_image_to_path(img: Image.Image, target_path: str, pil_format: str) -> None:
    """Guarda la imagen procesada de forma segura dentro de EVENTOS_STATIC_DIR."""
    abs_target = os.path.abspath(target_path)
    abs_base = os.path.abspath(EVENTOS_STATIC_DIR)
    if not abs_target.startswith(abs_base):
        raise ValidacionNegocioError("Ruta de almacenamiento de imagen no permitida.")

    prepared = _prepare_mode_for_format(img, pil_format)
    save_kwargs: Dict[str, Any] = {}
    if pil_format in ("JPEG", "WEBP"):
        save_kwargs["quality"] = 88
        save_kwargs["optimize"] = True
    elif pil_format == "PNG":
        save_kwargs["optimize"] = True

    prepared.save(abs_target, format=pil_format, **save_kwargs)


def process_and_save_evento_imagen(
    file_content: bytes,
    id_evento: Optional[int] = None,
    filename: Optional[str] = None,
    content_type: Optional[str] = None,
) -> Dict[str, Any]:
    """Valida la imagen y genera el archivo original + variantes 16:9 y 1:1 en /static/eventos/."""
    os.makedirs(EVENTOS_STATIC_DIR, exist_ok=True)
    img, pil_format, safe_ext = validate_and_load_image(
        file_content=file_content,
        filename=filename,
        content_type=content_type,
    )

    token = uuid.uuid4().hex[:12]
    prefix = f"evento_{int(id_evento)}_{token}" if id_evento is not None else f"portada_{token}"

    orig_img = img.copy()
    if orig_img.width > MAX_ORIGINAL_SIDE or orig_img.height > MAX_ORIGINAL_SIDE:
        orig_img.thumbnail((MAX_ORIGINAL_SIDE, MAX_ORIGINAL_SIDE), Image.Resampling.LANCZOS)

    orig_w, orig_h = orig_img.size
    aspect_ratio = round(orig_w / orig_h, 3) if orig_h else 1.0

    # Generar variante 16:9 (listados / cabeceras de correo)
    variant_16x9 = ImageOps.fit(
        img,
        SIZE_16X9,
        method=Image.Resampling.LANCZOS,
        centering=(0.5, 0.5),
    )

    # Generar variante 1:1 (cuadrada para miniaturas y vista 1:1 en detalle)
    variant_1x1 = ImageOps.fit(
        img,
        SIZE_1X1,
        method=Image.Resampling.LANCZOS,
        centering=(0.5, 0.5),
    )

    orig_filename = f"{prefix}_orig{safe_ext}"
    v16x9_filename = f"{prefix}_16x9{safe_ext}"
    v1x1_filename = f"{prefix}_1x1{safe_ext}"

    _save_image_to_path(orig_img, os.path.join(EVENTOS_STATIC_DIR, orig_filename), pil_format)
    _save_image_to_path(variant_16x9, os.path.join(EVENTOS_STATIC_DIR, v16x9_filename), pil_format)
    _save_image_to_path(variant_1x1, os.path.join(EVENTOS_STATIC_DIR, v1x1_filename), pil_format)

    url_orig = f"/static/eventos/{orig_filename}"
    url_16x9 = f"/static/eventos/{v16x9_filename}"
    url_1x1 = f"/static/eventos/{v1x1_filename}"

    modo_detalle = "1:1" if 0.85 <= aspect_ratio <= 1.15 else "flexible"

    return {
        "imagen_url": url_orig,
        "imagen_url_original": url_orig,
        "imagen_url_16x9": url_16x9,
        "imagen_url_1x1": url_1x1,
        "imagen_variantes": {
            "tiene_imagen": True,
            "original": url_orig,
            "widescreen_16x9": url_16x9,
            "square_1x1": url_1x1,
            "width": orig_w,
            "height": orig_h,
            "aspect_ratio": aspect_ratio,
            "formato": pil_format,
            "modo_detalle": modo_detalle,
        },
    }


def resolve_evento_imagen_variantes(imagen_url: Optional[str]) -> Dict[str, Any]:
    """Resuelve las URLs de original, 16:9 y 1:1 a partir de imagen_url sin migraciones de BD."""
    if not imagen_url or not str(imagen_url).strip():
        return {
            "tiene_imagen": False,
            "original": None,
            "widescreen_16x9": None,
            "square_1x1": None,
            "modo_detalle": "fallback",
        }

    clean_url = str(imagen_url).strip()
    match = _VARIANT_ANY_PATTERN.match(clean_url)
    if match:
        prefix, ext = match.group(1), match.group(2)
        orig_candidate = f"/static/eventos/{prefix}_orig{ext}"
        v16x9_candidate = f"/static/eventos/{prefix}_16x9{ext}"
        v1x1_candidate = f"/static/eventos/{prefix}_1x1{ext}"

        v16x9_disk = os.path.join(EVENTOS_STATIC_DIR, f"{prefix}_16x9{ext}")
        v1x1_disk = os.path.join(EVENTOS_STATIC_DIR, f"{prefix}_1x1{ext}")
        orig_disk = os.path.join(EVENTOS_STATIC_DIR, f"{prefix}_orig{ext}")

        resolved_orig = orig_candidate if os.path.exists(orig_disk) else clean_url
        resolved_16x9 = v16x9_candidate if os.path.exists(v16x9_disk) else resolved_orig
        resolved_1x1 = v1x1_candidate if os.path.exists(v1x1_disk) else resolved_orig

        return {
            "tiene_imagen": True,
            "original": resolved_orig,
            "widescreen_16x9": resolved_16x9,
            "square_1x1": resolved_1x1,
            "modo_detalle": "flexible",
        }

    return {
        "tiene_imagen": True,
        "original": clean_url,
        "widescreen_16x9": clean_url,
        "square_1x1": clean_url,
        "modo_detalle": "flexible",
    }


def delete_evento_imagen_files(imagen_url: Optional[str]) -> int:
    """Elimina del disco el archivo original y sus variantes 16:9 y 1:1 si pertenecen a /static/eventos/."""
    if not imagen_url or not str(imagen_url).strip():
        return 0

    clean_url = str(imagen_url).strip()
    match = _VARIANT_ANY_PATTERN.match(clean_url)
    deleted_count = 0
    abs_base = os.path.abspath(EVENTOS_STATIC_DIR)

    if match:
        prefix, ext = match.group(1), match.group(2)
        for suffix in ("_orig", "_16x9", "_1x1"):
            candidate = os.path.abspath(os.path.join(EVENTOS_STATIC_DIR, f"{prefix}{suffix}{ext}"))
            if candidate.startswith(abs_base) and os.path.isfile(candidate):
                try:
                    os.remove(candidate)
                    deleted_count += 1
                except OSError:
                    pass
        return deleted_count

    if clean_url.startswith("/static/eventos/"):
        rel_name = os.path.basename(clean_url)
        candidate = os.path.abspath(os.path.join(EVENTOS_STATIC_DIR, rel_name))
        if candidate.startswith(abs_base) and os.path.isfile(candidate):
            try:
                os.remove(candidate)
                deleted_count += 1
            except OSError:
                pass

    return deleted_count


def clone_evento_imagen_files(
    imagen_url: Optional[str],
    new_id_evento: Optional[int] = None,
) -> Optional[str]:
    """Clona los archivos físico de portada (orig, 16x9, 1x1) al duplicar un evento."""
    if not imagen_url or not str(imagen_url).strip():
        return None

    clean_url = str(imagen_url).strip()
    match = _VARIANT_ANY_PATTERN.match(clean_url)
    if not match:
        return clean_url

    old_prefix, ext = match.group(1), match.group(2)
    old_orig_path = os.path.join(EVENTOS_STATIC_DIR, f"{old_prefix}_orig{ext}")
    if not os.path.isfile(old_orig_path):
        return clean_url

    token = uuid.uuid4().hex[:12]
    new_prefix = f"evento_{int(new_id_evento)}_{token}" if new_id_evento is not None else f"portada_{token}"

    for suffix in ("_orig", "_16x9", "_1x1"):
        src = os.path.join(EVENTOS_STATIC_DIR, f"{old_prefix}{suffix}{ext}")
        dst = os.path.join(EVENTOS_STATIC_DIR, f"{new_prefix}{suffix}{ext}")
        if os.path.isfile(src):
            shutil.copy2(src, dst)

    return f"/static/eventos/{new_prefix}_orig{ext}"


def get_evento_email_cover_bytes(imagen_url: Optional[str]) -> Tuple[Optional[bytes], Optional[str]]:
    """Obtiene los bytes locales de la variante 16:9 (para adjunto inline CID) y su URL relativa/pública."""
    variantes = resolve_evento_imagen_variantes(imagen_url)
    if not variantes.get("tiene_imagen"):
        return None, None

    url_16x9 = variantes.get("widescreen_16x9") or variantes.get("original")
    if not url_16x9:
        return None, None

    if url_16x9.startswith("/static/"):
        rel_path = url_16x9.lstrip("/").replace("/", os.sep)
        abs_path = os.path.abspath(os.path.join(BACKEND_DIR, rel_path))
        abs_static = os.path.abspath(STATIC_DIR)
        if abs_path.startswith(abs_static) and os.path.isfile(abs_path):
            try:
                with open(abs_path, "rb") as f:
                    return f.read(), url_16x9
            except OSError:
                return None, url_16x9

    return None, url_16x9


def _ensure_event_cover_permission(evento: models.Evento, user: models.Usuario) -> None:
    es_staff = (
        user.rol in ADMIN_OR_ORGANIZER_ROLES
        or has_permission(user.rol, PERMISSION_EVENTS_MANAGE)
        or evento.id_organizador == user.id_usuario
    )
    if not es_staff:
        raise PermisoDenegadoError("No tienes permisos para gestionar la imagen de portada de este evento.")


def upload_or_replace_evento_imagen(
    db,
    id_evento: int,
    current_user: models.Usuario,
    file_content: bytes,
    filename: Optional[str] = None,
    content_type: Optional[str] = None,
    ip_address: Optional[str] = None,
) -> models.Evento:
    """Sube o reemplaza la imagen de portada de un evento existente generando sus variantes."""
    from .eventos_service import get_evento_by_id, populate_evento_cupos

    evento = get_evento_by_id(db, id_evento)
    _ensure_event_cover_permission(evento, current_user)

    old_imagen_url = evento.imagen_url
    result = process_and_save_evento_imagen(
        file_content=file_content,
        id_evento=id_evento,
        filename=filename,
        content_type=content_type,
    )

    evento.imagen_url = result["imagen_url"]
    if old_imagen_url and old_imagen_url != evento.imagen_url:
        delete_evento_imagen_files(old_imagen_url)

    registrar_log(
        db=db,
        id_admin=current_user.id_usuario,
        accion="ACTUALIZAR_PORTADA_EVENTO",
        tabla_afectada="eventos",
        id_registro_afectado=id_evento,
        valor_anterior={"imagen_url": old_imagen_url},
        valor_nuevo={
            "imagen_url": result["imagen_url"],
            "imagen_url_16x9": result["imagen_url_16x9"],
            "imagen_url_1x1": result["imagen_url_1x1"],
        },
        ip_direccion=ip_address,
    )

    db.commit()
    db.refresh(evento)
    populate_evento_cupos(db, evento)
    return evento


def remove_evento_imagen(
    db,
    id_evento: int,
    current_user: models.Usuario,
    ip_address: Optional[str] = None,
) -> models.Evento:
    """Quita la imagen de portada de un evento y elimina sus variantes físicas del disco."""
    from .eventos_service import get_evento_by_id, populate_evento_cupos

    evento = get_evento_by_id(db, id_evento)
    _ensure_event_cover_permission(evento, current_user)

    old_imagen_url = evento.imagen_url
    deleted_files = delete_evento_imagen_files(old_imagen_url)
    evento.imagen_url = None

    registrar_log(
        db=db,
        id_admin=current_user.id_usuario,
        accion="ELIMINAR_PORTADA_EVENTO",
        tabla_afectada="eventos",
        id_registro_afectado=id_evento,
        valor_anterior={"imagen_url": old_imagen_url},
        valor_nuevo={"imagen_url": None, "archivos_eliminados": deleted_files},
        ip_direccion=ip_address,
    )

    db.commit()
    db.refresh(evento)
    populate_evento_cupos(db, evento)
    return evento

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
import os
import io
import base64
import inspect
import contextvars
import html as html_lib
from contextlib import contextmanager
from datetime import datetime, date
from typing import Optional, List, Dict, Tuple, Any, Callable
import logging
import qrcode
from pydantic import EmailStr, ValidationError, TypeAdapter
from sqlalchemy.orm import Session

# Logger
logger = logging.getLogger(__name__)

# Configuración desde variables de entorno
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "").strip()
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "").strip()
EMAIL_FROM_NAME = os.getenv("EMAIL_FROM_NAME", "Plataforma MEH")

# URLs del Frontend
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")
FRONTEND_DASHBOARD = FRONTEND_URL + os.getenv("FRONTEND_DASHBOARD", "/dashboard")
FRONTEND_LEARNING = FRONTEND_URL + os.getenv("FRONTEND_LEARNING", "/learning")
FRONTEND_FINANZAS = FRONTEND_URL + os.getenv("FRONTEND_FINANZAS", "/finanzas")
BACKEND_PUBLIC_URL = os.getenv("BACKEND_PUBLIC_URL", "http://localhost:8000").rstrip("/")


def generate_qr_image_bytes(data: str) -> bytes:
    """Genera los bytes de una imagen PNG con el código QR utilizando la librería qrcode localmente."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=8,
        border=2,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def format_evento_fecha_humana(fecha_val: Optional[Any], hora_inicio: Optional[str] = None) -> str:
    """Formatea la fecha y hora de un evento de forma legible para cabeceras de correo."""
    if fecha_val is None or fecha_val == "":
        return "Fecha por confirmar"

    fecha_str = ""
    if isinstance(fecha_val, datetime):
        fecha_str = fecha_val.strftime("%d/%m/%Y")
        if not hora_inicio and (fecha_val.hour or fecha_val.minute):
            hora_inicio = fecha_val.strftime("%H:%M")
    elif isinstance(fecha_val, date):
        fecha_str = fecha_val.strftime("%d/%m/%Y")
    else:
        raw = str(fecha_val).strip()
        try:
            parsed = datetime.fromisoformat(raw.replace("Z", "+00:00"))
            fecha_str = parsed.strftime("%d/%m/%Y")
            if not hora_inicio and (parsed.hour or parsed.minute):
                hora_inicio = parsed.strftime("%H:%M")
        except ValueError:
            fecha_str = raw

    if hora_inicio:
        return f"{fecha_str} · {hora_inicio}"
    return fecha_str


_ACTIVE_EVENT_CTX: contextvars.ContextVar[Optional[Any]] = contextvars.ContextVar(
    "_ACTIVE_EVENT_CTX", default=None
)


@contextmanager
def event_email_context(evento: Optional[Any]):
    """Context manager para asociar un objeto/dict Evento al envío de correo actual."""
    token = _ACTIVE_EVENT_CTX.set(evento)
    try:
        yield
    finally:
        _ACTIVE_EVENT_CTX.reset(token)


def call_notify_with_event_context(
    notify_fn: Callable[..., Any],
    evento: Optional[Any],
    base_kwargs: Dict[str, Any],
    extra_kwargs: Optional[Dict[str, Any]] = None,
) -> Any:
    """Invoca una función notify_* propagando el contexto de evento sin romper mocks con firmas reducidas."""
    with event_email_context(evento):
        if not extra_kwargs:
            return notify_fn(**base_kwargs)
        try:
            sig = inspect.signature(notify_fn)
            has_var_kw = any(
                p.kind == inspect.Parameter.VAR_KEYWORD for p in sig.parameters.values()
            )
            if has_var_kw:
                return notify_fn(**base_kwargs, **extra_kwargs)
            accepted_extra = {
                k: v for k, v in extra_kwargs.items() if k in sig.parameters
            }
            return notify_fn(**base_kwargs, **accepted_extra)
        except (ValueError, TypeError):
            return notify_fn(**base_kwargs)


def _extract_evento_header_fields(
    evento: Optional[Any] = None,
    titulo_evento: Optional[str] = None,
    fecha_evento: Optional[Any] = None,
    hora_evento: Optional[str] = None,
    imagen_url: Optional[str] = None,
) -> Tuple[str, str, Optional[str]]:
    """Extrae título, fecha formateada e imagen_url a partir de un objeto Evento, dict o argumentos."""
    active_ev = evento if evento is not None else _ACTIVE_EVENT_CTX.get()
    ev_titulo = titulo_evento
    ev_fecha = fecha_evento
    ev_hora = hora_evento
    ev_img = imagen_url

    if active_ev is not None:
        if isinstance(active_ev, dict):
            ev_titulo = ev_titulo or active_ev.get("titulo")
            ev_fecha = ev_fecha if ev_fecha is not None else active_ev.get("fecha_inicio") or active_ev.get("fecha")
            ev_hora = ev_hora or active_ev.get("hora_inicio")
            ev_img = ev_img if ev_img is not None else active_ev.get("imagen_url")
        else:
            ev_titulo = ev_titulo or getattr(active_ev, "titulo", None)
            ev_fecha = ev_fecha if ev_fecha is not None else getattr(active_ev, "fecha_inicio", None)
            ev_hora = ev_hora or getattr(active_ev, "hora_inicio", None)
            ev_img = ev_img if ev_img is not None else getattr(active_ev, "imagen_url", None)

    safe_title = str(ev_titulo or "Evento MEH").strip()
    formatted_date = format_evento_fecha_humana(ev_fecha, ev_hora)
    return safe_title, formatted_date, ev_img


def _detect_subtype_from_bytes(img_bytes: bytes) -> str:
    if img_bytes.startswith(b"\xff\xd8\xff"):
        return "jpeg"
    if len(img_bytes) >= 12 and img_bytes[:4] == b"RIFF" and img_bytes[8:12] == b"WEBP":
        return "webp"
    return "png"


def build_event_email_header(
    evento: Optional[Any] = None,
    *,
    titulo_evento: Optional[str] = None,
    fecha_evento: Optional[Any] = None,
    hora_evento: Optional[str] = None,
    imagen_url: Optional[str] = None,
    for_preview: bool = False,
) -> Tuple[str, Dict[str, Tuple[bytes, str]], Dict[str, Any]]:
    """Construye la cabecera HTML unificada de evento (imagen 16:9 + título + fecha) con fallback limpio."""
    from .evento_imagen_service import get_evento_email_cover_bytes, resolve_evento_imagen_variantes

    safe_title, formatted_date, raw_img_url = _extract_evento_header_fields(
        evento=evento,
        titulo_evento=titulo_evento,
        fecha_evento=fecha_evento,
        hora_evento=hora_evento,
        imagen_url=imagen_url,
    )

    escaped_title = html_lib.escape(safe_title)
    escaped_date = html_lib.escape(formatted_date)

    variantes = resolve_evento_imagen_variantes(raw_img_url)
    cover_bytes, url_16x9 = get_evento_email_cover_bytes(raw_img_url)

    inline_images: Dict[str, Tuple[bytes, str]] = {}
    img_src_attr: Optional[str] = None

    if cover_bytes:
        subtype = _detect_subtype_from_bytes(cover_bytes)
        if for_preview:
            b64_str = base64.b64encode(cover_bytes).decode("ascii")
            img_src_attr = f"data:image/{subtype};base64,{b64_str}"
        else:
            inline_images["evento_portada"] = (cover_bytes, subtype)
            img_src_attr = "cid:evento_portada"
    elif url_16x9:
        if url_16x9.startswith("http://") or url_16x9.startswith("https://") or url_16x9.startswith("data:"):
            img_src_attr = url_16x9
        elif url_16x9.startswith("/"):
            img_src_attr = f"{BACKEND_PUBLIC_URL}{url_16x9}"

    meta = {
        "titulo_evento": safe_title,
        "fecha_evento": formatted_date,
        "tiene_imagen_portada": bool(img_src_attr),
        "imagen_url_original": variantes.get("original"),
        "imagen_url_16x9": variantes.get("widescreen_16x9"),
        "imagen_url_1x1": variantes.get("square_1x1"),
    }

    if img_src_attr:
        header_html = f"""
        <div data-testid="event-email-header" style="margin-bottom: 22px; border-radius: 12px; overflow: hidden; border: 1px solid #e5dcf7; background: #161224;">
            <img src="{img_src_attr}" alt="Portada de {escaped_title}" style="width: 100%; max-height: 220px; object-fit: cover; display: block;" />
            <div style="padding: 16px 20px; background: linear-gradient(135deg, #1a102e 0%, #3b0a75 100%); color: #ffffff; text-align: left;">
                <span style="display: inline-block; background: rgba(255, 255, 255, 0.16); color: #e9d5ff; padding: 3px 10px; border-radius: 12px; font-size: 0.72rem; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase;">EVENTO MEH</span>
                <h2 style="margin: 8px 0 4px 0; color: #ffffff; font-size: 1.25rem; line-height: 1.3;">{escaped_title}</h2>
                <p style="margin: 0; color: #ddd6fe; font-size: 0.88rem;">📅 <b>Fecha:</b> {escaped_date}</p>
            </div>
        </div>
        """
    else:
        header_html = f"""
        <div data-testid="event-email-header-fallback" style="margin-bottom: 22px; border-radius: 12px; overflow: hidden; padding: 18px 20px; background: linear-gradient(135deg, #2b0952 0%, #7f13ec 100%); color: #ffffff; text-align: left;">
            <span style="display: inline-block; background: rgba(255, 255, 255, 0.2); color: #ffffff; padding: 3px 10px; border-radius: 12px; font-size: 0.72rem; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase;">EVENTO MEH</span>
            <h2 style="margin: 8px 0 4px 0; color: #ffffff; font-size: 1.25rem; line-height: 1.3;">{escaped_title}</h2>
            <p style="margin: 0; color: #f3e8ff; font-size: 0.88rem;">📅 <b>Fecha:</b> {escaped_date}</p>
        </div>
        """

    return header_html, inline_images, meta


def is_smtp_configured() -> bool:
    """Verifica si SMTP está configurado correctamente"""
    if not SMTP_USER or not SMTP_PASSWORD:
        logger.warning("⚠️ SMTP no configurado: Falta SMTP_USER o SMTP_PASSWORD en .env")
        return False
    return True


def validate_email(email: str) -> bool:
    """Valida formato de email"""
    try:
        TypeAdapter(EmailStr).validate_python(email)
        return True
    except ValidationError:
        logger.error(f"❌ Email inválido: {email}")
        return False


def registrar_log_fallo_email(
    to_email: str,
    subject: str,
    error_msg: str,
    db: Optional[Session] = None,
    id_admin: Optional[int] = None
):
    """Registra de manera robusta fallos de envío de correo en la tabla de auditoría (logs_sistema)."""
    close_db = False
    active_db = db
    if active_db is None:
        try:
            from ..database import SessionLocal
            active_db = SessionLocal()
            close_db = True
        except Exception as e:
            logger.error(f"No se pudo inicializar sesión de BD para auditoría de email: {e}")
            return

    try:
        from ..core.logging import registrar_log
        from ..models import models

        admin_id = id_admin
        if admin_id is None:
            admin_user = active_db.query(models.Usuario).filter(models.Usuario.rol == "ADMIN").first()
            if admin_user:
                admin_id = admin_user.id_usuario

        registrar_log(
            db=active_db,
            id_admin=admin_id,
            accion="FALLO_ENVIO_EMAIL",
            tabla_afectada="notificaciones_email",
            id_registro_afectado=None,
            valor_anterior=None,
            valor_nuevo={
                "destinatario": to_email,
                "asunto": subject,
                "error": str(error_msg),
                "tipo_fallo": "SMTP_ERROR"
            }
        )
    except Exception as ex:
        logger.error(f"Error al registrar fallo de email en auditoría: {ex}")
    finally:
        if close_db and active_db:
            active_db.close()


def send_email(
    to_email: str, 
    subject: str, 
    html_content: str, 
    retry_count: int = 3,
    images: Optional[Dict[str, Tuple[bytes, str]]] = None,
    db: Optional[Session] = None,
    id_admin: Optional[int] = None
) -> bool:
    """
    Función base para envío de correos vía SMTP
    """
    if not is_smtp_configured():
        msg = f"SMTP no configurado (servidor={SMTP_HOST})"
        logger.warning(f"⚠️ Correo NO enviado a {to_email}: {msg}")
        registrar_log_fallo_email(to_email, subject, msg, db=db, id_admin=id_admin)
        return False
    
    if not validate_email(to_email):
        msg = f"Email destinatario inválido: {to_email}"
        logger.error(f"❌ {msg}")
        registrar_log_fallo_email(to_email, subject, msg, db=db, id_admin=id_admin)
        return False
    
    try:
        if images:
            message = MIMEMultipart("related")
            alt_part = MIMEMultipart("alternative")
            alt_part.attach(MIMEText(html_content, "html", "utf-8"))
            message.attach(alt_part)
            for cid, (img_bytes, subtype) in images.items():
                mime_img = MIMEImage(img_bytes, _subtype=subtype)
                mime_img.add_header("Content-ID", f"<{cid}>")
                mime_img.add_header("Content-Disposition", "inline", filename=f"{cid}.{subtype}")
                message.attach(mime_img)
        else:
            message = MIMEMultipart("alternative")
            part = MIMEText(html_content, "html", "utf-8")
            message.attach(part)

        message["Subject"] = subject
        message["From"] = f"{EMAIL_FROM_NAME} <{SMTP_USER}>"
        message["To"] = to_email
        
        attempt = 0
        while attempt < retry_count:
            try:
                with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
                    server.starttls()
                    server.login(SMTP_USER, SMTP_PASSWORD)
                    server.sendmail(SMTP_USER, to_email, message.as_string())
                
                logger.info(f"✅ Correo enviado exitosamente a {to_email}: {subject}")
                return True
                
            except smtplib.SMTPAuthenticationError as e:
                msg = f"Error de autenticación SMTP: {e}"
                logger.error(f"❌ {msg}")
                registrar_log_fallo_email(to_email, subject, msg, db=db, id_admin=id_admin)
                return False
            except smtplib.SMTPException as e:
                attempt += 1
                if attempt < retry_count:
                    logger.warning(f"⚠️ Intento {attempt}/{retry_count} fallido enviando a {to_email}: {e}")
                else:
                    msg = f"Error SMTP después de {retry_count} intentos: {e}"
                    logger.error(f"❌ {msg}")
                    registrar_log_fallo_email(to_email, subject, msg, db=db, id_admin=id_admin)
                    return False
            except TimeoutError as e:
                attempt += 1
                if attempt < retry_count:
                    logger.warning(f"⚠️ Timeout en intento {attempt}/{retry_count}")
                else:
                    msg = f"Timeout SMTP después de {retry_count} intentos: {e}"
                    logger.error(f"❌ {msg}")
                    registrar_log_fallo_email(to_email, subject, msg, db=db, id_admin=id_admin)
                    return False
                    
    except Exception as e:
        msg = f"Error inesperado enviando email a {to_email}: {e}"
        logger.error(f"❌ {msg}", exc_info=True)
        registrar_log_fallo_email(to_email, subject, msg, db=db, id_admin=id_admin)
        return False


# ============= PLANTILLAS DE CORREOS =============

def notify_pago_actualizado(
    email: str,
    nombre: str,
    estado: str,
    actividad: str,
    fecha_evento: Optional[Any] = None,
    imagen_url: Optional[str] = None,
    evento: Optional[Any] = None,
) -> bool:
    """Notifica actualización de estado de pago (incluye cabecera de evento cuando está vinculado a un evento)."""
    subject = f"Actualización de tu pago - {actividad}"
    color = "#4ecb71" if estado == "APROBADO" else "#ff4d4d"

    active_ev = evento if evento is not None else _ACTIVE_EVENT_CTX.get()
    header_html = ""
    inline_images: Dict[str, Tuple[bytes, str]] = {}
    if active_ev is not None or fecha_evento is not None or imagen_url is not None:
        header_html, inline_images, _ = build_event_email_header(
            evento=active_ev,
            titulo_evento=actividad,
            fecha_evento=fecha_evento,
            imagen_url=imagen_url,
        )

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        {header_html}
        <h2 style="color: #7f13ec;">Hola {nombre},</h2>
        <p>Te informamos que el estado de tu pago para <b>{actividad}</b> ha sido actualizado:</p>
        <div style="background: {color}; color: white; padding: 10px; border-radius: 5px; text-align: center; font-weight: bold; font-size: 1.2rem;">
            {estado}
        </div>
        <p style="margin-top: 20px;">Puedes revisar los detalles en tu sección de <b>Finanzas</b> dentro de la plataforma.</p>
        <div style="text-align: center; margin: 20px 0;">
            <a href="{FRONTEND_FINANZAS}" style="display: inline-block; background: #7f13ec; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ver mis Pagos</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <footer style="font-size: 0.8rem; color: #888; text-align: center;">
            Este es un correo automático de Plataforma MEH.<br>
            No respondas a este mensaje.
        </footer>
    </div>
    """
    return send_email(email, subject, html, images=inline_images or None)


def notify_nuevo_certificado(
    email: str,
    nombre: str,
    actividad: str,
    fecha_evento: Optional[Any] = None,
    imagen_url: Optional[str] = None,
    evento: Optional[Any] = None,
) -> bool:
    """Notifica que un certificado está listo (con cabecera de evento si corresponde)."""
    subject = f"¡Felicidades! Tu diploma de {actividad} está listo"

    active_ev = evento if evento is not None else _ACTIVE_EVENT_CTX.get()
    header_html = ""
    inline_images: Dict[str, Tuple[bytes, str]] = {}
    if active_ev is not None or fecha_evento is not None or imagen_url is not None:
        header_html, inline_images, _ = build_event_email_header(
            evento=active_ev,
            titulo_evento=actividad,
            fecha_evento=fecha_evento,
            imagen_url=imagen_url,
        )

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px; text-align: center;">
        {header_html}
        <h1 style="color: #7f13ec;">¡Lo lograste! 🎓</h1>
        <p style="font-size: 1.1rem;">Hola <b>{nombre}</b>, tu esfuerzo ha dado frutos.</p>
        <p>Ya puedes visualizar y descargar tu certificado oficial de <b>{actividad}</b> desde el Learning Hub.</p>
        <div style="margin: 20px 0;">
            <a href="{FRONTEND_LEARNING}" style="display: inline-block; background: #7f13ec; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ver mi Diploma</a>
        </div>
        <p style="font-size: 0.9rem; color: #666;">¡Sigue potenciando tu carrera con nosotros!</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <footer style="font-size: 0.8rem; color: #888; text-align: center;">
            Este es un correo automático de Plataforma MEH.<br>
            No respondas a este mensaje.
        </footer>
    </div>
    """
    return send_email(email, subject, html, images=inline_images or None)


def notify_bienvenida(email: str, nombre: str) -> bool:
    """Notifica bienvenida a nuevo usuario"""
    subject = "¡Bienvenido a la Comunidad MEH!"
    
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <div style="text-align: center;"><h1 style="color: #7f13ec;">Bienvenido a bordo 🚀</h1></div>
        <p>Hola <b>{nombre}</b>, es un gusto tenerte en la comunidad.</p>
        <p>A partir de ahora podrás:</p>
        <ul style="line-height: 1.8;">
            <li>Inscribirte a talleres exclusivos de Microsoft.</li>
            <li>Ganar insignias por tus logros.</li>
            <li>Conectar con otros entusiastas de la tecnología.</li>
        </ul>
        <p>Entra a tu dashboard para completar tu perfil público.</p>
        <div style="text-align: center; margin: 20px 0;">
            <a href="{FRONTEND_DASHBOARD}" style="display: inline-block; background: #7f13ec; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ir a mi Portal</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <footer style="font-size: 0.8rem; color: #888; text-align: center;">
            Este es un correo automático de Plataforma MEH.<br>
            No respondas a este mensaje.
        </footer>
    </div>
    """
    return send_email(email, subject, html)


def render_nuevo_anuncio_email(
    nombre: str,
    titulo_anuncio: str,
    contenido_anuncio: str,
    evento: Optional[Any] = None,
    titulo_evento: Optional[str] = None,
    fecha_evento: Optional[Any] = None,
    imagen_url: Optional[str] = None,
    for_preview: bool = False,
) -> Tuple[str, str, Dict[str, Tuple[bytes, str]], Optional[Dict[str, Any]]]:
    """Construye el asunto, HTML e imágenes inline para un correo de anuncio (con cabecera si está vinculado a evento)."""
    subject = f"🔔 Anuncio Importante: {titulo_anuncio}"
    header_html = ""
    inline_images: Dict[str, Tuple[bytes, str]] = {}
    meta: Optional[Dict[str, Any]] = None

    active_ev = evento if evento is not None else _ACTIVE_EVENT_CTX.get()
    has_linked_event = (
        active_ev is not None
        or bool(titulo_evento)
        or fecha_evento is not None
        or bool(imagen_url)
    )
    if has_linked_event:
        header_html, inline_images, meta = build_event_email_header(
            evento=active_ev,
            titulo_evento=titulo_evento,
            fecha_evento=fecha_evento,
            imagen_url=imagen_url,
            for_preview=for_preview,
        )

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <span style="background: #7f13ec; color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.8rem; font-weight: bold;">COMUNIDAD MEH</span>
        </div>
        {header_html}
        <h2 style="color: #333;">Hola {nombre},</h2>
        <p>Se ha publicado un nuevo anuncio que podría interesarte:</p>
        <div style="background: #f9f9f9; border-left: 4px solid #7f13ec; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #7f13ec;">{titulo_anuncio}</h3>
            <div style="color: #555; line-height: 1.6;">{contenido_anuncio}</div>
        </div>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{FRONTEND_DASHBOARD}" style="display: inline-block; background: #7f13ec; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ver en el Dashboard</a>
        </div>
        <p style="font-size: 0.9rem; color: #888;">Si no deseas recibir más notificaciones, puedes ajustar tus preferencias en la configuración de tu perfil.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <footer style="font-size: 0.8rem; color: #888; text-align: center;">
            Plataforma Microsoft Education Hub - Innovando el futuro, juntos.
        </footer>
    </div>
    """
    return subject, html, inline_images, meta


def notify_nuevo_anuncio(
    email: str,
    nombre: str,
    titulo_anuncio: str,
    contenido_anuncio: str,
    evento: Optional[Any] = None,
    titulo_evento: Optional[str] = None,
    fecha_evento: Optional[Any] = None,
    imagen_url: Optional[str] = None,
) -> bool:
    """Notifica un nuevo anuncio importante a la comunidad (con cabecera del evento si está vinculado)."""
    subject, html, inline_images, _ = render_nuevo_anuncio_email(
        nombre=nombre,
        titulo_anuncio=titulo_anuncio,
        contenido_anuncio=contenido_anuncio,
        evento=evento,
        titulo_evento=titulo_evento,
        fecha_evento=fecha_evento,
        imagen_url=imagen_url,
        for_preview=False,
    )
    return send_email(email, subject, html, images=inline_images or None)


def notify_reset_password(email: str, nombre: str, token: str) -> bool:
    """Notifica solicitud de restablecimiento de contraseña"""
    subject = "Restablece tu contraseña - Plataforma MEH"
    reset_url = f"{FRONTEND_URL}/reset-password?token={token}"
    
    if not is_smtp_configured():
        env = os.getenv("ENVIRONMENT", "development").lower()
        if env not in ("production", "prod"):
            logger.info(f"📧 [DEV] URL de recuperación de contraseña para {email}: {reset_url}")
        else:
            logger.warning(f"⚠️ SMTP no configurado en producción. No se pudo enviar el correo de recuperación a {email}")
        return False

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #7f13ec;">Hola {nombre},</h2>
        <p>Has solicitado restablecer tu contraseña en la Plataforma MEH.</p>
        <p>Para continuar, haz clic en el siguiente botón. Este enlace expirará en 1 hora.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{reset_url}" style="display: inline-block; background: #7f13ec; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Restablecer Contraseña</a>
        </div>
        <p style="font-size: 0.9rem; color: #888;">Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <footer style="font-size: 0.8rem; color: #888; text-align: center;">
            Plataforma Microsoft Education Hub - Innovando el futuro, juntos.
        </footer>
    </div>
    """
    return send_email(email, subject, html)


def notify_ticket_qr(
    email: str, 
    nombre: str, 
    titulo_evento: str, 
    fecha: str, 
    codigo_qr: str, 
    frontend_url: str,
    incluidos: Optional[List[str]] = None,
    imagen_url: Optional[str] = None,
    evento: Optional[Any] = None,
) -> bool:
    """Envía el ticket de entrada con su código QR y la cabecera unificada del evento."""
    subject = f"🎟️ Tu entrada para {titulo_evento}"
    
    qr_bytes = generate_qr_image_bytes(codigo_qr)
    header_html, inline_images, _ = build_event_email_header(
        evento=evento,
        titulo_evento=titulo_evento,
        fecha_evento=fecha,
        imagen_url=imagen_url,
    )
    inline_images["ticket_qr"] = (qr_bytes, "png")
    
    incluidos_html = ""
    if incluidos and len(incluidos) > 0:
        items_list = "".join([f"<li style='margin-bottom: 6px;'><b>{item}</b></li>" for item in incluidos])
        incluidos_html = f"""
        <div style="margin: 16px 0; padding: 14px; background: rgba(127, 19, 236, 0.08); border-radius: 8px; border: 1px solid rgba(127, 19, 236, 0.2); text-align: left;">
            <p style="margin: 0 0 8px 0; font-weight: bold; color: #7f13ec; font-size: 0.95rem;">🎁 Incluido con tu inscripción:</p>
            <ul style="margin: 0; padding-left: 20px; color: #333; font-size: 0.9rem;">
                {items_list}
            </ul>
            <p style="margin: 8px 0 0 0; font-size: 0.8rem; color: #666; font-style: italic;">
                💡 Tu mismo código QR servirá para la acreditación y para recibir cada uno de tus entregables en los checkpoints del evento.
            </p>
        </div>
        """
    
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 16px;">
            <span style="background: #7f13ec; color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.8rem; font-weight: bold;">TICKET DE ENTRADA</span>
        </div>
        {header_html}
        <h2 style="color: #333; text-align: center;">¡Tu lugar está confirmado! 🎉</h2>
        <p>Hola <b>{nombre}</b>,</p>
        <p>Tu inscripción para el evento <b>{titulo_evento}</b> ha sido confirmada exitosamente. A continuación se encuentra tu ticket de ingreso:</p>
        
        <div style="background: #f9f9f9; border: 2px dashed #7f13ec; padding: 20px; margin: 25px 0; border-radius: 10px; text-align: center;">
            <h3 style="margin-top: 0; color: #7f13ec; font-size: 1.4rem;">{titulo_evento}</h3>
            <p style="margin: 5px 0; color: #666;"><b>Fecha:</b> {fecha}</p>
            
            <div style="margin: 20px 0;">
                <img src="cid:ticket_qr" alt="Código QR de Entrada" style="border: 1px solid #ddd; padding: 10px; background: white; border-radius: 8px; width: 180px; height: 180px;" />
            </div>
            
            <p style="font-family: monospace; font-size: 0.85rem; color: #888; margin: 5px 0;">Código: {codigo_qr}</p>
            {incluidos_html}
            <p style="font-size: 0.9rem; color: #333; font-weight: bold; margin-top: 15px;">⚠️ Muestra este código QR en el ingreso para registrar tu acreditación y recibir tus entregables.</p>
        </div>
        
        <p>También puedes ver tu ticket en cualquier momento desde tu **Dashboard** en la sección de eventos inscritos.</p>
        <div style="text-align: center; margin: 25px 0;">
            <a href="{frontend_url}/dashboard" style="display: inline-block; background: #7f13ec; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ir a mi Portal</a>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <footer style="font-size: 0.8rem; color: #888; text-align: center;">
            Plataforma Microsoft Education Hub - Innovando el futuro, juntos.<br>
            Este es un correo automático. No respondas a este mensaje.
        </footer>
    </div>
    """
    return send_email(email, subject, html, images=inline_images)


def notify_email_verification(email: str, nombre: str, codigo: str) -> bool:
    """Envía el código numérico de verificación de correo electrónico."""
    subject = f"🔐 Código de verificación: {codigo} - Plataforma MEH"
    verification_url = f"{FRONTEND_URL}/verificar-email?email={email}"

    logger.info(f"📧 [EMAIL VERIFICATION] Para: {email} | Código: {codigo} | URL: {verification_url}")

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 24px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <span style="background: #7f13ec; color: white; padding: 6px 18px; border-radius: 20px; font-size: 0.85rem; font-weight: bold;">VERIFICACIÓN DE CUENTA</span>
        </div>
        <h2 style="color: #333; text-align: center;">¡Hola, {nombre}! 👋</h2>
        <p style="color: #555; font-size: 1rem; line-height: 1.5;">Gracias por registrarte en la <b>Plataforma Microsoft Education Hub</b>. Para activar tu cuenta y poder iniciar sesión, ingresa el siguiente código de verificación:</p>
        
        <div style="background: #f4f0ff; border: 2px dashed #7f13ec; padding: 20px; margin: 25px 0; border-radius: 10px; text-align: center;">
            <p style="margin: 0 0 8px 0; color: #7f13ec; font-size: 0.9rem; font-weight: bold; text-transform: uppercase;">Tu código de seguridad</p>
            <span style="font-size: 2.2rem; font-weight: bold; letter-spacing: 6px; color: #1a1a2e; font-family: monospace;">{codigo}</span>
            <p style="margin: 8px 0 0 0; color: #888; font-size: 0.8rem;">Este código expira en 30 minutos.</p>
        </div>

        <p style="color: #666; font-size: 0.9rem;">También puedes completar tu verificación directamente haciendo clic en el siguiente botón:</p>
        <div style="text-align: center; margin: 25px 0;">
            <a href="{verification_url}" style="display: inline-block; background: #7f13ec; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verificar mi Correo</a>
        </div>

        <p style="font-size: 0.85rem; color: #888;">Si no has intentado registrarte en la plataforma, puedes ignorar este mensaje.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <footer style="font-size: 0.8rem; color: #888; text-align: center;">
            Plataforma Microsoft Education Hub - Innovando el futuro, juntos.<br>
            Mensaje automático de seguridad.
        </footer>
    </div>
    """
    return send_email(email, subject, html)


def notify_evento_cancelado(
    email: str,
    nombre: str,
    titulo_evento: str,
    motivo: str,
    fecha_evento: Optional[Any] = None,
    imagen_url: Optional[str] = None,
    evento: Optional[Any] = None,
) -> bool:
    """Notifica la cancelación de un evento con su motivo y cabecera del evento."""
    subject = f"❌ Cancelación de evento: {titulo_evento} - Plataforma MEH"
    header_html, inline_images, _ = build_event_email_header(
        evento=evento,
        titulo_evento=titulo_evento,
        fecha_evento=fecha_evento,
        imagen_url=imagen_url,
    )
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 16px;">
            <span style="background: #e53935; color: white; padding: 6px 18px; border-radius: 20px; font-size: 0.85rem; font-weight: bold;">EVENTO CANCELADO</span>
        </div>
        {header_html}
        <h2 style="color: #333; text-align: center;">Aviso Importante</h2>
        <p>Hola <b>{nombre}</b>,</p>
        <p>Te informamos que el evento <b>{titulo_evento}</b> en el cual estabas registrado ha sido <b>cancelado</b>.</p>
        
        <div style="background: #fff5f5; border: 2px dashed #e53935; padding: 20px; margin: 25px 0; border-radius: 10px; text-align: left;">
            <p style="margin: 0 0 6px 0; font-weight: bold; color: #e53935; font-size: 0.95rem;">Motivo de la cancelación:</p>
            <p style="margin: 0; color: #444; font-size: 0.95rem; line-height: 1.5;">{motivo}</p>
        </div>

        <p style="color: #666; font-size: 0.9rem;">Lamentamos los inconvenientes que esto pueda ocasionar. Si tienes dudas o consultas sobre reembolsos o próximas fechas, por favor contacta a nuestro equipo organizador.</p>
        <div style="text-align: center; margin: 25px 0;">
            <a href="{FRONTEND_URL}/dashboard" style="display: inline-block; background: #7f13ec; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ir a mi Portal</a>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <footer style="font-size: 0.8rem; color: #888; text-align: center;">
            Plataforma Microsoft Education Hub - Innovando el futuro, juntos.<br>
            Mensaje automático de notificación.
        </footer>
    </div>
    """
    return send_email(email, subject, html, images=inline_images or None)


def notify_evento_reprogramado(
    email: str, 
    nombre: str, 
    titulo_evento: str, 
    nueva_fecha: str, 
    nuevo_horario: Optional[str] = None,
    imagen_url: Optional[str] = None,
    evento: Optional[Any] = None,
) -> bool:
    """Notifica la reprogramación de fecha u horario de un evento incluyendo su cabecera."""
    subject = f"📅 Reprogramación de fecha: {titulo_evento} - Plataforma MEH"
    header_html, inline_images, _ = build_event_email_header(
        evento=evento,
        titulo_evento=titulo_evento,
        fecha_evento=nueva_fecha,
        hora_evento=nuevo_horario,
        imagen_url=imagen_url,
    )
    horario_texto = f"<p style='margin: 6px 0 0 0; color: #333;'><b>Nuevo Horario:</b> {nuevo_horario}</p>" if nuevo_horario else ""
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 16px;">
            <span style="background: #f59e0b; color: white; padding: 6px 18px; border-radius: 20px; font-size: 0.85rem; font-weight: bold;">CAMBIO DE FECHA</span>
        </div>
        {header_html}
        <h2 style="color: #333; text-align: center;">¡Atención, nueva fecha confirmada! 📅</h2>
        <p>Hola <b>{nombre}</b>,</p>
        <p>El evento <b>{titulo_evento}</b> ha sido reprogramado. A continuación encontrarás los nuevos detalles del evento:</p>
        
        <div style="background: #fffbeb; border: 2px dashed #f59e0b; padding: 20px; margin: 25px 0; border-radius: 10px; text-align: left;">
            <h3 style="margin-top: 0; color: #b45309; font-size: 1.2rem;">{titulo_evento}</h3>
            <p style="margin: 0; color: #333;"><b>Nueva Fecha:</b> {nueva_fecha}</p>
            {horario_texto}
            <p style="margin: 12px 0 0 0; font-size: 0.85rem; color: #78350f;">💡 Tu inscripción y tu código QR de acceso siguen siendo válidos para esta nueva fecha.</p>
        </div>

        <p style="color: #666; font-size: 0.9rem;">Puedes consultar tu ticket actualizado directamente desde tu portal de usuario.</p>
        <div style="text-align: center; margin: 25px 0;">
            <a href="{FRONTEND_URL}/dashboard" style="display: inline-block; background: #7f13ec; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ver mi Entrada</a>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <footer style="font-size: 0.8rem; color: #888; text-align: center;">
            Plataforma Microsoft Education Hub - Innovando el futuro, juntos.<br>
            Mensaje automático de notificación.
        </footer>
    </div>
    """
    return send_email(email, subject, html, images=inline_images or None)


def render_aviso_evento_email(
    nombre: str,
    titulo_evento: str,
    titulo_aviso: str,
    mensaje: str,
    fecha_evento: Optional[Any] = None,
    imagen_url: Optional[str] = None,
    evento: Optional[Any] = None,
    for_preview: bool = False,
) -> Tuple[str, str, Dict[str, Tuple[bytes, str]], Dict[str, Any]]:
    """Construye asunto, HTML, imágenes inline y metadatos para un aviso de evento."""
    subject = f"📢 Comunicado: {titulo_evento} - {titulo_aviso}"
    header_html, inline_images, meta = build_event_email_header(
        evento=evento,
        titulo_evento=titulo_evento,
        fecha_evento=fecha_evento,
        imagen_url=imagen_url,
        for_preview=for_preview,
    )
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 16px;">
            <span style="background: #7f13ec; color: white; padding: 6px 18px; border-radius: 20px; font-size: 0.85rem; font-weight: bold;">COMUNICADO OFICIAL</span>
        </div>
        {header_html}
        <h2 style="color: #333; text-align: center;">{titulo_aviso}</h2>
        <p>Hola <b>{nombre}</b>,</p>
        <p>Los organizadores del evento <b>{titulo_evento}</b> han publicado el siguiente comunicado para los asistentes:</p>
        
        <div style="background: #f7f3fd; border-left: 4px solid #7f13ec; padding: 18px; margin: 25px 0; border-radius: 4px; text-align: left;">
            <p style="margin: 0; color: #222; font-size: 0.95rem; line-height: 1.6; white-space: pre-line;">{mensaje}</p>
        </div>

        <p style="color: #666; font-size: 0.9rem;">Mantente atento a tu portal y a la comunidad para más novedades sobre este evento.</p>
        <div style="text-align: center; margin: 25px 0;">
            <a href="{FRONTEND_URL}/dashboard" style="display: inline-block; background: #7f13ec; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ir a mi Portal</a>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <footer style="font-size: 0.8rem; color: #888; text-align: center;">
            Plataforma Microsoft Education Hub - Innovando el futuro, juntos.<br>
            Mensaje automático de la organización.
        </footer>
    </div>
    """
    return subject, html, inline_images, meta


def notify_aviso_evento(
    email: str, 
    nombre: str, 
    titulo_evento: str, 
    titulo_aviso: str, 
    mensaje: str,
    fecha_evento: Optional[Any] = None,
    imagen_url: Optional[str] = None,
    evento: Optional[Any] = None,
) -> bool:
    """Envía un aviso oficial de los organizadores a los inscritos de un evento."""
    subject, html, inline_images, _ = render_aviso_evento_email(
        nombre=nombre,
        titulo_evento=titulo_evento,
        titulo_aviso=titulo_aviso,
        mensaje=mensaje,
        fecha_evento=fecha_evento,
        imagen_url=imagen_url,
        evento=evento,
        for_preview=False,
    )
    return send_email(email, subject, html, images=inline_images or None)

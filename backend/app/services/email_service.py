import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from typing import Optional
import logging
from pydantic import EmailStr, ValidationError, TypeAdapter

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


def send_email(to_email: str, subject: str, html_content: str, retry_count: int = 3) -> bool:
    """
    Función base para envío de correos vía SMTP
    
    Args:
        to_email: Email destinatario
        subject: Asunto del correo
        html_content: Contenido HTML
        retry_count: Número de reintentos en caso de fallo
    
    Returns:
        bool: True si se envió, False si falló
    """
    
    # Validar que SMTP esté configurado
    if not is_smtp_configured():
        logger.warning(f"⚠️ Correo NO enviado a {to_email}: SMTP no configurado")
        return False
    
    # Validar email destinatario
    if not validate_email(to_email):
        logger.error(f"❌ No se puede enviar a {to_email}: Email inválido")
        return False
    
    try:
        # Construir mensaje
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"{EMAIL_FROM_NAME} <{SMTP_USER}>"
        message["To"] = to_email
        
        # Versión HTML del correo
        part = MIMEText(html_content, "html", "utf-8")
        message.attach(part)
        
        # Conexión segura al servidor SMTP (con reintentos)
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
                logger.error(f"❌ Error de autenticación SMTP: {e}")
                return False
            except smtplib.SMTPException as e:
                attempt += 1
                if attempt < retry_count:
                    logger.warning(f"⚠️ Intento {attempt}/{retry_count} fallido enviando a {to_email}: {e}")
                else:
                    logger.error(f"❌ Error SMTP después de {retry_count} intentos: {e}")
                    return False
            except TimeoutError:
                attempt += 1
                if attempt < retry_count:
                    logger.warning(f"⚠️ Timeout en intento {attempt}/{retry_count}")
                else:
                    logger.error(f"❌ Timeout SMTP después de {retry_count} intentos")
                    return False
                    
    except Exception as e:
        logger.error(f"❌ Error inesperado enviando email a {to_email}: {e}", exc_info=True)
        return False


# ============= PLANTILLAS DE CORREOS =============

def notify_pago_actualizado(email: str, nombre: str, estado: str, actividad: str) -> bool:
    """Notifica actualización de estado de pago"""
    subject = f"Actualización de tu pago - {actividad}"
    color = "#4ecb71" if estado == "APROBADO" else "#ff4d4d"
    
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
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
    return send_email(email, subject, html)


def notify_nuevo_certificado(email: str, nombre: str, actividad: str) -> bool:
    """Notifica que un certificado está listo"""
    subject = f"¡Felicidades! Tu diploma de {actividad} está listo"
    
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px; text-align: center;">
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
    return send_email(email, subject, html)


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


def notify_nuevo_anuncio(email: str, nombre: str, titulo_anuncio: str, contenido_anuncio: str) -> bool:
    """Notifica un nuevo anuncio importante a la comunidad"""
    subject = f"🔔 Anuncio Importante: {titulo_anuncio}"
    
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <span style="background: #7f13ec; color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.8rem; font-weight: bold;">COMUNIDAD MEH</span>
        </div>
        <h2 style="color: #333;">Hola {nombre},</h2>
        <p>Se ha publicado un nuevo anuncio que podría interesarte:</p>
        <div style="background: #f9f9f9; border-left: 4px solid #7f13ec; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #7f13ec;">{titulo_anuncio}</h3>
            <p style="color: #555; line-height: 1.6;">{contenido_anuncio}</p>
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
    return send_email(email, subject, html)
def notify_ticket_qr(email: str, nombre: str, titulo_evento: str, fecha: str, codigo_qr: str, frontend_url: str) -> bool:
    """Notifica al usuario con su ticket QR para un evento"""
    subject = f"🎟️ Tu Ticket de Ingreso - {titulo_evento}"
    validation_url = f"{frontend_url}/verificar/{codigo_qr}"
    qr_img_url = f"https://api.qrserver.com/v1/create-qr-code/?size=200x200&data={validation_url}"

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px; text-align: center;">
        <div style="text-align: center; margin-bottom: 20px;">
            <span style="background: #7f13ec; color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.8rem; font-weight: bold;">TICKET OFICIAL MEH</span>
        </div>
        <h2 style="color: #333;">Hola {nombre},</h2>
        <p>Tu inscripción ha sido procesada con éxito. Aquí tienes tu código QR de ingreso para el evento:</p>
        <div style="background: #f9f9f9; border-left: 4px solid #7f13ec; padding: 15px; margin: 20px 0; text-align: left;">
            <h3 style="margin-top: 0; color: #7f13ec;">{titulo_evento}</h3>
            <p style="color: #555; line-height: 1.6;"><strong>Fecha de inicio:</strong> {fecha}</p>
        </div>
        <div style="margin: 30px 0;">
            <p>Muestra este código QR en el ingreso del evento:</p>
            <img src="{qr_img_url}" alt="Tu Código QR" style="border: 2px solid #eee; border-radius: 10px; padding: 10px;"/>
            <p style="font-size: 0.85rem; color: #777; margin-top: 10px;">Código: {codigo_qr}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{frontend_url}/dashboard" style="display: inline-block; background: #7f13ec; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ir a mi Portal</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <footer style="font-size: 0.8rem; color: #888; text-align: center;">
            Plataforma Microsoft Education Hub - Innovando el futuro, juntos.
        </footer>
    </div>
    """
    return send_email(email, subject, html)

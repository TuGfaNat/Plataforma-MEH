"""
Configuración de SMTP con validaciones
Instrucciones para diferentes proveedores
"""
import os

class SMTPConfig:
    """Configuración centralizada de SMTP"""
    
    HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
    PORT = int(os.getenv("SMTP_PORT", "587"))
    USER = os.getenv("SMTP_USER", "").strip()
    PASSWORD = os.getenv("SMTP_PASSWORD", "").strip()
    FROM_NAME = os.getenv("EMAIL_FROM_NAME", "Plataforma MEH")
    
    @classmethod
    def is_configured(cls) -> bool:
        """Verifica si SMTP está correctamente configurado"""
        return bool(cls.USER and cls.PASSWORD)
    
    @classmethod
    def validate(cls) -> tuple[bool, str]:
        """Valida la configuración SMTP"""
        if not cls.USER:
            return False, "❌ SMTP_USER no configurado en .env"
        if not cls.PASSWORD:
            return False, "❌ SMTP_PASSWORD no configurado en .env"
        if not cls.HOST:
            return False, "❌ SMTP_HOST no configurado"
        try:
            if cls.PORT < 1 or cls.PORT > 65535:
                return False, "❌ SMTP_PORT debe estar entre 1 y 65535"
        except (ValueError, TypeError):
            return False, "❌ SMTP_PORT debe ser un número"
        
        return True, "✅ Configuración SMTP válida"


# ============ INSTRUCCIONES DE CONFIGURACIÓN ============

INSTRUCCIONES = {
    "gmail": """
    📧 CONFIGURAR GMAIL (Recomendado para desarrollo)
    =====================================================
    
    1. Ve a https://myaccount.google.com/
    2. En el menú, abre "Seguridad"
    3. Habilita "Acceso a aplicaciones menos seguras" O
       (Si tienes 2FA activado):
       - Ve a "Contraseñas de aplicación"
       - Selecciona "Correo" y "Windows"
       - Copia la contraseña de 16 caracteres
    
    4. En tu .env:
       SMTP_HOST=smtp.gmail.com
       SMTP_PORT=587
       SMTP_USER=tu-email@gmail.com
       SMTP_PASSWORD=tu-contraseña-o-app-password
       EMAIL_FROM_NAME=Plataforma MEH
    """,
    
    "outlook": """
    📧 CONFIGURAR OUTLOOK (Alternativa)
    ====================================
    
    1. Ve a https://account.live.com/
    2. En "Seguridad", crea una "Contraseña de aplicación"
    
    3. En tu .env:
       SMTP_HOST=smtp.office365.com
       SMTP_PORT=587
       SMTP_USER=tu-email@hotmail.com
       SMTP_PASSWORD=contraseña-de-aplicación
       EMAIL_FROM_NAME=Plataforma MEH
    """,
    
    "custom": """
    📧 CONFIGURAR SMTP PERSONALIZADO
    ================================
    
    Reemplaza los valores con tu servidor SMTP:
    
    SMTP_HOST=tu-servidor.com
    SMTP_PORT=587
    SMTP_USER=tu-usuario
    SMTP_PASSWORD=tu-contraseña
    EMAIL_FROM_NAME=Tu Nombre
    
    Nota: El puerto 587 usa TLS (seguro)
    """
}

def print_instrucciones():
    """Imprime las instrucciones en la consola"""
    print("\n" + "="*60)
    print(INSTRUCCIONES["gmail"])
    print("="*60 + "\n")


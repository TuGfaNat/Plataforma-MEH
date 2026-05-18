from fastapi import Request, status
from fastapi.responses import JSONResponse

class BaseDomainError(Exception):
    """Excepción base para todos los errores de dominio de la plataforma."""
    def __init__(self, message: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        self.message = message
        self.status_code = status_code
        super().__init__(f"[{self.status_code}] {self.message}")

# --- ERRORES DE AUTENTICACIÓN Y PERMISOS ---
class CredencialesInvalidasError(BaseDomainError):
    def __init__(self, message: str = "Correo o contraseña incorrectos"):
        super().__init__(message, status.HTTP_401_UNAUTHORIZED)

class PermisoDenegadoError(BaseDomainError):
    def __init__(self, message: str = "No tienes permisos para realizar esta acción"):
        super().__init__(message, status.HTTP_403_FORBIDDEN)

class TokenExpiradoError(BaseDomainError):
    def __init__(self, message: str = "La sesión ha expirado"):
        super().__init__(message, status.HTTP_401_UNAUTHORIZED)

# --- ERRORES DE RECURSOS (404) ---
class RecursoNoEncontradoError(BaseDomainError):
    def __init__(self, message: str = "El recurso solicitado no existe"):
        super().__init__(message, status.HTTP_404_NOT_FOUND)

class UsuarioNoEncontradoError(RecursoNoEncontradoError):
    def __init__(self, message: str = "Usuario no encontrado"):
        super().__init__(message)

class EventoNoEncontradoError(RecursoNoEncontradoError):
    def __init__(self, message: str = "Evento no encontrado"):
        super().__init__(message)

# --- ERRORES DE NEGOCIO (400) ---
class ValidacionNegocioError(BaseDomainError):
    def __init__(self, message: str):
        super().__init__(message, status.HTTP_400_BAD_REQUEST)

class CupoExcedidoError(ValidacionNegocioError):
    def __init__(self, message: str = "El evento ha alcanzado su capacidad máxima"):
        super().__init__(message)

class RegistroDuplicadoError(ValidacionNegocioError):
    def __init__(self, message: str = "Ya existe un registro con estos datos"):
        super().__init__(message)

class PagoInvalidoError(ValidacionNegocioError):
    def __init__(self, message: str = "El pago no pudo ser validado"):
        super().__init__(message)

# --- MANEJADORES GLOBALES ---
def domain_exception_handler(request: Request, exc: BaseDomainError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message}
    )

def global_exception_handler(request: Request, exc: Exception):
    # Log del error original para debug
    import logging
    logger = logging.getLogger(__name__)
    logger.error("Error no manejado: %s", str(exc), exc_info=True)
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Error interno del servidor. Por favor, contacte al soporte."}
    )

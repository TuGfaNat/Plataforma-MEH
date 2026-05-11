from fastapi import Request, status
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

async def global_exception_handler(request: Request, exc: Exception):
    # Loguear el error internamente para el admin
    logger.error(f"Error global detectado: {exc}", exc_info=True)
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "status": "error",
            "detail": "Ha ocurrido un error inesperado en el servidor. Por favor, contacta a soporte.",
            "type": type(exc).__name__
        },
    )

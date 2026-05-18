import logging
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, eventos, cursos, inscripciones, logs, pagos, comunidad, dashboard, recursos, asistencia, reports, badges, files, admin_directories, learning_path, souvenirs
from app.core.exceptions import global_exception_handler, BaseDomainError, domain_exception_handler
from app.core.email_config import SMTPConfig

logger = logging.getLogger(__name__)

# Validar configuración de SMTP al iniciar
is_valid, message = SMTPConfig.validate()
if is_valid:
    logger.info("SMTP: %s", message)
else:
    logger.warning("SMTP: %s", message)
    logger.warning("Los correos electrónicos NO se enviarán hasta que se configure SMTP")

app = FastAPI(title="Plataforma MEH API", version="1.0.0")

# Registrar manejadores de errores
app.add_exception_handler(BaseDomainError, domain_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

# Configuración de CORS - Permitir frontend local y producción
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://plataforma-meh.onrender.com", # Ejemplo de URL de producción
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(
        "Peticion %s %s -> %s (%.4fs)",
        request.method,
        request.url.path,
        response.status_code,
        process_time,
    )
    return response

# Incluir routers
app.include_router(auth.router)
app.include_router(eventos.router)
app.include_router(cursos.router)
app.include_router(inscripciones.router)
app.include_router(logs.router)
app.include_router(pagos.router)
app.include_router(comunidad.router)
app.include_router(dashboard.router)
app.include_router(recursos.router)
app.include_router(asistencia.router)
app.include_router(reports.router)
app.include_router(badges.router)
app.include_router(files.router)
app.include_router(admin_directories.router)
app.include_router(learning_path.router)
app.include_router(souvenirs.router)

@app.get("/")
def read_root():
    return {"status": "online", "message": "Microsoft EducationHub API is running"}

@app.get("/health")
def health_check():
    return {
        "status": "ok", 
        "timestamp": time.time(),
        "smtp_configured": SMTPConfig.validate()[0]
    }

if __name__ == "__main__":
    import uvicorn
    logger.info("Iniciando servidor en http://127.0.0.1:8000")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

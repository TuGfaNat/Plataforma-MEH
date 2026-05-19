import os
import logging
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api import auth, eventos, cursos, academia, inscripciones, logs, pagos, comunidad, dashboard, recursos, asistencia, reports, badges, files, admin_directories, learning_path, souvenirs
from app.core.exceptions import global_exception_handler, BaseDomainError, domain_exception_handler
from app.core.email_config import SMTPConfig

# Configurar logging para ver errores de rutas
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Plataforma MEH API", version="1.0.0")

# --- MANEJO DE ERRORES ---
app.add_exception_handler(BaseDomainError, domain_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

# --- CONFIGURACIÓN DE CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CORRECCIÓN DE RUTAS ESTÁTICAS ---
# main.py está en F:\Plataforma-MEH\backend\main.py
# La carpeta static está en F:\Plataforma-MEH\backend\static
BASE_DIR = os.path.dirname(os.path.abspath(__file__)) 
STATIC_DIR = os.path.normpath(os.path.join(BASE_DIR, "static"))
UPLOADS_DIR = os.path.join(STATIC_DIR, "uploads")

# Asegurar existencia física
os.makedirs(UPLOADS_DIR, exist_ok=True)

# Montar con logs de confirmación
logger.info(f"🚀 Iniciando montaje de estáticos...")
logger.info(f"📍 BASE_DIR detectado: {BASE_DIR}")
logger.info(f"📁 STATIC_DIR configurado: {STATIC_DIR}")

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    if "/static" in request.url.path:
        logger.info(f"🖼️ ACCESO A IMAGEN: {request.url.path} -> {response.status_code}")
    return response

# Incluir routers
app.include_router(auth.router)
app.include_router(eventos.router)
app.include_router(cursos.router)
app.include_router(academia.router) # Habilitado el motor de aula virtual
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
    return {
        "status": "online", 
        "static_path": STATIC_DIR,
        "uploads_exist": os.path.exists(UPLOADS_DIR)
    }

@app.get("/debug/files")
def list_static_files():
    """Endpoint de emergencia para ver qué archivos hay en el servidor."""
    files_list = []
    for root, dirs, files in os.walk(STATIC_DIR):
        for file in files:
            files_list.append(os.path.join(root, file).replace(STATIC_DIR, ""))
    return {"static_root": STATIC_DIR, "files": files_list}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

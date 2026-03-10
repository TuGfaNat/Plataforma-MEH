from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, eventos, cursos, inscripciones, logs, pagos, comunidad
from app.database import engine, Base
import time

# Crear tablas en la base de datos si no existen
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Plataforma MEH API")

# Configuración de CORS - Permitir todo para desarrollo local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware de Debug para ver qué llega al servidor
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    print(f"📥 Petición: {request.method} {request.url.path}")
    response = await call_next(request)
    process_time = time.time() - start_time
    print(f"📤 Respuesta: {response.status_code} (Tiempo: {process_time:.4f}s)")
    return response

# Incluir routers
app.include_router(auth.router)
app.include_router(eventos.router)
app.include_router(cursos.router)
app.include_router(inscripciones.router)
app.include_router(logs.router)
app.include_router(pagos.router)
app.include_router(comunidad.router)

@app.get("/")
async def root():
    return {"status": "online", "message": "API de Plataforma MEH funcionando correctamente"}

if __name__ == "__main__":
    import uvicorn
    # Cambiamos a 127.0.0.1 para asegurar compatibilidad en Windows
    print("🚀 Iniciando servidor en http://127.0.0.1:8000")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

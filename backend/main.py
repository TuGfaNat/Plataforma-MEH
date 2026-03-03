from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, eventos, cursos, inscripciones, logs, pagos, comunidad

app = FastAPI(title="Plataforma MEH API")

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    return {"message": "Bienvenido a la API de Plataforma MEH"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

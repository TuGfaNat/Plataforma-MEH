import os
import shutil
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from app.api.auth import get_current_user
from app.models import models

router = APIRouter(prefix="/files", tags=["Archivos"])

# Directorio de subidas real en tu disco
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "static", "uploads")

# Crear la carpeta si no existe
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: models.Usuario = Depends(get_current_user)
):
    """
    Guarda una subida REAL en la carpeta backend/static/uploads/
    """
    # 1. Obtener la extensión original o asignar una por defecto
    filename = file.filename or "upload"
    ext = os.path.splitext(filename)[1].lower()
    if not ext:
        ext = ".png" # Por defecto si el navegador no la envía

    # 2. Crear un nombre único para que no se borren fotos de otros usuarios
    unique_name = f"perfil_{current_user.id_usuario}_{datetime.now().strftime('%H%M%S')}{ext}"
    target_path = os.path.join(UPLOAD_FOLDER, unique_name)

    # 3. Guardar el archivo físicamente
    try:
        with open(target_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al escribir en disco: {str(e)}")

    # 4. Devolver la ruta para que el frontend la guarde en la base de datos
    # Usamos /static/ porque es el "túnel" que configuramos en main.py
    return {
        "status": "success",
        "url": f"/static/uploads/{unique_name}",
        "local_path": target_path
    }

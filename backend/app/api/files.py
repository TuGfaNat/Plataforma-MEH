import os
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import List
import shutil
from datetime import datetime
from app.api.auth import get_current_user
from app.models import models

router = APIRouter(prefix="/files", tags=["Archivos"])

UPLOAD_DIR = "static/uploads"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf", ".csv", ".xlsx"}
MAX_FILE_SIZE = 5 * 1024 * 1024 # 5MB

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: models.Usuario = Depends(get_current_user)
):
    # Validar extensión
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Extensión no permitida. Formatos válidos: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Validar tamaño (FastAPI no lo hace por defecto, hay que leer el spool)
    file.file.seek(0, os.SEEK_END)
    file_size = file.file.tell()
    file.file.seek(0) # Volver al inicio
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="Archivo demasiado grande. Máximo 5MB.")

    # Crear nombre único
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_filename = f"{current_user.id_usuario}_{timestamp}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # Guardar archivo
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"No se pudo guardar el archivo: {str(e)}")

    return {
        "filename": unique_filename,
        "url": f"/static/uploads/{unique_filename}",
        "size": file_size
    }

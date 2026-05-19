import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import models
from .auth import get_current_user
from ..services import certificado_generator_service
from ..core.exceptions import ValidacionNegocioError

router = APIRouter(prefix="/certificados-admin", tags=["certificados_admin"])

UPLOAD_DIR = "static/certificados/assets"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/bulk")
async def generate_bulk(
    tipo: str = Form(...),
    id_referencia: int = Form(...),
    criterio: str = Form(...),
    titulo: str = Form(...),
    background: UploadFile = File(...),
    firma1: Optional[UploadFile] = File(None),
    firma2: Optional[UploadFile] = File(None),
    firma3: Optional[UploadFile] = File(None),
    firma4: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    # Guardar background
    bg_filename = f"bg_{uuid.uuid4()}_{background.filename}"
    bg_path = os.path.join(UPLOAD_DIR, bg_filename)
    with open(bg_path, "wb") as f:
        f.write(await background.read())

    firmas_paths = []
    for f in [firma1, firma2, firma3, firma4]:
        if f:
            f_filename = f"firma_{uuid.uuid4()}_{f.filename}"
            f_path = os.path.join(UPLOAD_DIR, f_filename)
            with open(f_path, "wb") as file_out:
                file_out.write(await f.read())
            firmas_paths.append(f_path)

    return certificado_generator_service.generate_bulk_certificates(
        db=db,
        admin_user=current_user,
        tipo=tipo,
        id_referencia=id_referencia,
        criterio=criterio,
        titulo_certificado=titulo,
        background_path=bg_path,
        firmas_paths=firmas_paths
    )

import pytest
import uuid
from fastapi.testclient import TestClient
from main import app
from app.database import SessionLocal
from app.models import models
from app.core import auth as auth_core

client = TestClient(app)

def test_offline_inscritos_confirmados_endpoint():
    """Valida el endpoint de descarga de inscritos confirmados.
    
    Cubre:
    - Descarga exitosa por parte de un ADMIN/Staff.
    - Rechazo con 403 Forbidden para usuarios sin permisos (MIEMBRO).
    """
    db = SessionLocal()
    try:
        unique_id = uuid.uuid4().hex[:8]
        
        # 1. Crear usuarios
        staff_user = models.Usuario(
            nombres="Admin",
            apellidos="Descarga",
            correo=f"admin_dl_{unique_id}@meh.com",
            password_hash="fake_hash",
            rol="ADMIN"
        )
        miembro_user = models.Usuario(
            nombres="Pedro",
            apellidos="Miembro",
            correo=f"pedro_miembro_{unique_id}@meh.com",
            password_hash="fake_hash",
            rol="MIEMBRO"
        )
        db.add(staff_user)
        db.add(miembro_user)
        db.commit()
        db.refresh(staff_user)
        db.refresh(miembro_user)
        
        # 2. Crear Evento
        evento = models.Evento(
            titulo=f"Taller Offline Test_{unique_id}",
            descripcion="Probando descarga",
            modalidad="PRESENCIAL",
            capacidad_max=100,
            id_organizador=staff_user.id_usuario
        )
        db.add(evento)
        db.commit()
        db.refresh(evento)
        
        # 3. Crear Inscripciones (una CONFIRMADA, otra PENDIENTE)
        ins_confirmada = models.InscripcionEvento(
            id_usuario=miembro_user.id_usuario,
            id_evento=evento.id_evento,
            estado_inscripcion="CONFIRMADA",
            codigo_qr=f"QR_CONFIRMADO_{unique_id}",
            asistio=False
        )
        ins_pendiente = models.InscripcionEvento(
            id_usuario=miembro_user.id_usuario,
            id_evento=evento.id_evento,
            estado_inscripcion="PENDIENTE",
            codigo_qr=f"QR_PENDIENTE_{unique_id}",
            asistio=False
        )
        db.add(ins_confirmada)
        db.add(ins_pendiente)
        db.commit()
        
        # 4. Generar Tokens
        staff_token = auth_core.create_access_token(data={"sub": staff_user.correo, "rol": staff_user.rol})
        miembro_token = auth_core.create_access_token(data={"sub": miembro_user.correo, "rol": miembro_user.rol})
        
        headers_staff = {"Authorization": f"Bearer {staff_token}"}
        headers_miembro = {"Authorization": f"Bearer {miembro_token}"}
        
        # --- TEST 1: Miembro común intenta descargar (Debe fallar 403) ---
        res_miembro = client.get(f"/eventos/{evento.id_evento}/inscritos-confirmados", headers=headers_miembro)
        assert res_miembro.status_code == 403
        assert "No tienes permisos para descargar los inscritos de este evento" in res_miembro.json()["detail"]
        
        # --- TEST 2: Admin/Staff descarga (Debe tener éxito 200) ---
        res_staff = client.get(f"/eventos/{evento.id_evento}/inscritos-confirmados", headers=headers_staff)
        assert res_staff.status_code == 200
        data = res_staff.json()
        
        # Debe listar solo el confirmado
        assert len(data) == 1
        assert data[0]["id_inscripcion"] == ins_confirmada.id_inscripcion
        assert data[0]["codigo_qr"] == ins_confirmada.codigo_qr
        assert data[0]["nombre_completo"] == "Pedro Miembro"
        assert data[0]["asistio"] is False
        
        # Limpieza
        db.delete(ins_confirmada)
        db.delete(ins_pendiente)
        db.delete(evento)
        db.delete(miembro_user)
        db.delete(staff_user)
        db.commit()
        
    finally:
        db.close()

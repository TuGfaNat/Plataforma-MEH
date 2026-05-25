import pytest
import uuid
from fastapi.testclient import TestClient
from main import app
from app.database import SessionLocal
from app.models import models
from app.core import auth as auth_core

client = TestClient(app)

def test_rbac_endpoint_shielding():
    """Valida el blindaje RBAC estricto a nivel de endpoints administrativos.
    
    Cubre:
    - Acceso no autorizado de un MIEMBRO a /reports/dashboard-stats (403 Forbidden).
    - Acceso no autorizado de un MIEMBRO a /logs/ (403 Forbidden).
    - Acceso autorizado de un ADMIN a /reports/dashboard-stats (200 OK).
    - Acceso autorizado de un ADMIN a /logs/ (200 OK).
    """
    db = SessionLocal()
    try:
        unique_id = uuid.uuid4().hex[:8]
        
        # 1. Crear usuario Miembro de prueba
        miembro_user = models.Usuario(
            nombres="Maria",
            apellidos="Estudiante",
            correo=f"maria_stud_{unique_id}@meh.com",
            password_hash="fake_hash",
            rol="MIEMBRO"
        )
        # 2. Crear usuario Admin de prueba
        admin_user = models.Usuario(
            nombres="Carlos",
            apellidos="Administrador",
            correo=f"carlos_admin_{unique_id}@meh.com",
            password_hash="fake_hash",
            rol="ADMIN"
        )
        db.add(miembro_user)
        db.add(admin_user)
        db.commit()
        db.refresh(miembro_user)
        db.refresh(admin_user)
        
        # 3. Generar Tokens de Acceso
        miembro_token = auth_core.create_access_token(data={"sub": miembro_user.correo, "rol": miembro_user.rol})
        admin_token = auth_core.create_access_token(data={"sub": admin_user.correo, "rol": admin_user.rol})
        
        headers_miembro = {"Authorization": f"Bearer {miembro_token}"}
        headers_admin = {"Authorization": f"Bearer {admin_token}"}
        
        # --- TEST 1: MIEMBRO a /reports/dashboard-stats (Bloqueo 403) ---
        res_rep_miembro = client.get("/reports/dashboard-stats", headers=headers_miembro)
        assert res_rep_miembro.status_code == 403
        assert "No tienes privilegios para consultar reportes estratégicos" in res_rep_miembro.json()["detail"]
        
        # --- TEST 2: MIEMBRO a /logs/ (Bloqueo 403) ---
        res_logs_miembro = client.get("/logs/", headers=headers_miembro)
        assert res_logs_miembro.status_code == 403
        assert "No tienes privilegios para consultar la auditoría del sistema" in res_logs_miembro.json()["detail"]
        
        # --- TEST 3: ADMIN a /reports/dashboard-stats (Permitido 200) ---
        res_rep_admin = client.get("/reports/dashboard-stats", headers=headers_admin)
        assert res_rep_admin.status_code == 200
        data_rep = res_rep_admin.json()
        assert "kpis" in data_rep
        assert "total_miembros" in data_rep["kpis"]
        
        # --- TEST 4: ADMIN a /logs/ (Permitido 200) ---
        res_logs_admin = client.get("/logs/", headers=headers_admin)
        assert res_logs_admin.status_code == 200
        assert isinstance(res_logs_admin.json(), list)
        
        # Limpieza de base de datos
        db.delete(miembro_user)
        db.delete(admin_user)
        db.commit()
        
    finally:
        db.close()

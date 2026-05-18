import pytest
from fastapi.testclient import TestClient
from main import app
from app.database import SessionLocal
from app.models import models

client = TestClient(app)

def test_health_endpoint():
    """Prueba que la API general responda y reporte estado"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "smtp_configured" in data

def test_root_endpoint():
    """Prueba la raíz de la API"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_get_eventos_crud_read():
    """
    Verifica que el CRUD de lectura de eventos esté conectado 
    correctamente a la base de datos y retorne un array.
    """
    response = client.get("/eventos/")
    assert response.status_code == 200
    # Debe retornar una lista (vacía o con elementos, pero no un error de DB)
    data = response.json()
    assert isinstance(data, list)

def test_db_connection_direct():
    """Verifica explícitamente que la DB responda a consultas ORM (Lectura CRUD)"""
    db = SessionLocal()
    try:
        # Una consulta simple para validar la conectividad
        usuarios = db.query(models.Usuario).limit(1).all()
        assert isinstance(usuarios, list)
    finally:
        db.close()

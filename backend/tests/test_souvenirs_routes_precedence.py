import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.database import Base, get_db
from app.models import models
from app.api.auth import get_current_user
from main import app

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

def override_get_current_user():
    return models.Usuario(
        id_usuario=1,
        nombres="Admin",
        apellidos="Test",
        correo="admin@test.com",
        rol="ADMIN",
        activo=True,
        id_estado=2
    )

@pytest.fixture(autouse=True)
def setup_database_and_overrides():
    Base.metadata.create_all(bind=engine)
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user
    yield
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)

def test_ventas_route_not_masked_by_id_producto():
    client = TestClient(app)
    
    # GET /souvenirs/ventas must return 200 (not 422 with invalid int for id_producto)
    response = client.get("/souvenirs/ventas")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    assert isinstance(response.json(), list)

def test_single_souvenir_route():
    client = TestClient(app)
    
    db = TestingSessionLocal()
    prod = models.Producto(
        nombre="Polera MEH",
        precio=50.0,
        stock=10,
        id_estado=2
    )
    db.add(prod)
    db.commit()
    db.refresh(prod)
    
    # GET /souvenirs/{id_producto}
    response = client.get(f"/souvenirs/{prod.id_producto}")
    assert response.status_code == 200
    data = response.json()
    assert data["nombre"] == "Polera MEH"
    assert data["id_producto"] == prod.id_producto

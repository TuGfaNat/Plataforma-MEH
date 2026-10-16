import pytest
import uuid
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from unittest.mock import patch
from main import app
from app.database import SessionLocal
from app.models import models
from app.core import auth as auth_core

client = TestClient(app)

def test_idempotencia_inscripcion_y_conflictos_409():
    """Valida:
    1. Inscripción normal a evento gratuito -> 201 Created.
    2. Inscripción repetida con X-Idempotency-Key -> 200/201 Idempotente (sin duplicar, mismo id).
    3. Inscripción repetida sin X-Idempotency-Key -> 409 Conflict ("Ya estás inscrito en este evento").
    4. Inscripción a evento CANCELADO -> 409 Conflict ("El evento ha sido cancelado...").
    """
    db = SessionLocal()
    try:
        unique_id = uuid.uuid4().hex[:8]

        # 1. Crear usuarios
        organizador = models.Usuario(
            nombres="Org",
            apellidos="Sync",
            correo=f"org_sync_{unique_id}@meh.com",
            password_hash="pwd",
            rol="ORGANIZADOR"
        )
        miembro = models.Usuario(
            nombres="Lucas",
            apellidos="Offline",
            correo=f"lucas_offline_{unique_id}@meh.com",
            password_hash="pwd",
            rol="MIEMBRO"
        )
        db.add_all([organizador, miembro])
        db.commit()
        db.refresh(organizador)
        db.refresh(miembro)

        # 2. Crear Evento gratuito
        ahora = datetime.utcnow()
        evento = models.Evento(
            titulo=f"Taller Offline Sync {unique_id}",
            descripcion="Prueba de sincronización offline",
            fecha_inicio=ahora + timedelta(days=2),
            fecha_fin=ahora + timedelta(days=2, hours=3),
            modalidad="PRESENCIAL",
            capacidad_max=20,
            id_organizador=organizador.id_usuario,
            estado="PROGRAMADO"
        )
        db.add(evento)
        db.commit()
        db.refresh(evento)

        token_miembro = auth_core.create_access_token(data={"sub": miembro.correo, "rol": miembro.rol})
        headers = {
            "Authorization": f"Bearer {token_miembro}",
            "X-Idempotency-Key": f"idemp_{unique_id}_123"
        }

        with patch("app.services.email_service.send_email", return_value=True):
            # --- TEST 1: Primera inscripción con clave de idempotencia ---
            res1 = client.post(f"/inscripciones/eventos/{evento.id_evento}", headers=headers)
            assert res1.status_code == 201
            data1 = res1.json()
            assert data1["estado_inscripcion"] == "CONFIRMADA"
            assert data1["codigo_qr"] is not None
            id_inscripcion_original = data1["id_inscripcion"]

            # --- TEST 2: Reintento de sincronización idempotente con la misma clave ---
            res2 = client.post(f"/inscripciones/eventos/{evento.id_evento}", headers=headers)
            assert res2.status_code in [200, 201]
            data2 = res2.json()
            assert data2["id_inscripcion"] == id_inscripcion_original
            assert data2["codigo_qr"] == data1["codigo_qr"]

        # Verificar que en la base de datos solo existe 1 registro (no duplicado)
        total_en_db = db.query(models.InscripcionEvento).filter(
            models.InscripcionEvento.id_usuario == miembro.id_usuario,
            models.InscripcionEvento.id_evento == evento.id_evento,
            models.InscripcionEvento.id_estado != 0
        ).count()
        assert total_en_db == 1

        # --- TEST 3: Intento duplicado sin clave de idempotencia -> 409 Conflict ---
        headers_sin_idempotencia = {"Authorization": f"Bearer {token_miembro}"}
        res3 = client.post(f"/inscripciones/eventos/{evento.id_evento}", headers=headers_sin_idempotencia)
        assert res3.status_code == 409
        assert "Ya estás inscrito en este evento" in res3.json()["detail"]

        # --- TEST 4: Inscripción a evento CANCELADO -> 409 Conflict ---
        evento_cancelado = models.Evento(
            titulo=f"Taller Cancelado {unique_id}",
            descripcion="Cancelado",
            fecha_inicio=ahora + timedelta(days=3),
            fecha_fin=ahora + timedelta(days=3, hours=2),
            modalidad="VIRTUAL",
            capacidad_max=10,
            id_organizador=organizador.id_usuario,
            estado="CANCELADO"
        )
        db.add(evento_cancelado)
        db.commit()
        db.refresh(evento_cancelado)

        res4 = client.post(f"/inscripciones/eventos/{evento_cancelado.id_evento}", headers=headers_sin_idempotencia)
        assert res4.status_code == 409
        assert "cancelado" in res4.json()["detail"].lower()

        # Limpieza
        db.query(models.InscripcionEvento).filter(models.InscripcionEvento.id_evento.in_([evento.id_evento, evento_cancelado.id_evento])).delete(synchronize_session=False)
        db.delete(evento)
        db.delete(evento_cancelado)
        db.delete(miembro)
        db.delete(organizador)
        db.commit()

    finally:
        db.close()

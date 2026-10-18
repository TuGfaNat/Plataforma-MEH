import pytest
import uuid
import io
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from main import app
from app.database import SessionLocal
from app.models import models
from app.core import auth as auth_core

client = TestClient(app)

def test_meh_019_completo_llegadas_badge_impresion():
    db = SessionLocal()
    try:
        uid = uuid.uuid4().hex[:8]

        # 1. Crear usuarios de prueba
        organizador = models.Usuario(
            nombres="Org",
            apellidos="Meh019",
            correo=f"org_019_{uid}@meh.com",
            password_hash="pwd",
            rol="ORGANIZADOR"
        )
        miembro_inscrito = models.Usuario(
            nombres="Ana",
            apellidos="Inscrita",
            correo=f"ana_019_{uid}@meh.com",
            password_hash="pwd",
            rol="MIEMBRO",
            foto_url="/static/uploads/ana.png",
            linkedin_url="https://linkedin.com/in/ana-tech"
        )
        miembro_no_inscrito = models.Usuario(
            nombres="Carlos",
            apellidos="Externo",
            correo=f"carlos_019_{uid}@meh.com",
            password_hash="pwd",
            rol="MIEMBRO"
        )
        db.add_all([organizador, miembro_inscrito, miembro_no_inscrito])
        db.commit()
        db.refresh(organizador)
        db.refresh(miembro_inscrito)
        db.refresh(miembro_no_inscrito)

        token_org = auth_core.create_access_token(data={"sub": organizador.correo, "rol": organizador.rol})
        token_inscrito = auth_core.create_access_token(data={"sub": miembro_inscrito.correo, "rol": miembro_inscrito.rol})
        token_no_inscrito = auth_core.create_access_token(data={"sub": miembro_no_inscrito.correo, "rol": miembro_no_inscrito.rol})

        # 2. Crear Evento
        ahora = datetime.utcnow()
        evento = models.Evento(
            titulo=f"Conferencia MEH 2026 {uid}",
            descripcion="Evento para pruebas de métricas y badge",
            fecha_inicio=ahora + timedelta(days=1),
            fecha_fin=ahora + timedelta(days=1, hours=5),
            modalidad="PRESENCIAL",
            ubicacion="Auditorio MEH Central",
            capacidad_max=50,
            id_organizador=organizador.id_usuario,
            estado="PROGRAMADO"
        )
        db.add(evento)
        db.commit()
        db.refresh(evento)

        # 3. Checkpoints
        cp_entrada = models.Checkpoint(
            id_evento=evento.id_evento,
            nombre_checkpoint="Entrada Principal",
            tipo_checkpoint="ASISTENCIA",
            orden=1,
            activo=True
        )
        cp_taller = models.Checkpoint(
            id_evento=evento.id_evento,
            nombre_checkpoint="Sala de Workshops",
            tipo_checkpoint="CONTROL",
            orden=2,
            activo=True
        )
        db.add_all([cp_entrada, cp_taller])
        db.commit()
        db.refresh(cp_entrada)
        db.refresh(cp_taller)

        # 4. Inscripción confirmada para miembro_inscrito
        inscripcion = models.InscripcionEvento(
            id_usuario=miembro_inscrito.id_usuario,
            id_evento=evento.id_evento,
            estado_inscripcion="CONFIRMADA",
            codigo_qr=f"QR-ANA-{uid}",
            asistio=True,
            fecha_validacion=ahora
        )
        db.add(inscripcion)
        db.commit()
        db.refresh(inscripcion)

        # 5. Escaneos en Checkpoints
        hora_1 = datetime(2026, 10, 20, 9, 15, 0)
        hora_2 = datetime(2026, 10, 20, 10, 30, 0)

        asistencia_1 = models.AsistenciaDetalle(
            id_inscripcion=inscripcion.id_inscripcion,
            id_checkpoint=cp_entrada.id_checkpoint,
            fecha_escaneo=hora_1,
            escaneado_por=organizador.id_usuario
        )
        asistencia_2 = models.AsistenciaDetalle(
            id_inscripcion=inscripcion.id_inscripcion,
            id_checkpoint=cp_taller.id_checkpoint,
            fecha_escaneo=hora_2,
            escaneado_por=organizador.id_usuario
        )
        db.add_all([asistencia_1, asistencia_2])
        db.commit()

        # ======================================================================
        # TEST 1: GET /eventos/{id}/llegadas (Histograma + Checkpoints)
        # ======================================================================
        # Intento de usuario común (no staff) -> 403 Forbidden
        res_llegadas_unauth = client.get(
            f"/eventos/{evento.id_evento}/llegadas",
            headers={"Authorization": f"Bearer {token_no_inscrito}"}
        )
        assert res_llegadas_unauth.status_code == 403

        # Acceso por Organizador -> 200 OK
        res_llegadas = client.get(
            f"/eventos/{evento.id_evento}/llegadas",
            headers={"Authorization": f"Bearer {token_org}"}
        )
        assert res_llegadas.status_code == 200
        llegadas_data = res_llegadas.json()
        assert llegadas_data["id_evento"] == evento.id_evento
        assert llegadas_data["total_inscritos"] >= 1
        assert llegadas_data["total_asistieron"] >= 1
        assert "histograma_horas" in llegadas_data
        assert len(llegadas_data["histograma_horas"]) >= 2
        # Verificar orden y acumulación
        assert llegadas_data["histograma_horas"][0]["hora"] == "09:00"
        assert llegadas_data["histograma_horas"][1]["hora"] == "10:00"
        assert llegadas_data["histograma_horas"][1]["acumulado"] >= llegadas_data["histograma_horas"][0]["acumulado"]

        # Resumen de checkpoints
        assert len(llegadas_data["checkpoints"]) >= 2
        nombres_cps = [c["nombre_checkpoint"] for c in llegadas_data["checkpoints"]]
        assert "Entrada Principal" in nombres_cps
        assert "Sala de Workshops" in nombres_cps

        # ======================================================================
        # TEST 2: GET /eventos/{id}/badge-info (Solo inscritos generan badge)
        # ======================================================================
        # Miembro no inscrito -> 403 Forbidden
        res_badge_no_inscrito = client.get(
            f"/eventos/{evento.id_evento}/badge-info",
            headers={"Authorization": f"Bearer {token_no_inscrito}"}
        )
        assert res_badge_no_inscrito.status_code == 403
        assert "Solo los participantes inscritos" in res_badge_no_inscrito.json()["detail"]

        # Miembro inscrito -> 200 OK con sus datos
        res_badge_inscrito = client.get(
            f"/eventos/{evento.id_evento}/badge-info",
            headers={"Authorization": f"Bearer {token_inscrito}"}
        )
        assert res_badge_inscrito.status_code == 200
        badge_data = res_badge_inscrito.json()
        assert badge_data["id_evento"] == evento.id_evento
        assert badge_data["nombre_completo"] == "Ana Inscrita"
        assert badge_data["codigo_qr"] == f"QR-ANA-{uid}"
        assert badge_data["esta_inscrito"] is True
        assert "¡Ya tengo mi pase para" in badge_data["copy_sugerido"]
        assert badge_data["redes_sociales"]["linkedin"] == "https://linkedin.com/in/ana-tech"

        # Staff previsualizando -> 200 OK
        res_badge_staff = client.get(
            f"/eventos/{evento.id_evento}/badge-info",
            headers={"Authorization": f"Bearer {token_org}"}
        )
        assert res_badge_staff.status_code == 200
        assert res_badge_staff.json()["rol_evento"] == "ORGANIZADOR"

        # ======================================================================
        # TEST 3: POST /eventos/{id}/plantilla-badge (Upload de plantilla admin)
        # ======================================================================
        fake_png = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4"
        
        # Intento de upload por no staff -> 403
        res_upload_unauth = client.post(
            f"/eventos/{evento.id_evento}/plantilla-badge",
            headers={"Authorization": f"Bearer {token_inscrito}"},
            files={"file": ("plantilla.png", fake_png, "image/png")}
        )
        assert res_upload_unauth.status_code == 403

        # Upload por Organizador -> 200 OK
        res_upload = client.post(
            f"/eventos/{evento.id_evento}/plantilla-badge",
            headers={"Authorization": f"Bearer {token_org}"},
            files={"file": ("plantilla.png", fake_png, "image/png")}
        )
        assert res_upload.status_code == 200
        upload_data = res_upload.json()
        assert upload_data["status"] == "success"
        assert "/static/badges/" in upload_data["plantilla_badge_url"]

        # Verificar que el badge-info ahora incluye la plantilla
        res_badge_actualizado = client.get(
            f"/eventos/{evento.id_evento}/badge-info",
            headers={"Authorization": f"Bearer {token_inscrito}"}
        )
        assert res_badge_actualizado.json()["plantilla_badge_url"] == upload_data["plantilla_badge_url"]

        # ======================================================================
        # TEST 4: GET /eventos/{id}/inscritos-confirmados (para ImprimirLista)
        # ======================================================================
        res_confirmados = client.get(
            f"/eventos/{evento.id_evento}/inscritos-confirmados",
            headers={"Authorization": f"Bearer {token_org}"}
        )
        assert res_confirmados.status_code == 200
        confirmados = res_confirmados.json()
        assert len(confirmados) >= 1
        ana_record = next(c for c in confirmados if c["id_inscripcion"] == inscripcion.id_inscripcion)
        assert ana_record["codigo_qr"] == f"QR-ANA-{uid}"
        assert ana_record["nombre_completo"] == "Ana Inscrita"
        assert ana_record["correo"] == f"ana_019_{uid}@meh.com"

    finally:
        db.close()

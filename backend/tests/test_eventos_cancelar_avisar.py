import pytest
import uuid
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from main import app
from app.database import SessionLocal
from app.models import models
from app.core import auth as auth_core

client = TestClient(app)

def test_cancelacion_reprogramacion_y_aviso_inscritos(monkeypatch):
    """Valida el ciclo de vida de cancelación, reprogramación y avisos a inscritos de eventos:
    1. Cancelación mantiene historial, actualiza estado a CANCELADO, guarda motivo, crea anuncio in-app y notifica a todos.
    2. Reprogramación de fecha dispara aviso in-app y correo automático con la nueva fecha.
    3. Endpoint POST /eventos/{id}/avisar emite anuncio y envía correo exclusivamente a inscripciones CONFIRMADA.
    4. Validación de permisos: Roles no autorizados (MIEMBRO) reciben 403 Forbidden.
    5. Validación de negocio: Cancelar sin motivo devuelve 400 Bad Request.
    """
    # Mocks para email_service
    emails_cancelados = []
    emails_reprogramados = []
    emails_avisos = []

    monkeypatch.setattr(
        "app.services.email_service.notify_evento_cancelado",
        lambda email, nombre, titulo_evento, motivo: emails_cancelados.append((email, titulo_evento, motivo)) or True
    )
    monkeypatch.setattr(
        "app.services.email_service.notify_evento_reprogramado",
        lambda email, nombre, titulo_evento, nueva_fecha, nuevo_horario=None: emails_reprogramados.append((email, titulo_evento, nueva_fecha)) or True
    )
    monkeypatch.setattr(
        "app.services.email_service.notify_aviso_evento",
        lambda email, nombre, titulo_evento, titulo_aviso, mensaje: emails_avisos.append((email, titulo_evento, titulo_aviso)) or True
    )

    db = SessionLocal()
    unique_id = uuid.uuid4().hex[:8]
    
    admin_email = f"admin_ev_{unique_id}@meh.com"
    member_email = f"member_ev_{unique_id}@meh.com"
    confirmed_user_email = f"user_conf_{unique_id}@meh.com"
    pending_user_email = f"user_pend_{unique_id}@meh.com"

    try:
        # 1. Crear Administrador, Miembro no autorizado, y dos participantes
        admin_user = models.Usuario(
            nombres="Admin", apellidos="Eventos", correo=admin_email,
            password_hash="fake", rol="ADMIN", activo=True, id_estado=2
        )
        member_user = models.Usuario(
            nombres="Miembro", apellidos="Comun", correo=member_email,
            password_hash="fake", rol="MIEMBRO", activo=True, id_estado=2
        )
        user_conf = models.Usuario(
            nombres="Asistente", apellidos="Confirmado", correo=confirmed_user_email,
            password_hash="fake", rol="MIEMBRO", activo=True, id_estado=2
        )
        user_pend = models.Usuario(
            nombres="Asistente", apellidos="Pendiente", correo=pending_user_email,
            password_hash="fake", rol="MIEMBRO", activo=True, id_estado=2
        )
        db.add_all([admin_user, member_user, user_conf, user_pend])
        db.commit()
        db.refresh(admin_user)
        db.refresh(member_user)
        db.refresh(user_conf)
        db.refresh(user_pend)

        token_admin = auth_core.create_access_token(data={"sub": admin_user.correo, "rol": admin_user.rol})
        token_member = auth_core.create_access_token(data={"sub": member_user.correo, "rol": member_user.rol})

        headers_admin = {"Authorization": f"Bearer {token_admin}"}
        headers_member = {"Authorization": f"Bearer {token_member}"}

        # 2. Crear Evento
        fecha_orig = datetime.utcnow() + timedelta(days=5)
        evento = models.Evento(
            titulo=f"DevFest Conferencia {unique_id}",
            descripcion="Conferencia de desarrollo de software",
            modalidad="PRESENCIAL",
            capacidad_max=100,
            fecha_inicio=fecha_orig,
            hora_inicio="09:00",
            id_organizador=admin_user.id_usuario,
            id_estado=2
        )
        db.add(evento)
        db.commit()
        db.refresh(evento)
        id_ev = evento.id_evento

        # 3. Inscribir usuarios (uno CONFIRMADA y otro PENDIENTE)
        ins_conf = models.InscripcionEvento(
            id_usuario=user_conf.id_usuario,
            id_evento=id_ev,
            estado_inscripcion="CONFIRMADA",
            codigo_qr=f"QR_CONF_{unique_id}",
            id_estado=2
        )
        ins_pend = models.InscripcionEvento(
            id_usuario=user_pend.id_usuario,
            id_evento=id_ev,
            estado_inscripcion="PENDIENTE",
            codigo_qr=f"QR_PEND_{unique_id}",
            id_estado=2
        )
        db.add_all([ins_conf, ins_pend])
        db.commit()

        # -------------------------------------------------------------
        # TEST 1: Seguridad RBAC (403 para usuarios no autorizados)
        # -------------------------------------------------------------
        res_cancel_403 = client.post(f"/eventos/{id_ev}/cancelar", json={"motivo": "Motivo"}, headers=headers_member)
        assert res_cancel_403.status_code == 403

        res_avisar_403 = client.post(f"/eventos/{id_ev}/avisar", json={"titulo": "T", "mensaje": "M"}, headers=headers_member)
        assert res_avisar_403.status_code == 403

        # -------------------------------------------------------------
        # TEST 2: Reprogramación de fecha dispara aviso automático
        # -------------------------------------------------------------
        nueva_fecha = fecha_orig + timedelta(days=7)
        res_update = client.put(
            f"/eventos/{id_ev}",
            json={"fecha_inicio": nueva_fecha.isoformat(), "hora_inicio": "10:30"},
            headers=headers_admin
        )
        assert res_update.status_code == 200

        # Verificar que se creó anuncio in-app de reprogramación
        anuncio_reprog = db.query(models.Anuncio).filter(
            models.Anuncio.id_evento == id_ev,
            models.Anuncio.tipo == "ALERTA"
        ).first()
        assert anuncio_reprog is not None
        assert "Reprogramación" in anuncio_reprog.titulo

        # Verificar que se notificó por correo a los inscritos
        assert len(emails_reprogramados) >= 2
        emails_dest = [item[0] for item in emails_reprogramados]
        assert confirmed_user_email in emails_dest
        assert pending_user_email in emails_dest

        # -------------------------------------------------------------
        # TEST 3: "Avisar inscritos" llega SOLO a inscripciones CONFIRMADA
        # -------------------------------------------------------------
        aviso_payload = {
            "titulo": "Traer identificación oficial",
            "mensaje": "Por disposiciones del campus, se requerirá carnet físico en la puerta.",
            "enviar_email": True
        }
        res_aviso = client.post(f"/eventos/{id_ev}/avisar", json=aviso_payload, headers=headers_admin)
        assert res_aviso.status_code == 200
        data_aviso = res_aviso.json()
        assert data_aviso["destinatarios_notificados"] == 1
        assert data_aviso["emails_enviados"] == 1

        # Verificar que el email llegó a confirmed_user_email y NO a pending_user_email
        avisos_dest = [item[0] for item in emails_avisos]
        assert confirmed_user_email in avisos_dest
        assert pending_user_email not in avisos_dest

        # Verificar auditoría en LogSistema para aviso
        log_aviso = db.query(models.LogSistema).filter(
            models.LogSistema.id_registro_afectado == id_ev,
            models.LogSistema.accion == "AVISAR_INSCRITOS_EVENTO"
        ).first()
        assert log_aviso is not None

        # -------------------------------------------------------------
        # TEST 4: Cancelación de evento con motivo
        # -------------------------------------------------------------
        # Falla sin motivo
        res_cancel_vacio = client.post(f"/eventos/{id_ev}/cancelar", json={"motivo": "   "}, headers=headers_admin)
        assert res_cancel_vacio.status_code == 400

        # Cancelación exitosa
        motivo_cancel = "Inclemencias climáticas y corte general de suministro en el auditorio"
        res_cancel = client.post(f"/eventos/{id_ev}/cancelar", json={"motivo": motivo_cancel}, headers=headers_admin)
        assert res_cancel.status_code == 200
        data_canc = res_cancel.json()
        assert data_canc["estado"] == "CANCELADO"
        assert data_canc["motivo_cancelacion"] == motivo_cancel

        # Verificar en BD que el registro mantiene historial (NO fue borrado físicamente)
        db.expire_all()
        ev_db = db.query(models.Evento).filter(models.Evento.id_evento == id_ev).first()
        assert ev_db is not None
        assert ev_db.estado == "CANCELADO"
        assert ev_db.motivo_cancelacion == motivo_cancel

        # Verificar que la cancelación notificó a todos los inscritos
        assert len(emails_cancelados) >= 2
        canc_dest = [item[0] for item in emails_cancelados]
        assert confirmed_user_email in canc_dest
        assert pending_user_email in canc_dest

        # Verificar auditoría en LogSistema para cancelación
        log_canc = db.query(models.LogSistema).filter(
            models.LogSistema.id_registro_afectado == id_ev,
            models.LogSistema.accion == "CANCELAR_EVENTO"
        ).first()
        assert log_canc is not None

    finally:
        # Limpieza de datos
        try:
            db.query(models.LogSistema).filter(
                models.LogSistema.id_registro_afectado == id_ev
            ).delete(synchronize_session=False)
            db.query(models.Anuncio).filter(
                models.Anuncio.id_evento == id_ev
            ).delete(synchronize_session=False)
            db.query(models.InscripcionEvento).filter(
                models.InscripcionEvento.id_evento == id_ev
            ).delete(synchronize_session=False)
            db.query(models.Checkpoint).filter(
                models.Checkpoint.id_evento == id_ev
            ).delete(synchronize_session=False)
            db.query(models.Evento).filter(
                models.Evento.id_evento == id_ev
            ).delete(synchronize_session=False)
            db.query(models.Usuario).filter(
                models.Usuario.correo.in_([admin_email, member_email, confirmed_user_email, pending_user_email])
            ).delete(synchronize_session=False)
            db.commit()
        except Exception:
            db.rollback()
        finally:
            db.close()

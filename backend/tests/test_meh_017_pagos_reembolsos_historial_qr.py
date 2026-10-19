import pytest
import uuid
from decimal import Decimal
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from main import app
from app.database import SessionLocal
from app.models import models
from app.core import auth as auth_core

client = TestClient(app)

def test_meh_017_completo_pagos_reembolsos_historial_qr():
    db = SessionLocal()
    try:
        uid = uuid.uuid4().hex[:8]

        # 1. Crear usuarios de prueba
        admin = models.Usuario(
            nombres="Admin",
            apellidos="Finanzas",
            correo=f"admin_017_{uid}@meh.com",
            password_hash="pwd",
            rol="ADMIN"
        )
        organizador = models.Usuario(
            nombres="Org",
            apellidos="Eventos",
            correo=f"org_017_{uid}@meh.com",
            password_hash="pwd",
            rol="ORGANIZADOR"
        )
        miembro_1 = models.Usuario(
            nombres="Beatriz",
            apellidos="Pagadora",
            correo=f"beatriz_017_{uid}@meh.com",
            password_hash="pwd",
            rol="MIEMBRO"
        )
        miembro_2 = models.Usuario(
            nombres="Diego",
            apellidos="Otro",
            correo=f"diego_017_{uid}@meh.com",
            password_hash="pwd",
            rol="MIEMBRO"
        )
        db.add_all([admin, organizador, miembro_1, miembro_2])
        db.commit()
        for u in [admin, organizador, miembro_1, miembro_2]:
            db.refresh(u)

        token_admin = auth_core.create_access_token(data={"sub": admin.correo, "rol": admin.rol})
        token_org = auth_core.create_access_token(data={"sub": organizador.correo, "rol": organizador.rol})
        token_m1 = auth_core.create_access_token(data={"sub": miembro_1.correo, "rol": miembro_1.rol})
        token_m2 = auth_core.create_access_token(data={"sub": miembro_2.correo, "rol": miembro_2.rol})

        # 2. Crear Evento
        ahora = datetime.utcnow()
        evento = models.Evento(
            titulo=f"Summit de Pagos MEH {uid}",
            descripcion="Evento para pruebas de MEH-017",
            fecha_inicio=ahora + timedelta(days=2),
            fecha_fin=ahora + timedelta(days=2, hours=4),
            modalidad="PRESENCIAL",
            ubicacion="Pabellón Central",
            capacidad_max=100,
            id_organizador=organizador.id_usuario,
            estado="PROGRAMADO"
        )
        db.add(evento)
        db.commit()
        db.refresh(evento)

        # 3. Inscripción vinculada a miembro_1
        inscripcion = models.InscripcionEvento(
            id_usuario=miembro_1.id_usuario,
            id_evento=evento.id_evento,
            estado_inscripcion="PENDIENTE",
            codigo_qr=f"QR-TICKET-{uid}"
        )
        db.add(inscripcion)
        db.commit()
        db.refresh(inscripcion)

        # ======================================================================
        # TEST 1: QR DE PAGO POR EVENTO CON VALIDACIÓN Y ANTI-DUPLICADO
        # ======================================================================
        fake_png = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4"
        
        # Alta de paquete "Pase General" -> 201 Created
        res_qr1 = client.post(
            f"/eventos/{evento.id_evento}/pagos-qr",
            headers={"Authorization": f"Bearer {token_admin}"},
            data={"nombre_paquete": "Pase General", "monto": 70.0},
            files={"file": ("qr_general.png", fake_png, "image/png")}
        )
        assert res_qr1.status_code == 201
        qr1_data = res_qr1.json()
        assert qr1_data["nombre_paquete"] == "Pase General"
        assert float(qr1_data["monto"]) == 70.0
        id_qr1 = qr1_data["id_qr"]

        # Intento de duplicar nombre -> 400 Bad Request
        res_dup = client.post(
            f"/eventos/{evento.id_evento}/pagos-qr",
            headers={"Authorization": f"Bearer {token_admin}"},
            data={"nombre_paquete": "pase general ", "monto": 80.0},
            files={"file": ("qr2.png", fake_png, "image/png")}
        )
        assert res_dup.status_code == 400
        assert "Ya existe un paquete de pago" in res_dup.json()["detail"]

        # Alta de segundo paquete "Pase VIP" -> 201
        res_qr2 = client.post(
            f"/eventos/{evento.id_evento}/pagos-qr",
            headers={"Authorization": f"Bearer {token_org}"},
            data={"nombre_paquete": "Pase VIP", "monto": 150.0},
            files={"file": ("qr_vip.png", fake_png, "image/png")}
        )
        assert res_qr2.status_code == 201
        id_qr2 = res_qr2.json()["id_qr"]

        # Edición: cambiar monto y nombre de qr1 -> 200 OK
        res_edit = client.put(
            f"/eventos/pagos-qr/{id_qr1}",
            headers={"Authorization": f"Bearer {token_admin}"},
            data={"nombre_paquete": "Pase General Early", "monto": 65.0}
        )
        assert res_edit.status_code == 200
        assert res_edit.json()["nombre_paquete"] == "Pase General Early"
        assert float(res_edit.json()["monto"]) == 65.0

        # Edición con nombre duplicado de qr2 -> 400 Bad Request
        res_edit_dup = client.put(
            f"/eventos/pagos-qr/{id_qr1}",
            headers={"Authorization": f"Bearer {token_admin}"},
            data={"nombre_paquete": "Pase VIP"}
        )
        assert res_edit_dup.status_code == 400
        assert "Ya existe otro paquete" in res_edit_dup.json()["detail"]

        # ======================================================================
        # TEST 2: SUBIDA DE COMPROBANTE Y VALIDACIÓN
        # ======================================================================
        res_subir = client.post(
            "/pagos/upload-comprobante",
            headers={"Authorization": f"Bearer {token_m1}"},
            data={
                "id_referencia": inscripcion.id_inscripcion,
                "tipo_referencia": "EVENTO",
                "monto": 65.0,
                "metodo_pago": "TRANSFERENCIA"
            },
            files={"file": ("comprobante_banco.png", fake_png, "image/png")}
        )
        assert res_subir.status_code == 201
        pago_data = res_subir.json()
        id_pago = pago_data["id_pago"]
        assert pago_data["estado_pago"] == "PENDIENTE"

        # Intento de reembolsar cuando aún está PENDIENTE -> 400 Bad Request
        res_rem_pending = client.post(
            f"/pagos/{id_pago}/reembolsar",
            headers={"Authorization": f"Bearer {token_admin}"},
            json={"motivo": "Canceló a tiempo"}
        )
        assert res_rem_pending.status_code == 400
        assert "Solo se pueden reembolsar pagos en estado APROBADO" in res_rem_pending.json()["detail"]

        # ======================================================================
        # TEST 3: RECHAZO Y REINTENTO CON NUEVO COMPROBANTE VINCULADO
        # ======================================================================
        # Admin rechaza el comprobante con motivo
        res_rechazar = client.put(
            f"/pagos/admin/{id_pago}/validar",
            headers={"Authorization": f"Bearer {token_admin}"},
            json={"estado_pago": "RECHAZADO", "notas_admin": "Imagen ilegible, no se aprecia el monto"}
        )
        assert res_rechazar.status_code == 200
        assert res_rechazar.json()["estado_pago"] == "RECHAZADO"

        # Intento de reintento por otro miembro no dueño -> 403 Forbidden
        res_reintento_unauth = client.post(
            f"/pagos/{id_pago}/reintentar",
            headers={"Authorization": f"Bearer {token_m2}"},
            files={"file": ("comprobante_nuevo.png", fake_png, "image/png")}
        )
        assert res_reintento_unauth.status_code == 403

        # Miembro 1 vuelve a subir comprobante nítido -> 200 OK
        res_reintento = client.post(
            f"/pagos/{id_pago}/reintentar",
            headers={"Authorization": f"Bearer {token_m1}"},
            data={"monto": 65.0, "metodo_pago": "QR_SIMPLE"},
            files={"file": ("comprobante_nitido.png", fake_png, "image/png")}
        )
        assert res_reintento.status_code == 200
        reintento_data = res_reintento.json()
        assert reintento_data["estado_pago"] == "PENDIENTE"
        assert reintento_data["historial_intentos"] is not None
        assert "Imagen ilegible" in reintento_data["historial_intentos"]

        # ======================================================================
        # TEST 4: APROBACIÓN Y POSTERIOR REEMBOLSO MANUAL
        # ======================================================================
        # Admin aprueba el comprobante reintentado
        res_aprobar = client.put(
            f"/pagos/admin/{id_pago}/validar",
            headers={"Authorization": f"Bearer {token_admin}"},
            json={"estado_pago": "APROBADO", "notas_admin": "Comprobante verificado con éxito"}
        )
        assert res_aprobar.status_code == 200
        assert res_aprobar.json()["estado_pago"] == "APROBADO"

        # Verificar que la inscripción quedó CONFIRMADA
        db.expire_all()
        ins_actual = db.query(models.InscripcionEvento).filter(models.InscripcionEvento.id_inscripcion == inscripcion.id_inscripcion).first()
        assert ins_actual.estado_inscripcion == "CONFIRMADA"

        # Miembro intenta reembolsar su propio pago -> 403 Forbidden
        res_rem_miembro = client.post(
            f"/pagos/{id_pago}/reembolsar",
            headers={"Authorization": f"Bearer {token_m1}"},
            json={"motivo": "Quiero mi dinero"}
        )
        assert res_rem_miembro.status_code == 403

        # Admin reembolsa el pago manual con responsable y nota -> 200 OK
        res_reembolso = client.post(
            f"/pagos/{id_pago}/reembolsar",
            headers={"Authorization": f"Bearer {token_admin}"},
            json={"motivo": "Devolución por cruce de horario justificado"}
        )
        assert res_reembolso.status_code == 200
        rem_data = res_reembolso.json()
        assert rem_data["estado_pago"] == "REEMBOLSADO"
        assert rem_data["motivo_reembolso"] == "Devolución por cruce de horario justificado"
        assert rem_data["fecha_reembolso"] is not None

        # Verificar que la inscripción pasó a CANCELADA y el ticket se anuló
        db.expire_all()
        ins_reembolsada = db.query(models.InscripcionEvento).filter(models.InscripcionEvento.id_inscripcion == inscripcion.id_inscripcion).first()
        assert ins_reembolsada.estado_inscripcion == "CANCELADA"
        assert ins_reembolsada.codigo_qr is None

        # Intento de volver a reembolsar un pago ya REEMBOLSADO -> 400 Bad Request
        res_rem_dup = client.post(
            f"/pagos/{id_pago}/reembolsar",
            headers={"Authorization": f"Bearer {token_admin}"},
            json={"motivo": "Segundo reembolso"}
        )
        assert res_rem_dup.status_code == 400
        assert "Solo se pueden reembolsar pagos en estado APROBADO" in res_rem_dup.json()["detail"]

        # ======================================================================
        # TEST 5: TIMELINE / HISTORIAL DE PAGOS
        # ======================================================================
        # Miembro 1 consulta el historial de su pago
        res_historial_m1 = client.get(
            f"/pagos/historial?id_pago={id_pago}",
            headers={"Authorization": f"Bearer {token_m1}"}
        )
        assert res_historial_m1.status_code == 200
        timeline = res_historial_m1.json()
        assert len(timeline) >= 4  # CREACION, RECHAZADO, REINTENTO, APROBADO, REEMBOLSADO
        eventos_timeline = [item["tipo_evento"] for item in timeline]
        assert "CREACION" in eventos_timeline
        assert "RECHAZADO" in eventos_timeline
        assert "REINTENTO" in eventos_timeline
        assert "APROBADO" in eventos_timeline
        assert "REEMBOLSADO" in eventos_timeline

        # Miembro 2 intenta ver historial del pago de Miembro 1 -> 403 Forbidden
        res_historial_unauth = client.get(
            f"/pagos/historial?id_pago={id_pago}",
            headers={"Authorization": f"Bearer {token_m2}"}
        )
        assert res_historial_unauth.status_code == 403

        # Admin consulta el historial global de pagos -> 200 OK
        res_historial_admin = client.get(
            "/pagos/historial",
            headers={"Authorization": f"Bearer {token_admin}"}
        )
        assert res_historial_admin.status_code == 200
        assert len(res_historial_admin.json()) >= 1

    finally:
        import glob
        db.close()
        for f in glob.glob("static/qrs/qr_698_*"):
            try:
                os.remove(f)
            except OSError:
                pass
        for f in glob.glob("static/comprobantes/test_*"):
            try:
                os.remove(f)
            except OSError:
                pass

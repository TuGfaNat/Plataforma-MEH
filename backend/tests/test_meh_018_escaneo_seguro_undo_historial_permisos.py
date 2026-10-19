import pytest
import uuid
from datetime import datetime, timedelta
from app.database import SessionLocal
from app.models import models
from app.services import eventos_service
from app.core import permissions as perms
from app.core.exceptions import ValidacionNegocioError, PermisoDenegadoError, RecursoNoEncontradoError
from app.core import auth as auth_core
from app.schemas.checkpoint import CheckpointPermisoCreate, AsistenciaDeshacerRequest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_checkpoint_permisos_crud_and_enforcement():
    """Valida:
    - Asignación, consulta y revocación de permisos por checkpoint (CRUD).
    - Restricción por operador: si no tiene permiso en checkpoint ajeno, arroja 403 (PermisoDenegadoError).
    - Si tiene permiso en su checkpoint, puede escanear con éxito.
    - Administradores y Organizadores poseen acceso global sin requerir registro explícito.
    """
    db = SessionLocal()
    try:
        uid = uuid.uuid4().hex[:8]

        # 1. Crear Admin
        admin = models.Usuario(
            nombres="Admin",
            apellidos="Global",
            correo=f"admin_{uid}@meh.com",
            password_hash="fake",
            rol=perms.ROLE_ADMIN
        )
        # 2. Crear Organizador
        organizador = models.Usuario(
            nombres="Org",
            apellidos="Lider",
            correo=f"org_{uid}@meh.com",
            password_hash="fake",
            rol=perms.ROLE_ORGANIZADOR
        )
        # 3. Crear Operador Staff (MODERADOR con herencia/acceso para attendance.scan)
        operador_staff = models.Usuario(
            nombres="Operador",
            apellidos="Refrigerio",
            correo=f"op_{uid}@meh.com",
            password_hash="fake",
            rol=perms.ROLE_ORGANIZADOR # O rol con scan
        )
        # 4. Crear Participante
        alumno = models.Usuario(
            nombres="Estudiante",
            apellidos="Test",
            correo=f"alumno_{uid}@meh.com",
            password_hash="fake",
            rol=perms.ROLE_MIEMBRO
        )
        db.add_all([admin, organizador, operador_staff, alumno])
        db.commit()
        for u in [admin, organizador, operador_staff, alumno]:
            db.refresh(u)

        # 5. Crear Evento y dos Checkpoints
        evento = models.Evento(
            titulo=f"Tech Day {uid}",
            modalidad="PRESENCIAL",
            capacidad_max=200,
            id_organizador=admin.id_usuario
        )
        db.add(evento)
        db.commit()
        db.refresh(evento)

        cp_refrigerio = models.Checkpoint(
            id_evento=evento.id_evento,
            nombre_checkpoint="Refrigerio Tarde",
            tipo_checkpoint="COMIDA",
            orden=1
        )
        cp_vip = models.Checkpoint(
            id_evento=evento.id_evento,
            nombre_checkpoint="Sala VIP / Workshop",
            tipo_checkpoint="ACCESO",
            orden=2
        )
        db.add_all([cp_refrigerio, cp_vip])
        db.commit()
        db.refresh(cp_refrigerio)
        db.refresh(cp_vip)

        # 6. Crear Inscripción Confirmada para alumno
        qr_code = f"QR_MEH018_{uid}"
        inscripcion = models.InscripcionEvento(
            id_evento=evento.id_evento,
            id_usuario=alumno.id_usuario,
            estado_inscripcion="CONFIRMADA",
            codigo_qr=qr_code
        )
        db.add(inscripcion)
        db.commit()
        db.refresh(inscripcion)

        # 7. Asignar permiso a operador_staff SOLO para cp_refrigerio
        permiso_payload = CheckpointPermisoCreate(id_usuario=operador_staff.id_usuario, puede_escanear=True)
        permiso_res = eventos_service.asignar_checkpoint_permiso(
            db=db,
            admin_user=admin,
            id_evento=evento.id_evento,
            id_checkpoint=cp_refrigerio.id_checkpoint,
            payload=permiso_payload
        )
        assert permiso_res.id_checkpoint == cp_refrigerio.id_checkpoint
        assert permiso_res.id_usuario == operador_staff.id_usuario
        assert permiso_res.puede_escanear is True

        # 8. Listar permisos del checkpoint
        permisos_list = eventos_service.get_checkpoint_permisos(
            db=db,
            admin_user=admin,
            id_evento=evento.id_evento,
            id_checkpoint=cp_refrigerio.id_checkpoint
        )
        assert len(permisos_list) == 1
        assert permisos_list[0].id_usuario == operador_staff.id_usuario

        # 9. Validar flags de puede_escanear en get_checkpoints para operador_staff
        # Cambiamos temporalmente el rol de operador_staff a MODERADOR (que tiene scan heredado o directo)
        operador_staff.rol = perms.ROLE_MODERADOR
        db.commit()
        # Le damos permiso técnico directo o simulamos rol que requiera validación de checkpoint
        cps_staff = eventos_service.get_checkpoints(db, evento.id_evento, current_user=operador_staff)
        cp_ref_info = next(c for c in cps_staff if c.id_checkpoint == cp_refrigerio.id_checkpoint)
        cp_vip_info = next(c for c in cps_staff if c.id_checkpoint == cp_vip.id_checkpoint)
        assert cp_ref_info.puede_escanear is True
        assert cp_vip_info.puede_escanear is False

        # 10. Intentar escanear en checkpoint ajeno (cp_vip) sin permiso -> 403 PermisoDenegadoError
        with pytest.raises(PermisoDenegadoError) as exc_denied:
            eventos_service.registrar_asistencia_qr(
                db=db,
                staff_user=operador_staff,
                codigo_qr=qr_code,
                id_checkpoint=cp_vip.id_checkpoint
            )
        assert "No tienes permiso asignado" in str(exc_denied.value)

        # 11. Escanear en checkpoint permitido (cp_refrigerio) -> Éxito
        res_scan = eventos_service.registrar_asistencia_qr(
            db=db,
            staff_user=operador_staff,
            codigo_qr=qr_code,
            id_checkpoint=cp_refrigerio.id_checkpoint
        )
        assert res_scan["message"] == "Asistencia registrada con éxito"
        assert res_scan["id_asistencia"] is not None
        assert res_scan["id_checkpoint"] == cp_refrigerio.id_checkpoint

        # 12. Organizador o Admin global puede escanear en cp_vip sin asignación en checkpoint_permisos
        # Creamos segundo participante para probar acceso global
        alumno2 = models.Usuario(
            nombres="Estudiante2",
            apellidos="Test2",
            correo=f"alumno2_{uid}@meh.com",
            password_hash="fake",
            rol=perms.ROLE_MIEMBRO
        )
        db.add(alumno2)
        db.commit()
        db.refresh(alumno2)

        qr_code_2 = f"QR_MEH018_2_{uid}"
        inscripcion2 = models.InscripcionEvento(
            id_evento=evento.id_evento,
            id_usuario=alumno2.id_usuario,
            estado_inscripcion="CONFIRMADA",
            codigo_qr=qr_code_2
        )
        db.add(inscripcion2)
        db.commit()

        res_scan_admin = eventos_service.registrar_asistencia_qr(
            db=db,
            staff_user=organizador,
            codigo_qr=qr_code_2,
            id_checkpoint=cp_vip.id_checkpoint
        )
        assert res_scan_admin["message"] == "Asistencia registrada con éxito"
        assert res_scan_admin["id_checkpoint"] == cp_vip.id_checkpoint

        # 13. Revocar permiso del operador_staff
        revoc_res = eventos_service.revocar_checkpoint_permiso(
            db=db,
            admin_user=admin,
            id_evento=evento.id_evento,
            id_checkpoint=cp_refrigerio.id_checkpoint,
            id_usuario=operador_staff.id_usuario
        )
        assert revoc_res["status"] == "success"

        permisos_after = eventos_service.get_checkpoint_permisos(
            db=db,
            admin_user=admin,
            id_evento=evento.id_evento,
            id_checkpoint=cp_refrigerio.id_checkpoint
        )
        assert len(permisos_after) == 0

    finally:
        db.close()


def test_undo_asistencia_ventana_30s_and_admin_unlimited():
    """Valida:
    - Undo exitoso dentro de la ventana de 30 segundos.
    - Auditoría generada en logs_auditoria.
    - Anti-duplicado intacto: tras deshacer, el miembro puede volver a ser escaneado.
    - Expiración de ventana a los 30s para operadores staff no-admin.
    - Administrador sin límite de tiempo (puede deshacer pasados los 30s).
    """
    db = SessionLocal()
    try:
        uid = uuid.uuid4().hex[:8]

        admin = models.Usuario(
            nombres="Admin",
            apellidos="Master",
            correo=f"admin_undo_{uid}@meh.com",
            password_hash="fake",
            rol=perms.ROLE_ADMIN
        )
        staff = models.Usuario(
            nombres="Staff",
            apellidos="Operator",
            correo=f"staff_undo_{uid}@meh.com",
            password_hash="fake",
            rol=perms.ROLE_ORGANIZADOR
        )
        otro_staff = models.Usuario(
            nombres="Otro",
            apellidos="Staff",
            correo=f"otro_staff_{uid}@meh.com",
            password_hash="fake",
            rol=perms.ROLE_ORGANIZADOR
        )
        alumno = models.Usuario(
            nombres="Carlos",
            apellidos="Gomez",
            correo=f"carlos_{uid}@meh.com",
            password_hash="fake",
            rol=perms.ROLE_MIEMBRO
        )
        db.add_all([admin, staff, otro_staff, alumno])
        db.commit()
        for u in [admin, staff, otro_staff, alumno]:
            db.refresh(u)

        evento = models.Evento(
            titulo=f"Simposio Undo {uid}",
            modalidad="PRESENCIAL",
            capacidad_max=100,
            id_organizador=admin.id_usuario
        )
        db.add(evento)
        db.commit()
        db.refresh(evento)

        cp = models.Checkpoint(
            id_evento=evento.id_evento,
            nombre_checkpoint="Acceso Auditorio",
            tipo_checkpoint="ASISTENCIA",
            orden=1
        )
        db.add(cp)
        db.commit()
        db.refresh(cp)

        qr_code = f"QR_UNDO_{uid}"
        inscripcion = models.InscripcionEvento(
            id_evento=evento.id_evento,
            id_usuario=alumno.id_usuario,
            estado_inscripcion="CONFIRMADA",
            codigo_qr=qr_code
        )
        db.add(inscripcion)
        db.commit()
        db.refresh(inscripcion)

        # 1. Escaneo por parte de staff
        scan_res = eventos_service.registrar_asistencia_qr(
            db=db,
            staff_user=staff,
            codigo_qr=qr_code,
            id_checkpoint=cp.id_checkpoint
        )
        id_asistencia = scan_res["id_asistencia"]
        assert id_asistencia is not None

        # Verificar que el participante está marcado como asistido
        db.refresh(inscripcion)
        assert inscripcion.asistio is True

        # 2. Doble escaneo inmediato debe fallar (anti-duplicado)
        with pytest.raises(ValidacionNegocioError) as exc_dup:
            eventos_service.registrar_asistencia_qr(
                db=db,
                staff_user=staff,
                codigo_qr=qr_code,
                id_checkpoint=cp.id_checkpoint
            )
        assert "Ya se registró asistencia en el checkpoint" in str(exc_dup.value)

        # 3. Deshacer el escaneo dentro de los 30 segundos
        undo_payload = AsistenciaDeshacerRequest(
            id_asistencia=id_asistencia,
            motivo="Escaneo por error de prueba"
        )
        undo_res = eventos_service.deshacer_asistencia_qr(
            db=db,
            current_user=staff,
            payload=undo_payload,
            ip_address="127.0.0.1"
        )
        assert undo_res["status"] == "success"
        assert undo_res["asistio_general"] is False

        # Verificar que el registro AsistenciaDetalle fue eliminado
        det_db = db.query(models.AsistenciaDetalle).filter(
            models.AsistenciaDetalle.id_asistencia == id_asistencia
        ).first()
        assert det_db is None

        db.refresh(inscripcion)
        assert inscripcion.asistio is False

        # 4. Anti-duplicado intacto: ahora se puede volver a escanear exitosamente
        res_rescan = eventos_service.registrar_asistencia_qr(
            db=db,
            staff_user=staff,
            codigo_qr=qr_code,
            id_checkpoint=cp.id_checkpoint
        )
        assert res_rescan["message"] == "Asistencia registrada con éxito"
        nuevo_id_asistencia = res_rescan["id_asistencia"]

        # 5. Simular expiración de la ventana de 30 segundos (> 30s)
        detalle_existente = db.query(models.AsistenciaDetalle).filter(
            models.AsistenciaDetalle.id_asistencia == nuevo_id_asistencia
        ).first()
        assert detalle_existente is not None
        # Retrasamos la fecha de escaneo en 45 segundos
        detalle_existente.fecha_escaneo = datetime.utcnow() - timedelta(seconds=45)
        db.commit()

        # Operador staff (no admin) intenta deshacer después de 45 segundos -> Falla por expiración
        undo_exp_payload = AsistenciaDeshacerRequest(id_asistencia=nuevo_id_asistencia)
        with pytest.raises(ValidacionNegocioError) as exc_exp:
            eventos_service.deshacer_asistencia_qr(
                db=db,
                current_user=staff,
                payload=undo_exp_payload
            )
        assert "ventana de 30 segundos para deshacer ha expirado" in str(exc_exp.value)

        # 6. Admin sin límite: el administrador puede deshacer incluso tras 45s (sin restricción)
        undo_admin_res = eventos_service.deshacer_asistencia_qr(
            db=db,
            current_user=admin,
            payload=undo_exp_payload,
            ip_address="127.0.0.1"
        )
        assert undo_admin_res["status"] == "success"

        # Verificar auditoría registrada
        log_entry = db.query(models.LogSistema).filter(
            models.LogSistema.accion == "DESHACER_ASISTENCIA",
            models.LogSistema.id_admin == admin.id_usuario
        ).order_by(models.LogSistema.id_log.desc()).first()
        assert log_entry is not None
        assert "Acceso Auditorio" in str(log_entry.valor_anterior)

    finally:
        db.close()


def test_historial_asistencia_paginado_y_filtros():
    """Valida:
    - Consulta paginada de asistencia con conteo y páginas.
    - Filtro por checkpoint.
    - Filtro de búsqueda por nombre o correo.
    - Indicador `puede_deshacer` adaptativo (admin vs staff).
    """
    db = SessionLocal()
    try:
        uid = uuid.uuid4().hex[:8]

        admin = models.Usuario(
            nombres="Super",
            apellidos="Admin",
            correo=f"admin_hist_{uid}@meh.com",
            password_hash="fake",
            rol=perms.ROLE_ADMIN
        )
        staff = models.Usuario(
            nombres="Staff",
            apellidos="Escaneo",
            correo=f"staff_hist_{uid}@meh.com",
            password_hash="fake",
            rol=perms.ROLE_ORGANIZADOR
        )
        alumno_a = models.Usuario(
            nombres="Alice",
            apellidos="Wonderland",
            correo=f"alice_{uid}@meh.com",
            password_hash="fake",
            rol=perms.ROLE_MIEMBRO
        )
        alumno_b = models.Usuario(
            nombres="Bob",
            apellidos="Builder",
            correo=f"bob_{uid}@meh.com",
            password_hash="fake",
            rol=perms.ROLE_MIEMBRO
        )
        db.add_all([admin, staff, alumno_a, alumno_b])
        db.commit()
        for u in [admin, staff, alumno_a, alumno_b]:
            db.refresh(u)

        evento = models.Evento(
            titulo=f"Conferencia Historial {uid}",
            modalidad="PRESENCIAL",
            capacidad_max=50,
            id_organizador=admin.id_usuario
        )
        db.add(evento)
        db.commit()
        db.refresh(evento)

        cp1 = models.Checkpoint(id_evento=evento.id_evento, nombre_checkpoint="Punto A", orden=1)
        cp2 = models.Checkpoint(id_evento=evento.id_evento, nombre_checkpoint="Punto B", orden=2)
        db.add_all([cp1, cp2])
        db.commit()
        db.refresh(cp1)
        db.refresh(cp2)

        # Crear inscripciones
        insc_a = models.InscripcionEvento(
            id_evento=evento.id_evento,
            id_usuario=alumno_a.id_usuario,
            estado_inscripcion="CONFIRMADA",
            codigo_qr=f"QR_A_{uid}"
        )
        insc_b = models.InscripcionEvento(
            id_evento=evento.id_evento,
            id_usuario=alumno_b.id_usuario,
            estado_inscripcion="CONFIRMADA",
            codigo_qr=f"QR_B_{uid}"
        )
        db.add_all([insc_a, insc_b])
        db.commit()
        db.refresh(insc_a)
        db.refresh(insc_b)

        # Escanear Alice en CP1 y CP2
        eventos_service.registrar_asistencia_qr(db, staff, insc_a.codigo_qr, id_checkpoint=cp1.id_checkpoint)
        eventos_service.registrar_asistencia_qr(db, staff, insc_a.codigo_qr, id_checkpoint=cp2.id_checkpoint)

        # Escanear Bob solo en CP1
        eventos_service.registrar_asistencia_qr(db, staff, insc_b.codigo_qr, id_checkpoint=cp1.id_checkpoint)

        # 1. Consultar historial total del evento
        hist_total = eventos_service.get_historial_asistencia_paginado(
            db=db,
            current_user=admin,
            id_evento=evento.id_evento,
            page=1,
            limit=10
        )
        assert hist_total["total"] == 3
        assert len(hist_total["items"]) == 3
        assert hist_total["total_pages"] == 1

        # Verificar que el admin tiene puede_deshacer = True
        for item in hist_total["items"]:
            assert item["puede_deshacer"] is True
            assert "usuario" in item
            assert "checkpoint" in item
            assert "operador" in item

        # 2. Filtrar por checkpoint CP2
        hist_cp2 = eventos_service.get_historial_asistencia_paginado(
            db=db,
            current_user=admin,
            id_evento=evento.id_evento,
            id_checkpoint=cp2.id_checkpoint
        )
        assert hist_cp2["total"] == 1
        assert hist_cp2["items"][0]["usuario"]["nombre_completo"] == "Alice Wonderland"
        assert hist_cp2["items"][0]["checkpoint"]["nombre_checkpoint"] == "Punto B"

        # 3. Filtrar por término de búsqueda (Bob)
        hist_search_bob = eventos_service.get_historial_asistencia_paginado(
            db=db,
            current_user=admin,
            id_evento=evento.id_evento,
            search="Builder"
        )
        assert hist_search_bob["total"] == 1
        assert hist_search_bob["items"][0]["usuario"]["nombre_completo"] == "Bob Builder"

        # 4. Paginación con limit = 2
        hist_pag1 = eventos_service.get_historial_asistencia_paginado(
            db=db,
            current_user=admin,
            id_evento=evento.id_evento,
            page=1,
            limit=2
        )
        assert len(hist_pag1["items"]) == 2
        assert hist_pag1["total"] == 3
        assert hist_pag1["total_pages"] == 2

        hist_pag2 = eventos_service.get_historial_asistencia_paginado(
            db=db,
            current_user=admin,
            id_evento=evento.id_evento,
            page=2,
            limit=2
        )
        assert len(hist_pag2["items"]) == 1

    finally:
        db.close()


def test_http_api_endpoints_meh_018():
    """Valida los endpoints HTTP vía FastAPI TestClient:
    - POST /asistencia/deshacer
    - GET /eventos/{id}/historial-asistencia
    - GET /eventos/{id}/checkpoints/{id}/permisos
    - POST /eventos/{id}/checkpoints/{id}/permisos
    - DELETE /eventos/{id}/checkpoints/{id}/permisos/{id_usuario}
    """
    db = SessionLocal()
    try:
        uid = uuid.uuid4().hex[:8]

        admin = models.Usuario(
            nombres="AdminHTTP",
            apellidos="Test",
            correo=f"admin_http_{uid}@meh.com",
            password_hash="fake",
            rol=perms.ROLE_ADMIN
        )
        staff = models.Usuario(
            nombres="StaffHTTP",
            apellidos="Test",
            correo=f"staff_http_{uid}@meh.com",
            password_hash="fake",
            rol=perms.ROLE_ORGANIZADOR
        )
        alumno = models.Usuario(
            nombres="AlumnoHTTP",
            apellidos="Test",
            correo=f"alumno_http_{uid}@meh.com",
            password_hash="fake",
            rol=perms.ROLE_MIEMBRO
        )
        db.add_all([admin, staff, alumno])
        db.commit()
        for u in [admin, staff, alumno]:
            db.refresh(u)

        token_admin = auth_core.create_access_token(data={"sub": admin.correo, "rol": admin.rol})
        headers_admin = {"Authorization": f"Bearer {token_admin}"}

        token_staff = auth_core.create_access_token(data={"sub": staff.correo, "rol": staff.rol})
        headers_staff = {"Authorization": f"Bearer {token_staff}"}

        evento = models.Evento(
            titulo=f"HTTP Event {uid}",
            modalidad="PRESENCIAL",
            capacidad_max=50,
            id_organizador=admin.id_usuario
        )
        db.add(evento)
        db.commit()
        db.refresh(evento)

        cp = models.Checkpoint(id_evento=evento.id_evento, nombre_checkpoint="Entrada HTTP", orden=1)
        db.add(cp)
        db.commit()
        db.refresh(cp)

        qr_code = f"QR_HTTP_{uid}"
        inscripcion = models.InscripcionEvento(
            id_evento=evento.id_evento,
            id_usuario=alumno.id_usuario,
            estado_inscripcion="CONFIRMADA",
            codigo_qr=qr_code
        )
        db.add(inscripcion)
        db.commit()

        # 1. POST /eventos/{id}/checkpoints/{id}/permisos (Asignar)
        res_assign = client.post(
            f"/eventos/{evento.id_evento}/checkpoints/{cp.id_checkpoint}/permisos",
            json={"id_usuario": staff.id_usuario, "puede_escanear": True},
            headers=headers_admin
        )
        assert res_assign.status_code == 200
        assert res_assign.json()["id_usuario"] == staff.id_usuario

        # 2. GET /eventos/{id}/checkpoints/{id}/permisos (Listar)
        res_list = client.get(
            f"/eventos/{evento.id_evento}/checkpoints/{cp.id_checkpoint}/permisos",
            headers=headers_admin
        )
        assert res_list.status_code == 200
        permisos_data = res_list.json()
        assert len(permisos_data) >= 1
        assert permisos_data[0]["usuario"]["correo"] == staff.correo

        # 3. Escaneo exitoso
        res_scan = client.post(
            "/eventos/asistencia-qr",
            json={"codigo_qr": qr_code, "id_checkpoint": cp.id_checkpoint},
            headers=headers_staff
        )
        assert res_scan.status_code == 200
        scan_data = res_scan.json()
        assert scan_data["id_asistencia"] is not None

        # 4. GET /eventos/{id}/historial-asistencia
        res_hist = client.get(
            f"/eventos/{evento.id_evento}/historial-asistencia?page=1&limit=10",
            headers=headers_staff
        )
        assert res_hist.status_code == 200
        hist_data = res_hist.json()
        assert hist_data["total"] >= 1
        assert hist_data["items"][0]["checkpoint"]["nombre_checkpoint"] == "Entrada HTTP"

        # 5. POST /asistencia/deshacer
        res_undo = client.post(
            "/asistencia/deshacer",
            json={"id_asistencia": scan_data["id_asistencia"], "motivo": "Prueba HTTP Undo"},
            headers=headers_staff
        )
        assert res_undo.status_code == 200
        undo_data = res_undo.json()
        assert undo_data["status"] == "success"
        assert undo_data["asistio_general"] is False

        # 6. DELETE /eventos/{id}/checkpoints/{id}/permisos/{id_usuario}
        res_del = client.delete(
            f"/eventos/{evento.id_evento}/checkpoints/{cp.id_checkpoint}/permisos/{staff.id_usuario}",
            headers=headers_admin
        )
        assert res_del.status_code == 204

    finally:
        db.close()

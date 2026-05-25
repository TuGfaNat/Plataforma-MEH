import pytest
import uuid
from datetime import datetime
from app.database import SessionLocal
from app.models import models
from app.services import eventos_service
from app.core import permissions as perms
from app.core.exceptions import ValidacionNegocioError, PermisoDenegadoError

def test_checkpoint_attendance_lifecycle():
    """Valida el ciclo de vida completo de escaneo de asistencia por checkpoints.
    
    Cubre:
    - Entrada General (id_checkpoint = None).
    - Prevención de doble escaneo general.
    - Registro secuencial en checkpoint (e.g., Refrigerio).
    - Prevención de doble escaneo en el mismo checkpoint.
    - Validación de pertenencia del checkpoint al evento correspondiente.
    """
    db = SessionLocal()
    try:
        unique_id = uuid.uuid4().hex[:8]
        
        # 1. Crear un administrador para simular el staff que escanea
        staff_user = models.Usuario(
            nombres="Staff",
            apellidos="Escaneador",
            correo=f"staff_scan_{unique_id}@meh.com",
            password_hash="fake_hash",
            rol="ADMIN"
        )
        db.add(staff_user)
        db.commit()
        db.refresh(staff_user)
        
        # 2. Crear un Miembro
        alumno_user = models.Usuario(
            nombres="Juan",
            apellidos="Choque",
            correo=f"juan_choque_{unique_id}@meh.com",
            password_hash="fake_hash",
            rol="MIEMBRO"
        )
        db.add(alumno_user)
        db.commit()
        db.refresh(alumno_user)
        
        # 3. Crear dos Eventos
        evento_a = models.Evento(
            titulo=f"Congreso de Ingenieria A_{unique_id}",
            descripcion="Evento A",
            modalidad="PRESENCIAL",
            capacidad_max=500,
            id_organizador=staff_user.id_usuario
        )
        evento_b = models.Evento(
            titulo=f"Taller Rust B_{unique_id}",
            descripcion="Evento B",
            modalidad="PRESENCIAL",
            capacidad_max=50,
            id_organizador=staff_user.id_usuario
        )
        db.add(evento_a)
        db.add(evento_b)
        db.commit()
        db.refresh(evento_a)
        db.refresh(evento_b)
        
        # 4. Crear Checkpoint para Evento A (Refrigerio) y Evento B (Entrada B)
        checkpoint_refrigerio = models.Checkpoint(
            id_evento=evento_a.id_evento,
            nombre_checkpoint="Refrigerio Mediodia",
            tipo_checkpoint="REFRIGERIO",
            orden=1,
            activo=True
        )
        checkpoint_otro_evento = models.Checkpoint(
            id_evento=evento_b.id_evento,
            nombre_checkpoint="Entrada Taller Rust",
            tipo_checkpoint="ASISTENCIA",
            orden=1,
            activo=True
        )
        db.add(checkpoint_refrigerio)
        db.add(checkpoint_otro_evento)
        db.commit()
        db.refresh(checkpoint_refrigerio)
        db.refresh(checkpoint_otro_evento)
        
        # 5. Registrar al miembro en el Evento A (Pago Aprobado -> Inscripcion CONFIRMADA)
        inscripcion = models.InscripcionEvento(
            id_usuario=alumno_user.id_usuario,
            id_evento=evento_a.id_evento,
            estado_inscripcion="CONFIRMADA",
            codigo_qr=f"TICKET_QR_{unique_id}",
            asistio=False
        )
        db.add(inscripcion)
        db.commit()
        db.refresh(inscripcion)
        
        # --- CASO DE PRUEBA 1: Entrada General (id_checkpoint = None) ---
        res_general = eventos_service.registrar_asistencia_qr(
            db=db,
            staff_user=staff_user,
            codigo_qr=inscripcion.codigo_qr,
            id_checkpoint=None
        )
        assert res_general["message"] == "Asistencia registrada con éxito"
        assert res_general["usuario"]["nombre"] == "Juan Choque"
        assert res_general["evento"]["titulo"] == evento_a.titulo
        
        # Recargar inscripcion y validar
        db.refresh(inscripcion)
        assert inscripcion.asistio is True
        assert inscripcion.fecha_validacion is not None
        
        # --- CASO DE PRUEBA 2: Doble Escaneo en Entrada General (id_checkpoint = None) ---
        with pytest.raises(ValidacionNegocioError) as excinfo:
            eventos_service.registrar_asistencia_qr(
                db=db,
                staff_user=staff_user,
                codigo_qr=inscripcion.codigo_qr,
                id_checkpoint=None
            )
        assert "Esta entrada ya fue escaneada anteriormente" in str(excinfo.value)
        
        # --- CASO DE PRUEBA 3: Registrar Asistencia en Checkpoint (Refrigerio) ---
        # Note: inscripcion.asistio is already True. This should pass because checkpoints bypass general double scan checks.
        res_checkpoint = eventos_service.registrar_asistencia_qr(
            db=db,
            staff_user=staff_user,
            codigo_qr=inscripcion.codigo_qr,
            id_checkpoint=checkpoint_refrigerio.id_checkpoint
        )
        assert res_checkpoint["message"] == "Asistencia registrada con éxito"
        assert res_checkpoint["usuario"]["nombre"] == "Juan Choque"
        # Debe contener la concatenación premium del checkpoint
        assert "Checkpoint: Refrigerio Mediodia" in res_checkpoint["evento"]["titulo"]
        
        # Verificar que se insertó el registro de detalle físico
        detalle = db.query(models.AsistenciaDetalle).filter(
            models.AsistenciaDetalle.id_inscripcion == inscripcion.id_inscripcion,
            models.AsistenciaDetalle.id_checkpoint == checkpoint_refrigerio.id_checkpoint
        ).first()
        assert _is_valid_detalle(detalle, checkpoint_refrigerio.id_checkpoint, staff_user.id_usuario)
        
        # --- CASO DE PRUEBA 4: Doble Escaneo en el Mismo Checkpoint ---
        with pytest.raises(ValidacionNegocioError) as excinfo_double_cp:
            eventos_service.registrar_asistencia_qr(
                db=db,
                staff_user=staff_user,
                codigo_qr=inscripcion.codigo_qr,
                id_checkpoint=checkpoint_refrigerio.id_checkpoint
            )
        assert f"Ya se registró asistencia en el checkpoint '{checkpoint_refrigerio.nombre_checkpoint}'" in str(excinfo_double_cp.value)
        
        # --- CASO DE PRUEBA 5: Intentar escanear checkpoint de otro evento ---
        with pytest.raises(ValidacionNegocioError) as excinfo_wrong_cp:
            eventos_service.registrar_asistencia_qr(
                db=db,
                staff_user=staff_user,
                codigo_qr=inscripcion.codigo_qr,
                id_checkpoint=checkpoint_otro_evento.id_checkpoint
            )
        assert "El checkpoint seleccionado no pertenece a este evento" in str(excinfo_wrong_cp.value)

        # --- CASO DE PRUEBA 6: Escaneo Directo a Checkpoint sin Entrada Previa ---
        # Creamos otra inscripcion fresca para probar que escanear un checkpoint directo marca asistio = True automáticamente.
        unique_id_2 = uuid.uuid4().hex[:8]
        alumno_user_2 = models.Usuario(
            nombres="Maria",
            apellidos="Gomez",
            correo=f"maria_gomez_{unique_id_2}@meh.com",
            password_hash="fake_hash",
            rol="MIEMBRO"
        )
        db.add(alumno_user_2)
        db.commit()
        db.refresh(alumno_user_2)
        
        inscripcion_2 = models.InscripcionEvento(
            id_usuario=alumno_user_2.id_usuario,
            id_evento=evento_a.id_evento,
            estado_inscripcion="CONFIRMADA",
            codigo_qr=f"TICKET_QR_2_{unique_id_2}",
            asistio=False
        )
        db.add(inscripcion_2)
        db.commit()
        db.refresh(inscripcion_2)
        
        # Escaneamos refrigerio directamente (asistio es False)
        res_cp_direct = eventos_service.registrar_asistencia_qr(
            db=db,
            staff_user=staff_user,
            codigo_qr=inscripcion_2.codigo_qr,
            id_checkpoint=checkpoint_refrigerio.id_checkpoint
        )
        assert res_cp_direct["message"] == "Asistencia registrada con éxito"
        
        db.refresh(inscripcion_2)
        # Debe marcarse como asistido automáticamente
        assert inscripcion_2.asistio is True
        assert inscripcion_2.fecha_validacion is not None
        
        # Limpieza de registros de prueba
        db.delete(detalle)
        # Detalle de inscripcion 2
        detalle_2 = db.query(models.AsistenciaDetalle).filter(
            models.AsistenciaDetalle.id_inscripcion == inscripcion_2.id_inscripcion
        ).first()
        if detalle_2:
            db.delete(detalle_2)
            
        db.delete(inscripcion)
        db.delete(inscripcion_2)
        db.delete(checkpoint_refrigerio)
        db.delete(checkpoint_otro_evento)
        db.delete(evento_a)
        db.delete(evento_b)
        db.delete(alumno_user)
        db.delete(alumno_user_2)
        db.delete(staff_user)
        db.commit()
        
    finally:
        db.close()

def _is_valid_detalle(detalle, checkpoint_id, staff_id):
    return (
        detalle is not None and 
        detalle.id_checkpoint == checkpoint_id and 
        detalle.escaneado_por == staff_id
    )

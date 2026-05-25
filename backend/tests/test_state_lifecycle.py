import pytest
import uuid
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import models
from app.core.context import current_user_id

def test_state_lifecycle_and_papelera():
    """Valida la creación por defecto en activo (2), el soft-delete a eliminado (0),

    el filtro transparente en consultas comunes, y la gestión de la Papelera.
    """
    db = SessionLocal()
    try:
        unique_id = uuid.uuid4().hex[:8]
        
        # 1. Crear un usuario administrador de prueba
        admin_user = models.Usuario(
            nombres="Admin",
            apellidos="Papelera",
            correo=f"admin_papelera_{unique_id}@meh.com",
            password_hash="fake_hash",
            rol="ADMIN"
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        # Guardar ID en contextvars para el AuditMixin
        token = current_user_id.set(admin_user.id_usuario)
        
        try:
            # 2. Crear un Evento. Debe crearse por defecto con id_estado = 2 (ACTIVO)
            evento = models.Evento(
                titulo=f"Evento Papelera {unique_id}",
                descripcion="Probando el ciclo de vida del estado",
                modalidad="VIRTUAL",
                capacidad_max=100,
                id_organizador=admin_user.id_usuario
            )
            db.add(evento)
            db.commit()
            db.refresh(evento)
            
            # Verificar estado por defecto
            assert evento.id_estado == 2
            
            # 3. Comprobar que aparece en búsquedas comunes
            eventos_activos = db.query(models.Evento).filter(models.Evento.titulo == evento.titulo).all()
            assert len(eventos_activos) == 1
            
            # 4. Soft-delete: Establecer id_estado = 0 (ELIMINADO)
            evento.id_estado = 0
            db.commit()
            db.refresh(evento)
            
            # La fecha_modificacion_estado se debe haber establecido automáticamente por el event listener
            assert evento.fecha_modificacion_estado is not None
            
            # 5. Comprobar que ya NO aparece en búsquedas comunes debido al interceptor before_compile
            eventos_activos_despues = db.query(models.Evento).filter(models.Evento.titulo == evento.titulo).all()
            assert len(eventos_activos_despues) == 0
            
            # 6. Comprobar que sí se puede encontrar habilitando explicitamente include_deleted=True
            evento_recuperado = db.query(models.Evento).execution_options(include_deleted=True).filter(
                models.Evento.id_evento == evento.id_evento
            ).first()
            assert evento_recuperado is not None
            assert evento_recuperado.id_estado == 0
            
            # 7. Restaurar: Establecer id_estado = 2 (ACTIVO)
            evento_recuperado.id_estado = 2
            db.commit()
            db.refresh(evento_recuperado)
            
            # 8. Comprobar que vuelve a aparecer en búsquedas comunes
            eventos_activos_restaurados = db.query(models.Evento).filter(models.Evento.titulo == evento.titulo).all()
            assert len(eventos_activos_restaurados) == 1
            
            # 9. Soft-delete definitivo y purga física
            evento_recuperado.id_estado = 0
            db.commit()
            
            # Purgar físicamente
            db.delete(evento_recuperado)
            db.commit()
            
            # Verificar que desapareció por completo
            evento_purgado = db.query(models.Evento).execution_options(include_deleted=True).filter(
                models.Evento.id_evento == evento.id_evento
            ).first()
            assert evento_purgado is None
            
        finally:
            current_user_id.reset(token)
            # Limpiar admin
            db.delete(admin_user)
            db.commit()
            
    finally:
        db.close()

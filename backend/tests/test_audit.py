import pytest
import uuid
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import models
from app.core.context import current_user_id

def test_audit_mixin_insert_update():
    """Valida que los listeners de base de datos completen creado_por y modificado_por automáticamente."""
    db = SessionLocal()
    try:
        # 1. Crear un usuario de prueba para asociar como creador/modificador
        unique_id = uuid.uuid4().hex[:8]
        usuario_creador = models.Usuario(
            nombres="Audit",
            apellidos="Test",
            correo=f"audit_test_{unique_id}@meh.com",
            password_hash="fake_hash",
            rol="ADMIN"
        )
        db.add(usuario_creador)
        db.commit()
        db.refresh(usuario_creador)
        
        # 2. Guardar el ID del usuario en el contextvar
        token = current_user_id.set(usuario_creador.id_usuario)
        
        try:
            # 3. Crear una entidad auditada (ej. un Curso) sin pasar creado_por ni fecha_creacion
            curso = models.Curso(
                nombre_curso="Curso de Auditoría",
                descripcion="Probando auditoría automática",
                horas_academicas=10,
                estado="ACTIVO"
            )
            db.add(curso)
            db.commit()
            db.refresh(curso)
            
            # 4. Verificar que se rellenaron automáticamente creado_por y fecha_creacion
            assert curso.creado_por == usuario_creador.id_usuario
            assert curso.fecha_creacion is not None
            assert curso.modificado_por is None
            assert curso.fecha_modificacion is None
            
            # 5. Modificar la entidad sin pasar modificado_por ni fecha_modificacion
            curso.nombre_curso = "Curso de Auditoría Modificado"
            db.commit()
            db.refresh(curso)
            
            # 6. Verificar que modificado_por y fecha_modificacion se rellenaron automáticamente
            assert curso.modificado_por == usuario_creador.id_usuario
            assert curso.fecha_modificacion is not None
            
        finally:
            # Limpiar el contextvar
            current_user_id.reset(token)
            
            # Eliminar entidades creadas para no contaminar la base de datos de pruebas
            if 'curso' in locals():
                db.delete(curso)
            db.delete(usuario_creador)
            db.commit()
            
    finally:
        db.close()

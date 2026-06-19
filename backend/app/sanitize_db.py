from sqlalchemy import text
from app.database import SessionLocal
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_sql(db, sql_str, description):
    try:
        db.execute(text(sql_str))
        db.commit()
        logger.info(f"✅ {description}")
    except Exception as e:
        db.rollback()
        logger.warning(f"⚠️ Nota: Al intentar: {description}. Detalle: {e}")

def sanitize():
    db = SessionLocal()
    try:
        logger.info("🛠️ Iniciando saneamiento estructural y de estados de la base de datos...")
        
        # 1. Corregir Cursos sin costo
        run_sql(db, "UPDATE cursos SET costo = 0 WHERE costo IS NULL", "Sanear campo 'costo' en tabla cursos")
        
        # 2. Corregir Lecciones sin orden
        run_sql(db, "UPDATE lecciones SET orden = 1 WHERE orden IS NULL", "Sanear campo 'orden' en tabla lecciones")
        
        # 3. Corregir Eventos: Columnas y datos
        run_sql(db, "ALTER TABLE eventos ADD COLUMN IF NOT EXISTS link_mapas VARCHAR", "Asegurar columna 'link_mapas' en eventos")
        run_sql(db, "ALTER TABLE eventos ADD COLUMN IF NOT EXISTS agenda TEXT", "Asegurar columna 'agenda' en eventos")
        run_sql(db, "UPDATE eventos SET tipo_evento = 'CONFERENCIA' WHERE tipo_evento IS NULL", "Sanear tipo_evento en eventos")
        run_sql(db, "UPDATE eventos SET refrigerio_incluido = false WHERE refrigerio_incluido IS NULL", "Sanear refrigerio_incluido en eventos")
        
        # 4. Asegurar que los anuncios tengan estado activo y sus columnas
        run_sql(db, "UPDATE anuncios SET activo = true WHERE activo IS NULL", "Sanear activo en tabla anuncios")
        run_sql(db, "ALTER TABLE anuncios ADD COLUMN IF NOT EXISTS exclusivo_embajadores BOOLEAN NOT NULL DEFAULT false", "Asegurar columna 'exclusivo_embajadores' en anuncios")

        # 5. Asegurar columnas OCR en tabla pagos
        run_sql(db, "ALTER TABLE pagos ADD COLUMN IF NOT EXISTS porcentaje_ocr NUMERIC(5, 2)", "Asegurar columna 'porcentaje_ocr' en pagos")
        run_sql(db, "ALTER TABLE pagos ADD COLUMN IF NOT EXISTS texto_ocr TEXT", "Asegurar columna 'texto_ocr' en pagos")

        # 5b. Asegurar secuencia e id_inscripcion_curso autoincremental en inscripciones_cursos
        run_sql(db, "CREATE SEQUENCE IF NOT EXISTS inscripciones_cursos_id_inscripcion_curso_seq", "Crear secuencia para inscripciones_cursos")
        run_sql(db, "ALTER TABLE inscripciones_cursos ALTER COLUMN id_inscripcion_curso SET DEFAULT nextval('inscripciones_cursos_id_inscripcion_curso_seq')", "Establecer secuencia por defecto para id_inscripcion_curso")
        run_sql(db, "ALTER SEQUENCE inscripciones_cursos_id_inscripcion_curso_seq OWNED BY inscripciones_cursos.id_inscripcion_curso", "Asociar secuencia a id_inscripcion_curso")
        run_sql(db, "SELECT setval('inscripciones_cursos_id_inscripcion_curso_seq', COALESCE((SELECT MAX(id_inscripcion_curso) FROM inscripciones_cursos), 0) + 1, false)", "Inicializar valor de secuencia para inscripciones_cursos")
        run_sql(db, "ALTER TABLE inscripciones_cursos ADD PRIMARY KEY (id_inscripcion_curso)", "Asegurar Primary Key en id_inscripcion_curso de inscripciones_cursos")

        # 6. Crear tabla catálogo 'estados_registro'
        run_sql(db, """
        CREATE TABLE IF NOT EXISTS estados_registro (
            id_estado INTEGER PRIMARY KEY,
            nombre_estado VARCHAR(50) UNIQUE NOT NULL,
            descripcion TEXT
        )
        """, "Crear tabla catálogo 'estados_registro'")

        # 7. Insertar valores de estados (0: ELIMINADO, 1: INACTIVO, 2: ACTIVO)
        run_sql(db, """
        INSERT INTO estados_registro (id_estado, nombre_estado, descripcion)
        VALUES
            (0, 'ELIMINADO', 'Registro borrado lógicamente, visible sólo en papelera'),
            (1, 'INACTIVO', 'Registro inactivo/borrador, visible sólo para staff'),
            (2, 'ACTIVO', 'Registro activo y plenamente funcional')
        ON CONFLICT (id_estado) DO UPDATE SET
            nombre_estado = EXCLUDED.nombre_estado,
            descripcion = EXCLUDED.descripcion
        """, "Sembrar valores en tabla 'estados_registro'")

        # 8. Agregar columnas de ciclo de vida de estado a todas las tablas del sistema
        tablas = [
            "usuarios", "speakers", "auspiciadores", "comunidades_aliadas", 
            "configuracion_global", "badges", "usuarios_badges", "productos", 
            "pedidos", "pedido_detalles", "eventos", "inscripciones_eventos", 
            "checkpoints", "asistencia_detalles", "cursos", "lecciones", 
            "tareas", "entregas_tareas", "posts_foro", "inscripciones_cursos", 
            "pagos", "logs_sistema", "certificados", "recursos", "anuncios",
            "eventos_pagos_qr"
        ]

        for tabla in tablas:
            # Añadir columna id_estado
            run_sql(db, f"ALTER TABLE {tabla} ADD COLUMN IF NOT EXISTS id_estado INTEGER NOT NULL DEFAULT 2", 
                    f"Asegurar columna 'id_estado' en tabla {tabla}")
            
            # Añadir columna fecha_modificacion_estado
            run_sql(db, f"ALTER TABLE {tabla} ADD COLUMN IF NOT EXISTS fecha_modificacion_estado TIMESTAMP", 
                    f"Asegurar columna 'fecha_modificacion_estado' en tabla {tabla}")
            
            # Añadir constraint de Foreign Key
            run_sql(db, f"""
            ALTER TABLE {tabla} 
            ADD CONSTRAINT fk_{tabla}_id_estado 
            FOREIGN KEY (id_estado) REFERENCES estados_registro(id_estado)
            """, f"Asegurar foreign key de 'id_estado' en tabla {tabla}")

        logger.info("🚀 Saneamiento y migración de estados completada con éxito.")
    except Exception as e:
        logger.error(f"❌ Error durante el saneamiento: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    sanitize()

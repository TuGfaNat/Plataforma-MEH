import sys
import os
from sqlalchemy import text

# Añadir el path para que reconozca el módulo app
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.database import SessionLocal
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fix_sequences():
    db = SessionLocal()
    try:
        logger.info("🛠️ Corrigiendo secuencias de llaves primarias...")
        
        # Lista de tablas que podrían tener problemas tras migraciones manuales
        tablas_a_revisar = ["inscripciones_cursos"]
        
        for tabla in tablas_a_revisar:
            try:
                # Intentar convertir a IDENTITY (Postgres 10+)
                # Primero verificamos si ya tiene un default
                result = db.execute(text(f"""
                    SELECT column_default 
                    FROM information_schema.columns 
                    WHERE table_name = '{tabla}' AND column_name = 'id_{tabla.rstrip('s') if not tabla.endswith('es') else tabla[:-2]}'
                """)).fetchone()
                
                pk_col = f"id_{tabla.rstrip('s')}"
                if tabla == "inscripciones_cursos": pk_col = "id_inscripcion_curso"
                if tabla == "inscripciones_eventos": pk_col = "id_inscripcion"
                
                logger.info(f"Revisando {tabla}.{pk_col}...")
                
                # Forzar SERIAL si no hay default
                db.execute(text(f"ALTER TABLE {tabla} ALTER COLUMN {pk_col} SET NOT NULL"))
                
                # En Postgres, lo más seguro es crear la secuencia y asignarla si falla el autoincremento
                db.execute(text(f"CREATE SEQUENCE IF NOT EXISTS {tabla}_{pk_col}_seq"))
                db.execute(text(f"ALTER TABLE {tabla} ALTER COLUMN {pk_col} SET DEFAULT nextval('{tabla}_{pk_col}_seq')"))
                db.execute(text(f"SELECT setval('{tabla}_{pk_col}_seq', COALESCE((SELECT MAX({pk_col}) FROM {tabla}), 1))"))
                
                logger.info(f"✅ Secuencia para {tabla} corregida.")
            except Exception as e:
                logger.warning(f"⚠️ No se pudo corregir {tabla}: {e}")
                db.rollback()

        db.commit()
        logger.info("🚀 Proceso de corrección de secuencias finalizado.")
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error general: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_sequences()

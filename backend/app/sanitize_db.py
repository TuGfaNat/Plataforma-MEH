from sqlalchemy import text
from app.database import SessionLocal
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def sanitize():
    db = SessionLocal()
    try:
        logger.info("🛠️ Iniciando saneamiento estructural de la base de datos...")
        
        # 1. Corregir Cursos sin costo
        db.execute(text("UPDATE cursos SET costo = 0 WHERE costo IS NULL"))
        logger.info("✅ Campo 'costo' saneado en tabla cursos.")
        
        # 2. Corregir Lecciones sin orden
        db.execute(text("UPDATE lecciones SET orden = 1 WHERE orden IS NULL"))
        logger.info("✅ Campo 'orden' saneado en tabla lecciones.")
        
        # 3. Corregir Eventos: Añadir columnas faltantes y sanear datos
        try:
            db.execute(text("ALTER TABLE eventos ADD COLUMN IF NOT EXISTS link_mapas VARCHAR"))
            db.execute(text("ALTER TABLE eventos ADD COLUMN IF NOT EXISTS agenda TEXT"))
            logger.info("✅ Columnas 'link_mapas' y 'agenda' aseguradas en tabla eventos.")
        except Exception as e:
            logger.warning(f"⚠️ Nota: Al intentar añadir columnas en eventos: {e}")

        db.execute(text("UPDATE eventos SET tipo_evento = 'CONFERENCIA' WHERE tipo_evento IS NULL"))
        db.execute(text("UPDATE eventos SET refrigerio_incluido = false WHERE refrigerio_incluido IS NULL"))
        logger.info("✅ Datos de logística saneados en tabla eventos.")
        
        # 4. Asegurar que los anuncios tengan estado activo
        db.execute(text("UPDATE anuncios SET activo = true WHERE activo IS NULL"))
        logger.info("✅ Campo 'activo' saneado en tabla anuncios.")

        db.commit()
        logger.info("🚀 Saneamiento completado con éxito.")
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error durante el saneamiento: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    sanitize()

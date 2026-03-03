from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Obtener la URL de la base de datos de la variable de entorno
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Si no hay variable (local), usamos el default
if not SQLALCHEMY_DATABASE_URL:
    SQLALCHEMY_DATABASE_URL = "postgresql://postgres:postgres@localhost/plataforma_meh"

# Configuración optimizada para nube (Neon/Render) y local
# Eliminamos connect_args específicos de Windows para evitar conflictos en Linux/Cloud
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

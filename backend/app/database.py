from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Intentar obtener la URL, si hay caracteres extraños en el password, esto ayuda
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:postgres@localhost/plataforma_meh"
)

# Configuración ultra-compatible para Windows
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={
        "options": "-c client_encoding=utf8"
    },
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

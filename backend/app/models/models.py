from sqlalchemy import Column, Integer, String, TEXT, DateTime, ForeignKey, Boolean, Date, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Usuario(Base):
    __tablename__ = "usuarios"
    
    id_usuario = Column(Integer, primary_key=True, index=True)
    nombres = Column(String(100), nullable=False)
    apellidos = Column(String(100), nullable=False)
    correo = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(TEXT, nullable=False)
    rol = Column(String(20), nullable=False) # ADMIN, ORGANIZADOR, MIEMBRO
    fecha_registro = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    inscripciones_eventos = relationship("InscripcionEvento", back_populates="usuario")
    inscripciones_cursos = relationship("InscripcionCurso", back_populates="usuario")
    usuarios_badges = relationship("UsuarioBadge", back_populates="usuario")
    certificados = relationship("Certificado", back_populates="usuario")
    pagos = relationship("Pago", back_populates="usuario")
    asistencias = relationship("AsistenciaDetalle", back_populates="usuario")

class Evento(Base):
    __tablename__ = "eventos"
    
    id_evento = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    descripcion = Column(TEXT)
    fecha_inicio = Column(DateTime, nullable=False)
    modalidad = Column(String(20)) # PRESENCIAL, VIRTUAL
    token_qr = Column(String(255), unique=True)
    capacidad_max = Column(Integer, nullable=False)
    estado = Column(String(20), default="PROGRAMADO")

    # Relaciones
    inscripciones = relationship("InscripcionEvento", back_populates="evento")
    checkpoints = relationship("Checkpoint", back_populates="evento")
    badges = relationship("Badge", back_populates="evento")

class Curso(Base):
    __tablename__ = "cursos"
    
    id_curso = Column(Integer, primary_key=True, index=True)
    nombre_curso = Column(String(200), nullable=False)
    descripcion = Column(TEXT)
    horas_academicas = Column(Integer, nullable=False)
    id_instructor = Column(Integer, ForeignKey("usuarios.id_usuario"))
    estado = Column(String(20), default="ACTIVO")

    # Relaciones
    inscripciones = relationship("InscripcionCurso", back_populates="curso")
    badges = relationship("Badge", back_populates="curso")

class InscripcionEvento(Base):
    __tablename__ = "inscripciones_eventos"
    
    id_inscripcion = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario", ondelete="CASCADE"))
    id_evento = Column(Integer, ForeignKey("eventos.id_evento", ondelete="CASCADE"))
    fecha_inscripcion = Column(DateTime, default=datetime.utcnow)
    asistio = Column(Boolean, default=False)
    fecha_validacion = Column(DateTime)

    usuario = relationship("Usuario", back_populates="inscripciones_eventos")
    evento = relationship("Evento", back_populates="inscripciones")

class InscripcionCurso(Base):
    __tablename__ = "inscripciones_cursos"
    
    id_inscripcion = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario", ondelete="CASCADE"))
    id_curso = Column(Integer, ForeignKey("cursos.id_curso", ondelete="CASCADE"))
    progreso_porcentaje = Column(Integer, default=0)
    finalizado = Column(Boolean, default=False)

    usuario = relationship("Usuario", back_populates="inscripciones_cursos")
    curso = relationship("Curso", back_populates="inscripciones")

class Checkpoint(Base):
    __tablename__ = "checkpoints"
    
    id_checkpoint = Column(Integer, primary_key=True, index=True)
    id_evento = Column(Integer, ForeignKey("eventos.id_evento"))
    nombre_checkpoint = Column(String(100))
    hora_apertura = Column(DateTime)
    hora_cierre = Column(DateTime)

    evento = relationship("Evento", back_populates="checkpoints")
    asistencias = relationship("AsistenciaDetalle", back_populates="checkpoint")

class AsistenciaDetalle(Base):
    __tablename__ = "asistencias_detalle"
    
    id_asistencia_det = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
    id_checkpoint = Column(Integer, ForeignKey("checkpoints.id_checkpoint"))
    fecha_escaneo = Column(DateTime, default=datetime.utcnow)

    usuario = relationship("Usuario", back_populates="asistencias")
    checkpoint = relationship("Checkpoint", back_populates="asistencias")

class Badge(Base):
    __tablename__ = "badges"
    
    id_badge = Column(Integer, primary_key=True, index=True)
    nombre_badge = Column(String(100), nullable=False)
    descripcion = Column(TEXT)
    imagen_url = Column(TEXT)
    id_evento_origen = Column(Integer, ForeignKey("eventos.id_evento"))
    id_curso_origen = Column(Integer, ForeignKey("cursos.id_curso"))

    evento = relationship("Evento", back_populates="badges")
    curso = relationship("Curso", back_populates="badges")
    usuarios_badges = relationship("UsuarioBadge", back_populates="badge")

class UsuarioBadge(Base):
    __tablename__ = "usuarios_badges"
    
    id_usuario_badge = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
    id_badge = Column(Integer, ForeignKey("badges.id_badge"))
    fecha_obtencion = Column(DateTime, default=datetime.utcnow)

    usuario = relationship("Usuario", back_populates="usuarios_badges")
    badge = relationship("Badge", back_populates="usuarios_badges")

class Certificado(Base):
    __tablename__ = "certificados"
    
    id_certificado = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
    fecha_emision = Column(Date, default=datetime.utcnow)
    codigo_verificacion = Column(String(50), unique=True)
    url_pdf = Column(TEXT)

    usuario = relationship("Usuario", back_populates="certificados")

class Pago(Base):
    __tablename__ = "pagos"
    
    id_pago = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
    monto = Column(Numeric(10, 2))
    fecha_pago = Column(DateTime, default=datetime.utcnow)
    metodo_pago = Column(String(50))
    estado_pago = Column(String(20))
    tipo_referencia = Column(String(20)) # EVENTO o CURSO
    id_referencia = Column(Integer)
    comprobante_url = Column(TEXT)

    usuario = relationship("Usuario", back_populates="pagos")

class LogSistema(Base):
    __tablename__ = "logs_sistema"
    
    id_log = Column(Integer, primary_key=True, index=True)
    id_admin = Column(Integer)
    accion = Column(TEXT)
    fecha = Column(DateTime, default=datetime.utcnow)

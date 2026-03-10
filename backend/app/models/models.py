from sqlalchemy import Column, Integer, String, TEXT, DateTime, ForeignKey, Boolean, Date, Numeric, CheckConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from ..database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario = Column(Integer, primary_key=True, index=True)
    nombres = Column(String)
    apellidos = Column(String)
    correo = Column(String, unique=True, index=True)
    password_hash = Column(TEXT)
    rol = Column(String, default="MIEMBRO") # ADMIN, ORGANIZADOR, EMBAJADOR, MIEMBRO
    fecha_registro = Column(DateTime, default=datetime.utcnow)
    bio = Column(TEXT, nullable=True)
    linkedin_url = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    perfil_publico = Column(Boolean, default=True)
    
    # Campos de Auditoría
    creado_por = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    modificado_por = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=True)
    fecha_modificacion = Column(DateTime, nullable=True)

    # Relaciones
    inscripciones_eventos = relationship("InscripcionEvento", back_populates="usuario")
    inscripciones_cursos = relationship("InscripcionCurso", back_populates="usuario")
    pagos = relationship("Pago", back_populates="usuario", foreign_keys="[Pago.id_usuario]")
    logs = relationship("LogSistema", back_populates="admin", foreign_keys="LogSistema.id_admin")
    certificados = relationship("Certificado", back_populates="usuario")

    # Restricción de Check para rol
    __table_args__ = (
        CheckConstraint("rol IN ('ADMIN', 'ORGANIZADOR', 'EMBAJADOR', 'MIEMBRO')", name="usuarios_rol_check"),
    )

class Evento(Base):
    __tablename__ = "eventos"

    id_evento = Column(Integer, primary_key=True, index=True)
    titulo = Column(String)
    descripcion = Column(TEXT, nullable=True)
    fecha_inicio = Column(DateTime)
    fecha_fin = Column(DateTime, nullable=True)
    modalidad = Column(String) # VIRTUAL, PRESENCIAL, HIBRIDO
    ubicacion = Column(String, nullable=True)
    capacidad_max = Column(Integer)
    estado = Column(String, default="PROGRAMADO") # PROGRAMADO, EN_CURSO, FINALIZADO, CANCELADO
    imagen_url = Column(String, nullable=True)
    token_qr = Column(String, nullable=True)
    id_organizador = Column(Integer, ForeignKey("usuarios.id_usuario"))

    # Auditoría
    creado_por = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    modificado_por = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=True)
    fecha_modificacion = Column(DateTime, nullable=True)

    inscripciones = relationship("InscripcionEvento", back_populates="evento")
    checkpoints = relationship("Checkpoint", back_populates="evento")

class InscripcionEvento(Base):
    __tablename__ = "inscripciones_eventos"

    id_inscripcion = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
    id_evento = Column(Integer, ForeignKey("eventos.id_evento"))
    fecha_inscripcion = Column(DateTime, default=datetime.utcnow)
    estado_inscripcion = Column(String, default="PENDIENTE") # PENDIENTE, PAGADO, CANCELADO, ASISTIO
    codigo_qr = Column(String, unique=True, nullable=True)
    asistio = Column(Boolean, default=False)
    fecha_validacion = Column(DateTime, nullable=True)
    id_pago = Column(Integer, ForeignKey("pagos.id_pago"), nullable=True)

    usuario = relationship("Usuario", back_populates="inscripciones_eventos")
    evento = relationship("Evento", back_populates="inscripciones")
    asistencia = relationship("AsistenciaDetalle", back_populates="inscripcion", uselist=False)

class Checkpoint(Base):
    __tablename__ = "checkpoints"

    id_checkpoint = Column(Integer, primary_key=True, index=True)
    id_evento = Column(Integer, ForeignKey("eventos.id_evento"))
    nombre_checkpoint = Column(String) # Entrada, Taller 1, Salida, etc.
    orden = Column(Integer)
    activo = Column(Boolean, default=True)

    evento = relationship("Evento", back_populates="checkpoints")
    asistencias = relationship("AsistenciaDetalle", back_populates="checkpoint")

class AsistenciaDetalle(Base):
    __tablename__ = "asistencia_detalles"

    id_asistencia = Column(Integer, primary_key=True, index=True)
    id_inscripcion = Column(Integer, ForeignKey("inscripciones_eventos.id_inscripcion"))
    id_checkpoint = Column(Integer, ForeignKey("checkpoints.id_checkpoint"))
    fecha_escaneo = Column(DateTime, default=datetime.utcnow)
    escanedao_por = Column(Integer, ForeignKey("usuarios.id_usuario"))

    inscripcion = relationship("InscripcionEvento", back_populates="asistencia")
    checkpoint = relationship("Checkpoint", back_populates="asistencias")

class Curso(Base):
    __tablename__ = "cursos"

    id_curso = Column(Integer, primary_key=True, index=True)
    nombre_curso = Column(String)
    descripcion = Column(TEXT)
    horas_academicas = Column(Integer)
    estado = Column(String, default="ACTIVO") # ACTIVO, INACTIVO
    imagen_url = Column(String, nullable=True)

    inscripciones = relationship("InscripcionCurso", back_populates="curso")

class InscripcionCurso(Base):
    __tablename__ = "inscripciones_cursos"

    id_inscripcion_curso = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
    id_curso = Column(Integer, ForeignKey("cursos.id_curso"))
    fecha_inscripcion = Column(DateTime, default=datetime.utcnow)
    progreso = Column(Numeric(5, 2), default=0) # 0.00 a 100.00
    completado = Column(Boolean, default=False)
    fecha_completado = Column(DateTime, nullable=True)

    usuario = relationship("Usuario", back_populates="inscripciones_cursos")
    curso = relationship("Curso", back_populates="inscripciones")

class Pago(Base):
    __tablename__ = "pagos"

    id_pago = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
    monto = Column(Numeric(10, 2))
    fecha_pago = Column(DateTime, default=datetime.utcnow)
    metodo_pago = Column(String) # TRANSFERENCIA, EFECTIVO, QR_SIMPLE
    estado_pago = Column(String, default="PENDIENTE") # PENDIENTE, APROBADO, RECHAZADO
    url_comprobante = Column(String, nullable=True)
    id_referencia = Column(Integer) # ID de Evento o Producto
    tipo_referencia = Column(String) # EVENTO, MEMBRESIA, CURSO
    
    # Auditoría de Pago
    validado_por = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=True)
    fecha_validacion = Column(DateTime, nullable=True)
    notas_admin = Column(TEXT, nullable=True)

    # Relación principal con el usuario que paga
    usuario = relationship("Usuario", back_populates="pagos", foreign_keys=[id_usuario])
    # Relación opcional con el admin que valida
    validador = relationship("Usuario", foreign_keys=[validado_por])

class LogSistema(Base):
    __tablename__ = "logs_sistema"

    id_log = Column(Integer, primary_key=True, index=True)
    id_admin = Column(Integer, ForeignKey("usuarios.id_usuario"))
    accion = Column(String) # INICIO_SESION, CREAR_EVENTO, APROBAR_PAGO, etc.
    tabla_afectada = Column(String)
    id_registro_afectado = Column(Integer)
    valor_anterior = Column(TEXT, nullable=True)
    valor_nuevo = Column(TEXT, nullable=True)
    fecha_hora = Column(DateTime, default=datetime.utcnow)
    ip_direccion = Column(String, nullable=True)

    admin = relationship("Usuario", back_populates="logs", foreign_keys=[id_admin])

class Certificado(Base):
    __tablename__ = "certificados"

    id_certificado = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
    id_curso = Column(Integer, ForeignKey("cursos.id_curso"), nullable=True)
    id_evento = Column(Integer, ForeignKey("eventos.id_evento"), nullable=True)
    uuid_verificacion = Column(String, default=lambda: str(uuid.uuid4()), unique=True)
    codigo_verificacion = Column(String, unique=True)
    fecha_emision = Column(DateTime, default=datetime.utcnow)
    url_pdf = Column(String)
    formato = Column(String, default="DIGITAL") # DIGITAL, FISICO, AMBOS
    es_ruta_linkedin = Column(Boolean, default=False)
    metadata_adicional = Column(TEXT, nullable=True)

    usuario = relationship("Usuario", back_populates="certificados")

    __table_args__ = (
        CheckConstraint("formato IN ('DIGITAL', 'FISICO', 'AMBOS')", name="certificados_formato_check"),
    )

class Anuncio(Base):
    __tablename__ = "anuncios"

    id_anuncio = Column(Integer, primary_key=True, index=True)
    titulo = Column(String)
    contenido = Column(TEXT)
    tipo = Column(String, default="INFO") # INFO, NUEVO, ALERTA
    fecha_publicacion = Column(DateTime, default=datetime.utcnow)
    id_autor = Column(Integer, ForeignKey("usuarios.id_usuario"))
    activo = Column(Boolean, default=True)

    autor = relationship("Usuario")

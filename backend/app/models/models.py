from sqlalchemy import Column, Integer, String, TEXT, DateTime, ForeignKey, Boolean, Date, Numeric, CheckConstraint
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
    bio = Column(TEXT)
    linkedin_url = Column(String(255))
    github_url = Column(String(255))
    perfil_publico = Column(Boolean, default=True)
    
    # Auditoría
    creado_por = Column(Integer, ForeignKey("usuarios.id_usuario"))
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    modificado_por = Column(Integer, ForeignKey("usuarios.id_usuario"))
    fecha_modificacion = Column(DateTime, onupdate=datetime.utcnow)

    # Relaciones
    inscripciones_eventos = relationship("InscripcionEvento", back_populates="usuario", foreign_keys="InscripcionEvento.id_usuario")
    inscripciones_cursos = relationship("InscripcionCurso", back_populates="usuario", foreign_keys="InscripcionCurso.id_usuario")
    usuarios_badges = relationship("UsuarioBadge", back_populates="usuario")
    certificados = relationship("Certificado", back_populates="usuario")
    pagos = relationship("Pago", back_populates="usuario", foreign_keys="Pago.id_usuario")
    asistencias = relationship("AsistenciaDetalle", back_populates="usuario")
    pedidos = relationship("Pedido", back_populates="usuario")
    
    # Restricción de Check para rol
    __table_args__ = (
        CheckConstraint("rol IN ('ADMIN', 'ORGANIZADOR', 'MIEMBRO')", name="usuarios_rol_check"),
    )

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

    # Auditoría
    creado_por = Column(Integer, ForeignKey("usuarios.id_usuario"))
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    modificado_por = Column(Integer, ForeignKey("usuarios.id_usuario"))
    fecha_modificacion = Column(DateTime, onupdate=datetime.utcnow)

    # Relaciones
    inscripciones = relationship("InscripcionEvento", back_populates="evento")
    checkpoints = relationship("Checkpoint", back_populates="evento")
    badges = relationship("Badge", back_populates="evento")
    
    __table_args__ = (
        CheckConstraint("modalidad IN ('PRESENCIAL', 'VIRTUAL')", name="eventos_modalidad_check"),
    )

class Curso(Base):
    __tablename__ = "cursos"
    
    id_curso = Column(Integer, primary_key=True, index=True)
    nombre_curso = Column(String(200), nullable=False)
    descripcion = Column(TEXT)
    horas_academicas = Column(Integer, nullable=False)
    id_instructor = Column(Integer, ForeignKey("usuarios.id_usuario"))
    estado = Column(String(20), default="ACTIVO")

    # Auditoría
    modificado_por = Column(Integer, ForeignKey("usuarios.id_usuario"))
    fecha_modificacion = Column(DateTime, onupdate=datetime.utcnow)

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
    id_pago = Column(Integer, ForeignKey("pagos.id_pago"), nullable=True)
    estado_inscripcion = Column(String(20), default="PENDIENTE")
    
    # Auditoría
    modificado_por = Column(Integer, ForeignKey("usuarios.id_usuario"))
    fecha_modificacion = Column(DateTime, onupdate=datetime.utcnow)

    usuario = relationship("Usuario", back_populates="inscripciones_eventos", foreign_keys=[id_usuario])
    evento = relationship("Evento", back_populates="inscripciones")
    pago = relationship("Pago")

    __table_args__ = (
        CheckConstraint("estado_inscripcion IN ('PENDIENTE', 'CONFIRMADA', 'CANCELADA')", name="inscripciones_eventos_estado_check"),
    )

class InscripcionCurso(Base):
    __tablename__ = "inscripciones_cursos"
    
    id_inscripcion = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario", ondelete="CASCADE"))
    id_curso = Column(Integer, ForeignKey("cursos.id_curso", ondelete="CASCADE"))
    progreso_porcentaje = Column(Integer, default=0)
    finalizado = Column(Boolean, default=False)
    id_pago = Column(Integer, ForeignKey("pagos.id_pago"), nullable=True)
    estado_inscripcion = Column(String(20), default="PENDIENTE")
    
    # Auditoría
    modificado_por = Column(Integer, ForeignKey("usuarios.id_usuario"))
    fecha_modificacion = Column(DateTime, onupdate=datetime.utcnow)

    usuario = relationship("Usuario", back_populates="inscripciones_cursos", foreign_keys=[id_usuario])
    curso = relationship("Curso", back_populates="inscripciones")
    pago = relationship("Pago")

    __table_args__ = (
        CheckConstraint("estado_inscripcion IN ('PENDIENTE', 'CONFIRMADA', 'CANCELADA')", name="inscripciones_cursos_estado_check"),
    )

class Checkpoint(Base):
    __tablename__ = "checkpoints"
    
    id_checkpoint = Column(Integer, primary_key=True, index=True)
    id_evento = Column(Integer, ForeignKey("eventos.id_evento", ondelete="CASCADE"))
    nombre_checkpoint = Column(String(100), nullable=False)
    hora_apertura = Column(DateTime)
    hora_cierre = Column(DateTime)
    tipo_checkpoint = Column(String(20)) # ACCESO, COMIDA, AVANCE_CURSO, ENTREGA_KIT

    evento = relationship("Evento", back_populates="checkpoints")
    asistencias = relationship("AsistenciaDetalle", back_populates="checkpoint")

    __table_args__ = (
        CheckConstraint("tipo_checkpoint IN ('ACCESO', 'COMIDA', 'AVANCE_CURSO', 'ENTREGA_KIT')", name="checkpoints_tipo_check"),
    )

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
    imagen_url = Column(String(255), nullable=False)
    id_evento_origen = Column(Integer, ForeignKey("eventos.id_evento"))
    id_curso_origen = Column(Integer, ForeignKey("cursos.id_curso"))

    evento = relationship("Evento", back_populates="badges")
    curso = relationship("Curso", back_populates="badges")
    usuarios_badges = relationship("UsuarioBadge", back_populates="badge")

class UsuarioBadge(Base):
    __tablename__ = "usuarios_badges"
    
    id_usuario_badge = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario", ondelete="CASCADE"))
    id_badge = Column(Integer, ForeignKey("badges.id_badge", ondelete="CASCADE"))
    fecha_obtencion = Column(DateTime, default=datetime.utcnow)

    usuario = relationship("Usuario", back_populates="usuarios_badges")
    badge = relationship("Badge", back_populates="usuarios_badges")

class Certificado(Base):
    __tablename__ = "certificados"
    
    id_certificado = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario", ondelete="CASCADE"))
    codigo_verificacion = Column(String(50), unique=True, nullable=False)
    url_pdf = Column(TEXT, nullable=False)
    fecha_emision = Column(Date, default=datetime.utcnow)
    formato = Column(String(20)) # DIGITAL, FISICO, AMBOS
    entregado_fisico = Column(Boolean, default=False)

    usuario = relationship("Usuario", back_populates="certificados")

    __table_args__ = (
        CheckConstraint("formato IN ('DIGITAL', 'FISICO', 'AMBOS')", name="certificados_formato_check"),
    )

class Pago(Base):
    __tablename__ = "pagos"
    
    id_pago = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
    id_referencia = Column(Integer)
    tipo_referencia = Column(String(20)) # EVENTO, CURSO
    monto = Column(Numeric(10, 2), nullable=False)
    metodo_pago = Column(String(50))
    estado_pago = Column(String(20), default="PENDIENTE")
    comprobante_url = Column(TEXT)
    fecha_pago = Column(DateTime, default=datetime.utcnow)
    validado_por = Column(Integer, ForeignKey("usuarios.id_usuario"))

    usuario = relationship("Usuario", back_populates="pagos", foreign_keys=[id_usuario])
    validador = relationship("Usuario", foreign_keys=[validado_por])

    __table_args__ = (
        CheckConstraint("tipo_referencia IN ('EVENTO', 'CURSO')", name="pagos_tipo_referencia_check"),
    )

class Producto(Base):
    __tablename__ = "productos"
    
    id_producto = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(TEXT)
    precio = Column(Numeric(10, 2), default=0)
    stock = Column(Integer, default=0)
    es_kit_evento = Column(Boolean, default=False)
    imagen_url = Column(TEXT)
    
    # Auditoría
    modificado_por = Column(Integer, ForeignKey("usuarios.id_usuario"))
    fecha_modificacion = Column(DateTime, onupdate=datetime.utcnow)

class Pedido(Base):
    __tablename__ = "pedidos"
    
    id_pedido = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
    id_pago = Column(Integer, ForeignKey("pagos.id_pago"))
    estado_entrega = Column(String(20), default="PENDIENTE")
    fecha_pedido = Column(DateTime, default=datetime.utcnow)

    usuario = relationship("Usuario", back_populates="pedidos")
    pago = relationship("Pago")
    detalles = relationship("PedidoDetalle", back_populates="pedido")

class PedidoDetalle(Base):
    __tablename__ = "pedidos_detalle"
    
    id_detalle = Column(Integer, primary_key=True, index=True)
    id_pedido = Column(Integer, ForeignKey("pedidos.id_pedido"))
    id_producto = Column(Integer, ForeignKey("productos.id_producto"))
    cantidad = Column(Integer, default=1)

    pedido = relationship("Pedido", back_populates="detalles")
    producto = relationship("Producto")

class LogSistema(Base):
    __tablename__ = "logs_sistema"
    
    id_log = Column(Integer, primary_key=True, index=True)
    id_admin = Column(Integer, ForeignKey("usuarios.id_usuario"))
    accion = Column(TEXT, nullable=False)
    fecha = Column(DateTime, default=datetime.utcnow)
    tabla_afectada = Column(String(50))
    id_registro_afectado = Column(Integer)
    valor_anterior = Column(TEXT)
    valor_nuevo = Column(TEXT)
    ip_direccion = Column(String(45))

class Anuncio(Base):
    __tablename__ = "anuncios"
    
    id_anuncio = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    contenido = Column(TEXT, nullable=False)
    tipo = Column(String(20), default="INFO") # INFO, NUEVO, ALERTA
    fecha_publicacion = Column(DateTime, default=datetime.utcnow)
    id_autor = Column(Integer, ForeignKey("usuarios.id_usuario"))
    activo = Column(Boolean, default=True)

    autor = relationship("Usuario")

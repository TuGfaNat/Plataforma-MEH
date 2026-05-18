from sqlalchemy import Column, Integer, String, TEXT, DateTime, ForeignKey, Boolean, Date, Numeric, CheckConstraint, Table
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from ..database import Base

class AuditMixin:
    creado_por = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    modificado_por = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=True)
    fecha_modificacion = Column(DateTime, nullable=True)

# Tablas Intermedias (Asociaciones)
eventos_speakers = Table(
    "eventos_speakers",
    Base.metadata,
    Column("id_evento", Integer, ForeignKey("eventos.id_evento", ondelete="CASCADE")),
    Column("id_speaker", Integer, ForeignKey("speakers.id_speaker", ondelete="CASCADE"))
)

eventos_auspiciadores = Table(
    "eventos_auspiciadores",
    Base.metadata,
    Column("id_evento", Integer, ForeignKey("eventos.id_evento", ondelete="CASCADE")),
    Column("id_auspiciador", Integer, ForeignKey("auspiciadores.id_auspiciador", ondelete="CASCADE"))
)

eventos_comunidades = Table(
    "eventos_comunidades",
    Base.metadata,
    Column("id_evento", Integer, ForeignKey("eventos.id_evento", ondelete="CASCADE")),
    Column("id_comunidad", Integer, ForeignKey("comunidades_aliadas.id_comunidad", ondelete="CASCADE"))
)

class Usuario(Base, AuditMixin):
    __tablename__ = "usuarios"

    id_usuario = Column(Integer, primary_key=True, index=True)
    nombres = Column(String)
    apellidos = Column(String)
    alias = Column(String, nullable=True)
    foto_url = Column(String, nullable=True)
    preferencia_tema = Column(String, default="dark")
    correo = Column(String, unique=True, index=True)
    password_hash = Column(TEXT)
    rol = Column(String, default="MIEMBRO")
    fecha_registro = Column(DateTime, default=datetime.utcnow)
    bio = Column(TEXT, nullable=True)
    
    # Nuevos campos solicitados
    institucion = Column(String, nullable=True) # Trabajo o estudio
    estudia_en = Column(String, nullable=True)
    tipo_entidad = Column(String, default="Estudiante") # Estudiante / Profesional
    pais = Column(String, default="Bolivia")
    departamento = Column(String, nullable=True) # Para métricas bolivianas
    
    # Redes sociales
    linkedin_url = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    facebook_url = Column(String, nullable=True)
    instagram_url = Column(String, nullable=True)
    tiktok_url = Column(String, nullable=True)
    learning_path_url = Column(String, nullable=True)
    
    perfil_publico = Column(Boolean, default=True)
    activo = Column(Boolean, default=True)

    # Relaciones
    inscripciones_eventos = relationship("InscripcionEvento", back_populates="usuario", foreign_keys="[InscripcionEvento.id_usuario]")
    inscripciones_cursos = relationship("InscripcionCurso", back_populates="usuario", foreign_keys="[InscripcionCurso.id_usuario]")
    pagos = relationship("Pago", back_populates="usuario", foreign_keys="[Pago.id_usuario]")
    logs = relationship("LogSistema", back_populates="admin", foreign_keys="LogSistema.id_admin")
    certificados = relationship("Certificado", back_populates="usuario", foreign_keys="[Certificado.id_usuario]")
    badges = relationship("UsuarioBadge", back_populates="usuario", foreign_keys="[UsuarioBadge.id_usuario]")
    pedidos = relationship("Pedido", back_populates="usuario", foreign_keys="[Pedido.id_usuario]")

    __table_args__ = (
        CheckConstraint(
            "rol IN ('ADMIN', 'ORGANIZADOR', 'MODERADOR', 'SOPORTE', 'EMBAJADOR', 'MIEMBRO')",
            name="usuarios_rol_check"
        ),
    )

class Speaker(Base, AuditMixin):
    __tablename__ = "speakers"
    id_speaker = Column(Integer, primary_key=True, index=True)
    nombre = Column(String)
    bio = Column(TEXT, nullable=True)
    trayectoria = Column(TEXT, nullable=True)
    foto_url = Column(String, nullable=True)
    trabajo_actual = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    twitter_url = Column(String, nullable=True)

    eventos = relationship("Evento", secondary=eventos_speakers, back_populates="speakers")

class Auspiciador(Base, AuditMixin):
    __tablename__ = "auspiciadores"
    id_auspiciador = Column(Integer, primary_key=True, index=True)
    nombre = Column(String)
    logo_url = Column(String, nullable=True)
    sitio_web = Column(String, nullable=True)
    tipo = Column(String, default="GENERAL") # GOLD, SILVER, BRONZE, GENERAL

    eventos = relationship("Evento", secondary=eventos_auspiciadores, back_populates="auspiciadores")

class ComunidadAliada(Base, AuditMixin):
    __tablename__ = "comunidades_aliadas"
    id_comunidad = Column(Integer, primary_key=True, index=True)
    nombre = Column(String)
    descripcion = Column(TEXT, nullable=True)
    logo_url = Column(String, nullable=True)
    link_contacto = Column(String, nullable=True)

    eventos = relationship("Evento", secondary=eventos_comunidades, back_populates="comunidades")

class ConfiguracionGlobal(Base, AuditMixin):
    __tablename__ = "configuracion_global"
    id_config = Column(Integer, primary_key=True)
    clave = Column(String, unique=True) # e.g., 'ADMIN_QR_PAGO'
    valor = Column(TEXT)
    descripcion = Column(String, nullable=True)

class Badge(Base, AuditMixin):
    __tablename__ = "badges"
    id_badge = Column(Integer, primary_key=True, index=True)
    nombre_badge = Column(String)
    descripcion = Column(TEXT, nullable=True)
    imagen_url = Column(TEXT)
    id_evento_origen = Column(Integer, ForeignKey("eventos.id_evento"), nullable=True)
    id_curso_origen = Column(Integer, ForeignKey("cursos.id_curso"), nullable=True)
    puntos = Column(Integer, default=10)
    requisito_nivel = Column(String, default="Beginner")

class UsuarioBadge(Base, AuditMixin):
    __tablename__ = "usuarios_badges"
    id_usuario_badge = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario", ondelete="CASCADE"))
    id_badge = Column(Integer, ForeignKey("badges.id_badge", ondelete="CASCADE"))
    fecha_obtencion = Column(DateTime, default=datetime.utcnow)

    usuario = relationship("Usuario", back_populates="badges", foreign_keys=[id_usuario])
    badge = relationship("Badge", foreign_keys=[id_badge])

class Producto(Base, AuditMixin):
    __tablename__ = "productos"
    id_producto = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100))
    descripcion = Column(TEXT, nullable=True)
    precio = Column(Numeric(10, 2), default=0)
    stock = Column(Integer, default=0)
    es_kit_evento = Column(Boolean, default=False)
    imagen_url = Column(TEXT, nullable=True)
    categoria = Column(String, default="SOUVENIR") # SOUVENIR, OTRO
    activo = Column(Boolean, default=True)

    __table_args__ = (
        CheckConstraint("precio >= 0", name="check_producto_precio_positivo"),
        CheckConstraint("stock >= 0", name="check_producto_stock_positivo"),
    )

class Pedido(Base, AuditMixin):
    __tablename__ = "pedidos"
    id_pedido = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), index=True)
    id_pago = Column(Integer, ForeignKey("pagos.id_pago"), nullable=True, index=True)
    estado = Column(String, default="PENDIENTE") # PENDIENTE, COMPLETADO, CANCELADO
    fecha_pedido = Column(DateTime, default=datetime.utcnow)
    total = Column(Numeric(10, 2), default=0)

    usuario = relationship("Usuario", back_populates="pedidos", foreign_keys=[id_usuario])
    detalles = relationship("PedidoDetalle", back_populates="pedido")

    __table_args__ = (
        CheckConstraint("total >= 0", name="check_pedido_total_positivo"),
    )

class PedidoDetalle(Base):
    __tablename__ = "pedido_detalles"
    id_detalle = Column(Integer, primary_key=True, index=True)
    id_pedido = Column(Integer, ForeignKey("pedidos.id_pedido", ondelete="CASCADE"), index=True)
    id_producto = Column(Integer, ForeignKey("productos.id_producto"), index=True)
    cantidad = Column(Integer, default=1)
    precio_unitario = Column(Numeric(10, 2))

    pedido = relationship("Pedido", back_populates="detalles")
    producto = relationship("Producto")

    __table_args__ = (
        CheckConstraint("cantidad > 0", name="check_detalle_cantidad_positiva"),
        CheckConstraint("precio_unitario >= 0", name="check_detalle_precio_positivo"),
    )

class Evento(Base, AuditMixin):
    __tablename__ = "eventos"

    id_evento = Column(Integer, primary_key=True, index=True)
    titulo = Column(String)
    descripcion = Column(TEXT, nullable=True)
    fecha_inicio = Column(DateTime)
    fecha_fin = Column(DateTime, nullable=True)
    hora_inicio = Column(String, nullable=True) # e.g. "14:00"
    hora_fin = Column(String, nullable=True)
    modalidad = Column(String) # VIRTUAL, PRESENCIAL, HIBRIDO
    ubicacion = Column(String, nullable=True)
    capacidad_max = Column(Integer)
    estado = Column(String, default="PROGRAMADO")
    imagen_url = Column(String, nullable=True)
    token_qr = Column(String, nullable=True)
    id_organizador = Column(Integer, ForeignKey("usuarios.id_usuario"), index=True)

    inscripciones = relationship("InscripcionEvento", back_populates="evento")
    checkpoints = relationship("Checkpoint", back_populates="evento")
    organizador = relationship("Usuario", foreign_keys="[Evento.id_organizador]")
    
    # Nuevas relaciones para el Master Panel
    speakers = relationship("Speaker", secondary=eventos_speakers, back_populates="eventos")
    auspiciadores = relationship("Auspiciador", secondary=eventos_auspiciadores, back_populates="eventos")
    comunidades = relationship("ComunidadAliada", secondary=eventos_comunidades, back_populates="eventos")

    __table_args__ = (
        CheckConstraint("capacidad_max > 0", name="check_evento_capacidad_positiva"),
    )

class InscripcionEvento(Base, AuditMixin):
    __tablename__ = "inscripciones_eventos"

    id_inscripcion = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), index=True)
    id_evento = Column(Integer, ForeignKey("eventos.id_evento"), index=True)
    fecha_inscripcion = Column(DateTime, default=datetime.utcnow)
    estado_inscripcion = Column(String, default="PENDIENTE")
    codigo_qr = Column(String, unique=True, nullable=True)
    asistio = Column(Boolean, default=False)
    fecha_validacion = Column(DateTime, nullable=True)
    id_pago = Column(Integer, ForeignKey("pagos.id_pago"), nullable=True, index=True)

    usuario = relationship("Usuario", back_populates="inscripciones_eventos", foreign_keys="[InscripcionEvento.id_usuario]")
    evento = relationship("Evento", back_populates="inscripciones")
    asistencia = relationship("AsistenciaDetalle", back_populates="inscripcion", uselist=False)

class Checkpoint(Base, AuditMixin):
    __tablename__ = "checkpoints"

    id_checkpoint = Column(Integer, primary_key=True, index=True)
    id_evento = Column(Integer, ForeignKey("eventos.id_evento"), index=True)
    nombre_checkpoint = Column(String)
    hora_apertura = Column(DateTime, nullable=True)
    hora_cierre = Column(DateTime, nullable=True)
    tipo_checkpoint = Column(String, nullable=True)
    orden = Column(Integer)
    activo = Column(Boolean, default=True)

    evento = relationship("Evento", back_populates="checkpoints")
    asistencias = relationship("AsistenciaDetalle", back_populates="checkpoint")

class AsistenciaDetalle(Base, AuditMixin):
    __tablename__ = "asistencia_detalles"

    id_asistencia = Column(Integer, primary_key=True, index=True)
    id_inscripcion = Column(Integer, ForeignKey("inscripciones_eventos.id_inscripcion"), index=True)
    id_checkpoint = Column(Integer, ForeignKey("checkpoints.id_checkpoint"), index=True)
    fecha_escaneo = Column(DateTime, default=datetime.utcnow)
    escaneado_por = Column(Integer, ForeignKey("usuarios.id_usuario"), index=True)

    inscripcion = relationship("InscripcionEvento", back_populates="asistencia")
    checkpoint = relationship("Checkpoint", back_populates="asistencias")
    escaneador = relationship("Usuario", foreign_keys="[AsistenciaDetalle.escaneado_por]")

class Curso(Base, AuditMixin):
    __tablename__ = "cursos"

    id_curso = Column(Integer, primary_key=True, index=True)
    nombre_curso = Column(String)
    descripcion = Column(TEXT)
    horas_academicas = Column(Integer)
    estado = Column(String, default="ACTIVO")
    imagen_url = Column(String, nullable=True)
    id_instructor = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=True, index=True)
    
    # Campos para integracion MS Learning o cursos propios
    es_ms_learning = Column(Boolean, default=False)
    external_url = Column(String, nullable=True)
    uid_ms = Column(String, nullable=True) # ID unico del catalogo de MS

    inscripciones = relationship("InscripcionCurso", back_populates="curso")
    instructor = relationship("Usuario", foreign_keys="[Curso.id_instructor]")

class InscripcionCurso(Base, AuditMixin):
    __tablename__ = "inscripciones_cursos"

    id_inscripcion_curso = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), index=True)
    id_curso = Column(Integer, ForeignKey("cursos.id_curso"), index=True)
    fecha_inscripcion = Column(DateTime, default=datetime.utcnow)
    progreso = Column(Integer, default=0)
    nota_final = Column(Numeric(5, 2), nullable=True)
    finalizado = Column(Boolean, default=False)
    id_pago = Column(Integer, ForeignKey("pagos.id_pago"), nullable=True, index=True)
    estado_inscripcion = Column(String, default="PENDIENTE")

    usuario = relationship("Usuario", back_populates="inscripciones_cursos", foreign_keys="[InscripcionCurso.id_usuario]")
    curso = relationship("Curso", back_populates="inscripciones")

class Pago(Base, AuditMixin):
    __tablename__ = "pagos"

    id_pago = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), index=True)
    monto = Column(Numeric(10, 2))
    fecha_pago = Column(DateTime, default=datetime.utcnow)
    metodo_pago = Column(String)
    estado_pago = Column(String, default="PENDIENTE")
    comprobante_url = Column(TEXT, nullable=True)
    id_referencia = Column(Integer)
    tipo_referencia = Column(String)
    
    validado_por = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=True, index=True)
    url_comprobante = Column(String, nullable=True)
    fecha_validacion = Column(DateTime, nullable=True)
    notas_admin = Column(TEXT, nullable=True)

    usuario = relationship("Usuario", back_populates="pagos", foreign_keys="[Pago.id_usuario]")
    validador = relationship("Usuario", foreign_keys="[Pago.validado_por]")

    __table_args__ = (
        CheckConstraint("monto >= 0", name="check_pago_monto_positivo"),
    )

class LogSistema(Base):
    __tablename__ = "logs_sistema"

    id_log = Column(Integer, primary_key=True, index=True)
    id_admin = Column(Integer, ForeignKey("usuarios.id_usuario"))
    accion = Column(String)
    tabla_afectada = Column(String)
    id_registro_afectado = Column(Integer)
    valor_anterior = Column(TEXT, nullable=True)
    valor_nuevo = Column(TEXT, nullable=True)
    fecha_hora = Column(DateTime, default=datetime.utcnow)
    ip_direccion = Column(String, nullable=True)

    admin = relationship("Usuario", back_populates="logs", foreign_keys="[LogSistema.id_admin]")

class Certificado(Base, AuditMixin):
    __tablename__ = "certificados"

    id_certificado = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
    id_curso = Column(Integer, ForeignKey("cursos.id_curso"), nullable=True)
    id_evento = Column(Integer, ForeignKey("eventos.id_evento"), nullable=True)
    uuid_verificacion = Column(String, default=lambda: str(uuid.uuid4()), unique=True)
    codigo_verificacion = Column(String, unique=True)
    fecha_emision = Column(DateTime, default=datetime.utcnow)
    url_pdf = Column(String)
    formato = Column(String, default="DIGITAL")
    entregado_fisico = Column(Boolean, default=False)
    es_ruta_linkedin = Column(Boolean, default=False)
    metadata_adicional = Column(TEXT, nullable=True)

    usuario = relationship("Usuario", back_populates="certificados", foreign_keys="[Certificado.id_usuario]")

    __table_args__ = (
        CheckConstraint("formato IN ('DIGITAL', 'FISICO', 'AMBOS')", name="certificados_formato_check"),
    )

class Recurso(Base, AuditMixin):
    __tablename__ = "recursos"

    id_recurso = Column(Integer, primary_key=True, index=True)
    titulo = Column(String)
    descripcion = Column(TEXT)
    url_descarga = Column(String, nullable=True)
    tipo_archivo = Column(String, nullable=True) # e.g., 'pdf', 'zip'
    tipo_recurso = Column(String, default="ARCHIVO") # ARCHIVO, VIDEO, BLOG, LINK
    contenido_md = Column(TEXT, nullable=True) # Para blogs/readmes
    categoria = Column(String) # VIP, SPEAKER, GENERAL
    id_curso = Column(Integer, ForeignKey("cursos.id_curso"), nullable=True)

    autor = relationship("Usuario", foreign_keys="[Recurso.creado_por]")
    curso = relationship("Curso", foreign_keys=[id_curso])

class Anuncio(Base, AuditMixin):
    __tablename__ = "anuncios"

    id_anuncio = Column(Integer, primary_key=True, index=True)
    titulo = Column(String)
    contenido = Column(TEXT)
    url_imagen = Column(String, nullable=True) # Agregado
    link_accion = Column(String, nullable=True) # Agregado (ej. para redireccionar a un evento)
    tipo = Column(String, default="INFO")
    fecha_publicacion = Column(DateTime, default=datetime.utcnow)
    id_autor = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=True)
    activo = Column(Boolean, default=True)

    autor = relationship("Usuario", foreign_keys="[Anuncio.id_autor]")

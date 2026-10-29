import pytest
from unittest.mock import MagicMock
from datetime import datetime
from app.services import auth_service
from app.models import models

def test_get_usuario_expediente_unit():
    db = MagicMock()
    admin = MagicMock(spec=models.Usuario)
    admin.rol = "ADMIN"

    user = MagicMock(spec=models.Usuario)
    user.id_usuario = 42
    user.nombres = "Alan"
    user.apellidos = "Mamani"
    user.correo = "alanmamanisumi@gmail.com"
    user.alias = "alan"
    user.foto_url = None
    user.rol = "MIEMBRO"
    user.activo = True
    user.id_estado = 2
    user.email_verificado = True
    user.codigo_verificacion = None
    user.motivo_suspension = None
    user.fecha_registro = datetime(2026, 10, 29, 12, 0, 0)
    user.bio = "Estudiante apasionado por la tecnología"
    user.institucion = "UMSA"
    user.estudia_en = "UMSA"
    user.tipo_entidad = "Estudiante"
    user.pais = "Bolivia"
    user.departamento = "La Paz"
    user.linkedin_url = None
    user.github_url = None
    user.facebook_url = None
    user.instagram_url = None
    user.tiktok_url = None
    user.learning_path_url = None
    user.perfil_publico = True

    # Setup queries
    # 1. db.query(models.Usuario).filter(...).first()
    query_usuario = MagicMock()
    query_usuario.filter.return_value.first.return_value = user

    # 2. inscripciones
    evento = MagicMock(spec=models.Evento)
    evento.id_evento = 101
    evento.titulo = "Kick Off NASA SPACE APPS"
    evento.tipo_evento = "HACKATHON"
    evento.fecha_inicio = datetime(2026, 10, 29, 15, 0, 0)
    evento.fecha_fin = None
    evento.hora_inicio = "15:00"
    evento.modalidad = "PRESENCIAL"
    evento.ubicacion = "Auditorio Central"
    evento.estado = "EN_CURSO"
    evento.imagen_url = None

    insc = MagicMock(spec=models.InscripcionEvento)
    insc.id_inscripcion = 1
    insc.id_evento = 101
    insc.evento = evento
    insc.asistio = True
    insc.fecha_inscripcion = datetime(2026, 10, 20)
    insc.estado_inscripcion = "CONFIRMADO"
    insc.fecha_validacion = datetime(2026, 10, 29, 15, 30, 0)
    insc.codigo_qr = "QR-ALAN-123"

    query_insc = MagicMock()
    query_insc.options.return_value.filter.return_value.order_by.return_value.all.return_value = [insc]

    # 3. pedidos
    prod = MagicMock(spec=models.Producto)
    prod.id_producto = 5
    prod.nombre = "Paquete Ugolyok KICK OFF SPACE APPS 2026"
    prod.imagen_url = None

    det = MagicMock(spec=models.PedidoDetalle)
    det.id_detalle = 10
    det.id_producto = 5
    det.producto = prod
    det.cantidad = 1
    det.precio_unitario = 50.0

    pago = MagicMock(spec=models.Pago)
    pago.metodo_pago = "QR"

    pedido = MagicMock(spec=models.Pedido)
    pedido.id_pedido = 88
    pedido.id_pago = 12
    pedido.fecha_pedido = datetime(2026, 10, 29, 15, 46, 0)
    pedido.total = 50.0
    pedido.estado = "COMPLETADO"
    pedido.id_evento = 101
    pedido.evento = evento
    pedido.pago = pago
    pedido.detalles = [det]

    query_pedidos = MagicMock()
    query_pedidos.options.return_value.filter.return_value.order_by.return_value.all.return_value = [pedido]

    # 4. badges
    badge = MagicMock(spec=models.Badge)
    badge.id_badge = 1
    badge.nombre_badge = "Early Adopter"
    badge.descripcion = "Primeros miembros"
    badge.imagen_url = "/badges/early.png"
    badge.puntos = 20

    ub = MagicMock(spec=models.UsuarioBadge)
    ub.id_usuario_badge = 7
    ub.id_badge = 1
    ub.badge = badge
    ub.fecha_obtencion = datetime(2026, 10, 29)

    query_badges = MagicMock()
    query_badges.options.return_value.filter.return_value.order_by.return_value.all.return_value = [ub]

    # 5. certificados
    query_cert = MagicMock()
    query_cert.filter.return_value.order_by.return_value.all.return_value = []

    # 6. cursos
    query_cursos = MagicMock()
    query_cursos.options.return_value.filter.return_value.order_by.return_value.all.return_value = []

    # 7. pagos
    query_pagos = MagicMock()
    query_pagos.filter.return_value.order_by.return_value.all.return_value = []

    def mock_query(model):
        if model == models.Usuario:
            return query_usuario
        if model == models.InscripcionEvento:
            return query_insc
        if model == models.Pedido:
            return query_pedidos
        if model == models.UsuarioBadge:
            return query_badges
        if model == models.Certificado:
            return query_cert
        if model == models.InscripcionCurso:
            return query_cursos
        if model == models.Pago:
            return query_pagos
        return MagicMock()

    db.query.side_effect = mock_query

    # Run function
    result = auth_service.get_usuario_expediente(db, admin, 42)

    assert result["usuario"]["nombres"] == "Alan"
    assert result["usuario"]["correo"] == "alanmamanisumi@gmail.com"
    assert result["resumen"]["total_eventos_inscritos"] == 1
    assert result["resumen"]["total_eventos_asistidos"] == 1
    assert result["resumen"]["total_compras"] == 1
    assert result["resumen"]["total_gastado"] == 50.0
    assert result["resumen"]["total_badges"] == 1

    assert len(result["eventos"]) == 1
    assert result["eventos"][0]["titulo"] == "Kick Off NASA SPACE APPS"
    assert result["eventos"][0]["asistio"] is True

    assert len(result["compras"]) == 1
    assert result["compras"][0]["total"] == 50.0
    assert result["compras"][0]["metodo_pago"] == "QR"
    assert result["compras"][0]["detalles"][0]["producto_nombre"] == "Paquete Ugolyok KICK OFF SPACE APPS 2026"
    assert result["compras"][0]["detalles"][0]["cantidad"] == 1

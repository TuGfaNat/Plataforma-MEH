import pytest
import uuid
import codecs
import csv
import io
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from main import app
from app.database import SessionLocal, engine
from app.models import models
from app.core import auth as auth_core
from app.core.permissions import ROLE_ADMIN, ROLE_ORGANIZADOR, ROLE_MIEMBRO

models.Base.metadata.create_all(bind=engine)
client = TestClient(app)

@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

def create_user(db: Session, rol="MIEMBRO") -> models.Usuario:
    unique = uuid.uuid4().hex[:8]
    user = models.Usuario(
        nombres=f"User_{unique}",
        apellidos="Test",
        correo=f"user_{unique}@test.com",
        password_hash=auth_core.get_password_hash("Password123!"),
        rol=rol,
        activo=True,
        email_verificado=True,
        id_estado=2
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_auth_token(user: models.Usuario) -> str:
    return auth_core.create_access_token(data={"sub": user.correo, "rol": user.rol})

def create_evento_con_cupo(db: Session, organizador: models.Usuario, capacidad=5, titulo="Evento Base") -> models.Evento:
    now_utc = datetime.now(timezone.utc).replace(tzinfo=None)
    evento = models.Evento(
        titulo=titulo,
        descripcion="Descripcion del evento base",
        tipo_evento="CONFERENCIA",
        fecha_inicio=now_utc + timedelta(days=2),
        fecha_fin=now_utc + timedelta(days=2, hours=4),
        hora_inicio="10:00",
        hora_fin="14:00",
        modalidad="PRESENCIAL",
        ubicacion="Auditorio Central",
        capacidad_max=capacidad,
        estado="PROGRAMADO",
        token_qr=f"EVENTO_{uuid.uuid4().hex[:10].upper()}",
        id_organizador=organizador.id_usuario,
        creado_por=organizador.id_usuario,
        id_estado=2,
        incluidos="Certificado, Refrigerio"
    )
    db.add(evento)
    db.commit()
    db.refresh(evento)
    return evento


# --------------------------------------------------------------------------
# 1. EXPORTACIÓN CSV CON UTF-8 BOM
# --------------------------------------------------------------------------

def test_export_inscritos_csv_success(db: Session):
    """Admin puede exportar CSV de inscritos con UTF-8 BOM, columnas y estado de asistencia."""
    admin = create_user(db, rol=ROLE_ADMIN)
    token = get_auth_token(admin)

    evento = create_evento_con_cupo(db, admin, capacidad=10, titulo="Conferencia Python")

    # Crear participantes: 1 asistio, 1 no asistio, 1 en espera
    u1 = create_user(db)
    u2 = create_user(db)
    u3 = create_user(db)

    now_utc = datetime.now(timezone.utc).replace(tzinfo=None)
    ins1 = models.InscripcionEvento(
        id_usuario=u1.id_usuario,
        id_evento=evento.id_evento,
        estado_inscripcion="CONFIRMADA",
        codigo_qr=f"QR_{uuid.uuid4().hex[:8]}",
        asistio=True,
        fecha_inscripcion=now_utc,
        id_estado=2
    )
    ins2 = models.InscripcionEvento(
        id_usuario=u2.id_usuario,
        id_evento=evento.id_evento,
        estado_inscripcion="CONFIRMADA",
        codigo_qr=f"QR_{uuid.uuid4().hex[:8]}",
        asistio=False,
        fecha_inscripcion=now_utc + timedelta(minutes=5),
        id_estado=2
    )
    ins3 = models.InscripcionEvento(
        id_usuario=u3.id_usuario,
        id_evento=evento.id_evento,
        estado_inscripcion="PENDIENTE_APROBACION",
        asistio=False,
        fecha_inscripcion=now_utc + timedelta(minutes=10),
        id_estado=2
    )
    db.add_all([ins1, ins2, ins3])
    db.commit()

    res = client.get(
        f"/eventos/{evento.id_evento}/inscritos.csv",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    assert f'filename="inscritos_evento_{evento.id_evento}.csv"' in res.headers.get("content-disposition", "")

    # Verificar que el contenido inicia con UTF-8 BOM
    content_bytes = res.content
    assert content_bytes.startswith(codecs.BOM_UTF8)

    # Decodificar y parsear CSV
    text_content = content_bytes.decode("utf-8-sig")
    reader = list(csv.reader(io.StringIO(text_content)))
    assert len(reader) >= 4  # Header + 3 inscritos

    header = reader[0]
    assert header == ["Nombre Completo", "Correo", "Estado Inscripcion", "Fecha Registro", "Codigo QR", "Estado Asistencia"]

    # Fila 1: Presente
    row1 = [r for r in reader[1:] if u1.correo in r][0]
    assert row1[1] == u1.correo
    assert row1[2] == "CONFIRMADA"
    assert row1[4] == ins1.codigo_qr
    assert row1[5] == "PRESENTE"

    # Fila 2: Ausente
    row2 = [r for r in reader[1:] if u2.correo in r][0]
    assert row2[1] == u2.correo
    assert row2[5] == "AUSENTE"

    # Fila 3: En espera
    row3 = [r for r in reader[1:] if u3.correo in r][0]
    assert row3[1] == u3.correo
    assert row3[2] == "PENDIENTE_APROBACION"
    assert row3[5] == "AUSENTE"


def test_export_inscritos_csv_forbidden_for_members(db: Session):
    """Miembros normales reciben 403 al intentar exportar CSV."""
    admin = create_user(db, rol=ROLE_ADMIN)
    member = create_user(db, rol=ROLE_MIEMBRO)
    token = get_auth_token(member)

    evento = create_evento_con_cupo(db, admin, capacidad=10)

    res = client.get(
        f"/eventos/{evento.id_evento}/inscritos.csv",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 403


# --------------------------------------------------------------------------
# 2. APROBACIÓN EN LOTE DE LISTA DE ESPERA
# --------------------------------------------------------------------------

def test_aprobar_lista_espera_lote_respects_cupos(db: Session):
    """Aprobación en lote solo aprueba la cantidad permitida por los cupos disponibles."""
    admin = create_user(db, rol=ROLE_ADMIN)
    token = get_auth_token(admin)

    # Evento con capacidad para 2
    evento = create_evento_con_cupo(db, admin, capacidad=2, titulo="Taller Limitado")

    u_conf = create_user(db)
    u_esp1 = create_user(db)
    u_esp2 = create_user(db)
    u_esp3 = create_user(db)

    now_utc = datetime.now(timezone.utc).replace(tzinfo=None)

    # 1 confirmado -> Queda 1 cupo disponible
    db.add(models.InscripcionEvento(
        id_usuario=u_conf.id_usuario,
        id_evento=evento.id_evento,
        estado_inscripcion="CONFIRMADA",
        codigo_qr=f"QR_{uuid.uuid4().hex[:8]}",
        fecha_inscripcion=now_utc,
        id_estado=2
    ))

    # 3 en lista de espera
    db.add(models.InscripcionEvento(
        id_usuario=u_esp1.id_usuario,
        id_evento=evento.id_evento,
        estado_inscripcion="PENDIENTE_APROBACION",
        fecha_inscripcion=now_utc + timedelta(minutes=1),
        id_estado=2
    ))
    db.add(models.InscripcionEvento(
        id_usuario=u_esp2.id_usuario,
        id_evento=evento.id_evento,
        estado_inscripcion="PENDIENTE_APROBACION",
        fecha_inscripcion=now_utc + timedelta(minutes=2),
        id_estado=2
    ))
    db.add(models.InscripcionEvento(
        id_usuario=u_esp3.id_usuario,
        id_evento=evento.id_evento,
        estado_inscripcion="PENDIENTE_APROBACION",
        fecha_inscripcion=now_utc + timedelta(minutes=3),
        id_estado=2
    ))
    db.commit()

    # Ejecutar aprobación en lote
    res = client.post(
        f"/eventos/{evento.id_evento}/aprobar-lista-espera",
        json={},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["aprobados"] == 1
    assert data["restantes_en_espera"] == 2
    assert data["cupos_disponibles"] == 0

    # u_esp1 debe estar ahora CONFIRMADO y con QR
    ins_esp1 = db.query(models.InscripcionEvento).filter_by(id_usuario=u_esp1.id_usuario, id_evento=evento.id_evento).first()
    assert ins_esp1.estado_inscripcion == "CONFIRMADA"
    assert ins_esp1.codigo_qr is not None

    # u_esp2 y u_esp3 deben seguir en PENDIENTE_APROBACION
    ins_esp2 = db.query(models.InscripcionEvento).filter_by(id_usuario=u_esp2.id_usuario, id_evento=evento.id_evento).first()
    assert ins_esp2.estado_inscripcion == "PENDIENTE_APROBACION"


def test_aprobar_lista_espera_lote_with_cantidad_param(db: Session):
    """Aprobación en lote con parámetro cantidad específico."""
    admin = create_user(db, rol=ROLE_ORGANIZADOR)
    token = get_auth_token(admin)

    evento = create_evento_con_cupo(db, admin, capacidad=10, titulo="Hackathon Amplio")

    now_utc = datetime.now(timezone.utc).replace(tzinfo=None)
    for i in range(4):
        u = create_user(db)
        db.add(models.InscripcionEvento(
            id_usuario=u.id_usuario,
            id_evento=evento.id_evento,
            estado_inscripcion="PENDIENTE_APROBACION",
            fecha_inscripcion=now_utc + timedelta(minutes=i),
            id_estado=2
        ))
    db.commit()

    # Aprobar solo 2 de los 4
    res = client.post(
        f"/eventos/{evento.id_evento}/aprobar-lista-espera",
        json={"cantidad": 2},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["aprobados"] == 2
    assert data["restantes_en_espera"] == 2
    assert data["cupos_disponibles"] == 8


def test_aprobar_lista_espera_lote_forbidden_for_members(db: Session):
    """Miembros no pueden aprobar lista de espera en lote (403)."""
    admin = create_user(db, rol=ROLE_ADMIN)
    member = create_user(db, rol=ROLE_MIEMBRO)
    token = get_auth_token(member)

    evento = create_evento_con_cupo(db, admin, capacidad=5)

    res = client.post(
        f"/eventos/{evento.id_evento}/aprobar-lista-espera",
        json={},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 403


# --------------------------------------------------------------------------
# 3. DUPLICAR EVENTO
# --------------------------------------------------------------------------

def test_duplicar_evento_success(db: Session):
    """Duplica un evento con su configuración, agenda, speakers y paquetes de pago, pero sin inscripciones."""
    admin = create_user(db, rol=ROLE_ADMIN)
    token = get_auth_token(admin)

    original = create_evento_con_cupo(db, admin, capacidad=50, titulo="IA Summit")
    original.agenda = '[{"hora":"09:00","titulo":"Bienvenida"},{"hora":"10:00","titulo":"Keynote"}]'
    
    # Asignar speaker
    spk = models.Speaker(nombre="Ada Lovelace", bio="Pionera", id_estado=2)
    db.add(spk)
    db.commit()
    original.speakers.append(spk)

    # Paquete de pago
    pkg = models.EventoPagoQR(
        id_evento=original.id_evento,
        nombre_paquete="Pase VIP",
        monto=150.0,
        url_qr="http://img.png",
        id_estado=2
    )
    db.add(pkg)

    # Inscripción en el evento original
    u_part = create_user(db)
    ins = models.InscripcionEvento(
        id_usuario=u_part.id_usuario,
        id_evento=original.id_evento,
        estado_inscripcion="CONFIRMADA",
        codigo_qr="ORIGINAL_QR_123",
        id_estado=2
    )
    db.add(ins)
    db.commit()

    # Ejecutar duplicación
    res = client.post(
        f"/eventos/{original.id_evento}/duplicar",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 201
    copia_data = res.json()

    assert copia_data["id_evento"] != original.id_evento
    assert copia_data["titulo"] == "IA Summit (Copia)"
    assert copia_data["capacidad_max"] == 50
    assert copia_data["agenda"] == original.agenda
    assert len(copia_data["speakers"]) == 1
    assert copia_data["speakers"][0]["nombre"] == "Ada Lovelace"
    assert copia_data["token_qr"] != original.token_qr

    # Verificar en BD que NO tiene inscripciones
    copia_id = copia_data["id_evento"]
    inscritos_copia = db.query(models.InscripcionEvento).filter_by(id_evento=copia_id).count()
    assert inscritos_copia == 0

    # Verificar que el paquete de pago fue clonado
    pkgs_copia = db.query(models.EventoPagoQR).filter_by(id_evento=copia_id, id_estado=2).all()
    assert len(pkgs_copia) == 1
    assert pkgs_copia[0].nombre_paquete == "Pase VIP"
    assert float(pkgs_copia[0].monto) == 150.0


def test_duplicar_evento_forbidden_for_members(db: Session):
    """Miembros no pueden duplicar eventos (403)."""
    admin = create_user(db, rol=ROLE_ADMIN)
    member = create_user(db, rol=ROLE_MIEMBRO)
    token = get_auth_token(member)

    evento = create_evento_con_cupo(db, admin, capacidad=20)

    res = client.post(
        f"/eventos/{evento.id_evento}/duplicar",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 403


# --------------------------------------------------------------------------
# 4. AUTO-APROBAR LISTA DE ESPERA AL AMPLIAR CUPOS
# --------------------------------------------------------------------------

def test_update_evento_auto_aprobar_espera(db: Session):
    """Actualizar capacidad con auto_aprobar_espera=True aprueba automáticamente la lista de espera."""
    admin = create_user(db, rol=ROLE_ADMIN)
    token = get_auth_token(admin)

    evento = create_evento_con_cupo(db, admin, capacidad=1, titulo="Conferencia Capacidad 1")

    u_conf = create_user(db)
    u_esp = create_user(db)
    now_utc = datetime.now(timezone.utc).replace(tzinfo=None)

    db.add(models.InscripcionEvento(
        id_usuario=u_conf.id_usuario,
        id_evento=evento.id_evento,
        estado_inscripcion="CONFIRMADA",
        codigo_qr=f"QR_{uuid.uuid4().hex[:8]}",
        fecha_inscripcion=now_utc,
        id_estado=2
    ))
    db.add(models.InscripcionEvento(
        id_usuario=u_esp.id_usuario,
        id_evento=evento.id_evento,
        estado_inscripcion="PENDIENTE_APROBACION",
        fecha_inscripcion=now_utc + timedelta(minutes=5),
        id_estado=2
    ))
    db.commit()

    # Ampliar capacidad a 5 con auto_aprobar_espera=True
    res = client.put(
        f"/eventos/{evento.id_evento}",
        json={"capacidad_max": 5, "auto_aprobar_espera": True},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200

    # u_esp debe haberse confirmado automáticamente
    ins_esp = db.query(models.InscripcionEvento).filter_by(id_usuario=u_esp.id_usuario, id_evento=evento.id_evento).first()
    assert ins_esp.estado_inscripcion == "CONFIRMADA"
    assert ins_esp.codigo_qr is not None

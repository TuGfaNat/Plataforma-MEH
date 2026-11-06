from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..models import models
from ..schemas import ecosistema as schema
from ..core.logging import registrar_log
from ..core.permissions import PERMISSION_EVENTS_MANAGE, has_permission
from ..core.exceptions import (
    RecursoNoEncontradoError,
    PermisoDenegadoError,
    ValidacionNegocioError,
    UsuarioNoEncontradoError
)

def _sync_user_secondary_role(usuario: models.Usuario, new_role: str):
    """Asigna el rol como principal si es MIEMBRO, o como secundario si ya tiene otro rol (para preservar voluntarios y staff)."""
    if not usuario:
        return
    if usuario.rol == "MIEMBRO":
        usuario.rol = new_role
    elif usuario.rol != new_role:
        secundarios = [r.strip() for r in (usuario.roles_secundarios or "").split(",") if r.strip()]
        if new_role not in secundarios:
            secundarios.append(new_role)
            usuario.roles_secundarios = ",".join(secundarios)

# --- SERVICIOS DE SPEAKERS ---
def sync_users_to_speakers(db: Session):
    """Sincroniza cualquier usuario que tenga rol SPEAKER (principal o secundario) en la tabla speakers."""
    spk_users = db.query(models.Usuario).filter(
        (models.Usuario.rol == "SPEAKER") | (models.Usuario.roles_secundarios.like("%SPEAKER%")),
        models.Usuario.id_estado != 0
    ).all()
    changed = False
    for u in spk_users:
        spk = db.query(models.Speaker).filter(models.Speaker.id_usuario == u.id_usuario).first()
        if not spk:
            nombre = f"{u.nombres or ''} {u.apellidos or ''}".strip() or u.alias or u.correo
            new_s = models.Speaker(
                id_usuario=u.id_usuario,
                nombre=nombre,
                bio=u.bio or "Speaker oficial de la comunidad MEH",
                foto_url=u.foto_url,
                trabajo_actual=u.institucion or u.estudia_en or "Comunidad MEH",
                correo_contacto=u.correo,
                id_estado=1
            )
            db.add(new_s)
            changed = True
        elif spk.id_estado == 0:
            spk.id_estado = 1
            changed = True
    if changed:
        db.commit()

def sync_users_to_mentores(db: Session):
    """Sincroniza cualquier usuario que tenga rol MENTOR (principal o secundario) en la tabla mentores."""
    mnt_users = db.query(models.Usuario).filter(
        (models.Usuario.rol == "MENTOR") | (models.Usuario.roles_secundarios.like("%MENTOR%")),
        models.Usuario.id_estado != 0
    ).all()
    changed = False
    for u in mnt_users:
        mnt = db.query(models.Mentor).filter(models.Mentor.id_usuario == u.id_usuario).first()
        if not mnt:
            nombre = f"{u.nombres or ''} {u.apellidos or ''}".strip() or u.alias or u.correo
            new_m = models.Mentor(
                id_usuario=u.id_usuario,
                nombre=nombre,
                bio=u.bio or "Mentor oficial de la comunidad MEH",
                foto_url=u.foto_url,
                trabajo_actual=u.institucion or u.estudia_en or "Comunidad MEH",
                area_mentoria=getattr(u, 'especialidad', None) or "Mentoría Técnica",
                correo_contacto=u.correo,
                id_estado=1
            )
            db.add(new_m)
            changed = True
        elif mnt.id_estado == 0:
            mnt.id_estado = 1
            changed = True
    if changed:
        db.commit()

def list_speakers(db: Session) -> List[models.Speaker]:
    sync_users_to_speakers(db)
    return db.query(models.Speaker).filter(models.Speaker.id_estado != 0).order_by(models.Speaker.id_speaker.desc()).all()

def create_speaker(db: Session, admin_user: models.Usuario, data: schema.SpeakerCreate, ip: str = None) -> models.Speaker:
    if not has_permission(admin_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError()
    
    dump = data.model_dump()
    if data.id_usuario:
        linked_u = db.query(models.Usuario).filter(models.Usuario.id_usuario == data.id_usuario).first()
        if linked_u:
            _sync_user_secondary_role(linked_u, "SPEAKER")

    obj = models.Speaker(**dump)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    
    registrar_log(db, admin_user.id_usuario, "CREAR_SPEAKER", "speakers", obj.id_speaker, valor_nuevo=dump, ip_direccion=ip)
    return obj

def update_speaker(db: Session, id_obj: int, admin_user: models.Usuario, data: schema.SpeakerUpdate, ip: str = None) -> models.Speaker:
    if not has_permission(admin_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError()
    
    obj = db.query(models.Speaker).filter(models.Speaker.id_speaker == id_obj).first()
    if not obj: raise RecursoNoEncontradoError()

    dump = data.model_dump(exclude_unset=True)
    old_data = {k: getattr(obj, k) for k in dump.keys()}

    if "id_usuario" in dump and dump["id_usuario"]:
        linked_u = db.query(models.Usuario).filter(models.Usuario.id_usuario == dump["id_usuario"]).first()
        if linked_u:
            _sync_user_secondary_role(linked_u, "SPEAKER")

    for key, value in dump.items():
        setattr(obj, key, value)
    
    db.commit()
    db.refresh(obj)
    
    registrar_log(db, admin_user.id_usuario, "ACTUALIZAR_SPEAKER", "speakers", id_obj, valor_anterior=old_data, valor_nuevo=dump, ip_direccion=ip)
    return obj

def delete_speaker(db: Session, id_obj: int, admin_user: models.Usuario) -> None:
    if not has_permission(admin_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError()
    obj = db.query(models.Speaker).filter(models.Speaker.id_speaker == id_obj).first()
    if not obj: raise RecursoNoEncontradoError()
    obj.id_estado = 0
    db.commit()
    registrar_log(db, admin_user.id_usuario, "BORRAR_SPEAKER", "speakers", id_obj)

# --- SERVICIOS DE MENTORES ---
def list_mentores(db: Session) -> List[models.Mentor]:
    sync_users_to_mentores(db)
    return db.query(models.Mentor).filter(models.Mentor.id_estado != 0).order_by(models.Mentor.id_mentor.desc()).all()

def create_mentor(db: Session, admin_user: models.Usuario, data: schema.MentorCreate, ip: str = None) -> models.Mentor:
    if not has_permission(admin_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError()
    
    dump = data.model_dump()
    if data.id_usuario:
        linked_u = db.query(models.Usuario).filter(models.Usuario.id_usuario == data.id_usuario).first()
        if linked_u:
            _sync_user_secondary_role(linked_u, "MENTOR")

    obj = models.Mentor(**dump)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    
    registrar_log(db, admin_user.id_usuario, "CREAR_MENTOR", "mentores", obj.id_mentor, valor_nuevo=dump, ip_direccion=ip)
    return obj

def update_mentor(db: Session, id_obj: int, admin_user: models.Usuario, data: schema.MentorUpdate, ip: str = None) -> models.Mentor:
    if not has_permission(admin_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError()
    
    obj = db.query(models.Mentor).filter(models.Mentor.id_mentor == id_obj).first()
    if not obj: raise RecursoNoEncontradoError()

    dump = data.model_dump(exclude_unset=True)
    old_data = {k: getattr(obj, k) for k in dump.keys()}

    if "id_usuario" in dump and dump["id_usuario"]:
        linked_u = db.query(models.Usuario).filter(models.Usuario.id_usuario == dump["id_usuario"]).first()
        if linked_u:
            _sync_user_secondary_role(linked_u, "MENTOR")

    for key, value in dump.items():
        setattr(obj, key, value)
    
    db.commit()
    db.refresh(obj)
    
    registrar_log(db, admin_user.id_usuario, "ACTUALIZAR_MENTOR", "mentores", id_obj, valor_anterior=old_data, valor_nuevo=dump, ip_direccion=ip)
    return obj

def delete_mentor(db: Session, id_obj: int, admin_user: models.Usuario) -> None:
    if not has_permission(admin_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError()
    obj = db.query(models.Mentor).filter(models.Mentor.id_mentor == id_obj).first()
    if not obj: raise RecursoNoEncontradoError()
    obj.id_estado = 0
    db.commit()
    registrar_log(db, admin_user.id_usuario, "BORRAR_MENTOR", "mentores", id_obj)

# --- SERVICIOS DE AUSPICIADORES ---
def list_auspiciadores(db: Session) -> List[models.Auspiciador]:
    return db.query(models.Auspiciador).order_by(models.Auspiciador.id_auspiciador.desc()).all()

def create_auspiciador(db: Session, admin_user: models.Usuario, data: schema.AuspiciadorCreate, ip: str = None) -> models.Auspiciador:
    if not has_permission(admin_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError()
    obj = models.Auspiciador(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    registrar_log(db, admin_user.id_usuario, "CREAR_AUSPICIADOR", "auspiciadores", obj.id_auspiciador, valor_nuevo=data.model_dump(), ip_direccion=ip)
    return obj

def update_auspiciador(db: Session, id_obj: int, admin_user: models.Usuario, data: schema.AuspiciadorUpdate, ip: str = None) -> models.Auspiciador:
    if not has_permission(admin_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError()
    obj = db.query(models.Auspiciador).filter(models.Auspiciador.id_auspiciador == id_obj).first()
    if not obj: raise RecursoNoEncontradoError()
    old_data = {k: getattr(obj, k) for k in data.model_dump(exclude_unset=True).keys()}
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    registrar_log(db, admin_user.id_usuario, "ACTUALIZAR_AUSPICIADOR", "auspiciadores", id_obj, valor_anterior=old_data, valor_nuevo=data.model_dump(exclude_unset=True), ip_direccion=ip)
    return obj

def delete_auspiciador(db: Session, id_obj: int, admin_user: models.Usuario) -> None:
    if not has_permission(admin_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError()
    obj = db.query(models.Auspiciador).filter(models.Auspiciador.id_auspiciador == id_obj).first()
    if not obj: raise RecursoNoEncontradoError()
    obj.id_estado = 0
    db.commit()
    registrar_log(db, admin_user.id_usuario, "BORRAR_AUSPICIADOR", "auspiciadores", id_obj)

# --- SERVICIOS DE COMUNIDADES ---
def list_comunidades(db: Session) -> List[models.ComunidadAliada]:
    return db.query(models.ComunidadAliada).order_by(models.ComunidadAliada.id_comunidad.desc()).all()

def create_comunidad(db: Session, admin_user: models.Usuario, data: schema.ComunidadCreate, ip: str = None) -> models.ComunidadAliada:
    if not has_permission(admin_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError()
    obj = models.ComunidadAliada(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    registrar_log(db, admin_user.id_usuario, "CREAR_COMUNIDAD", "comunidades_aliadas", obj.id_comunidad, valor_nuevo=data.model_dump(), ip_direccion=ip)
    return obj

def update_comunidad(db: Session, id_obj: int, admin_user: models.Usuario, data: schema.ComunidadUpdate, ip: str = None) -> models.ComunidadAliada:
    if not has_permission(admin_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError()
    obj = db.query(models.ComunidadAliada).filter(models.ComunidadAliada.id_comunidad == id_obj).first()
    if not obj: raise RecursoNoEncontradoError()
    old_data = {k: getattr(obj, k) for k in data.model_dump(exclude_unset=True).keys()}
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    registrar_log(db, admin_user.id_usuario, "ACTUALIZAR_COMUNIDAD", "comunidades_aliadas", id_obj, valor_anterior=old_data, valor_nuevo=data.model_dump(exclude_unset=True), ip_direccion=ip)
    return obj

def delete_comunidad(db: Session, id_obj: int, admin_user: models.Usuario) -> None:
    if not has_permission(admin_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError()
    obj = db.query(models.ComunidadAliada).filter(models.ComunidadAliada.id_comunidad == id_obj).first()
    if not obj: raise RecursoNoEncontradoError()
    obj.id_estado = 0
    db.commit()
    registrar_log(db, admin_user.id_usuario, "BORRAR_COMUNIDAD", "comunidades_aliadas", id_obj)

# --- SERVICIOS DE VOLUNTARIOS DEL ECOSISTEMA ---
def list_voluntarios(db: Session) -> List[dict]:
    """Lista todos los miembros del ecosistema con rol o designación de Voluntario."""
    voluntarios = db.query(models.Usuario).filter(
        (models.Usuario.rol == "VOLUNTARIO") | (models.Usuario.roles_secundarios.like("%VOLUNTARIO%")),
        models.Usuario.activo == True,
        models.Usuario.id_estado != 0
    ).order_by(models.Usuario.id_usuario.desc()).all()
    
    res = []
    for u in voluntarios:
        es_spk = db.query(models.Speaker).filter(models.Speaker.id_usuario == u.id_usuario, models.Speaker.id_estado != 0).first()
        es_mnt = db.query(models.Mentor).filter(models.Mentor.id_usuario == u.id_usuario, models.Mentor.id_estado != 0).first()
        
        all_roles = [u.rol]
        if u.roles_secundarios:
            for r in u.roles_secundarios.split(","):
                r = r.strip()
                if r and r not in all_roles:
                    all_roles.append(r)
        if es_spk and "SPEAKER" not in all_roles:
            all_roles.append("SPEAKER")
        if es_mnt and "MENTOR" not in all_roles:
            all_roles.append("MENTOR")
            
        res.append({
            "id_usuario": u.id_usuario,
            "nombres": u.nombres,
            "apellidos": u.apellidos,
            "nombre_completo": f"{u.nombres} {u.apellidos}",
            "correo": u.correo,
            "foto_url": u.foto_url,
            "rol_principal": u.rol,
            "roles": all_roles,
            "institucion": u.institucion,
            "es_speaker": bool(es_spk),
            "speaker_info": {"id_speaker": es_spk.id_speaker, "nombre": es_spk.nombre} if es_spk else None,
            "es_mentor": bool(es_mnt),
            "mentor_info": {"id_mentor": es_mnt.id_mentor, "area_mentoria": es_mnt.area_mentoria} if es_mnt else None,
            "fecha_registro": u.fecha_registro.isoformat() if u.fecha_registro else None
        })
    return res

def asignar_voluntario(db: Session, admin_user: models.Usuario, id_usuario: int, ip: str = None) -> dict:
    """Designa a un usuario registrado como Voluntario (soporta doble rol)."""
    if not has_permission(admin_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError()
    
    usuario = db.query(models.Usuario).filter(models.Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise UsuarioNoEncontradoError()

    if usuario.rol == "MIEMBRO":
        usuario.rol = "VOLUNTARIO"
    else:
        secundarios = [r.strip() for r in (usuario.roles_secundarios or "").split(",") if r.strip()]
        if "VOLUNTARIO" not in secundarios and usuario.rol != "VOLUNTARIO":
            secundarios.append("VOLUNTARIO")
            usuario.roles_secundarios = ",".join(secundarios)

    db.commit()
    db.refresh(usuario)
    registrar_log(db, admin_user.id_usuario, "ASIGNAR_VOLUNTARIO", "usuarios", id_usuario, valor_nuevo={"rol": usuario.rol, "roles_secundarios": usuario.roles_secundarios}, ip_direccion=ip)
    return {"status": "ok", "message": f"{usuario.nombres} {usuario.apellidos} asignado como Voluntario"}

def remover_voluntario(db: Session, admin_user: models.Usuario, id_usuario: int, ip: str = None) -> dict:
    """Remueve la designación de voluntario a un usuario preservando sus otros roles."""
    if not has_permission(admin_user.rol, PERMISSION_EVENTS_MANAGE):
        raise PermisoDenegadoError()
    
    usuario = db.query(models.Usuario).filter(models.Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise UsuarioNoEncontradoError()

    if usuario.rol == "VOLUNTARIO":
        usuario.rol = "MIEMBRO"
    
    if usuario.roles_secundarios:
        secundarios = [r.strip() for r in usuario.roles_secundarios.split(",") if r.strip() and r.strip() != "VOLUNTARIO"]
        usuario.roles_secundarios = ",".join(secundarios) if secundarios else None

    db.commit()
    db.refresh(usuario)
    registrar_log(db, admin_user.id_usuario, "REMOVER_VOLUNTARIO", "usuarios", id_usuario, valor_nuevo={"rol": usuario.rol, "roles_secundarios": usuario.roles_secundarios}, ip_direccion=ip)
    return {"status": "ok", "message": "Designación de voluntario removida"}

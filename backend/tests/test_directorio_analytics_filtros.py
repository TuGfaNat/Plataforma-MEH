import pytest
import uuid
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from main import app
from app.database import SessionLocal
from app.models import models
from app.core import auth as auth_core

client = TestClient(app)

def create_user(db, rol="MIEMBRO", nombres="Test", apellidos="User"):
    unique_id = uuid.uuid4().hex[:8]
    user = models.Usuario(
        nombres=f"{nombres}_{unique_id}",
        apellidos=f"{apellidos}_{unique_id}",
        correo=f"user_{unique_id}@test.com",
        password_hash="fake_hash",
        rol=rol,
        activo=True,
        id_estado=2,
        email_verificado=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def create_token(user):
    return auth_core.create_access_token(data={"sub": user.correo, "rol": user.rol})

def test_directorio_miembros_metricas_y_permisos():
    """Valida el endpoint de directorio de miembros:
    - Métricas: nivel derivado de badges, # asistencias, # compras, # cursos, badges.
    - Seguridad: 403 Forbidden para MIEMBRO, 200 OK para ADMIN y ORGANIZADOR.
    - Buscador por nombre y orden por columnas.
    """
    db = SessionLocal()
    try:
        # 1. Crear usuarios con roles
        admin = create_user(db, rol="ADMIN", nombres="Admin", apellidos="General")
        organizador = create_user(db, rol="ORGANIZADOR", nombres="Org", apellidos="Principal")
        miembro_1 = create_user(db, rol="MIEMBRO", nombres="Ana", apellidos="Zapata")
        miembro_2 = create_user(db, rol="MIEMBRO", nombres="Bernardo", apellidos="Alvarez")

        admin_token = create_token(admin)
        org_token = create_token(organizador)
        miembro_token = create_token(miembro_1)

        # 2. Asignar Badges con diferentes requisito_nivel a miembro_1 y miembro_2
        badge_beginner = models.Badge(
            nombre_badge="Novato MEH",
            requisito_nivel="Beginner",
            puntos=10,
            imagen_url="http://img/novato.png",
            id_estado=2
        )
        badge_master = models.Badge(
            nombre_badge="Azure Master",
            requisito_nivel="Master",
            puntos=50,
            imagen_url="http://img/master.png",
            id_estado=2
        )
        badge_legend = models.Badge(
            nombre_badge="Legend Dev",
            requisito_nivel="Legend",
            puntos=100,
            imagen_url="http://img/legend.png",
            id_estado=2
        )
        db.add(badge_beginner)
        db.add(badge_master)
        db.add(badge_legend)
        db.commit()

        # Miembro 1 tiene Beginner y Master -> nivel derivado debe ser Master
        ub1 = models.UsuarioBadge(id_usuario=miembro_1.id_usuario, id_badge=badge_beginner.id_badge, id_estado=2)
        ub2 = models.UsuarioBadge(id_usuario=miembro_1.id_usuario, id_badge=badge_master.id_badge, id_estado=2)
        # Miembro 2 tiene Legend -> nivel derivado debe ser Legend
        ub3 = models.UsuarioBadge(id_usuario=miembro_2.id_usuario, id_badge=badge_legend.id_badge, id_estado=2)
        db.add_all([ub1, ub2, ub3])

        # 3. Asignar asistencias a eventos
        ev1 = models.Evento(
            titulo="Evento Test Directorio 1",
            descripcion="Desc 1",
            modalidad="VIRTUAL",
            estado="FINALIZADO",
            fecha_inicio=datetime.utcnow() - timedelta(days=2),
            fecha_fin=datetime.utcnow() - timedelta(days=2, hours=-2),
            capacidad_max=50,
            id_estado=2
        )
        ev2 = models.Evento(
            titulo="Evento Test Directorio 2",
            descripcion="Desc 2",
            modalidad="PRESENCIAL",
            estado="FINALIZADO",
            fecha_inicio=datetime.utcnow() - timedelta(days=1),
            fecha_fin=datetime.utcnow() - timedelta(days=1, hours=-2),
            capacidad_max=50,
            id_estado=2
        )
        db.add_all([ev1, ev2])
        db.commit()

        # Miembro 1 asistió a 2 eventos
        ins1 = models.InscripcionEvento(id_usuario=miembro_1.id_usuario, id_evento=ev1.id_evento, asistio=True, id_estado=2)
        ins2 = models.InscripcionEvento(id_usuario=miembro_1.id_usuario, id_evento=ev2.id_evento, asistio=True, id_estado=2)
        # Miembro 2 inscrito pero NO asistió
        ins3 = models.InscripcionEvento(id_usuario=miembro_2.id_usuario, id_evento=ev1.id_evento, asistio=False, id_estado=2)
        db.add_all([ins1, ins2, ins3])

        # 4. Asignar compras (Pedido)
        ped1 = models.Pedido(id_usuario=miembro_1.id_usuario, total=120.0, estado="COMPLETADO", id_estado=2)
        ped2 = models.Pedido(id_usuario=miembro_1.id_usuario, total=80.0, estado="COMPLETADO", id_estado=2)
        ped3 = models.Pedido(id_usuario=miembro_2.id_usuario, total=50.0, estado="COMPLETADO", id_estado=2)
        db.add_all([ped1, ped2, ped3])

        # 5. Asignar cursos (InscripcionCurso)
        curso1 = models.Curso(nombre_curso="Curso FastAPI", horas_academicas=20, estado="ACTIVO", id_estado=2)
        db.add(curso1)
        db.commit()

        ic1 = models.InscripcionCurso(id_usuario=miembro_1.id_usuario, id_curso=curso1.id_curso, progreso=100.0, finalizado=True, nota_final=90.0, id_estado=2)
        db.add(ic1)
        db.commit()

        # --- TEST 1: Seguridad 403 Forbidden para MIEMBRO ---
        res_miembro = client.get("/usuarios/directorio", headers={"Authorization": f"Bearer {miembro_token}"})
        assert res_miembro.status_code == 403
        assert "No tienes privilegios" in res_miembro.json()["detail"]

        # --- TEST 2: Acceso 200 OK para ADMIN y ORGANIZADOR ---
        res_admin = client.get("/usuarios/directorio", headers={"Authorization": f"Bearer {admin_token}"})
        assert res_admin.status_code == 200
        data_admin = res_admin.json()
        assert isinstance(data_admin, list)

        res_org = client.get("/auth/directorio", headers={"Authorization": f"Bearer {org_token}"})
        assert res_org.status_code == 200

        res_dash = client.get("/dashboard/directorio", headers={"Authorization": f"Bearer {admin_token}"})
        assert res_dash.status_code == 200

        # --- TEST 3: Verificación de métricas por miembro ---
        m1_data = next((u for u in data_admin if u["id_usuario"] == miembro_1.id_usuario), None)
        assert m1_data is not None
        assert m1_data["nivel"] == "Master"  # Derivado de sus badges (Master > Beginner)
        assert m1_data["asistencias"] == 2
        assert m1_data["compras"] == 2
        assert m1_data["cursos"] == 1
        assert len(m1_data["badges"]) == 2

        m2_data = next((u for u in data_admin if u["id_usuario"] == miembro_2.id_usuario), None)
        assert m2_data is not None
        assert m2_data["nivel"] == "Legend"
        assert m2_data["asistencias"] == 0
        assert m2_data["compras"] == 1
        assert m2_data["cursos"] == 0

        # --- TEST 4: Buscador por texto (q / search) ---
        res_search = client.get(f"/usuarios/directorio?q={miembro_1.nombres}", headers={"Authorization": f"Bearer {admin_token}"})
        assert res_search.status_code == 200
        search_data = res_search.json()
        assert len(search_data) == 1
        assert search_data[0]["id_usuario"] == miembro_1.id_usuario

        # --- TEST 5: Orden por columnas ---
        # Ordenar por asistencias desc: miembro_1 (2) debe aparecer antes que miembro_2 (0)
        res_sort_asist = client.get("/usuarios/directorio?sort_by=asistencias&sort_order=desc&limit=2000", headers={"Authorization": f"Bearer {admin_token}"})
        assert res_sort_asist.status_code == 200
        sort_data = res_sort_asist.json()
        idx_m1 = next(i for i, u in enumerate(sort_data) if u["id_usuario"] == miembro_1.id_usuario)
        idx_m2 = next(i for i, u in enumerate(sort_data) if u["id_usuario"] == miembro_2.id_usuario)
        assert idx_m1 < idx_m2

    finally:
        db.close()


def test_analytics_dashboard_stats_con_filtros_and_y_seguridad():
    """Valida GET /dashboard/stats con filtros combinados en conjunción AND:
    - Sin filtros: KPIs globales (is_filtered=False).
    - Con filtros (q, fechas, modalidad, estado, id_eventos): KPIs recalculados sobre el subconjunto.
    - Conjunción AND: si un evento no cumple uno de los filtros, no entra en el subconjunto.
    - Seguridad: 403 Forbidden para MIEMBRO, 200 OK para ADMIN y ORGANIZADOR.
    """
    db = SessionLocal()
    try:
        admin = create_user(db, rol="ADMIN", nombres="Admin", apellidos="Stats")
        organizador = create_user(db, rol="ORGANIZADOR", nombres="Org", apellidos="Stats")
        miembro = create_user(db, rol="MIEMBRO", nombres="Normal", apellidos="User")

        admin_token = create_token(admin)
        org_token = create_token(organizador)
        miembro_token = create_token(miembro)

        # Crear eventos para probar conjunción AND con prefijo único
        unique_prefix = f"Py_{uuid.uuid4().hex[:6]}"
        base_time = datetime(2026, 8, 15, 10, 0, 0)

        # Evento A: VIRTUAL, PROGRAMADO, Agosto 2026, Título con prefijo
        ev_a = models.Evento(
            titulo=f"Taller {unique_prefix} Avanzado",
            descripcion="Aprende Python",
            modalidad="VIRTUAL",
            estado="PROGRAMADO",
            fecha_inicio=base_time,
            fecha_fin=base_time + timedelta(hours=3),
            capacidad_max=100,
            id_estado=2
        )
        # Evento B: VIRTUAL, FINALIZADO, Agosto 2026, Título con prefijo
        ev_b = models.Evento(
            titulo=f"Taller {unique_prefix} Básico",
            descripcion="Introducción a Python",
            modalidad="VIRTUAL",
            estado="FINALIZADO",
            fecha_inicio=base_time + timedelta(days=2),
            fecha_fin=base_time + timedelta(days=2, hours=3),
            capacidad_max=80,
            id_estado=2
        )
        # Evento C: PRESENCIAL, PROGRAMADO, Septiembre 2026, Título con prefijo
        ev_c = models.Evento(
            titulo=f"Hackathon {unique_prefix} Presencial",
            descripcion="Hackathon en La Paz",
            modalidad="PRESENCIAL",
            estado="PROGRAMADO",
            fecha_inicio=datetime(2026, 9, 20, 9, 0, 0),
            fecha_fin=datetime(2026, 9, 20, 18, 0, 0),
            capacidad_max=60,
            id_estado=2
        )
        db.add_all([ev_a, ev_b, ev_c])
        db.commit()

        # Inscribir y registrar asistencias y pagos en ev_a
        u1 = create_user(db)
        u2 = create_user(db)
        u3 = create_user(db)

        pago_a1 = models.Pago(id_usuario=u1.id_usuario, monto=150.0, estado_pago="APROBADO", metodo_pago="QR", id_referencia=ev_a.id_evento, tipo_referencia="EVENTO", id_estado=2)
        pago_a2 = models.Pago(id_usuario=u2.id_usuario, monto=150.0, estado_pago="APROBADO", metodo_pago="TRANSFERENCIA", id_referencia=ev_a.id_evento, tipo_referencia="EVENTO", id_estado=2)
        db.add_all([pago_a1, pago_a2])
        db.commit()

        ins_a1 = models.InscripcionEvento(id_usuario=u1.id_usuario, id_evento=ev_a.id_evento, asistio=True, id_pago=pago_a1.id_pago, id_estado=2)
        ins_a2 = models.InscripcionEvento(id_usuario=u2.id_usuario, id_evento=ev_a.id_evento, asistio=True, id_pago=pago_a2.id_pago, id_estado=2)
        ins_a3 = models.InscripcionEvento(id_usuario=u3.id_usuario, id_evento=ev_a.id_evento, asistio=False, id_estado=2)

        # Inscribir en ev_b
        ins_b1 = models.InscripcionEvento(id_usuario=u1.id_usuario, id_evento=ev_b.id_evento, asistio=True, id_estado=2)

        # Inscribir en ev_c
        ins_c1 = models.InscripcionEvento(id_usuario=u3.id_usuario, id_evento=ev_c.id_evento, asistio=True, id_estado=2)

        db.add_all([ins_a1, ins_a2, ins_a3, ins_b1, ins_c1])
        db.commit()

        # --- TEST 1: Seguridad RBAC (403 para MIEMBRO, 200 para ORGANIZADOR y ADMIN) ---
        res_miembro = client.get("/dashboard/stats", headers={"Authorization": f"Bearer {miembro_token}"})
        assert res_miembro.status_code == 403

        res_org = client.get("/dashboard/stats", headers={"Authorization": f"Bearer {org_token}"})
        assert res_org.status_code == 200

        res_admin = client.get("/dashboard/stats", headers={"Authorization": f"Bearer {admin_token}"})
        assert res_admin.status_code == 200
        global_data = res_admin.json()
        assert global_data["is_filtered"] is False
        assert global_data["indicador_filtrado"] == "Globales"
        assert global_data["kpis"]["total_eventos"] >= 3

        # --- TEST 2: Filtro por modalidad (VIRTUAL) con q=unique_prefix ---
        res_modalidad = client.get(f"/dashboard/stats?q={unique_prefix}&modalidad=VIRTUAL", headers={"Authorization": f"Bearer {admin_token}"})
        assert res_modalidad.status_code == 200
        mod_data = res_modalidad.json()
        assert mod_data["is_filtered"] is True
        assert mod_data["indicador_filtrado"] == "KPIs filtrados"
        # Todos los eventos en asistencia_series deben ser VIRTUAL (ev_a y ev_b, no ev_c)
        serie_ids = [e["id_evento"] for e in mod_data["asistencia_series"]]
        assert ev_a.id_evento in serie_ids
        assert ev_b.id_evento in serie_ids
        assert ev_c.id_evento not in serie_ids

        # --- TEST 3: Conjunción AND: q=unique_prefix AND modalidad="VIRTUAL" AND estado="PROGRAMADO" ---
        res_and = client.get(
            f"/dashboard/stats?q={unique_prefix}&modalidad=VIRTUAL&estado=PROGRAMADO&fecha_inicio=2026-08-01&fecha_fin=2026-08-31",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res_and.status_code == 200
        and_data = res_and.json()
        assert and_data["is_filtered"] is True
        assert and_data["indicador_filtrado"] == "KPIs filtrados"
        assert and_data["kpis"]["total_eventos"] == 1
        assert and_data["asistencia_series"][0]["id_evento"] == ev_a.id_evento
        assert and_data["kpis"]["total_inscripciones_eventos"] == 3
        assert and_data["kpis"]["total_asistencias_eventos"] == 2
        assert and_data["kpis"]["tasa_conversion_asistencia"] == round((2 / 3) * 100, 2)
        assert and_data["kpis"]["ingresos_totales"] == 300.0  # 150 + 150 de ev_a

        # --- TEST 4: Conjunción AND que no coincide con ningún evento ---
        res_empty = client.get(
            f"/dashboard/stats?q=Inexistente_{uuid.uuid4().hex[:6]}&modalidad=PRESENCIAL",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res_empty.status_code == 200
        empty_data = res_empty.json()
        assert empty_data["is_filtered"] is True
        assert empty_data["kpis"]["total_eventos"] == 0
        assert empty_data["kpis"]["total_inscripciones_eventos"] == 0
        assert empty_data["kpis"]["ingresos_totales"] == 0.0
        assert len(empty_data["asistencia_series"]) == 0

        # --- TEST 5: Filtro por id_eventos ---
        res_ids = client.get(
            f"/dashboard/stats?id_eventos={ev_b.id_evento}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res_ids.status_code == 200
        ids_data = res_ids.json()
        assert ids_data["is_filtered"] is True
        assert ids_data["kpis"]["total_eventos"] == 1
        assert ids_data["asistencia_series"][0]["id_evento"] == ev_b.id_evento
        assert ids_data["kpis"]["total_inscripciones_eventos"] == 1
        assert ids_data["kpis"]["total_asistencias_eventos"] == 1

        # --- TEST 6: Compatibilidad con /reports/dashboard-stats ---
        res_rep = client.get(
            f"/reports/dashboard-stats?modalidad=PRESENCIAL",
            headers={"Authorization": f"Bearer {org_token}"}
        )
        assert res_rep.status_code == 200
        rep_data = res_rep.json()
        assert rep_data["is_filtered"] is True
        rep_ids = [e["id_evento"] for e in rep_data["asistencia_series"]]
        assert ev_c.id_evento in rep_ids
        assert ev_a.id_evento not in rep_ids

    finally:
        db.close()

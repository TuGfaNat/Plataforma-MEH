---
id: index-05-apendices
title: 05. Apéndices
---

# Apéndices

## 1. Migraciones Alembic (Historial)
El sistema cuenta con un historial de migraciones estrictamente basado en enteros secuenciales.

1. `0676e55518a7_initial_clean_baseline.py`
2. `176e2e42d2cb_add_speaker_social_fields.py`
3. `19edfe311d60_expand_recurso_model.py`
4. `46f3ac215fad_add_contact_fields_to_ecosystem.py`
5. `5d648885e1d4_create_academia_lms_tables.py`
6. `8b9b66e59fb9_add_portada_to_recurso.py`
7. `b4aeb44856a7_add_event_advanced_fields.py`
8. `fbe03e1faad8_fix_schema_typos_and_constraints.py`

## 2. Despliegue en Render
El proyecto incluye un `render.yaml` que orquesta la infraestructura de la base de datos gestionada, el backend FastAPI y el frontend servido mediante proxy o CDN.

:::tip Despliegue
Se usa `uvicorn app.main:app --host 0.0.0.0 --port 10000` en entornos Render.
:::

## 3. Seguridad
La seguridad implementada es **JWT estricto** utilizando `python-jose` con el algoritmo **HS256**.

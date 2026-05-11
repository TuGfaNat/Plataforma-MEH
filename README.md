# Plataforma-MEH
Proyecto de grado para la Licenciatura en informatica

## Variables de entorno (Frontend)

Crear `frontend/.env` a partir de `frontend/.env.example`.

- `VITE_API_URL`: URL base del backend.
- `VITE_I18N_DEFAULT_LANG`: idioma por defecto (`es` o `en`).
- `VITE_I18N_SUPPORTED_LANGS`: idiomas habilitados separados por coma (ejemplo: `es,en`).
- `VITE_TRANSLATIONS_API_URL` (opcional): endpoint para cargar traducciones remotas (`/es.json`, `/en.json`).

## Roles y acceso (RBAC)

- `VISITANTE` (sin cuenta): solo vistas públicas, registro/login.
- `MIEMBRO`: área personal, inscripción a eventos/cursos, pagos/certificados propios.
- `EMBAJADOR`: incluye acceso a recursos VIP.
- `MODERADOR`: incluye funciones de speaker y comunidad.
- `SOPORTE`: acceso operativo de lectura a pagos globales y soporte de usuarios.
- `ORGANIZADOR`: gestión de eventos/cursos, escaneo QR y validación de pagos.
- `ADMIN`: acceso total, incluyendo auditoría.

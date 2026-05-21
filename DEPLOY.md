# Guía de Despliegue — Plataforma MEH

> **Meta actual:** Poner el sistema funcional en el puerto 80 usando Docker Compose.
> **Nota:** La terminación SSL y la configuración del dominio se abordarán en una etapa posterior.

---

## 📋 Tabla de Contenidos

1. [Prerrequisitos](#prerrequisitos)
2. [Estructura del proyecto](#estructura-del-proyecto)
3. [Configuración de variables de entorno](#configuración-de-variables-de-entorno)
4. [Despliegue inicial](#despliegue-inicial)
5. [Verificación del despliegue](#verificación-del-despliegue)
6. [Operaciones comunes](#operaciones-comunes)
7. [Actualización del despliegue](#actualización-del-despliegue)
8. [Backup y restauración de la base de datos](#backup-y-restauración-de-la-base-de-datos)
9. [Solución de problemas](#solución-de-problemas)
10. [Arquitectura de servicios](#arquitectura-de-servicios)

---

## 1. Prerrequisitos

- **Docker Engine** ≥ 24.x
- **Docker Compose Plugin** ≥ v2.20 (incluido con Docker Desktop)
- **Git** (para clonar el repositorio)

Verificar instalación:

```bash
docker --version
docker compose version
```

---

## 2. Estructura del proyecto

```
.
├── docker-compose.yml          # Orquestación de todos los servicios
├── .dockerignore               # Archivos excluidos del build
├── backend/
│   ├── Dockerfile              # Imagen del backend FastAPI (Python 3.11)
│   ├── entrypoint.sh           # Script de inicio (migraciones + seed + servidor)
│   ├── .env.docker             # ⚠️ Variables de entorno para Docker Compose
│   ├── requirements.txt        # Dependencias de Python
│   └── ...                     # Código fuente de la API
├── frontend/
│   ├── Dockerfile              # Build multi-etapa (Node 20 → Nginx)
│   ├── nginx.conf              # Configuración nginx con SPA fallback
│   └── ...                     # Código fuente de React
├── website/
│   ├── Dockerfile              # Build multi-etapa (Node 20 → Nginx)
│   └── ...                     # Documentación Docusaurus
└── nginx/
    ├── Dockerfile              # Reverse proxy basado en nginx:stable-alpine
    └── nginx.conf              # Reglas de ruteo (API, docs, frontend)
```

---

## 3. Configuración de variables de entorno

Antes del primer despliegue, editar el archivo **`backend/.env.docker`** con los valores adecuados para producción.

### 3.1. Base de datos

| Variable | Descripción | Valor por defecto (solo demo) |
|---|---|---|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL | `postgresql://postgres:password123@db:5432/plataforma_meh` |

> ⚠️ **Seguridad:** Cambiar la contraseña `password123` por una contraseña segura. La contraseña debe coincidir con `POSTGRES_PASSWORD` en `docker-compose.yml`.

Para cambiar la contraseña de la base de datos:

1. Editar `docker-compose.yml`:
   ```yaml
   db:
     environment:
       POSTGRES_PASSWORD: <nueva-contraseña-segura>
   ```
2. Editar `backend/.env.docker`:
   ```
   DATABASE_URL=postgresql://postgres:<nueva-contraseña-segura>@db:5432/plataforma_meh
   ```

### 3.2. Autenticación JWT

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `SECRET_KEY` | Clave secreta para firmar tokens JWT | `mlsa_super_secret_key_2026_thesis_project` |
| `ALGORITHM` | Algoritmo de firma | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración del token en minutos | `1440` (24 horas) |

> ⚠️ **Seguridad:** Generar un `SECRET_KEY` único y seguro para producción:
> ```bash
> openssl rand -hex 32
> ```
> Copiar el resultado y pegarlo en `backend/.env.docker` como `SECRET_KEY`.

### 3.3. Correo electrónico (SMTP)

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `SMTP_HOST` | Servidor SMTP | `smtp.gmail.com` |
| `SMTP_PORT` | Puerto SMTP | `587` |
| `SMTP_USER` | Usuario/correo SMTP | `tu-email@gmail.com` |
| `SMTP_PASSWORD` | Contraseña o App Password | `tu-app-password-o-contraseña` |
| `EMAIL_FROM_NAME` | Nombre del remitente | `Plataforma MEH` |

> Si no se configura SMTP, las funcionalidades de envío de correos no estarán disponibles, pero el sistema funcionará correctamente.

### 3.4. URLs del frontend (para enlaces en correos)

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `FRONTEND_URL` | URL base del frontend | `http://localhost` |
| `FRONTEND_DASHBOARD` | Ruta del dashboard | `/dashboard` |
| `FRONTEND_LEARNING` | Ruta de aprendizaje | `/learning` |
| `FRONTEND_FINANZAS` | Ruta de finanzas | `/finanzas` |

> En producción, cambiar `FRONTEND_URL` por la URL real del dominio (ej: `https://plataforma.meh.edu.bo`).

### 3.5. Google OAuth (opcional)

| Variable | Descripción |
|---|---|
| `GOOGLE_CLIENT_ID` | Client ID de Google OAuth (dejar vacío si no se usa) |

---

## 4. Despliegue inicial

### 4.1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd Plataforma-MEH
```

### 4.2. Configurar variables de entorno

```bash
cp backend/.env.docker backend/.env.docker.backup  # respaldo del original
# Editar backend/.env.docker con los valores de producción
nano backend/.env.docker
```

### 4.3. Construir y levantar los servicios

```bash
# Construir imágenes y levantar todos los servicios en segundo plano
docker compose up -d --build
```

Este comando:

1. Construye las imágenes de `backend`, `frontend`, `website` y `nginx-proxy`
2. Descarga la imagen de `postgres:15-alpine`
3. Crea la red interna para la comunicación entre contenedores
4. Inicia los servicios en el orden correcto (db → backend → frontend/website → nginx-proxy)
5. El backend ejecuta automáticamente migraciones de base de datos y seed básico

### 4.4. Ver el progreso inicial

```bash
docker compose logs --tail=50 -f backend
```

Esperar hasta que aparezca:

```
✅ INICIO COMPLETO — Arrancando servidor...
```

### 4.5. Comportamiento del seed

La variable `RUN_SEED` en `docker-compose.yml` controla el seed de datos:

| Valor | Comportamiento | Uso recomendado |
|---|---|---|
| `""` (vacío / no seteado) | Solo migraciones, sin seed | Producción real |
| `basic` | Seed con usuarios staff | Primer despliegue / desarrollo |
| `super` | Seed completo (20 miembros, eventos, cursos, badges, etc.) | Demos / pruebas |

Para el primer despliegue se recomienda `basic` para tener usuarios de staff. Para producción real, cambiar a `""`:

```yaml
backend:
  environment:
    - RUN_SEED=
```

---

## 5. Verificación del despliegue

### 5.1. Estado de los contenedores

```bash
docker compose ps
```

Salida esperada (todos los servicios deben mostrar `Up`):

```
NAME          IMAGE                COMMAND                  SERVICE        STATUS   PORTS
meh-db        postgres:15-alpine   "docker-entrypoint.s…"   db             Up       5432/tcp
meh-backend   meh-backend          "/entrypoint.sh"         backend        Up       8000/tcp
meh-frontend  meh-frontend         "nginx -g 'daemon off…"  frontend       Up       80/tcp
meh-docs      meh-website          "nginx -g 'daemon off…"  website        Up       80/tcp
meh-proxy     meh-nginx-proxy      "nginx -g 'daemon off…"  nginx-proxy    Up       0.0.0.0:80->80/tcp
```

### 5.2. Acceso a la aplicación

| Recurso | URL |
|---|---|
| Frontend (SPA) | `http://<IP-del-servidor>` |
| API (documentación Swagger) | `http://<IP-del-servidor>/api/docs` |
| Documentación de usuario/técnica | `http://<IP-del-servidor>/docs/` |

Donde `<IP-del-servidor>` puede ser `localhost` si se accede localmente, o la IP pública del servidor.

### 5.3. Verificar que la API responde

```bash
curl http://localhost/api/docs
```

Debería devolver el HTML de Swagger UI.

### 5.4. Verificar logs de cada servicio

```bash
# Todos los servicios
docker compose logs --tail=20

# Servicio específico
docker compose logs --tail=50 -f backend
docker compose logs --tail=50 -f nginx-proxy
```

---

## 6. Operaciones comunes

### 6.1. Detener todos los servicios

```bash
docker compose down
```

### 6.2. Detener y eliminar volúmenes (⚠️ destruye datos)

```bash
docker compose down -v
```

> ⚠️ **Advertencia:** `-v` elimina el volumen de PostgreSQL, borrando **todos los datos** de la base de datos.

### 6.3. Reiniciar un servicio específico

```bash
docker compose restart backend
```

### 6.4. Ver logs en tiempo real de un servicio

```bash
docker compose logs -f backend
```

### 6.5. Ejecutar un comando dentro de un contenedor

```bash
# Shell en el backend
docker compose exec backend sh

# Shell en PostgreSQL
docker compose exec db psql -U postgres -d plataforma_meh

# Shell en el proxy nginx
docker compose exec nginx-proxy sh
```

### 6.6. Ejecutar migraciones manualmente

Si se necesita ejecutar migraciones manualmente (por ejemplo, después de un cambio de esquema):

```bash
docker compose exec backend alembic upgrade head
```

---

## 7. Actualización del despliegue

Cuando se actualiza el código fuente (por ejemplo, después de un `git pull`):

```bash
git pull
docker compose up -d --build
```

Docker Compose detectará qué servicios tienen cambios en su Dockerfile o contexto y solo reconstruirá los necesarios.

Para reconstruir **todos** los servicios desde cero:

```bash
docker compose build --no-cache
docker compose up -d
```

---

## 8. Backup y restauración de la base de datos

### 8.1. Backup

```bash
# Backup del volumen de PostgreSQL
docker compose exec db pg_dump -U postgres -d plataforma_meh > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 8.2. Restauración

```bash
cat backup_20250101_120000.sql | docker compose exec -T db psql -U postgres -d plataforma_meh
```

> Ejecutar la restauración sobre una base de datos vacía. Si la base de datos ya tiene datos, puede ser necesario dropear schemas primero.

---

## 9. Solución de problemas

### 9.1. Puerto 80 ya está en uso

```bash
# Verificar qué proceso está usando el puerto 80
sudo lsof -i :80

# Opción A: Detener el proceso que lo está usando
sudo systemctl stop nginx  # si es nginx del host
sudo systemctl stop apache2  # si es Apache

# Opción B: Cambiar el puerto en docker-compose.yml
ports:
  - "8080:80"  # usar puerto 8080 en lugar de 80
```

### 9.2. Backend no inicia — PostgreSQL no responde

```bash
docker compose logs --tail=50 backend
```

Si se ven mensajes de "PostgreSQL no respondió después de 30 intentos":

```bash
# Verificar que el servicio db está corriendo
docker compose ps db

# Verificar logs de PostgreSQL
docker compose logs --tail=30 db
```

### 9.3. Migraciones fallidas

```bash
docker compose logs --tail=20 backend | grep -i "alembic"

# Solución: Ejecutar migraciones manualmente con más detalle
docker compose exec backend alembic upgrade head 2>&1
```

### 9.4. Error de permisos en volúmenes

Si se encuentra un error de permisos en el volumen `./backend/static`:

```bash
# Asegurar que el directorio exista y tenga los permisos correctos
mkdir -p ./backend/static/uploads
chmod 755 ./backend/static/uploads
```

### 9.5. Frontend no carga (blank screen)

1. Verificar que el frontend se construyó correctamente:
   ```bash
   docker compose logs --tail=30 frontend
   ```
2. Verificar que `VITE_API_URL` esté correctamente configurado en `docker-compose.yml`:
   ```yaml
   frontend:
     build:
       args:
         - VITE_API_URL=/api/
   ```
   > El valor debe ser `/api/` para que las peticiones se hagan al mismo origen y el proxy nginx las enrute al backend.

3. Verificar la consola del navegador (F12) para errores de red.

### 9.6. Error "address already in use" al hacer `up -d`

Otra instancia de Docker Compose puede estar ejecutándose en el mismo directorio:

```bash
docker compose down
# Esperar unos segundos y reintentar
docker compose up -d
```

### 9.7. Cambiar la semilla de datos después del primer despliegue

Si se cambia `RUN_SEED` después del primer despliegue y se necesita repoblar:

```bash
# Opción 1: Eliminar el volumen de datos y recrear (⚠️ destructivo)
docker compose down -v
docker compose up -d

# Opción 2: Ejecutar un seed manual dentro del contenedor en ejecución
docker compose exec backend python -m app.seed
```

---

## 10. Arquitectura de servicios

```
                    ┌──────────────┐
                    │   Usuario    │
                    │  (Navegador) │
                    └──────┬───────┘
                           │
                        puerto 80
                           │
                    ┌──────▼───────┐
                    │  nginx-proxy  │  ← Único punto de entrada
                    │  (revers proxy)│
                    └──┬────┬────┬──┘
           ┌───────────┘    │    └──────────┐
           ▼                 ▼                ▼
    ┌──────────┐    ┌──────────────┐  ┌──────────────┐
    │  backend  │    │   frontend   │  │   website    │
    │  FastAPI  │    │  React SPA   │  │  Docusaurus  │
    │ :8000     │    │  :80 (nginx) │  │  :80 (nginx) │
    └─────┬─────┘    └──────────────┘  └──────────────┘
          │
    ┌─────▼─────┐
    │    db      │
    │ PostgreSQL │
    │ :5432      │
    └───────────┘
```

- **`nginx-proxy`**: Único servicio expuesto al exterior (puerto 80). Enruta según la URL:
  - `/api/*` → backend (FastAPI)
  - `/docs/*` → website (Docusaurus)
  - `/*` → frontend (React SPA)
- **`backend`**: API REST con FastAPI, ejecuta migraciones y seed al iniciar.
- **`frontend`**: SPA en React, servida por nginx con fallback a `index.html` para SPA routing.
- **`website`**: Documentación estática generada con Docusaurus.
- **`db`**: Base de datos PostgreSQL con persistencia en volumen Docker.

---

## Notas finales

- La configuración actual usa valores por defecto que **no son seguros para producción real**. Cambiar `SECRET_KEY` y la contraseña de PostgreSQL antes de exponer el sistema.
- SSL/TLS y dominio se configurarán en una etapa posterior. Mientras tanto, el sistema funciona en HTTP plano en el puerto 80.
- Para entornos con múltiples despliegues, considerar el uso de `docker-compose.override.yml` para configuraciones específicas del entorno sin modificar el archivo base.
- Los volúmenes de Docker (`postgres_data`) mantienen los datos de la base de datos incluso después de `docker compose down`. Usar `docker compose down -v` solo cuando se quiera reiniciar desde cero.
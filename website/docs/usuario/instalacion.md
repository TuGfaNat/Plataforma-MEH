---
sidebar_position: 5
title: 5. Guía de Instalación y Despliegue
---

# 🛠️ 5. Guía de Instalación y Despliegue Técnico

Esta guía proporciona las instrucciones necesarias para replicar el entorno de desarrollo y producción de la **Plataforma MEH**, asegurando la integridad de la arquitectura desacoplada y la persistencia de datos.

## 5.1. Requisitos del Sistema (Ecosistema Industrial)

Para garantizar un rendimiento óptimo en un entorno de alta disponibilidad, se requieren las siguientes especificaciones:

| Componente | Versión | Propósito |
| :--- | :--- | :--- |
| **Python** | 3.11.x | Motor asíncrono del Backend (FastAPI). |
| **Node.js** | 20.x (LTS) | Runtime del Frontend (Vite + React). |
| **PostgreSQL** | 15+ | Motor de base de datos con soporte para JSONB. |
| **Git** | 2.40+ | Control de versiones y CI/CD. |

---

## 5.2. Arquitectura de Despliegue

La plataforma utiliza una topología de servicios distribuidos para escalar horizontalmente:

```text
 [ CLIENTE ]           [ VERCEL ]              [ RENDER / SUPABASE ]
      |                    |                          |
 INTERFAZ <------ HTTPS / WSS / JWT ------> [ BACKEND API ]
      |                    |               [ WORKER SMTP ]
      |                    |                          |
      |                    |               [ POSTGRESQL DB ]
      |                    |               [ ASSETS STORAGE ]
```

---

## 5.3. Proceso de Instalación Paso a Paso

### 5.3.1. Automatización con Scripts de Inicio
La plataforma incluye scripts de configuración global en la raíz del proyecto para agilizar el despliegue inicial:

*   **En Windows (PowerShell):**
    ```powershell
    ./setup.ps1
    ```
*   **En Linux/macOS (Bash):**
    ```bash
    chmod +x setup.sh && ./setup.sh
    ```

### 5.3.2. Configuración Manual del Backend
Si opta por la configuración manual, siga la secuencia de comandos:
1.  **Entorno Virtual:** `cd backend && python -m venv venv`
2.  **Dependencias:** `pip install -r requirements.txt`
3.  **Migraciones:** `alembic upgrade head`

### 5.3.3. Configuración del Frontend
1.  **Instalación:** `cd frontend && npm install`
2.  **Desarrollo:** `npm run dev`

---

## 5.4. Configuración Crítica de Variables (.env)

El archivo `.env` en la raíz de `backend/` y `frontend/` es vital para la comunicación entre capas.

### 🔑 Variables del Backend
*   `DATABASE_URL`: `postgresql://user:pass@host:port/dbname` (Soporta Neon/Render).
*   `SECRET_KEY`: Cadena aleatoria de 32 caracteres para encriptación JWT.
*   `MAIL_USERNAME / MAIL_PASSWORD`: Credenciales SMTP para la emisión de certificados.
*   `CORS_ORIGINS`: Lista de dominios permitidos (ej: `http://localhost:5173`).

:::danger ADVERTENCIA DE SEGURIDAD
Nunca suba el archivo `.env` al repositorio de Git. El archivo `.env.example` se proporciona como plantilla. En producción, utilice secretos de entorno de la plataforma de hosting (Render/Vercel).
:::

---

## 5.5. Protocolo de Calidad (Testing y Linting)

Antes de cualquier despliegue a producción, es mandatorio ejecutar la suite de pruebas:

*   **Pruebas Unitarias (Pytest):** `pytest tests/test_master_suite.py`
*   **Verificación de Tipado:** `mypy app`
*   **Suite Backend Completa:** `pytest -q`

:::tip OPTIMIZACIÓN EN PRODUCCIÓN
Para el despliegue final en el frontend, utilice siempre `npm run build`. Esto genera una carpeta `dist` con archivos minificados y optimizados mediante Rollup, reduciendo el tiempo de carga inicial en un 60%.
:::

---

*Con esta guía completada, el sistema está listo para operar. Para conocer el flujo de usuario, regrese al **[Onboarding del Miembro](./onboarding-miembro)**.*
.*

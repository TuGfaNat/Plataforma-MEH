# MANUAL TÉCNICO DE INGENIERÍA: PLATAFORMA MEH

## 1. ARQUITECTURA DEL SISTEMA
El sistema utiliza una **Arquitectura de Microservicios Desacoplados**:
*   **Backend:** API RESTful con FastAPI (Python 3.11), utilizando programación asíncrona para alta concurrencia.
*   **Frontend:** Single Page Application (SPA) con React 18, Vite y Fluent UI v9.
*   **Persistencia:** PostgreSQL gestionado vía SQLAlchemy ORM con migraciones Alembic.

## 2. DICCIONARIO DE DATOS (ESQUEMA POSTGRESQL)

### 2.1. Entidades Principales
| Tabla | Columna | Tipo | Restricción | Descripción |
|:---|:---|:---|:---|:---|
| **usuarios** | id_usuario | Integer | PK, Serial | Identificador único. |
| | correo | String(150) | Unique, Index | Email institucional/personal. |
| | password_hash| Text | Not Null | Hash Bcrypt (Argon2 compatible). |
| | rol | String(20) | Check | {ADMIN, ORGANIZADOR, MODERADOR, SOPORTE, EMBAJADOR, MIEMBRO} |
| **eventos** | id_evento | Integer | PK | ID del evento. |
| | modalidad | String | Not Null | {VIRTUAL, PRESENCIAL, HIBRIDO} |
| | id_organizador| Integer | FK (usuarios) | Responsable del evento. |
| **pagos** | id_pago | Integer | PK | ID de transacción. |
| | monto | Numeric(10,2)| Not Null | Valor cobrado. |
| | estado_pago | String | Default 'PEND'| {PENDIENTE, APROBADO, RECHAZADO} |

### 2.2. Sistema de Auditoría (AuditMixin)
Todas las tablas críticas implementan las columnas de trazabilidad:
*   `creado_por` (FK -> usuarios): Usuario que insertó el registro.
*   `fecha_creacion`: timestamp sin zona horaria.
*   `modificado_por` (FK -> usuarios): Último usuario en editar.
*   `fecha_modificacion`: timestamp de la última actualización.

## 3. CATÁLOGO DE API Y CONTROL DE ACCESO
La API se expone en `/api/v1/` y requiere Bearer Token (JWT) para rutas protegidas.

### 3.1. Gestión de Identidad (Auth)
*   `POST /auth/register`: Registro de nuevos miembros.
*   `POST /auth/login`: Autenticación y retorno de JWT.
*   `PUT /auth/usuarios/{id}/rol`: [ADMIN] Elevación de privilegios.

### 3.2. Operaciones y Negocio
*   `GET /dashboard/stats`: [ADMIN/ORGANIZADOR] KPIs de gestión.
*   `POST /eventos/{id}/asistencia-qr`: [ORGANIZADOR] Validación de QR en tiempo real.
*   `PUT /pagos/admin/{id}/validar`: [ORGANIZADOR] Aprobación de flujos financieros.

## 4. ESTRUCTURA DE COMPONENTES FRONTEND
*   **Layouts:** `MainLayout` con `Sidebar` dinámico basado en RBAC.
*   **Providers:** `AuthContext` para sesiones y `ThemeContext` para modo oscuro.
*   **Protección:** High Order Component `ProtectedRoute` intercepta accesos no autorizados.

---
sidebar_position: 4
title: 4. Referencia de API (Especificación Técnica)
---

# 4. Referencia de API y Especificación de Servicios

La interfaz de programación de aplicaciones (API) de la **Plataforma MEH** constituye el contrato de comunicación fundamental entre los servicios de backend y el cliente reactivo. Este capítulo detalla los módulos y endpoints que habilitan la funcionalidad del ecosistema.

## 4.1. Arquitectura de la API: Estándar REST y OpenAPI

La API ha sido diseñada siguiendo el estilo arquitectónico **REST**, aprovechando la semántica de los verbos HTTP. La implementación se realiza mediante **FastAPI**, lo que permite la generación automática de la documentación interactiva en:
👉 `https://api-plataforma-meh.onrender.com/docs`

---

## 4.2. Catálogo de Endpoints de Alta Densidad

### 4.2.1. Módulo: Gestión de Identidad (`/auth`)
Gestión de sesiones y perfiles de usuario.
*   `POST /auth/login`: Intercambio de credenciales por JWT.
*   `POST /auth/register`: Registro de nuevos miembros.
*   `GET /auth/me`: Obtención de datos del perfil actual.
*   `PUT /auth/profile`: Actualización de Bio, Alias y Fotos.
*   `POST /auth/forgot-password`: Inicio de flujo de recuperación.

### 4.2.2. Módulo: Operaciones de Eventos (`/eventos`)
Core logístico de la plataforma.
*   `GET /eventos/`: Listado público con filtros de estado.
*   `POST /eventos/`: Creación de eventos (Requiere rol ORGANIZADOR+).
*   `POST /eventos/{id}/register`: Inscripción de miembros.
*   `GET /eventos/{id}/inscritos`: Listado para control administrativo.

### 4.2.3. Módulo: Centro de Operaciones QR (`/asistencia`)
Validación en campo y tiempo real.
*   `POST /asistencia/scan`: Punto de entrada único para validación de QRs.
*   `GET /asistencia/event/{id}/stats`: Reporte de asistencia por checkpoint.
*   `POST /asistencia/checkpoints`: Configuración de puntos de control.

### 4.2.4. Módulo: Finanzas y Conciliación (`/pagos`)
Control de ingresos y validación OCRM.
*   `POST /pagos/upload`: Subida de comprobante digital vinculado a una inscripción.
*   `GET /pagos/pendientes`: Bandeja de entrada para validadores.
*   `PUT /pagos/{id}/validate`: Aprobación/Rechazo con notas administrativas.

### 4.2.5. Módulo: Gestión de Archivos Universales (`/files`)
*   `POST /files/upload`: Endpoint centralizado para subida de imágenes y documentos (Máx. 5MB).
*   `GET /static/uploads/{filename}`: Acceso a archivos públicos y recursos.

### 4.2.6. Módulo: Analítica y Reportes (`/dashboard`, `/reports`)
Business Intelligence con Recharts.
*   `GET /reports/dashboard-stats`: Métricas dinámicas para KPIs estratégicos.
*   `GET /dashboard/admin/summary`: Resumen ejecutivo para SuperAdmin.

### 4.2.7. Módulo: Academia y Certificación (`/cursos`, `/recursos`)
*   `GET /cursos/mis-certificados`: Listado de logros con metadatos para generación de PDF.
*   `GET /cursos/verificar/{uuid}`: Portal público de validación de autenticidad.

---

## 4.3. Estructura de Errores Estandarizada

La API utiliza un manejador global de excepciones para garantizar respuestas consistentes:

| Código | Categoría | Acción Sugerida |
| :--- | :--- | :--- |
| **401** | Unauthenticated | Iniciar sesión o renovar token. |
| **403** | Unauthorized | Contactar a un Administrador para elevar privilegios. |
| **422** | Validation Error | Revisar el formato de los datos enviados (Pydantic). |
| **500** | Server Error | Revisar logs en el backend (Render). |

---

## 4.4. Referencias Bibliográficas (APA 7ma Edición)

*   Fielding, R. T. (2000). *Architectural Styles and the Design of Network-based Software Architectures*.
*   Tiangolo, S. (2023). *FastAPI Documentation*. https://fastapi.tiangolo.com/

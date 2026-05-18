---
title: Histórico - API Reference (raíz docs)
---

# Referencia de API: Especificación Técnica de Endpoints

La API de Plataforma MEH sigue el estándar **OpenAPI 3.0**. Todos los endpoints requieren la cabecera `Authorization: Bearer <token>` excepto los de registro y login.

---

## 1. Módulo de Autenticación (`/auth`)

### 1.1. Login de Usuario
**`POST /api/v1/auth/login`**

**Request Body:**
```json
{
  "correo": "admin@meh.com",
  "password": "password123"
}
```

**Respuestas:**
*   **200 OK:** Retorna el token JWT.
*   **401 Unauthorized:** Credenciales incorrectas.
*   **422 Unprocessable Entity:** Formato de JSON inválido.

---

## 2. Módulo de Inteligencia de Negocio (`/reports`)

### 2.1. Obtener Estadísticas Gerenciales
**`GET /api/v1/reports/dashboard-stats`**

**Seguridad:** Requiere rol `ADMIN` u `ORGANIZADOR`.

**Response (JSON Recharts Optimized):**
```json
{
  "kpis": {
    "total_miembros": 150,
    "ingresos_totales": 2500.5,
    "tasa_conversion_asistencia": 82.4
  },
  "asistencia_series": [
    { "name": "Taller Azure", "inscritos": 50, "asistentes": 45 },
    { "name": "MEH Conf", "inscritos": 120, "asistentes": 100 }
  ]
}
```

---

## 3. Módulo de Escaneo QR (`/asistencia`)

### 3.1. Validar Asistencia QR
**`POST /api/v1/asistencia/escaneo-qr`**

**Seguridad:** Solo rol `ORGANIZADOR`.

**Request Body:**
```json
{
  "codigo_qr": "uuid-v4-token-string",
  "id_checkpoint": 1
}
```

**Respuestas:**
*   **200 OK:** `{"status": "success", "mensaje": "Asistencia confirmada"}`
*   **404 Not Found:** QR inválido o no encontrado.
*   **403 Forbidden:** El usuario que escanea no tiene permisos de Staff.

---

## 4. Manejo de Errores Globales

| Código | Mensaje Típico | Causa Problable |
| :--- | :--- | :--- |
| **400** | "Bad Request" | Datos de entrada fuera de rango o lógica de negocio violada. |
| **403** | "Forbidden" | El token es válido pero el rol no tiene el scope necesario. |
| **500** | "Internal Server Error" | Error inesperado en el servidor o caída de la DB. |

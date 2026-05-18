---
sidebar_position: 1
title: 1. Arquitectura y Diseño de Ingeniería
---

# 1. Arquitectura y Diseño de Ingeniería del Sistema

Este capítulo integra los fundamentos académicos, las decisiones de diseño de alto nivel y los detalles de implementación técnica de la **Plataforma MEH**. Siguiendo los estándares de la **Universidad Mayor de San Andrés (UMSA)**, se presenta una visión holística de la infraestructura que sostiene el ecosistema de alta disponibilidad.

---

## 1.1. Fundamentos y Paradigma Desacoplado

La Plataforma MEH se basa en un patrón de **Arquitectura Cliente-Servidor Desacoplada**. Este paradigma garantiza que la lógica de negocio (Backend) y la interfaz de usuario (Frontend) evolucionen de forma independiente, comunicándose exclusivamente mediante una API RESTful bajo el estándar OpenAPI 3.0.

### 1.1.1. Justificación del Stack Tecnológico
La selección de herramientas responde a criterios de rendimiento, seguridad y mantenibilidad:

*   **Backend (FastAPI):** Elegido por su soporte nativo de asincronía (`async/await`) y validación de tipos mediante Pydantic, lo que minimiza errores en la capa de servicios y optimiza la concurrencia.
*   **Frontend (React 18 + Fluent UI v9):** Provee una experiencia de usuario fluida (SPA) y una estética alineada con el ecosistema de diseño de Microsoft. Se utiliza **Vite** como motor de compilación para garantizar HMR (Hot Module Replacement) instantáneo.
*   **Persistencia (Neon PostgreSQL):** Motor relacional serverless que permite una gestión eficiente de conexiones mediante PgBouncer y escalabilidad dinámica.
*   **Gestión de Archivos (File Engine):** Capa de servicios que utiliza el sistema de archivos del servidor (o storage compatible con S3) para el almacenamiento de comprobantes de pago y recursos VIP, con validación de tipos MIME y límites de cuota (5MB).

---

## 1.2. Sistema de Validación Universal (Data Integrity)

La arquitectura implementa una **Capa de Validación Dual**:
1.  **Backend (Pydantic):** Validación de esquemas JSON y tipos de datos en la entrada de la API.
2.  **Frontend (Validators Utility):** Aplicación de expresiones regulares (Regex) para asegurar la integridad de nombres, correos (RFC 5322) y contraseñas robustas antes de la transmisión de datos.

---

## 1.3. Topología del Sistema (C4 Model - Nivel 2)

El sistema opera bajo un esquema de tres capas físicas distribuidas:

```text
+----------------------------------------------------------------------------------+
|                               SISTEMA PLATAFORMA MEH                             |
|                                                                                  |
|  +-----------------------+           +----------------------------------------+  |
|  | [CONTENEDOR]          |           | [CONTENEDOR]                           |  |
|  | APLICACIÓN WEB (SPA)  |           | API REST (BACKEND)                     |  |
|  | React + Fluent UI     | <-------> | FastAPI + Python 3.11                  |  |
|  | (Despliegue Vercel)   | [JSON/JWT]| (Despliegue Render)                    |  |
|  +-----------+-----------+           +---------+--------------------+---------+  |
|              |                                 |                    |            |
|              | [HTTPS]                         | [SQLAlchemy]       | [SMTP]     |
|              v                                 v                    v            |
|  +-----------------------+           +------------------+   +------------------+ |
|  | USUARIO FINAL / STAFF |           | [CONTENEDOR]     |   | [SERVICIO]       | |
|  | (Navegador Web)       |           | BASE DE DATOS    |   | EMAIL SERVICE    | |
|  +-----------------------+           | Neon PostgreSQL  |   | (Certificados)   | |
|                                      +------------------+   +------------------+ |
+----------------------------------------------------------------------------------+
```

---

## 1.4. Implementación del Backend (Patrón de Capas)

La arquitectura interna del servidor sigue el principio de **Separación de Concernimientos (SoC)**:

1.  **Capa de Rutas (`/api`):** Define los contratos de entrada/salida y gestiona los códigos de estado HTTP.
2.  **Capa de Servicios (`/services`):** Contiene la lógica de negocio pura, orquestando llamadas a la base de datos y servicios externos (Email).
3.  **Capa de Persistencia (`/models`):** Define el esquema físico. El uso de `AuditMixin` asegura que cada cambio sea rastreable.
4.  **Capa de Seguridad (`/core`):** Implementa el sistema RBAC jerárquico y la gestión de tokens JWT HS256.

---

## 1.5. Implementación del Frontend (Estado y Reactividad)

El frontend está diseñado como una **Single Page Application (SPA)** de alto rendimiento:

*   **Context API:** Utilizada para la gestión global del estado de autenticación (`AuthContext`) y el sistema de temas (Carbon/Light).
*   **Service Layer (`/services`):** Abstracción de Axios que centraliza todas las llamadas a la API, inyectando automáticamente el token JWT en las cabeceras.
*   **Modularidad UI:** Cada componente de Fluent UI v9 se utiliza de forma atómica para asegurar la consistencia visual en dashboards y formularios.

---

## 1.6. Flujos de Datos Críticos

### 1.6.1. Ciclo de Vida de una Petición Protegida
```text
 [CLIENTE]                      [MIDDLEWARE RBAC]               [API SERVICE]
      |                                |                             |
 (1)  |-- REQ + JWT Header ----------->|                             |
      |                                |                             |
 (2)  |                         [VALIDAR FIRMA]                      |
      |                         [CHEQUEAR PERMISOS]                  |
      |                                |                             |
 (3)  |                                |-- ROL AUTORIZADO ---------->|
      |                                |                             |
 (4)  |                                |<-- DATA (JSON) -------------|
      |                                |                             |
 (5)  |<-- RESPONSE (200 OK) ----------|                             |
```

---

## 1.7. Referencias Bibliográficas (APA 7ma Edición)

*   Fielding, R. T. (2000). *Architectural Styles and the Design of Network-based Software Architectures* [Disertación doctoral].
*   Newman, S. (2015). *Building Microservices: Designing Fine-Grained Systems*.
*   Tiangolo, S. (2023). *FastAPI Documentation*. https://fastapi.tiangolo.com/

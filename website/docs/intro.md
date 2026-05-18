---
sidebar_position: 1
title: Visión General del Proyecto
---

# 🚀 Microsoft Education Hub (MEH)

<p align="center">
  <img src="/img/logo.png" width="250" alt="MEH Logo" />
</p>

Bienvenidos a la documentación centralizada de la **Plataforma MEH**. Este ecosistema digital ha sido diseñado como una solución de ingeniería de software de alta disponibilidad para la gobernanza y dinamización de comunidades tecnológicas de vanguardia.

:::info MISIÓN DEL PROYECTO
Proveer una infraestructura tecnológica robusta que automatice el ciclo de vida de los eventos académicos, garantice la trazabilidad financiera, centralice la gestión de activos digitales y potencie el reconocimiento de habilidades mediante credenciales digitales con validación pública, integrando estándares de calidad industrial.
:::

---

## 📄 Resumen Ejecutivo

La **Plataforma MEH** es un sistema integral de gestión (Management System) diseñado a medida para satisfacer las necesidades específicas de la comunidad **Microsoft Education Hub (MEH)**. El ecosistema ha evolucionado para incluir un motor de persistencia de archivos, validaciones estrictas de integridad de datos y un sistema de emisión de certificados PDF generado en tiempo real.

Aunque el desarrollo inicial está optimizado para el flujo de trabajo del MEH, el sistema posee una **arquitectura modular y parametrizable**. Esto permite que la plataforma pueda ser adaptada, editada y desplegada para otras comunidades tecnológicas o instituciones que requieran un control riguroso sobre sus procesos de aprendizaje y gestión de miembros.

---

## 🔐 Control de Acceso Basado en Roles (RBAC)

Uno de los pilares de seguridad de la plataforma es el sistema **RBAC (Role-Based Access Control)**. Este mecanismo permite gestionar los permisos de forma granular, asegurando que cada usuario acceda únicamente a las funcionalidades necesarias para su función:

- **Administrador (ADMIN):** Acceso total al sistema, gestión de roles y auditoría de logs.
- **Organizador:** Gestión de eventos, creación de cursos y visualización de analíticas.
- **Soporte:** Validación de comprobantes de pago y gestión de usuarios.
- **Staff:** Operaciones de campo como el escaneo de códigos QR y control de asistencia.
- **Miembro:** Acceso al Learning Hub, descarga de certificados e histórico de participación.

Este sistema no solo protege la integridad de los datos, sino que simplifica la experiencia de usuario al presentar una interfaz limpia y adaptada a cada rol.

---

## ⚖️ El Problema y la Solución

### La Problemática: Fragmentación y Opacidad

Las comunidades tecnológicas suelen enfrentar tres desafíos críticos:

1.  **Gestión Manual:** Errores derivados del uso de herramientas no integradas (hojas de cálculo).
2.  **Falta de Trazabilidad:** Dificultad para medir el impacto real y el progreso de los miembros.
3.  **Riesgos de Seguridad:** Gestión informal de accesos y validación de transacciones financieras.

### La Solución: Ecosistema MEH

El MEH actúa como un **Single Point of Truth (Única Fuente de Verdad)** mediante la automatización de la emisión de certificados, auditoría universal en tiempo real y una arquitectura desacoplada de alto rendimiento.

---

## 🏗️ Estructura de Arquitectura (Topología de Sistemas)

```text
       +-----------------------------------------------------------+
       |   PILAR 1: FRONTEND (CAPA DE PRESENTACIÓN)                |
       |   Tecnología: React 18 + Vite                             |
       |   Estética: Fluent UI v9 (Microsoft Design System)        |
       |   Features: Interfaz Adaptativa por Rol, Charts, Carbon   |
       +----------------------------+------------------------------+
                                    |
                                    | [ REST API / JWT AUTH ]
                                    v
       +-----------------------------------------------------------+
       |   PILAR 2: BACKEND (CAPA DE SERVICIOS)                    |
       |   Tecnología: FastAPI + Python 3.11                       |
       |   Arquitectura: Módulos asíncronos, RBAC Middleware       |
       |   Seguridad: JWT HS256 + Bcrypt / Argon2                  |
       +----------------------------+------------------------------+
                                    |
                                    | [ SQLAlchemy / Pool Pre-Ping ]
                                    v
       +-----------------------------------------------------------+
       |   PILAR 3: PERSISTENCIA (CAPA DE DATOS)                   |
       |   Motor: PostgreSQL (Neon / Render)                       |
       |   Lógica: AuditMixin (Trazabilidad Universal)             |
       |   Storage: Gestión de Comprobantes y Certificados         |
       +-----------------------------------------------------------+
```

---

## 📖 Guía de Manuales

| Manual                | Audiencia           | Contenido Clave                                               |
| :-------------------- | :------------------ | :------------------------------------------------------------ |
| **Manual Técnico**    | Ingenieros / DevOps | Arquitectura, Diccionario de Datos, Referencia de API y RBAC. |
| **Manual de Usuario** | Staff / Miembros    | Operación de Eventos, Pagos y Guía de Instalación.            |

---

## 🎓 Referencia Académica

> "Las plataformas de gestión educativa y el uso de credenciales digitales en comunidades de aprendizaje no solo optimizan la logística operativa, sino que fortalecen el capital social y la identidad profesional de los participantes en la sociedad del conocimiento" (Wenger-Trayner, 2015).

---

_Para iniciar con el despliegue técnico, diríjase a la sección de **[Guía de Instalación](./usuario/instalacion)**._

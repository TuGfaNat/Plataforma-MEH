---
sidebar_position: 2
title: 2. Estrategia de Persistencia y Datos
---

# 2. Estrategia de Persistencia y Modelado de Datos (Esquema Completo)

Este capítulo detalla la arquitectura de persistencia de la **Plataforma MEH**, abarcando el 100% de las entidades que componen el ecosistema. Se ha diseñado bajo estándares de alta normalización para garantizar la integridad referencial y la trazabilidad absoluta en **Neon PostgreSQL**.

---

## 2.1. Modelo Relacional Maestro (Figura 2)

El siguiente diagrama ASCII representa la interconexión de todos los módulos del sistema actualizados según la implementación de SQLAlchemy.

```text
  [MÓDULO IDENTIDAD]          [MÓDULO EVENTOS/CURSOS]          [MÓDULO QR & STAFF]
  +----------------+          +--------------------+          +-------------------+
  |    usuarios    |          |      eventos       |          |    checkpoints    |
  +----------------+          +--------------------+          +-------------------+
  | id_usuario (PK)|<---+     | id_evento (PK)     |<---+     | id_checkpoint (PK)|
  | correo     (UQ)|    |     | id_organizador (FK)|    |     | id_evento     (FK)|
  | rol (Check)    |    |     | modalidad          |    |     | nombre            |
  +-------+--------+    |     +---------+----------+    |     +---------+---------+
          |             |               |               |               |
          |             |     +---------v----------+    |     +---------v----------+
          |             +-----| inscripciones_ev   |----+-----| asistencia_det    |
          |                   +--------------------+          +-------------------+
          |                   | id_inscripcion (PK)|          | id_asistencia (PK)|
          |                   | id_usuario     (FK)|          | id_checkpoint (FK)|
          |                   | id_pago        (FK)|          | id_usuario     (FK)|
          |                   +---------+----------+          +-------------------+
          |                             |
  [MÓDULO FINANCIERO]                   |                [MÓDULO ACADÉMICO]
  +----------------+          +---------v----------+          +-------------------+
  |     pagos      |          |    certificados    |          |      cursos       |
  +----------------+          +--------------------+          +-------------------+
  | id_pago    (PK)|<---------| id_certificado (PK)|          | id_curso      (PK)|
  | id_usuario (FK)|          | id_usuario     (FK)|          | nombre_curso      |
  | monto          |          | uuid_verif     (UQ)|          | horas_academicas  |
  | estado_pago    |          +--------------------+          +---------+---------+
  +----------------+                                                    |
                                                              +---------v----------+
  [MÓDULO GAMIFICACIÓN]       [MÓDULO MARKETPLACE]            | inscripciones_cur  |
  +----------------+          +--------------------+          +-------------------+
  |     badges     |          |     productos      |          | id_inscripcion (PK)|
  +----------------+          +--------------------+          | id_usuario     (FK)|
  | id_badge   (PK)|<---+     | id_producto   (PK) |<---+     | id_curso       (FK)|
  | nombre_badge   |    |     +---------+----------+    |     | nota_final        |
  +-------+--------+    |               |               |     +-------------------+
          |             |     +---------v----------+    |
  +-------v--------+    +-----|      pedidos       |----+     [MÓDULO AUDITORÍA]
  | usuarios_badges|          +--------------------+          +-------------------+
  | id_usuario (FK)|<---------| id_pedido     (PK) |          |   logs_sistema    |
  | id_badge   (FK)|          | id_usuario     (FK) |          +-------------------+
  +----------------+          +--------------------+          | id_log        (PK)|
                                                              | id_admin      (FK)|
                                                              | accion/tabla/json |
                                                              +-------------------+
```

---

## 2.2. Diccionario de Datos Exhaustivo

Todas las tablas críticas heredan del patrón **AuditMixin**, incluyendo los campos: `creado_por` (FK), `fecha_creacion` (TS), `modificado_por` (FK) y `fecha_modificacion` (TS).

### 2.2.1. Núcleo de Identidad y Perfil (`usuarios`)

| Campo | Tipo | Restricción | Descripción |
| :--- | :--- | :--- | :--- |
| `id_usuario` | INT | PK | ID Maestro autoincremental. |
| `nombres` | VARCHAR | Not Null | Nombres del usuario. |
| `apellidos` | VARCHAR | Not Null | Apellidos del usuario. |
| `correo` | VARCHAR | UQ, Index | Identificador de acceso único. |
| `rol` | VARCHAR | Check | ADMIN, ORGANIZADOR, MODERADOR, SOPORTE, EMBAJADOR, MIEMBRO. |
| `alias` | VARCHAR | Nullable | Nombre público para la comunidad. |
| `foto_url` | VARCHAR | Nullable | Ruta a la imagen de perfil (Uploads). |
| `bio` | TEXT | Nullable | Biografía profesional o académica. |
| `preferencia_tema` | VARCHAR | Default 'dark' | Persistencia de UI (Light/Dark). |
| `puntos_xp` | INT | Default 0 | Acumulado para sistema de gamificación. |

### 2.2.2. Módulo de Eventos y Asistencia

**Tabla: `eventos`**
| Campo | Tipo | Restricción | Descripción |
| :--- | :--- | :--- | :--- |
| `id_evento` | INT | PK | Identificador del evento. |
| `titulo` | VARCHAR | Not Null | Nombre oficial de la actividad. |
| `modalidad` | VARCHAR | Not Null | VIRTUAL, PRESENCIAL, HIBRIDO. |
| `estado` | VARCHAR | Default 'P' | PROGRAMADO, EN_CURSO, FINALIZADO, CANCELADO. |
| `id_organizador`| INT | FK (usuarios) | Usuario responsable de la logística. |

**Tabla: `checkpoints`**
| Campo | Tipo | Restricción | Descripción |
| :--- | :--- | :--- | :--- |
| `id_checkpoint` | INT | PK | Punto de control QR (Entrada, Salida, etc). |
| `id_evento` | INT | FK (eventos) | Evento al que pertenece el punto. |
| `orden` | INT | Not Null | Secuencia lógica del control. |

### 2.2.3. Módulo Financiero y Marketplace (`pagos`, `productos`)

**Tabla: `pagos`**
| Campo | Tipo | Restricción | Descripción |
| :--- | :--- | :--- | :--- |
| `id_pago` | INT | PK | ID de transacción. |
| `id_usuario` | INT | FK (usuarios) | Miembro que realizó el depósito. |
| `monto` | NUMERIC | Not Null | Importe de la transacción. |
| `estado_pago` | VARCHAR | Default 'P' | PENDIENTE, APROBADO, RECHAZADO. |
| `validado_por` | INT | FK (usuarios) | Administrador que verificó el comprobante. |

### 2.2.4. Módulo Académico y Certificación (`cursos`, `certificados`)

**Tabla: `certificados`**
| Campo | Tipo | Restricción | Descripción |
| :--- | :--- | :--- | :--- |
| `id_certificado`| INT | PK | ID interno del documento. |
| `uuid_verificacion`| VARCHAR | UQ | Identificador único global (UUID v4). |
| `codigo_verificacion`| VARCHAR | UQ | Código corto legible para el portal de validación. |
| `id_usuario` | INT | FK (usuarios) | Titular del certificado. |
| `url_pdf` | VARCHAR | Not Null | Enlace al archivo físico (Storage). |

---

## 2.3. Optimización y Seguridad de Datos

El motor PostgreSQL de Neon aplica optimizaciones de arquitectura Serverless:

1.  **Connection Pooling:** Gestión eficiente de conexiones concurrentes mediante PgBouncer.
2.  **Escalabilidad Dinámica:** Ajuste automático de recursos según la carga de la API, garantizando alta disponibilidad durante eventos masivos.
3.  **Audit Logs (`logs_sistema`):** Tabla de auditoría inmutable que registra cada acción administrativa (`id_admin`, `accion`, `tabla_afectada`, `valores`), garantizando la trazabilidad forense del sistema.

---

## 2.4. Bibliografía APA 7ma Edición

*   Date, C. J. (2019). *Database in Depth: Relational Theory for Practitioners*. O'Reilly.
*   Patterson, D. A., & Hennessy, J. L. (2020). *Computer Organization and Design: The Hardware/Software Interface*. Morgan Kaufmann.
*   Silberschatz, A., Korth, H. F., & Sudarshan, S. (2022). *Database System Concepts* (7th ed.). McGraw-Hill.

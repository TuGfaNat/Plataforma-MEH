---
sidebar_position: 3
title: 3. Seguridad y Modelo RBAC
---

# 3. Seguridad, Autenticación y Modelo RBAC Jerárquico

La seguridad de la **Plataforma MEH** se fundamenta en un modelo de **Control de Acceso Basado en Roles (RBAC)** con herencia de permisos, garantizando que cada acción en el sistema esté debidamente autorizada y auditada.

---

## 3.1. Arquitectura de Seguridad Multicapa

1.  **Transporte:** Conexiones cifradas mediante SSL/TLS en Neon y Render.
2.  **Identidad:** Autenticación mediante tokens **JWT (JSON Web Token)** con algoritmo de firma HS256.
3.  **Autorización:** Middleware de permisos que valida scopes y roles jerárquicos.
4.  **Auditoría:** Registro inmutable de acciones administrativas en la tabla `logs_sistema`.

---

## 3.2. Modelo Jerárquico de Roles

El sistema implementa una **Herencia de Roles**, donde los niveles superiores adquieren automáticamente los permisos de los inferiores.

### 🌳 Árbol de Herencia
```text
 [ ADMIN ]
    |--> [ ORGANIZADOR ] + [ SOPORTE ]
            |--> [ MODERADOR ]
                    |--> [ EMBAJADOR ]
                            |--> [ MIEMBRO ]
```

### Definición de Roles en el Sistema:
*   **MIEMBRO:** Rol base. Acceso al Learning Hub y perfil propio.
*   **EMBAJADOR:** Miembro con privilegios de acceso a **Recursos VIP**.
*   **MODERADOR:** Acceso a **Speaker Kits** y moderación de comunidad.
*   **SOPORTE:** Gestión de usuarios y validación masiva de pagos.
*   **ORGANIZADOR:** Creación de eventos, cursos y gestión operativa total.
*   **ADMIN:** Acceso a auditoría de logs y configuración global del sistema.

---

## 3.3. Matriz de Permisos (Granularidad Técnica)

La autorización no se basa únicamente en el nombre del rol, sino en **Permisos Específicos** asignados a cada nivel.

| Permiso Técnico | Descripción | Nivel Mínimo |
| :--- | :--- | :--- |
| `users.read` | Lectura de perfiles de la comunidad. | SOPORTE |
| `events.manage` | Creación y edición de eventos/cursos. | ORGANIZADOR |
| `attendance.scan` | Uso del escáner QR en checkpoints. | ORGANIZADOR |
| `payments.validate`| Aprobación de comprobantes financieros. | SOPORTE |
| `vip.access` | Descarga de material exclusivo. | EMBAJADOR |
| `audit.read` | Acceso a logs de transacciones y acciones.| ADMIN |

---

## 3.4. Implementación del Middleware (Protección de Endpoints)

Cada ruta protegida en FastAPI utiliza dependencias de seguridad que ejecutan la lógica de `ensure_permission`:

```python
# Ejemplo de protección en el Backend
@router.post("/eventos/")
async def crear_evento(current_user = Depends(get_current_user)):
    ensure_permission(current_user.rol, "events.manage", "No tienes permisos")
    # Lógica de creación...
```

:::info SEGURIDAD EN EL FRONTEND
El frontend (React) replica esta lógica mediante el componente `ProtectedRoute`, el cual oculta elementos de la interfaz (botones de editar, paneles de administración) según los permisos calculados del usuario, evitando una exposición innecesaria de funcionalidades.
:::

---

## 3.5. Referencias Bibliográficas (APA 7ma Edición)

*   Anderson, R. (2020). *Security Engineering: A Guide to Building Dependable Distributed Systems*.
*   IETF. (2015). *RFC 7519: JSON Web Token (JWT)*.
*   OWASP Foundation. (2023). *Top 10 Web Application Security Risks*.

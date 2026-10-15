---
id: matriz-rbac
title: Matriz de Control de Acceso por Roles (RBAC)
sidebar_label: Matriz RBAC
---

# Matriz de Control de Acceso por Roles (RBAC)

:::info Docs-as-Code — Derivado del Código Fuente
Generado automáticamente a partir de `backend/app/core/permissions.py` y validado contra `frontend/src/auth/rbac.js`.
:::

## 1. Grafo de Herencia de Roles

```mermaid
graph TD
    ADMIN[ADMIN (Control Total)] --> ORGANIZADOR[ORGANIZADOR]
    ADMIN --> SOPORTE[SOPORTE]
    ORGANIZADOR --> MODERADOR[MODERADOR]
    MODERADOR --> EMBAJADOR[EMBAJADOR]
    EMBAJADOR --> MIEMBRO[MIEMBRO]
    SOPORTE --> MIEMBRO
```

---

## 2. Matriz de Permisos Técnicos vs Roles

| Permiso Técnico | MIEMBRO | EMBAJADOR | MODERADOR | SOPORTE | ORGANIZADOR | ADMIN |
|---|---|---|---|---|---|---|
| `announcements.manage` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `attendance.scan` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `audit.read` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `badges.manage` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `courses.manage` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `events.manage` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `payments.read_all` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `payments.validate` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `speaker.access` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `users.read` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `vip.access` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

:::tip Leyenda de Permisos
- **✅ Directo:** El permiso está expresamente otorgado a este rol.
- **🟢 Heredado:** El permiso se adquiere mediante la cadena jerárquica de roles.
- **❌:** El rol tiene denegado el acceso al recurso correspondiente.
:::

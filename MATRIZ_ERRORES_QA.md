# MATRIZ DE AUDITORÍA DE SEGURIDAD Y QA (MODO SENIOR)

## 1. HALLAZGOS DE CONTROL DE ACCESO (RBAC)

| Componente | Riesgo Detectado | Gravedad | Recomendación |
|:---|:---|:---|:---|
| `api/dashboard.py` | El endpoint `/stats` no tiene decorador `ensure_admin` o `ensure_permission`. Cualquier usuario autenticado puede ver estadísticas globales. | **ALTA** | Aplicar `ensure_permission(user.rol, PERMISSION_AUDIT_READ)`. |
| `api/logs.py` | El endpoint de lectura de logs no está restringido. Acceso a trazabilidad total del sistema por cualquier miembro. | **CRÍTICA** | Aplicar `ensure_admin(user.rol)`. |
| `api/asistencia.py` | El registro de asistencia manual no valida que el `id_usuario` a marcar sea diferente del `current_user` (aunque el permiso SCAN ya limita quién lo hace). | **MEDIA** | Validar lógica de negocio para evitar auto-escaneo si fuera el caso. |

## 2. ANÁLISIS DE FLUJO END-TO-END (HAPPY PATH)

**Flujo:** Inscripción -> Pago -> Aprobación -> Asistencia.

*   **Punto de Falla Identificado:** En `pagos_service.py`, al aprobar un pago (`APROBADO`), se marca la inscripción como `CONFIRMADA`. Sin embargo, la generación del `codigo_qr` físico no ocurre automáticamente en ese momento, sino que depende de que el frontend lo genere o una tarea posterior.
*   **Riesgo de Datos:** Si el usuario intenta entrar al evento justo después de la aprobación pero antes de que el sistema asigne un `codigo_qr` a la tabla `inscripciones_eventos`, el escáner fallará.

## 3. ERRORES SILENCIOSOS (SILENT ERRORS)

*   **Hallazgo:** Se detectaron algunos `try/except` globales en `email_service.py` que hacen log del error pero no interrumpen el flujo. Esto es correcto para UX (que el mail falle no debe romper el registro), pero debe monitorearse en la tabla de logs.
*   **Frontend:** En `App.jsx`, el `AuthContext` no maneja de forma explícita el error 403 para forzar un redirect a una página de "Acceso Denegado", simplemente deja de renderizar el componente, lo que puede confundir al usuario.

---

## 4. CONCLUSIÓN DE AUDITORÍA
El sistema es **FUNCIONALMENTE EXCELENTE**, pero requiere el blindaje de los endpoints de Administración (Dashboard y Logs) para cumplir con el estándar de grado UMSA.

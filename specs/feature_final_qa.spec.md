# PLAN DE PRUEBAS DE CALIDAD (QA): MOTOR DE ANALÍTICA BI-MEH

**Proyecto:** Plataforma Microsoft Enthusiast Hub (MEH)  
**Documento de Referencia:** `specs/feature_final.spec.md`  
**Objetivo:** Validar la integridad, seguridad y escalabilidad del módulo de reportería.

---

## 1. PRUEBAS UNITARIAS (KPI AGGREGATIONS)
*Objetivo: Verificar que las consultas SQLAlchemy procesen correctamente los datos del AuditMixin.*

| ID | Caso de Prueba | Entrada (Input) | Resultado Esperado |
|:---|:---|:---|:---|
| **UT-01** | Cálculo de Tasa de Asistencia | 100 Inscritos, 75 Escaneos QR | Retornar exactamente `0.75` (75%) |
| **UT-02** | Consolidación Financiera | 5 Pagos 'APROBADO' ($500), 2 'PENDIENTE' ($200) | Ingreso Total debe ser `$500.00` |
| **UT-03** | Cálculo de Tiempo de Certificación | Inscripción: 2026-05-01, Emisión: 2026-05-10 | Diferencia calculada: `9 días` |
| **UT-04** | Filtro de Fecha (Edge Case) | Fecha Inicio > Fecha Fin | Retornar `Empty Result` o `ValueError` |

---

## 2. PRUEBAS DE SEGURIDAD (RBAC & MIDDLEWARE)
*Objetivo: Asegurar que la información sensible solo sea accesible por roles autorizados.*

| ID | Caso de Prueba | Actor | Acción | Resultado Esperado |
|:---|:---|:---|:---|:---|
| **ST-01** | Acceso Autorizado Admin | `ADMIN` | GET `/api/v1/dashboard/stats` | Status `200 OK` + JSON de Stats |
| **ST-02** | Denegación por Rol Bajo | `MIEMBRO` | GET `/api/v1/dashboard/stats` | Status `403 Forbidden` |
| **ST-03** | Bypass de Token JWT | `ANÓNIMO` | Acceso directo al endpoint | Status `401 Unauthorized` |
| **ST-04** | Registro de Intento de Brecha | `MIEMBRO` | Intento de acceso a Stats | Registro en `logs_sistema` con acción `INTENTO_ACCESO_NO_AUTORIZADO` |

---

## 3. PRUEBAS DE CARGA Y ESCALABILIDAD (CONCEPTUALES)
*Objetivo: Validar el comportamiento del sistema bajo estrés de datos (+10,000 registros).*

### 3.1. Escenario de Estrés de Base de Datos
*   **Procedimiento:** Inyectar 10,000 registros sintéticos en `asistencia_detalles` y `logs_sistema` mediante un script de seed.
*   **Métrica de Éxito:** La consulta de agregación (COUNT/SUM) debe responder en menos de **200ms** utilizando índices en las columnas `fecha_creacion` e `id_evento`.

### 3.2. Escenario de Generación de Reportes Pesados
*   **Procedimiento:** Solicitar la exportación PDF de un reporte que abarque 5 años de actividad.
*   **Métrica de Éxito:** 
    *   Uso de **Streaming Response** para no saturar la memoria RAM del servidor.
    *   El frontend debe mostrar un `LoadingState` con progreso mientras el backend procesa el archivo.

### 3.3. Optimización de Memoria (Backend)
*   **Validación:** Verificar que el uso de memoria no exceda los **512MB** durante la generación del reporte (evitar cargar 10k objetos en memoria, usar `db.execute()` con resultados crudos en lugar de cargar modelos completos de SQLAlchemy).

---

## 4. MATRIZ DE ACEPTACIÓN PARA TESIS
- [ ] Todas las UT pasan con 100% de precisión.
- [ ] No hay fugas de datos hacia roles `MIEMBRO`.
- [ ] Los reportes exportados coinciden con los datos mostrados en el Dashboard.
- [ ] El sistema de Logs registra quién, cuándo y qué reporte se generó.

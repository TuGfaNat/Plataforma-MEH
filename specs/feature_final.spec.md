# SOFTWARE DESIGN DOCUMENT (SDD): SISTEMA DE ANALÍTICA Y REPORTERÍA GERENCIAL (BI-MEH)

**Feature:** Motor de Reportes Automáticos y KPIs de Gestión  
**Impacto:** Valor Agregado Estratégico para Tesis UMSA  

## 1. DESCRIPCIÓN
Implementación de un motor de analítica que procese los logs de auditoría, registros de asistencia y transacciones financieras para generar reportes dinámicos. Esta feature transforma los datos operativos en información estratégica para los administradores y organizadores de la plataforma.

## 2. REGLAS DE NEGOCIO (BR)
*   **BR1 - Consolidación de Datos:** Los reportes de asistencia deben cruzarse con los datos de inscripción para calcular la "Tasa de Deserción" y "Tasa de Retención" por evento/curso.
*   **BR2 - Seguridad de Acceso:** Solo usuarios con el rol `ADMIN` o `ORGANIZADOR` pueden acceder a reportes específicos de sus áreas.
*   **BR3 - Integridad Financiera:** Los reportes de finanzas solo deben considerar pagos con estado `APROBADO` para el cálculo de ingresos netos.
*   **BR4 - Validez de Certificación:** El reporte de certificados debe incluir el tiempo promedio entre la inscripción y la emisión del diploma.

## 3. HAPPY PATH (Escenario Ideal)
1.  El Administrador accede al panel de "Reportes Gerenciales".
2.  El sistema consulta el `AuditMixin` y la tabla `logs_sistema` para extraer actividad histórica.
3.  El motor procesa los datos y presenta tres KPIs principales:
    *   **Engagement:** % de asistencia real vs. capacidad máxima.
    *   **Monetización:** Ingresos por categoría (Eventos/Cursos/Membresías).
    *   **Crecimiento:** Curva de nuevos registros de miembros por mes.
4.  El usuario selecciona un rango de fechas y presiona "Exportar PDF/Excel".
5.  El sistema genera un archivo con sello digital de la plataforma MEH para su presentación oficial.

## 4. SAD PATHS (Escenarios de Error)
*   **SP1 - Sin Datos Suficientes:** Si el rango de fechas seleccionado no contiene registros, el sistema debe mostrar un estado vacío (Empty State) con la sugerencia "No hay datos para el periodo seleccionado" en lugar de fallar.
*   **SP2 - Permisos Insuficientes:** Si un `MIEMBRO` intenta acceder vía URL directa al endpoint de analítica, el sistema debe retornar un Error 403 (Forbidden) y registrar el intento de brecha de seguridad en `logs_sistema`.
*   **SP3 - Time-out de Consulta:** En eventos con +10,000 registros, el sistema debe usar paginación o procesamiento en segundo plano (Celery/Task) para evitar el bloqueo del hilo principal.

## 5. ESPECIFICACIÓN TÉCNICA SUGERIDA
*   **Backend:** Endpoint `/api/v1/dashboard/stats` con parámetros de filtrado avanzado (SQLAlchemy `func` para agregaciones).
*   **Frontend:** Implementación de `Chart.js` o `Recharts` integrada con los estilos de **Fluent UI**.
*   **Exportación:** Librería `ReportLab` (PDF) o `XlsxWriter` (Excel) para la generación de reportes desde el servidor.

---
**Nota para Tesis:** Esta funcionalidad justifica la capacidad del postulante para manejar agregaciones de datos complejas y presentar soluciones de BI (Business Intelligence), elevando el nivel técnico del proyecto.

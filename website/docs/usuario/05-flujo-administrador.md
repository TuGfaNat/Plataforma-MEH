---
title: Consola de Administración y Control Financiero OCR
sidebar_label: 05. Consola del Administrador
---

# Consola de Administración y Control Financiero OCR (Administrador)

Este documento describe la funcionalidad integral, las herramientas transaccionales de control de fraude, los motores de automatización de visión artificial y la emisión criptográfica disponibles de manera exclusiva en la **Consola del Administrador** de la **Plataforma MEH**.

El Administrador ejerce el **Control de Acceso Total (Full Access)** a nivel de frontend (`/admin`) y backend, resguardando la integridad del ecosistema comunitario de Microsoft Education Hub.

---

## 💻 1. Panel de Control Maestro (Dashboard Administrativo)

Al iniciar sesión con privilegios jerárquicos de nivel `ADMIN`, el frontend adaptativo despliega un panel lateral extendido con 9 pestañas de analíticas y control operativo:

![Panel de control maestro de administración en modo oscuro](/img/meh_admin_panel.png)

*Figura 3: Consola central del Administrador que integra los gráficos analíticos de Recharts y la validación automática OCR.*

---

## 📈 2. Analíticas Ejecutivas en Tiempo Real (`Analytics.jsx`)
La pestaña de **Analytics** consolida métricas críticas del estado del Hub mediante diagramas interactivos y reactivos construidos con la librería `Recharts`:

*   **Ingresos Mensuales:** Gráfico de áreas y barras apiladas que visualiza las recaudaciones de souvenirs, kits de eventos e inscripciones de pago, permitiendo proyecciones financieras.
*   **Volumen de Usuarios Activos:** Historial lineal del incremento de registros de estudiantes, embajadores y organizadores en la plataforma.
*   **Tasa de Retención LMS:** Indicadores visuales sobre la velocidad de finalización de cursos por los estudiantes inscritos.

---

## 🔍 3. Consola Financiera y Conciliación Bancaria con Jaro-Winkler (`GestionPagos.jsx`)
Una de las innovaciones tecnológicas de la suite es la **Conciliación de Vouchers Financieros mediante Similitud Difusa de Jaro-Winkler y OCR Determinístico**:

```mermaid
flowchart TD
    A[Voucher Subido por Alumno] --> B[Motor de OCR Determinístico]
    B -->|PDF/Imagen > 5 KB| C[Confianza 98% - VERIFICADO_AUTOMATICO]
    B -->|Archivo pequeño < 5 KB| D[Confianza 50% - REVISION_MANUAL]
    
    E[Cargar Extracto Bancario CSV] --> F[Motor de Conciliación Bancaria]
    F --> G[Fuzzy Matching Jaro-Winkler de Nombres]
    F --> H[Búsqueda de ID Exacto como Palabra Completa]
    F --> I[Bonus por Ventana Temporal de Fecha ±3 días]
    G & H & I --> J{¿Similitud >= 60.0%?}
    J -->|Sí| K[Emparejar y Autocompletar Conciliación]
    J -->|No| L[Mantener Pendiente]
```

### Guía de Operación Financiera y Carga de Extractos:
1.  **Ingresar a Conciliación OCR:** Accede a la subpestaña **Pagos** en la consola del Administrador.
2.  **Validación Inicial Determinística**: Cada vez que un estudiante sube un comprobante, el sistema evalúa sus propiedades físicas. Si es un archivo válido (PDF o Imagen de tamaño realista), se registra automáticamente una confianza del **98%** y se marca como `VERIFICADO_AUTOMATICO`. Si es sospechosamente pequeño o de formato no apto, se le asigna un **50% de confianza** y se deriva a la bandeja de `REVISION_MANUAL`.
3.  **Carga del Extracto Bancario (Reconciliación en Lote)**:
    *   Haz clic en el botón **"Cargar Extracto Bancario (CSV)"** en la esquina superior de la consola de administración.
    *   Selecciona el archivo `.csv` descargado de la banca por internet oficial (Banco Unión, BNB, Mercantil Santa Cruz, etc.). El archivo debe contener al menos las columnas `Fecha`, `Descripcion` y `Monto`.
    *   El motor procesará en lote el extracto, contrastando las transacciones de depósito contra los registros `PENDIENTES` de los alumnos.
4.  **Criterio de Emparejamiento Inteligente (Jaro-Winkler)**:
    *   El sistema evalúa el nombre del estudiante y busca variaciones o errores ortográficos en la descripción de la transferencia utilizando una tolerancia de distancia del **85%** por palabra (ej. "Mamani" contra "Mamany").
    *   Aplica una regla de proximidad temporal: si la fecha declarada del pago y el depósito del extracto difieren en $\le 1$ día se inyecta un **+15.0%** de similitud; si difieren en $\le 3$ días se inyecta un **+5.0%**.
    *   Busca de forma exacta el código identificador del pago como término completo (ej. `"PAGO 29"`), asignando un **100.0% de confianza instantánea** si lo encuentra.
5.  **Aprobación y Desbloqueo Académico**:
    *   En la rejilla interactiva de Fluent UI se listan las transacciones emparejadas con su respectivo porcentaje de similitud computado (ej. "Coincidencia: 97.5% - Jose Mamani Quispe").
    *   Para aprobar la conciliación, haz clic en **"Confirmar Conciliación"**. Esto actualiza instantáneamente el estado del pago a `APROBADO`, matricula al alumno en el curso o evento correspondiente de forma síncrona en la base de datos PostgreSQL, y le otorga sus respectivos puntos de experiencia y medallas.

---

## 🛍️ 4. Control de Inventario y Souvenirs (`SouvenirsTab.jsx`)
El Administrador gestiona el catálogo oficial de indumentaria y souvenirs del Hub:
1.  **Catálogo Activo:** Monitorea la rejilla interactiva de Fluent UI con los souvenirs de la comunidad (gorras, poleras de eventos, stickers técnicos, pines de insignias).
2.  **Gestión de Stock y Alertas:** Registra nuevos artículos, define los precios unitarios en moneda local y actualiza los stocks disponibles. El sistema emite alertas visuales cuando el inventario cae por debajo de 5 unidades.
3.  **Validación de Entregas:** Una vez conciliado el voucher, el administrador despacha el souvenir al estudiante y actualiza el estado a `ENTREGADO` en la consola física.

---

## 🔐 5. Generador de Certificados Criptográficos Masivos (`GeneradorCertificados.jsx`)
El Administrador puede acreditar académicamente a los estudiantes que han cumplido con las exigencias curriculares del aula virtual o asistido al congreso:

*   **Proceso de Generación Masiva:**
    1.  Selecciona el curso o evento correspondiente.
    2.  Haz clic en **Emitir Certificados Masivos**.
    3.  El backend de FastAPI procesa la lista de estudiantes aprobados de forma síncrona.
    4.  Crea un código criptográfico único (`hash_verificacion`) para cada diploma mediante un algoritmo de seguridad irreversible y genera el documento en formato PDF.
    5.  Los alumnos reciben de forma síncrona el diploma en sus buzones personales.
*   **Buzón de Verificación Pública:** Permite a terceras personas (ej. reclutadores de recursos humanos o directores académicos de la UMSA) ingresar al portal público, digitar el hash y verificar la autenticidad institucional del diploma.

---

## 🛡️ 6. Bitácora de Auditoría y Control de Seguridad (`Auditoria.jsx`)
Para resguardar los datos personales y precaver accesos fraudulentos o escalamientos ilícitos de privilegios, la suite integra una bitácora de auditoría detallada:

*   **Logs de Transacciones Físicas:** Registro permanente e inmutable en base de datos de cada llamada a métodos transaccionales del backend, utilizando el modelo base de auditoría del framework SQLAlchemy.
*   **Atributos Auditados:** Cada entrada incluye el ID del usuario ejecutor, acción realizada (ej. modificación de stock, cambio de rol a usuario), dirección IP física de origen del cliente HTTP y fecha exacta (timestamp de base de datos).
*   **Inspección Rápida:** Filtra los registros en tiempo real en la pantalla de Fluent UI para analizar comportamientos sospechosos o auditar accesos denegados por falta de privilegios JWT.

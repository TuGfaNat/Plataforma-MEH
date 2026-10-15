---
title: Manual de Administración (Máster)
sidebar_label: 05. Para Administradores
---

# Manual de Administración (Gestión Máster y Auditoría)

Este bloque documenta las operaciones privilegiadas del Administrador de la plataforma, enfocadas en la seguridad, control financiero y consistencia física de base de datos.

---

## 1. Panel de Control Maestro (Dashboard de Administración)

El administrador cuenta con una consola integrada para supervisar y parametrizar todo el sistema de la comunidad.

![Panel de Control Maestro Administrativo](/img/img_admin_panel.png)

---

## 2. Control de Usuarios y Roles (RBAC)

1. Dirígete a `/admin` y selecciona la pestaña **Usuarios** (o ruta `/dashboard/users`).
2. Visualizarás la cuadrícula interactiva con la nómina de la comunidad.
3. **Cambio de Rol:** Selecciona un usuario y utiliza el menú desplegable para reasignar su rol (`ADMIN`, `ORGANIZADOR`, `MODERADOR`, `SOPORTE`, `EMBAJADOR`, `MIEMBRO`).
4. **Estado de Cuenta:** Utiliza el switch para desactivar o activar una cuenta en vivo, inhabilitando accesos de inmediato.

![Gestión de Usuarios y Roles RBAC](/img/img_gestion_usuarios.png)

---

## 3. Validación de Pagos y Conciliación OCR

La plataforma gestiona los depósitos bancarios de los alumnos combinando visión artificial y reglas de negocio:

### Verificación Manual de Solicitudes
1. Dirígete al panel `/gestion-pagos`.
2. Se listarán los depósitos subidos por los estudiantes.
3. Al hacer clic sobre una fila, la interfaz de Fluent UI v9 desplegará:
   * La **Imagen Física del Comprobante (Voucher)** a la izquierda.
   * Los **Metadatos Extraídos por OCR** (monto, ID de transacción, fecha) a la derecha.
4. Puedes presionar **Aprobar Depósito** (habilitando la matrícula automática al LMS o evento) o **Rechazar Depósito** (solicitando que el alumno vuelva a cargar el voucher).

![Consola de Validación de Pagos (OCR)](/img/img_admin.png)

### Conciliación Bancaria Difusa en Lote
1. Para validar masivamente las transacciones contra la cuenta bancaria de la comunidad, solicita el archivo **CSV de extracto mensual** del banco.
2. Haz clic en **Conciliar Extracto CSV** y sube el archivo.
3. El motor de servicios del backend (`ocrm_service.py`):
   * Cruzará las transacciones por montos equivalentes.
   * Calculará la similitud de nombres de estudiantes mediante el algoritmo **Jaro-Winkler** (umbral de tolerancia difusa del 85%).
   * Evaluará la proximidad en fechas de transacción (ventana temporal de ±3 días).
   * Buscará el ID de pago exacto en la glosa del banco (confianza 100%).
4. El sistema mostrará la tabla de conciliados recomendados (> 60% de confianza) para confirmación masiva del administrador.

![Conciliación Bancaria Difusa en Lote](/img/img_conciliacion_ocr.png)

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

---

## 4. Bitácora de Auditoría Forense (Logs de Sistema)

Para garantizar la seguridad de la información ante manipulaciones internas:

1. Dirígete a la sección de **Auditoría Forense** (ruta `/auditoria`).
2. Se cargará el visor inalterable de logs transaccionales recopilados en la tabla `logs_sistema`.
3. Cada fila detalla:
   * Marca temporal UTC exacta.
   * IP física del emisor HTTP.
   * Identificador del operador involucrado.
   * Tipo de mutación de datos.
   * Un reporte JSON comparativo (*diff*) contrastando los campos anteriores con los nuevos valores modificados.

![Bitácora de Auditoría Forense (Logs)](/img/img_rbac_security.png)

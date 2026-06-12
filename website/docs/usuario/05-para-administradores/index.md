---
title: Manual de Administración (Máster)
sidebar_label: 05. Para Administradores
---

# Manual de Administración (Gestión Máster y Auditoría)

Este bloque documenta las operaciones privilegiadas del Administrador de la plataforma, enfocadas en la seguridad, control financiero y consistencia física de base de datos.

---

## 1. Panel de Control Maestro (Dashboard de Administración)

El administrador cuenta con una consola integrada para supervisar y parametrizar todo el sistema de la comunidad.

:::caution 📷 ACCIÓN REQUERIDA: CAPTURA DE PANTALLA
**Nombre de Archivo a Guardar:** `img/img_admin_panel.png`  
**Instrucciones de Captura:** Captura del Panel de Control de Administración en modo oscuro, mostrando las gráficas de Recharts, cantidad de registrados, y la barra superior de Fluent UI v9. Guardar la imagen en `website/static/img/img_admin_panel.png`.
:::

![Panel de Control Maestro Administrativo](/img/img_admin_panel.png)

---

## 2. Control de Usuarios y Roles (RBAC)

1. Dirígete a `/admin` y selecciona la pestaña **Usuarios** (o ruta `/dashboard/users`).
2. Visualizarás la cuadrícula interactiva con la nómina de la comunidad.
3. **Cambio de Rol:** Selecciona un usuario y utiliza el menú desplegable para reasignar su rol (`ADMIN`, `ORGANIZADOR`, `MODERADOR`, `SOPORTE`, `EMBAJADOR`, `MIEMBRO`).
4. **Estado de Cuenta:** Utiliza el switch para desactivar o activar una cuenta en vivo, inhabilitando accesos de inmediato.

:::caution 📷 ACCIÓN REQUERIDA: CAPTURA DE PANTALLA
**Nombre de Archivo a Guardar:** `img/img_gestion_usuarios.png`  
**Instrucciones de Captura:** Captura de la cuadrícula de control de usuarios del administrador, mostrando los menús de selección de roles RBAC y los switches de estado en Fluent UI v9. Guardar la imagen en `website/static/img/img_gestion_usuarios.png`.
:::

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

:::caution 📷 ACCIÓN REQUERIDA: CAPTURA DE PANTALLA
**Nombre de Archivo a Guardar:** `img/img_admin.png`  
**Instrucciones de Captura:** Captura de la consola de validación de pagos del administrador (GestionPagos.jsx), visualizando el voucher del estudiante y los campos procesados por OCR al costado en Fluent UI v9. Guardar la imagen en `website/static/img/img_admin.png`.
:::

![Consola de Validación de Pagos (OCR)](/img/img_admin.png)

### Conciliación Bancaria Automatizada en Lote
1. Para validar masivamente las transacciones contra la cuenta bancaria de la comunidad, solicita el archivo de extracto bancario en formato **Excel (.xlsx) o CSV**.
2. Sube el archivo arrastrándolo a la zona de carga de extractos.
3. El motor de servicios del backend (`ocrm_service.py`):
   * Filtrará las transacciones por montos equivalentes.
   * Buscará coincidencia directa por códigos de transacción o referencias de pago (números de 6 o más dígitos) presentes en la glosa y en el texto extraído del comprobante PDF de los alumnos (confianza **100%**).
   * Buscará el ID de pago exacto como una palabra completa en la glosa (confianza **100%**).
   * Calculará de forma difusa la similitud del nombre del estudiante mediante la métrica **Jaro-Winkler** sobre las palabras de la glosa.
   * Evaluará la proximidad temporal de las fechas de cobro (ventana temporal de ±3 días con bonus de confianza de hasta +15.0%).
4. El sistema listará los resultados indicando las coincidencias recomendadas, permitiendo al administrador aprobarlas en bloque con un solo clic.

:::caution 📷 ACCIÓN REQUERIDA: CAPTURA DE PANTALLA
**Nombre de Archivo a Guardar:** `img/img_conciliacion_ocr.png`  
**Instrucciones de Captura:** Captura del panel de conciliación bancaria en lote, mostrando la barra de carga del extracto bancario (Excel/CSV) y la cuadrícula comparativa de coincidencias detectadas. Guardar la imagen en `website/static/img/img_conciliacion_ocr.png`.
:::

![Conciliación Bancaria Difusa en Lote](/img/img_conciliacion_ocr.png)

```mermaid
flowchart TD
    A[Voucher PDF/Imagen del Alumno] --> B[Extracción de texto con pypdf]
    B -->|Válido y legible (confianza >= 95%)| C[Estado: PENDIENTE]
    B -->|Baja confianza (< 95%)| D[Estado: REVISION_MANUAL]
    
    E[Cargar Extracto Bancario Excel o CSV] --> F[Motor de Conciliación Bancaria]
    F --> G[Fuzzy Matching Jaro-Winkler de Nombres]
    F --> H[Búsqueda de ID de Pago en la Glosa]
    F --> I[Match de Código de Referencia >= 6 dígitos con texto OCR]
    F --> J[Bonus por Proximidad de Fecha ±3 días]
    G & H & I & J --> K{¿Similitud >= 60% o Código Coincide?}
    K -->|Sí| L[Emparejar y Autocompletar Conciliación]
    K -->|No| M[Mantener Sin Coincidencias]
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

:::caution 📷 ACCIÓN REQUERIDA: CAPTURA DE PANTALLA
**Nombre de Archivo a Guardar:** `img/img_rbac_security.png`  
**Instrucciones de Captura:** Captura de la consola de auditoría de logs del sistema (Auditoria.jsx), mostrando las columnas de IP, marca temporal, operador y el objeto JSON de auditoría forense. Guardar la imagen en `website/static/img/img_rbac_security.png`.
:::

![Bitácora de Auditoría Forense (Logs)](/img/img_rbac_security.png)

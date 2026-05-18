---
sidebar_position: 3
title: 3. Gestión Financiera y Pagos
---

# 💳 3. Gestión Financiera y Sistema de Pagos

Este capítulo describe el núcleo transaccional de la **Plataforma MEH**, diseñado para garantizar la sostenibilidad económica de la comunidad mediante un modelo de validación segura, transparente y auditable.

## 3.1. Modelo de Pagos del MEH: Eficiencia y Autonomía

A diferencia de las plataformas comerciales, el MEH utiliza un modelo de **Validación Directa** para maximizar los recursos de la comunidad.

### 3.1.1. Flujo de Inscripción en Eventos Premium
Cuando un evento es configurado como "De Paga", el usuario experimenta el siguiente proceso:
1.  **Selección de Tier:** El usuario elige su categoría (Estudiante, Profesional, etc.).
2.  **Visualización de QR Bancario:** El sistema despliega un código QR estático de la entidad bancaria oficial del MEH.
3.  **Transferencia Externa:** El usuario realiza el pago desde su aplicación bancaria preferida.
4.  **Carga de Comprobante (File Drag & Drop):** Utilizando el nuevo componente de subida, el usuario adjunta su archivo (JPG/PNG/PDF). El sistema valida que el tamaño sea menor a 5MB antes de subirlo al servidor.

:::info VENTAJA ESTRATÉGICA
El uso de validación manual y QRs estáticos protege la economía de la comunidad al **evitar comisiones de pasarelas de pago externas** (que suelen oscilar entre el 3% y 7%), permitiendo que el 100% de los fondos se reinviertan en beneficios para los miembros.
:::

---

## 3.2. Lógica OCRM (Conciliación Manual Optimizada)

La **Plataforma MEH** implementa una lógica de conciliación inspirada en sistemas ERP para facilitar la labor del Administrador Financiero.

### 3.2.1. El Proceso de Match Digital
Para evitar errores humanos y agilizar la aprobación, el sistema sigue estos pasos:
*   **Input del Usuario:** El sistema extrae metadatos básicos del formulario de carga (Monto declarado y ID de transacción).
*   **Carga de Extracto:** El Administrador carga el extracto bancario del día en formato **CSV o Excel**.
*   **Algoritmo de Sugerencia:** El sistema realiza una comparativa cruzada de campos clave:
    1.  **Monto Exacto:** Coincidencia de la cifra transferida.
    2.  **Referencia/ID:** Cruce de códigos de operación bancaria.
    3.  **Ventana Temporal:** Validación de que la fecha del comprobante coincida con el movimiento bancario.

---

## 3.3. Flujo de Verificación y Estados

El "camino del dinero" está estrictamente monitoreado para evitar duplicidad de comprobantes.

### 🔄 Diagrama de Flujo: Ciclo de Pago

```text
 [ MIEMBRO ]            [ SISTEMA / DB ]          [ ADMINISTRADOR ]
      |                        |                         |
 (1) [ PAGO ] ------------> [ COMPROBANTE ]              |
      |                     (Estado: PENDIENTE)          |
      |                        |                         |
      |                        | <---------- (2) [ CARGA EXTRACTO ]
      |                        |                         |
      |                 (3) [ MATCHING ]                 |
      |                        |                         |
      |                        +-----------> (4) [ VALIDAR / APROBAR ]
      |                        |                         |
 (5) [ CONFIRMACIÓN ] <--------+                         |
      (Email + QR Evento)      |                         |
      |                        |                         |
 [ INSCRITO / XP++ ] <---------+                         |
```

---

## 3.4. Gestión de Paquetes, Tiers y Precios

La plataforma permite una segmentación de precios dinámica para un mismo evento, permitiendo una estrategia de recaudación inclusiva.

*   **Early Bird:** Tarifas reducidas para los primeros inscritos (Configurable por fecha o cupo).
*   **Tier Estudiante:** Precio preferencial previa validación de perfil.
*   **Tier Profesional / Externo:** Tarifa estándar para público general.
*   **Cupones de Beca:** Códigos de descuento total para colaboradores o ganadores de sorteos.

---

## 3.5. Seguridad en Transacciones y Auditoría

La integridad de los datos es fundamental. La **Plataforma MEH** aplica los siguientes principios de seguridad financiera:

1.  **No Almacenamiento Sensible:** El sistema **no solicita ni almacena** números de tarjeta de crédito, CVV o claves bancarias. Todo el movimiento de dinero ocurre en la infraestructura segura del banco.
2.  **Registro de Verificación:** Se almacena únicamente el ID de transacción y la imagen del comprobante como respaldo legal para auditorías internas.
3.  **Trazabilidad Universal:** Gracias al `AuditMixin` del backend, cada aprobación de pago queda registrada con el ID del administrador que realizó la validación, la fecha y la IP de origen.

---

:::tip CONSEJO PARA EL USUARIO
Para una aprobación en menos de 24 horas, asegúrese de que la captura del comprobante sea legible y que el **ID de Transacción** ingresado en el formulario coincida exactamente con el del banco.
:::

---

*Para entender cómo este proceso activa los beneficios del usuario, consulte el **[Onboarding del Miembro](./onboarding-miembro)**.*

---
title: Histórico - Gestión de Eventos (raíz docs)
---

# Guía de Gestión de Eventos y Analítica

Esta guía está dirigida exclusivamente a los roles de **Administrador** y **Organizador**. Describe los procesos críticos para el éxito de la comunidad.

---

## 1. Ciclo de Vida de un Evento

### 1.1. Creación del Evento
1.  Navegue al **Panel Maestro** (Admin Panel).
2.  Haga clic en **"Nuevo Evento"**.
3.  Defina la **Modalidad**:
    *   *Presencial:* Requiere dirección física.
    *   *Virtual:* Requiere enlace de Microsoft Teams.
4.  Configure la **Capacidad Máxima**. El sistema bloqueará nuevas inscripciones automáticamente al alcanzar este límite.

---

## 2. Gestión Financiera y Validación de Pagos

El proceso de validación es el puente entre la inscripción y la participación efectiva.

### 2.1. Aprobación de Comprobantes
1.  Ingrese a la sección **"Validar Pagos"**.
2.  El sistema listará todas las transacciones con estado `PENDIENTE`.
3.  Visualice el comprobante (Imagen/PDF) subido por el usuario.
4.  Si el depósito es correcto, presione **"Aprobar"**.
    *   *Acción Automática:* El sistema genera el Código QR único del usuario y le envía un **Email de Confirmación** con la entrada.

---

## 3. Business Intelligence: Interpretación de Reportes

La sección de **Analítica Estratégica** utiliza la librería Recharts para transformar datos operativos en KPIs de gestión.

### 3.1. KPIs Principales
*   **Tasa de Conversión:** Mide cuántos usuarios que se inscribieron asistieron realmente al evento. Una tasa < 50% indica fallos en la convocatoria.
*   **Crecimiento de Comunidad:** Gráfico de tendencia mensual que muestra la adquisición de nuevos miembros.

### 3.2. Gráficos de Asistencia
El gráfico de barras comparativo permite visualizar el "Drop-out" (deserción) por evento, facilitando la toma de decisiones sobre qué temáticas generan más interés real en la comunidad.

---

## 4. Troubleshooting Operativo
*   **¿El QR no carga?** Verifique que el pago haya sido marcado como `APROBADO`.
*   **¿Gráficos vacíos?** Asegúrese de seleccionar un rango de fechas que contenga actividad histórica en la base de datos.

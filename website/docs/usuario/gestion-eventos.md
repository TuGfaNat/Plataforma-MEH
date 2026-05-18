---
sidebar_position: 2
title: 2. Gestión Operativa de Eventos
---

# ⚙️ 2. Gestión Operativa de Eventos y Recursos

Este capítulo detalla los procedimientos técnicos y operativos que los roles de **Administrador** y **Organizador** deben seguir para garantizar la excelencia en la ejecución de actividades dentro de la **Plataforma MEH**.

## 2.1. El Panel Maestro de Administración (SuperAdmin)

El **Panel Maestro** es el núcleo de inteligencia del sistema. Desde esta interfaz, el SuperAdmin posee una visión de 360 grados sobre la salud del ecosistema.

### 2.1.1. Visualización de Métricas Críticas (KPIs)
Al ingresar, el sistema presenta un tablero de analítica descriptiva que incluye:
*   **Total de Eventos Activos:** Conteo en tiempo real de actividades en fase de inscripción o ejecución.
*   **Usuarios Registrados:** Crecimiento demográfico de la comunidad.
*   **Tasa de Conversión de Asistencia:** Relación porcentual entre usuarios inscritos y asistencias validadas mediante QR.
*   **Recursos más Descargados:** Identificación de tendencias en el interés tecnológico de los miembros.

---

## 2.2. Ciclo de Vida y Creación de un Evento

La creación de un evento sigue una metodología estructurada para asegurar que la información llegue de manera íntegra a los usuarios finales.

### 🔄 Diagrama de Flujo: Proceso de Publicación

```text
 [ DEFINICIÓN ]       [ MULTIMEDIA ]       [ LOGÍSTICA ]       [ VISIBILIDAD ]
        |                   |                    |                    |
 (1) [ DETALLES ] ----> (2) [ CARGA ] ----> (3) [ CUPOS ] ----> (4) [ PUBLICAR ]
        |                   |                    |                    |
  - Nombre/Tipo       - Banner/Flyer       - Capacidad Máx      - Push Notification
  - Descripción       - Documentación      - Fecha de Cierre    - Email Marketing
  - Ubicación         - Speaker Kit        - Costo (si aplica)  - Visibilidad Web
```

:::tip OPTIMIZACIÓN DE CONVERSIÓN
Para mejorar la tasa de inscripción, utilice una descripción clara basada en el modelo AIDA (Atención, Interés, Deseo, Acción). Resalte las insignias que el usuario obtendrá al finalizar y mencione si el evento otorga acceso a recursos VIP exclusivos.
:::

---

## 2.3. Configuración de Rutas de Aprendizaje (Learning Paths)

Las **Rutas de Aprendizaje** permiten agrupar múltiples eventos y cursos en una secuencia lógica de especialización (ej: *Camino a la Certificación Azure Fundamentals*).

*   **Estructuración:** Los administradores pueden vincular varios módulos bajo una sola ruta temática.
*   **Botón 'Ver Detalles':** Proporciona al usuario una hoja de ruta visual con los requisitos previos y el progreso actual.
*   **Conexión con Microsoft Learn:** La plataforma permite integrar enlaces profundos (Deep Links) a recursos externos oficiales de Microsoft, permitiendo que el usuario complemente su formación teórica antes del taller práctico presencial.

---

## 2.4. Gestión de Recursos VIP y Material Exclusivo

La exclusividad es un pilar de la Plataforma MEH. El sistema permite la carga de activos digitales con permisos granulares.

### 2.4.1. Tipos de Materiales
*   **Speaker Kits:** Plantillas de PowerPoint y guías de oratoria para futuros embajadores.
*   **Repositorios de Código:** Enlaces a GitHub o archivos ZIP con soluciones técnicas.
*   **Grabaciones:** Enlaces a sesiones grabadas disponibles tras la finalización del evento.

### 2.4.2. Reglas de Acceso
Los recursos pueden ser configurados para ser visibles solo bajo condiciones específicas:
1.  **Inscritos:** Solo quienes tengan su pago aprobado.
2.  **Nivel de Experiencia:** Usuarios que hayan alcanzado los rangos de *Expert* o *Legend* (Basado en XP).

---

## 2.5. Control de Asistencia mediante Centro de Operaciones QR

El sistema de validación QR es el único mecanismo oficial para acreditar la participación y otorgar beneficios.

### 🤳 Guía Paso a Paso para el Organizador:
1.  **Activación:** El organizador accede a la sección **"Escaneo QR"** desde su dispositivo móvil o tablet.
2.  **Captura:** Se escanea el código dinámico presentado por el Miembro (desde su Dashboard o correo).
3.  **Validación:** El backend verifica la autenticidad del código y si el usuario pertenece a la lista de inscritos aprobados.
4.  **Impacto en el Perfil:** Una vez validado, el sistema ejecuta automáticamente:
    *   Asignación de **Puntos de Experiencia (XP)** al perfil del usuario.
    *   Desbloqueo de la **Insignia Digital** (Badge).
    *   Habilitación para la **Emisión de Certificado** al cierre del evento.

:::danger ATENCIÓN A LA FECHA DE CIERRE
Es crítico configurar correctamente la **Fecha de Cierre de Inscripciones**. Una vez pasada la fecha, el sistema bloqueará automáticamente el formulario y la recepción de comprobantes de pago. No se recomienda reabrir inscripciones de forma manual para evitar inconsistencias en el aforo y la generación de QRs.
:::

---

*Para más detalles sobre la seguridad de estos procesos, consulte la **[Documentación Técnica de Seguridad y RBAC](../tecnico/seguridad-rbac)**.*

---
title: Puntos de Control (Checkpoints)
sidebar_label: Puntos de Control (Checkpoints)
---

# Puntos de Control (Checkpoints)

Los checkpoints son puntos de control lógico distribuidos dentro de las conferencias (ej. "Taller React", "Refrigerio", "Charla de Cierre") para validar la permanencia física de los participantes.

### Funcionamiento de los Checkpoints:
1. El personal de staff de la comunidad estará distribuido en distintas áreas del auditorio.
2. Cada vez que cambies de actividad o ingreses a un taller específico, presenta tu QR personal al personal de staff de ese punto.
3. El staff seleccionará el checkpoint correspondiente en su consola offline u online y escaneará tu QR.
4. El sistema inyectará la marca temporal correspondiente en la tabla relacional `asistencia_detalles` de PostgreSQL.
5. Al final del evento, la acumulación exitosa de registros en los checkpoints obligatorios es validada síncronamente para habilitar la descarga de tu certificado de aprobación.

![Historial de Checkpoints de Asistencia](/img/img_checkpoints_list.png)

---

### ❌ Control de Fraude en Puerta
El motor del backend prohíbe los dobles registros o el escaneo múltiple en el mismo checkpoint para evitar el traspaso ilícito de credenciales. Cualquier escaneo duplicado será rechazado arrojando un error visual inmediato.

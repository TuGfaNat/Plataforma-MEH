# FEATURE: Sistema Avanzado de Checkpoints y Escaneo QR (Mini Web Móvil)

## 1. Contexto y Objetivos
Para eventos como hackathons y conferencias grandes, la asistencia inicial ("Entrada Principal") no es suficiente. Se requiere controlar hitos específicos como "Refrigerio 1", "Entrega de Kits", o "Ingreso a Talleres simultáneos".
El objetivo es extender el sistema de Escaneo QR existente para que funcione como un sistema multi-checkpoint dinámico.

## 2. Happy Path
1. El organizador crea un evento y define Checkpoints ("Entrada Principal", "Refrigerio Mediodía").
2. El organizador abre el "Escáner QR" (`EscaneoQR.jsx`) en su dispositivo móvil.
3. El organizador selecciona el Evento y luego el Checkpoint activo en ese momento ("Refrigerio Mediodía").
4. El organizador escanea el QR del participante.
5. El sistema registra que el participante reclamó su "Refrigerio Mediodía" insertando un `AsistenciaDetalle` atado al `id_checkpoint`.
6. Si el participante intenta reclamar el mismo refrigerio nuevamente, el sistema muestra un error por escaneo duplicado.

## 3. Sad Paths
1. **Intento de reclamar doble:** Un escaneo doble del mismo QR para el mismo checkpoint devuelve un error 400.
2. **Checkpoint inactivo/inexistente:** Seleccionar un checkpoint que no corresponde al evento detiene la acción.
3. **Escaneo sin seleccionar checkpoint:** Mantiene la retrocompatibilidad: si no se envía checkpoint, se registra en el campo genérico `asistio=True` (Entrada Principal heredada).

## 4. Reglas de Negocio
- La tabla `checkpoints` guarda los hitos creados por el admin para un evento.
- La tabla `asistencia_detalles` guarda la relación entre la inscripción del usuario, el checkpoint y la fecha de escaneo.
- El lector QR sigue operando como PWA responsiva en el celular mediante el componente `EscaneoQR.jsx` construido con `html5-qrcode`.
- Se requiere rol de Organizador / Lector (`PERMISSION_ATTENDANCE_SCAN`) para registrar.

## 5. CRITERIOS DE ACEPTACIÓN
- [ ] Endpoints `/eventos/{id}/checkpoints` implementados (GET y POST).
- [ ] Endpoint de escaneo `/eventos/asistencia-qr` recibe `id_checkpoint` opcionalmente y valida duplicidad en `AsistenciaDetalle`.
- [ ] UI móvil en `EscaneoQR.jsx` permite seleccionar dinámicamente un checkpoint según el evento seleccionado previo al escaneo.

# FEATURE: Mejoras en Generador Masivo de Certificados (Firmas y Vista Previa)

## 1. Contexto y Objetivos
El usuario ha solicitado mejorar el generador masivo de certificados para que el proceso visual de creación del PDF refleje con exactitud la plantilla (fondo) y las firmas proporcionadas. Se añade soporte para generar certificados a los *Speakers* del evento y una opción de *Vista Previa* e *Impresión* directa desde el panel de administración.

## 2. Happy Path
1. El Administrador accede al "Generador Certificados".
2. Selecciona Evento, llena el Título y escoge "A todos los Speakers".
3. Sube un template base y hasta 4 firmas.
4. Hace clic en "Vista Previa". El navegador renderiza un PDF (o abre una pestaña) con datos dummy (ej. "Speaker Ejemplo", firmas alineadas abajo) demostrando cómo quedará.
5. Satisfecho con el diseño, hace clic en "Generar en Lote".
6. El backend procesa, guarda la metadata (`{"bg": url, "firmas": [...]}`) e inyecta los registros a la DB para los Speakers correspondientes.

## 3. Sad Paths
1. **Error de formato de imagen:** Si el background o las firmas no son leíbles por `jsPDF` en el preview, mostrar un alerta.
2. **Evento sin speakers:** Si se escoge generar a "SPEAKERS" en un evento que no tiene speakers asignados, el servicio aborta y retorna error.

## 4. Reglas de Negocio
- La tabla de `Certificado` almacena a quién pertenece. Puesto que un certificado normal usa `id_usuario`, pero un `Speaker` podría no ser un usuario registrado del sistema (la tabla `Speaker` es separada), el certificado en ese caso se guarda vinculando al usuario si coincide su correo, o la arquitectura lo maneja guardando en una tabla de certificados especiales o dejándolo como PDF descargable inmediato para el organizador.
  *(Nota técnica: el modelo actual de `Certificado` exige `id_usuario`. Por tanto, el speaker debe ser o coincidir con un `id_usuario`, o si se falla en esto, el admin genera el PDF en vivo para impresión manual en vez de meterlo a DB)*.
- Para simplificar e ir "de golpe": Generaremos el PDF en el frontend para "Speakers" sin requerir crear un `id_usuario` fantasma, permitiendo al Admin descargar el ZIP/PDF de speakers e imprimirlo, pero para "Usuarios" (Asistentes), se registrará en DB.

## 5. CRITERIOS DE ACEPTACIÓN
- [ ] Vista Previa que ejecuta `generateCertificatePDF` con los blobs/urls de las imágenes subidas.
- [ ] `generateCertificatePDF` ahora pinta hasta 4 firmas distribuidas horizontalmente en la parte inferior.
- [ ] Backend guarda la metadata como JSON para recuperar las urls en el portal del estudiante.

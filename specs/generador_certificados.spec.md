# FEATURE: Generador de Certificados en Lote (Admin/Organizador)

## 1. Contexto y Objetivos
Proporcionar una interfaz robusta para que administradores y organizadores puedan generar y emitir certificados en masa para un evento o curso específico. Este feature permite personalizar visualmente el certificado subiendo una imagen de fondo y hasta 4 firmas de embajadores, así como establecer filtros sobre a quién se emite el certificado (ej. solo asistentes, aprobados, etc).

## 2. Happy Path
1. El usuario (Admin/Organizador) accede al Sidebar y hace clic en "Generador Certificados".
2. Se muestra un formulario donde se selecciona el Evento o Curso destino.
3. Se selecciona el criterio de emisión (ej. "Solo Asistentes Confirmados").
4. El usuario sube una imagen de fondo y 4 firmas (opcionales) en formato imagen.
5. El usuario hace clic en "Generar".
6. El backend procesa en masa, emite los UUID de validación, y guarda las URLs (o emite eventos) para que estén disponibles en el Learning Hub / Validador de cada usuario.

## 3. Sad Paths
1. **Permisos insuficientes:** Usuarios sin permisos (`PERMISSION_EVENTS_MANAGE`) no deben poder ver la opción ni ejecutar la acción.
2. **Falta de recursos visuales:** Si las imágenes no se suben correctamente o no son admitidas, se devuelve un error 400.
3. **Usuarios no encontrados:** Si el filtro seleccionado retorna 0 usuarios, se muestra un aviso y no se procede con la generación.

## 4. Reglas de Negocio
- La emisión genera un registro en la tabla `certificados` por cada usuario que cumple el filtro.
- Se debe validar contra la tabla de `inscripciones_eventos` (asistio=True) o `inscripciones_cursos` (completado=True).
- Los certificados emitidos están ligados al Validador de Talentos mediante `uuid_verificacion`.

## 5. CRITERIOS DE ACEPTACIÓN
- [ ] Endpoint `/certificados-admin/bulk` disponible para recibir FormData con fondo, firmas y metadata.
- [ ] Lógica de servicio en `certificado_generator_service.py` que recorra inscritos y genere los certificados.
- [ ] UI en `GeneradorCertificados.jsx` con uploaders y selects.
- [ ] Link en `Sidebar.jsx`.

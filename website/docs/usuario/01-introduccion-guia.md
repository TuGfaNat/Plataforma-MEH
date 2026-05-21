---
title: Introducción y Guía de Primeros Pasos
sidebar_label: 01. Introducción y Guía
---

# Introducción y Guía de Primeros Pasos (Plataforma MEH)

Bienvenido a la guía oficial de usuario de la **Plataforma MEH (Microsoft Education Hub)**. Este manual está diseñado para orientarte paso a paso en el uso de la suite interactiva de la comunidad. 

El sistema implementa un modelo de **Control de Acceso Basado en Roles (RBAC)** que adapta dinámicamente la interfaz gráfica, menús y permisos del usuario según su nivel de privilegios.

---

## 1. ¿Qué es la Plataforma MEH?

La **Plataforma MEH** es un ecosistema tecnológico unificado creado para automatizar la gestión y actividades de las comunidades de estudiantes. Centraliza las tareas y flujos en un solo lugar físico de fácil acceso:

* **Gestión Curricular LMS (Learning Hub):** Un aula virtual interactiva para cursar clases, ver videos explicativos, publicar dudas en foros y subir entregas de tareas académicas.
* **Control QR de Asistencia:** Sistema de generación de códigos QR únicos y checkpoints para la validación síncrona en la entrada de las conferencias.
* **Gamificación y Logros:** Sistema de insignias y acumulación de puntos por participación que incentivan la formación técnica.
* **Conciliación Financiera OCR:** Procesamiento automático de vouchers y transferencias bancarias mediante visión artificial e inteligencia artificial.

---

## 2. Flujo de Registro y Creación de Cuentas

Para incorporarte al ecosistema de capacitación, debes registrarte en la plataforma mediante el siguiente flujo secuencial:

1. **Acceder a la Pantalla de Registro:** En el menú principal de la Landing Page pública, haz clic en el botón de **Registrarse** (Ruta: `/register`).
2. **Completar Ficha de Información:** Digita tus datos de perfil obligatorios:
   - Nombres completos y Apellidos.
   - Correo electrónico institucional o personal (debe ser único).
   - Contraseña de seguridad (se requiere una longitud mínima y caracteres especiales para cumplir con los estándares de ciberseguridad).
   - Datos geográficos (País: Bolivia, y tu Departamento correspondiente).
   - Datos institucionales (Establece si estudias en una universidad, colegio o instituto, y escribe el nombre de la institución para tus certificados).
3. **Confirmación y Creación:** Presiona el botón de **Crear Cuenta**. El sistema procesará los datos síncronamente y te asignará por defecto el rol inicial de **Miembro**, permitiéndote acceder de forma inmediata al dashboard del estudiante.

---

## 3. Inicio de Sesión y Recuperación de Credenciales

Una vez dispongas de tu cuenta activa, puedes ingresar a tu consola en cualquier momento:

### Acceso a la Plataforma (Ruta: `/login`)
1. Digita tu correo registrado y tu contraseña de seguridad.
2. Presiona el botón de **Iniciar Sesión**.
3. El sistema verificará de forma síncrona el hash en base de datos. Si las credenciales son válidas, generará un Token JWT de seguridad temporal, guardará tu sesión en el context reactivo de React (`AuthContext`) y te redirigirá a tu Dashboard principal en modo oscuro.

### Recuperación de Contraseña (Ruta: `/forgot-password`)
Si olvidas tus credenciales de acceso, la plataforma dispone de un canal seguro de recuperación:
1. En la pantalla de login, presiona el enlace **¿Olvidaste tu contraseña?**.
2. Digita tu correo electrónico de registro y haz clic en **Enviar Enlace de Recuperación**.
3. El servicio del backend de la plataforma generará un token de restablecimiento seguro en base de datos (`reset_token`) y gatillará el servidor SMTP corporativo para despachar un enlace único de recuperación a tu bandeja de correo.
4. Al dar clic en el enlace, accederás a la pantalla de `/reset-password`, donde podrás registrar tu nueva contraseña de forma síncrona y predecible.

---
sidebar_position: 1
title: 1. Onboarding del Miembro
---

# 🚀 1. Onboarding y Gestión del Miembro

Bienvenido a la **Plataforma MEH (Microsoft Education Hub)**. Este manual constituye el primer capítulo de tu viaje tecnológico. Aquí aprenderás a configurar tu identidad digital, navegar por los sistemas de seguridad y maximizar los beneficios de nuestra comunidad de entusiastas.

## 1.1. El Perfil del Miembro: Tu Identidad Digital

El Miembro MEH no es solo un usuario; es un profesional en formación con acceso a un ecosistema de alta disponibilidad. Al unirte, desbloqueas:

- **🎓 Learning Hub Personalizado:** Un repositorio centralizado donde se registran tus inscripciones, asistencias y certificados obtenidos.
- **🔓 Biblioteca de Recursos VIP:** Acceso exclusivo a repositorios de código, guías de arquitectura (Speaker Kits) y software licenciado de Microsoft.
- **🏅 Ecosistema de Insignias:** Sistema de validación de competencias mediante insignias digitales (Badges) exportables a redes profesionales.
- **📈 Seguimiento de XP:** Visualización en tiempo real de tu crecimiento técnico basado en participación activa.

:::info ¿POR QUÉ COMPLETAR TU PERFIL?
Configurar tu **Alias, Foto de Perfil y Biografía** no solo personaliza tu experiencia visual, sino que permite al sistema generar certificados con datos precisos y te posiciona en el ranking de la comunidad para futuras mentorías.
:::

---

## 1.2. Personalización y Experiencia de Usuario (UI/UX)

La plataforma permite una adaptación total a las preferencias del miembro:
- **Alias y Biografía:** Identidad pública dentro de la comunidad.
- **Gestión de Foto:** Subida de imagen de perfil vinculada al motor de archivos seguro.
- **Modo Oscuro Persistente:** Preferencia estética que se sincroniza entre dispositivos mediante el perfil de usuario en la base de datos.

## 1.2. Flujo de Registro y Autenticación

Nuestra infraestructura garantiza que cada cuenta sea única y segura. Sigue este flujo lógico para iniciar tu sesión:

### 🗺️ Guía Visual del Proceso de Alta

```text
 [ LANDING PAGE ]       [ FORMULARIO REGISTRO ]     [ BACKEND ENGINE ]
        |                         |                         |
 (1) [ REGISTRARSE ] ------------>|                         |
        |                         |                  (2) [ VALIDACIÓN ]
        |                         |                      - Email Institucional
        |                         |                      - Complejidad Pass
        |                         |                         |
        |                  (3) [ ENVÍO DE TOKEN ] <---------+
        |                      (Validación SMTP)            |
        |                         |                         |
 (4) [ LOGIN INICIAL ] <----------+-------------------------+
        |
 [ DASHBOARD / XP: 0 ]
```

**Pasos Detallados:**

1.  **Formulario:** Ingresa tus datos básicos. El sistema validará que el correo no esté en uso.
2.  **Seguridad:** Tu contraseña se encripta inmediatamente usando algoritmos de hashing seguros (BCrypt).
3.  **Confirmación:** Recibirás un correo de bienvenida. Este paso es vital para activar la recepción de QRs de eventos.

---

## 1.3. Gestión de Cuenta y Seguridad Avanzada

La plataforma implementa protocolos de seguridad para proteger tu trayectoria y tus logros.

### 1.3.1. Recuperación de Credenciales (Forgot Password)

Si pierdes el acceso, el proceso de restablecimiento es autónomo y seguro:

1.  **Solicitud:** Desde el Login, solicita un enlace de recuperación.
2.  **Token Temporal:** El sistema envía un token criptográfico a tu email con una ventana de validez de 60 minutos.
3.  **Reset:** Al hacer clic, serás redirigido a una interfaz segura para definir una nueva clave sin necesidad de soporte técnico.

:::tip SEGURIDAD PRIMERO
Active siempre contraseñas que combinen caracteres alfanuméricos y símbolos. Recuerde que el **Centro de Operaciones QR** es personal; si comparte su cuenta, otros podrían redimir sus beneficios y XP.
:::

---

## 1.4. Interfaz de Logros y Gamificación

El MEH premia la constancia. Tu Dashboard no solo muestra datos, sino tu progreso tangible.

### 1.4.1. Sección "Mis Logros"

En esta sección podrás visualizar:

- **Badges Activos:** Medallas ganadas por completar talleres (ej: _Azure Architect_, _AI Visionary_).
- **Barra de Progreso (XP):** Indica cuánto te falta para subir al siguiente rango. Los puntos se ganan escaneando el QR de asistencia al final de cada evento.
- **Certificados:** Enlace directo al visor de diplomas (Modal) para descarga inmediata en PDF.

### 1.4.2. Matriz de Rangos y Niveles

Tu estatus evoluciona dinámicamente según la siguiente escala de mérito:

| Rango        | Requisito (XP) | Beneficios Exclusivos                                      |
| :----------- | :------------- | :--------------------------------------------------------- |
| **Beginner** | 0 - 500 XP     | Acceso a Comunidad General y Talleres de Introducción.     |
| **Explorer** | 501 - 2000 XP  | Acceso a Sorteos de Licencias y Canales de Networking.     |
| **Expert**   | 2001 - 5000 XP | Acceso total a la Biblioteca VIP y Speaker Kits.           |
| **Legend**   | 5001+ XP       | Mentoría con expertos, Insignia de Oro y rol de Moderador. |

---

:::info NOTA SOBRE CERTIFICADOS
Los certificados se emiten **automáticamente** una vez que el Organizador cierra el evento y tu asistencia ha sido validada vía QR. Puedes verificarlos en cualquier momento en la sección de **Validación Pública**.
:::

_¿Listo para tu primer taller? Continúa con la **[Guía de Participación en Eventos](./gestion-eventos)**._

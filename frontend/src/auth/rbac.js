// ==========================================
// DEFINICIÓN DE ROLES DEL SISTEMA (RBAC)
// ==========================================
export const ROLE_VISITANTE = 'VISITANTE';     // Usuario no autenticado (público general)
export const ROLE_MIEMBRO = 'MIEMBRO';         // Miembro o estudiante registrado base
export const ROLE_VOLUNTARIO = 'VOLUNTARIO';   // Voluntario del staff operativo y de apoyo
export const ROLE_SPEAKER = 'SPEAKER';         // Expositor / Ponente invitado
export const ROLE_MENTOR = 'MENTOR';           // Mentor técnico o guía de comunidad
export const ROLE_EMBAJADOR = 'EMBAJADOR';     // Representante de comunidad o miembro distinguido
export const ROLE_MODERADOR = 'MODERADOR';     // Ponente / Conferencista y supervisor de contenido
export const ROLE_SOPORTE = 'SOPORTE';         // Personal de soporte administrativo
export const ROLE_ORGANIZADOR = 'ORGANIZADOR'; // Líder de comunidad u organizador de eventos/academia
export const ROLE_ADMIN = 'ADMIN';             // Superusuario con acceso total

// ==========================================
// DEFINICIÓN DE PERMISOS TÉCNICOS
// ==========================================
export const PERMISSION_VIP_ACCESS = 'vip.access';                   // Acceder a recursos y eventos VIP
export const PERMISSION_SPEAKER_ACCESS = 'speaker.access';           // Acceder al kit del conferencista (Speaker Kit)
export const PERMISSION_EVENTS_MANAGE = 'events.manage';             // Crear, editar y eliminar eventos
export const PERMISSION_ATTENDANCE_SCAN = 'attendance.scan';         // Escanear QR para el control de asistencia
export const PERMISSION_PAYMENTS_READ_ALL = 'payments.read_all';     // Ver el listado histórico de todos los pagos
export const PERMISSION_PAYMENTS_VALIDATE = 'payments.validate';     // Validar (aprobar/rechazar) transacciones reportadas
export const PERMISSION_AUDIT_READ = 'audit.read';                   // Ver el registro detallado de auditoría del sistema
export const PERMISSION_USERS_READ = 'users.read';                   // Consultar listado de miembros registrados
export const PERMISSION_COURSES_MANAGE = 'courses.manage';           // Administrar cursos, lecciones, tareas y recursos
export const PERMISSION_ANNOUNCEMENTS_MANAGE = 'announcements.manage';// Emitir y gestionar comunicados oficiales
export const PERMISSION_BADGES_MANAGE = 'badges.manage';             // Crear, editar y asignar insignias (badges)

// ==========================================
// ESTRUCTURA DE HERENCIA DE ROLES
// Define qué roles heredan las capacidades de otros roles inferiores
// ==========================================
const roleInheritance = {
  [ROLE_MIEMBRO]: [],
  [ROLE_VOLUNTARIO]: [ROLE_MIEMBRO],                 // Voluntario hereda permisos de Miembro base
  [ROLE_SPEAKER]: [ROLE_MIEMBRO],                    // Speaker hereda permisos de Miembro base
  [ROLE_MENTOR]: [ROLE_MIEMBRO],                     // Mentor hereda permisos de Miembro base
  [ROLE_EMBAJADOR]: [ROLE_MIEMBRO],                  // Embajador hereda todo lo de Miembro
  [ROLE_MODERADOR]: [ROLE_EMBAJADOR],                // Moderador hereda todo lo de Embajador
  [ROLE_SOPORTE]: [ROLE_MIEMBRO],                    // Soporte hereda todo lo de Miembro
  [ROLE_ORGANIZADOR]: [ROLE_MODERADOR],              // Organizador hereda todo lo de Moderador
  [ROLE_ADMIN]: [ROLE_ORGANIZADOR, ROLE_SOPORTE],    // Admin hereda de Organizador y Soporte
};

// ==========================================
// PERMISOS DIRECTOS ASIGNADOS A CADA ROL
// ==========================================
const directPermissions = {
  [ROLE_MIEMBRO]: [],
  [ROLE_VOLUNTARIO]: [PERMISSION_ATTENDANCE_SCAN],
  [ROLE_SPEAKER]: [PERMISSION_SPEAKER_ACCESS],
  [ROLE_MENTOR]: [],
  [ROLE_EMBAJADOR]: [PERMISSION_VIP_ACCESS],
  [ROLE_MODERADOR]: [
    PERMISSION_SPEAKER_ACCESS,
    PERMISSION_EVENTS_MANAGE,
    PERMISSION_COURSES_MANAGE
  ],
  [ROLE_SOPORTE]: [
    PERMISSION_USERS_READ,
    PERMISSION_PAYMENTS_READ_ALL,
    PERMISSION_PAYMENTS_VALIDATE,
    PERMISSION_COURSES_MANAGE,
    PERMISSION_BADGES_MANAGE
  ],
  [ROLE_ORGANIZADOR]: [
    PERMISSION_USERS_READ,
    PERMISSION_ATTENDANCE_SCAN,
    PERMISSION_COURSES_MANAGE,
    PERMISSION_ANNOUNCEMENTS_MANAGE,
    PERMISSION_PAYMENTS_READ_ALL,
    PERMISSION_PAYMENTS_VALIDATE,
    PERMISSION_BADGES_MANAGE
  ],
  [ROLE_ADMIN]: [PERMISSION_AUDIT_READ],
};

// ==========================================
// FUNCIONES AUXILIARES DE CONTROL DE ACCESO
// ==========================================

// Obtiene todos los roles que hereda un rol específico (recorrido recursivo)
const getEffectiveRoles = (role) => {
  const visited = new Set();

  const collect = (currentRole) => {
    if (!currentRole || visited.has(currentRole)) return;
    visited.add(currentRole);
    (roleInheritance[currentRole] || []).forEach(collect);
  };

  collect(role);
  return visited;
};

// Normaliza un rol individual, un arreglo de roles o una cadena separada por comas
export const getNormalizedUserRoles = (userRoleOrRoles) => {
  if (!userRoleOrRoles) return [];
  if (Array.isArray(userRoleOrRoles)) return userRoleOrRoles.filter(Boolean);
  if (typeof userRoleOrRoles === 'string') {
    return userRoleOrRoles.split(',').map((r) => r.trim()).filter(Boolean);
  }
  return [];
};

// Comprueba si el rol del usuario (o cualquiera de sus roles acumulados) coincide con los roles permitidos
export const hasAnyRole = (userRoleOrRoles, allowedRoles = []) => {
  if (!userRoleOrRoles) return false;
  if (allowedRoles.length === 0) return true;

  const roles = getNormalizedUserRoles(userRoleOrRoles);
  return roles.some((role) => {
    const effectiveRoles = getEffectiveRoles(role);
    return allowedRoles.some((allowedRole) => effectiveRoles.has(allowedRole));
  });
};

// Comprueba si el rol de un usuario (o cualquiera de sus roles acumulados) posee un permiso técnico solicitado
export const hasPermission = (userRoleOrRoles, permission) => {
  if (!userRoleOrRoles) return false;

  const roles = getNormalizedUserRoles(userRoleOrRoles);
  for (const role of roles) {
    const effectiveRoles = getEffectiveRoles(role);
    for (const r of effectiveRoles) {
      if ((directPermissions[r] || []).includes(permission)) {
        return true;
      }
    }
  }

  return false;
};

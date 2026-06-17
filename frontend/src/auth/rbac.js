export const ROLE_VISITANTE = 'VISITANTE';
export const ROLE_MIEMBRO = 'MIEMBRO';
export const ROLE_EMBAJADOR = 'EMBAJADOR';
export const ROLE_MODERADOR = 'MODERADOR';
export const ROLE_SOPORTE = 'SOPORTE';
export const ROLE_ORGANIZADOR = 'ORGANIZADOR';
export const ROLE_ADMIN = 'ADMIN';

export const PERMISSION_VIP_ACCESS = 'vip.access';
export const PERMISSION_SPEAKER_ACCESS = 'speaker.access';
export const PERMISSION_EVENTS_MANAGE = 'events.manage';
export const PERMISSION_ATTENDANCE_SCAN = 'attendance.scan';
export const PERMISSION_PAYMENTS_READ_ALL = 'payments.read_all';
export const PERMISSION_PAYMENTS_VALIDATE = 'payments.validate';
export const PERMISSION_AUDIT_READ = 'audit.read';
export const PERMISSION_USERS_READ = 'users.read';
export const PERMISSION_COURSES_MANAGE = 'courses.manage';
export const PERMISSION_ANNOUNCEMENTS_MANAGE = 'announcements.manage';
export const PERMISSION_BADGES_MANAGE = 'badges.manage';

const roleInheritance = {
  [ROLE_MIEMBRO]: [],
  [ROLE_EMBAJADOR]: [ROLE_MIEMBRO],
  [ROLE_MODERADOR]: [ROLE_EMBAJADOR],
  [ROLE_SOPORTE]: [ROLE_MIEMBRO],
  [ROLE_ORGANIZADOR]: [ROLE_MODERADOR],
  [ROLE_ADMIN]: [ROLE_ORGANIZADOR, ROLE_SOPORTE],
};

const directPermissions = {
  [ROLE_MIEMBRO]: [],
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

export const hasAnyRole = (userRole, allowedRoles = []) => {
  if (!userRole) return false;
  if (allowedRoles.length === 0) return true;

  const effectiveRoles = getEffectiveRoles(userRole);
  return allowedRoles.some((allowedRole) => effectiveRoles.has(allowedRole));
};

export const hasPermission = (userRole, permission) => {
  if (!userRole) return false;

  const effectiveRoles = getEffectiveRoles(userRole);
  const permissions = new Set();
  for (const role of effectiveRoles) {
    (directPermissions[role] || []).forEach((item) => permissions.add(item));
  }

  return permissions.has(permission);
};

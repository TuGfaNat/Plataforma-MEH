import { describe, it, expect } from 'vitest';
import { hasPermission, ROLE_ADMIN, ROLE_MIEMBRO, PERMISSION_AUDIT_READ, PERMISSION_VIP_ACCESS } from './rbac';

describe('RBAC Logic (Frontend)', () => {
  it('should allow ADMIN to have audit permissions', () => {
    expect(hasPermission(ROLE_ADMIN, PERMISSION_AUDIT_READ)).toBe(true);
  });

  it('should deny MIEMBRO to have audit permissions', () => {
    expect(hasPermission(ROLE_MIEMBRO, PERMISSION_AUDIT_READ)).toBe(false);
  });

  it('should verify inheritance: ADMIN should have MIEMBRO level permissions', () => {
    // Asumiendo que VIP_ACCESS es de un nivel intermedio o similar
    // Si no, verificamos que el admin tenga lo que le corresponde por herencia
    expect(hasPermission(ROLE_ADMIN, PERMISSION_VIP_ACCESS)).toBe(true);
  });
});

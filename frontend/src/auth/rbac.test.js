import { describe, it, expect } from 'vitest';
import {
  hasPermission,
  ROLE_ADMIN,
  ROLE_MIEMBRO,
  ROLE_SPEAKER,
  ROLE_MENTOR,
  PERMISSION_AUDIT_READ,
  PERMISSION_VIP_ACCESS,
  PERMISSION_SPEAKER_ACCESS,
  PERMISSION_EVENTS_MANAGE,
} from './rbac';

describe('RBAC Logic (Frontend)', () => {
  it('should allow ADMIN to have audit permissions', () => {
    expect(hasPermission(ROLE_ADMIN, PERMISSION_AUDIT_READ)).toBe(true);
  });

  it('should deny MIEMBRO to have audit permissions', () => {
    expect(hasPermission(ROLE_MIEMBRO, PERMISSION_AUDIT_READ)).toBe(false);
  });

  it('should verify inheritance: ADMIN should have MIEMBRO level permissions', () => {
    expect(hasPermission(ROLE_ADMIN, PERMISSION_VIP_ACCESS)).toBe(true);
  });

  it('should allow SPEAKER to access speaker kit but not manage events or audit', () => {
    expect(hasPermission(ROLE_SPEAKER, PERMISSION_SPEAKER_ACCESS)).toBe(true);
    expect(hasPermission(ROLE_SPEAKER, PERMISSION_EVENTS_MANAGE)).toBe(false);
    expect(hasPermission(ROLE_SPEAKER, PERMISSION_AUDIT_READ)).toBe(false);
  });

  it('should restrict MENTOR to basic member permissions without staff privileges', () => {
    expect(hasPermission(ROLE_MENTOR, PERMISSION_EVENTS_MANAGE)).toBe(false);
    expect(hasPermission(ROLE_MENTOR, PERMISSION_AUDIT_READ)).toBe(false);
  });

  it('should allow VOLUNTARIO to scan attendance and support double roles (VOLUNTARIO + SPEAKER)', async () => {
    const { ROLE_VOLUNTARIO, PERMISSION_ATTENDANCE_SCAN } = await import('./rbac');
    // 1. Permiso directo de voluntario
    expect(hasPermission(ROLE_VOLUNTARIO, PERMISSION_ATTENDANCE_SCAN)).toBe(true);
    expect(hasPermission(ROLE_VOLUNTARIO, PERMISSION_EVENTS_MANAGE)).toBe(false);

    // 2. Doble rol: VOLUNTARIO + SPEAKER
    const dualRoles = ['VOLUNTARIO', 'SPEAKER'];
    expect(hasPermission(dualRoles, PERMISSION_ATTENDANCE_SCAN)).toBe(true);
    expect(hasPermission(dualRoles, PERMISSION_SPEAKER_ACCESS)).toBe(true);
    expect(hasPermission(dualRoles, PERMISSION_EVENTS_MANAGE)).toBe(false);

    // 3. Cadena separada por comas
    expect(hasPermission('VOLUNTARIO, SPEAKER', PERMISSION_ATTENDANCE_SCAN)).toBe(true);
    expect(hasPermission('VOLUNTARIO, SPEAKER', PERMISSION_SPEAKER_ACCESS)).toBe(true);
  });
});

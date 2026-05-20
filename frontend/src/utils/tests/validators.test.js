import { describe, it, expect } from 'vitest';
import { validatePassword } from '../validators';

describe('validatePassword', () => {
    it('should return error if password is missing', () => {
        expect(validatePassword()).toBe("La contraseña es obligatoria");
        expect(validatePassword(null)).toBe("La contraseña es obligatoria");
        expect(validatePassword('')).toBe("La contraseña es obligatoria");
    });

    it('should return error if password is less than 8 characters', () => {
        expect(validatePassword('aB34567')).toBe("Mínimo 8 caracteres");
        expect(validatePassword('1234567')).toBe("Mínimo 8 caracteres");
        expect(validatePassword('abcdefg')).toBe("Mínimo 8 caracteres");
    });

    it('should return error if password has 8+ characters but missing numbers', () => {
        expect(validatePassword('abcdefgh')).toBe("Debe incluir letras y números");
        expect(validatePassword('ABCDEFGH')).toBe("Debe incluir letras y números");
        expect(validatePassword('aBcDeFgH')).toBe("Debe incluir letras y números");
    });

    it('should return error if password has 8+ characters but missing letters', () => {
        expect(validatePassword('12345678')).toBe("Debe incluir letras y números");
        expect(validatePassword('1234567890')).toBe("Debe incluir letras y números");
    });

    it('should return null for valid password (8+ characters, letters and numbers)', () => {
        expect(validatePassword('aB345678')).toBeNull();
        expect(validatePassword('1234567a')).toBeNull();
        expect(validatePassword('password123')).toBeNull();
    });

    it('should return null for valid passwords with special characters', () => {
        expect(validatePassword('aB345678!')).toBeNull();
        expect(validatePassword('passw@rd1')).toBeNull();
        expect(validatePassword('1234!@#a')).toBeNull();
    });
});

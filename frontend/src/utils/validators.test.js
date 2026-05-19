import { describe, it, expect } from 'vitest';
import { validateName } from './validators';

describe('validateName', () => {
    it('returns null for valid names', () => {
        expect(validateName('Juan')).toBeNull();
        expect(validateName('María José')).toBeNull();
        expect(validateName('Ñandú')).toBeNull();
        expect(validateName('René')).toBeNull();
    });

    it('returns "Este campo es obligatorio" for empty, null, or undefined values', () => {
        expect(validateName('')).toBe("Este campo es obligatorio");
        expect(validateName(null)).toBe("Este campo es obligatorio");
        expect(validateName(undefined)).toBe("Este campo es obligatorio");
    });

    it('returns "Solo letras y espacios (2-50 caracteres)" for strings with invalid characters', () => {
        expect(validateName('Juan123')).toBe("Solo letras y espacios (2-50 caracteres)");
        expect(validateName('María@')).toBe("Solo letras y espacios (2-50 caracteres)");
        expect(validateName('John_Doe')).toBe("Solo letras y espacios (2-50 caracteres)");
        expect(validateName('<script>')).toBe("Solo letras y espacios (2-50 caracteres)");
    });

    it('handles length constraints correctly', () => {
        // Minimum boundary (2 characters)
        expect(validateName('Ed')).toBeNull();
        // Too short (1 character)
        expect(validateName('A')).toBe("Solo letras y espacios (2-50 caracteres)");

        // Maximum boundary (50 characters)
        const fiftyChars = 'a'.repeat(50);
        expect(validateName(fiftyChars)).toBeNull();

        // Too long (51 characters)
        const fiftyOneChars = 'a'.repeat(51);
        expect(validateName(fiftyOneChars)).toBe("Solo letras y espacios (2-50 caracteres)");
    });
});

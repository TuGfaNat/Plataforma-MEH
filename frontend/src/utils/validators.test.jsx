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
import { validateEmail } from './validators';

describe('validateEmail', () => {
    describe('Valid emails', () => {
        const validEmails = [
            "test@example.com",
            "test.name+tag@example.com",
            "test@sub.example.com",
            "1234567890@example.com",
            "email@example-one.com",
            "_______@example.com",
            "email@example.name",
            "email@example.museum",
            "email@example.co.jp",
            "firstname-lastname@example.com",
            "email@[123.123.123.123]",
            "USER@EXAMPLE.COM", // Should be converted to lowercase internally
            "User.Name@Example.Com",
            "user@m.youtube.com", // Single-character subdomain
            "admin@a.root-servers.net",
            "test@x.example.com"
        ];

        validEmails.forEach((email) => {
            it(`should return null for valid email: ${email}`, () => {
                expect(validateEmail(email)).toBeNull();
            });
        });
    });

    describe('Invalid emails', () => {
        const invalidEmails = [
            "plainaddress",
            "#@%^%#$@#$@#.com",
            "@example.com",
            "Joe Smith <email@example.com>",
            "email.example.com",
            "email@example@example.com",
            ".email@example.com",
            "email.@example.com",
            "email..email@example.com",
            "email@example.com (Joe Smith)",
            "email@example",
            "email@-example.com",
            "email@example..com",
            "Abc..123@example.com",
            "email@111.222.333.44444"
        ];

        invalidEmails.forEach((email) => {
            it(`should return "Formato de correo inválido" for invalid email: ${email}`, () => {
                expect(validateEmail(email)).toBe("Formato de correo inválido");
            });
        });
    });

    describe('Empty values', () => {
        const emptyValues = [
            null,
            undefined,
            "",
            false,
            0
        ];

        emptyValues.forEach((value) => {
            it(`should return "El correo es obligatorio" for empty value: ${value}`, () => {
                expect(validateEmail(value)).toBe("El correo es obligatorio");
            });
        });
    });

    describe('Edge cases', () => {
        it('should handle extremely long emails', () => {
            const longEmail = "a".repeat(200) + "@example.com";
            expect(validateEmail(longEmail)).toBeNull();
        });

        it('should handle emails with objects passed instead of string (should stringify)', () => {
            // Note: Our code does String(email).toLowerCase() which returns "[object object]"
            // the regex will fail.
            const obj = {};
            expect(validateEmail(obj)).toBe("Formato de correo inválido");
        });
    });
});

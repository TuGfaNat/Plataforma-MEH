/**
 * Lógica de Validación Universal - Plataforma MEH
 * Basado en el estándar de integridad académica UMSA.
 */

export const validateName = (name) => {
    // Solo letras y espacios, longitud entre 2 y 50
    const re = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/;
    if (!name) return "Este campo es obligatorio";
    if (!re.test(String(name))) return "Solo letras y espacios (2-50 caracteres)";
    return null;
};

export const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!email) return "El correo es obligatorio";
    if (!re.test(String(email).toLowerCase())) return "Formato de correo inválido";
    return null;
};

export const validatePassword = (pass) => {
    // Mínimo 8 caracteres, al menos una letra y un número
    if (!pass) return "La contraseña es obligatoria";
    if (pass.length < 8) return "Mínimo 8 caracteres";
    if (!/[A-Za-z]/.test(pass) || !/[0-9]/.test(pass)) return "Debe incluir letras y números";
    return null;
};

export const hasErrors = (errors) => {
    return Object.values(errors).some(error => error !== null);
};

export const getValidationError = (field, value) => {
    switch(field) {
        case 'nombres':
        case 'apellidos':
            return validateName(value);
        case 'correo':
            return validateEmail(value);
        case 'password':
            return validatePassword(value);
        default:
            return null;
    }
};

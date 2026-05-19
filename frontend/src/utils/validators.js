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
    // Uses a stricter regex that doesn't allow leading dashes in the domain, ensuring domain parts only start/end with letters/numbers.
    // Adjusted to support single-character subdomains.
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}))$/;
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

export const validateRequired = (value) => {
    if (!value || String(value).trim() === "") return "Este campo es obligatorio";
    return null;
};

export const validateBio = (bio) => {
    if (!bio) return "La biografía es obligatoria";
    if (bio.length < 20) return "La biografía debe tener al menos 20 caracteres";
    if (bio.length > 500) return "Máximo 500 caracteres";
    return null;
};

export const validateUrl = (url) => {
    if (!url) return null; // Opcional
    try {
        new URL(url);
        return null;
    } catch (_) {
        return "URL inválida (incluye http/https)";
    }
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
        case 'bio':
            return validateBio(value);
        case 'alias':
        case 'institucion':
        case 'departamento':
            return validateRequired(value);
        case 'linkedin_url':
        case 'github_url':
        case 'facebook_url':
        case 'instagram_url':
        case 'tiktok_url':
        case 'learning_path_url':
            return validateUrl(value);
        default:
            return null;
    }
};

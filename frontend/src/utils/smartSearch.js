/**
 * Utilidad de búsqueda inteligente tolerante a:
 * - Tildes y diacríticos (Sánchez <-> Sanchez, Mújica <-> Mujica)
 * - Nombres intermedios omitidos o invertidos ("Edgar Sanchez" -> "Edgar Alejandro Sanchez Rubin de Celis")
 * - Espacios extra o caracteres invisibles al copiar y pegar desde WhatsApp/chats
 * - Variaciones fonéticas comunes en nombres en español (Jhonatan/Jonathan, Yersson/Yerson, Ericka/Erika, Jesiree/Jesire, Chavez/Chávez/Chaves)
 * - Errores de tipeo de 1 carácter (distancia de edición Levenshtein <= 1 en palabras de >= 4 letras)
 */

export function normalizeSearchText(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar tildes
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // quitar caracteres invisibles de WhatsApp/portapapeles
    .replace(/[@.,\-_()/\\|"'`~:;!?+#*[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function phoneticSpanishNormalize(word) {
  if (!word) return '';
  return word
    .replace(/ph/g, 'f')
    .replace(/qu([ei])/g, 'c$1')
    .replace(/k/g, 'c')
    .replace(/c([ei])/g, 's$1')
    .replace(/z/g, 's')
    .replace(/v/g, 'b')
    .replace(/ll/g, 'i')
    .replace(/y/g, 'i')
    .replace(/g([ei])/g, 'j$1')
    .replace(/(?<!c)h/g, '') // h muda (Jhonatan -> Jonatan, Quisberth -> Quisbert), preservando ch
    .replace(/(.)\1+/g, '$1'); // letras dobles (Yersson -> Yerson, Jesiree -> Jesire)
}

function isWithinEditDistanceOne(a, b) {
  if (a === b) return true;
  const lenA = a.length;
  const lenB = b.length;
  if (Math.abs(lenA - lenB) > 1) return false;

  let i = 0;
  let j = 0;
  let edits = 0;

  while (i < lenA && j < lenB) {
    if (a[i] === b[j]) {
      i++;
      j++;
    } else {
      edits++;
      if (edits > 1) return false;
      if (lenA > lenB) {
        i++;
      } else if (lenB > lenA) {
        j++;
      } else {
        i++;
        j++;
      }
    }
  }

  if (i < lenA || j < lenB) edits++;
  return edits <= 1;
}

export function matchesSmartSearch(fieldsOrText, rawQuery) {
  if (!rawQuery || !String(rawQuery).trim()) return true;

  const queryNorm = normalizeSearchText(rawQuery);
  if (!queryNorm) return true;

  const targetRaw = Array.isArray(fieldsOrText)
    ? fieldsOrText.filter(Boolean).join(' ')
    : String(fieldsOrText || '');

  const targetNorm = normalizeSearchText(targetRaw);
  if (!targetNorm) return false;

  // Coincidencia directa rápida
  if (targetNorm.includes(queryNorm)) return true;

  const queryTokens = queryNorm.split(' ').filter(Boolean);
  const targetWords = targetNorm.split(' ').filter(Boolean);
  const targetPhoneticWords = targetWords.map(phoneticSpanishNormalize);

  // Cada palabra buscada debe coincidir con al menos una parte o palabra del registro
  return queryTokens.every((qToken) => {
    // 1. Subcadena exacta sin tildes (ej: parte de correo, alias o apellido)
    if (targetNorm.includes(qToken)) return true;

    // 2. Coincidencia fonética (ej: Jhonatan vs Jonathan, Yersson vs Yerson, Ericka vs Erika)
    const qPhonetic = phoneticSpanishNormalize(qToken);
    if (qPhonetic.length >= 2) {
      for (const twPhon of targetPhoneticWords) {
        if (twPhon.includes(qPhonetic)) return true;
      }
    }

    // 3. Tolerancia a 1 letra de error tipográfico en palabras de >= 4 caracteres
    if (qToken.length >= 4) {
      for (let idx = 0; idx < targetWords.length; idx++) {
        const tw = targetWords[idx];
        const twPhon = targetPhoneticWords[idx];
        if (tw.length >= 3) {
          if (isWithinEditDistanceOne(tw, qToken)) return true;
          if (tw.length > qToken.length && isWithinEditDistanceOne(tw.slice(0, qToken.length), qToken)) {
            return true;
          }
        }
        if (twPhon.length >= 3 && qPhonetic.length >= 3) {
          if (isWithinEditDistanceOne(twPhon, qPhonetic)) return true;
        }
      }
    }

    return false;
  });
}

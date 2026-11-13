/**
 * Utilidades de manipulación y limpieza de texto y HTML para la plataforma MEH.
 */

export const stripHtml = (html) => {
  if (!html || typeof html !== 'string') return '';
  return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
};

export const hasHtmlTags = (str) => {
  if (!str || typeof str !== 'string') return false;
  return /<[a-z][\s\S]*>/i.test(str);
};

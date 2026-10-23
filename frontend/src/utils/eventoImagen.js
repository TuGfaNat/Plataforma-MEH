import { resolveApiFileUrl } from '../services/api';

export const DEFAULT_EVENT_IMG =
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop';

/**
 * Determina si un evento cuenta con una imagen de portada configurada.
 */
export function hasEventoCustomCover(evento) {
  if (!evento) return false;
  if (evento.imagen_variantes && typeof evento.imagen_variantes.tiene_imagen === 'boolean') {
    return evento.imagen_variantes.tiene_imagen;
  }
  return Boolean(
    (evento.imagen_url && String(evento.imagen_url).trim()) ||
      (evento.imagen_url_original && String(evento.imagen_url_original).trim())
  );
}

/**
 * Obtiene todas las variantes resueltas (original, 16:9, 1:1) de la portada de un evento.
 */
export function getEventoCoverVariants(evento) {
  const hasImage = hasEventoCustomCover(evento);
  if (!hasImage) {
    return {
      hasImage: false,
      original: DEFAULT_EVENT_IMG,
      widescreen16x9: DEFAULT_EVENT_IMG,
      square1x1: DEFAULT_EVENT_IMG,
      fallback: DEFAULT_EVENT_IMG,
      recommendedDetailMode: 'fallback',
    };
  }

  const rawOrig =
    evento.imagen_url_original ||
    evento.imagen_variantes?.original ||
    evento.imagen_url;
  const raw16x9 =
    evento.imagen_url_16x9 ||
    evento.imagen_variantes?.widescreen_16x9 ||
    rawOrig;
  const raw1x1 =
    evento.imagen_url_1x1 ||
    evento.imagen_variantes?.square_1x1 ||
    rawOrig;

  const original = resolveApiFileUrl(rawOrig) || DEFAULT_EVENT_IMG;
  const widescreen16x9 = resolveApiFileUrl(raw16x9) || original;
  const square1x1 = resolveApiFileUrl(raw1x1) || original;

  return {
    hasImage: true,
    original,
    widescreen16x9,
    square1x1,
    fallback: DEFAULT_EVENT_IMG,
    recommendedDetailMode: evento.imagen_variantes?.modo_detalle || 'flexible',
  };
}

/**
 * Devuelve la URL de imagen adecuada según el contexto en la web:
 * - '16:9' | 'list' | 'card' -> variante 16:9 para listados y tarjetas
 * - '1:1' | 'square' | 'thumbnail' -> variante 1:1 para miniaturas o vista cuadrada
 * - 'detail' | 'original' | 'flexible' -> imagen original para vista de detalle
 */
export function getEventoCoverByContext(evento, context = '16:9') {
  const variants = getEventoCoverVariants(evento);
  const norm = String(context || '16:9').toLowerCase();

  if (norm === '1:1' || norm === 'square' || norm === 'thumbnail') {
    return variants.square1x1;
  }
  if (norm === 'detail' || norm === 'original' || norm === 'flexible') {
    return variants.original;
  }
  return variants.widescreen16x9;
}

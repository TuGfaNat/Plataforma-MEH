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

/**
 * Optimiza imágenes grandes en el cliente (< 800 KB) mediante HTML5 Canvas
 * para evitar errores HTTP 413 (Content Too Large) en proxies externos con límite de 1 MB.
 */
export async function optimizeImageForUpload(
  file,
  { maxBytes = 800 * 1024, maxDimension = 1920 } = {}
) {
  if (!file || typeof document === 'undefined' || file.size <= maxBytes) {
    return file;
  }
  if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
    return file;
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const srcWidth = img.naturalWidth || img.width;
      const srcHeight = img.naturalHeight || img.height;

      if (!srcWidth || !srcHeight) {
        resolve(file);
        return;
      }

      const scale = Math.min(1, maxDimension / Math.max(srcWidth, srcHeight));
      const targetWidth = Math.max(64, Math.round(srcWidth * scale));
      const targetHeight = Math.max(64, Math.round(srcHeight * scale));

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx || typeof canvas.toBlob !== 'function') {
        resolve(file);
        return;
      }

      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const baseName = (file.name || 'portada').replace(/\.[^.]+$/, '');
      const qualities = [0.84, 0.72, 0.6];

      const tryEncode = (idx) => {
        const quality = qualities[idx] ?? 0.6;
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            if (blob.size <= maxBytes || idx >= qualities.length - 1) {
              const optimizedFile = new File([blob], `${baseName}.jpg`, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(optimizedFile);
              return;
            }
            tryEncode(idx + 1);
          },
          'image/jpeg',
          quality
        );
      };

      tryEncode(0);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

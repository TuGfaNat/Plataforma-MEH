import api from '../services/api';
import { optimizeImageForUpload } from './eventoImagen';

/**
 * Sube un archivo al backend (/api/files/upload).
 * Si el archivo es una imagen y supera el límite de seguridad (800 KB),
 * lo optimiza/comprime en el navegador mediante HTML5 Canvas para evitar
 * el error HTTP 413 (Payload Too Large) provocado por reverse proxies
 * (como Nginx en VPS) con límite por defecto de 1MB.
 *
 * @param {File} rawFile - Archivo seleccionado por el usuario.
 * @param {Object} [options] - Opciones de compresión.
 * @param {number} [options.maxBytes=819200] - Tamaño máximo deseado en bytes (default 800 KB).
 * @param {number} [options.maxDimension=1920] - Dimensión máxima (ancho o alto) en píxeles.
 * @returns {Promise<{ status: string, url: string, local_path: string }>}
 */
export async function uploadFile(rawFile, options = {}) {
  if (!rawFile) {
    throw new Error('No se ha proporcionado ningún archivo para subir.');
  }

  let fileToUpload = rawFile;
  const mimeType = (rawFile.type || '').toLowerCase();
  const isImage = mimeType.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg)$/i.test(rawFile.name || '');

  // Solo optimizamos imágenes de tipo bitmap (JPEG, PNG, WebP)
  if (isImage && !mimeType.includes('svg') && !mimeType.includes('gif')) {
    try {
      fileToUpload = await optimizeImageForUpload(rawFile, {
        maxBytes: options.maxBytes || 800 * 1024,
        maxDimension: options.maxDimension || 1920,
      });
    } catch (optimizeError) {
      console.warn('No se pudo optimizar la imagen antes de subirla, intentando subida original:', optimizeError);
    }
  }

  const formData = new FormData();
  formData.append('file', fileToUpload);

  try {
    const res = await api.post('/files/upload', formData);
    return res.data;
  } catch (err) {
    if (err.response?.status === 413) {
      const error = new Error('La imagen excede el límite de tamaño permitido por el servidor (HTTP 413). Por favor sube una imagen de menor peso.');
      error.status = 413;
      error.response = err.response;
      throw error;
    }
    throw err;
  }
}

export default uploadFile;

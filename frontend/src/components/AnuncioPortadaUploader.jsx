import React, { useState, useEffect, useMemo } from 'react';
import {
  Badge,
  Button,
  Field,
  Input,
  MessageBar,
  MessageBarBody,
  Spinner,
  tokens,
} from '@fluentui/react-components';
import {
  Delete24Regular,
  Image24Regular,
  ArrowUpload24Regular,
} from '@fluentui/react-icons';
import { MEHButton, MEHTypography } from './ui';
import eventoService from '../services/eventoService';
import { optimizeImageForUpload } from '../utils/eventoImagen';
import { resolveApiFileUrl } from '../services/api';

const MAX_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

/**
 * Resuelve las 3 variantes (original, 16:9, 1:1) a partir de una URL dada.
 */
export function resolveAnuncioImageVariants(url) {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return {
      hasImage: false,
      activeVariant: '16:9',
      original: null,
      widescreen16x9: null,
      square1x1: null,
    };
  }

  const clean = url.trim();
  const match = clean.match(/^(.*)_(?:orig|16x9|1x1)(\.(?:jpg|jpeg|png|webp))$/i);
  let activeVariant = '16:9';
  if (clean.includes('_1x1')) activeVariant = '1:1';
  else if (clean.includes('_orig')) activeVariant = 'original';
  else if (clean.includes('_16x9')) activeVariant = '16:9';

  if (match) {
    const prefix = match[1];
    const ext = match[2];
    return {
      hasImage: true,
      activeVariant,
      original: `${prefix}_orig${ext}`,
      widescreen16x9: `${prefix}_16x9${ext}`,
      square1x1: `${prefix}_1x1${ext}`,
    };
  }

  return {
    hasImage: true,
    activeVariant,
    original: clean,
    widescreen16x9: clean,
    square1x1: clean,
  };
}

const resolveUploadErrorMessage = (err) => {
  if (err?.response?.status === 413 || err?.status === 413) {
    return 'La imagen supera el límite permitido por el servidor proxy (HTTP 413). Intenta con una imagen más ligera o comprimida.';
  }
  const detail = err?.response?.data?.detail;
  if (typeof detail === 'string') {
    return detail;
  }
  return err?.message || 'No se pudo procesar la imagen del anuncio.';
};

const AnuncioPortadaUploader = ({
  value = '',
  onChange,
  notify,
  disabled = false,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Variantes locales calculadas o recibidas tras la subida
  const [localVariants, setLocalVariants] = useState(() => resolveAnuncioImageVariants(value));
  const [activeVariant, setActiveVariant] = useState(() => localVariants.activeVariant || '16:9');

  // Sincronizar si cambia `value` desde el padre (por ejemplo al cambiar entre anuncios en la lista)
  useEffect(() => {
    const resolved = resolveAnuncioImageVariants(value);
    setLocalVariants(resolved);
    if (resolved.hasImage) {
      setActiveVariant(resolved.activeVariant);
    }
  }, [value]);

  const hasImage = Boolean(localVariants.hasImage && value && String(value).trim());

  const notifyUser = (title, message, intent = 'info') => {
    if (notify) {
      notify(title, message, intent);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0] || null;
    setValidationError('');
    if (!file) {
      setSelectedFile(null);
      return;
    }

    const mime = (file.type || '').toLowerCase();
    const extAllowed = /\.(png|jpe?g|webp)$/i.test(file.name || '');
    if (!ALLOWED_TYPES.includes(mime) && !extAllowed) {
      setValidationError('Formato no soportado. Usa imágenes PNG, JPG o WEBP.');
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setValidationError('La imagen supera el límite máximo permitido de 8 MB.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadOrReplace = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setValidationError('');

    try {
      const payloadFile = await optimizeImageForUpload(selectedFile, {
        maxBytes: 800 * 1024,
        maxDimension: 1920,
      });

      const res = await eventoService.uploadImagenBorrador(payloadFile);

      const origUrl = res.imagen_url_original || res.imagen_url;
      const w16x9 = res.imagen_url_16x9 || origUrl;
      const s1x1 = res.imagen_url_1x1 || origUrl;

      const newVariants = {
        hasImage: true,
        activeVariant: activeVariant,
        original: origUrl,
        widescreen16x9: w16x9,
        square1x1: s1x1,
      };

      setLocalVariants(newVariants);

      // Asignar según la variante activa actual (por defecto 16:9)
      const targetUrl =
        activeVariant === '1:1'
          ? s1x1
          : activeVariant === 'original'
          ? origUrl
          : w16x9;

      if (onChange) {
        onChange(targetUrl);
      }

      notifyUser(
        'Imagen procesada',
        'Se generaron las variantes Panorámica 16:9, Cuadrada 1:1 y Original Completa.',
        'success'
      );

      setSelectedFile(null);
      setFileInputKey((prev) => prev + 1);
    } catch (err) {
      const msg = resolveUploadErrorMessage(err);
      setValidationError(msg);
      notifyUser('Error de imagen', msg, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleVariantChange = (variantKey) => {
    setActiveVariant(variantKey);
    if (!localVariants.hasImage) return;

    let targetUrl = localVariants.widescreen16x9;
    if (variantKey === '1:1') {
      targetUrl = localVariants.square1x1 || localVariants.original;
    } else if (variantKey === 'original') {
      targetUrl = localVariants.original;
    } else {
      targetUrl = localVariants.widescreen16x9 || localVariants.original;
    }

    if (onChange && targetUrl) {
      onChange(targetUrl);
    }
  };

  const handleRemoveImage = () => {
    setValidationError('');
    setSelectedFile(null);
    setFileInputKey((prev) => prev + 1);
    setLocalVariants({
      hasImage: false,
      activeVariant: '16:9',
      original: null,
      widescreen16x9: null,
      square1x1: null,
    });
    if (onChange) {
      onChange('');
    }
    notifyUser('Imagen quitada', 'El anuncio se publicará sin imagen adjunta.', 'info');
  };

  const currentPreviewSrc = useMemo(() => {
    if (!hasImage) return null;
    let raw = localVariants.widescreen16x9;
    if (activeVariant === '1:1') raw = localVariants.square1x1 || localVariants.original;
    if (activeVariant === 'original') raw = localVariants.original;
    if (!raw) raw = value;
    return resolveApiFileUrl(raw);
  }, [hasImage, activeVariant, localVariants, value]);

  const getPreviewImgStyle = () => {
    if (activeVariant === '1:1') {
      return {
        width: '180px',
        height: '180px',
        aspectRatio: '1 / 1',
        objectFit: 'cover',
        borderRadius: '12px',
        border: `1px solid ${tokens.colorNeutralStroke1}`,
      };
    }
    if (activeVariant === 'original') {
      return {
        maxWidth: '100%',
        maxHeight: '220px',
        objectFit: 'contain',
        borderRadius: '12px',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        border: `1px solid ${tokens.colorNeutralStroke1}`,
      };
    }
    return {
      width: '100%',
      maxWidth: '360px',
      aspectRatio: '16 / 9',
      objectFit: 'cover',
      borderRadius: '12px',
      border: `1px solid ${tokens.colorNeutralStroke1}`,
    };
  };

  const getVariantBadgeLabel = () => {
    if (!hasImage) return 'Sin imagen adjunta';
    if (activeVariant === '1:1') return 'Modo 1:1 Cuadrado activo';
    if (activeVariant === 'original') return 'Modo Original Completo activo';
    return 'Modo 16:9 Panorámico activo';
  };

  return (
    <div
      data-testid="anuncio-portada-uploader"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        padding: '16px',
        borderRadius: '14px',
        backgroundColor: tokens.colorNeutralBackground1,
        border: `1px solid ${tokens.colorNeutralBackground3}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div>
          <MEHTypography variant="h4" style={{ margin: 0 }}>
            <Image24Regular style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            Imagen del Anuncio (Panorámica 16:9, Cuadrada 1:1 o Completa)
          </MEHTypography>
          <MEHTypography
            variant="caption"
            style={{ opacity: 0.75, display: 'block', marginTop: '2px' }}
          >
            Se generan automáticamente las proporciones <b>16:9</b> (panorámica para tarjetas y correos),{' '}
            <b>1:1</b> (cuadrada compacta) y <b>Original</b> (para afiches o volantes completos).
          </MEHTypography>
        </div>
        <Badge
          color={hasImage ? 'success' : 'informative'}
          appearance="tint"
          data-testid="anuncio-portada-status-badge"
        >
          {getVariantBadgeLabel()}
        </Badge>
      </div>

      {validationError && (
        <MessageBar intent="error" data-testid="anuncio-portada-error">
          <MessageBarBody>{validationError}</MessageBarBody>
        </MessageBar>
      )}

      {/* Área interactiva de previsualización y selector de tamaño/proporción */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px',
            backgroundColor: tokens.colorNeutralBackground2,
            borderRadius: '14px',
            minWidth: '220px',
            minHeight: '140px',
            textAlign: 'center',
          }}
        >
          {hasImage && currentPreviewSrc ? (
            <img
              src={currentPreviewSrc}
              alt="Previsualización de la imagen del anuncio"
              data-testid="anuncio-portada-preview-img"
              style={getPreviewImgStyle()}
            />
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                padding: '16px',
                opacity: 0.6,
              }}
            >
              <Image24Regular style={{ fontSize: '36px' }} />
              <MEHTypography variant="caption">
                Sin imagen. Sube una foto o afiche para previsualizar.
              </MEHTypography>
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            flex: 1,
            minWidth: '220px',
          }}
        >
          <MEHTypography variant="caption" style={{ fontWeight: 'bold' }}>
            Seleccionar tamaño y proporción de despliegue:
          </MEHTypography>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button
              size="small"
              appearance={activeVariant === '16:9' ? 'primary' : 'outline'}
              onClick={() => handleVariantChange('16:9')}
              data-testid="anuncio-variant-16x9"
            >
              16:9 (Panorámico / Banner)
            </Button>
            <Button
              size="small"
              appearance={activeVariant === '1:1' ? 'primary' : 'outline'}
              onClick={() => handleVariantChange('1:1')}
              data-testid="anuncio-variant-1x1"
            >
              1:1 (Cuadrado / Tarjeta)
            </Button>
            <Button
              size="small"
              appearance={activeVariant === 'original' ? 'primary' : 'outline'}
              onClick={() => handleVariantChange('original')}
              data-testid="anuncio-variant-original"
            >
              Original / Afiche Completo
            </Button>
          </div>
          <MEHTypography variant="caption" style={{ opacity: 0.7 }}>
            La proporción seleccionada se aplicará directamente en el muro de comunidad y en las notificaciones.
          </MEHTypography>
        </div>
      </div>

      {/* Controles de subida / reemplazo y eliminación */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
        }}
      >
        <Field
          label={hasImage ? 'Reemplazar imagen del anuncio' : 'Subir imagen o portada'}
          style={{ flexGrow: 1, minWidth: '220px' }}
        >
          <Input
            type="file"
            key={fileInputKey}
            disabled={disabled || uploading}
            data-testid="anuncio-portada-file-input"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileSelect}
          />
        </Field>
        <MEHButton
          appearance="primary"
          icon={uploading ? <Spinner size="tiny" /> : <ArrowUpload24Regular />}
          disabled={disabled || uploading || !selectedFile}
          onClick={() => {
            void handleUploadOrReplace();
          }}
          data-testid="anuncio-portada-upload-btn"
        >
          {uploading ? 'Procesando...' : hasImage ? 'Reemplazar Imagen' : 'Subir Imagen'}
        </MEHButton>
        {hasImage && (
          <Button
            appearance="subtle"
            icon={<Delete24Regular />}
            disabled={disabled || uploading}
            style={{ color: tokens.colorPaletteRedForeground1 }}
            onClick={handleRemoveImage}
            data-testid="anuncio-portada-remove-btn"
          >
            Quitar Imagen
          </Button>
        )}
      </div>
    </div>
  );
};

export default AnuncioPortadaUploader;

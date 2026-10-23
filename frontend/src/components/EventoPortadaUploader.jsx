import React, { useState } from 'react';
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
import {
  getEventoCoverVariants,
  hasEventoCustomCover,
  optimizeImageForUpload,
} from '../utils/eventoImagen';

const MAX_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

const resolveUploadErrorMessage = (err) => {
  if (err?.response?.status === 413) {
    return 'La imagen excede el límite permitido por el servidor proxy (HTTP 413). Intenta con una imagen más ligera.';
  }
  const detail = err?.response?.data?.detail;
  if (typeof detail === 'string') {
    return detail;
  }
  return 'No se pudo procesar la imagen de portada.';
};

const EventoPortadaUploader = ({
  evento,
  onFormChange,
  onEventoUpdated,
  notify,
  mode = 'detail',
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [activePreviewVariant, setActivePreviewVariant] = useState('16:9');

  const hasCover = hasEventoCustomCover(evento);
  const variants = getEventoCoverVariants(evento);

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
      const payloadFile = await optimizeImageForUpload(selectedFile);
      if (mode === 'form' && onFormChange) {
        const res = await eventoService.uploadImagenBorrador(payloadFile);
        onFormChange({
          imagen_url: res.imagen_url,
          imagen_url_original: res.imagen_url_original,
          imagen_url_16x9: res.imagen_url_16x9,
          imagen_url_1x1: res.imagen_url_1x1,
          imagen_variantes: res.imagen_variantes,
        });
        notifyUser(
          'Portada procesada',
          'Se generaron las variantes Original, 16:9 y 1:1 para el evento.',
          'success'
        );
      } else if (evento?.id_evento) {
        const updated = await eventoService.uploadEventoImagen(
          evento.id_evento,
          payloadFile
        );
        if (onEventoUpdated) {
          await onEventoUpdated(updated);
        }
        notifyUser(
          'Portada actualizada',
          'La imagen de portada y sus variantes 16:9 y 1:1 se actualizaron correctamente.',
          'success'
        );
      }
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

  const handleRemoveCover = async () => {
    setRemoving(true);
    setValidationError('');
    try {
      if (mode === 'form' && onFormChange) {
        onFormChange({
          imagen_url: null,
          imagen_url_original: null,
          imagen_url_16x9: null,
          imagen_url_1x1: null,
          imagen_variantes: null,
        });
        notifyUser(
          'Portada quitada',
          'El evento usará el banner institucional por defecto.',
          'info'
        );
      } else if (evento?.id_evento) {
        const updated = await eventoService.deleteEventoImagen(evento.id_evento);
        if (onEventoUpdated) {
          await onEventoUpdated(updated);
        }
        notifyUser(
          'Portada eliminada',
          'Se quitó la imagen de portada y sus variantes del evento.',
          'info'
        );
      }
      setSelectedFile(null);
      setFileInputKey((prev) => prev + 1);
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg =
        typeof detail === 'string'
          ? detail
          : 'No se pudo quitar la imagen de portada.';
      setValidationError(msg);
      notifyUser('Error', msg, 'error');
    } finally {
      setRemoving(false);
    }
  };

  const getUploadButtonLabel = () => {
    if (uploading) return 'Procesando...';
    if (hasCover) return 'Reemplazar Portada';
    return 'Subir Portada';
  };

  const getActivePreviewSrc = () => {
    if (activePreviewVariant === '1:1') return variants.square1x1;
    if (activePreviewVariant === 'original') return variants.original;
    return variants.widescreen16x9;
  };

  const getPreviewStyle = () => {
    if (activePreviewVariant === '1:1') {
      return {
        width: '180px',
        height: '180px',
        aspectRatio: '1 / 1',
        objectFit: 'cover',
        borderRadius: '12px',
      };
    }
    if (activePreviewVariant === 'original') {
      return {
        maxWidth: '100%',
        maxHeight: '220px',
        objectFit: 'contain',
        borderRadius: '12px',
      };
    }
    return {
      width: '100%',
      maxWidth: '360px',
      aspectRatio: '16 / 9',
      objectFit: 'cover',
      borderRadius: '12px',
    };
  };

  return (
    <div
      data-testid="evento-portada-uploader"
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
            <Image24Regular
              style={{ verticalAlign: 'middle', marginRight: '8px' }}
            />
            Imagen de Portada (Web 16:9 / 1:1 y Cabecera de Correos)
          </MEHTypography>
          <MEHTypography
            variant="caption"
            style={{ opacity: 0.75, display: 'block', marginTop: '2px' }}
          >
            Se guarda la imagen original y se generan automáticamente las
            variantes <b>16:9</b> (listados y cabeceras de correo) y <b>1:1</b>{' '}
            (miniaturas y vista cuadrada).
          </MEHTypography>
        </div>
        <Badge
          color={hasCover ? 'success' : 'informative'}
          appearance="tint"
          data-testid="evento-portada-status-badge"
        >
          {hasCover ? 'Portada personalizada activa' : 'Usando fallback sin imagen'}
        </Badge>
      </div>

      {validationError && (
        <MessageBar intent="error" data-testid="evento-portada-error">
          <MessageBarBody>{validationError}</MessageBarBody>
        </MessageBar>
      )}

      {/* Selector de variante de previsualización */}
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
            padding: '10px',
            backgroundColor: tokens.colorNeutralBackground2,
            borderRadius: '14px',
            minWidth: '220px',
          }}
        >
          <img
            src={getActivePreviewSrc()}
            alt="Previsualización de portada del evento"
            data-testid="evento-portada-preview-img"
            style={getPreviewStyle()}
          />
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
            Previsualizar adaptación por contexto:
          </MEHTypography>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button
              size="small"
              appearance={activePreviewVariant === '16:9' ? 'primary' : 'outline'}
              onClick={() => setActivePreviewVariant('16:9')}
              data-testid="preview-variant-16x9"
            >
              16:9 (Listado y Correo)
            </Button>
            <Button
              size="small"
              appearance={activePreviewVariant === '1:1' ? 'primary' : 'outline'}
              onClick={() => setActivePreviewVariant('1:1')}
              data-testid="preview-variant-1x1"
            >
              1:1 (Cuadrado)
            </Button>
            <Button
              size="small"
              appearance={
                activePreviewVariant === 'original' ? 'primary' : 'outline'
              }
              onClick={() => setActivePreviewVariant('original')}
              data-testid="preview-variant-original"
            >
              Original / Detalle
            </Button>
          </div>
          <MEHTypography variant="caption" style={{ opacity: 0.7 }}>
            Formatos permitidos: PNG, JPG, WEBP (máx. 8 MB, optimización automática).
          </MEHTypography>
        </div>
      </div>

      {/* Controles de subida / reemplazo / eliminación */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
        }}
      >
        <Field
          label={hasCover ? 'Reemplazar imagen de portada' : 'Subir imagen de portada'}
          style={{ flexGrow: 1, minWidth: '220px' }}
        >
          <Input
            type="file"
            key={fileInputKey}
            data-testid="evento-portada-file-input"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileSelect}
          />
        </Field>
        <MEHButton
          appearance="primary"
          icon={uploading ? <Spinner size="tiny" /> : <ArrowUpload24Regular />}
          disabled={uploading || removing || !selectedFile}
          onClick={() => {
            void handleUploadOrReplace();
          }}
          data-testid="evento-portada-upload-btn"
        >
          {getUploadButtonLabel()}
        </MEHButton>
        {hasCover && (
          <Button
            appearance="subtle"
            icon={<Delete24Regular />}
            disabled={uploading || removing}
            style={{ color: tokens.colorPaletteRedForeground1 }}
            onClick={() => {
              void handleRemoveCover();
            }}
            data-testid="evento-portada-remove-btn"
          >
            {removing ? 'Quitando...' : 'Quitar Portada'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EventoPortadaUploader;

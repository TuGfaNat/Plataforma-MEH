import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Spinner,
  Badge,
  makeStyles,
  shorthands,
  tokens,
  Textarea,
} from '@fluentui/react-components';
import {
  Share24Regular,
  ArrowDownload24Regular,
  Copy24Regular,
  Dismiss24Regular,
  CheckmarkCircle24Filled,
  Warning24Filled,
} from '@fluentui/react-icons';
import { MEHTypography } from './ui';
import eventoService from '../services/eventoService';
import { resolveApiFileUrl } from '../services/api';
import { useNotify } from '../App';

const useStyles = makeStyles({
  surface: {
    maxWidth: '680px',
    width: '95vw',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius('18px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3),
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '12px',
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralBackground3),
  },
  content: {
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    paddingTop: '16px',
    paddingBottom: '16px',
  },
  canvasPreview: {
    width: '100%',
    maxWidth: '380px',
    aspectRatio: '4 / 5',
    ...shorthands.borderRadius('14px'),
    boxShadow: '0 8px 32px rgba(127, 19, 236, 0.25)',
    ...shorthands.border('1px', 'solid', 'rgba(127, 19, 236, 0.3)'),
    backgroundColor: '#0a0814',
    objectFit: 'contain',
  },
  copyBox: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.padding('12px'),
    ...shorthands.borderRadius('10px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3),
  },
  copyActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  },
  unauthorizedBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '12px',
    padding: '32px 16px',
  },
});

const drawBackground = async (ctx, width, height, plantillaUrl) => {
  if (plantillaUrl) {
    try {
      const imgTemplate = new Image();
      imgTemplate.crossOrigin = 'anonymous';
      imgTemplate.src = resolveApiFileUrl(plantillaUrl);
      await new Promise((res, rej) => {
        imgTemplate.onload = res;
        imgTemplate.onerror = rej;
      });
      ctx.drawImage(imgTemplate, 0, 0, width, height);
      return;
    } catch {
      // Usar diseño degradado tech generado si falla la carga
    }
  }

  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#090714');
  grad.addColorStop(0.5, '#120b24');
  grad.addColorStop(1, '#080512');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  const glow1 = ctx.createRadialGradient(200, 200, 10, 200, 200, 400);
  glow1.addColorStop(0, 'rgba(127, 19, 236, 0.45)');
  glow1.addColorStop(1, 'rgba(127, 19, 236, 0)');
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, width, height);

  const glow2 = ctx.createRadialGradient(880, 1100, 10, 880, 1100, 450);
  glow2.addColorStop(0, 'rgba(0, 120, 212, 0.35)');
  glow2.addColorStop(1, 'rgba(0, 120, 212, 0)');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, width - 80, height - 80);

  ctx.fillStyle = '#a855f7';
  ctx.font = 'bold 28px -apple-system, Segoe UI, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('COMUNIDAD MICROSOFT ENGINEERING HUB', width / 2, 110);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '20px -apple-system, Segoe UI, sans-serif';
  ctx.fillText('PASE OFICIAL DE ASISTENCIA • BOLIVIA', width / 2, 145);
};

const drawAvatar = async (ctx, avatarX, avatarY, avatarRadius, fotoUrl, nombreCompleto) => {
  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX, avatarY, avatarRadius + 8, 0, Math.PI * 2);
  ctx.fillStyle = '#7f13ec';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
  ctx.clip();

  let photoDrawn = false;
  if (fotoUrl) {
    try {
      const userPhoto = new Image();
      userPhoto.crossOrigin = 'anonymous';
      userPhoto.src = resolveApiFileUrl(fotoUrl);
      await new Promise((res, rej) => {
        userPhoto.onload = res;
        userPhoto.onerror = rej;
      });
      ctx.drawImage(
        userPhoto,
        avatarX - avatarRadius,
        avatarY - avatarRadius,
        avatarRadius * 2,
        avatarRadius * 2
      );
      photoDrawn = true;
    } catch {
      photoDrawn = false;
    }
  }

  if (!photoDrawn) {
    ctx.fillStyle = '#2e1065';
    ctx.fillRect(avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 80px -apple-system, Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const iniciales = (nombreCompleto || 'M')
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
    ctx.fillText(iniciales, avatarX, avatarY);
  }
  ctx.restore();
};

const BadgeSocialModal = ({ isOpen, onClose, eventoId, eventoTitulo = '' }) => {
  const styles = useStyles();
  const notifyContext = useNotify();
  const notify = (title, msg, intent) => {
    if (typeof notifyContext === 'function') notifyContext(title, msg, intent);
    else if (notifyContext?.notify) notifyContext.notify(title, msg, intent);
  };
  const canvasRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [badgeData, setBadgeData] = useState(null);
  const [errorNotEnrolled, setErrorNotEnrolled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyText, setCopyText] = useState('');

  const cargarDatosBadge = async () => {
    if (!eventoId) return;
    setLoading(true);
    setErrorNotEnrolled(false);
    try {
      const data = await eventoService.getBadgeInfo(eventoId);
      setBadgeData(data);
      setCopyText(
        data.copy_sugerido ||
          `¡Ya tengo mi pase para ${data.titulo_evento || eventoTitulo}! 🎉 Nos vemos en este gran evento de la comunidad MEH. #ComunidadMEH #Tech`
      );
    } catch (err) {
      console.error('Error al obtener datos de badge:', err);
      const status = err.response?.status;
      if (status === 403) {
        setErrorNotEnrolled(true);
      } else {
        notify('Error', 'No se pudo cargar la información del badge', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && eventoId) {
      void cargarDatosBadge();
    }
  }, [isOpen, eventoId]);

  // DIBUJAR EN CANVAS CUANDO HAY DATOS
  useEffect(() => {
    if (!badgeData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = 1080;
    const height = 1350;
    canvas.width = width;
    canvas.height = height;

    const renderCanvas = async () => {
      // 1. FONDO
      await drawBackground(ctx, width, height, badgeData.plantilla_badge_url);

      // 2. FOTO DE PERFIL / AVATAR
      const avatarX = width / 2;
      const avatarY = 410;
      const avatarRadius = 140;
      await drawAvatar(ctx, avatarX, avatarY, avatarRadius, badgeData.foto_perfil_url, badgeData.nombre_completo);

      // 3. ROL PILL
      const rolText = badgeData.rol_evento || 'PARTICIPANTE';
      ctx.fillStyle = '#7f13ec';
      const pillWidth = 320;
      const pillHeight = 48;
      const pillX = width / 2 - pillWidth / 2;
      const pillY = 590;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 24);
      } else {
        ctx.rect(pillX, pillY, pillWidth, pillHeight);
      }
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px -apple-system, Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(rolText.toUpperCase(), width / 2, pillY + pillHeight / 2);

      // 4. NOMBRE DEL PARTICIPANTE
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 56px -apple-system, Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(badgeData.nombre_completo || 'Participante MEH', width / 2, 700);

      // 5. TÍTULO DEL EVENTO
      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 36px -apple-system, Segoe UI, sans-serif';
      const maxTitleWidth = width - 160;
      const title = badgeData.titulo_evento || eventoTitulo;
      // Truncar o envolver
      if (ctx.measureText(title).width > maxTitleWidth) {
        ctx.fillText(`${title.substring(0, 40)}...`, width / 2, 765);
      } else {
        ctx.fillText(title, width / 2, 765);
      }

      // 6. FECHA Y MODALIDAD
      let fechaTexto = 'Próximamente';
      if (badgeData.fecha_evento) {
        fechaTexto = new Date(badgeData.fecha_evento).toLocaleDateString('es-BO', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.font = '24px -apple-system, Segoe UI, sans-serif';
      ctx.fillText(`${fechaTexto} • ${badgeData.modalidad || 'Presencial'}`, width / 2, 820);

      // 7. TARJETA INFERIOR CON CÓDIGO QR / VALIDACIÓN
      const cardBoxY = 880;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(140, cardBoxY, width - 280, 280, 16);
      } else {
        ctx.rect(140, cardBoxY, width - 280, 280);
      }
      ctx.fill();
      ctx.stroke();

      // Detalles dentro de la tarjeta
      ctx.fillStyle = '#9ca3af';
      ctx.font = '20px -apple-system, Segoe UI, sans-serif';
      ctx.fillText('CÓDIGO DE ACCESO / CHECK-IN:', width / 2, cardBoxY + 50);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 38px monospace';
      ctx.fillText(badgeData.codigo_qr || `MEH-EVT-${eventoId}`, width / 2, cardBoxY + 110);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '18px -apple-system, Segoe UI, sans-serif';
      ctx.fillText('Presenta este código en puerta para validar tu acreditación', width / 2, cardBoxY + 160);

      if (badgeData.redes_sociales?.linkedin) {
        ctx.fillStyle = '#60a5fa';
        ctx.font = '20px -apple-system, Segoe UI, sans-serif';
        ctx.fillText(badgeData.redes_sociales.linkedin.replace('https://', ''), width / 2, cardBoxY + 220);
      }

      // 8. PIE DE PÁGINA
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '18px -apple-system, Segoe UI, sans-serif';
      ctx.fillText('www.comunidadmeh.com • #ComunidadMEH • Microsoft Engineering Hub', width / 2, 1260);
    };

    void renderCanvas();
  }, [badgeData, eventoTitulo, eventoId]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    try {
      const link = document.createElement('a');
      const safeName = (badgeData?.nombre_completo || 'miembro').replace(/\s+/g, '_');
      link.download = `Badge_MEH_${eventoId}_${safeName}.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      link.remove();
      notify('Badge Descargado', 'Tu credencial social se guardó como imagen PNG.', 'success');
    } catch (err) {
      console.error('Error al descargar badge PNG:', err);
      notify('Error', 'No se pudo generar el archivo PNG', 'error');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      notify('Copiado', 'El texto fue copiado al portapapeles', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Error al copiar texto:', err);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ padding: '60px', textAlign: 'center' }}>
          <Spinner label="Generando tu credencial social..." />
        </div>
      );
    }

    if (errorNotEnrolled) {
      return (
        <div className={styles.unauthorizedBox}>
          <Warning24Filled style={{ fontSize: '48px', color: tokens.colorPaletteYellowForeground1 }} />
          <MEHTypography variant="h3">Inscripción Requerida</MEHTypography>
          <MEHTypography variant="body" style={{ maxWidth: '420px', opacity: 0.8 }}>
            El badge social oficial es exclusivo para miembros con inscripción confirmada en este evento.
            Inscríbete para desbloquear y personalizar tu pase digital compartible.
          </MEHTypography>
        </div>
      );
    }

    return (
      <>
        {/* CANVAS DE BADGE */}
        <canvas ref={canvasRef} className={styles.canvasPreview} />

        {/* COPY SUGERIDO PARA REDES */}
        <div className={styles.copyBox}>
          <MEHTypography variant="caption" style={{ fontWeight: 'bold' }}>
            Texto sugerido para redes sociales (LinkedIn, X, Instagram):
          </MEHTypography>
          <Textarea
            value={copyText}
            onChange={(e, d) => setCopyText(d.value)}
            rows={3}
            resize="vertical"
          />
          <div className={styles.copyActions}>
            <Button
              size="small"
              appearance="subtle"
              icon={<Copy24Regular />}
              onClick={handleCopy}
            >
              {copied ? '¡Copiado!' : 'Copiar Texto'}
            </Button>
          </div>
        </div>
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(e, d) => !d.open && onClose()}>
      <DialogSurface className={styles.surface}>
        <DialogTitle>
          <div className={styles.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Share24Regular style={{ color: tokens.colorBrandForeground1 }} />
              <div>
                <MEHTypography variant="h3">Badge Social de Inscripción</MEHTypography>
                <MEHTypography variant="caption" style={{ opacity: 0.7 }}>
                  {eventoTitulo}
                </MEHTypography>
              </div>
            </div>
            {badgeData?.esta_inscrito && (
              <Badge color="success" appearance="filled" icon={<CheckmarkCircle24Filled />}>
                Inscrito Confirmado
              </Badge>
            )}
          </div>
        </DialogTitle>

        <DialogContent className={styles.content}>
          {renderContent()}
        </DialogContent>

        <DialogActions>
          <Button appearance="secondary" icon={<Dismiss24Regular />} onClick={onClose}>
            Cerrar
          </Button>
          {!errorNotEnrolled && (
            <Button
              appearance="primary"
              icon={<ArrowDownload24Regular />}
              disabled={loading || !badgeData}
              onClick={handleDownload}
            >
              Descargar Badge (PNG)
            </Button>
          )}
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
};

export default BadgeSocialModal;

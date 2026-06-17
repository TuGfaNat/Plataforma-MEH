import React from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  makeStyles,
  shorthands,
  tokens,
} from '@fluentui/react-components';
import { 
  Dismiss24Regular, 
  CheckmarkCircle24Filled, 
  Share24Filled 
} from '@fluentui/react-icons';
import { 
  MEHButton, 
  MEHTypography 
} from './ui';
import { Badge } from '@fluentui/react-components';
import { resolveApiFileUrl } from '../services/api';
import { useNotify } from '../App';

const useStyles = makeStyles({
  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    ...shorthands.padding('24px'),
  },
  badgeImage: {
    width: '120px',
    height: '120px',
    borderRadius: tokens.borderRadiusLarge,
    objectFit: 'contain',
    marginBottom: '16px',
    filter: 'drop-shadow(0 4px 16px rgba(127, 19, 236, 0.4))',
  },
  infoRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  infoLabel: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightBold,
    opacity: 0.7,
  },
  infoValue: {
    fontSize: tokens.fontSizeBase300,
  },
  actionsContainer: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
  },
});

const BadgeDetailModal = ({ badge, trigger, onClose }) => {
  const styles = useStyles();
  const [open, setOpen] = React.useState(false);
  const { notify } = useNotify();

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  const handleShare = () => {
    const text = `🏆 ¡He obtenido la insignia "${badge.nombre_badge}" (${badge.puntos} XP) en la Plataforma MEH! 🎉\n\n"${badge.descripcion || ''}"\n\nSuma tus puntos XP y certifícate. Únete a la comunidad de Microsoft: https://plataforma-meh.runa.laotrared.net`;
    navigator.clipboard.writeText(text);
    notify("Compartir Insignia", "¡Publicación y enlace de invitación copiados al portapapeles!", "success");
  };

  const handleShareTwitter = () => {
    const text = `🏆 ¡He ganado la insignia "${badge.nombre_badge}" en Plataforma MEH! 🎉%0A%0ASuma tus puntos XP y certifícate en: https://plataforma-meh.runa.laotrared.net`;
    const url = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(url, '_blank');
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  // Formatear nivel requerido para que concatene correctamente si es numérico
  const formattedLevel = React.useMemo(() => {
    const req = badge.requisito_nivel;
    if (!req) return 'Cualquiera';
    if (typeof req === 'number' || !isNaN(req)) {
      return `Nivel ${req}`;
    }
    return req;
  }, [badge.requisito_nivel]);

  return (
    <Dialog open={open} onOpenChange={(e, data) => setOpen(data.open)}>
      <DialogTrigger disableButtonEnhancement>
        {trigger || (
          <MEHButton appearance="primary">Ver Detalles</MEHButton>
        )}
      </DialogTrigger>
      <DialogSurface>
        <DialogBody className={styles.dialogContent}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <DialogTitle style={{ marginBottom: '16px' }}>
                {badge.nombre_badge}
              </DialogTitle>
              <div style={{ position: 'relative', width: 'fit-content' }}>
                <img
                  src={resolveApiFileUrl(badge.imagen_url)}
                  alt={badge.nombre_badge}
                  className={styles.badgeImage}
                  style={{ filter: badge.earned ? 'none' : 'grayscale(1) opacity(0.5)' }}
                />
                {badge.earned && (
                  <div style={{ position: 'absolute', bottom: '24px', right: '0', backgroundColor: '#22B14C', color: 'white', borderRadius: '50%', padding: '4px', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckmarkCircle24Filled style={{ fontSize: '20px' }} />
                  </div>
                )}
              </div>
            </div>
            <MEHButton
              appearance="subtle"
              icon={<Dismiss24Regular />}
              onClick={handleClose}
              style={{ marginRight: '-12px' }}
            />
          </div>

          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>Descripción</div>
            <div className={styles.infoValue}>
              <MEHTypography variant="body">
                {badge.descripcion || 'Sin descripción disponible.'}
              </MEHTypography>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>Requisito de Nivel</div>
              <div className={styles.infoValue}>
                <Badge appearance="tint" color="brand">{formattedLevel}</Badge>
              </div>
            </div>

            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>Valor</div>
              <div className={styles.infoValue}>
                <MEHTypography variant="body" style={{ fontWeight: 'bold', color: tokens.colorBrandForeground1 }}>
                  +{badge.puntos} XP
                </MEHTypography>
              </div>
            </div>
          </div>

          {badge.earned && badge.fecha_obtencion && (
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>Obtenido el</div>
              <div className={styles.infoValue}>
                <MEHTypography variant="body">
                  {formatDate(badge.fecha_obtencion)}
                </MEHTypography>
              </div>
            </div>
          )}

          <DialogActions style={{ marginTop: '24px', gap: '12px', flexWrap: 'wrap' }}>
            <MEHButton
              appearance="secondary"
              onClick={handleShare}
              icon={<Share24Filled />}
            >
              Copiar Post
            </MEHButton>
            <MEHButton
              appearance="secondary"
              onClick={handleShareTwitter}
            >
              Compartir en X
            </MEHButton>
            <MEHButton
              appearance="primary"
              onClick={handleClose}
            >
              Cerrar
            </MEHButton>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default BadgeDetailModal;

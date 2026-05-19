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
    objectFit: 'cover',
    marginBottom: '16px',
    boxShadow: '0 4px 16px rgba(127, 19, 236, 0.3)',
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

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  const handleShare = () => {
    const url = `${window.location.origin}/badges/${badge.id_badge}`;
    navigator.clipboard.writeText(url);
    alert('¡Enlace copiado!');
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  return (
    <Dialog open={open} onOpenChange={(e, data) => setOpen(data.open)}>
      <DialogTrigger>
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
                  src={badge.imagen_url}
                  alt={badge.nombre_badge}
                  className={styles.badgeImage}
                  style={{ filter: badge.earned ? 'none' : 'grayscale(1) opacity(0.5)' }}
                />
                {badge.earned && (
                  <div style={{ position: 'absolute', bottom: '24px', right: '0', backgroundColor: '#22B14C', color: 'white', borderRadius: '50%', padding: '4px', border: '2px solid white' }}>
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
              <div className={styles.infoLabel}>Nivel Requerido</div>
              <div className={styles.infoValue}>
                <Badge appearance="tint" color="brand">{badge.requisito_nivel}</Badge>
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
              <div className={styles.infoLabel}>Obtenida el</div>
              <div className={styles.infoValue}>
                <MEHTypography variant="body">
                  {formatDate(badge.fecha_obtencion)}
                </MEHTypography>
              </div>
            </div>
          )}

          <DialogActions style={{ marginTop: '24px', gap: '12px' }}>
            <MEHButton
              appearance="secondary"
              onClick={handleShare}
              icon={<Share24Filled />}
            >
              Compartir Logro
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

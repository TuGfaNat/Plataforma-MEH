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
import { Dismiss24Regular } from '@fluentui/react-icons';
import { MEHButton, MEHTypography } from './ui';

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
    const url = `${window.location.origin}/badges/${badge.id}`;
    navigator.clipboard.writeText(url);
    // Aquí podrías mostrar un toast
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
                {badge.nombre}
              </DialogTitle>
              <img
                src={badge.imagen_url || badge.icon}
                alt={badge.nombre}
                className={styles.badgeImage}
              />
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
                {badge.descripcion}
              </MEHTypography>
            </div>
          </div>

          {badge.fecha_obtenida && (
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>Fecha de Obtención</div>
              <div className={styles.infoValue}>
                <MEHTypography variant="body">
                  {formatDate(badge.fecha_obtenida)}
                </MEHTypography>
              </div>
            </div>
          )}

          {badge.requisito_nivel && (
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>Nivel Requerido</div>
              <div className={styles.infoValue}>
                <MEHTypography variant="body">
                  {badge.requisito_nivel}
                </MEHTypography>
              </div>
            </div>
          )}

          {badge.puntos && (
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>Puntos</div>
              <div className={styles.infoValue}>
                <MEHTypography variant="body">
                  +{badge.puntos} puntos
                </MEHTypography>
              </div>
            </div>
          )}

          <DialogActions style={{ marginTop: '24px', gap: '12px' }}>
            <MEHButton
              appearance="secondary"
              onClick={handleShare}
            >
              📋 Copiar Enlace
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

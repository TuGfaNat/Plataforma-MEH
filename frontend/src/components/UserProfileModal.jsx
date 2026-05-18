import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  Avatar,
  makeStyles,
  shorthands,
  tokens,
  Spinner,
  Badge,
  Divider,
  Link
} from '@fluentui/react-components';
import { 
  Globe24Regular, 
  PersonNote24Filled,
  Reward24Filled,
  Calendar24Regular,
  Building24Regular,
  Map24Regular
} from '@fluentui/react-icons';
import { MEHTypography } from './ui';
import comunidadService from '../services/comunidadService';

const useStyles = makeStyles({
  surface: {
    backgroundColor: '#1A1A1A',
    color: 'white',
    ...shorthands.border('1px', 'solid', tokens.colorBrandForeground1),
    maxWidth: '550px',
    width: '95%',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '20px',
  },
  badgesContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginTop: '16px',
    justifyContent: 'center',
  },
  badgeItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '80px',
    textAlign: 'center',
    gap: '4px',
  },
  badgeImage: {
    width: '50px',
    height: '50px',
    objectFit: 'contain',
  },
  socialLinks: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    marginTop: '16px',
    justifyContent: 'center',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginTop: '16px',
  }
});

const UserProfileModal = ({ userId, isOpen, onOpenChange }) => {
  const styles = useStyles();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && userId) fetchProfile();
  }, [isOpen, userId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await comunidadService.getMiembroDetalle(userId);
      setProfile(data);
    } catch (err) {
      setError("Perfil no disponible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogSurface className={styles.surface}>
        <DialogBody>
          <DialogTitle>Detalle del Miembro</DialogTitle>
          <DialogContent>
            {loading ? <Spinner label="Cargando..." /> : profile && (
              <>
                <div className={styles.header}>
                  <Avatar size={96} name={`${profile.nombres} ${profile.apellidos}`} src={profile.foto_url} color="colorful" />
                  <div style={{ textAlign: 'center' }}>
                    <MEHTypography variant="h2" style={{ display: 'block' }}>{profile.alias || `${profile.nombres} ${profile.apellidos}`}</MEHTypography>
                    <Badge appearance="filled" color="brand">{profile.rol}</Badge>
                  </div>
                </div>

                <div className={styles.infoGrid}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Building24Regular />
                        <MEHTypography variant="caption">{profile.institucion || 'Independiente'}</MEHTypography>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Map24Regular />
                        <MEHTypography variant="caption">{profile.departamento}, {profile.pais}</MEHTypography>
                    </div>
                </div>

                <Divider style={{ margin: '20px 0' }} />

                <MEHTypography variant="body" style={{ display: 'block', opacity: 0.8, textAlign: 'center' }}>
                    {profile.bio || "Sin biografía disponible."}
                </MEHTypography>

                <div className={styles.socialLinks}>
                  {profile.linkedin_url && <Link href={profile.linkedin_url} target="_blank">LinkedIn</Link>}
                  {profile.github_url && <Link href={profile.github_url} target="_blank">GitHub</Link>}
                  {profile.facebook_url && <Link href={profile.facebook_url} target="_blank">Facebook</Link>}
                  {profile.instagram_url && <Link href={profile.instagram_url} target="_blank">Instagram</Link>}
                  {profile.tiktok_url && <Link href={profile.tiktok_url} target="_blank">TikTok</Link>}
                  {profile.learning_path_url && <Link href={profile.learning_path_url} target="_blank" style={{ color: tokens.colorPaletteGoldForeground1 }}>Microsoft Learn</Link>}
                </div>

                <div style={{ marginTop: '24px' }}>
                  <MEHTypography variant="h4" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    <Reward24Filled /> Logros y Badges
                  </MEHTypography>
                  <div className={styles.badgesContainer}>
                    {profile.badges?.map(ub => (
                      <div key={ub.id_usuario_badge} className={styles.badgeItem}>
                        <img src={ub.badge.imagen_url} className={styles.badgeImage} alt="Badge" />
                        <MEHTypography variant="caption" style={{ fontSize: '10px' }}>{ub.badge.nombre_badge}</MEHTypography>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default UserProfileModal;

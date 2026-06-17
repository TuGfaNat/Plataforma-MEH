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
  Divider
} from '@fluentui/react-components';
import { 
  Reward24Filled,
  Calendar24Regular,
  Building24Regular,
  Map24Regular,
  Person24Regular,
  Mail24Regular,
  Info24Regular,
  BookOpen24Regular,
  Globe24Regular
} from '@fluentui/react-icons';
import { MEHTypography, MEHButton } from './ui';
import comunidadService from '../services/comunidadService';
import { resolveApiFileUrl } from '../services/api';

const useStyles = makeStyles({
  surface: {
    backgroundColor: '#161616',
    color: 'white',
    ...shorthands.border('1px', 'solid', 'rgba(255,255,255,0.1)'),
    ...shorthands.borderRadius('12px'),
    maxWidth: '650px',
    width: '95%',
    boxShadow: '0 24px 48px rgba(0,0,0,0.8)',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '16px',
  },
  sectionTitle: {
    color: tokens.colorBrandForeground1,
    fontWeight: 'bold',
    marginTop: '16px',
    marginBottom: '10px',
    display: 'block',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginTop: '8px',
    marginBottom: '16px',
    '@media(max-width: 500px)': {
      gridTemplateColumns: '1fr',
    }
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'rgba(255,255,255,0.02)',
    ...shorthands.padding('10px', '14px'),
    ...shorthands.borderRadius('8px'),
    ...shorthands.border('1px', 'solid', 'rgba(255,255,255,0.04)'),
  },
  detailContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  detailLabel: {
    fontSize: '10px',
    opacity: 0.5,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  detailValue: {
    fontSize: '13px',
    fontWeight: '500',
    wordBreak: 'break-all',
  },
  bioBox: {
    backgroundColor: 'rgba(255,255,255,0.01)',
    ...shorthands.padding('16px'),
    ...shorthands.borderRadius('8px'),
    ...shorthands.border('1px', 'solid', 'rgba(255,255,255,0.03)'),
    lineHeight: '1.5',
  },
  badgesContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    marginTop: '12px',
    justifyContent: 'center',
  },
  badgeItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '110px',
    textAlign: 'center',
    gap: '6px',
    backgroundColor: 'rgba(255,255,255,0.01)',
    ...shorthands.padding('12px', '8px'),
    ...shorthands.borderRadius('8px'),
    ...shorthands.border('1px', 'solid', 'rgba(255,255,255,0.03)'),
    transition: 'all 0.2s',
    ':hover': {
      transform: 'scale(1.05)',
      backgroundColor: 'rgba(255,255,255,0.04)',
      ...shorthands.borderColor(tokens.colorBrandForeground1),
    }
  },
  badgeImage: {
    width: '48px',
    height: '48px',
    objectFit: 'contain',
  },
  socialLinks: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginTop: '12px',
    justifyContent: 'center',
  },
  socialButton: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    ...shorthands.border('1px', 'solid', 'rgba(255,255,255,0.08)'),
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: tokens.colorBrandBackground2,
      ...shorthands.borderColor(tokens.colorBrandForeground1),
    }
  }
});

const UserProfileModal = ({ userId, isOpen, onOpenChange }) => {
  const styles = useStyles();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchProfile();
    } else if (!isOpen) {
      setProfile(null);
    }
  }, [isOpen, userId]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await comunidadService.getMiembroDetalle(userId);
      setProfile(data);
    } catch (err) {
      setError("Perfil no disponible.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/D';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogSurface className={styles.surface}>
        <DialogBody>
          <DialogTitle>Perfil de Miembro</DialogTitle>
          <DialogContent style={{ marginTop: '12px' }}>
            {loading ? (
              <Spinner label="Cargando perfil..." />
            ) : error ? (
              <MEHTypography variant="body" style={{ color: tokens.colorPaletteRedForeground1, textAlign: 'center', display: 'block', margin: '20px 0' }}>
                {error}
              </MEHTypography>
            ) : profile && (
              <>
                {/* Header Section */}
                <div className={styles.header}>
                  <Avatar size={96} name={`${profile.nombres} ${profile.apellidos}`} image={{ src: resolveApiFileUrl(profile.foto_url) }} color="colorful" />
                  <div style={{ textAlign: 'center' }}>
                    <MEHTypography variant="h2" style={{ display: 'block' }}>
                      {profile.alias || `${profile.nombres} ${profile.apellidos}`}
                    </MEHTypography>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '6px' }}>
                      <Badge appearance="filled" color="brand">{profile.rol}</Badge>
                      <Badge appearance="outline">{profile.tipo_entidad || 'Miembro'}</Badge>
                    </div>
                  </div>
                </div>

                <Divider style={{ margin: '12px 0' }} />

                {/* General Info Grid */}
                <MEHTypography variant="caption" className={styles.sectionTitle}>
                  Información del Miembro
                </MEHTypography>
                <div className={styles.detailsGrid}>
                  <div className={styles.detailItem}>
                    <Person24Regular style={{ color: tokens.colorBrandForeground1 }} />
                    <div className={styles.detailContent}>
                      <span className={styles.detailLabel}>Nombre Completo</span>
                      <span className={styles.detailValue}>{profile.nombres} {profile.apellidos}</span>
                    </div>
                  </div>



                  <div className={styles.detailItem}>
                    <Mail24Regular style={{ color: tokens.colorBrandForeground1 }} />
                    <div className={styles.detailContent}>
                      <span className={styles.detailLabel}>Correo Electrónico</span>
                      <span className={styles.detailValue}>{profile.correo}</span>
                    </div>
                  </div>

                  <div className={styles.detailItem}>
                    <BookOpen24Regular style={{ color: tokens.colorBrandForeground1 }} />
                    <div className={styles.detailContent}>
                      <span className={styles.detailLabel}>Tipo de Entidad</span>
                      <span className={styles.detailValue}>{profile.tipo_entidad || 'Miembro'}</span>
                    </div>
                  </div>

                  <div className={styles.detailItem}>
                    <Building24Regular style={{ color: tokens.colorBrandForeground1 }} />
                    <div className={styles.detailContent}>
                      <span className={styles.detailLabel}>Institución / Empresa</span>
                      <span className={styles.detailValue}>{profile.institucion || 'Independiente'}</span>
                    </div>
                  </div>

                  <div className={styles.detailItem}>
                    <Map24Regular style={{ color: tokens.colorBrandForeground1 }} />
                    <div className={styles.detailContent}>
                      <span className={styles.detailLabel}>Ubicación</span>
                      <span className={styles.detailValue}>
                        {profile.departamento ? `${profile.departamento}, ` : ''}{profile.pais || 'Bolivia'}
                      </span>
                    </div>
                  </div>

                  <div className={styles.detailItem} style={{ gridColumn: '1 / -1' }}>
                    <Calendar24Regular style={{ color: tokens.colorBrandForeground1 }} />
                    <div className={styles.detailContent}>
                      <span className={styles.detailLabel}>Fecha de Registro</span>
                      <span className={styles.detailValue}>{formatDate(profile.fecha_registro)}</span>
                    </div>
                  </div>
                </div>

                {/* Biography */}
                <MEHTypography variant="caption" className={styles.sectionTitle}>
                  Biografía
                </MEHTypography>
                <div className={styles.bioBox}>
                  <MEHTypography variant="body" style={{ display: 'block', opacity: 0.85 }}>
                    {profile.bio || "Este miembro no ha especificado una biografía pública."}
                  </MEHTypography>
                </div>

                {/* Social Links */}
                {((profile.linkedin_url || profile.github_url || profile.facebook_url || profile.instagram_url || profile.tiktok_url || profile.learning_path_url) && (
                  <>
                    <MEHTypography variant="caption" className={styles.sectionTitle} style={{ textAlign: 'center' }}>
                      Presencia Digital
                    </MEHTypography>
                    <div className={styles.socialLinks}>
                      {profile.linkedin_url && (
                        <MEHButton 
                          size="small" 
                          appearance="outline" 
                          icon={<Globe24Regular />} 
                          onClick={() => window.open(profile.linkedin_url, '_blank')}
                          className={styles.socialButton}
                        >
                          LinkedIn
                        </MEHButton>
                      )}
                      {profile.github_url && (
                        <MEHButton 
                          size="small" 
                          appearance="outline" 
                          icon={<Globe24Regular />} 
                          onClick={() => window.open(profile.github_url, '_blank')}
                          className={styles.socialButton}
                        >
                          GitHub
                        </MEHButton>
                      )}
                      {profile.facebook_url && (
                        <MEHButton 
                          size="small" 
                          appearance="outline" 
                          icon={<Globe24Regular />} 
                          onClick={() => window.open(profile.facebook_url, '_blank')}
                          className={styles.socialButton}
                        >
                          Facebook
                        </MEHButton>
                      )}
                      {profile.instagram_url && (
                        <MEHButton 
                          size="small" 
                          appearance="outline" 
                          icon={<Globe24Regular />} 
                          onClick={() => window.open(profile.instagram_url, '_blank')}
                          className={styles.socialButton}
                        >
                          Instagram
                        </MEHButton>
                      )}
                      {profile.tiktok_url && (
                        <MEHButton 
                          size="small" 
                          appearance="outline" 
                          icon={<Globe24Regular />} 
                          onClick={() => window.open(profile.tiktok_url, '_blank')}
                          className={styles.socialButton}
                        >
                          TikTok
                        </MEHButton>
                      )}
                      {profile.learning_path_url && (
                        <MEHButton 
                          size="small" 
                          appearance="outline" 
                          icon={<Globe24Regular />} 
                          onClick={() => window.open(profile.learning_path_url, '_blank')}
                          className={styles.socialButton}
                          style={{ borderColor: tokens.colorPaletteGoldBorderActive }}
                        >
                          Microsoft Learn
                        </MEHButton>
                      )}
                    </div>
                  </>
                ))}

                {/* Logros y Badges */}
                {profile.badges && profile.badges.length > 0 && (
                  <div style={{ marginTop: '24px' }}>
                    <MEHTypography variant="caption" className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                      <Reward24Filled /> Logros y Badges ({profile.badges.length})
                    </MEHTypography>
                    <div className={styles.badgesContainer}>
                      {profile.badges.map(ub => (
                        <div key={ub.id_usuario_badge} className={styles.badgeItem}>
                          <img src={resolveApiFileUrl(ub.badge.imagen_url)} className={styles.badgeImage} alt={ub.badge.nombre_badge} />
                          <MEHTypography variant="caption" style={{ fontSize: '11px', fontWeight: 'bold', display: 'block' }}>
                            {ub.badge.nombre_badge}
                          </MEHTypography>
                          <MEHTypography variant="caption" style={{ fontSize: '9px', opacity: 0.6 }}>
                            Obtenido el:<br />{formatDate(ub.fecha_obtencion)}
                          </MEHTypography>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default UserProfileModal;


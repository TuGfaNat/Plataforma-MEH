import React, { useState, useEffect } from 'react';
import { 
  makeStyles, 
  shorthands, 
  tokens, 
  ProgressBar,
  Spinner,
  Badge
} from '@fluentui/react-components';
import { 
  Trophy24Filled, 
  Share24Filled, 
  LockClosed24Regular,
  CheckmarkCircle24Filled,
  Delete24Regular,
  Edit24Regular
} from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { MEHCard, MEHButton, MEHTypography } from '../components/ui';
import BadgeForm from '../components/BadgeForm';
import BadgeDetailModal from '../components/BadgeDetailModal';
import { designTokens } from '../theme/theme';
import dashboardService from '../services/dashboardService';
import insigniasService from '../services/insigniasService';
import { useAuth, useNotify } from '../App';
import { resolveApiFileUrl } from '../services/api';
import { hasPermission, PERMISSION_BADGES_MANAGE } from '../auth/rbac';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    animationName: {
      from: { opacity: 0, transform: 'translateY(10px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    animationDuration: '0.5s',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    [designTokens.breakpoints.sm]: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '16px',
    }
  },
  milestoneCard: {
    backgroundColor: 'rgba(127, 19, 236, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px', // Espaciado aumentado entre hito y progreso
    ...shorthands.padding('32px'),
  },
  badgeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    ...shorthands.gap('24px'),
  },
  badgeCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    ...shorthands.padding('32px', '24px'),
    transition: 'all 0.3s ease',
    position: 'relative',
    cursor: 'pointer',
    ':hover': {
      transform: 'scale(1.05)',
      boxShadow: '0 8px 32px rgba(127, 19, 236, 0.3)',
      backgroundColor: 'rgba(127, 19, 236, 0.1)',
    }
  },
  badgeImage: {
    width: '100px',
    height: '100px',
    marginBottom: '20px',
    objectFit: 'contain',
  },
  earned: {
    filter: 'drop-shadow(0 0 15px rgba(127, 19, 236, 0.5))',
  },
  locked: {
    filter: 'grayscale(1) opacity(0.3)',
  },
  lockIcon: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    color: tokens.colorNeutralForeground4,
  },
  adminActions: {
      position: 'absolute',
      top: '12px',
      left: '12px',
      display: 'flex',
      gap: '4px',
      zIndex: 10
  }
});

const Insignias = () => {
  const styles = useStyles();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { notify } = useNotify();
  const [stats, setStats] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBadge, setEditingBadge] = useState(null);

  // Verifica si el usuario cuenta con el permiso técnico 'badges.manage' (ADMIN, ORGANIZADOR y SOPORTE) para habilitar opciones de gestión
  const isAdmin = hasPermission(user?.rol, PERMISSION_BADGES_MANAGE);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [statsData, badgesData, myBadgesData] = await Promise.all([
        dashboardService.getStats(user.rol),
        insigniasService.getInsignias(),
        insigniasService.getMisInsignias(user.id_usuario)
      ]);
      setStats(statsData);
      
      const mapped = badgesData.map(b => ({
          ...b,
          earned: myBadgesData.some(mb => mb.id_badge === b.id_badge)
      }));
      setBadges(mapped);
    } catch (err) {
      console.error("Error al sincronizar insignias:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleDelete = async (e, id) => {
      e.stopPropagation();
      if (!window.confirm("¿Eliminar esta insignia del sistema?")) return;
      try {
          await insigniasService.deleteInsignia(id);
          notify("Éxito", "Insignia eliminada", "success");
          fetchData();
      } catch (err) {
          notify("Error", "No se pudo eliminar", "error");
      }
  };

  const handleEdit = (e, badge) => {
      e.stopPropagation();
      setEditingBadge(badge);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShareProfile = () => {
    const text = `🚀 ¡Hola! Los invito a ver mi perfil y mi progreso en la Plataforma Microsoft Education Hub (MEH) 🏆. He acumulado ${stats?.personal_stats?.puntos_xp || 0} XP y desbloqueado insignias. ¡Regístrense en esta página y sigan mi progreso!: https://plataforma-meh.runa.laotrared.net`;
    navigator.clipboard.writeText(text);
    notify("Compartir Perfil", "¡Texto e invitación para compartir copiados al portapapeles!", "success");
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><Spinner label="Sincronizando sistema de méritos..." /></div>;

  const earnedCount = badges.filter(b => b.earned).length;
  const milestoneProgress = badges.length > 0 ? earnedCount / badges.length : 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Trophy24Filled style={{ color: tokens.colorBrandForeground1, fontSize: '32px' }} />
            <MEHTypography variant="h1">Centro de Logros y Gamificación</MEHTypography>
          </div>
          <MEHTypography variant="body" style={{ opacity: 0.6 }}>
            Visualiza tu progreso y las competencias validadas por el programa MEH.
          </MEHTypography>
        </div>
        <MEHButton icon={<Share24Filled />} appearance="outline" onClick={handleShareProfile}>Compartir Perfil</MEHButton>
      </div>

      {/* Resumen de Hito actual */}
      <MEHCard className={styles.milestoneCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '56px', height: '56px', backgroundColor: tokens.colorBrandBackground, ...shorthands.borderRadius('50%'), display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${tokens.colorBrandBackground}66` }}>
              <Trophy24Filled style={{ color: 'white', fontSize: '28px' }} />
            </div>
            <div>
              <MEHTypography variant="h2">{earnedCount === badges.length ? '¡Colección Completada!' : 'Próximo Hito'}</MEHTypography>
              <MEHTypography variant="body" style={{ opacity: 0.7, display: 'block' }}>Progreso de insignias en el nivel actual</MEHTypography>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
              <MEHTypography variant="h1" style={{ color: tokens.colorBrandForeground1, fontSize: '36px' }}>{(milestoneProgress * 100).toFixed(0)}%</MEHTypography>
          </div>
        </div>

        <div>
            <ProgressBar value={milestoneProgress} color={milestoneProgress === 1 ? "success" : "brand"} style={{ height: '10px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                <MEHTypography variant="caption" style={{ opacity: 0.6 }}>
                    {earnedCount} de {badges.length} insignias desbloqueadas
                </MEHTypography>
                <MEHTypography variant="caption" style={{ fontWeight: 'bold', color: tokens.colorBrandForeground1 }}>
                    {stats?.personal_stats?.puntos_xp || 0} XP Acumulados
                </MEHTypography>
            </div>
        </div>
      </MEHCard>

      {/* Admin Tool */}
      {isAdmin && (
        <BadgeForm 
            onSuccess={() => {
                fetchData();
                setEditingBadge(null);
            }} 
            editingBadge={editingBadge}
            onCancel={() => setEditingBadge(null)}
        />
      )}

      {/* Galería de Insignias */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <MEHTypography variant="h3">Galería de Reconocimientos</MEHTypography>
            {isAdmin && <Badge appearance="tint" color="brand">Modo Editor Activo</Badge>}
        </div>
        
        <div className={styles.badgeGrid}>
          {badges.map((badge) => (
            <BadgeDetailModal
              key={badge.id_badge}
              badge={badge}
              trigger={
                <MEHCard className={styles.badgeCard}>
                  {isAdmin && (
                      <div className={styles.adminActions}>
                          <MEHButton size="small" appearance="subtle" icon={<Edit24Regular />} onClick={(e) => handleEdit(e, badge)} />
                          <MEHButton size="small" appearance="subtle" icon={<Delete24Regular />} onClick={(e) => handleDelete(e, badge.id_badge)} />
                      </div>
                  )}
                  {!badge.earned && !isAdmin && <LockClosed24Regular className={styles.lockIcon} />}
                  
                  <img 
                    src={resolveApiFileUrl(badge.imagen_url)} 
                    alt={badge.nombre_badge} 
                    className={`${styles.badgeImage} ${badge.earned || isAdmin ? styles.earned : styles.locked}`}
                  />
                  
                  <MEHTypography variant="h3" style={{ marginBottom: '8px' }}>
                    {badge.nombre_badge}
                  </MEHTypography>
                  <MEHTypography variant="caption" style={{ opacity: 0.7, minHeight: '40px' }}>
                    {badge.descripcion}
                  </MEHTypography>
                  
                  <div style={{ marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <Badge appearance="outline" color="informative">{badge.requisito_nivel}</Badge>
                      {badge.earned && <CheckmarkCircle24Filled style={{ color: '#22B14C', fontSize: '20px' }} />}
                  </div>
                </MEHCard>
              }
            />
          ))}
          {badges.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                  No hay insignias registradas en el sistema.
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Insignias;

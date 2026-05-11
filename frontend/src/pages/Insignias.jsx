import React, { useState, useEffect } from 'react';
import { 
  makeStyles, 
  shorthands, 
  tokens, 
  ProgressBar,
  Spinner
} from '@fluentui/react-components';
import { 
  Trophy24Filled, 
  Share24Filled, 
  LockClosed24Regular,
  Info24Regular,
  CheckmarkCircle24Filled
} from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import MainLayout from '../components/layout/MainLayout';
import { MEHCard, MEHButton, MEHTypography } from '../components/ui';
import { designTokens } from '../theme/theme';
import dashboardService from '../services/dashboardService';
import { useAuth } from '../App';

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
  badgeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
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
      transform: 'translateY(-8px)',
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
    }
  },
  badgeImage: {
    width: '100px',
    height: '100px',
    marginBottom: '20px',
    transition: 'all 0.3s ease',
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
  milestoneSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  milestoneGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    [designTokens.breakpoints.sm]: {
      gridTemplateColumns: '1fr',
    }
  },
  milestoneStep: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    ...shorthands.padding('16px'),
    ...shorthands.borderRadius('12px'),
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    ...shorthands.border('1px', 'solid', 'rgba(255, 255, 255, 0.05)'),
  }
});

const Insignias = () => {
  const styles = useStyles();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (err) {
        console.error("Error al cargar insignias:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <MainLayout><Spinner label="Evaluando tus logros..." /></MainLayout>;

  // Lógica de Insignias Dinámicas
  const pStats = stats?.personal_stats || { eventos_inscritos: 0, certificados_obtenidos: 0, progreso_promedio: 0 };
  
  const badges = [
    { 
      id: 'reg', 
      name: 'Primeros Pasos', 
      desc: 'Inscríbete a tu primer taller de la comunidad.', 
      earned: pStats.eventos_inscritos >= 1, 
      img: 'https://cdn-icons-png.flaticon.com/512/6188/6188613.png' 
    },
    { 
      id: 'explorer', 
      name: 'Azure Explorer', 
      desc: 'Asiste a 3 o más talleres tecnológicos.', 
      earned: pStats.eventos_inscritos >= 3, 
      img: 'https://cdn-icons-png.flaticon.com/512/4144/4144422.png' 
    },
    { 
      id: 'cert', 
      name: 'Certificado MEH', 
      desc: 'Completa un curso y obtén tu primer diploma.', 
      earned: pStats.certificados_obtenidos >= 1, 
      img: 'https://cdn-icons-png.flaticon.com/512/2490/2490354.png' 
    },
    { 
      id: 'lider', 
      name: 'Líder Emergente', 
      desc: 'Alcanza un rol superior a Miembro.', 
      earned: user.rol !== 'MIEMBRO', 
      img: 'https://cdn-icons-png.flaticon.com/512/1063/1063376.png' 
    },
  ];

  // Cálculo de progreso para el hito (Basado en 4 insignias)
  const earnedCount = badges.filter(b => b.earned).length;
  const milestoneProgress = earnedCount / badges.length;

  return (
    <MainLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Trophy24Filled style={{ color: tokens.colorBrandForeground1, fontSize: '32px' }} />
              <MEHTypography variant="h1">Mis Logros e Insignias</MEHTypography>
            </div>
            <MEHTypography variant="body" style={{ opacity: 0.6 }}>
              Tu camino hacia el dominio tecnológico se refleja en cada una de estas insignias.
            </MEHTypography>
          </div>
          <MEHButton icon={<Share24Filled />} appearance="outline" onClick={() => window.open('https://linkedin.com', '_blank')}>Compartir Perfil</MEHButton>
        </div>

        {/* Resumen de Hito actual */}
        <MEHCard style={{ backgroundColor: 'rgba(127, 19, 236, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: tokens.colorBrandBackground, ...shorthands.borderRadius('50%'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trophy24Filled style={{ color: 'white' }} />
              </div>
              <div>
                <MEHTypography variant="h3">{earnedCount === badges.length ? '¡Hito Alcanzado!' : 'Próximo Hito'}</MEHTypography>
                <MEHTypography variant="caption" style={{ opacity: 0.7 }}>Progreso basado en tus logros actuales</MEHTypography>
              </div>
            </div>
            <MEHTypography variant="h2" style={{ color: tokens.colorBrandForeground1 }}>{(milestoneProgress * 100).toFixed(0)}%</MEHTypography>
          </div>
          <ProgressBar value={milestoneProgress} color={milestoneProgress === 1 ? "success" : "brand"} style={{ height: '8px' }} />
          <MEHTypography variant="caption" style={{ marginTop: '12px', display: 'block', opacity: 0.6 }}>
            {earnedCount < badges.length 
              ? `Te faltan ${badges.length - earnedCount} insignias para completar este nivel.`
              : '¡Has desbloqueado todas las insignias de este nivel! Sigue así.'}
          </MEHTypography>
        </MEHCard>

        {/* Galería de Insignias */}
        <div>
          <MEHTypography variant="h3" style={{ marginBottom: '24px', display: 'block' }}>Galería de Logros</MEHTypography>
          <div className={styles.badgeGrid}>
            {badges.map((badge) => (
              <MEHCard key={badge.id} className={styles.badgeCard}>
                {!badge.earned && <LockClosed24Regular className={styles.lockIcon} />}
                <img 
                  src={badge.img} 
                  alt={badge.name} 
                  className={mergeClasses(
                    styles.badgeImage, 
                    badge.earned ? styles.earned : styles.locked
                  )} 
                />
                <MEHTypography variant="h3" style={{ marginBottom: '8px' }}>{badge.name}</MEHTypography>
                <MEHTypography variant="caption" style={{ opacity: 0.7, marginBottom: '20px' }}>{badge.desc}</MEHTypography>
                
                {badge.earned ? (
                  <BadgeUI color="success" icon={<CheckmarkCircle24Filled />}>Obtenida</BadgeUI>
                ) : (
                  <MEHButton size="small" appearance="outline" icon={<Info24Regular />}>Cómo ganar</MEHButton>
                )}
              </MEHCard>
            ))}
          </div>
        </div>

        {/* Requisitos de Nivel */}
        <section className={styles.milestoneSection}>
          <MEHTypography variant="h3">¿Cómo subir de nivel?</MEHTypography>
          <div className={styles.milestoneGrid}>
            <div className={styles.milestoneStep}>
              {pStats.eventos_inscritos >= 1 ? <CheckmarkCircle24Filled style={{ color: tokens.colorPaletteGreenForeground1 }} /> : <LockClosed24Regular />}
              <div>
                <MEHTypography variant="body" style={{ fontWeight: 'bold' }}>Miembro Activo</MEHTypography>
                <MEHTypography variant="caption" style={{ display: 'block', opacity: 0.6 }}>Asistir al menos a 1 evento de la comunidad.</MEHTypography>
              </div>
            </div>
            <div className={styles.milestoneStep} style={{ borderLeft: `4px solid ${milestoneProgress > 0.5 ? tokens.colorBrandBackground : tokens.colorNeutralBackground3}` }}>
               {user.rol !== 'MIEMBRO' ? <CheckmarkCircle24Filled style={{ color: tokens.colorPaletteGreenForeground1 }} /> : <div style={{ width: '20px', height: '20px', ...shorthands.border('2px', 'solid', tokens.colorBrandForeground1), ...shorthands.borderRadius('50%') }}></div>}
              <div>
                <MEHTypography variant="body" style={{ fontWeight: 'bold' }}>Liderazgo (Embajador+)</MEHTypography>
                <MEHTypography variant="caption" style={{ display: 'block', opacity: 0.6 }}>Obtener un rol de liderazgo validado por el equipo MEH.</MEHTypography>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

// Helpers
const mergeClasses = (...classes) => classes.filter(Boolean).join(' ');
const BadgeUI = ({ children, color, icon }) => (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: '6px', 
    padding: '4px 12px', 
    borderRadius: '20px', 
    fontSize: '12px', 
    fontWeight: 'bold',
    backgroundColor: color === 'success' ? 'rgba(16, 124, 16, 0.1)' : 'rgba(255,255,255,0.05)',
    color: color === 'success' ? '#4ecb71' : 'white',
    border: `1px solid ${color === 'success' ? 'rgba(16, 124, 16, 0.2)' : 'rgba(255,255,255,0.1)'}`
  }}>
    {icon} {children}
  </div>
);

export default Insignias;

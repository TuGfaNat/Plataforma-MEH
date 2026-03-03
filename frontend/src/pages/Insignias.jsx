import React from 'react';
import { 
  makeStyles, 
  shorthands, 
  tokens, 
  ProgressBar,
  Tooltip
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

const BADGE_DATA = [
  { id: 1, name: 'Primeros Pasos', desc: 'Completaste tu registro y primer taller.', earned: true, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBm8Id6Q7IQAc8zIFd_EAaBtwwHy2cpnRgt9QWXHouwYHMsHVWf-HTXY2OwMV1brokFpQm5onbPJEMW2WAaDowylSAh3UbXzgjFCKhP1lXTOJEj8HRmxWBpVqaq82fdHufRnWQ8nmgulV4nDp5mv5D3HaCfEVcU5TJqqQO73JgS6piqGTQbVxtfPA-BxfkyZjoxVCiTAR9p5XE6QLNhQsXB5ClUYH1OBczhrYYouwN5jwedn_-hXnfa6EjCMxuUfVnxCpGeWDqqP7Y' },
  { id: 2, name: 'Azure Explorer', desc: 'Asististe a 3 workshops de Azure Cloud.', earned: true, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-6XooRD1s0I7oEdf32BgSYwKPEFnbi8Cfje3mpXyOnSsd1R0uIE1JJbiRQ4sg_gWnF4A-7hnH0l-pmxgs1y7a7C5hWV0awsfEOQkBUf1k8XsQAK9tU5oIcCEA8rPYXed8qqs8SvNAxrAUxNdh-A-Fvsxebn8mVEt7DVYZcRGLd4XxatfxJAuutWyoOrIPrpyZQMPHr-6y9tnnOt-_d-YtfOhPbX_xya3RonGS2ajsF7L7vO2Jj9IrwWTWevKYRkYD6P71toXjx5g' },
  { id: 3, name: 'AI Specialist', desc: 'Dominas los fundamentos de IA Generativa.', earned: false, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-6XooRD1s0I7oEdf32BgSYwKPEFnbi8Cfje3mpXyOnSsd1R0uIE1JJbiRQ4sg_gWnF4A-7hnH0l-pmxgs1y7a7C5hWV0awsfEOQkBUf1k8XsQAK9tU5oIcCEA8rPYXed8qqs8SvNAxrAUxNdh-A-Fvsxebn8mVEt7DVYZcRGLd4XxatfxJAuutWyoOrIPrpyZQMPHr-6y9tnnOt-_d-YtfOhPbX_xya3RonGS2ajsF7L7vO2Jj9IrwWTWevKYRkYD6P71toXjx5g' },
  { id: 4, name: 'Comunidad Oro', desc: 'Ayudaste a 10 nuevos miembros.', earned: false, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBm8Id6Q7IQAc8zIFd_EAaBtwwHy2cpnRgt9QWXHouwYHMsHVWf-HTXY2OwMV1brokFpQm5onbPJEMW2WAaDowylSAh3UbXzgjFCKhP1lXTOJEj8HRmxWBpVqaq82fdHufRnWQ8nmgulV4nDp5mv5D3HaCfEVcU5TJqqQO73JgS6piqGTQbVxtfPA-BxfkyZjoxVCiTAR9p5XE6QLNhQsXB5ClUYH1OBczhrYYouwN5jwedn_-hXnfa6EjCMxuUfVnxCpGeWDqqP7Y' },
];

const Insignias = () => {
  const styles = useStyles();
  const { t } = useTranslation();

  return (
    <MainLayout>
      <div className={styles.container}>
        {/* Header de la Sección */}
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
          <MEHButton icon={<Share24Filled />} appearance="outline">Compartir en LinkedIn</MEHButton>
        </div>

        {/* Resumen de Hito actual */}
        <MEHCard style={{ backgroundColor: 'rgba(127, 19, 236, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: tokens.colorBrandBackground, ...shorthands.borderRadius('50%'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trophy24Filled style={{ color: 'white' }} />
              </div>
              <div>
                <MEHTypography variant="h3">Gold Milestone</MEHTypography>
                <MEHTypography variant="caption" style={{ opacity: 0.7 }}>Próximo gran hito en tu carrera</MEHTypography>
              </div>
            </div>
            <MEHTypography variant="h2" style={{ color: tokens.colorBrandForeground1 }}>75%</MEHTypography>
          </div>
          <ProgressBar value={0.75} color="success" style={{ height: '8px' }} />
          <MEHTypography variant="caption" style={{ marginTop: '12px', display: 'block', opacity: 0.6 }}>
            Te faltan <span style={{ fontWeight: 'bold', color: tokens.colorNeutralForeground1 }}>2 insignias más</span> para alcanzar el nivel de Embajador Gold.
          </MEHTypography>
        </MEHCard>

        {/* Galería de Insignias */}
        <div>
          <MEHTypography variant="h3" style={{ marginBottom: '24px', display: 'block' }}>Galería de Logros</MEHTypography>
          <div className={styles.badgeGrid}>
            {BADGE_DATA.map((badge) => (
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
                  <Badge appearance="tint" color="success" icon={<CheckmarkCircle24Filled />}>Obtenida</Badge>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', [designTokens.breakpoints.sm]: { gridTemplateColumns: '1fr' } }}>
            <div className={styles.milestoneStep}>
              <CheckmarkCircle24Filled style={{ color: tokens.colorPaletteGreenForeground1 }} />
              <div>
                <MEHTypography variant="body" style={{ fontWeight: 'bold' }}>Miembro Activo</MEHTypography>
                <MEHTypography variant="caption" style={{ display: 'block', opacity: 0.6 }}>Registro completo y asistencia a 1 evento.</MEHTypography>
              </div>
            </div>
            <div className={styles.milestoneStep} style={{ borderLeft: `4px solid ${tokens.colorBrandBackground}` }}>
              <div style={{ width: '20px', height: '20px', ...shorthands.border('2px', 'solid', tokens.colorBrandForeground1), ...shorthands.borderRadius('50%') }}></div>
              <div>
                <MEHTypography variant="body" style={{ fontWeight: 'bold' }}>Embajador MEH</MEHTypography>
                <MEHTypography variant="caption" style={{ display: 'block', opacity: 0.6 }}>Asistir a 5 eventos y completar 2 cursos.</MEHTypography>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

// Pequeño helper para merge de clases ya que no lo importe de Fluent
const mergeClasses = (...classes) => classes.filter(Boolean).join(' ');
const Badge = ({ children, color, appearance, icon }) => (
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

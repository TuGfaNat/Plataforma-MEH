import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  makeStyles, 
  shorthands, 
  tokens 
} from '@fluentui/react-components';
import { 
  ShieldLock48Filled, 
  ArrowLeft24Regular 
} from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { MEHCard, MEHTypography, MEHButton } from '../components/ui';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground4,
    background: 'radial-gradient(circle at center, rgba(127, 19, 236, 0.15) 0%, rgba(10, 10, 10, 1) 75%)',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '550px',
    textAlign: 'center',
    ...shorthands.padding('60px', '40px'),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '28px',
    backgroundColor: 'rgba(20, 20, 20, 0.6)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 100px rgba(127, 19, 236, 0.05)',
    ...shorthands.borderRadius('28px'),
    ...shorthands.border('1px', 'solid', 'rgba(255, 255, 255, 0.05)'),
    position: 'relative',
    overflow: 'hidden',
  },
  iconGlow: {
    fontSize: '72px',
    color: '#FF3B30',
    filter: 'drop-shadow(0 0 25px rgba(255, 59, 48, 0.6))',
    animationName: {
      '0%': { transform: 'scale(1)' },
      '50%': { transform: 'scale(1.05)' },
      '100%': { transform: 'scale(1)' }
    },
    animationDuration: '3s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
  },
  divider: {
    width: '80px',
    height: '4px',
    background: 'linear-gradient(90deg, transparent, #7f13ec, transparent)',
    ...shorthands.borderRadius('2px'),
  },
  badgeRestrict: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    color: '#FF453A',
    ...shorthands.padding('6px', '16px'),
    ...shorthands.borderRadius('20px'),
    fontSize: '12px',
    fontWeight: 'bold',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  }
});

const AccesoDenegado = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <MEHCard className={styles.card}>
        <div className={styles.badgeRestrict}>
          Error 403
        </div>
        
        <ShieldLock48Filled className={styles.iconGlow} />
        
        <div>
          <MEHTypography variant="h1" style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.5px', color: '#FFF' }}>
            Acceso Restringido
          </MEHTypography>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px', marginBottom: '8px' }}>
            <div className={styles.divider} />
          </div>
          <MEHTypography variant="body" style={{ opacity: 0.7, lineHeight: '1.6', fontSize: '1.05rem', marginTop: '16px', display: 'block' }}>
            No tienes los permisos o el rol requerido para visualizar este módulo. Si consideras que esto es un error, por favor contacta al administrador del sistema.
          </MEHTypography>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
          <MEHButton 
            appearance="primary" 
            size="large" 
            icon={<ArrowLeft24Regular />} 
            onClick={() => navigate('/dashboard')}
            style={{ width: '100%', height: '48px', fontWeight: 'bold' }}
          >
            Volver al Dashboard
          </MEHButton>
          
          <MEHButton 
            appearance="subtle" 
            onClick={() => navigate('/')}
            style={{ width: '100%', height: '40px', color: 'rgba(255, 255, 255, 0.5)' }}
          >
            Ir al Inicio público
          </MEHButton>
        </div>
      </MEHCard>
    </div>
  );
};

export default AccesoDenegado;

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  makeStyles, 
  shorthands, 
  tokens, 
  Input,
  Divider,
} from '@fluentui/react-components';
import { 
  ShieldCheckmark48Filled, 
  Search24Regular,
  ArrowLeft24Regular
} from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { MEHCard, MEHTypography, MEHButton } from '../components/ui';
import { designTokens } from '../theme/theme';
import { useAuth } from '../App';

const useStyles = makeStyles({
  containerPublic: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground4,
    background: `radial-gradient(circle at top left, ${tokens.colorBrandBackground2} 0%, ${tokens.colorNeutralBackground4} 70%)`,
    padding: '20px',
  },
  containerPrivate: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px',
    animationName: {
      from: { opacity: 0, transform: 'translateY(10px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    animationDuration: '0.5s',
  },
  card: {
    width: '100%',
    maxWidth: '750px',
    textAlign: 'center',
    ...shorthands.padding('50px', '40px'),
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow16,
    ...shorthands.borderRadius('24px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3),
    position: 'relative',
    overflow: 'hidden',
  },
  searchBox: {
    display: 'flex',
    gap: '12px',
    width: '100%',
    marginTop: '20px',
    [designTokens.breakpoints.sm]: {
      flexDirection: 'column',
    }
  },
  iconHeader: {
    fontSize: '64px',
    color: tokens.colorBrandForeground1,
    marginBottom: '16px',
    filter: `drop-shadow(0 0 20px ${tokens.colorBrandBackground2})`
  },
  infoBox: {
    marginTop: '24px', 
    textAlign: 'left', 
    backgroundColor: tokens.colorNeutralBackground2, 
    ...shorthands.padding('24px'), 
    ...shorthands.borderRadius('16px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3),
  },
  glowEffect: {
    position: 'absolute',
    top: '-50px',
    right: '-50px',
    width: '150px',
    height: '150px',
    backgroundColor: tokens.colorBrandBackground2,
    filter: 'blur(60px)',
    borderRadius: '50%',
    zIndex: 0,
    pointerEvents: 'none'
  }
});

const ValidadorTalento = () => {
  const styles = useStyles();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [code, setCode] = useState('');

  const handleVerify = () => {
    if (code.trim()) {
      navigate(`/verificar/${encodeURIComponent(code.trim())}`);
    }
  };

  // Verificamos si estamos en la ruta pública por la URL, no por si está logueado o no
  const isPublicRoute = location.pathname && location.pathname.startsWith('/validador-publico');

  if (isPublicRoute) {
    return (
      <div className={styles.containerPublic}>
        <div style={{ width: '100%', maxWidth: '750px', display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
            <MEHButton 
              appearance="subtle" 
              icon={<ArrowLeft24Regular />} 
              onClick={() => navigate('/')}
              style={{ color: 'white' }}
            >
              {t('return_home')}
            </MEHButton>
        </div>
        <MEHCard className={styles.card}>
          <div className={styles.glowEffect} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <ShieldCheckmark48Filled className={styles.iconHeader} />
            <MEHTypography variant="h1" style={{ display: 'block', fontSize: '2.5rem', fontWeight: tokens.fontWeightBlack, letterSpacing: '-0.5px' }}>
              {t('verificar_talento')}
            </MEHTypography>
            <MEHTypography variant="body" style={{ opacity: 0.7, maxWidth: '550px', margin: '16px auto', lineHeight: '1.6' }}>
              Protegemos la integridad de los logros de nuestra comunidad. Ingresa el código alfanumérico o UUID para validar una credencial oficial.
            </MEHTypography>
          </div>

          <Divider style={{ position: 'relative', zIndex: 1 }} />

          <div className={styles.searchBox} style={{ position: 'relative', zIndex: 1 }}>
            <Input 
              size="large" 
              placeholder="Ej: MEH-CUR-123 o UUID..." 
              style={{ flexGrow: 1 }}
              contentBefore={<Search24Regular style={{ color: tokens.colorBrandForeground1 }} />}
              value={code}
              onChange={(e, data) => setCode(data.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            />
            <MEHButton appearance="primary" size="large" onClick={handleVerify}>
              {t('verificar_ahora')}
            </MEHButton>
          </div>

          <div className={styles.infoBox} style={{ position: 'relative', zIndex: 1 }}>
            <MEHTypography variant="h4" style={{ display: 'block', marginBottom: '12px', color: tokens.colorBrandForeground1 }}>
              ¿Qué credenciales puedes validar?
            </MEHTypography>
            <ul style={{ margin: 0, paddingLeft: '24px', opacity: 0.8, fontSize: '0.95rem', lineHeight: '1.8' }}>
              <li>Certificados de asistencia a Talleres y Webinars.</li>
              <li>Diplomas de finalización de Rutas de Aprendizaje Académicas.</li>
              <li>Credenciales de Embajadores y Colaboradores VIP.</li>
              <li>Insignias (Badges) de competencias técnicas.</li>
            </ul>
          </div>

          <MEHTypography variant="caption" style={{ opacity: 0.4, marginTop: '16px', position: 'relative', zIndex: 1 }}>
              Microsoft Education Hub - Sistema Central de Verificación de Talento
          </MEHTypography>
        </MEHCard>
      </div>
    );
  }

  // Vista Privada (Dentro del DashboardLayout)
  return (
    <div className={styles.containerPrivate}>
      <MEHCard className={styles.card}>
        <div className={styles.glowEffect} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ShieldCheckmark48Filled className={styles.iconHeader} />
          <MEHTypography variant="h1" style={{ display: 'block', fontSize: '2.5rem', fontWeight: tokens.fontWeightBlack, letterSpacing: '-0.5px', textAlign: 'center' }}>
            {t('verificar_talento')}
          </MEHTypography>
          <MEHTypography variant="body" style={{ opacity: 0.7, maxWidth: '550px', margin: '16px auto', lineHeight: '1.6', textAlign: 'center' }}>
            Protegemos la integridad de los logros de nuestra comunidad. Ingresa el código alfanumérico o UUID para validar una credencial oficial.
          </MEHTypography>
        </div>

        <Divider style={{ position: 'relative', zIndex: 1 }} />

        <div className={styles.searchBox} style={{ position: 'relative', zIndex: 1 }}>
          <Input 
            size="large" 
            placeholder="Ej: MEH-CUR-123 o UUID..." 
            style={{ flexGrow: 1 }}
            contentBefore={<Search24Regular style={{ color: tokens.colorBrandForeground1 }} />}
            value={code}
            onChange={(e, data) => setCode(data.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
          />
          <MEHButton appearance="primary" size="large" onClick={handleVerify}>
            {t('verificar_ahora')}
          </MEHButton>
        </div>

        <div className={styles.infoBox} style={{ position: 'relative', zIndex: 1 }}>
          <MEHTypography variant="h4" style={{ display: 'block', marginBottom: '12px', color: tokens.colorBrandForeground1 }}>
            ¿Qué credenciales puedes validar?
          </MEHTypography>
          <ul style={{ margin: 0, paddingLeft: '24px', opacity: 0.8, fontSize: '0.95rem', lineHeight: '1.8' }}>
            <li>Certificados de asistencia a Talleres y Webinars.</li>
            <li>Diplomas de finalización de Rutas de Aprendizaje Académicas.</li>
            <li>Credenciales de Embajadores y Colaboradores VIP.</li>
            <li>Insignias (Badges) de competencias técnicas.</li>
          </ul>
        </div>

        <MEHTypography variant="caption" style={{ opacity: 0.4, marginTop: '16px', position: 'relative', zIndex: 1 }}>
            Microsoft Education Hub - Sistema Central de Verificación de Talento
        </MEHTypography>
      </MEHCard>
    </div>
  );
};

export default ValidadorTalento;

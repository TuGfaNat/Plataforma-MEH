import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  makeStyles, 
  shorthands, 
  tokens, 
  Input,
  Divider,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbDivider,
  BreadcrumbButton
} from '@fluentui/react-components';
import { 
  ShieldCheckmark48Filled, 
  Search24Regular,
  ArrowLeft24Regular
} from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { MEHCard, MEHTypography, MEHButton } from '../components/ui';
import { designTokens } from '../theme/theme';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground4,
    background: `radial-gradient(circle at top left, ${tokens.colorBrandBackground2} 0%, ${tokens.colorNeutralBackground4} 70%)`,
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '700px',
    textAlign: 'center',
    ...shorthands.padding('60px', '40px'),
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    animationName: {
      from: { opacity: 0, transform: 'scale(0.95)' },
      to: { opacity: 1, transform: 'scale(1)' },
    },
    animationDuration: '0.6s',
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
    marginBottom: '8px',
  }
});

const ValidadorTalento = () => {
  const styles = useStyles();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [code, setCode] = useState('');

  const handleVerify = () => {
    if (code.trim()) {
      navigate(`/verificar/${code.trim()}`);
    }
  };

  return (
    <div className={styles.container}>
      <div style={{ position: 'absolute', top: '40px', left: '40px' }}>
          <MEHButton 
            appearance="subtle" 
            icon={<ArrowLeft24Regular />} 
            onClick={() => navigate('/')}
          >
            Volver al inicio
          </MEHButton>
      </div>

      <MEHCard className={styles.card}>
        <div>
          <ShieldCheckmark48Filled className={styles.iconHeader} />
          <MEHTypography variant="h1" style={{ display: 'block', fontSize: '2.5rem' }}>
            {t('verificar_talento')}
          </MEHTypography>
          <MEHTypography variant="body" style={{ opacity: 0.7, maxWidth: '500px', margin: '16px auto' }}>
            Protegemos la integridad de los logros de nuestra comunidad. Ingresa el código alfanumérico o UUID para validar una credencial oficial.
          </MEHTypography>
        </div>

        <Divider />

        <div className={styles.searchBox}>
          <Input 
            size="large" 
            placeholder="Ej: MEH-CUR-123 o UUID..." 
            style={{ flexGrow: 1 }}
            contentBefore={<Search24Regular />}
            value={code}
            onChange={(e, data) => setCode(data.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
          />
          <MEHButton appearance="primary" size="large" onClick={handleVerify}>
            {t('verificar_ahora')}
          </MEHButton>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'left', backgroundColor: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px' }}>
          <MEHTypography variant="caption" style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
            ¿Qué se puede validar?
          </MEHTypography>
          <ul style={{ margin: 0, paddingLeft: '20px', opacity: 0.7, fontSize: '0.9rem', lineHeight: '1.6' }}>
            <li>Certificados de asistencia a Talleres y Webinars.</li>
            <li>Diplomas de finalización de Rutas de Aprendizaje.</li>
            <li>Credenciales de Embajadores y Colaboradores VIP.</li>
            <li>Insignias de competencias técnicas (Badges).</li>
          </ul>
        </div>

        <MEHTypography variant="caption" style={{ opacity: 0.4 }}>
            Microsoft Education Hub - Sistema de Verificación de Talento v2.0
        </MEHTypography>
      </MEHCard>
    </div>
  );
};

export default ValidadorTalento;

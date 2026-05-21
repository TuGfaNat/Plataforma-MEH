import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  makeStyles, 
  shorthands, 
  tokens, 
  Spinner,
  Divider
} from '@fluentui/react-components';
import { 
  CheckmarkCircle48Filled, 
  ErrorCircle48Filled,
  CalendarLtr24Regular,
  Person24Regular,
  Ribbon24Regular,
  ShieldCheckmark24Regular,
  ArrowLeft24Regular,
  Search24Regular
} from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
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
  statusIcon: {
    fontSize: '80px',
    marginBottom: '8px',
    filter: 'drop-shadow(0 0 15px currentColor)'
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    ...shorthands.padding('16px'),
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRadius('16px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3),
    textAlign: 'left',
  },
  detailsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '16px',
    position: 'relative',
    zIndex: 1,
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
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    marginTop: '20px',
    [designTokens.breakpoints.sm]: {
      flexDirection: 'column',
    }
  }
});

const VerificarCertificado = () => {
  const styles = useStyles();
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cert, setCert] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const checkCertificate = async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await api.get(`/cursos/verificar/${uuid}`);
        setCert(response.data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    checkCertificate();
  }, [uuid]);

  if (loading) {
    const containerStyle = user ? styles.containerPrivate : styles.containerPublic;
    return (
      <div className={containerStyle}>
        <MEHCard className={styles.card}>
            <Spinner label="Verificando autenticidad del documento..." size="huge" />
        </MEHCard>
      </div>
    );
  }

  const containerStyle = user ? styles.containerPrivate : styles.containerPublic;

  return (
    <div className={containerStyle}>
      {!user && (
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
      )}

      <MEHCard className={styles.card}>
        <div className={styles.glowEffect} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <img src={designTokens.logo} alt="MEH Logo" style={{ width: '64px', marginBottom: '16px' }} />
          <MEHTypography variant="h2" style={{ display: 'block', fontWeight: tokens.fontWeightBlack, textAlign: 'center' }}>Microsoft Education Hub</MEHTypography>
          <MEHTypography variant="caption" style={{ opacity: 0.6, textAlign: 'center' }}>Sistema de Verificación de Credenciales</MEHTypography>
        </div>

        <Divider style={{ position: 'relative', zIndex: 1 }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
            {error ? (
            <>
                <ErrorCircle48Filled className={styles.statusIcon} style={{ color: tokens.colorPaletteRedForeground1 }} />
                <MEHTypography variant="h1" style={{ display: 'block', color: tokens.colorPaletteRedForeground1, fontSize: '2.5rem', fontWeight: tokens.fontWeightBlack }}>
                    No Encontrado
                </MEHTypography>
                <MEHTypography variant="body" style={{ display: 'block', marginTop: '12px', opacity: 0.8 }}>
                No hemos podido encontrar un certificado con el ID <strong>{uuid}</strong>. Por favor, verifique el código o contacte con soporte técnico si cree que es un error.
                </MEHTypography>
            </>
            ) : (
            <>
                <CheckmarkCircle48Filled className={styles.statusIcon} style={{ color: tokens.colorPaletteGreenForeground1 }} />
                <MEHTypography variant="h1" style={{ display: 'block', color: tokens.colorPaletteGreenForeground1, fontSize: '2.5rem', fontWeight: tokens.fontWeightBlack }}>
                    Verificado
                </MEHTypography>
                <MEHTypography variant="body" style={{ display: 'block', marginTop: '12px', opacity: 0.8 }}>
                Este documento es auténtico y ha sido emitido oficialmente por nuestra plataforma.
                </MEHTypography>

                <div className={styles.detailsGrid}>
                <div className={styles.infoRow}>
                    <Person24Regular style={{ color: tokens.colorBrandForeground1, fontSize: '24px' }} />
                    <div style={{ flexGrow: 1 }}>
                    <MEHTypography variant="caption" style={{ display: 'block', opacity: 0.6, fontSize: '0.7rem', textTransform: 'uppercase' }}>Estudiante</MEHTypography>
                    <MEHTypography variant="h3">{cert.nombre_usuario}</MEHTypography>
                    </div>
                </div>

                <div className={styles.infoRow}>
                    <Ribbon24Regular style={{ color: tokens.colorBrandForeground1, fontSize: '24px' }} />
                    <div style={{ flexGrow: 1 }}>
                    <MEHTypography variant="caption" style={{ display: 'block', opacity: 0.6, fontSize: '0.7rem', textTransform: 'uppercase' }}>Logro Académico</MEHTypography>
                    <MEHTypography variant="h3">{cert.nombre_curso_evento}</MEHTypography>
                    </div>
                </div>

                <div className={styles.infoRow}>
                    <CalendarLtr24Regular style={{ color: tokens.colorBrandForeground1, fontSize: '24px' }} />
                    <div style={{ flexGrow: 1 }}>
                    <MEHTypography variant="caption" style={{ display: 'block', opacity: 0.6, fontSize: '0.7rem', textTransform: 'uppercase' }}>Fecha de Emisión</MEHTypography>
                    <MEHTypography variant="h3">{cert?.fecha_emision ? new Date(cert.fecha_emision).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</MEHTypography>
                    </div>
                </div>

                <div className={styles.infoRow}>
                    <ShieldCheckmark24Regular style={{ color: tokens.colorBrandForeground1, fontSize: '24px' }} />
                    <div style={{ flexGrow: 1 }}>
                    <MEHTypography variant="caption" style={{ display: 'block', opacity: 0.6, fontSize: '0.7rem', textTransform: 'uppercase' }}>Código de Validación</MEHTypography>
                    <MEHTypography variant="h3" style={{ fontFamily: 'monospace', letterSpacing: '1px' }}>{cert.codigo_verificacion}</MEHTypography>
                    </div>
                </div>
                </div>
            </>
            )}
        </div>

        <Divider style={{ position: 'relative', zIndex: 1 }} />
        
        <div className={styles.actionButtons} style={{ position: 'relative', zIndex: 1 }}>
            <MEHButton 
                appearance="primary" 
                size="large"
                icon={<Search24Regular />}
                onClick={() => navigate(user ? '/validador' : '/validador-publico')}
            >
                {t('otra_verificacion') || 'Nueva Verificación'}
            </MEHButton>
            
            {!user && (
                <MEHButton 
                    appearance="outline" 
                    size="large"
                    onClick={() => navigate('/')}
                >
                    {t('return_home')}
                </MEHButton>
            )}
        </div>
        
        <MEHTypography variant="caption" style={{ opacity: 0.4, marginTop: '16px', position: 'relative', zIndex: 1 }}>
            Microsoft Education Hub - Sistema Central de Verificación de Talento
        </MEHTypography>
      </MEHCard>
    </div>
  );
};

export default VerificarCertificado;

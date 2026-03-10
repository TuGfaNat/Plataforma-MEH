import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  ShieldCheckmark24Regular
} from '@fluentui/react-icons';
import api from '../services/api';
import { MEHCard, MEHTypography, MEHButton } from '../components/ui';
import { designTokens } from '../theme/theme';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground4,
    background: `radial-gradient(circle at bottom right, ${tokens.colorBrandBackground2} 0%, ${tokens.colorNeutralBackground4} 60%)`,
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '600px',
    textAlign: 'center',
    ...shorthands.padding('48px'),
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    animationName: {
      from: { opacity: 0, transform: 'translateY(20px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    animationDuration: '0.8s',
  },
  statusIcon: {
    fontSize: '80px',
    marginBottom: '8px',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    ...shorthands.padding('12px'),
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    ...shorthands.borderRadius('12px'),
    ...shorthands.border('1px', 'solid', 'rgba(255, 255, 255, 0.05)'),
  },
  detailsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    textAlign: 'left',
    marginTop: '16px',
  }
});

const VerificarCertificado = () => {
  const styles = useStyles();
  const { uuid } = useParams();
  const [loading, setLoading] = useState(true);
  const [cert, setCert] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const checkCertificate = async () => {
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
    return (
      <div className={styles.container}>
        <Spinner label="Verificando autenticidad del documento..." />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <MEHCard className={styles.card}>
        <div style={{ marginBottom: '16px' }}>
          <img src={designTokens.logo} alt="MEH Logo" style={{ width: '64px', marginBottom: '12px' }} />
          <MEHTypography variant="h2" style={{ display: 'block' }}>Microsoft Education Hub</MEHTypography>
          <MEHTypography variant="caption" style={{ opacity: 0.6 }}>Sistema de Verificación de Credenciales</MEHTypography>
        </div>

        <Divider />

        {error ? (
          <>
            <ErrorCircle48Filled className={styles.statusIcon} style={{ color: tokens.colorPaletteRedForeground1 }} />
            <MEHTypography variant="h1" style={{ color: tokens.colorPaletteRedForeground1 }}>Certificado No Válido</MEHTypography>
            <MEHTypography variant="body">
              No hemos podido encontrar un certificado con el ID proporcionado. Por favor, verifique el código o contacte con soporte técnico.
            </MEHTypography>
          </>
        ) : (
          <>
            <CheckmarkCircle48Filled className={styles.statusIcon} style={{ color: tokens.colorPaletteGreenForeground1 }} />
            <MEHTypography variant="h1" style={{ color: tokens.colorPaletteGreenForeground1 }}>Certificado Verificado</MEHTypography>
            <MEHTypography variant="body" style={{ opacity: 0.8 }}>
              Este documento es auténtico y ha sido emitido oficialmente por nuestra plataforma.
            </MEHTypography>

            <div className={styles.detailsGrid}>
              <div className={styles.infoRow}>
                <Person24Regular style={{ color: tokens.colorBrandForeground1 }} />
                <div style={{ flexGrow: 1 }}>
                  <MEHTypography variant="caption" style={{ display: 'block', opacity: 0.6 }}>ESTUDIANTE</MEHTypography>
                  <MEHTypography variant="h3">{cert.nombre_usuario}</MEHTypography>
                </div>
              </div>

              <div className={styles.infoRow}>
                <Ribbon24Regular style={{ color: tokens.colorBrandForeground1 }} />
                <div style={{ flexGrow: 1 }}>
                  <MEHTypography variant="caption" style={{ display: 'block', opacity: 0.6 }}>CURSO / EVENTO</MEHTypography>
                  <MEHTypography variant="h3">{cert.nombre_curso_evento}</MEHTypography>
                </div>
              </div>

              <div className={styles.infoRow}>
                <CalendarLtr24Regular style={{ color: tokens.colorBrandForeground1 }} />
                <div style={{ flexGrow: 1 }}>
                  <MEHTypography variant="caption" style={{ display: 'block', opacity: 0.6 }}>FECHA DE EMISIÓN</MEHTypography>
                  <MEHTypography variant="h3">{new Date(cert.fecha_emision).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</MEHTypography>
                </div>
              </div>

              <div className={styles.infoRow}>
                <ShieldCheckmark24Regular style={{ color: tokens.colorBrandForeground1 }} />
                <div style={{ flexGrow: 1 }}>
                  <MEHTypography variant="caption" style={{ display: 'block', opacity: 0.6 }}>CÓDIGO DE REGISTRO</MEHTypography>
                  <MEHTypography variant="h3" style={{ fontFamily: 'monospace' }}>{cert.codigo_verificacion}</MEHTypography>
                </div>
              </div>
            </div>
          </>
        )}

        <Divider style={{ margin: '16px 0' }} />
        
        <MEHTypography variant="caption" style={{ opacity: 0.5 }}>
          Microsoft Education Hub - Empoderando a la próxima generación de líderes tecnológicos.
        </MEHTypography>
        
        <MEHButton appearance="subtle" onClick={() => window.location.href = '/'}>
          Ir al sitio oficial
        </MEHButton>
      </MEHCard>
    </div>
  );
};

export default VerificarCertificado;

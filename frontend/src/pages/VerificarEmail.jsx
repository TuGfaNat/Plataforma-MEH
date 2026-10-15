import React, { useState, useEffect } from 'react';
import { 
  makeStyles, 
  shorthands, 
  MessageBar, 
  tokens, 
  Spinner 
} from '@fluentui/react-components';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  Mail24Filled, 
  Key24Filled, 
  CheckmarkCircle24Filled, 
  ArrowClockwise24Regular,
  ArrowLeft24Regular
} from '@fluentui/react-icons';
import authService from '../services/authService';
import { designTokens } from '../theme/theme';
import { MEHButton, MEHInput, MEHCard, MEHTypography } from '../components/ui';
import { useNotify } from '../App';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground4,
    background: `radial-gradient(circle at top right, ${tokens.colorBrandBackground2} 0%, ${tokens.colorNeutralBackground4} 60%)`,
    position: 'relative',
    ...shorthands.padding('24px'),
  },
  card: {
    width: '460px',
    zIndex: 1,
    ...shorthands.padding('40px'),
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    textAlign: 'center',
    '@media (max-width: 500px)': {
      width: '100%',
      ...shorthands.padding('28px 16px'),
    }
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    textAlign: 'left'
  },
  codeBox: {
    letterSpacing: '8px',
    fontSize: '22px',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'monospace'
  }
});

const VerificarEmail = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { notify } = useNotify();

  const [correo, setCorreo] = useState(searchParams.get('email') || '');
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorApi, setErrorApi] = useState(null);
  const [exito, setExito] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setCorreo(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!correo || !codigo) {
      setErrorApi('Por favor completa el correo y el código de verificación.');
      return;
    }

    setErrorApi(null);
    setLoading(true);

    try {
      await authService.verificarEmail(correo.trim(), codigo.trim());
      setExito(true);
      notify('¡Correo Verificado!', 'Tu cuenta ha sido activada correctamente. Ya puedes iniciar sesión.', 'success');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setErrorApi(typeof detail === 'string' ? detail : 'Código de verificación inválido o expirado.');
    } finally {
      setLoading(false);
    }
  };

  const handleReenviar = async () => {
    if (!correo) {
      setErrorApi('Ingresa tu correo para reenviar el código.');
      return;
    }

    setResending(true);
    setErrorApi(null);
    try {
      await authService.reenviarCodigo(correo.trim());
      notify('Código Reenviado', `Se ha enviado un nuevo código a ${correo}.`, 'info');
    } catch (err) {
      const detail = err.response?.data?.detail;
      setErrorApi(typeof detail === 'string' ? detail : 'Error al reenviar el código.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className={styles.container}>
      <MEHCard className={styles.card}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src={designTokens.logo} alt="Logo" style={{ width: '48px', marginBottom: '12px' }} />
          <MEHTypography variant="h2" style={{ marginBottom: '6px' }}>Verifica tu Correo</MEHTypography>
          <MEHTypography variant="body" style={{ opacity: 0.7, fontSize: '13px' }}>
            Ingresa el código numérico de 6 dígitos que enviamos a tu bandeja de entrada para activar tu cuenta.
          </MEHTypography>
        </div>

        {errorApi && <MessageBar intent="error">{errorApi}</MessageBar>}
        {exito && (
          <MessageBar intent="success" icon={<CheckmarkCircle24Filled />}>
            ¡Correo verificado con éxito! Redirigiendo al inicio de sesión...
          </MessageBar>
        )}

        {!exito ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <MEHInput 
              label="Correo Electrónico"
              type="email"
              icon={<Mail24Filled />}
              value={correo}
              onChange={(e, d) => setCorreo(d.value)}
              placeholder="tu_correo@ejemplo.com"
              required
            />

            <MEHInput 
              label="Código de Verificación (6 dígitos)"
              type="text"
              icon={<Key24Filled />}
              value={codigo}
              onChange={(e, d) => setCodigo(d.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              inputStyle={{ letterSpacing: '6px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}
              maxLength={6}
              required
            />

            <MEHButton 
              type="submit"
              appearance="primary"
              disabled={loading || codigo.length < 6}
              style={{ marginTop: '10px' }}
            >
              {loading ? <Spinner size="tiny" label="Verificando..." /> : 'Verificar Cuenta'}
            </MEHButton>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <MEHButton 
                appearance="subtle"
                size="small"
                icon={<ArrowClockwise24Regular />}
                onClick={handleReenviar}
                disabled={resending || !correo}
              >
                {resending ? 'Reenviando...' : 'Reenviar código'}
              </MEHButton>

              <Link to="/login" style={{ textDecoration: 'none', color: tokens.colorBrandForeground1, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ArrowLeft24Regular style={{ fontSize: '14px' }} /> Iniciar sesión
              </Link>
            </div>
          </form>
        ) : (
          <div style={{ padding: '16px 0' }}>
            <MEHButton appearance="primary" onClick={() => navigate('/login')}>
              Ir a Iniciar Sesión Ahora
            </MEHButton>
          </div>
        )}
      </MEHCard>
    </div>
  );
};

export default VerificarEmail;

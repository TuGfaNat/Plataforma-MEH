import React, { useState } from 'react';
import { 
  makeStyles, 
  shorthands, 
  MessageBar,
  tokens
} from '@fluentui/react-components';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { 
  Mail24Filled,
  ArrowLeft24Regular,
  Send24Regular
} from '@fluentui/react-icons';
import authService from '../services/authService';
import { designTokens } from '../theme/theme';
import { MEHButton, MEHInput, MEHCard, MEHTypography } from '../components/ui';
import { validateEmail } from '../utils/validators';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground4,
    background: `radial-gradient(circle at bottom right, ${tokens.colorBrandBackground2} 0%, ${tokens.colorNeutralBackground4} 60%)`,
    position: 'relative',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: '600px',
    height: '600px',
    background: tokens.colorBrandBackground2,
    filter: 'blur(150px)',
    ...shorthands.borderRadius('50%'),
    opacity: 0.2,
    zIndex: 0,
    top: '-200px',
    left: '-200px',
  },
  card: {
    width: '450px',
    zIndex: 1,
    ...shorthands.padding('48px'),
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    animationName: {
      from: { opacity: 0, transform: 'translateY(20px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    animationDuration: '0.8s',
    '@media (max-width: 480px)': {
      width: '90%',
      ...shorthands.padding('32px', '20px'),
    }
  },
  logo: {
    width: '64px',
    filter: 'drop-shadow(0 0 20px rgba(127, 19, 236, 0.4))',
    marginBottom: '16px',
    alignSelf: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  backLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: tokens.colorNeutralForeground3,
    textDecorationLine: 'none',
    fontSize: tokens.fontSizeBase300,
    ':hover': { color: tokens.colorBrandForeground1 },
  }
});

const ForgotPassword = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isFirstTime = searchParams.get('first_time') === 'true';

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }
    
    setLoading(true);
    setApiError(null);
    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      // Por seguridad, incluso si falla mostramos éxito para evitar enumeración de usuarios
      // Pero logueamos el error
      console.error("Error en forgot password:", err);
      setSuccess(true); 
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e, data) => {
    setEmail(data.value);
    if (emailError) setEmailError(validateEmail(data.value));
  };

  return (
    <div className={styles.container}>
      <div className={styles.glow}></div>
      
      <MEHCard className={styles.card}>
        <Link to="/login" className={styles.backLink}>
          <ArrowLeft24Regular /> Volver al Login
        </Link>

        <img src={designTokens.logo} alt="MEH Logo" className={styles.logo} />
        
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <MEHTypography variant="h2" style={{ display: 'block', textAlign: 'center' }}>
            {isFirstTime ? "Configura tu cuenta" : "¿Olvidaste tu clave?"}
          </MEHTypography>
          <MEHTypography variant="body" style={{ opacity: 0.7, display: 'block', textAlign: 'center' }}>
            {isFirstTime 
              ? "Como es tu primera vez, necesitamos que confirmes tu correo para crear una contraseña segura."
              : "Ingresa tu correo institucional y te enviaremos instrucciones para recuperarla."
            }
          </MEHTypography>
        </div>

        {success ? (
          <MessageBar intent="success">
            Si el correo existe en nuestra base de datos, recibirás un enlace de recuperación pronto.
          </MessageBar>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <MEHInput 
              label="Correo Electrónico"
              type="email"
              contentBefore={<Mail24Filled style={{ opacity: 0.5 }} />}
              value={email}
              onChange={handleEmailChange}
              placeholder="ejemplo@email.com"
              validationState={emailError ? "error" : "none"}
              validationMessage={emailError}
              required 
            />

            <MEHButton 
              size="large" 
              type="submit" 
              loading={loading}
              icon={<Send24Regular />}
              style={{ height: '52px' }}
            >
              Enviar enlace
            </MEHButton>
          </form>
        )}
      </MEHCard>
    </div>
  );
};

export default ForgotPassword;

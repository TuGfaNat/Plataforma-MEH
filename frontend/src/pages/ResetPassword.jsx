import React, { useState } from 'react';
import { 
  makeStyles, 
  shorthands, 
  MessageBar,
  tokens
} from '@fluentui/react-components';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  LockClosed24Filled,
  Checkmark24Regular,
  Eye24Regular,
  EyeOff24Regular,
  ShieldLock24Regular
} from '@fluentui/react-icons';
import authService from '../services/authService';
import { designTokens } from '../theme/theme';
import { MEHButton, MEHInput, MEHCard, MEHTypography } from '../components/ui';
import { validatePassword } from '../utils/validators';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground4,
    background: `radial-gradient(circle at top left, ${tokens.colorBrandBackground2} 0%, ${tokens.colorNeutralBackground4} 60%)`,
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
    right: '-200px',
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
  },
  logo: {
    width: '64px',
    filter: 'drop-shadow(0 0 20px rgba(127, 19, 236, 0.4))',
    marginBottom: '8px',
    alignSelf: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  link: {
    color: tokens.colorBrandForeground1,
    textDecorationLine: 'none',
    fontWeight: 'bold',
    ':hover': { textDecorationLine: 'underline' },
  }
});

const ResetPassword = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({ password: null, confirmPassword: null });
  const [apiError, setApiError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const passErr = validatePassword(formData.password);
    const confirmErr = formData.password !== formData.confirmPassword ? "Las contraseñas no coinciden" : null;

    setErrors({ password: passErr, confirmPassword: confirmErr });

    if (passErr || confirmErr || !token) return;

    setLoading(true);
    setApiError(null);

    try {
      await authService.resetPassword(token, formData.password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setApiError(err.response?.data?.detail || "Error al restablecer contraseña. El enlace puede haber expirado.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className={styles.container}>
        <MEHCard className={styles.card}>
          <MessageBar intent="error">
            Enlace de recuperación inválido. Por favor, solicita uno nuevo.
          </MessageBar>
          <Link to="/forgot-password" className={styles.link} style={{ textAlign: 'center' }}>
            Solicitar nuevo enlace
          </Link>
        </MEHCard>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.glow}></div>
      
      <MEHCard className={styles.card}>
        <img src={designTokens.logo} alt="MEH Logo" className={styles.logo} />
        
        <div style={{ textAlign: 'center' }}>
          <MEHTypography variant="h2">Crea tu nueva clave</MEHTypography>
          <MEHTypography variant="body" style={{ opacity: 0.7 }}>
            Asegúrate de que sea una contraseña segura y difícil de adivinar.
          </MEHTypography>
        </div>

        {success ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <MessageBar intent="success">
              ¡Contraseña actualizada con éxito! Redirigiendo al login...
            </MessageBar>
            <MEHButton appearance="primary" onClick={() => navigate('/login')}>Ir al Login ahora</MEHButton>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {apiError && <MessageBar intent="error">{apiError}</MessageBar>}
            
            <MEHInput 
              label="Nueva Contraseña"
              type={showPassword ? "text" : "password"}
              contentBefore={<LockClosed24Filled style={{ opacity: 0.5 }} />}
              contentAfter={
                <MEHButton 
                  appearance="subtle" 
                  icon={showPassword ? <EyeOff24Regular /> : <Eye24Regular />} 
                  onClick={() => setShowPassword(!showPassword)}
                />
              }
              value={formData.password}
              onChange={(e, data) => setFormData(prev => ({ ...prev, password: data.value }))}
              placeholder="••••••••"
              validationState={errors.password ? "error" : "none"}
              validationMessage={errors.password}
              required
            />

            <MEHInput 
              label="Confirmar Contraseña"
              type={showPassword ? "text" : "password"}
              contentBefore={<Checkmark24Regular style={{ opacity: 0.5 }} />}
              value={formData.confirmPassword}
              onChange={(e, data) => setFormData(prev => ({ ...prev, confirmPassword: data.value }))}
              placeholder="••••••••"
              validationState={errors.confirmPassword ? "error" : "none"}
              validationMessage={errors.confirmPassword}
              required
            />

            <MEHButton 
              size="large" 
              type="submit" 
              loading={loading}
              icon={<ShieldLock24Regular />}
              style={{ height: '52px', marginTop: '12px' }}
            >
              Restablecer mi clave
            </MEHButton>
          </form>
        )}
      </MEHCard>
    </div>
  );
};

export default ResetPassword;

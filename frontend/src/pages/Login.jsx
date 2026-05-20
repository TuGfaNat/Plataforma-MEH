import React, { useState } from 'react';
import { 
  makeStyles, 
  shorthands, 
  MessageBar,
  tokens
} from '@fluentui/react-components';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LockClosed24Filled, 
  Mail24Filled,
  ArrowRight24Regular,
  Eye24Regular,
  EyeOff24Regular
} from '@fluentui/react-icons';
import authService from '../services/authService';
import { designTokens } from '../theme/theme';
import { MEHButton, MEHInput, MEHCard, MEHTypography } from '../components/ui';
import { useAuth } from '../App';
import { validateEmail, validatePassword, hasErrors } from '../utils/validators';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground4,
    background: `radial-gradient(circle at top right, ${tokens.colorBrandBackground2} 0%, ${tokens.colorNeutralBackground4} 60%)`,
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
    bottom: '-200px',
    left: '-200px',
  },
  loginCard: {
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
  logoContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  logo: {
    width: '64px',
    filter: 'drop-shadow(0 0 20px rgba(127, 19, 236, 0.4))',
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
    transition: 'opacity 0.2s ease',
    ':hover': {
      textDecorationLine: 'underline',
      opacity: 0.8,
    },
  },
  footer: {
    marginTop: '16px',
    textAlign: 'center',
    borderTop: `1px solid rgba(255, 255, 255, 0.05)`,
    paddingTop: '24px',
  },
  forgotLink: {
    textAlign: 'right',
    marginTop: '-12px',
    fontSize: tokens.fontSizeBase200,
  }
});

const Login = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  
  const [formData, setFormData] = useState({ correo: '', password: '' });
  const [errors, setErrors] = useState({ correo: null, password: null });
  const [errorApi, setErrorApi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field, value, validator) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: validator(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {
      correo: validateEmail(formData.correo),
      password: formData.password ? null : "La contraseña es obligatoria"
    };

    setErrors(newErrors);
    if (hasErrors(newErrors)) return;

    setErrorApi(null);
    setLoading(true);
    
    try {
      const response = await authService.login(formData.correo, formData.password);
      if (checkAuth) await checkAuth(); 
      
      if (response.es_nuevo) {
        // Redirigir a recuperación para que cambie su clave temporal/inicial
        navigate('/forgot-password?first_time=true');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setLoading(false);
      if (!err.response) {
        setErrorApi('No se pudo conectar con el servidor. Verifica tu conexión.');
      } else {
        setErrorApi(err.response.data.detail || 'Credenciales incorrectas');
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.glow}></div>
      
      <MEHCard className={styles.loginCard}>
        <div className={styles.logoContainer}>
          <img src={designTokens.logo} alt="MEH Logo" className={styles.logo} />
          <MEHTypography variant="h1" style={{ fontSize: '1.8rem', fontWeight: tokens.fontWeightBlack, textAlign: 'center', lineHeight: '1.2' }}>
            Microsoft Education <span style={{ color: tokens.colorBrandForeground1 }}>Hub</span>
          </MEHTypography>
          <MEHTypography variant="body" style={{ opacity: 0.6, textAlign: 'center' }}>
            Accede a tu centro de aprendizaje y comunidad global.
          </MEHTypography>
        </div>

        {errorApi && <MessageBar intent="error">{errorApi}</MessageBar>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <MEHInput 
            label="Correo Electrónico"
            type="email"
            contentBefore={<Mail24Filled style={{ opacity: 0.5 }} />}
            value={formData.correo}
            onChange={(e, data) => handleInputChange('correo', data.value, validateEmail)}
            placeholder="ejemplo@email.com"
            validationState={errors.correo ? "error" : "none"}
            validationMessage={errors.correo}
            required 
          />

          <MEHInput 
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            contentBefore={<LockClosed24Filled style={{ opacity: 0.5 }} />}
            contentAfter={
              <MEHButton 
                appearance="subtle" 
                icon={showPassword ? <EyeOff24Regular /> : <Eye24Regular />} 
                onClick={() => setShowPassword(!showPassword)}
                style={{ minWidth: 'auto', padding: '0 8px' }}
              />
            }
            value={formData.password}
            onChange={(e, data) => handleInputChange('password', data.value, validatePassword)}
            placeholder="••••••••"
            validationState={errors.password ? "error" : "none"}
            validationMessage={errors.password}
            required
          />

          <div className={styles.forgotLink}>
            <Link to="/forgot-password" className={styles.link} style={{ fontSize: '12px' }}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <MEHButton 
            size="large" 
            type="submit" 
            loading={loading}
            icon={<ArrowRight24Regular />}
            style={{ height: '52px', marginTop: '12px' }}
            disabled={hasErrors(errors)}
          >
            Ingresar al Portal
          </MEHButton>
        </form>

        <div className={styles.footer}>
          <MEHTypography variant="body" style={{ opacity: 0.7 }}>
            ¿Eres un nuevo miembro? <Link to="/register" className={styles.link}>Únete aquí</Link>
          </MEHTypography>
        </div>
      </MEHCard>
    </div>
  );
};

export default Login;

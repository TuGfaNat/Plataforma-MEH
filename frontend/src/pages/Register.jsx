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
  Person24Filled,
  ArrowRight24Regular
} from '@fluentui/react-icons';
import authService from '../services/authService';
import { designTokens } from '../theme/theme';
import { MEHButton, MEHInput, MEHCard, MEHTypography } from '../components/ui';
import { useAuth } from '../App';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground4,
    background: `radial-gradient(circle at bottom left, ${tokens.colorBrandBackground2} 0%, ${tokens.colorNeutralBackground4} 60%)`,
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
    opacity: 0.15,
    zIndex: 0,
    top: '-200px',
    right: '-200px',
  },
  registerCard: {
    width: '500px',
    zIndex: 1,
    ...shorthands.padding('40px'),
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    animationName: {
      from: { opacity: 0, transform: 'translateY(20px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    animationDuration: '0.8s',
    '@media (max-width: 550px)': {
      width: '90%',
      ...shorthands.padding('32px', '20px'),
    }
  },
  logo: {
    width: '48px',
    filter: 'drop-shadow(0 0 15px rgba(127, 19, 236, 0.4))',
    marginBottom: '12px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    '@media (max-width: 400px)': {
      gridTemplateColumns: '1fr',
    }
  },
  link: {
    color: tokens.colorBrandForeground1,
    textDecorationLine: 'none',
    fontWeight: 'bold',
    ':hover': { textDecorationLine: 'underline' },
  }
});

const Register = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [formData, setFormData] = useState({ 
    nombres: '', apellidos: '', correo: '', password: '' 
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      await authService.register({
        ...formData,
        rol: 'MIEMBRO'
      });
      await authService.login(formData.correo, formData.password);
      if (checkAuth) await checkAuth(); 
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al crear la cuenta. Verifica tus datos.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.glow}></div>
      
      <MEHCard className={styles.registerCard}>
        <div style={{ textAlign: 'center' }}>
          <img src={designTokens.logo} alt="MEH Logo" className={styles.logo} />
          <MEHTypography variant="h2">Crea tu cuenta</MEHTypography>
          <MEHTypography variant="body" style={{ opacity: 0.6 }}>
            Únete a la mayor comunidad de aprendizaje tecnológico.
          </MEHTypography>
        </div>

        {error && <MessageBar intent="error">{error}</MessageBar>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <MEHInput 
              label="Nombres"
              contentBefore={<Person24Filled style={{ opacity: 0.5 }} />}
              value={formData.nombres}
              onChange={(e, data) => setFormData({...formData, nombres: data.value})}
              required 
            />
            <MEHInput 
              label="Apellidos"
              value={formData.apellidos}
              onChange={(e, data) => setFormData({...formData, apellidos: data.value})}
              required 
            />
          </div>

          <MEHInput 
            label="Correo Electrónico"
            type="email"
            contentBefore={<Mail24Filled style={{ opacity: 0.5 }} />}
            value={formData.correo}
            onChange={(e, data) => setFormData({...formData, correo: data.value})}
            placeholder="correo@ejemplo.com"
            required 
          />

          <MEHInput 
            label="Contraseña segura"
            type="password"
            contentBefore={<LockClosed24Filled style={{ opacity: 0.5 }} />}
            value={formData.password}
            onChange={(e, data) => setFormData({...formData, password: data.value})}
            placeholder="Mínimo 8 caracteres"
            required 
          />

          <MEHButton 
            size="large" 
            type="submit" 
            loading={loading}
            icon={<ArrowRight24Regular />}
            style={{ height: '48px', marginTop: '10px' }}
          >
            Comenzar mi viaje
          </MEHButton>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <MEHTypography variant="body" style={{ opacity: 0.7 }}>
            ¿Ya tienes cuenta? <Link to="/login" className={styles.link}>Inicia sesión</Link>
          </MEHTypography>
        </div>
      </MEHCard>
    </div>
  );
};

export default Register;

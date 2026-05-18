import React, { useState } from 'react';
import { 
  makeStyles, 
  shorthands, 
  MessageBar,
  tokens,
  Divider,
  Select,
  Label
} from '@fluentui/react-components';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LockClosed24Filled, 
  Mail24Filled,
  Person24Filled,
  ArrowRight24Regular,
  Eye24Regular,
  EyeOff24Regular,
  Globe24Regular,
  Building24Regular,
  Map24Regular,
  Group24Regular
} from '@fluentui/react-icons';
import authService from '../services/authService';
import { designTokens } from '../theme/theme';
import { MEHButton, MEHInput, MEHCard, MEHTypography } from '../components/ui';
import { useAuth } from '../App';
import { validateName, validateEmail, validatePassword, hasErrors } from '../utils/validators';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground4,
    background: `radial-gradient(circle at bottom left, ${tokens.colorBrandBackground2} 0%, ${tokens.colorNeutralBackground4} 60%)`,
    position: 'relative',
    ...shorthands.padding('40px', '0'),
  },
  registerCard: {
    width: '600px',
    zIndex: 1,
    ...shorthands.padding('48px'),
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    '@media (max-width: 650px)': {
      width: '90%',
      ...shorthands.padding('32px', '20px'),
    }
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    '@media (max-width: 500px)': {
      gridTemplateColumns: '1fr',
    }
  },
  sectionTitle: {
    marginTop: '12px',
    color: tokens.colorBrandForeground1,
    fontWeight: 'bold',
  }
});

const Register = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  
  const [formData, setFormData] = useState({ 
    nombres: '', apellidos: '', correo: '', password: '',
    alias: '', institucion: '', tipo_entidad: 'Estudiante',
    pais: 'Bolivia', departamento: '',
    bio: '', linkedin_url: '', github_url: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorApi, setErrorApi] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value, validator) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validator) setErrors(prev => ({ ...prev, [field]: validator(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {
      nombres: validateName(formData.nombres),
      apellidos: validateName(formData.apellidos),
      correo: validateEmail(formData.correo),
      password: validatePassword(formData.password)
    };

    setErrors(newErrors);
    if (hasErrors(newErrors)) return;

    setErrorApi(null);
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
      setErrorApi(err.response?.data?.detail || 'Error al crear la cuenta.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <MEHCard className={styles.registerCard}>
        <div style={{ textAlign: 'center' }}>
          <img src={designTokens.logo} alt="Logo" style={{ width: '48px', marginBottom: '12px' }} />
          <MEHTypography variant="h2" style={{ display: 'block' }}>Crea tu Perfil Profesional</MEHTypography>
          <MEHTypography variant="body" style={{ opacity: 0.6 }}>Completa tus datos para unirte a la comunidad.</MEHTypography>
        </div>

        {errorApi && <MessageBar intent="error">{errorApi}</MessageBar>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <MEHTypography variant="body" className={styles.sectionTitle}>1. Información Básica</MEHTypography>
          <div className={styles.row}>
            <MEHInput 
              label="Nombres"
              value={formData.nombres}
              onChange={(e, d) => handleInputChange('nombres', d.value, validateName)}
              required 
            />
            <MEHInput 
              label="Apellidos"
              value={formData.apellidos}
              onChange={(e, d) => handleInputChange('apellidos', d.value, validateName)}
              required 
            />
          </div>

          <div className={styles.row}>
            <MEHInput 
              label="Correo"
              type="email"
              value={formData.correo}
              onChange={(e, d) => handleInputChange('correo', d.value, validateEmail)}
              required 
            />
            <MEHInput 
              label="Alias / Username"
              value={formData.alias}
              onChange={(e, d) => setFormData({...formData, alias: d.value})}
              placeholder="Ej: juan_dev"
            />
          </div>

          <MEHInput 
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            contentAfter={
              <MEHButton icon={showPassword ? <EyeOff24Regular /> : <Eye24Regular />} onClick={() => setShowPassword(!showPassword)} appearance="subtle" />
            }
            value={formData.password}
            onChange={(e, d) => handleInputChange('password', d.value, validatePassword)}
            required 
          />

          <Divider />
          <MEHTypography variant="body" className={styles.sectionTitle}>2. Perfil Académico / Profesional</MEHTypography>
          
          <div className={styles.row}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Label>Soy...</Label>
              <Select 
                value={formData.tipo_entidad} 
                onChange={(e, d) => setFormData({...formData, tipo_entidad: d.value})}
              >
                <option value="Estudiante">Estudiante</option>
                <option value="Profesional">Profesional</option>
                <option value="Emprendedor">Emprendedor</option>
              </Select>
            </div>
            <MEHInput 
              label="Institución / Empresa"
              value={formData.institucion}
              onChange={(e, d) => setFormData({...formData, institucion: d.value})}
              placeholder="Ej: UMSA, Microsoft, etc."
            />
          </div>

          <div className={styles.row}>
            <MEHInput 
              label="País"
              value={formData.pais}
              onChange={(e, d) => setFormData({...formData, pais: d.value})}
            />
            <MEHInput 
              label="Departamento / Ciudad"
              value={formData.departamento}
              onChange={(e, d) => setFormData({...formData, departamento: d.value})}
              placeholder="Ej: La Paz"
            />
          </div>

          <Divider />
          <MEHTypography variant="body" className={styles.sectionTitle}>3. Presencia Digital</MEHTypography>
          
          <div className={styles.row}>
            <MEHInput 
              label="LinkedIn URL"
              value={formData.linkedin_url}
              onChange={(e, d) => setFormData({...formData, linkedin_url: d.value})}
            />
            <MEHInput 
              label="GitHub URL"
              value={formData.github_url}
              onChange={(e, d) => setFormData({...formData, github_url: d.value})}
            />
          </div>

          <MEHButton 
            size="large" 
            type="submit" 
            loading={loading}
            icon={<ArrowRight24Regular />}
            style={{ marginTop: '12px' }}
          >
            Registrarme y Continuar
          </MEHButton>
        </form>

        <div style={{ textAlign: 'center' }}>
          <MEHTypography variant="body" style={{ opacity: 0.7 }}>
            ¿Ya tienes cuenta? <Link to="/login" style={{ color: tokens.colorBrandForeground1, fontWeight: 'bold', textDecoration: 'none' }}>Inicia sesión</Link>
          </MEHTypography>
        </div>
      </MEHCard>
    </div>
  );
};

export default Register;

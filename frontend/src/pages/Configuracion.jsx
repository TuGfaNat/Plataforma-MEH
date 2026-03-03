import React, { useState } from 'react';
import { 
  makeStyles, 
  shorthands, 
  tokens,
  Input,
  Label,
  Switch,
  Spinner
} from '@fluentui/react-components';
import { 
  Settings24Regular,
  Person24Regular,
  PaintBrush24Regular,
  ShieldKeyhole24Regular,
  CheckmarkCircle24Regular
} from '@fluentui/react-icons';
import MainLayout from '../components/layout/MainLayout';
import { MEHCard, MEHButton, MEHTypography } from '../components/ui';
import { useAuth, useTheme } from '../App';
import authService from '../services/authService';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    animationName: {
      from: { opacity: 0, transform: 'translateY(10px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    animationDuration: '0.5s',
    maxWidth: '800px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '16px',
  },
  inputRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    '@media(max-width: 600px)': {
      gridTemplateColumns: '1fr',
    }
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  }
});

const Configuracion = () => {
  const styles = useStyles();
  const { user, setUser } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const [formData, setFormData] = useState({
    nombres: user?.nombres || '',
    apellidos: user?.apellidos || '',
    bio: user?.bio || '',
    linkedin_url: user?.linkedin_url || '',
    github_url: user?.github_url || ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e, data) => {
    const { id } = e.target;
    setFormData(prev => ({ ...prev, [id]: data.value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setSuccess(false);
    try {
      const updatedUser = await authService.updateMe(formData);
      setUser(updatedUser);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error al actualizar perfil:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className={styles.container}>
        <div>
          <div className={styles.header}>
            <Settings24Regular style={{ color: tokens.colorBrandForeground1, fontSize: '32px' }} />
            <MEHTypography variant="h1">Configuración</MEHTypography>
          </div>
          <MEHTypography variant="body" style={{ opacity: 0.6 }}>
            Personaliza tu experiencia y administra los datos de tu cuenta.
          </MEHTypography>
        </div>

        <MEHCard>
          <MEHTypography variant="h3" style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
            <Person24Regular /> Perfil Público
          </MEHTypography>
          <div className={styles.formGroup}>
            <div className={styles.inputRow}>
              <div className={styles.section}>
                <Label htmlFor="nombres">Nombres</Label>
                <Input id="nombres" value={formData.nombres} onChange={handleInputChange} />
              </div>
              <div className={styles.section}>
                <Label htmlFor="apellidos">Apellidos</Label>
                <Input id="apellidos" value={formData.apellidos} onChange={handleInputChange} />
              </div>
            </div>
            <div className={styles.section}>
              <Label htmlFor="bio">Biografía / Titular</Label>
              <Input id="bio" placeholder="Ej: Estudiante de Sistemas | Apasionado por IA" value={formData.bio} onChange={handleInputChange} />
            </div>
            <div className={styles.inputRow}>
              <div className={styles.section}>
                <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                <Input id="linkedin_url" placeholder="https://linkedin.com/in/..." value={formData.linkedin_url} onChange={handleInputChange} />
              </div>
              <div className={styles.section}>
                <Label htmlFor="github_url">GitHub URL</Label>
                <Input id="github_url" placeholder="https://github.com/..." value={formData.github_url} onChange={handleInputChange} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px', alignItems: 'center', gap: '12px' }}>
              {success && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: tokens.colorPaletteGreenForeground1 }}>
                  <CheckmarkCircle24Regular /> 
                  <MEHTypography variant="caption">Cambios guardados</MEHTypography>
                </div>
              )}
              <MEHButton appearance="primary" onClick={handleSave} disabled={loading}>
                {loading ? <Spinner size="tiny" /> : 'Guardar Cambios'}
              </MEHButton>
            </div>
          </div>
        </MEHCard>

        <MEHCard>
          <MEHTypography variant="h3" style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
            <PaintBrush24Regular /> Preferencias
          </MEHTypography>
          <div className={styles.formGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <MEHTypography variant="body" style={{ fontWeight: 'bold', display: 'block' }}>Tema Visual</MEHTypography>
                <MEHTypography variant="caption" style={{ opacity: 0.6 }}>Cambia entre modo oscuro y claro.</MEHTypography>
              </div>
              <Switch checked={isDarkMode} onChange={toggleTheme} label={isDarkMode ? 'Oscuro' : 'Claro'} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
              <div>
                <MEHTypography variant="body" style={{ fontWeight: 'bold', display: 'block' }}>Idioma</MEHTypography>
                <MEHTypography variant="caption" style={{ opacity: 0.6 }}>Selecciona el idioma de la plataforma.</MEHTypography>
              </div>
              <select style={{ 
                  padding: '8px 16px', borderRadius: '4px', 
                  background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' 
                }}>
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </MEHCard>

        <MEHCard style={{ borderLeft: '4px solid #d13438' }}>
          <MEHTypography variant="h3" style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', color: '#ff99a4' }}>
            <ShieldKeyhole24Regular /> Seguridad
          </MEHTypography>
          <div className={styles.formGroup}>
             <div className={styles.section}>
                <Label htmlFor="correo">Correo Electrónico</Label>
                <Input id="correo" value={user?.correo} disabled />
              </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <div>
                <MEHTypography variant="body" style={{ fontWeight: 'bold', display: 'block' }}>Contraseña</MEHTypography>
                <MEHTypography variant="caption" style={{ opacity: 0.6 }}>Actualiza tu contraseña periódicamente.</MEHTypography>
              </div>
              <MEHButton appearance="outline">Cambiar Contraseña</MEHButton>
            </div>
          </div>
        </MEHCard>

      </div>
    </MainLayout>
  );
};

export default Configuracion;

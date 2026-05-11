import React, { useState, useEffect } from 'react';
import { 
  makeStyles, 
  shorthands, 
  tokens, 
  Input,
  Label,
  Textarea,
  Avatar,
  Divider,
  Switch,
  Spinner,
  Badge
} from '@fluentui/react-components';
import { 
  Person24Regular, 
  Save24Regular,
  Camera24Regular,
  Globe24Regular,
  People24Regular,
  PersonNote24Filled
} from '@fluentui/react-icons';
import MainLayout from '../components/layout/MainLayout';
import { MEHCard, MEHButton, MEHTypography } from '../components/ui';
import { useAuth, useNotify } from '../App';
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
  },
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 350px',
    gap: '32px',
    '@media (max-width: 1024px)': {
      gridTemplateColumns: '1fr',
    }
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  cardPreview: {
    background: 'linear-gradient(135deg, #7f13ec 0%, #3a0078 100%)',
    color: 'white',
    ...shorthands.padding('32px'),
    ...shorthands.borderRadius('20px'),
    position: 'sticky',
    top: '32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '16px',
    boxShadow: '0 20px 40px rgba(127, 19, 236, 0.3)',
  }
});

const Configuracion = () => {
  const styles = useStyles();
  const { user, checkAuth } = useAuth();
  const { notify } = useNotify();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    alias: '',
    foto_url: '',
    bio: '',
    linkedin_url: '',
    github_url: '',
    perfil_publico: true
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nombres: user.nombres || '',
        apellidos: user.apellidos || '',
        alias: user.alias || '',
        foto_url: user.foto_url || '',
        bio: user.bio || '',
        linkedin_url: user.linkedin_url || '',
        github_url: user.github_url || '',
        perfil_publico: user.perfil_publico ?? true
      });
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await authService.updateMe(formData);
      await checkAuth(); // Refrescar contexto global
      notify("Perfil Actualizado", "Tus cambios se han guardado con éxito", "success");
    } catch (err) {
      notify("Error", "No se pudo actualizar el perfil", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <Spinner label="Cargando configuración..." />;

  return (
    <MainLayout>
      <div className={styles.container}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Person24Regular style={{ color: tokens.colorBrandForeground1, fontSize: '32px' }} />
          <MEHTypography variant="h1">Configuración de Perfil</MEHTypography>
        </div>

        <div className={styles.layoutGrid}>
          {/* LADO IZQUIERDO: FORMULARIO */}
          <MEHCard>
            <div className={styles.formSection}>
              <MEHTypography variant="h3">Información Personal</MEHTypography>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className={styles.fieldGroup}>
                  <Label>Nombres</Label>
                  <Input value={formData.nombres} onChange={(e, d) => setFormData({...formData, nombres: d.value})} />
                </div>
                <div className={styles.fieldGroup}>
                  <Label>Apellidos</Label>
                  <Input value={formData.apellidos} onChange={(e, d) => setFormData({...formData, apellidos: d.value})} />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <Label>Alias / Nombre de Usuario</Label>
                <Input contentBefore={<People24Regular />} value={formData.alias} onChange={(e, d) => setFormData({...formData, alias: d.value})} placeholder="Como quieres que te vean los demás" />
              </div>

              <div className={styles.fieldGroup}>
                <Label>URL de Foto de Perfil</Label>
                <Input contentBefore={<Camera24Regular />} value={formData.foto_url} onChange={(e, d) => setFormData({...formData, foto_url: d.value})} placeholder="https://..." />
              </div>

              <div className={styles.fieldGroup}>
                <Label>Biografía</Label>
                <Textarea value={formData.bio} onChange={(e, d) => setFormData({...formData, bio: d.value})} placeholder="Cuéntanos un poco sobre ti..." />
              </div>

              <Divider />
              <MEHTypography variant="h3">Redes Sociales</MEHTypography>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className={styles.fieldGroup}>
                  <Label>LinkedIn URL</Label>
                  <Input value={formData.linkedin_url} onChange={(e, d) => setFormData({...formData, linkedin_url: d.value})} />
                </div>
                <div className={styles.fieldGroup}>
                  <Label>GitHub URL</Label>
                  <Input value={formData.github_url} onChange={(e, d) => setFormData({...formData, github_url: d.value})} />
                </div>
              </div>

              <Divider />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <MEHTypography variant="body" style={{ fontWeight: 'bold' }}>Perfil Público</MEHTypography>
                  <MEHTypography variant="caption" style={{ display: 'block', opacity: 0.6 }}>Permitir que otros miembros vean tus logros.</MEHTypography>
                </div>
                <Switch checked={formData.perfil_publico} onChange={(e, d) => setFormData({...formData, perfil_publico: d.checked})} />
              </div>

              <MEHButton 
                appearance="primary" 
                size="large" 
                icon={<Save24Regular />} 
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </MEHButton>
            </div>
          </MEHCard>

          {/* LADO DERECHO: PREVIEW CARNET */}
          <aside>
            <div className={styles.cardPreview}>
              <Avatar 
                size={96} 
                name={`${formData.nombres} ${formData.apellidos}`} 
                src={formData.foto_url} 
                color="colorful"
                style={{ border: '4px solid rgba(255,255,255,0.2)' }}
              />
              <div>
                <MEHTypography variant="h2" style={{ color: 'white' }}>{formData.alias || formData.nombres || 'Tu Nombre'}</MEHTypography>
                <Badge appearance="filled" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', marginTop: '4px' }}>{user.rol}</Badge>
              </div>
              
              <MEHTypography variant="caption" style={{ color: 'rgba(255,255,255,0.8)', minHeight: '40px' }}>
                {formData.bio || 'Tu biografía aparecerá aquí. ¡Dinos qué te apasiona!'}
              </MEHTypography>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <Globe24Regular style={{ opacity: formData.linkedin_url ? 1 : 0.3 }} />
                <PersonNote24Filled style={{ opacity: formData.github_url ? 1 : 0.3 }} />
              </div>
              
              <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px border dashed rgba(255,255,255,0.2)', width: '100%' }}>
                <MEHTypography variant="caption" style={{ letterSpacing: '2px', fontWeight: 'bold' }}>MICROSOFT ENTHUSIAST HUB</MEHTypography>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
};

export default Configuracion;

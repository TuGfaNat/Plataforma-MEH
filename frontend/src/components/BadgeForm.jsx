import React, { useState, useEffect } from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  MessageBar,
  Input,
  Label,
  Textarea,
  Select,
  Button
} from '@fluentui/react-components';
import { Add24Regular, ArrowUpload24Regular, Link24Regular, Trophy24Filled, Edit24Regular } from '@fluentui/react-icons';
import { MEHCard, MEHButton, MEHTypography } from './ui';
import { useAuth, useNotify } from '../App';
import { hasPermission, PERMISSION_BADGES_MANAGE } from '../auth/rbac';
import insigniasService from '../services/insigniasService';
import api from '../services/api';

const useStyles = makeStyles({
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  gridTwo: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      '@media (max-width: 600px)': {
          gridTemplateColumns: '1fr'
      }
  },
  uploadBox: {
    border: `2px dashed ${tokens.colorNeutralBackground3}`,
    padding: '24px',
    borderRadius: '12px',
    textAlign: 'center',
    position: 'relative',
    transition: 'all 0.2s ease',
    ':hover': {
        borderColor: tokens.colorBrandBackground,
        backgroundColor: 'rgba(127, 19, 236, 0.03)'
    }
  }
});

const BadgeForm = ({ onSuccess, editingBadge, onCancel }) => {
  const styles = useStyles();
  const { user } = useAuth();
  const { notify } = useNotify();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    nombre_badge: '',
    descripcion: '',
    requisito_nivel: 'Beginner',
    puntos: 10,
    imagen_url: '',
  });

  useEffect(() => {
    if (editingBadge) {
      setFormData({
        nombre_badge: editingBadge.nombre_badge || '',
        descripcion: editingBadge.descripcion || '',
        requisito_nivel: editingBadge.requisito_nivel || 'Beginner',
        puntos: editingBadge.puntos || 10,
        imagen_url: editingBadge.imagen_url || '',
      });
    } else {
      setFormData({
        nombre_badge: '',
        descripcion: '',
        requisito_nivel: 'Beginner',
        puntos: 10,
        imagen_url: '',
      });
    }
  }, [editingBadge]);

  const handleFileUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setUploading(true);
      try {
          const uploadData = new FormData();
          uploadData.append('file', file);
          const res = await api.post('/files/upload', uploadData);
          setFormData(prev => ({ ...prev, imagen_url: res.data.url }));
          notify("Éxito", "Imagen cargada correctamente", "success");
      } catch (err) {
          notify("Error", "No se pudo subir la imagen", "error");
      } finally {
          setUploading(false);
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre_badge || !formData.imagen_url) {
        notify("Validación", "Nombre e Imagen son obligatorios", "warning");
        return;
    }

    setLoading(true);
    try {
      if (editingBadge) {
        await insigniasService.updateInsignia(editingBadge.id_badge, formData);
        notify("Éxito", "Insignia actualizada correctamente", "success");
      } else {
        await insigniasService.createInsignia(formData);
        notify("Éxito", "Insignia registrada en el sistema de gamificación", "success");
      }
      
      setFormData({
        nombre_badge: '',
        descripcion: '',
        requisito_nivel: 'Beginner',
        puntos: 10,
        imagen_url: '',
      });
      onSuccess?.();
    } catch (err) {
      notify("Error", `No se pudo ${editingBadge ? 'actualizar' : 'crear'} la insignia`, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!user || !hasPermission(user.rol, PERMISSION_BADGES_MANAGE)) return null;

  return (
    <MEHCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {editingBadge ? <Edit24Regular style={{ fontSize: '24px', color: tokens.colorBrandForeground1 }} /> : <Add24Regular style={{ fontSize: '24px', color: tokens.colorBrandForeground1 }} />}
          <MEHTypography variant="h2">
            {editingBadge ? 'Editar Insignia' : 'Panel de Gamificación: Nueva Insignia'}
          </MEHTypography>
        </div>
        {editingBadge && (
          <MEHButton appearance="subtle" onClick={onCancel}>Cancelar Edición</MEHButton>
        )}
      </div>

      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <div className={styles.gridTwo}>
            <div>
                <Label required>Nombre de la Insignia</Label>
                <Input 
                    value={formData.nombre_badge} 
                    onChange={(e, d) => setFormData({...formData, nombre_badge: d.value})} 
                    placeholder="Ej: Master de Azure"
                    style={{ width: '100%' }}
                />
            </div>
            <div>
                <Label>Nivel Requerido</Label>
                <Select 
                    value={formData.requisito_nivel} 
                    onChange={(e, d) => setFormData({...formData, requisito_nivel: d.value})}
                    style={{ width: '100%' }}
                >
                    <option value="Beginner">Beginner</option>
                    <option value="Explorer">Explorer</option>
                    <option value="Legend">Legend</option>
                    <option value="Master">Master</option>
                    <option value="Champion">Champion</option>
                </Select>
            </div>
        </div>

        <div>
            <Label required>Descripción del Logro</Label>
            <Textarea 
                value={formData.descripcion} 
                onChange={(e, d) => setFormData({...formData, descripcion: d.value})}
                placeholder="Explica cómo se obtiene esta insignia..."
                style={{ width: '100%' }}
                rows={3}
            />
        </div>

        <div className={styles.gridTwo}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Label required>Imagen de la Insignia</Label>
                <Input 
                    contentBefore={<Link24Regular />}
                    value={formData.imagen_url} 
                    onChange={(e, d) => setFormData({...formData, imagen_url: d.value})} 
                    placeholder="URL de la imagen (o sube un archivo)"
                />
                <div className={styles.uploadBox}>
                    {uploading ? <Spinner size="tiny" /> : (
                        <>
                            <ArrowUpload24Regular style={{ fontSize: '24px', opacity: 0.5, marginBottom: '8px' }} />
                            <MEHTypography variant="caption" style={{ display: 'block' }}>Arrastra un archivo (.png, .jpg) para subir</MEHTypography>
                            <input 
                                type="file" 
                                onChange={handleFileUpload} 
                                accept="image/*"
                                style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                            />
                        </>
                    )}
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                <Label>Vista Previa</Label>
                <div style={{ width: '120px', height: '120px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {formData.imagen_url ? <img src={formData.imagen_url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Trophy24Filled style={{ fontSize: '48px', opacity: 0.1 }} />}
                </div>
            </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <MEHButton 
                appearance="primary" 
                size="large" 
                type="submit" 
                loading={loading}
                icon={editingBadge ? <Edit24Regular /> : <Add24Regular />}
            >
                {editingBadge ? 'Actualizar Insignia' : 'Publicar Insignia'}
            </MEHButton>
        </div>
      </form>
    </MEHCard>
  );
};

export default BadgeForm;

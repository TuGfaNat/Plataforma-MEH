import React, { useState, useEffect } from 'react';
import { 
  makeStyles, 
  shorthands, 
  tokens, 
  Input, 
  Textarea, 
  Switch, 
  Table, 
  TableHeader, 
  TableRow, 
  TableHeaderCell, 
  TableBody, 
  TableCell,
  Spinner,
  Badge,
  Divider
} from '@fluentui/react-components';
import { 
  MegaphoneLoud24Filled, 
  Send24Regular, 
  Delete24Regular, 
  Edit24Regular,
  Mail24Filled,
  Link24Regular,
  Image24Regular
} from '@fluentui/react-icons';
import { MEHCard, MEHButton, MEHTypography } from '../components/ui';
import comunidadService from '../services/comunidadService';
import { useNotify } from '../App';
import api from '../services/api';

import { designTokens } from '../theme/theme';

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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
  },
  gridTwo: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '32px',
    [designTokens.breakpoints.md]: {
      gridTemplateColumns: '1fr',
    }
  },
  uploadBox: {
    border: `2px dashed ${tokens.colorNeutralBackground3}`,
    padding: '16px',
    borderRadius: '8px',
    textAlign: 'center',
    position: 'relative',
    cursor: 'pointer',
    ':hover': {
        borderColor: tokens.colorBrandBackground,
    }
  }
});

const NotificacionesAdmin = () => {
  const styles = useStyles();
  const { notify } = useNotify();
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    tipo: 'INFO',
    url_imagen: '',
    link_accion: '',
    enviar_email: false,
    activo: true
  });

  useEffect(() => {
    fetchAnuncios();
  }, []);

  const fetchAnuncios = async () => {
    setLoading(true);
    try {
      const data = await comunidadService.getAllAnuncios();
      setAnuncios(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      const res = await api.post('/files/upload', uploadData);
      setFormData(prev => ({ ...prev, url_imagen: res.data.url }));
      notify("Éxito", "Imagen cargada correctamente", "success");
    } catch (err) {
      notify("Error", "No se pudo subir la imagen", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPublishing(true);
    try {
      await comunidadService.crearAnuncio(formData);
      notify("Éxito", "Anuncio publicado correctamente", "success");
      setFormData({ titulo: '', contenido: '', tipo: 'INFO', url_imagen: '', link_accion: '', enviar_email: false, activo: true });
      fetchAnuncios();
    } catch (err) {
      notify("Error", "No se pudo publicar el anuncio", "error");
    } finally {
      setPublishing(false);
    }
  };

  const handleToggleActivo = async (idAnuncio, currentState) => {
    try {
      await comunidadService.actualizarAnuncio(idAnuncio, { activo: !currentState });
      fetchAnuncios();
    } catch (err) {
      notify("Error", "No se pudo actualizar el estado", "error");
    }
  };

  const handleDelete = async (idAnuncio) => {
    if (!window.confirm("¿Estás seguro de eliminar este anuncio?")) return;
    try {
      await comunidadService.eliminarAnuncio(idAnuncio);
      notify("Eliminado", "Anuncio removido permanentemente", "warning");
      fetchAnuncios();
    } catch (err) {
      notify("Error", "No se pudo eliminar", "error");
    }
  };

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <MegaphoneLoud24Filled style={{ color: tokens.colorBrandForeground1, fontSize: '32px' }} />
        <div>
            <MEHTypography variant="h1">Gestión de Notificaciones</MEHTypography>
            <MEHTypography variant="body" style={{ opacity: 0.7 }}>Crea anuncios para la comunidad y notifica por correo electrónico.</MEHTypography>
        </div>
      </div>

      <div className={styles.gridTwo}>
        <MEHCard>
            <MEHTypography variant="h3" style={{ marginBottom: '20px', display: 'block' }}>Nuevo Anuncio</MEHTypography>
            <form onSubmit={handleSubmit} className={styles.form}>
                <Input 
                    placeholder="Título del anuncio" 
                    value={formData.titulo} 
                    onChange={(e, d) => setFormData({...formData, titulo: d.value})}
                    required
                    style={{ width: '100%' }}
                />
                <Textarea 
                    placeholder="Contenido detallado..." 
                    value={formData.contenido}
                    onChange={(e, d) => setFormData({...formData, contenido: d.value})}
                    required
                    rows={6}
                    style={{ width: '100%' }}
                />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                        <MEHTypography variant="caption" style={{ marginBottom: '4px', display: 'block' }}>Imagen del Anuncio</MEHTypography>
                        <div className={styles.uploadBox}>
                            {uploading ? <Spinner size="tiny" /> : (
                                <>
                                    <Image24Regular style={{ fontSize: '20px', opacity: 0.5 }} />
                                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer' }} />
                                </>
                            )}
                            {formData.url_imagen && <Badge color="success" appearance="tint" style={{ marginLeft: '8px' }}>Cargada</Badge>}
                        </div>
                    </div>
                    <div>
                        <MEHTypography variant="caption" style={{ marginBottom: '4px', display: 'block' }}>Link de Acción</MEHTypography>
                        <Input 
                            contentBefore={<Link24Regular />}
                            placeholder="https://..." 
                            value={formData.link_accion}
                            onChange={(e, d) => setFormData({...formData, link_accion: d.value})}
                            style={{ width: '100%' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', margin: '8px 0' }}>
                    <Switch 
                        label="Enviar por Email" 
                        checked={formData.enviar_email}
                        onChange={(e, d) => setFormData({...formData, enviar_email: d.checked})}
                    />
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <MEHTypography variant="caption">Tipo:</MEHTypography>
                        <select 
                            value={formData.tipo}
                            onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                            style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#333', color: 'white', border: 'none' }}
                        >
                            <option value="INFO">Información</option>
                            <option value="NUEVO">Novedad</option>
                            <option value="ALERTA">Alerta</option>
                        </select>
                    </div>
                </div>

                <MEHButton 
                    type="submit" 
                    appearance="primary" 
                    size="large" 
                    icon={<Send24Regular />}
                    loading={publishing}
                >
                    Publicar Ahora
                </MEHButton>
            </form>
        </MEHCard>

        <MEHCard>
            <MEHTypography variant="h3" style={{ marginBottom: '20px', display: 'block' }}>Historial Reciente</MEHTypography>
            {loading ? <Spinner label="Cargando historial..." /> : (
                <div className={styles.tableWrapper}>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHeaderCell>Fecha</TableHeaderCell>
                                <TableHeaderCell>Título</TableHeaderCell>
                                <TableHeaderCell>Tipo</TableHeaderCell>
                                <TableHeaderCell>Estado</TableHeaderCell>
                                <TableHeaderCell>Acciones</TableHeaderCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {anuncios.map(anuncio => (
                                <TableRow key={anuncio.id_anuncio}>
                                    <TableCell>{new Date(anuncio.fecha_publicacion).toLocaleDateString()}</TableCell>
                                    <TableCell><b>{anuncio.titulo}</b></TableCell>
                                    <TableCell>
                                        <Badge appearance="tint" color={anuncio.tipo === 'ALERTA' ? 'danger' : 'brand'}>
                                            {anuncio.tipo}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Switch 
                                            checked={anuncio.activo} 
                                            onChange={() => handleToggleActivo(anuncio.id_anuncio, anuncio.activo)} 
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <MEHButton size="small" icon={<Delete24Regular />} onClick={() => handleDelete(anuncio.id_anuncio)} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </MEHCard>
      </div>
    </div>
  );
};

export default NotificacionesAdmin;

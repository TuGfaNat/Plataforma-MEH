import React, { useState, useEffect } from 'react';
import { 
  makeStyles, 
  shorthands, 
  tokens, 
  Input, 
  Switch, 
  Table, 
  TableHeader, 
  TableRow, 
  TableHeaderCell, 
  TableBody, 
  TableCell,
  Spinner,
  Badge,
  Divider,
  Select,
  Label
} from '@fluentui/react-components';
import { 
  MegaphoneLoud24Filled, 
  Send24Regular, 
  Delete24Regular, 
  Mail24Filled,
  Link24Regular,
  Image24Regular
} from '@fluentui/react-icons';
import { MEHCard, MEHButton, MEHTypography } from '../components/ui';
import comunidadService from '../services/comunidadService';
import { useNotify } from '../App';
import api, { resolveApiFileUrl } from '../services/api';

import { designTokens } from '../theme/theme';

// Importar React Quill para texto enriquecido
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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
    gap: '20px',
    width: '100%',
  },
  quillWrapper: {
    marginTop: '4px',
    '& .ql-toolbar': {
      ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
      ...shorthands.borderRadius('12px', '12px', '0', '0'),
      backgroundColor: tokens.colorNeutralBackground3,
    },
    '& .ql-container': {
      ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
      ...shorthands.borderRadius('0', '0', '12px', '12px'),
      minHeight: '200px',
      fontSize: '16px',
      backgroundColor: tokens.colorNeutralBackground1,
    }
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
  uploadAction: {
    ...shorthands.border('2px', 'dashed', tokens.colorBrandStroke1),
    ...shorthands.padding('16px'),
    ...shorthands.borderRadius('12px'),
    textAlign: 'center',
    position: 'relative',
    transition: 'all 0.2s ease',
    backgroundColor: tokens.colorNeutralBackground2,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    height: '100%',
    minHeight: '80px',
    ':hover': {
        ...shorthands.borderColor(tokens.colorBrandBackground),
        backgroundColor: tokens.colorBrandBackground2,
    }
  },
  imagePreview: {
    width: '100%',
    height: '120px',
    objectFit: 'cover',
    ...shorthands.borderRadius('8px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3)
  },
  actionCell: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  }
});

const NotificacionesAdmin = () => {
  const styles = useStyles();
  const { notify } = useNotify();
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    tipo: 'INFO',
    url_imagen: '',
    link_accion: '',
    enviar_email: false,
    activo: true
  });

  // Configuración de la barra de herramientas de Quill
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'clean']
    ],
  };

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
      const backendUrl = res.data.url;
      
      setFormData(prev => ({ ...prev, url_imagen: backendUrl }));
      setPreviewUrl(`${resolveApiFileUrl(backendUrl)}?t=${new Date().getTime()}`);
      
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
      setPreviewUrl(null);
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
      notify("Actualizado", "Estado del anuncio modificado", "success");
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
        <MegaphoneLoud24Filled style={{ color: tokens.colorBrandForeground1, fontSize: '42px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <MEHTypography variant="h1">Gestión de Notificaciones</MEHTypography>
            <MEHTypography variant="body" style={{ opacity: 0.7 }}>Crea anuncios para la comunidad y notifica por correo electrónico.</MEHTypography>
        </div>
      </div>

      <div className={styles.gridTwo}>
        <MEHCard>
            <MEHTypography variant="h3" style={{ marginBottom: '20px', display: 'block' }}>Nuevo Anuncio</MEHTypography>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.fieldGroup}>
                    <Label required style={{ marginBottom: '4px' }}>Título del Anuncio</Label>
                    <Input 
                        placeholder="Título descriptivo..." 
                        value={formData.titulo} 
                        onChange={(e, d) => setFormData({...formData, titulo: d.value})}
                        required
                        style={{ width: '100%' }}
                    />
                </div>

                <div className={styles.fieldGroup}>
                    <Label required style={{ marginBottom: '4px' }}>Cuerpo del Mensaje</Label>
                    <div className={styles.quillWrapper}>
                        <ReactQuill 
                            theme="snow"
                            value={formData.contenido}
                            onChange={(content) => setFormData({...formData, contenido: content})}
                            modules={quillModules}
                            placeholder="Redacta el contenido con negritas, links y listas..."
                        />
                    </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className={styles.fieldGroup}>
                        <MEHTypography variant="caption" style={{ fontWeight: 'bold' }}>Imagen del Anuncio</MEHTypography>
                        {previewUrl ? (
                            <div style={{ position: 'relative' }}>
                                <img src={previewUrl} className={styles.imagePreview} alt="Preview" />
                                <MEHButton 
                                    size="small" 
                                    icon={<Delete24Regular />} 
                                    style={{ position: 'absolute', top: '4px', right: '4px' }}
                                    onClick={() => { setFormData({...formData, url_imagen: ''}); setPreviewUrl(null); }}
                                />
                            </div>
                        ) : (
                            <div className={styles.uploadAction} onClick={() => document.getElementById('notif-file').click()}>
                                {uploading ? <Spinner size="tiny" /> : (
                                    <>
                                        <Image24Regular style={{ fontSize: '20px', color: tokens.colorBrandForeground1 }} />
                                        <MEHTypography variant="caption">Subir Multimedia</MEHTypography>
                                        <input id="notif-file" type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    <div className={styles.fieldGroup}>
                        <MEHTypography variant="caption" style={{ fontWeight: 'bold' }}>Link de Acción</MEHTypography>
                        <Input 
                            contentBefore={<Link24Regular />}
                            placeholder="https://..." 
                            value={formData.link_accion}
                            onChange={(e, d) => setFormData({...formData, link_accion: d.value})}
                            style={{ height: '54px' }}
                        />
                    </div>
                </div>

                <Divider />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <Switch 
                            label="Enviar por Email" 
                            checked={formData.enviar_email}
                            onChange={(e, d) => setFormData({...formData, enviar_email: d.checked})}
                        />
                        <MEHTypography variant="caption" style={{ opacity: 0.6, marginLeft: '40px' }}>Notifica a todos los miembros activos.</MEHTypography>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '150px' }}>
                        <MEHTypography variant="caption" style={{ fontWeight: 'bold' }}>Categoría:</MEHTypography>
                        <Select 
                            value={formData.tipo}
                            onChange={(e, d) => setFormData({...formData, tipo: d.value})}
                        >
                            <option value="INFO">Información</option>
                            <option value="NUEVO">Novedad</option>
                            <option value="ALERTA">Alerta</option>
                        </Select>
                    </div>
                </div>

                <MEHButton 
                    type="submit" 
                    appearance="primary" 
                    size="large" 
                    icon={<Send24Regular />}
                    loading={publishing}
                    style={{ marginTop: '12px' }}
                >
                    Publicar Anuncio
                </MEHButton>
            </form>
        </MEHCard>

        <MEHCard>
            <MEHTypography variant="h3" style={{ marginBottom: '20px', display: 'block' }}>Historial Reciente</MEHTypography>
            {loading ? <Spinner label="Cargando historial..." /> : (
                <div className={styles.tableWrapper}>
                    <Table size="extra-small">
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
                                    <TableCell style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        <b>{anuncio.titulo}</b>
                                    </TableCell>
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
                                        <div className={styles.actionCell}>
                                            <MEHButton 
                                                size="small" 
                                                icon={<Delete24Regular />} 
                                                onClick={() => handleDelete(anuncio.id_anuncio)} 
                                                appearance="subtle"
                                                style={{ color: tokens.colorPaletteRedForeground1 }}
                                            />
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

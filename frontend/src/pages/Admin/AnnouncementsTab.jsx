import React, { useState, useEffect } from 'react';
import { 
  makeStyles, 
  shorthands, 
  tokens, 
  TableBody, 
  TableCell, 
  TableRow, 
  Table, 
  TableHeader, 
  TableHeaderCell,
  Badge,
  Input,
  Textarea,
  Field,
  Switch,
  Select,
  Spinner
} from '@fluentui/react-components';
import { 
  Edit24Regular, 
  Delete24Regular, 
  Add24Regular,
  Save24Regular,
  Dismiss24Regular,
  MegaphoneLoud24Regular,
  Image24Regular,
  Send24Regular
} from '@fluentui/react-icons';
import { MEHTypography, MEHButton, MEHCard } from '../../components/ui';
import api from '../../services/api';
import { useNotify } from '../../App';

const useStyles = makeStyles({
  container: { display: 'flex', flexDirection: 'column', gap: '24px' },
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  grid: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginTop: '16px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', backgroundColor: tokens.colorNeutralBackground2, ...shorthands.borderRadius('16px'), ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3) },
  tableWrapper: { ...shorthands.borderRadius('16px'), ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3), backgroundColor: tokens.colorNeutralBackground1, overflow: 'hidden' },
  uploadBox: { ...shorthands.border('2px', 'dashed', tokens.colorBrandStroke1), ...shorthands.padding('16px'), ...shorthands.borderRadius('12px'), textAlign: 'center', cursor: 'pointer', backgroundColor: tokens.colorNeutralBackground1, transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', ':hover': { backgroundColor: tokens.colorBrandBackground2 } },
  previewImg: { width: '100%', maxHeight: '150px', objectFit: 'cover', ...shorthands.borderRadius('8px'), marginTop: '8px' }
});

const AnnouncementsTab = () => {
  const styles = useStyles();
  const { notify } = useNotify();
  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    url_imagen: '',
    link_accion: '',
    tipo: 'INFO',
    activo: true,
    enviar_email: false
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/comunidad/anuncios/all');
      setAnnouncements(res.data || []);
    } catch (err) {
      notify("Error", "No se pudieron cargar los anuncios", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      contenido: '',
      url_imagen: '',
      link_accion: '',
      tipo: 'INFO',
      activo: true,
      enviar_email: false
    });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleEdit = (ann) => {
    setFormData({
      titulo: ann.titulo,
      contenido: ann.contenido,
      url_imagen: ann.url_imagen || '',
      link_accion: ann.link_accion || '',
      tipo: ann.tipo,
      activo: ann.activo,
      enviar_email: false
    });
    setCurrentId(ann.id_anuncio);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este anuncio permanentemente?")) return;
    try {
      await api.delete(`/comunidad/anuncios/${id}`);
      notify("Eliminado", "Anuncio borrado correctamente", "success");
      fetchAnnouncements();
    } catch (err) {
      notify("Error", "No se pudo eliminar el anuncio", "error");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await api.post('/files/upload', form);
      setFormData(prev => ({ ...prev, url_imagen: res.data.url }));
      notify("Éxito", "Imagen cargada", "success");
    } catch (err) {
      notify("Error", "Fallo al subir imagen", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/comunidad/anuncios/${currentId}`, formData);
        notify("Actualizado", "Anuncio guardado", "success");
      } else {
        await api.post('/comunidad/anuncios', formData);
        notify("Publicado", "Anuncio creado con éxito", "success");
      }
      resetForm();
      fetchAnnouncements();
    } catch (err) {
      notify("Error", "No se pudo procesar el anuncio", "error");
    }
  };

  const getBadgeColor = (tipo) => {
    switch (tipo) {
      case 'ALERTA': return 'danger';
      case 'EVENTO': return 'brand';
      default: return 'important';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <MegaphoneLoud24Regular style={{ color: tokens.colorBrandForeground1 }} />
          <MEHTypography variant="h2">Gestión de Anuncios</MEHTypography>
        </div>
        <MEHButton appearance="subtle" icon={<Add24Regular />} onClick={resetForm}>Nuevo Anuncio</MEHButton>
      </div>

      <div className={styles.grid}>
        <div className={styles.tableWrapper}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}><Spinner label="Cargando noticias..." /></div>
          ) : (
            <Table size="extra-small">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Estado</TableHeaderCell>
                  <TableHeaderCell>Título</TableHeaderCell>
                  <TableHeaderCell>Tipo</TableHeaderCell>
                  <TableHeaderCell>Fecha</TableHeaderCell>
                  <TableHeaderCell>Acciones</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.map(ann => (
                  <TableRow key={ann.id_anuncio}>
                    <TableCell>
                      <Badge color={ann.activo ? "success" : "neutral"} appearance="tint">
                        {ann.activo ? "Activo" : "Oculto"}
                      </Badge>
                    </TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>{ann.titulo}</TableCell>
                    <TableCell>
                      <Badge color={getBadgeColor(ann.tipo)} appearance="filled">{ann.tipo}</Badge>
                    </TableCell>
                    <TableCell>{new Date(ann.fecha_publicacion).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <MEHButton size="small" appearance="subtle" icon={<Edit24Regular />} onClick={() => handleEdit(ann)} />
                        <MEHButton size="small" appearance="subtle" icon={<Delete24Regular />} style={{ color: tokens.colorPaletteRedForeground1 }} onClick={() => handleDelete(ann.id_anuncio)} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {announcements.length === 0 && (
                   <TableRow><TableCell colSpan={5} style={{textAlign: 'center', padding: '20px'}}>No hay anuncios publicados.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <MEHTypography variant="h3">{isEditing ? "Editar Anuncio" : "Crear Anuncio"}</MEHTypography>
          
          <Field label="Título del Anuncio" required>
            <Input value={formData.titulo} onChange={(e, d) => handleInputChange('titulo', d.value)} placeholder="Ej: Nueva Certificación Disponible" required />
          </Field>

          <Field label="Contenido / Mensaje" required>
            <Textarea value={formData.contenido} onChange={(e, d) => handleInputChange('contenido', d.value)} placeholder="Escribe aquí el detalle del anuncio..." rows={5} required />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Tipo de Anuncio">
              <Select value={formData.tipo} onChange={(e, d) => handleInputChange('tipo', d.value)}>
                <option value="INFO">Información</option>
                <option value="EVENTO">Evento Próximo</option>
                <option value="ALERTA">Alerta / Crítico</option>
              </Select>
            </Field>
            <Field label="Acción (Link)">
              <Input value={formData.link_accion} onChange={(e, d) => handleInputChange('link_accion', d.value)} placeholder="https://..." />
            </Field>
          </div>

          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <Switch label="Visible" checked={formData.activo} onChange={(e, d) => handleInputChange('activo', d.checked)} />
            {!isEditing && (
              <Field label="Notificar por Email">
                <Switch checked={formData.enviar_email} onChange={(e, d) => handleInputChange('enviar_email', d.checked)} />
              </Field>
            )}
          </div>

          <div className={styles.uploadBox} onClick={() => document.getElementById('ann-file').click()}>
             {uploading ? <Spinner size="tiny" /> : (
               <>
                <Image24Regular />
                <MEHTypography variant="caption">{formData.url_imagen ? "Cambiar Imagen" : "Subir Portada"}</MEHTypography>
                <input id="ann-file" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
               </>
             )}
          </div>
          {formData.url_imagen && <img src={formData.url_imagen} className={styles.previewImg} alt="Preview" />}

          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <MEHButton type="submit" appearance="primary" style={{ flexGrow: 1 }} icon={isEditing ? <Save24Regular /> : <Send24Regular />}>
              {isEditing ? "Guardar Cambios" : "Publicar Ahora"}
            </MEHButton>
            <MEHButton appearance="subtle" icon={<Dismiss24Regular />} onClick={resetForm}>Cancelar</MEHButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnouncementsTab;

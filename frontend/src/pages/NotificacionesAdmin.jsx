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
  Label,
  Checkbox
} from '@fluentui/react-components';
import { 
  MegaphoneLoud24Filled, 
  Send24Regular, 
  Delete24Regular, 
  Link24Regular,
  Image24Regular,
  PeopleCommunity24Regular,
  CalendarLtr24Regular,
  Tag24Regular
} from '@fluentui/react-icons';
import { MEHCard, MEHButton, MEHTypography } from '../components/ui';
import comunidadService from '../services/comunidadService';
import eventoService from '../services/eventoService';
import { useNotify } from '../App';
import api, { resolveApiFileUrl } from '../services/api';
import { designTokens } from '../theme/theme';

// Importar React Quill para texto enriquecido
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const ALL_ROLES = ['MIEMBRO', 'EMBAJADOR', 'ORGANIZADOR', 'MODERADOR', 'SOPORTE', 'ADMIN'];

const CATEGORIAS = [
  { value: 'GENERAL', label: 'General' },
  { value: 'EVENTO', label: 'Evento' },
  { value: 'ACADEMIA', label: 'Academia / Cursos' },
  { value: 'COMUNIDAD', label: 'Comunidad' },
  { value: 'OPORTUNIDAD', label: 'Oportunidad / Empleo' },
  { value: 'URGENTE', label: 'Urgente / Importante' },
];

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
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
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
      minHeight: '160px',
      fontSize: '15px',
      backgroundColor: tokens.colorNeutralBackground1,
    }
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
  },
  gridTwo: {
    display: 'grid',
    gridTemplateColumns: '1.1fr 0.9fr',
    gap: '32px',
    [designTokens.breakpoints.md]: {
      gridTemplateColumns: '1fr',
    }
  },
  rowTwo: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    [designTokens.breakpoints.sm]: {
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
  },
  roleCheckboxGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    padding: '8px',
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRadius('8px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
  }
});

const NotificacionesAdmin = () => {
  const styles = useStyles();
  const { notify } = useNotify();
  const [anuncios, setAnuncios] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [roleSelectionMode, setRoleSelectionMode] = useState('TODOS');
  const [selectedCustomRoles, setSelectedCustomRoles] = useState([]);
  
  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    tipo: 'INFO',
    categoria: 'GENERAL',
    roles_destino: 'TODOS',
    id_evento: '',
    solo_inscritos_evento: false,
    url_imagen: '',
    link_accion: '',
    enviar_email: false,
    activo: true
  });

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'clean']
    ],
  };

  useEffect(() => {
    fetchAnuncios();
    fetchEventos();
  }, []);

  const fetchAnuncios = async () => {
    setLoading(true);
    try {
      const data = await comunidadService.getAllAnuncios();
      setAnuncios(data);
    } catch (err) {
      console.error("Error al cargar anuncios:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventos = async () => {
    try {
      const data = await eventoService.getEventos();
      setEventos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar eventos:", err);
    }
  };

  const handleRolePresetChange = (preset) => {
    setRoleSelectionMode(preset);
    if (preset === 'CUSTOM') {
      const initRoles = selectedCustomRoles.length > 0 ? selectedCustomRoles : ['MIEMBRO'];
      setSelectedCustomRoles(initRoles);
      setFormData(prev => ({ ...prev, roles_destino: initRoles.join(',') }));
    } else {
      setFormData(prev => ({ ...prev, roles_destino: preset }));
    }
  };

  const handleToggleCustomRole = (role) => {
    let next;
    if (selectedCustomRoles.includes(role)) {
      next = selectedCustomRoles.filter(r => r !== role);
    } else {
      next = [...selectedCustomRoles, role];
    }
    setSelectedCustomRoles(next);
    setFormData(prev => ({ ...prev, roles_destino: next.join(',') || 'TODOS' }));
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
      const payload = {
        ...formData,
        id_evento: formData.id_evento ? parseInt(formData.id_evento, 10) : null,
      };
      await comunidadService.crearAnuncio(payload);
      notify("Éxito", "Anuncio publicado correctamente", "success");
      setFormData({ 
        titulo: '', 
        contenido: '', 
        tipo: 'INFO', 
        categoria: 'GENERAL',
        roles_destino: 'TODOS',
        id_evento: '',
        solo_inscritos_evento: false,
        url_imagen: '', 
        link_accion: '', 
        enviar_email: false, 
        activo: true 
      });
      setRoleSelectionMode('TODOS');
      setSelectedCustomRoles([]);
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

  const getTargetAudienceDescription = () => {
    if (formData.solo_inscritos_evento && formData.id_evento) {
      const ev = eventos.find(e => String(e.id_evento) === String(formData.id_evento));
      const evTitle = ev ? `"${ev.titulo}"` : 'este evento';
      return `Notificará únicamente a los participantes con inscripción activa a ${evTitle}.`;
    }
    if (formData.roles_destino && formData.roles_destino !== 'TODOS') {
      return `Notificará únicamente a los usuarios con rol(es): ${formData.roles_destino}.`;
    }
    return 'Notifica a todos los miembros activos de la comunidad.';
  };

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
        <MegaphoneLoud24Filled style={{ color: tokens.colorBrandForeground1, fontSize: '42px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <MEHTypography variant="h1">Gestión de Anuncios y Notificaciones</MEHTypography>
          <MEHTypography variant="body" style={{ opacity: 0.7 }}>
            Publica avisos segmentados por roles, categorías y eventos con envío selectivo por email.
          </MEHTypography>
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
                  placeholder="Redacta el contenido con formato, negritas, links y listas..."
                />
              </div>
            </div>

            {/* Fila: Categoría y Tipo */}
            <div className={styles.rowTwo}>
              <div className={styles.fieldGroup}>
                <Label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Tag24Regular /> Categoría
                </Label>
                <Select 
                  value={formData.categoria}
                  onChange={(e, d) => setFormData({...formData, categoria: d.value})}
                >
                  {CATEGORIAS.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </Select>
              </div>

              <div className={styles.fieldGroup}>
                <Label>Tipo de Aviso</Label>
                <Select 
                  value={formData.tipo}
                  onChange={(e, d) => setFormData({...formData, tipo: d.value})}
                >
                  <option value="INFO">Información</option>
                  <option value="NUEVO">Novedad</option>
                  <option value="ALERTA">Alerta / Importante</option>
                </Select>
              </div>
            </div>

            {/* Segmentación por Roles */}
            <div className={styles.fieldGroup}>
              <Label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PeopleCommunity24Regular /> Audiencia Objetivo (Roles)
              </Label>
              <Select 
                value={roleSelectionMode}
                onChange={(e, d) => handleRolePresetChange(d.value)}
              >
                <option value="TODOS">Todos los usuarios (Comunidad completa)</option>
                <option value="MIEMBRO">Solo Miembros</option>
                <option value="EMBAJADOR">Solo Embajadores</option>
                <option value="ORGANIZADOR">Solo Organizadores</option>
                <option value="ADMIN,ORGANIZADOR,EMBAJADOR,MODERADOR,SOPORTE">Todo el Staff y Embajadores</option>
                <option value="CUSTOM">Personalizado (Seleccionar roles)</option>
              </Select>

              {roleSelectionMode === 'CUSTOM' && (
                <div className={styles.roleCheckboxGroup}>
                  {ALL_ROLES.map(role => (
                    <Checkbox
                      key={role}
                      label={role}
                      checked={selectedCustomRoles.includes(role)}
                      onChange={() => handleToggleCustomRole(role)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Segmentación por Evento */}
            <div className={styles.rowTwo}>
              <div className={styles.fieldGroup}>
                <Label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CalendarLtr24Regular /> Vincular a Evento (Opcional)
                </Label>
                <Select 
                  value={formData.id_evento}
                  onChange={(e, d) => setFormData(prev => ({ 
                    ...prev, 
                    id_evento: d.value, 
                    solo_inscritos_evento: d.value ? prev.solo_inscritos_evento : false 
                  }))}
                >
                  <option value="">Ninguno (Anuncio Global)</option>
                  {eventos.map(ev => (
                    <option key={ev.id_evento} value={ev.id_evento}>
                      {ev.titulo}
                    </option>
                  ))}
                </Select>
              </div>

              <div className={styles.fieldGroup}>
                <Label>Link de Acción</Label>
                <Input 
                  contentBefore={<Link24Regular />}
                  placeholder="https://..." 
                  value={formData.link_accion}
                  onChange={(e, d) => setFormData({...formData, link_accion: d.value})}
                />
              </div>
            </div>

            {/* Checkbox solo inscritos si hay evento seleccionado */}
            {formData.id_evento && (
              <div style={{ backgroundColor: tokens.colorNeutralBackground2, padding: '12px 16px', borderRadius: '8px' }}>
                <Switch 
                  label="Solo inscritos al evento" 
                  checked={formData.solo_inscritos_evento}
                  onChange={(e, d) => setFormData({...formData, solo_inscritos_evento: d.checked})}
                />
                <MEHTypography variant="caption" style={{ opacity: 0.7, marginLeft: '40px', display: 'block' }}>
                  El anuncio solo será visible para los usuarios con inscripción activa a este evento.
                </MEHTypography>
              </div>
            )}

            {/* Multimedia */}
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

            <Divider />

            {/* Email dispatch */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '4px 0' }}>
              <Switch 
                label="Enviar notificación por Email" 
                checked={formData.enviar_email}
                onChange={(e, d) => setFormData({...formData, enviar_email: d.checked})}
              />
              <MEHTypography variant="caption" style={{ opacity: 0.65, marginLeft: '40px' }}>
                {getTargetAudienceDescription()}
              </MEHTypography>
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

        {/* Historial de Anuncios */}
        <MEHCard>
          <MEHTypography variant="h3" style={{ marginBottom: '20px', display: 'block' }}>Historial de Anuncios</MEHTypography>
          {loading ? <Spinner label="Cargando historial..." /> : (
            <div className={styles.tableWrapper}>
              <Table size="extra-small">
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>Fecha</TableHeaderCell>
                    <TableHeaderCell>Título</TableHeaderCell>
                    <TableHeaderCell>Categoría</TableHeaderCell>
                    <TableHeaderCell>Audiencia</TableHeaderCell>
                    <TableHeaderCell>Evento</TableHeaderCell>
                    <TableHeaderCell>Tipo</TableHeaderCell>
                    <TableHeaderCell>Activo</TableHeaderCell>
                    <TableHeaderCell>Acciones</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {anuncios.map(anuncio => (
                    <TableRow key={anuncio.id_anuncio}>
                      <TableCell>{new Date(anuncio.fecha_publicacion).toLocaleDateString()}</TableCell>
                      <TableCell style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <b>{anuncio.titulo}</b>
                      </TableCell>
                      <TableCell>
                        <Badge appearance="outline" size="small">
                          {anuncio.categoria || 'GENERAL'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge appearance="tint" color="brand" size="small">
                          {anuncio.roles_destino || 'TODOS'}
                        </Badge>
                      </TableCell>
                      <TableCell style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {anuncio.evento_titulo ? (
                          <Badge appearance="tint" color="informative" size="small">
                            {anuncio.evento_titulo}
                          </Badge>
                        ) : (
                          <span style={{ opacity: 0.4 }}>—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge appearance="tint" color={anuncio.tipo === 'ALERTA' ? 'danger' : 'brand'} size="small">
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

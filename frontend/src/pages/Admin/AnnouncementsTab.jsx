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
import { useTranslation } from 'react-i18next';
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
import comunidadService from '../../services/comunidadService';
import EmailDryRunModal from '../../components/EmailDryRunModal';
import { useNotify } from '../../App';

const useStyles = makeStyles({
// ... (rest of styles same)
  container: { display: 'flex', flexDirection: 'column', gap: '24px' },
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  grid: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginTop: '16px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', backgroundColor: tokens.colorNeutralBackground2, ...shorthands.borderRadius('16px'), ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3) },
  tableWrapper: { ...shorthands.borderRadius('16px'), ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3), backgroundColor: tokens.colorNeutralBackground1, overflowX: 'auto' },
  uploadBox: { ...shorthands.border('2px', 'dashed', tokens.colorBrandStroke1), ...shorthands.padding('16px'), ...shorthands.borderRadius('12px'), textAlign: 'center', cursor: 'pointer', backgroundColor: tokens.colorNeutralBackground1, transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', ':hover': { backgroundColor: tokens.colorBrandBackground2 } },
  previewImg: { width: '100%', maxHeight: '150px', objectFit: 'cover', ...shorthands.borderRadius('8px'), marginTop: '8px' }
});

const AnnouncementsTab = () => {
  const styles = useStyles();
  const { notify } = useNotify();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [eventosDisponibles, setEventosDisponibles] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dryRunLoading, setDryRunLoading] = useState(false);
  const [dryRunResult, setDryRunResult] = useState(null);

  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    url_imagen: '',
    link_accion: '',
    tipo: 'INFO',
    activo: true,
    enviar_email: false,
    exclusivo_embajadores: false,
    roles_destino: 'TODOS',
    id_evento: null,
    solo_inscritos_evento: false
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const [res, evRes] = await Promise.all([
        api.get('/comunidad/anuncios/all'),
        api.get('/eventos/').catch(() => ({ data: [] }))
      ]);
      setAnnouncements(res.data || []);
      setEventosDisponibles(evRes.data || []);
    } catch (err) {
      notify("Error", t("no_announcements_load_error"), "error");
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
      enviar_email: false,
      exclusivo_embajadores: false,
      roles_destino: 'TODOS',
      id_evento: null,
      solo_inscritos_evento: false
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
      enviar_email: false,
      exclusivo_embajadores: ann.exclusivo_embajadores || false,
      roles_destino: ann.roles_destino || 'TODOS',
      id_evento: ann.id_evento || null,
      solo_inscritos_evento: Boolean(ann.solo_inscritos_evento)
    });
    setCurrentId(ann.id_anuncio);
    setIsEditing(true);
  };

  const handleDryRunAnuncio = async () => {
    if (!formData.titulo.trim() || !formData.contenido.trim()) {
      notify("Validación", "Completa el título y contenido para simular el correo.", "warning");
      return;
    }
    setDryRunLoading(true);
    try {
      const res = await comunidadService.dryRunAnuncio({
        ...formData,
        id_evento: formData.id_evento ? Number(formData.id_evento) : null,
      });
      setDryRunResult(res);
    } catch (err) {
      notify("Error", "No se pudo simular el envío del anuncio.", "error");
    } finally {
      setDryRunLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("confirm_delete_announcement"))) return;
    try {
      await api.delete(`/comunidad/anuncios/${id}`);
      notify(t("deleted"), t("announcement_deleted_success"), "success");
      fetchAnnouncements();
    } catch (err) {
      notify("Error", t("announcement_delete_error"), "error");
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
      notify(t("success"), t("image_uploaded_success"), "success");
    } catch (err) {
      notify("Error", t("image_upload_error"), "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/comunidad/anuncios/${currentId}`, formData);
        notify(t("updated"), t("announcement_saved_success"), "success");
      } else {
        await api.post('/comunidad/anuncios', formData);
        notify(t("published"), t("announcement_created_success"), "success");
      }
      resetForm();
      fetchAnnouncements();
    } catch (err) {
      notify("Error", t("announcement_process_error"), "error");
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
          <MEHTypography variant="h2">{t("admin_announcements_management")}</MEHTypography>
        </div>
        <MEHButton appearance="subtle" icon={<Add24Regular />} onClick={resetForm}>{t("admin_new_announcement")}</MEHButton>
      </div>

      <div className={styles.grid}>
        <div className={styles.tableWrapper}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}><Spinner label={t("admin_loading_news")} /></div>
          ) : (
            <Table size="extra-small">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>{t("admin_status_col")}</TableHeaderCell>
                  <TableHeaderCell>{t("admin_title")}</TableHeaderCell>
                  <TableHeaderCell>{t("admin_type_col")}</TableHeaderCell>
                  <TableHeaderCell>{t("admin_date_col")}</TableHeaderCell>
                  <TableHeaderCell>{t("admin_actions_col")}</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.map(ann => (
                  <TableRow key={ann.id_anuncio}>
                    <TableCell>
                      <div style={{ display: 'flex', gap: '4px', flexDirection: 'column' }}>
                        <Badge color={ann.activo ? "success" : "neutral"} appearance="tint">
                          {ann.activo ? t("active") : t("hidden")}
                        </Badge>
                        {ann.exclusivo_embajadores && (
                          <Badge color="warning" appearance="tint">VIP</Badge>
                        )}
                      </div>
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
                   <TableRow><TableCell colSpan={5} style={{textAlign: 'center', padding: '20px'}}>{t("admin_no_announcements")}</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <MEHTypography variant="h3">{isEditing ? t("admin_edit_announcement") : t("admin_create_announcement")}</MEHTypography>
          
          <Field label={t("admin_announcement_title")} required>
            <Input value={formData.titulo} onChange={(e, d) => handleInputChange('titulo', d.value)} placeholder={t("admin_announcement_title_placeholder")} required />
          </Field>

          <Field label={t("admin_announcement_content")} required>
            <Textarea value={formData.contenido} onChange={(e, d) => handleInputChange('contenido', d.value)} placeholder={t("admin_announcement_content_placeholder")} rows={5} required />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label={t("admin_announcement_type")}>
              <Select value={formData.tipo} onChange={(e, d) => handleInputChange('tipo', d.value)}>
                <option value="INFO">{t("admin_info")}</option>
                <option value="EVENTO">{t("admin_upcoming_event")}</option>
                <option value="ALERTA">{t("admin_alert_critical")}</option>
              </Select>
            </Field>
            <Field label={t("admin_action_link")}>
              <Input value={formData.link_accion} onChange={(e, d) => handleInputChange('link_accion', d.value)} placeholder="https://..." />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Vincular a Evento (Cabecera en Correo)">
              <Select
                data-testid="anuncio-evento-select"
                value={formData.id_evento || ''}
                onChange={(e, d) =>
                  handleInputChange('id_evento', d.value ? Number(d.value) : null)
                }
              >
                <option value="">Sin evento vinculado</option>
                {eventosDisponibles.map((ev) => (
                  <option key={ev.id_evento} value={ev.id_evento}>
                    {ev.titulo}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Roles Destino">
              <Select
                value={formData.roles_destino || 'TODOS'}
                onChange={(e, d) => handleInputChange('roles_destino', d.value)}
              >
                <option value="TODOS">Todos los miembros</option>
                <option value="MIEMBRO">Solo Miembros</option>
                <option value="EMBAJADOR">Solo Embajadores</option>
                <option value="ORGANIZADOR">Solo Organizadores</option>
              </Select>
            </Field>
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Switch label={t("visible") || "Visible"} checked={formData.activo} onChange={(e, d) => handleInputChange('activo', d.checked)} />
            <Switch label="Exclusivo Embajadores" checked={formData.exclusivo_embajadores} onChange={(e, d) => handleInputChange('exclusivo_embajadores', d.checked)} />
            {formData.id_evento && (
              <Switch
                label="Solo inscritos al evento"
                checked={Boolean(formData.solo_inscritos_evento)}
                onChange={(e, d) => handleInputChange('solo_inscritos_evento', d.checked)}
              />
            )}
            {!isEditing && (
              <Field label={t("admin_notify_email") || "Notificar Email"}>
                <Switch checked={formData.enviar_email} onChange={(e, d) => handleInputChange('enviar_email', d.checked)} />
              </Field>
            )}
          </div>

          <div 
            className={styles.uploadBox} 
            role="button"
            tabIndex={0}
            aria-label={formData.url_imagen ? t("admin_change_image") : t("admin_upload_cover")}
            onClick={() => document.getElementById('ann-file')?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                document.getElementById('ann-file')?.click();
              }
            }}
          >
             {uploading ? <Spinner size="tiny" /> : (
               <>
                <Image24Regular aria-hidden="true" />
                <MEHTypography variant="caption">{formData.url_imagen ? t("admin_change_image") : t("admin_upload_cover")}</MEHTypography>
                <input 
                  id="ann-file" 
                  type="file" 
                  accept="image/*" 
                  aria-label={formData.url_imagen ? t("admin_change_image") : t("admin_upload_cover")}
                  style={{ display: 'none' }} 
                  onChange={handleFileUpload} 
                />
               </>
             )}
          </div>
          {formData.url_imagen && <img src={formData.url_imagen} className={styles.previewImg} alt="Vista previa de la imagen del anuncio" />}

          <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
            {!isEditing && (
              <MEHButton
                type="button"
                appearance="outline"
                data-testid="anuncio-dry-run-btn"
                disabled={dryRunLoading || !formData.titulo.trim() || !formData.contenido.trim()}
                onClick={() => {
                  void handleDryRunAnuncio();
                }}
              >
                {dryRunLoading ? "Simulando..." : "Simular Correo (Dry-Run)"}
              </MEHButton>
            )}
            <MEHButton type="submit" appearance="primary" style={{ flexGrow: 1 }} icon={isEditing ? <Save24Regular /> : <Send24Regular />}>
              {isEditing ? t("admin_save_changes") : t("admin_publish_now")}
            </MEHButton>
            <MEHButton appearance="subtle" icon={<Dismiss24Regular />} onClick={resetForm}>{t("cancel")}</MEHButton>
          </div>
        </form>
      </div>

      <EmailDryRunModal
        open={Boolean(dryRunResult)}
        onClose={() => setDryRunResult(null)}
        dryRunResult={dryRunResult}
      />
    </div>
  );
};

export default AnnouncementsTab;

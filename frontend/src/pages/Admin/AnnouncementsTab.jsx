import React, { useState, useEffect, useRef } from 'react';
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
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { MEHTypography, MEHButton, MEHCard } from '../../components/ui';
import api from '../../services/api';
import comunidadService from '../../services/comunidadService';
import EmailDryRunModal from '../../components/EmailDryRunModal';
import AnuncioPortadaUploader from '../../components/AnuncioPortadaUploader';
import { useNotify } from '../../App';

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'clean'],
  ],
};

const useStyles = makeStyles({
  container: { display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0, maxWidth: '100%', boxSizing: 'border-box' },
  toolbar: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    flexWrap: 'wrap', 
    gap: '12px',
    '@media (max-width: 600px)': {
      flexDirection: 'column',
      alignItems: 'stretch',
    }
  },
  grid: { 
    display: 'grid', 
    gridTemplateColumns: 'minmax(0, 1.15fr) minmax(360px, 1fr)', 
    gap: '24px', 
    marginTop: '16px',
    minWidth: 0,
    maxWidth: '100%',
    alignItems: 'start',
    '@media (max-width: 1080px)': {
      gridTemplateColumns: '1fr',
      gap: '24px',
    }
  },
  form: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '16px', 
    padding: '24px', 
    minWidth: 0,
    maxWidth: '100%',
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: tokens.colorNeutralBackground2, 
    ...shorthands.borderRadius('16px'), 
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3),
    boxShadow: tokens.shadow2,
    '@media (max-width: 600px)': {
      padding: '16px 12px',
    }
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px',
    width: '100%',
  },
  quillWrapper: { 
    width: '100%',
    boxSizing: 'border-box',
    '& .ql-toolbar': { 
      backgroundColor: tokens.colorNeutralBackground3, 
      ...shorthands.borderColor(tokens.colorNeutralStroke1), 
      ...shorthands.borderRadius('12px', '12px', '0', '0'),
      '& .ql-stroke': {
        stroke: tokens.colorNeutralForeground1,
      },
      '& .ql-fill': {
        fill: tokens.colorNeutralForeground1,
      },
      '& .ql-picker': {
        color: tokens.colorNeutralForeground1,
      },
      '& button:hover .ql-stroke, & .ql-picker:hover .ql-stroke': {
        stroke: tokens.colorBrandForeground1,
      },
      '& button:hover .ql-fill, & .ql-picker:hover .ql-fill': {
        fill: tokens.colorBrandForeground1,
      },
      '& button.ql-active .ql-stroke': {
        stroke: tokens.colorBrandForeground1,
      },
      '& button.ql-active .ql-fill': {
        fill: tokens.colorBrandForeground1,
      }
    }, 
    '& .ql-container': { 
      ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1), 
      ...shorthands.borderRadius('0', '0', '12px', '12px'), 
      minHeight: '170px', 
      backgroundColor: tokens.colorNeutralBackground1,
      color: tokens.colorNeutralForeground1,
      fontSize: '14px',
      fontFamily: 'inherit',
      '& .ql-editor': {
        minHeight: '140px',
        color: `${tokens.colorNeutralForeground1} !important`,
        lineHeight: '1.6',
        fontSize: '14px',
      },
      '& .ql-editor p, & .ql-editor span, & .ql-editor li, & .ql-editor strong, & .ql-editor em, & .ql-editor h1, & .ql-editor h2, & .ql-editor h3, & .ql-editor h4, & .ql-editor h5, & .ql-editor h6': {
        color: 'inherit !important',
        backgroundColor: 'transparent !important',
      },
      '& .ql-editor a, & .ql-editor a *': {
        color: '#a78bfa !important',
        textDecoration: 'underline',
      },
      '& .ql-editor.ql-blank::before': {
        color: `${tokens.colorNeutralForeground4} !important`,
        fontStyle: 'normal',
      }
    } 
  },
  tableWrapper: { 
    ...shorthands.borderRadius('16px'), 
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3), 
    backgroundColor: tokens.colorNeutralBackground1, 
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    minWidth: 0,
  },
  scheduleBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '14px 16px',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius('12px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
  },
  uploadBox: { ...shorthands.border('2px', 'dashed', tokens.colorBrandStroke1), ...shorthands.padding('16px'), ...shorthands.borderRadius('12px'), textAlign: 'center', cursor: 'pointer', backgroundColor: tokens.colorNeutralBackground1, transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', ':hover': { backgroundColor: tokens.colorBrandBackground2 } },
  previewImg: { width: '100%', maxHeight: '150px', objectFit: 'cover', ...shorthands.borderRadius('8px'), marginTop: '8px' }
});

const AnnouncementsTab = () => {
  const styles = useStyles();
  const formRef = useRef(null);
  const { notify } = useNotify();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [eventosDisponibles, setEventosDisponibles] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [dryRunLoading, setDryRunLoading] = useState(false);
  const [dryRunResult, setDryRunResult] = useState(null);

  const isContentEmpty = (html) => {
    if (!html) return true;
    const clean = html.replace(/<[^>]*>?/gm, '').trim();
    return clean.length === 0;
  };

  const cleanPastedHtml = (html) => {
    if (!html) return '';
    return html
      .replace(/color:\s*(rgb\(0,\s*0,\s*0\)|#000000|#000|black);?/gi, '')
      .replace(/background-color:\s*[^;"']*;?/gi, '')
      .replace(/style="\s*"/gi, '');
  };

  const formatForDateTimeLocal = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const getDefaultScheduledDate = () => {
    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
    d.setMinutes(0, 0, 0);
    return formatForDateTimeLocal(d);
  };

  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    url_imagen: '',
    link_accion: '',
    tipo: 'INFO',
    activo: true,
    enviar_email: true,
    email_ya_enviado: false,
    fecha_envio_email: null,
    exclusivo_embajadores: false,
    roles_destino: 'TODOS',
    id_evento: null,
    solo_inscritos_evento: false,
    programar_publicacion: false,
    fecha_publicacion: ''
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
      enviar_email: true,
      email_ya_enviado: false,
      fecha_envio_email: null,
      exclusivo_embajadores: false,
      roles_destino: 'TODOS',
      id_evento: null,
      solo_inscritos_evento: false,
      programar_publicacion: false,
      fecha_publicacion: ''
    });
    setIsEditing(false);
    setCurrentId(null);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleEdit = (ann) => {
    const isFuture = ann.fecha_publicacion && new Date(ann.fecha_publicacion) > new Date();
    setFormData({
      titulo: ann.titulo,
      contenido: ann.contenido,
      url_imagen: ann.url_imagen || '',
      link_accion: ann.link_accion || '',
      tipo: ann.tipo,
      activo: ann.activo,
      enviar_email: Boolean(ann.notificar_email && !ann.email_enviado),
      email_ya_enviado: Boolean(ann.email_enviado),
      fecha_envio_email: ann.fecha_envio_email || null,
      exclusivo_embajadores: ann.exclusivo_embajadores || false,
      roles_destino: ann.roles_destino || 'TODOS',
      id_evento: ann.id_evento || null,
      solo_inscritos_evento: Boolean(ann.solo_inscritos_evento),
      programar_publicacion: Boolean(isFuture),
      fecha_publicacion: ann.fecha_publicacion ? formatForDateTimeLocal(ann.fecha_publicacion) : ''
    });
    setCurrentId(ann.id_anuncio);
    setIsEditing(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleDryRunAnuncio = async () => {
    if (!formData.titulo.trim() || isContentEmpty(formData.contenido)) {
      notify("Validación", "Completa el título y contenido para simular el correo.", "warning");
      return;
    }
    setDryRunLoading(true);
    try {
      let fechaPubPayload = null;
      if (formData.programar_publicacion && formData.fecha_publicacion) {
        const parsedDate = new Date(formData.fecha_publicacion);
        if (!isNaN(parsedDate.getTime())) {
          fechaPubPayload = parsedDate.toISOString();
        }
      }

      const payload = {
        titulo: formData.titulo.trim(),
        contenido: cleanPastedHtml(formData.contenido),
        url_imagen: formData.url_imagen?.trim() || null,
        link_accion: formData.link_accion?.trim() || null,
        tipo: formData.tipo,
        activo: formData.activo,
        exclusivo_embajadores: formData.exclusivo_embajadores,
        roles_destino: formData.roles_destino,
        categoria: formData.categoria || 'GENERAL',
        id_evento: formData.id_evento ? Number(formData.id_evento) : null,
        solo_inscritos_evento: formData.solo_inscritos_evento,
        enviar_email: Boolean(formData.enviar_email),
        fecha_publicacion: fechaPubPayload,
      };

      const res = await comunidadService.dryRunAnuncio(payload);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titulo.trim() || isContentEmpty(formData.contenido)) {
      notify("Validación", "Completa el título y contenido del anuncio.", "warning");
      return;
    }

    let fechaPubPayload = undefined;
    if (formData.programar_publicacion) {
      if (!formData.fecha_publicacion) {
        notify("Validación", "Selecciona una fecha y hora para programar el anuncio.", "warning");
        return;
      }
      const parsedDate = new Date(formData.fecha_publicacion);
      if (isNaN(parsedDate.getTime())) {
        notify("Validación", "La fecha de publicación no es válida.", "warning");
        return;
      }
      fechaPubPayload = parsedDate.toISOString();
    } else if (isEditing) {
      // Si se desmarca programar, publicar de inmediato
      fechaPubPayload = new Date().toISOString();
    }

    try {
      const payload = {
        ...formData,
        contenido: cleanPastedHtml(formData.contenido),
        enviar_email: Boolean(formData.enviar_email),
        fecha_publicacion: fechaPubPayload,
      };
      delete payload.programar_publicacion;
      delete payload.email_ya_enviado;
      delete payload.fecha_envio_email;

      if (isEditing) {
        await api.put(`/comunidad/anuncios/${currentId}`, payload);
        notify(t("updated"), t("announcement_saved_success"), "success");
      } else {
        await api.post('/comunidad/anuncios', payload);
        const successMsg = formData.programar_publicacion 
          ? (formData.enviar_email 
              ? "Anuncio programado con envío automático de correo al salir." 
              : "Anuncio programado exitosamente.")
          : t("announcement_created_success");
        notify(formData.programar_publicacion ? t("admin_scheduled_badge") : t("published"), successMsg, "success");
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
                {announcements.map(ann => {
                  const isProgramado = ann.activo && new Date(ann.fecha_publicacion) > new Date();
                  const pubDate = new Date(ann.fecha_publicacion);
                  return (
                    <TableRow key={ann.id_anuncio}>
                      <TableCell>
                        <div style={{ display: 'flex', gap: '4px', flexDirection: 'column' }}>
                          {isProgramado ? (
                            <Badge color="informative" appearance="filled">
                              {t("admin_scheduled_badge")}
                            </Badge>
                          ) : (
                            <Badge color={ann.activo ? "success" : "neutral"} appearance="tint">
                              {ann.activo ? t("active") : t("hidden")}
                            </Badge>
                          )}
                          {ann.notificar_email && (
                            ann.email_enviado ? (
                              <Badge color="success" appearance="tint" size="small">✉️ Enviado</Badge>
                            ) : (
                              <Badge color="informative" appearance="tint" size="small">✉️ Email auto</Badge>
                            )
                          )}
                          {ann.exclusivo_embajadores && (
                            <Badge color="warning" appearance="tint">VIP</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell style={{ fontWeight: 'bold' }}>{ann.titulo}</TableCell>
                      <TableCell>
                        <Badge color={getBadgeColor(ann.tipo)} appearance="filled">{ann.tipo}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div style={{ fontWeight: isProgramado ? 600 : 400 }}>
                            {pubDate.toLocaleDateString()} {pubDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          {isProgramado && (
                            <MEHTypography variant="caption" style={{ color: tokens.colorBrandForeground1, display: 'block', fontSize: '11px' }}>
                              📅 Salida programada
                            </MEHTypography>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <MEHButton size="small" appearance="subtle" icon={<Edit24Regular />} onClick={() => handleEdit(ann)} />
                          <MEHButton size="small" appearance="subtle" icon={<Delete24Regular />} style={{ color: tokens.colorPaletteRedForeground1 }} onClick={() => handleDelete(ann.id_anuncio)} />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {announcements.length === 0 && (
                   <TableRow><TableCell colSpan={5} style={{textAlign: 'center', padding: '20px'}}>{t("admin_no_announcements")}</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        <form ref={formRef} className={styles.form} onSubmit={handleSubmit}>
          <MEHTypography variant="h3">{isEditing ? t("admin_edit_announcement") : t("admin_create_announcement")}</MEHTypography>
          
          <Field label={t("admin_announcement_title")} required>
            <Input value={formData.titulo} onChange={(e, d) => handleInputChange('titulo', d.value)} placeholder={t("admin_announcement_title_placeholder")} required />
          </Field>

          <Field label={t("admin_announcement_content")} required>
            <div className={styles.quillWrapper}>
              <ReactQuill
                theme="snow"
                value={formData.contenido}
                onChange={(val) => handleInputChange('contenido', val)}
                modules={quillModules}
                placeholder={t("admin_announcement_content_placeholder")}
              />
            </div>
          </Field>

          <div className={styles.formRow}>
            <Field label={t("admin_announcement_type")}>
              <Select value={formData.tipo} onChange={(e, d) => handleInputChange('tipo', d.value)} style={{ width: '100%' }}>
                <option value="INFO">{t("admin_info")}</option>
                <option value="EVENTO">{t("admin_upcoming_event")}</option>
                <option value="ALERTA">{t("admin_alert_critical")}</option>
              </Select>
            </Field>
            <Field label={t("admin_action_link")}>
              <Input value={formData.link_accion} onChange={(e, d) => handleInputChange('link_accion', d.value)} placeholder="https://..." />
            </Field>
          </div>

          <div className={styles.formRow}>
            <Field label="Vincular a Evento (Cabecera en Correo)">
              <Select
                data-testid="anuncio-evento-select"
                style={{ width: '100%' }}
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
                style={{ width: '100%' }}
                value={formData.roles_destino || 'TODOS'}
                onChange={(e, d) => handleInputChange('roles_destino', d.value)}
              >
                <option value="TODOS">Todos los miembros</option>
                <option value="MIEMBRO">Solo Miembros</option>
                <option value="SPEAKER">Solo Speakers</option>
                <option value="MENTOR">Solo Mentores</option>
                <option value="EMBAJADOR">Solo Embajadores</option>
                <option value="ORGANIZADOR">Solo Organizadores</option>
              </Select>
            </Field>
          </div>

          <div className={styles.scheduleBox}>
            <Switch 
              label={isEditing ? t("admin_reschedule_publication") : t("admin_schedule_publication")}
              checked={formData.programar_publicacion} 
              onChange={(e, d) => {
                handleInputChange('programar_publicacion', d.checked);
                if (d.checked && !formData.fecha_publicacion) {
                  handleInputChange('fecha_publicacion', getDefaultScheduledDate());
                }
              }} 
            />
            {formData.programar_publicacion && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                <Field 
                  label={t("admin_scheduled_datetime")} 
                  hint={t("admin_scheduled_hint")}
                >
                  <Input 
                    type="datetime-local" 
                    value={formData.fecha_publicacion} 
                    onChange={(e, d) => handleInputChange('fecha_publicacion', d.value)} 
                    style={{ width: '100%', maxWidth: '280px' }}
                  />
                </Field>
                {formData.email_ya_enviado ? (
                  <Badge color="success" appearance="tint" style={{ alignSelf: 'flex-start' }}>
                    ✅ Correo masivo ya enviado {formData.fecha_envio_email ? `el ${new Date(formData.fecha_envio_email).toLocaleString()}` : ''}
                  </Badge>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <Switch
                      label="Enviar correos en la fecha y hora de salida"
                      checked={formData.enviar_email}
                      onChange={(e, d) => handleInputChange('enviar_email', d.checked)}
                    />
                    <MEHTypography variant="caption" style={{ color: tokens.colorBrandForeground1 }}>
                      {formData.enviar_email 
                        ? "✉️ Los correos se enviarán automáticamente a los miembros seleccionados cuando llegue la fecha y hora programada."
                        : "ℹ️ El aviso saldrá automáticamente en el muro de la comunidad sin enviar correos masivos."}
                    </MEHTypography>
                  </div>
                )}
              </div>
            )}
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
            {!formData.programar_publicacion && (
              formData.email_ya_enviado ? (
                <Badge color="success" appearance="tint">
                  ✅ Correo ya enviado {formData.fecha_envio_email ? `el ${new Date(formData.fecha_envio_email).toLocaleString()}` : ''}
                </Badge>
              ) : (
                <Switch 
                  label={t("admin_notify_email") || "Notificar por Email de inmediato"}
                  checked={formData.enviar_email} 
                  onChange={(e, d) => handleInputChange('enviar_email', d.checked)} 
                />
              )
            )}
          </div>

          <AnuncioPortadaUploader
            value={formData.url_imagen}
            onChange={(newUrl) => handleInputChange('url_imagen', newUrl)}
            notify={notify}
          />

          <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
            <MEHButton
              type="button"
              appearance="outline"
              data-testid="anuncio-dry-run-btn"
              disabled={dryRunLoading || !formData.titulo.trim() || isContentEmpty(formData.contenido)}
              onClick={() => {
                void handleDryRunAnuncio();
              }}
            >
              {dryRunLoading ? "Simulando..." : "Simular Correo (Dry-Run)"}
            </MEHButton>
            <MEHButton type="submit" appearance="primary" style={{ flexGrow: 1 }} icon={isEditing ? <Save24Regular /> : <Send24Regular />}>
              {isEditing ? t("admin_save_changes") : (formData.programar_publicacion ? t("admin_schedule_announcement") : t("admin_publish_now"))}
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

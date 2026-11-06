import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  makeStyles,
  tokens,
  shorthands,
  TabList,
  Tab,
  Spinner,
  Avatar,
  Badge,
  Card,
  CardHeader,
  CardFooter,
  Caption1,
  Body1,
  Subtitle1,
  Link as FluentLink,
  Divider,
  Button,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Field,
  Input,
  Textarea,
  Select,
  Label,
  Tooltip
} from "@fluentui/react-components";
import {
  Mic24Regular,
  PeopleStar24Regular,
  PeopleTeam24Regular,
  Reward24Regular,
  PeopleCommunity24Regular,
  PeopleCommunity24Filled,
  Globe24Regular,
  Briefcase24Regular,
  ShareAndroid24Regular,
  Add24Regular,
  Edit24Regular,
  Delete24Regular,
  Save24Regular,
  Dismiss24Regular,
  Image24Regular,
  Mail24Regular,
  Phone24Regular
} from "@fluentui/react-icons";
import { MEHCard, MEHButton, MEHTypography } from "../../components/ui";
import adminService from "../../services/adminService";
import api, { resolveApiFileUrl } from "../../services/api";
import { useAuth, useNotify } from "../../App";
import { getValidationError } from "../../utils/validators";
import { designTokens } from "../../theme/theme";
import { uploadFile } from "../../utils/fileUpload";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "32px",
    animationName: {
      from: { opacity: 0, transform: "translateY(10px)" },
      to: { opacity: 1, transform: "translateY(0)" },
    },
    animationDuration: "0.5s",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    gap: "16px",
    flexWrap: "wrap",
    '@media (max-width: 680px)': {
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: '12px',
    }
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
    gap: "24px",
    marginTop: "20px",
    '@media (max-width: 600px)': {
      gridTemplateColumns: "1fr",
      gap: "16px",
    }
  },
  card: {
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius("24px"),
    ...shorthands.border("1px", "solid", tokens.colorNeutralBackground3),
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: tokens.shadow8,
    ':hover': {
      transform: "translateY(-12px)",
      boxShadow: `${tokens.shadow64}, 0 20px 40px rgba(0,0,0,0.3)`,
      ...shorthands.borderColor(tokens.colorBrandStroke1),
      '& .shine-effect': {
          left: '100%',
      }
    }
  },
  shineEffect: {
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)',
    transform: 'skewX(-25deg)',
    transition: 'left 0.75s ease-in-out',
    zIndex: 10,
    pointerEvents: 'none'
  },
  cardBody: {
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      flexGrow: 1
  },
  bio: {
    color: tokens.colorNeutralForeground2,
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    fontSize: "14px",
    lineHeight: "1.6",
    fontStyle: 'italic',
    opacity: 0.9
  },
  logo: {
    width: "100%",
    height: "160px",
    objectFit: "contain",
    backgroundColor: "white",
    padding: "24px",
    borderBottom: `1px solid ${tokens.colorNeutralBackground3}`
  },
  speakerPhoto: {
    width: '100%',
    height: '240px',
    objectFit: 'cover',
    backgroundColor: tokens.colorNeutralBackground3,
    borderBottom: `1px solid ${tokens.colorNeutralBackground3}`
  },
  socialButtons: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center'
  },
  contactBadges: {
      display: 'flex',
      gap: '8px',
      marginTop: '4px',
      flexWrap: 'wrap'
  },
  footerActions: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginTop: 'auto',
      padding: '16px 20px',
      borderTop: `1px solid ${tokens.colorNeutralBackground3}`,
      backgroundColor: tokens.colorNeutralBackground2
  },
  actionChip: {
      ...shorthands.borderRadius('12px'),
      ...shorthands.padding('4px', '12px'),
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '12px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: '1px solid transparent',
      ':hover': {
          transform: 'scale(1.05)',
          boxShadow: tokens.shadow4
      }
  },
  emailChip: {
      backgroundColor: tokens.colorBrandBackground2,
      color: tokens.colorBrandForeground2,
      ':hover': { backgroundColor: tokens.colorBrandBackground }
  },
  whatsappChip: {
      backgroundColor: 'rgba(37, 211, 102, 0.1)',
      color: '#25D366',
      ':hover': { backgroundColor: 'rgba(37, 211, 102, 0.2)' }
  },
  uploadAction: {
    ...shorthands.border("2px", "dashed", tokens.colorBrandStroke1),
    ...shorthands.padding("12px"),
    ...shorthands.borderRadius("12px"),
    textAlign: "center",
    cursor: "pointer",
    backgroundColor: tokens.colorNeutralBackground2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: tokens.colorBrandBackground2,
      ...shorthands.borderColor(tokens.colorBrandBackground)
    }
  },
  previewContainer: {
    width: "120px",
    height: "120px",
    ...shorthands.borderRadius("16px"),
    ...shorthands.border("2px", "solid", tokens.colorNeutralBackground3),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: tokens.colorNeutralBackground2,
    marginTop: "8px",
    boxShadow: tokens.shadow4,
  },
  previewImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
  },
  dialogSurface: {
    ...shorthands.border('2px', 'solid', tokens.colorBrandStroke1),
    boxShadow: '0 0 0 100vmax rgba(0, 0, 0, 0.7), 0 32px 64px rgba(0, 0, 0, 0.8)',
    backgroundColor: tokens.colorNeutralBackground1,
    minWidth: '550px',
    ...shorthands.borderRadius('24px'),
    [designTokens.breakpoints.sm]: {
      minWidth: '95%',
    }
  }
});

const EcosystemDirectory = () => {
  const styles = useStyles();
  const { t } = useTranslation();
  const { notify } = useNotify();
  const [selectedTab, setSelectedTab] = useState("speakers");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);

  // Estados para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [voluntarioModal, setVoluntarioModal] = useState({ open: false, id_usuario: null, loading: false });
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [formData, setFormData] = useState({
    id_usuario: null,
    nombre: "", bio: "", trayectoria: "", foto_url: "", logo_url: "",
    trabajo_actual: "", area_mentoria: "", linkedin_url: "", twitter_url: "", 
    facebook_url: "", instagram_url: "", sitio_web: "",
    tipo: "GENERAL", descripcion: "", link_contacto: "",
    correo_contacto: "", whatsapp_contacto: ""
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await api.get('/usuarios/?skip=0&limit=500');
        setRegisteredUsers(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.warn('No se pudo cargar la lista de usuarios para vinculación:', err);
      }
    };
    loadUsers();
  }, []);

  const fetchData = async () => {
    setData([]);
    setLoading(true);
    try {
      const response = await api.get(`/admin-directories/${selectedTab}`);
      setData(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      notify("Error", t("admin_no_data"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedTab]);

  const resetForm = () => {
    setFormData({
      id_usuario: null,
      nombre: "", bio: "", trayectoria: "", foto_url: "", logo_url: "",
      trabajo_actual: "", area_mentoria: "", linkedin_url: "", twitter_url: "", 
      facebook_url: "", instagram_url: "", sitio_web: "",
      tipo: "GENERAL", descripcion: "", link_contacto: "",
      correo_contacto: "", whatsapp_contacto: ""
    });
    setPreviewUrl(null);
    setErrors({});
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleUserSelect = (userId) => {
    if (!userId) {
      setFormData(prev => ({ ...prev, id_usuario: null }));
      return;
    }
    const numId = Number(userId);
    const u = registeredUsers.find(x => x.id_usuario === numId);
    if (u) {
      const fullName = `${u.nombres || ''} ${u.apellidos || ''}`.trim() || u.alias || '';
      setFormData(prev => ({
        ...prev,
        id_usuario: u.id_usuario,
        nombre: fullName || prev.nombre,
        correo_contacto: u.correo || prev.correo_contacto,
        foto_url: u.foto_url || prev.foto_url,
        bio: u.bio || prev.bio,
        trabajo_actual: u.institucion || u.estudia_en || prev.trabajo_actual,
        linkedin_url: u.linkedin_url || prev.linkedin_url,
      }));
      if (u.foto_url) {
        setPreviewUrl(resolveApiFileUrl(u.foto_url));
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field.endsWith("_url") || field.endsWith("_web") || field.endsWith("_contacto")) {
      const error = getValidationError(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
    if (field === 'correo_contacto' && value) {
        const emailError = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? t("admin_email_placeholder") : null;
        setErrors(prev => ({ ...prev, correo_contacto: emailError }));
    }
  };

  const handleAdd = () => {
    if (selectedTab === 'voluntarios') {
      const firstAvailable = registeredUsers[0]?.id_usuario || null;
      setVoluntarioModal({ open: true, id_usuario: firstAvailable, loading: false });
      return;
    }
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    const normalizedItem = { ...item };
    Object.keys(formData).forEach(key => {
        normalizedItem[key] = item[key] ?? "";
    });
    normalizedItem.id_usuario = item.id_usuario || null;
    setFormData(normalizedItem);
    setIsEditing(true);
    const photo = normalizedItem.foto_url || normalizedItem.logo_url;
    if (photo) setPreviewUrl(resolveApiFileUrl(photo));
    setCurrentId(normalizedItem.id_speaker || normalizedItem.id_mentor || normalizedItem.id_auspiciador || normalizedItem.id_comunidad);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("confirm_delete_announcement"))) return; 
    try {
      await api.delete(`/admin-directories/${selectedTab}/${id}`);
      notify(t("deleted"), t("announcement_deleted_success"), "success");
      fetchData();
    } catch (err) {
      notify("Error", t("announcement_delete_error"), "error");
    }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadFile(file);
      setFormData((prev) => ({ ...prev, [field]: res.url }));
      setPreviewUrl(`${resolveApiFileUrl(res.url)}?t=${new Date().getTime()}`);
      notify(t("success"), t("image_uploaded_success"), "success");
    } catch (err) {
      console.error("Error al subir archivo:", err);
      const msg = err.status === 413 || err.response?.status === 413
        ? "La imagen es demasiado pesada para el servidor (HTTP 413). Por favor sube una imagen menor a 1MB o comprímela."
        : (err.response?.data?.detail || err.message || t("image_upload_error"));
      notify("Error", msg, "error");
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.values(errors).some((e) => e !== null)) {
      notify(t("admin_info"), t("admin_announcement_content_placeholder"), "warning");
      return;
    }
    setSubmitting(true);
    try {
      if (isEditing) {
        await api.put(`/admin-directories/${selectedTab}/${currentId}`, formData);
        notify(t("updated"), t("announcement_saved_success"), "success");
      } else {
        await api.post(`/admin-directories/${selectedTab}`, formData);
        notify(t("success"), t("announcement_created_success"), "success");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      notify("Error", t("announcement_process_error"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const getFriendlyName = () => {
    const names = {
        'speakers': t("speaker"),
        'mentores': t("mentor") || "Mentor",
        'auspiciadores': t("sponsor"),
        'comunidades': t("allied_community")
    };
    return names[selectedTab] || t("entry");
  };

  const getImageUrl = (url) => {
      if (!url) return null;
      return `${resolveApiFileUrl(url)}?t=${new Date().getTime()}`;
  };

  const openWhatsApp = (num) => {
      if (!num) return;
      const cleanNum = num.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanNum}`, '_blank');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <PeopleCommunity24Filled
            style={{ color: tokens.colorBrandForeground1, fontSize: "42px" }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <MEHTypography variant="h1">{t("admin_ecosystem_alliances")}</MEHTypography>
            <MEHTypography variant="body" style={{ opacity: 0.7 }}>
              {t("admin_ecosystem_desc")}
            </MEHTypography>
          </div>
        </div>
        <MEHButton appearance="primary" size="large" icon={<Add24Regular />} onClick={handleAdd}>
          {t("admin_add_new")}
        </MEHButton>
      </div>

      <div style={{ overflowX: 'auto', maxWidth: '100%', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', paddingBottom: '4px' }}>
        <TabList
          selectedValue={selectedTab}
          onTabSelect={(e, d) => setSelectedTab(d.value)}
          style={{ whiteSpace: 'nowrap' }}
        >
          <Tab value="speakers" icon={<Mic24Regular />}>{t("speakers")}</Tab>
          <Tab value="mentores" icon={<PeopleStar24Regular />}>{t("mentors") || "Mentores"}</Tab>
          <Tab value="voluntarios" icon={<PeopleTeam24Regular />}>{t("volunteers") || "Voluntarios"}</Tab>
          <Tab value="auspiciadores" icon={<Reward24Regular />}>{t("sponsors")}</Tab>
          <Tab value="comunidades" icon={<PeopleCommunity24Regular />}>{t("allied_communities")}</Tab>
        </TabList>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
          <Spinner label={t("admin_syncing_network")} />
        </div>
      ) : (
        <div className={styles.grid}>
          {selectedTab === "speakers" &&
            data.map((s, index) => (
              <div key={`spk-${s.id_speaker || index}`} className={styles.card}>
                <div className="shine-effect" />
                <img
                  src={getImageUrl(s.foto_url)}
                  alt={s.nombre}
                  className={styles.speakerPhoto}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/400x240?text=Sin+Foto'; }}
                />
                
                <div className={styles.cardBody}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '6px' }}>
                    <Subtitle1 style={{ fontWeight: "bold", fontSize: '18px' }}>{s.nombre}</Subtitle1>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {s.id_usuario && <Badge color="informative" appearance="tint" size="small">Vinculado</Badge>}
                      <Badge color="brand" appearance="tint">{t("speaker")}</Badge>
                    </div>
                  </div>
                  
                  <Caption1 style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.8 }}>
                    <Briefcase24Regular style={{ fontSize: "14px" }} /> {s.trabajo_actual || t("community_leader")}
                  </Caption1>

                  <Body1 className={styles.bio}>{s.bio || t("admin_no_bio_available")}</Body1>
                  
                  <div className={styles.contactBadges}>
                      {s.correo_contacto && (
                          <Tooltip content={t("admin_send_email")} relationship="label">
                            <div className={`${styles.actionChip} ${styles.emailChip}`} onClick={() => window.location.href=`mailto:${s.correo_contacto}`}>
                                <Mail24Regular style={{fontSize: '16px'}} /> {t("email")}
                            </div>
                          </Tooltip>
                      )}
                      {s.whatsapp_contacto && (
                          <Tooltip content={t("admin_direct_chat")} relationship="label">
                            <div className={`${styles.actionChip} ${styles.whatsappChip}`} onClick={() => openWhatsApp(s.whatsapp_contacto)}>
                                <Phone24Regular style={{fontSize: '16px'}} /> {t("whatsapp")}
                            </div>
                          </Tooltip>
                      )}
                  </div>

                  <Divider style={{ marginTop: "4px" }} />
                  <MEHTypography variant="caption" style={{ opacity: 0.7 }}>
                    <strong>{t("admin_career")}</strong> {s.trayectoria || t("not_specified")}
                  </MEHTypography>
                </div>

                <div className={styles.footerActions}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Button icon={<Edit24Regular />} appearance="subtle" size="small" onClick={() => handleEdit(s)}>{t("edit")}</Button>
                        <Button icon={<Delete24Regular />} appearance="subtle" size="small" style={{ color: tokens.colorPaletteRedForeground1 }} onClick={() => handleDelete(s.id_speaker)} />
                    </div>
                    <div className={styles.socialButtons}>
                        {s.linkedin_url && <MEHButton size="small" style={{minWidth: '32px'}} onClick={() => window.open(s.linkedin_url, "_blank")}>In</MEHButton>}
                        {s.facebook_url && <MEHButton size="small" style={{minWidth: '32px'}} onClick={() => window.open(s.facebook_url, "_blank")}>Fb</MEHButton>}
                        {s.instagram_url && <MEHButton size="small" style={{minWidth: '32px'}} onClick={() => window.open(s.instagram_url, "_blank")}>Ig</MEHButton>}
                    </div>
                </div>
              </div>
            ))}

          {selectedTab === "mentores" &&
            data.map((m, index) => (
              <div key={`mentor-${m.id_mentor || index}`} className={styles.card}>
                <div className="shine-effect" />
                <img
                  src={getImageUrl(m.foto_url)}
                  alt={m.nombre}
                  className={styles.speakerPhoto}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/400x240?text=Sin+Foto'; }}
                />
                
                <div className={styles.cardBody}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '6px' }}>
                    <Subtitle1 style={{ fontWeight: "bold", fontSize: '18px' }}>{m.nombre}</Subtitle1>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {m.id_usuario && <Badge color="informative" appearance="tint" size="small">Vinculado</Badge>}
                      <Badge color="success" appearance="tint">{t("mentor") || "Mentor"}</Badge>
                    </div>
                  </div>
                  
                  {m.area_mentoria && (
                    <Badge color="informative" appearance="filled" size="small" style={{ alignSelf: 'flex-start' }}>
                      🎓 {m.area_mentoria}
                    </Badge>
                  )}

                  <Caption1 style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.8 }}>
                    <Briefcase24Regular style={{ fontSize: "14px" }} /> {m.trabajo_actual || "Mentor de Comunidad"}
                  </Caption1>

                  <Body1 className={styles.bio}>{m.bio || t("admin_no_bio_available")}</Body1>
                  
                  <div className={styles.contactBadges}>
                      {m.correo_contacto && (
                          <Tooltip content={t("admin_send_email")} relationship="label">
                            <div className={`${styles.actionChip} ${styles.emailChip}`} onClick={() => window.location.href=`mailto:${m.correo_contacto}`}>
                                <Mail24Regular style={{fontSize: '16px'}} /> {t("email")}
                            </div>
                          </Tooltip>
                      )}
                      {m.whatsapp_contacto && (
                          <Tooltip content={t("admin_direct_chat")} relationship="label">
                            <div className={`${styles.actionChip} ${styles.whatsappChip}`} onClick={() => openWhatsApp(m.whatsapp_contacto)}>
                                <Phone24Regular style={{fontSize: '16px'}} /> {t("whatsapp")}
                            </div>
                          </Tooltip>
                      )}
                  </div>

                  <Divider style={{ marginTop: "4px" }} />
                  <MEHTypography variant="caption" style={{ opacity: 0.7 }}>
                    <strong>{t("admin_career")}</strong> {m.trayectoria || t("not_specified")}
                  </MEHTypography>
                </div>

                <div className={styles.footerActions}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Button icon={<Edit24Regular />} appearance="subtle" size="small" onClick={() => handleEdit(m)}>{t("edit")}</Button>
                        <Button icon={<Delete24Regular />} appearance="subtle" size="small" style={{ color: tokens.colorPaletteRedForeground1 }} onClick={() => handleDelete(m.id_mentor)} />
                    </div>
                    <div className={styles.socialButtons}>
                        {m.linkedin_url && <MEHButton size="small" style={{minWidth: '32px'}} onClick={() => window.open(m.linkedin_url, "_blank")}>In</MEHButton>}
                        {m.facebook_url && <MEHButton size="small" style={{minWidth: '32px'}} onClick={() => window.open(m.facebook_url, "_blank")}>Fb</MEHButton>}
                        {m.instagram_url && <MEHButton size="small" style={{minWidth: '32px'}} onClick={() => window.open(m.instagram_url, "_blank")}>Ig</MEHButton>}
                    </div>
                </div>
              </div>
            ))}

          {selectedTab === "voluntarios" &&
            data.map((v, index) => (
              <div key={`vol-${v.id_usuario || index}`} className={styles.card}>
                <div className="shine-effect" />
                <img
                  src={getImageUrl(v.foto_url)}
                  alt={v.nombre_completo}
                  className={styles.avatar}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Voluntario+MEH'; }}
                />
                
                <div className={styles.cardBody}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '6px' }}>
                    <Subtitle1 style={{ fontWeight: "bold", fontSize: '18px' }}>{v.nombre_completo}</Subtitle1>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      <Badge color="informative" appearance="filled">🤝 Voluntario</Badge>
                      {v.es_speaker && <Badge color="warning" appearance="tint">🎤 También Speaker</Badge>}
                      {v.es_mentor && <Badge color="success" appearance="tint">💡 También Mentor</Badge>}
                    </div>
                  </div>

                  <Caption1 style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.8 }}>
                    <Briefcase24Regular style={{ fontSize: "14px" }} /> {v.institucion || "Staff Voluntario MEH"}
                  </Caption1>

                  <Body1 className={styles.bio}>
                    Miembro del equipo voluntario de apoyo logístico y operativo para conferencias, talleres y dinámicas de la comunidad.
                  </Body1>

                  {v.correo && (
                    <div className={styles.contactBadges}>
                      <Tooltip content={t("admin_send_email")} relationship="label">
                        <div className={`${styles.actionChip} ${styles.emailChip}`} onClick={() => window.location.href=`mailto:${v.correo}`}>
                          <Mail24Regular style={{fontSize: '16px'}} /> {v.correo}
                        </div>
                      </Tooltip>
                    </div>
                  )}
                </div>

                <div className={styles.footerActions}>
                  <Button 
                    icon={<Delete24Regular />} 
                    appearance="subtle" 
                    size="small" 
                    style={{ color: tokens.colorPaletteRedForeground1 }} 
                    onClick={async () => {
                      if (!window.confirm(`¿Quitar la designación de voluntario a ${v.nombre_completo}?`)) return;
                      try {
                        await adminService.removerVoluntario(v.id_usuario);
                        notify("Éxito", "Designación de voluntario removida", "success");
                        fetchData();
                      } catch (err) {
                        notify("Error", "No se pudo remover el rol de voluntario", "error");
                      }
                    }}
                  >
                    Quitar Voluntario
                  </Button>
                </div>
              </div>
            ))}

          {selectedTab === "auspiciadores" &&
            data.map((a, index) => (
              <div key={`ausp-${a.id_auspiciador || index}`} className={styles.card}>
                <div className="shine-effect" />
                <img
                  src={getImageUrl(a.logo_url)}
                  alt={a.nombre}
                  className={styles.logo}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/400x160?text=Sin+Logo'; }}
                />
                
                <div className={styles.cardBody}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Subtitle1 style={{ fontWeight: "bold", fontSize: '18px' }}>{a.nombre}</Subtitle1>
                        <Badge appearance="filled" color={a.tipo === "GOLD" ? "brand" : "neutral"}>{a.tipo}</Badge>
                    </div>

                    <div className={styles.contactBadges}>
                        {a.correo_contacto && (
                            <div className={`${styles.actionChip} ${styles.emailChip}`} onClick={() => window.location.href=`mailto:${a.correo_contacto}`}>
                                <Mail24Regular style={{fontSize: '16px'}} /> {t("contact")}
                            </div>
                        )}
                        {a.whatsapp_contacto && (
                            <div className={`${styles.actionChip} ${styles.whatsappChip}`} onClick={() => openWhatsApp(a.whatsapp_contacto)}>
                                <Phone24Regular style={{fontSize: '16px'}} /> {t("whatsapp")}
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.footerActions}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Button icon={<Edit24Regular />} appearance="subtle" size="small" onClick={() => handleEdit(a)} />
                        <Button icon={<Delete24Regular />} appearance="subtle" size="small" style={{ color: tokens.colorPaletteRedForeground1 }} onClick={() => handleDelete(a.id_auspiciador)} />
                    </div>
                    <MEHButton size="small" icon={<Globe24Regular />} onClick={() => window.open(a.sitio_web, '_blank')}>
                        {t("admin_website")}
                    </MEHButton>
                </div>
              </div>
            ))}

          {selectedTab === "comunidades" &&
            data.map((c, index) => (
              <div key={`comu-${c.id_comunidad || index}`} className={styles.card}>
                <div className="shine-effect" />
                <img
                  src={getImageUrl(c.logo_url)}
                  alt={c.nombre}
                  className={styles.logo}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/400x160?text=Sin+Imagen'; }}
                />
                <div className={styles.cardBody}>
                  <Subtitle1 style={{ fontWeight: "bold", fontSize: '18px' }}>{c.nombre}</Subtitle1>
                  <Body1 className={styles.bio}>{c.descripcion}</Body1>
                  
                  <div className={styles.contactBadges}>
                        {c.correo_contacto && (
                            <div className={`${styles.actionChip} ${styles.emailChip}`} onClick={() => window.location.href=`mailto:${c.correo_contacto}`}>
                                <Mail24Regular style={{fontSize: '16px'}} /> {t("email")}
                            </div>
                        )}
                        {c.whatsapp_contacto && (
                            <div className={`${styles.actionChip} ${styles.whatsappChip}`} onClick={() => openWhatsApp(c.whatsapp_contacto)}>
                                <Phone24Regular style={{fontSize: '16px'}} /> {t("whatsapp")}
                            </div>
                        )}
                    </div>
                </div>
                
                <div className={styles.footerActions}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Button icon={<Edit24Regular />} appearance="subtle" size="small" onClick={() => handleEdit(c)} />
                        <Button icon={<Delete24Regular />} appearance="subtle" size="small" style={{ color: tokens.colorPaletteRedForeground1 }} onClick={() => handleDelete(c.id_comunidad)} />
                    </div>
                    <MEHButton size="small" icon={<ShareAndroid24Regular />} onClick={() => window.open(c.link_contacto, '_blank')}>
                        {t("admin_contact_link")}
                    </MEHButton>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* MODAL DE GESTIÓN (FORMULARIO DINÁMICO) */}
      <Dialog open={isModalOpen} onOpenChange={(e, d) => setIsModalOpen(d.open)}>
        <DialogSurface className={styles.dialogSurface}>
          <form onSubmit={handleSubmit}>
            <DialogBody>
              <DialogTitle>
                {isEditing ? t("admin_edit_entry", { name: getFriendlyName() }) : t("admin_new_entry", { name: getFriendlyName() })}
              </DialogTitle>
              <DialogContent className={styles.form}>
                {(selectedTab === "speakers" || selectedTab === "mentores") && (
                  <Field
                    label="Vincular a Usuario Registrado en la Plataforma"
                    hint="Selecciona una cuenta registrada para autocompletar nombre, correo, foto y vincular su perfil oficial"
                  >
                    <Select
                      value={formData.id_usuario || ""}
                      onChange={(e, d) => handleUserSelect(d.value)}
                      style={{ width: "100%" }}
                    >
                      <option value="">-- Ingreso manual / Sin vincular --</option>
                      {registeredUsers.map((u) => (
                        <option key={u.id_usuario} value={u.id_usuario}>
                          {u.nombres} {u.apellidos} ({u.correo}) — Rol: {u.rol}
                        </option>
                      ))}
                    </Select>
                  </Field>
                )}

                <Field label={t("admin_name_business_name")} required>
                  <Input value={formData.nombre} onChange={(e, d) => handleInputChange("nombre", d.value)} required />
                </Field>

                {selectedTab === "mentores" && (
                  <Field label={t("admin_mentorship_area") || "Área de Mentoría / Especialidad"}>
                    <Input
                      value={formData.area_mentoria}
                      onChange={(e, d) => handleInputChange("area_mentoria", d.value)}
                      placeholder="Ej: Cloud Azure, Inteligencia Artificial, Backend, Carrera Tech"
                    />
                  </Field>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <Field label={t("admin_contact_email")} validationState={errors.correo_contacto ? "error" : "none"} validationMessage={errors.correo_contacto}>
                        <Input type="email" value={formData.correo_contacto} onChange={(e, d) => handleInputChange("correo_contacto", d.value)} placeholder={t("admin_email_placeholder")} />
                    </Field>
                    <Field label={`${t("whatsapp")} (${t("admin_whatsapp_placeholder")})`}>
                        <Input value={formData.whatsapp_contacto} onChange={(e, d) => handleInputChange("whatsapp_contacto", d.value)} placeholder={t("admin_whatsapp_placeholder")} />
                    </Field>
                </div>

                {(selectedTab === "speakers" || selectedTab === "mentores") && (
                  <>
                    <Field label={t("admin_professional_bio")}>
                      <Textarea value={formData.bio} onChange={(e, d) => handleInputChange("bio", d.value)} rows={3} />
                    </Field>
                    <Field label={t("admin_career_summary")}>
                        <Input value={formData.trayectoria} onChange={(e, d) => handleInputChange("trayectoria", d.value)} placeholder={t("admin_career_placeholder")} />
                    </Field>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <Field label={t("admin_current_job")}>
                        <Input value={formData.trabajo_actual} onChange={(e, d) => handleInputChange("trabajo_actual", d.value)} />
                      </Field>
                      <Field label="LinkedIn URL" validationState={errors.linkedin_url ? "error" : "none"} validationMessage={errors.linkedin_url}>
                        <Input value={formData.linkedin_url} onChange={(e, d) => handleInputChange("linkedin_url", d.value)} placeholder={t("admin_url_placeholder")} />
                      </Field>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <Field label="Facebook URL" validationState={errors.facebook_url ? "error" : "none"} validationMessage={errors.facebook_url}>
                        <Input value={formData.facebook_url} onChange={(e, d) => handleInputChange("facebook_url", d.value)} placeholder={t("admin_url_placeholder")} />
                      </Field>
                      <Field label="Instagram URL" validationState={errors.instagram_url ? "error" : "none"} validationMessage={errors.instagram_url}>
                        <Input value={formData.instagram_url} onChange={(e, d) => handleInputChange("instagram_url", d.value)} placeholder={t("admin_url_placeholder")} />
                      </Field>
                    </div>
                      <div className={styles.fieldGroup}>
                      <Label>{selectedTab === "mentores" ? "Foto del Mentor" : t("admin_speaker_photo")}</Label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '8px' }}>
                          <div 
                            className={styles.uploadAction} 
                            style={{ flexGrow: 1 }} 
                            role="button"
                            tabIndex={0}
                            aria-label={formData.foto_url ? t("admin_change_photo") : t("admin_upload_photo")}
                            onClick={() => document.getElementById("ecosys-file-speaker")?.click()}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                document.getElementById("ecosys-file-speaker")?.click();
                              }
                            }}
                          >
                            {uploading ? <Spinner size="tiny" /> : (
                              <>
                                <Image24Regular aria-hidden="true" />
                                <MEHTypography variant="caption">{formData.foto_url ? t("admin_change_photo") : t("admin_upload_photo")}</MEHTypography>
                                <input 
                                  id="ecosys-file-speaker" 
                                  type="file" 
                                  accept="image/*" 
                                  aria-label={formData.foto_url ? t("admin_change_photo") : t("admin_upload_photo")}
                                  onChange={(e) => handleFileUpload(e, "foto_url")} 
                                  style={{ display: "none" }} 
                                />
                              </>
                            )}
                          </div>
                          {previewUrl && (
                            <div className={styles.previewContainer}>
                              <img src={previewUrl} className={styles.previewImage} alt={`Vista previa de foto de ${formData.nombre || 'expositor/mentor'}`} />
                            </div>
                          )}
                      </div>
                    </div>
                  </>
                )}

                {selectedTab === "auspiciadores" && (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <Field label={t("admin_website")} validationState={errors.sitio_web ? "error" : "none"} validationMessage={errors.sitio_web}>
                        <Input value={formData.sitio_web} onChange={(e, d) => handleInputChange("sitio_web", d.value)} placeholder={t("admin_url_placeholder")} />
                      </Field>
                      <Field label={t("admin_tier_type")}>
                        <Select value={formData.tipo} onChange={(e, d) => handleInputChange("tipo", d.value)}>
                          <option value="GOLD">GOLD</option>
                          <option value="SILVER">SILVER</option>
                          <option value="BRONZE">BRONZE</option>
                          <option value="GENERAL">GENERAL</option>
                        </Select>
                      </Field>
                    </div>
                    <div className={styles.fieldGroup}>
                      <Label>{t("admin_brand_logo")}</Label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '8px' }}>
                          <div 
                            className={styles.uploadAction} 
                            style={{ flexGrow: 1 }} 
                            role="button"
                            tabIndex={0}
                            aria-label={t("admin_upload_logo")}
                            onClick={() => document.getElementById("ecosys-file-sponsor")?.click()}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                document.getElementById("ecosys-file-sponsor")?.click();
                              }
                            }}
                          >
                            {uploading ? <Spinner size="tiny" /> : (
                              <>
                                <Image24Regular aria-hidden="true" />
                                <MEHTypography variant="caption">{t("admin_upload_logo")}</MEHTypography>
                                <input 
                                  id="ecosys-file-sponsor" 
                                  type="file" 
                                  accept="image/*" 
                                  aria-label={t("admin_upload_logo")}
                                  onChange={(e) => handleFileUpload(e, "logo_url")} 
                                  style={{ display: "none" }} 
                                />
                              </>
                            )}
                          </div>
                          {previewUrl && (
                            <div className={styles.previewContainer}>
                              <img src={previewUrl} className={styles.previewImage} style={{ objectFit: 'contain', padding: '10px' }} alt={`Vista previa del logotipo de ${formData.nombre || 'auspiciador'}`} />
                            </div>
                          )}
                      </div>
                    </div>
                  </>
                )}

                {selectedTab === "comunidades" && (
                  <>
                    <Field label={t("admin_description")}>
                      <Textarea value={formData.descripcion} onChange={(e, d) => handleInputChange("descripcion", d.value)} rows={3} />
                    </Field>
                    <Field label={t("admin_contact_link")} validationState={errors.link_contacto ? "error" : "none"} validationMessage={errors.link_contacto}>
                        <Input value={formData.link_contacto} onChange={(e, d) => handleInputChange("link_contacto", d.value)} placeholder={t("admin_url_placeholder")} />
                    </Field>
                    <div className={styles.fieldGroup}>
                      <Label>{t("admin_community_logo")}</Label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '8px' }}>
                          <div 
                            className={styles.uploadAction} 
                            style={{ flexGrow: 1 }} 
                            role="button"
                            tabIndex={0}
                            aria-label={t("admin_upload_logo")}
                            onClick={() => document.getElementById("ecosys-file-community")?.click()}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                document.getElementById("ecosys-file-community")?.click();
                              }
                            }}
                          >
                            {uploading ? <Spinner size="tiny" /> : (
                              <>
                                <Image24Regular aria-hidden="true" />
                                <MEHTypography variant="caption">{t("admin_upload_logo")}</MEHTypography>
                                <input 
                                  id="ecosys-file-community" 
                                  type="file" 
                                  accept="image/*" 
                                  aria-label={t("admin_upload_logo")}
                                  onChange={(e) => handleFileUpload(e, "logo_url")} 
                                  style={{ display: "none" }} 
                                />
                              </>
                            )}
                          </div>
                          {previewUrl && (
                            <div className={styles.previewContainer}>
                              <img src={previewUrl} className={styles.previewImage} alt={`Vista previa del logotipo de ${formData.nombre || 'comunidad'}`} />
                            </div>
                          )}
                      </div>
                    </div>
                  </>
                )}
              </DialogContent>
              <DialogActions>
                <Button appearance="secondary" icon={<Dismiss24Regular />} onClick={() => setIsModalOpen(false)}>{t("cancel")}</Button>
                <MEHButton type="submit" appearance="primary" icon={<Save24Regular />} loading={submitting}>
                  {isEditing ? t("admin_save_changes") : t("register")}
                </MEHButton>
              </DialogActions>
            </DialogBody>
          </form>
        </DialogSurface>
      </Dialog>

      {/* DIÁLOGO MODAL: DESIGNAR VOLUNTARIO */}
      <Dialog 
        open={voluntarioModal.open} 
        onOpenChange={(e, d) => !d.open && setVoluntarioModal({ open: false, id_usuario: null, loading: false })}
      >
        <DialogSurface className={styles.dialogSurface}>
          <DialogBody>
            <DialogTitle>🤝 Designar Voluntario del Ecosistema</DialogTitle>
            <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '10px' }}>
              <MEHTypography variant="body" style={{ opacity: 0.8 }}>
                Selecciona a un usuario registrado para asignarle el estatus de Voluntario. Si el usuario ya es Speaker o Mentor, <b>conservará ambos roles</b> sin perder sus datos.
              </MEHTypography>

              <Field label="Seleccionar Usuario Registrado" required>
                <Select
                  value={voluntarioModal.id_usuario ? String(voluntarioModal.id_usuario) : ""}
                  onChange={(e, d) => setVoluntarioModal(prev => ({ ...prev, id_usuario: Number(d.value) }))}
                >
                  <option value="">-- Elige un usuario registrado --</option>
                  {registeredUsers.map(u => (
                    <option key={u.id_usuario} value={u.id_usuario}>
                      {u.nombres} {u.apellidos} ({u.correo}) - Rol: {u.rol}
                    </option>
                  ))}
                </Select>
              </Field>
            </DialogContent>
            <DialogActions style={{ marginTop: '16px' }}>
              <Button appearance="secondary" onClick={() => setVoluntarioModal({ open: false, id_usuario: null, loading: false })}>
                {t("cancel")}
              </Button>
              <MEHButton
                appearance="primary"
                disabled={!voluntarioModal.id_usuario || voluntarioModal.loading}
                loading={voluntarioModal.loading}
                onClick={async () => {
                  if (!voluntarioModal.id_usuario) return;
                  setVoluntarioModal(prev => ({ ...prev, loading: true }));
                  try {
                    await adminService.asignarVoluntario(voluntarioModal.id_usuario);
                    notify("Éxito", "Usuario designado como Voluntario exitosamente", "success");
                    setVoluntarioModal({ open: false, id_usuario: null, loading: false });
                    fetchData();
                  } catch (err) {
                    const detail = err.response?.data?.detail;
                    notify("Error", typeof detail === 'string' ? detail : "No se pudo asignar como voluntario", "error");
                    setVoluntarioModal(prev => ({ ...prev, loading: false }));
                  }
                }}
              >
                Designar como Voluntario
              </MEHButton>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};

export default EcosystemDirectory;

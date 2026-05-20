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
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "28px",
    marginTop: "20px",
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

  // Estados para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [formData, setFormData] = useState({
    nombre: "", bio: "", trayectoria: "", foto_url: "", logo_url: "",
    trabajo_actual: "", linkedin_url: "", twitter_url: "", 
    facebook_url: "", instagram_url: "", sitio_web: "",
    tipo: "GENERAL", descripcion: "", link_contacto: "",
    correo_contacto: "", whatsapp_contacto: ""
  });

  const [errors, setErrors] = useState({});

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
      nombre: "", bio: "", trayectoria: "", foto_url: "", logo_url: "",
      trabajo_actual: "", linkedin_url: "", twitter_url: "", 
      facebook_url: "", instagram_url: "", sitio_web: "",
      tipo: "GENERAL", descripcion: "", link_contacto: "",
      correo_contacto: "", whatsapp_contacto: ""
    });
    setPreviewUrl(null);
    setErrors({});
    setIsEditing(false);
    setCurrentId(null);
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
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    const normalizedItem = { ...item };
    Object.keys(formData).forEach(key => {
        normalizedItem[key] = item[key] ?? "";
    });
    setFormData(normalizedItem);
    setIsEditing(true);
    const photo = normalizedItem.foto_url || normalizedItem.logo_url;
    if (photo) setPreviewUrl(resolveApiFileUrl(photo));
    setCurrentId(normalizedItem.id_speaker || normalizedItem.id_auspiciador || normalizedItem.id_comunidad);
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
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      const res = await api.post("/files/upload", uploadData);
      setFormData((prev) => ({ ...prev, [field]: res.data.url }));
      setPreviewUrl(`${resolveApiFileUrl(res.data.url)}?t=${new Date().getTime()}`);
      notify(t("success"), t("image_uploaded_success"), "success");
    } catch (err) {
      notify("Error", t("image_upload_error"), "error");
    } finally {
      setUploading(false);
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

      <TabList
        selectedValue={selectedTab}
        onTabSelect={(e, d) => setSelectedTab(d.value)}
      >
        <Tab value="speakers" icon={<Mic24Regular />}>{t("speakers")}</Tab>
        <Tab value="auspiciadores" icon={<Reward24Regular />}>{t("sponsors")}</Tab>
        <Tab value="comunidades" icon={<PeopleCommunity24Regular />}>{t("allied_communities")}</Tab>
      </TabList>

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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Subtitle1 style={{ fontWeight: "bold", fontSize: '18px' }}>{s.nombre}</Subtitle1>
                    <Badge color="brand" appearance="tint">{t("speaker")}</Badge>
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
                <Field label={t("admin_name_business_name")} required>
                  <Input value={formData.nombre} onChange={(e, d) => handleInputChange("nombre", d.value)} required />
                </Field>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <Field label={t("admin_contact_email")} validationState={errors.correo_contacto ? "error" : "none"} validationMessage={errors.correo_contacto}>
                        <Input type="email" value={formData.correo_contacto} onChange={(e, d) => handleInputChange("correo_contacto", d.value)} placeholder={t("admin_email_placeholder")} />
                    </Field>
                    <Field label={`${t("whatsapp")} (${t("admin_whatsapp_placeholder")})`}>
                        <Input value={formData.whatsapp_contacto} onChange={(e, d) => handleInputChange("whatsapp_contacto", d.value)} placeholder={t("admin_whatsapp_placeholder")} />
                    </Field>
                </div>

                {selectedTab === "speakers" && (
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
                      <Label>{t("admin_speaker_photo")}</Label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '8px' }}>
                          <div className={styles.uploadAction} style={{ flexGrow: 1 }} onClick={() => document.getElementById("ecosys-file").click()}>
                            {uploading ? <Spinner size="tiny" /> : (
                              <>
                                <Image24Regular />
                                <MEHTypography variant="caption">{formData.foto_url ? t("admin_change_photo") : t("admin_upload_photo")}</MEHTypography>
                                <input id="ecosys-file" type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "foto_url")} style={{ display: "none" }} />
                              </>
                            )}
                          </div>
                          {previewUrl && (
                            <div className={styles.previewContainer}>
                              <img src={previewUrl} className={styles.previewImage} alt="Preview" />
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
                          <div className={styles.uploadAction} style={{ flexGrow: 1 }} onClick={() => document.getElementById("ecosys-file").click()}>
                            {uploading ? <Spinner size="tiny" /> : (
                              <>
                                <Image24Regular />
                                <MEHTypography variant="caption">{t("admin_upload_logo")}</MEHTypography>
                                <input id="ecosys-file" type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "logo_url")} style={{ display: "none" }} />
                              </>
                            )}
                          </div>
                          {previewUrl && (
                            <div className={styles.previewContainer}>
                              <img src={previewUrl} className={styles.previewImage} style={{ objectFit: 'contain', padding: '10px' }} alt="Logo Preview" />
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
                          <div className={styles.uploadAction} style={{ flexGrow: 1 }} onClick={() => document.getElementById("ecosys-file").click()}>
                            {uploading ? <Spinner size="tiny" /> : (
                              <>
                                <Image24Regular />
                                <MEHTypography variant="caption">{t("admin_upload_logo")}</MEHTypography>
                                <input id="ecosys-file" type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "logo_url")} style={{ display: "none" }} />
                              </>
                            )}
                          </div>
                          {previewUrl && (
                            <div className={styles.previewContainer}>
                              <img src={previewUrl} className={styles.previewImage} alt="Community Preview" />
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
    </div>
  );
};

export default EcosystemDirectory;

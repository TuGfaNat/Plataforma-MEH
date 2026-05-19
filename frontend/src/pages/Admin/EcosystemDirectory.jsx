import React, { useState, useEffect } from "react";
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
      notify("Error", "No se pudo cargar el directorio", "error");
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
        const emailError = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "Correo inválido" : null;
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
    if (!window.confirm("¿Estás seguro de eliminar este registro?")) return;
    try {
      await api.delete(`/admin-directories/${selectedTab}/${id}`);
      notify("Eliminado", "Registro removido correctamente", "success");
      fetchData();
    } catch (err) {
      notify("Error", "No se pudo eliminar", "error");
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
      notify("Éxito", "Imagen cargada", "success");
    } catch (err) {
      notify("Error", "Fallo al subir archivo", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.values(errors).some((e) => e !== null)) {
      notify("Validación", "Corrige los errores antes de guardar", "warning");
      return;
    }
    setSubmitting(true);
    try {
      if (isEditing) {
        await api.put(`/admin-directories/${selectedTab}/${currentId}`, formData);
        notify("Actualizado", "Cambios guardados con éxito", "success");
      } else {
        await api.post(`/admin-directories/${selectedTab}`, formData);
        notify("Creado", "Nuevo registro añadido al ecosistema", "success");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      notify("Error", "No se pudo procesar la solicitud", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const getFriendlyName = () => {
    const names = {
        'speakers': 'Speaker',
        'auspiciadores': 'Auspiciador',
        'comunidades': 'Comunidad Aliada'
    };
    return names[selectedTab] || 'Registro';
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
            <MEHTypography variant="h1">Ecosistema y Alianzas</MEHTypography>
            <MEHTypography variant="body" style={{ opacity: 0.7 }}>
              Líderes, marcas y comunidades que impulsan el MEH.
            </MEHTypography>
          </div>
        </div>
        <MEHButton appearance="primary" size="large" icon={<Add24Regular />} onClick={handleAdd}>
          Añadir Nuevo
        </MEHButton>
      </div>

      <TabList
        selectedValue={selectedTab}
        onTabSelect={(e, d) => setSelectedTab(d.value)}
      >
        <Tab value="speakers" icon={<Mic24Regular />}>Speakers</Tab>
        <Tab value="auspiciadores" icon={<Reward24Regular />}>Auspiciadores</Tab>
        <Tab value="comunidades" icon={<PeopleCommunity24Regular />}>Comunidades Aliadas</Tab>
      </TabList>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
          <Spinner label="Sincronizando con la red..." />
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
                    <Badge color="brand" appearance="tint">Speaker</Badge>
                  </div>
                  
                  <Caption1 style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.8 }}>
                    <Briefcase24Regular style={{ fontSize: "14px" }} /> {s.trabajo_actual || "Líder de Comunidad"}
                  </Caption1>

                  <Body1 className={styles.bio}>{s.bio || "Sin biografía disponible."}</Body1>
                  
                  <div className={styles.contactBadges}>
                      {s.correo_contacto && (
                          <Tooltip content="Enviar Correo" relationship="label">
                            <div className={`${styles.actionChip} ${styles.emailChip}`} onClick={() => window.location.href=`mailto:${s.correo_contacto}`}>
                                <Mail24Regular style={{fontSize: '16px'}} /> Correo
                            </div>
                          </Tooltip>
                      )}
                      {s.whatsapp_contacto && (
                          <Tooltip content="Chat Directo" relationship="label">
                            <div className={`${styles.actionChip} ${styles.whatsappChip}`} onClick={() => openWhatsApp(s.whatsapp_contacto)}>
                                <Phone24Regular style={{fontSize: '16px'}} /> WhatsApp
                            </div>
                          </Tooltip>
                      )}
                  </div>

                  <Divider style={{ marginTop: "4px" }} />
                  <MEHTypography variant="caption" style={{ opacity: 0.7 }}>
                    <strong>Trayectoria:</strong> {s.trayectoria || "No especificada"}
                  </MEHTypography>
                </div>

                <div className={styles.footerActions}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Button icon={<Edit24Regular />} appearance="subtle" size="small" onClick={() => handleEdit(s)}>Editar</Button>
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
                                <Mail24Regular style={{fontSize: '16px'}} /> Contacto
                            </div>
                        )}
                        {a.whatsapp_contacto && (
                            <div className={`${styles.actionChip} ${styles.whatsappChip}`} onClick={() => openWhatsApp(a.whatsapp_contacto)}>
                                <Phone24Regular style={{fontSize: '16px'}} /> WhatsApp
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
                        Sitio Web
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
                                <Mail24Regular style={{fontSize: '16px'}} /> Correo
                            </div>
                        )}
                        {c.whatsapp_contacto && (
                            <div className={`${styles.actionChip} ${styles.whatsappChip}`} onClick={() => openWhatsApp(c.whatsapp_contacto)}>
                                <Phone24Regular style={{fontSize: '16px'}} /> WhatsApp
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
                        Link
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
                {isEditing ? `Editar ${getFriendlyName()}` : `Nuevo ${getFriendlyName()}`}
              </DialogTitle>
              <DialogContent className={styles.form}>
                <Field label="Nombre / Razón Social" required>
                  <Input value={formData.nombre} onChange={(e, d) => handleInputChange("nombre", d.value)} required />
                </Field>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <Field label="Correo de Contacto" validationState={errors.correo_contacto ? "error" : "none"} validationMessage={errors.correo_contacto}>
                        <Input type="email" value={formData.correo_contacto} onChange={(e, d) => handleInputChange("correo_contacto", d.value)} placeholder="ejemplo@correo.com" />
                    </Field>
                    <Field label="WhatsApp (591...)">
                        <Input value={formData.whatsapp_contacto} onChange={(e, d) => handleInputChange("whatsapp_contacto", d.value)} placeholder="591..." />
                    </Field>
                </div>

                {selectedTab === "speakers" && (
                  <>
                    <Field label="Biografía Profesional">
                      <Textarea value={formData.bio} onChange={(e, d) => handleInputChange("bio", d.value)} rows={3} />
                    </Field>
                    <Field label="Resumen de Trayectoria">
                        <Input value={formData.trayectoria} onChange={(e, d) => handleInputChange("trayectoria", d.value)} placeholder="Ej: Microsoft MVP, 10 años en Azure..." />
                    </Field>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <Field label="Trabajo Actual">
                        <Input value={formData.trabajo_actual} onChange={(e, d) => handleInputChange("trabajo_actual", d.value)} />
                      </Field>
                      <Field label="LinkedIn URL" validationState={errors.linkedin_url ? "error" : "none"} validationMessage={errors.linkedin_url}>
                        <Input value={formData.linkedin_url} onChange={(e, d) => handleInputChange("linkedin_url", d.value)} placeholder="https://..." />
                      </Field>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <Field label="Facebook URL" validationState={errors.facebook_url ? "error" : "none"} validationMessage={errors.facebook_url}>
                        <Input value={formData.facebook_url} onChange={(e, d) => handleInputChange("facebook_url", d.value)} placeholder="https://..." />
                      </Field>
                      <Field label="Instagram URL" validationState={errors.instagram_url ? "error" : "none"} validationMessage={errors.instagram_url}>
                        <Input value={formData.instagram_url} onChange={(e, d) => handleInputChange("instagram_url", d.value)} placeholder="https://..." />
                      </Field>
                    </div>
                    <div className={styles.fieldGroup}>
                      <Label>Foto del Speaker</Label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '8px' }}>
                          <div className={styles.uploadAction} style={{ flexGrow: 1 }} onClick={() => document.getElementById("ecosys-file").click()}>
                            {uploading ? <Spinner size="tiny" /> : (
                              <>
                                <Image24Regular />
                                <MEHTypography variant="caption">{formData.foto_url ? "Cambiar Foto" : "Cargar Foto"}</MEHTypography>
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
                      <Field label="Sitio Web" validationState={errors.sitio_web ? "error" : "none"} validationMessage={errors.sitio_web}>
                        <Input value={formData.sitio_web} onChange={(e, d) => handleInputChange("sitio_web", d.value)} placeholder="https://..." />
                      </Field>
                      <Field label="Tipo de Tier">
                        <Select value={formData.tipo} onChange={(e, d) => handleInputChange("tipo", d.value)}>
                          <option value="GOLD">GOLD</option>
                          <option value="SILVER">SILVER</option>
                          <option value="BRONZE">BRONZE</option>
                          <option value="GENERAL">GENERAL</option>
                        </Select>
                      </Field>
                    </div>
                    <div className={styles.fieldGroup}>
                      <Label>Logo de la Marca</Label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '8px' }}>
                          <div className={styles.uploadAction} style={{ flexGrow: 1 }} onClick={() => document.getElementById("ecosys-file").click()}>
                            {uploading ? <Spinner size="tiny" /> : (
                              <>
                                <Image24Regular />
                                <MEHTypography variant="caption">Subir Logo</MEHTypography>
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
                    <Field label="Descripción">
                      <Textarea value={formData.descripcion} onChange={(e, d) => handleInputChange("descripcion", d.value)} rows={3} />
                    </Field>
                    <Field label="Link de Contacto" validationState={errors.link_contacto ? "error" : "none"} validationMessage={errors.link_contacto}>
                        <Input value={formData.link_contacto} onChange={(e, d) => handleInputChange("link_contacto", d.value)} placeholder="https://..." />
                    </Field>
                    <div className={styles.fieldGroup}>
                      <Label>Logo de Comunidad</Label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '8px' }}>
                          <div className={styles.uploadAction} style={{ flexGrow: 1 }} onClick={() => document.getElementById("ecosys-file").click()}>
                            {uploading ? <Spinner size="tiny" /> : (
                              <>
                                <Image24Regular />
                                <MEHTypography variant="caption">Subir Logo</MEHTypography>
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
                <Button appearance="secondary" icon={<Dismiss24Regular />} onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <MEHButton type="submit" appearance="primary" icon={<Save24Regular />} loading={submitting}>
                  {isEditing ? "Guardar Cambios" : "Registrar"}
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

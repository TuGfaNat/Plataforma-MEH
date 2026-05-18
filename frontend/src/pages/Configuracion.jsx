import React, { useState, useEffect } from "react";
import {
  makeStyles,
  shorthands,
  tokens,
  Input,
  Label,
  Textarea,
  Avatar,
  Divider,
  Switch,
  Spinner,
  Badge,
  Select,
} from "@fluentui/react-components";
import {
  Person24Regular,
  Save24Regular,
  Camera24Regular,
  Globe24Regular,
  People24Regular,
  PersonNote24Filled,
  ArrowUpload24Regular,
  Building24Regular,
  Map24Regular,
  Link24Regular
} from "@fluentui/react-icons";
import { MEHCard, MEHButton, MEHTypography } from "../components/ui";
import { useAuth, useNotify } from "../App";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import api from "../services/api";
import { validateName, hasErrors } from "../utils/validators";

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
  layoutGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 350px",
    gap: "32px",
    "@media (max-width: 1024px)": {
      gridTemplateColumns: "1fr",
    },
  },
  formSection: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  uploadBox: {
    border: `2px dashed ${tokens.colorNeutralBackground3}`,
    ...shorthands.padding('24px'),
    ...shorthands.borderRadius('12px'),
    textAlign: 'center',
    position: 'relative',
    transition: 'all 0.2s ease',
    ':hover': {
        borderColor: tokens.colorBrandBackground,
        backgroundColor: 'rgba(127, 19, 236, 0.03)'
    }
  },
  cardPreview: {
    background: "linear-gradient(135deg, #7f13ec 0%, #3a0078 100%)",
    color: "white",
    ...shorthands.padding("32px"),
    ...shorthands.borderRadius("20px"),
    position: "sticky",
    top: "32px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "16px",
    boxShadow: "0 20px 40px rgba(127, 19, 236, 0.3)",
  },
  socialGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    "@media (max-width: 600px)": {
      gridTemplateColumns: "1fr",
    }
  }
});

const Configuracion = () => {
  const styles = useStyles();
  const { user, checkAuth } = useAuth();
  const { notify } = useNotify();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    alias: "",
    foto_url: "",
    bio: "",
    institucion: "",
    tipo_entidad: "Estudiante",
    pais: "Bolivia",
    departamento: "",
    linkedin_url: "",
    github_url: "",
    facebook_url: "",
    instagram_url: "",
    tiktok_url: "",
    learning_path_url: "",
    perfil_publico: true,
  });

  const [errors, setErrors] = useState({
    nombres: null,
    apellidos: null,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nombres: user.nombres || "",
        apellidos: user.apellidos || "",
        alias: user.alias || "",
        foto_url: user.foto_url || "",
        bio: user.bio || "",
        institucion: user.institucion || "",
        tipo_entidad: user.tipo_entidad || "Estudiante",
        pais: user.pais || "Bolivia",
        departamento: user.departamento || "",
        linkedin_url: user.linkedin_url || "",
        github_url: user.github_url || "",
        facebook_url: user.facebook_url || "",
        instagram_url: user.instagram_url || "",
        tiktok_url: user.tiktok_url || "",
        learning_path_url: user.learning_path_url || "",
        perfil_publico: user.perfil_publico ?? true,
      });
    }
  }, [user]);

  const handleInputChange = (field, value, validator) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validator) {
      setErrors((prev) => ({ ...prev, [field]: validator(value) }));
    }
  };

  const handleSave = async () => {
    const newErrors = {
      nombres: validateName(formData.nombres),
      apellidos: validateName(formData.apellidos),
    };

    setErrors(newErrors);
    if (hasErrors(newErrors)) {
      notify("Validación", "Corrige los errores antes de guardar", "warning");
      return;
    }

    setLoading(true);
    try {
      await authService.updateMe(formData);
      await checkAuth(); 
      notify("Perfil Actualizado", "Tus cambios se han guardado con éxito", "success");
    } catch (err) {
      notify("Error", "No se pudo actualizar el perfil", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      const res = await api.post('/files/upload', uploadData);
      setFormData(prev => ({ ...prev, foto_url: res.data.url }));
      notify("Éxito", "Foto de perfil cargada correctamente", "success");
    } catch (err) {
      notify("Error", "No se pudo subir la foto", "error");
    } finally {
      setUploading(false);
    }
  };

  if (!user) return <Spinner label="Cargando configuración..." />;

  return (
    <div className={styles.container}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Person24Regular style={{ color: tokens.colorBrandForeground1, fontSize: "32px" }} />
        <MEHTypography variant="h1">Configuración de Perfil</MEHTypography>
      </div>

      <div className={styles.layoutGrid}>
        <MEHCard>
          <div className={styles.formSection}>
            <MEHTypography variant="h3">1. Información Personal</MEHTypography>

            <div className={styles.socialGrid}>
              <div className={styles.fieldGroup}>
                <Label>Nombres</Label>
                <Input
                  value={formData.nombres}
                  onChange={(e, d) => handleInputChange('nombres', d.value, validateName)}
                  validationState={errors.nombres ? "error" : "none"}
                />
              </div>
              <div className={styles.fieldGroup}>
                <Label>Apellidos</Label>
                <Input
                  value={formData.apellidos}
                  onChange={(e, d) => handleInputChange('apellidos', d.value, validateName)}
                  validationState={errors.apellidos ? "error" : "none"}
                />
              </div>
            </div>

            <div className={styles.socialGrid}>
              <div className={styles.fieldGroup}>
                <Label>Alias / Username</Label>
                <Input
                  contentBefore={<People24Regular />}
                  value={formData.alias}
                  onChange={(e, d) => setFormData({ ...formData, alias: d.value })}
                />
              </div>
              <div className={styles.fieldGroup}>
                <Label>Foto de Perfil</Label>
                <div className={styles.uploadBox}>
                  {uploading ? <Spinner size="tiny" /> : (
                    <>
                      <ArrowUpload24Regular style={{ fontSize: '20px', marginBottom: '4px' }} />
                      <MEHTypography variant="caption" style={{ display: 'block' }}>Subir Foto</MEHTypography>
                      <input type="file" onChange={handlePhotoUpload} accept="image/*" style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <Label>Biografía</Label>
              <Textarea
                value={formData.bio}
                onChange={(e, d) => setFormData({ ...formData, bio: d.value })}
                placeholder="Cuéntanos un poco sobre ti..."
              />
            </div>

            <Divider />
            <MEHTypography variant="h3">2. Ubicación y Entidad (Métricas)</MEHTypography>

            <div className={styles.socialGrid}>
              <div className={styles.fieldGroup}>
                <Label>Soy...</Label>
                <Select value={formData.tipo_entidad} onChange={(e, d) => setFormData({...formData, tipo_entidad: d.value})}>
                  <option value="Estudiante">Estudiante</option>
                  <option value="Profesional">Profesional</option>
                  <option value="Emprendedor">Emprendedor</option>
                </Select>
              </div>
              <div className={styles.fieldGroup}>
                <Label>Institución / Empresa</Label>
                <Input contentBefore={<Building24Regular />} value={formData.institucion} onChange={(e, d) => setFormData({ ...formData, institucion: d.value })} />
              </div>
            </div>

            <div className={styles.socialGrid}>
              <div className={styles.fieldGroup}>
                <Label>País</Label>
                <Input contentBefore={<Globe24Regular />} value={formData.pais} onChange={(e, d) => setFormData({ ...formData, pais: d.value })} />
              </div>
              <div className={styles.fieldGroup}>
                <Label>Departamento / Ciudad</Label>
                <Input contentBefore={<Map24Regular />} value={formData.departamento} onChange={(e, d) => setFormData({ ...formData, departamento: d.value })} />
              </div>
            </div>

            <Divider />
            <MEHTypography variant="h3">3. Presencia Digital y Redes Sociales</MEHTypography>

            <div className={styles.socialGrid}>
              <div className={styles.fieldGroup}>
                <Label>LinkedIn URL</Label>
                <Input value={formData.linkedin_url} onChange={(e, d) => setFormData({ ...formData, linkedin_url: d.value })} />
              </div>
              <div className={styles.fieldGroup}>
                <Label>GitHub URL</Label>
                <Input value={formData.github_url} onChange={(e, d) => setFormData({ ...formData, github_url: d.value })} />
              </div>
              <div className={styles.fieldGroup}>
                <Label>Facebook URL</Label>
                <Input value={formData.facebook_url} onChange={(e, d) => setFormData({ ...formData, facebook_url: d.value })} />
              </div>
              <div className={styles.fieldGroup}>
                <Label>Instagram URL</Label>
                <Input value={formData.instagram_url} onChange={(e, d) => setFormData({ ...formData, instagram_url: d.value })} />
              </div>
              <div className={styles.fieldGroup}>
                <Label>TikTok URL</Label>
                <Input value={formData.tiktok_url} onChange={(e, d) => setFormData({ ...formData, tiktok_url: d.value })} />
              </div>
              <div className={styles.fieldGroup}>
                <Label>Microsoft Learn Path URL</Label>
                <Input contentBefore={<Link24Regular />} value={formData.learning_path_url} onChange={(e, d) => setFormData({ ...formData, learning_path_url: d.value })} />
              </div>
            </div>

            <Divider />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <MEHTypography variant="body" style={{ fontWeight: "bold" }}>Perfil Público</MEHTypography>
                <MEHTypography variant="caption" style={{ display: "block", opacity: 0.6 }}>Permitir que otros miembros vean tus logros.</MEHTypography>
              </div>
              <Switch checked={formData.perfil_publico} onChange={(e, d) => setFormData({ ...formData, perfil_publico: d.checked })} />
            </div>

            <MEHButton appearance="primary" size="large" icon={<Save24Regular />} onClick={handleSave} disabled={loading}>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </MEHButton>
          </div>
        </MEHCard>

        <aside>
          <div className={styles.cardPreview}>
            <Avatar size={96} name={`${formData.nombres} ${formData.apellidos}`} src={formData.foto_url} color="colorful" style={{ border: "4px solid rgba(255,255,255,0.2)" }} />
            <div>
              <MEHTypography variant="h2" style={{ color: "white" }}>{formData.alias || formData.nombres || "Tu Nombre"}</MEHTypography>
              <Badge appearance="filled" style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white", marginTop: "4px" }}>{user.rol}</Badge>
            </div>
            <MEHTypography variant="caption" style={{ color: "rgba(255,255,255,0.8)", minHeight: "40px" }}>{formData.bio || "Tu biografía aparecerá aquí."}</MEHTypography>
            
            <MEHTypography variant="caption" style={{ color: "white", opacity: 0.9 }}>📍 {formData.departamento}, {formData.pais}</MEHTypography>
            <MEHTypography variant="caption" style={{ color: "white", opacity: 0.9 }}>🏫 {formData.institucion}</MEHTypography>

            <MEHButton appearance="primary" style={{ backgroundColor: 'white', color: '#7f13ec', marginTop: '12px' }} onClick={() => navigate('/comunidad')}>Ver mi Perfil Público</MEHButton>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Configuracion;

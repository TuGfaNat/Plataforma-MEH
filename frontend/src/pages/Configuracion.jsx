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
  mergeClasses,
} from "@fluentui/react-components";
import {
  Person24Regular,
  Save24Regular,
  Camera24Regular,
  Globe24Regular,
  People24Regular,
  ArrowUpload24Regular,
  Building24Regular,
  Map24Regular,
  Link24Regular,
  WeatherSunny24Regular,
  WeatherMoon24Regular,
  Library24Regular
} from "@fluentui/react-icons";
import { MEHCard, MEHButton, MEHTypography } from "../components/ui";
import { useAuth, useNotify, useTheme } from "../App";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import api, { resolveApiFileUrl } from "../services/api";
import { getValidationError, hasErrors } from "../utils/validators";
import { TIPOS_ENTIDAD } from "../utils/constants";

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
    gridTemplateColumns: "1fr 380px",
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
  uploadAction: {
    ...shorthands.border('2px', 'dashed', tokens.colorBrandStroke1),
    ...shorthands.padding('20px'),
    ...shorthands.borderRadius('16px'),
    textAlign: 'center',
    position: 'relative',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    backgroundColor: tokens.colorNeutralBackground2,
    cursor: 'pointer',
    boxShadow: tokens.shadow4,
    ':hover': {
        ...shorthands.borderColor(tokens.colorBrandBackground),
        backgroundColor: tokens.colorBrandBackground2,
        transform: 'translateY(-2px)',
        boxShadow: tokens.shadow8,
    }
  },
  cardPreview: {
    background: "linear-gradient(135deg, #7f13ec 0%, #3a0078 100%)",
    color: "white",
    ...shorthands.padding("32px"),
    ...shorthands.borderRadius("24px"),
    position: "sticky",
    top: "32px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "20px",
    boxShadow: "0 25px 50px -12px rgba(127, 19, 236, 0.5)",
    overflowX: "hidden"
  },
  avatarContainer: {
    position: "relative",
    ...shorthands.padding("4px"),
    ...shorthands.borderRadius("50%"),
    background: "rgba(255, 255, 255, 0.2)",
    boxShadow: "0 0 20px rgba(0,0,0,0.2)"
  },
  socialGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    "@media (max-width: 600px)": {
      gridTemplateColumns: "1fr",
    }
  },
  themeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "12px",
    marginTop: "12px",
  },
  themeCard: {
    ...shorthands.padding("16px"),
    ...shorthands.borderRadius("16px"),
    ...shorthands.border("2px", "solid", "transparent"),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    backgroundColor: tokens.colorNeutralBackground3,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground2,
      ...shorthands.borderColor(tokens.colorBrandStroke1),
    }
  },
  themeCardSelected: {
    ...shorthands.borderColor(tokens.colorBrandBackground),
    backgroundColor: tokens.colorBrandBackground2,
  }
});

const Configuracion = () => {
  const styles = useStyles();
  const { user, checkAuth } = useAuth();
  const { notify } = useNotify();
  const { currentTheme, setCurrentTheme } = useTheme();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleThemeChange = async (themeKey) => {
    setCurrentTheme(themeKey);
    localStorage.setItem('theme', themeKey);
    
    if (user) {
      try {
        await authService.updateMe({ preferencia_tema: themeKey });
      } catch (err) {
        console.error("Error al guardar tema");
      }
    }
  };

  // Estados para la API Geográfica
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);

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
    alias: null,
    bio: null,
    institucion: null,
    departamento: null,
  });

  // 1. Cargar países al montar
  useEffect(() => {
    const fetchCountries = async () => {
        try {
            const res = await fetch("https://countriesnow.space/api/v0.1/countries");
            const result = await res.json();
            setCountries(result.data || []);
        } catch (err) {
            console.error("Error cargando países:", err);
            notify("Error API", "No se pudieron cargar los países. Intenta más tarde.", "error");
        }
    };
    fetchCountries();
  }, []);

  // 2. Cargar estados cuando cambia el país o el usuario inicializa
  useEffect(() => {
    if (formData.pais) {
        fetchStates(formData.pais);
    }
  }, [formData.pais]);

  const fetchStates = async (countryName) => {
    if (!countryName) return;
    setLoadingStates(true);
    try {
        const res = await fetch("https://countriesnow.space/api/v0.1/countries/states", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ country: countryName })
        });
        const result = await res.json();
        setStates(result.data?.states || []);
    } catch (err) {
        console.error("Error cargando estados:", err);
        setStates([]);
    } finally {
        setLoadingStates(false);
    }
  };

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
      
      if (user.foto_url) {
        setPreviewUrl(resolveApiFileUrl(user.foto_url));
      }
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    const error = getValidationError(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSave = async () => {
    const newErrors = {};
    Object.keys(errors).forEach(field => {
        newErrors[field] = getValidationError(field, formData[field]);
    });

    setErrors(newErrors);
    if (hasErrors(newErrors)) {
      notify("Validación", "Por favor completa todos los campos obligatorios correctamente", "warning");
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
      const backendUrl = res.data.url;
      
      const absoluteUrl = resolveApiFileUrl(backendUrl);
      const cacheBustedUrl = `${absoluteUrl}?t=${new Date().getTime()}`;
      
      setFormData(prev => ({ ...prev, foto_url: backendUrl }));
      setPreviewUrl(cacheBustedUrl);
      
      notify("Éxito", "Foto cargada. Recuerda guardar los cambios.", "success");
      
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
                <Label required>Nombres</Label>
                <Input
                  value={formData.nombres}
                  onChange={(e, d) => handleInputChange('nombres', d.value)}
                  validationState={errors.nombres ? "error" : "none"}
                />
                {errors.nombres && <MEHTypography variant="caption" style={{ color: tokens.colorPaletteRedForeground1 }}>{errors.nombres}</MEHTypography>}
              </div>
              <div className={styles.fieldGroup}>
                <Label required>Apellidos</Label>
                <Input
                  value={formData.apellidos}
                  onChange={(e, d) => handleInputChange('apellidos', d.value)}
                  validationState={errors.apellidos ? "error" : "none"}
                />
                {errors.apellidos && <MEHTypography variant="caption" style={{ color: tokens.colorPaletteRedForeground1 }}>{errors.apellidos}</MEHTypography>}
              </div>
            </div>

            <div className={styles.socialGrid}>
              <div className={styles.fieldGroup}>
                <Label required>Alias / Username</Label>
                <Input
                  contentBefore={<People24Regular />}
                  value={formData.alias}
                  onChange={(e, d) => handleInputChange('alias', d.value)}
                  validationState={errors.alias ? "error" : "none"}
                />
                {errors.alias && <MEHTypography variant="caption" style={{ color: tokens.colorPaletteRedForeground1 }}>{errors.alias}</MEHTypography>}
              </div>
              <div className={styles.fieldGroup}>
                <Label>Foto de Perfil</Label>
                <div className={styles.uploadAction} onClick={() => document.getElementById('photo-input').click()}>
                  {uploading ? (
                    <Spinner size="small" label="Subiendo..." />
                  ) : (
                    <>
                      <Camera24Regular style={{ fontSize: '32px', color: tokens.colorBrandForeground1 }} />
                      <div>
                        <MEHTypography variant="body" style={{ fontWeight: 'bold', display: 'block' }}>Actualizar Imagen</MEHTypography>
                        <MEHTypography variant="caption" style={{ opacity: 0.6 }}>PNG, JPG hasta 5MB</MEHTypography>
                      </div>
                      <input 
                        id="photo-input"
                        type="file" 
                        onChange={handlePhotoUpload} 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                      />
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <Label required>Biografía</Label>
              <Textarea
                value={formData.bio}
                onChange={(e, d) => handleInputChange('bio', d.value)}
                placeholder="Cuéntanos un poco sobre ti..."
                style={{ minHeight: "100px" }}
              />
              {errors.bio ? (
                <MEHTypography variant="caption" style={{ color: tokens.colorPaletteRedForeground1 }}>{errors.bio}</MEHTypography>
              ) : (
                <MEHTypography variant="caption" style={{ opacity: 0.6 }}>{formData.bio.length}/500 caracteres</MEHTypography>
              )}
            </div>

            <Divider />
            <MEHTypography variant="h3">2. Ubicación y Entidad</MEHTypography>

            <div className={styles.socialGrid}>
              <div className={styles.fieldGroup}>
                <Label>Soy...</Label>
                <Select value={formData.tipo_entidad} onChange={(e, d) => setFormData({...formData, tipo_entidad: d.value})}>
                  {TIPOS_ENTIDAD.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </Select>
              </div>
              <div className={styles.fieldGroup}>
                <Label required>Institución</Label>
                <Input 
                    contentBefore={<Building24Regular />} 
                    value={formData.institucion} 
                    onChange={(e, d) => handleInputChange('institucion', d.value)} 
                    validationState={errors.institucion ? "error" : "none"}
                />
                {errors.institucion && <MEHTypography variant="caption" style={{ color: tokens.colorPaletteRedForeground1 }}>{errors.institucion}</MEHTypography>}
              </div>
            </div>

            <div className={styles.socialGrid}>
              <div className={styles.fieldGroup}>
                <Label>País</Label>
                <Select value={formData.pais} onChange={(e, d) => setFormData({ ...formData, pais: d.value })}>
                    <option value="">Selecciona un país...</option>
                    {countries.map(p => <option key={p.iso3} value={p.country}>{p.country}</option>)}
                </Select>
              </div>
              <div className={styles.fieldGroup}>
                <Label required>Departamento / Región</Label>
                <Select 
                    value={formData.departamento} 
                    onChange={(e, d) => handleInputChange('departamento', d.value)}
                    validationState={errors.departamento ? "error" : "none"}
                    disabled={!formData.pais || loadingStates}
                >
                    <option value="">{loadingStates ? "Cargando..." : "Selecciona uno..."}</option>
                    {states.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                </Select>
                {errors.departamento && <MEHTypography variant="caption" style={{ color: tokens.colorPaletteRedForeground1 }}>{errors.departamento}</MEHTypography>}
              </div>
            </div>

            <Divider />
            <MEHTypography variant="h3">3. Redes Sociales</MEHTypography>

            <div className={styles.socialGrid}>
              <div className={styles.fieldGroup}>
                <Label>LinkedIn URL</Label>
                <Input value={formData.linkedin_url} onChange={(e, d) => handleInputChange('linkedin_url', d.value)} placeholder="https://linkedin.com/in/..." />
              </div>
              <div className={styles.fieldGroup}>
                <Label>GitHub URL</Label>
                <Input value={formData.github_url} onChange={(e, d) => handleInputChange('github_url', d.value)} placeholder="https://github.com/..." />
              </div>
              <div className={styles.fieldGroup}>
                <Label>Facebook URL</Label>
                <Input value={formData.facebook_url} onChange={(e, d) => handleInputChange('facebook_url', d.value)} placeholder="https://facebook.com/..." />
              </div>
              <div className={styles.fieldGroup}>
                <Label>Instagram URL</Label>
                <Input value={formData.instagram_url} onChange={(e, d) => handleInputChange('instagram_url', d.value)} placeholder="https://instagram.com/..." />
              </div>
              <div className={styles.fieldGroup}>
                <Label>TikTok URL</Label>
                <Input value={formData.tiktok_url} onChange={(e, d) => handleInputChange('tiktok_url', d.value)} placeholder="https://tiktok.com/@..." />
              </div>
              <div className={styles.fieldGroup}>
                <Label>Microsoft Learn Path URL</Label>
                <Input 
                    contentBefore={<Link24Regular />} 
                    value={formData.learning_path_url} 
                    onChange={(e, d) => handleInputChange('learning_path_url', d.value)} 
                    placeholder="https://learn.microsoft.com/users/..." 
                />
              </div>
            </div>

            <Divider />
            <MEHTypography variant="h3">4. Personalización del Sistema</MEHTypography>
            <MEHTypography variant="caption" style={{ opacity: 0.6 }}>Elige el estilo que mejor se adapte a ti. El cambio se aplica instantáneamente.</MEHTypography>

            <div className={styles.themeGrid}>
              <div 
                className={mergeClasses(styles.themeCard, currentTheme === 'dark' && styles.themeCardSelected)}
                onClick={() => handleThemeChange('dark')}
              >
                <WeatherMoon24Regular style={{ fontSize: '24px' }} />
                <MEHTypography variant="body" style={{ fontWeight: 'bold' }}>Oscuro</MEHTypography>
                <MEHTypography variant="caption" style={{ opacity: 0.6, textAlign: 'center' }}>Por defecto y elegante</MEHTypography>
              </div>

              <div 
                className={mergeClasses(styles.themeCard, currentTheme === 'light' && styles.themeCardSelected)}
                onClick={() => handleThemeChange('light')}
              >
                <WeatherSunny24Regular style={{ fontSize: '24px' }} />
                <MEHTypography variant="body" style={{ fontWeight: 'bold' }}>Claro</MEHTypography>
                <MEHTypography variant="caption" style={{ opacity: 0.6, textAlign: 'center' }}>Máxima claridad diurna</MEHTypography>
              </div>

              <div 
                className={mergeClasses(styles.themeCard, currentTheme === 'ash' && styles.themeCardSelected)}
                onClick={() => handleThemeChange('ash')}
              >
                <Library24Regular style={{ fontSize: '24px' }} />
                <MEHTypography variant="body" style={{ fontWeight: 'bold' }}>Ceniza</MEHTypography>
                <MEHTypography variant="caption" style={{ opacity: 0.6, textAlign: 'center' }}>Grises suaves y neutros</MEHTypography>
              </div>

              <div 
                className={mergeClasses(styles.themeCard, currentTheme === 'ocean' && styles.themeCardSelected)}
                onClick={() => handleThemeChange('ocean')}
              >
                <Globe24Regular style={{ fontSize: '24px' }} />
                <MEHTypography variant="body" style={{ fontWeight: 'bold' }}>Ocean</MEHTypography>
                <MEHTypography variant="caption" style={{ opacity: 0.6, textAlign: 'center' }}>Azules y plomos técnicos</MEHTypography>
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
            <div className={styles.avatarContainer}>
                <Avatar 
                    key={previewUrl}
                    size={96} 
                    name={`${formData.nombres} ${formData.apellidos}`} 
                    image={{ src: previewUrl }} 
                    color="colorful" 
                />
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <MEHTypography variant="h2" style={{ color: "white", margin: 0 }}>{formData.alias || formData.nombres || "Tu Nombre"}</MEHTypography>
              <Badge appearance="filled" style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white", alignSelf: "center" }}>{user.rol}</Badge>
            </div>

            <MEHTypography variant="caption" style={{ color: "rgba(255,255,255,0.8)", minHeight: "40px", fontStyle: "italic" }}>
                "{formData.bio || "Tu biografía aparecerá aquí."}"
            </MEHTypography>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px" }}>
                <MEHTypography variant="caption" style={{ color: "white", opacity: 0.9 }}>📍 {formData.departamento}, {formData.pais}</MEHTypography>
                <MEHTypography variant="caption" style={{ color: "white", opacity: 0.9 }}>🏫 {formData.institucion}</MEHTypography>
            </div>

            <MEHButton 
                appearance="primary" 
                style={{ backgroundColor: 'white', color: '#7f13ec', width: '100%', marginTop: '10px' }} 
                onClick={() => navigate('/comunidad')}
            >
                Ver mi Perfil Público
            </MEHButton>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Configuracion;

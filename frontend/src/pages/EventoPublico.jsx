import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  makeStyles, 
  shorthands, 
  tokens, 
  Spinner, 
  Badge, 
  MessageBar,
  MessageBarBody,
  Avatar,
  Divider,
  Field,
  Input,
  Select
} from '@fluentui/react-components';
import { 
  CalendarLtr24Regular, 
  Clock24Regular, 
  Map24Regular, 
  Video24Regular, 
  People24Regular, 
  Share24Regular, 
  CheckmarkCircle24Filled, 
  ArrowLeft24Regular,
  Gift24Regular,
  Mic24Regular,
  Link24Regular,
  Translate24Regular,
  WeatherMoon24Regular,
  WeatherSunny24Regular,
  Warning24Regular,
  ReceiptMoney24Filled
} from '@fluentui/react-icons';
import { MEHButton, MEHCard, MEHTypography } from '../components/ui';
import { useAuth, useNotify, useTheme } from '../App';
import eventoService from '../services/eventoService';
import pagoService from '../services/pagoService';
import { resolveApiFileUrl } from '../services/api';
import { designTokens } from '../theme/theme';

const DEFAULT_EVENT_IMG = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop";

const useStyles = makeStyles({
  container: {
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground4,
    color: tokens.colorNeutralForeground1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflowX: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: '700px',
    height: '700px',
    background: tokens.colorBrandBackground2,
    filter: 'blur(160px)',
    ...shorthands.borderRadius('50%'),
    opacity: 0.18,
    zIndex: 0,
    top: '-150px',
    right: '-150px',
    pointerEvents: 'none',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 32px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backgroundColor: 'rgba(10, 10, 15, 0.75)',
    backdropFilter: 'blur(20px)',
    ...shorthands.borderBottom('1px', 'solid', 'rgba(255, 255, 255, 0.08)'),
    '@media (max-width: 600px)': {
      padding: '12px 16px',
    }
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'pointer',
  },
  logo: {
    width: '36px',
    height: '36px',
    filter: 'drop-shadow(0 0 12px rgba(127, 19, 236, 0.5))',
  },
  mainWrapper: {
    maxWidth: '1180px',
    width: '100%',
    margin: '0 auto',
    padding: '32px 24px 64px 24px',
    zIndex: 1,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    '@media (max-width: 600px)': {
      padding: '16px 12px 48px 12px',
    }
  },
  heroBanner: {
    width: '100%',
    maxHeight: '400px',
    height: '360px',
    objectFit: 'cover',
    ...shorthands.borderRadius('20px'),
    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: tokens.colorNeutralBackground3,
    '@media (max-width: 768px)': {
      height: '220px',
      ...shorthands.borderRadius('14px'),
    }
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: '36px',
    alignItems: 'start',
    '@media (max-width: 960px)': {
      gridTemplateColumns: '1fr',
      gap: '28px',
    }
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    position: 'sticky',
    top: '84px',
    '@media (max-width: 960px)': {
      position: 'static',
    }
  },
  actionCard: {
    ...shorthands.padding('28px'),
    ...shorthands.borderRadius('20px'),
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    backgroundColor: 'rgba(25, 25, 35, 0.9)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(127, 19, 236, 0.25)',
    boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  organizerBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    ...shorthands.borderRadius('12px'),
    border: '1px solid rgba(255, 255, 255, 0.08)',
    width: 'fit-content',
  },
  descriptionText: {
    whiteSpace: 'pre-line',
    lineHeight: '1.7',
    fontSize: '1.05rem',
    opacity: 0.9,
  },
  speakersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
    marginTop: '8px',
  },
  speakerCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    ...shorthands.borderRadius('14px'),
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },
  agendaItem: {
    display: 'flex',
    gap: '16px',
    padding: '14px 18px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    ...shorthands.borderRadius('12px'),
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  uploadArea: {
    ...shorthands.border('2px', 'dashed', 'rgba(127, 19, 236, 0.35)'),
    ...shorthands.borderRadius('12px'),
    padding: '16px',
    textAlign: 'center',
    position: 'relative',
    cursor: 'pointer',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: 'rgba(127, 19, 236, 0.06)',
      ...shorthands.borderColor(tokens.colorBrandStroke1),
    }
  },
  fileInput: {
    opacity: 0,
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    cursor: 'pointer',
  }
});

const getInscripcionBadgeColor = (estado) => {
  if (estado === 'CONFIRMADA') return 'success';
  if (estado === 'PENDIENTE_APROBACION') return 'informative';
  return 'warning';
};

const EventoPublico = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const styles = useStyles();
  const { user } = useAuth();
  const { notify } = useNotify();
  const { currentTheme, toggleTheme } = useTheme();

  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Estado de inscripción
  const [isInscribed, setIsInscribed] = useState(false);
  const [inscripcionInfo, setInscripcionInfo] = useState(null);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentFile, setPaymentFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Formulario prellenado
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    correo: '',
    carne: '',
    telefono: '',
    institucion: ''
  });

  useEffect(() => {
    void fetchEventoData();
  }, [id]);

  useEffect(() => {
    if (user) {
      const full = `${user.nombres || ''} ${user.apellidos || ''}`.trim();
      const savedCarne = localStorage.getItem('meh_user_carne') || '';
      const savedTelefono = localStorage.getItem('meh_user_telefono') || '';

      setFormData({
        nombreCompleto: full || user.alias || '',
        correo: user.correo || '',
        carne: user.carne || user.carnet || user.ci || savedCarne,
        telefono: user.telefono || savedTelefono,
        institucion: user.institucion || user.estudia_en || ''
      });

      void checkUserInscription();
    }
  }, [user, id]);

  const fetchEventoData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventoService.getEvento(id);
      setEvento(data);

      // Cargar paquetes de pago si existen
      try {
        const pkgs = await pagoService.getEventPaymentPackages(id);
        setPackages(pkgs || []);
        if (pkgs && pkgs.length > 0) {
          setSelectedPackage(pkgs[0]);
        }
      } catch (_err) {
        // Paquetes no configurados o evento gratuito
        setPackages([]);
      }
    } catch (err) {
      console.error("Error al cargar evento:", err);
      setError(err.response?.data?.detail || "No se pudo cargar el evento solicitado.");
    } finally {
      setLoading(false);
    }
  };

  const checkUserInscription = async () => {
    try {
      const misInscripciones = await eventoService.getMisInscripciones();
      const existing = (misInscripciones || []).find(
        (i) => i.id_evento === Number.parseInt(id, 10) && i.id_estado !== 0 && i.estado_inscripcion !== "CANCELADA"
      );
      if (existing) {
        setIsInscribed(true);
        setInscripcionInfo(existing);
      }
    } catch (err) {
      console.warn("No se pudieron verificar inscripciones previas", err);
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    void navigator.clipboard.writeText(url);
    setCopied(true);
    if (notify) {
      notify(t("link_copied"), url, "success");
    }
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate(`/login?returnTo=/evento/${id}`);
      return;
    }

    if (user.activo === false || user.id_estado === 0) {
      notify("Cuenta inactiva", t("account_inactive_notice"), "error");
      return;
    }

    // Persistir datos de contacto localmente
    if (formData.carne) localStorage.setItem('meh_user_carne', formData.carne);
    if (formData.telefono) localStorage.setItem('meh_user_telefono', formData.telefono);

    setSubmitting(true);
    try {
      const isPaid = packages.length > 0;

      if (isPaid) {
        if (!selectedPackage) {
          notify("Validación", "Debes seleccionar un paquete de inscripción", "warning");
          setSubmitting(false);
          return;
        }
        if (!paymentFile) {
          notify("Validación", "Debes adjuntar el comprobante de pago", "warning");
          setSubmitting(false);
          return;
        }

        const inscripcionResponse = await eventoService.inscribirse(id);
        const idInscripcion = inscripcionResponse.id_inscripcion;

        const fData = new FormData();
        fData.append('id_referencia', idInscripcion);
        fData.append('tipo_referencia', 'EVENTO');
        fData.append('monto', selectedPackage.monto);
        fData.append('metodo_pago', 'TRANSFERENCIA');
        fData.append('file', paymentFile);

        await pagoService.uploadComprobanteOcr(fData);

        setIsInscribed(true);
        setInscripcionInfo({ ...inscripcionResponse, estado_inscripcion: 'PENDIENTE' });
        notify(
          "Inscripción registrada",
          "Comprobante enviado exitosamente. Tu ticket QR se activará al validar el pago.",
          "success"
        );
      } else {
        const inscripcionResponse = await eventoService.inscribirse(id);
        setIsInscribed(true);
        setInscripcionInfo(inscripcionResponse);

        if (inscripcionResponse.estado_inscripcion === "PENDIENTE_APROBACION") {
          notify(
            "Lista de Espera",
            "Has sido registrado en la lista de espera. Te notificaremos si se abren nuevos cupos.",
            "info"
          );
        } else {
          notify(
            "¡Inscripción Confirmada!",
            "Tu entrada y ticket QR han sido generados y enviados a tu correo.",
            "success"
          );
        }
      }

      await fetchEventoData();
    } catch (err) {
      console.error("Error al procesar inscripción:", err);
      const detail = err.response?.data?.detail || "No se pudo procesar la inscripción";
      notify("Error", detail, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(i18n.language === 'en' ? 'en-US' : 'es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Cálculos de cupos
  const cuposMax = evento?.capacidad_maxima ?? evento?.capacidad_max ?? 50;
  const cuposOcupados = evento?.cupos_ocupados ?? 0;
  const cuposDisponibles = evento?.cupos_disponibles !== undefined 
    ? evento.cupos_disponibles 
    : Math.max(0, cuposMax - cuposOcupados);
  const isSoldOut = cuposDisponibles <= 0;

  // Entrega de incluidos
  const parseIncluidos = () => {
    const list = [];
    if (evento?.refrigerio_incluido) list.push("Refrigerio / Coffee Break");
    if (evento?.incluidos) {
      if (typeof evento.incluidos === 'string') {
        evento.incluidos.split(',').map(s => s.trim()).filter(Boolean).forEach(p => {
          if (!list.includes(p)) list.push(p);
        });
      } else if (Array.isArray(evento.incluidos)) {
        evento.incluidos.forEach(p => {
          if (p && !list.includes(p)) list.push(p);
        });
      }
    }
    return list;
  };
  const incluidosList = parseIncluidos();

  // Parse de agenda JSON si existe
  let agendaItems = [];
  if (evento?.agenda) {
    try {
      agendaItems = typeof evento.agenda === 'string' ? JSON.parse(evento.agenda) : evento.agenda;
    } catch (_) {
      agendaItems = [];
    }
  }

  const isUserInactive = user && (user.activo === false || user.id_estado === 0);

  return (
    <div className={styles.container}>
      <div className={styles.glow} />

      {/* Barra de Navegación Pública */}
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <MEHButton 
            appearance="subtle" 
            size="small" 
            icon={<ArrowLeft24Regular />} 
            onClick={() => navigate('/')}
            title={t("return_home")}
          />
          <Link to="/" className={styles.logoContainer}>
            <img src={designTokens.logo} alt="MEH Logo" className={styles.logo} />
            <MEHTypography variant="h3" style={{ fontWeight: tokens.fontWeightBold, letterSpacing: '-0.5px' }}>
              Plataforma MEH
            </MEHTypography>
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MEHButton
            appearance="subtle"
            icon={<Translate24Regular />}
            onClick={() => i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es')}
            title="Cambiar Idioma / Change Language"
          />
          <MEHButton
            appearance="subtle"
            icon={currentTheme === 'light' ? <WeatherMoon24Regular /> : <WeatherSunny24Regular />}
            onClick={toggleTheme}
            title="Cambiar Tema"
          />

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '8px' }}>
              <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                <MEHButton appearance="primary" size="small">
                  {t("dashboard")}
                </MEHButton>
              </Link>
              <Avatar name={`${user.nombres} ${user.apellidos}`} size={32} />
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
              <Link to={`/login?returnTo=/evento/${id}`} style={{ textDecoration: 'none' }}>
                <MEHButton appearance="outline" size="small">
                  {t("enter_portal")}
                </MEHButton>
              </Link>
              <Link to={`/register?returnTo=/evento/${id}`} style={{ textDecoration: 'none' }}>
                <MEHButton appearance="primary" size="small">
                  {t("join_here")}
                </MEHButton>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Contenido Principal */}
      <main className={styles.mainWrapper}>
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '16px' }}>
            <Spinner size="large" label="Cargando detalles del evento..." />
          </div>
        )}
        {!loading && (error || !evento) && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '20px', textAlign: 'center' }}>
            <Warning24Regular style={{ fontSize: '48px', color: tokens.colorPaletteYellowForeground1 }} />
            <MEHTypography variant="h2">{error || "Evento no encontrado"}</MEHTypography>
            <MEHButton appearance="primary" onClick={() => navigate('/')}>
              Volver a la Página Principal
            </MEHButton>
          </div>
        )}
        {!loading && !error && Boolean(evento) && (
          <>
            {/* Banner Hero */}
            <img 
              src={resolveApiFileUrl(evento.imagen_url) || DEFAULT_EVENT_IMG} 
              alt={evento.titulo} 
              className={styles.heroBanner}
            />

            <div className={styles.contentGrid}>
              {/* Columna Izquierda: Detalles Completos del Evento */}
              <div className={styles.leftColumn}>
                <div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <Badge color="brand" appearance="filled" size="large">
                      {evento.tipo_evento}
                    </Badge>
                    <Badge color={evento.modalidad === 'VIRTUAL' ? 'informative' : 'success'} appearance="tint" size="large">
                      {evento.modalidad === 'VIRTUAL' ? <Video24Regular style={{ marginRight: '4px' }} /> : <Map24Regular style={{ marginRight: '4px' }} />}
                      {evento.modalidad}
                    </Badge>
                    {isSoldOut ? (
                      <Badge color="warning" appearance="tint" size="large">
                        {t("event_sold_out")}
                      </Badge>
                    ) : (
                      <Badge color="success" appearance="tint" size="large">
                        {cuposDisponibles} {t("event_spots_available")}
                      </Badge>
                    )}
                  </div>

                  <MEHTypography variant="h1" style={{ fontSize: '2.5rem', lineHeight: '1.2', fontWeight: tokens.fontWeightBlack, marginBottom: '16px' }}>
                    {evento.titulo}
                  </MEHTypography>

                  <div className={styles.organizerBadge}>
                    <Avatar name="Microsoft Education Hub" size={32} />
                    <div>
                      <MEHTypography variant="caption" style={{ opacity: 0.6, display: 'block' }}>
                        {t("event_organized_by")}
                      </MEHTypography>
                      <MEHTypography variant="body" style={{ fontWeight: tokens.fontWeightBold }}>
                        Microsoft Education Hub (MEH)
                      </MEHTypography>
                    </div>
                  </div>
                </div>

                <Divider />

                {/* Fecha y Hora Detalle */}
                <div className={styles.infoSection}>
                  <MEHTypography variant="h3" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CalendarLtr24Regular style={{ color: tokens.colorBrandForeground1 }} /> {t("event_date_time")}
                  </MEHTypography>
                  <MEHTypography variant="body" style={{ fontSize: '1.1rem', textTransform: 'capitalize' }}>
                    📅 {formatDate(evento.fecha_inicio)}
                  </MEHTypography>
                  {evento.hora_inicio && (
                    <MEHTypography variant="body" style={{ opacity: 0.8, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock24Regular /> {evento.hora_inicio} {evento.hora_fin ? ` - ${evento.hora_fin}` : ''}
                    </MEHTypography>
                  )}
                </div>

                {/* Ubicación Detalle */}
                <div className={styles.infoSection}>
                  <MEHTypography variant="h3" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Map24Regular style={{ color: tokens.colorBrandForeground1 }} /> {t("event_location")}
                  </MEHTypography>
                  <MEHTypography variant="body" style={{ fontSize: '1.05rem' }}>
                    {evento.ubicacion || (evento.modalidad === 'VIRTUAL' ? "Sesión Virtual en Microsoft Teams" : "Por definir")}
                  </MEHTypography>
                  {evento.link_mapas && (
                    <a 
                      href={evento.link_mapas} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: tokens.colorBrandForeground1, display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: tokens.fontWeightBold, textDecoration: 'none' }}
                    >
                      <Link24Regular /> Ver ubicación en Google Maps 🗺️
                    </a>
                  )}
                </div>

                <Divider />

                {/* Descripción Completa (Sin truncar) */}
                <div className={styles.infoSection}>
                  <MEHTypography variant="h3">Acerca de este evento</MEHTypography>
                  <MEHTypography className={styles.descriptionText}>
                    {evento.descripcion || "Participa en este evento exclusivo organizado por la comunidad tecnológica de Microsoft Education Hub."}
                  </MEHTypography>
                </div>

                {/* Incluidos y Entregables */}
                {incluidosList.length > 0 && (
                  <div className={styles.infoSection}>
                    <MEHTypography variant="h3" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Gift24Regular style={{ color: tokens.colorBrandForeground1 }} /> {t("event_included_perks")}
                    </MEHTypography>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {incluidosList.map((item, idx) => (
                        <Badge key={`perk-${item}-${idx}`} color="brand" appearance="tint" size="large" style={{ padding: '8px 14px' }}>
                          🎁 {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ponentes / Speakers */}
                {evento.speakers && evento.speakers.length > 0 && (
                  <div className={styles.infoSection}>
                    <MEHTypography variant="h3" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mic24Regular style={{ color: tokens.colorBrandForeground1 }} /> {t("event_speakers")}
                    </MEHTypography>
                    <div className={styles.speakersGrid}>
                      {evento.speakers.map((spk) => (
                        <div key={spk.id_speaker} className={styles.speakerCard}>
                          <Avatar size={48} name={spk.nombre} image={{ src: resolveApiFileUrl(spk.foto_url) }} />
                          <div>
                            <MEHTypography variant="body" style={{ fontWeight: tokens.fontWeightBold, display: 'block' }}>
                              {spk.nombre}
                            </MEHTypography>
                            <MEHTypography variant="caption" style={{ opacity: 0.6 }}>
                              Speaker Confirmado
                            </MEHTypography>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Agenda */}
                {agendaItems && agendaItems.length > 0 && (
                  <div className={styles.infoSection}>
                    <MEHTypography variant="h3">{t("event_schedule")}</MEHTypography>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {agendaItems.map((item, idx) => (
                        <div key={`agenda-${item.hora || idx}-${item.titulo || item.title || idx}`} className={styles.agendaItem}>
                          <div style={{ fontWeight: tokens.fontWeightBold, color: tokens.colorBrandForeground1, minWidth: '80px' }}>
                            {item.hora || item.time || `Bloque ${idx + 1}`}
                          </div>
                          <div>
                            <div style={{ fontWeight: tokens.fontWeightBold }}>{item.titulo || item.title || item.tema}</div>
                            {item.descripcion && (
                              <div style={{ opacity: 0.7, fontSize: '0.9rem', marginTop: '2px' }}>{item.descripcion}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comunidades Aliadas y Auspiciadores */}
                {((evento.auspiciadores && evento.auspiciadores.length > 0) || (evento.comunidades && evento.comunidades.length > 0)) && (
                  <div className={styles.infoSection}>
                    <MEHTypography variant="h3">Aliados y Auspiciadores</MEHTypography>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {evento.auspiciadores?.map(a => (
                        <div key={a.id_auspiciador} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px' }}>
                          {a.logo_url && <img src={resolveApiFileUrl(a.logo_url)} alt={a.nombre} style={{ height: '24px', objectFit: 'contain' }} />}
                          <span>{a.nombre}</span>
                        </div>
                      ))}
                      {evento.comunidades?.map(c => (
                        <div key={c.id_comunidad} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px' }}>
                          {c.logo_url && <img src={resolveApiFileUrl(c.logo_url)} alt={c.nombre} style={{ height: '24px', objectFit: 'contain' }} />}
                          <span>{c.nombre}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Columna Derecha: Tarjeta de Registro y Acción (Sticky Luma Style) */}
              <div className={styles.rightColumn}>
                <MEHCard className={styles.actionCard}>
                  {/* Resumen Superior */}
                  <div>
                    <MEHTypography variant="caption" style={{ textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, fontWeight: tokens.fontWeightBold }}>
                      Registro Oficial
                    </MEHTypography>
                    <MEHTypography variant="h2" style={{ marginTop: '4px', fontSize: '1.6rem' }}>
                      {packages.length > 0 ? "Evento con Aporte / Paquete" : "Acceso Gratuito"}
                    </MEHTypography>
                  </div>

                  {/* Estado de Cupos */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <People24Regular style={{ color: tokens.colorBrandForeground1 }} />
                      <span style={{ fontSize: '0.95rem' }}>Disponibilidad</span>
                    </div>
                    <Badge color={isSoldOut ? "warning" : "success"} appearance="filled">
                      {isSoldOut ? "Agotado (Espera)" : `${cuposDisponibles} cupos libres`}
                    </Badge>
                  </div>

                  {/* CASO 1: CUENTA INACTIVA */}
                  {isUserInactive && (
                    <MessageBar intent="error">
                      <MessageBarBody>
                        <MEHTypography variant="body" style={{ fontWeight: tokens.fontWeightBold, display: 'block', marginBottom: '4px' }}>
                          Cuenta Inactiva
                        </MEHTypography>
                        {t("account_inactive_notice")}
                      </MessageBarBody>
                    </MessageBar>
                  )}

                  {/* CASO 2: YA INSCRITO */}
                  {user && !isUserInactive && isInscribed && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px', backgroundColor: 'rgba(34, 177, 76, 0.08)', borderRadius: '14px', border: '1px solid rgba(34, 177, 76, 0.25)', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: tokens.colorPaletteGreenForeground1 }}>
                        <CheckmarkCircle24Filled fontSize="24px" />
                        <MEHTypography variant="h3" style={{ margin: 0 }}>
                          {t("already_inscribed")}
                        </MEHTypography>
                      </div>
                      <Badge 
                        appearance="filled" 
                        color={getInscripcionBadgeColor(inscripcionInfo?.estado_inscripcion)}
                        style={{ alignSelf: 'center', padding: '6px 14px' }}
                      >
                        Estado: {inscripcionInfo?.estado_inscripcion || 'CONFIRMADA'}
                      </Badge>
                      <MEHTypography variant="caption" style={{ opacity: 0.8 }}>
                        Puedes consultar tu ticket de acceso e insignias desde el portal principal.
                      </MEHTypography>
                      <MEHButton appearance="primary" onClick={() => navigate('/dashboard')}>
                        Ver en mi Portal
                      </MEHButton>
                    </div>
                  )}

                  {/* CASO 3: SIN SESIÓN (CTA con returnTo) */}
                  {!user && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <MessageBar intent="info">
                        <MessageBarBody>
                          {t("login_to_register_prompt")}
                        </MessageBarBody>
                      </MessageBar>

                      <MEHButton 
                        appearance="primary" 
                        size="large" 
                        style={{ height: '52px', fontWeight: tokens.fontWeightBold }}
                        onClick={() => navigate(`/login?returnTo=/evento/${id}`)}
                      >
                        {isSoldOut ? t("join_waitlist") : t("join_event")}
                      </MEHButton>

                      <div style={{ textAlign: 'center' }}>
                        <MEHTypography variant="caption" style={{ opacity: 0.7 }}>
                          ¿No tienes cuenta aún?{' '}
                          <Link 
                            to={`/register?returnTo=/evento/${id}`} 
                            style={{ color: tokens.colorBrandForeground1, fontWeight: 'bold', textDecoration: 'none' }}
                          >
                            {t("join_here")}
                          </Link>
                        </MEHTypography>
                      </div>
                    </div>
                  )}

                  {/* CASO 4: SESIÓN ACTIVA Y NO INSCRITO (Formulario con Autocompletado) */}
                  {user && !isUserInactive && !isInscribed && (
                    <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <MEHTypography variant="caption" style={{ fontWeight: 'bold', color: tokens.colorBrandForeground1 }}>
                        {t("personal_details")} (Autocompletado)
                      </MEHTypography>

                      <Field label="Nombre Completo" required>
                        <Input 
                          value={formData.nombreCompleto} 
                          onChange={(e, d) => setFormData({ ...formData, nombreCompleto: d.value })}
                          placeholder="Tu nombre completo"
                          required
                        />
                      </Field>

                      <Field label="Correo Electrónico" required>
                        <Input 
                          type="email"
                          value={formData.correo} 
                          onChange={(e, d) => setFormData({ ...formData, correo: d.value })}
                          placeholder="tu@correo.com"
                          required
                        />
                      </Field>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <Field label={t("id_card")} required>
                          <Input 
                            value={formData.carne} 
                            onChange={(e, d) => setFormData({ ...formData, carne: d.value })}
                            placeholder="Ej: 8392102 LP"
                            required
                          />
                        </Field>

                        <Field label={t("phone_whatsapp")} required>
                          <Input 
                            value={formData.telefono} 
                            onChange={(e, d) => setFormData({ ...formData, telefono: d.value })}
                            placeholder="Ej: 77712345"
                            required
                          />
                        </Field>
                      </div>

                      {/* Paquetes de Pago (si aplica) */}
                      {packages.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
                          <Field label="Seleccionar Paquete de Pago" required>
                            <Select 
                              value={selectedPackage?.id_paquete || ''} 
                              onChange={(e) => {
                                const found = packages.find(p => String(p.id_paquete) === String(e.target.value));
                                setSelectedPackage(found || null);
                              }}
                            >
                              {packages.map(p => (
                                <option key={p.id_paquete} value={p.id_paquete}>
                                  {p.nombre_paquete} - Bs. {p.monto}
                                </option>
                              ))}
                            </Select>
                          </Field>

                          {selectedPackage?.url_qr && (
                            <div style={{ textAlign: 'center', padding: '12px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                              <img 
                                src={resolveApiFileUrl(selectedPackage.url_qr)} 
                                alt="QR de Pago" 
                                style={{ width: '160px', height: '160px', objectFit: 'contain', backgroundColor: '#fff', padding: '8px', borderRadius: '8px' }} 
                              />
                              <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '6px' }}>
                                Escanea este código QR para realizar la transferencia de Bs. {selectedPackage.monto}.
                              </div>
                            </div>
                          )}

                          <Field label={t("upload_payment_proof")} required>
                            <div className={styles.uploadArea}>
                              <input 
                                type="file" 
                                accept="image/*,application/pdf" 
                                className={styles.fileInput} 
                                onChange={(e) => setPaymentFile(e.target.files[0])}
                                required
                              />
                              <ReceiptMoney24Filled style={{ fontSize: '24px', opacity: 0.7, margin: '0 auto 6px auto', display: 'block' }} />
                              <span style={{ fontSize: '0.85rem' }}>
                                {paymentFile ? paymentFile.name : "Subir comprobante (PNG, JPG, PDF)"}
                              </span>
                            </div>
                          </Field>
                        </div>
                      )}

                      <MEHButton 
                        appearance="primary" 
                        size="large" 
                        type="submit"
                        loading={submitting}
                        disabled={submitting}
                        style={{ height: '50px', marginTop: '8px', fontWeight: tokens.fontWeightBold }}
                      >
                        {isSoldOut ? t("join_waitlist") : t("confirm_spot")}
                      </MEHButton>
                    </form>
                  )}

                  <Divider />

                  {/* Botón Copiar Link */}
                  <MEHButton 
                    appearance="subtle" 
                    icon={copied ? <CheckmarkCircle24Filled style={{ color: tokens.colorPaletteGreenForeground1 }} /> : <Share24Regular />}
                    onClick={handleCopyLink}
                    style={{ width: '100%' }}
                  >
                    {copied ? t("link_copied") : t("copy_link")}
                  </MEHButton>
                </MEHCard>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default EventoPublico;

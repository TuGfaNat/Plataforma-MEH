import React, { useState, useEffect } from 'react';
import { 
  makeStyles, 
  shorthands, 
  tokens,
  Input,
  Spinner,
  Badge
} from '@fluentui/react-components';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { designTokens } from '../theme/theme';
import { MEHButton, MEHCard, MEHTypography } from '../components/ui';
import { useTheme } from '../App';
import eventoService from '../services/eventoService';
import cursoService from '../services/cursoService';

import { 
  CalendarStar24Regular,
  Certificate24Regular,
  Globe24Regular,
  ShieldCheckmark24Filled,
  Search24Regular,
  CalendarClock24Regular,
  Location24Regular,
  Video24Regular,
  Library24Regular,
  Book24Regular,
  WeatherMoon24Regular,
  WeatherSunny24Regular,
  Translate24Regular
} from '@fluentui/react-icons';

import { MEHFooter } from '../components/layout/MEHFooter';
import LearningPathModal from '../components/LearningPathModal';

const useStyles = makeStyles({
  container: {
    minHeight: '100vh',
    color: tokens.colorNeutralForeground1,
    backgroundColor: tokens.colorNeutralBackground1,
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden',
    position: 'relative',
    zIndex: 1,
  },
  header: {
    ...shorthands.padding('24px', '40px'),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    width: '100%',
    boxSizing: 'border-box',
    zIndex: 10,
    [designTokens.breakpoints.sm]: {
      ...shorthands.padding('20px'),
    }
  },
  headerButton: {
    ...shorthands.border('1px', 'solid', 'rgba(255, 255, 255, 0.1)'),
    transition: 'all 0.2s ease',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(10px)',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      transform: 'translateY(-2px)',
    }
  },
  hero: {
    height: '95vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    ...shorthands.padding('0', '24px'),
    position: 'relative',
    zIndex: 1,
  },
  heroContent: {
    zIndex: 2,
    maxWidth: '900px',
    animationName: {
      from: { opacity: 0, transform: 'translateY(20px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    animationDuration: '1s',
    animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    animationFillMode: 'forwards',
  },
  title: {
    fontSize: '5.5rem',
    fontWeight: tokens.fontWeightBlack,
    lineHeight: '1.05',
    marginBottom: '32px',
    background: `linear-gradient(to right, #ffffff, ${tokens.colorBrandForeground1})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    [designTokens.breakpoints.sm]: {
      fontSize: '3.5rem',
    }
  },
  subtitle: {
    marginBottom: '80px', 
    opacity: 0.8, 
    fontWeight: tokens.fontWeightRegular,
    maxWidth: '600px',
    marginRight: 'auto',
    marginLeft: 'auto',
  },
  buttonGroup: {
    display: 'flex', 
    ...shorthands.gap('24px'), 
    justifyContent: 'center', 
    flexWrap: 'wrap',
    marginTop: '20px'
  },
  primaryButton: {
    paddingLeft: '48px',
    paddingRight: '48px',
    height: '56px',
    fontSize: tokens.fontSizeBase400,
    backgroundColor: tokens.colorBrandBackground,
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'scale(1.05)',
      boxShadow: `0 0 30px ${tokens.colorBrandBackground2}`,
    }
  },
  secondaryButton: {
    paddingLeft: '48px',
    paddingRight: '48px',
    height: '56px',
    fontSize: tokens.fontSizeBase400,
    backgroundColor: 'transparent',
    ...shorthands.border('1px', 'solid', 'rgba(255, 255, 255, 0.2)'),
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    ':hover': {
      transform: 'scale(1.05)',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    }
  },
  section: {
    ...shorthands.padding('100px', '24px'),
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
    position: 'relative',
    zIndex: 2,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    ...shorthands.gap('32px'),
    marginTop: '48px',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    backdropFilter: 'blur(16px)',
    ...shorthands.padding(0),
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    ...shorthands.border('1px', 'solid', 'rgba(255, 255, 255, 0.05)'),
    ...shorthands.borderRadius('24px'),
    overflow: 'hidden',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
      ...shorthands.border('1px', 'solid', 'rgba(127, 19, 236, 0.3)'),
      transform: 'translateY(-10px)',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
    }
  },
  cardContent: {
    ...shorthands.padding('24px'),
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  cardImage: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
    backgroundColor: tokens.colorNeutralBackground3,
    opacity: 0.9,
  },
  dateBadge: {
    backgroundColor: 'rgba(127, 19, 236, 0.15)',
    ...shorthands.padding('12px'),
    ...shorthands.borderRadius('16px'),
    ...shorthands.border('1px', 'solid', 'rgba(127, 19, 236, 0.2)'),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '60px',
    color: tokens.colorBrandForeground1,
    fontWeight: 'bold',
  },
  validatorSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    ...shorthands.padding('120px', '24px'),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '24px',
    ...shorthands.borderTop('1px', 'solid', 'rgba(255, 255, 255, 0.05)'),
    ...shorthands.borderBottom('1px', 'solid', 'rgba(255, 255, 255, 0.05)'),
    position: 'relative',
    zIndex: 2,
  },
  validatorBox: {
    width: '100%',
    maxWidth: '600px',
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    ...shorthands.padding('8px'),
    ...shorthands.borderRadius('16px'),
    ...shorthands.border('1px', 'solid', 'rgba(255, 255, 255, 0.05)'),
    [designTokens.breakpoints.sm]: {
      flexDirection: 'column',
    }
  }
});

const Landing = () => {
  const styles = useStyles();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  
  const [eventos, setEventos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [certCode, setCertCode] = useState('');

  const changeLanguage = () => {
    const nextLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(nextLang);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventosData, cursosData] = await Promise.all([
          eventoService.getEventos(),
          cursoService.getCursos()
        ]);
        setEventos(eventosData.filter(e => e.estado === 'PROGRAMADO').slice(0, 3));
        setCursos(cursosData.filter(c => c.estado === 'ACTIVO').slice(0, 3));
      } catch (err) {
        console.error("Error cargando datos públicos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleVerify = () => {
    if (certCode.trim()) {
      navigate(`/verificar/${certCode.trim()}`);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    return { day: d.getDate(), month: months[d.getMonth()] };
  };

  const DEFAULT_EVENT_IMG = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop";
  const DEFAULT_COURSE_IMG = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop";

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={designTokens.logo} alt="logo" style={{ width: '40px' }} />
          <MEHTypography variant="h3" style={{ fontWeight: tokens.fontWeightBold }}>MEH</MEHTypography>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MEHButton 
            appearance="subtle"
            onClick={() => navigate('/validador')}
            style={{ marginRight: '8px' }}
          >
            {t('verificar_talento')}
          </MEHButton>
          <MEHButton 
            appearance="subtle" 
            icon={<Translate24Regular />} 
            onClick={changeLanguage}
            title="Cambiar Idioma / Change Language"
          />
          <MEHButton 
            appearance="subtle" 
            icon={isDarkMode ? <WeatherSunny24Regular /> : <WeatherMoon24Regular />} 
            onClick={toggleTheme}
            title={isDarkMode ? "Modo Claro" : "Modo Oscuro"}
          />
          <Link to="/login" style={{ textDecoration: 'none', marginLeft: '12px' }}>
            <MEHButton shape="circular" appearance="outline" className={styles.headerButton}>
              {t('enter_portal')}
            </MEHButton>
          </Link>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>{t('hero_title')}</h1>
          <MEHTypography variant="h3" className={styles.subtitle}>
            {t('hero_subtitle')}
          </MEHTypography>
          <div className={styles.buttonGroup}>
            <MEHButton className={styles.primaryButton} onClick={() => document.getElementById('calendario').scrollIntoView({ behavior: 'smooth' })}>
              {t('explore_events')}
            </MEHButton>
            <MEHButton className={styles.secondaryButton} appearance="outline" onClick={() => navigate('/login')}>
              {t('enter_portal')}
            </MEHButton>
          </div>
        </div>
      </section>

      {/* Sección: Calendario de Eventos */}
      <section id="calendario" className={styles.section}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <MEHTypography variant="h1" style={{ display: 'block', marginBottom: '12px', fontSize: '3rem' }}>{t('next_talleres')}</MEHTypography>
          <MEHTypography variant="body" style={{ opacity: 0.8, fontSize: '1.2rem' }}>
            {t('exclusive_events_desc')}
          </MEHTypography>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Spinner label="Cargando eventos..." /></div>
        ) : (
          <div className={styles.grid}>
            {eventos.map(evento => {
              const { day, month } = formatDate(evento.fecha_inicio);
              return (
                <MEHCard key={evento.id_evento} className={styles.card}>
                  <img src={evento.imagen_url || DEFAULT_EVENT_IMG} alt="banner" className={styles.cardImage} />
                  <div className={styles.cardContent}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                        <div className={styles.dateBadge}>
                        <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{month}</span>
                        <span style={{ fontSize: '1.5rem' }}>{day}</span>
                        </div>
                        <div style={{ flexGrow: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <Badge appearance="tint" color="brand">{evento.modalidad}</Badge>
                        </div>
                        <MEHTypography variant="h3" style={{ display: 'block', marginBottom: '8px' }}>{evento.titulo}</MEHTypography>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.6, fontSize: '0.9rem' }}>
                            {evento.modalidad === 'VIRTUAL' ? <Video24Regular style={{ fontSize: '16px' }} /> : <Location24Regular style={{ fontSize: '16px' }} />}
                            {evento.ubicacion || 'Sesión en línea'}
                        </div>
                        </div>
                    </div>
                    <MEHTypography variant="caption" style={{ opacity: 0.8, minHeight: '40px', display: 'block', lineHeight: '1.6' }}>
                        {evento.descripcion ? (evento.descripcion.substring(0, 100) + '...') : 'Aprende las últimas tecnologías de Microsoft con expertos.'}
                    </MEHTypography>
                    <MEHButton appearance="primary" icon={<CalendarClock24Regular />} onClick={() => navigate('/login')}>
                        {t('asegurar_lugar')}
                    </MEHButton>
                  </div>
                </MEHCard>
              );
            })}
          </div>
        )}
      </section>

      {/* Nueva Sección: Cursos Disponibles */}
      <section id="cursos" className={styles.section} style={{ paddingTop: 0 }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <MEHTypography variant="h1" style={{ display: 'block', marginBottom: '12px', fontSize: '3rem' }}>{t('rutas_aprendizaje')}</MEHTypography>
          <MEHTypography variant="body" style={{ opacity: 0.8, fontSize: '1.2rem' }}>
            Cursos diseñados para llevar tu carrera al siguiente nivel tecnológico.
          </MEHTypography>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Spinner label="Cargando rutas..." /></div>
        ) : (
          <div className={styles.grid}>
            {cursos.map(curso => (
              <MEHCard key={curso.id_curso} className={styles.card}>
                <img src={curso.imagen_url || DEFAULT_COURSE_IMG} alt="banner" className={styles.cardImage} />
                <div className={styles.cardContent}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ backgroundColor: 'rgba(127, 19, 236, 0.1)', padding: '10px', borderRadius: '12px' }}>
                        <Library24Regular style={{ fontSize: '24px', color: tokens.colorBrandForeground1 }} />
                    </div>
                    <div style={{ flexGrow: 1 }}>
                        <MEHTypography variant="h3" style={{ display: 'block' }}>{curso.nombre_curso}</MEHTypography>
                        <MEHTypography variant="caption" style={{ opacity: 0.6 }}>{curso.horas_academicas} {t('horas_academicas')}</MEHTypography>
                    </div>
                    </div>
                    <MEHTypography variant="caption" style={{ opacity: 0.8, minHeight: '40px', display: 'block', lineHeight: '1.6' }}>
                    {curso.descripcion ? (curso.descripcion.substring(0, 100) + '...') : 'Domina herramientas y conceptos clave para el mercado laboral actual.'}
                    </MEHTypography>
                    <LearningPathModal curso={curso} />
                </div>
              </MEHCard>
            ))}
          </div>
        )}
      </section>

      {/* Validador de Certificados */}
      <section id="validator" className={styles.validatorSection}>
        <ShieldCheckmark24Filled style={{ fontSize: '48px', color: tokens.colorBrandForeground1 }} />
        <MEHTypography variant="h2">{t('verificar_talento')}</MEHTypography>
        <MEHTypography variant="body" style={{ maxWidth: '600px', opacity: 0.8, fontSize: '1.1rem' }}>
          ¿Deseas verificar la autenticidad de una credencial emitida por MEH? Ingresa el código único del certificado a continuación.
        </MEHTypography>
        
        <div className={styles.validatorBox}>
          <Input 
            size="large" 
            placeholder="Ej: 550e8400-e29b..." 
            style={{ flexGrow: 1, backgroundColor: 'transparent' }}
            contentBefore={<Search24Regular />}
            value={certCode}
            onChange={(e, data) => setCertCode(data.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
          />
          <MEHButton appearance="primary" size="large" onClick={handleVerify}>
            {t('verificar_ahora')}
          </MEHButton>
        </div>
      </section>

      <MEHFooter />
    </div>
  );
};

export default Landing;

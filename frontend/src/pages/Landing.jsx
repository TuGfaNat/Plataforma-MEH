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
import eventoService from '../services/eventoService';

import { 
  CalendarStar24Regular,
  Certificate24Regular,
  Globe24Regular,
  ShieldCheckmark24Filled,
  Search24Regular,
  CalendarClock24Regular,
  Location24Regular,
  Video24Regular
} from '@fluentui/react-icons';

import { MEHFooter } from '../components/layout/MEHFooter';

const useStyles = makeStyles({
  container: {
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground4,
    color: tokens.colorNeutralForeground1,
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden'
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
    ...shorthands.border('1px', 'solid', tokens.colorBrandStroke1),
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: tokens.colorBrandBackground2,
      transform: 'translateY(-2px)',
    }
  },
  hero: {
    height: '90vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    ...shorthands.padding('0', '24px'),
    background: `radial-gradient(circle at center, ${tokens.colorBrandBackground2} 0%, ${tokens.colorNeutralBackground4} 80%)`,
    position: 'relative',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: '800px',
    height: '800px',
    background: tokens.colorBrandBackground2,
    filter: 'blur(120px)',
    ...shorthands.borderRadius('50%'),
    opacity: 0.3,
    zIndex: 0,
  },
  heroContent: {
    zIndex: 1,
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
    background: `linear-gradient(to right, ${tokens.colorNeutralForeground1}, ${tokens.colorBrandForeground1})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    [designTokens.breakpoints.sm]: {
      fontSize: '3.5rem',
    }
  },
  subtitle: {
    marginBottom: '80px', 
    opacity: 0.7, 
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
    boxShadow: `0 8px 16px -4px ${tokens.colorBrandBackground2}`,
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'scale(1.05)',
      boxShadow: `0 12px 24px -6px ${tokens.colorBrandBackground2}`,
    }
  },
  secondaryButton: {
    paddingLeft: '48px',
    paddingRight: '48px',
    height: '56px',
    fontSize: tokens.fontSizeBase400,
    transition: 'all 0.3s ease',
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
  },
  eventsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    ...shorthands.gap('24px'),
    marginTop: '40px',
  },
  eventCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    ...shorthands.padding('24px'),
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    transition: 'all 0.3s ease',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      ...shorthands.border('1px', 'solid', tokens.colorBrandStroke1),
      transform: 'translateY(-5px)',
    }
  },
  dateBadge: {
    backgroundColor: tokens.colorBrandBackground2,
    ...shorthands.padding('12px'),
    ...shorthands.borderRadius('12px'),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '60px',
    color: tokens.colorBrandForeground1,
    fontWeight: 'bold',
  },
  validatorSection: {
    backgroundColor: 'rgba(127, 19, 236, 0.05)',
    ...shorthands.padding('80px', '24px'),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '24px',
    ...shorthands.borderTop('1px', 'solid', 'rgba(255,255,255,0.05)'),
    ...shorthands.borderBottom('1px', 'solid', 'rgba(255,255,255,0.05)'),
  },
  validatorBox: {
    width: '100%',
    maxWidth: '500px',
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
    [designTokens.breakpoints.sm]: {
      flexDirection: 'column',
    }
  }
});

const Landing = () => {
  const styles = useStyles();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [certCode, setCertCode] = useState('');

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const data = await eventoService.getEventos();
        // Solo mostrar eventos futuros o programados
        setEventos(data.filter(e => e.estado === 'PROGRAMADO').slice(0, 6));
      } catch (err) {
        console.error("Error cargando eventos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEventos();
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

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={designTokens.logo} alt="logo" style={{ width: '40px' }} />
          <MEHTypography variant="h3" style={{ fontWeight: tokens.fontWeightBold }}>MEH</MEHTypography>
        </div>
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <MEHButton shape="circular" appearance="outline" className={styles.headerButton}>
            {t('enter_portal')}
          </MEHButton>
        </Link>
      </header>

      <section className={styles.hero}>
        <div className={styles.glow}></div>
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

      {/* Nueva Sección: Calendario de Eventos */}
      <section id="calendario" className={styles.section}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <MEHTypography variant="h1" style={{ display: 'block', marginBottom: '12px' }}>Próximos Talleres</MEHTypography>
          <MEHTypography variant="body" style={{ opacity: 0.6 }}>
            Únete a nuestras sesiones en vivo sobre Azure, Inteligencia Artificial y Desarrollo.
          </MEHTypography>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Spinner label="Cargando eventos de la comunidad..." /></div>
        ) : (
          <div className={styles.eventsGrid}>
            {eventos.map(evento => {
              const { day, month } = formatDate(evento.fecha_inicio);
              return (
                <MEHCard key={evento.id_evento} className={styles.eventCard}>
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
                  <MEHTypography variant="caption" style={{ opacity: 0.7, minHeight: '40px', display: 'block' }}>
                    {evento.descripcion ? (evento.descripcion.substring(0, 100) + '...') : 'Aprende las últimas tecnologías de Microsoft con expertos de la industria.'}
                  </MEHTypography>
                  <MEHButton appearance="primary" icon={<CalendarClock24Regular />} onClick={() => navigate('/login')}>
                    Asegurar mi lugar
                  </MEHButton>
                </MEHCard>
              );
            })}
            {eventos.length === 0 && (
              <MEHTypography variant="body" style={{ gridColumn: '1 / -1', textAlign: 'center', opacity: 0.5, padding: '40px' }}>
                Estamos programando nuevos talleres. ¡Vuelve pronto!
              </MEHTypography>
            )}
          </div>
        )}
      </section>

      {/* Validador de Certificados */}
      <section id="validator" className={styles.validatorSection}>
        <ShieldCheckmark24Filled style={{ fontSize: '48px', color: tokens.colorBrandForeground1 }} />
        <MEHTypography variant="h2">Validador de Talento</MEHTypography>
        <MEHTypography variant="body" style={{ maxWidth: '600px', opacity: 0.7 }}>
          ¿Deseas verificar la autenticidad de una credencial emitida por MEH? Ingresa el código único del certificado a continuación.
        </MEHTypography>
        
        <div className={styles.validatorBox}>
          <Input 
            size="large" 
            placeholder="Ej: 550e8400-e29b..." 
            style={{ flexGrow: 1 }}
            contentBefore={<Search24Regular />}
            value={certCode}
            onChange={(e, data) => setCertCode(data.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
          />
          <MEHButton appearance="primary" size="large" onClick={handleVerify}>
            Verificar ahora
          </MEHButton>
        </div>
      </section>

      <MEHFooter />
    </div>
  );
};

export default Landing;

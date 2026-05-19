import React, { useState, useEffect } from 'react';
import { 
  Avatar,
  ProgressBar,
  makeStyles,
  shorthands,
  tokens,
  Spinner,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions
} from '@fluentui/react-components';
import { 
  Alert24Regular,
  CalendarStar24Filled,
  Trophy24Filled,
  Reward24Filled,
  Mail24Filled,
  ChevronRight24Regular,
  ReceiptMoney24Filled,
  People24Filled,
  ShieldLock24Filled,
  CalendarStar24Regular,
  Target24Regular,
  QrCode24Regular,
  MegaphoneLoud24Filled
} from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { designTokens } from '../theme/theme';
import { useAuth } from '../App';
import { resolveApiFileUrl } from '../services/api';
import { MEHCard, MEHButton, MEHTypography } from '../components/ui';
import RankBenefitsTable from '../components/RankBenefitsTable';
import DashboardAnalytics from '../components/DashboardAnalytics';
import eventoService from '../services/eventoService';
import dashboardService from '../services/dashboardService';
import comunidadService from '../services/comunidadService';
import { QRCodeSVG } from 'qrcode.react';

const useStyles = makeStyles({
  dashboardContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    animationName: {
      from: { opacity: 0, transform: 'translateY(10px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    animationDuration: '0.5s',
  },
  welcomeHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '24px',
    ...shorthands.padding('40px'),
    position: 'relative',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, rgba(127, 19, 236, 0.1) 0%, rgba(255, 255, 255, 0.03) 100%)',
    '@media (max-width: 1024px)': {
      flexDirection: 'column',
      textAlign: 'center',
    }
  },
  welcomeText: {
    flexGrow: 1,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    ...shorthands.gap('24px'),
  },
  sectionTitle: {
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  eventItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    ...shorthands.padding('12px'),
    ...shorthands.borderRadius('12px'),
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    transition: 'all 0.2s ease',
    ...shorthands.border('1px', 'solid', 'rgba(255, 255, 255, 0.05)'),
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      transform: 'translateX(4px)',
    }
  },
  eventMiniature: {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    ...shorthands.borderRadius('8px'),
    backgroundColor: tokens.colorNeutralBackground3,
  },
  dateBox: {
    backgroundColor: tokens.colorBrandBackground2,
    ...shorthands.padding('4px', '8px'),
    ...shorthands.borderRadius('8px'),
    textAlign: 'center',
    minWidth: '45px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    ...shorthands.border('1px', 'solid', 'rgba(127, 19, 236, 0.2)'),
  },
  progressInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  badgeGlow: {
    filter: 'drop-shadow(0 0 15px rgba(127, 19, 236, 0.6))',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(1, 1fr)',
    gap: '20px',
    marginBottom: '8px',
    '@media (min-width: 600px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    '@media (min-width: 1024px)': {
      gridTemplateColumns: 'repeat(4, 1fr)',
    }
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
    '-webkit-overflow-scrolling': 'touch',
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    ':hover': {
        transform: 'scale(1.02)'
    }
  },
  growthIndicator: {
    backgroundColor: 'rgba(34, 177, 76, 0.1)',
    color: '#22B14C',
    ...shorthands.padding('4px', '12px'),
    ...shorthands.borderRadius('16px'),
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '8px'
  }
});

const Dashboard = () => {
  const styles = useStyles();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [eventos, setEventos] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [anuncios, setAnuncios] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventosData, statsData, inscripcionesData, anunciosData] = await Promise.all([
          eventoService.getEventos(),
          dashboardService.getStats(),
          eventoService.getMisInscripciones(),
          comunidadService.getAnuncios()
        ]);
        
        const proximos = eventosData
          .filter(e => e.estado === 'PROGRAMADO')
          .sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio))
          .slice(0, 3);
          
        setEventos(proximos);
        setStats(statsData);
        setInscripciones(inscripcionesData);
        setAnuncios(anunciosData.slice(0, 3));
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (!user) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><Spinner label="Cargando perfil..." /></div>;

  const fullName = `${user.nombres} ${user.apellidos}`;
  const canSeeAnalytics = stats?.advanced_metrics && Object.keys(stats.advanced_metrics).length > 0;
  
  // Lógica de roles: mostrar "Panel de Control" si es SuperAdmin
  const headerTitle = user.rol === 'ADMIN' ? 'Panel de Control' : 'Dashboard';

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    return {
      day: date.getDate(),
      month: months[date.getMonth()]
    };
  };

  const getIcon = (iconName) => {
    switch(iconName) {
      case 'ReceiptMoney': return <ReceiptMoney24Filled style={{ color: tokens.colorBrandForeground1, fontSize: '32px' }} />;
      case 'People': return <People24Filled style={{ color: tokens.colorBrandForeground1, fontSize: '32px' }} />;
      case 'ShieldLock': return <ShieldLock24Filled style={{ color: tokens.colorBrandForeground1, fontSize: '32px' }} />;
      case 'CalendarStar': return <CalendarStar24Filled style={{ color: tokens.colorBrandForeground1, fontSize: '32px' }} />;
      default: return <Alert24Regular />;
    }
  };

  const DEFAULT_EVENT_IMG = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop";

  return (
    <div className={styles.dashboardContainer}>
      {/* 1. Bienvenida */}
      <MEHCard className={styles.welcomeHeader}>
        <div style={{ position: 'relative' }}>
          <Avatar 
            size={128} 
            name={fullName} 
            image={user.foto_url ? { src: resolveApiFileUrl(user.foto_url) } : undefined}
            color="colorful" 
          />
          <div style={{ position: 'absolute', bottom: '0', right: '0', width: '45px', height: '45px' }}>
            <Reward24Filled className={styles.badgeGlow} style={{ color: user.rol === 'EMBAJADOR' ? '#FFD700' : '#CD7F32', fontSize: '40px' }} />
          </div>
        </div>
        <div className={styles.welcomeText}>
          <MEHTypography variant="h1">{headerTitle}</MEHTypography>
          <MEHTypography variant="body" style={{ opacity: 0.7, marginTop: '8px', display: 'block' }}>
            {t('welcome', { name: user.nombres })}
          </MEHTypography>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <MEHTypography variant="body" style={{ opacity: 0.7, marginTop: '8px' }}>
                {t('current_progress')}: <span style={{ color: tokens.colorBrandForeground1, fontWeight: 'bold' }}>{t(`role_${user.rol.toLowerCase()}`)}</span>. 
            </MEHTypography>
            {stats?.advanced_metrics?.crecimiento_mensual > 0 && (
                <div className={styles.growthIndicator}>
                    <People24Filled style={{ fontSize: '14px' }} />
                    +{stats.advanced_metrics.crecimiento_mensual} nuevos este mes
                </div>
            )}
          </div>
          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <MEHButton size="large" icon={<Reward24Filled />} onClick={() => navigate('/insignias')}>Ver mis logros</MEHButton>
            <MEHButton appearance="outline" size="large" onClick={() => navigate('/configuracion')}>Ajustar Perfil</MEHButton>
          </div>
        </div>
      </MEHCard>

      {/* 1.5 WIDGETS DINÁMICOS - Cards Interactivas */}
      {stats?.widgets?.length > 0 && (
        <section>
          <div className={styles.sectionTitle}>
            <ShieldLock24Filled style={{ color: tokens.colorBrandForeground1 }} />
            <MEHTypography variant="h3">{t('management_summary')}</MEHTypography>
          </div>
          <div className={styles.statsGrid}>
            {stats.widgets.map(widget => (
              <MEHCard 
                key={widget.id} 
                className={styles.statCard} 
                onClick={() => {
                  if (widget.link) navigate(widget.link);
                }}
              >
                {getIcon(widget.icon)}
                <MEHTypography variant="h1" style={{ margin: '8px 0' }}>{widget.value}</MEHTypography>
                <MEHTypography variant="caption" style={{ fontWeight: 'bold', opacity: 0.7 }}>{widget.title.toUpperCase()}</MEHTypography>
              </MEHCard>
            ))}
          </div>
        </section>
      )}

      {/* 1.6 ANALYTICS AVANZADO PARA ADMINS */}
      {canSeeAnalytics && (
        <section>
          <div className={styles.sectionTitle}>
            <Target24Regular style={{ color: tokens.colorBrandForeground1 }} />
            <MEHTypography variant="h3">{t('strategic_metrics')}</MEHTypography>
          </div>
          <DashboardAnalytics metrics={stats.advanced_metrics} />
        </section>
      )}

        {/* 1.6 Banner de Upgrade para Miembros */}
        {user.rol === 'MIEMBRO' && (
          <MEHCard style={{ 
            background: 'linear-gradient(90deg, #7f13ec 0%, #3a0078 100%)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            ...shorthands.padding('20px', '32px'),
            color: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', ...shorthands.padding('12px'), ...shorthands.borderRadius('50%') }}>
                <Trophy24Filled style={{ fontSize: '32px' }} />
              </div>
              <div>
                <MEHTypography variant="h3" style={{ color: 'white' }}>¿Quieres ser Embajador?</MEHTypography>
                <MEHTypography variant="body" style={{ color: 'rgba(255,255,255,0.8)', display: 'block' }}>
                  {t('upgrade_msg')}
                </MEHTypography>
              </div>
            </div>
            <MEHButton appearance="primary" style={{ backgroundColor: 'white', color: '#7f13ec' }} onClick={() => navigate('/finanzas')}>
              Saber más
            </MEHButton>
          </MEHCard>
        )}

        <div className={styles.grid}>
          {/* 2. Mis Logros Recientes */}
          {stats?.personal_stats?.ultimas_insignias?.length > 0 && (
              <section>
                  <div className={styles.sectionTitle}>
                      <Trophy24Filled style={{ color: tokens.colorBrandForeground1 }} />
                      <MEHTypography variant="h3">Mis Logros Recientes</MEHTypography>
                  </div>
                  <MEHCard style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '24px' }}>
                      {stats.personal_stats.ultimas_insignias.map(badge => (
                          <BadgeDetailModal 
                            key={badge.id_badge} 
                            badge={{...badge, earned: true}} 
                            trigger={
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <img src={resolveApiFileUrl(badge.imagen_url)} alt={badge.nombre_badge} style={{ width: '64px', height: '64px', objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(127, 19, 236, 0.3))' }} />
                                    <MEHTypography variant="caption" style={{ fontWeight: 'bold', textAlign: 'center' }}>{badge.nombre_badge}</MEHTypography>
                                </div>
                            }
                          />
                      ))}
                  </MEHCard>
              </section>
          )}

          {/* 3. Próximos Eventos */}
          <section>
            <div className={styles.sectionTitle}>
              <CalendarStar24Filled style={{ color: tokens.colorBrandForeground1 }} />
              <MEHTypography variant="h3">Eventos para ti</MEHTypography>
            </div>
            <MEHCard style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {loading ? (
                <Spinner size="small" label="Buscando talleres..." />
              ) : eventos.length > 0 ? (
                eventos.map(evento => {
                  const { day, month } = formatDate(evento.fecha_inicio);
                  const isInscribed = inscripciones.find(i => i.id_evento === evento.id_evento);
                  const hasValidEventQr = Boolean(isInscribed?.codigo_qr) && isInscribed?.estado_inscripcion === 'CONFIRMADA';
                  
                  return (
                    <div key={evento.id_evento} className={styles.eventItem}>
                      <img src={resolveApiFileUrl(evento.imagen_url) || DEFAULT_EVENT_IMG} className={styles.eventMiniature} alt="event" />
                      <div className={styles.dateBox}>
                        <MEHTypography variant="caption" style={{ display: 'block', fontWeight: 'bold', color: tokens.colorBrandForeground1, fontSize: '10px' }}>{month}</MEHTypography>
                        <MEHTypography variant="h3" style={{ fontSize: '16px' }}>{day}</MEHTypography>
                      </div>
                      <div style={{ flexGrow: 1 }}>
                        <MEHTypography variant="body" style={{ fontWeight: 'bold', fontSize: '14px' }}>{evento.titulo}</MEHTypography>
                        <MEHTypography variant="caption" style={{ opacity: 0.6, display: 'block', fontSize: '12px' }}>{evento.modalidad}</MEHTypography>
                      </div>
                      {hasValidEventQr ? (
                          <Dialog>
                            <DialogTrigger disableButtonEnhancement>
                              <MEHButton appearance="primary" size="small" icon={<QrCode24Regular />}>Mi QR</MEHButton>
                            </DialogTrigger>
                            <DialogSurface style={{ backgroundColor: '#1A1A1A', border: `1px solid ${tokens.colorBrandForeground1}` }}>
                              <DialogBody>
                                <DialogTitle>Ticket de Entrada</DialogTitle>
                                <DialogContent style={{ textAlign: 'center', padding: '24px' }}>
                                  <MEHTypography variant="body" style={{ display: 'block', marginBottom: '16px' }}>
                                    Muestra este código QR al ingresar a <b>{evento.titulo}</b>.
                                  </MEHTypography>
                                  <div style={{ display: 'inline-block', backgroundColor: 'white', padding: '16px', borderRadius: '8px' }}>
                                    <QRCodeSVG value={isInscribed.codigo_qr} size={200} />
                                  </div>
                                </DialogContent>
                              </DialogBody>
                            </DialogSurface>
                          </Dialog>
                      ) : isInscribed ? (
                          <Badge appearance="outline" color="warning">Pendiente pago</Badge>
                      ) : (
                          <MEHButton appearance="subtle" icon={<ChevronRight24Regular />} onClick={() => navigate('/learning')} />
                      )}
                    </div>
                  );
                })
              ) : (
                <MEHTypography variant="caption" style={{ textAlign: 'center', opacity: 0.5, padding: '20px' }}>No hay eventos programados.</MEHTypography>
              )}
              
              <MEHButton appearance="outline" style={{ marginTop: '8px' }} onClick={() => navigate('/dashboard/events-master')}>
                Explorar Learning Hub
              </MEHButton>
            </MEHCard>
          </section>

          {/* 4. Mi Progreso y Próximo Hito */}
          <section style={{ marginBottom: '32px' }}>
            <div className={styles.sectionTitle}>
              <Target24Regular style={{ color: tokens.colorBrandForeground1 }} />
              <MEHTypography variant="h3">Tu Progreso</MEHTypography>
            </div>
            
            <MEHCard style={{ marginBottom: '24px' }}>
              <div className={styles.progressInfo}>
                <MEHTypography variant="body" style={{ fontWeight: 'bold' }}>
                  Eventos Asistidos
                </MEHTypography>
                <MEHTypography variant="h3" style={{ color: tokens.colorBrandForeground1, fontWeight: 'bold' }}>
                  {stats?.personal_stats?.eventos_asistidos || 0} / {stats?.personal_stats?.eventos_esperados || 10}
                </MEHTypography>
              </div>
              
              <div style={{
                width: '100%',
                height: '12px',
                borderRadius: '6px',
                background: 'rgba(127, 19, 236, 0.1)',
                overflow: 'hidden',
                marginBottom: '12px',
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min((stats?.personal_stats?.progreso_promedio || 0), 100)}%`,
                  background: `linear-gradient(90deg, 
                    ${(stats?.personal_stats?.progreso_promedio || 0) < 25 ? '#FF6B6B' : ''} 
                    ${(stats?.personal_stats?.progreso_promedio || 0) < 50 ? '#FFA500' : ''} 
                    ${(stats?.personal_stats?.progreso_promedio || 0) < 75 ? '#FFD700' : ''} 
                    ${(stats?.personal_stats?.progreso_promedio || 0) >= 75 ? '#22B14C' : ''})`,
                  borderRadius: '6px',
                  transition: 'width 0.3s ease',
                }} />
              </div>
              
              <MEHTypography variant="caption" style={{ opacity: 0.7 }}>
                {stats?.personal_stats?.progreso_promedio?.toFixed(0) || 0}% de progreso global
              </MEHTypography>
            </MEHCard>

            <MEHCard style={{
              background: 'linear-gradient(135deg, rgba(127, 19, 236, 0.1) 0%, rgba(34, 177, 76, 0.1) 100%)',
              border: `1px solid rgba(127, 19, 236, 0.2)`,
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              ...shorthands.padding('24px'),
            }}>
              <Target24Regular style={{ fontSize: '40px', color: tokens.colorBrandForeground1 }} />
              <div style={{ flex: 1 }}>
                <MEHTypography variant="h3" style={{ marginBottom: '4px' }}>
                  Próximo Hito
                </MEHTypography>
                <MEHTypography variant="body" style={{ opacity: 0.8, fontSize: '14px' }}>
                  {(() => {
                    const prog = stats?.personal_stats?.progreso_promedio || 0;
                    const asistidos = stats?.personal_stats?.eventos_asistidos || 0;
                    const esperados = stats?.personal_stats?.eventos_esperados || 10;
                    const faltantes = esperados - asistidos;
                    
                    if (prog >= 100) return '¡Eres un Campeón! 🏆 Completaste todos los objetivos.';
                    if (prog >= 75) return `Faltan ${faltantes} taller${faltantes !== 1 ? 'es' : ''} para ser Champion 👑`;
                    if (prog >= 50) return `Faltan ${faltantes} taller${faltantes !== 1 ? 'es' : ''} para ser Master 💎`;
                    if (prog >= 25) return `Faltan ${faltantes} taller${faltantes !== 1 ? 'es' : ''} para ser Legend ⭐`;
                    return `Faltan ${faltantes} taller${faltantes !== 1 ? 'es' : ''} para ser Explorer 🔑`;
                  })()}
                </MEHTypography>
              </div>
              <MEHButton
                appearance="primary"
                size="small"
                onClick={() => document.querySelector('[data-rank-table]')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Beneficios
              </MEHButton>
            </MEHCard>
          </section>
        </div>

        {/* Tabla de Rangos y Beneficios */}
        <section data-rank-table style={{ marginTop: '40px' }}>
          <div className={styles.sectionTitle}>
            <Trophy24Filled style={{ color: tokens.colorBrandForeground1 }} />
            <MEHTypography variant="h3">Cómo Subir de Nivel</MEHTypography>
          </div>
          <RankBenefitsTable 
            currentProgress={stats?.personal_stats?.progreso_promedio || 0}
          />
        </section>

        <div className={styles.grid}>
          <section>
            <div className={styles.sectionTitle}>
              <MegaphoneLoud24Filled style={{ color: tokens.colorBrandForeground1 }} />
              <MEHTypography variant="h3">Anuncios de la Comunidad</MEHTypography>
            </div>
            <MEHCard style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
               {anuncios.length > 0 ? (
                 anuncios.map(an => (
                    <div key={an.id_anuncio} style={{ display: 'flex', gap: '12px', borderBottom: `1px solid ${tokens.colorNeutralBackground3}`, paddingBottom: '12px' }}>
                        <div style={{ backgroundColor: 'rgba(127, 19, 236, 0.1)', padding: '8px', borderRadius: '8px', height: 'fit-content' }}>
                            <Mail24Filled style={{ color: tokens.colorBrandForeground1 }} />
                        </div>
                        <div>
                            <MEHTypography variant="body" style={{ fontWeight: 'bold' }}>{an.titulo}</MEHTypography>
                            <MEHTypography variant="caption" style={{ display: 'block', opacity: 0.6, marginTop: '4px' }}>{an.contenido.substring(0, 80)}...</MEHTypography>
                            <MEHTypography variant="caption" style={{ fontSize: '10px', opacity: 0.4 }}>{new Date(an.fecha_publicacion).toLocaleDateString()}</MEHTypography>
                        </div>
                    </div>
                 ))
               ) : (
                <MEHTypography variant="caption" style={{ textAlign: 'center', opacity: 0.5, padding: '20px' }}>No hay avisos nuevos.</MEHTypography>
               )}
              <MEHButton appearance="subtle" size="small" onClick={() => navigate('/comunidad')}>Ir a la Comunidad</MEHButton>
            </MEHCard>
          </section>
        </div>
      </div>
    );
  };
  
  export default Dashboard;

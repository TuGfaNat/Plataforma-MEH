import React, { useState, useEffect } from 'react';
import { 
  Avatar,
  ProgressBar,
  makeStyles,
  shorthands,
  tokens,
  Spinner
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
  CalendarStar24Regular
} from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { designTokens } from '../theme/theme';
import { useAuth } from '../App';
import MainLayout from '../components/layout/MainLayout';
import { MEHCard, MEHButton, MEHTypography } from '../components/ui';
import eventoService from '../services/eventoService';
import dashboardService from '../services/dashboardService';

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
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '8px'
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
  }
});

const Dashboard = () => {
  const styles = useStyles();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [eventos, setEventos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventosData, statsData] = await Promise.all([
          eventoService.getEventos(),
          dashboardService.getStats()
        ]);
        
        const proximos = eventosData
          .filter(e => e.estado === 'PROGRAMADO')
          .sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio))
          .slice(0, 3);
          
        setEventos(proximos);
        setStats(statsData);
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
    <MainLayout>
      <div className={styles.dashboardContainer}>
        {/* 1. Bienvenida */}
        <MEHCard className={styles.welcomeHeader}>
          <div style={{ position: 'relative' }}>
            <Avatar size={128} name={fullName} color="colorful" />
            <div style={{ position: 'absolute', bottom: '0', right: '0', width: '45px', height: '45px' }}>
              <Reward24Filled className={styles.badgeGlow} style={{ color: user.rol === 'EMBAJADOR' ? '#FFD700' : '#CD7F32', fontSize: '40px' }} />
            </div>
          </div>
          <div className={styles.welcomeText}>
            <MEHTypography variant="h1">{t('welcome', { name: user.nombres })}</MEHTypography>
            <MEHTypography variant="body" style={{ opacity: 0.7, marginTop: '8px', display: 'block' }}>
              {t('current_progress')}: <span style={{ color: tokens.colorBrandForeground1, fontWeight: 'bold' }}>{t(`role_${user.rol.toLowerCase()}`)}</span>. 
            </MEHTypography>
            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <MEHButton size="large" icon={<Reward24Filled />} onClick={() => navigate('/insignias')}>Ver mis logros</MEHButton>
              <MEHButton appearance="outline" size="large" onClick={() => navigate('/configuracion')}>Ajustar Perfil</MEHButton>
            </div>
          </div>
        </MEHCard>

        {/* 1.5 WIDGETS DINÁMICOS */}
        {stats?.widgets?.length > 0 && (
          <section>
            <div className={styles.sectionTitle}>
              <ShieldLock24Filled style={{ color: tokens.colorBrandForeground1 }} />
              <MEHTypography variant="h3">Resumen de Gestión</MEHTypography>
            </div>
            <div className={styles.statsGrid}>
              {stats.widgets.map(widget => (
                <MEHCard key={widget.id} className={styles.statCard} onClick={() => navigate(widget.link)}>
                  {getIcon(widget.icon)}
                  <MEHTypography variant="h1" style={{ margin: '8px 0' }}>{widget.value}</MEHTypography>
                  <MEHTypography variant="caption" style={{ fontWeight: 'bold', opacity: 0.7 }}>{widget.title.toUpperCase()}</MEHTypography>
                </MEHCard>
              ))}
            </div>
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
          {/* 2. Próximos Eventos con Miniaturas */}
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
                  return (
                    <div key={evento.id_evento} className={styles.eventItem}>
                      <img src={evento.imagen_url || DEFAULT_EVENT_IMG} className={styles.eventMiniature} alt="event" />
                      <div className={styles.dateBox}>
                        <MEHTypography variant="caption" style={{ display: 'block', fontWeight: 'bold', color: tokens.colorBrandForeground1, fontSize: '10px' }}>{month}</MEHTypography>
                        <MEHTypography variant="h3" style={{ fontSize: '16px' }}>{day}</MEHTypography>
                      </div>
                      <div style={{ flexGrow: 1 }}>
                        <MEHTypography variant="body" style={{ fontWeight: 'bold', fontSize: '14px' }}>{evento.titulo}</MEHTypography>
                        <MEHTypography variant="caption" style={{ opacity: 0.6, display: 'block', fontSize: '12px' }}>{evento.modalidad}</MEHTypography>
                      </div>
                      <MEHButton appearance="subtle" icon={<ChevronRight24Regular />} />
                    </div>
                  );
                })
              ) : (
                <MEHTypography variant="caption" style={{ textAlign: 'center', opacity: 0.5, padding: '20px' }}>No hay eventos programados.</MEHTypography>
              )}
              
              <MEHButton appearance="outline" style={{ marginTop: '8px' }} onClick={() => navigate('/learning')}>Explorar Learning Hub</MEHButton>
            </MEHCard>
          </section>

          {/* 3. Mi Progreso */}
          <section>
            <div className={styles.sectionTitle}>
              <Reward24Filled style={{ color: tokens.colorBrandForeground1 }} />
              <MEHTypography variant="h3">Tu Progreso</MEHTypography>
            </div>
            <MEHCard>
              <div className={styles.progressInfo}>
                <MEHTypography variant="body">Progreso en Cursos</MEHTypography>
                <MEHTypography variant="caption" style={{ fontWeight: 'bold' }}>
                  {stats?.personal_stats?.progreso_promedio?.toFixed(0) || 0}%
                </MEHTypography>
              </div>
              <ProgressBar 
                value={(stats?.personal_stats?.progreso_promedio || 0) / 100} 
                color="success" 
                style={{ marginBottom: '24px', height: '8px' }} 
              />
              
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '50px', height: '50px', backgroundColor: 'rgba(127, 19, 236, 0.1)', ...shorthands.borderRadius('50%'), display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                    <CalendarStar24Regular style={{ color: tokens.colorBrandForeground1 }} />
                  </div>
                  <MEHTypography variant="h3">{stats?.personal_stats?.eventos_inscritos || 0}</MEHTypography>
                  <MEHTypography variant="caption" style={{ display: 'block', opacity: 0.6 }}>Eventos</MEHTypography>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '50px', height: '50px', backgroundColor: 'rgba(127, 19, 236, 0.1)', ...shorthands.borderRadius('50%'), display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                    <Trophy24Filled style={{ color: '#FFD700' }} />
                  </div>
                  <MEHTypography variant="h3">{stats?.personal_stats?.certificados_obtenidos || 0}</MEHTypography>
                  <MEHTypography variant="caption" style={{ display: 'block', opacity: 0.6 }}>Diplomas</MEHTypography>
                </div>
              </div>
            </MEHCard>
          </section>

          {/* 4. Notificaciones */}
          <section>
            <div className={styles.sectionTitle}>
              <Mail24Filled style={{ color: tokens.colorBrandForeground1 }} />
              <MEHTypography variant="h3">Notificaciones</MEHTypography>
            </div>
            <MEHCard style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
               {stats?.personal_stats?.certificados_obtenidos > 0 ? (
                 <div style={{ display: 'flex', gap: '12px' }}>
                  <Mail24Filled style={{ color: tokens.colorBrandForeground1 }} />
                  <div>
                    <MEHTypography variant="body" style={{ fontWeight: 'bold' }}>Certificados listos</MEHTypography>
                    <MEHTypography variant="caption" style={{ display: 'block', opacity: 0.6 }}>Tienes {stats.personal_stats.certificados_obtenidos} certificado(s) disponible(s).</MEHTypography>
                  </div>
                </div>
               ) : (
                <MEHTypography variant="caption" style={{ textAlign: 'center', opacity: 0.5, padding: '20px' }}>No tienes avisos nuevos.</MEHTypography>
               )}
              <MEHButton appearance="subtle" size="small">Ver historial</MEHButton>
            </MEHCard>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;

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
  Reward24Filled,
  Mail24Filled,
  ChevronRight24Regular
} from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { designTokens } from '../theme/theme';
import { useAuth } from '../App';
import MainLayout from '../components/layout/MainLayout';
import { MEHCard, MEHButton, MEHTypography } from '../components/ui';
import eventoService from '../services/eventoService';

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
    ...shorthands.padding('16px'),
    ...shorthands.borderRadius('12px'),
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    transition: 'all 0.2s ease',
    ...shorthands.border('1px', 'solid', 'rgba(255, 255, 255, 0.05)'),
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      transform: 'translateX(4px)',
    }
  },
  dateBox: {
    backgroundColor: tokens.colorBrandBackground2,
    ...shorthands.padding('8px'),
    ...shorthands.borderRadius('10px'),
    textAlign: 'center',
    minWidth: '55px',
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
  }
});

const Dashboard = () => {
  const styles = useStyles();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const data = await eventoService.getEventos();
        const proximos = data
          .filter(e => e.estado === 'PROGRAMADO')
          .sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio))
          .slice(0, 3);
        setEventos(proximos);
      } catch (err) {
        console.error("Error fetching eventos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEventos();
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

  return (
    <MainLayout>
      <div className={styles.dashboardContainer}>
        {/* 1. Bienvenida con degradado y Avatar */}
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
              {user.rol === 'MIEMBRO' && " ¡Estás a un paso de la grandeza!"}
            </MEHTypography>
            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <MEHButton size="large" icon={<Reward24Filled />} onClick={() => navigate('/insignias')}>Ver mis logros</MEHButton>
              <MEHButton appearance="outline" size="large" onClick={() => navigate('/configuracion')}>Ajustar Perfil</MEHButton>
            </div>
          </div>
        </MEHCard>

        {/* 1.5 Banner de Upgrade para Miembros */}
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
          {/* 2. Próximos Eventos Reales */}
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
                      <div className={styles.dateBox}>
                        <MEHTypography variant="caption" style={{ display: 'block', fontWeight: 'bold', color: tokens.colorBrandForeground1 }}>{month}</MEHTypography>
                        <MEHTypography variant="h3">{day}</MEHTypography>
                      </div>
                      <div style={{ flexGrow: 1 }}>
                        <MEHTypography variant="body" style={{ fontWeight: 'bold' }}>{evento.titulo}</MEHTypography>
                        <MEHTypography variant="caption" style={{ opacity: 0.6, display: 'block' }}>{evento.modalidad}</MEHTypography>
                      </div>
                      <MEHButton appearance="subtle" icon={<ChevronRight24Regular />} />
                    </div>
                  );
                })
              ) : (
                <MEHTypography variant="caption" style={{ textAlign: 'center', opacity: 0.5, padding: '20px' }}>No hay eventos programados por ahora.</MEHTypography>
              )}
              
              <MEHButton appearance="outline" style={{ marginTop: '8px' }} onClick={() => navigate('/learning')}>Explorar Learning Hub</MEHButton>
            </MEHCard>
          </section>

          {/* 3. Progreso */}
          <section>
            <div className={styles.sectionTitle}>
              <Reward24Filled style={{ color: tokens.colorBrandForeground1 }} />
              <MEHTypography variant="h3">Tu Progreso</MEHTypography>
            </div>
            <MEHCard>
              <div className={styles.progressInfo}>
                <MEHTypography variant="body">Gold Milestone</MEHTypography>
                <MEHTypography variant="caption" style={{ fontWeight: 'bold' }}>75%</MEHTypography>
              </div>
              <ProgressBar value={0.75} color="success" style={{ marginBottom: '24px', height: '8px' }} />
              
              <MEHTypography variant="caption" style={{ marginBottom: '16px', display: 'block', opacity: 0.7, fontWeight: 'bold' }}>LOGROS RECIENTES</MEHTypography>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: '50px', height: '50px', backgroundColor: 'rgba(127, 19, 236, 0.1)', ...shorthands.borderRadius('50%'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Reward24Filled style={{ color: '#FFD700' }} />
                </div>
                <div style={{ width: '50px', height: '50px', backgroundColor: 'rgba(127, 19, 236, 0.1)', ...shorthands.borderRadius('50%'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Alert24Regular style={{ color: '#0078D4' }} />
                </div>
              </div>
            </MEHCard>
          </section>

          {/* 4. Centro de Avisos */}
          <section>
            <div className={styles.sectionTitle}>
              <Mail24Filled style={{ color: tokens.colorBrandForeground1 }} />
              <MEHTypography variant="h3">Notificaciones</MEHTypography>
            </div>
            <MEHCard style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Mail24Filled style={{ color: tokens.colorBrandForeground1 }} />
                <div>
                  <MEHTypography variant="body" style={{ fontWeight: 'bold' }}>Nuevo certificado</MEHTypography>
                  <MEHTypography variant="caption" style={{ display: 'block', opacity: 0.6 }}>Has completado Azure Fundamentals.</MEHTypography>
                </div>
              </div>
              <MEHButton appearance="subtle" size="small">Ver todo el historial</MEHButton>
            </MEHCard>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;

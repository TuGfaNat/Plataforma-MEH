import React, { useState, useEffect } from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Spinner,
  MessageBar,
  Tab,
  TabList
} from '@fluentui/react-components';
import { useNavigate } from 'react-router-dom';
import { CalendarStar24Filled, DataTrending24Regular, ChevronRight24Regular } from '@fluentui/react-icons';
import { MEHCard, MEHButton, MEHTypography } from '../components/ui';
import eventoService from '../services/eventoService';
import InscripcionEventoModal from '../components/InscripcionEventoModal';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
  },
  tabsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  eventsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    ...shorthands.gap('16px'),
  },
  eventCard: {
    transition: 'all 0.2s ease',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 32px rgba(127, 19, 236, 0.2)',
    }
  },
  eventContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    height: '100%',
  },
  eventDate: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: tokens.fontSizeBase200,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  eventTitle: {
    fontWeight: tokens.fontWeightBold,
    fontSize: tokens.fontSizeBase500,
  },
  eventDescription: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: tokens.fontSizeBase200,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    ...shorthands.padding('64px', '32px'),
    textAlign: 'center',
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: 'rgba(127, 19, 236, 0.05)',
    border: `1px solid rgba(127, 19, 236, 0.1)`,
  },
  statsButtonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '24px',
  }
});

const EventsMaster = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [events, setEvents] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsData, inscData] = await Promise.all([
        eventoService.getEventos(),
        eventoService.getMisInscripciones()
      ]);
      setEvents(eventsData || []);
      setInscripciones(inscData || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('No se pudieron cargar los eventos');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.fecha_inicio);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate >= today;
  });

  const archivedEvents = events.filter(event => {
    const eventDate = new Date(event.fecha_inicio);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate < today;
  });

  const displayedEvents = activeTab === 'upcoming' ? upcomingEvents : archivedEvents;

  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <CalendarStar24Filled style={{ color: tokens.colorBrandForeground1, fontSize: '32px' }} />
        <div>
          <MEHTypography variant="h1" style={{ fontSize: '2rem' }}>
            Explorar Eventos
          </MEHTypography>
          <MEHTypography variant="body" style={{ opacity: 0.7 }}>
            Talleres, Workshops y Conferencias exclusivas para la comunidad.
          </MEHTypography>
        </div>
      </div>

      {error && <MessageBar intent="error">{error}</MessageBar>}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
          <Spinner size="large" label="Cargando agenda oficial..." />
        </div>
      ) : (
        <div className={styles.tabsContainer}>
          <TabList
            selectedValue={activeTab}
            onTabSelect={(e, data) => setActiveTab(data.value)}
            style={{ marginBottom: '24px' }}
          >
            <Tab value="upcoming">
              Próximos Eventos ({upcomingEvents.length})
            </Tab>
            <Tab value="archived">
              Pasados ({archivedEvents.length})
            </Tab>
          </TabList>

          {displayedEvents.length === 0 ? (
            <div className={styles.emptyState}>
              <CalendarStar24Filled style={{ fontSize: '48px', opacity: 0.4 }} />
              <MEHTypography variant="h3">
                {activeTab === 'upcoming'
                  ? 'No hay eventos próximos'
                  : 'No hay eventos en el archivo'}
              </MEHTypography>
              <MEHTypography variant="body" style={{ opacity: 0.6 }}>
                {activeTab === 'upcoming'
                  ? 'Pronto habrá nuevos eventos disponibles'
                  : 'Aquí aparecerán los eventos pasados'}
              </MEHTypography>
            </div>
          ) : (
            <div className={styles.eventsList}>
              {displayedEvents.map(event => {
                const isInscribed = inscripciones.find(i => i.id_evento === event.id_evento);
                
                return (
                  <MEHCard key={event.id_evento} className={styles.eventCard}>
                    <div className={styles.eventContent}>
                      <div className={styles.eventDate}>
                        <CalendarStar24Filled style={{ fontSize: '16px' }} />
                        {formatDate(event.fecha_inicio)}
                      </div>
                      <MEHTypography className={styles.eventTitle}>
                        {event.titulo}
                      </MEHTypography>
                      <MEHTypography className={styles.eventDescription}>
                        {event.descripcion}
                      </MEHTypography>
                      <div style={{ flexGrow: 1 }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                          <MEHTypography variant="caption" style={{ opacity: 0.6 }}>📍 {event.modalidad}</MEHTypography>
                          {activeTab === 'upcoming' && (
                              isInscribed ? (
                                  <Badge appearance="filled" color="success">Inscrito</Badge>
                              ) : (
                                  <InscripcionEventoModal evento={event} onInscribed={fetchData} />
                              )
                          )}
                      </div>
                    </div>
                  </MEHCard>
                );
              })}
            </div>
          )}

          {activeTab === 'archived' && archivedEvents.length > 0 && (
            <div className={styles.statsButtonContainer}>
              <MEHButton
                appearance="primary"
                size="large"
                icon={<DataTrending24Regular />}
                onClick={() => navigate('/dashboard/analytics')}
              >
                Ver Estadísticas de Impacto
              </MEHButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventsMaster;

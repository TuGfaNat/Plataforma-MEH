import React, { useState, useEffect } from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Spinner,
  MessageBar,
  Tab,
  TabList,
  Badge,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions
} from '@fluentui/react-components';
import { useNavigate } from 'react-router-dom';
import { CalendarStar24Filled, DataTrending24Regular, ChevronRight24Regular } from '@fluentui/react-icons';
import { MEHCard, MEHButton, MEHTypography } from '../components/ui';
import { resolveApiFileUrl } from '../services/api';
import eventoService from '../services/eventoService';
import InscripcionEventoModal from '../components/InscripcionEventoModal';

const DEFAULT_EVENT_IMG = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop";

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
    padding: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.2s ease',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 32px rgba(127, 19, 236, 0.2)',
    }
  },
  cardBanner: { 
    height: '140px', 
    width: '100%', 
    objectFit: 'cover', 
    backgroundColor: tokens.colorNeutralBackground3 
  },
  eventContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '20px',
    flexGrow: 1,
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
  const [selectedEventForDetails, setSelectedEventForDetails] = useState(null);

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
  }).sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));

  const archivedEvents = events.filter(event => {
    const eventDate = new Date(event.fecha_inicio);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate < today;
  }).sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio));

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
          <MEHTypography variant="h1" style={{ fontSize: '2rem', display: 'block' }}>
            Explorar Eventos
          </MEHTypography>
          <MEHTypography variant="body" style={{ opacity: 0.7, display: 'block', marginTop: '4px' }}>
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
                  <MEHCard 
                    key={event.id_evento} 
                    className={styles.eventCard}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedEventForDetails(event)}
                  >
                    <img 
                      src={resolveApiFileUrl(event.imagen_url) || DEFAULT_EVENT_IMG} 
                      className={styles.cardBanner} 
                      alt="banner de evento" 
                    />
                    <div className={styles.eventContent}>
                      <div className={styles.eventDate}>
                        <CalendarStar24Filled style={{ fontSize: '16px' }} />
                        {formatDate(event.fecha_inicio)}
                      </div>
                      <MEHTypography className={styles.eventTitle}>
                        {event.titulo}
                      </MEHTypography>
                      <MEHTypography className={styles.eventDescription}>
                        {event.descripcion && event.descripcion.length > 120 
                          ? `${event.descripcion.substring(0, 120)}...` 
                          : event.descripcion}
                      </MEHTypography>
                      <div style={{ flexGrow: 1 }} />
                      <div 
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}
                        onClick={(e) => e.stopPropagation()}
                      >
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

      {/* Modal de detalles de Evento */}
      <Dialog open={!!selectedEventForDetails} onOpenChange={(e, data) => { if (!data.open) setSelectedEventForDetails(null); }}>
        <DialogSurface style={{ backgroundColor: '#1A1A1A', border: `1px solid ${tokens.colorBrandForeground1}`, maxWidth: '600px', width: '90%' }}>
          <DialogBody>
            <DialogTitle>{selectedEventForDetails?.titulo}</DialogTitle>
            <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 0' }}>
              {selectedEventForDetails && (
                <img 
                  src={resolveApiFileUrl(selectedEventForDetails.imagen_url) || DEFAULT_EVENT_IMG} 
                  alt={selectedEventForDetails.titulo} 
                  style={{ width: '100%', maxHeight: '250px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} 
                />
              )}
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <Badge color="brand" appearance="filled">📍 {selectedEventForDetails?.modalidad}</Badge>
                <Badge color="informative" appearance="tint">📅 {selectedEventForDetails && formatDate(selectedEventForDetails.fecha_inicio)}</Badge>
                {selectedEventForDetails?.hora_inicio && (
                  <Badge color="tint">🕒 {selectedEventForDetails.hora_inicio} {selectedEventForDetails.hora_fin ? ` - ${selectedEventForDetails.hora_fin}` : ''}</Badge>
                )}
                {selectedEventForDetails?.refrigerio_incluido && (
                  <Badge color="success" appearance="tint">🍪 Refrigerio Incluido</Badge>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <MEHTypography variant="caption" style={{ fontWeight: 'bold', opacity: 0.7 }}>Descripción:</MEHTypography>
                <MEHTypography variant="body" style={{ opacity: 0.9, whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                  {selectedEventForDetails?.descripcion || 'Sin descripción disponible.'}
                </MEHTypography>
              </div>

              {selectedEventForDetails?.ubicacion && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <MEHTypography variant="caption" style={{ fontWeight: 'bold', opacity: 0.7 }}>Ubicación / Lugar:</MEHTypography>
                  <MEHTypography variant="body" style={{ opacity: 0.9 }}>
                    {selectedEventForDetails.ubicacion}
                  </MEHTypography>
                  {selectedEventForDetails.link_mapas && (
                    <a 
                      href={selectedEventForDetails.link_mapas} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ color: tokens.colorBrandForeground1, textDecoration: 'underline', fontSize: '13px', marginTop: '2px' }}
                    >
                      Ver en Google Maps 🗺️
                    </a>
                  )}
                </div>
              )}

              {selectedEventForDetails?.speakers && selectedEventForDetails.speakers.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <MEHTypography variant="caption" style={{ fontWeight: 'bold', opacity: 0.7 }}>Ponente(s):</MEHTypography>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {selectedEventForDetails.speakers.map(spk => (
                      <div key={spk.id_speaker} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '20px' }}>
                        {spk.foto_url && (
                          <img src={resolveApiFileUrl(spk.foto_url)} alt={spk.nombre} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                        )}
                        <MEHTypography variant="caption" style={{ fontWeight: 'bold' }}>{spk.nombre}</MEHTypography>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </DialogContent>
            <DialogActions style={{ gap: '12px' }}>
              {selectedEventForDetails && new Date(selectedEventForDetails.fecha_inicio) >= new Date() && (
                (() => {
                  const isInscribed = inscripciones.find(i => i.id_evento === selectedEventForDetails.id_evento);
                  if (isInscribed) {
                    return <Badge appearance="filled" color="success" style={{ padding: '6px 12px' }}>Ya inscrito</Badge>;
                  }
                  return (
                    <InscripcionEventoModal 
                      evento={selectedEventForDetails} 
                      onInscribed={() => {
                        fetchData();
                        setSelectedEventForDetails(null);
                      }} 
                    />
                  );
                })()
              )}
              <MEHButton appearance="secondary" onClick={() => setSelectedEventForDetails(null)}>Cerrar</MEHButton>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};

export default EventsMaster;

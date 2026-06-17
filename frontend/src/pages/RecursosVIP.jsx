import React, { useState, useEffect } from 'react';
import { 
  makeStyles, 
  shorthands, 
  tokens, 
  Button,
  Spinner,
  Caption1
} from '@fluentui/react-components';
import { 
  BookToolbox24Filled, 
  ArrowDownload24Regular,
  VideoClip24Regular,
  DocumentPdf24Regular,
  Presenter24Regular,
  Archive24Regular
} from '@fluentui/react-icons';
import { MEHCard, MEHTypography } from '../components/ui';
import recursoService from '../services/recursoService';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    animationName: {
        from: { opacity: 0, transform: 'translateY(10px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
    },
    animationDuration: '0.5s',
  },
  resourceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    ...shorthands.gap('24px'),
  },
  resourceItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    ...shorthands.padding('24px'),
    height: '100%'
  },
  iconContainer: {
    width: '48px',
    height: '48px',
    backgroundColor: 'rgba(127, 19, 236, 0.1)',
    ...shorthands.borderRadius('12px'),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.colorBrandForeground1,
  }
});

const PERMANENT_RESOURCES = [
  {
    id_recurso: 'perm-1',
    titulo: 'Guía del Embajador (MLSA Playbook)',
    descripcion: 'Manual oficial con los lineamientos, niveles, beneficios y directrices del programa de embajadores.',
    tipo_archivo: 'PDF',
    url_descarga: 'https://query.prod.cms.rt.microsoft.com/cms/api/am/binary/RE4OmSS',
  },
  {
    id_recurso: 'perm-2',
    titulo: 'Plantilla de Presentación Oficial MEH',
    descripcion: 'Diseño oficial de diapositivas en PowerPoint con la marca de Microsoft Education Hub para tus talleres y charlas.',
    tipo_archivo: 'PPTX',
    url_descarga: 'https://github.com/microsoft/education/tree/master/templates',
  },
  {
    id_recurso: 'perm-3',
    titulo: 'Kit de Marca y Logotipos Oficiales',
    descripcion: 'Pack con logotipos oficiales de Microsoft Education Hub y MLSA en alta resolución para banners y flyers.',
    tipo_archivo: 'ZIP',
    url_descarga: 'https://github.com/microsoft/education/raw/master/brand-assets.zip',
  },
  {
    id_recurso: 'perm-4',
    titulo: 'Formularios y Planillas de Control de Evento',
    descripcion: 'Formatos listos para recolectar asistencia, feedback y registro de participantes de tus talleres.',
    tipo_archivo: 'XLSX',
    url_descarga: 'https://github.com/microsoft/education/raw/master/event-sheets.xlsx',
  }
];

const RecursosVIP = () => {
  const styles = useStyles();
  const [recursos, setRecursos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVIP = async () => {
      try {
        const data = await recursoService.getRecursos('VIP');
        setRecursos(data);
      } catch (err) {
        console.error("Error cargando recursos VIP:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVIP();
  }, []);

  const getIcon = (type) => {
    switch(type) {
      case 'PDF': return <DocumentPdf24Regular />;
      case 'VIDEO': return <VideoClip24Regular />;
      case 'ZIP': return <Archive24Regular />;
      case 'PPTX': return <Presenter24Regular />;
      default: return <BookToolbox24Filled />;
    }
  };

  const allResources = React.useMemo(() => {
    return [...PERMANENT_RESOURCES, ...recursos];
  }, [recursos]);

  const handleSolicitarApoyo = () => {
    const emailTo = 'meh.bolivia@gmail.com';
    const subject = encodeURIComponent('Solicitud de Apoyo Oficial para Evento - Embajador MEH');
    const body = encodeURIComponent(
      `Hola equipo nacional de Microsoft Education Hub (MEH) Bolivia,\n\n` +
      `Me pongo en contacto para solicitar apoyo oficial para la organización de un evento/taller de la comunidad.\n\n` +
      `Detalles del Evento:\n` +
      `- Nombre del Evento: [Escribe el nombre del evento aquí]\n` +
      `- Fecha estimada: [Escribe la fecha aquí]\n` +
      `- Lugar/Plataforma: [Escribe el lugar o plataforma aquí]\n` +
      `- Audiencia estimada: [Escribe la cantidad estimada de asistentes aquí]\n\n` +
      `¿Qué tipo de apoyo necesitas? (Swag, licencias, difusión, mentores, etc.):\n` +
      `[Describe brevemente qué recursos requieres y por qué es importante el evento para la comunidad]\n\n` +
      `Saludos cordiales,\n` +
      `[Tu Nombre Completo / Alias]`
    );
    window.location.href = `mailto:${emailTo}?subject=${subject}&body=${body}`;
  };

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <BookToolbox24Filled style={{ color: tokens.colorBrandForeground1, fontSize: '32px' }} />
        <MEHTypography variant="h1">Recursos VIP para Embajadores</MEHTypography>
      </div>

      <MEHTypography variant="body" style={{ opacity: 0.6 }}>
        Como Embajador MEH, tienes acceso a materiales exclusivos gestionados por el equipo nacional para potenciar tu liderazgo.
      </MEHTypography>

      {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Spinner label="Accediendo a la biblioteca VIP..." /></div>
      ) : (
          <div className={styles.resourceGrid}>
              {allResources.map((rec) => (
                  <MEHCard key={rec.id_recurso} className={styles.resourceItem}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div className={styles.iconContainer}>
                          {getIcon(rec.tipo_archivo)}
                      </div>
                      <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', ...shorthands.padding('4px', '12px'), ...shorthands.borderRadius('20px') }}>
                          <Caption1 style={{ fontWeight: 'bold' }}>{rec.tipo_archivo}</Caption1>
                      </div>
                  </div>
                  
                  <div style={{ flexGrow: 1 }}>
                      <MEHTypography variant="h3" style={{ marginBottom: '8px', display: 'block' }}>{rec.titulo}</MEHTypography>
                      <MEHTypography variant="caption" style={{ opacity: 0.7 }}>{rec.descripcion}</MEHTypography>
                  </div>

                  <Button 
                      icon={<ArrowDownload24Regular />} 
                      appearance="outline" 
                      style={{ marginTop: '16px' }}
                      onClick={() => window.open(rec.url_descarga, '_blank')}
                  >
                      Descargar recurso
                  </Button>
                  </MEHCard>
              ))}
              {allResources.length === 0 && (
                  <MEHTypography variant="body" style={{ opacity: 0.5, gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>
                      Aún no se han publicado recursos exclusivos en esta categoría.
                  </MEHTypography>
              )}
          </div>
      )}

      <MEHCard style={{ backgroundColor: 'rgba(127, 19, 236, 0.05)', textAlign: 'center', ...shorthands.padding('40px') }}>
        <MEHTypography variant="h3">¿Necesitas apoyo para un evento?</MEHTypography>
        <MEHTypography variant="body" style={{ display: 'block', margin: '16px 0', opacity: 0.8 }}>
          Si estás organizando un taller oficial, solicita apoyo (swag, licencias o difusión) directamente con el equipo de soporte de MEH Bolivia.
        </MEHTypography>
        <Button appearance="primary" size="large" onClick={handleSolicitarApoyo}>Solicitar Apoyo Oficial</Button>
      </MEHCard>
    </div>
  );
};

export default RecursosVIP;

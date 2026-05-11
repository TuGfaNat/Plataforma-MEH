import React, { useState, useEffect } from 'react';
import { 
  makeStyles, 
  shorthands, 
  tokens, 
  Spinner,
  Badge,
  TabList,
  Tab
} from '@fluentui/react-components';
import { 
  QrCode24Regular, 
  CheckmarkCircle24Filled,
  Warning24Regular,
  CalendarStar24Regular,
  Library24Regular,
  PersonAvailable24Regular
} from '@fluentui/react-icons';
import MainLayout from '../components/layout/MainLayout';
import { MEHCard, MEHButton, MEHTypography } from '../components/ui';
import asistenciaService from '../services/asistenciaService';
import { Html5QrcodeScanner } from "html5-qrcode";

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
    animationName: {
        from: { opacity: 0, transform: 'translateY(10px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
    },
    animationDuration: '0.5s',
  },
  scannerContainer: {
    width: '100%',
    maxWidth: '500px',
    backgroundColor: '#000',
    ...shorthands.borderRadius('16px'),
    overflow: 'hidden',
    ...shorthands.border('2px', 'solid', tokens.colorBrandBackground),
  },
  activityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
    width: '100%',
    maxWidth: '900px',
  },
  selectedCard: {
    border: `2px solid ${tokens.colorBrandBackground}`,
    backgroundColor: 'rgba(127, 19, 236, 0.1)',
  }
});

const EscaneoQR = () => {
  const styles = useStyles();
  const [actividades, setActividades] = useState({ eventos: [], cursos: [] });
  const [selectedActividad, setSelectedActividad] = useState(null); // { id, tipo, titulo }
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('eventos');

  useEffect(() => {
    fetchActividades();
  }, []);

  const fetchActividades = async () => {
    try {
      const data = await asistenciaService.getActividades();
      setActividades(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => {
    let scanner = null;
    if (selectedActividad) {
        scanner = new Html5QrcodeScanner("reader", {
            fps: 10,
            qrbox: { width: 250, height: 250 },
        });
        scanner.render(onScanSuccess, (err) => {});
    }

    function onScanSuccess(decodedText) {
      // Formato: "id_usuario" o "url|id_usuario"
      // Simplificamos: si el QR solo trae el ID del usuario, usamos el contexto de la actividad seleccionada
      const idUsuario = decodedText.split('|').pop(); 
      handleAsistencia(idUsuario);
    }

    return () => {
      if (scanner) scanner.clear().catch(e => console.log(e));
    };
  }, [selectedActividad]);

  const handleAsistencia = async (idUsuario) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setScanResult(null);

    try {
      const result = await asistenciaService.registrar(selectedActividad.tipo, selectedActividad.id, idUsuario);
      setScanResult(result.mensaje);
      // Feedback visual temporal
      setTimeout(() => setScanResult(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "Error en el registro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className={styles.container}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
            <PersonAvailable24Regular style={{ color: tokens.colorBrandForeground1, fontSize: '32px' }} />
            <MEHTypography variant="h1">Centro de Operaciones y Control</MEHTypography>
          </div>
          <MEHTypography variant="body" style={{ opacity: 0.6 }}>
            Selecciona una actividad activa para iniciar el control de acceso por QR.
          </MEHTypography>
        </div>

        {!selectedActividad ? (
            <>
                <TabList selectedValue={tab} onTabSelect={(e, d) => setTab(d.value)}>
                    <Tab value="eventos" icon={<CalendarStar24Regular />}>Eventos Próximos</Tab>
                    <Tab value="cursos" icon={<BookLibrary24Regular />}>Cursos Vigentes</Tab>
                </TabList>

                <div className={styles.activityGrid}>
                    {(tab === 'eventos' ? actividades.eventos : actividades.cursos).map(act => (
                        <MEHCard 
                            key={act.id_evento || act.id_curso} 
                            style={{ cursor: 'pointer' }}
                            onClick={() => setSelectedActividad({
                                id: act.id_evento || act.id_curso,
                                tipo: tab === 'eventos' ? 'EVENTO' : 'CURSO',
                                titulo: act.titulo || act.nombre_curso
                            })}
                        >
                            <MEHTypography variant="h3">{act.titulo || act.nombre_curso}</MEHTypography>
                            <MEHTypography variant="caption" style={{ display: 'block', marginTop: '8px', opacity: 0.7 }}>
                                {tab === 'eventos' ? `Modalidad: ${act.modalidad}` : `Horas: ${act.horas_academicas}h`}
                            </MEHTypography>
                            <MEHButton size="small" style={{ marginTop: '12px' }}>Iniciar Control</MEHButton>
                        </MEHCard>
                    ))}
                    {(tab === 'eventos' ? actividades.eventos : actividades.cursos).length === 0 && (
                        <MEHTypography variant="body" style={{ gridColumn: '1/-1', textAlign: 'center', opacity: 0.5, padding: '40px' }}>
                            No hay {tab} activos para controlar en este momento.
                        </MEHTypography>
                    )}
                </div>
            </>
        ) : (
            <MEHCard style={{ width: '100%', maxWidth: '600px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ textAlign: 'left' }}>
                        <Badge color="brand" appearance="tint">{selectedActividad.tipo}</Badge>
                        <MEHTypography variant="h2" style={{ display: 'block', marginTop: '4px' }}>{selectedActividad.titulo}</MEHTypography>
                    </div>
                    <MEHButton appearance="subtle" onClick={() => setSelectedActividad(null)}>Cambiar Actividad</MEHButton>
                </div>

                <div id="reader" className={styles.scannerContainer}></div>

                {loading && !scanResult && <Spinner label="Procesando QR..." style={{ marginTop: '20px' }} />}

                {scanResult && (
                    <div style={{ marginTop: '20px', color: tokens.colorPaletteGreenForeground1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <CheckmarkCircle24Filled fontSize={32} />
                        <MEHTypography variant="h2">{scanResult}</MEHTypography>
                    </div>
                )}

                {error && (
                    <div style={{ marginTop: '20px', color: tokens.colorPaletteRedForeground1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Warning24Regular fontSize={32} />
                        <MEHTypography variant="h3">{error}</MEHTypography>
                    </div>
                )}

                <div style={{ marginTop: '24px', opacity: 0.6 }}>
                    <MEHTypography variant="caption">El escáner permanece activo. Solo apunta el siguiente código.</MEHTypography>
                </div>
            </MEHCard>
        )}
      </div>
    </MainLayout>
  );
};

export default EscaneoQR;

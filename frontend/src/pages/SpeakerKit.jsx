import React, { useState, useEffect } from 'react';
import { 
  makeStyles, 
  shorthands, 
  tokens, 
  Button,
  Spinner,
  TabList,
  Tab,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Input,
  Badge,
  MessageBar
} from '@fluentui/react-components';
import { 
  Megaphone24Regular,
  ArrowDownload24Regular,
  DocumentPdf24Regular,
  Archive24Regular,
  Library24Filled,
  VideoClip24Regular,
  People24Regular,
  Save24Regular,
  Info24Regular,
  ConferenceRoom24Filled
} from '@fluentui/react-icons';
import { MEHCard, MEHTypography, MEHButton } from '../components/ui';
import recursoService from '../services/recursoService';
import cursoService from '../services/cursoService';

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
    height: '100%',
    transition: 'transform 0.2s',
    ':hover': {
        transform: 'translateY(-4px)'
    }
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
  },
  emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      padding: '80px 20px',
      textAlign: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      ...shorthands.borderRadius('12px'),
      ...shorthands.border('1px', 'dashed', tokens.colorNeutralBackground3)
  }
});

const SpeakerKit = () => {
  const styles = useStyles();
  const [selectedTab, setSelectedTab] = useState('recursos');
  const [recursos, setRecursos] = useState([]);
  const [misCursos, setMisCursos] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [selectedCurso, setSelectedCurso] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
        setLoading(true);
        if (selectedTab === 'recursos') await fetchRecursos();
        if (selectedTab === 'clases') await fetchMisCursos();
        setLoading(false);
    };
    init();
  }, [selectedTab]);

  const fetchRecursos = async () => {
    try {
      const data = await recursoService.getRecursos('SPEAKER');
      setRecursos(data || []);
    } catch (err) { console.error("Error cargando recursos:", err); }
  };

  const fetchMisCursos = async () => {
    try {
      const data = await cursoService.getMisCursosDocente();
      setMisCursos(data || []);
    } catch (err) { console.error("Error cargando cursos:", err); }
  };

  const handleVerAlumnos = async (idCurso) => {
    setLoading(true);
    try {
      const data = await cursoService.getAlumnosCurso(idCurso);
      setAlumnos(data || []);
      setSelectedCurso(idCurso);
    } catch (err) { console.error("Error cargando alumnos:", err); } finally { setLoading(false); }
  };

  const handleAsignarNota = async (idInscripcion, nota) => {
    try {
        await cursoService.setNotaAlumno(idInscripcion, nota);
        alert("Nota actualizada satisfactoriamente");
        handleVerAlumnos(selectedCurso);
    } catch (err) {
        alert("Error al actualizar nota");
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'PDF': return <DocumentPdf24Regular />;
      case 'VIDEO': return <VideoClip24Regular />;
      case 'ZIP': return <Archive24Regular />;
      default: return <Library24Filled />;
    }
  };

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Megaphone24Regular style={{ color: tokens.colorBrandForeground1, fontSize: '32px' }} />
        <div>
            <MEHTypography variant="h1">Centro de Moderación y Docencia</MEHTypography>
            <MEHTypography variant="body" style={{ opacity: 0.7 }}>Gestión de activos digitales y control académico del programa MEH.</MEHTypography>
        </div>
      </div>

      <TabList selectedValue={selectedTab} onTabSelect={(e, d) => setSelectedTab(d.value)}>
        <Tab value="recursos" icon={<Archive24Regular />}>Speaker Kit</Tab>
        <Tab value="clases" icon={<People24Regular />}>Mis Clases y Notas</Tab>
      </TabList>

      {loading && !selectedCurso && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
              <Spinner label="Sincronizando portal de docencia..." />
          </div>
      )}

      {!loading && selectedTab === 'recursos' && (
          recursos.length > 0 ? (
            <div className={styles.resourceGrid}>
                {recursos.map((rec) => (
                    <MEHCard key={rec.id_recurso} className={styles.resourceItem}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div className={styles.iconContainer}>{getIcon(rec.tipo_archivo)}</div>
                        <Badge appearance="tint">{rec.tipo_archivo}</Badge>
                    </div>
                    <div style={{ flexGrow: 1 }}>
                        <MEHTypography variant="h3">{rec.titulo}</MEHTypography>
                        <MEHTypography variant="caption" style={{ opacity: 0.7, display: 'block', marginTop: '8px' }}>{rec.descripcion}</MEHTypography>
                    </div>
                    <Button icon={<ArrowDownload24Regular />} appearance="primary" onClick={() => window.open(rec.url_descarga, '_blank')}>Descargar Recurso</Button>
                    </MEHCard>
                ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
                <Archive24Regular style={{ fontSize: '48px', opacity: 0.3 }} />
                <MEHTypography variant="h3">No hay materiales digitales</MEHTypography>
                <MEHTypography variant="body">Actualmente no existen recursos cargados para la categoría de ponentes.</MEHTypography>
            </div>
          )
      )}

      {!loading && selectedTab === 'clases' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {misCursos.length > 0 ? (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                        {misCursos.map(c => (
                            <MEHCard 
                                key={c.id_curso} 
                                style={{ 
                                    cursor: 'pointer', 
                                    border: selectedCurso === c.id_curso ? `2px solid ${tokens.colorBrandBackground}` : '1px solid transparent',
                                    transition: 'border 0.2s'
                                }} 
                                onClick={() => handleVerAlumnos(c.id_curso)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <ConferenceRoom24Filled style={{ color: tokens.colorBrandForeground1 }} />
                                    <MEHTypography variant="h3">{c.nombre_curso}</MEHTypography>
                                </div>
                                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Badge appearance="outline" color={c.estado === 'ACTIVO' ? 'success' : 'informative'}>{c.estado}</Badge>
                                    <MEHTypography variant="caption">Docente Titular</MEHTypography>
                                </div>
                            </MEHCard>
                        ))}
                    </div>

                    {selectedCurso && (
                        <MEHCard style={{ animationName: { from: { opacity: 0 }, to: { opacity: 1 } }, animationDuration: '0.3s' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <MEHTypography variant="h2">Libreta de Notas: {misCursos.find(c => c.id_curso === selectedCurso)?.nombre_curso}</MEHTypography>
                                <MessageBar intent="info">La nota debe estar entre 0 y 100.</MessageBar>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHeaderCell>ID Alumno</TableHeaderCell>
                                        <TableHeaderCell>Progreso</TableHeaderCell>
                                        <TableHeaderCell>Nota Final</TableHeaderCell>
                                        <TableHeaderCell>Acción</TableHeaderCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {alumnos.map(al => (
                                        <TableRow key={al.id_inscripcion_curso}>
                                            <TableCell>Usuario #{al.id_usuario}</TableCell>
                                            <TableCell>{al.progreso}%</TableCell>
                                            <TableCell>
                                                <Input 
                                                    type="number" 
                                                    defaultValue={al.nota_final} 
                                                    style={{ width: '100px' }}
                                                    onChange={(e) => al.tempNota = e.target.value}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <MEHButton icon={<Save24Regular />} appearance="subtle" onClick={() => handleAsignarNota(al.id_inscripcion_curso, al.tempNota || al.nota_final)}>
                                                    Guardar
                                                </MEHButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </MEHCard>
                    )}
                </>
              ) : (
                <div className={styles.emptyState}>
                    <ConferenceRoom24Filled style={{ fontSize: '48px', opacity: 0.3 }} />
                    <MEHTypography variant="h3">No tienes clases asignadas</MEHTypography>
                    <MEHTypography variant="body">Debes estar vinculado como instructor en un evento activo para poder gestionar notas.</MEHTypography>
                    <Button icon={<Info24Regular />} appearance="outline" style={{ marginTop: '12px' }}>Solicitar vinculación</Button>
                </div>
              )}
          </div>
      )}
    </div>
  );
};

export default SpeakerKit;

import React, { useState, useEffect } from 'react';
import { 
  makeStyles, 
  shorthands, 
  tokens, 
  Button,
  Spinner,
  Caption1,
  TabList,
  Tab,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Input,
  Badge
} from '@fluentui/react-components';
import { 
  Megaphone24Regular,
  ArrowDownload24Regular,
  DocumentPdf24Regular,
  Archive24Regular,
  Library24Filled,
  VideoClip24Regular,
  People24Regular,
  Save24Regular
} from '@fluentui/react-icons';
import MainLayout from '../components/layout/MainLayout';
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

const SpeakerKit = () => {
  const styles = useStyles();
  const [selectedTab, setSelectedTab] = useState('recursos');
  const [recursos, setRecursos] = useState([]);
  const [misCursos, setMisCursos] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [selectedCurso, setSelectedCurso] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedTab === 'recursos') fetchRecursos();
    if (selectedTab === 'clases') fetchMisCursos();
  }, [selectedTab]);

  const fetchRecursos = async () => {
    setLoading(true);
    try {
      const data = await recursoService.getRecursos('SPEAKER');
      setRecursos(data);
    } catch (err) { console.error("Error cargando Speaker Kit:", err); } finally { setLoading(false); }
  };

  const fetchMisCursos = async () => {
    setLoading(true);
    try {
      const data = await cursoService.getMisCursosDocente();
      setMisCursos(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleVerAlumnos = async (idCurso) => {
    setLoading(true);
    try {
      const data = await cursoService.getAlumnosCurso(idCurso);
      setAlumnos(data);
      setSelectedCurso(idCurso);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleGuardarNota = async (idInscripcion, nota) => {
    try {
      await cursoService.setNotaAlumno(idInscripcion, nota);
      alert("Nota guardada");
      handleVerAlumnos(selectedCurso);
    } catch (err) { alert("Error al guardar nota"); }
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
    <MainLayout>
      <div className={styles.container}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Megaphone24Regular style={{ color: tokens.colorBrandForeground1, fontSize: '32px' }} />
          <MEHTypography variant="h1">Centro de Moderación y Docencia</MEHTypography>
        </div>

        <TabList selectedValue={selectedTab} onTabSelect={(e, d) => setSelectedTab(d.value)}>
          <Tab value="recursos" icon={<Archive24Regular />}>Speaker Kit</Tab>
          <Tab value="clases" icon={<People24Regular />}>Mis Clases y Notas</Tab>
        </TabList>

        {loading && !selectedCurso && <Spinner label="Sincronizando datos..." />}

        {!loading && selectedTab === 'recursos' && (
            <div className={styles.resourceGrid}>
                {recursos.map((rec) => (
                    <MEHCard key={rec.id_recurso} className={styles.resourceItem}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div className={styles.iconContainer}>{getIcon(rec.tipo_archivo)}</div>
                        <Badge appearance="tint">{rec.tipo_archivo}</Badge>
                    </div>
                    <div style={{ flexGrow: 1 }}>
                        <MEHTypography variant="h3">{rec.titulo}</MEHTypography>
                        <MEHTypography variant="caption" style={{ opacity: 0.7 }}>{rec.descripcion}</MEHTypography>
                    </div>
                    <Button icon={<ArrowDownload24Regular />} appearance="outline" onClick={() => window.open(rec.url_descarga, '_blank')}>Descargar</Button>
                    </MEHCard>
                ))}
            </div>
        )}

        {!loading && selectedTab === 'clases' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                    {misCursos.map(c => (
                        <MEHCard key={c.id_curso} style={{ cursor: 'pointer', border: selectedCurso === c.id_curso ? `2px solid ${tokens.colorBrandBackground}` : '' }} onClick={() => handleVerAlumnos(c.id_curso)}>
                            <MEHTypography variant="h3">{c.nombre_curso}</MEHTypography>
                            <MEHTypography variant="caption" style={{ display: 'block', marginTop: '8px' }}>{c.estado}</MEHTypography>
                            <MEHButton size="small" style={{ marginTop: '12px' }}>Gestionar Notas</MEHButton>
                        </MEHCard>
                    ))}
                </div>

                {selectedCurso && (
                    <MEHCard>
                        <MEHTypography variant="h2" style={{ marginBottom: '16px', display: 'block' }}>Libreta de Notas</MEHTypography>
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
                                                style={{ width: '80px' }}
                                                onBlur={(e) => al.tempNota = e.target.value}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <MEHButton icon={<Save24Regular />} appearance="subtle" onClick={() => handleAsignarNota(al.id_inscripcion_curso, al.tempNota || al.nota_final)} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </MEHCard>
                )}
            </div>
        )}
      </div>
    </MainLayout>
  );

  // Helper para asignar nota
  async function handleAsignarNota(idInscripcion, nota) {
    try {
        await cursoService.setNotaAlumno(idInscripcion, nota);
        alert("Nota actualizada");
        handleVerAlumnos(selectedCurso);
    } catch (err) {
        alert("Error al actualizar nota");
    }
  }
};

export default SpeakerKit;

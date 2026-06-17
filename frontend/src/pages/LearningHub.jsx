import React, { useState, useEffect } from 'react';
import { 
  makeStyles, shorthands, tokens, Badge, Spinner, TabList, Tab, Input, ProgressBar
} from '@fluentui/react-components';
import { 
  Library24Regular, PlayCircle24Regular, DocumentPdf24Regular, Link24Regular, Clock24Regular, Person24Regular,
  ArrowDownload24Regular, Ribbon24Regular,
  BookOpen24Regular, Globe24Regular, Search24Regular, CheckmarkCircle24Regular
} from '@fluentui/react-icons';
import { MEHCard, MEHButton, MEHTypography } from '../components/ui';
import cursoService from '../services/cursoService';
import { useNavigate } from 'react-router-dom';
import { useAuth, useNotify } from '../App';
import { generateCertificatePDF } from '../services/certificateGenerator';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    animationName: { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
    animationDuration: '0.5s',
  },
  courseGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    ...shorthands.gap('24px'),
  },
  courseCard: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.padding(0),
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    ':hover': { transform: 'translateY(-5px)', boxShadow: `0 12px 24px -8px ${tokens.colorBrandBackground2}` }
  },
  cardBanner: { height: '140px', width: '100%', objectFit: 'cover', backgroundColor: tokens.colorNeutralBackground3 },
  cardContent: { ...shorthands.padding('20px'), display: 'flex', flexDirection: 'column', gap: '12px' },
  certItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    ...shorthands.padding('16px'),
    ...shorthands.borderRadius('12px'),
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    ...shorthands.border('1px', 'solid', 'rgba(255, 255, 255, 0.05)'),
    transition: 'all 0.2s ease',
    ':hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' }
  },
  sectionGrid: {
   display: 'grid',
   gridTemplateColumns: '1fr 1fr',
   gap: '32px',
   '@media (max-width: 900px)': {
     gridTemplateColumns: '1fr',
     gap: '20px'
   }
  },
  emptyCard: {
   ...shorthands.padding('24px'),
   textAlign: 'center',
   opacity: 0.8
  }
});

const LearningHub = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notify } = useNotify();
  
  const [activeTab, setActiveTab] = useState('local');
  const [cursos, setCursos] = useState([]);
  const [msCursos, setMsCursos] = useState([]);
  const [certificados, setCertificados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingCertId, setGeneratingCertId] = useState(null);
  const [startingCourseId, setStartingCourseId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [misInscripcionesCursos, setMisInscripcionesCursos] = useState([]);

  const filteredCursos = React.useMemo(() => {
    if (!searchQuery) return cursos;
    const q = searchQuery.toLowerCase();
    return cursos.filter(c => 
      c.nombre_curso.toLowerCase().includes(q) || 
      (c.descripcion && c.descripcion.toLowerCase().includes(q))
    );
  }, [cursos, searchQuery]);

  const filteredMsCursos = React.useMemo(() => {
    if (!searchQuery) return msCursos;
    const q = searchQuery.toLowerCase();
    return msCursos.filter(m => 
      m.title.toLowerCase().includes(q) || 
      (m.summary && m.summary.toLowerCase().includes(q))
    );
  }, [msCursos, searchQuery]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cursosData, certData, msData, inscripcionesCursosData] = await Promise.all([
        cursoService.getCursos(),
        cursoService.getMisCertificados(),
        cursoService.getMSCatalog(),
        cursoService.getMisInscripcionesCursos().catch(() => [])
      ]);
      setCursos(cursosData);
      setCertificados(certData);
      setMsCursos(msData.modules?.slice(0, 12) || []);
      setMisInscripcionesCursos(inscripcionesCursosData || []);
    } catch (err) {
      console.error("Error cargando Learning Hub:", err);
      const detail = err?.response?.data?.detail;
      notify("Error", typeof detail === "string" ? detail : "No se pudo cargar el Learning Hub.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStartCourse = async (curso) => {
    if (!curso?.id_curso) return;
    setStartingCourseId(curso.id_curso);
    try {
      await cursoService.inscribirseCurso(curso.id_curso);
      notify("Inscripción exitosa", `Te inscribiste en ${curso.nombre_curso}.`, "success");
      navigate(`/learning/curso/${curso.id_curso}`);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      const message = typeof detail === "string" ? detail : "No se pudo iniciar este curso.";
      if (err?.response?.status === 400 || err?.response?.status === 409) {
        notify("Ya inscrito", message, "info");
        navigate(`/learning/curso/${curso.id_curso}`);
      } else {
        notify("Error", message, "error");
      }
    } finally {
      setStartingCourseId(null);
    }
  };

  const handleOpenMsLearn = (module) => {
    if (!module?.url) {
      notify("Sin enlace", "Este módulo no tiene URL disponible.", "warning");
      return;
    }
    window.open(module.url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadCertificate = async (cert) => {
    if (!user) {
      notify("Error", "No se encontró el usuario para generar el certificado.", "error");
      return;
    }
    setGeneratingCertId(cert.id_certificado);
    try {
        await generateCertificatePDF({
            fullName: `${user.nombres} ${user.apellidos}`,
            eventName: cert.nombre_curso_evento,
            date: cert.fecha_emision,
            code: cert.uuid_verificacion || cert.codigo_verificacion,
            templateUrl: null
        });
        notify("Éxito", "Certificado generado correctamente", "success");
    } catch (err) {
      const detail = err?.response?.data?.detail;
      notify("Error", typeof detail === "string" ? detail : "No se pudo generar el PDF", "error");
    } finally {
      setGeneratingCertId(null);
    }
  };

  const DEFAULT_BANNER = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop";

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Library24Regular style={{ color: tokens.colorBrandForeground1, fontSize: '32px' }} />
          <MEHTypography variant="h1">Learning Hub</MEHTypography>
        </div>
        <Input
          contentBefore={<Search24Regular style={{ color: tokens.colorNeutralForeground4 }} />}
          placeholder={activeTab === 'local' ? "Buscar cursos de la comunidad..." : "Buscar en Microsoft Learn..."}
          value={searchQuery}
          onChange={(e, data) => setSearchQuery(data.value)}
          style={{ maxWidth: '320px', width: '100%' }}
        />
      </div>

      <TabList selectedValue={activeTab} onTabSelect={(e, d) => {
        setActiveTab(d.value);
        setSearchQuery('');
      }}>
        <Tab value="local" icon={<BookOpen24Regular />}>Cursos de la Comunidad</Tab>
        <Tab value="ms" icon={<Globe24Regular />}>Catálogo Microsoft Learn</Tab>
      </TabList>

      {loading ? <Spinner label="Buscando nuevas rutas de aprendizaje..." /> : (
        <section>
          <div className={styles.courseGrid}>
            {activeTab === 'local' ? (
              filteredCursos.length > 0 ? filteredCursos.map(curso => (
                <MEHCard key={curso.id_curso} className={styles.courseCard}>
                  <img src={curso.imagen_url || DEFAULT_BANNER} alt={`Portada de ${curso.nombre_curso}`} className={styles.cardBanner} />
                  <div className={styles.cardContent}>
                    <MEHTypography variant="h3">{curso.nombre_curso}</MEHTypography>
                    <div style={{ display: 'flex', gap: '12px', opacity: 0.6 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}><Clock24Regular fontSize={14} /> {curso.horas_academicas}h</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}><Person24Regular fontSize={14} /> Instructor MEH</span>
                    </div>
                    <MEHTypography variant="caption" style={{ opacity: 0.7, minHeight: '40px' }}>{curso.descripcion}</MEHTypography>
                    
                    {(() => {
                      const inscripcion = misInscripcionesCursos.find(ins => ins.id_curso === curso.id_curso);
                      const hasProgress = inscripcion !== undefined;
                      const porcentajeProgreso = hasProgress ? inscripcion.progreso : 0;
                      return (
                        <>
                          {hasProgress && (
                            <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontSize: '12px', color: tokens.colorBrandForeground1, fontWeight: 'bold' }}>
                                  {porcentajeProgreso}% completado
                                </span>
                              </div>
                              <ProgressBar value={porcentajeProgreso / 100} color={porcentajeProgreso === 100 ? "success" : "brand"} style={{ height: '6px' }} />
                            </div>
                          )}
                          <MEHButton
                            appearance={hasProgress ? "outline" : "primary"}
                            icon={porcentajeProgreso === 100 ? <CheckmarkCircle24Regular style={{ color: '#22B14C' }} /> : <PlayCircle24Regular />}
                            onClick={() => {
                              if (hasProgress) {
                                navigate(`/learning/curso/${curso.id_curso}`);
                              } else {
                                handleStartCourse(curso);
                              }
                            }}
                            disabled={startingCourseId === curso.id_curso}
                            style={{ width: '100%' }}
                          >
                            {startingCourseId === curso.id_curso ? "Iniciando..." : 
                             hasProgress ? (porcentajeProgreso === 100 ? "Aula Virtual (Completado)" : "Continuar Aprendiendo") : "Empezar ahora"}
                          </MEHButton>
                        </>
                      );
                    })()}
                  </div>
                </MEHCard>
              )) : (
                <MEHCard className={styles.emptyCard} style={{ gridColumn: '1 / -1' }}>
                  <MEHTypography variant="caption">No se encontraron cursos de la comunidad.</MEHTypography>
                </MEHCard>
              )
            ) : (
              filteredMsCursos.length > 0 ? filteredMsCursos.map(m => (
                <MEHCard key={m.uid} className={styles.courseCard}>
                  <div style={{ height: '140px', backgroundColor: '#0078d4', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <img 
                        src={m.icon_url || "https://img.icons8.com/color/96/000000/microsoft.png"} 
                        style={{ width: '80px', height: '80px', objectFit: 'contain' }} 
                        alt={`Icono del módulo ${m.title || 'Microsoft Learn'}`} 
                      />
                      {m.levels && m.levels.length > 0 && (
                        <Badge appearance="filled" style={{ position: 'absolute', bottom: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.6)' }}>
                          {m.levels[0]}
                        </Badge>
                      )}
                  </div>
                  <div className={styles.cardContent}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Badge color="brand" appearance="tint">Microsoft Official</Badge>
                        <span style={{ fontSize: '12px', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock24Regular fontSize={14} /> {m.duration_in_minutes || '30'}m
                        </span>
                    </div>
                    <MEHTypography variant="h3" style={{ fontSize: '1.1rem', lineHeight: '1.3' }}>{m.title}</MEHTypography>
                    <MEHTypography variant="caption" style={{ opacity: 0.7, minHeight: '60px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {m.summary}
                    </MEHTypography>
                    <MEHButton 
                        appearance="primary" 
                        icon={<Link24Regular />} 
                        onClick={() => handleOpenMsLearn(m)}
                        disabled={!m.url}
                        style={{ marginTop: 'auto' }}
                    >
                        Ver en MS Learn
                    </MEHButton>
                  </div>
                </MEHCard>
              )) : (
                <MEHCard className={styles.emptyCard} style={{ gridColumn: '1 / -1' }}>
                  <MEHTypography variant="caption">No se encontraron módulos de Microsoft Learn.</MEHTypography>
                </MEHCard>
              )
            )}
          </div>
        </section>
      )}

      <div className={styles.sectionGrid}>
          <MEHCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Ribbon24Regular style={{ color: tokens.colorBrandForeground1 }} />
              <MEHTypography variant="h3">Mis Diplomas</MEHTypography>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {certificados.length > 0 ? certificados.map(cert => (
                <div key={cert.id_certificado} className={styles.certItem}>
                  <DocumentPdf24Regular style={{ color: tokens.colorBrandForeground1, fontSize: '28px' }} />
                  <div style={{ flexGrow: 1 }}>
                    <MEHTypography variant="caption" style={{ fontWeight: 'bold', display: 'block' }}>{cert.nombre_curso_evento}</MEHTypography>
                    <MEHTypography variant="caption" style={{ opacity: 0.6 }}>{cert.codigo_verificacion || cert.uuid_verificacion}</MEHTypography>
                  </div>
                  <MEHButton
                    appearance="subtle"
                    icon={<ArrowDownload24Regular />}
                    aria-label={`Descargar certificado de ${cert.nombre_curso_evento}`}
                    onClick={() => handleDownloadCertificate(cert)}
                    disabled={generatingCertId === cert.id_certificado}
                  />
                </div>
              )) : <MEHTypography variant="caption">No hay certificados aún.</MEHTypography>}
            </div>
          </MEHCard>
          
          <MEHCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Link24Regular style={{ color: tokens.colorBrandForeground1 }} />
              <MEHTypography variant="h3">Recursos VIP</MEHTypography>
            </div>
            <MEHTypography variant="caption" style={{ display: 'block', marginBottom: '12px' }}>Material exclusivo para embajadores y miembros activos.</MEHTypography>
            <MEHButton appearance="subtle" onClick={() => navigate('/recursos-vip')}>Explorar Biblioteca</MEHButton>
          </MEHCard>
      </div>
    </div>
  );
};

export default LearningHub;

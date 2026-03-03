import React, { useState, useEffect } from 'react';
import { 
  makeStyles, 
  shorthands, 
  tokens,
  Badge,
  Spinner
} from '@fluentui/react-components';
import { 
  Library24Regular,
  PlayCircle24Regular,
  DocumentPdf24Regular,
  Link24Regular,
  Clock24Regular,
  Person24Regular
} from '@fluentui/react-icons';
import MainLayout from '../components/layout/MainLayout';
import { MEHCard, MEHButton, MEHTypography } from '../components/ui';
import { designTokens } from '../theme/theme';
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
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    ...shorthands.gap('24px'),
  },
  courseCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'transform 0.2s',
    cursor: 'pointer',
    ':hover': {
      transform: 'translateY(-4px)',
      backgroundColor: 'rgba(255,255,255,0.05)',
    }
  },
  thumbnail: {
    width: '100%',
    height: '180px',
    backgroundColor: 'rgba(127, 19, 236, 0.2)',
    ...shorthands.borderRadius('12px'),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    ...shorthands.border('1px', 'solid', 'rgba(255,255,255,0.05)'),
  },
  resourceItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    ...shorthands.padding('16px'),
    backgroundColor: 'rgba(255,255,255,0.02)',
    ...shorthands.borderRadius('12px'),
    transition: 'all 0.2s',
    ...shorthands.border('1px', 'solid', 'rgba(255,255,255,0.05)'),
    ':hover': {
      backgroundColor: 'rgba(255,255,255,0.06)',
      transform: 'translateX(4px)',
    }
  }
});

const LearningHub = () => {
  const styles = useStyles();
  const [cursos, setCursos] = useState([]);
  const [certificados, setCertificados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cursosData, certData] = await Promise.all([
          cursoService.getCursos(),
          cursoService.getMisCertificados()
        ]);
        setCursos(cursosData);
        setCertificados(certData);
      } catch (err) {
        console.error("Error fetching Learning Hub data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getRandomColor = (id) => {
    const colors = ['#0078D4', '#107C10', '#D83B01', '#6A1B9A', '#008272'];
    return colors[id % colors.length];
  };

  return (
    <MainLayout>
      <div className={styles.container}>
        <div>
          <div className={styles.header}>
            <Library24Regular style={{ color: tokens.colorBrandForeground1, fontSize: '32px' }} />
            <MEHTypography variant="h1">Learning Hub</MEHTypography>
          </div>
          <MEHTypography variant="body" style={{ opacity: 0.6 }}>
            Accede a grabaciones, recursos y material de estudio exclusivo para la comunidad.
          </MEHTypography>
        </div>

        {/* Sección de Cursos Reales */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <MEHTypography variant="h2">Talleres y Workshops</MEHTypography>
            <Badge appearance="tint" color="brand">Total: {cursos.length}</Badge>
          </div>
          
          {loading ? (
            <Spinner label="Cargando catálogo educativo..." />
          ) : (
            <div className={styles.grid}>
              {cursos.map(curso => (
                <MEHCard key={curso.id_curso} className={styles.courseCard}>
                  <div className={styles.thumbnail} style={{ background: `linear-gradient(135deg, ${getRandomColor(curso.id_curso)}33, rgba(0,0,0,0.4))` }}>
                    <PlayCircle24Regular style={{ fontSize: '56px', color: 'rgba(255,255,255,0.8)' }} />
                    <div style={{ position: 'absolute', bottom: '12px', right: '12px', backgroundColor: 'rgba(0,0,0,0.7)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock24Regular style={{ fontSize: '14px' }} /> {curso.horas_academicas}h
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <Badge appearance="tint" color={curso.estado === 'ACTIVO' ? 'success' : 'warning'}>
                        {curso.estado}
                      </Badge>
                    </div>
                    <MEHTypography variant="h3" style={{ fontSize: '1.2rem' }}>{curso.nombre_curso}</MEHTypography>
                    <MEHTypography variant="caption" style={{ opacity: 0.7, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Person24Regular style={{ fontSize: '14px' }} /> Instructor MEH
                    </MEHTypography>
                    <MEHTypography variant="caption" style={{ opacity: 0.5, marginTop: '4px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {curso.descripcion || "Sin descripción disponible."}
                    </MEHTypography>
                  </div>
                  <MEHButton appearance="outline" style={{ marginTop: '8px' }}>Ver sesión</MEHButton>
                </MEHCard>
              ))}
              {cursos.length === 0 && (
                <MEHTypography variant="body" style={{ opacity: 0.5, gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                  Aún no hay cursos registrados en el sistema.
                </MEHTypography>
              )}
            </div>
          )}
        </section>

        {/* Recursos y Certificados */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '16px', [designTokens.breakpoints.md]: { gridTemplateColumns: '1fr' } }}>
          
          <MEHCard>
            <MEHTypography variant="h3" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link24Regular style={{ color: tokens.colorBrandForeground1 }} /> Recursos Recomendados
            </MEHTypography>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className={styles.resourceItem} onClick={() => window.open('https://learn.microsoft.com', '_blank')}>
                <img src="https://img.icons8.com/color/48/000000/microsoft.png" alt="ms" style={{ width: '28px' }} />
                <div style={{ flexGrow: 1 }}>
                  <MEHTypography variant="body" style={{ fontWeight: 'bold', display: 'block' }}>Microsoft Learn</MEHTypography>
                  <MEHTypography variant="caption" style={{ opacity: 0.6 }}>Rutas oficiales y preparación para exámenes.</MEHTypography>
                </div>
                <MEHButton appearance="subtle" size="small">Abrir</MEHButton>
              </div>
              <div className={styles.resourceItem} onClick={() => window.open('https://github.com/microsoft', '_blank')}>
                <img src="https://img.icons8.com/color/48/000000/github--v1.png" alt="gh" style={{ width: '28px' }} />
                <div style={{ flexGrow: 1 }}>
                  <MEHTypography variant="body" style={{ fontWeight: 'bold', display: 'block' }}>Repositorios MEH</MEHTypography>
                  <MEHTypography variant="caption" style={{ opacity: 0.6 }}>Prácticas, laboratorios y código de sesiones.</MEHTypography>
                </div>
                <MEHButton appearance="subtle" size="small">Abrir</MEHButton>
              </div>
            </div>
          </MEHCard>

          <MEHCard>
            <MEHTypography variant="h3" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <DocumentPdf24Regular style={{ color: tokens.colorBrandForeground1 }} /> Mis Certificados
            </MEHTypography>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {certificados.length > 0 ? (
                certificados.map(cert => (
                  <div key={cert.id_certificado} className={styles.resourceItem}>
                    <DocumentPdf24Regular style={{ color: tokens.colorBrandForeground1, fontSize: '28px' }} />
                    <div style={{ flexGrow: 1 }}>
                      <MEHTypography variant="body" style={{ fontWeight: 'bold', display: 'block' }}>Certificado #{cert.codigo_verificacion}</MEHTypography>
                      <MEHTypography variant="caption" style={{ opacity: 0.6 }}>Emitido el {new Date(cert.fecha_emision).toLocaleDateString()}</MEHTypography>
                    </div>
                    <MEHButton 
                      appearance="outline" 
                      size="small" 
                      onClick={() => window.open(`http://localhost:8000/${cert.url_pdf}`, '_blank')}
                    >
                      Descargar
                    </MEHButton>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', opacity: 0.5 }}>
                  <MEHTypography variant="caption">Aún no has generado certificados. ¡Completa un curso para obtener uno!</MEHTypography>
                </div>
              )}
            </div>
          </MEHCard>
        </div>

      </div>
    </MainLayout>
  );
};

export default LearningHub;

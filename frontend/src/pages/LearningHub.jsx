import React, { useState, useEffect } from 'react';
import { 
  makeStyles, 
  shorthands, 
  tokens,
  Badge,
  Spinner,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent
} from '@fluentui/react-components';
import { 
  Library24Regular,
  PlayCircle24Regular,
  DocumentPdf24Regular,
  Link24Regular,
  Clock24Regular,
  Person24Regular,
  CheckmarkCircle24Filled,
  ArrowDownload24Regular,
  Eye24Regular,
  Dismiss24Regular
} from '@fluentui/react-icons';
import MainLayout from '../components/layout/MainLayout';
import { MEHCard, MEHButton, MEHTypography } from '../components/ui';
import cursoService from '../services/cursoService';
import { useNavigate } from 'react-router-dom';

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
    ':hover': {
      transform: 'translateY(-5px)',
      boxShadow: `0 12px 24px -8px ${tokens.colorBrandBackground2}`,
    }
  },
  cardBanner: {
    height: '140px',
    width: '100%',
    objectFit: 'cover',
    backgroundColor: tokens.colorNeutralBackground3,
  },
  cardContent: {
    ...shorthands.padding('20px'),
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  certItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    ...shorthands.padding('16px'),
    ...shorthands.borderRadius('12px'),
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    ...shorthands.border('1px', 'solid', 'rgba(255, 255, 255, 0.05)'),
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    }
  },
  iframeViewer: {
    width: '100%',
    height: '500px',
    border: 'none',
    ...shorthands.borderRadius('8px'),
    backgroundColor: 'white'
  }
});

const LearningHub = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [certificados, setCertificados] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para el visor
  const [selectedCert, setSelectedCert] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cursosData, certData] = await Promise.all([
          cursoService.getCursos(),
          cursoService.getMisCertificados()
        ]);
        setCursos(cursosData);
        setCertificados(certData);
      } catch (err) {
        console.error("Error cargando Learning Hub:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openViewer = (cert) => {
    setSelectedCert(cert);
    setIsViewerOpen(true);
  };

  const DEFAULT_BANNER = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop";

  return (
    <MainLayout>
      <div className={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Library24Regular style={{ color: tokens.colorBrandForeground1, fontSize: '32px' }} />
            <MEHTypography variant="h1">Learning Hub</MEHTypography>
          </div>
          <Badge appearance="tint" color="brand" size="large">Centro de Capacitación</Badge>
        </div>

        {/* 1. CURSOS DISPONIBLES */}
        <section>
          <MEHTypography variant="h3" style={{ marginBottom: '20px', display: 'block' }}>Rutas de Aprendizaje</MEHTypography>
          {loading ? (
            <Spinner label="Buscando nuevos retos..." />
          ) : (
            <div className={styles.courseGrid}>
              {cursos.map(curso => (
                <MEHCard key={curso.id_curso} className={styles.courseCard}>
                  <img src={curso.imagen_url || DEFAULT_BANNER} alt="banner" className={styles.cardBanner} />
                  <div className={styles.cardContent}>
                    <MEHTypography variant="h3">{curso.nombre_curso}</MEHTypography>
                    <div style={{ display: 'flex', gap: '12px', opacity: 0.6 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                        <Clock24Regular fontSize={14} /> {curso.horas_academicas}h
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                        <Person24Regular fontSize={14} /> Instructor MEH
                      </span>
                    </div>
                    <MEHTypography variant="caption" style={{ opacity: 0.7, minHeight: '40px' }}>
                      {curso.descripcion}
                    </MEHTypography>
                    <MEHButton appearance="primary" icon={<PlayCircle24Regular />}>Empezar ahora</MEHButton>
                  </div>
                </MEHCard>
              ))}
            </div>
          )}
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px', '@media (max-width: 1024px)': { gridTemplateColumns: '1fr' } }}>
          {/* 2. RECURSOS COMPLEMENTARIOS */}
          <MEHCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Link24Regular style={{ color: tokens.colorBrandForeground1 }} />
              <MEHTypography variant="h3">Recursos Recomendados</MEHTypography>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ ...shorthands.padding('12px'), borderLeft: `4px solid ${tokens.colorBrandBackground}`, backgroundColor: 'rgba(127, 19, 236, 0.05)' }}>
                <MEHTypography variant="body" style={{ fontWeight: 'bold' }}>Documentación Oficial de Azure</MEHTypography>
                <MEHTypography variant="caption" style={{ display: 'block', opacity: 0.6 }}>Guía completa para certificación AZ-900.</MEHTypography>
              </div>
              <div style={{ ...shorthands.padding('12px'), borderLeft: `4px solid ${tokens.colorNeutralBackground1}`, backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                <MEHTypography variant="body" style={{ fontWeight: 'bold' }}>Microsoft Learn</MEHTypography>
                <MEHTypography variant="caption" style={{ display: 'block', opacity: 0.6 }}>Rutas gratuitas e interactivas.</MEHTypography>
              </div>
            </div>
          </MEHCard>

          {/* 3. MIS CERTIFICADOS (CON VISOR) */}
          <MEHCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <DocumentPdf24Regular style={{ color: tokens.colorBrandForeground1 }} />
              <MEHTypography variant="h3">Mis Diplomas</MEHTypography>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {certificados.length > 0 ? (
                certificados.map(cert => (
                  <div key={cert.id_certificado} className={styles.certItem}>
                    <DocumentPdf24Regular style={{ color: tokens.colorBrandForeground1, fontSize: '28px' }} />
                    <div style={{ flexGrow: 1 }}>
                      <MEHTypography variant="caption" style={{ fontWeight: 'bold', display: 'block' }}>Certificado MEH</MEHTypography>
                      <MEHTypography variant="caption" style={{ opacity: 0.6 }}>{cert.codigo_verificacion}</MEHTypography>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <MEHButton 
                            appearance="subtle" 
                            icon={<Eye24Regular />} 
                            onClick={() => openViewer(cert)} 
                        />
                        <MEHButton 
                            appearance="subtle" 
                            icon={<ArrowDownload24Regular />} 
                            onClick={() => window.open(cert.url_pdf, '_blank')} 
                        />
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', opacity: 0.5 }}>
                  <DocumentPdf24Regular fontSize={40} style={{ marginBottom: '8px' }} />
                  <MEHTypography variant="caption" style={{ display: 'block' }}>No hay certificados disponibles.</MEHTypography>
                </div>
              )}
            </div>
          </MEHCard>
        </div>

        {/* DIALOGO VISOR DE CERTIFICADOS */}
        <Dialog open={isViewerOpen} onOpenChange={(e, data) => setIsViewerOpen(data.open)}>
            <DialogSurface style={{ maxWidth: '900px', width: '90%' }}>
                <DialogBody>
                    <DialogTitle 
                        action={<MEHButton appearance="subtle" icon={<Dismiss24Regular />} onClick={() => setIsViewerOpen(false)} />}
                    >
                        Vista Previa del Diploma
                    </DialogTitle>
                    <DialogContent>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <MEHTypography variant="body">Código de Validación: <b>{selectedCert?.codigo_verificacion}</b></MEHTypography>
                            {selectedCert?.url_pdf ? (
                                <iframe 
                                    src={selectedCert.url_pdf} 
                                    className={styles.iframeViewer} 
                                    title="Certificado"
                                />
                            ) : (
                                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.colorNeutralBackground3 }}>
                                    <Spinner label="Cargando documento..." />
                                </div>
                            )}
                            <MEHTypography variant="caption" style={{ opacity: 0.6 }}>
                                Nota: Esta es una vista previa oficial. Puedes descargar el archivo original para impresión de alta calidad.
                            </MEHTypography>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <MEHButton appearance="outline" onClick={() => setIsViewerOpen(false)}>Cerrar</MEHButton>
                        <MEHButton appearance="primary" icon={<ArrowDownload24Regular />} onClick={() => window.open(selectedCert?.url_pdf, '_blank')}>Descargar PDF</MEHButton>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>

      </div>
    </MainLayout>
  );
};

export default LearningHub;

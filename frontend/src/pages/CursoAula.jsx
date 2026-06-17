import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Spinner, makeStyles, shorthands, tokens, Divider, Field, Input, Textarea, Button } from '@fluentui/react-components';
import { ArrowLeft24Regular, PlayCircle24Regular, ClipboardTask24Regular, ArrowUpload24Regular, CheckmarkCircle24Regular, Link24Regular, DocumentText24Regular, Dismiss24Regular } from '@fluentui/react-icons';
import { useNavigate, useParams } from 'react-router-dom';
import { MEHCard, MEHButton, MEHTypography } from '../components/ui';
import api, { resolveApiFileUrl } from '../services/api';
import cursoService from '../services/cursoService';
import { useNotify } from '../App';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    animationName: { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
    animationDuration: '0.5s',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    paddingBottom: '16px',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '320px 1fr',
    gap: '24px',
    '@media (max-width: 900px)': {
      gridTemplateColumns: '1fr',
    }
  },
  sidebarCard: {
    height: 'fit-content',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  toggleTemarioBtn: {
    display: 'none',
    '@media (max-width: 900px)': {
      display: 'inline-flex',
    }
  },
  leccionesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    '@media (max-width: 900px)': {
      display: 'none',
    }
  },
  leccionesListVisible: {
    '@media (max-width: 900px)': {
      display: 'flex',
      marginTop: '12px',
    }
  },
  leccionItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    ...shorthands.padding('12px', '16px'),
    ...shorthands.borderRadius('12px'),
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: `1px solid transparent`,
    ':hover': {
      backgroundColor: 'rgba(127, 19, 236, 0.05)',
      transform: 'translateX(4px)',
    }
  },
  leccionItemActive: {
    backgroundColor: 'rgba(127, 19, 236, 0.1)',
    border: `1px solid ${tokens.colorBrandStroke1}`,
    color: tokens.colorBrandForeground1,
    boxShadow: `0 4px 12px rgba(127, 19, 236, 0.1)`,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  videoFrame: {
    width: '100%',
    aspectRatio: '16 / 9',
    height: 'auto',
    ...shorthands.borderRadius('16px'),
    border: 'none',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
  },
  richContent: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: tokens.colorNeutralForeground1,
    '& p': {
      marginBottom: '16px',
    },
    '& h3': {
      marginTop: '24px',
      marginBottom: '12px',
      color: tokens.colorBrandForeground1,
    }
  },
  taskSection: {
    marginTop: '24px',
    padding: '24px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    ...shorthands.borderRadius('16px'),
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  submissionBox: {
    marginTop: '16px',
    padding: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    ...shorthands.borderRadius('12px'),
    border: `1px dashed ${tokens.colorNeutralStroke3}`,
  },
  footerNav: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '32px',
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    paddingTop: '20px',
  },
  uploadBox: { 
    ...shorthands.border('2px', 'dashed', tokens.colorBrandStroke1), 
    ...shorthands.padding('20px'), 
    ...shorthands.borderRadius('12px'), 
    textAlign: 'center', 
    cursor: 'pointer', 
    backgroundColor: tokens.colorNeutralBackground1, 
    transition: 'all 0.2s ease', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    gap: '8px', 
    ':hover': { 
      backgroundColor: 'rgba(127, 19, 236, 0.05)', 
      ...shorthands.borderColor(tokens.colorBrandBackground) 
    } 
  }
});

const toEmbedUrl = (url) => {
  if (!url) return '';
  let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  let match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return url;
};
const CursoAula = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const { notify } = useNotify();
  const { idCurso } = useParams();

  const [loading, setLoading] = useState(true);
  const [curso, setCurso] = useState(null);
  const [lecciones, setLecciones] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expandedTemario, setExpandedTemario] = useState(false);

  // Estados para Tareas
  const [tareas, setTareas] = useState([]);
  const [entregas, setEntregas] = useState({}); // { id_tarea: entrega_obj }
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(null);
  const [submissionData, setSubmissionData] = useState({ archivo_url: '', comentario_alumno: '' });

  const selectedLeccion = lecciones[selectedIndex] || null;

  const fetchLeccionData = async (idLeccion) => {
    try {
       const [tRes] = await Promise.all([
         api.get(`/academia/lecciones/${idLeccion}/tareas`)
       ]);
       setTareas(tRes.data || []);
       
       // Buscar entregas del usuario para estas tareas
       tRes.data.forEach(async (t) => {
          try {
             const eRes = await api.get(`/academia/tareas/${t.id_tarea}/entregas`);
             // Filtramos la del usuario actual (el backend debería devolver solo la del usuario o todas si es admin, 
             // pero aquí asumimos que el endpoint está optimizado o filtramos en el cliente)
             // Nota: En un sistema real el backend filtraría por current_user.
             const miEntrega = eRes.data.find(e => e.id_usuario); // Simulado, el backend ya debería devolver la correcta
             if (miEntrega) setEntregas(prev => ({ ...prev, [t.id_tarea]: miEntrega }));
          } catch(e) {}
       });
    } catch (err) {}
  };

  useEffect(() => {
    if (selectedLeccion) fetchLeccionData(selectedLeccion.id_leccion);
  }, [selectedLeccion]);

  const handleSubmitTarea = async (idTarea) => {
    setSubmitting(true);
    try {
      const res = await api.post('/academia/tareas/entregar', { ...submissionData, id_tarea: idTarea });
      setEntregas(prev => ({ ...prev, [idTarea]: res.data }));
      notify("Éxito", "Tarea entregada correctamente", "success");
      setSubmissionData({ archivo_url: '', comentario_alumno: '' });
    } catch (err) {
      notify("Error", "No se pudo subir la entrega", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const progreso = useMemo(() => {
    if (!lecciones.length) return 0;
    return Math.round(((selectedIndex + 1) / lecciones.length) * 100);
  }, [lecciones.length, selectedIndex]);

  useEffect(() => {
    const saveProgress = async () => {
      if (progreso > 0 && idCurso) {
        try {
          await cursoService.updateProgresoCurso(idCurso, progreso);
        } catch (err) {
          console.error("Error al guardar progreso:", err);
        }
      }
    };
    saveProgress();
  }, [progreso, idCurso]);

  useEffect(() => {
    const fetchCursoAula = async () => {
      if (!idCurso) return;
      setLoading(true);
      try {
        const [cursoData, leccionesData] = await Promise.all([
          cursoService.getCurso(idCurso),
          cursoService.getLeccionesCurso(idCurso)
        ]);
        setCurso(cursoData || null);
        setLecciones(Array.isArray(leccionesData) ? leccionesData : []);
        setSelectedIndex(0);
      } catch (err) {
        const detail = err?.response?.data?.detail;
        notify("Error", typeof detail === "string" ? detail : "No se pudo abrir el aula del curso.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchCursoAula();
  }, [idCurso, notify]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <div>
            <MEHButton appearance="subtle" icon={<ArrowLeft24Regular />} onClick={() => navigate('/learning')}>
              Volver al Learning Hub
            </MEHButton>
          </div>
          <MEHTypography variant="h1" style={{ display: 'block', margin: 0 }}>
            {curso?.nombre_curso || 'Aula del Curso'}
          </MEHTypography>
          <MEHTypography variant="caption" style={{ display: 'block', opacity: 0.75 }}>
            {curso?.descripcion || 'Contenido de aprendizaje de la comunidad MEH.'}
          </MEHTypography>
        </div>
        <Badge color="brand" appearance="tint">{progreso}% completado</Badge>
      </div>

      {loading ? (
        <Spinner label="Cargando aula..." />
      ) : (
        <div className={styles.layout}>
          <MEHCard className={styles.sidebarCard}>
            <div className={styles.sidebar}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <MEHTypography variant="h3">Lecciones</MEHTypography>
                <MEHButton 
                  className={styles.toggleTemarioBtn}
                  appearance="subtle"
                  size="small"
                  onClick={() => setExpandedTemario(!expandedTemario)}
                >
                  {expandedTemario ? 'Ocultar Temario' : 'Ver Temario'}
                </MEHButton>
              </div>
              
              <div className={`${styles.leccionesList} ${expandedTemario ? styles.leccionesListVisible : ''}`}>
                {lecciones.length > 0 ? lecciones.map((l, idx) => (
                  <div
                    key={`lesson-${l.id_leccion}`}
                    className={`${styles.leccionItem} ${selectedIndex === idx ? styles.leccionItemActive : ''}`}
                    onClick={() => {
                      setSelectedIndex(idx);
                      setExpandedTemario(false); // Colapsar en móvil al seleccionar
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                      {selectedIndex === idx ? (
                        <PlayCircle24Regular style={{ color: tokens.colorBrandForeground1, fontSize: '20px' }} />
                      ) : (
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${tokens.colorNeutralStrokeAccessible}`, boxSizing: 'border-box' }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <MEHTypography variant="caption" style={{ display: 'block', opacity: 0.75, fontSize: '11px', lineHeight: '1.2' }}>
                          Lección {idx + 1}
                        </MEHTypography>
                        <MEHTypography variant="body" style={{ fontWeight: selectedIndex === idx ? '600' : 'normal', fontSize: '14px', display: 'block' }}>
                          {l.titulo}
                        </MEHTypography>
                      </div>
                    </div>
                  </div>
                )) : (
                  <MEHTypography variant="caption">Aún no hay lecciones publicadas para este curso.</MEHTypography>
                )}
              </div>
            </div>
          </MEHCard>

          <MEHCard>
            {selectedLeccion ? (
              <div className={styles.content}>
                <MEHTypography variant="h2">{selectedLeccion.titulo}</MEHTypography>
                {selectedLeccion.contenido_video_url && (
                  <>
                    {toEmbedUrl(selectedLeccion.contenido_video_url) ? (
                      <iframe
                        title={`Video de ${selectedLeccion.titulo}`}
                        className={styles.videoFrame}
                        src={toEmbedUrl(selectedLeccion.contenido_video_url)}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    ) : (
                      <MEHButton
                        icon={<PlayCircle24Regular />}
                        onClick={() => window.open(selectedLeccion.contenido_video_url, '_blank', 'noopener,noreferrer')}
                      >
                        Ver video de la lección
                      </MEHButton>
                    )}
                  </>
                )}

                <div
                  className={styles.richContent}
                  dangerouslySetInnerHTML={{
                    __html: selectedLeccion.contenido_texto || '<p>Esta lección todavía no tiene contenido de texto.</p>'
                  }}
                />

                {/* SECCIÓN DE TAREAS */}
                {tareas.length > 0 && (
                   <div className={styles.taskSection}>
                      <MEHTypography variant="h3" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ClipboardTask24Regular /> Tareas de la Lección
                      </MEHTypography>
                      
                      {tareas.map(t => {
                         const entrega = entregas[t.id_tarea];
                         return (
                            <div key={t.id_tarea} className={styles.submissionBox}>
                               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <MEHTypography variant="bold">{t.titulo}</MEHTypography>
                                  <Badge appearance="filled" color={entrega ? "success" : "neutral"}>
                                     {entrega ? "Entregada" : "Pendiente"}
                                  </Badge>
                               </div>
                               <MEHTypography variant="body" style={{ display: 'block', margin: '8px 0', opacity: 0.8 }}>
                                  {t.instrucciones}
                               </MEHTypography>
                               <MEHTypography variant="caption" style={{ opacity: 0.6, display: 'block' }}>Puntaje máximo: {t.puntos_max} pts</MEHTypography>
                               {t.fecha_entrega_limite && (
                                  <MEHTypography variant="caption" style={{ display: 'block', marginTop: '4px', opacity: 0.7 }}>
                                     📅 Fecha límite: {new Date(t.fecha_entrega_limite).toLocaleDateString()}
                                  </MEHTypography>
                               )}

                               <Divider style={{ margin: '12px 0' }} />

                               {!entrega ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                     <Field label="URL / Enlace de tu trabajo">
                                        <Input 
                                          placeholder="e.g. enlace a Google Drive, GitHub, Notion, YouTube, etc."
                                          contentBefore={<Link24Regular />}
                                          value={submissionData.archivo_url || ''}
                                          onChange={(e, d) => setSubmissionData({ ...submissionData, archivo_url: d.value })}
                                        />
                                     </Field>
                                     
                                     <Field label="O sube un archivo desde tu dispositivo">
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                           <div 
                                             className={styles.uploadBox} 
                                             style={{ padding: '12px', minHeight: '60px' }}
                                             onClick={() => document.getElementById(`entrega-file-${t.id_tarea}`).click()}
                                           >
                                             {uploadingFile === t.id_tarea ? (
                                               <Spinner size="small" label="Subiendo archivo..." />
                                             ) : (
                                               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                 <ArrowUpload24Regular />
                                                 <MEHTypography variant="caption">
                                                   {submissionData.archivo_url ? "Reemplazar archivo local" : "Subir archivo local (PDF, Word, Zip, Foto, etc.)"}
                                                 </MEHTypography>
                                               </div>
                                             )}
                                           </div>
                                           <input 
                                             id={`entrega-file-${t.id_tarea}`} 
                                             type="file" 
                                             onChange={async (e) => {
                                               const file = e.target.files[0];
                                               if (!file) return;
                                               setUploadingFile(t.id_tarea);
                                               try {
                                                 const formData = new FormData();
                                                 formData.append('file', file);
                                                 const res = await api.post('/files/upload', formData);
                                                 setSubmissionData({ ...submissionData, archivo_url: res.data.url });
                                               } catch (err) {
                                                 console.error("Fallo al subir archivo", err);
                                                 notify("Error", "No se pudo cargar el archivo local", "error");
                                               } finally {
                                                 setUploadingFile(null);
                                               }
                                             }}
                                             style={{ display: 'none' }} 
                                           />
                                        </div>
                                     </Field>
                                     
                                     {submissionData.archivo_url && (
                                       <div style={{ 
                                         display: 'flex', 
                                         alignItems: 'center', 
                                         justifyContent: 'space-between', 
                                         padding: '8px 12px', 
                                         backgroundColor: tokens.colorNeutralBackground3, 
                                         borderRadius: '8px',
                                         border: `1px solid ${tokens.colorNeutralBackground1}`
                                       }}>
                                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                           {submissionData.archivo_url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                                             <img 
                                               src={resolveApiFileUrl(submissionData.archivo_url)} 
                                               alt="Preview" 
                                               style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '4px' }} 
                                             />
                                           ) : (
                                             <DocumentText24Regular color={tokens.colorBrandForeground1} />
                                           )}
                                           <span style={{ fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '220px' }}>
                                             {submissionData.archivo_url}
                                           </span>
                                         </div>
                                         <Button 
                                           size="small" 
                                           appearance="subtle" 
                                           icon={<Dismiss24Regular color={tokens.colorPaletteRedForeground1} />} 
                                           onClick={() => setSubmissionData({ ...submissionData, archivo_url: '' })}
                                         />
                                       </div>
                                     )}

                                     <Field label="Comentario (Opcional)">
                                        <Textarea 
                                          placeholder="Escribe alguna nota o duda para el docente..."
                                          value={submissionData.comentario_alumno}
                                          onChange={(e, d) => setSubmissionData({ ...submissionData, comentario_alumno: d.value })}
                                        />
                                     </Field>
                                     <MEHButton 
                                       appearance="primary" 
                                       icon={<ArrowUpload24Regular />} 
                                       onClick={() => handleSubmitTarea(t.id_tarea)}
                                       disabled={submitting || uploadingFile === t.id_tarea}
                                     >
                                        Subir Entrega
                                     </MEHButton>
                                  </div>
                               ) : (
                                  <div style={{ backgroundColor: tokens.colorNeutralBackground2, padding: '12px', borderRadius: '8px' }}>
                                     <MEHTypography variant="bold" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: tokens.colorPaletteGreenForeground1 }}>
                                        <CheckmarkCircle24Regular /> Tarea Enviada
                                     </MEHTypography>
                                     <MEHTypography variant="caption" style={{ display: 'block', marginTop: '4px' }}>
                                        <b>Archivo:</b> <a href={entrega.archivo_url} target="_blank" rel="noreferrer" style={{ color: tokens.colorBrandForeground1 }}>Ver mi entrega</a>
                                     </MEHTypography>
                                     
                                     {entrega.nota !== null ? (
                                        <div style={{ marginTop: '12px', padding: '12px', backgroundColor: tokens.colorBrandBackground2, borderRadius: '8px' }}>
                                           <MEHTypography variant="bold">Calificación: {entrega.nota} / {t.puntos_max}</MEHTypography>
                                           {entrega.comentario_docente && (
                                              <MEHTypography variant="caption" style={{ display: 'block', marginTop: '4px', fontStyle: 'italic' }}>
                                                 <b>Docente:</b> {entrega.comentario_docente}
                                              </MEHTypography>
                                           )}
                                        </div>
                                     ) : (
                                        <Badge appearance="tint" style={{ marginTop: '8px' }}>Esperando calificación...</Badge>
                                     )}
                                  </div>
                               )}
                            </div>
                         );
                      })}
                   </div>
                )}

                <div className={styles.footerNav}>
                  <MEHButton appearance="subtle" disabled={selectedIndex === 0} onClick={() => setSelectedIndex((prev) => prev - 1)}>
                    Lección anterior
                  </MEHButton>
                  <MEHButton
                    appearance="primary"
                    disabled={selectedIndex >= lecciones.length - 1}
                    onClick={() => setSelectedIndex((prev) => prev + 1)}
                  >
                    Siguiente lección
                  </MEHButton>
                </div>
              </div>
            ) : (
              <MEHTypography variant="caption">Selecciona una lección para comenzar.</MEHTypography>
            )}
          </MEHCard>
        </div>
      )}
    </div>
  );
};

export default CursoAula;

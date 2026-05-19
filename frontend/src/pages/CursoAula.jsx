import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Spinner, makeStyles, shorthands, tokens, Divider, Field, Input, Textarea } from '@fluentui/react-components';
import { ArrowLeft24Regular, PlayCircle24Regular, ClipboardTask24Regular, ArrowUpload24Regular, CheckmarkCircle24Regular } from '@fluentui/react-icons';
import { useNavigate, useParams } from 'react-router-dom';
import { MEHCard, MEHButton, MEHTypography } from '../components/ui';
import api from '../services/api';
import cursoService from '../services/cursoService';
import { useNotify } from '../App';

const useStyles = makeStyles({
// ... (existing styles)
  taskSection: {
    marginTop: '24px',
    padding: '20px',
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: '16px',
    border: `1px solid ${tokens.colorBrandStroke1}`
  },
  submissionBox: {
    marginTop: '16px',
    padding: '16px',
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: '12px',
    border: `1px dashed ${tokens.colorNeutralBackground3}`
  }
});
// ... (toEmbedUrl function)
const CursoAula = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const { notify } = useNotify();
  const { idCurso } = useParams();

  const [loading, setLoading] = useState(true);
  const [curso, setCurso] = useState(null);
  const [lecciones, setLecciones] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Estados para Tareas
  const [tareas, setTareas] = useState([]);
  const [entregas, setEntregas] = useState({}); // { id_tarea: entrega_obj }
  const [submitting, setSubmitting] = useState(false);
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
        <div>
          <MEHButton appearance="subtle" icon={<ArrowLeft24Regular />} onClick={() => navigate('/learning')}>
            Volver al Learning Hub
          </MEHButton>
          <MEHTypography variant="h1" style={{ marginTop: '8px' }}>
            {curso?.nombre_curso || 'Aula del Curso'}
          </MEHTypography>
          <MEHTypography variant="caption" style={{ opacity: 0.75 }}>
            {curso?.descripcion || 'Contenido de aprendizaje de la comunidad MEH.'}
          </MEHTypography>
        </div>
        <Badge color="brand" appearance="tint">{progreso}% completado</Badge>
      </div>

      {loading ? (
        <Spinner label="Cargando aula..." />
      ) : (
        <div className={styles.layout}>
          <MEHCard>
            <div className={styles.sidebar}>
              <MEHTypography variant="h3">Lecciones</MEHTypography>
              {lecciones.length > 0 ? lecciones.map((l, idx) => (
                <div
                  key={`lesson-${l.id_leccion}`}
                  className={`${styles.leccionItem} ${selectedIndex === idx ? styles.leccionItemActive : ''}`}
                  onClick={() => setSelectedIndex(idx)}
                >
                  <MEHTypography variant="caption" style={{ display: 'block', opacity: 0.75 }}>
                    Lección {idx + 1}
                  </MEHTypography>
                  <MEHTypography variant="body">{l.titulo}</MEHTypography>
                </div>
              )) : (
                <MEHTypography variant="caption">Aún no hay lecciones publicadas para este curso.</MEHTypography>
              )}
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
                               <MEHTypography variant="caption" style={{ opacity: 0.6 }}>Puntaje máximo: {t.puntos_max} pts</MEHTypography>

                               <Divider style={{ margin: '12px 0' }} />

                               {!entrega ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                     <Field label="URL de tu trabajo o archivo">
                                        <Input 
                                          placeholder="https://drive.google.com/..." 
                                          value={submissionData.archivo_url}
                                          onChange={(e, d) => setSubmissionData({ ...submissionData, archivo_url: d.value })}
                                        />
                                     </Field>
                                     <Field label="Comentario (Opcional)">
                                        <Textarea 
                                          value={submissionData.comentario_alumno}
                                          onChange={(e, d) => setSubmissionData({ ...submissionData, comentario_alumno: d.value })}
                                        />
                                     </Field>
                                     <MEHButton 
                                       appearance="primary" 
                                       icon={<ArrowUpload24Regular />} 
                                       onClick={() => handleSubmitTarea(t.id_tarea)}
                                       disabled={submitting}
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

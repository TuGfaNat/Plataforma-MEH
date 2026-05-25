import React, { useState, useEffect } from 'react';
import { 
  Divider, Badge, Button, Avatar, Field, Input, Accordion, AccordionItem, AccordionHeader, AccordionPanel, 
  tokens, makeStyles, shorthands, Tooltip, Spinner, Textarea,
  Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell,
  Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions, Link
} from '@fluentui/react-components';
import { 
  Add24Regular, HatGraduation24Regular, Edit24Regular, Delete24Regular,
  Save24Regular, Dismiss24Regular, ArrowUpload24Regular, Clock24Regular,
  BookOpen24Regular, DocumentText24Regular, Video24Regular, Edit20Regular, Delete20Regular,
  ClipboardTask24Regular, Person24Regular, Checkmark24Regular
} from '@fluentui/react-icons';
import ReactQuill from 'react-quill-new';
import { useTranslation } from 'react-i18next';
import { MEHButton, MEHTypography } from '../../components/ui';
import api, { resolveApiFileUrl } from '../../services/api';

const useStyles = makeStyles({
// ... (rest of styles same as before, adding some for tasks)
  taskCard: {
    padding: '16px',
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: '12px',
    border: `1px solid ${tokens.colorNeutralBackground3}`,
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  gradingArea: {
    marginTop: '20px',
    padding: '20px',
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: '16px',
    border: `1px solid ${tokens.colorBrandStroke1}`
  }
});

const AcademyTab = ({ 
  data, selectedCursoId, setSelectedCursoId, isAddingCurso, setIsAddingCurso,
  isEditingCurso, setIsEditingCurso, newCurso, setNewCurso, 
  handleSaveCurso, handleEditCurso, lecciones, 
  isAddingLeccion, setIsAddingLeccion, isEditingLeccion, setIsEditingLeccion,
  newLeccion, setNewLeccion, handleSaveLeccion, handleEditLeccion,
  confirmDelete, fetchLecciones, handleFileUpload, uploading, quillModules,
  fetchData
}) => {
  const styles = useStyles();
  const { t } = useTranslation();

  // Estados para Tareas
  const [tareas, setTareas] = useState({}); // { id_leccion: [tareas] }
  const [isAddingTarea, setIsAddingTarea] = useState(false);
  const [isEditingTarea, setIsEditingTarea] = useState(false);
  const [currentTareaId, setCurrentTareaId] = useState(null);
  const [currentLeccionIdForTarea, setCurrentLeccionIdForTarea] = useState(null);
  const [newTarea, setNewTarea] = useState({ titulo: '', instrucciones: '', puntos_max: 100, fecha_entrega_limite: '' });

  // Estados para Entregas
  const [showEntregas, setShowEntregas] = useState(false);
  const [currentTareaForEntregas, setCurrentTareaForEntregas] = useState(null);
  const [entregas, setEntregas] = useState([]);
  const [gradingEntrega, setGradingEntrega] = useState(null);
  const [gradeData, setGradeData] = useState({ nota: 100, comentario_docente: '' });

  const fetchTareas = async (idLeccion) => {
    try {
      const res = await api.get(`/academia/lecciones/${idLeccion}/tareas`);
      setTareas(prev => ({ ...prev, [idLeccion]: res.data || [] }));
    } catch (err) { console.error(err); }
  };

  const fetchEntregas = async (idTarea) => {
    try {
      const res = await api.get(`/academia/tareas/${idTarea}/entregas`);
      setEntregas(res.data || []);
      setShowEntregas(true);
      setCurrentTareaForEntregas(idTarea);
    } catch (err) { console.error(err); }
  };

  const handleSaveTarea = async () => {
    try {
      if (isEditingTarea) {
        await api.put(`/academia/tareas/${currentTareaId}`, newTarea);
      } else {
        await api.post('/academia/tareas', { ...newTarea, id_leccion: currentLeccionIdForTarea });
      }
      setIsAddingTarea(false);
      fetchTareas(currentLeccionIdForTarea);
    } catch (err) { console.error(err); }
  };

  const handleCalificar = async () => {
    try {
      await api.put(`/academia/entregas/${gradingEntrega.id_entrega}/calificar`, gradeData);
      setGradingEntrega(null);
      fetchEntregas(currentTareaForEntregas);
    } catch (err) { console.error(err); }
  };

  const currentCourse = data.find(c => c.id_curso === selectedCursoId);

  useEffect(() => {
    if (lecciones.length > 0) {
      lecciones.forEach(l => fetchTareas(l.id_leccion));
    }
  }, [lecciones]);

  return (
    <div className={styles.grid}>
      <div className={styles.sidebar}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HatGraduation24Regular color={tokens.colorBrandForeground1} />
            <MEHTypography variant="h3">{t("programs")}</MEHTypography>
          </div>
          <Tooltip content={t("admin_new_course")} relationship="label">
            <Button icon={<Add24Regular />} appearance="primary" size="small" shape="circular" onClick={() => {
              setIsAddingCurso(true);
              setIsEditingCurso(false);
              setNewCurso({ nombre_curso: '', descripcion: '', horas_academicas: 10, imagen_url: '' });
            }} />
          </Tooltip>
        </div>
        <Divider style={{marginBottom: '12px'}} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '4px' }}>
          {data.map(c => (
            <div 
              key={`c-${c.id_curso}`} 
              className={`${styles.selectableCard} ${selectedCursoId === c.id_curso ? styles.activeItem : ''}`} 
              onClick={() => { setSelectedCursoId(c.id_curso); setIsAddingCurso(false); fetchLecciones(c.id_curso); }}
            >
              <div style={{display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between', width: '100%'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                  <Avatar 
                    name={c.nombre_curso} 
                    image={{src: resolveApiFileUrl(c.imagen_url)}} 
                    shape="rounded" 
                    size={32} 
                  />
                  <div>
                    <MEHTypography variant="bold" style={{ fontSize: '14px' }}>{c.nombre_curso}</MEHTypography>
                    <Badge size="small" color={c.id_estado === 1 ? 'warning' : 'success'} appearance="tint" style={{ marginTop: '2px' }}>
                      {c.id_estado === 1 ? 'Inactivo' : 'Activo'}
                    </Badge>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <Button 
                    icon={<Edit20Regular />} 
                    appearance="subtle" 
                    size="small"
                    onClick={(e) => { e.stopPropagation(); handleEditCurso(c); }} 
                  />
                  <Button 
                    icon={<Delete20Regular color={tokens.colorPaletteRedForeground1} />} 
                    appearance="subtle" 
                    size="small"
                    onClick={(e) => { e.stopPropagation(); confirmDelete('curso', c.id_curso, c.nombre_curso); }} 
                  />
                </div>
              </div>
            </div>
          ))}
          {data.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px', opacity: 0.5 }}>
              <MEHTypography variant="caption">{t("admin_no_courses")}</MEHTypography>
            </div>
          )}
        </div>
      </div>

      <div className={styles.detailsContainer}>
        {isAddingCurso ? (
          <div className={styles.formPanel}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ backgroundColor: tokens.colorBrandBackground, padding: '10px', borderRadius: '12px', color: 'white' }}>
                <BookOpen24Regular />
              </div>
              <MEHTypography variant="h2">
                {isEditingCurso ? t("admin_configure_program") : t("admin_launch_new_program")}
              </MEHTypography>
            </div>

            <Field label={t("admin_course_name")} required>
              <Input 
                placeholder={t("admin_course_name_placeholder")}
                value={newCurso.nombre_curso} 
                onChange={(e, d) => setNewCurso({...newCurso, nombre_curso: d.value})} 
              />
            </Field>

            <Field label={t("admin_program_description")}>
              <div className={`${styles.quillWrapper} ${styles.quillSmall}`}>
                <ReactQuill 
                  theme="snow" 
                  value={newCurso.descripcion} 
                  onChange={v => setNewCurso({...newCurso, descripcion: v})} 
                  modules={quillModules} 
                />
              </div>
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Field label={t("admin_academic_hours")}>
                <Input 
                  type="number" 
                  contentBefore={<Clock24Regular />}
                  value={newCurso.horas_academicas} 
                  onChange={(e, d) => setNewCurso({...newCurso, horas_academicas: d.value})} 
                />
              </Field>
              <Field label={t("admin_course_cover")}>
                <div className={styles.uploadBox}>
                  <div className={styles.previewContainer}>
                    {newCurso.imagen_url ? (
                      <img 
                        src={resolveApiFileUrl(newCurso.imagen_url)} 
                        alt="Preview" 
                        className={styles.previewImage} 
                      />
                    ) : (
                      <HatGraduation24Regular style={{ fontSize: '32px', opacity: 0.2 }} />
                    )}
                  </div>
                  
                  <div 
                    className={styles.uploadButton} 
                    onClick={() => document.getElementById('curso-file').click()}
                  >
                    {uploading ? (
                      <Spinner size="small" label={t("uploading")} />
                    ) : (
                      <>
                        <ArrowUpload24Regular fontSize="24px" />
                        <MEHTypography variant="caption">
                          {newCurso.imagen_url ? t("edit") : t("admin_course_cover")}
                        </MEHTypography>
                      </>
                    )}
                  </div>

                  <input 
                    id="curso-file" 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileUpload(e, setNewCurso, newCurso, 'imagen_url')} 
                    style={{ display: 'none' }} 
                  />
                </div>
              </Field>
              <Field label="Estado del Programa">
                <Switch 
                  label="Programa Habilitado y visible en la plataforma" 
                  checked={newCurso.id_estado !== 1} 
                  onChange={(e, d) => setNewCurso({...newCurso, id_estado: d.checked ? 2 : 1})} 
                />
              </Field>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <MEHButton 
                appearance="primary" 
                size="large"
                icon={<Save24Regular />}
                onClick={handleSaveCurso}
              >
                {isEditingCurso ? t("edit") : t("admin_activate_program")}
              </MEHButton>
              <Button 
                appearance="subtle" 
                size="large"
                icon={<Dismiss24Regular />}
                onClick={() => {
                  setIsAddingCurso(false);
                  setIsEditingCurso(false);
                }}
              >
                {t("cancel")}
              </Button>
            </div>
          </div>
        ) : selectedCursoId && currentCourse ? (
          <div>
            <div className={styles.courseHeader}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <Avatar 
                  size={72} 
                  shape="rounded" 
                  image={{src: resolveApiFileUrl(currentCourse.imagen_url)}} 
                  name={currentCourse.nombre_curso}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <MEHTypography variant="h1" style={{ margin: 0 }}>{currentCourse.nombre_curso}</MEHTypography>
                    <Badge color={currentCourse.id_estado === 1 ? 'warning' : 'success'} appearance="filled">
                      {currentCourse.id_estado === 1 ? 'INACTIVO' : 'ACTIVO'}
                    </Badge>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.6, fontSize: '12px' }}>
                      <Clock24Regular fontSize={14} /> {currentCourse.horas_academicas} {t("admin_hours_count")}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.6, fontSize: '12px' }}>
                      <DocumentText24Regular fontSize={14} /> {lecciones.length} {t("admin_lessons_count")}
                    </span>
                    <Divider vertical style={{ height: '12px' }} />
                    <Switch 
                      label={currentCourse.id_estado === 1 ? "Activar Programa" : "Desactivar Programa"} 
                      checked={currentCourse.id_estado !== 1} 
                      onChange={async (e, d) => {
                        try {
                          const newStatus = d.checked ? 2 : 1;
                          await api.put(`/cursos/${selectedCursoId}`, { id_estado: newStatus });
                          fetchData();
                        } catch (err) {
                          console.error("Error al cambiar estado del curso", err);
                        }
                      }} 
                    />
                  </div>
                </div>
              </div>
              <MEHButton 
                appearance="primary" 
                icon={<Add24Regular />} 
                onClick={() => {
                  setIsAddingLeccion(true);
                  setIsEditingLeccion(false);
                  setNewLeccion({ titulo: '', contenido_video_url: '', contenido_texto: '', orden: lecciones.length + 1 });
                }}
              >
                {t("admin_new_lesson")}
              </MEHButton>
            </div>

            {isAddingLeccion && (
              <div className={styles.formPanel} style={{marginBottom: '32px', border: `2px solid ${tokens.colorBrandStroke1}`}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <MEHTypography variant="h3">
                    {isEditingLeccion ? t("admin_edit_lesson") : t("admin_create_new_lesson")}
                  </MEHTypography>
                  <Badge appearance="outline">{t("admin_order_badge")}: {newLeccion.orden}</Badge>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                  <Field label={t("admin_lesson_title")} required>
                    <Input 
                      placeholder={t("admin_lesson_title_placeholder")}
                      value={newLeccion.titulo} 
                      onChange={(e, d) => setNewLeccion({...newLeccion, titulo: d.value})} 
                    />
                  </Field>
                  <Field label={t("admin_video_url_optional")}>
                    <Input 
                      placeholder={t("admin_video_link_placeholder")}
                      contentBefore={<Video24Regular />}
                      value={newLeccion.contenido_video_url} 
                      onChange={(e, d) => setNewLeccion({...newLeccion, contenido_video_url: d.value})} 
                    />
                  </Field>
                </div>

                <Field label={t("admin_lesson_content")}>
                  <div className={styles.quillWrapper}>
                    <ReactQuill 
                      theme="snow" 
                      value={newLeccion.contenido_texto} 
                      onChange={v => setNewLeccion({...newLeccion, contenido_texto: v})} 
                      modules={quillModules} 
                    />
                  </div>
                </Field>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <MEHButton appearance="primary" icon={<Save24Regular />} onClick={handleSaveLeccion}>
                    {isEditingLeccion ? t("admin_update_lesson") : t("admin_publish_lesson")}
                  </MEHButton>
                  <Button appearance="subtle" icon={<Dismiss24Regular />} onClick={() => setIsAddingLeccion(false)}>
                    {t("cancel")}
                  </Button>
                </div>
              </div>
            )}

            <MEHTypography variant="h3" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DocumentText24Regular /> {t("admin_study_plan")}
            </MEHTypography>

            <Accordion collapsible defaultOpenItems={lecciones.length > 0 ? [lecciones[0].id_leccion] : []}>
              {lecciones.sort((a,b) => a.orden - b.orden).map(l => (
                <AccordionItem value={l.id_leccion} key={`l-${l.id_leccion}`} style={{ backgroundColor: tokens.colorNeutralBackground1, marginBottom: '8px', borderRadius: '12px', border: `1px solid ${tokens.colorNeutralBackground3}` }}>
                  <AccordionHeader expandIconPosition="end">
                    <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center'}}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: tokens.colorBrandBackground2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: tokens.colorBrandForeground2 }}>
                          {l.orden}
                        </div>
                        <MEHTypography variant="bold">{l.titulo}</MEHTypography>
                        {l.contenido_video_url && <Badge appearance="tint" color="brand" icon={<Video24Regular />}>{t("admin_video_available")}</Badge>}
                      </div>
                      <div className={styles.lessonActions} onClick={e => e.stopPropagation()}>
                        <Tooltip content={t("admin_edit_lesson")} relationship="label">
                          <Button 
                            icon={<Edit20Regular />} 
                            size="small" 
                            appearance="subtle" 
                            onClick={() => handleEditLeccion(l)} 
                          />
                        </Tooltip>
                        <Tooltip content={t("delete")} relationship="label">
                          <Button 
                            icon={<Delete20Regular color={tokens.colorPaletteRedForeground1} />} 
                            size="small" 
                            appearance="subtle" 
                            onClick={() => confirmDelete('leccion', l.id_leccion, l.titulo)} 
                          />
                        </Tooltip>
                      </div>
                    </div>
                  </AccordionHeader>
                  <AccordionPanel>
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {l.contenido_video_url && (
                        <div style={{ backgroundColor: tokens.colorNeutralBackground3, padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Video24Regular color={tokens.colorBrandForeground1} />
                          <MEHTypography variant="caption"><b>{t("admin_video_available")}:</b> {l.contenido_video_url}</MEHTypography>
                        </div>
                      )}
                      <div dangerouslySetInnerHTML={{__html: l.contenido_texto}} className="meh-content-preview" />
                      
                      <Divider style={{ margin: '12px 0' }} />
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <MEHTypography variant="h4" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <ClipboardTask24Regular color={tokens.colorBrandForeground1} /> {t("admin_lesson_tasks")}
                        </MEHTypography>
                        <MEHButton size="small" appearance="subtle" icon={<Add24Regular />} onClick={() => {
                           setNewTarea({ titulo: '', instrucciones: '', puntos_max: 100, fecha_entrega_limite: '' });
                           setCurrentLeccionIdForTarea(l.id_leccion);
                           setIsAddingTarea(true);
                           setIsEditingTarea(false);
                        }}>{t("admin_add_task")}</MEHButton>
                      </div>

                      {/* Listado de Tareas */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                         {(tareas[l.id_leccion] || []).map(t => (
                           <div key={t.id_tarea} className={styles.taskCard}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                 <MEHTypography variant="bold">{t.titulo}</MEHTypography>
                                 <Badge appearance="tint">{t.puntos_max} pts</Badge>
                              </div>
                              <MEHTypography variant="caption" style={{ opacity: 0.8 }}>{t.instrucciones}</MEHTypography>
                              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                 <MEHButton size="small" appearance="outline" icon={<Person24Regular />} onClick={() => fetchEntregas(t.id_tarea)}>{t("admin_view_submissions")}</MEHButton>
                                 <Button size="small" appearance="subtle" icon={<Edit20Regular />} onClick={() => {
                                    setNewTarea({ ...t });
                                    setCurrentTareaId(t.id_tarea);
                                    setIsEditingTarea(true);
                                    setIsAddingTarea(true);
                                    setCurrentLeccionIdForTarea(l.id_leccion);
                                 }} />
                              </div>
                           </div>
                         ))}
                         {!(tareas[l.id_leccion]?.length) && (
                            <MEHTypography variant="caption" style={{ opacity: 0.5, fontStyle: 'italic' }}>{t("admin_no_tasks_assigned")}</MEHTypography>
                         )}
                      </div>
                    </div>
                  </AccordionPanel>
                </AccordionItem>
              ))}
              {lecciones.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', backgroundColor: tokens.colorNeutralBackground2, borderRadius: '16px', border: `2px dashed ${tokens.colorNeutralBackground3}` }}>
                  <MEHTypography variant="body">{t("admin_course_no_lessons")}</MEHTypography>
                </div>
              )}
            </Accordion>
          </div>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px', opacity: 0.5, textAlign: 'center', gap: '16px'}}>
            <div style={{ padding: '32px', backgroundColor: tokens.colorNeutralBackground2, borderRadius: '50%' }}>
              <HatGraduation24Regular style={{fontSize: '80px', color: tokens.colorBrandForeground1}} />
            </div>
            <div>
              <MEHTypography variant="h2">{t("admin_virtual_classroom_management")}</MEHTypography>
              <MEHTypography variant="body">{t("admin_select_program_manage")}</MEHTypography>
            </div>
          </div>
        )}
      </div>

      {/* MODAL GESTIÓN DE TAREA */}
      <Dialog open={isAddingTarea} onOpenChange={(e, d) => setIsAddingTarea(d.open)}>
         <DialogSurface>
            <DialogBody>
               <DialogTitle>{isEditingTarea ? t("admin_edit_task") : t("admin_new_task")}</DialogTitle>
               <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                  <Field label={t("admin_task_title")} required>
                     <Input value={newTarea.titulo} onChange={(e, d) => setNewTarea({ ...newTarea, titulo: d.value })} placeholder={t("admin_task_title_placeholder")} />
                  </Field>
                  <Field label={t("admin_detailed_instructions")} required>
                     <Textarea value={newTarea.instrucciones} onChange={(e, d) => setNewTarea({ ...newTarea, instrucciones: d.value })} placeholder={t("admin_instructions_placeholder")} rows={4} />
                  </Field>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                     <Field label={t("admin_max_points")}>
                        <Input type="number" value={newTarea.puntos_max} onChange={(e, d) => setNewTarea({ ...newTarea, puntos_max: d.value })} />
                     </Field>
                     <Field label={t("admin_deadline")}>
                        <Input type="date" value={newTarea.fecha_entrega_limite} onChange={(e, d) => setNewTarea({ ...newTarea, fecha_entrega_limite: d.value })} />
                     </Field>
                  </div>
               </DialogContent>
               <DialogActions>
                  <MEHButton appearance="primary" icon={<Save24Regular />} onClick={handleSaveTarea}>{t("admin_save_task")}</MEHButton>
                  <Button appearance="subtle" onClick={() => setIsAddingTarea(false)}>{t("cancel")}</Button>
               </DialogActions>
            </DialogBody>
         </DialogSurface>
      </Dialog>

      {/* MODAL VER ENTREGAS Y CALIFICAR */}
      <Dialog open={showEntregas} onOpenChange={(e, d) => setShowEntregas(d.open)}>
         <DialogSurface style={{ maxWidth: '900px', width: '90%' }}>
            <DialogBody>
               <DialogTitle>{t("admin_student_submissions")}</DialogTitle>
               <DialogContent style={{ marginTop: '16px' }}>
                  <Table size="extra-small">
                     <TableHeader>
                        <TableRow>
                           <TableHeaderCell>{t("student")}</TableHeaderCell>
                           <TableHeaderCell>{t("admin_submission_date")}</TableHeaderCell>
                           <TableHeaderCell>{t("file")}</TableHeaderCell>
                           <TableHeaderCell>{t("grade")}</TableHeaderCell>
                           <TableHeaderCell>{t("admin_grade_action")}</TableHeaderCell>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {entregas.map(ent => (
                           <TableRow key={ent.id_entrega}>
                              <TableCell>{t("admin_user_id")}: {ent.id_usuario}</TableCell>
                              <TableCell>{new Date(ent.fecha_envio).toLocaleString()}</TableCell>
                              <TableCell>
                                 <Link href={ent.archivo_url} target="_blank">{t("admin_view_submission")}</Link>
                              </TableCell>
                              <TableCell>
                                 <Badge color={ent.nota ? "success" : "neutral"}>{ent.nota || t("pending")} / 100</Badge>
                              </TableCell>
                              <TableCell>
                                 <MEHButton size="small" appearance="subtle" icon={<Checkmark24Regular />} onClick={() => {
                                    setGradingEntrega(ent);
                                    setGradeData({ nota: ent.nota || 100, comentario_docente: ent.comentario_docente || '' });
                                 }}>{t("grade")}</MEHButton>
                              </TableCell>
                           </TableRow>
                        ))}
                     </TableBody>
                  </Table>

                  {gradingEntrega && (
                     <div className={styles.gradingArea}>
                        <MEHTypography variant="h4">{t("admin_grade_student")}</MEHTypography>
                        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '16px', marginTop: '12px' }}>
                           <Field label={t("grade")}>
                              <Input type="number" value={gradeData.nota} onChange={(e, d) => setGradeData({ ...gradeData, nota: d.value })} />
                           </Field>
                           <Field label={t("admin_teacher_feedback")}>
                              <Textarea value={gradeData.comentario_docente} onChange={(e, d) => setGradeData({ ...gradeData, comentario_docente: d.value })} placeholder={t("admin_feedback_placeholder")} />
                           </Field>
                        </div>
                        <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                           <MEHButton appearance="primary" size="small" onClick={handleCalificar}>{t("admin_confirm_grade")}</MEHButton>
                           <Button appearance="subtle" size="small" onClick={() => setGradingEntrega(null)}>{t("close")}</Button>
                        </div>
                     </div>
                  )}
               </DialogContent>
               <DialogActions>
                  <Button appearance="subtle" onClick={() => setShowEntregas(false)}>{t("admin_close_list")}</Button>
               </DialogActions>
            </DialogBody>
         </DialogSurface>
      </Dialog>
    </div>
  );
};

export default AcademyTab;

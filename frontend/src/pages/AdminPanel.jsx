import React, { useState, useEffect } from 'react';
import { 
  makeStyles, shorthands, tokens, TabList, Tab, Spinner,
  Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions, Button
} from '@fluentui/react-components';
import { 
  Settings24Filled, Library24Regular, People24Regular, Box24Regular,
  HatGraduation24Regular, CalendarLtr24Regular, MegaphoneLoud24Regular,
  DeleteDismiss24Regular
} from '@fluentui/react-icons';
import { MEHCard, MEHButton, MEHTypography } from '../components/ui';

// Importar servicios
import authService from '../services/authService';
import recursoService from '../services/recursoService';
import adminService from '../services/adminService';
import api from '../services/api';
import { useAuth, useNotify } from '../App';

// Importar sub-componentes refactorizados
import UsersTab from './Admin/UsersTab';
import EventsTab from './Admin/EventsTab';
import SouvenirsTab from './Admin/SouvenirsTab';
import LibraryTab from './Admin/LibraryTab';
import AcademyTab from './Admin/AcademyTab';
import PapeleraTab from './Admin/PapeleraTab';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column', gap: '32px',
    animationName: { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
    animationDuration: '0.5s',
  },
  header: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' },
  tableWrapper: { width: '100%', overflowX: 'hidden', ...shorthands.borderRadius('24px'), ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3), backgroundColor: tokens.colorNeutralBackground1, boxShadow: tokens.shadow8 },
  userRow: { height: '85px', transition: 'all 0.2s ease', ':hover': { backgroundColor: tokens.colorNeutralBackground2 } },
  avatarStack: { display: 'flex', alignItems: 'center', gap: '16px', paddingLeft: '12px' },
  gridTwo: { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' },
  formPanel: { display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', backgroundColor: tokens.colorNeutralBackground2, ...shorthands.borderRadius('20px'), ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3) },
  classroomGrid: { display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', marginTop: '24px' },
  sidebar: { display: 'flex', flexDirection: 'column', gap: '12px' },
  activeItem: { ...shorthands.borderColor(tokens.colorBrandStroke1), backgroundColor: tokens.colorBrandBackground2 },
  selectableCard: { padding: '16px', ...shorthands.borderRadius('12px'), backgroundColor: tokens.colorNeutralBackground1, ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3), cursor: 'pointer', transition: 'all 0.2s ease', ':hover': { transform: 'translateX(4px)', ...shorthands.borderColor(tokens.colorBrandStroke1) } },
  quillWrapper: { marginTop: '4px', '& .ql-toolbar': { ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1), ...shorthands.borderRadius('12px', '12px', '0', '0'), backgroundColor: tokens.colorNeutralBackground3 }, '& .ql-container': { ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1), ...shorthands.borderRadius('0', '0', '12px', '12px'), minHeight: '200px', backgroundColor: tokens.colorNeutralBackground1 } },
  uploadBox: { ...shorthands.border('2px', 'dashed', tokens.colorBrandStroke1), ...shorthands.padding('20px'), ...shorthands.borderRadius('12px'), textAlign: 'center', cursor: 'pointer', backgroundColor: tokens.colorNeutralBackground1, transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', ':hover': { backgroundColor: tokens.colorBrandBackground2, ...shorthands.borderColor(tokens.colorBrandBackground) } },
  infoCard: { padding: '20px', ...shorthands.borderRadius('20px'), backgroundColor: tokens.colorNeutralBackground1, ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3), display: 'flex', flexDirection: 'column', gap: '16px' }
});

const AdminPanel = () => {
  const styles = useStyles();
  const { user: currentUser } = useAuth();
  const { notify } = useNotify();
  
  const [selectedTab, setSelectedTab] = useState('usuarios');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]); 
  const [usuariosList, setUsuariosList] = useState([]);
  const [eventosList, setEventosList] = useState([]);
  const [speakersList, setSpeakersList] = useState([]);
  const [searchTerm, setSearchBox] = useState('');
  
  // --- STATES GLOBALES ---
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', id: null, name: '' });
  const [uploading, setUploading] = useState(false);

  // Eventos CRUD
  const [selectedEventoId, setSelectedEventoId] = useState(null);
  const [isAddingEvento, setIsAddingEvento] = useState(false);
  const [isEditingEvento, setIsEditingEvento] = useState(false);
  const [newEvento, setNewEvento] = useState({ titulo: '', descripcion: '', tipo_evento: 'CONFERENCIA', fecha_inicio: '', hora_inicio: '', modalidad: 'PRESENCIAL', ubicacion: '', capacidad_max: 50, refrigerio_incluido: false, id_estado: 2 });

  // Souvenirs & POS
  const [isEditingSouvenir, setIsEditingSouvenir] = useState(false);
  const [currentSouvenirId, setCurrentSouvenirId] = useState(null);
  const [newSouvenir, setNewSouvenir] = useState({ nombre: '', descripcion: '', precio: 0, stock: 10, imagen_url: '', categoria: 'SOUVENIR', id_estado: 2 });

  // Biblioteca
  const [isEditingRecurso, setIsEditingRecurso] = useState(false);
  const [currentRecursoId, setCurrentRecursoId] = useState(null);
  const [newRecurso, setNewRecurso] = useState({ titulo: '', descripcion: '', motivo: '', autor_nombre: '', url_descarga: '', portada_url: '', tipo_archivo: '', tipo_recurso: 'ARCHIVO', contenido_md: '', categoria: 'GENERAL', id_curso: null, id_evento: null, id_estado: 2 });

  // Academia LMS
  const [selectedCursoId, setSelectedCursoId] = useState(null);
  const [isAddingCurso, setIsAddingCurso] = useState(false);
  const [isEditingCurso, setIsEditingCurso] = useState(false);
  const [newCurso, setNewCurso] = useState({ nombre_curso: '', descripcion: '', horas_academicas: 10, imagen_url: '', id_estado: 2 });
  const [lecciones, setLecciones] = useState([]);
  const [isAddingLeccion, setIsAddingLeccion] = useState(false);
  const [isEditingLeccion, setIsEditingLeccion] = useState(false);
  const [currentLeccionId, setCurrentLeccionId] = useState(null);
  const [newLeccion, setNewLeccion] = useState({ titulo: '', contenido_video_url: '', contenido_texto: '', orden: 1 });

  const getDefaultTab = () => {
    if (currentUser?.rol === 'ADMIN') return 'usuarios';
    if (currentUser?.rol === 'ORGANIZADOR') return 'eventos';
    if (currentUser?.rol === 'MODERADOR') return 'academia';
    return 'usuarios';
  };

  useEffect(() => {
    if (currentUser?.rol) {
      setSelectedTab(getDefaultTab());
    }
  }, [currentUser]);

  const fetchData = async () => {
    if (!selectedTab) return;
    
    // Validar permisos del tab actual
    if (selectedTab === 'usuarios' && currentUser?.rol !== 'ADMIN') return;
    if (selectedTab === 'eventos' && currentUser?.rol !== 'ADMIN' && currentUser?.rol !== 'ORGANIZADOR') return;
    if (selectedTab === 'souvenirs' && currentUser?.rol !== 'ADMIN') return;
    if (selectedTab === 'biblioteca' && currentUser?.rol !== 'ADMIN' && currentUser?.rol !== 'ORGANIZADOR' && currentUser?.rol !== 'MODERADOR') return;
    if (selectedTab === 'academia' && currentUser?.rol !== 'ADMIN' && currentUser?.rol !== 'ORGANIZADOR' && currentUser?.rol !== 'MODERADOR') return;
    if (selectedTab === 'papelera') return;
    
    setData([]);
    setLoading(true);
    try {
        if (selectedTab === 'usuarios') {
            const res = await authService.getAllUsers();
            setData(Array.isArray(res) ? res : []);
        }
        if (selectedTab === 'eventos') {
            const [eRes, sRes] = await Promise.all([api.get('/eventos/'), api.get('/admin-directories/speakers')]);
            setEventosList(eRes.data || []);
            setSpeakersList(sRes.data || []);
            setData(eRes.data || []);
        }
        if (selectedTab === 'souvenirs') {
            const [sRes, vRes, uRes] = await Promise.all([adminService.getSouvenirs(), api.get('/souvenirs/ventas'), authService.getAllUsers()]);
            setData(Array.isArray(sRes) ? sRes : []);
            setUsuariosList(uRes || []);
        }
        if (selectedTab === 'biblioteca') {
            const [rRes] = await Promise.all([recursoService.getRecursos()]);
            setData(Array.isArray(rRes) ? rRes : []);
        }
        if (selectedTab === 'academia') {
            const [cRes, uRes] = await Promise.all([api.get('/cursos/'), authService.getAllUsers()]);
            setData(cRes.data || []);
            setUsuariosList(uRes || []);
        }
    } catch (err) { console.error(err); notify("Error", "Fallo sincronización", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [selectedTab, currentUser]);

  const fetchLecciones = async (id) => {
      try {
          const res = await api.get(`/academia/cursos/${id}/lecciones`);
          setLecciones(res.data || []);
      } catch (err) { console.error(err); }
  };

  // --- HANDLERS COMUNES ---
  const handleFileUpload = async (e, targetSetter, stateObj, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post('/files/upload', formData);
        targetSetter({ ...stateObj, [fieldName]: res.data.url });
        notify("Éxito", "Imagen cargada", "success");
    } catch (err) { notify("Error", "Fallo al subir", "error"); }
    finally { setUploading(false); }
  };

  const handleExportCSV = () => {
    if (!data || data.length === 0) return notify("Atención", "Sin datos", "warning");
    const headers = ["ID", "Nombres", "Apellidos", "Correo", "Rol", "Union", "Inversión"];
    const rows = data.map(u => [u.id_usuario, u.nombres, u.apellidos, u.correo, u.rol, new Date(u.fecha_registro).toLocaleDateString(), u.total_invertido || 0]);
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(",") + "\n";
    rows.forEach(row => { csvContent += row.join(",") + "\n"; });
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent)); link.setAttribute("download", `MEH_Data.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    notify("Exportado", "Archivo generado", "success");
  };

  // --- HANDLERS EVENTOS ---
  const handleSaveEvento = async (eventData) => {
      const dataToSave = eventData || newEvento;
      try {
          if (isEditingEvento) {
              await api.put(`/eventos/${selectedEventoId}`, dataToSave);
              notify("Éxito", "Evento actualizado", "success");
          } else {
              await api.post('/eventos/', dataToSave);
              notify("Éxito", "Evento publicado", "success");
          }
          setNewEvento({ titulo: '', descripcion: '', tipo_evento: 'CONFERENCIA', fecha_inicio: '', hora_inicio: '', modalidad: 'PRESENCIAL', ubicacion: '', link_mapas: '', capacidad_max: 50, refrigerio_incluido: false, id_estado: 2 });
          setIsAddingEvento(false); setIsEditingEvento(false); fetchData();
      } catch (e) { notify("Error", "Fallo al guardar evento", "error"); }
  };

  const handleEditEvento = (ev) => {
      setNewEvento({ 
          titulo: ev.titulo, 
          descripcion: ev.descripcion || '', 
          tipo_evento: ev.tipo_evento, 
          fecha_inicio: ev.fecha_inicio.split('T')[0], 
          hora_inicio: ev.hora_inicio || '18:00', 
          modalidad: ev.modalidad, 
          ubicacion: ev.ubicacion || '', 
          link_mapas: ev.link_mapas || '',
          capacidad_max: ev.capacidad_max, 
          refrigerio_incluido: ev.refrigerio_incluido,
          id_estado: ev.id_estado ?? 2
      });
      setIsEditingEvento(true); setIsAddingEvento(true);
  };

  // --- HANDLERS ACADEMIA ---
  const handleSaveCurso = async () => {
      try {
          if (isEditingCurso) {
              await api.put(`/cursos/${selectedCursoId}`, newCurso);
              notify("Éxito", "Programa actualizado", "success");
          } else {
              await api.post('/cursos/', newCurso);
              notify("Éxito", "Programa lanzado", "success");
          }
          setNewCurso({ nombre_curso: '', descripcion: '', horas_academicas: 10, imagen_url: '', id_estado: 2 });
          setIsAddingCurso(false); setIsEditingCurso(false); fetchData();
      } catch (e) { notify("Error", "Fallo al guardar curso", "error"); }
  };

  const handleEditCurso = (c) => {
    setNewCurso({ 
        nombre_curso: c.nombre_curso, 
        descripcion: c.descripcion || '', 
        horas_academicas: c.horas_academicas || 10, 
        imagen_url: c.imagen_url || '',
        id_estado: c.id_estado ?? 2
    });
    setSelectedCursoId(c.id_curso);
    setIsEditingCurso(true);
    setIsAddingCurso(true);
  };

  const handleSaveLeccion = async () => {
      try {
          if (isEditingLeccion) await api.put(`/academia/lecciones/${currentLeccionId}`, newLeccion);
          else await api.post('/academia/lecciones', { ...newLeccion, id_curso: selectedCursoId });
          notify("Éxito", "Lección guardada", "success");
          setIsAddingLeccion(false); setIsEditingLeccion(false); fetchLecciones(selectedCursoId);
      } catch (e) { notify("Error", "Fallo al guardar", "error"); }
  };

  const handleEditLeccion = (l) => {
      setNewLeccion({ 
          titulo: l.titulo, 
          contenido_video_url: l.contenido_video_url || '', 
          contenido_texto: l.contenido_texto || '', 
          orden: l.orden 
      });
      setCurrentLeccionId(l.id_leccion); 
      setIsEditingLeccion(true); 
      setIsAddingLeccion(true);
  };

  const handleSaveRecurso = async () => {
      try {
          if (isEditingRecurso) {
              await api.put(`/recursos/${currentRecursoId}`, newRecurso);
              notify("Éxito", "Recurso actualizado", "success");
          } else {
              await recursoService.createRecurso(newRecurso);
              notify("Éxito", "Recurso publicado", "success");
          }
          setNewRecurso({ titulo: '', descripcion: '', motivo: '', autor_nombre: '', url_descarga: '', portada_url: '', tipo_archivo: '', tipo_recurso: 'ARCHIVO', contenido_md: '', categoria: 'GENERAL', id_curso: null, id_evento: null, id_estado: 2 });
          setIsEditingRecurso(false); fetchData();
      } catch (e) { notify("Error", "Fallo al guardar recurso", "error"); }
  };

  const handleEditRecurso = (r) => {
    setNewRecurso({ 
        titulo: r.titulo, 
        descripcion: r.descripcion || '', 
        motivo: r.motivo || '', 
        autor_nombre: r.autor_nombre || '', 
        url_descarga: r.url_descarga || '', 
        portada_url: r.portada_url || '', 
        tipo_archivo: r.tipo_archivo || '', 
        tipo_recurso: r.tipo_recurso || 'ARCHIVO', 
        contenido_md: r.contenido_md || '', 
        categoria: r.categoria || 'GENERAL', 
        id_curso: r.id_curso, 
        id_evento: r.id_evento,
        id_estado: r.id_estado ?? 2
    });
    setCurrentRecursoId(r.id_recurso);
    setIsEditingRecurso(true);
  };

  // --- HANDLERS SOUVENIRS ---
  const handleSaveSouvenir = async () => {
      try {
          if (isEditingSouvenir) {
              await adminService.updateSouvenir(currentSouvenirId, newSouvenir);
              notify("Éxito", "Producto actualizado", "success");
          } else {
              await adminService.createSouvenir(newSouvenir);
              notify("Éxito", "Producto agregado", "success");
          }
          setNewSouvenir({ nombre: '', descripcion: '', precio: 0, stock: 10, imagen_url: '', categoria: 'SOUVENIR', id_estado: 2 });
          setIsEditingSouvenir(false); fetchData();
      } catch (e) { notify("Error", "Fallo al guardar producto", "error"); }
  };

  const handleEditSouvenir = (s) => {
    setNewSouvenir({ 
        nombre: s.nombre, 
        descripcion: s.descripcion || '', 
        precio: s.precio, 
        stock: s.stock, 
        imagen_url: s.imagen_url || '', 
        categoria: s.categoria || 'SOUVENIR',
        id_estado: s.id_estado ?? 2
    });
    setCurrentSouvenirId(s.id_producto);
    setIsEditingSouvenir(true);
  };

  const confirmDelete = (type, id, name) => setDeleteDialog({ open: true, type, id, name });

  const quillModules = { toolbar: [[{ 'header': [1, 2, false] }], ['bold', 'italic', 'underline'], [{'list': 'ordered'}, {'list': 'bullet'}], ['link', 'clean']] };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
          <Settings24Filled style={{ color: tokens.colorBrandForeground1, fontSize: '42px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <MEHTypography variant="h1">Master Admin Panel</MEHTypography>
            <MEHTypography variant="body" style={{ opacity: 0.7 }}>Gestión operativa de alto nivel para la red MEH.</MEHTypography>
          </div>
      </div>

      <TabList selectedValue={selectedTab} onTabSelect={(e, d) => { setData([]); setSelectedTab(d.value); }} style={{ overflowX: 'auto' }}>
        {currentUser?.rol === 'ADMIN' && <Tab value="usuarios" icon={<People24Regular />}>Miembros</Tab>}
        {(currentUser?.rol === 'ADMIN' || currentUser?.rol === 'ORGANIZADOR') && <Tab value="eventos" icon={<CalendarLtr24Regular />}>Eventos</Tab>}
        {currentUser?.rol === 'ADMIN' && <Tab value="souvenirs" icon={<Box24Regular />}>POS & Stock</Tab>}
        {(currentUser?.rol === 'ADMIN' || currentUser?.rol === 'ORGANIZADOR' || currentUser?.rol === 'MODERADOR') && <Tab value="biblioteca" icon={<Library24Regular />}>Biblioteca</Tab>}
        {(currentUser?.rol === 'ADMIN' || currentUser?.rol === 'ORGANIZADOR' || currentUser?.rol === 'MODERADOR') && <Tab value="academia" icon={<HatGraduation24Regular />}>Aula Virtual</Tab>}
        {(currentUser?.rol === 'ADMIN' || currentUser?.rol === 'ORGANIZADOR' || currentUser?.rol === 'MODERADOR') && <Tab value="papelera" icon={<DeleteDismiss24Regular />}>Papelera</Tab>}
      </TabList>

      <MEHCard>
        {selectedTab === 'usuarios' && (
          <UsersTab 
            loading={loading} data={data} searchTerm={searchTerm} setSearchBox={setSearchBox} 
            handleExportCSV={handleExportCSV} currentUser={currentUser} 
            confirmDelete={confirmDelete} fetchData={fetchData} 
          />
        )}

        {selectedTab === 'eventos' && (
          <EventsTab 
            eventosList={eventosList} 
            speakersList={speakersList}
            selectedEventoId={selectedEventoId} 
            setSelectedEventoId={setSelectedEventoId} isAddingEvento={isAddingEvento} 
            setIsAddingEvento={setIsAddingEvento} isEditingEvento={isEditingEvento} 
            setIsEditingEvento={setIsEditingEvento} newEvento={newEvento} 
            setNewEvento={setNewEvento} handleSaveEvento={handleSaveEvento} 
            handleEditEvento={handleEditEvento} confirmDelete={confirmDelete} styles={styles}
            handleFileUpload={handleFileUpload}
            uploading={uploading}
            fetchData={fetchData}
          />
        )}

        {selectedTab === 'souvenirs' && (
          <SouvenirsTab 
            data={data} newSouvenir={newSouvenir} setNewSouvenir={setNewSouvenir} 
            isEditingSouvenir={isEditingSouvenir} setIsEditingSouvenir={setIsEditingSouvenir}
            uploading={uploading} 
            handleFileUpload={handleFileUpload} handleSaveSouvenir={handleSaveSouvenir}
            handleEditSouvenir={handleEditSouvenir} confirmDelete={confirmDelete}
            styles={styles} 
            fetchData={fetchData}
          />
        )}

        {selectedTab === 'biblioteca' && (
          <LibraryTab 
            data={data} newRecurso={newRecurso} setNewRecurso={setNewRecurso} 
            handleSaveRecurso={handleSaveRecurso} styles={styles} 
            isEditingRecurso={isEditingRecurso} setIsEditingRecurso={setIsEditingRecurso}
            handleEditRecurso={handleEditRecurso} confirmDelete={confirmDelete}
            fetchData={fetchData}
          />
        )}

        {selectedTab === 'academia' && (
          <AcademyTab 
            data={data} selectedCursoId={selectedCursoId} setSelectedCursoId={setSelectedCursoId} 
            isAddingCurso={isAddingCurso} setIsAddingCurso={setIsAddingCurso} 
            isEditingCurso={isEditingCurso} setIsEditingCurso={setIsEditingCurso}
            newCurso={newCurso} setNewCurso={setNewCurso} 
            handleSaveCurso={handleSaveCurso} handleEditCurso={handleEditCurso}
            lecciones={lecciones} 
            isAddingLeccion={isAddingLeccion} setIsAddingLeccion={setIsAddingLeccion} 
            isEditingLeccion={isEditingLeccion} setIsEditingLeccion={setIsEditingLeccion}
            newLeccion={newLeccion} setNewLeccion={setNewLeccion} 
            handleSaveLeccion={handleSaveLeccion} handleEditLeccion={handleEditLeccion} 
            confirmDelete={confirmDelete} fetchLecciones={fetchLecciones} 
            handleFileUpload={handleFileUpload} uploading={uploading}
            styles={styles} 
            quillModules={quillModules} 
            fetchData={fetchData}
          />
        )}

        {selectedTab === 'anuncios' && (
          <AnnouncementsTab />
        )}

        {selectedTab === 'papelera' && (
          <PapeleraTab currentUser={currentUser} notify={notify} />
        )}
      </MEHCard>

      <Dialog open={deleteDialog.open} onOpenChange={(e, d) => setDeleteDialog({ ...deleteDialog, open: d.open })}>
          <DialogSurface style={{ ...shorthands.border('2px', 'solid', tokens.colorPaletteRedBorder1), borderRadius: '24px' }}>
              <DialogBody><DialogTitle>Confirmar Eliminación</DialogTitle><DialogContent>¿Estás seguro de eliminar <b>{deleteDialog.name}</b>?</DialogContent><DialogActions><Button appearance="secondary" onClick={() => setDeleteDialog({ open: false })}>Cancelar</Button><MEHButton appearance="primary" style={{ backgroundColor: tokens.colorPaletteRedBackground3 }} onClick={() => { if (deleteDialog.type === 'leccion') api.delete(`/academia/lecciones/${deleteDialog.id}`).then(() => { setDeleteDialog({open:false}); fetchLecciones(selectedCursoId); }); if (deleteDialog.type === 'evento') api.delete(`/eventos/${deleteDialog.id}`).then(() => { setDeleteDialog({open:false}); fetchData(); }); if (deleteDialog.type === 'souvenir') adminService.deleteSouvenir(deleteDialog.id).then(() => { setDeleteDialog({open:false}); fetchData(); }); if (deleteDialog.type === 'curso') api.delete(`/cursos/${deleteDialog.id}`).then(() => { setDeleteDialog({open:false}); fetchData(); }); }}>Confirmar</MEHButton></DialogActions></DialogBody>
          </DialogSurface>
      </Dialog>
    </div>
  );
};

export default AdminPanel;

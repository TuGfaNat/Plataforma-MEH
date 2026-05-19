import React, { useState, useEffect } from 'react';
import { 
  makeStyles, shorthands, tokens, TabList, Tab, Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell,
  Input, Label, Textarea, Spinner, Avatar, Badge, Divider, Select, Tooltip,
  Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions, Button, Field,
  Accordion, AccordionItem, AccordionHeader, AccordionPanel, Switch
} from '@fluentui/react-components';
import { 
  Settings24Filled, Library24Regular, People24Regular, Save24Regular, Delete24Regular,
  ShieldCheckmark24Regular, ArrowUpload24Regular, Box24Regular, Cart24Regular,
  HatGraduation24Regular, Mail24Regular, PersonEdit24Regular, PersonDelete24Regular,
  Info24Regular, Search24Regular, Add24Regular, History24Regular, ArrowDownload24Regular,
  Trophy24Regular, CalendarLtr24Regular, PersonAdd24Regular, Dismiss24Regular, CheckmarkCircle24Regular,
  Link24Regular, Video24Regular, Document24Regular, NoteEdit24Regular, Edit24Regular,
  BookInformation24Regular, Person24Regular, Target24Regular, Money24Regular, QrCode24Regular,
  Image24Regular, BookOpen24Regular, Certificate24Regular, Board24Regular, ChatMultiple24Regular,
  ContactCard24Regular, VideoClip24Regular, TasksApp24Regular, Food24Regular, Flash24Regular, PeopleTeam24Regular
} from '@fluentui/react-icons';
import { MEHCard, MEHButton, MEHTypography } from '../components/ui';
import authService from '../services/authService';
import recursoService from '../services/recursoService';
import adminService from '../services/adminService';
import api, { resolveApiFileUrl } from '../services/api';
import { useAuth, useNotify } from '../App';
import { designTokens } from '../theme/theme';

// Importar React Quill para la Biblioteca y Academia
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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
      alignItems: 'center',
      gap: '16px',
      marginBottom: '8px'
  },
  tableWrapper: { 
      width: '100%', 
      overflowX: 'hidden',
      ...shorthands.borderRadius('24px'),
      ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3),
      backgroundColor: tokens.colorNeutralBackground1,
      boxShadow: tokens.shadow8
  },
  userRow: {
      height: '85px',
      transition: 'all 0.2s ease',
      ':hover': { backgroundColor: tokens.colorNeutralBackground2 }
  },
  avatarStack: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      paddingLeft: '12px'
  },
  roleSelector: {
      minWidth: '180px',
      backgroundColor: tokens.colorNeutralBackground3,
      ...shorthands.borderRadius('12px'),
      fontWeight: 'bold',
      color: tokens.colorBrandForeground1
  },
  infoPanel: {
      padding: '24px',
      backgroundColor: tokens.colorBrandBackground2,
      ...shorthands.borderRadius('16px'),
      marginBottom: '24px',
      borderLeft: `4px solid ${tokens.colorBrandForeground1}`,
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
  },
  gridTwo: {
      display: 'grid',
      gridTemplateColumns: '1.2fr 1fr',
      gap: '32px',
      [designTokens.breakpoints.md]: { gridTemplateColumns: '1fr' }
  },
  formPanel: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      padding: '24px',
      backgroundColor: tokens.colorNeutralBackground2,
      ...shorthands.borderRadius('20px'),
      ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3)
  },
  classroomGrid: {
      display: 'grid',
      gridTemplateColumns: '320px 1fr',
      gap: '24px',
      marginTop: '24px',
      [designTokens.breakpoints.md]: { gridTemplateColumns: '1fr' }
  },
  sidebar: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
  },
  activeItem: {
      ...shorthands.borderColor(tokens.colorBrandStroke1),
      backgroundColor: tokens.colorBrandBackground2
  },
  selectableCard: {
      padding: '16px',
      ...shorthands.borderRadius('12px'),
      backgroundColor: tokens.colorNeutralBackground1,
      ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3),
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': { transform: 'translateX(4px)', ...shorthands.borderColor(tokens.colorBrandStroke1) }
  },
  quillWrapper: {
    marginTop: '4px',
    '& .ql-toolbar': {
      ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
      ...shorthands.borderRadius('12px', '12px', '0', '0'),
      backgroundColor: tokens.colorNeutralBackground3,
    },
    '& .ql-container': {
      ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
      ...shorthands.borderRadius('0', '0', '12px', '12px'),
      minHeight: '200px',
      backgroundColor: tokens.colorNeutralBackground1,
    }
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
        backgroundColor: tokens.colorBrandBackground2,
        ...shorthands.borderColor(tokens.colorBrandBackground)
    }
  },
  posUserResult: {
      padding: '12px',
      ...shorthands.borderRadius('12px'),
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      transition: 'all 0.2s ease',
      ':hover': { backgroundColor: tokens.colorBrandBackground2 }
  },
  selectedUserCard: {
      padding: '16px',
      backgroundColor: tokens.colorBrandBackground2,
      ...shorthands.borderRadius('16px'),
      ...shorthands.border('1px', 'solid', tokens.colorBrandStroke1),
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  previewContainer: {
    width: "120px",
    height: "120px",
    ...shorthands.borderRadius("16px"),
    ...shorthands.border("2px", "solid", tokens.colorNeutralBackground3),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: tokens.colorNeutralBackground2,
    marginTop: "8px",
    boxShadow: tokens.shadow4,
  },
  previewImage: { width: '100%', height: '100%', objectFit: 'cover' },
  itemThumb: {
      width: '64px',
      height: '64px',
      objectFit: 'cover',
      ...shorthands.borderRadius('12px'),
      boxShadow: tokens.shadow4
  },
  infoCard: {
      padding: '20px',
      ...shorthands.borderRadius('20px'),
      backgroundColor: tokens.colorNeutralBackground1,
      ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3),
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
  }
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
  const [searchTerm, setSearchBox] = useState('');
  
  // States de Módulos
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', id: null, name: '' });
  const [selectedEventoId, setSelectedEventoId] = useState(null);
  const [isAddingEvento, setIsAddingEvento] = useState(false);
  const [newEvento, setNewEvento] = useState({ titulo: '', descripcion: '', tipo_evento: 'CONFERENCIA', fecha_inicio: '', fecha_fin: '', hora_inicio: '', hora_fin: '', modalidad: 'VIRTUAL', ubicacion: '', capacidad_max: 50, refrigerio_incluido: false });

  const [isEditingSouvenir, setIsEditingSouvenir] = useState(false);
  const [currentSouvenirId, setCurrentSouvenirId] = useState(null);
  const [newSouvenir, setNewSouvenir] = useState({ nombre: '', descripcion: '', precio: 0, stock: 10, imagen_url: '', categoria: 'SOUVENIR' });
  const [newVenta, setNewVenta] = useState({ id_producto: '', cantidad: 1, metodo_pago: 'EFECTIVO' });
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedUserForSale, setSelectedUserForSale] = useState(null);
  const [ventasData, setVentasData] = useState([]);

  const [isEditingRecurso, setIsEditingRecurso] = useState(false);
  const [currentRecursoId, setCurrentRecursoId] = useState(null);
  const [newRecurso, setNewRecurso] = useState({ titulo: '', descripcion: '', motivo: '', autor_nombre: '', url_descarga: '', portada_url: '', tipo_archivo: '', tipo_recurso: 'ARCHIVO', contenido_md: '', categoria: 'GENERAL', id_curso: null, id_evento: null });

  const [selectedCursoId, setSelectedCursoId] = useState(null);
  const [isAddingCurso, setIsAddingCurso] = useState(false);
  const [newCurso, setNewCurso] = useState({ nombre_curso: '', descripcion: '', horas_academicas: 10, costo: 0, imagen_url: '' });
  const [lecciones, setLecciones] = useState([]);
  const [isAddingLeccion, setIsAddingLeccion] = useState(false);
  const [newLeccion, setNewLeccion] = useState({ titulo: '', contenido_video_url: '', contenido_texto: '', orden: 1 });

  const [uploading, setUploading] = useState(false);

  const fetchData = async () => {
    setData([]);
    setLoading(true);
    try {
        if (selectedTab === 'usuarios') {
            const res = await authService.getAllUsers();
            setData(Array.isArray(res) ? res : []);
        }
        
        if (selectedTab === 'eventos') {
            const res = await api.get('/eventos/');
            setEventosList(res.data || []);
            setData(res.data || []);
        }

        if (selectedTab === 'souvenirs') {
            const [sRes, vRes, uRes] = await Promise.all([adminService.getSouvenirs(), api.get('/souvenirs/ventas'), authService.getAllUsers()]);
            setData(Array.isArray(sRes) ? sRes : []);
            setVentasData(vRes.data || []);
            setUsuariosList(uRes || []);
        }

        if (selectedTab === 'biblioteca') {
            const [rRes, cRes, eRes] = await Promise.all([recursoService.getRecursos(), api.get('/cursos/'), api.get('/eventos/')]);
            setData(Array.isArray(rRes) ? rRes : []);
            setEventosList(eRes.data || []);
        }

        if (selectedTab === 'academia') {
            const [cRes, uRes] = await Promise.all([api.get('/cursos/'), authService.getAllUsers()]);
            setData(cRes.data || []);
            setUsuariosList(uRes || []);
        }
    } catch (err) { console.error(err); notify("Error", "Sincronización fallida", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [selectedTab]);

  const fetchLecciones = async (id) => {
      try {
          const res = await api.get(`/academia/cursos/${id}/lecciones`);
          setLecciones(res.data || []);
      } catch (err) { console.error(err); }
  };

  const handleFileUpload = async (e, targetSetter, stateObj, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post('/files/upload', formData);
        let updateData = { ...stateObj, [fieldName]: res.data.url };
        if (fieldName === 'url_descarga') updateData.tipo_archivo = file.name.split('.').pop().toLowerCase();
        targetSetter(updateData);
        notify("Éxito", "Archivo cargado", "success");
    } catch (err) { notify("Error", "Fallo al subir", "error"); }
    finally { setUploading(false); }
  };

  const handleExportCSV = () => {
    if (!data || data.length === 0) return notify("Atención", "No hay datos", "warning");
    const headers = ["ID", "Nombres", "Apellidos", "Correo", "Rol", "Union", "Logros", "Inversion Bs"];
    const rows = data.map(u => [u.id_usuario, u.nombres, u.apellidos, u.correo, u.rol, new Date(u.fecha_registro).toLocaleDateString(), u.badge_count || 0, u.total_invertido || 0]);
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(",") + "\n";
    rows.forEach(row => { csvContent += row.join(",") + "\n"; });
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `MEH_Admin_Data.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    notify("Exportado", "Archivo generado", "success");
  };

  const handleSaveSouvenir = async () => {
      try {
          if (isEditingSouvenir) await adminService.updateSouvenir(currentSouvenirId, newSouvenir);
          else await adminService.createSouvenir(newSouvenir);
          notify("Éxito", "Producto guardado", "success");
          setNewSouvenir({ nombre: '', descripcion: '', precio: 0, stock: 10, imagen_url: '', categoria: 'SOUVENIR' });
          setIsEditingSouvenir(false); fetchData();
      } catch (e) { notify("Error", "Fallo al guardar", "error"); }
  };

  const handleProcessVenta = async () => {
      try {
          if (!selectedUserForSale || !newVenta.id_producto) return notify("Atención", "Faltan datos", "warning");
          await api.post('/souvenirs/ventas', { id_usuario: selectedUserForSale.id_usuario, items: [{ id_producto: parseInt(newVenta.id_producto), cantidad: parseInt(newVenta.cantidad) }], metodo_pago: newVenta.metodo_pago });
          notify("Éxito", "Venta registrada", "success");
          setNewVenta({ id_producto: '', cantidad: 1, metodo_pago: 'EFECTIVO' });
          setSelectedUserForSale(null); fetchData();
      } catch (e) { notify("Error", "Fallo en transacción", "error"); }
  };

  const handleSaveRecurso = async () => {
      try {
          if (isEditingRecurso) await api.put(`/recursos/${currentRecursoId}`, newRecurso);
          else await api.post('/recursos/', newRecurso);
          notify("Éxito", "Recurso publicado", "success");
          setNewRecurso({ titulo: '', descripcion: '', motivo: '', autor_nombre: '', url_descarga: '', portada_url: '', tipo_archivo: '', tipo_recurso: 'ARCHIVO', contenido_md: '', categoria: 'GENERAL', id_curso: null, id_evento: null });
          setIsEditingRecurso(false); fetchData();
      } catch (e) { notify("Error", "Fallo al gestionar", "error"); }
  };

  const handleSaveCurso = async () => {
      try {
          await api.post('/cursos/', newCurso);
          notify("Éxito", "Programa lanzado", "success");
          setNewCurso({ nombre_curso: '', descripcion: '', horas_academicas: 10, costo: 0, imagen_url: '' });
          setIsAddingCurso(false); fetchData();
      } catch (e) { notify("Error", "Fallo al crear curso", "error"); }
  };

  const handleCreateLeccion = async () => {
      try {
          await api.post('/academia/lecciones', { ...newLeccion, id_curso: selectedCursoId });
          notify("Éxito", "Lección añadida", "success");
          setNewLeccion({ titulo: '', contenido_video_url: '', contenido_texto: '', orden: lecciones.length + 1 });
          setIsAddingLeccion(false); fetchLecciones(selectedCursoId);
      } catch (e) { notify("Error", "No se pudo crear", "error"); }
  };

  const handleCreateEvento = async () => {
      try {
          await api.post('/eventos/', newEvento);
          notify("Éxito", "Evento programado", "success");
          setNewEvento({ titulo: '', descripcion: '', tipo_evento: 'CONFERENCIA', fecha_inicio: '', fecha_fin: '', hora_inicio: '', hora_fin: '', modalidad: 'VIRTUAL', ubicacion: '', capacidad_max: 50, refrigerio_incluido: false });
          setIsAddingEvento(false); fetchData();
      } catch (e) { notify("Error", "Fallo al programar", "error"); }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
        await authService.updateUserRole(userId, newRole);
        notify("Rol Actualizado", `Permisos asignados`, "success");
        fetchData();
    } catch (e) { notify("Error", "Permisos insuficientes", "error"); }
  };

  const confirmDelete = (type, id, name) => setDeleteDialog({ open: true, type, id, name });

  const filteredUsers = selectedTab === 'usuarios' ? data.filter(u => `${u.nombres} ${u.apellidos} ${u.correo} ${u.alias}`.toLowerCase().includes(searchTerm.toLowerCase())) : [];
  const searchedUsers = userSearchTerm.length > 1 ? usuariosList.filter(u => `${u.nombres} ${u.apellidos} ${u.alias}`.toLowerCase().includes(userSearchTerm.toLowerCase())).slice(0, 4) : [];
  const souvenirsData = selectedTab === 'souvenirs' ? data.filter(p => p && p.id_producto) : [];

  const getFileIcon = (tipo) => {
      switch(tipo?.toLowerCase()) {
          case 'pdf': return <Document24Regular style={{color: '#F40F02'}} />;
          case 'pptx': case 'ppt': return <Document24Regular style={{color: '#D04423'}} />;
          default: return <Library24Regular />;
      }
  };

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

      <TabList selectedValue={selectedTab} onTabSelect={(e, d) => { setData([]); setSelectedTab(d.value); }}>
        <Tab value="usuarios" icon={<People24Regular />}>Gestión de Miembros</Tab>
        <Tab value="eventos" icon={<CalendarLtr24Regular />}>Operaciones Eventos</Tab>
        <Tab value="souvenirs" icon={<Box24Regular />}>Catálogo & Caja POS</Tab>
        <Tab value="biblioteca" icon={<Library24Regular />}>Biblioteca Digital</Tab>
        <Tab value="academia" icon={<HatGraduation24Regular />}>Aula Virtual LMS</Tab>
      </TabList>

      <MEHCard>
        {selectedTab === 'usuarios' && (
            <div>
                <div className={styles.infoPanel}><Info24Regular style={{ fontSize: '36px', color: tokens.colorBrandForeground1 }} /><div><MEHTypography variant="h3" style={{ color: tokens.colorBrandForeground1, fontWeight: 'bold' }}>Control de Miembros</MEHTypography><MEHTypography variant="body" style={{ opacity: 0.9 }}>Administra identidades, eleva privilegios y audita la inversión de la comunidad.</MEHTypography></div></div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}><Input placeholder="Buscar miembro..." contentBefore={<Search24Regular />} value={searchTerm} onChange={(e, d) => setSearchBox(d.value)} style={{ width: '400px', height: '45px' }} /><MEHButton size="small" icon={<ArrowDownload24Regular />} appearance="primary" onClick={handleExportCSV}>Exportar Lista</MEHButton></div>
                <div className={styles.tableWrapper}>{loading ? <div style={{padding: '60px', textAlign: 'center'}}><Spinner label="Cargando base de datos..." /></div> : <Table size="extra-small"><TableHeader><TableRow><TableHeaderCell>Miembro</TableHeaderCell><TableHeaderCell>Unión & Logros</TableHeaderCell><TableHeaderCell>Inversión</TableHeaderCell><TableHeaderCell>Rol</TableHeaderCell><TableHeaderCell>Acción</TableHeaderCell></TableRow></TableHeader><TableBody>{filteredUsers.map(u => (<TableRow key={`u-row-${u.id_usuario}`} className={styles.userRow}><TableCell><div className={styles.avatarStack}><Avatar size={48} name={u.nombres} image={{src: resolveApiFileUrl(u.foto_url)}} /><div><b>{u.nombres} {u.apellidos}</b><br/><Badge appearance="outline" color="brand">@{u.alias || 'miembro'}</Badge></div></div></TableCell><TableCell><div><CalendarLtr24Regular style={{fontSize: '14px'}} /> {new Date(u.fecha_registro).toLocaleDateString()}<br/><Trophy24Regular style={{fontSize: '14px', color: tokens.colorPaletteGoldForeground1}} /> <b>{u.badge_count || 0} Logros</b></div></TableCell><TableCell><div><Money24Regular style={{color: tokens.colorPaletteGreenForeground1}} /> <b>{u.total_invertido || 0} Bs</b></div></TableCell><TableCell><Select className={styles.roleSelector} value={u.rol} size="small" onChange={(e) => handleRoleChange(u.id_usuario, e.target.value)}><option value="ADMIN">ADMINISTRATOR</option><option value="ORGANIZADOR">ORGANIZER</option><option value="AMBASSADOR">AMBASSADOR</option><option value="MIEMBRO">MEMBER</option></Select></TableCell><TableCell>{u.id_usuario !== currentUser?.id_usuario ? <MEHButton size="small" appearance="subtle" icon={<PersonDelete24Regular style={{color: tokens.colorPaletteRedForeground1}} />} onClick={() => confirmDelete('user', u.id_usuario, u.nombres)} /> : <Badge appearance="outline">Tú</Badge>}</TableCell></TableRow>))}</TableBody></Table>}</div>
            </div>
        )}

        {selectedTab === 'eventos' && (
            <div className={styles.classroomGrid}>
                <div className={styles.sidebar}><MEHTypography variant="h3">Eventos Activos</MEHTypography><Divider />{eventosList.map(ev => (<div key={`ev-nav-${ev.id_evento}`} className={`${styles.selectableCard} ${selectedEventoId === ev.id_evento ? styles.activeItem : ''}`} onClick={() => setSelectedEventoId(ev.id_evento)}><div style={{display: 'flex', alignItems: 'center', gap: '12px'}}><Badge color={ev.tipo_evento === 'HACKATHON' ? 'important' : 'brand'}>{ev.tipo_evento?.charAt(0)}</Badge><div><b>{ev.titulo}</b><br/><MEHTypography variant="caption">{new Date(ev.fecha_inicio).toLocaleDateString()}</MEHTypography></div></div></div>))}<MEHButton size="small" icon={<Add24Regular />} appearance="subtle" onClick={() => setIsAddingEvento(true)}>Nuevo Evento</MEHButton></div>
                <div style={{ paddingLeft: '24px', borderLeft: `1px solid ${tokens.colorNeutralBackground3}` }}>
                    {isAddingEvento ? <div className={styles.formPanel}><MEHTypography variant="h2">Programar Evento</MEHTypography><Field label="Título" required><Input value={newEvento.titulo} onChange={(e, d) => setNewEvento({...newEvento, titulo: d.value})} /></Field><Select value={newEvento.tipo_evento} onChange={(e) => setNewEvento({...newEvento, tipo_evento: e.target.value})}><option value="CONFERENCIA">CONFERENCIA</option><option value="HACKATHON">HACKATHON</option></Select><div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}><Field label="Fecha"><Input type="date" value={newEvento.fecha_inicio} onChange={(e, d) => setNewEvento({...newEvento, fecha_inicio: d.value})} /></Field><Field label="Cupos"><Input type="number" value={newEvento.capacidad_max} onChange={(e, d) => setNewEvento({...newEvento, capacidad_max: d.value})} /></Field></div><Switch label="Refrigerio" checked={newEvento.refrigerio_incluido} onChange={(e, d) => setNewEvento({...newEvento, refrigerio_incluido: d.checked})} /><MEHButton onClick={handleCreateEvento}>Publicar</MEHButton></div> : selectedEventoId ? <div><MEHTypography variant="h1">{eventosList.find(e => e.id_evento === selectedEventoId)?.titulo}</MEHTypography><Divider style={{margin: '24px 0'}} /><div className={styles.gridTwo}><div className={styles.infoCard}><MEHTypography variant="h3"><Food24Regular /> Logística</MEHTypography><MEHButton icon={<QrCode24Regular />}>Escanear Refrigerio</MEHButton></div><div className={styles.infoCard}><MEHTypography variant="h3"><PeopleTeam24Regular /> Asistencia</MEHTypography><MEHButton appearance="outline">Inscritos</MEHButton></div></div></div> : <div style={{textAlign: 'center', padding: '100px', opacity: 0.5}}><CalendarLtr24Regular style={{fontSize: '64px'}} /><MEHTypography variant="h3">Selecciona un evento</MEHTypography></div>}
                </div>
            </div>
        )}

        {selectedTab === 'souvenirs' && (
            <div className={styles.gridTwo}>
                <div className={styles.formPanel}>
                    <MEHTypography variant="h3"><Add24Regular /> {isEditingSouvenir ? 'Editar' : 'Nuevo'} Producto</MEHTypography>
                    <Field label="Nombre Comercial"><Input value={newSouvenir.nombre} onChange={(e, d) => setNewSouvenir({...newSouvenir, nombre: d.value})} /></Field>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}><Field label="Precio"><Input type="number" contentBefore="Bs" value={newSouvenir.precio} onChange={(e, d) => setNewSouvenir({...newSouvenir, precio: d.value})} /></Field><Field label="Stock"><Input type="number" value={newSouvenir.stock} onChange={(e, d) => setNewSouvenir({...newSouvenir, stock: d.value})} /></Field></div>
                    <div className={styles.uploadBox} onClick={() => document.getElementById('souv-file').click()}>{uploading ? <Spinner size="tiny" /> : <><ArrowUpload24Regular /> <span>Imagen</span><input id="souv-file" type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setNewSouvenir, newSouvenir, 'imagen_url')} style={{ display: 'none' }} /></>}</div>
                    {newSouvenir.imagen_url && <div className={styles.previewContainer}><img src={`${resolveApiFileUrl(newSouvenir.imagen_url)}?t=${new Date().getTime()}`} className={styles.previewImage} alt="Preview" /></div>}
                    <MEHButton appearance="primary" onClick={handleSaveSouvenir}>Guardar</MEHButton>
                    <Divider style={{ margin: '24px 0' }}>Caja POS</Divider>
                    {!selectedUserForSale ? <Field label="Buscar Comprador"><Input placeholder="Nombre o @" contentBefore={<Search24Regular />} value={userSearchTerm} onChange={(e, d) => setUserSearchTerm(d.value)} /></Field> : <div className={styles.selectedUserCard}><div style={{display: 'flex', alignItems: 'center', gap: '12px'}}><Avatar size={40} name={selectedUserForSale.nombres} image={{src: resolveApiFileUrl(selectedUserForSale.foto_url)}} /><MEHTypography variant="body"><b>{selectedUserForSale.nombres}</b></MEHTypography></div><Button icon={<Dismiss24Regular />} appearance="subtle" onClick={() => setSelectedUserForSale(null)} /></div>}
                    {searchedUsers.length > 0 && <div style={{backgroundColor: tokens.colorNeutralBackground1, boxShadow: tokens.shadow28, borderRadius: '12px', overflow: 'hidden'}}>{searchedUsers.map(u => (<div key={`pos-res-${u.id_usuario}`} className={styles.posUserResult} onClick={() => { setSelectedUserForSale(u); setUserSearchTerm(''); }}><Avatar size={32} name={u.nombres} image={{src: resolveApiFileUrl(u.foto_url)}} /><b>{u.nombres}</b></div>))}</div>}
                    <Select value={newVenta.id_producto} onChange={(e) => setNewVenta({...newVenta, id_producto: e.target.value})}><option value="">Elegir Producto...</option>{souvenirsData.map(p => <option key={`p-sel-${p.id_producto}`} value={p.id_producto}>{p.nombre} ({p.stock} un.)</option>)}</Select>
                    <div style={{ display: 'flex', gap: '12px' }}><MEHButton appearance={newVenta.metodo_pago === 'EFECTIVO' ? 'primary' : 'outline'} icon={<Money24Regular />} style={{ flexGrow: 1 }} onClick={() => setNewVenta({ ...newVenta, metodo_pago: 'EFECTIVO' })}>Efectivo</MEHButton><MEHButton appearance={newVenta.metodo_pago === 'QR' ? 'primary' : 'outline'} icon={<QrCode24Regular />} style={{ flexGrow: 1 }} onClick={() => setNewVenta({ ...newVenta, metodo_pago: 'QR' })}>Pago QR</MEHButton></div>
                    <MEHButton appearance="primary" icon={<CheckmarkCircle24Regular />} disabled={!selectedUserForSale} onClick={handleProcessVenta}>Confirmar Venta</MEHButton>
                </div>
                <div className={styles.tableWrapper}><div style={{padding: '16px', borderBottom: `1px solid ${tokens.colorNeutralBackground3}`}}><MEHTypography variant="h3">Inventario</MEHTypography></div><Table size="small"><TableHeader><TableRow><TableHeaderCell>Item</TableHeaderCell><TableHeaderCell>Stock</TableHeaderCell><TableHeaderCell>Acciones</TableHeaderCell></TableRow></TableHeader><TableBody>{souvenirsData.map(i => (<TableRow key={`p-row-${i.id_producto}`} className={styles.userRow}><TableCell><div style={{display: 'flex', alignItems: 'center', gap: '12px'}}><img src={resolveApiFileUrl(i.imagen_url)} className={styles.itemThumb} alt="" /><b>{i.nombre}</b></div></TableCell><TableCell><Badge color={i.stock < 5 ? 'important' : 'success'}>{i.stock}</Badge></TableCell><TableCell><MEHButton size="small" icon={<Edit24Regular />} onClick={() => handleEditSouvenir(i)} /></TableCell></TableRow>))}</TableBody></Table></div>
            </div>
        )}

        {selectedTab === 'biblioteca' && (
            <div className={styles.gridTwo}>
                <div className={styles.formPanel}>
                    <MEHTypography variant="h3"><Library24Regular /> Nuevo Recurso</MEHTypography>
                    <Field label="Título" required><Input value={newRecurso.titulo} onChange={(e, d) => setNewRecurso({...newRecurso, titulo: d.value})} /></Field>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}><Field label="Autor"><Input value={newRecurso.autor_nombre} onChange={(e, d) => setNewRecurso({...newRecurso, autor_nombre: d.value})} /></Field><Field label="Propósito"><Input value={newRecurso.motivo} onChange={(e, d) => setNewRecurso({...newRecurso, motivo: d.value})} /></Field></div>
                    <div className={styles.uploadBox} onClick={() => document.getElementById('lib-thumb').click()}>{uploading ? <Spinner size="tiny" /> : <><Image24Regular /> <span>Miniatura</span><input id="lib-thumb" type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setNewRecurso, newRecurso, 'portada_url')} style={{ display: 'none' }} /></>}</div>
                    {newRecurso.portada_url && <div className={styles.previewContainer}><img src={resolveApiFileUrl(newRecurso.portada_url)} className={styles.previewImage} alt="Port" /></div>}
                    <Select value={newRecurso.tipo_recurso} onChange={(e) => setNewRecurso({...newRecurso, tipo_recurso: e.target.value})}><option value="ARCHIVO">ARCHIVO</option><option value="VIDEO">VIDEO</option><option value="BLOG">BLOG/NOTA</option></Select>
                    {newRecurso.tipo_recurso === 'BLOG' ? <div className={styles.quillWrapper}><ReactQuill theme="snow" value={newRecurso.contenido_md} onChange={(val) => setNewRecurso({...newRecurso, contenido_md: val})} modules={quillModules} /></div> : <div className={styles.uploadBox} onClick={() => document.getElementById('lib-file').click()}>{uploading ? <Spinner size="tiny" /> : <><ArrowUpload24Regular /> <span>Subir Recurso</span><input id="lib-file" type="file" onChange={(e) => handleFileUpload(e, setNewRecurso, newRecurso, 'url_descarga')} style={{ display: 'none' }} /></>}</div>}
                    <MEHButton appearance="primary" size="large" onClick={handleSaveRecurso}>Publicar</MEHButton>
                </div>
                <div className={styles.tableWrapper}><div style={{padding: '16px', borderBottom: `1px solid ${tokens.colorNeutralBackground3}`}}><MEHTypography variant="h3">Repositorio Digital</MEHTypography></div><Table><TableHeader><TableRow><TableHeaderCell>Recurso</TableHeaderCell><TableHeaderCell>Detalles</TableHeaderCell><TableHeaderCell>Acciones</TableHeaderCell></TableRow></TableHeader><TableBody>{data.map(r => (<TableRow key={`r-row-${r.id_recurso}`} className={styles.userRow}><TableCell><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>{getFileIcon(r.tipo_archivo || r.tipo_recurso)}<div><b>{r.titulo}</b><br/><MEHTypography variant="caption">Por: {r.autor_nombre}</MEHTypography></div></div></TableCell><TableCell><Badge appearance="tint" color="brand">{r.categoria}</Badge></TableCell><TableCell><div style={{display: 'flex', gap: '8px'}}><MEHButton size="small" appearance="subtle" icon={<Edit24Regular />} onClick={() => handleEditRecurso(r)} /><MEHButton size="small" appearance="subtle" icon={<Delete24Regular style={{color: tokens.colorPaletteRedForeground1}} />} onClick={() => confirmDelete('recurso', r.id_recurso, r.titulo)} /></div></TableCell></TableRow>))}</TableBody></Table></div>
            </div>
        )}

        {selectedTab === 'academia' && (
            <div className={styles.classroomGrid}>
                <div className={styles.sidebar}><div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><MEHTypography variant="h3">Tus Cursos</MEHTypography><Button icon={<Add24Regular />} appearance="subtle" onClick={() => setIsAddingCurso(true)} /></div><Divider />{data.map(c => (<div key={`c-nav-${c.id_curso}`} className={`${styles.selectableCard} ${selectedCursoId === c.id_curso ? styles.activeItem : ''}`} onClick={() => { setSelectedCursoId(c.id_curso); setIsAddingCurso(false); fetchLecciones(c.id_curso); }}><div style={{display: 'flex', alignItems: 'center', gap: '12px'}}><Avatar name={c.nombre_curso} image={{src: resolveApiFileUrl(c.imagen_url)}} /><b>{c.nombre_curso}</b></div></div>))}</div>
                <div style={{ paddingLeft: '24px', borderLeft: `1px solid ${tokens.colorNeutralBackground3}` }}>
                    {isAddingCurso ? <div className={styles.formPanel}><MEHTypography variant="h2">Lanzar Programa</MEHTypography><Field label="Nombre" required><Input value={newCurso.nombre_curso} onChange={(e, d) => setNewCurso({...newCurso, nombre_curso: d.value})} /></Field><div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}><Field label="Costo (Bs)"><Input type="number" value={newCurso.costo} onChange={(e, d) => setNewCurso({...newCurso, costo: d.value})} /></Field><Field label="Horas"><Input type="number" value={newCurso.horas_academicas} onChange={(e, d) => setNewCurso({...newCurso, horas_academicas: d.value})} /></Field></div><div className={styles.uploadBox} onClick={() => document.getElementById('course-file').click()}>{uploading ? <Spinner size="tiny" /> : <><Image24Regular /> <span>Subir Portada</span><input id="course-file" type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setNewCurso, newCurso, 'imagen_url')} style={{ display: 'none' }} /></>}</div><MEHButton appearance="primary" onClick={handleSaveCurso}>Lanzar Curso</MEHButton></div> : selectedCursoId ? <div><div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}><div><MEHTypography variant="h1">{data.find(c => c.id_curso === selectedCursoId)?.nombre_curso}</MEHTypography><MEHTypography variant="body" style={{opacity: 0.7}}>Aula Virtual Activa.</MEHTypography></div><MEHButton size="small" icon={<Add24Regular />} onClick={() => setIsAddingLeccion(true)}>Nueva Lección</MEHButton></div>{isAddingLeccion && <div className={styles.formPanel}><Field label="Título"><Input value={newLeccion.titulo} onChange={(e, d) => setNewLeccion({...newLeccion, titulo: d.value})} /></Field><div className={styles.quillWrapper}><ReactQuill theme="snow" value={newLeccion.contenido_texto} onChange={v => setNewLeccion({...newLeccion, contenido_texto: v})} modules={quillModules} /></div><MEHButton onClick={handleCreateLeccion}>Guardar</MEHButton></div>}<Accordion collapsible>{lecciones.map(l => (<AccordionItem value={l.id_leccion} key={`l-${l.id_leccion}`}><AccordionHeader expandIconPosition="end"><b>{l.orden}. {l.titulo}</b></AccordionHeader><AccordionPanel><div dangerouslySetInnerHTML={{__html: l.contenido_texto}} style={{padding: '16px'}} /></AccordionPanel></AccordionItem>))}</Accordion></div> : <div style={{textAlign: 'center', padding: '100px', opacity: 0.5}}><HatGraduation24Regular style={{fontSize: '64px'}} /><MEHTypography variant="h3">Selecciona un curso</MEHTypography></div>}
                </div>
            </div>
        )}
      </MEHCard>

      <Dialog open={deleteDialog.open} onOpenChange={(e, d) => setDeleteDialog({ ...deleteDialog, open: d.open })}>
          <DialogSurface style={{ ...shorthands.border('2px', 'solid', tokens.colorPaletteRedBorder1), borderRadius: '24px' }}>
              <DialogBody><DialogTitle>Confirmar Eliminación</DialogTitle><DialogContent>¿Estás seguro de eliminar a <b>{deleteDialog.name}</b>?</DialogContent><DialogActions><Button appearance="secondary" onClick={() => setDeleteDialog({ open: false })}>Cancelar</Button><MEHButton appearance="primary" style={{ backgroundColor: tokens.colorPaletteRedBackground3 }} onClick={() => { if (deleteDialog.type === 'souvenir') handleDeleteSouvenir(); if (deleteDialog.type === 'recurso') handleDeleteRecurso(); }}>Confirmar</MEHButton></DialogActions></DialogBody>
          </DialogSurface>
      </Dialog>
    </div>
  );
};

export default AdminPanel;

import React, { useState, useEffect } from 'react';
import { 
  makeStyles, shorthands, tokens, TabList, Tab, Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell,
  Input, Label, Textarea, Spinner, Avatar, Badge, Dropdown, Option, Divider, MessageBar, Select
} from '@fluentui/react-components';
import { 
  Settings24Regular, CalendarLtr24Regular, Library24Regular, People24Regular, Save24Regular, Delete24Regular,
  Certificate24Regular, ShieldCheckmark24Regular, ArrowUpload24Regular, PersonAdd24Regular, Mail24Filled,
  LockClosed24Filled, MegaphoneLoud24Filled, Reward24Filled, Building24Regular, HatGraduation24Regular,
  Collections24Regular, Box24Regular, PeopleCommunity24Regular, Mic24Regular, Cart24Regular
} from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { MEHCard, MEHButton, MEHTypography } from '../components/ui';
import eventoService from '../services/eventoService';
import authService from '../services/authService';
import recursoService from '../services/recursoService';
import adminService from '../services/adminService';
import api from '../services/api';
import { useAuth, useNotify } from '../App';
import { hasPermission, PERMISSION_EVENTS_MANAGE, PERMISSION_AUDIT_READ } from '../auth/rbac';
import { validateName, validateEmail, validatePassword, hasErrors } from '../utils/validators';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    animationName: { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
    animationDuration: '0.5s',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px', marginTop: '20px' },
  tableWrapper: { width: '100%', overflowX: 'auto' },
  gridTwo: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      '@media (max-width: 600px)': { gridTemplateColumns: '1fr' }
  },
  uploadBox: {
    border: `2px dashed ${tokens.colorNeutralBackground3}`,
    padding: '16px',
    borderRadius: '8px',
    textAlign: 'center',
    position: 'relative',
    cursor: 'pointer'
  }
});

const AdminPanel = () => {
  const styles = useStyles();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { notify } = useNotify();
  
  const [selectedTab, setSelectedTab] = useState('usuarios');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [cursosList, setCursosList] = useState([]);
  const [selectedCursoAlumnos, setSelectedCursoAlumnos] = useState(null);
  
  // FORM STATES
  const [newSpeaker, setNewSpeaker] = useState({ nombre: '', bio: '', trayectoria: '', trabajo_actual: '', linkedin_url: '', foto_url: '' });
  const [newAuspicio, setNewAuspicio] = useState({ nombre: '', sitio_web: '', tipo: 'GENERAL', logo_url: '' });
  const [newComunidad, setNewComunidad] = useState({ nombre: '', descripcion: '', link_contacto: '', logo_url: '' });
  const [newSouvenir, setNewSouvenir] = useState({ nombre: '', descripcion: '', precio: 0, stock: 10, imagen_url: '', categoria: 'SOUVENIR' });
  const [newVenta, setNewVenta] = useState({ id_usuario: '', id_producto: '', cantidad: 1 });
  const [ventasData, setVentasData] = useState([]);

  const fetchVentas = async () => {
    try {
        const res = await api.get('/souvenirs/ventas');
        setVentasData(res.data || []);
    } catch (err) { console.error("Error fetching ventas", err); }
  };

  useEffect(() => {
    fetchData();
    if (selectedTab === 'eventos' || selectedTab === 'biblioteca') {
        fetchAllEntities();
    }
    if (selectedTab === 'academia') {
        fetchCursos();
    }
    if (selectedTab === 'souvenirs') {
        fetchVentas();
    }
  }, [selectedTab]);
  const [newRecurso, setNewRecurso] = useState({ 
    titulo: '', descripcion: '', url_descarga: '', tipo_archivo: '', 
    tipo_recurso: 'ARCHIVO', contenido_md: '', categoria: 'GENERAL', id_curso: null 
  });
  const [newCurso, setNewCurso] = useState({ nombre_curso: '', descripcion: '', horas_academicas: 10, imagen_url: '' });

  const [speakersList, setSpeakersList] = useState([]);
  const [auspiciosList, setAuspiciosList] = useState([]);
  const [comunidadesList, setComunidadesList] = useState([]);

  useEffect(() => {
    fetchData();
    if (selectedTab === 'eventos' || selectedTab === 'biblioteca') {
        fetchAllEntities();
    }
    if (selectedTab === 'academia') {
        fetchCursos();
    }
  }, [selectedTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
        let res;
        if (selectedTab === 'usuarios') res = await authService.getAllUsers();
        if (selectedTab === 'eventos') res = await eventoService.getEventos();
        if (selectedTab === 'speakers') res = await adminService.getSpeakers();
        if (selectedTab === 'auspicios') res = await adminService.getAuspiciadores();
        if (selectedTab === 'comunidades') res = await adminService.getComunidades();
        if (selectedTab === 'souvenirs') res = await adminService.getSouvenirs();
        if (selectedTab === 'biblioteca') res = await recursoService.getRecursos();
        if (selectedTab === 'academia') res = await api.get('/cursos/');
        setData(res?.data || res || []);
    } catch (err) { notify("Error", "No se pudo cargar la información", "error"); }
    finally { setLoading(false); }
  };

  const fetchCursos = async () => {
    try {
        const res = await api.get('/cursos/');
        setCursosList(res.data || []);
    } catch (err) { console.error("Error fetching cursos", err); }
  };

  const fetchAllEntities = async () => {
      try {
          const [s, a, c, curs] = await Promise.all([
              adminService.getSpeakers(),
              adminService.getAuspiciadores(),
              adminService.getComunidades(),
              api.get('/cursos/')
          ]);
          setSpeakersList(s || []);
          setAuspiciosList(a || []);
          setComunidadesList(c || []);
          setCursosList(curs.data || []);
      } catch (err) { console.error("Error fetching entities", err); }
  };

  const handleFileUpload = async (e, targetSetter, stateObj, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post('/files/upload', formData);
        targetSetter({ ...stateObj, [fieldName]: res.data.url });
        notify("Éxito", "Archivo cargado correctamente", "success");
    } catch (err) { notify("Error", "Fallo al subir archivo", "error"); }
  };

  const handleCreateSpeaker = async () => {
    try {
        await adminService.createSpeaker(newSpeaker);
        notify("Éxito", "Speaker registrado", "success");
        setNewSpeaker({ nombre: '', bio: '', trayectoria: '', trabajo_actual: '', linkedin_url: '', foto_url: '' });
        fetchData();
    } catch (e) { notify("Error", "Fallo al crear", "error"); }
  };

  const handleCreateEvento = async () => {
      try {
          // Validar campos básicos
          if (!newEvento.titulo || !newEvento.fecha_inicio || !newEvento.modalidad) {
              notify("Atención", "Título, fecha y modalidad son obligatorios", "warning");
              return;
          }

          // Convertir IDs de strings a números para el backend
          const payload = {
              ...newEvento,
              id_speakers: newEvento.id_speakers.map(id => parseInt(id)),
              id_auspiciadores: newEvento.id_auspiciadores.map(id => parseInt(id)),
              id_comunidades: newEvento.id_comunidades.map(id => parseInt(id))
          };

          await eventoService.createEvento(payload);
          notify("Éxito", "Evento programado con éxito", "success");
          setNewEvento({ 
            titulo: '', descripcion: '', fecha_inicio: '', fecha_fin: '',
            hora_inicio: '', hora_fin: '', modalidad: 'VIRTUAL', ubicacion: '',
            capacidad_max: 50, id_speakers: [], id_auspiciadores: [], id_comunidades: [] 
          });
          fetchData();
      } catch (e) { notify("Error", "No se pudo crear el evento", "error"); }
  };

  const handleCreateSouvenir = async () => {
    try {
        await adminService.createSouvenir(newSouvenir);
        notify("Éxito", "Souvenir creado", "success");
        setNewSouvenir({ nombre: '', descripcion: '', precio: 0, stock: 10, imagen_url: '', categoria: 'SOUVENIR' });
        fetchData();
    } catch (e) { notify("Error", "Fallo al crear", "error"); }
  };

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Settings24Regular style={{ color: tokens.colorBrandForeground1, fontSize: '32px' }} />
          <MEHTypography variant="h1">Master Admin Panel</MEHTypography>
      </div>

      <TabList selectedValue={selectedTab} onTabSelect={(e, d) => setSelectedTab(d.value)} style={{ overflowX: 'auto' }}>
        <Tab value="usuarios" icon={<People24Regular />}>Usuarios</Tab>
        <Tab value="eventos" icon={<CalendarLtr24Regular />}>Eventos</Tab>
        <Tab value="speakers" icon={<Mic24Regular />}>Speakers</Tab>
        <Tab value="auspicios" icon={<Reward24Filled />}>Auspicios</Tab>
        <Tab value="comunidades" icon={<PeopleCommunity24Regular />}>Comunidades</Tab>
        <Tab value="souvenirs" icon={<Box24Regular />}>Souvenirs</Tab>
        <Tab value="biblioteca" icon={<Library24Regular />}>Biblioteca</Tab>
        <Tab value="academia" icon={<HatGraduation24Regular />}>Academia</Tab>
      </TabList>

      <MEHCard>
        {selectedTab === 'usuarios' && (
            <div className={styles.tableWrapper}>
                <MEHTypography variant="h3" style={{ marginBottom: '16px', display: 'block' }}>
                    <PeopleCommunity24Regular /> Gestión Integral de Usuarios y Roles
                </MEHTypography>
                {loading ? <Spinner /> : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHeaderCell>Miembro</TableHeaderCell>
                                <TableHeaderCell>Correo</TableHeaderCell>
                                <TableHeaderCell>Perfil Académico/Prof.</TableHeaderCell>
                                <TableHeaderCell>Departamento</TableHeaderCell>
                                <TableHeaderCell>Rol del Sistema</TableHeaderCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map(u => (
                                <TableRow key={u.id_usuario}>
                                    <TableCell>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Avatar size={32} name={u.nombres} src={u.foto_url} />
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <MEHTypography variant="body" style={{ fontWeight: tokens.fontWeightSemibold }}>
                                                    {u.nombres} {u.apellidos}
                                                </MEHTypography>
                                                {u.alias && (
                                                    <MEHTypography variant="caption" style={{ opacity: 0.6 }}>
                                                        @{u.alias}
                                                    </MEHTypography>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{u.correo}</TableCell>
                                    <TableCell>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <Badge appearance="outline" color={u.tipo_entidad === 'Profesional' ? 'brand' : 'success'}>
                                                {u.tipo_entidad || 'Estudiante'}
                                            </Badge>
                                            <MEHTypography variant="caption" style={{ opacity: 0.7 }}>
                                                {u.institucion || 'No especificada'}
                                            </MEHTypography>
                                        </div>
                                    </TableCell>
                                    <TableCell>{u.departamento || 'N/A'}</TableCell>
                                    <TableCell>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Select 
                                                value={u.rol} 
                                                size="small"
                                                onChange={async (e) => {
                                                    try {
                                                        await authService.updateUserRole(u.id_usuario, e.target.value);
                                                        notify("Éxito", `Rol de ${u.nombres} actualizado a ${e.target.value}`, "success");
                                                        fetchData();
                                                    } catch (e) { notify("Error", "No se pudo actualizar el rol", "error"); }
                                                }}
                                            >
                                                <option value="ADMIN">ADMIN</option>
                                                <option value="ORGANIZADOR">ORGANIZADOR</option>
                                                <option value="MODERADOR">MODERADOR</option>
                                                <option value="SOPORTE">SOPORTE</option>
                                                <option value="EMBAJADOR">EMBAJADOR</option>
                                                <option value="MIEMBRO">MIEMBRO</option>
                                            </Select>
                                            {u.rol === 'ADMIN' && <ShieldCheckmark24Regular style={{ color: tokens.colorPaletteGoldForeground1 }} />}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        )}

        {selectedTab === 'speakers' && (
            <div className={styles.gridTwo}>
                <div>
                    <MEHTypography variant="h3">Nuevo Speaker</MEHTypography>
                    <div className={styles.form}>
                        <Input placeholder="Nombre Completo" value={newSpeaker.nombre} onChange={(e, d) => setNewSpeaker({...newSpeaker, nombre: d.value})} />
                        <Textarea placeholder="Bio corta" value={newSpeaker.bio} onChange={(e, d) => setNewSpeaker({...newSpeaker, bio: d.value})} />
                        <Input placeholder="Trabajo Actual" value={newSpeaker.trabajo_actual} onChange={(e, d) => setNewSpeaker({...newSpeaker, trabajo_actual: d.value})} />
                        <div className={styles.uploadBox}>
                            <ArrowUpload24Regular /> <span>Subir Foto</span>
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setNewSpeaker, newSpeaker, 'foto_url')} style={{ opacity: 0, position: 'absolute', inset: 0 }} />
                        </div>
                        <MEHButton appearance="primary" onClick={handleCreateSpeaker}>Registrar Speaker</MEHButton>
                    </div>
                </div>
                <div className={styles.tableWrapper}>
                    <MEHTypography variant="h3">Directorio</MEHTypography>
                    <Table>
                        <TableHeader><TableRow><TableHeaderCell>Nombre</TableHeaderCell><TableHeaderCell>Trabajo</TableHeaderCell></TableRow></TableHeader>
                        <TableBody>
                            {data.map(s => <TableRow key={s.id_speaker}><TableCell><Avatar src={s.foto_url} /> {s.nombre}</TableCell><TableCell>{s.trabajo_actual}</TableCell></TableRow>)}
                        </TableBody>
                    </Table>
                </div>
            </div>
        )}

        {selectedTab === 'souvenirs' && (
            <div className={styles.gridTwo}>
                <div>
                    <MEHTypography variant="h3">Gestión de Catálogo</MEHTypography>
                    <div className={styles.form}>
                        <Input placeholder="Nombre del Producto" value={newSouvenir.nombre} onChange={(e, d) => setNewSouvenir({...newSouvenir, nombre: d.value})} />
                        <Textarea placeholder="Descripción" value={newSouvenir.descripcion} onChange={(e, d) => setNewSouvenir({...newSouvenir, descripcion: d.value})} />
                        <div className={styles.gridTwo}>
                            <Input type="number" label="Precio (Bs)" value={newSouvenir.precio} onChange={(e, d) => setNewSouvenir({...newSouvenir, precio: d.value})} />
                            <Input type="number" label="Stock" value={newSouvenir.stock} onChange={(e, d) => setNewSouvenir({...newSouvenir, stock: d.value})} />
                        </div>
                        <div className={styles.uploadBox}>
                            <ArrowUpload24Regular /> <span>Subir Imagen</span>
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setNewSouvenir, newSouvenir, 'imagen_url')} style={{ opacity: 0, position: 'absolute', inset: 0 }} />
                        </div>
                        <MEHButton appearance="primary" onClick={handleCreateSouvenir}>Guardar Producto</MEHButton>
                    </div>

                    <Divider style={{ margin: '32px 0' }}>Registrar Venta Directa</Divider>
                    <div className={styles.form}>
                        <Label>Miembro Comprador</Label>
                        <Select value={newVenta.id_usuario} onChange={(e) => setNewVenta({...newVenta, id_usuario: e.target.value})}>
                            <option value="">Seleccionar Usuario...</option>
                            {(selectedTab === 'souvenirs' ? data : []).filter(u => u.correo).map(u => <option key={u.id_usuario} value={u.id_usuario}>{u.nombres} {u.apellidos}</option>)}
                        </Select>

                        <Label>Producto</Label>
                        <Select value={newVenta.id_producto} onChange={(e) => setNewVenta({...newVenta, id_producto: e.target.value})}>
                            <option value="">Seleccionar Item...</option>
                            {(selectedTab === 'souvenirs' ? data : []).filter(p => p.nombre).map(p => <option key={p.id_producto} value={p.id_producto}>{p.nombre} (Stock: {p.stock})</option>)}
                        </Select>

                        <Input type="number" label="Cantidad" value={newVenta.cantidad} onChange={(e, d) => setNewVenta({...newVenta, cantidad: d.value})} />
                        
                        <MEHButton appearance="primary" icon={<Cart24Regular />} onClick={async () => {
                            try {
                                if (!newVenta.id_usuario || !newVenta.id_producto) {
                                    notify("Atención", "Seleccione usuario y producto", "warning");
                                    return;
                                }
                                await api.post('/souvenirs/ventas', {
                                    id_usuario: parseInt(newVenta.id_usuario),
                                    items: [{ id_producto: parseInt(newVenta.id_producto), cantidad: parseInt(newVenta.cantidad) }]
                                });
                                notify("Éxito", "Venta registrada y stock actualizado", "success");
                                setNewVenta({ id_usuario: '', id_producto: '', cantidad: 1 });
                                fetchData();
                                fetchVentas();
                            } catch (e) { notify("Error", e.response?.data?.detail || "Fallo al vender", "error"); }
                        }}>Confirmar Transacción</MEHButton>
                    </div>
                </div>
                <div className={styles.tableWrapper}>
                    <MEHTypography variant="h3">Inventario Activo</MEHTypography>
                    <Table style={{ marginBottom: '32px' }}>
                        <TableHeader><TableRow><TableHeaderCell>Item</TableHeaderCell><TableHeaderCell>Precio</TableHeaderCell><TableHeaderCell>Stock</TableHeaderCell><TableHeaderCell>Acción</TableHeaderCell></TableRow></TableHeader>
                        <TableBody>
                            {(selectedTab === 'souvenirs' ? data : []).filter(p => p.nombre).map(i => (
                                <TableRow key={i.id_producto}>
                                    <TableCell>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Avatar src={i.imagen_url} /> {i.nombre}
                                        </div>
                                    </TableCell>
                                    <TableCell>{i.precio} Bs</TableCell>
                                    <TableCell>
                                        <Badge color={i.stock < 5 ? 'important' : 'brand'}>{i.stock} unidades</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <MEHButton size="small" icon={<Delete24Regular />} onClick={async () => {
                                            if (window.confirm("¿Eliminar del catálogo?")) {
                                                await api.put(`/souvenirs/${i.id_producto}`, { activo: false });
                                                fetchData();
                                            }
                                        }} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <MEHTypography variant="h3">Historial de Ventas</MEHTypography>
                    <Table>
                        <TableHeader><TableRow><TableHeaderCell>Fecha</TableHeaderCell><TableHeaderCell>Total</TableHeaderCell><TableHeaderCell>Estado</TableHeaderCell></TableRow></TableHeader>
                        <TableBody>
                            {ventasData.map(v => (
                                <TableRow key={v.id_pedido}>
                                    <TableCell>{new Date(v.fecha_pedido).toLocaleDateString()}</TableCell>
                                    <TableCell><b>{v.total} Bs</b></TableCell>
                                    <TableCell><Badge color="success">{v.estado}</Badge></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        )}

        {selectedTab === 'eventos' && (
            <div className={styles.gridTwo}>
                <div>
                    <MEHTypography variant="h3">Nuevo Evento</MEHTypography>
                    <div className={styles.form}>
                        <Input placeholder="Título del Evento" value={newEvento.titulo} onChange={(e, d) => setNewEvento({...newEvento, titulo: d.value})} />
                        <Textarea placeholder="Descripción Detallada" value={newEvento.descripcion} onChange={(e, d) => setNewEvento({...newEvento, descripcion: d.value})} />
                        
                        <div className={styles.gridTwo}>
                            <div>
                                <Label>Fecha Inicio</Label>
                                <Input type="date" value={newEvento.fecha_inicio} onChange={(e, d) => setNewEvento({...newEvento, fecha_inicio: d.value})} />
                            </div>
                            <div>
                                <Label>Hora Inicio</Label>
                                <Input type="time" value={newEvento.hora_inicio} onChange={(e, d) => setNewEvento({...newEvento, hora_inicio: d.value})} />
                            </div>
                        </div>

                        <div className={styles.gridTwo}>
                            <div>
                                <Label>Modalidad</Label>
                                <Select value={newEvento.modalidad} onChange={(e) => setNewEvento({...newEvento, modalidad: e.target.value})}>
                                    <option value="VIRTUAL">VIRTUAL</option>
                                    <option value="PRESENCIAL">PRESENCIAL</option>
                                    <option value="HIBRIDO">HÍBRIDO</option>
                                </Select>
                            </div>
                            <div>
                                <Label>Ubicación / Link</Label>
                                <Input placeholder="Dirección o Link" value={newEvento.ubicacion} onChange={(e, d) => setNewEvento({...newEvento, ubicacion: d.value})} />
                            </div>
                        </div>

                        <Divider>Ecosistema del Evento</Divider>
                        
                        <Label>Speakers</Label>
                        <Dropdown 
                            multiselect 
                            placeholder="Seleccionar Speakers"
                            onOptionSelect={(e, d) => setNewEvento({...newEvento, id_speakers: d.selectedOptions})}
                        >
                            {speakersList.map(s => <Option key={s.id_speaker} value={s.id_speaker.toString()}>{s.nombre}</Option>)}
                        </Dropdown>

                        <Label>Auspiciadores</Label>
                        <Dropdown 
                            multiselect 
                            placeholder="Seleccionar Patrocinadores"
                            onOptionSelect={(e, d) => setNewEvento({...newEvento, id_auspiciadores: d.selectedOptions})}
                        >
                            {auspiciosList.map(a => <Option key={a.id_auspiciador} value={a.id_auspiciador.toString()}>{a.nombre}</Option>)}
                        </Dropdown>

                        <Label>Comunidades Aliadas</Label>
                        <Dropdown 
                            multiselect 
                            placeholder="Seleccionar Comunidades"
                            onOptionSelect={(e, d) => setNewEvento({...newEvento, id_comunidades: d.selectedOptions})}
                        >
                            {comunidadesList.map(c => <Option key={c.id_comunidad} value={c.id_comunidad.toString()}>{c.nombre}</Option>)}
                        </Dropdown>

                        <MEHButton appearance="primary" icon={<Save24Regular />} onClick={handleCreateEvento}>Publicar Evento</MEHButton>
                    </div>
                </div>
                <div className={styles.tableWrapper}>
                    <MEHTypography variant="h3">Historial de Eventos</MEHTypography>
                    <Table>
                        <TableHeader><TableRow><TableHeaderCell>Evento</TableHeaderCell><TableHeaderCell>Fecha</TableHeaderCell><TableHeaderCell>Estado</TableHeaderCell></TableRow></TableHeader>
                        <TableBody>
                            {data.map(ev => (
                                <TableRow key={ev.id_evento}>
                                    <TableCell>{ev.titulo}</TableCell>
                                    <TableCell>{new Date(ev.fecha_inicio).toLocaleDateString()}</TableCell>
                                    <TableCell><Badge color="brand">{ev.estado}</Badge></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        )}

        {selectedTab === 'auspicios' && (
            <div className={styles.gridTwo}>
                <div>
                    <MEHTypography variant="h3">Nuevo Auspiciador</MEHTypography>
                    <div className={styles.form}>
                        <Input placeholder="Nombre de Empresa/Marca" value={newAuspicio.nombre} onChange={(e, d) => setNewAuspicio({...newAuspicio, nombre: d.value})} />
                        <Input placeholder="Sitio Web" value={newAuspicio.sitio_web} onChange={(e, d) => setNewAuspicio({...newAuspicio, sitio_web: d.value})} />
                        <Select value={newAuspicio.tipo} onChange={(e) => setNewAuspicio({...newAuspicio, tipo: e.target.value})}>
                            <option value="GOLD">GOLD</option>
                            <option value="SILVER">SILVER</option>
                            <option value="BRONZE">BRONZE</option>
                            <option value="GENERAL">GENERAL</option>
                        </Select>
                        <div className={styles.uploadBox}>
                            <ArrowUpload24Regular /> <span>Subir Logo</span>
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setNewAuspicio, newAuspicio, 'logo_url')} style={{ opacity: 0, position: 'absolute', inset: 0 }} />
                        </div>
                        <MEHButton appearance="primary" onClick={async () => {
                            try {
                                await adminService.createAuspiciador(newAuspicio);
                                notify("Éxito", "Auspiciador creado", "success");
                                setNewAuspicio({ nombre: '', sitio_web: '', tipo: 'GENERAL', logo_url: '' });
                                fetchData();
                            } catch (e) { notify("Error", "Fallo al crear", "error"); }
                        }}>Guardar Patrocinador</MEHButton>
                    </div>
                </div>
                <div className={styles.tableWrapper}>
                    <MEHTypography variant="h3">Aliados</MEHTypography>
                    <Table>
                        <TableHeader><TableRow><TableHeaderCell>Marca</TableHeaderCell><TableHeaderCell>Tipo</TableHeaderCell></TableRow></TableHeader>
                        <TableBody>
                            {data.map(a => <TableRow key={a.id_auspiciador}><TableCell>{a.nombre}</TableCell><TableCell><Badge>{a.tipo}</Badge></TableCell></TableRow>)}
                        </TableBody>
                    </Table>
                </div>
            </div>
        )}

        {selectedTab === 'comunidades' && (
            <div className={styles.gridTwo}>
                <div>
                    <MEHTypography variant="h3">Nueva Comunidad Aliada</MEHTypography>
                    <div className={styles.form}>
                        <Input placeholder="Nombre de la Comunidad" value={newComunidad.nombre} onChange={(e, d) => setNewComunidad({...newComunidad, nombre: d.value})} />
                        <Textarea placeholder="Descripción" value={newComunidad.descripcion} onChange={(e, d) => setNewComunidad({...newComunidad, descripcion: d.value})} />
                        <Input placeholder="Link de Contacto / RRSS" value={newComunidad.link_contacto} onChange={(e, d) => setNewComunidad({...newComunidad, link_contacto: d.value})} />
                        <div className={styles.uploadBox}>
                            <ArrowUpload24Regular /> <span>Subir Logo</span>
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setNewComunidad, newComunidad, 'logo_url')} style={{ opacity: 0, position: 'absolute', inset: 0 }} />
                        </div>
                        <MEHButton appearance="primary" onClick={async () => {
                            try {
                                await adminService.createComunidad(newComunidad);
                                notify("Éxito", "Comunidad vinculada", "success");
                                setNewComunidad({ nombre: '', descripcion: '', link_contacto: '', logo_url: '' });
                                fetchData();
                            } catch (e) { notify("Error", "Fallo al crear", "error"); }
                        }}>Guardar Comunidad</MEHButton>
                    </div>
                </div>
                <div className={styles.tableWrapper}>
                    <MEHTypography variant="h3">Comunidades</MEHTypography>
                    <Table>
                        <TableHeader><TableRow><TableHeaderCell>Comunidad</TableHeaderCell></TableRow></TableHeader>
                        <TableBody>
                            {data.map(c => <TableRow key={c.id_comunidad}><TableCell>{c.nombre}</TableCell></TableRow>)}
                        </TableBody>
                    </Table>
                </div>
            </div>
        )}

        {selectedTab === 'biblioteca' && (
            <div className={styles.gridTwo}>
                <div>
                    <MEHTypography variant="h3">Nuevo Recurso Multimedia</MEHTypography>
                    <div className={styles.form}>
                        <Input placeholder="Título" value={newRecurso.titulo} onChange={(e, d) => setNewRecurso({...newRecurso, titulo: d.value})} />
                        <Textarea placeholder="Descripción" value={newRecurso.descripcion} onChange={(e, d) => setNewRecurso({...newRecurso, descripcion: d.value})} />
                        
                        <div className={styles.gridTwo}>
                            <div>
                                <Label>Tipo</Label>
                                <Select value={newRecurso.tipo_recurso} onChange={(e) => setNewRecurso({...newRecurso, tipo_recurso: e.target.value})}>
                                    <option value="ARCHIVO">ARCHIVO</option>
                                    <option value="VIDEO">VIDEO (URL)</option>
                                    <option value="BLOG">BLOG (MARKDOWN)</option>
                                    <option value="LINK">LINK EXTERNO</option>
                                </Select>
                            </div>
                            <div>
                                <Label>Categoría</Label>
                                <Select value={newRecurso.categoria} onChange={(e) => setNewRecurso({...newRecurso, categoria: e.target.value})}>
                                    <option value="GENERAL">GENERAL</option>
                                    <option value="VIP">VIP</option>
                                    <option value="SPEAKER">SPEAKER</option>
                                </Select>
                            </div>
                        </div>

                        <Label>Vincular a Curso (Opcional)</Label>
                        <Select value={newRecurso.id_curso || ''} onChange={(e) => setNewRecurso({...newRecurso, id_curso: e.target.value ? parseInt(e.target.value) : null})}>
                            <option value="">Ninguno</option>
                            {cursosList.map(c => <option key={c.id_curso} value={c.id_curso}>{c.nombre_curso}</option>)}
                        </Select>

                        {newRecurso.tipo_recurso === 'ARCHIVO' && (
                            <div className={styles.uploadBox}>
                                <ArrowUpload24Regular /> <span>Subir Archivo</span>
                                <input type="file" onChange={(e) => handleFileUpload(e, setNewRecurso, newRecurso, 'url_descarga')} style={{ opacity: 0, position: 'absolute', inset: 0 }} />
                            </div>
                        )}

                        {newRecurso.tipo_recurso === 'VIDEO' && <Input placeholder="URL de Video (YouTube/Vimeo)" value={newRecurso.url_descarga} onChange={(e, d) => setNewRecurso({...newRecurso, url_descarga: d.value})} />}
                        {newRecurso.tipo_recurso === 'LINK' && <Input placeholder="URL Externa" value={newRecurso.url_descarga} onChange={(e, d) => setNewRecurso({...newRecurso, url_descarga: d.value})} />}
                        {newRecurso.tipo_recurso === 'BLOG' && <Textarea placeholder="Contenido Markdown" value={newRecurso.contenido_md} onChange={(e, d) => setNewRecurso({...newRecurso, contenido_md: d.value})} style={{ minHeight: '200px' }} />}

                        <MEHButton appearance="primary" onClick={async () => {
                            try {
                                await api.post('/recursos/', newRecurso);
                                notify("Éxito", "Recurso publicado", "success");
                                setNewRecurso({ titulo: '', descripcion: '', url_descarga: '', tipo_archivo: '', tipo_recurso: 'ARCHIVO', contenido_md: '', categoria: 'GENERAL', id_curso: null });
                                fetchData();
                            } catch (e) { notify("Error", "Fallo al crear", "error"); }
                        }}>Guardar Recurso</MEHButton>
                    </div>
                </div>
                <div className={styles.tableWrapper}>
                    <MEHTypography variant="h3">Repositorio</MEHTypography>
                    <Table>
                        <TableHeader><TableRow><TableHeaderCell>Título</TableHeaderCell><TableHeaderCell>Tipo</TableHeaderCell><TableHeaderCell>Acción</TableHeaderCell></TableRow></TableHeader>
                        <TableBody>
                            {data.map(r => (
                                <TableRow key={r.id_recurso}>
                                    <TableCell>{r.titulo}</TableCell>
                                    <TableCell><Badge>{r.tipo_recurso}</Badge></TableCell>
                                    <TableCell><MEHButton size="small" icon={<Delete24Regular />} onClick={async () => {
                                        if (window.confirm("¿Eliminar recurso?")) {
                                            await api.delete(`/recursos/${r.id_recurso}`);
                                            fetchData();
                                        }
                                    }}/></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        )}

        {selectedTab === 'academia' && (
            <div className={styles.gridTwo}>
                <div>
                    <MEHTypography variant="h3">Nuevo Curso</MEHTypography>
                    <div className={styles.form}>
                        <Input placeholder="Nombre del Curso" value={newCurso.nombre_curso} onChange={(e, d) => setNewCurso({...newCurso, nombre_curso: d.value})} />
                        <Textarea placeholder="Descripción Académica" value={newCurso.descripcion} onChange={(e, d) => setNewCurso({...newCurso, descripcion: d.value})} />
                        <Input type="number" label="Horas Académicas" value={newCurso.horas_academicas} onChange={(e, d) => setNewCurso({...newCurso, horas_academicas: d.value})} />
                        <div className={styles.uploadBox}>
                            <ArrowUpload24Regular /> <span>Portada del Curso</span>
                            <input type="file" onChange={(e) => handleFileUpload(e, setNewCurso, newCurso, 'imagen_url')} style={{ opacity: 0, position: 'absolute', inset: 0 }} />
                        </div>
                        <MEHButton appearance="primary" onClick={async () => {
                            try {
                                await api.post('/cursos/', newCurso);
                                notify("Éxito", "Curso creado", "success");
                                setNewCurso({ nombre_curso: '', descripcion: '', horas_academicas: 10, imagen_url: '' });
                                fetchData();
                            } catch (e) { notify("Error", "Fallo al crear", "error"); }
                        }}>Lanzar Curso</MEHButton>
                    </div>

                    <Divider style={{ margin: '20px 0' }} />
                    
                    {selectedCursoAlumnos && (
                        <div>
                            <MEHTypography variant="h3">Alumnos: {selectedCursoAlumnos.nombre}</MEHTypography>
                            <Table>
                                <TableHeader><TableRow><TableHeaderCell>Alumno</TableHeaderCell><TableHeaderCell>Nota</TableHeaderCell><TableHeaderCell>Estado</TableHeaderCell></TableRow></TableHeader>
                                <TableBody>
                                    {selectedCursoAlumnos.alumnos.map(a => (
                                        <TableRow key={a.id_inscripcion}>
                                            <TableCell>{a.nombre}</TableCell>
                                            <TableCell>
                                                <Input 
                                                    type="number" 
                                                    size="small" 
                                                    style={{ width: '60px' }} 
                                                    defaultValue={a.nota_final}
                                                    onBlur={async (e) => {
                                                        const nota = parseFloat(e.target.value);
                                                        try {
                                                            await api.put(`/cursos/instructor/nota/${a.id_inscripcion}?nota=${nota}`);
                                                            notify("Éxito", "Nota guardada", "success");
                                                        } catch (err) { notify("Error", "Fallo al calificar", "error"); }
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell><Badge color={a.nota_final >= 51 ? 'success' : 'important'}>{a.nota_final >= 51 ? 'Aprobado' : 'Reprobado'}</Badge></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <MEHButton size="small" onClick={() => setSelectedCursoAlumnos(null)}>Cerrar Listado</MEHButton>
                        </div>
                    )}
                </div>
                <div className={styles.tableWrapper}>
                    <MEHTypography variant="h3">Cursos Activos</MEHTypography>
                    <Table>
                        <TableHeader><TableRow><TableHeaderCell>Curso</TableHeaderCell><TableHeaderCell>Instructor</TableHeaderCell><TableHeaderCell>Acción</TableHeaderCell></TableRow></TableHeader>
                        <TableBody>
                            {data.map(c => (
                                <TableRow key={c.id_curso}>
                                    <TableCell>{c.nombre_curso}</TableCell>
                                    <TableCell>
                                        <Select 
                                            value={c.id_instructor || ''} 
                                            size="small"
                                            onChange={async (e) => {
                                                const id_inst = parseInt(e.target.value);
                                                await api.put(`/cursos/${c.id_curso}/instructor/${id_inst}`);
                                                notify("Éxito", "Instructor asignado", "success");
                                                fetchData();
                                            }}
                                        >
                                            <option value="">Sin asignar</option>
                                            {(selectedTab === 'academia' ? data : []).filter(u => u.rol === 'ORGANIZADOR' || u.rol === 'ADMIN').map(inst => (
                                                <option key={inst.id_usuario} value={inst.id_usuario}>{inst.nombres}</option>
                                            ))}
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <MEHButton size="small" icon={<People24Regular />} onClick={async () => {
                                            const al = await api.get(`/cursos/instructor/curso/${c.id_curso}/alumnos`);
                                            setSelectedCursoAlumnos({ id: c.id_curso, nombre: c.nombre_curso, alumnos: al.data });
                                        }}>Ver Alumnos</MEHButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        )}
      </MEHCard>
    </div>
  );
};

export default AdminPanel;

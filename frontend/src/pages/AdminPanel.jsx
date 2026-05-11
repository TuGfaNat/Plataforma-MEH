import React, { useState, useEffect } from 'react';
import { 
  makeStyles, 
  shorthands, 
  tokens, 
  TabList, 
  Tab, 
  Table, 
  TableHeader, 
  TableRow, 
  TableHeaderCell, 
  TableBody, 
  TableCell,
  Input,
  Label,
  Textarea,
  Spinner,
  Avatar,
  Badge,
  Dropdown,
  Option
} from '@fluentui/react-components';
import { 
  Settings24Regular, 
  CalendarLtr24Regular, 
  Library24Regular, 
  People24Regular,
  Save24Regular,
  Delete24Regular,
  Certificate24Regular,
  ShieldCheckmark24Regular
} from '@fluentui/react-icons';
import MainLayout from '../components/layout/MainLayout';
import { MEHCard, MEHButton, MEHTypography } from '../components/ui';
import eventoService from '../services/eventoService';
import cursoService from '../services/cursoService';
import authService from '../services/authService';
import recursoService from '../services/recursoService';
import { useAuth, useNotify } from '../App';
import { hasPermission, PERMISSION_EVENTS_MANAGE, PERMISSION_AUDIT_READ } from '../auth/rbac';

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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxWidth: '600px',
    marginTop: '20px',
  }
});

const AdminPanel = () => {
  const styles = useStyles();
  const { user } = useAuth();
  const { notify } = useNotify();
  
  const canManageContent = hasPermission(user?.rol, PERMISSION_EVENTS_MANAGE);
  const canChangeRoles = hasPermission(user?.rol, PERMISSION_AUDIT_READ);
  
  const [selectedTab, setSelectedTab] = useState(canManageContent ? 'eventos' : 'usuarios');
  const [users, setUsers] = useState([]);
  const [recursos, setRecursos] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newEvento, setNewEvento] = useState({ titulo: '', descripcion: '', fecha_inicio: '', modalidad: 'VIRTUAL', capacidad_max: 50, imagen_url: '', plantilla_certificado_url: '' });
  const [newCurso, setNewCurso] = useState({ nombre_curso: '', descripcion: '', horas_academicas: 10, imagen_url: '', plantilla_certificado_url: '' });
  const [newRecurso, setNewRecurso] = useState({ titulo: '', descripcion: '', url_descarga: '', tipo_archivo: 'PDF', categoria: 'VIP' });

  useEffect(() => {
    if (selectedTab === 'usuarios') fetchUsers();
    if (selectedTab === 'biblioteca') fetchRecursos();
  }, [selectedTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await authService.getAllUsers();
      setUsers(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchRecursos = async () => {
    setLoading(true);
    try {
      const data = await recursoService.getRecursos();
      setRecursos(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleUpdateRole = async (idUsuario, nuevoRol) => {
    try {
      await authService.updateUserRole(idUsuario, nuevoRol);
      notify("Éxito", "El rol del usuario ha sido actualizado", "success");
      fetchUsers();
    } catch (err) { notify("Error", "No se pudo actualizar el rol", "error"); }
  };

  const handleCreateEvento = async () => {
    try {
      await eventoService.createEvento(newEvento);
      notify("Evento Creado", `Se ha publicado "${newEvento.titulo}" correctamente`, "success");
      setNewEvento({ titulo: '', descripcion: '', fecha_inicio: '', modalidad: 'VIRTUAL', capacidad_max: 50, imagen_url: '', plantilla_certificado_url: '' });
    } catch (err) { notify("Error", "Error al crear el evento", "error"); }
  };

  const handleCreateCurso = async () => {
    try {
      await cursoService.createCurso(newCurso);
      notify("Curso Creado", `El curso "${newCurso.nombre_curso}" está activo`, "success");
      setNewCurso({ nombre_curso: '', descripcion: '', horas_academicas: 10, imagen_url: '', plantilla_certificado_url: '' });
    } catch (err) { notify("Error", "Error al registrar el curso", "error"); }
  };

  return (
    <MainLayout>
      <div className={styles.container}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Settings24Regular style={{ color: tokens.colorBrandForeground1, fontSize: '32px' }} />
          <MEHTypography variant="h1">
            {canChangeRoles ? 'Panel Maestro' : canManageContent ? 'Panel de Administración' : 'Panel de Soporte'}
          </MEHTypography>
        </div>

        <TabList selectedValue={selectedTab} onTabSelect={(e, d) => setSelectedTab(d.value)}>
          {canManageContent && <Tab value="eventos" icon={<CalendarLtr24Regular />}>Eventos</Tab>}
          {canManageContent && <Tab value="cursos" icon={<Library24Regular />}>Cursos</Tab>}
          {canManageContent && <Tab value="biblioteca" icon={<Library24Regular />}>Biblioteca</Tab>}
          <Tab value="usuarios" icon={<People24Regular />}>Usuarios</Tab>
        </TabList>

        <MEHCard>
          {canManageContent && selectedTab === 'eventos' && (
            <div className={styles.form}>
              <MEHTypography variant="h3">Nuevo Evento</MEHTypography>
              <Input placeholder="Título" value={newEvento.titulo} onChange={(e, d) => setNewEvento({...newEvento, titulo: d.value})} />
              <Textarea placeholder="Descripción" value={newEvento.descripcion} onChange={(e, d) => setNewEvento({...newEvento, descripcion: d.value})} />
              <Input type="datetime-local" value={newEvento.fecha_inicio} onChange={(e, d) => setNewEvento({...newEvento, fecha_inicio: d.value})} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <Input placeholder="URL Banner" style={{ flexGrow: 1 }} value={newEvento.imagen_url} onChange={(e, d) => setNewEvento({...newEvento, imagen_url: d.value})} />
                <Input placeholder="URL Plantilla Certificado" style={{ flexGrow: 1 }} contentBefore={<Certificate24Regular />} value={newEvento.plantilla_certificado_url} onChange={(e, d) => setNewEvento({...newEvento, plantilla_certificado_url: d.value})} />
              </div>
              <MEHButton appearance="primary" icon={<Save24Regular />} onClick={handleCreateEvento}>Publicar Evento</MEHButton>
            </div>
          )}

          {canManageContent && selectedTab === 'biblioteca' && (
             <div className={styles.form}>
                <MEHTypography variant="h3">Añadir Material</MEHTypography>
                <Input placeholder="Título" value={newRecurso.titulo} onChange={(e, d) => setNewRecurso({...newRecurso, titulo: d.value})} />
                <Input placeholder="URL Descarga" value={newRecurso.url_descarga} onChange={(e, d) => setNewRecurso({...newRecurso, url_descarga: d.value})} />
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Dropdown placeholder="Categoría" onOptionSelect={(e, d) => setNewRecurso({...newRecurso, categoria: d.optionValue})}>
                        <Option value="VIP">VIP</Option>
                        <Option value="SPEAKER">SPEAKER</Option>
                    </Dropdown>
                    <Dropdown placeholder="Tipo" onOptionSelect={(e, d) => setNewRecurso({...newRecurso, tipo_archivo: d.optionValue})}>
                        <Option value="PDF">PDF</Option>
                        <Option value="ZIP">ZIP</Option>
                    </Dropdown>
                </div>
                <MEHButton appearance="primary" onClick={() => {
                    recursoService.createRecurso(newRecurso).then(() => {
                        notify("Éxito", "Recurso añadido", "success");
                        fetchRecursos();
                    });
                }}>Guardar</MEHButton>
             </div>
          )}

          {selectedTab === 'cursos' && canManageContent && (
            <div className={styles.form}>
              <MEHTypography variant="h3">Nuevo Curso</MEHTypography>
              <Input placeholder="Nombre del Curso" value={newCurso.nombre_curso} onChange={(e, d) => setNewCurso({...newCurso, nombre_curso: d.value})} />
              <Textarea placeholder="Descripción" value={newCurso.descripcion} onChange={(e, d) => setNewCurso({...newCurso, descripcion: d.value})} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <Input placeholder="URL Imagen" style={{ flexGrow: 1 }} value={newCurso.imagen_url} onChange={(e, d) => setNewCurso({...newCurso, imagen_url: d.value})} />
                <Input placeholder="URL Plantilla Certificado" style={{ flexGrow: 1 }} contentBefore={<Certificate24Regular />} value={newCurso.plantilla_certificado_url} onChange={(e, d) => setNewCurso({...newCurso, plantilla_certificado_url: d.value})} />
              </div>
              <MEHButton appearance="primary" icon={<Save24Regular />} onClick={handleCreateCurso}>Registrar Curso</MEHButton>
            </div>
          )}

          {selectedTab === 'usuarios' && (
            <div>
              <MEHTypography variant="h3" style={{marginBottom: '20px', display: 'block'}}>Directorio del Portal</MEHTypography>
              {loading ? <Spinner /> : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>Miembro</TableHeaderCell>
                      <TableHeaderCell>Rol</TableHeaderCell>
                      <TableHeaderCell>Registro</TableHeaderCell>
                      {canChangeRoles && <TableHeaderCell>Gestión</TableHeaderCell>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(u => (
                      <TableRow key={u.id_usuario}>
                        <TableCell>
                          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <Avatar name={`${u.nombres} ${u.apellidos}`} src={u.foto_url} size={24} />
                            <div>
                                <MEHTypography variant="caption" style={{ fontWeight: 'bold', display: 'block' }}>{u.alias || u.nombres}</MEHTypography>
                                <MEHTypography variant="caption" style={{ opacity: 0.6 }}>{u.correo}</MEHTypography>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><Badge appearance="tint">{u.rol}</Badge></TableCell>
                        <TableCell>
                            <MEHTypography variant="caption" style={{ opacity: 0.5 }}>
                                {u.fecha_registro ? new Date(u.fecha_registro).toLocaleDateString() : 'Sistema'}
                            </MEHTypography>
                        </TableCell>
                        {canChangeRoles && (
                            <TableCell>
                                <Dropdown placeholder="Nuevo Rol" size="small" onOptionSelect={(e, d) => handleUpdateRole(u.id_usuario, d.optionValue)}>
                                    <Option value="MIEMBRO">MIEMBRO</Option>
                                    <Option value="EMBAJADOR">EMBAJADOR</Option>
                                    <Option value="MODERADOR">MODERADOR</Option>
                                    <Option value="SOPORTE">SOPORTE</Option>
                                    <Option value="ORGANIZADOR">ORGANIZADOR</Option>
                                    <Option value="ADMIN">ADMIN</Option>
                                </Dropdown>
                            </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </MEHCard>
      </div>
    </MainLayout>
  );
};

export default AdminPanel;

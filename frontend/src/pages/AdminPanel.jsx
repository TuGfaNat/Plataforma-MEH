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
  Avatar
} from '@fluentui/react-components';
import { 
  Settings24Regular, 
  CalendarLtr24Regular, 
  Library24Regular, 
  People24Regular,
  Save24Regular
} from '@fluentui/react-icons';
import MainLayout from '../components/layout/MainLayout';
import { MEHCard, MEHButton, MEHTypography } from '../components/ui';
import eventoService from '../services/eventoService';
import cursoService from '../services/cursoService';
import authService from '../services/authService';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
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
  const [selectedTab, setSelectedTab] = useState('eventos');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados para formularios
  const [newEvento, setNewEvento] = useState({ titulo: '', descripcion: '', fecha_inicio: '', modalidad: 'VIRTUAL', capacidad_max: 50 });
  const [newCurso, setNewCurso] = useState({ nombre_curso: '', descripcion: '', horas_academicas: 10 });

  useEffect(() => {
    if (selectedTab === 'usuarios') {
      fetchUsers();
    }
  }, [selectedTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await authService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvento = async () => {
    try {
      await eventoService.createEvento(newEvento);
      alert("Evento creado con éxito");
      setNewEvento({ titulo: '', descripcion: '', fecha_inicio: '', modalidad: 'VIRTUAL', capacidad_max: 50 });
    } catch (err) {
      alert("Error al crear evento");
    }
  };

  const handleCreateCurso = async () => {
    try {
      await cursoService.createCurso(newCurso);
      alert("Curso creado con éxito");
      setNewCurso({ nombre_curso: '', descripcion: '', horas_academicas: 10 });
    } catch (err) {
      alert("Error al crear curso");
    }
  };

  return (
    <MainLayout>
      <div className={styles.container}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Settings24Regular style={{ color: tokens.colorBrandForeground1, fontSize: '32px' }} />
          <MEHTypography variant="h1">Panel de Administración</MEHTypography>
        </div>

        <TabList selectedValue={selectedTab} onTabSelect={(e, data) => setSelectedTab(data.value)}>
          <Tab value="eventos" icon={<CalendarLtr24Regular />}>Crear Evento</Tab>
          <Tab value="cursos" icon={<Library24Regular />}>Crear Curso</Tab>
          <Tab value="usuarios" icon={<People24Regular />}>Gestión Usuarios</Tab>
        </TabList>

        <MEHCard>
          {selectedTab === 'eventos' && (
            <div className={styles.form}>
              <MEHTypography variant="h3">Nuevo Evento</MEHTypography>
              <div>
                <Label>Título del Evento</Label>
                <Input value={newEvento.titulo} onChange={(e, d) => setNewEvento({...newEvento, titulo: d.value})} style={{width: '100%'}} />
              </div>
              <div>
                <Label>Descripción</Label>
                <Textarea value={newEvento.descripcion} onChange={(e, d) => setNewEvento({...newEvento, descripcion: d.value})} style={{width: '100%'}} />
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                <div>
                  <Label>Fecha y Hora</Label>
                  <Input type="datetime-local" value={newEvento.fecha_inicio} onChange={(e, d) => setNewEvento({...newEvento, fecha_inicio: d.value})} style={{width: '100%'}} />
                </div>
                <div>
                  <Label>Capacidad Máxima</Label>
                  <Input type="number" value={newEvento.capacidad_max} onChange={(e, d) => setNewEvento({...newEvento, capacidad_max: d.value})} style={{width: '100%'}} />
                </div>
              </div>
              <MEHButton appearance="primary" icon={<Save24Regular />} onClick={handleCreateEvento}>Publicar Evento</MEHButton>
            </div>
          )}

          {selectedTab === 'cursos' && (
            <div className={styles.form}>
              <MEHTypography variant="h3">Nuevo Curso / Workshop</MEHTypography>
              <div>
                <Label>Nombre del Curso</Label>
                <Input value={newCurso.nombre_curso} onChange={(e, d) => setNewCurso({...newCurso, nombre_curso: d.value})} style={{width: '100%'}} />
              </div>
              <div>
                <Label>Descripción Corta</Label>
                <Textarea value={newCurso.descripcion} onChange={(e, d) => setNewCurso({...newCurso, descripcion: d.value})} style={{width: '100%'}} />
              </div>
              <div>
                <Label>Horas Académicas</Label>
                <Input type="number" value={newCurso.horas_academicas} onChange={(e, d) => setNewCurso({...newCurso, horas_academicas: d.value})} style={{width: '100%'}} />
              </div>
              <MEHButton appearance="primary" icon={<Save24Regular />} onClick={handleCreateCurso}>Registrar Curso</MEHButton>
            </div>
          )}

          {selectedTab === 'usuarios' && (
            <div>
              <MEHTypography variant="h3" style={{marginBottom: '20px', display: 'block'}}>Directorio de Miembros del Portal</MEHTypography>
              {loading ? <Spinner /> : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>Usuario</TableHeaderCell>
                      <TableHeaderCell>Correo</TableHeaderCell>
                      <TableHeaderCell>Rol</TableHeaderCell>
                      <TableHeaderCell>Registro</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(u => (
                      <TableRow key={u.id_usuario}>
                        <TableCell>
                          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <Avatar name={`${u.nombres} ${u.apellidos}`} size={24} />
                            {u.nombres} {u.apellidos}
                          </div>
                        </TableCell>
                        <TableCell>{u.correo}</TableCell>
                        <TableCell><Badge appearance="tint" color={u.rol === 'ADMIN' ? 'danger' : 'brand'}>{u.rol}</Badge></TableCell>
                        <TableCell>{new Date(u.fecha_registro).toLocaleDateString()}</TableCell>
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

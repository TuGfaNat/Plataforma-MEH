import React, { useState, useEffect } from 'react';
import { 
  makeStyles, 
  shorthands, 
  tokens, 
  Input, 
  Spinner,
  Badge,
  Button
} from '@fluentui/react-components';
import { 
  People24Filled, 
  Search24Regular, 
  Filter24Regular,
  Mail24Regular,
  MoreHorizontal24Regular
} from '@fluentui/react-icons';
import { 
  DataGrid, 
  DataGridHeader, 
  DataGridHeaderCell, 
  DataGridBody, 
  DataGridRow, 
  DataGridCell,
  createTableColumn
} from '@fluentui/react-components';
import { useSearchParams } from 'react-router-dom';
import { MEHCard, MEHTypography } from '../components/ui';
import authService from '../services/authService';

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
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px'
  },
  searchBar: {
    display: 'flex',
    gap: '12px',
    width: '100%',
    maxWidth: '500px',
  },
  tableCard: {
    ...shorthands.padding('0'),
    overflow: 'hidden',
  },
  roleBadge: {
    textTransform: 'capitalize',
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
    '-webkit-overflow-scrolling': 'touch',
    ...shorthands.borderRadius('12px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3),
  }
});

const ROLES = ['Todos', 'MIEMBRO', 'EMBAJADOR', 'ADMIN', 'MODERADOR', 'ORGANIZADOR'];

const Users = () => {
  const styles = useStyles();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || 'Todos');

  useEffect(() => {
    fetchUsers(searchTerm, selectedRole);
  }, []);

  const fetchUsers = async (searchStr = '', roleStr = 'Todos') => {
    setLoading(true);
    try {
      const roleFilter = roleStr === 'Todos' ? '' : roleStr;
      const data = await authService.getAllUsers();
      
      // Filtrado manual (simulado ya que el backend trae todos)
      let filtered = data;
      if (searchStr) {
        filtered = filtered.filter(u => 
          u.nombres.toLowerCase().includes(searchStr.toLowerCase()) || 
          u.apellidos.toLowerCase().includes(searchStr.toLowerCase()) ||
          u.correo.toLowerCase().includes(searchStr.toLowerCase())
        );
      }
      if (roleFilter) {
        filtered = filtered.filter(u => u.rol === roleFilter);
      }
      
      setUsers(filtered);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    setSearchParams({ search: val, role: selectedRole });
    fetchUsers(val, selectedRole);
  };

  const handleRoleFilter = (role) => {
    setSelectedRole(role);
    setSearchParams({ search: searchTerm, role });
    fetchUsers(searchTerm, role);
  };

  const columns = [
    createTableColumn({
      columnId: 'usuario',
      renderHeaderCell: () => 'Nombre Completo',
      renderCell: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 0' }}>
          <MEHTypography variant="body" style={{ fontWeight: 'bold' }}>{item.nombres} {item.apellidos}</MEHTypography>
        </div>
      ),
    }),
    createTableColumn({
      columnId: 'email',
      renderHeaderCell: () => 'Correo Electrónico',
      renderCell: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mail24Regular style={{ opacity: 0.5 }} />
          <span>{item.correo}</span>
        </div>
      ),
    }),
    createTableColumn({
      columnId: 'rol',
      renderHeaderCell: () => 'Rol del Sistema',
      renderCell: (item) => (
        <Badge appearance="outline" className={styles.roleBadge} color={item.rol === 'ADMIN' ? 'danger' : item.rol === 'EMBAJADOR' ? 'success' : 'informative'}>
          {item.rol}
        </Badge>
      ),
    }),
    createTableColumn({
      columnId: 'acciones',
      renderHeaderCell: () => '',
      renderCell: (item) => (
        <Button icon={<MoreHorizontal24Regular />} appearance="subtle" />
      ),
    }),
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <People24Filled style={{ color: tokens.colorBrandForeground1, fontSize: '32px' }} />
            <MEHTypography variant="h1">Directorio de Miembros</MEHTypography>
          </div>
          <MEHTypography variant="body" style={{ opacity: 0.6 }}>
            Gestiona y visualiza a todos los integrantes de la plataforma.
          </MEHTypography>
        </div>
      </div>

      <MEHCard style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div className={styles.searchBar}>
            <Input 
              contentBefore={<Search24Regular />} 
              placeholder="Buscar por nombre o correo..." 
              style={{ flexGrow: 1 }}
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {ROLES.map(role => (
              <Button 
                key={role} 
                size="small"
                appearance={selectedRole === role ? 'primary' : 'outline'}
                onClick={() => handleRoleFilter(role)}
              >
                {role}
              </Button>
            ))}
          </div>
        </div>

        {selectedRole !== 'Todos' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <Filter24Regular style={{ opacity: 0.5 }} />
                 <MEHTypography variant="caption">Filtrando por: <b>{selectedRole}</b></MEHTypography>
                 <Button appearance="subtle" size="small" onClick={() => handleRoleFilter('Todos')}>Limpiar</Button>
            </div>
        )}
      </MEHCard>

      <MEHCard className={styles.tableCard}>
        {loading ? (
          <div style={{ padding: '80px', textAlign: 'center' }}>
            <Spinner label="Sincronizando directorio..." />
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <DataGrid
              items={users}
              columns={columns}
              selectionMode="multiselect"
              getRowId={(item) => item.id_usuario}
            >
              <DataGridHeader>
                <DataGridRow>
                  {({ renderHeaderCell }) => (
                    <DataGridHeaderCell style={{ color: tokens.colorBrandForeground1, fontWeight: 'bold' }}>
                      {renderHeaderCell()}
                    </DataGridHeaderCell>
                  )}
                </DataGridRow>
              </DataGridHeader>
              <DataGridBody>
                {({ item, rowId }) => (
                  <DataGridRow key={rowId}>
                    {({ renderCell }) => (
                      <DataGridCell>{renderCell(item)}</DataGridCell>
                    )}
                  </DataGridRow>
                )}
              </DataGridBody>
            </DataGrid>
          </div>
        )}
      </MEHCard>
    </div>
  );
};

export default Users;

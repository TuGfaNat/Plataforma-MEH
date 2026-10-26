import React, { useState, useEffect } from 'react';
import { 
  makeStyles, 
  shorthands, 
  tokens, 
  Input, 
  Spinner,
  Badge,
  Button,
  Avatar,
  Tooltip
} from '@fluentui/react-components';
import { 
  People24Filled, 
  Search24Regular, 
  Filter24Regular,
  Mail24Regular,
  CheckmarkCircle24Regular,
  Cart24Regular,
  HatGraduation24Regular,
  Trophy24Regular,
  ArrowUp24Regular,
  ArrowDown24Regular,
  ArrowSort24Regular,
  Eye24Regular
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
import UserProfileModal from '../components/UserProfileModal';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    animationName: {
      from: { opacity: 0, transform: 'translateY(10px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    animationDuration: '0.4s',
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
  },
  sortableHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    userSelect: 'none',
    ':hover': {
      color: tokens.colorBrandForeground1,
    }
  },
  metricPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: '600',
  },
  levelBadge: {
    fontWeight: '700',
    letterSpacing: '0.5px',
  }
});

const ROLES = ['Todos', 'MIEMBRO', 'EMBAJADOR', 'ADMIN', 'MODERADOR', 'ORGANIZADOR'];

const LEVEL_COLORS = {
  Beginner: 'informative',
  Novato: 'informative',
  Explorer: 'warning',
  Legend: 'success',
  Master: 'danger',
  Champion: 'important',
};

const Users = () => {
  const styles = useStyles();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || 'Todos');
  const [sortBy, setSortBy] = useState('nombres');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers(searchTerm, selectedRole, sortBy, sortOrder);
  }, []);

  const fetchUsers = async (searchStr = '', roleStr = 'Todos', sortCol = 'nombres', sortDir = 'asc') => {
    setLoading(true);
    try {
      const data = await authService.getDirectorio({
        search: searchStr,
        rol: roleStr === 'Todos' ? '' : roleStr,
        sort_by: sortCol,
        sort_order: sortDir,
        limit: 500
      });
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Fallback to getAllUsers:", err);
      try {
        const fallback = await authService.getAllUsers(searchStr, roleStr === 'Todos' ? '' : roleStr);
        setUsers(Array.isArray(fallback) ? fallback : []);
      } catch (e) {
        console.error("Error fetching users:", e);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    setSearchParams({ search: val, role: selectedRole });
    fetchUsers(val, selectedRole, sortBy, sortOrder);
  };

  const handleRoleFilter = (role) => {
    setSelectedRole(role);
    setSearchParams({ search: searchTerm, role });
    fetchUsers(searchTerm, role, sortBy, sortOrder);
  };

  const handleSort = (columnId) => {
    let newOrder = 'asc';
    if (sortBy === columnId) {
      newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    }
    setSortBy(columnId);
    setSortOrder(newOrder);
    fetchUsers(searchTerm, selectedRole, columnId, newOrder);
  };

  const renderSortIcon = (columnId) => {
    if (sortBy !== columnId) {
      return <ArrowSort24Regular style={{ opacity: 0.25, fontSize: '14px' }} />;
    }
    return sortOrder === 'asc' ? 
      <ArrowUp24Regular style={{ color: tokens.colorBrandForeground1, fontSize: '14px' }} /> : 
      <ArrowDown24Regular style={{ color: tokens.colorBrandForeground1, fontSize: '14px' }} />;
  };

  const openProfile = (user) => {
    if (user && user.id_usuario) {
      setSelectedUserId(user.id_usuario);
      setIsProfileModalOpen(true);
    }
  };

  const columns = [
    createTableColumn({
      columnId: 'nombres',
      renderHeaderCell: () => (
        <div className={styles.sortableHeader} onClick={() => handleSort('nombres')}>
          <span>Miembro</span>
          {renderSortIcon('nombres')}
        </div>
      ),
      renderCell: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0' }}>
          <Avatar 
            name={`${item.nombres || ''} ${item.apellidos || ''}`} 
            image={item.foto_url ? { src: item.foto_url } : undefined}
            size={36}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <MEHTypography variant="body" style={{ fontWeight: 'bold' }}>
              {item.nombres} {item.apellidos}
            </MEHTypography>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.65, fontSize: '12px' }}>
              <Mail24Regular style={{ fontSize: '12px' }} />
              <span>{item.correo}</span>
            </div>
          </div>
        </div>
      ),
    }),
    createTableColumn({
      columnId: 'rol',
      renderHeaderCell: () => (
        <div className={styles.sortableHeader} onClick={() => handleSort('rol')}>
          <span>Rol</span>
          {renderSortIcon('rol')}
        </div>
      ),
      renderCell: (item) => (
        <Badge 
          appearance="outline" 
          className={styles.roleBadge} 
          color={item.rol === 'ADMIN' ? 'danger' : item.rol === 'ORGANIZADOR' ? 'important' : item.rol === 'EMBAJADOR' ? 'success' : 'informative'}
        >
          {item.rol}
        </Badge>
      ),
    }),
    createTableColumn({
      columnId: 'nivel',
      renderHeaderCell: () => (
        <div className={styles.sortableHeader} onClick={() => handleSort('nivel')}>
          <span>Nivel</span>
          {renderSortIcon('nivel')}
        </div>
      ),
      renderCell: (item) => {
        const lvl = item.nivel || 'Beginner';
        return (
          <Badge 
            appearance="filled" 
            className={styles.levelBadge}
            color={LEVEL_COLORS[lvl] || 'informative'}
          >
            {lvl}
          </Badge>
        );
      },
    }),
    createTableColumn({
      columnId: 'asistencias',
      renderHeaderCell: () => (
        <div className={styles.sortableHeader} onClick={() => handleSort('asistencias')}>
          <span>Asistencias</span>
          {renderSortIcon('asistencias')}
        </div>
      ),
      renderCell: (item) => (
        <div className={styles.metricPill}>
          <CheckmarkCircle24Regular style={{ color: '#107c10' }} />
          <span>{item.asistencias || 0}</span>
        </div>
      ),
    }),
    createTableColumn({
      columnId: 'compras',
      renderHeaderCell: () => (
        <div className={styles.sortableHeader} onClick={() => handleSort('compras')}>
          <span>Compras</span>
          {renderSortIcon('compras')}
        </div>
      ),
      renderCell: (item) => (
        <div className={styles.metricPill}>
          <Cart24Regular style={{ color: '#d83b01' }} />
          <span>{item.compras || 0}</span>
        </div>
      ),
    }),
    createTableColumn({
      columnId: 'cursos',
      renderHeaderCell: () => (
        <div className={styles.sortableHeader} onClick={() => handleSort('cursos')}>
          <span>Cursos</span>
          {renderSortIcon('cursos')}
        </div>
      ),
      renderCell: (item) => (
        <div className={styles.metricPill}>
          <HatGraduation24Regular style={{ color: '#7f13ec' }} />
          <span>{item.cursos || 0}</span>
        </div>
      ),
    }),
    createTableColumn({
      columnId: 'badges',
      renderHeaderCell: () => 'Badges',
      renderCell: (item) => {
        const badgeList = item.badges || [];
        const count = badgeList.length;
        return (
          <Tooltip content={badgeList.map(b => b.nombre_badge).join(', ') || 'Sin insignias'} relationship="label">
            <div className={styles.metricPill} style={{ cursor: 'pointer' }}>
              <Trophy24Regular style={{ color: '#ffb900' }} />
              <span>{count}</span>
            </div>
          </Tooltip>
        );
      },
    }),
    createTableColumn({
      columnId: 'acciones',
      renderHeaderCell: () => '',
      renderCell: (item) => (
        <Button 
          icon={<Eye24Regular />} 
          appearance="subtle" 
          onClick={() => openProfile(item)}
          title="Ver perfil"
        />
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
            Directorio con métricas en tiempo real: nivel, asistencias, compras, cursos e insignias.
          </MEHTypography>
        </div>
      </div>

      <MEHCard style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div className={styles.searchBar}>
            <Input 
              contentBefore={<Search24Regular />} 
              placeholder="Buscar por nombre, correo o alias..." 
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
            <Spinner label="Sincronizando directorio de miembros..." />
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <DataGrid
              style={{ minWidth: '750px' }}
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

      {isProfileModalOpen && (
        <UserProfileModal 
          isOpen={isProfileModalOpen}
          onOpenChange={(open) => setIsProfileModalOpen(open)}
          userId={selectedUserId}
        />
      )}
    </div>
  );
};

export default Users;

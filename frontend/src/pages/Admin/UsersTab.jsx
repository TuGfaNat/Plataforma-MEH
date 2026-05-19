import React from 'react';
import { 
  Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell,
  Input, Spinner, Avatar, Badge, Select, tokens, makeStyles, shorthands
} from '@fluentui/react-components';
import { Search24Regular, ArrowDownload24Regular, Info24Regular, PersonDelete24Regular } from '@fluentui/react-icons';
import { MEHButton, MEHTypography } from '../../components/ui';
import authService from '../../services/authService';
import { resolveApiFileUrl } from '../../services/api';

const useStyles = makeStyles({
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
  tableContainer: { 
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
  }
});

const UsersTab = ({ loading, data, searchTerm, setSearchBox, handleExportCSV, currentUser, confirmDelete, fetchData }) => {
  const styles = useStyles();
  const filteredUsers = data.filter(u => 
    `${u.nombres} ${u.apellidos} ${u.correo} ${u.alias}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className={styles.infoPanel}>
        <Info24Regular style={{ fontSize: '36px', color: tokens.colorBrandForeground1 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <MEHTypography variant="h3" style={{ color: tokens.colorBrandForeground1, fontWeight: 'bold' }}>Panel de Miembros</MEHTypography>
          <MEHTypography variant="body" style={{ opacity: 0.9 }}>Control de identidades, roles y auditoría de la comunidad.</MEHTypography>
        </div>
      </div>

      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
        <Input 
          placeholder="Buscar..." 
          contentBefore={<Search24Regular />} 
          value={searchTerm} 
          onChange={(e, d) => setSearchBox(d.value)} 
          style={{ width: '420px', height: '45px' }} 
        />
        <MEHButton size="small" icon={<ArrowDownload24Regular />} appearance="primary" onClick={handleExportCSV}>
          Exportar Excel
        </MEHButton>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div style={{padding: '60px', textAlign: 'center'}}><Spinner label="Cargando..." /></div>
        ) : (
          <Table size="extra-small">
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Miembro</TableHeaderCell>
                <TableHeaderCell>Union</TableHeaderCell>
                <TableHeaderCell>Inversión</TableHeaderCell>
                <TableHeaderCell>Rol</TableHeaderCell>
                <TableHeaderCell>Acción</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(u => (
                <TableRow key={`u-${u.id_usuario}`} className={styles.userRow}>
                  <TableCell>
                    <div className={styles.avatarStack}>
                      <Avatar size={48} name={u.nombres} image={{src: resolveApiFileUrl(u.foto_url)}} />
                      <div><b>{u.nombres} {u.apellidos}</b><br/><Badge appearance="outline">@{u.alias}</Badge></div>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(u.fecha_registro).toLocaleDateString()}</TableCell>
                  <TableCell>Bs. {u.total_invertido || 0}</TableCell>
                  <TableCell>
                    <Select 
                      value={u.rol} 
                      size="small" 
                      onChange={(e) => authService.updateUserRole(u.id_usuario, e.target.value).then(() => fetchData())}
                    >
                      <option value="ADMIN">ADMINISTRADOR</option>
                      <option value="ORGANIZADOR">ORGANIZADOR</option>
                      <option value="MIEMBRO">MIEMBRO</option>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {u.id_usuario !== currentUser?.id_usuario ? (
                      <MEHButton size="small" icon={<PersonDelete24Regular />} onClick={() => confirmDelete('user', u.id_usuario, u.nombres)} />
                    ) : (
                      <Badge>Tú</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default UsersTab;

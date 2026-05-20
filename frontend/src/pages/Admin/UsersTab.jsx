import React from 'react';
import { 
  Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell,
  Input, Spinner, Avatar, Badge, Select, tokens, makeStyles, shorthands
} from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { Search24Regular, ArrowDownload24Regular, Info24Regular, PersonDelete24Regular } from '@fluentui/react-icons';
import { MEHButton, MEHTypography } from '../../components/ui';
import authService from '../../services/authService';
import { resolveApiFileUrl } from '../../services/api';

const useStyles = makeStyles({
// ... (rest of styles same)
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
  const { t } = useTranslation();
  const filteredUsers = data.filter(u => 
    `${u.nombres} ${u.apellidos} ${u.correo} ${u.alias}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className={styles.infoPanel}>
        <Info24Regular style={{ fontSize: '36px', color: tokens.colorBrandForeground1 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <MEHTypography variant="h3" style={{ color: tokens.colorBrandForeground1, fontWeight: 'bold' }}>{t("admin_members_panel")}</MEHTypography>
          <MEHTypography variant="body" style={{ opacity: 0.9 }}>{t("admin_members_panel_desc")}</MEHTypography>
        </div>
      </div>

      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
        <Input 
          placeholder={t("search_placeholder")} 
          contentBefore={<Search24Regular />} 
          value={searchTerm} 
          onChange={(e, d) => setSearchBox(d.value)} 
          style={{ width: '420px', height: '45px' }} 
        />
        <MEHButton size="small" icon={<ArrowDownload24Regular />} appearance="primary" onClick={handleExportCSV}>
          {t("admin_export_excel")}
        </MEHButton>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div style={{padding: '60px', textAlign: 'center'}}><Spinner label={t("loading")} /></div>
        ) : (
          <Table size="extra-small">
            <TableHeader>
              <TableRow>
                <TableHeaderCell>{t("admin_member_col")}</TableHeaderCell>
                <TableHeaderCell>{t("admin_join_col")}</TableHeaderCell>
                <TableHeaderCell>{t("admin_investment_col")}</TableHeaderCell>
                <TableHeaderCell>{t("admin_role_col")}</TableHeaderCell>
                <TableHeaderCell>{t("admin_action_col")}</TableHeaderCell>
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
                      <option value="ADMIN">{t("role_admin_caps")}</option>
                      <option value="ORGANIZADOR">{t("role_organizer_caps")}</option>
                      <option value="MIEMBRO">{t("role_member_caps")}</option>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {u.id_usuario !== currentUser?.id_usuario ? (
                      <MEHButton size="small" icon={<PersonDelete24Regular />} onClick={() => confirmDelete('user', u.id_usuario, u.nombres)} />
                    ) : (
                      <Badge>{t("admin_you")}</Badge>
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

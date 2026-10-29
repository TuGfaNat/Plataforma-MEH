import React, { useState } from 'react';
import { 
  Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell,
  Input, Spinner, Avatar, Badge, Select, tokens, makeStyles, shorthands,
  Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions,
  Field, Textarea, Tooltip
} from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { 
  Search24Regular, 
  ArrowDownload24Regular, 
  Info24Regular, 
  Edit24Regular, 
  Key24Regular, 
  DismissCircle24Regular, 
  CheckmarkCircle24Regular,
  CheckmarkCircle24Filled,
  Warning24Filled,
  ShieldCheckmark24Regular,
  PersonProhibited24Regular,
  PersonAdd24Regular,
  Eye24Regular,
  ArrowSync24Regular
} from '@fluentui/react-icons';
import CreateUserModal from '../../components/CreateUserModal';
import UserExpedienteModal from '../../components/UserExpedienteModal';
import { MEHButton, MEHTypography, MEHInput } from '../../components/ui';
import authService from '../../services/authService';
import { resolveApiFileUrl } from '../../services/api';
import { matchesSmartSearch } from '../../utils/smartSearch';
import { useNotify } from '../../App';

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
    overflowX: 'auto', 
    ...shorthands.borderRadius('24px'), 
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3), 
    backgroundColor: tokens.colorNeutralBackground1, 
    boxShadow: tokens.shadow8,
    '@media (max-width: 768px)': {
      display: 'none',
    }
  },
  mobileCardsContainer: {
    display: 'none',
    '@media (max-width: 768px)': {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      width: '100%',
      boxSizing: 'border-box',
    }
  },
  mobileUserCard: {
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius('16px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3),
    padding: '16px',
    boxShadow: tokens.shadow4,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    boxSizing: 'border-box',
    width: '100%',
    transition: 'all 0.2s ease',
  },
  userRow: { 
    minHeight: '85px', 
    transition: 'all 0.2s ease', 
    ':hover': { backgroundColor: tokens.colorNeutralBackground2 } 
  },
  avatarStack: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    paddingLeft: '4px',
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden'
  },
  actionButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginTop: '12px'
  },
  rowTwo: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    '@media (max-width: 500px)': {
      gridTemplateColumns: '1fr'
    }
  }
});

const UsersTab = ({ loading, data, searchTerm, setSearchBox, handleExportCSV, currentUser, fetchData }) => {
  const styles = useStyles();
  const { t } = useTranslation();
  const { notify } = useNotify();

  // Estados para modal de edición
  const [editModal, setEditModal] = useState({ open: false, user: null, loading: false });
  const [editForm, setEditForm] = useState({
    nombres: '', apellidos: '', correo: '', alias: '', rol: 'MIEMBRO', institucion: '', bio: '', email_verificado: true
  });

  // Estados para modal de reset password
  const [passwordModal, setPasswordModal] = useState({ open: false, user: null, password: '', loading: false });

  // Estados para modal de suspensión
  const [suspendModal, setSuspendModal] = useState({ open: false, user: null, motivo: '', loading: false });
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [purging, setPurging] = useState(false);
  const [expedienteModal, setExpedienteModal] = useState({ open: false, userId: null, user: null });

  const handlePurgeSeeds = async () => {
    if (!window.confirm("¿Deseas purgar y eliminar definitivamente de la base de datos todas las cuentas semilla y de prueba?")) {
      return;
    }
    setPurging(true);
    try {
      const res = await authService.purgeSeedData();
      notify('Limpieza Completada', res.message || 'Cuentas semilla eliminadas permanentemente.', 'success');
      if (fetchData) fetchData();
    } catch (err) {
      notify('Error', err.response?.data?.detail || 'No se pudo purgar los datos.', 'error');
    } finally {
      setPurging(false);
    }
  };

  const isSeedUser = (u) => {
    const email = (u?.correo || '').toLowerCase().trim();
    const alias = (u?.alias || '').toLowerCase().trim();
    if (email === 'admin@meh.com' || email === 'natalygemio@gmail.com') return false;
    if (email.includes('@test.com') || email.includes('@example.com') || (email.startsWith('user') && email.endsWith('@test.com'))) return true;
    if (alias.startsWith('dev_')) return true;
    return false;
  };

  const realUsers = (data || []).filter(u => !isSeedUser(u));

  const filteredUsers = [...realUsers]
    .sort((a, b) => (b.id_usuario || 0) - (a.id_usuario || 0))
    .filter(u => {
      if (roleFilter !== 'ALL' && u.rol !== roleFilter) return false;
      return matchesSmartSearch(
        [u.nombres, u.apellidos, u.correo, u.alias, u.rol, u.institucion, u.id_usuario],
        searchTerm
      );
    });

  // Abrir modal de edición
  const handleOpenEdit = (user) => {
    setEditForm({
      nombres: user.nombres || '',
      apellidos: user.apellidos || '',
      correo: user.correo || '',
      alias: user.alias || '',
      rol: user.rol || 'MIEMBRO',
      institucion: user.institucion || user.estudia_en || '',
      bio: user.bio || '',
      email_verificado: user.email_verificado !== false
    });
    setEditModal({ open: true, user, loading: false });
  };

  // Guardar edición de usuario
  const handleSaveEdit = async () => {
    if (!editModal.user) return;
    setEditModal(prev => ({ ...prev, loading: true }));
    try {
      await authService.adminUpdateUser(editModal.user.id_usuario, editForm);
      notify('Éxito', `Usuario ${editForm.nombres} actualizado correctamente.`, 'success');
      setEditModal({ open: false, user: null, loading: false });
      if (fetchData) fetchData();
    } catch (err) {
      const detail = err.response?.data?.detail;
      notify('Error', typeof detail === 'string' ? detail : 'No se pudo actualizar el usuario.', 'error');
      setEditModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Guardar reset password
  const handleSavePassword = async () => {
    if (!passwordModal.user || !passwordModal.password) return;
    if (passwordModal.password.length < 8) {
      notify('Atención', 'La nueva contraseña debe tener al menos 8 caracteres.', 'warning');
      return;
    }
    setPasswordModal(prev => ({ ...prev, loading: true }));
    try {
      await authService.adminResetPassword(passwordModal.user.id_usuario, passwordModal.password);
      notify('Éxito', `Contraseña restablecida exitosamente para ${passwordModal.user.nombres}.`, 'success');
      setPasswordModal({ open: false, user: null, password: '', loading: false });
    } catch (err) {
      const detail = err.response?.data?.detail;
      notify('Error', typeof detail === 'string' ? detail : 'No se pudo restablecer la contraseña.', 'error');
      setPasswordModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Confirmar suspensión
  const handleConfirmSuspend = async () => {
    if (!suspendModal.user) return;
    setSuspendModal(prev => ({ ...prev, loading: true }));
    try {
      await authService.suspenderUsuario(suspendModal.user.id_usuario, suspendModal.motivo);
      notify('Usuario Suspendido', `${suspendModal.user.nombres} ha sido suspendido.`, 'warning');
      setSuspendModal({ open: false, user: null, motivo: '', loading: false });
      if (fetchData) fetchData();
    } catch (err) {
      const detail = err.response?.data?.detail;
      notify('Error', typeof detail === 'string' ? detail : 'No se pudo suspender al usuario.', 'error');
      setSuspendModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Restaurar usuario
  const handleRestaurar = async (user) => {
    if (!window.confirm(`¿Deseas restaurar la cuenta de ${user.nombres} ${user.apellidos}?`)) return;
    try {
      await authService.restaurarUsuario(user.id_usuario);
      notify('Cuenta Restaurada', `La cuenta de ${user.nombres} ha sido reactivada.`, 'success');
      if (fetchData) fetchData();
    } catch (err) {
      const detail = err.response?.data?.detail;
      notify('Error', typeof detail === 'string' ? detail : 'No se pudo restaurar la cuenta.', 'error');
    }
  };

  return (
    <div>
      <div className={styles.infoPanel}>
        <Info24Regular style={{ fontSize: '36px', color: tokens.colorBrandForeground1 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <MEHTypography variant="h3" style={{ color: tokens.colorBrandForeground1, fontWeight: 'bold' }}>
            {t("admin_members_panel")}
          </MEHTypography>
          <MEHTypography variant="body" style={{ opacity: 0.9 }}>
            Gestión completa del ciclo de vida de usuarios: edición de perfiles, restablecimiento de contraseñas, verificación de correos y suspensión/restauración de cuentas.
          </MEHTypography>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flexGrow: 1 }}>
          <Input 
            placeholder="Buscar por nombre(s), apellido(s), correo o @alias..." 
            contentBefore={<Search24Regular />}
            contentAfter={
              searchTerm ? (
                <DismissCircle24Regular
                  style={{ cursor: 'pointer', opacity: 0.7 }}
                  title="Limpiar búsqueda"
                  onClick={() => setSearchBox('')}
                />
              ) : undefined
            }
            value={searchTerm} 
            onChange={(e, d) => setSearchBox(d.value)} 
            style={{ width: '100%', maxWidth: '420px', height: '42px' }} 
          />
          <Select
            value={roleFilter}
            onChange={(e, d) => setRoleFilter(d.value)}
            style={{ minWidth: '170px', height: '42px' }}
            aria-label="Filtrar por rol"
          >
            <option value="ALL">Todos los roles ({realUsers.length})</option>
            <option value="ADMIN">ADMIN</option>
            <option value="ORGANIZADOR">ORGANIZADOR</option>
            <option value="MODERADOR">MODERADOR</option>
            <option value="SOPORTE">SOPORTE</option>
            <option value="EMBAJADOR">EMBAJADOR</option>
            <option value="MIEMBRO">MIEMBRO</option>
          </Select>
          <Badge appearance="tint" color="brand" size="large">
            {filteredUsers.length} de {realUsers.length} miembro(s)
          </Badge>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <MEHButton 
            size="small" 
            icon={<ArrowSync24Regular />} 
            appearance="subtle" 
            disabled={loading}
            onClick={() => { if (fetchData) fetchData(); }}
            title="Sincronizar y recargar miembros desde la base de datos"
          >
            {loading ? 'Cargando...' : 'Actualizar'}
          </MEHButton>
          <MEHButton size="small" icon={<PersonAdd24Regular />} appearance="primary" onClick={() => setIsCreateModalOpen(true)}>
            + Nuevo Miembro
          </MEHButton>
          <MEHButton size="small" icon={<ArrowDownload24Regular />} appearance="outline" onClick={handleExportCSV}>
            {t("admin_export_excel")}
          </MEHButton>
          <MEHButton 
            size="small" 
            appearance="subtle" 
            style={{ color: tokens.colorPaletteRedForeground1, border: `1px solid ${tokens.colorPaletteRedBorderActive}` }} 
            disabled={purging} 
            onClick={handlePurgeSeeds}
          >
            {purging ? 'Limpiando...' : '🧹 Purgar Semillas BD'}
          </MEHButton>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}><Spinner label={t("loading")} /></div>
        ) : (
          <Table size="extra-small" style={{ minWidth: "960px", tableLayout: 'fixed' }}>
            <TableHeader>
              <TableRow>
                <TableHeaderCell style={{ width: '300px' }}>{t("admin_member_col") || "Miembro"}</TableHeaderCell>
                <TableHeaderCell style={{ width: '110px' }}>Estado</TableHeaderCell>
                <TableHeaderCell style={{ width: '150px' }}>Email Verif.</TableHeaderCell>
                <TableHeaderCell style={{ width: '110px' }}>{t("admin_join_col") || "Registro"}</TableHeaderCell>
                <TableHeaderCell style={{ width: '120px' }}>{t("admin_role_col") || "Rol"}</TableHeaderCell>
                <TableHeaderCell style={{ width: '170px', textAlign: 'right' }}>{t("admin_action_col") || "Acciones"}</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <span style={{ opacity: 0.7, fontSize: '14px' }}>
                        No se encontraron miembros con el criterio de búsqueda actual.
                      </span>
                      <MEHButton 
                        size="small" 
                        icon={<ArrowSync24Regular />} 
                        appearance="outline" 
                        onClick={() => { if (fetchData) fetchData(); }}
                      >
                        Sincronizar / Refrescar desde el servidor
                      </MEHButton>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map(u => {
                const isSuspended = u.activo === false || u.id_estado === 0;
                const isVerified = u.email_verificado !== false;

                return (
                  <TableRow key={`u-${u.id_usuario}`} className={styles.userRow} style={isSuspended ? { opacity: 0.65, backgroundColor: 'rgba(255, 0, 0, 0.03)' } : {}}>
                    <TableCell style={{ maxWidth: '300px', overflow: 'hidden' }}>
                      <div 
                        className={styles.avatarStack}
                        style={{ cursor: 'pointer' }}
                        title="Clic para ver expediente completo"
                        onClick={() => setExpedienteModal({ open: true, userId: u.id_usuario, user: u })}
                      >
                        <Avatar size={40} name={u.nombres} image={{ src: resolveApiFileUrl(u.foto_url) }} style={{ flexShrink: 0 }} />
                        <div style={{ minWidth: 0, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                          <span 
                            style={{ 
                              color: tokens.colorBrandForeground1, 
                              fontWeight: 600, 
                              whiteSpace: 'nowrap', 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis',
                              display: 'block'
                            }}
                            title={`${u.nombres} ${u.apellidos}`}
                          >
                            {u.nombres} {u.apellidos}
                          </span>
                          <span 
                            style={{ 
                              fontSize: '11px', 
                              opacity: 0.75, 
                              whiteSpace: 'nowrap', 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              display: 'block',
                              maxWidth: '220px'
                            }} 
                            title={u.correo}
                          >
                            {u.correo}
                          </span>
                          {u.alias && (
                            <Badge appearance="outline" size="small" style={{ alignSelf: 'flex-start', marginTop: '2px' }}>
                              @{u.alias}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {isSuspended ? (
                        <Tooltip content={u.motivo_suspension ? `Motivo: ${u.motivo_suspension}` : 'Cuenta suspendida'} relationship="description">
                          <Badge appearance="filled" color="danger">
                            SUSPENDIDO
                          </Badge>
                        </Tooltip>
                      ) : (
                        <Badge appearance="tint" color="informative">
                          ACTIVO
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      {isVerified ? (
                        <Badge appearance="tint" color="success" icon={<CheckmarkCircle24Filled />}>
                          Verificado
                        </Badge>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <Badge appearance="tint" color="warning" icon={<Warning24Filled />}>
                              Pendiente
                            </Badge>
                            <MEHButton
                              size="small"
                              appearance="primary"
                              style={{ minWidth: 'auto', padding: '2px 8px', fontSize: '11px', height: '24px' }}
                              onClick={async () => {
                                try {
                                  await authService.adminUpdateUser(u.id_usuario, { email_verificado: true });
                                  notify('Usuario Verificado', `Se activó el correo de ${u.nombres} exitosamente.`, 'success');
                                  if (fetchData) fetchData();
                                } catch (err) {
                                  notify('Error', err.response?.data?.detail || 'No se pudo verificar el usuario.', 'error');
                                }
                              }}
                            >
                              Verificar 1-clic
                            </MEHButton>
                          </div>
                          {u.codigo_verificacion && (
                            <span style={{ fontSize: '11px', fontFamily: 'monospace', opacity: 0.8 }}>
                              Código: <b>{u.codigo_verificacion}</b>
                            </span>
                          )}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>{new Date(u.fecha_registro).toLocaleDateString()}</TableCell>

                    <TableCell>
                      <Badge appearance="outline" color={u.rol === 'ADMIN' ? 'danger' : u.rol === 'ORGANIZADOR' ? 'warning' : 'brand'}>
                        {u.rol}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className={styles.actionButtons}>
                        {/* Ver Expediente Completo */}
                        <Tooltip content="Ver expediente y perfil completo (eventos, compras, asistencia)" relationship="label">
                          <MEHButton 
                            size="small" 
                            appearance="subtle"
                            icon={<Eye24Regular style={{ color: tokens.colorBrandForeground1 }} />} 
                            onClick={() => setExpedienteModal({ open: true, userId: u.id_usuario, user: u })} 
                          />
                        </Tooltip>

                        {/* Editar Usuario */}
                        <Tooltip content="Editar datos del usuario" relationship="label">
                          <MEHButton 
                            size="small" 
                            appearance="subtle"
                            icon={<Edit24Regular />} 
                            onClick={() => handleOpenEdit(u)} 
                          />
                        </Tooltip>

                        {/* Resetear Contraseña */}
                        <Tooltip content="Restablecer contraseña" relationship="label">
                          <MEHButton 
                            size="small" 
                            appearance="subtle"
                            icon={<Key24Regular />} 
                            onClick={() => setPasswordModal({ open: true, user: u, password: '', loading: false })} 
                          />
                        </Tooltip>

                        {/* Suspender o Restaurar */}
                        {u.id_usuario !== currentUser?.id_usuario ? (
                          isSuspended ? (
                            <Tooltip content="Restaurar cuenta suspendida" relationship="label">
                              <MEHButton 
                                size="small" 
                                appearance="subtle"
                                icon={<CheckmarkCircle24Regular style={{ color: tokens.colorPaletteGreenForeground1 }} />} 
                                onClick={() => handleRestaurar(u)} 
                              />
                            </Tooltip>
                          ) : (
                            <Tooltip content="Suspender cuenta con motivo" relationship="label">
                              <MEHButton 
                                size="small" 
                                appearance="subtle"
                                icon={<PersonProhibited24Regular style={{ color: tokens.colorPaletteRedForeground1 }} />} 
                                onClick={() => setSuspendModal({ open: true, user: u, motivo: '', loading: false })} 
                              />
                            </Tooltip>
                          )
                        ) : (
                          <Badge size="small">{t("admin_you")}</Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              }))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Vista de Tarjetas Adaptativas para Móviles (<= 768px) */}
      {!loading && (
        <div className={styles.mobileCardsContainer}>
          {filteredUsers.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: tokens.colorNeutralBackground1, borderRadius: '16px', border: `1px solid ${tokens.colorNeutralBackground3}` }}>
              <MEHTypography variant="body" style={{ opacity: 0.7 }}>
                {t("admin_no_users_found") || "No se encontraron miembros."}
              </MEHTypography>
            </div>
          ) : (
            filteredUsers.map(u => {
              const isSuspended = u.activo === false || u.id_estado === 0;
              const isVerified = u.email_verificado !== false;

              return (
                <div 
                  key={`card-u-${u.id_usuario}`} 
                  className={styles.mobileUserCard}
                  style={isSuspended ? { opacity: 0.75, borderLeft: `4px solid ${tokens.colorPaletteRedBackground3}` } : { borderLeft: `4px solid ${tokens.colorBrandBackground}` }}
                >
                  {/* Fila 1: Avatar + Nombre + Correo + Alias */}
                  <div 
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                    onClick={() => setExpedienteModal({ open: true, userId: u.id_usuario, user: u })}
                  >
                    <Avatar size={44} name={u.nombres} image={{ src: resolveApiFileUrl(u.foto_url) }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '15px', color: tokens.colorNeutralForeground1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.nombres} {u.apellidos}
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.75, wordBreak: 'break-all' }}>
                        {u.correo}
                      </div>
                      {u.alias && (
                        <Badge appearance="outline" size="small" style={{ marginTop: '2px' }}>
                          @{u.alias}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Fila 2: Badges de Estado, Rol, Email */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', paddingTop: '4px' }}>
                    <Badge appearance="outline" color={u.rol === 'ADMIN' ? 'danger' : u.rol === 'ORGANIZADOR' ? 'warning' : 'brand'}>
                      {u.rol}
                    </Badge>

                    {isSuspended ? (
                      <Badge appearance="filled" color="danger">SUSPENDIDO</Badge>
                    ) : (
                      <Badge appearance="tint" color="informative">ACTIVO</Badge>
                    )}

                    {isVerified ? (
                      <Badge appearance="tint" color="success" icon={<CheckmarkCircle24Filled />}>
                        Verificado
                      </Badge>
                    ) : (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Badge appearance="tint" color="warning" icon={<Warning24Filled />}>
                          Pendiente
                        </Badge>
                        <MEHButton
                          size="small"
                          appearance="primary"
                          style={{ minWidth: 'auto', padding: '1px 6px', fontSize: '10px', height: '22px' }}
                          onClick={async () => {
                            try {
                              await authService.adminUpdateUser(u.id_usuario, { email_verificado: true });
                              notify('Usuario Verificado', `Se activó el correo de ${u.nombres} exitosamente.`, 'success');
                              if (fetchData) fetchData();
                            } catch (err) {
                              notify('Error', err.response?.data?.detail || 'No se pudo verificar el usuario.', 'error');
                            }
                          }}
                        >
                          Verificar
                        </MEHButton>
                      </div>
                    )}

                    <span style={{ fontSize: '11px', opacity: 0.6, marginLeft: 'auto' }}>
                      {new Date(u.fecha_registro).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Fila 3: Botones de Acción */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: `1px solid ${tokens.colorNeutralBackground3}`, paddingTop: '10px', marginTop: '2px' }}>
                    <MEHButton 
                      size="small" 
                      appearance="subtle"
                      icon={<Eye24Regular style={{ color: tokens.colorBrandForeground1 }} />} 
                      onClick={() => setExpedienteModal({ open: true, userId: u.id_usuario, user: u })} 
                    >
                      Perfil
                    </MEHButton>

                    <MEHButton 
                      size="small" 
                      appearance="subtle"
                      icon={<Edit24Regular />} 
                      onClick={() => handleOpenEdit(u)} 
                    >
                      Editar
                    </MEHButton>

                    <MEHButton 
                      size="small" 
                      appearance="subtle"
                      icon={<Key24Regular />} 
                      onClick={() => setPasswordModal({ open: true, user: u, password: '', loading: false })} 
                    >
                      Clave
                    </MEHButton>

                    {u.id_usuario !== currentUser?.id_usuario && (
                      <MEHButton 
                        size="small" 
                        appearance="subtle"
                        style={isSuspended ? { color: tokens.colorPaletteGreenForeground1 } : { color: tokens.colorPaletteRedForeground1 }}
                        onClick={() => {
                          if (isSuspended) {
                            handleRestore(u);
                          } else {
                            setSuspendModal({ open: true, user: u, motivo: '', loading: false });
                          }
                        }}
                      >
                        {isSuspended ? 'Restaurar' : 'Suspender'}
                      </MEHButton>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* DIÁLOGO MODAL: EDICIÓN DE USUARIO */}
      <Dialog 
        open={editModal.open} 
        onOpenChange={(e, d) => { if (!d.open && !editModal.loading) setEditModal({ open: false, user: null, loading: false }); }}
      >
        <DialogSurface style={{ maxWidth: '520px', width: '90%' }}>
          <DialogBody>
            <DialogTitle>Editar Miembro</DialogTitle>
            <DialogContent className={styles.modalForm}>
              <div className={styles.rowTwo}>
                <Field label="Nombres">
                  <Input 
                    value={editForm.nombres} 
                    onChange={(e, d) => setEditForm(prev => ({ ...prev, nombres: d.value }))} 
                  />
                </Field>
                <Field label="Apellidos">
                  <Input 
                    value={editForm.apellidos} 
                    onChange={(e, d) => setEditForm(prev => ({ ...prev, apellidos: d.value }))} 
                  />
                </Field>
              </div>

              <div className={styles.rowTwo}>
                <Field label="Correo Electrónico">
                  <Input 
                    type="email"
                    value={editForm.correo} 
                    onChange={(e, d) => setEditForm(prev => ({ ...prev, correo: d.value }))} 
                  />
                </Field>
                <Field label="Alias / Username">
                  <Input 
                    value={editForm.alias} 
                    onChange={(e, d) => setEditForm(prev => ({ ...prev, alias: d.value }))} 
                  />
                </Field>
              </div>

              <div className={styles.rowTwo}>
                <Field label="Rol en la Plataforma">
                  <Select 
                    value={editForm.rol} 
                    onChange={(e) => setEditForm(prev => ({ ...prev, rol: e.target.value }))}
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="ORGANIZADOR">ORGANIZADOR</option>
                    <option value="MODERADOR">MODERADOR</option>
                    <option value="SOPORTE">SOPORTE</option>
                    <option value="EMBAJADOR">EMBAJADOR</option>
                    <option value="MIEMBRO">MIEMBRO</option>
                  </Select>
                </Field>

                <Field label="Estado Verificación Email">
                  <Select 
                    value={editForm.email_verificado ? "true" : "false"} 
                    onChange={(e) => setEditForm(prev => ({ ...prev, email_verificado: e.target.value === "true" }))}
                  >
                    <option value="true">Verificado</option>
                    <option value="false">No verificado</option>
                  </Select>
                </Field>
              </div>

              <Field label="Institución / Universidad">
                <Input 
                  value={editForm.institucion} 
                  onChange={(e, d) => setEditForm(prev => ({ ...prev, institucion: d.value }))} 
                />
              </Field>

              <Field label="Biografía">
                <Textarea 
                  value={editForm.bio} 
                  onChange={(e, d) => setEditForm(prev => ({ ...prev, bio: d.value }))} 
                  rows={2}
                />
              </Field>
            </DialogContent>
            <DialogActions style={{ marginTop: '16px' }}>
              <MEHButton 
                appearance="secondary" 
                onClick={() => setEditModal({ open: false, user: null, loading: false })}
                disabled={editModal.loading}
              >
                Cancelar
              </MEHButton>
              <MEHButton 
                appearance="primary" 
                onClick={handleSaveEdit}
                disabled={editModal.loading}
              >
                {editModal.loading ? 'Guardando...' : 'Guardar Cambios'}
              </MEHButton>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* DIÁLOGO MODAL: RESET PASSWORD */}
      <Dialog 
        open={passwordModal.open} 
        onOpenChange={(e, d) => { if (!d.open && !passwordModal.loading) setPasswordModal({ open: false, user: null, password: '', loading: false }); }}
      >
        <DialogSurface style={{ maxWidth: '420px', width: '90%' }}>
          <DialogBody>
            <DialogTitle>Restablecer Contraseña</DialogTitle>
            <DialogContent className={styles.modalForm}>
              <MEHTypography variant="body" style={{ opacity: 0.85 }}>
                Asignar una nueva contraseña para el usuario <b>{passwordModal.user?.nombres} {passwordModal.user?.apellidos}</b> ({passwordModal.user?.correo}):
              </MEHTypography>

              <Field label="Nueva Contraseña (mínimo 8 caracteres)" required>
                <Input 
                  type="password"
                  value={passwordModal.password} 
                  onChange={(e, d) => setPasswordModal(prev => ({ ...prev, password: d.value }))} 
                  placeholder="Ej: NuevaClaveSegura2026!"
                />
              </Field>
            </DialogContent>
            <DialogActions style={{ marginTop: '16px' }}>
              <MEHButton 
                appearance="secondary" 
                onClick={() => setPasswordModal({ open: false, user: null, password: '', loading: false })}
                disabled={passwordModal.loading}
              >
                Cancelar
              </MEHButton>
              <MEHButton 
                appearance="primary" 
                onClick={handleSavePassword}
                disabled={passwordModal.loading || passwordModal.password.length < 8}
              >
                {passwordModal.loading ? 'Restableciendo...' : 'Restablecer'}
              </MEHButton>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* DIÁLOGO MODAL: SUSPENSIÓN CON MOTIVO */}
      <Dialog 
        open={suspendModal.open} 
        onOpenChange={(e, d) => { if (!d.open && !suspendModal.loading) setSuspendModal({ open: false, user: null, motivo: '', loading: false }); }}
      >
        <DialogSurface style={{ maxWidth: '440px', width: '90%' }}>
          <DialogBody>
            <DialogTitle style={{ color: tokens.colorPaletteRedForeground1, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PersonProhibited24Regular />
              Suspender Cuenta de Usuario
            </DialogTitle>
            <DialogContent className={styles.modalForm}>
              <MEHTypography variant="body">
                ¿Estás seguro de que deseas suspender la cuenta de <b>{suspendModal.user?.nombres} {suspendModal.user?.apellidos}</b>?
              </MEHTypography>
              <MEHTypography variant="caption" style={{ opacity: 0.75 }}>
                El usuario no podrá iniciar sesión en la plataforma mientras su cuenta permanezca suspendida.
              </MEHTypography>

              <Field label="Motivo de la suspensión" required>
                <Textarea 
                  value={suspendModal.motivo} 
                  onChange={(e, d) => setSuspendModal(prev => ({ ...prev, motivo: d.value }))} 
                  placeholder="Especifica el motivo de la suspensión (ej: infracción a los términos de la comunidad)..."
                  rows={3}
                />
              </Field>
            </DialogContent>
            <DialogActions style={{ marginTop: '16px' }}>
              <MEHButton 
                appearance="secondary" 
                onClick={() => setSuspendModal({ open: false, user: null, motivo: '', loading: false })}
                disabled={suspendModal.loading}
              >
                Cancelar
              </MEHButton>
              <MEHButton 
                appearance="primary" 
                style={{ backgroundColor: tokens.colorPaletteRedBackground3 }}
                onClick={handleConfirmSuspend}
                disabled={suspendModal.loading || !suspendModal.motivo.trim()}
              >
                {suspendModal.loading ? 'Suspendiendo...' : 'Confirmar Suspensión'}
              </MEHButton>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <CreateUserModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        currentUser={currentUser}
        onSuccess={() => { if (fetchData) fetchData(); }}
      />

      {expedienteModal.open && (
        <UserExpedienteModal
          open={expedienteModal.open}
          onClose={() => setExpedienteModal({ open: false, userId: null, user: null })}
          userId={expedienteModal.userId}
          initialUser={expedienteModal.user}
        />
      )}
    </div>
  );
};

export default UsersTab;

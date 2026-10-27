import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Field,
  Input,
  Select,
  Spinner,
  Badge,
  tokens,
  makeStyles
} from '@fluentui/react-components';
import {
  Box24Filled,
  Money24Regular,
  Person24Regular,
  Search24Regular,
  CheckmarkCircle24Filled,
  Dismiss24Regular,
  PersonAdd24Regular
} from '@fluentui/react-icons';
import { MEHButton, MEHTypography } from './ui';
import adminService from '../services/adminService';
import authService from '../services/authService';
import { useNotify } from '../App';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    paddingTop: '8px',
  },
  totalBox: {
    padding: '16px',
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: '10px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  quickCreateBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '14px',
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: '12px',
    border: `1px dashed ${tokens.colorBrandStroke1}`,
  }
});

const VentaSouvenirModal = ({ open, onClose, initialUser = null, onSuccess }) => {
  const styles = useStyles();
  const { notify } = useNotify();

  const [productos, setProductos] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('TODOS'); // 'TODOS' | 'EVENTO' | 'GENERAL'

  // Búsqueda de usuario si no viene preseleccionado
  const [userSearch, setUserSearch] = useState('');
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(initialUser);
  const [searchingUsers, setSearchingUsers] = useState(false);

  // Creación rápida de usuario si no existe en la BD
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [quickNombres, setQuickNombres] = useState('');
  const [quickApellidos, setQuickApellidos] = useState('');
  const [quickCorreo, setQuickCorreo] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);

  // Datos de la venta
  const [selectedProductoId, setSelectedProductoId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedUser(initialUser);
      setUserSearch('');
      setSearchedUsers([]);
      setCantidad(1);
      setMetodoPago('EFECTIVO');
      setFiltroTipo('TODOS');
      setShowQuickCreate(false);
      setQuickNombres('');
      setQuickApellidos('');
      setQuickCorreo('');
      void fetchProductos();
    }
  }, [open, initialUser]);

  const fetchProductos = async () => {
    setLoadingProductos(true);
    try {
      const data = await adminService.getSouvenirs();
      const activos = (data || []).filter(p => p.id_estado !== 0);
      setProductos(activos);
      if (activos.length > 0) {
        setSelectedProductoId(String(activos[0].id_producto));
      }
    } catch (err) {
      console.error(err);
      notify('Error', 'No se pudieron cargar los souvenirs.', 'error');
    } finally {
      setLoadingProductos(false);
    }
  };

  const handleSearchUsers = async (term) => {
    setUserSearch(term);
    if (!term || term.trim().length < 2) {
      setSearchedUsers([]);
      return;
    }
    setSearchingUsers(true);
    try {
      const data = await authService.getAllUsers(term.trim());
      setSearchedUsers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleQuickCreateUser = async () => {
    if (!quickNombres.trim() || !quickApellidos.trim() || !quickCorreo.trim()) {
      notify('Campos obligatorios', 'Ingresa nombres, apellidos y correo del comprador.', 'warning');
      return;
    }
    setCreatingUser(true);
    try {
      const newUser = await authService.adminCreateUser({
        nombres: quickNombres.trim(),
        apellidos: quickApellidos.trim(),
        correo: quickCorreo.trim(),
        rol: 'MIEMBRO'
      });
      notify('Comprador Registrado', `${newUser.nombres} ${newUser.apellidos} fue registrado(a) y seleccionado(a).`, 'success');
      setSelectedUser(newUser);
      setShowQuickCreate(false);
      setQuickNombres('');
      setQuickApellidos('');
      setQuickCorreo('');
    } catch (err) {
      console.error(err);
      notify('Error al crear usuario', err.response?.data?.detail || 'No se pudo crear el usuario.', 'error');
    } finally {
      setCreatingUser(false);
    }
  };

  const productosFiltrados = productos.filter(p => {
    if (filtroTipo === 'EVENTO') return Boolean(p.es_kit_evento);
    if (filtroTipo === 'GENERAL') return !p.es_kit_evento;
    return true;
  });

  const selectedProd = productos.find(p => String(p.id_producto) === String(selectedProductoId));
  const maxStock = selectedProd ? selectedProd.stock : 0;
  const precioUnitario = selectedProd ? Number(selectedProd.precio || 0) : 0;
  const total = (precioUnitario * Number(cantidad || 0)).toFixed(2);

  const handleSubmit = async () => {
    const userId = selectedUser?.id_usuario;
    if (!userId) {
      notify('Atención', 'Debes seleccionar al miembro que recibirá el souvenir.', 'warning');
      return;
    }
    if (!selectedProd) {
      notify('Atención', 'Debes seleccionar un souvenir válido.', 'warning');
      return;
    }
    if (cantidad < 1 || cantidad > maxStock) {
      notify('Atención', `La cantidad debe ser entre 1 y ${maxStock}.`, 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await adminService.registrarVentaSouvenir(
        userId,
        [{ id_producto: selectedProd.id_producto, cantidad: Number(cantidad) }],
        metodoPago
      );

      notify(
        'Venta Registrada',
        `Se asignó ${cantidad}x ${selectedProd.nombre} a ${selectedUser.nombres || selectedUser.nombre} por Bs. ${total} (${metodoPago}).`,
        'success'
      );
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      notify('Error al registrar venta', err.response?.data?.detail || 'No se pudo registrar la venta.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(e, d) => { if (!d.open && !submitting) onClose(); }}>
      <DialogSurface style={{ borderRadius: '20px', maxWidth: '540px', width: '100%' }}>
        <DialogBody>
          <DialogTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Box24Filled style={{ color: tokens.colorBrandForeground1 }} />
              <span>Registrar Venta / Asignar Souvenir</span>
            </div>
          </DialogTitle>
          <DialogContent className={styles.container}>
            {/* 1. Selección de Usuario */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <MEHTypography variant="body"><b>1. Miembro / Comprador:</b></MEHTypography>
                {!selectedUser && (
                  <MEHButton 
                    size="small" 
                    appearance="subtle" 
                    onClick={() => setShowQuickCreate(!showQuickCreate)}
                  >
                    {showQuickCreate ? "Volver a buscar" : "+ ¿No está en BD? Crear rápido"}
                  </MEHButton>
                )}
              </div>

              {selectedUser ? (
                <div className={styles.userCard}>
                  <Person24Regular fontSize={24} style={{ color: tokens.colorBrandForeground1 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 'bold' }}>{selectedUser.nombres || selectedUser.nombre} {selectedUser.apellidos || selectedUser.apellido || ''}</div>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>{selectedUser.correo || selectedUser.email}</div>
                  </div>
                  {!initialUser && (
                    <MEHButton size="small" appearance="subtle" onClick={() => setSelectedUser(null)}>
                      Cambiar
                    </MEHButton>
                  )}
                </div>
              ) : showQuickCreate ? (
                <div className={styles.quickCreateBox}>
                  <MEHTypography variant="caption" style={{ fontWeight: 'bold', color: tokens.colorBrandForeground1 }}>
                    Registrar nuevo comprador en la Base de Datos:
                  </MEHTypography>
                  <Input
                    placeholder="Nombres *"
                    value={quickNombres}
                    onChange={(e, d) => setQuickNombres(d.value)}
                  />
                  <Input
                    placeholder="Apellidos *"
                    value={quickApellidos}
                    onChange={(e, d) => setQuickApellidos(d.value)}
                  />
                  <Input
                    type="email"
                    placeholder="Correo electrónico *"
                    value={quickCorreo}
                    onChange={(e, d) => setQuickCorreo(d.value)}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <MEHButton size="small" appearance="secondary" onClick={() => setShowQuickCreate(false)}>
                      Cancelar
                    </MEHButton>
                    <MEHButton
                      size="small"
                      appearance="primary"
                      onClick={handleQuickCreateUser}
                      disabled={creatingUser}
                      icon={creatingUser ? <Spinner size="tiny" /> : <PersonAdd24Regular />}
                    >
                      {creatingUser ? "Creando..." : "Crear y Seleccionar"}
                    </MEHButton>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <Input
                    placeholder="Buscar por nombre o correo..."
                    contentBefore={<Search24Regular />}
                    value={userSearch}
                    onChange={(e, d) => handleSearchUsers(d.value)}
                  />
                  {searchingUsers && <Spinner size="tiny" label="Buscando miembros en la base de datos..." />}
                  {searchedUsers.length > 0 && (
                    <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: '8px', padding: '4px' }}>
                      {searchedUsers.slice(0, 10).map(u => (
                        <div
                          key={`usr-${u.id_usuario}`}
                          onClick={() => { setSelectedUser(u); setSearchedUsers([]); }}
                          style={{ padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: tokens.colorNeutralBackground1 }}
                        >
                          <div>
                            <b>{u.nombres} {u.apellidos}</b>
                            <div style={{ fontSize: '11px', opacity: 0.7 }}>{u.correo}</div>
                          </div>
                          <Badge appearance="outline" size="small">ID {u.id_usuario}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. Selección de Producto */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                <MEHTypography variant="body"><b>2. Selecciona el Souvenir:</b></MEHTypography>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <MEHButton
                    size="small"
                    appearance={filtroTipo === 'TODOS' ? 'primary' : 'subtle'}
                    onClick={() => setFiltroTipo('TODOS')}
                  >
                    Todos ({productos.length})
                  </MEHButton>
                  <MEHButton
                    size="small"
                    appearance={filtroTipo === 'EVENTO' ? 'primary' : 'subtle'}
                    onClick={() => setFiltroTipo('EVENTO')}
                  >
                    🎁 Del Evento
                  </MEHButton>
                  <MEHButton
                    size="small"
                    appearance={filtroTipo === 'GENERAL' ? 'primary' : 'subtle'}
                    onClick={() => setFiltroTipo('GENERAL')}
                  >
                    🛍️ Generales
                  </MEHButton>
                </div>
              </div>

              {loadingProductos ? (
                <Spinner size="small" label="Cargando productos..." />
              ) : productosFiltrados.length === 0 ? (
                <MEHTypography variant="caption" style={{ color: tokens.colorPaletteRedForeground1 }}>
                  No hay souvenirs disponibles en este filtro.
                </MEHTypography>
              ) : (
                <Select
                  value={selectedProductoId}
                  onChange={(e, d) => {
                    setSelectedProductoId(d.value);
                    setCantidad(1);
                  }}
                >
                  {productosFiltrados.map(p => (
                    <option key={p.id_producto} value={p.id_producto} disabled={p.stock <= 0}>
                      {p.es_kit_evento ? '🎁 [Evento] ' : '🛍️ [General] '}
                      {p.nombre} — Bs. {Number(p.precio).toFixed(2)} (Stock: {p.stock} unid.){p.stock <= 0 ? ' [AGOTADO]' : ''}
                    </option>
                  ))}
                </Select>
              )}
            </div>

            {/* 3. Cantidad y Método de Pago */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field label="Cantidad:" required>
                <Input
                  type="number"
                  min={1}
                  max={maxStock || 1}
                  value={cantidad}
                  onChange={(e, d) => {
                    const val = Math.max(1, Math.min(maxStock || 1, Number(d.value) || 1));
                    setCantidad(val);
                  }}
                  disabled={maxStock <= 0}
                />
              </Field>

              <Field label="Método de Pago:" required>
                <Select value={metodoPago} onChange={(e, d) => setMetodoPago(d.value)}>
                  <option value="EFECTIVO">Efectivo / Presencial</option>
                  <option value="QR">Código QR</option>
                  <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                </Select>
              </Field>
            </div>

            {/* 4. Total a Cobrar */}
            <div className={styles.totalBox}>
              <div>
                <MEHTypography variant="caption" style={{ opacity: 0.7 }}>TOTAL A COBRAR ({metodoPago}):</MEHTypography>
                <MEHTypography variant="h2" style={{ color: tokens.colorBrandForeground1 }}>
                  Bs. {total}
                </MEHTypography>
              </div>
              <Badge appearance="tint" color={maxStock > 0 ? "success" : "danger"} size="large">
                {maxStock > 0 ? `Stock disponible: ${maxStock}` : 'Sin stock'}
              </Badge>
            </div>
          </DialogContent>

          <DialogActions style={{ marginTop: '16px' }}>
            <MEHButton appearance="secondary" onClick={onClose} disabled={submitting}>
              Cancelar
            </MEHButton>
            <MEHButton
              appearance="primary"
              icon={submitting ? <Spinner size="tiny" /> : <CheckmarkCircle24Filled />}
              onClick={handleSubmit}
              disabled={submitting || !selectedUser || !selectedProd || maxStock <= 0}
            >
              {submitting ? 'Registrando...' : 'Confirmar Venta y Entrega'}
            </MEHButton>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default VentaSouvenirModal;

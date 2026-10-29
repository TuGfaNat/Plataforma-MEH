import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Badge,
  Input,
  Spinner,
  Avatar,
  tokens,
  makeStyles,
  shorthands
} from '@fluentui/react-components';
import {
  Box24Filled,
  Search24Regular,
  ArrowClockwise24Regular,
  Money24Filled,
  Calendar20Regular,
  Receipt24Regular,
  DismissCircle24Regular,
  ShoppingBag24Regular
} from '@fluentui/react-icons';
import { MEHButton, MEHTypography } from './ui';
import adminService from '../services/adminService';
import { useNotify } from '../App';

const useStyles = makeStyles({
  surface: {
    borderRadius: '24px',
    maxWidth: '1060px',
    width: '95%',
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow28,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    '@media (max-width: 600px)': {
      padding: '16px',
      ...shorthands.borderRadius('16px'),
    }
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    paddingTop: '6px',
    minWidth: 0,
  },
  headerBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap',
  },
  titleStack: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  iconBox: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    backgroundColor: tokens.colorBrandBackground,
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: tokens.shadow4,
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '14px',
    '@media (max-width: 720px)': {
      gridTemplateColumns: '1fr',
      gap: '10px',
    }
  },
  kpiCard: {
    padding: '16px',
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRadius('16px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3,
      ...shorthands.borderColor(tokens.colorBrandStroke1),
    }
  },
  kpiIconWrapper: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    flexShrink: 0,
  },
  tableWrapper: {
    maxHeight: '460px',
    overflowY: 'auto',
    overflowX: 'auto',
    ...shorthands.borderRadius('16px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    backgroundColor: tokens.colorNeutralBackground2,
  },
  table: {
    minWidth: '920px',
    width: '100%',
  },
  productRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '2px 0',
  },
  eventBox: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 10px',
    borderRadius: '8px',
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    maxWidth: '260px',
  },
  footerBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingTop: '8px',
    flexWrap: 'wrap',
    gap: '10px',
  }
});

const HistorialVentasSouvenirsModal = ({ open, onClose, eventoId = null, eventoTitulo = null }) => {
  const styles = useStyles();
  const { notify } = useNotify();

  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchVentas = async () => {
    setLoading(true);
    try {
      const data = await adminService.getVentasSouvenirs(eventoId);
      setVentas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar ventas de souvenirs:', err);
      notify('Error', 'No se pudieron cargar las ventas de souvenirs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setSearchTerm('');
      void fetchVentas();
    }
  }, [open, eventoId]);

  const filteredVentas = ventas.filter(v => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const comprador = (v.usuario_nombre || '').toLowerCase();
    const correo = (v.usuario_correo || '').toLowerCase();
    const evento = (v.evento_titulo || '').toLowerCase();
    const metodo = (v.metodo_pago || '').toLowerCase();
    const prods = (v.detalles || []).map(d => (d.producto_nombre || '').toLowerCase()).join(' ');
    return comprador.includes(term) || correo.includes(term) || evento.includes(term) || prods.includes(term) || metodo.includes(term);
  });

  const totalRecaudado = filteredVentas.reduce((acc, v) => acc + Number(v.total || 0), 0);
  const totalUnidades = filteredVentas.reduce((acc, v) => {
    const sumDet = (v.detalles || []).reduce((dAcc, d) => dAcc + Number(d.cantidad || 0), 0);
    return acc + sumDet;
  }, 0);

  const renderMetodoBadge = (metodo) => {
    const m = (metodo || 'EFECTIVO').toUpperCase();
    if (m === 'QR') {
      return (
        <Badge appearance="tint" color="brand" size="medium" style={{ fontWeight: '600', padding: '3px 8px' }}>
          📱 QR
        </Badge>
      );
    }
    if (m === 'TRANSFERENCIA') {
      return (
        <Badge appearance="tint" color="informative" size="medium" style={{ fontWeight: '600', padding: '3px 8px' }}>
          🏦 Transferencia
        </Badge>
      );
    }
    return (
      <Badge appearance="tint" color="success" size="medium" style={{ fontWeight: '600', padding: '3px 8px' }}>
        💵 Efectivo
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(e, d) => { if (!d.open) onClose(); }}>
      <DialogSurface className={styles.surface}>
        <DialogBody>
          <DialogTitle>
            <div className={styles.headerBox}>
              <div className={styles.titleStack}>
                <div className={styles.iconBox}>
                  <Receipt24Regular />
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: tokens.colorNeutralForeground1 }}>
                    {eventoId ? `Ventas de Souvenirs en el Evento` : 'Historial de Ventas de Souvenirs'}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '2px' }}>
                    Registro de ventas presenciales y tienda con stock descontado en tiempo real
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MEHButton
                  size="small"
                  appearance="subtle"
                  icon={loading ? <Spinner size="tiny" /> : <ArrowClockwise24Regular />}
                  onClick={fetchVentas}
                  disabled={loading}
                >
                  {loading ? 'Actualizando...' : 'Actualizar'}
                </MEHButton>
              </div>
            </div>
          </DialogTitle>

          <DialogContent className={styles.container}>
            {eventoTitulo && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', backgroundColor: tokens.colorBrandBackground2, borderRadius: '12px', border: `1px solid ${tokens.colorBrandStroke1}` }}>
                <Calendar20Regular style={{ color: tokens.colorBrandForeground1, fontSize: '20px' }} />
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.8, letterSpacing: '0.5px' }}>Filtrado por Evento</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{eventoTitulo}</div>
                </div>
              </div>
            )}

            {/* 1. KPIs Rápidos y Profesionales */}
            <div className={styles.kpiGrid}>
              {/* Total Recaudado */}
              <div className={styles.kpiCard}>
                <div className={styles.kpiIconWrapper} style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                  <Money24Filled />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', opacity: 0.7, letterSpacing: '0.5px' }}>
                    Total Recaudado
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#10b981', lineHeight: 1.2 }}>
                    Bs. {totalRecaudado.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '2px' }}>
                    Ingresos conciliados
                  </div>
                </div>
              </div>

              {/* Unidades Vendidas */}
              <div className={styles.kpiCard}>
                <div className={styles.kpiIconWrapper} style={{ backgroundColor: tokens.colorBrandBackground2, color: tokens.colorBrandForeground1 }}>
                  <Box24Filled />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', opacity: 0.7, letterSpacing: '0.5px' }}>
                    Unidades Vendidas
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: tokens.colorBrandForeground1, lineHeight: 1.2 }}>
                    {totalUnidades} unid.
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '2px' }}>
                    Productos entregados
                  </div>
                </div>
              </div>

              {/* Transacciones */}
              <div className={styles.kpiCard}>
                <div className={styles.kpiIconWrapper} style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', color: tokens.colorNeutralForeground1 }}>
                  <ShoppingBag24Regular />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', opacity: 0.7, letterSpacing: '0.5px' }}>
                    Transacciones
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: tokens.colorNeutralForeground1, lineHeight: 1.2 }}>
                    {filteredVentas.length}
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '2px' }}>
                    Pedidos completados
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Filtro de Búsqueda Reactivo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <Input
                  placeholder="Buscar por comprador, correo, evento o producto..."
                  contentBefore={<Search24Regular />}
                  contentAfter={
                    searchTerm ? (
                      <DismissCircle24Regular
                        style={{ cursor: 'pointer', opacity: 0.7 }}
                        title="Limpiar búsqueda"
                        onClick={() => setSearchTerm('')}
                      />
                    ) : undefined
                  }
                  value={searchTerm}
                  onChange={(e, d) => setSearchTerm(d.value)}
                  style={{ width: '100%', height: '40px' }}
                />
              </div>
              <Badge appearance="tint" color="brand" size="large">
                {filteredVentas.length} venta{filteredVentas.length === 1 ? '' : 's'}
              </Badge>
            </div>

            {/* 3. Tabla con diseño moderno y scroll horizontal sin quiebres */}
            <div className={styles.tableWrapper}>
              {loading ? (
                <div style={{ padding: '50px 20px', textAlign: 'center' }}>
                  <Spinner size="medium" label="Cargando historial de ventas..." />
                </div>
              ) : filteredVentas.length === 0 ? (
                <div style={{ padding: '48px 20px', textAlign: 'center', opacity: 0.75 }}>
                  <Box24Filled fontSize={40} style={{ marginBottom: '8px', color: tokens.colorNeutralStroke1 }} />
                  <div style={{ fontWeight: 'bold', fontSize: '15px' }}>No se encontraron registros de ventas</div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    {searchTerm ? 'Intenta con otros términos de búsqueda.' : 'No hay ventas de souvenirs registradas aún.'}
                  </div>
                </div>
              ) : (
                <Table size="medium" className={styles.table}>
                  <TableHeader>
                    <TableRow style={{ borderBottom: `1px solid ${tokens.colorNeutralStroke2}` }}>
                      <TableHeaderCell style={{ width: '150px' }}>Fecha y Hora</TableHeaderCell>
                      <TableHeaderCell style={{ width: '220px' }}>Comprador</TableHeaderCell>
                      <TableHeaderCell style={{ width: '280px' }}>Productos (Stock descontado)</TableHeaderCell>
                      {!eventoId && <TableHeaderCell style={{ width: '220px' }}>Evento Asignado</TableHeaderCell>}
                      <TableHeaderCell style={{ width: '130px' }}>Método</TableHeaderCell>
                      <TableHeaderCell style={{ width: '120px', textAlign: 'right' }}>Total (Bs.)</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVentas.map(v => (
                      <TableRow 
                        key={`venta-${v.id_pedido}`}
                        style={{ 
                          borderBottom: `1px solid ${tokens.colorNeutralStroke3}`,
                          transition: 'background-color 0.15s ease'
                        }}
                      >
                        {/* Fecha y Hora */}
                        <TableCell>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600' }}>
                              {new Date(v.fecha_pedido).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </span>
                            <span style={{ fontSize: '11px', opacity: 0.65, marginTop: '2px' }}>
                              {new Date(v.fecha_pedido).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </TableCell>

                        {/* Comprador */}
                        <TableCell>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Avatar 
                              size={36} 
                              name={v.usuario_nombre || 'Usuario'} 
                              color="colorful"
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                              <span style={{ fontWeight: 'bold', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {v.usuario_nombre || `Usuario #${v.id_usuario}`}
                              </span>
                              <span style={{ fontSize: '11px', opacity: 0.7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {v.usuario_correo || 'Sin correo'}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Productos */}
                        <TableCell>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {(v.detalles || []).map(d => (
                              <div key={`det-${d.id_detalle}`} className={styles.productRow}>
                                <Badge 
                                  appearance="filled" 
                                  color="brand" 
                                  size="small" 
                                  style={{ marginTop: '2px', flexShrink: 0, fontWeight: 'bold' }}
                                >
                                  {d.cantidad}x
                                </Badge>
                                <div style={{ fontSize: '12px', lineHeight: 1.35 }}>
                                  <span style={{ fontWeight: '500' }}>
                                    {d.producto_nombre || `Producto #${d.id_producto}`}
                                  </span>
                                  {d.precio_unitario && (
                                    <span style={{ opacity: 0.6, fontSize: '11px', marginLeft: '6px' }}>
                                      (Bs. {Number(d.precio_unitario).toFixed(2)} c/u)
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </TableCell>

                        {/* Evento */}
                        {!eventoId && (
                          <TableCell>
                            {v.evento_titulo ? (
                              <div className={styles.eventBox} title={v.evento_titulo}>
                                <Calendar20Regular style={{ color: tokens.colorBrandForeground1, flexShrink: 0 }} />
                                <span style={{ fontSize: '12px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {v.evento_titulo}
                                </span>
                              </div>
                            ) : (
                              <Badge appearance="tint" color="subtle" size="small" style={{ opacity: 0.85 }}>
                                🛍️ Tienda / POS General
                              </Badge>
                            )}
                          </TableCell>
                        )}

                        {/* Método */}
                        <TableCell>
                          {renderMetodoBadge(v.metodo_pago)}
                        </TableCell>

                        {/* Total */}
                        <TableCell style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#10b981' }}>
                            Bs. {Number(v.total).toFixed(2)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </DialogContent>

          <DialogActions style={{ marginTop: '14px', width: '100%' }}>
            <div className={styles.footerBar}>
              <div style={{ fontSize: '12px', opacity: 0.65 }}>
                Mostrando <b>{filteredVentas.length}</b> de <b>{ventas.length}</b> transacciones registradas
              </div>
              <MEHButton appearance="primary" onClick={onClose} size="medium">
                Cerrar
              </MEHButton>
            </div>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default HistorialVentasSouvenirsModal;

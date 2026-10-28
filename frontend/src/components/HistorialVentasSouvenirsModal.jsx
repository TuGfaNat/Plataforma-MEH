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
  tokens,
  makeStyles
} from '@fluentui/react-components';
import {
  Box24Filled,
  Search24Regular,
  ArrowClockwise24Regular,
  Money24Filled,
  Calendar24Regular,
  Receipt24Regular
} from '@fluentui/react-icons';
import { MEHButton, MEHTypography } from './ui';
import adminService from '../services/adminService';
import { useNotify } from '../App';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    paddingTop: '8px',
  },
  kpiRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
  },
  kpiCard: {
    padding: '12px 16px',
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  tableWrapper: {
    maxHeight: '420px',
    overflowY: 'auto',
    borderRadius: '12px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
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
    const prods = (v.detalles || []).map(d => (d.producto_nombre || '').toLowerCase()).join(' ');
    return comprador.includes(term) || correo.includes(term) || evento.includes(term) || prods.includes(term);
  });

  const totalRecaudado = filteredVentas.reduce((acc, v) => acc + Number(v.total || 0), 0);
  const totalUnidades = filteredVentas.reduce((acc, v) => {
    const sumDet = (v.detalles || []).reduce((dAcc, d) => dAcc + Number(d.cantidad || 0), 0);
    return acc + sumDet;
  }, 0);

  return (
    <Dialog open={open} onOpenChange={(e, d) => { if (!d.open) onClose(); }}>
      <DialogSurface style={{ borderRadius: '20px', maxWidth: '820px', width: '100%' }}>
        <DialogBody>
          <DialogTitle>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Receipt24Regular style={{ color: tokens.colorBrandForeground1 }} />
                <span>
                  {eventoId ? `Ventas de Souvenirs en el Evento` : 'Historial de Ventas de Souvenirs'}
                </span>
              </div>
              <MEHButton
                size="small"
                appearance="subtle"
                icon={<ArrowClockwise24Regular />}
                onClick={fetchVentas}
                disabled={loading}
              >
                Actualizar
              </MEHButton>
            </div>
          </DialogTitle>

          <DialogContent className={styles.container}>
            {eventoTitulo && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: tokens.colorBrandBackground2, borderRadius: '8px' }}>
                <Calendar24Regular style={{ color: tokens.colorBrandForeground1 }} />
                <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{eventoTitulo}</span>
              </div>
            )}

            {/* KPIs Rápidos */}
            <div className={styles.kpiRow}>
              <div className={styles.kpiCard}>
                <MEHTypography variant="caption" style={{ opacity: 0.7 }}>Total Recaudado</MEHTypography>
                <MEHTypography variant="h3" style={{ color: tokens.colorPaletteGreenForeground1 }}>
                  Bs. {totalRecaudado.toFixed(2)}
                </MEHTypography>
              </div>
              <div className={styles.kpiCard}>
                <MEHTypography variant="caption" style={{ opacity: 0.7 }}>Unidades Vendidas</MEHTypography>
                <MEHTypography variant="h3" style={{ color: tokens.colorBrandForeground1 }}>
                  {totalUnidades} unid.
                </MEHTypography>
              </div>
              <div className={styles.kpiCard}>
                <MEHTypography variant="caption" style={{ opacity: 0.7 }}>Transacciones</MEHTypography>
                <MEHTypography variant="h3">
                  {filteredVentas.length}
                </MEHTypography>
              </div>
            </div>

            {/* Filtro de búsqueda */}
            <Input
              placeholder="Buscar por comprador, correo o producto..."
              contentBefore={<Search24Regular />}
              value={searchTerm}
              onChange={(e, d) => setSearchTerm(d.value)}
              style={{ width: '100%' }}
            />

            {/* Tabla de Ventas */}
            <div className={styles.tableWrapper}>
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <Spinner size="medium" label="Cargando historial de ventas..." />
                </div>
              ) : filteredVentas.length === 0 ? (
                <div style={{ padding: '36px', textAlign: 'center', opacity: 0.7 }}>
                  <Box24Filled fontSize={32} style={{ marginBottom: '8px' }} />
                  <div>No se encontraron registros de ventas de souvenirs.</div>
                </div>
              ) : (
                <Table size="small">
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>Fecha</TableHeaderCell>
                      <TableHeaderCell>Comprador</TableHeaderCell>
                      <TableHeaderCell>Productos (Stock descontado)</TableHeaderCell>
                      {!eventoId && <TableHeaderCell>Evento</TableHeaderCell>}
                      <TableHeaderCell>Método</TableHeaderCell>
                      <TableHeaderCell style={{ textAlign: 'right' }}>Total (Bs.)</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVentas.map(v => (
                      <TableRow key={`venta-${v.id_pedido}`}>
                        <TableCell style={{ fontSize: '12px' }}>
                          {new Date(v.fecha_pedido).toLocaleDateString()} {new Date(v.fecha_pedido).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </TableCell>
                        <TableCell>
                          <div style={{ fontWeight: 'bold' }}>{v.usuario_nombre || `Usuario #${v.id_usuario}`}</div>
                          <div style={{ fontSize: '11px', opacity: 0.7 }}>{v.usuario_correo}</div>
                        </TableCell>
                        <TableCell>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            {(v.detalles || []).map(d => (
                              <div key={`det-${d.id_detalle}`} style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Badge appearance="filled" color="brand" size="small">{d.cantidad}x</Badge>
                                <span>{d.producto_nombre || `Producto #${d.id_producto}`}</span>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        {!eventoId && (
                          <TableCell style={{ fontSize: '12px' }}>
                            {v.evento_titulo ? (
                              <Badge appearance="tint" color="informative" size="small">
                                {v.evento_titulo}
                              </Badge>
                            ) : (
                              <span style={{ opacity: 0.6 }}>General</span>
                            )}
                          </TableCell>
                        )}
                        <TableCell>
                          <Badge appearance="outline" size="small">{v.metodo_pago || 'EFECTIVO'}</Badge>
                        </TableCell>
                        <TableCell style={{ textAlign: 'right', fontWeight: 'bold', color: tokens.colorPaletteGreenForeground1 }}>
                          Bs. {Number(v.total).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </DialogContent>

          <DialogActions style={{ marginTop: '16px' }}>
            <MEHButton appearance="primary" onClick={onClose}>
              Cerrar
            </MEHButton>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default HistorialVentasSouvenirsModal;

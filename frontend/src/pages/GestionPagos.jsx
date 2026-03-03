import React, { useState, useEffect } from 'react';
import { 
  makeStyles, 
  shorthands, 
  tokens, 
  Table, 
  TableHeader, 
  TableRow, 
  TableHeaderCell, 
  TableBody, 
  TableCell,
  Spinner,
  Badge
} from '@fluentui/react-components';
import { 
  MoneySettings24Regular, 
  CheckmarkCircle24Regular,
  DismissCircle24Regular,
  Eye24Regular,
  Open24Regular
} from '@fluentui/react-icons';
import MainLayout from '../components/layout/MainLayout';
import { MEHCard, MEHButton, MEHTypography } from '../components/ui';
import pagoService from '../services/pagoService';

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
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  statusBadge: {
    fontWeight: 'bold',
  }
});

const GestionPagos = () => {
  const styles = useStyles();
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPagos();
  }, []);

  const fetchPagos = async () => {
    setLoading(true);
    try {
      const data = await pagoService.getAllPagos();
      setPagos(data);
    } catch (err) {
      console.error("Error fetching all payments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleValidar = async (idPago, nuevoEstado) => {
    try {
      await pagoService.validarPago(idPago, nuevoEstado);
      fetchPagos(); // Recargar lista
    } catch (err) {
      alert("Error al validar el pago");
    }
  };

  return (
    <MainLayout>
      <div className={styles.container}>
        <div>
          <div className={styles.header}>
            <MoneySettings24Regular style={{ color: tokens.colorBrandForeground1, fontSize: '32px' }} />
            <MEHTypography variant="h1">Gestión de Pagos</MEHTypography>
          </div>
          <MEHTypography variant="body" style={{ opacity: 0.6 }}>
            Valida los comprobantes subidos por los miembros para confirmar sus inscripciones.
          </MEHTypography>
        </div>

        <MEHCard>
          {loading ? (
            <Spinner label="Cargando todos los pagos..." />
          ) : pagos.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <Table>
                <TableHeader>
                  <TableRow style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <TableHeaderCell>ID Usuario</TableHeaderCell>
                    <TableHeaderCell>Referencia</TableHeaderCell>
                    <TableHeaderCell>Monto</TableHeaderCell>
                    <TableHeaderCell>Fecha</TableHeaderCell>
                    <TableHeaderCell>Comprobante</TableHeaderCell>
                    <TableHeaderCell>Estado</TableHeaderCell>
                    <TableHeaderCell>Acciones</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagos.map((pago) => (
                    <TableRow key={pago.id_pago}>
                      <TableCell>Member #{pago.id_usuario}</TableCell>
                      <TableCell>{pago.tipo_referencia} #{pago.id_referencia}</TableCell>
                      <TableCell><b>${pago.monto}</b></TableCell>
                      <TableCell>{new Date(pago.fecha_pago).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <MEHButton 
                          size="small" 
                          icon={<Open24Regular />} 
                          onClick={() => window.open(`http://localhost:8000/${pago.comprobante_url}`, '_blank')}
                        >
                          Ver Archivo
                        </MEHButton>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          appearance="tint" 
                          color={pago.estado_pago === 'APROBADO' ? 'success' : pago.estado_pago === 'RECHAZADO' ? 'danger' : 'warning'}
                        >
                          {pago.estado_pago}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {pago.estado_pago === 'PENDIENTE' && (
                            <>
                              <MEHButton 
                                size="small" 
                                appearance="primary" 
                                icon={<CheckmarkCircle24Regular />} 
                                onClick={() => handleValidar(pago.id_pago, 'APROBADO')}
                              >
                                Aprobar
                              </MEHButton>
                              <MEHButton 
                                size="small" 
                                appearance="outline" 
                                icon={<DismissCircle24Regular />} 
                                onClick={() => handleValidar(pago.id_pago, 'RECHAZADO')}
                              >
                                Rechazar
                              </MEHButton>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <MEHTypography variant="body" style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
              No hay pagos registrados en el sistema.
            </MEHTypography>
          )}
        </MEHCard>
      </div>
    </MainLayout>
  );
};

export default GestionPagos;

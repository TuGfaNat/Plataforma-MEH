import React, { useState, useEffect, useRef } from 'react';
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
  Badge,
  MessageBar
} from '@fluentui/react-components';
import { 
  MoneySettings24Regular, 
  CheckmarkCircle24Regular,
  DismissCircle24Regular,
  Open24Regular,
  DocumentArrowUpRegular
} from '@fluentui/react-icons';
import { MEHCard, MEHButton, MEHTypography } from '../components/ui';
import { useTranslation } from 'react-i18next';
import pagoService from '../services/pagoService';
import { resolveApiFileUrl } from '../services/api';
import { useAuth } from '../App';
import { hasPermission, PERMISSION_PAYMENTS_VALIDATE } from '../auth/rbac';

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
  },
  dropzone: {
    border: `2px dashed ${tokens.colorBrandForeground1}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: '32px',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: 'rgba(127, 19, 236, 0.05)',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: 'rgba(127, 19, 236, 0.1)'
    }
  }
});

const GestionPagos = () => {
  const styles = useStyles();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState(null);
  const [uploadingExtracto, setUploadingExtracto] = useState(false);
  const fileInputRef = useRef(null);

  const canValidatePayments = hasPermission(user?.rol, PERMISSION_PAYMENTS_VALIDATE);

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
      if (matches) {
        setMatches(matches.map(m => m.id_pago === idPago ? { ...m, procesado: true } : m));
      }
    } catch (err) {
      alert("Error al validar el pago");
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploadingExtracto(true);
      const resultados = await pagoService.procesarExtracto(file);
      setMatches(resultados);
    } catch (err) {
      alert("Error procesando el extracto CSV");
    } finally {
      setUploadingExtracto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
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

      {canValidatePayments && (
        <MEHCard>
          <MEHTypography variant="h3" style={{ marginBottom: '16px' }}>
            Validación Masiva (OCRM)
          </MEHTypography>
          <div 
            className={styles.dropzone}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              accept=".csv" 
              style={{ display: 'none' }} 
              onChange={handleFileUpload}
            />
            <DocumentArrowUpRegular style={{ fontSize: '48px', color: tokens.colorBrandForeground1, marginBottom: '16px' }} />
            <MEHTypography variant="h4">Haz clic para subir extracto bancario (.csv)</MEHTypography>
            <MEHTypography variant="body" style={{ opacity: 0.7 }}>
              El sistema cruzará los datos del banco con los pagos pendientes en el sistema.
            </MEHTypography>
            {uploadingExtracto && <Spinner style={{ marginTop: '16px' }} label="Procesando CSV..." />}
          </div>

          {matches && (
            <div style={{ marginTop: '24px' }}>
              <MEHTypography variant="h4" style={{ marginBottom: '16px' }}>Resultados del cruce de datos</MEHTypography>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>Fecha Banco</TableHeaderCell>
                    <TableHeaderCell>Descripción Banco</TableHeaderCell>
                    <TableHeaderCell>Monto</TableHeaderCell>
                    <TableHeaderCell>Match Sistema</TableHeaderCell>
                    <TableHeaderCell>Acción</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches.map((match, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{match.fecha_banco}</TableCell>
                      <TableCell>{match.descripcion_banco}</TableCell>
                      <TableCell>${match.monto_banco}</TableCell>
                      <TableCell>
                        {match.match_encontrado ? (
                          <Badge appearance="filled" color="success">
                            Match {match.similitud}%: {match.usuario_pago}
                          </Badge>
                        ) : (
                          <Badge appearance="tint" color="danger">Sin coincidencias</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {match.match_encontrado && !match.procesado && (
                          <MEHButton 
                            size="small" 
                            appearance="primary" 
                            icon={<CheckmarkCircle24Regular />}
                            onClick={() => handleValidar(match.id_pago, 'APROBADO')}
                          >
                            Aprobar
                          </MEHButton>
                        )}
                        {match.procesado && <Badge color="success">Procesado</Badge>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </MEHCard>
      )}

      <MEHCard>
        <MEHTypography variant="h3" style={{ marginBottom: '16px' }}>
          Todos los pagos
        </MEHTypography>
        {loading ? (
          <Spinner label="Cargando todos los pagos..." />
        ) : pagos.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <Table>
              <TableHeader>
                <TableRow style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <TableHeaderCell>Usuario</TableHeaderCell>
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
                        onClick={() => window.open(resolveApiFileUrl(pago.url_comprobante), '_blank')}
                      >
                        Ver Archivo
                      </MEHButton>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        appearance="tint" 
                        color={pago.estado_pago === 'APROBADO' ? 'success' : pago.estado_pago === 'RECHAZADO' ? 'danger' : 'warning'}
                      >
                        {t(`payment_${pago.estado_pago.toLowerCase()}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {pago.estado_pago === 'PENDIENTE' && canValidatePayments && (
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
  );
};

export default GestionPagos;

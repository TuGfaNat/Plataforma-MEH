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
  MessageBar,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Textarea,
  Field
} from '@fluentui/react-components';
import { 
  MoneySettings24Regular, 
  CheckmarkCircle24Regular,
  DismissCircle24Regular,
  Open24Regular,
  DocumentArrowUpRegular,
  ArrowUndo24Regular,
  History24Regular
} from '@fluentui/react-icons';
import { MEHCard, MEHButton, MEHTypography } from '../components/ui';
import PagoHistorialModal from '../components/PagoHistorialModal';
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

  const [reembolsoDialog, setReembolsoDialog] = useState({ open: false, idPago: null, motivo: '', loading: false });
  const [rechazoDialog, setRechazoDialog] = useState({ open: false, idPago: null, notas: '', loading: false });
  const [historialDialog, setHistorialDialog] = useState({ open: false, idPago: null });

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

  const handleValidar = async (idPago, nuevoEstado, notasAdmin = null) => {
    try {
      await pagoService.validarPago(idPago, nuevoEstado, notasAdmin);
      fetchPagos(); // Recargar lista
      if (matches) {
        setMatches(matches.map(m => m.id_pago === idPago ? { ...m, procesado: true } : m));
      }
    } catch (err) {
      alert("Error al validar el pago");
    }
  };

  const handleConfirmReembolsar = async () => {
    if (!reembolsoDialog.motivo.trim()) {
      alert("Debes ingresar un motivo para el reembolso.");
      return;
    }
    setReembolsoDialog(prev => ({ ...prev, loading: true }));
    try {
      await pagoService.reembolsarPago(reembolsoDialog.idPago, reembolsoDialog.motivo.trim());
      setReembolsoDialog({ open: false, idPago: null, motivo: '', loading: false });
      fetchPagos();
    } catch (err) {
      console.error("Error al reembolsar pago:", err);
      const detail = err.response?.data?.detail;
      alert(typeof detail === 'string' ? detail : "No se pudo procesar el reembolso.");
      setReembolsoDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const handleConfirmRechazar = async () => {
    setRechazoDialog(prev => ({ ...prev, loading: true }));
    try {
      await handleValidar(rechazoDialog.idPago, 'RECHAZADO', rechazoDialog.notas.trim() || null);
      setRechazoDialog({ open: false, idPago: null, notas: '', loading: false });
    } catch (err) {
      console.error("Error al rechazar pago:", err);
      setRechazoDialog(prev => ({ ...prev, loading: false }));
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
      alert("Error procesando el extracto bancario");
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
              accept=".csv,.xlsx" 
              style={{ display: 'none' }} 
              onChange={handleFileUpload}
            />
            <DocumentArrowUpRegular style={{ fontSize: '48px', color: tokens.colorBrandForeground1, marginBottom: '16px' }} />
            <MEHTypography variant="h4">Haz clic para subir extracto bancario (.csv, .xlsx)</MEHTypography>
            <MEHTypography variant="body" style={{ opacity: 0.7 }}>
              El sistema cruzará los datos del banco con los pagos pendientes en el sistema.
            </MEHTypography>
            {uploadingExtracto && <Spinner style={{ marginTop: '16px' }} label="Procesando archivo..." />}
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
                      <TableCell>Bs. {match.monto_banco}</TableCell>
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
                    <TableCell>
                      <div>
                        <MEHTypography style={{ fontWeight: '500' }}>{pago.nombre_usuario || `Usuario #${pago.id_usuario}`}</MEHTypography>
                        <MEHTypography variant="caption" style={{ opacity: 0.6, display: 'block' }}>ID: {pago.id_usuario}</MEHTypography>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <MEHTypography style={{ fontWeight: '500' }}>{pago.detalles_referencia || `${pago.tipo_referencia} #${pago.id_referencia}`}</MEHTypography>
                        <MEHTypography variant="caption" style={{ opacity: 0.6, display: 'block' }}>{pago.tipo_referencia} (Ref: #{pago.id_referencia})</MEHTypography>
                      </div>
                    </TableCell>
                    <TableCell><b>Bs. {pago.monto}</b></TableCell>
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
                        appearance={pago.estado_pago === 'VERIFICADO_AUTOMATICO' ? 'filled' : 'tint'}
                        color={
                          pago.estado_pago === 'VERIFICADO_AUTOMATICO' ? 'success' :
                          pago.estado_pago === 'APROBADO' ? 'success' :
                          pago.estado_pago === 'REVISION_MANUAL' ? 'warning' :
                          pago.estado_pago === 'PENDIENTE' ? 'danger' :
                          pago.estado_pago === 'RECHAZADO' ? 'danger' :
                          pago.estado_pago === 'REEMBOLSADO' ? 'informative' : 'warning'
                        }
                      >
                        {pago.estado_pago === 'REEMBOLSADO' ? 'Reembolsado' : (t(`payment_${pago.estado_pago.toLowerCase()}`) || pago.estado_pago)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {(pago.estado_pago === 'PENDIENTE' || pago.estado_pago === 'REVISION_MANUAL') && canValidatePayments && (
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
                              onClick={() => setRechazoDialog({ open: true, idPago: pago.id_pago, notas: '', loading: false })}
                            >
                              Rechazar
                            </MEHButton>
                          </>
                        )}
                        {(pago.estado_pago === 'APROBADO' || pago.estado_pago === 'VERIFICADO_AUTOMATICO') && canValidatePayments && (
                          <MEHButton
                            size="small"
                            appearance="subtle"
                            style={{ color: tokens.colorPaletteDarkOrangeForeground1 }}
                            icon={<ArrowUndo24Regular />}
                            onClick={() => setReembolsoDialog({ open: true, idPago: pago.id_pago, motivo: '', loading: false })}
                          >
                            Reembolsar
                          </MEHButton>
                        )}
                        <MEHButton
                          size="small"
                          appearance="subtle"
                          icon={<History24Regular />}
                          onClick={() => setHistorialDialog({ open: true, idPago: pago.id_pago })}
                        >
                          Historial
                        </MEHButton>
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

      {/* Modal Reembolso */}
      <Dialog open={reembolsoDialog.open} onOpenChange={(e, d) => setReembolsoDialog(prev => ({ ...prev, open: d.open }))}>
        <DialogSurface style={{ borderRadius: '16px', maxWidth: '520px' }}>
          <DialogBody>
            <DialogTitle>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowUndo24Regular style={{ color: tokens.colorPaletteDarkOrangeForeground1 }} />
                <span>Reembolsar Pago #{reembolsoDialog.idPago}</span>
              </div>
            </DialogTitle>
            <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
              <MEHTypography variant="body">
                ¿Estás seguro de emitir un reembolso manual? Esta acción registrará el reembolso, cancelará la inscripción asociada y notificará al participante.
              </MEHTypography>
              <Field label="Motivo del reembolso" required>
                <Textarea
                  value={reembolsoDialog.motivo}
                  onChange={(e, d) => setReembolsoDialog(prev => ({ ...prev, motivo: d.value }))}
                  placeholder="Ej: Solicitud del usuario por motivos de fuerza mayor"
                  rows={3}
                />
              </Field>
            </DialogContent>
            <DialogActions style={{ marginTop: '16px' }}>
              <Button appearance="secondary" onClick={() => setReembolsoDialog(prev => ({ ...prev, open: false }))} disabled={reembolsoDialog.loading}>
                Cancelar
              </Button>
              <MEHButton
                appearance="primary"
                style={{ backgroundColor: tokens.colorPaletteDarkOrangeBackground3 }}
                onClick={handleConfirmReembolsar}
                disabled={reembolsoDialog.loading || !reembolsoDialog.motivo.trim()}
              >
                {reembolsoDialog.loading ? <Spinner size="tiny" /> : 'Confirmar Reembolso'}
              </MEHButton>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Modal Rechazo con nota */}
      <Dialog open={rechazoDialog.open} onOpenChange={(e, d) => setRechazoDialog(prev => ({ ...prev, open: d.open }))}>
        <DialogSurface style={{ borderRadius: '16px', maxWidth: '500px' }}>
          <DialogBody>
            <DialogTitle>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DismissCircle24Regular style={{ color: tokens.colorPaletteRedForeground1 }} />
                <span>Rechazar Pago #{rechazoDialog.idPago}</span>
              </div>
            </DialogTitle>
            <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
              <MEHTypography variant="body">
                Indica el motivo del rechazo para que el usuario pueda corregirlo y subir un nuevo comprobante.
              </MEHTypography>
              <Field label="Motivo o notas del rechazo (opcional)">
                <Textarea
                  value={rechazoDialog.notas}
                  onChange={(e, d) => setRechazoDialog(prev => ({ ...prev, notas: d.value }))}
                  placeholder="Ej: Comprobante ilegible, monto no coincide..."
                  rows={3}
                />
              </Field>
            </DialogContent>
            <DialogActions style={{ marginTop: '16px' }}>
              <Button appearance="secondary" onClick={() => setRechazoDialog(prev => ({ ...prev, open: false }))} disabled={rechazoDialog.loading}>
                Cancelar
              </Button>
              <MEHButton
                appearance="primary"
                style={{ backgroundColor: tokens.colorPaletteRedBackground3 }}
                onClick={handleConfirmRechazar}
                disabled={rechazoDialog.loading}
              >
                {rechazoDialog.loading ? <Spinner size="tiny" /> : 'Rechazar Pago'}
              </MEHButton>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Modal Historial Timeline */}
      <PagoHistorialModal
        open={historialDialog.open}
        onOpenChange={(e, d) => setHistorialDialog({ open: d.open, idPago: null })}
        idPago={historialDialog.idPago}
      />
    </div>
  );
};

export default GestionPagos;

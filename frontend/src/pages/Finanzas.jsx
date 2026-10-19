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
  Input,
  Label,
  Spinner,
  Dropdown,
  Option,
  Badge,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Field
} from '@fluentui/react-components';
import { 
  Money24Regular, 
  Receipt24Regular, 
  ArrowUpload24Regular,
  CheckmarkCircle24Regular,
  Alert24Regular,
  ArrowRepeatAll24Regular,
  History24Regular,
  DismissCircle24Regular,
  ArrowUndo24Regular
} from '@fluentui/react-icons';
import PagoHistorialModal from '../components/PagoHistorialModal';
import { useTranslation } from 'react-i18next';
import { MEHCard, MEHButton, MEHTypography } from '../components/ui';
import { designTokens } from '../theme/theme';
import pagoService from '../services/pagoService';
import eventoService from '../services/eventoService';
import { resolveApiFileUrl } from '../services/api';
import { QRCodeSVG } from 'qrcode.react';

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
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 300px',
    ...shorthands.gap('24px'),
    [designTokens.breakpoints.md]: {
      gridTemplateColumns: '1fr',
    }
  },
  uploadArea: {
    ...shorthands.border('2px', 'dashed', tokens.colorBrandBackground),
    ...shorthands.borderRadius('12px'),
    ...shorthands.padding('32px'),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '16px',
    backgroundColor: 'rgba(127, 19, 236, 0.05)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: 'rgba(127, 19, 236, 0.1)',
    }
  }
});

const getEstadoColor = (estado) => {
  if (estado === 'APROBADO' || estado === 'VERIFICADO_AUTOMATICO') return tokens.colorPaletteGreenForeground1;
  if (estado === 'PENDIENTE') return tokens.colorPaletteYellowForeground1;
  if (estado === 'REEMBOLSADO') return tokens.colorBrandForeground1;
  return tokens.colorPaletteRedForeground1;
};

const getEstadoIcon = (estado) => {
  if (estado === 'APROBADO' || estado === 'VERIFICADO_AUTOMATICO') {
    return <CheckmarkCircle24Regular style={{ fontSize: '16px' }} />;
  }
  if (estado === 'REEMBOLSADO') {
    return <ArrowUndo24Regular style={{ fontSize: '16px' }} />;
  }
  return <Alert24Regular style={{ fontSize: '16px' }} />;
};

const Finanzas = () => {
  const styles = useStyles();
  const { t } = useTranslation();
  
  const [pagos, setPagos] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Formulario de carga
  const [selectedInscripcion, setSelectedInscripcion] = useState(null);
  const [monto, setMonto] = useState('');
  const [file, setFile] = useState(null);

  const [paymentPackages, setPaymentPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const [reintentoDialog, setReintentoDialog] = useState({ open: false, pago: null, file: null, uploading: false });
  const [historialDialog, setHistorialDialog] = useState({ open: false, idPago: null });

  useEffect(() => {
    if (selectedInscripcion) {
      fetchEventPaymentPackages(selectedInscripcion);
    } else {
      setPaymentPackages([]);
      setSelectedPackage(null);
      setMonto('');
    }
  }, [selectedInscripcion]);

  const fetchEventPaymentPackages = async (idEvento) => {
    try {
      const response = await pagoService.getEventPaymentPackages(idEvento);
      setPaymentPackages(response || []);
      setSelectedPackage(null);
      setMonto('');
    } catch (err) {
      console.error("Error fetching event payment packages:", err);
      setPaymentPackages([]);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pagosData, inscripcionesData] = await Promise.all([
        pagoService.getMisPagos(),
        eventoService.getMisInscripciones()
      ]);
      setPagos(pagosData);
      setInscripciones(inscripcionesData.filter(i => i.estado_inscripcion === 'PENDIENTE'));
    } catch (err) {
      console.error("Error fetching finanzas data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedInscripcion || !monto || !file) {
      alert("Por favor completa todos los campos y selecciona un archivo.");
      return;
    }

    setUploading(true);
    setSuccess(false);
    
    const formData = new FormData();
    formData.append('id_referencia', selectedInscripcion);
    formData.append('tipo_referencia', 'EVENTO');
    formData.append('monto', monto);
    formData.append('metodo_pago', 'TRANSFERENCIA');
    formData.append('file', file);

    try {
      await pagoService.uploadComprobanteOcr(formData);
      setSuccess(true);
      setFile(null);
      setMonto('');
      setSelectedInscripcion(null);
      await fetchData(); 
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error al subir comprobante:", err);
      alert("Error al subir comprobante. Inténtalo de nuevo.");
    } finally {
      setUploading(false);
    }
  };

  const handleReintentarSubmit = async () => {
    if (!reintentoDialog.pago || !reintentoDialog.file) {
      alert("Por favor selecciona un nuevo comprobante.");
      return;
    }

    setReintentoDialog(prev => ({ ...prev, uploading: true }));
    const formData = new FormData();
    formData.append('file', reintentoDialog.file);

    try {
      await pagoService.reintentarPago(reintentoDialog.pago.id_pago, formData);
      alert("Nuevo comprobante subido correctamente para revisión.");
      setReintentoDialog({ open: false, pago: null, file: null, uploading: false });
      await fetchData();
    } catch (err) {
      console.error("Error al reintentar comprobante:", err);
      const detail = err.response?.data?.detail;
      alert(typeof detail === 'string' ? detail : "Error al subir el nuevo comprobante.");
      setReintentoDialog(prev => ({ ...prev, uploading: false }));
    }
  };

  return (
    <div className={styles.container}>
      <div>
        <div className={styles.header}>
          <Money24Regular style={{ color: tokens.colorBrandForeground1, fontSize: '32px' }} />
          <MEHTypography variant="h1">Finanzas</MEHTypography>
        </div>
        <MEHTypography variant="body" style={{ opacity: 0.6 }}>
          Gestiona tus pagos, inscripciones y sube tus comprobantes.
        </MEHTypography>
      </div>

      <div className={styles.grid}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <MEHCard>
            <MEHTypography variant="h3" style={{ marginBottom: '16px', display: 'block' }}>Historial de Transacciones</MEHTypography>
            <div style={{ overflowX: 'auto' }}>
              {loading ? (
                <Spinner label="Cargando transacciones..." />
              ) : pagos.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      <TableHeaderCell>ID</TableHeaderCell>
                      <TableHeaderCell>Fecha</TableHeaderCell>
                      <TableHeaderCell>Referencia</TableHeaderCell>
                      <TableHeaderCell>Monto</TableHeaderCell>
                      <TableHeaderCell>Estado</TableHeaderCell>
                      <TableHeaderCell>Acciones</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagos.map((item) => (
                      <TableRow key={item.id_pago}>
                        <TableCell><MEHTypography variant="caption" style={{ fontFamily: 'monospace' }}>#{item.id_pago}</MEHTypography></TableCell>
                        <TableCell>{new Date(item.fecha_pago).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span style={{ fontWeight: '600', display: 'block' }}>
                            {item.detalles_referencia || `${item.tipo_referencia} #${item.id_referencia}`}
                          </span>
                          <span style={{ fontSize: '11px', opacity: 0.6 }}>
                            {item.tipo_referencia}
                          </span>
                        </TableCell>
                        <TableCell><b>Bs. {item.monto}</b></TableCell>
                        <TableCell>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ 
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              color: getEstadoColor(item.estado_pago)
                            }}>
                              {getEstadoIcon(item.estado_pago)}
                              <span>{item.estado_pago === 'REEMBOLSADO' ? 'Reembolsado' : item.estado_pago}</span>
                            </div>
                            {item.estado_pago === 'RECHAZADO' && item.notas_admin && (
                              <span style={{ fontSize: '11px', color: tokens.colorPaletteRedForeground1, maxWidth: '180px' }}>
                                Motivo: {item.notas_admin}
                              </span>
                            )}
                            {item.estado_pago === 'REEMBOLSADO' && item.motivo_reembolso && (
                              <span style={{ fontSize: '11px', opacity: 0.7, maxWidth: '180px' }}>
                                Motivo: {item.motivo_reembolso}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {item.estado_pago === 'RECHAZADO' && (
                              <MEHButton
                                size="small"
                                appearance="primary"
                                icon={<ArrowRepeatAll24Regular />}
                                onClick={() => setReintentoDialog({ open: true, pago: item, file: null, uploading: false })}
                              >
                                Reintentar
                              </MEHButton>
                            )}
                            <MEHButton
                              size="small"
                              appearance="subtle"
                              icon={<History24Regular />}
                              onClick={() => setHistorialDialog({ open: true, idPago: item.id_pago })}
                            >
                              Historial
                            </MEHButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <MEHTypography variant="caption" style={{ display: 'block', textAlign: 'center', padding: '20px', opacity: 0.5 }}>
                  No tienes transacciones registradas todavía.
                </MEHTypography>
              )}
            </div>
          </MEHCard>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <MEHCard style={{ background: 'linear-gradient(135deg, rgba(127, 19, 236, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%)' }}>
            <MEHTypography variant="caption" style={{ opacity: 0.8 }}>ESTADO DE CUENTA</MEHTypography>
            <MEHTypography variant="h1" style={{ margin: '8px 0', color: tokens.colorBrandForeground1 }}>
              {pagos.some(p => p.estado_pago === 'PENDIENTE') ? t('payment_pendiente') : 'Al Día'}
            </MEHTypography>
            <MEHTypography variant="body" style={{ opacity: 0.6 }}>
              {pagos.some(p => p.estado_pago === 'PENDIENTE') ? 'Tienes pagos en validación.' : 'No tienes pagos pendientes.'}
            </MEHTypography>
          </MEHCard>

          <MEHCard>
          <MEHTypography variant="h3" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Receipt24Regular /> Pagar Inscripción
          </MEHTypography>

          <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Label htmlFor="evento-select">Seleccionar Inscripción Pendiente</Label>
            <Dropdown
              id="evento-select"
              placeholder="Selecciona un evento"
              value={selectedInscripcion ? (inscripciones.find(ins => ins.id_evento.toString() === selectedInscripcion)?.evento?.titulo || `Evento #${selectedInscripcion}`) : ''}
              onOptionSelect={(e, data) => setSelectedInscripcion(data.optionValue)}
              style={{ width: '100%' }}
            >
              {inscripciones.map(ins => (
                <Option key={ins.id_inscripcion} value={ins.id_evento.toString()}>
                  {ins.evento?.titulo || `Evento #${ins.id_evento}`}
                </Option>
              ))}
            </Dropdown>
          </div>

          {selectedInscripcion && (() => {
            const ins = inscripciones.find(i => i.id_evento.toString() === selectedInscripcion);
            if (!ins || !ins.evento) return null;
            const ev = ins.evento;
            return (
              <div style={{
                marginBottom: '16px',
                padding: '12px 16px',
                backgroundColor: 'rgba(127, 19, 236, 0.05)',
                borderRadius: '8px',
                borderLeft: `4px solid ${tokens.colorBrandBackground}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <MEHTypography variant="body" style={{ fontWeight: 'bold', display: 'block' }}>
                  {ev.titulo}
                </MEHTypography>
                {ev.descripcion && (
                  <MEHTypography variant="caption" style={{ display: 'block', opacity: 0.7, marginBottom: '4px' }}>
                    {ev.descripcion}
                  </MEHTypography>
                )}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <MEHTypography variant="caption" style={{ opacity: 0.6 }}>
                    📅 <b>Fecha:</b> {new Date(ev.fecha_inicio).toLocaleDateString()} {ev.hora_inicio ? `a las ${ev.hora_inicio}` : ''}
                  </MEHTypography>
                  <MEHTypography variant="caption" style={{ opacity: 0.6 }}>
                    📍 <b>Modalidad:</b> {ev.modalidad} {ev.ubicacion ? `(${ev.ubicacion})` : ''}
                  </MEHTypography>
                </div>
              </div>
            );
          })()}

          {selectedInscripcion && (
              <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <Label htmlFor="tier-select">Paquete de Inscripción (Tiers)</Label>
                {paymentPackages.length > 0 ? (
                  <Dropdown
                      id="tier-select"
                      placeholder="Selecciona un paquete"
                      value={selectedPackage ? `${selectedPackage.nombre_paquete} - Bs. ${selectedPackage.monto}` : ''}
                      onOptionSelect={(e, data) => {
                          const pkg = paymentPackages.find(p => p.id_qr.toString() === data.optionValue);
                          setSelectedPackage(pkg);
                          setMonto(pkg.monto.toString());
                      }}
                      style={{ width: '100%' }}
                  >
                      {paymentPackages.map(pkg => (
                          <Option key={pkg.id_qr} value={pkg.id_qr.toString()}>
                              {pkg.nombre_paquete} - Bs. {pkg.monto}
                          </Option>
                      ))}
                  </Dropdown>
                ) : (
                  <Dropdown
                      id="tier-select"
                      placeholder="Selecciona un paquete"
                      value={monto ? `Bs. ${monto}` : ''}
                      onOptionSelect={(e, data) => {
                          setSelectedPackage(null);
                          setMonto(data.optionValue);
                      }}
                      style={{ width: '100%' }}
                  >
                      <Option value="50">Básico - Bs. 50.00</Option>
                      <Option value="100">VIP - Bs. 100.00</Option>
                      <Option value="150">Speaker Kit - Bs. 150.00</Option>
                  </Dropdown>
                )}
              </div>
          )}

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              {monto && (
                  <div style={{ textAlign: 'center', flex: 1, minWidth: '200px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px' }}>
                      <MEHTypography variant="body" style={{ display: 'block', marginBottom: '16px', fontWeight: 'bold' }}>Escanea para pagar: Bs. {monto}</MEHTypography>
                      <div style={{ display: 'inline-block', padding: '16px', backgroundColor: 'white', borderRadius: '8px' }}>
                          {selectedPackage ? (
                              <img src={resolveApiFileUrl(selectedPackage.url_qr)} alt="QR Bancario" style={{ width: '150px', height: '150px', objectFit: 'contain' }} />
                          ) : (
                              <QRCodeSVG value={`bank_transfer_meh_${monto}`} size={150} level="M" role="img" aria-label="QR Bancario" />
                          )}
                      </div>
                      <MEHTypography variant="caption" style={{ display: 'block', marginTop: '8px', opacity: 0.7 }}>
                          {selectedPackage ? `Paquete: ${selectedPackage.nombre_paquete}` : 'Banco MEH - Cuenta: 123456789'}
                      </MEHTypography>
                  </div>
              )}

              <div style={{ flex: 1, minWidth: '250px' }}>
                  <div 
                    className={styles.uploadArea} 
                    role="button"
                    tabIndex={0}
                    aria-label={file ? `Comprobante seleccionado: ${file.name}. Presiona Enter o Espacio para cambiar el archivo` : "Subir comprobante de pago"}
                    onClick={() => document.getElementById('file-upload')?.click()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        document.getElementById('file-upload')?.click();
                      }
                    }}
                    style={{ height: '100%', minHeight: '150px' }}
                  >
                    <ArrowUpload24Regular style={{ fontSize: '40px', color: tokens.colorBrandForeground1 }} aria-hidden="true" />
                    <MEHTypography variant="body" style={{ fontWeight: 'bold' }}>
                      {file ? file.name : 'Subir Comprobante'}
                    </MEHTypography>
                    <input 
                      type="file" 
                      style={{ display: 'none' }} 
                      id="file-upload" 
                      aria-label="Subir comprobante de pago"
                      onChange={handleFileChange} 
                    />
                  </div>
              </div>
          </div>

          {success && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: tokens.colorPaletteGreenForeground1, marginTop: '12px', justifyContent: 'center' }}>
              <CheckmarkCircle24Regular />
              <MEHTypography variant="caption">¡Enviado con éxito!</MEHTypography>
            </div>
          )}

          <MEHButton
            appearance="primary"
            style={{ width: '100%', marginTop: '16px' }}
            onClick={handleUpload}
            disabled={uploading || !file || !monto || !selectedInscripcion}
          >
            {uploading ? <Spinner size="tiny" /> : 'Enviar para validación'}
          </MEHButton>
          </MEHCard>
        </div>
      </div>

      {/* Modal Reintentar Comprobante Rechazado */}
      <Dialog open={reintentoDialog.open} onOpenChange={(e, d) => setReintentoDialog(prev => ({ ...prev, open: d.open }))}>
        <DialogSurface style={{ borderRadius: '16px', maxWidth: '520px' }}>
          <DialogBody>
            <DialogTitle>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowRepeatAll24Regular style={{ color: tokens.colorBrandForeground1 }} />
                <span>Reintentar Comprobante (Pago #{reintentoDialog.pago?.id_pago})</span>
              </div>
            </DialogTitle>
            <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
              <MEHTypography variant="body">
                Tu comprobante anterior fue rechazado. Sube una nueva imagen legible o documento PDF de la transferencia para validar tu inscripción.
              </MEHTypography>

              {reintentoDialog.pago?.notas_admin && (
                <div style={{ padding: '12px', backgroundColor: 'rgba(219, 44, 44, 0.1)', borderRadius: '8px', borderLeft: `4px solid ${tokens.colorPaletteRedBackground3}` }}>
                  <MEHTypography variant="caption" style={{ color: tokens.colorPaletteRedForeground1, fontWeight: 'bold', display: 'block' }}>
                    Motivo del rechazo:
                  </MEHTypography>
                  <MEHTypography variant="caption">
                    {reintentoDialog.pago.notas_admin}
                  </MEHTypography>
                </div>
              )}

              <Field label="Nuevo Comprobante de Pago" required>
                <Input
                  id="reintento-file-input"
                  aria-label="Nuevo Comprobante de Pago"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setReintentoDialog(prev => ({ ...prev, file: e.target.files[0] || null }))}
                />
              </Field>
            </DialogContent>
            <DialogActions style={{ marginTop: '16px' }}>
              <Button
                appearance="secondary"
                onClick={() => setReintentoDialog(prev => ({ ...prev, open: false }))}
                disabled={reintentoDialog.uploading}
              >
                Cancelar
              </Button>
              <MEHButton
                appearance="primary"
                onClick={handleReintentarSubmit}
                disabled={reintentoDialog.uploading || !reintentoDialog.file}
              >
                {reintentoDialog.uploading ? <Spinner size="tiny" /> : 'Enviar Nuevo Comprobante'}
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

export default Finanzas;

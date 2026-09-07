import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogBody,
  DialogActions,
  Label,
  Input,
  Spinner,
  MessageBar,
  MessageBarBody,
  tokens,
  Dropdown,
  Option,
  makeStyles,
  shorthands,
  Badge
} from '@fluentui/react-components';
import { ReceiptMoney24Filled, Dismiss24Regular, Attach24Regular, ArrowDownload24Regular, Gift24Regular, People24Regular, CheckmarkCircle24Regular } from '@fluentui/react-icons';
import { MEHButton, MEHTypography } from './ui';
import { useNotify } from '../App';
import pagoService from '../services/pagoService';
import eventoService from '../services/eventoService';
import { resolveApiFileUrl } from '../services/api';

const useStyles = makeStyles({
  freeContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '20px',
    backgroundColor: 'rgba(34, 177, 76, 0.04)',
    ...shorthands.borderRadius('16px'),
    ...shorthands.border('1px', 'solid', 'rgba(34, 177, 76, 0.12)'),
    width: '100%',
    boxSizing: 'border-box'
  },
  waitlistContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '20px',
    backgroundColor: 'rgba(255, 185, 0, 0.06)',
    ...shorthands.borderRadius('16px'),
    ...shorthands.border('1px', 'solid', 'rgba(255, 185, 0, 0.25)'),
    width: '100%',
    boxSizing: 'border-box'
  },
  paidContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '100%',
    boxSizing: 'border-box'
  },
  incluidosBanner: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '16px',
    backgroundColor: 'rgba(127, 19, 236, 0.08)',
    ...shorthands.borderRadius('14px'),
    ...shorthands.border('1px', 'solid', 'rgba(127, 19, 236, 0.22)'),
    width: '100%',
    boxSizing: 'border-box'
  },
  qrSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '20px',
    background: 'linear-gradient(135deg, rgba(127, 19, 236, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
    ...shorthands.borderRadius('16px'),
    ...shorthands.border('1px', 'solid', 'rgba(127, 19, 236, 0.15)'),
    width: '100%',
    boxSizing: 'border-box'
  },
  qrImage: {
    maxWidth: '260px',
    width: '100%',
    height: 'auto',
    borderRadius: '12px',
    border: '6px solid #FFFFFF',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    objectFit: 'contain',
    ':hover': {
      transform: 'scale(1.03)',
      boxShadow: '0 12px 28px rgba(127, 19, 236, 0.4)',
    }
  },
  uploadArea: {
    ...shorthands.border('2px', 'dashed', 'rgba(127, 19, 236, 0.3)'),
    ...shorthands.borderRadius('16px'),
    padding: '24px',
    textAlign: 'center',
    position: 'relative',
    cursor: 'pointer',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    transition: 'all 0.2s ease-in-out',
    width: '100%',
    boxSizing: 'border-box',
    ':hover': {
      backgroundColor: 'rgba(127, 19, 236, 0.04)',
      ...shorthands.borderColor(tokens.colorBrandStroke1),
    }
  },
  fileInput: {
    opacity: 0,
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    cursor: 'pointer'
  }
});

const InscripcionEventoModal = ({ 
  evento, 
  onInscribed, 
  trigger, 
  buttonText, 
  buttonSize = "medium", 
  buttonAppearance = "primary" 
}) => {
  const styles = useStyles();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingPackages, setCheckingPackages] = useState(false);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [file, setFile] = useState(null);
  const [isQrZoomed, setIsQrZoomed] = useState(false);
  const { notify } = useNotify();

  const cuposMax = evento?.capacidad_maxima ?? evento?.capacidad_max;
  const cuposOcupados = evento?.cupos_ocupados ?? 0;
  const cuposDisponibles = evento?.cupos_disponibles !== undefined 
    ? evento.cupos_disponibles 
    : (cuposMax ? Math.max(0, cuposMax - cuposOcupados) : undefined);
  const isSoldOut = cuposDisponibles !== undefined ? cuposDisponibles <= 0 : false;

  const parseIncluidos = () => {
    const list = [];
    if (evento?.refrigerio_incluido) {
      list.push('Refrigerio');
    }
    if (evento?.incluidos) {
      if (typeof evento.incluidos === 'string') {
        const parts = evento.incluidos.split(',').map(s => s.trim()).filter(Boolean);
        for (const p of parts) {
          if (!list.some(existing => existing.toLowerCase() === p.toLowerCase())) {
            list.push(p);
          }
        }
      } else if (Array.isArray(evento.incluidos)) {
        for (const p of evento.incluidos) {
          if (p && !list.some(existing => existing.toLowerCase() === String(p).trim().toLowerCase())) {
            list.push(String(p).trim());
          }
        }
      }
    }
    return list;
  };

  const incluidosList = parseIncluidos();

  const handleDownloadQr = async () => {
    if (!selectedPackage?.url_qr) return;
    try {
      const url = resolveApiFileUrl(selectedPackage.url_qr);
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `QR_${evento.titulo.replace(/\s+/g, '_')}_${selectedPackage.nombre_paquete.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading QR:", error);
      window.open(resolveApiFileUrl(selectedPackage.url_qr), '_blank');
    }
  };

  useEffect(() => {
    if (isOpen && evento?.id_evento && !isSoldOut) {
      const fetchPackages = async () => {
        setCheckingPackages(true);
        try {
          const res = await pagoService.getEventPaymentPackages(evento.id_evento);
          setPackages(res || []);
          setSelectedPackage(null);
          setFile(null);
        } catch (err) {
          console.error("Error fetching packages:", err);
          setPackages([]);
        } finally {
          setCheckingPackages(false);
        }
      };
      fetchPackages();
    }
  }, [isOpen, evento?.id_evento, isSoldOut]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleConfirmar = async () => {
    setLoading(true);
    try {
      // Caso 1: Cupos agotados -> Ingreso a lista de espera
      if (isSoldOut) {
        await eventoService.inscribirse(evento.id_evento);
        notify(
          "Lista de espera", 
          "Te has registrado en la Lista de Espera (PENDIENTE_APROBACION). Si el organizador amplía los cupos y aprueba tu registro, recibirás la confirmación.", 
          "info"
        );
        setIsOpen(false);
        if (onInscribed) onInscribed();
        return;
      }

      const isPaid = packages.length > 0;

      // Caso 2: Evento de pago
      if (isPaid) {
        if (!selectedPackage) {
          notify("Validación", "Debes seleccionar un paquete de inscripción", "warning");
          setLoading(false);
          return;
        }
        if (!file) {
          notify("Validación", "Debes adjuntar el comprobante de pago", "warning");
          setLoading(false);
          return;
        }

        const inscripcionResponse = await eventoService.inscribirse(evento.id_evento);
        const idInscripcion = inscripcionResponse.id_inscripcion;

        const formData = new FormData();
        formData.append('id_referencia', idInscripcion);
        formData.append('tipo_referencia', 'EVENTO');
        formData.append('monto', selectedPackage.monto);
        formData.append('metodo_pago', 'TRANSFERENCIA');
        formData.append('file', file);

        await pagoService.uploadComprobanteOcr(formData);
        notify(
          "Comprobante enviado", 
          "Inscripción registrada. Tu ticket QR se activará automáticamente una vez verificado el pago.", 
          "success"
        );
      } else {
        // Caso 3: Evento gratuito con cupo disponible
        await eventoService.inscribirse(evento.id_evento);
        notify(
          "Inscripción confirmada", 
          "¡Te has inscrito con éxito! Se ha generado tu ticket QR único y te lo enviamos por correo electrónico.", 
          "success"
        );
      }

      setIsOpen(false);
      if (onInscribed) onInscribed();
    } catch (err) {
      console.error("Error procesando inscripción:", err);
      const detail = err.response?.data?.detail;
      notify("Error", typeof detail === "string" ? detail : "No se pudo procesar la inscripción", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(e, d) => setIsOpen(d.open)}>
      {trigger ? (
        <DialogTrigger disableButtonEnhancement>
          {trigger}
        </DialogTrigger>
      ) : (
        <DialogTrigger disableButtonEnhancement>
          <MEHButton 
            appearance={buttonAppearance} 
            size={buttonSize} 
            icon={<ReceiptMoney24Filled />}
          >
            {buttonText || (isSoldOut ? "Lista de Espera" : "Inscribirme")}
          </MEHButton>
        </DialogTrigger>
      )}
      <DialogSurface style={{ backgroundColor: '#17171B', border: '1px solid rgba(127, 19, 236, 0.25)', borderRadius: '20px', maxWidth: '520px', width: '100%' }}>
        <DialogBody>
          <DialogTitle 
            style={{ color: tokens.colorNeutralForeground1, fontWeight: 'bold' }}
            action={<MEHButton appearance="subtle" icon={<Dismiss24Regular />} onClick={() => setIsOpen(false)} />}
          >
            Inscripción: {evento.titulo}
          </DialogTitle>
          
          {checkingPackages ? (
            <div style={{ padding: '40px', textAlign: 'center', width: '100%' }}>
              <Spinner label="Verificando modalidad y cupos del evento..." />
            </div>
          ) : (
            <DialogContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box', padding: '8px 0', overflowX: 'hidden' }}>
                
                {/* Indicador de Cupos */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <People24Regular style={{ color: tokens.colorBrandForeground1 }} />
                    <MEHTypography variant="caption" style={{ fontWeight: 'bold' }}>
                      Cupos: {cuposOcupados} / {cuposMax || 'Ilimitados'}
                    </MEHTypography>
                  </div>
                  {isSoldOut ? (
                    <Badge appearance="filled" color="warning">Cupos Agotados</Badge>
                  ) : cuposDisponibles !== undefined ? (
                    <Badge appearance="tint" color="success">{cuposDisponibles} disponibles</Badge>
                  ) : null}
                </div>

                {/* Ítems Incluidos Dinámicos */}
                {incluidosList.length > 0 && (
                  <div className={styles.incluidosBanner}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Gift24Regular style={{ color: tokens.colorBrandForeground1 }} />
                      <MEHTypography variant="body" style={{ fontWeight: 'bold', fontSize: '13px' }}>
                        Incluido con tu pase de entrada:
                      </MEHTypography>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {incluidosList.map((item, idx) => (
                        <Badge key={idx} appearance="outline" color="brand" icon={<CheckmarkCircle24Regular />}>
                          {item}
                        </Badge>
                      ))}
                    </div>
                    <MEHTypography variant="caption" style={{ opacity: 0.75, fontSize: '11px', marginTop: '2px' }}>
                      Tu código QR único servirá para acreditar tu ingreso y reclamar todos los ítems incluidos en los puntos de control.
                    </MEHTypography>
                  </div>
                )}

                {/* Estado de Inscripción según disponibilidad */}
                {isSoldOut ? (
                  // --- LISTA DE ESPERA (CUPOS AGOTADOS) ---
                  <div className={styles.waitlistContainer}>
                    <MessageBar intent="warning" layout="multiline" style={{ borderRadius: '10px', width: '100%' }}>
                      <MessageBarBody>
                        ⚠️ <b>Los cupos principales para este evento están completos.</b>
                      </MessageBarBody>
                    </MessageBar>
                    <MEHTypography variant="body" style={{ opacity: 0.9, lineHeight: 1.5, fontSize: '13px' }}>
                      Al unirte ingresarás en la <b>Lista de Espera</b> (estado <i>PENDIENTE_APROBACION</i>). No necesitas realizar ningún pago ahora. Si el organizador amplía los cupos y aprueba tu solicitud, serás notificado para habilitar tu pase.
                    </MEHTypography>
                  </div>
                ) : packages.length === 0 ? (
                  // --- EVENTO GRATUITO ---
                  <div className={styles.freeContainer}>
                    <MessageBar intent="success" layout="multiline" style={{ borderRadius: '10px', width: '100%' }}>
                      <MessageBarBody>
                        🎉 Este evento es gratuito y de libre acceso. No necesitas comprobante ni realizar ningún pago.
                      </MessageBarBody>
                    </MessageBar>
                    <MEHTypography variant="body" style={{ textAlign: 'center', opacity: 0.9, width: '100%', fontSize: '13px' }}>
                      Al confirmar, se emitirá tu código QR único de participante inmediatamente y se enviará a tu correo electrónico.
                    </MEHTypography>
                  </div>
                ) : (
                  // --- EVENTO DE PAGO ---
                  <div className={styles.paidContainer}>
                    <MEHTypography variant="body" style={{ opacity: 0.8, fontSize: '13px' }}>
                      Este evento requiere inscripción de pago. Selecciona un paquete y transfiere al código QR bancario oficial:
                    </MEHTypography>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                      <Label required htmlFor="paquete-select" style={{ fontWeight: '600' }}>Selecciona tu Paquete</Label>
                      <Dropdown
                        id="paquete-select"
                        placeholder="Selecciona un paquete de inscripción"
                        style={{ width: '100%' }}
                        onOptionSelect={(e, data) => {
                          const pkg = packages.find(p => p.id_qr.toString() === data.optionValue);
                          setSelectedPackage(pkg);
                        }}
                      >
                        {packages.map(pkg => (
                          <Option key={pkg.id_qr} value={pkg.id_qr.toString()}>
                            {pkg.nombre_paquete} — Bs. {pkg.monto}
                          </Option>
                        ))}
                      </Dropdown>
                    </div>

                    {selectedPackage && (
                      <div className={styles.qrSection}>
                        <MEHTypography variant="body" style={{ fontWeight: 'bold', color: tokens.colorBrandForeground1, fontSize: '15px' }}>
                          Monto a transferir: Bs. {selectedPackage.monto}
                        </MEHTypography>
                        
                        {selectedPackage.url_qr ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
                            <img 
                              src={resolveApiFileUrl(selectedPackage.url_qr)} 
                              alt="QR de Pago" 
                              className={styles.qrImage} 
                              onClick={() => setIsQrZoomed(true)}
                              title="Haz clic para ampliar y descargar"
                            />
                            <MEHTypography variant="caption" style={{ opacity: 0.8, marginTop: '4px', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setIsQrZoomed(true)}>
                              🔍 Haz clic en la imagen para ampliar o descargar QR de pago
                            </MEHTypography>
                          </div>
                        ) : (
                          <MessageBar intent="warning" layout="multiline" style={{ borderRadius: '10px', width: '100%' }}>
                            <MessageBarBody>
                              No se cargó imagen de QR para este paquete.
                            </MessageBarBody>
                          </MessageBar>
                        )}
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                      <Label required style={{ fontWeight: '600' }}>Comprobante de Pago (PDF/JPG/PNG)</Label>
                      <div className={styles.uploadArea}>
                        <Input 
                          type="file" 
                          onChange={handleFileChange} 
                          className={styles.fileInput}
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <Attach24Regular style={{ fontSize: '36px', color: tokens.colorBrandForeground1, marginBottom: '10px', opacity: 0.8 }} />
                        <MEHTypography variant="caption" style={{ display: 'block', fontWeight: 'bold' }}>
                          {file ? file.name : "Haz clic para seleccionar o arrastra el archivo aquí"}
                        </MEHTypography>
                      </div>
                    </div>

                    <MessageBar intent="info" layout="multiline" style={{ borderRadius: '10px', width: '100%' }}>
                      <MessageBarBody>
                        Al aprobarse tu pago, recibirás tu código QR logístico único por correo y en tu dashboard.
                      </MessageBarBody>
                    </MessageBar>
                  </div>
                )}
              </div>
            </DialogContent>
          )}

          <DialogActions style={{ marginTop: '16px' }}>
            <MEHButton appearance="outline" onClick={() => setIsOpen(false)}>Cancelar</MEHButton>
            <MEHButton 
              appearance="primary" 
              loading={loading} 
              disabled={checkingPackages}
              onClick={handleConfirmar}
            >
              {isSoldOut 
                ? "Unirme a Lista de Espera" 
                : packages.length === 0 
                  ? "Confirmar Inscripción" 
                  : "Subir y Confirmar"}
            </MEHButton>
          </DialogActions>

          {/* Dialog para Ampliar Código QR Bancario */}
          <Dialog open={isQrZoomed} onOpenChange={(e, d) => setIsQrZoomed(d.open)}>
            <DialogSurface style={{ backgroundColor: '#17171B', border: '1px solid rgba(127, 19, 236, 0.25)', borderRadius: '20px', maxWidth: '460px', width: '100%', padding: '16px' }}>
              <DialogBody>
                <DialogTitle 
                  style={{ color: tokens.colorNeutralForeground1, fontWeight: 'bold' }}
                  action={<MEHButton appearance="subtle" icon={<Dismiss24Regular />} onClick={() => setIsQrZoomed(false)} />}
                >
                  Código QR Bancario: {selectedPackage?.nombre_paquete}
                </DialogTitle>
                <DialogContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '16px 0' }}>
                  <img 
                    src={selectedPackage ? resolveApiFileUrl(selectedPackage.url_qr) : ''} 
                    alt="QR Bancario Ampliado" 
                    style={{ 
                      width: '100%', 
                      maxWidth: '380px', 
                      height: 'auto',
                      maxHeight: '65vh',
                      objectFit: 'contain',
                      backgroundColor: '#FFFFFF', 
                      borderRadius: '16px', 
                      padding: '8px', 
                      boxSizing: 'border-box',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                      border: '1px solid rgba(0,0,0,0.1)'
                    }} 
                  />
                  <MEHTypography variant="body" style={{ opacity: 0.9, textAlign: 'center' }}>
                    Escanea este código con tu aplicación bancaria para transferir <b>Bs. {selectedPackage?.monto}</b>.
                  </MEHTypography>
                </DialogContent>
                <DialogActions style={{ justifyContent: 'center', gap: '12px', marginTop: '8px' }}>
                  <MEHButton 
                    appearance="primary" 
                    icon={<ArrowDownload24Regular />} 
                    onClick={handleDownloadQr}
                  >
                    Descargar QR
                  </MEHButton>
                  <MEHButton appearance="outline" onClick={() => setIsQrZoomed(false)}>
                    Cerrar
                  </MEHButton>
                </DialogActions>
              </DialogBody>
            </DialogSurface>
          </Dialog>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default InscripcionEventoModal;

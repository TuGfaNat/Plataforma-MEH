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
  shorthands
} from '@fluentui/react-components';
import { ReceiptMoney24Filled, Dismiss24Regular, Attach24Regular, ArrowDownload24Regular } from '@fluentui/react-icons';
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
  paidContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
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

const InscripcionEventoModal = ({ evento, onInscribed }) => {
  const styles = useStyles();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingPackages, setCheckingPackages] = useState(false);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [file, setFile] = useState(null);
  const [isQrZoomed, setIsQrZoomed] = useState(false);
  const { notify } = useNotify();

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
      // Fallback: open in new tab
      window.open(resolveApiFileUrl(selectedPackage.url_qr), '_blank');
    }
  };

  useEffect(() => {
    if (isOpen && evento?.id_evento) {
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
  }, [isOpen, evento?.id_evento]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleConfirmar = async () => {
    const isPaid = packages.length > 0;

    if (isPaid) {
      if (!selectedPackage) {
        notify("Validación", "Debes seleccionar un paquete de inscripción", "warning");
        return;
      }
      if (!file) {
        notify("Validación", "Debes adjuntar el comprobante de pago", "warning");
        return;
      }
    }

    setLoading(true);
    try {
      // 1. Inscribir al evento
      const inscripcionResponse = await eventoService.inscribirse(evento.id_evento);
      const idInscripcion = inscripcionResponse.id_inscripcion;

      // 2. Si es de pago, subir comprobante y asociarlo al pago
      if (isPaid) {
        const formData = new FormData();
        formData.append('id_referencia', idInscripcion);
        formData.append('tipo_referencia', 'EVENTO');
        formData.append('monto', selectedPackage.monto);
        formData.append('metodo_pago', 'TRANSFERENCIA');
        formData.append('file', file);

        await pagoService.uploadComprobanteOcr(formData);
        notify("Éxito", "Inscripción registrada y comprobante enviado. Pendiente de verificación.", "success");
      } else {
        notify("Éxito", "Te has inscrito correctamente en este evento gratuito.", "success");
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
      <DialogTrigger disableButtonEnhancement>
        <MEHButton appearance="primary" icon={<ReceiptMoney24Filled />}>Inscribirme</MEHButton>
      </DialogTrigger>
      <DialogSurface style={{ backgroundColor: '#17171B', border: '1px solid rgba(127, 19, 236, 0.25)', borderRadius: '20px', maxWidth: '520px', width: '100%' }}>
        <DialogBody>
          <DialogTitle 
            style={{ color: tokens.colorNeutralForeground1, fontWeight: 'bold' }}
            action={<MEHButton appearance="subtle" icon={<Dismiss24Regular />} onClick={() => setIsOpen(false)} />}
          >
            Inscripción a: {evento.titulo}
          </DialogTitle>
          
          {checkingPackages ? (
            <div style={{ padding: '40px', textAlign: 'center', width: '100%' }}>
              <Spinner label="Verificando modalidad del evento..." />
            </div>
          ) : (
            <DialogContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', boxSizing: 'border-box', padding: '8px 0', overflowX: 'hidden' }}>
                {packages.length === 0 ? (
                  // --- EVENTO GRATUITO ---
                  <div className={styles.freeContainer}>
                    <MessageBar intent="success" layout="multiline" style={{ borderRadius: '10px', width: '100%' }}>
                      <MessageBarBody>
                        🎉 Este evento es gratuito y de libre acceso. No necesitas comprobante ni realizar ningún pago.
                      </MessageBarBody>
                    </MessageBar>
                    <MEHTypography variant="body" style={{ textAlign: 'center', opacity: 0.9, width: '100%' }}>
                      Al confirmar, se registrará tu pase de entrada inmediatamente. ¡Te esperamos!
                    </MEHTypography>
                  </div>
                ) : (
                  // --- EVENTO DE PAGO ---
                  <div className={styles.paidContainer}>
                    <MEHTypography variant="body" style={{ opacity: 0.8 }}>
                      Este evento requiere una inscripción previa de pago. Selecciona un paquete y escanea el código QR oficial correspondiente:
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
                              🔍 Haz clic en la imagen para ampliar o descargar
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
                        Tamaño máximo permitido del archivo: 5MB.
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
              {packages.length === 0 ? "Confirmar Inscripción" : "Subir y Confirmar"}
            </MEHButton>
          </DialogActions>

          {/* Dialog para Ampliar Código QR */}
          <Dialog open={isQrZoomed} onOpenChange={(e, d) => setIsQrZoomed(d.open)}>
            <DialogSurface style={{ backgroundColor: '#17171B', border: '1px solid rgba(127, 19, 236, 0.25)', borderRadius: '20px', maxWidth: '460px', width: '100%', padding: '16px' }}>
              <DialogBody>
                <DialogTitle 
                  style={{ color: tokens.colorNeutralForeground1, fontWeight: 'bold' }}
                  action={<MEHButton appearance="subtle" icon={<Dismiss24Regular />} onClick={() => setIsQrZoomed(false)} />}
                >
                  Código QR: {selectedPackage?.nombre_paquete}
                </DialogTitle>
                <DialogContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '16px 0' }}>
                  <img 
                    src={selectedPackage ? resolveApiFileUrl(selectedPackage.url_qr) : ''} 
                    alt="QR Ampliado" 
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

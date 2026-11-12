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
import * as offlineDb from '../utils/offlineDb';
import { resolveApiFileUrl } from '../services/api';
import { getEventoCoverByContext } from '../utils/eventoImagen';

const FREE_OPTION = {
  id_qr: 'FREE',
  nombre_paquete: 'Solo Entrada Gratuita',
  monto: 0,
  es_individual: false,
  es_gratuito: true,
  descripcion: 'Acceso general al evento sin costo. No incluye paquete de bienvenida ni souvenirs.'
};

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
  const [tipoOpcion, setTipoOpcion] = useState('TODOS');
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
  const paquetes = packages.filter(p => !p.es_individual);
  const individuales = packages.filter(p => p.es_individual);
  const displayedPackages = packages.filter(p => {
    if (tipoOpcion === 'PAQUETES') return !p.es_individual;
    if (tipoOpcion === 'INDIVIDUALES') return p.es_individual;
    if (tipoOpcion === 'GRATIS') return false;
    return true;
  });

  const handleDownloadQr = async () => {
    if (!selectedPackage?.url_qr) return;
    try {
      const url = resolveApiFileUrl(selectedPackage.url_qr);
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `QR_${evento.titulo.replace(/\s+/g, '_')}_${(selectedPackage.es_individual ? 'Item_' : 'Paquete_')}${selectedPackage.nombre_paquete.replace(/\s+/g, '_')}.png`;
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
          const pkgs = res || [];
          setPackages(pkgs);
          setSelectedPackage(FREE_OPTION);
          setFile(null);
          const paqs = pkgs.filter(p => !p.es_individual);
          const inds = pkgs.filter(p => p.es_individual);
          if (paqs.length > 0 && inds.length === 0) {
            setTipoOpcion('TODOS');
          } else if (inds.length > 0 && paqs.length === 0) {
            setTipoOpcion('TODOS');
          } else {
            setTipoOpcion('TODOS');
          }
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

  const guardarInscripcionOffline = async (esFallback = false) => {
    try {
      const offRes = await offlineDb.agregarInscripcionOffline({
        id_evento: evento.id_evento,
        titulo_evento: evento.titulo,
      });
      if (offRes.alreadyEnqueued) {
        notify("Cola Offline", "Esta inscripción ya se encuentra en tu cola de sincronización.", "info");
      } else {
        notify(
          "Inscripción Offline Guardada",
          esFallback
            ? "Fallo de conexión. Tu inscripción ha sido guardada en la cola local para sincronizarse."
            : "Te encuentras sin conexión a red. Tu solicitud se ha guardado en la cola local y se sincronizará automáticamente.",
          "info"
        );
      }
      setIsOpen(false);
      if (onInscribed) onInscribed();
      return true;
    } catch (offErr) {
      console.error("Error al guardar en cola offline:", offErr);
      if (!esFallback) {
        notify("Error Offline", "No se pudo guardar la inscripción en la base local", "error");
      }
      return false;
    }
  };

  const procesarEventoPago = async () => {
    if (!selectedPackage || selectedPackage.es_gratuito) {
      return true;
    }
    if (!file) {
      notify("Validación", "Debes adjuntar el comprobante de pago", "warning");
      return false;
    }

    const inscripcionResponse = await eventoService.inscribirse(evento.id_evento);
    const idInscripcion = inscripcionResponse.id_inscripcion;

    const formData = new FormData();
    formData.append('id_referencia', idInscripcion);
    formData.append('tipo_referencia', 'EVENTO');
    formData.append('monto', selectedPackage.monto);
    formData.append('metodo_pago', 'TRANSFERENCIA');
    const descTipo = selectedPackage.es_individual ? 'Ítem Individual' : 'Paquete';
    formData.append('notas_admin', `${descTipo}: ${selectedPackage.nombre_paquete}`);
    formData.append('file', file);

    await pagoService.uploadComprobanteOcr(formData);
    notify(
      "Comprobante enviado", 
      "Inscripción registrada. Tu ticket QR se activará automáticamente una vez verificado el pago.", 
      "success"
    );
    return true;
  };

  const handleConfirmar = async () => {
    setLoading(true);
    const isPaid = Boolean(selectedPackage && !selectedPackage.es_gratuito && Number(selectedPackage.monto) > 0);
    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

    // Manejo Offline para eventos gratuitos / lista de espera
    if (!isPaid && isOffline) {
      try {
        await guardarInscripcionOffline(false);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      if (isSoldOut) {
        await eventoService.inscribirse(evento.id_evento);
        notify(
          "Lista de espera", 
          "Te has registrado en la Lista de Espera (PENDIENTE_APROBACION). Si el organizador amplía los cupos y aprueba tu registro, recibirás la confirmación.", 
          "info"
        );
      } else if (isPaid) {
        const ok = await procesarEventoPago();
        if (!ok) {
          setLoading(false);
          return;
        }
      } else {
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

      const isNetworkFail = !err.response || err.code === 'ERR_NETWORK' || !navigator.onLine;
      if (!isPaid && isNetworkFail) {
        const enqueued = await guardarInscripcionOffline(true);
        if (enqueued) return;
      }

      const detail = err.response?.data?.detail;
      const statusCode = err.response?.status;
      const errorTitle = statusCode === 409 ? "Conflicto en Inscripción (409)" : "Error";
      notify(errorTitle, typeof detail === "string" ? detail : "No se pudo procesar la inscripción", "error");
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
                <img
                  src={getEventoCoverByContext(evento, '16:9')}
                  alt={`Portada de ${evento.titulo}`}
                  style={{
                    width: '100%',
                    aspectRatio: '16 / 9',
                    maxHeight: '160px',
                    objectFit: 'cover',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                />
                
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
                  // --- OPCIONES DE APORTE Y ENTRADA GRATUITA ---
                  <div className={styles.paidContainer}>
                    <MEHTypography variant="body" style={{ opacity: 0.8, fontSize: '13px' }}>
                      La entrada a este evento es 100% gratuita. De forma opcional, puedes adquirir un paquete de bienvenida completo o un ítem individual desglosado:
                    </MEHTypography>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <Label required htmlFor="paquete-select" style={{ fontWeight: 'bold', fontSize: '14px' }}>
                          Selecciona tu Paquete o Ítem Individual:
                        </Label>
                        {selectedPackage && (
                          <Badge appearance="tint" color={selectedPackage.es_gratuito ? 'success' : (selectedPackage.es_individual ? 'informative' : 'brand')}>
                            {selectedPackage.es_gratuito ? '🎟️ Acceso Libre' : (selectedPackage.es_individual ? '🏷️ Ítem' : '📦 Paquete')}: {selectedPackage.nombre_paquete}
                          </Badge>
                        )}
                      </div>

                      {/* Filtro por pestañas si existen tanto paquetes como individuales */}
                      {paquetes.length > 0 && individuales.length > 0 && (
                        <div style={{ display: 'flex', gap: '8px', padding: '4px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '12px', width: 'fit-content', flexWrap: 'wrap' }}>
                          <MEHButton
                            size="small"
                            appearance={tipoOpcion === 'TODOS' ? 'primary' : 'subtle'}
                            onClick={() => setTipoOpcion('TODOS')}
                          >
                            Todos ({packages.length + 1})
                          </MEHButton>
                          <MEHButton
                            size="small"
                            appearance={tipoOpcion === 'GRATIS' ? 'primary' : 'subtle'}
                            onClick={() => {
                              setTipoOpcion('GRATIS');
                              setSelectedPackage(FREE_OPTION);
                            }}
                          >
                            🎟️ Solo Gratis
                          </MEHButton>
                          <MEHButton
                            size="small"
                            appearance={tipoOpcion === 'PAQUETES' ? 'primary' : 'subtle'}
                            onClick={() => setTipoOpcion('PAQUETES')}
                          >
                            📦 Paquetes ({paquetes.length})
                          </MEHButton>
                          <MEHButton
                            size="small"
                            appearance={tipoOpcion === 'INDIVIDUALES' ? 'primary' : 'subtle'}
                            onClick={() => setTipoOpcion('INDIVIDUALES')}
                          >
                            🏷️ Ítems Individuales ({individuales.length})
                          </MEHButton>
                        </div>
                      )}

                      {/* Tarjetas interactivas de paquetes e ítems para compra clara */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                        {/* Opción Gratuita siempre disponible */}
                        {(tipoOpcion === 'TODOS' || tipoOpcion === 'GRATIS') && (
                          <div
                            key="card-free-entry"
                            onClick={() => {
                              setSelectedPackage(FREE_OPTION);
                              setFile(null);
                            }}
                            style={{
                              padding: '14px',
                              borderRadius: '12px',
                              border: selectedPackage?.es_gratuito ? `2px solid ${tokens.colorPaletteGreenBorder1}` : '1px solid rgba(255,255,255,0.1)',
                              backgroundColor: selectedPackage?.es_gratuito ? 'rgba(34, 177, 76, 0.16)' : 'rgba(255,255,255,0.03)',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px',
                              transition: 'all 0.18s ease',
                              boxShadow: selectedPackage?.es_gratuito ? '0 4px 16px rgba(34, 177, 76, 0.25)' : 'none',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                              <Badge appearance="filled" color="success" size="small">
                                🎟️ Acceso Libre
                              </Badge>
                              {selectedPackage?.es_gratuito ? (
                                <Badge color="success" appearance="filled" size="small">✓ Elegido</Badge>
                              ) : (
                                <Badge appearance="outline" size="small">Elegir</Badge>
                              )}
                            </div>
                            <div style={{ fontWeight: 'bold', fontSize: '14px', lineHeight: '1.2' }}>
                              Solo Entrada Gratuita
                            </div>
                            <div style={{ fontSize: '12px', opacity: 0.75, lineHeight: 1.3 }}>
                              Asistencia al evento sin costo. No incluye paquete de bienvenida ni souvenirs.
                            </div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: tokens.colorPaletteGreenForeground1, marginTop: 'auto' }}>
                              Bs. 0 (Gratis)
                            </div>
                          </div>
                        )}

                        {displayedPackages.map(pkg => {
                          const isSelected = selectedPackage?.id_qr === pkg.id_qr;
                          return (
                            <div
                              key={pkg.id_qr}
                              onClick={() => setSelectedPackage(pkg)}
                              style={{
                                padding: '14px',
                                borderRadius: '12px',
                                border: isSelected ? `2px solid ${tokens.colorBrandStroke1}` : '1px solid rgba(255,255,255,0.1)',
                                backgroundColor: isSelected ? 'rgba(127, 19, 236, 0.18)' : 'rgba(255,255,255,0.03)',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                transition: 'all 0.18s ease',
                                boxShadow: isSelected ? '0 4px 16px rgba(127, 19, 236, 0.3)' : 'none',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                                <Badge
                                  appearance="filled"
                                  color={pkg.es_individual ? 'informative' : 'brand'}
                                  size="small"
                                >
                                  {pkg.es_individual ? '🏷️ Ítem Suelto' : '📦 Paquete'}
                                </Badge>
                                {isSelected ? (
                                  <Badge color="brand" appearance="filled" size="small">✓ Elegido</Badge>
                                ) : (
                                  <Badge appearance="outline" size="small">Elegir</Badge>
                                )}
                              </div>
                              <div style={{ fontWeight: 'bold', fontSize: '14px', lineHeight: '1.2' }}>
                                {pkg.nombre_paquete}
                              </div>
                              {pkg.descripcion && (
                                <div style={{ fontSize: '12px', opacity: 0.75, lineHeight: 1.3 }}>
                                  {pkg.descripcion}
                                </div>
                              )}
                              <div style={{ fontSize: '20px', fontWeight: 'bold', color: tokens.colorBrandForeground1, marginTop: 'auto' }}>
                                Bs. {pkg.monto}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Dropdown oculto para compatibilidad con selectores accesibles y tests */}
                      <Dropdown
                        id="paquete-select"
                        placeholder="Selecciona un paquete o ítem de inscripción"
                        style={{ display: 'none' }}
                        value={selectedPackage ? (selectedPackage.es_gratuito ? 'Solo Entrada Gratuita — Bs. 0' : `${selectedPackage.nombre_paquete} — Bs. ${selectedPackage.monto}`) : ''}
                        onOptionSelect={(e, data) => {
                          if (data.optionValue === 'FREE') {
                            setSelectedPackage(FREE_OPTION);
                          } else {
                            const pkg = packages.find(p => p.id_qr.toString() === data.optionValue);
                            if (pkg) setSelectedPackage(pkg);
                          }
                        }}
                      >
                        <Option key="FREE" value="FREE">🎟️ Solo Entrada Gratuita — Bs. 0</Option>
                        {packages.map(pkg => (
                          <Option key={pkg.id_qr} value={pkg.id_qr.toString()}>
                            {pkg.es_individual ? '🏷️ ' : '📦 '}{pkg.nombre_paquete} — Bs. {pkg.monto}
                          </Option>
                        ))}
                      </Dropdown>
                    </div>

                    {/* Detalle de opción seleccionada */}
                    {selectedPackage?.es_gratuito ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', padding: '16px', backgroundColor: 'rgba(34, 177, 76, 0.08)', borderRadius: '12px', border: '1px solid rgba(34, 177, 76, 0.25)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <CheckmarkCircle24Regular style={{ color: tokens.colorPaletteGreenForeground1, fontSize: '24px', flexShrink: 0 }} />
                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: '14px', color: tokens.colorPaletteGreenForeground1 }}>
                              🎟️ Inscripción 100% Gratuita Seleccionada
                            </div>
                            <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '2px' }}>
                              El acceso al evento es libre. No requieres realizar ningún pago ni transferir por QR. Al confirmar, recibirás tu ticket QR oficial directamente.
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : selectedPackage ? (
                      <div className={styles.qrSection}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                          <Badge appearance="filled" color={selectedPackage.es_individual ? 'informative' : 'brand'}>
                            {selectedPackage.es_individual ? '🏷️ Ítem Individual' : '📦 Paquete'}
                          </Badge>
                          <MEHTypography variant="body" style={{ fontWeight: 'bold', color: tokens.colorBrandForeground1, fontSize: '15px' }}>
                            {selectedPackage.nombre_paquete} — Monto: Bs. {selectedPackage.monto}
                          </MEHTypography>
                        </div>

                        {/* Desglose de contenido para paquetes completos */}
                        {!selectedPackage.es_individual && selectedPackage.descripcion && (
                          <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', maxWidth: '440px', textAlign: 'left', width: '100%' }}>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', color: tokens.colorBrandForeground1 }}>
                              📦 Contenido Incluido en este Paquete:
                            </div>
                            <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '2px' }}>
                              {selectedPackage.descripcion}
                            </div>
                            {individuales.length > 0 && (
                              <div style={{ fontSize: '11px', opacity: 0.75, marginTop: '6px' }}>
                                💡 Si solo deseas un ítem suelto de este paquete, puedes seleccionarlo en la pestaña <b>🏷️ Ítems Individuales</b> con su respectivo QR.
                              </div>
                            )}
                          </div>
                        )}

                        {selectedPackage.es_individual && selectedPackage.descripcion && (
                          <div style={{ backgroundColor: 'rgba(0, 120, 212, 0.08)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(0, 120, 212, 0.2)', maxWidth: '440px', textAlign: 'left', width: '100%' }}>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', color: tokens.colorInformationForeground1 }}>
                              🏷️ Ítem Individual Desglosado:
                            </div>
                            <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '2px' }}>
                              {selectedPackage.descripcion}
                            </div>
                          </div>
                        )}
                        
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
                              No se cargó imagen de QR para esta opción.
                            </MessageBarBody>
                          </MessageBar>
                        )}
                      </div>
                    ) : null}

                    {/* Subida de comprobante solo requerida para paquetes o ítems de pago */}
                    {selectedPackage && !selectedPackage.es_gratuito && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Label required style={{ fontWeight: '600' }}>Comprobante de Pago (PDF/JPG/PNG)</Label>
                          {file && (
                            <Badge appearance="tint" color="success">
                              Archivo cargado ({(file.size / 1024).toFixed(0)} KB)
                            </Badge>
                          )}
                        </div>
                        <div className={styles.uploadArea}>
                          <Input 
                            type="file" 
                            onChange={handleFileChange} 
                            className={styles.fileInput}
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                          <Attach24Regular style={{ fontSize: '36px', color: tokens.colorBrandForeground1, marginBottom: '6px', opacity: 0.85 }} />
                          <MEHTypography variant="caption" style={{ display: 'block', fontWeight: 'bold', fontSize: '13px' }}>
                            {file ? `✓ ${file.name}` : "Haz clic para seleccionar o tomar foto de tu comprobante"}
                          </MEHTypography>
                          <span style={{ fontSize: '11px', opacity: 0.7 }}>
                            Sube la captura de pantalla o PDF de la transferencia bancaria
                          </span>
                        </div>

                        <MessageBar intent="info" layout="multiline" style={{ borderRadius: '10px', width: '100%' }}>
                          <MessageBarBody>
                            Al aprobarse tu pago, recibirás tu código QR logístico único por correo y en tu dashboard.
                          </MessageBarBody>
                        </MessageBar>
                      </div>
                    )}
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
              disabled={checkingPackages || (Boolean(selectedPackage && !selectedPackage.es_gratuito) && !file)}
              onClick={handleConfirmar}
            >
              {isSoldOut 
                ? "Unirme a Lista de Espera" 
                : packages.length === 0 || selectedPackage?.es_gratuito
                  ? "Confirmar Entrada Gratuita" 
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
                  Código QR Bancario: {selectedPackage?.es_individual ? '🏷️ Ítem ' : '📦 Paquete '}{selectedPackage?.nombre_paquete}
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
                    Escanea este código con tu aplicación bancaria para transferir <b>Bs. {selectedPackage?.monto}</b> por el {selectedPackage?.es_individual ? 'ítem individual' : 'paquete'} <b>"{selectedPackage?.nombre_paquete}"</b>.
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

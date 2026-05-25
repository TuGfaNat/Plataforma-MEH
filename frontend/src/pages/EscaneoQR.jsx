import React, { useEffect, useRef, useState } from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Spinner,
  Field,
  Input,
  TabList,
  Tab,
  Select,
  Switch,
} from '@fluentui/react-components';
import {
  CheckmarkCircle24Filled,
  Warning24Regular,
  PersonAvailable24Regular,
  QrCode24Regular,
  ScanCamera24Regular,
  Keyboard24Regular,
  ArrowUpload24Regular,
  ArrowDownload24Regular,
  Wifi124Regular,
  WifiOff24Regular,
} from '@fluentui/react-icons';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QRCodeSVG } from 'qrcode.react';
import { MEHCard, MEHButton, MEHTypography } from '../components/ui';

import asistenciaService from '../services/asistenciaService';
import * as offlineDb from '../utils/offlineDb';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    animationName: {
      from: { opacity: 0, transform: 'translateY(10px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    animationDuration: '0.4s',
  },
  scannerContainer: {
    width: '100%',
    maxWidth: '520px',
    backgroundColor: '#000',
    ...shorthands.borderRadius('14px'),
    overflow: 'hidden',
    ...shorthands.border('2px', 'solid', tokens.colorBrandBackground),
  },
  panel: {
    width: '100%',
    maxWidth: '720px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  resultOk: {
    marginTop: '12px',
    color: tokens.colorPaletteGreenForeground1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    textAlign: 'center',
  },
  resultError: {
    marginTop: '12px',
    color: tokens.colorPaletteRedForeground1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    textAlign: 'center',
  },
  localGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '16px',
    '@media (max-width: 900px)': {
      gridTemplateColumns: '1fr',
    },
  },
  generatorCard: {
    ...shorthands.padding('16px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3),
    ...shorthands.borderRadius('12px'),
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  connectionBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '20px',
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  onlineBadge: {
    backgroundColor: 'rgba(16, 124, 65, 0.15)',
    color: tokens.colorPaletteGreenForeground1,
    border: `1px solid rgba(16, 124, 65, 0.3)`,
  },
  offlineBadge: {
    backgroundColor: 'rgba(216, 59, 1, 0.15)',
    color: tokens.colorPaletteRedForeground1,
    border: `1px solid rgba(216, 59, 1, 0.3)`,
  },
  syncContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.padding('16px'),
    ...shorthands.borderRadius('12px'),
    marginTop: '8px',
    border: `1px solid ${tokens.colorNeutralBackground3}`,
  },
  syncActions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  syncSuccess: {
    color: tokens.colorPaletteGreenForeground1,
    fontSize: '0.95rem',
    fontWeight: 'bold',
  }
});

const EscaneoQR = () => {
  const styles = useStyles();
  const [mode, setMode] = useState('camera');
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [generatorValue, setGeneratorValue] = useState('');
  const [eventos, setEventos] = useState([]);
  const [selectedEvento, setSelectedEvento] = useState('');
  const [checkpoints, setCheckpoints] = useState([]);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState('');
  const scannerRef = useRef(null);

  // Estados Offline-First
  const [forceOffline, setForceOffline] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const [syncingStatus, setSyncingStatus] = useState('');
  const [localSyncMessage, setLocalSyncMessage] = useState('');

  const updateQueueCount = async () => {
    try {
      const cola = await offlineDb.obtenerColaAsistencia();
      setOfflineQueueCount(cola.length);
    } catch (err) {
      console.error('Error al leer el tamaño de la cola offline', err);
    }
  };

  useEffect(() => {
    const fetchActividades = async () => {
      try {
        const data = await asistenciaService.getActividades();
        setEventos(data.eventos || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchActividades();
    updateQueueCount();
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      if (!forceOffline) {
        setIsOfflineMode(false);
      }
    };
    const handleOffline = () => {
      setIsOfflineMode(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOfflineMode(!navigator.onLine || forceOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [forceOffline]);

  const handleEventoChange = async (e, data) => {
    setSelectedEvento(data.value);
    setSelectedCheckpoint('');
    if (data.value) {
      try {
        if (isOfflineMode || forceOffline) {
          const db = await offlineDb.abrirDB();
          const transaction = db.transaction(['eventos'], 'readonly');
          const store = transaction.objectStore('eventos');
          const req = store.get(parseInt(data.value));
          req.onsuccess = (ev) => {
            if (ev.target.result) {
              setCheckpoints(ev.target.result.checkpoints || []);
            } else {
              setCheckpoints([]);
            }
          };
        } else {
          const cpData = await asistenciaService.getCheckpoints(data.value);
          setCheckpoints(cpData);
        }
      } catch (err) {
        console.error("Error cargando checkpoints", err);
      }
    } else {
      setCheckpoints([]);
    }
  };

  const normalizeQrPayload = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return '';

    try {
      const asUrl = new URL(raw);
      const codigo = asUrl.searchParams.get('codigo_qr') || asUrl.searchParams.get('token_qr');
      return codigo || raw;
    } catch (_) {
      const directMatch = raw.match(/(?:codigo_qr|token_qr)=([^&\s]+)/i);
      return directMatch ? decodeURIComponent(directMatch[1]) : raw;
    }
  };

  useEffect(() => {
    if (mode !== 'camera') {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
      return;
    }

    if (scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      'reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        if (loading) return;
        const normalizedCode = normalizeQrPayload(decodedText);
        if (!normalizedCode) return;
        handleAsistencia(normalizedCode);
      },
      () => {}
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [mode, loading, isOfflineMode]);

  const handleAsistencia = async (codigoQR) => {
    const normalizedCode = normalizeQrPayload(codigoQR);
    if (!normalizedCode) {
      setError('Código QR vacío o inválido');
      return;
    }

    setLoading(true);
    setError(null);
    setScanResult(null);

    // MODO OFFLINE
    if (isOfflineMode) {
      try {
        if (!selectedEvento) {
          setError('Debe seleccionar un evento para validar en modo Offline');
          setTimeout(() => setError(null), 4000);
          return;
        }
        const res = await offlineDb.validarQROffline(normalizedCode, selectedCheckpoint, selectedEvento);
        if (res.success) {
          setScanResult(`${res.message}: ${res.usuario.nombre}`);
          setTimeout(() => setScanResult(null), 4000);
          updateQueueCount();
        } else {
          setError(res.message);
          setTimeout(() => setError(null), 4500);
        }
      } catch (err) {
        console.error(err);
        setError('Error al acceder a la base de datos IndexedDB local');
        setTimeout(() => setError(null), 4500);
      } finally {
        setLoading(false);
      }
      return;
    }

    // MODO ONLINE
    try {
      const result = await asistenciaService.registrarPorQR(normalizedCode, selectedCheckpoint ? parseInt(selectedCheckpoint) : null);
      setScanResult(`Asistencia de ${result.usuario.nombre} confirmada para ${result.evento.titulo}`);
      setTimeout(() => setScanResult(null), 4000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error en el registro');
      setTimeout(() => setError(null), 4500);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    await handleAsistencia(manualCode);
  };

  const handleDownloadOfflineData = async () => {
    if (!selectedEvento) {
      setError('Debe seleccionar un evento para descargar su base local');
      return;
    }
    setLoading(true);
    setError(null);
    setLocalSyncMessage('');
    try {
      const registrados = await asistenciaService.getInscritosConfirmados(selectedEvento);
      const ev = eventos.find(e => e.id_evento === parseInt(selectedEvento));
      const nombre = ev ? ev.titulo : 'Evento';
      
      await offlineDb.guardarInscritos(parseInt(selectedEvento), nombre, registrados, checkpoints);
      
      setLocalSyncMessage(`¡Caché Sincronizada! ${registrados.length} registrados y ${checkpoints.length} checkpoints guardados para uso Offline.`);
      setTimeout(() => setLocalSyncMessage(''), 6000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Error al descargar datos del evento');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncQueue = async () => {
    setLoading(true);
    setError(null);
    setLocalSyncMessage('');
    setSyncingStatus('Iniciando sincronización...');
    try {
      const cola = await offlineDb.obtenerColaAsistencia();
      if (cola.length === 0) {
        setSyncingStatus('');
        setLoading(false);
        return;
      }

      let exitosos = 0;
      let fallidos = 0;

      for (const item of cola) {
        setSyncingStatus(`Subiendo ${exitosos + fallidos + 1}/${cola.length}: ${item.nombre_completo}...`);
        try {
          await asistenciaService.registrarPorQR(item.codigo_qr, item.id_checkpoint);
          await offlineDb.eliminarDeCola(item.id);
          exitosos++;
        } catch (err) {
          console.error('Error al sincronizar registro offline:', item, err);
          fallidos++;
          const detail = err.response?.data?.detail || '';
          if (detail.includes('ya fue escaneada') || detail.includes('Ya se registró asistencia')) {
            await offlineDb.eliminarDeCola(item.id);
          } else {
            setError(`Fallo de conexión al sincronizar a ${item.nombre_completo}: ${detail || 'Servidor no disponible'}`);
            break;
          }
        }
      }

      setSyncingStatus('');
      await updateQueueCount();
      if (exitosos > 0) {
        setLocalSyncMessage(`Sincronización finalizada. Éxito: ${exitosos}, Fallos/Duplicados: ${fallidos}.`);
        setTimeout(() => setLocalSyncMessage(''), 6000);
      }
    } catch (err) {
      console.error(err);
      setError('Error general durante la sincronización de asistencia');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
      setSyncingStatus('');
    }
  };

  return (
    <div className={styles.container}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <PersonAvailable24Regular style={{ color: tokens.colorBrandForeground1, fontSize: '32px' }} />
          <MEHTypography variant="h1">Escaneo QR de Asistencia</MEHTypography>
        </div>
        <MEHTypography variant="body" style={{ opacity: 0.7 }}>
          Flujo local para eventos: escaneo por cámara, ingreso manual y sincronización offline en campus.
        </MEHTypography>
        
        {/* Connection Status Badge & Forced Switch */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '8px' }}>
          <div className={`${styles.connectionBadge} ${isOfflineMode ? styles.offlineBadge : styles.onlineBadge}`}>
            {isOfflineMode ? (
              <>
                <WifiOff24Regular />
                <span>MODO OFFLINE ACTIVADO</span>
              </>
            ) : (
              <>
                <Wifi124Regular />
                <span>SISTEMA EN LÍNEA</span>
              </>
            )}
          </div>
          <Switch
            label="Forzar Modo Offline"
            checked={forceOffline}
            onChange={(e, d) => setForceOffline(d.checked)}
          />
        </div>
      </div>

      <MEHCard className={styles.panel}>
        <TabList selectedValue={mode} onTabSelect={(e, d) => setMode(d.value)}>
          <Tab value="camera" icon={<ScanCamera24Regular />}>Escanear Cámara</Tab>
          <Tab value="manual" icon={<Keyboard24Regular />}>Ingreso Manual (Evento)</Tab>
          <Tab value="generator" icon={<QrCode24Regular />}>Generador QR Evento</Tab>
        </TabList>

        {/* Offline Management Panel */}
        <div className={styles.syncContainer}>
          <MEHTypography variant="h3">Gestión de Asistencia Offline (IndexedDB)</MEHTypography>
          <MEHTypography variant="body" style={{ opacity: 0.8 }}>
            Descarga la base de registrados mientras tengas red. Podrás escanear en sótanos sin internet y sincronizar la cola después.
          </MEHTypography>
          <div className={styles.syncActions}>
            <MEHButton
              appearance={isOfflineMode ? 'outline' : 'primary'}
              disabled={isOfflineMode || !selectedEvento || loading}
              icon={<ArrowDownload24Regular />}
              onClick={handleDownloadOfflineData}
            >
              Descargar Datos para Offline
            </MEHButton>
            
            {offlineQueueCount > 0 && (
              <MEHButton
                appearance="primary"
                disabled={isOfflineMode || loading}
                icon={<ArrowUpload24Regular />}
                onClick={handleSyncQueue}
                style={{ backgroundColor: tokens.colorPaletteGreenBackground }}
              >
                Sincronizar Cola ({offlineQueueCount} pendientes)
              </MEHButton>
            )}
          </div>
          {syncingStatus && <Spinner size="tiny" label={syncingStatus} />}
          {localSyncMessage && <span className={styles.syncSuccess}>{localSyncMessage}</span>}
        </div>

        <div style={{ width: '100%', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
          <Field label="Evento Actual">
            <Select value={selectedEvento} onChange={handleEventoChange}>
              <option value="">-- Seleccionar Evento --</option>
              {eventos.map(e => (
                <option key={e.id_evento} value={e.id_evento}>{e.titulo}</option>
              ))}
            </Select>
          </Field>
          {selectedEvento && (
            <Field label="Checkpoint (Opcional - Ej. Refrigerio)">
              <Select value={selectedCheckpoint} onChange={(e, data) => setSelectedCheckpoint(data.value)}>
                <option value="">-- Entrada Principal (Asistencia) --</option>
                {checkpoints.map(cp => (
                  <option key={cp.id_checkpoint} value={cp.id_checkpoint}>{cp.nombre_checkpoint}</option>
                ))}
              </Select>
            </Field>
          )}
        </div>

        {mode === 'camera' && (
          <>
            <div id="reader" className={styles.scannerContainer}></div>
            <MEHTypography variant="caption" style={{ opacity: 0.7, textAlign: 'center' }}>
              Ideal para celular o laptop con cámara. Si escaneas una URL, se extrae automáticamente el `codigo_qr` del evento.
            </MEHTypography>
          </>
        )}

        {mode === 'manual' && (
          <div className={styles.localGrid}>
            <div className={styles.generatorCard}>
              <MEHTypography variant="h3">Registrar por Código de Evento</MEHTypography>
              <Field label="Código QR o URL con codigo_qr/token_qr">
                <Input
                  value={manualCode}
                  onChange={(e, d) => setManualCode(d.value)}
                  placeholder="Pega aquí el código o URL"
                />
              </Field>
              <MEHButton appearance="primary" onClick={handleManualSubmit} disabled={loading}>
                Registrar Asistencia
              </MEHButton>
            </div>

            <div className={styles.generatorCard}>
              <MEHTypography variant="h3">Tip de prueba local</MEHTypography>
              <MEHTypography variant="body" style={{ opacity: 0.8 }}>
                1. Genera un QR en la pestaña "Generador Local". 2. Escanéalo desde otro dispositivo o pega su valor aquí.
              </MEHTypography>
            </div>
          </div>
        )}

        {mode === 'generator' && (
          <div className={styles.localGrid}>
            <div className={styles.generatorCard}>
              <MEHTypography variant="h3">Generar QR de Evento (Prueba)</MEHTypography>
              <Field label="Valor del QR del evento">
                <Input
                  value={generatorValue}
                  onChange={(e, d) => setGeneratorValue(d.value)}
                  placeholder="Ej: 6f2125d8-..."
                />
              </Field>
              <MEHButton
                appearance="outline"
                onClick={() => {
                  if (!generatorValue) return;
                  navigator.clipboard?.writeText(generatorValue).catch(() => {});
                }}
              >
                Copiar valor
              </MEHButton>
            </div>

            <div className={styles.generatorCard} style={{ alignItems: 'center', justifyContent: 'center' }}>
              {generatorValue ? (
                <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '8px' }}>
                  <QRCodeSVG value={generatorValue} size={180} />
                </div>
              ) : (
                <MEHTypography variant="caption" style={{ opacity: 0.7 }}>
                  Escribe un valor para ver el QR
                </MEHTypography>
              )}
            </div>
          </div>
        )}

        {loading && !scanResult && !syncingStatus && <Spinner label="Procesando..." style={{ marginTop: '8px' }} />}

        {scanResult && (
          <div className={styles.resultOk}>
            <CheckmarkCircle24Filled fontSize={28} />
            <MEHTypography variant="h2">{scanResult}</MEHTypography>
          </div>
        )}

        {error && (
          <div className={styles.resultError}>
            <Warning24Regular fontSize={28} />
            <MEHTypography variant="h3">{error}</MEHTypography>
          </div>
        )}
      </MEHCard>
    </div>
  );
};

export default EscaneoQR;

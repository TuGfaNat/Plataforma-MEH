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
  Badge,
  Tooltip
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
  ArrowUndo24Regular,
  Clock24Regular,
  Search24Regular,
  ArrowLeft24Regular,
  ArrowRight24Regular,
} from '@fluentui/react-icons';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QRCodeSVG } from 'qrcode.react';
import { MEHCard, MEHButton, MEHTypography } from '../components/ui';
import { useAuth, useNotify } from '../App';

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
    maxWidth: '760px',
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
  undoCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    padding: '16px',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius('12px'),
    ...shorthands.border('1px', 'solid', tokens.colorPaletteGreenBorder2),
    marginTop: '12px',
    textAlign: 'center'
  },
  historialContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
    marginTop: '8px'
  },
  historialRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius('10px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3),
    flexWrap: 'wrap',
    gap: '10px'
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
  const { user } = useAuth();
  const notify = useNotify();
  const isAdmin = user?.rol === 'ADMIN';

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

  // Estados Undo (MEH-018)
  const [lastScan, setLastScan] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [undoLoading, setUndoLoading] = useState(false);
  const [undoSuccessMessage, setUndoSuccessMessage] = useState('');

  // Estados Historial Paginado (MEH-018)
  const [historialItems, setHistorialItems] = useState([]);
  const [historialTotal, setHistorialTotal] = useState(0);
  const [historialPage, setHistorialPage] = useState(1);
  const [historialTotalPages, setHistorialTotalPages] = useState(1);
  const [historialLoading, setHistorialLoading] = useState(false);
  const [historialSearch, setHistorialSearch] = useState('');
  const [historialCheckpointFilter, setHistorialCheckpointFilter] = useState('');

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

  // Temporizador para Undo de 30 segundos (Admin sin límite)
  useEffect(() => {
    if (!lastScan) return;
    if (isAdmin) {
      setTimeLeft(999);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastScan.timestamp) / 1000);
      const remaining = Math.max(0, 30 - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastScan, isAdmin]);

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
          setCheckpoints(cpData || []);
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
    setUndoSuccessMessage('');

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
      const usuarioNombre = result.usuario?.nombre || 'Participante';
      const eventoTitulo = result.evento?.titulo || 'Evento';

      setLastScan({
        id_asistencia: result.id_asistencia,
        id_inscripcion: result.id_inscripcion,
        id_checkpoint: result.id_checkpoint,
        usuarioNombre,
        eventoTitulo,
        timestamp: Date.now()
      });
      setTimeLeft(30);
      setScanResult(`Asistencia de ${usuarioNombre} confirmada para ${eventoTitulo}`);
      
      if (mode === 'historial') {
        fetchHistorial(historialPage);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Error en el registro');
      setTimeout(() => setError(null), 4500);
    } finally {
      setLoading(false);
    }
  };

  const handleUndoScan = async (scanItem = null) => {
    const target = scanItem || lastScan;
    if (!target) return;

    setUndoLoading(true);
    try {
      const res = await asistenciaService.deshacerAsistencia({
        id_asistencia: target.id_asistencia,
        id_inscripcion: target.id_inscripcion,
        id_checkpoint: target.id_checkpoint,
        motivo: 'Deshecho desde EscaneoQR'
      });
      if (notify) notify("Escaneo Deshecho", res.message || "Se revirtió la asistencia con éxito", "success");
      setScanResult(null);
      setLastScan(null);
      setUndoSuccessMessage("✓ Escaneo deshecho con éxito. El participante puede ser escaneado nuevamente.");
      setTimeout(() => setUndoSuccessMessage(''), 6000);
      if (selectedEvento) {
        fetchHistorial(historialPage);
      }
    } catch (err) {
      const detail = err.response?.data?.detail || "No se pudo deshacer el escaneo";
      if (notify) notify("Error al Deshacer", detail, "error");
      setError(detail);
      setTimeout(() => setError(null), 5000);
    } finally {
      setUndoLoading(false);
    }
  };

  const fetchHistorial = async (page = 1) => {
    if (!selectedEvento) return;
    setHistorialLoading(true);
    try {
      const params = {
        page,
        limit: 10
      };
      if (historialCheckpointFilter) {
        params.id_checkpoint = parseInt(historialCheckpointFilter);
      }
      if (historialSearch.trim()) {
        params.search = historialSearch.trim();
      }
      const data = await asistenciaService.getHistorialAsistencia(selectedEvento, params);
      setHistorialItems(data.items || []);
      setHistorialTotal(data.total || 0);
      setHistorialPage(data.page || 1);
      setHistorialTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error("Error cargando historial de asistencia", err);
    } finally {
      setHistorialLoading(false);
    }
  };

  useEffect(() => {
    if (mode === 'historial' && selectedEvento) {
      fetchHistorial(1);
    }
  }, [mode, selectedEvento, historialCheckpointFilter]);

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
          Escaneo seguro con checkpoints asignados, botón Deshacer accidental (30s) e historial de escaneos.
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
          <Tab value="manual" icon={<Keyboard24Regular />}>Ingreso Manual</Tab>
          <Tab value="historial" icon={<Clock24Regular />}>Historial de Escaneos</Tab>
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
          {selectedEvento && mode !== 'historial' && (
            <Field label="Checkpoint (Opcional - Ej. Refrigerio)">
              <Select value={selectedCheckpoint} onChange={(e, data) => setSelectedCheckpoint(data.value)}>
                <option value="">-- Entrada Principal (Asistencia) --</option>
                {checkpoints.map(cp => (
                  <option 
                    key={cp.id_checkpoint} 
                    value={cp.id_checkpoint}
                    disabled={cp.puede_escanear === false}
                  >
                    {cp.nombre_checkpoint} {cp.puede_escanear === false ? '(Sin permiso)' : ''}
                  </option>
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

        {mode === 'historial' && (
          <div className={styles.historialContainer}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <MEHTypography variant="h3">
                <Clock24Regular style={{ verticalAlign: 'middle', marginRight: '8px', color: tokens.colorBrandForeground1 }} />
                Historial de Asistencia
              </MEHTypography>
              <MEHButton size="small" appearance="subtle" onClick={() => fetchHistorial(historialPage)}>
                Actualizar Lista
              </MEHButton>
            </div>

            {/* Filtros */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <Field label="Filtrar por Checkpoint">
                <Select 
                  value={historialCheckpointFilter} 
                  onChange={(e, d) => setHistorialCheckpointFilter(d.value)}
                >
                  <option value="">-- Todos los Checkpoints --</option>
                  {checkpoints.map(cp => (
                    <option key={cp.id_checkpoint} value={cp.id_checkpoint}>
                      {cp.nombre_checkpoint}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Buscar Asistente (Nombre o Correo)">
                <Input
                  contentBefore={<Search24Regular />}
                  placeholder="Buscar y presionar Enter..."
                  value={historialSearch}
                  onChange={(e, d) => setHistorialSearch(d.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      fetchHistorial(1);
                    }
                  }}
                />
              </Field>
            </div>

            {historialLoading ? (
              <Spinner size="medium" label="Cargando historial..." style={{ padding: '24px' }} />
            ) : !selectedEvento ? (
              <div style={{ padding: '24px', textAlign: 'center', opacity: 0.6 }}>
                Selecciona un evento arriba para consultar su historial de escaneos.
              </div>
            ) : historialItems.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', opacity: 0.6, backgroundColor: tokens.colorNeutralBackground1, borderRadius: '8px' }}>
                No se encontraron escaneos registrados con los filtros seleccionados.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {historialItems.map(item => (
                  <div key={item.id_asistencia} className={styles.historialRow}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <MEHTypography variant="body" style={{ fontWeight: 'bold' }}>
                        {item.usuario?.nombre_completo || 'Participante'}
                      </MEHTypography>
                      <MEHTypography variant="caption" style={{ opacity: 0.75 }}>
                        {item.usuario?.correo} • Checkpoint: <b>{item.checkpoint?.nombre_checkpoint || 'Entrada General'}</b>
                      </MEHTypography>
                      <MEHTypography variant="caption" style={{ opacity: 0.6 }}>
                        Escaneado por: {item.operador?.nombre_completo || 'Sistema'} • {new Date(item.fecha_escaneo).toLocaleTimeString()} ({new Date(item.fecha_escaneo).toLocaleDateString()})
                      </MEHTypography>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {item.puede_deshacer ? (
                        <MEHButton
                          size="small"
                          appearance="outline"
                          icon={<ArrowUndo24Regular />}
                          disabled={undoLoading}
                          onClick={() => handleUndoScan(item)}
                          style={{ borderColor: tokens.colorPaletteRedBorder2, color: tokens.colorPaletteRedForeground1 }}
                        >
                          Deshacer
                        </MEHButton>
                      ) : (
                        <Badge size="small" appearance="tint" color="neutral">
                          Ventana cerrada (&gt;30s)
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}

                {/* Controles de Paginación */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <MEHTypography variant="caption" style={{ opacity: 0.8 }}>
                    Página {historialPage} de {historialTotalPages} (Total: {historialTotal} escaneos)
                  </MEHTypography>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <MEHButton
                      size="small"
                      icon={<ArrowLeft24Regular />}
                      disabled={historialPage <= 1 || historialLoading}
                      onClick={() => fetchHistorial(historialPage - 1)}
                    >
                      Anterior
                    </MEHButton>
                    <MEHButton
                      size="small"
                      icon={<ArrowRight24Regular />}
                      disabled={historialPage >= historialTotalPages || historialLoading}
                      onClick={() => fetchHistorial(historialPage + 1)}
                    >
                      Siguiente
                    </MEHButton>
                  </div>
                </div>
              </div>
            )}
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
                  <QRCodeSVG 
                    value={generatorValue} 
                    size={180} 
                    role="img"
                    aria-label={`Código QR generado: ${generatorValue}`}
                  />
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

        {/* Tarjeta de Éxito con Botón Deshacer Accidental */}
        {scanResult && lastScan && (
          <div className={styles.undoCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: tokens.colorPaletteGreenForeground1 }}>
              <CheckmarkCircle24Filled fontSize={24} />
              <MEHTypography variant="body" style={{ fontWeight: 'bold' }}>{scanResult}</MEHTypography>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <MEHTypography variant="caption" style={{ opacity: 0.8 }}>
                {isAdmin 
                  ? "Rol Administrador: puedes deshacer este escaneo sin límite de tiempo." 
                  : `¿Fue accidental? Tienes ${timeLeft}s para revertir este escaneo.`}
              </MEHTypography>
              <MEHButton
                size="small"
                appearance="outline"
                icon={<ArrowUndo24Regular />}
                disabled={undoLoading || (!isAdmin && timeLeft <= 0)}
                onClick={() => handleUndoScan()}
                style={{ borderColor: tokens.colorPaletteRedBorder2, color: tokens.colorPaletteRedForeground1 }}
              >
                {undoLoading ? "Revirtiendo..." : `Deshacer Escaneo (${isAdmin ? "Admin" : `${timeLeft}s`})`}
              </MEHButton>
            </div>
          </div>
        )}

        {undoSuccessMessage && (
          <div style={{ padding: '12px', textAlign: 'center', backgroundColor: 'rgba(16, 124, 65, 0.1)', color: tokens.colorPaletteGreenForeground1, borderRadius: '8px', border: `1px solid rgba(16, 124, 65, 0.3)` }}>
            <MEHTypography variant="body" style={{ fontWeight: 'bold' }}>{undoSuccessMessage}</MEHTypography>
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

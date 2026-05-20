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
} from '@fluentui/react-components';
import {
  CheckmarkCircle24Filled,
  Warning24Regular,
  PersonAvailable24Regular,
  QrCode24Regular,
  ScanCamera24Regular,
  Keyboard24Regular,
} from '@fluentui/react-icons';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QRCodeSVG } from 'qrcode.react';
import { MEHCard, MEHButton, MEHTypography } from '../components/ui';

import asistenciaService from '../services/asistenciaService';

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
  }, []);

  const handleEventoChange = async (e, data) => {
    setSelectedEvento(data.value);
    setSelectedCheckpoint('');
    if (data.value) {
      try {
        const cpData = await asistenciaService.getCheckpoints(data.value);
        setCheckpoints(cpData);
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
  }, [mode, loading]);

  const handleAsistencia = async (codigoQR) => {
    const normalizedCode = normalizeQrPayload(codigoQR);
    if (!normalizedCode) {
      setError('Código QR vacío o inválido');
      return;
    }

    setLoading(true);
    setError(null);
    setScanResult(null);

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

  return (
    <div className={styles.container}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
          <PersonAvailable24Regular style={{ color: tokens.colorBrandForeground1, fontSize: '32px' }} />
          <MEHTypography variant="h1">Escaneo QR de Asistencia</MEHTypography>
        </div>
        <MEHTypography variant="body" style={{ opacity: 0.7 }}>
          Flujo local para eventos: escaneo por cámara, ingreso manual y generación de QR para pruebas en celular/computadora.
        </MEHTypography>
      </div>

      <MEHCard className={styles.panel}>
        <TabList selectedValue={mode} onTabSelect={(e, d) => setMode(d.value)}>
          <Tab value="camera" icon={<ScanCamera24Regular />}>Escanear Cámara</Tab>
          <Tab value="manual" icon={<Keyboard24Regular />}>Ingreso Manual (Evento)</Tab>
          <Tab value="generator" icon={<QrCode24Regular />}>Generador QR Evento</Tab>
        </TabList>

        <div style={{ width: '100%', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
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
              <MEHButton appearance="primary" onClick={handleManualSubmit}>
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

        {loading && !scanResult && <Spinner label="Procesando..." style={{ marginTop: '8px' }} />}

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

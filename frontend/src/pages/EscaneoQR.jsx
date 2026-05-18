import React, { useState, useEffect, useRef } from 'react';
import { 
  makeStyles, 
  shorthands, 
  tokens, 
  Spinner,
  Badge,
} from '@fluentui/react-components';
import { 
  CheckmarkCircle24Filled,
  Warning24Regular,
  PersonAvailable24Regular
} from '@fluentui/react-icons';
import { MEHCard, MEHTypography } from '../components/ui';
import asistenciaService from '../services/asistenciaService';
import { Html5QrcodeScanner } from "html5-qrcode";

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
    animationName: {
        from: { opacity: 0, transform: 'translateY(10px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
    },
    animationDuration: '0.5s',
  },
  scannerContainer: {
    width: '100%',
    maxWidth: '500px',
    backgroundColor: '#000',
    ...shorthands.borderRadius('16px'),
    overflow: 'hidden',
    ...shorthands.border('2px', 'solid', tokens.colorBrandBackground),
  }
});

const EscaneoQR = () => {
  const styles = useStyles();
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (scannerRef.current) return;

    const scanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: { width: 250, height: 250 },
    });
    
    scanner.render(onScanSuccess, (err) => {});
    scannerRef.current = scanner;

    function onScanSuccess(decodedText) {
      if (loading) return; // Prevent double scans
      handleAsistencia(decodedText);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.log(e));
        scannerRef.current = null;
      }
    };
  }, []);

  const handleAsistencia = async (codigoQR) => {
    setLoading(true);
    setError(null);
    setScanResult(null);

    try {
      const result = await asistenciaService.registrarPorQR(codigoQR);
      setScanResult(`¡Asistencia de ${result.usuario.nombre} confirmada para ${result.evento.titulo}!`);
      // Feedback visual temporal
      setTimeout(() => setScanResult(null), 4000);
    } catch (err) {
      setError(err.response?.data?.detail || "Error en el registro");
      setTimeout(() => setError(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
          <PersonAvailable24Regular style={{ color: tokens.colorBrandForeground1, fontSize: '32px' }} />
          <MEHTypography variant="h1">Escáner Universal de Asistencia</MEHTypography>
        </div>
        <MEHTypography variant="body" style={{ opacity: 0.6 }}>
          El escáner detectará automáticamente a qué evento pertenece el código QR.
        </MEHTypography>
      </div>

      <MEHCard style={{ width: '100%', maxWidth: '600px' }}>
          <div id="reader" className={styles.scannerContainer}></div>

          {loading && !scanResult && <Spinner label="Procesando QR..." style={{ marginTop: '20px' }} />}

          {scanResult && (
              <div style={{ marginTop: '20px', color: tokens.colorPaletteGreenForeground1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textAlign: 'center' }}>
                  <CheckmarkCircle24Filled fontSize={32} />
                  <MEHTypography variant="h2">{scanResult}</MEHTypography>
              </div>
          )}

          {error && (
              <div style={{ marginTop: '20px', color: tokens.colorPaletteRedForeground1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textAlign: 'center' }}>
                  <Warning24Regular fontSize={32} />
                  <MEHTypography variant="h3">{error}</MEHTypography>
              </div>
          )}

          <div style={{ marginTop: '24px', opacity: 0.6, textAlign: 'center' }}>
              <MEHTypography variant="caption">El escáner permanece activo. Solo apunta el siguiente código.</MEHTypography>
          </div>
      </MEHCard>
    </div>
  );
};

export default EscaneoQR;

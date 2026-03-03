import React, { useState, useEffect } from 'react';
import { 
  makeStyles, 
  shorthands, 
  tokens, 
  Spinner,
  Badge
} from '@fluentui/react-components';
import { 
  QrCode24Regular, 
  CheckmarkCircle24Filled,
  Warning24Regular
} from '@fluentui/react-icons';
import MainLayout from '../components/layout/MainLayout';
import { MEHCard, MEHButton, MEHTypography } from '../components/ui';
import eventoService from '../services/eventoService';
import { Html5QrcodeScanner } from "html5-qrcode";

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
    textAlign: 'center',
  },
  scannerContainer: {
    width: '100%',
    maxWidth: '500px',
    backgroundColor: 'black',
    ...shorthands.borderRadius('12px'),
    overflow: 'hidden',
  }
});

const EscaneoQR = () => {
  const styles = useStyles();
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });

    scanner.render(onScanSuccess, onScanError);

    function onScanSuccess(decodedText) {
      // Formato esperado: "evento_id|token_qr|usuario_id"
      handleAsistencia(decodedText);
      scanner.clear();
    }

    function onScanError(err) {
      // Ignorar errores de escaneo continuo
    }

    return () => {
      scanner.clear();
    };
  }, []);

  const handleAsistencia = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const [idEvento, tokenQr, idUsuario] = data.split('|');
      if (!idEvento || !tokenQr || !idUsuario) throw new Error("QR Formato Inválido");

      await eventoService.registrarAsistencia(idEvento, tokenQr, idUsuario);
      setScanResult(`¡Asistencia registrada para usuario #${idUsuario}!`);
    } catch (err) {
      setError(err.response?.data?.detail || "Error al procesar QR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className={styles.container}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <QrCode24Regular style={{ color: tokens.colorBrandForeground1, fontSize: '32px' }} />
          <MEHTypography variant="h1">Escaneo de Asistencia</MEHTypography>
        </div>

        <MEHCard style={{width: '100%', maxWidth: '600px'}}>
          <MEHTypography variant="body" style={{marginBottom: '20px', display: 'block'}}>
            Apunta la cámara al código QR del carnet del miembro.
          </MEHTypography>
          
          <div id="reader" className={styles.scannerContainer}></div>

          {loading && <Spinner label="Validando asistencia..." style={{marginTop: '20px'}} />}

          {scanResult && (
            <div style={{marginTop: '20px', color: tokens.colorPaletteGreenForeground1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
              <CheckmarkCircle24Filled />
              <MEHTypography variant="h3">{scanResult}</MEHTypography>
            </div>
          )}

          {error && (
            <div style={{marginTop: '20px', color: tokens.colorPaletteRedForeground1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
              <Warning24Regular />
              <MEHTypography variant="h3">{error}</MEHTypography>
            </div>
          )}

          <MEHButton 
            appearance="outline" 
            style={{marginTop: '24px'}} 
            onClick={() => window.location.reload()}
          >
            Escanear Nuevo
          </MEHButton>
        </MEHCard>
      </div>
    </MainLayout>
  );
};

export default EscaneoQR;

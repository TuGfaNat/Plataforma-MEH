import React, { useState } from 'react';
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
  MessageBar
} from '@fluentui/react-components';
import { ReceiptMoney24Filled, Dismiss24Regular, Attach24Regular } from '@fluentui/react-icons';
import { MEHButton, MEHTypography } from './ui';
import api from '../services/api';
import { useNotify } from '../App';

const InscripcionEventoModal = ({ evento, onInscribed }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const { notify } = useNotify();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleConfirmar = async () => {
    if (!file) {
      notify("Validación", "Debes adjuntar el comprobante de pago", "warning");
      return;
    }

    setLoading(true);
    try {
      // 1. Subir el archivo
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // 2. Inscribir con la URL del comprobante
      await api.post(`/inscripciones/inscribir/${evento.id_evento}`, {
        comprobante_pago_url: uploadRes.data.url
      });

      notify("Éxito", "Inscripción enviada. Pendiente de verificación.", "success");
      setIsOpen(false);
      if (onInscribed) onInscribed();
    } catch (err) {
      notify("Error", err.response?.data?.detail || "No se pudo procesar la inscripción", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(e, d) => setIsOpen(d.open)}>
      <DialogTrigger disableButtonEnhancement>
        <MEHButton appearance="primary" icon={<ReceiptMoney24Filled />}>Inscribirme</MEHButton>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle 
            action={<MEHButton appearance="subtle" icon={<Dismiss24Regular />} onClick={() => setIsOpen(false)} />}
          >
            Inscripción a: {evento.titulo}
          </DialogTitle>
          <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <MEHTypography variant="body">
              Para eventos pagos o con capacidad limitada, requerimos que adjuntes tu comprobante de pago o carta de compromiso.
            </MEHTypography>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Label required>Comprobante de Pago (PDF/JPG/PNG)</Label>
              <div style={{ 
                border: `2px dashed ${tokens.colorNeutralBackground3}`, 
                padding: '20px', 
                borderRadius: '8px',
                textAlign: 'center',
                position: 'relative'
              }}>
                <Input 
                  type="file" 
                  onChange={handleFileChange} 
                  style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <Attach24Regular style={{ fontSize: '32px', opacity: 0.5, marginBottom: '8px' }} />
                <MEHTypography variant="caption" style={{ display: 'block' }}>
                  {file ? file.name : "Haz clic para seleccionar o arrastra el archivo aquí"}
                </MEHTypography>
              </div>
            </div>

            <MessageBar intent="info">
              Tamaño máximo permitido: 5MB.
            </MessageBar>
          </DialogContent>
          <DialogActions>
            <MEHButton appearance="outline" onClick={() => setIsOpen(false)}>Cancelar</MEHButton>
            <MEHButton appearance="primary" loading={loading} onClick={handleConfirmar}>
              Confirmar Inscripción
            </MEHButton>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default InscripcionEventoModal;

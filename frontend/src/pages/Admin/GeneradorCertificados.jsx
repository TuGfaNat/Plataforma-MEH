import React, { useState } from 'react';
import {
  makeStyles, tokens, Button, Input, Select, Field, Spinner, Text
} from '@fluentui/react-components';
import { Add24Regular, Certificate24Regular, Eye24Regular } from '@fluentui/react-icons';
import { generateCertificatePDF } from '../../services/certificateGenerator';
import api from '../../services/api';
import { useNotify } from '../../App';
import { MEHCard, MEHTypography } from '../../components/ui';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    maxWidth: '800px',
    margin: '0 auto'
  },
  formRow: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    width: '100%'
  },
  fileInput: {
    marginBottom: '16px'
  }
});

const GeneradorCertificados = () => {
  const styles = useStyles();
  const { notify } = useNotify();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'EVENTO',
    id_referencia: '',
    criterio: 'TODOS',
    titulo: '',
    background: null,
    firma1: null,
    firma2: null,
    firma3: null,
    firma4: null
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field, file) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async () => {
    if (!formData.id_referencia || !formData.titulo || !formData.background) {
      notify("Error", "Faltan campos obligatorios (ID, Título o Fondo)", "error");
      return;
    }

    const payload = new FormData();
    payload.append('tipo', formData.tipo);
    payload.append('id_referencia', formData.id_referencia);
    payload.append('criterio', formData.criterio);
    payload.append('titulo', formData.titulo);
    payload.append('background', formData.background);
    if (formData.firma1) payload.append('firma1', formData.firma1);
    if (formData.firma2) payload.append('firma2', formData.firma2);
    if (formData.firma3) payload.append('firma3', formData.firma3);
    if (formData.firma4) payload.append('firma4', formData.firma4);

    setLoading(true);
    try {
      const response = await api.post('/certificados-admin/bulk', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const { data } = response;
      notify("Éxito", data.mensaje, "success");

      // Si fue modo speakers directo, disparamos PDFs inmediatamente
      if (data.modo === "IMPRESION_DIRECTA" && data.nombres) {
          notify("Info", "Iniciando descarga de PDFs para Speakers...", "info");
          for (const nombre of data.nombres) {
              await generateCertificatePDF({
                  fullName: nombre,
                  eventName: data.titulo,
                  date: new Date().toISOString(),
                  code: `SPK-${Date.now()}`,
                  templateUrl: data.background ? `http://localhost:8000${data.background}` : null,
                  signatureUrls: data.firmas ? data.firmas.map(f => `http://localhost:8000${f}`) : []
              });
          }
      }

    } catch (err) {
      notify("Error", err.response?.data?.detail || "No se pudo generar los certificados", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!formData.titulo || !formData.background) {
      notify("Atención", "Sube un fondo y añade un título para la vista previa.", "warning");
      return;
    }
    try {
        const bgUrl = URL.createObjectURL(formData.background);
        const sigs = [];
        if (formData.firma1) sigs.push(URL.createObjectURL(formData.firma1));
        if (formData.firma2) sigs.push(URL.createObjectURL(formData.firma2));
        if (formData.firma3) sigs.push(URL.createObjectURL(formData.firma3));
        if (formData.firma4) sigs.push(URL.createObjectURL(formData.firma4));

        await generateCertificatePDF({
            fullName: "SPEAKER DE EJEMPLO",
            eventName: formData.titulo,
            date: new Date().toISOString(),
            code: "PREVIEW-12345",
            templateUrl: bgUrl,
            signatureUrls: sigs
        });
    } catch (e) {
        notify("Error", "No se pudo generar la vista previa.", "error");
    }
  };

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Certificate24Regular style={{ color: tokens.colorBrandForeground1, fontSize: '32px' }} />
        <MEHTypography variant="h1">Generador de Certificados</MEHTypography>
      </div>

      <MEHCard>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div className={styles.formRow}>
            <Field label="Tipo de Referencia" style={{ flex: 1 }}>
              <Select value={formData.tipo} onChange={(e, data) => handleChange('tipo', data.value)}>
                <option value="EVENTO">Evento</option>
                <option value="CURSO">Curso</option>
              </Select>
            </Field>

            <Field label="ID de Referencia (Evento o Curso)" style={{ flex: 1 }}>
              <Input type="number" value={formData.id_referencia} onChange={(e, data) => handleChange('id_referencia', data.value)} />
            </Field>
          </div>

          <Field label="Criterio de Emisión">
            <Select value={formData.criterio} onChange={(e, data) => handleChange('criterio', data.value)}>
              {formData.tipo === 'EVENTO' && (
                <>
                  <option value="TODOS">Inscritos Confirmados (Sin filtrar asistencia)</option>
                  <option value="ASISTIERON">Solo Asistentes Confirmados</option>
                  <option value="SPEAKERS">A todos los Speakers del Evento</option>
                </>
              )}
              {formData.tipo === 'CURSO' && (
                <>
                  <option value="TODOS">Todos los Inscritos</option>
                  <option value="APROBADOS">Solo Aprobados (Completados)</option>
                </>
              )}
            </Select>
          </Field>

          <Field label="Título del Certificado">
            <Input value={formData.titulo} onChange={(e, data) => handleChange('titulo', data.value)} placeholder="Ej. Taller de IA con Python" />
          </Field>

          <Field label="Imagen de Fondo (Plantilla vacía)">
            <input type="file" accept="image/*" onChange={(e) => handleFileChange('background', e.target.files[0])} className={styles.fileInput} />
          </Field>

          <Text weight="semibold">Firmas (Hasta 4 - PNG Transparente)</Text>
          <div className={styles.formRow}>
            <input type="file" accept="image/png" onChange={(e) => handleFileChange('firma1', e.target.files[0])} className={styles.fileInput} title="Firma 1" />
            <input type="file" accept="image/png" onChange={(e) => handleFileChange('firma2', e.target.files[0])} className={styles.fileInput} title="Firma 2" />
          </div>
          <div className={styles.formRow}>
            <input type="file" accept="image/png" onChange={(e) => handleFileChange('firma3', e.target.files[0])} className={styles.fileInput} title="Firma 3" />
            <input type="file" accept="image/png" onChange={(e) => handleFileChange('firma4', e.target.files[0])} className={styles.fileInput} title="Firma 4" />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button appearance="outline" icon={<Eye24Regular />} onClick={handlePreview} disabled={loading}>
              Vista Previa
            </Button>
            <Button appearance="primary" icon={loading ? <Spinner size="tiny" /> : <Add24Regular />} onClick={handleSubmit} disabled={loading}>
              Generar Certificados
            </Button>
          </div>

        </div>
      </MEHCard>
    </div>
  );
};

export default GeneradorCertificados;

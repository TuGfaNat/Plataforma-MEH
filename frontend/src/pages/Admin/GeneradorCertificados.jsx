import React, { useState } from 'react';
import {
  makeStyles, tokens, Button, Input, Select, Field, Spinner, Text
} from '@fluentui/react-components';
import { Add24Regular, Certificate24Regular, Eye24Regular } from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
        <MEHTypography variant="h1">{t("admin_cert_generator")}</MEHTypography>
      </div>

      <MEHCard>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div className={styles.formRow}>
            <Field label={t("admin_ref_type")} style={{ flex: 1 }}>
              <Select value={formData.tipo} onChange={(e, data) => handleChange('tipo', data.value)}>
                <option value="EVENTO">{t("event")}</option>
                <option value="CURSO">{t("course")}</option>
              </Select>
            </Field>

            <Field label={t("admin_ref_id")} style={{ flex: 1 }}>
              <Input type="number" value={formData.id_referencia} onChange={(e, data) => handleChange('id_referencia', data.value)} />
            </Field>
          </div>

          <Field label={t("admin_emission_criteria")}>
            <Select value={formData.criterio} onChange={(e, data) => handleChange('criterio', data.value)}>
              {formData.tipo === 'EVENTO' && (
                <>
                  <option value="TODOS">{t("admin_confirmed_inscribed")}</option>
                  <option value="ASISTIERON">{t("admin_only_confirmed_attendees")}</option>
                  <option value="SPEAKERS">{t("admin_all_event_speakers")}</option>
                </>
              )}
              {formData.tipo === 'CURSO' && (
                <>
                  <option value="TODOS">{t("admin_all_inscribed")}</option>
                  <option value="APROBADOS">{t("admin_only_passed")}</option>
                </>
              )}
            </Select>
          </Field>

          <Field label={t("admin_cert_title")}>
            <Input value={formData.titulo} onChange={(e, data) => handleChange('titulo', data.value)} placeholder={t("admin_cert_title_placeholder")} />
          </Field>

          <Field label={t("admin_background_image")}>
            <input type="file" accept="image/*" onChange={(e) => handleFileChange('background', e.target.files[0])} className={styles.fileInput} />
          </Field>

          <Text weight="semibold">{t("admin_signatures_help")}</Text>
          <div className={styles.formRow}>
            <input type="file" accept="image/png" onChange={(e) => handleFileChange('firma1', e.target.files[0])} className={styles.fileInput} title={`${t("admin_signature")} 1`} />
            <input type="file" accept="image/png" onChange={(e) => handleFileChange('firma2', e.target.files[0])} className={styles.fileInput} title={`${t("admin_signature")} 2`} />
          </div>
          <div className={styles.formRow}>
            <input type="file" accept="image/png" onChange={(e) => handleFileChange('firma3', e.target.files[0])} className={styles.fileInput} title={`${t("admin_signature")} 3`} />
            <input type="file" accept="image/png" onChange={(e) => handleFileChange('firma4', e.target.files[0])} className={styles.fileInput} title={`${t("admin_signature")} 4`} />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button appearance="outline" icon={<Eye24Regular />} onClick={handlePreview} disabled={loading}>
              {t("preview")}
            </Button>
            <Button appearance="primary" icon={loading ? <Spinner size="tiny" /> : <Add24Regular />} onClick={handleSubmit} disabled={loading}>
              {t("admin_generate_certs")}
            </Button>
          </div>

        </div>
      </MEHCard>
    </div>
  );
};

export default GeneradorCertificados;

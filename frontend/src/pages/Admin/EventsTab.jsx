import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Divider, Badge, Field, Input, Textarea, Select, Switch, Button, tokens, makeStyles, shorthands,
  Avatar, Tooltip, Spinner,
  Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions,
  Checkbox
} from '@fluentui/react-components';
import { 
  CalendarLtr24Regular, Add24Regular, Map24Regular, Edit24Regular, Delete24Regular,
  QrCode24Regular, PeopleTeam24Regular, Mic24Regular, Link24Regular,
  Clock24Regular, Dismiss24Regular, ReceiptMoney24Filled, ArrowDownload24Regular,
  Megaphone24Regular, DismissCircle24Regular, Share24Regular, Copy24Regular, DocumentTable24Regular,
  Image24Regular
} from '@fluentui/react-icons';
import { MEHButton, MEHTypography } from '../../components/ui';
import api, { resolveApiFileUrl } from '../../services/api';
import eventoService from '../../services/eventoService';
import { useNotify } from '../../App';
import AcreditacionPanel from './AcreditacionPanel';
import BadgeSocialModal from '../../components/BadgeSocialModal';
import CheckpointPermisosPanel from '../../components/CheckpointPermisosPanel';
import EventoPortadaUploader from '../../components/EventoPortadaUploader';
import EmailDryRunModal from '../../components/EmailDryRunModal';

const useStyles = makeStyles({
  grid: { 
    display: 'grid', 
    gridTemplateColumns: '320px minmax(0, 1fr)', 
    gap: '24px', 
    marginTop: '16px', 
    alignItems: 'start',
    minWidth: 0,
    maxWidth: '100%',
    '@media (max-width: 960px)': {
      gridTemplateColumns: '1fr',
      gap: '20px',
    }
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    position: 'sticky',
    top: '24px',
    maxHeight: 'calc(100vh - 200px)',
    paddingRight: '8px',
    minWidth: 0,
    '@media (max-width: 960px)': {
      position: 'static',
      maxHeight: '300px',
      paddingRight: 0,
    }
  },
  selectableCard: { 
    padding: '14px 16px', 
    ...shorthands.borderRadius('12px'), 
    backgroundColor: tokens.colorNeutralBackground1, 
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3), 
    cursor: 'pointer', 
    transition: 'all 0.2s ease', 
    ':hover': { transform: 'translateX(4px)', ...shorthands.borderColor(tokens.colorBrandStroke1) } 
  },
  activeItem: { ...shorthands.borderColor(tokens.colorBrandStroke1), backgroundColor: tokens.colorBrandBackground2 },
  formPanel: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '20px', 
    padding: '24px',
    minWidth: 0,
    maxWidth: '100%',
    boxSizing: 'border-box',
    backgroundColor: tokens.colorNeutralBackground2, 
    ...shorthands.borderRadius('20px'), 
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3),
    '@media (max-width: 600px)': {
      padding: '16px',
    }
  },
  infoCard: { 
    padding: '20px',
    minWidth: 0,
    maxWidth: '100%',
    boxSizing: 'border-box',
    ...shorthands.borderRadius('18px'), 
    backgroundColor: tokens.colorNeutralBackground1, 
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3), 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '14px',
    '@media (max-width: 600px)': {
      padding: '14px',
    }
  },
  detailsContainer: {
    paddingLeft: '24px',
    borderLeft: `1px solid ${tokens.colorNeutralBackground3}`,
    minWidth: 0,
    width: '100%',
    boxSizing: 'border-box',
    '@media (max-width: 960px)': {
      paddingLeft: 0,
      borderLeft: 'none',
    }
  },
  headerHeroCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '22px',
    marginBottom: '24px',
    ...shorthands.borderRadius('18px'),
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3),
    minWidth: 0,
    maxWidth: '100%',
    boxSizing: 'border-box',
    '@media (max-width: 600px)': {
      padding: '16px',
      gap: '14px',
    }
  },
  actionToolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
    paddingTop: '14px',
    ...shorthands.borderTop('1px', 'solid', tokens.colorNeutralBackground3),
  },
  actionGroup: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
  },
  twoColResponsive: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
    gap: '20px',
    marginBottom: '24px',
  },
  formTwoCol: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
    gap: '12px',
  },
  formThreeCol: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))',
    gap: '12px',
  },
  agendaItem: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    flexWrap: 'wrap',
    padding: '12px',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius('12px'),
    marginBottom: '8px',
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3)
  },
  speakerSelection: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '8px'
  }
});

const EventoItemBadge = ({ ev }) => {
  if (ev.estado === 'CANCELADO') {
    return <Badge color="danger" appearance="filled">Cancelado</Badge>;
  }
  if (ev.estado === 'FINALIZADO') {
    return <Badge color="neutral" appearance="tint">Finalizado</Badge>;
  }
  if (ev.estado === 'EN_CURSO') {
    return <Badge color="danger" appearance="filled">🔴 En Vivo</Badge>;
  }
  if (ev.id_estado === 1) {
    return <Badge color="warning" appearance="tint">Inactivo</Badge>;
  }
  return <Badge color="success" appearance="tint">Activo</Badge>;
};

const EventsTab = ({ 
  eventosList, speakersList, selectedEventoId, setSelectedEventoId, isAddingEvento, setIsAddingEvento,
  isEditingEvento, setIsEditingEvento, newEvento, setNewEvento, handleSaveEvento, 
  handleEditEvento, confirmDelete, fetchData
}) => {
  const { t } = useTranslation();
  const { notify } = useNotify();
  const navigate = useNavigate();
  const styles = useStyles();
  const [agenda, setAgenda] = useState([]);
  const [selectedSpeakers, setSelectedSpeakers] = useState([]);
  const [errors, setErrors] = useState({});
  const [pagosQr, setPagosQr] = useState([]);
  const [loadingQr, setLoadingQr] = useState(false);
  const [listaEspera, setListaEspera] = useState([]);
  const [loadingParticipantes, setLoadingParticipantes] = useState(false);
  const [nuevoNombrePaquete, setNuevoNombrePaquete] = useState('');
  const [nuevoMonto, setNuevoMonto] = useState('');
  const [qrFile, setQrFile] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [editQrDialog, setEditQrDialog] = useState({ open: false, idQr: null, nombre_paquete: '', monto: '', file: null, loading: false });

  // Estados para Badge Social
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [badgePlantillaFile, setBadgePlantillaFile] = useState(null);
  const [uploadingPlantilla, setUploadingPlantilla] = useState(false);
  const [badgeFileInputKey, setBadgeFileInputKey] = useState(0);

  // Estados para cancelación y aviso a inscritos
  const [isCancelarModalOpen, setIsCancelarModalOpen] = useState(false);
  const [motivoCancelacion, setMotivoCancelacion] = useState('');
  const [canceling, setCanceling] = useState(false);

  const [isAvisarModalOpen, setIsAvisarModalOpen] = useState(false);
  const [avisoTitulo, setAvisoTitulo] = useState('');
  const [avisoMensaje, setAvisoMensaje] = useState('');
  const [avisoEnviarEmail, setAvisoEnviarEmail] = useState(true);
  const [avisoEstados, setAvisoEstados] = useState(['CONFIRMADA']);
  const [avisoSoloAsistentes, setAvisoSoloAsistentes] = useState(false);
  const [avisando, setAvisando] = useState(false);
  const [dryRunLoading, setDryRunLoading] = useState(false);
  const [dryRunResult, setDryRunResult] = useState(null);

  useEffect(() => {
    if (selectedEventoId) {
      void fetchPagosQr();
      void fetchParticipantesYEspera();
    } else {
      setPagosQr([]);
      setListaEspera([]);
    }
  }, [selectedEventoId]);

  const fetchPagosQr = async () => {
    setLoadingQr(true);
    try {
      const response = await api.get(`/eventos/${selectedEventoId}/pagos-qr`);
      setPagosQr(response.data || []);
    } catch (err) {
      console.error("Error fetching pagos qr:", err);
    } finally {
      setLoadingQr(false);
    }
  };

  const fetchParticipantesYEspera = async () => {
    if (!selectedEventoId) return;
    setLoadingParticipantes(true);
    try {
      const esperaData = await eventoService.getListaEspera(selectedEventoId);
      setListaEspera(esperaData || []);
    } catch (err) {
      console.error("Error fetching waitlist:", err);
    } finally {
      setLoadingParticipantes(false);
    }
  };

  const handleAprobarInscripcion = async (idInscripcion) => {
    try {
      await eventoService.aprobarInscripcion(idInscripcion);
      alert("Inscripción aprobada exitosamente. Se ha habilitado el cupo y notificado al participante.");
      await fetchParticipantesYEspera();
      if (fetchData) void fetchData();
    } catch (err) {
      console.error("Error al aprobar inscripción:", err);
      const detail = err.response?.data?.detail;
      alert(typeof detail === 'string' ? detail : "No se pudo aprobar la inscripción.");
    }
  };

  const handleAddPagoQr = async (e) => {
    e.preventDefault();
    if (!nuevoNombrePaquete || !nuevoMonto || !qrFile) {
      alert("Por favor, rellena todos los campos y selecciona la imagen del QR.");
      return;
    }

    const formData = new FormData();
    formData.append('nombre_paquete', nuevoNombrePaquete);
    formData.append('monto', nuevoMonto);
    formData.append('file', qrFile);

    try {
      setLoadingQr(true);
      await api.post(`/eventos/${selectedEventoId}/pagos-qr`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setNuevoNombrePaquete('');
      setNuevoMonto('');
      setQrFile(null);
      setFileInputKey(prev => prev + 1);
      
      await fetchPagosQr();
    } catch (err) {
      console.error("Error al añadir pago QR:", err);
      const detail = err.response?.data?.detail;
      alert(typeof detail === 'string' ? detail : "Error al guardar el paquete de pago QR.");
    } finally {
      setLoadingQr(false);
    }
  };

  const handleOpenEditPagoQr = (pkg) => {
    setEditQrDialog({
      open: true,
      idQr: pkg.id_qr,
      nombre_paquete: pkg.nombre_paquete,
      monto: pkg.monto.toString(),
      file: null,
      loading: false
    });
  };

  const handleSaveEditPagoQr = async () => {
    if (!editQrDialog.nombre_paquete.trim() || !editQrDialog.monto) {
      alert("Por favor indica el nombre del paquete y su precio.");
      return;
    }
    const formData = new FormData();
    formData.append('nombre_paquete', editQrDialog.nombre_paquete.trim());
    formData.append('monto', editQrDialog.monto);
    if (editQrDialog.file) {
      formData.append('file', editQrDialog.file);
    }

    setEditQrDialog(prev => ({ ...prev, loading: true }));
    try {
      await api.put(`/eventos/pagos-qr/${editQrDialog.idQr}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setEditQrDialog({ open: false, idQr: null, nombre_paquete: '', monto: '', file: null, loading: false });
      await fetchPagosQr();
    } catch (err) {
      console.error("Error al actualizar pago QR:", err);
      const detail = err.response?.data?.detail;
      alert(typeof detail === 'string' ? detail : "Error al actualizar el paquete de pago QR.");
      setEditQrDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDeletePagoQr = async (idQr) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este paquete de pago y QR?")) {
      return;
    }
    try {
      setLoadingQr(true);
      await api.delete(`/eventos/pagos-qr/${idQr}`);
      await fetchPagosQr();
    } catch (err) {
      console.error("Error al eliminar pago QR:", err);
      alert("Error al eliminar el paquete de pago QR.");
    } finally {
      setLoadingQr(false);
    }
  };

  const handleCancelarEvento = async () => {
    if (!motivoCancelacion.trim()) {
      alert("Debes indicar un motivo de cancelación.");
      return;
    }
    setCanceling(true);
    try {
      await eventoService.cancelarEvento(selectedEventoId, motivoCancelacion.trim());
      alert("Evento cancelado correctamente. Se notificó a todos los inscritos.");
      setIsCancelarModalOpen(false);
      setMotivoCancelacion('');
      if (fetchData) void fetchData();
    } catch (err) {
      console.error("Error al cancelar evento:", err);
      const detail = err.response?.data?.detail;
      alert(typeof detail === 'string' ? detail : "No se pudo cancelar el evento.");
    } finally {
      setCanceling(false);
    }
  };

  const toggleAvisoEstado = (estado) => {
    setAvisoEstados((prev) => {
      if (prev.includes(estado)) {
        const next = prev.filter((s) => s !== estado);
        return next.length > 0 ? next : ['CONFIRMADA'];
      }
      return [...prev, estado];
    });
  };

  const handleDryRunAviso = async () => {
    if (!avisoTitulo.trim() || !avisoMensaje.trim()) {
      alert("El título y el mensaje son obligatorios para simular el envío.");
      return;
    }
    setDryRunLoading(true);
    try {
      const res = await eventoService.avisarInscritos(selectedEventoId, {
        titulo: avisoTitulo.trim(),
        mensaje: avisoMensaje.trim(),
        enviar_email: true,
        estados_inscripcion: avisoEstados,
        solo_asistentes: avisoSoloAsistentes,
        dry_run: true,
      });
      setDryRunResult(res);
    } catch (err) {
      console.error("Error en dry-run de aviso:", err);
      const detail = err.response?.data?.detail;
      alert(typeof detail === 'string' ? detail : "No se pudo simular el envío del aviso.");
    } finally {
      setDryRunLoading(false);
    }
  };

  const handleAvisarInscritos = async () => {
    if (!avisoTitulo.trim() || !avisoMensaje.trim()) {
      alert("El título y el mensaje son obligatorios.");
      return;
    }
    setAvisando(true);
    try {
      const res = await eventoService.avisarInscritos(selectedEventoId, {
        titulo: avisoTitulo.trim(),
        mensaje: avisoMensaje.trim(),
        enviar_email: avisoEnviarEmail,
        estados_inscripcion: avisoEstados,
        solo_asistentes: avisoSoloAsistentes,
        dry_run: false,
      });
      const count = res.destinatarios_notificados ?? res.inscritos_notificados ?? 0;
      if (notify) {
        notify("Aviso emitido", `Aviso enviado con éxito a ${count} participantes.`, "success");
      } else {
        alert(`Aviso enviado con éxito a ${count} participantes.`);
      }
      setDryRunResult(null);
      setIsAvisarModalOpen(false);
      setAvisoTitulo('');
      setAvisoMensaje('');
      setAvisoEnviarEmail(true);
      setAvisoEstados(['CONFIRMADA']);
      setAvisoSoloAsistentes(false);
    } catch (err) {
      console.error("Error al avisar a los inscritos:", err);
      const detail = err.response?.data?.detail;
      alert(typeof detail === 'string' ? detail : "No se pudo enviar el aviso a los inscritos.");
    } finally {
      setAvisando(false);
    }
  };

  const [approvingLote, setApprovingLote] = useState(false);

  const handleExportCsv = async () => {
    if (!currentEvent) return;
    try {
      await eventoService.exportInscritosCsv(currentEvent.id_evento, currentEvent.titulo);
      if (notify) notify("CSV descargado", "La lista de inscritos se descargó correctamente", "success");
      else alert("La lista de inscritos se descargó correctamente.");
    } catch (err) {
      console.error("Error al exportar CSV:", err);
      alert("No se pudo exportar la lista de inscritos.");
    }
  };

  const handleDuplicarEvento = async () => {
    if (!currentEvent) return;
    if (!window.confirm(`¿Deseas duplicar el evento "${currentEvent.titulo}"? Se creará una copia con los mismos datos y agenda sin inscripciones.`)) {
      return;
    }
    try {
      const nuevoEvento = await eventoService.duplicarEvento(currentEvent.id_evento);
      if (notify) notify("Evento duplicado", `Se ha creado "${nuevoEvento.titulo}"`, "success");
      else alert(`Evento duplicado con éxito: "${nuevoEvento.titulo}"`);
      if (fetchData) void fetchData();
      setSelectedEventoId(nuevoEvento.id_evento);
    } catch (err) {
      console.error("Error al duplicar evento:", err);
      alert("No se pudo duplicar el evento.");
    }
  };

  const handleAprobarLoteEspera = async () => {
    if (!selectedEventoId) return;
    if (!window.confirm("¿Aprobar todos los participantes posibles de la lista de espera según los cupos disponibles?")) {
      return;
    }
    setApprovingLote(true);
    try {
      const res = await eventoService.aprobarListaEsperaLote(selectedEventoId);
      alert(`Se aprobaron ${res.aprobados} inscripciones en lote. Restantes en espera: ${res.restantes_en_espera}.`);
      await fetchParticipantesYEspera();
      if (fetchData) void fetchData();
    } catch (err) {
      console.error("Error al aprobar en lote:", err);
      const detail = err.response?.data?.detail;
      alert(typeof detail === 'string' ? detail : "No se pudo realizar la aprobación en lote.");
    } finally {
      setApprovingLote(false);
    }
  };

  const handleUploadPlantillaBadge = async () => {
    if (!selectedEventoId || !badgePlantillaFile) return;
    setUploadingPlantilla(true);
    try {
      await eventoService.uploadPlantillaBadge(selectedEventoId, badgePlantillaFile);
      if (notify) notify("Plantilla actualizada", "La plantilla de badge social del evento se ha subido correctamente.", "success");
      else alert("Plantilla de badge actualizada con éxito.");
      setBadgePlantillaFile(null);
      setBadgeFileInputKey(prev => prev + 1);
      if (fetchData) void fetchData();
    } catch (err) {
      console.error("Error al subir plantilla de badge:", err);
      const detail = err.response?.data?.detail;
      if (notify) notify("Error", typeof detail === 'string' ? detail : "No se pudo subir la plantilla de badge.", "error");
      else alert(typeof detail === 'string' ? detail : "Error al subir la plantilla.");
    } finally {
      setUploadingPlantilla(false);
    }
  };

  useEffect(() => {
    if (isEditingEvento && selectedEventoId) {
      const ev = eventosList.find(e => e.id_evento === selectedEventoId);
      if (ev) {
        setAgenda(ev.agenda ? JSON.parse(ev.agenda) : []);
        setSelectedSpeakers(ev.speakers ? ev.speakers.map(s => s.id_speaker) : []);
      }
    } else if (!isAddingEvento) {
      setAgenda([]);
      setSelectedSpeakers([]);
    }
  }, [isEditingEvento, selectedEventoId, isAddingEvento, eventosList]);

  const validateForm = () => {
    const newErrors = {};
    if (!newEvento.titulo) newErrors.titulo = t("admin_event_title_required");
    if (!newEvento.fecha_inicio) newErrors.fecha_inicio = t("admin_event_date_required");
    if (!newEvento.hora_inicio) newErrors.hora_inicio = t("admin_event_time_required");
    if (!newEvento.ubicacion) newErrors.ubicacion = t("admin_event_location_required");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSave = () => {
    if (validateForm()) {
      handleSaveEvento({
        ...newEvento,
        agenda: JSON.stringify(agenda),
        id_speakers: selectedSpeakers
      });
    }
  };

  const addAgendaItem = () => {
    setAgenda([...agenda, { hora: '18:00', actividad: '', id_speaker: null }]);
  };

  const removeAgendaItem = (index) => {
    setAgenda(agenda.filter((_, i) => i !== index));
  };

  const updateAgendaItem = (index, field, value) => {
    const updated = [...agenda];
    updated[index][field] = value;
    setAgenda(updated);
  };

  const toggleSpeaker = (id) => {
    if (selectedSpeakers.includes(id)) {
      setSelectedSpeakers(selectedSpeakers.filter(s => s !== id));
    } else {
      setSelectedSpeakers([...selectedSpeakers, id]);
    }
  };

  // Asegurar orden correlativo descendente (más nuevo primero) en el sidebar
  const sortedEventosList = [...(eventosList || [])].sort(
    (a, b) => (b.id_evento || 0) - (a.id_evento || 0)
  );
  const currentEvent = sortedEventosList.find(e => e.id_evento === selectedEventoId);

  const handleDownloadEventoQr = async () => {
    if (!currentEvent) return;
    try {
      await eventoService.downloadEventoQr(currentEvent.id_evento, currentEvent.titulo);
    } catch (err) {
      console.error("Error al descargar QR del evento:", err);
      alert("Error al descargar el código QR del evento.");
    }
  };

  return (
    <div className={styles.grid}>
      <div className={styles.sidebar}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <MEHTypography variant="h3">{t("admin_active_events")}</MEHTypography>
          <MEHButton size="small" icon={<Add24Regular />} appearance="primary" onClick={() => { setIsAddingEvento(true); setIsEditingEvento(false); setNewEvento({ titulo: '', descripcion: '', tipo_evento: 'CONFERENCIA', fecha_inicio: '', hora_inicio: '', modalidad: 'PRESENCIAL', ubicacion: '', link_mapas: '', capacidad_max: 50, refrigerio_incluido: false, incluidos: '' }); setAgenda([]); setSelectedSpeakers([]); }}>
            {t("admin_new_event") || "Nuevo Evento"}
          </MEHButton>
        </div>
        <Divider />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: 'calc(100vh - 250px)', paddingRight: '4px' }}>
          {sortedEventosList.map(ev => (
            <div 
              key={`ev-${ev.id_evento}`} 
              className={`${styles.selectableCard} ${selectedEventoId === ev.id_evento ? styles.activeItem : ''}`} 
              onClick={() => { setIsAddingEvento(false); setSelectedEventoId(ev.id_evento); }}
            >
              <div style={{display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between', width: '100%', minWidth: 0}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1}}>
                  <Badge color={ev.tipo_evento === 'HACKATHON' ? 'important' : 'brand'} style={{ flexShrink: 0 }}>{ev.tipo_evento?.charAt(0)}</Badge>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <b style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.titulo}</b>
                    <MEHTypography variant="caption">{new Date(ev.fecha_inicio).toLocaleDateString()}</MEHTypography>
                  </div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <EventoItemBadge ev={ev} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className={styles.detailsContainer}>
        {isAddingEvento ? (
          <div className={styles.formPanel}>
            <MEHTypography variant="h2">{isEditingEvento ? t("edit") : t("admin_schedule")} {t("event")}</MEHTypography>
            
            <Field label={t("admin_event_title")} required validationState={errors.titulo ? "error" : "none"} validationMessage={errors.titulo}>
              <Input value={newEvento.titulo} onChange={(e, d) => setNewEvento({...newEvento, titulo: d.value})} />
            </Field>

            <Field label={t("admin_description")}>
              <Textarea rows={3} value={newEvento.descripcion} onChange={(e, d) => setNewEvento({...newEvento, descripcion: d.value})} placeholder={t("admin_event_description_placeholder")} />
            </Field>

            <div className={styles.formTwoCol}>
              <Field label={t("type")}>
                <Select value={newEvento.tipo_evento} onChange={(e) => setNewEvento({...newEvento, tipo_evento: e.target.value})}>
                  <option value="CONFERENCIA">{t("CONFERENCIA")}</option>
                  <option value="HACKATHON">{t("HACKATHON")}</option>
                  <option value="TALLER">{t("TALLER")}</option>
                  <option value="BOOTCAMP">{t("BOOTCAMP")}</option>
                  <option value="NETWORKING">{t("NETWORKING")}</option>
                </Select>
              </Field>
              <Field label={t("admin_modality")}>
                <Select value={newEvento.modalidad} onChange={(e) => setNewEvento({...newEvento, modalidad: e.target.value})}>
                  <option value="PRESENCIAL">{t("PRESENCIAL")}</option>
                  <option value="VIRTUAL">{t("VIRTUAL")}</option>
                  <option value="HIBRIDO">{t("HIBRIDO")}</option>
                </Select>
              </Field>
            </div>

            <div className={styles.formThreeCol}>
              <Field label={t("admin_start_date")} required validationState={errors.fecha_inicio ? "error" : "none"} validationMessage={errors.fecha_inicio}>
                <Input type="date" value={newEvento.fecha_inicio} onChange={(e, d) => setNewEvento({...newEvento, fecha_inicio: d.value})} />
              </Field>
              <Field label={t("admin_start_time")} required validationState={errors.hora_inicio ? "error" : "none"} validationMessage={errors.hora_inicio}>
                <Input type="time" value={newEvento.hora_inicio} onChange={(e, d) => setNewEvento({...newEvento, hora_inicio: d.value})} />
              </Field>
              <Field label={t("admin_max_capacity")}>
                <Input type="number" value={newEvento.capacidad_max} onChange={(e, d) => setNewEvento({...newEvento, capacidad_max: d.value})} />
              </Field>
            </div>

            {isEditingEvento && (
              <div style={{ margin: '4px 0 8px 0' }}>
                <Checkbox 
                  label="Auto-aprobar lista de espera si se aumentan los cupos"
                  checked={Boolean(newEvento.auto_aprobar_espera)}
                  onChange={(e, d) => setNewEvento({...newEvento, auto_aprobar_espera: d.checked})}
                />
              </div>
            )}

            <div className={styles.formTwoCol}>
              <Field label={t("admin_location")} required validationState={errors.ubicacion ? "error" : "none"} validationMessage={errors.ubicacion}>
                <Input contentBefore={<Map24Regular />} value={newEvento.ubicacion} onChange={(e, d) => setNewEvento({...newEvento, ubicacion: d.value})} placeholder={t("admin_location_placeholder")} />
              </Field>
              <Field label={t("admin_maps_link")}>
                <Input contentBefore={<Link24Regular />} value={newEvento.link_mapas} onChange={(e, d) => setNewEvento({...newEvento, link_mapas: d.value})} placeholder={t("admin_maps_link_placeholder")} />
              </Field>
            </div>

            <EventoPortadaUploader
              mode="form"
              evento={newEvento}
              notify={notify}
              onFormChange={(coverData) =>
                setNewEvento((prev) => ({
                  ...prev,
                  ...coverData,
                }))
              }
            />

            <Divider>{t("admin_invited_speakers")}</Divider>
            <div className={styles.speakerSelection}>
              {speakersList.map(s => (
                <Tooltip content={s.nombre} relationship="label" key={s.id_speaker}>
                  <Avatar 
                    size={48} 
                    name={s.nombre} 
                    image={{src: resolveApiFileUrl(s.foto_url)}} 
                    style={{ 
                      cursor: 'pointer', 
                      border: selectedSpeakers.includes(s.id_speaker) ? `3px solid ${tokens.colorBrandStroke1}` : 'none',
                      opacity: selectedSpeakers.includes(s.id_speaker) ? 1 : 0.5
                    }}
                    onClick={() => toggleSpeaker(s.id_speaker)}
                  />
                </Tooltip>
              ))}
            </div>

            <Divider>{t("admin_event_agenda")}</Divider>
            <div>
              {agenda.map((item, idx) => (
                <div key={idx} className={styles.agendaItem}>
                  <Input type="time" value={item.hora} onChange={(e, d) => updateAgendaItem(idx, 'hora', d.value)} style={{ width: '110px' }} />
                  <Input value={item.actividad} onChange={(e, d) => updateAgendaItem(idx, 'actividad', d.value)} placeholder={t("admin_activity_placeholder")} style={{ flexGrow: 1, minWidth: '150px' }} />
                  <Select value={item.id_speaker || ''} onChange={(e) => updateAgendaItem(idx, 'id_speaker', e.target.value)} style={{ minWidth: '150px' }}>
                    <option value="">{t("admin_no_speaker")}</option>
                    {speakersList.filter(s => selectedSpeakers.includes(s.id_speaker)).map(s => (
                      <option key={s.id_speaker} value={s.id_speaker}>{s.nombre}</option>
                    ))}
                  </Select>
                  <Button icon={<Dismiss24Regular />} appearance="subtle" onClick={() => removeAgendaItem(idx)} />
                </div>
              ))}
              <MEHButton icon={<Add24Regular />} appearance="subtle" onClick={addAgendaItem}>{t("admin_add_agenda_block")}</MEHButton>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Field label="Ítems Incluidos para Entrega Logística (Separados por coma: comida, souvenirs, kits...)">
                <Input 
                  value={newEvento.incluidos || ''} 
                  onChange={(e, d) => setNewEvento({...newEvento, incluidos: d.value})} 
                  placeholder="Ej: Refrigerio, Kit de bienvenida, Souvenirs" 
                />
              </Field>
              <Switch label={t("admin_includes_catering")} checked={newEvento.refrigerio_incluido} onChange={(e, d) => setNewEvento({...newEvento, refrigerio_incluido: d.checked})} />
              <Switch 
                label="Evento Publicado (Activo en Plataforma)" 
                checked={newEvento.id_estado !== 1} 
                onChange={(e, d) => setNewEvento({...newEvento, id_estado: d.checked ? 2 : 1})} 
              />
            </div>
            
            <div style={{display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap'}}>
              <MEHButton onClick={onSave} appearance="primary" size="large">{t("admin_save_event")}</MEHButton>
              <Button onClick={() => setIsAddingEvento(false)} size="large">{t("cancel")}</Button>
            </div>
          </div>
        ) : selectedEventoId && currentEvent ? (
          <div style={{ minWidth: 0, width: '100%' }}>
            {/* Cabecera Estética y Responsive del Evento */}
            <div className={styles.headerHeroCard}>
              {/* Fila 1: Badges de estado, tipo y Switch de activación */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <Badge color="brand" appearance="filled">{t(currentEvent.tipo_evento)}</Badge>
                  {currentEvent.estado === 'CANCELADO' ? (
                    <Badge color="danger" appearance="filled" size="large">CANCELADO</Badge>
                  ) : (
                    <Badge color={currentEvent.id_estado === 1 ? 'warning' : 'success'} appearance="filled">
                      {currentEvent.id_estado === 1 ? 'INACTIVO' : 'ACTIVO'}
                    </Badge>
                  )}
                  <Badge appearance="outline" color="brand">
                    Cupos: {currentEvent.cupos_ocupados || 0} / {currentEvent.capacidad_max || currentEvent.capacidad_maxima || 50}
                  </Badge>
                  {currentEvent.cupos_disponibles !== undefined && (
                    <Badge appearance="tint" color={currentEvent.cupos_disponibles > 0 ? "success" : "warning"}>
                      {currentEvent.cupos_disponibles} disponibles
                    </Badge>
                  )}
                  <Badge appearance="tint" color="informative">
                    {listaEspera.length || currentEvent.total_en_espera || 0} en lista de espera
                  </Badge>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {currentEvent.estado !== 'CANCELADO' && (
                    <MEHButton
                      size="small"
                      appearance={currentEvent.estado === 'FINALIZADO' ? "primary" : "outline"}
                      style={currentEvent.estado === 'FINALIZADO' ? {} : { color: tokens.colorPaletteDarkOrangeForeground1 }}
                      onClick={async () => {
                        try {
                          const nuevoEstado = currentEvent.estado === 'FINALIZADO' ? 'EN_CURSO' : 'FINALIZADO';
                          await api.put(`/eventos/${selectedEventoId}`, { estado: nuevoEstado });
                          notify("Éxito", nuevoEstado === 'FINALIZADO' ? "Evento finalizado / inscripciones cerradas" : "Inscripciones reabiertas para el evento", "success");
                          void fetchData();
                        } catch (err) {
                          notify("Error", "No se pudo actualizar el estado del evento", "error");
                        }
                      }}
                    >
                      {currentEvent.estado === 'FINALIZADO' ? "🔓 Reabrir Inscripciones" : "🔒 Cerrar Evento / Inscripciones"}
                    </MEHButton>
                  )}
                  <Switch 
                    label={currentEvent.id_estado === 1 ? "Activar Evento" : "Desactivar Evento"} 
                    checked={currentEvent.id_estado !== 1} 
                    onChange={async (e, d) => {
                      try {
                        const newStatus = d.checked ? 2 : 1;
                        await api.put(`/eventos/${selectedEventoId}`, { id_estado: newStatus });
                        void fetchData();
                      } catch (err) {
                        console.error("Error al cambiar estado del evento", err);
                      }
                    }} 
                  />
                </div>
              </div>

              {/* Fila 2: Título principal */}
              <MEHTypography
                variant="h1"
                style={{
                  margin: 0,
                  fontSize: 'clamp(1.35rem, 2.8vw, 1.95rem)',
                  lineHeight: 1.25,
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                }}
              >
                {currentEvent.titulo}
              </MEHTypography>

              {currentEvent.estado === 'CANCELADO' && (
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: tokens.colorPaletteRedBackground1,
                  border: `1px solid ${tokens.colorPaletteRedBorder2}`,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <DismissCircle24Regular style={{ color: tokens.colorPaletteRedForeground1, flexShrink: 0 }} />
                  <MEHTypography variant="caption" style={{ color: tokens.colorPaletteRedForeground1 }}>
                    <b>Evento cancelado:</b> {currentEvent.motivo_cancelacion || 'Sin motivo especificado.'}
                  </MEHTypography>
                </div>
              )}

              {/* Fila 3: Fecha, Hora y Ubicación */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.85 }}>
                  <CalendarLtr24Regular fontSize="18px" style={{ color: tokens.colorBrandForeground1 }} />
                  <span>{new Date(currentEvent.fecha_inicio).toLocaleDateString()}</span>
                </div>
                {currentEvent.hora_inicio && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.85 }}>
                    <Clock24Regular fontSize="18px" style={{ color: tokens.colorBrandForeground1 }} />
                    <span>{currentEvent.hora_inicio}</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', minWidth: 0 }}>
                  <MEHTypography variant="body" style={{ opacity: 0.85, overflowWrap: 'anywhere' }}>
                    <Map24Regular fontSize="18px" style={{ verticalAlign: 'middle', marginRight: '4px', color: tokens.colorBrandForeground1 }} />
                    {currentEvent.ubicacion}
                  </MEHTypography>
                  {currentEvent.link_mapas && (
                    <MEHButton size="small" appearance="outline" icon={<Link24Regular />} onClick={() => window.open(currentEvent.link_mapas, '_blank')}>
                      {t("admin_view_in_maps")}
                    </MEHButton>
                  )}
                </div>
              </div>

              {/* Ítems Incluidos */}
              {(currentEvent.incluidos || currentEvent.refrigerio_incluido) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <MEHTypography variant="caption" style={{ fontWeight: 'bold', opacity: 0.8 }}>🎁 Incluidos (Checkpoints automáticos):</MEHTypography>
                  {currentEvent.refrigerio_incluido && <Badge appearance="outline" color="success">Refrigerio</Badge>}
                  {currentEvent.incluidos && currentEvent.incluidos.split(',').map(s => s.trim()).filter(Boolean).map((item, idx) => (
                    <Badge key={idx} appearance="outline" color="brand">{item}</Badge>
                  ))}
                </div>
              )}

              {/* Fila 4: Barra de Herramientas y Acciones bien distribuida */}
              <div className={styles.actionToolbar}>
                <div className={styles.actionGroup}>
                  <MEHButton 
                    size="small" 
                    icon={<Share24Regular />} 
                    appearance="outline"
                    onClick={() => {
                      const url = `${window.location.origin}/evento/${currentEvent.id_evento}`;
                      void navigator.clipboard.writeText(url);
                      if (notify) notify("Enlace copiado", "Se ha copiado el enlace público del evento al portapapeles", "success");
                      else alert("¡Enlace público copiado al portapapeles!");
                    }}
                  >
                    {t("copy_link") || "Copiar link"}
                  </MEHButton>
                  <MEHButton size="small" icon={<Megaphone24Regular />} appearance="outline" onClick={() => setIsAvisarModalOpen(true)}>
                    Avisar inscritos
                  </MEHButton>
                  <MEHButton 
                    size="small" 
                    icon={<Share24Regular />} 
                    appearance="outline" 
                    onClick={() => setIsBadgeModalOpen(true)}
                  >
                    Badge Social
                  </MEHButton>
                  <MEHButton size="small" icon={<ArrowDownload24Regular />} onClick={() => { void handleDownloadEventoQr(); }}>
                    Descargar QR del Evento
                  </MEHButton>
                  <MEHButton 
                    size="small" 
                    icon={<DocumentTable24Regular />} 
                    appearance="outline" 
                    onClick={() => { void handleExportCsv(); }}
                  >
                    Exportar CSV
                  </MEHButton>
                </div>

                <div className={styles.actionGroup}>
                  <MEHButton 
                    size="small" 
                    icon={<Copy24Regular />} 
                    appearance="outline" 
                    onClick={() => { void handleDuplicarEvento(); }}
                  >
                    Duplicar
                  </MEHButton>
                  <MEHButton size="small" appearance="primary" icon={<Edit24Regular />} onClick={() => handleEditEvento(currentEvent)}>
                    {t("edit")}
                  </MEHButton>
                  {currentEvent.estado !== 'CANCELADO' && (
                    <MEHButton 
                      size="small" 
                      icon={<DismissCircle24Regular />} 
                      appearance="subtle" 
                      style={{ color: tokens.colorPaletteRedForeground1 }} 
                      onClick={() => setIsCancelarModalOpen(true)}
                    >
                      Cancelar evento
                    </MEHButton>
                  )}
                  <Button
                    icon={<Delete24Regular />}
                    size="small"
                    appearance="subtle"
                    aria-label="Eliminar evento"
                    style={{ color: tokens.colorPaletteRedForeground1 }}
                    onClick={() => confirmDelete('evento', selectedEventoId, t("event").toLowerCase())}
                  />
                </div>
              </div>
            </div>

            <div className={styles.twoColResponsive}>
                <div className={styles.infoCard}>
                    <MEHTypography variant="h3"><Mic24Regular style={{ verticalAlign: 'middle', marginRight: '6px' }} /> {t("speakers")}</MEHTypography>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {currentEvent.speakers?.length > 0 ? currentEvent.speakers.map(s => (
                            <Tooltip content={s.nombre} relationship="label" key={s.id_speaker}>
                                <Avatar size={48} name={s.nombre} image={{src: resolveApiFileUrl(s.foto_url)}} />
                            </Tooltip>
                        )) : <MEHTypography variant="caption">{t("admin_no_speakers_assigned")}</MEHTypography>}
                    </div>
                </div>
                <div className={styles.infoCard}>
                    <MEHTypography variant="h3"><PeopleTeam24Regular style={{ verticalAlign: 'middle', marginRight: '6px' }} /> {t("management")}</MEHTypography>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <MEHButton 
                          icon={<QrCode24Regular />} 
                          appearance="primary"
                          onClick={() => navigate(`/escaneo-qr?eventoId=${currentEvent?.id_evento || selectedEventoId}`)}
                        >
                          {t("admin_scan_qr")}
                        </MEHButton>
                        <MEHButton 
                          appearance="outline"
                          onClick={() => {
                            const el = document.getElementById('panel-acreditacion');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          {t("admin_attendance_list")}
                        </MEHButton>
                    </div>
                </div>
            </div>

            {/* Gestión de Paquetes y QRs de Pago */}
            <div className={styles.infoCard} style={{ backgroundColor: tokens.colorNeutralBackground2, marginBottom: '24px' }}>
                <div>
                  <MEHTypography variant="h3"><ReceiptMoney24Filled style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Paquetes de Inscripción y QRs de Pago</MEHTypography>
                  <MEHTypography variant="caption" style={{ opacity: 0.7, marginTop: '4px' }}>Define los paquetes (ej. VIP, General) y sube su correspondiente código QR de pago para que los usuarios puedan escanearlo y pagar.</MEHTypography>
                </div>
                
                {loadingQr ? (
                    <Spinner size="small" label="Cargando paquetes de pago..." />
                ) : pagosQr.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                        {pagosQr.map(pkg => (
                            <div key={pkg.id_qr} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', padding: '12px', backgroundColor: tokens.colorNeutralBackground1, borderRadius: '12px', border: `1px solid ${tokens.colorNeutralBackground3}` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <img src={resolveApiFileUrl(pkg.url_qr)} alt={pkg.nombre_paquete} style={{ width: '50px', height: '50px', objectFit: 'contain', backgroundColor: 'white', borderRadius: '4px', padding: '2px' }} />
                                    <div>
                                        <MEHTypography variant="body"><b>{pkg.nombre_paquete}</b></MEHTypography>
                                        <MEHTypography variant="caption" style={{ display: 'block', color: tokens.colorBrandForeground1, fontWeight: 'bold' }}>Bs. {pkg.monto}</MEHTypography>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Button icon={<Edit24Regular />} appearance="subtle" aria-label="Editar paquete" onClick={() => handleOpenEditPagoQr(pkg)} />
                                    <Button icon={<Delete24Regular />} appearance="subtle" aria-label="Eliminar paquete" style={{ color: tokens.colorPaletteRedForeground1 }} onClick={() => handleDeletePagoQr(pkg.id_qr)} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <MEHTypography variant="caption" style={{ display: 'block', padding: '12px', textAlign: 'center', opacity: 0.5 }}>
                        No hay paquetes de pago configurados. Se usará el fallback genérico.
                    </MEHTypography>
                )}

                <Divider style={{ margin: '12px 0' }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <MEHTypography variant="h4">Agregar Nuevo Paquete de Pago</MEHTypography>
                    <div className={styles.formTwoCol}>
                        <Field label="Nombre del Paquete" required>
                            <Input value={nuevoNombrePaquete} onChange={(e, d) => setNuevoNombrePaquete(d.value)} placeholder="Ej: Pase VIP, Acceso General" />
                        </Field>
                        <Field label="Precio (Bs.)" required>
                            <Input type="number" value={nuevoMonto} onChange={(e, d) => setNuevoMonto(d.value)} placeholder="0.00" />
                        </Field>
                    </div>
                    <Field label="Imagen Código QR de Pago" required>
                        <Input type="file" key={fileInputKey} id="qr-file-input" onChange={(e) => setQrFile(e.target.files[0])} accept="image/*,application/pdf" />
                    </Field>
                    <MEHButton appearance="primary" onClick={handleAddPagoQr} disabled={loadingQr || !nuevoNombrePaquete || !nuevoMonto || !qrFile} style={{ marginTop: '4px' }}>
                        Guardar Paquete y QR
                    </MEHButton>
                </div>
            </div>

            {/* Gestión de Imagen de Portada del Evento */}
            <div style={{ marginBottom: '24px' }}>
              <EventoPortadaUploader
                mode="detail"
                evento={currentEvent}
                notify={notify}
                onEventoUpdated={async () => {
                  if (fetchData) await fetchData();
                }}
              />
            </div>

            {/* Plantilla de Badge Social para Redes */}
            <div className={styles.infoCard} style={{ backgroundColor: tokens.colorNeutralBackground2, marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <MEHTypography variant="h3">
                    <Image24Regular style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                    Plantilla de Badge Social para Redes
                  </MEHTypography>
                  <MEHTypography variant="caption" style={{ opacity: 0.7, marginTop: '4px' }}>
                    Fondo personalizado de la credencial digital (1080x1350 px recomendado) que los participantes inscritos pueden descargar y compartir.
                  </MEHTypography>
                </div>
                <MEHButton size="small" appearance="outline" icon={<Share24Regular />} onClick={() => setIsBadgeModalOpen(true)}>
                  Previsualizar Badge
                </MEHButton>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '8px', flexWrap: 'wrap' }}>
                {currentEvent.plantilla_badge_url ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <img 
                      src={resolveApiFileUrl(currentEvent.plantilla_badge_url)} 
                      alt="Plantilla badge actual" 
                      style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: `1px solid ${tokens.colorNeutralBackground3}` }} 
                    />
                    <div>
                      <Badge color="success" appearance="tint">Plantilla personalizada activa</Badge>
                      <MEHTypography variant="caption" style={{ display: 'block', marginTop: '4px', opacity: 0.8 }}>
                        Los miembros verán este diseño personalizado en su credencial descargable.
                      </MEHTypography>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '12px 16px', backgroundColor: tokens.colorNeutralBackground1, borderRadius: '8px', border: `1px dashed ${tokens.colorNeutralBackground3}` }}>
                    <Badge color="informative" appearance="tint">Plantilla por defecto activa</Badge>
                    <MEHTypography variant="caption" style={{ display: 'block', marginTop: '4px', opacity: 0.7 }}>
                      Gradiente institucional MEH Cyberpunk (violeta oscuro y cyan). Sube una imagen personalizada para reemplazarlo.
                    </MEHTypography>
                  </div>
                )}
              </div>

              <Divider style={{ margin: '12px 0' }} />

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <Field label="Subir nueva plantilla de fondo (PNG, JPG, WebP)" style={{ flexGrow: 1, minWidth: '200px' }}>
                  <Input 
                    type="file" 
                    key={badgeFileInputKey} 
                    id="badge-plantilla-file-input" 
                    onChange={(e) => setBadgePlantillaFile(e.target.files[0])} 
                    accept="image/png,image/jpeg,image/webp" 
                  />
                </Field>
                <MEHButton 
                  appearance="primary" 
                  onClick={handleUploadPlantillaBadge} 
                  disabled={uploadingPlantilla || !badgePlantillaFile}
                >
                  {uploadingPlantilla ? "Subiendo..." : "Actualizar Plantilla"}
                </MEHButton>
              </div>
            </div>

            {/* Gestión de Lista de Espera y Participantes */}
            <div className={styles.infoCard} style={{ backgroundColor: tokens.colorNeutralBackground2, marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <MEHTypography variant="h3">
                  <PeopleTeam24Regular style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                  Lista de Espera y Participantes
                </MEHTypography>
                <MEHButton size="small" appearance="subtle" onClick={fetchParticipantesYEspera}>
                  Actualizar Lista
                </MEHButton>
              </div>

              {/* LISTA DE ESPERA */}
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                  <MEHTypography variant="h4" style={{ margin: 0 }}>
                    ⏳ Lista de Espera ({listaEspera.length} en espera de cupo)
                  </MEHTypography>
                  {listaEspera.length > 0 && (
                    <MEHButton 
                      size="small" 
                      appearance="primary" 
                      disabled={approvingLote}
                      onClick={() => { void handleAprobarLoteEspera(); }}
                    >
                      {approvingLote ? "Aprobando..." : "Aprobar cupos en lote"}
                    </MEHButton>
                  )}
                </div>
                <MEHTypography variant="caption" style={{ opacity: 0.7, display: 'block', marginBottom: '10px' }}>
                  Participantes en estado PENDIENTE_APROBACION por cupos completos. Si amplías la capacidad máxima, puedes aprobar a los participantes para confirmar su cupo.
                </MEHTypography>

                {loadingParticipantes ? (
                  <Spinner size="small" label="Cargando participantes..." />
                ) : listaEspera.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {listaEspera.map(item => (
                      <div key={item.id_inscripcion} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: tokens.colorNeutralBackground1, borderRadius: '10px', border: `1px solid ${tokens.colorNeutralBackground3}`, flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Avatar name={`${item.usuario?.nombres || ''} ${item.usuario?.apellidos || ''}`} size={36} />
                          <div>
                            <MEHTypography variant="body" style={{ fontWeight: 'bold' }}>
                              {item.usuario ? `${item.usuario.nombres} ${item.usuario.apellidos}` : `Inscripción #${item.id_inscripcion}`}
                            </MEHTypography>
                            <MEHTypography variant="caption" style={{ opacity: 0.7, display: 'block' }}>
                              {item.usuario?.email} • Registrado: {new Date(item.fecha_inscripcion).toLocaleDateString()}
                            </MEHTypography>
                          </div>
                        </div>
                        <MEHButton 
                          appearance="primary" 
                          size="small" 
                          onClick={() => handleAprobarInscripcion(item.id_inscripcion)}
                        >
                          Aprobar Cupo
                        </MEHButton>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '14px', textAlign: 'center', backgroundColor: tokens.colorNeutralBackground1, borderRadius: '10px' }}>
                    <MEHTypography variant="caption" style={{ opacity: 0.6 }}>No hay participantes en lista de espera para este evento.</MEHTypography>
                  </div>
                )}
              </div>

              <Divider style={{ margin: '16px 0' }} />

              {/* PANEL DE ACREDITACIÓN Y CONTROL DE ASISTENCIA */}
              <div id="panel-acreditacion" style={{ minWidth: 0, scrollMarginTop: '24px' }}>
                <AcreditacionPanel 
                  eventoId={selectedEventoId} 
                  eventoTitulo={currentEvent?.titulo}
                  onParticipantesChange={fetchParticipantesYEspera}
                />
              </div>

              <Divider style={{ margin: '16px 0' }} />

              {/* GESTIÓN DE CHECKPOINTS Y PERMISOS DE OPERADORES */}
              <div style={{ minWidth: 0 }}>
                <CheckpointPermisosPanel 
                  eventoId={selectedEventoId} 
                  eventoTitulo={currentEvent?.titulo}
                />
              </div>
            </div>

            {currentEvent.agenda && (
                <div className={styles.infoCard} style={{ backgroundColor: tokens.colorNeutralBackground2 }}>
                    <MEHTypography variant="h3">{t("agenda")}</MEHTypography>
                    {JSON.parse(currentEvent.agenda).map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', padding: '8px 0', borderBottom: `1px solid ${tokens.colorNeutralBackground3}` }}>
                            <b style={{ minWidth: '60px', color: tokens.colorBrandForeground1 }}>{item.hora}</b>
                            <div style={{ flexGrow: 1, minWidth: 0 }}>
                                <MEHTypography variant="body"><b>{item.actividad}</b></MEHTypography>
                                {item.id_speaker && (
                                    <MEHTypography variant="caption" style={{ opacity: 0.7 }}>
                                        {t("admin_with_speaker")}: {speakersList.find(s => s.id_speaker == item.id_speaker)?.nombre}
                                    </MEHTypography>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        ) : (
          <div style={{textAlign: 'center', padding: '64px 24px', opacity: 0.5}}>
            <CalendarLtr24Regular style={{fontSize: '64px'}} />
            <MEHTypography variant="h3">{t("admin_select_event_details")}</MEHTypography>
          </div>
        )}
      </div>

      {/* Modal Cancelar Evento */}
      <Dialog open={isCancelarModalOpen} onOpenChange={(e, d) => { if (!canceling) setIsCancelarModalOpen(d.open); }}>
        <DialogSurface style={{ backgroundColor: tokens.colorNeutralBackground1, maxWidth: '480px', width: '90%', borderRadius: '16px' }}>
          <DialogBody>
            <DialogTitle style={{ color: tokens.colorPaletteRedForeground1 }}>Cancelar Evento</DialogTitle>
            <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px 0' }}>
              <MEHTypography variant="body">
                ¿Estás seguro de que deseas cancelar <b>"{currentEvent?.titulo}"</b>?
              </MEHTypography>
              <MEHTypography variant="caption" style={{ opacity: 0.8 }}>
                Esta acción marcará el evento como <b>CANCELADO</b> manteniendo el historial, y enviará automáticamente un correo electrónico y una alerta en la plataforma a todos los participantes inscritos.
              </MEHTypography>
              <Field label="Motivo de Cancelación" required>
                <Textarea 
                  rows={3} 
                  value={motivoCancelacion} 
                  onChange={(e, d) => setMotivoCancelacion(d.value)} 
                  placeholder="Explica la razón por la cual se cancela el evento (ej: motivos de fuerza mayor, indisponibilidad del local, etc.)" 
                />
              </Field>
            </DialogContent>
            <DialogActions style={{ gap: '10px' }}>
              <Button appearance="secondary" onClick={() => setIsCancelarModalOpen(false)} disabled={canceling}>
                Volver
              </Button>
              <MEHButton 
                appearance="primary" 
                style={{ backgroundColor: tokens.colorPaletteRedBackground3, borderColor: tokens.colorPaletteRedBorder2 }} 
                onClick={() => { void handleCancelarEvento(); }}
                disabled={canceling || !motivoCancelacion.trim()}
              >
                {canceling ? "Cancelando..." : "Confirmar Cancelación"}
              </MEHButton>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Modal Avisar Inscritos */}
      <Dialog open={isAvisarModalOpen} onOpenChange={(e, d) => { if (!avisando && !dryRunLoading) setIsAvisarModalOpen(d.open); }}>
        <DialogSurface style={{ backgroundColor: tokens.colorNeutralBackground1, maxWidth: '560px', width: '92%', borderRadius: '16px' }}>
          <DialogBody>
            <DialogTitle><Megaphone24Regular style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Avisar a los Inscritos</DialogTitle>
            <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px 0' }}>
              <MEHTypography variant="caption" style={{ opacity: 0.8 }}>
                Envía un comunicado oficial a los participantes inscritos incluyendo la <b>cabecera del evento (portada 16:9, título y fecha)</b>. Puedes simular el envío (Dry-Run) sin disparar SMTP real.
              </MEHTypography>
              <Field label="Título del Comunicado" required>
                <Input 
                  value={avisoTitulo} 
                  onChange={(e, d) => setAvisoTitulo(d.value)} 
                  placeholder="Ej: Recordatorio: Llevar laptop y carnet" 
                />
              </Field>
              <Field label="Mensaje" required>
                <Textarea 
                  rows={4} 
                  value={avisoMensaje} 
                  onChange={(e, d) => setAvisoMensaje(d.value)} 
                  placeholder="Detalles importantes para los asistentes..." 
                />
              </Field>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px 12px', borderRadius: '10px', backgroundColor: tokens.colorNeutralBackground2 }}>
                <MEHTypography variant="caption" style={{ fontWeight: 'bold' }}>
                  Filtros de Audiencia del Evento:
                </MEHTypography>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <Checkbox
                    label="Confirmados"
                    checked={avisoEstados.includes('CONFIRMADA')}
                    onChange={() => toggleAvisoEstado('CONFIRMADA')}
                  />
                  <Checkbox
                    label="Pendientes de Pago"
                    checked={avisoEstados.includes('PENDIENTE')}
                    onChange={() => toggleAvisoEstado('PENDIENTE')}
                  />
                  <Checkbox
                    label="Lista de Espera"
                    checked={avisoEstados.includes('PENDIENTE_APROBACION')}
                    onChange={() => toggleAvisoEstado('PENDIENTE_APROBACION')}
                  />
                </div>
                <Checkbox
                  label="Solo asistentes acreditados (asistió = Sí)"
                  checked={avisoSoloAsistentes}
                  onChange={(e, d) => setAvisoSoloAsistentes(Boolean(d.checked))}
                />
              </div>

              <Switch 
                label="Enviar también notificación por correo electrónico" 
                checked={avisoEnviarEmail} 
                onChange={(e, d) => setAvisoEnviarEmail(d.checked)} 
              />
            </DialogContent>
            <DialogActions style={{ gap: '10px', flexWrap: 'wrap' }}>
              <Button appearance="secondary" onClick={() => setIsAvisarModalOpen(false)} disabled={avisando || dryRunLoading}>
                Cancelar
              </Button>
              <Button
                appearance="outline"
                data-testid="avisar-dry-run-btn"
                onClick={() => { void handleDryRunAviso(); }}
                disabled={avisando || dryRunLoading || !avisoTitulo.trim() || !avisoMensaje.trim()}
              >
                {dryRunLoading ? "Simulando..." : "Simular Dry-Run (Sin envío real)"}
              </Button>
              <MEHButton 
                appearance="primary" 
                onClick={() => { void handleAvisarInscritos(); }}
                disabled={avisando || dryRunLoading || !avisoTitulo.trim() || !avisoMensaje.trim()}
              >
                {avisando ? "Enviando..." : "Enviar Aviso"}
              </MEHButton>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <EmailDryRunModal
        open={Boolean(dryRunResult)}
        onClose={() => setDryRunResult(null)}
        dryRunResult={dryRunResult}
        sendingReal={avisando}
        onConfirmRealSend={() => {
          void handleAvisarInscritos();
        }}
      />

      {/* Modal Editar Paquete de Pago y QR */}
      <Dialog open={editQrDialog.open} onOpenChange={(e, d) => setEditQrDialog(prev => ({ ...prev, open: d.open }))}>
        <DialogSurface style={{ borderRadius: '16px', maxWidth: '480px', width: '90%' }}>
          <DialogBody>
            <DialogTitle>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit24Regular style={{ color: tokens.colorBrandForeground1 }} />
                <span>Editar Paquete de Pago #{editQrDialog.idQr}</span>
              </div>
            </DialogTitle>
            <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
              <Field label="Nombre del Paquete" required>
                <Input
                  value={editQrDialog.nombre_paquete}
                  onChange={(e, d) => setEditQrDialog(prev => ({ ...prev, nombre_paquete: d.value }))}
                  placeholder="Ej: Pase General, VIP"
                />
              </Field>
              <Field label="Precio (Bs.)" required>
                <Input
                  type="number"
                  value={editQrDialog.monto}
                  onChange={(e, d) => setEditQrDialog(prev => ({ ...prev, monto: d.value }))}
                  placeholder="0.00"
                />
              </Field>
              <Field label="Nueva Imagen QR (opcional)">
                <Input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setEditQrDialog(prev => ({ ...prev, file: e.target.files[0] || null }))}
                />
              </Field>
            </DialogContent>
            <DialogActions style={{ marginTop: '16px' }}>
              <Button appearance="secondary" onClick={() => setEditQrDialog(prev => ({ ...prev, open: false }))} disabled={editQrDialog.loading}>
                Cancelar
              </Button>
              <MEHButton
                appearance="primary"
                onClick={handleSaveEditPagoQr}
                disabled={editQrDialog.loading || !editQrDialog.nombre_paquete || !editQrDialog.monto}
              >
                {editQrDialog.loading ? <Spinner size="tiny" /> : 'Guardar Cambios'}
              </MEHButton>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Modal Badge Social */}
      <BadgeSocialModal 
        isOpen={isBadgeModalOpen} 
        onClose={() => setIsBadgeModalOpen(false)} 
        eventoId={selectedEventoId} 
        eventoTitulo={currentEvent?.titulo} 
      />
    </div>
  );
};

export default EventsTab;

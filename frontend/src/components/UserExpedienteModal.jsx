import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Badge,
  Spinner,
  TabList,
  Tab,
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  ProgressBar,
  Input,
  Label,
  Dropdown,
  Option,
  Checkbox,
  tokens,
  makeStyles,
  shorthands
} from '@fluentui/react-components';
import {
  Person24Regular,
  Calendar24Regular,
  ShoppingBag24Regular,
  Reward24Filled,
  HatGraduation24Regular,
  Mail24Regular,
  Building24Regular,
  Map24Regular,
  Globe24Regular,
  CheckmarkCircle24Filled,
  Warning24Filled,
  DismissCircle24Regular,
  Receipt24Regular,
  Open20Regular,
  Box24Filled,
  CalendarCheckmark24Regular,
  Money24Filled,
  DocumentRibbon24Regular,
  QrCode24Regular,
  Add24Regular,
  Dismiss24Regular,
  ArrowSync24Regular
} from '@fluentui/react-icons';
import { MEHButton, MEHTypography } from './ui';
import authService from '../services/authService';
import eventoService from '../services/eventoService';
import adminService from '../services/adminService';
import insigniasService from '../services/insigniasService';
import { resolveApiFileUrl } from '../services/api';
import { useNotify } from '../App';

const useStyles = makeStyles({
  surface: {
    borderRadius: '24px',
    maxWidth: '1100px',
    width: '95%',
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow28,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    '@media (max-width: 600px)': {
      padding: '16px',
      ...shorthands.borderRadius('16px'),
    }
  },
  headerBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    padding: '20px',
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRadius('18px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    flexWrap: 'wrap',
  },
  kpiRibbon: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '12px',
    marginTop: '16px',
    marginBottom: '16px',
  },
  kpiBox: {
    padding: '12px 14px',
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRadius('14px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3,
      ...shorthands.borderColor(tokens.colorBrandStroke1),
    }
  },
  tabWrapper: {
    marginTop: '10px',
    marginBottom: '16px',
  },
  contentPanel: {
    minHeight: '280px',
    maxHeight: '460px',
    overflowY: 'auto',
    paddingRight: '6px',
  },
  badgeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '12px',
  },
  badgeCard: {
    padding: '14px',
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRadius('14px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '8px',
    transition: 'transform 0.2s ease',
    ':hover': {
      transform: 'translateY(-2px)',
      ...shorthands.borderColor(tokens.colorBrandStroke1),
    }
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '14px',
  },
  infoCard: {
    padding: '14px',
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRadius('12px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  socialPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRadius('10px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    fontSize: '12px',
    textDecoration: 'none',
    color: tokens.colorNeutralForeground1,
    cursor: 'pointer',
    ':hover': {
      backgroundColor: tokens.colorBrandBackground2,
      ...shorthands.borderColor(tokens.colorBrandForeground1),
    }
  },
  tabHeaderActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    flexWrap: 'wrap',
    gap: '8px'
  }
});

const UserExpedienteModal = ({ open, onClose, userId, initialUser = null }) => {
  const styles = useStyles();
  const { notify } = useNotify();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('eventos');

  // Modal 1: Asignar Evento & Asistencia
  const [isAsignarEventoOpen, setIsAsignarEventoOpen] = useState(false);
  const [allEventos, setAllEventos] = useState([]);
  const [selectedEventoId, setSelectedEventoId] = useState('');
  const [marcarAsistio, setMarcarAsistio] = useState(true);
  const [loadingEventos, setLoadingEventos] = useState(false);
  const [savingEvento, setSavingEvento] = useState(false);

  // Modal 2: Asignar Souvenir
  const [isAsignarSouvenirOpen, setIsAsignarSouvenirOpen] = useState(false);
  const [allProductos, setAllProductos] = useState([]);
  const [selectedProductoId, setSelectedProductoId] = useState('');
  const [cantidadSouvenir, setCantidadSouvenir] = useState(1);
  const [metodoPago, setMetodoPago] = useState('CORTESIA');
  const [eventoAsociadoId, setEventoAsociadoId] = useState('');
  const [notasSouvenir, setNotasSouvenir] = useState('');
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [savingSouvenir, setSavingSouvenir] = useState(false);

  // Modal 3: Asignar Badge
  const [isAsignarBadgeOpen, setIsAsignarBadgeOpen] = useState(false);
  const [allBadges, setAllBadges] = useState([]);
  const [selectedBadgeId, setSelectedBadgeId] = useState('');
  const [loadingBadges, setLoadingBadges] = useState(false);
  const [savingBadge, setSavingBadge] = useState(false);

  // Loading estado para alternar asistencia individual
  const [togglingInscripcionId, setTogglingInscripcionId] = useState(null);

  useEffect(() => {
    if (open && userId) {
      setActiveTab('eventos');
      void fetchExpediente(userId);
    } else {
      setData(null);
    }
  }, [open, userId]);

  const fetchExpediente = async (id) => {
    setLoading(true);
    try {
      const res = await authService.getUsuarioExpediente(id);
      setData(res);
    } catch (err) {
      console.error('Error al cargar expediente del usuario:', err);
      notify('Error', err.response?.data?.detail || 'No se pudo cargar el expediente completo del miembro.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLER: Alternar Asistencia en un Evento Ya Asignado ---
  const handleToggleAsistencia = async (idInscripcion, titulo) => {
    try {
      setTogglingInscripcionId(idInscripcion);
      const res = await eventoService.toggleAsistenciaInscripcion(idInscripcion);
      notify("Asistencia Actualizada", res.mensaje || `Estado de asistencia actualizado para ${titulo}`, "success");
      await fetchExpediente(userId);
    } catch (err) {
      console.error("Error al alternar asistencia:", err);
      notify("Error", err.response?.data?.detail || "No se pudo actualizar la asistencia", "error");
    } finally {
      setTogglingInscripcionId(null);
    }
  };

  // --- HANDLERS: Asignar Evento & Asistencia Manual ---
  const handleOpenAsignarEvento = async () => {
    setIsAsignarEventoOpen(true);
    if (allEventos.length === 0) {
      setLoadingEventos(true);
      try {
        const evs = await eventoService.getEventos();
        setAllEventos(evs || []);
      } catch (err) {
        console.error("Error cargando eventos:", err);
      } finally {
        setLoadingEventos(false);
      }
    }
  };

  const handleSaveAsignarEvento = async () => {
    if (!selectedEventoId) {
      notify("Validación", "Por favor selecciona un evento de la lista.", "warning");
      return;
    }
    setSavingEvento(true);
    try {
      await eventoService.inscribirManual(Number(selectedEventoId), userId, "CONFIRMADA", Boolean(marcarAsistio));
      notify("Éxito", "Evento y asistencia registrados correctamente en el expediente.", "success");
      setIsAsignarEventoOpen(false);
      setSelectedEventoId('');
      await fetchExpediente(userId);
    } catch (err) {
      console.error("Error al asignar evento:", err);
      notify("Error", err.response?.data?.detail || "No se pudo asignar el evento al usuario", "error");
    } finally {
      setSavingEvento(false);
    }
  };

  // --- HANDLERS: Asignar / Registrar Souvenir Manual ---
  const handleOpenAsignarSouvenir = async () => {
    setIsAsignarSouvenirOpen(true);
    if (allProductos.length === 0) {
      setLoadingProductos(true);
      try {
        const [prods, evs] = await Promise.all([
          adminService.getSouvenirs(),
          allEventos.length > 0 ? Promise.resolve(allEventos) : eventoService.getEventos()
        ]);
        setAllProductos(prods || []);
        if (allEventos.length === 0) setAllEventos(evs || []);
      } catch (err) {
        console.error("Error cargando souvenirs:", err);
      } finally {
        setLoadingProductos(false);
      }
    }
  };

  const handleSaveAsignarSouvenir = async () => {
    if (!selectedProductoId) {
      notify("Validación", "Por favor selecciona un souvenir del inventario.", "warning");
      return;
    }
    const qty = parseInt(cantidadSouvenir, 10);
    if (isNaN(qty) || qty < 1) {
      notify("Validación", "La cantidad debe ser al menos 1 unidad.", "warning");
      return;
    }
    setSavingSouvenir(true);
    try {
      await adminService.registrarVentaSouvenir(
        userId,
        [{ id_producto: Number(selectedProductoId), cantidad: qty }],
        metodoPago,
        eventoAsociadoId ? Number(eventoAsociadoId) : null,
        notasSouvenir || "Asignación o corrección manual desde expediente"
      );
      notify("Éxito", "Souvenir registrado correctamente en el expediente del miembro.", "success");
      setIsAsignarSouvenirOpen(false);
      setSelectedProductoId('');
      setCantidadSouvenir(1);
      setNotasSouvenir('');
      await fetchExpediente(userId);
    } catch (err) {
      console.error("Error al registrar souvenir:", err);
      notify("Error", err.response?.data?.detail || "No se pudo registrar la asignación de souvenir", "error");
    } finally {
      setSavingSouvenir(false);
    }
  };

  // --- HANDLERS: Asignar Badge Manual ---
  const handleOpenAsignarBadge = async () => {
    setIsAsignarBadgeOpen(true);
    if (allBadges.length === 0) {
      setLoadingBadges(true);
      try {
        const bgs = await insigniasService.getInsignias();
        setAllBadges(bgs || []);
      } catch (err) {
        console.error("Error cargando insignias:", err);
      } finally {
        setLoadingBadges(false);
      }
    }
  };

  const handleSaveAsignarBadge = async () => {
    if (!selectedBadgeId) {
      notify("Validación", "Por favor selecciona una insignia.", "warning");
      return;
    }
    setSavingBadge(true);
    try {
      await insigniasService.asignarInsignia(userId, Number(selectedBadgeId));
      notify("Éxito", "Insignia otorgada exitosamente al miembro.", "success");
      setIsAsignarBadgeOpen(false);
      setSelectedBadgeId('');
      await fetchExpediente(userId);
    } catch (err) {
      console.error("Error al asignar insignia:", err);
      notify("Error", err.response?.data?.detail || "No se pudo otorgar la insignia", "error");
    } finally {
      setSavingBadge(false);
    }
  };

  const user = data?.usuario || initialUser || {};
  const resumen = data?.resumen || {
    total_eventos_inscritos: 0,
    total_eventos_asistidos: 0,
    total_compras: 0,
    total_gastado: 0,
    total_badges: 0,
    total_certificados: 0,
    total_cursos: 0
  };
  const eventos = data?.eventos || [];
  const compras = data?.compras || [];
  const badges = data?.badges || [];
  const certificados = data?.certificados || [];
  const cursos = data?.cursos || [];

  const isSuspended = user.activo === false || user.id_estado === 0;
  const isVerified = user.email_verificado !== false;

  const renderRoleBadge = (rol) => {
    const r = (rol || 'MIEMBRO').toUpperCase();
    let color = 'brand';
    if (r === 'ADMIN') color = 'danger';
    else if (r === 'ORGANIZADOR') color = 'warning';
    else if (r === 'MODERADOR') color = 'informative';
    else if (r === 'SOPORTE') color = 'success';
    return (
      <Badge appearance="filled" color={color} size="medium">
        {r}
      </Badge>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/D';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/D';
    try {
      const d = new Date(dateStr);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(e, d) => { if (!d.open) onClose(); }}>
      <DialogSurface className={styles.surface}>
        <DialogBody>
          <DialogTitle>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Person24Regular style={{ color: tokens.colorBrandForeground1 }} />
                <span>Expediente Integral de Usuario</span>
              </div>
              <Badge appearance="outline" size="medium">
                ID #{user.id_usuario || userId}
              </Badge>
            </div>
          </DialogTitle>

          <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '10px' }}>
            {/* 1. Header Banner con Foto, Nombres, Rol y Estados */}
            <div className={styles.headerBanner}>
              <Avatar
                size={72}
                name={`${user.nombres || ''} ${user.apellidos || ''}`}
                image={{ src: resolveApiFileUrl(user.foto_url) }}
                color="colorful"
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '20px', fontWeight: '800' }}>
                    {user.nombres} {user.apellidos}
                  </span>
                  {user.alias && (
                    <Badge appearance="outline" size="medium">
                      @{user.alias}
                    </Badge>
                  )}
                  {renderRoleBadge(user.rol)}
                  {isSuspended ? (
                    <Badge appearance="filled" color="danger">
                      SUSPENDIDO
                    </Badge>
                  ) : (
                    <Badge appearance="tint" color="success">
                      ACTIVO
                    </Badge>
                  )}
                  {isVerified ? (
                    <Badge appearance="tint" color="success" icon={<CheckmarkCircle24Filled />}>
                      Email Verificado
                    </Badge>
                  ) : (
                    <Badge appearance="tint" color="warning" icon={<Warning24Filled />}>
                      Email Pendiente
                    </Badge>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', fontSize: '13px', opacity: 0.75, flexWrap: 'wrap' }}>
                  <span>✉️ {user.correo}</span>
                  {user.institucion && <span>🏢 {user.institucion}</span>}
                  {user.departamento && <span>📍 {user.departamento}, {user.pais || 'Bolivia'}</span>}
                  <span>📅 Miembro desde: {formatDate(user.fecha_registro)}</span>
                </div>
              </div>
            </div>

            {/* 2. Ribbon de Métricas Clave (KPIs Rápidos) */}
            <div className={styles.kpiRibbon}>
              <div className={styles.kpiBox}>
                <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: tokens.colorBrandBackground2, color: tokens.colorBrandForeground1 }}>
                  <Calendar24Regular />
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', opacity: 0.7 }}>Eventos</div>
                  <div style={{ fontSize: '16px', fontWeight: '800' }}>
                    {resumen.total_eventos_asistidos} / {resumen.total_eventos_inscritos}
                  </div>
                  <div style={{ fontSize: '10px', opacity: 0.6 }}>asistidos</div>
                </div>
              </div>

              <div className={styles.kpiBox}>
                <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                  <ShoppingBag24Regular />
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', opacity: 0.7 }}>Compras</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#10b981' }}>
                    Bs. {Number(resumen.total_gastado || 0).toFixed(2)}
                  </div>
                  <div style={{ fontSize: '10px', opacity: 0.6 }}>{resumen.total_compras} pedido(s)</div>
                </div>
              </div>

              <div className={styles.kpiBox}>
                <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(234, 179, 8, 0.15)', color: '#eab308' }}>
                  <Reward24Filled />
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', opacity: 0.7 }}>Badges</div>
                  <div style={{ fontSize: '16px', fontWeight: '800' }}>
                    {resumen.total_badges}
                  </div>
                  <div style={{ fontSize: '10px', opacity: 0.6 }}>insignias ganadas</div>
                </div>
              </div>

              <div className={styles.kpiBox}>
                <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                  <DocumentRibbon24Regular />
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', opacity: 0.7 }}>Certificados</div>
                  <div style={{ fontSize: '16px', fontWeight: '800' }}>
                    {resumen.total_certificados}
                  </div>
                  <div style={{ fontSize: '10px', opacity: 0.6 }}>emitidos</div>
                </div>
              </div>

              <div className={styles.kpiBox}>
                <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
                  <HatGraduation24Regular />
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', opacity: 0.7 }}>Cursos</div>
                  <div style={{ fontSize: '16px', fontWeight: '800' }}>
                    {resumen.total_cursos}
                  </div>
                  <div style={{ fontSize: '10px', opacity: 0.6 }}>inscrito(s)</div>
                </div>
              </div>
            </div>

            {/* 3. Pestañas de Navegación del Expediente */}
            <div className={styles.tabWrapper}>
              <TabList selectedValue={activeTab} onTabSelect={(e, d) => setActiveTab(d.value)}>
                <Tab value="eventos" icon={<Calendar24Regular />}>
                  Eventos & Asistencias ({eventos.length})
                </Tab>
                <Tab value="compras" icon={<ShoppingBag24Regular />}>
                  Compras & Souvenirs ({compras.length})
                </Tab>
                <Tab value="badges" icon={<Reward24Filled />}>
                  Insignias & Certificados ({badges.length + certificados.length})
                </Tab>
                <Tab value="cursos" icon={<HatGraduation24Regular />}>
                  Cursos LMS ({cursos.length})
                </Tab>
                <Tab value="perfil" icon={<Person24Regular />}>
                  Ficha Técnica & Bio
                </Tab>
              </TabList>
            </div>

            {/* 4. Contenido de la Pestaña Activa */}
            <div className={styles.contentPanel}>
              {loading ? (
                <div style={{ padding: '50px', textAlign: 'center' }}>
                  <Spinner size="medium" label="Cargando información completa del miembro..." />
                </div>
              ) : (
                <>
                  {/* PESTAÑA 1: EVENTOS & ASISTENCIA */}
                  {activeTab === 'eventos' && (
                    <div>
                      <div className={styles.tabHeaderActions}>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', opacity: 0.8 }}>
                          Historial de Eventos Registrados ({eventos.length})
                        </div>
                        <MEHButton
                          appearance="primary"
                          size="small"
                          icon={<Add24Regular />}
                          onClick={handleOpenAsignarEvento}
                        >
                          + Asignar Evento / Asistencia
                        </MEHButton>
                      </div>

                      {eventos.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', opacity: 0.7, backgroundColor: tokens.colorNeutralBackground2, borderRadius: '14px' }}>
                          <Calendar24Regular fontSize={40} style={{ marginBottom: '8px' }} />
                          <div style={{ fontWeight: 'bold' }}>Sin eventos registrados</div>
                          <div style={{ fontSize: '12px', marginTop: '4px' }}>
                            Usa el botón superior para inscribirlo o acreditarlo manualmente en cualquier evento.
                          </div>
                        </div>
                      ) : (
                        <Table size="medium" style={{ minWidth: '860px', width: '100%' }}>
                          <TableHeader>
                            <TableRow>
                              <TableHeaderCell style={{ width: '120px' }}>Fecha Evento</TableHeaderCell>
                              <TableHeaderCell>Evento & Modalidad</TableHeaderCell>
                              <TableHeaderCell style={{ width: '120px' }}>Inscripción</TableHeaderCell>
                              <TableHeaderCell style={{ width: '180px' }}>Asistencia / Check-in</TableHeaderCell>
                              <TableHeaderCell style={{ width: '90px' }}>Ticket QR</TableHeaderCell>
                              <TableHeaderCell style={{ width: '160px', textAlign: 'center' }}>Acción / Corrección</TableHeaderCell>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {eventos.map(ev => {
                              const isToggling = togglingInscripcionId === ev.id_inscripcion;
                              return (
                                <TableRow key={`ev-${ev.id_inscripcion}`}>
                                  <TableCell>
                                    <div style={{ fontSize: '13px', fontWeight: '600' }}>
                                      {formatDate(ev.fecha_inicio)}
                                    </div>
                                    {ev.hora_inicio && (
                                      <div style={{ fontSize: '11px', opacity: 0.65 }}>
                                        {ev.hora_inicio}
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{ev.titulo}</div>
                                    <div style={{ fontSize: '12px', opacity: 0.75, display: 'flex', gap: '8px', marginTop: '2px' }}>
                                      <Badge appearance="outline" size="small">{ev.modalidad || 'PRESENCIAL'}</Badge>
                                      {ev.ubicacion && <span>📍 {ev.ubicacion}</span>}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge appearance="tint" color={ev.estado_inscripcion === 'CONFIRMADO' || ev.estado_inscripcion === 'CONFIRMADA' ? 'success' : 'warning'} size="medium">
                                      {ev.estado_inscripcion || 'CONFIRMADA'}
                                    </Badge>
                                    <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '2px' }}>
                                      {formatDate(ev.fecha_inscripcion)}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {ev.asistio ? (
                                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Badge appearance="filled" color="success" size="medium" icon={<CalendarCheckmark24Regular />}>
                                          ASISTIÓ AL EVENTO
                                        </Badge>
                                        {ev.fecha_validacion && (
                                          <span style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>
                                            Check-in: {formatDateTime(ev.fecha_validacion)}
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      <Badge appearance="outline" color="warning" size="medium">
                                        ⏳ No Registró Asistencia
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {ev.codigo_qr ? (
                                      <Badge appearance="tint" color="brand" size="small" icon={<QrCode24Regular />}>
                                        Activo
                                      </Badge>
                                    ) : (
                                      <span style={{ fontSize: '11px', opacity: 0.5 }}>—</span>
                                    )}
                                  </TableCell>
                                  <TableCell style={{ textAlign: 'center' }}>
                                    {ev.asistio ? (
                                      <MEHButton
                                        size="small"
                                        appearance="subtle"
                                        style={{ color: tokens.colorPaletteRedForeground1, fontSize: '11px' }}
                                        icon={<DismissCircle24Regular />}
                                        disabled={isToggling}
                                        onClick={() => handleToggleAsistencia(ev.id_inscripcion, ev.titulo)}
                                        title="Corregir error: Quitar marca de asistencia"
                                      >
                                        {isToggling ? "Actualizando..." : "Desmarcar"}
                                      </MEHButton>
                                    ) : (
                                      <MEHButton
                                        size="small"
                                        appearance="outline"
                                        style={{ color: tokens.colorPaletteGreenForeground1, fontSize: '11px' }}
                                        icon={<CheckmarkCircle24Filled />}
                                        disabled={isToggling}
                                        onClick={() => handleToggleAsistencia(ev.id_inscripcion, ev.titulo)}
                                        title="Corregir error: Acreditar como presente"
                                      >
                                        {isToggling ? "Actualizando..." : "Marcar Asistió"}
                                      </MEHButton>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  )}

                  {/* PESTAÑA 2: COMPRAS & SOUVENIRS */}
                  {activeTab === 'compras' && (
                    <div>
                      <div className={styles.tabHeaderActions}>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', opacity: 0.8 }}>
                          Historial de Compras y Souvenirs ({compras.length})
                        </div>
                        <MEHButton
                          appearance="primary"
                          size="small"
                          icon={<Add24Regular />}
                          onClick={handleOpenAsignarSouvenir}
                        >
                          + Registrar / Asignar Souvenir
                        </MEHButton>
                      </div>

                      {compras.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', opacity: 0.7, backgroundColor: tokens.colorNeutralBackground2, borderRadius: '14px' }}>
                          <ShoppingBag24Regular fontSize={40} style={{ marginBottom: '8px' }} />
                          <div style={{ fontWeight: 'bold' }}>Sin compras registradas</div>
                          <div style={{ fontSize: '12px', marginTop: '4px' }}>
                            Usa el botón superior para registrar manualmente una compra o entrega de souvenir.
                          </div>
                        </div>
                      ) : (
                        <Table size="medium" style={{ minWidth: '780px', width: '100%' }}>
                          <TableHeader>
                            <TableRow>
                              <TableHeaderCell style={{ width: '140px' }}>Fecha</TableHeaderCell>
                              <TableHeaderCell style={{ width: '200px' }}>Evento Asociado</TableHeaderCell>
                              <TableHeaderCell>Productos Adquiridos</TableHeaderCell>
                              <TableHeaderCell style={{ width: '120px' }}>Método</TableHeaderCell>
                              <TableHeaderCell style={{ width: '120px', textAlign: 'right' }}>Total (Bs.)</TableHeaderCell>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {compras.map(p => (
                              <TableRow key={`ped-${p.id_pedido}`}>
                                <TableCell>
                                  <div style={{ fontSize: '13px', fontWeight: '600' }}>
                                    {formatDate(p.fecha_pedido)}
                                  </div>
                                  <div style={{ fontSize: '11px', opacity: 0.65 }}>
                                    {new Date(p.fecha_pedido).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {p.evento_titulo ? (
                                    <div style={{ fontSize: '12px', fontWeight: '500' }}>
                                      🎁 {p.evento_titulo}
                                    </div>
                                  ) : (
                                    <Badge appearance="tint" color="subtle" size="small">
                                      🛍️ Tienda General
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {(p.detalles || []).map(d => (
                                      <div key={`ped-det-${d.id_detalle}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                                        <Badge appearance="filled" color="brand" size="small">
                                          {d.cantidad}x
                                        </Badge>
                                        <span style={{ fontWeight: '500' }}>{d.producto_nombre}</span>
                                        <span style={{ opacity: 0.65, fontSize: '11px' }}>
                                          (Bs. {Number(d.precio_unitario).toFixed(2)})
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge appearance="tint" color={p.metodo_pago === 'QR' ? 'brand' : p.metodo_pago === 'TRANSFERENCIA' ? 'informative' : p.metodo_pago === 'CORTESIA' ? 'warning' : 'success'} size="medium">
                                    {p.metodo_pago || 'EFECTIVO'}
                                  </Badge>
                                </TableCell>
                                <TableCell style={{ textAlign: 'right' }}>
                                  <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#10b981' }}>
                                    Bs. {Number(p.total).toFixed(2)}
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  )}

                  {/* PESTAÑA 3: INSIGNIAS & CERTIFICADOS */}
                  {activeTab === 'badges' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                      {/* Insignias / Badges */}
                      <div>
                        <div className={styles.tabHeaderActions}>
                          <div style={{ fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', color: tokens.colorBrandForeground1 }}>
                            <Reward24Filled /> Insignias Desbloqueadas ({badges.length})
                          </div>
                          <MEHButton
                            appearance="outline"
                            size="small"
                            icon={<Add24Regular />}
                            onClick={handleOpenAsignarBadge}
                          >
                            + Otorgar Insignia
                          </MEHButton>
                        </div>

                        {badges.length === 0 ? (
                          <div style={{ padding: '20px', textAlign: 'center', opacity: 0.6, backgroundColor: tokens.colorNeutralBackground2, borderRadius: '12px' }}>
                            No cuenta con insignias obtenidas aún. Puedes otorgarle una con el botón superior.
                          </div>
                        ) : (
                          <div className={styles.badgeGrid}>
                            {badges.map(b => (
                              <div key={`b-${b.id_usuario_badge}`} className={styles.badgeCard}>
                                {b.imagen_url ? (
                                  <img src={resolveApiFileUrl(b.imagen_url)} alt={b.nombre_badge} style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                                ) : (
                                  <Reward24Filled fontSize={44} style={{ color: '#eab308' }} />
                                )}
                                <div style={{ fontSize: '12px', fontWeight: 'bold', lineHeight: 1.2 }}>
                                  {b.nombre_badge}
                                </div>
                                <div style={{ fontSize: '10px', opacity: 0.65 }}>
                                  {formatDate(b.fecha_obtencion)}
                                </div>
                                <Badge appearance="filled" color="brand" size="small">
                                  +{b.puntos} pts
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Certificados */}
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: tokens.colorBrandForeground1 }}>
                          <DocumentRibbon24Regular /> Certificados Oficiales Emitidos ({certificados.length})
                        </div>
                        {certificados.length === 0 ? (
                          <div style={{ padding: '20px', textAlign: 'center', opacity: 0.6, backgroundColor: tokens.colorNeutralBackground2, borderRadius: '12px' }}>
                            No cuenta con certificados emitidos aún.
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {certificados.map(c => (
                              <div key={`cert-${c.id_certificado}`} style={{ padding: '14px 16px', backgroundColor: tokens.colorNeutralBackground2, borderRadius: '12px', border: `1px solid ${tokens.colorNeutralStroke2}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                <div>
                                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{c.titulo_evento_curso}</div>
                                  <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '2px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    <span>Código: <b style={{ fontFamily: 'monospace' }}>{c.codigo_verificacion}</b></span>
                                    <span>Emitido: {formatDate(c.fecha_emision)}</span>
                                    <Badge appearance="outline" size="small">{c.tipo_certificado}</Badge>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <MEHButton
                                    size="small"
                                    appearance="outline"
                                    icon={<Open20Regular />}
                                    onClick={() => window.open(`/verificar?codigo=${c.codigo_verificacion}`, '_blank')}
                                  >
                                    Verificar
                                  </MEHButton>
                                  {c.url_pdf && (
                                    <MEHButton
                                      size="small"
                                      appearance="primary"
                                      onClick={() => window.open(resolveApiFileUrl(c.url_pdf), '_blank')}
                                    >
                                      Descargar PDF
                                    </MEHButton>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* PESTAÑA 4: CURSOS LMS */}
                  {activeTab === 'cursos' && (
                    <div>
                      {cursos.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', opacity: 0.7 }}>
                          <HatGraduation24Regular fontSize={40} style={{ marginBottom: '8px' }} />
                          <div style={{ fontWeight: 'bold' }}>Sin cursos matriculados</div>
                          <div style={{ fontSize: '12px' }}>Este miembro no se ha matriculado en cursos de la Academia aún.</div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {cursos.map(c => (
                            <div key={`curso-${c.id_inscripcion_curso}`} style={{ padding: '16px', backgroundColor: tokens.colorNeutralBackground2, borderRadius: '14px', border: `1px solid ${tokens.colorNeutralStroke2}` }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                                <div>
                                  <span style={{ fontSize: '15px', fontWeight: 'bold' }}>{c.titulo}</span>
                                  <span style={{ fontSize: '12px', opacity: 0.65, marginLeft: '8px' }}>Inscrito: {formatDate(c.fecha_inscripcion)}</span>
                                </div>
                                <Badge appearance="filled" color={c.finalizado ? 'success' : 'brand'}>
                                  {c.finalizado ? 'COMPLETADO' : 'EN CURSO'}
                                </Badge>
                              </div>

                              <div style={{ marginTop: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>
                                  <span>Progreso Académico:</span>
                                  <span><b>{c.progreso || 0}%</b></span>
                                </div>
                                <ProgressBar value={(c.progreso || 0) / 100} color={c.finalizado ? 'success' : 'brand'} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* PESTAÑA 5: FICHA TÉCNICA & BIO */}
                  {activeTab === 'perfil' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Biografía */}
                      <div style={{ padding: '16px', backgroundColor: tokens.colorNeutralBackground2, borderRadius: '14px', border: `1px solid ${tokens.colorNeutralStroke2}` }}>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: tokens.colorBrandForeground1, marginBottom: '6px' }}>
                          Biografía / Presentación
                        </div>
                        <div style={{ fontSize: '13px', lineHeight: 1.5, opacity: 0.85 }}>
                          {user.bio || 'Este miembro no ha especificado una biografía personal.'}
                        </div>
                      </div>

                      {/* Datos Personales y Profesionales */}
                      <div className={styles.infoGrid}>
                        <div className={styles.infoCard}>
                          <Building24Regular style={{ color: tokens.colorBrandForeground1, fontSize: '24px' }} />
                          <div>
                            <div style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.6, fontWeight: 'bold' }}>Institución / Empresa</div>
                            <div style={{ fontSize: '14px', fontWeight: '600' }}>{user.institucion || user.estudia_en || 'Independiente'}</div>
                          </div>
                        </div>

                        <div className={styles.infoCard}>
                          <Person24Regular style={{ color: tokens.colorBrandForeground1, fontSize: '24px' }} />
                          <div>
                            <div style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.6, fontWeight: 'bold' }}>Tipo de Entidad</div>
                            <div style={{ fontSize: '14px', fontWeight: '600' }}>{user.tipo_entidad || 'Estudiante'}</div>
                          </div>
                        </div>

                        <div className={styles.infoCard}>
                          <Map24Regular style={{ color: tokens.colorBrandForeground1, fontSize: '24px' }} />
                          <div>
                            <div style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.6, fontWeight: 'bold' }}>Ubicación Geográfica</div>
                            <div style={{ fontSize: '14px', fontWeight: '600' }}>
                              {user.departamento ? `${user.departamento}, ` : ''}{user.pais || 'Bolivia'}
                            </div>
                          </div>
                        </div>

                        <div className={styles.infoCard}>
                          <Mail24Regular style={{ color: tokens.colorBrandForeground1, fontSize: '24px' }} />
                          <div>
                            <div style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.6, fontWeight: 'bold' }}>Estado de Email</div>
                            <div style={{ fontSize: '14px', fontWeight: '600' }}>
                              {isVerified ? '✅ Correo Verificado' : `⚠️ Pendiente (Código: ${user.codigo_verificacion || 'N/D'})`}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Presencia Digital / Redes */}
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: tokens.colorBrandForeground1, marginBottom: '8px' }}>
                          Presencia Digital & Enlaces
                        </div>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          {user.linkedin_url && (
                            <a href={user.linkedin_url} target="_blank" rel="noreferrer" className={styles.socialPill}>
                              <Globe24Regular /> LinkedIn
                            </a>
                          )}
                          {user.github_url && (
                            <a href={user.github_url} target="_blank" rel="noreferrer" className={styles.socialPill}>
                              <Globe24Regular /> GitHub
                            </a>
                          )}
                          {user.facebook_url && (
                            <a href={user.facebook_url} target="_blank" rel="noreferrer" className={styles.socialPill}>
                              <Globe24Regular /> Facebook
                            </a>
                          )}
                          {user.instagram_url && (
                            <a href={user.instagram_url} target="_blank" rel="noreferrer" className={styles.socialPill}>
                              <Globe24Regular /> Instagram
                            </a>
                          )}
                          {user.tiktok_url && (
                            <a href={user.tiktok_url} target="_blank" rel="noreferrer" className={styles.socialPill}>
                              <Globe24Regular /> TikTok
                            </a>
                          )}
                          {user.learning_path_url && (
                            <a href={user.learning_path_url} target="_blank" rel="noreferrer" className={styles.socialPill} style={{ borderColor: tokens.colorBrandForeground1 }}>
                              <Globe24Regular /> Microsoft Learn
                            </a>
                          )}
                          {!user.linkedin_url && !user.github_url && !user.facebook_url && !user.instagram_url && !user.tiktok_url && !user.learning_path_url && (
                            <div style={{ fontSize: '12px', opacity: 0.6 }}>No ha vinculado enlaces sociales públicos.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </DialogContent>

          <DialogActions style={{ marginTop: '14px' }}>
            <MEHButton appearance="primary" onClick={onClose}>
              Cerrar Expediente
            </MEHButton>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>

      {/* --- DIALOG MODAL: ASIGNAR EVENTO & ASISTENCIA MANUAL --- */}
      <Dialog open={isAsignarEventoOpen} onOpenChange={(e, d) => { if (!d.open && !savingEvento) setIsAsignarEventoOpen(false); }}>
        <DialogSurface style={{ maxWidth: '500px', width: '90%', borderRadius: '18px' }}>
          <DialogBody>
            <DialogTitle>Asignar Evento & Asistencia</DialogTitle>
            <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 0' }}>
              <div style={{ fontSize: '13px', opacity: 0.8 }}>
                Inscribe o acredita a <b>{user.nombres} {user.apellidos}</b> en un evento para corregir omisiones o errores de registro.
              </div>

              {loadingEventos ? (
                <div style={{ textAlign: 'center', padding: '20px' }}><Spinner size="small" label="Cargando eventos..." /></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Label required style={{ fontWeight: 'bold', fontSize: '13px' }}>Selecciona el Evento:</Label>
                  <Dropdown
                    placeholder="Elige un evento del catálogo..."
                    value={allEventos.find(ev => String(ev.id_evento) === String(selectedEventoId))?.titulo || ''}
                    onOptionSelect={(e, data) => setSelectedEventoId(data.optionValue)}
                    style={{ width: '100%' }}
                  >
                    {allEventos.map(ev => (
                      <Option key={`ev-opt-${ev.id_evento}`} value={String(ev.id_evento)} text={ev.titulo}>
                        {ev.titulo} ({formatDate(ev.fecha_inicio)})
                      </Option>
                    ))}
                  </Dropdown>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', backgroundColor: tokens.colorNeutralBackground2, borderRadius: '10px' }}>
                <Checkbox
                  checked={marcarAsistio}
                  onChange={(e, data) => setMarcarAsistio(Boolean(data.checked))}
                  label="Marcar asistencia inmediata (Acreditado / Presente)"
                />
              </div>
            </DialogContent>
            <DialogActions>
              <MEHButton appearance="secondary" onClick={() => setIsAsignarEventoOpen(false)} disabled={savingEvento}>
                Cancelar
              </MEHButton>
              <MEHButton appearance="primary" onClick={handleSaveAsignarEvento} disabled={savingEvento || !selectedEventoId}>
                {savingEvento ? "Asignando..." : "Asignar al Miembro"}
              </MEHButton>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* --- DIALOG MODAL: ASIGNAR / REGISTRAR SOUVENIR --- */}
      <Dialog open={isAsignarSouvenirOpen} onOpenChange={(e, d) => { if (!d.open && !savingSouvenir) setIsAsignarSouvenirOpen(false); }}>
        <DialogSurface style={{ maxWidth: '520px', width: '90%', borderRadius: '18px' }}>
          <DialogBody>
            <DialogTitle>Asignar / Registrar Souvenir</DialogTitle>
            <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px 0' }}>
              <div style={{ fontSize: '13px', opacity: 0.8 }}>
                Registra la entrega o compra de souvenir para <b>{user.nombres} {user.apellidos}</b>.
              </div>

              {loadingProductos ? (
                <div style={{ textAlign: 'center', padding: '20px' }}><Spinner size="small" label="Cargando inventario..." /></div>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <Label required style={{ fontWeight: 'bold', fontSize: '13px' }}>Producto / Souvenir:</Label>
                    <Dropdown
                      placeholder="Elige un producto..."
                      value={allProductos.find(p => String(p.id_producto) === String(selectedProductoId))?.nombre || ''}
                      onOptionSelect={(e, data) => setSelectedProductoId(data.optionValue)}
                      style={{ width: '100%' }}
                    >
                      {allProductos.map(p => (
                        <Option key={`prod-opt-${p.id_producto}`} value={String(p.id_producto)} text={p.nombre}>
                          {p.nombre} — Bs. {Number(p.precio).toFixed(2)} (Stock: {p.stock})
                        </Option>
                      ))}
                    </Dropdown>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <Label required style={{ fontWeight: 'bold', fontSize: '13px' }}>Cantidad:</Label>
                      <Input
                        type="number"
                        min="1"
                        value={cantidadSouvenir}
                        onChange={(e) => setCantidadSouvenir(e.target.value)}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <Label style={{ fontWeight: 'bold', fontSize: '13px' }}>Método de Registro:</Label>
                      <Dropdown
                        value={metodoPago}
                        onOptionSelect={(e, data) => setMetodoPago(data.optionValue)}
                        style={{ width: '100%' }}
                      >
                        <Option value="CORTESIA">Cortesía / Entrega Gratuita</Option>
                        <Option value="EFECTIVO">Efectivo</Option>
                        <Option value="QR">Pago QR</Option>
                        <Option value="TRANSFERENCIA">Transferencia</Option>
                      </Dropdown>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <Label style={{ fontSize: '13px' }}>Evento Asociado (Opcional):</Label>
                    <Dropdown
                      placeholder="Sin evento (Tienda general)..."
                      value={allEventos.find(ev => String(ev.id_evento) === String(eventoAsociadoId))?.titulo || 'Sin evento específico'}
                      onOptionSelect={(e, data) => setEventoAsociadoId(data.optionValue)}
                      style={{ width: '100%' }}
                    >
                      <Option value="">Sin evento específico</Option>
                      {allEventos.map(ev => (
                        <Option key={`ev-souv-${ev.id_evento}`} value={String(ev.id_evento)} text={ev.titulo}>
                          {ev.titulo}
                        </Option>
                      ))}
                    </Dropdown>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <Label style={{ fontSize: '13px' }}>Notas o Justificación:</Label>
                    <Input
                      placeholder="Ej. Corrección por error en caja, Entrega de kit..."
                      value={notasSouvenir}
                      onChange={(e) => setNotasSouvenir(e.target.value)}
                    />
                  </div>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <MEHButton appearance="secondary" onClick={() => setIsAsignarSouvenirOpen(false)} disabled={savingSouvenir}>
                Cancelar
              </MEHButton>
              <MEHButton appearance="primary" onClick={handleSaveAsignarSouvenir} disabled={savingSouvenir || !selectedProductoId}>
                {savingSouvenir ? "Guardando..." : "Registrar Souvenir"}
              </MEHButton>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* --- DIALOG MODAL: ASIGNAR INSIGNIA (BADGE) --- */}
      <Dialog open={isAsignarBadgeOpen} onOpenChange={(e, d) => { if (!d.open && !savingBadge) setIsAsignarBadgeOpen(false); }}>
        <DialogSurface style={{ maxWidth: '480px', width: '90%', borderRadius: '18px' }}>
          <DialogBody>
            <DialogTitle>Otorgar Insignia Manual</DialogTitle>
            <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px 0' }}>
              <div style={{ fontSize: '13px', opacity: 0.8 }}>
                Otorga una insignia oficial a <b>{user.nombres} {user.apellidos}</b>.
              </div>

              {loadingBadges ? (
                <div style={{ textAlign: 'center', padding: '20px' }}><Spinner size="small" label="Cargando insignias..." /></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <Label required style={{ fontWeight: 'bold', fontSize: '13px' }}>Selecciona la Insignia:</Label>
                  <Dropdown
                    placeholder="Elige una insignia..."
                    value={allBadges.find(b => String(b.id_badge) === String(selectedBadgeId))?.nombre || ''}
                    onOptionSelect={(e, data) => setSelectedBadgeId(data.optionValue)}
                    style={{ width: '100%' }}
                  >
                    {allBadges.map(b => (
                      <Option key={`bg-opt-${b.id_badge}`} value={String(b.id_badge)} text={b.nombre}>
                        {b.nombre} (+{b.puntos} pts)
                      </Option>
                    ))}
                  </Dropdown>
                </div>
              )}
            </DialogContent>
            <DialogActions>
              <MEHButton appearance="secondary" onClick={() => setIsAsignarBadgeOpen(false)} disabled={savingBadge}>
                Cancelar
              </MEHButton>
              <MEHButton appearance="primary" onClick={handleSaveAsignarBadge} disabled={savingBadge || !selectedBadgeId}>
                {savingBadge ? "Otorgando..." : "Otorgar Insignia"}
              </MEHButton>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
};

export default UserExpedienteModal;

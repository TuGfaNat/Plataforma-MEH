import React, { useState, useEffect, useMemo } from 'react';
import { 
  makeStyles, 
  shorthands, 
  tokens, 
  Input, 
  Badge, 
  Avatar, 
  Spinner, 
  Dialog, 
  DialogSurface, 
  DialogBody, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Tooltip
} from '@fluentui/react-components';
import { 
  Search24Regular, 
  CheckmarkCircle24Filled, 
  DismissCircle24Filled, 
  Copy24Regular, 
  QrCode24Regular, 
  Checkmark24Regular,
  PeopleTeam24Regular,
  ArrowClockwise24Regular,
  Dismiss24Regular,
  ShieldCheckmark24Regular,
  AlertUrgent24Filled
} from '@fluentui/react-icons';
import { QRCodeSVG } from 'qrcode.react';
import { MEHButton, MEHTypography, MEHCard } from './ui';
import { useAuth, useNotify } from '../App';
import eventoService from '../services/eventoService';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%'
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '12px'
  },
  statCard: {
    padding: '12px 16px',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius('12px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3),
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  searchBar: {
    width: '100%'
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxHeight: '480px',
    overflowY: 'auto',
    paddingRight: '4px'
  },
  participantCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius('12px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3),
    transition: 'all 0.2s ease',
    gap: '12px',
    flexWrap: 'wrap',
    ':hover': {
      ...shorthands.borderColor(tokens.colorBrandStroke1),
      backgroundColor: tokens.colorNeutralBackground1Hover
    }
  },
  participantLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: '1 1 240px',
    minWidth: '220px'
  },
  qrThumbnailWrapper: {
    backgroundColor: '#ffffff',
    padding: '4px',
    ...shorthands.borderRadius('8px'),
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
    transition: 'transform 0.15s ease',
    ':hover': {
      transform: 'scale(1.08)'
    }
  },
  participantInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  actionsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap'
  },
  qrModalContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '16px',
    padding: '12px 0'
  },
  qrLargeBox: {
    backgroundColor: '#ffffff',
    padding: '20px',
    ...shorthands.borderRadius('16px'),
    boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyState: {
    padding: '36px 16px',
    textAlign: 'center',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius('12px'),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
  }
});

const AcreditacionPanel = ({ 
  eventoId, 
  eventoTitulo = '', 
  onParticipantesChange = null 
}) => {
  const styles = useStyles();
  const { user } = useAuth();
  const { notify } = useNotify();

  const isStaff = user && (user.rol === 'ADMIN' || user.rol === 'ORGANIZADOR');

  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para el modal de QR expandible
  const [expandedQr, setExpandedQr] = useState(null);

  // Estado para el diálogo de confirmación de "Marcar Presente"
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    participante: null,
    processing: false
  });

  const fetchParticipantes = async () => {
    if (!eventoId) return;
    setLoading(true);
    try {
      const data = await eventoService.getParticipantes(eventoId);
      setParticipantes(data || []);
      if (onParticipantesChange) {
        onParticipantesChange(data || []);
      }
    } catch (err) {
      console.error('Error al cargar participantes para acreditación:', err);
      notify('Error', 'No se pudieron cargar los participantes del evento.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventoId) {
      fetchParticipantes();
    } else {
      setParticipantes([]);
    }
  }, [eventoId]);

  // Filtrado reactivo por nombre, email o código QR
  const filteredParticipantes = useMemo(() => {
    if (!searchTerm.trim()) return participantes;
    const term = searchTerm.toLowerCase().trim();
    return participantes.filter(p => {
      const nombre = (p.nombre_completo || `${p.usuario?.nombres || ''} ${p.usuario?.apellidos || ''}`).toLowerCase();
      const correo = (p.correo || p.usuario?.email || p.usuario?.correo || '').toLowerCase();
      const codigo = (p.codigo_qr || '').toLowerCase();
      return nombre.includes(term) || correo.includes(term) || codigo.includes(term);
    });
  }, [participantes, searchTerm]);

  // Métricas
  const stats = useMemo(() => {
    const total = participantes.length;
    const presentes = participantes.filter(p => p.presente || p.asistio).length;
    const ausentes = total - presentes;
    const porcentaje = total > 0 ? Math.round((presentes / total) * 100) : 0;
    return { total, presentes, ausentes, porcentaje };
  }, [participantes]);

  const handleCopyCode = async (codigo, e) => {
    if (e) e.stopPropagation();
    if (!codigo) return;
    try {
      await navigator.clipboard.writeText(codigo);
      notify('Copiado', `Código ${codigo} copiado al portapapeles`, 'success');
    } catch (err) {
      console.error('Error al copiar código:', err);
      notify('Error', 'No se pudo copiar el código al portapapeles', 'error');
    }
  };

  const handleOpenConfirm = (p) => {
    setConfirmModal({
      open: true,
      participante: p,
      processing: false
    });
  };

  const handleCloseConfirm = () => {
    if (confirmModal.processing) return;
    setConfirmModal({ open: false, participante: null, processing: false });
  };

  const handleAcreditarConfirmado = async () => {
    const p = confirmModal.participante;
    if (!p) return;

    setConfirmModal(prev => ({ ...prev, processing: true }));
    try {
      const res = await eventoService.acreditarParticipante(eventoId, {
        id_inscripcion: p.id_inscripcion,
        codigo_qr: p.codigo_qr
      });

      notify(
        '¡Acreditación exitosa!', 
        `${p.nombre_completo || 'Participante'} ha sido marcado como PRESENTE.`, 
        'success'
      );

      // Actualizar estado local inmediatamente
      setParticipantes(prev => prev.map(item => {
        if (item.id_inscripcion === p.id_inscripcion) {
          return {
            ...item,
            presente: true,
            asistio: true,
            fecha_acreditacion: res.fecha_acreditacion || new Date().toISOString()
          };
        }
        return item;
      }));

      if (onParticipantesChange) {
        onParticipantesChange();
      }

      handleCloseConfirm();
    } catch (err) {
      console.error('Error al acreditar participante:', err);
      const detail = err.response?.data?.detail;
      const errorMsg = typeof detail === 'string' ? detail : 'No se pudo registrar la acreditación.';
      notify('Error de Acreditación', errorMsg, 'error');
      setConfirmModal(prev => ({ ...prev, processing: false }));
    }
  };

  if (!isStaff) {
    return (
      <div className={styles.emptyState}>
        <ShieldCheckmark24Regular style={{ fontSize: '36px', opacity: 0.6 }} />
        <MEHTypography variant="body" style={{ fontWeight: 'bold' }}>
          Acceso Restringido
        </MEHTypography>
        <MEHTypography variant="caption" style={{ opacity: 0.7 }}>
          Solo los roles de Administrador y Organizador pueden acceder al panel de acreditación y asistencia.
        </MEHTypography>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* HEADER Y MÉTRICAS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <MEHTypography variant="h4" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PeopleTeam24Regular style={{ color: tokens.colorBrandForeground1 }} />
            Control de Acreditación y Asistencia
          </MEHTypography>
          {eventoTitulo && (
            <MEHTypography variant="caption" style={{ opacity: 0.75 }}>
              Evento: <b>{eventoTitulo}</b>
            </MEHTypography>
          )}
        </div>
        <MEHButton 
          size="small" 
          icon={<ArrowClockwise24Regular />} 
          onClick={fetchParticipantes}
          disabled={loading}
          title="Actualizar lista de inscritos"
        >
          Refrescar
        </MEHButton>
      </div>

      {/* METRIC CARDS */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <MEHTypography variant="caption" style={{ opacity: 0.7 }}>Total Inscritos</MEHTypography>
          <MEHTypography variant="h3">{stats.total}</MEHTypography>
        </div>
        <div className={styles.statCard}>
          <MEHTypography variant="caption" style={{ color: tokens.colorPaletteGreenForeground1 }}>
            Presentes
          </MEHTypography>
          <MEHTypography variant="h3" style={{ color: tokens.colorPaletteGreenForeground1 }}>
            {stats.presentes}
          </MEHTypography>
        </div>
        <div className={styles.statCard}>
          <MEHTypography variant="caption" style={{ opacity: 0.7 }}>Ausentes</MEHTypography>
          <MEHTypography variant="h3">{stats.ausentes}</MEHTypography>
        </div>
        <div className={styles.statCard}>
          <MEHTypography variant="caption" style={{ opacity: 0.7 }}>% Asistencia</MEHTypography>
          <MEHTypography variant="h3" style={{ color: tokens.colorBrandForeground1 }}>
            {stats.porcentaje}%
          </MEHTypography>
        </div>
      </div>

      {/* BUSCADOR */}
      <div className={styles.searchBar}>
        <Input 
          style={{ width: '100%' }}
          placeholder="Buscar por nombre, correo electrónico o código QR..."
          contentBefore={<Search24Regular />}
          contentAfter={searchTerm ? (
            <Dismiss24Regular 
              style={{ cursor: 'pointer' }} 
              onClick={() => setSearchTerm('')} 
            />
          ) : null}
          value={searchTerm}
          onChange={(e, d) => setSearchTerm(d.value)}
        />
      </div>

      {/* LISTA DE PARTICIPANTES */}
      {loading ? (
        <div style={{ padding: '30px', textAlign: 'center' }}>
          <Spinner size="medium" label="Cargando participantes y estado de asistencia..." />
        </div>
      ) : filteredParticipantes.length > 0 ? (
        <div className={styles.listContainer}>
          {filteredParticipantes.map(p => {
            const isPresente = Boolean(p.presente || p.asistio);
            const nombre = p.nombre_completo || `${p.usuario?.nombres || ''} ${p.usuario?.apellidos || ''}`.trim() || `Inscrito #${p.id_inscripcion}`;
            const correo = p.correo || p.usuario?.email || p.usuario?.correo || '';
            const codigoQr = p.codigo_qr;

            return (
              <div key={p.id_inscripcion} className={styles.participantCard}>
                {/* IZQUIERDA: Miniatura QR + Datos */}
                <div className={styles.participantLeft}>
                  {codigoQr ? (
                    <Tooltip content="Clic para expandir código QR" relationship="description">
                      <div 
                        className={styles.qrThumbnailWrapper}
                        onClick={() => setExpandedQr({ codigo: codigoQr, nombre, correo })}
                      >
                        <QRCodeSVG 
                          value={codigoQr} 
                          size={46} 
                          level="M" 
                          role="img"
                          aria-label={`QR de ${nombre}`}
                        />
                      </div>
                    </Tooltip>
                  ) : (
                    <Avatar name={nombre} size={40} />
                  )}

                  <div className={styles.participantInfo}>
                    <MEHTypography variant="body" style={{ fontWeight: 600, fontSize: '13px', lineHeight: 1.2 }}>
                      {nombre}
                    </MEHTypography>
                    <MEHTypography variant="caption" style={{ opacity: 0.7, fontSize: '11px' }}>
                      {correo || 'Sin correo registrado'}
                    </MEHTypography>
                    {codigoQr && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <code style={{ fontSize: '10px', backgroundColor: tokens.colorNeutralBackground3, padding: '1px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                          {codigoQr}
                        </code>
                        <Tooltip content="Copiar código QR" relationship="label">
                          <span 
                            style={{ cursor: 'pointer', display: 'inline-flex', opacity: 0.6 }}
                            onClick={(e) => handleCopyCode(codigoQr, e)}
                          >
                            <Copy24Regular style={{ fontSize: '13px' }} />
                          </span>
                        </Tooltip>
                      </div>
                    )}
                  </div>
                </div>

                {/* DERECHA: Badges + Botón de Acreditación */}
                <div className={styles.actionsGroup}>
                  {/* Badge de Asistencia */}
                  {isPresente ? (
                    <Badge 
                      appearance="filled" 
                      color="success" 
                      icon={<CheckmarkCircle24Filled />}
                    >
                      PRESENTE
                    </Badge>
                  ) : (
                    <Badge 
                      appearance="tint" 
                      color="danger"
                      icon={<DismissCircle24Filled />}
                    >
                      AUSENTE
                    </Badge>
                  )}

                  {/* Badge de Estado de Inscripción */}
                  <Badge 
                    appearance="outline" 
                    color={p.estado_inscripcion === 'CONFIRMADA' ? 'brand' : p.estado_inscripcion === 'PENDIENTE_APROBACION' ? 'warning' : 'informative'}
                  >
                    {p.estado_inscripcion || 'REGISTRADO'}
                  </Badge>

                  {/* Botón Marcar Presente */}
                  {!isPresente ? (
                    <MEHButton 
                      appearance="primary" 
                      size="small"
                      icon={<Checkmark24Regular />}
                      onClick={() => handleOpenConfirm(p)}
                    >
                      Marcar Presente
                    </MEHButton>
                  ) : (
                    <Tooltip 
                      content={p.fecha_acreditacion ? `Acreditado: ${new Date(p.fecha_acreditacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Participante acreditado'} 
                      relationship="description"
                    >
                      <MEHButton 
                        appearance="subtle" 
                        size="small"
                        disabled
                        icon={<CheckmarkCircle24Filled style={{ color: tokens.colorPaletteGreenForeground1 }} />}
                      >
                        Acreditado
                      </MEHButton>
                    </Tooltip>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <Search24Regular style={{ fontSize: '32px', opacity: 0.5 }} />
          <MEHTypography variant="body" style={{ fontWeight: 'bold' }}>
            {searchTerm ? 'No se encontraron resultados' : 'No hay participantes registrados'}
          </MEHTypography>
          <MEHTypography variant="caption" style={{ opacity: 0.7 }}>
            {searchTerm 
              ? `No hay coincidencias para "${searchTerm}". Intenta buscar con otro término.`
              : 'Cuando los participantes se inscriban al evento, aparecerán aquí para su acreditación.'}
          </MEHTypography>
        </div>
      )}

      {/* DIÁLOGO MODAL: QR EXPANDIBLE */}
      <Dialog 
        open={Boolean(expandedQr)} 
        onOpenChange={(e, data) => { if (!data.open) setExpandedQr(null); }}
      >
        <DialogSurface style={{ maxWidth: '400px', width: '90%' }}>
          <DialogBody>
            <DialogTitle>Código QR de Acreditación</DialogTitle>
            <DialogContent className={styles.qrModalContainer}>
              {expandedQr && (
                <>
                  <div className={styles.qrLargeBox}>
                    <QRCodeSVG 
                      value={expandedQr.codigo} 
                      size={210} 
                      level="H" 
                      role="img"
                      aria-label={`Código QR para ${expandedQr.nombre}`}
                    />
                  </div>
                  <div>
                    <MEHTypography variant="h4" style={{ marginBottom: '2px' }}>
                      {expandedQr.nombre}
                    </MEHTypography>
                    <MEHTypography variant="caption" style={{ opacity: 0.75, display: 'block' }}>
                      {expandedQr.correo}
                    </MEHTypography>
                    <div style={{ marginTop: '8px', padding: '6px 12px', backgroundColor: tokens.colorNeutralBackground2, borderRadius: '6px', display: 'inline-block' }}>
                      <code style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                        {expandedQr.codigo}
                      </code>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
            <DialogActions style={{ justifyContent: 'space-between', width: '100%' }}>
              <MEHButton 
                appearance="secondary" 
                icon={<Copy24Regular />}
                onClick={() => expandedQr && handleCopyCode(expandedQr.codigo)}
              >
                Copiar Código
              </MEHButton>
              <MEHButton 
                appearance="primary" 
                onClick={() => setExpandedQr(null)}
              >
                Cerrar
              </MEHButton>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* DIÁLOGO MODAL: CONFIRMACIÓN DE MARCAR PRESENTE */}
      <Dialog 
        open={confirmModal.open} 
        onOpenChange={(e, data) => { if (!data.open && !confirmModal.processing) handleCloseConfirm(); }}
      >
        <DialogSurface style={{ maxWidth: '440px' }}>
          <DialogBody>
            <DialogTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckmarkCircle24Filled style={{ color: tokens.colorPaletteGreenForeground1 }} />
              Confirmar Acreditación Manual
            </DialogTitle>
            <DialogContent style={{ marginTop: '8px' }}>
              {confirmModal.participante && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <MEHTypography variant="body">
                    ¿Deseas marcar como <b>PRESENTE</b> a:
                  </MEHTypography>
                  <div style={{ padding: '12px', backgroundColor: tokens.colorNeutralBackground2, borderRadius: '8px', border: `1px solid ${tokens.colorNeutralBackground3}` }}>
                    <MEHTypography variant="body" style={{ fontWeight: 'bold' }}>
                      {confirmModal.participante.nombre_completo || `${confirmModal.participante.usuario?.nombres || ''} ${confirmModal.participante.usuario?.apellidos || ''}`}
                    </MEHTypography>
                    <MEHTypography variant="caption" style={{ opacity: 0.75, display: 'block' }}>
                      {confirmModal.participante.correo || confirmModal.participante.usuario?.email}
                    </MEHTypography>
                    {confirmModal.participante.codigo_qr && (
                      <MEHTypography variant="caption" style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px', display: 'block' }}>
                        Código QR: {confirmModal.participante.codigo_qr}
                      </MEHTypography>
                    )}
                  </div>
                  <MEHTypography variant="caption" style={{ opacity: 0.8 }}>
                    Esta acción registrará la asistencia oficial en el checkpoint base de acreditación y actualizará el estado de la inscripción.
                  </MEHTypography>
                </div>
              )}
            </DialogContent>
            <DialogActions style={{ marginTop: '16px' }}>
              <MEHButton 
                appearance="secondary" 
                onClick={handleCloseConfirm}
                disabled={confirmModal.processing}
              >
                Cancelar
              </MEHButton>
              <MEHButton 
                appearance="primary" 
                onClick={handleAcreditarConfirmado}
                disabled={confirmModal.processing}
                icon={confirmModal.processing ? <Spinner size="tiny" /> : <Checkmark24Regular />}
              >
                {confirmModal.processing ? 'Acreditando...' : 'Confirmar Acreditación'}
              </MEHButton>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};

export default AcreditacionPanel;

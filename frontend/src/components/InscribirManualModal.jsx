import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Field,
  Input,
  Select,
  Spinner,
  Badge,
  Avatar,
  tokens,
  makeStyles
} from '@fluentui/react-components';
import {
  PersonAdd24Regular,
  Search24Regular,
  CheckmarkCircle24Filled,
  CalendarLtr24Regular,
  Info24Regular,
  Warning24Regular
} from '@fluentui/react-icons';
import { MEHButton, MEHTypography } from './ui';
import authService from '../services/authService';
import eventoService from '../services/eventoService';
import { useNotify } from '../App';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    paddingTop: '8px',
  },
  selectedUserCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: '12px',
    border: `1.5px solid ${tokens.colorBrandStroke1}`,
  },
  searchList: {
    maxHeight: '180px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '10px',
    padding: '4px',
  },
  userItem: {
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: tokens.colorNeutralBackground1,
    transition: 'background-color 0.15s ease',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3,
    }
  },
  quickCreateBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '14px',
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: '12px',
    border: `1px dashed ${tokens.colorBrandStroke1}`,
  },
  infoNotice: {
    padding: '10px 14px',
    borderRadius: '10px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }
});

const InscribirManualModal = ({ open, onClose, eventoId, eventoTitulo = '', participantes = [], onSuccess }) => {
  const styles = useStyles();
  const { notify } = useNotify();

  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [noCandidatesFound, setNoCandidatesFound] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [estadoInscripcion, setEstadoInscripcion] = useState('CONFIRMADA_ASISTIO');
  const [submitting, setSubmitting] = useState(false);

  // Sets de exclusión para no mostrar a los ya inscritos
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [enrolledEmails, setEnrolledEmails] = useState(new Set());

  // Creación rápida de usuario
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [quickNombres, setQuickNombres] = useState('');
  const [quickApellidos, setQuickApellidos] = useState('');
  const [quickCorreo, setQuickCorreo] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);

  useEffect(() => {
    if (open) {
      setSearchTerm('');
      setUsers([]);
      setNoCandidatesFound(false);
      setSelectedUser(null);
      setEstadoInscripcion('CONFIRMADA_ASISTIO');
      setShowQuickCreate(false);
      setQuickNombres('');
      setQuickApellidos('');
      setQuickCorreo('');

      // Construir conjunto de miembros ya inscritos para exclusión estricta
      const ids = new Set((participantes || []).map(p => p.id_usuario).filter(Boolean));
      const emails = new Set(
        (participantes || [])
          .map(p => (p.correo || p.usuario?.correo || '').toLowerCase().trim())
          .filter(Boolean)
      );
      setEnrolledIds(ids);
      setEnrolledEmails(emails);
    }
  }, [open, participantes]);

  const handleSearch = async (term) => {
    setSearchTerm(term);
    setNoCandidatesFound(false);
    if (!term || term.trim().length < 2) {
      setUsers([]);
      return;
    }
    setLoadingUsers(true);
    try {
      const data = await authService.getAllUsers(term.trim());
      // EXCLUSIÓN ESTRICTA: Filtrar a todos los que ya están en la lista de inscritos
      const disponibles = (data || []).filter(u => {
        const uId = u.id_usuario;
        const uEmail = (u.correo || '').toLowerCase().trim();
        return !enrolledIds.has(uId) && !enrolledEmails.has(uEmail);
      });

      setUsers(disponibles);
      if ((data || []).length > 0 && disponibles.length === 0) {
        setNoCandidatesFound(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleQuickCreateUser = async () => {
    if (!quickNombres.trim() || !quickApellidos.trim() || !quickCorreo.trim()) {
      notify('Campos obligatorios', 'Ingresa nombres, apellidos y correo.', 'warning');
      return;
    }
    const emailNorm = quickCorreo.trim().toLowerCase();
    if (enrolledEmails.has(emailNorm)) {
      notify('Ya inscrito', 'Ese correo ya está inscrito en este evento.', 'warning');
      return;
    }

    setCreatingUser(true);
    try {
      const newUser = await authService.adminCreateUser({
        nombres: quickNombres.trim(),
        apellidos: quickApellidos.trim(),
        correo: emailNorm,
        rol: 'MIEMBRO'
      });
      notify('Usuario Creado', `${newUser.nombres} ${newUser.apellidos} fue registrado(a) y seleccionado(a).`, 'success');
      setSelectedUser(newUser);
      setShowQuickCreate(false);
      setQuickNombres('');
      setQuickApellidos('');
      setQuickCorreo('');
    } catch (err) {
      console.error(err);
      notify('Error al crear usuario', err.response?.data?.detail || 'No se pudo crear el usuario.', 'error');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleInscribir = async () => {
    if (!selectedUser || !eventoId) {
      notify('Atención', 'Debes seleccionar un miembro para inscribir.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const esConfirmadaAsistio = estadoInscripcion === 'CONFIRMADA_ASISTIO';
      const estadoBackend = esConfirmadaAsistio ? 'CONFIRMADA' : estadoInscripcion;
      const marcarAsistio = esConfirmadaAsistio;

      await eventoService.inscribirManual(eventoId, selectedUser.id_usuario, estadoBackend, marcarAsistio);

      // Agregar inmediatamente a los Sets de exclusión para que jamás aparezca en la siguiente búsqueda
      setEnrolledIds(prev => new Set(prev).add(selectedUser.id_usuario));
      if (selectedUser.correo) {
        setEnrolledEmails(prev => new Set(prev).add(selectedUser.correo.toLowerCase().trim()));
      }
      setUsers(prev => prev.filter(u => u.id_usuario !== selectedUser.id_usuario));

      if (esConfirmadaAsistio) {
        notify(
          '¡Inscrito y Acreditado!',
          `${selectedUser.nombres} ${selectedUser.apellidos} fue inscrito(a) y registrado(a) como PRESENTE en el evento.`,
          'success'
        );
      } else {
        notify(
          'Inscripción Exitosa',
          `${selectedUser.nombres} ${selectedUser.apellidos} ha sido inscrito(a) al evento con estado ${estadoInscripcion}.`,
          'success'
        );
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      notify(
        'Error al inscribir',
        err.response?.data?.detail || 'No se pudo completar la inscripción manual.',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(e, d) => { if (!d.open && !submitting) onClose(); }}>
      <DialogSurface style={{ borderRadius: '20px', maxWidth: '520px', width: '100%' }}>
        <DialogBody>
          <DialogTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PersonAdd24Regular style={{ color: tokens.colorBrandForeground1 }} />
              <span>Inscripción Manual de Participante</span>
            </div>
          </DialogTitle>
          <DialogContent className={styles.container}>
            {eventoTitulo && (
              <div style={{ padding: '8px 12px', backgroundColor: tokens.colorNeutralBackground3, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarLtr24Regular fontSize={18} />
                <MEHTypography variant="caption"><b>Evento:</b> {eventoTitulo}</MEHTypography>
              </div>
            )}

            {/* Buscar y Seleccionar Usuario */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <MEHTypography variant="body"><b>Seleccionar Miembro:</b></MEHTypography>
                {!selectedUser && (
                  <MEHButton 
                    size="small" 
                    appearance="subtle" 
                    onClick={() => setShowQuickCreate(!showQuickCreate)}
                  >
                    {showQuickCreate ? "Volver a buscar" : "+ Crear cuenta rápida"}
                  </MEHButton>
                )}
              </div>

              {selectedUser ? (
                <div className={styles.selectedUserCard}>
                  <Avatar name={`${selectedUser.nombres} ${selectedUser.apellidos}`} size={40} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 'bold' }}>{selectedUser.nombres} {selectedUser.apellidos}</div>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>{selectedUser.correo}</div>
                    <Badge appearance="outline" size="tiny" style={{ marginTop: '2px' }}>{selectedUser.rol || 'MIEMBRO'}</Badge>
                  </div>
                  <MEHButton size="small" appearance="subtle" onClick={() => setSelectedUser(null)}>
                    Cambiar
                  </MEHButton>
                </div>
              ) : showQuickCreate ? (
                <div className={styles.quickCreateBox}>
                  <MEHTypography variant="caption" style={{ fontWeight: 'bold', color: tokens.colorBrandForeground1 }}>
                    Registrar nuevo miembro en la Plataforma:
                  </MEHTypography>
                  <Input
                    placeholder="Nombres *"
                    value={quickNombres}
                    onChange={(e, d) => setQuickNombres(d.value)}
                  />
                  <Input
                    placeholder="Apellidos *"
                    value={quickApellidos}
                    onChange={(e, d) => setQuickApellidos(d.value)}
                  />
                  <Input
                    type="email"
                    placeholder="Correo electrónico *"
                    value={quickCorreo}
                    onChange={(e, d) => setQuickCorreo(d.value)}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <MEHButton size="small" appearance="secondary" onClick={() => setShowQuickCreate(false)}>
                      Cancelar
                    </MEHButton>
                    <MEHButton
                      size="small"
                      appearance="primary"
                      onClick={handleQuickCreateUser}
                      disabled={creatingUser}
                      icon={creatingUser ? <Spinner size="tiny" /> : <PersonAdd24Regular />}
                    >
                      {creatingUser ? "Creando..." : "Crear y Seleccionar"}
                    </MEHButton>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <Input
                    placeholder="Escribe el nombre o correo del participante..."
                    contentBefore={<Search24Regular />}
                    value={searchTerm}
                    onChange={(e, d) => handleSearch(d.value)}
                  />
                  {loadingUsers && <Spinner size="tiny" label="Buscando miembros..." />}
                  
                  {noCandidatesFound && (
                    <div className={styles.infoNotice} style={{ backgroundColor: 'rgba(255, 170, 0, 0.1)', color: tokens.colorPaletteGoldForeground1, border: `1px solid ${tokens.colorPaletteGoldBorder2}` }}>
                      <Info24Regular />
                      <span>Todos los usuarios coincidentes con &quot;{searchTerm}&quot; ya están inscritos en este evento.</span>
                    </div>
                  )}

                  {users.length > 0 && (
                    <div className={styles.searchList}>
                      {users.slice(0, 10).map(u => (
                        <div
                          key={`sel-u-${u.id_usuario}`}
                          className={styles.userItem}
                          onClick={() => { setSelectedUser(u); setUsers([]); }}
                        >
                          <div>
                            <b>{u.nombres} {u.apellidos}</b>
                            <div style={{ fontSize: '11px', opacity: 0.7 }}>{u.correo}</div>
                          </div>
                          <Badge appearance="tint" color="brand" size="small">{u.rol}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Opciones de Estado y Asistencia */}
            <Field label="Estado de Inscripción y Asistencia:" required>
              <Select 
                value={estadoInscripcion} 
                onChange={(e, d) => setEstadoInscripcion(d.value)}
              >
                <option value="CONFIRMADA_ASISTIO">Confirmado y Asistió (Presente de inmediato)</option>
                <option value="CONFIRMADA">Confirmado (Cupo asegurado, Asistencia pendiente)</option>
                <option value="PENDIENTE">Pendiente (A espera de pago o verificación)</option>
              </Select>
            </Field>

            {/* Aviso informativo dinámico según selección */}
            {estadoInscripcion === 'CONFIRMADA_ASISTIO' && (
              <div className={styles.infoNotice} style={{ backgroundColor: 'rgba(16, 124, 65, 0.12)', color: tokens.colorPaletteGreenForeground1, border: `1px solid ${tokens.colorPaletteGreenBorder2}` }}>
                <CheckmarkCircle24Filled />
                <span>
                  <b>Acreditación directa:</b> El participante se registrará con cupo confirmado y quedará marcado como <b>PRESENTE</b> en el control de asistencia y estadísticas del evento.
                </span>
              </div>
            )}

            {estadoInscripcion === 'CONFIRMADA' && (
              <div className={styles.infoNotice} style={{ backgroundColor: tokens.colorNeutralBackground3, color: tokens.colorNeutralForeground2, border: `1px solid ${tokens.colorNeutralStroke2}` }}>
                <Info24Regular />
                <span>
                  <b>Cupo asegurado:</b> Se le generará su código QR de acceso. Su asistencia quedará como ausente hasta que se escanee su QR o se marque presente en la lista.
                </span>
              </div>
            )}

            {estadoInscripcion === 'PENDIENTE' && (
              <div className={styles.infoNotice} style={{ backgroundColor: 'rgba(216, 59, 1, 0.1)', color: tokens.colorPaletteRedForeground1, border: `1px solid ${tokens.colorPaletteRedBorder2}` }}>
                <Warning24Regular />
                <span>
                  <b>En espera:</b> La inscripción quedará pendiente de aprobación o de validación de pago.
                </span>
              </div>
            )}
          </DialogContent>

          <DialogActions style={{ marginTop: '16px' }}>
            <MEHButton appearance="secondary" onClick={onClose} disabled={submitting}>
              Cancelar
            </MEHButton>
            <MEHButton
              appearance="primary"
              icon={submitting ? <Spinner size="tiny" /> : <CheckmarkCircle24Filled />}
              onClick={handleInscribir}
              disabled={submitting || !selectedUser}
            >
              {submitting 
                ? 'Registrando...' 
                : (estadoInscripcion === 'CONFIRMADA_ASISTIO' ? 'Inscribir y Acreditar (Presente)' : 'Inscribir al Evento')}
            </MEHButton>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default InscribirManualModal;

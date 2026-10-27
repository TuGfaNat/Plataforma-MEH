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
  Checkbox,
  tokens,
  makeStyles
} from '@fluentui/react-components';
import {
  PersonAdd24Regular,
  Search24Regular,
  CheckmarkCircle24Filled,
  CalendarLtr24Regular,
  Dismiss24Regular
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
  }
});

const InscribirManualModal = ({ open, onClose, eventoId, eventoTitulo = '', onSuccess }) => {
  const styles = useStyles();
  const { notify } = useNotify();

  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [estadoInscripcion, setEstadoInscripcion] = useState('CONFIRMADA');
  const [marcarPresente, setMarcarPresente] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      setSelectedUser(null);
      setEstadoInscripcion('CONFIRMADA');
      setMarcarPresente(false);
      setShowQuickCreate(false);
      setQuickNombres('');
      setQuickApellidos('');
      setQuickCorreo('');
    }
  }, [open]);

  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (!term || term.trim().length < 2) {
      setUsers([]);
      return;
    }
    setLoadingUsers(true);
    try {
      const data = await authService.getAllUsers(term.trim());
      setUsers(data || []);
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
    setCreatingUser(true);
    try {
      const newUser = await authService.adminCreateUser({
        nombres: quickNombres.trim(),
        apellidos: quickApellidos.trim(),
        correo: quickCorreo.trim(),
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
      const resInsc = await eventoService.inscribirManual(eventoId, selectedUser.id_usuario, estadoInscripcion);

      // Si se activó la opción de acreditar de inmediato:
      if (marcarPresente && resInsc?.id_inscripcion) {
        try {
          await eventoService.acreditarParticipante(eventoId, {
            id_inscripcion: resInsc.id_inscripcion,
            codigo_qr: resInsc.codigo_qr
          });
          notify(
            '¡Inscrito y Acreditado!',
            `${selectedUser.nombres} ${selectedUser.apellidos} ha sido inscrito(a) y acreditado(a) como PRESENTE exitosamente.`,
            'success'
          );
        } catch (acredErr) {
          console.warn("Inscrito pero error al auto-acreditar:", acredErr);
          notify(
            'Inscrito (Sin Acreditar)',
            `${selectedUser.nombres} fue inscrito(a), pero deberás marcar la asistencia desde la lista.`,
            'warning'
          );
        }
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
                <MEHTypography variant="body"><b>Seleccionar Miembro Registrado:</b></MEHTypography>
                {!selectedUser && (
                  <MEHButton 
                    size="small" 
                    appearance="subtle" 
                    onClick={() => setShowQuickCreate(!showQuickCreate)}
                  >
                    {showQuickCreate ? "Volver a buscar" : "+ ¿No existe en la BD? Crear rápido"}
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
                    Registrar nuevo miembro en la Base de Datos:
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
                  {loadingUsers && <Spinner size="tiny" label="Buscando en la base de datos..." />}
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

            {/* Estado de la inscripción */}
            <Field label="Estado de Inscripción en el Evento:">
              <Select 
                value={estadoInscripcion} 
                onChange={(e, d) => setEstadoInscripcion(d.value)}
                disabled={marcarPresente}
              >
                <option value="CONFIRMADA">CONFIRMADA (Cupo asegurado + QR emitido)</option>
                <option value="PENDIENTE">PENDIENTE (A espera de pago o verificación)</option>
              </Select>
            </Field>

            {/* Opción de Acreditar Directamente */}
            <div style={{ 
              padding: '12px 14px', 
              backgroundColor: tokens.colorNeutralBackground3, 
              borderRadius: '12px',
              border: `1px solid ${marcarPresente ? tokens.colorPaletteGreenBorder2 : tokens.colorNeutralStroke2}`
            }}>
              <Checkbox
                checked={marcarPresente}
                onChange={(e, data) => {
                  setMarcarPresente(data.checked);
                  if (data.checked) setEstadoInscripcion('CONFIRMADA');
                }}
                label="Acreditar inmediatamente (Marcar como PRESENTE ahora mismo)"
              />
              <div style={{ fontSize: '11px', opacity: 0.75, marginTop: '4px', marginLeft: '26px' }}>
                Si activas esto, el participante quedará inscrito con cupo asegurado y se registrará su asistencia presencial de inmediato. Si no lo activas, quedará inscrito y podrás marcar su asistencia cuando ingrese.
              </div>
            </div>

            <MEHTypography variant="caption" style={{ opacity: 0.7 }}>
              Nota: La inscripción manual asignará inmediatamente al miembro a este evento y generará su código QR único de acceso para el escáner de acreditación.
            </MEHTypography>
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
                ? (marcarPresente ? 'Inscribiendo y Acreditando...' : 'Inscribiendo...') 
                : (marcarPresente ? 'Inscribir y Acreditar (Presente)' : 'Inscribir al Evento')}
            </MEHButton>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default InscribirManualModal;

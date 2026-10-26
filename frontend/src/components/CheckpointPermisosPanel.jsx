import React, { useState, useEffect } from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Badge,
  Avatar,
  Input,
  Select,
  Field,
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
  ShieldCheckmark24Regular,
  PersonAdd24Regular,
  Delete24Regular,
  Add24Regular,
  PeopleTeam24Regular,
  Location24Regular,
  LockClosed24Regular
} from '@fluentui/react-icons';
import { MEHButton, MEHTypography } from './ui';
import asistenciaService from '../services/asistenciaService';
import api from '../services/api';
import { matchesSmartSearch } from '../utils/smartSearch';
import { useNotify } from '../App';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '20px',
    minWidth: 0,
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRadius('16px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3)
  },
  cpGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
    gap: '14px',
    marginTop: '10px'
  },
  cpCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '16px',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius('12px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3),
    transition: 'all 0.2s ease',
    ':hover': {
      ...shorthands.borderColor(tokens.colorBrandStroke1)
    }
  },
  cpCardActive: {
    ...shorthands.borderColor(tokens.colorBrandStroke1),
    backgroundColor: tokens.colorBrandBackground2
  },
  operatorList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '6px'
  },
  operatorRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRadius('8px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3)
  }
});

const CheckpointPermisosPanel = ({ eventoId, eventoTitulo }) => {
  const styles = useStyles();
  const notify = useNotify();

  const [checkpoints, setCheckpoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCp, setSelectedCp] = useState(null);
  const [permisos, setPermisos] = useState([]);
  const [loadingPermisos, setLoadingPermisos] = useState(false);

  // Modal para agregar Checkpoint
  const [isAddCpOpen, setIsAddCpOpen] = useState(false);
  const [newCpNombre, setNewCpNombre] = useState('');
  const [newCpTipo, setNewCpTipo] = useState('ASISTENCIA');
  const [savingCp, setSavingCp] = useState(false);

  // Formulario para asignar operador
  const [userIdInput, setUserIdInput] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [operatorSearch, setOperatorSearch] = useState('');

  // Cargar Checkpoints
  const loadCheckpoints = async () => {
    if (!eventoId) return;
    setLoading(true);
    try {
      const data = await asistenciaService.getCheckpoints(eventoId);
      setCheckpoints(data || []);
      if (data && data.length > 0 && !selectedCp) {
        setSelectedCp(data[0]);
      }
    } catch (err) {
      console.error("Error cargando checkpoints:", err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar usuarios para el selector rápido de asignación
  const loadUsers = async () => {
    try {
      const res = await api.get('/auth/usuarios');
      setAvailableUsers(res.data || []);
    } catch (_) {
      // Fallback si no tiene permisos de listar usuarios directos
    }
  };

  // Cargar permisos del checkpoint seleccionado
  const loadPermisos = async (cpId) => {
    if (!eventoId || !cpId) return;
    setLoadingPermisos(true);
    try {
      const data = await asistenciaService.getCheckpointPermisos(eventoId, cpId);
      setPermisos(data || []);
    } catch (err) {
      console.error("Error cargando permisos de checkpoint:", err);
      setPermisos([]);
    } finally {
      setLoadingPermisos(false);
    }
  };

  useEffect(() => {
    void loadCheckpoints();
    void loadUsers();
  }, [eventoId]);

  useEffect(() => {
    if (selectedCp) {
      void loadPermisos(selectedCp.id_checkpoint);
    } else {
      setPermisos([]);
    }
  }, [selectedCp]);

  const handleCreateCheckpoint = async () => {
    if (!newCpNombre.trim()) return;
    setSavingCp(true);
    try {
      await asistenciaService.createCheckpoint(eventoId, {
        nombre_checkpoint: newCpNombre.trim(),
        tipo_checkpoint: newCpTipo,
        orden: checkpoints.length + 1
      });
      if (notify) notify("Checkpoint Creado", `Se agregó "${newCpNombre}" exitosamente`, "success");
      setNewCpNombre('');
      setIsAddCpOpen(false);
      await loadCheckpoints();
    } catch (err) {
      const msg = err.response?.data?.detail || "Error al crear checkpoint";
      if (notify) notify("Error", msg, "error");
    } finally {
      setSavingCp(false);
    }
  };

  const handleAssignOperator = async () => {
    if (!selectedCp || !userIdInput) return;
    setAssigning(true);
    try {
      await asistenciaService.asignarCheckpointPermiso(eventoId, selectedCp.id_checkpoint, {
        id_usuario: Number.parseInt(userIdInput, 10),
        puede_escanear: true
      });
      if (notify) notify("Operador Asignado", "Permiso otorgado para escanear en este checkpoint", "success");
      setUserIdInput('');
      await loadPermisos(selectedCp.id_checkpoint);
    } catch (err) {
      const msg = err.response?.data?.detail || "Error al asignar operador";
      if (notify) notify("Error", msg, "error");
    } finally {
      setAssigning(false);
    }
  };

  const handleRevokeOperator = async (idUsuario) => {
    if (!selectedCp) return;
    try {
      await asistenciaService.revocarCheckpointPermiso(eventoId, selectedCp.id_checkpoint, idUsuario);
      if (notify) notify("Permiso Revocado", "El operador ya no tiene acceso a este checkpoint", "success");
      await loadPermisos(selectedCp.id_checkpoint);
    } catch (err) {
      const msg = err.response?.data?.detail || "Error al revocar permiso";
      if (notify) notify("Error", msg, "error");
    }
  };

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <MEHTypography variant="h3">
            <ShieldCheckmark24Regular style={{ verticalAlign: 'middle', marginRight: '8px', color: tokens.colorBrandForeground1 }} />
            Checkpoints y Permisos de Operadores
          </MEHTypography>
          <MEHTypography variant="caption" style={{ opacity: 0.7 }}>
            Restringe qué operadores pueden escanear en checkpoints específicos (refrigerios, acreditación, salas). Admins y Organizadores tienen acceso global.
          </MEHTypography>
        </div>
        <MEHButton 
          size="small" 
          icon={<Add24Regular />} 
          appearance="primary" 
          onClick={() => setIsAddCpOpen(true)}
        >
          Nuevo Checkpoint
        </MEHButton>
      </div>

      {loading ? (
        <Spinner size="small" label="Cargando checkpoints del evento..." />
      ) : checkpoints.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', backgroundColor: tokens.colorNeutralBackground1, borderRadius: '12px', border: `1px dashed ${tokens.colorNeutralBackground3}` }}>
          <Location24Regular style={{ fontSize: '32px', opacity: 0.5 }} />
          <MEHTypography variant="body" style={{ display: 'block', marginTop: '8px', fontWeight: 'bold' }}>
            No hay checkpoints configurados para este evento.
          </MEHTypography>
          <MEHTypography variant="caption" style={{ opacity: 0.7 }}>
            Crea checkpoints como "Refrigerio", "Entrega de Kit" o "Sala Workshops" para restringir el acceso a operadores específicos.
          </MEHTypography>
        </div>
      ) : (
        <div className={styles.cpGrid}>
          {checkpoints.map(cp => {
            const isSelected = selectedCp?.id_checkpoint === cp.id_checkpoint;
            return (
              <div 
                key={cp.id_checkpoint} 
                className={`${styles.cpCard} ${isSelected ? styles.cpCardActive : ''}`}
                onClick={() => setSelectedCp(cp)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedCp(cp);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <MEHTypography variant="body" style={{ fontWeight: 'bold' }}>{cp.nombre_checkpoint}</MEHTypography>
                    <MEHTypography variant="caption" style={{ display: 'block', opacity: 0.7 }}>Tipo: {cp.tipo_checkpoint || 'ASISTENCIA'}</MEHTypography>
                  </div>
                  <Badge appearance={isSelected ? 'filled' : 'tint'} color="brand">
                    {cp.tipo_checkpoint || 'ASISTENCIA'}
                  </Badge>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span style={{ fontSize: '0.8rem', opacity: 0.75 }}>
                    <PeopleTeam24Regular fontSize={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    {isSelected ? `${permisos.length} operador(es)` : 'Click para ver permisos'}
                  </span>
                  {isSelected && <Badge color="success" size="small">Seleccionado</Badge>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETALLES DEL CHECKPOINT SELECCIONADO Y GESTIÓN DE OPERADORES */}
      {selectedCp && (
        <div style={{ marginTop: '16px', padding: '16px', backgroundColor: tokens.colorNeutralBackground1, borderRadius: '12px', border: `1px solid ${tokens.colorNeutralBackground3}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            <div>
              <MEHTypography variant="h4" style={{ margin: 0 }}>
                Operadores asignados a: <b>{selectedCp.nombre_checkpoint}</b>
              </MEHTypography>
              <MEHTypography variant="caption" style={{ opacity: 0.7 }}>
                Solo estos usuarios (más Admins/Organizadores) podrán escanear en este checkpoint.
              </MEHTypography>
            </div>
            <Badge appearance="outline" color="informative">ID Checkpoint: {selectedCp.id_checkpoint}</Badge>
          </div>

          {/* Formulario de Asignación */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '16px' }}>
            {availableUsers.length > 0 && (
              <Field label="Filtrar usuario por nombre o correo" style={{ minWidth: '220px', flexGrow: 1 }}>
                <Input
                  value={operatorSearch}
                  onChange={(e, d) => setOperatorSearch(d.value)}
                  placeholder="Ej: Edgar Sanchez, @alias..."
                />
              </Field>
            )}
            <Field label="Seleccionar Operador Staff" style={{ flexGrow: 2, minWidth: '240px' }}>
              {availableUsers.length > 0 ? (
                <Select value={userIdInput} onChange={(e, d) => setUserIdInput(d.value)}>
                  <option value="">-- Seleccionar operador --</option>
                  {availableUsers
                    .filter(u => matchesSmartSearch([u.nombres, u.apellidos, u.correo, u.alias, u.rol], operatorSearch))
                    .map(u => (
                      <option key={u.id_usuario} value={u.id_usuario}>
                        {u.nombres} {u.apellidos} ({u.rol} — {u.correo})
                      </option>
                    ))}
                </Select>
              ) : (
                <Input 
                  type="number" 
                  value={userIdInput} 
                  onChange={(e, d) => setUserIdInput(d.value)} 
                  placeholder="ID de Usuario del Operador (ej. 5)" 
                />
              )}
            </Field>
            <MEHButton 
              appearance="primary" 
              icon={<PersonAdd24Regular />} 
              onClick={handleAssignOperator}
              disabled={assigning || !userIdInput}
            >
              {assigning ? "Asignando..." : "Asignar Operador"}
            </MEHButton>
          </div>

          {/* Lista de Operadores con Permiso */}
          {loadingPermisos ? (
            <Spinner size="small" label="Cargando operadores asignados..." />
          ) : permisos.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', opacity: 0.6, backgroundColor: tokens.colorNeutralBackground2, borderRadius: '8px' }}>
              <LockClosed24Regular style={{ verticalAlign: 'middle', marginRight: '6px' }} />
              No hay operadores específicos asignados a este checkpoint. Solo Administradores y Organizadores podrán escanear aquí.
            </div>
          ) : (
            <div className={styles.operatorList}>
              {permisos.map(p => (
                <div key={p.id_permiso} className={styles.operatorRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Avatar name={`${p.usuario?.nombres || ''} ${p.usuario?.apellidos || ''}`} size={32} />
                    <div>
                      <MEHTypography variant="body" style={{ fontWeight: 'bold' }}>
                        {p.usuario ? `${p.usuario.nombres} ${p.usuario.apellidos}` : `Usuario #${p.id_usuario}`}
                      </MEHTypography>
                      <MEHTypography variant="caption" style={{ opacity: 0.7, display: 'block' }}>
                        {p.usuario?.correo} • Rol: {p.usuario?.rol || 'STAFF'}
                      </MEHTypography>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Badge color="success" appearance="tint">Habilitado para escanear</Badge>
                    <Tooltip content="Revocar acceso a este checkpoint" relationship="label">
                      <MEHButton 
                        size="small" 
                        appearance="subtle" 
                        icon={<Delete24Regular />} 
                        style={{ color: tokens.colorPaletteRedForeground1 }} 
                        onClick={() => handleRevokeOperator(p.id_usuario)}
                        aria-label="Revocar permiso"
                      />
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Nuevo Checkpoint */}
      <Dialog open={isAddCpOpen} onOpenChange={(e, d) => setIsAddCpOpen(d.open)}>
        <DialogSurface style={{ backgroundColor: tokens.colorNeutralBackground1, maxWidth: '440px', width: '90%', borderRadius: '16px' }}>
          <DialogBody>
            <DialogTitle>Crear Nuevo Checkpoint</DialogTitle>
            <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px 0' }}>
              <Field label="Nombre del Checkpoint" required>
                <Input 
                  value={newCpNombre} 
                  onChange={(e, d) => setNewCpNombre(d.value)} 
                  placeholder="Ej. Almuerzo, Refrigerio, Sala de Talleres" 
                />
              </Field>
              <Field label="Tipo de Checkpoint" required>
                <Select value={newCpTipo} onChange={(e, d) => setNewCpTipo(d.value)}>
                  <option value="ASISTENCIA">Asistencia General / Entrada</option>
                  <option value="COMIDA">Comida / Refrigerio</option>
                  <option value="ACCESO">Control de Acceso / Sala VIP</option>
                  <option value="ENTREGA_KIT">Entrega de Kit / Souvenirs</option>
                </Select>
              </Field>
            </DialogContent>
            <DialogActions style={{ gap: '8px' }}>
              <MEHButton appearance="secondary" onClick={() => setIsAddCpOpen(false)}>
                Cancelar
              </MEHButton>
              <MEHButton 
                appearance="primary" 
                onClick={handleCreateCheckpoint} 
                disabled={savingCp || !newCpNombre.trim()}
              >
                {savingCp ? "Creando..." : "Guardar Checkpoint"}
              </MEHButton>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};

export default CheckpointPermisosPanel;

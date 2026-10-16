import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogBody,
  DialogActions,
  Button,
  Badge,
  Spinner,
  TabList,
  Tab,
  makeStyles,
  shorthands,
  tokens,
} from '@fluentui/react-components';
import {
  ArrowSync24Regular,
  ArrowSync24Filled,
  Dismiss24Regular,
  Warning24Filled,
  CheckmarkCircle24Filled,
  Wifi124Regular,
  WifiOff24Regular,
  Delete24Regular,
  CalendarStar24Regular,
  QrCode24Regular,
  Info24Regular,
} from '@fluentui/react-icons';
import { MEHTypography } from './ui';
import * as offlineDb from '../utils/offlineDb';
import api from '../services/api';
import asistenciaService from '../services/asistenciaService';
import { useNotify } from '../App';

const useStyles = makeStyles({
  surface: {
    maxWidth: '720px',
    width: '95vw',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius('18px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3),
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    paddingBottom: '12px',
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralBackground3),
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  statusChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    ...shorthands.padding('4px', '10px'),
    ...shorthands.borderRadius('999px'),
    fontSize: '12px',
    fontWeight: '600',
  },
  onlineStatus: {
    backgroundColor: 'rgba(16, 124, 65, 0.15)',
    color: tokens.colorPaletteGreenForeground1,
    ...shorthands.border('1px', 'solid', 'rgba(16, 124, 65, 0.3)'),
  },
  offlineStatus: {
    backgroundColor: 'rgba(216, 59, 1, 0.15)',
    color: tokens.colorPaletteRedForeground1,
    ...shorthands.border('1px', 'solid', 'rgba(216, 59, 1, 0.3)'),
  },
  content: {
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    paddingTop: '16px',
    paddingBottom: '16px',
  },
  itemList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  itemCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    ...shorthands.padding('14px', '16px'),
    ...shorthands.borderRadius('12px'),
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3),
    transition: 'all 0.2s ease',
  },
  itemCardError: {
    ...shorthands.border('1px', 'solid', 'rgba(216, 59, 1, 0.45)'),
    backgroundColor: 'rgba(216, 59, 1, 0.04)',
  },
  itemTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '8px',
  },
  itemInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
  },
  itemActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    ...shorthands.padding('8px', '12px'),
    ...shorthands.borderRadius('8px'),
    backgroundColor: 'rgba(216, 59, 1, 0.12)',
    ...shorthands.border('1px', 'solid', 'rgba(216, 59, 1, 0.3)'),
    color: tokens.colorPaletteRedForeground1,
    fontSize: '12px',
    lineHeight: '16px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '40px 20px',
    textAlign: 'center',
    opacity: 0.7,
  },
  actionsFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '10px',
    paddingTop: '12px',
    ...shorthands.borderTop('1px', 'solid', tokens.colorNeutralBackground3),
  },
});

const SyncQueuePanel = ({ isOpen, onClose }) => {
  const styles = useStyles();
  const notify = useNotify();
  const [selectedTab, setSelectedTab] = useState('inscripciones');
  const [inscripciones, setInscripciones] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [itemSyncingId, setItemSyncingId] = useState(null);

  const cargarColas = async () => {
    try {
      const colaIns = await offlineDb.obtenerColaInscripciones();
      const colaAsis = await offlineDb.obtenerColaAsistencia();
      setInscripciones(colaIns);
      setAsistencias(colaAsis);
    } catch (err) {
      console.error('Error cargando colas de sincronización:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      cargarColas();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleQueueUpdated = () => cargarColas();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('meh_offline_sync_updated', handleQueueUpdated);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('meh_offline_sync_updated', handleQueueUpdated);
    };
  }, []);

  // Reintentar inscripción individual
  const handleReintentarInscripcion = async (item) => {
    if (!isOnline) {
      notify('Sin conexión', 'No hay conexión a internet para sincronizar ahora', 'warning');
      return;
    }
    setItemSyncingId(`ins-${item.id}`);
    try {
      const res = await offlineDb.sincronizarInscripcionItem(item, api);
      if (res.success) {
        notify('Sincronizado', `Inscripción al evento #${item.id_evento} completada exitosamente`, 'success');
      } else {
        notify(
          res.isConflict ? 'Conflicto de Sincronización' : 'Fallo de Sincronización',
          res.error,
          'error'
        );
      }
      await cargarColas();
    } catch (err) {
      console.error('Error al reintentar inscripción:', err);
      notify('Error', err.message || 'No se pudo sincronizar', 'error');
    } finally {
      setItemSyncingId(null);
    }
  };

  // Descartar inscripción individual
  const handleDescartarInscripcion = async (id) => {
    try {
      await offlineDb.eliminarInscripcionOffline(id);
      notify('Descartado', 'La inscripción fue eliminada de la cola', 'info');
      await cargarColas();
    } catch (err) {
      console.error('Error al descartar:', err);
    }
  };

  // Reintentar asistencia individual
  const handleReintentarAsistencia = async (item) => {
    if (!isOnline) {
      notify('Sin conexión', 'No hay conexión a internet para sincronizar ahora', 'warning');
      return;
    }
    setItemSyncingId(`asis-${item.id}`);
    try {
      await asistenciaService.registrarPorQR(item.codigo_qr, item.id_checkpoint);
      await offlineDb.eliminarDeCola(item.id);
      notify('Sincronizado', `Asistencia de ${item.nombre_completo} confirmada`, 'success');
      await cargarColas();
    } catch (err) {
      console.error('Error al reintentar asistencia:', err);
      const detail = err.response?.data?.detail || '';
      if (detail.includes('ya fue escaneada') || detail.includes('Ya se registró asistencia')) {
        await offlineDb.eliminarDeCola(item.id);
        notify('Ya registrada', `La asistencia de ${item.nombre_completo} ya existía en el servidor`, 'info');
        await cargarColas();
      } else {
        notify('Error', detail || 'Error al conectar con el servidor', 'error');
      }
    } finally {
      setItemSyncingId(null);
    }
  };

  // Descartar asistencia individual
  const handleDescartarAsistencia = async (id) => {
    try {
      await offlineDb.eliminarDeCola(id);
      notify('Descartado', 'El registro de asistencia fue eliminado de la cola', 'info');
      await cargarColas();
    } catch (err) {
      console.error('Error al descartar:', err);
    }
  };

  // Sincronizar toda la cola activa
  const handleSincronizarTodo = async () => {
    if (!isOnline) {
      notify('Sin red', 'Conéctate a internet para sincronizar la cola', 'warning');
      return;
    }

    setIsSyncingAll(true);
    try {
      // 1. Sincronizar inscripciones
      const resIns = await offlineDb.sincronizarColaInscripciones(api);

      // 2. Sincronizar asistencias QR
      let exitososAsis = 0;
      let fallidosAsis = 0;
      for (const asisItem of asistencias) {
        try {
          await asistenciaService.registrarPorQR(asisItem.codigo_qr, asisItem.id_checkpoint);
          await offlineDb.eliminarDeCola(asisItem.id);
          exitososAsis++;
        } catch (err) {
          const detail = err.response?.data?.detail || '';
          if (detail.includes('ya fue escaneada') || detail.includes('Ya se registró asistencia')) {
            await offlineDb.eliminarDeCola(asisItem.id);
            exitososAsis++;
          } else {
            fallidosAsis++;
          }
        }
      }

      await cargarColas();

      const totalExitosos = (resIns.exitosos || 0) + exitososAsis;
      const totalFallidos = (resIns.fallidos || 0) + fallidosAsis;

      if (totalFallidos > 0) {
        notify(
          'Sincronización Parcial',
          `${totalExitosos} sincronizados con éxito. ${totalFallidos} requieren atención por conflicto o error.`,
          'warning'
        );
      } else {
        notify('Cola Sincronizada', 'Todos los elementos han sido sincronizados exitosamente', 'success');
      }
    } catch (err) {
      console.error('Error sincronizando todo:', err);
      notify('Error', 'Fallo general de sincronización', 'error');
    } finally {
      setIsSyncingAll(false);
    }
  };

  // Vaciar toda la cola
  const handleVaciarCola = async () => {
    try {
      await offlineDb.limpiarColaInscripciones();
      notify('Cola Vaciada', 'Se descartaron los elementos pendientes', 'info');
      await cargarColas();
    } catch (err) {
      console.error('Error al vaciar cola:', err);
    }
  };

  const totalPendientes = inscripciones.length + asistencias.length;

  return (
    <Dialog open={isOpen} onOpenChange={(e, d) => !d.open && onClose()}>
      <DialogSurface className={styles.surface}>
        <DialogTitle>
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <ArrowSync24Filled style={{ color: tokens.colorBrandForeground1 }} />
              <MEHTypography variant="h2">Cola de Sincronización Offline</MEHTypography>
            </div>
            <div
              className={`${styles.statusChip} ${
                isOnline ? styles.onlineStatus : styles.offlineStatus
              }`}
            >
              {isOnline ? <Wifi124Regular /> : <WifiOff24Regular />}
              {isOnline ? 'En línea' : 'Sin conexión'}
            </div>
          </div>
        </DialogTitle>

        <DialogContent className={styles.content}>
          <TabList
            selectedValue={selectedTab}
            onTabSelect={(e, d) => setSelectedTab(d.value)}
          >
            <Tab value="inscripciones" icon={<CalendarStar24Regular />}>
              Inscripciones ({inscripciones.length})
            </Tab>
            <Tab value="asistencias" icon={<QrCode24Regular />}>
              Asistencias QR ({asistencias.length})
            </Tab>
          </TabList>

          {/* TAB 1: INSCRIPCIONES */}
          {selectedTab === 'inscripciones' && (
            <div className={styles.itemList}>
              {inscripciones.length === 0 ? (
                <div className={styles.emptyState}>
                  <CheckmarkCircle24Filled style={{ fontSize: '36px', color: tokens.colorPaletteGreenForeground1 }} />
                  <MEHTypography variant="h3">No hay inscripciones pendientes</MEHTypography>
                  <MEHTypography variant="body">
                    Cuando te inscribas a eventos sin conexión, se guardarán aquí para sincronizarse automáticamente.
                  </MEHTypography>
                </div>
              ) : (
                inscripciones.map((item) => {
                  const isError = item.estado === 'ERROR';
                  const isSyncing = itemSyncingId === `ins-${item.id}`;

                  return (
                    <div
                      key={`ins-${item.id}`}
                      className={`${styles.itemCard} ${isError ? styles.itemCardError : ''}`}
                    >
                      <div className={styles.itemTop}>
                        <div className={styles.itemInfo}>
                          <MEHTypography variant="h3">
                            {item.titulo_evento || `Evento #${item.id_evento}`}
                          </MEHTypography>
                          <MEHTypography variant="caption" style={{ opacity: 0.7 }}>
                            Creado: {new Date(item.fecha_creacion).toLocaleString('es-BO')} | Intentos: {item.intentos || 0}
                          </MEHTypography>
                        </div>

                        <div className={styles.itemActions}>
                          <Badge
                            color={isError ? 'danger' : 'warning'}
                            appearance="filled"
                          >
                            {isError ? 'Error / Conflicto' : 'Pendiente'}
                          </Badge>

                          <Button
                            size="small"
                            appearance="primary"
                            icon={isSyncing ? <Spinner size="tiny" /> : <ArrowSync24Regular />}
                            disabled={!isOnline || isSyncing}
                            onClick={() => handleReintentarInscripcion(item)}
                          >
                            Reintentar
                          </Button>

                          <Button
                            size="small"
                            appearance="subtle"
                            icon={<Dismiss24Regular />}
                            onClick={() => handleDescartarInscripcion(item.id)}
                          >
                            Descartar
                          </Button>
                        </div>
                      </div>

                      {/* Error detalle visible y explícito (409, cupo, etc.) */}
                      {isError && item.error_detalle && (
                        <div className={styles.errorBox}>
                          <Warning24Filled />
                          <div>
                            <strong>Error de Sincronización: </strong>
                            {item.error_detalle}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: ASISTENCIAS QR */}
          {selectedTab === 'asistencias' && (
            <div className={styles.itemList}>
              {asistencias.length === 0 ? (
                <div className={styles.emptyState}>
                  <CheckmarkCircle24Filled style={{ fontSize: '36px', color: tokens.colorPaletteGreenForeground1 }} />
                  <MEHTypography variant="h3">No hay asistencias QR pendientes</MEHTypography>
                  <MEHTypography variant="body">
                    Los escaneos QR realizados en modo offline se almacenarán en esta cola hasta volver a tener conexión.
                  </MEHTypography>
                </div>
              ) : (
                asistencias.map((item) => {
                  const isSyncing = itemSyncingId === `asis-${item.id}`;

                  return (
                    <div key={`asis-${item.id}`} className={styles.itemCard}>
                      <div className={styles.itemTop}>
                        <div className={styles.itemInfo}>
                          <MEHTypography variant="h3">
                            {item.nombre_completo || 'Participante'}
                          </MEHTypography>
                          <MEHTypography variant="caption" style={{ opacity: 0.7 }}>
                            QR: {item.codigo_qr} | Checkpoint: {item.id_checkpoint ? `#${item.id_checkpoint}` : 'Entrada General'}
                          </MEHTypography>
                          <MEHTypography variant="caption" style={{ opacity: 0.5 }}>
                            Escaneado: {new Date(item.fecha_escaneo).toLocaleString('es-BO')}
                          </MEHTypography>
                        </div>

                        <div className={styles.itemActions}>
                          <Badge color="warning" appearance="filled">
                            Pendiente
                          </Badge>

                          <Button
                            size="small"
                            appearance="primary"
                            icon={isSyncing ? <Spinner size="tiny" /> : <ArrowSync24Regular />}
                            disabled={!isOnline || isSyncing}
                            onClick={() => handleReintentarAsistencia(item)}
                          >
                            Reintentar
                          </Button>

                          <Button
                            size="small"
                            appearance="subtle"
                            icon={<Dismiss24Regular />}
                            onClick={() => handleDescartarAsistencia(item.id)}
                          >
                            Descartar
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </DialogContent>

        <DialogActions className={styles.actionsFooter}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {totalPendientes > 0 && (
              <Button
                appearance="subtle"
                icon={<Delete24Regular />}
                onClick={handleVaciarCola}
              >
                Vaciar Cola
              </Button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button appearance="secondary" onClick={onClose}>
              Cerrar
            </Button>
            {totalPendientes > 0 && (
              <Button
                appearance="primary"
                icon={isSyncingAll ? <Spinner size="tiny" /> : <ArrowSync24Filled />}
                disabled={!isOnline || isSyncingAll}
                onClick={handleSincronizarTodo}
              >
                {isSyncingAll ? 'Sincronizando...' : 'Sincronizar Todo Ahora'}
              </Button>
            )}
          </div>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
};

export default SyncQueuePanel;

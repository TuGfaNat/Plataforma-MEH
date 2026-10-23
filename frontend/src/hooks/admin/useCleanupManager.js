import { useState, useEffect, useCallback, useMemo } from 'react';
import cleanupService from '../../services/cleanupService';

export const useCleanupManager = ({ notify, isAdmin = true }) => {
  const [step, setStep] = useState(1);
  const [loadingInit, setLoadingInit] = useState(Boolean(isAdmin));
  const [loadingRows, setLoadingRows] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingBackup, setLoadingBackup] = useState(false);
  const [loadingExecute, setLoadingExecute] = useState(false);

  const [statusConfig, setStatusConfig] = useState({
    enabled: true,
    superadmin_email: 'natalygemio@gmail.com',
    backup_ttl_minutes: 30,
    soft_delete_phrase: 'ELIMINAR DATOS',
    hard_delete_phrase: 'BORRADO DEFINITIVO',
  });
  const [catalog, setCatalog] = useState([]);
  const [protectedConfig, setProtectedConfig] = useState({
    superadmin_email: 'natalygemio@gmail.com',
    current_user_email: '',
    current_user_id: null,
    whitelist_emails: [],
    protected_users: [],
  });
  const [presets, setPresets] = useState([]);
  const [activePresetId, setActivePresetId] = useState('');

  // Selección de tablas y filas { [tabla]: number[] }
  const [selectedTables, setSelectedTables] = useState(['usuarios', 'eventos', 'cursos']);
  const [activeTable, setActiveTable] = useState('usuarios');
  const [tableRows, setTableRows] = useState([]);
  const [rowSearch, setRowSearch] = useState('');
  const [originFilter, setOriginFilter] = useState('ALL');
  const [selections, setSelections] = useState({});

  // Configuración de ejecución (Soft por defecto)
  const [mode, setMode] = useState('soft');
  const [includeDependencies, setIncludeDependencies] = useState(true);

  // Preview y Backup
  const [previewData, setPreviewData] = useState(null);
  const [backupData, setBackupData] = useState(null);

  // Confirmación Paso 4
  const [motivo, setMotivo] = useState('');
  const [confirmationPhrase, setConfirmationPhrase] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [hardDeleteConfirmed, setHardDeleteConfirmed] = useState(false);
  const [executionError, setExecutionError] = useState('');
  const [executionReport, setExecutionReport] = useState(null);

  const notifySafe = useCallback(
    (title, msg, type = 'info') => {
      if (typeof notify === 'function') {
        notify(title, msg, type);
      }
    },
    [notify]
  );

  const loadInitialData = useCallback(async () => {
    setLoadingInit(true);
    try {
      const [st, cat, prot, prs] = await Promise.all([
        cleanupService.getStatus(),
        cleanupService.getCatalog(),
        cleanupService.getProtectedConfig(),
        cleanupService.getPresets(),
      ]);
      if (st) setStatusConfig(st);
      if (Array.isArray(cat)) setCatalog(cat);
      if (prot) setProtectedConfig(prot);
      if (Array.isArray(prs)) setPresets(prs);
    } catch (err) {
      const detail = err?.response?.data?.detail || 'No se pudo cargar el módulo de limpieza de datos';
      notifySafe('Error', detail, 'error');
    } finally {
      setLoadingInit(false);
    }
  }, [notifySafe]);

  useEffect(() => {
    if (isAdmin) {
      loadInitialData();
    }
  }, [isAdmin, loadInitialData]);

  const loadRowsForActiveTable = useCallback(async () => {
    if (!activeTable) return;
    setLoadingRows(true);
    try {
      const rows = await cleanupService.getTableRows(activeTable, {
        search: rowSearch || undefined,
        origen: originFilter !== 'ALL' ? originFilter : undefined,
      });
      setTableRows(Array.isArray(rows) ? rows : []);
    } catch (err) {
      notifySafe('Error', 'No se pudieron cargar los registros de la tabla', 'error');
    } finally {
      setLoadingRows(false);
    }
  }, [activeTable, rowSearch, originFilter, notifySafe]);

  useEffect(() => {
    if (step === 2 && activeTable) {
      loadRowsForActiveTable();
    }
  }, [step, activeTable, loadRowsForActiveTable]);

  // Invalidar backup si cambia modo, dependencias o selecciones
  useEffect(() => {
    setBackupData(null);
    setExecutionError('');
  }, [selections, mode, includeDependencies]);

  const toggleTableInScope = (tableKey) => {
    setSelectedTables((prev) => {
      const exists = prev.includes(tableKey);
      const next = exists ? prev.filter((k) => k !== tableKey) : [...prev, tableKey];
      if (!exists && !activeTable) {
        setActiveTable(tableKey);
      } else if (exists && activeTable === tableKey) {
        setActiveTable(next[0] || '');
      }
      return next;
    });
    // Si se desmarca una tabla del alcance, limpiar sus IDs seleccionados
    setSelections((prev) => {
      if (!prev[tableKey]) return prev;
      const copy = { ...prev };
      delete copy[tableKey];
      return copy;
    });
  };

  const toggleRowSelection = (tabla, row) => {
    if (row.protegido) return;
    setSelections((prev) => {
      const current = prev[tabla] || [];
      const exists = current.includes(row.id);
      const updated = exists ? current.filter((id) => id !== row.id) : [...current, row.id];
      const next = { ...prev };
      if (updated.length > 0) {
        next[tabla] = updated;
      } else {
        delete next[tabla];
      }
      return next;
    });
  };

  const selectAllVisibleRows = (tabla, rows) => {
    const selectableIds = rows.filter((r) => !r.protegido).map((r) => r.id);
    setSelections((prev) => {
      const current = new Set(prev[tabla] || []);
      selectableIds.forEach((id) => current.add(id));
      const arr = Array.from(current);
      if (arr.length === 0) return prev;
      return { ...prev, [tabla]: arr };
    });
  };

  const clearTableSelection = (tabla) => {
    setSelections((prev) => {
      const copy = { ...prev };
      delete copy[tabla];
      return copy;
    });
  };

  const applyPreset = async (presetId) => {
    try {
      setLoadingInit(true);
      const resolved = await cleanupService.resolvePreset(presetId);
      const nextSelections = resolved.selections || {};
      const nextTables = Object.keys(nextSelections);
      setActivePresetId(presetId);
      setSelections(nextSelections);
      if (nextTables.length > 0) {
        setSelectedTables(nextTables);
        setActiveTable(nextTables[0]);
      } else if (resolved.preset?.tablas?.length > 0) {
        setSelectedTables(resolved.preset.tablas);
        setActiveTable(resolved.preset.tablas[0]);
      }
      if (resolved.mode) setMode(resolved.mode);
      if (typeof resolved.include_dependencies === 'boolean') {
        setIncludeDependencies(resolved.include_dependencies);
      }
      const totalIds = Object.values(nextSelections).reduce((acc, arr) => acc + arr.length, 0);
      notifySafe(
        'Preset aplicado',
        `Preset "${resolved.preset?.nombre || presetId}" cargado con ${totalIds} registros seleccionados.`,
        'success'
      );
    } catch (err) {
      const detail = err?.response?.data?.detail || 'No se pudo aplicar el preset';
      notifySafe('Error', detail, 'error');
    } finally {
      setLoadingInit(false);
    }
  };

  const handleSaveCustomPreset = async ({ nombre, descripcion, origen_filter = 'ALL' }) => {
    try {
      const created = await cleanupService.savePreset({
        nombre,
        descripcion,
        mode,
        include_dependencies: includeDependencies,
        origen_filter,
        tablas: selectedTables,
        selections,
      });
      const updatedPresets = await cleanupService.getPresets();
      setPresets(updatedPresets);
      setActivePresetId(created.id);
      notifySafe('Preset guardado', `Se guardó el preset "${created.nombre}"`, 'success');
      return created;
    } catch (err) {
      const detail = err?.response?.data?.detail || 'No se pudo guardar el preset';
      notifySafe('Error', detail, 'error');
      throw err;
    }
  };

  const handleDeleteCustomPreset = async (presetId) => {
    try {
      await cleanupService.deletePreset(presetId);
      const updatedPresets = await cleanupService.getPresets();
      setPresets(updatedPresets);
      if (activePresetId === presetId) setActivePresetId('');
      notifySafe('Preset eliminado', 'El preset personalizado fue eliminado', 'success');
    } catch (err) {
      const detail = err?.response?.data?.detail || 'No se pudo eliminar el preset';
      notifySafe('Error', detail, 'error');
    }
  };

  const handleAddWhitelistEmail = async (email) => {
    const clean = (email || '').trim().toLowerCase();
    if (!clean) return;
    try {
      const nextEmails = Array.from(new Set([...(protectedConfig.whitelist_emails || []), clean]));
      const updated = await cleanupService.updateWhitelist(nextEmails);
      setProtectedConfig(updated);
      await loadInitialData();
      notifySafe('Lista blanca actualizada', `Se protegió la cuenta ${clean}`, 'success');
    } catch (err) {
      const detail = err?.response?.data?.detail || 'Correo inválido para lista blanca';
      notifySafe('Error', detail, 'error');
    }
  };

  const handleRemoveWhitelistEmail = async (email) => {
    try {
      const nextEmails = (protectedConfig.whitelist_emails || []).filter((e) => e !== email);
      const updated = await cleanupService.updateWhitelist(nextEmails);
      setProtectedConfig(updated);
      await loadInitialData();
      notifySafe('Lista blanca actualizada', `Se retiró ${email} de la lista blanca`, 'info');
    } catch (err) {
      const detail = err?.response?.data?.detail || 'No se pudo actualizar la lista blanca';
      notifySafe('Error', detail, 'error');
    }
  };

  const runPreview = useCallback(
    async (overrideMode = mode, overrideDeps = includeDependencies) => {
      setLoadingPreview(true);
      setExecutionError('');
      try {
        const res = await cleanupService.previewCleanup({
          selections,
          mode: overrideMode,
          include_dependencies: overrideDeps,
        });
        setPreviewData(res);
        return res;
      } catch (err) {
        const detail = err?.response?.data?.detail || 'Error al calcular la previsualización';
        notifySafe('Error', detail, 'error');
        return null;
      } finally {
        setLoadingPreview(false);
      }
    },
    [selections, mode, includeDependencies, notifySafe]
  );

  const handleGenerateBackup = async () => {
    setLoadingBackup(true);
    setExecutionError('');
    try {
      const res = await cleanupService.createBackup({
        selections,
        mode,
        include_dependencies: includeDependencies,
      });
      setBackupData(res);
      notifySafe(
        'Respaldo generado',
        `Backup ${res.backup_id} creado con éxito (vigente por ${res.ttl_minutes} min).`,
        'success'
      );
      return res;
    } catch (err) {
      const detail = err?.response?.data?.detail || 'No se pudo generar el respaldo previo';
      notifySafe('Error', detail, 'error');
      return null;
    } finally {
      setLoadingBackup(false);
    }
  };

  const handleDownloadBackupFile = async (backupId) => {
    try {
      const data = await cleanupService.downloadBackup(backupId || backupData?.backup_id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${backupId || backupData?.backup_id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      const detail = err?.response?.data?.detail || 'No se pudo descargar el respaldo';
      notifySafe('Error', detail, 'error');
    }
  };

  const handleExecuteCleanup = async () => {
    if (!previewData || !backupData) {
      setExecutionError('Debes generar primero la previsualización y el respaldo obligatorio.');
      return null;
    }
    setLoadingExecute(true);
    setExecutionError('');
    try {
      const res = await cleanupService.executeCleanup({
        selections,
        mode,
        include_dependencies: includeDependencies,
        selection_hash: previewData.selection_hash,
        backup_id: backupData.backup_id,
        confirmation_phrase: confirmationPhrase,
        admin_password: adminPassword,
        motivo,
        hard_delete_confirmed: hardDeleteConfirmed,
      });
      setExecutionReport(res);
      setAdminPassword('');
      notifySafe(
        'Limpieza completada',
        `Se procesaron ${res.total_affected} registros en modo ${res.mode.toUpperCase()}.`,
        'success'
      );
      await loadInitialData();
      return res;
    } catch (err) {
      const detail =
        err?.response?.data?.detail ||
        'Error al ejecutar la limpieza. La transacción realizó rollback completo.';
      setExecutionError(detail);
      notifySafe('Ejecución rechazada', detail, 'error');
      return null;
    } finally {
      setLoadingExecute(false);
    }
  };

  const resetWizard = () => {
    setSelections({});
    setPreviewData(null);
    setBackupData(null);
    setMotivo('');
    setConfirmationPhrase('');
    setAdminPassword('');
    setHardDeleteConfirmed(false);
    setExecutionError('');
    setExecutionReport(null);
    setStep(1);
    loadInitialData();
  };

  const totalSelectedCount = useMemo(
    () => Object.values(selections).reduce((acc, ids) => acc + (ids?.length || 0), 0),
    [selections]
  );

  return {
    step,
    setStep,
    loadingInit,
    loadingRows,
    loadingPreview,
    loadingBackup,
    loadingExecute,
    statusConfig,
    catalog,
    protectedConfig,
    presets,
    activePresetId,
    selectedTables,
    setSelectedTables,
    activeTable,
    setActiveTable,
    tableRows,
    rowSearch,
    setRowSearch,
    originFilter,
    setOriginFilter,
    selections,
    setSelections,
    totalSelectedCount,
    mode,
    setMode,
    includeDependencies,
    setIncludeDependencies,
    previewData,
    backupData,
    motivo,
    setMotivo,
    confirmationPhrase,
    setConfirmationPhrase,
    adminPassword,
    setAdminPassword,
    hardDeleteConfirmed,
    setHardDeleteConfirmed,
    executionError,
    executionReport,
    toggleTableInScope,
    toggleRowSelection,
    selectAllVisibleRows,
    clearTableSelection,
    applyPreset,
    handleSaveCustomPreset,
    handleDeleteCustomPreset,
    handleAddWhitelistEmail,
    handleRemoveWhitelistEmail,
    runPreview,
    handleGenerateBackup,
    handleDownloadBackupFile,
    handleExecuteCleanup,
    resetWizard,
    loadRowsForActiveTable,
  };
};

export default useCleanupManager;

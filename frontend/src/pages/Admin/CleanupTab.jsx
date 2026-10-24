import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  TabList,
  Tab,
  Spinner,
  Input,
  Badge,
  Button,
  Checkbox,
  Switch,
  Tooltip,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  tokens,
  makeStyles,
  shorthands,
} from '@fluentui/react-components';
import {
  ShieldLock24Regular,
  DeleteDismiss24Regular,
  Warning24Regular,
  CheckmarkCircle24Regular,
  Search24Regular,
  ArrowRight24Regular,
  ArrowLeft24Regular,
  ArrowDownload24Regular,
  Save24Regular,
  Delete24Regular,
  Add24Regular,
  Database24Regular,
  LockClosed24Regular,
  History24Regular,
} from '@fluentui/react-icons';
import { MEHButton, MEHTypography } from '../../components/ui';
import { useCleanupManager } from '../../hooks/admin/useCleanupManager';

const useStyles = makeStyles({
  banner: {
    padding: '16px 22px',
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRadius('16px'),
    marginBottom: '18px',
    borderLeft: `4px solid ${tokens.colorBrandForeground1}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '14px',
  },
  dangerBanner: {
    padding: '16px 20px',
    backgroundColor: 'rgba(220, 38, 38, 0.14)',
    color: tokens.colorNeutralForeground1,
    ...shorthands.borderRadius('14px'),
    ...shorthands.border('1px', 'solid', 'rgba(239, 68, 68, 0.45)'),
    borderLeft: '4px solid #ef4444',
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  stepBar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 210px), 1fr))',
    gap: '10px',
    marginBottom: '20px',
  },
  stepButton: {
    ...shorthands.padding('12px', '16px'),
    ...shorthands.borderRadius('12px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
    backgroundColor: tokens.colorNeutralBackground2,
    color: tokens.colorNeutralForeground1,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontWeight: '600',
    fontSize: '0.92rem',
    textAlign: 'left',
    transition: 'all 0.2s ease',
    ':hover:not(:disabled)': {
      ...shorthands.borderColor(tokens.colorBrandStroke1),
      backgroundColor: tokens.colorNeutralBackground3,
    },
    ':disabled': {
      opacity: 0.45,
      cursor: 'not-allowed',
    },
  },
  stepActive: {
    backgroundColor: 'rgba(127, 19, 236, 0.22)',
    ...shorthands.border('2px', 'solid', tokens.colorBrandStroke1),
    color: tokens.colorNeutralForeground1,
    boxShadow: '0 4px 16px rgba(127, 19, 236, 0.2)',
  },
  stepBadge: {
    width: '26px',
    height: '26px',
    ...shorthands.borderRadius('50%'),
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.82rem',
    fontWeight: '700',
    flexShrink: 0,
    backgroundColor: tokens.colorNeutralBackground4,
    color: tokens.colorNeutralForeground1,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
  },
  stepBadgeActive: {
    backgroundColor: tokens.colorBrandBackground,
    color: '#ffffff',
    ...shorthands.borderColor(tokens.colorBrandBackground),
  },
  gridTwo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
    gap: '16px',
    marginBottom: '20px',
  },
  cardBox: {
    padding: '20px',
    ...shorthands.borderRadius('16px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
    backgroundColor: tokens.colorNeutralBackground1,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  presetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '12px',
  },
  presetCard: {
    padding: '14px',
    ...shorthands.borderRadius('12px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
    backgroundColor: tokens.colorNeutralBackground2,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '10px',
  },
  presetActive: {
    ...shorthands.border('2px', 'solid', tokens.colorBrandStroke1),
    backgroundColor: tokens.colorBrandBackground2,
  },
  catalogGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '12px',
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
    ...shorthands.borderRadius('16px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
    backgroundColor: tokens.colorNeutralBackground1,
  },
  footerNav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '24px',
    paddingTop: '16px',
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    flexWrap: 'wrap',
    gap: '12px',
  },
});

const GROUP_LABELS = {
  usuarios_y_accesos: 'Usuarios y Accesos',
  eventos_y_logistica: 'Eventos y Logística QR',
  academia_lms: 'Academia y Aula Virtual (LMS)',
  finanzas_y_tienda: 'Finanzas, Pagos y Tienda POS',
  comunidad_y_sistema: 'Comunidad, Alianzas y Sistema',
};

const ORIGIN_COLORS = {
  SEED: 'warning',
  OCR: 'informative',
  REAL: 'success',
};

const PROTECTED_REASON_COLORS = {
  SUPERADMIN: 'important',
  USUARIO_ACTUAL: 'brand',
  LISTA_BLANCA: 'success',
};

const DEP_ACTION_COLORS = {
  BLOCKED: 'danger',
  AUTO_INCLUDED: 'brand',
};

const Step1CatalogPresets = ({
  styles,
  protectedConfig,
  newWhitelistEmail,
  setNewWhitelistEmail,
  handleAddWhitelistEmail,
  handleRemoveWhitelistEmail,
  presets,
  activePresetId,
  applyPreset,
  handleDeleteCustomPreset,
  setPresetDialogOpen,
  catalog,
  selectedTables,
  selections,
  toggleTableInScope,
  totalSelectedCount,
  activeTable,
  setActiveTable,
  setStep,
}) => {
  const onAddWhitelistClick = async () => {
    await handleAddWhitelistEmail(newWhitelistEmail);
    setNewWhitelistEmail('');
  };

  return (
    <div data-testid="cleanup-step-1">
      <div className={styles.gridTwo}>
        {/* Panel de Cuentas Intocables y Lista Blanca */}
        <div className={styles.cardBox}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldLock24Regular style={{ color: tokens.colorPaletteGreenForeground1 }} />
            <MEHTypography variant="h3">Cuentas Protegidas e Intocables</MEHTypography>
          </div>
          <MEHTypography variant="caption">
            El Superadmin, tu usuario en sesión y los correos en lista blanca nunca pueden ser eliminados.
          </MEHTypography>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
            {protectedConfig.protected_users?.map((pu) => (
              <div
                key={pu.correo}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  backgroundColor: tokens.colorNeutralBackground2,
                  border: `1px solid ${tokens.colorNeutralStroke2}`,
                  fontSize: '12px',
                }}
              >
                <span><b>{pu.correo}</b></span>
                <Badge
                  size="small"
                  appearance="filled"
                  color={PROTECTED_REASON_COLORS[pu.motivo] || 'success'}
                >
                  {pu.motivo}
                </Badge>
                {pu.motivo === 'LISTA_BLANCA' && (
                  <Button
                    size="small"
                    appearance="subtle"
                    icon={<Delete24Regular />}
                    aria-label={`Quitar ${pu.correo} de lista blanca`}
                    onClick={() => {
                      void handleRemoveWhitelistEmail(pu.correo);
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <Input
              placeholder="Agregar correo a lista blanca..."
              aria-label="Correo para lista blanca"
              value={newWhitelistEmail}
              onChange={(e, d) => setNewWhitelistEmail(d.value)}
              style={{ flex: 1 }}
            />
            <Button
              appearance="secondary"
              icon={<Add24Regular />}
              onClick={onAddWhitelistClick}
            >
              Proteger
            </Button>
          </div>
        </div>

        {/* Panel de Presets Configurables */}
        <div className={styles.cardBox}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <MEHTypography variant="h3">Presets de Limpieza</MEHTypography>
            <Button
              size="small"
              appearance="secondary"
              icon={<Save24Regular />}
              onClick={() => setPresetDialogOpen(true)}
            >
              Guardar Selección como Preset
            </Button>
          </div>
          <MEHTypography variant="caption">
            Aplica un preset rápido (incluyendo &ldquo;Dejar solo superadmin&rdquo;) o usa tus presets personalizados.
          </MEHTypography>

          <div className={styles.presetGrid}>
            {presets.map((preset) => (
              <div
                key={preset.id}
                data-testid={`preset-card-${preset.id}`}
                className={`${styles.presetCard} ${
                  activePresetId === preset.id ? styles.presetActive : ''
                }`}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <b>{preset.nombre}</b>
                    <Badge appearance="outline" color={preset.built_in ? 'brand' : 'informative'}>
                      {preset.built_in ? 'Nativo' : 'Custom'}
                    </Badge>
                  </div>
                  <p style={{ fontSize: '12px', opacity: 0.8, margin: '6px 0' }}>{preset.descripcion}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <Button
                    size="small"
                    appearance="primary"
                    data-testid={`apply-preset-${preset.id}`}
                    onClick={() => {
                      void applyPreset(preset.id);
                    }}
                  >
                    Aplicar Preset
                  </Button>
                  {!preset.built_in && (
                    <Button
                      size="small"
                      appearance="subtle"
                      icon={<Delete24Regular />}
                      aria-label={`Eliminar preset ${preset.nombre}`}
                      onClick={() => {
                        void handleDeleteCustomPreset(preset.id);
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Catálogo de Tablas por Grupo */}
      <div className={styles.cardBox}>
        <MEHTypography variant="h3">Catálogo de Tablas del Sistema</MEHTypography>
        <MEHTypography variant="caption">
          Selecciona las tablas que deseas inspeccionar o limpiar. Se muestran conteos activos y clasificación de origen (SEED / REAL / OCR).
        </MEHTypography>

        {Object.entries(GROUP_LABELS).map(([groupKey, groupTitle]) => {
          const groupTables = catalog.filter((t) => t.group === groupKey);
          if (groupTables.length === 0) return null;
          return (
            <div key={groupKey} style={{ marginTop: '12px' }}>
              <MEHTypography variant="bold" style={{ display: 'block', marginBottom: '8px' }}>
                {groupTitle}
              </MEHTypography>
              <div className={styles.catalogGrid}>
                {groupTables.map((tbl) => {
                  const isChecked = selectedTables.includes(tbl.key);
                  const selectedCount = selections[tbl.key]?.length || 0;
                  return (
                    <div
                      key={tbl.key}
                      data-testid={`catalog-table-${tbl.key}`}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: isChecked
                          ? `2px solid ${tokens.colorBrandStroke1}`
                          : `1px solid ${tokens.colorNeutralStroke1}`,
                        backgroundColor: isChecked
                          ? tokens.colorNeutralBackground2
                          : tokens.colorNeutralBackground1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Checkbox
                          label={<b>{tbl.label}</b>}
                          checked={isChecked}
                          onChange={() => toggleTableInScope(tbl.key)}
                        />
                        {selectedCount > 0 && (
                          <Badge appearance="filled" color="brand">
                            {selectedCount} sel.
                          </Badge>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                        <Badge appearance="outline">Total: {tbl.active_count}</Badge>
                        {tbl.seed_count > 0 && (
                          <Badge appearance="tint" color="warning">
                            SEED: {tbl.seed_count}
                          </Badge>
                        )}
                        {tbl.real_count > 0 && (
                          <Badge appearance="tint" color="success">
                            REAL: {tbl.real_count}
                          </Badge>
                        )}
                        {tbl.ocr_count > 0 && (
                          <Badge appearance="tint" color="informative">
                            OCR: {tbl.ocr_count}
                          </Badge>
                        )}
                        {tbl.protected_count > 0 && (
                          <Badge appearance="filled" color="important">
                            Protegidos: {tbl.protected_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.footerNav}>
        <span style={{ fontSize: '13px', opacity: 0.8 }}>
          Tablas en alcance: <b>{selectedTables.length}</b> • Registros marcados: <b>{totalSelectedCount}</b>
        </span>
        <MEHButton
          appearance="primary"
          icon={<ArrowRight24Regular />}
          iconPosition="after"
          data-testid="go-to-step-2"
          onClick={() => {
            if (!activeTable && selectedTables.length > 0) {
              setActiveTable(selectedTables[0]);
            }
            setStep(2);
          }}
        >
          Ir a Selección por Registro
        </MEHButton>
      </div>
    </div>
  );
};

const RowsTableBodyContent = ({
  loadingRows,
  tableRows,
  activeTable,
  selections,
  toggleRowSelection,
}) => {
  if (loadingRows) {
    return (
      <div style={{ padding: '48px', textAlign: 'center' }}>
        <Spinner label="Cargando filas y trazabilidad de origen..." />
      </div>
    );
  }
  if (tableRows.length === 0) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', opacity: 0.7 }}>
        No se encontraron registros activos para los filtros seleccionados.
      </div>
    );
  }
  return (
    <Table size="medium" aria-label={`Registros de ${activeTable}`}>
      <TableHeader>
        <TableRow>
          <TableHeaderCell style={{ width: '48px' }}>Sel.</TableHeaderCell>
          <TableHeaderCell>Registro / ID</TableHeaderCell>
          <TableHeaderCell>Origen</TableHeaderCell>
          <TableHeaderCell>Creador y Fechas</TableHeaderCell>
          <TableHeaderCell>Registro Padre</TableHeaderCell>
          <TableHeaderCell>Protección</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tableRows.map((row) => {
          const isSelected = (selections[activeTable] || []).includes(row.id);
          return (
            <TableRow
              key={`${activeTable}-${row.id}`}
              data-testid={`cleanup-row-${activeTable}-${row.id}`}
              style={{
                opacity: row.protegido ? 0.65 : 1,
                backgroundColor: isSelected ? tokens.colorBrandBackground2 : undefined,
              }}
            >
              <TableCell>
                <Checkbox
                  checked={isSelected}
                  disabled={row.protegido}
                  aria-label={`Seleccionar ${row.titulo}`}
                  onChange={() => toggleRowSelection(activeTable, row)}
                />
              </TableCell>
              <TableCell>
                <div>
                  <b>{row.titulo}</b>
                  <div style={{ fontSize: '12px', opacity: 0.75 }}>
                    ID: #{row.id} {row.subtitulo ? `• ${row.subtitulo}` : ''}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Tooltip content={row.origen_detalle || row.origen} relationship="description">
                  <Badge appearance="filled" color={ORIGIN_COLORS[row.origen] || 'informative'}>
                    {row.origen}
                  </Badge>
                </Tooltip>
              </TableCell>
              <TableCell>
                <div style={{ fontSize: '12px' }}>
                  <div>
                    <b>Creador:</b> {row.creado_por_nombre || 'Sistema'}
                  </div>
                  <div style={{ opacity: 0.75 }}>
                    Creado:{' '}
                    {row.fecha_creacion
                      ? new Date(row.fecha_creacion).toLocaleDateString()
                      : 'N/D'}
                    {row.fecha_modificacion
                      ? ` • Mod: ${new Date(row.fecha_modificacion).toLocaleDateString()}`
                      : ''}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {row.padre ? (
                  <Badge appearance="outline">
                    {row.padre.tabla}: {row.padre.etiqueta}
                  </Badge>
                ) : (
                  <span style={{ fontSize: '12px', opacity: 0.5 }}>Entidad Raíz</span>
                )}
              </TableCell>
              <TableCell>
                {row.protegido ? (
                  <Badge
                    appearance="filled"
                    color="important"
                    icon={<LockClosed24Regular />}
                  >
                    {row.motivo_proteccion || 'PROTEGIDO'}
                  </Badge>
                ) : (
                  <Badge appearance="outline" color="subtle">
                    Elegible
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

const Step2RowSelection = ({
  styles,
  selectedTables,
  catalog,
  selections,
  activeTable,
  setActiveTable,
  tableRows,
  selectAllVisibleRows,
  clearTableSelection,
  rowSearch,
  setRowSearch,
  originFilter,
  setOriginFilter,
  loadingRows,
  toggleRowSelection,
  setStep,
  totalSelectedCount,
  goToStep3Preview,
}) => (
  <div data-testid="cleanup-step-2">
    <div className={styles.cardBox}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <TabList
          selectedValue={activeTable}
          onTabSelect={(e, d) => setActiveTable(d.value)}
          style={{ overflowX: 'auto' }}
        >
          {selectedTables.map((tKey) => {
            const info = catalog.find((c) => c.key === tKey);
            const count = selections[tKey]?.length || 0;
            return (
              <Tab key={tKey} value={tKey} data-testid={`subtab-${tKey}`}>
                {info?.label || tKey}{' '}
                {count > 0 && (
                  <Badge appearance="filled" color="brand" style={{ marginLeft: '6px' }}>
                    {count}
                  </Badge>
                )}
              </Tab>
            );
          })}
        </TabList>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button
            size="small"
            appearance="secondary"
            data-testid="select-all-visible-btn"
            onClick={() => selectAllVisibleRows(activeTable, tableRows)}
          >
            Seleccionar visibles (no protegidos)
          </Button>
          <Button
            size="small"
            appearance="subtle"
            data-testid="clear-table-selection-btn"
            onClick={() => clearTableSelection(activeTable)}
          >
            Limpiar tabla
          </Button>
        </div>
      </div>

      {/* Filtros de Origen y Búsqueda */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginTop: '8px',
        }}
      >
        <Input
          placeholder="Buscar por ID, título, correo, creador o padre..."
          aria-label="Buscar registros en tabla"
          contentBefore={<Search24Regular />}
          value={rowSearch}
          onChange={(e, d) => setRowSearch(d.value)}
          style={{ minWidth: '300px', flex: 1 }}
        />
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', opacity: 0.75 }}>Filtrar origen:</span>
          {['ALL', 'SEED', 'REAL', 'OCR'].map((orig) => (
            <Button
              key={orig}
              size="small"
              appearance={originFilter === orig ? 'primary' : 'secondary'}
              data-testid={`filter-origin-${orig}`}
              onClick={() => setOriginFilter(orig)}
            >
              {orig === 'ALL' ? 'TODOS' : orig}
            </Button>
          ))}
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <RowsTableBodyContent
          loadingRows={loadingRows}
          tableRows={tableRows}
          activeTable={activeTable}
          selections={selections}
          toggleRowSelection={toggleRowSelection}
        />
      </div>
    </div>

    <div className={styles.footerNav}>
      <Button
        appearance="secondary"
        icon={<ArrowLeft24Regular />}
        onClick={() => setStep(1)}
      >
        Volver al Catálogo
      </Button>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span>
          Total seleccionados: <b>{totalSelectedCount}</b> registros
        </span>
        <MEHButton
          appearance="primary"
          icon={<ArrowRight24Regular />}
          iconPosition="after"
          data-testid="go-to-step-3"
          disabled={totalSelectedCount === 0}
          onClick={goToStep3Preview}
        >
          Previsualizar Impacto y Dependencias
        </MEHButton>
      </div>
    </div>
  </div>
);

const Step3PreviewBackup = ({
  styles,
  mode,
  handleModeChange,
  includeDependencies,
  handleDepsChange,
  backupData,
  loadingBackup,
  previewData,
  handleGenerateBackup,
  handleDownloadBackupFile,
  loadingPreview,
  setStep,
}) => (
  <div data-testid="cleanup-step-3">
    <div className={styles.gridTwo}>
      <div className={styles.cardBox}>
        <MEHTypography variant="h3">Modo de Limpieza y Dependencias</MEHTypography>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button
            appearance={mode === 'soft' ? 'primary' : 'secondary'}
            data-testid="mode-soft-btn"
            onClick={() => {
              void handleModeChange('soft');
            }}
          >
            Soft Delete (Por defecto - Restaurable en Papelera)
          </Button>
          <Button
            appearance={mode === 'hard' ? 'primary' : 'secondary'}
            data-testid="mode-hard-btn"
            style={
              mode === 'hard'
                ? { backgroundColor: tokens.colorPaletteRedBackground3, color: '#fff' }
                : {}
            }
            onClick={() => {
              void handleModeChange('hard');
            }}
          >
            Hard Delete (Borrado Físico Definitivo)
          </Button>
        </div>

        <Switch
          checked={includeDependencies}
          onChange={(e, d) => {
            void handleDepsChange(d.checked);
          }}
          label="Incluir registros hijos/dependencias automáticamente en cascada"
        />

        {mode === 'hard' && (
          <div className={styles.dangerBanner} data-testid="hard-delete-warning">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Warning24Regular style={{ color: tokens.colorPaletteRedForeground1 }} />
              <b>ADVERTENCIA DE PELIGRO CRÍTICO (HARD DELETE)</b>
            </div>
            <span style={{ fontSize: '13px' }}>
              El borrado físico destruirá permanentemente los registros de PostgreSQL y NO podrán recuperarse desde la Papelera.
            </span>
          </div>
        )}
      </div>

      {/* Respaldo Previo Obligatorio */}
      <div className={styles.cardBox}>
        <MEHTypography variant="h3">Respaldo Previo Obligatorio (TTL 30 min)</MEHTypography>
        <MEHTypography variant="caption">
          Antes de continuar al paso de confirmación debes generar un respaldo JSON verificable por hash. Se almacena fuera de <code>/static</code>.
        </MEHTypography>

        {backupData ? (
          <div
            data-testid="backup-ready-box"
            style={{
              padding: '12px',
              borderRadius: '10px',
              backgroundColor: tokens.colorNeutralBackground2,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <b>ID: {backupData.backup_id}</b>
              <Badge appearance="filled" color="success">
                Vigente ({backupData.ttl_minutes} min)
              </Badge>
            </div>
            <span style={{ fontSize: '12px', opacity: 0.8 }}>
              Registros respaldados: <b>{backupData.total_records}</b> • Hash:{' '}
              <code>{backupData.selection_hash?.slice(0, 16)}...</code>
            </span>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <Button
                size="small"
                appearance="secondary"
                icon={<ArrowDownload24Regular />}
                data-testid="download-backup-btn"
                onClick={() => {
                  void handleDownloadBackupFile(backupData.backup_id);
                }}
              >
                Descargar Respaldo JSON
              </Button>
              <Button
                size="small"
                appearance="subtle"
                onClick={handleGenerateBackup}
                disabled={loadingBackup}
              >
                Regenerar
              </Button>
            </div>
          </div>
        ) : (
          <Button
            appearance="primary"
            icon={<Save24Regular />}
            data-testid="generate-backup-btn"
            disabled={loadingBackup || !previewData?.can_execute}
            onClick={handleGenerateBackup}
          >
            {loadingBackup ? 'Generando respaldo...' : 'Generar Respaldo Obligatorio'}
          </Button>
        )}
      </div>
    </div>

    {loadingPreview && (
      <div style={{ padding: '48px', textAlign: 'center' }}>
        <Spinner label="Calculando árbol de dependencias y hash de selección..." />
      </div>
    )}

    {!loadingPreview && previewData && (
      <div className={styles.cardBox} data-testid="preview-summary-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <MEHTypography variant="h3">
            Resumen de Impacto ({previewData.total_effective_records} registros a procesar)
          </MEHTypography>
          <Badge appearance="outline" size="medium">
            Verificación: {previewData.selection_hash?.slice(0, 10)}
          </Badge>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Badge appearance="filled" color="warning" size="large">
            Origen SEED: {previewData.origin_summary?.SEED || 0}
          </Badge>
          <Badge appearance="filled" color="success" size="large">
            Origen REAL: {previewData.origin_summary?.REAL || 0}
          </Badge>
          <Badge appearance="filled" color="informative" size="large">
            Origen OCR: {previewData.origin_summary?.OCR || 0}
          </Badge>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
          {previewData.execution_order?.map((tKey, idx) => (
            <Badge key={tKey} appearance="outline" size="large">
              {idx + 1}. {tKey}: {previewData.effective_counts?.[tKey] || 0}
            </Badge>
          ))}
        </div>

        {previewData.blockers?.length > 0 && (
          <div className={styles.dangerBanner} data-testid="preview-blockers">
            <b>Bloqueos detectados ({previewData.blockers.length}):</b>
            {previewData.blockers.map((b) => (
              <div key={`${b.tipo}-${b.tabla || 'sys'}-${b.id || b.mensaje}`} style={{ fontSize: '13px' }}>
                • [{b.tipo}] {b.mensaje}
              </div>
            ))}
          </div>
        )}

        {previewData.dependencies?.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            <MEHTypography variant="bold">
              Dependencias vinculadas ({previewData.dependencies.length}):
            </MEHTypography>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px', maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
              {previewData.dependencies.map((dep) => (
                <div
                  key={`${dep.parent_table}-${dep.parent_id}-${dep.child_table}`}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: tokens.colorNeutralBackground2,
                    fontSize: '13px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>
                    <b>{dep.parent_title}</b> → {dep.child_label}: {dep.message}
                  </span>
                  <Badge
                    appearance="filled"
                    color={DEP_ACTION_COLORS[dep.action] || 'warning'}
                  >
                    {dep.action} ({dep.child_count})
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )}

    <div className={styles.footerNav}>
      <Button
        appearance="secondary"
        icon={<ArrowLeft24Regular />}
        onClick={() => setStep(2)}
      >
        Volver a Selección
      </Button>
      <MEHButton
        appearance="primary"
        icon={<ArrowRight24Regular />}
        iconPosition="after"
        data-testid="go-to-step-4"
        disabled={!previewData?.can_execute || !backupData?.backup_id}
        onClick={() => setStep(4)}
      >
        Continuar a Confirmación de Seguridad
      </MEHButton>
    </div>
  </div>
);

const Step4ConfirmReport = ({
  styles,
  executionReport,
  onGoToTrash,
  navigate,
  handleDownloadBackupFile,
  resetWizard,
  mode,
  previewData,
  backupData,
  executionError,
  motivo,
  setMotivo,
  requiredPhrase,
  confirmationPhrase,
  setConfirmationPhrase,
  currentUser,
  adminPassword,
  setAdminPassword,
  hardDeleteConfirmed,
  setHardDeleteConfirmed,
  setStep,
  isExecuteReady,
  loadingExecute,
  handleExecuteCleanup,
}) => {
  let submitButtonLabel = 'Ejecutar Limpieza Lógica (Enviar a Papelera)';
  if (loadingExecute) {
    submitButtonLabel = 'Ejecutando transacción atómica...';
  } else if (mode === 'hard') {
    submitButtonLabel = 'Ejecutar Borrado Físico Definitivo';
  }

  return (
    <div data-testid="cleanup-step-4">
      {executionReport ? (
        <div className={styles.cardBox} data-testid="cleanup-execution-report">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckmarkCircle24Regular
              style={{ fontSize: '36px', color: tokens.colorPaletteGreenForeground1 }}
            />
            <div>
              <MEHTypography variant="h3">
                Limpieza Ejecutada con Éxito ({executionReport.mode.toUpperCase()})
              </MEHTypography>
              <MEHTypography variant="body">
                Se procesaron <b>{executionReport.total_affected}</b> registros en una transacción atómica verificada.
              </MEHTypography>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
            <Badge appearance="filled" color="success" size="large">
              Log Auditoría #{executionReport.audit_log_id}
            </Badge>
            <Badge appearance="outline" size="large">
              Backup: {executionReport.backup_id}
            </Badge>
            <Badge appearance="outline" size="large">
              Motivo: {executionReport.motivo}
            </Badge>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
            {Object.entries(executionReport.affected_by_table || {}).map(([t, cnt]) => (
              <Badge key={t} appearance="tint" color="brand" size="large">
                {t}: {cnt}
              </Badge>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
            {executionReport.restorable_in_trash && onGoToTrash && (
              <Button
                appearance="primary"
                icon={<DeleteDismiss24Regular />}
                data-testid="report-go-to-trash-btn"
                onClick={onGoToTrash}
              >
                Ver Registros en Papelera
              </Button>
            )}
            <Button
              appearance="secondary"
              icon={<History24Regular />}
              data-testid="report-go-to-audit-btn"
              onClick={() => navigate('/auditoria')}
            >
              Ver Registro en Auditoría
            </Button>
            <Button
              appearance="secondary"
              icon={<ArrowDownload24Regular />}
              onClick={() => {
                void handleDownloadBackupFile(executionReport.backup_id);
              }}
            >
              Descargar Respaldo ({executionReport.backup_id})
            </Button>
            <Button appearance="subtle" onClick={resetWizard}>
              Nueva Operación de Limpieza
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={mode === 'hard' ? styles.dangerBanner : styles.cardBox}
          data-testid="cleanup-confirmation-form"
        >
          <MEHTypography variant="h3">
            Confirmación de Seguridad Obligatoria ({mode === 'hard' ? 'HARD DELETE' : 'SOFT DELETE'})
          </MEHTypography>
          <MEHTypography variant="body">
            Se afectarán <b>{previewData?.total_effective_records || 0}</b> registros con respaldo verificado{' '}
            <code>{backupData?.backup_id}</code>. Si ocurre cualquier error, se aplicará rollback total.
          </MEHTypography>

          {executionError && (
            <div
              className={styles.dangerBanner}
              role="alert"
              data-testid="cleanup-execution-error"
            >
              <b>Error de ejecución:</b> {executionError}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
            <div>
              <label
                htmlFor="cleanup-motivo-field"
                style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}
              >
                1. Motivo de la operación (obligatorio, mín. 5 caracteres)
              </label>
              <Input
                id="cleanup-motivo-field"
                placeholder="Ej: Depuración de datos de demostración previos al lanzamiento..."
                aria-label="Motivo de la limpieza"
                data-testid="cleanup-motivo-input"
                value={motivo}
                onChange={(e, d) => setMotivo(d.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label
                htmlFor="cleanup-phrase-field"
                style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}
              >
                2. Escribe exactamente la frase de seguridad: <code>{requiredPhrase}</code>
              </label>
              <Input
                id="cleanup-phrase-field"
                placeholder={requiredPhrase}
                aria-label="Frase de confirmación"
                data-testid="cleanup-phrase-input"
                value={confirmationPhrase}
                onChange={(e, d) => setConfirmationPhrase(d.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label
                htmlFor="cleanup-password-field"
                style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}
              >
                3. Contraseña de tu cuenta de Administrador ({currentUser?.correo})
              </label>
              <Input
                id="cleanup-password-field"
                type="password"
                placeholder="Ingresa tu contraseña actual..."
                aria-label="Contraseña del administrador"
                data-testid="cleanup-password-input"
                value={adminPassword}
                onChange={(e, d) => setAdminPassword(d.value)}
                style={{ width: '100%' }}
              />
            </div>

            {mode === 'hard' && (
              <Checkbox
                data-testid="cleanup-hard-extra-checkbox"
                checked={hardDeleteConfirmed}
                onChange={(e, d) => setHardDeleteConfirmed(d.checked)}
                label="Confirmo que este borrado físico (Hard Delete) es irreversible y los registros no podrán restaurarse desde la papelera."
              />
            )}
          </div>

          <div className={styles.footerNav}>
            <Button
              appearance="secondary"
              icon={<ArrowLeft24Regular />}
              onClick={() => setStep(3)}
            >
              Volver al Preview
            </Button>
            <Button
              appearance="primary"
              data-testid="execute-cleanup-submit-btn"
              disabled={!isExecuteReady || loadingExecute}
              style={{
                backgroundColor:
                  mode === 'hard'
                    ? tokens.colorPaletteRedBackground3
                    : tokens.colorBrandBackground,
                color: '#fff',
              }}
              onClick={handleExecuteCleanup}
            >
              {submitButtonLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const CleanupTab = ({ currentUser, notify, onGoToTrash }) => {
  const styles = useStyles();
  const navigate = useNavigate();

  const [newWhitelistEmail, setNewWhitelistEmail] = useState('');
  const [presetDialogOpen, setPresetDialogOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDesc, setNewPresetDesc] = useState('');

  const {
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
    activeTable,
    setActiveTable,
    tableRows,
    rowSearch,
    setRowSearch,
    originFilter,
    setOriginFilter,
    selections,
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
  } = useCleanupManager({ notify, isAdmin: currentUser?.rol === 'ADMIN' });

  if (currentUser?.rol !== 'ADMIN') {
    return (
      <div className={styles.dangerBanner} data-testid="cleanup-forbidden">
        <MEHTypography variant="h3">Acceso Restringido</MEHTypography>
        <MEHTypography variant="body">
          Esta herramienta de limpieza selectiva de datos es exclusiva para Administradores (ADMIN).
        </MEHTypography>
      </div>
    );
  }

  if (!statusConfig.enabled) {
    return (
      <div className={styles.dangerBanner} data-testid="cleanup-disabled">
        <MEHTypography variant="h3">Módulo Deshabilitado</MEHTypography>
        <MEHTypography variant="body">
          La limpieza selectiva de datos se encuentra desactivada por configuración (ENABLE_DATA_CLEANUP=false).
        </MEHTypography>
      </div>
    );
  }

  const goToStep3Preview = async () => {
    setStep(3);
    await runPreview(mode, includeDependencies);
  };

  const handleModeChange = async (newMode) => {
    setMode(newMode);
    setHardDeleteConfirmed(false);
    setConfirmationPhrase('');
    if (step === 3) {
      await runPreview(newMode, includeDependencies);
    }
  };

  const handleDepsChange = async (checked) => {
    setIncludeDependencies(checked);
    if (step === 3) {
      await runPreview(mode, checked);
    }
  };

  const requiredPhrase =
    mode === 'hard'
      ? statusConfig.hard_delete_phrase || 'BORRADO DEFINITIVO'
      : statusConfig.soft_delete_phrase || 'ELIMINAR DATOS';

  const isPhraseMatch = confirmationPhrase.trim().toUpperCase() === requiredPhrase;
  const isExecuteReady = Boolean(
    previewData?.can_execute &&
      backupData?.backup_id &&
      backupData?.selection_hash === previewData?.selection_hash &&
      motivo.trim().length >= 5 &&
      isPhraseMatch &&
      adminPassword.length > 0 &&
      (mode !== 'hard' || hardDeleteConfirmed)
  );

  return (
    <div data-testid="cleanup-tab-root">
      {/* Encabezado Principal */}
      <div className={styles.banner}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: '1 1 280px' }}>
          <Database24Regular style={{ fontSize: '32px', flexShrink: 0, color: tokens.colorBrandForeground1 }} />
          <div>
            <MEHTypography variant="h3" style={{ fontWeight: 'bold', margin: 0 }}>
              Limpieza Selectiva de Datos
            </MEHTypography>
            <MEHTypography variant="caption" style={{ opacity: 0.8 }}>
              Elige un preset o tablas, genera el respaldo previo y confirma la limpieza.
            </MEHTypography>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Badge appearance="filled" color={mode === 'hard' ? 'danger' : 'informative'} size="large">
            {mode === 'hard' ? 'Modo: Borrado Físico' : 'Modo: Enviar a Papelera'}
          </Badge>
          <Badge appearance="tint" color="brand" size="large">
            Seleccionados: {totalSelectedCount}
          </Badge>
        </div>
      </div>

      {/* Barra de 4 Pasos con alto contraste */}
      <div className={styles.stepBar} role="tablist" aria-label="Pasos de limpieza de datos">
        <button
          type="button"
          data-testid="cleanup-step-1-btn"
          className={`${styles.stepButton} ${step === 1 ? styles.stepActive : ''}`}
          onClick={() => setStep(1)}
        >
          <span className={`${styles.stepBadge} ${step === 1 ? styles.stepBadgeActive : ''}`}>1</span>
          <span>Alcance y Presets</span>
        </button>
        <button
          type="button"
          data-testid="cleanup-step-2-btn"
          className={`${styles.stepButton} ${step === 2 ? styles.stepActive : ''}`}
          onClick={() => setStep(2)}
        >
          <span className={`${styles.stepBadge} ${step === 2 ? styles.stepBadgeActive : ''}`}>2</span>
          <span>Registros ({totalSelectedCount})</span>
        </button>
        <button
          type="button"
          data-testid="cleanup-step-3-btn"
          className={`${styles.stepButton} ${step === 3 ? styles.stepActive : ''}`}
          onClick={goToStep3Preview}
        >
          <span className={`${styles.stepBadge} ${step === 3 ? styles.stepBadgeActive : ''}`}>3</span>
          <span>Preview y Respaldo</span>
        </button>
        <button
          type="button"
          data-testid="cleanup-step-4-btn"
          className={`${styles.stepButton} ${step === 4 ? styles.stepActive : ''}`}
          disabled={!previewData?.can_execute || !backupData?.backup_id}
          onClick={() => setStep(4)}
        >
          <span className={`${styles.stepBadge} ${step === 4 ? styles.stepBadgeActive : ''}`}>4</span>
          <span>Confirmar y Ejecutar</span>
        </button>
      </div>

      {loadingInit ? (
        <div style={{ padding: '60px', textAlign: 'center' }}>
          <Spinner label="Analizando catálogo, orígenes y cuentas protegidas..." />
        </div>
      ) : (
        <>
          {step === 1 && (
            <Step1CatalogPresets
              styles={styles}
              protectedConfig={protectedConfig}
              newWhitelistEmail={newWhitelistEmail}
              setNewWhitelistEmail={setNewWhitelistEmail}
              handleAddWhitelistEmail={handleAddWhitelistEmail}
              handleRemoveWhitelistEmail={handleRemoveWhitelistEmail}
              presets={presets}
              activePresetId={activePresetId}
              applyPreset={applyPreset}
              handleDeleteCustomPreset={handleDeleteCustomPreset}
              setPresetDialogOpen={setPresetDialogOpen}
              catalog={catalog}
              selectedTables={selectedTables}
              selections={selections}
              toggleTableInScope={toggleTableInScope}
              totalSelectedCount={totalSelectedCount}
              activeTable={activeTable}
              setActiveTable={setActiveTable}
              setStep={setStep}
            />
          )}

          {step === 2 && (
            <Step2RowSelection
              styles={styles}
              selectedTables={selectedTables}
              catalog={catalog}
              selections={selections}
              activeTable={activeTable}
              setActiveTable={setActiveTable}
              tableRows={tableRows}
              selectAllVisibleRows={selectAllVisibleRows}
              clearTableSelection={clearTableSelection}
              rowSearch={rowSearch}
              setRowSearch={setRowSearch}
              originFilter={originFilter}
              setOriginFilter={setOriginFilter}
              loadingRows={loadingRows}
              toggleRowSelection={toggleRowSelection}
              setStep={setStep}
              totalSelectedCount={totalSelectedCount}
              goToStep3Preview={goToStep3Preview}
            />
          )}

          {step === 3 && (
            <Step3PreviewBackup
              styles={styles}
              mode={mode}
              handleModeChange={handleModeChange}
              includeDependencies={includeDependencies}
              handleDepsChange={handleDepsChange}
              backupData={backupData}
              loadingBackup={loadingBackup}
              previewData={previewData}
              handleGenerateBackup={handleGenerateBackup}
              handleDownloadBackupFile={handleDownloadBackupFile}
              loadingPreview={loadingPreview}
              setStep={setStep}
            />
          )}

          {step === 4 && (
            <Step4ConfirmReport
              styles={styles}
              executionReport={executionReport}
              onGoToTrash={onGoToTrash}
              navigate={navigate}
              handleDownloadBackupFile={handleDownloadBackupFile}
              resetWizard={resetWizard}
              mode={mode}
              previewData={previewData}
              backupData={backupData}
              executionError={executionError}
              motivo={motivo}
              setMotivo={setMotivo}
              requiredPhrase={requiredPhrase}
              confirmationPhrase={confirmationPhrase}
              setConfirmationPhrase={setConfirmationPhrase}
              currentUser={currentUser}
              adminPassword={adminPassword}
              setAdminPassword={setAdminPassword}
              hardDeleteConfirmed={hardDeleteConfirmed}
              setHardDeleteConfirmed={setHardDeleteConfirmed}
              setStep={setStep}
              isExecuteReady={isExecuteReady}
              loadingExecute={loadingExecute}
              handleExecuteCleanup={handleExecuteCleanup}
            />
          )}
        </>
      )}

      {/* Diálogo para Guardar Preset Personalizado */}
      <Dialog open={presetDialogOpen} onOpenChange={(e, d) => setPresetDialogOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Guardar Preset Personalizado</DialogTitle>
            <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Input
                placeholder="Nombre del preset (ej. Limpiar eventos demo)"
                aria-label="Nombre del preset"
                value={newPresetName}
                onChange={(e, d) => setNewPresetName(d.value)}
              />
              <Input
                placeholder="Descripción opcional..."
                aria-label="Descripción del preset"
                value={newPresetDesc}
                onChange={(e, d) => setNewPresetDesc(d.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setPresetDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                appearance="primary"
                disabled={newPresetName.trim().length < 2}
                onClick={async () => {
                  await handleSaveCustomPreset({
                    nombre: newPresetName,
                    descripcion: newPresetDesc,
                    origen_filter: originFilter,
                  });
                  setNewPresetName('');
                  setNewPresetDesc('');
                  setPresetDialogOpen(false);
                }}
              >
                Guardar Preset
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};

export default CleanupTab;

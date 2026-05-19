import React, { useEffect, useState } from 'react';
import { 
  makeStyles, 
  shorthands, 
  tokens, 
  DataGrid,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridBody,
  DataGridRow,
  DataGridCell,
  createTableColumn,
  Spinner,
  Badge,
  Drawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
  Button,
  TabList,
  Tab,
  Input,
  Divider,
  Avatar
} from '@fluentui/react-components';
import { 
  ShieldLock24Filled, 
  Dismiss24Regular, 
  Eye24Regular, 
  Search24Regular,
  ArrowRight24Regular,
  AddCircle24Regular,
  Delete24Regular,
  Edit24Regular,
  Image24Regular
} from '@fluentui/react-icons';
import api, { resolveApiFileUrl } from '../services/api';
import { MEHCard, MEHTypography } from '../components/ui';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    animationName: {
      from: { opacity: 0, transform: 'translateY(10px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    animationDuration: '0.5s',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  tableCard: {
    ...shorthands.padding('0'),
    overflow: 'hidden',
  },
  filtersContainer: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-end',
    marginBottom: '16px',
    flexWrap: 'wrap'
  },
  diffContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '10px'
  },
  diffItem: {
    ...shorthands.padding('12px'),
    ...shorthands.borderRadius('8px'),
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  diffHeader: {
    fontWeight: 'bold',
    fontSize: '11px',
    color: tokens.colorNeutralForeground4,
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  changeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  oldValue: {
    color: tokens.colorPaletteRedForeground1,
    textDecorationLine: 'line-through',
    opacity: 0.8,
    fontSize: '13px'
  },
  newValue: {
    color: tokens.colorPaletteGreenForeground1,
    fontWeight: 'bold',
    fontSize: '13px'
  },
  valueDisplay: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
  }
});

// Componente inteligente para mostrar valores o imágenes
const ValuePresenter = ({ value, isOld = false }) => {
    const styles = useStyles();
    if (!value) return <span className={isOld ? styles.oldValue : styles.newValue}>Nulo</span>;

    // Detectar si el valor es una URL de imagen
    const isImage = typeof value === 'string' && (value.includes('/static/uploads/') || value.startsWith('http'));

    if (isImage) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                <Avatar 
                    size={48} 
                    image={{ src: resolveApiFileUrl(value) }} 
                    style={{ border: `2px solid ${isOld ? tokens.colorPaletteRedBorder1 : tokens.colorPaletteGreenBorder1}` }}
                />
                <code style={{ fontSize: '10px', opacity: 0.5 }}>{value.split('/').pop()}</code>
            </div>
        );
    }

    return <span className={isOld ? styles.oldValue : styles.newValue}>{String(value)}</span>;
};

const DiffViewer = ({ oldVal, newVal }) => {
    const styles = useStyles();
    
    if (newVal && !oldVal) {
        return (
            <div className={styles.diffContainer}>
                <Badge icon={<AddCircle24Regular />} color="success" appearance="tint">NUEVO REGISTRO</Badge>
                <div className={styles.diffItem}>
                    {Object.entries(newVal).map(([key, val]) => (
                        <div key={key} style={{ marginBottom: '8px' }}>
                            <span className={styles.diffHeader}>{key.replace(/_/g, ' ')}</span>
                            <div className={styles.valueDisplay}>
                                <ValuePresenter value={val} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (oldVal && newVal && typeof oldVal === 'object' && typeof newVal === 'object') {
        const allKeys = Array.from(new Set([...Object.keys(oldVal), ...Object.keys(newVal)]));
        
        return (
            <div className={styles.diffContainer}>
                <Badge icon={<Edit24Regular />} color="warning" appearance="tint">CAMBIOS DETECTADOS</Badge>
                {allKeys.map(key => {
                    const changed = JSON.stringify(oldVal[key]) !== JSON.stringify(newVal[key]);
                    if (!changed) return null;

                    return (
                        <div key={key} className={styles.diffItem}>
                            <span className={styles.diffHeader}>{key.replace(/_/g, ' ')}</span>
                            <div className={styles.changeRow}>
                                <ValuePresenter value={oldVal[key]} isOld={true} />
                                <ArrowRight24Regular style={{ opacity: 0.3 }} />
                                <ValuePresenter value={newVal[key]} />
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className={styles.diffItem}>
            <pre style={{ fontSize: '11px' }}>{JSON.stringify(newVal || oldVal, null, 2)}</pre>
        </div>
    );
};

const Auditoria = () => {
  const styles = useStyles();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const [filters, setFilters] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    accion: ''
  });

  useEffect(() => {
    fetchLogs();
  }, [filters, activeTab]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeTab === 'detalle') {
          if (filters.fecha_inicio) params.fecha_inicio = new Date(filters.fecha_inicio).toISOString();
          if (filters.fecha_fin) {
              const fin = new Date(filters.fecha_fin);
              fin.setHours(23, 59, 59, 999);
              params.fecha_fin = fin.toISOString();
          }
          if (filters.accion) params.accion = filters.accion;
      }
      
      const response = await api.get('/logs/', { params });
      setLogs(response.data);
    } catch (err) {
      console.error("Error al cargar logs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const openDetails = (log) => {
    setSelectedLog(log);
    setIsDrawerOpen(true);
  };

  const columns = [
    createTableColumn({
      columnId: 'fecha',
      renderHeaderCell: () => 'Fecha/Hora',
      renderCell: (item) => new Date(item.fecha).toLocaleString(),
    }),
    createTableColumn({
      columnId: 'admin',
      renderHeaderCell: () => 'Ejecutado por',
      renderCell: (item) => <MEHTypography variant="caption" style={{fontWeight: 'bold'}}>{item.admin_name}</MEHTypography>,
    }),
    createTableColumn({
        columnId: 'accion',
        renderHeaderCell: () => 'Acción',
        renderCell: (item) => (
          <Badge appearance="outline" color={item.accion.includes('CREAR') ? 'success' : item.accion.includes('BORRAR') ? 'danger' : 'informative'}>
            {item.accion}
          </Badge>
        ),
      }),
    createTableColumn({
      columnId: 'tabla',
      renderHeaderCell: () => 'Tabla',
      renderCell: (item) => <code style={{ fontSize: '11px' }}>{item.tabla_afectada}</code>,
    }),
    createTableColumn({
      columnId: 'detalles',
      renderHeaderCell: () => 'Detalles',
      renderCell: (item) => (
        <Button icon={<Eye24Regular />} appearance="subtle" onClick={() => openDetails(item)}>Analizar</Button>
      ),
    }),
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <ShieldLock24Filled style={{ color: tokens.colorBrandForeground1, fontSize: '32px' }} />
        <MEHTypography variant="h1">Centro de Auditoría Suprema</MEHTypography>
      </div>
      
      <MEHTypography variant="body" style={{ opacity: 0.6, display: 'block' }}>
        Trazabilidad total de cambios críticos. Registros inmutables del sistema MEH.
      </MEHTypography>

      <TabList selectedValue={activeTab} onTabSelect={(_, data) => setActiveTab(data.value)} style={{ marginBottom: '16px' }}>
          <Tab value="general">Visión General</Tab>
          <Tab value="detalle">Filtros Avanzados</Tab>
      </TabList>

      {activeTab === 'detalle' && (
          <MEHCard style={{ marginBottom: '16px' }}>
              <MEHTypography variant="h3" style={{ marginBottom: '16px' }}>Búsqueda en Historial</MEHTypography>
              <div className={styles.filtersContainer}>
                  <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', opacity: 0.7 }}>Desde</label>
                      <Input type="date" value={filters.fecha_inicio} onChange={(e) => handleFilterChange('fecha_inicio', e.target.value)} />
                  </div>
                  <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', opacity: 0.7 }}>Hasta</label>
                      <Input type="date" value={filters.fecha_fin} onChange={(e) => handleFilterChange('fecha_fin', e.target.value)} />
                  </div>
                  <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', opacity: 0.7 }}>Acción específica</label>
                      <Input type="text" placeholder="Ej: PAGO, ROL..." value={filters.accion} onChange={(e) => handleFilterChange('accion', e.target.value)} contentBefore={<Search24Regular />} />
                  </div>
                  <Button appearance="secondary" onClick={() => setFilters({fecha_inicio: '', fecha_fin: '', accion: ''})}>Reset</Button>
              </div>
          </MEHCard>
      )}

      <MEHCard className={styles.tableCard}>
        {loading ? (
          <div style={{ padding: '100px', textAlign: 'center' }}>
            <Spinner label="Recuperando registros inmutables..." />
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '100px', textAlign: 'center', opacity: 0.5 }}>
            <ShieldLock24Filled style={{ fontSize: '48px', marginBottom: '16px' }} />
            <MEHTypography variant="h3">No se encontraron logs</MEHTypography>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <DataGrid items={logs} columns={columns}>
              <DataGridHeader>
                <DataGridRow>
                  {({ renderHeaderCell }) => (
                    <DataGridHeaderCell style={{ fontWeight: 'bold', color: tokens.colorBrandForeground1 }}>
                      {renderHeaderCell()}
                    </DataGridHeaderCell>
                  )}
                </DataGridRow>
              </DataGridHeader>
              <DataGridBody>
                {({ item, rowId }) => (
                  <DataGridRow key={rowId}>
                    {({ renderCell }) => (
                      <DataGridCell>{renderCell(item)}</DataGridCell>
                    )}
                  </DataGridRow>
                )}
              </DataGridBody>
            </DataGrid>
          </div>
        )}
      </MEHCard>

      <Drawer 
          open={isDrawerOpen} 
          onOpenChange={(_, { open }) => setIsDrawerOpen(open)}
          position="end"
          size="medium"
      >
          <DrawerHeader>
              <DrawerHeaderTitle 
                  action={<Button appearance="subtle" icon={<Dismiss24Regular />} onClick={() => setIsDrawerOpen(false)} />}
              >
                  Análisis del Registro #{selectedLog?.id_log}
              </DrawerHeaderTitle>
          </DrawerHeader>
          <DrawerBody>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ backgroundColor: tokens.colorNeutralBackground3, ...shorthands.padding('16px'), ...shorthands.borderRadius('12px') }}>
                    <MEHTypography variant="caption" style={{ fontWeight: 'bold', opacity: 0.6 }}>CONTEXTO DE LA OPERACIÓN</MEHTypography>
                    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div>
                            <span style={{ opacity: 0.6, fontSize: '12px' }}>Acción: </span>
                            <span style={{ fontWeight: 'bold' }}>{selectedLog?.accion}</span>
                        </div>
                        <div>
                            <span style={{ opacity: 0.6, fontSize: '12px' }}>IP Origen: </span>
                            <code style={{ fontSize: '12px' }}>{selectedLog?.ip_direccion || 'No registrada'}</code>
                        </div>
                        <div>
                            <span style={{ opacity: 0.6, fontSize: '12px' }}>ID Afectado: </span>
                            <Badge appearance="tint">{selectedLog?.id_registro_afectado}</Badge>
                        </div>
                    </div>
                  </div>

                  <Divider />

                  <div>
                      <MEHTypography variant="h3" style={{ marginBottom: '12px' }}>Desglose de Cambios</MEHTypography>
                      <DiffViewer 
                        oldVal={selectedLog?.valor_anterior} 
                        newVal={selectedLog?.valor_nuevo} 
                      />
                  </div>
              </div>
          </DrawerBody>
      </Drawer>
    </div>
  );
};

export default Auditoria;

import React, { useEffect, useState, useCallback } from 'react';
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
  Input
} from '@fluentui/react-components';
import { ShieldLock24Filled, Dismiss24Regular, Eye24Regular, Search24Regular } from '@fluentui/react-icons';
import api from '../services/api';
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
  jsonBlock: {
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.padding('16px'),
    ...shorthands.borderRadius('8px'),
    fontFamily: 'monospace',
    fontSize: '12px',
    whiteSpace: 'pre-wrap',
    overflowX: 'auto',
    marginTop: '8px'
  },
  filtersContainer: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-end',
    marginBottom: '16px',
    flexWrap: 'wrap'
  }
});

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
      renderCell: (item) => item.tabla_afectada,
    }),
    createTableColumn({
      columnId: 'detalles',
      renderHeaderCell: () => 'Detalles',
      renderCell: (item) => (
        <Button icon={<Eye24Regular />} appearance="subtle" onClick={() => openDetails(item)}>Ver</Button>
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
        Rastreo de cambios críticos. Únicamente accesible por el rol de Administrador Global.
      </MEHTypography>

      <TabList selectedValue={activeTab} onTabSelect={(_, data) => setActiveTab(data.value)} style={{ marginBottom: '16px' }}>
          <Tab value="general">Visión General</Tab>
          <Tab value="detalle">Ver a detalle</Tab>
      </TabList>

      {activeTab === 'detalle' && (
          <MEHCard style={{ marginBottom: '16px' }}>
              <MEHTypography variant="h3" style={{ marginBottom: '16px' }}>Filtros de Búsqueda Avanzada</MEHTypography>
              <div className={styles.filtersContainer}>
                  <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', opacity: 0.7 }}>Fecha Inicio</label>
                      <Input type="date" value={filters.fecha_inicio} onChange={(e) => handleFilterChange('fecha_inicio', e.target.value)} />
                  </div>
                  <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', opacity: 0.7 }}>Fecha Fin</label>
                      <Input type="date" value={filters.fecha_fin} onChange={(e) => handleFilterChange('fecha_fin', e.target.value)} />
                  </div>
                  <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', opacity: 0.7 }}>Acción / Evento (ej. PAGO, ASISTENCIA)</label>
                      <Input type="text" placeholder="Buscar acción..." value={filters.accion} onChange={(e) => handleFilterChange('accion', e.target.value)} contentBefore={<Search24Regular />} />
                  </div>
                  <Button appearance="secondary" onClick={() => setFilters({fecha_inicio: '', fecha_fin: '', accion: ''})}>Limpiar Filtros</Button>
              </div>
          </MEHCard>
      )}

      <MEHCard className={styles.tableCard}>
        {loading ? (
          <div style={{ padding: '100px', textAlign: 'center' }}>
            <Spinner label="Analizando registros..." />
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '100px', textAlign: 'center', opacity: 0.5 }}>
            <ShieldLock24Filled style={{ fontSize: '48px', marginBottom: '16px' }} />
            <MEHTypography variant="h3">No se encontraron registros</MEHTypography>
            <MEHTypography variant="body" style={{ display: 'block', marginTop: '8px' }}>Prueba ajustando los filtros de búsqueda.</MEHTypography>
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
                  Detalle del Log #{selectedLog?.id_log}
              </DrawerHeaderTitle>
          </DrawerHeader>
          <DrawerBody>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                      <MEHTypography variant="caption" style={{ fontWeight: 'bold', opacity: 0.6 }}>ACCIÓN REALIZADA</MEHTypography>
                      <MEHTypography variant="h3" style={{ display: 'block' }}>{selectedLog?.accion}</MEHTypography>
                  </div>
                  <div>
                      <MEHTypography variant="caption" style={{ fontWeight: 'bold', opacity: 0.6 }}>DIRECCIÓN IP ORIGEN</MEHTypography>
                      <MEHTypography variant="body" style={{ display: 'block', fontFamily: 'monospace' }}>{selectedLog?.ip_direccion || 'Desconocida'}</MEHTypography>
                  </div>
                  
                  {selectedLog?.valor_anterior && (
                      <div>
                          <MEHTypography variant="caption" style={{ fontWeight: 'bold', color: tokens.colorPaletteRedForeground1 }}>VALOR ANTERIOR</MEHTypography>
                          <div className={styles.jsonBlock}>{JSON.stringify(selectedLog.valor_anterior, null, 2)}</div>
                      </div>
                  )}

                  {selectedLog?.valor_nuevo && (
                      <div>
                          <MEHTypography variant="caption" style={{ fontWeight: 'bold', color: tokens.colorPaletteGreenForeground1 }}>VALOR NUEVO</MEHTypography>
                          <div className={styles.jsonBlock}>{JSON.stringify(selectedLog.valor_nuevo, null, 2)}</div>
                      </div>
                  )}
              </div>
          </DrawerBody>
      </Drawer>
    </div>
  );
};

export default Auditoria;

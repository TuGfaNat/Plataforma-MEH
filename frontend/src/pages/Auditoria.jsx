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
  Button
} from '@fluentui/react-components';
import { ShieldLock24Filled, Dismiss24Regular, Eye24Regular } from '@fluentui/react-icons';
import api from '../services/api';
import MainLayout from '../components/layout/MainLayout';
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
  }
});

const Auditoria = () => {
  const styles = useStyles();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/logs/');
      setLogs(response.data);
    } catch (err) {
      console.error("Error al cargar logs", err);
    } finally {
      setLoading(false);
    }
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
    <MainLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <ShieldLock24Filled style={{ color: tokens.colorBrandForeground1, fontSize: '32px' }} />
          <MEHTypography variant="h1">Centro de Auditoría Suprema</MEHTypography>
        </div>
        
        <MEHTypography variant="body" style={{ opacity: 0.6, marginBottom: '16px', display: 'block' }}>
          Rastreo de cambios críticos. Únicamente accesible por el rol de Administrador Global.
        </MEHTypography>

        <MEHCard className={styles.tableCard}>
          {loading ? (
            <div style={{ padding: '100px', textAlign: 'center' }}>
              <Spinner label="Analizando registros..." />
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
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
    </MainLayout>
  );
};

export default Auditoria;

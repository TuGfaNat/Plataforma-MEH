import React, { useEffect, useState } from 'react';
import { 
  makeStyles, 
  shorthands, 
  tokens, 
  Card,
  DataGrid,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridBody,
  DataGridRow,
  DataGridCell,
  createTableColumn,
  Spinner,
  Badge
} from '@fluentui/react-components';
import { ShieldLock24Filled } from '@fluentui/react-icons';
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
  }
});

const columns = [
  createTableColumn({
    columnId: 'fecha',
    compare: (a, b) => new Date(a.fecha) - new Date(b.fecha),
    renderHeaderCell: () => 'Fecha',
    renderCell: (item) => new Date(item.fecha).toLocaleString(),
  }),
  createTableColumn({
    columnId: 'accion',
    renderHeaderCell: () => 'Acción',
    renderCell: (item) => (
      <Badge appearance="outline" color={item.accion.includes('CREAR') ? 'success' : 'informative'}>
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
    columnId: 'ip',
    renderHeaderCell: () => 'IP Direccion',
    renderCell: (item) => (
      <code style={{ color: tokens.colorBrandForeground1, fontSize: '12px' }}>{item.ip_direccion}</code>
    ),
  }),
];

const Auditoria = () => {
  const styles = useStyles();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchLogs();
  }, []);

  return (
    <MainLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <ShieldLock24Filled style={{ color: tokens.colorBrandForeground1, fontSize: '32px' }} />
          <MEHTypography variant="h1">Logs de Auditoría</MEHTypography>
        </div>
        
        <MEHTypography variant="body" style={{ opacity: 0.6, marginBottom: '16px', display: 'block' }}>
          Historial completo de acciones realizadas en el sistema. Crucial para el control de seguridad y transparencia.
        </MEHTypography>

        <MEHCard className={styles.tableCard}>
          {loading ? (
            <div style={{ padding: '100px', textAlign: 'center' }}>
              <Spinner label="Analizando registros de seguridad..." />
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
      </div>
    </MainLayout>
  );
};

export default Auditoria;

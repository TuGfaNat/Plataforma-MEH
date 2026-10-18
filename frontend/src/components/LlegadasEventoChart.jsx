import React, { useState, useEffect } from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Spinner,
  ProgressBar,
  Badge,
  Button,
} from '@fluentui/react-components';
import {
  DataTrending24Regular,
  ArrowClockwise24Regular,
  Location24Regular,
  Clock24Regular,
  People24Regular,
} from '@fluentui/react-icons';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { MEHTypography } from './ui';
import eventoService from '../services/eventoService';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.padding('20px'),
    ...shorthands.borderRadius('14px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3),
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    ...shorthands.padding('12px', '16px'),
    ...shorthands.borderRadius('10px'),
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3),
  },
  chartContainer: {
    width: '100%',
    height: '280px',
    marginTop: '10px',
  },
  checkpointsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '12px',
    marginTop: '8px',
  },
  checkpointCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    ...shorthands.padding('12px', '14px'),
    ...shorthands.borderRadius('10px'),
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3),
  },
  emptyState: {
    textAlign: 'center',
    padding: '30px 16px',
    opacity: 0.65,
  },
});

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: '#18181b',
          border: '1px solid #3f3f46',
          borderRadius: '8px',
          padding: '10px 14px',
          color: '#ffffff',
          fontSize: '12px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#c084fc' }}>
          Hora: {label}
        </div>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', margin: '2px 0' }}>
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <strong>{entry.value}</strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const LlegadasEventoChart = ({ eventoId, eventoTitulo = '' }) => {
  const styles = useStyles();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchLlegadas = async () => {
    if (!eventoId) return;
    setLoading(true);
    try {
      const res = await eventoService.getLlegadas(eventoId);
      setData(res);
    } catch (err) {
      console.error('Error al obtener llegadas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventoId) {
      void fetchLlegadas();
    }
  }, [eventoId]);

  if (loading && !data) {
    return (
      <div className={styles.container} style={{ textAlign: 'center', padding: '40px' }}>
        <Spinner label="Cargando histograma de llegadas y métricas de checkpoints..." />
      </div>
    );
  }

  const histograma = data?.histograma_horas || [];
  const checkpoints = data?.checkpoints || [];
  const totalAsistieron = data?.total_asistieron || 0;
  const totalInscritos = data?.total_inscritos || 0;
  const porcentaje = data?.porcentaje_asistencia || 0;

  // Encontrar hora pico
  let horaPico = 'N/A';
  let maxLlegadas = 0;
  histograma.forEach((h) => {
    if (h.cantidad > maxLlegadas) {
      maxLlegadas = h.cantidad;
      horaPico = `${h.hora} (${h.cantidad} llegadas)`;
    }
  });

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <MEHTypography variant="h3" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DataTrending24Regular style={{ color: tokens.colorBrandForeground1 }} />
            Métricas de Llegadas y Flujo por Hora
          </MEHTypography>
          {eventoTitulo && (
            <MEHTypography variant="caption" style={{ opacity: 0.7 }}>
              {eventoTitulo}
            </MEHTypography>
          )}
        </div>
        <Button
          size="small"
          appearance="subtle"
          icon={<ArrowClockwise24Regular />}
          onClick={fetchLlegadas}
          disabled={loading}
        >
          Actualizar
        </Button>
      </div>

      {/* TARJETAS KPI */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <MEHTypography variant="caption" style={{ opacity: 0.7 }}>
            <People24Regular style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            Asistencia en Vivo
          </MEHTypography>
          <MEHTypography variant="h2" style={{ color: tokens.colorPaletteGreenForeground1 }}>
            {totalAsistieron} / {totalInscritos}
          </MEHTypography>
          <MEHTypography variant="caption" style={{ opacity: 0.8 }}>
            {porcentaje}% de confirmados
          </MEHTypography>
        </div>

        <div className={styles.statCard}>
          <MEHTypography variant="caption" style={{ opacity: 0.7 }}>
            <Clock24Regular style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            Hora Pico de Ingreso
          </MEHTypography>
          <MEHTypography variant="h3" style={{ color: tokens.colorBrandForeground1 }}>
            {horaPico}
          </MEHTypography>
          <MEHTypography variant="caption" style={{ opacity: 0.8 }}>
            Mayor afluencia registrada
          </MEHTypography>
        </div>

        <div className={styles.statCard}>
          <MEHTypography variant="caption" style={{ opacity: 0.7 }}>
            <Location24Regular style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            Puntos / Checkpoints
          </MEHTypography>
          <MEHTypography variant="h2">
            {checkpoints.length}
          </MEHTypography>
          <MEHTypography variant="caption" style={{ opacity: 0.8 }}>
            Zonas de validación activas
          </MEHTypography>
        </div>
      </div>

      {/* GRÁFICA DE HISTOGRAMA */}
      <div>
        <MEHTypography variant="h4" style={{ marginBottom: '8px' }}>
          Histograma de Llegadas (Distribución por Hora)
        </MEHTypography>

        {histograma.length === 0 ? (
          <div className={styles.emptyState}>
            <MEHTypography variant="body">No hay registros de llegadas aún.</MEHTypography>
            <MEHTypography variant="caption">
              A medida que los participantes sean escaneados en puerta o checkpoints, el flujo por hora aparecerá aquí.
            </MEHTypography>
          </div>
        ) : (
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={histograma} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="hora" stroke="rgba(255,255,255,0.6)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar
                  dataKey="cantidad"
                  fill="#7f13ec"
                  name="Llegadas por hora"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
                <Line
                  type="monotone"
                  dataKey="acumulado"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#38bdf8' }}
                  name="Total acumulado"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* TOTALES POR CHECKPOINT */}
      <div>
        <MEHTypography variant="h4" style={{ marginBottom: '8px' }}>
          Totales por Checkpoint / Zona de Acceso
        </MEHTypography>
        {checkpoints.length === 0 ? (
          <MEHTypography variant="caption" style={{ opacity: 0.7 }}>
            No hay checkpoints configurados para este evento.
          </MEHTypography>
        ) : (
          <div className={styles.checkpointsGrid}>
            {checkpoints.map((cp, idx) => (
              <div key={cp.id_checkpoint || `cp-${idx}`} className={styles.checkpointCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <MEHTypography variant="body" style={{ fontWeight: 'bold' }}>
                    {cp.nombre_checkpoint}
                  </MEHTypography>
                  <Badge color="brand" appearance="tint">
                    {cp.porcentaje}%
                  </Badge>
                </div>
                <MEHTypography variant="caption" style={{ opacity: 0.7 }}>
                  {cp.total} participantes validados
                </MEHTypography>
                <ProgressBar
                  value={Math.min(1, Math.max(0, cp.porcentaje / 100))}
                  color="brand"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LlegadasEventoChart;

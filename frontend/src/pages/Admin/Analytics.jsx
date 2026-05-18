import React, { useState, useEffect } from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Spinner,
  Badge,
  Divider,
} from '@fluentui/react-components';
import {
  DataTrending24Filled,
  PeopleCommunity24Regular,
  Money24Regular,
  CheckmarkCircle24Regular,
  Map24Regular,
  HatGraduation24Regular,
  LeafTwo24Regular
} from '@fluentui/react-icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { MEHCard, MEHTypography } from '../../components/ui';
import api from '../../services/api';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    animationName: { from: { opacity: 0 }, to: { opacity: 1 } },
    animationDuration: '0.5s',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  chartGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    '@media(max-width: 1000px)': {
      gridTemplateColumns: '1fr',
    }
  },
  chartCard: {
    height: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  kpiCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    ...shorthands.padding('24px'),
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    ...shorthands.border('1px', 'solid', 'rgba(255, 255, 255, 0.05)'),
  }
});

const COLORS = ['#7f13ec', '#0078d4', '#107c10', '#d83b01', '#ffb900'];

const Analytics = () => {
  const styles = useStyles();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/reports/dashboard-stats');
      setData(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner label="Procesando métricas de impacto..." />;
  if (!data) return <MEHTypography>No hay datos disponibles.</MEHTypography>;

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <DataTrending24Filled style={{ color: tokens.colorBrandForeground1, fontSize: '32px' }} />
        <div>
          <MEHTypography variant="h1">Panel de Analíticas</MEHTypography>
          <MEHTypography variant="body" style={{ opacity: 0.6 }}>Métricas de impacto institucional y crecimiento comunitario.</MEHTypography>
        </div>
      </div>

      {/* KPIs Rápidos */}
      <div className={styles.kpiGrid}>
        <MEHCard className={styles.kpiCard}>
          <PeopleCommunity24Regular style={{ fontSize: '32px', color: tokens.colorBrandForeground1 }} />
          <MEHTypography variant="h1">{data.kpis.total_miembros}</MEHTypography>
          <MEHTypography variant="caption">Miembros Totales</MEHTypography>
        </MEHCard>
        <MEHCard className={styles.kpiCard}>
          <Money24Regular style={{ fontSize: '32px', color: '#107c10' }} />
          <MEHTypography variant="h1">${data.kpis.ingresos_totales}</MEHTypography>
          <MEHTypography variant="caption">Ingresos (USD)</MEHTypography>
        </MEHCard>
        <MEHCard className={styles.kpiCard}>
          <CheckmarkCircle24Regular style={{ fontSize: '32px', color: tokens.colorPaletteGoldForeground1 }} />
          <MEHTypography variant="h1">{data.kpis.tasa_conversion_asistencia}%</MEHTypography>
          <MEHTypography variant="caption">Ratio de Asistencia</MEHTypography>
        </MEHCard>
        <MEHCard className={styles.kpiCard}>
          <LeafTwo24Regular style={{ fontSize: '32px', color: '#d83b01' }} />
          <MEHTypography variant="h1">{data.kpis.ventas_souvenirs}</MEHTypography>
          <MEHTypography variant="caption">Souvenirs Vendidos</MEHTypography>
        </MEHCard>
      </div>

      <div className={styles.chartGrid}>
        {/* Asistencia vs Ausencia */}
        <MEHCard className={styles.chartCard}>
          <MEHTypography variant="h3">Asistencia vs Ausencia por Evento</MEHTypography>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.asistencia_series}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="white" fontSize={10} />
              <YAxis stroke="white" />
              <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', border: 'none' }} />
              <Legend />
              <Bar dataKey="asistentes" fill="#7f13ec" name="Asistieron" stackId="a" />
              <Bar dataKey="ausentes" fill="rgba(255,255,255,0.1)" name="Ausentes" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </MEHCard>

        {/* Crecimiento */}
        <MEHCard className={styles.chartCard}>
          <MEHTypography variant="h3">Crecimiento de la Comunidad</MEHTypography>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.crecimiento_comunidad}>
              <defs>
                <linearGradient id="colorMiembros" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7f13ec" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#7f13ec" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="mes" stroke="white" />
              <YAxis stroke="white" />
              <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', border: 'none' }} />
              <Area type="monotone" dataKey="miembros" stroke="#7f13ec" fillOpacity={1} fill="url(#colorMiembros)" />
            </AreaChart>
          </ResponsiveContainer>
        </MEHCard>

        {/* Segmentación Profesional */}
        <MEHCard className={styles.chartCard}>
          <MEHTypography variant="h3">Segmentación: Estudiante vs Profesional</MEHTypography>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.segmentacion}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="cantidad"
                nameKey="tipo"
                label={({ tipo, percent }) => `${tipo} ${(percent * 100).toFixed(0)}%`}
              >
                {data.segmentacion.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </MEHCard>

        {/* Distribución Geográfica Bolivia */}
        <MEHCard className={styles.chartCard}>
          <MEHTypography variant="h3">
            <Map24Regular /> Miembros por Departamento (Bolivia)
          </MEHTypography>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.geografia} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" stroke="white" />
              <YAxis dataKey="depto" type="category" stroke="white" width={80} />
              <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', border: 'none' }} />
              <Bar dataKey="cantidad" fill="#0078d4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </MEHCard>

        {/* Rendimiento por Curso */}
        <MEHCard className={styles.chartCard} style={{ gridColumn: '1 / -1', height: '500px' }}>
          <MEHTypography variant="h3">
            <HatGraduation24Regular /> Rendimiento por Curso (Aprobados vs Reprobados)
          </MEHTypography>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data.rendimiento_cursos} 
              margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="curso" 
                stroke="white" 
                angle={-45} 
                textAnchor="end" 
                interval={0} 
                fontSize={12} 
              />
              <YAxis stroke="white" />
              <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', border: 'none' }} />
              <Legend verticalAlign="top" />
              <Bar dataKey="aprobados" fill="#107c10" name="Aprobados" radius={[4, 4, 0, 0]} />
              <Bar dataKey="reprobados" fill="#d83b01" name="Reprobados" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </MEHCard>
      </div>
    </div>
  );
};


export default Analytics;

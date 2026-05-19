import React, { useEffect, useState } from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Spinner,
} from '@fluentui/react-components';
import {
  DataTrending24Filled,
  PeopleCommunity24Regular,
  Money24Regular,
  CheckmarkCircle24Regular,
  Map24Regular,
  HatGraduation24Regular,
  LeafTwo24Regular,
  CalendarLtr24Regular,
  Cart24Regular,
  Trophy24Regular,
} from '@fluentui/react-icons';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { MEHCard, MEHTypography } from '../../components/ui';
import api from '../../services/api';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    animationName: { from: { opacity: 0 }, to: { opacity: 1 } },
    animationDuration: '0.35s',
  },
  hero: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '16px',
    ...shorthands.padding('20px'),
    background: 'linear-gradient(135deg, rgba(127,19,236,0.2), rgba(0,120,212,0.12))',
    ...shorthands.border('1px', 'solid', 'rgba(255,255,255,0.1)'),
    ...shorthands.borderRadius('18px'),
  },
  heroLeft: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  heroTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    '@media (max-width: 900px)': {
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
  },
  heroIcon: {
    width: '42px',
    height: '42px',
    display: 'grid',
    placeItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    ...shorthands.borderRadius('12px'),
  },
  chipRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  chip: {
    ...shorthands.padding('6px', '10px'),
    ...shorthands.borderRadius('999px'),
    backgroundColor: 'rgba(255,255,255,0.06)',
    ...shorthands.border('1px', 'solid', 'rgba(255,255,255,0.08)'),
    fontSize: '12px',
    opacity: 0.9,
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
  },
  kpiCard: {
    ...shorthands.padding('14px'),
    backgroundColor: 'rgba(255,255,255,0.02)',
    ...shorthands.border('1px', 'solid', 'rgba(255,255,255,0.08)'),
    ...shorthands.borderRadius('14px'),
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minHeight: '110px',
  },
  kpiTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kpiIcon: {
    width: '32px',
    height: '32px',
    display: 'grid',
    placeItems: 'center',
    ...shorthands.borderRadius('10px'),
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  chartGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    '@media (max-width: 1100px)': { gridTemplateColumns: '1fr' },
  },
  chartCard: {
    minHeight: '390px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    ...shorthands.padding('14px'),
    ...shorthands.border('1px', 'solid', 'rgba(255,255,255,0.08)'),
    backgroundColor: 'rgba(255,255,255,0.02)',
    boxShadow: '0 10px 26px rgba(0,0,0,0.13)',
  },
  chartHead: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  chartBody: {
    flex: 1,
    minHeight: '300px',
  },
});

const COLORS = ['#7f13ec', '#0078d4', '#107c10', '#d83b01', '#ffb900', '#00b7c3', '#9c27b0', '#ff6f00'];
const fmtNumber = (n) => Number(n || 0).toLocaleString('es-BO');
const fmtMoney = (n) => Number(n || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Analytics = () => {
  const styles = useStyles();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/reports/dashboard-stats');
        setData(res.data);
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Spinner label="Procesando métricas de impacto..." />;
  if (!data) return <MEHTypography>No hay datos disponibles.</MEHTypography>;

  const k = data.kpis || {};
  const asistenciaSeries = data.asistencia_series || [];
  const actividadMensual = data.actividad_mensual || [];
  const rendimientoCursos = data.rendimiento_cursos || [];

  const coreKpis = [
    { icon: <PeopleCommunity24Regular />, color: tokens.colorBrandForeground1, value: fmtNumber(k.total_miembros), label: 'Usuarios Totales' },
    { icon: <CheckmarkCircle24Regular />, color: '#107c10', value: fmtNumber(k.miembros_activos), label: 'Usuarios Activos' },
    { icon: <CalendarLtr24Regular />, color: '#0078d4', value: fmtNumber(k.total_eventos), label: 'Talleres / Eventos' },
    { icon: <HatGraduation24Regular />, color: '#7f13ec', value: fmtNumber(k.total_cursos), label: 'Cursos Activos' },
    { icon: <Money24Regular />, color: '#107c10', value: `$${fmtMoney(k.ingresos_totales)}`, label: 'Ingresos Aprobados' },
    { icon: <Cart24Regular />, color: '#d83b01', value: fmtNumber(k.total_compras), label: 'Compras Registradas' },
    { icon: <LeafTwo24Regular />, color: tokens.colorPaletteGoldForeground1, value: fmtNumber(k.ventas_souvenirs), label: 'Items Vendidos' },
    { icon: <Trophy24Regular />, color: '#ffb900', value: fmtNumber(k.total_badges_otorgados), label: 'Badges Otorgados' },
  ];

  const secondaryKpis = [
    { value: fmtNumber(k.total_inscripciones_eventos), label: 'Inscripciones Eventos' },
    { value: fmtNumber(k.total_asistencias_eventos), label: 'Asistencias Confirmadas' },
    { value: `${k.tasa_conversion_asistencia || 0}%`, label: 'Tasa Asistencia Evento' },
    { value: fmtNumber(k.total_inscripciones_cursos), label: 'Inscripciones Cursos' },
    { value: `${k.tasa_finalizacion_cursos || 0}%`, label: 'Tasa Finalización Curso' },
    { value: fmtNumber(k.horas_formacion_ofertadas), label: 'Horas de Formación (Oferta)' },
    { value: fmtNumber(k.horas_formacion_estimadas), label: 'Horas Estimadas Consumidas' },
    { value: `$${fmtMoney(k.ticket_promedio_compra)}`, label: 'Ticket Promedio Compra' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.heroTop}>
          <div className={styles.heroLeft}>
            <div className={styles.heroIcon}>
              <DataTrending24Filled style={{ color: tokens.colorBrandForeground1, fontSize: '24px' }} />
            </div>
            <MEHTypography variant="h1">Panel de Analíticas</MEHTypography>
          </div>
          <div className={styles.chipRow}>
            <span className={styles.chip}>Eventos: {fmtNumber(k.total_eventos)}</span>
            <span className={styles.chip}>Cursos: {fmtNumber(k.total_cursos)}</span>
            <span className={styles.chip}>Ingresos: ${fmtMoney(k.ingresos_totales)}</span>
          </div>
        </div>
        <MEHTypography variant="body" style={{ opacity: 0.78 }}>
          Resumen ejecutivo de crecimiento, monetización, participación y rendimiento académico.
        </MEHTypography>
      </div>

      <div className={styles.sectionTitle}>
        <MEHTypography variant="h3">KPIs Clave</MEHTypography>
      </div>
      <div className={styles.kpiGrid}>
        {coreKpis.map((item, idx) => (
          <MEHCard key={`kpi-core-${idx}`} className={styles.kpiCard}>
            <div className={styles.kpiTop}>
              <div className={styles.kpiIcon} style={{ color: item.color }}>{item.icon}</div>
            </div>
            <MEHTypography variant="h2">{item.value}</MEHTypography>
            <MEHTypography variant="caption" style={{ opacity: 0.82 }}>{item.label}</MEHTypography>
          </MEHCard>
        ))}
      </div>

      <div className={styles.sectionTitle}>
        <MEHTypography variant="h3">KPIs Operativos</MEHTypography>
      </div>
      <div className={styles.kpiGrid}>
        {secondaryKpis.map((item, idx) => (
          <MEHCard key={`kpi-second-${idx}`} className={styles.kpiCard}>
            <MEHTypography variant="h2">{item.value}</MEHTypography>
            <MEHTypography variant="caption" style={{ opacity: 0.82 }}>{item.label}</MEHTypography>
          </MEHCard>
        ))}
      </div>

      <div className={styles.sectionTitle}>
        <MEHTypography variant="h3">Visualizaciones Estratégicas</MEHTypography>
      </div>
      <div className={styles.chartGrid}>
        <MEHCard className={styles.chartCard}>
          <div className={styles.chartHead}>
            <MEHTypography variant="h3">Inscripciones y Asistencias por Evento</MEHTypography>
            <MEHTypography variant="caption" style={{ opacity: 0.7 }}>Comparativa directa por evento</MEHTypography>
          </div>
          <div className={styles.chartBody}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={asistenciaSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="white" fontSize={10} />
                <YAxis stroke="white" />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', border: 'none' }} />
                <Legend />
                <Bar dataKey="inscritos" fill="#0078d4" name="Inscritos" radius={[6, 6, 0, 0]} />
                <Bar dataKey="asistentes" fill="#7f13ec" name="Asistieron" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MEHCard>

        <MEHCard className={styles.chartCard}>
          <div className={styles.chartHead}>
            <MEHTypography variant="h3">Tasa de Asistencia y Ocupación</MEHTypography>
            <MEHTypography variant="caption" style={{ opacity: 0.7 }}>Eficiencia de convocatoria y capacidad</MEHTypography>
          </div>
          <div className={styles.chartBody}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={asistenciaSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="white" fontSize={10} />
                <YAxis stroke="white" domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', border: 'none' }} />
                <Legend />
                <Line type="monotone" dataKey="tasa" stroke="#7f13ec" strokeWidth={2.5} name="Asistencia %" />
                <Line type="monotone" dataKey="ocupacion" stroke="#ffb900" strokeWidth={2.5} name="Ocupación %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </MEHCard>

        <MEHCard className={styles.chartCard}>
          <div className={styles.chartHead}>
            <MEHTypography variant="h3">Actividad Mensual</MEHTypography>
            <MEHTypography variant="caption" style={{ opacity: 0.7 }}>Usuarios, inscripciones y compras</MEHTypography>
          </div>
          <div className={styles.chartBody}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={actividadMensual}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="mes" stroke="white" />
                <YAxis stroke="white" />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', border: 'none' }} />
                <Legend />
                <Bar dataKey="usuarios_nuevos" fill="#7f13ec" name="Usuarios nuevos" radius={[6, 6, 0, 0]} />
                <Bar dataKey="inscripciones_eventos" fill="#0078d4" name="Inscripciones eventos" radius={[6, 6, 0, 0]} />
                <Line dataKey="compras" stroke="#ffb900" strokeWidth={2.5} name="Compras" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </MEHCard>

        <MEHCard className={styles.chartCard}>
          <div className={styles.chartHead}>
            <MEHTypography variant="h3">Ingresos Aprobados por Mes</MEHTypography>
            <MEHTypography variant="caption" style={{ opacity: 0.7 }}>Flujo económico consolidado</MEHTypography>
          </div>
          <div className={styles.chartBody}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={actividadMensual}>
                <defs>
                  <linearGradient id="moneyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#107c10" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#107c10" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="mes" stroke="white" />
                <YAxis stroke="white" />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', border: 'none' }} />
                <Area type="monotone" dataKey="monto_pagado_aprobado" stroke="#107c10" fillOpacity={1} fill="url(#moneyGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </MEHCard>

        <MEHCard className={styles.chartCard}>
          <div className={styles.chartHead}>
            <MEHTypography variant="h3">Métodos de Pago (Aprobados)</MEHTypography>
            <MEHTypography variant="caption" style={{ opacity: 0.7 }}>Participación por canal de pago</MEHTypography>
          </div>
          <div className={styles.chartBody}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.compras_por_metodo || []}
                  dataKey="cantidad"
                  nameKey="metodo"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  label={({ metodo, percent }) => `${metodo} ${(percent * 100).toFixed(0)}%`}
                >
                  {(data.compras_por_metodo || []).map((entry, index) => (
                    <Cell key={`metodo-${entry.metodo || index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </MEHCard>

        <MEHCard className={styles.chartCard}>
          <div className={styles.chartHead}>
            <MEHTypography variant="h3">Estado de Pagos</MEHTypography>
            <MEHTypography variant="caption" style={{ opacity: 0.7 }}>Distribución por estado administrativo</MEHTypography>
          </div>
          <div className={styles.chartBody}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.pagos_por_estado || []}
                  dataKey="cantidad"
                  nameKey="estado"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  label={({ estado, percent }) => `${estado} ${(percent * 100).toFixed(0)}%`}
                >
                  {(data.pagos_por_estado || []).map((entry, index) => (
                    <Cell key={`estado-${entry.estado || index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </MEHCard>

        <MEHCard className={styles.chartCard}>
          <div className={styles.chartHead}>
            <MEHTypography variant="h3">Top Productos Vendidos</MEHTypography>
            <MEHTypography variant="caption" style={{ opacity: 0.7 }}>Ranking por unidades</MEHTypography>
          </div>
          <div className={styles.chartBody}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.top_productos || []} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis type="number" stroke="white" />
                <YAxis dataKey="producto" type="category" stroke="white" width={140} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', border: 'none' }} />
                <Bar dataKey="unidades" fill="#d83b01" name="Unidades" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MEHCard>

        <MEHCard className={styles.chartCard}>
          <div className={styles.chartHead}>
            <MEHTypography variant="h3">Talleres por Modalidad</MEHTypography>
            <MEHTypography variant="caption" style={{ opacity: 0.7 }}>Virtual, presencial e híbrido</MEHTypography>
          </div>
          <div className={styles.chartBody}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.talleres_por_modalidad || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="modalidad" stroke="white" />
                <YAxis stroke="white" />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', border: 'none' }} />
                <Bar dataKey="cantidad" fill="#00b7c3" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MEHCard>

        <MEHCard className={styles.chartCard} style={{ gridColumn: '1 / -1', minHeight: '470px' }}>
          <div className={styles.chartHead}>
            <MEHTypography variant="h3">
              <HatGraduation24Regular /> Cursos: Inscritos, Finalizados y Progreso
            </MEHTypography>
            <MEHTypography variant="caption" style={{ opacity: 0.7 }}>Avance académico por programa</MEHTypography>
          </div>
          <div className={styles.chartBody}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={rendimientoCursos} margin={{ top: 10, right: 20, left: 20, bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="curso" stroke="white" angle={-25} textAnchor="end" interval={0} fontSize={11} />
                <YAxis yAxisId="left" stroke="white" />
                <YAxis yAxisId="right" orientation="right" stroke="#ffb900" domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', border: 'none' }} />
                <Legend />
                <Bar yAxisId="left" dataKey="inscritos" fill="#0078d4" name="Inscritos" radius={[6, 6, 0, 0]} />
                <Bar yAxisId="left" dataKey="finalizados" fill="#107c10" name="Finalizados" radius={[6, 6, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="progreso_promedio" stroke="#ffb900" strokeWidth={2.5} name="Progreso %" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </MEHCard>

        <MEHCard className={styles.chartCard}>
          <div className={styles.chartHead}>
            <MEHTypography variant="h3">Segmentación de Usuarios</MEHTypography>
            <MEHTypography variant="caption" style={{ opacity: 0.7 }}>Composición del ecosistema</MEHTypography>
          </div>
          <div className={styles.chartBody}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.segmentacion || []}
                  dataKey="cantidad"
                  nameKey="tipo"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  label={({ tipo, percent }) => `${tipo} ${(percent * 100).toFixed(0)}%`}
                >
                  {(data.segmentacion || []).map((entry, index) => (
                    <Cell key={`segment-${entry.tipo || index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </MEHCard>

        <MEHCard className={styles.chartCard}>
          <div className={styles.chartHead}>
            <MEHTypography variant="h3">
              <Map24Regular /> Miembros por Departamento
            </MEHTypography>
            <MEHTypography variant="caption" style={{ opacity: 0.7 }}>Distribución territorial Bolivia</MEHTypography>
          </div>
          <div className={styles.chartBody}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.geografia || []} layout="vertical" margin={{ left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis type="number" stroke="white" />
                <YAxis dataKey="depto" type="category" stroke="white" width={100} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', border: 'none' }} />
                <Bar dataKey="cantidad" fill="#7f13ec" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MEHCard>
      </div>
    </div>
  );
};

export default Analytics;

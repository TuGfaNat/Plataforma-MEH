import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  makeStyles,
  shorthands,
  tokens,
  Spinner,
  Input,
  Select,
  Button,
  Badge,
  Tooltip,
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
  Search24Regular,
  Filter24Regular,
  Filter24Filled,
  Dismiss16Regular,
  Dismiss24Regular,
  ArrowReset24Regular,
  Info24Regular,
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
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { MEHCard, MEHTypography } from '../../components/ui';
import dashboardService from '../../services/dashboardService';

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
  chipFilteredActive: {
    ...shorthands.padding('6px', '12px'),
    ...shorthands.borderRadius('999px'),
    backgroundColor: 'rgba(255,185,0,0.18)',
    ...shorthands.border('1px', 'solid', 'rgba(255,185,0,0.45)'),
    color: '#ffb900',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  filterCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    ...shorthands.padding('18px', '22px'),
    backgroundColor: 'rgba(255,255,255,0.03)',
    ...shorthands.border('1px', 'solid', 'rgba(255,255,255,0.08)'),
    ...shorthands.borderRadius('16px'),
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
  },
  filterCardHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
  },
  filterCardHeadTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: tokens.colorBrandForeground1,
  },
  filterControlsGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto',
    gap: '12px',
    alignItems: 'flex-end',
    '@media (max-width: 1200px)': {
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    },
  },
  filterFieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  filterLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: tokens.colorNeutralForeground3,
  },
  activeChipsBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    paddingTop: '10px',
    ...shorthands.borderTop('1px', 'solid', 'rgba(255,255,255,0.06)'),
  },
  activeChipItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    ...shorthands.padding('4px', '10px'),
    ...shorthands.borderRadius('999px'),
    backgroundColor: 'rgba(127,19,236,0.18)',
    ...shorthands.border('1px', 'solid', 'rgba(127,19,236,0.35)'),
    color: '#d0a9ff',
    fontSize: '12px',
    fontWeight: '500',
  },
  chipDismissBtn: {
    background: 'none',
    border: 'none',
    color: '#d0a9ff',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    padding: 0,
    ':hover': {
      color: '#fff',
    },
  },
  kpiStatusBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    ...shorthands.padding('12px', '18px'),
    ...shorthands.borderRadius('12px'),
    flexWrap: 'wrap',
    transition: 'all 0.3s ease',
  },
  kpiStatusFiltered: {
    backgroundColor: 'rgba(255, 185, 0, 0.09)',
    ...shorthands.border('1px', 'solid', 'rgba(255, 185, 0, 0.3)'),
  },
  kpiStatusGlobal: {
    backgroundColor: 'rgba(0, 120, 212, 0.06)',
    ...shorthands.border('1px', 'solid', 'rgba(0, 120, 212, 0.18)'),
  },
  indicatorBadgePill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    ...shorthands.padding('4px', '10px'),
    ...shorthands.borderRadius('8px'),
    fontWeight: '700',
    fontSize: '11px',
    letterSpacing: '0.6px',
    textTransform: 'uppercase',
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
  emptyChartMessage: {
    height: '100%',
    display: 'grid',
    placeItems: 'center',
    opacity: 0.65,
    textAlign: 'center',
    padding: '30px',
  },
});

const COLORS = ['#7f13ec', '#0078d4', '#107c10', '#d83b01', '#ffb900', '#00b7c3', '#9c27b0', '#ff6f00'];
const fmtNumber = (n) => Number(n || 0).toLocaleString('es-BO');
const fmtMoney = (n) => Number(n || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Analytics = () => {
  const styles = useStyles();
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filtros combinados AND para Analytics
  const [filters, setFilters] = useState({
    q: '',
    modalidad: 'Todos',
    estado: 'Todos',
    fecha_inicio: '',
    fecha_fin: '',
  });

  const [debouncedQ, setDebouncedQ] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQ(filters.q);
    }, 300);
    return () => clearTimeout(handler);
  }, [filters.q]);

  const fetchStats = async (currentFilters) => {
    try {
      const res = await dashboardService.getFilteredStats(currentFilters);
      setData(res);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats({
      q: debouncedQ,
      modalidad: filters.modalidad,
      estado: filters.estado,
      fecha_inicio: filters.fecha_inicio,
      fecha_fin: filters.fecha_fin,
    });
  }, [debouncedQ, filters.modalidad, filters.estado, filters.fecha_inicio, filters.fecha_fin]);

  const handleClearFilters = () => {
    setFilters({
      q: '',
      modalidad: 'Todos',
      estado: 'Todos',
      fecha_inicio: '',
      fecha_fin: '',
    });
  };

  const handleRemoveFilter = (key) => {
    setFilters((prev) => ({
      ...prev,
      [key]: key === 'modalidad' || key === 'estado' ? 'Todos' : '',
    }));
  };

  if (loading) return <Spinner label={t('admin_processing_metrics')} />;
  if (!data) return <MEHTypography>{t('admin_no_data')}</MEHTypography>;

  const k = data.kpis || {};
  const asistenciaSeries = data.asistencia_series || [];
  const actividadMensual = data.actividad_mensual || [];
  const rendimientoCursos = data.rendimiento_cursos || [];

  // Active filter chips list
  const activeChips = [];
  if (filters.q && filters.q.trim()) {
    activeChips.push({ key: 'q', label: `Evento: "${filters.q.trim()}"` });
  }
  if (filters.modalidad && filters.modalidad !== 'Todos' && filters.modalidad !== 'Todas') {
    activeChips.push({ key: 'modalidad', label: `${t('admin_filter_modality')}: ${filters.modalidad}` });
  }
  if (filters.estado && filters.estado !== 'Todos' && filters.estado !== 'Todas') {
    activeChips.push({ key: 'estado', label: `${t('admin_filter_status')}: ${filters.estado}` });
  }
  if (filters.fecha_inicio) {
    activeChips.push({ key: 'fecha_inicio', label: `${t('admin_filter_date_start')}: ${filters.fecha_inicio}` });
  }
  if (filters.fecha_fin) {
    activeChips.push({ key: 'fecha_fin', label: `${t('admin_filter_date_end')}: ${filters.fecha_fin}` });
  }
  const hasActiveFilters = activeChips.length > 0;
  const isFiltered = Boolean(data.is_filtered || hasActiveFilters);

  const coreKpis = [
    { icon: <PeopleCommunity24Regular />, color: tokens.colorBrandForeground1, value: fmtNumber(k.total_miembros), label: t('admin_total_users') },
    { icon: <CheckmarkCircle24Regular />, color: '#107c10', value: fmtNumber(k.miembros_activos), label: t('admin_active_users') },
    { icon: <CalendarLtr24Regular />, color: '#0078d4', value: fmtNumber(k.total_eventos), label: t('admin_workshops_events') },
    { icon: <HatGraduation24Regular />, color: '#7f13ec', value: fmtNumber(k.total_cursos), label: t('admin_active_courses') },
    { icon: <Money24Regular />, color: '#107c10', value: `Bs. ${fmtMoney(k.ingresos_totales)}`, label: t('admin_approved_revenue') },
    { icon: <Cart24Regular />, color: '#d83b01', value: fmtNumber(k.total_compras), label: t('admin_registered_purchases') },
    { icon: <LeafTwo24Regular />, color: tokens.colorPaletteGoldForeground1, value: fmtNumber(k.ventas_souvenirs), label: t('admin_sold_items') },
    { icon: <Trophy24Regular />, color: '#ffb900', value: fmtNumber(k.total_badges_otorgados), label: t('admin_awarded_badges') },
  ];

  const secondaryKpis = [
    { value: fmtNumber(k.total_inscripciones_eventos), label: t('admin_event_inscriptions') },
    { value: fmtNumber(k.total_asistencias_eventos), label: t('admin_confirmed_attendances') },
    { value: `${k.tasa_conversion_asistencia || 0}%`, label: t('admin_event_attendance_rate') },
    { value: fmtNumber(k.total_inscripciones_cursos), label: t('admin_course_inscriptions') },
    { value: `${k.tasa_finalizacion_cursos || 0}%`, label: t('admin_course_completion_rate') },
    { value: fmtNumber(k.horas_formacion_ofertadas), label: t('admin_offered_training_hours') },
    { value: fmtNumber(k.horas_formacion_estimadas), label: t('admin_consumed_estimated_hours') },
    { value: `Bs. ${fmtMoney(k.ticket_promedio_compra)}`, label: t('admin_average_purchase_ticket') },
  ];

  return (
    <div className={styles.container}>
      {/* Hero Header */}
      <div className={styles.hero}>
        <div className={styles.heroTop}>
          <div className={styles.heroLeft}>
            <div className={styles.heroIcon}>
              <DataTrending24Filled style={{ color: tokens.colorBrandForeground1, fontSize: '24px' }} />
            </div>
            <MEHTypography variant="h1">{t('admin_analytics_panel')}</MEHTypography>
          </div>
          <div className={styles.chipRow}>
            {isFiltered && (
              <span className={styles.chipFilteredActive}>
                <Filter24Filled /> {t('admin_kpis_filtered')} ({data.eventos_filtrados_conteo || 0} {t('events') || 'eventos'})
              </span>
            )}
            <span className={styles.chip}>{t('admin_events_count', { count: fmtNumber(k.total_eventos) })}</span>
            <span className={styles.chip}>{t('admin_courses_count', { count: fmtNumber(k.total_cursos) })}</span>
            <span className={styles.chip}>{t('admin_revenue_amount', { amount: `Bs. ${fmtMoney(k.ingresos_totales)}` })}</span>
          </div>
        </div>
        <MEHTypography variant="body" style={{ opacity: 0.78 }}>
          {t('admin_analytics_summary')}
        </MEHTypography>
      </div>

      {/* Filter Bar with AND Conjunction */}
      <div className={styles.filterCard}>
        <div className={styles.filterCardHead}>
          <div className={styles.filterCardHeadTitle}>
            <Filter24Regular />
            <MEHTypography variant="h3">{t('admin_filter_events')}</MEHTypography>
          </div>
          {hasActiveFilters && (
            <Button
              appearance="subtle"
              icon={<ArrowReset24Regular />}
              onClick={handleClearFilters}
              size="small"
            >
              {t('admin_filter_clear')}
            </Button>
          )}
        </div>

        <div className={styles.filterControlsGrid}>
          {/* Search by Name */}
          <div className={styles.filterFieldGroup}>
            <label className={styles.filterLabel}>{t('admin_filter_events')}</label>
            <Input
              contentBefore={<Search24Regular />}
              placeholder={t('admin_filter_search_placeholder')}
              value={filters.q}
              onChange={(e, d) => setFilters((prev) => ({ ...prev, q: d.value }))}
            />
          </div>

          {/* Modality */}
          <div className={styles.filterFieldGroup}>
            <label className={styles.filterLabel}>{t('admin_filter_modality')}</label>
            <Select
              value={filters.modalidad}
              onChange={(e, d) => setFilters((prev) => ({ ...prev, modalidad: d.value }))}
            >
              <option value="Todos">{t('admin_filter_modality_all')}</option>
              <option value="VIRTUAL">{t('admin_filter_modality_virtual')}</option>
              <option value="PRESENCIAL">{t('admin_filter_modality_presencial')}</option>
              <option value="HIBRIDO">{t('admin_filter_modality_hibrido')}</option>
            </Select>
          </div>

          {/* Status */}
          <div className={styles.filterFieldGroup}>
            <label className={styles.filterLabel}>{t('admin_filter_status')}</label>
            <Select
              value={filters.estado}
              onChange={(e, d) => setFilters((prev) => ({ ...prev, estado: d.value }))}
            >
              <option value="Todos">{t('admin_filter_status_all')}</option>
              <option value="PROGRAMADO">{t('admin_filter_status_programado')}</option>
              <option value="EN_CURSO">{t('admin_filter_status_en_curso')}</option>
              <option value="FINALIZADO">{t('admin_filter_status_finalizado')}</option>
              <option value="CANCELADO">{t('admin_filter_status_cancelado')}</option>
            </Select>
          </div>

          {/* Start Date */}
          <div className={styles.filterFieldGroup}>
            <label className={styles.filterLabel}>{t('admin_filter_date_start')}</label>
            <Input
              type="date"
              value={filters.fecha_inicio}
              onChange={(e, d) => setFilters((prev) => ({ ...prev, fecha_inicio: d.value }))}
            />
          </div>

          {/* End Date */}
          <div className={styles.filterFieldGroup}>
            <label className={styles.filterLabel}>{t('admin_filter_date_end')}</label>
            <Input
              type="date"
              value={filters.fecha_fin}
              onChange={(e, d) => setFilters((prev) => ({ ...prev, fecha_fin: d.value }))}
            />
          </div>

          {/* Clear Button */}
          <div className={styles.filterFieldGroup}>
            <label className={styles.filterLabel} style={{ visibility: 'hidden' }}>Acción</label>
            <Button
              appearance="secondary"
              icon={<Dismiss24Regular />}
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
            >
              {t('admin_filter_clear')}
            </Button>
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className={styles.activeChipsBar}>
            <MEHTypography variant="caption" style={{ opacity: 0.8, fontWeight: '600' }}>
              {t('admin_filter_active_chips')}
            </MEHTypography>
            {activeChips.map((chip) => (
              <span key={chip.key} className={styles.activeChipItem}>
                {chip.label}
                <button
                  type="button"
                  aria-label={`Eliminar filtro ${chip.label}`}
                  className={styles.chipDismissBtn}
                  onClick={() => handleRemoveFilter(chip.key)}
                >
                  <Dismiss16Regular />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* KPI Subconjunto Filtrado Status Indicator */}
      <div
        className={`${styles.kpiStatusBanner} ${
          isFiltered ? styles.kpiStatusFiltered : styles.kpiStatusGlobal
        }`}
      >
        <span
          className={styles.indicatorBadgePill}
          style={{
            backgroundColor: isFiltered ? '#ffb900' : 'rgba(0, 120, 212, 0.25)',
            color: isFiltered ? '#000' : '#0078d4',
          }}
        >
          {isFiltered ? <Filter24Filled /> : <CheckmarkCircle24Regular />}
          {isFiltered ? t('admin_kpis_filtered') : t('admin_kpis_global')}
        </span>
        <MEHTypography
          variant="body"
          style={{
            color: isFiltered ? '#ffb900' : tokens.colorNeutralForeground2,
            fontWeight: isFiltered ? '600' : '400',
          }}
        >
          {isFiltered
            ? data.indicador_filtrado ||
              t('admin_kpis_filtered_desc', { count: data.eventos_filtrados_conteo || 0 })
            : t('admin_kpis_global_desc')}
        </MEHTypography>
      </div>

      {/* Core KPIs */}
      <div className={styles.sectionTitle}>
        <MEHTypography variant="h3">{t('admin_key_kpis')}</MEHTypography>
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

      {/* Operative KPIs */}
      <div className={styles.sectionTitle}>
        <MEHTypography variant="h3">{t('admin_operative_kpis')}</MEHTypography>
      </div>
      <div className={styles.kpiGrid}>
        {secondaryKpis.map((item, idx) => (
          <MEHCard key={`kpi-second-${idx}`} className={styles.kpiCard}>
            <MEHTypography variant="h2">{item.value}</MEHTypography>
            <MEHTypography variant="caption" style={{ opacity: 0.82 }}>{item.label}</MEHTypography>
          </MEHCard>
        ))}
      </div>

      {/* Visualizations Grid */}
      <div className={styles.sectionTitle}>
        <MEHTypography variant="h3">{t('admin_strategic_visualizations')}</MEHTypography>
      </div>
      <div className={styles.chartGrid}>
        {/* Inscriptions & Attendances by Event */}
        <MEHCard className={styles.chartCard}>
          <div className={styles.chartHead}>
            <MEHTypography variant="h3">{t('admin_inscriptions_attendances_event')}</MEHTypography>
            <MEHTypography variant="caption" style={{ opacity: 0.7 }}>{t('admin_direct_comparative_event')}</MEHTypography>
          </div>
          <div className={styles.chartBody}>
            {asistenciaSeries.length === 0 ? (
              <div className={styles.emptyChartMessage}>
                <MEHTypography variant="body">{t('admin_no_matching_events')}</MEHTypography>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={asistenciaSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="white" fontSize={10} />
                  <YAxis stroke="white" />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1A1A1A', border: 'none' }} />
                  <Legend />
                  <Bar dataKey="inscritos" fill="#0078d4" name={t('inscribed')} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="asistentes" fill="#7f13ec" name={t('attended')} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </MEHCard>

        {/* Attendance & Occupation Rate */}
        <MEHCard className={styles.chartCard}>
          <div className={styles.chartHead}>
            <MEHTypography variant="h3">{t('admin_attendance_occupation_rate')}</MEHTypography>
            <MEHTypography variant="caption" style={{ opacity: 0.7 }}>{t('admin_call_capacity_efficiency')}</MEHTypography>
          </div>
          <div className={styles.chartBody}>
            {asistenciaSeries.length === 0 ? (
              <div className={styles.emptyChartMessage}>
                <MEHTypography variant="body">{t('admin_no_matching_events')}</MEHTypography>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={asistenciaSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="white" fontSize={10} />
                  <YAxis stroke="white" domain={[0, 100]} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1A1A1A', border: 'none' }} />
                  <Legend />
                  <Line type="monotone" dataKey="tasa" stroke="#7f13ec" strokeWidth={2.5} name={t('admin_attendance_percent')} />
                  <Line type="monotone" dataKey="ocupacion" stroke="#ffb900" strokeWidth={2.5} name={t('admin_occupation_percent')} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </MEHCard>

        {/* Workshops by Modality */}
        <MEHCard className={styles.chartCard}>
          <div className={styles.chartHead}>
            <MEHTypography variant="h3">{t('admin_workshops_by_modality')}</MEHTypography>
            <MEHTypography variant="caption" style={{ opacity: 0.7 }}>{t('admin_virtual_presential_hybrid')}</MEHTypography>
          </div>
          <div className={styles.chartBody}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.talleres_por_modalidad || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="modalidad" stroke="white" />
                <YAxis stroke="white" />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1A1A1A', border: 'none' }} />
                <Bar dataKey="cantidad" fill="#00b7c3" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MEHCard>

        {/* Events by Status */}
        <MEHCard className={styles.chartCard}>
          <div className={styles.chartHead}>
            <MEHTypography variant="h3">{t('admin_filter_status') || 'Eventos por Estado'}</MEHTypography>
            <MEHTypography variant="caption" style={{ opacity: 0.7 }}>Distribución por estado de ciclo de vida</MEHTypography>
          </div>
          <div className={styles.chartBody}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.eventos_por_estado || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="estado" stroke="white" />
                <YAxis stroke="white" />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1A1A1A', border: 'none' }} />
                <Bar dataKey="cantidad" fill="#7f13ec" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MEHCard>

        {/* Monthly Activity */}
        <MEHCard className={styles.chartCard}>
          <div className={styles.chartHead}>
            <MEHTypography variant="h3">{t('admin_monthly_activity')}</MEHTypography>
            <MEHTypography variant="caption" style={{ opacity: 0.7 }}>{t('admin_users_inscriptions_purchases')}</MEHTypography>
          </div>
          <div className={styles.chartBody}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={actividadMensual}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="mes" stroke="white" />
                <YAxis stroke="white" />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1A1A1A', border: 'none' }} />
                <Legend />
                <Bar dataKey="usuarios_nuevos" fill="#7f13ec" name={t('admin_new_users')} radius={[6, 6, 0, 0]} />
                <Bar dataKey="inscripciones_eventos" fill="#0078d4" name={t('admin_event_inscriptions_series')} radius={[6, 6, 0, 0]} />
                <Line dataKey="compras" stroke="#ffb900" strokeWidth={2.5} name={t('admin_purchases')} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </MEHCard>

        {/* Approved Revenue Monthly */}
        <MEHCard className={styles.chartCard}>
          <div className={styles.chartHead}>
            <MEHTypography variant="h3">{t('admin_approved_revenue_monthly')}</MEHTypography>
            <MEHTypography variant="caption" style={{ opacity: 0.7 }}>{t('admin_consolidated_economic_flow')}</MEHTypography>
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
                <RechartsTooltip contentStyle={{ backgroundColor: '#1A1A1A', border: 'none' }} />
                <Area type="monotone" dataKey="monto_pagado_aprobado" stroke="#107c10" fillOpacity={1} fill="url(#moneyGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </MEHCard>

        {/* Payment Methods */}
        <MEHCard className={styles.chartCard}>
          <div className={styles.chartHead}>
            <MEHTypography variant="h3">{t('admin_payment_methods_approved')}</MEHTypography>
            <MEHTypography variant="caption" style={{ opacity: 0.7 }}>{t('admin_participation_payment_channel')}</MEHTypography>
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
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </MEHCard>

        {/* Payment Status */}
        <MEHCard className={styles.chartCard}>
          <div className={styles.chartHead}>
            <MEHTypography variant="h3">{t('admin_payment_status')}</MEHTypography>
            <MEHTypography variant="caption" style={{ opacity: 0.7 }}>{t('admin_distribution_administrative_status')}</MEHTypography>
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
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </MEHCard>

        {/* Top Sold Products */}
        <MEHCard className={styles.chartCard}>
          <div className={styles.chartHead}>
            <MEHTypography variant="h3">{t('admin_top_sold_products')}</MEHTypography>
            <MEHTypography variant="caption" style={{ opacity: 0.7 }}>{t('admin_ranking_by_units')}</MEHTypography>
          </div>
          <div className={styles.chartBody}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.top_productos || []} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis type="number" stroke="white" />
                <YAxis dataKey="producto" type="category" stroke="white" width={140} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1A1A1A', border: 'none' }} />
                <Bar dataKey="unidades" fill="#d83b01" name={t('admin_units')} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MEHCard>

        {/* Courses Progress */}
        <MEHCard className={styles.chartCard} style={{ gridColumn: '1 / -1', minHeight: '470px' }}>
          <div className={styles.chartHead}>
            <MEHTypography variant="h3">
              <HatGraduation24Regular /> {t('admin_courses_progress')}
            </MEHTypography>
            <MEHTypography variant="caption" style={{ opacity: 0.7 }}>{t('admin_academic_advance_program')}</MEHTypography>
          </div>
          <div className={styles.chartBody}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={rendimientoCursos} margin={{ top: 10, right: 20, left: 20, bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="curso" stroke="white" angle={-25} textAnchor="end" interval={0} fontSize={11} />
                <YAxis yAxisId="left" stroke="white" />
                <YAxis yAxisId="right" orientation="right" stroke="#ffb900" domain={[0, 100]} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1A1A1A', border: 'none' }} />
                <Legend />
                <Bar yAxisId="left" dataKey="inscritos" fill="#0078d4" name={t('inscribed')} radius={[6, 6, 0, 0]} />
                <Bar yAxisId="left" dataKey="finalizados" fill="#107c10" name={t('finished')} radius={[6, 6, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="progreso_promedio" stroke="#ffb900" strokeWidth={2.5} name={t('progress_percent')} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </MEHCard>

        {/* User Segmentation */}
        <MEHCard className={styles.chartCard}>
          <div className={styles.chartHead}>
            <MEHTypography variant="h3">{t('admin_user_segmentation')}</MEHTypography>
            <MEHTypography variant="caption" style={{ opacity: 0.7 }}>{t('admin_ecosystem_composition')}</MEHTypography>
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
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </MEHCard>

        {/* Members by Department */}
        <MEHCard className={styles.chartCard}>
          <div className={styles.chartHead}>
            <MEHTypography variant="h3">
              <Map24Regular /> {t('admin_members_by_department')}
            </MEHTypography>
            <MEHTypography variant="caption" style={{ opacity: 0.7 }}>{t('admin_territorial_distribution_bolivia')}</MEHTypography>
          </div>
          <div className={styles.chartBody}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.geografia || []} layout="vertical" margin={{ left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis type="number" stroke="white" />
                <YAxis dataKey="depto" type="category" stroke="white" width={100} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1A1A1A', border: 'none' }} />
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

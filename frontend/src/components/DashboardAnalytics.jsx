import React from 'react';
import { 
  makeStyles, 
  tokens, 
  shorthands 
} from '@fluentui/react-components';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { MEHTypography } from './ui';
import AnalyticsCard from './AnalyticsCard';

const useStyles = makeStyles({
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '24px',
    marginTop: '24px',
  },
  chartContainer: {
    width: '100%',
    height: '100%',
  }
});

const COLORS = [tokens.colorBrandBackground, tokens.colorBrandForeground1, '#22B14C', '#FFA500', '#FF6B6B'];

const DashboardAnalytics = ({ metrics }) => {
  const styles = useStyles();

  if (!metrics) return null;

  // Transformar datos para Recharts
  const perfilData = metrics.perfil_ocupacional ? [
    { name: 'Estudiantes', value: metrics.perfil_ocupacional.estudiantes },
    { name: 'Profesionales', value: metrics.perfil_ocupacional.profesionales }
  ] : [];

  const asistenciaData = metrics.tasa_asistencia ? [
    { name: 'Asistieron', value: metrics.tasa_asistencia.asistieron },
    { name: 'Ausentes', value: metrics.tasa_asistencia.ausentes }
  ] : [];

  const geografiaData = metrics.geografia_bolivia ? Object.entries(metrics.geografia_bolivia).map(([name, value]) => ({
    name, value
  })) : [];

  const rendimientoData = metrics.rendimiento_academico ? [
    { name: 'Aprobados', value: metrics.rendimiento_academico.aprobados },
    { name: 'Reprobados', value: metrics.rendimiento_academico.reprobados }
  ] : [];

  return (
    <div className={styles.container}>
      {/* Perfil Ocupacional */}
      {perfilData.length > 0 && (
        <AnalyticsCard 
          title="Perfil de la Comunidad" 
          description="Distribución entre Estudiantes y Profesionales"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={perfilData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {perfilData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1A1A1A', border: `1px solid ${tokens.colorNeutralBackground3}` }}
                itemStyle={{ color: 'white' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </AnalyticsCard>
      )}

      {/* Tasa de Asistencia */}
      {asistenciaData.length > 0 && (
        <AnalyticsCard 
          title="Tasa de Asistencia" 
          description="Relación entre inscritos y asistentes reales"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={asistenciaData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {asistenciaData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name === 'Asistieron' ? '#22B14C' : '#FF6B6B'} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1A1A1A', border: `1px solid ${tokens.colorNeutralBackground3}` }}
                itemStyle={{ color: 'white' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </AnalyticsCard>
      )}

      {/* Geografía Bolivia */}
      {geografiaData.length > 0 && (
        <AnalyticsCard 
          title="Distribución Geográfica" 
          description="Impacto del programa por departamento"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={geografiaData}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1A1A1A', border: `1px solid ${tokens.colorNeutralBackground3}` }}
                itemStyle={{ color: 'white' }}
              />
              <Bar dataKey="value" fill={tokens.colorBrandBackground} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </AnalyticsCard>
      )}

      {/* Rendimiento Académico */}
      {rendimientoData.length > 0 && (
        <AnalyticsCard 
          title="Rendimiento Académico" 
          description="Aprobación global en cursos certificados"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={rendimientoData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {rendimientoData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name === 'Aprobados' ? '#22B14C' : '#FF6B6B'} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1A1A1A', border: `1px solid ${tokens.colorNeutralBackground3}` }}
                itemStyle={{ color: 'white' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </AnalyticsCard>
      )}
    </div>
  );
};

export default DashboardAnalytics;

import React, { useMemo } from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
} from '@fluentui/react-components';
import { MEHCard, MEHTypography } from './ui';

const useStyles = makeStyles({
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '16px',
  },
  tableHeader: {
    backgroundColor: 'rgba(127, 19, 236, 0.15)',
    fontWeight: tokens.fontWeightBold,
    borderBottom: `2px solid rgba(127, 19, 236, 0.4)`,
  },
  tableRow: {
    borderBottom: `1px solid rgba(127, 19, 236, 0.1)`,
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: 'rgba(127, 19, 236, 0.05)',
    }
  },
  rowActive: {
    backgroundColor: 'rgba(127, 19, 236, 0.2)',
    borderLeft: `4px solid ${tokens.colorBrandForeground1}`,
  },
  tableCell: {
    ...shorthands.padding('16px'),
    textAlign: 'left',
    fontSize: tokens.fontSizeBase200,
  },
  levelBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(127, 19, 236, 0.2)',
    color: tokens.colorBrandForeground1,
    padding: '6px 12px',
    borderRadius: tokens.borderRadiusSmall,
    fontWeight: tokens.fontWeightBold,
    fontSize: tokens.fontSizeBase200,
  },
  progressBar: {
    height: '6px',
    backgroundColor: 'rgba(127, 19, 236, 0.1)',
    borderRadius: '3px',
    marginTop: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: tokens.colorBrandForeground1,
    transition: 'width 0.3s ease',
  },
  benefitsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  benefitItem: {
    fontSize: tokens.fontSizeBase200,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    opacity: 0.85,
  },
});

const RANKS = [
  {
    id: 'beginner',
    name: 'Beginner',
    emoji: '🎖️',
    minProgress: 0,
    maxProgress: 24,
    requirement: '0% - Inicial',
    benefits: [
      'Ver comunidad',
      'Participar en eventos públicos',
      'Perfil básico de usuario',
    ],
  },
  {
    id: 'explorer',
    name: 'Explorer',
    emoji: '🔑',
    minProgress: 25,
    maxProgress: 49,
    requirement: '25% de progreso',
    benefits: [
      'Todo lo anterior',
      'Invitación a clases especiales',
      'Acceso a cursos exclusivos',
      'Insignias por participación',
      'Información exclusiva de la comunidad',
    ],
  },
  {
    id: 'legend',
    name: 'Legend',
    emoji: '⭐',
    minProgress: 50,
    maxProgress: 74,
    requirement: '50% de progreso',
    benefits: [
      'Todo lo anterior',
      'Soporte preferente',
      'Acceso a talleres prácticos avanzados',
      'Insignia de Leyenda en el perfil',
    ],
  },
  {
    id: 'master',
    name: 'Master',
    emoji: '💎',
    minProgress: 75,
    maxProgress: 99,
    requirement: '75% de progreso',
    benefits: [
      'Todo lo anterior',
      'Acceso prioritario a nuevos contenidos',
      'Participación en eventos cerrados',
      'Mentoría grupal de comunidad',
    ],
  },
  {
    id: 'champion',
    name: 'Champion',
    emoji: '👑',
    minProgress: 100,
    maxProgress: 100,
    requirement: '100% completado',
    benefits: [
      'Todo lo anterior',
      'Reconocimiento oficial en la plataforma',
      'Acceso a información estratégica',
      'Postulación preferente para roles staff',
    ],
  },
];

const RankBenefitsTable = ({ currentProgress = 0, userRank = null }) => {
  const styles = useStyles();

  // Determinar rango actual basado en progreso
  const activeRank = useMemo(() => {
    return RANKS.find(
      rank => currentProgress >= rank.minProgress && currentProgress <= rank.maxProgress
    );
  }, [currentProgress]);

  return (
    <div className={styles.tableWrapper}>
      <MEHCard>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHeader}>
              <th className={styles.tableCell}>Nivel</th>
              <th className={styles.tableCell}>Requisito</th>
              <th className={styles.tableCell}>Beneficios</th>
              <th className={styles.tableCell} style={{ textAlign: 'center' }}>Progreso</th>
            </tr>
          </thead>
          <tbody>
            {RANKS.map(rank => {
              const isCompleted = currentProgress > rank.maxProgress;
              const isActive = activeRank?.id === rank.id;
              
              // Calcular porcentaje de llenado para la barra de este rango
              let fillPercentage = '0%';
              if (isCompleted) {
                fillPercentage = '100%';
              } else if (isActive) {
                const range = rank.maxProgress - rank.minProgress + 1;
                fillPercentage = `${((currentProgress - rank.minProgress) / range) * 100}%`;
              }

              return (
                <tr
                  key={rank.id}
                  className={styles.tableRow}
                  style={isActive ? { backgroundColor: 'rgba(127, 19, 236, 0.15)', borderLeft: `4px solid ${tokens.colorBrandForeground1}` } : {}}
                >
                  <td className={styles.tableCell}>
                    <div className={styles.levelBadge} style={isCompleted ? { backgroundColor: 'rgba(34, 177, 76, 0.2)', color: '#22B14C' } : {}}>
                      <span style={{ fontSize: '20px' }}>{rank.emoji}</span>
                      <span>{rank.name}</span>
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    <MEHTypography style={{ opacity: 0.8 }}>
                      {rank.requirement}
                    </MEHTypography>
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.benefitsList}>
                      {rank.benefits.map((benefit, idx) => (
                        <div key={idx} className={styles.benefitItem}>
                          <span style={isCompleted || isActive ? { color: '#22B14C', fontWeight: 'bold' } : {}}>✓</span>
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className={styles.tableCell} style={{ textAlign: 'center' }}>
                    <div style={{ minWidth: '120px' }}>
                      <MEHTypography style={{ fontSize: '14px', fontWeight: 'bold', textAlign: 'center' }}>
                        {rank.minProgress}-{rank.maxProgress}%
                      </MEHTypography>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{
                            width: fillPercentage,
                            backgroundColor: isCompleted ? '#22B14C' : tokens.colorBrandForeground1
                          }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ 
          marginTop: '20px', 
          padding: '16px', 
          borderRadius: '8px', 
          backgroundColor: 'rgba(127, 19, 236, 0.05)', 
          border: '1px solid rgba(127, 19, 236, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <MEHTypography variant="caption" style={{ opacity: 0.9, display: 'block', fontWeight: 'bold', color: tokens.colorBrandForeground1 }}>
            ℹ️ Nota sobre el rol de Embajador y Recursos VIP:
          </MEHTypography>
          <MEHTypography variant="caption" style={{ opacity: 0.8, display: 'block', lineHeight: '1.4' }}>
            El rol oficial de <b>Embajador</b> y el acceso a <b>Recursos VIP</b> no se otorgan automáticamente al subir de nivel en esta tabla. Estos privilegios son asignados discrecionalmente por los Administradores a aquellos miembros activos que organicen eventos, den conferencias o generen contenido destacado para la comunidad de Microsoft.
          </MEHTypography>
        </div>
      </MEHCard>
    </div>
  );
};

export default RankBenefitsTable;

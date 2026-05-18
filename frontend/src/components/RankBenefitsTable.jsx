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
      'Participar en eventos',
      'Perfil público',
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
      'Acceso a recursos VIP',
      'Descuentos en eventos',
      'Insignias exclusivas',
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
      'Crear eventos propios',
      'Moderar comunidad',
      'Badge de leyenda',
      'Soporte prioritario',
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
      'Acceso Speaker Kit',
      'Monetizar eventos',
      'Dashboard avanzado',
      'Programa de afiliados',
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
      'Badge exclusivo',
      'Reconocimiento oficial',
      'Acceso VIP ilimitado',
      'Mentor de comunidad',
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
            {RANKS.map(rank => (
              <tr
                key={rank.id}
                className={styles.tableRow}
                style={activeRank?.id === rank.id ? { backgroundColor: 'rgba(127, 19, 236, 0.15)', borderLeft: `4px solid ${tokens.colorBrandForeground1}` } : {}}
              >
                <td className={styles.tableCell}>
                  <div className={styles.levelBadge}>
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
                        <span>✓</span>
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
                          width: activeRank?.id === rank.id ? `${((currentProgress - rank.minProgress) / (rank.maxProgress - rank.minProgress + 1)) * 100}%` : '0%',
                        }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </MEHCard>
    </div>
  );
};

export default RankBenefitsTable;

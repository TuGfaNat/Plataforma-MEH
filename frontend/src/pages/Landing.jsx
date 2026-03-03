import React from 'react';
import { 
  makeStyles, 
  shorthands, 
  tokens
} from '@fluentui/react-components';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { designTokens } from '../theme/theme';
import { MEHButton, MEHCard, MEHTypography } from '../components/ui';

import { 
  CalendarStar24Regular,
  Certificate24Regular,
  Globe24Regular
} from '@fluentui/react-icons';

import { MEHFooter } from '../components/layout/MEHFooter';

const useStyles = makeStyles({
  container: {
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground4,
    color: tokens.colorNeutralForeground1,
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden'
  },
  header: {
    ...shorthands.padding('24px', '40px'),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    width: '100%',
    boxSizing: 'border-box',
    zIndex: 10,
    [designTokens.breakpoints.sm]: {
      ...shorthands.padding('20px'),
    }
  },
  headerButton: {
    ...shorthands.border('1px', 'solid', tokens.colorBrandStroke1),
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: tokens.colorBrandBackground2,
      transform: 'translateY(-2px)',
    }
  },
  hero: {
    height: '90vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    ...shorthands.padding('0', '24px'),
    background: `radial-gradient(circle at center, ${tokens.colorBrandBackground2} 0%, ${tokens.colorNeutralBackground4} 80%)`,
    position: 'relative',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: '800px',
    height: '800px',
    background: tokens.colorBrandBackground2,
    filter: 'blur(120px)',
    ...shorthands.borderRadius('50%'),
    opacity: 0.3,
    zIndex: 0,
  },
  heroContent: {
    zIndex: 1,
    maxWidth: '900px',
    animationName: {
      from: { opacity: 0, transform: 'translateY(20px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    animationDuration: '1s',
    animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    animationFillMode: 'forwards',
  },
  title: {
    fontSize: '5.5rem',
    fontWeight: tokens.fontWeightBlack,
    lineHeight: '1.05',
    marginBottom: '32px',
    background: `linear-gradient(to right, ${tokens.colorNeutralForeground1}, ${tokens.colorBrandForeground1})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    [designTokens.breakpoints.sm]: {
      fontSize: '3.5rem',
    }
  },
  subtitle: {
    marginBottom: '80px', 
    opacity: 0.7, 
    fontWeight: tokens.fontWeightRegular,
    maxWidth: '600px',
    marginRight: 'auto',
    marginLeft: 'auto',
  },
  buttonGroup: {
    display: 'flex', 
    ...shorthands.gap('24px'), 
    justifyContent: 'center', 
    flexWrap: 'wrap',
    marginTop: '20px'
  },
  primaryButton: {
    paddingLeft: '48px',
    paddingRight: '48px',
    height: '56px',
    fontSize: tokens.fontSizeBase400,
    boxShadow: `0 8px 16px -4px ${tokens.colorBrandBackground2}`,
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'scale(1.05)',
      boxShadow: `0 12px 24px -6px ${tokens.colorBrandBackground2}`,
    }
  },
  secondaryButton: {
    paddingLeft: '48px',
    paddingRight: '48px',
    height: '56px',
    fontSize: tokens.fontSizeBase400,
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'scale(1.05)',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    }
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    ...shorthands.gap('40px'),
    ...shorthands.padding('100px', '24px'),
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    ...shorthands.padding('48px'),
    ...shorthands.borderRadius('4px'),
    ...shorthands.border('1px', 'solid', 'rgba(255, 255, 255, 0.1)'),
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '20px',
    transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
    cursor: 'default',
    // Forzamos que nada dentro de la tarjeta permita seleccionar texto ni cambie el cursor
    userSelect: 'none',
    '& *': {
      cursor: 'default',
      userSelect: 'none',
      pointerEvents: 'none', 
    },
    zIndex: 1,
    ':hover': {
      transform: 'translateY(-30px) scale(1.05)',
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      ...shorthands.border('3px', 'solid', tokens.colorBrandStroke1),
      boxShadow: `0 50px 100px -20px rgba(0, 0, 0, 0.8), 0 0 40px -10px ${tokens.colorBrandBackground2}`,
      zIndex: 10,
    }
  },
  iconContainer: {
    width: '72px',
    height: '72px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...shorthands.borderRadius('20px'),
    background: `linear-gradient(135deg, ${tokens.colorBrandBackground} 0%, ${tokens.colorBrandBackground2} 100%)`,
    color: 'white',
    marginBottom: '16px',
    boxShadow: `0 8px 16px -4px ${tokens.colorBrandBackground2}`,
    transition: 'transform 0.4s ease',
  }
});

const Landing = () => {
  const styles = useStyles();
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={designTokens.logo} alt="logo" style={{ width: '40px' }} />
          <MEHTypography variant="h3" style={{ fontWeight: tokens.fontWeightBold }}>MEH</MEHTypography>
        </div>
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <MEHButton shape="circular" appearance="outline" className={styles.headerButton}>
            {t('enter_portal')}
          </MEHButton>
        </Link>
      </header>

      <section className={styles.hero}>
        <div className={styles.glow}></div>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>{t('hero_title')}</h1>
          <MEHTypography variant="h3" className={styles.subtitle}>
            {t('hero_subtitle')}
          </MEHTypography>
          <div className={styles.buttonGroup}>
            <MEHButton className={styles.primaryButton}>{t('explore_events')}</MEHButton>
            <MEHButton className={styles.secondaryButton} appearance="outline">{t('learn_more')}</MEHButton>
          </div>
        </div>
      </section>

      <div className={styles.grid}>
        <MEHCard className={styles.featureCard}>
          <div className={styles.iconContainer}>
            <CalendarStar24Regular style={{ fontSize: '32px' }} />
          </div>
          <MEHTypography variant="h3">{t('exclusive_events')}</MEHTypography>
          <MEHTypography style={{ opacity: 0.7 }}>{t('exclusive_events_desc')}</MEHTypography>
        </MEHCard>
        
        <MEHCard className={styles.featureCard}>
          <div className={styles.iconContainer}>
            <Certificate24Regular style={{ fontSize: '32px' }} />
          </div>
          <MEHTypography variant="h3">{t('official_certs')}</MEHTypography>
          <MEHTypography style={{ opacity: 0.7 }}>{t('official_certs_desc')}</MEHTypography>
        </MEHCard>
        
        <MEHCard className={styles.featureCard}>
          <div className={styles.iconContainer}>
            <Globe24Regular style={{ fontSize: '32px' }} />
          </div>
          <MEHTypography variant="h3">{t('global_networking')}</MEHTypography>
          <MEHTypography style={{ opacity: 0.7 }}>{t('global_networking_desc')}</MEHTypography>
        </MEHCard>
      </div>

      <MEHFooter />
    </div>
  );
};

export default Landing;

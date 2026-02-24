import React from 'react';
import { 
  makeStyles, 
  shorthands, 
  Button, 
  Title1, 
  Title3,
  Body1,
  Card
} from '@fluentui/react-components';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { mlsaBrand } from '../theme/theme';

const useStyles = makeStyles({
  container: {
    minHeight: '100vh',
    backgroundColor: '#06020D',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden'
  },
  hero: {
    height: '80vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '0 24px',
    background: 'radial-gradient(circle at center, #2D1350 0%, #06020D 70%)',
    position: 'relative',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: '600px',
    height: '600px',
    background: 'rgba(127, 19, 236, 0.2)',
    filter: 'blur(100px)',
    borderRadius: '50%',
    zIndex: 0,
  },
  heroContent: {
    zIndex: 1,
    maxWidth: '800px',
  },
  title: {
    fontSize: '5rem',
    fontWeight: '900',
    lineHeight: '1.1',
    marginBottom: '24px',
    background: 'linear-gradient(to right, #FFFFFF, #BB8BEA)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    '@media (max-width: 768px)': {
      fontSize: '3rem',
    }
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    ...shorthands.gap('24px'),
    padding: '80px 24px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    ...shorthands.border('1px', 'solid', 'rgba(255, 255, 255, 0.1)'),
    transition: 'transform 0.3s ease',
    ':hover': {
      transform: 'translateY(-10px)',
      ...shorthands.border('1px', 'solid', mlsaBrand[60]),
    }
  }
});

const Landing = () => {
  const styles = useStyles();
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <header style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'absolute', width: '100%', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKJQaXOsKGxxY6IwD5ItPOLwwpdHg4yBkvAPoERkSvClYp9-MzHoDkMz1av3-N7-TRKJBpWPRfvoPUpdyW83amOw_ZMYiH37j3WpBIoW1AfWvKx4m3fwLqT4qByzBoKHHTkrg3UK5r8c5PbrqDVHr_eYRb-FGdyRkmo7YTWOyhCvd8IR4Fj6Vydcsbbp5H_CqhDBAf_hiJ7xDo5qGg2RMCtijfqmrpdolfdClsOR8A3xYnfbBigZXRzm0bd_f1d9GIiktLVwCcWZc" alt="logo" style={{ width: '40px' }} />
          <Title3>MEH Hub</Title3>
        </div>
        <Link to="/dashboard">
          <Button appearance="primary" shape="circular">{t('enter_portal')}</Button>
        </Link>
      </header>

      <section className={styles.hero}>
        <div className={styles.glow}></div>
        <div className={styles.heroContent}>
          <Title1 className={styles.title}>{t('hero_title')}</Title1>
          <Title3 block style={{ marginBottom: '40px', opacity: 0.8 }}>
            {t('hero_subtitle')}
          </Title3>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Button size="large" appearance="primary" style={{ padding: '0 40px' }}>{t('explore_events')}</Button>
            <Button size="large" appearance="outline" style={{ padding: '0 40px' }}>{t('learn_more')}</Button>
          </div>
        </div>
      </section>

      <div className={styles.grid}>
        <Card className={styles.card}>
          <Title3>{t('exclusive_events')}</Title3>
          <Body1>{t('exclusive_events_desc')}</Body1>
        </Card>
        <Card className={styles.card}>
          <Title3>{t('official_certs')}</Title3>
          <Body1>{t('official_certs_desc')}</Body1>
        </Card>
        <Card className={styles.card}>
          <Title3>{t('global_networking')}</Title3>
          <Body1>{t('global_networking_desc')}</Body1>
        </Card>
      </div>

      <footer style={{ padding: '40px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Body1>© 2026 Microsoft Education Hub. {t('all_rights_reserved', { defaultValue: 'Todos los derechos reservados.' })}</Body1>
      </footer>
    </div>
  );
};

export default Landing;

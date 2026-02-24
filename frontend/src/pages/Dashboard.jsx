import React from 'react';
import { 
  Avatar,
  Card,
  CardHeader,
  ProgressBar,
  Body1,
  Caption1,
  Subtitle1,
  Title2,
  makeStyles,
  shorthands,
  tokens,
  Button
} from '@fluentui/react-components';
import { 
  Alert24Regular,
  Search24Regular
} from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { mlsaBrand } from '../theme/theme';

const useStyles = makeStyles({
  container: {
    flexGrow: 1,
    padding: '32px',
    backgroundColor: '#191022',
    minHeight: '100vh',
    overflowY: 'auto',
  },
  header: {
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '32px'
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(10px)',
    ...shorthands.border('1px', 'solid', 'rgba(127, 19, 236, 0.1)'),
    ...shorthands.padding('24px'),
  },
  badgeGlow: {
    filter: 'drop-shadow(0 0 8px rgba(127, 19, 236, 0.4))',
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    ...shorthands.gap('24px'),
    marginBottom: '32px',
  },
  mainGrid: {
    display: 'grid', 
    gridTemplateColumns: '2fr 1fr', 
    gap: '32px',
    '@media (max-width: 1024px)': {
      gridTemplateColumns: '1fr',
    }
  }
});

const Dashboard = () => {
  const styles = useStyles();
  const { t } = useTranslation();
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title2>{t('dashboard')}</Title2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button icon={<Search24Regular />} appearance="subtle" />
          <Button icon={<Alert24Regular />} appearance="subtle" />
          <div style={{ textAlign: 'right' }}>
            <Body1 block style={{ fontWeight: 'bold' }}>Alex Rivera</Body1>
            <Caption1 style={{ color: mlsaBrand[100] }}>{t('milestone_gold')}</Caption1>
          </div>
          <Avatar name="Alex Rivera" badge="active" color="colorful" />
        </div>
      </div>

      <div className={styles.statGrid}>
        <Card className={styles.glassCard} style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'row', gap: '24px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Avatar size={96} name="Alex Rivera" />
            <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', width: '40px' }}>
               <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBm8Id6Q7IQAc8zIFd_EAaBtwwHy2cpnRgt9QWXHouwYHMsHVWf-HTXY2OwMV1brokFpQm5onbPJEMW2WAaDowylSAh3UbXzgjFCKhP1lXTOJEj8HRmxWBpVqaq82fdHufRnWQ8nmgulV4nDp5mv5D3HaCfEVcU5TJqqQO73JgS6piqGTQbVxtfPA-BxfkyZjoxVCiTAR9p5XE6QLNhQsXB5ClUYH1OBczhrYYouwN5jwedn_-hXnfa6EjCMxuUfVnxCpGeWDqqP7Y" alt="badge" className={styles.badgeGlow} style={{ width: '100%' }} />
            </div>
          </div>
          <div>
            <Title2>{t('welcome', { name: 'Alex' })}</Title2>
            <Body1 block style={{ marginTop: '8px', opacity: 0.7 }}>
              Estás a solo 150 puntos de alcanzar el Hito de Platino. ¡Sigue con el excelente trabajo!
            </Body1>
          </div>
        </Card>

        <Card style={{ backgroundColor: mlsaBrand[50], color: 'white', padding: '24px' }}>
           <Caption1 style={{ opacity: 0.8, fontWeight: 'bold' }}>{t('points_activity')}</Caption1>
           <h1 style={{ fontSize: '48px', margin: '8px 0', fontWeight: '900' }}>14,250</h1>
           <div style={{ marginTop: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Caption1 style={{ fontWeight: 'bold' }}>{t('next_milestone')}</Caption1>
                <Caption1 style={{ fontWeight: 'bold' }}>85%</Caption1>
              </div>
              <ProgressBar value={0.85} color="success" />
           </div>
        </Card>
      </div>

      <div className={styles.mainGrid}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <section>
            <Subtitle1 block style={{ marginBottom: '16px' }}>{t('badge_showcase')}</Subtitle1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))', gap: '16px' }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ width: '60px', height: '60px', backgroundColor: 'rgba(127, 19, 236, 0.05)', borderRadius: '50%', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-6XooRD1s0I7oEdf32BgSYwKPEFnbi8Cfje3mpXyOnSsd1R0uIE1JJbiRQ4sg_gWnF4A-7hnH0l-pmxgs1y7a7C5hWV0awsfEOQkBUf1k8XsQAK9tU5oIcCEA8rPYXed8qqs8SvNAxrAUxNdh-A-Fvsxebn8mVEt7DVYZcRGLd4XxatfxJAuutWyoOrIPrpyZQMPHr-6y9tnnOt-_d-YtfOhPbX_xya3RonGS2ajsF7L7vO2Jj9IrwWTWevKYRkYD6P71toXjx5g" alt="badge" style={{ width: '40px' }} className={i > 3 ? '' : styles.badgeGlow} />
                  </div>
                  <Caption1 style={{ opacity: 0.5 }}>{i > 3 ? t('locked') : t('badges')}</Caption1>
                </div>
              ))}
            </div>
          </section>

          <Card className={styles.glassCard}>
            <CardHeader header={<Subtitle1>{t('finances')}</Subtitle1>} action={<Button appearance="primary" size="small">{t('upload_receipt')}</Button>} />
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <Body1>Catering del Meetup de la Comunidad</Body1>
                <Body1 style={{ fontWeight: 'bold' }}>$450.00</Body1>
              </div>
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
           <section>
              <Subtitle1 block style={{ marginBottom: '16px' }}>{t('current_progress')}</Subtitle1>
              <Card className={styles.glassCard} style={{ marginBottom: '16px' }}>
                <Body1 style={{ fontWeight: 'bold' }}>Fundamentos de Azure Cloud</Body1>
                <ProgressBar value={0.72} style={{ marginTop: '12px' }} />
              </Card>
           </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

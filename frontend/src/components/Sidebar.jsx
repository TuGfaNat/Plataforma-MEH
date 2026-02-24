import React from 'react';
import { 
  makeStyles, 
  shorthands, 
  tokens, 
  Body1, 
  Caption1, 
  Card, 
  Button 
} from '@fluentui/react-components';
import { 
  Apps24Filled, 
  Trophy24Regular, 
  Library24Regular, 
  People24Regular,
  Payment24Regular,
  Settings24Regular,
  LocalLanguage24Regular,
  WeatherMoon24Regular,
  WeatherSunny24Regular
} from '@fluentui/react-icons';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { mlsaBrand } from '../theme/theme';
import { useTheme } from '../App';

const useStyles = makeStyles({
  sidebar: {
    width: '280px',
    backgroundColor: tokens.colorNeutralBackground1, // Se adapta al tema
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.borderRight('1px', 'solid', tokens.colorNeutralStroke1),
    padding: '24px',
    height: '100vh',
    position: 'sticky',
    top: 0,
  },
  logoContainer: {
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    marginBottom: '40px'
  },
  logoIcon: {
    width: '40px', 
    height: '40px', 
    background: mlsaBrand[60], 
    borderRadius: '8px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('12px'),
    padding: '12px 16px',
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    textDecorationLine: 'none',
    color: tokens.colorNeutralForeground2,
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      color: mlsaBrand[100],
    }
  },
  navActive: {
    backgroundColor: mlsaBrand[60],
    color: 'white',
    fontWeight: 'bold',
    ':hover': {
      backgroundColor: mlsaBrand[50],
      color: 'white',
    }
  },
  footer: {
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  quickAction: {
    marginTop: '8px', 
    backgroundColor: tokens.colorNeutralBackground2, 
    border: '1px solid ' + mlsaBrand[40],
    padding: '12px',
  },
  controlsRow: {
    display: 'flex',
    gap: '8px',
    padding: '0 8px',
    marginBottom: '8px'
  }
});

const Sidebar = () => {
  const styles = useStyles();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { isDarkMode, toggleTheme } = useTheme();

  const isPath = (path) => location.pathname === path;

  const toggleLanguage = () => {
    const newLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <div className={styles.logoIcon}>
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKJQaXOsKGxxY6IwD5ItPOLwwpdHg4yBkvAPoERkSvClYp9-MzHoDkMz1av3-N7-TRKJBpWPRfvoPUpdyW83amOw_ZMYiH37j3WpBIoW1AfWvKx4m3fwLqT4qByzBoKHHTkrg3UK5r8c5PbrqDVHr_eYRb-FGdyRkmo7YTWOyhCvd8IR4Fj6Vydcsbbp5H_CqhDBAf_hiJ7xDo5qGg2RMCtijfqmrpdolfdClsOR8A3xYnfbBigZXRzm0bd_f1d9GIiktLVwCcWZc" alt="logo" style={{ width: '30px' }} />
        </div>
        <div>
          <Body1 style={{ fontWeight: 'bold' }}>MEH Portal</Body1>
          <Caption1 style={{ color: mlsaBrand[100], letterSpacing: '1px' }}>MICROSOFT EDUCATION</Caption1>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <Link to="/dashboard" className={`${styles.navItem} ${isPath('/dashboard') ? styles.navActive : ''}`}>
          <Apps24Filled /> <span>{t('dashboard')}</span>
        </Link>
        <Link to="#" className={styles.navItem}><Payment24Regular /> <span>{t('finances')}</span></Link>
        <Link to="#" className={styles.navItem}><Trophy24Regular /> <span>{t('badges')}</span></Link>
        <Link to="#" className={styles.navItem}><Library24Regular /> <span>{t('learning_hub')}</span></Link>
        <Link to="#" className={styles.navItem}><People24Regular /> <span>{t('community')}</span></Link>
      </nav>

      <div className={styles.footer}>
        <div className={styles.controlsRow}>
           <Button 
            appearance="subtle" 
            size="small" 
            icon={<LocalLanguage24Regular />}
            onClick={toggleLanguage}
            title="Cambiar Idioma"
           >
            {i18n.language === 'es' ? 'ES' : 'EN'}
           </Button>
           
           <Button 
            appearance="subtle" 
            size="small" 
            icon={isDarkMode ? <WeatherSunny24Regular /> : <WeatherMoon24Regular />}
            onClick={toggleTheme}
            title={isDarkMode ? "Modo Claro" : "Modo Oscuro"}
           >
            {isDarkMode ? "Light" : "Dark"}
           </Button>
        </div>

        <Link to="#" className={styles.navItem}><Settings24Regular /> <span>{t('settings')}</span></Link>
        
        <Card className={styles.quickAction}>
          <Caption1 style={{ color: mlsaBrand[80], fontWeight: 'bold' }}>{t('quick_action')}</Caption1>
          <Button appearance="primary" style={{ width: '100%', marginTop: '8px' }}>{t('upload_receipt')}</Button>
        </Card>
      </div>
    </aside>
  );
};

export default Sidebar;

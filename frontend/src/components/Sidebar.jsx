import React from 'react';
import { 
  makeStyles, 
  shorthands, 
  tokens, 
  Body1,
  Button,
  mergeClasses
} from '@fluentui/react-components';
import { 
  Trophy24Regular, 
  Trophy24Filled,
  Library24Regular, 
  Library24Filled,
  Settings24Regular,
  Settings24Filled,
  Payment24Regular,
  Payment24Filled,
  People24Regular,
  People24Filled,
  ShieldLock24Regular,
  ShieldLock24Filled,
  Home24Regular,
  Home24Filled,
  SignOut24Regular,
  LocalLanguage24Regular,
  WeatherMoon24Regular,
  WeatherSunny24Regular,
  ShieldSettings24Regular,
  ShieldSettings24Filled,
  ReceiptMoney24Regular,
  ReceiptMoney24Filled,
  QrCode24Regular,
  QrCode24Filled,
  MegaphoneLoud24Regular,
  MegaphoneLoud24Filled,
  BookToolbox24Regular,
  BookToolbox24Filled
} from '@fluentui/react-icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { designTokens } from '../theme/theme';
import { useAuth, useTheme } from '../App';
import authService from '../services/authService';

const useStyles = makeStyles({
  sidebar: {
    width: '280px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Fondo más oscuro para el sidebar
    backdropFilter: 'blur(20px)',
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.borderRight('1px', 'solid', tokens.colorNeutralBackground3),
    padding: '32px 16px',
    height: '100vh',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    overflowY: 'auto'
  },
  logoContainer: {
    display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px',
    paddingLeft: '12px', textDecorationLine: 'none', color: 'inherit'
  },
  logoImg: { width: '42px' },
  navSection: { display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 },
  sectionTitle: {
    fontSize: '0.75rem',
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorNeutralForeground4,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: '16px 16px 8px 16px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    ...shorthands.borderRadius('12px'),
    textDecorationLine: 'none',
    color: tokens.colorNeutralForeground2, // Usamos un texto más suave por defecto
    transition: 'all 0.2s',
    cursor: 'pointer',
    ':hover': { 
      backgroundColor: 'rgba(255, 255, 255, 0.05)', 
      color: tokens.colorNeutralForeground1 
    }
  },
  navText: { fontSize: '0.95rem' },
  navActive: { 
    backgroundColor: 'rgba(127, 19, 236, 0.2)', 
    color: tokens.colorBrandForeground1, // El lila claro que definimos
    fontWeight: 'bold'
  },
  footer: { 
    marginTop: 'auto', 
    paddingTop: '24px', 
    ...shorthands.borderTop('1.5px', 'solid', tokens.colorNeutralBackground3),
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  themeToggle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    ...shorthands.padding('8px', '12px'),
    ...shorthands.borderRadius('12px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3),
  }
});

const Sidebar = () => {
  const styles = useStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, setUser } = useAuth();

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };

  const NavItem = ({ to, icon: IconRegular, activeIcon: IconFilled, label }) => {
    const active = location.pathname === to;
    return (
      <Link to={to} className={mergeClasses(styles.navItem, active && styles.navActive)}>
        {active ? <IconFilled /> : <IconRegular />}
        <span className={styles.navText}>{label}</span>
      </Link>
    );
  };

  const isAdmin = user?.rol === 'ADMIN';
  const isOrganizador = user?.rol === 'ORGANIZADOR' || isAdmin;
  const isAmbassador = user?.rol === 'EMBAJADOR' || isOrganizador;

  return (
    <aside className={styles.sidebar}>
      <Link to="/" className={styles.logoContainer}>
        <img src={designTokens.logo} alt="logo" className={styles.logoImg} />
        <Body1 style={{ fontWeight: tokens.fontWeightBlack, color: tokens.colorNeutralForeground1 }}>MEH</Body1>
      </Link>

      <nav className={styles.navSection}>
        <div className={styles.sectionTitle}>{t('menu_personal') || "Mi Espacio"}</div>
        <NavItem to="/dashboard" icon={Home24Regular} activeIcon={Home24Filled} label={t('dashboard') || "Panel de Control"} />
        <NavItem to="/insignias" icon={Trophy24Regular} activeIcon={Trophy24Filled} label={t('badges') || "Insignias"} />
        <NavItem to="/finanzas" icon={Payment24Regular} activeIcon={Payment24Filled} label={t('finances') || "Mis Pagos"} />
        <NavItem to="/learning" icon={Library24Regular} activeIcon={Library24Filled} label={t('learning_hub') || "Centro de Aprendizaje"} />
        <NavItem to="/comunidad" icon={People24Regular} activeIcon={People24Filled} label={t('community') || "Comunidad"} />

        {isAmbassador && (
          <>
            <div className={styles.sectionTitle}>{t('menu_liderazgo') || "Liderazgo"}</div>
            <NavItem to="/recursos-vip" icon={BookToolbox24Regular} activeIcon={BookToolbox24Filled} label={t('ambassador_resources') || "Recursos VIP"} />
            <NavItem to="/speaker-kit" icon={MegaphoneLoud24Regular} activeIcon={MegaphoneLoud24Filled} label={t('speaker_kit') || "Speaker Kit"} />
          </>
        )}

        {isOrganizador && (
          <>
            <div className={styles.sectionTitle}>{t('menu_gestion') || "Gestión"}</div>
            <NavItem to="/admin" icon={ShieldSettings24Regular} activeIcon={ShieldSettings24Filled} label={t('admin_panel') || "Panel Maestro"} />
            <NavItem to="/gestion-pagos" icon={ReceiptMoney24Regular} activeIcon={ReceiptMoney24Filled} label={t('manage_payments') || "Validar Pagos"} />
            <NavItem to="/escaneo-qr" icon={QrCode24Regular} activeIcon={QrCode24Filled} label={t('qr_scan') || "Escaneo QR"} />
          </>
        )}

        {isAdmin && (
          <>
            <div className={styles.sectionTitle}>{t('menu_admin') || "Sistema"}</div>
            <NavItem to="/auditoria" icon={ShieldLock24Regular} activeIcon={ShieldLock24Filled} label={t('audit') || "Auditoría de Logs"} />
          </>
        )}
      </nav>

      <div className={styles.footer}>
        <div className={styles.themeToggle}>
           <Button 
            appearance="subtle" 
            size="small" 
            icon={<LocalLanguage24Regular />}
            onClick={toggleLanguage}
            style={{ color: tokens.colorNeutralForeground1 }}
           >
            {i18n.language === 'es' ? 'ES' : 'EN'}
           </Button>
           
           <Button 
            appearance="subtle" 
            size="small" 
            icon={isDarkMode ? <WeatherSunny24Regular /> : <WeatherMoon24Regular />}
            onClick={toggleTheme}
            style={{ color: tokens.colorNeutralForeground1 }}
           >
            {isDarkMode ? "Light" : "Carbon"}
           </Button>
        </div>

        <NavItem to="/configuracion" icon={Settings24Regular} activeIcon={Settings24Filled} label={t('settings') || "Configuración"} />
        
        <div className={styles.navItem} onClick={handleLogout} style={{ color: tokens.colorPaletteRedForeground1 }}>
          <SignOut24Regular />
          <span className={styles.navText}>{t('logout') || "Cerrar Sesión"}</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

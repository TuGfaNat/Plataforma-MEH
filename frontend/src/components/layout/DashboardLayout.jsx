import React, { useState, useEffect } from 'react';
import { makeStyles, tokens, Button, mergeClasses } from '@fluentui/react-components';
import { Navigation24Filled, Dismiss24Filled } from '@fluentui/react-icons';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar';
import { designTokens } from '../../theme/theme';

const useStyles = makeStyles({
  layout: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground2,
    position: 'relative',
    maxWidth: '100%',
    overflowX: 'hidden',
  },
  sidebarContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    zIndex: 1000,
    transition: 'transform 0.3s ease-in-out',
    [designTokens.breakpoints.sm]: {
      width: '280px',
    },
  },
  sidebarVisible: {
    transform: 'translateX(0)',
  },
  sidebarHidden: {
    transform: 'translateX(-100%)',
    [designTokens.breakpoints.sm]: {
      transform: 'translateX(-100%)',
    },
  },
  sidebarDesktop: {
    position: 'sticky',
    top: 0,
    height: '100vh',
    width: '280px',
    display: 'block',
    [designTokens.breakpoints.sm]: {
      display: 'none',
    },
  },
  content: {
    flexGrow: 1,
    padding: '32px',
    overflowY: 'auto',
    overflowX: 'hidden',
    backgroundColor: tokens.colorNeutralBackground2,
    minHeight: '100vh',
    width: '100%',
    [designTokens.breakpoints.sm]: {
      padding: '16px',
      paddingTop: '70px', // Espacio para el botón de hamburguesa
    },
    // Scrollbar personalizado global
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(127, 19, 236, 0.5) rgba(127, 19, 236, 0.1)',
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'rgba(127, 19, 236, 0.1)',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'rgba(127, 19, 236, 0.5)',
      borderRadius: '4px',
      '&:hover': {
        background: 'rgba(127, 19, 236, 0.7)',
      }
    }
  },
  mobileHeader: {
    display: 'none',
    [designTokens.breakpoints.sm]: {
      display: 'flex',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '60px',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(10px)',
      alignItems: 'center',
      padding: '0 16px',
      zIndex: 900,
      borderBottom: `1px solid ${tokens.colorNeutralBackground3}`,
    }
  },
  overlay: {
    display: 'none',
    [designTokens.breakpoints.sm]: {
      display: 'block',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      zIndex: 950,
    }
  }
});

const DashboardLayout = () => {
  const styles = useStyles();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Cerrar sidebar al cambiar de ruta en móvil
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  return (
    <div className={styles.layout}>
      {/* Desktop Sidebar */}
      <div className={styles.sidebarDesktop}>
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <div className={mergeClasses(
        styles.sidebarContainer,
        isSidebarOpen ? styles.sidebarVisible : styles.sidebarHidden
      )}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
        <Button 
          icon={<Dismiss24Filled />} 
          appearance="subtle" 
          onClick={() => setIsSidebarOpen(false)}
          style={{ position: 'absolute', top: '10px', right: '10px', display: isSidebarOpen ? 'block' : 'none' }}
        />
      </div>

      {/* Overlay para cerrar sidebar al hacer clic fuera */}
      {isSidebarOpen && <div className={styles.overlay} onClick={() => setIsSidebarOpen(false)} />}

      {/* Mobile Header con Hamburguesa */}
      <header className={styles.mobileHeader}>
        <Button 
          icon={<Navigation24Filled />} 
          appearance="subtle" 
          onClick={() => setIsSidebarOpen(true)}
          style={{ color: tokens.colorNeutralForeground1 }}
        />
        <span style={{ marginLeft: '12px', fontWeight: 'bold', color: tokens.colorNeutralForeground1 }}>Plataforma MEH</span>
      </header>

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;

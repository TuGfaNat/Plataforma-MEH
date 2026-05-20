import React, { useState, useEffect } from 'react';
import { makeStyles, tokens, Button, mergeClasses } from '@fluentui/react-components';
import { Navigation24Filled, Dismiss24Filled } from '@fluentui/react-icons';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar';
import { designTokens } from '../../theme/theme';

const useStyles = makeStyles({
  layout: {
    display: 'flex',
    height: '100vh', // Altura fija a la pantalla
    backgroundColor: tokens.colorNeutralBackground2,
    position: 'relative',
    maxWidth: '100%',
    overflow: 'hidden', // Evita scroll global del navegador
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
    width: '280px',
    height: '100vh',
    display: 'block',
    flexShrink: 0,
    [designTokens.breakpoints.sm]: {
      display: 'none',
    },
  },
  content: {
    flexGrow: 1,
    height: '100vh', // Scroll independiente
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '32px',
    backgroundColor: tokens.colorNeutralBackground2,
    [designTokens.breakpoints.sm]: {
      padding: '16px',
      paddingTop: '70px',
    },
    // Scrollbar personalizado para el contenido principal
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(127, 19, 236, 0.3) transparent',
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'rgba(127, 19, 236, 0.3)',
      borderRadius: '10px',
      '&:hover': {
        background: 'rgba(127, 19, 236, 0.5)',
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
      backgroundColor: `color-mix(in srgb, ${tokens.colorNeutralBackground1} 50%, transparent)`,
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

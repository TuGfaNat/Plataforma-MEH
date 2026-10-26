import React, { useState, useEffect, useRef } from 'react';
import { makeStyles, tokens, Button, mergeClasses } from '@fluentui/react-components';
import { Navigation24Filled, Dismiss24Filled, SignOut24Regular } from '@fluentui/react-icons';
import authService from '../../services/authService';
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
      height: '100dvh',
      maxHeight: '100dvh',
      overflow: 'hidden',
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
    minWidth: 0,
    width: '100%',
    boxSizing: 'border-box',
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

const DashboardLayout = ({ children }) => {
  const styles = useStyles();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const mobileSidebarRef = useRef(null);

  // Cerrar sidebar al cambiar de ruta en móvil
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location?.pathname]);

  // Cerrar drawer móvil con la tecla Escape
  useEffect(() => {
    if (!isSidebarOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

  // Focus trap en drawer móvil cuando está abierto
  useEffect(() => {
    if (isSidebarOpen && mobileSidebarRef.current) {
      const focusable = mobileSidebarRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) {
        focusable[0].focus();
      }

      const handleTrap = (e) => {
        if (e.key !== 'Tab') return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      window.addEventListener('keydown', handleTrap);
      return () => window.removeEventListener('keydown', handleTrap);
    }
  }, [isSidebarOpen]);

  return (
    <div className={styles.layout}>
      {/* Desktop Sidebar */}
      <div className={styles.sidebarDesktop}>
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <div 
        ref={mobileSidebarRef}
        role="dialog"
        aria-modal={isSidebarOpen ? "true" : undefined}
        aria-label="Menú de navegación móvil"
        aria-hidden={!isSidebarOpen}
        className={mergeClasses(
          styles.sidebarContainer,
          isSidebarOpen ? styles.sidebarVisible : styles.sidebarHidden
        )}
      >
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
        <Button 
          icon={<Dismiss24Filled />} 
          appearance="subtle" 
          aria-label="Cerrar menú"
          onClick={() => setIsSidebarOpen(false)}
          style={{ position: 'absolute', top: '10px', right: '10px', display: isSidebarOpen ? 'block' : 'none' }}
        />
      </div>

      {/* Overlay para cerrar sidebar al hacer clic fuera */}
      {isSidebarOpen && (
        <div 
          className={styles.overlay} 
          role="presentation"
          aria-hidden="true"
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* Mobile Header con Hamburguesa y Botón Rápido de Salir */}
      <header className={styles.mobileHeader} style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button 
            icon={<Navigation24Filled />} 
            appearance="subtle" 
            aria-label="Abrir menú de navegación"
            aria-expanded={isSidebarOpen}
            onClick={() => setIsSidebarOpen(true)}
            style={{ color: tokens.colorNeutralForeground1 }}
          />
          <span style={{ marginLeft: '10px', fontWeight: 'bold', color: tokens.colorNeutralForeground1 }}>Plataforma MEH</span>
        </div>
        <Button
          icon={<SignOut24Regular style={{ color: tokens.colorPaletteRedForeground1 }} />}
          appearance="subtle"
          size="small"
          aria-label="Cerrar Sesión"
          title="Cerrar Sesión"
          onClick={() => {
            authService.logout();
            window.location.href = '/login';
          }}
        />
      </header>

      <main className={styles.content}>
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default DashboardLayout;

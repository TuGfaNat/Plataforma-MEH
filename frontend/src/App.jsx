import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  FluentProvider, 
  makeStyles
} from '@fluentui/react-components';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { mlsaDarkTheme, mlsaLightTheme } from './theme/theme';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Sidebar from './components/Sidebar.jsx';

// Contexto para el tema para poder cambiarlo desde cualquier componente
const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

const useStyles = makeStyles({
  dashboardLayout: {
    display: 'flex',
    minHeight: '100vh',
  },
});

const MainLayout = ({ children }) => {
  const styles = useStyles();
  return (
    <div className={styles.dashboardLayout}>
      <Sidebar />
      {children}
    </div>
  );
};

function App() {
  // Estado inicial desde localStorage o por defecto 'dark'
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <FluentProvider theme={isDarkMode ? mlsaDarkTheme : mlsaLightTheme}>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route 
              path="/dashboard" 
              element={
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </FluentProvider>
    </ThemeContext.Provider>
  );
}

export default App;

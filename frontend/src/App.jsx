import React, { useState, useEffect, createContext, useContext } from 'react';
import { FluentProvider } from '@fluentui/react-components';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { mlsaDarkTheme, mlsaLightTheme } from './theme/theme';
import authService from './services/authService';

// Páginas
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Auditoria from './pages/Auditoria.jsx';
import Insignias from './pages/Insignias.jsx';
import Finanzas from './pages/Finanzas.jsx';
import LearningHub from './pages/LearningHub.jsx';
import Comunidad from './pages/Comunidad.jsx';
import Configuracion from './pages/Configuracion.jsx';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const userData = await authService.getMe();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, setUser, checkAuth }}>
      <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
        <FluentProvider theme={isDarkMode ? mlsaDarkTheme : mlsaLightTheme}>
          <Router>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/insignias" element={<ProtectedRoute><Insignias /></ProtectedRoute>} />
              <Route path="/finanzas" element={<ProtectedRoute><Finanzas /></ProtectedRoute>} />
              <Route path="/learning" element={<ProtectedRoute><LearningHub /></ProtectedRoute>} />
              <Route path="/comunidad" element={<ProtectedRoute><Comunidad /></ProtectedRoute>} />
              <Route path="/configuracion" element={<ProtectedRoute><Configuracion /></ProtectedRoute>} />
              <Route path="/auditoria" element={<ProtectedRoute><Auditoria /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </FluentProvider>
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;

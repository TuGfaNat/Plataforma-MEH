import React, { useState, useEffect, createContext, useContext } from 'react';
import { FluentProvider } from '@fluentui/react-components';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { GoogleOAuthProvider } from '@react-oauth/google'; // Desactivado temporalmente
import { mlsaDarkTheme, mlsaLightTheme } from './theme/theme';
import authService from './services/authService';

// Páginas
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Auditoria from './pages/Auditoria.jsx';
import Insignias from './pages/Insignias.jsx';
import Finanzas from './pages/Finanzas.jsx';
import LearningHub from './pages/LearningHub.jsx';
import Comunidad from './pages/Comunidad.jsx';
import Configuracion from './pages/Configuracion.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import GestionPagos from './pages/GestionPagos.jsx';
import EscaneoQR from './pages/EscaneoQR.jsx';
import RecursosVIP from './pages/RecursosVIP.jsx';
import VerificarCertificado from './pages/VerificarCertificado.jsx';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const token = localStorage.getItem('token');
  
  if (loading) return null;
  if (!token) return <Navigate to="/login" replace />;
  
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/dashboard" replace />;
  }
  
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
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // NOTA: Para reactivar Google, descomentar GoogleOAuthProvider y envolver el retorno
  return (
    <AuthContext.Provider value={{ user, setUser, checkAuth, loading }}>
      <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
        <FluentProvider theme={isDarkMode ? mlsaDarkTheme : mlsaLightTheme}>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              {/* Rutas Públicas */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verificar/:uuid" element={<VerificarCertificado />} />
              
              {/* Rutas Protegidas */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/insignias" element={<ProtectedRoute><Insignias /></ProtectedRoute>} />
              <Route path="/finanzas" element={<ProtectedRoute><Finanzas /></ProtectedRoute>} />
              <Route path="/learning" element={<ProtectedRoute><LearningHub /></ProtectedRoute>} />
              <Route path="/comunidad" element={<ProtectedRoute><Comunidad /></ProtectedRoute>} />
              <Route path="/configuracion" element={<ProtectedRoute><Configuracion /></ProtectedRoute>} />
              
              <Route path="/recursos-vip" element={
                <ProtectedRoute allowedRoles={['EMBAJADOR', 'ORGANIZADOR', 'ADMIN']}>
                  <RecursosVIP />
                </ProtectedRoute>
              } />

              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'ORGANIZADOR']}>
                  <AdminPanel />
                </ProtectedRoute>
              } />
              <Route path="/gestion-pagos" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'ORGANIZADOR']}>
                  <GestionPagos />
                </ProtectedRoute>
              } />
              <Route path="/escaneo-qr" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'ORGANIZADOR']}>
                  <EscaneoQR />
                </ProtectedRoute>
              } />

              <Route path="/auditoria" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Auditoria />
                </ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </FluentProvider>
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;

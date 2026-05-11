import React, { useState, useEffect, createContext, useContext } from 'react';
import { FluentProvider, Toaster, useId, useToastController, Toast, ToastTitle, ToastBody } from '@fluentui/react-components';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { mlsaDarkTheme, mlsaLightTheme } from './theme/theme';
import authService from './services/authService';
import { hasAnyRole } from './auth/rbac';

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
import SpeakerKit from './pages/SpeakerKit.jsx';
import VerificarCertificado from './pages/VerificarCertificado.jsx';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

const NotificationContext = createContext();
export const useNotify = () => useContext(NotificationContext);

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const token = localStorage.getItem('token');
  
  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
      <Spinner size="huge" label="Iniciando Plataforma MEH..." />
    </div>
  );
  if (!token) return <Navigate to="/login" replace />;
  if (!user) return <Navigate to="/login" replace />;
  
  if (allowedRoles.length > 0 && !hasAnyRole(user.rol, allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // TEMA PERSISTENTE (LOCAL + API)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });

  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);

  const notify = (title, message, intent = "info") => {
    dispatchToast(
      <Toast>
        <ToastTitle>{title}</ToastTitle>
        <ToastBody>{message}</ToastBody>
      </Toast>,
      { intent }
    );
  };

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const userData = await authService.getMe();
        if (userData) {
          setUser(userData);
          // Sincronizar tema con la preferencia de la DB si existe
          if (userData.preferencia_tema) {
              setIsDarkMode(userData.preferencia_tema === 'dark');
          }
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Auth error:", err);
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Guardar en local storage para persistencia antes del login
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    // Si hay usuario, guardar en la API para persistencia total
    if (user) {
        try {
            await authService.updateMe({ preferencia_tema: newMode ? 'dark' : 'light' });
        } catch (err) {
            console.error("No se pudo guardar la preferencia de tema en el servidor");
        }
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, checkAuth, loading }}>
      <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
        <NotificationContext.Provider value={{ notify }}>
            <FluentProvider theme={isDarkMode ? mlsaDarkTheme : mlsaLightTheme}>
            <Toaster toasterId={toasterId} />
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verificar/:uuid" element={<VerificarCertificado />} />
                
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/insignias" element={<ProtectedRoute><Insignias /></ProtectedRoute>} />
                <Route path="/finanzas" element={<ProtectedRoute><Finanzas /></ProtectedRoute>} />
                <Route path="/learning" element={<ProtectedRoute><LearningHub /></ProtectedRoute>} />
                <Route path="/comunidad" element={<ProtectedRoute><Comunidad /></ProtectedRoute>} />
                <Route path="/configuracion" element={<ProtectedRoute><Configuracion /></ProtectedRoute>} />
                
                <Route path="/recursos-vip" element={
                    <ProtectedRoute allowedRoles={['EMBAJADOR', 'MODERADOR', 'ORGANIZADOR', 'ADMIN']}>
                    <RecursosVIP />
                    </ProtectedRoute>
                } />
                <Route path="/speaker-kit" element={
                    <ProtectedRoute allowedRoles={['MODERADOR', 'ORGANIZADOR', 'ADMIN']}>
                    <SpeakerKit />
                    </ProtectedRoute>
                } />

                <Route path="/admin" element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'ORGANIZADOR', 'SOPORTE']}>
                    <AdminPanel />
                    </ProtectedRoute>
                } />
                <Route path="/gestion-pagos" element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'ORGANIZADOR', 'SOPORTE']}>
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
        </NotificationContext.Provider>
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;

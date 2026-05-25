import React, { useState, useEffect, createContext, useContext } from 'react';
import { FluentProvider, Toaster, useId, useToastController, Toast, ToastTitle, ToastBody, Spinner } from '@fluentui/react-components';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { themes } from './theme/theme';
import authService from './services/authService';
import { hasAnyRole } from './auth/rbac';

// Páginas
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';
import EventsMaster from './pages/EventsMaster.jsx';
import Users from './pages/Users.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
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
import ValidadorTalento from './pages/ValidadorTalento.jsx';
import Analytics from './pages/Admin/Analytics.jsx';
import GeneradorCertificados from './pages/Admin/GeneradorCertificados.jsx';
import EcosystemDirectory from './pages/Admin/EcosystemDirectory.jsx';
import NotificacionesAdmin from './pages/NotificacionesAdmin.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';
import CursoAula from './pages/CursoAula.jsx';

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

// Componente para manejar la verificación tanto pública como privada
const UniversalVerification = () => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
      <Spinner size="huge" label="Verificando sesión..." />
    </div>
  );

  if (user) {
    return (
      <DashboardLayout>
        <VerificarCertificado />
      </DashboardLayout>
    );
  }

  return <VerificarCertificado />;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // TEMA PERSISTENTE (LOCAL + API)
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme && themes[savedTheme] ? savedTheme : 'dark';
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
          if (userData.preferencia_tema && themes[userData.preferencia_tema]) {
              setCurrentTheme(userData.preferencia_tema);
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
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  const toggleTheme = async () => {
    const themeKeys = Object.keys(themes);
    const currentIndex = themeKeys.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    const nextTheme = themeKeys[nextIndex];
    
    setCurrentTheme(nextTheme);
    
    // Si hay usuario, guardar en la API para persistencia total
    if (user) {
        try {
            await authService.updateMe({ preferencia_tema: nextTheme });
        } catch (err) {
            console.error("No se pudo guardar la preferencia de tema en el servidor");
        }
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, checkAuth, loading }}>
      <ThemeContext.Provider value={{ currentTheme, toggleTheme, setCurrentTheme }}>
        <NotificationContext.Provider value={{ notify }}>
            <FluentProvider theme={themes[currentTheme] || themes.dark}>
            <Toaster toasterId={toasterId} />
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verificar/:uuid" element={<UniversalVerification />} />
                
                {/* Validador Público (Sin Sidebar) */}
                <Route path="/validador-publico" element={<ValidadorTalento />} />
                
                {/* Rutas con Sidebar Persistente */}
                <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/validador" element={<ValidadorTalento />} />
                  <Route path="/dashboard/users" element={<ProtectedRoute allowedRoles={['ADMIN', 'ORGANIZADOR', 'SOPORTE']}><Users /></ProtectedRoute>} />
                  <Route path="/dashboard/events-master" element={<ProtectedRoute allowedRoles={['ADMIN', 'ORGANIZADOR']}><EventsMaster /></ProtectedRoute>} />
                  <Route path="/dashboard/analytics" element={<ProtectedRoute allowedRoles={['ADMIN', 'ORGANIZADOR']}><Analytics /></ProtectedRoute>} />
                  
                  <Route path="/insignias" element={<Insignias />} />
                  <Route path="/finanzas" element={<Finanzas />} />
                  <Route path="/learning" element={<LearningHub />} />
                  <Route path="/learning/curso/:idCurso" element={<CursoAula />} />
                  <Route path="/comunidad" element={<Comunidad />} />
                  <Route path="/configuracion" element={<Configuracion />} />
                  
                  <Route path="/recursos-vip" element={<ProtectedRoute allowedRoles={['ADMIN', 'ORGANIZADOR', 'MODERADOR', 'EMBAJADOR']}><RecursosVIP /></ProtectedRoute>} />
                  <Route path="/speaker-kit" element={<ProtectedRoute allowedRoles={['ADMIN', 'ORGANIZADOR', 'MODERADOR']}><SpeakerKit /></ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN', 'ORGANIZADOR', 'MODERADOR']}><AdminPanel /></ProtectedRoute>} />
                  <Route path="/admin/ecosistema" element={<ProtectedRoute allowedRoles={['ADMIN', 'ORGANIZADOR']}><EcosystemDirectory /></ProtectedRoute>} />
                  <Route path="/admin/generador-certificados" element={<ProtectedRoute allowedRoles={['ADMIN', 'ORGANIZADOR', 'MODERADOR']}><GeneradorCertificados /></ProtectedRoute>} />
                  <Route path="/admin/notificaciones" element={<ProtectedRoute allowedRoles={['ADMIN', 'ORGANIZADOR', 'MODERADOR']}><NotificacionesAdmin /></ProtectedRoute>} />
                  <Route path="/gestion-pagos" element={<ProtectedRoute allowedRoles={['ADMIN', 'ORGANIZADOR', 'SOPORTE']}><GestionPagos /></ProtectedRoute>} />
                  <Route path="/escaneo-qr" element={<ProtectedRoute allowedRoles={['ADMIN', 'ORGANIZADOR']}><EscaneoQR /></ProtectedRoute>} />
                  <Route path="/auditoria" element={<ProtectedRoute allowedRoles={['ADMIN']}><Auditoria /></ProtectedRoute>} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
            </FluentProvider>
        </NotificationContext.Provider>
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}

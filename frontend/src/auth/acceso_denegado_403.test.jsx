import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FluentProvider, webDarkTheme } from '@fluentui/react-components';

import AccesoDenegado from '../pages/AccesoDenegado';
import api from '../services/api';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/acceso-denegado' }),
  Navigate: ({ to }) => <div data-testid="mock-navigate" data-to={to} />
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key
  })
}));

const renderWithProvider = (ui) => {
  return render(
    <FluentProvider theme={webDarkTheme}>
      {ui}
    </FluentProvider>
  );
};

describe('MEH-009: Manejo de 403 y Pantalla de Acceso Denegado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. AccesoDenegado renderiza encabezado explícito "Acceso Denegado" y badge de Error 403', () => {
    renderWithProvider(<AccesoDenegado />);

    // Verifica que no quede en pantalla en blanco y muestre "Acceso Denegado"
    const heading = screen.getByRole('heading', { level: 1, name: /Acceso Denegado/i });
    expect(heading).toBeInTheDocument();

    // Verifica badge de 403
    expect(screen.getByText(/Error 403/i)).toBeInTheDocument();

    // Verifica mensaje explicativo para el usuario
    expect(screen.getByText(/No tienes los permisos o el rol requerido/i)).toBeInTheDocument();
  });

  it('2. AccesoDenegado incluye botones de retorno funcionales al Dashboard y al Inicio', () => {
    renderWithProvider(<AccesoDenegado />);

    const btnDashboard = screen.getByRole('button', { name: /Volver al Dashboard/i });
    expect(btnDashboard).toBeInTheDocument();
    fireEvent.click(btnDashboard);
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');

    const btnInicio = screen.getByRole('button', { name: /Ir al Inicio público/i });
    expect(btnInicio).toBeInTheDocument();
    fireEvent.click(btnInicio);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('3. Interceptor Axios de api.js redirige a /acceso-denegado ante respuestas HTTP 403', async () => {
    // Simular error 403 desde una llamada de API
    const error403 = {
      response: {
        status: 403,
        data: { detail: 'Acceso denegado: permisos insuficientes' }
      }
    };

    // Guardar referencia al location original
    const originalLocation = window.location;
    delete window.location;
    window.location = {
      pathname: '/auditoria',
      href: 'http://localhost:5173/auditoria'
    };

    try {
      // Obtener el interceptor de rechazo de response
      const responseInterceptor = api.interceptors.response.handlers[0].rejected;
      
      await expect(responseInterceptor(error403)).rejects.toEqual(error403);
      expect(window.location.href).toBe('/acceso-denegado');
    } finally {
      window.location = originalLocation;
    }
  });
});

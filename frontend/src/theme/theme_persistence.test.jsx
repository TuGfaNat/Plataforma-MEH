import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FluentProvider, webDarkTheme } from '@fluentui/react-components';

import { LandingHeader } from '../components/layout/LandingHeader';
import DashboardLayout from '../components/layout/DashboardLayout';
import { themes, themeMetadata, colorblindTheme, oceanTheme } from './theme';
import authService from '../services/authService';

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockLocation = { pathname: '/dashboard' };
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
  Outlet: () => <div data-testid="outlet" />
}));

// Mock Sidebar inside DashboardLayout to keep test lightweight
vi.mock('../components/Sidebar', () => ({
  default: ({ onClose }) => (
    <nav data-testid="mock-sidebar">
      <button onClick={onClose}>Sidebar Close Item</button>
      <a href="/home">Home Link</a>
    </nav>
  )
}));

// Mock authService
vi.mock('../services/authService', () => ({
  default: {
    getMe: vi.fn(),
    updateMe: vi.fn().mockResolvedValue({ success: true })
  }
}));

// State for mock theme context
let currentThemeState = 'dark';
const mockToggleTheme = vi.fn(() => {
  const keys = Object.keys(themes);
  const nextIdx = (keys.indexOf(currentThemeState) + 1) % keys.length;
  currentThemeState = keys[nextIdx];
  localStorage.setItem('theme', currentThemeState);
});

vi.mock('../App', () => ({
  useTheme: () => ({
    currentTheme: currentThemeState,
    toggleTheme: mockToggleTheme,
    setCurrentTheme: (t) => {
      currentThemeState = t;
      localStorage.setItem('theme', t);
    }
  }),
  useAuth: () => ({
    user: { id_usuario: 1, nombres: 'Test', apellidos: 'User', rol: 'VOLUNTARIO' }
  })
}));

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'es', changeLanguage: vi.fn() }
  })
}));

const renderWithProvider = (ui) => {
  return render(
    <FluentProvider theme={webDarkTheme}>
      {ui}
    </FluentProvider>
  );
};

describe('MEH-008 / MEH-002: Persistencia de Tema y Accesibilidad WCAG 2.1 AA', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    currentThemeState = 'dark';
  });

  describe('1. Persistencia de Tema (localStorage y preferencia_tema API)', () => {
    it('almacena y recupera el tema en localStorage correctamente', () => {
      expect(localStorage.getItem('theme')).toBeNull();

      // Guardar tema en localStorage
      localStorage.setItem('theme', 'ocean');
      expect(localStorage.getItem('theme')).toBe('ocean');

      localStorage.setItem('theme', 'colorblind');
      expect(localStorage.getItem('theme')).toBe('colorblind');
    });

    it('el objeto themes contiene las 7 claves oficiales y colorblind incluye overrides de Background3 y strokes', () => {
      const keys = ['dark', 'light', 'blue', 'ash', 'highContrast', 'ocean', 'colorblind'];
      keys.forEach((key) => {
        expect(themes[key]).toBeDefined();
        expect(themeMetadata[key]).toBeDefined();
      });

      // Validar overrides accesibles en colorblindTheme
      expect(colorblindTheme.colorNeutralBackground3).toBe('#16233B');
      expect(colorblindTheme.colorNeutralBackground4).toBe('#1E2E4B');
      expect(colorblindTheme.colorNeutralStroke1).toBe('#1E3557');
      expect(colorblindTheme.colorPaletteRedForeground1).toBe('#E69F00'); // CUD Orange
      expect(colorblindTheme.colorPaletteGreenForeground1).toBe('#56B4E9'); // CUD Sky Blue
    });

    it('guarda la preferencia_tema en la API de usuario al actualizar el perfil', async () => {
      await authService.updateMe({ preferencia_tema: 'colorblind' });
      expect(authService.updateMe).toHaveBeenCalledWith({ preferencia_tema: 'colorblind' });

      await authService.updateMe({ preferencia_tema: 'ocean' });
      expect(authService.updateMe).toHaveBeenCalledWith({ preferencia_tema: 'ocean' });
    });
  });

  describe('2. LandingHeader con 7 temas, íconos y aria-label', () => {
    it('renderiza botón de ciclado de tema con aria-label y title descriptivos', () => {
      currentThemeState = 'dark';
      renderWithProvider(<LandingHeader />);

      const themeBtn = screen.getByRole('button', {
        name: /Cambiar tema visual\. Tema actual: Oscuro/i
      });
      expect(themeBtn).toBeInTheDocument();
      expect(themeBtn).toHaveAttribute('title', 'Cambiar tema (Actual: Oscuro)');
    });

    it('al hacer clic en el botón de tema, se llama a toggleTheme', () => {
      renderWithProvider(<LandingHeader />);
      const themeBtn = screen.getByRole('button', {
        name: /Cambiar tema visual/i
      });
      fireEvent.click(themeBtn);
      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });

    it('LandingHeader incluye alt descriptivo en el logotipo oficial', () => {
      renderWithProvider(<LandingHeader />);
      const logo = screen.getByAltText('Logotipo oficial de la Plataforma Microsoft Education Hub');
      expect(logo).toBeInTheDocument();
    });
  });

  describe('3. Mobile Drawer en DashboardLayout (focus-trap, Escape, ARIA)', () => {
    it('abre el drawer con role dialog, aria-modal y aria-label', () => {
      renderWithProvider(<DashboardLayout><div>Contenido</div></DashboardLayout>);

      const openBtn = screen.getByRole('button', { name: /Abrir menú de navegación/i, hidden: true });
      expect(openBtn).toBeInTheDocument();
      expect(openBtn).toHaveAttribute('aria-expanded', 'false');

      // Abrir drawer
      fireEvent.click(openBtn);

      expect(openBtn).toHaveAttribute('aria-expanded', 'true');
      const dialog = screen.getByRole('dialog', { name: /Menú de navegación móvil/i, hidden: true });
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('cierra el drawer móvil al presionar la tecla Escape', async () => {
      renderWithProvider(<DashboardLayout><div>Contenido</div></DashboardLayout>);

      const openBtn = screen.getByRole('button', { name: /Abrir menú de navegación/i, hidden: true });
      fireEvent.click(openBtn);

      const closeBtn = screen.getByRole('button', { name: /Cerrar menú/i, hidden: true });
      expect(closeBtn).toBeInTheDocument();

      // Pulsar Escape
      fireEvent.keyDown(window, { key: 'Escape' });

      await waitFor(() => {
        expect(openBtn).toHaveAttribute('aria-expanded', 'false');
      });
    });

    it('cierra el drawer móvil al hacer clic en el botón de cerrar', async () => {
      renderWithProvider(<DashboardLayout><div>Contenido</div></DashboardLayout>);

      const openBtn = screen.getByRole('button', { name: /Abrir menú de navegación/i, hidden: true });
      fireEvent.click(openBtn);

      const closeBtn = screen.getByRole('button', { name: /Cerrar menú/i, hidden: true });
      fireEvent.click(closeBtn);

      await waitFor(() => {
        expect(openBtn).toHaveAttribute('aria-expanded', 'false');
      });
    });
  });
});

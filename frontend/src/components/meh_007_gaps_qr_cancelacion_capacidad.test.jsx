import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FluentProvider, webDarkTheme } from '@fluentui/react-components';

import Dashboard from '../pages/Dashboard';
import Finanzas from '../pages/Finanzas';
import eventoService from '../services/eventoService';
import dashboardService from '../services/dashboardService';
import comunidadService from '../services/comunidadService';
import pagoService from '../services/pagoService';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

// Mock subcomponents in Dashboard to keep tests focused and fast
vi.mock('../components/DashboardAnalytics', () => ({
  default: () => <div data-testid="dashboard-analytics" />
}));

vi.mock('../components/BadgeDetailModal', () => ({
  default: ({ trigger }) => <div>{trigger}</div>
}));

vi.mock('../components/BadgeSocialModal', () => ({
  default: () => null
}));

vi.mock('../components/InscripcionEventoModal', () => ({
  default: () => <button>Inscribirse</button>
}));

// Mock offlineDb
vi.mock('../utils/offlineDb', () => ({
  obtenerColaAsistencia: vi.fn().mockResolvedValue([]),
  validarQROffline: vi.fn().mockResolvedValue({ success: true }),
  abrirDB: vi.fn(),
  guardarInscritos: vi.fn().mockResolvedValue(true),
  eliminarDeCola: vi.fn().mockResolvedValue(true)
}));

// Mock services
vi.mock('../services/eventoService', () => ({
  default: {
    getEventos: vi.fn(),
    getMisInscripciones: vi.fn(),
    inscribirse: vi.fn(),
    cancelarInscripcion: vi.fn()
  }
}));

vi.mock('../services/dashboardService', () => ({
  default: {
    getStats: vi.fn()
  }
}));

vi.mock('../services/comunidadService', () => ({
  default: {
    getAnuncios: vi.fn()
  }
}));

vi.mock('../services/pagoService', () => ({
  default: {
    getMisPagos: vi.fn(),
    getAllPagos: vi.fn(),
    getHistorialPagos: vi.fn(),
    getEventPaymentPackages: vi.fn(),
    uploadComprobanteOcr: vi.fn()
  }
}));

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  },
  resolveApiFileUrl: (url) => (url ? `http://localhost:8000${url}` : null)
}));

const mockUser = { id_usuario: 1, rol: 'VOLUNTARIO', nombre: 'Test User' };
const mockNotify = vi.fn();
vi.mock('../App', () => ({
  useAuth: () => ({
    user: mockUser
  }),
  useNotify: () => ({
    notify: mockNotify
  })
}));

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

describe('MEH-007: Cierre de gaps MEH-001 (QR externo, Cancelación UI, Capacidad NULL)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Gap 1: QR Bancario 100% Local (sin api.qrserver.com)', () => {
    it('Finanzas no realiza peticiones a api.qrserver.com', async () => {
      eventoService.getMisInscripciones.mockResolvedValue([]);
      pagoService.getMisPagos.mockResolvedValue([]);
      pagoService.getEventPaymentPackages.mockResolvedValue([]);

      const { container } = renderWithProvider(<Finanzas />);

      await waitFor(() => {
        expect(screen.getByText('Historial de Transacciones')).toBeInTheDocument();
      });

      // Criterio de Aceptación: CERO referencias a api.qrserver.com en todo el DOM renderizado
      const allImgs = container.querySelectorAll('img');
      allImgs.forEach((img) => {
        expect(img.getAttribute('src') || '').not.toContain('api.qrserver.com');
      });
      expect(container.innerHTML).not.toContain('api.qrserver.com');
    });
  });

  describe('Gap 2: Cancelación de inscripción desde UI en Dashboard', () => {
    const mockEventos = [
      {
        id_evento: 1,
        titulo: 'Taller IA & Robótica',
        estado: 'PROGRAMADO',
        fecha_inicio: '2026-11-01T10:00:00',
        modalidad: 'Presencial'
      },
      {
        id_evento: 2,
        titulo: 'Hackathon MEH 2026',
        estado: 'PROGRAMADO',
        fecha_inicio: '2026-11-05T10:00:00',
        modalidad: 'Virtual'
      },
      {
        id_evento: 3,
        titulo: 'Seminario Cloud',
        estado: 'PROGRAMADO',
        fecha_inicio: '2026-11-10T10:00:00',
        modalidad: 'Presencial'
      }
    ];

    const mockStats = {
      personal_stats: {
        eventos_asistidos: 2,
        eventos_esperados: 10,
        progreso_promedio: 20,
        ultimas_insignias: []
      }
    };

    beforeEach(() => {
      eventoService.getEventos.mockResolvedValue(mockEventos);
      dashboardService.getStats.mockResolvedValue(mockStats);
      comunidadService.getAnuncios.mockResolvedValue([]);
    });

    it('permite cancelar una inscripción en estado PENDIENTE_APROBACION con diálogo de confirmación', async () => {
      eventoService.getMisInscripciones.mockResolvedValue([
        {
          id_inscripcion: 501,
          id_evento: 1,
          titulo_evento: 'Taller IA & Robótica',
          estado_inscripcion: 'PENDIENTE_APROBACION'
        }
      ]);
      eventoService.cancelarInscripcion.mockResolvedValue({ message: 'Inscripción cancelada' });

      renderWithProvider(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('En lista de espera')).toBeInTheDocument();
      });

      const cancelarBtn = screen.getByRole('button', { name: /^cancelar$/i });
      expect(cancelarBtn).toBeInTheDocument();

      // Clic en Cancelar para abrir diálogo modal
      fireEvent.click(cancelarBtn);

      await waitFor(() => {
        expect(screen.getByText(/¿Estás seguro de que deseas cancelar tu inscripción/i)).toBeInTheDocument();
      });

      // Confirmar cancelación
      const confirmarBtn = await screen.findByRole('button', { 
        name: /(?:sí, )?cancelar inscripci[óo]n/i,
        hidden: true 
      });
      fireEvent.click(confirmarBtn);

      await waitFor(() => {
        expect(eventoService.cancelarInscripcion).toHaveBeenCalledWith(501);
      });

      expect(mockNotify).toHaveBeenCalledWith(
        'Inscripción Cancelada',
        expect.stringContaining('El cupo ha sido liberado'),
        'success'
      );
    });

    it('permite cancelar una inscripción en estado PENDIENTE de pago', async () => {
      eventoService.getMisInscripciones.mockResolvedValue([
        {
          id_inscripcion: 502,
          id_evento: 2,
          titulo_evento: 'Hackathon MEH 2026',
          estado_inscripcion: 'PENDIENTE'
        }
      ]);
      eventoService.cancelarInscripcion.mockResolvedValue({ message: 'Inscripción cancelada' });

      renderWithProvider(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Pendiente pago')).toBeInTheDocument();
      });

      const pagarBtn = screen.getByRole('button', { name: /pagar/i });
      expect(pagarBtn).toBeInTheDocument();

      const cancelarBtn = screen.getByRole('button', { name: /^cancelar$/i });
      expect(cancelarBtn).toBeInTheDocument();

      fireEvent.click(cancelarBtn);

      await waitFor(() => {
        expect(screen.getByText(/Esta acción liberará tu cupo inmediatamente/i)).toBeInTheDocument();
      });

      const confirmarBtn = await screen.findByRole('button', { 
        name: /(?:sí, )?cancelar inscripci[óo]n/i,
        hidden: true 
      });
      fireEvent.click(confirmarBtn);

      await waitFor(() => {
        expect(eventoService.cancelarInscripcion).toHaveBeenCalledWith(502);
      });
    });

    it('NO muestra botón de cancelar para inscripciones CONFIRMADA', async () => {
      eventoService.getMisInscripciones.mockResolvedValue([
        {
          id_inscripcion: 503,
          id_evento: 3,
          titulo_evento: 'Seminario Cloud',
          estado_inscripcion: 'CONFIRMADA',
          codigo_qr: 'QR-CONFIRMADO-503'
        }
      ]);

      renderWithProvider(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /mi qr/i })).toBeInTheDocument();
      });

      // Criterio de Aceptación: CONFIRMADA no cancelable desde la UI
      expect(screen.queryByRole('button', { name: /^cancelar$/i })).not.toBeInTheDocument();
    });
  });
});

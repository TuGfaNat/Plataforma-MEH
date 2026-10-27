import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FluentProvider, webDarkTheme } from '@fluentui/react-components';

import ImprimirLista from './ImprimirLista';
import LlegadasEventoChart from './LlegadasEventoChart';
import BadgeSocialModal from './BadgeSocialModal';
import eventoService from '../services/eventoService';
import api from '../services/api';

// Mock de eventoService y api
vi.mock('../services/eventoService', () => ({
  default: {
    getLlegadas: vi.fn(),
    getBadgeInfo: vi.fn(),
    uploadPlantillaBadge: vi.fn(),
    getInscritosConfirmados: vi.fn(),
  },
}));

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
  resolveApiFileUrl: (url) => (url ? `http://localhost:8000${url}` : null),
}));

// Mock de canvas context para jsdom
beforeEach(() => {
  vi.clearAllMocks();
  const mockGradient = {
    addColorStop: vi.fn(),
  };

  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    roundRect: vi.fn(),
    rect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({ data: [] })),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => []),
    setTransform: vi.fn(),
    scale: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    fillText: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    clip: vi.fn(),
    measureText: vi.fn(() => ({ width: 100 })),
    createLinearGradient: vi.fn(() => mockGradient),
    createRadialGradient: vi.fn(() => mockGradient),
  }));
  HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,mockpngdata');
});

const renderWithProvider = (ui) => {
  return render(
    <FluentProvider theme={webDarkTheme}>
      {ui}
    </FluentProvider>
  );
};

describe('🎫 MEH-019: Componentes de Acreditación, Llegadas y Badge Social', () => {

  describe('1. ImprimirLista.jsx (Credenciales y Planilla con QR)', () => {
    const mockInscritos = [
      {
        id_inscripcion: 101,
        id_usuario: 1,
        codigo_qr: 'MEH-EV1-USR1',
        nombre_completo: 'Grace Hopper',
        correo: 'grace.hopper@meh.org',
        asistio: true,
      },
      {
        id_inscripcion: 102,
        id_usuario: 2,
        codigo_qr: 'MEH-EV1-USR2',
        nombre_completo: 'Ada Lovelace',
        correo: 'ada.lovelace@meh.org',
        asistio: false,
      },
    ];

    it('renderiza la lista de inscritos en modo planilla de firmas', () => {
      renderWithProvider(
        <ImprimirLista
          isOpen={true}
          onClose={vi.fn()}
          eventoTitulo="Summit Tech MEH 2026"
          inscritos={mockInscritos}
        />
      );

      expect(screen.getByText(/Credenciales y Lista Imprimible/i)).toBeInTheDocument();
      expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
      expect(screen.getByText('grace.hopper@meh.org')).toBeInTheDocument();
      expect(screen.getByText('Firma / Check')).toBeInTheDocument();
    });

    it('permite alternar al modo de credenciales recortables', () => {
      renderWithProvider(
        <ImprimirLista
          isOpen={true}
          onClose={vi.fn()}
          eventoTitulo="Summit Tech MEH 2026"
          inscritos={mockInscritos}
        />
      );

      const tabCredenciales = screen.getByRole('tab', { name: /Credenciales Físicas con QR/i });
      fireEvent.click(tabCredenciales);

      expect(screen.getAllByText('Microsoft Education Hub').length).toBeGreaterThan(0);
    });

    it('dispara la función window.print al hacer click en Imprimir', () => {
      const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
      renderWithProvider(
        <ImprimirLista
          isOpen={true}
          onClose={vi.fn()}
          eventoTitulo="Summit Tech MEH 2026"
          inscritos={mockInscritos}
        />
      );

      const printBtn = screen.getByRole('button', { name: /Imprimir/i });
      fireEvent.click(printBtn);

      expect(printSpy).toHaveBeenCalled();
      printSpy.mockRestore();
    });
  });

  describe('2. LlegadasEventoChart.jsx (Histograma y Checkpoints)', () => {
    const mockLlegadasData = {
      id_evento: 1,
      titulo: 'Summit Tech MEH 2026',
      total_inscritos: 50,
      total_asistieron: 35,
      porcentaje_asistencia: 70.0,
      histograma_horas: [
        { hora: '08:00', cantidad: 5, acumulado: 5 },
        { hora: '09:00', cantidad: 20, acumulado: 25 },
        { hora: '10:00', cantidad: 10, acumulado: 35 },
      ],
      checkpoints: [
        { id_checkpoint: 1, nombre_checkpoint: 'Acreditación', total: 35, porcentaje: 70.0 },
        { id_checkpoint: 2, nombre_checkpoint: 'Kit de Bienvenida', total: 30, porcentaje: 60.0 },
        { id_checkpoint: 3, nombre_checkpoint: 'Refrigerio', total: 25, porcentaje: 50.0 },
      ],
    };

    it('muestra las métricas clave (KPIs) y checkpoints del evento', async () => {
      eventoService.getLlegadas.mockResolvedValueOnce(mockLlegadasData);

      renderWithProvider(<LlegadasEventoChart eventoId={1} />);

      await waitFor(() => {
        expect(screen.getByText('Asistencia en Vivo')).toBeInTheDocument();
        expect(screen.getByText('70% de confirmados')).toBeInTheDocument();
        expect(screen.getByText(/09:00/)).toBeInTheDocument();
        expect(screen.getByText('Puntos / Checkpoints')).toBeInTheDocument();
      });

      expect(screen.getByText(/Métricas de Llegadas y Flujo por Hora/i)).toBeInTheDocument();
      expect(screen.getByText(/Kit de Bienvenida/i)).toBeInTheDocument();
      expect(screen.getByText(/Refrigerio/i)).toBeInTheDocument();
    });
  });

  describe('3. BadgeSocialModal.jsx (Canvas y Control de Acceso por Inscripción)', () => {
    it('muestra la credencial social compartible si el usuario está inscrito', async () => {
      eventoService.getBadgeInfo.mockResolvedValueOnce({
        evento_id: 1,
        titulo_evento: 'Summit Tech MEH 2026',
        fecha_evento: '2026-10-25',
        hora_evento: '09:00',
        modalidad: 'PRESENCIAL',
        ubicacion: 'Auditorio Central',
        plantilla_badge_url: null,
        nombre_completo: 'Satya Nadella',
        alias: 'Satya',
        rol: 'SPEAKER',
        foto_url: null,
        codigo_qr: 'MEH-BADGE-123',
        esta_inscrito: true,
        copy_sugerido: '¡Nos vemos en el Summit Tech MEH 2026! #Tech #MEH',
      });

      renderWithProvider(
        <BadgeSocialModal
          isOpen={true}
          onClose={vi.fn()}
          eventoId={1}
          eventoTitulo="Summit Tech MEH 2026"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Badge Social de Inscripción/i)).toBeInTheDocument();
        expect(screen.getByText('Inscrito Confirmado')).toBeInTheDocument();
      });

      expect(screen.getByText('Descargar Badge (PNG)')).toBeInTheDocument();
      expect(screen.getByText('Copiar Texto')).toBeInTheDocument();
    });

    it('bloquea el acceso y muestra mensaje si el usuario NO está inscrito (403)', async () => {
      const error403 = new Error('No inscrito');
      error403.response = { status: 403, data: { detail: 'Acceso denegado: solo usuarios con inscripción confirmada pueden generar su badge social.' } };
      eventoService.getBadgeInfo.mockRejectedValueOnce(error403);

      renderWithProvider(
        <BadgeSocialModal
          isOpen={true}
          onClose={vi.fn()}
          eventoId={1}
          eventoTitulo="Summit Tech MEH 2026"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Inscripción Requerida/i)).toBeInTheDocument();
        expect(screen.getByText(/El badge social oficial es exclusivo para miembros con inscripción confirmada/i)).toBeInTheDocument();
      });

      // No debe estar disponible el botón de descarga
      expect(screen.queryByText('Descargar Badge (PNG)')).not.toBeInTheDocument();
    });
  });

  describe('4. eventoService.js Métodos de MEH-019', () => {
    it('llama a los endpoints correctos con los parámetros adecuados', async () => {
      const realService = await vi.importActual('../services/eventoService');
      const mockApi = (await import('../services/api')).default;

      mockApi.get.mockResolvedValueOnce({ data: { llegadas_por_hora: [] } });
      const resLlegadas = await realService.default.getLlegadas(42);
      expect(mockApi.get).toHaveBeenCalledWith('/eventos/42/llegadas');
      expect(resLlegadas).toEqual({ llegadas_por_hora: [] });

      mockApi.get.mockResolvedValueOnce({ data: { esta_inscrito: true } });
      const resBadge = await realService.default.getBadgeInfo(42);
      expect(mockApi.get).toHaveBeenCalledWith('/eventos/42/badge-info');
      expect(resBadge).toEqual({ esta_inscrito: true });

      mockApi.post.mockResolvedValueOnce({ data: { plantilla_badge_url: '/static/badges/template.png' } });
      const fakeFile = new File(['fake content'], 'template.png', { type: 'image/png' });
      const resUpload = await realService.default.uploadPlantillaBadge(42, fakeFile);
      expect(mockApi.post).toHaveBeenCalledWith('/eventos/42/plantilla-badge', expect.any(FormData), {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      expect(resUpload).toEqual({ plantilla_badge_url: '/static/badges/template.png' });
    });
  });

});

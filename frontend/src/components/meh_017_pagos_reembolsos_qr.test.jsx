import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FluentProvider, webDarkTheme } from '@fluentui/react-components';

import PagoHistorialModal from './PagoHistorialModal';
import Finanzas from '../pages/Finanzas';
import GestionPagos from '../pages/GestionPagos';
import pagoService from '../services/pagoService';
import eventoService from '../services/eventoService';
import api from '../services/api';

// Mock servicios
vi.mock('../services/pagoService', () => ({
  default: {
    getMisPagos: vi.fn(),
    getAllPagos: vi.fn(),
    validarPago: vi.fn(),
    reembolsarPago: vi.fn(),
    getHistorialPagos: vi.fn(),
    reintentarPago: vi.fn(),
    uploadComprobanteOcr: vi.fn(),
    getEventPaymentPackages: vi.fn(),
    updatePagoQr: vi.fn(),
    deletePagoQr: vi.fn()
  }
}));

vi.mock('../services/eventoService', () => ({
  default: {
    getMisInscripciones: vi.fn()
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

// Mock useAuth y useNotify
vi.mock('../App', () => ({
  useAuth: () => ({
    user: { id_usuario: 1, rol: 'ADMIN', nombre: 'Admin User' }
  }),
  useNotify: () => ({
    notify: vi.fn()
  })
}));

// Mock i18next
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

describe('MEH-017: Reembolsos, Historial, Reintentos y QR de Pago', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.alert = vi.fn();
    window.confirm = vi.fn(() => true);
  });

  describe('PagoHistorialModal', () => {
    it('muestra el timeline de eventos del pago correctamente', async () => {
      pagoService.getHistorialPagos.mockResolvedValue([
        {
          id_pago: 10,
          tipo_evento: 'CREACION',
          titulo: 'Comprobante inicial registrado',
          descripcion: 'El usuario subió el comprobante.',
          fecha: '2026-10-18T10:00:00',
          responsable: 'Juan Perez',
          monto: 100,
          url_comprobante: '/files/comprobante1.png'
        },
        {
          id_pago: 10,
          tipo_evento: 'RECHAZADO',
          titulo: 'Comprobante rechazado',
          descripcion: 'Notas del admin: Foto borrosa',
          fecha: '2026-10-18T11:00:00',
          responsable: 'Admin Central',
          monto: 100,
          url_comprobante: null
        },
        {
          id_pago: 10,
          tipo_evento: 'REINTENTO',
          titulo: 'Nuevo comprobante subido',
          descripcion: 'Intento #1 reintentado por el usuario.',
          fecha: '2026-10-18T12:00:00',
          responsable: 'Juan Perez',
          monto: 100,
          url_comprobante: '/files/comprobante2.png'
        },
        {
          id_pago: 10,
          tipo_evento: 'APROBADO',
          titulo: 'Pago aprobado',
          descripcion: 'Aprobación manual.',
          fecha: '2026-10-18T13:00:00',
          responsable: 'Admin Central',
          monto: 100,
          url_comprobante: null
        },
        {
          id_pago: 10,
          tipo_evento: 'REEMBOLSADO',
          titulo: 'Pago reembolsado',
          descripcion: 'Motivo: Cancelación de asistencia',
          fecha: '2026-10-18T14:00:00',
          responsable: 'Admin Central',
          monto: 100,
          url_comprobante: null
        }
      ]);

      renderWithProvider(
        <PagoHistorialModal
          open={true}
          onOpenChange={vi.fn()}
          idPago={10}
        />
      );

      await waitFor(() => {
        expect(pagoService.getHistorialPagos).toHaveBeenCalledWith(10);
      });

      expect(screen.getByText('Comprobante inicial registrado')).toBeInTheDocument();
      expect(screen.getByText('Comprobante rechazado')).toBeInTheDocument();
      expect(screen.getByText('Nuevo comprobante subido')).toBeInTheDocument();
      expect(screen.getByText('Pago aprobado')).toBeInTheDocument();
      expect(screen.getByText('Pago reembolsado')).toBeInTheDocument();
      expect(screen.getByText(/Notas del admin: Foto borrosa/)).toBeInTheDocument();
    });
  });

  describe('Finanzas - Reintento de comprobante rechazado', () => {
    it('muestra el estado RECHAZADO con motivo y permite reintentar subiendo nuevo archivo', async () => {
      pagoService.getMisPagos.mockResolvedValue([
        {
          id_pago: 5,
          fecha_pago: '2026-10-18T10:00:00',
          tipo_referencia: 'EVENTO',
          id_referencia: 1,
          detalles_referencia: 'Hackathon Bolivia 2026',
          monto: 150,
          estado_pago: 'RECHAZADO',
          notas_admin: 'El monto transferido es incorrecto'
        }
      ]);
      eventoService.getMisInscripciones.mockResolvedValue([]);
      pagoService.reintentarPago.mockResolvedValue({ id_pago: 5, estado_pago: 'PENDIENTE' });

      renderWithProvider(<Finanzas />);

      await waitFor(() => {
        expect(screen.getByText('Hackathon Bolivia 2026')).toBeInTheDocument();
      });

      expect(screen.getByText(/Motivo: El monto transferido es incorrecto/)).toBeInTheDocument();

      const btnReintentar = screen.getByRole('button', { name: /reintentar/i });
      fireEvent.click(btnReintentar);

      expect(screen.getByText(/Reintentar Comprobante \(Pago #5\)/i)).toBeInTheDocument();

      const fileInput = document.getElementById('reintento-file-input');
      const fakeFile = new File(['fake receipt content'], 'nuevo_recibo.png', { type: 'image/png' });
      fireEvent.change(fileInput, { target: { files: [fakeFile] } });

      const btnEnviar = screen.getByRole('button', { name: /Enviar Nuevo Comprobante/i });
      fireEvent.click(btnEnviar);

      await waitFor(() => {
        expect(pagoService.reintentarPago).toHaveBeenCalledWith(5, expect.any(FormData));
      });
    });

    it('muestra el estado REEMBOLSADO en Finanzas', async () => {
      pagoService.getMisPagos.mockResolvedValue([
        {
          id_pago: 8,
          fecha_pago: '2026-10-18T10:00:00',
          tipo_referencia: 'EVENTO',
          id_referencia: 2,
          detalles_referencia: 'Conferencia IA 2026',
          monto: 200,
          estado_pago: 'REEMBOLSADO',
          motivo_reembolso: 'Fuerza mayor reportada'
        }
      ]);
      eventoService.getMisInscripciones.mockResolvedValue([]);

      renderWithProvider(<Finanzas />);

      await waitFor(() => {
        expect(screen.getByText('Conferencia IA 2026')).toBeInTheDocument();
      });

      expect(screen.getByText('Reembolsado')).toBeInTheDocument();
      expect(screen.getByText(/Motivo: Fuerza mayor reportada/)).toBeInTheDocument();
    });
  });

  describe('GestionPagos - Reembolso manual y Timeline', () => {
    it('permite a un admin reembolsar un pago APROBADO ingresando motivo', async () => {
      pagoService.getAllPagos.mockResolvedValue([
        {
          id_pago: 12,
          id_usuario: 3,
          nombre_usuario: 'Carlos Gomez',
          tipo_referencia: 'EVENTO',
          id_referencia: 1,
          detalles_referencia: 'Hackathon Bolivia 2026',
          monto: 150,
          fecha_pago: '2026-10-18T10:00:00',
          url_comprobante: '/files/comprobante12.png',
          estado_pago: 'APROBADO'
        }
      ]);
      pagoService.reembolsarPago.mockResolvedValue({ id_pago: 12, estado_pago: 'REEMBOLSADO' });

      renderWithProvider(<GestionPagos />);

      await waitFor(() => {
        expect(screen.getByText('Carlos Gomez')).toBeInTheDocument();
      });

      const btnReembolsar = screen.getByRole('button', { name: /reembolsar/i });
      fireEvent.click(btnReembolsar);

      expect(screen.getByText(/Reembolsar Pago #12/i)).toBeInTheDocument();

      const textareaMotivo = screen.getByRole('textbox', { name: /motivo del reembolso/i });
      fireEvent.change(textareaMotivo, { target: { value: 'Participante solicitó baja médica' } });

      const btnConfirmar = screen.getByRole('button', { name: /Confirmar Reembolso/i });
      fireEvent.click(btnConfirmar);

      await waitFor(() => {
        expect(pagoService.reembolsarPago).toHaveBeenCalledWith(12, 'Participante solicitó baja médica');
      });
    });

    it('abre el modal de historial cuando se hace clic en Historial', async () => {
      pagoService.getAllPagos.mockResolvedValue([
        {
          id_pago: 15,
          id_usuario: 4,
          nombre_usuario: 'Maria Lopez',
          tipo_referencia: 'EVENTO',
          id_referencia: 1,
          detalles_referencia: 'Hackathon Bolivia 2026',
          monto: 100,
          fecha_pago: '2026-10-18T10:00:00',
          url_comprobante: '/files/comprobante15.png',
          estado_pago: 'PENDIENTE'
        }
      ]);
      pagoService.getHistorialPagos.mockResolvedValue([]);

      renderWithProvider(<GestionPagos />);

      await waitFor(() => {
        expect(screen.getByText('Maria Lopez')).toBeInTheDocument();
      });

      const btnHistorial = screen.getByRole('button', { name: /historial/i });
      fireEvent.click(btnHistorial);

      await waitFor(() => {
        expect(pagoService.getHistorialPagos).toHaveBeenCalledWith(15);
      });
    });
  });
});

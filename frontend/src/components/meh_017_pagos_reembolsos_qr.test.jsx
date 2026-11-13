import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FluentProvider, webDarkTheme } from '@fluentui/react-components';

import PagoHistorialModal from './PagoHistorialModal';
import Finanzas from '../pages/Finanzas';
import GestionPagos from '../pages/GestionPagos';
import InscripcionEventoModal from './InscripcionEventoModal';
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
    getMisInscripciones: vi.fn(),
    inscribirse: vi.fn()
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

  describe('InscripcionEventoModal - Paquetes e Ítems Individuales', () => {
    it('muestra filtros de Paquetes e Ítems Individuales y envía notas_admin correctas al inscribirse', async () => {
      const mockEvento = {
        id_evento: 99,
        titulo: 'Congreso Tech 2026',
        capacidad_max: 100,
        cupos_ocupados: 10,
        cupos_disponibles: 90
      };

      pagoService.getEventPaymentPackages.mockResolvedValue([
        {
          id_qr: 101,
          id_evento: 99,
          nombre_paquete: 'Full Pass VIP',
          monto: 150,
          url_qr: '/qrs/qr_vip.png',
          es_individual: false,
          descripcion: 'Acceso total y cena'
        },
        {
          id_qr: 102,
          id_evento: 99,
          nombre_paquete: 'Solo Polera Conmemorativa',
          monto: 45,
          url_qr: '/qrs/qr_polera.png',
          es_individual: true,
          descripcion: 'Polera oficial edición limitada'
        }
      ]);

      eventoService.inscribirse.mockResolvedValue({ id_inscripcion: 888 });
      pagoService.uploadComprobanteOcr.mockResolvedValue({ success: true });

      renderWithProvider(
        <InscripcionEventoModal evento={mockEvento} buttonText="Comprar o Inscribirme" />
      );

      // Abrir modal
      const btnOpen = screen.getByRole('button', { name: /Comprar o Inscribirme/i });
      fireEvent.click(btnOpen);

      await waitFor(() => {
        expect(screen.getByText('Full Pass VIP')).toBeInTheDocument();
        expect(screen.getByText('Solo Polera Conmemorativa')).toBeInTheDocument();
      });

      // Validar badges y descripciones
      expect(screen.getByText('📦 Paquetes (1)')).toBeInTheDocument();
      expect(screen.getByText('🏷️ Ítems Individuales (1)')).toBeInTheDocument();
      expect(screen.getByText('Acceso total y cena')).toBeInTheDocument();
      expect(screen.getByText('Polera oficial edición limitada')).toBeInTheDocument();

      // Filtrar por ítems individuales
      const btnFilterInd = screen.getByText('🏷️ Ítems Individuales (1)');
      fireEvent.click(btnFilterInd);

      // Full Pass VIP debe ocultarse del listado filtrado
      expect(screen.queryByText('Full Pass VIP')).not.toBeInTheDocument();
      expect(screen.getByText('Solo Polera Conmemorativa')).toBeInTheDocument();

      // Seleccionar el ítem individual
      const cardItem = screen.getByText('Solo Polera Conmemorativa');
      fireEvent.click(cardItem);

      // Debe mostrar el monto y QR del ítem
      expect(screen.getByText(/Solo Polera Conmemorativa — Monto: Bs. 45/i)).toBeInTheDocument();

      // Subir archivo simulado
      const fileInput = document.querySelector('input[type="file"]');
      const fakeFile = new File(['fake receipt'], 'recibo_polera.png', { type: 'image/png' });
      fireEvent.change(fileInput, { target: { files: [fakeFile] } });

      // Confirmar compra
      const btnConfirmar = screen.getByRole('button', { name: /Subir y Confirmar/i });
      fireEvent.click(btnConfirmar);

      await waitFor(() => {
        expect(eventoService.inscribirse).toHaveBeenCalledWith(99, expect.objectContaining({ id_qr: 102 }));
        expect(pagoService.uploadComprobanteOcr).toHaveBeenCalledWith(expect.any(FormData));
      });

      const calledFormData = pagoService.uploadComprobanteOcr.mock.calls[0][0];
      expect(calledFormData.get('notas_admin')).toBe('Ítem Individual: Solo Polera Conmemorativa');
      expect(calledFormData.get('monto')).toBe('45');
    });

    it('gestiona la selección de tallas con contador de inventario y bloquea tallas agotadas', async () => {
      const mockEvento = {
        id_evento: 99,
        titulo: 'Congreso Tech 2026',
        capacidad_max: 100,
        cupos_ocupados: 10,
        cupos_disponibles: 90
      };

      pagoService.getEventPaymentPackages.mockResolvedValue([
        {
          id_qr: 103,
          nombre_paquete: 'Polera conmemorativa oficial',
          monto: 50.0,
          url_qr: '/qrs/polera.png',
          es_individual: true,
          tiene_tallas: true,
          tallas_stock: JSON.stringify({ S: 4, M: 0, L: 10 }),
          descripcion: 'Polera de algodón'
        }
      ]);

      eventoService.inscribirse.mockResolvedValue({ id_inscripcion: 999 });
      pagoService.uploadComprobanteOcr.mockResolvedValue({ success: true });

      renderWithProvider(
        <InscripcionEventoModal evento={mockEvento} buttonText="Comprar Polera" />
      );

      fireEvent.click(screen.getByRole('button', { name: /Comprar Polera/i }));

      await waitFor(() => {
        expect(screen.getByText('Polera conmemorativa oficial')).toBeInTheDocument();
      });

      // Seleccionar el ítem
      fireEvent.click(screen.getByText('Polera conmemorativa oficial'));

      // Verificar que se muestren las tallas con inventario disponible y agotado
      await waitFor(() => {
        expect(screen.getByText(/Selecciona tu Talla/i)).toBeInTheDocument();
        expect(screen.getByText('4 disp.')).toBeInTheDocument();
        expect(screen.getByText('Agotado')).toBeInTheDocument();
        expect(screen.getByText('10 disp.')).toBeInTheDocument();
      });

      // El botón de talla M debe estar deshabilitado
      const btnTallaM = screen.getByText('Agotado').closest('button');
      expect(btnTallaM).toBeDisabled();

      // Subir archivo simulado
      const fileInput = document.querySelector('input[type="file"]');
      const fakeFile = new File(['fake receipt'], 'recibo_polera.png', { type: 'image/png' });
      fireEvent.change(fileInput, { target: { files: [fakeFile] } });

      // Seleccionar talla S (disponible)
      const btnTallaS = screen.getByText('4 disp.').closest('button');
      fireEvent.click(btnTallaS);

      await waitFor(() => {
        expect(screen.getByText(/Talla S seleccionada/i)).toBeInTheDocument();
      });

      // Confirmar compra con talla S
      const btnConfirmar = screen.getByRole('button', { name: /Subir y Confirmar/i });
      fireEvent.click(btnConfirmar);

      await waitFor(() => {
        expect(eventoService.inscribirse).toHaveBeenCalledWith(99, { id_qr: 103, talla: 'S' });
        expect(pagoService.uploadComprobanteOcr).toHaveBeenCalledWith(expect.any(FormData));
      });

      const calledFormData = pagoService.uploadComprobanteOcr.mock.calls[0][0];
      expect(calledFormData.get('notas_admin')).toBe('Ítem Individual: Polera conmemorativa oficial (Talla: S)');
    });
  });
});

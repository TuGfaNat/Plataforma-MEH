import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FluentProvider, webDarkTheme } from '@fluentui/react-components';

import EscaneoQR from '../pages/EscaneoQR';
import CheckpointPermisosPanel from './CheckpointPermisosPanel';
import asistenciaService from '../services/asistenciaService';
import api from '../services/api';

// Mock html5-qrcode
vi.mock('html5-qrcode', () => ({
  Html5QrcodeScanner: vi.fn().mockImplementation(() => ({
    render: vi.fn(),
    clear: vi.fn().mockResolvedValue(true)
  }))
}));

// Mock asistenciaService
vi.mock('../services/asistenciaService', () => ({
  default: {
    getActividades: vi.fn(),
    registrarPorQR: vi.fn(),
    deshacerAsistencia: vi.fn(),
    getHistorialAsistencia: vi.fn(),
    getCheckpoints: vi.fn(),
    createCheckpoint: vi.fn(),
    getCheckpointPermisos: vi.fn(),
    asignarCheckpointPermiso: vi.fn(),
    revocarCheckpointPermiso: vi.fn(),
    getInscritosConfirmados: vi.fn()
  }
}));

// Mock api
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn()
  }
}));

// Mock offlineDb
vi.mock('../utils/offlineDb', () => ({
  obtenerColaAsistencia: vi.fn().mockResolvedValue([]),
  validarQROffline: vi.fn().mockResolvedValue({ success: true, message: 'Validado offline', usuario: { nombre: 'Offline User' } }),
  abrirDB: vi.fn(),
  guardarInscritos: vi.fn().mockResolvedValue(true),
  eliminarDeCola: vi.fn().mockResolvedValue(true)
}));

// Mock useAuth y useNotify
vi.mock('../App', () => ({
  useAuth: () => ({
    user: { id_usuario: 1, rol: 'ADMIN', nombre: 'Admin User' }
  }),
  useNotify: () => vi.fn()
}));

const renderWithProvider = (ui) => {
  return render(
    <FluentProvider theme={webDarkTheme}>
      {ui}
    </FluentProvider>
  );
};

describe('MEH-018: Escaneo Seguro, Undo, Historial y Permisos por Checkpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    asistenciaService.getActividades.mockResolvedValue({
      eventos: [
        { id_evento: 10, titulo: 'Tech Conference 2026' }
      ]
    });

    asistenciaService.getCheckpoints.mockResolvedValue([
      { id_checkpoint: 1, nombre_checkpoint: 'Acreditación y Entrada', tipo_checkpoint: 'ASISTENCIA', puede_escanear: true },
      { id_checkpoint: 2, nombre_checkpoint: 'Refrigerio Exclusivo', tipo_checkpoint: 'COMIDA', puede_escanear: false }
    ]);
  });

  describe('1. EscaneoQR - Botón Deshacer y Contador de Ventana', () => {
    it('muestra el botón Deshacer tras escanear y revierte el escaneo al hacer clic', async () => {
      asistenciaService.registrarPorQR.mockResolvedValue({
        message: 'Asistencia registrada con éxito',
        usuario: { nombre: 'Carlos Quispe' },
        evento: { titulo: 'Tech Conference 2026' },
        id_asistencia: 55,
        id_inscripcion: 88,
        id_checkpoint: 1
      });

      asistenciaService.deshacerAsistencia.mockResolvedValue({
        status: 'success',
        message: 'Escaneo en Refrigerio deshecho con éxito'
      });

      renderWithProvider(<EscaneoQR />);

      // Cambiar a pestaña manual
      const tabManual = await screen.findByRole('tab', { name: /Ingreso Manual/i });
      fireEvent.click(tabManual);

      // Ingresar código QR
      const input = screen.getByPlaceholderText(/Pega aquí el código/i);
      fireEvent.change(input, { target: { value: 'QR_CARLOS_123' } });

      const btnRegistrar = screen.getByRole('button', { name: /Registrar Asistencia/i });
      fireEvent.click(btnRegistrar);

      // Debe aparecer el resultado y el botón Deshacer
      await waitFor(() => {
        expect(screen.getByText(/Asistencia de Carlos Quispe confirmada/i)).toBeInTheDocument();
      });

      const btnDeshacer = screen.getByRole('button', { name: /Deshacer Escaneo/i });
      expect(btnDeshacer).toBeInTheDocument();

      // Ejecutar Deshacer
      fireEvent.click(btnDeshacer);

      await waitFor(() => {
        expect(asistenciaService.deshacerAsistencia).toHaveBeenCalledWith(
          expect.objectContaining({
            id_asistencia: 55,
            id_inscripcion: 88,
            id_checkpoint: 1
          })
        );
        expect(screen.getByText(/Escaneo deshecho con éxito/i)).toBeInTheDocument();
      });
    });

    it('marca checkpoints restringidos como (Sin permiso) y deshabilitados en el selector', async () => {
      renderWithProvider(<EscaneoQR />);

      // Seleccionar evento
      const selectEvento = await screen.findByLabelText(/Evento Actual/i);
      fireEvent.change(selectEvento, { target: { value: '10' } });

      // Esperar a que cargue el selector de checkpoints
      await waitFor(() => {
        expect(asistenciaService.getCheckpoints).toHaveBeenCalledWith('10');
      });

      const selectCheckpoint = await screen.findByLabelText(/Checkpoint/i);
      const opciones = selectCheckpoint.querySelectorAll('option');

      // Refrigerio Exclusivo tiene puede_escanear = false
      const cpSinPermiso = Array.from(opciones).find(o => o.textContent.includes('Refrigerio Exclusivo'));
      expect(cpSinPermiso).toBeDefined();
      expect(cpSinPermiso.textContent).toContain('(Sin permiso)');
      expect(cpSinPermiso.disabled).toBe(true);
    });
  });

  describe('2. EscaneoQR - Pestaña Historial de Escaneos Paginado', () => {
    it('muestra el historial con usuarios, checkpoints, operadores y botón para deshacer', async () => {
      asistenciaService.getHistorialAsistencia.mockResolvedValue({
        total: 1,
        page: 1,
        limit: 10,
        total_pages: 1,
        items: [
          {
            id_asistencia: 101,
            id_inscripcion: 202,
            id_evento: 10,
            fecha_escaneo: new Date().toISOString(),
            segundos_transcurridos: 10,
            puede_deshacer: true,
            usuario: {
              id_usuario: 5,
              nombre_completo: 'Lucia Ramos',
              correo: 'lucia@meh.com'
            },
            checkpoint: {
              id_checkpoint: 1,
              nombre_checkpoint: 'Acreditación y Entrada'
            },
            operador: {
              id_usuario: 2,
              nombre_completo: 'Operador Puerta'
            }
          }
        ]
      });

      asistenciaService.deshacerAsistencia.mockResolvedValue({
        status: 'success',
        message: 'Escaneo deshecho con éxito'
      });

      renderWithProvider(<EscaneoQR />);

      // Seleccionar evento
      const selectEvento = await screen.findByLabelText(/Evento Actual/i);
      fireEvent.change(selectEvento, { target: { value: '10' } });

      // Cambiar a pestaña Historial
      const tabHistorial = screen.getByRole('tab', { name: /Historial de Escaneos/i });
      fireEvent.click(tabHistorial);

      // Esperar que cargue los ítems del historial
      await waitFor(() => {
        expect(asistenciaService.getHistorialAsistencia).toHaveBeenCalled();
        expect(screen.getByText('Lucia Ramos')).toBeInTheDocument();
        expect(screen.getByText(/Operador Puerta/i)).toBeInTheDocument();
        expect(screen.getAllByText(/Acreditación y Entrada/i).length).toBeGreaterThan(0);
      });

      // Debe existir el botón Deshacer para Lucia Ramos
      const btnDeshacerFila = screen.getByRole('button', { name: /^Deshacer$/i });
      expect(btnDeshacerFila).toBeInTheDocument();

      fireEvent.click(btnDeshacerFila);

      await waitFor(() => {
        expect(asistenciaService.deshacerAsistencia).toHaveBeenCalledWith(
          expect.objectContaining({
            id_asistencia: 101
          })
        );
      });
    });
  });

  describe('3. CheckpointPermisosPanel - Gestión de Permisos en EventsTab', () => {
    it('renderiza checkpoints, lista operadores asignados y permite asignar y revocar', async () => {
      api.get.mockResolvedValue({
        data: [
          { id_usuario: 7, nombres: 'Marco', apellidos: 'Polo', correo: 'marco@meh.com', rol: 'STAFF' }
        ]
      });

      asistenciaService.getCheckpointPermisos.mockResolvedValue([
        {
          id_permiso: 5,
          id_checkpoint: 1,
          id_usuario: 7,
          puede_escanear: true,
          usuario: {
            id_usuario: 7,
            nombres: 'Marco',
            apellidos: 'Polo',
            correo: 'marco@meh.com',
            rol: 'STAFF'
          }
        }
      ]);

      asistenciaService.asignarCheckpointPermiso.mockResolvedValue({
        id_permiso: 6,
        id_checkpoint: 1,
        id_usuario: 7,
        puede_escanear: true
      });

      asistenciaService.revocarCheckpointPermiso.mockResolvedValue({
        status: 'success'
      });

      renderWithProvider(
        <CheckpointPermisosPanel eventoId={10} eventoTitulo="Tech Conference 2026" />
      );

      // Verificar que se listan los checkpoints
      await waitFor(() => {
        expect(screen.getAllByText('Acreditación y Entrada').length).toBeGreaterThan(0);
        expect(screen.getByText('Refrigerio Exclusivo')).toBeInTheDocument();
      });

      // Verificar que el operador asignado aparece en la lista
      await waitFor(() => {
        expect(screen.getByText('Marco Polo')).toBeInTheDocument();
        expect(screen.getAllByText(/marco@meh.com/i).length).toBeGreaterThan(0);
      });

      // Probar revocar permiso
      const btnRevocar = screen.getByRole('button', { name: /Revocar permiso/i });
      expect(btnRevocar).toBeInTheDocument();
      fireEvent.click(btnRevocar);

      await waitFor(() => {
        expect(asistenciaService.revocarCheckpointPermiso).toHaveBeenCalledWith(10, 1, 7);
      });
    });
  });
});

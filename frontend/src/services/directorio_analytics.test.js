import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from './api';
import dashboardService from './dashboardService';
import authService from './authService';

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('MEH-012: Frontend Services - Directorio y Analytics con Filtros AND', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('dashboardService.getFilteredStats', () => {
    it('llama a /dashboard/stats sin query string cuando no hay filtros activos', async () => {
      api.get.mockResolvedValueOnce({ data: { is_filtered: false, kpis: {} } });

      const result = await dashboardService.getFilteredStats({});

      expect(api.get).toHaveBeenCalledWith('/dashboard/stats');
      expect(result.is_filtered).toBe(false);
    });

    it('ignora valores "Todos", "Todas" y cadenas vacías', async () => {
      api.get.mockResolvedValueOnce({ data: { is_filtered: false } });

      await dashboardService.getFilteredStats({
        q: '   ',
        modalidad: 'Todos',
        estado: 'Todas',
        fecha_inicio: '',
        fecha_fin: '',
      });

      expect(api.get).toHaveBeenCalledWith('/dashboard/stats');
    });

    it('combina múltiples filtros en conjunción AND correctamente', async () => {
      api.get.mockResolvedValueOnce({
        data: {
          is_filtered: true,
          indicador_filtrado: 'KPIs calculados sobre subconjunto de eventos filtrados (1 eventos)',
          eventos_filtrados_conteo: 1,
        },
      });

      const filters = {
        q: 'Taller Azure',
        modalidad: 'VIRTUAL',
        estado: 'FINALIZADO',
        fecha_inicio: '2026-01-01',
        fecha_fin: '2026-03-31',
      };

      const result = await dashboardService.getFilteredStats(filters);

      expect(api.get).toHaveBeenCalledWith(
        '/dashboard/stats?q=Taller+Azure&modalidad=VIRTUAL&estado=FINALIZADO&fecha_inicio=2026-01-01&fecha_fin=2026-03-31'
      );
      expect(result.is_filtered).toBe(true);
      expect(result.eventos_filtrados_conteo).toBe(1);
    });

    it('permite filtrar por id_eventos específicos', async () => {
      api.get.mockResolvedValueOnce({ data: { is_filtered: true } });

      await dashboardService.getFilteredStats({ id_eventos: '1,2,3' });

      expect(api.get).toHaveBeenCalledWith('/dashboard/stats?id_eventos=1%2C2%2C3');
    });
  });

  describe('authService.getDirectorio', () => {
    it('llama a /usuarios/directorio con parámetros por defecto', async () => {
      api.get.mockResolvedValueOnce({ data: [] });

      await authService.getDirectorio();

      expect(api.get).toHaveBeenCalledWith('/usuarios/directorio?sort_by=nombres&sort_order=asc&limit=100');
    });

    it('envía buscador y orden por columnas', async () => {
      const mockMiembros = [
        {
          id_usuario: 1,
          nombres: 'Alice',
          apellidos: 'Dev',
          nivel: 'Champion',
          asistencias: 5,
          compras: 2,
          cursos: 1,
          badges_conteo: 4,
        },
      ];
      api.get.mockResolvedValueOnce({ data: mockMiembros });

      const result = await authService.getDirectorio({
        search: 'Alice',
        sort_by: 'asistencias',
        sort_order: 'desc',
      });

      expect(api.get).toHaveBeenCalledWith(
        '/usuarios/directorio?q=Alice&sort_by=asistencias&sort_order=desc&limit=100'
      );
      expect(result).toHaveLength(1);
      expect(result[0].nivel).toBe('Champion');
      expect(result[0].asistencias).toBe(5);
    });
  });
});

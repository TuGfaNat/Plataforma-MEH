import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import eventoService from './eventoService';
import api from './api';
import * as offlineDb from '../utils/offlineDb';

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// In-memory mock IndexedDB for vitest environment
const setupMockIndexedDB = () => {
  const stores = {
    cola_inscripciones: new Map(),
    cola_asistencia: new Map(),
    eventos: new Map(),
    inscritos: new Map(),
  };
  let autoId = 1;

  const mockDb = {
    objectStoreNames: {
      contains: (name) => Boolean(stores[name]),
    },
    transaction: (storeNames, mode) => {
      const storeName = Array.isArray(storeNames) ? storeNames[0] : storeNames;
      const store = stores[storeName] || new Map();
      const tx = {
        onerror: null,
        oncomplete: null,
        objectStore: (name) => {
          const targetStore = stores[name] || store;
          return {
            get: (id) => {
              const req = { onsuccess: null, onerror: null, result: targetStore.get(id) };
              setTimeout(() => req.onsuccess && req.onsuccess({ target: req }), 0);
              return req;
            },
            getAll: () => {
              const req = { onsuccess: null, onerror: null, result: Array.from(targetStore.values()) };
              setTimeout(() => req.onsuccess && req.onsuccess({ target: req }), 0);
              return req;
            },
            add: (item) => {
              const id = item.id || autoId++;
              const saved = { ...item, id };
              targetStore.set(id, saved);
              const req = { onsuccess: null, onerror: null, result: id };
              setTimeout(() => {
                req.onsuccess && req.onsuccess({ target: req });
                tx.oncomplete && tx.oncomplete();
              }, 0);
              return req;
            },
            put: (item) => {
              const id = item.id || autoId++;
              const saved = { ...item, id };
              targetStore.set(id, saved);
              const req = { onsuccess: null, onerror: null, result: id };
              setTimeout(() => {
                req.onsuccess && req.onsuccess({ target: req });
                tx.oncomplete && tx.oncomplete();
              }, 0);
              return req;
            },
            delete: (id) => {
              targetStore.delete(id);
              const req = { onsuccess: null, onerror: null };
              setTimeout(() => {
                req.onsuccess && req.onsuccess({ target: req });
                tx.oncomplete && tx.oncomplete();
              }, 0);
              return req;
            },
            clear: () => {
              targetStore.clear();
              const req = { onsuccess: null, onerror: null };
              setTimeout(() => {
                req.onsuccess && req.onsuccess({ target: req });
                tx.oncomplete && tx.oncomplete();
              }, 0);
              return req;
            },
          };
        },
      };
      return tx;
    },
  };

  const idb = {
    open: () => {
      const req = { onsuccess: null, onerror: null, onupgradeneeded: null, result: mockDb };
      setTimeout(() => {
        if (req.onupgradeneeded) req.onupgradeneeded({ target: req });
        if (req.onsuccess) req.onsuccess({ target: req });
      }, 0);
      return req;
    },
    _stores: stores,
    _clear: () => {
      Object.values(stores).forEach((s) => s.clear());
      autoId = 1;
    },
  };

  return idb;
};

describe('MEH-016: Conectividad Offline Extendida y Cola de Sincronización', () => {
  let mockIDB;

  beforeAll(() => {
    mockIDB = setupMockIndexedDB();
    globalThis.indexedDB = mockIDB;
  });

  afterAll(() => {
    delete globalThis.indexedDB;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockIDB._clear();
  });

  describe('eventoService.inscribirse con Idempotencia', () => {
    it('envía cabecera X-Idempotency-Key cuando se proporciona', async () => {
      api.post.mockResolvedValueOnce({
        data: { id_inscripcion: 10, estado_inscripcion: 'CONFIRMADA' },
      });

      const res = await eventoService.inscribirse(42, {
        idempotency_key: 'test-key-uuid-1234',
      });

      expect(api.post).toHaveBeenCalledWith(
        '/inscripciones/eventos/42',
        {},
        {
          headers: {
            'X-Idempotency-Key': 'test-key-uuid-1234',
          },
        }
      );
      expect(res.estado_inscripcion).toBe('CONFIRMADA');
    });

    it('llama sin cabeceras adicionales si no se pasa idempotency_key', async () => {
      api.post.mockResolvedValueOnce({
        data: { id_inscripcion: 11, estado_inscripcion: 'CONFIRMADA' },
      });

      await eventoService.inscribirse(42);

      expect(api.post).toHaveBeenCalledWith('/inscripciones/eventos/42', {}, {});
    });
  });

  describe('offlineDb - Encolar inscripciones offline', () => {
    it('agrega nueva inscripción offline con idempotency_key único y estado PENDIENTE', async () => {
      const res = await offlineDb.agregarInscripcionOffline({
        id_evento: 55,
        titulo_evento: 'Workshop React & Azure',
        id_usuario: 1,
        correo_usuario: 'user@test.com',
      });

      expect(res.success).toBe(true);
      expect(res.item).toBeDefined();
      expect(res.item.id_evento).toBe(55);
      expect(res.item.estado).toBe('PENDIENTE');
      expect(res.item.idempotency_key).toBeDefined();
      expect(res.item.idempotency_key.length).toBeGreaterThan(5);

      const cola = await offlineDb.obtenerColaInscripciones();
      expect(cola).toHaveLength(1);
      expect(cola[0].titulo_evento).toBe('Workshop React & Azure');
    });

    it('detecta duplicado en cola y no duplica registro localmente', async () => {
      await offlineDb.agregarInscripcionOffline({
        id_evento: 77,
        id_usuario: 2,
      });

      const dupRes = await offlineDb.agregarInscripcionOffline({
        id_evento: 77,
        id_usuario: 2,
      });

      expect(dupRes.success).toBe(false);
      expect(dupRes.alreadyEnqueued).toBe(true);

      const cola = await offlineDb.obtenerColaInscripciones();
      expect(cola).toHaveLength(1);
    });
  });

  describe('offlineDb - Sincronización de Items y Manejo de Conflictos 409', () => {
    it('sincronizarInscripcionItem exitoso elimina el item de la cola', async () => {
      // 1. Agregar a cola
      const addRes = await offlineDb.agregarInscripcionOffline({
        id_evento: 99,
        titulo_evento: 'Taller Azure Cloud',
      });
      const item = addRes.item;

      api.post.mockResolvedValueOnce({
        data: { id_inscripcion: 50, estado_inscripcion: 'CONFIRMADA', codigo_qr: 'QR_XYZ' },
      });

      const result = await offlineDb.sincronizarInscripcionItem(item, api);

      expect(api.post).toHaveBeenCalledWith(
        '/inscripciones/eventos/99',
        {},
        {
          headers: {
            'X-Idempotency-Key': item.idempotency_key,
          },
        }
      );
      expect(result.success).toBe(true);

      // Debe haberse eliminado de la cola
      const cola = await offlineDb.obtenerColaInscripciones();
      expect(cola).toHaveLength(0);
    });

    it('sincronizarInscripcionItem con error 409 (Conflicto / Cupo) actualiza estado a ERROR con mensaje legible', async () => {
      const addRes = await offlineDb.agregarInscripcionOffline({
        id_evento: 101,
        titulo_evento: 'Conferencia IA',
      });
      const item = addRes.item;

      const error409 = {
        response: {
          status: 409,
          data: { detail: 'El evento ha alcanzado su capacidad máxima' },
        },
      };
      api.post.mockRejectedValueOnce(error409);

      const result = await offlineDb.sincronizarInscripcionItem(item, api);

      expect(result.success).toBe(false);
      expect(result.isConflict).toBe(true);
      expect(result.status).toBe(409);
      expect(result.error).toContain('Conflicto (409): El evento ha alcanzado su capacidad máxima');

      // Comprobar que en la base el item pasó a ERROR con error_detalle persistido
      const cola = await offlineDb.obtenerColaInscripciones();
      expect(cola).toHaveLength(1);
      expect(cola[0].estado).toBe('ERROR');
      expect(cola[0].error_detalle).toBe('Conflicto (409): El evento ha alcanzado su capacidad máxima');
      expect(cola[0].intentos).toBe(1);
    });

    it('sincronizarInscripcionItem con 409 duplicado muestra error legible de ya inscrito', async () => {
      const addRes = await offlineDb.agregarInscripcionOffline({
        id_evento: 102,
        titulo_evento: 'DevOps Workshop',
      });
      const item = addRes.item;

      const errorDup = {
        response: {
          status: 409,
          data: { detail: 'Ya estás inscrito en este evento' },
        },
      };
      api.post.mockRejectedValueOnce(errorDup);

      const result = await offlineDb.sincronizarInscripcionItem(item, api);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Ya estás inscrito en este evento');

      const cola = await offlineDb.obtenerColaInscripciones();
      expect(cola[0].estado).toBe('ERROR');
      expect(cola[0].error_detalle).toBe('Conflicto (409): Ya estás inscrito en este evento');
    });

    it('permite descartar (eliminar) un elemento con error de la cola', async () => {
      const addRes = await offlineDb.agregarInscripcionOffline({
        id_evento: 200,
        titulo_evento: 'Evento a descartar',
      });

      await offlineDb.eliminarInscripcionOffline(addRes.item.id);

      const cola = await offlineDb.obtenerColaInscripciones();
      expect(cola).toHaveLength(0);
    });
  });
});

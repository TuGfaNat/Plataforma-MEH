const DB_NAME = 'meh_offline_db';
const DB_VERSION = 2;

export const notificarCambioOffline = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('meh_offline_sync_updated'));
  }
};

export const getIDBInstance = () => {
  if (typeof indexedDB !== 'undefined') return indexedDB;
  if (typeof window !== 'undefined' && window.indexedDB) return window.indexedDB;
  if (typeof globalThis !== 'undefined' && globalThis.indexedDB) return globalThis.indexedDB;
  return null;
};

export const abrirDB = () => {
  return new Promise((resolve, reject) => {
    const idb = getIDBInstance();
    if (!idb) {
      reject(new Error('IndexedDB no está soportado en este entorno'));
      return;
    }
    const request = idb.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB open error:', event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Store metadata de eventos descargados
      if (!db.objectStoreNames.contains('eventos')) {
        db.createObjectStore('eventos', { keyPath: 'id_evento' });
      }

      // Store inscritos confirmados para los eventos offline
      if (!db.objectStoreNames.contains('inscritos')) {
        const storeInscritos = db.createObjectStore('inscritos', { keyPath: 'codigo_qr' });
        storeInscritos.createIndex('id_evento', 'id_evento', { unique: false });
      }

      // Store cola de asistencia para sincronizar luego
      if (!db.objectStoreNames.contains('cola_asistencia')) {
        db.createObjectStore('cola_asistencia', { keyPath: 'id', autoIncrement: true });
      }

      // Store cola de inscripciones offline con idempotencia y estado
      if (!db.objectStoreNames.contains('cola_inscripciones')) {
        const storeInscripciones = db.createObjectStore('cola_inscripciones', { keyPath: 'id', autoIncrement: true });
        storeInscripciones.createIndex('id_evento', 'id_evento', { unique: false });
        storeInscripciones.createIndex('id_usuario', 'id_usuario', { unique: false });
        storeInscripciones.createIndex('estado', 'estado', { unique: false });
      }
    };
  });
};

export const guardarInscritos = async (idEvento, nombreEvento, registrados, checkpoints) => {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['eventos', 'inscritos'], 'readwrite');
    
    transaction.onerror = (event) => {
      reject(event.target.error);
    };

    transaction.oncomplete = () => {
      resolve(true);
    };

    const storeEventos = transaction.objectStore('eventos');
    const storeInscritos = transaction.objectStore('inscritos');

    // 1. Guardar evento
    storeEventos.put({
      id_evento: idEvento,
      titulo: nombreEvento,
      checkpoints: checkpoints || [],
      fecha_descarga: new Date().toISOString()
    });

    // 2. Limpiar inscritos antiguos de este evento
    const index = storeInscritos.index('id_evento');
    const request = index.openCursor(IDBKeyRange.only(idEvento));
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        // 3. Insertar nuevos registros
        registrados.forEach(item => {
          storeInscritos.put({
            codigo_qr: item.codigo_qr,
            id_inscripcion: item.id_inscripcion,
            id_usuario: item.id_usuario,
            id_evento: idEvento,
            nombre_completo: item.nombre_completo,
            asistio: item.asistio
          });
        });
      }
    };
  });
};

export const validarQROffline = async (codigoQR, idCheckpoint, idEventoSeleccionado) => {
  const db = await abrirDB();
  
  // 1. Obtener la cola de asistencia actual para verificar duplicados en cola
  const cola = await obtenerColaAsistencia();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['inscritos', 'cola_asistencia'], 'readwrite');
    const storeInscritos = transaction.objectStore('inscritos');
    const storeCola = transaction.objectStore('cola_asistencia');

    const getRequest = storeInscritos.get(codigoQR);

    getRequest.onerror = (event) => {
      reject(event.target.error);
    };

    getRequest.onsuccess = (event) => {
      const inscrito = event.target.result;
      
      if (!inscrito) {
        resolve({
          success: false,
          message: 'Código QR no válido o no registrado localmente'
        });
        return;
      }

      // Validar que pertenezca al evento seleccionado
      if (idEventoSeleccionado && inscrito.id_evento !== parseInt(idEventoSeleccionado)) {
        resolve({
          success: false,
          message: 'Esta entrada pertenece a otro evento'
        });
        return;
      }

      const id_checkpoint_num = idCheckpoint ? parseInt(idCheckpoint) : null;

      if (id_checkpoint_num !== null) {
        // Validación de checkpoint offline: verificar duplicado en cola local
        const yaEscaneadoCheckpoint = cola.some(c => 
          c.id_inscripcion === inscrito.id_inscripcion && 
          c.id_checkpoint === id_checkpoint_num
        );
        if (yaEscaneadoCheckpoint) {
          resolve({
            success: false,
            message: 'Ya se registró asistencia en este checkpoint para este miembro localmente'
          });
          return;
        }

        // Registrar escaneo en cola local
        storeCola.add({
          codigo_qr: codigoQR,
          id_checkpoint: id_checkpoint_num,
          id_inscripcion: inscrito.id_inscripcion,
          fecha_escaneo: new Date().toISOString(),
          nombre_completo: inscrito.nombre_completo,
          id_evento: inscrito.id_evento
        });

        // Habilitar asistencia general localmente si no estaba
        if (!inscrito.asistio) {
          inscrito.asistio = true;
          storeInscritos.put(inscrito);
        }

        notificarCambioOffline();

        resolve({
          success: true,
          usuario: { nombre: inscrito.nombre_completo },
          message: 'Asistencia registrada con éxito (Modo Offline)'
        });
      } else {
        // Entrada General offline
        const yaEscaneadoGeneral = inscrito.asistio || cola.some(c => 
          c.id_inscripcion === inscrito.id_inscripcion && 
          c.id_checkpoint === null
        );

        if (yaEscaneadoGeneral) {
          resolve({
            success: false,
            message: 'Esta entrada ya fue escaneada anteriormente'
          });
          return;
        }

        // Registrar escaneo en cola local
        storeCola.add({
          codigo_qr: codigoQR,
          id_checkpoint: null,
          id_inscripcion: inscrito.id_inscripcion,
          fecha_escaneo: new Date().toISOString(),
          nombre_completo: inscrito.nombre_completo,
          id_evento: inscrito.id_evento
        });

        // Actualizar registro local
        inscrito.asistio = true;
        storeInscritos.put(inscrito);

        notificarCambioOffline();

        resolve({
          success: true,
          usuario: { nombre: inscrito.nombre_completo },
          message: 'Asistencia general registrada con éxito (Modo Offline)'
        });
      }
    };
  });
};

export const obtenerColaAsistencia = async () => {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['cola_asistencia'], 'readonly');
    const store = transaction.objectStore('cola_asistencia');
    const request = store.getAll();

    request.onerror = (event) => {
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      resolve(event.target.result || []);
    };
  });
};

export const eliminarDeCola = async (id) => {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['cola_asistencia'], 'readwrite');
    const store = transaction.objectStore('cola_asistencia');
    const request = store.delete(id);

    request.onerror = (event) => {
      reject(event.target.error);
    };

    request.onsuccess = () => {
      notificarCambioOffline();
      resolve(true);
    };
  });
};

// ==========================================
// NUEVO: GESTIÓN DE COLA DE INSCRIPCIONES OFFLINE
// ==========================================

const generarIdempotencyKey = () => {
  if (typeof crypto !== 'undefined') {
    if (typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    if (typeof crypto.getRandomValues === 'function') {
      const buffer = new Uint8Array(16);
      crypto.getRandomValues(buffer);
      return Array.from(buffer, (b) => b.toString(16).padStart(2, '0')).join('');
    }
  }
  return `offline_${Date.now()}_key`;
};

export const agregarInscripcionOffline = async ({
  id_evento,
  titulo_evento = '',
  id_usuario = null,
  correo_usuario = '',
  nombre_usuario = '',
}) => {
  const db = await abrirDB();
  const colaExistente = await obtenerColaInscripciones();

  // Verificar si ya está en cola pendiente para evitar duplicar localmente
  const idEventoNum = Number.parseInt(id_evento, 10);
  const yaEncolada = colaExistente.some(
    (item) =>
      item.id_evento === idEventoNum &&
      (!id_usuario || item.id_usuario === id_usuario) &&
      item.estado === 'PENDIENTE'
  );

  if (yaEncolada) {
    return {
      success: false,
      alreadyEnqueued: true,
      message: 'Esta inscripción ya se encuentra pendiente en la cola de sincronización',
    };
  }

  const idempotency_key = generarIdempotencyKey();

  const nuevoRegistro = {
    id_evento: idEventoNum,
    titulo_evento: titulo_evento || `Evento #${id_evento}`,
    id_usuario: id_usuario || null,
    correo_usuario: correo_usuario || '',
    nombre_usuario: nombre_usuario || '',
    idempotency_key,
    fecha_creacion: new Date().toISOString(),
    estado: 'PENDIENTE', // 'PENDIENTE' | 'ERROR' | 'SINCRONIZADO'
    error_detalle: null,
    intentos: 0,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['cola_inscripciones'], 'readwrite');
    const store = transaction.objectStore('cola_inscripciones');
    const request = store.add(nuevoRegistro);

    request.onerror = (event) => {
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      nuevoRegistro.id = event.target.result;
      notificarCambioOffline();
      resolve({
        success: true,
        alreadyEnqueued: false,
        item: nuevoRegistro,
        message: 'Inscripción guardada en cola local offline',
      });
    };
  });
};

export const obtenerColaInscripciones = async () => {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['cola_inscripciones'], 'readonly');
    const store = transaction.objectStore('cola_inscripciones');
    const request = store.getAll();

    request.onerror = (event) => {
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      resolve(event.target.result || []);
    };
  });
};

export const actualizarInscripcionOffline = async (id, updates) => {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['cola_inscripciones'], 'readwrite');
    const store = transaction.objectStore('cola_inscripciones');
    const getReq = store.get(id);

    getReq.onerror = (event) => reject(event.target.error);

    getReq.onsuccess = (event) => {
      const item = event.target.result;
      if (!item) {
        resolve(null);
        return;
      }

      const updated = { ...item, ...updates };
      const putReq = store.put(updated);
      putReq.onerror = (ev) => reject(ev.target.error);
      putReq.onsuccess = () => {
        notificarCambioOffline();
        resolve(updated);
      };
    };
  });
};

export const eliminarInscripcionOffline = async (id) => {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['cola_inscripciones'], 'readwrite');
    const store = transaction.objectStore('cola_inscripciones');
    const request = store.delete(id);

    request.onerror = (event) => reject(event.target.error);
    request.onsuccess = () => {
      notificarCambioOffline();
      resolve(true);
    };
  });
};

export const limpiarColaInscripciones = async () => {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['cola_inscripciones'], 'readwrite');
    const store = transaction.objectStore('cola_inscripciones');
    const request = store.clear();

    request.onerror = (event) => reject(event.target.error);
    request.onsuccess = () => {
      notificarCambioOffline();
      resolve(true);
    };
  });
};

export const obtenerTotalPendientesOffline = async () => {
  try {
    const asistencias = await obtenerColaAsistencia();
    const inscripciones = await obtenerColaInscripciones();
    const inscripcionesPendientes = inscripciones.filter(
      (i) => i.estado === 'PENDIENTE' || i.estado === 'ERROR'
    );
    const errores = inscripciones.filter((i) => i.estado === 'ERROR').length;

    return {
      total: asistencias.length + inscripcionesPendientes.length,
      asistencias: asistencias.length,
      inscripciones: inscripcionesPendientes.length,
      inscripcionesError: errores,
      tieneErrores: errores > 0,
    };
  } catch (err) {
    console.error('Error al obtener total pendientes offline:', err);
    return {
      total: 0,
      asistencias: 0,
      inscripciones: 0,
      inscripcionesError: 0,
      tieneErrores: false,
    };
  }
};

export const sincronizarInscripcionItem = async (item, api) => {
  try {
    const res = await api.post(
      `/inscripciones/eventos/${item.id_evento}`,
      {},
      {
        headers: {
          'X-Idempotency-Key': item.idempotency_key,
        },
      }
    );

    // Sincronización exitosa -> eliminar de cola
    await eliminarInscripcionOffline(item.id);
    notificarCambioOffline();
    return {
      success: true,
      id: item.id,
      data: res.data,
      message: 'Inscripción sincronizada con éxito',
    };
  } catch (err) {
    const status = err.response?.status;
    const detail =
      err.response?.data?.detail || err.message || 'Error desconocido al sincronizar';

    // Conflictos conocidos (409 o 400 por cupo/duplicado)
    const isConflict = status === 409 || status === 400;
    let errorPrefix = 'Error de red: ';
    if (status === 409) {
      errorPrefix = 'Conflicto (409): ';
    } else if (status) {
      errorPrefix = `[${status}]: `;
    }
    const mensajeError = `${errorPrefix}${detail}`;

    await actualizarInscripcionOffline(item.id, {
      estado: isConflict ? 'ERROR' : 'PENDIENTE',
      error_detalle: mensajeError,
      intentos: (item.intentos || 0) + 1,
    });

    notificarCambioOffline();
    return {
      success: false,
      id: item.id,
      status,
      error: mensajeError,
      isConflict,
    };
  }
};

export const sincronizarColaInscripciones = async (api) => {
  const cola = await obtenerColaInscripciones();
  const pendientes = cola.filter((i) => i.estado === 'PENDIENTE' || i.estado === 'ERROR');

  const resultados = await Promise.all(
    pendientes.map((item) => sincronizarInscripcionItem(item, api))
  );

  const exitosos = resultados.filter((r) => r.success).length;
  const fallidos = resultados.filter((r) => !r.success).length;

  return {
    total: pendientes.length,
    exitosos,
    fallidos,
    resultados,
  };
};

export const limpiarBaseLocal = async () => {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const stores = ['eventos', 'inscritos', 'cola_asistencia'];
    if (db.objectStoreNames.contains('cola_inscripciones')) {
      stores.push('cola_inscripciones');
    }

    const transaction = db.transaction(stores, 'readwrite');

    transaction.onerror = (event) => {
      reject(event.target.error);
    };

    transaction.oncomplete = () => {
      notificarCambioOffline();
      resolve(true);
    };

    stores.forEach((storeName) => {
      transaction.objectStore(storeName).clear();
    });
  });
};

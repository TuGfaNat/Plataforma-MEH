const DB_NAME = 'meh_offline_db';
const DB_VERSION = 1;

export const abrirDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

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
      resolve(true);
    };
  });
};

export const limpiarBaseLocal = async () => {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['eventos', 'inscritos', 'cola_asistencia'], 'readwrite');
    
    transaction.onerror = (event) => {
      reject(event.target.error);
    };

    transaction.oncomplete = () => {
      resolve(true);
    };

    transaction.objectStore('eventos').clear();
    transaction.objectStore('inscritos').clear();
    transaction.objectStore('cola_asistencia').clear();
  });
};

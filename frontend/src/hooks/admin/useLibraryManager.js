import { useState } from 'react';
import api from '../../services/api';
import recursoService from '../../services/recursoService';

export const useLibraryManager = (notify, refreshGlobalData) => {
  const [isEditingRecurso, setIsEditingRecurso] = useState(false);
  const [currentRecursoId, setCurrentRecursoId] = useState(null);
  const [newRecurso, setNewRecurso] = useState({ 
    titulo: '', 
    descripcion: '', 
    motivo: '', 
    autor_nombre: '', 
    url_descarga: '', 
    portada_url: '', 
    tipo_archivo: '', 
    tipo_recurso: 'ARCHIVO', 
    contenido_md: '', 
    categoria: 'GENERAL', 
    id_curso: null, 
    id_evento: null 
  });

  const handleSaveRecurso = async () => {
    try {
      if (isEditingRecurso) {
        await api.put(`/recursos/${currentRecursoId}`, newRecurso);
        notify("Éxito", "Recurso actualizado", "success");
      } else {
        await recursoService.createRecurso(newRecurso);
        notify("Éxito", "Recurso publicado", "success");
      }
      setNewRecurso({ titulo: '', descripcion: '', motivo: '', autor_nombre: '', url_descarga: '', portada_url: '', tipo_archivo: '', tipo_recurso: 'ARCHIVO', contenido_md: '', categoria: 'GENERAL', id_curso: null, id_evento: null });
      setIsEditingRecurso(false);
      refreshGlobalData();
    } catch (e) {
      notify("Error", "Fallo al guardar recurso", "error");
    }
  };

  const handleEditRecurso = (r) => {
    setNewRecurso({
      titulo: r.titulo,
      descripcion: r.descripcion || '',
      motivo: r.motivo || '',
      autor_nombre: r.autor_nombre || '',
      url_descarga: r.url_descarga || '',
      portada_url: r.portada_url || '',
      tipo_archivo: r.tipo_archivo || '',
      tipo_recurso: r.tipo_recurso || 'ARCHIVO',
      contenido_md: r.contenido_md || '',
      categoria: r.categoria || 'GENERAL',
      id_curso: r.id_curso,
      id_evento: r.id_evento
    });
    setCurrentRecursoId(r.id_recurso);
    setIsEditingRecurso(true);
  };

  return {
    isEditingRecurso, setIsEditingRecurso,
    currentRecursoId, setCurrentRecursoId,
    newRecurso, setNewRecurso,
    handleSaveRecurso, handleEditRecurso
  };
};

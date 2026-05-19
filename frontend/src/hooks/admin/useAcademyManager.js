import { useState, useCallback } from 'react';
import api from '../../services/api';

export const useAcademyManager = (notify, refreshGlobalData) => {
  const [selectedCursoId, setSelectedCursoId] = useState(null);
  const [isAddingCurso, setIsAddingCurso] = useState(false);
  const [isEditingCurso, setIsEditingCurso] = useState(false);
  const [newCurso, setNewCurso] = useState({ nombre_curso: '', descripcion: '', horas_academicas: 10, imagen_url: '' });
  const [lecciones, setLecciones] = useState([]);
  const [isAddingLeccion, setIsAddingLeccion] = useState(false);
  const [isEditingLeccion, setIsEditingLeccion] = useState(false);
  const [currentLeccionId, setCurrentLeccionId] = useState(null);
  const [newLeccion, setNewLeccion] = useState({ titulo: '', contenido_video_url: '', contenido_texto: '', orden: 1 });

  const fetchLecciones = useCallback(async (id) => {
    try {
      const res = await api.get(`/academia/cursos/${id}/lecciones`);
      setLecciones(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleSaveCurso = async () => {
    try {
      if (isEditingCurso) {
        await api.put(`/cursos/${selectedCursoId}`, newCurso);
        notify("Éxito", "Programa actualizado", "success");
      } else {
        await api.post('/cursos/', newCurso);
        notify("Éxito", "Programa lanzado", "success");
      }
      setNewCurso({ nombre_curso: '', descripcion: '', horas_academicas: 10, imagen_url: '' });
      setIsAddingCurso(false);
      setIsEditingCurso(false);
      refreshGlobalData();
    } catch (e) {
      notify("Error", "Fallo al guardar curso", "error");
    }
  };

  const handleEditCurso = (c) => {
    setNewCurso({
      nombre_curso: c.nombre_curso,
      descripcion: c.descripcion || '',
      horas_academicas: c.horas_academicas || 10,
      imagen_url: c.imagen_url || ''
    });
    setSelectedCursoId(c.id_curso);
    setIsEditingCurso(true);
    setIsAddingCurso(true);
  };

  const handleSaveLeccion = async () => {
    try {
      if (isEditingLeccion) await api.put(`/academia/lecciones/${currentLeccionId}`, newLeccion);
      else await api.post('/academia/lecciones', { ...newLeccion, id_curso: selectedCursoId });
      notify("Éxito", "Lección guardada", "success");
      setIsAddingLeccion(false);
      setIsEditingLeccion(false);
      fetchLecciones(selectedCursoId);
    } catch (e) {
      notify("Error", "Fallo al guardar", "error");
    }
  };

  const handleEditLeccion = (l) => {
    setNewLeccion({
      titulo: l.titulo,
      contenido_video_url: l.contenido_video_url || '',
      contenido_texto: l.contenido_texto || '',
      orden: l.orden
    });
    setCurrentLeccionId(l.id_leccion);
    setIsEditingLeccion(true);
    setIsAddingLeccion(true);
  };

  return {
    selectedCursoId, setSelectedCursoId,
    isAddingCurso, setIsAddingCurso,
    isEditingCurso, setIsEditingCurso,
    newCurso, setNewCurso,
    handleSaveCurso, handleEditCurso,
    lecciones, setLecciones, fetchLecciones,
    isAddingLeccion, setIsAddingLeccion,
    isEditingLeccion, setIsEditingLeccion,
    currentLeccionId, setCurrentLeccionId,
    newLeccion, setNewLeccion,
    handleSaveLeccion, handleEditLeccion
  };
};

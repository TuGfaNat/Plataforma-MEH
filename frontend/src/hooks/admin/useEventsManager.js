import { useState } from 'react';
import api from '../../services/api';

export const useEventsManager = (notify, refreshGlobalData) => {
  const [selectedEventoId, setSelectedEventoId] = useState(null);
  const [isAddingEvento, setIsAddingEvento] = useState(false);
  const [isEditingEvento, setIsEditingEvento] = useState(false);
  const [newEvento, setNewEvento] = useState({ 
    titulo: '', 
    descripcion: '', 
    tipo_evento: 'CONFERENCIA', 
    fecha_inicio: '', 
    hora_inicio: '', 
    modalidad: 'PRESENCIAL', 
    ubicacion: '', 
    link_mapas: '', 
    capacidad_max: 50, 
    refrigerio_incluido: false 
  });

  const handleSaveEvento = async (eventData) => {
    const dataToSave = eventData || newEvento;
    try {
      if (isEditingEvento) {
        await api.put(`/eventos/${selectedEventoId}`, dataToSave);
        notify("Éxito", "Evento actualizado", "success");
      } else {
        await api.post('/eventos/', dataToSave);
        notify("Éxito", "Evento publicado", "success");
      }
      setNewEvento({ titulo: '', descripcion: '', tipo_evento: 'CONFERENCIA', fecha_inicio: '', hora_inicio: '', modalidad: 'PRESENCIAL', ubicacion: '', link_mapas: '', capacidad_max: 50, refrigerio_incluido: false });
      setIsAddingEvento(false);
      setIsEditingEvento(false);
      refreshGlobalData();
    } catch (e) {
      notify("Error", "Fallo al guardar evento", "error");
    }
  };

  const handleEditEvento = (ev) => {
    setNewEvento({
      titulo: ev.titulo,
      descripcion: ev.descripcion || '',
      tipo_evento: ev.tipo_evento,
      fecha_inicio: ev.fecha_inicio.split('T')[0],
      hora_inicio: ev.hora_inicio || '18:00',
      modalidad: ev.modalidad,
      ubicacion: ev.ubicacion || '',
      link_mapas: ev.link_mapas || '',
      capacidad_max: ev.capacidad_max,
      refrigerio_incluido: ev.refrigerio_incluido
    });
    setSelectedEventoId(ev.id_evento);
    setIsEditingEvento(true);
    setIsAddingEvento(true);
  };

  return {
    selectedEventoId, setSelectedEventoId,
    isAddingEvento, setIsAddingEvento,
    isEditingEvento, setIsEditingEvento,
    newEvento, setNewEvento,
    handleSaveEvento, handleEditEvento
  };
};

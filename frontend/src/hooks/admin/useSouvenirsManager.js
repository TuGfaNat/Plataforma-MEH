import { useState } from 'react';
import adminService from '../../services/adminService';

export const useSouvenirsManager = (notify, refreshGlobalData) => {
  const [isEditingSouvenir, setIsEditingSouvenir] = useState(false);
  const [currentSouvenirId, setCurrentSouvenirId] = useState(null);
  const [newSouvenir, setNewSouvenir] = useState({ 
    nombre: '', 
    descripcion: '', 
    precio: 0, 
    stock: 10, 
    imagen_url: '', 
    categoria: 'SOUVENIR' 
  });

  const handleSaveSouvenir = async () => {
    try {
      if (isEditingSouvenir) {
        await adminService.updateSouvenir(currentSouvenirId, newSouvenir);
        notify("Éxito", "Producto actualizado", "success");
      } else {
        await adminService.createSouvenir(newSouvenir);
        notify("Éxito", "Producto agregado", "success");
      }
      setNewSouvenir({ nombre: '', descripcion: '', precio: 0, stock: 10, imagen_url: '', categoria: 'SOUVENIR' });
      setIsEditingSouvenir(false);
      refreshGlobalData();
    } catch (e) {
      notify("Error", "Fallo al guardar producto", "error");
    }
  };

  const handleEditSouvenir = (s) => {
    setNewSouvenir({
      nombre: s.nombre,
      descripcion: s.descripcion || '',
      precio: s.precio,
      stock: s.stock,
      imagen_url: s.imagen_url || '',
      categoria: s.categoria || 'SOUVENIR'
    });
    setCurrentSouvenirId(s.id_producto);
    setIsEditingSouvenir(true);
  };

  return {
    isEditingSouvenir, setIsEditingSouvenir,
    currentSouvenirId, setCurrentSouvenirId,
    newSouvenir, setNewSouvenir,
    handleSaveSouvenir, handleEditSouvenir
  };
};

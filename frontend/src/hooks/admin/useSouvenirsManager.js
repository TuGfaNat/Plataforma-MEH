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
    qr_url: '',
    categoria: 'SOUVENIR',
    tiene_tallas: false,
    tallas_disponibles: 'S, M, L, XL',
    tallas_stock: { S: 5, M: 10, L: 8, XL: 2 },
    id_estado: 2,
    activo: true
  });

  const handleSaveSouvenir = async () => {
    try {
      const payload = {
        ...newSouvenir,
        tallas_stock: newSouvenir.tiene_tallas && newSouvenir.tallas_stock
          ? (typeof newSouvenir.tallas_stock === 'string' ? newSouvenir.tallas_stock : JSON.stringify(newSouvenir.tallas_stock))
          : null
      };
      if (isEditingSouvenir) {
        await adminService.updateSouvenir(currentSouvenirId, payload);
        notify("Éxito", "Producto actualizado", "success");
      } else {
        await adminService.createSouvenir(payload);
        notify("Éxito", "Producto agregado", "success");
      }
      setNewSouvenir({ nombre: '', descripcion: '', precio: 0, stock: 10, imagen_url: '', qr_url: '', categoria: 'SOUVENIR', tiene_tallas: false, tallas_disponibles: 'S, M, L, XL', tallas_stock: { S: 5, M: 10, L: 8, XL: 2 }, id_estado: 2, activo: true });
      setIsEditingSouvenir(false);
      refreshGlobalData();
    } catch (e) {
      notify("Error", "Fallo al guardar producto", "error");
    }
  };

  const handleEditSouvenir = (s) => {
    let parsedTallasStock = { S: 5, M: 10, L: 8, XL: 2 };
    if (s.tallas_stock) {
      try {
        parsedTallasStock = typeof s.tallas_stock === 'object' ? s.tallas_stock : JSON.parse(s.tallas_stock);
      } catch {
        parsedTallasStock = { S: 5, M: 10, L: 8, XL: 2 };
      }
    } else if (s.tallas_disponibles) {
      const parts = s.tallas_disponibles.split(',').map(t => t.trim()).filter(Boolean);
      if (parts.length > 0) {
        parsedTallasStock = {};
        const avg = Math.floor((s.stock || 10) / parts.length);
        parts.forEach((p, idx) => {
          parsedTallasStock[p] = idx === 0 ? (s.stock || 10) - avg * (parts.length - 1) : avg;
        });
      }
    }

    setNewSouvenir({
      nombre: s.nombre,
      descripcion: s.descripcion || '',
      precio: s.precio,
      stock: s.stock,
      imagen_url: s.imagen_url || '',
      qr_url: s.qr_url || '',
      categoria: s.categoria || 'SOUVENIR',
      tiene_tallas: Boolean(s.tiene_tallas),
      tallas_disponibles: s.tallas_disponibles || 'S, M, L, XL',
      tallas_stock: parsedTallasStock,
      id_estado: s.id_estado ?? 2,
      activo: s.activo ?? true
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

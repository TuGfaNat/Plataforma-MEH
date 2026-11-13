import React from 'react';
import { 
  Table, TableBody, TableRow, TableCell, Badge, Spinner, Field, Input, tokens, makeStyles, shorthands, 
  Avatar, Button, Tooltip, Textarea, Switch
} from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { 
  Add24Regular, ArrowUpload24Regular, Edit20Regular, Delete20Regular, 
  Box24Filled, Money20Regular, Info20Regular, Search24Regular, Link20Regular, Open20Regular,
  Receipt24Regular, Dismiss24Regular
} from '@fluentui/react-icons';
import { MEHButton, MEHTypography } from '../../components/ui';
import adminService from '../../services/adminService';
import VentaSouvenirModal from '../../components/VentaSouvenirModal';
import HistorialVentasSouvenirsModal from '../../components/HistorialVentasSouvenirsModal';
import { useNotify } from '../../App';

const useStyles = makeStyles({
  grid: { 
    display: 'grid', 
    gridTemplateColumns: '1fr 1.5fr', 
    gap: '32px',
    '@media (max-width: 900px)': { gridTemplateColumns: '1fr' }
  },
  formPanel: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '20px', 
    padding: '28px', 
    minWidth: 0,
    maxWidth: '100%',
    boxSizing: 'border-box',
    backgroundColor: tokens.colorNeutralBackground2, 
    ...shorthands.borderRadius('24px'), 
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3),
    boxShadow: tokens.shadow4,
    '@media (max-width: 600px)': {
      padding: '16px 14px',
      ...shorthands.borderRadius('16px'),
      gap: '14px',
    }
  },
  rowTwo: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    '@media (max-width: 600px)': {
      gridTemplateColumns: '1fr',
      gap: '12px',
    }
  },
  tableWrapper: { 
    width: '100%', 
    overflowX: 'auto', 
    ...shorthands.borderRadius('24px'), 
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3), 
    backgroundColor: tokens.colorNeutralBackground1, 
    boxShadow: tokens.shadow8,
    '@media (max-width: 720px)': {
      display: 'none',
    }
  },
  mobileCardsWrapper: {
    display: 'none',
    '@media (max-width: 720px)': {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      width: '100%',
      boxSizing: 'border-box',
    }
  },
  mobileProductCard: {
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius('16px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3),
    padding: '16px',
    boxShadow: tokens.shadow4,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxSizing: 'border-box',
    width: '100%',
  },
  userRow: { 
    height: '90px', 
    transition: 'all 0.2s ease', 
    ':hover': { backgroundColor: tokens.colorNeutralBackground2 } 
  },
  uploadBox: { 
    ...shorthands.border('2px', 'dashed', tokens.colorBrandStroke1), 
    ...shorthands.padding('12px'), 
    ...shorthands.borderRadius('16px'), 
    textAlign: 'center', 
    cursor: 'pointer', 
    backgroundColor: tokens.colorNeutralBackground1, 
    transition: 'all 0.2s ease', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: '8px', 
    minHeight: '120px',
    position: 'relative',
    overflow: 'hidden',
    ':hover': { backgroundColor: tokens.colorBrandBackground2, ...shorthands.borderColor(tokens.colorBrandBackground) } 
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0.4
  },
  uploadContent: {
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px'
  },
  actionsCell: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    height: '100%'
  }
});

const renderTallasStockBadges = (item) => {
  if (!item.tiene_tallas) return null;
  let st = {};
  if (item.tallas_stock) {
    try {
      st = typeof item.tallas_stock === 'object' ? item.tallas_stock : JSON.parse(item.tallas_stock);
    } catch {
      st = {};
    }
  }
  const entries = Object.entries(st);
  if (entries.length === 0) {
    return (
      <Badge appearance="tint" color="informative" size="small">
        Tallas: {item.tallas_disponibles || 'S, M, L, XL'}
      </Badge>
    );
  }
  return (
    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
      {entries.map(([talla, cant]) => {
        const c = Number(cant) || 0;
        return (
          <Badge
            key={talla}
            size="small"
            appearance="tint"
            color={c <= 0 ? 'danger' : (c <= 2 ? 'warning' : 'brand')}
          >
            {talla}: {c <= 0 ? 'Agotado' : `${c} u.`}
          </Badge>
        );
      })}
    </div>
  );
};

const SouvenirsTab = ({ 
  data, newSouvenir, setNewSouvenir, isEditingSouvenir, setIsEditingSouvenir, uploading, 
  handleFileUpload, handleSaveSouvenir, handleEditSouvenir, confirmDelete, fetchData
}) => {
  const styles = useStyles();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [nuevaTallaInput, setNuevaTallaInput] = React.useState('');
  const [isVentaModalOpen, setIsVentaModalOpen] = React.useState(false);
  const [isHistorialModalOpen, setIsHistorialModalOpen] = React.useState(false);
  const { notify } = useNotify();
  const [updatingId, setUpdatingId] = React.useState(null);

  const handleAddTalla = () => {
    const val = nuevaTallaInput.trim().toUpperCase();
    if (!val) return;
    const current = { ...(newSouvenir.tallas_stock || {}) };
    if (current[val] === undefined) {
      current[val] = 5;
      const sumStock = Object.values(current).reduce((a, b) => a + Number(b || 0), 0);
      setNewSouvenir({
        ...newSouvenir,
        tallas_stock: current,
        stock: sumStock,
        tallas_disponibles: Object.keys(current).join(', ')
      });
    }
    setNuevaTallaInput('');
  };

  const handleToggleStatus = async (item, checked) => {
    const newStatus = checked ? 2 : 1;
    setUpdatingId(item.id_producto);
    try {
      await adminService.updateSouvenir(item.id_producto, { 
        id_estado: newStatus,
        activo: checked
      });
      notify(
        checked ? "Souvenir Activado" : "Souvenir Desactivado",
        `"${item.nombre}" ahora está ${checked ? 'ACTIVO (visible en catálogo)' : 'INACTIVO (oculto del catálogo)'}.`,
        "success"
      );
      if (fetchData) await fetchData();
    } catch (err) {
      console.error("Error al actualizar estado del souvenir:", err);
      notify("Error", "No se pudo cambiar el estado del souvenir.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredData = React.useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(i => 
      (i.nombre && i.nombre.toLowerCase().includes(term)) ||
      (i.descripcion && i.descripcion.toLowerCase().includes(term))
    );
  }, [data, searchTerm]);

  return (
    <div className={styles.grid}>
      <div className={styles.formPanel}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ backgroundColor: tokens.colorBrandBackground, padding: '10px', borderRadius: '12px', color: 'white' }}>
            <Add24Regular />
          </div>
          <MEHTypography variant="h3">
            {isEditingSouvenir ? t("admin_adjust") : t("admin_new")} {t("admin_product")}
          </MEHTypography>
        </div>

        <Field label={t("admin_product_name")} required>
          <Input 
            placeholder={t("admin_product_name_placeholder")}
            value={newSouvenir.nombre} 
            onChange={(e, d) => setNewSouvenir({...newSouvenir, nombre: d.value})} 
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </Field>

        <Field label={t("admin_description")}>
          <Input 
            placeholder={t("admin_description_placeholder")}
            value={newSouvenir.descripcion} 
            onChange={(e, d) => setNewSouvenir({...newSouvenir, descripcion: d.value})} 
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </Field>

        <div className={styles.rowTwo}>
          <Field label={t("admin_price")} required>
            <Input 
              type="number" 
              contentBefore={<Money20Regular />} 
              value={newSouvenir.precio} 
              onChange={(e, d) => setNewSouvenir({...newSouvenir, precio: d.value})} 
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </Field>
          <Field label={t("admin_initial_stock")} required>
            <Input 
              type="number" 
              contentBefore={<Box24Filled fontSize="16px" />}
              value={newSouvenir.stock} 
              onChange={(e, d) => setNewSouvenir({...newSouvenir, stock: d.value})} 
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </Field>
        </div>

        <div className={styles.rowTwo}>
          <Field label={t("admin_product_image") || "Foto del Producto"}>
            <div 
              className={styles.uploadBox} 
              role="button"
              tabIndex={0}
              aria-label={newSouvenir.imagen_url ? t("admin_change_image") : t("admin_upload_image")}
              onClick={() => document.getElementById('souv-file')?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  document.getElementById('souv-file')?.click();
                }
              }}
            >
              {uploading ? (
                <Spinner size="medium" label={t("uploading")} />
              ) : (
                <>
                  {newSouvenir.imagen_url && (
                    <img src={newSouvenir.imagen_url} alt={`Vista previa de ${newSouvenir.nombre || 'souvenir'}`} className={styles.previewImage} />
                  )}
                  <div className={styles.uploadContent}>
                    <ArrowUpload24Regular aria-hidden="true" /> 
                    <MEHTypography variant="caption">
                      {newSouvenir.imagen_url ? "Cambiar Foto" : "Subir Foto Producto"}
                    </MEHTypography>
                  </div>
                  <input 
                    id="souv-file" 
                    type="file" 
                    accept="image/*" 
                    aria-label={newSouvenir.imagen_url ? t("admin_change_image") : t("admin_upload_image")}
                    onChange={(e) => handleFileUpload(e, setNewSouvenir, newSouvenir, 'imagen_url')} 
                    style={{ display: 'none' }} 
                  />
                </>
              )}
            </div>
          </Field>

          <Field label="QR de Pago (Simple / Banco)">
            <div 
              className={styles.uploadBox} 
              role="button"
              tabIndex={0}
              aria-label={newSouvenir.qr_url ? "Cambiar QR de Pago" : "Subir QR de Pago"}
              onClick={() => document.getElementById('souv-qr-file')?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  document.getElementById('souv-qr-file')?.click();
                }
              }}
            >
              {uploading ? (
                <Spinner size="medium" label={t("uploading")} />
              ) : (
                <>
                  {newSouvenir.qr_url && (
                    <img src={newSouvenir.qr_url} alt={`QR de Pago de ${newSouvenir.nombre || 'souvenir'}`} className={styles.previewImage} />
                  )}
                  <div className={styles.uploadContent}>
                    <ArrowUpload24Regular aria-hidden="true" /> 
                    <MEHTypography variant="caption">
                      {newSouvenir.qr_url ? "Cambiar QR" : "Subir QR Simple/Banco"}
                    </MEHTypography>
                  </div>
                  <input 
                    id="souv-qr-file" 
                    type="file" 
                    accept="image/*" 
                    aria-label={newSouvenir.qr_url ? "Cambiar QR de Pago" : "Subir QR de Pago"}
                    onChange={(e) => handleFileUpload(e, setNewSouvenir, newSouvenir, 'qr_url')} 
                    style={{ display: 'none' }} 
                  />
                </>
              )}
            </div>
          </Field>
        </div>

        {/* Selector de Tallas con Control de Inventario */}
        <div style={{ 
          padding: '14px', 
          backgroundColor: tokens.colorNeutralBackground3, 
          borderRadius: '14px', 
          border: `1px solid ${tokens.colorNeutralStroke2}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <Switch 
            label="¿Este producto tiene control de inventario por tallas? (Poleras, buzos, gorras...)"
            checked={Boolean(newSouvenir.tiene_tallas)} 
            onChange={(e, d) => {
              const defaultStock = { S: 5, M: 10, L: 8, XL: 2 };
              const currentStock = (newSouvenir.tallas_stock && Object.keys(newSouvenir.tallas_stock).length > 0) 
                ? newSouvenir.tallas_stock 
                : defaultStock;
              const totalStock = d.checked ? Object.values(currentStock).reduce((a, b) => a + Number(b || 0), 0) : newSouvenir.stock;
              setNewSouvenir({
                ...newSouvenir, 
                tiene_tallas: d.checked,
                tallas_stock: d.checked ? currentStock : null,
                stock: totalStock,
                tallas_disponibles: d.checked ? Object.keys(currentStock).join(', ') : ''
              });
            }} 
          />
          {Boolean(newSouvenir.tiene_tallas) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '4px' }}>
              <MEHTypography variant="caption" style={{ fontWeight: '600' }}>
                👕 Inventario / Cantidad disponible por cada talla:
              </MEHTypography>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
                {Object.entries(newSouvenir.tallas_stock || {}).map(([talla, cant]) => (
                  <div 
                    key={talla} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '8px 10px', 
                      backgroundColor: tokens.colorNeutralBackground1, 
                      borderRadius: '8px', 
                      border: `1px solid ${Number(cant) <= 0 ? tokens.colorPaletteRedBorder2 : tokens.colorNeutralStroke1}`
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: '40px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{talla}</span>
                      <span style={{ fontSize: '10px', opacity: 0.6 }}>{Number(cant) <= 0 ? 'Agotado' : 'Disp.'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Input
                        type="number"
                        min="0"
                        style={{ width: '65px' }}
                        size="small"
                        value={cant !== undefined ? cant.toString() : '0'}
                        onChange={(e, data) => {
                          const val = Math.max(0, parseInt(data.value || '0', 10));
                          const updated = { ...(newSouvenir.tallas_stock || {}), [talla]: val };
                          const sumStock = Object.values(updated).reduce((a, b) => a + Number(b || 0), 0);
                          setNewSouvenir({
                            ...newSouvenir,
                            tallas_stock: updated,
                            stock: sumStock,
                            tallas_disponibles: Object.keys(updated).join(', ')
                          });
                        }}
                      />
                      <Button
                        size="small"
                        appearance="subtle"
                        icon={<Dismiss24Regular />}
                        style={{ minWidth: '24px', padding: '0 4px', color: tokens.colorPaletteRedForeground1 }}
                        title="Eliminar talla"
                        onClick={() => {
                          const updated = { ...(newSouvenir.tallas_stock || {}) };
                          delete updated[talla];
                          const sumStock = Object.values(updated).reduce((a, b) => a + Number(b || 0), 0);
                          setNewSouvenir({
                            ...newSouvenir,
                            tallas_stock: updated,
                            stock: sumStock,
                            tallas_disponibles: Object.keys(updated).join(', ')
                          });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Agregar Talla Personalizada o Botones Rápidos */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '4px' }}>
                <Input
                  size="small"
                  placeholder="Nueva talla (ej: XS, XXL, 14)"
                  value={nuevaTallaInput}
                  onChange={(e, d) => setNuevaTallaInput(d.value)}
                  style={{ maxWidth: '200px' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTalla();
                    }
                  }}
                />
                <Button size="small" appearance="outline" onClick={handleAddTalla}>
                  + Añadir Talla
                </Button>
                <Button 
                  size="small" 
                  appearance="subtle" 
                  onClick={() => {
                    const defaults = { S: 5, M: 10, L: 8, XL: 2 };
                    const merged = { ...defaults, ...(newSouvenir.tallas_stock || {}) };
                    const sumStock = Object.values(merged).reduce((a, b) => a + Number(b || 0), 0);
                    setNewSouvenir({
                      ...newSouvenir,
                      tallas_stock: merged,
                      stock: sumStock,
                      tallas_disponibles: Object.keys(merged).join(', ')
                    });
                  }}
                >
                  Cargar S, M, L, XL
                </Button>
              </div>

              <div style={{ fontSize: '11px', color: tokens.colorBrandForeground1, marginTop: '2px' }}>
                💡 El stock total del producto se calcula automáticamente sumando las existencias de cada talla.
              </div>
            </div>
          )}
        </div>

        <div style={{ margin: '4px 0' }}>
          <Switch 
            label={newSouvenir.id_estado === 1 ? "Inactivo (Oculto en catálogo)" : "Activo (Visible en catálogo)"} 
            checked={newSouvenir.id_estado !== 1} 
            onChange={(e, d) => setNewSouvenir({...newSouvenir, id_estado: d.checked ? 2 : 1, activo: d.checked})} 
          />
        </div>

        <MEHButton 
          appearance="primary" 
          size="large"
          icon={isEditingSouvenir ? <Edit20Regular /> : <Add24Regular />}
          onClick={handleSaveSouvenir}
          style={{ marginTop: '10px' }}
        >
          {isEditingSouvenir ? t("admin_update_product") : t("admin_register_product")}
        </MEHButton>

        {isEditingSouvenir && (
          <Button 
            appearance="subtle" 
            onClick={() => {
              setNewSouvenir({ nombre: '', descripcion: '', precio: 0, stock: 10, imagen_url: '', qr_url: '', categoria: 'SOUVENIR', tiene_tallas: false, tallas_disponibles: 'S, M, L, XL', tallas_stock: { S: 5, M: 10, L: 8, XL: 2 }, id_estado: 2 });
              setIsEditingSouvenir(false);
            }}
          >
            {t("admin_cancel_edit")}
          </Button>
        )}
      </div>

      <div className={styles.tableWrapper}>
        <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: `1px solid ${tokens.colorNeutralBackground3}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <MEHTypography variant="h3">{t("admin_souvenirs_inventory")}</MEHTypography>
            <Badge appearance="filled" color="brand">{t("admin_count_products", { count: filteredData.length })}</Badge>
            <MEHButton
              size="small"
              appearance="primary"
              icon={<Box24Filled />}
              onClick={() => setIsVentaModalOpen(true)}
              style={{ marginLeft: '6px' }}
            >
              Registrar Venta / Asignar
            </MEHButton>
            <MEHButton
              size="small"
              appearance="outline"
              icon={<Open20Regular />}
              onClick={() => window.open('/souvenirs', '_blank')}
            >
              Ver Catálogo Público
            </MEHButton>
            <MEHButton
              size="small"
              appearance="secondary"
              icon={<Receipt24Regular />}
              onClick={() => setIsHistorialModalOpen(true)}
            >
              Historial de Ventas
            </MEHButton>
          </div>
          <div style={{ maxWidth: '240px', width: '100%' }}>
            <Input
              contentBefore={<Search24Regular />}
              placeholder="Buscar souvenir..."
              value={searchTerm}
              onChange={(e, d) => setSearchTerm(d.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>
        
        <Table size="medium" style={{ minWidth: "620px" }}>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} style={{ textAlign: 'center', padding: '40px' }}>
                  <MEHTypography variant="body">{t("admin_no_products")}</MEHTypography>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map(i => (
                <TableRow key={`p-${i.id_producto}`} className={styles.userRow}>
                  <TableCell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <Avatar 
                        image={{ src: i.imagen_url }} 
                        name={i.nombre} 
                        size={48} 
                        shape="rounded"
                        badge={{ status: i.stock > 0 ? 'available' : 'busy' }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MEHTypography variant="bold">{i.nombre}</MEHTypography>
                          <Badge color={(i.id_estado === 1 || i.activo === false) ? 'warning' : 'success'} appearance="filled">
                            {(i.id_estado === 1 || i.activo === false) ? 'INACTIVO' : 'ACTIVO'}
                          </Badge>
                          {renderTallasStockBadges(i)}
                        </div>
                        <MEHTypography variant="caption" style={{ opacity: 0.7 }}>
                          {i.descripcion || t("admin_no_description")}
                        </MEHTypography>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <MEHTypography variant="bold" style={{ color: tokens.colorBrandForeground1 }}>
                        Bs. {i.precio}
                      </MEHTypography>
                      <Badge appearance="outline" color={i.stock < 5 ? 'important' : 'success'}>
                        {t("admin_count_available", { count: i.stock })}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={styles.actionsCell}>
                      <Tooltip content={(i.id_estado === 1 || i.activo === false) ? "Activar (mostrar en catálogo)" : "Desactivar (ocultar del catálogo)"} relationship="label">
                        <Switch 
                          checked={i.id_estado !== 1 && i.activo !== false} 
                          disabled={updatingId === i.id_producto}
                          onChange={(e, d) => handleToggleStatus(i, d.checked)} 
                        />
                      </Tooltip>
                      <Tooltip content="Copiar Enlace Público (tipo Luma)" relationship="label">
                        <Button 
                          appearance="subtle" 
                          icon={<Link20Regular />} 
                          onClick={() => {
                            const url = `${window.location.origin}/souvenir/${i.id_producto}`;
                            if (navigator.clipboard) {
                              navigator.clipboard.writeText(url).then(() => {
                                notify('Enlace Copiado', 'Enlace al souvenir copiado al portapapeles', 'success');
                              });
                            }
                          }}
                        />
                      </Tooltip>
                      <Tooltip content="Ver Página Pública" relationship="label">
                        <Button 
                          appearance="subtle" 
                          icon={<Open20Regular />} 
                          onClick={() => window.open(`/souvenir/${i.id_producto}`, '_blank')}
                        />
                      </Tooltip>
                      <Tooltip content={t("edit")} relationship="label">
                        <Button 
                          appearance="subtle" 
                          icon={<Edit20Regular />} 
                          onClick={() => handleEditSouvenir(i)}
                        />
                      </Tooltip>
                      <Tooltip content={t("delete")} relationship="label">
                        <Button 
                          appearance="subtle" 
                          icon={<Delete20Regular style={{ color: tokens.colorPaletteRedForeground1 }} />} 
                          onClick={() => confirmDelete('souvenir', i.id_producto, i.nombre)}
                        />
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Vista Móvil para Catálogo de Souvenirs (<= 720px) */}
      <div className={styles.mobileCardsWrapper}>
        <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: tokens.colorNeutralBackground1, borderRadius: '14px', border: `1px solid ${tokens.colorNeutralBackground3}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MEHTypography variant="bold">{t("admin_souvenirs_inventory")}</MEHTypography>
            <Badge appearance="filled" color="brand">{filteredData.length}</Badge>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <MEHButton
              size="small"
              appearance="subtle"
              icon={<Receipt24Regular />}
              onClick={() => setIsHistorialModalOpen(true)}
            >
              Ventas
            </MEHButton>
            <MEHButton
              size="small"
              appearance="subtle"
              icon={<Open20Regular />}
              onClick={() => window.open('/souvenirs', '_blank')}
            >
              Tienda
            </MEHButton>
          </div>
        </div>

        {filteredData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', backgroundColor: tokens.colorNeutralBackground1, borderRadius: '16px' }}>
            <MEHTypography variant="body">{t("admin_no_products")}</MEHTypography>
          </div>
        ) : (
          filteredData.map(i => (
            <div key={`mob-souv-${i.id_producto}`} className={styles.mobileProductCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Avatar 
                  image={{ src: i.imagen_url }} 
                  name={i.nombre} 
                  size={52} 
                  shape="rounded"
                  badge={{ status: i.stock > 0 ? 'available' : 'busy' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{i.nombre}</span>
                    <Badge color={(i.id_estado === 1 || i.activo === false) ? 'warning' : 'success'} appearance="filled" size="small">
                      {(i.id_estado === 1 || i.activo === false) ? 'INACTIVO' : 'ACTIVO'}
                    </Badge>
                    {renderTallasStockBadges(i)}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {i.descripcion || t("admin_no_description")}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${tokens.colorNeutralBackground3}`, paddingTop: '8px' }}>
                <div>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: tokens.colorBrandForeground1 }}>
                    Bs. {i.precio}
                  </span>
                  <span style={{ fontSize: '11px', opacity: 0.7, marginLeft: '6px' }}>
                    ({t("admin_count_available", { count: i.stock })})
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Tooltip content={(i.id_estado === 1 || i.activo === false) ? "Activar (mostrar en catálogo)" : "Desactivar (ocultar del catálogo)"} relationship="label">
                    <Switch 
                      checked={i.id_estado !== 1 && i.activo !== false} 
                      disabled={updatingId === i.id_producto}
                      onChange={(e, d) => handleToggleStatus(i, d.checked)} 
                    />
                  </Tooltip>
                  <Tooltip content="Copiar link" relationship="label">
                    <Button 
                      size="small"
                      appearance="subtle" 
                      icon={<Link20Regular />} 
                      onClick={() => {
                        const url = `${window.location.origin}/souvenir/${i.id_producto}`;
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(url).then(() => {
                            notify('Enlace Copiado', 'Enlace al souvenir copiado al portapapeles', 'success');
                          });
                        }
                      }}
                    />
                  </Tooltip>
                  <Tooltip content="Editar" relationship="label">
                    <Button 
                      size="small"
                      appearance="subtle" 
                      icon={<Edit20Regular />} 
                      onClick={() => handleEditSouvenir(i)}
                    />
                  </Tooltip>
                  <Tooltip content="Eliminar" relationship="label">
                    <Button 
                      size="small"
                      appearance="subtle" 
                      icon={<Delete20Regular style={{ color: tokens.colorPaletteRedForeground1 }} />} 
                      onClick={() => confirmDelete('souvenir', i.id_producto, i.nombre)}
                    />
                  </Tooltip>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <VentaSouvenirModal
        open={isVentaModalOpen}
        onClose={() => setIsVentaModalOpen(false)}
        onSuccess={() => { if (fetchData) fetchData(); }}
      />
      <HistorialVentasSouvenirsModal
        open={isHistorialModalOpen}
        onClose={() => setIsHistorialModalOpen(false)}
      />
    </div>
  );
};

export default SouvenirsTab;

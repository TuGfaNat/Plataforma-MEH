import React from 'react';
import { 
  Table, TableBody, TableRow, TableCell, Badge, Spinner, Field, Input, tokens, makeStyles, shorthands, 
  Avatar, Button, Tooltip, Textarea, Switch
} from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { 
  Add24Regular, ArrowUpload24Regular, Edit20Regular, Delete20Regular, 
  Box24Filled, Money20Regular, Info20Regular, Search24Regular, Link20Regular, Open20Regular 
} from '@fluentui/react-icons';
import { MEHButton, MEHTypography } from '../../components/ui';
import adminService from '../../services/adminService';
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

const SouvenirsTab = ({ 
  data, newSouvenir, setNewSouvenir, isEditingSouvenir, setIsEditingSouvenir, uploading, 
  handleFileUpload, handleSaveSouvenir, handleEditSouvenir, confirmDelete, fetchData
}) => {
  const styles = useStyles();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = React.useState('');
  const { notify } = useNotify();

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

        <Field label={t("admin_product_image")}>
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
                    {newSouvenir.imagen_url ? t("admin_change_image") : t("admin_upload_image")}
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

        <div style={{ margin: '4px 0' }}>
          <Switch 
            label={newSouvenir.id_estado === 1 ? "Inactivo (Oculto en catálogo)" : "Activo (Visible en catálogo)"} 
            checked={newSouvenir.id_estado !== 1} 
            onChange={(e, d) => setNewSouvenir({...newSouvenir, id_estado: d.checked ? 2 : 1})} 
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
              setNewSouvenir({ nombre: '', descripcion: '', precio: 0, stock: 10, imagen_url: '', categoria: 'SOUVENIR', id_estado: 2 });
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
              appearance="outline"
              icon={<Open20Regular />}
              onClick={() => window.open('/souvenirs', '_blank')}
              style={{ marginLeft: '6px' }}
            >
              Ver Catálogo Público
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
                          <Badge color={i.id_estado === 1 ? 'warning' : 'success'} appearance="filled">
                            {i.id_estado === 1 ? 'INACTIVO' : 'ACTIVO'}
                          </Badge>
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
                      <Tooltip content={i.id_estado === 1 ? "Activar" : "Desactivar"} relationship="label">
                        <Switch 
                          checked={i.id_estado !== 1} 
                          onChange={async (e, d) => {
                            try {
                              const newStatus = d.checked ? 2 : 1;
                              await adminService.updateSouvenir(i.id_producto, { ...i, id_estado: newStatus });
                              if (fetchData) fetchData();
                            } catch (err) {
                              console.error("Error al actualizar estado del souvenir:", err);
                            }
                          }} 
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
          <MEHButton
            size="small"
            appearance="subtle"
            icon={<Open20Regular />}
            onClick={() => window.open('/souvenirs', '_blank')}
          >
            Tienda
          </MEHButton>
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
                    <Badge color={i.id_estado === 1 ? 'warning' : 'success'} appearance="filled" size="small">
                      {i.id_estado === 1 ? 'INACTIVO' : 'ACTIVO'}
                    </Badge>
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
                  <Tooltip content={i.id_estado === 1 ? "Activar" : "Desactivar"} relationship="label">
                    <Switch 
                      checked={i.id_estado !== 1} 
                      onChange={async (e, d) => {
                        try {
                          const newStatus = d.checked ? 2 : 1;
                          await adminService.updateSouvenir(i.id_producto, { ...i, id_estado: newStatus });
                          if (fetchData) fetchData();
                        } catch (err) {
                          console.error("Error al actualizar estado del souvenir:", err);
                        }
                      }} 
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
    </div>
  );
};

export default SouvenirsTab;

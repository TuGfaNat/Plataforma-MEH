import React from 'react';
import { 
  Table, TableBody, TableRow, TableCell, Badge, Spinner, Field, Input, tokens, makeStyles, shorthands, 
  Avatar, Button, Tooltip, Textarea
} from '@fluentui/react-components';
import { 
  Add24Regular, ArrowUpload24Regular, Edit20Regular, Delete20Regular, 
  Box24Filled, Money20Regular, Info20Regular 
} from '@fluentui/react-icons';
import { MEHButton, MEHTypography } from '../../components/ui';

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
    backgroundColor: tokens.colorNeutralBackground2, 
    ...shorthands.borderRadius('24px'), 
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3),
    boxShadow: tokens.shadow4
  },
  tableWrapper: { 
    width: '100%', 
    overflowX: 'hidden', 
    ...shorthands.borderRadius('24px'), 
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3), 
    backgroundColor: tokens.colorNeutralBackground1, 
    boxShadow: tokens.shadow8 
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
  handleFileUpload, handleSaveSouvenir, handleEditSouvenir, confirmDelete
}) => {
  const styles = useStyles();

  return (
    <div className={styles.grid}>
      <div className={styles.formPanel}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ backgroundColor: tokens.colorBrandBackground, padding: '10px', borderRadius: '12px', color: 'white' }}>
            <Add24Regular />
          </div>
          <MEHTypography variant="h3">
            {isEditingSouvenir ? 'Ajustar' : 'Nuevo'} Producto
          </MEHTypography>
        </div>

        <Field label="Nombre del Producto" required>
          <Input 
            placeholder="Ej: Camiseta Oficial MEH"
            value={newSouvenir.nombre} 
            onChange={(e, d) => setNewSouvenir({...newSouvenir, nombre: d.value})} 
          />
        </Field>

        <Field label="Descripción">
          <Input 
            placeholder="Breve detalle del producto..."
            value={newSouvenir.descripcion} 
            onChange={(e, d) => setNewSouvenir({...newSouvenir, descripcion: d.value})} 
          />
        </Field>

        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
          <Field label="Precio (Bs)" required>
            <Input 
              type="number" 
              contentBefore={<Money20Regular />} 
              value={newSouvenir.precio} 
              onChange={(e, d) => setNewSouvenir({...newSouvenir, precio: d.value})} 
            />
          </Field>
          <Field label="Stock Inicial" required>
            <Input 
              type="number" 
              contentBefore={<Box24Filled fontSize="16px" />}
              value={newSouvenir.stock} 
              onChange={(e, d) => setNewSouvenir({...newSouvenir, stock: d.value})} 
            />
          </Field>
        </div>

        <Field label="Imagen del Producto">
          <div className={styles.uploadBox} onClick={() => document.getElementById('souv-file').click()}>
            {uploading ? (
              <Spinner size="medium" label="Subiendo..." />
            ) : (
              <>
                {newSouvenir.imagen_url && (
                  <img src={newSouvenir.imagen_url} alt="Preview" className={styles.previewImage} />
                )}
                <div className={styles.uploadContent}>
                  <ArrowUpload24Regular /> 
                  <MEHTypography variant="caption">
                    {newSouvenir.imagen_url ? 'Cambiar Imagen' : 'Subir Imagen'}
                  </MEHTypography>
                </div>
                <input 
                  id="souv-file" 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileUpload(e, setNewSouvenir, newSouvenir, 'imagen_url')} 
                  style={{ display: 'none' }} 
                />
              </>
            )}
          </div>
        </Field>

        <MEHButton 
          appearance="primary" 
          size="large"
          icon={isEditingSouvenir ? <Edit20Regular /> : <Add24Regular />}
          onClick={handleSaveSouvenir}
          style={{ marginTop: '10px' }}
        >
          {isEditingSouvenir ? 'Actualizar Producto' : 'Registrar Producto'}
        </MEHButton>

        {isEditingSouvenir && (
          <Button 
            appearance="subtle" 
            onClick={() => {
              setNewSouvenir({ nombre: '', descripcion: '', precio: 0, stock: 10, imagen_url: '', categoria: 'SOUVENIR' });
              setIsEditingSouvenir(false);
            }}
          >
            Cancelar Edición
          </Button>
        )}
      </div>

      <div className={styles.tableWrapper}>
        <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${tokens.colorNeutralBackground3}` }}>
          <MEHTypography variant="h3">Inventario de Souvenirs</MEHTypography>
          <Badge appearance="filled" color="brand">{data.length} Productos</Badge>
        </div>
        
        <Table size="medium">
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colspan={3} style={{ textAlign: 'center', padding: '40px' }}>
                  <MEHTypography variant="body">No hay productos registrados aún.</MEHTypography>
                </TableCell>
              </TableRow>
            ) : (
              data.map(i => (
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
                        <MEHTypography variant="bold">{i.nombre}</MEHTypography>
                        <MEHTypography variant="caption" style={{ opacity: 0.7 }}>
                          {i.descripcion || 'Sin descripción'}
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
                        {i.stock} disponibles
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={styles.actionsCell}>
                      <Tooltip content="Editar" relationship="label">
                        <Button 
                          appearance="subtle" 
                          icon={<Edit20Regular />} 
                          onClick={() => handleEditSouvenir(i)}
                        />
                      </Tooltip>
                      <Tooltip content="Eliminar" relationship="label">
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
    </div>
  );
};

export default SouvenirsTab;

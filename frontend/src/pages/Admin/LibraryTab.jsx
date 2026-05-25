import React from 'react';
import { 
  Table, TableBody, TableRow, TableCell, Badge, Field, Input, tokens, makeStyles, shorthands,
  Switch, Button, Tooltip, Textarea, Select, Avatar
} from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { 
  Add24Regular, Edit20Regular, Delete20Regular, BookOpen24Regular, 
  DocumentText24Regular, Video24Regular, Link24Regular, Save20Regular, Dismiss20Regular
} from '@fluentui/react-icons';
import { MEHButton, MEHTypography } from '../../components/ui';
import api from '../../services/api';

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
    gap: '16px', 
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
  actionsCell: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    height: '100%'
  }
});

const getResourceIcon = (type) => {
  switch (type) {
    case 'LIBRO':
      return <BookOpen24Regular style={{ color: tokens.colorPaletteOrangeForeground1 }} />;
    case 'VIDEO':
      return <Video24Regular style={{ color: tokens.colorPaletteRedForeground1 }} />;
    case 'ENLACE':
      return <Link24Regular style={{ color: tokens.colorBrandForeground1 }} />;
    default:
      return <DocumentText24Regular style={{ color: tokens.colorPaletteTealForeground1 }} />;
  }
};

const LibraryTab = ({ 
  data, newRecurso, setNewRecurso, handleSaveRecurso, isEditingRecurso, setIsEditingRecurso, 
  handleEditRecurso, confirmDelete, fetchData 
}) => {
  const styles = useStyles();
  const { t } = useTranslation();

  const handleCancelEdit = () => {
    setNewRecurso({ 
      titulo: '', descripcion: '', motivo: '', autor_nombre: '', url_descarga: '', 
      portada_url: '', tipo_archivo: '', tipo_recurso: 'ARCHIVO', contenido_md: '', 
      categoria: 'GENERAL', id_curso: null, id_evento: null, id_estado: 2 
    });
    setIsEditingRecurso(false);
  };

  return (
    <div className={styles.grid}>
      <div className={styles.formPanel}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ backgroundColor: tokens.colorBrandBackground, padding: '10px', borderRadius: '12px', color: 'white' }}>
            <Add24Regular />
          </div>
          <MEHTypography variant="h3">
            {isEditingRecurso ? t("admin_adjust") : t("admin_new")} {t("admin_resource")}
          </MEHTypography>
        </div>

        <Field label={t("admin_title")} required>
          <Input 
            placeholder={t("admin_title_placeholder") || "Título del recurso"}
            value={newRecurso.titulo} 
            onChange={(e, d) => setNewRecurso({...newRecurso, titulo: d.value})} 
          />
        </Field>

        <Field label={t("admin_author") || "Autor / Creador"} required>
          <Input 
            placeholder={t("admin_author_placeholder") || "Nombre del autor"}
            value={newRecurso.autor_nombre} 
            onChange={(e, d) => setNewRecurso({...newRecurso, autor_nombre: d.value})} 
          />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field label={t("admin_category") || "Categoría"} required>
            <Select 
              value={newRecurso.categoria} 
              onChange={(e, d) => setNewRecurso({...newRecurso, categoria: d.value})}
            >
              <option value="GENERAL">General</option>
              <option value="CIENCIA">Ciencia</option>
              <option value="TECNOLOGIA">Tecnología</option>
              <option value="MATEMATICAS">Matemáticas</option>
              <option value="CIENCIAS SOCIALES">Ciencias Sociales</option>
              <option value="FEMINISMO">Feminismo</option>
              <option value="HISTORIA">Historia</option>
              <option value="OTRO">Otro</option>
            </Select>
          </Field>

          <Field label={t("admin_resource_type") || "Tipo de Recurso"} required>
            <Select 
              value={newRecurso.tipo_recurso} 
              onChange={(e, d) => setNewRecurso({...newRecurso, tipo_recurso: d.value})}
            >
              <option value="ARCHIVO">Archivo / PDF</option>
              <option value="LIBRO">Libro</option>
              <option value="VIDEO">Video</option>
              <option value="ENLACE">Enlace Web</option>
            </Select>
          </Field>
        </div>

        <Field label={t("admin_download_url") || "Enlace de descarga o URL externo"}>
          <Input 
            placeholder="https://example.com/recurso"
            value={newRecurso.url_descarga} 
            onChange={(e, d) => setNewRecurso({...newRecurso, url_descarga: d.value})} 
          />
        </Field>

        <Field label={t("admin_description") || "Descripción"}>
          <Textarea 
            placeholder={t("admin_description_placeholder") || "Breve resumen del contenido..."}
            value={newRecurso.descripcion} 
            onChange={(e, d) => setNewRecurso({...newRecurso, descripcion: d.value})} 
          />
        </Field>

        <div style={{ margin: '4px 0' }}>
          <Switch 
            label={newRecurso.id_estado === 1 ? "Inactivo (Oculto en biblioteca)" : "Activo (Visible en biblioteca)"} 
            checked={newRecurso.id_estado !== 1} 
            onChange={(e, d) => setNewRecurso({...newRecurso, id_estado: d.checked ? 2 : 1})} 
          />
        </div>

        <MEHButton 
          appearance="primary" 
          size="large"
          icon={isEditingRecurso ? <Save20Regular /> : <Add24Regular />}
          onClick={handleSaveRecurso}
          style={{ marginTop: '10px' }}
        >
          {isEditingRecurso ? t("admin_update_resource") || "Actualizar Recurso" : t("admin_publish") || "Publicar Recurso"}
        </MEHButton>

        {isEditingRecurso && (
          <Button 
            appearance="subtle" 
            icon={<Dismiss20Regular />}
            onClick={handleCancelEdit}
          >
            {t("admin_cancel_edit") || "Cancelar Edición"}
          </Button>
        )}
      </div>

      <div className={styles.tableWrapper}>
        <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${tokens.colorNeutralBackground3}` }}>
          <MEHTypography variant="h3">{t("admin_repository") || "Repositorio de Biblioteca"}</MEHTypography>
          <Badge appearance="filled" color="brand">{t("admin_count_resources", { count: data.length }) || `${data.length} recursos`}</Badge>
        </div>
        
        <Table size="medium">
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colspan={3} style={{ textAlign: 'center', padding: '40px' }}>
                  <MEHTypography variant="body">{t("admin_no_resources") || "No hay recursos registrados."}</MEHTypography>
                </TableCell>
              </TableRow>
            ) : (
              data.map(r => (
                <TableRow key={`r-${r.id_recurso}`} className={styles.userRow}>
                  <TableCell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <Avatar 
                        icon={getResourceIcon(r.tipo_recurso)} 
                        size={40} 
                        shape="square"
                        style={{ backgroundColor: tokens.colorNeutralBackground2 }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MEHTypography variant="bold">{r.titulo}</MEHTypography>
                          <Badge color={r.id_estado === 1 ? 'warning' : 'success'} appearance="filled">
                            {r.id_estado === 1 ? 'INACTIVO' : 'ACTIVO'}
                          </Badge>
                        </div>
                        <MEHTypography variant="caption" style={{ opacity: 0.7 }}>
                          {t("by") || "Por"}: {r.autor_nombre || "Anónimo"} | {r.categoria}
                        </MEHTypography>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <Badge appearance="outline" color="brand">
                        {r.tipo_recurso}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={styles.actionsCell}>
                      <Tooltip content={r.id_estado === 1 ? "Activar" : "Desactivar"} relationship="label">
                        <Switch 
                          checked={r.id_estado !== 1} 
                          onChange={async (e, d) => {
                            try {
                              const newStatus = d.checked ? 2 : 1;
                              await api.put(`/recursos/${r.id_recurso}`, { ...r, id_estado: newStatus });
                              if (fetchData) fetchData();
                            } catch (err) {
                              console.error("Error al actualizar estado del recurso:", err);
                            }
                          }} 
                        />
                      </Tooltip>
                      <Tooltip content={t("edit")} relationship="label">
                        <Button 
                          appearance="subtle" 
                          icon={<Edit20Regular />} 
                          onClick={() => handleEditRecurso(r)}
                        />
                      </Tooltip>
                      <Tooltip content={t("delete")} relationship="label">
                        <Button 
                          appearance="subtle" 
                          icon={<Delete20Regular style={{ color: tokens.colorPaletteRedForeground1 }} />} 
                          onClick={() => confirmDelete('recurso', r.id_recurso, r.titulo)}
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

export default LibraryTab;

import React, { useState, useEffect } from 'react';
import { 
  Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell,
  TabList, Tab, Spinner, Input, Badge, Button, Dialog, DialogSurface, 
  DialogBody, DialogTitle, DialogContent, DialogActions, Tooltip, Avatar, 
  tokens, makeStyles, shorthands 
} from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { 
  ArrowUndo24Regular, Delete24Regular, Search24Regular, Info24Regular, 
  DeleteDismiss24Regular, CalendarLtr24Regular, HatGraduation24Regular, 
  People24Regular, MegaphoneLoud24Regular, Library24Regular, Box24Regular, 
  PersonBoard24Regular, Reward24Regular, Globe24Regular
} from '@fluentui/react-icons';
import api from '../../services/api';
import { MEHButton, MEHTypography } from '../../components/ui';

const useStyles = makeStyles({
  infoPanel: { 
    padding: '24px', 
    backgroundColor: tokens.colorBrandBackground2, 
    ...shorthands.borderRadius('16px'), 
    marginBottom: '24px', 
    borderLeft: `4px solid ${tokens.colorBrandForeground1}`, 
    display: 'flex', 
    alignItems: 'center', 
    gap: '16px',
    animationName: { from: { opacity: 0, transform: 'translateY(-10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
    animationDuration: '0.4s'
  },
  tableContainer: { 
    width: '100%', 
    overflowX: 'hidden', 
    ...shorthands.borderRadius('24px'), 
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3), 
    backgroundColor: tokens.colorNeutralBackground1, 
    boxShadow: tokens.shadow8 
  },
  rowItem: { 
    height: '80px', 
    transition: 'all 0.2s ease', 
    ':hover': { backgroundColor: tokens.colorNeutralBackground2 } 
  },
  nameStack: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '16px', 
    paddingLeft: '12px' 
  },
  actionsCell: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  emptyState: {
    padding: '60px 24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    color: tokens.colorNeutralForeground3
  },
  emptyIcon: {
    fontSize: '64px',
    color: tokens.colorBrandForeground2,
    opacity: 0.6,
    animationName: { from: { transform: 'scale(0.8)' }, to: { transform: 'scale(1)' } },
    animationDuration: '0.5s',
    animationIterationCount: 'infinite',
    animationDirection: 'alternate'
  },
  categoryBadge: {
    ...shorthands.padding('4px', '8px'),
    ...shorthands.borderRadius('6px'),
    fontSize: '0.8rem',
    fontWeight: 'bold'
  }
});

const CATEGORIES_INFO = {
  eventos: { label: 'Eventos', icon: <CalendarLtr24Regular />, color: tokens.colorPaletteBlueBorderActive, roles: ['ADMIN', 'ORGANIZADOR'] },
  cursos: { label: 'Programas (Cursos)', icon: <HatGraduation24Regular />, color: tokens.colorPaletteGreenBorderActive, roles: ['ADMIN', 'MODERADOR'] },
  usuarios: { label: 'Miembros', icon: <People24Regular />, color: tokens.colorPaletteLightTealBorderActive, roles: ['ADMIN'] },
  anuncios: { label: 'Anuncios', icon: <MegaphoneLoud24Regular />, color: tokens.colorPalettePeachBorderActive, roles: ['ADMIN', 'MODERADOR'] },
  recursos: { label: 'Recursos Biblioteca', icon: <Library24Regular />, color: tokens.colorPaletteBerryBorderActive, roles: ['ADMIN', 'MODERADOR'] },
  productos: { label: 'POS & Productos', icon: <Box24Regular />, color: tokens.colorPaletteGoldBorderActive, roles: ['ADMIN'] },
  speakers: { label: 'Speakers', icon: <PersonBoard24Regular />, color: tokens.colorPaletteLavenderBorderActive, roles: ['ADMIN', 'ORGANIZADOR'] },
  auspiciadores: { label: 'Auspiciadores', icon: <Award24Regular />, color: tokens.colorPalettePumpkinBorderActive, roles: ['ADMIN', 'ORGANIZADOR'] },
  comunidades: { label: 'Comunidades Aliadas', icon: <Globe24Regular />, color: tokens.colorPaletteGrapeBorderActive, roles: ['ADMIN', 'ORGANIZADOR'] }
};

const PapeleraTab = ({ currentUser, notify }) => {
  const styles = useStyles();
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(true);
  const [trashData, setTrashData] = useState({});
  const [selectedSubTab, setSelectedSubTab] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog state
  const [actionDialog, setActionDialog] = useState({ open: false, type: '', category: '', itemId: null, itemName: '' });

  // Get allowed categories depending on the user's role
  const allowedCategories = Object.keys(CATEGORIES_INFO).filter(catKey => {
    const roles = CATEGORIES_INFO[catKey].roles;
    return currentUser && roles.includes(currentUser.rol);
  });

  const fetchTrashData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/papelera/');
      setTrashData(response.data || {});
      
      // Auto-select first available category if none is selected
      if (allowedCategories.length > 0 && !selectedSubTab) {
        setSelectedSubTab(allowedCategories[0]);
      }
    } catch (err) {
      console.error("Error al obtener papelera:", err);
      notify("Error", "No se pudo sincronizar la papelera de reciclaje", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashData();
  }, []);

  const handleRestore = async (category, itemId, itemName) => {
    try {
      await api.post(`/admin/papelera/restaurar/${category}/${itemId}`);
      notify("Restaurado", `"${itemName}" ha sido devuelto a su estado activo`, "success");
      setActionDialog({ open: false, type: '', category: '', itemId: null, itemName: '' });
      fetchTrashData();
    } catch (err) {
      console.error(err);
      notify("Error", "No se pudo restaurar el registro", "error");
    }
  };

  const handlePurge = async (category, itemId, itemName) => {
    try {
      await api.delete(`/admin/papelera/destruir/${category}/${itemId}`);
      notify("Depurado", `"${itemName}" ha sido eliminado permanentemente de la base de datos`, "success");
      setActionDialog({ open: false, type: '', category: '', itemId: null, itemName: '' });
      fetchTrashData();
    } catch (err) {
      console.error(err);
      notify("Error", "No se pudo eliminar definitivamente el registro", "error");
    }
  };

  const currentList = trashData[selectedSubTab] || [];
  const filteredList = currentList.filter(item => 
    `${item.titulo} ${item.subtitulo}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className={styles.infoPanel}>
        <DeleteDismiss24Regular style={{ fontSize: '36px', color: tokens.colorBrandForeground1 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <MEHTypography variant="h3" style={{ color: tokens.colorBrandForeground1, fontWeight: 'bold' }}>
            Papelera de Reciclaje Administrativa
          </MEHTypography>
          <MEHTypography variant="body" style={{ opacity: 0.9 }}>
            Recupera registros eliminados lógicamente o depúralos del sistema definitivamente. 
            Tus permisos para ver y restaurar elementos se limitan a tu nivel de acceso corporativo ({currentUser?.rol}).
          </MEHTypography>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        <TabList 
          selectedValue={selectedSubTab} 
          onTabSelect={(e, d) => { setSelectedSubTab(d.value); setSearchTerm(''); }}
          style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}
        >
          {allowedCategories.map(catKey => {
            const info = CATEGORIES_INFO[catKey];
            const count = trashData[catKey]?.length || 0;
            return (
              <Tab key={catKey} value={catKey} icon={info.icon}>
                {info.label} {count > 0 && <Badge appearance="filled" color="important" style={{ marginLeft: '6px' }}>{count}</Badge>}
              </Tab>
            );
          })}
        </TabList>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <Input 
            placeholder="Filtrar papelera por título o metadatos..." 
            contentBefore={<Search24Regular />} 
            value={searchTerm} 
            onChange={(e, d) => setSearchTerm(d.value)} 
            style={{ width: '100%', maxWidth: '420px', height: '42px' }} 
          />
          {selectedSubTab && (
            <Badge appearance="outline" size="large" style={{ borderColor: CATEGORIES_INFO[selectedSubTab]?.color }}>
              Categoría: {CATEGORIES_INFO[selectedSubTab]?.label}
            </Badge>
          )}
        </div>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}><Spinner label="Obteniendo archivos eliminados..." /></div>
        ) : filteredList.length === 0 ? (
          <div className={styles.emptyState}>
            <DeleteDismiss24Regular className={styles.emptyIcon} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <MEHTypography variant="bold" style={{ fontSize: '1.2rem' }}>
                Papelera Vacía
              </MEHTypography>
              <MEHTypography variant="caption" style={{ maxWidth: '400px' }}>
                {searchTerm ? 'Ningún elemento eliminado coincide con el criterio de búsqueda.' : 'Excelente. No hay registros eliminados en esta categoría administrativa.'}
              </MEHTypography>
            </div>
          </div>
        ) : (
          <Table size="medium">
            <TableHeader>
              <TableRow>
                <TableHeaderCell style={{ fontWeight: 'bold' }}>Registro Eliminado</TableHeaderCell>
                <TableHeaderCell style={{ fontWeight: 'bold' }}>Detalle de Atributos</TableHeaderCell>
                <TableHeaderCell style={{ fontWeight: 'bold' }}>Fecha de Baja Lógica</TableHeaderCell>
                <TableHeaderCell style={{ fontWeight: 'bold', textAlign: 'right' }}>Acciones Operativas</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredList.map(item => (
                <TableRow key={`${selectedSubTab}-${item.id}`} className={styles.rowItem}>
                  <TableCell>
                    <div className={styles.nameStack}>
                      <Avatar 
                        name={item.titulo} 
                        size={40} 
                        color="colorful"
                        initials={item.titulo ? item.titulo.substring(0, 2).toUpperCase() : 'MEH'}
                      />
                      <div>
                        <b>{item.titulo}</b>
                        <br/>
                        <Badge appearance="outline" size="tiny">ID: {item.id}</Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span style={{ fontStyle: 'italic', opacity: 0.8 }}>
                      {item.subtitulo || 'Sin metadato secundario'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {item.fecha_eliminacion ? (
                      <div>
                        <b>{new Date(item.fecha_eliminacion).toLocaleDateString()}</b>
                        <br/>
                        <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                          {new Date(item.fecha_eliminacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ) : (
                      <span style={{ opacity: 0.5 }}>No disponible</span>
                    )}
                  </TableCell>
                  <TableCell style={{ textAlign: 'right' }}>
                    <div className={styles.actionsCell} style={{ justifyContent: 'flex-end' }}>
                      <Tooltip content="Restaurar Elemento (Volver a ACTIVO)" relationship="label">
                        <Button 
                          appearance="primary" 
                          icon={<ArrowUndo24Regular />} 
                          onClick={() => setActionDialog({ open: true, type: 'restore', category: selectedSubTab, itemId: item.id, itemName: item.titulo })}
                          style={{ backgroundColor: tokens.colorPaletteGreenBackground3, color: '#fff' }}
                        >
                          Restaurar
                        </Button>
                      </Tooltip>

                      {currentUser?.rol === 'ADMIN' ? (
                        <Tooltip content="Destruir Permanentemente (Purga de Base de Datos)" relationship="label">
                          <Button 
                            appearance="subtle" 
                            icon={<Delete24Regular style={{ color: tokens.colorPaletteRedForeground1 }} />} 
                            onClick={() => setActionDialog({ open: true, type: 'purge', category: selectedSubTab, itemId: item.id, itemName: item.titulo })}
                          />
                        </Tooltip>
                      ) : (
                        <Tooltip content="Borrado definitivo requiere permisos de Super Administrador (ADMIN)" relationship="label">
                          <Button 
                            appearance="subtle" 
                            disabled 
                            icon={<Delete24Regular style={{ opacity: 0.3 }} />} 
                          />
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(e, d) => setActionDialog({ ...actionDialog, open: d.open })}>
        <DialogSurface style={{ 
          borderRadius: '24px', 
          border: actionDialog.type === 'purge' ? `2px solid ${tokens.colorPaletteRedBorder1}` : `2px solid ${tokens.colorPaletteGreenBorder1}` 
        }}>
          <DialogBody>
            <DialogTitle>
              {actionDialog.type === 'purge' ? '⚠️ Confirmar Purgado Físico' : '🔄 Confirmar Restauración'}
            </DialogTitle>
            <DialogContent>
              {actionDialog.type === 'purge' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p>¿Estás completamente seguro de purgar permanentemente <b>"{actionDialog.itemName}"</b> de la base de datos?</p>
                  <Badge appearance="filled" color="important">Esta acción es irreversible y podría causar inconsistencias en registros vinculados.</Badge>
                </div>
              ) : (
                <p>¿Deseas restaurar <b>"{actionDialog.itemName}"</b>? Volverá a estar activo y visible para los usuarios del sistema.</p>
              )}
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setActionDialog({ open: false, type: '', category: '', itemId: null, itemName: '' })}>
                Cancelar
              </Button>
              {actionDialog.type === 'purge' ? (
                <Button 
                  appearance="primary" 
                  style={{ backgroundColor: tokens.colorPaletteRedBackground3, color: '#fff' }}
                  onClick={() => handlePurge(actionDialog.category, actionDialog.itemId, actionDialog.itemName)}
                >
                  Confirmar Destrucción
                </Button>
              ) : (
                <Button 
                  appearance="primary" 
                  style={{ backgroundColor: tokens.colorPaletteGreenBackground3, color: '#fff' }}
                  onClick={() => handleRestore(actionDialog.category, actionDialog.itemId, actionDialog.itemName)}
                >
                  Restaurar Registro
                </Button>
              )}
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};

export default PapeleraTab;

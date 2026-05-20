import React from 'react';
import { 
  Table, TableBody, TableRow, TableCell, Badge, Field, Input, tokens, makeStyles, shorthands
} from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { MEHButton, MEHTypography } from '../../components/ui';

const useStyles = makeStyles({
// ... (rest of styles same)
  grid: { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' },
  formPanel: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '20px', 
    padding: '24px', 
    backgroundColor: tokens.colorNeutralBackground2, 
    ...shorthands.borderRadius('20px'), 
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3) 
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
    height: '85px', 
    transition: 'all 0.2s ease', 
    ':hover': { backgroundColor: tokens.colorNeutralBackground2 } 
  }
});

const LibraryTab = ({ 
  data, newRecurso, setNewRecurso, handleSaveRecurso 
}) => {
  const styles = useStyles();
  const { t } = useTranslation();

  return (
    <div className={styles.grid}>
      <div className={styles.formPanel}>
        <MEHTypography variant="h3">{t("admin_new_resource")}</MEHTypography>
        <Field label={t("admin_title")}>
          <Input value={newRecurso.titulo} onChange={(e, d) => setNewRecurso({...newRecurso, titulo: d.value})} />
        </Field>
        <MEHButton appearance="primary" onClick={handleSaveRecurso}>{t("admin_publish")}</MEHButton>
      </div>
      <div className={styles.tableWrapper}>
        <div style={{padding: '16px'}}><MEHTypography variant="h3">{t("admin_repository")}</MEHTypography></div>
        <Table>
          <TableBody>
            {data.map(r => (
              <TableRow key={`r-${r.id_recurso}`} className={styles.userRow}>
                <TableCell><b>{r.titulo}</b></TableCell>
                <TableCell><Badge>{r.tipo_recurso}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LibraryTab;

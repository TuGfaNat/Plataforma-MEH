import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Badge,
  Spinner,
  TabList,
  Tab,
  makeStyles,
  shorthands,
  tokens,
  Input,
} from '@fluentui/react-components';
import {
  Print24Regular,
  Dismiss24Regular,
  Table24Regular,
  ContactCard24Regular,
  Search24Regular,
} from '@fluentui/react-icons';
import { QRCodeSVG } from 'qrcode.react';
import { MEHTypography } from './ui';
import eventoService from '../services/eventoService';
import { matchesSmartSearch } from '../utils/smartSearch';

const useStyles = makeStyles({
  surface: {
    maxWidth: '920px',
    width: '95vw',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius('16px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3),
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    paddingBottom: '12px',
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralBackground3),
  },
  content: {
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    paddingTop: '16px',
    paddingBottom: '16px',
  },
  controlsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
  },
  printSheet: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '16px',
    backgroundColor: '#ffffff',
    color: '#000000',
    ...shorthands.borderRadius('8px'),
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  printHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #7f13ec',
    paddingBottom: '8px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px',
    color: '#111827',
  },
  th: {
    border: '1px solid #d1d5db',
    padding: '8px 6px',
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
    textAlign: 'left',
  },
  td: {
    border: '1px solid #e5e7eb',
    padding: '6px 8px',
    verticalAlign: 'middle',
  },
  badgeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '16px',
  },
  badgeCard: {
    border: '2px dashed #9ca3af',
    borderRadius: '10px',
    padding: '12px',
    backgroundColor: '#fafafa',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '8px',
    pageBreakInside: 'avoid',
    breakInside: 'avoid',
  },
  badgeHeader: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#7f13ec',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  badgeName: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#111827',
  },
  badgeSub: {
    fontSize: '11px',
    color: '#4b5563',
  },
});

const ImprimirLista = ({
  isOpen,
  onClose,
  eventoId,
  eventoTitulo = 'Evento MEH',
  eventoFecha = '',
  participantesIniciales = null,
  inscritos: inscritosProp = null,
}) => {
  const styles = useStyles();
  const [modo, setModo] = useState('planilla'); // 'planilla' | 'credenciales'
  const initialData = participantesIniciales || inscritosProp;
  const [inscritos, setInscritos] = useState(initialData || []);
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState('');

  const cargarInscritos = async () => {
    if (!eventoId) return;
    setLoading(true);
    try {
      if (initialData && initialData.length > 0) {
        setInscritos(initialData);
      } else {
        const data = await eventoService.getInscritosConfirmados(eventoId);
        setInscritos(data || []);
      }
    } catch (err) {
      console.error('Error al cargar inscritos para impresión:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setInscritos(initialData);
    } else if (isOpen && eventoId) {
      void cargarInscritos();
    }
  }, [isOpen, eventoId, initialData]);

  const inscritosFiltrados = useMemo(() => {
    if (!filtro.trim()) return inscritos;
    return inscritos.filter((i) =>
      matchesSmartSearch([i.nombre_completo, i.correo, i.codigo_qr], filtro)
    );
  }, [inscritos, filtro]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(e, d) => !d.open && onClose()}>
      <DialogSurface className={styles.surface}>
        <DialogTitle>
          <div className={styles.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Print24Regular style={{ color: tokens.colorBrandForeground1 }} />
              <div>
                <MEHTypography variant="h3">Credenciales y Lista Imprimible</MEHTypography>
                <MEHTypography variant="caption" style={{ opacity: 0.7 }}>
                  {eventoTitulo}
                </MEHTypography>
              </div>
            </div>
            <Badge color="brand" appearance="filled">
              {inscritosFiltrados.length} Registros
            </Badge>
          </div>
        </DialogTitle>

        <DialogContent className={styles.content}>
          <div className={styles.controlsRow}>
            <TabList
              selectedValue={modo}
              onTabSelect={(e, d) => setModo(d.value)}
            >
              <Tab value="planilla" icon={<Table24Regular />}>
                Lista / Planilla de Asistencia
              </Tab>
              <Tab value="credenciales" icon={<ContactCard24Regular />}>
                Credenciales Físicas con QR
              </Tab>
            </TabList>

            <Input
              placeholder="Buscar por nombre o QR..."
              contentBefore={<Search24Regular />}
              value={filtro}
              onChange={(e, d) => setFiltro(d.value)}
              size="small"
              style={{ minWidth: '220px' }}
            />
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <Spinner label="Preparando vista de impresión..." />
            </div>
          ) : (
            <div id="meh-print-area" className={styles.printSheet}>
              {/* ENCABEZADO DE IMPRESIÓN */}
              <div className={styles.printHeader}>
                <div>
                  <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#111827' }}>
                    {eventoTitulo}
                  </h2>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                    Comunidad Microsoft Education Hub • {eventoFecha ? new Date(eventoFecha).toLocaleDateString('es-BO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Control de Asistencia Oficial'}
                  </p>
                </div>
                <div style={{ textAlign: 'right', fontSize: '11px', color: '#4b5563' }}>
                  <strong>Total Confirmados:</strong> {inscritos.length} <br />
                  <strong>Fecha de Impresión:</strong> {new Date().toLocaleDateString('es-BO')}
                </div>
              </div>

              {/* MODO 1: PLANILLA FORMAL CON QR Y FIRMA */}
              {modo === 'planilla' && (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th} style={{ width: '40px', textAlign: 'center' }}>#</th>
                      <th className={styles.th} style={{ width: '70px', textAlign: 'center' }}>QR</th>
                      <th className={styles.th}>Participante</th>
                      <th className={styles.th}>Correo Electrónico</th>
                      <th className={styles.th} style={{ width: '90px', textAlign: 'center' }}>Estado</th>
                      <th className={styles.th} style={{ width: '130px', textAlign: 'center' }}>Firma / Check</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inscritosFiltrados.map((item, index) => (
                      <tr key={item.id_inscripcion} style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                        <td className={styles.td} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                          {index + 1}
                        </td>
                        <td className={styles.td} style={{ textAlign: 'center' }}>
                          <QRCodeSVG
                            value={item.codigo_qr || `MEH-${item.id_inscripcion}`}
                            size={44}
                            level="M"
                          />
                        </td>
                        <td className={styles.td}>
                          <strong>{item.nombre_completo}</strong>
                          <div style={{ fontSize: '10px', color: '#6b7280' }}>
                            Código: {item.codigo_qr}
                          </div>
                        </td>
                        <td className={styles.td}>{item.correo || '-'}</td>
                        <td className={styles.td} style={{ textAlign: 'center' }}>
                          {item.asistio ? (
                            <span style={{ color: '#059669', fontWeight: 'bold' }}>✓ Presente</span>
                          ) : (
                            <span style={{ color: '#d97706' }}>Pendiente</span>
                          )}
                        </td>
                        <td className={styles.td} style={{ textAlign: 'center', borderBottom: '1px solid #9ca3af' }}>
                          {/* Casilla de firma física */}
                          <div style={{ height: '30px' }} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* MODO 2: CREDENCIALES RECORTABLES CON QR */}
              {modo === 'credenciales' && (
                <div className={styles.badgeGrid}>
                  {inscritosFiltrados.map((item) => (
                    <div key={item.id_inscripcion} className={styles.badgeCard}>
                      <div className={styles.badgeHeader}>Microsoft Education Hub</div>
                      <div style={{ padding: '4px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <QRCodeSVG
                          value={item.codigo_qr || `MEH-${item.id_inscripcion}`}
                          size={96}
                          level="M"
                        />
                      </div>
                      <div className={styles.badgeName}>{item.nombre_completo}</div>
                      <div className={styles.badgeSub}>
                        {item.correo || `Inscrito #${item.id_inscripcion}`}
                      </div>
                      <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#7f13ec', marginTop: '2px' }}>
                        {item.codigo_qr}
                      </div>
                      <div style={{ fontSize: '9px', color: '#9ca3af', borderTop: '1px solid #e5e7eb', width: '100%', paddingTop: '4px' }}>
                        {eventoTitulo.length > 32 ? `${eventoTitulo.substring(0, 32)}...` : eventoTitulo}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>

        <DialogActions>
          <Button appearance="secondary" icon={<Dismiss24Regular />} onClick={onClose}>
            Cerrar
          </Button>
          <Button
            appearance="primary"
            icon={<Print24Regular />}
            onClick={handlePrint}
            disabled={inscritosFiltrados.length === 0 || loading}
          >
            Imprimir ({inscritosFiltrados.length})
          </Button>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
};

export default ImprimirLista;

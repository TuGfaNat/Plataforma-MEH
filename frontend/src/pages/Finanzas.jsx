import React, { useState, useEffect } from 'react';
import { 
  makeStyles, 
  shorthands, 
  tokens, 
  Table, 
  TableHeader, 
  TableRow, 
  TableHeaderCell, 
  TableBody, 
  TableCell,
  Input,
  Label,
  Spinner,
  Dropdown,
  Option
} from '@fluentui/react-components';
import { 
  Money24Regular, 
  Receipt24Regular, 
  ArrowUpload24Regular,
  CheckmarkCircle24Regular,
  Alert24Regular
} from '@fluentui/react-icons';
import MainLayout from '../components/layout/MainLayout';
import { MEHCard, MEHButton, MEHTypography } from '../components/ui';
import { designTokens } from '../theme/theme';
import pagoService from '../services/pagoService';
import eventoService from '../services/eventoService';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    animationName: {
      from: { opacity: 0, transform: 'translateY(10px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    animationDuration: '0.5s',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 300px',
    ...shorthands.gap('24px'),
    [designTokens.breakpoints.md]: {
      gridTemplateColumns: '1fr',
    }
  },
  uploadArea: {
    ...shorthands.border('2px', 'dashed', tokens.colorBrandBackground),
    ...shorthands.borderRadius('12px'),
    ...shorthands.padding('32px'),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '16px',
    backgroundColor: 'rgba(127, 19, 236, 0.05)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: 'rgba(127, 19, 236, 0.1)',
    }
  }
});

const Finanzas = () => {
  const styles = useStyles();
  
  const [pagos, setPagos] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Formulario de carga
  const [selectedInscripcion, setSelectedInscripcion] = useState(null);
  const [monto, setMonto] = useState('');
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pagosData, inscripcionesData] = await Promise.all([
        pagoService.getMisPagos(),
        eventoService.getMisInscripciones()
      ]);
      setPagos(pagosData);
      setInscripciones(inscripcionesData.filter(i => i.estado_inscripcion === 'PENDIENTE'));
    } catch (err) {
      console.error("Error fetching finanzas data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedInscripcion || !monto || !file) {
      alert("Por favor completa todos los campos y selecciona un archivo.");
      return;
    }

    setUploading(true);
    setSuccess(false);
    
    const formData = new FormData();
    formData.append('id_referencia', selectedInscripcion);
    formData.append('tipo_referencia', 'EVENTO');
    formData.append('monto', monto);
    formData.append('metodo_pago', 'TRANSFERENCIA');
    formData.append('file', file);

    try {
      await pagoService.uploadComprobante(formData);
      setSuccess(true);
      setFile(null);
      setMonto('');
      setSelectedInscripcion(null);
      fetchData(); 
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error al subir comprobante:", err);
      alert("Error al subir comprobante. Inténtalo de nuevo.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <MainLayout>
      <div className={styles.container}>
        <div>
          <div className={styles.header}>
            <Money24Regular style={{ color: tokens.colorBrandForeground1, fontSize: '32px' }} />
            <MEHTypography variant="h1">Finanzas</MEHTypography>
          </div>
          <MEHTypography variant="body" style={{ opacity: 0.6 }}>
            Gestiona tus pagos, inscripciones y sube tus comprobantes.
          </MEHTypography>
        </div>

        <div className={styles.grid}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <MEHCard>
              <MEHTypography variant="h3" style={{ marginBottom: '16px', display: 'block' }}>Historial de Transacciones</MEHTypography>
              <div style={{ overflowX: 'auto' }}>
                {loading ? (
                  <Spinner label="Cargando transacciones..." />
                ) : pagos.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                        <TableHeaderCell>ID</TableHeaderCell>
                        <TableHeaderCell>Fecha</TableHeaderCell>
                        <TableHeaderCell>Referencia</TableHeaderCell>
                        <TableHeaderCell>Monto</TableHeaderCell>
                        <TableHeaderCell>Estado</TableHeaderCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagos.map((item) => (
                        <TableRow key={item.id_pago}>
                          <TableCell><MEHTypography variant="caption" style={{ fontFamily: 'monospace' }}>#{item.id_pago}</MEHTypography></TableCell>
                          <TableCell>{new Date(item.fecha_pago).toLocaleDateString()}</TableCell>
                          <TableCell>{item.tipo_referencia} #{item.id_referencia}</TableCell>
                          <TableCell><b>${item.monto}</b></TableCell>
                          <TableCell>
                            <div style={{ 
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              color: item.estado_pago === 'APROBADO' ? tokens.colorPaletteGreenForeground1 : 
                                     item.estado_pago === 'PENDIENTE' ? tokens.colorPaletteYellowForeground1 : 
                                     tokens.colorPaletteRedForeground1
                            }}>
                              {item.estado_pago === 'APROBADO' ? <CheckmarkCircle24Regular style={{ fontSize: '16px' }} /> : <Alert24Regular style={{ fontSize: '16px' }} />}
                              {item.estado_pago}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <MEHTypography variant="caption" style={{ display: 'block', textAlign: 'center', padding: '20px', opacity: 0.5 }}>
                    No tienes transacciones registradas todavía.
                  </MEHTypography>
                )}
              </div>
            </MEHCard>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <MEHCard style={{ background: 'linear-gradient(135deg, rgba(127, 19, 236, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%)' }}>
              <MEHTypography variant="caption" style={{ opacity: 0.8 }}>ESTADO DE CUENTA</MEHTypography>
              <MEHTypography variant="h1" style={{ margin: '8px 0', color: tokens.colorBrandForeground1 }}>
                {pagos.some(p => p.estado_pago === 'PENDIENTE') ? 'Pendiente' : 'Al Día'}
              </MEHTypography>
              <MEHTypography variant="body" style={{ opacity: 0.6 }}>
                {pagos.some(p => p.estado_pago === 'PENDIENTE') ? 'Tienes pagos en validación.' : 'No tienes pagos pendientes.'}
              </MEHTypography>
            </MEHCard>

            <MEHCard>
              <MEHTypography variant="h3" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Receipt24Regular /> Subir Comprobante
              </MEHTypography>
              
              <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <Label htmlFor="evento-select">Seleccionar Inscripción</Label>
                <Dropdown 
                  id="evento-select"
                  placeholder="Selecciona un evento"
                  onOptionSelect={(e, data) => setSelectedInscripcion(data.optionValue)}
                  style={{ width: '100%' }}
                >
                  {inscripciones.map(ins => (
                    <Option key={ins.id_inscripcion} value={ins.id_evento.toString()}>
                      Evento #{ins.id_evento}
                    </Option>
                  ))}
                </Dropdown>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <Label htmlFor="monto">Monto pagado ($)</Label>
                <Input 
                  id="monto" 
                  type="number" 
                  placeholder="0.00" 
                  value={monto}
                  onChange={(e, data) => setMonto(data.value)}
                  style={{ width: '100%', marginTop: '4px' }}
                />
              </div>

              <div className={styles.uploadArea} onClick={() => document.getElementById('file-upload').click()}>
                <ArrowUpload24Regular style={{ fontSize: '40px', color: tokens.colorBrandForeground1 }} />
                <MEHTypography variant="body" style={{ fontWeight: 'bold' }}>
                  {file ? file.name : 'Selecciona tu comprobante'}
                </MEHTypography>
                <input type="file" style={{ display: 'none' }} id="file-upload" onChange={handleFileChange} />
              </div>

              {success && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: tokens.colorPaletteGreenForeground1, marginTop: '12px', justifyContent: 'center' }}>
                  <CheckmarkCircle24Regular />
                  <MEHTypography variant="caption">¡Enviado con éxito!</MEHTypography>
                </div>
              )}

              <MEHButton 
                appearance="primary" 
                style={{ width: '100%', marginTop: '16px' }} 
                onClick={handleUpload}
                disabled={uploading || !file}
              >
                {uploading ? <Spinner size="tiny" /> : 'Enviar para validación'}
              </MEHButton>
            </MEHCard>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Finanzas;

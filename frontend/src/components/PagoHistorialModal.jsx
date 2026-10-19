import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Spinner,
  Badge,
  tokens
} from '@fluentui/react-components';
import {
  History24Regular,
  CheckmarkCircle24Regular,
  DismissCircle24Regular,
  ArrowRepeatAll24Regular,
  ArrowUndo24Regular,
  Receipt24Regular,
  Open24Regular
} from '@fluentui/react-icons';
import { MEHTypography, MEHButton } from './ui';
import pagoService from '../services/pagoService';
import { resolveApiFileUrl } from '../services/api';

const getEventBadge = (tipo) => {
  switch (tipo) {
    case 'APROBADO':
      return { color: 'success', icon: <CheckmarkCircle24Regular />, label: 'Aprobado' };
    case 'RECHAZADO':
      return { color: 'danger', icon: <DismissCircle24Regular />, label: 'Rechazado' };
    case 'REINTENTO':
      return { color: 'warning', icon: <ArrowRepeatAll24Regular />, label: 'Reintento' };
    case 'REEMBOLSADO':
      return { color: 'informative', icon: <ArrowUndo24Regular />, label: 'Reembolsado' };
    case 'CREACION':
    default:
      return { color: 'subtle', icon: <Receipt24Regular />, label: 'Creado' };
  }
};

export const PagoHistorialModal = ({ open, onOpenChange, idPago, titulo = 'Historial del Pago' }) => {
  const [loading, setLoading] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      fetchHistorial();
    } else {
      setHistorial([]);
      setError(null);
    }
  }, [open, idPago]);

  const fetchHistorial = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pagoService.getHistorialPagos(idPago);
      setHistorial(data);
    } catch (err) {
      console.error('Error fetching pago historial:', err);
      setError('No se pudo cargar el historial del pago.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogSurface style={{ maxWidth: '640px', width: '100%', borderRadius: '16px' }}>
        <DialogBody>
          <DialogTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History24Regular style={{ color: tokens.colorBrandForeground1 }} />
              <span>{titulo} {idPago ? `(#${idPago})` : ''}</span>
            </div>
          </DialogTitle>
          <DialogContent style={{ marginTop: '16px', maxHeight: '60vh', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '32px' }}>
                <Spinner label="Cargando historial..." />
              </div>
            ) : error ? (
              <MEHTypography variant="caption" style={{ color: tokens.colorPaletteRedForeground1, textAlign: 'center', display: 'block', padding: '16px' }}>
                {error}
              </MEHTypography>
            ) : historial.length === 0 ? (
              <MEHTypography variant="caption" style={{ opacity: 0.6, textAlign: 'center', display: 'block', padding: '24px' }}>
                No hay eventos registrados en el historial para este pago.
              </MEHTypography>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {historial.map((item, index) => {
                  const badgeInfo = getEventBadge(item.tipo_evento);
                  return (
                    <div
                      key={index}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        borderRadius: '10px',
                        borderLeft: `4px solid ${
                          item.tipo_evento === 'APROBADO' ? tokens.colorPaletteGreenBackground3 :
                          item.tipo_evento === 'RECHAZADO' ? tokens.colorPaletteRedBackground3 :
                          item.tipo_evento === 'REEMBOLSADO' ? tokens.colorBrandBackground :
                          tokens.colorNeutralStroke1
                        }`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Badge appearance="filled" color={badgeInfo.color} icon={badgeInfo.icon}>
                            {badgeInfo.label}
                          </Badge>
                          <MEHTypography variant="body" style={{ fontWeight: '600' }}>
                            {item.titulo}
                          </MEHTypography>
                        </div>
                        <MEHTypography variant="caption" style={{ opacity: 0.6, fontSize: '12px' }}>
                          {item.fecha ? new Date(item.fecha).toLocaleString() : ''}
                        </MEHTypography>
                      </div>

                      {item.descripcion && (
                        <MEHTypography variant="caption" style={{ opacity: 0.85, whiteSpace: 'pre-line' }}>
                          {item.descripcion}
                        </MEHTypography>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', opacity: 0.7 }}>
                          {item.responsable && <span>👤 Responsable: <b>{item.responsable}</b></span>}
                          {item.monto !== null && item.monto !== undefined && <span>💰 Monto: <b>Bs. {item.monto}</b></span>}
                        </div>
                        {item.url_comprobante && (
                          <MEHButton
                            size="small"
                            appearance="subtle"
                            icon={<Open24Regular />}
                            onClick={() => window.open(resolveApiFileUrl(item.url_comprobante), '_blank')}
                          >
                            Ver Comprobante
                          </MEHButton>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </DialogContent>
          <DialogActions style={{ marginTop: '16px' }}>
            <Button appearance="secondary" onClick={() => onOpenChange(null, { open: false })}>
              Cerrar
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default PagoHistorialModal;

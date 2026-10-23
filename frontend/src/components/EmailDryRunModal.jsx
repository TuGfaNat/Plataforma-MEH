import React from 'react';
import {
  Badge,
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Divider,
  tokens,
} from '@fluentui/react-components';
import {
  Mail24Regular,
  People24Regular,
  CheckmarkCircle24Filled,
} from '@fluentui/react-icons';
import { MEHButton, MEHTypography } from './ui';

const EmailDryRunModal = ({
  open,
  onClose,
  dryRunResult,
  onConfirmRealSend,
  sendingReal = false,
}) => {
  if (!dryRunResult) return null;

  const recipients = dryRunResult.destinatarios_preview || [];
  const totalRecipients = dryRunResult.total_destinatarios ?? recipients.length;
  const filtros = dryRunResult.filtros_aplicados || {};
  const cabecera = dryRunResult.evento_cabecera || null;

  return (
    <Dialog
      open={Boolean(open)}
      onOpenChange={(e, d) => {
        if (!d.open && !sendingReal && onClose) onClose();
      }}
    >
      <DialogSurface
        data-testid="email-dry-run-modal"
        style={{
          backgroundColor: tokens.colorNeutralBackground1,
          maxWidth: '760px',
          width: '95%',
          borderRadius: '18px',
        }}
      >
        <DialogBody>
          <DialogTitle>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail24Regular style={{ color: tokens.colorBrandForeground1 }} />
                Simulación de Correo (Dry-Run)
              </span>
              <Badge
                color="informative"
                appearance="filled"
                data-testid="dry-run-badge"
              >
                SIN ENVÍO SMTP REAL (0 ENVIADOS)
              </Badge>
            </div>
          </DialogTitle>

          <DialogContent
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '14px 0',
              maxHeight: '75vh',
              overflowY: 'auto',
            }}
          >
            {/* Resumen de audiencia y filtros */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '12px',
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: tokens.colorNeutralBackground2,
                border: `1px solid ${tokens.colorNeutralBackground3}`,
              }}
            >
              <div>
                <MEHTypography
                  variant="caption"
                  style={{ opacity: 0.7, display: 'block' }}
                >
                  Destinatarios que coinciden con filtros
                </MEHTypography>
                <MEHTypography
                  variant="h3"
                  data-testid="dry-run-total-recipients"
                  style={{
                    color: tokens.colorBrandForeground1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <People24Regular /> {totalRecipients} destinatario(s)
                </MEHTypography>
              </div>

              <div>
                <MEHTypography
                  variant="caption"
                  style={{ opacity: 0.7, display: 'block' }}
                >
                  Asunto Renderizado
                </MEHTypography>
                <MEHTypography
                  variant="body"
                  data-testid="dry-run-subject"
                  style={{ fontWeight: 'bold' }}
                >
                  {dryRunResult.asunto_renderizado || 'Sin asunto'}
                </MEHTypography>
              </div>

              <div>
                <MEHTypography
                  variant="caption"
                  style={{ opacity: 0.7, display: 'block' }}
                >
                  Cabecera de Evento en Correo
                </MEHTypography>
                {cabecera ? (
                  <Badge
                    color={
                      cabecera.tiene_imagen_portada ? 'success' : 'informative'
                    }
                    appearance="tint"
                    data-testid="dry-run-header-status"
                  >
                    {cabecera.tiene_imagen_portada
                      ? `Portada 16:9 + ${cabecera.titulo_evento}`
                      : `Fallback institucional + ${cabecera.titulo_evento}`}
                  </Badge>
                ) : (
                  <Badge color="neutral" appearance="outline">
                    Correo general (sin evento vinculado)
                  </Badge>
                )}
              </div>
            </div>

            {/* Filtros aplicados */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <MEHTypography variant="caption" style={{ fontWeight: 'bold' }}>
                Filtros aplicados:
              </MEHTypography>
              {filtros.estados_inscripcion && (
                <Badge appearance="outline" color="brand">
                  Estados: {filtros.estados_inscripcion.join(', ')}
                </Badge>
              )}
              {filtros.solo_asistentes && (
                <Badge appearance="outline" color="success">
                  Solo asistentes acreditados
                </Badge>
              )}
              {filtros.roles_destino && (
                <Badge appearance="outline" color="brand">
                  Roles: {filtros.roles_destino}
                </Badge>
              )}
              {filtros.exclusivo_embajadores && (
                <Badge appearance="outline" color="important">
                  Exclusivo Embajadores
                </Badge>
              )}
              {filtros.id_evento && (
                <Badge appearance="outline" color="informative">
                  Evento #{filtros.id_evento}{' '}
                  {filtros.solo_inscritos_evento
                    ? '(Solo inscritos)'
                    : '(Público)'}
                </Badge>
              )}
            </div>

            {/* Lista previa de destinatarios */}
            {recipients.length > 0 && (
              <div
                style={{
                  maxHeight: '120px',
                  overflowY: 'auto',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: tokens.colorNeutralBackground2,
                  border: `1px solid ${tokens.colorNeutralBackground3}`,
                }}
              >
                <MEHTypography
                  variant="caption"
                  style={{
                    fontWeight: 'bold',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  Muestra de destinatarios ({recipients.length} de{' '}
                  {totalRecipients}):
                </MEHTypography>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                  }}
                >
                  {recipients.map((r, idx) => (
                    <Badge
                      key={`rec-${r.id_usuario || idx}`}
                      appearance="tint"
                      color="brand"
                    >
                      {r.nombre} ({r.correo})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Divider />

            {/* Vista previa del HTML del correo */}
            <div>
              <MEHTypography
                variant="caption"
                style={{
                  fontWeight: 'bold',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                Vista previa exacta del correo HTML (incluyendo cabecera de
                evento):
              </MEHTypography>
              <div
                style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: `1px solid ${tokens.colorNeutralBackground3}`,
                  backgroundColor: '#ffffff',
                }}
              >
                <iframe
                  title="Vista previa Dry-Run del correo"
                  data-testid="dry-run-html-iframe"
                  srcDoc={dryRunResult.html_preview || ''}
                  sandbox="allow-same-origin"
                  style={{
                    width: '100%',
                    height: '380px',
                    border: 'none',
                    display: 'block',
                    backgroundColor: '#ffffff',
                  }}
                />
              </div>
            </div>
          </DialogContent>

          <DialogActions style={{ gap: '10px' }}>
            <Button
              appearance="secondary"
              onClick={onClose}
              disabled={sendingReal}
            >
              Cerrar Vista Previa
            </Button>
            {onConfirmRealSend && (
              <MEHButton
                appearance="primary"
                icon={<CheckmarkCircle24Filled />}
                disabled={sendingReal}
                onClick={onConfirmRealSend}
                data-testid="dry-run-confirm-send-btn"
              >
                {sendingReal ? 'Enviando...' : 'Confirmar y Enviar Realmente'}
              </MEHButton>
            )}
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default EmailDryRunModal;

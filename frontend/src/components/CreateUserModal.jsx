import React, { useState } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Field,
  Input,
  Select,
  Spinner,
  Checkbox,
  tokens,
  makeStyles
} from '@fluentui/react-components';
import {
  PersonAdd24Regular,
  Key24Regular,
  Mail24Regular,
  CheckmarkCircle24Filled,
  Copy24Regular
} from '@fluentui/react-icons';
import { MEHButton, MEHTypography } from './ui';
import authService from '../services/authService';
import { useNotify } from '../App';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    paddingTop: '8px',
  },
  twoCols: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    '@media (max-width: 500px)': {
      gridTemplateColumns: '1fr',
    }
  },
  successCard: {
    padding: '16px',
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: '12px',
    border: `1.5px solid ${tokens.colorPaletteGreenBorder2}`,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  }
});

const CreateUserModal = ({ open, onClose, currentUser = null, onSuccess }) => {
  const styles = useStyles();
  const { notify } = useNotify();

  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    correo: '',
    password: '',
    rol: 'MIEMBRO',
    institucion: ''
  });
  const [autoGenPassword, setAutoGenPassword] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [createdResult, setCreatedResult] = useState(null);

  const resetForm = () => {
    setFormData({
      nombres: '',
      apellidos: '',
      correo: '',
      password: '',
      rol: 'MIEMBRO',
      institucion: ''
    });
    setAutoGenPassword(true);
    setCreatedResult(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.nombres.trim() || !formData.apellidos.trim() || !formData.correo.trim()) {
      notify('Campos requeridos', 'Por favor completa nombres, apellidos y correo.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        correo: formData.correo.trim().toLowerCase(),
        rol: formData.rol,
        institucion: formData.institucion.trim() || null,
        password: autoGenPassword ? undefined : formData.password
      };

      const res = await authService.adminCreateUser(payload);
      setCreatedResult(res);
      notify('Cuenta Creada', `Se creó la cuenta para ${res.nombres} con email verificado.`, 'success');
      if (onSuccess) onSuccess(res);
    } catch (err) {
      console.error(err);
      notify('Error al crear cuenta', err.response?.data?.detail || 'No se pudo crear el usuario.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdResult) return;
    const text = `Acceso Plataforma MEH:\nCorreo: ${createdResult.correo}\nContraseña: ${createdResult.temporary_password}`;
    navigator.clipboard.writeText(text);
    notify('Copiado', 'Credenciales copiadas al portapapeles.', 'success');
  };

  return (
    <Dialog open={open} onOpenChange={(e, d) => { if (!d.open && !submitting) handleClose(); }}>
      <DialogSurface style={{ borderRadius: '20px', maxWidth: '520px', width: '100%' }}>
        <DialogBody>
          <DialogTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PersonAdd24Regular style={{ color: tokens.colorBrandForeground1 }} />
              <span>{createdResult ? 'Cuenta Creada Exitosamente' : 'Crear Nueva Cuenta / Miembro'}</span>
            </div>
          </DialogTitle>
          <DialogContent className={styles.container}>
            {createdResult ? (
              <div className={styles.successCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: tokens.colorPaletteGreenForeground1 }}>
                  <CheckmarkCircle24Filled fontSize={24} />
                  <b>Usuario registrado y activado inmediatamente</b>
                </div>
                <MEHTypography variant="body">
                  La cuenta ha sido creada con <b>Email Verificado (sin esperas de código)</b>.
                </MEHTypography>
                <div style={{ padding: '12px', backgroundColor: tokens.colorNeutralBackground1, borderRadius: '8px', border: `1px solid ${tokens.colorNeutralStroke1}` }}>
                  <div><b>Nombre:</b> {createdResult.nombres} {createdResult.apellidos}</div>
                  <div><b>Correo:</b> {createdResult.correo}</div>
                  <div><b>Rol:</b> {createdResult.rol}</div>
                  <div style={{ marginTop: '6px', color: tokens.colorBrandForeground1, fontWeight: 'bold' }}>
                    <b>Contraseña:</b> {createdResult.temporary_password}
                  </div>
                </div>
                <MEHButton size="small" icon={<Copy24Regular />} appearance="outline" onClick={handleCopyCredentials}>
                  Copiar Credenciales para el Usuario
                </MEHButton>
              </div>
            ) : (
              <>
                <div className={styles.twoCols}>
                  <Field label="Nombres:" required>
                    <Input
                      value={formData.nombres}
                      onChange={(e, d) => setFormData({ ...formData, nombres: d.value })}
                      placeholder="Ej: Carlos"
                    />
                  </Field>
                  <Field label="Apellidos:" required>
                    <Input
                      value={formData.apellidos}
                      onChange={(e, d) => setFormData({ ...formData, apellidos: d.value })}
                      placeholder="Ej: Mamani"
                    />
                  </Field>
                </div>

                <Field label="Correo Electrónico:" required>
                  <Input
                    type="email"
                    contentBefore={<Mail24Regular />}
                    value={formData.correo}
                    onChange={(e, d) => setFormData({ ...formData, correo: d.value })}
                    placeholder="usuario@ejemplo.com"
                  />
                </Field>

                <div className={styles.twoCols}>
                  <Field label="Rol en la Plataforma:">
                    <Select 
                      value={formData.rol} 
                      onChange={(e, d) => setFormData({ ...formData, rol: d.value })}
                      disabled={currentUser && currentUser.rol !== 'ADMIN'}
                    >
                      <option value="MIEMBRO">MIEMBRO</option>
                      {(!currentUser || currentUser.rol === 'ADMIN') && (
                        <>
                          <option value="ORGANIZADOR">ORGANIZADOR</option>
                          <option value="MODERADOR">MODERADOR</option>
                          <option value="SOPORTE">SOPORTE</option>
                          <option value="EMBAJADOR">EMBAJADOR</option>
                          <option value="ADMIN">ADMIN</option>
                        </>
                      )}
                    </Select>
                  </Field>
                  <Field label="Institución / Universidad:">
                    <Input
                      value={formData.institucion}
                      onChange={(e, d) => setFormData({ ...formData, institucion: d.value })}
                      placeholder="Ej: UMSA, UCB, etc."
                    />
                  </Field>
                </div>

                <div>
                  <Checkbox
                    checked={autoGenPassword}
                    onChange={(e, d) => setAutoGenPassword(d.checked === true)}
                    label="Generar contraseña segura automáticamente"
                  />
                  {!autoGenPassword && (
                    <Field label="Contraseña personalizada (mínimo 6 caracteres):" style={{ marginTop: '8px' }}>
                      <Input
                        type="password"
                        contentBefore={<Key24Regular />}
                        value={formData.password}
                        onChange={(e, d) => setFormData({ ...formData, password: d.value })}
                        placeholder="Contraseña segura"
                      />
                    </Field>
                  )}
                </div>

                <MEHTypography variant="caption" style={{ opacity: 0.7 }}>
                  Al crear la cuenta desde este panel, el correo queda verificado automáticamente y el usuario podrá iniciar sesión sin pasos adicionales.
                </MEHTypography>
              </>
            )}
          </DialogContent>

          <DialogActions style={{ marginTop: '16px' }}>
            {createdResult ? (
              <MEHButton appearance="primary" onClick={handleClose}>
                Entendido / Finalizar
              </MEHButton>
            ) : (
              <>
                <MEHButton appearance="secondary" onClick={handleClose} disabled={submitting}>
                  Cancelar
                </MEHButton>
                <MEHButton
                  appearance="primary"
                  icon={submitting ? <Spinner size="tiny" /> : <CheckmarkCircle24Filled />}
                  onClick={handleSubmit}
                  disabled={submitting || !formData.nombres || !formData.apellidos || !formData.correo}
                >
                  {submitting ? 'Creando...' : 'Crear Cuenta Inmediata'}
                </MEHButton>
              </>
            )}
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default CreateUserModal;

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
  Textarea,
  Select,
  Spinner,
  Checkbox,
  tokens,
  makeStyles,
  shorthands
} from '@fluentui/react-components';
import {
  PersonAdd24Regular,
  Key24Regular,
  Mail24Regular,
  CheckmarkCircle24Filled,
  Copy24Regular,
  ChevronDown20Regular,
  ChevronUp20Regular,
  Globe20Regular,
  Tag20Regular
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
  sectionBox: {
    padding: '12px 14px',
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRadius('12px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sectionToggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    userSelect: 'none',
    padding: '4px 0',
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

const DEPARTAMENTOS_BOLIVIA = [
  'La Paz',
  'Cochabamba',
  'Santa Cruz',
  'Oruro',
  'Potosí',
  'Chuquisaca',
  'Tarija',
  'Beni',
  'Pando',
  'Exterior'
];

const CreateUserModal = ({ open, onClose, currentUser = null, onSuccess }) => {
  const styles = useStyles();
  const { notify } = useNotify();

  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    correo: '',
    password: '',
    rol: 'MIEMBRO',
    alias: '',
    institucion: '',
    tipo_entidad: 'Estudiante',
    departamento: 'La Paz',
    pais: 'Bolivia',
    bio: '',
    linkedin_url: '',
    github_url: ''
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
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
      alias: '',
      institucion: '',
      tipo_entidad: 'Estudiante',
      departamento: 'La Paz',
      pais: 'Bolivia',
      bio: '',
      linkedin_url: '',
      github_url: ''
    });
    setShowAdvanced(false);
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
      notify('Campos requeridos', 'Por favor completa nombres, apellidos y correo electrónico.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        correo: formData.correo.trim().toLowerCase(),
        rol: formData.rol,
        alias: formData.alias.trim() ? formData.alias.trim().replace(/^@/, '') : undefined,
        institucion: formData.institucion.trim() || undefined,
        tipo_entidad: formData.tipo_entidad || 'Estudiante',
        departamento: formData.departamento || undefined,
        pais: formData.pais.trim() || 'Bolivia',
        bio: formData.bio.trim() || undefined,
        linkedin_url: formData.linkedin_url.trim() || undefined,
        github_url: formData.github_url.trim() || undefined,
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
      <DialogSurface style={{ borderRadius: '20px', maxWidth: '580px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <DialogBody>
          <DialogTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PersonAdd24Regular style={{ color: tokens.colorBrandForeground1 }} />
              <span>{createdResult ? 'Cuenta Creada Exitosamente' : 'Habilitar Nueva Cuenta / Miembro'}</span>
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
                  La cuenta ha sido creada con <b>Email Verificado (sin esperas de código ni bloqueos)</b>.
                </MEHTypography>
                <div style={{ padding: '12px', backgroundColor: tokens.colorNeutralBackground1, borderRadius: '8px', border: `1px solid ${tokens.colorNeutralStroke1}` }}>
                  <div><b>Nombre:</b> {createdResult.nombres} {createdResult.apellidos}</div>
                  <div><b>Correo:</b> {createdResult.correo}</div>
                  {createdResult.alias && <div><b>Alias:</b> @{createdResult.alias}</div>}
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
                {/* 1. Datos Esenciales (Requeridos para habilitación rápida) */}
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

                <div className={styles.twoCols}>
                  <Field label="Correo Electrónico:" required>
                    <Input
                      type="email"
                      contentBefore={<Mail24Regular />}
                      value={formData.correo}
                      onChange={(e, d) => setFormData({ ...formData, correo: d.value })}
                      placeholder="usuario@ejemplo.com"
                    />
                  </Field>
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
                </div>

                <div className={styles.twoCols}>
                  <Field label="Institución / Universidad / Empresa (Opcional):">
                    <Input
                      value={formData.institucion}
                      onChange={(e, d) => setFormData({ ...formData, institucion: d.value })}
                      placeholder="Ej: UMSA, UCB, Microsoft"
                    />
                  </Field>
                  <Field label="Alias / Username público (Opcional):">
                    <Input
                      contentBefore={<Tag20Regular />}
                      value={formData.alias}
                      onChange={(e, d) => setFormData({ ...formData, alias: d.value })}
                      placeholder="Ej: carlos_dev"
                    />
                  </Field>
                </div>

                {/* 2. Sección desplegable de perfil completo (Opcional) */}
                <div className={styles.sectionBox}>
                  <div 
                    className={styles.sectionToggle}
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Globe20Regular style={{ color: tokens.colorBrandForeground1 }} />
                      <span style={{ fontWeight: '600', fontSize: '13px' }}>
                        {showAdvanced ? 'Ocultar campos adicionales de perfil' : 'Completar perfil extendido (Ubicación, redes, biografía) - Opcional'}
                      </span>
                    </div>
                    {showAdvanced ? <ChevronUp20Regular /> : <ChevronDown20Regular />}
                  </div>

                  {showAdvanced && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
                      <div className={styles.twoCols}>
                        <Field label="Tipo de Miembro:">
                          <Select
                            value={formData.tipo_entidad}
                            onChange={(e, d) => setFormData({ ...formData, tipo_entidad: d.value })}
                          >
                            <option value="Estudiante">Estudiante</option>
                            <option value="Profesional">Profesional</option>
                            <option value="Docente">Docente</option>
                            <option value="Emprendedor">Emprendedor</option>
                            <option value="Otro">Otro</option>
                          </Select>
                        </Field>
                        <Field label="Departamento / Ciudad:">
                          <Select
                            value={formData.departamento}
                            onChange={(e, d) => setFormData({ ...formData, departamento: d.value })}
                          >
                            {DEPARTAMENTOS_BOLIVIA.map(dep => (
                              <option key={dep} value={dep}>{dep}</option>
                            ))}
                          </Select>
                        </Field>
                      </div>

                      <div className={styles.twoCols}>
                        <Field label="País:">
                          <Input
                            value={formData.pais}
                            onChange={(e, d) => setFormData({ ...formData, pais: d.value })}
                            placeholder="Bolivia"
                          />
                        </Field>
                        <Field label="LinkedIn (URL):">
                          <Input
                            value={formData.linkedin_url}
                            onChange={(e, d) => setFormData({ ...formData, linkedin_url: d.value })}
                            placeholder="https://linkedin.com/in/..."
                          />
                        </Field>
                      </div>

                      <Field label="GitHub (URL):">
                        <Input
                          value={formData.github_url}
                          onChange={(e, d) => setFormData({ ...formData, github_url: d.value })}
                          placeholder="https://github.com/..."
                        />
                      </Field>

                      <Field label="Biografía breve:">
                        <Textarea
                          rows={2}
                          value={formData.bio}
                          onChange={(e, d) => setFormData({ ...formData, bio: d.value })}
                          placeholder="Intereses, tecnologías favoritas, rol comunitario..."
                        />
                      </Field>
                    </div>
                  )}
                </div>

                {/* 3. Contraseña */}
                <div style={{ marginTop: '2px' }}>
                  <Checkbox
                    checked={autoGenPassword}
                    onChange={(e, d) => setAutoGenPassword(d.checked === true)}
                    label="Generar contraseña segura automáticamente (Recomendado para habilitación rápida)"
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
                  ⚡ <b>Habilitación rápida:</b> Solo Nombres, Apellidos y Correo son obligatorios. El usuario queda activado y con email verificado de inmediato.
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
                  {submitting ? 'Creando...' : 'Habilitar Cuenta Inmediata'}
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

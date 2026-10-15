import React, { useState } from 'react';
import { 
  makeStyles, 
  shorthands, 
  MessageBar,
  tokens
} from '@fluentui/react-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LockClosed24Filled,
  Key24Filled,
  Checkmark24Regular,
  Eye24Regular,
  EyeOff24Regular,
  ShieldLock24Regular,
  Info24Regular
} from '@fluentui/react-icons';
import authService from '../services/authService';
import { designTokens } from '../theme/theme';
import { MEHButton, MEHInput, MEHCard, MEHTypography } from '../components/ui';
import { useAuth, useNotify } from '../App';
import { validatePassword } from '../utils/validators';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground4,
    background: `radial-gradient(circle at top right, ${tokens.colorBrandBackground2} 0%, ${tokens.colorNeutralBackground4} 60%)`,
    position: 'relative',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: '600px',
    height: '600px',
    background: tokens.colorBrandBackground2,
    filter: 'blur(150px)',
    ...shorthands.borderRadius('50%'),
    opacity: 0.2,
    zIndex: 0,
    top: '-200px',
    left: '-200px',
  },
  card: {
    width: '460px',
    zIndex: 1,
    ...shorthands.padding('44px'),
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    animationName: {
      from: { opacity: 0, transform: 'translateY(20px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    animationDuration: '0.6s',
    '@media (max-width: 500px)': {
      width: '90%',
      ...shorthands.padding('28px', '18px'),
    }
  },
  logo: {
    width: '64px',
    filter: 'drop-shadow(0 0 20px rgba(127, 19, 236, 0.4))',
    marginBottom: '4px',
    alignSelf: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  }
});

const CambiarContrasena = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, checkAuth } = useAuth();
  const { notify } = useNotify();

  const [formData, setFormData] = useState({
    password_actual: '',
    nuevo_password: '',
    confirm_password: ''
  });
  const [errors, setErrors] = useState({
    password_actual: null,
    nuevo_password: null,
    confirm_password: null
  });
  const [showPasswordActual, setShowPasswordActual] = useState(false);
  const [showNuevoPassword, setShowNuevoPassword] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const actualErr = !formData.password_actual ? t("password_required") : null;
    const nuevoErr = validatePassword(formData.nuevo_password);
    const confirmErr = formData.nuevo_password !== formData.confirm_password 
      ? t("passwords_dont_match") 
      : null;

    setErrors({
      password_actual: actualErr,
      nuevo_password: nuevoErr,
      confirm_password: confirmErr
    });

    if (actualErr || nuevoErr || confirmErr) return;

    setLoading(true);
    setApiError(null);

    try {
      await authService.cambiarPassword(formData.password_actual, formData.nuevo_password);
      setSuccess(true);
      if (checkAuth) {
        await checkAuth();
      }
      notify(t("success"), t("change_password_success"), "success");
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.detail || t("change_password_error");
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.glow}></div>

      <MEHCard className={styles.card}>
        <img src={designTokens.logo} alt="MEH Logo" className={styles.logo} />

        <div style={{ textAlign: 'center' }}>
          <MEHTypography variant="h2" style={{ fontWeight: tokens.fontWeightBold }}>
            {t("change_password_title")}
          </MEHTypography>
          <MEHTypography variant="body" style={{ opacity: 0.75, marginTop: '4px' }}>
            {t("change_password_subtitle")}
          </MEHTypography>
        </div>

        {user?.es_nuevo && (
          <MessageBar intent="info" icon={<Info24Regular />}>
            {t("change_password_first_login_notice")}
          </MessageBar>
        )}

        {success ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <MessageBar intent="success">
              {t("change_password_success")}
            </MessageBar>
            <MEHButton appearance="primary" onClick={() => navigate('/dashboard')}>
              {t("enter_portal")}
            </MEHButton>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {apiError && <MessageBar intent="error">{apiError}</MessageBar>}

            <MEHInput 
              label={t("current_password")}
              type={showPasswordActual ? "text" : "password"}
              contentBefore={<Key24Filled style={{ opacity: 0.5 }} />}
              contentAfter={
                <MEHButton 
                  appearance="subtle" 
                  icon={showPasswordActual ? <EyeOff24Regular /> : <Eye24Regular />} 
                  onClick={() => setShowPasswordActual(!showPasswordActual)}
                />
              }
              value={formData.password_actual}
              onChange={(e, data) => setFormData(prev => ({ ...prev, password_actual: data.value }))}
              placeholder="••••••••"
              validationState={errors.password_actual ? "error" : "none"}
              validationMessage={errors.password_actual}
              required
            />

            <MEHInput 
              label={t("new_password")}
              type={showNuevoPassword ? "text" : "password"}
              contentBefore={<LockClosed24Filled style={{ opacity: 0.5 }} />}
              contentAfter={
                <MEHButton 
                  appearance="subtle" 
                  icon={showNuevoPassword ? <EyeOff24Regular /> : <Eye24Regular />} 
                  onClick={() => setShowNuevoPassword(!showNuevoPassword)}
                />
              }
              value={formData.nuevo_password}
              onChange={(e, data) => setFormData(prev => ({ ...prev, nuevo_password: data.value }))}
              placeholder="••••••••"
              validationState={errors.nuevo_password ? "error" : "none"}
              validationMessage={errors.nuevo_password}
              required
            />

            <MEHInput 
              label={t("confirm_new_password")}
              type={showNuevoPassword ? "text" : "password"}
              contentBefore={<Checkmark24Regular style={{ opacity: 0.5 }} />}
              value={formData.confirm_password}
              onChange={(e, data) => setFormData(prev => ({ ...prev, confirm_password: data.value }))}
              placeholder="••••••••"
              validationState={errors.confirm_password ? "error" : "none"}
              validationMessage={errors.confirm_password}
              required
            />

            <MEHButton 
              size="large" 
              type="submit" 
              loading={loading}
              icon={<ShieldLock24Regular />}
              style={{ height: '50px', marginTop: '8px' }}
            >
              {t("change_password_button")}
            </MEHButton>
          </form>
        )}
      </MEHCard>
    </div>
  );
};

export default CambiarContrasena;

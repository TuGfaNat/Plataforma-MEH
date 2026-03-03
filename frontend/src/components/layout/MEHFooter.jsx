import React from 'react';
import { 
  makeStyles, 
  shorthands, 
  tokens, 
  Body1, 
  Caption1,
  mergeClasses
} from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { MEHTypography, MEHButton } from '../ui';
import { Link } from 'react-router-dom';
import { designTokens } from '../../theme/theme';
import { useTheme } from '../../App';
import { 
  Globe24Regular, 
  Mail24Regular, 
  Chat24Regular,
  PeopleCommunity24Regular
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  footer: {
    // Usamos el token del sistema para que se vea bien en plomo
    ...shorthands.borderTop('1.5px', 'solid', tokens.colorNeutralBackground3),
    ...shorthands.padding('60px', '24px', '40px', '24px'),
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
    width: '100%',
    boxSizing: 'border-box',
    marginTop: 'auto',
    position: 'relative',
    overflow: 'hidden',
  },
  glassDark: {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(10px)',
  },
  glassLight: {
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.02)',
  },
  glow: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    background: tokens.colorBrandBackground2,
    filter: 'blur(100px)',
    ...shorthands.borderRadius('50%'),
    opacity: 0.1,
    zIndex: 0,
    bottom: '-200px',
    right: '10%',
  },
  contentWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    zIndex: 1,
    position: 'relative',
  },
  topSection: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1.5fr',
    gap: '48px',
    '@media (max-width: 1024px)': {
      gridTemplateColumns: '1fr 1fr',
      gap: '32px',
    },
    '@media (max-width: 600px)': {
      gridTemplateColumns: '1fr',
      textAlign: 'center',
    }
  },
  brandCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  logo: {
    width: '48px',
    filter: 'drop-shadow(0 0 10px rgba(127, 19, 236, 0.3))',
  },
  linkCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  linkTitle: {
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorNeutralForeground1,
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontSize: '0.75rem',
  },
  link: {
    color: tokens.colorNeutralForeground3,
    textDecorationLine: 'none',
    transition: 'all 0.2s ease',
    fontSize: tokens.fontSizeBase300,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    ':hover': {
      color: tokens.colorBrandForeground1,
      transform: 'translateX(4px)',
    }
  },
  socialGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
    '@media (max-width: 600px)': {
      justifyContent: 'center',
    }
  },
  bottomSection: {
    ...shorthands.borderTop('1.5px', 'solid', tokens.colorNeutralBackground3),
    paddingTop: '32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    '@media (max-width: 600px)': {
      flexDirection: 'column',
    }
  }
});

export const MEHFooter = () => {
  const styles = useStyles();
  const { isDarkMode } = useTheme();

  const glassStyle = isDarkMode ? styles.glassDark : styles.glassLight;

  return (
    <footer className={mergeClasses(styles.footer, glassStyle)}>
      <div className={styles.glow}></div>
      
      <div className={styles.contentWrapper}>
        <div className={styles.topSection}>
          {/* Columna Marca */}
          <div className={styles.brandCol}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
              <img src={designTokens.logo} alt="MEH Logo" className={styles.logo} />
              <MEHTypography variant="h2" style={{ fontWeight: tokens.fontWeightBlack }}>MEH</MEHTypography>
            </div>
            <Body1 style={{ color: tokens.colorBrandForeground1, fontStyle: 'italic', fontWeight: tokens.fontWeightSemibold }}>
              "Innovating the future, together"
            </Body1>
            <Body1 style={{ opacity: 0.6, maxWidth: '320px', lineHeight: '1.6' }}>
              Empoderando a la próxima generación de líderes tecnológicos a través de Azure, IA y colaboración global.
            </Body1>
            <div className={styles.socialGroup}>
              <MEHButton appearance="subtle" size="small" icon={<Globe24Regular />} />
              <MEHButton appearance="subtle" size="small" icon={<Chat24Regular />} />
              <MEHButton appearance="subtle" size="small" icon={<PeopleCommunity24Regular />} />
            </div>
          </div>

          {/* Columna Explorar */}
          <div className={styles.linkCol}>
            <span className={styles.linkTitle}>Explorar</span>
            <Link to="/" className={styles.link}>Inicio</Link>
            <Link to="/login" className={styles.link}>Portal Miembros</Link>
            <Link to="/dashboard" className={styles.link}>Eventos</Link>
          </div>

          {/* Columna Recursos */}
          <div className={styles.linkCol}>
            <span className={styles.linkTitle}>Recursos</span>
            <Link to="#" className={styles.link}>Documentación</Link>
            <Link to="#" className={styles.link}>Guía de Estilo</Link>
            <Link to="#" className={styles.link}>Soporte</Link>
          </div>

          {/* Columna Contacto */}
          <div className={styles.linkCol}>
            <span className={styles.linkTitle}>Contacto</span>
            <div className={styles.link} style={{ cursor: 'default' }}>
              <Mail24Regular style={{ fontSize: '18px' }} />
              <span>hola@mehhub.com</span>
            </div>
            <div style={{ marginTop: '16px' }}>
              <MEHButton appearance="outline" size="small" style={{ width: '100%' }}>
                Únete al Discord
              </MEHButton>
            </div>
          </div>
        </div>

        <div className={styles.bottomSection}>
          <Caption1 style={{ opacity: 0.4 }}>
            © 2026 Microsoft Education Hub. Todos los derechos reservados.
          </Caption1>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link to="#" className={styles.link} style={{ fontSize: '11px', opacity: 0.5 }}>Privacidad</Link>
            <Link to="#" className={styles.link} style={{ fontSize: '11px', opacity: 0.5 }}>Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

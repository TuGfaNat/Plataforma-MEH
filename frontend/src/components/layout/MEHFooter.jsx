import React from "react";
import {
  makeStyles,
  shorthands,
  tokens,
  Body1,
  Caption1,
  mergeClasses,
} from "@fluentui/react-components";
import { useTranslation } from "react-i18next";
import { MEHTypography, MEHButton } from "../ui";
import { Link } from "react-router-dom";
import { designTokens } from "../../theme/theme";
import { useTheme } from "../../App";
import { getGlassEffect } from "../../theme/effects";
import {
  Mail24Regular,
  Chat24Regular,
  PeopleCommunity24Regular,
  VideoClip24Regular,
} from "@fluentui/react-icons";

const useStyles = makeStyles({
  footer: {
    ...shorthands.borderTop("1.5px", "solid", tokens.colorNeutralBackground3),
    ...shorthands.padding("60px", "24px", "40px", "24px"),
    display: "flex",
    flexDirection: "column",
    gap: "40px",
    width: "100%",
    boxSizing: "border-box",
    marginTop: "auto",
    position: "relative",
    overflow: "hidden",
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
    maxWidth: "1200px",
    margin: "0 auto",
    width: "100%",
    zIndex: 1,
    position: "relative",
  },
  topSection: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1.5fr",
    gap: "48px",
    "@media (max-width: 1024px)": {
      gridTemplateColumns: "1fr 1fr",
      gap: "32px",
    },
    "@media (max-width: 600px)": {
      gridTemplateColumns: "1fr",
      textAlign: "center",
    },
  },
  brandCol: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  logo: {
    width: "48px",
    filter: "drop-shadow(0 0 10px rgba(127, 19, 236, 0.3))",
  },
  linkCol: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  linkTitle: {
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorNeutralForeground1,
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "1px",
    fontSize: "0.75rem",
  },
  link: {
    color: tokens.colorNeutralForeground3,
    textDecorationLine: "none",
    transition: "all 0.2s ease",
    fontSize: tokens.fontSizeBase300,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    ":hover": {
      color: tokens.colorBrandForeground1,
      transform: "translateX(4px)",
    },
  },
  socialGroup: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "8px",
    "@media (max-width: 600px)": {
      justifyContent: "center",
    },
  },
  bottomSection: {
    ...shorthands.borderTop("1.5px", "solid", tokens.colorNeutralBackground3),
    paddingTop: "32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
    "@media (max-width: 600px)": {
      flexDirection: "column",
    },
  },
  socialIcon: {
    width: "24px",
    height: "24px",
    transition: "all 0.3s ease",
    cursor: "pointer",
    ":hover": {
      transform: "scale(1.15)",
      filter: "drop-shadow(0 0 8px rgba(127, 19, 236, 0.4))",
    },
  },
});

export const MEHFooter = () => {
  const styles = useStyles();
  const { currentTheme } = useTheme();

  const glassStyle = getGlassEffect(currentTheme);

  const socialLinks = [
    {
      name: "Facebook",
      url: "https://www.facebook.com/microsoft.education.hub",
      icon: "https://cdn-icons-png.flaticon.com/512/733/733547.png",
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/microsoft_education_hub/",
      icon: "https://cdn-icons-png.flaticon.com/512/2111/2111463.png",
    },
    {
      name: "TikTok",
      url: "https://www.tiktok.com/@microsoft_education_hub",
      icon: "https://cdn-icons-png.flaticon.com/512/3046/3046121.png",
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/company/microsoft-education-hub",
      icon: "https://cdn-icons-png.flaticon.com/512/174/174857.png",
    },
    {
      name: "Telegram",
      url: "https://t.me/microsoft_education_hub",
      icon: "https://cdn-icons-png.flaticon.com/512/2111/2111646.png",
    },
    {
      name: "WhatsApp Canal",
      url: "https://whatsapp.com/channel/0029VagyQcK6mYPQwwV0pc1M",
      icon: "https://cdn-icons-png.flaticon.com/512/733/733585.png",
    },
  ];

  return (
    <footer className={mergeClasses(styles.footer)} style={glassStyle}>
      <div className={styles.glow}></div>

      <div className={styles.contentWrapper}>
        <div className={styles.topSection}>
          {/* Columna Marca */}
          <div className={styles.brandCol}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "8px",
              }}
            >
              <img
                src={designTokens.logo}
                alt="MEH Logo"
                className={styles.logo}
              />
              <MEHTypography
                variant="h2"
                style={{ fontWeight: tokens.fontWeightBlack }}
              >
                MEH
              </MEHTypography>
            </div>
            <Body1
              style={{
                color: tokens.colorBrandForeground1,
                fontStyle: "italic",
                fontWeight: tokens.fontWeightSemibold,
              }}
            >
              "Innovating the future, together"
            </Body1>
            <Body1
              style={{ opacity: 0.6, maxWidth: "320px", lineHeight: "1.6" }}
            >
              Empoderando a la próxima generación de líderes tecnológicos a
              través de Azure, IA y colaboración global.
            </Body1>
            <div className={styles.socialGroup}>
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={social.icon}
                    alt={social.name}
                    className={styles.socialIcon}
                    title={social.name}
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Columna Comunidad */}
          <div className={styles.linkCol}>
            <span className={styles.linkTitle}>Comunidad</span>
            <a
              href="https://chat.whatsapp.com/LDxk8EbhDYo5s8U9S8OzLm"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Grupo WhatsApp
            </a>
            <a
              href="https://t.me/microsoft_education_hub"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Canal Telegram
            </a>
            <Link to="/register" className={styles.link}>
              Unirse a MEH
            </Link>
          </div>

          {/* Columna Contacto */}
          <div className={styles.linkCol}>
            <span className={styles.linkTitle}>Contacto</span>
            <a href="mailto:meh.bolivia@gmail.com" className={styles.link}>
              <Mail24Regular style={{ fontSize: "18px" }} />
              <span>meh.bolivia@gmail.com</span>
            </a>
            <div style={{ marginTop: "16px" }}>
              <MEHButton
                appearance="primary"
                size="small"
                style={{ width: "100%" }}
                onClick={() =>
                  window.open(
                    "https://chat.whatsapp.com/LDxk8EbhDYo5s8U9S8OzLm",
                    "_blank",
                  )
                }
              >
                Únete al WhatsApp
              </MEHButton>
            </div>
          </div>
        </div>

        <div className={styles.bottomSection}>
          <Caption1 style={{ opacity: 0.4 }}>
            © 2026 Microsoft Education Hub. Todos los derechos reservados.
            TuGfaNat.
          </Caption1>
          <div style={{ display: "flex", gap: "24px" }}></div>
        </div>
      </div>
    </footer>
  );
};

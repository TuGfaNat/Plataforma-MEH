import React from "react";
import {
  makeStyles,
  shorthands,
  tokens,
  Body1,
  Button,
} from "@fluentui/react-components";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Translate24Regular,
  WeatherSunny24Regular,
  WeatherMoon24Regular,
  Library24Regular,
  Globe24Regular,
  ShieldCheckmark24Filled,
  Drop24Regular,
  Eye24Regular
} from "@fluentui/react-icons";
import { designTokens } from "../../theme/theme";
import { useTheme } from "../../App";
import { MEHButton, MEHTypography } from "../ui";

const useStyles = makeStyles({
  header: {
    ...shorthands.padding("24px", "40px"),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
    width: "100%",
    boxSizing: "border-box",
    zIndex: 100,
    backgroundColor: `color-mix(in srgb, ${tokens.colorNeutralBackground1} 20%, transparent)`,
    backdropFilter: 'blur(20px)',
    ...shorthands.borderBottom("1px", "solid", `color-mix(in srgb, ${tokens.colorNeutralStroke1} 5%, transparent)`),
    [designTokens.breakpoints.sm]: {
      ...shorthands.padding("15px", "20px"),
    },
  },
  headerButton: {
    ...shorthands.border("1px", "solid", `color-mix(in srgb, ${tokens.colorNeutralStroke1} 10%, transparent)`),
    transition: "all 0.2s ease",
    backgroundColor: `color-mix(in srgb, ${tokens.colorNeutralBackground1} 5%, transparent)`,
    ":hover": {
      backgroundColor: `color-mix(in srgb, ${tokens.colorNeutralBackground1} 15%, transparent)`,
      transform: "translateY(-2px)",
      ...shorthands.borderColor(tokens.colorBrandForeground1),
    },
  }
});

export const LandingHeader = () => {
  const styles = useStyles();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { currentTheme, toggleTheme } = useTheme();

  const changeLanguage = () => {
    const nextLang = i18n.language === "es" ? "en" : "es";
    i18n.changeLanguage(nextLang);
  };

  return (
    <header className={styles.header}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <img 
          src={designTokens.logo} 
          alt="Logotipo oficial de la Plataforma Microsoft Education Hub" 
          style={{ width: "40px" }} 
        />
        <MEHTypography
          variant="h3"
          style={{ fontWeight: tokens.fontWeightBold }}
        >
          MEH
        </MEHTypography>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <MEHButton
          appearance="subtle"
          onClick={() => navigate("/validador")}
          style={{ marginRight: "8px" }}
        >
          {t("verificar_talento")}
        </MEHButton>
        <MEHButton
          appearance="subtle"
          icon={<Translate24Regular aria-hidden="true" />}
          onClick={changeLanguage}
          aria-label="Cambiar Idioma / Change Language"
          title="Cambiar Idioma / Change Language"
        />
        {(() => {
          const THEME_DISPLAY = {
            dark: { icon: WeatherMoon24Regular, label: "Oscuro" },
            light: { icon: WeatherSunny24Regular, label: "Claro" },
            blue: { icon: Globe24Regular, label: "Blue" },
            ash: { icon: Library24Regular, label: "Ceniza" },
            highContrast: { icon: ShieldCheckmark24Filled, label: "Alto Contraste" },
            ocean: { icon: Drop24Regular, label: "Ocean" },
            colorblind: { icon: Eye24Regular, label: "Accesible CUD" },
          };
          const currentConfig = THEME_DISPLAY[currentTheme] || { icon: WeatherMoon24Regular, label: currentTheme };
          const IconComponent = currentConfig.icon;
          return (
            <MEHButton 
              appearance="subtle" 
              icon={<IconComponent aria-hidden="true" />} 
              onClick={toggleTheme}
              aria-label={`Cambiar tema visual. Tema actual: ${currentConfig.label}`}
              title={`Cambiar tema (Actual: ${currentConfig.label})`}
            />
          );
        })()}
        <Link
          to="/login"
          style={{ textDecoration: "none", marginLeft: "12px" }}
        >
          <MEHButton
            shape="circular"
            appearance="outline"
            className={styles.headerButton}
          >
            {t("enter_portal")}
          </MEHButton>
        </Link>
      </div>
    </header>
  );
};

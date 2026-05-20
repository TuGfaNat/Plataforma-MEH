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
  ShieldCheckmark24Filled
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
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    backdropFilter: "blur(20px)",
    ...shorthands.borderBottom("1px", "solid", "rgba(255, 255, 255, 0.05)"),
    [designTokens.breakpoints.sm]: {
      ...shorthands.padding("15px", "20px"),
    },
  },
  headerButton: {
    ...shorthands.border("1px", "solid", "rgba(255, 255, 255, 0.1)"),
    transition: "all 0.2s ease",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    ":hover": {
      backgroundColor: "rgba(255, 255, 255, 0.15)",
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
        <img src={designTokens.logo} alt="logo" style={{ width: "40px" }} />
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
          icon={<Translate24Regular />}
          onClick={changeLanguage}
          title="Cambiar Idioma / Change Language"
        />
        <MEHButton 
          appearance="subtle" 
          icon={
            currentTheme === 'light' ? <WeatherMoon24Regular /> : 
            currentTheme === 'dark' ? <WeatherSunny24Regular /> :
            currentTheme === 'blue' ? <Globe24Regular /> :
            currentTheme === 'ash' ? <Library24Regular /> :
            <ShieldCheckmark24Filled />
          } 
          onClick={toggleTheme}
          title={
            currentTheme === 'dark' ? "Cambiar a Modo Claro" :
            currentTheme === 'light' ? "Cambiar a Modo Blue" :
            currentTheme === 'blue' ? "Cambiar a Modo Ceniza" :
            currentTheme === 'ash' ? "Cambiar a Modo Alto Contraste" :
            "Cambiar a Modo Oscuro"
          }
        />
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

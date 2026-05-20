import React, { useState, useEffect } from "react";
import {
  makeStyles,
  shorthands,
  tokens,
  Input,
  Spinner,
  Badge,
} from "@fluentui/react-components";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { designTokens } from "../theme/theme";
import { MEHButton, MEHCard, MEHTypography } from "../components/ui";
import { useTheme } from "../App";
import eventoService from "../services/eventoService";
import cursoService from "../services/cursoService";

import {
  CalendarStar24Regular,
  Certificate24Regular,
  Globe24Regular,
  ShieldCheckmark24Filled,
  Search24Regular,
  CalendarClock24Regular,
  Location24Regular,
  Video24Regular,
  Library24Regular,
  Book24Regular,
  WeatherMoon24Regular,
  WeatherSunny24Regular,
  Translate24Regular,
} from "@fluentui/react-icons";

import { MEHFooter } from "../components/layout/MEHFooter";
import LearningPathModal from "../components/LearningPathModal";

const useStyles = makeStyles({
  container: {
    minHeight: "100vh",
    color: tokens.colorNeutralForeground1,
    backgroundColor: tokens.colorNeutralBackground1,
    display: "flex",
    flexDirection: "column",
    overflowX: "hidden",
    position: "relative",
    zIndex: 1,
    // Textura de rejilla sutil - MÁS NOTABLE
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `linear-gradient(rgba(127, 19, 236, 0.8) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(127, 19, 236, 0.8) 1.5px, transparent 1.5px)`,
      backgroundSize: "60px 60px",
      zIndex: -1,
      pointerEvents: "none",
      maskImage: "radial-gradient(ellipse at center, black, transparent 80%)", // Desvanecer en los bordes
    },
  },
  "@keyframes float": {
    "0%": { transform: "translate(0, 0) scale(1)" },
    "33%": { transform: "translate(50px, -70px) scale(1.2)" },
    "66%": { transform: "translate(-40px, 40px) scale(0.8)" },
    "100%": { transform: "translate(0, 0) scale(1)" },
  },
  blob: {
    position: "absolute",
    width: "600px",
    height: "600px",
    filter: "blur(120px)",
    borderRadius: "50%",
    opacity: 0.35, // Opacidad aumentada
    zIndex: 0,
    pointerEvents: "none",
    animationName: "float",
    animationDuration: "20s",
    animationIterationCount: "infinite",
    animationTimingFunction: "ease-in-out",
  },
  blob1: {
    backgroundColor: tokens.colorBrandBackground2,
    top: "-100px",
    right: "-100px",
  },
  blob2: {
    backgroundColor: "#7f13ec",
    bottom: "10%",
    left: "-100px",
    animationDelay: "-5s",
  },
  blob3: {
    backgroundColor: tokens.colorCompoundBrandBackgroundPressed,
    top: "40%",
    right: "15%",
    width: "300px",
    height: "300px",
    animationDelay: "-10s",
  },
  spotlight: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: 1,
    background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(127, 19, 236, 0.42), transparent 40%)`,
  },
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
  },
  hero: {
    height: "90vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    ...shorthands.padding("0", "24px"),
    position: "relative",
    zIndex: 1,
  },
  heroContent: {
    zIndex: 2,
    maxWidth: "1000px",
    animationName: {
      from: { opacity: 0, transform: "translateY(30px)" },
      to: { opacity: 1, transform: "translateY(0)" },
    },
    animationDuration: "1.2s",
    animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    animationFillMode: "forwards",
  },
  title: {
    fontSize: "6rem",
    fontWeight: tokens.fontWeightBlack,
    lineHeight: "1",
    letterSpacing: "-2px",
    marginBottom: "24px",
    background: `linear-gradient(135deg, ${tokens.colorNeutralForeground1} 30%, ${tokens.colorBrandForeground1} 100%)`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    [designTokens.breakpoints.sm]: {
      fontSize: "3.5rem",
    },
  },
  subtitle: {
    marginBottom: "60px",
    opacity: 0.7,
    fontWeight: tokens.fontWeightRegular,
    maxWidth: "700px",
    marginRight: "auto",
    marginLeft: "auto",
    fontSize: "1.4rem",
    lineHeight: "1.6",
    [designTokens.breakpoints.sm]: {
      fontSize: "1.1rem",
    },
  },
  buttonGroup: {
    display: "flex",
    ...shorthands.gap("20px"),
    justifyContent: "center",
    flexWrap: "wrap",
  },
  primaryButton: {
    paddingLeft: "40px",
    paddingRight: "40px",
    height: "60px",
    fontSize: tokens.fontSizeBase500,
    fontWeight: "bold",
    backgroundColor: tokens.colorBrandBackground,
    boxShadow: `0 10px 40px -10px ${tokens.colorBrandBackground2}`,
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    ":hover": {
      transform: "scale(1.05) translateY(-5px)",
      boxShadow: `0 20px 60px -10px ${tokens.colorBrandBackground2}`,
    },
  },
  secondaryButton: {
    paddingLeft: "40px",
    paddingRight: "40px",
    height: "60px",
    fontSize: tokens.fontSizeBase500,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    ...shorthands.border("1px", "solid", "rgba(255, 255, 255, 0.1)"),
    transition: "all 0.3s ease",
    backdropFilter: "blur(10px)",
    ":hover": {
      transform: "translateY(-2px)",
      backgroundColor: "rgba(255, 255, 255, 0.08)",
      ...shorthands.borderColor("rgba(255, 255, 255, 0.3)"),
    },
  },
  section: {
    ...shorthands.padding("120px", "24px"),
    maxWidth: "1300px",
    margin: "0 auto",
    width: "100%",
    boxSizing: "border-box",
    position: "relative",
    zIndex: 2,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
    ...shorthands.gap("40px"),
    marginTop: "64px",
    [designTokens.breakpoints.sm]: {
      gridTemplateColumns: "1fr",
    },
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    backdropFilter: "blur(20px)",
    ...shorthands.padding(0),
    display: "flex",
    flexDirection: "column",
    transition: "all 0.5s cubic-bezier(0.2, 1, 0.3, 1)",
    ...shorthands.border("1px", "solid", "rgba(255, 255, 255, 0.06)"),
    ...shorthands.borderRadius("32px"),
    overflow: "hidden",
    position: "relative",
    ":hover": {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      ...shorthands.border("1px", "solid", "rgba(127, 19, 236, 0.4)"),
      transform: "translateY(-15px) scale(1.02)",
      boxShadow:
        "0 30px 70px -20px rgba(0, 0, 0, 0.9), 0 0 30px -10px rgba(127, 19, 236, 0.3)",
    },
  },
  cardContent: {
    ...shorthands.padding("32px"),
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  cardImage: {
    width: "100%",
    height: "220px",
    objectFit: "cover",
    backgroundColor: tokens.colorNeutralBackground3,
    opacity: 0.8,
    transition: "transform 0.8s ease",
    ".card:hover &": {
      transform: "scale(1.1)",
      opacity: 1,
    },
  },
  dateBadge: {
    backgroundColor: "rgba(127, 19, 236, 0.2)",
    ...shorthands.padding("14px"),
    ...shorthands.borderRadius("20px"),
    ...shorthands.border("1px", "solid", "rgba(127, 19, 236, 0.3)"),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "65px",
    color: tokens.colorBrandForeground1,
    fontWeight: "bold",
    boxShadow: "0 8px 20px -5px rgba(0,0,0,0.3)",
  },
});

const Landing = () => {
  const styles = useStyles();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { currentTheme, toggleTheme } = useTheme();

  const [eventos, setEventos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Seguimiento de mouse para el efecto spotlight
  useEffect(() => {
    const handleMouseMove = (e) => {
      const container = document.getElementById("landing-container");
      if (container) {
        container.style.setProperty("--mouse-x", `${e.clientX}px`);
        container.style.setProperty("--mouse-y", `${e.clientY}px`);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const changeLanguage = () => {
    const nextLang = i18n.language === "es" ? "en" : "es";
    i18n.changeLanguage(nextLang);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventosData, cursosData] = await Promise.all([
          eventoService.getEventos(),
          cursoService.getCursos(),
        ]);
        setEventos(
          eventosData.filter((e) => e.estado === "PROGRAMADO").slice(0, 3),
        );
        setCursos(cursosData.filter((c) => c.estado === "ACTIVO").slice(0, 3));
      } catch (err) {
        console.error("Error cargando datos públicos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleVerify = () => {
    if (certCode.trim()) {
      navigate(`/verificar/${certCode.trim()}`);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const months = [
      "ENE",
      "FEB",
      "MAR",
      "ABR",
      "MAY",
      "JUN",
      "JUL",
      "AGO",
      "SEP",
      "OCT",
      "NOV",
      "DIC",
    ];
    return { day: d.getDate(), month: months[d.getMonth()] };
  };

  const DEFAULT_EVENT_IMG =
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop";
  const DEFAULT_COURSE_IMG =
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop";

  return (
    <div className={styles.container} id="landing-container">
      {/* Efecto de luz interactiva que sigue al mouse */}
      <div className={styles.spotlight} />

      {/* Elementos decorativos animados */}
      <div className={`${styles.blob} ${styles.blob1}`} />
      <div className={`${styles.blob} ${styles.blob2}`} />
      <div className={`${styles.blob} ${styles.blob3}`} />

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
            onClick={() => navigate("/validador-publico")}
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
              currentTheme === "light" ? (
                <WeatherMoon24Regular />
              ) : currentTheme === "dark" ? (
                <WeatherSunny24Regular />
              ) : currentTheme === "blue" ? (
                <Globe24Regular />
              ) : currentTheme === "ash" ? (
                <Library24Regular />
              ) : (
                <ShieldCheckmark24Filled />
              )
            }
            onClick={toggleTheme}
            title={
              currentTheme === "dark"
                ? "Cambiar a Modo Claro"
                : currentTheme === "light"
                  ? "Cambiar a Modo Blue"
                  : currentTheme === "blue"
                    ? "Cambiar a Modo Ceniza"
                    : currentTheme === "ash"
                      ? "Cambiar a Modo Alto Contraste"
                      : "Cambiar a Modo Oscuro"
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

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>{t("hero_title")}</h1>
          <MEHTypography variant="h3" className={styles.subtitle}>
            {t("hero_subtitle")}
          </MEHTypography>
          <div className={styles.buttonGroup}>
            <MEHButton
              className={styles.primaryButton}
              onClick={() =>
                document
                  .getElementById("calendario")
                  .scrollIntoView({ behavior: "smooth" })
              }
            >
              {t("explore_events")}
            </MEHButton>
            <MEHButton
              className={styles.secondaryButton}
              appearance="outline"
              onClick={() => navigate("/login")}
            >
              {t("enter_portal")}
            </MEHButton>
          </div>
        </div>
      </section>

      {/* Sección: Calendario de Eventos */}
      <section id="calendario" className={styles.section}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <MEHTypography
            variant="h1"
            style={{ display: "block", marginBottom: "12px", fontSize: "3rem" }}
          >
            {t("next_talleres")}
          </MEHTypography>
          <MEHTypography
            variant="body"
            style={{ opacity: 0.8, fontSize: "1.2rem" }}
          >
            {t("exclusive_events_desc")}
          </MEHTypography>
        </div>

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "40px",
            }}
          >
            <Spinner label="Cargando eventos..." />
          </div>
        ) : (
          <div className={styles.grid}>
            {eventos.map((evento) => {
              const { day, month } = formatDate(evento.fecha_inicio);
              return (
                <MEHCard key={evento.id_evento} className={styles.card}>
                  <img
                    src={evento.imagen_url || DEFAULT_EVENT_IMG}
                    alt="banner"
                    className={styles.cardImage}
                  />
                  <div className={styles.cardContent}>
                    <div
                      style={{
                        display: "flex",
                        gap: "20px",
                        alignItems: "flex-start",
                      }}
                    >
                      <div className={styles.dateBadge}>
                        <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                          {month}
                        </span>
                        <span style={{ fontSize: "1.5rem" }}>{day}</span>
                      </div>
                      <div style={{ flexGrow: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "8px",
                          }}
                        >
                          <Badge appearance="tint" color="brand">
                            {evento.modalidad}
                          </Badge>
                        </div>
                        <MEHTypography
                          variant="h3"
                          style={{ display: "block", marginBottom: "8px" }}
                        >
                          {evento.titulo}
                        </MEHTypography>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            opacity: 0.6,
                            fontSize: "0.9rem",
                          }}
                        >
                          {evento.modalidad === "VIRTUAL" ? (
                            <Video24Regular style={{ fontSize: "16px" }} />
                          ) : (
                            <Location24Regular style={{ fontSize: "16px" }} />
                          )}
                          {evento.ubicacion || "Sesión en línea"}
                        </div>
                      </div>
                    </div>
                    <MEHTypography
                      variant="caption"
                      style={{
                        opacity: 0.8,
                        minHeight: "40px",
                        display: "block",
                        lineHeight: "1.6",
                      }}
                    >
                      {evento.descripcion
                        ? evento.descripcion.substring(0, 100) + "..."
                        : "Aprende las últimas tecnologías de Microsoft con expertos."}
                    </MEHTypography>
                    <MEHButton
                      appearance="primary"
                      icon={<CalendarClock24Regular />}
                      onClick={() => navigate("/login")}
                    >
                      {t("asegurar_lugar")}
                    </MEHButton>
                  </div>
                </MEHCard>
              );
            })}
          </div>
        )}
      </section>

      {/* Nueva Sección: Cursos Disponibles */}
      <section id="cursos" className={styles.section} style={{ paddingTop: 0 }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <MEHTypography
            variant="h1"
            style={{ display: "block", marginBottom: "12px", fontSize: "3rem" }}
          >
            {t("rutas_aprendizaje")}
          </MEHTypography>
          <MEHTypography
            variant="body"
            style={{ opacity: 0.8, fontSize: "1.2rem" }}
          >
            Cursos diseñados para llevar tu carrera al siguiente nivel
            tecnológico.
          </MEHTypography>
        </div>

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "40px",
            }}
          >
            <Spinner label="Cargando rutas..." />
          </div>
        ) : (
          <div className={styles.grid}>
            {cursos.map((curso) => (
              <MEHCard key={curso.id_curso} className={styles.card}>
                <img
                  src={curso.imagen_url || DEFAULT_COURSE_IMG}
                  alt="banner"
                  className={styles.cardImage}
                />
                <div className={styles.cardContent}>
                  <div
                    style={{
                      display: "flex",
                      gap: "20px",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "rgba(127, 50, 204, 0.1)",
                        padding: "10px",
                        borderRadius: "12px",
                      }}
                    >
                      <Library24Regular
                        style={{
                          fontSize: "24px",
                          color: tokens.colorBrandForeground1,
                        }}
                      />
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <MEHTypography variant="h3" style={{ display: "block" }}>
                        {curso.nombre_curso}
                      </MEHTypography>
                      <MEHTypography variant="caption" style={{ opacity: 0.6 }}>
                        {curso.horas_academicas} {t("horas_academicas")}
                      </MEHTypography>
                    </div>
                  </div>
                  <MEHTypography
                    variant="caption"
                    style={{
                      opacity: 0.8,
                      minHeight: "40px",
                      display: "block",
                      lineHeight: "1.6",
                    }}
                  >
                    {curso.descripcion
                      ? curso.descripcion.substring(0, 100) + "..."
                      : "Domina herramientas y conceptos clave para el mercado laboral actual."}
                  </MEHTypography>
                  <LearningPathModal curso={curso} />
                </div>
              </MEHCard>
            ))}
          </div>
        )}
      </section>

      <MEHFooter />
    </div>
  );
};

export default Landing;

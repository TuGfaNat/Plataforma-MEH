import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "welcome": "Welcome back, {{name}}!",
      "dashboard": "Dashboard",
      "finances": "Finances",
      "badges": "Badges",
      "learning_hub": "Learning Hub",
      "community": "Community",
      "settings": "Settings",
      "quick_action": "QUICK ACTION",
      "upload_receipt": "Upload Receipt",
      "hero_title": "Microsoft Education Hub",
      "hero_subtitle": "Empowering the next generation of tech leaders.",
      "explore_events": "Explore Events",
      "learn_more": "Learn More",
      "exclusive_events": "Exclusive Events",
      "exclusive_events_desc": "Access to hands-on workshops on Azure, AI and Development.",
      "official_certs": "Official Certificates",
      "official_certs_desc": "Get recognitions validated by the community and Microsoft.",
      "global_networking": "Global Networking",
      "global_networking_desc": "Connect with ambassadors worldwide and industry experts.",
      "milestone_gold": "Gold Milestone",
      "points_activity": "ACTIVITY POINTS",
      "next_milestone": "NEXT MILESTONE",
      "badge_showcase": "Badge Showcase",
      "locked": "LOCKED",
      "current_progress": "Current Progress",
      "enter_portal": "Enter Portal"
    }
  },
  es: {
    translation: {
      "welcome": "¡Bienvenido de nuevo, {{name}}!",
      "dashboard": "Panel de Control",
      "finances": "Finanzas",
      "badges": "Insignias",
      "learning_hub": "Centro de Aprendizaje",
      "community": "Comunidad",
      "settings": "Configuración",
      "quick_action": "ACCIÓN RÁPIDA",
      "upload_receipt": "Subir Recibo",
      "hero_title": "Microsoft Education Hub",
      "hero_subtitle": "Empoderando a la próxima generación de líderes tecnológicos.",
      "explore_events": "Explorar Eventos",
      "learn_more": "Saber más",
      "exclusive_events": "Eventos Exclusivos",
      "exclusive_events_desc": "Acceso a talleres prácticos y workshops de Azure, IA y Desarrollo.",
      "official_certs": "Certificados Oficiales",
      "official_certs_desc": "Obtén reconocimientos validados por la comunidad y Microsoft.",
      "global_networking": "Networking Global",
      "global_networking_desc": "Conecta con embajadores de todo el mundo y expertos de la industria.",
      "milestone_gold": "Hito de Oro",
      "points_activity": "PUNTOS DE ACTIVIDAD",
      "next_milestone": "PRÓXIMO HITO",
      "badge_showcase": "Galería de Insignias",
      "locked": "BLOQUEADO",
      "current_progress": "Progreso Actual",
      "enter_portal": "Entrar al Portal"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

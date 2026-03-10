import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "welcome": "Welcome back, {{name}}!",
      "dashboard": "Dashboard",
      "finances": "My Payments",
      "badges": "Badges",
      "learning_hub": "Learning Hub",
      "community": "Community",
      "settings": "Settings",
      "menu_personal": "My Space",
      "menu_gestion": "Management",
      "menu_admin": "System",
      "admin_panel": "Master Panel",
      "manage_payments": "Validate Payments",
      "qr_scan": "QR Scanning",
      "role_member": "Member",
      "role_ambassador": "Ambassador",
      "role_organizer": "Organizer",
      "role_admin": "Super Admin",
      "upgrade_msg": "Upgrade to Ambassador to unlock premium courses and official certificates!",
      "quick_action": "QUICK ACTION",
      "upload_receipt": "Upload Receipt",
      "hero_title": "Microsoft Education Hub",
      "hero_subtitle": "Innovating the future, together",
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
      "enter_portal": "Enter Portal",
      "logout": "Logout",
      "audit": "Audit Logs"
    }
  },
  es: {
    translation: {
      "welcome": "¡Bienvenido de nuevo, {{name}}!",
      "dashboard": "Panel de Control",
      "finances": "Mis Pagos",
      "badges": "Insignias",
      "learning_hub": "Centro de Aprendizaje",
      "community": "Comunidad",
      "settings": "Configuración",
      "menu_personal": "Mi Espacio",
      "menu_gestion": "Gestión",
      "menu_admin": "Sistema",
      "admin_panel": "Panel Maestro",
      "manage_payments": "Validar Pagos",
      "qr_scan": "Escaneo QR",
      "menu_liderazgo": "Liderazgo",
      "ambassador_resources": "Recursos VIP",
      "speaker_kit": "Speaker Kit",
      "support_request": "Solicitud de Apoyo",
      "role_member": "Miembro",
      "role_ambassador": "Embajador",
      "role_organizer": "Organizador",
      "role_admin": "Super Admin",
      "upgrade_msg": "¡Sube a Embajador para desbloquear cursos premium y certificados oficiales!",
      "quick_action": "ACCIÓN RÁPIDA",
      "upload_receipt": "Subir Recibo",
      "hero_title": "Microsoft Education Hub",
      "hero_subtitle": "Innovating the future, together",
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
      "enter_portal": "Entrar al Portal",
      "logout": "Cerrar Sesión",
      "audit": "Auditoría de Logs"
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

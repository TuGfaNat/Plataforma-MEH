// @ts-check
import { themes as prismThemes } from "prism-react-renderer";

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Plataforma MEH",
  tagline: "Microsoft Education Hub - Innovating the future, Together",
  favicon: "img/favicon.ico",

  url: "https://TuGfaNat.github.io",
  baseUrl: "/",
  trailingSlash: false,

  organizationName: "TuGfaNat",
  projectName: "Plataforma-MEH",

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "es",
    locales: ["es"],
  },

  markdown: {
    mermaid: true,
  },
  themes: ["@docusaurus/theme-mermaid"],

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: "./sidebars.js",
          routeBasePath: "/", // Esto hace que la doc sea la home
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: "img/docusaurus-social-card.jpg",
      navbar: {
        items: [
          {
            type: "html",
            position: "left",
            value: '<img src="/img/logo.png" alt="MEH Logo" style="height: 32px; vertical-align: middle; margin-right: 8px; cursor: default;" />',
          },
          {
            type: "html",
            position: "left",
            value: '<span style="font-weight: bold; font-size: 1.2rem; margin-right: 10px; cursor: default;">Plataforma MEH</span>',
          },
          {
            type: "docSidebar",
            sidebarId: "tutorialSidebar",
            position: "left",
            label: "Documentación",
          },
        ],
      },
      footer: {
        style: "dark",

        copyright: `Copyright © ${new Date().getFullYear()} Plataforma Microsoft Education Hub. Para el proyecto de grado - Carrera de Informática UMSA.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
      mermaid: {
        theme: { light: "neutral", dark: "forest" },
      },
    }),
};

export default config;

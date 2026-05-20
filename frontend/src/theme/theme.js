import { createDarkTheme, createLightTheme, createHighContrastTheme, tokens } from '@fluentui/react-components';

export const mlsaBrand = { 
  10: "#06020D", 20: "#1A0B2E", 30: "#2D1350", 40: "#3E1B6F", 
  50: "#4F238F", 60: "#602BAE", 70: "#743CC7", 80: "#8B54D3", 
  90: "#A36FDF", 100: "#BB8BEA", 110: "#D2A8F3", 120: "#E8C6FB", 
  130: "#F5DFFF", 140: "#F9EFFF", 150: "#FCF8FF", 160: "#FFFFFF" 
};

// Paleta Microsoft Blue (Official)
export const blueBrand = {
  10: "#030811", 20: "#061724", 30: "#082334", 40: "#0A2E44",
  50: "#0C3B56", 60: "#0E4769", 70: "#10547C", 80: "#126291",
  90: "#1470A7", 100: "#167EBD", 110: "#188DD5", 120: "#1A9CEE",
  130: "#49B0F3", 140: "#79C4F7", 150: "#A9D9FB", 160: "#D9EDFF"
};

// Paleta Ceniza (Grises suaves y elegantes)
export const ashBrand = {
  10: "#0D0D0D", 20: "#1F1F1F", 30: "#303030", 40: "#424242",
  50: "#545454", 60: "#666666", 70: "#7A7A7A", 80: "#8E8E8E",
  90: "#A3A3A3", 100: "#B8B8B8", 110: "#CDCDCD", 120: "#E2E2E2",
  130: "#F0F0F0", 140: "#F7F7F7", 150: "#FAFAFA", 160: "#FFFFFF"
};

export const mlsaDarkTheme = {
  ...createDarkTheme(mlsaBrand),
  colorNeutralBackground1: "#06020D",
  colorNeutralBackground2: "#110820",
  colorNeutralBackground3: "#1A0B2E",
};

export const mlsaLightTheme = {
  ...createLightTheme(mlsaBrand),
  colorNeutralBackground1: "#FFFFFF",
  colorNeutralBackground2: "#F9F9F9",
  colorNeutralBackground3: "#F0F0F0",
};

export const blueTheme = {
  ...createDarkTheme(blueBrand),
  colorNeutralBackground1: "#030811",
  colorNeutralBackground2: "#081726",
  colorNeutralBackground3: "#0F2338",
};

export const ashTheme = {
  ...createDarkTheme(ashBrand),
  colorNeutralBackground1: "#121212",
  colorNeutralBackground2: "#1E1E1E",
  colorNeutralBackground3: "#2D2D2E",
  colorBrandForeground1: "#CDCDCD",
  colorBrandBackground: "#424242",
};

export const highContrastTheme = {
  ...createHighContrastTheme(),
  colorBrandBackground: "#FFFF00", // Amarillo clásico de contraste
  colorBrandForeground1: "#FFFF00",
};

export const themes = {
  dark: mlsaDarkTheme,
  light: mlsaLightTheme,
  blue: blueTheme,
  ash: ashTheme,
  highContrast: highContrastTheme
};

export const designTokens = {
  logo: "/logo full.png",
  breakpoints: {
    xs: '@media (max-width: 480px)',
    sm: '@media (max-width: 768px)',
    md: '@media (max-width: 1024px)',
  },
  glass: {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(10px)',
    border: `1px solid ${mlsaBrand[40]}33`,
  }
};

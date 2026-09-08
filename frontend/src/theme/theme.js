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

// Paleta Ocean (Marina / Deep Ocean / Teal / Cyan)
export const oceanBrand = {
  10: "#010D12", 20: "#021B24", 30: "#042B3A", 40: "#063D52",
  50: "#09516D", 60: "#0D688B", 70: "#1282AC", 80: "#179ECF",
  90: "#2BB5E8", 100: "#4FC4EE", 110: "#76D2F3", 120: "#9FDFFA",
  130: "#C4EDFD", 140: "#DCF5FE", 150: "#EDFAFF", 160: "#FFFFFF"
};

// Paleta CUD Accesible para Daltónicos (Color Universal Design - Okabe & Ito)
export const colorblindBrand = {
  10: "#020B1A", 20: "#051A3B", 30: "#0A2D5E", 40: "#104284",
  50: "#185AA8", 60: "#2274CC", 70: "#368EF0", 80: "#5CA4F5",
  90: "#80BAF8", 100: "#A3D0FB", 110: "#C4E3FD", 120: "#DDF0FE",
  130: "#EDF7FF", 140: "#F5FAFF", 150: "#FAFDFF", 160: "#FFFFFF"
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

export const oceanTheme = {
  ...createDarkTheme(oceanBrand),
  colorNeutralBackground1: "#03131A",
  colorNeutralBackground2: "#07202B",
  colorNeutralBackground3: "#0C2E3D",
  colorNeutralBackground4: "#103C4F",
  colorBrandBackground: "#0D688B",
  colorBrandBackgroundHover: "#1282AC",
  colorBrandForeground1: "#4FC4EE",
  colorBrandForeground2: "#76D2F3",
  colorNeutralForeground1: "#F0F9FC",
  colorNeutralForeground2: "#B0D4E3",
  colorNeutralForeground3: "#7CA7BC",
  colorNeutralStroke1: "#14485F",
  colorNeutralStroke2: "#0E3647",
};

export const colorblindTheme = {
  ...createDarkTheme(colorblindBrand),
  colorNeutralBackground1: "#070B14",
  colorNeutralBackground2: "#0E1626",
  colorNeutralBackground3: "#16233B",
  colorBrandBackground: "#2274CC",
  colorBrandForeground1: "#5CA4F5",
  colorNeutralForeground1: "#FFFFFF",
  colorNeutralForeground2: "#D9E5F5",
  // Paleta CUD sin confusión rojo/verde
  colorPaletteRedForeground1: "#E69F00", // Naranja / Bermellón CUD para errores
  colorPaletteRedBackground1: "#3D2400",
  colorPaletteRedBorder1: "#E69F00",
  colorPaletteGreenForeground1: "#56B4E9", // Azul cielo CUD para éxito
  colorPaletteGreenBackground1: "#042B3A",
  colorPaletteGreenBorder1: "#56B4E9",
  colorPaletteYellowForeground1: "#F0E442", // Amarillo oro CUD para advertencias
  colorPaletteYellowBackground1: "#3B3800",
  colorPaletteYellowBorder1: "#F0E442",
};

export const themes = {
  dark: mlsaDarkTheme,
  light: mlsaLightTheme,
  blue: blueTheme,
  ash: ashTheme,
  highContrast: highContrastTheme,
  ocean: oceanTheme,
  colorblind: colorblindTheme
};

export const themeMetadata = {
  dark: { key: 'dark', label: 'Oscuro', description: 'Por defecto y elegante', mode: 'dark' },
  light: { key: 'light', label: 'Claro', description: 'Máxima claridad diurna', mode: 'light' },
  blue: { key: 'blue', label: 'Blue', description: 'Azul corporativo Microsoft', mode: 'dark' },
  ash: { key: 'ash', label: 'Ceniza', description: 'Grises suaves y neutros', mode: 'dark' },
  highContrast: { key: 'highContrast', label: 'Alto Contraste', description: 'Máxima nitidez y bordes WCAG', mode: 'contrast' },
  ocean: { key: 'ocean', label: 'Ocean', description: 'Paleta marina y tonos aqua', mode: 'dark' },
  colorblind: { key: 'colorblind', label: 'Accesible CUD', description: 'Optimizado para daltónicos sin rojo/verde', mode: 'dark' }
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

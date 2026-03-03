import { createDarkTheme, createLightTheme, tokens } from '@fluentui/react-components';

export const mlsaBrand = { 
  10: "#06020D", 20: "#1A0B2E", 30: "#2D1350", 40: "#3E1B6F", 
  50: "#4F238F", 60: "#602BAE", 70: "#743CC7", 80: "#8B54D3", 
  90: "#A36FDF", 100: "#BB8BEA", 110: "#D2A8F3", 120: "#E8C6FB", 
  130: "#F5DFFF", 140: "#F9EFFF", 150: "#FCF8FF", 160: "#FFFFFF" 
};

export const mlsaDarkTheme = {
  ...createDarkTheme(mlsaBrand),
  colorNeutralBackground1: "#06020D",
  colorNeutralBackground2: "#110820",
  colorNeutralBackground3: "#1A0B2E",
};

export const mlsaLightTheme = {
  ...createLightTheme(mlsaBrand),
  colorNeutralBackground1: "#212529", // Carbono más profundo
  colorNeutralBackground2: "#343A40", // Cards
  colorNeutralBackground3: "#495057", // Dropdowns
  colorNeutralForeground1: "#F8F9FA", // Texto casi blanco para máxima lectura
  colorNeutralForeground2: "#E9ECEF",
  colorNeutralForeground3: "#DEE2E6",
  // Cambiamos el morado a uno mucho más claro (Lila) para que resalte
  colorBrandForeground1: "#D2A8F3",   
  colorBrandBackground: "#743CC7",
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

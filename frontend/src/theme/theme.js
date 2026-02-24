import { createDarkTheme, createLightTheme } from '@fluentui/react-components';

export const mlsaBrand = { 
  10: "#06020D", 20: "#1A0B2E", 30: "#2D1350", 40: "#3E1B6F", 
  50: "#4F238F", 60: "#602BAE", 70: "#743CC7", 80: "#8B54D3", 
  90: "#A36FDF", 100: "#BB8BEA", 110: "#D2A8F3", 120: "#E8C6FB", 
  130: "#F5DFFF", 140: "#F9EFFF", 150: "#FCF8FF", 160: "#FFFFFF" 
};

export const mlsaDarkTheme = createDarkTheme(mlsaBrand);
export const mlsaLightTheme = createLightTheme(mlsaBrand);

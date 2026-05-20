import { tokens } from '@fluentui/react-components';
import { mlsaBrand } from './theme';

export const getGlassEffect = (currentTheme) => {
  switch (currentTheme) {
    case 'blue':
      return {
        background: 'rgba(3, 8, 17, 0.7)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(24, 141, 213, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      };
    case 'ash':
      return {
        background: 'rgba(18, 18, 18, 0.7)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(205, 205, 205, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      };
    case 'light':
      return {
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(15px)',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      };
    case 'highContrast':
      return {
        background: tokens.colorNeutralBackground1,
        border: `2px solid ${tokens.colorBrandBackground}`,
      };
    case 'dark':
    default:
      return {
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${mlsaBrand[40]}33`,
      };
  }
};

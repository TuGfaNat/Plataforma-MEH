import React from 'react';
import { Card as FluentCard, makeStyles, mergeClasses } from '@fluentui/react-components';
import { useTheme } from '../../../App';

const useStyles = makeStyles({
  glassDark: {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  glassLight: {
    // Modo Carbono: Las tarjetas son grises muy oscuros pero con brillo sutil
    background: 'rgba(33, 37, 41, 0.8)', 
    backdropFilter: 'blur(15px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  }
});

export const MEHCard = ({ children, appearance = 'glass', className, ...props }) => {
  const styles = useStyles();
  const { isDarkMode } = useTheme();
  
  const glassStyle = isDarkMode ? styles.glassDark : styles.glassLight;

  const combinedClasses = mergeClasses(
    appearance === 'glass' && glassStyle,
    className
  );

  return (
    <FluentCard className={combinedClasses} {...props}>
      {children}
    </FluentCard>
  );
};

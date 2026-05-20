import React from 'react';
import { Card as FluentCard, mergeClasses } from '@fluentui/react-components';
import { useTheme } from '../../../App';
import { getGlassEffect } from '../../../theme/effects';

/**
 * MEHCard: Contenedor estético con efecto adaptativo al tema actual.
 */
export const MEHCard = ({ children, appearance = 'glass', className, style, ...props }) => {
  const { currentTheme } = useTheme();
  
  const glassStyle = appearance === 'glass' ? getGlassEffect(currentTheme) : {};

  const combinedClasses = mergeClasses(className);

  return (
    <FluentCard className={combinedClasses} style={{ ...glassStyle, ...style }} {...props}>
      {children}
    </FluentCard>
  );
};

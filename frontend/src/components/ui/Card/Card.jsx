import React from 'react';
import { Card as FluentCard, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { effectMixins } from '../../../theme/effects';

const useStyles = makeStyles({
  glass: effectMixins.glass,
  interactive: {
    cursor: 'pointer',
    ':focus-visible': {
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineColor: tokens.colorStrokeFocus2,
      outlineOffset: '2px',
    }
  }
});

/**
 * MEHCard: Contenedor estético con efecto adaptativo y soporte accesible WCAG 2.1 AA.
 */
export const MEHCard = ({ 
  children, 
  appearance = 'glass', 
  className, 
  style, 
  onClick,
  onKeyDown,
  tabIndex,
  role,
  ...props 
}) => {
  const styles = useStyles();
  const isInteractive = !!onClick || tabIndex !== undefined;

  const combinedClasses = mergeClasses(
    appearance === 'glass' && styles.glass,
    isInteractive && styles.interactive,
    className
  );

  const handleKeyDown = (e) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(e);
    }
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  return (
    <FluentCard 
      className={combinedClasses} 
      style={style} 
      onClick={onClick}
      onKeyDown={isInteractive ? handleKeyDown : onKeyDown}
      tabIndex={tabIndex !== undefined ? tabIndex : (onClick ? 0 : undefined)}
      role={role || (onClick ? 'button' : undefined)}
      {...props}
    >
      {children}
    </FluentCard>
  );
};

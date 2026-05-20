import React from 'react';
import { Card as FluentCard, makeStyles, mergeClasses } from '@fluentui/react-components';
import { effectMixins } from '../../../theme/effects';

const useStyles = makeStyles({
  glass: effectMixins.glass
});

/**
 * MEHCard: Contenedor estético con efecto Glassmorphism.
 */
export const MEHCard = ({ children, appearance = 'glass', className, ...props }) => {
  const styles = useStyles();

  const combinedClasses = mergeClasses(
    appearance === 'glass' && styles.glass,
    className
  );

  return (
    <FluentCard className={combinedClasses} {...props}>
      {children}
    </FluentCard>
  );
};

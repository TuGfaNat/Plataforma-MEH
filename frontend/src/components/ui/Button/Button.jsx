import React, { forwardRef } from 'react';
import { Button as FluentButton, mergeClasses, Spinner, makeStyles, tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
  button: {
    ':focus-visible': {
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineColor: tokens.colorStrokeFocus2,
      outlineOffset: '2px',
    },
  },
});

/**
 * MEHButton: Wrapper sobre Fluent UI Button con soporte para forwardRef y accesibilidad WCAG 2.1 AA.
 * Necesario para que componentes como Tooltip puedan posicionarse correctamente.
 */
export const MEHButton = forwardRef(({ 
  children, 
  appearance = 'primary', 
  size = 'medium', 
  disabled = false, 
  loading = false,
  icon,
  onClick,
  type = 'button',
  className,
  'aria-label': ariaLabel,
  ...props 
}, ref) => {
  const styles = useStyles();

  return (
    <FluentButton
      ref={ref}
      appearance={appearance}
      size={size}
      disabled={disabled || loading}
      icon={icon}
      onClick={onClick}
      type={type}
      className={mergeClasses(styles.button, className)}
      aria-busy={loading ? "true" : undefined}
      aria-disabled={disabled || loading ? "true" : undefined}
      aria-label={ariaLabel}
      {...props}
    >
      {loading ? <Spinner size="tiny" label="Cargando..." aria-live="polite" /> : children}
    </FluentButton>
  );
});

MEHButton.displayName = 'MEHButton';

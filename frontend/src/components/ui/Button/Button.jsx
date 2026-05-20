import React, { forwardRef } from 'react';
import { Button as FluentButton, Spinner, mergeClasses } from '@fluentui/react-components';

/**
 * MEHButton: Wrapper sobre Fluent UI Button con soporte para forwardRef.
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
  ...props 
}, ref) => {
  return (
    <FluentButton
      ref={ref}
      appearance={appearance}
      size={size}
      disabled={disabled || loading}
      icon={icon}
      onClick={onClick}
      type={type}
      className={mergeClasses(className)}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </FluentButton>
  );
});

MEHButton.displayName = 'MEHButton';

import React from 'react';
import { Button as FluentButton, mergeClasses } from '@fluentui/react-components';

/**
 * MEHButton: Wrapper sobre Fluent UI Button.
 */
export const MEHButton = ({ 
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
}) => {
  return (
    <FluentButton
      appearance={appearance}
      size={size}
      disabled={disabled || loading}
      icon={icon}
      onClick={onClick}
      type={type}
      className={mergeClasses(className)}
      {...props}
    >
      {loading ? '...' : children}
    </FluentButton>
  );
};

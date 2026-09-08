import React, { useId } from 'react';
import { 
  Input as FluentInput, 
  Label, 
  makeStyles, 
  tokens,
  mergeClasses
} from '@fluentui/react-components';
import { DismissCircle16Filled } from '@fluentui/react-icons';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    width: '100%',
  },
  input: {
    ':focus-visible': {
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineColor: tokens.colorStrokeFocus2,
      outlineOffset: '2px',
    }
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '2px',
  },
  errorIcon: {
    color: tokens.colorPaletteRedForeground1,
    flexShrink: 0,
  },
  errorText: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightMedium,
  }
});

/**
 * MEHInput: Agrupa Label, Input y lógicas de error accesibles bajo WCAG 2.1 AA.
 * Incluye asociación semántica htmlFor/id, aria-invalid, aria-describedby
 * e indicación multi-canal de error (color + icono + texto).
 */
export const MEHInput = ({ 
  label, 
  error, 
  id, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  required = false,
  className,
  ...props 
}) => {
  const styles = useStyles();
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  
  return (
    <div className={styles.container}>
      {label && (
        <Label htmlFor={inputId} required={required}>
          {label}
        </Label>
      )}
      <FluentInput
        id={inputId}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={mergeClasses(styles.input, error ? 'error' : '', className)}
        style={error ? { borderColor: tokens.colorPaletteRedBorder1 } : {}}
        {...props}
      />
      {error && (
        <div id={errorId} role="alert" aria-live="polite" className={styles.errorContainer}>
          <DismissCircle16Filled aria-hidden="true" className={styles.errorIcon} />
          <span className={styles.errorText}>{error}</span>
        </div>
      )}
    </div>
  );
};

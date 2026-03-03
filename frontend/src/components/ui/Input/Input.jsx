import React from 'react';
import { 
  Input as FluentInput, 
  Label, 
  makeStyles, 
  tokens 
} from '@fluentui/react-components';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    width: '100%',
  },
  errorText: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: tokens.fontSizeBase200,
  }
});

/**
 * MEHInput: Agrupa Label, Input y lógicas de error.
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
  ...props 
}) => {
  const styles = useStyles();
  
  return (
    <div className={styles.container}>
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}
      <FluentInput
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        {...props}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};

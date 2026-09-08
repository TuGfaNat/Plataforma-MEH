import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { 
  themes, 
  themeMetadata, 
  oceanTheme, 
  colorblindTheme,
  mlsaDarkTheme,
  mlsaLightTheme,
  blueTheme,
  ashTheme,
  highContrastTheme
} from './theme';
import { MEHButton } from '../components/ui/Button/Button';
import { MEHInput } from '../components/ui/Input/Input';
import { MEHCard } from '../components/ui/Card/Card';

// Algoritmo matemático oficial de contraste W3C WCAG 2.1
function getLuminance(hex) {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const toLinear = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function getContrastRatio(hex1, hex2) {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('🎨 Sistema de Temas y Claves de Configuración', () => {
  const requiredKeys = ['dark', 'light', 'blue', 'ash', 'highContrast', 'ocean', 'colorblind'];

  it('debe exponer todas las 7 claves de temas requeridas en el objeto themes', () => {
    requiredKeys.forEach((key) => {
      expect(themes[key]).toBeDefined();
      expect(typeof themes[key]).toBe('object');
    });
    expect(Object.keys(themes)).toEqual(expect.arrayContaining(requiredKeys));
  });

  it('debe contener metadatos completos para cada tema en themeMetadata', () => {
    requiredKeys.forEach((key) => {
      expect(themeMetadata[key]).toBeDefined();
      expect(themeMetadata[key].label).toBeTruthy();
      expect(themeMetadata[key].description).toBeTruthy();
    });
  });

  it('el tema ocean debe estar completamente definido y no caer a dark', () => {
    expect(themes.ocean).toBeDefined();
    expect(themes.ocean).toBe(oceanTheme);
    expect(themes.ocean.colorNeutralBackground1).toBe('#03131A');
    expect(themes.ocean.colorBrandForeground1).toBe('#4FC4EE');
    expect(themes.ocean).not.toEqual(themes.dark);
  });

  it('el tema colorblind debe implementar la paleta CUD sin ambigüedad rojo/verde', () => {
    expect(themes.colorblind).toBeDefined();
    expect(themes.colorblind).toBe(colorblindTheme);
    // Error en naranja/bermellón CUD (#E69F00) y éxito en azul cielo CUD (#56B4E9)
    expect(themes.colorblind.colorPaletteRedForeground1).toBe('#E69F00');
    expect(themes.colorblind.colorPaletteGreenForeground1).toBe('#56B4E9');
    expect(themes.colorblind.colorPaletteYellowForeground1).toBe('#F0E442');
  });

  it('el ciclado secuencial de temas debe rotar a través de los 7 temas sin undefined', () => {
    const themeKeys = Object.keys(themes);
    expect(themeKeys.length).toBe(7);

    let current = 'ocean';
    const visited = [];

    for (let i = 0; i < themeKeys.length; i++) {
      const idx = themeKeys.indexOf(current);
      const next = themeKeys[(idx + 1) % themeKeys.length];
      expect(themes[next]).toBeDefined();
      visited.push(next);
      current = next;
    }

    expect(visited.length).toBe(7);
    expect(visited).toContain('ocean');
    expect(visited).toContain('colorblind');
  });
});

describe('♿ Verificación de Contraste WCAG 2.1 AA / AAA', () => {
  it('tema ocean: el texto normal supera el ratio WCAG AAA (7:1)', () => {
    const textBgRatio = getContrastRatio(oceanTheme.colorNeutralForeground1, oceanTheme.colorNeutralBackground1);
    expect(textBgRatio).toBeGreaterThanOrEqual(7.0); // Supera ampliamente AAA
  });

  it('tema ocean: el acento de marca supera el ratio WCAG AA (4.5:1)', () => {
    const brandBgRatio = getContrastRatio(oceanTheme.colorBrandForeground1, oceanTheme.colorNeutralBackground1);
    expect(brandBgRatio).toBeGreaterThanOrEqual(4.5);
  });

  it('tema colorblind: el texto normal supera el ratio WCAG AAA (7:1)', () => {
    const textBgRatio = getContrastRatio(colorblindTheme.colorNeutralForeground1, colorblindTheme.colorNeutralBackground1);
    expect(textBgRatio).toBeGreaterThanOrEqual(7.0);
  });

  it('tema colorblind: los estados de error y éxito CUD superan el ratio WCAG AA (4.5:1)', () => {
    const errorRatio = getContrastRatio(colorblindTheme.colorPaletteRedForeground1, colorblindTheme.colorNeutralBackground1);
    const successRatio = getContrastRatio(colorblindTheme.colorPaletteGreenForeground1, colorblindTheme.colorNeutralBackground1);
    const warningRatio = getContrastRatio(colorblindTheme.colorPaletteYellowForeground1, colorblindTheme.colorNeutralBackground1);

    expect(errorRatio).toBeGreaterThanOrEqual(4.5);
    expect(successRatio).toBeGreaterThanOrEqual(4.5);
    expect(warningRatio).toBeGreaterThanOrEqual(4.5);
  });
});

describe('🛡️ Accesibilidad en Kit de Componentes UI (WCAG 2.1 AA)', () => {
  it('MEHButton expone aria-busy y estado de carga accesible', () => {
    render(<MEHButton loading>Guardar</MEHButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('MEHInput asocia Label y Input automáticamente mediante id semántico', () => {
    render(<MEHInput label="Correo Electrónico" placeholder="usuario@test.com" />);
    const input = screen.getByLabelText('Correo Electrónico');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('id');
  });

  it('MEHInput expone indicación de error multi-canal con icono y aria-describedby', () => {
    render(<MEHInput label="Contraseña" error="La contraseña es requerida" />);
    const input = screen.getByLabelText('Contraseña');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('id', describedBy);
    expect(alert).toHaveTextContent('La contraseña es requerida');
  });

  it('MEHCard maneja activación por teclado con Enter y Space cuando tiene onClick', () => {
    const handleClick = vi.fn();
    render(
      <MEHCard onClick={handleClick}>
        <span>Contenido Interactivo</span>
      </MEHCard>
    );

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('tabIndex', '0');

    // Pulsar Enter
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Pulsar Espacio
    fireEvent.keyDown(card, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });
});

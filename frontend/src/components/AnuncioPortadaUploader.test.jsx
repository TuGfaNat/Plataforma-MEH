/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AnuncioPortadaUploader, {
  resolveAnuncioImageVariants,
} from './AnuncioPortadaUploader';
import eventoService from '../services/eventoService';

vi.mock('../services/eventoService', () => ({
  default: {
    uploadImagenBorrador: vi.fn(),
  },
}));

vi.mock('../utils/eventoImagen', () => ({
  optimizeImageForUpload: vi.fn((file) => Promise.resolve(file)),
}));

describe('resolveAnuncioImageVariants helper', () => {
  it('returns empty fallback structure for empty or falsy URL', () => {
    const res = resolveAnuncioImageVariants('');
    expect(res.hasImage).toBe(false);
    expect(res.original).toBeNull();
    expect(res.widescreen16x9).toBeNull();
    expect(res.square1x1).toBeNull();
  });

  it('correctly resolves 16:9, 1:1, and original from a 16x9 URL', () => {
    const res = resolveAnuncioImageVariants('/static/eventos/portada_abc_16x9.jpg');
    expect(res.hasImage).toBe(true);
    expect(res.activeVariant).toBe('16:9');
    expect(res.original).toBe('/static/eventos/portada_abc_orig.jpg');
    expect(res.widescreen16x9).toBe('/static/eventos/portada_abc_16x9.jpg');
    expect(res.square1x1).toBe('/static/eventos/portada_abc_1x1.jpg');
  });

  it('correctly resolves variants from a 1x1 URL', () => {
    const res = resolveAnuncioImageVariants('/static/eventos/portada_xyz_1x1.png');
    expect(res.hasImage).toBe(true);
    expect(res.activeVariant).toBe('1:1');
    expect(res.original).toBe('/static/eventos/portada_xyz_orig.png');
    expect(res.widescreen16x9).toBe('/static/eventos/portada_xyz_16x9.png');
    expect(res.square1x1).toBe('/static/eventos/portada_xyz_1x1.png');
  });

  it('correctly resolves variants from an orig URL', () => {
    const res = resolveAnuncioImageVariants('/static/eventos/portada_xyz_orig.webp');
    expect(res.hasImage).toBe(true);
    expect(res.activeVariant).toBe('original');
    expect(res.original).toBe('/static/eventos/portada_xyz_orig.webp');
    expect(res.widescreen16x9).toBe('/static/eventos/portada_xyz_16x9.webp');
    expect(res.square1x1).toBe('/static/eventos/portada_xyz_1x1.webp');
  });
});

describe('AnuncioPortadaUploader component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without an image and shows placeholder and status badge', () => {
    render(<AnuncioPortadaUploader value="" onChange={vi.fn()} />);
    expect(screen.getByTestId('anuncio-portada-status-badge')).toHaveTextContent(
      'Sin imagen adjunta'
    );
    expect(
      screen.getByText(/Sin imagen. Sube una foto o afiche para previsualizar./i)
    ).toBeInTheDocument();
  });

  it('displays image and active variant badge when an existing image URL is given', () => {
    render(
      <AnuncioPortadaUploader
        value="/static/eventos/portada_123_16x9.jpg"
        onChange={vi.fn()}
      />
    );
    expect(screen.getByTestId('anuncio-portada-status-badge')).toHaveTextContent(
      'Modo 16:9 Panorámico activo'
    );
    const img = screen.getByTestId('anuncio-portada-preview-img');
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('src')).toContain('portada_123_16x9.jpg');
  });

  it('switches variant to 1:1 and calls onChange with square variant URL', () => {
    const handleChange = vi.fn();
    render(
      <AnuncioPortadaUploader
        value="/static/eventos/portada_123_16x9.jpg"
        onChange={handleChange}
      />
    );

    const btn1x1 = screen.getByTestId('anuncio-variant-1x1');
    fireEvent.click(btn1x1);

    expect(handleChange).toHaveBeenCalledWith(
      '/static/eventos/portada_123_1x1.jpg'
    );
    expect(screen.getByTestId('anuncio-portada-status-badge')).toHaveTextContent(
      'Modo 1:1 Cuadrado activo'
    );
  });

  it('switches variant to original and calls onChange with original variant URL', () => {
    const handleChange = vi.fn();
    render(
      <AnuncioPortadaUploader
        value="/static/eventos/portada_123_16x9.jpg"
        onChange={handleChange}
      />
    );

    const btnOrig = screen.getByTestId('anuncio-variant-original');
    fireEvent.click(btnOrig);

    expect(handleChange).toHaveBeenCalledWith(
      '/static/eventos/portada_123_orig.jpg'
    );
    expect(screen.getByTestId('anuncio-portada-status-badge')).toHaveTextContent(
      'Modo Original Completo activo'
    );
  });

  it('clears image when clicking Quitar Imagen', () => {
    const handleChange = vi.fn();
    const notify = vi.fn();
    render(
      <AnuncioPortadaUploader
        value="/static/eventos/portada_123_16x9.jpg"
        onChange={handleChange}
        notify={notify}
      />
    );

    const removeBtn = screen.getByTestId('anuncio-portada-remove-btn');
    fireEvent.click(removeBtn);

    expect(handleChange).toHaveBeenCalledWith('');
    expect(screen.getByTestId('anuncio-portada-status-badge')).toHaveTextContent(
      'Sin imagen adjunta'
    );
    expect(notify).toHaveBeenCalledWith(
      'Imagen quitada',
      expect.any(String),
      'info'
    );
  });

  it('uploads a new image and generates 16:9, 1:1, and original variants', async () => {
    eventoService.uploadImagenBorrador.mockResolvedValueOnce({
      imagen_url: '/static/eventos/portada_nuevo_orig.jpg',
      imagen_url_original: '/static/eventos/portada_nuevo_orig.jpg',
      imagen_url_16x9: '/static/eventos/portada_nuevo_16x9.jpg',
      imagen_url_1x1: '/static/eventos/portada_nuevo_1x1.jpg',
      imagen_variantes: { tiene_imagen: true },
    });

    const handleChange = vi.fn();
    const notify = vi.fn();

    render(
      <AnuncioPortadaUploader
        value=""
        onChange={handleChange}
        notify={notify}
      />
    );

    const file = new File(['fake image content'], 'banner.png', {
      type: 'image/png',
    });

    const fileInput = screen.getByTestId('anuncio-portada-file-input');
    fireEvent.change(fileInput, { target: { files: [file] } });

    const uploadBtn = screen.getByTestId('anuncio-portada-upload-btn');
    expect(uploadBtn).not.toBeDisabled();

    fireEvent.click(uploadBtn);

    await waitFor(() => {
      expect(eventoService.uploadImagenBorrador).toHaveBeenCalled();
      expect(handleChange).toHaveBeenCalledWith(
        '/static/eventos/portada_nuevo_16x9.jpg'
      );
    });

    expect(notify).toHaveBeenCalledWith(
      'Imagen procesada',
      expect.any(String),
      'success'
    );
  });
});

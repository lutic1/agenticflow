import { render, screen, waitFor } from '@/__tests__/utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { ColorPaletteEditor } from '@/components/features/p0/ColorPaletteEditor';

describe('ColorPaletteEditor', () => {
  it('renders color palette options', () => {
    render(<ColorPaletteEditor slideId="slide-1" />);

    expect(screen.getByText(/Color Palette/i)).toBeInTheDocument();
  });

  it('loads current color palette', async () => {
    render(<ColorPaletteEditor slideId="slide-1" />);

    await waitFor(() => {
      expect(screen.getByTestId('palette-corporate')).toHaveAttribute(
        'data-active',
        'true'
      );
    });
  });

  it('displays available palettes', async () => {
    render(<ColorPaletteEditor slideId="slide-1" />);

    await waitFor(() => {
      expect(screen.getByTestId('palette-corporate')).toBeInTheDocument();
      expect(screen.getByTestId('palette-vibrant')).toBeInTheDocument();
      expect(screen.getByTestId('palette-minimal')).toBeInTheDocument();
      expect(screen.getByTestId('palette-dark')).toBeInTheDocument();
    });
  });

  it('changes color palette', async () => {
    const user = userEvent.setup();
    render(<ColorPaletteEditor slideId="slide-1" />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    const vibrantPalette = screen.getByTestId('palette-vibrant');
    await user.click(vibrantPalette);

    await waitFor(() => {
      expect(screen.getByText(/Palette updated/i)).toBeInTheDocument();
    });
  });

  it('shows color swatches for each palette', async () => {
    render(<ColorPaletteEditor slideId="slide-1" />);

    await waitFor(() => {
      const corporatePalette = screen.getByTestId('palette-corporate');
      const swatches = corporatePalette.querySelectorAll('[data-color-swatch]');
      expect(swatches.length).toBeGreaterThan(0);
    });
  });

  it('allows custom color selection', async () => {
    const user = userEvent.setup();
    render(<ColorPaletteEditor slideId="slide-1" />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    const customButton = screen.getByRole('button', { name: /Custom/i });
    await user.click(customButton);

    expect(screen.getByLabelText(/Primary Color/i)).toBeInTheDocument();
  });

  it('validates hex color input', async () => {
    const user = userEvent.setup();
    render(<ColorPaletteEditor slideId="slide-1" />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    const customButton = screen.getByRole('button', { name: /Custom/i });
    await user.click(customButton);

    const colorInput = screen.getByLabelText(/Primary Color/i);
    await user.clear(colorInput);
    await user.type(colorInput, 'invalid');

    await waitFor(() => {
      expect(screen.getByText(/Invalid color format/i)).toBeInTheDocument();
    });
  });

  it('previews palette in real-time', async () => {
    const user = userEvent.setup();
    render(<ColorPaletteEditor slideId="slide-1" />);

    await waitFor(() => {
      expect(screen.getByTestId('palette-preview')).toBeInTheDocument();
    });

    const vibrantPalette = screen.getByTestId('palette-vibrant');
    await user.click(vibrantPalette);

    const preview = screen.getByTestId('palette-preview');
    expect(preview).toHaveStyle({ backgroundColor: expect.any(String) });
  });

  it('shows accessibility contrast warnings', async () => {
    const user = userEvent.setup();
    render(<ColorPaletteEditor slideId="slide-1" />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    const customButton = screen.getByRole('button', { name: /Custom/i });
    await user.click(customButton);

    const bgInput = screen.getByLabelText(/Background Color/i);
    const textInput = screen.getByLabelText(/Text Color/i);

    await user.clear(bgInput);
    await user.type(bgInput, '#ffffff');
    await user.clear(textInput);
    await user.type(textInput, '#eeeeee');

    await waitFor(() => {
      expect(screen.getByText(/Low contrast/i)).toBeInTheDocument();
    });
  });
});

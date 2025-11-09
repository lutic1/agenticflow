import { render, screen, waitFor } from '@/__tests__/utils/test-helpers';
import userEvent from '@testing-library/user-event';
import SlideEditor from '@/app/presentations/[id]/edit/page';

describe('P0 Features Integration', () => {
  it('applies grid layout, typography, and colors together', async () => {
    const user = userEvent.setup();
    render(<SlideEditor params={{ id: 'pres-123' }} />);

    await waitFor(() => {
      expect(screen.getByTestId('slide-editor')).toBeInTheDocument();
    });

    // 1. Change grid layout
    const layoutButton = screen.getByLabelText(/Grid Layout/i);
    await user.click(layoutButton);

    const twoColLayout = screen.getByText('2 Columns');
    await user.click(twoColLayout);

    await waitFor(() => {
      expect(screen.getByTestId('slide-preview')).toHaveClass('grid-cols-2');
    });

    // 2. Change typography
    const typographyButton = screen.getByLabelText(/Typography/i);
    await user.click(typographyButton);

    const fontSelect = screen.getByLabelText(/Font Family/i);
    await user.selectOptions(fontSelect, 'Roboto, sans-serif');

    await waitFor(() => {
      const preview = screen.getByTestId('slide-preview');
      expect(preview).toHaveStyle({ fontFamily: expect.stringContaining('Roboto') });
    });

    // 3. Change color palette
    const colorsButton = screen.getByLabelText(/Colors/i);
    await user.click(colorsButton);

    const vibrantPalette = screen.getByTestId('palette-vibrant');
    await user.click(vibrantPalette);

    await waitFor(() => {
      const preview = screen.getByTestId('slide-preview');
      expect(preview).toHaveAttribute('data-theme', 'vibrant');
    });

    // 4. Verify all changes are applied
    const preview = screen.getByTestId('slide-preview');
    expect(preview).toHaveClass('grid-cols-2');
    expect(preview).toHaveStyle({ fontFamily: expect.stringContaining('Roboto') });
    expect(preview).toHaveAttribute('data-theme', 'vibrant');
  });

  it('exports presentation with applied P0 features', async () => {
    const user = userEvent.setup();
    render(<SlideEditor params={{ id: 'pres-123' }} />);

    await waitFor(() => {
      expect(screen.getByTestId('slide-editor')).toBeInTheDocument();
    });

    // Apply some P0 features
    const layoutButton = screen.getByLabelText(/Grid Layout/i);
    await user.click(layoutButton);
    await user.click(screen.getByText('3 Columns'));

    await waitFor(() => {
      expect(screen.getByText('Layout applied')).toBeInTheDocument();
    });

    // Open export dialog
    const moreButton = screen.getByLabelText(/More options/i);
    await user.click(moreButton);

    const exportOption = screen.getByText('Export to PPTX');
    await user.click(exportOption);

    // Verify export dialog shows
    await waitFor(() => {
      expect(screen.getByText(/Export Presentation/i)).toBeInTheDocument();
    });

    // Export
    const exportButton = screen.getByRole('button', { name: /Export/i });
    await user.click(exportButton);

    await waitFor(
      () => {
        expect(screen.getByRole('link', { name: /Download/i })).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it('persists P0 feature changes across page reload', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<SlideEditor params={{ id: 'pres-123' }} />);

    await waitFor(() => {
      expect(screen.getByTestId('slide-editor')).toBeInTheDocument();
    });

    // Change layout
    const layoutButton = screen.getByLabelText(/Grid Layout/i);
    await user.click(layoutButton);
    await user.click(screen.getByText('2 Columns'));

    await waitFor(() => {
      expect(screen.getByText('Layout applied')).toBeInTheDocument();
    });

    // Unmount and remount (simulate page reload)
    unmount();
    render(<SlideEditor params={{ id: 'pres-123' }} />);

    // Verify layout persisted
    await waitFor(() => {
      const preview = screen.getByTestId('slide-preview');
      expect(preview).toHaveClass('grid-cols-2');
    });
  });

  it('shows live preview when editing with P0 features', async () => {
    const user = userEvent.setup();
    render(<SlideEditor params={{ id: 'pres-123' }} />);

    await waitFor(() => {
      expect(screen.getByTestId('slide-preview')).toBeInTheDocument();
    });

    const preview = screen.getByTestId('slide-preview');

    // Typography change
    const typographyButton = screen.getByLabelText(/Typography/i);
    await user.click(typographyButton);

    const sizeSlider = screen.getByLabelText(/Font Size/i);
    await user.clear(sizeSlider);
    await user.type(sizeSlider, '24');

    // Preview updates immediately
    await waitFor(() => {
      expect(preview).toHaveStyle({ fontSize: '24px' });
    });
  });

  it('handles undo/redo for P0 feature changes', async () => {
    const user = userEvent.setup();
    render(<SlideEditor params={{ id: 'pres-123' }} />);

    await waitFor(() => {
      expect(screen.getByTestId('slide-editor')).toBeInTheDocument();
    });

    const initialLayout = screen.getByTestId('slide-preview').className;

    // Change layout
    const layoutButton = screen.getByLabelText(/Grid Layout/i);
    await user.click(layoutButton);
    await user.click(screen.getByText('3 Columns'));

    await waitFor(() => {
      const preview = screen.getByTestId('slide-preview');
      expect(preview).toHaveClass('grid-cols-3');
    });

    // Undo
    const undoButton = screen.getByLabelText(/Undo/i);
    await user.click(undoButton);

    await waitFor(() => {
      const preview = screen.getByTestId('slide-preview');
      expect(preview.className).toBe(initialLayout);
    });

    // Redo
    const redoButton = screen.getByLabelText(/Redo/i);
    await user.click(redoButton);

    await waitFor(() => {
      const preview = screen.getByTestId('slide-preview');
      expect(preview).toHaveClass('grid-cols-3');
    });
  });

  it('validates accessibility when applying P0 features', async () => {
    const user = userEvent.setup();
    const { container } = render(<SlideEditor params={{ id: 'pres-123' }} />);

    await waitFor(() => {
      expect(screen.getByTestId('slide-editor')).toBeInTheDocument();
    });

    // Apply color palette with poor contrast
    const colorsButton = screen.getByLabelText(/Colors/i);
    await user.click(colorsButton);

    const customButton = screen.getByRole('button', { name: /Custom/i });
    await user.click(customButton);

    const bgInput = screen.getByLabelText(/Background Color/i);
    const textInput = screen.getByLabelText(/Text Color/i);

    await user.clear(bgInput);
    await user.type(bgInput, '#ffffff');
    await user.clear(textInput);
    await user.type(textInput, '#f0f0f0');

    // Should show accessibility warning
    await waitFor(() => {
      expect(screen.getByText(/Low contrast/i)).toBeInTheDocument();
    });

    // Run automated accessibility check
    const { axe } = await import('jest-axe');
    const results = await axe(container);

    // Should have warnings about contrast
    expect(results.violations.length).toBeGreaterThan(0);
  });
});

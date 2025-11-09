import { render, screen, waitFor } from '@/__tests__/utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { TypographyEditor } from '@/components/features/p0/TypographyEditor';

describe('TypographyEditor', () => {
  it('renders typography controls', () => {
    render(<TypographyEditor slideId="slide-1" />);

    expect(screen.getByLabelText(/Font Family/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Font Size/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Font Weight/i)).toBeInTheDocument();
  });

  it('loads current typography settings', async () => {
    render(<TypographyEditor slideId="slide-1" />);

    await waitFor(() => {
      const fontFamilySelect = screen.getByLabelText(/Font Family/i);
      expect(fontFamilySelect).toHaveValue('Inter, sans-serif');
    });
  });

  it('updates font family', async () => {
    const user = userEvent.setup();
    render(<TypographyEditor slideId="slide-1" />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    const fontFamilySelect = screen.getByLabelText(/Font Family/i);
    await user.selectOptions(fontFamilySelect, 'Roboto, sans-serif');

    await waitFor(() => {
      expect(screen.getByText(/Typography updated/i)).toBeInTheDocument();
    });
  });

  it('updates font size with slider', async () => {
    const user = userEvent.setup();
    render(<TypographyEditor slideId="slide-1" />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    const slider = screen.getByLabelText(/Font Size/i);
    await user.clear(slider);
    await user.type(slider, '24');

    await waitFor(() => {
      expect(screen.getByText(/24px/i)).toBeInTheDocument();
    });
  });

  it('previews typography changes in real-time', async () => {
    const user = userEvent.setup();
    render(<TypographyEditor slideId="slide-1" />);

    await waitFor(() => {
      expect(screen.getByTestId('typography-preview')).toBeInTheDocument();
    });

    const fontFamilySelect = screen.getByLabelText(/Font Family/i);
    await user.selectOptions(fontFamilySelect, 'Georgia, serif');

    const preview = screen.getByTestId('typography-preview');
    expect(preview).toHaveStyle({ fontFamily: 'Georgia, serif' });
  });

  it('shows font preview samples', async () => {
    render(<TypographyEditor slideId="slide-1" />);

    await waitFor(() => {
      expect(screen.getByText(/The quick brown fox/i)).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    const { server } = await import('@/mocks/server');
    const { http, HttpResponse } = await import('msw');

    server.use(
      http.get('/api/p0/typography/:slideId', () => {
        return HttpResponse.json(
          { error: 'Failed to load typography' },
          { status: 500 }
        );
      })
    );

    render(<TypographyEditor slideId="slide-1" />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /Failed to load typography/i
      );
    });
  });

  it('resets to default values', async () => {
    const user = userEvent.setup();
    render(<TypographyEditor slideId="slide-1" />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    const resetButton = screen.getByRole('button', { name: /Reset/i });
    await user.click(resetButton);

    await waitFor(() => {
      const fontFamilySelect = screen.getByLabelText(/Font Family/i);
      expect(fontFamilySelect).toHaveValue('Inter, sans-serif');
    });
  });
});

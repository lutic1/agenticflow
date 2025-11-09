import { render, screen, waitFor } from '@/__tests__/utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { GridLayoutEditor } from '@/components/features/p0/GridLayoutEditor';

describe('GridLayoutEditor', () => {
  it('renders without crashing', () => {
    render(<GridLayoutEditor slideId="slide-1" />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<GridLayoutEditor slideId="slide-1" />);
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('loads and displays current layout', async () => {
    render(<GridLayoutEditor slideId="slide-1" />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/2 Columns/i)).toBeInTheDocument();
  });

  it('handles layout change', async () => {
    const user = userEvent.setup();
    render(<GridLayoutEditor slideId="slide-1" />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    await user.click(select);
    await user.click(screen.getByText('3 Columns'));

    await waitFor(() => {
      expect(screen.getByText('Layout applied successfully')).toBeInTheDocument();
    });
  });

  it('shows error state on API failure', async () => {
    // Mock API error by intercepting the specific endpoint
    const { server } = await import('@/mocks/server');
    const { http, HttpResponse } = await import('msw');

    server.use(
      http.get('/api/p0/grid-layout/:slideId', () => {
        return HttpResponse.json(
          { error: 'Failed to load layout' },
          { status: 500 }
        );
      })
    );

    render(<GridLayoutEditor slideId="slide-1" />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /Failed to load grid layout/i
      );
    });
  });

  it('displays layout preview', async () => {
    render(<GridLayoutEditor slideId="slide-1" />);

    await waitFor(() => {
      expect(screen.getByTestId('layout-preview')).toBeInTheDocument();
    });

    expect(screen.getByTestId('layout-preview')).toHaveClass('grid-cols-2');
  });

  it('shows available layout options', async () => {
    const user = userEvent.setup();
    render(<GridLayoutEditor slideId="slide-1" />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    await user.click(select);

    expect(screen.getByText('1 Column')).toBeInTheDocument();
    expect(screen.getByText('2 Columns')).toBeInTheDocument();
    expect(screen.getByText('3 Columns')).toBeInTheDocument();
    expect(screen.getByText('Full Width')).toBeInTheDocument();
  });

  it('maintains aspect ratio in preview', async () => {
    render(<GridLayoutEditor slideId="slide-1" />);

    await waitFor(() => {
      const preview = screen.getByTestId('layout-preview');
      expect(preview).toHaveStyle({ aspectRatio: '16 / 9' });
    });
  });

  it('is keyboard accessible', async () => {
    const user = userEvent.setup();
    render(<GridLayoutEditor slideId="slide-1" />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
    });

    // Tab to select
    await user.tab();
    expect(screen.getByRole('combobox')).toHaveFocus();

    // Open with Enter
    await user.keyboard('{Enter}');
    expect(screen.getByText('3 Columns')).toBeVisible();

    // Navigate with arrows
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Layout applied successfully')).toBeInTheDocument();
    });
  });
});

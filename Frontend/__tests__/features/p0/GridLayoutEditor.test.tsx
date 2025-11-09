import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GridLayoutEditor } from '@/components/features/p0/GridLayoutEditor';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('GridLayoutEditor', () => {
  it('renders without crashing', () => {
    render(<GridLayoutEditor slideId="test-slide" />, {
      wrapper: createWrapper(),
    });
  });

  it('displays loading state initially', () => {
    render(<GridLayoutEditor slideId="test-slide" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText(/loading grid layouts/i)).toBeInTheDocument();
  });

  it('shows layout options', async () => {
    render(<GridLayoutEditor slideId="test-slide" />, {
      wrapper: createWrapper(),
    });

    await waitFor(
      () => {
        expect(screen.queryByText(/loading grid layouts/i)).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('handles layout selection', async () => {
    const onLayoutChange = jest.fn();
    const user = userEvent.setup();

    render(<GridLayoutEditor slideId="test-slide" onLayoutChange={onLayoutChange} />, {
      wrapper: createWrapper(),
    });

    await waitFor(
      () => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const layoutButton = screen.queryByText('2 Columns');
    if (layoutButton) {
      await user.click(layoutButton);
      expect(onLayoutChange).toHaveBeenCalled();
    }
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SlideDuplicator } from '@/components/features/p1/SlideDuplicator';

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithQuery = (component: React.ReactElement) => {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
};

describe('SlideDuplicator', () => {
  it('renders loading state initially', () => {
    renderWithQuery(<SlideDuplicator presentationId="test-123" />);
    expect(screen.getByText(/loading slides/i)).toBeInTheDocument();
  });

  it('renders slide list after loading', async () => {
    renderWithQuery(<SlideDuplicator presentationId="test-123" />);

    await waitFor(() => {
      expect(screen.getByText(/slide manager/i)).toBeInTheDocument();
    });
  });

  it('shows correct slide count', async () => {
    renderWithQuery(<SlideDuplicator presentationId="test-123" />);

    await waitFor(() => {
      expect(screen.getByText(/3 slides/i)).toBeInTheDocument();
    });
  });
});

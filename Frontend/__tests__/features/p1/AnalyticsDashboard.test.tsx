import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnalyticsDashboard } from '@/components/features/p1/AnalyticsDashboard';

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

describe('AnalyticsDashboard', () => {
  it('renders loading state initially', () => {
    renderWithQuery(<AnalyticsDashboard presentationId="test-123" />);
    expect(screen.getByText(/loading analytics/i)).toBeInTheDocument();
  });

  it('renders analytics dashboard after loading', async () => {
    renderWithQuery(<AnalyticsDashboard presentationId="test-123" />);

    await waitFor(() => {
      expect(screen.getByText(/presentation analytics/i)).toBeInTheDocument();
    });
  });

  it('displays key metrics', async () => {
    renderWithQuery(<AnalyticsDashboard presentationId="test-123" />);

    await waitFor(() => {
      expect(screen.getByText(/total views/i)).toBeInTheDocument();
      expect(screen.getByText(/avg time per slide/i)).toBeInTheDocument();
      expect(screen.getByText(/completion rate/i)).toBeInTheDocument();
    });
  });

  it('displays charts', async () => {
    renderWithQuery(<AnalyticsDashboard presentationId="test-123" />);

    await waitFor(() => {
      expect(screen.getByText(/geographic distribution/i)).toBeInTheDocument();
      expect(screen.getByText(/device breakdown/i)).toBeInTheDocument();
    });
  });
});

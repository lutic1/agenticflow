import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LivePresentationMode } from '@/components/features/p1/LivePresentationMode';

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

describe('LivePresentationMode', () => {
  const mockOnExit = jest.fn();

  beforeEach(() => {
    mockOnExit.mockClear();
  });

  it('renders loading state initially', () => {
    renderWithQuery(
      <LivePresentationMode presentationId="test-123" onExit={mockOnExit} />
    );
    expect(screen.getByText(/loading presentation/i)).toBeInTheDocument();
  });

  it('renders presentation after loading', async () => {
    renderWithQuery(
      <LivePresentationMode presentationId="test-123" onExit={mockOnExit} />
    );

    await waitFor(() => {
      expect(screen.getByText(/slide 1/i)).toBeInTheDocument();
    });
  });

  it('shows slide progress indicator', async () => {
    renderWithQuery(
      <LivePresentationMode presentationId="test-123" onExit={mockOnExit} />
    );

    await waitFor(() => {
      expect(screen.getByText(/slide 1 of 3/i)).toBeInTheDocument();
    });
  });

  it('calls onExit when exit button is clicked', async () => {
    renderWithQuery(
      <LivePresentationMode presentationId="test-123" onExit={mockOnExit} />
    );

    await waitFor(() => {
      const exitButton = screen.getAllByRole('button')[0];
      fireEvent.click(exitButton);
      expect(mockOnExit).toHaveBeenCalled();
    });
  });
});

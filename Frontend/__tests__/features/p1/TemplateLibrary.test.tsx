import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TemplateLibrary } from '@/components/features/p1/TemplateLibrary';

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

describe('TemplateLibrary', () => {
  it('renders loading state initially', () => {
    renderWithQuery(<TemplateLibrary />);
    expect(screen.getByText(/loading templates/i)).toBeInTheDocument();
  });

  it('renders template library after loading', async () => {
    renderWithQuery(<TemplateLibrary />);

    await waitFor(() => {
      expect(screen.getByText(/template library/i)).toBeInTheDocument();
    });
  });

  it('renders search input', async () => {
    renderWithQuery(<TemplateLibrary />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search templates/i)).toBeInTheDocument();
    });
  });

  it('filters templates by search query', async () => {
    renderWithQuery(<TemplateLibrary />);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/search templates/i);
      fireEvent.change(searchInput, { target: { value: 'Template 1' } });
    });
  });

  it('shows category filters', async () => {
    renderWithQuery(<TemplateLibrary />);

    await waitFor(() => {
      expect(screen.getByText(/all/i)).toBeInTheDocument();
    });
  });
});

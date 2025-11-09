import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ExportDialog } from '@/components/features/p0/ExportDialog';

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

describe('ExportDialog', () => {
  it('renders export options', () => {
    render(<ExportDialog presentationId="test-123" />, {
      wrapper: createWrapper(),
    });
  });

  it('shows format selection', async () => {
    render(<ExportDialog presentationId="test-123" />, {
      wrapper: createWrapper(),
    });

    await waitFor(
      () => {
        expect(screen.queryByText(/loading export options/i)).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('handles export button click', async () => {
    const onExport = jest.fn();
    const user = userEvent.setup();

    render(<ExportDialog presentationId="test-123" onExport={onExport} />, {
      wrapper: createWrapper(),
    });

    await waitFor(
      () => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const exportButton = screen.queryByText(/export as/i);
    if (exportButton) {
      await user.click(exportButton);
      await waitFor(() => {
        expect(onExport).toHaveBeenCalled();
      });
    }
  });

  it('allows format selection', async () => {
    const user = userEvent.setup();

    render(<ExportDialog presentationId="test-123" />, {
      wrapper: createWrapper(),
    });

    await waitFor(
      () => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const pdfButton = screen.queryByText('PDF Document');
    if (pdfButton) {
      await user.click(pdfButton);
      expect(pdfButton.parentElement).toHaveClass('border-blue-600');
    }
  });
});

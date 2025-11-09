import { render, screen, waitFor } from '@/__tests__/utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { ExportDialog } from '@/components/features/p0/ExportDialog';

describe('ExportDialog', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders export options', () => {
    render(<ExportDialog presentationId="pres-123" open={true} onClose={mockOnClose} />);

    expect(screen.getByText(/Export Presentation/i)).toBeInTheDocument();
  });

  it('shows available export formats', () => {
    render(<ExportDialog presentationId="pres-123" open={true} onClose={mockOnClose} />);

    expect(screen.getByLabelText(/PowerPoint \(PPTX\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/PDF/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/HTML/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Markdown/i)).toBeInTheDocument();
  });

  it('selects default format', () => {
    render(<ExportDialog presentationId="pres-123" open={true} onClose={mockOnClose} />);

    const pptxRadio = screen.getByLabelText(/PowerPoint \(PPTX\)/i);
    expect(pptxRadio).toBeChecked();
  });

  it('changes export format', async () => {
    const user = userEvent.setup();
    render(<ExportDialog presentationId="pres-123" open={true} onClose={mockOnClose} />);

    const pdfRadio = screen.getByLabelText(/PDF/i);
    await user.click(pdfRadio);

    expect(pdfRadio).toBeChecked();
  });

  it('initiates export on button click', async () => {
    const user = userEvent.setup();
    render(<ExportDialog presentationId="pres-123" open={true} onClose={mockOnClose} />);

    const exportButton = screen.getByRole('button', { name: /Export/i });
    await user.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText(/Preparing export.../i)).toBeInTheDocument();
    });
  });

  it('shows progress during export', async () => {
    const user = userEvent.setup();
    render(<ExportDialog presentationId="pres-123" open={true} onClose={mockOnClose} />);

    const exportButton = screen.getByRole('button', { name: /Export/i });
    await user.click(exportButton);

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  it('completes export and provides download link', async () => {
    const user = userEvent.setup();
    render(<ExportDialog presentationId="pres-123" open={true} onClose={mockOnClose} />);

    const exportButton = screen.getByRole('button', { name: /Export/i });
    await user.click(exportButton);

    await waitFor(
      () => {
        expect(screen.getByText(/Download/i)).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    const downloadLink = screen.getByRole('link', { name: /Download/i });
    expect(downloadLink).toHaveAttribute('href', expect.stringContaining('.pptx'));
  });

  it('handles export errors', async () => {
    const { server } = await import('@/mocks/server');
    const { http, HttpResponse } = await import('msw');

    server.use(
      http.post('/api/p0/export/:presentationId', () => {
        return HttpResponse.json(
          { error: 'Export failed' },
          { status: 500 }
        );
      })
    );

    const user = userEvent.setup();
    render(<ExportDialog presentationId="pres-123" open={true} onClose={mockOnClose} />);

    const exportButton = screen.getByRole('button', { name: /Export/i });
    await user.click(exportButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Export failed/i);
    });
  });

  it('closes dialog on cancel', async () => {
    const user = userEvent.setup();
    render(<ExportDialog presentationId="pres-123" open={true} onClose={mockOnClose} />);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('disables export button during processing', async () => {
    const user = userEvent.setup();
    render(<ExportDialog presentationId="pres-123" open={true} onClose={mockOnClose} />);

    const exportButton = screen.getByRole('button', { name: /Export/i });
    await user.click(exportButton);

    expect(exportButton).toBeDisabled();
  });

  it('shows file size estimate', async () => {
    const user = userEvent.setup();
    render(<ExportDialog presentationId="pres-123" open={true} onClose={mockOnClose} />);

    const exportButton = screen.getByRole('button', { name: /Export/i });
    await user.click(exportButton);

    await waitFor(
      () => {
        expect(screen.getByText(/2.3 MB/i)).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });
});

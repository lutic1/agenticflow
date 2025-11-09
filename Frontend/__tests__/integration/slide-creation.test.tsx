import { render, screen, waitFor } from '@/__tests__/utils/test-helpers';
import userEvent from '@testing-library/user-event';
import HomePage from '@/app/page';

describe('Slide Creation Flow', () => {
  it('completes full flow from prompt to preview', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    // 1. Enter topic/prompt
    const promptInput = screen.getByPlaceholderText(/What can I do for you/i);
    expect(promptInput).toBeInTheDocument();
    await user.type(promptInput, 'AI in Healthcare: The Future of Medicine');

    // 2. Select template
    await waitFor(() => {
      expect(screen.getByText('Glamour')).toBeInTheDocument();
    });
    const glamourTemplate = screen.getByText('Glamour');
    await user.click(glamourTemplate);

    // 3. Configure generation options
    const slideCountInput = screen.getByLabelText(/Number of slides/i);
    await user.clear(slideCountInput);
    await user.type(slideCountInput, '10');

    const toneSelect = screen.getByLabelText(/Tone/i);
    await user.selectOptions(toneSelect, 'formal');

    // 4. Generate presentation
    const generateButton = screen.getByRole('button', { name: /Generate/i });
    expect(generateButton).toBeEnabled();
    await user.click(generateButton);

    // 5. Wait for reasoning phase
    await waitFor(
      () => {
        expect(screen.getByText(/Reasoning/i)).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // 6. Wait for slide generation
    await waitFor(
      () => {
        expect(screen.getByText(/AI in Healthcare/i)).toBeInTheDocument();
      },
      { timeout: 15000 }
    );

    // 7. Verify slides are rendered
    expect(screen.getByText(/Slide 1 of/i)).toBeInTheDocument();
    expect(screen.getByTestId('slide-preview')).toBeInTheDocument();

    // 8. Navigate through slides
    const nextButton = screen.getByRole('button', { name: /Next/i });
    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(/Slide 2 of/i)).toBeInTheDocument();
    });

    const prevButton = screen.getByRole('button', { name: /Previous/i });
    await user.click(prevButton);

    await waitFor(() => {
      expect(screen.getByText(/Slide 1 of/i)).toBeInTheDocument();
    });
  });

  it('shows validation errors for empty prompt', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    const generateButton = screen.getByRole('button', { name: /Generate/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/Please enter a topic/i)).toBeInTheDocument();
    });
  });

  it('handles generation errors gracefully', async () => {
    const { server } = await import('@/mocks/server');
    const { http, HttpResponse } = await import('msw');

    server.use(
      http.post('/api/generate-slides', () => {
        return HttpResponse.json(
          { error: 'Generation failed' },
          { status: 500 }
        );
      })
    );

    const user = userEvent.setup();
    render(<HomePage />);

    const promptInput = screen.getByPlaceholderText(/What can I do for you/i);
    await user.type(promptInput, 'Test Topic');

    const generateButton = screen.getByRole('button', { name: /Generate/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Generation failed/i);
    });
  });

  it('allows canceling generation in progress', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    const promptInput = screen.getByPlaceholderText(/What can I do for you/i);
    await user.type(promptInput, 'Test Topic');

    const generateButton = screen.getByRole('button', { name: /Generate/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText(/Generating/i)).not.toBeInTheDocument();
    });
  });

  it('saves presentation after generation', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    const promptInput = screen.getByPlaceholderText(/What can I do for you/i);
    await user.type(promptInput, 'AI in Healthcare');

    const generateButton = screen.getByRole('button', { name: /Generate/i });
    await user.click(generateButton);

    await waitFor(
      () => {
        expect(screen.getByText(/AI in Healthcare/i)).toBeInTheDocument();
      },
      { timeout: 15000 }
    );

    const saveButton = screen.getByRole('button', { name: /Save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Saved successfully/i)).toBeInTheDocument();
    });
  });

  it('supports keyboard navigation during generation', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    // Tab to prompt input
    await user.tab();
    expect(screen.getByPlaceholderText(/What can I do for you/i)).toHaveFocus();

    // Type prompt
    await user.keyboard('AI in Healthcare');

    // Tab to generate button
    await user.tab();
    await user.tab();
    await user.tab();

    const generateButton = screen.getByRole('button', { name: /Generate/i });
    expect(generateButton).toHaveFocus();

    // Press Enter to generate
    await user.keyboard('{Enter}');

    await waitFor(
      () => {
        expect(screen.getByText(/Generating/i)).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });
});

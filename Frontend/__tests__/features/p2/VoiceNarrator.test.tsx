/**
 * Tests for VoiceNarrator Component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VoiceNarrator } from '@/components/features/p2/VoiceNarrator';
import { useVoiceNarration } from '@/hooks/use-p2-features';

// Mock the hooks
jest.mock('@/hooks/use-p2-features');

const mockVoiceFeature = {
  getVoices: jest.fn(() => [
    { id: 'voice-1', name: 'Jane', language: 'en-US', gender: 'female' },
    { id: 'voice-2', name: 'John', language: 'en-US', gender: 'male' },
  ]),
  speak: jest.fn(() => Promise.resolve(new ArrayBuffer(0))),
  exportAudio: jest.fn(() => Promise.resolve(new Blob())),
};

describe('VoiceNarrator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useVoiceNarration as jest.Mock).mockReturnValue({
      data: mockVoiceFeature,
      isLoading: false,
    });
  });

  it('should render voice selector', () => {
    render(<VoiceNarrator slideId="slide-1" content="Test content" />);

    expect(screen.getByText('Voice Narration')).toBeInTheDocument();
    expect(screen.getByLabelText('Select Voice')).toBeInTheDocument();
  });

  it('should list available voices', () => {
    render(<VoiceNarrator slideId="slide-1" content="Test content" />);

    expect(screen.getByText(/Jane \(en-US\) - female/)).toBeInTheDocument();
    expect(screen.getByText(/John \(en-US\) - male/)).toBeInTheDocument();
  });

  it('should generate voice when button clicked', async () => {
    render(<VoiceNarrator slideId="slide-1" content="Test content" />);

    // Select a voice
    const select = screen.getByLabelText('Select Voice');
    fireEvent.change(select, { target: { value: 'voice-1' } });

    // Click generate
    const generateButton = screen.getByText('Generate Voice');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockVoiceFeature.speak).toHaveBeenCalledWith('Test content', {
        voice: 'voice-1',
      });
    });
  });

  it('should show loading state while generating', async () => {
    render(<VoiceNarrator slideId="slide-1" content="Test content" />);

    const select = screen.getByLabelText('Select Voice');
    fireEvent.change(select, { target: { value: 'voice-1' } });

    const generateButton = screen.getByText('Generate Voice');
    fireEvent.click(generateButton);

    expect(screen.getByText('Generating...')).toBeInTheDocument();
  });

  it('should show loading spinner when feature is loading', () => {
    (useVoiceNarration as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(<VoiceNarrator slideId="slide-1" content="Test content" />);

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should render null when feature is not available', () => {
    (useVoiceNarration as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
    });

    const { container } = render(<VoiceNarrator slideId="slide-1" content="Test content" />);

    expect(container.firstChild).toBeNull();
  });
});

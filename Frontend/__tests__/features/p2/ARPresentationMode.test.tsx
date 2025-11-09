/**
 * Tests for ARPresentationMode Component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ARPresentationMode } from '@/components/features/p2/ARPresentationMode';
import { useARPresentation } from '@/hooks/use-p2-features';

// Mock the hooks
jest.mock('@/hooks/use-p2-features');

const mockARFeature = {
  checkSupport: jest.fn(() => true),
  startSession: jest.fn(() => Promise.resolve({ id: 'session-1', active: true, participants: 1 })),
  placeSlide: jest.fn(),
  shareSession: jest.fn(() => Promise.resolve('https://ar.example.com/session-1')),
};

describe('ARPresentationMode', () => {
  const mockSlides = [{ id: 1 }, { id: 2 }, { id: 3 }];

  beforeEach(() => {
    jest.clearAllMocks();
    (useARPresentation as jest.Mock).mockReturnValue({
      data: mockARFeature,
      isLoading: false,
    });
  });

  it('should show AR not supported message when unsupported', () => {
    mockARFeature.checkSupport.mockReturnValue(false);

    render(<ARPresentationMode presentationId="pres-1" slides={mockSlides} />);

    expect(screen.getByText('AR Not Supported')).toBeInTheDocument();
    expect(screen.getByText(/Your device doesn't support WebXR/)).toBeInTheDocument();
  });

  it('should show start AR session button when supported', () => {
    render(<ARPresentationMode presentationId="pres-1" slides={mockSlides} />);

    expect(screen.getByText('Start AR Session')).toBeInTheDocument();
    expect(screen.getByText('AR Presentation Mode')).toBeInTheDocument();
  });

  it('should show requirements list', () => {
    render(<ARPresentationMode presentationId="pres-1" slides={mockSlides} />);

    expect(screen.getByText(/iOS 12\+ or Android 9\+/)).toBeInTheDocument();
    expect(screen.getByText(/ARCore\/ARKit support/)).toBeInTheDocument();
  });

  it('should start AR session when button clicked', async () => {
    render(<ARPresentationMode presentationId="pres-1" slides={mockSlides} />);

    const startButton = screen.getByText('Start AR Session');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockARFeature.startSession).toHaveBeenCalled();
    });
  });

  it('should show active session UI after starting', async () => {
    render(<ARPresentationMode presentationId="pres-1" slides={mockSlides} />);

    const startButton = screen.getByText('Start AR Session');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('AR Session Active')).toBeInTheDocument();
      expect(screen.getByText(/1 participant/)).toBeInTheDocument();
    });
  });

  it('should show AR controls when session is active', async () => {
    render(<ARPresentationMode presentationId="pres-1" slides={mockSlides} />);

    const startButton = screen.getByText('Start AR Session');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('AR Controls')).toBeInTheDocument();
      expect(screen.getByText(/Tap surface to place slide/)).toBeInTheDocument();
    });
  });

  it('should show loading spinner when feature is loading', () => {
    (useARPresentation as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(<ARPresentationMode presentationId="pres-1" slides={mockSlides} />);

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should render null when feature is not available', () => {
    (useARPresentation as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
    });

    const { container } = render(<ARPresentationMode presentationId="pres-1" slides={mockSlides} />);

    expect(container.firstChild).toBeNull();
  });
});

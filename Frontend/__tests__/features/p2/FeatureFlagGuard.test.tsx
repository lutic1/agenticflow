/**
 * Tests for FeatureFlagGuard Component
 */

import { render, screen } from '@testing-library/react';
import { FeatureFlagGuard } from '@/components/FeatureFlagGuard';
import { useP2Feature } from '@backend/frontend-integration/hooks/use-backend';

// Mock the hooks
jest.mock('@backend/frontend-integration/hooks/use-backend');

describe('FeatureFlagGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children when feature is available', () => {
    (useP2Feature as jest.Mock).mockReturnValue({
      data: { enabled: true },
      isLoading: false,
      error: null,
    });

    render(
      <FeatureFlagGuard feature="voice-narration">
        <div>Feature Content</div>
      </FeatureFlagGuard>
    );

    expect(screen.getByText('Feature Content')).toBeInTheDocument();
  });

  it('should show beta badge by default', () => {
    (useP2Feature as jest.Mock).mockReturnValue({
      data: { enabled: true },
      isLoading: false,
      error: null,
    });

    render(
      <FeatureFlagGuard feature="voice-narration">
        <div>Feature Content</div>
      </FeatureFlagGuard>
    );

    expect(screen.getByText('BETA')).toBeInTheDocument();
  });

  it('should hide beta badge when showBetaBadge is false', () => {
    (useP2Feature as jest.Mock).mockReturnValue({
      data: { enabled: true },
      isLoading: false,
      error: null,
    });

    render(
      <FeatureFlagGuard feature="voice-narration" showBetaBadge={false}>
        <div>Feature Content</div>
      </FeatureFlagGuard>
    );

    expect(screen.queryByText('BETA')).not.toBeInTheDocument();
  });

  it('should show loading state when feature is loading', () => {
    (useP2Feature as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(
      <FeatureFlagGuard feature="voice-narration">
        <div>Feature Content</div>
      </FeatureFlagGuard>
    );

    expect(screen.getByText('Loading feature...')).toBeInTheDocument();
    expect(screen.queryByText('Feature Content')).not.toBeInTheDocument();
  });

  it('should render fallback when feature is not available', () => {
    (useP2Feature as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    render(
      <FeatureFlagGuard feature="voice-narration" fallback={<div>Not Available</div>}>
        <div>Feature Content</div>
      </FeatureFlagGuard>
    );

    expect(screen.getByText('Not Available')).toBeInTheDocument();
    expect(screen.queryByText('Feature Content')).not.toBeInTheDocument();
  });

  it('should render fallback when feature has error', () => {
    (useP2Feature as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Feature failed'),
    });

    render(
      <FeatureFlagGuard feature="voice-narration" fallback={<div>Error State</div>}>
        <div>Feature Content</div>
      </FeatureFlagGuard>
    );

    expect(screen.getByText('Error State')).toBeInTheDocument();
    expect(screen.queryByText('Feature Content')).not.toBeInTheDocument();
  });

  it('should render null when no fallback provided and feature unavailable', () => {
    (useP2Feature as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    const { container } = render(
      <FeatureFlagGuard feature="voice-narration">
        <div>Feature Content</div>
      </FeatureFlagGuard>
    );

    expect(container.firstChild).toBeEmptyDOMElement();
  });
});

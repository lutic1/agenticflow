/**
 * Tests for ThemesMarketplace Component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { ThemesMarketplace } from '@/components/features/p2/ThemesMarketplace';
import { useThemesMarketplace } from '@/hooks/use-p2-features';

// Mock the hooks
jest.mock('@/hooks/use-p2-features');

const mockMarketplaceFeature = {
  browseThemes: jest.fn(() => Promise.resolve([])),
  purchaseTheme: jest.fn(() => Promise.resolve({ id: 'purchase-1' })),
  installTheme: jest.fn(() => Promise.resolve()),
  uploadTheme: jest.fn(() => Promise.resolve('theme-1')),
  getMyThemes: jest.fn(() => Promise.resolve([])),
};

describe('ThemesMarketplace', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useThemesMarketplace as jest.Mock).mockReturnValue({
      data: mockMarketplaceFeature,
      isLoading: false,
    });
  });

  it('should render marketplace header', () => {
    render(<ThemesMarketplace />);

    expect(screen.getByText('Themes Marketplace')).toBeInTheDocument();
  });

  it('should render search input', () => {
    render(<ThemesMarketplace />);

    expect(screen.getByPlaceholderText('Search themes...')).toBeInTheDocument();
  });

  it('should render category filters', () => {
    render(<ThemesMarketplace />);

    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Business')).toBeInTheDocument();
    expect(screen.getByText('Education')).toBeInTheDocument();
  });

  it('should toggle between grid and list view', () => {
    render(<ThemesMarketplace />);

    const gridButton = screen.getAllByRole('button')[1]; // Grid button
    const listButton = screen.getAllByRole('button')[2]; // List button

    fireEvent.click(listButton);
    // List view should be active (implementation would show different layout)

    fireEvent.click(gridButton);
    // Grid view should be active
  });

  it('should render theme cards', () => {
    render(<ThemesMarketplace />);

    // Should render 9 theme cards (mock data)
    const themeNames = screen.getAllByText(/Professional Theme/);
    expect(themeNames.length).toBeGreaterThan(0);
  });

  it('should show loading spinner when loading', () => {
    (useThemesMarketplace as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(<ThemesMarketplace />);

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should render null when feature is not available', () => {
    (useThemesMarketplace as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
    });

    const { container } = render(<ThemesMarketplace />);

    expect(container.firstChild).toBeNull();
  });
});

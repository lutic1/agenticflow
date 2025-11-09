/**
 * Tests for NFTMinter Component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NFTMinter } from '@/components/features/p2/NFTMinter';
import { useBlockchainNFT } from '@/hooks/use-p2-features';

// Mock the hooks
jest.mock('@/hooks/use-p2-features');

const mockNFTFeature = {
  connectWallet: jest.fn(() => Promise.resolve({
    address: '0x1234567890123456789012345678901234567890',
    network: 'Ethereum Mainnet',
    balance: 1.5,
  })),
  mintNFT: jest.fn(() => Promise.resolve({
    tokenId: '123',
    transactionHash: '0xabc123',
    ipfsUrl: 'ipfs://QmTest123',
  })),
  estimateGas: jest.fn(() => Promise.resolve(0.002)),
  listNFT: jest.fn(() => Promise.resolve()),
};

describe('NFTMinter', () => {
  const mockProps = {
    presentationId: 'pres-1',
    presentationTitle: 'Test Presentation',
    presentationPreview: 'https://example.com/preview.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useBlockchainNFT as jest.Mock).mockReturnValue({
      data: mockNFTFeature,
      isLoading: false,
    });
  });

  it('should show connect wallet button initially', () => {
    render(<NFTMinter {...mockProps} />);

    expect(screen.getByText('Connect Your Wallet')).toBeInTheDocument();
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });

  it('should connect wallet when button clicked', async () => {
    render(<NFTMinter {...mockProps} />);

    const connectButton = screen.getByText('Connect Wallet');
    fireEvent.click(connectButton);

    await waitFor(() => {
      expect(mockNFTFeature.connectWallet).toHaveBeenCalled();
    });
  });

  it('should show wallet info after connecting', async () => {
    render(<NFTMinter {...mockProps} />);

    const connectButton = screen.getByText('Connect Wallet');
    fireEvent.click(connectButton);

    await waitFor(() => {
      expect(screen.getByText(/0x1234...7890/)).toBeInTheDocument();
      expect(screen.getByText(/1.5000 ETH/)).toBeInTheDocument();
    });
  });

  it('should show metadata form after wallet connected', async () => {
    render(<NFTMinter {...mockProps} />);

    const connectButton = screen.getByText('Connect Wallet');
    fireEvent.click(connectButton);

    await waitFor(() => {
      expect(screen.getByText('NFT Metadata')).toBeInTheDocument();
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });
  });

  it('should mint NFT when form submitted', async () => {
    render(<NFTMinter {...mockProps} />);

    // Connect wallet first
    const connectButton = screen.getByText('Connect Wallet');
    fireEvent.click(connectButton);

    await waitFor(() => {
      expect(screen.getByText('Mint NFT')).toBeInTheDocument();
    });

    // Mint NFT
    const mintButton = screen.getByText('Mint NFT');
    fireEvent.click(mintButton);

    await waitFor(() => {
      expect(mockNFTFeature.mintNFT).toHaveBeenCalled();
    });
  });

  it('should show success message after minting', async () => {
    render(<NFTMinter {...mockProps} />);

    // Connect and mint
    fireEvent.click(screen.getByText('Connect Wallet'));

    await waitFor(() => {
      expect(screen.getByText('Mint NFT')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Mint NFT'));

    await waitFor(() => {
      expect(screen.getByText('NFT Minted Successfully!')).toBeInTheDocument();
      expect(screen.getByText(/NFT #123/)).toBeInTheDocument();
    });
  });

  it('should render null when feature is not available', () => {
    (useBlockchainNFT as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
    });

    const { container } = render(<NFTMinter {...mockProps} />);

    expect(container.firstChild).toBeNull();
  });
});

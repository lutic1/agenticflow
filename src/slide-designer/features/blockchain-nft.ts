/**
 * Blockchain Presentation NFTs (P2.8)
 * Mint presentations as NFTs, verify ownership, manage royalties
 * IPFS storage, smart contracts, NFT marketplace
 */

export interface PresentationNFT {
  id: string;
  tokenId: string;
  presentationId: string;
  title: string;
  description: string;
  creator: NFTCreator;
  owner: NFTOwner;
  blockchain: BlockchainNetwork;
  contractAddress: string;
  metadata: NFTMetadata;
  royalties: RoyaltyConfig;
  pricing: NFTPricing;
  listings: NFTListing[];
  mintedAt: Date;
  lastTransferAt?: Date;
}

export type BlockchainNetwork =
  | 'ethereum'
  | 'polygon'
  | 'binance'
  | 'avalanche'
  | 'optimism'
  | 'arbitrum'
  | 'base';

export interface NFTCreator {
  address: string;
  name?: string;
  avatar?: string;
  verified: boolean;
}

export interface NFTOwner {
  address: string;
  name?: string;
  avatar?: string;
  acquiredAt: Date;
  pricePaid?: number; // ETH/MATIC/etc
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string; // IPFS URL (cover image)
  animationUrl?: string; // IPFS URL (presentation file)
  externalUrl?: string; // Website URL
  attributes: NFTAttribute[];
  properties: NFTProperties;
}

export interface NFTAttribute {
  traitType: string;
  value: string | number;
  displayType?: 'text' | 'number' | 'date' | 'boost_percentage' | 'boost_number';
}

export interface NFTProperties {
  slideCount: number;
  createdDate: string;
  format: 'html' | 'pdf' | 'pptx';
  fileSize: number; // bytes
  category: string;
  tags: string[];
}

export interface RoyaltyConfig {
  enabled: boolean;
  percentage: number; // 0-100
  recipient: string; // Wallet address
  minSalePrice?: number; // Minimum price for royalty
}

export interface NFTPricing {
  type: 'fixed' | 'auction' | 'free';
  currency: 'ETH' | 'MATIC' | 'BNB' | 'AVAX' | 'USD';
  amount?: number;
  auctionConfig?: AuctionConfig;
}

export interface AuctionConfig {
  startPrice: number;
  reservePrice?: number;
  startTime: Date;
  endTime: Date;
  highestBid?: {
    bidder: string;
    amount: number;
    timestamp: Date;
  };
}

export interface NFTListing {
  id: string;
  marketplace: 'opensea' | 'rarible' | 'foundation' | 'custom';
  price: number;
  currency: string;
  seller: string;
  listedAt: Date;
  expiresAt?: Date;
  status: 'active' | 'sold' | 'cancelled' | 'expired';
}

export interface WalletConnection {
  address: string;
  provider: 'metamask' | 'walletconnect' | 'coinbase' | 'phantom';
  network: BlockchainNetwork;
  balance: number;
  connectedAt: Date;
}

export interface MintRequest {
  presentationId: string;
  title: string;
  description: string;
  coverImage: string;
  blockchain: BlockchainNetwork;
  royaltyPercentage?: number;
  price?: number;
  listForSale?: boolean;
}

export interface NFTTransaction {
  id: string;
  type: 'mint' | 'transfer' | 'sale' | 'burn';
  tokenId: string;
  from?: string;
  to: string;
  price?: number;
  currency?: string;
  txHash: string;
  blockNumber: number;
  gasUsed: number;
  gasPrice: number;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface IPFSUpload {
  cid: string; // Content Identifier
  url: string; // IPFS URL
  size: number;
  uploadedAt: Date;
  pinned: boolean;
}

export interface SmartContractConfig {
  network: BlockchainNetwork;
  contractAddress: string;
  abi: any[];
  rpcUrl: string;
}

/**
 * Blockchain NFT Manager
 * Mint presentations as NFTs
 */
export class BlockchainNFTManager {
  private nfts: Map<string, PresentationNFT>;
  private transactions: Map<string, NFTTransaction[]>;
  private wallet: WalletConnection | null = null;
  private ipfsGateway: string = 'https://ipfs.io/ipfs/';
  private contractConfigs: Map<BlockchainNetwork, SmartContractConfig>;

  constructor() {
    this.nfts = new Map();
    this.transactions = new Map();
    this.contractConfigs = new Map();
    this.initializeContractConfigs();
  }

  /**
   * Initialize contract configurations
   */
  private initializeContractConfigs(): void {
    // Example contract configs (would be deployed smart contracts)
    this.contractConfigs.set('ethereum', {
      network: 'ethereum',
      contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
      abi: [],
      rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID'
    });

    this.contractConfigs.set('polygon', {
      network: 'polygon',
      contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
      abi: [],
      rpcUrl: 'https://polygon-rpc.com'
    });
  }

  /**
   * Connect wallet
   */
  async connectWallet(
    provider: WalletConnection['provider'] = 'metamask'
  ): Promise<WalletConnection | null> {
    // In production, would use Web3.js or ethers.js
    // Simulate wallet connection
    try {
      const connection: WalletConnection = {
        address: '0x' + Math.random().toString(16).substr(2, 40),
        provider,
        network: 'ethereum',
        balance: 1.5, // ETH
        connectedAt: new Date()
      };

      this.wallet = connection;
      return connection;
    } catch {
      return null;
    }
  }

  /**
   * Disconnect wallet
   */
  disconnectWallet(): void {
    this.wallet = null;
  }

  /**
   * Upload to IPFS
   */
  async uploadToIPFS(
    content: string | Blob,
    filename: string
  ): Promise<IPFSUpload | null> {
    // In production, would use Pinata, Infura, or nft.storage
    // Simulate IPFS upload
    const cid = 'Qm' + Math.random().toString(36).substr(2, 44);

    const upload: IPFSUpload = {
      cid,
      url: `${this.ipfsGateway}${cid}`,
      size: typeof content === 'string' ? content.length : content.size,
      uploadedAt: new Date(),
      pinned: true
    };

    return upload;
  }

  /**
   * Mint NFT
   */
  async mintNFT(request: MintRequest): Promise<PresentationNFT | null> {
    if (!this.wallet) {
      throw new Error('Wallet not connected');
    }

    // Upload metadata to IPFS
    const metadata: NFTMetadata = {
      name: request.title,
      description: request.description,
      image: request.coverImage,
      attributes: [
        { traitType: 'Type', value: 'Presentation' },
        { traitType: 'Format', value: 'HTML' }
      ],
      properties: {
        slideCount: 0,
        createdDate: new Date().toISOString(),
        format: 'html',
        fileSize: 0,
        category: 'Business',
        tags: []
      }
    };

    const metadataUpload = await this.uploadToIPFS(
      JSON.stringify(metadata),
      'metadata.json'
    );

    if (!metadataUpload) return null;

    // In production, would call smart contract mint function
    // Simulate minting
    const tokenId = String(Date.now());

    const nft: PresentationNFT = {
      id: this.generateId(),
      tokenId,
      presentationId: request.presentationId,
      title: request.title,
      description: request.description,
      creator: {
        address: this.wallet.address,
        verified: false
      },
      owner: {
        address: this.wallet.address,
        acquiredAt: new Date()
      },
      blockchain: request.blockchain,
      contractAddress: this.contractConfigs.get(request.blockchain)?.contractAddress || '',
      metadata,
      royalties: {
        enabled: request.royaltyPercentage !== undefined,
        percentage: request.royaltyPercentage || 10,
        recipient: this.wallet.address
      },
      pricing: {
        type: request.price ? 'fixed' : 'free',
        currency: 'ETH',
        amount: request.price
      },
      listings: [],
      mintedAt: new Date()
    };

    this.nfts.set(nft.id, nft);

    // Record transaction
    this.recordTransaction({
      type: 'mint',
      tokenId,
      to: this.wallet.address,
      txHash: '0x' + Math.random().toString(16).substr(2, 64),
      blockNumber: Math.floor(Math.random() * 10000000),
      gasUsed: 150000,
      gasPrice: 30
    });

    // Auto-list if requested
    if (request.listForSale && request.price) {
      await this.listForSale(nft.id, 'opensea', request.price, 'ETH');
    }

    return nft;
  }

  /**
   * Transfer NFT
   */
  async transferNFT(
    nftId: string,
    toAddress: string,
    price?: number
  ): Promise<boolean> {
    const nft = this.nfts.get(nftId);
    if (!nft || !this.wallet) return false;

    if (nft.owner.address !== this.wallet.address) {
      throw new Error('Not the owner of this NFT');
    }

    // In production, would call smart contract transfer function
    // Update owner
    nft.owner = {
      address: toAddress,
      acquiredAt: new Date(),
      pricePaid: price
    };

    nft.lastTransferAt = new Date();

    // Record transaction
    this.recordTransaction({
      type: price ? 'sale' : 'transfer',
      tokenId: nft.tokenId,
      from: this.wallet.address,
      to: toAddress,
      price,
      currency: price ? 'ETH' : undefined,
      txHash: '0x' + Math.random().toString(16).substr(2, 64),
      blockNumber: Math.floor(Math.random() * 10000000),
      gasUsed: 100000,
      gasPrice: 30
    });

    // Calculate and send royalty if applicable
    if (price && nft.royalties.enabled) {
      const royaltyAmount = price * (nft.royalties.percentage / 100);
      // In production, would send royalty to creator
      console.log(`Royalty sent: ${royaltyAmount} to ${nft.royalties.recipient}`);
    }

    return true;
  }

  /**
   * List NFT for sale
   */
  async listForSale(
    nftId: string,
    marketplace: NFTListing['marketplace'],
    price: number,
    currency: string,
    expiresIn?: number // days
  ): Promise<NFTListing | null> {
    const nft = this.nfts.get(nftId);
    if (!nft || !this.wallet) return null;

    if (nft.owner.address !== this.wallet.address) {
      throw new Error('Not the owner of this NFT');
    }

    const listing: NFTListing = {
      id: this.generateId(),
      marketplace,
      price,
      currency,
      seller: this.wallet.address,
      listedAt: new Date(),
      expiresAt: expiresIn
        ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000)
        : undefined,
      status: 'active'
    };

    nft.listings.push(listing);
    return listing;
  }

  /**
   * Cancel listing
   */
  cancelListing(nftId: string, listingId: string): boolean {
    const nft = this.nfts.get(nftId);
    if (!nft) return false;

    const listing = nft.listings.find(l => l.id === listingId);
    if (!listing) return false;

    listing.status = 'cancelled';
    return true;
  }

  /**
   * Start auction
   */
  async startAuction(
    nftId: string,
    startPrice: number,
    reservePrice: number,
    durationHours: number
  ): Promise<boolean> {
    const nft = this.nfts.get(nftId);
    if (!nft || !this.wallet) return false;

    const now = new Date();
    nft.pricing = {
      type: 'auction',
      currency: 'ETH',
      auctionConfig: {
        startPrice,
        reservePrice,
        startTime: now,
        endTime: new Date(now.getTime() + durationHours * 60 * 60 * 1000)
      }
    };

    return true;
  }

  /**
   * Place bid
   */
  async placeBid(nftId: string, amount: number): Promise<boolean> {
    const nft = this.nfts.get(nftId);
    if (!nft || !this.wallet || nft.pricing.type !== 'auction') return false;

    const auction = nft.pricing.auctionConfig;
    if (!auction) return false;

    // Check if auction is active
    const now = new Date();
    if (now < auction.startTime || now > auction.endTime) {
      throw new Error('Auction not active');
    }

    // Check if bid is higher than current highest
    const minBid = auction.highestBid
      ? auction.highestBid.amount
      : auction.startPrice;

    if (amount <= minBid) {
      throw new Error(`Bid must be higher than ${minBid}`);
    }

    // Place bid
    auction.highestBid = {
      bidder: this.wallet.address,
      amount,
      timestamp: now
    };

    return true;
  }

  /**
   * Verify NFT ownership
   */
  async verifyOwnership(nftId: string, address: string): Promise<boolean> {
    const nft = this.nfts.get(nftId);
    if (!nft) return false;

    // In production, would query blockchain
    return nft.owner.address.toLowerCase() === address.toLowerCase();
  }

  /**
   * Get NFT by token ID
   */
  getNFTByTokenId(tokenId: string): PresentationNFT | undefined {
    return Array.from(this.nfts.values()).find(nft => nft.tokenId === tokenId);
  }

  /**
   * Get NFTs by owner
   */
  getNFTsByOwner(address: string): PresentationNFT[] {
    return Array.from(this.nfts.values())
      .filter(nft => nft.owner.address.toLowerCase() === address.toLowerCase())
      .sort((a, b) => b.mintedAt.getTime() - a.mintedAt.getTime());
  }

  /**
   * Get NFTs by creator
   */
  getNFTsByCreator(address: string): PresentationNFT[] {
    return Array.from(this.nfts.values())
      .filter(nft => nft.creator.address.toLowerCase() === address.toLowerCase())
      .sort((a, b) => b.mintedAt.getTime() - a.mintedAt.getTime());
  }

  /**
   * Record transaction
   */
  private recordTransaction(data: Omit<NFTTransaction, 'id' | 'timestamp' | 'status'>): void {
    const transaction: NFTTransaction = {
      id: this.generateId(),
      ...data,
      timestamp: new Date(),
      status: 'confirmed'
    };

    if (!this.transactions.has(data.tokenId)) {
      this.transactions.set(data.tokenId, []);
    }

    this.transactions.get(data.tokenId)!.push(transaction);
  }

  /**
   * Get transaction history
   */
  getTransactionHistory(tokenId: string): NFTTransaction[] {
    return this.transactions.get(tokenId) || [];
  }

  /**
   * Calculate royalty
   */
  calculateRoyalty(nft: PresentationNFT, salePrice: number): number {
    if (!nft.royalties.enabled) return 0;
    if (nft.royalties.minSalePrice && salePrice < nft.royalties.minSalePrice) return 0;

    return salePrice * (nft.royalties.percentage / 100);
  }

  /**
   * Get marketplace statistics
   */
  getMarketplaceStats(): {
    totalNFTs: number;
    totalSales: number;
    totalVolume: number;
    floorPrice: number;
    averagePrice: number;
  } {
    const nfts = Array.from(this.nfts.values());
    const sales = Array.from(this.transactions.values())
      .flat()
      .filter(tx => tx.type === 'sale' && tx.price);

    const totalVolume = sales.reduce((sum, tx) => sum + (tx.price || 0), 0);
    const averagePrice = sales.length > 0 ? totalVolume / sales.length : 0;

    const listedNFTs = nfts.filter(nft =>
      nft.listings.some(l => l.status === 'active')
    );

    const floorPrice = listedNFTs.length > 0
      ? Math.min(...listedNFTs.flatMap(nft =>
          nft.listings.filter(l => l.status === 'active').map(l => l.price)
        ))
      : 0;

    return {
      totalNFTs: nfts.length,
      totalSales: sales.length,
      totalVolume,
      floorPrice,
      averagePrice
    };
  }

  /**
   * Get trending NFTs
   */
  getTrendingNFTs(limit: number = 10): PresentationNFT[] {
    // Sort by recent transactions
    return Array.from(this.nfts.values())
      .sort((a, b) => {
        const aTransfers = this.getTransactionHistory(a.tokenId).length;
        const bTransfers = this.getTransactionHistory(b.tokenId).length;
        return bTransfers - aTransfers;
      })
      .slice(0, limit);
  }

  /**
   * Search NFTs
   */
  searchNFTs(query: string): PresentationNFT[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.nfts.values()).filter(nft =>
      nft.title.toLowerCase().includes(lowerQuery) ||
      nft.description.toLowerCase().includes(lowerQuery) ||
      nft.metadata.properties.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Export NFT metadata
   */
  exportMetadata(nftId: string): string {
    const nft = this.nfts.get(nftId);
    if (!nft) return '{}';

    return JSON.stringify(nft.metadata, null, 2);
  }

  /**
   * Get all NFTs
   */
  getAllNFTs(): PresentationNFT[] {
    return Array.from(this.nfts.values())
      .sort((a, b) => b.mintedAt.getTime() - a.mintedAt.getTime());
  }

  /**
   * Get wallet connection
   */
  getWallet(): WalletConnection | null {
    return this.wallet;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `nft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all data
   */
  clearAll(): void {
    this.nfts.clear();
    this.transactions.clear();
    this.wallet = null;
  }
}

// Singleton instance
export const blockchainNFTManager = new BlockchainNFTManager();

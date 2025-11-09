/**
 * NFT Minter Component (P2.8)
 * Mint presentations as NFTs on blockchain
 *
 * NOTE: This component should be lazy loaded due to Web3 library size
 */

'use client';

import { useState } from 'react';
import { useBlockchainNFT } from '@/hooks/use-p2-features';
import { Wallet, Coins, Upload, Link as LinkIcon, TrendingUp, Loader2, ExternalLink } from 'lucide-react';

interface NFTMinterProps {
  presentationId: string;
  presentationTitle: string;
  presentationPreview: string;
}

export function NFTMinter({
  presentationId,
  presentationTitle,
  presentationPreview,
}: NFTMinterProps) {
  const { data: nftFeature, isLoading } = useBlockchainNFT();
  const [wallet, setWallet] = useState<any>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [mintedNFT, setMintedNFT] = useState<any>(null);
  const [metadata, setMetadata] = useState({
    name: presentationTitle,
    description: '',
    royalty: 5,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!nftFeature) {
    return null;
  }

  const handleConnectWallet = async () => {
    try {
      const connection = await nftFeature.connectWallet();
      setWallet(connection);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleMint = async () => {
    if (!wallet) return;

    setIsMinting(true);
    try {
      // Estimate gas fees first
      const gasFee = await nftFeature.estimateGas(presentationId);
      console.log('Estimated gas fee:', gasFee);

      // Mint NFT
      const result = await nftFeature.mintNFT(presentationId, metadata);
      setMintedNFT(result);
    } catch (error) {
      console.error('Failed to mint NFT:', error);
    } finally {
      setIsMinting(false);
    }
  };

  const handleListNFT = async (price: number) => {
    if (!mintedNFT) return;

    try {
      await nftFeature.listNFT(mintedNFT.tokenId, price);
    } catch (error) {
      console.error('Failed to list NFT:', error);
    }
  };

  if (!wallet) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-gray-200">
        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
          <Wallet className="w-10 h-10 text-purple-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-sm text-gray-600 text-center mb-6 max-w-md">
          Mint your presentation as an NFT on the blockchain. Earn royalties
          every time your NFT is traded!
        </p>
        <button
          onClick={handleConnectWallet}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium"
        >
          <Wallet className="w-5 h-5" />
          Connect Wallet
        </button>
        <p className="text-xs text-gray-500 mt-4">
          Supports MetaMask, WalletConnect, and more
        </p>
      </div>
    );
  }

  if (mintedNFT) {
    return (
      <div className="space-y-6">
        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Coins className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            NFT Minted Successfully!
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Your presentation has been minted as NFT #{mintedNFT.tokenId}
          </p>
          <a
            href={`https://etherscan.io/tx/${mintedNFT.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
          >
            View on Etherscan
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* NFT Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">NFT Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Token ID</span>
              <span className="text-sm font-medium">#{mintedNFT.tokenId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Network</span>
              <span className="text-sm font-medium">{wallet.network}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">IPFS URL</span>
              <a
                href={mintedNFT.ipfsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                View on IPFS
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Royalty</span>
              <span className="text-sm font-medium">{metadata.royalty}%</span>
            </div>
          </div>
        </div>

        {/* List for Sale */}
        <ListNFTForm onList={handleListNFT} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
              </p>
              <p className="text-xs text-gray-500">
                {wallet.balance.toFixed(4)} ETH
              </p>
            </div>
          </div>
          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
            {wallet.network}
          </span>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <img
          src={presentationPreview}
          alt={presentationTitle}
          className="w-full h-64 object-cover"
        />
      </div>

      {/* Metadata Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">NFT Metadata</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={metadata.name}
              onChange={(e) => setMetadata({ ...metadata, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={metadata.description}
              onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Describe your presentation..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Royalty (%)
            </label>
            <input
              type="number"
              value={metadata.royalty}
              onChange={(e) => setMetadata({ ...metadata, royalty: Number(e.target.value) })}
              min={0}
              max={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">
              Earn this percentage on secondary sales
            </p>
          </div>
        </div>
      </div>

      {/* Mint Button */}
      <button
        onClick={handleMint}
        disabled={isMinting || !metadata.name}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {isMinting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Minting NFT...
          </>
        ) : (
          <>
            <Upload className="w-5 h-5" />
            Mint NFT
          </>
        )}
      </button>
    </div>
  );
}

function ListNFTForm({ onList }: { onList: (price: number) => Promise<void> }) {
  const [price, setPrice] = useState('');
  const [isListing, setIsListing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price) return;

    setIsListing(true);
    try {
      await onList(parseFloat(price));
    } finally {
      setIsListing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-gray-900">List for Sale</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price (ETH)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            step="0.001"
            min="0"
            placeholder="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <button
          type="submit"
          disabled={isListing || !price}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isListing ? 'Listing...' : 'List NFT'}
        </button>
      </form>
    </div>
  );
}

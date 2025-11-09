/**
 * Themes Marketplace Component (P2.5)
 * Browse, purchase, and install presentation themes
 */

'use client';

import { useState } from 'react';
import { useThemesMarketplace } from '@/hooks/use-p2-features';
import { Search, Star, Download, DollarSign, Filter, Grid, List, Loader2 } from 'lucide-react';

type ViewMode = 'grid' | 'list';
type SortBy = 'popular' | 'recent' | 'price-low' | 'price-high' | 'rating';

export function ThemesMarketplace() {
  const { data: marketplaceFeature, isLoading } = useThemesMarketplace();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [themes, setThemes] = useState<any[]>([]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!marketplaceFeature) {
    return null;
  }

  const categories = ['All', 'Business', 'Education', 'Creative', 'Minimal', 'Bold'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Themes Marketplace</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md ${
              viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md ${
              viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search themes..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category.toLowerCase())}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedCategory === category.toLowerCase()
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
        >
          <option value="popular">Most Popular</option>
          <option value="recent">Recently Added</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      {/* Themes Grid/List */}
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }
      >
        {[...Array(9)].map((_, i) => (
          <ThemeCard
            key={i}
            theme={{
              id: `theme-${i}`,
              name: `Professional Theme ${i + 1}`,
              author: 'Design Studio',
              price: (i + 1) * 10,
              rating: 4.5 + (i % 5) / 10,
              downloads: (i + 1) * 1000,
              preview: `https://via.placeholder.com/400x300?text=Theme+${i + 1}`,
            }}
            viewMode={viewMode}
            onPurchase={async (themeId) => {
              await marketplaceFeature.purchaseTheme(themeId);
            }}
            onInstall={async (themeId) => {
              await marketplaceFeature.installTheme(themeId);
            }}
          />
        ))}
      </div>
    </div>
  );
}

interface ThemeCardProps {
  theme: any;
  viewMode: ViewMode;
  onPurchase: (themeId: string) => Promise<void>;
  onInstall: (themeId: string) => Promise<void>;
}

function ThemeCard({ theme, viewMode, onPurchase, onInstall }: ThemeCardProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      await onPurchase(theme.id);
      await onInstall(theme.id);
    } catch (error) {
      console.error('Failed to purchase theme:', error);
    } finally {
      setIsPurchasing(false);
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex gap-4 hover:shadow-md transition-shadow">
        <img
          src={theme.preview}
          alt={theme.name}
          className="w-48 h-32 object-cover rounded-md"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{theme.name}</h3>
          <p className="text-sm text-gray-600">by {theme.author}</p>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium">{theme.rating}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Download className="w-4 h-4" />
              {theme.downloads.toLocaleString()}
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between items-end">
          <div className="text-2xl font-bold text-purple-600">${theme.price}</div>
          <button
            onClick={handlePurchase}
            disabled={isPurchasing}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {isPurchasing ? 'Purchasing...' : 'Purchase'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <img
        src={theme.preview}
        alt={theme.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1">{theme.name}</h3>
        <p className="text-sm text-gray-600 mb-3">by {theme.author}</p>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{theme.rating}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Download className="w-4 h-4" />
            {theme.downloads.toLocaleString()}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-purple-600">${theme.price}</div>
          <button
            onClick={handlePurchase}
            disabled={isPurchasing}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            {isPurchasing ? 'Purchasing...' : 'Purchase'}
          </button>
        </div>
      </div>
    </div>
  );
}

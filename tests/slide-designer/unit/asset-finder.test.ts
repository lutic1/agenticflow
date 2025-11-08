/**
 * Unit Tests for Asset Finder
 * Tests image search, icon retrieval, and asset management
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Types
interface AssetSearchOptions {
  query: string;
  type: 'image' | 'icon' | 'photo' | 'illustration';
  count?: number;
  orientation?: 'landscape' | 'portrait' | 'square';
  color?: string;
  license?: 'free' | 'creative-commons' | 'any';
}

interface Asset {
  id: string;
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  type: 'image' | 'icon';
  source: string;
  license: string;
  attribution?: string;
}

interface AssetCache {
  query: string;
  assets: Asset[];
  timestamp: number;
  ttl: number;
}

// Mock Asset Finder
class AssetFinder {
  private cache: Map<string, AssetCache>;
  private cacheTTL: number;

  constructor(cacheTTL: number = 3600000) {
    this.cache = new Map();
    this.cacheTTL = cacheTTL;
  }

  async searchImages(options: AssetSearchOptions): Promise<Asset[]> {
    // Check cache first
    const cacheKey = this.getCacheKey(options);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    // Simulate API call
    const assets = await this.fetchAssets(options);

    // Cache results
    this.addToCache(cacheKey, assets);

    return assets;
  }

  async searchIcons(query: string, count: number = 10): Promise<Asset[]> {
    return this.searchImages({
      query,
      type: 'icon',
      count,
      license: 'free'
    });
  }

  async findRelevantImages(topic: string, count: number = 5): Promise<Asset[]> {
    const keywords = this.extractKeywords(topic);
    const results: Asset[] = [];

    for (const keyword of keywords.slice(0, 3)) {
      const images = await this.searchImages({
        query: keyword,
        type: 'photo',
        count: Math.ceil(count / 3),
        license: 'free'
      });
      results.push(...images);
    }

    return results.slice(0, count);
  }

  private async fetchAssets(options: AssetSearchOptions): Promise<Asset[]> {
    // Mock implementation - simulates API response
    const baseId = Date.now();
    const assets: Asset[] = [];

    for (let i = 0; i < (options.count || 10); i++) {
      assets.push({
        id: `${baseId}-${i}`,
        url: `https://example.com/assets/${options.type}/${options.query}-${i}.jpg`,
        thumbnailUrl: `https://example.com/assets/${options.type}/thumb-${options.query}-${i}.jpg`,
        width: options.orientation === 'portrait' ? 600 : 800,
        height: options.orientation === 'portrait' ? 800 : 600,
        type: options.type === 'icon' ? 'icon' : 'image',
        source: 'Mock API',
        license: options.license || 'free',
        attribution: 'Mock Attribution'
      });
    }

    return assets;
  }

  private getCacheKey(options: AssetSearchOptions): string {
    return JSON.stringify(options);
  }

  private getFromCache(key: string): Asset[] | null {
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    // Check if cache is still valid
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.assets;
  }

  private addToCache(key: string, assets: Asset[]): void {
    this.cache.set(key, {
      query: key,
      assets,
      timestamp: Date.now(),
      ttl: this.cacheTTL
    });
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];
    const words = text.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.includes(word));

    return [...new Set(words)].slice(0, 5);
  }

  validateAsset(asset: Asset): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!asset.url || !asset.url.startsWith('http')) {
      errors.push('Invalid asset URL');
    }

    if (!asset.id) {
      errors.push('Missing asset ID');
    }

    if (asset.width <= 0 || asset.height <= 0) {
      errors.push('Invalid asset dimensions');
    }

    if (!['image', 'icon'].includes(asset.type)) {
      errors.push('Invalid asset type');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  filterByOrientation(assets: Asset[], orientation: 'landscape' | 'portrait' | 'square'): Asset[] {
    return assets.filter(asset => {
      const ratio = asset.width / asset.height;

      if (orientation === 'landscape') {
        return ratio > 1.2;
      } else if (orientation === 'portrait') {
        return ratio < 0.8;
      } else {
        return ratio >= 0.8 && ratio <= 1.2;
      }
    });
  }

  filterByLicense(assets: Asset[], license: string): Asset[] {
    return assets.filter(asset => asset.license === license);
  }

  async downloadAsset(asset: Asset): Promise<Buffer> {
    // Mock download - in real implementation, would fetch from URL
    return Buffer.from(`Mock asset data for ${asset.id}`);
  }

  generateAttribution(asset: Asset): string {
    if (!asset.attribution) {
      return '';
    }

    return `${asset.attribution} (${asset.source}) - ${asset.license}`;
  }
}

describe('AssetFinder', () => {
  let finder: AssetFinder;

  beforeEach(() => {
    finder = new AssetFinder();
  });

  describe('Initialization', () => {
    it('should initialize with default cache TTL', () => {
      expect(finder).toBeDefined();
      expect(finder.getCacheSize()).toBe(0);
    });

    it('should initialize with custom cache TTL', () => {
      const customFinder = new AssetFinder(1800000);
      expect(customFinder).toBeDefined();
    });
  });

  describe('Image Search', () => {
    it('should search for images', async () => {
      const results = await finder.searchImages({
        query: 'technology',
        type: 'photo',
        count: 5
      });

      expect(results).toHaveLength(5);
      expect(results[0]).toHaveProperty('url');
      expect(results[0]).toHaveProperty('id');
    });

    it('should respect count parameter', async () => {
      const results = await finder.searchImages({
        query: 'nature',
        type: 'photo',
        count: 3
      });

      expect(results).toHaveLength(3);
    });

    it('should search with orientation filter', async () => {
      const results = await finder.searchImages({
        query: 'mountains',
        type: 'photo',
        count: 5,
        orientation: 'landscape'
      });

      expect(results).toHaveLength(5);
      results.forEach(asset => {
        expect(asset.width).toBeGreaterThan(asset.height);
      });
    });

    it('should search with portrait orientation', async () => {
      const results = await finder.searchImages({
        query: 'person',
        type: 'photo',
        count: 5,
        orientation: 'portrait'
      });

      expect(results).toHaveLength(5);
      results.forEach(asset => {
        expect(asset.height).toBeGreaterThan(asset.width);
      });
    });

    it('should handle license filtering', async () => {
      const results = await finder.searchImages({
        query: 'business',
        type: 'photo',
        count: 5,
        license: 'creative-commons'
      });

      expect(results).toHaveLength(5);
      results.forEach(asset => {
        expect(asset.license).toBe('creative-commons');
      });
    });
  });

  describe('Icon Search', () => {
    it('should search for icons', async () => {
      const results = await finder.searchIcons('user', 10);

      expect(results).toHaveLength(10);
      expect(results[0].type).toBe('icon');
    });

    it('should use free license for icons', async () => {
      const results = await finder.searchIcons('settings', 5);

      results.forEach(icon => {
        expect(icon.license).toBe('free');
      });
    });

    it('should handle different icon queries', async () => {
      const queries = ['home', 'search', 'menu', 'close'];

      for (const query of queries) {
        const results = await finder.searchIcons(query, 3);
        expect(results).toHaveLength(3);
      }
    });
  });

  describe('Relevant Image Finding', () => {
    it('should find images for a topic', async () => {
      const results = await finder.findRelevantImages('Artificial Intelligence and Machine Learning', 5);

      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(5);
    });

    it('should extract keywords from topic', async () => {
      const results = await finder.findRelevantImages('Data Science Analytics', 3);

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle single word topics', async () => {
      const results = await finder.findRelevantImages('Technology', 5);

      expect(results).toHaveLength(5);
    });

    it('should handle complex topics', async () => {
      const results = await finder.findRelevantImages(
        'The future of quantum computing and its applications in cryptography',
        5
      );

      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Caching', () => {
    it('should cache search results', async () => {
      const options: AssetSearchOptions = {
        query: 'test',
        type: 'photo',
        count: 5
      };

      await finder.searchImages(options);
      expect(finder.getCacheSize()).toBe(1);
    });

    it('should return cached results on subsequent calls', async () => {
      const options: AssetSearchOptions = {
        query: 'cached',
        type: 'photo',
        count: 5
      };

      const firstCall = await finder.searchImages(options);
      const secondCall = await finder.searchImages(options);

      expect(firstCall).toEqual(secondCall);
      expect(finder.getCacheSize()).toBe(1);
    });

    it('should clear cache', async () => {
      await finder.searchImages({
        query: 'test',
        type: 'photo',
        count: 5
      });

      expect(finder.getCacheSize()).toBe(1);
      finder.clearCache();
      expect(finder.getCacheSize()).toBe(0);
    });

    it('should handle different queries separately', async () => {
      await finder.searchImages({ query: 'test1', type: 'photo' });
      await finder.searchImages({ query: 'test2', type: 'photo' });
      await finder.searchImages({ query: 'test3', type: 'photo' });

      expect(finder.getCacheSize()).toBe(3);
    });
  });

  describe('Asset Validation', () => {
    it('should validate valid assets', () => {
      const asset: Asset = {
        id: 'test-123',
        url: 'https://example.com/image.jpg',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        width: 800,
        height: 600,
        type: 'image',
        source: 'Test',
        license: 'free'
      };

      const validation = finder.validateAsset(asset);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect invalid URL', () => {
      const asset: Asset = {
        id: 'test-123',
        url: 'invalid-url',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        width: 800,
        height: 600,
        type: 'image',
        source: 'Test',
        license: 'free'
      };

      const validation = finder.validateAsset(asset);
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('URL'))).toBe(true);
    });

    it('should detect missing ID', () => {
      const asset: Asset = {
        id: '',
        url: 'https://example.com/image.jpg',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        width: 800,
        height: 600,
        type: 'image',
        source: 'Test',
        license: 'free'
      };

      const validation = finder.validateAsset(asset);
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('ID'))).toBe(true);
    });

    it('should detect invalid dimensions', () => {
      const asset: Asset = {
        id: 'test-123',
        url: 'https://example.com/image.jpg',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        width: 0,
        height: 0,
        type: 'image',
        source: 'Test',
        license: 'free'
      };

      const validation = finder.validateAsset(asset);
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('dimensions'))).toBe(true);
    });
  });

  describe('Filtering', () => {
    let mockAssets: Asset[];

    beforeEach(() => {
      mockAssets = [
        {
          id: '1',
          url: 'https://example.com/1.jpg',
          thumbnailUrl: 'https://example.com/thumb-1.jpg',
          width: 1600,
          height: 900,
          type: 'image',
          source: 'Test',
          license: 'free'
        },
        {
          id: '2',
          url: 'https://example.com/2.jpg',
          thumbnailUrl: 'https://example.com/thumb-2.jpg',
          width: 600,
          height: 800,
          type: 'image',
          source: 'Test',
          license: 'creative-commons'
        },
        {
          id: '3',
          url: 'https://example.com/3.jpg',
          thumbnailUrl: 'https://example.com/thumb-3.jpg',
          width: 800,
          height: 800,
          type: 'image',
          source: 'Test',
          license: 'free'
        }
      ];
    });

    it('should filter by landscape orientation', () => {
      const filtered = finder.filterByOrientation(mockAssets, 'landscape');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].width).toBeGreaterThan(filtered[0].height);
    });

    it('should filter by portrait orientation', () => {
      const filtered = finder.filterByOrientation(mockAssets, 'portrait');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].height).toBeGreaterThan(filtered[0].width);
    });

    it('should filter by square orientation', () => {
      const filtered = finder.filterByOrientation(mockAssets, 'square');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].width).toBe(filtered[0].height);
    });

    it('should filter by license', () => {
      const filtered = finder.filterByLicense(mockAssets, 'free');
      expect(filtered).toHaveLength(2);
      filtered.forEach(asset => {
        expect(asset.license).toBe('free');
      });
    });
  });

  describe('Attribution', () => {
    it('should generate attribution string', () => {
      const asset: Asset = {
        id: 'test-123',
        url: 'https://example.com/image.jpg',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        width: 800,
        height: 600,
        type: 'image',
        source: 'Unsplash',
        license: 'free',
        attribution: 'Photo by John Doe'
      };

      const attribution = finder.generateAttribution(asset);
      expect(attribution).toContain('John Doe');
      expect(attribution).toContain('Unsplash');
      expect(attribution).toContain('free');
    });

    it('should handle missing attribution', () => {
      const asset: Asset = {
        id: 'test-123',
        url: 'https://example.com/image.jpg',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        width: 800,
        height: 600,
        type: 'image',
        source: 'Test',
        license: 'free'
      };

      const attribution = finder.generateAttribution(asset);
      expect(attribution).toBe('');
    });
  });

  describe('Asset Download', () => {
    it('should download asset', async () => {
      const asset: Asset = {
        id: 'test-123',
        url: 'https://example.com/image.jpg',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        width: 800,
        height: 600,
        type: 'image',
        source: 'Test',
        license: 'free'
      };

      const buffer = await finder.downloadAsset(asset);
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty query', async () => {
      const results = await finder.searchImages({
        query: '',
        type: 'photo'
      });

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle very long query', async () => {
      const longQuery = 'A'.repeat(500);
      const results = await finder.searchImages({
        query: longQuery,
        type: 'photo',
        count: 5
      });

      expect(results).toHaveLength(5);
    });

    it('should handle special characters in query', async () => {
      const results = await finder.searchImages({
        query: 'test & <special> "chars"',
        type: 'photo',
        count: 3
      });

      expect(results).toHaveLength(3);
    });

    it('should handle zero count', async () => {
      const results = await finder.searchImages({
        query: 'test',
        type: 'photo',
        count: 0
      });

      expect(results).toHaveLength(0);
    });
  });

  describe('Performance', () => {
    it('should handle concurrent searches', async () => {
      const promises = [];

      for (let i = 0; i < 10; i++) {
        promises.push(
          finder.searchImages({
            query: `query${i}`,
            type: 'photo',
            count: 5
          })
        );
      }

      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      expect(finder.getCacheSize()).toBe(10);
    });

    it('should complete search within reasonable time', async () => {
      const start = Date.now();
      await finder.searchImages({
        query: 'performance',
        type: 'photo',
        count: 10
      });
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000); // 1 second
    });
  });
});

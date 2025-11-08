/**
 * Image Finder - Unsplash Integration with Relevance Scoring
 * Searches and retrieves relevant images for slide content
 */

export interface ImageSearchResult {
  id: string;
  url: string;
  thumbnailUrl: string;
  description: string;
  altText: string;
  photographer: string;
  photographerUrl: string;
  relevanceScore: number;
  width: number;
  height: number;
  color: string;
}

export interface ImageSearchOptions {
  query: string;
  orientation?: 'landscape' | 'portrait' | 'squarish';
  color?: string;
  perPage?: number;
  page?: number;
  contentContext?: string; // Additional context for relevance scoring
}

export class ImageFinder {
  private apiKey: string;
  private baseUrl = 'https://api.unsplash.com';
  private cache: Map<string, ImageSearchResult[]> = new Map();

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.UNSPLASH_API_KEY || '';
  }

  /**
   * Search for images with relevance scoring
   */
  async searchImages(options: ImageSearchOptions): Promise<ImageSearchResult[]> {
    const cacheKey = this.getCacheKey(options);

    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const results = await this.fetchFromUnsplash(options);
      const scoredResults = this.scoreRelevance(results, options);

      // Cache results
      this.cache.set(cacheKey, scoredResults);

      return scoredResults;
    } catch (error) {
      console.error('Image search failed:', error);
      return this.getFallbackImages(options);
    }
  }

  /**
   * Get a single best match image
   */
  async getBestMatch(query: string, context?: string): Promise<ImageSearchResult | null> {
    const results = await this.searchImages({
      query,
      contentContext: context,
      perPage: 10,
    });

    return results.length > 0 ? results[0] : null;
  }

  /**
   * Fetch images from Unsplash API
   */
  private async fetchFromUnsplash(options: ImageSearchOptions): Promise<ImageSearchResult[]> {
    if (!this.apiKey) {
      console.warn('No Unsplash API key provided, using fallback images');
      return this.getFallbackImages(options);
    }

    const params = new URLSearchParams({
      query: options.query,
      per_page: String(options.perPage || 10),
      page: String(options.page || 1),
      orientation: options.orientation || 'landscape',
    });

    if (options.color) {
      params.append('color', options.color);
    }

    const response = await fetch(`${this.baseUrl}/search/photos?${params}`, {
      headers: {
        'Authorization': `Client-ID ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();

    return data.results.map((photo: any) => ({
      id: photo.id,
      url: photo.urls.regular,
      thumbnailUrl: photo.urls.thumb,
      description: photo.description || photo.alt_description || '',
      altText: photo.alt_description || options.query,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
      relevanceScore: 0, // Will be scored later
      width: photo.width,
      height: photo.height,
      color: photo.color,
    }));
  }

  /**
   * Score image relevance based on query and context
   */
  private scoreRelevance(
    images: ImageSearchResult[],
    options: ImageSearchOptions
  ): ImageSearchResult[] {
    const queryTerms = options.query.toLowerCase().split(/\s+/);
    const contextTerms = options.contentContext?.toLowerCase().split(/\s+/) || [];

    return images
      .map(image => {
        let score = 0;
        const description = (image.description + ' ' + image.altText).toLowerCase();

        // Score based on query term matches
        queryTerms.forEach(term => {
          if (description.includes(term)) {
            score += 2;
          }
        });

        // Score based on context matches
        contextTerms.forEach(term => {
          if (description.includes(term)) {
            score += 1;
          }
        });

        // Bonus for professional photography
        if (image.photographer) {
          score += 0.5;
        }

        // Bonus for good aspect ratio (landscape for slides)
        const aspectRatio = image.width / image.height;
        if (aspectRatio >= 1.5 && aspectRatio <= 2.0) {
          score += 1;
        }

        return { ...image, relevanceScore: score };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Get fallback images when API is unavailable
   */
  private getFallbackImages(options: ImageSearchOptions): ImageSearchResult[] {
    // Professional placeholder images from various free sources
    const fallbacks: ImageSearchResult[] = [
      {
        id: 'fallback-1',
        url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0',
        thumbnailUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400',
        description: 'Professional business team',
        altText: options.query,
        photographer: 'Unsplash',
        photographerUrl: 'https://unsplash.com',
        relevanceScore: 1,
        width: 1920,
        height: 1080,
        color: '#2563eb',
      },
      {
        id: 'fallback-2',
        url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d',
        thumbnailUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400',
        description: 'Modern workspace',
        altText: options.query,
        photographer: 'Unsplash',
        photographerUrl: 'https://unsplash.com',
        relevanceScore: 1,
        width: 1920,
        height: 1080,
        color: '#3b82f6',
      },
      {
        id: 'fallback-3',
        url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
        thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400',
        description: 'Team collaboration',
        altText: options.query,
        photographer: 'Unsplash',
        photographerUrl: 'https://unsplash.com',
        relevanceScore: 1,
        width: 1920,
        height: 1080,
        color: '#1e40af',
      },
    ];

    return fallbacks;
  }

  /**
   * Generate cache key from options
   */
  private getCacheKey(options: ImageSearchOptions): string {
    return `${options.query}-${options.orientation || 'landscape'}-${options.color || 'any'}-${options.perPage || 10}`;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Download and optimize image
   */
  async downloadImage(url: string, maxWidth: number = 1920): Promise<Buffer | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      return Buffer.from(buffer);
    } catch (error) {
      console.error('Image download failed:', error);
      return null;
    }
  }
}

export default ImageFinder;

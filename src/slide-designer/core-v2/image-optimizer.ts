/**
 * Image Optimizer (V2)
 * Optimizes images for web and print (WebP, responsive, lazy loading)
 * Reduces file sizes while maintaining quality
 */

export interface ImageOptimizationConfig {
  // Source image
  sourceUrl: string;

  // Target dimensions
  resize?: {
    width?: number;
    height?: number;
    fit: 'cover' | 'contain' | 'fill';
  };

  // Format conversion
  format: 'webp' | 'jpg' | 'png' | 'auto';
  quality: number; // 0-100

  // Responsive variants
  generateResponsive: boolean;
  breakpoints?: number[]; // e.g., [640, 1280, 1920]

  // Performance
  lazy: boolean;
  blur: boolean; // Generate blur-up placeholder

  // Caching
  cache?: {
    enabled: boolean;
    ttl: number; // seconds
  };
}

export interface OptimizedImage {
  original: string;
  optimized: string; // Primary optimized URL
  srcset: Array<{
    url: string;
    width: number;
    descriptor: string; // e.g., "1x", "2x", "640w"
  }>;
  placeholder?: string; // Blur-up placeholder (base64)
  metadata: {
    originalSize?: number;
    optimizedSize?: number;
    savings?: number; // percentage
    format: string;
    dimensions: {
      width: number;
      height: number;
    };
  };
}

/**
 * Image Optimizer
 * Handles image optimization for slides
 */
export class ImageOptimizer {
  // Default configuration
  private defaultConfig: Omit<ImageOptimizationConfig, 'sourceUrl'> = {
    format: 'webp',
    quality: 85,
    generateResponsive: true,
    breakpoints: [640, 1280, 1920],
    lazy: true,
    blur: true,
    cache: {
      enabled: true,
      ttl: 86400 // 24 hours
    }
  };

  /**
   * Optimize image from URL
   */
  async optimize(
    sourceUrl: string,
    config?: Partial<ImageOptimizationConfig>
  ): Promise<OptimizedImage> {
    const fullConfig: ImageOptimizationConfig = {
      ...this.defaultConfig,
      ...config,
      sourceUrl
    };

    // For now, return Unsplash optimization parameters
    // In production, would use Sharp library or image CDN
    const optimized = this.optimizeUnsplashUrl(sourceUrl, fullConfig);

    return optimized;
  }

  /**
   * Optimize Unsplash URL (using Unsplash's built-in optimization)
   */
  private optimizeUnsplashUrl(
    url: string,
    config: ImageOptimizationConfig
  ): OptimizedImage {
    if (!url.includes('unsplash.com')) {
      // Non-Unsplash image, return as-is (would implement CDN optimization in production)
      return this.createGenericOptimizedImage(url, config);
    }

    // Unsplash optimization parameters
    const baseUrl = url.split('?')[0];
    const params = new URLSearchParams();

    // Format
    if (config.format !== 'auto') {
      params.set('fm', config.format);
    }

    // Quality
    params.set('q', config.quality.toString());

    // Resize
    if (config.resize?.width) {
      params.set('w', config.resize.width.toString());
    }
    if (config.resize?.height) {
      params.set('h', config.resize.height.toString());
    }
    if (config.resize?.fit) {
      params.set('fit', config.resize.fit);
    }

    // Auto optimize
    params.set('auto', 'format');
    params.set('fit', 'max');

    const optimizedUrl = `${baseUrl}?${params.toString()}`;

    // Generate responsive variants
    const srcset = config.generateResponsive && config.breakpoints
      ? config.breakpoints.map(width => {
          const variantParams = new URLSearchParams(params);
          variantParams.set('w', width.toString());
          return {
            url: `${baseUrl}?${variantParams.toString()}`,
            width,
            descriptor: `${width}w`
          };
        })
      : [{ url: optimizedUrl, width: config.resize?.width || 1920, descriptor: '1x' }];

    // Generate blur placeholder
    const placeholder = config.blur ? this.generateBlurPlaceholder(baseUrl) : undefined;

    return {
      original: url,
      optimized: optimizedUrl,
      srcset,
      placeholder,
      metadata: {
        format: config.format === 'auto' ? 'webp' : config.format,
        dimensions: {
          width: config.resize?.width || 1920,
          height: config.resize?.height || 1080
        }
      }
    };
  }

  /**
   * Create generic optimized image (non-Unsplash)
   */
  private createGenericOptimizedImage(
    url: string,
    config: ImageOptimizationConfig
  ): OptimizedImage {
    // For generic images, return original with basic metadata
    // In production, would use CDN or Sharp for processing
    return {
      original: url,
      optimized: url,
      srcset: [{ url, width: config.resize?.width || 1920, descriptor: '1x' }],
      placeholder: config.blur ? this.generateSimpleBlurPlaceholder() : undefined,
      metadata: {
        format: config.format === 'auto' ? 'jpg' : config.format,
        dimensions: {
          width: config.resize?.width || 1920,
          height: config.resize?.height || 1080
        }
      }
    };
  }

  /**
   * Generate blur-up placeholder (Unsplash)
   */
  private generateBlurPlaceholder(baseUrl: string): string {
    // Use Unsplash's tiny blurred version
    const params = new URLSearchParams({
      w: '20',
      h: '20',
      q: '10',
      blur: '50',
      fm: 'jpg'
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Generate simple blur placeholder
   */
  private generateSimpleBlurPlaceholder(): string {
    // Simple gray placeholder (base64)
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080"%3E%3Crect fill="%23f3f4f6" width="1920" height="1080"/%3E%3C/svg%3E';
  }

  /**
   * Generate HTML picture element
   */
  generatePictureHTML(
    optimized: OptimizedImage,
    alt: string,
    className?: string
  ): string {
    const srcsetStr = optimized.srcset
      .map(s => `${s.url} ${s.descriptor}`)
      .join(', ');

    const lazyAttr = 'loading="lazy" decoding="async"';
    const styleAttr = optimized.placeholder
      ? `style="background-image: url('${optimized.placeholder}'); background-size: cover;"`
      : '';

    return `
<picture ${className ? `class="${className}"` : ''}>
  <source type="image/webp" srcset="${srcsetStr}" />
  <img
    src="${optimized.optimized}"
    alt="${alt}"
    ${lazyAttr}
    ${styleAttr}
    width="${optimized.metadata.dimensions.width}"
    height="${optimized.metadata.dimensions.height}"
  />
</picture>`.trim();
  }

  /**
   * Generate simple img element
   */
  generateImgHTML(
    optimized: OptimizedImage,
    alt: string,
    className?: string
  ): string {
    const srcsetStr = optimized.srcset
      .map(s => `${s.url} ${s.descriptor}`)
      .join(', ');

    const lazyAttr = 'loading="lazy" decoding="async"';

    return `
<img
  src="${optimized.optimized}"
  srcset="${srcsetStr}"
  alt="${alt}"
  ${className ? `class="${className}"` : ''}
  ${lazyAttr}
  width="${optimized.metadata.dimensions.width}"
  height="${optimized.metadata.dimensions.height}"
/>`.trim();
  }

  /**
   * Batch optimize multiple images
   */
  async optimizeBatch(
    urls: string[],
    config?: Partial<ImageOptimizationConfig>
  ): Promise<OptimizedImage[]> {
    return Promise.all(urls.map(url => this.optimize(url, config)));
  }

  /**
   * Get optimization recommendations
   */
  getRecommendations(imageUrl: string): {
    format: 'webp' | 'jpg' | 'png';
    quality: number;
    resize?: { width: number; height: number };
    reason: string;
  } {
    // Analyze URL and provide recommendations
    const isPng = imageUrl.toLowerCase().includes('.png');
    const isTransparent = imageUrl.toLowerCase().includes('transparent') || isPng;

    if (isTransparent) {
      return {
        format: 'png',
        quality: 90,
        reason: 'Transparent image, keep PNG format'
      };
    }

    // Default: WebP for best compression
    return {
      format: 'webp',
      quality: 85,
      resize: { width: 1920, height: 1080 },
      reason: 'WebP offers 25-35% better compression than JPEG'
    };
  }

  /**
   * Calculate estimated savings
   */
  calculateSavings(
    originalFormat: 'jpg' | 'png',
    targetFormat: 'webp' | 'jpg',
    quality: number
  ): number {
    // Rough estimates
    const compressionRates: Record<string, number> = {
      'jpg→webp': 0.25, // 25% smaller
      'png→webp': 0.35, // 35% smaller
      'png→jpg': 0.50   // 50% smaller
    };

    const key = `${originalFormat}→${targetFormat}`;
    return compressionRates[key] || 0;
  }
}

// Singleton instance
export const imageOptimizer = new ImageOptimizer();

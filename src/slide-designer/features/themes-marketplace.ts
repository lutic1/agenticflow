/**
 * Slide Themes Marketplace (P2.5)
 * Browse, purchase, and install presentation themes
 * User-submitted themes, ratings, reviews, and customization
 */

export interface Theme {
  id: string;
  name: string;
  description: string;
  author: ThemeAuthor;
  category: ThemeCategory;
  version: string;
  price: ThemePrice;
  preview: ThemePreview;
  colors: ThemeColors;
  fonts: ThemeFonts;
  layouts: ThemeLayout[];
  assets: ThemeAssets;
  metadata: ThemeMetadata;
  downloads: number;
  rating: number;
  reviews: number;
  featured: boolean;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ThemeCategory =
  | 'business'
  | 'education'
  | 'creative'
  | 'corporate'
  | 'minimal'
  | 'modern'
  | 'classic'
  | 'tech'
  | 'marketing'
  | 'portfolio';

export interface ThemeAuthor {
  id: string;
  name: string;
  email?: string;
  website?: string;
  avatar?: string;
  verified: boolean;
  totalThemes: number;
  totalDownloads: number;
}

export interface ThemePrice {
  type: 'free' | 'premium' | 'freemium';
  amount?: number; // USD
  currency?: string;
  discount?: {
    percentage: number;
    validUntil: Date;
  };
}

export interface ThemePreview {
  thumbnail: string;
  screenshots: string[];
  demoUrl?: string;
  videoUrl?: string;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  textSecondary: string;
  success?: string;
  warning?: string;
  error?: string;
}

export interface ThemeFonts {
  heading: ThemeFont;
  body: ThemeFont;
  code?: ThemeFont;
}

export interface ThemeFont {
  family: string;
  weights: number[];
  fallback: string;
  googleFont?: boolean;
}

export interface ThemeLayout {
  name: string;
  thumbnail: string;
  structure: {
    title?: { size: string; align: 'left' | 'center' | 'right' };
    subtitle?: { size: string; align: 'left' | 'center' | 'right' };
    content?: { columns: number; spacing: string };
    footer?: { height: string };
  };
}

export interface ThemeAssets {
  backgrounds?: string[];
  icons?: string[];
  patterns?: string[];
  images?: string[];
}

export interface ThemeMetadata {
  tags: string[];
  minVersion?: string; // Minimum app version required
  maxSlides?: number;
  supportedFeatures: string[];
  license: 'free' | 'personal' | 'commercial' | 'enterprise';
  changelog?: ThemeChangelog[];
}

export interface ThemeChangelog {
  version: string;
  date: Date;
  changes: string[];
}

export interface ThemeReview {
  id: string;
  themeId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  title?: string;
  comment: string;
  helpful: number;
  helpfulBy: string[];
  verified: boolean; // Verified purchase
  createdAt: Date;
  response?: {
    from: string;
    message: string;
    timestamp: Date;
  };
}

export interface InstalledTheme {
  themeId: string;
  installedAt: Date;
  version: string;
  active: boolean;
  customizations?: Partial<Theme>;
}

export interface ThemeSearchOptions {
  query?: string;
  category?: ThemeCategory;
  priceType?: 'free' | 'premium';
  minRating?: number;
  featured?: boolean;
  verified?: boolean;
  sortBy?: 'downloads' | 'rating' | 'recent' | 'name';
  page?: number;
  limit?: number;
}

export interface ThemePurchase {
  id: string;
  themeId: string;
  userId: string;
  price: number;
  currency: string;
  paymentMethod: string;
  purchasedAt: Date;
  licenseKey: string;
}

export interface MarketplaceStats {
  totalThemes: number;
  freeThemes: number;
  premiumThemes: number;
  totalDownloads: number;
  totalRevenue: number;
  averageRating: number;
  topThemes: Theme[];
  featuredThemes: Theme[];
}

/**
 * Slide Themes Marketplace Manager
 * Browse, purchase, and manage presentation themes
 */
export class ThemesMarketplaceManager {
  private themes: Map<string, Theme>;
  private reviews: Map<string, ThemeReview[]>;
  private installedThemes: Map<string, InstalledTheme>;
  private purchases: Map<string, ThemePurchase>;
  private activeTheme: string | null = null;

  constructor() {
    this.themes = new Map();
    this.reviews = new Map();
    this.installedThemes = new Map();
    this.purchases = new Map();
    this.initializeDefaultThemes();
  }

  /**
   * Initialize default themes
   */
  private initializeDefaultThemes(): void {
    // Default free themes
    const defaultThemes: Omit<Theme, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'Modern Minimal',
        description: 'Clean and minimalist design with focus on content',
        author: {
          id: 'official',
          name: 'AI Slide Designer',
          verified: true,
          totalThemes: 10,
          totalDownloads: 50000
        },
        category: 'minimal',
        version: '1.0.0',
        price: { type: 'free' },
        preview: {
          thumbnail: '/themes/modern-minimal/thumb.jpg',
          screenshots: ['/themes/modern-minimal/1.jpg', '/themes/modern-minimal/2.jpg']
        },
        colors: {
          primary: '#2D3748',
          secondary: '#4A5568',
          accent: '#4299E1',
          background: '#FFFFFF',
          text: '#1A202C',
          textSecondary: '#718096'
        },
        fonts: {
          heading: { family: 'Inter', weights: [600, 700], fallback: 'sans-serif', googleFont: true },
          body: { family: 'Inter', weights: [400, 500], fallback: 'sans-serif', googleFont: true }
        },
        layouts: [],
        assets: {},
        metadata: {
          tags: ['minimal', 'clean', 'modern', 'professional'],
          license: 'free',
          supportedFeatures: ['all']
        },
        downloads: 15000,
        rating: 4.8,
        reviews: 234,
        featured: true,
        verified: true
      },
      {
        name: 'Corporate Pro',
        description: 'Professional corporate theme for business presentations',
        author: {
          id: 'official',
          name: 'AI Slide Designer',
          verified: true,
          totalThemes: 10,
          totalDownloads: 50000
        },
        category: 'corporate',
        version: '1.2.0',
        price: { type: 'premium', amount: 29.99, currency: 'USD' },
        preview: {
          thumbnail: '/themes/corporate-pro/thumb.jpg',
          screenshots: ['/themes/corporate-pro/1.jpg']
        },
        colors: {
          primary: '#1A365D',
          secondary: '#2C5282',
          accent: '#ED8936',
          background: '#F7FAFC',
          text: '#1A202C',
          textSecondary: '#4A5568'
        },
        fonts: {
          heading: { family: 'Montserrat', weights: [600, 700], fallback: 'sans-serif', googleFont: true },
          body: { family: 'Open Sans', weights: [400, 600], fallback: 'sans-serif', googleFont: true }
        },
        layouts: [],
        assets: {},
        metadata: {
          tags: ['corporate', 'business', 'professional', 'premium'],
          license: 'commercial',
          supportedFeatures: ['all']
        },
        downloads: 8500,
        rating: 4.9,
        reviews: 156,
        featured: true,
        verified: true
      },
      {
        name: 'Creative Canvas',
        description: 'Bold and creative theme for design portfolios',
        author: {
          id: 'official',
          name: 'AI Slide Designer',
          verified: true,
          totalThemes: 10,
          totalDownloads: 50000
        },
        category: 'creative',
        version: '1.1.0',
        price: { type: 'free' },
        preview: {
          thumbnail: '/themes/creative-canvas/thumb.jpg',
          screenshots: ['/themes/creative-canvas/1.jpg']
        },
        colors: {
          primary: '#F687B3',
          secondary: '#ED64A6',
          accent: '#805AD5',
          background: '#1A202C',
          text: '#FFFFFF',
          textSecondary: '#E2E8F0'
        },
        fonts: {
          heading: { family: 'Playfair Display', weights: [700, 900], fallback: 'serif', googleFont: true },
          body: { family: 'Roboto', weights: [400, 500], fallback: 'sans-serif', googleFont: true }
        },
        layouts: [],
        assets: {},
        metadata: {
          tags: ['creative', 'bold', 'portfolio', 'design'],
          license: 'free',
          supportedFeatures: ['all']
        },
        downloads: 12000,
        rating: 4.7,
        reviews: 189,
        featured: false,
        verified: true
      }
    ];

    defaultThemes.forEach(themeData => {
      const theme: Theme = {
        id: this.generateId(),
        ...themeData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.themes.set(theme.id, theme);
    });
  }

  /**
   * Search themes
   */
  searchThemes(options: ThemeSearchOptions = {}): {
    themes: Theme[];
    total: number;
    page: number;
    totalPages: number;
  } {
    let filtered = Array.from(this.themes.values());

    // Filter by query
    if (options.query) {
      const query = options.query.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.metadata.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (options.category) {
      filtered = filtered.filter(t => t.category === options.category);
    }

    // Filter by price type
    if (options.priceType) {
      filtered = filtered.filter(t => t.price.type === options.priceType);
    }

    // Filter by rating
    if (options.minRating) {
      filtered = filtered.filter(t => t.rating >= options.minRating);
    }

    // Filter by featured
    if (options.featured) {
      filtered = filtered.filter(t => t.featured);
    }

    // Filter by verified
    if (options.verified) {
      filtered = filtered.filter(t => t.verified);
    }

    // Sort
    const sortBy = options.sortBy || 'downloads';
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'downloads':
          return b.downloads - a.downloads;
        case 'rating':
          return b.rating - a.rating;
        case 'recent':
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    // Pagination
    const page = options.page || 1;
    const limit = options.limit || 20;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const themes = filtered.slice(start, start + limit);

    return { themes, total, page, totalPages };
  }

  /**
   * Get theme by ID
   */
  getTheme(themeId: string): Theme | undefined {
    return this.themes.get(themeId);
  }

  /**
   * Install theme
   */
  installTheme(themeId: string, userId: string): InstalledTheme | null {
    const theme = this.themes.get(themeId);
    if (!theme) return null;

    // Check if premium and not purchased
    if (theme.price.type === 'premium') {
      const purchased = Array.from(this.purchases.values()).some(
        p => p.themeId === themeId && p.userId === userId
      );
      if (!purchased) {
        throw new Error('Theme must be purchased before installation');
      }
    }

    const installed: InstalledTheme = {
      themeId,
      installedAt: new Date(),
      version: theme.version,
      active: false
    };

    this.installedThemes.set(themeId, installed);

    // Increment downloads
    theme.downloads++;

    return installed;
  }

  /**
   * Uninstall theme
   */
  uninstallTheme(themeId: string): boolean {
    if (this.activeTheme === themeId) {
      this.activeTheme = null;
    }
    return this.installedThemes.delete(themeId);
  }

  /**
   * Activate theme
   */
  activateTheme(themeId: string): boolean {
    const installed = this.installedThemes.get(themeId);
    if (!installed) return false;

    // Deactivate current theme
    if (this.activeTheme) {
      const current = this.installedThemes.get(this.activeTheme);
      if (current) current.active = false;
    }

    // Activate new theme
    installed.active = true;
    this.activeTheme = themeId;

    return true;
  }

  /**
   * Get active theme
   */
  getActiveTheme(): Theme | null {
    if (!this.activeTheme) return null;
    return this.themes.get(this.activeTheme) || null;
  }

  /**
   * Customize theme
   */
  customizeTheme(themeId: string, customizations: Partial<Theme>): boolean {
    const installed = this.installedThemes.get(themeId);
    if (!installed) return false;

    installed.customizations = {
      ...installed.customizations,
      ...customizations
    };

    return true;
  }

  /**
   * Get installed themes
   */
  getInstalledThemes(): Array<Theme & { installed: InstalledTheme }> {
    return Array.from(this.installedThemes.entries())
      .map(([themeId, installed]) => {
        const theme = this.themes.get(themeId);
        if (!theme) return null;
        return { ...theme, installed };
      })
      .filter((t): t is Theme & { installed: InstalledTheme } => t !== null);
  }

  /**
   * Purchase theme
   */
  purchaseTheme(
    themeId: string,
    userId: string,
    paymentMethod: string
  ): ThemePurchase | null {
    const theme = this.themes.get(themeId);
    if (!theme || theme.price.type !== 'premium') return null;

    const purchase: ThemePurchase = {
      id: this.generateId(),
      themeId,
      userId,
      price: theme.price.amount || 0,
      currency: theme.price.currency || 'USD',
      paymentMethod,
      purchasedAt: new Date(),
      licenseKey: this.generateLicenseKey()
    };

    this.purchases.set(purchase.id, purchase);
    return purchase;
  }

  /**
   * Add review
   */
  addReview(
    themeId: string,
    userId: string,
    userName: string,
    rating: number,
    comment: string,
    title?: string
  ): ThemeReview | null {
    const theme = this.themes.get(themeId);
    if (!theme) return null;

    // Check if user purchased theme (for premium themes)
    const verified = theme.price.type === 'free' ||
      Array.from(this.purchases.values()).some(
        p => p.themeId === themeId && p.userId === userId
      );

    const review: ThemeReview = {
      id: this.generateId(),
      themeId,
      userId,
      userName,
      rating: Math.max(1, Math.min(5, rating)),
      title,
      comment,
      helpful: 0,
      helpfulBy: [],
      verified,
      createdAt: new Date()
    };

    if (!this.reviews.has(themeId)) {
      this.reviews.set(themeId, []);
    }

    this.reviews.get(themeId)!.push(review);

    // Update theme rating
    this.updateThemeRating(themeId);

    return review;
  }

  /**
   * Update theme rating
   */
  private updateThemeRating(themeId: string): void {
    const theme = this.themes.get(themeId);
    const reviews = this.reviews.get(themeId);

    if (!theme || !reviews || reviews.length === 0) return;

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    theme.rating = totalRating / reviews.length;
    theme.reviews = reviews.length;
  }

  /**
   * Get reviews for theme
   */
  getReviews(themeId: string, sortBy: 'recent' | 'helpful' | 'rating' = 'recent'): ThemeReview[] {
    const reviews = this.reviews.get(themeId) || [];

    return [...reviews].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'helpful':
          return b.helpful - a.helpful;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });
  }

  /**
   * Mark review helpful
   */
  markReviewHelpful(reviewId: string, userId: string): boolean {
    for (const reviews of this.reviews.values()) {
      const review = reviews.find(r => r.id === reviewId);
      if (review) {
        if (review.helpfulBy.includes(userId)) {
          // Remove helpful
          review.helpful--;
          review.helpfulBy = review.helpfulBy.filter(id => id !== userId);
        } else {
          // Add helpful
          review.helpful++;
          review.helpfulBy.push(userId);
        }
        return true;
      }
    }
    return false;
  }

  /**
   * Submit theme (for creators)
   */
  submitTheme(theme: Omit<Theme, 'id' | 'downloads' | 'rating' | 'reviews' | 'createdAt' | 'updatedAt'>): Theme {
    const newTheme: Theme = {
      id: this.generateId(),
      ...theme,
      downloads: 0,
      rating: 0,
      reviews: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.themes.set(newTheme.id, newTheme);
    return newTheme;
  }

  /**
   * Update theme
   */
  updateTheme(themeId: string, updates: Partial<Theme>): boolean {
    const theme = this.themes.get(themeId);
    if (!theme) return false;

    Object.assign(theme, updates, { updatedAt: new Date() });
    return true;
  }

  /**
   * Delete theme
   */
  deleteTheme(themeId: string): boolean {
    // Remove from installed
    this.installedThemes.delete(themeId);

    // Remove reviews
    this.reviews.delete(themeId);

    // Remove theme
    return this.themes.delete(themeId);
  }

  /**
   * Get marketplace statistics
   */
  getStats(): MarketplaceStats {
    const themes = Array.from(this.themes.values());

    const freeThemes = themes.filter(t => t.price.type === 'free').length;
    const premiumThemes = themes.filter(t => t.price.type === 'premium').length;
    const totalDownloads = themes.reduce((sum, t) => sum + t.downloads, 0);

    const totalRevenue = Array.from(this.purchases.values()).reduce(
      (sum, p) => sum + p.price,
      0
    );

    const ratedThemes = themes.filter(t => t.reviews > 0);
    const averageRating = ratedThemes.length > 0
      ? ratedThemes.reduce((sum, t) => sum + t.rating, 0) / ratedThemes.length
      : 0;

    const topThemes = [...themes]
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 10);

    const featuredThemes = themes.filter(t => t.featured);

    return {
      totalThemes: themes.length,
      freeThemes,
      premiumThemes,
      totalDownloads,
      totalRevenue,
      averageRating,
      topThemes,
      featuredThemes
    };
  }

  /**
   * Get categories with counts
   */
  getCategories(): Record<ThemeCategory, number> {
    const themes = Array.from(this.themes.values());
    const categories: Partial<Record<ThemeCategory, number>> = {};

    themes.forEach(theme => {
      categories[theme.category] = (categories[theme.category] || 0) + 1;
    });

    return categories as Record<ThemeCategory, number>;
  }

  /**
   * Export theme configuration
   */
  exportTheme(themeId: string): string {
    const theme = this.themes.get(themeId);
    if (!theme) return '{}';

    return JSON.stringify(theme, null, 2);
  }

  /**
   * Import theme configuration
   */
  importTheme(jsonData: string): string | null {
    try {
      const themeData = JSON.parse(jsonData);
      const theme = this.submitTheme(themeData);
      return theme.id;
    } catch {
      return null;
    }
  }

  /**
   * Generate license key
   */
  private generateLicenseKey(): string {
    const segments = Array(4).fill(0).map(() =>
      Math.random().toString(36).substr(2, 4).toUpperCase()
    );
    return segments.join('-');
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `theme-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const themesMarketplaceManager = new ThemesMarketplaceManager();

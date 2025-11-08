/**
 * Icon Manager - Icon Library Integration with Context Selection
 * Manages icons from multiple sources with smart selection
 */

export interface IconDefinition {
  id: string;
  name: string;
  category: string;
  tags: string[];
  svg: string;
  source: 'heroicons' | 'lucide' | 'feather' | 'material' | 'custom';
  size?: number;
}

export interface IconSearchOptions {
  query?: string;
  category?: string;
  style?: 'outline' | 'solid' | 'duotone';
  size?: number;
  context?: string; // Slide content context for smart selection
}

export class IconManager {
  private icons: Map<string, IconDefinition> = new Map();
  private categoryMap: Map<string, string[]> = new Map();

  constructor() {
    this.initializeIconLibrary();
  }

  /**
   * Initialize icon library with common professional icons
   */
  private initializeIconLibrary(): void {
    // Business & Office Icons
    this.addIcon({
      id: 'briefcase',
      name: 'Briefcase',
      category: 'business',
      tags: ['business', 'work', 'office', 'job', 'professional'],
      source: 'heroicons',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>',
    });

    this.addIcon({
      id: 'chart-bar',
      name: 'Chart Bar',
      category: 'data',
      tags: ['chart', 'data', 'analytics', 'statistics', 'graph', 'metrics'],
      source: 'heroicons',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>',
    });

    this.addIcon({
      id: 'users',
      name: 'Users',
      category: 'people',
      tags: ['team', 'people', 'group', 'users', 'collaboration', 'community'],
      source: 'heroicons',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>',
    });

    this.addIcon({
      id: 'lightbulb',
      name: 'Light Bulb',
      category: 'concepts',
      tags: ['idea', 'innovation', 'creative', 'thinking', 'solution', 'insight'],
      source: 'heroicons',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>',
    });

    this.addIcon({
      id: 'target',
      name: 'Target',
      category: 'goals',
      tags: ['goal', 'target', 'objective', 'aim', 'focus', 'mission'],
      source: 'heroicons',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>',
    });

    this.addIcon({
      id: 'rocket',
      name: 'Rocket',
      category: 'growth',
      tags: ['growth', 'launch', 'startup', 'speed', 'success', 'progress'],
      source: 'lucide',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09zM12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
    });

    this.addIcon({
      id: 'shield-check',
      name: 'Shield Check',
      category: 'security',
      tags: ['security', 'protection', 'safe', 'verified', 'trust', 'compliance'],
      source: 'heroicons',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>',
    });

    this.addIcon({
      id: 'trending-up',
      name: 'Trending Up',
      category: 'data',
      tags: ['growth', 'increase', 'trending', 'profit', 'success', 'improvement'],
      source: 'heroicons',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>',
    });

    this.addIcon({
      id: 'cog',
      name: 'Settings',
      category: 'system',
      tags: ['settings', 'configuration', 'tools', 'options', 'preferences', 'system'],
      source: 'heroicons',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>',
    });

    this.addIcon({
      id: 'check-circle',
      name: 'Check Circle',
      category: 'status',
      tags: ['success', 'complete', 'done', 'verified', 'approved', 'confirmed'],
      source: 'heroicons',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
    });
  }

  /**
   * Add icon to library
   */
  private addIcon(icon: IconDefinition): void {
    this.icons.set(icon.id, icon);

    // Update category map
    if (!this.categoryMap.has(icon.category)) {
      this.categoryMap.set(icon.category, []);
    }
    this.categoryMap.get(icon.category)!.push(icon.id);
  }

  /**
   * Search icons with context-aware scoring
   */
  searchIcons(options: IconSearchOptions): IconDefinition[] {
    let results = Array.from(this.icons.values());

    // Filter by category
    if (options.category) {
      results = results.filter(icon => icon.category === options.category);
    }

    // Search by query
    if (options.query) {
      const query = options.query.toLowerCase();
      results = results.filter(icon => {
        const searchText = `${icon.name} ${icon.category} ${icon.tags.join(' ')}`.toLowerCase();
        return searchText.includes(query);
      });
    }

    // Context-aware scoring
    if (options.context) {
      results = this.scoreByContext(results, options.context);
    }

    return results;
  }

  /**
   * Get icon by ID
   */
  getIcon(id: string): IconDefinition | undefined {
    return this.icons.get(id);
  }

  /**
   * Get icons by category
   */
  getIconsByCategory(category: string): IconDefinition[] {
    const iconIds = this.categoryMap.get(category) || [];
    return iconIds.map(id => this.icons.get(id)!).filter(Boolean);
  }

  /**
   * Get best match icon based on content context
   */
  getBestMatch(context: string): IconDefinition | null {
    const results = this.searchIcons({ context });
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Score icons based on context relevance
   */
  private scoreByContext(icons: IconDefinition[], context: string): IconDefinition[] {
    const contextTerms = context.toLowerCase().split(/\s+/);

    return icons
      .map(icon => {
        let score = 0;
        const iconText = `${icon.name} ${icon.category} ${icon.tags.join(' ')}`.toLowerCase();

        contextTerms.forEach(term => {
          if (iconText.includes(term)) {
            score += 2;
          }
          // Partial matches
          icon.tags.forEach(tag => {
            if (tag.includes(term) || term.includes(tag)) {
              score += 1;
            }
          });
        });

        return { icon, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ icon }) => icon);
  }

  /**
   * Get icon SVG with customization
   */
  getIconSVG(id: string, options?: { size?: number; color?: string; className?: string }): string {
    const icon = this.icons.get(id);
    if (!icon) return '';

    let svg = icon.svg;

    // Apply size
    if (options?.size) {
      svg = svg.replace(/width="[^"]*"/, `width="${options.size}"`);
      svg = svg.replace(/height="[^"]*"/, `height="${options.size}"`);
    }

    // Apply color
    if (options?.color) {
      svg = svg.replace(/stroke="currentColor"/, `stroke="${options.color}"`);
      svg = svg.replace(/fill="currentColor"/, `fill="${options.color}"`);
    }

    // Apply class
    if (options?.className) {
      svg = svg.replace(/<svg/, `<svg class="${options.className}"`);
    }

    return svg;
  }

  /**
   * Get all categories
   */
  getCategories(): string[] {
    return Array.from(this.categoryMap.keys());
  }

  /**
   * Get icon count
   */
  getIconCount(): number {
    return this.icons.size;
  }
}

export default IconManager;

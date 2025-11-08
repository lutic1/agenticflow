/**
 * Background Patterns & Textures (P1.2)
 * 20 subtle professional patterns for slide backgrounds
 * SVG-based, customizable colors, optimized performance
 */

export interface BackgroundPattern {
  name: string;
  category: PatternCategory;
  description: string;
  svg: string;
  defaultOpacity: number;
  recommended: 'light' | 'dark' | 'both';
}

export type PatternCategory =
  | 'geometric'
  | 'organic'
  | 'grid'
  | 'dots'
  | 'lines'
  | 'texture';

export interface PatternOptions {
  color?: string;
  opacity?: number;
  scale?: number;
  backgroundColor?: string;
}

/**
 * Background Pattern Library
 * Professional patterns for presentation slides
 */
export class BackgroundPatternLibrary {
  private patterns: Map<string, BackgroundPattern>;

  constructor() {
    this.patterns = new Map();
    this.initializePatterns();
  }

  /**
   * Initialize 20 professional patterns
   */
  private initializePatterns(): void {
    // Geometric Patterns (5)
    this.addPattern({
      name: 'hexagon-grid',
      category: 'geometric',
      description: 'Subtle hexagonal grid pattern',
      defaultOpacity: 0.05,
      recommended: 'both',
      svg: `
        <pattern id="hexagon-grid" width="56" height="100" patternUnits="userSpaceOnUse">
          <path d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100" fill="none" stroke="currentColor" stroke-width="1"/>
          <path d="M28 0L28 34L0 50L0 84L28 100L56 84L56 50L28 34" fill="none" stroke="currentColor" stroke-width="1"/>
        </pattern>
      `
    });

    this.addPattern({
      name: 'diamond-lattice',
      category: 'geometric',
      description: 'Diamond lattice pattern',
      defaultOpacity: 0.04,
      recommended: 'both',
      svg: `
        <pattern id="diamond-lattice" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M0 20 L20 0 L40 20 L20 40 Z" fill="none" stroke="currentColor" stroke-width="1"/>
          <path d="M20 0 L20 40 M0 20 L40 20" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.5"/>
        </pattern>
      `
    });

    this.addPattern({
      name: 'triangles',
      category: 'geometric',
      description: 'Geometric triangle pattern',
      defaultOpacity: 0.06,
      recommended: 'light',
      svg: `
        <pattern id="triangles" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M0 60 L30 0 L60 60 Z M30 0 L60 60 L90 0 Z" fill="none" stroke="currentColor" stroke-width="1"/>
        </pattern>
      `
    });

    this.addPattern({
      name: 'chevron',
      category: 'geometric',
      description: 'Chevron zigzag pattern',
      defaultOpacity: 0.05,
      recommended: 'both',
      svg: `
        <pattern id="chevron" width="100" height="50" patternUnits="userSpaceOnUse">
          <path d="M0 50 L25 0 L50 50 L75 0 L100 50" fill="none" stroke="currentColor" stroke-width="2"/>
        </pattern>
      `
    });

    this.addPattern({
      name: 'waves',
      category: 'geometric',
      description: 'Gentle wave pattern',
      defaultOpacity: 0.04,
      recommended: 'both',
      svg: `
        <pattern id="waves" width="100" height="20" patternUnits="userSpaceOnUse">
          <path d="M0 10 Q25 0 50 10 T100 10" fill="none" stroke="currentColor" stroke-width="1.5"/>
        </pattern>
      `
    });

    // Grid Patterns (4)
    this.addPattern({
      name: 'grid-simple',
      category: 'grid',
      description: 'Simple grid lines',
      defaultOpacity: 0.03,
      recommended: 'both',
      svg: `
        <pattern id="grid-simple" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" stroke-width="1"/>
        </pattern>
      `
    });

    this.addPattern({
      name: 'grid-blueprint',
      category: 'grid',
      description: 'Blueprint-style grid',
      defaultOpacity: 0.05,
      recommended: 'dark',
      svg: `
        <pattern id="grid-blueprint" width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" stroke-width="1"/>
          <path d="M 50 0 L 50 100 M 0 50 L 100 50" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.5"/>
        </pattern>
      `
    });

    this.addPattern({
      name: 'graph-paper',
      category: 'grid',
      description: 'Graph paper pattern',
      defaultOpacity: 0.04,
      recommended: 'light',
      svg: `
        <pattern id="graph-paper" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" stroke-width="0.5"/>
        </pattern>
      `
    });

    this.addPattern({
      name: 'isometric-grid',
      category: 'grid',
      description: 'Isometric grid pattern',
      defaultOpacity: 0.05,
      recommended: 'both',
      svg: `
        <pattern id="isometric-grid" width="40" height="69.28" patternUnits="userSpaceOnUse">
          <path d="M0 0 L20 34.64 L0 69.28 M40 0 L20 34.64 L40 69.28 M20 0 L20 69.28" fill="none" stroke="currentColor" stroke-width="1"/>
        </pattern>
      `
    });

    // Dot Patterns (4)
    this.addPattern({
      name: 'dots-small',
      category: 'dots',
      description: 'Small dot pattern',
      defaultOpacity: 0.06,
      recommended: 'both',
      svg: `
        <pattern id="dots-small" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
        </pattern>
      `
    });

    this.addPattern({
      name: 'dots-large',
      category: 'dots',
      description: 'Large dot pattern',
      defaultOpacity: 0.04,
      recommended: 'both',
      svg: `
        <pattern id="dots-large" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="3" fill="currentColor"/>
        </pattern>
      `
    });

    this.addPattern({
      name: 'polka-dots',
      category: 'dots',
      description: 'Polka dot pattern',
      defaultOpacity: 0.05,
      recommended: 'light',
      svg: `
        <pattern id="polka-dots" width="60" height="60" patternUnits="userSpaceOnUse">
          <circle cx="30" cy="30" r="8" fill="currentColor"/>
          <circle cx="0" cy="0" r="4" fill="currentColor"/>
          <circle cx="60" cy="60" r="4" fill="currentColor"/>
        </pattern>
      `
    });

    this.addPattern({
      name: 'circles-outline',
      category: 'dots',
      description: 'Outlined circle pattern',
      defaultOpacity: 0.05,
      recommended: 'both',
      svg: `
        <pattern id="circles-outline" width="50" height="50" patternUnits="userSpaceOnUse">
          <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="1"/>
        </pattern>
      `
    });

    // Line Patterns (4)
    this.addPattern({
      name: 'diagonal-lines',
      category: 'lines',
      description: 'Diagonal line pattern',
      defaultOpacity: 0.04,
      recommended: 'both',
      svg: `
        <pattern id="diagonal-lines" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="20" stroke="currentColor" stroke-width="1"/>
        </pattern>
      `
    });

    this.addPattern({
      name: 'crosshatch',
      category: 'lines',
      description: 'Crosshatch pattern',
      defaultOpacity: 0.05,
      recommended: 'both',
      svg: `
        <pattern id="crosshatch" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M0 0 L20 20 M20 0 L0 20" stroke="currentColor" stroke-width="1"/>
        </pattern>
      `
    });

    this.addPattern({
      name: 'horizontal-stripes',
      category: 'lines',
      description: 'Horizontal stripe pattern',
      defaultOpacity: 0.04,
      recommended: 'both',
      svg: `
        <pattern id="horizontal-stripes" width="100" height="10" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="100" y2="0" stroke="currentColor" stroke-width="1"/>
        </pattern>
      `
    });

    this.addPattern({
      name: 'vertical-stripes',
      category: 'lines',
      description: 'Vertical stripe pattern',
      defaultOpacity: 0.04,
      recommended: 'both',
      svg: `
        <pattern id="vertical-stripes" width="10" height="100" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="100" stroke="currentColor" stroke-width="1"/>
        </pattern>
      `
    });

    // Organic/Texture Patterns (3)
    this.addPattern({
      name: 'noise',
      category: 'texture',
      description: 'Subtle noise texture',
      defaultOpacity: 0.02,
      recommended: 'both',
      svg: `
        <pattern id="noise" width="100" height="100" patternUnits="userSpaceOnUse">
          <rect width="100" height="100" fill="currentColor" opacity="0.02"/>
          <circle cx="23" cy="47" r="0.5" fill="currentColor"/>
          <circle cx="67" cy="82" r="0.5" fill="currentColor"/>
          <circle cx="45" cy="12" r="0.5" fill="currentColor"/>
          <circle cx="89" cy="34" r="0.5" fill="currentColor"/>
          <circle cx="12" cy="91" r="0.5" fill="currentColor"/>
          <circle cx="56" cy="56" r="0.5" fill="currentColor"/>
          <circle cx="78" cy="23" r="0.5" fill="currentColor"/>
          <circle cx="34" cy="78" r="0.5" fill="currentColor"/>
        </pattern>
      `
    });

    this.addPattern({
      name: 'paper-texture',
      category: 'texture',
      description: 'Paper-like texture',
      defaultOpacity: 0.03,
      recommended: 'light',
      svg: `
        <pattern id="paper-texture" width="200" height="200" patternUnits="userSpaceOnUse">
          <rect width="200" height="200" fill="currentColor" opacity="0.01"/>
          <path d="M10 20 Q 30 10 50 20 T 90 20" stroke="currentColor" stroke-width="0.3" opacity="0.3"/>
          <path d="M20 120 Q 40 110 60 120 T 100 120" stroke="currentColor" stroke-width="0.3" opacity="0.3"/>
          <path d="M130 60 Q 150 50 170 60 T 190 60" stroke="currentColor" stroke-width="0.3" opacity="0.3"/>
        </pattern>
      `
    });

    this.addPattern({
      name: 'subtle-gradient',
      category: 'organic',
      description: 'Subtle organic gradient texture',
      defaultOpacity: 0.08,
      recommended: 'both',
      svg: `
        <pattern id="subtle-gradient" width="400" height="400" patternUnits="userSpaceOnUse">
          <defs>
            <radialGradient id="grad1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style="stop-color:currentColor;stop-opacity:0.1" />
              <stop offset="100%" style="stop-color:currentColor;stop-opacity:0" />
            </radialGradient>
          </defs>
          <circle cx="200" cy="200" r="200" fill="url(#grad1)"/>
        </pattern>
      `
    });
  }

  /**
   * Add pattern to library
   */
  private addPattern(pattern: BackgroundPattern): void {
    this.patterns.set(pattern.name, pattern);
  }

  /**
   * Get pattern by name
   */
  getPattern(name: string): BackgroundPattern | undefined {
    return this.patterns.get(name);
  }

  /**
   * Get all patterns
   */
  getAllPatterns(): BackgroundPattern[] {
    return Array.from(this.patterns.values());
  }

  /**
   * Get patterns by category
   */
  getByCategory(category: PatternCategory): BackgroundPattern[] {
    return this.getAllPatterns().filter(p => p.category === category);
  }

  /**
   * Search patterns
   */
  search(query: string): BackgroundPattern[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllPatterns().filter(
      p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Generate pattern CSS
   */
  generateCSS(
    patternName: string,
    options: PatternOptions = {}
  ): { svg: string; css: string } {
    const pattern = this.getPattern(patternName);
    if (!pattern) {
      return { svg: '', css: '' };
    }

    const {
      color = '#000000',
      opacity = pattern.defaultOpacity,
      scale = 1,
      backgroundColor = 'transparent'
    } = options;

    // Generate SVG with pattern definition
    const svg = `
<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${pattern.svg.replace(/currentColor/g, color)}
  </defs>
  <rect width="100%" height="100%" fill="${backgroundColor}"/>
  <rect width="100%" height="100%" fill="url(#${patternName})" opacity="${opacity}" style="transform: scale(${scale})"/>
</svg>
    `.trim();

    // Generate CSS
    const css = `
background-color: ${backgroundColor};
background-image: url('data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}');
background-size: ${scale * 100}% ${scale * 100}%;
background-repeat: repeat;
    `.trim();

    return { svg, css };
  }

  /**
   * Generate inline SVG background
   */
  generateInlineSVG(
    patternName: string,
    options: PatternOptions = {}
  ): string {
    const { svg } = this.generateCSS(patternName, options);
    return svg;
  }

  /**
   * Generate data URL
   */
  generateDataURL(
    patternName: string,
    options: PatternOptions = {}
  ): string {
    const { svg } = this.generateCSS(patternName, options);
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }

  /**
   * Get recommended patterns for background type
   */
  getRecommended(backgroundType: 'light' | 'dark'): BackgroundPattern[] {
    return this.getAllPatterns().filter(
      p => p.recommended === backgroundType || p.recommended === 'both'
    );
  }

  /**
   * Get all categories
   */
  getCategories(): PatternCategory[] {
    return ['geometric', 'organic', 'grid', 'dots', 'lines', 'texture'];
  }

  /**
   * Get pattern count
   */
  getCount(): number {
    return this.patterns.size;
  }

  /**
   * Get category stats
   */
  getStats(): Record<PatternCategory, number> {
    const stats: Record<string, number> = {};

    for (const category of this.getCategories()) {
      stats[category] = this.getByCategory(category).length;
    }

    return stats as Record<PatternCategory, number>;
  }
}

// Singleton instance
export const backgroundPatternLibrary = new BackgroundPatternLibrary();

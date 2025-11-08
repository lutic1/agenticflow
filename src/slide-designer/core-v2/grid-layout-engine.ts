/**
 * Grid Layout Engine (V2)
 * 12-column CSS Grid system with 8-point spacing
 * Replaces string-based positioning with modern grid layouts
 */

export interface GridSystem {
  columns: 12;
  gutter: number;      // 24px (3 × 8pt base)
  margin: number;      // 48px (6 × 8pt base)
  baseUnit: 8;         // 8-point spacing system

  breakpoints: {
    mobile: 768;
    tablet: 1024;
    desktop: 1920;
  };
}

export interface GridLayout {
  name: string;
  description: string;

  // Grid areas
  areas: {
    title?: GridArea;
    subtitle?: GridArea;
    content?: GridArea;
    image?: GridArea;
    footer?: GridArea;
  };

  // Whitespace target
  whitespacePercent: number; // Target 40-60%

  // Constraints
  constraints: {
    minTextWidth: number;    // 200px minimum for readability
    maxTextWidth: number;    // 600px optimal (~75 chars)
    minImageSize: number;    // 300px minimum
  };
}

export interface GridArea {
  gridColumn: string;  // e.g., "1 / span 6" or "7 / span 6"
  gridRow: string;     // e.g., "1 / span 2"
  justifySelf?: 'start' | 'center' | 'end' | 'stretch';
  alignSelf?: 'start' | 'center' | 'end' | 'stretch';
}

export interface ContentAnalysis {
  wordCount: number;
  bulletCount: number;
  hasImage: boolean;
  hasChart: boolean;
  slideType: 'title' | 'content' | 'image-focus' | 'data' | 'closing';
  complexity: 'simple' | 'medium' | 'complex';
}

export interface LayoutValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  whitespacePercent: number;
  score: number; // 0-100
}

/**
 * Grid Layout Engine
 * Intelligently selects and generates CSS Grid layouts based on content analysis
 */
export class GridLayoutEngine {
  private grid: GridSystem = {
    columns: 12,
    gutter: 24,
    margin: 48,
    baseUnit: 8,
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1920
    }
  };

  // Pre-defined layout templates
  private layouts: Record<string, GridLayout> = {
    'title-centered': {
      name: 'Title Centered',
      description: 'Centered title and subtitle for opening slides',
      areas: {
        title: {
          gridColumn: '3 / span 8',    // 8 columns centered
          gridRow: '2 / span 1',
          justifySelf: 'center',
          alignSelf: 'center'
        },
        subtitle: {
          gridColumn: '3 / span 8',
          gridRow: '3 / span 1',
          justifySelf: 'center',
          alignSelf: 'start'
        }
      },
      whitespacePercent: 60,
      constraints: {
        minTextWidth: 200,
        maxTextWidth: 800,
        minImageSize: 0
      }
    },

    'split-50-50': {
      name: 'Split 50/50',
      description: 'Equal split for content and image',
      areas: {
        content: {
          gridColumn: '1 / span 6',    // Left half
          gridRow: '1 / span 4',
          justifySelf: 'start',
          alignSelf: 'start'
        },
        image: {
          gridColumn: '7 / span 6',    // Right half
          gridRow: '1 / span 4',
          justifySelf: 'center',
          alignSelf: 'center'
        }
      },
      whitespacePercent: 40,
      constraints: {
        minTextWidth: 300,
        maxTextWidth: 600,
        minImageSize: 400
      }
    },

    'hero-70-30': {
      name: 'Hero Image 70/30',
      description: 'Large image (70%) with supporting text (30%)',
      areas: {
        image: {
          gridColumn: '1 / span 8',    // 70% width
          gridRow: '1 / span 4',
          justifySelf: 'center',
          alignSelf: 'center'
        },
        content: {
          gridColumn: '9 / span 4',    // 30% width
          gridRow: '1 / span 4',
          justifySelf: 'start',
          alignSelf: 'center'
        }
      },
      whitespacePercent: 35,
      constraints: {
        minTextWidth: 200,
        maxTextWidth: 400,
        minImageSize: 600
      }
    },

    'content-focused': {
      name: 'Content Focused',
      description: 'Full-width content with generous margins',
      areas: {
        title: {
          gridColumn: '2 / span 10',   // 10/12 columns
          gridRow: '1 / span 1',
          justifySelf: 'start',
          alignSelf: 'start'
        },
        content: {
          gridColumn: '2 / span 10',
          gridRow: '2 / span 3',
          justifySelf: 'start',
          alignSelf: 'start'
        }
      },
      whitespacePercent: 45,
      constraints: {
        minTextWidth: 400,
        maxTextWidth: 800,
        minImageSize: 0
      }
    },

    'sidebar-content': {
      name: 'Sidebar + Content',
      description: '33/67 split for sidebar and main content',
      areas: {
        content: {
          gridColumn: '1 / span 4',    // Sidebar (33%)
          gridRow: '1 / span 4',
          justifySelf: 'start',
          alignSelf: 'start'
        },
        image: {
          gridColumn: '5 / span 8',    // Main (67%)
          gridRow: '1 / span 4',
          justifySelf: 'start',
          alignSelf: 'start'
        }
      },
      whitespacePercent: 40,
      constraints: {
        minTextWidth: 250,
        maxTextWidth: 700,
        minImageSize: 500
      }
    },

    'two-column': {
      name: 'Two Column',
      description: 'Two equal columns for balanced content',
      areas: {
        content: {
          gridColumn: '1 / span 6',
          gridRow: '2 / span 3',
          justifySelf: 'start',
          alignSelf: 'start'
        },
        image: {
          gridColumn: '7 / span 6',
          gridRow: '2 / span 3',
          justifySelf: 'start',
          alignSelf: 'start'
        },
        title: {
          gridColumn: '1 / span 12',
          gridRow: '1 / span 1',
          justifySelf: 'start',
          alignSelf: 'start'
        }
      },
      whitespacePercent: 40,
      constraints: {
        minTextWidth: 300,
        maxTextWidth: 550,
        minImageSize: 0
      }
    }
  };

  /**
   * Analyze content to determine optimal layout
   */
  analyzeContent(content: {
    text: string;
    hasImage?: boolean;
    hasChart?: boolean;
    bulletPoints?: string[];
  }): ContentAnalysis {
    const wordCount = content.text.split(/\s+/).length;
    const bulletCount = content.bulletPoints?.length || 0;
    const hasImage = content.hasImage || false;
    const hasChart = content.hasChart || false;

    // Determine slide type
    let slideType: ContentAnalysis['slideType'] = 'content';
    if (wordCount < 20 && !bulletCount) {
      slideType = 'title';
    } else if (hasChart) {
      slideType = 'data';
    } else if (hasImage && wordCount < 50) {
      slideType = 'image-focus';
    } else if (wordCount < 10 && !hasImage) {
      slideType = 'closing';
    }

    // Determine complexity
    let complexity: ContentAnalysis['complexity'] = 'simple';
    if (wordCount > 75 || bulletCount > 5) {
      complexity = 'complex';
    } else if (wordCount > 40 || bulletCount > 3) {
      complexity = 'medium';
    }

    return {
      wordCount,
      bulletCount,
      hasImage,
      hasChart,
      slideType,
      complexity
    };
  }

  /**
   * Select optimal layout based on content analysis
   */
  selectLayout(
    analysis: ContentAnalysis,
    slidePosition: number,
    totalSlides: number
  ): GridLayout {
    // First slide: title-centered
    if (slidePosition === 0) {
      return this.layouts['title-centered'];
    }

    // Last slide: title-centered (closing)
    if (slidePosition === totalSlides - 1) {
      return this.layouts['title-centered'];
    }

    // Image-focused slide (image dominates)
    if (analysis.hasImage && analysis.wordCount < 50) {
      return this.layouts['hero-70-30'];
    }

    // Balanced split (medium text + image)
    if (analysis.hasImage && analysis.wordCount >= 50 && analysis.wordCount <= 100) {
      return this.layouts['split-50-50'];
    }

    // Two-column layout (many bullets or complex content)
    if (analysis.bulletCount >= 5 || analysis.complexity === 'complex') {
      return this.layouts['two-column'];
    }

    // Sidebar layout (image + moderate text)
    if (analysis.hasImage && analysis.wordCount > 100) {
      return this.layouts['sidebar-content'];
    }

    // Default: content-focused
    return this.layouts['content-focused'];
  }

  /**
   * Generate CSS for grid layout
   */
  generateCSS(layout: GridLayout, slideId: string): string {
    const css = `
/* Grid Layout: ${layout.name} */
#${slideId} {
  display: grid;
  grid-template-columns: repeat(${this.grid.columns}, 1fr);
  grid-template-rows: auto;
  gap: ${this.grid.gutter}px;
  padding: ${this.grid.margin}px;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

${layout.areas.title ? this.generateAreaCSS(slideId, 'title', layout.areas.title) : ''}
${layout.areas.subtitle ? this.generateAreaCSS(slideId, 'subtitle', layout.areas.subtitle) : ''}
${layout.areas.content ? this.generateAreaCSS(slideId, 'content', layout.areas.content) : ''}
${layout.areas.image ? this.generateAreaCSS(slideId, 'image', layout.areas.image) : ''}
${layout.areas.footer ? this.generateAreaCSS(slideId, 'footer', layout.areas.footer) : ''}

/* Responsive behavior */
@media (max-width: ${this.grid.breakpoints.tablet}px) {
  #${slideId} {
    grid-template-columns: repeat(6, 1fr);
  }

  #${slideId} .title,
  #${slideId} .subtitle,
  #${slideId} .content,
  #${slideId} .image {
    grid-column: 1 / span 6 !important;
  }
}

@media (max-width: ${this.grid.breakpoints.mobile}px) {
  #${slideId} {
    padding: ${this.grid.margin / 2}px;
    gap: ${this.grid.gutter / 2}px;
  }
}
`;
    return css.trim();
  }

  /**
   * Generate CSS for a specific grid area
   */
  private generateAreaCSS(slideId: string, area: string, gridArea: GridArea): string {
    return `
#${slideId} .${area} {
  grid-column: ${gridArea.gridColumn};
  grid-row: ${gridArea.gridRow};
  ${gridArea.justifySelf ? `justify-self: ${gridArea.justifySelf};` : ''}
  ${gridArea.alignSelf ? `align-self: ${gridArea.alignSelf};` : ''}
}
`;
  }

  /**
   * Calculate whitespace percentage
   */
  calculateWhitespace(layout: GridLayout, contentAreas: number): number {
    const slideArea = 1920 * 1080; // Standard slide dimensions
    const marginArea = this.grid.margin * 2 * (1920 + 1080); // Perimeter
    const gutterArea = this.grid.gutter * contentAreas * 100; // Rough estimate

    const occupiedPercent = ((slideArea - marginArea - gutterArea) / slideArea) * 100;
    return 100 - occupiedPercent;
  }

  /**
   * Validate layout against constraints
   */
  validate(layout: GridLayout, analysis: ContentAnalysis): LayoutValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Check text width constraints
    if (layout.constraints.minTextWidth < 200) {
      errors.push(`Text area too narrow (${layout.constraints.minTextWidth}px, minimum 200px)`);
      score -= 20;
    }

    if (layout.constraints.maxTextWidth > 800) {
      warnings.push(`Text area very wide (${layout.constraints.maxTextWidth}px, optimal ≤800px)`);
      score -= 5;
    }

    // Check whitespace
    const whitespace = layout.whitespacePercent;
    if (whitespace < 40) {
      errors.push(`Insufficient whitespace (${whitespace}%, need ≥40%)`);
      score -= 15;
    } else if (whitespace > 70) {
      warnings.push(`Too much whitespace (${whitespace}%, optimal 40-60%)`);
      score -= 5;
    }

    // Check image constraints
    if (analysis.hasImage && layout.constraints.minImageSize < 300) {
      warnings.push(`Image area small (${layout.constraints.minImageSize}px, recommended ≥300px)`);
      score -= 5;
    }

    // Check content density
    if (analysis.wordCount > 75 && layout.name === 'content-focused') {
      errors.push(`Too much text (${analysis.wordCount} words) for single-column layout`);
      score -= 10;
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      whitespacePercent: whitespace,
      score: Math.max(0, score)
    };
  }

  /**
   * Get layout by name
   */
  getLayout(name: string): GridLayout | undefined {
    return this.layouts[name];
  }

  /**
   * Get all available layouts
   */
  getAvailableLayouts(): GridLayout[] {
    return Object.values(this.layouts);
  }

  /**
   * Get grid system configuration
   */
  getGridSystem(): GridSystem {
    return { ...this.grid };
  }
}

// Singleton instance
export const gridLayoutEngine = new GridLayoutEngine();

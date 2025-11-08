/**
 * Design Configuration and Rules
 * Intelligent design decisions for layout, typography, and visual hierarchy
 */

import { Theme, LayoutType, ColorScheme, Typography, Spacing } from '../types/index.js';

/**
 * Predefined professional themes
 */
export const THEMES: Record<string, Theme> = {
  professional: {
    name: 'Professional',
    colors: {
      primary: '#2c3e50',
      secondary: '#34495e',
      accent: '#3498db',
      background: '#ffffff',
      text: '#2c3e50',
      textSecondary: '#7f8c8d',
      border: '#ecf0f1',
    },
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      headingFont: "'Inter', sans-serif",
      baseSize: '18px',
      lineHeight: 1.6,
      headingSizes: {
        h1: '48px',
        h2: '36px',
        h3: '28px',
      },
      weights: {
        normal: 400,
        medium: 500,
        bold: 700,
      },
    },
    spacing: {
      base: '16px',
      small: '8px',
      medium: '24px',
      large: '48px',
      xlarge: '64px',
    },
    effects: {
      shadows: true,
      gradients: false,
      borderRadius: '8px',
      animations: true,
    },
  },

  modern: {
    name: 'Modern',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#ec4899',
      background: '#0f172a',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      border: '#1e293b',
    },
    typography: {
      fontFamily: "'Poppins', -apple-system, sans-serif",
      headingFont: "'Poppins', sans-serif",
      baseSize: '20px',
      lineHeight: 1.7,
      headingSizes: {
        h1: '56px',
        h2: '40px',
        h3: '32px',
      },
      weights: {
        normal: 400,
        medium: 600,
        bold: 700,
      },
    },
    spacing: {
      base: '16px',
      small: '12px',
      medium: '32px',
      large: '56px',
      xlarge: '80px',
    },
    effects: {
      shadows: true,
      gradients: true,
      borderRadius: '12px',
      animations: true,
    },
  },

  minimal: {
    name: 'Minimal',
    colors: {
      primary: '#000000',
      secondary: '#404040',
      accent: '#808080',
      background: '#ffffff',
      text: '#000000',
      textSecondary: '#666666',
      border: '#e0e0e0',
    },
    typography: {
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      headingFont: "'Helvetica Neue', sans-serif",
      baseSize: '18px',
      lineHeight: 1.8,
      headingSizes: {
        h1: '52px',
        h2: '38px',
        h3: '30px',
      },
      weights: {
        normal: 300,
        medium: 400,
        bold: 600,
      },
    },
    spacing: {
      base: '20px',
      small: '10px',
      medium: '40px',
      large: '60px',
      xlarge: '100px',
    },
    effects: {
      shadows: false,
      gradients: false,
      borderRadius: '0px',
      animations: false,
    },
  },

  vibrant: {
    name: 'Vibrant',
    colors: {
      primary: '#ff6b6b',
      secondary: '#4ecdc4',
      accent: '#ffe66d',
      background: '#f7fff7',
      text: '#1a1a2e',
      textSecondary: '#16213e',
      border: '#e8f8f5',
    },
    typography: {
      fontFamily: "'Nunito', -apple-system, sans-serif",
      headingFont: "'Nunito', sans-serif",
      baseSize: '19px',
      lineHeight: 1.65,
      headingSizes: {
        h1: '54px',
        h2: '42px',
        h3: '32px',
      },
      weights: {
        normal: 400,
        medium: 600,
        bold: 800,
      },
    },
    spacing: {
      base: '18px',
      small: '10px',
      medium: '28px',
      large: '52px',
      xlarge: '72px',
    },
    effects: {
      shadows: true,
      gradients: true,
      borderRadius: '16px',
      animations: true,
    },
  },
};

/**
 * Layout decision rules
 * These guide when to use each layout type
 */
export interface LayoutRule {
  layoutType: LayoutType;
  conditions: {
    wordCountMin?: number;
    wordCountMax?: number;
    hasLists?: boolean;
    hasQuotes?: boolean;
    hasCode?: boolean;
    requiresImage?: boolean;
    slidePosition?: 'first' | 'last' | 'middle' | 'any';
  };
  priority: number;
  description: string;
}

export const LAYOUT_RULES: LayoutRule[] = [
  {
    layoutType: 'title-slide',
    conditions: {
      slidePosition: 'first',
      wordCountMax: 30,
    },
    priority: 10,
    description: 'Title slide for presentation opening',
  },
  {
    layoutType: 'section-header',
    conditions: {
      wordCountMax: 20,
      hasLists: false,
    },
    priority: 8,
    description: 'Section divider with minimal text',
  },
  {
    layoutType: 'quote',
    conditions: {
      hasQuotes: true,
      wordCountMax: 50,
    },
    priority: 9,
    description: 'Highlight important quotes or statements',
  },
  {
    layoutType: 'bullet-points',
    conditions: {
      hasLists: true,
      wordCountMin: 30,
      wordCountMax: 150,
    },
    priority: 7,
    description: 'List-based content with clear hierarchy',
  },
  {
    layoutType: 'content-image-split',
    conditions: {
      requiresImage: true,
      wordCountMin: 50,
      wordCountMax: 200,
    },
    priority: 6,
    description: 'Balanced layout with text and visual',
  },
  {
    layoutType: 'image-focus',
    conditions: {
      requiresImage: true,
      wordCountMax: 50,
    },
    priority: 7,
    description: 'Image-centric slide with minimal text',
  },
  {
    layoutType: 'two-column',
    conditions: {
      hasLists: true,
      wordCountMin: 100,
    },
    priority: 5,
    description: 'Two-column layout for comparison or extensive content',
  },
  {
    layoutType: 'comparison',
    conditions: {
      hasLists: true,
      wordCountMin: 60,
    },
    priority: 6,
    description: 'Side-by-side comparison of concepts',
  },
  {
    layoutType: 'content-only',
    conditions: {
      wordCountMin: 40,
      wordCountMax: 150,
      hasLists: false,
    },
    priority: 4,
    description: 'Text-focused slide without visuals',
  },
];

/**
 * Design intelligence rules
 */
export const DESIGN_RULES = {
  // When to use images vs icons
  imageVsIcon: {
    useImage: {
      conditions: [
        'Content is descriptive or narrative',
        'Need to show real-world examples',
        'Slide has substantial whitespace',
        'Topic is concrete and visual',
      ],
      minWordCount: 50,
    },
    useIcon: {
      conditions: [
        'Content is conceptual or abstract',
        'Limited space available',
        'Multiple small visuals needed',
        'Minimalist design preference',
      ],
      maxWordCount: 100,
    },
  },

  // Typography hierarchy
  typography: {
    maxLinesPerSlide: 7,
    maxWordsPerLine: 12,
    maxBulletPoints: 5,
    minFontSize: '16px',
    headingToBodyRatio: 2,
  },

  // Whitespace optimization
  whitespace: {
    minMargin: '5%',
    contentAreaMax: '85%',
    optimalLineLength: '60-75 characters',
    spacingMultiplier: 1.5,
  },

  // Color scheme selection
  colorSelection: {
    formal: ['professional', 'minimal'],
    casual: ['vibrant', 'modern'],
    technical: ['professional', 'modern'],
  },

  // Asset placement
  assetPlacement: {
    image: {
      preferred: ['right', 'left', 'background'],
      minSize: '30%',
      maxSize: '60%',
    },
    icon: {
      preferred: ['top', 'left', 'center'],
      minSize: '48px',
      maxSize: '128px',
    },
  },
} as const;

/**
 * Box/Container placement logic
 */
export const CONTAINER_RULES = {
  contentBox: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: 'auto',
  },
  imageContainer: {
    aspectRatios: {
      landscape: '16:9',
      portrait: '9:16',
      square: '1:1',
    },
    objectFit: ['cover', 'contain', 'fill'],
  },
  gridLayout: {
    columns: {
      min: 1,
      max: 3,
      optimal: 2,
    },
    gap: '1.5rem',
  },
} as const;

/**
 * Animation and transition settings
 */
export const ANIMATION_SETTINGS = {
  transitions: {
    duration: '0.5s',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    types: ['fade', 'slide', 'zoom', 'none'],
  },
  entranceAnimations: {
    title: 'fadeInUp',
    content: 'fadeIn',
    image: 'fadeInRight',
    list: 'fadeInUp stagger',
  },
} as const;

/**
 * Get theme by name or return default
 */
export function getTheme(themeName?: string): Theme {
  if (!themeName || !THEMES[themeName]) {
    return THEMES.professional;
  }
  return THEMES[themeName];
}

/**
 * Select theme based on tone and topic
 */
export function selectThemeByContext(tone: string, topic?: string): Theme {
  const toneMap: Record<string, string> = {
    formal: 'professional',
    casual: 'vibrant',
    technical: 'modern',
  };

  const themeName = toneMap[tone] || 'professional';
  return THEMES[themeName];
}

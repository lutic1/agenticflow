/**
 * Slide Designer - Layout Decision Engine
 *
 * This module implements the core layout decision logic for the slide designer.
 * It analyzes slide content and makes intelligent decisions about:
 * - Layout type selection
 * - Visual element placement
 * - White space calculation
 * - Color scheme application
 * - Typography rules
 */

import type { SlideContent, SlideDesign, LayoutType, VisualElement, SpacingRules, ColorPalette } from '../types';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const LAYOUT_THRESHOLDS = {
  MINIMAL_WORD_COUNT: 20,
  BALANCED_WORD_COUNT: 50,
  TEXT_HEAVY_WORD_COUNT: 100,
  MAX_BULLETS_OPTIMAL: 6,
  MAX_BULLETS_ABSOLUTE: 8,
  SPLIT_THRESHOLD: 7
} as const;

const SPACING_PRESETS = {
  generous: {
    topPadding: '80px',
    bottomPadding: '80px',
    leftPadding: '100px',
    rightPadding: '100px',
    elementGap: '40px',
    lineHeight: 1.6
  },
  standard: {
    topPadding: '60px',
    bottomPadding: '60px',
    leftPadding: '80px',
    rightPadding: '80px',
    elementGap: '30px',
    lineHeight: 1.5
  },
  compact: {
    topPadding: '40px',
    bottomPadding: '40px',
    leftPadding: '60px',
    rightPadding: '60px',
    elementGap: '20px',
    lineHeight: 1.4
  }
} as const;

const COLOR_PALETTES: Record<string, ColorPalette> = {
  professional: {
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#0ea5e9',
    background: '#ffffff',
    text: '#1e293b',
    heading: '#0f172a',
    muted: '#94a3b8'
  },
  creative: {
    primary: '#8b5cf6',
    secondary: '#ec4899',
    accent: '#f59e0b',
    background: '#fef3c7',
    text: '#44403c',
    heading: '#292524',
    muted: '#78716c'
  },
  minimal: {
    primary: '#000000',
    secondary: '#737373',
    accent: '#a3a3a3',
    background: '#ffffff',
    text: '#262626',
    heading: '#000000',
    muted: '#a3a3a3'
  },
  academic: {
    primary: '#1e40af',
    secondary: '#475569',
    accent: '#059669',
    background: '#f8fafc',
    text: '#334155',
    heading: '#1e293b',
    muted: '#64748b'
  },
  dark: {
    primary: '#60a5fa',
    secondary: '#94a3b8',
    accent: '#34d399',
    background: '#0f172a',
    text: '#e2e8f0',
    heading: '#f1f5f9',
    muted: '#64748b'
  }
};

// ============================================================================
// CORE LAYOUT DECISION ENGINE
// ============================================================================

/**
 * Main layout decision function
 * Analyzes slide content and returns appropriate layout type
 */
export function decideLayout(slide: SlideContent, slideIndex: number, totalSlides: number): LayoutType {
  // Special cases based on slide type
  if (slide.type === 'title') {
    return 'title-centered';
  }

  if (slide.type === 'section') {
    return 'full-image-overlay';
  }

  if (slide.type === 'conclusion') {
    return 'title-centered';
  }

  // Analyze content characteristics
  const wordCount = countWords(slide.content);
  const bulletCount = slide.content.length;
  const hasStatisticalData = detectStatisticalContent(slide.content);
  const hasProcess = detectProcessContent(slide.content);
  const hasComparison = detectComparisonContent(slide.content);

  // Decision tree based on content analysis

  // Statistical data → Grid layout with charts
  if (hasStatisticalData) {
    return 'grid-layout';
  }

  // Process/steps → Vertical flow
  if (hasProcess) {
    return 'title-left-content-right';
  }

  // Comparison → Split layout
  if (hasComparison) {
    return 'split-content';
  }

  // Too many bullets → Error (should be split)
  if (bulletCount >= LAYOUT_THRESHOLDS.SPLIT_THRESHOLD) {
    throw new Error(`Slide "${slide.title}" has too many bullets (${bulletCount}). Split into multiple slides.`);
  }

  // Word count based decisions
  if (wordCount < LAYOUT_THRESHOLDS.MINIMAL_WORD_COUNT) {
    return bulletCount <= 3 ? 'visual-dominant' : 'title-left-content-right';
  }

  if (wordCount < LAYOUT_THRESHOLDS.BALANCED_WORD_COUNT) {
    return 'title-left-content-right';
  }

  if (wordCount < LAYOUT_THRESHOLDS.TEXT_HEAVY_WORD_COUNT) {
    return 'text-heavy';
  }

  // Default to text-heavy for content-rich slides
  return 'text-heavy';
}

/**
 * Decide visual elements for a slide
 */
export function decideVisualElements(
  slide: SlideContent,
  layout: LayoutType
): VisualElement[] {
  const elements: VisualElement[] = [];

  switch (layout) {
    case 'title-centered':
      elements.push({
        type: 'image',
        placement: 'background',
        size: 'full',
        query: slide.title,
        style: 'hero'
      });
      break;

    case 'full-image-overlay':
      elements.push({
        type: 'image',
        placement: 'background',
        size: 'full',
        query: slide.title,
        style: 'section-divider'
      });
      break;

    case 'visual-dominant':
      elements.push({
        type: 'image',
        placement: 'foreground',
        size: 'large',
        query: slide.title,
        style: 'featured'
      });
      break;

    case 'title-left-content-right':
      elements.push({
        type: 'image',
        placement: 'foreground',
        size: 'medium',
        query: slide.title,
        style: 'supporting'
      });
      break;

    case 'text-heavy':
      // Use icons instead of images for text-heavy slides
      slide.content.forEach((bullet, index) => {
        elements.push({
          type: 'icon',
          placement: 'inline',
          size: 'small',
          query: extractKeyword(bullet),
          style: 'bullet-icon'
        });
      });
      break;

    case 'grid-layout':
      elements.push({
        type: 'chart',
        placement: 'foreground',
        size: 'large',
        query: slide.title,
        style: 'data-visualization'
      });
      break;

    case 'split-content':
      // Two images for comparison
      elements.push({
        type: 'image',
        placement: 'foreground',
        size: 'medium',
        query: slide.content[0] || slide.title,
        style: 'comparison-left'
      });
      elements.push({
        type: 'image',
        placement: 'foreground',
        size: 'medium',
        query: slide.content[1] || slide.title,
        style: 'comparison-right'
      });
      break;
  }

  return elements;
}

/**
 * Calculate optimal spacing for a slide
 */
export function calculateSpacing(slide: SlideContent, layout: LayoutType): SpacingRules {
  const wordCount = countWords(slide.content);
  const bulletCount = slide.content.length;

  // Title and section slides get generous spacing
  if (layout === 'title-centered' || layout === 'full-image-overlay') {
    return SPACING_PRESETS.generous;
  }

  // Visual-dominant slides get generous spacing
  if (layout === 'visual-dominant') {
    return SPACING_PRESETS.generous;
  }

  // Text-heavy slides get compact spacing
  if (layout === 'text-heavy' || wordCount > LAYOUT_THRESHOLDS.BALANCED_WORD_COUNT) {
    return SPACING_PRESETS.compact;
  }

  // Default to standard spacing
  return SPACING_PRESETS.standard;
}

/**
 * Select color palette based on domain and theme
 */
export function selectColorPalette(
  domain: string,
  theme?: string,
  brandColors?: Partial<ColorPalette>
): ColorPalette {
  // If brand colors provided, merge with closest preset
  if (brandColors) {
    const baseTheme = theme || 'professional';
    const basePalette = COLOR_PALETTES[baseTheme] || COLOR_PALETTES.professional;
    return { ...basePalette, ...brandColors };
  }

  // Select preset based on theme
  if (theme && COLOR_PALETTES[theme]) {
    return COLOR_PALETTES[theme];
  }

  // Infer theme from domain
  const inferredTheme = inferThemeFromDomain(domain);
  return COLOR_PALETTES[inferredTheme];
}

/**
 * Generate complete slide design
 */
export function generateSlideDesign(
  slide: SlideContent,
  slideIndex: number,
  totalSlides: number,
  colorPalette: ColorPalette
): SlideDesign {
  const layout = decideLayout(slide, slideIndex, totalSlides);
  const visualElements = decideVisualElements(slide, layout);
  const spacing = calculateSpacing(slide, layout);
  const typography = selectTypography(layout, slide.content.length);

  return {
    slideId: slide.id,
    layout,
    visualElements,
    spacing,
    colorScheme: extractColorScheme(colorPalette, layout),
    typography
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Count total words in content array
 */
function countWords(content: string[]): number {
  return content.reduce((total, text) => {
    return total + text.split(/\s+/).filter(word => word.length > 0).length;
  }, 0);
}

/**
 * Detect if content contains statistical data
 */
function detectStatisticalContent(content: string[]): boolean {
  const statisticalPatterns = [
    /\d+%/,                    // Percentages
    /\$[\d,]+/,                // Money amounts
    /\d+\.\d+/,                // Decimals
    /\d+x/i,                   // Multipliers
    /increase|decrease|growth|decline/i,
    /compared to|versus|vs\./i
  ];

  return content.some(text =>
    statisticalPatterns.some(pattern => pattern.test(text))
  );
}

/**
 * Detect if content describes a process
 */
function detectProcessContent(content: string[]): boolean {
  const processPatterns = [
    /^(first|second|third|then|next|finally)/i,
    /^step \d+/i,
    /^phase \d+/i,
    /^stage \d+/i,
    /^\d+\./
  ];

  const matchCount = content.filter(text =>
    processPatterns.some(pattern => pattern.test(text.trim()))
  ).length;

  // If 50%+ bullets match process patterns, it's a process slide
  return matchCount >= content.length / 2;
}

/**
 * Detect if content is comparing two things
 */
function detectComparisonContent(content: string[]): boolean {
  const comparisonKeywords = [
    'versus', 'vs.', 'vs', 'compared to', 'different from',
    'better than', 'worse than', 'instead of', 'rather than',
    'advantage', 'disadvantage', 'pro', 'con', 'benefit', 'drawback'
  ];

  const text = content.join(' ').toLowerCase();
  return comparisonKeywords.some(keyword => text.includes(keyword));
}

/**
 * Extract key keyword from text for icon/image search
 */
function extractKeyword(text: string): string {
  // Remove common words
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this',
    'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their'
  ]);

  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));

  // Return first significant word
  return words[0] || text.split(' ')[0];
}

/**
 * Infer theme from domain/topic
 */
function inferThemeFromDomain(domain: string): string {
  const domainLower = domain.toLowerCase();

  if (domainLower.includes('business') || domainLower.includes('corporate')) {
    return 'professional';
  }

  if (domainLower.includes('creative') || domainLower.includes('design') || domainLower.includes('art')) {
    return 'creative';
  }

  if (domainLower.includes('academic') || domainLower.includes('research') || domainLower.includes('science')) {
    return 'academic';
  }

  if (domainLower.includes('tech') || domainLower.includes('developer')) {
    return 'minimal';
  }

  // Default
  return 'professional';
}

/**
 * Select typography rules based on layout and content
 */
function selectTypography(layout: LayoutType, bulletCount: number) {
  const baseTypography = {
    titleFont: 'Inter, system-ui, sans-serif',
    bodyFont: 'Inter, system-ui, sans-serif',
    titleSize: '48px',
    titleWeight: 700,
    bodySize: '24px',
    bodyWeight: 400,
    lineHeight: 1.5
  };

  // Adjust for title slides
  if (layout === 'title-centered' || layout === 'full-image-overlay') {
    return {
      ...baseTypography,
      titleSize: '72px',
      titleWeight: 800
    };
  }

  // Adjust for text-heavy slides
  if (layout === 'text-heavy' || bulletCount > 5) {
    return {
      ...baseTypography,
      titleSize: '42px',
      bodySize: '20px'
    };
  }

  return baseTypography;
}

/**
 * Extract relevant colors from palette for specific layout
 */
function extractColorScheme(palette: ColorPalette, layout: LayoutType): string[] {
  switch (layout) {
    case 'title-centered':
    case 'full-image-overlay':
      return [palette.background, palette.heading, palette.primary];

    case 'visual-dominant':
      return [palette.background, palette.primary, palette.accent];

    case 'text-heavy':
      return [palette.background, palette.text, palette.heading, palette.muted];

    default:
      return [palette.background, palette.primary, palette.text, palette.accent];
  }
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate that slide content meets best practices
 */
export function validateSlideContent(slide: SlideContent): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  // Check bullet count
  if (slide.content.length > LAYOUT_THRESHOLDS.MAX_BULLETS_OPTIMAL) {
    warnings.push(`Slide has ${slide.content.length} bullets. Consider splitting into multiple slides.`);
  }

  // Check bullet length
  slide.content.forEach((bullet, index) => {
    const wordCount = bullet.split(/\s+/).length;
    if (wordCount > 15) {
      warnings.push(`Bullet ${index + 1} is too long (${wordCount} words). Keep bullets under 15 words.`);
    }
  });

  // Check title length
  const titleWords = slide.title.split(/\s+/).length;
  if (titleWords > 10) {
    warnings.push(`Title is too long (${titleWords} words). Keep titles under 10 words.`);
  }

  const valid = warnings.length === 0;
  return { valid, warnings };
}

/**
 * Suggest improvements for slide content
 */
export function suggestImprovements(slide: SlideContent): string[] {
  const suggestions: string[] = [];

  const wordCount = countWords(slide.content);
  const bulletCount = slide.content.length;

  if (bulletCount === 1) {
    suggestions.push('Consider adding 2-3 more points to balance the slide.');
  }

  if (wordCount > 100) {
    suggestions.push('Content is dense. Consider visual elements or splitting into multiple slides.');
  }

  if (wordCount < 15 && bulletCount < 3) {
    suggestions.push('Slide feels empty. Add more context or use a larger visual element.');
  }

  return suggestions;
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  COLOR_PALETTES,
  LAYOUT_THRESHOLDS,
  SPACING_PRESETS
};

export type {
  LayoutType,
  VisualElement,
  SpacingRules,
  ColorPalette
};

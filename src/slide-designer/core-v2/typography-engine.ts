/**
 * Typography Engine (V2)
 * Responsive type scale using Major Third ratio (1.250)
 * Replaces fixed pixel sizes with intelligent, responsive typography
 */

export interface TypeScale {
  xs: 12;      // Fine print, captions (1.250^-2)
  sm: 15;      // Small body text (1.250^-1)
  base: 18;    // Body text (1.250^0) - WCAG minimum
  md: 22;      // Large body (1.250^1)
  lg: 28;      // Subtitle, H3 (1.250^2)
  xl: 35;      // Section headers, H2 (1.250^3)
  '2xl': 44;   // Slide titles, H1 (1.250^4)
  '3xl': 55;   // Hero titles (1.250^5)
  '4xl': 69;   // Impact titles (1.250^6)
}

export interface TypographySizes {
  h1: number;          // Main title
  h2: number;          // Subtitle/section header
  h3: number;          // Subsection
  body: number;        // Body text
  caption: number;     // Captions, fine print

  lineHeight: {
    title: number;     // 1.2 (tight for titles)
    body: number;      // 1.5-1.6 (comfortable for reading)
  };

  letterSpacing: {
    title: string;     // -0.02em (tighter for large text)
    body: string;      // 0 (normal)
  };
}

export interface ContentMetrics {
  wordCount: number;
  bulletCount: number;
  longestLine: number; // Characters
  estimatedHeight: number; // Pixels
}

export interface TypographyValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100
  recommendations: string[];
}

/**
 * Typography Engine
 * Calculates optimal font sizes based on content density and screen size
 */
export class TypographyEngine {
  // Major Third scale (1.250 ratio)
  private scale: TypeScale = {
    xs: 12,
    sm: 15,
    base: 18,
    md: 22,
    lg: 28,
    xl: 35,
    '2xl': 44,
    '3xl': 55,
    '4xl': 69
  };

  // Minimum sizes (WCAG AAA compliance)
  private minSizes = {
    title: 32,   // Minimum for slide titles
    body: 18,    // Minimum for body text (WCAG AA: 18px+)
    caption: 14  // Minimum for captions
  };

  // Nancy Duarte limits
  private limits = {
    titleMaxWords: 8,        // 75-word rule for titles
    bulletMaxWords: 12,      // Per bullet
    slideMaxWords: 75,       // Total per slide
    lineMaxChars: 60         // Optimal readability
  };

  /**
   * Analyze content metrics
   */
  analyzeContent(content: {
    title?: string;
    subtitle?: string;
    body?: string;
    bullets?: string[];
  }): ContentMetrics {
    // Count words
    const titleWords = content.title?.split(/\s+/).length || 0;
    const subtitleWords = content.subtitle?.split(/\s+/).length || 0;
    const bodyWords = content.body?.split(/\s+/).length || 0;
    const bulletWords = content.bullets?.reduce((sum, bullet) => {
      return sum + bullet.split(/\s+/).length;
    }, 0) || 0;

    const totalWords = titleWords + subtitleWords + bodyWords + bulletWords;
    const bulletCount = content.bullets?.length || 0;

    // Find longest line
    const allLines = [
      content.title || '',
      content.subtitle || '',
      ...(content.body?.split('\n') || []),
      ...(content.bullets || [])
    ];
    const longestLine = Math.max(...allLines.map(line => line.length));

    // Estimate height (rough calculation)
    const titleHeight = titleWords > 0 ? 60 : 0;
    const subtitleHeight = subtitleWords > 0 ? 36 : 0;
    const bodyHeight = bodyWords * 0.5; // ~2 words per line × 18px line height
    const bulletHeight = bulletCount * 30; // ~30px per bullet

    const estimatedHeight = titleHeight + subtitleHeight + bodyHeight + bulletHeight;

    return {
      wordCount: totalWords,
      bulletCount,
      longestLine,
      estimatedHeight
    };
  }

  /**
   * Calculate optimal font sizes based on content density
   */
  calculateSizes(metrics: ContentMetrics, slideType: 'title' | 'content' | 'data' | 'closing'): TypographySizes {
    // Start with base sizes
    let h1 = this.scale['2xl'];    // 44px
    let h2 = this.scale.xl;        // 35px
    let h3 = this.scale.lg;        // 28px
    let body = this.scale.base;    // 18px
    let caption = this.scale.sm;   // 15px

    // Adjust for content density
    if (metrics.wordCount > 75) {
      // Heavy content: reduce sizes
      h1 = this.scale.xl;          // 35px (smaller title)
      h2 = this.scale.lg;          // 28px
      body = this.scale.base;      // 18px (maintain minimum)
    } else if (metrics.wordCount < 30 && slideType === 'title') {
      // Light content on title slide: increase for impact
      h1 = this.scale['3xl'];      // 55px (hero title)
      h2 = this.scale['2xl'];      // 44px
    }

    // Adjust for bullet density
    if (metrics.bulletCount > 5) {
      // Many bullets: reduce to fit
      body = this.scale.base;      // 18px (minimum)
      h1 = this.scale.xl;          // 35px
    }

    // Enforce minimums (WCAG AAA)
    h1 = Math.max(h1, this.minSizes.title);
    h2 = Math.max(h2, this.minSizes.title * 0.8);
    h3 = Math.max(h3, this.minSizes.body + 4);
    body = Math.max(body, this.minSizes.body);
    caption = Math.max(caption, this.minSizes.caption);

    // Ensure hierarchy (title should be ≥2.5x body)
    const titleBodyRatio = h1 / body;
    if (titleBodyRatio < 2.5) {
      // Adjust title up to maintain hierarchy
      h1 = body * 2.5;
    }

    return {
      h1: Math.round(h1),
      h2: Math.round(h2),
      h3: Math.round(h3),
      body: Math.round(body),
      caption: Math.round(caption),
      lineHeight: {
        title: 1.2,   // Tight for impact
        body: 1.6     // Comfortable for reading (Nancy Duarte: 1.5-1.75)
      },
      letterSpacing: {
        title: '-0.02em',  // Tighter for large text
        body: '0'          // Normal for body
      }
    };
  }

  /**
   * Generate responsive CSS with clamp()
   */
  generateCSS(sizes: TypographySizes, slideId: string): string {
    // Calculate responsive scaling (80%-100% of target size)
    const css = `
/* Typography: Responsive Type Scale */
#${slideId} h1,
#${slideId} .title {
  font-size: clamp(${sizes.h1 * 0.8}px, 4vw, ${sizes.h1}px);
  line-height: ${sizes.lineHeight.title};
  letter-spacing: ${sizes.letterSpacing.title};
  font-weight: 700;
  margin: 0 0 ${sizes.h1 * 0.5}px 0;
}

#${slideId} h2,
#${slideId} .subtitle {
  font-size: clamp(${sizes.h2 * 0.85}px, 3vw, ${sizes.h2}px);
  line-height: ${sizes.lineHeight.title};
  letter-spacing: ${sizes.letterSpacing.title};
  font-weight: 600;
  margin: 0 0 ${sizes.h2 * 0.4}px 0;
}

#${slideId} h3 {
  font-size: clamp(${sizes.h3 * 0.9}px, 2.5vw, ${sizes.h3}px);
  line-height: ${sizes.lineHeight.title};
  letter-spacing: ${sizes.letterSpacing.body};
  font-weight: 600;
  margin: 0 0 ${sizes.h3 * 0.3}px 0;
}

#${slideId} p,
#${slideId} li,
#${slideId} .body {
  font-size: clamp(${sizes.body * 0.9}px, 1.5vw, ${sizes.body}px);
  line-height: ${sizes.lineHeight.body};
  letter-spacing: ${sizes.letterSpacing.body};
  font-weight: 400;
  margin: 0 0 ${sizes.body * 0.75}px 0;
  max-width: 60ch; /* Optimal line length (~60 chars) */
}

#${slideId} .caption,
#${slideId} .footnote {
  font-size: clamp(${sizes.caption * 0.9}px, 1vw, ${sizes.caption}px);
  line-height: 1.4;
  letter-spacing: ${sizes.letterSpacing.body};
  font-weight: 400;
  color: rgba(0, 0, 0, 0.7);
  margin: ${sizes.caption * 0.5}px 0 0 0;
}

/* Bullet points */
#${slideId} ul,
#${slideId} ol {
  margin: ${sizes.body}px 0;
  padding-left: ${sizes.body * 1.5}px;
}

#${slideId} li {
  margin-bottom: ${sizes.body * 0.5}px;
}

#${slideId} li::marker {
  font-size: ${sizes.body * 0.8}px;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  #${slideId} p,
  #${slideId} li {
    max-width: 50ch;
  }
}

@media (max-width: 768px) {
  #${slideId} h1 {
    font-size: ${sizes.h1 * 0.75}px;
  }

  #${slideId} p,
  #${slideId} li {
    max-width: 40ch;
  }
}
`;
    return css.trim();
  }

  /**
   * Validate typography against best practices
   */
  validate(sizes: TypographySizes, metrics: ContentMetrics): TypographyValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check Nancy Duarte 75-word rule
    if (metrics.wordCount > this.limits.slideMaxWords) {
      errors.push(
        `Too many words (${metrics.wordCount}, maximum ${this.limits.slideMaxWords} per Nancy Duarte)`
      );
      score -= 20;
      recommendations.push(`Reduce content to ${this.limits.slideMaxWords} words or split into multiple slides`);
    }

    // Check title-to-body ratio (should be ≥2.5:1)
    const ratio = sizes.h1 / sizes.body;
    if (ratio < 2.5) {
      errors.push(
        `Poor title hierarchy (${ratio.toFixed(1)}:1 ratio, need ≥2.5:1)`
      );
      score -= 15;
      recommendations.push(`Increase title size to ${sizes.body * 2.5}px for better hierarchy`);
    }

    // Check WCAG AAA minimums
    if (sizes.body < this.minSizes.body) {
      errors.push(
        `Body text too small (${sizes.body}px, minimum ${this.minSizes.body}px for WCAG AAA)`
      );
      score -= 25;
      recommendations.push(`Increase body text to at least ${this.minSizes.body}px`);
    }

    if (sizes.h1 < this.minSizes.title) {
      errors.push(
        `Title too small (${sizes.h1}px, minimum ${this.minSizes.title}px)`
      );
      score -= 15;
      recommendations.push(`Increase title to at least ${this.minSizes.title}px`);
    }

    // Check line length
    if (metrics.longestLine > this.limits.lineMaxChars + 15) {
      warnings.push(
        `Lines too long (${metrics.longestLine} chars, optimal ≤${this.limits.lineMaxChars})`
      );
      score -= 10;
      recommendations.push(`Break long lines or use two-column layout`);
    }

    // Check bullet count
    if (metrics.bulletCount > 5) {
      warnings.push(
        `Too many bullets (${metrics.bulletCount}, recommend ≤5 per McKinsey standard)`
      );
      score -= 10;
      recommendations.push(`Reduce to 5 bullets or split into multiple slides`);
    }

    // Check line height
    if (sizes.lineHeight.body < 1.5) {
      warnings.push(
        `Line height too tight (${sizes.lineHeight.body}, recommend ≥1.5)`
      );
      score -= 5;
      recommendations.push(`Increase line height to 1.5-1.75 for better readability`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, score),
      recommendations
    };
  }

  /**
   * Get type scale
   */
  getTypeScale(): TypeScale {
    return { ...this.scale };
  }

  /**
   * Get Nancy Duarte limits
   */
  getLimits() {
    return { ...this.limits };
  }

  /**
   * Calculate scale value for custom ratio
   */
  calculateScale(base: number, ratio: number, steps: number): number[] {
    const scale: number[] = [];
    for (let i = -2; i <= steps; i++) {
      scale.push(Math.round(base * Math.pow(ratio, i)));
    }
    return scale;
  }

  /**
   * Estimate text height (for overflow detection)
   */
  estimateTextHeight(
    text: string,
    fontSize: number,
    lineHeight: number,
    maxWidth: number
  ): number {
    const charsPerLine = Math.floor(maxWidth / (fontSize * 0.6)); // Rough estimate
    const lines = Math.ceil(text.length / charsPerLine);
    return lines * fontSize * lineHeight;
  }
}

// Singleton instance
export const typographyEngine = new TypographyEngine();

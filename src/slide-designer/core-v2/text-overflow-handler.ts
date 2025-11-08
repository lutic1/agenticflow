/**
 * Smart Text Overflow Handler (V2)
 * Intelligent handling of text that exceeds slide capacity
 * Three strategies: compress (font-size), split (multiple slides), summarize (AI)
 */

import { GeminiClient } from '../core/gemini-client';

export interface TextOverflowStrategy {
  mode: 'compress' | 'split' | 'summarize' | 'none';

  // Strategy 1: Compress font size
  compress?: {
    originalFontSize: number;
    reducedFontSize: number;
    reductionPercent: number;
  };

  // Strategy 2: Split into multiple slides
  split?: {
    totalSlides: number;
    content: string[]; // Array of content for each slide
  };

  // Strategy 3: AI summarization
  summarize?: {
    originalLength: number;
    summarizedLength: number;
    reductionPercent: number;
  };
}

export interface OverflowResult {
  hasOverflow: boolean;
  strategy: TextOverflowStrategy;
  result: string | string[]; // Single content or array of slides
  metadata: {
    originalLength: number;
    finalLength: number;
    overflow: number; // pixels
    action: string;
  };
}

export interface ContentMetrics {
  text: string;
  containerHeight: number;
  containerWidth: number;
  currentFontSize: number;
  lineHeight: number;
}

/**
 * Text Overflow Handler
 * Intelligently handles text that doesn't fit in slide container
 */
export class TextOverflowHandler {
  private geminiClient: GeminiClient;

  // Configuration limits
  private config = {
    minFontSize: 18,           // Don't go below WCAG minimum
    maxReduction: 0.2,         // Max 20% font-size reduction
    maxBulletsPerSlide: 5,     // McKinsey standard
    splitThreshold: 100,       // Pixels of overflow before splitting
    preserveHierarchy: true    // Maintain title/body ratio
  };

  constructor() {
    this.geminiClient = new GeminiClient({
      apiKey: process.env.GEMINI_API_KEY || '',
      model: 'gemini-2.5-flash'
    });
  }

  /**
   * Main overflow handling method
   */
  async handle(metrics: ContentMetrics): Promise<OverflowResult> {
    // 1. Estimate content height
    const estimatedHeight = this.estimateHeight(
      metrics.text,
      metrics.currentFontSize,
      metrics.lineHeight,
      metrics.containerWidth
    );

    const overflow = estimatedHeight - metrics.containerHeight;

    // No overflow
    if (overflow <= 0) {
      return {
        hasOverflow: false,
        strategy: { mode: 'none' },
        result: metrics.text,
        metadata: {
          originalLength: metrics.text.length,
          finalLength: metrics.text.length,
          overflow: 0,
          action: 'No action needed'
        }
      };
    }

    // Choose strategy based on overflow amount
    if (overflow < this.config.splitThreshold) {
      // Small overflow → compress font
      return await this.compressFont(metrics, overflow);
    } else if (this.isBulletList(metrics.text)) {
      // Large overflow + bullets → split
      return await this.splitSlides(metrics);
    } else {
      // Large overflow + paragraph → summarize with AI
      return await this.summarizeWithAI(metrics);
    }
  }

  /**
   * Strategy 1: Compress font size
   */
  private async compressFont(
    metrics: ContentMetrics,
    overflow: number
  ): Promise<OverflowResult> {
    // Calculate required reduction
    const reductionRatio = overflow / (metrics.containerHeight + overflow);
    const targetFontSize = metrics.currentFontSize * (1 - reductionRatio);

    // Enforce minimum
    const finalFontSize = Math.max(targetFontSize, this.config.minFontSize);

    // Check if reduction is acceptable
    const actualReduction = (metrics.currentFontSize - finalFontSize) / metrics.currentFontSize;

    if (actualReduction > this.config.maxReduction) {
      // Too much reduction, use different strategy
      return this.isBulletList(metrics.text)
        ? await this.splitSlides(metrics)
        : await this.summarizeWithAI(metrics);
    }

    return {
      hasOverflow: true,
      strategy: {
        mode: 'compress',
        compress: {
          originalFontSize: metrics.currentFontSize,
          reducedFontSize: Math.round(finalFontSize),
          reductionPercent: Math.round(actualReduction * 100)
        }
      },
      result: metrics.text,
      metadata: {
        originalLength: metrics.text.length,
        finalLength: metrics.text.length,
        overflow,
        action: `Reduced font size from ${metrics.currentFontSize}px to ${Math.round(finalFontSize)}px`
      }
    };
  }

  /**
   * Strategy 2: Split into multiple slides
   */
  private async splitSlides(metrics: ContentMetrics): Promise<OverflowResult> {
    const bullets = this.extractBullets(metrics.text);

    if (bullets.length === 0) {
      // Not a bullet list, use summarization instead
      return await this.summarizeWithAI(metrics);
    }

    // Split bullets into groups of maxBulletsPerSlide
    const slideGroups: string[][] = [];
    for (let i = 0; i < bullets.length; i += this.config.maxBulletsPerSlide) {
      slideGroups.push(bullets.slice(i, i + this.config.maxBulletsPerSlide));
    }

    // Generate slide content for each group
    const slideContents = slideGroups.map((group, index) => {
      const bulletText = group.map(b => `• ${b}`).join('\n');
      return bulletText;
    });

    return {
      hasOverflow: true,
      strategy: {
        mode: 'split',
        split: {
          totalSlides: slideContents.length,
          content: slideContents
        }
      },
      result: slideContents,
      metadata: {
        originalLength: metrics.text.length,
        finalLength: slideContents.join(' ').length,
        overflow: metrics.containerHeight,
        action: `Split into ${slideContents.length} slides (${this.config.maxBulletsPerSlide} bullets each)`
      }
    };
  }

  /**
   * Strategy 3: AI summarization
   */
  private async summarizeWithAI(metrics: ContentMetrics): Promise<OverflowResult> {
    const targetWords = Math.floor(metrics.text.split(/\s+/).length * 0.7); // 30% reduction

    const prompt = `
      Summarize this text to approximately ${targetWords} words while preserving key information:

      ${metrics.text}

      Requirements:
      - Maintain all important facts and figures
      - Use clear, concise language
      - Professional tone
      - Target word count: ${targetWords}
      - Output only the summarized text (no explanation)
    `;

    try {
      const response = await this.geminiClient.generateContent(prompt);
      const summarized = response.text.trim();

      // Verify it actually reduced length
      if (summarized.length >= metrics.text.length * 0.95) {
        // Summarization didn't help much, try splitting
        return await this.splitSlides(metrics);
      }

      return {
        hasOverflow: true,
        strategy: {
          mode: 'summarize',
          summarize: {
            originalLength: metrics.text.length,
            summarizedLength: summarized.length,
            reductionPercent: Math.round(
              ((metrics.text.length - summarized.length) / metrics.text.length) * 100
            )
          }
        },
        result: summarized,
        metadata: {
          originalLength: metrics.text.length,
          finalLength: summarized.length,
          overflow: metrics.containerHeight,
          action: `AI summarized (${Math.round(((metrics.text.length - summarized.length) / metrics.text.length) * 100)}% reduction)`
        }
      };
    } catch (error) {
      console.error('AI summarization failed:', error);

      // Fallback: simple truncation
      const truncated = metrics.text.slice(0, Math.floor(metrics.text.length * 0.7)) + '...';
      return {
        hasOverflow: true,
        strategy: {
          mode: 'summarize',
          summarize: {
            originalLength: metrics.text.length,
            summarizedLength: truncated.length,
            reductionPercent: 30
          }
        },
        result: truncated,
        metadata: {
          originalLength: metrics.text.length,
          finalLength: truncated.length,
          overflow: metrics.containerHeight,
          action: 'Truncated (AI summarization failed)'
        }
      };
    }
  }

  /**
   * Estimate text height in pixels
   */
  private estimateHeight(
    text: string,
    fontSize: number,
    lineHeight: number,
    containerWidth: number
  ): number {
    // Estimate characters per line (rough: ~0.6 * fontSize per char)
    const charsPerLine = Math.floor(containerWidth / (fontSize * 0.6));

    // Calculate number of lines
    const totalChars = text.length;
    const lines = Math.ceil(totalChars / charsPerLine);

    // Calculate total height
    const lineHeightPx = fontSize * lineHeight;
    return lines * lineHeightPx;
  }

  /**
   * Check if text is a bullet list
   */
  private isBulletList(text: string): boolean {
    const bulletPatterns = [
      /^[\s]*[•\-\*]\s+/gm,  // • - * bullets
      /^[\s]*\d+\.\s+/gm,    // Numbered lists
      /^[\s]*[a-z]\)\s+/gm   // a) b) c) lists
    ];

    return bulletPatterns.some(pattern => {
      const matches = text.match(pattern);
      return matches && matches.length >= 2; // At least 2 bullets
    });
  }

  /**
   * Extract bullets from text
   */
  private extractBullets(text: string): string[] {
    const lines = text.split('\n');
    const bullets: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Check if line starts with bullet
      if (/^[•\-\*]\s+/.test(trimmed)) {
        bullets.push(trimmed.replace(/^[•\-\*]\s+/, ''));
      } else if (/^\d+\.\s+/.test(trimmed)) {
        bullets.push(trimmed.replace(/^\d+\.\s+/, ''));
      } else if (/^[a-z]\)\s+/.test(trimmed)) {
        bullets.push(trimmed.replace(/^[a-z]\)\s+/, ''));
      }
    }

    return bullets;
  }

  /**
   * Get configuration
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<typeof this.config>): void {
    Object.assign(this.config, updates);
  }
}

// Singleton instance
export const textOverflowHandler = new TextOverflowHandler();

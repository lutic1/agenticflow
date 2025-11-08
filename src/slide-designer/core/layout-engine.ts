/**
 * Layout Engine
 * Intelligent layout decision system based on content analysis and design rules
 */

import {
  LayoutType,
  LayoutDecision,
  ContentAnalysis,
  DesignRule,
  LayoutEngineError,
} from '../types/index.js';
import { LAYOUT_RULES, DESIGN_RULES } from '../config/design-config.js';
import { getContentAnalyzer } from './content-analyzer.js';

/**
 * Layout Engine for intelligent slide layout decisions
 */
export class LayoutEngine {
  private analyzer = getContentAnalyzer();

  /**
   * Determine optimal layout for slide content
   */
  async determineLayout(
    content: string,
    slidePosition: 'first' | 'last' | 'middle',
    hasVisuals: boolean = true
  ): Promise<LayoutDecision> {
    const analysis = this.analyzer.analyze(content);
    const matchedRules = this.matchLayoutRules(analysis, slidePosition, hasVisuals);

    if (matchedRules.length === 0) {
      // Fallback to default layout
      return {
        layoutType: 'content-only',
        reasoning: 'Default layout applied - no specific rules matched',
        confidence: 0.5,
        alternatives: ['bullet-points', 'two-column'],
        designRules: [],
      };
    }

    // Sort by priority and confidence
    const bestMatch = matchedRules[0];
    const alternatives = matchedRules.slice(1, 3).map(r => r.layoutType);

    const appliedRules = this.getAppliedDesignRules(analysis, bestMatch.layoutType);

    return {
      layoutType: bestMatch.layoutType,
      reasoning: bestMatch.description,
      confidence: this.calculateConfidence(analysis, bestMatch),
      alternatives,
      designRules: appliedRules,
    };
  }

  /**
   * Match content against layout rules
   */
  private matchLayoutRules(
    analysis: ContentAnalysis,
    slidePosition: 'first' | 'last' | 'middle',
    hasVisuals: boolean
  ): typeof LAYOUT_RULES {
    const matches = LAYOUT_RULES.filter(rule => {
      const conditions = rule.conditions;

      // Check slide position
      if (conditions.slidePosition && conditions.slidePosition !== slidePosition) {
        if (conditions.slidePosition !== 'any') {
          return false;
        }
      }

      // Check word count
      if (conditions.wordCountMin && analysis.wordCount < conditions.wordCountMin) {
        return false;
      }
      if (conditions.wordCountMax && analysis.wordCount > conditions.wordCountMax) {
        return false;
      }

      // Check content features
      if (conditions.hasLists !== undefined && analysis.hasLists !== conditions.hasLists) {
        return false;
      }
      if (conditions.hasQuotes !== undefined && analysis.hasQuotes !== conditions.hasQuotes) {
        return false;
      }
      if (conditions.hasCode !== undefined && analysis.hasCode !== conditions.hasCode) {
        return false;
      }
      if (conditions.requiresImage !== undefined && !hasVisuals) {
        return false;
      }

      return true;
    });

    // Sort by priority (higher priority first)
    return matches.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Calculate confidence score for layout decision
   */
  private calculateConfidence(
    analysis: ContentAnalysis,
    rule: typeof LAYOUT_RULES[0]
  ): number {
    let confidence = 0.7; // Base confidence

    // Increase confidence based on how well content matches
    const conditions = rule.conditions;

    if (conditions.wordCountMin && conditions.wordCountMax) {
      const midpoint = (conditions.wordCountMin + conditions.wordCountMax) / 2;
      const distance = Math.abs(analysis.wordCount - midpoint);
      const range = conditions.wordCountMax - conditions.wordCountMin;
      confidence += (1 - distance / range) * 0.2;
    }

    // Boost confidence for exact feature matches
    if (conditions.hasLists === analysis.hasLists) confidence += 0.05;
    if (conditions.hasQuotes === analysis.hasQuotes) confidence += 0.05;

    return Math.min(confidence, 0.98);
  }

  /**
   * Get design rules applied for this layout
   */
  private getAppliedDesignRules(
    analysis: ContentAnalysis,
    layoutType: LayoutType
  ): DesignRule[] {
    const rules: DesignRule[] = [];

    // Typography rules
    if (analysis.wordCount > DESIGN_RULES.typography.maxLinesPerSlide * DESIGN_RULES.typography.maxWordsPerLine) {
      rules.push({
        rule: 'Content exceeds recommended length - consider splitting',
        applied: true,
        impact: 'high',
      });
    }

    // Whitespace rules
    if (layoutType === 'content-only' && analysis.wordCount > 100) {
      rules.push({
        rule: 'Optimize whitespace for readability',
        applied: true,
        impact: 'medium',
      });
    }

    // Visual asset rules
    if (this.analyzer.shouldUseImages(analysis)) {
      rules.push({
        rule: 'Use professional images for visual impact',
        applied: layoutType.includes('image'),
        impact: 'high',
      });
    }

    if (this.analyzer.shouldUseIcons(analysis)) {
      rules.push({
        rule: 'Use icons to enhance bullet points',
        applied: analysis.hasLists,
        impact: 'medium',
      });
    }

    // Complexity rules
    if (analysis.complexity === 'complex') {
      rules.push({
        rule: 'Simplify content or split across multiple slides',
        applied: false,
        impact: 'high',
      });
    }

    return rules;
  }

  /**
   * Determine asset placement for layout
   */
  determineAssetPlacement(
    layoutType: LayoutType,
    assetType: 'image' | 'icon' | 'chart'
  ): {
    position: string;
    size: { width: string; height: string };
  } {
    const placements = {
      'title-slide': {
        image: { position: 'background', size: { width: '100%', height: '100%' } },
        icon: { position: 'center', size: { width: '80px', height: '80px' } },
        chart: { position: 'center', size: { width: '60%', height: 'auto' } },
      },
      'content-image-split': {
        image: { position: 'right', size: { width: '45%', height: 'auto' } },
        icon: { position: 'left', size: { width: '60px', height: '60px' } },
        chart: { position: 'right', size: { width: '45%', height: 'auto' } },
      },
      'image-focus': {
        image: { position: 'center', size: { width: '80%', height: 'auto' } },
        icon: { position: 'center', size: { width: '120px', height: '120px' } },
        chart: { position: 'center', size: { width: '85%', height: 'auto' } },
      },
      'bullet-points': {
        image: { position: 'right', size: { width: '40%', height: 'auto' } },
        icon: { position: 'left', size: { width: '48px', height: '48px' } },
        chart: { position: 'bottom', size: { width: '70%', height: 'auto' } },
      },
    };

    const layoutPlacement = placements[layoutType as keyof typeof placements];
    if (!layoutPlacement) {
      // Default placement
      return {
        position: 'right',
        size: { width: '40%', height: 'auto' },
      };
    }

    return layoutPlacement[assetType];
  }

  /**
   * Generate CSS classes for layout type
   */
  getLayoutClasses(layoutType: LayoutType): string[] {
    const baseClasses = ['slide', `slide--${layoutType}`];

    const layoutModifiers: Record<string, string[]> = {
      'title-slide': ['slide--centered', 'slide--hero'],
      'content-only': ['slide--text-focus'],
      'content-image-split': ['slide--split', 'slide--balanced'],
      'image-focus': ['slide--visual-focus', 'slide--minimal-text'],
      'bullet-points': ['slide--list'],
      'two-column': ['slide--columns'],
      'quote': ['slide--centered', 'slide--quote'],
      'section-header': ['slide--centered', 'slide--divider'],
      'comparison': ['slide--split', 'slide--comparison'],
      'timeline': ['slide--sequential'],
    };

    const modifiers = layoutModifiers[layoutType] || [];
    return [...baseClasses, ...modifiers];
  }

  /**
   * Validate layout decision
   */
  validateLayout(decision: LayoutDecision): boolean {
    if (decision.confidence < 0.3) {
      throw new LayoutEngineError(
        'Layout confidence too low',
        { decision }
      );
    }

    const validLayouts: LayoutType[] = [
      'title-slide',
      'content-only',
      'content-image-split',
      'image-focus',
      'bullet-points',
      'two-column',
      'quote',
      'section-header',
      'comparison',
      'timeline',
    ];

    if (!validLayouts.includes(decision.layoutType)) {
      throw new LayoutEngineError(
        `Invalid layout type: ${decision.layoutType}`,
        { decision }
      );
    }

    return true;
  }

  /**
   * Get layout recommendations for entire presentation
   */
  async planPresentationLayout(
    slideContents: string[]
  ): Promise<Map<number, LayoutDecision>> {
    const layoutMap = new Map<number, LayoutDecision>();

    for (let i = 0; i < slideContents.length; i++) {
      const position = i === 0 ? 'first' : i === slideContents.length - 1 ? 'last' : 'middle';
      const hasVisuals = i > 0; // First slide may not need visuals

      const decision = await this.determineLayout(
        slideContents[i],
        position,
        hasVisuals
      );

      layoutMap.set(i, decision);
    }

    return layoutMap;
  }
}

/**
 * Singleton instance
 */
let layoutEngineInstance: LayoutEngine | null = null;

/**
 * Get or create layout engine instance
 */
export function getLayoutEngine(): LayoutEngine {
  if (!layoutEngineInstance) {
    layoutEngineInstance = new LayoutEngine();
  }
  return layoutEngineInstance;
}

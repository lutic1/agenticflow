/**
 * Design Agent
 * Makes intelligent design decisions for layouts and themes
 */

import {
  Theme,
  LayoutType,
  ContentOutline,
  DesignDecision,
  AssetStrategy,
  AgentTask,
  AgentError,
} from '../types/index.js';
import { THEMES, selectThemeByContext } from '../config/design-config.js';
import { getLayoutEngine } from '../core/layout-engine.js';
import { getGeminiClient } from '../core/gemini-client.js';

/**
 * Design Agent for layout and theme decisions
 */
export class DesignAgent {
  private layoutEngine = getLayoutEngine();
  private gemini = getGeminiClient();
  private taskHistory: AgentTask[] = [];

  /**
   * Make comprehensive design decisions for presentation
   */
  async makeDesignDecisions(
    outline: ContentOutline,
    slideContents: string[],
    preferences?: {
      themeName?: string;
      preferImages?: boolean;
      colorTone?: 'vibrant' | 'muted' | 'professional';
    }
  ): Promise<DesignDecision> {
    const taskId = `design-${Date.now()}`;
    const task: AgentTask = {
      id: taskId,
      type: 'design',
      description: 'Make design decisions for presentation',
      priority: 'high',
      status: 'in_progress',
      input: { outline, preferences },
      startTime: new Date(),
    };

    this.taskHistory.push(task);

    try {
      // Select theme
      const theme = await this.selectTheme(outline, preferences);

      // Determine layouts for each slide
      const layoutMap = await this.determineLayouts(slideContents);

      // Define asset strategy
      const assetStrategy = this.defineAssetStrategy(outline, preferences);

      const reasoning = this.generateDesignReasoning(theme, assetStrategy);

      const decision: DesignDecision = {
        theme,
        layoutMap,
        assetStrategy,
        reasoning,
      };

      task.status = 'completed';
      task.output = decision;
      task.endTime = new Date();

      return decision;
    } catch (error) {
      task.status = 'failed';
      task.error = (error as Error).message;
      task.endTime = new Date();

      throw new AgentError(
        'Design decision failed',
        'design',
        { originalError: (error as Error).message }
      );
    }
  }

  /**
   * Select appropriate theme for presentation
   */
  private async selectTheme(
    outline: ContentOutline,
    preferences?: { themeName?: string; colorTone?: string }
  ): Promise<Theme> {
    // Use preference if provided and valid
    if (preferences?.themeName && THEMES[preferences.themeName]) {
      return THEMES[preferences.themeName];
    }

    // Use AI to generate custom theme if no preference
    if (!preferences?.themeName) {
      try {
        const themeJSON = await this.gemini.generateTheme(
          outline.title,
          outline.tone
        );
        const customTheme = JSON.parse(themeJSON);

        // Merge with base theme structure
        return {
          name: customTheme.name || 'Custom',
          colors: customTheme.colors,
          typography: THEMES.professional.typography, // Use default typography
          spacing: THEMES.professional.spacing,
          effects: THEMES.professional.effects,
        };
      } catch (error) {
        console.warn('Failed to generate custom theme, using default', error);
      }
    }

    // Fallback: Select based on tone
    return selectThemeByContext(outline.tone);
  }

  /**
   * Determine layout for each slide
   */
  private async determineLayouts(slideContents: string[]): Promise<Map<number, LayoutType>> {
    const layoutDecisions = await this.layoutEngine.planPresentationLayout(slideContents);

    const layoutMap = new Map<number, LayoutType>();

    layoutDecisions.forEach((decision, index) => {
      layoutMap.set(index, decision.layoutType);
    });

    return layoutMap;
  }

  /**
   * Define asset strategy for presentation
   */
  private defineAssetStrategy(
    outline: ContentOutline,
    preferences?: { preferImages?: boolean }
  ): AssetStrategy {
    // Determine if presentation should be image-heavy
    const sectionsWithVisuals = outline.sections.filter(s => s.hasVisuals).length;
    const visualRatio = sectionsWithVisuals / outline.sections.length;

    const useImages = preferences?.preferImages ?? visualRatio > 0.5;
    const useIcons = !useImages || outline.tone === 'technical';

    // Determine image style based on tone
    let imageStyle: AssetStrategy['imageStyle'] = 'photographic';
    if (outline.tone === 'technical') {
      imageStyle = 'minimal';
    } else if (outline.tone === 'casual') {
      imageStyle = 'illustration';
    }

    // Determine icon style
    const iconStyle = outline.tone === 'formal' ? 'line' : 'filled';

    // Determine placement strategy
    let placement: AssetStrategy['placement'] = 'balanced';
    if (visualRatio > 0.7) {
      placement = 'image-heavy';
    } else if (visualRatio < 0.3) {
      placement = 'minimal';
    }

    return {
      useImages,
      useIcons,
      imageStyle,
      iconStyle,
      placement,
    };
  }

  /**
   * Generate reasoning for design decisions
   */
  private generateDesignReasoning(theme: Theme, strategy: AssetStrategy): string {
    const reasons: string[] = [];

    reasons.push(`Selected "${theme.name}" theme for visual coherence`);

    if (strategy.useImages) {
      reasons.push(`Using ${strategy.imageStyle} images to enhance visual appeal`);
    }

    if (strategy.useIcons) {
      reasons.push(`Incorporating ${strategy.iconStyle} icons for clarity`);
    }

    reasons.push(`Layout strategy: ${strategy.placement} visual distribution`);

    return reasons.join('. ') + '.';
  }

  /**
   * Adjust theme colors for better contrast
   */
  adjustThemeContrast(theme: Theme, targetContrast: number = 4.5): Theme {
    // WCAG AA requires 4.5:1 contrast ratio for normal text
    // This is a simplified implementation - production would use proper color contrast calculation

    const adjustedTheme = { ...theme };

    // Ensure text has sufficient contrast against background
    const bgLuminance = this.getLuminance(theme.colors.background);
    const textLuminance = this.getLuminance(theme.colors.text);

    const currentContrast = this.getContrastRatio(bgLuminance, textLuminance);

    if (currentContrast < targetContrast) {
      // Darken text if background is light, lighten if background is dark
      adjustedTheme.colors = {
        ...theme.colors,
        text: bgLuminance > 0.5 ? '#000000' : '#ffffff',
      };
    }

    return adjustedTheme;
  }

  /**
   * Calculate relative luminance (simplified)
   */
  private getLuminance(hexColor: string): number {
    // Remove # if present
    const hex = hexColor.replace('#', '');

    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    // Calculate luminance (simplified formula)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Calculate contrast ratio
   */
  private getContrastRatio(lum1: number, lum2: number): number {
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Create theme variations
   */
  createThemeVariations(baseTheme: Theme, count: number = 3): Theme[] {
    const variations: Theme[] = [baseTheme];

    // Create variations by adjusting colors
    const adjustments = [
      { hueShift: 30, name: 'Variant 1' },
      { hueShift: -30, name: 'Variant 2' },
      { hueShift: 60, name: 'Variant 3' },
    ];

    for (let i = 0; i < Math.min(count - 1, adjustments.length); i++) {
      const variant = {
        ...baseTheme,
        name: `${baseTheme.name} ${adjustments[i].name}`,
        colors: {
          ...baseTheme.colors,
          // In production, would properly shift hue
          accent: this.shiftHue(baseTheme.colors.accent, adjustments[i].hueShift),
        },
      };
      variations.push(variant);
    }

    return variations;
  }

  /**
   * Shift color hue (simplified)
   */
  private shiftHue(hexColor: string, degrees: number): string {
    // Simplified implementation - production would use proper HSL conversion
    return hexColor; // Return original for now
  }

  /**
   * Get task history
   */
  getTaskHistory(): AgentTask[] {
    return [...this.taskHistory];
  }

  /**
   * Get agent statistics
   */
  getStats() {
    const completed = this.taskHistory.filter(t => t.status === 'completed').length;
    const failed = this.taskHistory.filter(t => t.status === 'failed').length;

    return {
      totalTasks: this.taskHistory.length,
      completed,
      failed,
      successRate: completed / Math.max(this.taskHistory.length, 1),
    };
  }

  /**
   * Clear task history
   */
  clearHistory(): void {
    this.taskHistory = [];
  }
}

/**
 * Singleton instance
 */
let designAgentInstance: DesignAgent | null = null;

/**
 * Get or create design agent instance
 */
export function getDesignAgent(): DesignAgent {
  if (!designAgentInstance) {
    designAgentInstance = new DesignAgent();
  }
  return designAgentInstance;
}

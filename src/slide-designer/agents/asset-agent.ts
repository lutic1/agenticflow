/**
 * Asset Agent
 * Finds and manages images, icons, and other visual assets
 */

import {
  Asset,
  AssetSuggestion,
  ContentAnalysis,
  AssetStrategy,
  AgentTask,
  AgentError,
} from '../types/index.js';
import { getGeminiClient } from '../core/gemini-client.js';
import { getContentAnalyzer } from '../core/content-analyzer.js';

/**
 * Asset Agent for finding and managing visual assets
 */
export class AssetAgent {
  private gemini = getGeminiClient();
  private analyzer = getContentAnalyzer();
  private taskHistory: AgentTask[] = [];

  /**
   * Find assets for slide content
   */
  async findAssets(
    slideContent: string,
    strategy: AssetStrategy,
    count: number = 2
  ): Promise<Asset[]> {
    const taskId = `asset-find-${Date.now()}`;
    const task: AgentTask = {
      id: taskId,
      type: 'asset',
      description: 'Find assets for slide',
      priority: 'medium',
      status: 'in_progress',
      input: { slideContent, strategy, count },
      startTime: new Date(),
    };

    this.taskHistory.push(task);

    try {
      // Analyze content for asset suggestions
      const analysis = this.analyzer.analyze(slideContent);

      // Generate search queries
      const searchQueries = await this.generateSearchQueries(
        slideContent,
        analysis,
        strategy,
        count
      );

      // Create asset objects
      const assets = this.createAssetsFromQueries(searchQueries, strategy);

      task.status = 'completed';
      task.output = { assets };
      task.endTime = new Date();

      return assets;
    } catch (error) {
      task.status = 'failed';
      task.error = (error as Error).message;
      task.endTime = new Date();

      throw new AgentError(
        'Failed to find assets',
        'asset',
        { originalError: (error as Error).message }
      );
    }
  }

  /**
   * Generate search queries for assets
   */
  private async generateSearchQueries(
    content: string,
    analysis: ContentAnalysis,
    strategy: AssetStrategy,
    count: number
  ): Promise<AssetSuggestion[]> {
    // Use content analyzer's suggestions as a base
    let suggestions = analysis.suggestedAssets;

    // If we need more, use AI to generate
    if (suggestions.length < count) {
      try {
        const queriesJSON = await this.gemini.generateImageQueries(content, count);
        const aiSuggestions = JSON.parse(queriesJSON);

        if (Array.isArray(aiSuggestions)) {
          suggestions = [
            ...suggestions,
            ...aiSuggestions.map((s: any) => ({
              type: this.mapAITypeToAssetType(s.style),
              description: s.description || '',
              relevance: s.priority === 'high' ? 0.9 : s.priority === 'medium' ? 0.7 : 0.5,
              searchQuery: s.query || '',
            })),
          ];
        }
      } catch (error) {
        console.warn('Failed to generate AI search queries', error);
      }
    }

    // Filter based on strategy
    suggestions = this.filterByStrategy(suggestions, strategy);

    // Return top suggestions
    return suggestions.slice(0, count);
  }

  /**
   * Map AI style to asset type
   */
  private mapAITypeToAssetType(style: string): 'image' | 'icon' | 'chart' {
    if (style === 'icon' || style === 'minimal') return 'icon';
    if (style === 'chart' || style === 'data') return 'chart';
    return 'image';
  }

  /**
   * Filter suggestions by strategy
   */
  private filterByStrategy(
    suggestions: AssetSuggestion[],
    strategy: AssetStrategy
  ): AssetSuggestion[] {
    return suggestions.filter(suggestion => {
      if (suggestion.type === 'image' && !strategy.useImages) return false;
      if (suggestion.type === 'icon' && !strategy.useIcons) return false;
      return true;
    });
  }

  /**
   * Create asset objects from search queries
   */
  private createAssetsFromQueries(
    queries: AssetSuggestion[],
    strategy: AssetStrategy
  ): Asset[] {
    return queries.map((query, index) => {
      const placement = this.determineAssetPlacement(query.type, index, queries.length);

      return {
        type: query.type,
        description: query.description,
        alt: query.description,
        url: this.generatePlaceholderURL(query.searchQuery, query.type),
        placement,
        size: this.determineAssetSize(query.type),
      };
    });
  }

  /**
   * Determine asset placement
   */
  private determineAssetPlacement(
    type: 'image' | 'icon' | 'chart',
    index: number,
    totalAssets: number
  ): Asset['placement'] {
    const positions: Array<'left' | 'right' | 'center' | 'top' | 'bottom'> = [
      'right',
      'left',
      'center',
      'top',
      'bottom',
    ];

    const position = index < positions.length ? positions[index] : 'center';

    // Different sizes based on type
    if (type === 'image') {
      return {
        position,
        width: totalAssets === 1 ? '60%' : '45%',
        height: 'auto',
      };
    } else if (type === 'icon') {
      return {
        position,
        width: '64px',
        height: '64px',
      };
    } else {
      // chart
      return {
        position,
        width: '70%',
        height: 'auto',
      };
    }
  }

  /**
   * Determine asset size
   */
  private determineAssetSize(type: 'image' | 'icon' | 'chart'): Asset['size'] {
    if (type === 'icon') {
      return {
        width: 64,
        height: 64,
        unit: 'px',
      };
    } else if (type === 'image') {
      return {
        width: 100,
        height: 100,
        unit: '%',
      };
    } else {
      return {
        width: 80,
        height: 80,
        unit: '%',
      };
    }
  }

  /**
   * Generate placeholder URL for asset
   * In production, this would integrate with image search APIs (Unsplash, Pexels, etc.)
   */
  private generatePlaceholderURL(searchQuery: string, type: 'image' | 'icon' | 'chart'): string {
    const encodedQuery = encodeURIComponent(searchQuery);

    if (type === 'image') {
      // Unsplash placeholder (in production, use actual API)
      return `https://source.unsplash.com/800x600/?${encodedQuery}`;
    } else if (type === 'icon') {
      // Icon placeholder - could integrate with services like Iconify
      return `https://api.iconify.design/mdi/${encodedQuery}.svg?color=%23000000`;
    } else {
      // Chart placeholder
      return `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><text x='50%' y='50%' text-anchor='middle'>Chart: ${encodedQuery}</text></svg>`;
    }
  }

  /**
   * Search for specific asset type
   */
  async searchAsset(
    query: string,
    type: 'image' | 'icon' | 'chart',
    options?: {
      style?: string;
      color?: string;
      orientation?: 'landscape' | 'portrait' | 'square';
    }
  ): Promise<Asset> {
    // Build search query with options
    let fullQuery = query;

    if (options?.style) fullQuery += ` ${options.style}`;
    if (options?.orientation) fullQuery += ` ${options.orientation}`;

    const placement = this.determineAssetPlacement(type, 0, 1);
    const size = this.determineAssetSize(type);

    return {
      type,
      description: query,
      alt: query,
      url: this.generatePlaceholderURL(fullQuery, type),
      placement,
      size,
    };
  }

  /**
   * Optimize asset for web
   */
  optimizeAsset(asset: Asset, maxWidth?: number, maxHeight?: number): Asset {
    const optimized = { ...asset };

    if (maxWidth && asset.size.width > maxWidth) {
      optimized.size = {
        ...asset.size,
        width: maxWidth,
      };
    }

    if (maxHeight && asset.size.height > maxHeight) {
      optimized.size = {
        ...asset.size,
        height: maxHeight,
      };
    }

    return optimized;
  }

  /**
   * Validate asset
   */
  validateAsset(asset: Asset): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!asset.description || asset.description.trim().length === 0) {
      errors.push('Asset must have a description');
    }

    if (!asset.alt || asset.alt.trim().length === 0) {
      errors.push('Asset must have alt text for accessibility');
    }

    if (!asset.placement) {
      errors.push('Asset must have placement information');
    }

    if (!asset.size) {
      errors.push('Asset must have size information');
    }

    const validTypes = ['image', 'icon', 'chart', 'diagram'];
    if (!validTypes.includes(asset.type)) {
      errors.push(`Invalid asset type: ${asset.type}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Batch process assets for multiple slides
   */
  async batchFindAssets(
    slideContents: string[],
    strategy: AssetStrategy,
    assetsPerSlide: number = 2
  ): Promise<Map<number, Asset[]>> {
    const assetMap = new Map<number, Asset[]>();

    for (let i = 0; i < slideContents.length; i++) {
      // Skip title and closing slides (index 0 and last)
      if (i === 0 || i === slideContents.length - 1) {
        assetMap.set(i, []);
        continue;
      }

      try {
        const assets = await this.findAssets(slideContents[i], strategy, assetsPerSlide);
        assetMap.set(i, assets);
      } catch (error) {
        console.warn(`Failed to find assets for slide ${i}`, error);
        assetMap.set(i, []);
      }
    }

    return assetMap;
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
let assetAgentInstance: AssetAgent | null = null;

/**
 * Get or create asset agent instance
 */
export function getAssetAgent(): AssetAgent {
  if (!assetAgentInstance) {
    assetAgentInstance = new AssetAgent();
  }
  return assetAgentInstance;
}

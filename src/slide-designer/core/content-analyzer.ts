/**
 * Content Analyzer
 * Analyzes slide content to make intelligent layout and design decisions
 */

import { ContentAnalysis, AssetSuggestion } from '../types/index.js';

/**
 * Analyze content to determine optimal layout and design decisions
 */
export class ContentAnalyzer {
  /**
   * Perform comprehensive content analysis
   */
  analyze(content: string): ContentAnalysis {
    const wordCount = this.countWords(content);
    const sentenceCount = this.countSentences(content);
    const hasLists = this.detectLists(content);
    const hasQuotes = this.detectQuotes(content);
    const hasCode = this.detectCode(content);
    const hasNumbers = this.detectNumbers(content);
    const complexity = this.determineComplexity(content, wordCount);
    const tone = this.detectTone(content);
    const keyPoints = this.extractKeyPoints(content);
    const suggestedAssets = this.suggestAssets(content, keyPoints);

    return {
      wordCount,
      sentenceCount,
      hasLists,
      hasQuotes,
      hasCode,
      hasNumbers,
      complexity,
      tone,
      keyPoints,
      suggestedAssets,
    };
  }

  /**
   * Count words in content
   */
  private countWords(content: string): number {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Count sentences in content
   */
  private countSentences(content: string): number {
    const sentences = content.match(/[.!?]+/g);
    return sentences ? sentences.length : 1;
  }

  /**
   * Detect if content contains lists (bullets, numbers)
   */
  private detectLists(content: string): boolean {
    const listPatterns = [
      /^[-*+]\s+/m,           // Bullet points
      /^\d+\.\s+/m,           // Numbered lists
      /^[a-z]\)\s+/im,        // Lettered lists
      /<ul>|<ol>|<li>/i,      // HTML lists
    ];
    return listPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Detect if content contains quotes
   */
  private detectQuotes(content: string): boolean {
    return /["'"].*["'"]|^>\s+/m.test(content) ||
           content.includes('said') ||
           content.includes('stated');
  }

  /**
   * Detect if content contains code
   */
  private detectCode(content: string): boolean {
    const codePatterns = [
      /```[\s\S]*```/,        // Code blocks
      /`[^`]+`/,              // Inline code
      /<code>|<pre>/i,        // HTML code tags
      /function|class|const|let|var|import|export/i, // JS keywords
    ];
    return codePatterns.some(pattern => pattern.test(content));
  }

  /**
   * Detect if content has significant numbers/data
   */
  private detectNumbers(content: string): boolean {
    const numberMatches = content.match(/\b\d+([.,]\d+)?%?\b/g);
    return numberMatches !== null && numberMatches.length >= 3;
  }

  /**
   * Determine content complexity
   */
  private determineComplexity(
    content: string,
    wordCount: number
  ): 'simple' | 'medium' | 'complex' {
    // Calculate average word length
    const words = content.split(/\s+/);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;

    // Count complex words (3+ syllables, rough approximation)
    const complexWords = words.filter(word => word.length > 8).length;
    const complexWordRatio = complexWords / words.length;

    if (wordCount < 50 && avgWordLength < 6 && complexWordRatio < 0.1) {
      return 'simple';
    } else if (wordCount > 150 || avgWordLength > 7 || complexWordRatio > 0.3) {
      return 'complex';
    } else {
      return 'medium';
    }
  }

  /**
   * Detect content tone
   */
  private detectTone(content: string): 'formal' | 'casual' | 'technical' {
    const formalIndicators = ['furthermore', 'therefore', 'consequently', 'hereby', 'wherein'];
    const casualIndicators = ['you', 'we', "let's", 'easy', 'simple', 'great'];
    const technicalIndicators = ['algorithm', 'function', 'data', 'system', 'process', 'implementation'];

    const lowerContent = content.toLowerCase();

    const formalCount = formalIndicators.filter(word => lowerContent.includes(word)).length;
    const casualCount = casualIndicators.filter(word => lowerContent.includes(word)).length;
    const technicalCount = technicalIndicators.filter(word => lowerContent.includes(word)).length;

    if (technicalCount > formalCount && technicalCount > casualCount) {
      return 'technical';
    } else if (casualCount > formalCount) {
      return 'casual';
    } else {
      return 'formal';
    }
  }

  /**
   * Extract key points from content
   */
  private extractKeyPoints(content: string): string[] {
    const points: string[] = [];

    // Extract list items
    const listItems = content.match(/^[-*+]\s+(.+)$/gm) ||
                     content.match(/^\d+\.\s+(.+)$/gm);
    if (listItems) {
      points.push(...listItems.map(item => item.replace(/^[-*+\d.]\s+/, '').trim()));
    }

    // Extract sentences with key phrases
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const keyPhrases = ['important', 'key', 'critical', 'essential', 'must', 'should'];

    sentences.forEach(sentence => {
      if (keyPhrases.some(phrase => sentence.toLowerCase().includes(phrase))) {
        points.push(sentence.trim());
      }
    });

    // If no points found, use first few sentences
    if (points.length === 0 && sentences.length > 0) {
      points.push(...sentences.slice(0, 3).map(s => s.trim()));
    }

    return points.slice(0, 5); // Limit to 5 key points
  }

  /**
   * Suggest assets (images/icons) based on content
   */
  private suggestAssets(content: string, keyPoints: string[]): AssetSuggestion[] {
    const suggestions: AssetSuggestion[] = [];
    const lowerContent = content.toLowerCase();

    // Define topic-to-asset mappings
    const assetMappings = [
      {
        keywords: ['team', 'people', 'collaboration', 'group'],
        type: 'image' as const,
        description: 'Team collaboration or group of people',
        searchQuery: 'professional team collaboration',
        relevance: 0.9,
      },
      {
        keywords: ['technology', 'computer', 'software', 'digital'],
        type: 'image' as const,
        description: 'Technology or digital concept',
        searchQuery: 'modern technology workspace',
        relevance: 0.85,
      },
      {
        keywords: ['growth', 'increase', 'success', 'achievement'],
        type: 'icon' as const,
        description: 'Growth or upward trend icon',
        searchQuery: 'growth chart icon',
        relevance: 0.8,
      },
      {
        keywords: ['data', 'analytics', 'metrics', 'statistics'],
        type: 'chart' as const,
        description: 'Data visualization or chart',
        searchQuery: 'data analytics dashboard',
        relevance: 0.9,
      },
      {
        keywords: ['security', 'protection', 'safety', 'privacy'],
        type: 'icon' as const,
        description: 'Security or protection icon',
        searchQuery: 'security shield icon',
        relevance: 0.85,
      },
      {
        keywords: ['innovation', 'idea', 'creative', 'design'],
        type: 'image' as const,
        description: 'Creative or innovative concept',
        searchQuery: 'innovation lightbulb creative',
        relevance: 0.8,
      },
      {
        keywords: ['business', 'corporate', 'professional', 'office'],
        type: 'image' as const,
        description: 'Business or professional setting',
        searchQuery: 'modern business office',
        relevance: 0.75,
      },
    ];

    // Match content against mappings
    assetMappings.forEach(mapping => {
      const matchCount = mapping.keywords.filter(keyword =>
        lowerContent.includes(keyword)
      ).length;

      if (matchCount > 0) {
        suggestions.push({
          type: mapping.type,
          description: mapping.description,
          relevance: mapping.relevance * (matchCount / mapping.keywords.length),
          searchQuery: mapping.searchQuery,
        });
      }
    });

    // Sort by relevance and return top 3
    return suggestions
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 3);
  }

  /**
   * Determine if content should have images or icons
   */
  shouldUseImages(analysis: ContentAnalysis): boolean {
    // Use images for:
    // - Longer, descriptive content
    // - Low complexity (more narrative)
    // - When suggested assets include images
    const hasImageSuggestions = analysis.suggestedAssets.some(a => a.type === 'image');
    const isDescriptive = analysis.wordCount > 50 && analysis.complexity !== 'complex';

    return hasImageSuggestions || isDescriptive;
  }

  /**
   * Determine if content should use icons
   */
  shouldUseIcons(analysis: ContentAnalysis): boolean {
    // Use icons for:
    // - Lists and bullet points
    // - Technical or complex content
    // - When suggested assets include icons
    const hasIconSuggestions = analysis.suggestedAssets.some(a => a.type === 'icon');
    const isList = analysis.hasLists;
    const isComplex = analysis.complexity === 'complex' || analysis.tone === 'technical';

    return hasIconSuggestions || isList || isComplex;
  }

  /**
   * Get recommended visual count
   */
  getRecommendedVisualCount(analysis: ContentAnalysis): number {
    if (analysis.wordCount < 30) return 1;
    if (analysis.wordCount < 100) return 2;
    if (analysis.hasLists && analysis.keyPoints.length > 3) return 3;
    return 2;
  }
}

/**
 * Singleton instance
 */
let analyzerInstance: ContentAnalyzer | null = null;

/**
 * Get or create content analyzer instance
 */
export function getContentAnalyzer(): ContentAnalyzer {
  if (!analyzerInstance) {
    analyzerInstance = new ContentAnalyzer();
  }
  return analyzerInstance;
}

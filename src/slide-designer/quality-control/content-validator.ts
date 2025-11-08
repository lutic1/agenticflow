/**
 * Content Validation Engine
 * Pre-generation content quality checks
 * Enforces Nancy Duarte rules, readability standards, and best practices
 */

import { GeminiClient } from '../core/gemini-client';

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'suggestion';
  check: (content: SlideContent) => boolean;
  message: (content: SlideContent) => string;
  autofix?: (content: SlideContent) => Promise<SlideContent>;
}

export interface SlideContent {
  id: string;
  title?: string;
  subtitle?: string;
  body?: string;
  bullets?: string[];
  type: 'title' | 'content' | 'image' | 'data' | 'closing';
}

export interface ValidationError {
  ruleId: string;
  type: 'error' | 'warning' | 'suggestion';
  message: string;
  location: string; // slide ID
  severity: 'error' | 'warning' | 'suggestion';
  autofix?: () => Promise<SlideContent>;
}

export interface ValidationReport {
  errors: ValidationError[];
  warnings: ValidationError[];
  suggestions: ValidationError[];
  overallScore: number; // 0-100
  canProceed: boolean; // false if errors exist
  summary: {
    totalIssues: number;
    errorCount: number;
    warningCount: number;
    suggestionCount: number;
  };
}

/**
 * Content Validator
 * Validates slide content before generation
 */
export class ContentValidator {
  private geminiClient: GeminiClient;

  // Nancy Duarte limits
  private limits = {
    titleMaxWords: 8,
    bulletMaxWords: 12,
    slideMaxWords: 75,
    maxBullets: 5,
    lineMaxChars: 75
  };

  // Validation rules
  private rules: ValidationRule[] = [
    {
      id: 'word-count-exceeded',
      name: 'Word Count Exceeded',
      description: 'Slide has too many words (Nancy Duarte 75-word rule)',
      severity: 'error',
      check: (content) => this.countWords(content) > this.limits.slideMaxWords,
      message: (content) =>
        `Slide has ${this.countWords(content)} words (maximum ${this.limits.slideMaxWords} per Nancy Duarte)`,
      autofix: async (content) => this.summarizeWithAI(content, this.limits.slideMaxWords)
    },
    {
      id: 'too-many-bullets',
      name: 'Too Many Bullets',
      description: 'More than 5 bullet points (McKinsey standard)',
      severity: 'error',
      check: (content) => (content.bullets?.length || 0) > this.limits.maxBullets,
      message: (content) =>
        `Slide has ${content.bullets?.length} bullets (maximum ${this.limits.maxBullets} per McKinsey standard)`,
      autofix: async (content) => this.splitOrCondenseBullets(content)
    },
    {
      id: 'title-too-long',
      name: 'Title Too Long',
      description: 'Title exceeds 8 words',
      severity: 'warning',
      check: (content) =>
        content.title ? content.title.split(/\s+/).length > this.limits.titleMaxWords : false,
      message: (content) =>
        `Title has ${content.title?.split(/\s+/).length} words (recommend ≤${this.limits.titleMaxWords})`,
      autofix: async (content) => this.condenseTitle(content)
    },
    {
      id: 'readability-complex',
      name: 'Readability Too Complex',
      description: 'Content is difficult to read (Flesch-Kincaid grade level)',
      severity: 'warning',
      check: (content) => this.fleschKincaid(this.getAllText(content)) > 12,
      message: (content) =>
        `Reading level is grade ${this.fleschKincaid(this.getAllText(content))} (target: 8-10 for business)`,
      autofix: async (content) => this.simplifyLanguage(content)
    },
    {
      id: 'passive-voice',
      name: 'Passive Voice Detected',
      description: 'Content uses passive voice',
      severity: 'suggestion',
      check: (content) => this.hasPassiveVoice(this.getAllText(content)),
      message: () => 'Consider using active voice for impact',
      autofix: async (content) => this.convertToActiveVoice(content)
    },
    {
      id: 'empty-slide',
      name: 'Empty Slide',
      description: 'Slide has no content',
      severity: 'error',
      check: (content) => !content.title && !content.body && !content.bullets?.length,
      message: () => 'Slide is empty (no title, body, or bullets)'
    },
    {
      id: 'line-too-long',
      name: 'Line Too Long',
      description: 'Lines exceed optimal character count',
      severity: 'warning',
      check: (content) => {
        const lines = [
          content.title || '',
          content.subtitle || '',
          content.body || '',
          ...(content.bullets || [])
        ];
        return lines.some(line => line.length > this.limits.lineMaxChars + 15);
      },
      message: (content) => {
        const longestLine = Math.max(
          ...[content.title || '', content.subtitle || '', content.body || '', ...(content.bullets || [])].map(
            l => l.length
          )
        );
        return `Longest line is ${longestLine} characters (optimal ≤${this.limits.lineMaxChars})`;
      }
    }
  ];

  constructor() {
    this.geminiClient = new GeminiClient({
      apiKey: process.env.GEMINI_API_KEY || '',
      model: 'gemini-2.5-flash'
    });
  }

  /**
   * Validate content
   */
  validate(content: SlideContent[]): ValidationReport {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const suggestions: ValidationError[] = [];

    for (const slide of content) {
      for (const rule of this.rules) {
        if (rule.check(slide)) {
          const error: ValidationError = {
            ruleId: rule.id,
            type: rule.severity,
            message: rule.message(slide),
            location: slide.id,
            severity: rule.severity,
            autofix: rule.autofix ? () => rule.autofix!(slide) : undefined
          };

          if (rule.severity === 'error') {
            errors.push(error);
          } else if (rule.severity === 'warning') {
            warnings.push(error);
          } else {
            suggestions.push(error);
          }
        }
      }
    }

    const totalIssues = errors.length + warnings.length + suggestions.length;
    const score = Math.max(0, 100 - errors.length * 20 - warnings.length * 10 - suggestions.length * 5);

    return {
      errors,
      warnings,
      suggestions,
      overallScore: score,
      canProceed: errors.length === 0,
      summary: {
        totalIssues,
        errorCount: errors.length,
        warningCount: warnings.length,
        suggestionCount: suggestions.length
      }
    };
  }

  /**
   * Auto-fix content issues with AI
   */
  async autoFixAll(content: SlideContent[], report: ValidationReport): Promise<SlideContent[]> {
    const fixedContent = [...content];

    // Fix errors first
    for (const error of report.errors) {
      if (error.autofix) {
        const slideIndex = content.findIndex(s => s.id === error.location);
        if (slideIndex !== -1) {
          try {
            fixedContent[slideIndex] = await error.autofix();
          } catch (err) {
            console.error(`Failed to autofix ${error.ruleId}:`, err);
          }
        }
      }
    }

    return fixedContent;
  }

  /**
   * Count words in slide content
   */
  private countWords(content: SlideContent): number {
    const text = this.getAllText(content);
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Get all text from slide
   */
  private getAllText(content: SlideContent): string {
    return [content.title, content.subtitle, content.body, ...(content.bullets || [])]
      .filter(Boolean)
      .join(' ');
  }

  /**
   * Calculate Flesch-Kincaid reading grade level
   */
  private fleschKincaid(text: string): number {
    const words = text.split(/\s+/).length;
    const sentences = (text.match(/[.!?]+/g) || []).length || 1;
    const syllables = this.countSyllables(text);

    const gradeLevel = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
    return Math.round(gradeLevel * 10) / 10;
  }

  /**
   * Count syllables (rough estimate)
   */
  private countSyllables(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    return words.reduce((count, word) => {
      const matches = word.match(/[aeiouy]{1,2}/g);
      return count + (matches ? matches.length : 0);
    }, 0);
  }

  /**
   * Check for passive voice
   */
  private hasPassiveVoice(text: string): boolean {
    const passivePatterns = [
      /\b(am|is|are|was|were|been|being)\s+\w+ed\b/gi,
      /\b(am|is|are|was|were|been|being)\s+\w+en\b/gi
    ];

    return passivePatterns.some(pattern => pattern.test(text));
  }

  /**
   * AI-powered summarization
   */
  private async summarizeWithAI(content: SlideContent, targetWords: number): Promise<SlideContent> {
    const prompt = `
      Summarize this slide content to approximately ${targetWords} words while preserving key points:

      Title: ${content.title}
      ${content.subtitle ? `Subtitle: ${content.subtitle}` : ''}
      ${content.body ? `Body: ${content.body}` : ''}
      ${content.bullets?.length ? `Bullets:\n${content.bullets.join('\n')}` : ''}

      Requirements:
      - Keep most important 3-5 points
      - Use clear, concise language
      - Maintain professional tone
      - Output in the same structure (title, bullets, etc.)
      - Target word count: ${targetWords}
    `;

    try {
      const result = await this.geminiClient.generateContent(prompt);
      // Parse result and update content (simplified for now)
      return {
        ...content,
        body: result.text.slice(0, targetWords * 6) // Rough approximation
      };
    } catch (error) {
      console.error('AI summarization failed:', error);
      return content; // Return original on error
    }
  }

  /**
   * Split or condense bullets
   */
  private async splitOrCondenseBullets(content: SlideContent): Promise<SlideContent> {
    if (!content.bullets || content.bullets.length <= this.limits.maxBullets) {
      return content;
    }

    const prompt = `
      Condense these ${content.bullets.length} bullet points to ${this.limits.maxBullets} concise points:

      ${content.bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}

      Requirements:
      - Combine related points
      - Keep most important information
      - Each bullet ≤12 words
      - Output exactly ${this.limits.maxBullets} bullets
    `;

    try {
      const result = await this.geminiClient.generateContent(prompt);
      const condensedBullets = result.text
        .split('\n')
        .filter(line => line.trim())
        .slice(0, this.limits.maxBullets);

      return {
        ...content,
        bullets: condensedBullets
      };
    } catch (error) {
      console.error('Bullet condensation failed:', error);
      return {
        ...content,
        bullets: content.bullets.slice(0, this.limits.maxBullets) // Simple truncation fallback
      };
    }
  }

  /**
   * Condense title
   */
  private async condenseTitle(content: SlideContent): Promise<SlideContent> {
    if (!content.title) return content;

    const prompt = `
      Shorten this title to maximum ${this.limits.titleMaxWords} words while keeping its meaning:

      "${content.title}"

      Requirements:
      - Maximum ${this.limits.titleMaxWords} words
      - Keep key message
      - Professional tone
      - Output only the shortened title
    `;

    try {
      const result = await this.geminiClient.generateContent(prompt);
      return {
        ...content,
        title: result.text.trim()
      };
    } catch (error) {
      console.error('Title condensation failed:', error);
      // Fallback: simple truncation
      const words = content.title.split(/\s+/);
      return {
        ...content,
        title: words.slice(0, this.limits.titleMaxWords).join(' ')
      };
    }
  }

  /**
   * Simplify language
   */
  private async simplifyLanguage(content: SlideContent): Promise<SlideContent> {
    const prompt = `
      Simplify this content to 8th-10th grade reading level:

      ${this.getAllText(content)}

      Requirements:
      - Use shorter sentences
      - Replace complex words with simpler alternatives
      - Maintain professional tone
      - Keep same structure
    `;

    try {
      const result = await this.geminiClient.generateContent(prompt);
      return {
        ...content,
        body: result.text
      };
    } catch (error) {
      console.error('Language simplification failed:', error);
      return content;
    }
  }

  /**
   * Convert to active voice
   */
  private async convertToActiveVoice(content: SlideContent): Promise<SlideContent> {
    const text = this.getAllText(content);

    const prompt = `
      Convert this text from passive to active voice:

      ${text}

      Requirements:
      - Use active voice throughout
      - Keep same meaning
      - Maintain professional tone
      - Keep same structure
    `;

    try {
      const result = await this.geminiClient.generateContent(prompt);
      return {
        ...content,
        body: result.text
      };
    } catch (error) {
      console.error('Active voice conversion failed:', error);
      return content;
    }
  }

  /**
   * Get validation rules
   */
  getRules(): ValidationRule[] {
    return [...this.rules];
  }

  /**
   * Get limits
   */
  getLimits() {
    return { ...this.limits };
  }
}

// Default export
export const contentValidator = new ContentValidator();

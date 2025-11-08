/**
 * Content Agent
 * Generates presentation outlines and content.md files
 */

import {
  ContentOutline,
  OutlineSection,
  ResearchResult,
  AgentTask,
  AgentError,
  Slide,
} from '../types/index.js';
import { getGeminiClient } from '../core/gemini-client.js';

/**
 * Content Agent for generating presentation outlines and content
 */
export class ContentAgent {
  private gemini = getGeminiClient();
  private taskHistory: AgentTask[] = [];

  /**
   * Generate presentation outline from topic and research
   */
  async generateOutline(
    topic: string,
    research?: ResearchResult,
    targetSlides?: number
  ): Promise<ContentOutline> {
    const taskId = `content-outline-${Date.now()}`;
    const task: AgentTask = {
      id: taskId,
      type: 'content',
      description: `Generate outline for: ${topic}`,
      priority: 'high',
      status: 'in_progress',
      input: { topic, targetSlides },
      startTime: new Date(),
    };

    this.taskHistory.push(task);

    try {
      const outlineJSON = await this.gemini.generateOutline(topic, targetSlides);
      const outline = this.parseOutline(outlineJSON, topic);

      // Enhance with research data if available
      if (research) {
        this.enhanceOutlineWithResearch(outline, research);
      }

      task.status = 'completed';
      task.output = outline;
      task.endTime = new Date();

      return outline;
    } catch (error) {
      task.status = 'failed';
      task.error = (error as Error).message;
      task.endTime = new Date();

      throw new AgentError(
        `Failed to generate outline for: ${topic}`,
        'content',
        { originalError: (error as Error).message }
      );
    }
  }

  /**
   * Parse outline JSON
   */
  private parseOutline(outlineJSON: string, topic: string): ContentOutline {
    try {
      const data = JSON.parse(outlineJSON);

      const sections: OutlineSection[] = (data.sections || []).map((s: any) => ({
        title: s.title || 'Untitled Section',
        points: Array.isArray(s.points) ? s.points : [],
        slideCount: s.slideCount || 1,
        hasVisuals: s.hasVisuals !== false, // Default to true
      }));

      return {
        title: data.title || topic,
        sections,
        totalSlides: data.totalSlides || sections.reduce((sum, s) => sum + s.slideCount, 0),
        estimatedDuration: data.estimatedDuration || sections.length * 2,
        tone: data.tone || 'formal',
      };
    } catch (error) {
      throw new AgentError(
        'Failed to parse outline JSON',
        'content',
        { parseError: (error as Error).message, rawContent: outlineJSON }
      );
    }
  }

  /**
   * Enhance outline with research data
   */
  private enhanceOutlineWithResearch(
    outline: ContentOutline,
    research: ResearchResult
  ): void {
    // Add research key points to sections
    const pointsPerSection = Math.ceil(research.keyPoints.length / outline.sections.length);

    outline.sections.forEach((section, index) => {
      const startIdx = index * pointsPerSection;
      const endIdx = startIdx + pointsPerSection;
      const relevantPoints = research.keyPoints.slice(startIdx, endIdx);

      // Merge with existing points, avoiding duplicates
      const existingPoints = new Set(section.points.map(p => p.toLowerCase()));
      relevantPoints.forEach(point => {
        if (!existingPoints.has(point.toLowerCase())) {
          section.points.push(point);
        }
      });
    });
  }

  /**
   * Generate detailed content for each slide
   */
  async generateSlideContents(outline: ContentOutline): Promise<string[]> {
    const contents: string[] = [];

    // Title slide
    contents.push(this.generateTitleSlideContent(outline));

    // Content slides for each section
    for (const section of outline.sections) {
      if (section.slideCount === 1) {
        const content = await this.generateSectionContent(
          outline.title,
          section.title,
          section.points
        );
        contents.push(content);
      } else {
        // Split points across multiple slides
        const pointsPerSlide = Math.ceil(section.points.length / section.slideCount);
        for (let i = 0; i < section.slideCount; i++) {
          const startIdx = i * pointsPerSlide;
          const endIdx = startIdx + pointsPerSlide;
          const slidePoints = section.points.slice(startIdx, endIdx);

          const content = await this.generateSectionContent(
            outline.title,
            `${section.title} ${section.slideCount > 1 ? `(${i + 1}/${section.slideCount})` : ''}`,
            slidePoints
          );
          contents.push(content);
        }
      }
    }

    // Closing slide
    contents.push(this.generateClosingSlideContent(outline));

    return contents;
  }

  /**
   * Generate title slide content
   */
  private generateTitleSlideContent(outline: ContentOutline): string {
    return `# ${outline.title}

*${outline.sections.length} sections | ${outline.estimatedDuration} minutes*`;
  }

  /**
   * Generate section content
   */
  private async generateSectionContent(
    presentationTitle: string,
    sectionTitle: string,
    points: string[]
  ): Promise<string> {
    try {
      const contentJSON = await this.gemini.generateSlideContent(
        presentationTitle,
        sectionTitle,
        points
      );

      const data = JSON.parse(contentJSON);
      return data.content || points.map(p => `- ${p}`).join('\n');
    } catch (error) {
      // Fallback to simple bullet points
      return `## ${sectionTitle}\n\n${points.map(p => `- ${p}`).join('\n')}`;
    }
  }

  /**
   * Generate closing slide content
   */
  private generateClosingSlideContent(outline: ContentOutline): string {
    return `# Thank You

## Questions?

*${outline.title}*`;
  }

  /**
   * Generate content.md file
   */
  async generateContentMarkdown(
    outline: ContentOutline,
    slideContents: string[]
  ): Promise<string> {
    const markdown: string[] = [];

    // Header
    markdown.push(`# ${outline.title}`);
    markdown.push('');
    markdown.push(`**Total Slides:** ${outline.totalSlides}`);
    markdown.push(`**Estimated Duration:** ${outline.estimatedDuration} minutes`);
    markdown.push(`**Tone:** ${outline.tone}`);
    markdown.push('');
    markdown.push('---');
    markdown.push('');

    // Table of Contents
    markdown.push('## Table of Contents');
    markdown.push('');
    outline.sections.forEach((section, index) => {
      markdown.push(`${index + 1}. ${section.title} (${section.slideCount} slide${section.slideCount > 1 ? 's' : ''})`);
    });
    markdown.push('');
    markdown.push('---');
    markdown.push('');

    // Sections with content
    markdown.push('## Sections');
    markdown.push('');

    outline.sections.forEach((section, index) => {
      markdown.push(`### ${index + 1}. ${section.title}`);
      markdown.push('');
      markdown.push(`**Slides:** ${section.slideCount}`);
      markdown.push(`**Visuals:** ${section.hasVisuals ? 'Yes' : 'No'}`);
      markdown.push('');
      markdown.push('**Key Points:**');
      section.points.forEach(point => {
        markdown.push(`- ${point}`);
      });
      markdown.push('');
      markdown.push('---');
      markdown.push('');
    });

    // Full slide content
    markdown.push('## Detailed Slide Content');
    markdown.push('');

    slideContents.forEach((content, index) => {
      markdown.push(`### Slide ${index + 1}`);
      markdown.push('');
      markdown.push(content);
      markdown.push('');
      markdown.push('---');
      markdown.push('');
    });

    return markdown.join('\n');
  }

  /**
   * Optimize outline for target duration
   */
  optimizeForDuration(outline: ContentOutline, targetMinutes: number): ContentOutline {
    const currentDuration = outline.estimatedDuration;

    if (currentDuration === targetMinutes) {
      return outline;
    }

    const ratio = targetMinutes / currentDuration;
    const optimized = { ...outline };

    optimized.sections = outline.sections.map(section => ({
      ...section,
      slideCount: Math.max(1, Math.round(section.slideCount * ratio)),
    }));

    optimized.totalSlides = optimized.sections.reduce((sum, s) => sum + s.slideCount, 0);
    optimized.estimatedDuration = targetMinutes;

    return optimized;
  }

  /**
   * Validate outline structure
   */
  validateOutline(outline: ContentOutline): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!outline.title || outline.title.trim().length === 0) {
      errors.push('Outline must have a title');
    }

    if (!outline.sections || outline.sections.length === 0) {
      errors.push('Outline must have at least one section');
    }

    outline.sections.forEach((section, index) => {
      if (!section.title || section.title.trim().length === 0) {
        errors.push(`Section ${index + 1} is missing a title`);
      }

      if (!section.points || section.points.length === 0) {
        errors.push(`Section ${index + 1} has no key points`);
      }

      if (section.slideCount < 1) {
        errors.push(`Section ${index + 1} has invalid slide count: ${section.slideCount}`);
      }
    });

    if (outline.totalSlides < 3) {
      errors.push('Presentation should have at least 3 slides');
    }

    if (outline.totalSlides > 50) {
      errors.push('Presentation has too many slides (maximum 50)');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
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
let contentAgentInstance: ContentAgent | null = null;

/**
 * Get or create content agent instance
 */
export function getContentAgent(): ContentAgent {
  if (!contentAgentInstance) {
    contentAgentInstance = new ContentAgent();
  }
  return contentAgentInstance;
}

/**
 * Generator Agent
 * Orchestrates HTML code generation for complete presentations
 */

import {
  Slide,
  Theme,
  Asset,
  LayoutType,
  ContentOutline,
  DesignDecision,
  SlideMetadata,
  AgentTask,
  AgentError,
  HTMLGenerationResult,
} from '../types/index.js';
import { getHTMLRenderer } from '../core/html-renderer.js';

/**
 * Generator Agent for HTML slide generation
 */
export class GeneratorAgent {
  private renderer = getHTMLRenderer();
  private taskHistory: AgentTask[] = [];

  /**
   * Generate complete presentation
   */
  async generatePresentation(
    outline: ContentOutline,
    slideContents: string[],
    designDecision: DesignDecision,
    assetMap: Map<number, Asset[]>
  ): Promise<HTMLGenerationResult> {
    const taskId = `generate-${Date.now()}`;
    const task: AgentTask = {
      id: taskId,
      type: 'generator',
      description: 'Generate HTML presentation',
      priority: 'high',
      status: 'in_progress',
      input: { outline, slideCount: slideContents.length },
      startTime: new Date(),
    };

    this.taskHistory.push(task);

    try {
      // Build slide objects
      const slides = this.buildSlides(
        outline,
        slideContents,
        designDecision,
        assetMap
      );

      // Validate slides
      this.validateSlides(slides);

      // Render to HTML
      const result = await this.renderer.renderPresentation(
        slides,
        designDecision.theme,
        {
          includeCSS: true,
          includeJS: true,
          responsive: true,
          printable: true,
          exportFormat: 'standalone',
        }
      );

      task.status = 'completed';
      task.output = { slideCount: slides.length, warnings: result.warnings };
      task.endTime = new Date();

      return result;
    } catch (error) {
      task.status = 'failed';
      task.error = (error as Error).message;
      task.endTime = new Date();

      throw new AgentError(
        'Failed to generate presentation',
        'generator',
        { originalError: (error as Error).message }
      );
    }
  }

  /**
   * Build slide objects from components
   */
  private buildSlides(
    outline: ContentOutline,
    slideContents: string[],
    designDecision: DesignDecision,
    assetMap: Map<number, Asset[]>
  ): Slide[] {
    const slides: Slide[] = [];

    slideContents.forEach((content, index) => {
      const layoutType = designDecision.layoutMap.get(index) || 'content-only';
      const assets = assetMap.get(index) || [];

      // Extract title from content
      const title = this.extractTitle(content);
      const cleanContent = this.removeTitle(content);

      const slide: Slide = {
        id: `slide-${index}`,
        title,
        content: cleanContent,
        layout: layoutType,
        theme: designDecision.theme,
        assets: assets.length > 0 ? assets : undefined,
        metadata: this.createMetadata(index, outline),
      };

      slides.push(slide);
    });

    return slides;
  }

  /**
   * Extract title from markdown content
   */
  private extractTitle(content: string): string {
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      return titleMatch[1].trim();
    }

    // Try h2
    const h2Match = content.match(/^##\s+(.+)$/m);
    if (h2Match) {
      return h2Match[1].trim();
    }

    // Use first line as fallback
    const firstLine = content.split('\n')[0];
    return firstLine.replace(/^#+\s*/, '').trim() || 'Untitled Slide';
  }

  /**
   * Remove title from content
   */
  private removeTitle(content: string): string {
    // Remove first heading
    return content.replace(/^#+ .+\n*/m, '').trim();
  }

  /**
   * Create slide metadata
   */
  private createMetadata(index: number, outline: ContentOutline): SlideMetadata {
    return {
      order: index,
      duration: 60, // Default 60 seconds per slide
      transitions: 'fade',
      notes: '', // Could be populated from outline or content
      tags: this.generateTags(index, outline),
    };
  }

  /**
   * Generate tags for slide
   */
  private generateTags(index: number, outline: ContentOutline): string[] {
    const tags: string[] = [];

    if (index === 0) {
      tags.push('title', 'intro');
    } else if (index === outline.totalSlides - 1) {
      tags.push('conclusion', 'closing');
    } else {
      // Find which section this slide belongs to
      let slideCounter = 1; // Skip title slide
      for (const section of outline.sections) {
        if (index >= slideCounter && index < slideCounter + section.slideCount) {
          tags.push(section.title.toLowerCase().replace(/\s+/g, '-'));
          if (section.hasVisuals) tags.push('visual');
          break;
        }
        slideCounter += section.slideCount;
      }
    }

    return tags;
  }

  /**
   * Validate slides before generation
   */
  private validateSlides(slides: Slide[]): void {
    if (slides.length < 3) {
      throw new AgentError(
        'Presentation must have at least 3 slides',
        'generator',
        { slideCount: slides.length }
      );
    }

    slides.forEach((slide, index) => {
      if (!slide.title && index !== 0) {
        console.warn(`Slide ${index} missing title`);
      }

      if (!slide.content || slide.content.trim().length === 0) {
        throw new AgentError(
          `Slide ${index} has no content`,
          'generator',
          { slideIndex: index, slideId: slide.id }
        );
      }

      if (slide.content.length > 1000) {
        console.warn(`Slide ${index} has excessive content (${slide.content.length} chars)`);
      }
    });
  }

  /**
   * Generate individual slide HTML
   */
  async generateSlide(
    content: string,
    layout: LayoutType,
    theme: Theme,
    assets?: Asset[]
  ): Promise<string> {
    const title = this.extractTitle(content);
    const cleanContent = this.removeTitle(content);

    const slide: Slide = {
      id: `slide-single-${Date.now()}`,
      title,
      content: cleanContent,
      layout,
      theme,
      assets,
      metadata: {
        order: 0,
      },
    };

    const result = await this.renderer.renderPresentation(
      [slide],
      theme,
      { exportFormat: 'embed' }
    );

    return result.html;
  }

  /**
   * Export presentation in different formats
   */
  async exportPresentation(
    slides: Slide[],
    theme: Theme,
    format: 'html' | 'pdf' | 'pptx' | 'markdown'
  ): Promise<string | Buffer> {
    switch (format) {
      case 'html':
        const htmlResult = await this.renderer.renderPresentation(slides, theme, {
          exportFormat: 'standalone',
        });
        return htmlResult.html;

      case 'markdown':
        return this.exportToMarkdown(slides);

      case 'pdf':
      case 'pptx':
        // These would require additional libraries (puppeteer for PDF, pptxgenjs for PPTX)
        throw new AgentError(
          `Export format ${format} not yet implemented`,
          'generator',
          { format }
        );

      default:
        throw new AgentError(
          `Unknown export format: ${format}`,
          'generator',
          { format }
        );
    }
  }

  /**
   * Export to markdown
   */
  private exportToMarkdown(slides: Slide[]): string {
    const markdown: string[] = [];

    slides.forEach((slide, index) => {
      markdown.push(`---`);
      markdown.push(`<!-- Slide ${index + 1} -->`);
      markdown.push('');
      markdown.push(`# ${slide.title}`);
      markdown.push('');
      markdown.push(slide.content);
      markdown.push('');

      if (slide.assets && slide.assets.length > 0) {
        markdown.push('**Visual Assets:**');
        slide.assets.forEach(asset => {
          if (asset.url) {
            markdown.push(`- ![${asset.alt}](${asset.url})`);
          }
        });
        markdown.push('');
      }
    });

    markdown.push('---');

    return markdown.join('\n');
  }

  /**
   * Generate presentation metadata
   */
  generateMetadata(slides: Slide[], outline: ContentOutline) {
    const totalDuration = slides.reduce(
      (sum, slide) => sum + (slide.metadata.duration || 60),
      0
    );

    const assetCount = slides.reduce(
      (sum, slide) => sum + (slide.assets?.length || 0),
      0
    );

    return {
      title: outline.title,
      slideCount: slides.length,
      estimatedDuration: totalDuration,
      assetCount,
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
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
    const totalSlides = this.taskHistory
      .filter(t => t.output && 'slideCount' in t.output)
      .reduce((sum, t) => sum + ((t.output as any).slideCount || 0), 0);

    return {
      totalTasks: this.taskHistory.length,
      completed,
      failed,
      successRate: completed / Math.max(this.taskHistory.length, 1),
      totalSlidesGenerated: totalSlides,
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
let generatorAgentInstance: GeneratorAgent | null = null;

/**
 * Get or create generator agent instance
 */
export function getGeneratorAgent(): GeneratorAgent {
  if (!generatorAgentInstance) {
    generatorAgentInstance = new GeneratorAgent();
  }
  return generatorAgentInstance;
}

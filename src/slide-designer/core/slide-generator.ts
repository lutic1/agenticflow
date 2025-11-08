/**
 * Main Slide Generator
 * Orchestrates all agents to generate complete presentations
 */

import {
  SlideGenerationRequest,
  SlideGenerationResult,
  Slide,
  ContentOutline,
  DesignDecision,
  GenerationMetadata,
  SlideDesignerError,
} from '../types/index.js';
import { getResearchAgent } from '../agents/research-agent.js';
import { getContentAgent } from '../agents/content-agent.js';
import { getDesignAgent } from '../agents/design-agent.js';
import { getAssetAgent } from '../agents/asset-agent.js';
import { getGeneratorAgent } from '../agents/generator-agent.js';

/**
 * Main Slide Generator - Orchestrates all agents
 */
export class SlideGenerator {
  private researchAgent = getResearchAgent();
  private contentAgent = getContentAgent();
  private designAgent = getDesignAgent();
  private assetAgent = getAssetAgent();
  private generatorAgent = getGeneratorAgent();

  /**
   * Generate complete presentation from topic
   */
  async generatePresentation(
    request: SlideGenerationRequest
  ): Promise<SlideGenerationResult> {
    const startTime = Date.now();

    try {
      console.log(`🎯 Starting presentation generation for: "${request.topic}"`);

      // Step 1: Research phase
      console.log('📚 Phase 1: Researching topic...');
      const research = await this.researchAgent.research(
        request.topic,
        'comprehensive'
      );
      console.log(`✅ Research complete (confidence: ${(research.confidence * 100).toFixed(0)}%)`);

      // Step 2: Content generation phase
      console.log('✍️  Phase 2: Generating content outline...');
      const outline = await this.contentAgent.generateOutline(
        request.topic,
        research,
        request.slideCount
      );
      console.log(`✅ Outline created (${outline.totalSlides} slides, ${outline.sections.length} sections)`);

      // Step 3: Generate detailed slide contents
      console.log('📝 Phase 3: Generating slide content...');
      const slideContents = await this.contentAgent.generateSlideContents(outline);
      console.log(`✅ Content generated for ${slideContents.length} slides`);

      // Step 4: Design decisions
      console.log('🎨 Phase 4: Making design decisions...');
      const designDecision = await this.designAgent.makeDesignDecisions(
        outline,
        slideContents,
        {
          themeName: request.themePreference,
          preferImages: request.includeImages,
        }
      );
      console.log(`✅ Design complete (theme: ${designDecision.theme.name})`);

      // Step 5: Asset collection
      console.log('🖼️  Phase 5: Finding visual assets...');
      const assetMap = request.includeImages !== false
        ? await this.assetAgent.batchFindAssets(
            slideContents,
            designDecision.assetStrategy,
            2
          )
        : new Map();
      const totalAssets = Array.from(assetMap.values()).reduce(
        (sum, assets) => sum + assets.length,
        0
      );
      console.log(`✅ Assets found (${totalAssets} total)`);

      // Step 6: HTML generation
      console.log('🏗️  Phase 6: Generating HTML presentation...');
      const htmlResult = await this.generatorAgent.generatePresentation(
        outline,
        slideContents,
        designDecision,
        assetMap
      );
      console.log(`✅ HTML generated successfully`);

      // Build final result
      const processingTime = Date.now() - startTime;
      const metadata = this.createMetadata(outline, totalAssets, processingTime);

      console.log(`🎉 Presentation complete! Generated in ${(processingTime / 1000).toFixed(2)}s`);

      // Build slides array (needed for result)
      const slides = this.buildSlidesFromComponents(
        outline,
        slideContents,
        designDecision,
        assetMap
      );

      return {
        slides,
        outline,
        theme: designDecision.theme,
        metadata,
        html: htmlResult.html,
      };
    } catch (error) {
      throw new SlideDesignerError(
        'Presentation generation failed',
        'GENERATION_ERROR',
        {
          topic: request.topic,
          originalError: (error as Error).message,
          processingTime: Date.now() - startTime,
        }
      );
    }
  }

  /**
   * Build slides from all components
   */
  private buildSlidesFromComponents(
    outline: ContentOutline,
    slideContents: string[],
    designDecision: DesignDecision,
    assetMap: Map<number, any[]>
  ): Slide[] {
    return slideContents.map((content, index) => ({
      id: `slide-${index}`,
      title: this.extractTitle(content),
      content: this.removeTitle(content),
      layout: designDecision.layoutMap.get(index) || 'content-only',
      theme: designDecision.theme,
      assets: assetMap.get(index),
      metadata: {
        order: index,
        duration: 60,
      },
    }));
  }

  /**
   * Extract title from content
   */
  private extractTitle(content: string): string {
    const match = content.match(/^#+ (.+)$/m);
    return match ? match[1].trim() : 'Untitled';
  }

  /**
   * Remove title from content
   */
  private removeTitle(content: string): string {
    return content.replace(/^#+ .+\n*/m, '').trim();
  }

  /**
   * Create generation metadata
   */
  private createMetadata(
    outline: ContentOutline,
    totalAssets: number,
    processingTime: number
  ): GenerationMetadata {
    return {
      generatedAt: new Date(),
      totalSlides: outline.totalSlides,
      totalAssets,
      processingTime,
      agentTasks: [
        ...this.researchAgent.getTaskHistory(),
        ...this.contentAgent.getTaskHistory(),
        ...this.designAgent.getTaskHistory(),
        ...this.assetAgent.getTaskHistory(),
        ...this.generatorAgent.getTaskHistory(),
      ],
      version: '1.0.0',
    };
  }

  /**
   * Generate presentation with progress callbacks
   */
  async generateWithProgress(
    request: SlideGenerationRequest,
    onProgress?: (phase: string, progress: number, message: string) => void
  ): Promise<SlideGenerationResult> {
    const updateProgress = (phase: string, progress: number, message: string) => {
      if (onProgress) onProgress(phase, progress, message);
      console.log(`[${progress}%] ${phase}: ${message}`);
    };

    const startTime = Date.now();

    try {
      // Research
      updateProgress('research', 10, 'Researching topic...');
      const research = await this.researchAgent.research(request.topic, 'comprehensive');
      updateProgress('research', 20, `Research complete (${(research.confidence * 100).toFixed(0)}% confidence)`);

      // Content
      updateProgress('content', 30, 'Generating outline...');
      const outline = await this.contentAgent.generateOutline(request.topic, research, request.slideCount);
      updateProgress('content', 40, `Outline created (${outline.totalSlides} slides)`);

      updateProgress('content', 50, 'Generating slide content...');
      const slideContents = await this.contentAgent.generateSlideContents(outline);
      updateProgress('content', 60, `Content generated for ${slideContents.length} slides`);

      // Design
      updateProgress('design', 70, 'Making design decisions...');
      const designDecision = await this.designAgent.makeDesignDecisions(outline, slideContents, {
        themeName: request.themePreference,
        preferImages: request.includeImages,
      });
      updateProgress('design', 75, `Design complete (${designDecision.theme.name} theme)`);

      // Assets
      updateProgress('assets', 80, 'Finding visual assets...');
      const assetMap = request.includeImages !== false
        ? await this.assetAgent.batchFindAssets(slideContents, designDecision.assetStrategy, 2)
        : new Map();
      updateProgress('assets', 85, `Assets collected`);

      // Generation
      updateProgress('generation', 90, 'Generating HTML...');
      const htmlResult = await this.generatorAgent.generatePresentation(
        outline,
        slideContents,
        designDecision,
        assetMap
      );
      updateProgress('generation', 100, 'Complete!');

      const processingTime = Date.now() - startTime;
      const slides = this.buildSlidesFromComponents(outline, slideContents, designDecision, assetMap);

      return {
        slides,
        outline,
        theme: designDecision.theme,
        metadata: this.createMetadata(outline, Array.from(assetMap.values()).flat().length, processingTime),
        html: htmlResult.html,
      };
    } catch (error) {
      throw new SlideDesignerError(
        'Presentation generation failed',
        'GENERATION_ERROR',
        { topic: request.topic, originalError: (error as Error).message }
      );
    }
  }

  /**
   * Get generation statistics across all agents
   */
  getStats() {
    return {
      research: this.researchAgent.getStats(),
      content: this.contentAgent.getStats(),
      design: this.designAgent.getStats(),
      assets: this.assetAgent.getStats(),
      generation: this.generatorAgent.getStats(),
    };
  }

  /**
   * Clear all agent histories
   */
  clearHistory(): void {
    this.researchAgent.clearHistory();
    this.contentAgent.clearHistory();
    this.designAgent.clearHistory();
    this.assetAgent.clearHistory();
    this.generatorAgent.clearHistory();
  }
}

/**
 * Singleton instance
 */
let slideGeneratorInstance: SlideGenerator | null = null;

/**
 * Get or create slide generator instance
 */
export function getSlideGenerator(): SlideGenerator {
  if (!slideGeneratorInstance) {
    slideGeneratorInstance = new SlideGenerator();
  }
  return slideGeneratorInstance;
}

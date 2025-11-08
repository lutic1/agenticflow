/**
 * Agentic Slide Designer
 * Main entry point for the slide generation system
 */

// Core exports
export { SlideGenerator, getSlideGenerator } from './core/slide-generator.js';
export { GeminiClient, getGeminiClient } from './core/gemini-client.js';
export { ContentAnalyzer, getContentAnalyzer } from './core/content-analyzer.js';
export { LayoutEngine, getLayoutEngine } from './core/layout-engine.js';
export { HTMLRenderer, getHTMLRenderer } from './core/html-renderer.js';

// Agent exports
export { ResearchAgent, getResearchAgent } from './agents/research-agent.js';
export { ContentAgent, getContentAgent } from './agents/content-agent.js';
export { DesignAgent, getDesignAgent } from './agents/design-agent.js';
export { AssetAgent, getAssetAgent } from './agents/asset-agent.js';
export { GeneratorAgent, getGeneratorAgent } from './agents/generator-agent.js';

// Configuration exports
export {
  getGeminiConfig,
  validateGeminiConfig,
  GEMINI_PROMPTS,
  GEMINI_MODELS,
  RATE_LIMITS,
} from './config/gemini-config.js';
export {
  THEMES,
  LAYOUT_RULES,
  DESIGN_RULES,
  CONTAINER_RULES,
  ANIMATION_SETTINGS,
  getTheme,
  selectThemeByContext,
} from './config/design-config.js';

// Type exports
export type {
  Slide,
  SlideMetadata,
  Asset,
  AssetPlacement,
  AssetSize,
  LayoutType,
  LayoutDecision,
  DesignRule,
  Theme,
  ColorScheme,
  Typography,
  Spacing,
  VisualEffects,
  ContentAnalysis,
  AssetSuggestion,
  GeminiConfig,
  GeminiRequest,
  GeminiResponse,
  AgentTask,
  AgentType,
  ResearchResult,
  ContentOutline,
  OutlineSection,
  DesignDecision,
  AssetStrategy,
  SlideGenerationRequest,
  SlideGenerationResult,
  GenerationMetadata,
  HTMLSlideOptions,
  HTMLGenerationResult,
} from './types/index.js';

// Error exports
export {
  SlideDesignerError,
  GeminiAPIError,
  LayoutEngineError,
  AgentError,
} from './types/index.js';

// Utility exports
export { Logger, LogLevel, getLogger } from './utils/logger.js';

/**
 * Quick start function for generating presentations
 */
export async function generatePresentation(
  topic: string,
  options?: {
    slideCount?: number;
    tone?: 'formal' | 'casual' | 'technical';
    theme?: string;
    includeImages?: boolean;
  }
) {
  const generator = getSlideGenerator();

  return generator.generatePresentation({
    topic,
    slideCount: options?.slideCount,
    tone: options?.tone,
    themePreference: options?.theme,
    includeImages: options?.includeImages,
  });
}

/**
 * Version information
 */
export const VERSION = '1.0.0';
export const NAME = 'Agentic Slide Designer';

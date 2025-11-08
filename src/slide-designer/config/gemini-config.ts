/**
 * Gemini API Configuration
 * Handles API configuration with environment variable safety
 */

import { GeminiConfig } from '../types/index.js';

/**
 * Get Gemini API configuration from environment variables
 * Never hardcode API keys - always use environment variables
 */
export function getGeminiConfig(): GeminiConfig {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY environment variable is required. ' +
      'Get your API key from https://aistudio.google.com/apikey'
    );
  }

  return {
    apiKey,
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
    temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.7'),
    maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '2048', 10),
    topP: process.env.GEMINI_TOP_P ? parseFloat(process.env.GEMINI_TOP_P) : undefined,
    topK: process.env.GEMINI_TOP_K ? parseInt(process.env.GEMINI_TOP_K, 10) : undefined,
  };
}

/**
 * Validate Gemini configuration
 */
export function validateGeminiConfig(config: GeminiConfig): void {
  if (!config.apiKey || config.apiKey.trim().length === 0) {
    throw new Error('Invalid Gemini API key');
  }

  if (config.temperature < 0 || config.temperature > 2) {
    throw new Error('Temperature must be between 0 and 2');
  }

  if (config.maxTokens < 1 || config.maxTokens > 8192) {
    throw new Error('Max tokens must be between 1 and 8192');
  }
}

/**
 * Create a safe config object for logging (masks API key)
 */
export function getSafeConfigForLogging(config: GeminiConfig): Partial<GeminiConfig> {
  return {
    model: config.model,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
    topP: config.topP,
    topK: config.topK,
    apiKey: '***' + (config.apiKey.slice(-4) || '****'),
  };
}

/**
 * Default prompts for different generation tasks
 */
export const GEMINI_PROMPTS = {
  outlineGeneration: `You are an expert presentation designer. Create a comprehensive outline for a presentation on the given topic.
Include:
- A compelling title
- 5-10 main sections with key points
- Suggested visual elements for each section
- Estimated slide count per section
Format the response as structured JSON.`,

  contentGeneration: `You are a professional slide content writer. Generate engaging, concise content for a presentation slide.
Guidelines:
- Keep text concise and impactful
- Use bullet points for clarity
- Focus on key messages
- Suggest visual elements that would enhance the content
Format the response as structured JSON.`,

  imageDescription: `You are an expert at describing images for search queries. Create detailed, specific image search queries based on the slide content.
Guidelines:
- Be specific and descriptive
- Consider the presentation context
- Suggest professional, high-quality image types
- Include style preferences (photographic, illustration, etc.)
Return a JSON array of search queries with descriptions.`,

  layoutSuggestion: `You are a presentation design expert. Analyze the slide content and suggest the most effective layout.
Consider:
- Content length and complexity
- Presence of lists, quotes, or code
- Need for visual hierarchy
- Balance between text and visuals
Respond with a JSON object containing the recommended layout type and reasoning.`,

  themeGeneration: `You are a professional UI/UX designer specializing in presentations. Create a cohesive color theme based on the presentation topic and tone.
Guidelines:
- Choose colors that reflect the topic and audience
- Ensure sufficient contrast for readability
- Create a harmonious color palette
- Consider accessibility standards
Return a JSON object with the complete theme specification.`,
} as const;

/**
 * Model-specific configurations
 */
export const GEMINI_MODELS = {
  'gemini-2.0-flash-exp': {
    maxTokens: 8192,
    supportedFormats: ['text', 'json'],
    bestFor: 'Fast generation with excellent quality',
  },
  'gemini-1.5-flash': {
    maxTokens: 8192,
    supportedFormats: ['text', 'json'],
    bestFor: 'Fast, efficient generation',
  },
  'gemini-1.5-pro': {
    maxTokens: 8192,
    supportedFormats: ['text', 'json'],
    bestFor: 'Complex reasoning and analysis',
  },
} as const;

/**
 * Rate limiting configuration
 */
export const RATE_LIMITS = {
  requestsPerMinute: 60,
  requestsPerDay: 1500,
  retryAttempts: 3,
  retryDelay: 1000, // milliseconds
  backoffMultiplier: 2,
} as const;

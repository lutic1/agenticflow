/**
 * Gemini 2.5 Flash API Client
 * Robust API client with error handling, retries, and rate limiting
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  GeminiConfig,
  GeminiRequest,
  GeminiResponse,
  GeminiAPIError,
} from '../types/index.js';
import { getGeminiConfig, validateGeminiConfig, RATE_LIMITS } from '../config/gemini-config.js';

/**
 * Gemini API Client with intelligent error handling and retries
 */
export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private config: GeminiConfig;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;

  constructor(config?: Partial<GeminiConfig>) {
    this.config = { ...getGeminiConfig(), ...config };
    validateGeminiConfig(this.config);
    this.genAI = new GoogleGenerativeAI(this.config.apiKey);
  }

  /**
   * Generate content using Gemini API
   */
  async generate(request: GeminiRequest): Promise<GeminiResponse> {
    await this.checkRateLimit();

    const model = this.genAI.getGenerativeModel({
      model: this.config.model,
    });

    const generationConfig = {
      temperature: request.temperature ?? this.config.temperature,
      maxOutputTokens: request.maxTokens ?? this.config.maxTokens,
      topP: this.config.topP,
      topK: this.config.topK,
    };

    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts < RATE_LIMITS.retryAttempts) {
      try {
        const fullPrompt = request.systemPrompt
          ? `${request.systemPrompt}\n\n${request.prompt}`
          : request.prompt;

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
          generationConfig,
        });

        const response = result.response;
        const text = response.text();

        // Parse JSON if requested
        let content = text;
        if (request.format === 'json') {
          try {
            // Extract JSON from markdown code blocks if present
            const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) ||
                             text.match(/```\n?([\s\S]*?)\n?```/);
            if (jsonMatch) {
              content = jsonMatch[1].trim();
            }
            // Validate JSON
            JSON.parse(content);
          } catch (e) {
            throw new GeminiAPIError('Invalid JSON response from API', {
              rawResponse: text,
              parseError: (e as Error).message,
            });
          }
        }

        this.requestCount++;
        this.lastRequestTime = Date.now();

        return {
          content,
          model: this.config.model,
          finishReason: response.candidates?.[0]?.finishReason,
          usage: {
            promptTokens: 0, // Gemini doesn't provide token counts in the same way
            completionTokens: 0,
            totalTokens: 0,
          },
        };
      } catch (error) {
        lastError = error as Error;
        attempts++;

        if (attempts < RATE_LIMITS.retryAttempts) {
          const delay = RATE_LIMITS.retryDelay * Math.pow(RATE_LIMITS.backoffMultiplier, attempts - 1);
          console.warn(`Gemini API request failed (attempt ${attempts}), retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    throw new GeminiAPIError(
      `Failed to generate content after ${RATE_LIMITS.retryAttempts} attempts`,
      {
        lastError: lastError?.message,
        request: { prompt: request.prompt.substring(0, 100) + '...' },
      }
    );
  }

  /**
   * Generate slide outline from topic
   */
  async generateOutline(topic: string, slideCount?: number): Promise<string> {
    const prompt = `Create a professional presentation outline for: "${topic}"

${slideCount ? `Target ${slideCount} slides.` : 'Suggest optimal number of slides (5-10).'}

Return a JSON object with this structure:
{
  "title": "Presentation title",
  "sections": [
    {
      "title": "Section title",
      "points": ["Key point 1", "Key point 2"],
      "slideCount": 2,
      "hasVisuals": true
    }
  ],
  "totalSlides": 8,
  "estimatedDuration": 15,
  "tone": "formal|casual|technical"
}`;

    const response = await this.generate({
      prompt,
      format: 'json',
      temperature: 0.7,
    });

    return response.content;
  }

  /**
   * Generate content for a single slide
   */
  async generateSlideContent(
    topic: string,
    sectionTitle: string,
    points: string[]
  ): Promise<string> {
    const prompt = `Create engaging slide content for a presentation about "${topic}".

Section: ${sectionTitle}
Key points to cover: ${points.join(', ')}

Guidelines:
- Keep text concise and impactful (max 50 words)
- Use clear, active language
- Format with markdown for emphasis
- Suggest 1-2 visual elements that would enhance the content

Return JSON:
{
  "title": "Slide title",
  "content": "Main slide content with markdown formatting",
  "notes": "Presenter notes",
  "visualSuggestions": ["Description of visual 1", "Description of visual 2"]
}`;

    const response = await this.generate({
      prompt,
      format: 'json',
      temperature: 0.8,
    });

    return response.content;
  }

  /**
   * Generate image search queries from slide content
   */
  async generateImageQueries(slideContent: string, count: number = 3): Promise<string> {
    const prompt = `Analyze this slide content and generate ${count} professional image search queries.

Slide content:
${slideContent}

Create specific, detailed search queries that would find high-quality, professional images.
Consider: style (photographic/illustration), mood, composition, and relevance.

Return JSON array:
[
  {
    "query": "Specific search query",
    "description": "What this image should show",
    "style": "photographic|illustration|abstract",
    "priority": "high|medium|low"
  }
]`;

    const response = await this.generate({
      prompt,
      format: 'json',
      temperature: 0.6,
    });

    return response.content;
  }

  /**
   * Suggest optimal layout for slide content
   */
  async suggestLayout(content: string, hasVisuals: boolean): Promise<string> {
    const prompt = `Analyze this slide content and recommend the best layout type.

Content:
${content}

Has visuals: ${hasVisuals}

Available layouts:
- title-slide: Opening slide with title and subtitle
- content-only: Text-focused slide
- content-image-split: Text on one side, image on other
- image-focus: Large image with minimal text
- bullet-points: List-based content
- two-column: Side-by-side content
- quote: Highlighted quote or statement
- section-header: Section divider
- comparison: Compare two concepts
- timeline: Sequential information

Return JSON:
{
  "layoutType": "recommended-layout",
  "reasoning": "Why this layout works best",
  "confidence": 0.95,
  "alternatives": ["alternative-layout-1", "alternative-layout-2"]
}`;

    const response = await this.generate({
      prompt,
      format: 'json',
      temperature: 0.5,
    });

    return response.content;
  }

  /**
   * Generate color theme based on topic and tone
   */
  async generateTheme(topic: string, tone: string): Promise<string> {
    const prompt = `Create a cohesive color theme for a presentation about "${topic}" with a ${tone} tone.

Consider:
- Brand perception and psychology of colors
- Accessibility (WCAG AA contrast ratios)
- Harmony and visual balance
- Professional appearance

Return JSON:
{
  "name": "Theme name",
  "colors": {
    "primary": "#hexcolor",
    "secondary": "#hexcolor",
    "accent": "#hexcolor",
    "background": "#hexcolor",
    "text": "#hexcolor",
    "textSecondary": "#hexcolor"
  },
  "reasoning": "Why these colors work for this presentation"
}`;

    const response = await this.generate({
      prompt,
      format: 'json',
      temperature: 0.7,
    });

    return response.content;
  }

  /**
   * Rate limiting check
   */
  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < 1000) {
      // Minimum 1 second between requests
      await this.sleep(1000 - timeSinceLastRequest);
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current request statistics
   */
  getStats() {
    return {
      requestCount: this.requestCount,
      lastRequestTime: this.lastRequestTime,
      model: this.config.model,
    };
  }
}

/**
 * Singleton instance for global use
 */
let geminiClientInstance: GeminiClient | null = null;

/**
 * Get or create Gemini client instance
 */
export function getGeminiClient(config?: Partial<GeminiConfig>): GeminiClient {
  if (!geminiClientInstance || config) {
    geminiClientInstance = new GeminiClient(config);
  }
  return geminiClientInstance;
}

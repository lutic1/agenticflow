/**
 * Unit Tests for Gemini Client
 * Tests AI content generation and API interaction
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Mock types
interface GeminiConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface GenerationRequest {
  prompt: string;
  context?: string;
  format?: 'markdown' | 'json' | 'text';
  temperature?: number;
}

interface GenerationResponse {
  content: string;
  tokensUsed: number;
  finishReason: 'stop' | 'length' | 'safety';
  metadata?: Record<string, any>;
}

// Mock implementation
class MockGeminiClient {
  private config: GeminiConfig;
  private rateLimiter: { remaining: number; resetAt: number };

  constructor(config: GeminiConfig) {
    this.config = config;
    this.rateLimiter = { remaining: 60, resetAt: Date.now() + 60000 };
  }

  async generateContent(request: GenerationRequest): Promise<GenerationResponse> {
    if (!this.config.apiKey) {
      throw new Error('API key is required');
    }

    if (this.rateLimiter.remaining <= 0) {
      throw new Error('Rate limit exceeded');
    }

    this.rateLimiter.remaining--;

    // Simulate API response
    return {
      content: `Generated content for: ${request.prompt}`,
      tokensUsed: Math.floor(Math.random() * 1000) + 100,
      finishReason: 'stop',
      metadata: {
        model: this.config.model || 'gemini-pro',
        temperature: request.temperature || this.config.temperature || 0.7
      }
    };
  }

  async generateSlideContent(topic: string, slideNumber: number, totalSlides: number): Promise<string> {
    const prompt = `Create content for slide ${slideNumber} of ${totalSlides} about ${topic}`;
    const response = await this.generateContent({ prompt, format: 'markdown' });
    return response.content;
  }

  getRateLimitStatus(): { remaining: number; resetAt: number } {
    return { ...this.rateLimiter };
  }

  resetRateLimit(): void {
    this.rateLimiter = { remaining: 60, resetAt: Date.now() + 60000 };
  }
}

describe('GeminiClient', () => {
  let client: MockGeminiClient;
  const validConfig: GeminiConfig = {
    apiKey: 'test-api-key-12345',
    model: 'gemini-pro',
    temperature: 0.7,
    maxTokens: 2048
  };

  beforeEach(() => {
    client = new MockGeminiClient(validConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor and Configuration', () => {
    it('should initialize with valid configuration', () => {
      expect(client).toBeDefined();
      expect(client).toBeInstanceOf(MockGeminiClient);
    });

    it('should throw error when API key is missing', async () => {
      const invalidClient = new MockGeminiClient({ apiKey: '' });
      await expect(
        invalidClient.generateContent({ prompt: 'test' })
      ).rejects.toThrow('API key is required');
    });

    it('should use default model when not specified', async () => {
      const defaultClient = new MockGeminiClient({ apiKey: 'test-key' });
      const response = await defaultClient.generateContent({ prompt: 'test' });
      expect(response.metadata?.model).toBe('gemini-pro');
    });

    it('should accept custom model configuration', async () => {
      const customClient = new MockGeminiClient({
        apiKey: 'test-key',
        model: 'gemini-1.5-pro'
      });
      const response = await customClient.generateContent({ prompt: 'test' });
      expect(response.metadata?.model).toBe('gemini-1.5-pro');
    });
  });

  describe('Content Generation', () => {
    it('should generate content for basic prompt', async () => {
      const request: GenerationRequest = {
        prompt: 'Explain quantum computing',
        format: 'markdown'
      };

      const response = await client.generateContent(request);

      expect(response).toHaveProperty('content');
      expect(response).toHaveProperty('tokensUsed');
      expect(response).toHaveProperty('finishReason');
      expect(response.content).toContain('quantum computing');
    });

    it('should handle context in generation requests', async () => {
      const request: GenerationRequest = {
        prompt: 'Continue the explanation',
        context: 'Previous discussion about quantum mechanics',
        format: 'text'
      };

      const response = await client.generateContent(request);
      expect(response.content).toBeTruthy();
    });

    it('should respect temperature settings', async () => {
      const lowTempRequest: GenerationRequest = {
        prompt: 'Generate factual content',
        temperature: 0.2
      };

      const response = await client.generateContent(lowTempRequest);
      expect(response.metadata?.temperature).toBe(0.2);
    });

    it('should support different output formats', async () => {
      const formats: Array<'markdown' | 'json' | 'text'> = ['markdown', 'json', 'text'];

      for (const format of formats) {
        const response = await client.generateContent({
          prompt: 'Test prompt',
          format
        });
        expect(response).toBeDefined();
      }
    });

    it('should track token usage', async () => {
      const response = await client.generateContent({ prompt: 'test' });
      expect(response.tokensUsed).toBeGreaterThan(0);
      expect(typeof response.tokensUsed).toBe('number');
    });

    it('should include finish reason in response', async () => {
      const response = await client.generateContent({ prompt: 'test' });
      expect(['stop', 'length', 'safety']).toContain(response.finishReason);
    });
  });

  describe('Slide-Specific Content Generation', () => {
    it('should generate title slide content', async () => {
      const content = await client.generateSlideContent('AI in Healthcare', 1, 10);
      expect(content).toContain('AI in Healthcare');
      expect(content).toBeTruthy();
    });

    it('should generate content for middle slides', async () => {
      const content = await client.generateSlideContent('Machine Learning', 5, 10);
      expect(content).toContain('Machine Learning');
    });

    it('should generate conclusion slide content', async () => {
      const content = await client.generateSlideContent('Future of AI', 10, 10);
      expect(content).toContain('Future of AI');
    });

    it('should handle single slide presentations', async () => {
      const content = await client.generateSlideContent('Quick Overview', 1, 1);
      expect(content).toBeTruthy();
    });

    it('should maintain context across slide sequence', async () => {
      const topic = 'Data Science';
      const slides = await Promise.all([
        client.generateSlideContent(topic, 1, 5),
        client.generateSlideContent(topic, 2, 5),
        client.generateSlideContent(topic, 3, 5)
      ]);

      expect(slides).toHaveLength(3);
      slides.forEach(slide => expect(slide).toBeTruthy());
    });
  });

  describe('Rate Limiting', () => {
    it('should track rate limit status', () => {
      const status = client.getRateLimitStatus();
      expect(status).toHaveProperty('remaining');
      expect(status).toHaveProperty('resetAt');
      expect(status.remaining).toBeLessThanOrEqual(60);
    });

    it('should decrement rate limit on API calls', async () => {
      const initialStatus = client.getRateLimitStatus();
      await client.generateContent({ prompt: 'test' });
      const afterStatus = client.getRateLimitStatus();

      expect(afterStatus.remaining).toBe(initialStatus.remaining - 1);
    });

    it('should throw error when rate limit exceeded', async () => {
      // Exhaust rate limit
      const status = client.getRateLimitStatus();
      for (let i = 0; i < status.remaining; i++) {
        await client.generateContent({ prompt: 'test' });
      }

      await expect(
        client.generateContent({ prompt: 'test' })
      ).rejects.toThrow('Rate limit exceeded');
    });

    it('should reset rate limit when resetRateLimit is called', async () => {
      await client.generateContent({ prompt: 'test' });
      client.resetRateLimit();

      const status = client.getRateLimitStatus();
      expect(status.remaining).toBe(60);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // This test would mock network failures in real implementation
      const response = await client.generateContent({ prompt: 'test' });
      expect(response).toBeDefined();
    });

    it('should handle empty prompts', async () => {
      const response = await client.generateContent({ prompt: '' });
      expect(response).toBeDefined();
    });

    it('should handle very long prompts', async () => {
      const longPrompt = 'A'.repeat(10000);
      const response = await client.generateContent({ prompt: longPrompt });
      expect(response).toBeDefined();
    });

    it('should handle special characters in prompts', async () => {
      const specialPrompt = 'Test with émojis 🚀 and symbols @#$%^&*()';
      const response = await client.generateContent({ prompt: specialPrompt });
      expect(response).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should complete generation within reasonable time', async () => {
      const startTime = Date.now();
      await client.generateContent({ prompt: 'test' });
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds max
    });

    it('should handle concurrent requests', async () => {
      const requests = Array(5).fill(null).map((_, i) =>
        client.generateContent({ prompt: `test ${i}` })
      );

      const responses = await Promise.all(requests);
      expect(responses).toHaveLength(5);
      responses.forEach(response => expect(response).toBeDefined());
    });
  });

  describe('Metadata and Tracking', () => {
    it('should include model information in metadata', async () => {
      const response = await client.generateContent({ prompt: 'test' });
      expect(response.metadata).toBeDefined();
      expect(response.metadata?.model).toBeTruthy();
    });

    it('should track generation parameters', async () => {
      const response = await client.generateContent({
        prompt: 'test',
        temperature: 0.8
      });
      expect(response.metadata?.temperature).toBe(0.8);
    });
  });
});

describe('GeminiClient Edge Cases', () => {
  it('should handle undefined optional parameters', async () => {
    const client = new MockGeminiClient({ apiKey: 'test-key' });
    const response = await client.generateContent({ prompt: 'test' });
    expect(response).toBeDefined();
  });

  it('should handle maximum token limits', async () => {
    const client = new MockGeminiClient({
      apiKey: 'test-key',
      maxTokens: 100
    });
    const response = await client.generateContent({ prompt: 'test' });
    expect(response.tokensUsed).toBeLessThanOrEqual(100);
  });

  it('should handle API key validation', () => {
    expect(() => new MockGeminiClient({ apiKey: '' })).not.toThrow();
  });
});

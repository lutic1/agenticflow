/**
 * AI Image Generation (P1.11)
 * DALL-E 3 integration for custom image generation
 * Generate images from text prompts for slides
 */

export interface ImageGenerationRequest {
  prompt: string;
  style?: 'vivid' | 'natural';
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  n?: number; // Number of images (1-10)
}

export interface GeneratedImage {
  id: string;
  url: string;
  revisedPrompt?: string; // DALL-E's revised prompt
  prompt: string;
  size: string;
  style: string;
  quality: string;
  createdAt: Date;
  metadata?: {
    slideId?: string;
    tags?: string[];
  };
}

export interface ImageGenerationResult {
  success: boolean;
  images?: GeneratedImage[];
  error?: string;
  usage?: {
    promptTokens: number;
    totalCost: number;
  };
}

/**
 * AI Image Generation Manager
 * Generate custom images using DALL-E 3
 */
export class AIImageGenerationManager {
  private generatedImages: Map<string, GeneratedImage>;
  private apiKey: string | null = null;

  constructor() {
    this.generatedImages = new Map();
  }

  /**
   * Set OpenAI API key
   */
  setAPIKey(key: string): void {
    this.apiKey = key;
  }

  /**
   * Generate image from prompt
   */
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'OpenAI API key not set. Call setAPIKey() first.'
      };
    }

    try {
      // Call OpenAI DALL-E 3 API
      const response = await this.callDALLE3API(request);

      if (!response.success) {
        return response;
      }

      // Store generated images
      const images = response.images!.map(img => {
        this.generatedImages.set(img.id, img);
        return img;
      });

      return {
        success: true,
        images,
        usage: response.usage
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Image generation failed'
      };
    }
  }

  /**
   * Call DALL-E 3 API (simulation for now)
   */
  private async callDALLE3API(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    // In production, would call OpenAI API:
    /*
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: request.prompt,
        size: request.size || '1024x1024',
        quality: request.quality || 'standard',
        style: request.style || 'vivid',
        n: request.n || 1
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error?.message || 'API request failed'
      };
    }

    const images: GeneratedImage[] = data.data.map((img: any) => ({
      id: this.generateId(),
      url: img.url,
      revisedPrompt: img.revised_prompt,
      prompt: request.prompt,
      size: request.size || '1024x1024',
      style: request.style || 'vivid',
      quality: request.quality || 'standard',
      createdAt: new Date()
    }));

    return {
      success: true,
      images,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        totalCost: this.calculateCost(request.quality || 'standard', request.size || '1024x1024')
      }
    };
    */

    // Simulation (return placeholder)
    return {
      success: true,
      images: [{
        id: this.generateId(),
        url: `https://via.placeholder.com/${request.size || '1024x1024'}/4299e1/ffffff?text=${encodeURIComponent(request.prompt.slice(0, 30))}`,
        revisedPrompt: `Generated: ${request.prompt}`,
        prompt: request.prompt,
        size: request.size || '1024x1024',
        style: request.style || 'vivid',
        quality: request.quality || 'standard',
        createdAt: new Date()
      }],
      usage: {
        promptTokens: request.prompt.split(' ').length,
        totalCost: this.calculateCost(request.quality || 'standard', request.size || '1024x1024')
      }
    };
  }

  /**
   * Calculate estimated cost
   */
  private calculateCost(quality: string, size: string): number {
    // DALL-E 3 pricing (as of 2025)
    const pricing: Record<string, number> = {
      'standard-1024x1024': 0.040,
      'standard-1792x1024': 0.080,
      'standard-1024x1792': 0.080,
      'hd-1024x1024': 0.080,
      'hd-1792x1024': 0.120,
      'hd-1024x1792': 0.120
    };

    return pricing[`${quality}-${size}`] || 0.040;
  }

  /**
   * Generate image with smart prompt enhancement
   */
  async generateWithEnhancedPrompt(
    basicPrompt: string,
    options: {
      style?: ImageGenerationRequest['style'];
      slideContext?: string;
      enhance?: boolean;
    } = {}
  ): Promise<ImageGenerationResult> {
    let prompt = basicPrompt;

    // Enhance prompt for slide context
    if (options.enhance !== false) {
      prompt = this.enhancePrompt(basicPrompt, options.slideContext);
    }

    return this.generateImage({
      prompt,
      style: options.style || 'vivid',
      size: '1792x1024', // 16:9 aspect ratio for slides
      quality: 'hd'
    });
  }

  /**
   * Enhance prompt for better results
   */
  private enhancePrompt(prompt: string, context?: string): string {
    let enhanced = prompt;

    // Add context if provided
    if (context) {
      enhanced = `${prompt} (Context: ${context})`;
    }

    // Add quality modifiers
    const qualityModifiers = [
      'professional',
      'high-quality',
      'detailed',
      'suitable for business presentation'
    ];

    // Check if prompt already has quality modifiers
    const hasQualityModifier = qualityModifiers.some(mod =>
      prompt.toLowerCase().includes(mod)
    );

    if (!hasQualityModifier) {
      enhanced += ', professional and high-quality, suitable for business presentation';
    }

    return enhanced;
  }

  /**
   * Generate images for specific slide types
   */
  async generateForSlideType(
    type: 'hero' | 'background' | 'icon' | 'chart-metaphor' | 'team-photo',
    concept: string,
    customization?: Partial<ImageGenerationRequest>
  ): Promise<ImageGenerationResult> {
    const prompts: Record<string, string> = {
      'hero': `Hero image for presentation slide: ${concept}, cinematic, professional, modern design`,
      'background': `Abstract background pattern for presentation: ${concept}, subtle, professional, not distracting`,
      'icon': `Simple icon representing ${concept}, minimalist, flat design, professional, single object`,
      'chart-metaphor': `Visual metaphor for data/chart showing ${concept}, creative, professional illustration`,
      'team-photo': `Professional team photo style: ${concept}, corporate, diverse, modern office setting`
    };

    const sizePresets: Record<string, ImageGenerationRequest['size']> = {
      'hero': '1792x1024', // Wide for hero images
      'background': '1792x1024', // Wide for backgrounds
      'icon': '1024x1024', // Square for icons
      'chart-metaphor': '1024x1024', // Square for charts
      'team-photo': '1792x1024' // Wide for team photos
    };

    return this.generateImage({
      prompt: prompts[type],
      size: sizePresets[type],
      style: type === 'background' ? 'natural' : 'vivid',
      quality: 'hd',
      ...customization
    });
  }

  /**
   * Get generated image by ID
   */
  getImage(id: string): GeneratedImage | undefined {
    return this.generatedImages.get(id);
  }

  /**
   * Get all generated images
   */
  getAllImages(): GeneratedImage[] {
    return Array.from(this.generatedImages.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  /**
   * Delete generated image
   */
  deleteImage(id: string): boolean {
    return this.generatedImages.delete(id);
  }

  /**
   * Search generated images
   */
  searchImages(query: string): GeneratedImage[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllImages().filter(
      img =>
        img.prompt.toLowerCase().includes(lowerQuery) ||
        img.revisedPrompt?.toLowerCase().includes(lowerQuery) ||
        img.metadata?.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get images for slide
   */
  getImagesForSlide(slideId: string): GeneratedImage[] {
    return this.getAllImages().filter(
      img => img.metadata?.slideId === slideId
    );
  }

  /**
   * Update image metadata
   */
  updateImageMetadata(id: string, metadata: GeneratedImage['metadata']): boolean {
    const image = this.generatedImages.get(id);
    if (!image) return false;

    image.metadata = { ...image.metadata, ...metadata };
    return true;
  }

  /**
   * Get prompt suggestions for common slide types
   */
  getPromptSuggestions(category: 'business' | 'tech' | 'creative' | 'education'): string[] {
    const suggestions: Record<string, string[]> = {
      business: [
        'Modern office building skyline at sunset',
        'Business team collaborating in modern workspace',
        'Abstract growth chart visualization',
        'Professional handshake closeup',
        'Diverse business team meeting',
        'Corporate success concept',
        'Innovation and technology symbols',
        'Global business network visualization'
      ],
      tech: [
        'Futuristic AI neural network visualization',
        'Cloud computing infrastructure concept',
        'Cybersecurity shield and lock visualization',
        'Data flow and analytics dashboard',
        'Modern software development workspace',
        'Blockchain technology visualization',
        'IoT connected devices network',
        'Quantum computing abstract concept'
      ],
      creative: [
        'Abstract artistic explosion of colors',
        'Modern minimal geometric patterns',
        'Creative brainstorming concept',
        'Inspirational light bulb moment',
        'Design thinking process visualization',
        'Innovative ideas taking shape',
        'Artistic collaboration workspace',
        'Creative problem solving metaphor'
      ],
      education: [
        'Modern classroom with technology',
        'Student learning online concept',
        'Educational growth journey visualization',
        'Knowledge and wisdom symbols',
        'Interactive learning environment',
        'Teacher and students collaboration',
        'Digital education platform concept',
        'Academic success celebration'
      ]
    };

    return suggestions[category] || suggestions.business;
  }

  /**
   * Export images metadata
   */
  exportImages(): string {
    const images = this.getAllImages().map(img => ({
      ...img,
      url: undefined // Don't export actual URLs (may expire)
    }));
    return JSON.stringify(images, null, 2);
  }

  /**
   * Get generation statistics
   */
  getStats(): {
    totalImages: number;
    totalCost: number;
    byStyle: Record<string, number>;
    byQuality: Record<string, number>;
  } {
    const images = this.getAllImages();

    const byStyle: Record<string, number> = {};
    const byQuality: Record<string, number> = {};
    let totalCost = 0;

    images.forEach(img => {
      byStyle[img.style] = (byStyle[img.style] || 0) + 1;
      byQuality[img.quality] = (byQuality[img.quality] || 0) + 1;
      totalCost += this.calculateCost(img.quality, img.size);
    });

    return {
      totalImages: images.length,
      totalCost,
      byStyle,
      byQuality
    };
  }

  /**
   * Clear all generated images
   */
  clearAll(): void {
    this.generatedImages.clear();
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get image count
   */
  getCount(): number {
    return this.generatedImages.size;
  }
}

// Singleton instance
export const aiImageGenerator = new AIImageGenerationManager();

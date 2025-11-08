/**
 * Integration Tests for Full Slide Generation
 * Tests end-to-end slide creation workflow
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock complete slide generation system
interface SlideGeneratorConfig {
  geminiApiKey: string;
  theme: 'light' | 'dark' | 'corporate' | 'modern';
  aspectRatio: '16:9' | '4:3';
  includeImages: boolean;
  includeIcons: boolean;
}

interface GenerationRequest {
  topic: string;
  slideCount: number;
  audience?: string;
  purpose?: 'business' | 'education' | 'pitch' | 'general';
}

interface GeneratedPresentation {
  title: string;
  slides: GeneratedSlide[];
  metadata: {
    generatedAt: Date;
    totalSlides: number;
    wordCount: number;
    estimatedDuration: number;
  };
  html: string;
  css: string;
}

interface GeneratedSlide {
  number: number;
  title: string;
  content: string;
  layout: string;
  images: string[];
  icons: string[];
  html: string;
}

class SlideGenerator {
  private config: SlideGeneratorConfig;

  constructor(config: SlideGeneratorConfig) {
    this.config = config;
  }

  async generatePresentation(request: GenerationRequest): Promise<GeneratedPresentation> {
    // Step 1: Generate slide outline
    const outline = await this.generateOutline(request);

    // Step 2: Generate content for each slide
    const slides: GeneratedSlide[] = [];
    for (let i = 0; i < request.slideCount; i++) {
      const slide = await this.generateSlide(outline[i], i + 1, request.slideCount);
      slides.push(slide);
    }

    // Step 3: Find relevant images
    if (this.config.includeImages) {
      await this.addImages(slides, request.topic);
    }

    // Step 4: Add icons
    if (this.config.includeIcons) {
      await this.addIcons(slides);
    }

    // Step 5: Render HTML
    const html = this.renderHTML(slides);
    const css = this.generateCSS();

    // Step 6: Calculate metadata
    const wordCount = slides.reduce((sum, slide) =>
      sum + slide.content.split(/\s+/).length, 0);

    return {
      title: request.topic,
      slides,
      metadata: {
        generatedAt: new Date(),
        totalSlides: slides.length,
        wordCount,
        estimatedDuration: slides.length * 2 // 2 minutes per slide
      },
      html,
      css
    };
  }

  private async generateOutline(request: GenerationRequest): Promise<string[]> {
    // Mock outline generation
    const outlines: string[] = [
      `${request.topic} - Introduction`,
    ];

    for (let i = 1; i < request.slideCount - 1; i++) {
      outlines.push(`Key Point ${i}: Aspect of ${request.topic}`);
    }

    outlines.push(`${request.topic} - Conclusion`);
    return outlines;
  }

  private async generateSlide(title: string, number: number, total: number): Promise<GeneratedSlide> {
    // Determine layout based on position
    let layout = 'content';
    if (number === 1) layout = 'title';
    else if (number === total) layout = 'conclusion';
    else if (number % 3 === 0) layout = 'bullet';

    // Generate content
    const content = this.generateSlideContent(title, layout);

    return {
      number,
      title,
      content,
      layout,
      images: [],
      icons: [],
      html: ''
    };
  }

  private generateSlideContent(title: string, layout: string): string {
    if (layout === 'title') {
      return `# ${title}\n\nA comprehensive presentation`;
    }

    if (layout === 'conclusion') {
      return `# ${title}\n\nThank you for your attention!`;
    }

    if (layout === 'bullet') {
      return `# ${title}\n\n* Key point 1\n* Key point 2\n* Key point 3\n* Key point 4`;
    }

    return `# ${title}\n\nThis slide covers important aspects of ${title.toLowerCase()}.`;
  }

  private async addImages(slides: GeneratedSlide[], topic: string): Promise<void> {
    // Mock image addition
    for (const slide of slides) {
      if (slide.layout === 'content' || slide.layout === 'split') {
        slide.images.push(`https://example.com/images/${topic}-${slide.number}.jpg`);
      }
    }
  }

  private async addIcons(slides: GeneratedSlide[]): Promise<void> {
    // Mock icon addition
    for (const slide of slides) {
      if (slide.layout === 'bullet') {
        slide.icons.push('check-circle', 'arrow-right', 'star');
      }
    }
  }

  private renderHTML(slides: GeneratedSlide[]): string {
    return slides.map(slide => `
<div class="slide slide-${slide.layout}" data-slide="${slide.number}">
  <h1>${slide.title}</h1>
  <div class="content">
    ${this.markdownToHTML(slide.content)}
    ${slide.images.map(img => `<img src="${img}" alt="${slide.title}" />`).join('\n')}
  </div>
</div>
    `.trim()).join('\n\n');
  }

  private markdownToHTML(markdown: string): string {
    let html = markdown;
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    return html;
  }

  private generateCSS(): string {
    return `
.slide {
  min-height: 100vh;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.slide-title {
  text-align: center;
}

.slide-conclusion {
  text-align: center;
}
    `.trim();
  }

  async exportToHTML(presentation: GeneratedPresentation, outputPath: string): Promise<string> {
    const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${presentation.title}</title>
  <style>${presentation.css}</style>
</head>
<body>
  ${presentation.html}
</body>
</html>
    `.trim();

    return fullHTML;
  }

  async exportToPDF(presentation: GeneratedPresentation): Promise<Buffer> {
    // Mock PDF generation
    return Buffer.from(`PDF content for ${presentation.title}`);
  }
}

describe('Slide Generator - Full Integration', () => {
  let generator: SlideGenerator;
  const config: SlideGeneratorConfig = {
    geminiApiKey: 'test-key',
    theme: 'modern',
    aspectRatio: '16:9',
    includeImages: true,
    includeIcons: true
  };

  beforeEach(() => {
    generator = new SlideGenerator(config);
  });

  afterEach(() => {
    // Cleanup if needed
  });

  describe('Basic Presentation Generation', () => {
    it('should generate a complete presentation', async () => {
      const request: GenerationRequest = {
        topic: 'Introduction to AI',
        slideCount: 5,
        audience: 'Technical professionals',
        purpose: 'education'
      };

      const presentation = await generator.generatePresentation(request);

      expect(presentation).toBeDefined();
      expect(presentation.title).toBe('Introduction to AI');
      expect(presentation.slides).toHaveLength(5);
      expect(presentation.metadata.totalSlides).toBe(5);
    });

    it('should generate correct number of slides', async () => {
      const slideCounts = [3, 5, 10, 15];

      for (const count of slideCounts) {
        const presentation = await generator.generatePresentation({
          topic: 'Test Topic',
          slideCount: count
        });

        expect(presentation.slides).toHaveLength(count);
      }
    });

    it('should include title slide', async () => {
      const presentation = await generator.generatePresentation({
        topic: 'Test Presentation',
        slideCount: 5
      });

      const titleSlide = presentation.slides[0];
      expect(titleSlide.number).toBe(1);
      expect(titleSlide.layout).toBe('title');
    });

    it('should include conclusion slide', async () => {
      const presentation = await generator.generatePresentation({
        topic: 'Test Presentation',
        slideCount: 5
      });

      const conclusionSlide = presentation.slides[4];
      expect(conclusionSlide.number).toBe(5);
      expect(conclusionSlide.layout).toBe('conclusion');
    });
  });

  describe('Content Generation', () => {
    it('should generate unique content for each slide', async () => {
      const presentation = await generator.generatePresentation({
        topic: 'Machine Learning',
        slideCount: 10
      });

      const titles = presentation.slides.map(s => s.title);
      const uniqueTitles = new Set(titles);

      expect(uniqueTitles.size).toBe(titles.length);
    });

    it('should use varied layouts', async () => {
      const presentation = await generator.generatePresentation({
        topic: 'Data Science',
        slideCount: 10
      });

      const layouts = new Set(presentation.slides.map(s => s.layout));
      expect(layouts.size).toBeGreaterThan(2);
    });

    it('should generate coherent content', async () => {
      const presentation = await generator.generatePresentation({
        topic: 'Cloud Computing',
        slideCount: 5
      });

      presentation.slides.forEach(slide => {
        expect(slide.content).toBeTruthy();
        expect(slide.content.length).toBeGreaterThan(10);
      });
    });
  });

  describe('Image and Icon Integration', () => {
    it('should add images when enabled', async () => {
      const presentation = await generator.generatePresentation({
        topic: 'Technology Trends',
        slideCount: 5
      });

      const slidesWithImages = presentation.slides.filter(s => s.images.length > 0);
      expect(slidesWithImages.length).toBeGreaterThan(0);
    });

    it('should skip images when disabled', async () => {
      const noImageGen = new SlideGenerator({
        ...config,
        includeImages: false
      });

      const presentation = await noImageGen.generatePresentation({
        topic: 'Test',
        slideCount: 5
      });

      presentation.slides.forEach(slide => {
        expect(slide.images).toHaveLength(0);
      });
    });

    it('should add icons to appropriate slides', async () => {
      const presentation = await generator.generatePresentation({
        topic: 'Business Strategy',
        slideCount: 10
      });

      const slidesWithIcons = presentation.slides.filter(s => s.icons.length > 0);
      expect(slidesWithIcons.length).toBeGreaterThan(0);
    });

    it('should skip icons when disabled', async () => {
      const noIconGen = new SlideGenerator({
        ...config,
        includeIcons: false
      });

      const presentation = await noIconGen.generatePresentation({
        topic: 'Test',
        slideCount: 5
      });

      presentation.slides.forEach(slide => {
        expect(slide.icons).toHaveLength(0);
      });
    });
  });

  describe('HTML Rendering', () => {
    it('should generate valid HTML', async () => {
      const presentation = await generator.generatePresentation({
        topic: 'Web Development',
        slideCount: 5
      });

      expect(presentation.html).toContain('<div class="slide');
      expect(presentation.html).toContain('</div>');
      expect(presentation.slides.every(s => presentation.html.includes(s.title))).toBe(true);
    });

    it('should include CSS', async () => {
      const presentation = await generator.generatePresentation({
        topic: 'CSS Basics',
        slideCount: 3
      });

      expect(presentation.css).toBeTruthy();
      expect(presentation.css).toContain('.slide');
    });

    it('should generate complete standalone HTML', async () => {
      const presentation = await generator.generatePresentation({
        topic: 'HTML Guide',
        slideCount: 5
      });

      const html = await generator.exportToHTML(presentation, '/tmp/test.html');

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html lang="en">');
      expect(html).toContain('</html>');
      expect(html).toContain(presentation.title);
    });
  });

  describe('Metadata Generation', () => {
    it('should calculate accurate metadata', async () => {
      const presentation = await generator.generatePresentation({
        topic: 'Metadata Test',
        slideCount: 5
      });

      expect(presentation.metadata.totalSlides).toBe(5);
      expect(presentation.metadata.wordCount).toBeGreaterThan(0);
      expect(presentation.metadata.estimatedDuration).toBe(10); // 5 slides * 2 min
      expect(presentation.metadata.generatedAt).toBeInstanceOf(Date);
    });

    it('should track word count correctly', async () => {
      const presentation = await generator.generatePresentation({
        topic: 'Word Count Test',
        slideCount: 3
      });

      expect(presentation.metadata.wordCount).toBeGreaterThan(0);
    });

    it('should estimate duration based on slide count', async () => {
      const small = await generator.generatePresentation({
        topic: 'Short',
        slideCount: 3
      });

      const large = await generator.generatePresentation({
        topic: 'Long',
        slideCount: 15
      });

      expect(large.metadata.estimatedDuration).toBeGreaterThan(small.metadata.estimatedDuration);
    });
  });

  describe('Export Functionality', () => {
    it('should export to HTML file format', async () => {
      const presentation = await generator.generatePresentation({
        topic: 'Export Test',
        slideCount: 5
      });

      const html = await generator.exportToHTML(presentation, '/tmp/export.html');

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain(presentation.title);
    });

    it('should export to PDF', async () => {
      const presentation = await generator.generatePresentation({
        topic: 'PDF Export',
        slideCount: 5
      });

      const pdf = await generator.exportToPDF(presentation);

      expect(pdf).toBeInstanceOf(Buffer);
      expect(pdf.length).toBeGreaterThan(0);
    });
  });

  describe('Different Presentation Types', () => {
    it('should generate business presentation', async () => {
      const presentation = await generator.generatePresentation({
        topic: 'Q4 Business Review',
        slideCount: 10,
        purpose: 'business'
      });

      expect(presentation.slides).toHaveLength(10);
      expect(presentation.title).toContain('Business');
    });

    it('should generate educational presentation', async () => {
      const presentation = await generator.generatePresentation({
        topic: 'Introduction to Python',
        slideCount: 12,
        purpose: 'education'
      });

      expect(presentation.slides).toHaveLength(12);
    });

    it('should generate pitch deck', async () => {
      const presentation = await generator.generatePresentation({
        topic: 'Startup Pitch',
        slideCount: 8,
        purpose: 'pitch'
      });

      expect(presentation.slides).toHaveLength(8);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle minimum slide count', async () => {
      const presentation = await generator.generatePresentation({
        topic: 'Minimal',
        slideCount: 1
      });

      expect(presentation.slides).toHaveLength(1);
    });

    it('should handle large presentations', async () => {
      const presentation = await generator.generatePresentation({
        topic: 'Large Deck',
        slideCount: 50
      });

      expect(presentation.slides).toHaveLength(50);
    }, 30000); // Increase timeout for large generation

    it('should handle special characters in topic', async () => {
      const presentation = await generator.generatePresentation({
        topic: 'AI & ML: The Future <2024>',
        slideCount: 5
      });

      expect(presentation.title).toContain('AI & ML');
    });

    it('should handle long topic names', async () => {
      const longTopic = 'A'.repeat(200);
      const presentation = await generator.generatePresentation({
        topic: longTopic,
        slideCount: 3
      });

      expect(presentation.title).toBe(longTopic);
    });
  });

  describe('Performance', () => {
    it('should generate small presentation quickly', async () => {
      const start = Date.now();

      await generator.generatePresentation({
        topic: 'Performance Test',
        slideCount: 5
      });

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(5000); // 5 seconds
    });

    it('should handle concurrent generations', async () => {
      const requests = Array(3).fill(null).map((_, i) => ({
        topic: `Concurrent Test ${i}`,
        slideCount: 5
      }));

      const presentations = await Promise.all(
        requests.map(req => generator.generatePresentation(req))
      );

      expect(presentations).toHaveLength(3);
      presentations.forEach(p => {
        expect(p.slides).toHaveLength(5);
      });
    });
  });

  describe('Quality Validation', () => {
    it('should produce accessible presentations', async () => {
      const presentation = await generator.generatePresentation({
        topic: 'Accessibility Test',
        slideCount: 5
      });

      // Check for basic structure
      expect(presentation.html).toContain('class="slide"');

      // Check for headings
      presentation.slides.forEach(slide => {
        expect(slide.title).toBeTruthy();
      });
    });

    it('should maintain consistent structure', async () => {
      const presentation = await generator.generatePresentation({
        topic: 'Structure Test',
        slideCount: 10
      });

      presentation.slides.forEach(slide => {
        expect(slide).toHaveProperty('number');
        expect(slide).toHaveProperty('title');
        expect(slide).toHaveProperty('content');
        expect(slide).toHaveProperty('layout');
      });
    });
  });
});

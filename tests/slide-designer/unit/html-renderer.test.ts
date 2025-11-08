/**
 * Unit Tests for HTML Renderer
 * Tests HTML generation, styling, and export functionality
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

// Types
interface SlideData {
  title: string;
  content: string;
  layout: string;
  style: StyleConfig;
}

interface StyleConfig {
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
  padding: string;
  theme: 'light' | 'dark' | 'corporate';
}

interface RenderOptions {
  includeCSS?: boolean;
  includeJS?: boolean;
  responsive?: boolean;
  exportFormat?: 'html' | 'standalone' | 'pdf-ready';
}

// Mock HTML Renderer
class HTMLRenderer {
  private slides: SlideData[];
  private globalStyle: StyleConfig;

  constructor() {
    this.slides = [];
    this.globalStyle = {
      backgroundColor: '#ffffff',
      textColor: '#1a1a1a',
      fontSize: 20,
      fontFamily: 'Inter, sans-serif',
      padding: '2rem',
      theme: 'light'
    };
  }

  addSlide(slide: SlideData): void {
    this.slides.push(slide);
  }

  renderSlide(slide: SlideData, index: number): string {
    const style = { ...this.globalStyle, ...slide.style };

    return `
<div class="slide" data-slide="${index}" style="
  background-color: ${style.backgroundColor};
  color: ${style.textColor};
  font-family: ${style.fontFamily};
  font-size: ${style.fontSize}px;
  padding: ${style.padding};
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
">
  <h1 style="font-size: 2.5em; margin-bottom: 1.5rem;">${this.escapeHtml(slide.title)}</h1>
  <div class="slide-content" style="flex: 1;">
    ${slide.content}
  </div>
</div>`.trim();
  }

  renderAll(options: RenderOptions = {}): string {
    const css = options.includeCSS !== false ? this.generateCSS(options.responsive) : '';
    const js = options.includeJS ? this.generateJS() : '';

    const slidesHTML = this.slides
      .map((slide, index) => this.renderSlide(slide, index))
      .join('\n\n');

    if (options.exportFormat === 'standalone') {
      return this.generateStandaloneHTML(slidesHTML, css, js);
    }

    return `${css}\n\n${slidesHTML}\n\n${js}`;
  }

  private generateStandaloneHTML(slidesHTML: string, css: string, js: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Presentation</title>
  <style>
    ${css}
  </style>
</head>
<body>
  ${slidesHTML}
  <script>
    ${js}
  </script>
</body>
</html>`;
  }

  private generateCSS(responsive: boolean = true): string {
    let css = `
<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: ${this.globalStyle.fontFamily};
    overflow-x: hidden;
  }

  .slide {
    width: 100vw;
    min-height: 100vh;
    scroll-snap-align: start;
    page-break-after: always;
  }

  .slide-content h2 {
    font-size: 1.8em;
    margin: 1em 0 0.5em;
  }

  .slide-content p {
    line-height: 1.6;
    margin-bottom: 1em;
  }

  .slide-content ul {
    margin-left: 2em;
    margin-bottom: 1em;
  }

  .slide-content li {
    margin-bottom: 0.5em;
    line-height: 1.5;
  }

  .slide-content img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 1em 0;
  }

  .slide-content code {
    background-color: #f4f4f4;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
  }

  .slide-content pre {
    background-color: #1e1e1e;
    color: #d4d4d4;
    padding: 1em;
    border-radius: 8px;
    overflow-x: auto;
    margin: 1em 0;
  }

  .slide-content pre code {
    background-color: transparent;
    color: inherit;
    padding: 0;
  }
`;

    if (responsive) {
      css += `
  @media (max-width: 768px) {
    .slide {
      padding: 1rem !important;
    }

    .slide h1 {
      font-size: 1.8em !important;
    }

    .slide-content {
      font-size: 0.9em;
    }
  }

  @media print {
    .slide {
      page-break-after: always;
    }
  }
`;
    }

    css += `
</style>`;
    return css.trim();
  }

  private generateJS(): string {
    return `
<script>
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    const slides = document.querySelectorAll('.slide');
    const currentSlide = Math.floor(window.scrollY / window.innerHeight);

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      if (currentSlide < slides.length - 1) {
        slides[currentSlide + 1].scrollIntoView({ behavior: 'smooth' });
      }
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      if (currentSlide > 0) {
        slides[currentSlide - 1].scrollIntoView({ behavior: 'smooth' });
      }
    } else if (e.key === 'Home') {
      slides[0].scrollIntoView({ behavior: 'smooth' });
    } else if (e.key === 'End') {
      slides[slides.length - 1].scrollIntoView({ behavior: 'smooth' });
    }
  });

  // Slide counter
  let slideCounter = document.createElement('div');
  slideCounter.style.cssText = 'position: fixed; bottom: 20px; right: 20px; padding: 10px 15px; background: rgba(0,0,0,0.7); color: white; border-radius: 5px; font-size: 14px; z-index: 1000;';
  document.body.appendChild(slideCounter);

  function updateCounter() {
    const slides = document.querySelectorAll('.slide');
    const currentSlide = Math.floor(window.scrollY / window.innerHeight) + 1;
    slideCounter.textContent = currentSlide + ' / ' + slides.length;
  }

  window.addEventListener('scroll', updateCounter);
  updateCounter();
</script>`.trim();
  }

  setGlobalStyle(style: Partial<StyleConfig>): void {
    this.globalStyle = { ...this.globalStyle, ...style };
  }

  getGlobalStyle(): StyleConfig {
    return { ...this.globalStyle };
  }

  clearSlides(): void {
    this.slides = [];
  }

  getSlideCount(): number {
    return this.slides.length;
  }

  exportToPDFReady(): string {
    return this.renderAll({
      exportFormat: 'pdf-ready',
      includeCSS: true,
      includeJS: false
    });
  }

  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  sanitizeContent(html: string): string {
    // Basic XSS prevention
    const dangerous = ['<script', 'javascript:', 'onerror=', 'onclick='];
    let sanitized = html;

    dangerous.forEach(pattern => {
      const regex = new RegExp(pattern, 'gi');
      sanitized = sanitized.replace(regex, '');
    });

    return sanitized;
  }

  validateHTML(html: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for basic structure
    if (!html.includes('<div class="slide"')) {
      errors.push('Missing slide container');
    }

    // Check for XSS vulnerabilities
    const xssPatterns = ['<script', 'javascript:', 'onerror', 'onclick'];
    xssPatterns.forEach(pattern => {
      if (html.toLowerCase().includes(pattern)) {
        errors.push(`Potential XSS vulnerability: ${pattern}`);
      }
    });

    // Check for unclosed tags
    const openTags = (html.match(/<[^/][^>]*>/g) || []).length;
    const closeTags = (html.match(/<\/[^>]*>/g) || []).length;
    const selfClosing = (html.match(/<[^>]*\/>/g) || []).length;

    if (openTags - selfClosing !== closeTags) {
      errors.push('Mismatched HTML tags');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  renderMarkdown(markdown: string): string {
    // Simple markdown to HTML conversion
    let html = markdown;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');

    // Bullet lists
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';

    return html;
  }
}

describe('HTMLRenderer', () => {
  let renderer: HTMLRenderer;

  beforeEach(() => {
    renderer = new HTMLRenderer();
  });

  describe('Initialization', () => {
    it('should initialize with default styles', () => {
      const style = renderer.getGlobalStyle();
      expect(style.backgroundColor).toBe('#ffffff');
      expect(style.textColor).toBe('#1a1a1a');
      expect(style.theme).toBe('light');
    });

    it('should start with zero slides', () => {
      expect(renderer.getSlideCount()).toBe(0);
    });
  });

  describe('Slide Addition', () => {
    it('should add slides correctly', () => {
      const slide: SlideData = {
        title: 'Test Slide',
        content: '<p>Content here</p>',
        layout: 'standard',
        style: renderer.getGlobalStyle()
      };

      renderer.addSlide(slide);
      expect(renderer.getSlideCount()).toBe(1);
    });

    it('should add multiple slides', () => {
      for (let i = 0; i < 5; i++) {
        renderer.addSlide({
          title: `Slide ${i}`,
          content: `Content ${i}`,
          layout: 'standard',
          style: renderer.getGlobalStyle()
        });
      }
      expect(renderer.getSlideCount()).toBe(5);
    });
  });

  describe('Single Slide Rendering', () => {
    it('should render slide with title', () => {
      const slide: SlideData = {
        title: 'Welcome',
        content: '<p>Hello World</p>',
        layout: 'title',
        style: renderer.getGlobalStyle()
      };

      const html = renderer.renderSlide(slide, 0);

      expect(html).toContain('Welcome');
      expect(html).toContain('Hello World');
      expect(html).toContain('class="slide"');
    });

    it('should include data-slide attribute', () => {
      const slide: SlideData = {
        title: 'Test',
        content: 'Content',
        layout: 'standard',
        style: renderer.getGlobalStyle()
      };

      const html = renderer.renderSlide(slide, 3);
      expect(html).toContain('data-slide="3"');
    });

    it('should apply custom styles', () => {
      const customStyle: StyleConfig = {
        backgroundColor: '#000000',
        textColor: '#ffffff',
        fontSize: 24,
        fontFamily: 'Arial',
        padding: '3rem',
        theme: 'dark'
      };

      const slide: SlideData = {
        title: 'Dark Slide',
        content: 'Content',
        layout: 'standard',
        style: customStyle
      };

      const html = renderer.renderSlide(slide, 0);

      expect(html).toContain('background-color: #000000');
      expect(html).toContain('color: #ffffff');
      expect(html).toContain('font-size: 24px');
    });

    it('should escape HTML in title', () => {
      const slide: SlideData = {
        title: '<script>alert("xss")</script>',
        content: 'Safe content',
        layout: 'standard',
        style: renderer.getGlobalStyle()
      };

      const html = renderer.renderSlide(slide, 0);
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });
  });

  describe('Full Presentation Rendering', () => {
    beforeEach(() => {
      renderer.addSlide({
        title: 'Slide 1',
        content: '<p>First slide</p>',
        layout: 'title',
        style: renderer.getGlobalStyle()
      });
      renderer.addSlide({
        title: 'Slide 2',
        content: '<p>Second slide</p>',
        layout: 'content',
        style: renderer.getGlobalStyle()
      });
    });

    it('should render all slides', () => {
      const html = renderer.renderAll();
      expect(html).toContain('Slide 1');
      expect(html).toContain('Slide 2');
    });

    it('should include CSS by default', () => {
      const html = renderer.renderAll();
      expect(html).toContain('<style>');
      expect(html).toContain('.slide');
    });

    it('should include JavaScript when requested', () => {
      const html = renderer.renderAll({ includeJS: true });
      expect(html).toContain('<script>');
      expect(html).toContain('keydown');
    });

    it('should generate standalone HTML', () => {
      const html = renderer.renderAll({ exportFormat: 'standalone' });
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html lang="en">');
      expect(html).toContain('</html>');
    });

    it('should include responsive CSS', () => {
      const html = renderer.renderAll({ responsive: true });
      expect(html).toContain('@media');
      expect(html).toContain('max-width');
    });
  });

  describe('CSS Generation', () => {
    it('should generate valid CSS', () => {
      renderer.addSlide({
        title: 'Test',
        content: 'Content',
        layout: 'standard',
        style: renderer.getGlobalStyle()
      });

      const html = renderer.renderAll({ includeCSS: true });
      expect(html).toContain('.slide {');
      expect(html).toContain('}');
    });

    it('should include print styles', () => {
      const html = renderer.renderAll({ responsive: true });
      expect(html).toContain('@media print');
      expect(html).toContain('page-break-after');
    });

    it('should include mobile styles', () => {
      const html = renderer.renderAll({ responsive: true });
      expect(html).toContain('@media (max-width: 768px)');
    });
  });

  describe('JavaScript Generation', () => {
    it('should generate navigation code', () => {
      renderer.addSlide({
        title: 'Test',
        content: 'Content',
        layout: 'standard',
        style: renderer.getGlobalStyle()
      });

      const html = renderer.renderAll({ includeJS: true });
      expect(html).toContain('ArrowDown');
      expect(html).toContain('ArrowUp');
      expect(html).toContain('scrollIntoView');
    });

    it('should include slide counter', () => {
      const html = renderer.renderAll({ includeJS: true });
      expect(html).toContain('slideCounter');
      expect(html).toContain('updateCounter');
    });
  });

  describe('Style Management', () => {
    it('should update global styles', () => {
      renderer.setGlobalStyle({ backgroundColor: '#f0f0f0' });
      const style = renderer.getGlobalStyle();
      expect(style.backgroundColor).toBe('#f0f0f0');
    });

    it('should preserve other styles when updating', () => {
      const original = renderer.getGlobalStyle();
      renderer.setGlobalStyle({ fontSize: 24 });
      const updated = renderer.getGlobalStyle();

      expect(updated.fontSize).toBe(24);
      expect(updated.fontFamily).toBe(original.fontFamily);
    });
  });

  describe('Content Sanitization', () => {
    it('should remove script tags', () => {
      const dangerous = '<p>Safe</p><script>alert("xss")</script>';
      const safe = renderer.sanitizeContent(dangerous);
      expect(safe).not.toContain('<script>');
    });

    it('should remove javascript: protocol', () => {
      const dangerous = '<a href="javascript:alert()">Click</a>';
      const safe = renderer.sanitizeContent(dangerous);
      expect(safe).not.toContain('javascript:');
    });

    it('should remove event handlers', () => {
      const dangerous = '<div onclick="alert()">Click</div>';
      const safe = renderer.sanitizeContent(dangerous);
      expect(safe).not.toContain('onclick');
    });
  });

  describe('HTML Validation', () => {
    it('should validate correct HTML', () => {
      const slide: SlideData = {
        title: 'Valid',
        content: '<p>Content</p>',
        layout: 'standard',
        style: renderer.getGlobalStyle()
      };

      const html = renderer.renderSlide(slide, 0);
      const validation = renderer.validateHTML(html);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect XSS vulnerabilities', () => {
      const dangerous = '<div class="slide"><script>alert("xss")</script></div>';
      const validation = renderer.validateHTML(dangerous);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('XSS'))).toBe(true);
    });

    it('should detect missing slide container', () => {
      const invalid = '<div>No slide class</div>';
      const validation = renderer.validateHTML(invalid);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('slide container'))).toBe(true);
    });
  });

  describe('Markdown Rendering', () => {
    it('should convert headers', () => {
      const markdown = '# Title\n## Subtitle\n### Section';
      const html = renderer.renderMarkdown(markdown);

      expect(html).toContain('<h1>Title</h1>');
      expect(html).toContain('<h2>Subtitle</h2>');
      expect(html).toContain('<h3>Section</h3>');
    });

    it('should convert bold and italic', () => {
      const markdown = '**bold** and *italic*';
      const html = renderer.renderMarkdown(markdown);

      expect(html).toContain('<strong>bold</strong>');
      expect(html).toContain('<em>italic</em>');
    });

    it('should convert code blocks', () => {
      const markdown = '```\nconst x = 42;\n```';
      const html = renderer.renderMarkdown(markdown);

      expect(html).toContain('<pre><code>');
      expect(html).toContain('const x = 42;');
    });

    it('should convert inline code', () => {
      const markdown = 'Use `const` keyword';
      const html = renderer.renderMarkdown(markdown);

      expect(html).toContain('<code>const</code>');
    });

    it('should convert links', () => {
      const markdown = '[Google](https://google.com)';
      const html = renderer.renderMarkdown(markdown);

      expect(html).toContain('<a href="https://google.com">Google</a>');
    });

    it('should convert bullet lists', () => {
      const markdown = '* Item 1\n* Item 2\n* Item 3';
      const html = renderer.renderMarkdown(markdown);

      expect(html).toContain('<ul>');
      expect(html).toContain('<li>Item 1</li>');
    });
  });

  describe('PDF Export', () => {
    it('should generate PDF-ready HTML', () => {
      renderer.addSlide({
        title: 'PDF Slide',
        content: '<p>Content</p>',
        layout: 'standard',
        style: renderer.getGlobalStyle()
      });

      const html = renderer.exportToPDFReady();

      expect(html).toContain('page-break-after');
      expect(html).not.toContain('<script>');
    });
  });

  describe('Utility Methods', () => {
    it('should clear all slides', () => {
      renderer.addSlide({
        title: 'Test',
        content: 'Content',
        layout: 'standard',
        style: renderer.getGlobalStyle()
      });

      expect(renderer.getSlideCount()).toBe(1);
      renderer.clearSlides();
      expect(renderer.getSlideCount()).toBe(0);
    });

    it('should get accurate slide count', () => {
      expect(renderer.getSlideCount()).toBe(0);

      for (let i = 0; i < 10; i++) {
        renderer.addSlide({
          title: `Slide ${i}`,
          content: 'Content',
          layout: 'standard',
          style: renderer.getGlobalStyle()
        });
      }

      expect(renderer.getSlideCount()).toBe(10);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      const slide: SlideData = {
        title: '',
        content: '',
        layout: 'standard',
        style: renderer.getGlobalStyle()
      };

      const html = renderer.renderSlide(slide, 0);
      expect(html).toContain('class="slide"');
    });

    it('should handle special characters', () => {
      const slide: SlideData = {
        title: 'Test & <Special> "Characters"',
        content: '<p>Content</p>',
        layout: 'standard',
        style: renderer.getGlobalStyle()
      };

      const html = renderer.renderSlide(slide, 0);
      expect(html).toContain('&amp;');
      expect(html).toContain('&lt;');
      expect(html).toContain('&gt;');
    });

    it('should handle very long content', () => {
      const longContent = '<p>' + 'A'.repeat(10000) + '</p>';
      const slide: SlideData = {
        title: 'Long Content',
        content: longContent,
        layout: 'standard',
        style: renderer.getGlobalStyle()
      };

      const html = renderer.renderSlide(slide, 0);
      expect(html.length).toBeGreaterThan(10000);
    });
  });
});

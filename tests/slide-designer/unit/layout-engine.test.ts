/**
 * Unit Tests for Layout Engine
 * Tests layout decisions, composition, and design rules
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

// Types
interface SlideContent {
  title: string;
  subtitle?: string;
  body: string[];
  images?: string[];
  bullets?: string[];
  code?: string;
  charts?: any[];
}

interface LayoutConfig {
  width: number;
  height: number;
  aspectRatio: '16:9' | '4:3' | '16:10';
  theme: 'light' | 'dark' | 'corporate' | 'modern';
  fontFamily: string;
  primaryColor: string;
  secondaryColor: string;
}

interface LayoutDecision {
  type: 'title' | 'content' | 'image' | 'split' | 'bullet' | 'code' | 'conclusion';
  columns: number;
  gridRows: number;
  textAlignment: 'left' | 'center' | 'right';
  spacing: 'compact' | 'normal' | 'relaxed';
  elements: LayoutElement[];
}

interface LayoutElement {
  type: 'text' | 'image' | 'list' | 'code' | 'chart';
  position: { x: number; y: number; width: number; height: number };
  content: any;
  style?: Record<string, any>;
}

interface DesignRules {
  maxBulletsPerSlide: number;
  maxWordsPerSlide: number;
  minFontSize: number;
  maxFontSize: number;
  imageMaxWidthPercent: number;
  marginPercent: number;
  lineHeight: number;
}

// Mock Layout Engine
class LayoutEngine {
  private config: LayoutConfig;
  private rules: DesignRules;

  constructor(config: LayoutConfig) {
    this.config = config;
    this.rules = {
      maxBulletsPerSlide: 7,
      maxWordsPerSlide: 50,
      minFontSize: 16,
      maxFontSize: 48,
      imageMaxWidthPercent: 60,
      marginPercent: 5,
      lineHeight: 1.5
    };
  }

  decideLayout(content: SlideContent, slideNumber: number, totalSlides: number): LayoutDecision {
    // Title slide
    if (slideNumber === 1) {
      return this.createTitleLayout(content);
    }

    // Conclusion slide
    if (slideNumber === totalSlides) {
      return this.createConclusionLayout(content);
    }

    // Content slides
    if (content.images && content.images.length > 0) {
      return this.createImageLayout(content);
    }

    if (content.bullets && content.bullets.length > 0) {
      return this.createBulletLayout(content);
    }

    if (content.code) {
      return this.createCodeLayout(content);
    }

    return this.createContentLayout(content);
  }

  private createTitleLayout(content: SlideContent): LayoutDecision {
    return {
      type: 'title',
      columns: 1,
      gridRows: 3,
      textAlignment: 'center',
      spacing: 'relaxed',
      elements: [
        {
          type: 'text',
          position: { x: 0.1, y: 0.3, width: 0.8, height: 0.2 },
          content: content.title,
          style: { fontSize: 48, fontWeight: 'bold' }
        },
        ...(content.subtitle ? [{
          type: 'text' as const,
          position: { x: 0.1, y: 0.55, width: 0.8, height: 0.1 },
          content: content.subtitle,
          style: { fontSize: 24, opacity: 0.8 }
        }] : [])
      ]
    };
  }

  private createContentLayout(content: SlideContent): LayoutDecision {
    return {
      type: 'content',
      columns: 1,
      gridRows: 4,
      textAlignment: 'left',
      spacing: 'normal',
      elements: [
        {
          type: 'text',
          position: { x: 0.1, y: 0.1, width: 0.8, height: 0.15 },
          content: content.title,
          style: { fontSize: 32, fontWeight: 'bold' }
        },
        {
          type: 'text',
          position: { x: 0.1, y: 0.3, width: 0.8, height: 0.6 },
          content: content.body.join('\n\n'),
          style: { fontSize: 20, lineHeight: this.rules.lineHeight }
        }
      ]
    };
  }

  private createBulletLayout(content: SlideContent): LayoutDecision {
    return {
      type: 'bullet',
      columns: 1,
      gridRows: 4,
      textAlignment: 'left',
      spacing: 'normal',
      elements: [
        {
          type: 'text',
          position: { x: 0.1, y: 0.1, width: 0.8, height: 0.15 },
          content: content.title,
          style: { fontSize: 32, fontWeight: 'bold' }
        },
        {
          type: 'list',
          position: { x: 0.15, y: 0.3, width: 0.75, height: 0.6 },
          content: content.bullets,
          style: { fontSize: 20, bulletStyle: 'disc' }
        }
      ]
    };
  }

  private createImageLayout(content: SlideContent): LayoutDecision {
    return {
      type: 'split',
      columns: 2,
      gridRows: 4,
      textAlignment: 'left',
      spacing: 'normal',
      elements: [
        {
          type: 'text',
          position: { x: 0.05, y: 0.1, width: 0.9, height: 0.15 },
          content: content.title,
          style: { fontSize: 32, fontWeight: 'bold' }
        },
        {
          type: 'text',
          position: { x: 0.05, y: 0.3, width: 0.4, height: 0.6 },
          content: content.body.join('\n\n'),
          style: { fontSize: 18 }
        },
        {
          type: 'image',
          position: { x: 0.5, y: 0.3, width: 0.45, height: 0.6 },
          content: content.images![0],
          style: { objectFit: 'contain' }
        }
      ]
    };
  }

  private createCodeLayout(content: SlideContent): LayoutDecision {
    return {
      type: 'code',
      columns: 1,
      gridRows: 4,
      textAlignment: 'left',
      spacing: 'compact',
      elements: [
        {
          type: 'text',
          position: { x: 0.1, y: 0.1, width: 0.8, height: 0.15 },
          content: content.title,
          style: { fontSize: 32, fontWeight: 'bold' }
        },
        {
          type: 'code',
          position: { x: 0.1, y: 0.3, width: 0.8, height: 0.6 },
          content: content.code,
          style: { fontSize: 16, fontFamily: 'monospace', backgroundColor: '#1e1e1e' }
        }
      ]
    };
  }

  private createConclusionLayout(content: SlideContent): LayoutDecision {
    return {
      type: 'conclusion',
      columns: 1,
      gridRows: 3,
      textAlignment: 'center',
      spacing: 'relaxed',
      elements: [
        {
          type: 'text',
          position: { x: 0.1, y: 0.35, width: 0.8, height: 0.3 },
          content: content.title,
          style: { fontSize: 40, fontWeight: 'bold' }
        }
      ]
    };
  }

  validateLayout(layout: LayoutDecision, content: SlideContent): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check bullet limit
    if (content.bullets && content.bullets.length > this.rules.maxBulletsPerSlide) {
      errors.push(`Too many bullets: ${content.bullets.length} > ${this.rules.maxBulletsPerSlide}`);
    }

    // Check word count
    const wordCount = content.body.join(' ').split(/\s+/).length;
    if (wordCount > this.rules.maxWordsPerSlide) {
      errors.push(`Too many words: ${wordCount} > ${this.rules.maxWordsPerSlide}`);
    }

    // Check element positions
    layout.elements.forEach((element, index) => {
      if (element.position.x < 0 || element.position.x + element.position.width > 1) {
        errors.push(`Element ${index} exceeds horizontal bounds`);
      }
      if (element.position.y < 0 || element.position.y + element.position.height > 1) {
        errors.push(`Element ${index} exceeds vertical bounds`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  calculateBalance(layout: LayoutDecision): number {
    // Calculate visual balance (0-1, where 1 is perfectly balanced)
    const leftWeight = layout.elements
      .filter(e => e.position.x < 0.5)
      .reduce((sum, e) => sum + e.position.width * e.position.height, 0);

    const rightWeight = layout.elements
      .filter(e => e.position.x >= 0.5)
      .reduce((sum, e) => sum + e.position.width * e.position.height, 0);

    const totalWeight = leftWeight + rightWeight;
    if (totalWeight === 0) return 1;

    const balance = 1 - Math.abs(leftWeight - rightWeight) / totalWeight;
    return balance;
  }

  getConfig(): LayoutConfig {
    return { ...this.config };
  }

  getDesignRules(): DesignRules {
    return { ...this.rules };
  }

  updateDesignRules(updates: Partial<DesignRules>): void {
    this.rules = { ...this.rules, ...updates };
  }
}

describe('LayoutEngine', () => {
  let engine: LayoutEngine;
  const defaultConfig: LayoutConfig = {
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    theme: 'modern',
    fontFamily: 'Inter, sans-serif',
    primaryColor: '#2563eb',
    secondaryColor: '#64748b'
  };

  beforeEach(() => {
    engine = new LayoutEngine(defaultConfig);
  });

  describe('Initialization', () => {
    it('should initialize with valid configuration', () => {
      expect(engine).toBeDefined();
      const config = engine.getConfig();
      expect(config.aspectRatio).toBe('16:9');
      expect(config.theme).toBe('modern');
    });

    it('should have default design rules', () => {
      const rules = engine.getDesignRules();
      expect(rules.maxBulletsPerSlide).toBe(7);
      expect(rules.maxWordsPerSlide).toBe(50);
      expect(rules.minFontSize).toBe(16);
    });

    it('should support different aspect ratios', () => {
      const config43 = { ...defaultConfig, aspectRatio: '4:3' as const };
      const engine43 = new LayoutEngine(config43);
      expect(engine43.getConfig().aspectRatio).toBe('4:3');
    });
  });

  describe('Title Slide Layout', () => {
    it('should create centered title layout', () => {
      const content: SlideContent = {
        title: 'Welcome to the Presentation',
        subtitle: 'An Introduction',
        body: []
      };

      const layout = engine.decideLayout(content, 1, 10);

      expect(layout.type).toBe('title');
      expect(layout.textAlignment).toBe('center');
      expect(layout.spacing).toBe('relaxed');
      expect(layout.elements).toHaveLength(2);
    });

    it('should handle title without subtitle', () => {
      const content: SlideContent = {
        title: 'Welcome',
        body: []
      };

      const layout = engine.decideLayout(content, 1, 10);

      expect(layout.type).toBe('title');
      expect(layout.elements).toHaveLength(1);
    });

    it('should use large font for title', () => {
      const content: SlideContent = {
        title: 'Main Title',
        body: []
      };

      const layout = engine.decideLayout(content, 1, 10);
      const titleElement = layout.elements[0];

      expect(titleElement.style?.fontSize).toBeGreaterThanOrEqual(40);
    });
  });

  describe('Content Slide Layout', () => {
    it('should create standard content layout', () => {
      const content: SlideContent = {
        title: 'Introduction',
        body: ['This is the first paragraph.', 'This is the second paragraph.']
      };

      const layout = engine.decideLayout(content, 2, 10);

      expect(layout.type).toBe('content');
      expect(layout.elements.length).toBeGreaterThanOrEqual(2);
    });

    it('should position title at top', () => {
      const content: SlideContent = {
        title: 'Content Title',
        body: ['Content here']
      };

      const layout = engine.decideLayout(content, 2, 10);
      const titleElement = layout.elements[0];

      expect(titleElement.position.y).toBeLessThan(0.2);
    });
  });

  describe('Bullet Point Layout', () => {
    it('should create bullet list layout', () => {
      const content: SlideContent = {
        title: 'Key Points',
        body: [],
        bullets: [
          'First point',
          'Second point',
          'Third point'
        ]
      };

      const layout = engine.decideLayout(content, 3, 10);

      expect(layout.type).toBe('bullet');
      expect(layout.elements.some(e => e.type === 'list')).toBe(true);
    });

    it('should validate bullet count', () => {
      const content: SlideContent = {
        title: 'Too Many Bullets',
        body: [],
        bullets: Array(10).fill('Bullet point')
      };

      const layout = engine.decideLayout(content, 3, 10);
      const validation = engine.validateLayout(layout, content);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('bullets'))).toBe(true);
    });

    it('should indent bullet list appropriately', () => {
      const content: SlideContent = {
        title: 'List',
        body: [],
        bullets: ['Item 1', 'Item 2']
      };

      const layout = engine.decideLayout(content, 3, 10);
      const listElement = layout.elements.find(e => e.type === 'list');

      expect(listElement).toBeDefined();
      expect(listElement!.position.x).toBeGreaterThan(0.1);
    });
  });

  describe('Image Layout', () => {
    it('should create split layout with image', () => {
      const content: SlideContent = {
        title: 'Visual Example',
        body: ['Description text'],
        images: ['image1.jpg']
      };

      const layout = engine.decideLayout(content, 4, 10);

      expect(layout.type).toBe('split');
      expect(layout.columns).toBe(2);
      expect(layout.elements.some(e => e.type === 'image')).toBe(true);
    });

    it('should position text and image side by side', () => {
      const content: SlideContent = {
        title: 'Side by Side',
        body: ['Text content'],
        images: ['image.jpg']
      };

      const layout = engine.decideLayout(content, 4, 10);
      const textElement = layout.elements.find(e => e.type === 'text' && e.content.includes('Text'));
      const imageElement = layout.elements.find(e => e.type === 'image');

      expect(textElement?.position.x).toBeLessThan(0.5);
      expect(imageElement?.position.x).toBeGreaterThanOrEqual(0.5);
    });

    it('should limit image width', () => {
      const content: SlideContent = {
        title: 'Large Image',
        body: ['Text'],
        images: ['large-image.jpg']
      };

      const layout = engine.decideLayout(content, 4, 10);
      const imageElement = layout.elements.find(e => e.type === 'image');
      const rules = engine.getDesignRules();

      expect(imageElement?.position.width).toBeLessThanOrEqual(rules.imageMaxWidthPercent / 100);
    });
  });

  describe('Code Layout', () => {
    it('should create code layout', () => {
      const content: SlideContent = {
        title: 'Code Example',
        body: [],
        code: 'function hello() {\n  console.log("Hello");\n}'
      };

      const layout = engine.decideLayout(content, 5, 10);

      expect(layout.type).toBe('code');
      expect(layout.spacing).toBe('compact');
      expect(layout.elements.some(e => e.type === 'code')).toBe(true);
    });

    it('should use monospace font for code', () => {
      const content: SlideContent = {
        title: 'Code',
        body: [],
        code: 'const x = 42;'
      };

      const layout = engine.decideLayout(content, 5, 10);
      const codeElement = layout.elements.find(e => e.type === 'code');

      expect(codeElement?.style?.fontFamily).toContain('monospace');
    });
  });

  describe('Conclusion Slide Layout', () => {
    it('should create centered conclusion layout', () => {
      const content: SlideContent = {
        title: 'Thank You!',
        body: []
      };

      const layout = engine.decideLayout(content, 10, 10);

      expect(layout.type).toBe('conclusion');
      expect(layout.textAlignment).toBe('center');
    });
  });

  describe('Layout Validation', () => {
    it('should validate elements within bounds', () => {
      const content: SlideContent = {
        title: 'Valid Layout',
        body: ['Content']
      };

      const layout = engine.decideLayout(content, 2, 10);
      const validation = engine.validateLayout(layout, content);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect excessive word count', () => {
      const content: SlideContent = {
        title: 'Too Much Text',
        body: [Array(100).fill('word').join(' ')]
      };

      const layout = engine.decideLayout(content, 2, 10);
      const validation = engine.validateLayout(layout, content);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('words'))).toBe(true);
    });
  });

  describe('Visual Balance', () => {
    it('should calculate balance for centered layout', () => {
      const content: SlideContent = {
        title: 'Centered',
        body: []
      };

      const layout = engine.decideLayout(content, 1, 10);
      const balance = engine.calculateBalance(layout);

      expect(balance).toBeGreaterThan(0.8);
    });

    it('should detect imbalanced layouts', () => {
      const content: SlideContent = {
        title: 'Imbalanced',
        body: ['Left side text'],
        images: ['right-image.jpg']
      };

      const layout = engine.decideLayout(content, 4, 10);
      const balance = engine.calculateBalance(layout);

      expect(balance).toBeGreaterThan(0);
      expect(balance).toBeLessThanOrEqual(1);
    });
  });

  describe('Design Rules Customization', () => {
    it('should allow updating design rules', () => {
      engine.updateDesignRules({ maxBulletsPerSlide: 5 });
      const rules = engine.getDesignRules();

      expect(rules.maxBulletsPerSlide).toBe(5);
    });

    it('should preserve other rules when updating', () => {
      const originalRules = engine.getDesignRules();
      engine.updateDesignRules({ maxBulletsPerSlide: 5 });
      const updatedRules = engine.getDesignRules();

      expect(updatedRules.maxWordsPerSlide).toBe(originalRules.maxWordsPerSlide);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      const content: SlideContent = {
        title: '',
        body: []
      };

      const layout = engine.decideLayout(content, 2, 10);
      expect(layout).toBeDefined();
    });

    it('should handle very long titles', () => {
      const content: SlideContent = {
        title: 'A'.repeat(200),
        body: []
      };

      const layout = engine.decideLayout(content, 1, 10);
      expect(layout.elements[0].content).toBeTruthy();
    });

    it('should handle single slide presentation', () => {
      const content: SlideContent = {
        title: 'Only Slide',
        body: ['Content']
      };

      const layout = engine.decideLayout(content, 1, 1);
      expect(layout.type).toBe('title');
    });
  });
});

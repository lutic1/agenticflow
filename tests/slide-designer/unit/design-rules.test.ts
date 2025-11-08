/**
 * Unit Tests for Design Rules
 * Tests design validation, accessibility, and quality checks
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

// Types
interface DesignRules {
  typography: TypographyRules;
  color: ColorRules;
  spacing: SpacingRules;
  accessibility: AccessibilityRules;
  content: ContentRules;
}

interface TypographyRules {
  minFontSize: number;
  maxFontSize: number;
  titleFontSize: number;
  bodyFontSize: number;
  lineHeight: number;
  maxLineLength: number;
  fontFamilies: string[];
}

interface ColorRules {
  contrastRatio: number;
  maxColorsPerSlide: number;
  allowedThemes: string[];
}

interface SpacingRules {
  minMargin: number;
  maxContentWidth: number;
  elementSpacing: number;
  sectionSpacing: number;
}

interface AccessibilityRules {
  minContrastRatio: number;
  requireAltText: boolean;
  maxAnimationDuration: number;
  keyboardNavigable: boolean;
}

interface ContentRules {
  maxBulletsPerSlide: number;
  maxWordsPerSlide: number;
  maxWordsPerBullet: number;
  maxLinesPerSlide: number;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number;
}

interface ValidationError {
  rule: string;
  message: string;
  severity: 'error' | 'warning';
}

interface ValidationWarning {
  rule: string;
  message: string;
  suggestion: string;
}

interface SlideDesign {
  colors: string[];
  fonts: string[];
  fontSize: number;
  textContent: string;
  bulletCount: number;
  images: { alt?: string }[];
  backgroundColor: string;
  textColor: string;
}

// Mock Design Validator
class DesignValidator {
  private rules: DesignRules;

  constructor() {
    this.rules = {
      typography: {
        minFontSize: 16,
        maxFontSize: 72,
        titleFontSize: 48,
        bodyFontSize: 20,
        lineHeight: 1.5,
        maxLineLength: 80,
        fontFamilies: ['Inter', 'Roboto', 'Open Sans', 'Arial', 'Helvetica']
      },
      color: {
        contrastRatio: 4.5,
        maxColorsPerSlide: 5,
        allowedThemes: ['light', 'dark', 'corporate', 'modern']
      },
      spacing: {
        minMargin: 5,
        maxContentWidth: 90,
        elementSpacing: 1,
        sectionSpacing: 2
      },
      accessibility: {
        minContrastRatio: 4.5,
        requireAltText: true,
        maxAnimationDuration: 3000,
        keyboardNavigable: true
      },
      content: {
        maxBulletsPerSlide: 7,
        maxWordsPerSlide: 50,
        maxWordsPerBullet: 15,
        maxLinesPerSlide: 10
      }
    };
  }

  validateDesign(design: SlideDesign): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate colors
    if (design.colors.length > this.rules.color.maxColorsPerSlide) {
      errors.push({
        rule: 'color.maxColorsPerSlide',
        message: `Too many colors: ${design.colors.length} > ${this.rules.color.maxColorsPerSlide}`,
        severity: 'error'
      });
    }

    // Validate typography
    if (design.fontSize < this.rules.typography.minFontSize) {
      errors.push({
        rule: 'typography.minFontSize',
        message: `Font size too small: ${design.fontSize} < ${this.rules.typography.minFontSize}`,
        severity: 'error'
      });
    }

    if (design.fontSize > this.rules.typography.maxFontSize) {
      errors.push({
        rule: 'typography.maxFontSize',
        message: `Font size too large: ${design.fontSize} > ${this.rules.typography.maxFontSize}`,
        severity: 'error'
      });
    }

    // Validate content
    const wordCount = design.textContent.split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount > this.rules.content.maxWordsPerSlide) {
      warnings.push({
        rule: 'content.maxWordsPerSlide',
        message: `Too many words: ${wordCount} > ${this.rules.content.maxWordsPerSlide}`,
        suggestion: 'Consider splitting content across multiple slides'
      });
    }

    if (design.bulletCount > this.rules.content.maxBulletsPerSlide) {
      errors.push({
        rule: 'content.maxBulletsPerSlide',
        message: `Too many bullets: ${design.bulletCount} > ${this.rules.content.maxBulletsPerSlide}`,
        severity: 'error'
      });
    }

    // Validate accessibility
    const contrast = this.calculateContrast(design.backgroundColor, design.textColor);
    if (contrast < this.rules.accessibility.minContrastRatio) {
      errors.push({
        rule: 'accessibility.minContrastRatio',
        message: `Insufficient contrast: ${contrast.toFixed(2)} < ${this.rules.accessibility.minContrastRatio}`,
        severity: 'error'
      });
    }

    if (this.rules.accessibility.requireAltText) {
      const missingAlt = design.images.filter(img => !img.alt);
      if (missingAlt.length > 0) {
        errors.push({
          rule: 'accessibility.requireAltText',
          message: `${missingAlt.length} images missing alt text`,
          severity: 'warning'
        });
      }
    }

    const score = this.calculateScore(errors, warnings);

    return {
      valid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      warnings,
      score
    };
  }

  validateTypography(fontSize: number, fontFamily: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (fontSize < this.rules.typography.minFontSize) {
      errors.push({
        rule: 'typography.minFontSize',
        message: `Font size ${fontSize} is below minimum ${this.rules.typography.minFontSize}`,
        severity: 'error'
      });
    }

    if (fontSize > this.rules.typography.maxFontSize) {
      errors.push({
        rule: 'typography.maxFontSize',
        message: `Font size ${fontSize} exceeds maximum ${this.rules.typography.maxFontSize}`,
        severity: 'error'
      });
    }

    if (!this.rules.typography.fontFamilies.some(f => fontFamily.includes(f))) {
      warnings.push({
        rule: 'typography.fontFamilies',
        message: `Font family "${fontFamily}" is not in recommended list`,
        suggestion: `Consider using: ${this.rules.typography.fontFamilies.join(', ')}`
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      score: this.calculateScore(errors, warnings)
    };
  }

  validateAccessibility(backgroundColor: string, textColor: string, images: any[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const contrast = this.calculateContrast(backgroundColor, textColor);
    if (contrast < this.rules.accessibility.minContrastRatio) {
      errors.push({
        rule: 'accessibility.contrast',
        message: `Contrast ratio ${contrast.toFixed(2)} is below minimum ${this.rules.accessibility.minContrastRatio}`,
        severity: 'error'
      });
    }

    if (this.rules.accessibility.requireAltText) {
      const missingAlt = images.filter(img => !img.alt || img.alt.trim() === '');
      if (missingAlt.length > 0) {
        errors.push({
          rule: 'accessibility.altText',
          message: `${missingAlt.length} images missing descriptive alt text`,
          severity: 'warning'
        });
      }
    }

    return {
      valid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      warnings,
      score: this.calculateScore(errors, warnings)
    };
  }

  validateContent(text: string, bulletCount: number): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount > this.rules.content.maxWordsPerSlide) {
      warnings.push({
        rule: 'content.wordCount',
        message: `Slide contains ${wordCount} words (recommended: ${this.rules.content.maxWordsPerSlide})`,
        suggestion: 'Consider splitting content or using more concise language'
      });
    }

    if (bulletCount > this.rules.content.maxBulletsPerSlide) {
      errors.push({
        rule: 'content.bulletCount',
        message: `Too many bullet points: ${bulletCount} (maximum: ${this.rules.content.maxBulletsPerSlide})`,
        severity: 'error'
      });
    }

    const lines = text.split('\n').length;
    if (lines > this.rules.content.maxLinesPerSlide) {
      warnings.push({
        rule: 'content.lineCount',
        message: `Too many lines: ${lines} (recommended: ${this.rules.content.maxLinesPerSlide})`,
        suggestion: 'Reduce text density for better readability'
      });
    }

    return {
      valid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      warnings,
      score: this.calculateScore(errors, warnings)
    };
  }

  calculateContrast(bg: string, fg: string): number {
    // Simplified contrast calculation
    // In real implementation, would use WCAG contrast formula
    const bgLum = this.getLuminance(bg);
    const fgLum = this.getLuminance(fg);

    const lighter = Math.max(bgLum, fgLum);
    const darker = Math.min(bgLum, fgLum);

    return (lighter + 0.05) / (darker + 0.05);
  }

  private getLuminance(color: string): number {
    // Simplified luminance calculation
    // Convert hex to RGB and calculate relative luminance
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  private calculateScore(errors: ValidationError[], warnings: ValidationWarning[]): number {
    let score = 100;

    errors.forEach(error => {
      score -= error.severity === 'error' ? 15 : 5;
    });

    warnings.forEach(() => {
      score -= 3;
    });

    return Math.max(0, Math.min(100, score));
  }

  getRules(): DesignRules {
    return JSON.parse(JSON.stringify(this.rules));
  }

  updateRules(updates: Partial<DesignRules>): void {
    this.rules = { ...this.rules, ...updates };
  }

  suggestImprovements(design: SlideDesign): string[] {
    const suggestions: string[] = [];

    // Typography suggestions
    if (design.fontSize < 20) {
      suggestions.push('Consider increasing font size for better readability');
    }

    // Color suggestions
    const contrast = this.calculateContrast(design.backgroundColor, design.textColor);
    if (contrast < 7) {
      suggestions.push('Increase color contrast for better accessibility');
    }

    // Content suggestions
    const wordCount = design.textContent.split(/\s+/).length;
    if (wordCount > 40) {
      suggestions.push('Reduce text content for better audience engagement');
    }

    if (design.bulletCount > 5) {
      suggestions.push('Limit bullet points to 5-7 for optimal retention');
    }

    return suggestions;
  }
}

describe('DesignValidator', () => {
  let validator: DesignValidator;

  beforeEach(() => {
    validator = new DesignValidator();
  });

  describe('Initialization', () => {
    it('should initialize with default rules', () => {
      const rules = validator.getRules();
      expect(rules).toBeDefined();
      expect(rules.typography).toBeDefined();
      expect(rules.color).toBeDefined();
      expect(rules.spacing).toBeDefined();
      expect(rules.accessibility).toBeDefined();
      expect(rules.content).toBeDefined();
    });
  });

  describe('Full Design Validation', () => {
    it('should validate a good design', () => {
      const design: SlideDesign = {
        colors: ['#2563eb', '#64748b'],
        fonts: ['Inter'],
        fontSize: 20,
        textContent: 'This is a well-designed slide with appropriate content length.',
        bulletCount: 3,
        images: [{ alt: 'Descriptive alt text' }],
        backgroundColor: '#ffffff',
        textColor: '#1a1a1a'
      };

      const result = validator.validateDesign(design);
      expect(result.valid).toBe(true);
      expect(result.errors.filter(e => e.severity === 'error')).toHaveLength(0);
      expect(result.score).toBeGreaterThan(80);
    });

    it('should detect too many colors', () => {
      const design: SlideDesign = {
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
        fonts: ['Inter'],
        fontSize: 20,
        textContent: 'Test content',
        bulletCount: 3,
        images: [],
        backgroundColor: '#ffffff',
        textColor: '#000000'
      };

      const result = validator.validateDesign(design);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.rule === 'color.maxColorsPerSlide')).toBe(true);
    });

    it('should detect font size violations', () => {
      const tooSmall: SlideDesign = {
        colors: ['#2563eb'],
        fonts: ['Inter'],
        fontSize: 12,
        textContent: 'Test',
        bulletCount: 0,
        images: [],
        backgroundColor: '#ffffff',
        textColor: '#000000'
      };

      const result = validator.validateDesign(tooSmall);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.rule === 'typography.minFontSize')).toBe(true);
    });

    it('should detect too many bullets', () => {
      const design: SlideDesign = {
        colors: ['#2563eb'],
        fonts: ['Inter'],
        fontSize: 20,
        textContent: 'Test content',
        bulletCount: 10,
        images: [],
        backgroundColor: '#ffffff',
        textColor: '#000000'
      };

      const result = validator.validateDesign(design);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.rule === 'content.maxBulletsPerSlide')).toBe(true);
    });

    it('should warn about excessive text', () => {
      const longText = Array(100).fill('word').join(' ');
      const design: SlideDesign = {
        colors: ['#2563eb'],
        fonts: ['Inter'],
        fontSize: 20,
        textContent: longText,
        bulletCount: 3,
        images: [],
        backgroundColor: '#ffffff',
        textColor: '#000000'
      };

      const result = validator.validateDesign(design);
      expect(result.warnings.some(w => w.rule === 'content.maxWordsPerSlide')).toBe(true);
    });

    it('should detect missing alt text', () => {
      const design: SlideDesign = {
        colors: ['#2563eb'],
        fonts: ['Inter'],
        fontSize: 20,
        textContent: 'Test content',
        bulletCount: 3,
        images: [{ alt: '' }, { alt: 'Good alt' }, {}],
        backgroundColor: '#ffffff',
        textColor: '#000000'
      };

      const result = validator.validateDesign(design);
      expect(result.errors.some(e => e.rule === 'accessibility.requireAltText')).toBe(true);
    });
  });

  describe('Typography Validation', () => {
    it('should validate good typography', () => {
      const result = validator.validateTypography(20, 'Inter, sans-serif');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject too small fonts', () => {
      const result = validator.validateTypography(10, 'Arial');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.rule === 'typography.minFontSize')).toBe(true);
    });

    it('should reject too large fonts', () => {
      const result = validator.validateTypography(100, 'Arial');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.rule === 'typography.maxFontSize')).toBe(true);
    });

    it('should warn about non-recommended fonts', () => {
      const result = validator.validateTypography(20, 'Comic Sans MS');
      expect(result.warnings.some(w => w.rule === 'typography.fontFamilies')).toBe(true);
    });

    it('should accept recommended fonts', () => {
      const fonts = ['Inter', 'Roboto', 'Open Sans', 'Arial'];

      fonts.forEach(font => {
        const result = validator.validateTypography(20, font);
        expect(result.warnings.filter(w => w.rule === 'typography.fontFamilies')).toHaveLength(0);
      });
    });
  });

  describe('Accessibility Validation', () => {
    it('should validate good contrast', () => {
      const result = validator.validateAccessibility('#ffffff', '#000000', []);
      expect(result.valid).toBe(true);
    });

    it('should detect poor contrast', () => {
      const result = validator.validateAccessibility('#ffffff', '#f0f0f0', []);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.rule === 'accessibility.contrast')).toBe(true);
    });

    it('should validate alt text presence', () => {
      const images = [
        { alt: 'Image 1' },
        { alt: 'Image 2' }
      ];

      const result = validator.validateAccessibility('#ffffff', '#000000', images);
      expect(result.errors.filter(e => e.rule === 'accessibility.altText')).toHaveLength(0);
    });

    it('should detect missing alt text', () => {
      const images = [
        { alt: 'Image 1' },
        { alt: '' },
        {}
      ];

      const result = validator.validateAccessibility('#ffffff', '#000000', images);
      expect(result.errors.some(e => e.rule === 'accessibility.altText')).toBe(true);
    });

    it('should validate dark mode accessibility', () => {
      const result = validator.validateAccessibility('#1a1a1a', '#ffffff', []);
      expect(result.valid).toBe(true);
    });
  });

  describe('Content Validation', () => {
    it('should validate appropriate content', () => {
      const text = 'This is a concise slide with good content length.';
      const result = validator.validateContent(text, 3);
      expect(result.valid).toBe(true);
    });

    it('should warn about excessive words', () => {
      const longText = Array(100).fill('word').join(' ');
      const result = validator.validateContent(longText, 3);
      expect(result.warnings.some(w => w.rule === 'content.wordCount')).toBe(true);
    });

    it('should detect too many bullets', () => {
      const result = validator.validateContent('Test content', 10);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.rule === 'content.bulletCount')).toBe(true);
    });

    it('should warn about too many lines', () => {
      const manyLines = Array(15).fill('Line of text').join('\n');
      const result = validator.validateContent(manyLines, 3);
      expect(result.warnings.some(w => w.rule === 'content.lineCount')).toBe(true);
    });
  });

  describe('Contrast Calculation', () => {
    it('should calculate high contrast correctly', () => {
      const contrast = validator.calculateContrast('#ffffff', '#000000');
      expect(contrast).toBeGreaterThan(10);
    });

    it('should calculate low contrast correctly', () => {
      const contrast = validator.calculateContrast('#ffffff', '#f0f0f0');
      expect(contrast).toBeLessThan(2);
    });

    it('should handle same colors', () => {
      const contrast = validator.calculateContrast('#ffffff', '#ffffff');
      expect(contrast).toBeCloseTo(1, 1);
    });
  });

  describe('Scoring System', () => {
    it('should give perfect score for perfect design', () => {
      const design: SlideDesign = {
        colors: ['#2563eb'],
        fonts: ['Inter'],
        fontSize: 20,
        textContent: 'Perfect slide content.',
        bulletCount: 3,
        images: [{ alt: 'Descriptive text' }],
        backgroundColor: '#ffffff',
        textColor: '#1a1a1a'
      };

      const result = validator.validateDesign(design);
      expect(result.score).toBe(100);
    });

    it('should reduce score for errors', () => {
      const design: SlideDesign = {
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
        fonts: ['Comic Sans'],
        fontSize: 12,
        textContent: 'Test',
        bulletCount: 10,
        images: [{}],
        backgroundColor: '#ffffff',
        textColor: '#f0f0f0'
      };

      const result = validator.validateDesign(design);
      expect(result.score).toBeLessThan(50);
    });
  });

  describe('Improvement Suggestions', () => {
    it('should suggest increasing font size', () => {
      const design: SlideDesign = {
        colors: ['#2563eb'],
        fonts: ['Inter'],
        fontSize: 16,
        textContent: 'Test',
        bulletCount: 3,
        images: [],
        backgroundColor: '#ffffff',
        textColor: '#000000'
      };

      const suggestions = validator.suggestImprovements(design);
      expect(suggestions.some(s => s.includes('font size'))).toBe(true);
    });

    it('should suggest improving contrast', () => {
      const design: SlideDesign = {
        colors: ['#2563eb'],
        fonts: ['Inter'],
        fontSize: 20,
        textContent: 'Test',
        bulletCount: 3,
        images: [],
        backgroundColor: '#ffffff',
        textColor: '#cccccc'
      };

      const suggestions = validator.suggestImprovements(design);
      expect(suggestions.some(s => s.includes('contrast'))).toBe(true);
    });

    it('should suggest reducing content', () => {
      const design: SlideDesign = {
        colors: ['#2563eb'],
        fonts: ['Inter'],
        fontSize: 20,
        textContent: Array(50).fill('word').join(' '),
        bulletCount: 6,
        images: [],
        backgroundColor: '#ffffff',
        textColor: '#000000'
      };

      const suggestions = validator.suggestImprovements(design);
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('Rules Management', () => {
    it('should get current rules', () => {
      const rules = validator.getRules();
      expect(rules.typography.minFontSize).toBe(16);
      expect(rules.content.maxBulletsPerSlide).toBe(7);
    });

    it('should update rules', () => {
      validator.updateRules({
        content: {
          maxBulletsPerSlide: 5,
          maxWordsPerSlide: 40,
          maxWordsPerBullet: 10,
          maxLinesPerSlide: 8
        }
      });

      const rules = validator.getRules();
      expect(rules.content.maxBulletsPerSlide).toBe(5);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      const design: SlideDesign = {
        colors: [],
        fonts: [],
        fontSize: 20,
        textContent: '',
        bulletCount: 0,
        images: [],
        backgroundColor: '#ffffff',
        textColor: '#000000'
      };

      const result = validator.validateDesign(design);
      expect(result).toBeDefined();
    });

    it('should handle invalid color format', () => {
      const contrast = validator.calculateContrast('invalid', 'color');
      expect(isNaN(contrast)).toBe(false);
    });

    it('should handle missing properties', () => {
      const minimal: Partial<SlideDesign> = {
        colors: ['#000000'],
        fontSize: 20
      };

      expect(() => {
        validator.validateDesign(minimal as SlideDesign);
      }).not.toThrow();
    });
  });
});

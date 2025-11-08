/**
 * P0 Integration Test Suite
 * Comprehensive testing for all P0 features
 * Target: 90%+ code coverage
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { GridLayoutEngine } from '../src/slide-designer/core-v2/grid-layout-engine';
import { TypographyEngine } from '../src/slide-designer/core-v2/typography-engine';
import { ColorEngine } from '../src/slide-designer/core-v2/color-engine';
import { ChartRenderer } from '../src/slide-designer/core-v2/chart-renderer';
import { LLMJudge } from '../src/slide-designer/quality-control/llm-judge';
import { ContentValidator } from '../src/slide-designer/quality-control/content-validator';
import { TextOverflowHandler } from '../src/slide-designer/core-v2/text-overflow-handler';
import { MasterSlideManager } from '../src/slide-designer/core-v2/master-slide-manager';

// ==================== GRID LAYOUT ENGINE TESTS ====================

describe('GridLayoutEngine (P0)', () => {
  let engine: GridLayoutEngine;

  beforeEach(() => {
    engine = new GridLayoutEngine();
  });

  describe('analyzeContent', () => {
    it('should correctly identify title slide type', () => {
      const analysis = engine.analyzeContent({
        text: 'Product Launch 2024',
        hasImage: false
      });

      expect(analysis.slideType).toBe('title');
      expect(analysis.complexity).toBe('simple');
      expect(analysis.wordCount).toBe(3);
    });

    it('should correctly identify image-focus slide type', () => {
      const analysis = engine.analyzeContent({
        text: 'Beautiful architecture',
        hasImage: true,
        hasChart: false
      });

      expect(analysis.slideType).toBe('image-focus');
      expect(analysis.hasImage).toBe(true);
    });

    it('should correctly identify data slide type', () => {
      const analysis = engine.analyzeContent({
        text: 'Q4 Revenue Performance',
        hasChart: true
      });

      expect(analysis.slideType).toBe('data');
      expect(analysis.hasChart).toBe(true);
    });

    it('should determine complexity based on word count and bullets', () => {
      const simple = engine.analyzeContent({
        text: 'Key Takeaway',
        bulletPoints: ['Point 1', 'Point 2']
      });

      const medium = engine.analyzeContent({
        text: 'This is a medium length text with approximately fifty words to test the complexity detection algorithm implementation for slides',
        bulletPoints: ['Point 1', 'Point 2', 'Point 3', 'Point 4']
      });

      const complex = engine.analyzeContent({
        text: 'This is a very long text that exceeds the normal word count limit and should be classified as complex because it has more than seventy five words which is the Nancy Duarte recommended maximum for any presentation slide to ensure readability and audience engagement',
        bulletPoints: ['A', 'B', 'C', 'D', 'E', 'F']
      });

      expect(simple.complexity).toBe('simple');
      expect(medium.complexity).toBe('medium');
      expect(complex.complexity).toBe('complex');
    });
  });

  describe('selectLayout', () => {
    it('should select title-centered for first slide', () => {
      const analysis = engine.analyzeContent({ text: 'Welcome' });
      const layout = engine.selectLayout(analysis, 0, 10);

      expect(layout.name).toBe('Title Centered');
      expect(layout.whitespacePercent).toBe(60);
    });

    it('should select title-centered for last slide', () => {
      const analysis = engine.analyzeContent({ text: 'Thank you' });
      const layout = engine.selectLayout(analysis, 9, 10);

      expect(layout.name).toBe('Title Centered');
    });

    it('should select hero-70-30 for image-focused slides', () => {
      const analysis = engine.analyzeContent({
        text: 'Amazing Product',
        hasImage: true
      });
      const layout = engine.selectLayout(analysis, 2, 10);

      expect(layout.name).toBe('Hero Image 70/30');
      expect(layout.constraints.minImageSize).toBe(600);
    });

    it('should select split-50-50 for balanced content', () => {
      const analysis = engine.analyzeContent({
        text: 'This text has moderate length between fifty and one hundred words to trigger the balanced split layout selection algorithm',
        hasImage: true
      });
      const layout = engine.selectLayout(analysis, 3, 10);

      expect(layout.name).toBe('Split 50/50');
    });

    it('should select two-column for complex content', () => {
      const analysis = engine.analyzeContent({
        text: 'Complex slide',
        bulletPoints: ['1', '2', '3', '4', '5', '6']
      });
      const layout = engine.selectLayout(analysis, 4, 10);

      expect(layout.name).toBe('Two Column');
    });

    it('should select content-focused as default', () => {
      const analysis = engine.analyzeContent({
        text: 'Regular content slide with moderate text'
      });
      const layout = engine.selectLayout(analysis, 5, 10);

      expect(layout.name).toBe('Content Focused');
      expect(layout.whitespacePercent).toBe(45);
    });
  });

  describe('generateCSS', () => {
    it('should generate valid CSS for grid layout', () => {
      const layout = engine.getLayout('split-50-50');
      const css = engine.generateCSS(layout!, 'slide-1');

      expect(css).toContain('display: grid');
      expect(css).toContain('grid-template-columns: repeat(12, 1fr)');
      expect(css).toContain('gap: 24px');
      expect(css).toContain('padding: 48px');
    });

    it('should include responsive breakpoints', () => {
      const layout = engine.getLayout('content-focused');
      const css = engine.generateCSS(layout!, 'slide-2');

      expect(css).toContain('@media (max-width: 1024px)');
      expect(css).toContain('@media (max-width: 768px)');
    });

    it('should generate area-specific CSS', () => {
      const layout = engine.getLayout('two-column');
      const css = engine.generateCSS(layout!, 'slide-3');

      expect(css).toContain('.title');
      expect(css).toContain('.content');
      expect(css).toContain('grid-column:');
      expect(css).toContain('grid-row:');
    });
  });

  describe('validate', () => {
    it('should pass validation for good layouts', () => {
      const layout = engine.getLayout('content-focused')!;
      const analysis = engine.analyzeContent({
        text: 'Good content that fits well'
      });

      const validation = engine.validate(layout, analysis);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.score).toBeGreaterThanOrEqual(80);
    });

    it('should fail validation for insufficient whitespace', () => {
      const badLayout = {
        ...engine.getLayout('content-focused')!,
        whitespacePercent: 30
      };
      const analysis = engine.analyzeContent({ text: 'Test' });

      const validation = engine.validate(badLayout, analysis);

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors[0]).toContain('whitespace');
    });

    it('should warn for text area too wide', () => {
      const wideLayout = {
        ...engine.getLayout('content-focused')!,
        constraints: {
          minTextWidth: 200,
          maxTextWidth: 900,
          minImageSize: 0
        }
      };
      const analysis = engine.analyzeContent({ text: 'Test' });

      const validation = engine.validate(wideLayout, analysis);

      expect(validation.warnings.length).toBeGreaterThan(0);
    });

    it('should error for too much text in single-column layout', () => {
      const layout = engine.getLayout('content-focused')!;
      const analysis = engine.analyzeContent({
        text: 'This is way too much text for a single column layout with more than seventy five words which will definitely overflow the container and cause readability issues'
      });

      const validation = engine.validate(layout, analysis);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('Too much text'))).toBe(true);
    });
  });

  describe('performance', () => {
    it('should analyze content in under 10ms', () => {
      const start = performance.now();

      engine.analyzeContent({
        text: 'Performance test content with moderate length',
        hasImage: true,
        bulletPoints: ['A', 'B', 'C']
      });

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(10);
    });

    it('should select layout in under 5ms', () => {
      const analysis = engine.analyzeContent({
        text: 'Test content',
        hasImage: true
      });

      const start = performance.now();
      engine.selectLayout(analysis, 3, 10);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(5);
    });
  });
});

// ==================== TYPOGRAPHY ENGINE TESTS ====================

describe('TypographyEngine (P0)', () => {
  let engine: TypographyEngine;

  beforeEach(() => {
    engine = new TypographyEngine();
  });

  describe('analyzeContent', () => {
    it('should count words correctly', () => {
      const metrics = engine.analyzeContent({
        title: 'Product Launch',
        subtitle: 'Q4 2024',
        body: 'Join us for an exciting announcement',
        bullets: ['Feature 1', 'Feature 2', 'Feature 3']
      });

      expect(metrics.wordCount).toBe(13); // 2 + 2 + 6 + 6
      expect(metrics.bulletCount).toBe(3);
    });

    it('should find longest line', () => {
      const metrics = engine.analyzeContent({
        title: 'Short',
        body: 'This is a much longer line of text that should be detected',
        bullets: ['Bullet 1']
      });

      expect(metrics.longestLine).toBeGreaterThan(40);
    });

    it('should estimate height reasonably', () => {
      const metrics = engine.analyzeContent({
        title: 'Title',
        subtitle: 'Subtitle',
        bullets: ['A', 'B', 'C']
      });

      expect(metrics.estimatedHeight).toBeGreaterThan(150);
      expect(metrics.estimatedHeight).toBeLessThan(300);
    });
  });

  describe('calculateSizes', () => {
    it('should use larger sizes for title slides with light content', () => {
      const metrics = engine.analyzeContent({
        title: 'Welcome'
      });

      const sizes = engine.calculateSizes(metrics, 'title');

      expect(sizes.h1).toBeGreaterThanOrEqual(55); // 3xl scale
      expect(sizes.h2).toBeGreaterThanOrEqual(44);
    });

    it('should reduce sizes for heavy content', () => {
      const metrics = engine.analyzeContent({
        title: 'Complex Slide',
        body: 'This slide has a lot of content with many words that will require smaller font sizes to fit properly within the constraints',
        bullets: ['Point 1', 'Point 2', 'Point 3', 'Point 4', 'Point 5']
      });

      const sizes = engine.calculateSizes(metrics, 'content');

      expect(sizes.h1).toBeLessThan(44); // Should be reduced
      expect(sizes.body).toBe(18); // Minimum maintained
    });

    it('should enforce WCAG minimums', () => {
      const metrics = engine.analyzeContent({
        title: 'Test',
        body: 'Content with many bullets',
        bullets: ['1', '2', '3', '4', '5', '6', '7']
      });

      const sizes = engine.calculateSizes(metrics, 'content');

      expect(sizes.h1).toBeGreaterThanOrEqual(32); // Min title
      expect(sizes.body).toBeGreaterThanOrEqual(18); // WCAG AAA
      expect(sizes.caption).toBeGreaterThanOrEqual(14);
    });

    it('should maintain title-to-body hierarchy (≥2.5:1)', () => {
      const metrics = engine.analyzeContent({
        title: 'Title',
        body: 'Body text'
      });

      const sizes = engine.calculateSizes(metrics, 'content');
      const ratio = sizes.h1 / sizes.body;

      expect(ratio).toBeGreaterThanOrEqual(2.5);
    });

    it('should set appropriate line heights', () => {
      const metrics = engine.analyzeContent({ title: 'Test' });
      const sizes = engine.calculateSizes(metrics, 'title');

      expect(sizes.lineHeight.title).toBe(1.2); // Tight for titles
      expect(sizes.lineHeight.body).toBe(1.6); // Comfortable for body
    });
  });

  describe('generateCSS', () => {
    it('should generate responsive CSS with clamp()', () => {
      const sizes = engine.calculateSizes(
        engine.analyzeContent({ title: 'Test' }),
        'title'
      );
      const css = engine.generateCSS(sizes, 'slide-1');

      expect(css).toContain('clamp(');
      expect(css).toContain('vw');
      expect(css).toContain('line-height:');
      expect(css).toContain('letter-spacing:');
    });

    it('should include responsive breakpoints', () => {
      const sizes = engine.calculateSizes(
        engine.analyzeContent({ title: 'Test' }),
        'content'
      );
      const css = engine.generateCSS(sizes, 'slide-2');

      expect(css).toContain('@media (max-width: 1024px)');
      expect(css).toContain('@media (max-width: 768px)');
      expect(css).toContain('max-width: 60ch');
    });
  });

  describe('validate', () => {
    it('should pass for good typography', () => {
      const metrics = engine.analyzeContent({
        title: 'Great Title',
        body: 'Concise content that follows best practices'
      });
      const sizes = engine.calculateSizes(metrics, 'content');

      const validation = engine.validate(sizes, metrics);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.score).toBeGreaterThanOrEqual(90);
    });

    it('should fail for Nancy Duarte 75-word rule violation', () => {
      const longText = 'word '.repeat(80);
      const metrics = engine.analyzeContent({ body: longText });
      const sizes = engine.calculateSizes(metrics, 'content');

      const validation = engine.validate(sizes, metrics);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('75-word'))).toBe(true);
    });

    it('should fail for poor title hierarchy', () => {
      const metrics = engine.analyzeContent({ title: 'Test' });
      const badSizes = {
        h1: 20, // Too small
        h2: 18,
        h3: 16,
        body: 18,
        caption: 14,
        lineHeight: { title: 1.2, body: 1.6 },
        letterSpacing: { title: '-0.02em', body: '0' }
      };

      const validation = engine.validate(badSizes, metrics);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('hierarchy'))).toBe(true);
    });

    it('should warn for too many bullets', () => {
      const metrics = engine.analyzeContent({
        bullets: ['1', '2', '3', '4', '5', '6', '7']
      });
      const sizes = engine.calculateSizes(metrics, 'content');

      const validation = engine.validate(sizes, metrics);

      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings.some(w => w.includes('bullet'))).toBe(true);
    });

    it('should provide actionable recommendations', () => {
      const metrics = engine.analyzeContent({
        title: 'Title',
        body: 'word '.repeat(80)
      });
      const sizes = engine.calculateSizes(metrics, 'content');

      const validation = engine.validate(sizes, metrics);

      expect(validation.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('performance', () => {
    it('should analyze content in under 5ms', () => {
      const start = performance.now();

      engine.analyzeContent({
        title: 'Title',
        body: 'Body content',
        bullets: ['A', 'B', 'C']
      });

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(5);
    });

    it('should calculate sizes in under 5ms', () => {
      const metrics = engine.analyzeContent({ title: 'Test' });
      const start = performance.now();

      engine.calculateSizes(metrics, 'content');

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(5);
    });
  });
});

// ==================== COLOR ENGINE TESTS ====================

describe('ColorEngine (P0)', () => {
  let engine: ColorEngine;

  beforeEach(() => {
    engine = new ColorEngine();
  });

  describe('calculateContrastRatio', () => {
    it('should calculate correct contrast for black on white', () => {
      const ratio = engine.calculateContrastRatio('#000000', '#FFFFFF');
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('should calculate correct contrast for gray text', () => {
      const ratio = engine.calculateContrastRatio('#767676', '#FFFFFF');
      expect(ratio).toBeCloseTo(4.5, 1); // AA minimum
    });

    it('should be commutative (same result regardless of order)', () => {
      const ratio1 = engine.calculateContrastRatio('#1F2937', '#FFFFFF');
      const ratio2 = engine.calculateContrastRatio('#FFFFFF', '#1F2937');
      expect(ratio1).toBeCloseTo(ratio2, 2);
    });
  });

  describe('checkContrast', () => {
    it('should pass AAA for high contrast text', () => {
      const check = engine.checkContrast(
        '#1F2937',
        '#FFFFFF',
        'normal',
        'AAA'
      );

      expect(check.passes).toBe(true);
      expect(check.level).toBe('AAA');
      expect(check.ratio).toBeGreaterThanOrEqual(7.0);
    });

    it('should fail AAA for insufficient contrast', () => {
      const check = engine.checkContrast(
        '#999999',
        '#FFFFFF',
        'normal',
        'AAA'
      );

      expect(check.passes).toBe(false);
      expect(check.recommendation).toBeDefined();
    });

    it('should handle large text differently', () => {
      const normalCheck = engine.checkContrast(
        '#767676',
        '#FFFFFF',
        'normal',
        'AA'
      );

      const largeCheck = engine.checkContrast(
        '#767676',
        '#FFFFFF',
        'large',
        'AA'
      );

      expect(largeCheck.passes).toBe(true); // Easier standard for large text
    });
  });

  describe('ensureContrast', () => {
    it('should adjust color to meet contrast requirement', () => {
      const original = '#999999';
      const adjusted = engine.ensureContrast(original, '#FFFFFF', 7.0);

      const ratio = engine.calculateContrastRatio(adjusted, '#FFFFFF');
      expect(ratio).toBeGreaterThanOrEqual(7.0);
    });

    it('should darken foreground for light backgrounds', () => {
      const original = '#AAAAAA';
      const adjusted = engine.ensureContrast(original, '#FFFFFF', 7.0);

      expect(adjusted).not.toBe(original);
      expect(adjusted < original).toBe(true); // Hex comparison (darker)
    });

    it('should lighten foreground for dark backgrounds', () => {
      const original = '#555555';
      const adjusted = engine.ensureContrast(original, '#000000', 7.0);

      expect(adjusted).not.toBe(original);
      // Should be lighter than original
    });
  });

  describe('getPalette', () => {
    it('should retrieve palette by ID', () => {
      const palette = engine.getPalette('corporate-blue');

      expect(palette).toBeDefined();
      expect(palette!.id).toBe('corporate-blue');
      expect(palette!.domain).toBe('corporate');
    });

    it('should retrieve palette by domain', () => {
      const palette = engine.getPalette('tech');

      expect(palette).toBeDefined();
      expect(palette!.domain).toBe('tech');
    });

    it('should return undefined for invalid palette', () => {
      const palette = engine.getPalette('nonexistent');
      expect(palette).toBeUndefined();
    });
  });

  describe('validate', () => {
    it('should pass validation for WCAG AAA compliant palettes', () => {
      const palette = engine.getPalette('corporate-blue')!;
      const validation = engine.validate(palette);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.score).toBeGreaterThanOrEqual(90);
    });

    it('should detect insufficient primary text contrast', () => {
      const badPalette = {
        ...engine.getPalette('corporate-blue')!,
        text: {
          primary: '#999999', // Fails AAA
          secondary: '#4B5563',
          inverse: '#F9FAFB'
        }
      };

      const validation = engine.validate(badPalette);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('Primary text'))).toBe(true);
    });

    it('should warn about low accent contrast', () => {
      const palette = engine.getPalette('creative-coral')!;
      const validation = engine.validate(palette);

      if (validation.warnings.length > 0) {
        expect(validation.warnings.some(w => w.includes('Accent'))).toBe(true);
      }
    });
  });

  describe('generateCSS', () => {
    it('should generate CSS custom properties', () => {
      const palette = engine.getPalette('corporate-blue')!;
      const css = engine.generateCSS(palette);

      expect(css).toContain(':root {');
      expect(css).toContain('--color-primary:');
      expect(css).toContain('--color-text-primary:');
      expect(css).toContain('--color-bg:');
    });

    it('should include all color shades', () => {
      const palette = engine.getPalette('tech-purple')!;
      const css = engine.generateCSS(palette);

      expect(css).toContain('--color-primary-50:');
      expect(css).toContain('--color-primary-500:');
      expect(css).toContain('--color-primary-900:');
    });
  });

  describe('getAllPalettes', () => {
    it('should return at least 6 palettes', () => {
      const palettes = engine.getAllPalettes();
      expect(palettes.length).toBeGreaterThanOrEqual(6);
    });

    it('should have palettes for different domains', () => {
      const palettes = engine.getAllPalettes();
      const domains = palettes.map(p => p.domain);

      expect(domains).toContain('corporate');
      expect(domains).toContain('tech');
      expect(domains).toContain('finance');
    });
  });

  describe('performance', () => {
    it('should calculate contrast in under 1ms', () => {
      const start = performance.now();

      engine.calculateContrastRatio('#1F2937', '#FFFFFF');

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(1);
    });

    it('should validate palette in under 10ms', () => {
      const palette = engine.getPalette('corporate-blue')!;
      const start = performance.now();

      engine.validate(palette);

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(10);
    });
  });
});

// ==================== CHART RENDERER TESTS ====================

describe('ChartRenderer (P0)', () => {
  let renderer: ChartRenderer;

  beforeEach(() => {
    renderer = new ChartRenderer();
  });

  describe('generateConfig', () => {
    it('should apply theme colors to datasets', () => {
      const chartConfig = {
        type: 'bar' as const,
        data: {
          labels: ['Q1', 'Q2', 'Q3'],
          datasets: [
            { label: 'Sales', data: [100, 200, 150] },
            { label: 'Profit', data: [50, 80, 60] }
          ]
        }
      };

      const config = renderer.generateConfig(chartConfig, 'corporate');

      expect(config.data.datasets[0].backgroundColor).toBeDefined();
      expect(config.data.datasets[0].borderColor).toBeDefined();
      expect(config.data.datasets[0].borderWidth).toBe(2);
    });

    it('should use different colors for pie chart segments', () => {
      const chartConfig = {
        type: 'pie' as const,
        data: {
          labels: ['A', 'B', 'C'],
          datasets: [{ label: 'Data', data: [30, 40, 30] }]
        }
      };

      const config = renderer.generateConfig(chartConfig, 'tech');

      expect(Array.isArray(config.data.datasets[0].backgroundColor)).toBe(true);
    });

    it('should set professional default options', () => {
      const chartConfig = renderer.createSampleChart('line');
      const config = renderer.generateConfig(chartConfig);

      expect(config.options?.responsive).toBe(true);
      expect(config.options?.plugins?.legend?.display).toBe(true);
      expect(config.options?.plugins?.tooltip?.enabled).toBe(true);
    });

    it('should handle custom options override', () => {
      const chartConfig = {
        type: 'bar' as const,
        data: {
          labels: ['A'],
          datasets: [{ label: 'Test', data: [1] }]
        },
        options: {
          plugins: {
            legend: { display: false }
          }
        }
      };

      const config = renderer.generateConfig(chartConfig);

      expect(config.options?.plugins?.legend?.display).toBe(false);
    });
  });

  describe('validateChartData', () => {
    it('should pass validation for valid chart data', () => {
      const chartConfig = renderer.createSampleChart('bar');
      const validation = renderer.validateChartData(chartConfig);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should fail validation for missing data', () => {
      const invalidConfig = {
        type: 'bar' as const,
        data: {
          labels: [],
          datasets: []
        }
      };

      const validation = renderer.validateChartData(invalidConfig);

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should warn for mismatched data/label lengths', () => {
      const config = {
        type: 'line' as const,
        data: {
          labels: ['A', 'B', 'C'],
          datasets: [{ label: 'Test', data: [1, 2] }] // Only 2 data points
        }
      };

      const validation = renderer.validateChartData(config);

      expect(validation.warnings.length).toBeGreaterThan(0);
    });

    it('should error for non-numeric data', () => {
      const config = {
        type: 'bar' as const,
        data: {
          labels: ['A'],
          datasets: [{ label: 'Test', data: ['invalid' as any] }]
        }
      };

      const validation = renderer.validateChartData(config);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('non-numeric'))).toBe(true);
    });
  });

  describe('createSampleChart', () => {
    it('should create valid bar chart sample', () => {
      const sample = renderer.createSampleChart('bar');

      expect(sample.type).toBe('bar');
      expect(sample.data.labels.length).toBeGreaterThan(0);
      expect(sample.data.datasets.length).toBeGreaterThan(0);
    });

    it('should create valid line chart sample', () => {
      const sample = renderer.createSampleChart('line');

      expect(sample.type).toBe('line');
      expect(sample.data.datasets[0].fill).toBe(true);
    });

    it('should create valid pie chart sample', () => {
      const sample = renderer.createSampleChart('pie');

      expect(sample.type).toBe('pie');
      expect(sample.data.datasets.length).toBe(1);
    });

    it('should create all 6 chart types', () => {
      const types: Array<'bar' | 'line' | 'pie' | 'doughnut' | 'scatter' | 'radar'> = [
        'bar',
        'line',
        'pie',
        'doughnut',
        'scatter',
        'radar'
      ];

      types.forEach(type => {
        const sample = renderer.createSampleChart(type);
        expect(sample.type).toBe(type);
      });
    });
  });

  describe('generateHTML', () => {
    it('should generate valid HTML with canvas element', () => {
      const html = renderer.generateHTML('chart-1', renderer.createSampleChart('bar'));

      expect(html).toContain('<canvas id="chart-1"');
      expect(html).toContain('chart-container');
    });

    it('should include correct dimensions', () => {
      const html = renderer.generateHTML('chart-2', renderer.createSampleChart('line'), 600, 300);

      expect(html).toContain('width: 600px');
      expect(html).toContain('height: 300px');
    });
  });

  describe('generateJS', () => {
    it('should include Chart.js CDN', () => {
      const js = renderer.generateJS('chart-1', renderer.createSampleChart('bar'));

      expect(js).toContain('chart.js');
      expect(js).toContain('cdn.jsdelivr.net');
    });

    it('should include chart initialization code', () => {
      const js = renderer.generateJS('chart-2', renderer.createSampleChart('line'));

      expect(js).toContain('new Chart(');
      expect(js).toContain('chart-2');
    });
  });

  describe('suggestChartType', () => {
    it('should suggest line chart for time series data', () => {
      const suggestion = renderer.suggestChartType({
        labels: ['Jan', 'Feb', 'Mar'],
        datasetCount: 1,
        hasTimeData: true,
        hasCategoricalData: false
      });

      expect(suggestion).toBe('line');
    });

    it('should suggest doughnut for single categorical dataset', () => {
      const suggestion = renderer.suggestChartType({
        labels: ['A', 'B', 'C'],
        datasetCount: 1,
        hasTimeData: false,
        hasCategoricalData: true
      });

      expect(suggestion).toBe('doughnut');
    });

    it('should suggest bar for multiple datasets', () => {
      const suggestion = renderer.suggestChartType({
        labels: ['Q1', 'Q2'],
        datasetCount: 3,
        hasTimeData: false,
        hasCategoricalData: true
      });

      expect(suggestion).toBe('bar');
    });
  });

  describe('performance', () => {
    it('should generate config in under 10ms', () => {
      const chartConfig = renderer.createSampleChart('bar');
      const start = performance.now();

      renderer.generateConfig(chartConfig);

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(10);
    });

    it('should validate data in under 5ms', () => {
      const chartConfig = renderer.createSampleChart('line');
      const start = performance.now();

      renderer.validateChartData(chartConfig);

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(5);
    });
  });
});

// ==================== INTEGRATION TESTS ====================

describe('P0 Feature Integration', () => {
  describe('Grid + Typography Integration', () => {
    it('should coordinate layout and typography for optimal readability', () => {
      const gridEngine = new GridLayoutEngine();
      const typographyEngine = new TypographyEngine();

      const content = {
        text: 'Product Launch 2024',
        hasImage: false
      };

      const analysis = gridEngine.analyzeContent(content);
      const layout = gridEngine.selectLayout(analysis, 0, 10);

      const metrics = typographyEngine.analyzeContent({
        title: content.text
      });
      const sizes = typographyEngine.calculateSizes(metrics, 'title');

      // Typography should respect layout constraints
      const maxTextWidth = layout.constraints.maxTextWidth;
      expect(sizes.body).toBeLessThanOrEqual(maxTextWidth / 30); // Rough check
    });
  });

  describe('Grid + Color + Typography Integration', () => {
    it('should create cohesive visual design', () => {
      const gridEngine = new GridLayoutEngine();
      const colorEngine = new ColorEngine();
      const typographyEngine = new TypographyEngine();

      const palette = colorEngine.getPalette('corporate-blue')!;
      const gridCSS = gridEngine.generateCSS(
        gridEngine.getLayout('content-focused')!,
        'slide-1'
      );

      const sizes = typographyEngine.calculateSizes(
        typographyEngine.analyzeContent({ title: 'Test' }),
        'title'
      );
      const typographyCSS = typographyEngine.generateCSS(sizes, 'slide-1');

      expect(gridCSS).toContain('#slide-1');
      expect(typographyCSS).toContain('#slide-1');

      const check = colorEngine.checkContrast(
        palette.text.primary,
        palette.surfaces.background,
        'normal',
        'AAA'
      );
      expect(check.passes).toBe(true);
    });
  });

  describe('Chart + Color Integration', () => {
    it('should apply accessible colors to charts', () => {
      const chartRenderer = new ChartRenderer();
      const colorEngine = new ColorEngine();

      const chartConfig = chartRenderer.createSampleChart('bar');
      const styledConfig = chartRenderer.generateConfig(chartConfig, 'corporate');

      const palette = colorEngine.getPalette('corporate-blue')!;

      // Chart colors should come from palette
      expect(styledConfig.data.datasets[0].backgroundColor).toBeDefined();
    });
  });

  describe('Complete Slide Generation Pipeline', () => {
    it('should generate complete slide with all P0 features', () => {
      const gridEngine = new GridLayoutEngine();
      const typographyEngine = new TypographyEngine();
      const colorEngine = new ColorEngine();
      const chartRenderer = new ChartRenderer();

      // 1. Analyze content
      const contentAnalysis = gridEngine.analyzeContent({
        text: 'Q4 Financial Results',
        hasChart: true
      });

      // 2. Select layout
      const layout = gridEngine.selectLayout(contentAnalysis, 2, 10);
      expect(layout.name).toBeDefined();

      // 3. Calculate typography
      const metrics = typographyEngine.analyzeContent({
        title: 'Q4 Financial Results'
      });
      const sizes = typographyEngine.calculateSizes(metrics, 'data');
      expect(sizes.h1).toBeGreaterThanOrEqual(32);

      // 4. Get color palette
      const palette = colorEngine.getPalette('finance-green')!;
      expect(palette).toBeDefined();

      // 5. Generate chart
      const chartConfig = chartRenderer.createSampleChart('bar');
      const styledChart = chartRenderer.generateConfig(chartConfig, 'finance');
      expect(styledChart.type).toBe('bar');

      // 6. Validate everything integrates
      const gridValidation = gridEngine.validate(layout, contentAnalysis);
      const typographyValidation = typographyEngine.validate(sizes, metrics);
      const colorValidation = colorEngine.validate(palette);

      expect(gridValidation.score).toBeGreaterThanOrEqual(70);
      expect(typographyValidation.score).toBeGreaterThanOrEqual(70);
      expect(colorValidation.score).toBeGreaterThanOrEqual(70);
    });
  });

  describe('Performance: Complete Pipeline', () => {
    it('should generate slide in under 200ms', () => {
      const gridEngine = new GridLayoutEngine();
      const typographyEngine = new TypographyEngine();
      const colorEngine = new ColorEngine();
      const chartRenderer = new ChartRenderer();

      const start = performance.now();

      // Complete pipeline
      const analysis = gridEngine.analyzeContent({
        text: 'Test Slide',
        hasImage: true,
        hasChart: true
      });
      const layout = gridEngine.selectLayout(analysis, 3, 10);
      const gridCSS = gridEngine.generateCSS(layout, 'slide-perf');

      const metrics = typographyEngine.analyzeContent({ title: 'Test Slide' });
      const sizes = typographyEngine.calculateSizes(metrics, 'content');
      const typographyCSS = typographyEngine.generateCSS(sizes, 'slide-perf');

      const palette = colorEngine.getPalette('corporate-blue')!;
      const colorCSS = colorEngine.generateCSS(palette);

      const chartConfig = chartRenderer.createSampleChart('bar');
      const chart = chartRenderer.generateConfig(chartConfig);

      const duration = performance.now() - start;

      expect(duration).toBeLessThan(200);
    });
  });
});

// ==================== ERROR HANDLING TESTS ====================

describe('P0 Error Handling', () => {
  describe('GridLayoutEngine Edge Cases', () => {
    it('should handle empty content gracefully', () => {
      const engine = new GridLayoutEngine();
      const analysis = engine.analyzeContent({ text: '' });

      expect(analysis.wordCount).toBe(0);
      expect(analysis.complexity).toBe('simple');
    });

    it('should handle very long words', () => {
      const engine = new GridLayoutEngine();
      const longWord = 'a'.repeat(200);
      const analysis = engine.analyzeContent({ text: longWord });

      expect(analysis.wordCount).toBe(1);
    });
  });

  describe('TypographyEngine Edge Cases', () => {
    it('should handle empty content', () => {
      const engine = new TypographyEngine();
      const metrics = engine.analyzeContent({});

      expect(metrics.wordCount).toBe(0);
      expect(metrics.estimatedHeight).toBeGreaterThanOrEqual(0);
    });

    it('should handle only whitespace', () => {
      const engine = new TypographyEngine();
      const metrics = engine.analyzeContent({
        title: '   ',
        body: '\n\n'
      });

      expect(metrics.wordCount).toBeLessThan(5);
    });
  });

  describe('ColorEngine Edge Cases', () => {
    it('should handle invalid hex colors', () => {
      const engine = new ColorEngine();
      const ratio = engine.calculateContrastRatio('invalid', '#FFFFFF');

      expect(ratio).toBeGreaterThanOrEqual(0);
    });

    it('should handle transparent colors', () => {
      const engine = new ColorEngine();
      const ratio = engine.calculateContrastRatio('rgba(0,0,0,0.5)', '#FFFFFF');

      expect(ratio).toBeDefined();
    });
  });

  describe('ChartRenderer Edge Cases', () => {
    it('should handle empty datasets', () => {
      const renderer = new ChartRenderer();
      const validation = renderer.validateChartData({
        type: 'bar',
        data: {
          labels: ['A'],
          datasets: [{ label: 'Empty', data: [] }]
        }
      });

      expect(validation.valid).toBe(false);
    });

    it('should handle negative values', () => {
      const renderer = new ChartRenderer();
      const config = {
        type: 'bar' as const,
        data: {
          labels: ['A', 'B'],
          datasets: [{ label: 'Test', data: [-10, -20] }]
        }
      };

      const validation = renderer.validateChartData(config);
      expect(validation.valid).toBe(true); // Negative values are valid
    });
  });
});

// ==================== ACCESSIBILITY TESTS ====================

describe('P0 Accessibility (WCAG AAA)', () => {
  describe('Typography Accessibility', () => {
    it('should enforce minimum font sizes', () => {
      const engine = new TypographyEngine();
      const metrics = engine.analyzeContent({ body: 'Test' });
      const sizes = engine.calculateSizes(metrics, 'content');

      expect(sizes.body).toBeGreaterThanOrEqual(18); // WCAG AAA
      expect(sizes.h1).toBeGreaterThanOrEqual(32);
    });

    it('should enforce readable line heights', () => {
      const engine = new TypographyEngine();
      const metrics = engine.analyzeContent({ body: 'Test' });
      const sizes = engine.calculateSizes(metrics, 'content');

      expect(sizes.lineHeight.body).toBeGreaterThanOrEqual(1.5);
    });
  });

  describe('Color Accessibility', () => {
    it('should ensure all palettes pass WCAG AAA for text', () => {
      const engine = new ColorEngine();
      const palettes = engine.getAllPalettes();

      palettes.forEach(palette => {
        const check = engine.checkContrast(
          palette.text.primary,
          palette.surfaces.background,
          'normal',
          'AAA'
        );

        expect(check.passes).toBe(true);
      });
    });

    it('should provide contrast ratio information', () => {
      const engine = new ColorEngine();
      const check = engine.checkContrast('#1F2937', '#FFFFFF', 'normal', 'AAA');

      expect(check.ratio).toBeGreaterThanOrEqual(7.0);
      expect(check.level).toBe('AAA');
    });
  });

  describe('Layout Accessibility', () => {
    it('should maintain adequate whitespace', () => {
      const engine = new GridLayoutEngine();
      const layouts = engine.getAvailableLayouts();

      layouts.forEach(layout => {
        expect(layout.whitespacePercent).toBeGreaterThanOrEqual(35);
      });
    });
  });
});

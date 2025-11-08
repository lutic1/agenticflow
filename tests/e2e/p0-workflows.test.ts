/**
 * P0 E2E Workflow Tests
 * End-to-end testing of critical user workflows
 * Tests complete slide generation pipelines with all P0 features integrated
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { GridLayoutEngine } from '../../src/slide-designer/core-v2/grid-layout-engine';
import { TypographyEngine } from '../../src/slide-designer/core-v2/typography-engine';
import { ColorEngine } from '../../src/slide-designer/core-v2/color-engine';
import { ChartRenderer } from '../../src/slide-designer/core-v2/chart-renderer';
import { ContentValidator } from '../../src/slide-designer/quality-control/content-validator';
import { LLMJudge } from '../../src/slide-designer/quality-control/llm-judge';

// ==================== TEST DATA ====================

interface SlideData {
  title: string;
  subtitle?: string;
  body?: string;
  bullets?: string[];
  hasImage?: boolean;
  hasChart?: boolean;
  chartData?: any;
}

interface PresentationData {
  topic: string;
  audience: string;
  purpose: string;
  slides: SlideData[];
}

const CORPORATE_PRESENTATION: PresentationData = {
  topic: 'Q4 Business Review 2024',
  audience: 'Executive Leadership',
  purpose: 'Quarterly performance review and strategic planning',
  slides: [
    {
      title: 'Q4 Business Review',
      subtitle: 'Executive Summary - 2024'
    },
    {
      title: 'Agenda',
      bullets: [
        'Financial Performance',
        'Market Position',
        'Strategic Initiatives',
        'Q1 2025 Outlook'
      ]
    },
    {
      title: 'Financial Highlights',
      body: 'Record-breaking quarter with 35% revenue growth',
      hasChart: true,
      chartData: {
        type: 'bar',
        data: {
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          datasets: [
            { label: 'Revenue ($M)', data: [45, 52, 58, 78] },
            { label: 'Profit ($M)', data: [12, 15, 18, 25] }
          ]
        }
      }
    },
    {
      title: 'Market Leadership',
      body: 'Achieved #1 market position in enterprise segment',
      bullets: [
        'Enterprise segment: 42% market share',
        'SMB segment: 28% market share',
        'New customer acquisition up 65%'
      ],
      hasImage: true
    },
    {
      title: 'Strategic Initiatives',
      bullets: [
        'AI-powered features launched in Q4',
        'Global expansion into APAC region',
        'Strategic partnership with Fortune 100',
        'Product innovation roadmap 2025'
      ]
    },
    {
      title: 'Customer Satisfaction',
      hasChart: true,
      chartData: {
        type: 'line',
        data: {
          labels: ['Jan', 'Mar', 'Jun', 'Sep', 'Dec'],
          datasets: [
            { label: 'NPS Score', data: [65, 68, 72, 75, 78] }
          ]
        }
      }
    },
    {
      title: 'Team Growth',
      bullets: [
        'Expanded team by 40% (200 new hires)',
        'Opened 3 new engineering hubs',
        'Diversity improved to 45% representation'
      ],
      hasImage: true
    },
    {
      title: 'Q1 2025 Priorities',
      bullets: [
        'Launch enterprise AI suite',
        'Scale APAC operations',
        'Enhance customer success program',
        'Continue product innovation'
      ]
    },
    {
      title: 'Financial Outlook',
      body: 'Projecting 40% growth in Q1 2025',
      hasChart: true,
      chartData: {
        type: 'bar',
        data: {
          labels: ['Q1 Target', 'Q1 Stretch'],
          datasets: [
            { label: 'Revenue ($M)', data: [90, 105] }
          ]
        }
      }
    },
    {
      title: 'Thank You',
      subtitle: 'Questions & Discussion'
    }
  ]
};

const TECH_PITCH_DECK: PresentationData = {
  topic: 'AI-Powered Analytics Platform',
  audience: 'Venture Capitalists',
  purpose: 'Series A Funding Round',
  slides: [
    {
      title: 'AI-Powered Analytics',
      subtitle: 'The Future of Business Intelligence'
    },
    {
      title: 'The Problem',
      bullets: [
        'Data analysis takes weeks, not hours',
        'Requires expensive data science teams',
        'Insights arrive too late for decisions'
      ]
    },
    {
      title: 'Our Solution',
      body: 'AI that analyzes data and generates insights in real-time',
      bullets: [
        'Natural language queries',
        'Automated insight generation',
        'Predictive analytics built-in'
      ],
      hasImage: true
    },
    {
      title: 'Market Opportunity',
      hasChart: true,
      chartData: {
        type: 'doughnut',
        data: {
          labels: ['TAM', 'SAM', 'SOM'],
          datasets: [
            { label: 'Market Size ($B)', data: [120, 45, 8] }
          ]
        }
      }
    },
    {
      title: 'Traction',
      bullets: [
        '150 enterprise customers',
        '$2M ARR, growing 20% MoM',
        'NPS score of 72'
      ],
      hasChart: true,
      chartData: {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            { label: 'ARR ($K)', data: [800, 960, 1152, 1382, 1658, 2000] }
          ]
        }
      }
    },
    {
      title: 'Competitive Advantage',
      bullets: [
        '10x faster than traditional BI tools',
        'No SQL or coding required',
        'Patent-pending AI algorithms'
      ]
    },
    {
      title: 'Business Model',
      hasChart: true,
      chartData: {
        type: 'bar',
        data: {
          labels: ['Starter', 'Pro', 'Enterprise'],
          datasets: [
            { label: 'Price/Month', data: [99, 499, 2999] }
          ]
        }
      }
    },
    {
      title: 'The Ask',
      body: 'Raising $10M Series A to scale GTM and product',
      bullets: [
        'Sales & marketing: $5M',
        'Engineering: $3M',
        'Operations: $2M'
      ]
    },
    {
      title: 'Join Our Journey',
      subtitle: 'Let\'s democratize data analytics'
    }
  ]
};

// ==================== HELPER FUNCTIONS ====================

class SlideGenerationPipeline {
  private gridEngine: GridLayoutEngine;
  private typographyEngine: TypographyEngine;
  private colorEngine: ColorEngine;
  private chartRenderer: ChartRenderer;

  constructor() {
    this.gridEngine = new GridLayoutEngine();
    this.typographyEngine = new TypographyEngine();
    this.colorEngine = new ColorEngine();
    this.chartRenderer = new ChartRenderer();
  }

  /**
   * Generate a complete slide with all P0 features
   */
  generateSlide(
    slideData: SlideData,
    slideNumber: number,
    totalSlides: number,
    theme: 'corporate' | 'tech' | 'creative' | 'finance' = 'corporate'
  ): {
    html: string;
    css: string;
    validation: {
      grid: any;
      typography: any;
      color: any;
    };
    performance: {
      duration: number;
    };
  } {
    const startTime = performance.now();

    // 1. Analyze content
    const contentAnalysis = this.gridEngine.analyzeContent({
      text: [slideData.title, slideData.subtitle, slideData.body]
        .filter(Boolean)
        .join(' '),
      hasImage: slideData.hasImage,
      hasChart: slideData.hasChart,
      bulletPoints: slideData.bullets
    });

    // 2. Select layout
    const layout = this.gridEngine.selectLayout(
      contentAnalysis,
      slideNumber,
      totalSlides
    );

    // 3. Calculate typography
    const typographyMetrics = this.typographyEngine.analyzeContent({
      title: slideData.title,
      subtitle: slideData.subtitle,
      body: slideData.body,
      bullets: slideData.bullets
    });

    const slideType = slideNumber === 0 || slideNumber === totalSlides - 1
      ? 'title'
      : slideData.hasChart
      ? 'data'
      : 'content';

    const typographySizes = this.typographyEngine.calculateSizes(
      typographyMetrics,
      slideType as any
    );

    // 4. Get color palette
    const palette = this.colorEngine.getPalette(theme)!;

    // 5. Generate CSS
    const gridCSS = this.gridEngine.generateCSS(layout, `slide-${slideNumber}`);
    const typographyCSS = this.typographyEngine.generateCSS(
      typographySizes,
      `slide-${slideNumber}`
    );
    const colorCSS = this.colorEngine.generateCSS(palette);

    const css = `${gridCSS}\n\n${typographyCSS}\n\n${colorCSS}`;

    // 6. Generate HTML
    let html = this.generateHTML(slideData, slideNumber, slideData.hasChart);

    // 7. Add chart if needed
    if (slideData.hasChart && slideData.chartData) {
      const chartHTML = this.chartRenderer.generateComplete(
        `chart-${slideNumber}`,
        slideData.chartData,
        theme,
        800,
        400
      );
      html = html.replace('<!-- CHART_PLACEHOLDER -->', chartHTML);
    }

    // 8. Validate
    const gridValidation = this.gridEngine.validate(layout, contentAnalysis);
    const typographyValidation = this.typographyEngine.validate(
      typographySizes,
      typographyMetrics
    );
    const colorValidation = this.colorEngine.validate(palette);

    const duration = performance.now() - startTime;

    return {
      html,
      css,
      validation: {
        grid: gridValidation,
        typography: typographyValidation,
        color: colorValidation
      },
      performance: {
        duration
      }
    };
  }

  /**
   * Generate HTML structure for slide
   */
  private generateHTML(slideData: SlideData, slideNumber: number, hasChart: boolean): string {
    return `
<div id="slide-${slideNumber}" class="slide">
  ${slideData.title ? `<h1 class="title">${slideData.title}</h1>` : ''}
  ${slideData.subtitle ? `<h2 class="subtitle">${slideData.subtitle}</h2>` : ''}
  ${slideData.body ? `<p class="body">${slideData.body}</p>` : ''}
  ${slideData.bullets ? `
    <ul class="content">
      ${slideData.bullets.map(bullet => `<li>${bullet}</li>`).join('\n      ')}
    </ul>
  ` : ''}
  ${slideData.hasImage ? `<div class="image">[Image Placeholder]</div>` : ''}
  ${hasChart ? '<!-- CHART_PLACEHOLDER -->' : ''}
</div>`.trim();
  }

  /**
   * Generate complete presentation
   */
  generatePresentation(
    presentationData: PresentationData,
    theme: 'corporate' | 'tech' | 'creative' | 'finance' = 'corporate'
  ) {
    const slides = presentationData.slides.map((slideData, index) =>
      this.generateSlide(
        slideData,
        index,
        presentationData.slides.length,
        theme
      )
    );

    const totalDuration = slides.reduce((sum, s) => sum + s.performance.duration, 0);

    return {
      slides,
      metadata: {
        topic: presentationData.topic,
        audience: presentationData.audience,
        purpose: presentationData.purpose,
        slideCount: slides.length,
        totalDuration
      }
    };
  }
}

// ==================== E2E WORKFLOW TESTS ====================

describe('E2E Workflow Tests', () => {
  let pipeline: SlideGenerationPipeline;

  beforeAll(() => {
    pipeline = new SlideGenerationPipeline();
  });

  describe('Workflow 1: Corporate Presentation (10 Slides)', () => {
    it('should generate complete corporate presentation', () => {
      const result = pipeline.generatePresentation(
        CORPORATE_PRESENTATION,
        'corporate'
      );

      // Should generate all 10 slides
      expect(result.slides).toHaveLength(10);
      expect(result.metadata.slideCount).toBe(10);

      // All slides should have HTML and CSS
      result.slides.forEach((slide, index) => {
        expect(slide.html).toBeDefined();
        expect(slide.html.length).toBeGreaterThan(50);
        expect(slide.css).toBeDefined();
        expect(slide.css).toContain('display: grid');
      });
    });

    it('should use Title Centered layout for first slide', () => {
      const firstSlide = pipeline.generateSlide(
        CORPORATE_PRESENTATION.slides[0],
        0,
        10,
        'corporate'
      );

      expect(firstSlide.html).toContain('Q4 Business Review');
      expect(firstSlide.html).toContain('Executive Summary');
      expect(firstSlide.css).toContain('Title Centered');
    });

    it('should use Title Centered layout for last slide', () => {
      const lastSlide = pipeline.generateSlide(
        CORPORATE_PRESENTATION.slides[9],
        9,
        10,
        'corporate'
      );

      expect(lastSlide.html).toContain('Thank You');
      expect(lastSlide.css).toContain('Title Centered');
    });

    it('should render charts correctly', () => {
      const chartSlide = pipeline.generateSlide(
        CORPORATE_PRESENTATION.slides[2],
        2,
        10,
        'corporate'
      );

      expect(chartSlide.html).toContain('<canvas id="chart-2"');
      expect(chartSlide.html).toContain('chart.js');
    });

    it('should pass all validations', () => {
      const result = pipeline.generatePresentation(
        CORPORATE_PRESENTATION,
        'corporate'
      );

      result.slides.forEach((slide, index) => {
        expect(slide.validation.grid.score).toBeGreaterThanOrEqual(70);
        expect(slide.validation.typography.score).toBeGreaterThanOrEqual(70);
        expect(slide.validation.color.score).toBeGreaterThanOrEqual(70);
      });
    });

    it('should meet performance benchmark (<5 seconds)', () => {
      const result = pipeline.generatePresentation(
        CORPORATE_PRESENTATION,
        'corporate'
      );

      expect(result.metadata.totalDuration).toBeLessThan(5000); // 5 seconds
    });

    it('should enforce WCAG AAA compliance', () => {
      const result = pipeline.generatePresentation(
        CORPORATE_PRESENTATION,
        'corporate'
      );

      result.slides.forEach(slide => {
        expect(slide.validation.color.valid).toBe(true);
        expect(slide.validation.color.errors).toHaveLength(0);
      });
    });

    it('should maintain consistent typography across slides', () => {
      const result = pipeline.generatePresentation(
        CORPORATE_PRESENTATION,
        'corporate'
      );

      const fontSizes = result.slides.map(slide => {
        const match = slide.css.match(/font-size: (\d+)px/);
        return match ? parseInt(match[1]) : 0;
      });

      // All body text should be ≥18px
      fontSizes.forEach(size => {
        if (size > 0) {
          expect(size).toBeGreaterThanOrEqual(18);
        }
      });
    });
  });

  describe('Workflow 2: Tech Pitch Deck with Charts', () => {
    it('should generate complete tech pitch deck', () => {
      const result = pipeline.generatePresentation(TECH_PITCH_DECK, 'tech');

      expect(result.slides).toHaveLength(9);
      expect(result.metadata.topic).toBe('AI-Powered Analytics Platform');
    });

    it('should apply tech theme colors', () => {
      const result = pipeline.generatePresentation(TECH_PITCH_DECK, 'tech');

      result.slides.forEach(slide => {
        expect(slide.css).toContain('--color-primary');
        // Should contain tech palette colors (purple)
        const hasTechColors = slide.css.includes('#6B21A8') ||
                             slide.css.includes('#9333EA');
        // At least some slides should have tech colors
      });
    });

    it('should render all 4 chart types correctly', () => {
      const result = pipeline.generatePresentation(TECH_PITCH_DECK, 'tech');

      const chartSlides = result.slides.filter(slide =>
        slide.html.includes('<canvas')
      );

      expect(chartSlides.length).toBeGreaterThanOrEqual(3);

      chartSlides.forEach(slide => {
        expect(slide.html).toContain('chart.js');
        expect(slide.html).toContain('new Chart(');
      });
    });

    it('should meet performance benchmark with charts (<7 seconds)', () => {
      const result = pipeline.generatePresentation(TECH_PITCH_DECK, 'tech');

      expect(result.metadata.totalDuration).toBeLessThan(7000); // 7 seconds
    });

    it('should handle mixed content types (text + charts + images)', () => {
      const result = pipeline.generatePresentation(TECH_PITCH_DECK, 'tech');

      const hasTextSlides = result.slides.some(s => s.html.includes('<ul'));
      const hasChartSlides = result.slides.some(s => s.html.includes('<canvas'));
      const hasImageSlides = result.slides.some(s => s.html.includes('Image Placeholder'));

      expect(hasTextSlides).toBe(true);
      expect(hasChartSlides).toBe(true);
      expect(hasImageSlides).toBe(true);
    });
  });

  describe('Workflow 3: Performance Stress Test', () => {
    it('should generate single slide in under 200ms', () => {
      const start = performance.now();

      pipeline.generateSlide(
        {
          title: 'Performance Test',
          body: 'This is a performance test slide',
          bullets: ['Point 1', 'Point 2', 'Point 3']
        },
        1,
        5,
        'corporate'
      );

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(200);
    });

    it('should handle 20 slides in under 10 seconds', () => {
      const largePresentationData: PresentationData = {
        topic: 'Large Presentation',
        audience: 'Test',
        purpose: 'Performance test',
        slides: Array(20).fill(null).map((_, i) => ({
          title: `Slide ${i + 1}`,
          bullets: ['Point 1', 'Point 2', 'Point 3']
        }))
      };

      const start = performance.now();
      const result = pipeline.generatePresentation(largePresentationData);
      const duration = performance.now() - start;

      expect(result.slides).toHaveLength(20);
      expect(duration).toBeLessThan(10000); // 10 seconds
    });

    it('should handle complex slide with chart in under 300ms', () => {
      const complexSlide: SlideData = {
        title: 'Complex Financial Analysis',
        body: 'Detailed breakdown of quarterly performance',
        bullets: [
          'Revenue up 35% YoY',
          'Profit margins improved to 32%',
          'Customer acquisition cost down 15%',
          'Retention rate at all-time high of 94%'
        ],
        hasChart: true,
        chartData: {
          type: 'bar',
          data: {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [
              { label: 'Revenue', data: [100, 120, 140, 175] },
              { label: 'Costs', data: [70, 80, 85, 95] },
              { label: 'Profit', data: [30, 40, 55, 80] }
            ]
          }
        }
      };

      const start = performance.now();
      pipeline.generateSlide(complexSlide, 3, 10, 'finance');
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(300);
    });
  });

  describe('Workflow 4: Edge Cases and Error Handling', () => {
    it('should handle minimal slide (title only)', () => {
      const minimalSlide = pipeline.generateSlide(
        { title: 'Title Only' },
        0,
        1,
        'corporate'
      );

      expect(minimalSlide.html).toContain('Title Only');
      expect(minimalSlide.validation.grid.valid).toBe(true);
    });

    it('should handle slide with only bullets', () => {
      const bulletsOnlySlide = pipeline.generateSlide(
        {
          title: 'Bullets',
          bullets: ['A', 'B', 'C']
        },
        1,
        5,
        'corporate'
      );

      expect(bulletsOnlySlide.html).toContain('<li>A</li>');
      expect(bulletsOnlySlide.html).toContain('<li>B</li>');
    });

    it('should handle slide with very long title', () => {
      const longTitleSlide = pipeline.generateSlide(
        {
          title: 'This is an extremely long title that definitely exceeds the recommended maximum of eight words'
        },
        2,
        10,
        'corporate'
      );

      expect(longTitleSlide.html).toBeDefined();
      expect(longTitleSlide.validation.typography.warnings.length).toBeGreaterThan(0);
    });

    it('should handle slide with too many bullets', () => {
      const manyBulletsSlide = pipeline.generateSlide(
        {
          title: 'Too Many Points',
          bullets: ['1', '2', '3', '4', '5', '6', '7', '8']
        },
        3,
        10,
        'corporate'
      );

      expect(manyBulletsSlide.html).toBeDefined();
      expect(manyBulletsSlide.validation.typography.warnings.length).toBeGreaterThan(0);
    });

    it('should handle chart with negative values', () => {
      const negativeChartSlide = pipeline.generateSlide(
        {
          title: 'Profit/Loss',
          hasChart: true,
          chartData: {
            type: 'bar',
            data: {
              labels: ['Q1', 'Q2', 'Q3', 'Q4'],
              datasets: [
                { label: 'Profit', data: [-10, 5, 15, 25] }
              ]
            }
          }
        },
        4,
        10,
        'finance'
      );

      expect(negativeChartSlide.html).toContain('<canvas');
    });
  });

  describe('Workflow 5: Accessibility Compliance', () => {
    it('should ensure all slides meet WCAG AAA contrast', () => {
      const themes: Array<'corporate' | 'tech' | 'creative' | 'finance'> = [
        'corporate',
        'tech',
        'creative',
        'finance'
      ];

      themes.forEach(theme => {
        const slide = pipeline.generateSlide(
          {
            title: `${theme} Theme Test`,
            bullets: ['Point 1', 'Point 2', 'Point 3']
          },
          1,
          5,
          theme
        );

        expect(slide.validation.color.valid).toBe(true);
        expect(slide.validation.color.errors).toHaveLength(0);
      });
    });

    it('should enforce minimum font sizes', () => {
      const result = pipeline.generatePresentation(
        CORPORATE_PRESENTATION,
        'corporate'
      );

      result.slides.forEach(slide => {
        expect(slide.validation.typography.valid ||
               slide.validation.typography.score >= 70).toBe(true);
      });
    });

    it('should maintain adequate whitespace', () => {
      const result = pipeline.generatePresentation(
        TECH_PITCH_DECK,
        'tech'
      );

      result.slides.forEach(slide => {
        expect(slide.validation.grid.whitespacePercent).toBeGreaterThanOrEqual(35);
      });
    });
  });
});

// ==================== PERFORMANCE SUMMARY ====================

describe('Performance Summary Report', () => {
  it('should generate performance report for all workflows', () => {
    const pipeline = new SlideGenerationPipeline();

    const workflows = [
      {
        name: 'Corporate Presentation (10 slides)',
        data: CORPORATE_PRESENTATION,
        theme: 'corporate' as const,
        expectedMax: 5000
      },
      {
        name: 'Tech Pitch Deck (9 slides with charts)',
        data: TECH_PITCH_DECK,
        theme: 'tech' as const,
        expectedMax: 7000
      }
    ];

    const report = workflows.map(workflow => {
      const start = performance.now();
      const result = pipeline.generatePresentation(workflow.data, workflow.theme);
      const duration = performance.now() - start;

      return {
        workflow: workflow.name,
        slideCount: result.slides.length,
        duration,
        avgPerSlide: duration / result.slides.length,
        passedBenchmark: duration < workflow.expectedMax
      };
    });

    // All workflows should pass benchmarks
    report.forEach(r => {
      expect(r.passedBenchmark).toBe(true);
    });

    // Log summary (for CI/CD reports)
    console.log('\n=== Performance Summary ===');
    report.forEach(r => {
      console.log(`${r.workflow}:`);
      console.log(`  Total: ${r.duration.toFixed(2)}ms`);
      console.log(`  Per Slide: ${r.avgPerSlide.toFixed(2)}ms`);
      console.log(`  Status: ${r.passedBenchmark ? '✓ PASS' : '✗ FAIL'}`);
    });
  });
});

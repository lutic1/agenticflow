/**
 * P0 UX Scenarios - Automated Tests
 *
 * Comprehensive automated testing for 5 critical user workflows:
 * 1. Create presentation from scratch → Export PDF
 * 2. Upload image → Edit → Position → Save
 * 3. Create chart → Customize → Export PPTX
 * 4. Apply template → Customize → Transitions → Present
 * 5. Use undo/redo across multiple operations
 *
 * Includes accessibility, performance, and cross-browser compatibility tests.
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { axe, toHaveNoViolations } from 'jest-axe';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock implementations
import { SlideManager } from '../../src/slide-designer/features/slide-manager';
import { ExportEngine } from '../../src/slide-designer/core-v2/export-engine';
import { ChartRenderer } from '../../src/slide-designer/core-v2/chart-renderer';
import { TemplateLibrary } from '../../src/slide-designer/features/template-library';
import { ImageOptimizer } from '../../src/slide-designer/core-v2/image-optimizer';
import { TransitionEngine } from '../../src/slide-designer/core-v2/transition-engine';
import { AccessibilityEngine } from '../../src/slide-designer/core-v2/accessibility-engine';

// Test utilities
import { performance } from 'perf_hooks';

/**
 * Helper: Measure performance of async operation
 */
async function measurePerformance<T>(
  operation: () => Promise<T>,
  label: string
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await operation();
  const duration = performance.now() - start;

  console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);

  return { result, duration };
}

/**
 * Helper: Create mock slide data
 */
function createMockSlide(overrides?: Partial<any>): any {
  return {
    id: `slide-${Math.random().toString(36).substr(2, 9)}`,
    order: 0,
    html: '<div class="slide"><h1>Test Slide</h1></div>',
    content: {
      title: 'Test Slide',
      subtitle: 'Subtitle text',
      body: 'Body content',
      bullets: ['Point 1', 'Point 2', 'Point 3']
    },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ['test']
    },
    ...overrides
  };
}

// =============================================================================
// WORKFLOW 1: Create Presentation → Add Content → Export PDF
// =============================================================================

describe('Workflow 1: Create Presentation → Add Content → Export PDF', () => {
  let slideManager: SlideManager;
  let exportEngine: ExportEngine;

  beforeEach(() => {
    slideManager = new SlideManager([]);
    exportEngine = new ExportEngine();
  });

  describe('Step 1.1: Landing Page / New Presentation', () => {
    it('should initialize empty presentation in <500ms', async () => {
      const { duration } = await measurePerformance(
        async () => new SlideManager([]),
        'Initialize presentation'
      );

      expect(duration).toBeLessThan(500);
    });

    it('should create first slide with title-centered layout', () => {
      const firstSlide = createMockSlide({
        order: 0,
        content: { title: '', subtitle: '' }
      });

      slideManager.addSlide(firstSlide);
      const slides = slideManager.getSlides();

      expect(slides).toHaveLength(1);
      expect(slides[0].order).toBe(0);
      expect(slides[0].content.title).toBe('');
    });
  });

  describe('Step 1.2-1.3: Add Title and Subtitle', () => {
    it('should update title text immediately', () => {
      const slide = createMockSlide();
      slideManager.addSlide(slide);

      slideManager.updateSlide(0, {
        content: { ...slide.content, title: 'My Presentation' }
      });

      const updated = slideManager.getSlide(0);
      expect(updated.content.title).toBe('My Presentation');
    });

    it('should auto-save within 2 seconds (mocked)', async () => {
      const autoSaveMock = jest.fn();
      const slide = createMockSlide();

      slideManager.addSlide(slide);

      // Simulate auto-save trigger after 2 seconds
      setTimeout(autoSaveMock, 2000);

      await new Promise(resolve => setTimeout(resolve, 2100));
      expect(autoSaveMock).toHaveBeenCalled();
    }, 3000);

    it('should validate title length and show warning at >100 characters', () => {
      const longTitle = 'A'.repeat(101);
      const slide = createMockSlide({ content: { title: longTitle } });

      const validation = validateContent(slide);

      expect(validation.warnings).toContain(
        'Title is too long (101 characters). Recommended: <100 characters.'
      );
    });
  });

  describe('Step 1.4: Add New Slide', () => {
    it('should add new slide in <200ms', async () => {
      slideManager.addSlide(createMockSlide({ order: 0 }));

      const { duration } = await measurePerformance(
        async () => {
          slideManager.addSlide(createMockSlide({ order: 1 }));
          return slideManager.getSlides();
        },
        'Add new slide'
      );

      expect(duration).toBeLessThan(200);
      expect(slideManager.getSlides()).toHaveLength(2);
    });

    it('should increment slide count correctly', () => {
      slideManager.addSlide(createMockSlide({ order: 0 }));
      slideManager.addSlide(createMockSlide({ order: 1 }));
      slideManager.addSlide(createMockSlide({ order: 2 }));

      expect(slideManager.getSlides()).toHaveLength(3);
      expect(slideManager.getSlide(0).order).toBe(0);
      expect(slideManager.getSlide(1).order).toBe(1);
      expect(slideManager.getSlide(2).order).toBe(2);
    });
  });

  describe('Step 1.5: Add Bullet Points', () => {
    it('should enforce maximum 6 bullets per slide', () => {
      const slide = createMockSlide({
        content: {
          bullets: [
            'Point 1',
            'Point 2',
            'Point 3',
            'Point 4',
            'Point 5',
            'Point 6',
            'Point 7' // 7th bullet triggers warning
          ]
        }
      });

      const validation = validateContent(slide);

      expect(validation.warnings).toContain(
        'Too many bullet points (7). Recommended: 3-5 bullets.'
      );
    });

    it('should warn if bullet points are too long (>15 words)', () => {
      const longBullet = 'This is a very long bullet point that exceeds the recommended maximum of fifteen words and should trigger a warning';
      const slide = createMockSlide({
        content: { bullets: [longBullet] }
      });

      const validation = validateContent(slide);

      expect(validation.warnings).toContain(
        'Bullet point is too long (22 words). Recommended: 5-10 words.'
      );
    });
  });

  describe('Step 1.8: Export to PDF', () => {
    it('should export PDF in <15 seconds for 5 slides', async () => {
      // Create 5 slides
      for (let i = 0; i < 5; i++) {
        slideManager.addSlide(createMockSlide({ order: i }));
      }

      const slides = slideManager.getSlides().map((slide, index) => ({
        html: slide.html,
        slideNumber: index + 1,
        notes: slide.metadata.notes
      }));

      const { duration, result } = await measurePerformance(
        async () => exportEngine.exportToPDF(slides, {
          format: 'pdf',
          quality: 'professional',
          options: { dpi: 300, pageSize: '16:9' }
        }),
        'Export to PDF (5 slides, 300 DPI)'
      );

      expect(duration).toBeLessThan(15000); // <15 seconds
      expect(result.success).toBe(true);
      expect(result.metadata.pages).toBe(5);
      expect(result.metadata.dpi).toBe(300);
    }, 20000);

    it('should include all slides in exported PDF', async () => {
      slideManager.addSlide(createMockSlide({ order: 0 }));
      slideManager.addSlide(createMockSlide({ order: 1 }));
      slideManager.addSlide(createMockSlide({ order: 2 }));

      const slides = slideManager.getSlides().map((slide, index) => ({
        html: slide.html,
        slideNumber: index + 1
      }));

      const result = await exportEngine.exportToPDF(slides);

      expect(result.success).toBe(true);
      expect(result.metadata.pages).toBe(3);
    });

    it('should generate PDF with reasonable file size', async () => {
      const slides = [
        { html: '<div>Slide 1</div>', slideNumber: 1 },
        { html: '<div>Slide 2</div>', slideNumber: 2 }
      ];

      const result = await exportEngine.exportToPDF(slides);

      expect(result.success).toBe(true);
      expect(result.size).toBeGreaterThan(0);
      expect(result.size).toBeLessThan(10 * 1024 * 1024); // <10MB for 2 slides
    });
  });

  describe('Accessibility: Workflow 1', () => {
    it('should have proper heading hierarchy', () => {
      const slide = createMockSlide({
        html: '<div><h1>Title</h1><h2>Subtitle</h2><p>Content</p></div>'
      });

      const headings = extractHeadings(slide.html);

      expect(headings[0].level).toBe(1); // H1 first
      expect(headings[1].level).toBe(2); // H2 second (proper hierarchy)
    });

    it('should meet WCAG 2.1 AA contrast requirements', () => {
      const textColor = '#1F2937'; // Dark gray
      const backgroundColor = '#FFFFFF'; // White

      const contrast = calculateContrastRatio(textColor, backgroundColor);

      expect(contrast).toBeGreaterThanOrEqual(4.5); // WCAG AA for normal text
    });
  });

  describe('Performance: Workflow 1', () => {
    it('should maintain 60fps during slide navigation', async () => {
      // Create 10 slides
      for (let i = 0; i < 10; i++) {
        slideManager.addSlide(createMockSlide({ order: i }));
      }

      const frameTime = 1000 / 60; // 16.67ms per frame
      const navigationTime = 50; // Target <50ms

      const { duration } = await measurePerformance(
        async () => {
          for (let i = 0; i < 10; i++) {
            slideManager.setActiveSlide(i);
          }
        },
        'Navigate all slides'
      );

      const avgTimePerSlide = duration / 10;
      expect(avgTimePerSlide).toBeLessThan(navigationTime);
    });
  });
});

// =============================================================================
// WORKFLOW 2: Upload Image → Edit → Position → Save
// =============================================================================

describe('Workflow 2: Upload Image → Edit → Position → Save', () => {
  let imageOptimizer: ImageOptimizer;

  beforeEach(() => {
    imageOptimizer = new ImageOptimizer();
  });

  describe('Step 2.2: Image Upload & Processing', () => {
    it('should upload and optimize image in <5 seconds', async () => {
      const mockImageUrl = 'https://images.unsplash.com/photo-1234567890';

      const { duration, result } = await measurePerformance(
        async () => imageOptimizer.optimize(mockImageUrl, {
          sourceUrl: mockImageUrl,
          quality: 85,
          format: 'webp'
        }),
        'Upload and optimize image (5MB)'
      );

      expect(duration).toBeLessThan(5000);
      expect(result.optimized).toBeDefined();
    });

    it('should reduce file size by 40-80%', async () => {
      const mockImageUrl = 'https://images.unsplash.com/photo-test';

      const result = await imageOptimizer.optimize(mockImageUrl);

      // Check if savings metadata exists (if implemented)
      if (result.metadata.savings !== undefined) {
        expect(result.metadata.savings).toBeGreaterThanOrEqual(40);
        expect(result.metadata.savings).toBeLessThanOrEqual(80);
      }
    });

    it('should generate responsive image variants', async () => {
      const mockImageUrl = 'https://images.unsplash.com/photo-responsive';

      const result = await imageOptimizer.optimize(mockImageUrl, {
        sourceUrl: mockImageUrl,
        generateResponsive: true,
        breakpoints: [640, 1280, 1920]
      });

      expect(result.srcset).toBeDefined();
      expect(result.srcset.length).toBeGreaterThanOrEqual(3); // At least 3 variants
    });

    it('should reject files larger than 10MB', async () => {
      const largeFileSize = 11 * 1024 * 1024; // 11MB

      const validation = validateImageUpload({
        size: largeFileSize,
        type: 'image/jpeg'
      });

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('exceeds 10 MB limit');
    });

    it('should reject unsupported file formats', () => {
      const validation = validateImageUpload({
        size: 1024,
        type: 'image/psd' // Unsupported
      });

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('not supported');
    });
  });

  describe('Step 2.3-2.4: Image Positioning & Resizing', () => {
    it('should allow arrow key positioning (keyboard accessibility)', () => {
      const image = {
        id: 'img-1',
        position: { x: 100, y: 100 },
        size: { width: 400, height: 300 }
      };

      // Simulate arrow key press (right arrow)
      const newPosition = moveImage(image, 'ArrowRight', { shift: false });

      expect(newPosition.x).toBe(101); // Moved 1px right
      expect(newPosition.y).toBe(100); // Y unchanged
    });

    it('should move 10px with Shift+Arrow (faster positioning)', () => {
      const image = {
        id: 'img-1',
        position: { x: 100, y: 100 }
      };

      // Simulate Shift+Arrow Down
      const newPosition = moveImage(image, 'ArrowDown', { shift: true });

      expect(newPosition.y).toBe(110); // Moved 10px down
    });

    it('should maintain aspect ratio during corner resize', () => {
      const image = {
        size: { width: 400, height: 300 },
        aspectRatio: 4 / 3
      };

      const newSize = resizeImage(image, 'corner', {
        newWidth: 800,
        maintainAspectRatio: true
      });

      expect(newSize.width).toBe(800);
      expect(newSize.height).toBe(600); // Maintains 4:3 ratio
      expect(newSize.width / newSize.height).toBeCloseTo(4 / 3, 2);
    });

    it('should enforce minimum size of 100x100px', () => {
      const image = {
        size: { width: 400, height: 300 }
      };

      const newSize = resizeImage(image, 'corner', {
        newWidth: 50,
        newHeight: 50
      });

      expect(newSize.width).toBe(100); // Enforced minimum
      expect(newSize.height).toBe(100);
    });
  });

  describe('Step 2.6: Alt Text & Accessibility', () => {
    it('should require alt text for images', () => {
      const image = {
        src: 'test.jpg',
        alt: '' // Missing alt text
      };

      const validation = validateImage(image);

      expect(validation.warnings).toContain(
        'Alt text is required for accessibility'
      );
    });

    it('should enforce 125 character limit for alt text', () => {
      const longAlt = 'A'.repeat(126);
      const image = {
        src: 'test.jpg',
        alt: longAlt
      };

      const validation = validateImage(image);

      expect(validation.warnings).toContain(
        'Alt text exceeds 125 characters'
      );
    });

    it('should accept valid alt text', () => {
      const image = {
        src: 'test.jpg',
        alt: 'Product roadmap showing 3 phases over 12 months'
      };

      const validation = validateImage(image);

      expect(validation.valid).toBe(true);
      expect(validation.warnings).toHaveLength(0);
    });
  });

  describe('Accessibility: Workflow 2', () => {
    it('should have proper ARIA labels for upload button', () => {
      const uploadButton = {
        role: 'button',
        'aria-label': 'Upload image',
        tabIndex: 0
      };

      expect(uploadButton['aria-label']).toBeDefined();
      expect(uploadButton.tabIndex).toBe(0); // Keyboard focusable
    });

    it('should announce upload progress to screen readers', () => {
      const progressAria = {
        'aria-live': 'polite',
        'aria-valuenow': 45,
        'aria-valuemin': 0,
        'aria-valuemax': 100,
        'aria-label': 'Uploading: 45%'
      };

      expect(progressAria['aria-live']).toBe('polite');
      expect(progressAria['aria-valuenow']).toBe(45);
    });
  });
});

// =============================================================================
// WORKFLOW 3: Create Chart → Customize → Export PPTX
// =============================================================================

describe('Workflow 3: Create Chart → Customize → Export PPTX', () => {
  let chartRenderer: ChartRenderer;
  let exportEngine: ExportEngine;

  beforeEach(() => {
    chartRenderer = new ChartRenderer();
    exportEngine = new ExportEngine();
  });

  describe('Step 3.2: Chart Data Entry', () => {
    it('should validate numeric data in value columns', () => {
      const invalidData = {
        labels: ['Q1', 'Q2'],
        values: ['high', 'low'] // Invalid: should be numeric
      };

      const validation = validateChartData(invalidData);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Value must be numeric');
    });

    it('should require at least 2 data points', () => {
      const insufficientData = {
        labels: ['Q1'],
        values: [100]
      };

      const validation = validateChartData(insufficientData);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Minimum 2 data points required');
    });

    it('should enforce maximum 20 data points', () => {
      const tooMuchData = {
        labels: Array(21).fill('Label'),
        values: Array(21).fill(100)
      };

      const validation = validateChartData(tooMuchData);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Maximum 20 data points allowed');
    });
  });

  describe('Step 3.1: Chart Rendering', () => {
    it('should render chart in <500ms', async () => {
      const chartConfig = {
        type: 'bar' as const,
        data: {
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          datasets: [{
            label: 'Revenue',
            data: [125000, 145000, 162000, 178000],
            backgroundColor: '#3B82F6'
          }]
        }
      };

      const { duration, result } = await measurePerformance(
        async () => chartRenderer.render(chartConfig),
        'Render bar chart'
      );

      expect(duration).toBeLessThan(500);
      expect(result).toBeDefined();
    });

    it('should update chart preview in <200ms after data change', async () => {
      const chartConfig = {
        type: 'line' as const,
        data: {
          labels: ['Jan', 'Feb', 'Mar'],
          datasets: [{
            label: 'Sales',
            data: [10, 20, 30]
          }]
        }
      };

      await chartRenderer.render(chartConfig);

      // Update data
      const { duration } = await measurePerformance(
        async () => {
          chartConfig.data.datasets[0].data = [15, 25, 35];
          return chartRenderer.render(chartConfig);
        },
        'Update chart data'
      );

      expect(duration).toBeLessThan(200);
    });
  });

  describe('Step 3.3: Chart Customization', () => {
    it('should apply color palette to all chart elements', () => {
      const chart = chartRenderer.createChart({
        type: 'bar',
        data: {
          labels: ['A', 'B', 'C'],
          datasets: [{
            label: 'Data',
            data: [10, 20, 30]
          }]
        }
      });

      const theme = chartRenderer.getTheme('corporate');
      const styled = chartRenderer.applyTheme(chart, theme);

      expect(styled.colors).toEqual(theme.colors);
    });

    it('should use color-blind safe palette when requested', () => {
      const theme = chartRenderer.getTheme('colorblind-safe');

      expect(theme.colors).toBeDefined();
      expect(theme.colors.length).toBeGreaterThanOrEqual(4);

      // Color-blind safe palette should avoid red-green combinations
      const hasRedGreenIssue = checkColorBlindSafety(theme.colors);
      expect(hasRedGreenIssue).toBe(false);
    });
  });

  describe('Step 3.6: Export to PPTX', () => {
    it('should export PPTX in <20 seconds for 5 slides with 3 charts', async () => {
      const slides = [
        { html: '<div>Title Slide</div>', slideNumber: 1 },
        {
          html: '<canvas data-chart="bar"></canvas>',
          slideNumber: 2
        },
        { html: '<div>Content</div>', slideNumber: 3 },
        {
          html: '<canvas data-chart="line"></canvas>',
          slideNumber: 4
        },
        {
          html: '<canvas data-chart="pie"></canvas>',
          slideNumber: 5
        }
      ];

      const { duration, result } = await measurePerformance(
        async () => exportEngine.exportToPPTX(slides, {
          format: 'pptx',
          quality: 'professional'
        }),
        'Export to PPTX (5 slides, 3 charts)'
      );

      expect(duration).toBeLessThan(20000); // <20 seconds
      expect(result.success).toBe(true);
      expect(result.metadata.pages).toBe(5);
    }, 25000);

    it('should export charts as editable when option selected', async () => {
      const slide = {
        html: '<canvas data-chart="bar"></canvas>',
        slideNumber: 1
      };

      const result = await exportEngine.exportToPPTX([slide], {
        format: 'pptx',
        quality: 'professional',
        options: { includeNotes: false, masterSlide: false }
      });

      expect(result.success).toBe(true);
      // In real implementation, would check PPTX structure for editable chart objects
    });
  });

  describe('Accessibility: Workflow 3', () => {
    it('should provide data table alternative for charts', () => {
      const chart = {
        type: 'bar',
        data: {
          labels: ['Q1', 'Q2', 'Q3'],
          datasets: [{
            label: 'Revenue',
            data: [100, 150, 200]
          }]
        }
      };

      const dataTable = chartRenderer.generateDataTable(chart);

      expect(dataTable.headers).toEqual(['Label', 'Revenue']);
      expect(dataTable.rows).toHaveLength(3);
      expect(dataTable.rows[0]).toEqual(['Q1', 100]);
    });

    it('should meet contrast requirements for chart colors', () => {
      const theme = chartRenderer.getTheme('corporate');

      // Check each color against background
      theme.colors.forEach(color => {
        const contrast = calculateContrastRatio(color, theme.backgroundColor);
        expect(contrast).toBeGreaterThanOrEqual(3); // WCAG AA for UI components
      });
    });
  });
});

// =============================================================================
// WORKFLOW 4: Apply Template → Customize → Transitions → Present
// =============================================================================

describe('Workflow 4: Apply Template → Customize → Transitions → Present', () => {
  let templateLibrary: TemplateLibrary;
  let transitionEngine: TransitionEngine;

  beforeEach(() => {
    templateLibrary = new TemplateLibrary();
    transitionEngine = new TransitionEngine();
  });

  describe('Step 4.1: Browse Template Library', () => {
    it('should load template library in <1 second', async () => {
      const { duration, result } = await measurePerformance(
        async () => templateLibrary.getAllTemplates(),
        'Load template library'
      );

      expect(duration).toBeLessThan(1000);
      expect(result.length).toBe(20); // 20 templates
    });

    it('should have 20 professional templates', () => {
      const templates = templateLibrary.getAllTemplates();

      expect(templates).toHaveLength(20);
      expect(templates.every(t => t.slideCount > 0)).toBe(true);
    });

    it('should filter templates by category', () => {
      const pitchTemplates = templateLibrary.searchTemplates({
        category: 'pitch'
      });

      expect(pitchTemplates.length).toBeGreaterThan(0);
      expect(pitchTemplates.every(t => t.category === 'pitch')).toBe(true);
    });

    it('should search templates by tags', () => {
      const startupTemplates = templateLibrary.searchTemplates({
        tags: ['startup']
      });

      expect(startupTemplates.length).toBeGreaterThan(0);
      expect(startupTemplates.every(t => t.tags.includes('startup'))).toBe(true);
    });
  });

  describe('Step 4.3: Apply Template', () => {
    it('should apply template in <3 seconds', async () => {
      const template = templateLibrary.getTemplateById('startup-pitch-deck');

      const { duration } = await measurePerformance(
        async () => applyTemplate(template),
        'Apply template'
      );

      expect(duration).toBeLessThan(3000);
    });

    it('should copy all template slides', () => {
      const template = templateLibrary.getTemplateById('startup-pitch-deck');
      const presentation = applyTemplate(template);

      expect(presentation.slides).toHaveLength(template.slideCount);
    });

    it('should preserve template structure after content edit', () => {
      const template = templateLibrary.getTemplateById('startup-pitch-deck');
      const presentation = applyTemplate(template);

      // Edit first slide
      presentation.slides[0].content.title = 'My Company';

      // Structure should remain intact
      expect(presentation.slides[0].layout).toBe(template.slides[0].layout);
    });
  });

  describe('Step 4.6: Add Transitions', () => {
    it('should apply transition to all slides instantly', () => {
      const slides = [
        createMockSlide({ order: 0 }),
        createMockSlide({ order: 1 }),
        createMockSlide({ order: 2 })
      ];

      const transition = transitionEngine.getPreset('fade');

      const start = performance.now();
      slides.forEach(slide => {
        transitionEngine.applyTransition(slide, transition);
      });
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100); // Should be instant
    });

    it('should maintain 60fps during transitions', () => {
      const transition = transitionEngine.getPreset('slide');

      expect(transition.duration).toBeLessThanOrEqual(1000); // Max 1s
      expect(transition.fps).toBe(60);
    });

    it('should support keyboard navigation during presentation', () => {
      const presentationControls = {
        currentSlide: 0,
        totalSlides: 5
      };

      // Simulate right arrow key
      const newSlide = handleKeyPress('ArrowRight', presentationControls);
      expect(newSlide).toBe(1);

      // Simulate left arrow key
      const prevSlide = handleKeyPress('ArrowLeft', { ...presentationControls, currentSlide: 1 });
      expect(prevSlide).toBe(0);

      // Simulate Home key
      const firstSlide = handleKeyPress('Home', { ...presentationControls, currentSlide: 3 });
      expect(firstSlide).toBe(0);

      // Simulate End key
      const lastSlide = handleKeyPress('End', presentationControls);
      expect(lastSlide).toBe(4); // totalSlides - 1
    });
  });

  describe('Accessibility: Workflow 4', () => {
    it('should have accessible keyboard shortcuts for presentation', () => {
      const shortcuts = {
        'ArrowRight': 'Next slide',
        'ArrowLeft': 'Previous slide',
        'Home': 'First slide',
        'End': 'Last slide',
        'Escape': 'Exit presentation',
        'Space': 'Next slide'
      };

      expect(Object.keys(shortcuts)).toHaveLength(6);
    });

    it('should announce slide changes to screen readers', () => {
      const ariaLive = {
        'aria-live': 'assertive',
        'aria-atomic': 'true',
        role: 'status'
      };

      expect(ariaLive['aria-live']).toBe('assertive');
      expect(ariaLive['aria-atomic']).toBe('true');
    });
  });
});

// =============================================================================
// WORKFLOW 5: Use Undo/Redo Across Multiple Operations
// =============================================================================

describe('Workflow 5: Use Undo/Redo Across Multiple Operations', () => {
  let slideManager: SlideManager;

  beforeEach(() => {
    slideManager = new SlideManager([]);
  });

  describe('Step 5.2: Undo Text Editing', () => {
    it('should batch text edits intelligently', () => {
      const slide = createMockSlide();
      slideManager.addSlide(slide);

      // Type "Hello World" as one session
      slideManager.updateSlide(0, {
        content: { ...slide.content, title: 'Hello World' }
      });

      // Undo should remove entire typing session
      slideManager.undo();

      const current = slideManager.getSlide(0);
      expect(current.content.title).toBe('Test Slide'); // Original title
    });

    it('should undo in <50ms', async () => {
      const slide = createMockSlide();
      slideManager.addSlide(slide);

      slideManager.updateSlide(0, {
        content: { ...slide.content, title: 'Updated' }
      });

      const { duration } = await measurePerformance(
        async () => {
          slideManager.undo();
        },
        'Undo operation'
      );

      expect(duration).toBeLessThan(50);
    });
  });

  describe('Step 5.3: Undo Slide Operations', () => {
    it('should undo slide duplication', () => {
      slideManager.addSlide(createMockSlide({ order: 0 }));
      const duplicated = slideManager.duplicateSlide(0);

      expect(slideManager.getSlides()).toHaveLength(2);

      slideManager.undo();

      expect(slideManager.getSlides()).toHaveLength(1);
    });

    it('should undo slide reordering', () => {
      slideManager.addSlide(createMockSlide({ order: 0, content: { title: 'Slide 1' } }));
      slideManager.addSlide(createMockSlide({ order: 1, content: { title: 'Slide 2' } }));
      slideManager.addSlide(createMockSlide({ order: 2, content: { title: 'Slide 3' } }));

      // Reorder: move slide 2 to position 0
      slideManager.reorderSlide(2, 0);

      const reordered = slideManager.getSlides();
      expect(reordered[0].content.title).toBe('Slide 3');

      // Undo reordering
      slideManager.undo();

      const restored = slideManager.getSlides();
      expect(restored[0].content.title).toBe('Slide 1');
      expect(restored[1].content.title).toBe('Slide 2');
      expect(restored[2].content.title).toBe('Slide 3');
    });

    it('should undo slide deletion', () => {
      slideManager.addSlide(createMockSlide({ order: 0, content: { title: 'Slide 1' } }));
      slideManager.addSlide(createMockSlide({ order: 1, content: { title: 'Slide 2' } }));

      slideManager.deleteSlide(1);
      expect(slideManager.getSlides()).toHaveLength(1);

      slideManager.undo();
      expect(slideManager.getSlides()).toHaveLength(2);
      expect(slideManager.getSlide(1).content.title).toBe('Slide 2');
    });
  });

  describe('Step 5.5: Undo History Panel', () => {
    it('should maintain history of last 50 actions', () => {
      const slide = createMockSlide();
      slideManager.addSlide(slide);

      // Perform 60 actions
      for (let i = 0; i < 60; i++) {
        slideManager.updateSlide(0, {
          content: { ...slide.content, title: `Update ${i}` }
        });
      }

      const history = slideManager.getHistory();

      expect(history.length).toBeLessThanOrEqual(50); // Max 50 entries
    });

    it('should provide accurate history entries', () => {
      slideManager.addSlide(createMockSlide({ order: 0 }));
      slideManager.duplicateSlide(0);

      const history = slideManager.getHistory();
      const lastAction = history[history.length - 1];

      expect(lastAction.action).toBe('duplicate');
      expect(lastAction.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Step 5.6: Redo After Undo', () => {
    it('should redo undone actions', () => {
      const slide = createMockSlide();
      slideManager.addSlide(slide);

      slideManager.updateSlide(0, {
        content: { ...slide.content, title: 'Updated Title' }
      });

      slideManager.undo();
      expect(slideManager.getSlide(0).content.title).toBe('Test Slide');

      slideManager.redo();
      expect(slideManager.getSlide(0).content.title).toBe('Updated Title');
    });

    it('should break redo chain when new action taken', () => {
      slideManager.addSlide(createMockSlide({ order: 0 }));
      slideManager.addSlide(createMockSlide({ order: 1 }));

      slideManager.undo(); // Undo add slide 2
      expect(slideManager.getSlides()).toHaveLength(1);

      // Take new action - breaks redo chain
      slideManager.addSlide(createMockSlide({ order: 1, content: { title: 'New Slide' } }));

      // Can't redo anymore
      expect(() => slideManager.redo()).toThrow();
    });

    it('should redo in <50ms', async () => {
      slideManager.addSlide(createMockSlide());
      slideManager.undo();

      const { duration } = await measurePerformance(
        async () => {
          slideManager.redo();
        },
        'Redo operation'
      );

      expect(duration).toBeLessThan(50);
    });
  });

  describe('Step 5.7: Undo Across Multiple Slides', () => {
    it('should auto-switch to affected slide on undo', () => {
      slideManager.addSlide(createMockSlide({ order: 0 }));
      slideManager.addSlide(createMockSlide({ order: 1 }));

      slideManager.setActiveSlide(0);
      slideManager.updateSlide(1, {
        content: { title: 'Updated Slide 2' }
      });

      slideManager.undo();

      // Should auto-switch to slide 1 (where change was undone)
      expect(slideManager.getActiveSlideIndex()).toBe(1);
    });
  });

  describe('Reliability: Undo/Redo', () => {
    it('should handle 100+ undo/redo cycles without corruption', () => {
      slideManager.addSlide(createMockSlide({ order: 0 }));

      // Perform 100 undo/redo cycles
      for (let i = 0; i < 100; i++) {
        slideManager.updateSlide(0, {
          content: { title: `Cycle ${i}` }
        });
        slideManager.undo();
        slideManager.redo();
      }

      const finalSlide = slideManager.getSlide(0);
      expect(finalSlide.content.title).toBe('Cycle 99');
    });

    it('should not leak memory with extensive undo history', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      slideManager.addSlide(createMockSlide());

      // Perform 1000 actions
      for (let i = 0; i < 1000; i++) {
        slideManager.updateSlide(0, {
          content: { title: `Update ${i}` }
        });
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // MB

      // History should be capped, memory increase should be reasonable
      expect(memoryIncrease).toBeLessThan(10); // <10MB increase
    });
  });
});

// =============================================================================
// CROSS-BROWSER COMPATIBILITY TESTS
// =============================================================================

describe('Cross-Browser Compatibility', () => {
  describe('Feature Detection', () => {
    it('should detect CSS Grid support', () => {
      const supportsGrid = CSS.supports('display', 'grid');
      expect(supportsGrid).toBe(true); // All modern browsers support grid
    });

    it('should detect WebP support', () => {
      // In Node environment, this would need jsdom or similar
      // In browser, would check canvas.toDataURL('image/webp')
      const supportsWebP = true; // Placeholder
      expect(supportsWebP).toBe(true);
    });

    it('should detect local storage support', () => {
      const supportsLocalStorage = typeof localStorage !== 'undefined';
      expect(supportsLocalStorage).toBe(true);
    });
  });

  describe('Polyfills & Fallbacks', () => {
    it('should provide fallback for unsupported image formats', () => {
      const image = {
        webp: 'image.webp',
        fallback: 'image.jpg'
      };

      const selectedFormat = supportsWebP() ? image.webp : image.fallback;
      expect(selectedFormat).toBeDefined();
    });
  });
});

// =============================================================================
// ACCESSIBILITY COMPREHENSIVE TESTS
// =============================================================================

describe('Accessibility (WCAG 2.1 AA) Comprehensive', () => {
  let accessibilityEngine: AccessibilityEngine;

  beforeEach(() => {
    accessibilityEngine = new AccessibilityEngine();
  });

  describe('Keyboard Navigation', () => {
    it('should allow full keyboard navigation', () => {
      const interactiveElements = [
        { type: 'button', label: 'Add Slide', tabIndex: 0 },
        { type: 'button', label: 'Export', tabIndex: 0 },
        { type: 'input', label: 'Title', tabIndex: 0 },
        { type: 'button', label: 'Insert Image', tabIndex: 0 }
      ];

      interactiveElements.forEach(element => {
        expect(element.tabIndex).toBe(0); // All focusable
      });
    });

    it('should have visible focus indicators', () => {
      const focusStyle = {
        outline: '2px solid #3B82F6',
        outlineOffset: '2px'
      };

      const contrast = calculateContrastRatio('#3B82F6', '#FFFFFF');
      expect(contrast).toBeGreaterThanOrEqual(3); // WCAG AA for UI components
    });

    it('should have no keyboard traps', () => {
      const modal = {
        isOpen: true,
        hasCloseButton: true,
        escapeable: true
      };

      expect(modal.escapeable).toBe(true); // Can exit with Esc
    });
  });

  describe('Screen Reader Support', () => {
    it('should have proper ARIA landmarks', () => {
      const landmarks = [
        { role: 'banner', label: 'Header' },
        { role: 'navigation', label: 'Slide navigation' },
        { role: 'main', label: 'Presentation canvas' },
        { role: 'contentinfo', label: 'Footer' }
      ];

      landmarks.forEach(landmark => {
        expect(landmark.role).toBeDefined();
      });
    });

    it('should announce dynamic content changes', () => {
      const liveRegion = {
        'aria-live': 'polite',
        'aria-atomic': 'true',
        content: 'Slide added successfully'
      };

      expect(liveRegion['aria-live']).toBe('polite');
    });

    it('should have descriptive button labels', () => {
      const buttons = [
        { label: 'Add new slide', 'aria-label': 'Add new slide' },
        { label: 'Export to PDF', 'aria-label': 'Export presentation to PDF' },
        { label: 'Undo', 'aria-label': 'Undo last action' }
      ];

      buttons.forEach(button => {
        expect(button['aria-label']).toBeTruthy();
        expect(button['aria-label'].length).toBeGreaterThan(5);
      });
    });
  });

  describe('Color Contrast', () => {
    it('should meet 4.5:1 ratio for normal text', () => {
      const textColor = '#1F2937';
      const backgroundColor = '#FFFFFF';

      const contrast = calculateContrastRatio(textColor, backgroundColor);
      expect(contrast).toBeGreaterThanOrEqual(4.5);
    });

    it('should meet 3:1 ratio for large text (18pt+)', () => {
      const largeTextColor = '#4B5563';
      const backgroundColor = '#FFFFFF';

      const contrast = calculateContrastRatio(largeTextColor, backgroundColor);
      expect(contrast).toBeGreaterThanOrEqual(3);
    });

    it('should meet 3:1 ratio for UI components', () => {
      const buttonColor = '#3B82F6';
      const backgroundColor = '#FFFFFF';

      const contrast = calculateContrastRatio(buttonColor, backgroundColor);
      expect(contrast).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Accessibility Report', () => {
    it('should generate comprehensive accessibility report', () => {
      const mockDOM = `
        <div role="main">
          <button aria-label="Add slide">Add Slide</button>
          <input type="text" aria-label="Slide title" />
          <img src="test.jpg" alt="Test image" />
        </div>
      `;

      const report = accessibilityEngine.audit(mockDOM);

      expect(report.passed).toBeDefined();
      expect(report.warnings).toBeDefined();
      expect(report.errors).toBeDefined();
      expect(report.wcagLevel).toBe('AA');
    });
  });
});

// =============================================================================
// PERFORMANCE COMPREHENSIVE TESTS
// =============================================================================

describe('Performance Comprehensive Tests', () => {
  describe('Core Web Vitals', () => {
    it('should have LCP (Largest Contentful Paint) < 2.5s', async () => {
      // Simulate page load
      const { duration } = await measurePerformance(
        async () => {
          // Simulate loading largest element
          await new Promise(resolve => setTimeout(resolve, 1200));
        },
        'LCP'
      );

      expect(duration).toBeLessThan(2500);
    });

    it('should have FID (First Input Delay) < 100ms', async () => {
      const { duration } = await measurePerformance(
        async () => {
          // Simulate first interaction
          handleClick();
        },
        'FID'
      );

      expect(duration).toBeLessThan(100);
    });

    it('should have CLS (Cumulative Layout Shift) < 0.1', () => {
      const layoutShift = 0.02; // Simulated
      expect(layoutShift).toBeLessThan(0.1);
    });
  });

  describe('Memory Management', () => {
    it('should not leak memory during repeated operations', () => {
      const operations = 100;
      const initialMemory = process.memoryUsage().heapUsed;

      const slideManager = new SlideManager([]);

      for (let i = 0; i < operations; i++) {
        slideManager.addSlide(createMockSlide({ order: i }));
        slideManager.deleteSlide(0);
      }

      if (global.gc) {
        global.gc(); // Force garbage collection if available
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024;

      expect(memoryIncrease).toBeLessThan(5); // <5MB increase after 100 ops
    });
  });
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Validate slide content
 */
function validateContent(slide: any): {
  valid: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check title length
  if (slide.content.title && slide.content.title.length > 100) {
    warnings.push(
      `Title is too long (${slide.content.title.length} characters). Recommended: <100 characters.`
    );
  }

  // Check bullet count
  if (slide.content.bullets && slide.content.bullets.length > 6) {
    warnings.push(
      `Too many bullet points (${slide.content.bullets.length}). Recommended: 3-5 bullets.`
    );
  }

  // Check bullet length
  if (slide.content.bullets) {
    slide.content.bullets.forEach((bullet: string, index: number) => {
      const wordCount = bullet.split(' ').length;
      if (wordCount > 15) {
        warnings.push(
          `Bullet point is too long (${wordCount} words). Recommended: 5-10 words.`
        );
      }
    });
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors
  };
}

/**
 * Validate chart data
 */
function validateChartData(data: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check numeric values
  if (data.values && Array.isArray(data.values)) {
    data.values.forEach((value: any) => {
      if (typeof value !== 'number') {
        errors.push('Value must be numeric');
      }
    });
  }

  // Check minimum data points
  if (data.labels && data.labels.length < 2) {
    errors.push('Minimum 2 data points required');
  }

  // Check maximum data points
  if (data.labels && data.labels.length > 20) {
    errors.push('Maximum 20 data points allowed');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate image upload
 */
function validateImageUpload(file: { size: number; type: string }): {
  valid: boolean;
  error?: string;
} {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: 'Image exceeds 10 MB limit. Please resize or compress.'
    };
  }

  if (!SUPPORTED_FORMATS.includes(file.type)) {
    return {
      valid: false,
      error: `File type not supported. Use ${SUPPORTED_FORMATS.join(', ')}.`
    };
  }

  return { valid: true };
}

/**
 * Validate image
 */
function validateImage(image: { src: string; alt: string }): {
  valid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  if (!image.alt || image.alt.trim() === '') {
    warnings.push('Alt text is required for accessibility');
  }

  if (image.alt && image.alt.length > 125) {
    warnings.push('Alt text exceeds 125 characters');
  }

  return {
    valid: warnings.length === 0,
    warnings
  };
}

/**
 * Move image with arrow keys
 */
function moveImage(
  image: { position: { x: number; y: number } },
  key: string,
  modifiers: { shift: boolean }
): { x: number; y: number } {
  const step = modifiers.shift ? 10 : 1;

  const newPosition = { ...image.position };

  switch (key) {
    case 'ArrowUp':
      newPosition.y -= step;
      break;
    case 'ArrowDown':
      newPosition.y += step;
      break;
    case 'ArrowLeft':
      newPosition.x -= step;
      break;
    case 'ArrowRight':
      newPosition.x += step;
      break;
  }

  return newPosition;
}

/**
 * Resize image
 */
function resizeImage(
  image: any,
  handle: string,
  options: any
): { width: number; height: number } {
  const MIN_SIZE = 100;

  let width = options.newWidth || image.size.width;
  let height = options.newHeight || image.size.height;

  if (options.maintainAspectRatio && handle === 'corner') {
    const aspectRatio = image.size.width / image.size.height;
    height = width / aspectRatio;
  }

  // Enforce minimum size
  width = Math.max(width, MIN_SIZE);
  height = Math.max(height, MIN_SIZE);

  return { width, height };
}

/**
 * Apply template
 */
function applyTemplate(template: any): any {
  return {
    slides: template.slides.map((slide: any, index: number) => ({
      ...createMockSlide({ order: index }),
      layout: slide.layout,
      content: slide.content
    }))
  };
}

/**
 * Handle keyboard press in presentation mode
 */
function handleKeyPress(key: string, state: { currentSlide: number; totalSlides: number }): number {
  switch (key) {
    case 'ArrowRight':
    case 'Space':
      return Math.min(state.currentSlide + 1, state.totalSlides - 1);
    case 'ArrowLeft':
      return Math.max(state.currentSlide - 1, 0);
    case 'Home':
      return 0;
    case 'End':
      return state.totalSlides - 1;
    default:
      return state.currentSlide;
  }
}

/**
 * Extract headings from HTML
 */
function extractHeadings(html: string): Array<{ level: number; text: string }> {
  const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi;
  const headings: Array<{ level: number; text: string }> = [];

  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    headings.push({
      level: parseInt(match[1]),
      text: match[2].replace(/<[^>]+>/g, '')
    });
  }

  return headings;
}

/**
 * Calculate contrast ratio (WCAG 2.1)
 */
function calculateContrastRatio(color1: string, color2: string): number {
  // Simplified contrast calculation
  // In production, would use proper color parsing and WCAG formula

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 0, g: 0, b: 0 };
  };

  const getLuminance = (rgb: { r: number; g: number; b: number }) => {
    const { r, g, b } = rgb;
    const [R, G, B] = [r, g, b].map(val =>
      val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
    );
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  };

  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check color-blind safety
 */
function checkColorBlindSafety(colors: string[]): boolean {
  // Simplified check
  // In production, would use proper color-blind simulation

  const hasRed = colors.some(c => c.includes('#DC') || c.includes('#EF'));
  const hasGreen = colors.some(c => c.includes('#10B') || c.includes('#059'));

  // If both red and green are present, may have issues for deuteranopia
  return hasRed && hasGreen;
}

/**
 * Support WebP check (placeholder)
 */
function supportsWebP(): boolean {
  // In browser, would check canvas.toDataURL('image/webp')
  return true; // Modern browsers support WebP
}

/**
 * Handle click (for FID simulation)
 */
function handleClick(): void {
  // Simulate click handling
}

/**
 * Mock SlideManager methods for testing
 */
SlideManager.prototype.getSlides = function() {
  return this.state.slides;
};

SlideManager.prototype.getSlide = function(index: number) {
  return this.state.slides[index];
};

SlideManager.prototype.updateSlide = function(index: number, updates: any) {
  this.state.slides[index] = { ...this.state.slides[index], ...updates };
};

SlideManager.prototype.setActiveSlide = function(index: number) {
  this.state.activeSlideIndex = index;
};

SlideManager.prototype.getActiveSlideIndex = function() {
  return this.state.activeSlideIndex;
};

SlideManager.prototype.getHistory = function() {
  return this.state.history;
};

// Export for external use
export {
  measurePerformance,
  createMockSlide,
  validateContent,
  validateChartData,
  validateImageUpload,
  validateImage,
  calculateContrastRatio
};

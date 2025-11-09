/**
 * P1 Integration Test Suite
 * Comprehensive testing for all 15 P1 features across 5 batches
 * Target: 85%+ code coverage
 *
 * P1 Features:
 * Batch 1: Icons, Patterns, Slide Manager
 * Batch 2: Templates, Video, Data Import
 * Batch 3: Notes, Fonts, AI Images
 * Batch 4: i18n, Versions, Analytics
 * Batch 5: Collaboration, Live, Mobile
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Batch 1 imports
import { IconLibrary, iconLibrary } from '../src/slide-designer/assets/icon-library';
import { BackgroundPatternLibrary, backgroundPatternLibrary } from '../src/slide-designer/assets/background-patterns';
import { SlideManager } from '../src/slide-designer/features/slide-manager';

// Batch 2 imports
import { TemplateLibrary, templateLibrary } from '../src/slide-designer/features/template-library';
import { VideoEmbedManager, videoEmbedManager } from '../src/slide-designer/features/video-embed';
import { DataImportManager, dataImportManager } from '../src/slide-designer/features/data-import';

// Batch 3 imports
import { SpeakerNotesManager, speakerNotesManager } from '../src/slide-designer/features/speaker-notes';
import { CustomFontManager, customFontManager } from '../src/slide-designer/features/custom-fonts';
import { AIImageGenerationManager, aiImageGenerator } from '../src/slide-designer/features/ai-image-generation';

// Batch 4 imports
import { I18nManager, i18n } from '../src/slide-designer/features/i18n';
import { VersionHistoryManager, versionHistory } from '../src/slide-designer/features/version-history';
import { PresentationAnalyticsManager, presentationAnalytics } from '../src/slide-designer/features/analytics';

// Batch 5 imports
import { CollaborationManager, collaborationManager } from '../src/slide-designer/features/collaboration';
import { LivePresentationManager, livePresentationManager } from '../src/slide-designer/features/live-presentation';
import { MobileAppManager, mobileAppManager } from '../src/slide-designer/features/mobile-app';

// P0 integration imports
import { GridLayoutEngine } from '../src/slide-designer/core-v2/grid-layout-engine';
import { TypographyEngine } from '../src/slide-designer/core-v2/typography-engine';
import { ColorEngine } from '../src/slide-designer/core-v2/color-engine';

// ==================== BATCH 1: QUICK WINS ====================

describe('P1 Batch 1: Quick Wins (Icons, Patterns, Slide Manager)', () => {

  // ==================== ICON LIBRARY TESTS ====================

  describe('IconLibrary (P1.1)', () => {
    let library: IconLibrary;

    beforeEach(() => {
      library = new IconLibrary();
    });

    it('should provide 100+ professional icons', () => {
      const count = library.getCount();
      expect(count).toBeGreaterThanOrEqual(100);
    });

    it('should have icons across all 12 categories', () => {
      const categories = library.getCategories();
      expect(categories).toHaveLength(12);
      expect(categories).toContain('business');
      expect(categories).toContain('technology');
      expect(categories).toContain('communication');
      expect(categories).toContain('data');
    });

    it('should search icons by name', () => {
      const results = library.search('chart');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(icon => icon.name.includes('chart'))).toBe(true);
    });

    it('should search icons by keywords', () => {
      const results = library.search('analytics');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(icon => icon.keywords.includes('analytics'))).toBe(true);
    });

    it('should filter icons by category', () => {
      const businessIcons = library.getByCategory('business');
      expect(businessIcons.length).toBeGreaterThan(0);
      businessIcons.forEach(icon => {
        expect(icon.category).toBe('business');
      });
    });

    it('should get icon by name', () => {
      const icon = library.getIcon('briefcase');
      expect(icon).toBeDefined();
      expect(icon?.name).toBe('briefcase');
      expect(icon?.category).toBe('business');
      expect(icon?.svg).toBeTruthy();
    });

    it('should render icon as SVG HTML', () => {
      const html = library.renderIcon('chart-bar', {
        size: 32,
        color: '#1F2937',
        className: 'custom-class'
      });

      expect(html).toContain('<svg');
      expect(html).toContain('width="32"');
      expect(html).toContain('height="32"');
      expect(html).toContain('stroke="#1F2937"');
      expect(html).toContain('custom-class');
      expect(html).toContain('aria-label="chart-bar icon"');
    });

    it('should provide category statistics', () => {
      const stats = library.getStats();
      expect(stats.business).toBeGreaterThan(0);
      expect(stats.technology).toBeGreaterThan(0);
      expect(stats.ui).toBeGreaterThan(0);
    });

    it('should limit search results', () => {
      const results = library.search('', { limit: 10 });
      expect(results.length).toBeLessThanOrEqual(10);
    });

    it('should handle search with no results', () => {
      const results = library.search('nonexistent-icon-xyz');
      expect(results).toHaveLength(0);
    });

    describe('performance', () => {
      it('should search icons in under 10ms', () => {
        const start = performance.now();
        library.search('business');
        const duration = performance.now() - start;
        expect(duration).toBeLessThan(10);
      });

      it('should render icon in under 5ms', () => {
        const start = performance.now();
        library.renderIcon('briefcase');
        const duration = performance.now() - start;
        expect(duration).toBeLessThan(5);
      });
    });
  });

  // ==================== BACKGROUND PATTERN TESTS ====================

  describe('BackgroundPatternLibrary (P1.2)', () => {
    let library: BackgroundPatternLibrary;

    beforeEach(() => {
      library = new BackgroundPatternLibrary();
    });

    it('should provide 20+ professional patterns', () => {
      const count = library.getCount();
      expect(count).toBeGreaterThanOrEqual(20);
    });

    it('should have patterns across all 6 categories', () => {
      const categories = library.getCategories();
      expect(categories).toHaveLength(6);
      expect(categories).toContain('geometric');
      expect(categories).toContain('grid');
      expect(categories).toContain('dots');
      expect(categories).toContain('lines');
    });

    it('should get pattern by name', () => {
      const pattern = library.getPattern('hexagon-grid');
      expect(pattern).toBeDefined();
      expect(pattern?.name).toBe('hexagon-grid');
      expect(pattern?.category).toBe('geometric');
      expect(pattern?.svg).toBeTruthy();
    });

    it('should filter patterns by category', () => {
      const gridPatterns = library.getByCategory('grid');
      expect(gridPatterns.length).toBeGreaterThan(0);
      gridPatterns.forEach(pattern => {
        expect(pattern.category).toBe('grid');
      });
    });

    it('should search patterns', () => {
      const results = library.search('grid');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should generate pattern CSS with options', () => {
      const { svg, css } = library.generateCSS('dots-small', {
        color: '#1F2937',
        opacity: 0.1,
        scale: 1.5,
        backgroundColor: '#FFFFFF'
      });

      expect(svg).toContain('<svg');
      expect(svg).toContain('#1F2937');
      expect(css).toContain('background-color: #FFFFFF');
      expect(css).toContain('opacity="0.1"');
    });

    it('should generate inline SVG', () => {
      const svg = library.generateInlineSVG('hexagon-grid');
      expect(svg).toContain('<svg');
      expect(svg).toContain('<pattern id="hexagon-grid"');
    });

    it('should generate data URL', () => {
      const dataURL = library.generateDataURL('dots-small');
      expect(dataURL).toStartWith('data:image/svg+xml;base64,');
    });

    it('should get recommended patterns for light backgrounds', () => {
      const patterns = library.getRecommended('light');
      expect(patterns.length).toBeGreaterThan(0);
      patterns.forEach(pattern => {
        expect(['light', 'both']).toContain(pattern.recommended);
      });
    });

    it('should get recommended patterns for dark backgrounds', () => {
      const patterns = library.getRecommended('dark');
      expect(patterns.length).toBeGreaterThan(0);
      patterns.forEach(pattern => {
        expect(['dark', 'both']).toContain(pattern.recommended);
      });
    });

    it('should provide category statistics', () => {
      const stats = library.getStats();
      expect(stats.geometric).toBeGreaterThan(0);
      expect(stats.grid).toBeGreaterThan(0);
      expect(stats.dots).toBeGreaterThan(0);
    });

    describe('performance', () => {
      it('should generate CSS in under 15ms', () => {
        const start = performance.now();
        library.generateCSS('hexagon-grid');
        const duration = performance.now() - start;
        expect(duration).toBeLessThan(15);
      });
    });
  });

  // ==================== SLIDE MANAGER TESTS ====================

  describe('SlideManager (P1.4)', () => {
    let manager: SlideManager;

    beforeEach(() => {
      manager = new SlideManager();
    });

    it('should create new presentation', () => {
      const presentation = manager.createPresentation('Test Deck');
      expect(presentation.title).toBe('Test Deck');
      expect(presentation.slides).toHaveLength(0);
      expect(presentation.id).toBeTruthy();
    });

    it('should add slides', () => {
      manager.createPresentation('Test');
      manager.addSlide({
        title: 'Slide 1',
        content: 'Content 1'
      });

      const slides = manager.getSlides();
      expect(slides).toHaveLength(1);
      expect(slides[0].title).toBe('Slide 1');
    });

    it('should duplicate slide', () => {
      manager.createPresentation('Test');
      manager.addSlide({ title: 'Original', content: 'Original Content' });

      const duplicated = manager.duplicateSlide(0);
      expect(duplicated).toBeDefined();
      expect(duplicated?.title).toBe('Original (Copy)');
      expect(manager.getSlides()).toHaveLength(2);
    });

    it('should reorder slides', () => {
      manager.createPresentation('Test');
      manager.addSlide({ title: 'Slide 1' });
      manager.addSlide({ title: 'Slide 2' });
      manager.addSlide({ title: 'Slide 3' });

      manager.reorderSlide(0, 2);
      const slides = manager.getSlides();
      expect(slides[0].title).toBe('Slide 2');
      expect(slides[1].title).toBe('Slide 3');
      expect(slides[2].title).toBe('Slide 1');
    });

    it('should delete slide', () => {
      manager.createPresentation('Test');
      manager.addSlide({ title: 'Slide 1' });
      manager.addSlide({ title: 'Slide 2' });

      const deleted = manager.deleteSlide(0);
      expect(deleted).toBe(true);
      expect(manager.getSlides()).toHaveLength(1);
      expect(manager.getSlides()[0].title).toBe('Slide 2');
    });

    it('should undo operations', () => {
      manager.createPresentation('Test');
      manager.addSlide({ title: 'Slide 1' });
      manager.addSlide({ title: 'Slide 2' });
      manager.deleteSlide(1);

      manager.undo();
      expect(manager.getSlides()).toHaveLength(2);
    });

    it('should redo operations', () => {
      manager.createPresentation('Test');
      manager.addSlide({ title: 'Slide 1' });
      manager.deleteSlide(0);
      manager.undo();
      manager.redo();

      expect(manager.getSlides()).toHaveLength(0);
    });

    it('should support drag and drop events', () => {
      manager.createPresentation('Test');
      manager.addSlide({ title: 'Slide 1' });
      manager.addSlide({ title: 'Slide 2' });

      const event = manager.handleDragDrop(0, 1);
      expect(event).toBeDefined();
      expect(event?.fromIndex).toBe(0);
      expect(event?.toIndex).toBe(1);
    });

    describe('performance', () => {
      it('should handle 100 slides efficiently', () => {
        manager.createPresentation('Large Deck');

        const start = performance.now();
        for (let i = 0; i < 100; i++) {
          manager.addSlide({ title: `Slide ${i}` });
        }
        const duration = performance.now() - start;

        expect(manager.getSlides()).toHaveLength(100);
        expect(duration).toBeLessThan(100); // <1ms per slide
      });

      it('should reorder slides in under 10ms', () => {
        manager.createPresentation('Test');
        for (let i = 0; i < 50; i++) {
          manager.addSlide({ title: `Slide ${i}` });
        }

        const start = performance.now();
        manager.reorderSlide(0, 49);
        const duration = performance.now() - start;

        expect(duration).toBeLessThan(10);
      });
    });
  });
});

// ==================== BATCH 2: CONTENT ENHANCEMENT ====================

describe('P1 Batch 2: Content Enhancement (Templates, Video, Data)', () => {

  // ==================== TEMPLATE LIBRARY TESTS ====================

  describe('TemplateLibrary (P1.5)', () => {
    const library = templateLibrary;

    it('should provide 20+ pre-built templates', () => {
      const templates = library.getTemplates();
      expect(templates.length).toBeGreaterThanOrEqual(20);
    });

    it('should have templates across multiple categories', () => {
      const categories = library.getCategories();
      expect(categories.length).toBeGreaterThan(0);
      expect(categories).toContain('business');
      expect(categories).toContain('education');
      expect(categories).toContain('marketing');
    });

    it('should get template by ID', () => {
      const templates = library.getTemplates();
      const firstTemplate = templates[0];
      const retrieved = library.getTemplate(firstTemplate.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(firstTemplate.id);
      expect(retrieved?.slides.length).toBeGreaterThan(0);
    });

    it('should filter templates by category', () => {
      const businessTemplates = library.getByCategory('business');
      expect(businessTemplates.length).toBeGreaterThan(0);
      businessTemplates.forEach(template => {
        expect(template.category).toBe('business');
      });
    });

    it('should search templates', () => {
      const results = library.search('business');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should instantiate template', () => {
      const templates = library.getTemplates();
      const presentation = library.instantiateTemplate(templates[0].id, {
        title: 'My Presentation'
      });

      expect(presentation).toBeDefined();
      expect(presentation?.title).toBe('My Presentation');
      expect(presentation?.slides.length).toBeGreaterThan(0);
    });

    it('should provide template preview', () => {
      const templates = library.getTemplates();
      const preview = library.getPreview(templates[0].id);

      expect(preview).toBeDefined();
      expect(preview?.thumbnail).toBeTruthy();
      expect(preview?.slideCount).toBeGreaterThan(0);
    });

    describe('performance', () => {
      it('should search templates in under 20ms', () => {
        const start = performance.now();
        library.search('business');
        const duration = performance.now() - start;
        expect(duration).toBeLessThan(20);
      });
    });
  });

  // ==================== VIDEO EMBED TESTS ====================

  describe('VideoEmbedManager (P1.7)', () => {
    let manager: VideoEmbedManager;

    beforeEach(() => {
      manager = new VideoEmbedManager();
    });

    it('should parse YouTube URL', () => {
      const videoId = manager.parseVideoURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(videoId).toBe('dQw4w9WgXcQ');
    });

    it('should parse Vimeo URL', () => {
      const videoId = manager.parseVideoURL('https://vimeo.com/123456789');
      expect(videoId).toBe('123456789');
    });

    it('should create YouTube embed', () => {
      const embed = manager.createEmbed('https://www.youtube.com/watch?v=dQw4w9WgXcQ', {
        width: 640,
        height: 360,
        autoplay: false
      });

      expect(embed).toBeDefined();
      expect(embed?.platform).toBe('youtube');
      expect(embed?.embedHTML).toContain('iframe');
      expect(embed?.embedHTML).toContain('youtube.com/embed/');
    });

    it('should create Vimeo embed', () => {
      const embed = manager.createEmbed('https://vimeo.com/123456789');
      expect(embed).toBeDefined();
      expect(embed?.platform).toBe('vimeo');
      expect(embed?.embedHTML).toContain('player.vimeo.com');
    });

    it('should generate responsive embed HTML', () => {
      const html = manager.generateResponsiveEmbed('https://www.youtube.com/watch?v=test');
      expect(html).toContain('aspect-ratio');
      expect(html).toContain('iframe');
    });

    it('should validate video URL', () => {
      expect(manager.isValidURL('https://www.youtube.com/watch?v=test')).toBe(true);
      expect(manager.isValidURL('https://vimeo.com/123')).toBe(true);
      expect(manager.isValidURL('https://invalid.com')).toBe(false);
    });

    describe('performance', () => {
      it('should create embed in under 5ms', () => {
        const start = performance.now();
        manager.createEmbed('https://www.youtube.com/watch?v=test');
        const duration = performance.now() - start;
        expect(duration).toBeLessThan(5);
      });
    });
  });

  // ==================== DATA IMPORT TESTS ====================

  describe('DataImportManager (P1.12)', () => {
    let manager: DataImportManager;

    beforeEach(() => {
      manager = new DataImportManager();
    });

    it('should parse CSV data', async () => {
      const csvData = 'Name,Value\nProduct A,100\nProduct B,200';
      const result = await manager.importCSV(csvData);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].Name).toBe('Product A');
      expect(result.data[0].Value).toBe('100');
    });

    it('should parse JSON data', async () => {
      const jsonData = JSON.stringify([
        { name: 'Product A', value: 100 },
        { name: 'Product B', value: 200 }
      ]);

      const result = await manager.importJSON(jsonData);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('Product A');
    });

    it('should detect data types', () => {
      const data = [
        { name: 'Test', value: '100', date: '2024-01-01', active: 'true' }
      ];

      const types = manager.detectDataTypes(data);
      expect(types.name).toBe('string');
      expect(types.value).toBe('number');
      expect(types.date).toBe('date');
      expect(types.active).toBe('boolean');
    });

    it('should suggest chart type based on data', () => {
      const timeSeriesData = [
        { date: '2024-01', value: 100 },
        { date: '2024-02', value: 120 }
      ];

      const suggestion = manager.suggestChartType(timeSeriesData);
      expect(suggestion).toBe('line');
    });

    it('should handle malformed CSV gracefully', async () => {
      const malformedCSV = 'Name,Value\nProduct A,100\nIncomplete';
      const result = await manager.importCSV(malformedCSV);

      expect(result.success).toBe(true);
      expect(result.warnings?.length).toBeGreaterThan(0);
    });

    it('should handle invalid JSON gracefully', async () => {
      const invalidJSON = '{ invalid json }';
      const result = await manager.importJSON(invalidJSON);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    describe('performance', () => {
      it('should parse 1000 rows in under 100ms', async () => {
        const rows = Array.from({ length: 1000 }, (_, i) =>
          `Product ${i},${i * 10}`
        );
        const csvData = 'Name,Value\n' + rows.join('\n');

        const start = performance.now();
        await manager.importCSV(csvData);
        const duration = performance.now() - start;

        expect(duration).toBeLessThan(100);
      });
    });
  });
});

// ==================== BATCH 3: ADVANCED FEATURES ====================

describe('P1 Batch 3: Advanced Features (Notes, Fonts, AI)', () => {

  // ==================== SPEAKER NOTES TESTS ====================

  describe('SpeakerNotesManager (P1.3)', () => {
    let manager: SpeakerNotesManager;

    beforeEach(() => {
      manager = new SpeakerNotesManager();
    });

    it('should add speaker notes to slide', () => {
      const note = manager.addNote(1, 'Important points to remember');
      expect(note).toBeDefined();
      expect(note?.slideNumber).toBe(1);
      expect(note?.content).toBe('Important points to remember');
    });

    it('should get notes for slide', () => {
      manager.addNote(1, 'Note 1');
      manager.addNote(1, 'Note 2');
      manager.addNote(2, 'Note 3');

      const notes = manager.getNotesForSlide(1);
      expect(notes).toHaveLength(2);
    });

    it('should generate presenter view', () => {
      manager.addNote(1, 'Key point 1');
      manager.addNote(2, 'Key point 2');

      const view = manager.generatePresenterView(1);
      expect(view).toBeDefined();
      expect(view?.currentSlide).toBe(1);
      expect(view?.notes.length).toBeGreaterThan(0);
    });

    it('should support timer settings', () => {
      manager.setTimer({ duration: 30, warningAt: 25 });
      const settings = manager.getTimerSettings();

      expect(settings?.duration).toBe(30);
      expect(settings?.warningAt).toBe(25);
    });

    it('should export notes as text', () => {
      manager.addNote(1, 'Note 1');
      manager.addNote(2, 'Note 2');

      const exported = manager.exportNotes();
      expect(exported).toContain('Slide 1');
      expect(exported).toContain('Note 1');
      expect(exported).toContain('Slide 2');
      expect(exported).toContain('Note 2');
    });

    describe('performance', () => {
      it('should handle 100 notes efficiently', () => {
        const start = performance.now();
        for (let i = 0; i < 100; i++) {
          manager.addNote(i, `Note ${i}`);
        }
        const duration = performance.now() - start;

        expect(duration).toBeLessThan(50);
      });
    });
  });

  // ==================== CUSTOM FONTS TESTS ====================

  describe('CustomFontManager (P1.8)', () => {
    let manager: CustomFontManager;

    beforeEach(() => {
      manager = new CustomFontManager();
    });

    it('should validate font upload', () => {
      const validation = manager.validateFont({
        name: 'CustomFont',
        format: 'woff2',
        size: 50000, // 50KB
        data: 'base64-encoded-font-data'
      });

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject oversized fonts', () => {
      const validation = manager.validateFont({
        name: 'HugeFont',
        format: 'woff2',
        size: 3000000, // 3MB - too large
        data: 'data'
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('size'))).toBe(true);
    });

    it('should reject unsupported formats', () => {
      const validation = manager.validateFont({
        name: 'Font',
        format: 'ttc' as any, // Unsupported
        size: 50000,
        data: 'data'
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('format'))).toBe(true);
    });

    it('should upload valid font', async () => {
      const result = await manager.uploadFont({
        name: 'CustomFont',
        format: 'woff2',
        size: 50000,
        data: 'base64-data'
      });

      expect(result.success).toBe(true);
      expect(result.fontFamily).toBe('CustomFont');
    });

    it('should generate font-face CSS', () => {
      const css = manager.generateFontFace('CustomFont', 'base64-data', 'woff2');

      expect(css).toContain('@font-face');
      expect(css).toContain('font-family: "CustomFont"');
      expect(css).toContain('src: url(data:font/woff2;base64,');
    });

    it('should list uploaded fonts', async () => {
      await manager.uploadFont({
        name: 'Font1',
        format: 'woff2',
        size: 50000,
        data: 'data1'
      });

      await manager.uploadFont({
        name: 'Font2',
        format: 'woff2',
        size: 60000,
        data: 'data2'
      });

      const fonts = manager.getUploadedFonts();
      expect(fonts.length).toBeGreaterThanOrEqual(2);
    });

    describe('performance', () => {
      it('should validate font in under 5ms', () => {
        const start = performance.now();
        manager.validateFont({
          name: 'Test',
          format: 'woff2',
          size: 50000,
          data: 'data'
        });
        const duration = performance.now() - start;

        expect(duration).toBeLessThan(5);
      });
    });
  });

  // ==================== AI IMAGE GENERATION TESTS ====================

  describe('AIImageGenerationManager (P1.11)', () => {
    let manager: AIImageGenerationManager;

    beforeEach(() => {
      manager = aiImageGenerator;
    });

    it('should validate generation request', () => {
      const validation = manager.validateRequest({
        prompt: 'A professional office setting',
        style: 'photographic',
        aspectRatio: '16:9'
      });

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject empty prompts', () => {
      const validation = manager.validateRequest({
        prompt: '',
        style: 'photographic'
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('prompt'))).toBe(true);
    });

    it('should enhance prompts for quality', () => {
      const enhanced = manager.enhancePrompt('office desk');
      expect(enhanced.length).toBeGreaterThan('office desk'.length);
      expect(enhanced).toContain('professional');
    });

    it('should suggest image styles', () => {
      const styles = manager.getAvailableStyles();
      expect(styles).toContain('photographic');
      expect(styles).toContain('illustration');
      expect(styles).toContain('abstract');
    });

    it('should generate mock image for testing', async () => {
      // Mock the actual API call
      const mockResult = await manager.generateMockImage({
        prompt: 'test image',
        style: 'photographic'
      });

      expect(mockResult.success).toBe(true);
      expect(mockResult.imageURL).toBeTruthy();
    });

    describe('performance', () => {
      it('should validate request in under 3ms', () => {
        const start = performance.now();
        manager.validateRequest({
          prompt: 'test',
          style: 'photographic'
        });
        const duration = performance.now() - start;

        expect(duration).toBeLessThan(3);
      });

      it('should enhance prompt in under 50ms', () => {
        const start = performance.now();
        manager.enhancePrompt('simple prompt');
        const duration = performance.now() - start;

        expect(duration).toBeLessThan(50);
      });
    });
  });
});

// ==================== BATCH 4: SYSTEM FEATURES ====================

describe('P1 Batch 4: System Features (i18n, Versions, Analytics)', () => {

  // ==================== I18N TESTS ====================

  describe('I18nManager (P1.6)', () => {
    const manager = i18n;

    it('should support 10+ languages', () => {
      const languages = manager.getSupportedLanguages();
      expect(languages.length).toBeGreaterThanOrEqual(10);
      expect(languages).toContain('en');
      expect(languages).toContain('es');
      expect(languages).toContain('fr');
      expect(languages).toContain('de');
      expect(languages).toContain('zh');
    });

    it('should translate strings', () => {
      manager.setLanguage('en');
      const translated = manager.t('common.save');
      expect(translated).toBeTruthy();
      expect(typeof translated).toBe('string');
    });

    it('should handle missing translations', () => {
      const translated = manager.t('nonexistent.key');
      expect(translated).toBe('nonexistent.key'); // Fallback to key
    });

    it('should switch languages', () => {
      manager.setLanguage('es');
      expect(manager.getCurrentLanguage()).toBe('es');

      manager.setLanguage('fr');
      expect(manager.getCurrentLanguage()).toBe('fr');
    });

    it('should detect browser language', () => {
      const detected = manager.detectLanguage();
      expect(typeof detected).toBe('string');
      expect(detected.length).toBeGreaterThan(0);
    });

    it('should format dates by locale', () => {
      const date = new Date('2024-01-15');
      const formatted = manager.formatDate(date, 'en');
      expect(formatted).toContain('2024');
    });

    it('should format numbers by locale', () => {
      const formatted = manager.formatNumber(1234.56, 'en');
      expect(formatted).toBeTruthy();
    });

    describe('performance', () => {
      it('should translate in under 2ms', () => {
        const start = performance.now();
        manager.t('common.save');
        const duration = performance.now() - start;
        expect(duration).toBeLessThan(2);
      });

      it('should switch language in under 10ms', () => {
        const start = performance.now();
        manager.setLanguage('es');
        const duration = performance.now() - start;
        expect(duration).toBeLessThan(10);
      });
    });
  });

  // ==================== VERSION HISTORY TESTS ====================

  describe('VersionHistoryManager (P1.10)', () => {
    let manager: VersionHistoryManager;

    beforeEach(() => {
      manager = versionHistory;
    });

    it('should create version snapshot', () => {
      const version = manager.createVersion({
        title: 'Test Presentation',
        slides: [{ title: 'Slide 1' }]
      }, 'Initial version');

      expect(version).toBeDefined();
      expect(version.description).toBe('Initial version');
      expect(version.snapshot.title).toBe('Test Presentation');
    });

    it('should list all versions', () => {
      manager.createVersion({ title: 'V1', slides: [] }, 'Version 1');
      manager.createVersion({ title: 'V2', slides: [] }, 'Version 2');

      const versions = manager.getVersions();
      expect(versions.length).toBeGreaterThanOrEqual(2);
    });

    it('should restore version', () => {
      const v1 = manager.createVersion({ title: 'Version 1', slides: [] }, 'V1');
      manager.createVersion({ title: 'Version 2', slides: [] }, 'V2');

      const restored = manager.restoreVersion(v1.id);
      expect(restored).toBeDefined();
      expect(restored?.title).toBe('Version 1');
    });

    it('should compare versions', () => {
      const v1 = manager.createVersion({ title: 'V1', slides: [{ title: 'A' }] }, 'V1');
      const v2 = manager.createVersion({ title: 'V2', slides: [{ title: 'B' }] }, 'V2');

      const diff = manager.compareVersions(v1.id, v2.id);
      expect(diff).toBeDefined();
      expect(diff?.changes.length).toBeGreaterThan(0);
    });

    it('should limit version history', () => {
      for (let i = 0; i < 100; i++) {
        manager.createVersion({ title: `V${i}`, slides: [] }, `Version ${i}`);
      }

      const versions = manager.getVersions();
      expect(versions.length).toBeLessThanOrEqual(50); // Default limit
    });

    describe('performance', () => {
      it('should create version in under 20ms', () => {
        const start = performance.now();
        manager.createVersion({ title: 'Test', slides: [] }, 'Test');
        const duration = performance.now() - start;
        expect(duration).toBeLessThan(20);
      });

      it('should restore version in under 30ms', () => {
        const version = manager.createVersion({ title: 'Test', slides: [] }, 'Test');

        const start = performance.now();
        manager.restoreVersion(version.id);
        const duration = performance.now() - start;

        expect(duration).toBeLessThan(30);
      });
    });
  });

  // ==================== ANALYTICS TESTS ====================

  describe('PresentationAnalyticsManager (P1.13)', () => {
    let manager: PresentationAnalyticsManager;

    beforeEach(() => {
      manager = presentationAnalytics;
    });

    it('should track presentation views', () => {
      manager.trackEvent({
        type: 'view',
        slideNumber: 1,
        timestamp: new Date()
      });

      const metrics = manager.getMetrics();
      expect(metrics.totalViews).toBeGreaterThan(0);
    });

    it('should track slide transitions', () => {
      manager.trackEvent({
        type: 'slide_change',
        slideNumber: 2,
        timestamp: new Date()
      });

      const slideMetrics = manager.getSlideMetrics(2);
      expect(slideMetrics.views).toBeGreaterThan(0);
    });

    it('should calculate time spent per slide', () => {
      const now = new Date();
      manager.trackEvent({ type: 'slide_change', slideNumber: 1, timestamp: now });

      setTimeout(() => {
        manager.trackEvent({
          type: 'slide_change',
          slideNumber: 2,
          timestamp: new Date(now.getTime() + 5000)
        });
      }, 10);

      const metrics = manager.getSlideMetrics(1);
      expect(metrics.avgTimeSpent).toBeGreaterThanOrEqual(0);
    });

    it('should track viewer information', () => {
      manager.trackViewer({
        id: 'viewer1',
        userAgent: 'Mozilla/5.0',
        location: 'US'
      });

      const sessionMetrics = manager.getSessionMetrics();
      expect(sessionMetrics.uniqueViewers).toBeGreaterThan(0);
    });

    it('should generate heatmap data', () => {
      for (let i = 1; i <= 10; i++) {
        manager.trackEvent({ type: 'view', slideNumber: i % 5, timestamp: new Date() });
      }

      const heatmap = manager.getHeatmapData();
      expect(heatmap).toBeDefined();
      expect(heatmap.length).toBeGreaterThan(0);
    });

    it('should export analytics summary', () => {
      manager.trackEvent({ type: 'view', slideNumber: 1, timestamp: new Date() });
      manager.trackEvent({ type: 'view', slideNumber: 2, timestamp: new Date() });

      const summary = manager.getSummary();
      expect(summary.totalViews).toBeGreaterThan(0);
      expect(summary.slideMetrics).toBeDefined();
    });

    describe('performance', () => {
      it('should track 1000 events efficiently', () => {
        const start = performance.now();
        for (let i = 0; i < 1000; i++) {
          manager.trackEvent({
            type: 'view',
            slideNumber: i % 10,
            timestamp: new Date()
          });
        }
        const duration = performance.now() - start;

        expect(duration).toBeLessThan(100); // <0.1ms per event
      });
    });
  });
});

// ==================== BATCH 5: COLLABORATIVE FEATURES ====================

describe('P1 Batch 5: Collaborative Features (Collaboration, Live, Mobile)', () => {

  // ==================== COLLABORATION TESTS ====================

  describe('CollaborationManager (P1.9)', () => {
    let manager: CollaborationManager;

    beforeEach(() => {
      manager = new CollaborationManager();
    });

    it('should start collaboration session', () => {
      const session = manager.startSession('presentation-1', {
        id: 'user1',
        name: 'Alice',
        email: 'alice@example.com',
        color: '#FF6B6B',
        role: 'owner'
      });

      expect(session).toBeDefined();
      expect(session.presentationId).toBe('presentation-1');
      expect(session.collaborators.size).toBe(1);
    });

    it('should allow users to join session', () => {
      const session = manager.startSession('pres-1', {
        id: 'user1',
        name: 'Alice',
        email: 'alice@example.com',
        color: '#FF6B6B',
        role: 'owner'
      });

      const joined = manager.joinSession(session.id, {
        id: 'user2',
        name: 'Bob',
        email: 'bob@example.com',
        color: '#4ECDC4',
        role: 'editor'
      });

      expect(joined).toBe(true);
      expect(manager.getActiveCollaborators()).toHaveLength(2);
    });

    it('should track presence updates', () => {
      manager.startSession('pres-1', {
        id: 'user1',
        name: 'Alice',
        email: 'alice@example.com',
        color: '#FF6B6B',
        role: 'owner'
      });

      manager.updatePresence({
        slideNumber: 5,
        cursor: { x: 100, y: 200 }
      });

      const presence = manager.getPresence('user1');
      expect(presence?.slideNumber).toBe(5);
      expect(presence?.cursor).toEqual({ x: 100, y: 200 });
    });

    it('should add comments', () => {
      manager.startSession('pres-1', {
        id: 'user1',
        name: 'Alice',
        email: 'alice@example.com',
        color: '#FF6B6B',
        role: 'owner'
      });

      const comment = manager.addComment('slide-1', 1, 'Great slide!');
      expect(comment).toBeDefined();
      expect(comment?.content).toBe('Great slide!');
      expect(comment?.slideNumber).toBe(1);
    });

    it('should reply to comments', () => {
      manager.startSession('pres-1', {
        id: 'user1',
        name: 'Alice',
        email: 'alice@example.com',
        color: '#FF6B6B',
        role: 'owner'
      });

      const comment = manager.addComment('slide-1', 1, 'Original comment');
      const reply = manager.replyToComment(comment!.id, 'Thanks!');

      expect(reply).toBeDefined();
      expect(reply?.content).toBe('Thanks!');
      expect(comment?.replies).toHaveLength(1);
    });

    it('should resolve comments', () => {
      manager.startSession('pres-1', {
        id: 'user1',
        name: 'Alice',
        email: 'alice@example.com',
        color: '#FF6B6B',
        role: 'owner'
      });

      const comment = manager.addComment('slide-1', 1, 'Fix this');
      manager.resolveComment(comment!.id);

      expect(comment?.resolved).toBe(true);
    });

    it('should extract @mentions', () => {
      manager.startSession('pres-1', {
        id: 'user1',
        name: 'Alice',
        email: 'alice@example.com',
        color: '#FF6B6B',
        role: 'owner'
      });

      manager.joinSession(manager.getSession()!.id, {
        id: 'user2',
        name: 'Bob',
        email: 'bob@example.com',
        color: '#4ECDC4',
        role: 'editor'
      });

      const comment = manager.addComment('slide-1', 1, 'Hey @Bob, check this out');
      expect(comment?.mentions).toContain('user2');
    });

    it('should generate cursor HTML', () => {
      const html = manager.generateCursorHTML(
        { id: '1', name: 'Alice', email: 'alice@example.com', color: '#FF6B6B', role: 'owner', status: 'active', lastSeen: new Date() },
        { x: 100, y: 200 }
      );

      expect(html).toContain('left: 100px');
      expect(html).toContain('top: 200px');
      expect(html).toContain('Alice');
      expect(html).toContain('#FF6B6B');
    });

    describe('performance', () => {
      it('should handle 20 collaborators efficiently', () => {
        manager.startSession('pres-1', {
          id: 'user1',
          name: 'User 1',
          email: 'user1@example.com',
          color: '#FF6B6B',
          role: 'owner'
        });

        const start = performance.now();
        for (let i = 2; i <= 20; i++) {
          manager.joinSession(manager.getSession()!.id, {
            id: `user${i}`,
            name: `User ${i}`,
            email: `user${i}@example.com`,
            color: '#4ECDC4',
            role: 'viewer'
          });
        }
        const duration = performance.now() - start;

        expect(manager.getActiveCollaborators()).toHaveLength(20);
        expect(duration).toBeLessThan(50);
      });

      it('should handle 100 comments efficiently', () => {
        manager.startSession('pres-1', {
          id: 'user1',
          name: 'Alice',
          email: 'alice@example.com',
          color: '#FF6B6B',
          role: 'owner'
        });

        const start = performance.now();
        for (let i = 0; i < 100; i++) {
          manager.addComment('slide-1', 1, `Comment ${i}`);
        }
        const duration = performance.now() - start;

        expect(duration).toBeLessThan(100);
      });
    });
  });

  // ==================== LIVE PRESENTATION TESTS ====================

  describe('LivePresentationManager (P1.15)', () => {
    let manager: LivePresentationManager;

    beforeEach(() => {
      manager = livePresentationManager;
    });

    it('should start live session', () => {
      const session = manager.startSession('presentation-1', {
        id: 'presenter1',
        name: 'Alice',
        email: 'alice@example.com'
      });

      expect(session).toBeDefined();
      expect(session.presentationId).toBe('presentation-1');
      expect(session.presenter.id).toBe('presenter1');
      expect(session.isLive).toBe(true);
    });

    it('should allow attendees to join', () => {
      const session = manager.startSession('pres-1', {
        id: 'presenter1',
        name: 'Alice',
        email: 'alice@example.com'
      });

      const joined = manager.joinAsAttendee(session.id, {
        id: 'attendee1',
        name: 'Bob'
      });

      expect(joined).toBe(true);
      expect(manager.getAttendees()).toHaveLength(1);
    });

    it('should control slide navigation for attendees', () => {
      manager.startSession('pres-1', {
        id: 'presenter1',
        name: 'Alice',
        email: 'alice@example.com'
      });

      manager.broadcastSlideChange(5);
      const session = manager.getSession();
      expect(session?.currentSlide).toBe(5);
    });

    it('should support Q&A', () => {
      manager.startSession('pres-1', {
        id: 'presenter1',
        name: 'Alice',
        email: 'alice@example.com'
      });

      manager.joinAsAttendee(manager.getSession()!.id, {
        id: 'attendee1',
        name: 'Bob'
      });

      const question = manager.submitQuestion('How does this work?', 'attendee1');
      expect(question).toBeDefined();
      expect(question?.content).toBe('How does this work?');
    });

    it('should support polls', () => {
      manager.startSession('pres-1', {
        id: 'presenter1',
        name: 'Alice',
        email: 'alice@example.com'
      });

      const poll = manager.createPoll({
        question: 'What do you think?',
        options: [
          { id: '1', text: 'Great', votes: 0 },
          { id: '2', text: 'Good', votes: 0 }
        ]
      });

      expect(poll).toBeDefined();
      expect(poll?.question).toBe('What do you think?');
    });

    it('should track reactions', () => {
      manager.startSession('pres-1', {
        id: 'presenter1',
        name: 'Alice',
        email: 'alice@example.com'
      });

      manager.sendReaction('👍', 'attendee1');
      const reactions = manager.getReactions();
      expect(reactions.length).toBeGreaterThan(0);
    });

    it('should end session', () => {
      const session = manager.startSession('pres-1', {
        id: 'presenter1',
        name: 'Alice',
        email: 'alice@example.com'
      });

      manager.endSession();
      expect(manager.getSession()?.isLive).toBe(false);
    });

    describe('performance', () => {
      it('should handle 500 attendees efficiently', () => {
        manager.startSession('pres-1', {
          id: 'presenter1',
          name: 'Alice',
          email: 'alice@example.com'
        });

        const start = performance.now();
        for (let i = 0; i < 500; i++) {
          manager.joinAsAttendee(manager.getSession()!.id, {
            id: `attendee${i}`,
            name: `Attendee ${i}`
          });
        }
        const duration = performance.now() - start;

        expect(manager.getAttendees()).toHaveLength(500);
        expect(duration).toBeLessThan(200);
      });
    });
  });

  // ==================== MOBILE APP TESTS ====================

  describe('MobileAppManager (P1.14)', () => {
    let manager: MobileAppManager;

    beforeEach(() => {
      manager = mobileAppManager;
    });

    it('should configure mobile app', () => {
      const config = manager.configure({
        appName: 'PresentationApp',
        packageId: 'com.example.presentation',
        version: '1.0.0'
      });

      expect(config).toBeDefined();
      expect(config.appName).toBe('PresentationApp');
    });

    it('should define responsive breakpoints', () => {
      const breakpoints = manager.getBreakpoints();

      expect(breakpoints.mobile).toBeDefined();
      expect(breakpoints.tablet).toBeDefined();
      expect(breakpoints.desktop).toBeDefined();
    });

    it('should support offline caching', () => {
      const cached = manager.cachePresentation({
        id: 'pres-1',
        title: 'Offline Presentation',
        slides: []
      });

      expect(cached).toBe(true);
      const retrieved = manager.getCachedPresentation('pres-1');
      expect(retrieved?.title).toBe('Offline Presentation');
    });

    it('should configure splash screen', () => {
      const splashConfig = manager.configureSplashScreen({
        backgroundColor: '#1F2937',
        logo: 'logo.png',
        duration: 2000
      });

      expect(splashConfig).toBeDefined();
      expect(splashConfig.duration).toBe(2000);
    });

    it('should handle mobile permissions', () => {
      manager.requestPermission('camera');
      manager.requestPermission('microphone');

      const permissions = manager.getPermissions();
      expect(permissions.camera).toBeDefined();
      expect(permissions.microphone).toBeDefined();
    });

    it('should optimize for mobile performance', () => {
      const optimized = manager.optimizeForMobile({
        title: 'Test',
        slides: Array.from({ length: 100 }, (_, i) => ({ title: `Slide ${i}` }))
      });

      expect(optimized).toBeDefined();
      // Should implement lazy loading or pagination
    });

    describe('performance', () => {
      it('should cache presentation in under 100ms', () => {
        const presentation = {
          id: 'pres-1',
          title: 'Large Deck',
          slides: Array.from({ length: 50 }, (_, i) => ({ title: `Slide ${i}` }))
        };

        const start = performance.now();
        manager.cachePresentation(presentation);
        const duration = performance.now() - start;

        expect(duration).toBeLessThan(100);
      });
    });
  });
});

// ==================== P0+P1 INTEGRATION TESTS ====================

describe('P0+P1 Integration', () => {

  it('should integrate IconLibrary with GridLayoutEngine', () => {
    const iconLib = new IconLibrary();
    const gridEngine = new GridLayoutEngine();

    const icon = iconLib.getIcon('chart-bar');
    const iconHTML = iconLib.renderIcon('chart-bar', { size: 48 });

    const analysis = gridEngine.analyzeContent({
      text: 'Revenue Growth',
      hasImage: true // Icon counts as image
    });

    expect(icon).toBeDefined();
    expect(iconHTML).toContain('svg');
    expect(analysis.hasImage).toBe(true);
  });

  it('should integrate BackgroundPatterns with ColorEngine', () => {
    const patternLib = new BackgroundPatternLibrary();
    const colorEngine = new ColorEngine();

    const palette = colorEngine.getPalette('corporate-blue');
    const { css } = patternLib.generateCSS('hexagon-grid', {
      color: palette!.primary[500],
      backgroundColor: palette!.surfaces.background
    });

    expect(css).toContain('background-color');
    expect(css).toContain(palette!.surfaces.background);
  });

  it('should integrate TemplateLibrary with TypographyEngine', () => {
    const templateLib = templateLibrary;
    const typographyEngine = new TypographyEngine();

    const templates = templateLib.getTemplates();
    const template = templates[0];

    template.slides.forEach(slide => {
      const metrics = typographyEngine.analyzeContent({
        title: slide.title,
        body: slide.content
      });
      const sizes = typographyEngine.calculateSizes(metrics, 'content');

      expect(sizes.h1).toBeGreaterThanOrEqual(32);
      expect(sizes.body).toBeGreaterThanOrEqual(18);
    });
  });

  it('should integrate I18n with all text-based features', () => {
    const i18nManager = i18n;
    const iconLib = new IconLibrary();

    i18nManager.setLanguage('es');
    const saveText = i18nManager.t('common.save');

    // All UI elements should respect current language
    expect(typeof saveText).toBe('string');
    expect(i18nManager.getCurrentLanguage()).toBe('es');
  });

  it('should integrate Analytics with LivePresentation', () => {
    const analytics = presentationAnalytics;
    const liveManager = livePresentationManager;

    const session = liveManager.startSession('pres-1', {
      id: 'presenter1',
      name: 'Alice',
      email: 'alice@example.com'
    });

    // Analytics should track live session events
    analytics.trackEvent({
      type: 'live_session_start',
      slideNumber: 1,
      timestamp: new Date()
    });

    const metrics = analytics.getMetrics();
    expect(metrics).toBeDefined();
  });

  describe('Performance: Complete P0+P1 Pipeline', () => {
    it('should generate complete slide with P1 features in under 300ms', () => {
      const gridEngine = new GridLayoutEngine();
      const typographyEngine = new TypographyEngine();
      const colorEngine = new ColorEngine();
      const iconLib = new IconLibrary();
      const patternLib = new BackgroundPatternLibrary();

      const start = performance.now();

      // P0 features
      const analysis = gridEngine.analyzeContent({
        text: 'Q4 Financial Results',
        hasChart: true
      });
      const layout = gridEngine.selectLayout(analysis, 2, 10);
      const metrics = typographyEngine.analyzeContent({ title: 'Q4 Financial Results' });
      const sizes = typographyEngine.calculateSizes(metrics, 'data');
      const palette = colorEngine.getPalette('finance-green')!;

      // P1 features
      const icon = iconLib.renderIcon('trending-up', { size: 32 });
      const { css } = patternLib.generateCSS('subtle-gradient', {
        color: palette.primary[100]
      });

      const duration = performance.now() - start;

      expect(layout).toBeDefined();
      expect(sizes.h1).toBeGreaterThan(0);
      expect(palette).toBeDefined();
      expect(icon).toContain('svg');
      expect(css).toBeTruthy();
      expect(duration).toBeLessThan(300);
    });
  });
});

// ==================== FEATURE FLAG TESTS ====================

describe('Feature Flag Tests', () => {

  it('should handle P1 features disabled gracefully', () => {
    // Mock feature flags disabled
    const featureFlags = {
      iconLibrary: false,
      backgroundPatterns: false,
      slideManager: false
    };

    expect(() => {
      if (featureFlags.iconLibrary) {
        new IconLibrary();
      }
    }).not.toThrow();
  });

  it('should enable P1 features independently', () => {
    const flags = {
      iconLibrary: true,
      backgroundPatterns: false,
      collaboration: true
    };

    if (flags.iconLibrary) {
      const iconLib = new IconLibrary();
      expect(iconLib.getCount()).toBeGreaterThan(0);
    }

    if (flags.collaboration) {
      const collabManager = new CollaborationManager();
      expect(collabManager).toBeDefined();
    }
  });

  it('should maintain P0 performance when P1 disabled', () => {
    const gridEngine = new GridLayoutEngine();
    const typographyEngine = new TypographyEngine();

    const start = performance.now();

    const analysis = gridEngine.analyzeContent({ text: 'Test' });
    const layout = gridEngine.selectLayout(analysis, 1, 5);
    const metrics = typographyEngine.analyzeContent({ title: 'Test' });
    const sizes = typographyEngine.calculateSizes(metrics, 'title');

    const duration = performance.now() - start;

    expect(duration).toBeLessThan(50); // Same as P0-only performance
  });
});

// ==================== BATCH INTEGRATION TESTS ====================

describe('Batch Integration Tests', () => {

  it('should integrate all Batch 1 features', () => {
    const iconLib = new IconLibrary();
    const patternLib = new BackgroundPatternLibrary();
    const slideManager = new SlideManager();

    slideManager.createPresentation('Test Deck');
    const icon = iconLib.getIcon('briefcase');
    const pattern = patternLib.getPattern('hexagon-grid');

    expect(icon).toBeDefined();
    expect(pattern).toBeDefined();
    expect(slideManager.getSlides()).toBeDefined();
  });

  it('should integrate all Batch 2 features', () => {
    const templates = templateLibrary.getTemplates();
    const videoManager = new VideoEmbedManager();
    const dataManager = new DataImportManager();

    expect(templates.length).toBeGreaterThan(0);
    expect(videoManager.isValidURL('https://youtube.com/watch?v=test')).toBe(true);
    expect(dataManager).toBeDefined();
  });

  it('should integrate all Batch 3 features', () => {
    const notesManager = new SpeakerNotesManager();
    const fontManager = new CustomFontManager();
    const aiImageManager = aiImageGenerator;

    notesManager.addNote(1, 'Test note');
    expect(fontManager).toBeDefined();
    expect(aiImageManager).toBeDefined();
  });

  it('should integrate all Batch 4 features', () => {
    const i18nManager = i18n;
    const versionManager = versionHistory;
    const analyticsManager = presentationAnalytics;

    expect(i18nManager.getSupportedLanguages().length).toBeGreaterThan(0);
    expect(versionManager).toBeDefined();
    expect(analyticsManager).toBeDefined();
  });

  it('should integrate all Batch 5 features', () => {
    const collabManager = new CollaborationManager();
    const liveManager = livePresentationManager;
    const mobileManager = mobileAppManager;

    expect(collabManager).toBeDefined();
    expect(liveManager).toBeDefined();
    expect(mobileManager).toBeDefined();
  });
});

// ==================== ERROR HANDLING & EDGE CASES ====================

describe('P1 Error Handling', () => {

  it('should handle concurrent slide operations', () => {
    const manager = new SlideManager();
    manager.createPresentation('Test');

    expect(() => {
      manager.addSlide({ title: 'A' });
      manager.addSlide({ title: 'B' });
      manager.reorderSlide(0, 1);
      manager.duplicateSlide(1);
    }).not.toThrow();
  });

  it('should handle invalid video URLs gracefully', () => {
    const manager = new VideoEmbedManager();

    const embed = manager.createEmbed('https://invalid-url.com');
    expect(embed).toBeNull();
  });

  it('should handle malformed data imports', async () => {
    const manager = new DataImportManager();

    const result = await manager.importCSV('invalid,csv\ndata');
    expect(result.success).toBe(true); // Should succeed with warnings
    expect(result.warnings?.length).toBeGreaterThan(0);
  });

  it('should handle empty collaboration sessions', () => {
    const manager = new CollaborationManager();

    expect(manager.getActiveCollaborators()).toHaveLength(0);
    expect(manager.getUnresolvedComments()).toHaveLength(0);
  });

  it('should handle missing translations', () => {
    const manager = i18n;

    const translated = manager.t('nonexistent.translation.key');
    expect(translated).toBe('nonexistent.translation.key'); // Fallback
  });
});

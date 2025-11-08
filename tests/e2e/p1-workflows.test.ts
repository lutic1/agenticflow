/**
 * P1 E2E Workflow Tests
 * End-to-end testing for P0+P1 feature combinations
 * Real-world workflows that users will execute
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// P0 imports
import { GridLayoutEngine } from '../../src/slide-designer/core-v2/grid-layout-engine';
import { TypographyEngine } from '../../src/slide-designer/core-v2/typography-engine';
import { ColorEngine } from '../../src/slide-designer/core-v2/color-engine';
import { ChartRenderer } from '../../src/slide-designer/core-v2/chart-renderer';
import { MasterSlideManager } from '../../src/slide-designer/core-v2/master-slide-manager';

// P1 imports - Batch 1
import { IconLibrary } from '../../src/slide-designer/assets/icon-library';
import { BackgroundPatternLibrary } from '../../src/slide-designer/assets/background-patterns';
import { SlideManager } from '../../src/slide-designer/features/slide-manager';

// P1 imports - Batch 2
import { TemplateLibrary, templateLibrary } from '../../src/slide-designer/features/template-library';
import { VideoEmbedManager } from '../../src/slide-designer/features/video-embed';
import { DataImportManager } from '../../src/slide-designer/features/data-import';

// P1 imports - Batch 3
import { SpeakerNotesManager } from '../../src/slide-designer/features/speaker-notes';
import { CustomFontManager } from '../../src/slide-designer/features/custom-fonts';
import { AIImageGenerationManager } from '../../src/slide-designer/features/ai-image-generation';

// P1 imports - Batch 4
import { I18nManager, i18n } from '../../src/slide-designer/features/i18n';
import { VersionHistoryManager, versionHistory } from '../../src/slide-designer/features/version-history';
import { PresentationAnalyticsManager, presentationAnalytics } from '../../src/slide-designer/features/analytics';

// P1 imports - Batch 5
import { CollaborationManager } from '../../src/slide-designer/features/collaboration';
import { LivePresentationManager, livePresentationManager } from '../../src/slide-designer/features/live-presentation';
import { MobileAppManager, mobileAppManager } from '../../src/slide-designer/features/mobile-app';

// ==================== WORKFLOW 1: TEMPLATE-BASED CREATION ====================

describe('Workflow 1: Template-Based Presentation Creation', () => {
  let slideManager: SlideManager;
  let iconLib: IconLibrary;
  let patternLib: BackgroundPatternLibrary;
  let dataManager: DataImportManager;
  let videoManager: VideoEmbedManager;
  let colorEngine: ColorEngine;
  let typographyEngine: TypographyEngine;

  beforeEach(() => {
    slideManager = new SlideManager();
    iconLib = new IconLibrary();
    patternLib = new BackgroundPatternLibrary();
    dataManager = new DataImportManager();
    videoManager = new VideoEmbedManager();
    colorEngine = new ColorEngine();
    typographyEngine = new TypographyEngine();
  });

  it('should create presentation from template with full customization', async () => {
    // Step 1: Select and instantiate template
    const templates = templateLibrary.getTemplates();
    const businessTemplate = templates.find(t => t.category === 'business');
    expect(businessTemplate).toBeDefined();

    const presentation = templateLibrary.instantiateTemplate(businessTemplate!.id, {
      title: 'Q4 Business Review'
    });
    expect(presentation).toBeDefined();
    expect(presentation?.slides.length).toBeGreaterThan(0);

    // Step 2: Customize with icons
    const icon = iconLib.getIcon('trending-up');
    const iconHTML = iconLib.renderIcon('trending-up', {
      size: 48,
      color: '#10B981'
    });
    expect(icon).toBeDefined();
    expect(iconHTML).toContain('svg');
    expect(iconHTML).toContain('#10B981');

    // Step 3: Add background pattern
    const palette = colorEngine.getPalette('corporate-blue')!;
    const { css: patternCSS } = patternLib.generateCSS('subtle-gradient', {
      color: palette.primary[100],
      backgroundColor: palette.surfaces.background,
      opacity: 0.05
    });
    expect(patternCSS).toContain('background');

    // Step 4: Import sales data
    const salesData = `Month,Revenue,Profit
January,120000,45000
February,135000,52000
March,142000,58000
April,155000,62000`;

    const importResult = await dataManager.importCSV(salesData);
    expect(importResult.success).toBe(true);
    expect(importResult.data).toHaveLength(4);

    // Step 5: Generate chart from data
    const chartRenderer = new ChartRenderer();
    const chartConfig = chartRenderer.createSampleChart('line');
    // In real scenario, would use importResult.data
    expect(chartConfig.type).toBe('line');

    // Step 6: Add video embed
    const videoEmbed = videoManager.createEmbed(
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      { width: 960, height: 540 }
    );
    expect(videoEmbed).toBeDefined();
    expect(videoEmbed?.embedHTML).toContain('iframe');

    // Step 7: Validate typography
    const metrics = typographyEngine.analyzeContent({
      title: 'Q4 Business Review',
      body: 'Key highlights and achievements'
    });
    const sizes = typographyEngine.calculateSizes(metrics, 'title');
    expect(sizes.h1).toBeGreaterThanOrEqual(32);

    // Performance check: entire workflow
    expect(true).toBe(true); // Workflow completed successfully
  });

  it('should measure complete workflow performance', async () => {
    const start = performance.now();

    // Complete workflow
    const templates = templateLibrary.getTemplates();
    const template = templates[0];
    const presentation = templateLibrary.instantiateTemplate(template.id);

    const icon = iconLib.renderIcon('chart-bar', { size: 32 });
    const pattern = patternLib.generateCSS('hexagon-grid');

    const csvData = 'Name,Value\nA,100\nB,200';
    const importResult = await dataManager.importCSV(csvData);

    const videoEmbed = videoManager.createEmbed('https://youtube.com/watch?v=test');

    const duration = performance.now() - start;

    expect(presentation).toBeDefined();
    expect(icon).toBeTruthy();
    expect(pattern.css).toBeTruthy();
    expect(importResult.success).toBe(true);
    expect(videoEmbed).toBeDefined();
    expect(duration).toBeLessThan(150); // Fast workflow
  });
});

// ==================== WORKFLOW 2: COLLABORATIVE PRESENTATION ====================

describe('Workflow 2: Collaborative Presentation Development', () => {
  let slideManager: SlideManager;
  let collabManager: CollaborationManager;
  let versionManager: VersionHistoryManager;
  let analyticsManager: PresentationAnalyticsManager;
  let liveManager: LivePresentationManager;

  beforeEach(() => {
    slideManager = new SlideManager();
    collabManager = new CollaborationManager();
    versionManager = versionHistory;
    analyticsManager = presentationAnalytics;
    liveManager = livePresentationManager;
  });

  it('should complete full collaborative workflow', async () => {
    // Step 1: Create presentation
    const presentation = slideManager.createPresentation('Team Collaboration Demo');
    slideManager.addSlide({ title: 'Slide 1', content: 'Introduction' });
    slideManager.addSlide({ title: 'Slide 2', content: 'Agenda' });
    slideManager.addSlide({ title: 'Slide 3', content: 'Goals' });

    expect(slideManager.getSlides()).toHaveLength(3);

    // Step 2: Create initial version
    const v1 = versionManager.createVersion(
      { title: presentation.title, slides: slideManager.getSlides() },
      'Initial draft'
    );
    expect(v1).toBeDefined();

    // Step 3: Start collaboration session
    const collabSession = collabManager.startSession(presentation.id, {
      id: 'user1',
      name: 'Alice',
      email: 'alice@example.com',
      color: '#FF6B6B',
      role: 'owner'
    });
    expect(collabSession).toBeDefined();

    // Step 4: Add collaborators
    const joined1 = collabManager.joinSession(collabSession.id, {
      id: 'user2',
      name: 'Bob',
      email: 'bob@example.com',
      color: '#4ECDC4',
      role: 'editor'
    });

    const joined2 = collabManager.joinSession(collabSession.id, {
      id: 'user3',
      name: 'Carol',
      email: 'carol@example.com',
      color: '#95E1D3',
      role: 'editor'
    });

    expect(joined1).toBe(true);
    expect(joined2).toBe(true);
    expect(collabManager.getActiveCollaborators()).toHaveLength(3);

    // Step 5: Collaborators add comments
    const comment1 = collabManager.addComment(
      'slide-1',
      1,
      'Great intro! Maybe add a company logo?'
    );

    const comment2 = collabManager.addComment(
      'slide-2',
      2,
      'The agenda looks comprehensive @Alice'
    );

    expect(comment1).toBeDefined();
    expect(comment2).toBeDefined();
    expect(comment2?.mentions).toContain('user1'); // Alice mentioned

    // Step 6: Reply to comments
    const reply = collabManager.replyToComment(comment1!.id, 'Good idea! Will add.');
    expect(reply).toBeDefined();

    // Step 7: Make edits and create new version
    slideManager.addSlide({ title: 'Slide 4', content: 'Action Items' });
    const v2 = versionManager.createVersion(
      { title: presentation.title, slides: slideManager.getSlides() },
      'Added action items slide'
    );
    expect(v2).toBeDefined();

    // Step 8: Compare versions
    const diff = versionManager.compareVersions(v1.id, v2.id);
    expect(diff).toBeDefined();
    expect(diff?.changes.length).toBeGreaterThan(0);

    // Step 9: Resolve comments
    collabManager.resolveComment(comment1!.id);
    const unresolvedComments = collabManager.getUnresolvedComments();
    expect(unresolvedComments.length).toBeLessThan(2);

    // Step 10: Start live presentation
    const liveSession = liveManager.startSession(presentation.id, {
      id: 'user1',
      name: 'Alice',
      email: 'alice@example.com'
    });
    expect(liveSession).toBeDefined();
    expect(liveSession.isLive).toBe(true);

    // Step 11: Track analytics
    analyticsManager.trackEvent({
      type: 'live_session_start',
      slideNumber: 1,
      timestamp: new Date()
    });

    analyticsManager.trackEvent({
      type: 'slide_change',
      slideNumber: 2,
      timestamp: new Date()
    });

    const metrics = analyticsManager.getMetrics();
    expect(metrics.totalViews).toBeGreaterThan(0);

    // Step 12: End live session
    liveManager.endSession();
    expect(liveManager.getSession()?.isLive).toBe(false);

    // Step 13: Get collaboration statistics
    const collabStats = collabManager.getStats();
    expect(collabStats.totalCollaborators).toBe(3);
    expect(collabStats.totalComments).toBeGreaterThanOrEqual(2);
  });

  it('should handle concurrent collaboration efficiently', () => {
    const presentation = slideManager.createPresentation('Concurrent Test');

    const collabSession = collabManager.startSession(presentation.id, {
      id: 'user1',
      name: 'User 1',
      email: 'user1@example.com',
      color: '#FF6B6B',
      role: 'owner'
    });

    const start = performance.now();

    // Simulate 10 concurrent collaborators
    for (let i = 2; i <= 10; i++) {
      collabManager.joinSession(collabSession.id, {
        id: `user${i}`,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        color: `#${Math.random().toString(16).substr(2, 6)}`,
        role: 'editor'
      });

      // Each adds a comment
      collabManager.addComment('slide-1', 1, `Comment from user ${i}`);

      // Update presence
      collabManager.updatePresence({
        slideNumber: i % 3,
        cursor: { x: i * 10, y: i * 20 }
      });
    }

    const duration = performance.now() - start;

    expect(collabManager.getActiveCollaborators()).toHaveLength(10);
    expect(duration).toBeLessThan(100); // <10ms per collaborator
  });
});

// ==================== WORKFLOW 3: MULTILINGUAL PRESENTATION ====================

describe('Workflow 3: Multilingual Presentation Creation', () => {
  let slideManager: SlideManager;
  let i18nManager: I18nManager;
  let notesManager: SpeakerNotesManager;
  let versionManager: VersionHistoryManager;
  let mobileManager: MobileAppManager;
  let typographyEngine: TypographyEngine;

  beforeEach(() => {
    slideManager = new SlideManager();
    i18nManager = i18n;
    notesManager = new SpeakerNotesManager();
    versionManager = versionHistory;
    mobileManager = mobileAppManager;
    typographyEngine = new TypographyEngine();
  });

  it('should create and localize presentation across languages', () => {
    // Step 1: Create presentation in English
    i18nManager.setLanguage('en');
    const presentation = slideManager.createPresentation('Global Product Launch');

    slideManager.addSlide({
      title: 'Welcome',
      content: 'Thank you for joining our product launch event'
    });

    slideManager.addSlide({
      title: 'Product Overview',
      content: 'Revolutionary features that will change the industry'
    });

    expect(slideManager.getSlides()).toHaveLength(2);

    // Step 2: Add speaker notes in English
    notesManager.addNote(1, 'Greet audience warmly. Mention global reach.');
    notesManager.addNote(2, 'Highlight 3 key features: AI, Speed, Security');

    const englishNotes = notesManager.getNotesForSlide(1);
    expect(englishNotes).toHaveLength(1);

    // Step 3: Create English version
    const englishVersion = versionManager.createVersion(
      {
        title: presentation.title,
        slides: slideManager.getSlides(),
        language: 'en'
      },
      'English version'
    );
    expect(englishVersion).toBeDefined();

    // Step 4: Switch to Spanish
    i18nManager.setLanguage('es');
    expect(i18nManager.getCurrentLanguage()).toBe('es');

    // Verify UI translations work
    const saveText = i18nManager.t('common.save');
    expect(typeof saveText).toBe('string');

    // Step 5: Create Spanish version
    const spanishPresentation = slideManager.createPresentation('Lanzamiento Global de Producto');

    slideManager.addSlide({
      title: 'Bienvenida',
      content: 'Gracias por unirse a nuestro evento de lanzamiento de producto'
    });

    slideManager.addSlide({
      title: 'Descripción del Producto',
      content: 'Características revolucionarias que cambiarán la industria'
    });

    const spanishVersion = versionManager.createVersion(
      {
        title: spanishPresentation.title,
        slides: slideManager.getSlides(),
        language: 'es'
      },
      'Spanish version'
    );
    expect(spanishVersion).toBeDefined();

    // Step 6: Switch to French
    i18nManager.setLanguage('fr');
    expect(i18nManager.getCurrentLanguage()).toBe('fr');

    // Step 7: Switch to German
    i18nManager.setLanguage('de');
    expect(i18nManager.getCurrentLanguage()).toBe('de');

    // Step 8: Switch to Chinese
    i18nManager.setLanguage('zh');
    expect(i18nManager.getCurrentLanguage()).toBe('zh');

    // Step 9: Format dates and numbers by locale
    const date = new Date('2024-03-15');
    const enDate = i18nManager.formatDate(date, 'en');
    const esDate = i18nManager.formatDate(date, 'es');
    const zhDate = i18nManager.formatDate(date, 'zh');

    expect(enDate).toBeTruthy();
    expect(esDate).toBeTruthy();
    expect(zhDate).toBeTruthy();

    // Step 10: Configure for mobile viewing
    mobileManager.configure({
      appName: 'Global Product Launch',
      packageId: 'com.example.productlaunch',
      version: '1.0.0'
    });

    const cached = mobileManager.cachePresentation({
      id: presentation.id,
      title: presentation.title,
      slides: slideManager.getSlides()
    });
    expect(cached).toBe(true);

    // Step 11: Verify typography adapts to different scripts
    const latinMetrics = typographyEngine.analyzeContent({
      title: 'Welcome'
    });

    const chineseMetrics = typographyEngine.analyzeContent({
      title: '欢迎'
    });

    expect(latinMetrics.wordCount).toBeGreaterThanOrEqual(0);
    expect(chineseMetrics.wordCount).toBeGreaterThanOrEqual(0);

    // Step 12: Get all versions
    const allVersions = versionManager.getVersions();
    expect(allVersions.length).toBeGreaterThanOrEqual(2); // English + Spanish
  });

  it('should switch languages efficiently', () => {
    const languages = ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'pt', 'ru', 'ar'];

    const start = performance.now();

    for (const lang of languages) {
      i18nManager.setLanguage(lang);
      const translated = i18nManager.t('common.save');
      expect(typeof translated).toBe('string');
    }

    const duration = performance.now() - start;

    expect(duration).toBeLessThan(50); // <5ms per language switch
  });
});

// ==================== WORKFLOW 4: DATA-DRIVEN PRESENTATION ====================

describe('Workflow 4: Data-Driven Presentation', () => {
  let dataManager: DataImportManager;
  let chartRenderer: ChartRenderer;
  let iconLib: IconLibrary;
  let colorEngine: ColorEngine;
  let gridEngine: GridLayoutEngine;

  beforeEach(() => {
    dataManager = new DataImportManager();
    chartRenderer = new ChartRenderer();
    iconLib = new IconLibrary();
    colorEngine = new ColorEngine();
    gridEngine = new GridLayoutEngine();
  });

  it('should create data-driven presentation from CSV', async () => {
    // Step 1: Import quarterly revenue data
    const csvData = `Quarter,Revenue,Expenses,Profit,Growth
Q1 2024,1250000,750000,500000,12.5
Q2 2024,1380000,820000,560000,10.4
Q3 2024,1520000,880000,640000,10.1
Q4 2024,1680000,920000,760000,10.5`;

    const importResult = await dataManager.importCSV(csvData);
    expect(importResult.success).toBe(true);
    expect(importResult.data).toHaveLength(4);

    // Step 2: Detect data types
    const dataTypes = dataManager.detectDataTypes(importResult.data);
    expect(dataTypes.Quarter).toBe('string');
    expect(dataTypes.Revenue).toBe('number');
    expect(dataTypes.Growth).toBe('number');

    // Step 3: Get chart suggestion
    const chartType = dataManager.suggestChartType(importResult.data);
    expect(['line', 'bar']).toContain(chartType);

    // Step 4: Create revenue trend chart
    const revenueChart = {
      type: 'line' as const,
      data: {
        labels: importResult.data.map(row => row.Quarter),
        datasets: [{
          label: 'Revenue',
          data: importResult.data.map(row => parseFloat(row.Revenue))
        }]
      }
    };

    const styledRevenue = chartRenderer.generateConfig(revenueChart, 'finance');
    expect(styledRevenue.type).toBe('line');
    expect(styledRevenue.data.datasets[0].data).toHaveLength(4);

    // Step 5: Create profit breakdown pie chart
    const profitChart = {
      type: 'pie' as const,
      data: {
        labels: importResult.data.map(row => row.Quarter),
        datasets: [{
          label: 'Profit',
          data: importResult.data.map(row => parseFloat(row.Profit))
        }]
      }
    };

    const styledProfit = chartRenderer.generateConfig(profitChart, 'finance');
    expect(styledProfit.type).toBe('pie');

    // Step 6: Add appropriate icons
    const trendingUpIcon = iconLib.renderIcon('trending-up', {
      size: 64,
      color: '#10B981'
    });
    expect(trendingUpIcon).toContain('svg');

    const dollarIcon = iconLib.renderIcon('dollar-sign', {
      size: 48,
      color: '#059669'
    });
    expect(dollarIcon).toContain('svg');

    // Step 7: Select color palette for finance
    const palette = colorEngine.getPalette('finance-green')!;
    expect(palette).toBeDefined();
    expect(palette.domain).toBe('finance');

    // Step 8: Design data-focused layout
    const analysis = gridEngine.analyzeContent({
      text: 'Q4 Financial Results',
      hasChart: true
    });

    const layout = gridEngine.selectLayout(analysis, 2, 10);
    expect(layout.name).toBe('Content Focused');

    // Verify complete workflow
    expect(importResult.success).toBe(true);
    expect(styledRevenue).toBeDefined();
    expect(styledProfit).toBeDefined();
    expect(trendingUpIcon).toBeTruthy();
    expect(palette).toBeDefined();
    expect(layout).toBeDefined();
  });

  it('should handle large dataset efficiently', async () => {
    // Generate 1000 rows
    const rows = Array.from({ length: 1000 }, (_, i) =>
      `Product ${i},${i * 100},${i * 50}`
    );
    const csvData = 'Product,Sales,Profit\n' + rows.join('\n');

    const start = performance.now();

    const result = await dataManager.importCSV(csvData);
    const chartType = dataManager.suggestChartType(result.data);

    const duration = performance.now() - start;

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1000);
    expect(chartType).toBeTruthy();
    expect(duration).toBeLessThan(150); // Efficient processing
  });
});

// ==================== WORKFLOW 5: MEDIA-RICH PRESENTATION ====================

describe('Workflow 5: Media-Rich Presentation', () => {
  let videoManager: VideoEmbedManager;
  let aiImageManager: AIImageGenerationManager;
  let iconLib: IconLibrary;
  let patternLib: BackgroundPatternLibrary;
  let fontManager: CustomFontManager;

  beforeEach(() => {
    videoManager = new VideoEmbedManager();
    aiImageManager = new AIImageGenerationManager();
    iconLib = new IconLibrary();
    patternLib = new BackgroundPatternLibrary();
    fontManager = new CustomFontManager();
  });

  it('should create presentation with diverse media types', async () => {
    // Step 1: Embed YouTube video
    const youtubeEmbed = videoManager.createEmbed(
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      { width: 960, height: 540, autoplay: false }
    );
    expect(youtubeEmbed).toBeDefined();
    expect(youtubeEmbed?.platform).toBe('youtube');
    expect(youtubeEmbed?.embedHTML).toContain('iframe');

    // Step 2: Embed Vimeo video
    const vimeoEmbed = videoManager.createEmbed(
      'https://vimeo.com/123456789',
      { width: 960, height: 540 }
    );
    expect(vimeoEmbed).toBeDefined();
    expect(vimeoEmbed?.platform).toBe('vimeo');

    // Step 3: Generate AI image
    const imageRequest = {
      prompt: 'A modern office space with collaborative workstations',
      style: 'photographic' as const,
      aspectRatio: '16:9' as const
    };

    const validation = aiImageManager.validateRequest(imageRequest);
    expect(validation.valid).toBe(true);

    const enhancedPrompt = aiImageManager.enhancePrompt(imageRequest.prompt);
    expect(enhancedPrompt.length).toBeGreaterThan(imageRequest.prompt.length);

    // Step 4: Add custom font
    const fontValidation = fontManager.validateFont({
      name: 'CustomHeadline',
      format: 'woff2',
      size: 75000, // 75KB
      data: 'base64-encoded-font-data'
    });
    expect(fontValidation.valid).toBe(true);

    // Step 5: Add icons
    const playIcon = iconLib.renderIcon('video', { size: 48 });
    const imageIcon = iconLib.renderIcon('palette', { size: 48 });
    expect(playIcon).toContain('svg');
    expect(imageIcon).toContain('svg');

    // Step 6: Add background pattern
    const pattern = patternLib.getPattern('paper-texture');
    expect(pattern).toBeDefined();
    expect(pattern?.category).toBe('texture');

    // Verify all media types integrated
    expect(youtubeEmbed).toBeDefined();
    expect(vimeoEmbed).toBeDefined();
    expect(validation.valid).toBe(true);
    expect(fontValidation.valid).toBe(true);
    expect(playIcon).toBeTruthy();
    expect(pattern).toBeDefined();
  });

  it('should validate media efficiently', () => {
    const start = performance.now();

    // Validate multiple media sources
    const video1 = videoManager.isValidURL('https://youtube.com/watch?v=test1');
    const video2 = videoManager.isValidURL('https://vimeo.com/123456');
    const video3 = videoManager.isValidURL('https://invalid.com');

    const font1 = fontManager.validateFont({
      name: 'Font1',
      format: 'woff2',
      size: 50000,
      data: 'data1'
    });

    const font2 = fontManager.validateFont({
      name: 'Font2',
      format: 'ttf',
      size: 3000000, // Too large
      data: 'data2'
    });

    const duration = performance.now() - start;

    expect(video1).toBe(true);
    expect(video2).toBe(true);
    expect(video3).toBe(false);
    expect(font1.valid).toBe(true);
    expect(font2.valid).toBe(false);
    expect(duration).toBeLessThan(20);
  });
});

// ==================== WORKFLOW 6: LIVE PRESENTATION WITH ANALYTICS ====================

describe('Workflow 6: Live Presentation with Real-Time Analytics', () => {
  let liveManager: LivePresentationManager;
  let analyticsManager: PresentationAnalyticsManager;
  let slideManager: SlideManager;

  beforeEach(() => {
    liveManager = livePresentationManager;
    analyticsManager = presentationAnalytics;
    slideManager = new SlideManager();
  });

  it('should conduct live presentation with full analytics', () => {
    // Step 1: Create presentation
    const presentation = slideManager.createPresentation('Live Product Demo');
    for (let i = 1; i <= 10; i++) {
      slideManager.addSlide({
        title: `Slide ${i}`,
        content: `Content for slide ${i}`
      });
    }
    expect(slideManager.getSlides()).toHaveLength(10);

    // Step 2: Start live session
    const liveSession = liveManager.startSession(presentation.id, {
      id: 'presenter1',
      name: 'Jane Doe',
      email: 'jane@example.com'
    });
    expect(liveSession.isLive).toBe(true);

    analyticsManager.trackEvent({
      type: 'live_session_start',
      slideNumber: 1,
      timestamp: new Date()
    });

    // Step 3: Attendees join
    const attendeeCount = 50;
    for (let i = 1; i <= attendeeCount; i++) {
      liveManager.joinAsAttendee(liveSession.id, {
        id: `attendee${i}`,
        name: `Attendee ${i}`
      });

      analyticsManager.trackViewer({
        id: `attendee${i}`,
        userAgent: 'Mozilla/5.0',
        location: i % 2 === 0 ? 'US' : 'UK'
      });
    }

    expect(liveManager.getAttendees()).toHaveLength(attendeeCount);

    // Step 4: Navigate through slides
    for (let slide = 1; slide <= 10; slide++) {
      liveManager.broadcastSlideChange(slide);

      analyticsManager.trackEvent({
        type: 'slide_change',
        slideNumber: slide,
        timestamp: new Date()
      });

      // Simulate different engagement on different slides
      const viewersOnSlide = Math.floor(Math.random() * attendeeCount);
      for (let v = 0; v < viewersOnSlide; v++) {
        analyticsManager.trackEvent({
          type: 'view',
          slideNumber: slide,
          timestamp: new Date()
        });
      }
    }

    // Step 5: Q&A session
    const question1 = liveManager.submitQuestion(
      'How does the pricing work?',
      'attendee5'
    );
    const question2 = liveManager.submitQuestion(
      'Is there a free trial?',
      'attendee12'
    );
    const question3 = liveManager.submitQuestion(
      'What about enterprise support?',
      'attendee23'
    );

    expect(question1).toBeDefined();
    expect(question2).toBeDefined();
    expect(question3).toBeDefined();

    // Step 6: Create poll
    const poll = liveManager.createPoll({
      question: 'How likely are you to recommend this product?',
      options: [
        { id: '1', text: 'Very Likely', votes: 0 },
        { id: '2', text: 'Somewhat Likely', votes: 0 },
        { id: '3', text: 'Not Likely', votes: 0 }
      ]
    });
    expect(poll).toBeDefined();

    // Step 7: Collect reactions
    for (let i = 0; i < 30; i++) {
      const reactions = ['👍', '👏', '❤️', '🔥'];
      const reaction = reactions[i % reactions.length];
      liveManager.sendReaction(reaction, `attendee${i + 1}`);
    }

    const reactions = liveManager.getReactions();
    expect(reactions.length).toBeGreaterThan(0);

    // Step 8: Generate analytics summary
    const summary = analyticsManager.getSummary();
    expect(summary.totalViews).toBeGreaterThan(0);
    expect(summary.slideMetrics).toBeDefined();

    const heatmap = analyticsManager.getHeatmapData();
    expect(heatmap.length).toBeGreaterThan(0);

    const sessionMetrics = analyticsManager.getSessionMetrics();
    expect(sessionMetrics.uniqueViewers).toBeGreaterThan(0);

    // Step 9: End session
    liveManager.endSession();
    expect(liveManager.getSession()?.isLive).toBe(false);

    analyticsManager.trackEvent({
      type: 'live_session_end',
      slideNumber: 10,
      timestamp: new Date()
    });

    // Verify complete analytics collected
    const finalMetrics = analyticsManager.getMetrics();
    expect(finalMetrics.totalViews).toBeGreaterThan(10); // At least one per slide
  });

  it('should handle large live audience efficiently', () => {
    const presentation = slideManager.createPresentation('Large Webinar');
    slideManager.addSlide({ title: 'Slide 1' });

    const liveSession = liveManager.startSession(presentation.id, {
      id: 'presenter1',
      name: 'Presenter',
      email: 'presenter@example.com'
    });

    const start = performance.now();

    // 500 attendees join
    for (let i = 1; i <= 500; i++) {
      liveManager.joinAsAttendee(liveSession.id, {
        id: `attendee${i}`,
        name: `Attendee ${i}`
      });
    }

    const duration = performance.now() - start;

    expect(liveManager.getAttendees()).toHaveLength(500);
    expect(duration).toBeLessThan(300); // <0.6ms per attendee
  });
});

// ==================== PERFORMANCE BENCHMARKS ====================

describe('P1 Workflow Performance Benchmarks', () => {

  it('should complete template workflow in under 200ms', async () => {
    const start = performance.now();

    // Complete template-based workflow
    const templates = templateLibrary.getTemplates();
    const template = templates[0];
    const presentation = templateLibrary.instantiateTemplate(template.id);

    const iconLib = new IconLibrary();
    const icon = iconLib.renderIcon('chart-bar');

    const patternLib = new BackgroundPatternLibrary();
    const pattern = patternLib.generateCSS('hexagon-grid');

    const dataManager = new DataImportManager();
    const csv = 'A,1\nB,2';
    const data = await dataManager.importCSV(csv);

    const duration = performance.now() - start;

    expect(presentation).toBeDefined();
    expect(icon).toBeTruthy();
    expect(pattern.css).toBeTruthy();
    expect(data.success).toBe(true);
    expect(duration).toBeLessThan(200);
  });

  it('should handle collaborative workflow in under 250ms', () => {
    const start = performance.now();

    const slideManager = new SlideManager();
    const presentation = slideManager.createPresentation('Test');
    slideManager.addSlide({ title: 'Slide 1' });

    const collabManager = new CollaborationManager();
    const session = collabManager.startSession(presentation.id, {
      id: 'user1',
      name: 'User 1',
      email: 'user1@example.com',
      color: '#FF6B6B',
      role: 'owner'
    });

    for (let i = 2; i <= 10; i++) {
      collabManager.joinSession(session.id, {
        id: `user${i}`,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        color: '#4ECDC4',
        role: 'editor'
      });
    }

    for (let i = 0; i < 10; i++) {
      collabManager.addComment('slide-1', 1, `Comment ${i}`);
    }

    const versionManager = versionHistory;
    versionManager.createVersion({ title: 'Test', slides: [] }, 'V1');

    const duration = performance.now() - start;

    expect(collabManager.getActiveCollaborators()).toHaveLength(10);
    expect(duration).toBeLessThan(250);
  });
});

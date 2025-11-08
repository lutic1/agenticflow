/**
 * P1 UX Scenario Tests
 * End-to-end user experience tests for P1 features
 * Tests critical workflows combining P0 + P1 features
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Import P1 feature managers
import { templateLibrary, TemplateLibrary, PresentationTemplate } from '../../src/slide-designer/features/template-library';
import { collaborationManager, CollaborationManager } from '../../src/slide-designer/features/collaboration';
import { dataImportManager, DataImportManager } from '../../src/slide-designer/features/data-import';
import { aiImageGenerator, AIImageGenerationManager } from '../../src/slide-designer/features/ai-image-generation';
import { presentationAnalytics, PresentationAnalyticsManager } from '../../src/slide-designer/features/analytics';
import { versionHistory, VersionHistoryManager } from '../../src/slide-designer/features/version-history';
import { livePresentationManager, LivePresentationManager } from '../../src/slide-designer/features/live-presentation';
import { mobileAppManager, MobileAppManager } from '../../src/slide-designer/features/mobile-app';
import { backgroundPatternLibrary, BackgroundPatternLibrary } from '../../src/slide-designer/assets/background-patterns';
import { SlideManager } from '../../src/slide-designer/features/slide-manager';
import { i18n, I18nManager } from '../../src/slide-designer/features/i18n';

describe('P1 UX Scenarios - Critical User Workflows', () => {

  // ============================================================================
  // Scenario 1: Template-Based Presentation Creation
  // ============================================================================

  describe('Scenario 1: Create Professional Presentation from Template', () => {
    let library: TemplateLibrary;

    beforeEach(() => {
      library = new TemplateLibrary();
    });

    it('should allow user to browse and filter templates', () => {
      // User opens template library
      const allTemplates = library.getAllTemplates();
      expect(allTemplates.length).toBe(20);

      // User filters by category
      const pitchTemplates = library.getByCategory('pitch');
      expect(pitchTemplates.length).toBeGreaterThan(0);
      expect(pitchTemplates.every(t => t.category === 'pitch')).toBe(true);

      // User searches for "startup"
      const startupTemplates = library.search('startup');
      expect(startupTemplates.length).toBeGreaterThan(0);
      expect(startupTemplates[0].tags).toContain('startup');
    });

    it('should load template with all metadata', () => {
      // User selects "Startup Pitch Deck"
      const template = library.getTemplate('startup-pitch-deck');

      expect(template).toBeDefined();
      expect(template!.name).toBe('Startup Pitch Deck');
      expect(template!.slideCount).toBe(10);
      expect(template!.slides.length).toBe(10);
      expect(template!.metadata.rating).toBeGreaterThan(0);

      // Verify all slides have content
      template!.slides.forEach(slide => {
        expect(slide.content).toBeDefined();
        expect(slide.layout).toBeDefined();
      });
    });

    it('should track template usage', () => {
      const templateId = 'startup-pitch-deck';

      // User downloads template
      const initialDownloads = library.getTemplate(templateId)!.metadata.downloads;
      library.recordDownload(templateId);

      const afterDownloads = library.getTemplate(templateId)!.metadata.downloads;
      expect(afterDownloads).toBe(initialDownloads + 1);
    });

    it('should allow cloning template for customization', () => {
      // User wants to customize template
      const original = library.getTemplate('startup-pitch-deck')!;
      const cloned = library.cloneTemplate('startup-pitch-deck')!;

      expect(cloned).toBeDefined();
      expect(cloned.id).not.toBe(original.id);
      expect(cloned.slides.length).toBe(original.slides.length);
      expect(cloned.metadata.createdAt).not.toBe(original.metadata.createdAt);
    });

    it('should provide template recommendations', () => {
      // Get popular templates
      const popular = library.getPopular(5);
      expect(popular.length).toBeLessThanOrEqual(5);
      expect(popular[0].metadata.downloads).toBeGreaterThanOrEqual(popular[popular.length - 1].metadata.downloads);

      // Get top-rated templates
      const topRated = library.getTopRated(5);
      expect(topRated.length).toBeLessThanOrEqual(5);
      expect(topRated[0].metadata.rating).toBeGreaterThanOrEqual(topRated[topRated.length - 1].metadata.rating);
    });

    it('should complete workflow under 10 minutes (performance)', () => {
      const startTime = Date.now();

      // User workflow simulation
      const templates = library.search('business');
      const template = library.getTemplate(templates[0].id);
      const cloned = library.cloneTemplate(templates[0].id);
      library.recordDownload(templates[0].id);

      const duration = Date.now() - startTime;

      // Should be nearly instant (< 100ms for in-memory operations)
      expect(duration).toBeLessThan(100);
    });
  });

  // ============================================================================
  // Scenario 2: Team Collaboration
  // ============================================================================

  describe('Scenario 2: Collaborate on Presentation with Team', () => {
    let manager: CollaborationManager;

    beforeEach(() => {
      manager = new CollaborationManager();
    });

    it('should start collaboration session', () => {
      const session = manager.startSession('presentation-123', {
        id: 'user-1',
        name: 'Alice',
        email: 'alice@example.com',
        color: '#FF6B6B',
        role: 'owner'
      });

      expect(session).toBeDefined();
      expect(session.id).toBeDefined();
      expect(session.collaborators.size).toBe(1);
      expect(session.comments.size).toBe(0);
    });

    it('should allow multiple users to join', () => {
      const session = manager.startSession('presentation-123', {
        id: 'user-1',
        name: 'Alice',
        email: 'alice@example.com',
        color: '#FF6B6B',
        role: 'owner'
      });

      // User B joins
      const joined = manager.joinSession(session.id, {
        id: 'user-2',
        name: 'Bob',
        email: 'bob@example.com',
        color: '#4ECDC4',
        role: 'editor'
      });

      expect(joined).toBe(true);
      expect(session.collaborators.size).toBe(2);
    });

    it('should handle comment threads with @mentions', () => {
      const session = manager.startSession('presentation-123', {
        id: 'user-1',
        name: 'Alice',
        email: 'alice@example.com',
        color: '#FF6B6B',
        role: 'owner'
      });

      manager.joinSession(session.id, {
        id: 'user-2',
        name: 'Bob',
        email: 'bob@example.com',
        color: '#4ECDC4',
        role: 'editor'
      });

      // Bob adds comment with @mention
      const comment = manager.addComment('slide-1', 1, '@Alice can we add Q3 comparison?', { x: 100, y: 200 });

      expect(comment).toBeDefined();
      expect(comment!.content).toContain('@Alice');
      expect(comment!.mentions).toBeDefined();
      expect(comment!.slideNumber).toBe(1);

      // Alice replies
      const reply = manager.replyToComment(comment!.id, 'Good idea, adding now');
      expect(reply).toBeDefined();
      expect(comment!.replies.length).toBe(1);

      // Alice resolves comment
      const resolved = manager.resolveComment(comment!.id);
      expect(resolved).toBe(true);
      expect(comment!.resolved).toBe(true);
    });

    it('should track real-time presence', () => {
      const session = manager.startSession('presentation-123', {
        id: 'user-1',
        name: 'Alice',
        email: 'alice@example.com',
        color: '#FF6B6B',
        role: 'owner'
      });

      // Update presence
      manager.updatePresence({
        slideNumber: 3,
        cursor: { x: 250, y: 300 }
      });

      const presence = manager.getPresence('user-1');
      expect(presence).toBeDefined();
      expect(presence!.slideNumber).toBe(3);
      expect(presence!.cursor).toEqual({ x: 250, y: 300 });
    });

    it('should provide collaboration statistics', () => {
      const session = manager.startSession('presentation-123', {
        id: 'user-1',
        name: 'Alice',
        email: 'alice@example.com',
        color: '#FF6B6B',
        role: 'owner'
      });

      manager.addComment('slide-1', 1, 'First comment');
      manager.addComment('slide-2', 2, 'Second comment');

      const stats = manager.getStats();

      expect(stats.totalCollaborators).toBe(1);
      expect(stats.totalComments).toBe(2);
      expect(stats.unresolvedComments).toBe(2);
    });
  });

  // ============================================================================
  // Scenario 3: Data-Driven Presentation
  // ============================================================================

  describe('Scenario 3: Import Data and Create Charts', () => {
    let importer: DataImportManager;

    beforeEach(() => {
      importer = new DataImportManager();
    });

    it('should import CSV data successfully', () => {
      const csvData = importer.getSampleCSV();
      const result = importer.importCSV(csvData);

      expect(result.success).toBe(true);
      expect(result.rows).toBe(5);
      expect(result.columns).toBe(4);
      expect(result.headers).toEqual(['Month', 'Revenue', 'Expenses', 'Profit']);
    });

    it('should import JSON data successfully', () => {
      const jsonData = importer.getSampleJSON();
      const result = importer.importJSON(jsonData);

      expect(result.success).toBe(true);
      expect(result.rows).toBe(5);
      expect(result.columns).toBe(4);
    });

    it('should convert data to chart format', () => {
      const csvData = importer.getSampleCSV();
      const importResult = importer.importCSV(csvData);

      const chartData = importer.toChartData(importResult, 0, [1, 2, 3]);

      expect(chartData.labels.length).toBe(5);
      expect(chartData.datasets.length).toBe(3);
      expect(chartData.datasets[0].label).toBe('Revenue');
      expect(chartData.datasets[1].label).toBe('Expenses');
      expect(chartData.datasets[2].label).toBe('Profit');
    });

    it('should validate data for charting', () => {
      const csvData = importer.getSampleCSV();
      const importResult = importer.importCSV(csvData);

      const validation = importer.validateChartData(importResult);

      expect(validation.valid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    it('should detect data format automatically', () => {
      expect(importer.detectFormat('data.csv')).toBe('csv');
      expect(importer.detectFormat('data.xlsx')).toBe('excel');
      expect(importer.detectFormat('data.json')).toBe('json');
    });

    it('should handle CSV with quoted values', () => {
      const csvWithQuotes = 'Name,Description\n"John, Doe","Product Manager"\n"Jane ""JJ"" Smith","Engineer"';
      const result = importer.importCSV(csvWithQuotes);

      expect(result.success).toBe(true);
      expect(result.data[0][0]).toBe('John, Doe');
      expect(result.data[1][0]).toBe('Jane "JJ" Smith');
    });
  });

  // ============================================================================
  // Scenario 4: Multilingual Presentation
  // ============================================================================

  describe('Scenario 4: Create Multilingual Presentation', () => {
    let i18nManager: I18nManager;

    beforeEach(() => {
      i18nManager = new I18nManager();
    });

    it('should support multiple languages', () => {
      const languages = i18nManager.getSupportedLanguages();

      expect(languages.length).toBeGreaterThan(10);
      expect(languages).toContain('en');
      expect(languages).toContain('es');
      expect(languages).toContain('ar');
    });

    it('should switch languages', () => {
      i18nManager.setLanguage('es');
      expect(i18nManager.getCurrentLanguage()).toBe('es');

      i18nManager.setLanguage('fr');
      expect(i18nManager.getCurrentLanguage()).toBe('fr');
    });

    it('should handle RTL languages', () => {
      // Arabic (RTL)
      i18nManager.setLanguage('ar');
      const arConfig = i18nManager.getLanguageConfig('ar');
      expect(arConfig.direction).toBe('rtl');

      // English (LTR)
      i18nManager.setLanguage('en');
      const enConfig = i18nManager.getLanguageConfig('en');
      expect(enConfig.direction).toBe('ltr');
    });

    it('should format dates by locale', () => {
      const date = new Date('2025-01-15');

      i18nManager.setLanguage('en');
      const enDate = i18nManager.formatDate(date);
      expect(enDate).toContain('01/15/2025');

      i18nManager.setLanguage('es');
      const esDate = i18nManager.formatDate(date);
      expect(esDate).toContain('15/01/2025');
    });

    it('should format currency by locale', () => {
      i18nManager.setLanguage('en');
      const usd = i18nManager.formatCurrency(1000, 'USD');
      expect(usd).toContain('$1,000');

      i18nManager.setLanguage('es');
      const eur = i18nManager.formatCurrency(1000, 'EUR');
      expect(eur).toContain('€1.000');
    });
  });

  // ============================================================================
  // Scenario 5: Live Remote Presentation
  // ============================================================================

  describe('Scenario 5: Live Presentation with Audience Interaction', () => {
    let liveManager: LivePresentationManager;

    beforeEach(() => {
      liveManager = new LivePresentationManager();
    });

    it('should start live session and generate share URL', () => {
      const session = liveManager.startLiveSession('presentation-123', 10, {
        id: 'presenter-1',
        name: 'Alice',
        avatar: 'alice.jpg'
      });

      expect(session).toBeDefined();
      expect(session.id).toBeDefined();
      expect(session.shareUrl).toContain('live/');
      expect(session.totalSlides).toBe(10);
      expect(session.status).toBe('waiting');
    });

    it('should allow attendees to join', () => {
      const session = liveManager.startLiveSession('presentation-123', 10, {
        id: 'presenter-1',
        name: 'Alice'
      });

      const attendeeId1 = liveManager.joinAsAttendee(session.id, 'Bob');
      const attendeeId2 = liveManager.joinAsAttendee(session.id, 'Carol');

      expect(attendeeId1).toBeDefined();
      expect(attendeeId2).toBeDefined();
      expect(session.attendees.size).toBe(2);
    });

    it('should sync slide navigation to all attendees', () => {
      const session = liveManager.startLiveSession('presentation-123', 10, {
        id: 'presenter-1',
        name: 'Alice'
      });

      liveManager.beginPresentation();
      expect(session.status).toBe('active');

      // Presenter navigates to slide 3
      liveManager.goToSlide(3);
      expect(session.currentSlide).toBe(3);

      // Next slide
      liveManager.nextSlide();
      expect(session.currentSlide).toBe(4);

      // Previous slide
      liveManager.previousSlide();
      expect(session.currentSlide).toBe(3);
    });

    it('should handle Q&A with upvoting', () => {
      const session = liveManager.startLiveSession('presentation-123', 10, {
        id: 'presenter-1',
        name: 'Alice'
      });

      const attendee1 = liveManager.joinAsAttendee(session.id, 'Bob');
      const attendee2 = liveManager.joinAsAttendee(session.id, 'Carol');

      // Submit question
      const question = liveManager.submitQuestion(attendee1, 'What is the ROI?');
      expect(question).toBeDefined();
      expect(question!.content).toBe('What is the ROI?');
      expect(question!.upvotes).toBe(0);

      // Other attendees upvote
      liveManager.upvoteQuestion(question!.id, attendee2);
      expect(question!.upvotes).toBe(1);

      // Mark as answered
      liveManager.markQuestionAnswered(question!.id);
      expect(question!.answered).toBe(true);
    });

    it('should run live polls', () => {
      const session = liveManager.startLiveSession('presentation-123', 10, {
        id: 'presenter-1',
        name: 'Alice'
      });

      const attendee1 = liveManager.joinAsAttendee(session.id, 'Bob');
      const attendee2 = liveManager.joinAsAttendee(session.id, 'Carol');

      // Create poll
      const poll = liveManager.createPoll(
        'Which feature is most important?',
        ['Feature A', 'Feature B', 'Feature C'],
        5
      );

      expect(poll.active).toBe(true);
      expect(poll.options.length).toBe(3);

      // Attendees vote
      liveManager.voteInPoll(poll.id, poll.options[1].id, attendee1);
      liveManager.voteInPoll(poll.id, poll.options[1].id, attendee2);

      expect(poll.options[1].votes).toBe(2);

      // Close poll
      liveManager.closePoll(poll.id);
      expect(poll.active).toBe(false);
    });

    it('should provide live statistics', () => {
      const session = liveManager.startLiveSession('presentation-123', 10, {
        id: 'presenter-1',
        name: 'Alice'
      });

      liveManager.joinAsAttendee(session.id, 'Bob');
      liveManager.joinAsAttendee(session.id, 'Carol');
      liveManager.joinAsAttendee(session.id, 'Dave');

      const stats = liveManager.getLiveStats();

      expect(stats.totalAttendees).toBe(3);
      expect(stats.activeViewers).toBe(3);
    });
  });

  // ============================================================================
  // Scenario 6: AI-Enhanced Presentation
  // ============================================================================

  describe('Scenario 6: AI Image Generation', () => {
    let aiGenerator: AIImageGenerationManager;

    beforeEach(() => {
      aiGenerator = new AIImageGenerationManager();
      aiGenerator.setAPIKey('test-api-key');
    });

    it('should generate image from prompt', async () => {
      const result = await aiGenerator.generateImage({
        prompt: 'Modern office with natural lighting',
        style: 'vivid',
        size: '1792x1024',
        quality: 'hd'
      });

      expect(result.success).toBe(true);
      expect(result.images).toBeDefined();
      expect(result.images!.length).toBe(1);
      expect(result.usage).toBeDefined();
    });

    it('should generate images for specific slide types', async () => {
      const heroImage = await aiGenerator.generateForSlideType('hero', 'Team collaboration');
      expect(heroImage.success).toBe(true);
      expect(heroImage.images![0].size).toBe('1792x1024');

      const iconImage = await aiGenerator.generateForSlideType('icon', 'Innovation');
      expect(iconImage.success).toBe(true);
      expect(iconImage.images![0].size).toBe('1024x1024');
    });

    it('should enhance prompts automatically', async () => {
      const result = await aiGenerator.generateWithEnhancedPrompt('solar panels', {
        enhance: true,
        slideContext: 'renewable energy presentation'
      });

      expect(result.success).toBe(true);
    });

    it('should provide prompt suggestions', () => {
      const businessSuggestions = aiGenerator.getPromptSuggestions('business');
      expect(businessSuggestions.length).toBeGreaterThan(5);
      expect(businessSuggestions[0]).toContain('office');

      const techSuggestions = aiGenerator.getPromptSuggestions('tech');
      expect(techSuggestions.length).toBeGreaterThan(5);
      expect(techSuggestions[0]).toContain('AI');
    });

    it('should track generation statistics', async () => {
      await aiGenerator.generateImage({
        prompt: 'Test image 1',
        quality: 'standard',
        size: '1024x1024'
      });

      await aiGenerator.generateImage({
        prompt: 'Test image 2',
        quality: 'hd',
        size: '1792x1024'
      });

      const stats = aiGenerator.getStats();

      expect(stats.totalImages).toBe(2);
      expect(stats.totalCost).toBeGreaterThan(0);
      expect(stats.byQuality['standard']).toBe(1);
      expect(stats.byQuality['hd']).toBe(1);
    });
  });

  // ============================================================================
  // Scenario 7: Mobile Offline Experience
  // ============================================================================

  describe('Scenario 7: Mobile App Offline Access', () => {
    let mobileManager: MobileAppManager;

    beforeEach(() => {
      mobileManager = new MobileAppManager();
    });

    it('should detect device type', () => {
      const deviceType = mobileManager.getDeviceType();
      expect(['mobile', 'tablet', 'desktop']).toContain(deviceType);
    });

    it('should cache presentations for offline use', () => {
      const presentation = {
        id: 'presentation-1',
        title: 'Investor Pitch',
        slides: [{}, {}, {}],
        cachedAt: new Date(),
        size: 5 * 1024 * 1024 // 5 MB
      };

      const cached = mobileManager.cachePresentation(presentation);
      expect(cached).toBe(true);

      const retrieved = mobileManager.getCachedPresentation('presentation-1');
      expect(retrieved).toBeDefined();
      expect(retrieved!.title).toBe('Investor Pitch');
    });

    it('should manage cache size limits', () => {
      // Add presentations until cache is full
      for (let i = 0; i < 20; i++) {
        mobileManager.cachePresentation({
          id: `presentation-${i}`,
          title: `Test ${i}`,
          slides: [],
          cachedAt: new Date(Date.now() - i * 1000),
          size: 8 * 1024 * 1024 // 8 MB each
        });
      }

      const stats = mobileManager.getCacheStats();
      expect(stats.usagePercentage).toBeLessThanOrEqual(100);
    });

    it('should generate deep links', () => {
      const deepLink = mobileManager.generateDeepLink('presentation-123');
      expect(deepLink).toContain('slidedesigner://');
      expect(deepLink).toContain('presentation-123');

      const parsed = mobileManager.parseDeepLink(deepLink);
      expect(parsed).toBeDefined();
      expect(parsed!.type).toBe('presentation');
      expect(parsed!.id).toBe('presentation-123');
    });

    it('should configure mobile app settings', () => {
      const config = mobileManager.getConfig();

      expect(config.name).toBe('SlideDesigner');
      expect(config.features.offline).toBe(true);
      expect(config.features.sync).toBe(true);
      expect(config.features.biometrics).toBe(true);
      expect(config.permissions.camera).toBe(true);
    });
  });

  // ============================================================================
  // Scenario 8: Version Control
  // ============================================================================

  describe('Scenario 8: Version History and Recovery', () => {
    let versionManager: VersionHistoryManager;

    beforeEach(() => {
      versionManager = new VersionHistoryManager();
    });

    it('should create version snapshots', () => {
      const snapshot = {
        title: 'Q4 Business Review',
        slides: [{ id: 'slide-1', content: 'Original content' }],
        metadata: { totalSlides: 1, lastModified: new Date() }
      };

      const version = versionManager.createVersion(snapshot, 'Initial version');

      expect(version).toBeDefined();
      expect(version.description).toBe('Initial version');
      expect(version.snapshot.title).toBe('Q4 Business Review');
    });

    it('should restore previous versions', () => {
      const snapshot1 = {
        title: 'Version 1',
        slides: [{ id: 'slide-1', content: 'V1' }],
        metadata: { totalSlides: 1, lastModified: new Date() }
      };

      const snapshot2 = {
        title: 'Version 2',
        slides: [{ id: 'slide-1', content: 'V2' }],
        metadata: { totalSlides: 1, lastModified: new Date() }
      };

      const v1 = versionManager.createVersion(snapshot1, 'Version 1');
      const v2 = versionManager.createVersion(snapshot2, 'Version 2');

      // Restore v1
      const restored = versionManager.restoreVersion(v1.id);

      expect(restored).toBeDefined();
      expect(restored!.snapshot.title).toBe('Version 1');
    });

    it('should compare versions', () => {
      const snapshot1 = {
        title: 'Original',
        slides: [
          { id: 'slide-1', content: 'Slide 1' },
          { id: 'slide-2', content: 'Slide 2' }
        ],
        metadata: { totalSlides: 2, lastModified: new Date() }
      };

      const snapshot2 = {
        title: 'Modified',
        slides: [
          { id: 'slide-1', content: 'Modified Slide 1' },
          { id: 'slide-3', content: 'New Slide 3' }
        ],
        metadata: { totalSlides: 2, lastModified: new Date() }
      };

      const v1 = versionManager.createVersion(snapshot1, 'V1');
      const v2 = versionManager.createVersion(snapshot2, 'V2');

      const diff = versionManager.compareVersions(v1.id, v2.id);

      expect(diff).toBeDefined();
      expect(diff!.slidesAdded).toBe(1);
      expect(diff!.slidesRemoved).toBe(1);
      expect(diff!.slidesModified).toBe(1);
    });

    it('should list all versions', () => {
      for (let i = 0; i < 5; i++) {
        versionManager.createVersion({
          title: `Version ${i}`,
          slides: [],
          metadata: { totalSlides: 0, lastModified: new Date() }
        }, `Description ${i}`);
      }

      const versions = versionManager.getAllVersions();
      expect(versions.length).toBe(5);

      // Should be sorted by date (newest first)
      expect(versions[0].createdAt.getTime()).toBeGreaterThanOrEqual(
        versions[versions.length - 1].createdAt.getTime()
      );
    });
  });

  // ============================================================================
  // Scenario 9: Accessibility Validation
  // ============================================================================

  describe('Scenario 9: Accessibility Features', () => {

    it('should validate background pattern contrast', () => {
      const library = new BackgroundPatternLibrary();
      const patterns = library.getAllPatterns();

      // All patterns should have low default opacity (subtle)
      patterns.forEach(pattern => {
        expect(pattern.defaultOpacity).toBeLessThanOrEqual(0.1);
      });
    });

    it('should provide keyboard navigation for slide manager', () => {
      const manager = new SlideManager([
        { id: 'slide-1', order: 0, html: '', content: {}, metadata: { createdAt: new Date(), updatedAt: new Date() } },
        { id: 'slide-2', order: 1, html: '', content: {}, metadata: { createdAt: new Date(), updatedAt: new Date() } },
        { id: 'slide-3', order: 2, html: '', content: {}, metadata: { createdAt: new Date(), updatedAt: new Date() } }
      ]);

      // Simulate keyboard reordering (moving slide down)
      manager.moveSlide(0, 1); // Move first slide to second position

      const slides = manager.getAllSlides();
      expect(slides[0].id).toBe('slide-2');
      expect(slides[1].id).toBe('slide-1');
      expect(slides[2].id).toBe('slide-3');
    });

    it('should support undo/redo for accessibility', () => {
      const manager = new SlideManager([
        { id: 'slide-1', order: 0, html: '', content: {}, metadata: { createdAt: new Date(), updatedAt: new Date() } }
      ]);

      // Delete slide
      manager.addSlide({
        id: 'slide-2',
        order: 1,
        html: '',
        content: {},
        metadata: { createdAt: new Date(), updatedAt: new Date() }
      });

      expect(manager.getSlideCount()).toBe(2);
      expect(manager.canUndo()).toBe(true);

      // Undo
      manager.undo();
      expect(manager.getSlideCount()).toBe(1);

      // Redo
      expect(manager.canRedo()).toBe(true);
      manager.redo();
      expect(manager.getSlideCount()).toBe(2);
    });
  });

  // ============================================================================
  // Scenario 10: Analytics and Iteration
  // ============================================================================

  describe('Scenario 10: Presentation Analytics', () => {
    let analytics: PresentationAnalyticsManager;

    beforeEach(() => {
      analytics = new PresentationAnalyticsManager();
    });

    it('should track presentation session', () => {
      const sessionId = analytics.startSession(10, {
        id: 'viewer-1',
        name: 'John Doe',
        email: 'john@example.com',
        location: 'US'
      });

      expect(sessionId).toBeDefined();

      const session = analytics.getSessionMetrics(sessionId);
      expect(session).toBeDefined();
      expect(session!.totalSlides).toBe(10);
      expect(session!.viewer?.name).toBe('John Doe');
    });

    it('should track slide views and time', () => {
      const sessionId = analytics.startSession(5);

      // Viewer looks at slide 1 for 30 seconds
      analytics.trackSlideView(1, 30);
      analytics.trackSlideView(2, 45);
      analytics.trackSlideView(3, 20);

      const session = analytics.getSessionMetrics(sessionId);
      expect(session!.slidesViewed).toBe(3);

      const slide1Metrics = session!.slideMetrics[0];
      expect(slide1Metrics.viewCount).toBe(1);
      expect(slide1Metrics.totalTimeSpent).toBe(30);
    });

    it('should track interactions', () => {
      const sessionId = analytics.startSession(5);

      analytics.trackInteraction('link_click', { slideNumber: 3, url: 'https://example.com' });
      analytics.trackInteraction('video_play', { slideNumber: 4, videoId: 'abc123' });

      const session = analytics.getSessionMetrics(sessionId);
      expect(session!.slideMetrics[2].interactions).toBe(1);
      expect(session!.slideMetrics[3].interactions).toBe(1);
    });

    it('should generate analytics summary', () => {
      // Create multiple sessions
      for (let i = 0; i < 3; i++) {
        const sessionId = analytics.startSession(5);
        analytics.trackSlideView(1, 10);
        analytics.trackSlideView(2, 15);
        analytics.trackSlideView(3, 20);
        analytics.endSession(sessionId);
      }

      const summary = analytics.getSummary();

      expect(summary.totalSessions).toBe(3);
      expect(summary.totalViews).toBeGreaterThan(0);
      expect(summary.averageDuration).toBeGreaterThan(0);
      expect(summary.topSlides.length).toBeGreaterThan(0);
    });

    it('should provide funnel analysis', () => {
      const sessionId = analytics.startSession(5);

      analytics.trackSlideView(1, 10);
      analytics.trackSlideView(2, 15);
      analytics.trackSlideView(3, 20);
      // Viewer drops off after slide 3
      analytics.endSession(sessionId);

      const funnel = analytics.getFunnelAnalysis();

      expect(funnel.length).toBe(5);
      expect(funnel[0].viewers).toBeGreaterThanOrEqual(funnel[2].viewers);
    });

    it('should export analytics data', () => {
      const sessionId = analytics.startSession(3);
      analytics.trackSlideView(1, 10);
      analytics.endSession(sessionId);

      const jsonExport = analytics.export('json');
      expect(jsonExport).toContain('sessions');
      expect(jsonExport).toContain('events');

      const csvExport = analytics.export('csv');
      expect(csvExport).toContain('Session ID');
      expect(csvExport).toContain('Duration');
    });
  });

  // ============================================================================
  // Performance and Integration Tests
  // ============================================================================

  describe('Performance Tests', () => {

    it('should handle large template library efficiently', () => {
      const library = new TemplateLibrary();

      const startTime = Date.now();

      // Perform multiple operations
      library.getAllTemplates();
      library.search('business');
      library.getByCategory('pitch');
      library.getPopular(10);

      const duration = Date.now() - startTime;

      // Should complete in < 50ms
      expect(duration).toBeLessThan(50);
    });

    it('should handle concurrent collaboration efficiently', () => {
      const manager = new CollaborationManager();
      const session = manager.startSession('presentation-123', {
        id: 'user-1',
        name: 'Alice',
        email: 'alice@example.com',
        color: '#FF6B6B',
        role: 'owner'
      });

      const startTime = Date.now();

      // Simulate 50 rapid operations
      for (let i = 0; i < 50; i++) {
        manager.addComment('slide-1', 1, `Comment ${i}`);
        manager.updatePresence({ slideNumber: Math.floor(Math.random() * 10) + 1 });
      }

      const duration = Date.now() - startTime;

      // Should handle 50 operations in < 100ms
      expect(duration).toBeLessThan(100);
    });

    it('should import large CSV files efficiently', () => {
      const importer = new DataImportManager();

      // Generate large CSV (1000 rows)
      let csvData = 'Month,Revenue,Expenses,Profit\n';
      for (let i = 0; i < 1000; i++) {
        csvData += `Month${i},${10000 + i},${5000 + i},${5000}\n`;
      }

      const startTime = Date.now();
      const result = importer.importCSV(csvData);
      const duration = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(result.rows).toBe(1000);

      // Should import 1000 rows in < 100ms
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Integration Tests - Combined Workflows', () => {

    it('should support template + collaboration workflow', () => {
      // User selects template
      const library = new TemplateLibrary();
      const template = library.getTemplate('startup-pitch-deck')!;

      // User starts collaboration
      const collab = new CollaborationManager();
      const session = collab.startSession(template.id, {
        id: 'user-1',
        name: 'Alice',
        email: 'alice@example.com',
        color: '#FF6B6B',
        role: 'owner'
      });

      // Team member joins
      collab.joinSession(session.id, {
        id: 'user-2',
        name: 'Bob',
        email: 'bob@example.com',
        color: '#4ECDC4',
        role: 'editor'
      });

      // Add comments on template slides
      template.slides.forEach((slide, index) => {
        collab.addComment(`slide-${slide.order}`, slide.order + 1, `Feedback on ${slide.type} slide`);
      });

      const stats = collab.getStats();
      expect(stats.totalComments).toBe(template.slides.length);
    });

    it('should support data import + analytics workflow', () => {
      // Import data
      const importer = new DataImportManager();
      const csvData = importer.getSampleCSV();
      const importResult = importer.importCSV(csvData);

      // Start analytics session
      const analytics = new PresentationAnalyticsManager();
      const sessionId = analytics.startSession(5);

      // Track slides with data
      analytics.trackSlideView(1, 20); // Title
      analytics.trackSlideView(2, 45); // Chart slide (longer view)
      analytics.trackSlideView(3, 30); // Another chart
      analytics.trackInteraction('link_click', { slideNumber: 2 });

      analytics.endSession(sessionId);

      // Analyze engagement
      const slideEngagement = analytics.getSlideEngagement(2);
      expect(slideEngagement.totalViews).toBe(1);
      expect(slideEngagement.averageTime).toBe(45);
    });

    it('should support mobile + offline + sync workflow', () => {
      const mobile = new MobileAppManager();

      // Cache presentation for offline
      const cached = mobile.cachePresentation({
        id: 'presentation-1',
        title: 'Sales Deck',
        slides: [{}, {}, {}, {}],
        cachedAt: new Date(),
        size: 3 * 1024 * 1024
      });

      expect(cached).toBe(true);

      // Simulate offline viewing
      const retrieved = mobile.getCachedPresentation('presentation-1');
      expect(retrieved).toBeDefined();

      // Check cache stats
      const stats = mobile.getCacheStats();
      expect(stats.totalCached).toBe(1);
      expect(stats.currentSize).toBeGreaterThan(0);
    });
  });
});

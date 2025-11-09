/**
 * Schema Drift Detection Tests
 *
 * These tests detect when backend response shapes change unexpectedly.
 * They use snapshot-style testing to catch silent breaking changes that
 * might not be caught by type checking alone.
 *
 * Purpose:
 * - Detect changes in response object structures
 * - Catch additions/removals of fields
 * - Prevent silent breaking changes
 * - Document expected data shapes
 *
 * Run: npm run test:schema-drift
 */

// Set dummy GEMINI_API_KEY if not provided (required by some modules at load time)
if (!process.env.GEMINI_API_KEY) {
  process.env.GEMINI_API_KEY = 'test-api-key-for-schema-drift';
}

import { describe, test, expect, beforeAll } from '@jest/globals';
import {
  SlideDesignerIntegration,
  P0Integration,
  P1Integration,
  P2Integration,
  generatePresentation,
} from '../../src/slide-designer/index';

describe('Schema Drift Detection', () => {

  describe('SlideGenerationResult Schema', () => {

    test('should have stable top-level structure', async () => {
      // Skip if GEMINI_API_KEY not set
      if (!process.env.GEMINI_API_KEY) {
        console.warn('⚠ Skipping schema drift test - GEMINI_API_KEY not set');
        return;
      }

      const result = await generatePresentation('Test Topic', {
        slideCount: 3,
        tone: 'formal',
        includeImages: false,
      });

      // Verify exact keys (order-independent)
      const keys = Object.keys(result).sort();
      expect(keys).toEqual([
        'html',
        'metadata',
        'outline',
        'slides',
        'theme',
      ].sort());
    });

    test('Slide objects should have stable structure', async () => {
      if (!process.env.GEMINI_API_KEY) {
        console.warn('⚠ Skipping schema drift test - GEMINI_API_KEY not set');
        return;
      }

      const result = await generatePresentation('Test Topic', {
        slideCount: 2,
        includeImages: false,
      });

      expect(result.slides.length).toBeGreaterThan(0);

      const slide = result.slides[0];
      const slideKeys = Object.keys(slide).sort();

      // Core required fields
      expect(slideKeys).toContain('id');
      expect(slideKeys).toContain('title');
      expect(slideKeys).toContain('content');
      expect(slideKeys).toContain('layout');
      expect(slideKeys).toContain('theme');
      expect(slideKeys).toContain('metadata');

      // Verify types
      expect(typeof slide.id).toBe('string');
      expect(typeof slide.title).toBe('string');
      expect(typeof slide.content).toBe('string');
      expect(typeof slide.layout).toBe('string');
      expect(typeof slide.theme).toBe('object');
      expect(typeof slide.metadata).toBe('object');
    });

    test('SlideMetadata should have stable structure', async () => {
      if (!process.env.GEMINI_API_KEY) {
        console.warn('⚠ Skipping schema drift test - GEMINI_API_KEY not set');
        return;
      }

      const result = await generatePresentation('Test Topic', {
        slideCount: 2,
      });

      const metadata = result.slides[0].metadata;

      expect(metadata).toHaveProperty('order');
      expect(typeof metadata.order).toBe('number');

      // Optional fields may or may not be present
      if ('duration' in metadata) {
        expect(typeof metadata.duration).toBe('number');
      }
      if ('transitions' in metadata) {
        expect(typeof metadata.transitions).toBe('string');
      }
    });

    test('Theme should have stable structure', async () => {
      if (!process.env.GEMINI_API_KEY) {
        console.warn('⚠ Skipping schema drift test - GEMINI_API_KEY not set');
        return;
      }

      const result = await generatePresentation('Test Topic', {
        slideCount: 1,
      });

      const theme = result.theme;

      expect(theme).toHaveProperty('name');
      expect(theme).toHaveProperty('colors');
      expect(theme).toHaveProperty('typography');
      expect(theme).toHaveProperty('spacing');

      // ColorScheme structure
      const colors = theme.colors;
      expect(colors).toHaveProperty('primary');
      expect(colors).toHaveProperty('secondary');
      expect(colors).toHaveProperty('background');
      expect(colors).toHaveProperty('text');

      // Typography structure
      const typography = theme.typography;
      expect(typography).toHaveProperty('fontFamily');
      expect(typography).toHaveProperty('baseSize');
      expect(typography).toHaveProperty('lineHeight');
      expect(typography).toHaveProperty('headingSizes');
      expect(typography).toHaveProperty('weights');
    });

    test('GenerationMetadata should have stable structure', async () => {
      if (!process.env.GEMINI_API_KEY) {
        console.warn('⚠ Skipping schema drift test - GEMINI_API_KEY not set');
        return;
      }

      const result = await generatePresentation('Test Topic', {
        slideCount: 2,
      });

      const metadata = result.metadata;

      expect(metadata).toHaveProperty('generatedAt');
      expect(metadata).toHaveProperty('totalSlides');
      expect(metadata).toHaveProperty('totalAssets');
      expect(metadata).toHaveProperty('processingTime');
      expect(metadata).toHaveProperty('version');

      expect(metadata.generatedAt).toBeInstanceOf(Date);
      expect(typeof metadata.totalSlides).toBe('number');
      expect(typeof metadata.totalAssets).toBe('number');
      expect(typeof metadata.processingTime).toBe('number');
      expect(typeof metadata.version).toBe('string');
    });
  });

  describe('CombinedInitializationResult Schema', () => {

    test('should have stable structure', async () => {
      SlideDesignerIntegration.resetInstance();
      const integration = SlideDesignerIntegration.getInstance();

      const result = await integration.initialize();

      // Top-level keys
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('p0');
      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('message');

      expect(typeof result.success).toBe('boolean');
      expect(typeof result.duration).toBe('number');
      expect(typeof result.message).toBe('string');

      // P0 result structure
      expect(result.p0).toHaveProperty('success');
      expect(result.p0).toHaveProperty('initialized');
      expect(result.p0).toHaveProperty('failed');
      expect(result.p0).toHaveProperty('degraded');
      expect(result.p0).toHaveProperty('duration');

      expect(Array.isArray(result.p0.initialized)).toBe(true);
      expect(Array.isArray(result.p0.failed)).toBe(true);
      expect(Array.isArray(result.p0.degraded)).toBe(true);
    });
  });

  describe('CombinedHealthReport Schema', () => {

    test('should have stable structure', () => {
      const integration = SlideDesignerIntegration.getInstance();
      const health = integration.getHealthReport();

      // Top-level structure
      const healthKeys = Object.keys(health).sort();
      expect(healthKeys).toEqual([
        'overallHealth',
        'p0',
        'p1',
        'p2',
        'summary',
        'timestamp',
      ].sort());

      // Overall health
      expect(['healthy', 'degraded', 'critical']).toContain(health.overallHealth);

      // Timestamp
      expect(health.timestamp).toBeInstanceOf(Date);

      // Summary structure
      expect(health.summary).toHaveProperty('totalFeatures');
      expect(health.summary).toHaveProperty('readyFeatures');
      expect(health.summary).toHaveProperty('degradedFeatures');
      expect(health.summary).toHaveProperty('failedFeatures');
      expect(health.summary).toHaveProperty('disabledFeatures');
      expect(health.summary).toHaveProperty('lazyLoadingFeatures');

      // All summary values should be numbers
      Object.values(health.summary).forEach(value => {
        expect(typeof value).toBe('number');
      });
    });

    test('P0 health report should have stable structure', () => {
      const integration = SlideDesignerIntegration.getInstance();
      const health = integration.getHealthReport();

      const p0Report = health.p0;

      expect(p0Report).toHaveProperty('overallHealth');
      expect(p0Report).toHaveProperty('features');
      expect(p0Report).toHaveProperty('summary');
      expect(p0Report).toHaveProperty('timestamp');

      // Summary structure
      expect(p0Report.summary).toHaveProperty('total');
      expect(p0Report.summary).toHaveProperty('ready');
      expect(p0Report.summary).toHaveProperty('degraded');
      expect(p0Report.summary).toHaveProperty('failed');

      // Features should be an object
      expect(typeof p0Report.features).toBe('object');
    });
  });

  describe('P0 Feature Info Schema', () => {

    test('getFeature should return consistent objects', () => {
      const p0 = P0Integration.getInstance();

      // Test one feature to verify structure
      const featureStatus = p0.getFeatureStatus('grid-layout');

      expect(['ready', 'degraded', 'failed', 'pending']).toContain(featureStatus);
    });
  });

  describe('Error Object Schema', () => {

    test('SlideDesignerError should have stable structure', () => {
      const { SlideDesignerError } = require('../../src/slide-designer/index');

      const error = new SlideDesignerError('Test', 'CODE', { detail: 'test' });

      expect(error).toHaveProperty('message');
      expect(error).toHaveProperty('code');
      expect(error).toHaveProperty('details');
      expect(error).toHaveProperty('name');
      expect(error).toHaveProperty('stack');

      expect(typeof error.message).toBe('string');
      expect(typeof error.code).toBe('string');
      expect(typeof error.details).toBe('object');
      expect(error.name).toBe('SlideDesignerError');
    });

    test('GeminiAPIError should have stable structure', () => {
      const { GeminiAPIError } = require('../../src/slide-designer/index');

      const error = new GeminiAPIError('API Error', { status: 500 });

      expect(error).toHaveProperty('message');
      expect(error).toHaveProperty('code');
      expect(error).toHaveProperty('details');
      expect(error.code).toBe('GEMINI_API_ERROR');
    });
  });

  describe('Configuration Object Schema', () => {

    test('THEMES should have stable structure', () => {
      const { THEMES } = require('../../src/slide-designer/index');

      expect(typeof THEMES).toBe('object');
      expect(Object.keys(THEMES).length).toBeGreaterThan(0);

      // Check one theme structure
      const firstTheme = Object.values(THEMES)[0] as any;
      expect(firstTheme).toHaveProperty('name');
      expect(firstTheme).toHaveProperty('colors');
      expect(firstTheme).toHaveProperty('typography');
      expect(firstTheme).toHaveProperty('spacing');
    });
  });

  describe('Version Constants Schema', () => {

    test('VERSION should be valid semver', () => {
      const { VERSION } = require('../../src/slide-designer/index');

      expect(typeof VERSION).toBe('string');
      expect(VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });

    test('NAME should be constant string', () => {
      const { NAME } = require('../../src/slide-designer/index');

      expect(typeof NAME).toBe('string');
      expect(NAME).toBe('Agentic Slide Designer');
    });
  });
});

describe('Field Addition/Removal Detection', () => {

  test('Slide interface should not have unexpected fields', async () => {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠ Skipping schema drift test - GEMINI_API_KEY not set');
      return;
    }

    const result = await generatePresentation('Test', { slideCount: 1 });
    const slide = result.slides[0];

    // Expected fields only
    const expectedFields = new Set([
      'id',
      'title',
      'content',
      'layout',
      'theme',
      'metadata',
      'assets', // Optional
    ]);

    const actualFields = Object.keys(slide);

    actualFields.forEach(field => {
      expect(expectedFields.has(field)).toBe(true);
    });
  });

  test('CombinedHealthReport should not have unexpected fields', () => {
    const integration = SlideDesignerIntegration.getInstance();
    const health = integration.getHealthReport();

    const expectedFields = new Set([
      'overallHealth',
      'p0',
      'p1',
      'p2',
      'timestamp',
      'summary',
    ]);

    const actualFields = Object.keys(health);

    actualFields.forEach(field => {
      expect(expectedFields.has(field)).toBe(true);
    });
  });
});

describe('Backward Compatibility', () => {

  test('Old code using P0Integration should still work', async () => {
    // Simulate old client code
    const integration = P0Integration.getInstance();
    await integration.initialize();

    // Old methods should still exist
    expect(integration.getFeature).toBeDefined();
    expect(integration.getFeatureStatus).toBeDefined();
    expect(integration.getHealthReport).toBeDefined();
    expect(integration.isHealthy).toBeDefined();
  });

  test('Old code using generatePresentation should still work', async () => {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠ Skipping schema drift test - GEMINI_API_KEY not set');
      return;
    }

    // Old-style call with just topic
    const result1 = await generatePresentation('Test Topic');
    expect(result1).toHaveProperty('slides');

    // Old-style call with options
    const result2 = await generatePresentation('Test Topic', {
      slideCount: 3,
      tone: 'formal',
    });
    expect(result2).toHaveProperty('slides');
  });
});

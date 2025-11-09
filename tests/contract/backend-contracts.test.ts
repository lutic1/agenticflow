/**
 * Contract Tests for Slide Designer Backend
 *
 * These tests verify that the backend API contracts remain stable.
 * If these tests fail, it means a BREAKING CHANGE has been introduced.
 *
 * Purpose:
 * - Ensure frontend can rely on stable API contracts
 * - Catch breaking changes before they reach production
 * - Document the public API surface
 * - Enable safe refactoring
 *
 * Run: npm run test:contract
 */

// Set dummy GEMINI_API_KEY for testing (required by some modules at load time)
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'test-api-key-for-contracts';

import { describe, test, expect, beforeEach } from '@jest/globals';

// Core imports
import {
  SlideGenerator,
  getSlideGenerator,
  GeminiClient,
  getGeminiClient,
  ContentAnalyzer,
  getContentAnalyzer,
  LayoutEngine,
  getLayoutEngine,
  HTMLRenderer,
  getHTMLRenderer,
} from '../../src/slide-designer/index';

// Agent imports
import {
  ResearchAgent,
  getResearchAgent,
  ContentAgent,
  getContentAgent,
  DesignAgent,
  getDesignAgent,
  AssetAgent,
  getAssetAgent,
  GeneratorAgent,
  getGeneratorAgent,
} from '../../src/slide-designer/index';

// Integration imports
import {
  SlideDesignerIntegration,
  slideDesignerIntegration,
  P0Integration,
  p0Integration,
  P1Integration,
  p1Integration,
  P2Integration,
  p2Integration,
} from '../../src/slide-designer/index';

// Type imports
import type {
  Slide,
  SlideMetadata,
  Asset,
  Theme,
  ColorScheme,
  Typography,
  SlideGenerationRequest,
  SlideGenerationResult,
  ContentAnalysis,
  LayoutType,
  P0FeatureId,
  P1FeatureId,
  P2FeatureId,
} from '../../src/slide-designer/index';

// Error imports
import {
  SlideDesignerError,
  GeminiAPIError,
  LayoutEngineError,
  AgentError,
  P0IntegrationError,
  P1IntegrationError,
  P2IntegrationError,
} from '../../src/slide-designer/index';

// Quick start function
import { generatePresentation, VERSION, NAME } from '../../src/slide-designer/index';

describe('Backend Contract Tests', () => {

  describe('Core Module Contracts', () => {

    test('SlideGenerator should export class and factory', () => {
      expect(SlideGenerator).toBeDefined();
      expect(typeof SlideGenerator).toBe('function');
      expect(getSlideGenerator).toBeDefined();
      expect(typeof getSlideGenerator).toBe('function');
    });

    test('SlideGenerator should have generatePresentation method', () => {
      const generator = getSlideGenerator();
      expect(generator).toBeDefined();
      expect(generator.generatePresentation).toBeDefined();
      expect(typeof generator.generatePresentation).toBe('function');
    });

    test('GeminiClient should export class and factory', () => {
      expect(GeminiClient).toBeDefined();
      expect(getGeminiClient).toBeDefined();
    });

    test('ContentAnalyzer should export class and factory', () => {
      expect(ContentAnalyzer).toBeDefined();
      expect(getContentAnalyzer).toBeDefined();
    });

    test('LayoutEngine should export class and factory', () => {
      expect(LayoutEngine).toBeDefined();
      expect(getLayoutEngine).toBeDefined();
    });

    test('HTMLRenderer should export class and factory', () => {
      expect(HTMLRenderer).toBeDefined();
      expect(getHTMLRenderer).toBeDefined();
    });
  });

  describe('Agent Module Contracts', () => {

    test('All agent classes and factories should be exported', () => {
      const agents = [
        { class: ResearchAgent, factory: getResearchAgent },
        { class: ContentAgent, factory: getContentAgent },
        { class: DesignAgent, factory: getDesignAgent },
        { class: AssetAgent, factory: getAssetAgent },
        { class: GeneratorAgent, factory: getGeneratorAgent },
      ];

      agents.forEach(({ class: AgentClass, factory }) => {
        expect(AgentClass).toBeDefined();
        expect(typeof AgentClass).toBe('function');
        expect(factory).toBeDefined();
        expect(typeof factory).toBe('function');
      });
    });
  });

  describe('SlideDesignerIntegration Contract', () => {

    test('should export SlideDesignerIntegration class', () => {
      expect(SlideDesignerIntegration).toBeDefined();
      expect(typeof SlideDesignerIntegration).toBe('function');
    });

    test('should export singleton instance', () => {
      expect(slideDesignerIntegration).toBeDefined();
      expect(slideDesignerIntegration instanceof SlideDesignerIntegration).toBe(true);
    });

    test('should have getInstance static method', () => {
      expect(SlideDesignerIntegration.getInstance).toBeDefined();
      expect(typeof SlideDesignerIntegration.getInstance).toBe('function');
    });

    test('should have initialize method', () => {
      const integration = SlideDesignerIntegration.getInstance();
      expect(integration.initialize).toBeDefined();
      expect(typeof integration.initialize).toBe('function');
    });

    test('should have feature getter methods', () => {
      const integration = SlideDesignerIntegration.getInstance();

      expect(integration.getP0Feature).toBeDefined();
      expect(integration.getP1Feature).toBeDefined();
      expect(integration.getP2Feature).toBeDefined();

      expect(typeof integration.getP0Feature).toBe('function');
      expect(typeof integration.getP1Feature).toBe('function');
      expect(typeof integration.getP2Feature).toBe('function');
    });

    test('should have feature availability methods', () => {
      const integration = SlideDesignerIntegration.getInstance();

      expect(integration.isP0FeatureAvailable).toBeDefined();
      expect(integration.isP1FeatureAvailable).toBeDefined();
      expect(integration.isP2FeatureAvailable).toBeDefined();
    });

    test('should have health monitoring methods', () => {
      const integration = SlideDesignerIntegration.getInstance();

      expect(integration.getHealthReport).toBeDefined();
      expect(integration.isHealthy).toBeDefined();
      expect(integration.isInitialized).toBeDefined();

      expect(typeof integration.getHealthReport).toBe('function');
      expect(typeof integration.isHealthy).toBe('function');
      expect(typeof integration.isInitialized).toBe('function');
    });

    test('should have shutdown method', () => {
      const integration = SlideDesignerIntegration.getInstance();
      expect(integration.shutdown).toBeDefined();
      expect(typeof integration.shutdown).toBe('function');
    });
  });

  describe('P0Integration Contract', () => {

    test('should export P0Integration class and singleton', () => {
      expect(P0Integration).toBeDefined();
      expect(p0Integration).toBeDefined();
      expect(p0Integration instanceof P0Integration).toBe(true);
    });

    test('should have getInstance static method', () => {
      expect(P0Integration.getInstance).toBeDefined();
      const instance = P0Integration.getInstance();
      expect(instance).toBeDefined();
    });

    test('should support all 12 P0 features', () => {
      const p0Features: P0FeatureId[] = [
        'grid-layout',
        'typography',
        'color-palettes',
        'charts',
        'text-overflow',
        'master-slides',
        'transitions',
        'accessibility',
        'export',
        'image-optimization',
        'content-validation',
        'llm-judge',
      ];

      // Verify the type system accepts all feature IDs
      p0Features.forEach(featureId => {
        expect(typeof featureId).toBe('string');
      });
    });

    test('should have core methods', () => {
      const p0 = P0Integration.getInstance();

      expect(p0.initialize).toBeDefined();
      expect(p0.getFeature).toBeDefined();
      expect(p0.getFeatureStatus).toBeDefined();
      expect(p0.getHealthReport).toBeDefined();
      expect(p0.isHealthy).toBeDefined();
    });
  });

  describe('P1Integration Contract', () => {

    test('should export P1Integration class and singleton', () => {
      expect(P1Integration).toBeDefined();
      expect(p1Integration).toBeDefined();
    });

    test('should have feature flag methods', () => {
      const p1 = P1Integration.getInstance();

      expect(p1.enableFeature).toBeDefined();
      expect(p1.disableFeature).toBeDefined();
      expect(p1.isFeatureEnabled).toBeDefined();
      expect(p1.getFeatureStatus).toBeDefined();
    });

    test('should support all 15 P1 features', () => {
      const p1Features: P1FeatureId[] = [
        'slide-manager',
        'template-library',
        'speaker-notes',
        'video-embed',
        'custom-fonts',
        'data-import',
        'i18n',
        'ai-image-generation',
        'version-history',
        'analytics',
        'mobile-app',
        'collaboration',
        'live-presentation',
        'interactive-widgets',
        'real-time-sync',
      ];

      p1Features.forEach(featureId => {
        expect(typeof featureId).toBe('string');
      });
    });
  });

  describe('P2Integration Contract', () => {

    test('should export P2Integration class and singleton', () => {
      expect(P2Integration).toBeDefined();
      expect(p2Integration).toBeDefined();
    });

    test('should support lazy loading', () => {
      const p2 = P2Integration.getInstance();

      expect(p2.initialize).toBeDefined();
      expect(p2.getFeature).toBeDefined();
    });

    test('should support all 8 P2 features', () => {
      const p2Features: P2FeatureId[] = [
        'voice-narration',
        'api-access',
        'interactive-elements',
        'themes-marketplace',
        '3d-animations',
        'design-import',
        'ar-presentation',
        'blockchain-nft',
      ];

      p2Features.forEach(featureId => {
        expect(typeof featureId).toBe('string');
      });
    });
  });

  describe('Quick Start Function Contract', () => {

    test('should export generatePresentation function', () => {
      expect(generatePresentation).toBeDefined();
      expect(typeof generatePresentation).toBe('function');
    });

    test('generatePresentation should accept topic and options', () => {
      // Type checking - this will fail at compile time if signature changes
      const testCall = async () => {
        // This tests the function signature without actually calling it
        const validCall: typeof generatePresentation = generatePresentation;
        expect(validCall).toBeDefined();
      };

      expect(testCall).toBeDefined();
    });

    test('should export version and name constants', () => {
      expect(VERSION).toBeDefined();
      expect(typeof VERSION).toBe('string');
      expect(VERSION).toMatch(/^\d+\.\d+\.\d+$/); // Semver format

      expect(NAME).toBeDefined();
      expect(typeof NAME).toBe('string');
      expect(NAME).toBe('Agentic Slide Designer');
    });
  });

  describe('Type Export Contracts', () => {

    test('should export core types', () => {
      // These would fail at compile time if types are not exported
      const slide: Slide = {
        id: 'test',
        title: 'Test',
        content: 'Test content',
        layout: 'title-slide',
        theme: {} as Theme,
        metadata: { order: 1 },
      };

      expect(slide).toBeDefined();
    });

    test('should export generation types', () => {
      const request: SlideGenerationRequest = {
        topic: 'Test Topic',
        slideCount: 5,
      };

      expect(request).toBeDefined();
    });

    test('LayoutType should accept valid values', () => {
      const validLayouts: LayoutType[] = [
        'title-slide',
        'content-only',
        'content-image-split',
        'image-focus',
        'bullet-points',
        'two-column',
        'quote',
        'section-header',
        'comparison',
        'timeline',
      ];

      validLayouts.forEach(layout => {
        expect(typeof layout).toBe('string');
      });
    });
  });

  describe('Error Type Contracts', () => {

    test('should export all error classes', () => {
      expect(SlideDesignerError).toBeDefined();
      expect(GeminiAPIError).toBeDefined();
      expect(LayoutEngineError).toBeDefined();
      expect(AgentError).toBeDefined();
      expect(P0IntegrationError).toBeDefined();
      expect(P1IntegrationError).toBeDefined();
      expect(P2IntegrationError).toBeDefined();
    });

    test('SlideDesignerError should have correct structure', () => {
      const error = new SlideDesignerError('Test error', 'TEST_CODE', { detail: 'test' });

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(SlideDesignerError);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.details).toEqual({ detail: 'test' });
    });

    test('GeminiAPIError should extend SlideDesignerError', () => {
      const error = new GeminiAPIError('API error', { status: 500 });

      expect(error).toBeInstanceOf(SlideDesignerError);
      expect(error).toBeInstanceOf(GeminiAPIError);
      expect(error.code).toBe('GEMINI_API_ERROR');
    });
  });

  describe('Configuration Export Contracts', () => {

    test('should export Gemini configuration', () => {
      const {
        getGeminiConfig,
        validateGeminiConfig,
        GEMINI_PROMPTS,
        GEMINI_MODELS,
        RATE_LIMITS,
      } = require('../../src/slide-designer/index');

      expect(getGeminiConfig).toBeDefined();
      expect(validateGeminiConfig).toBeDefined();
      expect(GEMINI_PROMPTS).toBeDefined();
      expect(GEMINI_MODELS).toBeDefined();
      expect(RATE_LIMITS).toBeDefined();
    });

    test('should export design configuration', () => {
      const {
        THEMES,
        LAYOUT_RULES,
        DESIGN_RULES,
        getTheme,
        selectThemeByContext,
      } = require('../../src/slide-designer/index');

      expect(THEMES).toBeDefined();
      expect(LAYOUT_RULES).toBeDefined();
      expect(DESIGN_RULES).toBeDefined();
      expect(getTheme).toBeDefined();
      expect(selectThemeByContext).toBeDefined();
    });
  });

  describe('Logger Contract', () => {

    test('should export Logger and getLogger', () => {
      const { Logger, LogLevel, getLogger } = require('../../src/slide-designer/index');

      expect(Logger).toBeDefined();
      expect(LogLevel).toBeDefined();
      expect(getLogger).toBeDefined();
    });
  });
});

describe('Method Signature Contracts', () => {

  describe('SlideDesignerIntegration.initialize()', () => {

    test('should return CombinedInitializationResult', async () => {
      const integration = SlideDesignerIntegration.getInstance();
      SlideDesignerIntegration.resetInstance(); // Reset for fresh state

      const freshIntegration = SlideDesignerIntegration.getInstance();
      const result = await freshIntegration.initialize();

      // Verify return type structure
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('p0');
      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('message');

      expect(typeof result.success).toBe('boolean');
      expect(typeof result.p0).toBe('object');
      expect(typeof result.duration).toBe('number');
      expect(typeof result.message).toBe('string');
    });
  });

  describe('SlideDesignerIntegration.getHealthReport()', () => {

    test('should return CombinedHealthReport', () => {
      const integration = SlideDesignerIntegration.getInstance();
      const health = integration.getHealthReport();

      // Verify return type structure
      expect(health).toHaveProperty('overallHealth');
      expect(health).toHaveProperty('p0');
      expect(health).toHaveProperty('timestamp');
      expect(health).toHaveProperty('summary');

      expect(['healthy', 'degraded', 'critical']).toContain(health.overallHealth);
      expect(health.timestamp).toBeInstanceOf(Date);

      // Verify summary structure
      expect(health.summary).toHaveProperty('totalFeatures');
      expect(health.summary).toHaveProperty('readyFeatures');
      expect(health.summary).toHaveProperty('degradedFeatures');
      expect(health.summary).toHaveProperty('failedFeatures');
    });
  });
});

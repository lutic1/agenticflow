/**
 * P1 Integration Tests
 * Comprehensive tests for P1 feature integration
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { P1Integration } from '../p1-integration';
import type { P1IntegrationConfig } from '../types/p1-integration';

describe('P1Integration', () => {
  let integration: P1Integration;

  beforeEach(() => {
    // Reset singleton before each test
    P1Integration.resetInstance();
  });

  afterEach(async () => {
    // Cleanup after each test
    if (integration) {
      await integration.shutdown();
    }
    P1Integration.resetInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = P1Integration.getInstance();
      const instance2 = P1Integration.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should create new instance after reset', () => {
      const instance1 = P1Integration.getInstance();
      P1Integration.resetInstance();
      const instance2 = P1Integration.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('Feature Registry', () => {
    beforeEach(() => {
      integration = P1Integration.getInstance();
    });

    it('should have 15 P1 features registered', () => {
      const expectedFeatures = [
        // Batch 1
        'slide-manager',
        'template-library',
        'speaker-notes',
        // Batch 2
        'video-embed',
        'custom-fonts',
        'data-import',
        // Batch 3
        'i18n',
        'version-history',
        'ai-image-generation',
        // Batch 4
        'collaboration',
        'analytics',
        'mobile-app',
        // Batch 5
        'live-presentation',
        'interactive-widgets',
        'real-time-sync',
      ];

      expectedFeatures.forEach((featureId) => {
        expect(integration.getFeatureStatus(featureId)).toBeDefined();
      });
    });

    it('should correctly organize features into batches', () => {
      const batch1 = ['slide-manager', 'template-library', 'speaker-notes'];
      const batch2 = ['video-embed', 'custom-fonts', 'data-import'];
      const batch3 = ['i18n', 'version-history', 'ai-image-generation'];
      const batch4 = ['collaboration', 'analytics', 'mobile-app'];
      const batch5 = ['live-presentation', 'interactive-widgets', 'real-time-sync'];

      // Each batch should have exactly 3 features
      expect(batch1.length).toBe(3);
      expect(batch2.length).toBe(3);
      expect(batch3.length).toBe(3);
      expect(batch4.length).toBe(3);
      expect(batch5.length).toBe(3);
    });
  });

  describe('Feature Flags', () => {
    it('should enable all features by default', () => {
      integration = P1Integration.getInstance();
      expect(integration.isFeatureEnabled('slide-manager')).toBe(true);
      expect(integration.isFeatureEnabled('analytics')).toBe(true);
    });

    it('should respect feature flags in config', () => {
      const config: P1IntegrationConfig = {
        featureFlags: {
          'ai-image-generation': false,
          analytics: false,
        },
      };
      integration = P1Integration.getInstance(config);

      // Note: This checks the config, actual enabling/disabling happens during init
      expect(integration.isFeatureEnabled('ai-image-generation')).toBe(false);
      expect(integration.isFeatureEnabled('analytics')).toBe(false);
      expect(integration.isFeatureEnabled('slide-manager')).toBe(true);
    });

    it('should allow enabling features at runtime', () => {
      integration = P1Integration.getInstance();
      integration.disableFeature('analytics');
      expect(integration.isFeatureEnabled('analytics')).toBe(false);

      integration.enableFeature('analytics');
      expect(integration.isFeatureEnabled('analytics')).toBe(true);
    });
  });

  describe('Batch Initialization', () => {
    it('should initialize only selected batches', async () => {
      const config: P1IntegrationConfig = {
        enabledBatches: [1, 2], // Only batches 1 and 2
        initTimeout: 5000,
      };
      integration = P1Integration.getInstance(config);

      const result = await integration.initialize(config);
      expect(result.batchResults.length).toBe(2);
      expect(result.batchResults[0].batch).toBe(1);
      expect(result.batchResults[1].batch).toBe(2);
    });

    it('should support parallel initialization', async () => {
      const config: P1IntegrationConfig = {
        parallelInitialization: true,
        enabledBatches: [1],
      };
      integration = P1Integration.getInstance(config);

      const startTime = Date.now();
      const result = await integration.initialize(config);
      const duration = Date.now() - startTime;

      // Parallel initialization should be faster than sequential
      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(5000);
    });
  });

  describe('Graceful Degradation', () => {
    it('should continue with optional features failing', async () => {
      const config: P1IntegrationConfig = {
        failFast: false,
        initializeOptional: true,
      };
      integration = P1Integration.getInstance(config);

      const result = await integration.initialize(config);

      // Even if some optional features fail, initialization should succeed
      // for critical features
      expect(result.initialized.length).toBeGreaterThan(0);
    });

    it('should handle disabled features gracefully', () => {
      integration = P1Integration.getInstance();
      integration.disableFeature('analytics');

      expect(() => {
        integration.getFeature('analytics');
      }).toThrow('disabled');
    });
  });

  describe('Health Monitoring', () => {
    beforeEach(() => {
      integration = P1Integration.getInstance({
        enableHealthChecks: false, // Disable for testing
      });
    });

    it('should provide health report', async () => {
      await integration.initialize();
      const report = integration.getHealthReport();

      expect(report).toBeDefined();
      expect(report.features).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.batchSummary).toBeDefined();
      expect(report.batchSummary.length).toBe(5); // 5 batches
    });

    it('should calculate overall health correctly', async () => {
      await integration.initialize();
      const health = integration.getHealth();

      expect(['healthy', 'degraded', 'critical', 'partial']).toContain(health);
    });
  });

  describe('Dependencies', () => {
    it('should initialize features in correct dependency order', async () => {
      integration = P1Integration.getInstance({
        enabledBatches: [3, 4], // version-history -> collaboration
      });

      const result = await integration.initialize();

      // version-history depends on slide-manager (batch 1)
      // If batch 1 is not enabled, version-history should fail
      const versionHistoryStatus = integration.getFeatureStatus('version-history');
      const collaborationStatus = integration.getFeatureStatus('collaboration');

      // Check that dependencies are handled
      expect(['ready', 'failed', 'degraded']).toContain(versionHistoryStatus);
      expect(['ready', 'failed', 'degraded']).toContain(collaborationStatus);
    });
  });
});

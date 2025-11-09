/**
 * Combined Integration Tests
 * Tests for the combined P0 + P1 integration
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { SlideDesignerIntegration } from '../integration';
import type { SlideDesignerIntegrationConfig } from '../integration';

describe('SlideDesignerIntegration', () => {
  let integration: SlideDesignerIntegration;

  beforeEach(() => {
    SlideDesignerIntegration.resetInstance();
  });

  afterEach(async () => {
    if (integration) {
      await integration.shutdown();
    }
    SlideDesignerIntegration.resetInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = SlideDesignerIntegration.getInstance();
      const instance2 = SlideDesignerIntegration.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('P0 + P1 Integration', () => {
    it('should initialize both P0 and P1 features', async () => {
      integration = SlideDesignerIntegration.getInstance();
      const result = await integration.initialize();

      expect(result.p0).toBeDefined();
      expect(result.p1).toBeDefined();
      expect(result.message).toBeDefined();
    });

    it('should work with P0 only when P1 is disabled', async () => {
      const config: SlideDesignerIntegrationConfig = {
        enableP1Features: false,
      };
      integration = SlideDesignerIntegration.getInstance(config);
      const result = await integration.initialize();

      expect(result.p0).toBeDefined();
      expect(result.p1).toBeUndefined();
      expect(result.p0.initialized.length).toBeGreaterThan(0);
    });

    it('should continue with P1 even if P0 has issues when configured', async () => {
      const config: SlideDesignerIntegrationConfig = {
        continueOnP0Failure: true,
        p0: {
          failFast: false,
        },
      };
      integration = SlideDesignerIntegration.getInstance(config);
      const result = await integration.initialize();

      // Even with P0 issues, P1 initialization should be attempted
      expect(result.p1).toBeDefined();
    });
  });

  describe('Feature Access', () => {
    beforeEach(async () => {
      integration = SlideDesignerIntegration.getInstance();
      await integration.initialize();
    });

    it('should allow access to P0 features', () => {
      expect(() => {
        integration.getP0Feature('grid-layout');
      }).not.toThrow();
    });

    it('should allow access to P1 features when enabled', () => {
      if (integration.isP1FeatureAvailable('slide-manager')) {
        expect(() => {
          integration.getP1Feature('slide-manager');
        }).not.toThrow();
      }
    });

    it('should check P1 feature availability', () => {
      const isAvailable = integration.isP1FeatureAvailable('analytics');
      expect(typeof isAvailable).toBe('boolean');
    });
  });

  describe('Health Reporting', () => {
    beforeEach(async () => {
      integration = SlideDesignerIntegration.getInstance({
        p0: { enableHealthChecks: false },
        p1: { enableHealthChecks: false },
      });
      await integration.initialize();
    });

    it('should provide combined health report', () => {
      const report = integration.getHealthReport();

      expect(report.p0).toBeDefined();
      expect(report.p1).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.overallHealth).toBeDefined();
    });

    it('should calculate overall health from both P0 and P1', () => {
      const health = integration.getHealthReport().overallHealth;
      expect(['healthy', 'degraded', 'critical']).toContain(health);
    });

    it('should aggregate feature counts correctly', () => {
      const report = integration.getHealthReport();
      const { summary } = report;

      expect(summary.totalFeatures).toBeGreaterThan(0);
      expect(summary.readyFeatures).toBeGreaterThanOrEqual(0);
      expect(summary.degradedFeatures).toBeGreaterThanOrEqual(0);
      expect(summary.failedFeatures).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Runtime Feature Management', () => {
    beforeEach(async () => {
      integration = SlideDesignerIntegration.getInstance();
      await integration.initialize();
    });

    it('should allow enabling P1 features at runtime', () => {
      expect(() => {
        integration.enableP1Feature('analytics');
      }).not.toThrow();
    });

    it('should allow disabling P1 features at runtime', () => {
      expect(() => {
        integration.disableP1Feature('analytics');
      }).not.toThrow();
    });

    it('should throw when accessing disabled P1 globally', () => {
      const integrationNoP1 = SlideDesignerIntegration.getInstance({
        enableP1Features: false,
      });

      expect(() => {
        integrationNoP1.enableP1Feature('analytics');
      }).toThrow('disabled globally');
    });
  });

  describe('Graceful Degradation', () => {
    it('should work with P0 features even if P1 fails completely', async () => {
      const config: SlideDesignerIntegrationConfig = {
        continueOnP0Failure: false,
        p0: {
          failFast: false,
        },
        p1: {
          failFast: false,
        },
      };
      integration = SlideDesignerIntegration.getInstance(config);
      const result = await integration.initialize();

      // P0 features should be available
      expect(result.p0.initialized.length).toBeGreaterThan(0);
    });

    it('should provide meaningful status messages', async () => {
      integration = SlideDesignerIntegration.getInstance();
      const result = await integration.initialize();

      expect(result.message).toBeTruthy();
      expect(result.message.length).toBeGreaterThan(0);
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });
  });
});

/**
 * Slide Designer Integration Module
 *
 * This is the main integration module that combines P0 (core) and P1 (advanced)
 * features with graceful degradation. P0 features will continue to work even if
 * P1 features fail to initialize.
 *
 * Architecture:
 * - P0: 12 core features (grid, typography, charts, etc.)
 * - P1: 15 advanced features (collaboration, analytics, mobile, etc.)
 * - Graceful degradation: P0 works independently
 * - Feature flags: Granular control over P1 features
 * - Health monitoring: Real-time status of all features
 *
 * @module integration
 */

import { P0Integration, p0Integration } from './p0-integration';
import { P1Integration, p1Integration } from './p1-integration';

import type {
  P0FeatureId,
  FeatureStatus,
  IntegrationHealth,
  P0IntegrationConfig,
  InitializationResult,
  IntegrationHealthReport,
} from './types/p0-integration';

import type {
  P1FeatureId,
  P1FeatureStatus,
  P1IntegrationHealth,
  P1IntegrationConfig,
  P1InitializationResult,
  P1IntegrationHealthReport,
} from './types/p1-integration';

/**
 * Combined feature ID type (P0 or P1)
 */
export type FeatureId = P0FeatureId | P1FeatureId;

/**
 * Configuration for the combined integration
 */
export interface SlideDesignerIntegrationConfig {
  /**
   * P0 (core) feature configuration
   */
  p0?: P0IntegrationConfig;

  /**
   * P1 (advanced) feature configuration
   */
  p1?: P1IntegrationConfig;

  /**
   * Whether to continue initializing P1 if P0 fails
   * @default false - P1 depends on P0 being healthy
   */
  continueOnP0Failure?: boolean;

  /**
   * Whether to initialize P1 features at all
   * @default true
   */
  enableP1Features?: boolean;
}

/**
 * Combined initialization result
 */
export interface CombinedInitializationResult {
  success: boolean;
  p0: InitializationResult;
  p1?: P1InitializationResult;
  duration: number;
  message: string;
}

/**
 * Combined health report
 */
export interface CombinedHealthReport {
  overallHealth: 'healthy' | 'degraded' | 'critical';
  p0: IntegrationHealthReport;
  p1?: P1IntegrationHealthReport;
  timestamp: Date;
  summary: {
    totalFeatures: number;
    readyFeatures: number;
    degradedFeatures: number;
    failedFeatures: number;
    disabledFeatures: number;
  };
}

/**
 * SlideDesignerIntegration manages both P0 and P1 features with:
 * - Graceful degradation (P0 works even if P1 fails)
 * - Feature flags for granular control
 * - Comprehensive health monitoring
 * - Independent initialization of P0 and P1
 *
 * @example
 * ```typescript
 * import { slideDesignerIntegration } from './integration';
 *
 * // Initialize all features
 * const result = await slideDesignerIntegration.initialize();
 * console.log(result.message);
 *
 * // Check overall health
 * const health = slideDesignerIntegration.getHealthReport();
 * console.log('Overall health:', health.overallHealth);
 *
 * // Get P0 feature
 * const gridLayout = slideDesignerIntegration.getP0Feature('grid-layout');
 *
 * // Get P1 feature (if enabled and ready)
 * if (slideDesignerIntegration.isP1FeatureAvailable('analytics')) {
 *   const analytics = slideDesignerIntegration.getP1Feature('analytics');
 * }
 * ```
 */
export class SlideDesignerIntegration {
  private static instance: SlideDesignerIntegration | null = null;
  private config: SlideDesignerIntegrationConfig;
  private p0Instance: P0Integration;
  private p1Instance: P1Integration;
  private initialized = false;

  /**
   * Private constructor - use getInstance() instead
   */
  private constructor(config: SlideDesignerIntegrationConfig = {}) {
    this.config = {
      continueOnP0Failure: false,
      enableP1Features: true,
      ...config,
    };

    this.p0Instance = P0Integration.getInstance(config.p0);
    this.p1Instance = P1Integration.getInstance(config.p1);
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(
    config?: SlideDesignerIntegrationConfig
  ): SlideDesignerIntegration {
    if (!SlideDesignerIntegration.instance) {
      SlideDesignerIntegration.instance = new SlideDesignerIntegration(config);
    }
    return SlideDesignerIntegration.instance;
  }

  /**
   * Reset the singleton instance (mainly for testing)
   */
  public static resetInstance(): void {
    P0Integration.resetInstance();
    P1Integration.resetInstance();
    SlideDesignerIntegration.instance = null;
  }

  /**
   * Initialize all features (P0 first, then P1)
   *
   * P0 features are initialized first as they are core functionality.
   * If P0 fails and continueOnP0Failure is false, P1 will not be initialized.
   * This ensures graceful degradation where P0 works independently.
   *
   * @returns Combined initialization result
   */
  public async initialize(
    overrideConfig?: Partial<SlideDesignerIntegrationConfig>
  ): Promise<CombinedInitializationResult> {
    const startTime = Date.now();
    const config = { ...this.config, ...overrideConfig };

    const result: CombinedInitializationResult = {
      success: false,
      p0: {
        success: false,
        initialized: [],
        failed: [],
        degraded: [],
        duration: 0,
      },
      duration: 0,
      message: '',
    };

    try {
      // Step 1: Initialize P0 (core) features
      console.log('Initializing P0 (core) features...');
      result.p0 = await this.p0Instance.initialize();

      if (result.p0.success) {
        console.log(`✓ P0 initialization successful (${result.p0.initialized.length} features)`);
      } else {
        console.warn(`⚠ P0 initialization completed with issues`);
        if (result.p0.failed.length > 0) {
          console.warn(`  Failed features: ${result.p0.failed.map(f => f.featureId).join(', ')}`);
        }
      }

      // Step 2: Initialize P1 (advanced) features if enabled
      if (config.enableP1Features) {
        // Check if we should continue with P1
        const canInitializeP1 = result.p0.success || config.continueOnP0Failure;

        if (canInitializeP1) {
          console.log('Initializing P1 (advanced) features...');
          result.p1 = await this.p1Instance.initialize(config.p1);

          if (result.p1.success) {
            console.log(
              `✓ P1 initialization successful (${result.p1.initialized.length} features)`
            );
          } else {
            console.warn(`⚠ P1 initialization completed with issues`);
            if (result.p1.failed.length > 0) {
              console.warn(
                `  Failed features: ${result.p1.failed.map(f => f.featureId).join(', ')}`
              );
            }
          }
        } else {
          console.warn('⚠ Skipping P1 initialization due to P0 failures');
          result.message =
            'P0 initialization failed. P1 features not initialized. System running in degraded mode.';
        }
      } else {
        console.log('P1 features disabled by configuration');
      }

      // Determine overall success
      result.success = result.p0.success && (result.p1?.success ?? true);
      result.duration = Date.now() - startTime;

      // Generate summary message
      result.message = this.generateInitializationMessage(result);

      this.initialized = true;
      return result;
    } catch (error) {
      result.duration = Date.now() - startTime;
      result.success = false;
      result.message = `Initialization failed: ${error instanceof Error ? error.message : String(error)}`;
      throw error;
    }
  }

  /**
   * Generate a human-readable initialization message
   */
  private generateInitializationMessage(result: CombinedInitializationResult): string {
    const p0Ready = result.p0.initialized.length;
    const p1Ready = result.p1?.initialized.length ?? 0;
    const totalReady = p0Ready + p1Ready;

    const p0Total = 12; // Total P0 features
    const p1Total = 15; // Total P1 features
    const totalFeatures = p0Total + (this.config.enableP1Features ? p1Total : 0);

    if (result.success) {
      return `✓ Slide Designer fully initialized: ${totalReady}/${totalFeatures} features ready`;
    } else if (result.p0.success) {
      return `⚠ Slide Designer initialized with degraded P1: ${totalReady}/${totalFeatures} features ready (P0: ${p0Ready}/${p0Total}, P1: ${p1Ready}/${p1Total})`;
    } else {
      return `✗ Slide Designer initialization incomplete: ${totalReady}/${totalFeatures} features ready (P0: ${p0Ready}/${p0Total}, P1: ${p1Ready}/${p1Total})`;
    }
  }

  /**
   * Get a P0 (core) feature instance
   */
  public getP0Feature<T = any>(featureId: P0FeatureId): T {
    return this.p0Instance.getFeature<T>(featureId);
  }

  /**
   * Get a P1 (advanced) feature instance
   */
  public getP1Feature<T = any>(featureId: P1FeatureId): T {
    if (!this.config.enableP1Features) {
      throw new Error('P1 features are disabled');
    }
    return this.p1Instance.getFeature<T>(featureId);
  }

  /**
   * Check if a P1 feature is available (enabled and ready)
   */
  public isP1FeatureAvailable(featureId: P1FeatureId): boolean {
    if (!this.config.enableP1Features) {
      return false;
    }
    return (
      this.p1Instance.isFeatureEnabled(featureId) &&
      this.p1Instance.getFeatureStatus(featureId) === 'ready'
    );
  }

  /**
   * Check if a P0 feature is available (ready)
   */
  public isP0FeatureAvailable(featureId: P0FeatureId): boolean {
    return this.p0Instance.getFeatureStatus(featureId) === 'ready';
  }

  /**
   * Enable a P1 feature at runtime
   */
  public enableP1Feature(featureId: P1FeatureId): void {
    if (!this.config.enableP1Features) {
      throw new Error('P1 features are disabled globally');
    }
    this.p1Instance.enableFeature(featureId);
  }

  /**
   * Disable a P1 feature at runtime
   */
  public disableP1Feature(featureId: P1FeatureId): void {
    this.p1Instance.disableFeature(featureId);
  }

  /**
   * Get comprehensive health report for all features
   */
  public getHealthReport(): CombinedHealthReport {
    const p0Report = this.p0Instance.getHealthReport();
    const p1Report = this.config.enableP1Features
      ? this.p1Instance.getHealthReport()
      : undefined;

    const summary = {
      totalFeatures: p0Report.summary.total + (p1Report?.summary.total ?? 0),
      readyFeatures: p0Report.summary.ready + (p1Report?.summary.ready ?? 0),
      degradedFeatures: p0Report.summary.degraded + (p1Report?.summary.degraded ?? 0),
      failedFeatures: p0Report.summary.failed + (p1Report?.summary.failed ?? 0),
      disabledFeatures: p1Report?.summary.disabled ?? 0,
    };

    // Determine overall health
    let overallHealth: 'healthy' | 'degraded' | 'critical';
    if (p0Report.overallHealth === 'critical') {
      overallHealth = 'critical';
    } else if (
      p0Report.overallHealth === 'degraded' ||
      p1Report?.overallHealth === 'critical' ||
      p1Report?.overallHealth === 'degraded'
    ) {
      overallHealth = 'degraded';
    } else {
      overallHealth = 'healthy';
    }

    return {
      overallHealth,
      p0: p0Report,
      p1: p1Report,
      timestamp: new Date(),
      summary,
    };
  }

  /**
   * Check if the entire integration is healthy
   */
  public isHealthy(): boolean {
    const p0Healthy = this.p0Instance.isHealthy();
    const p1Healthy = this.config.enableP1Features ? this.p1Instance.isHealthy() : true;
    return p0Healthy && p1Healthy;
  }

  /**
   * Check if integration is initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get P0 integration instance (for advanced use)
   */
  public getP0Integration(): P0Integration {
    return this.p0Instance;
  }

  /**
   * Get P1 integration instance (for advanced use)
   */
  public getP1Integration(): P1Integration {
    return this.p1Instance;
  }

  /**
   * Shutdown the integration and cleanup resources
   */
  public async shutdown(): Promise<void> {
    await Promise.all([this.p0Instance.shutdown(), this.p1Instance.shutdown()]);
    this.initialized = false;
  }
}

/**
 * Singleton instance of SlideDesignerIntegration
 * Use this for easy access throughout the application
 *
 * @example
 * ```typescript
 * import { slideDesignerIntegration } from './integration';
 *
 * // Initialize all features
 * await slideDesignerIntegration.initialize();
 *
 * // Get P0 core feature
 * const gridLayout = slideDesignerIntegration.getP0Feature('grid-layout');
 *
 * // Get P1 advanced feature (if available)
 * if (slideDesignerIntegration.isP1FeatureAvailable('analytics')) {
 *   const analytics = slideDesignerIntegration.getP1Feature('analytics');
 * }
 *
 * // Check health
 * const report = slideDesignerIntegration.getHealthReport();
 * console.log('System health:', report.overallHealth);
 * console.log('P0 features:', report.p0.summary);
 * console.log('P1 features:', report.p1?.summary);
 * ```
 */
export const slideDesignerIntegration = SlideDesignerIntegration.getInstance();

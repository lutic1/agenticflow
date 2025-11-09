/**
 * Slide Designer Integration Module
 *
 * This is the main integration module that combines P0 (core), P1 (advanced),
 * and P2 (nice-to-have) features with graceful degradation. P0 features will
 * continue to work even if P1/P2 features fail to initialize.
 *
 * Architecture:
 * - P0: 12 core features (grid, typography, charts, etc.)
 * - P1: 15 advanced features (collaboration, analytics, mobile, etc.)
 * - P2: 8 nice-to-have features (AR, 3D, blockchain, etc.)
 * - Graceful degradation: P0 works independently, P0+P1 work without P2
 * - Feature flags: Granular control over P1/P2 features
 * - Health monitoring: Real-time status of all features
 * - Lazy loading: Heavy dependencies loaded on demand (P2)
 *
 * @module integration
 */

import { P0Integration, p0Integration } from './p0-integration';
import { P1Integration, p1Integration } from './p1-integration';
import { P2Integration, p2Integration } from './p2-integration';

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

import type {
  P2FeatureId,
  P2FeatureStatus,
  P2IntegrationHealth,
  P2IntegrationConfig,
  P2InitializationResult,
  P2IntegrationHealthReport,
} from './types/p2-integration';

/**
 * Combined feature ID type (P0, P1, or P2)
 */
export type FeatureId = P0FeatureId | P1FeatureId | P2FeatureId;

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
   * P2 (nice-to-have) feature configuration
   */
  p2?: P2IntegrationConfig;

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

  /**
   * Whether to initialize P2 features at all
   * @default true
   */
  enableP2Features?: boolean;
}

/**
 * Combined initialization result
 */
export interface CombinedInitializationResult {
  success: boolean;
  p0: InitializationResult;
  p1?: P1InitializationResult;
  p2?: P2InitializationResult;
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
  p2?: P2IntegrationHealthReport;
  timestamp: Date;
  summary: {
    totalFeatures: number;
    readyFeatures: number;
    degradedFeatures: number;
    failedFeatures: number;
    disabledFeatures: number;
    lazyLoadingFeatures: number;
  };
}

/**
 * SlideDesignerIntegration manages P0, P1, and P2 features with:
 * - Graceful degradation (P0 works even if P1/P2 fail)
 * - Feature flags for granular control
 * - Comprehensive health monitoring
 * - Independent initialization of P0, P1, and P2
 * - Lazy loading for heavy P2 dependencies
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
 *
 * // Get P2 feature (if enabled and ready)
 * if (slideDesignerIntegration.isP2FeatureAvailable('voice-narration')) {
 *   const voiceNarration = slideDesignerIntegration.getP2Feature('voice-narration');
 * }
 * ```
 */
export class SlideDesignerIntegration {
  private static instance: SlideDesignerIntegration | null = null;
  private config: SlideDesignerIntegrationConfig;
  private p0Instance: P0Integration;
  private p1Instance: P1Integration;
  private p2Instance: P2Integration;
  private initialized = false;

  /**
   * Private constructor - use getInstance() instead
   */
  private constructor(config: SlideDesignerIntegrationConfig = {}) {
    this.config = {
      continueOnP0Failure: false,
      enableP1Features: true,
      enableP2Features: true,
      ...config,
    };

    this.p0Instance = P0Integration.getInstance(config.p0);
    this.p1Instance = P1Integration.getInstance(config.p1);
    this.p2Instance = P2Integration.getInstance(config.p2);
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
    P2Integration.resetInstance();
    SlideDesignerIntegration.instance = null;
  }

  /**
   * Initialize all features (P0 first, then P1, then P2)
   *
   * P0 features are initialized first as they are core functionality.
   * P1 features are initialized next if P0 succeeds (or continueOnP0Failure is true).
   * P2 features are initialized last and always independently.
   * This ensures graceful degradation where P0 works independently, and P0+P1 work without P2.
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
        }
      } else {
        console.log('P1 features disabled by configuration');
      }

      // Step 3: Initialize P2 (nice-to-have) features if enabled
      // P2 initialization is always independent and never blocks P0/P1
      if (config.enableP2Features) {
        console.log('Initializing P2 (nice-to-have) features...');
        try {
          result.p2 = await this.p2Instance.initialize(config.p2);

          if (result.p2.success) {
            console.log(
              `✓ P2 initialization successful (${result.p2.initialized.length} features)`
            );
            if (result.p2.lazyLoaded.length > 0) {
              console.log(
                `  Lazy loaded: ${result.p2.lazyLoaded.join(', ')}`
              );
            }
          } else {
            console.warn(`⚠ P2 initialization completed with issues`);
            if (result.p2.failed.length > 0) {
              console.warn(
                `  Failed features: ${result.p2.failed.map(f => f.featureId).join(', ')}`
              );
            }
          }
        } catch (error) {
          // P2 failures should never break P0/P1
          console.warn('⚠ P2 initialization failed (P0/P1 unaffected):', error);
          result.p2 = {
            success: false,
            initialized: [],
            failed: [],
            degraded: [],
            disabled: [],
            lazyLoaded: [],
            duration: 0,
            batchResults: [],
          };
        }
      } else {
        console.log('P2 features disabled by configuration');
      }

      // Determine overall success (P2 failures don't affect overall success)
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
    const p2Ready = result.p2?.initialized.length ?? 0;
    const totalReady = p0Ready + p1Ready + p2Ready;

    const p0Total = 12; // Total P0 features
    const p1Total = 15; // Total P1 features
    const p2Total = 8;  // Total P2 features
    let totalFeatures = p0Total;
    if (this.config.enableP1Features) totalFeatures += p1Total;
    if (this.config.enableP2Features) totalFeatures += p2Total;

    const parts: string[] = [`P0: ${p0Ready}/${p0Total}`];
    if (this.config.enableP1Features) parts.push(`P1: ${p1Ready}/${p1Total}`);
    if (this.config.enableP2Features) parts.push(`P2: ${p2Ready}/${p2Total}`);

    if (result.success) {
      return `✓ Slide Designer fully initialized: ${totalReady}/${totalFeatures} features ready (${parts.join(', ')})`;
    } else if (result.p0.success) {
      return `⚠ Slide Designer initialized with degraded features: ${totalReady}/${totalFeatures} features ready (${parts.join(', ')})`;
    } else {
      return `✗ Slide Designer initialization incomplete: ${totalReady}/${totalFeatures} features ready (${parts.join(', ')})`;
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
   * Get a P2 (nice-to-have) feature instance
   */
  public getP2Feature<T = any>(featureId: P2FeatureId): T {
    if (!this.config.enableP2Features) {
      throw new Error('P2 features are disabled');
    }
    return this.p2Instance.getFeature<T>(featureId);
  }

  /**
   * Check if a P2 feature is available (enabled and ready)
   */
  public isP2FeatureAvailable(featureId: P2FeatureId): boolean {
    if (!this.config.enableP2Features) {
      return false;
    }
    return (
      this.p2Instance.isFeatureEnabled(featureId) &&
      this.p2Instance.getFeatureStatus(featureId) === 'ready'
    );
  }

  /**
   * Enable a P2 feature at runtime
   */
  public enableP2Feature(featureId: P2FeatureId): void {
    if (!this.config.enableP2Features) {
      throw new Error('P2 features are disabled globally');
    }
    this.p2Instance.enableFeature(featureId);
  }

  /**
   * Disable a P2 feature at runtime
   */
  public disableP2Feature(featureId: P2FeatureId): void {
    this.p2Instance.disableFeature(featureId);
  }

  /**
   * Get comprehensive health report for all features
   */
  public getHealthReport(): CombinedHealthReport {
    const p0Report = this.p0Instance.getHealthReport();
    const p1Report = this.config.enableP1Features
      ? this.p1Instance.getHealthReport()
      : undefined;
    const p2Report = this.config.enableP2Features
      ? this.p2Instance.getHealthReport()
      : undefined;

    const summary = {
      totalFeatures:
        p0Report.summary.total +
        (p1Report?.summary.total ?? 0) +
        (p2Report?.summary.total ?? 0),
      readyFeatures:
        p0Report.summary.ready +
        (p1Report?.summary.ready ?? 0) +
        (p2Report?.summary.ready ?? 0),
      degradedFeatures:
        p0Report.summary.degraded +
        (p1Report?.summary.degraded ?? 0) +
        (p2Report?.summary.degraded ?? 0),
      failedFeatures:
        p0Report.summary.failed +
        (p1Report?.summary.failed ?? 0) +
        (p2Report?.summary.failed ?? 0),
      disabledFeatures:
        (p1Report?.summary.disabled ?? 0) +
        (p2Report?.summary.disabled ?? 0),
      lazyLoadingFeatures: p2Report?.summary.lazyLoading ?? 0,
    };

    // Determine overall health (P2 failures don't affect overall health)
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
      p2: p2Report,
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
   * Get P2 integration instance (for advanced use)
   */
  public getP2Integration(): P2Integration {
    return this.p2Instance;
  }

  /**
   * Shutdown the integration and cleanup resources
   */
  public async shutdown(): Promise<void> {
    await Promise.all([
      this.p0Instance.shutdown(),
      this.p1Instance.shutdown(),
      this.p2Instance.shutdown(),
    ]);
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
 * // Initialize all features (P0 + P1 + P2)
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
 * // Get P2 nice-to-have feature (if available)
 * if (slideDesignerIntegration.isP2FeatureAvailable('voice-narration')) {
 *   const voiceNarration = slideDesignerIntegration.getP2Feature('voice-narration');
 * }
 *
 * // Check health
 * const report = slideDesignerIntegration.getHealthReport();
 * console.log('System health:', report.overallHealth);
 * console.log('P0 features:', report.p0.summary);
 * console.log('P1 features:', report.p1?.summary);
 * console.log('P2 features:', report.p2?.summary);
 * ```
 */
export const slideDesignerIntegration = SlideDesignerIntegration.getInstance();

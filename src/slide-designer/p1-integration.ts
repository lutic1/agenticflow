/**
 * P1 Integration Module
 *
 * This module provides a unified integration layer for all 15 P1 (Priority 1)
 * features of the Slide Designer. It extends the P0 integration with:
 * - Batch initialization (5 batches, 3 features each)
 * - Feature flags for granular control
 * - Graceful degradation (P0 works if P1 fails)
 * - Enhanced health monitoring
 * - Parallel initialization within batches
 *
 * The 15 P1 Features (organized in 5 batches):
 *
 * Batch 1: Core Management
 * - P1.3: Speaker Notes UI
 * - P1.4: Slide Duplication & Reordering
 * - P1.5: Template Library (20 pre-built decks)
 *
 * Batch 2: Media & Data
 * - P1.7: Video Embed Support
 * - P1.8: Custom Font Upload
 * - P1.12: Data Import (CSV, Excel, JSON)
 *
 * Batch 3: Internationalization & AI
 * - P1.6: Multi-Language Support (i18n)
 * - P1.10: Version History
 * - P1.11: AI Image Generation (DALL-E 3)
 *
 * Batch 4: Analytics & Mobile
 * - P1.9: Collaboration Features
 * - P1.13: Presentation Analytics
 * - P1.14: Mobile App (React Native)
 *
 * Batch 5: Live & Interactive
 * - P1.15: Live Presentation Mode
 * - P1.1: Interactive Widgets
 * - P1.2: Real-time Sync
 *
 * @module p1-integration
 */

import {
  SlideManager,
  getGlobalSlideManager,
  TemplateLibrary,
  templateLibrary,
  SpeakerNotesManager,
  speakerNotesManager,
  VideoEmbedManager,
  videoEmbedManager,
  CustomFontManager,
  customFontManager,
  DataImportManager,
  dataImportManager,
  I18nManager,
  i18n,
  VersionHistoryManager,
  versionHistory,
  AIImageGenerationManager,
  aiImageGenerator,
  CollaborationManager,
  collaborationManager,
  PresentationAnalyticsManager,
  presentationAnalytics,
  MobileAppManager,
  mobileAppManager,
  LivePresentationManager,
  livePresentationManager,
} from './features';

import type {
  P1FeatureId,
  P1FeatureInfo,
  P1FeatureStatus,
  P1IntegrationHealth,
  P1IntegrationConfig,
  P1InitializationResult,
  P1FeatureHealthCheck,
  P1IntegrationHealthReport,
  BatchResult,
} from './types/p1-integration';

import {
  P1IntegrationError,
  P1FeatureInitializationError,
  P1DependencyError,
  P1HealthCheckError,
  P1FeatureDisabledError,
} from './types/p1-integration';

/**
 * Default configuration for P1 integration
 */
const DEFAULT_P1_CONFIG: Required<P1IntegrationConfig> = {
  failFast: false,
  initializeOptional: true,
  initTimeout: 10000, // P1 features may need more time
  enableHealthChecks: true,
  healthCheckInterval: 120000, // 2 minutes
  featureFlags: {} as Record<P1FeatureId, boolean>,
  enabledBatches: [1, 2, 3, 4, 5],
  parallelInitialization: true,
  onError: () => {},
  onStatusChange: () => {},
  onFeatureToggle: () => {},
};

/**
 * P1Integration class manages all 15 P1 features with:
 * - Batch initialization for organized loading
 * - Feature flags for granular control
 * - Health monitoring and graceful degradation
 * - Independence from P0 (P0 works even if P1 fails)
 *
 * @example
 * ```typescript
 * const integration = P1Integration.getInstance();
 *
 * // Initialize all P1 features
 * await integration.initialize();
 *
 * // Initialize specific batches only
 * await integration.initialize({ enabledBatches: [1, 2] });
 *
 * // Check if a feature is enabled
 * if (integration.isFeatureEnabled('analytics')) {
 *   const analytics = integration.getFeature('analytics');
 * }
 *
 * // Disable a feature at runtime
 * integration.disableFeature('ai-image-generation');
 * ```
 */
export class P1Integration {
  private static instance: P1Integration | null = null;
  private features: Map<P1FeatureId, P1FeatureInfo> = new Map();
  private config: Required<P1IntegrationConfig>;
  private healthCheckTimer?: NodeJS.Timeout;
  private initialized = false;

  /**
   * Private constructor - use getInstance() instead
   */
  private constructor(config: P1IntegrationConfig = {}) {
    this.config = { ...DEFAULT_P1_CONFIG, ...config };
    this.initializeFeatureRegistry();
  }

  /**
   * Get the singleton instance of P1Integration
   */
  public static getInstance(config?: P1IntegrationConfig): P1Integration {
    if (!P1Integration.instance) {
      P1Integration.instance = new P1Integration(config);
    }
    return P1Integration.instance;
  }

  /**
   * Reset the singleton instance (mainly for testing)
   */
  public static resetInstance(): void {
    if (P1Integration.instance?.healthCheckTimer) {
      clearInterval(P1Integration.instance.healthCheckTimer);
    }
    P1Integration.instance = null;
  }

  /**
   * Initialize the feature registry with all P1 features
   */
  private initializeFeatureRegistry(): void {
    // Batch 1: Core Management (3 features)
    this.registerFeature({
      id: 'slide-manager',
      name: 'Slide Manager',
      batch: 1,
      dependencies: [],
      optional: false,
    });

    this.registerFeature({
      id: 'template-library',
      name: 'Template Library',
      batch: 1,
      dependencies: [],
      optional: false,
    });

    this.registerFeature({
      id: 'speaker-notes',
      name: 'Speaker Notes UI',
      batch: 1,
      dependencies: [],
      optional: true,
    });

    // Batch 2: Media & Data (3 features)
    this.registerFeature({
      id: 'video-embed',
      name: 'Video Embed Support',
      batch: 2,
      dependencies: [],
      optional: true,
    });

    this.registerFeature({
      id: 'custom-fonts',
      name: 'Custom Font Upload',
      batch: 2,
      dependencies: [],
      optional: true,
    });

    this.registerFeature({
      id: 'data-import',
      name: 'Data Import (CSV, Excel, JSON)',
      batch: 2,
      dependencies: [],
      optional: false,
    });

    // Batch 3: Internationalization & AI (3 features)
    this.registerFeature({
      id: 'i18n',
      name: 'Multi-Language Support',
      batch: 3,
      dependencies: [],
      optional: false,
    });

    this.registerFeature({
      id: 'version-history',
      name: 'Version History',
      batch: 3,
      dependencies: ['slide-manager'],
      optional: false,
    });

    this.registerFeature({
      id: 'ai-image-generation',
      name: 'AI Image Generation (DALL-E 3)',
      batch: 3,
      dependencies: [],
      optional: true, // Requires API key
    });

    // Batch 4: Analytics & Mobile (3 features)
    this.registerFeature({
      id: 'collaboration',
      name: 'Collaboration Features',
      batch: 4,
      dependencies: ['version-history'],
      optional: false,
    });

    this.registerFeature({
      id: 'analytics',
      name: 'Presentation Analytics',
      batch: 4,
      dependencies: [],
      optional: true,
    });

    this.registerFeature({
      id: 'mobile-app',
      name: 'Mobile App (React Native)',
      batch: 4,
      dependencies: ['i18n'],
      optional: true,
    });

    // Batch 5: Live & Interactive (3 features)
    this.registerFeature({
      id: 'live-presentation',
      name: 'Live Presentation Mode',
      batch: 5,
      dependencies: ['collaboration'],
      optional: false,
    });

    this.registerFeature({
      id: 'interactive-widgets',
      name: 'Interactive Widgets',
      batch: 5,
      dependencies: [],
      optional: true,
    });

    this.registerFeature({
      id: 'real-time-sync',
      name: 'Real-time Synchronization',
      batch: 5,
      dependencies: ['collaboration'],
      optional: true,
    });
  }

  /**
   * Register a feature in the registry
   */
  private registerFeature(params: {
    id: P1FeatureId;
    name: string;
    batch: number;
    dependencies: P1FeatureId[];
    optional: boolean;
  }): void {
    const { id, name, batch, dependencies, optional } = params;
    const enabled = this.config.featureFlags[id] ?? true;

    this.features.set(id, {
      id,
      name,
      status: 'initializing',
      instance: null,
      dependencies,
      optional,
      batch,
      enabled,
    });
  }

  /**
   * Initialize all P1 features in batches
   *
   * @returns Initialization result with success status and details
   * @throws {P1FeatureInitializationError} If failFast is true and a critical feature fails
   */
  public async initialize(
    overrideConfig?: Partial<P1IntegrationConfig>
  ): Promise<P1InitializationResult> {
    const startTime = Date.now();
    const config = { ...this.config, ...overrideConfig };

    const result: P1InitializationResult = {
      success: true,
      initialized: [],
      failed: [],
      degraded: [],
      disabled: [],
      duration: 0,
      batchResults: [],
    };

    try {
      // Process each enabled batch
      for (const batchNum of config.enabledBatches) {
        const batchResult = await this.initializeBatch(batchNum, config);
        result.batchResults.push(batchResult);

        // Merge batch results
        result.initialized.push(...batchResult.initialized);
        if (!batchResult.success) {
          result.success = false;
        }
      }

      // Collect all disabled features
      for (const [featureId, featureInfo] of Array.from(this.features.entries())) {
        if (!featureInfo.enabled) {
          result.disabled.push(featureId);
          this.updateFeatureStatus(featureId, 'disabled');
        }
      }

      // Collect failed and degraded features
      for (const [featureId, featureInfo] of Array.from(this.features.entries())) {
        if (featureInfo.status === 'degraded') {
          result.degraded.push(featureId);
        } else if (featureInfo.status === 'failed' && featureInfo.enabled) {
          result.failed.push({
            featureId,
            error: featureInfo.error || new Error('Unknown error'),
          });
        }
      }

      // Start health checks if enabled
      if (config.enableHealthChecks) {
        this.startHealthChecks();
      }

      this.initialized = true;
      result.duration = Date.now() - startTime;
      return result;
    } catch (error) {
      result.duration = Date.now() - startTime;
      result.success = false;
      throw error;
    }
  }

  /**
   * Initialize a specific batch of features
   */
  private async initializeBatch(
    batchNum: number,
    config: Required<P1IntegrationConfig>
  ): Promise<BatchResult> {
    const startTime = Date.now();
    const batchFeatures = Array.from(this.features.entries())
      .filter(([_, info]) => info.batch === batchNum && info.enabled)
      .map(([id, _]) => id);

    const result: BatchResult = {
      batch: batchNum,
      success: true,
      initialized: [],
      failed: [],
      duration: 0,
    };

    if (config.parallelInitialization) {
      // Initialize features in parallel
      const promises = batchFeatures.map(async (featureId) => {
        try {
          await this.initializeFeature(featureId);
          result.initialized.push(featureId);
        } catch (error) {
          result.failed.push(featureId);
          result.success = false;
          this.handleFeatureError(featureId, error as Error);
        }
      });

      await Promise.allSettled(promises);
    } else {
      // Initialize features sequentially
      for (const featureId of batchFeatures) {
        try {
          await this.initializeFeature(featureId);
          result.initialized.push(featureId);
        } catch (error) {
          result.failed.push(featureId);
          result.success = false;
          this.handleFeatureError(featureId, error as Error);

          if (config.failFast) {
            break;
          }
        }
      }
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  /**
   * Initialize a specific feature
   */
  private async initializeFeature(featureId: P1FeatureId): Promise<void> {
    const featureInfo = this.features.get(featureId)!;

    // Check if feature is enabled
    if (!featureInfo.enabled) {
      throw new P1FeatureDisabledError(featureId);
    }

    // Skip optional features if configured
    if (featureInfo.optional && !this.config.initializeOptional) {
      this.updateFeatureStatus(featureId, 'degraded');
      return;
    }

    // Check dependencies
    this.checkDependencies(featureId);

    // Create timeout promise
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error(`Initialization timeout for ${featureId}`)),
        this.config.initTimeout
      );
    });

    // Initialize with timeout
    const initPromise = this.getFeatureInitializer(featureId)();

    try {
      featureInfo.instance = await Promise.race([initPromise, timeout]);
      this.updateFeatureStatus(featureId, 'ready');
      this.config.onStatusChange(featureId, 'ready');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get the initializer function for a feature
   */
  private getFeatureInitializer(featureId: P1FeatureId): () => Promise<any> {
    const initializers: Record<P1FeatureId, () => Promise<any>> = {
      'slide-manager': async () => getGlobalSlideManager(),
      'template-library': async () => templateLibrary,
      'speaker-notes': async () => speakerNotesManager,
      'video-embed': async () => videoEmbedManager,
      'custom-fonts': async () => customFontManager,
      'data-import': async () => dataImportManager,
      'i18n': async () => i18n,
      'version-history': async () => versionHistory,
      'ai-image-generation': async () => aiImageGenerator,
      'collaboration': async () => collaborationManager,
      'analytics': async () => presentationAnalytics,
      'mobile-app': async () => mobileAppManager,
      'live-presentation': async () => livePresentationManager,
      'interactive-widgets': async () => null, // Placeholder - to be implemented
      'real-time-sync': async () => null, // Placeholder - to be implemented
    };

    return initializers[featureId];
  }

  /**
   * Check if all dependencies for a feature are ready
   */
  private checkDependencies(featureId: P1FeatureId): void {
    const featureInfo = this.features.get(featureId)!;
    const unmetDependencies: P1FeatureId[] = [];

    for (const depId of featureInfo.dependencies) {
      const dep = this.features.get(depId);
      if (!dep || dep.status !== 'ready') {
        unmetDependencies.push(depId);
      }
    }

    if (unmetDependencies.length > 0) {
      throw new P1DependencyError(featureId, unmetDependencies);
    }
  }

  /**
   * Handle feature initialization error
   */
  private handleFeatureError(featureId: P1FeatureId, error: Error): void {
    const featureInfo = this.features.get(featureId)!;
    featureInfo.error = error;
    this.config.onError(featureId, error);

    if (featureInfo.optional) {
      this.updateFeatureStatus(featureId, 'degraded');
    } else {
      this.updateFeatureStatus(featureId, 'failed');
    }
  }

  /**
   * Update feature status and notify
   */
  private updateFeatureStatus(featureId: P1FeatureId, status: P1FeatureStatus): void {
    const featureInfo = this.features.get(featureId)!;
    featureInfo.status = status;
    featureInfo.lastHealthCheck = new Date();
  }

  /**
   * Start periodic health checks
   */
  private startHealthChecks(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    this.healthCheckTimer = setInterval(() => {
      this.runHealthChecks().catch((error) => {
        console.error('P1 health check failed:', error);
      });
    }, this.config.healthCheckInterval);
  }

  /**
   * Run health checks on all features
   */
  private async runHealthChecks(): Promise<void> {
    for (const [featureId, featureInfo] of Array.from(this.features.entries())) {
      if (featureInfo.status === 'ready' && featureInfo.enabled) {
        try {
          const isHealthy = await this.checkFeatureHealth(featureId);
          if (!isHealthy) {
            this.updateFeatureStatus(featureId, 'degraded');
            this.config.onStatusChange(featureId, 'degraded');
          }
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          featureInfo.error = err;
          this.updateFeatureStatus(featureId, 'failed');
          this.config.onError(featureId, err);
        }
      }
    }
  }

  /**
   * Check health of a specific feature
   */
  private async checkFeatureHealth(featureId: P1FeatureId): Promise<boolean> {
    const featureInfo = this.features.get(featureId)!;

    // Basic health check - instance exists and has no errors
    if (!featureInfo.instance) {
      return false;
    }

    // TODO: Add feature-specific health checks
    return true;
  }

  /**
   * Enable a feature at runtime
   */
  public enableFeature(featureId: P1FeatureId): void {
    const featureInfo = this.features.get(featureId);
    if (!featureInfo) {
      throw new Error(`Unknown P1 feature: ${featureId}`);
    }

    featureInfo.enabled = true;
    this.config.onFeatureToggle(featureId, true);
  }

  /**
   * Disable a feature at runtime
   */
  public disableFeature(featureId: P1FeatureId): void {
    const featureInfo = this.features.get(featureId);
    if (!featureInfo) {
      throw new Error(`Unknown P1 feature: ${featureId}`);
    }

    featureInfo.enabled = false;
    this.updateFeatureStatus(featureId, 'disabled');
    this.config.onFeatureToggle(featureId, false);
  }

  /**
   * Check if a feature is enabled
   */
  public isFeatureEnabled(featureId: P1FeatureId): boolean {
    const featureInfo = this.features.get(featureId);
    return featureInfo?.enabled ?? false;
  }

  /**
   * Get a specific feature instance
   *
   * @param featureId - The feature identifier
   * @returns The feature instance
   * @throws {Error} If feature is not initialized, not ready, or disabled
   */
  public getFeature<T = any>(featureId: P1FeatureId): T {
    const featureInfo = this.features.get(featureId);

    if (!featureInfo) {
      throw new Error(`Unknown P1 feature: ${featureId}`);
    }

    if (!featureInfo.enabled) {
      throw new P1FeatureDisabledError(featureId);
    }

    if (featureInfo.status !== 'ready') {
      throw new Error(
        `P1 feature not ready: ${featureId} (status: ${featureInfo.status})`
      );
    }

    return featureInfo.instance as T;
  }

  /**
   * Get all enabled and ready feature instances
   */
  public getAllFeatures(): Record<string, any> {
    const features: Record<string, any> = {};

    for (const [featureId, featureInfo] of Array.from(this.features.entries())) {
      if (featureInfo.enabled && featureInfo.status === 'ready' && featureInfo.instance) {
        features[featureId] = featureInfo.instance;
      }
    }

    return features;
  }

  /**
   * Get feature status
   */
  public getFeatureStatus(featureId: P1FeatureId): P1FeatureStatus {
    const featureInfo = this.features.get(featureId);
    return featureInfo?.status ?? 'failed';
  }

  /**
   * Check if integration is healthy (all critical features ready)
   */
  public isHealthy(): boolean {
    for (const [_, featureInfo] of Array.from(this.features.entries())) {
      if (
        featureInfo.enabled &&
        !featureInfo.optional &&
        featureInfo.status !== 'ready'
      ) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get overall integration health
   */
  public getHealth(): P1IntegrationHealth {
    let degradedCount = 0;
    let failedCount = 0;
    let disabledCount = 0;

    for (const [_, featureInfo] of Array.from(this.features.entries())) {
      if (featureInfo.status === 'disabled') {
        disabledCount++;
      } else if (featureInfo.status === 'failed' && !featureInfo.optional) {
        failedCount++;
      } else if (featureInfo.status === 'degraded') {
        degradedCount++;
      }
    }

    if (failedCount > 0) {
      return 'critical';
    } else if (degradedCount > 0) {
      return 'degraded';
    } else if (disabledCount > 0) {
      return 'partial';
    } else {
      return 'healthy';
    }
  }

  /**
   * Get comprehensive health report
   */
  public getHealthReport(): P1IntegrationHealthReport {
    const featureChecks: P1FeatureHealthCheck[] = [];
    const summary = { total: 0, ready: 0, degraded: 0, failed: 0, disabled: 0 };
    const batchSummaryMap = new Map<number, any>();

    // Initialize batch summaries
    for (let i = 1; i <= 5; i++) {
      batchSummaryMap.set(i, {
        batch: i,
        total: 0,
        ready: 0,
        degraded: 0,
        failed: 0,
        disabled: 0,
      });
    }

    for (const [featureId, featureInfo] of Array.from(this.features.entries())) {
      summary.total++;
      const batchSummary = batchSummaryMap.get(featureInfo.batch)!;
      batchSummary.total++;

      let healthy = false;
      let message: string | undefined;

      switch (featureInfo.status) {
        case 'ready':
          summary.ready++;
          batchSummary.ready++;
          healthy = true;
          break;
        case 'degraded':
          summary.degraded++;
          batchSummary.degraded++;
          message = featureInfo.error?.message;
          break;
        case 'failed':
          summary.failed++;
          batchSummary.failed++;
          message = featureInfo.error?.message;
          break;
        case 'disabled':
          summary.disabled++;
          batchSummary.disabled++;
          message = 'Feature is disabled';
          break;
      }

      featureChecks.push({
        featureId,
        status: featureInfo.status,
        healthy,
        enabled: featureInfo.enabled,
        message,
        timestamp: featureInfo.lastHealthCheck ?? new Date(),
      });
    }

    return {
      overallHealth: this.getHealth(),
      features: featureChecks,
      timestamp: new Date(),
      summary,
      batchSummary: Array.from(batchSummaryMap.values()),
    };
  }

  /**
   * Check if integration is initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Shutdown the integration and cleanup resources
   */
  public async shutdown(): Promise<void> {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }

    // TODO: Add cleanup for each feature if needed
    this.initialized = false;
  }
}

/**
 * Singleton instance of P1Integration
 * Use this for easy access throughout the application
 *
 * @example
 * ```typescript
 * import { p1Integration } from './p1-integration';
 *
 * await p1Integration.initialize();
 * const slideManager = p1Integration.getFeature('slide-manager');
 * ```
 */
export const p1Integration = P1Integration.getInstance();

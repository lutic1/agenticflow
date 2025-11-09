/**
 * P2 Integration Module
 *
 * This module provides a unified integration layer for all 8 P2 (Nice-to-Have)
 * features of the Slide Designer. It extends the P0/P1 integration with:
 * - Lazy loading for heavy dependencies (Three.js, WebXR, Web3)
 * - Batch initialization (3 batches: Low/Medium/High risk)
 * - Feature flags for granular control
 * - Graceful degradation (P0+P1 work even if P2 fails)
 * - Enhanced health monitoring
 * - Parallel initialization within batches
 *
 * The 8 P2 Features (organized in 3 batches):
 *
 * Batch 1: Low Risk (4 features)
 * - P2.3: Voice Narration (Text-to-speech)
 * - P2.6: API Access (REST API for developers)
 * - P2.4: Interactive Elements (Polls, quizzes, Q&A)
 * - P2.5: Themes Marketplace (Browse and install themes)
 *
 * Batch 2: Medium Risk (2 features)
 * - P2.1: 3D Animations (Three.js integration)
 * - P2.7: Design Import (Figma/Sketch import)
 *
 * Batch 3: High Risk/Experimental (2 features)
 * - P2.2: AR Presentation (WebXR augmented reality)
 * - P2.8: Blockchain NFTs (NFT minting and marketplace)
 *
 * @module p2-integration
 */

import {
  VoiceNarrationManager,
  voiceNarrationManager,
} from './features/voice-narration.js';

import {
  APIAccessManager,
  apiAccessManager,
} from './features/api-access.js';

import {
  InteractiveElementsManager,
  interactiveElementsManager,
} from './features/interactive-elements.js';

import {
  ThemesMarketplaceManager,
  themesMarketplaceManager,
} from './features/themes-marketplace.js';

import {
  ThreeDAnimationsManager,
  threeDAnimationsManager,
} from './features/3d-animations.js';

import {
  DesignImportManager,
  designImportManager,
} from './features/design-import.js';

import {
  ARPresentationManager,
  arPresentationManager,
} from './features/ar-presentation.js';

import {
  BlockchainNFTManager,
  blockchainNFTManager,
} from './features/blockchain-nft.js';

import type {
  P2FeatureId,
  P2FeatureInfo,
  P2FeatureStatus,
  P2IntegrationHealth,
  P2IntegrationConfig,
  P2InitializationResult,
  P2FeatureHealthCheck,
  P2IntegrationHealthReport,
  P2BatchResult,
} from './types/p2-integration.js';

import {
  P2IntegrationError,
  P2FeatureInitializationError,
  P2DependencyError,
  P2HealthCheckError,
  P2FeatureDisabledError,
  P2LazyLoadError,
} from './types/p2-integration.js';

/**
 * Default configuration for P2 integration
 */
const DEFAULT_P2_CONFIG: Required<P2IntegrationConfig> = {
  failFast: false,
  initializeOptional: true,
  initTimeout: 15000, // P2 features may need more time
  enableHealthChecks: true,
  healthCheckInterval: 180000, // 3 minutes
  featureFlags: {} as Record<P2FeatureId, boolean>,
  enabledBatches: [1, 2, 3],
  parallelInitialization: true,
  enableLazyLoading: true,
  onError: () => {},
  onStatusChange: () => {},
  onFeatureToggle: () => {},
  onLazyLoadProgress: () => {},
};

/**
 * P2Integration class manages all 8 P2 features with:
 * - Batch initialization for organized loading
 * - Feature flags for granular control
 * - Lazy loading for heavy dependencies
 * - Health monitoring and graceful degradation
 * - Independence from P0/P1 (P0+P1 work even if P2 fails)
 *
 * @example
 * ```typescript
 * const integration = P2Integration.getInstance();
 *
 * // Initialize all P2 features
 * await integration.initialize();
 *
 * // Initialize specific batches only
 * await integration.initialize({ enabledBatches: [1, 2] });
 *
 * // Check if a feature is enabled
 * if (integration.isFeatureEnabled('voice-narration')) {
 *   const voiceNarration = integration.getFeature('voice-narration');
 * }
 *
 * // Disable a feature at runtime
 * integration.disableFeature('blockchain-nft');
 * ```
 */
export class P2Integration {
  private static instance: P2Integration | null = null;
  private features: Map<P2FeatureId, P2FeatureInfo> = new Map();
  private config: Required<P2IntegrationConfig>;
  private healthCheckTimer?: NodeJS.Timeout;
  private initialized = false;

  /**
   * Private constructor - use getInstance() instead
   */
  private constructor(config: P2IntegrationConfig = {}) {
    this.config = { ...DEFAULT_P2_CONFIG, ...config };
    this.initializeFeatureRegistry();
  }

  /**
   * Get the singleton instance of P2Integration
   */
  public static getInstance(config?: P2IntegrationConfig): P2Integration {
    if (!P2Integration.instance) {
      P2Integration.instance = new P2Integration(config);
    }
    return P2Integration.instance;
  }

  /**
   * Reset the singleton instance (mainly for testing)
   */
  public static resetInstance(): void {
    if (P2Integration.instance?.healthCheckTimer) {
      clearInterval(P2Integration.instance.healthCheckTimer);
    }
    P2Integration.instance = null;
  }

  /**
   * Initialize the feature registry with all P2 features
   */
  private initializeFeatureRegistry(): void {
    // Batch 1: Low Risk (4 features)
    this.registerFeature({
      id: 'voice-narration',
      name: 'Voice Narration (Text-to-Speech)',
      batch: 1,
      dependencies: [],
      optional: true,
      requiresHeavyDependencies: false, // Uses Web Speech API
    });

    this.registerFeature({
      id: 'api-access',
      name: 'API Access for Developers',
      batch: 1,
      dependencies: [],
      optional: true,
      requiresHeavyDependencies: false,
    });

    this.registerFeature({
      id: 'interactive-elements',
      name: 'Interactive Elements (Polls, Quizzes)',
      batch: 1,
      dependencies: [],
      optional: true,
      requiresHeavyDependencies: false,
    });

    this.registerFeature({
      id: 'themes-marketplace',
      name: 'Themes Marketplace',
      batch: 1,
      dependencies: [],
      optional: true,
      requiresHeavyDependencies: false,
    });

    // Batch 2: Medium Risk (2 features)
    this.registerFeature({
      id: '3d-animations',
      name: '3D Animations (Three.js)',
      batch: 2,
      dependencies: [],
      optional: true,
      requiresHeavyDependencies: true,
      heavyDependencies: ['three', 'three/examples/jsm/controls/OrbitControls'],
    });

    this.registerFeature({
      id: 'design-import',
      name: 'Design Import (Figma/Sketch)',
      batch: 2,
      dependencies: [],
      optional: true,
      requiresHeavyDependencies: false,
    });

    // Batch 3: High Risk/Experimental (2 features)
    this.registerFeature({
      id: 'ar-presentation',
      name: 'AR Presentation (WebXR)',
      batch: 3,
      dependencies: [],
      optional: true,
      requiresHeavyDependencies: true,
      heavyDependencies: ['webxr'], // WebXR API is built-in but may need polyfill
    });

    this.registerFeature({
      id: 'blockchain-nft',
      name: 'Blockchain NFTs',
      batch: 3,
      dependencies: [],
      optional: true,
      requiresHeavyDependencies: true,
      heavyDependencies: ['web3', 'ethers'], // Web3 libraries
    });
  }

  /**
   * Register a feature in the registry
   */
  private registerFeature(params: {
    id: P2FeatureId;
    name: string;
    batch: number;
    dependencies: P2FeatureId[];
    optional: boolean;
    requiresHeavyDependencies: boolean;
    heavyDependencies?: string[];
  }): void {
    const { id, name, batch, dependencies, optional, requiresHeavyDependencies, heavyDependencies } = params;
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
      requiresHeavyDependencies,
      heavyDependencies,
    });
  }

  /**
   * Initialize all P2 features in batches
   *
   * @returns Initialization result with success status and details
   * @throws {P2FeatureInitializationError} If failFast is true and a critical feature fails
   */
  public async initialize(
    overrideConfig?: Partial<P2IntegrationConfig>
  ): Promise<P2InitializationResult> {
    const startTime = Date.now();
    const config = { ...this.config, ...overrideConfig };

    const result: P2InitializationResult = {
      success: true,
      initialized: [],
      failed: [],
      degraded: [],
      disabled: [],
      lazyLoaded: [],
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
        result.lazyLoaded.push(...batchResult.lazyLoaded);
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
    config: Required<P2IntegrationConfig>
  ): Promise<P2BatchResult> {
    const startTime = Date.now();
    const batchFeatures = Array.from(this.features.entries())
      .filter(([_, info]) => info.batch === batchNum && info.enabled)
      .map(([id, _]) => id);

    const result: P2BatchResult = {
      batch: batchNum,
      success: true,
      initialized: [],
      failed: [],
      lazyLoaded: [],
      duration: 0,
    };

    if (config.parallelInitialization) {
      // Initialize features in parallel
      const promises = batchFeatures.map(async (featureId) => {
        try {
          const wasLazyLoaded = await this.initializeFeature(featureId);
          result.initialized.push(featureId);
          if (wasLazyLoaded) {
            result.lazyLoaded.push(featureId);
          }
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
          const wasLazyLoaded = await this.initializeFeature(featureId);
          result.initialized.push(featureId);
          if (wasLazyLoaded) {
            result.lazyLoaded.push(featureId);
          }
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
   * @returns true if feature was lazy loaded, false otherwise
   */
  private async initializeFeature(featureId: P2FeatureId): Promise<boolean> {
    const featureInfo = this.features.get(featureId)!;
    let wasLazyLoaded = false;

    // Check if feature is enabled
    if (!featureInfo.enabled) {
      throw new P2FeatureDisabledError(featureId);
    }

    // Skip optional features if configured
    if (featureInfo.optional && !this.config.initializeOptional) {
      this.updateFeatureStatus(featureId, 'degraded');
      return false;
    }

    // Check dependencies
    this.checkDependencies(featureId);

    // Handle lazy loading if needed
    if (featureInfo.requiresHeavyDependencies && this.config.enableLazyLoading) {
      this.updateFeatureStatus(featureId, 'lazy-loading');
      this.config.onStatusChange(featureId, 'lazy-loading');

      try {
        await this.lazyLoadDependencies(featureId, featureInfo.heavyDependencies || []);
        wasLazyLoaded = true;
      } catch (error) {
        throw new P2LazyLoadError(
          featureId,
          featureInfo.heavyDependencies?.join(', ') || 'unknown',
          error as Error
        );
      }
    }

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
      return wasLazyLoaded;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lazy load heavy dependencies
   */
  private async lazyLoadDependencies(
    featureId: P2FeatureId,
    dependencies: string[]
  ): Promise<void> {
    const totalDeps = dependencies.length;

    for (let i = 0; i < totalDeps; i++) {
      const dep = dependencies[i];

      try {
        // In production, would use dynamic import()
        // For now, simulate lazy loading
        this.config.onLazyLoadProgress(featureId, (i + 1) / totalDeps);

        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        throw new Error(`Failed to load dependency: ${dep}`);
      }
    }
  }

  /**
   * Get the initializer function for a feature
   */
  private getFeatureInitializer(featureId: P2FeatureId): () => Promise<any> {
    const initializers: Record<P2FeatureId, () => Promise<any>> = {
      'voice-narration': async () => voiceNarrationManager,
      'api-access': async () => apiAccessManager,
      'interactive-elements': async () => interactiveElementsManager,
      'themes-marketplace': async () => themesMarketplaceManager,
      '3d-animations': async () => threeDAnimationsManager,
      'design-import': async () => designImportManager,
      'ar-presentation': async () => arPresentationManager,
      'blockchain-nft': async () => blockchainNFTManager,
    };

    return initializers[featureId];
  }

  /**
   * Check if all dependencies for a feature are ready
   */
  private checkDependencies(featureId: P2FeatureId): void {
    const featureInfo = this.features.get(featureId)!;
    const unmetDependencies: P2FeatureId[] = [];

    for (const depId of featureInfo.dependencies) {
      const dep = this.features.get(depId);
      if (!dep || dep.status !== 'ready') {
        unmetDependencies.push(depId);
      }
    }

    if (unmetDependencies.length > 0) {
      throw new P2DependencyError(featureId, unmetDependencies);
    }
  }

  /**
   * Handle feature initialization error
   */
  private handleFeatureError(featureId: P2FeatureId, error: Error): void {
    const featureInfo = this.features.get(featureId)!;
    featureInfo.error = error;
    this.config.onError(featureId, error);

    // P2 features are always optional - degrade instead of fail
    this.updateFeatureStatus(featureId, 'degraded');
  }

  /**
   * Update feature status and notify
   */
  private updateFeatureStatus(featureId: P2FeatureId, status: P2FeatureStatus): void {
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
        console.error('P2 health check failed:', error);
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
  private async checkFeatureHealth(featureId: P2FeatureId): Promise<boolean> {
    const featureInfo = this.features.get(featureId)!;

    // Basic health check - instance exists and has no errors
    if (!featureInfo.instance) {
      return false;
    }

    // Feature-specific health checks
    switch (featureId) {
      case 'voice-narration':
        return featureInfo.instance.isSupported?.() ?? true;
      case 'ar-presentation':
        return await featureInfo.instance.isARSupported?.() ?? true;
      default:
        return true;
    }
  }

  /**
   * Enable a feature at runtime
   */
  public enableFeature(featureId: P2FeatureId): void {
    const featureInfo = this.features.get(featureId);
    if (!featureInfo) {
      throw new Error(`Unknown P2 feature: ${featureId}`);
    }

    featureInfo.enabled = true;
    this.config.onFeatureToggle(featureId, true);
  }

  /**
   * Disable a feature at runtime
   */
  public disableFeature(featureId: P2FeatureId): void {
    const featureInfo = this.features.get(featureId);
    if (!featureInfo) {
      throw new Error(`Unknown P2 feature: ${featureId}`);
    }

    featureInfo.enabled = false;
    this.updateFeatureStatus(featureId, 'disabled');
    this.config.onFeatureToggle(featureId, false);
  }

  /**
   * Check if a feature is enabled
   */
  public isFeatureEnabled(featureId: P2FeatureId): boolean {
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
  public getFeature<T = any>(featureId: P2FeatureId): T {
    const featureInfo = this.features.get(featureId);

    if (!featureInfo) {
      throw new Error(`Unknown P2 feature: ${featureId}`);
    }

    if (!featureInfo.enabled) {
      throw new P2FeatureDisabledError(featureId);
    }

    if (featureInfo.status !== 'ready') {
      throw new Error(
        `P2 feature not ready: ${featureId} (status: ${featureInfo.status})`
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
  public getFeatureStatus(featureId: P2FeatureId): P2FeatureStatus {
    const featureInfo = this.features.get(featureId);
    return featureInfo?.status ?? 'failed';
  }

  /**
   * Check if integration is healthy (all critical features ready)
   */
  public isHealthy(): boolean {
    // P2 features are all optional, so we're healthy if no critical failures
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
  public getHealth(): P2IntegrationHealth {
    let degradedCount = 0;
    let failedCount = 0;
    let disabledCount = 0;
    let lazyLoadingCount = 0;

    for (const [_, featureInfo] of Array.from(this.features.entries())) {
      if (featureInfo.status === 'disabled') {
        disabledCount++;
      } else if (featureInfo.status === 'lazy-loading') {
        lazyLoadingCount++;
      } else if (featureInfo.status === 'failed' && !featureInfo.optional) {
        failedCount++;
      } else if (featureInfo.status === 'degraded') {
        degradedCount++;
      }
    }

    if (lazyLoadingCount > 0) {
      return 'lazy-loading';
    } else if (failedCount > 0) {
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
  public getHealthReport(): P2IntegrationHealthReport {
    const featureChecks: P2FeatureHealthCheck[] = [];
    const summary = { total: 0, ready: 0, degraded: 0, failed: 0, disabled: 0, lazyLoading: 0 };
    const batchSummaryMap = new Map<number, any>();

    // Initialize batch summaries
    for (let i = 1; i <= 3; i++) {
      batchSummaryMap.set(i, {
        batch: i,
        total: 0,
        ready: 0,
        degraded: 0,
        failed: 0,
        disabled: 0,
        lazyLoading: 0,
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
        case 'lazy-loading':
          summary.lazyLoading++;
          batchSummary.lazyLoading++;
          message = 'Loading heavy dependencies...';
          break;
      }

      featureChecks.push({
        featureId,
        status: featureInfo.status,
        healthy,
        enabled: featureInfo.enabled,
        message,
        timestamp: featureInfo.lastHealthCheck ?? new Date(),
        heavyDependenciesLoaded: featureInfo.requiresHeavyDependencies
          ? featureInfo.status === 'ready'
          : undefined,
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
 * Singleton instance of P2Integration
 * Use this for easy access throughout the application
 *
 * @example
 * ```typescript
 * import { p2Integration } from './p2-integration';
 *
 * await p2Integration.initialize();
 * const voiceNarration = p2Integration.getFeature('voice-narration');
 * ```
 */
export const p2Integration = P2Integration.getInstance();

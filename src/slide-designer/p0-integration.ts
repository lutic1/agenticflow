/**
 * P0 Integration Module
 *
 * This module provides a unified integration layer for all 12 P0 (Priority 0)
 * features of the Slide Designer. It handles:
 * - Feature initialization in correct dependency order
 * - Health monitoring and checks
 * - Graceful degradation on failures
 * - Comprehensive error handling
 *
 * The 12 P0 Features:
 * 1. Grid Layout System - Smart 12-column grid with intelligent constraints
 * 2. Typography System - Professional type scale with responsive sizing
 * 3. Color Palettes - WCAG-compliant professional color schemes
 * 4. Chart Integration - Full Chart.js support for data visualization
 * 5. Text Overflow Handling - Intelligent compression, splitting, or summarization
 * 6. Master Slides - Consistent branding and slide templates
 * 7. Transitions & Animations - Professional slide transitions
 * 8. Accessibility - WCAG AAA compliance features
 * 9. Export Quality - High-quality PDF/PPTX export
 * 10. Image Optimization - Automatic image quality and size optimization
 * 11. Content Validation - Rule-based content validation
 * 12. LLM-as-Judge - AI-powered quality control
 *
 * @module p0-integration
 */

import {
  GridLayoutEngine,
  gridLayoutEngine,
  TypographyEngine,
  typographyEngine,
  ColorEngine,
  colorEngine,
  ChartRenderer,
  chartRenderer,
  TextOverflowHandler,
  textOverflowHandler,
  MasterSlideManager,
  masterSlideManager,
  TransitionEngine,
  transitionEngine,
  AccessibilityEngine,
  accessibilityEngine,
  ExportEngine,
  exportEngine,
  ImageOptimizer,
  imageOptimizer,
} from './core-v2';

import {
  ContentValidator,
  contentValidator,
  LLMJudge,
  llmJudge,
} from './quality-control';

import type {
  P0FeatureId,
  FeatureInfo,
  FeatureStatus,
  IntegrationHealth,
  P0IntegrationConfig,
  InitializationResult,
  FeatureHealthCheck,
  IntegrationHealthReport,
} from './types/p0-integration';

import {
  FeatureInitializationError,
  DependencyError,
  HealthCheckError,
} from './types/p0-integration';

/**
 * Default configuration for P0 integration
 */
const DEFAULT_CONFIG: Required<P0IntegrationConfig> = {
  failFast: false,
  initializeOptional: true,
  initTimeout: 5000,
  enableHealthChecks: true,
  healthCheckInterval: 60000,
  onError: () => {},
  onStatusChange: () => {},
};

/**
 * P0Integration class manages all 12 P0 features with proper initialization,
 * health monitoring, and error handling.
 *
 * @example
 * ```typescript
 * const integration = P0Integration.getInstance();
 * await integration.initialize();
 *
 * // Check if all features are ready
 * if (integration.isHealthy()) {
 *   const report = integration.getHealthReport();
 *   console.log(report);
 * }
 *
 * // Get specific feature
 * const gridLayout = integration.getFeature('grid-layout');
 * ```
 */
export class P0Integration {
  private static instance: P0Integration | null = null;
  private features: Map<P0FeatureId, FeatureInfo> = new Map();
  private config: Required<P0IntegrationConfig>;
  private healthCheckTimer?: NodeJS.Timeout;
  private initialized = false;

  /**
   * Private constructor - use getInstance() instead
   */
  private constructor(config: P0IntegrationConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeFeatureRegistry();
  }

  /**
   * Get the singleton instance of P0Integration
   */
  public static getInstance(config?: P0IntegrationConfig): P0Integration {
    if (!P0Integration.instance) {
      P0Integration.instance = new P0Integration(config);
    }
    return P0Integration.instance;
  }

  /**
   * Reset the singleton instance (mainly for testing)
   */
  public static resetInstance(): void {
    if (P0Integration.instance?.healthCheckTimer) {
      clearInterval(P0Integration.instance.healthCheckTimer);
    }
    P0Integration.instance = null;
  }

  /**
   * Initialize the feature registry with all P0 features
   */
  private initializeFeatureRegistry(): void {
    // P0.1: Grid Layout System
    this.features.set('grid-layout', {
      id: 'grid-layout',
      name: 'Grid Layout System',
      status: 'initializing',
      instance: null,
      dependencies: [],
      optional: false,
    });

    // P0.2: Typography System
    this.features.set('typography', {
      id: 'typography',
      name: 'Typography System',
      status: 'initializing',
      instance: null,
      dependencies: [],
      optional: false,
    });

    // P0.3: Color Palettes
    this.features.set('color-palettes', {
      id: 'color-palettes',
      name: 'Color Palettes & WCAG Compliance',
      status: 'initializing',
      instance: null,
      dependencies: [],
      optional: false,
    });

    // P0.4: Charts (depends on color palettes for theming)
    this.features.set('charts', {
      id: 'charts',
      name: 'Chart Integration',
      status: 'initializing',
      instance: null,
      dependencies: ['color-palettes'],
      optional: false,
    });

    // P0.5: Text Overflow (depends on typography)
    this.features.set('text-overflow', {
      id: 'text-overflow',
      name: 'Text Overflow Handler',
      status: 'initializing',
      instance: null,
      dependencies: ['typography'],
      optional: false,
    });

    // P0.6: Master Slides (depends on grid, typography, color)
    this.features.set('master-slides', {
      id: 'master-slides',
      name: 'Master Slides & Branding',
      status: 'initializing',
      instance: null,
      dependencies: ['grid-layout', 'typography', 'color-palettes'],
      optional: false,
    });

    // P0.7: Transitions
    this.features.set('transitions', {
      id: 'transitions',
      name: 'Transitions & Animations',
      status: 'initializing',
      instance: null,
      dependencies: [],
      optional: true,
    });

    // P0.8: Accessibility (depends on color for contrast checks)
    this.features.set('accessibility', {
      id: 'accessibility',
      name: 'Accessibility Engine',
      status: 'initializing',
      instance: null,
      dependencies: ['color-palettes', 'typography'],
      optional: false,
    });

    // P0.9: Export (depends on most other features)
    this.features.set('export', {
      id: 'export',
      name: 'Export Engine',
      status: 'initializing',
      instance: null,
      dependencies: ['grid-layout', 'typography', 'color-palettes', 'accessibility'],
      optional: false,
    });

    // P0.10: Image Optimization
    this.features.set('image-optimization', {
      id: 'image-optimization',
      name: 'Image Optimizer',
      status: 'initializing',
      instance: null,
      dependencies: [],
      optional: false,
    });

    // P0.11: Content Validation
    this.features.set('content-validation', {
      id: 'content-validation',
      name: 'Content Validator',
      status: 'initializing',
      instance: null,
      dependencies: ['typography'],
      optional: false,
    });

    // P0.12: LLM Judge (optional - requires API key)
    this.features.set('llm-judge', {
      id: 'llm-judge',
      name: 'LLM-as-Judge Quality Control',
      status: 'initializing',
      instance: null,
      dependencies: [],
      optional: true,
    });
  }

  /**
   * Initialize all P0 features in correct dependency order
   *
   * @returns Initialization result with success status and details
   * @throws {FeatureInitializationError} If failFast is true and a critical feature fails
   */
  public async initialize(): Promise<InitializationResult> {
    const startTime = Date.now();
    const result: InitializationResult = {
      success: true,
      initialized: [],
      failed: [],
      degraded: [],
      duration: 0,
    };

    try {
      // Get initialization order based on dependencies
      const initOrder = this.getInitializationOrder();

      // Initialize features in order
      for (const featureId of initOrder) {
        const featureInfo = this.features.get(featureId)!;

        // Skip optional features if configured
        if (featureInfo.optional && !this.config.initializeOptional) {
          this.updateFeatureStatus(featureId, 'degraded');
          result.degraded.push(featureId);
          continue;
        }

        try {
          // Check dependencies
          this.checkDependencies(featureId);

          // Initialize the feature
          await this.initializeFeature(featureId);

          result.initialized.push(featureId);
          this.config.onStatusChange(featureId, 'ready');
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));

          // Store error
          featureInfo.error = err;
          this.config.onError(featureId, err);

          if (featureInfo.optional) {
            // Degrade optional features
            this.updateFeatureStatus(featureId, 'degraded');
            result.degraded.push(featureId);
          } else {
            // Fail critical features
            this.updateFeatureStatus(featureId, 'failed');
            result.failed.push({ featureId, error: err });
            result.success = false;

            if (this.config.failFast) {
              throw new FeatureInitializationError(featureId, err);
            }
          }
        }
      }

      // Start health checks if enabled
      if (this.config.enableHealthChecks) {
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
   * Initialize a specific feature
   */
  private async initializeFeature(featureId: P0FeatureId): Promise<void> {
    const featureInfo = this.features.get(featureId)!;

    // Create timeout promise
    const timeout = new Promise((_, reject) => {
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
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get the initializer function for a feature
   */
  private getFeatureInitializer(featureId: P0FeatureId): () => Promise<any> {
    const initializers: Record<P0FeatureId, () => Promise<any>> = {
      'grid-layout': async () => gridLayoutEngine,
      'typography': async () => typographyEngine,
      'color-palettes': async () => colorEngine,
      'charts': async () => chartRenderer,
      'text-overflow': async () => textOverflowHandler,
      'master-slides': async () => masterSlideManager,
      'transitions': async () => transitionEngine,
      'accessibility': async () => accessibilityEngine,
      'export': async () => exportEngine,
      'image-optimization': async () => imageOptimizer,
      'content-validation': async () => contentValidator,
      'llm-judge': async () => llmJudge,
    };

    return initializers[featureId];
  }

  /**
   * Check if all dependencies for a feature are ready
   */
  private checkDependencies(featureId: P0FeatureId): void {
    const featureInfo = this.features.get(featureId)!;
    const unmetDependencies: P0FeatureId[] = [];

    for (const depId of featureInfo.dependencies) {
      const dep = this.features.get(depId);
      if (!dep || dep.status !== 'ready') {
        unmetDependencies.push(depId);
      }
    }

    if (unmetDependencies.length > 0) {
      throw new DependencyError(featureId, unmetDependencies);
    }
  }

  /**
   * Get initialization order based on dependencies using topological sort
   */
  private getInitializationOrder(): P0FeatureId[] {
    const order: P0FeatureId[] = [];
    const visited = new Set<P0FeatureId>();
    const visiting = new Set<P0FeatureId>();

    const visit = (featureId: P0FeatureId) => {
      if (visited.has(featureId)) return;
      if (visiting.has(featureId)) {
        throw new Error(`Circular dependency detected: ${featureId}`);
      }

      visiting.add(featureId);
      const featureInfo = this.features.get(featureId)!;

      // Visit dependencies first
      for (const depId of featureInfo.dependencies) {
        visit(depId);
      }

      visiting.delete(featureId);
      visited.add(featureId);
      order.push(featureId);
    };

    // Visit all features
    for (const featureId of Array.from(this.features.keys())) {
      visit(featureId);
    }

    return order;
  }

  /**
   * Update feature status and notify
   */
  private updateFeatureStatus(featureId: P0FeatureId, status: FeatureStatus): void {
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
        console.error('Health check failed:', error);
      });
    }, this.config.healthCheckInterval);
  }

  /**
   * Run health checks on all features
   */
  private async runHealthChecks(): Promise<void> {
    for (const [featureId, featureInfo] of Array.from(this.features.entries())) {
      if (featureInfo.status === 'ready') {
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
  private async checkFeatureHealth(featureId: P0FeatureId): Promise<boolean> {
    const featureInfo = this.features.get(featureId)!;

    // Basic health check - instance exists and has no errors
    if (!featureInfo.instance) {
      return false;
    }

    // TODO: Add feature-specific health checks
    // For now, just check if instance exists
    return true;
  }

  /**
   * Get a specific feature instance
   *
   * @param featureId - The feature identifier
   * @returns The feature instance
   * @throws {Error} If feature is not initialized or not ready
   */
  public getFeature<T = any>(featureId: P0FeatureId): T {
    const featureInfo = this.features.get(featureId);

    if (!featureInfo) {
      throw new Error(`Unknown feature: ${featureId}`);
    }

    if (featureInfo.status !== 'ready') {
      throw new Error(`Feature not ready: ${featureId} (status: ${featureInfo.status})`);
    }

    return featureInfo.instance as T;
  }

  /**
   * Get all feature instances
   */
  public getAllFeatures(): Record<P0FeatureId, any> {
    const features: Record<string, any> = {};

    for (const [featureId, featureInfo] of Array.from(this.features.entries())) {
      if (featureInfo.status === 'ready' && featureInfo.instance) {
        features[featureId] = featureInfo.instance;
      }
    }

    return features as Record<P0FeatureId, any>;
  }

  /**
   * Get feature status
   */
  public getFeatureStatus(featureId: P0FeatureId): FeatureStatus {
    const featureInfo = this.features.get(featureId);
    return featureInfo?.status ?? 'failed';
  }

  /**
   * Check if integration is healthy (all critical features ready)
   */
  public isHealthy(): boolean {
    for (const [_, featureInfo] of Array.from(this.features.entries())) {
      if (!featureInfo.optional && featureInfo.status !== 'ready') {
        return false;
      }
    }
    return true;
  }

  /**
   * Get overall integration health
   */
  public getHealth(): IntegrationHealth {
    let degradedCount = 0;
    let failedCount = 0;

    for (const [_, featureInfo] of Array.from(this.features.entries())) {
      if (featureInfo.status === 'failed' && !featureInfo.optional) {
        failedCount++;
      } else if (featureInfo.status === 'degraded') {
        degradedCount++;
      }
    }

    if (failedCount > 0) {
      return 'critical';
    } else if (degradedCount > 0) {
      return 'degraded';
    } else {
      return 'healthy';
    }
  }

  /**
   * Get comprehensive health report
   */
  public getHealthReport(): IntegrationHealthReport {
    const featureChecks: FeatureHealthCheck[] = [];
    const summary = { total: 0, ready: 0, degraded: 0, failed: 0 };

    for (const [featureId, featureInfo] of Array.from(this.features.entries())) {
      summary.total++;

      let healthy = false;
      let message: string | undefined;

      switch (featureInfo.status) {
        case 'ready':
          summary.ready++;
          healthy = true;
          break;
        case 'degraded':
          summary.degraded++;
          message = featureInfo.error?.message;
          break;
        case 'failed':
          summary.failed++;
          message = featureInfo.error?.message;
          break;
      }

      featureChecks.push({
        featureId,
        status: featureInfo.status,
        healthy,
        message,
        timestamp: featureInfo.lastHealthCheck ?? new Date(),
      });
    }

    return {
      overallHealth: this.getHealth(),
      features: featureChecks,
      timestamp: new Date(),
      summary,
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
 * Singleton instance of P0Integration
 * Use this for easy access throughout the application
 *
 * @example
 * ```typescript
 * import { p0Integration } from './p0-integration';
 *
 * await p0Integration.initialize();
 * const gridLayout = p0Integration.getFeature('grid-layout');
 * ```
 */
export const p0Integration = P0Integration.getInstance();

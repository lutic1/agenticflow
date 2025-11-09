/**
 * P2 Integration Types
 * Type definitions for the P2 (Nice-to-Have) feature integration layer
 */

/**
 * Feature identifiers for the 8 P2 features
 * Organized in 3 batches by risk/complexity
 */
export type P2FeatureId =
  // P2 Batch 1: Low Risk (4 features)
  | 'voice-narration'        // P2.3: Text-to-speech narration
  | 'api-access'             // P2.6: REST API for developers
  | 'interactive-elements'   // P2.4: Polls, quizzes, Q&A
  | 'themes-marketplace'     // P2.5: Theme marketplace

  // P2 Batch 2: Medium Risk (2 features)
  | '3d-animations'          // P2.1: Three.js 3D graphics
  | 'design-import'          // P2.7: Figma/Sketch import

  // P2 Batch 3: High Risk/Experimental (2 features)
  | 'ar-presentation'        // P2.2: WebXR AR mode
  | 'blockchain-nft';        // P2.8: NFT minting

/**
 * P2 feature metadata and status
 * Extends the pattern from P0 and P1 features
 */
export interface P2FeatureInfo {
  id: P2FeatureId;
  name: string;
  status: P2FeatureStatus;
  instance: any;
  error?: Error;
  dependencies: P2FeatureId[];
  optional: boolean;
  lastHealthCheck?: Date;
  batch: number; // Which batch this feature belongs to (1-3)
  enabled: boolean; // Feature flag state
  requiresHeavyDependencies: boolean; // Whether feature needs lazy loading
  heavyDependencies?: string[]; // e.g., ['three', 'web3', 'webxr']
}

/**
 * Status of an individual P2 feature
 */
export type P2FeatureStatus =
  | 'initializing'
  | 'ready'
  | 'degraded'
  | 'failed'
  | 'disabled'
  | 'lazy-loading'; // For heavy dependencies being loaded

/**
 * Configuration options for P2 integration
 */
export interface P2IntegrationConfig {
  /**
   * Whether to fail fast on critical errors or continue with degradation
   * @default false - P2 features should never break P0/P1
   */
  failFast?: boolean;

  /**
   * Whether to initialize optional features
   * @default true
   */
  initializeOptional?: boolean;

  /**
   * Timeout for feature initialization in milliseconds
   * @default 15000 (P2 features may need more time for lazy loading)
   */
  initTimeout?: number;

  /**
   * Whether to enable health checks
   * @default true
   */
  enableHealthChecks?: boolean;

  /**
   * Interval for automatic health checks in milliseconds
   * @default 180000 (3 minutes - less frequent than P0/P1)
   */
  healthCheckInterval?: number;

  /**
   * Feature flags - enable/disable specific P2 features
   * @default all enabled
   */
  featureFlags?: Partial<Record<P2FeatureId, boolean>>;

  /**
   * Which batches to initialize (1-3)
   * @default all batches [1, 2, 3]
   */
  enabledBatches?: number[];

  /**
   * Whether to initialize in parallel within batches
   * @default true
   */
  parallelInitialization?: boolean;

  /**
   * Whether to enable lazy loading for heavy dependencies
   * @default true
   */
  enableLazyLoading?: boolean;

  /**
   * Custom error handler
   */
  onError?: (featureId: P2FeatureId, error: Error) => void;

  /**
   * Custom status change handler
   */
  onStatusChange?: (featureId: P2FeatureId, status: P2FeatureStatus) => void;

  /**
   * Custom feature enabled/disabled handler
   */
  onFeatureToggle?: (featureId: P2FeatureId, enabled: boolean) => void;

  /**
   * Custom lazy loading progress handler
   */
  onLazyLoadProgress?: (featureId: P2FeatureId, progress: number) => void;
}

/**
 * Result of a P2 initialization attempt
 */
export interface P2InitializationResult {
  success: boolean;
  initialized: P2FeatureId[];
  failed: Array<{
    featureId: P2FeatureId;
    error: Error;
  }>;
  degraded: P2FeatureId[];
  disabled: P2FeatureId[];
  lazyLoaded: P2FeatureId[];
  duration: number;
  batchResults: P2BatchResult[];
}

/**
 * Result of initializing a batch of P2 features
 */
export interface P2BatchResult {
  batch: number;
  success: boolean;
  initialized: P2FeatureId[];
  failed: P2FeatureId[];
  lazyLoaded: P2FeatureId[];
  duration: number;
}

/**
 * Health check result for a P2 feature
 */
export interface P2FeatureHealthCheck {
  featureId: P2FeatureId;
  status: P2FeatureStatus;
  healthy: boolean;
  enabled: boolean;
  message?: string;
  timestamp: Date;
  heavyDependenciesLoaded?: boolean;
}

/**
 * Overall P2 integration health report
 */
export interface P2IntegrationHealthReport {
  overallHealth: P2IntegrationHealth;
  features: P2FeatureHealthCheck[];
  timestamp: Date;
  summary: {
    total: number;
    ready: number;
    degraded: number;
    failed: number;
    disabled: number;
    lazyLoading: number;
  };
  batchSummary: Array<{
    batch: number;
    total: number;
    ready: number;
    degraded: number;
    failed: number;
    disabled: number;
    lazyLoading: number;
  }>;
}

/**
 * Health status of the entire P2 integration
 */
export type P2IntegrationHealth =
  | 'healthy'      // All enabled features ready
  | 'degraded'     // Some features degraded/failed
  | 'critical'     // Critical failures
  | 'partial'      // Some features disabled
  | 'lazy-loading'; // Heavy dependencies loading

/**
 * Error types specific to P2 integration
 */
export class P2IntegrationError extends Error {
  constructor(
    message: string,
    public readonly featureId?: P2FeatureId,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'P2IntegrationError';
  }
}

export class P2FeatureInitializationError extends P2IntegrationError {
  constructor(featureId: P2FeatureId, cause: Error) {
    super(`Failed to initialize P2 feature: ${featureId}`, featureId, cause);
    this.name = 'P2FeatureInitializationError';
  }
}

export class P2DependencyError extends P2IntegrationError {
  constructor(
    featureId: P2FeatureId,
    missingDependencies: P2FeatureId[]
  ) {
    super(
      `P2 Feature ${featureId} has unmet dependencies: ${missingDependencies.join(', ')}`,
      featureId
    );
    this.name = 'P2DependencyError';
  }
}

export class P2HealthCheckError extends P2IntegrationError {
  constructor(featureId: P2FeatureId, message: string) {
    super(`Health check failed for P2 feature ${featureId}: ${message}`, featureId);
    this.name = 'P2HealthCheckError';
  }
}

export class P2FeatureDisabledError extends P2IntegrationError {
  constructor(featureId: P2FeatureId) {
    super(`P2 Feature is disabled: ${featureId}`, featureId);
    this.name = 'P2FeatureDisabledError';
  }
}

export class P2LazyLoadError extends P2IntegrationError {
  constructor(featureId: P2FeatureId, dependency: string, cause: Error) {
    super(
      `Failed to lazy load dependency '${dependency}' for ${featureId}`,
      featureId,
      cause
    );
    this.name = 'P2LazyLoadError';
  }
}

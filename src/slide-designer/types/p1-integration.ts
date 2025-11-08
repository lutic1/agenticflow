/**
 * P1 Integration Types
 * Type definitions for the P1 feature integration layer
 */

/**
 * Feature identifiers for the 15 P1 features
 */
export type P1FeatureId =
  // P1 Batch 1: Core Management (3 features)
  | 'slide-manager'          // P1.4: Slide Duplication & Reordering
  | 'template-library'       // P1.5: Template Library (20 pre-built decks)
  | 'speaker-notes'          // P1.3: Speaker Notes UI

  // P1 Batch 2: Media & Data (3 features)
  | 'video-embed'            // P1.7: Video Embed Support
  | 'custom-fonts'           // P1.8: Custom Font Upload
  | 'data-import'            // P1.12: Data Import (CSV, Excel, JSON)

  // P1 Batch 3: Internationalization & AI (3 features)
  | 'i18n'                   // P1.6: Multi-Language Support
  | 'ai-image-generation'    // P1.11: AI Image Generation (DALL-E 3)
  | 'version-history'        // P1.10: Version History

  // P1 Batch 4: Analytics & Mobile (3 features)
  | 'analytics'              // P1.13: Presentation Analytics
  | 'mobile-app'             // P1.14: Mobile App (React Native)
  | 'collaboration'          // P1.9: Collaboration Features

  // P1 Batch 5: Live & Interactive (3 features)
  | 'live-presentation'      // P1.15: Live Presentation Mode
  | 'interactive-widgets'    // P1.1: Interactive content widgets
  | 'real-time-sync';        // P1.2: Real-time synchronization

/**
 * P1 feature metadata and status
 * Extends the pattern from P0 features
 */
export interface P1FeatureInfo {
  id: P1FeatureId;
  name: string;
  status: P1FeatureStatus;
  instance: any;
  error?: Error;
  dependencies: P1FeatureId[];
  optional: boolean;
  lastHealthCheck?: Date;
  batch: number; // Which batch this feature belongs to (1-5)
  enabled: boolean; // Feature flag state
}

/**
 * Status of an individual P1 feature
 */
export type P1FeatureStatus = 'initializing' | 'ready' | 'degraded' | 'failed' | 'disabled';

/**
 * Configuration options for P1 integration
 */
export interface P1IntegrationConfig {
  /**
   * Whether to fail fast on critical errors or continue with degradation
   * @default false
   */
  failFast?: boolean;

  /**
   * Whether to initialize optional features
   * @default true
   */
  initializeOptional?: boolean;

  /**
   * Timeout for feature initialization in milliseconds
   * @default 10000 (P1 features may take longer than P0)
   */
  initTimeout?: number;

  /**
   * Whether to enable health checks
   * @default true
   */
  enableHealthChecks?: boolean;

  /**
   * Interval for automatic health checks in milliseconds
   * @default 120000 (2 minutes - less frequent than P0)
   */
  healthCheckInterval?: number;

  /**
   * Feature flags - enable/disable specific P1 features
   * @default all enabled
   */
  featureFlags?: Partial<Record<P1FeatureId, boolean>>;

  /**
   * Which batches to initialize (1-5)
   * @default all batches [1, 2, 3, 4, 5]
   */
  enabledBatches?: number[];

  /**
   * Whether to initialize in parallel within batches
   * @default true
   */
  parallelInitialization?: boolean;

  /**
   * Custom error handler
   */
  onError?: (featureId: P1FeatureId, error: Error) => void;

  /**
   * Custom status change handler
   */
  onStatusChange?: (featureId: P1FeatureId, status: P1FeatureStatus) => void;

  /**
   * Custom feature enabled/disabled handler
   */
  onFeatureToggle?: (featureId: P1FeatureId, enabled: boolean) => void;
}

/**
 * Result of a P1 initialization attempt
 */
export interface P1InitializationResult {
  success: boolean;
  initialized: P1FeatureId[];
  failed: Array<{
    featureId: P1FeatureId;
    error: Error;
  }>;
  degraded: P1FeatureId[];
  disabled: P1FeatureId[];
  duration: number;
  batchResults: BatchResult[];
}

/**
 * Result of initializing a batch of P1 features
 */
export interface BatchResult {
  batch: number;
  success: boolean;
  initialized: P1FeatureId[];
  failed: P1FeatureId[];
  duration: number;
}

/**
 * Health check result for a P1 feature
 */
export interface P1FeatureHealthCheck {
  featureId: P1FeatureId;
  status: P1FeatureStatus;
  healthy: boolean;
  enabled: boolean;
  message?: string;
  timestamp: Date;
}

/**
 * Overall P1 integration health report
 */
export interface P1IntegrationHealthReport {
  overallHealth: P1IntegrationHealth;
  features: P1FeatureHealthCheck[];
  timestamp: Date;
  summary: {
    total: number;
    ready: number;
    degraded: number;
    failed: number;
    disabled: number;
  };
  batchSummary: Array<{
    batch: number;
    total: number;
    ready: number;
    degraded: number;
    failed: number;
    disabled: number;
  }>;
}

/**
 * Health status of the entire P1 integration
 */
export type P1IntegrationHealth = 'healthy' | 'degraded' | 'critical' | 'partial';

/**
 * Error types specific to P1 integration
 */
export class P1IntegrationError extends Error {
  constructor(
    message: string,
    public readonly featureId?: P1FeatureId,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'P1IntegrationError';
  }
}

export class P1FeatureInitializationError extends P1IntegrationError {
  constructor(featureId: P1FeatureId, cause: Error) {
    super(`Failed to initialize P1 feature: ${featureId}`, featureId, cause);
    this.name = 'P1FeatureInitializationError';
  }
}

export class P1DependencyError extends P1IntegrationError {
  constructor(
    featureId: P1FeatureId,
    missingDependencies: P1FeatureId[]
  ) {
    super(
      `P1 Feature ${featureId} has unmet dependencies: ${missingDependencies.join(', ')}`,
      featureId
    );
    this.name = 'P1DependencyError';
  }
}

export class P1HealthCheckError extends P1IntegrationError {
  constructor(featureId: P1FeatureId, message: string) {
    super(`Health check failed for P1 feature ${featureId}: ${message}`, featureId);
    this.name = 'P1HealthCheckError';
  }
}

export class P1FeatureDisabledError extends P1IntegrationError {
  constructor(featureId: P1FeatureId) {
    super(`P1 Feature is disabled: ${featureId}`, featureId);
    this.name = 'P1FeatureDisabledError';
  }
}

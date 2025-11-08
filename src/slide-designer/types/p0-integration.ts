/**
 * P0 Integration Types
 * Type definitions for the P0 feature integration layer
 */

/**
 * Status of an individual P0 feature
 */
export type FeatureStatus = 'initializing' | 'ready' | 'degraded' | 'failed';

/**
 * Health status of the entire P0 integration
 */
export type IntegrationHealth = 'healthy' | 'degraded' | 'critical';

/**
 * Feature identifiers for the 12 P0 features
 */
export type P0FeatureId =
  | 'grid-layout'
  | 'typography'
  | 'color-palettes'
  | 'charts'
  | 'text-overflow'
  | 'master-slides'
  | 'transitions'
  | 'accessibility'
  | 'export'
  | 'image-optimization'
  | 'content-validation'
  | 'llm-judge';

/**
 * Feature metadata and status
 */
export interface FeatureInfo {
  id: P0FeatureId;
  name: string;
  status: FeatureStatus;
  instance: any;
  error?: Error;
  dependencies: P0FeatureId[];
  optional: boolean;
  lastHealthCheck?: Date;
}

/**
 * Configuration options for P0 integration
 */
export interface P0IntegrationConfig {
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
   * @default 5000
   */
  initTimeout?: number;

  /**
   * Whether to enable health checks
   * @default true
   */
  enableHealthChecks?: boolean;

  /**
   * Interval for automatic health checks in milliseconds
   * @default 60000 (1 minute)
   */
  healthCheckInterval?: number;

  /**
   * Custom error handler
   */
  onError?: (featureId: P0FeatureId, error: Error) => void;

  /**
   * Custom status change handler
   */
  onStatusChange?: (featureId: P0FeatureId, status: FeatureStatus) => void;
}

/**
 * Result of an initialization attempt
 */
export interface InitializationResult {
  success: boolean;
  initialized: P0FeatureId[];
  failed: Array<{
    featureId: P0FeatureId;
    error: Error;
  }>;
  degraded: P0FeatureId[];
  duration: number;
}

/**
 * Health check result for a feature
 */
export interface FeatureHealthCheck {
  featureId: P0FeatureId;
  status: FeatureStatus;
  healthy: boolean;
  message?: string;
  timestamp: Date;
}

/**
 * Overall integration health report
 */
export interface IntegrationHealthReport {
  overallHealth: IntegrationHealth;
  features: FeatureHealthCheck[];
  timestamp: Date;
  summary: {
    total: number;
    ready: number;
    degraded: number;
    failed: number;
  };
}

/**
 * Error types specific to P0 integration
 */
export class P0IntegrationError extends Error {
  constructor(
    message: string,
    public readonly featureId?: P0FeatureId,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'P0IntegrationError';
  }
}

export class FeatureInitializationError extends P0IntegrationError {
  constructor(featureId: P0FeatureId, cause: Error) {
    super(`Failed to initialize feature: ${featureId}`, featureId, cause);
    this.name = 'FeatureInitializationError';
  }
}

export class DependencyError extends P0IntegrationError {
  constructor(
    featureId: P0FeatureId,
    missingDependencies: P0FeatureId[]
  ) {
    super(
      `Feature ${featureId} has unmet dependencies: ${missingDependencies.join(', ')}`,
      featureId
    );
    this.name = 'DependencyError';
  }
}

export class HealthCheckError extends P0IntegrationError {
  constructor(featureId: P0FeatureId, message: string) {
    super(`Health check failed for ${featureId}: ${message}`, featureId);
    this.name = 'HealthCheckError';
  }
}

/**
 * Backend Type Definitions for Frontend
 *
 * Re-exports all backend types with zero `any` types.
 * Full TypeScript safety for frontend-backend communication.
 *
 * @module types/backend
 */

// ===== Core Slide Types =====
export type {
  Slide,
  SlideMetadata,
  Asset,
  AssetPlacement,
  AssetSize,
  LayoutType,
  LayoutDecision,
  DesignRule,
  Theme,
  ColorScheme,
  Typography,
  Spacing,
  VisualEffects,
  ContentAnalysis,
  AssetSuggestion,
} from '../../types/index.js';

// ===== Gemini API Types =====
export type {
  GeminiConfig,
  GeminiRequest,
  GeminiResponse,
} from '../../types/index.js';

// ===== Agent Types =====
export type {
  AgentTask,
  AgentType,
  ResearchResult,
  ContentOutline,
  OutlineSection,
  DesignDecision,
  AssetStrategy,
} from '../../types/index.js';

// ===== Generation Types =====
export type {
  SlideGenerationRequest,
  SlideGenerationResult,
  GenerationMetadata,
  HTMLSlideOptions,
  HTMLGenerationResult,
} from '../../types/index.js';

// ===== P0 Integration Types =====
export type {
  P0FeatureId,
  FeatureStatus,
  IntegrationHealth,
  FeatureInfo,
  P0IntegrationConfig,
  InitializationResult,
  FeatureHealthCheck,
  IntegrationHealthReport,
} from '../../types/p0-integration.js';

// ===== P1 Integration Types =====
export type {
  P1FeatureId,
  P1FeatureInfo,
  P1FeatureStatus,
  P1IntegrationHealth,
  P1IntegrationConfig,
  P1InitializationResult,
  P1FeatureHealthCheck,
  P1IntegrationHealthReport,
  BatchResult,
} from '../../types/p1-integration.js';

// ===== P2 Integration Types =====
export type {
  P2FeatureId,
  P2FeatureInfo,
  P2FeatureStatus,
  P2IntegrationHealth,
  P2IntegrationConfig,
  P2InitializationResult,
  P2FeatureHealthCheck,
  P2IntegrationHealthReport,
  P2BatchResult,
} from '../../types/p2-integration.js';

// ===== Combined Integration Types =====
export type {
  FeatureId,
  SlideDesignerIntegrationConfig,
  CombinedInitializationResult,
  CombinedHealthReport,
} from '../../integration.js';

// ===== Core V2 Types =====
export type {
  // Grid Layout
  GridSystem,
  GridLayout,
  GridArea,
  LayoutValidation,

  // Typography
  TypeScale,
  TypographySizes,
  ContentMetrics,
  TypographyValidation,

  // Color Engine
  ColorPalette,
  ContrastCheck,
  ColorValidation,

  // Chart Renderer
  ChartConfig,
  ChartTheme,

  // Master Slides
  MasterSlide,
  SlideOverrides,
  BrandKit,

  // Text Overflow
  OverflowStrategy,
  OverflowResult,
  TextMetrics,

  // Image Optimization
  OptimizationConfig,
  OptimizedImage,
  ImageMetrics,

  // Transitions
  TransitionPreset,
  TransitionConfig,
  ElementAnimation,

  // Accessibility
  AccessibilityFeatures,
  AccessibilityReport,
  AccessibilityIssue,

  // Export
  ExportConfig,
  ExportResult,
  SlideExport,
} from '../../core-v2/index.js';

// ===== Error Types =====
export {
  SlideDesignerError,
  GeminiAPIError,
  LayoutEngineError,
  AgentError,
} from '../../types/index.js';

export {
  P0IntegrationError,
  FeatureInitializationError,
  DependencyError,
  HealthCheckError,
} from '../../types/p0-integration.js';

export {
  P1IntegrationError,
  P1FeatureInitializationError,
  P1DependencyError,
  P1HealthCheckError,
  P1FeatureDisabledError,
} from '../../types/p1-integration.js';

export {
  P2IntegrationError,
  P2FeatureInitializationError,
  P2DependencyError,
  P2HealthCheckError,
  P2FeatureDisabledError,
  P2LazyLoadError,
} from '../../types/p2-integration.js';

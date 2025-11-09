/**
 * Slide Designer Frontend Integration
 *
 * Main entry point for frontend integration with the slide-designer backend.
 * Provides typed API client, React hooks, validation schemas, and type definitions.
 *
 * @module frontend-integration
 */

// ===== API Client =====
export { BackendClient, backendClient } from './api/backend-client.js';
export type { ApiError, RequestOptions } from './api/backend-client.js';

// ===== React Hooks =====
export {
  useBackendInitialization,
  useGeneratePresentation,
  useP0Feature,
  useP0Health,
  useP1Feature,
  useEnableP1Feature,
  useDisableP1Feature,
  useP2Feature,
  useEnableP2Feature,
  useDisableP2Feature,
  useBackendHealth,
  useIsBackendHealthy,
  useBackendReady,
  useCancelBackendRequests,
  queryKeys,
} from './hooks/use-backend.js';

// ===== Type Definitions =====
export type {
  // Core types
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

  // Gemini types
  GeminiConfig,
  GeminiRequest,
  GeminiResponse,

  // Agent types
  AgentTask,
  AgentType,
  ResearchResult,
  ContentOutline,
  OutlineSection,
  DesignDecision,
  AssetStrategy,

  // Generation types
  SlideGenerationRequest,
  SlideGenerationResult,
  GenerationMetadata,
  HTMLSlideOptions,
  HTMLGenerationResult,

  // P0 types
  P0FeatureId,
  FeatureStatus,
  IntegrationHealth,
  FeatureInfo,
  P0IntegrationConfig,
  InitializationResult,
  FeatureHealthCheck,
  IntegrationHealthReport,

  // P1 types
  P1FeatureId,
  P1FeatureInfo,
  P1FeatureStatus,
  P1IntegrationHealth,
  P1IntegrationConfig,
  P1InitializationResult,
  P1FeatureHealthCheck,
  P1IntegrationHealthReport,
  BatchResult,

  // P2 types
  P2FeatureId,
  P2FeatureInfo,
  P2FeatureStatus,
  P2IntegrationHealth,
  P2IntegrationConfig,
  P2InitializationResult,
  P2FeatureHealthCheck,
  P2IntegrationHealthReport,
  P2BatchResult,

  // Combined types
  FeatureId,
  SlideDesignerIntegrationConfig,
  CombinedInitializationResult,
  CombinedHealthReport,

  // Core V2 types
  GridSystem,
  GridLayout,
  GridArea,
  LayoutValidation,
  TypeScale,
  TypographySizes,
  ContentMetrics,
  TypographyValidation,
  ColorPalette,
  ContrastCheck,
  ColorValidation,
  ChartConfig,
  ChartTheme,
  MasterSlide,
  SlideOverrides,
  BrandKit,
  OverflowStrategy,
  OverflowResult,
  TextMetrics,
  OptimizationConfig,
  OptimizedImage,
  ImageMetrics,
  TransitionPreset,
  TransitionConfig,
  ElementAnimation,
  AccessibilityFeatures,
  AccessibilityReport,
  AccessibilityIssue,
  ExportConfig,
  ExportResult,
  SlideExport,
} from './types/backend.js';

// ===== Error Classes =====
export {
  SlideDesignerError,
  GeminiAPIError,
  LayoutEngineError,
  AgentError,
  P0IntegrationError,
  FeatureInitializationError,
  DependencyError,
  HealthCheckError,
  P1IntegrationError,
  P1FeatureInitializationError,
  P1DependencyError,
  P1HealthCheckError,
  P1FeatureDisabledError,
  P2IntegrationError,
  P2FeatureInitializationError,
  P2DependencyError,
  P2HealthCheckError,
  P2FeatureDisabledError,
  P2LazyLoadError,
} from './types/backend.js';

// ===== Validation Schemas =====
export {
  AssetPlacementSchema,
  AssetSizeSchema,
  AssetSchema,
  SlideMetadataSchema,
  ColorSchemeSchema,
  TypographySchema,
  SpacingSchema,
  VisualEffectsSchema,
  ThemeSchema,
  LayoutTypeSchema,
  SlideSchema,
  SlideGenerationRequestSchema,
  OutlineSectionSchema,
  ContentOutlineSchema,
  AgentTaskSchema,
  GenerationMetadataSchema,
  SlideGenerationResultSchema,
  P0FeatureIdSchema,
  P1FeatureIdSchema,
  P2FeatureIdSchema,
  FeatureStatusSchema,
  IntegrationHealthSchema,
  FeatureHealthCheckSchema,
  CombinedHealthReportSchema,
  ApiErrorSchema,
} from './schemas/backend.js';

// ===== Schema Type Inference =====
export type {
  SlideGenerationRequestInput,
  SlideGenerationResultOutput,
  CombinedHealthReportOutput,
  ApiErrorOutput,
} from './schemas/backend.js';

/**
 * Zod Schemas for Runtime Validation
 *
 * Provides runtime type checking and validation for all backend types.
 * Ensures type safety at runtime, not just compile time.
 *
 * @module schemas/backend
 */

import { z } from 'zod';

// ===== Core Schema Definitions =====

/**
 * Asset placement schema
 */
export const AssetPlacementSchema = z.object({
  position: z.enum(['left', 'right', 'center', 'background', 'top', 'bottom']),
  width: z.string(),
  height: z.string(),
  x: z.number().optional(),
  y: z.number().optional(),
});

/**
 * Asset size schema
 */
export const AssetSizeSchema = z.object({
  width: z.number(),
  height: z.number(),
  unit: z.enum(['px', '%', 'em', 'rem']),
});

/**
 * Asset schema
 */
export const AssetSchema = z.object({
  type: z.enum(['image', 'icon', 'chart', 'diagram']),
  url: z.string().optional(),
  description: z.string(),
  placement: AssetPlacementSchema,
  size: AssetSizeSchema,
  alt: z.string(),
});

/**
 * Slide metadata schema
 */
export const SlideMetadataSchema = z.object({
  order: z.number(),
  duration: z.number().optional(),
  transitions: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * Color scheme schema
 */
export const ColorSchemeSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  accent: z.string(),
  background: z.string(),
  text: z.string(),
  textSecondary: z.string(),
  border: z.string().optional(),
});

/**
 * Typography schema
 */
export const TypographySchema = z.object({
  fontFamily: z.string(),
  headingFont: z.string().optional(),
  baseSize: z.string(),
  lineHeight: z.number(),
  headingSizes: z.object({
    h1: z.string(),
    h2: z.string(),
    h3: z.string(),
  }),
  weights: z.object({
    normal: z.number(),
    medium: z.number(),
    bold: z.number(),
  }),
});

/**
 * Spacing schema
 */
export const SpacingSchema = z.object({
  base: z.string(),
  small: z.string(),
  medium: z.string(),
  large: z.string(),
  xlarge: z.string(),
});

/**
 * Visual effects schema
 */
export const VisualEffectsSchema = z.object({
  shadows: z.boolean().optional(),
  gradients: z.boolean().optional(),
  borderRadius: z.string().optional(),
  animations: z.boolean().optional(),
});

/**
 * Theme schema
 */
export const ThemeSchema = z.object({
  name: z.string(),
  colors: ColorSchemeSchema,
  typography: TypographySchema,
  spacing: SpacingSchema,
  effects: VisualEffectsSchema.optional(),
});

/**
 * Layout type schema
 */
export const LayoutTypeSchema = z.enum([
  'title-slide',
  'content-only',
  'content-image-split',
  'image-focus',
  'bullet-points',
  'two-column',
  'quote',
  'section-header',
  'comparison',
  'timeline',
]);

/**
 * Slide schema
 */
export const SlideSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  layout: LayoutTypeSchema,
  theme: ThemeSchema,
  assets: z.array(AssetSchema).optional(),
  metadata: SlideMetadataSchema,
});

// ===== Request/Response Schemas =====

/**
 * Slide generation request schema
 */
export const SlideGenerationRequestSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  slideCount: z.number().min(1).max(50).optional(),
  tone: z.enum(['formal', 'casual', 'technical']).optional(),
  audience: z.string().optional(),
  includeImages: z.boolean().optional(),
  themePreference: z.string().optional(),
});

/**
 * Outline section schema
 */
export const OutlineSectionSchema = z.object({
  title: z.string(),
  points: z.array(z.string()),
  slideCount: z.number(),
  hasVisuals: z.boolean(),
});

/**
 * Content outline schema
 */
export const ContentOutlineSchema = z.object({
  title: z.string(),
  sections: z.array(OutlineSectionSchema),
  totalSlides: z.number(),
  estimatedDuration: z.number(),
  tone: z.string(),
});

/**
 * Agent task schema
 */
export const AgentTaskSchema = z.object({
  id: z.string(),
  type: z.enum(['research', 'content', 'design', 'asset', 'generator']),
  description: z.string(),
  priority: z.enum(['high', 'medium', 'low']),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']),
  input: z.record(z.unknown()),
  output: z.record(z.unknown()).optional(),
  error: z.string().optional(),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
});

/**
 * Generation metadata schema
 */
export const GenerationMetadataSchema = z.object({
  generatedAt: z.date(),
  totalSlides: z.number(),
  totalAssets: z.number(),
  processingTime: z.number(),
  agentTasks: z.array(AgentTaskSchema),
  version: z.string(),
});

/**
 * Slide generation result schema
 */
export const SlideGenerationResultSchema = z.object({
  slides: z.array(SlideSchema),
  outline: ContentOutlineSchema,
  theme: ThemeSchema,
  metadata: GenerationMetadataSchema,
  html: z.string(),
});

// ===== Feature Status Schemas =====

/**
 * P0 feature ID schema
 */
export const P0FeatureIdSchema = z.enum([
  'grid-layout',
  'typography',
  'color-palettes',
  'charts',
  'text-overflow',
  'master-slides',
  'transitions',
  'accessibility',
  'export',
  'image-optimization',
  'content-validation',
  'llm-judge',
]);

/**
 * P1 feature ID schema
 */
export const P1FeatureIdSchema = z.enum([
  'slide-manager',
  'template-library',
  'speaker-notes',
  'video-embed',
  'custom-fonts',
  'data-import',
  'i18n',
  'ai-image-generation',
  'version-history',
  'analytics',
  'mobile-app',
  'collaboration',
  'live-presentation',
  'interactive-widgets',
  'real-time-sync',
]);

/**
 * P2 feature ID schema
 */
export const P2FeatureIdSchema = z.enum([
  'voice-narration',
  'api-access',
  'interactive-elements',
  'themes-marketplace',
  '3d-animations',
  'design-import',
  'ar-presentation',
  'blockchain-nft',
]);

/**
 * Feature status schema
 */
export const FeatureStatusSchema = z.enum(['initializing', 'ready', 'degraded', 'failed', 'disabled', 'lazy-loading']);

/**
 * Integration health schema
 */
export const IntegrationHealthSchema = z.enum(['healthy', 'degraded', 'critical', 'partial', 'lazy-loading']);

/**
 * Feature health check schema
 */
export const FeatureHealthCheckSchema = z.object({
  featureId: z.string(),
  status: FeatureStatusSchema,
  healthy: z.boolean(),
  enabled: z.boolean().optional(),
  message: z.string().optional(),
  timestamp: z.date(),
});

/**
 * Combined health report schema
 */
export const CombinedHealthReportSchema = z.object({
  overallHealth: IntegrationHealthSchema,
  p0: z.object({
    overallHealth: IntegrationHealthSchema,
    features: z.array(FeatureHealthCheckSchema),
    timestamp: z.date(),
    summary: z.object({
      total: z.number(),
      ready: z.number(),
      degraded: z.number(),
      failed: z.number(),
    }),
  }),
  p1: z.object({
    overallHealth: IntegrationHealthSchema,
    features: z.array(FeatureHealthCheckSchema),
    timestamp: z.date(),
    summary: z.object({
      total: z.number(),
      ready: z.number(),
      degraded: z.number(),
      failed: z.number(),
      disabled: z.number(),
    }),
  }).optional(),
  p2: z.object({
    overallHealth: IntegrationHealthSchema,
    features: z.array(FeatureHealthCheckSchema),
    timestamp: z.date(),
    summary: z.object({
      total: z.number(),
      ready: z.number(),
      degraded: z.number(),
      failed: z.number(),
      disabled: z.number(),
      lazyLoading: z.number(),
    }),
  }).optional(),
  timestamp: z.date(),
  summary: z.object({
    totalFeatures: z.number(),
    readyFeatures: z.number(),
    degradedFeatures: z.number(),
    failedFeatures: z.number(),
    disabledFeatures: z.number(),
    lazyLoadingFeatures: z.number(),
  }),
});

// ===== Error Envelope Schema =====

/**
 * API error envelope schema
 */
export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
  timestamp: z.string(),
  featureId: z.string().optional(),
});

// ===== Type Inference Helpers =====

export type SlideGenerationRequestInput = z.infer<typeof SlideGenerationRequestSchema>;
export type SlideGenerationResultOutput = z.infer<typeof SlideGenerationResultSchema>;
export type CombinedHealthReportOutput = z.infer<typeof CombinedHealthReportSchema>;
export type ApiErrorOutput = z.infer<typeof ApiErrorSchema>;

/**
 * Core V2 - Production-Grade Slide Designer Engines
 *
 * This module contains the V2 architecture components that replace
 * the original V1 implementations with professional-grade systems.
 */

export {
  GridLayoutEngine,
  gridLayoutEngine,
  type GridSystem,
  type GridLayout,
  type GridArea,
  type ContentAnalysis,
  type LayoutValidation
} from './grid-layout-engine';

export {
  TypographyEngine,
  typographyEngine,
  type TypeScale,
  type TypographySizes,
  type ContentMetrics,
  type TypographyValidation
} from './typography-engine';

export {
  ColorEngine,
  colorEngine,
  type ColorPalette,
  type ContrastCheck,
  type ColorValidation
} from './color-engine';

export {
  ChartRenderer,
  chartRenderer,
  type ChartConfig,
  type ChartTheme
} from './chart-renderer';

export {
  MasterSlideManager,
  masterSlideManager,
  type MasterSlide,
  type SlideOverrides,
  type BrandKit
} from './master-slide-manager';

export {
  TextOverflowHandler,
  textOverflowHandler,
  type OverflowStrategy,
  type OverflowResult,
  type TextMetrics
} from './text-overflow-handler';

export {
  ImageOptimizer,
  imageOptimizer,
  type OptimizationConfig,
  type OptimizedImage,
  type ImageMetrics
} from './image-optimizer';

export {
  TransitionEngine,
  transitionEngine,
  type TransitionPreset,
  type TransitionConfig,
  type ElementAnimation
} from './transition-engine';

export {
  AccessibilityEngine,
  accessibilityEngine,
  type AccessibilityFeatures,
  type AccessibilityReport,
  type AccessibilityIssue
} from './accessibility-engine';

export {
  ExportEngine,
  exportEngine,
  type ExportConfig,
  type ExportResult,
  type SlideExport
} from './export-engine';

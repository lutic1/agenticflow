/**
 * Custom hooks for P0 features
 * Wraps backend hooks with additional UI-specific logic
 */

import { useP0Feature } from '@backend/frontend-integration/hooks/use-backend';
import type {
  GridSystem,
  TypeScale,
  ColorPalette,
  ChartConfig,
  MasterSlide,
  OverflowStrategy,
  OptimizationConfig,
  TransitionPreset,
  AccessibilityFeatures,
  ExportConfig,
} from '@backend/frontend-integration/types/backend';

export function useGridLayout() {
  return useP0Feature<GridSystem>('grid-layout');
}

export function useTypography() {
  return useP0Feature<TypeScale>('typography');
}

export function useColorPalettes() {
  return useP0Feature<ColorPalette[]>('color-palettes');
}

export function useChartComponents() {
  return useP0Feature<ChartConfig>('chart-components');
}

export function useTextOverflow() {
  return useP0Feature<OverflowStrategy>('text-overflow');
}

export function useMasterSlides() {
  return useP0Feature<MasterSlide[]>('master-slides');
}

export function useBasicTransitions() {
  return useP0Feature<TransitionPreset[]>('basic-transitions');
}

export function useAccessibility() {
  return useP0Feature<AccessibilityFeatures>('accessibility');
}

export function useExportFormats() {
  return useP0Feature<ExportConfig>('export-formats');
}

export function useImageOptimization() {
  return useP0Feature<OptimizationConfig>('image-optimization');
}

export function useContentValidation() {
  return useP0Feature<unknown>('content-validation');
}

export function useLLMJudge() {
  return useP0Feature<unknown>('llm-judge');
}

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

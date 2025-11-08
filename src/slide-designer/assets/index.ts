/**
 * Asset Management System - Main Export
 * Professional asset management for slide presentations
 */

export { ImageFinder } from './image-finder';
export type { ImageSearchResult, ImageSearchOptions } from './image-finder';

export { IconManager } from './icon-manager';
export type { IconDefinition, IconSearchOptions } from './icon-manager';

export { AssetCache } from './asset-cache';
export type { CacheEntry, CacheOptions, AssetOptimizationOptions } from './asset-cache';

export { ThemeManager } from './theme-manager';
export type {
  ColorScheme,
  TypographyPairing,
  LayoutVariation,
  Theme
} from './theme-manager';

// P1.1: Expanded Icon Library (100+ icons)
export { IconLibrary, iconLibrary } from './icon-library';
export type {
  IconDefinition as IconLibraryDefinition,
  IconCategory,
  IconSearchOptions as IconLibrarySearchOptions
} from './icon-library';

// P1.2: Background Patterns & Textures (20 patterns)
export { BackgroundPatternLibrary, backgroundPatternLibrary } from './background-patterns';
export type {
  BackgroundPattern,
  PatternCategory,
  PatternOptions
} from './background-patterns';

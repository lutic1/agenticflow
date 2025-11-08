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

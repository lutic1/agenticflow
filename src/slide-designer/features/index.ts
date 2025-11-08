/**
 * Slide Designer Features
 * Advanced presentation features and tools
 */

// P1.4: Slide Duplication & Reordering
export {
  SlideManager,
  getGlobalSlideManager,
  setGlobalSlideManager
} from './slide-manager';

export type {
  SlideData,
  PresentationState,
  HistoryEntry,
  DragDropEvent
} from './slide-manager';

// P1.5: Template Library (20 pre-built decks)
export { TemplateLibrary, templateLibrary } from './template-library';
export type {
  PresentationTemplate,
  TemplateCategory,
  TemplateSlide,
  TemplateSearchOptions
} from './template-library';

// P1.7: Video Embed Support
export { VideoEmbedManager, videoEmbedManager } from './video-embed';
export type {
  VideoEmbed,
  VideoOptions
} from './video-embed';

// P1.12: Data Import (CSV, Excel, JSON)
export { DataImportManager, dataImportManager } from './data-import';
export type {
  DataImportResult,
  ImportOptions
} from './data-import';

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

// P1.3: Speaker Notes UI
export { SpeakerNotesManager, speakerNotesManager } from './speaker-notes';
export type {
  SpeakerNote,
  PresenterView,
  TimerSettings
} from './speaker-notes';

// P1.8: Custom Font Upload
export { CustomFontManager, customFontManager } from './custom-fonts';
export type {
  CustomFont,
  FontUploadResult,
  FontValidation
} from './custom-fonts';

// P1.11: AI Image Generation (DALL-E 3)
export { AIImageGenerationManager, aiImageGenerator } from './ai-image-generation';
export type {
  ImageGenerationRequest,
  GeneratedImage,
  ImageGenerationResult
} from './ai-image-generation';

// P1.6: Multi-Language Support (i18n)
export { I18nManager, i18n, t } from './i18n';
export type {
  SupportedLanguage,
  LanguageConfig,
  TranslationDictionary,
  TranslationOptions
} from './i18n';

// P1.10: Version History
export { VersionHistoryManager, versionHistory } from './version-history';
export type {
  Version,
  PresentationSnapshot,
  VersionDiff,
  RestoreOptions
} from './version-history';

// P1.13: Presentation Analytics
export { PresentationAnalyticsManager, presentationAnalytics } from './analytics';
export type {
  AnalyticsEvent,
  AnalyticsEventType,
  SessionMetrics,
  SlideMetrics,
  ViewerInfo,
  DeviceInfo,
  HeatmapData,
  AnalyticsSummary
} from './analytics';

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

// P1.9: Collaboration Features
export { CollaborationManager, collaborationManager } from './collaboration';
export type {
  Collaborator,
  Comment,
  CommentReply,
  PresenceUpdate,
  CollaborationSession
} from './collaboration';

// P1.15: Live Presentation Mode
export { LivePresentationManager, livePresentationManager } from './live-presentation';
export type {
  LiveSession,
  Presenter,
  Attendee,
  Question,
  Poll,
  PollOption,
  Reaction,
  LiveControlMessage
} from './live-presentation';

// P1.14: Mobile App (React Native)
export { MobileAppManager, mobileAppManager } from './mobile-app';
export type {
  MobileAppConfig,
  SplashScreenConfig,
  AppIconConfig,
  MobilePermissions,
  MobileFeatures,
  ResponsiveBreakpoints,
  OfflineCache,
  CachedPresentation
} from './mobile-app';

// P2.3: Voice Narration (TTS)
export { VoiceNarrationManager, voiceNarrationManager } from './voice-narration';
export type {
  VoiceProfile,
  NarrationSettings,
  SlideNarration,
  NarrationTrack,
  SpeechSynthesisOptions
} from './voice-narration';

// P2.6: API Access for Developers
export { APIAccessManager, apiAccessManager } from './api-access';
export type {
  APIKey,
  APIScope,
  RateLimit,
  APIRequest,
  Webhook,
  WebhookEvent,
  APIEndpoint,
  APIParameter,
  APISchema,
  APIExample,
  OAuthClient,
  RateLimitStatus
} from './api-access';

// P2.4: Interactive Elements (Polls, Quizzes, Q&A)
export { InteractiveElementsManager, interactiveElementsManager } from './interactive-elements';
export type {
  Poll,
  PollOption,
  Quiz,
  QuizQuestion,
  QuizOption,
  QuizAttempt,
  QuizAnswer,
  QnASession,
  Question,
  FeedbackForm,
  FeedbackField,
  FeedbackResponse,
  InteractionAnalytics
} from './interactive-elements';

// P2.5: Slide Themes Marketplace
export { ThemesMarketplaceManager, themesMarketplaceManager } from './themes-marketplace';
export type {
  Theme,
  ThemeCategory,
  ThemeAuthor,
  ThemePrice,
  ThemePreview,
  ThemeColors,
  ThemeFonts,
  ThemeFont,
  ThemeLayout,
  ThemeAssets,
  ThemeMetadata,
  ThemeChangelog,
  ThemeReview,
  InstalledTheme,
  ThemeSearchOptions,
  ThemePurchase,
  MarketplaceStats
} from './themes-marketplace';

// P2.1: 3D Animations (Three.js)
export { ThreeDAnimationsManager, threeDAnimationsManager } from './3d-animations';
export type {
  Scene3D,
  Camera3D,
  Vector3,
  Object3D,
  Material3D,
  Geometry3D,
  Light3D,
  ParticleConfig,
  Text3DConfig,
  Animation3D,
  AnimationKeyframe,
  SceneSettings,
  ModelLoader,
  RenderConfig
} from './3d-animations';

// P2.7: Figma/Sketch Import
export { DesignImportManager, designImportManager } from './design-import';
export type {
  DesignImport,
  DesignPage,
  DesignFrame,
  DesignLayer,
  LayerType,
  Fill,
  Gradient,
  GradientStop,
  Stroke,
  Effect,
  Constraints,
  TextProperties,
  ImageProperties,
  VectorProperties,
  ExportSettings,
  ImportedAsset,
  DesignStyles,
  ColorStyle,
  TextStyle,
  EffectStyle,
  ImportMetadata,
  FigmaConfig,
  SketchConfig,
  ImportOptions,
  SlideConversion
} from './design-import';

// P2.2: AR Presentation Mode (WebXR)
export { ARPresentationManager, arPresentationManager } from './ar-presentation';
export type {
  ARSession,
  ARParticipant,
  Vector3D,
  Quaternion,
  ARDevice,
  ARCapabilities,
  ARAnchoredObject,
  ARAnchor,
  ARContent,
  ARSettings,
  ARGesture,
  ARMarker,
  ARHitTestResult,
  ARSpatialAudio,
  ARRecording
} from './ar-presentation';

// P2.8: Blockchain Presentation NFTs
export { BlockchainNFTManager, blockchainNFTManager } from './blockchain-nft';
export type {
  PresentationNFT,
  BlockchainNetwork,
  NFTCreator,
  NFTOwner,
  NFTMetadata,
  NFTAttribute,
  NFTProperties,
  RoyaltyConfig,
  NFTPricing,
  AuctionConfig,
  NFTListing,
  WalletConnection,
  MintRequest,
  NFTTransaction,
  IPFSUpload,
  SmartContractConfig
} from './blockchain-nft';

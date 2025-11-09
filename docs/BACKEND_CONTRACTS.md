# Backend API Contracts

This document defines the stable API contracts for the Slide Designer backend. These contracts are enforced through automated contract tests and breaking change detection.

## Purpose

- **Stability**: Ensure frontend can reliably integrate with backend
- **Backward Compatibility**: Prevent breaking changes without versioning
- **Documentation**: Single source of truth for API surface
- **Safe Refactoring**: Allow internal changes without breaking consumers

## Contract Test Coverage

All public APIs are covered by contract tests in `/tests/contract/`:

- **backend-contracts.test.ts** - Validates all exported classes, functions, and types
- **schema-drift.test.ts** - Detects changes in response object structures
- **CI/CD Gate** - Prevents merging breaking changes

## Core Modules

### SlideGenerator

**Factory Function**: `getSlideGenerator(): SlideGenerator`

**Main Method**:
```typescript
async generatePresentation(request: SlideGenerationRequest): Promise<SlideGenerationResult>
```

**Request Type**:
```typescript
interface SlideGenerationRequest {
  topic: string;
  slideCount?: number;
  tone?: 'formal' | 'casual' | 'technical';
  audience?: string;
  includeImages?: boolean;
  themePreference?: string;
}
```

**Response Type**:
```typescript
interface SlideGenerationResult {
  slides: Slide[];
  outline: ContentOutline;
  theme: Theme;
  metadata: GenerationMetadata;
  html: string;
}
```

**Contract Guarantees**:
- Always returns all 5 top-level properties
- `slides` array always contains at least 1 slide
- `html` is always a non-empty string
- `metadata.generatedAt` is always a valid Date object
- Throws `SlideDesignerError` on failures

### Quick Start Function

**Function**: `generatePresentation(topic, options?): Promise<SlideGenerationResult>`

**Signature**:
```typescript
async function generatePresentation(
  topic: string,
  options?: {
    slideCount?: number;
    tone?: 'formal' | 'casual' | 'technical';
    theme?: string;
    includeImages?: boolean;
  }
): Promise<SlideGenerationResult>
```

**Contract Guarantees**:
- Accepts topic as first positional argument
- All options are optional
- Returns same structure as `SlideGenerator.generatePresentation()`

## Integration Modules

### SlideDesignerIntegration

**Singleton Access**: `slideDesignerIntegration` or `SlideDesignerIntegration.getInstance()`

**Core Methods**:

```typescript
// Initialize all features (P0 + P1 + P2)
async initialize(config?: Partial<SlideDesignerIntegrationConfig>): Promise<CombinedInitializationResult>

// Get P0 (core) feature
getP0Feature<T>(featureId: P0FeatureId): T

// Get P1 (advanced) feature
getP1Feature<T>(featureId: P1FeatureId): T

// Get P2 (nice-to-have) feature
getP2Feature<T>(featureId: P2FeatureId): T

// Check feature availability
isP0FeatureAvailable(featureId: P0FeatureId): boolean
isP1FeatureAvailable(featureId: P1FeatureId): boolean
isP2FeatureAvailable(featureId: P2FeatureId): boolean

// Enable/disable P1/P2 features at runtime
enableP1Feature(featureId: P1FeatureId): void
disableP1Feature(featureId: P1FeatureId): void
enableP2Feature(featureId: P2FeatureId): void
disableP2Feature(featureId: P2FeatureId): void

// Health monitoring
getHealthReport(): CombinedHealthReport
isHealthy(): boolean
isInitialized(): boolean

// Cleanup
async shutdown(): Promise<void>
```

**Initialization Result**:
```typescript
interface CombinedInitializationResult {
  success: boolean;
  p0: InitializationResult;
  p1?: P1InitializationResult;
  p2?: P2InitializationResult;
  duration: number;
  message: string;
}
```

**Health Report**:
```typescript
interface CombinedHealthReport {
  overallHealth: 'healthy' | 'degraded' | 'critical';
  p0: IntegrationHealthReport;
  p1?: P1IntegrationHealthReport;
  p2?: P2IntegrationHealthReport;
  timestamp: Date;
  summary: {
    totalFeatures: number;
    readyFeatures: number;
    degradedFeatures: number;
    failedFeatures: number;
    disabledFeatures: number;
    lazyLoadingFeatures: number;
  };
}
```

**Contract Guarantees**:
- `initialize()` always returns all required fields
- P0 initialization never throws (returns graceful errors)
- P1/P2 failures don't affect P0 functionality
- Health reports always include P0, optionally P1/P2
- All methods are synchronous except `initialize()` and `shutdown()`

### P0Integration (Core Features)

**Features** (12 total):
- `grid-layout` - 12-column grid system
- `typography` - Professional type scale
- `color-palettes` - WCAG-compliant colors
- `charts` - Chart.js integration
- `text-overflow` - Intelligent text handling
- `master-slides` - Slide templates
- `transitions` - Animations
- `accessibility` - WCAG AAA compliance
- `export-quality` - PDF/PPTX export
- `image-optimization` - Image processing
- `content-validation` - Rule-based validation
- `llm-judge` - AI quality control

**Methods**:
```typescript
async initialize(): Promise<InitializationResult>
getFeature<T>(featureId: P0FeatureId): T
getFeatureStatus(featureId: P0FeatureId): FeatureStatus
getHealthReport(): IntegrationHealthReport
isHealthy(): boolean
```

**Contract Guarantees**:
- All 12 features are always initialized
- Features return graceful degradation on failure
- `getFeature()` never throws, returns degraded instance
- Status is one of: 'ready' | 'degraded' | 'failed' | 'pending'

### P1Integration (Advanced Features)

**Features** (15 total):
- `slide-manager` - Slide organization
- `template-library` - Pre-built templates
- `video-embed` - Video integration
- `data-import` - CSV/JSON import
- `speaker-notes` - Presenter notes
- `custom-fonts` - Font management
- `ai-image-generation` - AI images
- `i18n` - Internationalization
- `version-history` - Version control
- `analytics` - Usage tracking
- `collaboration` - Real-time collab
- `live-presentation` - Live mode
- `mobile-app` - Mobile support
- `voice-narration` - Text-to-speech
- `api-access` - REST API

**Methods**:
```typescript
async initialize(): Promise<P1InitializationResult>
getFeature<T>(featureId: P1FeatureId): T
getFeatureStatus(featureId: P1FeatureId): P1FeatureStatus
enableFeature(featureId: P1FeatureId): void
disableFeature(featureId: P1FeatureId): void
isFeatureEnabled(featureId: P1FeatureId): boolean
```

**Contract Guarantees**:
- Features can be enabled/disabled at runtime
- Disabled features throw `P1FeatureDisabledError`
- Feature flags persist within session
- Status includes 'disabled' state

### P2Integration (Nice-to-Have Features)

**Features** (8 total):
- `interactive-elements` - Interactive widgets
- `themes-marketplace` - Theme store
- `3d-animations` - 3D effects
- `design-import` - Import from Figma/Sketch
- `ar-presentation` - Augmented reality
- `blockchain-nft` - NFT integration
- `advanced-security` - Enhanced security
- `performance-monitoring` - Performance tracking

**Methods**:
```typescript
async initialize(): Promise<P2InitializationResult>
getFeature<T>(featureId: P2FeatureId): T
getFeatureStatus(featureId: P2FeatureId): P2FeatureStatus
enableFeature(featureId: P2FeatureId): void
disableFeature(featureId: P2FeatureId): void
```

**Contract Guarantees**:
- Features are lazy-loaded on first access
- Heavy dependencies loaded on-demand
- P2 failures never affect P0/P1
- Lazy loading tracked in health reports

## Type Exports

### Core Types

```typescript
// Slide structure
interface Slide {
  id: string;
  title: string;
  content: string;
  layout: LayoutType;
  theme: Theme;
  assets?: Asset[];
  metadata: SlideMetadata;
}

// Metadata
interface SlideMetadata {
  order: number;
  duration?: number;
  transitions?: string;
  notes?: string;
  tags?: string[];
}

// Theme
interface Theme {
  name: string;
  colors: ColorScheme;
  typography: Typography;
  spacing: Spacing;
  effects?: VisualEffects;
}

// Layout types (10 options)
type LayoutType =
  | 'title-slide'
  | 'content-only'
  | 'content-image-split'
  | 'image-focus'
  | 'bullet-points'
  | 'two-column'
  | 'quote'
  | 'section-header'
  | 'comparison'
  | 'timeline';
```

### Feature IDs

```typescript
type P0FeatureId =
  | 'grid-layout' | 'typography' | 'color-palettes' | 'charts'
  | 'text-overflow' | 'master-slides' | 'transitions'
  | 'accessibility' | 'export-quality' | 'image-optimization'
  | 'content-validation' | 'llm-judge';

type P1FeatureId =
  | 'slide-manager' | 'template-library' | 'video-embed' | 'data-import'
  | 'speaker-notes' | 'custom-fonts' | 'ai-image-generation' | 'i18n'
  | 'version-history' | 'analytics' | 'collaboration' | 'live-presentation'
  | 'mobile-app' | 'voice-narration' | 'api-access';

type P2FeatureId =
  | 'interactive-elements' | 'themes-marketplace' | '3d-animations'
  | 'design-import' | 'ar-presentation' | 'blockchain-nft'
  | 'advanced-security' | 'performance-monitoring';
```

## Error Types

All errors extend `SlideDesignerError`:

```typescript
class SlideDesignerError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  )
}

class GeminiAPIError extends SlideDesignerError {
  code: 'GEMINI_API_ERROR'
}

class LayoutEngineError extends SlideDesignerError {
  code: 'LAYOUT_ENGINE_ERROR'
}

class AgentError extends SlideDesignerError {
  code: 'AGENT_ERROR'
  agentType: AgentType
}

class P0IntegrationError extends SlideDesignerError {
  // P0 integration errors
}

class P1IntegrationError extends SlideDesignerError {
  // P1 integration errors
}

class P1FeatureDisabledError extends P1IntegrationError {
  // Thrown when accessing disabled P1 feature
}

class P2IntegrationError extends SlideDesignerError {
  // P2 integration errors
}

class P2LazyLoadError extends P2IntegrationError {
  // Lazy loading failures
}
```

**Contract Guarantees**:
- All errors have `message`, `code`, and `details` properties
- Error codes are stable and documented
- `details` object provides structured error information
- Errors are JSON-serializable

## Agents

All agents follow the same pattern:

```typescript
// Class export
export class ResearchAgent { }

// Factory export
export function getResearchAgent(): ResearchAgent
```

**Available Agents**:
- `ResearchAgent` - Topic research
- `ContentAgent` - Content generation
- `DesignAgent` - Design decisions
- `AssetAgent` - Asset management
- `GeneratorAgent` - Slide generation

## Configuration

### Gemini Configuration

```typescript
export function getGeminiConfig(): GeminiConfig
export function validateGeminiConfig(config: GeminiConfig): boolean
export const GEMINI_PROMPTS: Record<string, string>
export const GEMINI_MODELS: Record<string, string>
export const RATE_LIMITS: Record<string, number>
```

### Design Configuration

```typescript
export const THEMES: Record<string, Theme>
export const LAYOUT_RULES: Record<string, any>
export const DESIGN_RULES: Record<string, any>
export function getTheme(name: string): Theme
export function selectThemeByContext(context: string): Theme
```

## Logging

```typescript
export class Logger { }
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}
export function getLogger(name: string): Logger
```

## Versioning

### Current Version

```typescript
export const VERSION = '1.0.0'
export const NAME = 'Agentic Slide Designer'
```

### Versioning Policy

- **Major Version** (1.x.x → 2.x.x): Breaking changes to contracts
- **Minor Version** (x.1.x → x.2.x): New features, backward compatible
- **Patch Version** (x.x.1 → x.x.2): Bug fixes, no API changes

### Breaking Change Policy

**Breaking changes require**:
1. Major version bump
2. Migration guide in documentation
3. Deprecation period (1 minor version minimum)
4. Frontend team coordination
5. Updated contract tests

**Examples of breaking changes**:
- Removing exported classes/functions
- Changing method signatures
- Removing required fields from responses
- Changing error codes
- Modifying type definitions

**Examples of non-breaking changes**:
- Adding new exports
- Adding optional parameters
- Adding new fields to responses
- Adding new error types
- Internal refactoring

## Testing

### Running Contract Tests

```bash
# All contract tests
npm run test:contract

# Schema drift detection only
npm run test:schema-drift

# Watch mode
npm run test:contract:watch

# With coverage
npm run test:contract -- --coverage
```

### CI/CD Integration

Contract tests run on:
- All PRs touching `src/slide-designer/`
- All pushes to main/master
- Manual workflow dispatch

Breaking changes block PR merging.

## Migration Guides

### Upgrading to v1.0.0

No migration needed - initial stable release.

### Future Migrations

Migration guides will be added here for each major version.

## Support

- **Issues**: File bugs and feature requests on GitHub
- **Documentation**: See `/docs` directory
- **Examples**: See `/examples` directory
- **Questions**: Open a discussion on GitHub

---

**Last Updated**: 2025-11-09
**Version**: 1.0.0
**Maintainer**: Contract Guardian Agent

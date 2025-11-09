# P2 Integration Architecture Design

**Version:** 1.0
**Date:** 2025-11-08
**Status:** Technical Design Phase
**Author:** System Architecture Designer
**Project:** Slide Designer P2 (Nice-to-Have) Feature Integration

---

## Executive Summary

This document defines the architecture for integrating 8 P2 (Priority 2) Nice-to-Have features into the existing Slide Designer system (P0 + P1). P2 features are experimental, cutting-edge capabilities that enhance the platform without being essential for core functionality. The architecture emphasizes **lazy loading**, **graceful degradation**, and **zero impact on P0/P1 stability**.

### Key Principles

1. **Non-Blocking**: P2 features NEVER block P0/P1 initialization or operation
2. **Lazy Loading**: Heavy dependencies (Three.js, WebXR, Web3) load only when needed
3. **Experimental Flag**: All P2 features marked as experimental with explicit opt-in
4. **Zero P0/P1 Impact**: P0 and P1 work perfectly even if all P2 features fail
5. **Progressive Enhancement**: P2 adds value but degrades gracefully when unavailable

---

## 1. P2 Features Overview

### 8 P2 Features (Organized by Implementation Complexity)

| ID | Feature | Category | Risk | Heavy Deps | API Required |
|----|---------|----------|------|------------|--------------|
| **P2.3** | Voice Narration (TTS) | Audio | Low | ❌ | Yes (TTS API) |
| **P2.6** | API Access for Developers | Platform | Low | ❌ | No |
| **P2.4** | Interactive Elements | Interaction | Medium | ❌ | No |
| **P2.5** | Themes Marketplace | Content | Medium | ❌ | Yes (Backend) |
| **P2.1** | 3D Animations (Three.js) | Visual | High | ✅ Three.js | No |
| **P2.7** | Figma/Sketch Import | Integration | High | ❌ | Yes (Figma API) |
| **P2.2** | AR Presentation Mode (WebXR) | Immersive | Very High | ✅ WebXR | No |
| **P2.8** | Blockchain NFTs | Web3 | Very High | ✅ Web3.js | Yes (Wallet) |

**Legend:**
- **Low Risk**: Simple integration, minimal dependencies
- **Medium Risk**: Moderate complexity, some new patterns
- **High Risk**: Complex integration, heavy libraries
- **Very High Risk**: Experimental tech, significant browser compatibility issues

---

## 2. Architecture Overview

### 2.1 P2Integration Class Structure

```typescript
/**
 * P2Integration manages experimental nice-to-have features
 *
 * Design Goals:
 * - Lazy initialization (features load only when accessed)
 * - Zero impact on P0/P1 (complete independence)
 * - Feature flags for all 8 features
 * - Graceful degradation for missing dependencies
 * - Code splitting for heavy libraries (Three.js, WebXR, Web3)
 */
export class P2Integration {
  private static instance: P2Integration | null = null;
  private features: Map<P2FeatureId, P2FeatureInfo> = new Map();
  private config: Required<P2IntegrationConfig>;
  private p0Integration?: P0Integration;
  private p1Integration?: P1Integration;
  private initialized = false;
  private lazyLoaders: Map<P2FeatureId, () => Promise<any>> = new Map();

  private constructor(
    config: P2IntegrationConfig,
    p0Integration?: P0Integration,
    p1Integration?: P1Integration
  ) {
    this.config = { ...DEFAULT_P2_CONFIG, ...config };
    this.p0Integration = p0Integration;
    this.p1Integration = p1Integration;
    this.initializeFeatureRegistry();
    this.initializeLazyLoaders();
  }

  /**
   * Get singleton instance
   * P2 integration is OPTIONAL - P0/P1 work without it
   */
  public static getInstance(
    config?: P2IntegrationConfig,
    p0Integration?: P0Integration,
    p1Integration?: P1Integration
  ): P2Integration {
    if (!P2Integration.instance) {
      P2Integration.instance = new P2Integration(
        config || {},
        p0Integration,
        p1Integration
      );
    }
    return P2Integration.instance;
  }

  /**
   * Lazy initialization - features initialize on first access
   * This avoids loading heavy dependencies until actually needed
   */
  public async getFeature<T = any>(featureId: P2FeatureId): Promise<T> {
    const featureInfo = this.features.get(featureId);

    if (!featureInfo) {
      throw new P2FeatureNotFoundError(featureId);
    }

    if (!featureInfo.enabled) {
      throw new P2FeatureDisabledError(featureId);
    }

    // Lazy initialization on first access
    if (featureInfo.status === 'not_loaded') {
      await this.initializeFeatureLazy(featureId);
    }

    if (featureInfo.status !== 'ready') {
      throw new P2FeatureNotReadyError(featureId, featureInfo.status);
    }

    return featureInfo.instance as T;
  }

  /**
   * Check if feature is available without initializing it
   */
  public isFeatureAvailable(featureId: P2FeatureId): boolean {
    const featureInfo = this.features.get(featureId);
    return (
      featureInfo?.enabled &&
      (featureInfo.status === 'ready' || featureInfo.status === 'not_loaded')
    );
  }
}
```

### 2.2 Feature Registry Design

Each P2 feature has a structured definition:

```typescript
type P2FeatureStatus =
  | 'not_loaded'      // Not initialized yet (lazy loading)
  | 'loading'         // Currently loading dependencies
  | 'ready'           // Ready to use
  | 'degraded'        // Partially functional
  | 'failed'          // Initialization failed
  | 'disabled';       // Disabled via feature flag

interface P2FeatureInfo {
  id: P2FeatureId;
  name: string;
  status: P2FeatureStatus;
  instance: any | null;

  // Dependencies
  dependencies: {
    p0Features: P0FeatureId[];  // P0 dependencies
    p1Features: P1FeatureId[];  // P1 dependencies
    p2Features: P2FeatureId[];  // P2 inter-dependencies
    external: string[];          // External libraries (e.g., 'three', 'web3')
  };

  // Configuration
  optional: boolean;              // All P2 features are optional
  experimental: boolean;          // Flag as experimental
  requiresAPI: boolean;           // Needs API key/backend
  heavyDependencies: boolean;     // Has large dependencies (code split)
  browserCompatibility: {
    chrome: string;               // Min version
    firefox: string;
    safari: string;
    edge: string;
  };

  // Feature flag
  featureFlag: string;
  rolloutPercentage?: number;     // Gradual rollout (0-100)

  // Error tracking
  error?: Error;
  lastHealthCheck?: Date;
  initAttempts: number;           // Track retry attempts
  maxInitAttempts: number;        // Max retries before giving up
}

/**
 * P2 Feature IDs (8 total)
 */
type P2FeatureId =
  | 'voice-narration'      // P2.3: TTS for slides
  | 'api-access'           // P2.6: Developer API
  | 'interactive-elements' // P2.4: Polls, quizzes, etc.
  | 'themes-marketplace'   // P2.5: Community themes
  | '3d-animations'        // P2.1: Three.js animations
  | 'figma-import'         // P2.7: Figma/Sketch import
  | 'ar-presentation'      // P2.2: WebXR AR mode
  | 'blockchain-nft';      // P2.8: NFT minting
```

---

## 3. Dependency Graph

### 3.1 P2 → P0/P1 Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│                    P0 Features (Core)                        │
│  Grid, Typography, Colors, Charts, Export, Accessibility    │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────────────────────────────────────┐
│                    P1 Features (Advanced)                    │
│  Slide Manager, Templates, Collaboration, Live Presentation │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │
                    (Optional Dependencies)
                              │
┌─────────────────────────────────────────────────────────────┐
│               P2 Features (Experimental)                     │
│  Voice, API, Interactive, Themes, 3D, Figma, AR, NFT        │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Detailed Dependency Mapping

#### Batch 1: Quick Wins (Low Risk)
| Feature | Depends on P0 | Depends on P1 | Reason |
|---------|---------------|---------------|--------|
| **Voice Narration (P2.3)** | Typography | Speaker Notes (P1.3) | Read speaker notes aloud with proper pronunciation |
| **API Access (P2.6)** | Export | - | Expose P0/P1 features via REST API |

**Dependencies:**
- Voice Narration → P0.Typography (for text-to-speech parsing)
- Voice Narration → P1.SpeakerNotes (read notes aloud)
- API Access → P0.Export (API endpoints for exporting)

#### Batch 2: Interactive & Marketplace (Medium Risk)
| Feature | Depends on P0 | Depends on P1 | Reason |
|---------|---------------|---------------|--------|
| **Interactive Elements (P2.4)** | Grid Layout | Live Presentation (P1.15) | Real-time polls during live presentations |
| **Themes Marketplace (P2.5)** | Master Slides, Colors | Template Library (P1.5) | Extend template system with marketplace |

**Dependencies:**
- Interactive Elements → P0.GridLayout (position interactive widgets)
- Interactive Elements → P1.LivePresentation (real-time interaction)
- Themes Marketplace → P0.MasterSlides (apply themes to master slides)
- Themes Marketplace → P0.Colors (theme color schemes)
- Themes Marketplace → P1.TemplateLibrary (marketplace as extension of templates)

#### Batch 3: Advanced Visual (High Risk)
| Feature | Depends on P0 | Depends on P1 | Reason |
|---------|---------------|---------------|--------|
| **3D Animations (P2.1)** | Transitions | - | 3D transitions between slides |
| **Figma/Sketch Import (P2.7)** | Grid Layout, Image Optimization | Custom Fonts (P1.8) | Import designs as slides |

**Dependencies:**
- 3D Animations → P0.Transitions (enhance existing transitions)
- Figma Import → P0.GridLayout (layout imported designs)
- Figma Import → P0.ImageOptimization (optimize imported images)
- Figma Import → P1.CustomFonts (import custom fonts from Figma)

#### Batch 4: Cutting Edge (Very High Risk)
| Feature | Depends on P0 | Depends on P1 | Reason |
|---------|---------------|---------------|--------|
| **AR Presentation (P2.2)** | Accessibility | Live Presentation (P1.15) | AR mode for live presentations |
| **Blockchain NFTs (P2.8)** | Export | Version History (P1.10) | Mint slides as NFTs with provenance |

**Dependencies:**
- AR Presentation → P0.Accessibility (accessible AR controls)
- AR Presentation → P1.LivePresentation (AR-enhanced live mode)
- Blockchain NFT → P0.Export (export slides for NFT metadata)
- Blockchain NFT → P1.VersionHistory (track NFT version history)

### 3.3 P2 Internal Dependencies

```
Voice Narration
      │
      ├─────> API Access (expose voice API)
      │
Interactive Elements ──> AR Presentation (interactive AR widgets)
      │
      └─────> API Access (expose interaction API)

Themes Marketplace
      │
      └─────> 3D Animations (marketplace for 3D transition themes)

Figma Import
      │
      └─────> Themes Marketplace (imported designs as themes)

Blockchain NFT
      │
      └─────> Themes Marketplace (NFT-backed premium themes)
```

**P2 Inter-Dependencies:**
- **API Access** aggregates all P2 features for developer access
- **AR Presentation** can use **Interactive Elements** for AR-based polls
- **Themes Marketplace** can include **3D Animations** as premium themes
- **Figma Import** designs can be published to **Themes Marketplace**
- **Blockchain NFTs** can represent premium **Themes Marketplace** items

---

## 4. Batched Initialization Strategy

### 4.1 Initialization Batches

P2 features initialize in **4 batches** based on risk/complexity:

```typescript
interface BatchConfig {
  batch: number;
  name: string;
  risk: 'low' | 'medium' | 'high' | 'very_high';
  features: P2FeatureId[];
  initStrategy: 'eager' | 'lazy';
  loadTimeout: number; // ms
}

const P2_BATCHES: BatchConfig[] = [
  {
    batch: 1,
    name: 'Quick Wins',
    risk: 'low',
    features: ['voice-narration', 'api-access'],
    initStrategy: 'lazy', // Load on first access
    loadTimeout: 5000,
  },
  {
    batch: 2,
    name: 'Interactive & Marketplace',
    risk: 'medium',
    features: ['interactive-elements', 'themes-marketplace'],
    initStrategy: 'lazy',
    loadTimeout: 8000,
  },
  {
    batch: 3,
    name: 'Advanced Visual',
    risk: 'high',
    features: ['3d-animations', 'figma-import'],
    initStrategy: 'lazy', // Heavy dependencies
    loadTimeout: 15000, // Three.js takes time
  },
  {
    batch: 4,
    name: 'Cutting Edge',
    risk: 'very_high',
    features: ['ar-presentation', 'blockchain-nft'],
    initStrategy: 'lazy',
    loadTimeout: 20000, // WebXR + Web3 are slow
  },
];
```

### 4.2 Lazy Loading Implementation

```typescript
class P2Integration {
  /**
   * Initialize lazy loaders (no actual loading yet)
   */
  private initializeLazyLoaders(): void {
    // Batch 1: Quick Wins
    this.lazyLoaders.set('voice-narration', async () => {
      const { VoiceNarrationManager } = await import('./features/voice-narration');
      return new VoiceNarrationManager();
    });

    this.lazyLoaders.set('api-access', async () => {
      const { DeveloperAPIManager } = await import('./features/api-access');
      return new DeveloperAPIManager(this.p0Integration, this.p1Integration, this);
    });

    // Batch 2: Interactive & Marketplace
    this.lazyLoaders.set('interactive-elements', async () => {
      const { InteractiveElementsManager } = await import('./features/interactive-elements');
      return new InteractiveElementsManager();
    });

    this.lazyLoaders.set('themes-marketplace', async () => {
      const { ThemesMarketplaceManager } = await import('./features/themes-marketplace');
      return new ThemesMarketplaceManager();
    });

    // Batch 3: Advanced Visual (Heavy Dependencies)
    this.lazyLoaders.set('3d-animations', async () => {
      // Lazy load Three.js only when needed
      const THREE = await import('three');
      const { ThreeDAnimationManager } = await import('./features/3d-animations');
      return new ThreeDAnimationManager(THREE);
    });

    this.lazyLoaders.set('figma-import', async () => {
      const { FigmaImportManager } = await import('./features/figma-import');
      return new FigmaImportManager();
    });

    // Batch 4: Cutting Edge (Very Heavy Dependencies)
    this.lazyLoaders.set('ar-presentation', async () => {
      // Check WebXR support first
      if (!('xr' in navigator)) {
        throw new Error('WebXR not supported in this browser');
      }
      const { ARPresentationManager } = await import('./features/ar-presentation');
      return new ARPresentationManager();
    });

    this.lazyLoaders.set('blockchain-nft', async () => {
      // Lazy load Web3.js only when needed
      const Web3 = await import('web3');
      const { BlockchainNFTManager } = await import('./features/blockchain-nft');
      return new BlockchainNFTManager(Web3);
    });
  }

  /**
   * Lazy initialization of a single feature
   */
  private async initializeFeatureLazy(featureId: P2FeatureId): Promise<void> {
    const featureInfo = this.features.get(featureId)!;

    // Check if already loading
    if (featureInfo.status === 'loading') {
      // Wait for existing load to complete
      return this.waitForFeatureLoad(featureId);
    }

    // Mark as loading
    featureInfo.status = 'loading';
    featureInfo.initAttempts++;

    try {
      // Check dependencies
      await this.checkDependenciesLazy(featureId);

      // Get lazy loader
      const loader = this.lazyLoaders.get(featureId);
      if (!loader) {
        throw new Error(`No lazy loader found for ${featureId}`);
      }

      // Load with timeout
      const timeout = this.getBatchTimeout(featureId);
      featureInfo.instance = await this.withTimeout(loader(), timeout);

      // Mark as ready
      featureInfo.status = 'ready';
      this.config.onFeatureLoad?.(featureId);

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      featureInfo.error = err;

      // Check if should retry
      if (featureInfo.initAttempts < featureInfo.maxInitAttempts) {
        featureInfo.status = 'not_loaded'; // Retry on next access
      } else {
        featureInfo.status = 'failed';
      }

      this.config.onError?.(featureId, err);
      throw new P2FeatureInitializationError(featureId, err);
    }
  }

  /**
   * Check dependencies without initializing them
   */
  private async checkDependenciesLazy(featureId: P2FeatureId): Promise<void> {
    const featureInfo = this.features.get(featureId)!;

    // Check P0 dependencies
    for (const p0DepId of featureInfo.dependencies.p0Features) {
      if (!this.p0Integration) {
        throw new P2DependencyError(featureId, [p0DepId], 'P0 integration not available');
      }
      const status = this.p0Integration.getFeatureStatus(p0DepId);
      if (status !== 'ready') {
        throw new P2DependencyError(featureId, [p0DepId], `P0 feature ${p0DepId} is ${status}`);
      }
    }

    // Check P1 dependencies
    for (const p1DepId of featureInfo.dependencies.p1Features) {
      if (!this.p1Integration) {
        throw new P2DependencyError(featureId, [p1DepId], 'P1 integration not available');
      }
      const status = this.p1Integration.getFeatureStatus(p1DepId);
      if (status !== 'ready') {
        throw new P2DependencyError(featureId, [p1DepId], `P1 feature ${p1DepId} is ${status}`);
      }
    }

    // Check P2 dependencies (may need to lazy load them first)
    for (const p2DepId of featureInfo.dependencies.p2Features) {
      const depInfo = this.features.get(p2DepId);
      if (!depInfo || depInfo.status === 'failed') {
        throw new P2DependencyError(featureId, [p2DepId], `P2 feature ${p2DepId} is unavailable`);
      }

      // Lazy load dependency if needed
      if (depInfo.status === 'not_loaded') {
        await this.initializeFeatureLazy(p2DepId);
      }
    }

    // Check browser compatibility
    this.checkBrowserCompatibility(featureId);
  }

  /**
   * Get batch timeout for feature
   */
  private getBatchTimeout(featureId: P2FeatureId): number {
    const batch = P2_BATCHES.find(b => b.features.includes(featureId));
    return batch?.loadTimeout || 10000;
  }
}
```

### 4.3 Initialization Performance Budget

| Batch | Features | Load Time Budget | Bundle Size Budget | Priority |
|-------|----------|------------------|-------------------|----------|
| **Batch 1** | Voice, API | < 2s | < 100KB | Low |
| **Batch 2** | Interactive, Marketplace | < 5s | < 200KB | Low |
| **Batch 3** | 3D, Figma | < 10s | < 800KB (Three.js) | Medium |
| **Batch 4** | AR, Blockchain | < 15s | < 1.5MB (Web3.js) | Low |

**Key Points:**
- P2 features load **only when accessed** (lazy loading)
- Heavy libraries (Three.js, Web3.js) are code-split
- P0/P1 **never wait** for P2 to load
- If a P2 feature exceeds timeout, it's marked as `failed` but doesn't block others

---

## 5. Integration Patterns

### 5.1 Voice Narration Integration Pattern

**How it integrates with existing features:**

```typescript
interface VoiceNarrationManager {
  /**
   * Convert speaker notes to speech
   * Integrates with P1.SpeakerNotes
   */
  narrateSlide(slideId: string): Promise<AudioBuffer>;

  /**
   * Auto-generate narration from slide content
   * Uses P0.Typography for text extraction
   */
  generateNarration(slideId: string, options?: NarrationOptions): Promise<string>;

  /**
   * Preview narration before recording
   */
  previewNarration(text: string, voice: VoiceConfig): Promise<void>;

  /**
   * Record custom narration
   */
  recordNarration(slideId: string): Promise<Blob>;

  /**
   * Export presentation with embedded narration
   * Integrates with P0.Export
   */
  exportWithNarration(format: 'mp4' | 'webm'): Promise<Blob>;
}

// Integration Example
const voiceNarration = await p2Integration.getFeature<VoiceNarrationManager>('voice-narration');

// Get speaker notes from P1
const speakerNotes = p1Integration.getFeature<SpeakerNotesManager>('speaker-notes');
const notes = speakerNotes.getNotesForSlide(slideId);

// Generate narration
const narration = await voiceNarration.generateNarration(slideId, {
  voice: 'en-US-Standard-A',
  speed: 1.0,
  pitch: 0,
  useNotes: true, // Read speaker notes
});
```

**Dependencies:**
- P0.Typography → Extract text content for narration
- P1.SpeakerNotes → Read speaker notes aloud
- P0.Export → Export presentation with audio

### 5.2 API Access Integration Pattern

**How it exposes P0/P1/P2 features:**

```typescript
interface DeveloperAPIManager {
  /**
   * Initialize API server
   */
  startAPIServer(port: number, config: APIConfig): Promise<void>;

  /**
   * Register API endpoints for all features
   */
  registerEndpoints(): void;

  /**
   * Generate API documentation
   */
  generateAPIDocs(): OpenAPISpec;

  /**
   * Create API key for user
   */
  createAPIKey(userId: string, scopes: string[]): Promise<string>;
}

// Exposed REST API
/**
 * POST /api/v1/presentations/generate
 * Body: { topic: string, slideCount: number }
 *
 * Exposes:
 * - P0: Grid, Typography, Colors, Export
 * - P1: Template Library, Slide Manager
 * - P2: Voice Narration (if enabled)
 */
app.post('/api/v1/presentations/generate', async (req, res) => {
  const { topic, slideCount } = req.body;

  // Use P0/P1 features
  const slides = await slideManager.generateSlides(topic, slideCount);

  // Optionally add voice narration (P2)
  if (req.query.withNarration && p2Integration.isFeatureAvailable('voice-narration')) {
    const voiceNarration = await p2Integration.getFeature('voice-narration');
    for (const slide of slides) {
      slide.narration = await voiceNarration.narrateSlide(slide.id);
    }
  }

  res.json({ slides });
});

/**
 * POST /api/v1/slides/:id/interactive-poll
 * Body: { question: string, options: string[] }
 *
 * Exposes:
 * - P2: Interactive Elements
 */
app.post('/api/v1/slides/:id/interactive-poll', async (req, res) => {
  const interactive = await p2Integration.getFeature('interactive-elements');
  const poll = await interactive.addPoll(req.params.id, req.body);
  res.json({ poll });
});
```

**Key Points:**
- API Access acts as a **gateway** to all P0/P1/P2 features
- API versioning (v1, v2) to handle breaking changes
- Rate limiting and authentication for production use
- Auto-generated OpenAPI documentation

### 5.3 Interactive Elements Integration Pattern

**How it integrates with Live Presentation:**

```typescript
interface InteractiveElementsManager {
  /**
   * Add interactive poll to slide
   * Integrates with P1.LivePresentation for real-time voting
   */
  addPoll(slideId: string, question: string, options: string[]): Poll;

  /**
   * Add quiz question
   */
  addQuiz(slideId: string, question: string, answers: QuizAnswer[]): Quiz;

  /**
   * Add word cloud
   */
  addWordCloud(slideId: string, prompt: string): WordCloud;

  /**
   * Real-time results during presentation
   * Integrates with P1.Collaboration for multi-user interaction
   */
  getResults(elementId: string): Promise<InteractionResults>;

  /**
   * Export interaction data
   * Integrates with P1.Analytics
   */
  exportInteractionData(presentationId: string): Promise<AnalyticsReport>;
}

// Integration with Live Presentation
const livePresentation = p1Integration.getFeature<LivePresentationManager>('live-presentation');
const interactive = await p2Integration.getFeature<InteractiveElementsManager>('interactive-elements');

// Add poll to current slide
const poll = interactive.addPoll(currentSlideId, 'What do you think?', ['Option A', 'Option B']);

// When presenting live, viewers can vote
livePresentation.on('slideChanged', async (slideId) => {
  const polls = interactive.getPollsForSlide(slideId);
  if (polls.length > 0) {
    // Show poll UI to audience
    const results = await interactive.getResults(polls[0].id);
    // Display real-time results
  }
});
```

**Dependencies:**
- P0.GridLayout → Position interactive widgets on slide
- P1.LivePresentation → Real-time interaction during presentation
- P1.Collaboration → Multi-user interaction
- P1.Analytics → Track interaction metrics

### 5.4 Themes Marketplace Integration Pattern

**How it extends Template Library:**

```typescript
interface ThemesMarketplaceManager {
  /**
   * Browse marketplace themes
   */
  browseThemes(category?: string, searchQuery?: string): Promise<MarketplaceTheme[]>;

  /**
   * Download and install theme
   * Integrates with P1.TemplateLibrary
   */
  downloadTheme(themeId: string): Promise<PresentationTemplate>;

  /**
   * Publish custom theme to marketplace
   * Requires P0.MasterSlides, P0.Colors
   */
  publishTheme(theme: CustomTheme, metadata: ThemeMetadata): Promise<string>;

  /**
   * Purchase premium theme
   * Integrates with P2.BlockchainNFT for NFT-backed themes
   */
  purchaseTheme(themeId: string, paymentMethod: PaymentMethod): Promise<Transaction>;

  /**
   * Rate and review themes
   */
  rateTheme(themeId: string, rating: number, review?: string): Promise<void>;
}

// Integration Example
const marketplace = await p2Integration.getFeature<ThemesMarketplaceManager>('themes-marketplace');
const templateLibrary = p1Integration.getFeature<TemplateLibraryManager>('template-library');

// Browse marketplace
const themes = await marketplace.browseThemes('business', 'modern');

// Download theme
const theme = await marketplace.downloadTheme(themes[0].id);

// Add to template library (P1 integration)
templateLibrary.addCustomTemplate(theme);

// Apply to presentation
const masterSlideManager = p0Integration.getFeature('master-slides');
masterSlideManager.applyTemplate(theme);
```

**Dependencies:**
- P0.MasterSlides → Apply marketplace themes to presentations
- P0.Colors → Theme color schemes
- P1.TemplateLibrary → Marketplace as extension of local templates
- P2.BlockchainNFT → NFT-backed premium themes

### 5.5 3D Animations Integration Pattern

**How it enhances Transitions:**

```typescript
interface ThreeDAnimationManager {
  /**
   * Add 3D transition between slides
   * Enhances P0.Transitions with Three.js
   */
  add3DTransition(fromSlide: string, toSlide: string, type: ThreeD TransitionType): void;

  /**
   * Add 3D object to slide
   */
  add3DObject(slideId: string, model: string, config: ObjectConfig): ThreeDObject;

  /**
   * Animate 3D camera
   */
  animateCamera(slideId: string, animation: CameraAnimation): void;

  /**
   * Export as 3D-enabled HTML
   * Integrates with P0.Export
   */
  exportWith3D(): Promise<string>;
}

// Integration Example
const threeDAnimations = await p2Integration.getFeature<ThreeDAnimationManager>('3d-animations');
const transitions = p0Integration.getFeature<TransitionEngine>('transitions');

// Enhance existing 2D transition with 3D
transitions.setTransition(slideId, 'fade');
threeDAnimations.add3DTransition(slideId, nextSlideId, 'cube-rotation');

// Result: Slide fades while rotating in 3D space
```

**Dependencies:**
- P0.Transitions → Enhance existing transitions with 3D effects
- P0.Export → Export presentations with embedded Three.js

### 5.6 Figma/Sketch Import Integration Pattern

**How it imports designs as slides:**

```typescript
interface FigmaImportManager {
  /**
   * Import Figma file as presentation
   */
  importFigmaFile(fileKey: string, accessToken: string): Promise<ImportedPresentation>;

  /**
   * Import specific Figma frame as slide
   */
  importFrame(fileKey: string, nodeId: string): Promise<SlideData>;

  /**
   * Extract design tokens (colors, fonts, spacing)
   * Integrates with P0.Colors, P1.CustomFonts
   */
  extractDesignTokens(fileKey: string): Promise<DesignTokens>;

  /**
   * Import as theme
   * Integrates with P2.ThemesMarketplace
   */
  importAsTheme(fileKey: string): Promise<PresentationTemplate>;
}

// Integration Example
const figmaImport = await p2Integration.getFeature<FigmaImportManager>('figma-import');

// Import Figma file
const imported = await figmaImport.importFigmaFile('ABC123', figmaToken);

// Extract design tokens
const tokens = await figmaImport.extractDesignTokens('ABC123');

// Apply to P0 color engine
const colorEngine = p0Integration.getFeature<ColorEngine>('color-palettes');
colorEngine.setPalette(tokens.colors);

// Apply custom fonts (P1)
const customFonts = p1Integration.getFeature<CustomFontManager>('custom-fonts');
for (const font of tokens.fonts) {
  await customFonts.uploadFont(font.url, font.family);
}

// Convert to theme and publish to marketplace (P2)
const theme = await figmaImport.importAsTheme('ABC123');
const marketplace = await p2Integration.getFeature('themes-marketplace');
await marketplace.publishTheme(theme, {
  name: 'Figma Import',
  author: 'Designer',
  tags: ['modern', 'colorful'],
});
```

**Dependencies:**
- P0.GridLayout → Layout imported Figma frames
- P0.ImageOptimization → Optimize imported images
- P1.CustomFonts → Import custom fonts from Figma
- P2.ThemesMarketplace → Publish imported designs as themes

### 5.7 AR Presentation Integration Pattern

**How it adds AR mode to Live Presentation:**

```typescript
interface ARPresentationManager {
  /**
   * Start AR presentation mode
   * Requires WebXR support
   */
  startARPresentation(presentationId: string): Promise<ARSession>;

  /**
   * Place slide in AR space
   */
  placeSlideInAR(slideId: string, position: Vector3): void;

  /**
   * Add AR annotations
   * Integrates with P2.InteractiveElements
   */
  addARAnnotation(slideId: string, annotation: ARAnnotation): void;

  /**
   * Spatial audio for narration
   * Integrates with P2.VoiceNarration
   */
  enableSpatialAudio(enabled: boolean): void;

  /**
   * Multi-user AR collaboration
   * Integrates with P1.Collaboration
   */
  inviteToARSession(sessionId: string, users: string[]): Promise<void>;
}

// Integration Example
const arPresentation = await p2Integration.getFeature<ARPresentationManager>('ar-presentation');
const livePresentation = p1Integration.getFeature('live-presentation');

// Start normal live presentation
const session = await livePresentation.startPresentation(presentationId);

// Enable AR mode for supported devices
if (await arPresentation.isSupported()) {
  const arSession = await arPresentation.startARPresentation(presentationId);

  // Interactive elements work in AR
  const interactive = await p2Integration.getFeature('interactive-elements');
  arPresentation.on('pollVote', (vote) => {
    interactive.recordVote(vote.pollId, vote.option);
  });
}
```

**Dependencies:**
- P0.Accessibility → Accessible AR controls
- P1.LivePresentation → AR-enhanced live mode
- P1.Collaboration → Multi-user AR sessions
- P2.InteractiveElements → AR-based interaction
- P2.VoiceNarration → Spatial audio narration

### 5.8 Blockchain NFT Integration Pattern

**How it mints slides as NFTs:**

```typescript
interface BlockchainNFTManager {
  /**
   * Connect Web3 wallet
   */
  connectWallet(provider: 'metamask' | 'walletconnect'): Promise<string>;

  /**
   * Mint presentation as NFT
   * Integrates with P0.Export for metadata
   */
  mintPresentationNFT(
    presentationId: string,
    metadata: NFTMetadata
  ): Promise<Transaction>;

  /**
   * Mint single slide as NFT
   */
  mintSlideNFT(slideId: string, metadata: NFTMetadata): Promise<Transaction>;

  /**
   * Track provenance
   * Integrates with P1.VersionHistory
   */
  getProvenanceChain(nftId: string): Promise<VersionHistory[]>;

  /**
   * Sell NFT on marketplace
   * Integrates with P2.ThemesMarketplace
   */
  listNFT(nftId: string, price: string, marketplace: string): Promise<Listing>;

  /**
   * Verify NFT authenticity
   */
  verifyNFT(nftId: string): Promise<boolean>;
}

// Integration Example
const blockchainNFT = await p2Integration.getFeature<BlockchainNFTManager>('blockchain-nft');

// Connect wallet
const address = await blockchainNFT.connectWallet('metamask');

// Export presentation for NFT metadata
const exportEngine = p0Integration.getFeature<ExportEngine>('export');
const exportData = await exportEngine.export(presentationId, 'json');

// Get version history for provenance
const versionHistory = p1Integration.getFeature('version-history');
const versions = versionHistory.getHistory(presentationId);

// Mint NFT
const tx = await blockchainNFT.mintPresentationNFT(presentationId, {
  name: 'My Presentation',
  description: 'A unique presentation',
  image: exportData.thumbnail,
  attributes: [
    { trait_type: 'Slide Count', value: exportData.slideCount },
    { trait_type: 'Version', value: versions.length },
  ],
  provenance: versions.map(v => ({
    timestamp: v.timestamp,
    author: v.author,
    hash: v.hash,
  })),
});

// List on marketplace
const marketplace = await p2Integration.getFeature('themes-marketplace');
await blockchainNFT.listNFT(tx.nftId, '0.1 ETH', 'opensea');
```

**Dependencies:**
- P0.Export → Export presentations for NFT metadata
- P1.VersionHistory → Track NFT provenance
- P2.ThemesMarketplace → Sell NFTs on marketplace

---

## 6. Backward Compatibility

### 6.1 P0+P1 Works Without P2

**Guarantee:** P0 and P1 features work perfectly even if P2 is not initialized or all P2 features fail.

```typescript
// P0+P1 only (no P2)
const p0 = P0Integration.getInstance();
await p0.initialize();

const p1 = P1Integration.getInstance({}, p0);
await p1.initialize();

// All P0+P1 features work normally
const gridLayout = p0.getFeature('grid-layout');
const slideManager = p1.getFeature('slide-manager');

// P2 is completely optional
// No P2Integration needed
```

### 6.2 P2 Graceful Degradation

**Scenario 1:** P2 feature fails to load
```typescript
const p2 = P2Integration.getInstance({}, p0, p1);

try {
  const voiceNarration = await p2.getFeature('voice-narration');
} catch (error) {
  // P2 feature failed, but P0/P1 unaffected
  console.warn('Voice narration unavailable:', error);
  // Continue with P0/P1 features
}
```

**Scenario 2:** Missing heavy dependency (Three.js)
```typescript
// User doesn't have Three.js installed
const p2 = P2Integration.getInstance({}, p0, p1);

try {
  const threeDAnimations = await p2.getFeature('3d-animations');
} catch (error) {
  // Falls back to 2D transitions (P0)
  console.warn('3D animations unavailable, using 2D transitions');
  const transitions = p0.getFeature('transitions');
  transitions.setTransition(slideId, 'fade');
}
```

**Scenario 3:** Browser doesn't support WebXR
```typescript
const p2 = P2Integration.getInstance({}, p0, p1);

if (await p2.isFeatureAvailable('ar-presentation')) {
  const arPresentation = await p2.getFeature('ar-presentation');
  await arPresentation.startARPresentation(presentationId);
} else {
  // Fall back to normal live presentation (P1)
  const livePresentation = p1.getFeature('live-presentation');
  await livePresentation.startPresentation(presentationId);
}
```

### 6.3 Compatibility Matrix

| P2 Feature | P0 Required | P1 Required | Fallback if Unavailable |
|------------|-------------|-------------|-------------------------|
| Voice Narration | Typography | Speaker Notes | Silent presentation |
| API Access | Export | - | Manual export only |
| Interactive Elements | Grid Layout | Live Presentation | Static slides |
| Themes Marketplace | Master Slides, Colors | Template Library | Local templates only |
| 3D Animations | Transitions | - | 2D transitions (P0) |
| Figma Import | Grid, Image Opt | Custom Fonts | Manual design |
| AR Presentation | Accessibility | Live Presentation | Normal live mode |
| Blockchain NFT | Export | Version History | Standard export |

### 6.4 Feature Detection

```typescript
class P2Integration {
  /**
   * Check if feature can be loaded (without loading it)
   */
  public async canLoadFeature(featureId: P2FeatureId): Promise<boolean> {
    const featureInfo = this.features.get(featureId)!;

    // Check feature flag
    if (!featureInfo.enabled) {
      return false;
    }

    // Check browser compatibility
    if (!this.isBrowserCompatible(featureId)) {
      return false;
    }

    // Check P0 dependencies
    for (const p0DepId of featureInfo.dependencies.p0Features) {
      if (!this.p0Integration || this.p0Integration.getFeatureStatus(p0DepId) !== 'ready') {
        return false;
      }
    }

    // Check P1 dependencies
    for (const p1DepId of featureInfo.dependencies.p1Features) {
      if (!this.p1Integration || this.p1Integration.getFeatureStatus(p1DepId) !== 'ready') {
        return false;
      }
    }

    // Check API requirements
    if (featureInfo.requiresAPI && !this.hasAPIKey(featureId)) {
      return false;
    }

    return true;
  }

  /**
   * Check browser compatibility
   */
  private isBrowserCompatible(featureId: P2FeatureId): boolean {
    const featureInfo = this.features.get(featureId)!;
    const compat = featureInfo.browserCompatibility;

    // Detect browser and version
    const { browser, version } = this.detectBrowser();

    switch (browser) {
      case 'chrome':
        return this.compareVersions(version, compat.chrome) >= 0;
      case 'firefox':
        return this.compareVersions(version, compat.firefox) >= 0;
      case 'safari':
        return this.compareVersions(version, compat.safari) >= 0;
      case 'edge':
        return this.compareVersions(version, compat.edge) >= 0;
      default:
        return false;
    }
  }
}
```

---

## 7. Performance Considerations

### 7.1 Code Splitting Strategy

**Bundle Analysis:**
```
Main Bundle (P0+P1):     ~600KB
P2 Batch 1 (Lazy):       ~100KB   (Voice + API)
P2 Batch 2 (Lazy):       ~200KB   (Interactive + Marketplace)
P2 Batch 3 (Lazy):       ~800KB   (3D + Figma) - Three.js is 600KB!
P2 Batch 4 (Lazy):       ~1.5MB   (AR + Blockchain) - Web3.js is 1MB!
```

**Webpack Configuration:**
```javascript
// webpack.config.js
module.exports = {
  entry: {
    main: './src/index.ts', // P0 + P1
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        // Split Three.js separately
        threejs: {
          test: /[\\/]node_modules[\\/]three[\\/]/,
          name: 'threejs',
          chunks: 'async',
          priority: 20,
        },
        // Split Web3.js separately
        web3: {
          test: /[\\/]node_modules[\\/]web3[\\/]/,
          name: 'web3',
          chunks: 'async',
          priority: 20,
        },
        // Split P2 features
        p2Features: {
          test: /[\\/]src[\\/]slide-designer[\\/]features-p2[\\/]/,
          name: 'p2-features',
          chunks: 'async',
          priority: 10,
        },
      },
    },
  },
};
```

### 7.2 Lazy Loading Performance

**Time to Interactive (TTI):**
```
P0 Only:           ~2s   ✅ (fast)
P0 + P1:           ~4s   ✅ (acceptable)
P0 + P1 + P2:      ~4s   ✅ (P2 loads lazily, no impact)

P2 Batch 1 Load:   +2s   (when first accessed)
P2 Batch 2 Load:   +5s   (when first accessed)
P2 Batch 3 Load:   +10s  (when first accessed)
P2 Batch 4 Load:   +15s  (when first accessed)
```

**Key Point:** P2 lazy loading means **zero impact on initial page load**.

### 7.3 Memory Management

**Memory Footprint:**
```
P0 Integration:    ~30MB
P1 Integration:    +20MB  (total: ~50MB)
P2 Batch 1:        +10MB  (total: ~60MB)
P2 Batch 2:        +15MB  (total: ~75MB)
P2 Batch 3:        +80MB  (total: ~155MB) - Three.js scenes
P2 Batch 4:        +100MB (total: ~255MB) - Web3 + WebXR
```

**Memory Optimization:**
- **Batch 3 (3D)**: Dispose Three.js scenes when not in use
- **Batch 4 (AR/NFT)**: Close Web3 connections when idle
- **All batches**: Implement LRU cache with automatic eviction

```typescript
class P2Integration {
  /**
   * Dispose unused features to free memory
   */
  public async disposeFeature(featureId: P2FeatureId): Promise<void> {
    const featureInfo = this.features.get(featureId)!;

    if (featureInfo.instance) {
      // Call feature-specific cleanup
      if (typeof featureInfo.instance.dispose === 'function') {
        await featureInfo.instance.dispose();
      }

      featureInfo.instance = null;
      featureInfo.status = 'not_loaded';
    }
  }

  /**
   * Auto-dispose features after idle time
   */
  private startIdleDisposal(): void {
    const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

    for (const [featureId, featureInfo] of this.features.entries()) {
      if (featureInfo.heavyDependencies && featureInfo.status === 'ready') {
        this.scheduleIdleDisposal(featureId, IDLE_TIMEOUT);
      }
    }
  }
}
```

### 7.4 Network Optimization

**API Call Batching:**
```typescript
// Bad: Multiple sequential API calls
const theme1 = await marketplace.downloadTheme('theme-1');
const theme2 = await marketplace.downloadTheme('theme-2');
const theme3 = await marketplace.downloadTheme('theme-3');

// Good: Batch API calls
const themes = await marketplace.downloadThemes(['theme-1', 'theme-2', 'theme-3']);
```

**Caching Strategy:**
```typescript
interface CacheConfig {
  features: {
    'themes-marketplace': {
      cacheDuration: 1 * 60 * 60 * 1000; // 1 hour
      maxCacheSize: 50; // Max 50 themes cached
    };
    'figma-import': {
      cacheDuration: 30 * 60 * 1000; // 30 minutes
      maxCacheSize: 10; // Max 10 Figma files cached
    };
  };
}
```

---

## 8. Security Architecture

### 8.1 API Key Management

**Secure Storage:**
```typescript
class SecureAPIKeyVault {
  private keys: Map<P2FeatureId, EncryptedKey> = new Map();
  private encryptionKey: CryptoKey;

  /**
   * Store API key securely (encrypted)
   */
  async setAPIKey(featureId: P2FeatureId, apiKey: string): Promise<void> {
    // Encrypt API key before storage
    const encrypted = await this.encrypt(apiKey);
    this.keys.set(featureId, encrypted);

    // Never log actual API keys
    console.log(`API key set for ${featureId}: ***${apiKey.slice(-4)}`);
  }

  /**
   * Retrieve API key (decrypted)
   */
  async getAPIKey(featureId: P2FeatureId): Promise<string | null> {
    const encrypted = this.keys.get(featureId);
    if (!encrypted) return null;

    return this.decrypt(encrypted);
  }

  /**
   * Encrypt using Web Crypto API
   */
  private async encrypt(plaintext: string): Promise<EncryptedKey> {
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey,
      data
    );

    return { iv, ciphertext };
  }

  /**
   * Decrypt using Web Crypto API
   */
  private async decrypt(encrypted: EncryptedKey): Promise<string> {
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: encrypted.iv },
      this.encryptionKey,
      encrypted.ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(plaintext);
  }
}
```

**API Key Validation:**
```typescript
interface APIKeyConfig {
  feature: P2FeatureId;
  requiredScopes: string[];
  validateFormat: (key: string) => boolean;
}

const API_KEY_CONFIGS: Record<P2FeatureId, APIKeyConfig> = {
  'voice-narration': {
    feature: 'voice-narration',
    requiredScopes: ['tts.read', 'tts.write'],
    validateFormat: (key) => /^sk-[a-zA-Z0-9]{48}$/.test(key), // OpenAI format
  },
  'figma-import': {
    feature: 'figma-import',
    requiredScopes: ['files:read'],
    validateFormat: (key) => /^figd_[a-zA-Z0-9-_]{40}$/.test(key), // Figma format
  },
  'blockchain-nft': {
    feature: 'blockchain-nft',
    requiredScopes: ['wallet.connect'],
    validateFormat: (key) => /^0x[a-fA-F0-9]{40}$/.test(key), // Ethereum address
  },
};
```

### 8.2 CORS Policies for Figma/Sketch Import

**Security Considerations:**
```typescript
interface CORSConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowCredentials: boolean;
  maxAge: number;
}

const FIGMA_IMPORT_CORS: CORSConfig = {
  // Only allow Figma API domain
  allowedOrigins: ['https://api.figma.com'],
  allowedMethods: ['GET', 'POST'],
  allowCredentials: true,
  maxAge: 86400, // 24 hours
};

// Proxy Figma API requests to avoid exposing API key on client
app.get('/api/v1/figma/proxy', async (req, res) => {
  const { fileKey } = req.query;

  // Validate request origin
  const origin = req.headers.origin;
  if (!FIGMA_IMPORT_CORS.allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Forbidden origin' });
  }

  // Validate user has permission
  if (!req.user?.hasFigmaAccess) {
    return res.status(403).json({ error: 'No Figma access' });
  }

  // Proxy request with server-side API key
  const figmaAPI = await p2Integration.getFeature('figma-import');
  const data = await figmaAPI.fetchFile(fileKey, SERVER_FIGMA_API_KEY);

  res.json(data);
});
```

### 8.3 Content Sanitization for User-Generated Themes

**XSS Prevention:**
```typescript
import DOMPurify from 'dompurify';

class ThemesMarketplaceManager {
  /**
   * Sanitize theme before publishing
   */
  async publishTheme(theme: CustomTheme, metadata: ThemeMetadata): Promise<string> {
    // Sanitize HTML content
    const sanitizedTheme = {
      ...theme,
      html: DOMPurify.sanitize(theme.html, {
        ALLOWED_TAGS: ['div', 'span', 'p', 'h1', 'h2', 'h3', 'img', 'svg'],
        ALLOWED_ATTR: ['class', 'style', 'id', 'src', 'alt'],
        FORBID_TAGS: ['script', 'iframe', 'object', 'embed'],
      }),
    };

    // Sanitize CSS
    sanitizedTheme.css = this.sanitizeCSS(theme.css);

    // Validate metadata
    metadata.description = DOMPurify.sanitize(metadata.description, {
      ALLOWED_TAGS: [],
    });

    return this.uploadTheme(sanitizedTheme, metadata);
  }

  /**
   * Sanitize CSS to prevent code injection
   */
  private sanitizeCSS(css: string): string {
    // Remove dangerous CSS properties
    const dangerous = ['behavior', 'expression', '-moz-binding'];
    let sanitized = css;

    for (const prop of dangerous) {
      const regex = new RegExp(`${prop}\\s*:\\s*[^;]+;?`, 'gi');
      sanitized = sanitized.replace(regex, '');
    }

    // Remove @import statements
    sanitized = sanitized.replace(/@import\s+[^;]+;?/gi, '');

    // Remove javascript: URLs
    sanitized = sanitized.replace(/javascript\s*:/gi, '');

    return sanitized;
  }
}
```

### 8.4 Wallet Security for Blockchain NFTs

**Best Practices:**
```typescript
class BlockchainNFTManager {
  /**
   * Connect wallet with security checks
   */
  async connectWallet(provider: 'metamask' | 'walletconnect'): Promise<string> {
    // Check if provider is available
    if (provider === 'metamask' && !window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    const address = accounts[0];

    // Verify network
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId !== this.config.expectedChainId) {
      throw new Error(
        `Wrong network. Expected ${this.config.expectedChainId}, got ${chainId}`
      );
    }

    // Store connection (encrypted)
    await this.storeWalletConnection(address);

    return address;
  }

  /**
   * Sign transaction (user approval required)
   */
  async mintPresentationNFT(
    presentationId: string,
    metadata: NFTMetadata
  ): Promise<Transaction> {
    // Get wallet address
    const address = await this.getConnectedWallet();
    if (!address) {
      throw new Error('Wallet not connected');
    }

    // Prepare transaction
    const tx = await this.prepareNFTMintTransaction(presentationId, metadata);

    // Show transaction preview to user
    const approved = await this.showTransactionPreview(tx);
    if (!approved) {
      throw new Error('Transaction cancelled by user');
    }

    // Sign and send
    const signedTx = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [tx],
    });

    return this.waitForTransaction(signedTx);
  }

  /**
   * NEVER store private keys
   * Always use wallet provider for signing
   */
  private async signMessage(message: string): Promise<string> {
    // Let wallet handle signing
    return window.ethereum.request({
      method: 'personal_sign',
      params: [message, await this.getConnectedWallet()],
    });
  }
}
```

### 8.5 Security Checklist

| Feature | Security Concern | Mitigation |
|---------|-----------------|------------|
| **Voice Narration** | API key exposure | Server-side proxy, encrypted storage |
| **API Access** | Unauthorized access | API keys, rate limiting, scopes |
| **Interactive Elements** | XSS in poll questions | DOMPurify sanitization |
| **Themes Marketplace** | Malicious themes | Content sanitization, code review |
| **3D Animations** | WebGL exploits | Three.js security updates, CSP headers |
| **Figma Import** | SSRF attacks | Validate file URLs, proxy requests |
| **AR Presentation** | Camera access | Permission prompts, secure contexts (HTTPS) |
| **Blockchain NFT** | Private key theft | NEVER store keys, use wallet providers |

---

## 9. Initialization Workflow

### 9.1 Complete Integration Sequence

```typescript
/**
 * Complete initialization: P0 → P1 → P2
 */
async function initializeSlideDesigner(): Promise<void> {
  console.log('🚀 Initializing Slide Designer...');

  // Step 1: Initialize P0 (Core)
  const p0 = P0Integration.getInstance();
  const p0Result = await p0.initialize();

  if (!p0Result.success) {
    throw new Error('P0 initialization failed (critical)');
  }
  console.log('✅ P0 initialized:', p0Result.initialized.length, 'features');

  // Step 2: Initialize P1 (Advanced)
  const p1 = P1Integration.getInstance({}, p0);
  const p1Result = await p1.initialize();

  if (!p1Result.success) {
    console.warn('⚠️ P1 partially initialized:', p1Result.initialized.length, 'features');
  } else {
    console.log('✅ P1 initialized:', p1Result.initialized.length, 'features');
  }

  // Step 3: Initialize P2 (Experimental) - OPTIONAL
  const p2 = P2Integration.getInstance({
    enabledFeatures: [
      'voice-narration',
      'api-access',
      'interactive-elements',
      'themes-marketplace',
    ],
    // Heavy features disabled by default
    disabledFeatures: [
      '3d-animations',
      'ar-presentation',
      'blockchain-nft',
    ],
  }, p0, p1);

  // P2 doesn't initialize eagerly - features load on demand
  console.log('✅ P2 ready (lazy loading)');

  // Step 4: Create combined integration
  const slideDesigner = SlideDesignerIntegration.getInstance({
    p0,
    p1,
    p2, // NEW: Add P2 to combined integration
  });

  console.log('🎉 Slide Designer fully initialized!');
}
```

### 9.2 Feature Access Workflow

```typescript
/**
 * Access P2 feature (lazy loading)
 */
async function useVoiceNarration(slideId: string): Promise<void> {
  const slideDesigner = SlideDesignerIntegration.getInstance();

  // Check if P2 voice narration is available
  if (!slideDesigner.isP2FeatureAvailable('voice-narration')) {
    console.warn('Voice narration not available');
    return;
  }

  try {
    // Get feature (triggers lazy loading if not already loaded)
    const voiceNarration = await slideDesigner.getP2Feature('voice-narration');

    // Use feature
    const audio = await voiceNarration.narrateSlide(slideId);
    console.log('✅ Voice narration generated');
  } catch (error) {
    console.error('❌ Voice narration failed:', error);
    // P0/P1 unaffected - presentation continues without narration
  }
}
```

### 9.3 Dependency Resolution Example

```typescript
/**
 * Figma Import depends on:
 * - P0: GridLayout, ImageOptimization
 * - P1: CustomFonts
 * - P2: ThemesMarketplace (optional)
 */
async function importFigmaDesign(fileKey: string): Promise<void> {
  const p2 = P2Integration.getInstance();

  // Check if Figma import can be loaded
  const canLoad = await p2.canLoadFeature('figma-import');
  if (!canLoad) {
    console.error('Figma import not available (dependencies missing)');
    return;
  }

  // Lazy load Figma import (automatically loads dependencies)
  const figmaImport = await p2.getFeature<FigmaImportManager>('figma-import');

  // Import design
  const imported = await figmaImport.importFigmaFile(fileKey, figmaToken);

  // Optionally publish to marketplace (P2 → P2 dependency)
  if (await p2.isFeatureAvailable('themes-marketplace')) {
    const marketplace = await p2.getFeature('themes-marketplace');
    const theme = await figmaImport.importAsTheme(fileKey);
    await marketplace.publishTheme(theme, {
      name: 'Imported from Figma',
      tags: ['figma', 'design'],
    });
  }
}
```

---

## 10. Testing Strategy

### 10.1 Unit Tests for P2 Features

```typescript
describe('P2Integration', () => {
  let p0: P0Integration;
  let p1: P1Integration;
  let p2: P2Integration;

  beforeEach(async () => {
    p0 = P0Integration.getInstance();
    await p0.initialize();

    p1 = P1Integration.getInstance({}, p0);
    await p1.initialize();

    p2 = P2Integration.getInstance({}, p0, p1);
  });

  afterEach(() => {
    P0Integration.resetInstance();
    P1Integration.resetInstance();
    P2Integration.resetInstance();
  });

  describe('Lazy Loading', () => {
    it('should not load features until accessed', async () => {
      // P2 initialized but no features loaded yet
      expect(p2.getFeatureStatus('voice-narration')).toBe('not_loaded');

      // Access feature (triggers lazy load)
      const voiceNarration = await p2.getFeature('voice-narration');
      expect(voiceNarration).toBeDefined();
      expect(p2.getFeatureStatus('voice-narration')).toBe('ready');
    });

    it('should handle lazy load failures gracefully', async () => {
      // Simulate missing API key
      await expect(p2.getFeature('figma-import')).rejects.toThrow(P2FeatureInitializationError);

      // P0/P1 still work
      expect(p0.isHealthy()).toBe(true);
      expect(p1.isHealthy()).toBe(true);
    });
  });

  describe('Dependency Resolution', () => {
    it('should check P0 dependencies before loading', async () => {
      // Disable P0 Typography (required by Voice Narration)
      p0['features'].get('typography')!.status = 'failed';

      await expect(p2.getFeature('voice-narration')).rejects.toThrow(P2DependencyError);
    });

    it('should check P1 dependencies before loading', async () => {
      // Disable P1 LivePresentation (required by Interactive Elements)
      p1['features'].get('live-presentation')!.status = 'failed';

      await expect(p2.getFeature('interactive-elements')).rejects.toThrow(P2DependencyError);
    });

    it('should load P2 dependencies automatically', async () => {
      // AR Presentation depends on Interactive Elements
      const arPresentation = await p2.getFeature('ar-presentation');

      // Interactive Elements should be auto-loaded
      expect(p2.getFeatureStatus('interactive-elements')).toBe('ready');
    });
  });

  describe('Browser Compatibility', () => {
    it('should reject AR Presentation on unsupported browsers', async () => {
      // Mock browser without WebXR
      delete (navigator as any).xr;

      await expect(p2.getFeature('ar-presentation')).rejects.toThrow();
    });

    it('should reject Blockchain NFT without Web3 wallet', async () => {
      // Mock browser without Ethereum
      delete (window as any).ethereum;

      await expect(p2.getFeature('blockchain-nft')).rejects.toThrow();
    });
  });
});
```

### 10.2 Integration Tests

```typescript
describe('P2 Integration with P0/P1', () => {
  it('should integrate Voice Narration with Speaker Notes', async () => {
    const p2 = P2Integration.getInstance();
    const voiceNarration = await p2.getFeature<VoiceNarrationManager>('voice-narration');

    // Get speaker notes from P1
    const p1 = P1Integration.getInstance();
    const speakerNotes = p1.getFeature<SpeakerNotesManager>('speaker-notes');
    speakerNotes.setNotes('slide-1', 'This is a test note');

    // Generate narration from speaker notes
    const narration = await voiceNarration.narrateSlide('slide-1');
    expect(narration).toContain('This is a test note');
  });

  it('should integrate Themes Marketplace with Template Library', async () => {
    const p2 = P2Integration.getInstance();
    const marketplace = await p2.getFeature<ThemesMarketplaceManager>('themes-marketplace');

    // Download theme from marketplace
    const theme = await marketplace.downloadTheme('theme-123');

    // Add to P1 Template Library
    const p1 = P1Integration.getInstance();
    const templateLibrary = p1.getFeature<TemplateLibraryManager>('template-library');
    templateLibrary.addCustomTemplate(theme);

    // Verify theme is available
    const templates = templateLibrary.getAllTemplates();
    expect(templates).toContainEqual(expect.objectContaining({ id: 'theme-123' }));
  });

  it('should integrate API Access with all features', async () => {
    const p2 = P2Integration.getInstance();
    const apiAccess = await p2.getFeature<DeveloperAPIManager>('api-access');

    // Start API server
    await apiAccess.startAPIServer(3000, {
      enableP0: true,
      enableP1: true,
      enableP2: true,
    });

    // Test API endpoints
    const response = await fetch('http://localhost:3000/api/v1/health');
    const health = await response.json();

    expect(health.p0.healthy).toBe(true);
    expect(health.p1.healthy).toBe(true);
    expect(health.p2.available).toContain('voice-narration');
  });
});
```

### 10.3 Performance Tests

```typescript
describe('P2 Performance', () => {
  it('should load batch 1 features in < 2s', async () => {
    const p2 = P2Integration.getInstance();

    const start = performance.now();
    await p2.getFeature('voice-narration');
    await p2.getFeature('api-access');
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(2000);
  });

  it('should not block P0/P1 initialization', async () => {
    const start = performance.now();

    // Initialize P0 + P1
    const p0 = P0Integration.getInstance();
    await p0.initialize();
    const p1 = P1Integration.getInstance({}, p0);
    await p1.initialize();

    const p0p1Duration = performance.now() - start;

    // Initialize P2 (lazy, should be instant)
    const p2 = P2Integration.getInstance({}, p0, p1);
    const totalDuration = performance.now() - start;

    // P2 init should add negligible time
    expect(totalDuration - p0p1Duration).toBeLessThan(100);
  });

  it('should dispose heavy features to free memory', async () => {
    const p2 = P2Integration.getInstance();

    // Load 3D Animations (heavy)
    const threeDAnimations = await p2.getFeature('3d-animations');
    const memoryBefore = (performance as any).memory?.usedJSHeapSize || 0;

    // Dispose feature
    await p2.disposeFeature('3d-animations');

    const memoryAfter = (performance as any).memory?.usedJSHeapSize || 0;

    // Memory should be freed (at least 50MB for Three.js)
    if (memoryBefore > 0) {
      expect(memoryBefore - memoryAfter).toBeGreaterThan(50 * 1024 * 1024);
    }
  });
});
```

---

## 11. Rollback Procedures

### 11.1 Feature-Level Rollback

```typescript
/**
 * Disable single P2 feature at runtime
 */
async function rollbackFeature(featureId: P2FeatureId): Promise<void> {
  const p2 = P2Integration.getInstance();

  // Disable feature
  p2.disableFeature(featureId);

  // Dispose to free resources
  await p2.disposeFeature(featureId);

  console.log(`✅ P2 feature ${featureId} rolled back`);
}
```

### 11.2 Batch Rollback

```typescript
/**
 * Rollback entire P2 batch
 */
async function rollbackBatch(batchNumber: number): Promise<void> {
  const batch = P2_BATCHES.find(b => b.batch === batchNumber);
  if (!batch) {
    throw new Error(`Unknown batch: ${batchNumber}`);
  }

  const p2 = P2Integration.getInstance();

  for (const featureId of batch.features) {
    await rollbackFeature(featureId);
  }

  console.log(`✅ Batch ${batchNumber} (${batch.name}) rolled back`);
}
```

### 11.3 Complete P2 Rollback

```typescript
/**
 * Disable all P2 features and fallback to P0+P1
 */
async function rollbackToP0P1(): Promise<void> {
  const p2 = P2Integration.getInstance();

  // Disable all P2 features
  for (const featureId of P2_FEATURE_IDS) {
    await rollbackFeature(featureId);
  }

  // Shutdown P2 integration
  await p2.shutdown();

  // Reset singleton
  P2Integration.resetInstance();

  console.log('✅ Rolled back to P0+P1 (all P2 features disabled)');
}
```

### 11.4 Rollback Decision Matrix

| Issue Severity | Rollback Strategy | Recovery Time |
|----------------|------------------|---------------|
| **Critical** (P2 breaks P0/P1) | Immediate full rollback | < 5 min |
| **High** (P2 feature crashes) | Disable affected feature | < 15 min |
| **Medium** (P2 feature slow) | Disable for some users (A/B) | < 1 hour |
| **Low** (P2 feature minor bug) | Fix in next release | N/A |

---

## 12. Architecture Decision Records (ADRs)

### ADR-001: Why Lazy Loading for P2?

**Context:**
P2 features include heavy dependencies (Three.js, Web3.js) that significantly increase bundle size.

**Decision:**
Implement lazy loading for all P2 features. Features load only when accessed, not during initialization.

**Consequences:**
- ✅ **Pro**: Zero impact on initial page load (P0/P1 load time unchanged)
- ✅ **Pro**: Users only download what they use
- ✅ **Pro**: Easier to rollback individual features
- ❌ **Con**: First access has loading delay
- ❌ **Con**: More complex dependency management

**Status:** Accepted

---

### ADR-002: Why 4 Batches Instead of 8 Individual Features?

**Context:**
We could initialize each P2 feature independently, but some features have inter-dependencies.

**Decision:**
Group features into 4 batches based on risk and complexity.

**Rationale:**
- **Batch 1 (Quick Wins)**: Simple features, low risk
- **Batch 2 (Interactive & Marketplace)**: Medium complexity, moderate dependencies
- **Batch 3 (Advanced Visual)**: High complexity, heavy dependencies
- **Batch 4 (Cutting Edge)**: Experimental tech, very high risk

**Consequences:**
- ✅ **Pro**: Easier to rollback related features together
- ✅ **Pro**: Clearer deployment strategy
- ✅ **Pro**: Performance budgets per batch
- ❌ **Con**: Can't enable single feature from a batch without dependencies

**Status:** Accepted

---

### ADR-003: Why Not Initialize P2 Eagerly?

**Context:**
P0 and P1 initialize eagerly (all features load upfront). Should P2 follow the same pattern?

**Decision:**
NO. P2 uses lazy loading exclusively.

**Rationale:**
- P2 features are experimental and optional
- Heavy dependencies (Three.js: 600KB, Web3.js: 1MB) would slow down initialization
- Many users won't use P2 features at all
- Lazy loading ensures zero impact on core functionality

**Consequences:**
- ✅ **Pro**: Fast initialization (same as P0+P1 only)
- ✅ **Pro**: Lower bundle size
- ✅ **Pro**: Better user experience
- ❌ **Con**: First feature access has delay

**Status:** Accepted

---

## 13. Deployment Plan

### 13.1 Gradual Rollout

**Phase 1: Internal Testing (Week 1)**
- Deploy P2 integration to staging environment
- Enable all 8 features for internal team
- Test all integration patterns
- Measure performance impact

**Phase 2: Alpha Release (Week 2-3)**
- Enable Batch 1 (Voice, API) for 10% of users
- Monitor error rates and performance
- Gather user feedback
- Fix critical issues

**Phase 3: Beta Release (Week 4-5)**
- Enable Batch 2 (Interactive, Marketplace) for 50% of users
- Continue monitoring
- Optimize based on usage patterns

**Phase 4: Limited GA (Week 6-7)**
- Enable Batch 3 (3D, Figma) for all users (experimental flag)
- Heavy features remain opt-in

**Phase 5: Full GA (Week 8+)**
- Enable Batch 4 (AR, Blockchain) for users with compatible browsers
- Continue gradual rollout based on browser compatibility

### 13.2 Deployment Checklist

**Pre-Deployment:**
- [ ] All unit tests pass (P2 features)
- [ ] Integration tests pass (P2 + P0/P1)
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] API keys configured (server-side)
- [ ] Browser compatibility verified
- [ ] Documentation updated

**During Deployment:**
- [ ] Deploy P2 code (disabled via feature flags)
- [ ] Verify P0/P1 still work
- [ ] Enable features gradually (10% → 50% → 100%)
- [ ] Monitor error rates
- [ ] Monitor performance metrics
- [ ] Check memory usage

**Post-Deployment:**
- [ ] Verify all features load correctly
- [ ] Check analytics for adoption rate
- [ ] Gather user feedback
- [ ] Document issues and resolutions
- [ ] Plan next batch rollout

---

## 14. Appendix

### 14.1 Feature Implementation Status

| Feature ID | Status | Tests | Docs | Browser Support |
|------------|--------|-------|------|----------------|
| P2.3 Voice Narration | 🔴 Not Started | ❌ | ❌ | Chrome 90+, Edge 90+ |
| P2.6 API Access | 🔴 Not Started | ❌ | ❌ | All browsers |
| P2.4 Interactive Elements | 🔴 Not Started | ❌ | ❌ | All browsers |
| P2.5 Themes Marketplace | 🔴 Not Started | ❌ | ❌ | All browsers |
| P2.1 3D Animations | 🔴 Not Started | ❌ | ❌ | Chrome 90+, Firefox 88+ |
| P2.7 Figma Import | 🔴 Not Started | ❌ | ❌ | All browsers |
| P2.2 AR Presentation | 🔴 Not Started | ❌ | ❌ | Chrome 90+ (WebXR) |
| P2.8 Blockchain NFT | 🔴 Not Started | ❌ | ❌ | Chrome, Firefox, Brave |

### 14.2 Browser Compatibility Matrix

| Feature | Chrome | Firefox | Safari | Edge | Mobile |
|---------|--------|---------|--------|------|--------|
| Voice Narration | 90+ | ❌ | ❌ | 90+ | ❌ |
| API Access | All | All | All | All | All |
| Interactive Elements | All | All | All | All | All |
| Themes Marketplace | All | All | All | All | All |
| 3D Animations | 90+ | 88+ | 15+ | 90+ | Limited |
| Figma Import | All | All | All | All | All |
| AR Presentation | 90+ (WebXR) | ❌ | ❌ | 90+ | Android Chrome |
| Blockchain NFT | 90+ | 90+ | ❌ | 90+ | Mobile wallets |

### 14.3 External Dependencies

| Dependency | Version | Size | Used By |
|------------|---------|------|---------|
| Three.js | ^0.160.0 | ~600KB | 3D Animations |
| Web3.js | ^4.0.0 | ~1MB | Blockchain NFT |
| WebXR Polyfill | ^2.0.0 | ~100KB | AR Presentation |
| DOMPurify | ^3.0.0 | ~20KB | Themes Marketplace |
| TTS SDK (OpenAI) | ^1.0.0 | ~50KB | Voice Narration |
| Figma API Client | ^1.0.0 | ~30KB | Figma Import |

### 14.4 Performance Budgets

| Metric | Batch 1 | Batch 2 | Batch 3 | Batch 4 |
|--------|---------|---------|---------|---------|
| Load Time | < 2s | < 5s | < 10s | < 15s |
| Bundle Size | < 100KB | < 200KB | < 800KB | < 1.5MB |
| Memory Usage | +10MB | +15MB | +80MB | +100MB |
| API Calls | < 5 | < 10 | < 15 | < 20 |

### 14.5 Key Metrics to Monitor

**Performance Metrics:**
- Time to Interactive (TTI) for each batch
- Memory footprint per feature
- Bundle size per batch
- API response times

**Quality Metrics:**
- Feature initialization success rate
- Lazy loading success rate
- Browser compatibility coverage
- Error rate per feature

**Adoption Metrics:**
- Feature usage rate
- User feedback sentiment
- Rollback frequency
- Support ticket volume

---

## 15. Conclusion

The P2 Integration architecture balances **innovation** with **stability** by:

1. **Lazy Loading**: Zero impact on P0/P1 performance
2. **Graceful Degradation**: P0/P1 work perfectly without P2
3. **Batched Rollout**: Gradual deployment reduces risk
4. **Feature Flags**: Easy rollback for any feature
5. **Security-First**: API key encryption, content sanitization
6. **Browser Compatibility**: Progressive enhancement

**Next Steps:**
1. Implement P2Integration class (follow P0/P1 patterns)
2. Create lazy loaders for all 8 features
3. Build feature-specific managers (VoiceNarrationManager, etc.)
4. Write comprehensive tests
5. Deploy Batch 1 (Quick Wins) first

---

**Document Status:** ✅ Complete
**Last Updated:** 2025-11-08
**Next Review:** After Batch 1 deployment
**Architect:** System Architecture Designer

**Approval Required:**
- [ ] Technical Lead
- [ ] Engineering Manager
- [ ] Security Team
- [ ] Product Owner

---

*End of P2 Integration Architecture Design*

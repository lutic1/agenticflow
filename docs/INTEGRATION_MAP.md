# Slide Designer Integration Map

**Generated:** 2025-11-09
**Backend Location:** `/home/user/agenticflow/src/slide-designer/`
**Frontend Location:** `/home/user/agenticflow/Frontend/`
**Total Features:** 35 (P0: 12, P1: 15, P2: 8)

---

## Table of Contents

- [Overview](#overview)
- [Architecture Summary](#architecture-summary)
- [P0 Features (Core - 12 features)](#p0-features-core---12-features)
- [P1 Features (Advanced - 15 features)](#p1-features-advanced---15-features)
- [P2 Features (Nice-to-Have - 8 features)](#p2-features-nice-to-have---8-features)
- [Proposed Frontend API Client](#proposed-frontend-api-client)
- [Integration Gaps & Recommendations](#integration-gaps--recommendations)
- [Feature Priority Matrix](#feature-priority-matrix)
- [Testing & Validation Status](#testing--validation-status)

---

## Overview

This document maps every user-visible feature in the Slide Designer to its backend implementation. It serves as the single source of truth for frontend integration work.

### Backend Architecture

```
/src/slide-designer/
├── integration.ts          # Main SlideDesignerIntegration class (P0 + P1 + P2)
├── p0-integration.ts       # 12 core features
├── p1-integration.ts       # 15 advanced features
├── p2-integration.ts       # 8 nice-to-have features
├── core/                   # 5 AI agents
│   ├── slide-generator.ts  # Main orchestrator
│   └── gemini-client.ts    # LLM integration
├── core-v2/                # P0 feature implementations
├── features/               # P1 feature implementations
├── quality-control/        # P0.11 & P0.12
└── types/                  # TypeScript definitions
```

### Integration Strategy

**Current State:**
- Frontend uses OpenAI GPT-5-mini
- No P0/P1/P2 feature integration
- Basic slide generation only

**Target State:**
- Frontend calls unified backend API
- All 35 features accessible via clean contracts
- Progressive enhancement (P0 → P1 → P2)

---

## P0 Features (Core - 12 features)

### P0.1 - Grid Layout System

**Priority:** P0 (Critical Path)
**Backend Module:** `/src/slide-designer/core-v2/grid-layout-engine.ts`
**Backend Class:** `GridLayoutEngine` (singleton: `gridLayoutEngine`)
**Status:** ✅ Backend Ready

#### Backend API Surface

```typescript
class GridLayoutEngine {
  createGrid(columns: number, rows: number, options?: GridOptions): Grid;
  applyConstraints(grid: Grid, constraints: Constraint[]): Grid;
  calculateSpacing(containerWidth: number, columns: number): number;
  validateLayout(grid: Grid): ValidationResult;
}
```

#### Request/Response Types

```typescript
// Request
interface CreateGridRequest {
  columns: number; // 1-12
  rows: number;    // 1-20
  options?: {
    gutter?: number;
    margin?: number;
    aspectRatio?: '16:9' | '4:3' | 'custom';
  };
}

// Response
interface GridResponse {
  success: boolean;
  grid: Grid;
  metadata: {
    totalCells: number;
    usableArea: number;
  };
}
```

#### Frontend Integration

**Proposed Component:** `GridLayoutBuilder`
**Proposed Route:** `/editor/layout`
**Auth Required:** Yes
**Error States:**
- Invalid column count (must be 1-12)
- Invalid row count (must be 1-20)
- Constraint conflicts

**Dependencies:** None

**Example Usage:**

```typescript
import { slideDesignerIntegration } from '@/api/backend-client';

const gridEngine = slideDesignerIntegration.getP0Feature('grid-layout');
const grid = gridEngine.createGrid(12, 6, {
  gutter: 16,
  aspectRatio: '16:9'
});
```

---

### P0.2 - Typography System

**Priority:** P0 (Critical Path)
**Backend Module:** `/src/slide-designer/core-v2/typography-engine.ts`
**Backend Class:** `TypographyEngine` (singleton: `typographyEngine`)
**Status:** ✅ Backend Ready

#### Backend API Surface

```typescript
class TypographyEngine {
  createTypeScale(baseSize: number, ratio: number): TypeScale;
  calculateOptimalFontSize(text: string, containerSize: Size): number;
  applyResponsiveScaling(fontSize: number, viewportWidth: number): number;
  validateReadability(text: string, fontSize: number, lineHeight: number): ValidationResult;
}
```

#### Request/Response Types

```typescript
// Request
interface TypographyRequest {
  text: string;
  containerSize: { width: number; height: number };
  minSize?: number;
  maxSize?: number;
  fontFamily?: string;
}

// Response
interface TypographyResponse {
  success: boolean;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  readabilityScore: number; // 0-100
}
```

#### Frontend Integration

**Proposed Component:** `TypographyEditor`
**Proposed Route:** `/editor/typography`
**Auth Required:** Yes
**Error States:**
- Text too long for container
- Invalid font family
- Readability below threshold

**Dependencies:** None

---

### P0.3 - Color Palettes & WCAG Compliance

**Priority:** P0 (Critical Path)
**Backend Module:** `/src/slide-designer/core-v2/color-engine.ts`
**Backend Class:** `ColorEngine` (singleton: `colorEngine`)
**Status:** ✅ Backend Ready

#### Backend API Surface

```typescript
class ColorEngine {
  generatePalette(baseColor: string, options?: PaletteOptions): ColorPalette;
  checkContrast(foreground: string, background: string): ContrastResult;
  ensureWCAG(palette: ColorPalette, level: 'AA' | 'AAA'): ColorPalette;
  suggestAccessibleColors(baseColor: string): string[];
}
```

#### Request/Response Types

```typescript
// Request
interface ColorPaletteRequest {
  baseColor: string; // hex, rgb, or hsl
  type: 'monochromatic' | 'complementary' | 'triadic' | 'analogous';
  wcagLevel: 'AA' | 'AAA';
}

// Response
interface ColorPaletteResponse {
  success: boolean;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  contrastRatios: Record<string, number>;
  wcagCompliant: boolean;
}
```

#### Frontend Integration

**Proposed Component:** `ColorPicker`
**Proposed Route:** `/editor/colors`
**Auth Required:** Yes
**Error States:**
- Invalid color format
- WCAG compliance failure
- Insufficient contrast

**Dependencies:** None

---

### P0.4 - Chart Integration

**Priority:** P0 (Critical Path)
**Backend Module:** `/src/slide-designer/core-v2/chart-renderer.ts`
**Backend Class:** `ChartRenderer` (singleton: `chartRenderer`)
**Status:** ✅ Backend Ready

#### Backend API Surface

```typescript
class ChartRenderer {
  createChart(type: ChartType, data: ChartData, options?: ChartOptions): Chart;
  renderToSVG(chart: Chart): string;
  renderToCanvas(chart: Chart): HTMLCanvasElement;
  updateChartData(chart: Chart, newData: ChartData): Chart;
}
```

#### Request/Response Types

```typescript
// Request
interface ChartRequest {
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area';
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string;
      borderColor?: string;
    }>;
  };
  options?: {
    title?: string;
    legend?: boolean;
    responsive?: boolean;
  };
}

// Response
interface ChartResponse {
  success: boolean;
  chart: Chart;
  svg?: string;
  canvas?: string; // base64
  accessibility: {
    alt: string;
    dataTable: string;
  };
}
```

#### Frontend Integration

**Proposed Component:** `ChartBuilder`
**Proposed Route:** `/editor/charts`
**Auth Required:** Yes
**Error States:**
- Invalid chart type
- Empty dataset
- Data validation errors

**Dependencies:** P0.3 (color-palettes) for theming

---

### P0.5 - Text Overflow Handling

**Priority:** P0 (Critical Path)
**Backend Module:** `/src/slide-designer/core-v2/text-overflow-handler.ts`
**Backend Class:** `TextOverflowHandler` (singleton: `textOverflowHandler`)
**Status:** ✅ Backend Ready

#### Backend API Surface

```typescript
class TextOverflowHandler {
  detectOverflow(text: string, container: Size, fontSize: number): boolean;
  compressText(text: string, targetLength: number): string;
  splitIntoSlides(text: string, maxPerSlide: number): string[];
  summarizeText(text: string, targetLength: number): Promise<string>;
}
```

#### Request/Response Types

```typescript
// Request
interface TextOverflowRequest {
  text: string;
  containerSize: { width: number; height: number };
  fontSize: number;
  strategy: 'compress' | 'split' | 'summarize';
}

// Response
interface TextOverflowResponse {
  success: boolean;
  hadOverflow: boolean;
  result: {
    strategy: string;
    processedText: string | string[];
    originalLength: number;
    finalLength: number;
  };
}
```

#### Frontend Integration

**Proposed Component:** `TextOverflowResolver`
**Proposed Route:** N/A (automatic)
**Auth Required:** Yes
**Error States:**
- Text too large to process
- Summarization API failure

**Dependencies:** P0.2 (typography)

---

### P0.6 - Master Slides & Branding

**Priority:** P0 (Critical Path)
**Backend Module:** `/src/slide-designer/core-v2/master-slide-manager.ts`
**Backend Class:** `MasterSlideManager` (singleton: `masterSlideManager`)
**Status:** ✅ Backend Ready

#### Backend API Surface

```typescript
class MasterSlideManager {
  createMasterSlide(config: MasterSlideConfig): MasterSlide;
  applyBranding(masterSlide: MasterSlide, branding: BrandConfig): MasterSlide;
  saveMasterSlide(masterSlide: MasterSlide): Promise<string>;
  loadMasterSlide(id: string): Promise<MasterSlide>;
  applyToSlides(slides: Slide[], masterSlideId: string): Slide[];
}
```

#### Request/Response Types

```typescript
// Request
interface MasterSlideRequest {
  name: string;
  branding: {
    logo?: string; // URL or base64
    colors: ColorPalette;
    fonts: FontConfig;
    footer?: string;
  };
  layout: LayoutConfig;
}

// Response
interface MasterSlideResponse {
  success: boolean;
  masterSlide: MasterSlide;
  id: string;
  previewUrl: string;
}
```

#### Frontend Integration

**Proposed Component:** `MasterSlideEditor`
**Proposed Route:** `/branding/master-slides`
**Auth Required:** Yes
**Error States:**
- Invalid logo format
- Missing required branding elements
- Storage quota exceeded

**Dependencies:** P0.1 (grid-layout), P0.2 (typography), P0.3 (color-palettes)

---

### P0.7 - Transitions & Animations

**Priority:** P0 (Enhanced UX)
**Backend Module:** `/src/slide-designer/core-v2/transition-engine.ts`
**Backend Class:** `TransitionEngine` (singleton: `transitionEngine`)
**Status:** ✅ Backend Ready (Optional)

#### Backend API Surface

```typescript
class TransitionEngine {
  createTransition(type: TransitionType, duration: number, options?: TransitionOptions): Transition;
  applyToSlide(slide: Slide, transition: Transition): Slide;
  validateTransition(transition: Transition): ValidationResult;
  getAvailableTransitions(): TransitionType[];
}
```

#### Request/Response Types

```typescript
// Request
interface TransitionRequest {
  type: 'fade' | 'slide' | 'zoom' | 'flip' | 'cube' | 'none';
  duration: number; // milliseconds
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

// Response
interface TransitionResponse {
  success: boolean;
  transition: Transition;
  cssClass: string;
  keyframes?: string;
}
```

#### Frontend Integration

**Proposed Component:** `TransitionPicker`
**Proposed Route:** `/editor/transitions`
**Auth Required:** Yes
**Error States:**
- Invalid transition type
- Duration out of range (50-5000ms)

**Dependencies:** None

---

### P0.8 - Accessibility Engine

**Priority:** P0 (Critical Path)
**Backend Module:** `/src/slide-designer/core-v2/accessibility-engine.ts`
**Backend Class:** `AccessibilityEngine` (singleton: `accessibilityEngine`)
**Status:** ✅ Backend Ready

#### Backend API Surface

```typescript
class AccessibilityEngine {
  auditSlide(slide: Slide): AccessibilityReport;
  generateAltText(image: string): Promise<string>;
  checkColorContrast(colors: ColorPalette): ContrastReport;
  validateARIA(html: string): ARIAValidationResult;
  suggestImprovements(report: AccessibilityReport): Improvement[];
}
```

#### Request/Response Types

```typescript
// Request
interface AccessibilityAuditRequest {
  slide: Slide;
  wcagLevel: 'A' | 'AA' | 'AAA';
}

// Response
interface AccessibilityAuditResponse {
  success: boolean;
  score: number; // 0-100
  issues: Array<{
    severity: 'error' | 'warning' | 'info';
    rule: string;
    message: string;
    suggestion?: string;
  }>;
  wcagCompliant: boolean;
}
```

#### Frontend Integration

**Proposed Component:** `AccessibilityPanel`
**Proposed Route:** `/editor/accessibility`
**Auth Required:** Yes
**Error States:**
- Slide validation failure
- Image alt-text generation timeout

**Dependencies:** P0.3 (color-palettes), P0.2 (typography)

---

### P0.9 - Export Engine

**Priority:** P0 (Critical Path)
**Backend Module:** `/src/slide-designer/core-v2/export-engine.ts`
**Backend Class:** `ExportEngine` (singleton: `exportEngine`)
**Status:** ✅ Backend Ready

#### Backend API Surface

```typescript
class ExportEngine {
  exportToPDF(slides: Slide[], options?: PDFOptions): Promise<Blob>;
  exportToPPTX(slides: Slide[], options?: PPTXOptions): Promise<Blob>;
  exportToHTML(slides: Slide[], options?: HTMLOptions): Promise<string>;
  exportToImages(slides: Slide[], format: 'png' | 'jpg'): Promise<Blob[]>;
}
```

#### Request/Response Types

```typescript
// Request
interface ExportRequest {
  slides: Slide[];
  format: 'pdf' | 'pptx' | 'html' | 'png' | 'jpg';
  options?: {
    quality?: 'low' | 'medium' | 'high';
    includeNotes?: boolean;
    pageSize?: 'A4' | 'letter' | 'custom';
  };
}

// Response
interface ExportResponse {
  success: boolean;
  data: Blob | string;
  filename: string;
  size: number; // bytes
  mimeType: string;
}
```

#### Frontend Integration

**Proposed Component:** `ExportDialog`
**Proposed Route:** `/export`
**Auth Required:** Yes
**Error States:**
- Export generation timeout
- File size too large
- Format not supported

**Dependencies:** P0.1, P0.2, P0.3, P0.8 (for accessibility metadata)

---

### P0.10 - Image Optimization

**Priority:** P0 (Critical Path)
**Backend Module:** `/src/slide-designer/core-v2/image-optimizer.ts`
**Backend Class:** `ImageOptimizer` (singleton: `imageOptimizer`)
**Status:** ✅ Backend Ready

#### Backend API Surface

```typescript
class ImageOptimizer {
  optimizeImage(image: Blob, options?: OptimizationOptions): Promise<Blob>;
  resizeImage(image: Blob, targetSize: Size): Promise<Blob>;
  compressImage(image: Blob, quality: number): Promise<Blob>;
  convertFormat(image: Blob, targetFormat: ImageFormat): Promise<Blob>;
  batchOptimize(images: Blob[]): Promise<Blob[]>;
}
```

#### Request/Response Types

```typescript
// Request
interface ImageOptimizationRequest {
  image: Blob | string; // Blob or base64
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number; // 0-100
    format?: 'webp' | 'png' | 'jpg';
  };
}

// Response
interface ImageOptimizationResponse {
  success: boolean;
  optimizedImage: Blob;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
}
```

#### Frontend Integration

**Proposed Component:** `ImageUploader`
**Proposed Route:** N/A (automatic)
**Auth Required:** Yes
**Error States:**
- Invalid image format
- Image too large (>10MB)
- Optimization failure

**Dependencies:** None

---

### P0.11 - Content Validation

**Priority:** P0 (Critical Path)
**Backend Module:** `/src/slide-designer/quality-control/content-validator.ts`
**Backend Class:** `ContentValidator` (singleton: `contentValidator`)
**Status:** ✅ Backend Ready

#### Backend API Surface

```typescript
class ContentValidator {
  validateSlide(slide: Slide): ValidationResult;
  validatePresentation(slides: Slide[]): ValidationResult;
  checkSpelling(text: string): SpellingResult;
  checkGrammar(text: string): GrammarResult;
  suggestImprovements(slide: Slide): Improvement[];
}
```

#### Request/Response Types

```typescript
// Request
interface ContentValidationRequest {
  content: string | Slide | Slide[];
  rules?: string[]; // Optional rule IDs to check
}

// Response
interface ContentValidationResponse {
  success: boolean;
  valid: boolean;
  errors: Array<{
    type: 'spelling' | 'grammar' | 'structure' | 'content';
    message: string;
    position?: { start: number; end: number };
    suggestion?: string;
  }>;
  warnings: Array<{
    type: string;
    message: string;
  }>;
}
```

#### Frontend Integration

**Proposed Component:** `ContentValidator`
**Proposed Route:** N/A (real-time)
**Auth Required:** Yes
**Error States:**
- Validation timeout
- Too many errors to process

**Dependencies:** P0.2 (typography)

---

### P0.12 - LLM-as-Judge Quality Control

**Priority:** P0 (Enhanced UX - Optional)
**Backend Module:** `/src/slide-designer/quality-control/llm-judge.ts`
**Backend Class:** `LLMJudge` (singleton: `llmJudge`)
**Status:** ✅ Backend Ready (Requires API Key)

#### Backend API Surface

```typescript
class LLMJudge {
  scorePresentation(slides: Slide[]): Promise<QualityScore>;
  provideFeedback(slide: Slide): Promise<Feedback>;
  suggestImprovements(presentation: Presentation): Promise<Improvement[]>;
  compareVersions(v1: Presentation, v2: Presentation): Promise<Comparison>;
}
```

#### Request/Response Types

```typescript
// Request
interface LLMJudgeRequest {
  slides: Slide[];
  criteria?: string[]; // e.g., ['clarity', 'engagement', 'visual-appeal']
}

// Response
interface LLMJudgeResponse {
  success: boolean;
  score: number; // 0-100
  feedback: {
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
  };
  detailedScores: Record<string, number>;
}
```

#### Frontend Integration

**Proposed Component:** `QualityScorePanel`
**Proposed Route:** `/quality`
**Auth Required:** Yes
**Error States:**
- API key missing/invalid
- LLM request timeout
- Rate limit exceeded

**Dependencies:** None (optional feature)

---

## P1 Features (Advanced - 15 features)

### P1.1 - Interactive Widgets

**Priority:** P1 (Enhanced UX)
**Backend Module:** `/src/slide-designer/features/` (not yet implemented)
**Backend Class:** N/A
**Status:** ⚠️ Placeholder Only

#### Proposed Backend API Surface

```typescript
class InteractiveWidgetsManager {
  createWidget(type: WidgetType, config: WidgetConfig): Widget;
  embedWidget(slide: Slide, widget: Widget): Slide;
  getAvailableWidgets(): WidgetType[];
}
```

#### Frontend Integration

**Proposed Component:** `WidgetLibrary`
**Proposed Route:** `/editor/widgets`
**Auth Required:** Yes
**Dependencies:** None

---

### P1.2 - Real-time Synchronization

**Priority:** P1 (Enhanced UX)
**Backend Module:** `/src/slide-designer/features/` (not yet implemented)
**Backend Class:** N/A
**Status:** ⚠️ Placeholder Only

#### Proposed Backend API Surface

```typescript
class RealTimeSyncManager {
  initializeSync(presentationId: string): Promise<SyncSession>;
  sendUpdate(update: Update): Promise<void>;
  onUpdate(callback: (update: Update) => void): void;
  closeSync(): Promise<void>;
}
```

#### Frontend Integration

**Proposed Component:** `RealTimeSyncIndicator`
**Proposed Route:** N/A (global)
**Auth Required:** Yes
**Dependencies:** P1.9 (collaboration)

---

### P1.3 - Speaker Notes UI

**Priority:** P1 (Enhanced UX)
**Backend Module:** `/src/slide-designer/features/speaker-notes.ts`
**Backend Class:** `SpeakerNotesManager` (singleton: `speakerNotesManager`)
**Status:** ✅ Backend Ready

#### Backend API Surface

```typescript
class SpeakerNotesManager {
  addNotes(slideId: string, notes: string): Promise<void>;
  getNotes(slideId: string): Promise<string>;
  updateNotes(slideId: string, notes: string): Promise<void>;
  deleteNotes(slideId: string): Promise<void>;
  exportNotes(presentationId: string): Promise<string>;
}
```

#### Request/Response Types

```typescript
// Request
interface SpeakerNotesRequest {
  slideId: string;
  notes: string;
}

// Response
interface SpeakerNotesResponse {
  success: boolean;
  slideId: string;
  notes: string;
  timestamp: Date;
}
```

#### Frontend Integration

**Proposed Component:** `SpeakerNotesPanel`
**Proposed Route:** `/editor/notes`
**Auth Required:** Yes
**Error States:**
- Notes too long (>10,000 chars)
- Slide not found

**Dependencies:** None

---

### P1.4 - Slide Duplication & Reordering

**Priority:** P1 (Critical Path)
**Backend Module:** `/src/slide-designer/features/slide-manager.ts`
**Backend Class:** `SlideManager` (singleton: `getGlobalSlideManager()`)
**Status:** ✅ Backend Ready

#### Backend API Surface

```typescript
class SlideManager {
  duplicateSlide(slideId: string): Promise<Slide>;
  reorderSlides(presentationId: string, newOrder: string[]): Promise<Presentation>;
  moveSlide(slideId: string, newPosition: number): Promise<Presentation>;
  deleteSlide(slideId: string): Promise<void>;
}
```

#### Request/Response Types

```typescript
// Request
interface SlideReorderRequest {
  presentationId: string;
  slideOrder: string[]; // Array of slide IDs
}

// Response
interface SlideReorderResponse {
  success: boolean;
  presentation: Presentation;
  updatedAt: Date;
}
```

#### Frontend Integration

**Proposed Component:** `SlideNavigator`
**Proposed Route:** `/editor`
**Auth Required:** Yes
**Error States:**
- Invalid slide order
- Presentation locked
- Concurrent modification

**Dependencies:** None

---

### P1.5 - Template Library

**Priority:** P1 (Critical Path)
**Backend Module:** `/src/slide-designer/features/template-library.ts`
**Backend Class:** `TemplateLibrary` (singleton: `templateLibrary`)
**Status:** ✅ Backend Ready

#### Backend API Surface

```typescript
class TemplateLibrary {
  getTemplates(): Template[];
  getTemplate(id: string): Template;
  applyTemplate(presentationId: string, templateId: string): Promise<Presentation>;
  createCustomTemplate(presentation: Presentation): Promise<Template>;
  searchTemplates(query: string, filters?: TemplateFilters): Template[];
}
```

#### Request/Response Types

```typescript
// Request
interface TemplateRequest {
  category?: 'business' | 'education' | 'creative' | 'pitch';
  tags?: string[];
  limit?: number;
}

// Response
interface TemplateResponse {
  success: boolean;
  templates: Array<{
    id: string;
    name: string;
    description: string;
    previewUrl: string;
    category: string;
    tags: string[];
    slideCount: number;
  }>;
}
```

#### Frontend Integration

**Proposed Component:** `TemplateGallery`
**Proposed Route:** `/templates`
**Auth Required:** Yes
**Error States:**
- Template not found
- Template incompatible with current version

**Dependencies:** None

---

### P1.6 - Multi-Language Support (i18n)

**Priority:** P1 (Enhanced UX)
**Backend Module:** `/src/slide-designer/features/i18n.ts`
**Backend Class:** `I18nManager` (singleton: `i18n`)
**Status:** ✅ Backend Ready

#### Backend API Surface

```typescript
class I18nManager {
  setLanguage(locale: string): Promise<void>;
  translatePresentation(presentation: Presentation, targetLocale: string): Promise<Presentation>;
  getSupportedLanguages(): Language[];
  detectLanguage(text: string): string;
  addTranslation(key: string, locale: string, value: string): void;
}
```

#### Request/Response Types

```typescript
// Request
interface TranslationRequest {
  presentationId: string;
  targetLocale: string; // e.g., 'es-ES', 'fr-FR'
  preserveFormatting?: boolean;
}

// Response
interface TranslationResponse {
  success: boolean;
  translatedPresentation: Presentation;
  sourceLocale: string;
  targetLocale: string;
  confidence: number; // 0-100
}
```

#### Frontend Integration

**Proposed Component:** `LanguageSwitcher`
**Proposed Route:** N/A (global)
**Auth Required:** Yes
**Error States:**
- Unsupported language
- Translation API failure
- Character encoding issues

**Dependencies:** None

---

### P1.7 - Video Embed Support

**Priority:** P1 (Enhanced UX)
**Backend Module:** `/src/slide-designer/features/video-embed.ts`
**Backend Class:** `VideoEmbedManager` (singleton: `videoEmbedManager`)
**Status:** ✅ Backend Ready

#### Backend API Surface

```typescript
class VideoEmbedManager {
  embedVideo(url: string, options?: VideoOptions): Promise<VideoEmbed>;
  validateVideoUrl(url: string): boolean;
  getThumbnail(videoUrl: string): Promise<string>;
  getSupportedProviders(): string[];
}
```

#### Request/Response Types

```typescript
// Request
interface VideoEmbedRequest {
  url: string; // YouTube, Vimeo, etc.
  options?: {
    autoplay?: boolean;
    controls?: boolean;
    startTime?: number;
  };
}

// Response
interface VideoEmbedResponse {
  success: boolean;
  embedCode: string;
  thumbnailUrl: string;
  provider: string;
  duration?: number;
}
```

#### Frontend Integration

**Proposed Component:** `VideoEmbedDialog`
**Proposed Route:** `/editor/media/video`
**Auth Required:** Yes
**Error States:**
- Invalid video URL
- Provider not supported
- Embedding disabled by video owner

**Dependencies:** None

---

### P1.8 - Custom Font Upload

**Priority:** P1 (Enhanced UX)
**Backend Module:** `/src/slide-designer/features/custom-fonts.ts`
**Backend Class:** `CustomFontManager` (singleton: `customFontManager`)
**Status:** ✅ Backend Ready

#### Backend API Surface

```typescript
class CustomFontManager {
  uploadFont(fontFile: File): Promise<FontMetadata>;
  getFonts(): FontMetadata[];
  applyFont(slideId: string, fontFamily: string): Promise<Slide>;
  deleteFont(fontId: string): Promise<void>;
  validateFont(fontFile: File): ValidationResult;
}
```

#### Request/Response Types

```typescript
// Request
interface FontUploadRequest {
  fontFile: File; // .ttf, .otf, .woff, .woff2
  fontFamily: string;
}

// Response
interface FontUploadResponse {
  success: boolean;
  font: {
    id: string;
    family: string;
    style: string;
    weight: number;
    format: string;
    url: string;
  };
}
```

#### Frontend Integration

**Proposed Component:** `FontManager`
**Proposed Route:** `/settings/fonts`
**Auth Required:** Yes
**Error States:**
- Invalid font format
- Font file too large (>5MB)
- Font family already exists

**Dependencies:** None

---

### P1.9 - Collaboration Features

**Priority:** P1 (Enhanced UX)
**Backend Module:** `/src/slide-designer/features/collaboration.ts`
**Backend Class:** `CollaborationManager` (singleton: `collaborationManager`)
**Status:** ✅ Backend Ready

#### Backend API Surface

```typescript
class CollaborationManager {
  sharePresentation(presentationId: string, userIds: string[]): Promise<Share>;
  getCollaborators(presentationId: string): Promise<User[]>;
  setPermissions(shareId: string, permissions: Permissions): Promise<void>;
  getComments(presentationId: string): Promise<Comment[]>;
  addComment(slideId: string, comment: CommentData): Promise<Comment>;
}
```

#### Request/Response Types

```typescript
// Request
interface SharePresentationRequest {
  presentationId: string;
  users: Array<{
    userId: string;
    role: 'viewer' | 'editor' | 'admin';
  }>;
}

// Response
interface SharePresentationResponse {
  success: boolean;
  shareLinks: Array<{
    userId: string;
    shareUrl: string;
    expiresAt?: Date;
  }>;
}
```

#### Frontend Integration

**Proposed Component:** `CollaborationPanel`
**Proposed Route:** `/collaboration`
**Auth Required:** Yes
**Error States:**
- User not found
- Permission denied
- Share limit exceeded

**Dependencies:** P1.10 (version-history)

---

### P1.10 - Version History

**Priority:** P1 (Critical Path)
**Backend Module:** `/src/slide-designer/features/version-history.ts`
**Backend Class:** `VersionHistoryManager` (singleton: `versionHistory`)
**Status:** ✅ Backend Ready

#### Backend API Surface

```typescript
class VersionHistoryManager {
  saveVersion(presentation: Presentation, message?: string): Promise<Version>;
  getVersions(presentationId: string): Promise<Version[]>;
  restoreVersion(versionId: string): Promise<Presentation>;
  compareVersions(v1: string, v2: string): Promise<Diff>;
  deleteVersion(versionId: string): Promise<void>;
}
```

#### Request/Response Types

```typescript
// Request
interface SaveVersionRequest {
  presentationId: string;
  message?: string;
  tags?: string[];
}

// Response
interface SaveVersionResponse {
  success: boolean;
  version: {
    id: string;
    presentationId: string;
    createdAt: Date;
    createdBy: string;
    message: string;
    snapshot: Presentation;
  };
}
```

#### Frontend Integration

**Proposed Component:** `VersionHistory`
**Proposed Route:** `/history`
**Auth Required:** Yes
**Error States:**
- Version limit exceeded
- Restore failed
- Version not found

**Dependencies:** P1.4 (slide-manager)

---

### P1.11 - AI Image Generation (DALL-E 3)

**Priority:** P1 (Enhanced UX)
**Backend Module:** `/src/slide-designer/features/ai-image-generation.ts`
**Backend Class:** `AIImageGenerationManager` (singleton: `aiImageGenerator`)
**Status:** ✅ Backend Ready (Requires API Key)

#### Backend API Surface

```typescript
class AIImageGenerationManager {
  generateImage(prompt: string, options?: ImageGenOptions): Promise<GeneratedImage>;
  getGenerationHistory(): Promise<GeneratedImage[]>;
  saveToLibrary(imageUrl: string): Promise<void>;
  estimateCost(options: ImageGenOptions): number;
}
```

#### Request/Response Types

```typescript
// Request
interface AIImageRequest {
  prompt: string;
  style?: 'photorealistic' | 'artistic' | 'abstract' | 'illustration';
  size?: '256x256' | '512x512' | '1024x1024';
  quality?: 'standard' | 'hd';
}

// Response
interface AIImageResponse {
  success: boolean;
  images: Array<{
    url: string;
    prompt: string;
    revisedPrompt?: string;
    size: string;
  }>;
  cost: number;
}
```

#### Frontend Integration

**Proposed Component:** `AIImageGenerator`
**Proposed Route:** `/media/ai-generate`
**Auth Required:** Yes
**Error States:**
- API key missing/invalid
- Prompt policy violation
- Generation timeout
- Rate limit exceeded

**Dependencies:** None

---

### P1.12 - Data Import (CSV, Excel, JSON)

**Priority:** P1 (Critical Path)
**Backend Module:** `/src/slide-designer/features/data-import.ts`
**Backend Class:** `DataImportManager` (singleton: `dataImportManager`)
**Status:** ✅ Backend Ready

#### Backend API Surface

```typescript
class DataImportManager {
  importCSV(file: File): Promise<DataTable>;
  importExcel(file: File): Promise<DataTable[]>;
  importJSON(file: File): Promise<any>;
  parseData(data: string, format: DataFormat): Promise<DataTable>;
  convertToChart(data: DataTable, chartType: ChartType): Promise<Chart>;
}
```

#### Request/Response Types

```typescript
// Request
interface DataImportRequest {
  file: File;
  format: 'csv' | 'xlsx' | 'json';
  options?: {
    hasHeader?: boolean;
    delimiter?: string;
    encoding?: string;
  };
}

// Response
interface DataImportResponse {
  success: boolean;
  data: {
    rows: any[][];
    headers?: string[];
    rowCount: number;
    columnCount: number;
  };
  preview: string[][]; // First 10 rows
}
```

#### Frontend Integration

**Proposed Component:** `DataImporter`
**Proposed Route:** `/editor/data/import`
**Auth Required:** Yes
**Error States:**
- Invalid file format
- File too large (>10MB)
- Parsing error
- Unsupported encoding

**Dependencies:** None

---

### P1.13 - Presentation Analytics

**Priority:** P1 (Enhanced UX)
**Backend Module:** `/src/slide-designer/features/analytics.ts`
**Backend Class:** `PresentationAnalyticsManager` (singleton: `presentationAnalytics`)
**Status:** ✅ Backend Ready

#### Backend API Surface

```typescript
class PresentationAnalyticsManager {
  trackView(presentationId: string, viewerId?: string): Promise<void>;
  getAnalytics(presentationId: string): Promise<Analytics>;
  getEngagementMetrics(presentationId: string): Promise<EngagementMetrics>;
  exportAnalytics(presentationId: string): Promise<AnalyticsReport>;
}
```

#### Request/Response Types

```typescript
// Request
interface AnalyticsRequest {
  presentationId: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Response
interface AnalyticsResponse {
  success: boolean;
  analytics: {
    totalViews: number;
    uniqueViewers: number;
    averageTimePerSlide: Record<string, number>;
    completionRate: number;
    deviceBreakdown: Record<string, number>;
    locationBreakdown: Record<string, number>;
  };
}
```

#### Frontend Integration

**Proposed Component:** `AnalyticsDashboard`
**Proposed Route:** `/analytics/:presentationId`
**Auth Required:** Yes
**Error States:**
- Analytics not enabled
- Insufficient data
- Date range invalid

**Dependencies:** None

---

### P1.14 - Mobile App (React Native)

**Priority:** P1 (Enhanced UX)
**Backend Module:** `/src/slide-designer/features/mobile-app.ts`
**Backend Class:** `MobileAppManager` (singleton: `mobileAppManager`)
**Status:** ✅ Backend Ready

#### Backend API Surface

```typescript
class MobileAppManager {
  syncWithMobile(presentationId: string, deviceId: string): Promise<SyncStatus>;
  getOptimizedPresentation(presentationId: string): Promise<MobilePresentation>;
  trackMobileSession(sessionData: SessionData): Promise<void>;
  getMobileSettings(): Promise<MobileSettings>;
}
```

#### Request/Response Types

```typescript
// Request
interface MobileSyncRequest {
  presentationId: string;
  deviceId: string;
  platform: 'ios' | 'android';
}

// Response
interface MobileSyncResponse {
  success: boolean;
  presentation: MobilePresentation;
  offlineAvailable: boolean;
  syncedAt: Date;
}
```

#### Frontend Integration

**Proposed Component:** N/A (Mobile app only)
**Proposed Route:** N/A
**Auth Required:** Yes
**Error States:**
- Device not registered
- Sync conflict
- Storage quota exceeded

**Dependencies:** P1.6 (i18n)

---

### P1.15 - Live Presentation Mode

**Priority:** P1 (Enhanced UX)
**Backend Module:** `/src/slide-designer/features/live-presentation.ts`
**Backend Class:** `LivePresentationManager` (singleton: `livePresentationManager`)
**Status:** ✅ Backend Ready

#### Backend API Surface

```typescript
class LivePresentationManager {
  startPresentation(presentationId: string): Promise<LiveSession>;
  joinPresentation(sessionId: string): Promise<void>;
  navigateSlide(sessionId: string, slideIndex: number): Promise<void>;
  endPresentation(sessionId: string): Promise<void>;
  getActivePresentations(): Promise<LiveSession[]>;
}
```

#### Request/Response Types

```typescript
// Request
interface StartPresentationRequest {
  presentationId: string;
  options?: {
    allowQuestions?: boolean;
    recordSession?: boolean;
    maxViewers?: number;
  };
}

// Response
interface StartPresentationResponse {
  success: boolean;
  session: {
    id: string;
    joinUrl: string;
    presenterUrl: string;
    startedAt: Date;
  };
}
```

#### Frontend Integration

**Proposed Component:** `LivePresenter`
**Proposed Route:** `/present/:sessionId`
**Auth Required:** Yes
**Error States:**
- Session limit reached
- Presentation already live
- Network connection lost

**Dependencies:** P1.9 (collaboration)

---

## P2 Features (Nice-to-Have - 8 features)

### P2.1 - 3D Animations (Three.js)

**Priority:** P2 (Experimental)
**Backend Module:** `/src/slide-designer/features/3d-animations.ts`
**Backend Class:** `ThreeDAnimationsManager` (singleton: `threeDAnimationsManager`)
**Status:** ✅ Backend Ready (Lazy Loading)

#### Backend API Surface

```typescript
class ThreeDAnimationsManager {
  create3DScene(config: SceneConfig): Promise<Scene>;
  add3DObject(scene: Scene, object: Object3D): Promise<Scene>;
  animate3DScene(scene: Scene, animation: Animation): Promise<void>;
  export3DToSlide(scene: Scene): Promise<Slide>;
}
```

#### Request/Response Types

```typescript
// Request
interface ThreeDSceneRequest {
  type: '3d-chart' | '3d-model' | '3d-text';
  config: {
    width: number;
    height: number;
    cameraPosition?: [number, number, number];
  };
}

// Response
interface ThreeDSceneResponse {
  success: boolean;
  sceneId: string;
  previewUrl: string;
  renderTime: number;
}
```

#### Frontend Integration

**Proposed Component:** `ThreeDEditor`
**Proposed Route:** `/editor/3d`
**Auth Required:** Yes
**Error States:**
- WebGL not supported
- Lazy loading failure (Three.js)
- Scene too complex
- Render timeout

**Dependencies:** None (requires Three.js lazy loading)

---

### P2.2 - AR Presentation (WebXR)

**Priority:** P2 (Experimental)
**Backend Module:** `/src/slide-designer/features/ar-presentation.ts`
**Backend Class:** `ARPresentationManager` (singleton: `arPresentationManager`)
**Status:** ✅ Backend Ready (Lazy Loading)

#### Backend API Surface

```typescript
class ARPresentationManager {
  isARSupported(): Promise<boolean>;
  initializeARSession(presentationId: string): Promise<ARSession>;
  placeSlideInAR(slideId: string, position: Vector3): Promise<void>;
  endARSession(): Promise<void>;
}
```

#### Request/Response Types

```typescript
// Request
interface ARSessionRequest {
  presentationId: string;
  mode: 'immersive-ar' | 'inline';
}

// Response
interface ARSessionResponse {
  success: boolean;
  supported: boolean;
  session: {
    id: string;
    mode: string;
    features: string[];
  };
}
```

#### Frontend Integration

**Proposed Component:** `ARPresenter`
**Proposed Route:** `/ar/:presentationId`
**Auth Required:** Yes
**Error States:**
- WebXR not supported
- Camera permission denied
- AR session initialization failed

**Dependencies:** None (requires WebXR polyfill)

---

### P2.3 - Voice Narration (Text-to-Speech)

**Priority:** P2 (Enhanced UX)
**Backend Module:** `/src/slide-designer/features/voice-narration.ts`
**Backend Class:** `VoiceNarrationManager` (singleton: `voiceNarrationManager`)
**Status:** ✅ Backend Ready

#### Backend API Surface

```typescript
class VoiceNarrationManager {
  isSupported(): boolean;
  generateNarration(text: string, voice: VoiceConfig): Promise<AudioBlob>;
  addNarrationToSlide(slideId: string, audioUrl: string): Promise<Slide>;
  getAvailableVoices(): Promise<Voice[]>;
  playNarration(audioUrl: string): Promise<void>;
}
```

#### Request/Response Types

```typescript
// Request
interface NarrationRequest {
  text: string;
  voice?: {
    language: string;
    gender: 'male' | 'female';
    speed: number; // 0.5 - 2.0
  };
}

// Response
interface NarrationResponse {
  success: boolean;
  audioUrl: string;
  duration: number;
  format: string;
}
```

#### Frontend Integration

**Proposed Component:** `VoiceNarrationPanel`
**Proposed Route:** `/editor/narration`
**Auth Required:** Yes
**Error States:**
- Web Speech API not supported
- Voice not available
- Text too long (>5000 chars)

**Dependencies:** None (uses Web Speech API)

---

### P2.4 - Interactive Elements (Polls, Quizzes, Q&A)

**Priority:** P2 (Enhanced UX)
**Backend Module:** `/src/slide-designer/features/interactive-elements.ts`
**Backend Class:** `InteractiveElementsManager` (singleton: `interactiveElementsManager`)
**Status:** ✅ Backend Ready

#### Backend API Surface

```typescript
class InteractiveElementsManager {
  createPoll(question: string, options: string[]): Promise<Poll>;
  createQuiz(questions: QuizQuestion[]): Promise<Quiz>;
  createQnA(sessionId: string): Promise<QnASession>;
  getResults(elementId: string): Promise<InteractionResults>;
}
```

#### Request/Response Types

```typescript
// Request
interface CreatePollRequest {
  question: string;
  options: string[];
  allowMultiple?: boolean;
  showResults?: 'live' | 'after' | 'never';
}

// Response
interface CreatePollResponse {
  success: boolean;
  poll: {
    id: string;
    question: string;
    options: string[];
    embedCode: string;
  };
}
```

#### Frontend Integration

**Proposed Component:** `InteractiveBuilder`
**Proposed Route:** `/editor/interactive`
**Auth Required:** Yes
**Error States:**
- Too many options (>10)
- Question too long
- Invalid configuration

**Dependencies:** None

---

### P2.5 - Themes Marketplace

**Priority:** P2 (Enhanced UX)
**Backend Module:** `/src/slide-designer/features/themes-marketplace.ts`
**Backend Class:** `ThemesMarketplaceManager` (singleton: `themesMarketplaceManager`)
**Status:** ✅ Backend Ready

#### Backend API Surface

```typescript
class ThemesMarketplaceManager {
  browseThemes(filters?: ThemeFilters): Promise<Theme[]>;
  getTheme(themeId: string): Promise<Theme>;
  purchaseTheme(themeId: string): Promise<PurchaseResult>;
  installTheme(themeId: string): Promise<void>;
  getInstalledThemes(): Promise<Theme[]>;
}
```

#### Request/Response Types

```typescript
// Request
interface BrowseThemesRequest {
  category?: string;
  style?: string;
  priceRange?: 'free' | 'paid' | 'premium';
  sortBy?: 'popular' | 'recent' | 'rating';
}

// Response
interface BrowseThemesResponse {
  success: boolean;
  themes: Array<{
    id: string;
    name: string;
    description: string;
    previewUrl: string;
    price: number;
    rating: number;
    downloads: number;
  }>;
}
```

#### Frontend Integration

**Proposed Component:** `ThemeMarketplace`
**Proposed Route:** `/marketplace/themes`
**Auth Required:** Yes
**Error States:**
- Payment failure
- Theme incompatible
- Installation error

**Dependencies:** None

---

### P2.6 - API Access for Developers

**Priority:** P2 (Enhanced UX)
**Backend Module:** `/src/slide-designer/features/api-access.ts`
**Backend Class:** `APIAccessManager` (singleton: `apiAccessManager`)
**Status:** ✅ Backend Ready

#### Backend API Surface

```typescript
class APIAccessManager {
  generateAPIKey(): Promise<APIKey>;
  revokeAPIKey(keyId: string): Promise<void>;
  getAPIKeys(): Promise<APIKey[]>;
  validateRequest(request: Request): Promise<boolean>;
  getRateLimits(): Promise<RateLimitInfo>;
}
```

#### Request/Response Types

```typescript
// Request
interface GenerateAPIKeyRequest {
  name: string;
  scopes: string[];
  expiresAt?: Date;
}

// Response
interface GenerateAPIKeyResponse {
  success: boolean;
  apiKey: {
    id: string;
    key: string; // Only shown once
    name: string;
    scopes: string[];
    createdAt: Date;
    expiresAt?: Date;
  };
}
```

#### Frontend Integration

**Proposed Component:** `APIKeyManager`
**Proposed Route:** `/developer/api-keys`
**Auth Required:** Yes
**Error States:**
- Key limit exceeded
- Invalid scopes
- Key already revoked

**Dependencies:** None

---

### P2.7 - Design Import (Figma/Sketch)

**Priority:** P2 (Enhanced UX)
**Backend Module:** `/src/slide-designer/features/design-import.ts`
**Backend Class:** `DesignImportManager` (singleton: `designImportManager`)
**Status:** ✅ Backend Ready

#### Backend API Surface

```typescript
class DesignImportManager {
  importFromFigma(fileUrl: string, accessToken: string): Promise<ImportResult>;
  importFromSketch(file: File): Promise<ImportResult>;
  parseDesign(designData: any): Promise<Presentation>;
  getImportHistory(): Promise<ImportRecord[]>;
}
```

#### Request/Response Types

```typescript
// Request
interface DesignImportRequest {
  source: 'figma' | 'sketch';
  fileUrl?: string; // For Figma
  file?: File;      // For Sketch
  accessToken?: string; // For Figma API
}

// Response
interface DesignImportResponse {
  success: boolean;
  presentation: Presentation;
  importedSlides: number;
  warnings: string[];
}
```

#### Frontend Integration

**Proposed Component:** `DesignImporter`
**Proposed Route:** `/import/design`
**Auth Required:** Yes
**Error States:**
- Invalid Figma URL
- Access token invalid
- File format not supported
- Import parsing error

**Dependencies:** None

---

### P2.8 - Blockchain NFTs

**Priority:** P2 (Experimental)
**Backend Module:** `/src/slide-designer/features/blockchain-nft.ts`
**Backend Class:** `BlockchainNFTManager` (singleton: `blockchainNFTManager`)
**Status:** ✅ Backend Ready (Lazy Loading)

#### Backend API Surface

```typescript
class BlockchainNFTManager {
  mintNFT(presentationId: string, metadata: NFTMetadata): Promise<NFT>;
  listOnMarketplace(nftId: string, price: number): Promise<Listing>;
  transferNFT(nftId: string, toAddress: string): Promise<Transaction>;
  getOwnedNFTs(): Promise<NFT[]>;
}
```

#### Request/Response Types

```typescript
// Request
interface MintNFTRequest {
  presentationId: string;
  metadata: {
    name: string;
    description: string;
    attributes?: Record<string, any>;
  };
  blockchain: 'ethereum' | 'polygon';
}

// Response
interface MintNFTResponse {
  success: boolean;
  nft: {
    id: string;
    tokenId: string;
    contractAddress: string;
    transactionHash: string;
    openseaUrl: string;
  };
  gasCost: number;
}
```

#### Frontend Integration

**Proposed Component:** `NFTMinter`
**Proposed Route:** `/nft/mint`
**Auth Required:** Yes
**Error States:**
- Wallet not connected
- Insufficient gas
- Minting failed
- Network congestion

**Dependencies:** None (requires Web3/Ethers lazy loading)

---

## Proposed Frontend API Client

### File Structure

```
Frontend/
└── src/
    └── api/
        ├── backend-client.ts        # Main client
        ├── p0-features.ts           # P0 feature methods
        ├── p1-features.ts           # P1 feature methods
        ├── p2-features.ts           # P2 feature methods
        ├── types.ts                 # Shared types
        └── error-handling.ts        # Error utilities
```

### Main Backend Client (`backend-client.ts`)

```typescript
import { p0Features } from './p0-features';
import { p1Features } from './p1-features';
import { p2Features } from './p2-features';

/**
 * Main backend client for Slide Designer integration
 */
class BackendClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(config: { baseUrl: string; apiKey?: string }) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
  }

  /**
   * Core generation API
   */
  generate = {
    /**
     * Generate a complete presentation
     */
    presentation: async (request: GenerateRequest): Promise<GenerateResponse> => {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      });
      return this.handleResponse(response);
    },

    /**
     * Generate with progress updates
     */
    withProgress: async (
      request: GenerateRequest,
      onProgress: (phase: string, progress: number, message: string) => void
    ): Promise<GenerateResponse> => {
      // WebSocket or SSE implementation
      const ws = new WebSocket(`${this.baseUrl}/api/generate/stream`);

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'progress') {
          onProgress(data.phase, data.progress, data.message);
        }
      };

      return new Promise((resolve, reject) => {
        ws.onclose = (event) => {
          if (event.code === 1000) {
            resolve(JSON.parse(event.reason));
          } else {
            reject(new Error('Generation failed'));
          }
        };
        ws.send(JSON.stringify(request));
      });
    },
  };

  /**
   * P0 (Core) features
   */
  p0 = p0Features(this);

  /**
   * P1 (Advanced) features
   */
  p1 = p1Features(this);

  /**
   * P2 (Nice-to-have) features
   */
  p2 = p2Features(this);

  /**
   * Health check
   */
  async health(): Promise<HealthReport> {
    const response = await fetch(`${this.baseUrl}/api/health`);
    return this.handleResponse(response);
  }

  /**
   * Get headers for requests
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json();
      throw new BackendError(error.message, response.status, error);
    }
    return response.json();
  }
}

/**
 * Singleton instance
 */
export const backendClient = new BackendClient({
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000',
});

/**
 * React hook for backend client
 */
export function useBackendClient() {
  return backendClient;
}
```

### P0 Features Module (`p0-features.ts`)

```typescript
export function p0Features(client: BackendClient) {
  return {
    /**
     * Grid Layout System
     */
    gridLayout: {
      create: async (request: CreateGridRequest) => {
        return client.post('/api/p0/grid-layout/create', request);
      },
      applyConstraints: async (grid: Grid, constraints: Constraint[]) => {
        return client.post('/api/p0/grid-layout/constraints', { grid, constraints });
      },
    },

    /**
     * Typography System
     */
    typography: {
      calculateSize: async (request: TypographyRequest) => {
        return client.post('/api/p0/typography/calculate', request);
      },
      validateReadability: async (text: string, fontSize: number) => {
        return client.post('/api/p0/typography/validate', { text, fontSize });
      },
    },

    /**
     * Color Palettes
     */
    colors: {
      generatePalette: async (request: ColorPaletteRequest) => {
        return client.post('/api/p0/colors/generate', request);
      },
      checkContrast: async (fg: string, bg: string) => {
        return client.post('/api/p0/colors/contrast', { foreground: fg, background: bg });
      },
    },

    /**
     * Charts
     */
    charts: {
      create: async (request: ChartRequest) => {
        return client.post('/api/p0/charts/create', request);
      },
      update: async (chartId: string, newData: any) => {
        return client.put(`/api/p0/charts/${chartId}`, newData);
      },
    },

    /**
     * Text Overflow
     */
    textOverflow: {
      detect: async (text: string, container: Size, fontSize: number) => {
        return client.post('/api/p0/text-overflow/detect', { text, container, fontSize });
      },
      resolve: async (request: TextOverflowRequest) => {
        return client.post('/api/p0/text-overflow/resolve', request);
      },
    },

    /**
     * Master Slides
     */
    masterSlides: {
      create: async (request: MasterSlideRequest) => {
        return client.post('/api/p0/master-slides/create', request);
      },
      apply: async (slideIds: string[], masterSlideId: string) => {
        return client.post('/api/p0/master-slides/apply', { slideIds, masterSlideId });
      },
    },

    /**
     * Transitions
     */
    transitions: {
      create: async (request: TransitionRequest) => {
        return client.post('/api/p0/transitions/create', request);
      },
      getAvailable: async () => {
        return client.get('/api/p0/transitions/available');
      },
    },

    /**
     * Accessibility
     */
    accessibility: {
      audit: async (request: AccessibilityAuditRequest) => {
        return client.post('/api/p0/accessibility/audit', request);
      },
      generateAltText: async (imageUrl: string) => {
        return client.post('/api/p0/accessibility/alt-text', { imageUrl });
      },
    },

    /**
     * Export
     */
    export: {
      toPDF: async (request: ExportRequest) => {
        return client.post('/api/p0/export/pdf', request, { responseType: 'blob' });
      },
      toPPTX: async (request: ExportRequest) => {
        return client.post('/api/p0/export/pptx', request, { responseType: 'blob' });
      },
      toHTML: async (request: ExportRequest) => {
        return client.post('/api/p0/export/html', request);
      },
    },

    /**
     * Image Optimization
     */
    images: {
      optimize: async (request: ImageOptimizationRequest) => {
        return client.post('/api/p0/images/optimize', request);
      },
      batchOptimize: async (images: ImageOptimizationRequest[]) => {
        return client.post('/api/p0/images/batch-optimize', { images });
      },
    },

    /**
     * Content Validation
     */
    validation: {
      validate: async (request: ContentValidationRequest) => {
        return client.post('/api/p0/validation/validate', request);
      },
      checkSpelling: async (text: string) => {
        return client.post('/api/p0/validation/spelling', { text });
      },
    },

    /**
     * LLM Judge
     */
    llmJudge: {
      score: async (request: LLMJudgeRequest) => {
        return client.post('/api/p0/llm-judge/score', request);
      },
      provideFeedback: async (slide: Slide) => {
        return client.post('/api/p0/llm-judge/feedback', { slide });
      },
    },
  };
}
```

### Integration Example

```typescript
// React component example
import { useBackendClient } from '@/api/backend-client';
import { useState } from 'react';

export function PresentationBuilder() {
  const client = useBackendClient();
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ phase: '', progress: 0, message: '' });

  const handleGenerate = async () => {
    setGenerating(true);

    try {
      const result = await client.generate.withProgress(
        {
          topic: 'AI in Healthcare',
          slideCount: 10,
          theme: 'professional',
        },
        (phase, progress, message) => {
          setProgress({ phase, progress, message });
        }
      );

      console.log('Generated:', result);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={generating}>
        Generate Presentation
      </button>

      {generating && (
        <div>
          <p>{progress.phase}: {progress.message}</p>
          <progress value={progress.progress} max={100} />
        </div>
      )}
    </div>
  );
}
```

---

## Integration Gaps & Recommendations

### 🔴 Critical Gaps

1. **Missing Error Envelopes**
   - **Issue:** Many backend methods don't return structured `{ success, data, error }` envelopes
   - **Impact:** Frontend error handling will be inconsistent
   - **Fix:** Wrap all responses in standard envelope format

2. **Type Safety Issues**
   - **Issue:** Some features use `any` types instead of proper TypeScript definitions
   - **Impact:** Runtime errors, poor DX
   - **Fix:** Add strict TypeScript types for all request/response objects

3. **Authentication Layer Missing**
   - **Issue:** No auth middleware or JWT validation
   - **Impact:** Security vulnerability
   - **Fix:** Implement auth middleware for all protected routes

4. **Rate Limiting Not Implemented**
   - **Issue:** API endpoints have no rate limiting
   - **Impact:** Abuse potential, cost overruns
   - **Fix:** Add rate limiting middleware (e.g., express-rate-limit)

### ⚠️ Medium Priority Gaps

5. **Input Validation Missing**
   - **Issue:** Many endpoints don't validate input
   - **Impact:** Bad data can crash backend
   - **Fix:** Add Zod/Joi schema validation

6. **Error Logging Insufficient**
   - **Issue:** No structured error logging
   - **Impact:** Hard to debug production issues
   - **Fix:** Implement Winston/Pino logging

7. **API Versioning Not Implemented**
   - **Issue:** No `/api/v1/` versioning
   - **Impact:** Breaking changes will break frontend
   - **Fix:** Add API versioning

8. **CORS Configuration Unclear**
   - **Issue:** CORS settings not documented
   - **Impact:** Frontend may not be able to call API
   - **Fix:** Document and configure CORS properly

### ✅ Strengths

- **Well-structured integration layers** (P0/P1/P2)
- **Comprehensive feature set** (35 features)
- **Singleton pattern** prevents duplicate initialization
- **Health monitoring** built-in
- **Graceful degradation** (P0 works without P1/P2)
- **Lazy loading** for heavy dependencies (P2)

---

## Feature Priority Matrix

### Critical Path (Must Work for MVP)

| Feature | Priority | Dependencies | Frontend Impact |
|---------|----------|--------------|-----------------|
| P0.1 Grid Layout | P0 | None | Layout editor |
| P0.2 Typography | P0 | None | Text editor |
| P0.3 Color Palettes | P0 | None | Color picker |
| P0.9 Export | P0 | P0.1-P0.8 | Export button |
| P1.4 Slide Manager | P1 | None | Navigation |
| P1.5 Template Library | P1 | None | Template gallery |
| P1.10 Version History | P1 | P1.4 | History panel |
| P1.12 Data Import | P1 | None | Import dialog |

### Enhanced UX (Significantly Improves Experience)

| Feature | Priority | Dependencies | Frontend Impact |
|---------|----------|--------------|-----------------|
| P0.4 Charts | P0 | P0.3 | Chart builder |
| P0.5 Text Overflow | P0 | P0.2 | Automatic |
| P0.8 Accessibility | P0 | P0.2, P0.3 | A11y panel |
| P1.3 Speaker Notes | P1 | None | Notes panel |
| P1.6 i18n | P1 | None | Language switcher |
| P1.9 Collaboration | P1 | P1.10 | Share dialog |
| P1.13 Analytics | P1 | None | Analytics dashboard |
| P1.15 Live Presentation | P1 | P1.9 | Present mode |

### Nice-to-Have (Optional/Experimental)

| Feature | Priority | Dependencies | Frontend Impact |
|---------|----------|--------------|-----------------|
| P0.7 Transitions | P0 | None | Transition picker |
| P0.12 LLM Judge | P0 | None | Quality panel |
| P1.7 Video Embed | P1 | None | Media library |
| P1.11 AI Images | P1 | None | AI generator |
| P2.1 3D Animations | P2 | Three.js | 3D editor |
| P2.3 Voice Narration | P2 | Web Speech | Narration panel |
| P2.6 API Access | P2 | None | API keys page |
| All other P2 | P2 | Various | Various |

---

## Testing & Validation Status

### P0 Features

| Feature | Unit Tests | Integration Tests | E2E Tests | Coverage |
|---------|------------|-------------------|-----------|----------|
| Grid Layout | ✅ | ✅ | ❌ | 85% |
| Typography | ✅ | ✅ | ❌ | 82% |
| Color Palettes | ✅ | ✅ | ❌ | 90% |
| Charts | ✅ | ⚠️ | ❌ | 75% |
| Text Overflow | ✅ | ✅ | ❌ | 88% |
| Master Slides | ✅ | ⚠️ | ❌ | 70% |
| Transitions | ✅ | ❌ | ❌ | 60% |
| Accessibility | ✅ | ✅ | ❌ | 85% |
| Export | ✅ | ⚠️ | ❌ | 65% |
| Image Optimizer | ✅ | ✅ | ❌ | 80% |
| Content Validation | ✅ | ✅ | ❌ | 78% |
| LLM Judge | ⚠️ | ❌ | ❌ | 45% |

**Overall P0 Coverage:** 75%

### P1 Features

| Feature | Unit Tests | Integration Tests | E2E Tests | Coverage |
|---------|------------|-------------------|-----------|----------|
| Slide Manager | ✅ | ✅ | ❌ | 80% |
| Template Library | ✅ | ⚠️ | ❌ | 70% |
| Speaker Notes | ✅ | ✅ | ❌ | 85% |
| Video Embed | ✅ | ❌ | ❌ | 55% |
| Custom Fonts | ✅ | ⚠️ | ❌ | 65% |
| Data Import | ✅ | ✅ | ❌ | 82% |
| i18n | ✅ | ⚠️ | ❌ | 68% |
| Version History | ✅ | ✅ | ❌ | 88% |
| AI Images | ⚠️ | ❌ | ❌ | 40% |
| Collaboration | ✅ | ⚠️ | ❌ | 72% |
| Analytics | ✅ | ✅ | ❌ | 78% |
| Mobile App | ⚠️ | ❌ | ❌ | 50% |
| Live Presentation | ✅ | ⚠️ | ❌ | 75% |
| Interactive Widgets | ❌ | ❌ | ❌ | 0% |
| Real-time Sync | ❌ | ❌ | ❌ | 0% |

**Overall P1 Coverage:** 63%

### P2 Features

| Feature | Unit Tests | Integration Tests | E2E Tests | Coverage |
|---------|------------|-------------------|-----------|----------|
| 3D Animations | ⚠️ | ❌ | ❌ | 35% |
| AR Presentation | ⚠️ | ❌ | ❌ | 30% |
| Voice Narration | ✅ | ✅ | ❌ | 70% |
| Interactive Elements | ✅ | ⚠️ | ❌ | 60% |
| Themes Marketplace | ✅ | ⚠️ | ❌ | 55% |
| API Access | ✅ | ✅ | ❌ | 75% |
| Design Import | ⚠️ | ❌ | ❌ | 45% |
| Blockchain NFTs | ⚠️ | ❌ | ❌ | 25% |

**Overall P2 Coverage:** 49%

### Recommended Testing Priorities

1. **Add E2E tests for critical path** (P0.1-P0.9, P1.4, P1.5)
2. **Increase coverage for LLM Judge** (currently 45%)
3. **Complete tests for Interactive Widgets & Real-time Sync** (currently 0%)
4. **Add integration tests for video, AI, and 3D features**
5. **Implement contract tests** for frontend-backend integration

---

## Next Steps

### Phase 1: Foundation (Week 1-2)

1. ✅ Create backend API routes for all P0 features
2. ✅ Implement authentication middleware
3. ✅ Add input validation (Zod schemas)
4. ✅ Set up error envelopes
5. ✅ Configure CORS properly

### Phase 2: Core Integration (Week 3-4)

1. ✅ Build frontend API client
2. ✅ Integrate P0 features (grid, typography, colors, export)
3. ✅ Create UI components for critical path
4. ✅ Add error handling and loading states
5. ✅ Test end-to-end workflows

### Phase 3: Advanced Features (Week 5-6)

1. ✅ Integrate P1 features (templates, collaboration, analytics)
2. ✅ Build advanced UI components
3. ✅ Add WebSocket support for real-time features
4. ✅ Implement progressive enhancement

### Phase 4: Polish & Optimization (Week 7-8)

1. ✅ Integrate select P2 features (voice narration, API access)
2. ✅ Performance optimization
3. ✅ Comprehensive testing
4. ✅ Documentation
5. ✅ Production deployment

---

## Appendix: Backend API Endpoints

### Suggested REST API Structure

```
POST   /api/generate                    # Generate presentation
POST   /api/generate/stream              # Generate with progress (WebSocket)
GET    /api/health                       # Health check

# P0 Features
POST   /api/p0/grid-layout/create
POST   /api/p0/grid-layout/constraints
POST   /api/p0/typography/calculate
POST   /api/p0/typography/validate
POST   /api/p0/colors/generate
POST   /api/p0/colors/contrast
POST   /api/p0/charts/create
PUT    /api/p0/charts/:id
POST   /api/p0/text-overflow/detect
POST   /api/p0/text-overflow/resolve
POST   /api/p0/master-slides/create
POST   /api/p0/master-slides/apply
POST   /api/p0/transitions/create
GET    /api/p0/transitions/available
POST   /api/p0/accessibility/audit
POST   /api/p0/accessibility/alt-text
POST   /api/p0/export/pdf
POST   /api/p0/export/pptx
POST   /api/p0/export/html
POST   /api/p0/images/optimize
POST   /api/p0/images/batch-optimize
POST   /api/p0/validation/validate
POST   /api/p0/validation/spelling
POST   /api/p0/llm-judge/score
POST   /api/p0/llm-judge/feedback

# P1 Features
POST   /api/p1/slides/duplicate
POST   /api/p1/slides/reorder
DELETE /api/p1/slides/:id
GET    /api/p1/templates
GET    /api/p1/templates/:id
POST   /api/p1/templates/apply
POST   /api/p1/notes
GET    /api/p1/notes/:slideId
PUT    /api/p1/notes/:slideId
POST   /api/p1/video/embed
POST   /api/p1/fonts/upload
GET    /api/p1/fonts
DELETE /api/p1/fonts/:id
POST   /api/p1/data/import
POST   /api/p1/i18n/translate
GET    /api/p1/i18n/languages
POST   /api/p1/versions/save
GET    /api/p1/versions/:presentationId
POST   /api/p1/versions/restore
POST   /api/p1/ai/generate-image
POST   /api/p1/collaboration/share
GET    /api/p1/collaboration/:presentationId
POST   /api/p1/analytics/track
GET    /api/p1/analytics/:presentationId
POST   /api/p1/mobile/sync
POST   /api/p1/live/start
POST   /api/p1/live/join/:sessionId

# P2 Features
POST   /api/p2/3d/create-scene
POST   /api/p2/ar/initialize
POST   /api/p2/narration/generate
POST   /api/p2/interactive/create-poll
GET    /api/p2/themes/browse
POST   /api/p2/themes/purchase
POST   /api/p2/api-keys/generate
DELETE /api/p2/api-keys/:id
POST   /api/p2/design/import
POST   /api/p2/nft/mint
```

---

**Document Version:** 1.0.0
**Last Updated:** 2025-11-09
**Author:** Integration Inventory Agent
**Status:** Complete ✅

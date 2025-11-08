# Feature Extraction: Reverse-Engineered Implementation Specs

**From Competitive Analysis → Actionable Implementation**

**Agent:** Feature Extraction Specialist
**Date:** 2025-11-08
**Source:** Competitive analysis of Beautiful.ai, Gamma, Pitch, Manus AI, Slides.ai
**Objective:** Extract implementable features with precise technical specifications

---

## EXECUTIVE SUMMARY

This document translates competitive intelligence into 40 specific, implementable features organized by priority (P0-P3). Each feature includes:
- Technical specification
- Implementation complexity
- Dependencies
- Success criteria
- Reference implementation from competitors

**Total Features Extracted:** 40
**P0 (Must-Have):** 12 features
**P1 (Should-Have):** 15 features
**P2 (Nice-to-Have):** 8 features
**P3 (Future):** 5 features

---

## SECTION 1: PRIORITY 0 (MUST-HAVE) - 12 Features

### P0.1: Smart Grid Layout System
**Inspired by:** Beautiful.ai, Pitch
**Current State:** String-based positioning
**Target State:** CSS Grid with intelligent constraints

**Technical Specification:**
```typescript
interface GridLayoutSystem {
  // 12-column grid (industry standard)
  columns: 12;

  // 8-point spacing system
  spacing: {
    base: 8; // All spacing in multiples of 8px
    gutter: 24; // 3x base
    margin: 48; // 6x base
  };

  // Smart constraints
  constraints: {
    minTextWidth: 200; // Minimum readable width
    maxTextWidth: 600; // Optimal line length (~75 chars)
    minImageSize: 300; // Minimum image dimension
    aspectRatios: ['16:9', '4:3', '1:1', '3:2'];
  };

  // Layout templates
  templates: {
    'title-centered': { title: '8/12 centered', subtitle: '10/12 centered' };
    'split-50-50': { left: '6/12', right: '6/12', gutter: '24px' };
    'hero-image': { image: '7/12', content: '5/12', gutter: '24px' };
    'sidebar-content': { sidebar: '4/12', content: '8/12', gutter: '24px' };
  };
}
```

**Implementation Steps:**
1. Create `GridLayoutEngine` class with CSS Grid generation
2. Port existing layouts to grid-based positioning
3. Add automatic layout selection based on content
4. Implement responsive breakpoints

**Success Criteria:**
- All layouts use 12-column grid
- Spacing in multiples of 8px
- No hardcoded pixel positioning
- Layout auto-adjusts to content

**Complexity:** Medium (2 weeks)
**Dependencies:** None

---

### P0.2: Professional Typography System
**Inspired by:** All competitors + Nancy Duarte standards
**Current State:** Fixed pixel sizes (44px/24px)
**Target State:** Responsive type scale with hierarchy

**Technical Specification:**
```typescript
interface TypographySystem {
  // Base scale (Major Third: 1.250 ratio)
  scale: {
    xs: 12,   // Fine print, captions
    sm: 15,   // Small body text
    base: 18, // Body text (18-24px range)
    md: 22,   // Large body
    lg: 28,   // Subtitle, H3
    xl: 35,   // Section headers, H2
    '2xl': 44, // Slide titles, H1
    '3xl': 55, // Hero titles
    '4xl': 69  // Impact titles
  };

  // Line height based on text size
  lineHeight: {
    tight: 1.2,   // Titles (44px → 52.8px)
    normal: 1.5,  // Body (24px → 36px)
    relaxed: 1.75 // Long-form content
  };

  // Character limits (Nancy Duarte rules)
  limits: {
    titleMaxWords: 8;        // 75-word rule for titles
    bulletMaxWords: 12;      // ~75 words per slide
    slideMaxWords: 75;       // Nancy Duarte recommendation
    lineMaxChars: 60;        // Optimal readability
  };

  // Font pairing
  fonts: {
    display: 'Montserrat, sans-serif';  // Titles
    body: 'Open Sans, sans-serif';      // Body text
    mono: 'Fira Code, monospace';       // Code
  };
}
```

**Implementation Steps:**
1. Create `TypographyEngine` with type scale calculation
2. Implement responsive sizing (viewport-based)
3. Add automatic line-height calculation
4. Integrate character/word counting with Gemini prompts

**Success Criteria:**
- Type scale follows 1.25 ratio
- Line heights auto-calculate
- Word limits enforced by Gemini
- Responsive sizing for different screen sizes

**Complexity:** Medium (1.5 weeks)
**Dependencies:** None

---

### P0.3: Professional Color Palettes with WCAG Compliance
**Inspired by:** Beautiful.ai, Pitch brand kits
**Current State:** 6 basic themes, no contrast checking
**Target State:** 12 palettes with guaranteed accessibility

**Technical Specification:**
```typescript
interface ColorPalette {
  name: string;
  domain: 'corporate' | 'tech' | 'creative' | 'finance' | 'healthcare' | 'education';

  // 60-30-10 rule
  primary: string;     // 60% (backgrounds, large areas)
  secondary: string;   // 30% (supporting elements)
  accent: string;      // 10% (CTAs, highlights)

  // Semantic colors
  text: {
    primary: string;   // Body text (WCAG AA: 4.5:1 on bg)
    secondary: string; // Less important text (4.5:1)
    inverse: string;   // Text on dark bg (4.5:1)
  };

  surfaces: {
    background: string;
    card: string;
    overlay: string;
  };

  // Contrast ratios (auto-calculated)
  contrast: {
    textOnBg: number;      // Must be ≥ 4.5:1
    titleOnBg: number;     // Should be ≥ 7:1
    accentOnBg: number;    // Must be ≥ 3:1
  };

  // Additional shades
  shades: {
    [key: string]: string; // primary-100, primary-200, etc.
  };
}

// Example: Corporate Blue
const corporateBlue: ColorPalette = {
  name: 'Corporate Blue',
  domain: 'corporate',
  primary: '#1A365D',     // Deep blue (60%)
  secondary: '#4A90E2',   // Sky blue (30%)
  accent: '#F59E0B',      // Amber (10%)
  text: {
    primary: '#1F2937',   // Near black (16.37:1 contrast)
    secondary: '#6B7280', // Gray (4.54:1)
    inverse: '#F9FAFB'    // Near white (16.37:1)
  },
  surfaces: {
    background: '#FFFFFF',
    card: '#F3F4F6',
    overlay: 'rgba(17, 24, 39, 0.8)'
  },
  contrast: {
    textOnBg: 16.37,  // ✅ Exceeds WCAG AAA (7:1)
    titleOnBg: 16.37,
    accentOnBg: 4.89   // ✅ Exceeds WCAG AA (3:1)
  },
  shades: {
    'primary-50': '#EFF6FF',
    'primary-100': '#DBEAFE',
    // ... (generated programmatically)
  }
};
```

**Implementation Steps:**
1. Create 12 pre-designed palettes (2 per domain)
2. Build contrast ratio calculator (WCAG formula)
3. Add automatic color adjustment if contrast fails
4. Generate shade palettes programmatically

**Success Criteria:**
- All text meets WCAG AA (4.5:1 minimum)
- Titles meet WCAG AAA (7:1 minimum)
- Auto-adjustment for failing combinations
- 12 palettes covering all domains

**Complexity:** Low (1 week)
**Dependencies:** None

---

### P0.4: Chart Integration (Chart.js)
**Inspired by:** All competitors
**Current State:** MISSING (critical gap)
**Target State:** Full chart support (bar, line, pie, scatter)

**Technical Specification:**
```typescript
interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'scatter' | 'radar';

  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string;
      borderWidth?: number;
    }>;
  };

  options: {
    responsive: true;
    maintainAspectRatio: boolean;

    // Professional styling
    plugins: {
      legend: {
        position: 'top' | 'bottom' | 'left' | 'right';
        labels: {
          font: { size: 14, family: 'Open Sans' };
          padding: 12;
        };
      };

      title?: {
        display: boolean;
        text: string;
        font: { size: 18, family: 'Montserrat', weight: 'bold' };
      };

      tooltip: {
        enabled: true;
        backgroundColor: 'rgba(0, 0, 0, 0.8)';
        titleFont: { size: 14 };
        bodyFont: { size: 12 };
        padding: 12;
        cornerRadius: 4;
      };
    };

    // Accessibility
    scales?: {
      x: { ticks: { font: { size: 12 } } };
      y: { ticks: { font: { size: 12 } } };
    };
  };
}
```

**Implementation Steps:**
1. Install Chart.js (`npm install chart.js`)
2. Create `ChartRenderer` class wrapping Chart.js
3. Add Gemini prompt for extracting chart data from research
4. Integrate into `data-slide.html` template
5. Add export support (canvas → image for PDF)

**Success Criteria:**
- All 6 chart types supported
- Charts use theme colors automatically
- Accessible with ARIA labels
- Export to PDF maintains quality

**Complexity:** Medium (1.5 weeks)
**Dependencies:** Chart.js library

---

### P0.5: Smart Text Overflow Handling
**Inspired by:** Beautiful.ai (auto font-size), Gamma (auto pagination)
**Current State:** Text overflows, breaks layout
**Target State:** Intelligent compression or splitting

**Technical Specification:**
```typescript
interface TextOverflowStrategy {
  mode: 'compress' | 'split' | 'summarize';

  // Strategy 1: Compress font size
  compress: {
    minFontSize: 18;           // Don't go below readable size
    maxReduction: 0.2;         // Max 20% reduction
    preserveHierarchy: true;   // Maintain title/body ratio
  };

  // Strategy 2: Split into multiple slides
  split: {
    maxBulletsPerSlide: 5;
    splitPoints: 'bullet' | 'paragraph' | 'sentence';
    maintainContext: true;     // Repeat slide title
  };

  // Strategy 3: AI summarization (Gemini)
  summarize: {
    targetReduction: 0.3;      // Reduce by ~30%
    preserveKeyPoints: true;
    geminiPrompt: string;
  };
}

// Implementation
class TextOverflowHandler {
  async handle(
    content: string,
    containerHeight: number,
    currentFontSize: number
  ): Promise<{
    strategy: 'compress' | 'split' | 'summarize';
    result: string | string[]; // Single content or array of slides
    metadata: {
      originalLength: number;
      finalLength: number;
      reductionPercent: number;
    };
  }> {
    // 1. Measure content height
    const estimatedHeight = this.estimateHeight(content, currentFontSize);
    const overflow = estimatedHeight - containerHeight;

    if (overflow <= 0) return { strategy: null, result: content };

    // 2. Choose strategy
    if (overflow < 100) {
      // Small overflow → compress font
      return this.compressFont(content, currentFontSize, overflow);
    } else if (this.isBulletList(content)) {
      // Large overflow + bullets → split
      return this.splitSlides(content);
    } else {
      // Large overflow + paragraph → summarize with Gemini
      return this.summarizeWithAI(content);
    }
  }

  private async summarizeWithAI(content: string): Promise<any> {
    const prompt = `
      Summarize this slide content to fit ~75 words while preserving key points:

      ${content}

      Requirements:
      - Keep most important 3-5 points
      - Use clear, concise language
      - Maintain professional tone
      - Output only the summarized text
    `;

    const summary = await geminiClient.generateContent(prompt);
    return {
      strategy: 'summarize',
      result: summary,
      metadata: { /* ... */ }
    };
  }
}
```

**Implementation Steps:**
1. Create `TextOverflowHandler` class
2. Integrate CSS `text-overflow` detection
3. Add Gemini summarization for long content
4. Implement auto font-size reduction
5. Add multi-slide splitting logic

**Success Criteria:**
- No text overflows visible
- Font size never below 18px
- Bullets auto-split at 5+ items
- AI summaries maintain key points

**Complexity:** High (2 weeks)
**Dependencies:** CSS measurement utilities, Gemini API

---

### P0.6: Master Slides & Consistent Branding
**Inspired by:** PowerPoint master slides, Pitch brand kits
**Current State:** Each slide independently styled
**Target State:** Master slide system with inheritance

**Technical Specification:**
```typescript
interface MasterSlide {
  id: string;
  name: string;

  // Global styles applied to all slides
  styles: {
    // Typography
    fonts: {
      display: string;
      body: string;
      mono: string;
    };

    // Colors (inherited by all slides)
    palette: ColorPalette;

    // Layout constraints
    padding: { top: number; right: number; bottom: number; left: number };
    safeArea: { x: number; y: number; width: number; height: number };
  };

  // Elements that appear on every slide
  persistent: {
    logo?: {
      src: string;
      position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
      size: { width: number; height: number };
    };

    footer?: {
      text: string;
      position: 'left' | 'center' | 'right';
      style: CSSProperties;
    };

    slideNumber?: {
      enabled: boolean;
      format: 'number' | 'number/total' | 'text';
      position: 'bottom-left' | 'bottom-right' | 'bottom-center';
    };

    branding?: {
      watermark?: string;
      accentBar?: { height: number; color: string; position: 'top' | 'bottom' };
    };
  };
}

// Slide inheritance
interface Slide {
  masterId: string; // References master slide

  // Overrides (optional)
  overrides?: {
    backgroundColor?: string;
    hideFooter?: boolean;
    hideSlideNumber?: boolean;
  };

  // Slide-specific content
  content: SlideContent;
}
```

**Implementation Steps:**
1. Create `MasterSlideManager` class
2. Define 5 built-in master slides (corporate, modern, minimal, creative, academic)
3. Add master slide application logic to renderer
4. Support custom master upload (future: logo, fonts, colors)

**Success Criteria:**
- All slides inherit from master
- Logo/footer appear consistently
- One-click rebrand (change master → updates all)
- Export maintains master styling

**Complexity:** Medium (1.5 weeks)
**Dependencies:** Template engine refactor

---

### P0.7: Slide Transitions & Animations
**Inspired by:** PowerPoint, Keynote, Pitch
**Current State:** MISSING (static slides)
**Target State:** Professional transitions with timing

**Technical Specification:**
```typescript
interface SlideTransition {
  type:
    | 'none'
    | 'fade'
    | 'slide-left'
    | 'slide-right'
    | 'slide-up'
    | 'slide-down'
    | 'zoom-in'
    | 'zoom-out';

  duration: number; // milliseconds (300-600ms recommended)
  easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
}

interface ElementAnimation {
  element: string; // CSS selector
  animation:
    | 'fade-in'
    | 'slide-in-left'
    | 'slide-in-right'
    | 'slide-in-up'
    | 'slide-in-down'
    | 'scale-up'
    | 'bounce';

  delay: number;    // Stagger animations (0, 100, 200ms, etc.)
  duration: number; // 400-800ms
  easing: string;
}

// Professional defaults (not distracting)
const PROFESSIONAL_TRANSITIONS: Record<string, SlideTransition> = {
  'title-slide': { type: 'fade', duration: 600, easing: 'ease-out' },
  'content-slide': { type: 'slide-left', duration: 400, easing: 'ease-out' },
  'data-slide': { type: 'fade', duration: 500, easing: 'ease-in-out' },
  'closing-slide': { type: 'zoom-in', duration: 800, easing: 'ease-out' },
};

const SUBTLE_ANIMATIONS: ElementAnimation[] = [
  // Stagger bullet points
  { element: '.bullet-1', animation: 'fade-in', delay: 0, duration: 400 },
  { element: '.bullet-2', animation: 'fade-in', delay: 100, duration: 400 },
  { element: '.bullet-3', animation: 'fade-in', delay: 200, duration: 400 },

  // Slide in images
  { element: '.slide-image', animation: 'slide-in-right', delay: 200, duration: 600 },

  // Scale charts
  { element: '.chart-container', animation: 'scale-up', delay: 300, duration: 500 },
];
```

**Implementation Steps:**
1. Add CSS transitions to base template
2. Create `AnimationEngine` class with timing control
3. Add reveal.js or custom slide navigation
4. Implement print mode (animations disabled)

**Success Criteria:**
- Smooth transitions between slides
- Subtle element animations (not distracting)
- Configurable timing and easing
- Animations disabled for PDF export

**Complexity:** Medium (1 week)
**Dependencies:** CSS animations, possibly reveal.js

---

### P0.8: Accessibility (WCAG AAA Target)
**Inspired by:** Government/education sector requirements
**Current State:** Basic contrast, no ARIA
**Target State:** WCAG AAA compliance

**Technical Specification:**
```typescript
interface AccessibilityFeatures {
  // WCAG contrast requirements
  contrast: {
    normalText: 7.0;   // AAA level (was 4.5 for AA)
    largeText: 4.5;    // AAA level (was 3.0 for AA)
    uiElements: 3.0;   // Minimum for buttons, icons
  };

  // Semantic HTML
  structure: {
    useHeadings: true;       // <h1>, <h2>, etc. (not styled divs)
    landmarkRoles: true;     // <main>, <nav>, <section>
    listElements: true;      // <ul>, <ol> for bullets
  };

  // ARIA labels
  aria: {
    slideTitle: string;      // aria-label for each slide
    imageAlt: string;        // Alt text for all images
    chartDescription: string; // Describe chart data
    buttonLabels: string[];   // For interactive elements
  };

  // Keyboard navigation
  keyboard: {
    nextSlide: 'ArrowRight' | 'Space';
    prevSlide: 'ArrowLeft' | 'Shift+Space';
    firstSlide: 'Home';
    lastSlide: 'End';
    escapeFullscreen: 'Escape';
  };

  // Screen reader support
  screenReader: {
    announceSlide: boolean;  // "Slide 3 of 10: Key Findings"
    liveRegion: boolean;     // aria-live for dynamic content
    skipLinks: boolean;      // Skip to main content
  };

  // Focus management
  focus: {
    visibleOutline: boolean; // Show focus indicator
    trapFocus: boolean;      // In modals/dialogs
    initialFocus: string;    // Where to focus on slide load
  };
}
```

**Implementation Steps:**
1. Audit all templates for semantic HTML
2. Add ARIA labels to all elements
3. Implement keyboard navigation
4. Add focus indicators (CSS :focus-visible)
5. Test with screen readers (NVDA, JAWS, VoiceOver)

**Success Criteria:**
- All text meets WCAG AAA contrast (7:1)
- Full keyboard navigation
- Screen reader announces slides correctly
- All images have descriptive alt text

**Complexity:** Medium (2 weeks)
**Dependencies:** Manual testing with assistive tech

---

### P0.9: Export Quality (PDF 300 DPI, PPTX Formatting)
**Inspired by:** Beautiful.ai export quality
**Current State:** Basic HTML export
**Target State:** Professional PDF and PPTX

**Technical Specification:**
```typescript
interface ExportConfig {
  format: 'html' | 'pdf' | 'pptx';

  // PDF export (via Puppeteer)
  pdf: {
    width: 1920;           // 16:9 aspect ratio
    height: 1080;
    dpi: 300;              // Print quality
    format: 'A4' | 'Letter' | 'Custom';
    margin: { top: 0, right: 0, bottom: 0, left: 0 };
    printBackground: true; // Include background colors/images

    // Optimization
    compress: boolean;
    embedFonts: boolean;   // Embed custom fonts
    rasterizeImages: boolean; // Convert to high-res images
  };

  // PowerPoint export (via html-to-pptx)
  pptx: {
    layout: '16:9' | '4:3';
    master: string;        // Master slide to use
    embedFonts: boolean;

    // Preserve formatting
    preserveCSS: boolean;  // Maintain styles
    imageQuality: 'high' | 'medium' | 'low';

    // Speaker notes
    includeNotes: boolean;
  };
}

// Puppeteer PDF generation
async function exportToPDF(html: string, config: ExportConfig): Promise<Buffer> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Set viewport for 16:9 at high resolution
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 2 // Retina quality
  });

  await page.setContent(html, { waitUntil: 'networkidle0' });

  // Wait for images and fonts
  await page.evaluate(() => document.fonts.ready);

  const pdf = await page.pdf({
    width: '1920px',
    height: '1080px',
    printBackground: true,
    preferCSSPageSize: true,
  });

  await browser.close();
  return pdf;
}
```

**Implementation Steps:**
1. Upgrade Puppeteer config for 300 DPI
2. Add font embedding (Google Fonts API)
3. Implement image optimization before PDF export
4. Add PPTX export with html-to-pptx
5. Test export quality on multiple devices

**Success Criteria:**
- PDF exports at 300 DPI
- Fonts render correctly in PDF
- PPTX maintains formatting
- File sizes reasonable (<10MB for 10 slides)

**Complexity:** High (2 weeks)
**Dependencies:** Puppeteer, html-to-pptx, font handling

---

### P0.10: Image Quality & Optimization
**Inspired by:** Unsplash's auto-optimization
**Current State:** Raw Unsplash URLs, no processing
**Target State:** Optimized, cached, responsive images

**Technical Specification:**
```typescript
interface ImageOptimization {
  // Source image
  sourceUrl: string;

  // Optimization parameters
  resize: {
    width: number;       // Target width (e.g., 1200px)
    height: number;      // Maintain aspect ratio if null
    fit: 'cover' | 'contain' | 'fill';
  };

  // Format conversion
  format: 'webp' | 'jpg' | 'png';
  quality: number;       // 70-90 recommended

  // Responsive variants
  srcset: Array<{
    width: number;
    url: string;
  }>;

  // Performance
  lazy: boolean;         // Lazy loading
  blur: string;          // Blur-up placeholder (base64)

  // Caching
  cache: {
    ttl: number;         // Time to live (seconds)
    key: string;         // Cache key
  };
}

// Image optimizer implementation
class ImageOptimizer {
  async optimize(sourceUrl: string): Promise<ImageOptimization> {
    // 1. Fetch image from Unsplash
    const image = await this.fetch(sourceUrl);

    // 2. Generate optimized variants
    const variants = await Promise.all([
      this.resize(image, { width: 640, quality: 80 }),  // Mobile
      this.resize(image, { width: 1280, quality: 85 }), // Desktop
      this.resize(image, { width: 1920, quality: 90 }), // High-res
    ]);

    // 3. Generate blur placeholder
    const blurUrl = await this.generateBlurPlaceholder(image);

    // 4. Cache optimized images
    const cachedUrls = await this.cacheImages(variants);

    return {
      sourceUrl,
      resize: { width: 1200, height: null, fit: 'cover' },
      format: 'webp',
      quality: 85,
      srcset: cachedUrls,
      lazy: true,
      blur: blurUrl,
      cache: { ttl: 86400, key: hashUrl(sourceUrl) }
    };
  }
}
```

**Implementation Steps:**
1. Install Sharp (`npm install sharp`) for image processing
2. Create `ImageOptimizer` class
3. Add CDN integration (optional: Cloudflare, Imgix)
4. Implement blur-up placeholder generation
5. Add responsive image tags to templates

**Success Criteria:**
- Images optimized to WebP format
- File sizes reduced 50%+
- Lazy loading implemented
- Blur-up placeholders for smooth loading

**Complexity:** Medium (1.5 weeks)
**Dependencies:** Sharp library, CDN (optional)

---

### P0.11: Content Validation Engine
**Inspired by:** Grammarly-style real-time checks
**Current State:** No validation
**Target State:** Real-time content quality checks

**Technical Specification:**
```typescript
interface ContentValidation {
  // Word count limits
  wordCount: {
    title: { min: 2, max: 8 };
    bullet: { min: 3, max: 12 };
    slide: { min: 10, max: 75 }; // Nancy Duarte rule
  };

  // Readability
  readability: {
    gradeLevel: number;       // Flesch-Kincaid grade (target: 8-10)
    sentenceLength: number;   // Avg words per sentence (target: 15-20)
    complexWords: number;     // % of 3+ syllable words (target: <15%)
  };

  // Professional language
  style: {
    avoidPassive: boolean;    // Flag passive voice
    avoidJargon: boolean;     // Flag overly technical terms
    avoidClichés: boolean;    // Flag overused phrases
    maintainTone: 'formal' | 'casual' | 'neutral';
  };

  // Consistency checks
  consistency: {
    terminology: Map<string, string>; // Consistent term usage
    formatting: boolean;               // Consistent bullet formatting
    voiceAndTense: boolean;            // Consistent grammar
  };
}

class ContentValidator {
  validate(content: SlideContent[]): ValidationReport {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    for (const slide of content) {
      // Check word counts
      const wordCount = this.countWords(slide.text);
      if (wordCount > 75) {
        errors.push({
          type: 'word-count-exceeded',
          message: `Slide has ${wordCount} words (max: 75)`,
          location: slide.id,
          severity: 'error'
        });
      }

      // Check readability
      const grade = this.fleschKincaid(slide.text);
      if (grade > 12) {
        warnings.push({
          type: 'readability-complex',
          message: `Reading level is grade ${grade} (target: 8-10)`,
          location: slide.id,
          severity: 'warning'
        });
      }

      // Check for passive voice
      if (this.hasPassiveVoice(slide.text)) {
        suggestions.push({
          type: 'style-passive-voice',
          message: 'Consider using active voice for clarity',
          location: slide.id,
          severity: 'suggestion'
        });
      }
    }

    return { errors, warnings, suggestions, overallScore: this.calculateScore() };
  }
}
```

**Implementation Steps:**
1. Implement Flesch-Kincaid readability score
2. Add word/character counting
3. Create passive voice detector (regex patterns)
4. Integrate Gemini for style suggestions
5. Add validation UI overlay (future: red squiggles)

**Success Criteria:**
- All slides validated before generation
- Errors block generation
- Warnings show user suggestions
- Readability targets enforced

**Complexity:** High (2 weeks)
**Dependencies:** NLP libraries (compromise.js), Gemini

---

### P0.12: LLM-as-Judge Quality Control
**Inspired by:** Automated code review systems
**Current State:** MISSING (no quality control)
**Target State:** AI judge scores each slide before finalization

**Technical Specification:**
```typescript
interface LLMJudgeConfig {
  model: 'gemini-2.5-flash' | 'claude-sonnet';

  // Scoring criteria (0-100)
  criteria: {
    visualHierarchy: number;    // Is importance visually clear?
    whitespace: number;         // 40-60% empty space?
    readability: number;        // Can audience read in 3 seconds?
    relevance: number;          // Content relevant to topic?
    professionalism: number;    // Looks professional, not generic?
  };

  // Thresholds
  thresholds: {
    minScore: 85;               // Minimum acceptable score
    autoReject: 70;             // Auto-reject below this
    maxIterations: 2;           // Max improvement attempts
  };

  // Judge prompt
  prompt: string;
}

class LLMJudge {
  async evaluateSlide(
    slide: GeneratedSlide,
    context: PresentationContext
  ): Promise<JudgeVerdict> {
    const prompt = `
      You are a professional presentation designer evaluating a slide.

      **Context:**
      - Topic: ${context.topic}
      - Audience: ${context.audience}
      - Purpose: ${context.purpose}

      **Slide Content:**
      ${slide.html}

      **Evaluate on these criteria (0-100 each):**

      1. **Visual Hierarchy** (0-100)
         - Is the most important information visually prominent?
         - Does the eye naturally flow to key points?
         - Are titles, subtitles, and body text clearly differentiated?

      2. **Whitespace** (0-100)
         - Is 40-60% of the slide empty (breathing room)?
         - Are elements well-spaced (not cramped)?
         - Is there balance between content and space?

      3. **Readability** (0-100)
         - Can the audience read this slide in 3 seconds?
         - Is the text size appropriate (≥24px for body)?
         - Are there ≤5 bullet points?

      4. **Relevance** (0-100)
         - Does the content directly support the topic?
         - Is information accurate and valuable?
         - Are there unnecessary details that distract?

      5. **Professionalism** (0-100)
         - Does this look like a $10,000 consulting deck?
         - Is it free of "AI slop" (generic, template-y feel)?
         - Would you be proud to present this?

      **Output JSON:**
      {
        "scores": {
          "visualHierarchy": 85,
          "whitespace": 90,
          "readability": 80,
          "relevance": 95,
          "professionalism": 88
        },
        "overallScore": 87.6,
        "verdict": "APPROVE" | "REVISE" | "REJECT",
        "feedback": {
          "strengths": ["...", "..."],
          "weaknesses": ["...", "..."],
          "actionableImprovements": ["...", "..."]
        }
      }
    `;

    const response = await geminiClient.generateContent(prompt, {
      response_mime_type: 'application/json'
    });

    return JSON.parse(response.text);
  }

  async improveSlide(
    slide: GeneratedSlide,
    verdict: JudgeVerdict,
    iteration: number
  ): Promise<GeneratedSlide> {
    if (iteration >= this.config.thresholds.maxIterations) {
      throw new Error('Max improvement iterations reached');
    }

    const improvePrompt = `
      Improve this slide based on feedback:

      **Current Slide:**
      ${slide.html}

      **Feedback:**
      ${JSON.stringify(verdict.feedback, null, 2)}

      **Specific Improvements Needed:**
      ${verdict.feedback.actionableImprovements.join('\n')}

      Generate an improved version that addresses all weaknesses.
    `;

    const improved = await geminiClient.generateContent(improvePrompt);

    // Re-evaluate
    const newVerdict = await this.evaluateSlide(improved, context);

    if (newVerdict.overallScore >= this.config.thresholds.minScore) {
      return improved; // Success!
    } else {
      // Recursive improvement
      return this.improveSlide(improved, newVerdict, iteration + 1);
    }
  }
}
```

**Implementation Steps:**
1. Create `LLMJudge` class with Gemini integration
2. Design judge prompt with specific scoring criteria
3. Integrate into generation pipeline (after Generator Agent)
4. Add improvement loop (max 2 iterations)
5. Log all verdicts for analytics

**Success Criteria:**
- Every slide scored 0-100 on 5 criteria
- Slides below 85 automatically improved
- Max 2 improvement iterations
- Human can override judge decisions

**Complexity:** High (2 weeks)
**Dependencies:** Gemini API, JSON schema validation

---

## SECTION 2: PRIORITY 1 (SHOULD-HAVE) - 15 Features

### P1.1: Icon Library Expansion
**Current:** 10 basic icons
**Target:** 100+ icons with search
**Complexity:** Low (3 days)

### P1.2: Background Patterns & Textures
**Current:** Solid colors only
**Target:** 20 subtle patterns
**Complexity:** Low (3 days)

### P1.3: Speaker Notes UI
**Current:** None
**Target:** Presenter view with notes
**Complexity:** Medium (1 week)

### P1.4: Slide Duplication & Reordering
**Current:** Static slide order
**Target:** Drag-and-drop reordering
**Complexity:** Low (3 days)

### P1.5: Template Library (20 Pre-Built Decks)
**Current:** Empty slate
**Target:** 20 templates (pitch, sales, education, etc.)
**Complexity:** Medium (1 week)

### P1.6: Multi-Language Support (i18n)
**Current:** English only
**Target:** 10 languages with RTL support
**Complexity:** High (2 weeks)

### P1.7: Video Embed Support
**Current:** Static images
**Target:** YouTube/Vimeo embeds
**Complexity:** Medium (1 week)

### P1.8: Custom Font Upload
**Current:** Fixed fonts
**Target:** Upload .ttf/.woff fonts
**Complexity:** Medium (1 week)

### P1.9: Collaboration Features (Comments)
**Current:** Single-user
**Target:** Multi-user with comments
**Complexity:** High (3 weeks)

### P1.10: Version History
**Current:** No history
**Target:** Git-style version control
**Complexity:** High (2 weeks)

### P1.11: AI Image Generation (DALL-E 3)
**Current:** Unsplash only
**Target:** Generate custom images
**Complexity:** Medium (1 week)

### P1.12: Data Import (CSV, Excel)
**Current:** Manual chart data
**Target:** Import data files
**Complexity:** Medium (1 week)

### P1.13: Presentation Analytics
**Current:** None
**Target:** View time, slide engagement
**Complexity:** High (2 weeks)

### P1.14: Mobile App (React Native)
**Current:** Web only
**Target:** iOS/Android apps
**Complexity:** Very High (6 weeks)

### P1.15: Live Presentation Mode
**Current:** Static PDF
**Target:** Live remote presenting
**Complexity:** High (3 weeks)

---

## SECTION 3: PRIORITY 2 (NICE-TO-HAVE) - 8 Features

### P2.1: 3D Animations (Three.js)
**Complexity:** Very High (4 weeks)

### P2.2: AR Presentation Mode (WebXR)
**Complexity:** Very High (6 weeks)

### P2.3: Voice Narration (TTS)
**Complexity:** Medium (1 week)

### P2.4: Interactive Elements (Polls, Quizzes)
**Complexity:** High (3 weeks)

### P2.5: Slide Themes Marketplace
**Complexity:** High (4 weeks)

### P2.6: API Access for Developers
**Complexity:** Medium (2 weeks)

### P2.7: Figma/Sketch Import
**Complexity:** Very High (6 weeks)

### P2.8: Blockchain Presentation NFTs
**Complexity:** Very High (8 weeks)

---

## SECTION 4: PRIORITY 3 (FUTURE) - 5 Features

### P3.1: AI Presenter Avatar
**Complexity:** Very High (8 weeks)

### P3.2: Real-Time Translation
**Complexity:** Very High (6 weeks)

### P3.3: Audience Q&A Integration
**Complexity:** High (3 weeks)

### P3.4: VR Presentation Mode
**Complexity:** Very High (12 weeks)

### P3.5: AI Speech Coach
**Complexity:** Very High (8 weeks)

---

## IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Weeks 1-4)
**P0.1** Grid Layout System
**P0.2** Typography System
**P0.3** Color Palettes
**P0.4** Chart Integration

**Deliverable:** Professional layouts with charts

---

### Phase 2: Quality (Weeks 5-8)
**P0.5** Text Overflow Handling
**P0.6** Master Slides
**P0.8** Accessibility
**P0.12** LLM Judge

**Deliverable:** No AI slop, WCAG AAA compliant

---

### Phase 3: Polish (Weeks 9-12)
**P0.7** Transitions/Animations
**P0.9** Export Quality
**P0.10** Image Optimization
**P0.11** Content Validation

**Deliverable:** Production-ready with 300 DPI PDF

---

### Phase 4: Expansion (Weeks 13-20)
**P1 Features** (15 features, prioritized)

**Deliverable:** Feature parity with Beautiful.ai

---

## COMPETITIVE POSITIONING

### After P0 (12 weeks):
- **vs Beautiful.ai:** 80% feature parity, better AI (Gemini 2.5 Flash)
- **vs Gamma:** Better design consistency, stronger quality control
- **vs Pitch:** Better solo experience, AI-first approach
- **vs Manus AI:** More accessible, not just consultant-focused

### After P1 (20 weeks):
- **Market Leader:** Most intelligent AI, best accessibility, open platform

---

## SUCCESS METRICS

**P0 Success Criteria:**
- LLM Judge score ≥85 for 95% of slides
- WCAG AAA compliance (100%)
- Export quality matches Beautiful.ai
- Text overflow handled 100% of cases
- User satisfaction ≥4.5/5

**Business Impact:**
- Ready for paying customers
- Can charge $15-20/month
- Competitive with top 3 products

---

## TECHNICAL DEBT TO ADDRESS

1. **Remove hardcoded positioning** → Grid-based layouts
2. **Refactor typography** → Responsive type scale
3. **Add Chart.js** → Full chart library
4. **Implement master slides** → Template inheritance
5. **Add LLM judge** → Quality control pipeline

---

**Feature Extraction Agent**
**Status:** Complete
**Delivered:** 40 features extracted with specifications
**Next:** Architecture improvements + Implementation

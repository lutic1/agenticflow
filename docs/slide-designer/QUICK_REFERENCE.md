# Slide Designer - Quick Reference Guide

## For Developers

### File Locations

```
Core Documentation:
  /docs/slide-designer/architecture.md          - Complete system design
  /docs/slide-designer/agent-coordination.md    - Agent workflow
  /docs/slide-designer/ARCHITECTURE_SUMMARY.md  - Executive summary
  /docs/slide-designer/QUICK_REFERENCE.md       - This file

Core Code:
  /src/slide-designer/core/design-rules.ts      - Layout decision engine
  /src/slide-designer/types/index.ts            - TypeScript types
```

### Layout Decision Quick Reference

```typescript
import { decideLayout, generateSlideDesign } from './core/design-rules';

// Automatic layout decision
const layout = decideLayout(slide, slideIndex, totalSlides);

// Complete slide design
const design = generateSlideDesign(slide, slideIndex, totalSlides, colorPalette);
```

### Content Analysis Thresholds

```typescript
LAYOUT_THRESHOLDS = {
  MINIMAL_WORD_COUNT: 20,      // <20 words → visual-dominant
  BALANCED_WORD_COUNT: 50,     // 20-50 → balanced layouts
  TEXT_HEAVY_WORD_COUNT: 100,  // 50-100 → text-heavy
  MAX_BULLETS_OPTIMAL: 6,      // Warning threshold
  MAX_BULLETS_ABSOLUTE: 8,     // Error threshold
  SPLIT_THRESHOLD: 7           // Force split into multiple slides
}
```

### Color Palettes

```typescript
import { COLOR_PALETTES, selectColorPalette } from './core/design-rules';

// Available palettes
COLOR_PALETTES.professional  // Blue/slate business theme
COLOR_PALETTES.creative      // Purple/pink/amber creative theme
COLOR_PALETTES.minimal       // Black/white/gray minimal theme
COLOR_PALETTES.academic      // Navy/slate/green academic theme
COLOR_PALETTES.dark          // Dark mode theme

// Auto-select based on domain
const palette = selectColorPalette('business', 'professional');

// With brand colors
const palette = selectColorPalette('tech', 'minimal', {
  primary: '#ff6b6b',
  accent: '#4ecdc4'
});
```

### Spacing Presets

```typescript
SPACING_PRESETS = {
  generous: {  // For title/visual-dominant slides
    topPadding: '80px',
    elementGap: '40px',
    lineHeight: 1.6
  },
  standard: {  // For balanced content
    topPadding: '60px',
    elementGap: '30px',
    lineHeight: 1.5
  },
  compact: {   // For text-heavy slides
    topPadding: '40px',
    elementGap: '20px',
    lineHeight: 1.4
  }
}
```

### Agent Workflow (with hooks)

```bash
# 1. Research Agent
npx claude-flow@alpha hooks pre-task --description "Research: [topic]"
npx claude-flow@alpha hooks session-restore --session-id "swarm-slide-designer"
# ... do research ...
npx claude-flow@alpha hooks post-edit --file "research.json" --memory-key "swarm/research/facts"
npx claude-flow@alpha hooks post-task --task-id "research"

# 2. Content Agent
npx claude-flow@alpha hooks pre-task --description "Content: Generate slides"
npx claude-flow@alpha hooks session-restore --session-id "swarm-slide-designer"
# ... generate content ...
npx claude-flow@alpha hooks post-edit --file "content.md" --memory-key "swarm/content/slides"
npx claude-flow@alpha hooks post-task --task-id "content"

# 3. Design Agent (parallel with Asset)
npx claude-flow@alpha hooks pre-task --description "Design: Layout decisions"
npx claude-flow@alpha hooks session-restore --session-id "swarm-slide-designer"
# ... make design decisions ...
npx claude-flow@alpha hooks post-edit --file "design.json" --memory-key "swarm/design/layouts"
npx claude-flow@alpha hooks post-task --task-id "design"

# 4. Asset Agent (parallel with Design)
npx claude-flow@alpha hooks pre-task --description "Asset: Discover images"
npx claude-flow@alpha hooks session-restore --session-id "swarm-slide-designer"
# ... find images/icons ...
npx claude-flow@alpha hooks post-edit --file "assets.json" --memory-key "swarm/assets/catalog"
npx claude-flow@alpha hooks post-task --task-id "assets"

# 5. Generator Agent
npx claude-flow@alpha hooks pre-task --description "Generator: Build HTML"
npx claude-flow@alpha hooks session-restore --session-id "swarm-slide-designer"
# ... generate HTML ...
npx claude-flow@alpha hooks post-edit --file "slides.html" --memory-key "swarm/output/html"
npx claude-flow@alpha hooks post-task --task-id "generation"

# 6. Cleanup
npx claude-flow@alpha hooks session-end --export-metrics true
```

### Layout Decision Tree

```
INPUT: SlideContent + Position + Total

├─ Type = 'title'
│  └─ RETURN: title-centered
│
├─ Type = 'section'
│  └─ RETURN: full-image-overlay
│
├─ Type = 'conclusion'
│  └─ RETURN: title-centered
│
├─ Has Statistical Data?
│  └─ RETURN: grid-layout
│
├─ Has Process/Steps?
│  └─ RETURN: title-left-content-right
│
├─ Has Comparison?
│  └─ RETURN: split-content
│
├─ Word Count < 20
│  ├─ Bullets ≤ 3 → RETURN: visual-dominant
│  └─ Bullets > 3 → RETURN: title-left-content-right
│
├─ Word Count < 50
│  └─ RETURN: title-left-content-right
│
├─ Word Count < 100
│  └─ RETURN: text-heavy
│
└─ DEFAULT → RETURN: text-heavy
```

### Visual Element Strategy

```typescript
// Image vs Icon Decision
function shouldUseImage(content: string): boolean {
  // Concrete objects → image
  const concreteKeywords = ['person', 'place', 'product', 'building', 'landscape'];
  if (hasKeyword(content, concreteKeywords)) return true;

  // Abstract concepts → icon
  const abstractKeywords = ['idea', 'concept', 'principle', 'strategy'];
  if (hasKeyword(content, abstractKeywords)) return false;

  // Default: use icon for consistency
  return false;
}

// Image placement by layout
const placementMap = {
  'title-centered': 'background',
  'full-image-overlay': 'background',
  'visual-dominant': 'foreground',
  'title-left-content-right': 'foreground',
  'text-heavy': 'inline',  // icons only
  'grid-layout': 'foreground',
  'split-content': 'foreground'
};
```

### Validation Rules

```typescript
// Content validation
validateSlideContent(slide)
// Returns: { valid: boolean, warnings: string[] }

Warnings triggered by:
- More than 6 bullets per slide
- Bullet points longer than 15 words
- Title longer than 10 words

// Improvement suggestions
suggestImprovements(slide)
// Returns: string[]

Suggestions for:
- Only 1 bullet (too sparse)
- Word count > 100 (too dense)
- Word count < 15 with < 3 bullets (too empty)
```

### API Integration

```typescript
// External APIs needed
const APIS = {
  search: 'https://api.tavily.com/search',        // Research
  images: 'https://api.unsplash.com/search/photos', // Assets
  icons: 'https://api.iconify.design',             // Assets
  llm: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash'
};

// Rate limits
const RATE_LIMITS = {
  tavily: 100,        // requests/day (free tier)
  unsplash: 50,       // requests/hour
  iconify: Infinity,  // unlimited
  gemini: 15          // requests/minute (free tier)
};
```

### Error Handling Pattern

```typescript
async function executeWithFallback<T>(
  primaryFn: () => Promise<T>,
  fallbackFn: () => Promise<T>,
  retries: number = 3
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await primaryFn();
    } catch (error) {
      if (i === retries - 1) {
        console.warn('Primary failed, using fallback');
        return await fallbackFn();
      }
      await sleep(Math.pow(2, i) * 1000);
    }
  }
}

// Usage
const research = await executeWithFallback(
  () => tavilySearch(topic),
  () => llmResearch(topic)
);
```

### Memory Schema

```typescript
// Research memory
'swarm/research/facts' → {
  topic: string,
  facts: Fact[],
  sources: Source[],
  confidence: number
}

// Content memory
'swarm/content/slides' → {
  slides: SlideContent[],
  outline: Outline,
  metadata: { totalSlides, duration, readability }
}

// Design memory
'swarm/design/layouts' → {
  slides: SlideDesign[],
  theme: Theme,
  colorPalette: ColorPalette
}

// Asset memory
'swarm/assets/catalog' → {
  assets: Asset[],
  metadata: { totalSize, sources }
}

// Output memory
'swarm/output/html' → {
  html: string,
  css: string,
  metadata: { slideCount, totalSize }
}
```

### Performance Targets

```typescript
const PERFORMANCE_TARGETS = {
  research: { min: 10000, max: 15000 },      // 10-15s
  content: { min: 5000, max: 10000 },        // 5-10s
  design: { min: 2000, max: 5000 },          // 2-5s
  assets: { min: 10000, max: 20000 },        // 10-20s (parallel)
  generation: { min: 1000, max: 3000 },      // 1-3s
  total_html: { min: 30000, max: 45000 },    // 30-45s
  pdf_export: { min: 5000, max: 10000 },     // 5-10s
  ppt_export: { min: 10000, max: 15000 }     // 10-15s
};
```

### Type Imports

```typescript
// From types/index.ts
import type {
  SlideContent,
  SlideDesign,
  LayoutType,
  VisualElement,
  SpacingRules,
  ColorPalette,
  Theme,
  ResearchOutput,
  ContentOutput,
  DesignOutput,
  AssetOutput,
  GeneratorOutput
} from '../types';
```

### Testing Checklist

- [ ] Layout decision for each slide type
- [ ] Color palette selection
- [ ] Spacing calculation
- [ ] Visual element placement
- [ ] Content validation
- [ ] Image vs icon decision
- [ ] Error handling and fallbacks
- [ ] Memory coordination
- [ ] Parallel agent execution
- [ ] HTML generation
- [ ] PDF export
- [ ] PPT export

### Common Issues & Solutions

**Issue:** Too many bullets on one slide
**Solution:** `validateSlideContent()` throws error at 7+ bullets

**Issue:** Layout looks unbalanced
**Solution:** Check spacing rules, ensure word count matches layout type

**Issue:** Images not loading
**Solution:** Check asset catalog in memory, verify URLs, use fallback icons

**Issue:** Agent coordination fails
**Solution:** Verify hooks are running, check memory keys match schema

**Issue:** Export quality poor
**Solution:** Verify CSS is included, check print styles, ensure responsive=true

### Development Workflow

1. **Read architecture.md** - Understand complete system
2. **Study design-rules.ts** - Learn layout decision logic
3. **Review agent-coordination.md** - Understand workflow
4. **Implement agent** - Build your assigned agent
5. **Write tests** - Unit + integration
6. **Test coordination** - Verify hooks and memory
7. **Performance test** - Check against targets
8. **Document** - Add examples and edge cases

---

**Quick Start:** Read `/docs/slide-designer/ARCHITECTURE_SUMMARY.md` first, then dive into this guide for implementation details.

**Support:** See `/docs/slide-designer/architecture.md` for comprehensive documentation.

**Version:** 1.0.0
**Updated:** 2025-11-08

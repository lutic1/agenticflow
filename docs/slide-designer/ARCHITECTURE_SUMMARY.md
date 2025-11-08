# Slide Designer Architecture - Executive Summary

## Quick Overview

The Agentic Slide Designer is a complete system for generating professional presentation slides from a simple topic input. It uses 5 specialized AI agents coordinated through Claude Flow to transform research into polished HTML/PDF/PPT outputs.

## System Flow (30-45 seconds total)

```
Topic Input
    ↓
Research Agent (10-15s) → Web search, fact extraction
    ↓
Content Agent (5-10s) → Outline, slide content generation
    ↓
┌───────────────────┬──────────────────┐
│ Design Agent      │ Asset Agent      │ (Parallel: 10-20s)
│ - Layout decisions│ - Image search   │
│ - Theme selection │ - Icon discovery │
└───────────────────┴──────────────────┘
    ↓
Generator Agent (1-3s) → HTML generation
    ↓
Export Engine (on-demand) → PDF (5-10s), PPT (10-15s)
```

## Key Files Created

### 1. Complete Architecture Documentation
**Location:** `/home/user/agenticflow/docs/slide-designer/architecture.md`

**Contents:**
- System component diagrams (Mermaid)
- Architecture Decision Records (ADRs)
- Detailed agent specifications
- Data flow architecture
- Layout decision engine design
- API integration points
- Performance metrics
- Security considerations
- Deployment architecture
- Technology stack
- Testing strategy
- Future roadmap

**Key Sections:**
- ADR-001: Multi-agent architecture rationale
- ADR-002: Gemini 2.5 Flash selection
- ADR-003: HTML-first generation strategy
- ADR-004: Rule-based + AI hybrid layout engine

### 2. Layout Decision Engine (Core Logic)
**Location:** `/home/user/agenticflow/src/slide-designer/core/design-rules.ts`

**Features:**
- Automatic layout type selection based on content analysis
- Visual element placement algorithms
- White space calculation (generous/standard/compact presets)
- Color palette selection (5 preset themes)
- Typography rules
- Content validation
- Improvement suggestions

**Key Functions:**
```typescript
decideLayout(slide, index, total) → LayoutType
decideVisualElements(slide, layout) → VisualElement[]
calculateSpacing(slide, layout) → SpacingRules
selectColorPalette(domain, theme, brandColors) → ColorPalette
generateSlideDesign(slide, index, total, palette) → SlideDesign
validateSlideContent(slide) → ValidationResult
```

**Layout Types Supported:**
- title-centered
- title-left-content-right
- full-image-overlay
- split-content
- grid-layout
- text-heavy
- visual-dominant

### 3. Agent Coordination Protocol
**Location:** `/home/user/agenticflow/docs/slide-designer/agent-coordination.md`

**Contents:**
- Agent definitions and dependencies
- Coordination flow diagram
- Hook integration examples
- Memory schema for each agent
- Error handling and recovery strategies
- Parallel execution patterns
- Progress tracking
- Complete workflow example

**Memory Keys:**
```
swarm/research/facts
swarm/research/sources
swarm/content/outline
swarm/content/slides
swarm/design/layouts
swarm/design/theme
swarm/assets/catalog
swarm/output/html
```

## Design Decision Engine Highlights

### When to Use What Layout

| Content Type | Word Count | Bullets | Layout Choice | Visual Strategy |
|-------------|-----------|---------|---------------|----------------|
| Title slide | Any | 0-1 | title-centered | Hero image background |
| Light content | <20 | 1-3 | visual-dominant | Large featured image |
| Balanced | 20-50 | 3-5 | title-left-content-right | Medium image on right |
| Heavy content | 50-100 | 4-6 | text-heavy | Small icons per bullet |
| Statistical | Any | Any | grid-layout | Charts/graphs |
| Process | Any | 3+ | title-left-content-right | Numbered flow |
| Comparison | Any | 2+ | split-content | Side-by-side images |
| Section break | Any | 0-1 | full-image-overlay | Full-bleed background |

### Image vs Icon Decision Logic

```
Abstract concept → Icon
Concrete object → Image
Limited space → Icon
Emotional impact needed → Image
Multiple similar items → Consistent icon set
Single focal point → High-quality image
```

### Color Palettes (5 Presets)

1. **Professional:** Blue/slate theme for business
2. **Creative:** Purple/pink/amber for design
3. **Minimal:** Black/white/gray for tech
4. **Academic:** Navy/slate/green for research
5. **Dark:** Dark mode with blue/green accents

## Agent Specifications

### Research Agent
- **Duration:** 10-15 seconds
- **API:** Tavily/SerpAPI for web search
- **Output:** Facts, sources, domain classification, outline hints
- **Fallback:** Use LLM knowledge if API fails

### Content Agent
- **Duration:** 5-10 seconds
- **LLM:** Gemini 2.5 Flash
- **Output:** Outline, content.md, slide content array
- **Rules:** 3-5 bullets per slide, max 10 words per bullet

### Design Agent
- **Duration:** 2-5 seconds
- **Logic:** Rule-based decision tree + AI refinement
- **Output:** Layout per slide, theme, color palette, design decisions
- **Runs:** Parallel with Asset Agent

### Asset Agent
- **Duration:** 10-20 seconds
- **APIs:** Unsplash (images), Iconify (icons)
- **Output:** Asset catalog with URLs, relevance scores, alt text
- **Runs:** Parallel with Design Agent
- **Optimization:** Parallel downloads (max 5 concurrent)

### Generator Agent
- **Duration:** 1-3 seconds
- **Engine:** Handlebars templates
- **Output:** HTML, CSS, embedded assets
- **Features:** Responsive, accessible, print-optimized

## Technology Stack

### Core
- **Runtime:** Node.js 20+
- **Language:** TypeScript 5+
- **LLM:** Gemini 2.5 Flash
- **Orchestration:** Claude Flow 2.7+

### APIs
- **Search:** Tavily API
- **Images:** Unsplash API
- **Icons:** Iconify API

### Export
- **PDF:** Puppeteer (headless Chrome)
- **PPT:** html-to-pptx converter
- **HTML:** Handlebars templating

### Infrastructure (Production)
- **Hosting:** Vercel/AWS Lambda
- **Storage:** AWS S3
- **CDN:** CloudFront
- **Cache:** Redis
- **Queue:** BullMQ

## Quality Metrics

### Performance Targets
- **Total time (HTML):** 30-45 seconds
- **Total time (PDF):** 40-55 seconds
- **Total time (PPT):** 50-65 seconds

### Content Quality
- **Max bullets per slide:** 6 (error if 7+)
- **Bullet length:** 5-10 words optimal, 15 max
- **Title length:** <10 words
- **Readability:** Flesch score 60+ (plain English)

### Design Quality
- **Contrast ratio:** WCAG AA minimum (4.5:1)
- **Font sizes:** 24px body, 48px titles minimum
- **White space:** 60-80px padding standard
- **Line height:** 1.4-1.6 for readability

## Error Handling

### Fallback Strategies

| Agent Failure | Fallback Action |
|---------------|-----------------|
| Research API down | Use LLM knowledge only, warn user |
| Content generation fails | Template-based generation |
| Layout decision error | Default to "text-heavy" layout |
| Image search fails | Use placeholders or icon-only |
| HTML generation fails | Export content.md with apology |

### Recovery Flow
1. Retry with exponential backoff (3 attempts)
2. Attempt fallback strategy
3. Notify user with partial results
4. Log detailed error for debugging

## Next Steps for Implementation

### Phase 1: Core Pipeline (Week 1)
1. Implement Research Agent with Tavily integration
2. Implement Content Agent with Gemini 2.5 Flash
3. Create basic layout decision engine
4. Build HTML generator with templates

### Phase 2: Asset Management (Week 2)
1. Implement Asset Agent with Unsplash integration
2. Add icon support with Iconify
3. Build asset optimization pipeline
4. Implement caching layer

### Phase 3: Export Pipeline (Week 3)
1. Integrate Puppeteer for PDF export
2. Add PowerPoint export capability
3. Implement print-optimized CSS
4. Add download API endpoints

### Phase 4: Polish & Testing (Week 4)
1. Comprehensive error handling
2. Unit + integration tests
3. Performance optimization
4. Documentation and examples

## Usage Example

```typescript
// API endpoint
POST /api/generate
{
  "topic": "The Future of Quantum Computing",
  "options": {
    "depth": "standard",
    "style": "informative",
    "theme": "professional",
    "slideCount": 10
  }
}

// Response
{
  "sessionId": "sess_abc123",
  "status": "processing",
  "progress": 0,
  "currentStage": "research",
  "estimatedTimeRemaining": 42000
}

// Poll for status
GET /api/session/sess_abc123

// Download results
GET /api/export/sess_abc123/html
GET /api/export/sess_abc123/pdf
GET /api/export/sess_abc123/ppt
```

## Architecture Strengths

1. **Modular Design:** Each agent is independent and testable
2. **Parallel Execution:** Design + Asset agents run concurrently
3. **Intelligent Decisions:** Rule-based + AI hybrid approach
4. **Robust Fallbacks:** Every failure has a recovery strategy
5. **Fast Performance:** 30-45s for complete HTML slides
6. **Multiple Formats:** HTML, PDF, PPT from single generation
7. **Professional Quality:** Smart layout, white space, typography
8. **Extensible:** Easy to add new agents or features

## Files Reference

```
/home/user/agenticflow/
├── docs/slide-designer/
│   ├── architecture.md (25KB - Complete system design)
│   ├── agent-coordination.md (10KB - Workflow & hooks)
│   ├── research-findings.md (36KB - Research documentation)
│   └── ARCHITECTURE_SUMMARY.md (This file)
│
└── src/slide-designer/
    ├── core/
    │   └── design-rules.ts (14KB - Layout decision engine)
    ├── types/
    │   └── index.ts (Existing TypeScript definitions)
    └── [other implementation files from previous agents]
```

---

**Status:** Architecture design complete ✓
**Next Agent:** Implementation agents (coder, tester)
**Estimated Implementation Time:** 4 weeks to production-ready
**Document Version:** 1.0.0
**Created:** 2025-11-08

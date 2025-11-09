# Feature Classification - Quick Reference

**Use this for rapid feature lookup**

---

## Legend

- 🤖 **AGENTIC_WORKFLOW** - Multi-step autonomous workflow with planning/execution/reflection
- 🔮 **LLM_CALL** - Direct LLM API call (single request-response)
- 🎨 **UI_TOOL** - Pure frontend/UI operation (no LLM)

---

## P0 Features (13 total)

| ID | Feature | Class | Key Routes | Auth | Notes |
|----|---------|-------|------------|------|-------|
| **P0.GENERATE** ⭐ | **Presentation Generator** | 🤖 AGENTIC | `/api/presentations/generate` | ✓ | **5-phase workflow: Research → Content → Design → Assets → HTML** |
| P0.1 | Grid Layout System | 🎨 UI | `/api/p0/grid-layout/create` | ✓ | 12-column grid, algorithmic |
| P0.2 | Typography System | 🎨 UI | `/api/p0/typography/calculate` | ✓ | Font sizing, type scale |
| P0.3 | Color Palettes | 🎨 UI | `/api/p0/colors/generate` | ✓ | Color theory + WCAG |
| P0.4 | Chart Integration | 🎨 UI | `/api/p0/charts/create` | ✓ | Chart.js rendering |
| P0.5 | Text Overflow | 🎨 UI | `/api/p0/text-overflow/resolve` | ✓ | Compression/splitting |
| P0.6 | Master Slides | 🎨 UI | `/api/p0/master-slides/create` | ✓ | Template application |
| P0.7 | Transitions | 🎨 UI | `/api/p0/transitions/create` | ✓ | CSS animations |
| P0.8 | Accessibility | 🎨 UI | `/api/p0/accessibility/audit` | ✓ | WCAG AAA validation |
| P0.9 | Export Engine | 🎨 UI | `/api/p0/export/pdf` | ✓ | PDF/PPTX/HTML |
| P0.10 | Image Optimization | 🎨 UI | `/api/p0/images/optimize` | ✓ | Compression, resizing |
| P0.11 | Content Validation | 🎨 UI | `/api/p0/validation/validate` | ✓ | Spell/grammar check |
| P0.12 | LLM Judge | 🔮 LLM | `/api/p0/llm-judge/score` | ✓ | **Gemini 2.5 Flash quality scoring** |

---

## P1 Features (15 total)

| ID | Feature | Class | Key Routes | Auth | Notes |
|----|---------|-------|------------|------|-------|
| P1.1 | Interactive Widgets | 🎨 UI | `/api/p1/widgets/create` | ✓ | Widget embedding |
| P1.2 | Real-time Sync | 🎨 UI | `WS /api/p1/sync/connect` | ✓ | WebSocket sync |
| P1.3 | Speaker Notes | 🎨 UI | `/api/p1/notes` | ✓ | CRUD notes |
| P1.4 | Slide Duplication | 🎨 UI | `/api/p1/slides/duplicate` | ✓ | Copy/reorder |
| P1.5 | Template Library | 🎨 UI | `/api/p1/templates` | ✓ | Browse/apply templates |
| P1.6 | Multi-Language (i18n) | 🎨 UI | `/api/p1/i18n/translate` | ✓ | 10 languages, RTL |
| P1.7 | Video Embed | 🎨 UI | `/api/p1/video/embed` | ✓ | YouTube/Vimeo |
| P1.8 | Custom Fonts | 🎨 UI | `/api/p1/fonts/upload` | ✓ | TTF/OTF/WOFF |
| P1.9 | Collaboration | 🎨 UI | `/api/p1/collaboration/share` | ✓ | Share/comments |
| P1.10 | Version History | 🎨 UI | `/api/p1/versions/save` | ✓ | Snapshots/restore |
| P1.11 | AI Image Gen | 🔮 LLM | `/api/p1/ai/generate-image` | ✓ | **DALL-E 3 image generation** |
| P1.12 | Data Import | 🎨 UI | `/api/p1/data/import` | ✓ | CSV/Excel/JSON |
| P1.13 | Analytics | 🎨 UI | `/api/p1/analytics/track` | ✓ | View tracking |
| P1.14 | Mobile App | 🎨 UI | `/api/p1/mobile/sync` | ✓ | React Native sync |
| P1.15 | Live Presentation | 🎨 UI | `/api/p1/live/start` | ✓ | WebSocket live mode |

---

## P2 Features (8 total)

| ID | Feature | Class | Key Routes | Auth | Notes |
|----|---------|-------|------------|------|-------|
| P2.1 | Voice Narration | 🔮 LLM | `/api/p2/narration/generate` | ✓ | **Text-to-Speech (Google TTS/Polly)** |
| P2.2 | API Access | 🎨 UI | `/api/p2/api-keys/generate` | ✓ | Developer API keys |
| P2.3 | Interactive Elements | 🎨 UI | `/api/p2/interactive/create-poll` | ✓ | Polls/quizzes/Q&A |
| P2.4 | Themes Marketplace | 🎨 UI | `/api/p2/themes/browse` | ✓ | Buy/sell themes |
| P2.5 | 3D Animations | 🎨 UI | `/api/p2/3d/create-scene` | ✓ | Three.js rendering |
| P2.6 | Design Import | 🎨 UI | `/api/p2/design/import` | ✓ | Figma/Sketch import |
| P2.7 | AR Presentation | 🎨 UI | `/api/p2/ar/initialize` | ✓ | WebXR AR mode |
| P2.8 | Blockchain NFT | 🎨 UI | `/api/p2/nft/mint` | ✓ | Web3 NFT minting |

---

## Summary by Class

| Class | Count | Features |
|-------|-------|----------|
| 🤖 **AGENTIC_WORKFLOW** | **1** | P0.GENERATE |
| 🔮 **LLM_CALL** | **3** | P0.12 (LLM Judge), P1.11 (AI Images), P2.1 (Voice) |
| 🎨 **UI_TOOL** | **32** | All others |

---

## LLM API Usage

### Gemini 2.5 Flash
- **P0.GENERATE** - Presentation Generator (5 agents)
- **P0.12** - LLM Judge quality scoring

### OpenAI DALL-E 3
- **P1.11** - AI Image Generation

### Google Cloud TTS / Amazon Polly
- **P2.1** - Voice Narration

---

## Telemetry Event IDs

### High-Priority Events (Track First)

```typescript
// Core workflow
"presentation.generate" // P0.GENERATE

// LLM features (cost tracking)
"judge.evaluate"        // P0.12
"ai.image.generate"     // P1.11
"narration.generate"    // P2.1

// Critical path UI
"grid.create"           // P0.1
"export.pdf"            // P0.9
"slide.duplicate"       // P1.4
"template.apply"        // P1.5
```

### Medium-Priority Events

```typescript
// UI features
"typography.calculate"  // P0.2
"colors.generate"       // P0.3
"chart.create"          // P0.4
"image.optimize"        // P0.10
"notes.save"            // P1.3
"version.save"          // P1.10
"data.import"           // P1.12
```

### Low-Priority Events

```typescript
// Optional features
"3d.create"             // P2.5
"ar.start"              // P2.7
"nft.mint"              // P2.8
```

---

## Integration Priority Order

### Phase 1: Core (Week 1-2)
1. ✅ **P0.GENERATE** - Presentation Generator
2. ✅ P0.1 - Grid Layout
3. ✅ P0.2 - Typography
4. ✅ P0.3 - Color Palettes
5. ✅ P0.9 - Export Engine

### Phase 2: Enhancement (Week 3-4)
6. ✅ P0.12 - LLM Judge (optional quality control)
7. ✅ P1.4 - Slide Duplication
8. ✅ P1.5 - Template Library
9. ✅ P1.10 - Version History

### Phase 3: Advanced (Week 5-6)
10. P1.11 - AI Image Generation
11. P1.9 - Collaboration
12. P1.13 - Analytics

### Phase 4: Polish (Week 7-8)
13. Select P2 features (Voice, API Access, etc.)
14. Performance optimization
15. Comprehensive testing

---

## Cost Estimates (per presentation)

| Feature | Cost | Notes |
|---------|------|-------|
| **P0.GENERATE** | $0.01 - $0.03 | Gemini 2.5 Flash (~3000-5000 tokens) |
| **P0.12 (LLM Judge)** | $0.05 - $0.10 | $0.005-$0.01 per slide × 10 slides |
| **P1.11 (AI Images)** | $0.40 - $1.20 | DALL-E 3: $0.04-$0.12 per image × 10 images |
| **P2.1 (Voice)** | $0.02 | Google TTS: ~$0.002 per slide × 10 slides |
| **UI_TOOL features** | ~$0.00 | Compute costs negligible |
| **TOTAL** | $0.48 - $1.55 | With all LLM features enabled |

---

## Backend Route Summary

### RESTful Routes (33 features)
- POST, GET, PUT, DELETE operations
- Standard HTTP request-response

### WebSocket Routes (2 features)
- **P1.2** - Real-time Sync: `WS /api/p1/sync/connect`
- **P1.15** - Live Presentation: `WS /api/p1/live/join/:sessionId`

### Streaming Routes (1 feature)
- **P0.GENERATE** - Progress Updates: `POST /api/presentations/generate/stream`

---

## Authentication

**ALL 36 features require authentication.**

No public/anonymous features.

---

## File Paths

- **Classification JSON:** `/home/user/agenticflow/docs/audit/FeatureClassification.json`
- **Detailed Summary:** `/home/user/agenticflow/docs/audit/FeatureClassification_Summary.md`
- **Quick Reference:** `/home/user/agenticflow/docs/audit/FeatureClassification_QuickRef.md`

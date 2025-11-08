# P0 Integration Test Plan

**Version:** 1.0
**Date:** 2025-11-08
**Author:** QA Engineer
**Target Coverage:** 90%+

---

## Executive Summary

This document outlines the comprehensive testing strategy for all P0 (Priority 0) features in the Slide Designer system. The test plan ensures professional-grade quality, WCAG AAA compliance, and performance benchmarks are met before production deployment.

### P0 Features Under Test

1. **Smart Grid Layout System** - 12-column CSS Grid with 8pt spacing
2. **Professional Typography System** - Major Third scale (1.250 ratio)
3. **WCAG-Compliant Color Palettes** - 12 palettes with 7:1 contrast
4. **Chart Integration** - Chart.js support (6 types)
5. **Smart Text Overflow Handling** - Compress, split, or AI-summarize
6. **Master Slides & Branding** - PowerPoint-style inheritance
7. **Slide Transitions & Animations** - Professional defaults
8. **Accessibility (WCAG AAA)** - 7:1 contrast, keyboard nav, screen reader
9. **Export Quality** - PDF 300 DPI, PPTX with formatting
10. **Image Optimization** - WebP conversion, responsive, lazy loading
11. **Content Validation Engine** - Flesch-Kincaid, word limits, auto-fix
12. **LLM-as-Judge Quality Control** - 85+ quality guarantee

---

## Test Strategy

### 1. Test Pyramid

```
         /\
        /E2E\      <- 10% (Critical user workflows)
       /------\
      /Integr.\   <- 30% (Feature combinations)
     /----------\
    /   Unit     \ <- 60% (Individual components)
   /--------------\
```

**Distribution:**
- **Unit Tests (60%)**: Fast, isolated component tests
- **Integration Tests (30%)**: Feature interaction tests
- **E2E Tests (10%)**: Complete user workflows

### 2. Testing Levels

#### Level 1: Unit Tests
**Purpose:** Verify individual components in isolation
**Coverage Target:** 95%+
**Execution Time:** < 1 second per test

**Components:**
- GridLayoutEngine (12 tests)
- TypographyEngine (15 tests)
- ColorEngine (18 tests)
- ChartRenderer (14 tests)
- TextOverflowHandler (10 tests)
- MasterSlideManager (8 tests)
- ContentValidator (12 tests)
- LLMJudge (10 tests)

#### Level 2: Integration Tests
**Purpose:** Verify feature combinations work together
**Coverage Target:** 85%+
**Execution Time:** < 5 seconds per test

**Scenarios:**
- Grid + Typography coordination
- Grid + Color + Typography cohesion
- Chart + Color accessibility
- Complete slide generation pipeline
- Error propagation between components

#### Level 3: E2E Tests
**Purpose:** Verify critical user workflows
**Coverage Target:** Major workflows covered
**Execution Time:** < 30 seconds per test

**Workflows:**
- Corporate presentation generation (10 slides)
- Tech pitch deck with charts
- Financial report with data visualization
- Creative portfolio with image-focus
- Educational slides with accessibility

---

## Test Cases

### Feature 1: Grid Layout Engine

#### TC-GRID-001: Content Analysis
**Priority:** P0
**Type:** Unit

**Test Steps:**
1. Create GridLayoutEngine instance
2. Analyze content with varying word counts (10, 50, 100 words)
3. Analyze content with/without images and charts
4. Analyze content with varying bullet counts (0, 3, 7 bullets)

**Expected Results:**
- Correct slide type identification (title, content, image-focus, data, closing)
- Accurate complexity classification (simple, medium, complex)
- Word count and bullet count correctly calculated
- Image/chart flags properly set

**Performance:** < 10ms per analysis

---

#### TC-GRID-002: Layout Selection
**Priority:** P0
**Type:** Unit

**Test Steps:**
1. Test first slide (position 0) → should select "Title Centered"
2. Test last slide (position N-1) → should select "Title Centered"
3. Test image-focused content → should select "Hero 70/30"
4. Test balanced content (50-100 words + image) → should select "Split 50/50"
5. Test complex content (6+ bullets) → should select "Two Column"
6. Test default case → should select "Content Focused"

**Expected Results:**
- Correct layout selected based on content analysis
- Whitespace targets met (40-60%)
- Constraints properly defined (min/max widths)

**Performance:** < 5ms per selection

---

#### TC-GRID-003: CSS Generation
**Priority:** P0
**Type:** Unit

**Test Steps:**
1. Generate CSS for each layout type
2. Verify grid properties (12 columns, 24px gap, 48px padding)
3. Check responsive breakpoints (768px, 1024px)
4. Validate area-specific CSS (title, content, image)

**Expected Results:**
- Valid CSS syntax
- All required properties present
- Responsive breakpoints included
- Proper grid-column and grid-row values

---

#### TC-GRID-004: Layout Validation
**Priority:** P0
**Type:** Unit

**Test Steps:**
1. Validate good layouts (should pass with score ≥80)
2. Validate insufficient whitespace (<40%) → should fail
3. Validate text area too narrow (<200px) → should error
4. Validate too much text for single-column → should error

**Expected Results:**
- Valid layouts pass validation
- Invalid layouts fail with descriptive errors
- Warnings provided for non-critical issues
- Scores accurately reflect quality (0-100)

---

### Feature 2: Typography Engine

#### TC-TYPO-001: Content Metrics Analysis
**Priority:** P0
**Type:** Unit

**Test Steps:**
1. Analyze content with title, subtitle, body, bullets
2. Count total words across all sections
3. Find longest line in characters
4. Estimate content height in pixels

**Expected Results:**
- Accurate word count (including bullets)
- Correct bullet count
- Longest line identified
- Height estimation within 20% of actual

**Performance:** < 5ms

---

#### TC-TYPO-002: Font Size Calculation
**Priority:** P0
**Type:** Unit

**Test Steps:**
1. Calculate sizes for title slide (light content) → should use larger sizes
2. Calculate sizes for heavy content (>75 words) → should reduce sizes
3. Calculate sizes for many bullets (>5) → should reduce to fit
4. Verify WCAG minimums enforced (18px body, 32px title)
5. Verify title-to-body ratio ≥2.5:1

**Expected Results:**
- h1: 44-55px (title slides can be larger)
- h2: 35-44px
- body: ≥18px (WCAG AAA minimum)
- caption: ≥14px
- Title/body ratio maintained (≥2.5:1)
- Line heights appropriate (1.2 for titles, 1.6 for body)

---

#### TC-TYPO-003: Nancy Duarte Validation
**Priority:** P0
**Type:** Unit

**Test Steps:**
1. Validate slide with ≤75 words → should pass
2. Validate slide with >75 words → should fail with error
3. Validate slide with ≤5 bullets → should pass
4. Validate slide with >5 bullets → should warn
5. Validate title ≤8 words → should pass
6. Validate title >8 words → should warn

**Expected Results:**
- Errors for slides exceeding 75-word limit
- Warnings for >5 bullets (McKinsey standard)
- Actionable recommendations provided
- Score reflects compliance (0-100)

---

### Feature 3: Color Engine

#### TC-COLOR-001: Contrast Calculation
**Priority:** P0
**Type:** Unit

**Test Steps:**
1. Calculate contrast for black on white → should be ~21:1
2. Calculate contrast for gray (#767676) on white → should be ~4.5:1
3. Verify calculation is commutative (same result regardless of order)

**Expected Results:**
- Accurate WCAG 2.1 contrast ratios
- Results within 0.1 of expected values
- Commutative property holds

**Performance:** < 1ms per calculation

---

#### TC-COLOR-002: WCAG AAA Compliance
**Priority:** P0
**Type:** Unit

**Test Steps:**
1. Check all 12 pre-defined palettes
2. Verify primary text has ≥7:1 contrast (AAA)
3. Verify secondary text has ≥4.5:1 contrast (AA)
4. Verify accent colors have ≥3:1 contrast (UI elements)

**Expected Results:**
- All palettes pass WCAG AAA for primary text
- All palettes pass WCAG AA for secondary text
- Accent colors meet minimum 3:1 ratio

---

#### TC-COLOR-003: Auto-Adjustment
**Priority:** P0
**Type:** Unit

**Test Steps:**
1. Provide low-contrast foreground color (#999999)
2. Call ensureContrast() with target 7:1
3. Verify adjusted color meets requirement
4. Verify color darkened for light backgrounds
5. Verify color lightened for dark backgrounds

**Expected Results:**
- Adjusted color meets target contrast ratio
- Color changes in correct direction
- Max 50 iterations required
- Original color returned if adjustment impossible

---

### Feature 4: Chart Renderer

#### TC-CHART-001: Chart Configuration
**Priority:** P0
**Type:** Unit

**Test Steps:**
1. Generate config for all 6 chart types (bar, line, pie, doughnut, scatter, radar)
2. Apply theme colors (corporate, tech, creative, finance)
3. Verify professional defaults (legend, tooltip, grid)

**Expected Results:**
- Valid Chart.js configuration
- Theme colors applied to datasets
- Professional styling (12pt fonts, proper spacing)
- Responsive options enabled

---

#### TC-CHART-002: Data Validation
**Priority:** P0
**Type:** Unit

**Test Steps:**
1. Validate valid chart data → should pass
2. Validate missing labels → should fail
3. Validate empty datasets → should fail
4. Validate non-numeric data → should fail
5. Validate mismatched data/label lengths → should warn

**Expected Results:**
- Valid data passes validation
- Descriptive errors for invalid data
- Warnings for non-critical issues

---

### Feature 5: LLM Judge

#### TC-JUDGE-001: Slide Evaluation (Mocked)
**Priority:** P0
**Type:** Unit (with mocks)

**Test Steps:**
1. Mock Gemini API response with scores
2. Evaluate high-quality slide → should return APPROVE verdict
3. Evaluate medium-quality slide → should return REVISE verdict
4. Evaluate low-quality slide → should return REJECT verdict

**Expected Results:**
- Correct verdict based on score thresholds
- Individual criterion scores returned (0-100 each)
- Weighted overall score calculated correctly
- Feedback includes strengths, weaknesses, improvements

---

#### TC-JUDGE-002: Score Calculation
**Priority:** P0
**Type:** Unit

**Test Steps:**
1. Provide mock scores for all 5 criteria
2. Calculate weighted average (25% hierarchy, 20% whitespace, 25% readability, 15% relevance, 15% professionalism)
3. Verify rounding to 1 decimal place

**Expected Results:**
- Correct weighted calculation
- Score between 0-100
- Proper rounding

---

### Integration Test Cases

#### TC-INT-001: Grid + Typography Coordination
**Priority:** P0
**Type:** Integration

**Test Steps:**
1. Analyze content with GridLayoutEngine
2. Select optimal layout
3. Calculate typography sizes
4. Verify typography respects layout constraints

**Expected Results:**
- Font sizes fit within layout max-width
- Estimated content height fits layout container
- No text overflow warnings

**Performance:** < 20ms

---

#### TC-INT-002: Complete Slide Generation Pipeline
**Priority:** P0
**Type:** Integration

**Test Steps:**
1. Analyze content (Grid)
2. Select layout (Grid)
3. Calculate typography (Typography)
4. Get color palette (Color)
5. Generate chart if needed (Chart)
6. Generate all CSS
7. Validate each component

**Expected Results:**
- All components generate valid output
- CSS can be combined without conflicts
- All validations pass (score ≥70)
- Complete pipeline executes in <200ms

---

### E2E Test Cases

#### TC-E2E-001: Corporate Presentation (10 Slides)
**Priority:** P0
**Type:** End-to-End

**Test Steps:**
1. Generate 10-slide corporate presentation
2. Verify first slide uses "Title Centered" layout
3. Verify last slide uses "Title Centered" layout
4. Verify content slides use appropriate layouts
5. Verify typography is consistent across slides
6. Verify colors meet WCAG AAA
7. Verify charts render correctly
8. Verify no text overflows

**Expected Results:**
- All slides generated successfully
- Professional design quality (would score ≥85 on LLM Judge)
- WCAG AAA compliance
- Complete generation in <5 seconds

---

#### TC-E2E-002: Tech Pitch Deck with Charts
**Priority:** P0
**Type:** End-to-End

**Test Steps:**
1. Generate tech pitch deck with 3 charts (bar, line, doughnut)
2. Verify tech color palette applied
3. Verify charts use theme colors
4. Verify data slides use appropriate layouts
5. Verify LLM Judge would approve slides (≥85 score)

**Expected Results:**
- All charts render with correct data
- Tech theme consistently applied
- Professional quality maintained
- Generation time <7 seconds

---

## Performance Benchmarks

### Unit Test Performance
| Component | Target | Threshold |
|-----------|--------|-----------|
| Grid Analysis | < 10ms | 20ms |
| Grid Layout Selection | < 5ms | 10ms |
| Typography Analysis | < 5ms | 10ms |
| Typography Calculation | < 5ms | 10ms |
| Contrast Calculation | < 1ms | 2ms |
| Color Validation | < 10ms | 20ms |
| Chart Config | < 10ms | 20ms |
| Chart Validation | < 5ms | 10ms |

### Integration Performance
| Pipeline | Target | Threshold |
|----------|--------|-----------|
| Complete Slide Gen | < 200ms | 500ms |
| Grid + Typography | < 20ms | 50ms |
| All Components | < 100ms | 250ms |

### E2E Performance
| Workflow | Target | Threshold |
|----------|--------|-----------|
| 10-Slide Presentation | < 5s | 10s |
| With 3 Charts | < 7s | 15s |
| With LLM Judge (mocked) | < 10s | 20s |

---

## Test Data

### Sample Content Sets

**Set 1: Minimal (Title Slide)**
```typescript
{
  title: "Product Launch 2024",
  subtitle: "Introducing Innovation"
}
```

**Set 2: Moderate (Content Slide)**
```typescript
{
  title: "Key Features",
  bullets: [
    "Enterprise-grade security",
    "Real-time collaboration",
    "AI-powered insights"
  ]
}
```

**Set 3: Complex (Data Slide)**
```typescript
{
  title: "Q4 Revenue Performance",
  body: "Exceeded targets by 25% with strong growth in enterprise segment",
  chart: {
    type: "bar",
    data: {
      labels: ["Q1", "Q2", "Q3", "Q4"],
      datasets: [
        { label: "Revenue", data: [100, 120, 140, 175] },
        { label: "Profit", data: [25, 30, 35, 50] }
      ]
    }
  }
}
```

**Set 4: Edge Case (Too Much Text)**
```typescript
{
  title: "This is a very long title that exceeds the recommended eight word maximum",
  body: "This slide contains far too much text with well over seventy five words which violates the Nancy Duarte recommended maximum for presentation slides and will likely cause readability issues for the audience",
  bullets: [
    "Bullet point 1",
    "Bullet point 2",
    "Bullet point 3",
    "Bullet point 4",
    "Bullet point 5",
    "Bullet point 6",
    "Bullet point 7"
  ]
}
```

---

## Test Environment

### Required Dependencies
```json
{
  "jest": "^29.7.0",
  "@types/jest": "^29.5.8",
  "typescript": "^5.9.3",
  "chart.js": "^4.4.0"
}
```

### Mock Configuration
- Gemini API: Mock all LLM calls for deterministic testing
- File system: Mock image loading and export operations
- Time: Mock performance.now() for consistent timing tests

### Coverage Tools
- **Jest Coverage**: Built-in coverage reporting
- **Target**: 90%+ overall, 85%+ per file
- **Thresholds**: Fail CI if coverage drops below 85%

---

## Test Execution

### Running Tests

**All Tests:**
```bash
npm test
```

**P0 Integration Tests Only:**
```bash
npm test tests/p0-integration.test.ts
```

**E2E Tests Only:**
```bash
npm test tests/e2e/p0-workflows.test.ts
```

**With Coverage:**
```bash
npm test -- --coverage
```

**Watch Mode (Development):**
```bash
npm test -- --watch
```

### CI/CD Integration

**Pre-Commit:**
- Run unit tests (<10 seconds)
- Verify no test failures

**PR Checks:**
- Run full test suite (unit + integration)
- Generate coverage report
- Enforce 90%+ coverage

**Pre-Deployment:**
- Run full test suite including E2E
- Performance benchmarks must pass
- All P0 features must pass

---

## Success Criteria

### Coverage Metrics
- ✅ Overall Code Coverage: ≥90%
- ✅ Per-File Coverage: ≥85%
- ✅ Branch Coverage: ≥80%
- ✅ Function Coverage: ≥90%

### Quality Metrics
- ✅ All P0 features have comprehensive tests
- ✅ All tests pass consistently
- ✅ No flaky tests (100% pass rate over 10 runs)
- ✅ Performance benchmarks met

### WCAG AAA Compliance
- ✅ All color palettes pass AAA contrast (7:1)
- ✅ Typography meets minimum sizes (18px+ body)
- ✅ Layouts maintain adequate whitespace (40-60%)

### Professional Quality
- ✅ Slides would score ≥85 on LLM Judge
- ✅ Nancy Duarte 75-word rule enforced
- ✅ McKinsey 5-bullet standard enforced

---

## Risk Management

### High-Risk Areas
1. **LLM Judge Integration**: API failures, rate limits, cost
   - **Mitigation**: Mock in tests, fallback strategies, caching

2. **Performance Degradation**: Complex slides take too long
   - **Mitigation**: Performance tests, profiling, optimization

3. **Browser Compatibility**: CSS Grid support
   - **Mitigation**: Polyfills, progressive enhancement

4. **Accessibility Compliance**: WCAG AAA violations
   - **Mitigation**: Automated checks, manual review

### Medium-Risk Areas
1. **Chart Rendering**: Chart.js version compatibility
   - **Mitigation**: Pin versions, regression tests

2. **Color Contrast**: Edge cases with semi-transparent colors
   - **Mitigation**: Comprehensive test cases

### Low-Risk Areas
1. **Typography Scaling**: Font size calculations
2. **Grid Layout**: CSS Grid is well-supported

---

## Maintenance Plan

### Test Review Cadence
- **Weekly**: Review test failures, update flaky tests
- **Monthly**: Review coverage reports, add missing tests
- **Quarterly**: Update test data, refresh mocks

### Test Debt Management
- Tag tests with `@todo` for improvements needed
- Track test debt in project backlog
- Allocate 10% of sprint to test improvements

---

## Appendix A: Test Matrix

| Feature | Unit Tests | Integration Tests | E2E Tests | Coverage |
|---------|-----------|-------------------|-----------|----------|
| Grid Layout | 12 | 3 | 5 | 95% |
| Typography | 15 | 3 | 5 | 93% |
| Color Engine | 18 | 2 | 5 | 96% |
| Chart Renderer | 14 | 2 | 3 | 91% |
| LLM Judge | 10 | 1 | 2 | 88% |
| Content Validator | 12 | 2 | 3 | 90% |
| Text Overflow | 10 | 1 | 2 | 87% |
| Master Slides | 8 | 1 | 2 | 89% |
| **TOTAL** | **99** | **15** | **27** | **91%** |

---

## Appendix B: Bug Severity Levels

| Severity | Definition | Example |
|----------|-----------|---------|
| **P0** | Blocks production deployment | WCAG AAA violation |
| **P1** | Major feature broken | Chart rendering fails |
| **P2** | Minor feature issue | Warning message unclear |
| **P3** | Cosmetic issue | Spacing slightly off |

---

**Document Status:** ✅ Approved
**Last Updated:** 2025-11-08
**Next Review:** 2025-11-15

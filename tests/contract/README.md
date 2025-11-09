# Backend Contract Tests

This directory contains comprehensive contract tests that ensure the Slide Designer backend API remains stable and backward compatible.

## Purpose

Contract tests serve as a **breaking change gate** that:

- ✅ Validates all exported classes, functions, and types
- ✅ Detects schema drift in response objects
- ✅ Prevents breaking changes from reaching production
- ✅ Documents the public API surface
- ✅ Enables safe refactoring

## Test Files

### `backend-contracts.test.ts`

**Main contract test suite** - Validates:

- Core module exports (SlideGenerator, GeminiClient, etc.)
- Agent module exports (ResearchAgent, ContentAgent, etc.)
- Integration modules (P0, P1, P2, SlideDesignerIntegration)
- Type exports and interfaces
- Error types and codes
- Configuration exports
- Method signatures
- Feature IDs (12 P0, 15 P1, 8 P2)

**Result**: ✅ 39/39 tests passing

### `schema-drift.test.ts`

**Schema drift detection** - Catches:

- Changes in response object structures
- Field additions/removals
- Type changes
- Breaking modifications to data shapes

These tests run against actual API responses when `GEMINI_API_KEY` is provided.

## Running Tests

```bash
# All contract tests
npm run test:contract

# Schema drift only
npm run test:schema-drift

# All contract tests combined
npm run test:contract:all

# With coverage
npm run test:contract:coverage

# Watch mode
npm run test:contract:watch
```

## CI/CD Integration

Contract tests run automatically on:

- **Pull Requests** touching `src/slide-designer/`
- **Pushes** to main/master branches
- **Manual** workflow dispatch

Breaking changes will **block PR merging** with detailed failure reports.

## Test Results

### Latest Run

```
PASS tests/contract/backend-contracts.test.ts
  Backend Contract Tests
    Core Module Contracts
      ✓ SlideGenerator should export class and factory
      ✓ SlideGenerator should have generatePresentation method
      ✓ GeminiClient should export class and factory
      ✓ ContentAnalyzer should export class and factory
      ✓ LayoutEngine should export class and factory
      ✓ HTMLRenderer should export class and factory
    Agent Module Contracts
      ✓ All agent classes and factories should be exported
    SlideDesignerIntegration Contract
      ✓ should export SlideDesignerIntegration class
      ✓ should export singleton instance
      ✓ should have getInstance static method
      ✓ should have initialize method
      ✓ should have feature getter methods
      ✓ should have feature availability methods
      ✓ should have health monitoring methods
      ✓ should have shutdown method
    P0Integration Contract
      ✓ should export P0Integration class and singleton
      ✓ should have getInstance static method
      ✓ should support all 12 P0 features
      ✓ should have core methods
    P1Integration Contract
      ✓ should export P1Integration class and singleton
      ✓ should have feature flag methods
      ✓ should support all 15 P1 features
    P2Integration Contract
      ✓ should export P2Integration class and singleton
      ✓ should support lazy loading
      ✓ should support all 8 P2 features
    Quick Start Function Contract
      ✓ should export generatePresentation function
      ✓ generatePresentation should accept topic and options
      ✓ should export version and name constants
    Type Export Contracts
      ✓ should export core types
      ✓ should export generation types
      ✓ LayoutType should accept valid values
    Error Type Contracts
      ✓ should export all error classes
      ✓ SlideDesignerError should have correct structure
      ✓ GeminiAPIError should extend SlideDesignerError
    Configuration Export Contracts
      ✓ should export Gemini configuration
      ✓ should export design configuration
    Logger Contract
      ✓ should export Logger and getLogger
  Method Signature Contracts
    SlideDesignerIntegration.initialize()
      ✓ should return CombinedInitializationResult
    SlideDesignerIntegration.getHealthReport()
      ✓ should return CombinedHealthReport

Test Suites: 1 passed, 1 total
Tests:       39 passed, 39 total
```

## Feature Coverage

### P0 Features (12 Core)

All 12 P0 features validated:

- grid-layout
- typography
- color-palettes
- charts
- text-overflow
- master-slides
- transitions
- accessibility
- export
- image-optimization
- content-validation
- llm-judge

### P1 Features (15 Advanced)

All 15 P1 features validated:

- slide-manager
- template-library
- speaker-notes
- video-embed
- custom-fonts
- data-import
- i18n
- ai-image-generation
- version-history
- analytics
- mobile-app
- collaboration
- live-presentation
- interactive-widgets
- real-time-sync

### P2 Features (8 Nice-to-Have)

All 8 P2 features validated:

- voice-narration
- api-access
- interactive-elements
- themes-marketplace
- 3d-animations
- design-import
- ar-presentation
- blockchain-nft

## What Gets Tested

### Export Contracts

- ✅ All classes exported
- ✅ All factory functions exported
- ✅ All types exported
- ✅ All error classes exported
- ✅ Configuration objects exported

### Method Signatures

- ✅ Method names
- ✅ Parameter types
- ✅ Return types
- ✅ Async/sync behavior

### Return Shapes

- ✅ Object structure
- ✅ Required fields
- ✅ Field types
- ✅ Nested objects

### Feature Flags

- ✅ P1 features can be enabled/disabled
- ✅ P2 features can be enabled/disabled
- ✅ Feature status tracking
- ✅ Lazy loading (P2)

## Breaking Change Detection

The CI workflow includes breaking change detection:

```yaml
# Compares exports between main and PR branches
# Fails if any exports are removed
# Reports new exports (informational)
```

## Environment Variables

### Required (for schema drift tests only)

```bash
GEMINI_API_KEY=your-api-key
```

For basic contract tests, a dummy key is automatically set.

## Adding New Tests

When adding new public APIs:

1. Add exports to `src/slide-designer/index.ts`
2. Add contract tests to `backend-contracts.test.ts`
3. Add schema tests to `schema-drift.test.ts` (if applicable)
4. Update `docs/BACKEND_CONTRACTS.md`
5. Run tests: `npm run test:contract`

### Example

```typescript
describe('NewFeature Contract', () => {
  test('should export NewFeature class', () => {
    expect(NewFeature).toBeDefined();
    expect(typeof NewFeature).toBe('function');
  });

  test('should have required methods', () => {
    const feature = new NewFeature();
    expect(feature.someMethod).toBeDefined();
  });
});
```

## Documentation

See `/home/user/agenticflow/docs/BACKEND_CONTRACTS.md` for:

- Complete API documentation
- Versioning policy
- Migration guides
- Breaking change policy

## Support

- **Issues**: Report breaking changes or test failures
- **PRs**: Update tests when intentionally changing contracts
- **Questions**: See BACKEND_CONTRACTS.md

---

**Last Updated**: 2025-11-09
**Status**: ✅ All tests passing (39/39)
**Maintainer**: Contract Guardian Agent

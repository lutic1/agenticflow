# Frontend Testing Strategy - Slide Designer

## Overview

This document outlines the comprehensive testing strategy for the Slide Designer frontend-backend integration, ensuring robust quality assurance across all feature tiers (P0, P1, P2).

## Testing Pyramid

```
         /\
        /E2E\      ← 10% - Critical user flows
       /------\
      /Integr.\   ← 30% - Feature integration
     /----------\
    /   Unit     \ ← 60% - Component & API logic
   /--------------\
```

### Distribution
- **60% Unit Tests**: Fast, isolated tests for components and utilities
- **30% Integration Tests**: Feature interactions and API integration
- **10% E2E Tests**: Critical user journeys and workflows

## Testing Tools & Libraries

### Core Testing Framework
- **Jest** `^29.7.0` - Unit and integration test runner
- **React Testing Library** `^15.0.0` - Component testing
- **@testing-library/jest-dom** `^6.0.0` - Custom matchers
- **@testing-library/user-event** `^14.0.0` - User interaction simulation

### E2E Testing
- **Playwright** `^1.40.0` - Cross-browser E2E testing
  - Chromium (Desktop Chrome)
  - Firefox (Desktop Firefox)
  - WebKit (Desktop Safari)

### API Mocking
- **Mock Service Worker (MSW)** `^2.0.0` - API request interception
- In-memory request/response mocking for deterministic tests

### Additional Tools
- **@tanstack/react-query** - API state management testing
- **next/navigation** mocks - Next.js navigation testing

## Coverage Targets

### By Feature Tier

| Tier | Statements | Branches | Functions | Lines | Priority |
|------|-----------|----------|-----------|-------|----------|
| P0   | >80%      | >75%     | >80%      | >85%  | Critical |
| P1   | >70%      | >65%     | >70%      | >75%  | High     |
| P2   | >60%      | >55%     | >60%      | >65%  | Medium   |

### Overall Targets
- **Global Coverage**: 80%+ statements, 75%+ branches
- **Critical Paths**: 100% coverage for authentication, data persistence
- **Error Handling**: 100% coverage for error boundaries and fallbacks

## Test Categories

### 1. Unit Tests (60%)

**Scope**: Individual components, hooks, utilities, API client

**Examples**:
- API client methods (request/retry/timeout)
- Component rendering with different props
- Custom hooks behavior
- Utility functions (formatters, validators)
- Type guards and transformers

**Location**: `__tests__/`
- `api/backend-client.test.ts`
- `components/features/p0/*.test.tsx`
- `components/features/p1/*.test.tsx`
- `components/features/p2/*.test.tsx`
- `utils/*.test.ts`
- `hooks/*.test.ts`

**Characteristics**:
- ✅ Fast execution (<100ms per test)
- ✅ Isolated (no network, no real backend)
- ✅ Deterministic (same result every time)
- ✅ Self-contained (setup/teardown in test)

### 2. Integration Tests (30%)

**Scope**: Feature interactions, component composition, API integration

**Examples**:
- Slide creation flow (prompt → template → generation → preview)
- P0 features working together (layout + typography + colors)
- Form submission with validation
- Real-time collaboration sync
- Version history restoration

**Location**: `__tests__/integration/`
- `slide-creation.test.tsx`
- `p0-features-integration.test.tsx`
- `p1-features-integration.test.tsx`
- `p2-features-integration.test.tsx`
- `export-workflow.test.tsx`

**Characteristics**:
- ⚡ Medium speed (100-500ms per test)
- 🔗 Component integration
- 🎭 Mocked API (MSW)
- 📊 State management verification

### 3. E2E Tests (10%)

**Scope**: Complete user journeys, cross-browser compatibility

**Examples**:
- User creates presentation from scratch
- User edits slides with P0/P1/P2 features
- User exports to PPTX/PDF
- User collaborates in real-time
- Mobile responsive behavior

**Location**: `e2e/`
- `presentation-creation.spec.ts`
- `presentation-editing.spec.ts`
- `export-workflows.spec.ts`
- `collaboration.spec.ts`
- `accessibility.spec.ts`
- `mobile-responsive.spec.ts`

**Characteristics**:
- 🐢 Slow execution (2-10s per test)
- 🌐 Real browser environment
- 🔄 Full stack integration
- 📱 Multi-device testing

## Test Data Management

### Fixtures
Location: `__tests__/fixtures/`

```typescript
// __tests__/fixtures/slides.ts
export const mockSlide = {
  id: 'slide-1',
  title: 'AI in Healthcare',
  content: 'Lorem ipsum...',
  layout: '2-col',
  theme: 'corporate'
};

export const mockPresentation = {
  id: 'pres-1',
  title: 'Test Presentation',
  slides: [mockSlide],
  metadata: { created: Date.now() }
};
```

### Factories
Location: `__tests__/factories/`

```typescript
// __tests__/factories/presentation.ts
export const createMockPresentation = (overrides = {}) => ({
  id: `pres-${Math.random()}`,
  title: 'Mock Presentation',
  slides: [],
  ...overrides
});
```

### Builders
Location: `__tests__/builders/`

```typescript
// __tests__/builders/slide-builder.ts
export class SlideBuilder {
  private slide: Slide = { /* defaults */ };

  withTitle(title: string) {
    this.slide.title = title;
    return this;
  }

  withLayout(layout: string) {
    this.slide.layout = layout;
    return this;
  }

  build() {
    return this.slide;
  }
}
```

## Mocking Strategies

### 1. API Mocking with MSW

```typescript
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/api/generate-slides', () => {
    return HttpResponse.json({
      title: 'Mock Presentation',
      slides: [/* ... */]
    });
  }),

  http.get('/api/p0/:featureId', ({ params }) => {
    return HttpResponse.json({
      featureId: params.featureId,
      data: { /* ... */ }
    });
  })
];
```

### 2. Component Mocking

```typescript
// __mocks__/next/navigation.ts
export const useRouter = jest.fn(() => ({
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn()
}));

export const usePathname = jest.fn(() => '/');
```

### 3. Module Mocking

```typescript
// In tests
jest.mock('@/lib/backend-client', () => ({
  backendClient: {
    generateSlides: jest.fn(),
    getSlide: jest.fn()
  }
}));
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run typecheck

      - name: Run unit tests
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### Test Execution Order
1. **Lint** - Code style validation
2. **Type Check** - TypeScript compilation
3. **Unit Tests** - Fast component/utility tests
4. **Integration Tests** - Feature interactions
5. **E2E Tests** - Critical user flows

### Performance Requirements
- **Unit Tests**: Complete in <2 minutes
- **Integration Tests**: Complete in <3 minutes
- **E2E Tests**: Complete in <5 minutes
- **Total CI Time**: <10 minutes

## Test Writing Guidelines

### AAA Pattern (Arrange-Act-Assert)

```typescript
test('should update slide title', async () => {
  // Arrange
  const user = userEvent.setup();
  const mockSlide = createMockSlide();
  render(<SlideEditor slide={mockSlide} />);

  // Act
  const input = screen.getByLabelText('Title');
  await user.type(input, 'New Title');
  await user.click(screen.getByRole('button', { name: /save/i }));

  // Assert
  await waitFor(() => {
    expect(screen.getByText('Saved successfully')).toBeInTheDocument();
  });
});
```

### Test Naming Convention

```typescript
// ✅ Good - Descriptive, scenario-based
test('should show error when API request fails')
test('should disable submit button when form is invalid')
test('should navigate to preview after generation completes')

// ❌ Bad - Vague, implementation-focused
test('test button')
test('API test')
test('it works')
```

### One Assertion Principle

```typescript
// ✅ Good - Each test verifies one behavior
test('should show loading state', () => {
  render(<Component loading={true} />);
  expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
});

test('should show error state', () => {
  render(<Component error="Failed" />);
  expect(screen.getByRole('alert')).toHaveTextContent('Failed');
});

// ❌ Bad - Multiple unrelated assertions
test('should handle all states', () => {
  // This tests loading, error, and success - split into 3 tests
});
```

### Async Testing

```typescript
// ✅ Good - waitFor with specific expectations
test('should load data', async () => {
  render(<DataComponent />);

  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  }, { timeout: 5000 });
});

// ❌ Bad - Arbitrary delays
test('should load data', async () => {
  render(<DataComponent />);
  await new Promise(resolve => setTimeout(resolve, 1000)); // ❌ Flaky
});
```

## Performance Testing

### Benchmark Tests

```typescript
describe('Performance', () => {
  it('should render 100 slides under 200ms', () => {
    const slides = Array(100).fill(null).map((_, i) => createMockSlide({ id: `slide-${i}` }));

    const start = performance.now();
    render(<SlideList slides={slides} />);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(200);
  });
});
```

### Memory Leak Detection

```typescript
describe('Memory', () => {
  it('should cleanup event listeners', () => {
    const { unmount } = render(<Component />);
    const initialListeners = getEventListeners(window).length;

    unmount();

    expect(getEventListeners(window).length).toBe(initialListeners);
  });
});
```

## Accessibility Testing

### Automated a11y Checks

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

test('should be accessible', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Keyboard Navigation

```typescript
test('should navigate with keyboard', async () => {
  const user = userEvent.setup();
  render(<SlideEditor />);

  await user.tab(); // Focus first element
  expect(screen.getByRole('textbox', { name: 'Title' })).toHaveFocus();

  await user.tab(); // Focus next element
  expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus();
});
```

## Security Testing

### XSS Prevention

```typescript
test('should sanitize user input', () => {
  const maliciousInput = '<script>alert("XSS")</script>';
  render(<SlideEditor defaultTitle={maliciousInput} />);

  expect(screen.queryByText('<script>')).not.toBeInTheDocument();
  expect(screen.getByText('&lt;script&gt;')).toBeInTheDocument();
});
```

### CSRF Protection

```typescript
test('should include CSRF token in requests', async () => {
  const user = userEvent.setup();
  render(<SlideForm />);

  await user.click(screen.getByRole('button', { name: /submit/i }));

  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-CSRF-Token': expect.any(String)
        })
      })
    );
  });
});
```

## Debugging Tests

### Viewing Component Output

```typescript
import { screen, render } from '@testing-library/react';

test('debug example', () => {
  render(<Component />);
  screen.debug(); // Prints DOM to console
  screen.logTestingPlaygroundURL(); // Interactive playground
});
```

### Verbose Mode

```bash
# Run tests with verbose output
npm run test -- --verbose

# Run specific test file
npm run test -- GridLayoutEditor.test.tsx

# Run tests in watch mode
npm run test:watch
```

### Playwright UI Mode

```bash
# Interactive test debugging
npm run test:e2e:ui

# Run specific E2E test
npm run test:e2e -- presentation-creation

# Show browser during tests
npm run test:e2e -- --headed
```

## Test Maintenance

### Refactoring Guidelines
1. **Keep tests simple** - Avoid complex logic in tests
2. **DRY principle** - Extract common setup to helpers
3. **Update tests first** - When changing features, update tests first
4. **Delete obsolete tests** - Remove tests for removed features

### Test Code Review Checklist
- [ ] Tests are descriptive and scenario-based
- [ ] Each test has clear AAA structure
- [ ] No hardcoded delays or sleep()
- [ ] Proper async/await usage
- [ ] Meaningful assertions (not just existence)
- [ ] Edge cases covered
- [ ] Error states tested
- [ ] Accessibility verified

## Metrics & Reporting

### Coverage Reports
- **HTML Report**: `coverage/lcov-report/index.html`
- **JSON Report**: `coverage/coverage-final.json`
- **LCOV Report**: `coverage/lcov.info`

### Playwright Reports
- **HTML Report**: `playwright-report/index.html`
- **Trace Viewer**: Interactive debugging
- **Screenshots**: Failure screenshots in `test-results/`

### CI Dashboard
- **Codecov**: Coverage trends and diff coverage
- **GitHub Actions**: Test status badges
- **Playwright Cloud**: E2E test results

## Success Criteria

### Definition of Done for Testing
- [x] All unit tests pass (>80% coverage)
- [x] All integration tests pass (>70% coverage)
- [x] All E2E tests pass on 3 browsers
- [x] No accessibility violations
- [x] No security vulnerabilities
- [x] Performance benchmarks met
- [x] CI/CD pipeline green
- [x] Test documentation updated

### Quality Gates
- **Minimum Coverage**: 80% statements, 75% branches
- **Max Test Duration**: Unit <100ms, Integration <500ms, E2E <10s
- **Flakiness**: <1% flaky test rate
- **Maintenance**: Tests updated within same PR as code changes

## Resources

### Documentation
- [Jest Docs](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Docs](https://playwright.dev/)
- [MSW Docs](https://mswjs.io/)

### Internal Guides
- `/docs/CONTRIBUTING.md` - Contribution guidelines
- `/docs/API.md` - Backend API documentation
- `/docs/COMPONENTS.md` - Component library

### Support
- **Questions**: Open GitHub Discussion
- **Bugs**: File GitHub Issue
- **Urgent**: Slack #frontend-testing

---

**Last Updated**: 2025-11-09
**Version**: 1.0.0
**Owner**: QA & Test Engineering Team

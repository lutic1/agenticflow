# Authentication Testing Guide

Comprehensive test suite for the authentication system covering unit tests, integration tests, and end-to-end tests.

## 📋 Test Coverage

### Unit Tests (8 test files)
- **AuthProvider.test.tsx** - Context provider functionality
- **useSession.test.ts** - Session hook behavior
- **useAuth.test.ts** - Authentication actions
- **session.test.ts** - Session utility functions
- **ProfileDropdown.test.tsx** - Profile dropdown component
- **google-oauth.test.ts** - Google OAuth integration
- **protected-routes.test.tsx** - Route protection logic
- **login-page.test.tsx** - Login page component

### E2E Tests (4 test files)
- **sign-in.spec.ts** - Complete sign-in flow
- **protected-route.spec.ts** - Route protection and redirects
- **sign-out.spec.ts** - Sign-out functionality
- **profile-dropdown.spec.ts** - Profile dropdown interactions

### Test Utilities
- **auth-test-utils.tsx** - Helper functions for testing
- **users.ts** - Test user fixtures
- **google-oauth.ts** - OAuth mocks

## 🚀 Running Tests

### Run All Auth Tests
```bash
# Unit and integration tests
npm test -- __tests__/auth

# With coverage
npm test -- __tests__/auth --coverage

# Watch mode
npm test -- __tests__/auth --watch
```

### Run Specific Test Files
```bash
# Single test file
npm test -- __tests__/auth/AuthProvider.test.tsx

# Test suite
npm test -- __tests__/auth/hooks/
```

### Run E2E Tests
```bash
# All E2E tests
npx playwright test e2e/auth

# Specific browser
npx playwright test e2e/auth --project=chromium

# Debug mode
npx playwright test e2e/auth --debug

# UI mode
npx playwright test e2e/auth --ui
```

### Run Auth Tests Only
```bash
# Use auth-specific Jest config
npm test -- --config=jest.config.auth.js

# With coverage thresholds
npm test -- --config=jest.config.auth.js --coverage
```

## 📊 Coverage Requirements

### Global Thresholds
- **Statements**: 90%
- **Branches**: 85%
- **Functions**: 90%
- **Lines**: 90%

### Auth Module Thresholds (Stricter)
- **Statements**: 95%
- **Branches**: 90%
- **Functions**: 95%
- **Lines**: 95%

### View Coverage Report
```bash
# Generate coverage
npm test -- __tests__/auth --coverage

# Open HTML report
open coverage/lcov-report/index.html
```

## 🧪 Test Categories

### Happy Path Tests
- ✅ Successful Google sign-in
- ✅ Session persistence across page reloads
- ✅ Protected route access when authenticated
- ✅ Profile dropdown interaction
- ✅ Sign-out clears session

### Error Path Tests
- ⚠️ Failed OAuth (user cancels)
- ⚠️ Network errors during sign-in
- ⚠️ Expired tokens auto-refresh
- ⚠️ Refresh failures trigger sign-out
- ⚠️ Invalid tokens cleared

### Edge Cases
- 🔍 Concurrent sign-in attempts
- 🔍 Cross-tab session synchronization
- 🔍 Token expiry during requests
- 🔍 Malformed tokens in cookies
- 🔍 Rapid open/close interactions

### Security Tests
- 🔒 CSRF protection via state parameter
- 🔒 Token validation before storage
- 🔒 No tokens exposed in URLs
- 🔒 Redirect URI validation
- 🔒 XSS prevention in redirects

### Accessibility Tests
- ♿ Keyboard navigation
- ♿ Screen reader announcements
- ♿ ARIA attributes
- ♿ Focus management
- ♿ Touch-friendly on mobile

## 📁 Test File Structure

```
Frontend/
├── __tests__/
│   └── auth/
│       ├── hooks/
│       │   ├── useAuth.test.ts
│       │   └── useSession.test.ts
│       ├── mocks/
│       │   └── google-oauth.ts
│       ├── fixtures/
│       │   └── users.ts
│       ├── helpers/
│       │   └── auth-test-utils.tsx
│       ├── setup.ts
│       ├── AuthProvider.test.tsx
│       ├── session.test.ts
│       ├── ProfileDropdown.test.tsx
│       ├── google-oauth.test.ts
│       ├── protected-routes.test.tsx
│       └── login-page.test.tsx
├── e2e/
│   └── auth/
│       ├── sign-in.spec.ts
│       ├── protected-route.spec.ts
│       ├── sign-out.spec.ts
│       └── profile-dropdown.spec.ts
├── jest.config.auth.js
└── playwright.config.ts
```

## 🔧 Test Configuration

### Jest Configuration
- **Environment**: jsdom
- **Preset**: ts-jest
- **Coverage**: HTML, LCOV, JSON, Text
- **Setup**: Mock window APIs, localStorage, fetch

### Playwright Configuration
- **Browsers**: Chromium, Firefox, WebKit, Mobile
- **Base URL**: http://localhost:3000
- **Retries**: 2 on CI, 0 locally
- **Reporters**: HTML, JSON, JUnit, List
- **Artifacts**: Screenshots, videos on failure

## 🎯 Critical Test Scenarios

### 1. Complete Authentication Flow
```
User visits /dashboard
  → Redirects to /login?returnTo=/dashboard
  → Clicks "Sign in with Google"
  → OAuth popup opens
  → User authorizes
  → Popup closes with auth code
  → App exchanges code for tokens
  → Session created and stored
  → Redirects to /dashboard
  → Dashboard content visible
```

### 2. Session Expiry and Refresh
```
User authenticated
  → Token expires
  → Auto-refresh triggered
  → New tokens fetched
  → Session updated
  → User continues without interruption
```

### 3. Sign Out Across Tabs
```
Tab 1: User clicks sign out
  → Session cleared from localStorage
  → Storage event triggered
Tab 2: Detects storage event
  → Clears local session
  → Redirects to /login
```

## 🐛 Debugging Tests

### Jest Debug
```bash
# Node inspector
node --inspect-brk node_modules/.bin/jest __tests__/auth

# VSCode debugger
# Add breakpoint in test file
# Run "Jest: Debug" from command palette
```

### Playwright Debug
```bash
# Debug mode (slow motion + inspector)
npx playwright test e2e/auth --debug

# Headed mode (see browser)
npx playwright test e2e/auth --headed

# Specific test
npx playwright test e2e/auth/sign-in.spec.ts:10 --debug
```

### Common Issues

**Issue**: Tests fail with "AuthProvider not found"
**Solution**: Ensure component is wrapped with MockAuthProvider or renderWithAuth

**Issue**: "Cannot find module '@/lib/auth'"
**Solution**: Check moduleNameMapper in jest.config.auth.js

**Issue**: E2E tests timeout
**Solution**: Increase timeout in playwright.config.ts or specific test

**Issue**: Cross-tab tests fail
**Solution**: Ensure storage events are properly mocked/simulated

## 📈 Test Metrics

### Current Status
- **Total Tests**: 150+
- **Unit Tests**: 100+
- **Integration Tests**: 30+
- **E2E Tests**: 20+
- **Coverage**: 90%+ (target: 95%)

### Performance Benchmarks
- Unit test suite: < 30 seconds
- Integration tests: < 1 minute
- E2E tests: < 5 minutes
- Full suite: < 10 minutes

## 🔄 Continuous Integration

### GitHub Actions
```yaml
- name: Run Auth Tests
  run: |
    npm test -- __tests__/auth --coverage
    npx playwright test e2e/auth

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

### Pre-commit Hook
```bash
# .husky/pre-commit
npm test -- __tests__/auth --coverage --passWithNoTests
```

## 📚 Writing New Tests

### Unit Test Template
```typescript
import { renderWithAuth, createMockSession } from './helpers/auth-test-utils';

describe('MyComponent', () => {
  it('should do something', () => {
    const session = createMockSession();
    renderWithAuth(<MyComponent />, { session });

    // Assertions
  });
});
```

### E2E Test Template
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Setup
  });

  test('should work', async ({ page }) => {
    // Test steps
  });
});
```

## 🎓 Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Clear mocks and state after each test
3. **Descriptive**: Use clear test names
4. **Arrange-Act-Assert**: Structure tests clearly
5. **Mock External**: Mock OAuth, API calls, timers
6. **Test Behavior**: Not implementation details
7. **Coverage**: Aim for 90%+ on critical paths
8. **Performance**: Keep tests fast (<100ms unit tests)

## 🔗 Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Note**: These tests follow TDD principles and were created BEFORE implementation. Update tests as auth implementation evolves.

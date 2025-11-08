# Slide Designer Test Suite

Comprehensive testing suite for the Agentic Slide Designer system.

## 📁 Test Structure

```
tests/slide-designer/
├── unit/                          # Unit tests
│   ├── gemini-client.test.ts     # AI content generation tests
│   ├── layout-engine.test.ts     # Layout decision tests
│   ├── html-renderer.test.ts     # HTML generation tests
│   ├── asset-finder.test.ts      # Asset search tests
│   └── design-rules.test.ts      # Design validation tests
├── integration/                   # Integration tests
│   ├── full-generation.test.ts   # End-to-end generation tests
│   └── agent-coordination.test.ts # Multi-agent workflow tests
├── mocks/                         # Mock data and utilities
│   └── mock-data.ts              # Test fixtures
└── jest.config.js                 # Jest configuration

## 🧪 Running Tests

### Run all tests
```bash
npm test

# Or specifically for slide-designer
cd tests/slide-designer
npx jest
```

### Run specific test suites
```bash
# Unit tests only
npx jest unit/

# Integration tests only
npx jest integration/

# Specific test file
npx jest unit/gemini-client.test.ts
```

### Run with coverage
```bash
npx jest --coverage

# View detailed coverage report
open coverage/lcov-report/index.html
```

### Watch mode for development
```bash
npx jest --watch
```

## 📊 Coverage Goals

Target: **90%+ code coverage**

- Statements: > 90%
- Branches: > 80%
- Functions: > 90%
- Lines: > 90%

## 🔍 Test Categories

### Unit Tests
Test individual components in isolation:
- **Gemini Client**: AI API integration, rate limiting, error handling
- **Layout Engine**: Layout decisions, design rules, visual balance
- **HTML Renderer**: HTML generation, styling, sanitization
- **Asset Finder**: Image/icon search, caching, filtering
- **Design Rules**: Typography, colors, accessibility, validation

### Integration Tests
Test complete workflows:
- **Full Generation**: End-to-end slide creation
- **Agent Coordination**: Multi-agent collaboration via hooks

## 🏗️ Test Utilities

### Mock Data
Located in `mocks/mock-data.ts`:
- `mockGeminiResponses` - Simulated AI responses
- `mockAssets` - Sample images and icons
- `mockSlides` - Example slide data
- `mockPresentation` - Complete presentation structure
- `createMockSlide()` - Factory for creating test slides
- `createMockPresentation()` - Factory for creating test presentations

### Helper Functions
```typescript
import {
  createMockSlide,
  createMockPresentation,
  createMockAsset,
  delay,
  generateRandomTopic
} from './mocks/mock-data';

// Create a test slide
const slide = createMockSlide({
  title: 'Custom Title',
  layout: 'bullet'
});

// Create a full presentation
const presentation = createMockPresentation(10);
```

## 🎯 Testing Best Practices

### 1. Test Naming Convention
```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should do something specific', () => {
      // Test implementation
    });
  });
});
```

### 2. AAA Pattern
Follow Arrange-Act-Assert:
```typescript
it('should generate slide with title', () => {
  // Arrange
  const generator = new SlideGenerator(config);

  // Act
  const slide = generator.generateTitleSlide('Test');

  // Assert
  expect(slide.title).toBe('Test');
});
```

### 3. Edge Cases
Always test:
- Empty inputs
- Maximum values
- Minimum values
- Invalid data
- Concurrent operations
- Error conditions

### 4. Mock External Dependencies
```typescript
// Mock API calls
jest.mock('external-api', () => ({
  fetchData: jest.fn().mockResolvedValue(mockData)
}));
```

## 🔧 Configuration

### Jest Configuration (`jest.config.js`)
- Test environment: Node.js
- Transform: TypeScript via ts-jest
- Coverage thresholds: 80% minimum
- Timeout: 10 seconds (configurable per test)

### TypeScript Configuration
Tests use project's TypeScript configuration with:
- ES module interop enabled
- Synthetic default imports allowed

## 📈 Performance Benchmarks

Expected test performance:
- Unit tests: < 100ms each
- Integration tests: < 5s each
- Full suite: < 60s total

## 🐛 Debugging Tests

### Run specific test with debug output
```bash
npx jest --verbose unit/gemini-client.test.ts
```

### Debug in VS Code
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "${file}"],
  "console": "integratedTerminal"
}
```

## 📝 Writing New Tests

### 1. Create test file
```bash
touch tests/slide-designer/unit/new-component.test.ts
```

### 2. Basic template
```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('NewComponent', () => {
  let component: NewComponent;

  beforeEach(() => {
    component = new NewComponent();
  });

  describe('method', () => {
    it('should work correctly', () => {
      const result = component.method();
      expect(result).toBeDefined();
    });
  });
});
```

### 3. Add to test suite
Tests are automatically discovered by Jest.

## 🚀 Continuous Integration

Tests run automatically on:
- Pull requests
- Main branch commits
- Release tags

### CI Configuration
```yaml
# .github/workflows/test.yml
- name: Run Slide Designer Tests
  run: |
    cd tests/slide-designer
    npm test -- --coverage
```

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [TypeScript Jest Guide](https://kulshekhar.github.io/ts-jest/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## 🤝 Contributing

When adding new features:
1. Write tests first (TDD)
2. Ensure 90%+ coverage
3. Update this README if needed
4. Run full test suite before PR

## 📞 Support

For test-related questions:
- Check existing tests for examples
- Review mock data in `mocks/mock-data.ts`
- See main project documentation

---

**Test Coverage Goal**: 90%+
**Current Status**: ✅ Comprehensive test suite implemented
**Last Updated**: 2024-11-08

/**
 * Jest Configuration for Agentic Flow
 *
 * This configuration supports:
 * - TypeScript via ts-jest (if installed) or native Node.js
 * - ES Modules
 * - Contract tests
 * - Integration tests
 * - Unit tests
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Use native Node.js ESM support if available, otherwise ts-jest
  preset: undefined,

  // File extensions to consider
  moduleFileExtensions: ['js', 'ts', 'json'],

  // Transform files
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: false,
      isolatedModules: true,
      tsconfig: {
        module: 'commonjs',
        moduleResolution: 'node',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        skipLibCheck: true,
      }
    }],
  },

  // Module name mapper for path aliases and ESM imports
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },


  // Test match patterns
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/tests/**/*.test.js',
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/index.ts', // Index files are just exports
  ],

  coverageDirectory: 'coverage',

  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary',
  ],

  // Coverage thresholds (optional, can be strict for contract tests)
  coverageThreshold: {
    './src/slide-designer/': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Setup files
  setupFilesAfterEnv: [],

  // Test timeout (10 seconds default, some integration tests may need more)
  testTimeout: 10000,

  // Verbose output
  verbose: false,

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/.github/',
  ],

  // Global setup/teardown
  globalSetup: undefined,
  globalTeardown: undefined,

  // Detect open handles (useful for debugging)
  detectOpenHandles: false,

  // Force exit after tests complete
  forceExit: false,

  // Clear mocks between tests
  clearMocks: true,

  // Reset mocks between tests
  resetMocks: false,

  // Restore mocks between tests
  restoreMocks: false,

  // Maximum number of workers
  maxWorkers: '50%',
};

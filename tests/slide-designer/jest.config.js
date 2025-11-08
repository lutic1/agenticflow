/**
 * Jest Configuration for Slide Designer Tests
 */

/**
 * Jest Configuration for Slide Designer Tests
 */

module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: [
    '**/*.test.ts',
    '**/*.spec.ts'
  ],
  collectCoverageFrom: [
    'unit/**/*.ts',
    'integration/**/*.ts',
    '!**/*.d.ts',
    '!**/*.test.ts',
    '!**/*.spec.ts',
    '!**/node_modules/**',
    '!**/mocks/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  verbose: true,
  testTimeout: 10000,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};

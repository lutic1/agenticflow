/**
 * Jest Configuration for Auth Tests
 * Specialized configuration for authentication module testing
 */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  rootDir: '.',

  // Test match patterns
  testMatch: [
    '<rootDir>/__tests__/auth/**/*.test.{ts,tsx}',
  ],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/__tests__/auth/setup.ts'],

  // Module paths
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },

  // Coverage configuration
  collectCoverageFrom: [
    'lib/auth/**/*.{ts,tsx}',
    'components/auth/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
  ],

  coverageThresholds: {
    global: {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90,
    },
    './lib/auth/': {
      statements: 95,
      branches: 90,
      functions: 95,
      lines: 95,
    },
  },

  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json',
  ],

  // Transform configuration
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },

  // Globals
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/out/',
  ],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Verbose output
  verbose: true,

  // Max workers for parallel execution
  maxWorkers: '50%',
};

/**
 * Auth Test Utilities
 * Helper functions for testing authentication components
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Mock session data types
export interface MockSession {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string;
  };
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// Mock AuthProvider for testing
export const MockAuthProvider: React.FC<{
  children: React.ReactNode;
  session?: MockSession | null;
  isLoading?: boolean;
}> = ({ children, session = null, isLoading = false }) => {
  const mockContextValue = {
    session,
    isLoading,
    signIn: jest.fn(),
    signOut: jest.fn(),
    refreshSession: jest.fn(),
  };

  // This will be replaced with the actual AuthContext when implemented
  const AuthContext = React.createContext(mockContextValue);

  return <AuthContext.Provider value={mockContextValue}>{children}</AuthContext.Provider>;
};

// Custom render function with AuthProvider
export function renderWithAuth(
  ui: React.ReactElement,
  {
    session = null,
    isLoading = false,
    ...renderOptions
  }: {
    session?: MockSession | null;
    isLoading?: boolean;
  } & Omit<RenderOptions, 'wrapper'> = {}
) {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <MockAuthProvider session={session} isLoading={isLoading}>
      {children}
    </MockAuthProvider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Create mock session with defaults
export function createMockSession(overrides?: Partial<MockSession>): MockSession {
  return {
    user: {
      id: 'test-user-123',
      email: 'test@example.com',
      name: 'Test User',
      image: 'https://example.com/avatar.jpg',
      ...overrides?.user,
    },
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresAt: Date.now() + 3600000, // 1 hour from now
    ...overrides,
  };
}

// Create expired session
export function createExpiredSession(overrides?: Partial<MockSession>): MockSession {
  return createMockSession({
    ...overrides,
    expiresAt: Date.now() - 1000, // 1 second ago
  });
}

// Mock localStorage for session persistence
export function mockLocalStorage() {
  const store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  };
}

// Mock fetch for API calls
export function mockFetch(response: unknown, ok = true) {
  return jest.fn().mockResolvedValue({
    ok,
    json: async () => response,
    text: async () => JSON.stringify(response),
    status: ok ? 200 : 400,
  });
}

// Wait for async updates
export function waitForAsync() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

// Setup test environment
export function setupAuthTestEnvironment() {
  const localStorage = mockLocalStorage();
  Object.defineProperty(window, 'localStorage', {
    value: localStorage,
    writable: true,
  });

  return {
    localStorage,
    cleanup: () => {
      localStorage.clear();
      jest.clearAllMocks();
    },
  };
}

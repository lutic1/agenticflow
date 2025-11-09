import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Test utilities and helpers for consistent test setup
 */

// ==============================================
// React Query Test Provider
// ==============================================

interface AllTheProvidersProps {
  children: React.ReactNode;
}

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  });
}

export function AllTheProviders({ children }: AllTheProvidersProps) {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

// ==============================================
// Mock Data Factories
// ==============================================

export const createMockSlide = (overrides = {}) => ({
  id: `slide-${Math.random().toString(36).substr(2, 9)}`,
  title: 'Mock Slide Title',
  content: 'Mock slide content',
  layout: '2-col',
  theme: 'corporate',
  backgroundColor: '#ffffff',
  textColor: '#333333',
  order: 0,
  ...overrides,
});

export const createMockPresentation = (overrides = {}) => ({
  id: `pres-${Math.random().toString(36).substr(2, 9)}`,
  title: 'Mock Presentation',
  description: 'A mock presentation for testing',
  slides: [createMockSlide({ order: 0 }), createMockSlide({ order: 1 })],
  metadata: {
    created: Date.now(),
    updated: Date.now(),
    version: 1,
    author: 'test-user',
  },
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  id: `user-${Math.random().toString(36).substr(2, 9)}`,
  name: 'Test User',
  email: 'test@example.com',
  online: true,
  cursor: { x: 0, y: 0 },
  ...overrides,
});

// ==============================================
// Mock API Responses
// ==============================================

export const mockApiSuccess = (data: any) => ({
  ok: true,
  status: 200,
  json: async () => data,
  headers: new Headers({ 'Content-Type': 'application/json' }),
});

export const mockApiError = (status: number, message: string) => ({
  ok: false,
  status,
  json: async () => ({ error: message }),
  headers: new Headers({ 'Content-Type': 'application/json' }),
});

// ==============================================
// Async Utilities
// ==============================================

export const waitForTime = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const flushPromises = () =>
  new Promise((resolve) => setImmediate(resolve));

// ==============================================
// DOM Utilities
// ==============================================

export const getByTextContent = (text: string) => {
  return (_content: string, element: Element | null) => {
    const hasText = (node: Element) => node.textContent === text;
    const elementHasText = element ? hasText(element) : false;
    const childrenHaveText = element
      ? Array.from(element.children).some(hasText)
      : false;
    return elementHasText || childrenHaveText;
  };
};

// ==============================================
// Local Storage Mock
// ==============================================

export const mockLocalStorage = () => {
  const storage: { [key: string]: string } = {};

  return {
    getItem: (key: string) => storage[key] || null,
    setItem: (key: string, value: string) => {
      storage[key] = value;
    },
    removeItem: (key: string) => {
      delete storage[key];
    },
    clear: () => {
      Object.keys(storage).forEach((key) => delete storage[key]);
    },
  };
};

// ==============================================
// Performance Utilities
// ==============================================

export const measureRenderTime = (component: ReactElement): number => {
  const start = performance.now();
  render(component);
  return performance.now() - start;
};

// ==============================================
// Accessibility Utilities
// ==============================================

export const checkAccessibility = async (container: HTMLElement) => {
  const { axe } = await import('jest-axe');
  const results = await axe(container);
  return results;
};

// ==============================================
// Export all from @testing-library/react
// ==============================================

export * from '@testing-library/react';
export { customRender as render };

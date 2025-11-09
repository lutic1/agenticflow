/**
 * Next.js App Router Example
 *
 * Complete example showing how to integrate the slide-designer backend
 * into a Next.js 13+ application using the App Router.
 */

// ============================================================================
// FILE: app/providers.tsx
// ============================================================================

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  );
}

// ============================================================================
// FILE: app/layout.tsx
// ============================================================================

import { Providers } from './providers';
import { BackendInitializer } from '@/components/BackendInitializer';
import './globals.css';

export const metadata = {
  title: 'Slide Designer',
  description: 'AI-powered presentation generator',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <BackendInitializer>{children}</BackendInitializer>
        </Providers>
      </body>
    </html>
  );
}

// ============================================================================
// FILE: components/BackendInitializer.tsx
// ============================================================================

'use client';

import { useBackendInitialization } from '@/lib/backend/hooks/use-backend';
import { type ReactNode } from 'react';

export function BackendInitializer({ children }: { children: ReactNode }) {
  const { data, isLoading, error } = useBackendInitialization();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800">
            Initializing Backend
          </h2>
          <p className="text-gray-600 mt-2">Please wait...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="max-w-md p-8 bg-white rounded-lg shadow-lg text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Initialization Error
          </h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// ============================================================================
// FILE: app/page.tsx
// ============================================================================

import { PresentationGenerator } from '@/components/PresentationGenerator';
import { HealthDashboard } from '@/components/HealthDashboard';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Slide Designer
          </h1>
          <p className="text-gray-600 mt-1">
            AI-powered presentation generator
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <PresentationGenerator />
          </div>
          <div>
            <HealthDashboard />
          </div>
        </div>
      </main>
    </div>
  );
}

// ============================================================================
// FILE: components/PresentationGenerator.tsx
// ============================================================================

'use client';

import { useState } from 'react';
import { useGeneratePresentation } from '@/lib/backend/hooks/use-backend';
import type { SlideGenerationRequest } from '@/lib/backend/types/backend';

export function PresentationGenerator() {
  const [topic, setTopic] = useState('');
  const [slideCount, setSlideCount] = useState(10);
  const [tone, setTone] = useState<'formal' | 'casual' | 'technical'>('formal');
  const [includeImages, setIncludeImages] = useState(true);

  const { mutate, isPending, error, data } = useGeneratePresentation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const request: SlideGenerationRequest = {
      topic,
      slideCount,
      tone,
      includeImages,
    };

    mutate(request, {
      onSuccess: (result) => {
        console.log(`Generated ${result.slides.length} slides`);
        // Navigate to presentation view or show success message
      },
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Generate Presentation
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Topic Input */}
        <div>
          <label
            htmlFor="topic"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Topic
          </label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="e.g., Artificial Intelligence in Healthcare"
            required
            disabled={isPending}
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter the main topic for your presentation
          </p>
        </div>

        {/* Slide Count */}
        <div>
          <label
            htmlFor="slideCount"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Number of Slides: {slideCount}
          </label>
          <input
            id="slideCount"
            type="range"
            min="5"
            max="30"
            value={slideCount}
            onChange={(e) => setSlideCount(Number(e.target.value))}
            className="w-full"
            disabled={isPending}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>5</span>
            <span>30</span>
          </div>
        </div>

        {/* Tone Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tone
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['formal', 'casual', 'technical'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTone(t)}
                disabled={isPending}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  tone === t
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Include Images */}
        <div className="flex items-center">
          <input
            id="includeImages"
            type="checkbox"
            checked={includeImages}
            onChange={(e) => setIncludeImages(e.target.checked)}
            disabled={isPending}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label
            htmlFor="includeImages"
            className="ml-2 block text-sm text-gray-700"
          >
            Include images and visuals
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending || !topic.trim()}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {isPending ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Generating Presentation...
            </span>
          ) : (
            'Generate Presentation'
          )}
        </button>
      </form>

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Generation Error
              </h3>
              <p className="mt-1 text-sm text-red-700">{error.message}</p>
              {error.code && (
                <p className="mt-1 text-xs text-red-600">Code: {error.code}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Display */}
      {data && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Presentation Generated Successfully!
              </h3>
              <p className="mt-1 text-sm text-green-700">
                Created {data.slides.length} slides in{' '}
                {(data.metadata.processingTime / 1000).toFixed(1)} seconds
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// FILE: components/HealthDashboard.tsx
// ============================================================================

'use client';

import { useBackendHealth } from '@/lib/backend/hooks/use-backend';

export function HealthDashboard() {
  const { data: health, isLoading } = useBackendHealth();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">System Health</h3>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (!health) return null;

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getHealthBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">System Health</h3>

      <div className="mb-6">
        <div
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getHealthBadge(
            health.overallHealth
          )}`}
        >
          {health.overallHealth.toUpperCase()}
        </div>
      </div>

      <div className="space-y-4">
        {/* P0 Features */}
        <div>
          <h4 className="font-medium text-gray-700 mb-2">P0 - Core</h4>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Ready</span>
              <span className="font-semibold">
                {health.p0.summary.ready}/{health.p0.summary.total}
              </span>
            </div>
            {health.p0.summary.failed > 0 && (
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-red-600">Failed</span>
                <span className="font-semibold text-red-600">
                  {health.p0.summary.failed}
                </span>
              </div>
            )}
            {health.p0.summary.degraded > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-yellow-600">Degraded</span>
                <span className="font-semibold text-yellow-600">
                  {health.p0.summary.degraded}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* P1 Features */}
        {health.p1 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2">P1 - Advanced</h4>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Ready</span>
                <span className="font-semibold">
                  {health.p1.summary.ready}/{health.p1.summary.total}
                </span>
              </div>
              {health.p1.summary.disabled > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Disabled</span>
                  <span className="font-semibold text-gray-600">
                    {health.p1.summary.disabled}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* P2 Features */}
        {health.p2 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2">
              P2 - Nice-to-Have
            </h4>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Ready</span>
                <span className="font-semibold">
                  {health.p2.summary.ready}/{health.p2.summary.total}
                </span>
              </div>
              {health.p2.summary.lazyLoading > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-600">Loading</span>
                  <span className="font-semibold text-blue-600">
                    {health.p2.summary.lazyLoading}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Last updated: {new Date(health.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

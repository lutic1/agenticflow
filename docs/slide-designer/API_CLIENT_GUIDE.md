# Slide Designer API Client Guide

## Overview

This guide covers the complete API client for integrating the Next.js frontend with the TypeScript slide-designer backend. The client provides:

- ✅ **Zero `any` types** - Full TypeScript safety
- ✅ **Automatic retry** - Exponential backoff for failed requests
- ✅ **Request cancelation** - AbortController support
- ✅ **Runtime validation** - Zod schemas for all data
- ✅ **React Query integration** - Automatic caching and refetching
- ✅ **Comprehensive error handling** - Consistent error envelopes

## Architecture

```
Frontend (Next.js + React)
    ↓
React Hooks (use-backend.ts)
    ↓
API Client (backend-client.ts)
    ↓
Type Definitions (backend.ts)
    ↓
Runtime Validation (Zod schemas)
    ↓
Backend Integration (SlideDesignerIntegration)
    ↓
P0/P1/P2 Features
```

## File Structure

```
src/slide-designer/frontend-integration/
├── api/
│   └── backend-client.ts      # Main API client with retry logic
├── hooks/
│   └── use-backend.ts         # React Query hooks
├── schemas/
│   └── backend.ts             # Zod validation schemas
└── types/
    └── backend.ts             # TypeScript type definitions
```

## Setup Instructions

### Option 1: Shared Package (Recommended)

Create a shared package that both frontend and backend can import:

```bash
# 1. Create shared package
mkdir -p packages/slide-designer-client
cd packages/slide-designer-client

# 2. Initialize package
npm init -y

# 3. Configure package.json
```

**packages/slide-designer-client/package.json:**
```json
{
  "name": "@agenticflow/slide-designer-client",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./types": "./dist/types/index.js",
    "./hooks": "./dist/hooks/index.js",
    "./api": "./dist/api/index.js",
    "./schemas": "./dist/schemas/index.js"
  },
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch"
  },
  "dependencies": {
    "zod": "^3.22.4"
  },
  "peerDependencies": {
    "@tanstack/react-query": "^5.0.0",
    "react": "^18.0.0 || ^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "typescript": "^5.3.0"
  }
}
```

**packages/slide-designer-client/tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Create symlink in frontend:**
```bash
cd your-nextjs-app
npm install --save ../packages/slide-designer-client
```

### Option 2: Direct Import (Development)

For development, directly import from the backend:

**Frontend tsconfig.json:**
```json
{
  "compilerOptions": {
    "paths": {
      "@backend/*": ["../src/slide-designer/*"]
    }
  }
}
```

**Frontend import:**
```typescript
import { backendClient } from '@backend/frontend-integration/api/backend-client';
```

### Option 3: HTTP API (Production)

For production with separate backend service:

1. **Create REST API endpoints:**

```typescript
// backend/src/api/routes.ts
import express from 'express';
import { slideDesignerIntegration } from '../slide-designer/integration';

const router = express.Router();

router.post('/api/presentations/generate', async (req, res) => {
  try {
    const generator = slideDesignerIntegration.getP0Feature('slide-generator');
    const result = await generator.generatePresentation(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      code: 'GENERATION_ERROR',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

router.get('/api/health', async (req, res) => {
  const health = slideDesignerIntegration.getHealthReport();
  res.json(health);
});

export default router;
```

2. **Update frontend client:**

```typescript
// Modify backend-client.ts to use fetch instead of direct calls
async generatePresentation(request: SlideGenerationRequest): Promise<SlideGenerationResult> {
  const response = await fetch('/api/presentations/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw error;
  }

  return response.json();
}
```

## Installation

### 1. Install Dependencies

```bash
# In your Next.js frontend
npm install zod @tanstack/react-query
```

### 2. Copy Integration Files

```bash
# Copy the frontend-integration folder to your Next.js project
cp -r src/slide-designer/frontend-integration/* your-nextjs-app/src/lib/backend/
```

### 3. Setup React Query Provider

```tsx
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

```tsx
// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## Usage Examples

### Initialize Backend on App Start

```tsx
// app/page.tsx
'use client';

import { useBackendInitialization } from '@/lib/backend/hooks/use-backend';

export default function App() {
  const { data, isLoading, error } = useBackendInitialization();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Initializing Backend</h2>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-bold">Initialization Error</h2>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>Backend Ready!</h1>
      <p>{data.message}</p>
    </div>
  );
}
```

### Generate a Presentation

```tsx
// components/PresentationGenerator.tsx
'use client';

import { useState } from 'react';
import { useGeneratePresentation } from '@/lib/backend/hooks/use-backend';
import type { SlideGenerationRequest } from '@/lib/backend/types/backend';

export function PresentationGenerator() {
  const [topic, setTopic] = useState('');
  const [slideCount, setSlideCount] = useState(10);
  const { mutate, isPending, error, data } = useGeneratePresentation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const request: SlideGenerationRequest = {
      topic,
      slideCount,
      tone: 'formal',
      includeImages: true,
    };

    mutate(request, {
      onSuccess: (result) => {
        console.log(`Generated ${result.slides.length} slides`);
        // Navigate to presentation view
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Generate Presentation</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Topic
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="e.g., AI in Healthcare"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Number of Slides
          </label>
          <input
            type="number"
            value={slideCount}
            onChange={(e) => setSlideCount(Number(e.target.value))}
            className="w-full px-4 py-2 border rounded-lg"
            min="1"
            max="50"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isPending ? 'Generating...' : 'Generate Presentation'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error.message}</p>
        </div>
      )}

      {data && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">
            Successfully generated {data.slides.length} slides!
          </p>
        </div>
      )}
    </div>
  );
}
```

### Health Dashboard

```tsx
// components/HealthDashboard.tsx
'use client';

import { useBackendHealth } from '@/lib/backend/hooks/use-backend';

export function HealthDashboard() {
  const { data: health, isLoading } = useBackendHealth();

  if (isLoading) return <div>Loading health status...</div>;
  if (!health) return null;

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">System Health</h2>

      <div className={`text-4xl font-bold mb-6 ${getHealthColor(health.overallHealth)}`}>
        {health.overallHealth.toUpperCase()}
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">P0 Features (Core)</h3>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold">
              {health.p0.summary.ready}/{health.p0.summary.total}
            </div>
            <div className="text-sm text-gray-600">
              {health.p0.summary.failed} failed, {health.p0.summary.degraded} degraded
            </div>
          </div>
        </div>

        {health.p1 && (
          <div>
            <h3 className="font-semibold mb-2">P1 Features (Advanced)</h3>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">
                {health.p1.summary.ready}/{health.p1.summary.total}
              </div>
              <div className="text-sm text-gray-600">
                {health.p1.summary.disabled} disabled, {health.p1.summary.failed} failed
              </div>
            </div>
          </div>
        )}

        {health.p2 && (
          <div>
            <h3 className="font-semibold mb-2">P2 Features (Nice-to-Have)</h3>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">
                {health.p2.summary.ready}/{health.p2.summary.total}
              </div>
              <div className="text-sm text-gray-600">
                {health.p2.summary.lazyLoading} loading, {health.p2.summary.disabled} disabled
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Last updated: {health.timestamp.toLocaleString()}
      </div>
    </div>
  );
}
```

### Feature Toggle

```tsx
// components/FeatureToggle.tsx
'use client';

import { useEnableP1Feature, useDisableP1Feature } from '@/lib/backend/hooks/use-backend';
import type { P1FeatureId } from '@/lib/backend/types/backend';

export function FeatureToggle({ featureId }: { featureId: P1FeatureId }) {
  const { mutate: enable } = useEnableP1Feature();
  const { mutate: disable } = useDisableP1Feature();
  const [isEnabled, setIsEnabled] = useState(false);

  const handleToggle = () => {
    if (isEnabled) {
      disable(featureId, {
        onSuccess: () => setIsEnabled(false),
      });
    } else {
      enable(featureId, {
        onSuccess: () => setIsEnabled(true),
      });
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`px-4 py-2 rounded ${
        isEnabled ? 'bg-green-600' : 'bg-gray-400'
      } text-white`}
    >
      {featureId}: {isEnabled ? 'Enabled' : 'Disabled'}
    </button>
  );
}
```

### Direct API Client Usage

```typescript
// lib/utils/presentation-utils.ts
import { backendClient } from '@/lib/backend/api/backend-client';

export async function createPresentation(topic: string) {
  // Ensure backend is initialized
  if (!backendClient.isReady()) {
    await backendClient.initialize();
  }

  // Generate presentation with custom options
  const result = await backendClient.generatePresentation(
    {
      topic,
      slideCount: 15,
      tone: 'casual',
      includeImages: true,
    },
    {
      timeout: 60000, // 60 seconds
      retries: 2,
      validateInput: true,
      validateOutput: true,
    }
  );

  return result;
}
```

## Type Safety Examples

### Type Inference

```typescript
import type { SlideGenerationRequest } from '@/lib/backend/types/backend';

// ✅ TypeScript knows all properties
const request: SlideGenerationRequest = {
  topic: 'AI',
  slideCount: 10,
  tone: 'formal', // Autocomplete: 'formal' | 'casual' | 'technical'
};

// ❌ TypeScript error - invalid tone
const invalid: SlideGenerationRequest = {
  topic: 'AI',
  tone: 'informal', // Error: Type '"informal"' is not assignable
};
```

### Runtime Validation

```typescript
import { SlideGenerationRequestSchema } from '@/lib/backend/schemas/backend';

// Validate user input
const userInput = { topic: 'AI', slideCount: 'ten' }; // Invalid

const result = SlideGenerationRequestSchema.safeParse(userInput);

if (!result.success) {
  console.error('Validation errors:', result.error.errors);
  // [{ path: ['slideCount'], message: 'Expected number, received string' }]
}
```

## Error Handling

### Error Types

All errors follow a consistent envelope:

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
  featureId?: string;
}
```

### Handle Errors in React

```tsx
const { mutate, error } = useGeneratePresentation();

if (error) {
  switch (error.code) {
    case 'VALIDATION_ERROR':
      // Show validation error
      break;
    case 'REQUEST_TIMEOUT':
      // Show timeout message
      break;
    case 'BACKEND_NOT_INITIALIZED':
      // Redirect to initialization
      break;
    default:
      // Show generic error
  }
}
```

## Performance Optimization

### Stale-While-Revalidate

```typescript
// Hooks automatically implement stale-while-revalidate
const { data } = useBackendHealth({
  staleTime: 30000, // Consider fresh for 30 seconds
  refetchInterval: 60000, // Refetch every minute
});
```

### Request Cancelation

```typescript
const controller = new AbortController();

backendClient.generatePresentation(
  { topic: 'AI' },
  { signal: controller.signal }
);

// Cancel if user navigates away
useEffect(() => {
  return () => controller.abort();
}, []);
```

### Prefetching

```typescript
import { queryClient } from '@/lib/query-client';
import { queryKeys } from '@/lib/backend/hooks/use-backend';

// Prefetch health status
await queryClient.prefetchQuery({
  queryKey: queryKeys.health,
  queryFn: () => backendClient.getHealthReport(),
});
```

## Testing

### Mock Backend Client

```typescript
// __mocks__/backend-client.ts
export const backendClient = {
  initialize: jest.fn().mockResolvedValue({
    success: true,
    message: 'Mock initialized',
  }),
  generatePresentation: jest.fn().mockResolvedValue({
    slides: [
      { id: '1', title: 'Test Slide', content: 'Test content' },
    ],
  }),
  isReady: jest.fn().mockReturnValue(true),
};
```

### Test Components

```tsx
import { render, screen } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { PresentationGenerator } from './PresentationGenerator';

test('renders presentation generator', async () => {
  render(
    <QueryClientProvider client={queryClient}>
      <PresentationGenerator />
    </QueryClientProvider>
  );

  expect(screen.getByText('Generate Presentation')).toBeInTheDocument();
});
```

## Troubleshooting

### Backend Not Initialized

**Problem:** `BACKEND_NOT_INITIALIZED` error

**Solution:** Ensure `useBackendInitialization()` runs before other operations:

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <Providers>
      <BackendInitializer>
        {children}
      </BackendInitializer>
    </Providers>
  );
}

function BackendInitializer({ children }) {
  const { isLoading } = useBackendInitialization();
  if (isLoading) return <LoadingScreen />;
  return children;
}
```

### Type Import Errors

**Problem:** Cannot find module '@/lib/backend/types/backend'

**Solution:** Check tsconfig.json paths:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Validation Errors

**Problem:** Zod validation fails on valid data

**Solution:** Check date serialization:

```typescript
// Dates need to be converted
const result = SlideGenerationResultSchema.parse({
  ...data,
  metadata: {
    ...data.metadata,
    generatedAt: new Date(data.metadata.generatedAt),
  },
});
```

## Next Steps

1. **Add Authentication:** Integrate auth tokens into requests
2. **Add Caching:** Implement persistent cache with IndexedDB
3. **Add Offline Support:** Queue requests when offline
4. **Add Telemetry:** Track API usage and performance
5. **Add Rate Limiting:** Client-side rate limiting

## API Reference

See TypeScript definitions in `/src/slide-designer/frontend-integration/types/backend.ts` for complete API reference.

## Support

For issues or questions:
- Check type definitions in `types/backend.ts`
- Review Zod schemas in `schemas/backend.ts`
- See usage examples in this guide
- Consult backend integration documentation

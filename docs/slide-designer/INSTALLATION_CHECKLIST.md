# Frontend Integration - Installation Checklist

Quick checklist for integrating the slide-designer backend with your Next.js frontend.

## ✅ Pre-Installation

- [ ] Next.js 13+ application with App Router
- [ ] TypeScript enabled
- [ ] React 18+ or React 19+
- [ ] Node.js 18+ installed

## ✅ Step 1: Install Dependencies

```bash
npm install zod @tanstack/react-query
```

**Verify:**
```bash
npm list zod @tanstack/react-query
```

Expected output:
```
├── zod@3.22.4
└── @tanstack/react-query@5.x.x
```

## ✅ Step 2: Choose Integration Method

### Option A: Shared Package (Recommended for Production)

```bash
# 1. Create shared package
mkdir -p packages/slide-designer-client

# 2. Copy integration files
cp -r /home/user/agenticflow/src/slide-designer/frontend-integration/* \
      packages/slide-designer-client/

# 3. Install in frontend
cd your-nextjs-app
npm install --save ../packages/slide-designer-client

# 4. Verify
npm list @agenticflow/slide-designer-frontend
```

### Option B: Direct Import (Development/Monorepo)

```bash
# Update your-nextjs-app/tsconfig.json
```

```json
{
  "compilerOptions": {
    "paths": {
      "@/lib/backend/*": ["../src/slide-designer/frontend-integration/*"]
    }
  }
}
```

### Option C: HTTP API (Microservices)

```bash
# 1. Create backend API server
# 2. Update backend-client.ts to use fetch
# 3. Configure API endpoints
```

## ✅ Step 3: Setup React Query Provider

**Create:** `app/providers.tsx`

```tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

**Update:** `app/layout.tsx`

```tsx
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

**Verify:**
```bash
# Start dev server
npm run dev

# Check browser console - should see no React Query errors
```

## ✅ Step 4: Create Backend Initializer

**Create:** `components/BackendInitializer.tsx`

```tsx
'use client';

import { useBackendInitialization } from '@/lib/backend/hooks/use-backend';

export function BackendInitializer({ children }) {
  const { data, isLoading, error } = useBackendInitialization();

  if (isLoading) {
    return <div>Initializing Backend...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return <>{children}</>;
}
```

**Update:** `app/layout.tsx`

```tsx
import { Providers } from './providers';
import { BackendInitializer } from '@/components/BackendInitializer';

export default function RootLayout({ children }) {
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
```

**Verify:**
```bash
# Start dev server
npm run dev

# Open http://localhost:3000
# Should see "Initializing Backend..." then your app
```

## ✅ Step 5: Test Basic Integration

**Create:** `app/test/page.tsx`

```tsx
'use client';

import { useGeneratePresentation, useBackendHealth } from '@/lib/backend/hooks/use-backend';

export default function TestPage() {
  const { mutate, isPending } = useGeneratePresentation();
  const { data: health } = useBackendHealth();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Backend Integration Test</h1>

      {/* Health Status */}
      <div className="mb-6">
        <h2 className="text-xl mb-2">Health Status</h2>
        {health && (
          <div>
            <p>Overall: {health.overallHealth}</p>
            <p>P0: {health.p0.summary.ready}/{health.p0.summary.total}</p>
            {health.p1 && <p>P1: {health.p1.summary.ready}/{health.p1.summary.total}</p>}
            {health.p2 && <p>P2: {health.p2.summary.ready}/{health.p2.summary.total}</p>}
          </div>
        )}
      </div>

      {/* Test Button */}
      <button
        onClick={() => mutate({ topic: 'Test', slideCount: 5 })}
        disabled={isPending}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {isPending ? 'Generating...' : 'Test Generate'}
      </button>
    </div>
  );
}
```

**Verify:**
```bash
# Open http://localhost:3000/test
# Should see health status
# Click "Test Generate" - should work or show proper error
```

## ✅ Step 6: Type Checking

```bash
# Run TypeScript compiler
npm run typecheck

# Should show no errors in integration files
```

**Expected:** No type errors related to backend integration.

## ✅ Step 7: Verify All Features

### Backend Ready
- [ ] `useBackendInitialization()` succeeds
- [ ] `useBackendReady()` returns true
- [ ] `useBackendHealth()` returns health report

### P0 Features
- [ ] `useP0Feature('grid-layout')` works
- [ ] `useP0Health()` returns healthy status

### P1 Features (if enabled)
- [ ] `useP1Feature('analytics')` works (if available)
- [ ] `useEnableP1Feature()` / `useDisableP1Feature()` work

### P2 Features (if enabled)
- [ ] `useP2Feature('voice-narration')` works (if available)
- [ ] `useEnableP2Feature()` / `useDisableP2Feature()` work

### Presentation Generation
- [ ] `useGeneratePresentation()` successfully generates slides
- [ ] Error handling works correctly
- [ ] Loading states display properly

## ✅ Step 8: Performance Check

### React Query DevTools
```bash
# Open http://localhost:3000
# Press Ctrl+Shift+R to open React Query DevTools
# Check:
```

- [ ] Queries are cached properly
- [ ] Stale-while-revalidate works
- [ ] Refetching happens as configured
- [ ] No duplicate queries

### Network
```bash
# Open browser DevTools → Network tab
# Check:
```

- [ ] No unnecessary requests
- [ ] Requests complete in reasonable time
- [ ] Retries work on failures

## ✅ Step 9: Error Handling Test

**Test scenarios:**

```tsx
// Test timeout
const { mutate } = useGeneratePresentation();
mutate({ topic: 'Test' }, { timeout: 1 }); // Should timeout

// Test validation error
mutate({ topic: '', slideCount: -1 }); // Should fail validation

// Test cancelation
const controller = new AbortController();
backendClient.generatePresentation(
  { topic: 'Test' },
  { signal: controller.signal }
);
controller.abort(); // Should cancel
```

- [ ] Timeout errors handled gracefully
- [ ] Validation errors show proper message
- [ ] Cancelation works without errors
- [ ] Error codes are correct

## ✅ Step 10: Build Test

```bash
# Build for production
npm run build

# Should build without errors
```

**Check for:**
- [ ] No TypeScript errors
- [ ] No missing dependencies
- [ ] Bundle size is reasonable
- [ ] No runtime errors in build output

## 🎉 Installation Complete!

All checks passed? You're ready to start building!

## 📚 Next Steps

1. **Read the Documentation**
   - `/home/user/agenticflow/docs/slide-designer/API_CLIENT_GUIDE.md`
   - Comprehensive guide with examples

2. **Check the Examples**
   - `/home/user/agenticflow/src/slide-designer/frontend-integration/examples/nextjs-app-example.tsx`
   - Complete Next.js app implementation

3. **Build Your Features**
   - Presentation generator UI
   - Health monitoring dashboard
   - Feature toggles
   - Presentation viewer

## 🐛 Troubleshooting

### "Cannot find module '@/lib/backend'"

**Fix:** Check TypeScript paths in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### "Backend not initialized" error

**Fix:** Ensure `BackendInitializer` wraps your app in `layout.tsx`

### Type errors with Zod

**Fix:** Update Zod to latest version:
```bash
npm install zod@latest
```

### React Query not caching

**Fix:** Check provider setup in `app/providers.tsx`

## 📞 Support

- **Documentation:** `/docs/slide-designer/API_CLIENT_GUIDE.md`
- **Examples:** `/src/slide-designer/frontend-integration/examples/`
- **Types:** `/src/slide-designer/frontend-integration/types/backend.ts`

---

**Last Updated:** 2025-11-09
**Version:** 1.0.0

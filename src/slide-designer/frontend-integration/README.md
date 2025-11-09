# Slide Designer Frontend Integration

Production-ready API client for integrating Next.js frontend with the TypeScript slide-designer backend.

## Features

- ✅ **Zero `any` types** - Complete TypeScript safety
- ✅ **Automatic retry** - Exponential backoff for failed requests
- ✅ **Request cancelation** - AbortController support
- ✅ **Runtime validation** - Zod schemas for all data
- ✅ **React Query integration** - Automatic caching and refetching
- ✅ **Error handling** - Consistent error envelopes
- ✅ **Health monitoring** - Real-time system status
- ✅ **Feature flags** - Runtime P1/P2 feature toggling

## Quick Start

### 1. Install Dependencies

```bash
npm install zod @tanstack/react-query
```

### 2. Setup React Query Provider

```tsx
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### 3. Initialize Backend

```tsx
// app/page.tsx
import { useBackendInitialization } from '@/lib/backend/hooks/use-backend';

export default function App() {
  const { data, isLoading, error } = useBackendInitialization();

  if (isLoading) return <div>Initializing...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Backend Ready!</div>;
}
```

### 4. Generate Presentation

```tsx
import { useGeneratePresentation } from '@/lib/backend/hooks/use-backend';

function Generator() {
  const { mutate, isPending } = useGeneratePresentation();

  const handleClick = () => {
    mutate({
      topic: 'AI in Healthcare',
      slideCount: 10,
      tone: 'formal',
    });
  };

  return (
    <button onClick={handleClick} disabled={isPending}>
      {isPending ? 'Generating...' : 'Generate'}
    </button>
  );
}
```

## Directory Structure

```
frontend-integration/
├── api/
│   └── backend-client.ts      # Main API client with retry/timeout
├── hooks/
│   └── use-backend.ts         # React Query hooks
├── schemas/
│   └── backend.ts             # Zod validation schemas
├── types/
│   └── backend.ts             # TypeScript type definitions
├── index.ts                   # Main exports
└── README.md                  # This file
```

## API Client

### Direct Usage

```typescript
import { backendClient } from '@/lib/backend';

// Initialize
await backendClient.initialize();

// Generate presentation
const result = await backendClient.generatePresentation({
  topic: 'Machine Learning',
  slideCount: 15,
  tone: 'technical',
});

// Access P0 features
const gridLayout = backendClient.p0.getFeature('grid-layout');

// Access P1 features (if enabled)
if (backendClient.p1.isFeatureAvailable('analytics')) {
  const analytics = backendClient.p1.getFeature('analytics');
}

// Check health
const health = await backendClient.getHealthReport();
console.log('System health:', health.overallHealth);

// Cancel pending requests
backendClient.cancelAll();
```

### Configuration

```typescript
const result = await backendClient.generatePresentation(
  { topic: 'AI' },
  {
    timeout: 60000,      // 60 seconds
    retries: 2,          // 2 retry attempts
    validateInput: true, // Validate with Zod
    validateOutput: true,
  }
);
```

## React Hooks

### Initialization

```tsx
const { data, isLoading, error } = useBackendInitialization();
```

### Presentation Generation

```tsx
const { mutate, isPending, data, error } = useGeneratePresentation();

mutate({
  topic: 'AI',
  slideCount: 10,
  tone: 'formal',
});
```

### P0 Features

```tsx
// Get feature instance
const { data: gridLayout } = useP0Feature('grid-layout');

// Check P0 health
const { data: isHealthy } = useP0Health();
```

### P1 Features

```tsx
// Get P1 feature
const { data: analytics } = useP1Feature('analytics');

// Enable/disable features
const { mutate: enable } = useEnableP1Feature();
const { mutate: disable } = useDisableP1Feature();

enable('analytics');
disable('analytics');
```

### P2 Features

```tsx
// Get P2 feature
const { data: voice } = useP2Feature('voice-narration');

// Enable/disable features
const { mutate: enable } = useEnableP2Feature();
enable('voice-narration');
```

### Health Monitoring

```tsx
// Comprehensive health report (auto-refreshes every 30s)
const { data: health } = useBackendHealth();

console.log(`P0: ${health.p0.summary.ready}/${health.p0.summary.total}`);
console.log(`P1: ${health.p1?.summary.ready}/${health.p1?.summary.total}`);

// Simple health check
const { data: isHealthy } = useIsBackendHealthy();
```

## Type Safety

### Full Type Inference

```typescript
import type { SlideGenerationRequest } from '@/lib/backend';

const request: SlideGenerationRequest = {
  topic: 'AI',
  slideCount: 10,
  tone: 'formal', // Autocomplete: 'formal' | 'casual' | 'technical'
};
```

### Runtime Validation

```typescript
import { SlideGenerationRequestSchema } from '@/lib/backend';

const result = SlideGenerationRequestSchema.safeParse(userInput);

if (!result.success) {
  console.error('Validation errors:', result.error.errors);
}
```

## Error Handling

### Error Envelope

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
  featureId?: string;
}
```

### Error Codes

- `BACKEND_NOT_INITIALIZED` - Backend not initialized
- `VALIDATION_ERROR` - Input/output validation failed
- `REQUEST_TIMEOUT` - Request exceeded timeout
- `REQUEST_CANCELED` - Request was canceled
- `BACKEND_ERROR` - Backend operation failed
- `UNKNOWN_ERROR` - Unexpected error

### Handle Errors

```tsx
const { error } = useGeneratePresentation();

if (error) {
  switch (error.code) {
    case 'VALIDATION_ERROR':
      // Handle validation error
      break;
    case 'REQUEST_TIMEOUT':
      // Handle timeout
      break;
    default:
      // Generic error
  }
}
```

## Advanced Usage

### Request Cancelation

```tsx
const controller = new AbortController();

backendClient.generatePresentation(
  { topic: 'AI' },
  { signal: controller.signal }
);

// Cancel on unmount
useEffect(() => {
  return () => controller.abort();
}, []);
```

### Custom Caching

```tsx
const { data } = useP0Feature('grid-layout', {
  staleTime: 10 * 60 * 1000, // 10 minutes
  cacheTime: 30 * 60 * 1000, // 30 minutes
});
```

### Prefetching

```tsx
import { queryClient, queryKeys } from '@/lib/backend';

await queryClient.prefetchQuery({
  queryKey: queryKeys.health,
  queryFn: () => backendClient.getHealthReport(),
});
```

## Integration Options

### Option 1: Shared Package (Recommended)

Create `packages/slide-designer-client` and import in both projects.

### Option 2: Direct Import (Development)

Use TypeScript paths to import directly from backend.

### Option 3: HTTP API (Production)

Create REST endpoints and update client to use `fetch`.

See [API_CLIENT_GUIDE.md](/home/user/agenticflow/docs/slide-designer/API_CLIENT_GUIDE.md) for detailed setup instructions.

## Examples

See `/docs/slide-designer/API_CLIENT_GUIDE.md` for comprehensive examples:

- Presentation generation
- Health dashboard
- Feature toggles
- Error handling
- Testing
- And more...

## Architecture

```
Frontend (React/Next.js)
    ↓
React Hooks (use-backend.ts)
    ↓
API Client (backend-client.ts)
    ↓
Type Validation (Zod schemas)
    ↓
Backend Integration (SlideDesignerIntegration)
    ↓
P0/P1/P2 Features
```

## TypeScript Configuration

Ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Testing

### Mock Client

```typescript
// __mocks__/backend-client.ts
export const backendClient = {
  initialize: jest.fn(),
  generatePresentation: jest.fn(),
  isReady: jest.fn().mockReturnValue(true),
};
```

### Test Component

```tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

test('renders correctly', () => {
  render(
    <QueryClientProvider client={queryClient}>
      <YourComponent />
    </QueryClientProvider>
  );
});
```

## Performance

- **Automatic caching** - React Query handles all caching
- **Stale-while-revalidate** - Show cached data while refetching
- **Request deduplication** - Multiple identical requests merged
- **Background refetching** - Keep data fresh automatically
- **Lazy loading** - P2 features loaded on demand

## Support

- **Documentation**: See `/docs/slide-designer/API_CLIENT_GUIDE.md`
- **Types**: Check `types/backend.ts` for complete API reference
- **Schemas**: Review `schemas/backend.ts` for validation rules
- **Examples**: Browse `/docs/slide-designer/API_CLIENT_GUIDE.md`

## License

Same as parent project.

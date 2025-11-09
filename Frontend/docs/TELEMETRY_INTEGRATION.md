# Telemetry Integration Guide

## Quick Start

### 1. Wrap Your App with Error Boundary

```tsx
// app/layout.tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

### 2. Use the API Client

The backend client automatically tracks all API calls:

```tsx
import { backendClient } from '@/api/backend-client';

// Initialize backend
await backendClient.initialize();
// ✅ Automatically tracked: /api/initialize with timing

// Make API calls
const result = await backendClient.generatePresentation({ topic: 'AI' });
// ✅ Automatically tracked: /api/presentations/generate with timing and success/failure
```

### 3. Track User Actions

```tsx
import { trackBreadcrumb, trackPresentationCreated } from '@/lib/telemetry/breadcrumbs';

// Generic action
trackBreadcrumb('button_clicked', { buttonId: 'export' });

// Specific events
trackPresentationCreated('pres-123', { templateId: 'default' });
```

### 4. Track Performance

```tsx
import { PerformanceMonitor } from '@/lib/telemetry/performance';

// Track component render
const RenderTime = () => {
  const startTime = performance.now();

  useEffect(() => {
    const duration = performance.now() - startTime;
    PerformanceMonitor.trackRender('MyComponent', duration);
  }, []);

  return <div>...</div>;
};

// Track async operations
const result = await PerformanceMonitor.measure('data-fetch', async () => {
  return await fetchData();
});
```

### 5. Access Telemetry Data (Dev Only)

```tsx
// Add to your dev tools page
import { TelemetryDashboard } from '@/components/TelemetryDashboard';

export default function DevToolsPage() {
  return <TelemetryDashboard />;
}
```

## Features

### ✅ Automatic Tracking

- **API Calls**: All backend client calls are automatically timed and logged
- **Errors**: All errors caught by error boundary are logged with stack traces
- **Web Vitals**: LCP, FID, CLS, TTFB, FCP automatically tracked
- **Navigation**: Page views tracked automatically

### ✅ Manual Tracking

- **User Actions**: Track button clicks, form submissions, etc.
- **Custom Performance**: Track specific operations
- **Breadcrumbs**: Track user journey through the app

### ✅ Zero Performance Impact

- Batched sends every 5 seconds
- Memory-bounded (max 1000 events)
- No blocking operations
- Silent failures (doesn't crash app)

### ✅ Developer Experience

- Real-time dashboard
- Export logs as JSON
- User journey visualization
- Error stack traces in dev mode

## API Reference

### Telemetry Service

```typescript
import { telemetry } from '@/lib/telemetry/telemetry';

// Track API call
telemetry.trackAPICall('/api/endpoint', 150, true);

// Track user action
telemetry.trackUserAction('button_clicked', { buttonId: 'save' });

// Track error
telemetry.trackError(new Error('Something failed'), 'User action context');

// Track performance
telemetry.trackPerformance('custom_metric', 123);

// Get statistics
const stats = telemetry.getStats();

// Export logs
const logs = telemetry.exportLogs();
```

### Breadcrumbs

```typescript
import {
  trackBreadcrumb,
  trackPresentationCreated,
  trackSlideEdited,
  trackExportStarted,
  getUserJourney,
} from '@/lib/telemetry/breadcrumbs';

// Track events
trackPresentationCreated('pres-123');
trackSlideEdited('slide-456');
trackExportStarted('pptx');

// Get journey
const journey = getUserJourney();
```

### Performance Monitor

```typescript
import { PerformanceMonitor } from '@/lib/telemetry/performance';

// Track component render
PerformanceMonitor.trackRender('ComponentName', 45);

// Track route change
PerformanceMonitor.trackRouteChange('/dashboard', 120);

// Measure operation
const result = await PerformanceMonitor.measure('operation-name', async () => {
  return await doWork();
});
```

## Production Setup

### 1. Backend Endpoint

Create an API endpoint to receive telemetry:

```typescript
// app/api/telemetry/route.ts
export async function POST(request: Request) {
  const { events } = await request.json();

  // Store events in database/analytics service
  await storeTelemetryEvents(events);

  return new Response('OK', { status: 200 });
}
```

### 2. Update Telemetry Service

Update `/home/user/agenticflow/Frontend/lib/telemetry/telemetry.ts`:

```typescript
private async sendToBackend(events: TelemetryEvent[]) {
  try {
    await fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
    });
  } catch (error) {
    // Silent fail
  }
}
```

### 3. Configure Alerts

Set up alerts based on thresholds from the [Developer Runbook](./DEVELOPER_RUNBOOK.md):

- API success rate < 95% → Warning
- API success rate < 80% → Critical
- Average API time > 500ms → Warning
- Error rate > 1% → Warning

## Best Practices

### Do's

✅ Track important user actions
✅ Track all API calls (automatic)
✅ Track custom performance metrics for slow operations
✅ Use breadcrumbs for user journey tracking
✅ Export logs when reporting bugs

### Don'ts

❌ Don't track personally identifiable information (PII)
❌ Don't track sensitive data (passwords, tokens)
❌ Don't track every single click (only meaningful actions)
❌ Don't forget to test telemetry in development
❌ Don't ignore telemetry data when debugging

## Debugging Checklist

When investigating an issue:

1. ✅ Check error logs for exceptions
2. ✅ Review user journey (breadcrumbs)
3. ✅ Check API call success rates
4. ✅ Review performance metrics
5. ✅ Export full logs if needed

## Examples

### Track Form Submission

```tsx
import { trackBreadcrumb } from '@/lib/telemetry/breadcrumbs';

function MyForm() {
  const handleSubmit = async (data) => {
    trackBreadcrumb('form_submitted', { formId: 'presentation-create' });

    try {
      await backendClient.generatePresentation(data);
      // ✅ API call automatically tracked

      trackBreadcrumb('presentation_created');
    } catch (error) {
      // ✅ Error automatically tracked by error boundary
      trackBreadcrumb('form_error', { errorMessage: error.message });
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Track Route Navigation

```tsx
import { PerformanceMonitor } from '@/lib/telemetry/performance';
import { trackBreadcrumb } from '@/lib/telemetry/breadcrumbs';

function useRouteTracking() {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      PerformanceMonitor.trackRouteChange(window.location.pathname, duration);
      trackBreadcrumb('page_view', { path: window.location.pathname });
    };
  }, []);
}
```

### Track Feature Usage

```tsx
import { trackFeatureUsed } from '@/lib/telemetry/breadcrumbs';

function ExportButton() {
  const handleExport = () => {
    trackFeatureUsed('export_pptx', { slideCount: 10 });
    // ... export logic
  };

  return <button onClick={handleExport}>Export</button>;
}
```

## Troubleshooting

### Telemetry not working in development

**Solution:** Check browser console for initialization errors. Telemetry is designed to fail silently, but errors are logged in dev mode.

### Backend client shows "Telemetry not available"

**Solution:** This is expected in Node.js environments. Telemetry only works in browser (frontend).

### Events not appearing in dashboard

**Solution:**
1. Ensure you're on a page with `<TelemetryDashboard />`
2. Check that events are being created: `telemetry.getEvents()`
3. Wait for batch interval (5 seconds)

### High memory usage

**Solution:** Telemetry is capped at 1000 events. If you're seeing high memory, check for memory leaks elsewhere in your app.

## Related Documentation

- [Developer Runbook](./DEVELOPER_RUNBOOK.md) - Debugging workflows and incident response
- [Backend Client API](/src/slide-designer/frontend-integration/api/backend-client.ts) - API client documentation
- [Error Boundary](/Frontend/components/ErrorBoundary.tsx) - Error handling

## Support

For questions or issues:
- Check the [Developer Runbook](./DEVELOPER_RUNBOOK.md)
- Review telemetry dashboard in development
- Export logs and share with team

---

**Last Updated:** 2025-01-XX
**Version:** 1.0.0

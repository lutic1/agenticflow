# Developer Runbook: Slide Designer Frontend-Backend Integration

## Overview

This runbook provides comprehensive guidance for debugging, monitoring, and troubleshooting the slide designer frontend-backend integration.

**Goal:** Answer "what failed, where, how long" from logs alone.

## Table of Contents

1. [Accessing Telemetry Data](#accessing-telemetry-data)
2. [Common Error Codes](#common-error-codes)
3. [Performance Benchmarks](#performance-benchmarks)
4. [Debugging Workflows](#debugging-workflows)
5. [Telemetry Query Examples](#telemetry-query-examples)
6. [Alert Thresholds](#alert-thresholds)
7. [Incident Response](#incident-response)

## Accessing Telemetry Data

### Development Environment

#### In-Browser Console
```javascript
// Access telemetry service
import { telemetry } from '@/lib/telemetry/telemetry';

// Get all events
telemetry.getEvents();

// Filter by type
telemetry.getEvents({ type: 'api_call' });
telemetry.getEvents({ type: 'error' });

// Get statistics
telemetry.getStats();

// Export logs
const logs = telemetry.exportLogs();
console.log(logs);
```

#### Telemetry Dashboard
- Navigate to `/dev/telemetry` (development only)
- View real-time metrics, API performance, errors, and user journey
- Export logs as JSON

#### User Journey Breadcrumbs
```javascript
import { getUserJourney, getBreadcrumbs } from '@/lib/telemetry/breadcrumbs';

// Get formatted journey
console.log(getUserJourney());

// Get breadcrumb array
console.log(getBreadcrumbs());
```

### Production Environment

#### Log Export on Error
- When error boundary triggers, users can download logs
- Logs include full telemetry events and user journey
- Location: Error boundary UI → "Download Logs" button

#### Backend Telemetry Endpoint
```bash
# Telemetry events are batched and sent every 5 seconds
POST /api/telemetry
{
  "events": [...]
}
```

## Common Error Codes

### Backend Client Errors

| Code | Message | Cause | Solution |
|------|---------|-------|----------|
| `BACKEND_NOT_INITIALIZED` | Backend not initialized | `initialize()` not called | Call `backendClient.initialize()` before operations |
| `VALIDATION_ERROR` | Invalid request/response | Schema validation failed | Check request format against schema |
| `REQUEST_TIMEOUT` | Request timed out | API took >30s | Check backend health, network latency |
| `REQUEST_CANCELED` | Request was canceled | User canceled or aborted | Expected behavior, no action needed |
| `BACKEND_ERROR` | Backend error | Backend threw exception | Check backend logs for details |
| `UNKNOWN_ERROR` | Unknown error | Unexpected error type | Check error metadata for details |

### Feature Availability Errors

| Code | Message | Cause | Solution |
|------|---------|-------|----------|
| `P0_FEATURE_NOT_AVAILABLE` | P0 feature not available | Feature failed to initialize | Check P0 health report |
| `P1_FEATURE_NOT_ENABLED` | P1 feature not enabled | Feature disabled in config | Enable via `client.p1.enableFeature()` |
| `P2_FEATURE_NOT_ENABLED` | P2 feature not enabled | Feature disabled in config | Enable via `client.p2.enableFeature()` |

### Network Errors

| Code | Message | Cause | Solution |
|------|---------|-------|----------|
| `NETWORK_ERROR` | Network request failed | Network unavailable | Check internet connection |
| `CORS_ERROR` | CORS policy blocked | Missing CORS headers | Configure backend CORS |
| `DNS_ERROR` | DNS lookup failed | Invalid hostname | Check API base URL |

## Performance Benchmarks

### API Call Timings

| Endpoint | Target (P50) | Warning (P95) | Critical (P99) |
|----------|--------------|---------------|----------------|
| `/api/presentations/generate` | <500ms | <2000ms | <5000ms |
| `/api/presentations/:id` | <200ms | <500ms | <1000ms |
| `/api/health` | <100ms | <300ms | <500ms |
| `/api/features/p0` | <150ms | <400ms | <800ms |
| `/api/features/p1` | <150ms | <400ms | <800ms |
| `/api/features/p2` | <150ms | <400ms | <800ms |

### Core Web Vitals

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP (Largest Contentful Paint) | ≤2500ms | ≤4000ms | >4000ms |
| FID (First Input Delay) | ≤100ms | ≤300ms | >300ms |
| CLS (Cumulative Layout Shift) | ≤0.1 | ≤0.25 | >0.25 |
| TTFB (Time to First Byte) | ≤800ms | ≤1800ms | >1800ms |
| FCP (First Contentful Paint) | ≤1800ms | ≤3000ms | >3000ms |

## Debugging Workflows

### 1. API Call Debugging

**Symptom:** API calls failing or timing out

**Steps:**
1. Open telemetry dashboard (`/dev/telemetry`)
2. Navigate to "API" tab
3. Check:
   - Success rate (should be >95%)
   - Average response time (should be <500ms)
   - Recent failures
4. For specific endpoint:
   ```javascript
   const apiCalls = telemetry.getEvents({ type: 'api_call', action: '/api/presentations/generate' });
   console.log(apiCalls);
   ```
5. Check error metadata for details:
   ```javascript
   const errors = telemetry.getEvents({ type: 'error', label: 'API call failed: /api/...' });
   console.log(errors[0].metadata);
   ```

### 2. User Journey Analysis

**Symptom:** User reported issue, need to understand context

**Steps:**
1. Get user's journey:
   ```javascript
   import { getUserJourney } from '@/lib/telemetry/breadcrumbs';
   console.log(getUserJourney());
   ```
2. Look for patterns before error:
   - What actions did user take?
   - Which features were used?
   - Any repeated attempts?
3. Cross-reference with telemetry events:
   ```javascript
   const stats = telemetry.getStats();
   console.log(stats.userActions.byAction);
   ```

### 3. Performance Investigation

**Symptom:** Application feels slow

**Steps:**
1. Check Core Web Vitals:
   ```javascript
   const perfEvents = telemetry.getEvents({ type: 'performance' });
   const webVitals = perfEvents.filter(e => ['LCP', 'FID', 'CLS', 'TTFB', 'FCP'].includes(e.action));
   console.log(webVitals);
   ```
2. Identify slow API calls:
   ```javascript
   const slowCalls = telemetry.getEvents({ type: 'api_call' })
     .filter(e => (e.value || 0) > 1000)
     .sort((a, b) => (b.value || 0) - (a.value || 0));
   console.log(slowCalls);
   ```
3. Check component render times:
   ```javascript
   const renderEvents = telemetry.getEvents({ type: 'performance' })
     .filter(e => e.action.startsWith('render_'));
   console.log(renderEvents);
   ```

### 4. Error Investigation

**Symptom:** Error occurred, need root cause

**Steps:**
1. Get all errors:
   ```javascript
   const errors = telemetry.getEvents({ type: 'error' });
   console.log(errors);
   ```
2. Group by error type:
   ```javascript
   const stats = telemetry.getStats();
   console.log(stats.errors.byType);
   ```
3. For specific error:
   ```javascript
   const error = errors[0];
   console.log('Error:', error.action);
   console.log('Message:', error.metadata.message);
   console.log('Stack:', error.metadata.stack);
   console.log('Context:', error.label);
   ```
4. Get user journey before error:
   ```javascript
   const errorTime = error.timestamp;
   const breadcrumbs = getBreadcrumbs();
   const beforeError = breadcrumbs.filter(b => b.timestamp < errorTime);
   console.log(beforeError);
   ```

## Telemetry Query Examples

### Find all failed API calls
```javascript
const failedAPICalls = telemetry.getEvents({ type: 'api_call', label: 'error' });
```

### Calculate API success rate
```javascript
const stats = telemetry.getStats();
console.log(`Success rate: ${stats.apiCalls.successRate}%`);
```

### Find slowest API endpoint
```javascript
const apiCalls = telemetry.getEvents({ type: 'api_call' });
const byEndpoint = apiCalls.reduce((acc, call) => {
  if (!acc[call.action]) acc[call.action] = [];
  acc[call.action].push(call.value || 0);
  return acc;
}, {});

const avgByEndpoint = Object.entries(byEndpoint).map(([endpoint, times]) => ({
  endpoint,
  avg: times.reduce((a, b) => a + b, 0) / times.length,
  count: times.length
})).sort((a, b) => b.avg - a.avg);

console.log(avgByEndpoint);
```

### Export error logs for support
```javascript
const errorLogs = telemetry.getEvents({ type: 'error' }).map(e => ({
  timestamp: new Date(e.timestamp).toISOString(),
  error: e.action,
  message: e.metadata?.message,
  context: e.label,
}));
console.log(JSON.stringify(errorLogs, null, 2));
```

## Alert Thresholds

### Critical Alerts (Immediate Action Required)

- API success rate <80%
- Average API time >2000ms
- Error rate >5% of total events
- Any P0 feature unavailable
- LCP >4000ms

### Warning Alerts (Investigation Needed)

- API success rate <95%
- Average API time >500ms
- Error rate >1% of total events
- Any P1 feature unavailable
- FID >300ms
- CLS >0.25

### Informational Alerts (Monitor)

- API success rate <99%
- Average API time >200ms
- Any P2 feature unavailable
- TTFB >1800ms

## Incident Response

### Level 1: Critical Production Issue

**Examples:** Backend completely down, data loss, security breach

**Response:**
1. **Immediate** (0-5 min):
   - Alert on-call engineer
   - Enable maintenance mode if needed
   - Collect telemetry data:
     ```javascript
     const logs = telemetry.exportLogs();
     // Send to incident channel
     ```

2. **Assessment** (5-15 min):
   - Check backend health: `backendClient.getHealthReport()`
   - Check error rate: `telemetry.getStats().errors`
   - Identify scope: How many users affected?

3. **Mitigation** (15-30 min):
   - Apply hotfix or rollback
   - Monitor recovery via telemetry dashboard
   - Verify success rate returns to >95%

4. **Post-Incident** (24 hours):
   - Root cause analysis using telemetry logs
   - Create incident report
   - Update runbook with learnings

### Level 2: Service Degradation

**Examples:** Slow API, intermittent errors, feature unavailable

**Response:**
1. **Assessment**:
   - Check performance metrics
   - Identify affected endpoints
   - Check user journey for patterns

2. **Investigation**:
   - Review recent deployments
   - Check resource utilization
   - Analyze slow queries

3. **Resolution**:
   - Apply fix
   - Monitor metrics for improvement
   - Document findings

### Level 3: User-Reported Issue

**Examples:** Specific feature not working, UI glitch

**Response:**
1. **Reproduction**:
   - Request telemetry export from user
   - Review user journey
   - Attempt to reproduce

2. **Debugging**:
   - Use debugging workflows (see above)
   - Check error logs
   - Review breadcrumbs

3. **Fix**:
   - Create bug ticket
   - Apply fix
   - Verify with telemetry

## Best Practices

### For Developers

1. **Always track important user actions:**
   ```typescript
   import { trackBreadcrumb } from '@/lib/telemetry/breadcrumbs';
   trackBreadcrumb('feature_used', { featureId: 'slide-export' });
   ```

2. **Track custom performance metrics:**
   ```typescript
   import { PerformanceMonitor } from '@/lib/telemetry/performance';
   await PerformanceMonitor.measure('complex-calculation', async () => {
     // Your code here
   });
   ```

3. **Use error boundary for all routes:**
   ```tsx
   <ErrorBoundary>
     <YourComponent />
   </ErrorBoundary>
   ```

4. **Check telemetry before releasing:**
   - Review API success rates
   - Check performance metrics
   - Verify no memory leaks

### For Operations

1. **Daily health check:**
   - Review telemetry dashboard
   - Check alert thresholds
   - Verify Core Web Vitals

2. **Weekly analysis:**
   - Trend analysis on API performance
   - Error pattern identification
   - User journey optimization opportunities

3. **Monthly reporting:**
   - Performance benchmarks
   - Feature usage statistics
   - Reliability metrics

## Additional Resources

- [Telemetry API Documentation](./TELEMETRY_API.md)
- [Backend Client API](../api/backend-client.ts)
- [Error Handling Guide](./ERROR_HANDLING.md)
- [Performance Optimization](./PERFORMANCE.md)

## Support Contacts

- **On-call Engineer:** #oncall-engineering
- **Backend Team:** #team-backend
- **Frontend Team:** #team-frontend
- **DevOps Team:** #team-devops

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-01-XX | 1.0.0 | Initial runbook creation |

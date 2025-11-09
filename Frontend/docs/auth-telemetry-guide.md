# Authentication Telemetry Integration Guide

## Overview

This guide explains how to integrate comprehensive telemetry tracking into your authentication system. The auth telemetry module provides tracking for all authentication flows including sign in/out, token management, session lifecycle, and protected route access.

## Quick Start

```typescript
import { useAuthTelemetry } from '@/lib/telemetry/auth-telemetry';

function SignInButton() {
  const { trackSignIn } = useAuthTelemetry();

  const handleSignIn = async () => {
    trackSignIn.initiated('google');

    try {
      const user = await signInWithGoogle();
      trackSignIn.success('google', user.id);
    } catch (error) {
      trackSignIn.failed('google', 'provider_error', error.message);
    }
  };

  return <button onClick={handleSignIn}>Sign In</button>;
}
```

## Events Tracked

### Sign In Events

| Event | When to Track | Required Metadata |
|-------|---------------|-------------------|
| `auth.sign_in.initiated` | User clicks sign-in button | `provider` |
| `auth.sign_in.success` | Authentication succeeds | `provider`, `userId` |
| `auth.sign_in.failed` | Authentication fails | `provider`, `errorType`, `errorMessage` |

### Sign Out Events

| Event | When to Track | Required Metadata |
|-------|---------------|-------------------|
| `auth.sign_out.initiated` | User clicks sign-out button | None |
| `auth.sign_out.success` | Session cleared successfully | `sessionDuration` (optional) |

### Token Management

| Event | When to Track | Required Metadata |
|-------|---------------|-------------------|
| `auth.token.refresh_success` | Token automatically refreshed | None |
| `auth.token.refresh_failed` | Token refresh fails | `errorType`, `errorMessage` |

### Session Lifecycle

| Event | When to Track | Required Metadata |
|-------|---------------|-------------------|
| `auth.session.started` | New session created | `userId` |
| `auth.session.restored` | Session restored on page load | `userId` |
| `auth.session.expired` | Session expires | `sessionDuration` (optional) |

### Protected Routes

| Event | When to Track | Required Metadata |
|-------|---------------|-------------------|
| `auth.protected_route.blocked` | Unauthorized access attempt | `attemptedPath`, `redirectTo` |

## Integration Points

### 1. Google OAuth Provider

```typescript
// In your Google OAuth component
import { trackSignInInitiated, trackSignInSuccess, trackSignInFailed } from '@/lib/telemetry/auth-telemetry';

export function GoogleOAuthButton() {
  const handleGoogleSignIn = async () => {
    // Track initiation
    trackSignInInitiated('google', {
      redirectTo: window.location.pathname,
    });

    try {
      const response = await fetch('/api/auth/google/signin', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('OAuth failed');

      const { user, token } = await response.json();

      // Track success
      trackSignInSuccess('google', user.id, {
        redirectTo: window.location.pathname,
      });

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      // Track failure
      trackSignInFailed(
        'google',
        'provider_error',
        error.message,
        { attemptNumber: 1 }
      );
    }
  };

  return <button onClick={handleGoogleSignIn}>Sign in with Google</button>;
}
```

### 2. Session Management

```typescript
// In your session management hook
import {
  trackSessionStarted,
  trackSessionRestored,
  trackSessionExpired,
  trackSignOutInitiated,
  trackSignOutSuccess,
} from '@/lib/telemetry/auth-telemetry';

export function useSession() {
  const [sessionStartTime] = useState(Date.now());

  // On app initialization
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (!response.ok) return;

        const { user } = await response.json();

        // Track restoration
        trackSessionRestored(user.id, {
          provider: user.provider,
        });
      } catch (error) {
        console.log('No session to restore');
      }
    };

    restoreSession();
  }, []);

  // On successful sign in
  const onSignInSuccess = (user) => {
    trackSessionStarted(user.id, {
      provider: user.provider,
    });
  };

  // On session expiration
  const onSessionExpired = () => {
    const sessionDuration = Date.now() - sessionStartTime;

    trackSessionExpired(sessionDuration, {
      redirectTo: '/signin',
    });

    window.location.href = '/signin';
  };

  // On sign out
  const signOut = async () => {
    trackSignOutInitiated();

    await fetch('/api/auth/signout', { method: 'POST' });

    const sessionDuration = Date.now() - sessionStartTime;
    trackSignOutSuccess(sessionDuration);

    window.location.href = '/';
  };

  return { onSignInSuccess, onSessionExpired, signOut };
}
```

### 3. Token Refresh Handler

```typescript
// In your token refresh logic
import {
  trackTokenRefreshSuccess,
  trackTokenRefreshFailed,
  trackSessionExpired,
} from '@/lib/telemetry/auth-telemetry';

export class TokenManager {
  async refreshToken() {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Refresh failed');

      const { token, expiresIn } = await response.json();

      // Track success
      trackTokenRefreshSuccess();

      // Schedule next refresh
      this.scheduleRefresh(expiresIn);

      return token;
    } catch (error) {
      // Track failure
      trackTokenRefreshFailed('refresh_failed', error.message);

      // Track session expiration
      trackSessionExpired();

      // Redirect to sign in
      window.location.href = '/signin?reason=session_expired';
    }
  }
}
```

### 4. Protected Route Guard

```typescript
// In your route protection middleware
import { trackProtectedRouteBlocked } from '@/lib/telemetry/auth-telemetry';

export function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check');

        if (!response.ok) {
          // Track blocked access
          trackProtectedRouteBlocked(pathname, '/signin');

          // Redirect to sign in
          window.location.href = '/signin';
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        trackProtectedRouteBlocked(pathname, '/signin', {
          errorType: 'network_error',
        });

        window.location.href = '/signin';
      }
    };

    checkAuth();
  }, [pathname]);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return children;
}
```

## Using the React Hook

The `useAuthTelemetry` hook provides a clean API for tracking auth events:

```typescript
import { useAuthTelemetry } from '@/lib/telemetry/auth-telemetry';

function AuthComponent() {
  const {
    trackSignIn,
    trackSignOut,
    trackToken,
    trackSession,
    trackProtectedRoute,
    getMetrics,
    exportReport,
  } = useAuthTelemetry();

  // Sign in tracking
  trackSignIn.initiated('google');
  trackSignIn.success('google', userId);
  trackSignIn.failed('google', errorType, errorMessage);

  // Sign out tracking
  trackSignOut.initiated();
  trackSignOut.success(sessionDuration);

  // Token tracking
  trackToken.refreshSuccess();
  trackToken.refreshFailed(errorType, errorMessage);

  // Session tracking
  trackSession.started(userId);
  trackSession.restored(userId);
  trackSession.expired(sessionDuration);

  // Protected route tracking
  trackProtectedRoute.blocked(attemptedPath, redirectTo);

  // Get metrics
  const metrics = getMetrics();
  console.log('Auth metrics:', metrics);

  // Export report
  const report = exportReport();
  console.log(report);
}
```

## Viewing Metrics

### Get Auth Metrics

```typescript
import { getAuthMetrics } from '@/lib/telemetry/auth-telemetry';

const metrics = getAuthMetrics();

console.log('Sign-in conversion rate:', metrics.conversionRate);
console.log('Average session duration:', metrics.avgSessionDuration);
console.log('Errors by type:', metrics.errorsByType);
console.log('Sign-ins by provider:', metrics.signInsByProvider);
```

### Export Metrics Report

```typescript
import { exportAuthMetricsReport } from '@/lib/telemetry/auth-telemetry';

const report = exportAuthMetricsReport();

// Output:
// Auth Telemetry Report
// Generated: 2024-01-15T10:30:00.000Z
// =====================================
//
// Sign-In Metrics:
// - Total Attempts: 150
// - Successes: 142
// - Failures: 8
// - Conversion Rate: 94.67%
//
// Session Metrics:
// - Avg Session Duration: 45.32 minutes
// - Session Expirations: 3
//
// Token Management:
// - Refresh Successes: 284
// - Refresh Failures: 2
//
// Security:
// - Protected Route Blocks: 12
```

## Metrics Tracked

### Conversion Metrics
- **Sign-in Conversion Rate**: Percentage of initiated sign-ins that succeed
  - Formula: `(successful sign-ins / initiated sign-ins) × 100`
  - Target: > 90%

### Session Metrics
- **Average Session Duration**: Mean time users stay signed in
  - Calculated from session start to sign out/expiration
  - Useful for understanding user engagement

### Error Metrics
- **Errors by Type**: Breakdown of authentication errors
  - `invalid_credentials`: Wrong password/username
  - `network_error`: Connection issues
  - `provider_error`: OAuth provider failures
  - `token_expired`: Token expiration before refresh
  - `refresh_failed`: Token refresh failures

### Provider Metrics
- **Sign-ins by Provider**: Distribution across auth methods
  - `google`: Google OAuth
  - `github`: GitHub OAuth
  - `email`: Email/password

## Dashboard Integration

Create a telemetry dashboard to visualize auth metrics:

```typescript
import { useAuthTelemetry } from '@/lib/telemetry/auth-telemetry';
import { useEffect, useState } from 'react';

export function AuthTelemetryDashboard() {
  const { getMetrics } = useAuthTelemetry();
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(getMetrics());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (!metrics) return <div>Loading metrics...</div>;

  return (
    <div className="dashboard">
      <h2>Authentication Metrics</h2>

      <div className="metric-card">
        <h3>Sign-In Conversion</h3>
        <p className="metric-value">{metrics.conversionRate.toFixed(2)}%</p>
        <p className="metric-detail">
          {metrics.signInSuccesses} / {metrics.signInAttempts} attempts
        </p>
      </div>

      <div className="metric-card">
        <h3>Session Duration</h3>
        <p className="metric-value">
          {(metrics.avgSessionDuration / 1000 / 60).toFixed(1)} min
        </p>
      </div>

      <div className="metric-card">
        <h3>Token Refresh Success Rate</h3>
        <p className="metric-value">
          {(
            (metrics.tokenRefreshSuccesses /
              (metrics.tokenRefreshSuccesses + metrics.tokenRefreshFailures)) *
            100
          ).toFixed(2)}%
        </p>
      </div>

      <div className="errors">
        <h3>Error Breakdown</h3>
        <ul>
          {Object.entries(metrics.errorsByType).map(([type, count]) => (
            <li key={type}>
              {type}: {count}
            </li>
          ))}
        </ul>
      </div>

      <div className="providers">
        <h3>Sign-Ins by Provider</h3>
        <ul>
          {Object.entries(metrics.signInsByProvider).map(([provider, count]) => (
            <li key={provider}>
              {provider}: {count}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

## Best Practices

### 1. Always Track Both Initiation and Result
```typescript
// ✅ Good
trackSignIn.initiated('google');
try {
  await signIn();
  trackSignIn.success('google', userId);
} catch (error) {
  trackSignIn.failed('google', 'provider_error', error.message);
}

// ❌ Bad - missing initiation
try {
  await signIn();
  trackSignIn.success('google', userId);
} catch (error) {}
```

### 2. Include Session Duration When Possible
```typescript
// ✅ Good
const sessionStartTime = Date.now();
// ... later ...
const sessionDuration = Date.now() - sessionStartTime;
trackSignOut.success(sessionDuration);

// ❌ Bad - no duration
trackSignOut.success();
```

### 3. Track Retry Attempts
```typescript
// ✅ Good
for (let attempt = 1; attempt <= maxRetries; attempt++) {
  trackSignIn.initiated('google', { attemptNumber: attempt });
  try {
    await signIn();
    trackSignIn.success('google', userId, { attemptNumber: attempt });
    break;
  } catch (error) {
    trackSignIn.failed('google', 'provider_error', error.message, {
      attemptNumber: attempt,
      willRetry: attempt < maxRetries,
    });
  }
}
```

### 4. Use Specific Error Types
```typescript
// ✅ Good
trackSignIn.failed('google', 'invalid_credentials', 'Wrong password');
trackSignIn.failed('google', 'network_error', 'Connection timeout');

// ❌ Bad - generic error
trackSignIn.failed('google', 'unknown_error', 'Error');
```

## TypeScript Types

```typescript
// Auth event types
type AuthEventType =
  | 'auth.sign_in.initiated'
  | 'auth.sign_in.success'
  | 'auth.sign_in.failed'
  | 'auth.sign_out.initiated'
  | 'auth.sign_out.success'
  | 'auth.token.refresh_success'
  | 'auth.token.refresh_failed'
  | 'auth.session.expired'
  | 'auth.protected_route.blocked'
  | 'auth.session.started'
  | 'auth.session.restored';

// Auth providers
type AuthProvider = 'google' | 'github' | 'email' | 'unknown';

// Error types
type AuthErrorType =
  | 'invalid_credentials'
  | 'network_error'
  | 'token_expired'
  | 'refresh_failed'
  | 'provider_error'
  | 'session_not_found'
  | 'unknown_error';

// Metadata interface
interface AuthEventMetadata {
  provider?: AuthProvider;
  errorType?: AuthErrorType;
  errorMessage?: string;
  redirectTo?: string;
  sessionDuration?: number;
  userId?: string;
  attemptNumber?: number;
}
```

## Development vs Production

The telemetry system automatically adjusts behavior based on environment:

### Development Mode
- Logs all events to console
- Includes full stack traces
- More verbose metadata

### Production Mode
- Silent operation (no console logs)
- Batches events for efficiency
- Sends to backend every 5 seconds

## Backend Integration

To send telemetry data to your backend:

1. Implement the `/api/telemetry` endpoint:

```typescript
// app/api/telemetry/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { events } = await req.json();

  // Store events in your database
  await storeEvents(events);

  return NextResponse.json({ success: true });
}
```

2. The telemetry service will automatically send batched events every 5 seconds.

## Troubleshooting

### Events Not Being Tracked

1. Check if telemetry is initialized:
```typescript
import { telemetry } from '@/lib/telemetry/telemetry';
console.log('Session ID:', telemetry.sessionId);
```

2. Verify tracking calls are executed:
```typescript
trackSignIn.initiated('google');
console.log('Event tracked');
```

3. Check browser console (development mode only)

### Metrics Are Empty

1. Ensure events are being tracked before checking metrics
2. Wait for events to accumulate
3. Check that event types match exactly

### Session Duration Is Incorrect

1. Store session start time when session begins
2. Calculate duration when session ends
3. Pass duration in milliseconds

## Examples

See `/lib/telemetry/auth-integration-examples.ts` for complete, working examples of:
- Google OAuth integration
- Session management
- Token refresh handling
- Protected route guards
- Error retry logic
- Complete auth flows

## Support

For questions or issues with auth telemetry:
1. Check the integration examples
2. Review the TypeScript types
3. Inspect the metrics dashboard
4. Check browser console in development mode

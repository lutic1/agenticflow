# Auth Telemetry - Quick Usage Examples

## 1. Sign In with Google

```typescript
import { trackSignInInitiated, trackSignInSuccess, trackSignInFailed } from '@/lib/telemetry/auth-telemetry';

async function handleGoogleSignIn() {
  // Track start
  trackSignInInitiated('google');

  try {
    const response = await fetch('/api/auth/google/signin', { method: 'POST' });
    const { user } = await response.json();

    // Track success
    trackSignInSuccess('google', user.id);

    window.location.href = '/dashboard';
  } catch (error) {
    // Track failure
    trackSignInFailed('google', 'provider_error', error.message);
  }
}
```

## 2. Session Management

```typescript
import {
  trackSessionStarted,
  trackSessionRestored,
  trackSessionExpired,
} from '@/lib/telemetry/auth-telemetry';

// On new session creation
trackSessionStarted(user.id, { provider: 'google' });

// On page load with existing session
trackSessionRestored(user.id);

// When session expires
const sessionDuration = Date.now() - sessionStartTime;
trackSessionExpired(sessionDuration);
```

## 3. Sign Out

```typescript
import { trackSignOutInitiated, trackSignOutSuccess } from '@/lib/telemetry/auth-telemetry';

async function handleSignOut() {
  trackSignOutInitiated();

  await fetch('/api/auth/signout', { method: 'POST' });

  const sessionDuration = Date.now() - sessionStartTime;
  trackSignOutSuccess(sessionDuration);

  window.location.href = '/';
}
```

## 4. Token Refresh

```typescript
import { trackTokenRefreshSuccess, trackTokenRefreshFailed } from '@/lib/telemetry/auth-telemetry';

async function refreshToken() {
  try {
    const response = await fetch('/api/auth/refresh', { method: 'POST' });
    const { token } = await response.json();

    trackTokenRefreshSuccess();

    return token;
  } catch (error) {
    trackTokenRefreshFailed('refresh_failed', error.message);
    throw error;
  }
}
```

## 5. Protected Route Guard

```typescript
import { trackProtectedRouteBlocked } from '@/lib/telemetry/auth-telemetry';

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    async function checkAuth() {
      const response = await fetch('/api/auth/check');

      if (!response.ok) {
        trackProtectedRouteBlocked(pathname, '/signin');
        window.location.href = '/signin';
        return;
      }

      setIsAuthenticated(true);
    }

    checkAuth();
  }, [pathname]);

  return isAuthenticated ? children : <div>Loading...</div>;
}
```

## 6. Using the React Hook

```typescript
import { useAuthTelemetry } from '@/lib/telemetry/auth-telemetry';

function AuthButton() {
  const { trackSignIn, trackSignOut } = useAuthTelemetry();

  async function handleSignIn() {
    trackSignIn.initiated('google');
    try {
      const user = await signInWithGoogle();
      trackSignIn.success('google', user.id);
    } catch (error) {
      trackSignIn.failed('google', 'provider_error', error.message);
    }
  }

  async function handleSignOut() {
    trackSignOut.initiated();
    await signOut();
    trackSignOut.success();
  }

  return (
    <>
      <button onClick={handleSignIn}>Sign In</button>
      <button onClick={handleSignOut}>Sign Out</button>
    </>
  );
}
```

## 7. View Metrics

```typescript
import { getAuthMetrics, exportAuthMetricsReport } from '@/lib/telemetry/auth-telemetry';

// Get metrics object
const metrics = getAuthMetrics();
console.log('Conversion rate:', metrics.conversionRate);
console.log('Avg session:', metrics.avgSessionDuration);
console.log('Errors:', metrics.errorsByType);
console.log('Providers:', metrics.signInsByProvider);

// Get formatted report
const report = exportAuthMetricsReport();
console.log(report);
```

## 8. Complete Auth Flow

```typescript
import {
  trackSignInInitiated,
  trackSignInSuccess,
  trackSessionStarted,
  trackTokenRefreshSuccess,
  trackSignOutSuccess,
} from '@/lib/telemetry/auth-telemetry';

class AuthService {
  sessionStartTime = 0;

  async signIn(provider: 'google' | 'github') {
    trackSignInInitiated(provider);

    const { user, token } = await fetch(`/api/auth/${provider}`).then(r => r.json());

    trackSignInSuccess(provider, user.id);
    this.sessionStartTime = Date.now();
    trackSessionStarted(user.id, { provider });

    return user;
  }

  async refreshToken() {
    const { token } = await fetch('/api/auth/refresh').then(r => r.json());
    trackTokenRefreshSuccess();
    return token;
  }

  async signOut() {
    await fetch('/api/auth/signout', { method: 'POST' });

    const sessionDuration = Date.now() - this.sessionStartTime;
    trackSignOutSuccess(sessionDuration);
  }
}
```

## Error Types Reference

```typescript
type AuthErrorType =
  | 'invalid_credentials'  // Wrong username/password
  | 'network_error'        // Connection issues
  | 'token_expired'        // Token expired before refresh
  | 'refresh_failed'       // Token refresh failed
  | 'provider_error'       // OAuth provider error
  | 'session_not_found'    // Session doesn't exist
  | 'unknown_error';       // Unexpected error
```

## Provider Types

```typescript
type AuthProvider =
  | 'google'    // Google OAuth
  | 'github'    // GitHub OAuth
  | 'email'     // Email/password
  | 'unknown';  // Unknown provider
```

## All Available Events

```typescript
'auth.sign_in.initiated'        // User clicked sign in
'auth.sign_in.success'          // Sign in succeeded
'auth.sign_in.failed'           // Sign in failed
'auth.sign_out.initiated'       // User clicked sign out
'auth.sign_out.success'         // Sign out completed
'auth.token.refresh_success'    // Token refreshed
'auth.token.refresh_failed'     // Refresh failed
'auth.session.started'          // New session created
'auth.session.restored'         // Session restored
'auth.session.expired'          // Session expired
'auth.protected_route.blocked'  // Unauthorized access
```

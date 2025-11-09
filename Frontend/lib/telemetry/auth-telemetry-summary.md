# Auth Telemetry - Quick Integration Summary

## Files Created

1. **`/lib/telemetry/auth-telemetry.ts`** - Core auth telemetry tracking functions
2. **`/lib/telemetry/auth-integration-examples.ts`** - Complete integration examples
3. **`/docs/auth-telemetry-guide.md`** - Comprehensive documentation

## Events Added

| Event | Description | When to Use |
|-------|-------------|-------------|
| `auth.sign_in.initiated` | User started sign-in | When user clicks sign-in button |
| `auth.sign_in.success` | Sign-in succeeded | After successful authentication |
| `auth.sign_in.failed` | Sign-in failed | When authentication fails |
| `auth.sign_out.initiated` | User started sign-out | When user clicks sign-out |
| `auth.sign_out.success` | Sign-out succeeded | After session cleared |
| `auth.token.refresh_success` | Token refreshed | After automatic token refresh |
| `auth.token.refresh_failed` | Token refresh failed | When refresh fails |
| `auth.session.expired` | Session expired | When session timeout occurs |
| `auth.session.started` | New session created | After successful sign-in |
| `auth.session.restored` | Session restored | On page load with valid session |
| `auth.protected_route.blocked` | Unauthorized access | When user tries protected route without auth |

## Quick Integration Checklist

### ✅ Google OAuth Provider
```typescript
import { trackSignInInitiated, trackSignInSuccess, trackSignInFailed } from '@/lib/telemetry/auth-telemetry';

// On button click
trackSignInInitiated('google');

// On success
trackSignInSuccess('google', user.id);

// On error
trackSignInFailed('google', 'provider_error', error.message);
```

### ✅ Session Management
```typescript
import { trackSessionStarted, trackSessionRestored, trackSignOutSuccess } from '@/lib/telemetry/auth-telemetry';

// On new session
trackSessionStarted(user.id, { provider: 'google' });

// On page load with session
trackSessionRestored(user.id);

// On sign out
const sessionDuration = Date.now() - sessionStartTime;
trackSignOutSuccess(sessionDuration);
```

### ✅ Token Refresh
```typescript
import { trackTokenRefreshSuccess, trackTokenRefreshFailed } from '@/lib/telemetry/auth-telemetry';

// On successful refresh
trackTokenRefreshSuccess();

// On failed refresh
trackTokenRefreshFailed('refresh_failed', error.message);
```

### ✅ Protected Routes
```typescript
import { trackProtectedRouteBlocked } from '@/lib/telemetry/auth-telemetry';

// When blocking access
trackProtectedRouteBlocked(pathname, '/signin');
```

## Using the React Hook

```typescript
import { useAuthTelemetry } from '@/lib/telemetry/auth-telemetry';

const { trackSignIn, trackSignOut, trackToken, trackSession } = useAuthTelemetry();

// Track sign in
trackSignIn.initiated('google');
trackSignIn.success('google', userId);
trackSignIn.failed('google', 'provider_error', errorMessage);

// Track sign out
trackSignOut.initiated();
trackSignOut.success(sessionDuration);

// Track tokens
trackToken.refreshSuccess();
trackToken.refreshFailed('refresh_failed', errorMessage);

// Track sessions
trackSession.started(userId);
trackSession.restored(userId);
trackSession.expired(sessionDuration);
```

## Viewing Metrics

```typescript
import { getAuthMetrics, exportAuthMetricsReport } from '@/lib/telemetry/auth-telemetry';

// Get metrics object
const metrics = getAuthMetrics();
console.log('Conversion rate:', metrics.conversionRate);
console.log('Avg session duration:', metrics.avgSessionDuration);

// Get formatted report
const report = exportAuthMetricsReport();
console.log(report);
```

## Metrics Tracked

- **Sign-in conversion rate** - % of initiated sign-ins that succeed
- **Average session duration** - Mean time users stay signed in
- **Token refresh success rate** - % of successful token refreshes
- **Protected route blocks** - # of unauthorized access attempts
- **Errors by type** - Breakdown of error types
- **Sign-ins by provider** - Distribution across auth methods

## Integration Points (Where to Add Tracking)

1. **Google OAuth Button Component**
   - Track: `sign_in.initiated`, `sign_in.success`, `sign_in.failed`

2. **Session Hook/Context**
   - Track: `session.started`, `session.restored`, `session.expired`

3. **Sign Out Handler**
   - Track: `sign_out.initiated`, `sign_out.success`

4. **Token Refresh Service**
   - Track: `token.refresh_success`, `token.refresh_failed`

5. **Protected Route Guard**
   - Track: `protected_route.blocked`

## Example Complete Flow

```typescript
// 1. User clicks sign in
trackSignInInitiated('google');

// 2. OAuth succeeds
trackSignInSuccess('google', user.id);
trackSessionStarted(user.id, { provider: 'google' });

// 3. Token auto-refreshes (30 minutes later)
trackTokenRefreshSuccess();

// 4. User clicks sign out
trackSignOutInitiated();
const sessionDuration = Date.now() - sessionStartTime;
trackSignOutSuccess(sessionDuration);
```

## Testing

```typescript
// View all events
import { telemetry } from '@/lib/telemetry/telemetry';
console.log(telemetry.getEvents());

// View auth-specific stats
import { getAuthMetrics } from '@/lib/telemetry/auth-telemetry';
console.log(getAuthMetrics());

// Export report
import { exportAuthMetricsReport } from '@/lib/telemetry/auth-telemetry';
console.log(exportAuthMetricsReport());
```

## Next Steps

1. ✅ **Review integration examples** - See `/lib/telemetry/auth-integration-examples.ts`
2. ✅ **Read full documentation** - See `/docs/auth-telemetry-guide.md`
3. ✅ **Add tracking to Google OAuth** - Use examples as template
4. ✅ **Add tracking to session management** - Track start, restore, expire
5. ✅ **Add tracking to sign out** - Include session duration
6. ✅ **Add tracking to token refresh** - Track success and failures
7. ✅ **Add tracking to route guards** - Track blocked access
8. ✅ **Create metrics dashboard** - Visualize conversion rate and errors

## Need Help?

- Check `/lib/telemetry/auth-integration-examples.ts` for working code
- Review `/docs/auth-telemetry-guide.md` for detailed documentation
- Inspect browser console in development mode to see tracked events
- Use `getAuthMetrics()` to verify events are being tracked

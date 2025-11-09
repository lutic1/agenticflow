/**
 * Authentication Telemetry Tracking
 *
 * Provides comprehensive tracking for all authentication flows:
 * - Sign in/out events
 * - Token management
 * - Session lifecycle
 * - Protected route access
 * - Error tracking
 * - Conversion metrics
 */

import { telemetry } from './telemetry';

// ========================================
// Auth Event Types
// ========================================

export type AuthEventType =
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

export type AuthProvider = 'google' | 'github' | 'email' | 'unknown';

export type AuthErrorType =
  | 'invalid_credentials'
  | 'network_error'
  | 'token_expired'
  | 'refresh_failed'
  | 'provider_error'
  | 'session_not_found'
  | 'unknown_error';

export interface AuthEventMetadata {
  provider?: AuthProvider;
  errorType?: AuthErrorType;
  errorMessage?: string;
  redirectTo?: string;
  sessionDuration?: number;
  userId?: string;
  attemptNumber?: number;
}

// ========================================
// Core Auth Tracking Functions
// ========================================

/**
 * Track sign-in initiation
 * Called when user clicks sign-in button or starts OAuth flow
 */
export function trackSignInInitiated(provider: AuthProvider, metadata?: Partial<AuthEventMetadata>) {
  telemetry.trackUserAction('auth.sign_in.initiated', {
    provider,
    timestamp: Date.now(),
    ...metadata,
  });
}

/**
 * Track successful sign-in
 * Called after successful authentication and session creation
 */
export function trackSignInSuccess(
  provider: AuthProvider,
  userId: string,
  metadata?: Partial<AuthEventMetadata>
) {
  telemetry.trackUserAction('auth.sign_in.success', {
    provider,
    userId,
    timestamp: Date.now(),
    ...metadata,
  });

  // Update telemetry service with user ID
  if (typeof window !== 'undefined') {
    localStorage.setItem('user_id', userId);
  }
}

/**
 * Track failed sign-in attempt
 * Called when authentication fails for any reason
 */
export function trackSignInFailed(
  provider: AuthProvider,
  errorType: AuthErrorType,
  errorMessage: string,
  metadata?: Partial<AuthEventMetadata>
) {
  telemetry.trackError(
    new Error(errorMessage),
    'auth.sign_in.failed',
    {
      provider,
      errorType,
      timestamp: Date.now(),
      ...metadata,
    }
  );
}

/**
 * Track sign-out initiation
 * Called when user clicks sign-out button
 */
export function trackSignOutInitiated(metadata?: Partial<AuthEventMetadata>) {
  telemetry.trackUserAction('auth.sign_out.initiated', {
    timestamp: Date.now(),
    ...metadata,
  });
}

/**
 * Track successful sign-out
 * Called after session is cleared and user is logged out
 */
export function trackSignOutSuccess(sessionDuration?: number, metadata?: Partial<AuthEventMetadata>) {
  telemetry.trackUserAction('auth.sign_out.success', {
    sessionDuration,
    timestamp: Date.now(),
    ...metadata,
  });

  // Clear user ID from telemetry
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user_id');
  }
}

// ========================================
// Token & Session Management
// ========================================

/**
 * Track successful token refresh
 * Called when access token is automatically refreshed
 */
export function trackTokenRefreshSuccess(metadata?: Partial<AuthEventMetadata>) {
  telemetry.trackUserAction('auth.token.refresh_success', {
    timestamp: Date.now(),
    ...metadata,
  });
}

/**
 * Track failed token refresh
 * Called when token refresh fails (usually requires re-authentication)
 */
export function trackTokenRefreshFailed(
  errorType: AuthErrorType,
  errorMessage: string,
  metadata?: Partial<AuthEventMetadata>
) {
  telemetry.trackError(
    new Error(errorMessage),
    'auth.token.refresh_failed',
    {
      errorType,
      timestamp: Date.now(),
      ...metadata,
    }
  );
}

/**
 * Track session expiration
 * Called when session expires and user needs to re-authenticate
 */
export function trackSessionExpired(sessionDuration?: number, metadata?: Partial<AuthEventMetadata>) {
  telemetry.trackUserAction('auth.session.expired', {
    sessionDuration,
    timestamp: Date.now(),
    ...metadata,
  });
}

/**
 * Track session start
 * Called when a new session is created
 */
export function trackSessionStarted(userId: string, metadata?: Partial<AuthEventMetadata>) {
  telemetry.trackUserAction('auth.session.started', {
    userId,
    timestamp: Date.now(),
    ...metadata,
  });
}

/**
 * Track session restoration
 * Called when session is restored from storage on page load
 */
export function trackSessionRestored(userId: string, metadata?: Partial<AuthEventMetadata>) {
  telemetry.trackUserAction('auth.session.restored', {
    userId,
    timestamp: Date.now(),
    ...metadata,
  });
}

// ========================================
// Protected Route Access
// ========================================

/**
 * Track blocked access to protected route
 * Called when unauthenticated user tries to access protected content
 */
export function trackProtectedRouteBlocked(
  attemptedPath: string,
  redirectTo?: string,
  metadata?: Partial<AuthEventMetadata>
) {
  telemetry.trackUserAction('auth.protected_route.blocked', {
    attemptedPath,
    redirectTo,
    timestamp: Date.now(),
    ...metadata,
  });
}

// ========================================
// Auth Metrics & Analytics
// ========================================

export interface AuthMetrics {
  signInAttempts: number;
  signInSuccesses: number;
  signInFailures: number;
  conversionRate: number; // % of initiated sign-ins that succeed
  avgSessionDuration: number;
  tokenRefreshSuccesses: number;
  tokenRefreshFailures: number;
  sessionExpirations: number;
  protectedRouteBlocks: number;
  errorsByType: Record<AuthErrorType, number>;
  signInsByProvider: Record<AuthProvider, number>;
}

/**
 * Get auth-specific metrics from telemetry data
 */
export function getAuthMetrics(): AuthMetrics {
  const events = telemetry.getEvents();

  const authEvents = events.filter(e =>
    e.action && e.action.toString().startsWith('auth.')
  );

  const signInInitiated = authEvents.filter(e => e.action === 'auth.sign_in.initiated');
  const signInSuccess = authEvents.filter(e => e.action === 'auth.sign_in.success');
  const signInFailed = authEvents.filter(e => e.action === 'auth.sign_in.failed');
  const tokenRefreshSuccess = authEvents.filter(e => e.action === 'auth.token.refresh_success');
  const tokenRefreshFailed = authEvents.filter(e => e.action === 'auth.token.refresh_failed');
  const sessionExpired = authEvents.filter(e => e.action === 'auth.session.expired');
  const protectedRouteBlocked = authEvents.filter(e => e.action === 'auth.protected_route.blocked');

  // Calculate conversion rate
  const conversionRate = signInInitiated.length > 0
    ? (signInSuccess.length / signInInitiated.length) * 100
    : 0;

  // Calculate average session duration
  const sessionDurations = authEvents
    .filter(e => e.metadata?.sessionDuration)
    .map(e => e.metadata?.sessionDuration as number);
  const avgSessionDuration = sessionDurations.length > 0
    ? sessionDurations.reduce((sum, d) => sum + d, 0) / sessionDurations.length
    : 0;

  // Group errors by type
  const errorsByType: Record<string, number> = {};
  const errorEvents = authEvents.filter(e => e.metadata?.errorType);
  errorEvents.forEach(e => {
    const errorType = e.metadata?.errorType as string;
    errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
  });

  // Group sign-ins by provider
  const signInsByProvider: Record<string, number> = {};
  signInSuccess.forEach(e => {
    const provider = (e.metadata?.provider as string) || 'unknown';
    signInsByProvider[provider] = (signInsByProvider[provider] || 0) + 1;
  });

  return {
    signInAttempts: signInInitiated.length,
    signInSuccesses: signInSuccess.length,
    signInFailures: signInFailed.length,
    conversionRate,
    avgSessionDuration,
    tokenRefreshSuccesses: tokenRefreshSuccess.length,
    tokenRefreshFailures: tokenRefreshFailed.length,
    sessionExpirations: sessionExpired.length,
    protectedRouteBlocks: protectedRouteBlocked.length,
    errorsByType: errorsByType as Record<AuthErrorType, number>,
    signInsByProvider: signInsByProvider as Record<AuthProvider, number>,
  };
}

/**
 * Export auth metrics as formatted report
 */
export function exportAuthMetricsReport(): string {
  const metrics = getAuthMetrics();

  return `
Auth Telemetry Report
Generated: ${new Date().toISOString()}
=====================================

Sign-In Metrics:
- Total Attempts: ${metrics.signInAttempts}
- Successes: ${metrics.signInSuccesses}
- Failures: ${metrics.signInFailures}
- Conversion Rate: ${metrics.conversionRate.toFixed(2)}%

Session Metrics:
- Avg Session Duration: ${(metrics.avgSessionDuration / 1000 / 60).toFixed(2)} minutes
- Session Expirations: ${metrics.sessionExpirations}

Token Management:
- Refresh Successes: ${metrics.tokenRefreshSuccesses}
- Refresh Failures: ${metrics.tokenRefreshFailures}

Security:
- Protected Route Blocks: ${metrics.protectedRouteBlocks}

Errors by Type:
${Object.entries(metrics.errorsByType)
  .map(([type, count]) => `  - ${type}: ${count}`)
  .join('\n')}

Sign-Ins by Provider:
${Object.entries(metrics.signInsByProvider)
  .map(([provider, count]) => `  - ${provider}: ${count}`)
  .join('\n')}
  `.trim();
}

// ========================================
// React Hook for Auth Telemetry
// ========================================

/**
 * Hook for using auth telemetry in React components
 *
 * @example
 * const { trackSignIn, trackSignOut } = useAuthTelemetry();
 *
 * const handleSignIn = async () => {
 *   trackSignIn.initiated('google');
 *   try {
 *     const user = await signInWithGoogle();
 *     trackSignIn.success('google', user.id);
 *   } catch (error) {
 *     trackSignIn.failed('google', 'provider_error', error.message);
 *   }
 * };
 */
export function useAuthTelemetry() {
  return {
    trackSignIn: {
      initiated: trackSignInInitiated,
      success: trackSignInSuccess,
      failed: trackSignInFailed,
    },
    trackSignOut: {
      initiated: trackSignOutInitiated,
      success: trackSignOutSuccess,
    },
    trackToken: {
      refreshSuccess: trackTokenRefreshSuccess,
      refreshFailed: trackTokenRefreshFailed,
    },
    trackSession: {
      started: trackSessionStarted,
      restored: trackSessionRestored,
      expired: trackSessionExpired,
    },
    trackProtectedRoute: {
      blocked: trackProtectedRouteBlocked,
    },
    getMetrics: getAuthMetrics,
    exportReport: exportAuthMetricsReport,
  };
}

/**
 * Auth Telemetry Tests
 *
 * Tests for authentication telemetry tracking functionality
 */

import { telemetry } from '@/lib/telemetry/telemetry';
import {
  trackSignInInitiated,
  trackSignInSuccess,
  trackSignInFailed,
  trackSignOutInitiated,
  trackSignOutSuccess,
  trackTokenRefreshSuccess,
  trackTokenRefreshFailed,
  trackSessionExpired,
  trackSessionStarted,
  trackSessionRestored,
  trackProtectedRouteBlocked,
  getAuthMetrics,
  exportAuthMetricsReport,
  useAuthTelemetry,
  type AuthProvider,
  type AuthErrorType,
} from '@/lib/telemetry/auth-telemetry';

describe('Auth Telemetry', () => {
  beforeEach(() => {
    // Clear telemetry events before each test
    telemetry['events'] = [];
  });

  describe('Sign In Tracking', () => {
    it('should track sign-in initiation', () => {
      trackSignInInitiated('google', { redirectTo: '/dashboard' });

      const events = telemetry.getEvents();
      const signInEvent = events.find(e => e.action === 'auth.sign_in.initiated');

      expect(signInEvent).toBeDefined();
      expect(signInEvent?.metadata?.provider).toBe('google');
      expect(signInEvent?.metadata?.redirectTo).toBe('/dashboard');
    });

    it('should track successful sign-in', () => {
      const userId = 'user123';
      trackSignInSuccess('google', userId);

      const events = telemetry.getEvents();
      const successEvent = events.find(e => e.action === 'auth.sign_in.success');

      expect(successEvent).toBeDefined();
      expect(successEvent?.metadata?.provider).toBe('google');
      expect(successEvent?.metadata?.userId).toBe(userId);
    });

    it('should track failed sign-in', () => {
      trackSignInFailed('google', 'invalid_credentials', 'Wrong password');

      const events = telemetry.getEvents();
      const failureEvent = events.find(e => e.action === 'auth.sign_in.failed');

      expect(failureEvent).toBeDefined();
      expect(failureEvent?.metadata?.provider).toBe('google');
      expect(failureEvent?.metadata?.errorType).toBe('invalid_credentials');
      expect(failureEvent?.metadata?.errorMessage).toBe('Wrong password');
    });

    it('should track sign-in with retry attempts', () => {
      trackSignInInitiated('google', { attemptNumber: 1 });
      trackSignInFailed('google', 'network_error', 'Timeout', { attemptNumber: 1 });

      trackSignInInitiated('google', { attemptNumber: 2 });
      trackSignInSuccess('google', 'user123', { attemptNumber: 2 });

      const events = telemetry.getEvents();
      const initiatedEvents = events.filter(e => e.action === 'auth.sign_in.initiated');

      expect(initiatedEvents).toHaveLength(2);
      expect(initiatedEvents[0]?.metadata?.attemptNumber).toBe(1);
      expect(initiatedEvents[1]?.metadata?.attemptNumber).toBe(2);
    });
  });

  describe('Sign Out Tracking', () => {
    it('should track sign-out initiation', () => {
      trackSignOutInitiated();

      const events = telemetry.getEvents();
      const signOutEvent = events.find(e => e.action === 'auth.sign_out.initiated');

      expect(signOutEvent).toBeDefined();
    });

    it('should track successful sign-out with session duration', () => {
      const sessionDuration = 1800000; // 30 minutes in ms
      trackSignOutSuccess(sessionDuration);

      const events = telemetry.getEvents();
      const successEvent = events.find(e => e.action === 'auth.sign_out.success');

      expect(successEvent).toBeDefined();
      expect(successEvent?.metadata?.sessionDuration).toBe(sessionDuration);
    });
  });

  describe('Token Management Tracking', () => {
    it('should track successful token refresh', () => {
      trackTokenRefreshSuccess();

      const events = telemetry.getEvents();
      const refreshEvent = events.find(e => e.action === 'auth.token.refresh_success');

      expect(refreshEvent).toBeDefined();
    });

    it('should track failed token refresh', () => {
      trackTokenRefreshFailed('refresh_failed', 'Invalid refresh token');

      const events = telemetry.getEvents();
      const failureEvent = events.find(e => e.action === 'auth.token.refresh_failed');

      expect(failureEvent).toBeDefined();
      expect(failureEvent?.metadata?.errorType).toBe('refresh_failed');
      expect(failureEvent?.metadata?.errorMessage).toBe('Invalid refresh token');
    });
  });

  describe('Session Lifecycle Tracking', () => {
    it('should track session started', () => {
      trackSessionStarted('user123', { provider: 'google' });

      const events = telemetry.getEvents();
      const sessionEvent = events.find(e => e.action === 'auth.session.started');

      expect(sessionEvent).toBeDefined();
      expect(sessionEvent?.metadata?.userId).toBe('user123');
      expect(sessionEvent?.metadata?.provider).toBe('google');
    });

    it('should track session restored', () => {
      trackSessionRestored('user123', { provider: 'google' });

      const events = telemetry.getEvents();
      const restoreEvent = events.find(e => e.action === 'auth.session.restored');

      expect(restoreEvent).toBeDefined();
      expect(restoreEvent?.metadata?.userId).toBe('user123');
    });

    it('should track session expiration', () => {
      const sessionDuration = 3600000; // 1 hour
      trackSessionExpired(sessionDuration);

      const events = telemetry.getEvents();
      const expiredEvent = events.find(e => e.action === 'auth.session.expired');

      expect(expiredEvent).toBeDefined();
      expect(expiredEvent?.metadata?.sessionDuration).toBe(sessionDuration);
    });
  });

  describe('Protected Route Tracking', () => {
    it('should track blocked access to protected route', () => {
      trackProtectedRouteBlocked('/dashboard', '/signin');

      const events = telemetry.getEvents();
      const blockedEvent = events.find(e => e.action === 'auth.protected_route.blocked');

      expect(blockedEvent).toBeDefined();
      expect(blockedEvent?.metadata?.attemptedPath).toBe('/dashboard');
      expect(blockedEvent?.metadata?.redirectTo).toBe('/signin');
    });
  });

  describe('Auth Metrics', () => {
    it('should calculate conversion rate correctly', () => {
      // 3 sign-in attempts, 2 successes
      trackSignInInitiated('google');
      trackSignInSuccess('google', 'user1');

      trackSignInInitiated('google');
      trackSignInFailed('google', 'invalid_credentials', 'Wrong password');

      trackSignInInitiated('google');
      trackSignInSuccess('google', 'user2');

      const metrics = getAuthMetrics();

      expect(metrics.signInAttempts).toBe(3);
      expect(metrics.signInSuccesses).toBe(2);
      expect(metrics.signInFailures).toBe(1);
      expect(metrics.conversionRate).toBeCloseTo(66.67, 1);
    });

    it('should calculate average session duration', () => {
      trackSessionExpired(1800000); // 30 minutes
      trackSignOutSuccess(3600000); // 60 minutes
      trackSessionExpired(2700000); // 45 minutes

      const metrics = getAuthMetrics();

      // Average of 30, 60, 45 = 45 minutes = 2700000 ms
      expect(metrics.avgSessionDuration).toBeCloseTo(2700000, -3);
    });

    it('should group errors by type', () => {
      trackSignInFailed('google', 'invalid_credentials', 'Error 1');
      trackSignInFailed('google', 'invalid_credentials', 'Error 2');
      trackSignInFailed('google', 'network_error', 'Error 3');
      trackTokenRefreshFailed('refresh_failed', 'Error 4');

      const metrics = getAuthMetrics();

      expect(metrics.errorsByType.invalid_credentials).toBe(2);
      expect(metrics.errorsByType.network_error).toBe(1);
      expect(metrics.errorsByType.refresh_failed).toBe(1);
    });

    it('should group sign-ins by provider', () => {
      trackSignInSuccess('google', 'user1');
      trackSignInSuccess('google', 'user2');
      trackSignInSuccess('github', 'user3');
      trackSignInSuccess('email', 'user4');

      const metrics = getAuthMetrics();

      expect(metrics.signInsByProvider.google).toBe(2);
      expect(metrics.signInsByProvider.github).toBe(1);
      expect(metrics.signInsByProvider.email).toBe(1);
    });

    it('should handle empty metrics gracefully', () => {
      const metrics = getAuthMetrics();

      expect(metrics.signInAttempts).toBe(0);
      expect(metrics.signInSuccesses).toBe(0);
      expect(metrics.conversionRate).toBe(0);
      expect(metrics.avgSessionDuration).toBe(0);
    });
  });

  describe('Metrics Report', () => {
    it('should export formatted metrics report', () => {
      trackSignInInitiated('google');
      trackSignInSuccess('google', 'user1');
      trackSignOutSuccess(1800000);

      const report = exportAuthMetricsReport();

      expect(report).toContain('Auth Telemetry Report');
      expect(report).toContain('Sign-In Metrics:');
      expect(report).toContain('Total Attempts: 1');
      expect(report).toContain('Successes: 1');
      expect(report).toContain('Conversion Rate: 100.00%');
    });
  });

  describe('useAuthTelemetry Hook', () => {
    it('should provide tracking functions', () => {
      const hook = useAuthTelemetry();

      expect(hook.trackSignIn).toBeDefined();
      expect(hook.trackSignIn.initiated).toBeDefined();
      expect(hook.trackSignIn.success).toBeDefined();
      expect(hook.trackSignIn.failed).toBeDefined();

      expect(hook.trackSignOut).toBeDefined();
      expect(hook.trackSignOut.initiated).toBeDefined();
      expect(hook.trackSignOut.success).toBeDefined();

      expect(hook.trackToken).toBeDefined();
      expect(hook.trackToken.refreshSuccess).toBeDefined();
      expect(hook.trackToken.refreshFailed).toBeDefined();

      expect(hook.trackSession).toBeDefined();
      expect(hook.trackSession.started).toBeDefined();
      expect(hook.trackSession.restored).toBeDefined();
      expect(hook.trackSession.expired).toBeDefined();

      expect(hook.trackProtectedRoute).toBeDefined();
      expect(hook.trackProtectedRoute.blocked).toBeDefined();

      expect(hook.getMetrics).toBeDefined();
      expect(hook.exportReport).toBeDefined();
    });

    it('should track events through hook', () => {
      const hook = useAuthTelemetry();

      hook.trackSignIn.initiated('google');
      hook.trackSignIn.success('google', 'user123');

      const metrics = hook.getMetrics();
      expect(metrics.signInAttempts).toBe(1);
      expect(metrics.signInSuccesses).toBe(1);
    });
  });

  describe('Complete Auth Flow', () => {
    it('should track complete authentication flow', () => {
      const userId = 'user123';
      const provider: AuthProvider = 'google';
      const sessionStart = Date.now();

      // 1. Sign in
      trackSignInInitiated(provider);
      trackSignInSuccess(provider, userId);
      trackSessionStarted(userId, { provider });

      // 2. Token refresh
      trackTokenRefreshSuccess();
      trackTokenRefreshSuccess();

      // 3. Sign out
      trackSignOutInitiated();
      const sessionDuration = Date.now() - sessionStart;
      trackSignOutSuccess(sessionDuration);

      const events = telemetry.getEvents();

      expect(events.filter(e => e.action === 'auth.sign_in.initiated')).toHaveLength(1);
      expect(events.filter(e => e.action === 'auth.sign_in.success')).toHaveLength(1);
      expect(events.filter(e => e.action === 'auth.session.started')).toHaveLength(1);
      expect(events.filter(e => e.action === 'auth.token.refresh_success')).toHaveLength(2);
      expect(events.filter(e => e.action === 'auth.sign_out.initiated')).toHaveLength(1);
      expect(events.filter(e => e.action === 'auth.sign_out.success')).toHaveLength(1);

      const metrics = getAuthMetrics();
      expect(metrics.conversionRate).toBe(100);
      expect(metrics.tokenRefreshSuccesses).toBe(2);
    });

    it('should track failed authentication flow with retry', () => {
      const provider: AuthProvider = 'google';

      // Attempt 1 - fail
      trackSignInInitiated(provider, { attemptNumber: 1 });
      trackSignInFailed(provider, 'network_error', 'Timeout', {
        attemptNumber: 1,
        willRetry: true,
      });

      // Attempt 2 - success
      trackSignInInitiated(provider, { attemptNumber: 2 });
      trackSignInSuccess(provider, 'user123', { attemptNumber: 2 });

      const metrics = getAuthMetrics();
      expect(metrics.signInAttempts).toBe(2);
      expect(metrics.signInSuccesses).toBe(1);
      expect(metrics.signInFailures).toBe(1);
      expect(metrics.conversionRate).toBe(50);
    });
  });

  describe('Security Tracking', () => {
    it('should track multiple protected route blocks', () => {
      trackProtectedRouteBlocked('/dashboard', '/signin');
      trackProtectedRouteBlocked('/settings', '/signin');
      trackProtectedRouteBlocked('/admin', '/signin');

      const metrics = getAuthMetrics();
      expect(metrics.protectedRouteBlocks).toBe(3);
    });

    it('should track session security events', () => {
      trackSessionExpired(3600000, {
        errorType: 'token_expired',
      });

      trackTokenRefreshFailed('refresh_failed', 'Invalid token');

      const events = telemetry.getEvents();
      const securityEvents = events.filter(
        e =>
          e.action === 'auth.session.expired' ||
          e.action === 'auth.token.refresh_failed'
      );

      expect(securityEvents).toHaveLength(2);
    });
  });
});

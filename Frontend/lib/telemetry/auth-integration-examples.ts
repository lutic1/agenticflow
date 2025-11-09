/**
 * Auth Telemetry Integration Examples
 *
 * This file provides complete examples of how to integrate auth telemetry
 * into authentication components, session management, and protected routes.
 *
 * Copy these patterns into your actual auth implementation.
 */

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
  useAuthTelemetry,
  type AuthProvider,
} from './auth-telemetry';

// ========================================
// Example 1: Google OAuth Provider Component
// ========================================

/**
 * Example integration with Google OAuth
 */
export const GoogleOAuthProviderExample = () => {
  const handleGoogleSignIn = async () => {
    const provider: AuthProvider = 'google';

    // Track initiation
    trackSignInInitiated(provider, {
      redirectTo: window.location.pathname,
    });

    try {
      // Simulate OAuth flow
      const response = await fetch('/api/auth/google/signin', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('OAuth failed');
      }

      const { user, token } = await response.json();

      // Track success
      trackSignInSuccess(provider, user.id, {
        redirectTo: window.location.pathname,
      });

      // Start session tracking
      trackSessionStarted(user.id, {
        provider,
      });

      // Redirect or update UI
      window.location.href = '/dashboard';
    } catch (error) {
      // Track failure
      trackSignInFailed(
        provider,
        'provider_error',
        error instanceof Error ? error.message : 'Unknown error',
        {
          attemptNumber: 1,
        }
      );

      // Show error to user
      console.error('Sign in failed:', error);
    }
  };

  return {
    handleGoogleSignIn,
  };
};

// ========================================
// Example 2: Session Management Hook
// ========================================

/**
 * Example session management with telemetry
 */
export const useSessionManagement = () => {
  const sessionStartTime = Date.now();

  // Restore session on page load
  const restoreSession = async () => {
    try {
      const response = await fetch('/api/auth/session');

      if (!response.ok) {
        throw new Error('No valid session');
      }

      const { user } = await response.json();

      // Track session restoration
      trackSessionRestored(user.id, {
        provider: user.provider as AuthProvider,
      });

      return user;
    } catch (error) {
      console.log('No session to restore');
      return null;
    }
  };

  // Handle session expiration
  const handleSessionExpired = () => {
    const sessionDuration = Date.now() - sessionStartTime;

    trackSessionExpired(sessionDuration, {
      redirectTo: '/signin',
    });

    // Redirect to sign in
    window.location.href = '/signin';
  };

  // Sign out
  const signOut = async () => {
    trackSignOutInitiated();

    try {
      await fetch('/api/auth/signout', { method: 'POST' });

      const sessionDuration = Date.now() - sessionStartTime;
      trackSignOutSuccess(sessionDuration);

      // Redirect to home
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return {
    restoreSession,
    handleSessionExpired,
    signOut,
  };
};

// ========================================
// Example 3: Token Refresh Handler
// ========================================

/**
 * Example token refresh with telemetry
 */
export class TokenRefreshHandler {
  private refreshTimer?: NodeJS.Timeout;

  startRefreshTimer(expiresIn: number) {
    // Refresh 5 minutes before expiration
    const refreshTime = (expiresIn - 300) * 1000;

    this.refreshTimer = setTimeout(() => {
      this.refreshToken();
    }, refreshTime);
  }

  async refreshToken() {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const { token, expiresIn } = await response.json();

      // Track success
      trackTokenRefreshSuccess({
        metadata: {
          expiresIn,
        },
      });

      // Schedule next refresh
      this.startRefreshTimer(expiresIn);

      return token;
    } catch (error) {
      // Track failure
      trackTokenRefreshFailed(
        'refresh_failed',
        error instanceof Error ? error.message : 'Unknown error'
      );

      // Handle refresh failure (usually requires re-authentication)
      this.handleRefreshFailure();
    }
  }

  private handleRefreshFailure() {
    // Clear timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Track session expiration
    trackSessionExpired();

    // Redirect to sign in
    window.location.href = '/signin?reason=session_expired';
  }

  cleanup() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
  }
}

// ========================================
// Example 4: Protected Route Guard
// ========================================

/**
 * Example protected route guard with telemetry
 */
export const useProtectedRoute = (requiredAuth: boolean = true) => {
  const checkAuth = async (pathname: string): Promise<boolean> => {
    if (!requiredAuth) {
      return true;
    }

    try {
      const response = await fetch('/api/auth/check');

      if (!response.ok) {
        // Track blocked access
        trackProtectedRouteBlocked(pathname, '/signin');
        return false;
      }

      return true;
    } catch (error) {
      // Track blocked access
      trackProtectedRouteBlocked(pathname, '/signin', {
        errorType: 'network_error',
      });
      return false;
    }
  };

  return { checkAuth };
};

// ========================================
// Example 5: React Component with Hook
// ========================================

/**
 * Example React component using auth telemetry hook
 */
export const SignInButtonExample = () => {
  const { trackSignIn } = useAuthTelemetry();

  const handleSignIn = async (provider: AuthProvider) => {
    // Track initiation
    trackSignIn.initiated(provider);

    try {
      // Simulate authentication
      const response = await fetch(`/api/auth/${provider}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const { user } = await response.json();

      // Track success
      trackSignIn.success(provider, user.id);
    } catch (error) {
      // Track failure
      trackSignIn.failed(
        provider,
        'provider_error',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  };

  return {
    handleSignIn,
  };
};

// ========================================
// Example 6: Session Middleware (API Route)
// ========================================

/**
 * Example Next.js API middleware with session tracking
 */
export const sessionMiddleware = async (req: Request, res: Response, next: () => void) => {
  const sessionCookie = req.headers.get('cookie');

  if (!sessionCookie) {
    // Track blocked access
    const pathname = new URL(req.url).pathname;
    trackProtectedRouteBlocked(pathname, '/api/auth/signin');

    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Validate session
    const session = await validateSession(sessionCookie);

    if (!session) {
      throw new Error('Invalid session');
    }

    // Session is valid, continue
    return next();
  } catch (error) {
    // Track session expired
    trackSessionExpired();

    return new Response('Session expired', { status: 401 });
  }
};

// Mock function for example
async function validateSession(cookie: string): Promise<unknown> {
  return { valid: true };
}

// ========================================
// Example 7: Complete Auth Flow
// ========================================

/**
 * Complete authentication flow example
 */
export class AuthFlowExample {
  private tokenRefreshHandler = new TokenRefreshHandler();
  private sessionStartTime = 0;

  async signInWithGoogle() {
    const provider: AuthProvider = 'google';

    // 1. Track initiation
    trackSignInInitiated(provider);

    try {
      // 2. Perform OAuth
      const { user, token, expiresIn } = await this.performOAuth(provider);

      // 3. Track success
      trackSignInSuccess(provider, user.id);

      // 4. Track session start
      this.sessionStartTime = Date.now();
      trackSessionStarted(user.id, { provider });

      // 5. Start token refresh timer
      this.tokenRefreshHandler.startRefreshTimer(expiresIn);

      return user;
    } catch (error) {
      // Track failure
      trackSignInFailed(
        provider,
        'provider_error',
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  async signOut() {
    // 1. Track initiation
    trackSignOutInitiated();

    try {
      // 2. Clear session
      await this.clearSession();

      // 3. Track success with session duration
      const sessionDuration = Date.now() - this.sessionStartTime;
      trackSignOutSuccess(sessionDuration);

      // 4. Cleanup
      this.tokenRefreshHandler.cleanup();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  }

  async restoreSession() {
    try {
      const user = await this.getStoredSession();

      if (user) {
        // Track restoration
        trackSessionRestored(user.id);
        this.sessionStartTime = Date.now();

        return user;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  // Mock methods for example
  private async performOAuth(provider: AuthProvider) {
    return {
      user: { id: '123', email: 'user@example.com' },
      token: 'token',
      expiresIn: 3600,
    };
  }

  private async clearSession() {
    // Clear cookies, localStorage, etc.
  }

  private async getStoredSession() {
    // Get session from storage
    return null;
  }
}

// ========================================
// Example 8: Error Retry with Telemetry
// ========================================

/**
 * Example error handling with retry logic and telemetry
 */
export class AuthWithRetry {
  private maxRetries = 3;

  async signInWithRetry(provider: AuthProvider) {
    let attempt = 0;

    while (attempt < this.maxRetries) {
      attempt++;

      // Track each attempt
      trackSignInInitiated(provider, { attemptNumber: attempt });

      try {
        const user = await this.attemptSignIn(provider);

        // Track success
        trackSignInSuccess(provider, user.id, { attemptNumber: attempt });

        return user;
      } catch (error) {
        const isLastAttempt = attempt === this.maxRetries;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Track failure
        trackSignInFailed(provider, 'provider_error', errorMessage, {
          attemptNumber: attempt,
          willRetry: !isLastAttempt,
        });

        if (isLastAttempt) {
          throw error;
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    throw new Error('Max retries exceeded');
  }

  private async attemptSignIn(provider: AuthProvider) {
    // Simulate sign in
    return { id: '123', email: 'user@example.com' };
  }
}

/**
 * Google OAuth Mocks
 * Mock implementations for Google OAuth flow
 */

import { googleOAuthResponses } from '../fixtures/users';

// Mock Google OAuth configuration
export const mockGoogleConfig = {
  clientId: 'mock-google-client-id.apps.googleusercontent.com',
  redirectUri: 'http://localhost:3000/api/auth/callback/google',
  scope: 'openid email profile',
  responseType: 'code',
  authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
};

// Mock authorization URL builder
export function buildMockAuthorizationUrl(): string {
  const params = new URLSearchParams({
    client_id: mockGoogleConfig.clientId,
    redirect_uri: mockGoogleConfig.redirectUri,
    response_type: mockGoogleConfig.responseType,
    scope: mockGoogleConfig.scope,
    state: 'mock-state-token',
    nonce: 'mock-nonce',
  });

  return `${mockGoogleConfig.authUrl}?${params.toString()}`;
}

// Mock token exchange
export function mockTokenExchange(authCode: string, success = true) {
  if (!success) {
    return Promise.reject(googleOAuthResponses.error);
  }

  if (authCode === 'invalid-code') {
    return Promise.reject(googleOAuthResponses.invalidGrant);
  }

  if (authCode === 'network-error') {
    return Promise.reject(new Error('Network request failed'));
  }

  return Promise.resolve(googleOAuthResponses.success);
}

// Mock Google user info endpoint
export function mockGoogleUserInfo(accessToken: string) {
  if (!accessToken || accessToken === 'invalid-token') {
    return Promise.reject({
      error: 'invalid_token',
      error_description: 'Invalid access token',
    });
  }

  return Promise.resolve({
    sub: 'user-john-123',
    email: 'john.doe@example.com',
    email_verified: true,
    name: 'John Doe',
    picture: 'https://example.com/john.jpg',
    given_name: 'John',
    family_name: 'Doe',
  });
}

// Mock window.location for OAuth redirects
export function mockWindowLocation() {
  const originalLocation = window.location;

  delete (window as any).location;
  window.location = {
    ...originalLocation,
    href: 'http://localhost:3000',
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
  };

  return {
    restore: () => {
      window.location = originalLocation;
    },
  };
}

// Mock OAuth popup window
export function mockOAuthPopup() {
  const mockPopup = {
    closed: false,
    close: jest.fn(),
    focus: jest.fn(),
    postMessage: jest.fn(),
  };

  const originalOpen = window.open;
  window.open = jest.fn().mockReturnValue(mockPopup);

  return {
    popup: mockPopup,
    restore: () => {
      window.open = originalOpen;
    },
  };
}

// Mock OAuth callback with auth code
export function mockOAuthCallback(
  code = 'mock-auth-code',
  state = 'mock-state-token'
) {
  const url = new URL(window.location.href);
  url.searchParams.set('code', code);
  url.searchParams.set('state', state);

  return url.toString();
}

// Mock OAuth error callback
export function mockOAuthErrorCallback(
  error = 'access_denied',
  description = 'User denied access'
) {
  const url = new URL(window.location.href);
  url.searchParams.set('error', error);
  url.searchParams.set('error_description', description);

  return url.toString();
}

// Mock Google Identity Services (GIS) SDK
export function mockGoogleIdentityServices() {
  const mockClient = {
    requestAccessToken: jest.fn(),
    revoke: jest.fn(),
  };

  const mockAccounts = {
    id: {
      initialize: jest.fn(),
      prompt: jest.fn(),
      renderButton: jest.fn(),
      disableAutoSelect: jest.fn(),
      revoke: jest.fn(),
    },
    oauth2: {
      initTokenClient: jest.fn().mockReturnValue(mockClient),
      initCodeClient: jest.fn().mockReturnValue(mockClient),
      revoke: jest.fn(),
    },
  };

  (window as any).google = {
    accounts: mockAccounts,
  };

  return {
    client: mockClient,
    accounts: mockAccounts,
    cleanup: () => {
      delete (window as any).google;
    },
  };
}

// Mock CSRF token validation
export function mockCsrfToken() {
  const token = 'mock-csrf-token-' + Math.random().toString(36).substring(7);

  return {
    token,
    validate: (receivedToken: string) => receivedToken === token,
    generateNew: () => mockCsrfToken(),
  };
}

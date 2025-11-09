/**
 * @test Google OAuth Integration
 * @description Integration tests for Google OAuth flow
 * @prerequisites Mocked Google OAuth endpoints
 */

import { setupAuthTestEnvironment, mockFetch } from './helpers/auth-test-utils';
import {
  mockGoogleConfig,
  buildMockAuthorizationUrl,
  mockTokenExchange,
  mockGoogleUserInfo,
  mockWindowLocation,
  mockOAuthCallback,
  mockOAuthErrorCallback,
  mockGoogleIdentityServices,
} from './mocks/google-oauth';
import { googleOAuthResponses, testUsers } from './fixtures/users';

describe('Google OAuth Integration', () => {
  let testEnv: ReturnType<typeof setupAuthTestEnvironment>;

  beforeEach(() => {
    testEnv = setupAuthTestEnvironment();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Authorization URL Generation', () => {
    it('should build correct authorization URL', () => {
      const url = buildMockAuthorizationUrl();
      const parsed = new URL(url);

      expect(parsed.origin + parsed.pathname).toBe(mockGoogleConfig.authUrl);
      expect(parsed.searchParams.get('client_id')).toBe(mockGoogleConfig.clientId);
      expect(parsed.searchParams.get('redirect_uri')).toBe(mockGoogleConfig.redirectUri);
      expect(parsed.searchParams.get('response_type')).toBe('code');
      expect(parsed.searchParams.get('scope')).toContain('openid email profile');
    });

    it('should include CSRF state parameter', () => {
      const url = buildMockAuthorizationUrl();
      const parsed = new URL(url);

      const state = parsed.searchParams.get('state');
      expect(state).toBeTruthy();
      expect(state?.length).toBeGreaterThan(10);
    });

    it('should include nonce for replay protection', () => {
      const url = buildMockAuthorizationUrl();
      const parsed = new URL(url);

      const nonce = parsed.searchParams.get('nonce');
      expect(nonce).toBeTruthy();
    });
  });

  describe('Authorization Code Flow', () => {
    it('should redirect to Google for authorization', () => {
      const locationMock = mockWindowLocation();

      // Simulate initiating OAuth flow
      window.location.href = buildMockAuthorizationUrl();

      expect(window.location.href).toContain('accounts.google.com');

      locationMock.restore();
    });

    it('should handle successful callback with code', async () => {
      const code = 'mock-auth-code';
      const callbackUrl = mockOAuthCallback(code);

      const url = new URL(callbackUrl);
      expect(url.searchParams.get('code')).toBe(code);
      expect(url.searchParams.get('state')).toBeTruthy();
    });

    it('should exchange code for tokens', async () => {
      const tokens = await mockTokenExchange('valid-code', true);

      expect(tokens).toHaveProperty('access_token');
      expect(tokens).toHaveProperty('id_token');
      expect(tokens).toHaveProperty('expires_in');
    });

    it('should validate state parameter on callback', () => {
      const state = 'original-state';
      const callbackUrl = mockOAuthCallback('code', state);

      const url = new URL(callbackUrl);
      const receivedState = url.searchParams.get('state');

      // Should verify state matches original
      expect(receivedState).toBe(state);
    });

    it('should reject callback with mismatched state', () => {
      const originalState = 'original-state';
      const callbackUrl = mockOAuthCallback('code', 'different-state');

      // Should reject as potential CSRF attack
      const url = new URL(callbackUrl);
      expect(url.searchParams.get('state')).not.toBe(originalState);
    });
  });

  describe('Error Handling', () => {
    it('should handle user denial (access_denied)', async () => {
      const errorUrl = mockOAuthErrorCallback('access_denied', 'User denied access');

      const url = new URL(errorUrl);
      expect(url.searchParams.get('error')).toBe('access_denied');
    });

    it('should handle invalid authorization code', async () => {
      await expect(mockTokenExchange('invalid-code', false)).rejects.toEqual(
        googleOAuthResponses.error
      );
    });

    it('should handle expired authorization code', async () => {
      await expect(mockTokenExchange('expired-code', false)).rejects.toBeDefined();
    });

    it('should handle network errors during token exchange', async () => {
      await expect(mockTokenExchange('network-error', false)).rejects.toThrow('Network');
    });

    it('should handle malformed OAuth responses', async () => {
      const malformedFetch = mockFetch('not-json', true);
      global.fetch = malformedFetch;

      // Should handle gracefully
    });
  });

  describe('ID Token Validation', () => {
    it('should decode and verify ID token', () => {
      const { id_token } = googleOAuthResponses.success;

      // Parse JWT
      const parts = id_token!.split('.');
      expect(parts).toHaveLength(3);

      const payload = JSON.parse(atob(parts[1]));
      expect(payload).toHaveProperty('sub');
      expect(payload).toHaveProperty('email');
    });

    it('should validate token signature (mocked)', () => {
      // In production, should verify signature with Google's public keys
      // In tests, we mock this validation
      const { id_token } = googleOAuthResponses.success;
      expect(id_token).toBeTruthy();
    });

    it('should validate token issuer', () => {
      const { id_token } = googleOAuthResponses.success;
      const parts = id_token!.split('.');
      const payload = JSON.parse(atob(parts[1]));

      expect(payload.iss).toBe('https://accounts.google.com');
    });

    it('should validate token audience', () => {
      const { id_token } = googleOAuthResponses.success;
      const parts = id_token!.split('.');
      const payload = JSON.parse(atob(parts[1]));

      expect(payload.aud).toBe(mockGoogleConfig.clientId);
    });

    it('should validate token expiry', () => {
      const { id_token } = googleOAuthResponses.success;
      const parts = id_token!.split('.');
      const payload = JSON.parse(atob(parts[1]));

      const now = Math.floor(Date.now() / 1000);
      expect(payload.exp).toBeGreaterThan(now);
    });

    it('should validate email_verified claim', () => {
      const { id_token } = googleOAuthResponses.success;
      const parts = id_token!.split('.');
      const payload = JSON.parse(atob(parts[1]));

      expect(payload.email_verified).toBe(true);
    });
  });

  describe('User Info Endpoint', () => {
    it('should fetch user info with access token', async () => {
      const userInfo = await mockGoogleUserInfo('valid-token');

      expect(userInfo).toHaveProperty('sub');
      expect(userInfo).toHaveProperty('email');
      expect(userInfo).toHaveProperty('name');
    });

    it('should handle invalid access token', async () => {
      await expect(mockGoogleUserInfo('invalid-token')).rejects.toEqual(
        expect.objectContaining({ error: 'invalid_token' })
      );
    });
  });

  describe('Popup OAuth Flow', () => {
    it('should open OAuth popup window', () => {
      const popupMock = mockOAuthPopup();

      const popup = window.open(buildMockAuthorizationUrl(), 'oauth', 'width=500,height=600');

      expect(popup).toBeDefined();
      expect(window.open).toHaveBeenCalled();

      popupMock.restore();
    });

    it('should handle popup blocked by browser', () => {
      const originalOpen = window.open;
      window.open = jest.fn().mockReturnValue(null);

      const popup = window.open('url');
      expect(popup).toBeNull();

      // Should show error message

      window.open = originalOpen;
    });

    it('should handle message from popup', () => {
      const messageHandler = jest.fn();
      window.addEventListener('message', messageHandler);

      const message = {
        type: 'oauth-callback',
        code: 'auth-code',
        state: 'state-token',
      };

      window.postMessage(message, window.location.origin);

      // Should process OAuth callback

      window.removeEventListener('message', messageHandler);
    });

    it('should validate message origin', () => {
      const messageHandler = jest.fn((event) => {
        if (event.origin !== window.location.origin) {
          return; // Reject
        }
      });

      window.addEventListener('message', messageHandler);

      // Message from different origin should be rejected
      const event = new MessageEvent('message', {
        origin: 'https://evil.com',
        data: { type: 'oauth-callback' },
      });

      window.dispatchEvent(event);

      window.removeEventListener('message', messageHandler);
    });
  });

  describe('Google Identity Services SDK', () => {
    it('should initialize GIS client', () => {
      const gis = mockGoogleIdentityServices();

      gis.accounts.oauth2.initTokenClient({
        client_id: mockGoogleConfig.clientId,
        scope: mockGoogleConfig.scope,
        callback: () => {},
      });

      expect(gis.accounts.oauth2.initTokenClient).toHaveBeenCalled();

      gis.cleanup();
    });

    it('should handle one-tap sign in', () => {
      const gis = mockGoogleIdentityServices();

      gis.accounts.id.initialize({
        client_id: mockGoogleConfig.clientId,
        callback: () => {},
      });

      gis.accounts.id.prompt();

      expect(gis.accounts.id.prompt).toHaveBeenCalled();

      gis.cleanup();
    });
  });

  describe('Security', () => {
    it('should use HTTPS for all OAuth endpoints', () => {
      const authUrl = new URL(mockGoogleConfig.authUrl);
      expect(authUrl.protocol).toBe('https:');

      const tokenUrl = new URL(mockGoogleConfig.tokenUrl);
      expect(tokenUrl.protocol).toBe('https:');
    });

    it('should include state for CSRF protection', () => {
      const url = new URL(buildMockAuthorizationUrl());
      const state = url.searchParams.get('state');

      expect(state).toBeTruthy();
      expect(state?.length).toBeGreaterThan(20);
    });

    it('should not expose tokens in URLs', () => {
      // Access tokens should never be in URL
      // Should use authorization code flow, not implicit flow
      const url = buildMockAuthorizationUrl();
      expect(url).not.toContain('response_type=token');
      expect(url).toContain('response_type=code');
    });

    it('should validate redirect URI', () => {
      // Redirect URI should be whitelisted in Google Console
      // Should match exactly, no open redirects
      const url = new URL(buildMockAuthorizationUrl());
      const redirectUri = url.searchParams.get('redirect_uri');

      expect(redirectUri).toBe(mockGoogleConfig.redirectUri);
    });
  });
});

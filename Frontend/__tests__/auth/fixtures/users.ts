/**
 * Test User Fixtures
 * Predefined user data for testing
 */

export interface TestUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  emailVerified?: boolean;
  createdAt?: string;
}

// Valid test users
export const testUsers = {
  john: {
    id: 'user-john-123',
    email: 'john.doe@example.com',
    name: 'John Doe',
    image: 'https://example.com/john.jpg',
    emailVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  jane: {
    id: 'user-jane-456',
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    image: 'https://example.com/jane.jpg',
    emailVerified: true,
    createdAt: '2024-01-02T00:00:00Z',
  },
  unverified: {
    id: 'user-unverified-789',
    email: 'unverified@example.com',
    name: 'Unverified User',
    emailVerified: false,
    createdAt: '2024-01-03T00:00:00Z',
  },
  noImage: {
    id: 'user-noimage-999',
    email: 'noimage@example.com',
    name: 'No Image User',
    emailVerified: true,
    createdAt: '2024-01-04T00:00:00Z',
  },
} as const;

// Invalid/error cases
export const invalidUsers = {
  invalidEmail: {
    id: 'user-invalid-001',
    email: 'not-an-email',
    name: 'Invalid Email',
  },
  missingId: {
    email: 'missing@example.com',
    name: 'Missing ID',
  },
  emptyName: {
    id: 'user-empty-002',
    email: 'empty@example.com',
    name: '',
  },
} as const;

// Google OAuth responses
export const googleOAuthResponses = {
  success: {
    access_token: 'ya29.mock-google-token',
    expires_in: 3599,
    scope: 'openid email profile',
    token_type: 'Bearer',
    id_token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Im1vY2sifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiJtb2NrLWNsaWVudC1pZCIsImF1ZCI6Im1vY2stY2xpZW50LWlkIiwic3ViIjoidXNlci1qb2huLTEyMyIsImVtYWlsIjoiam9obi5kb2VAZXhhbXBsZS5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6IkpvaG4gRG9lIiwicGljdHVyZSI6Imh0dHBzOi8vZXhhbXBsZS5jb20vam9obi5qcGciLCJnaXZlbl9uYW1lIjoiSm9obiIsImZhbWlseV9uYW1lIjoiRG9lIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjE3MDAwMDM2MDB9.mock-signature',
  },
  error: {
    error: 'access_denied',
    error_description: 'User denied access',
  },
  invalidGrant: {
    error: 'invalid_grant',
    error_description: 'Authorization code has expired',
  },
  networkError: null,
} as const;

// Session data
export const sessionData = {
  valid: {
    user: testUsers.john,
    accessToken: 'mock-valid-access-token',
    refreshToken: 'mock-valid-refresh-token',
    expiresAt: Date.now() + 3600000, // 1 hour
  },
  expired: {
    user: testUsers.john,
    accessToken: 'mock-expired-access-token',
    refreshToken: 'mock-expired-refresh-token',
    expiresAt: Date.now() - 1000, // 1 second ago
  },
  almostExpired: {
    user: testUsers.john,
    accessToken: 'mock-almost-expired-access-token',
    refreshToken: 'mock-almost-expired-refresh-token',
    expiresAt: Date.now() + 60000, // 1 minute
  },
  noRefreshToken: {
    user: testUsers.john,
    accessToken: 'mock-access-token-no-refresh',
    refreshToken: '',
    expiresAt: Date.now() + 3600000,
  },
} as const;

// API error responses
export const apiErrors = {
  unauthorized: {
    error: 'unauthorized',
    message: 'Authentication required',
    statusCode: 401,
  },
  forbidden: {
    error: 'forbidden',
    message: 'Access denied',
    statusCode: 403,
  },
  tokenExpired: {
    error: 'token_expired',
    message: 'Access token has expired',
    statusCode: 401,
  },
  invalidToken: {
    error: 'invalid_token',
    message: 'Invalid access token',
    statusCode: 401,
  },
  serverError: {
    error: 'internal_server_error',
    message: 'An unexpected error occurred',
    statusCode: 500,
  },
  networkError: {
    error: 'network_error',
    message: 'Network request failed',
    statusCode: 0,
  },
} as const;

/**
 * Authentication Type Definitions
 *
 * Comprehensive TypeScript types for the authentication system.
 * These types are shared between frontend and backend (where applicable).
 *
 * @version 1.0.0
 * @author Auth Architect Agent
 */

// ============================================================================
// User & Profile Types
// ============================================================================

/**
 * Supported authentication providers
 */
export type AuthProviderType = 'google' | 'github' | 'apple' | 'email';

/**
 * User entity representing an authenticated user
 */
export interface User {
  /** Unique user identifier (e.g., "usr_abc123") */
  id: string;

  /** User's email address */
  email: string;

  /** User's full name */
  name: string;

  /** URL to user's avatar image (optional) */
  avatarUrl?: string;

  /** Authentication provider used */
  provider: AuthProviderType;

  /** ISO 8601 timestamp of account creation */
  createdAt: string;

  /** ISO 8601 timestamp of last update */
  updatedAt: string;

  /** Whether the user's email is verified (for email/password auth) */
  emailVerified?: boolean;

  /** ISO 8601 timestamp of last login */
  lastLoginAt?: string;
}

/**
 * User profile data (subset of User for public display)
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

// ============================================================================
// Session & Token Types
// ============================================================================

/**
 * Authentication session containing user info and tokens
 */
export interface Session {
  /** Authenticated user */
  user: User;

  /** JWT access token for API authorization */
  accessToken: string;

  /** Unix timestamp (seconds) when access token expires */
  expiresAt: number;

  /** Refresh token (only used server-side, not exposed to client state) */
  refreshToken?: string;
}

/**
 * Authentication status states
 */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

/**
 * Session state managed by AuthProvider
 */
export interface AuthState {
  /** Current session (null if not authenticated) */
  session: Session | null;

  /** Current authentication status */
  status: AuthStatus;

  /** Error if authentication failed */
  error: AuthError | null;
}

// ============================================================================
// JWT Token Types
// ============================================================================

/**
 * Decoded JWT access token payload
 */
export interface AccessTokenPayload {
  /** Subject (user ID) */
  sub: string;

  /** User email */
  email: string;

  /** User name */
  name: string;

  /** Avatar URL */
  avatarUrl?: string;

  /** Authentication provider */
  provider: AuthProviderType;

  /** Issued at (Unix timestamp in seconds) */
  iat: number;

  /** Expiration time (Unix timestamp in seconds) */
  exp: number;

  /** Token type */
  type: 'access';
}

/**
 * Decoded JWT refresh token payload
 */
export interface RefreshTokenPayload {
  /** Subject (user ID) */
  sub: string;

  /** Token family ID for rotation tracking */
  tokenFamily: string;

  /** Issued at (Unix timestamp in seconds) */
  iat: number;

  /** Expiration time (Unix timestamp in seconds) */
  exp: number;

  /** Token type */
  type: 'refresh';
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Authentication error codes
 */
export enum AuthErrorCode {
  // OAuth Errors
  INVALID_OAUTH_CODE = 'INVALID_OAUTH_CODE',
  OAUTH_STATE_MISMATCH = 'OAUTH_STATE_MISMATCH',
  OAUTH_PROVIDER_ERROR = 'OAUTH_PROVIDER_ERROR',

  // Token Errors
  INVALID_ACCESS_TOKEN = 'INVALID_ACCESS_TOKEN',
  EXPIRED_ACCESS_TOKEN = 'EXPIRED_ACCESS_TOKEN',
  INVALID_REFRESH_TOKEN = 'INVALID_REFRESH_TOKEN',
  TOKEN_ROTATION_BREACH = 'TOKEN_ROTATION_BREACH',

  // User Errors
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_SUSPENDED = 'USER_SUSPENDED',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',

  // Network Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // General
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Structured authentication error
 */
export interface AuthError {
  /** Error code for programmatic handling */
  code: AuthErrorCode;

  /** User-friendly error message */
  message: string;

  /** Additional error details (for debugging) */
  details?: string;

  /** Original error (if applicable) */
  originalError?: Error;
}

// ============================================================================
// Provider Interface
// ============================================================================

/**
 * Options for sign-in flow
 */
export interface SignInOptions {
  /** URL to redirect to after successful sign-in */
  redirectTo?: string;

  /** OAuth prompt behavior */
  prompt?: 'none' | 'consent' | 'select_account';
}

/**
 * Options for sign-up flow (email/password only)
 */
export interface SignUpOptions {
  email: string;
  password: string;
  name: string;
}

/**
 * Result of authentication operation
 */
export interface AuthResult {
  /** Whether the operation succeeded */
  success: boolean;

  /** User data (if successful) */
  user?: User;

  /** Session data (if successful) */
  session?: Session;

  /** Error details (if failed) */
  error?: AuthError;
}

/**
 * Abstract authentication provider interface
 * All provider implementations must conform to this interface
 */
export interface AuthProvider {
  /** Provider name (e.g., 'google', 'github') */
  readonly name: AuthProviderType;

  /**
   * Initiate sign-in flow
   * For OAuth: Redirects to provider's authorization page
   * For email/password: Validates credentials
   */
  signIn(options?: SignInOptions): Promise<AuthResult>;

  /**
   * Sign out and invalidate session
   */
  signOut(): Promise<void>;

  /**
   * Refresh session using refresh token
   * Returns new session or null if refresh failed
   */
  refreshSession(): Promise<Session | null>;

  /**
   * Get current session
   * Returns session if valid, null otherwise
   */
  getSession(): Promise<Session | null>;
}

/**
 * Email/password specific methods (extends AuthProvider)
 */
export interface EmailPasswordProvider extends AuthProvider {
  /**
   * Register new user with email and password
   */
  signUp(options: SignUpOptions): Promise<AuthResult>;

  /**
   * Send password reset email
   */
  sendPasswordResetEmail(email: string): Promise<void>;

  /**
   * Reset password using reset token
   */
  resetPassword(token: string, newPassword: string): Promise<void>;

  /**
   * Verify email address using verification token
   */
  verifyEmail(token: string): Promise<void>;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * Request body for Google OAuth callback
 */
export interface GoogleAuthRequest {
  /** Authorization code from Google */
  code: string;

  /** Redirect URI used in OAuth flow */
  redirect_uri: string;
}

/**
 * Response from successful authentication
 */
export interface AuthResponse {
  user: User;
  accessToken: string;
  expiresAt: number;
}

/**
 * Response from token refresh
 */
export interface RefreshResponse {
  accessToken: string;
  expiresAt: number;
}

/**
 * Response from /api/auth/me endpoint
 */
export interface MeResponse {
  user: User;
}

/**
 * Generic API error response
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: string;
  };
}

// ============================================================================
// React Context Types
// ============================================================================

/**
 * Auth context value provided by AuthProvider
 */
export interface AuthContextValue {
  /** Current session */
  session: Session | null;

  /** Authentication status */
  status: AuthStatus;

  /** Current error */
  error: AuthError | null;

  /** Sign in with specified provider */
  signIn: (provider: AuthProviderType, options?: SignInOptions) => Promise<AuthResult>;

  /** Sign out current user */
  signOut: () => Promise<void>;

  /** Manually refresh session */
  refreshSession: () => Promise<Session | null>;

  /** Clear error state */
  clearError: () => void;
}

/**
 * Return type of useSession hook
 */
export interface UseSessionReturn {
  /** Current user (null if not authenticated) */
  user: User | null;

  /** Authentication status */
  status: AuthStatus;

  /** Whether user is authenticated */
  isAuthenticated: boolean;

  /** Whether session is loading */
  isLoading: boolean;

  /** Current error */
  error: AuthError | null;
}

/**
 * Return type of useAuth hook
 */
export interface UseAuthReturn {
  /** Sign in with specified provider */
  signIn: (provider: AuthProviderType, options?: SignInOptions) => Promise<AuthResult>;

  /** Sign out current user */
  signOut: () => Promise<void>;

  /** Manually refresh session */
  refreshSession: () => Promise<Session | null>;

  /** Clear error state */
  clearError: () => void;
}

// ============================================================================
// OAuth Types
// ============================================================================

/**
 * Google OAuth token response
 */
export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token: string;
}

/**
 * Google user info response
 */
export interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

/**
 * GitHub OAuth token response
 */
export interface GitHubTokenResponse {
  access_token: string;
  scope: string;
  token_type: string;
}

/**
 * GitHub user info response
 */
export interface GitHubUserInfo {
  id: number;
  login: string;
  email: string | null;
  name: string | null;
  avatar_url: string;
}

/**
 * Apple Sign In token response
 */
export interface AppleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  id_token: string;
}

/**
 * Apple user info (from id_token)
 */
export interface AppleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
}

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Authentication configuration
 */
export interface AuthConfig {
  /** Enabled authentication providers */
  providers: AuthProviderType[];

  /** Access token expiry in minutes (default: 15) */
  accessTokenExpiryMinutes?: number;

  /** Refresh token expiry in days (default: 7) */
  refreshTokenExpiryDays?: number;

  /** Whether to automatically refresh tokens (default: true) */
  autoRefresh?: boolean;

  /** Minutes before expiry to trigger auto-refresh (default: 1) */
  refreshBeforeExpiryMinutes?: number;

  /** Session cookie name (default: 'refresh_token') */
  sessionCookieName?: string;

  /** Cookie domain (default: undefined = current domain) */
  cookieDomain?: string;

  /** Whether to use secure cookies (default: true in production) */
  secureCookies?: boolean;

  /** Default redirect path after sign in (default: '/dashboard') */
  defaultRedirectPath?: string;

  /** Login page path (default: '/login') */
  loginPath?: string;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Helper type to extract user initials from name
 */
export type UserInitials = string;

/**
 * Provider-specific configuration
 */
export interface ProviderConfig<T extends AuthProviderType> {
  provider: T;
  enabled: boolean;
  clientId: string;
  clientSecret?: string; // Server-side only
  scopes?: string[];
}

/**
 * Google OAuth configuration
 */
export type GoogleProviderConfig = ProviderConfig<'google'> & {
  scopes: ['email', 'profile', 'openid'];
};

/**
 * GitHub OAuth configuration
 */
export type GitHubProviderConfig = ProviderConfig<'github'> & {
  scopes: ['user:email', 'read:user'];
};

/**
 * Apple Sign In configuration
 */
export type AppleProviderConfig = ProviderConfig<'apple'> & {
  teamId: string;
  keyId: string;
  privateKey: string;
};

// ============================================================================
// Event Types (for Multi-Tab Sync)
// ============================================================================

/**
 * Auth state change event types
 */
export type AuthEventType =
  | 'AUTH_STATE_CHANGED'
  | 'SESSION_REFRESHED'
  | 'SIGN_OUT';

/**
 * Auth state change event
 */
export interface AuthEvent {
  type: AuthEventType;
  status: AuthStatus;
  user?: User;
  timestamp: number;
}

// ============================================================================
// Logging & Analytics Types
// ============================================================================

/**
 * Auth action for logging
 */
export type AuthAction =
  | 'SIGN_IN'
  | 'SIGN_UP'
  | 'SIGN_OUT'
  | 'REFRESH'
  | 'FAILED_ATTEMPT'
  | 'TOKEN_BREACH';

/**
 * Auth log entry
 */
export interface AuthLog {
  timestamp: Date;
  userId?: string;
  action: AuthAction;
  provider: AuthProviderType;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorCode?: AuthErrorCode;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if error is an AuthError
 */
export function isAuthError(error: unknown): error is AuthError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

/**
 * Type guard to check if session is valid (not expired)
 */
export function isSessionValid(session: Session | null): session is Session {
  if (!session) return false;
  const now = Math.floor(Date.now() / 1000);
  return session.expiresAt > now;
}

/**
 * Type guard to check if user is authenticated
 */
export function isAuthenticated(status: AuthStatus): status is 'authenticated' {
  return status === 'authenticated';
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Default auth configuration values
 */
export const DEFAULT_AUTH_CONFIG: Required<AuthConfig> = {
  providers: ['google'],
  accessTokenExpiryMinutes: 15,
  refreshTokenExpiryDays: 7,
  autoRefresh: true,
  refreshBeforeExpiryMinutes: 1,
  sessionCookieName: 'refresh_token',
  cookieDomain: '',
  secureCookies: process.env.NODE_ENV === 'production',
  defaultRedirectPath: '/dashboard',
  loginPath: '/login',
};

/**
 * User-friendly error messages
 */
export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  [AuthErrorCode.INVALID_OAUTH_CODE]: 'Sign in failed. Please try again.',
  [AuthErrorCode.OAUTH_STATE_MISMATCH]: 'Security verification failed. Please start over.',
  [AuthErrorCode.OAUTH_PROVIDER_ERROR]: 'The authentication service is temporarily unavailable. Try again later.',

  [AuthErrorCode.INVALID_ACCESS_TOKEN]: 'Your session is invalid. Please sign in again.',
  [AuthErrorCode.EXPIRED_ACCESS_TOKEN]: 'Your session has expired. Refreshing...',
  [AuthErrorCode.INVALID_REFRESH_TOKEN]: 'Your session has expired. Please sign in again.',
  [AuthErrorCode.TOKEN_ROTATION_BREACH]: 'Suspicious activity detected. Please sign in again.',

  [AuthErrorCode.USER_NOT_FOUND]: 'Account not found. Please sign up.',
  [AuthErrorCode.USER_SUSPENDED]: 'Your account has been suspended. Contact support.',
  [AuthErrorCode.EMAIL_NOT_VERIFIED]: 'Please verify your email address.',
  [AuthErrorCode.INVALID_CREDENTIALS]: 'Invalid email or password.',

  [AuthErrorCode.NETWORK_ERROR]: 'Connection failed. Check your internet and try again.',
  [AuthErrorCode.TIMEOUT_ERROR]: 'Request timed out. Please try again.',

  [AuthErrorCode.RATE_LIMIT_EXCEEDED]: 'Too many attempts. Please wait a few minutes.',

  [AuthErrorCode.UNAUTHORIZED]: 'Please sign in to continue.',
  [AuthErrorCode.FORBIDDEN]: 'You do not have permission to access this.',
  [AuthErrorCode.UNKNOWN_ERROR]: 'Something went wrong. Please try again.',
};

// ============================================================================
// Export All Types
// ============================================================================

export type {
  // Re-export all interfaces and types for convenience
  User,
  UserProfile,
  Session,
  AuthStatus,
  AuthState,
  AccessTokenPayload,
  RefreshTokenPayload,
  AuthError,
  SignInOptions,
  SignUpOptions,
  AuthResult,
  AuthProvider,
  EmailPasswordProvider,
  GoogleAuthRequest,
  AuthResponse,
  RefreshResponse,
  MeResponse,
  ErrorResponse,
  AuthContextValue,
  UseSessionReturn,
  UseAuthReturn,
  GoogleTokenResponse,
  GoogleUserInfo,
  GitHubTokenResponse,
  GitHubUserInfo,
  AppleTokenResponse,
  AppleUserInfo,
  AuthConfig,
  ProviderConfig,
  GoogleProviderConfig,
  GitHubProviderConfig,
  AppleProviderConfig,
  AuthEvent,
  AuthLog,
};

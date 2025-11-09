/**
 * Security Module - Central Export
 * Comprehensive security utilities for Slide Designer
 */

// Input Sanitization
export {
  sanitizeHTML,
  validateURL,
  sanitizeTemplate,
  sanitizeCSVCell,
  sanitizeSVG,
  validateFileUpload,
  validateTextInput,
  RateLimiter,
  CSP_HEADERS
} from './input-sanitization';

// Authentication & Authorization
export {
  authManager,
  requireAuth,
  type User,
  type Session,
  type AuthToken,
  AuthenticationManager
} from './authentication';

// Encryption
export {
  encrypt,
  decrypt,
  hashPassword,
  verifyPassword,
  generateSecureToken,
  secureConfig,
  storeAPIToken,
  getAPIToken,
  SecureConfigManager
} from './encryption';

// P1 Feature Security
export {
  FontSecurityManager,
  AIImageSecurityManager,
  DataImportSecurityManager,
  VideoEmbedSecurityManager,
  CollaborationSecurityManager,
  TemplateSecurityManager,
  MobileAppSecurityManager,
  fontSecurity,
  aiImageSecurity,
  dataImportSecurity,
  videoEmbedSecurity,
  collaborationSecurity,
  templateSecurity,
  mobileAppSecurity,
  validateP1Security
} from './p1-security';

// P2 Feature Security
export {
  VoiceNarrationSecurityManager,
  APISecurityManager,
  ThemeSecurityManager,
  ModelSecurityManager,
  BlockchainSecurityManager,
  DesignImportSecurityManager,
  voiceNarrationSecurity,
  apiSecurity,
  themeSecurity,
  modelSecurity,
  blockchainSecurity,
  designImportSecurity,
  validateP2Security
} from './p2-security';

/**
 * Security best practices summary:
 *
 * 1. XSS Prevention (V-001):
 *    - Use sanitizeHTML() for all user-provided HTML
 *    - Use DOMPurify with strict configuration
 *
 * 2. SSRF Prevention (V-002):
 *    - Use validateURL() before fetching external resources
 *    - Whitelist allowed domains
 *    - Block private IP ranges
 *
 * 3. Template Injection Prevention (V-003):
 *    - Use sanitizeTemplate() for user templates
 *    - Never use eval() or Function() with user input
 *
 * 4. CSV Injection Prevention (V-004):
 *    - Use sanitizeCSVCell() for all CSV data
 *    - Prefix formula characters with single quote
 *
 * 5. SVG Security (V-005):
 *    - Use sanitizeSVG() for SVG content
 *    - Remove script tags and event handlers
 *
 * 6. Authentication (V-006):
 *    - Require authentication for all sensitive operations
 *    - Use requireAuth() middleware
 *    - Implement proper session management
 *
 * 7. Credential Storage (V-007):
 *    - Store credentials encrypted with secureConfig
 *    - Never commit credentials to version control
 *    - Use environment variables with encryption
 *
 * 8. File Uploads:
 *    - Validate file types and sizes with validateFileUpload()
 *    - Check magic bytes, not just extensions
 *    - Limit file sizes (10MB default)
 *
 * 9. Rate Limiting:
 *    - Use RateLimiter for API endpoints
 *    - Default: 10 requests per minute per user
 *
 * 10. Security Headers:
 *     - Apply CSP_HEADERS to all responses
 *     - Enable CSP, X-Frame-Options, etc.
 */

/**
 * Quick start example:
 *
 * ```typescript
 * import {
 *   sanitizeHTML,
 *   validateURL,
 *   requireAuth,
 *   RateLimiter,
 *   secureConfig
 * } from './security';
 *
 * // Sanitize user input
 * const safeHTML = sanitizeHTML(userInput);
 *
 * // Validate URLs before fetching
 * const urlCheck = validateURL(imageUrl);
 * if (urlCheck.valid) {
 *   fetchImage(urlCheck.sanitized);
 * }
 *
 * // Protect routes
 * app.get('/api/presentations', requireAuth('user'), handler);
 *
 * // Rate limiting
 * const limiter = new RateLimiter(10, 60000);
 * const check = limiter.check(userId);
 * if (!check.allowed) {
 *   return res.status(429).json({ retryAfter: check.retryAfter });
 * }
 *
 * // Store API tokens securely
 * secureConfig.setSecret('OPENAI_API_KEY', 'sk-...');
 * const apiKey = secureConfig.getSecret('OPENAI_API_KEY');
 * ```
 */

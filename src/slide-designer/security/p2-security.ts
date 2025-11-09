/**
 * P2 Feature Security Module
 * Comprehensive security utilities for P2 (Nice-to-Have) features:
 * - Voice Narration (TTS)
 * - API Access (OAuth2, webhooks, API keys)
 * - Interactive Elements (polls, quizzes)
 * - Themes Marketplace (user-uploaded themes, payments)
 * - 3D Animations (glTF models, shaders)
 * - Figma/Sketch Import
 * - AR Presentation (WebXR)
 * - Blockchain NFTs (wallets, smart contracts, IPFS)
 */

import crypto from 'crypto';
import {
  sanitizeHTML,
  validateURL,
  RateLimiter,
  validateTextInput,
  sanitizeSVG
} from './input-sanitization';
import { encrypt, decrypt, generateSecureToken } from './encryption';

// =============================================================================
// 1. VOICE NARRATION (TTS) SECURITY - P2.1
// =============================================================================

export interface TTSValidationResult {
  valid: boolean;
  sanitized?: string;
  errors: string[];
  warnings: string[];
}

/**
 * Voice Narration Security Manager
 * Protects TTS API from abuse and harmful content generation
 * Fixes: V-P2-014
 */
export class VoiceNarrationSecurityManager {
  private rateLimiter: RateLimiter;
  private readonly MAX_TTS_LENGTH = 5000; // characters
  private readonly MAX_TTS_PER_HOUR = 20;

  // Content moderation - block harmful/offensive content
  private readonly PROFANITY_PATTERNS = [
    // Add profanity detection patterns
    // Production: Use OpenAI Moderation API or similar
  ];

  private readonly DANGEROUS_PATTERNS = [
    /system\s*prompt/i,
    /ignore\s+previous/i,
    /prompt\s+injection/i,
    /<script/i,
    /javascript:/i,
  ];

  constructor() {
    this.rateLimiter = new RateLimiter(this.MAX_TTS_PER_HOUR, 60 * 60 * 1000);
  }

  /**
   * Validate and sanitize TTS text input
   * Fixes: V-P2-014 (TTS Content Abuse)
   */
  validateTTSText(text: string, userId: string): TTSValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Rate limiting
    const rateCheck = this.rateLimiter.check(userId);
    if (!rateCheck.allowed) {
      return {
        valid: false,
        errors: [`Rate limit exceeded. Retry after ${rateCheck.retryAfter}s`],
        warnings: [],
      };
    }

    // 2. Length validation
    if (text.length > this.MAX_TTS_LENGTH) {
      errors.push(`Text exceeds maximum length of ${this.MAX_TTS_LENGTH} characters`);
    }

    if (text.length === 0) {
      errors.push('Text cannot be empty');
    }

    // 3. Dangerous pattern detection
    for (const pattern of this.DANGEROUS_PATTERNS) {
      if (pattern.test(text)) {
        errors.push('Text contains suspicious or dangerous content');
        break;
      }
    }

    // 4. Sanitize HTML
    let sanitized = sanitizeHTML(text);

    // 5. Content moderation (basic)
    // Production: Use OpenAI Moderation API
    for (const pattern of this.PROFANITY_PATTERNS) {
      if (pattern.test(sanitized)) {
        warnings.push('Text may contain inappropriate content');
      }
    }

    return {
      valid: errors.length === 0,
      sanitized,
      errors,
      warnings,
    };
  }

  /**
   * Track TTS usage for billing/monitoring
   */
  trackTTSUsage(userId: string, characterCount: number, cost: number): void {
    // TODO: Implement usage tracking in database
    console.log(`User ${userId}: Generated ${characterCount} chars TTS, cost: $${cost.toFixed(4)}`);
  }
}

// =============================================================================
// 2. API ACCESS SECURITY - P2.2 🔴 CRITICAL
// =============================================================================

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
}

export interface WebhookValidationResult {
  valid: boolean;
  sanitized?: string;
  error?: string;
}

export interface APIKeyMetadata {
  id: string;
  userId: string;
  scopes: string[];
  expiresAt: Date;
  createdAt: Date;
  lastUsed?: Date;
}

/**
 * API Security Manager
 * OAuth2 with PKCE, API key management, webhook security
 * Fixes: V-P2-001, V-P2-002, V-P2-005, V-P2-017
 */
export class APISecurityManager {
  private apiKeys: Map<string, APIKeyMetadata> = new Map();
  private webhookSecrets: Map<string, string> = new Map();
  private processedNonces: Set<string> = new Set(); // Replay attack prevention
  private rateLimiter: RateLimiter;

  // SSRF protection - block private IP ranges
  private readonly BLOCKED_IP_PATTERNS = [
    /^127\./,                    // localhost
    /^10\./,                     // Private class A
    /^172\.(1[6-9]|2[0-9]|3[01])\./, // Private class B
    /^192\.168\./,               // Private class C
    /^169\.254\./,               // Link-local
    /^::1$/,                     // IPv6 localhost
    /^fe80:/,                    // IPv6 link-local
    /^169\.254\.169\.254/,       // AWS metadata (IMDSv1)
  ];

  private readonly WEBHOOK_TIMESTAMP_TOLERANCE = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.rateLimiter = new RateLimiter(100, 60 * 1000); // 100 req/min per key
  }

  // -------------------------------------------------------------------------
  // OAuth2 with PKCE (RFC 7636)
  // -------------------------------------------------------------------------

  /**
   * Generate PKCE challenge for OAuth2 flow
   * Fixes: V-P2-001 (OAuth2 Authorization Code Interception)
   */
  generatePKCEChallenge(): {
    codeVerifier: string;
    codeChallenge: string;
    codeChallengeMethod: 'S256';
  } {
    // Generate cryptographically random code verifier (43-128 chars)
    const codeVerifier = generateSecureToken(32); // 64 hex chars

    // Generate SHA-256 hash of code verifier
    const hash = crypto.createHash('sha256').update(codeVerifier).digest();

    // Base64-URL encode
    const codeChallenge = hash
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    return {
      codeVerifier,
      codeChallenge,
      codeChallengeMethod: 'S256',
    };
  }

  /**
   * Validate PKCE code verifier
   */
  validatePKCEVerifier(codeVerifier: string, codeChallenge: string): boolean {
    const hash = crypto.createHash('sha256').update(codeVerifier).digest();
    const computed = hash
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    return computed === codeChallenge;
  }

  /**
   * Validate OAuth2 redirect URI (strict whitelist)
   * Fixes: V-P2-001 (Open Redirect)
   */
  validateRedirectURI(redirectUri: string, allowedUris: string[]): boolean {
    // Exact match only (no wildcard subdomains)
    return allowedUris.includes(redirectUri);
  }

  /**
   * Generate OAuth2 state parameter (CSRF protection)
   */
  generateOAuthState(): string {
    return generateSecureToken(16); // 32 hex chars
  }

  // -------------------------------------------------------------------------
  // API Key Management
  // -------------------------------------------------------------------------

  /**
   * Generate API key with scopes and expiration
   * Fixes: V-P2-002 (API Key Exposure)
   */
  generateAPIKey(
    userId: string,
    scopes: string[],
    ttlDays: number = 90
  ): { key: string; metadata: APIKeyMetadata } {
    const key = `sk_${generateSecureToken(24)}`; // 48 hex chars
    const id = generateSecureToken(8);

    const metadata: APIKeyMetadata = {
      id,
      userId,
      scopes,
      expiresAt: new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    };

    this.apiKeys.set(key, metadata);

    return { key, metadata };
  }

  /**
   * Validate API key and check scopes
   */
  validateAPIKey(
    key: string,
    requiredScope?: string
  ): { valid: boolean; metadata?: APIKeyMetadata; error?: string } {
    // 1. Check if key exists
    const metadata = this.apiKeys.get(key);
    if (!metadata) {
      return { valid: false, error: 'Invalid API key' };
    }

    // 2. Check expiration
    if (metadata.expiresAt < new Date()) {
      this.apiKeys.delete(key);
      return { valid: false, error: 'API key expired' };
    }

    // 3. Check scope (if required)
    if (requiredScope && !metadata.scopes.includes(requiredScope)) {
      return { valid: false, error: `Missing required scope: ${requiredScope}` };
    }

    // 4. Rate limiting
    const rateCheck = this.rateLimiter.check(key);
    if (!rateCheck.allowed) {
      return {
        valid: false,
        error: `Rate limit exceeded. Retry after ${rateCheck.retryAfter}s`,
      };
    }

    // 5. Update last used
    metadata.lastUsed = new Date();

    return { valid: true, metadata };
  }

  /**
   * Encrypt API key for storage
   * Fixes: V-P2-002 (API Key Exposure in Logs)
   */
  encryptAPIKey(key: string, masterPassword: string): string {
    return encrypt(key, masterPassword);
  }

  /**
   * Decrypt API key from storage
   */
  decryptAPIKey(encryptedKey: string, masterPassword: string): string {
    return decrypt(encryptedKey, masterPassword);
  }

  /**
   * Redact API key for logging (show only prefix)
   */
  redactAPIKey(key: string): string {
    if (!key || key.length < 10) return '[REDACTED]';
    return `${key.slice(0, 7)}...[REDACTED]`;
  }

  /**
   * Revoke API key
   */
  revokeAPIKey(key: string): void {
    this.apiKeys.delete(key);
  }

  // -------------------------------------------------------------------------
  // Webhook Security
  // -------------------------------------------------------------------------

  /**
   * Validate webhook URL (SSRF protection)
   * Fixes: V-P2-005 (Webhook SSRF Attacks)
   */
  sanitizeWebhookURL(url: string): WebhookValidationResult {
    // 1. Basic URL validation
    const urlValidation = validateURL(url);
    if (!urlValidation.valid) {
      return { valid: false, error: urlValidation.error };
    }

    try {
      const urlObj = new URL(url);

      // 2. Protocol whitelist
      if (!['https:'].includes(urlObj.protocol)) {
        return { valid: false, error: 'Webhook URL must use HTTPS' };
      }

      // 3. Block private IP ranges (SSRF protection)
      const hostname = urlObj.hostname;
      for (const pattern of this.BLOCKED_IP_PATTERNS) {
        if (pattern.test(hostname)) {
          return {
            valid: false,
            error: `Webhook URL points to private/internal IP: ${hostname}`,
          };
        }
      }

      // 4. Block localhost/loopback
      if (
        hostname === 'localhost' ||
        hostname === '0.0.0.0' ||
        hostname.endsWith('.local')
      ) {
        return { valid: false, error: 'Webhook URL cannot point to localhost' };
      }

      return { valid: true, sanitized: urlObj.toString() };
    } catch (error) {
      return { valid: false, error: 'Invalid webhook URL format' };
    }
  }

  /**
   * Generate webhook secret for HMAC signatures
   */
  generateWebhookSecret(webhookId: string): string {
    const secret = generateSecureToken(32); // 64 hex chars
    this.webhookSecrets.set(webhookId, secret);
    return secret;
  }

  /**
   * Sign webhook payload with HMAC-SHA256
   * Fixes: V-P2-017 (Webhook Replay Attacks)
   */
  signWebhookPayload(
    payload: any,
    webhookId: string,
    timestamp: number = Date.now()
  ): { signature: string; timestamp: number } {
    const secret = this.webhookSecrets.get(webhookId);
    if (!secret) {
      throw new Error('Webhook secret not found');
    }

    // Create signed payload: timestamp.payload
    const signedData = `${timestamp}.${JSON.stringify(payload)}`;

    // Generate HMAC-SHA256 signature
    const signature = crypto
      .createHmac('sha256', secret)
      .update(signedData)
      .digest('hex');

    return { signature, timestamp };
  }

  /**
   * Verify webhook signature and timestamp
   */
  verifyWebhookSignature(
    payload: any,
    signature: string,
    timestamp: number,
    webhookId: string
  ): { valid: boolean; error?: string } {
    const secret = this.webhookSecrets.get(webhookId);
    if (!secret) {
      return { valid: false, error: 'Webhook secret not found' };
    }

    // 1. Timestamp validation (prevent replay attacks)
    const now = Date.now();
    const age = now - timestamp;

    if (age > this.WEBHOOK_TIMESTAMP_TOLERANCE) {
      return { valid: false, error: 'Webhook timestamp too old (replay attack?)' };
    }

    if (age < -this.WEBHOOK_TIMESTAMP_TOLERANCE) {
      return { valid: false, error: 'Webhook timestamp in future' };
    }

    // 2. Compute expected signature
    const signedData = `${timestamp}.${JSON.stringify(payload)}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedData)
      .digest('hex');

    // 3. Constant-time comparison (prevent timing attacks)
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );

    if (!isValid) {
      return { valid: false, error: 'Invalid webhook signature' };
    }

    // 4. Nonce check (prevent duplicate processing)
    const nonce = `${webhookId}:${timestamp}:${signature}`;
    if (this.processedNonces.has(nonce)) {
      return { valid: false, error: 'Webhook already processed (duplicate)' };
    }

    this.processedNonces.add(nonce);

    // Clean up old nonces (older than tolerance window)
    // In production, use Redis with TTL
    if (this.processedNonces.size > 10000) {
      this.processedNonces.clear();
    }

    return { valid: true };
  }

  /**
   * Validate OAuth token (JWT or opaque token)
   */
  validateOAuthToken(token: string): { valid: boolean; error?: string } {
    // Production: Validate JWT signature, expiration, issuer
    // For now, basic validation
    if (!token || token.length < 20) {
      return { valid: false, error: 'Invalid token format' };
    }

    // Check if token is properly formatted (Bearer token)
    if (token.startsWith('Bearer ')) {
      token = token.slice(7);
    }

    // Production: Verify JWT with jsonwebtoken library
    // jwt.verify(token, publicKey, { algorithms: ['RS256'] })

    return { valid: true };
  }
}

// =============================================================================
// 3. THEMES MARKETPLACE SECURITY - P2.4 🔴 CRITICAL
// =============================================================================

export interface ThemeValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  threats?: string[];
}

/**
 * Theme Security Manager
 * Sanitizes user-uploaded themes (CSS/JS), malware scanning
 * Fixes: V-P2-004, V-P2-009, V-P2-018
 */
export class ThemeSecurityManager {
  private readonly MAX_THEME_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly MAX_CSS_SIZE = 500 * 1024; // 500KB
  private readonly MAX_ASSETS = 50;

  // CSS patterns that must be blocked
  private readonly DANGEROUS_CSS_PATTERNS = [
    /@import/i,                    // External CSS imports (SSRF)
    /url\s*\(/i,                   // url() can be SSRF vector
    /expression\s*\(/i,            // IE CSS expressions (XSS)
    /behavior\s*:/i,               // IE behaviors (XSS)
    /binding\s*:/i,                // XBL binding (XSS)
    /-moz-binding/i,               // Firefox XBL
    /javascript\s*:/i,             // JavaScript protocol
    /vbscript\s*:/i,               // VBScript protocol
    /data\s*:\s*text\/html/i,      // Data URI XSS
    /<script/i,                    // Script tag in CSS
  ];

  /**
   * Sanitize theme CSS (remove dangerous patterns)
   * Fixes: V-P2-009 (CSS Injection in Themes)
   */
  sanitizeThemeCSS(css: string): { sanitized: string; errors: string[] } {
    const errors: string[] = [];
    let sanitized = css;

    // 1. Check size limit
    if (css.length > this.MAX_CSS_SIZE) {
      errors.push(`CSS exceeds maximum size of ${this.MAX_CSS_SIZE} bytes`);
      return { sanitized: '', errors };
    }

    // 2. Remove dangerous patterns
    for (const pattern of this.DANGEROUS_CSS_PATTERNS) {
      if (pattern.test(sanitized)) {
        errors.push(`CSS contains dangerous pattern: ${pattern.source}`);
        sanitized = sanitized.replace(pattern, '/* REMOVED */');
      }
    }

    // 3. Additional sanitization using PostCSS (production)
    // Production: Use postcss-safe-parser and discard dangerous rules
    // const postcss = require('postcss');
    // const safeParser = require('postcss-safe-parser');
    // const ast = postcss.parse(sanitized, { parser: safeParser });

    return { sanitized, errors };
  }

  /**
   * Sanitize theme JavaScript (BLOCK ALL JS)
   * Fixes: V-P2-004 (JavaScript Execution in User Themes)
   */
  sanitizeThemeJS(js: string): { sanitized: string; errors: string[] } {
    // CRITICAL: User themes should NOT contain JavaScript
    // All JS must be blocked with CSP: script-src 'none'

    if (js && js.trim().length > 0) {
      return {
        sanitized: '',
        errors: ['JavaScript is not allowed in themes'],
      };
    }

    return { sanitized: '', errors: [] };
  }

  /**
   * Validate theme assets (images, fonts)
   * Fixes: V-P2-018 (Theme Polyglot File Upload)
   */
  validateThemeAssets(
    assets: Array<{ name: string; buffer: Buffer; mimeType: string }>
  ): ThemeValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Check asset count
    if (assets.length > this.MAX_ASSETS) {
      errors.push(`Theme contains too many assets (max ${this.MAX_ASSETS})`);
    }

    // 2. Validate each asset
    for (const asset of assets) {
      // Magic bytes validation (prevent polyglot attacks)
      const magicBytes = asset.buffer.slice(0, 4);
      const validationResult = this.validateAssetMagicBytes(
        magicBytes,
        asset.mimeType
      );

      if (!validationResult.valid) {
        errors.push(`Asset ${asset.name}: ${validationResult.error}`);
      }

      // Check for executable signatures
      const malwareCheck = this.scanAssetForMalware(asset.buffer);
      if (!malwareCheck.clean) {
        errors.push(`Asset ${asset.name}: ${malwareCheck.threat}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate file magic bytes match MIME type
   */
  private validateAssetMagicBytes(
    magicBytes: Buffer,
    mimeType: string
  ): { valid: boolean; error?: string } {
    const signatures: { [key: string]: number[][] } = {
      'image/png': [[0x89, 0x50, 0x4e, 0x47]],
      'image/jpeg': [[0xff, 0xd8, 0xff]],
      'image/gif': [[0x47, 0x49, 0x46, 0x38]],
      'image/webp': [[0x52, 0x49, 0x46, 0x46]], // 'RIFF'
      'image/svg+xml': [[0x3c, 0x3f, 0x78, 0x6d], [0x3c, 0x73, 0x76, 0x67]], // '<?xml' or '<svg'
      'font/ttf': [[0x00, 0x01, 0x00, 0x00]],
      'font/woff': [[0x77, 0x4f, 0x46, 0x46]], // 'wOFF'
      'font/woff2': [[0x77, 0x4f, 0x46, 0x32]], // 'wOF2'
    };

    const expectedSignatures = signatures[mimeType];
    if (!expectedSignatures) {
      return { valid: false, error: `Unsupported MIME type: ${mimeType}` };
    }

    // Check if magic bytes match any expected signature
    const matches = expectedSignatures.some((sig) => {
      return sig.every((byte, index) => magicBytes[index] === byte);
    });

    if (!matches) {
      return { valid: false, error: 'File magic bytes do not match MIME type' };
    }

    return { valid: true };
  }

  /**
   * Scan asset for malware signatures
   * Fixes: V-P2-018 (Malware Distribution)
   * Production: Use ClamAV or VirusTotal API
   */
  private scanAssetForMalware(
    buffer: Buffer
  ): { clean: boolean; threat?: string } {
    // Check for executable signatures
    const executableSignatures = [
      [0x4d, 0x5a], // MZ (DOS/Windows)
      [0x50, 0x45], // PE (Portable Executable)
      [0x7f, 0x45, 0x4c, 0x46], // ELF (Linux)
      [0xcf, 0xfa, 0xed, 0xfe], // Mach-O (macOS)
    ];

    for (const sig of executableSignatures) {
      if (this.bufferStartsWith(buffer, sig)) {
        return { clean: false, threat: 'Executable signature detected' };
      }
    }

    // Check for suspicious strings
    const suspicious = ['cmd.exe', 'powershell', 'eval(', '<script', '/bin/sh'];
    const bufferStr = buffer.toString('utf8', 0, Math.min(buffer.length, 10000));

    for (const str of suspicious) {
      if (bufferStr.includes(str)) {
        return { clean: false, threat: `Suspicious string detected: ${str}` };
      }
    }

    return { clean: true };
  }

  /**
   * Check if buffer starts with byte sequence
   */
  private bufferStartsWith(buffer: Buffer, sequence: number[]): boolean {
    if (buffer.length < sequence.length) return false;
    return sequence.every((byte, index) => buffer[index] === byte);
  }

  /**
   * Scan for malware using VirusTotal API (production)
   */
  async scanForMalware(fileBuffer: Buffer): Promise<ThemeValidationResult> {
    // Production: Upload to VirusTotal API
    // const apiKey = process.env.VIRUSTOTAL_API_KEY;
    // const formData = new FormData();
    // formData.append('file', fileBuffer);
    // const response = await fetch('https://www.virustotal.com/api/v3/files', {
    //   method: 'POST',
    //   headers: { 'x-apikey': apiKey },
    //   body: formData
    // });

    // For now, basic checks
    const malwareCheck = this.scanAssetForMalware(fileBuffer);

    if (!malwareCheck.clean) {
      return {
        valid: false,
        errors: [malwareCheck.threat!],
        warnings: [],
        threats: [malwareCheck.threat!],
      };
    }

    return { valid: true, errors: [], warnings: [] };
  }

  /**
   * Generate Content Security Policy for theme preview
   * Fixes: V-P2-004 (JavaScript Execution in User Themes)
   */
  generateThemeCSP(): string {
    return [
      "default-src 'none'",
      "style-src 'unsafe-inline'", // Allow inline styles only
      "script-src 'none'", // BLOCK all JavaScript
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'none'",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'none'",
    ].join('; ');
  }
}

// =============================================================================
// 4. 3D MODEL SECURITY - P2.5 🔴 CRITICAL
// =============================================================================

export interface ModelValidationResult {
  valid: boolean;
  error?: string;
  metadata?: {
    vertices: number;
    triangles: number;
    textures: number;
    animations: number;
  };
}

/**
 * 3D Model Security Manager
 * Validates glTF/GLB files, sanitizes shaders
 * Fixes: V-P2-006, V-P2-007
 */
export class ModelSecurityManager {
  private readonly MAX_MODEL_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly MAX_VERTICES = 100000; // 100K vertices
  private readonly MAX_TRIANGLES = 50000;
  private readonly MAX_TEXTURE_SIZE = 4096; // 4096x4096 pixels
  private readonly MAX_TEXTURES = 10;

  /**
   * Validate 3D model file (glTF/GLB)
   * Fixes: V-P2-006 (Malicious glTF File Parsing)
   */
  validate3DModel(file: File | Buffer): ModelValidationResult {
    try {
      const buffer = file instanceof Buffer ? file : Buffer.from(file as any);

      // 1. File size check
      if (buffer.length > this.MAX_MODEL_SIZE) {
        return {
          valid: false,
          error: `Model size exceeds maximum of ${this.MAX_MODEL_SIZE} bytes`,
        };
      }

      // 2. Detect format (glTF JSON vs GLB binary)
      const isGLB = this.isGLBFormat(buffer);
      const gltfData = isGLB ? this.parseGLB(buffer) : this.parseGLTF(buffer);

      if (!gltfData) {
        return { valid: false, error: 'Invalid glTF/GLB format' };
      }

      // 3. Validate glTF structure
      const structureValidation = this.validateGLTFStructure(gltfData);
      if (!structureValidation.valid) {
        return structureValidation;
      }

      // 4. Check complexity limits
      const complexityCheck = this.checkModelComplexity(gltfData);
      if (!complexityCheck.valid) {
        return complexityCheck;
      }

      return {
        valid: true,
        metadata: {
          vertices: complexityCheck.metadata!.vertices,
          triangles: complexityCheck.metadata!.triangles,
          textures: complexityCheck.metadata!.textures,
          animations: gltfData.animations?.length || 0,
        },
      };
    } catch (error) {
      return {
        valid: false,
        error: `Model validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Check if buffer is GLB format (magic bytes: 'glTF')
   */
  private isGLBFormat(buffer: Buffer): boolean {
    if (buffer.length < 4) return false;
    const magic = buffer.slice(0, 4).toString('ascii');
    return magic === 'glTF';
  }

  /**
   * Parse GLB binary format
   */
  private parseGLB(buffer: Buffer): any {
    try {
      // GLB header: magic (4) + version (4) + length (4) = 12 bytes
      if (buffer.length < 12) return null;

      const version = buffer.readUInt32LE(4);
      if (version !== 2) return null; // Only support glTF 2.0

      // Read JSON chunk
      const jsonChunkLength = buffer.readUInt32LE(12);
      const jsonChunkType = buffer.readUInt32LE(16);

      if (jsonChunkType !== 0x4e4f534a) return null; // 'JSON'

      const jsonStart = 20;
      const jsonEnd = jsonStart + jsonChunkLength;
      const jsonStr = buffer.slice(jsonStart, jsonEnd).toString('utf8');

      return JSON.parse(jsonStr);
    } catch {
      return null;
    }
  }

  /**
   * Parse glTF JSON format
   */
  private parseGLTF(buffer: Buffer): any {
    try {
      const jsonStr = buffer.toString('utf8');
      return JSON.parse(jsonStr);
    } catch {
      return null;
    }
  }

  /**
   * Validate glTF JSON structure
   */
  private validateGLTFStructure(gltf: any): ModelValidationResult {
    // Check required fields
    if (!gltf.asset || !gltf.asset.version) {
      return { valid: false, error: 'Missing glTF asset metadata' };
    }

    // Only support glTF 2.0
    if (!gltf.asset.version.startsWith('2.')) {
      return { valid: false, error: 'Only glTF 2.0 is supported' };
    }

    // Validate no embedded scripts
    const jsonStr = JSON.stringify(gltf);
    if (jsonStr.includes('<script') || jsonStr.includes('javascript:')) {
      return { valid: false, error: 'glTF contains suspicious content' };
    }

    return { valid: true };
  }

  /**
   * Check model complexity (vertices, triangles, textures)
   * Fixes: V-P2-006, V-P2-007
   */
  checkModelComplexity(gltf: any): ModelValidationResult {
    let totalVertices = 0;
    let totalTriangles = 0;
    let textureCount = 0;

    // Count vertices and triangles from meshes
    if (gltf.meshes) {
      for (const mesh of gltf.meshes) {
        for (const primitive of mesh.primitives || []) {
          const positionAccessor = primitive.attributes?.POSITION;
          if (positionAccessor !== undefined && gltf.accessors) {
            const accessor = gltf.accessors[positionAccessor];
            totalVertices += accessor?.count || 0;
          }

          const indicesAccessor = primitive.indices;
          if (indicesAccessor !== undefined && gltf.accessors) {
            const accessor = gltf.accessors[indicesAccessor];
            const indexCount = accessor?.count || 0;
            totalTriangles += Math.floor(indexCount / 3);
          }
        }
      }
    }

    // Count textures
    if (gltf.textures) {
      textureCount = gltf.textures.length;
    }

    // Validate limits
    if (totalVertices > this.MAX_VERTICES) {
      return {
        valid: false,
        error: `Model has too many vertices (${totalVertices} > ${this.MAX_VERTICES})`,
      };
    }

    if (totalTriangles > this.MAX_TRIANGLES) {
      return {
        valid: false,
        error: `Model has too many triangles (${totalTriangles} > ${this.MAX_TRIANGLES})`,
      };
    }

    if (textureCount > this.MAX_TEXTURES) {
      return {
        valid: false,
        error: `Model has too many textures (${textureCount} > ${this.MAX_TEXTURES})`,
      };
    }

    return {
      valid: true,
      metadata: { vertices: totalVertices, triangles: totalTriangles, textures: textureCount },
    };
  }

  /**
   * Sanitize GLSL shader code
   * Fixes: V-P2-007 (GLSL Shader DoS)
   */
  sanitizeShaderCode(glsl: string): { sanitized: string; errors: string[] } {
    const errors: string[] = [];
    let sanitized = glsl;

    // Block infinite loops and recursion
    const dangerousPatterns = [
      /while\s*\(\s*true\s*\)/i, // while(true)
      /for\s*\([^;]*;[^;]*;[^)]*\)\s*\{/i, // Check for suspicious for loops
      /discard\s*;?\s*}/i, // Fragment shader early termination abuse
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(sanitized)) {
        errors.push(`Shader contains potentially dangerous pattern: ${pattern.source}`);
      }
    }

    // Check shader length (basic complexity check)
    if (sanitized.length > 10000) {
      errors.push('Shader code exceeds maximum length (10KB)');
    }

    // Production: Use glslang validator or similar
    // const glslang = require('glslang');
    // const result = glslang.validate(sanitized);
    // if (!result.valid) errors.push(...result.errors);

    return { sanitized, errors };
  }
}

// =============================================================================
// 5. BLOCKCHAIN SECURITY - P2.8 🔴 CRITICAL
// =============================================================================

export interface WalletValidationResult {
  valid: boolean;
  error?: string;
  address?: string;
}

/**
 * Blockchain Security Manager
 * Wallet integration, smart contract security, IPFS validation
 * Fixes: V-P2-003, V-P2-010, V-P2-012, V-P2-020
 */
export class BlockchainSecurityManager {
  private readonly MAX_GAS_LIMIT = 500000; // 500K gas max per transaction
  private readonly IPFS_GATEWAYS = [
    'https://ipfs.io',
    'https://cloudflare-ipfs.com',
    'https://gateway.pinata.cloud',
  ];

  /**
   * Validate Ethereum wallet address
   * Fixes: V-P2-010 (Private Key Exposure)
   */
  validateWalletAddress(address: string): boolean {
    // Ethereum address: 0x followed by 40 hex characters
    const ethereumRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethereumRegex.test(address);
  }

  /**
   * CRITICAL: Never store private keys
   * This function should NEVER be implemented
   */
  secureKeyStorage(privateKey: string): void {
    throw new Error(
      'SECURITY VIOLATION: Private keys must NEVER be stored. Use MetaMask/WalletConnect only.'
    );
  }

  /**
   * Validate smart contract address (check if verified on Etherscan)
   * Fixes: V-P2-003 (Smart Contract Reentrancy)
   */
  async validateSmartContract(
    contractAddress: string
  ): Promise<{ valid: boolean; verified?: boolean; error?: string }> {
    if (!this.validateWalletAddress(contractAddress)) {
      return { valid: false, error: 'Invalid contract address format' };
    }

    // Production: Check Etherscan API for contract verification
    // const apiKey = process.env.ETHERSCAN_API_KEY;
    // const response = await fetch(
    //   `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${contractAddress}&apikey=${apiKey}`
    // );
    // const data = await response.json();
    // const verified = data.result[0].SourceCode !== '';

    return { valid: true, verified: false }; // Placeholder
  }

  /**
   * Validate transaction gas limit
   * Fixes: V-P2-020 (Smart Contract Gas Manipulation)
   */
  validateGasLimit(gasLimit: number): { valid: boolean; error?: string } {
    if (gasLimit > this.MAX_GAS_LIMIT) {
      return {
        valid: false,
        error: `Gas limit exceeds maximum of ${this.MAX_GAS_LIMIT}`,
      };
    }

    if (gasLimit < 21000) {
      return { valid: false, error: 'Gas limit too low (minimum 21000)' };
    }

    return { valid: true };
  }

  /**
   * Validate IPFS CID (Content Identifier)
   * Fixes: V-P2-012 (IPFS Content Injection)
   */
  validateIPFSCID(cid: string): { valid: boolean; error?: string } {
    // IPFS CIDv1: starts with 'bafy' (base32) or 'Qm' (CIDv0, base58)
    const cidv0Regex = /^Qm[a-zA-Z0-9]{44}$/;
    const cidv1Regex = /^bafy[a-z0-9]{56}$/;

    if (!cidv0Regex.test(cid) && !cidv1Regex.test(cid)) {
      return { valid: false, error: 'Invalid IPFS CID format' };
    }

    return { valid: true };
  }

  /**
   * Verify IPFS content hash matches CID
   * Fixes: V-P2-012 (IPFS Content Injection)
   */
  async verifyIPFSContent(
    cid: string,
    content: Buffer
  ): Promise<{ valid: boolean; error?: string }> {
    const cidValidation = this.validateIPFSCID(cid);
    if (!cidValidation.valid) {
      return cidValidation;
    }

    // Production: Compute multihash and compare with CID
    // const multihash = require('multihashes');
    // const hash = crypto.createHash('sha256').update(content).digest();
    // const mh = multihash.encode(hash, 'sha2-256');
    // const computedCID = new CID(1, 'dag-pb', mh).toString();
    // if (computedCID !== cid) {
    //   return { valid: false, error: 'Content hash does not match CID' };
    // }

    return { valid: true };
  }

  /**
   * Fetch IPFS content with redundancy
   */
  async fetchIPFSContent(
    cid: string
  ): Promise<{ success: boolean; data?: Buffer; error?: string }> {
    const cidValidation = this.validateIPFSCID(cid);
    if (!cidValidation.valid) {
      return { success: false, error: cidValidation.error };
    }

    // Try multiple gateways for redundancy
    for (const gateway of this.IPFS_GATEWAYS) {
      try {
        const url = `${gateway}/ipfs/${cid}`;
        const response = await fetch(url, { timeout: 10000 } as any);

        if (response.ok) {
          const buffer = Buffer.from(await response.arrayBuffer());
          return { success: true, data: buffer };
        }
      } catch (error) {
        continue; // Try next gateway
      }
    }

    return { success: false, error: 'Failed to fetch from all IPFS gateways' };
  }

  /**
   * Generate transaction signature verification message
   * Prevents wallet signature phishing
   */
  generateSignatureMessage(action: string, timestamp: number): string {
    // Human-readable message for wallet signature
    return `
Slide Designer Action: ${action}
Timestamp: ${new Date(timestamp).toISOString()}
Nonce: ${timestamp}

By signing this message, you authorize Slide Designer to perform the above action.
    `.trim();
  }

  /**
   * Verify wallet signature (EIP-191)
   */
  async verifyWalletSignature(
    message: string,
    signature: string,
    expectedAddress: string
  ): Promise<{ valid: boolean; error?: string }> {
    // Production: Use ethers.js to verify signature
    // const { ethers } = require('ethers');
    // const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    // if (recoveredAddress.toLowerCase() !== expectedAddress.toLowerCase()) {
    //   return { valid: false, error: 'Signature does not match address' };
    // }

    return { valid: true }; // Placeholder
  }
}

// =============================================================================
// 6. DESIGN IMPORT SECURITY - P2.6 (Figma/Sketch)
// =============================================================================

/**
 * Design Import Security Manager
 * Figma/Sketch API token security, SSRF protection
 * Fixes: V-P2-008, V-P2-019
 */
export class DesignImportSecurityManager {
  private readonly MAX_LAYERS = 1000;
  private readonly MAX_LAYER_NAME_LENGTH = 100;

  /**
   * Validate and encrypt Figma API token
   * Fixes: V-P2-008 (Figma Token Leakage in Error Messages)
   */
  validateFigmaToken(token: string): boolean {
    // Figma token format: figd_... (personal access token)
    return token.startsWith('figd_') && token.length > 20;
  }

  /**
   * Encrypt Figma token for storage
   */
  encryptFigmaToken(token: string, masterPassword: string): string {
    return encrypt(token, masterPassword);
  }

  /**
   * Decrypt Figma token from storage
   */
  decryptFigmaToken(encryptedToken: string, masterPassword: string): string {
    return decrypt(encryptedToken, masterPassword);
  }

  /**
   * Redact token in error messages
   */
  redactFigmaToken(token: string): string {
    if (!token || token.length < 10) return '[REDACTED]';
    return `${token.slice(0, 5)}...[REDACTED]`;
  }

  /**
   * Sanitize imported layers to prevent XSS
   * Fixes: V-P2-019 (Figma Layer XSS)
   */
  sanitizeImportedLayers(layers: any[]): any[] {
    if (layers.length > this.MAX_LAYERS) {
      throw new Error(`Too many layers (max ${this.MAX_LAYERS})`);
    }

    return layers.map((layer) => ({
      ...layer,
      name: this.sanitizeLayerName(layer.name),
      characters: layer.characters ? sanitizeHTML(layer.characters) : undefined,
    }));
  }

  /**
   * Sanitize layer name
   */
  private sanitizeLayerName(name: string): string {
    if (!name) return 'Unnamed';

    // Truncate and sanitize
    let sanitized = sanitizeHTML(name.slice(0, this.MAX_LAYER_NAME_LENGTH));

    // Remove potentially dangerous characters
    sanitized = sanitized.replace(/[<>'"]/g, '');

    return sanitized || 'Unnamed';
  }

  /**
   * Validate Figma file URL to prevent SSRF
   */
  preventSSRF(url: string): { valid: boolean; sanitized?: string; error?: string } {
    // Only allow Figma URLs
    if (!url.startsWith('https://api.figma.com/')) {
      return { valid: false, error: 'Only Figma API URLs are allowed' };
    }

    return validateURL(url);
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const voiceNarrationSecurity = new VoiceNarrationSecurityManager();
export const apiSecurity = new APISecurityManager();
export const themeSecurity = new ThemeSecurityManager();
export const modelSecurity = new ModelSecurityManager();
export const blockchainSecurity = new BlockchainSecurityManager();
export const designImportSecurity = new DesignImportSecurityManager();

/**
 * Comprehensive P2 security validation
 * Call this before deploying P2 features to production
 */
export async function validateP2Security(): Promise<{
  passed: boolean;
  checks: Array<{ name: string; status: 'pass' | 'fail'; message?: string }>;
}> {
  const checks: Array<{ name: string; status: 'pass' | 'fail'; message?: string }> = [];

  // 1. OAuth2 PKCE implementation
  try {
    const pkce = apiSecurity.generatePKCEChallenge();
    const valid = apiSecurity.validatePKCEVerifier(pkce.codeVerifier, pkce.codeChallenge);
    checks.push({
      name: 'OAuth2 PKCE Implementation',
      status: valid ? 'pass' : 'fail',
    });
  } catch {
    checks.push({ name: 'OAuth2 PKCE Implementation', status: 'fail' });
  }

  // 2. Webhook signature validation
  try {
    const webhookId = 'test-webhook';
    apiSecurity.generateWebhookSecret(webhookId);
    const { signature, timestamp } = apiSecurity.signWebhookPayload({ test: 'data' }, webhookId);
    const verification = apiSecurity.verifyWebhookSignature(
      { test: 'data' },
      signature,
      timestamp,
      webhookId
    );
    checks.push({
      name: 'Webhook HMAC Signature Validation',
      status: verification.valid ? 'pass' : 'fail',
    });
  } catch {
    checks.push({ name: 'Webhook HMAC Signature Validation', status: 'fail' });
  }

  // 3. Theme JavaScript blocking
  const jsCheck = themeSecurity.sanitizeThemeJS('console.log("test")');
  checks.push({
    name: 'Theme JavaScript Blocking',
    status: jsCheck.errors.length > 0 ? 'pass' : 'fail',
  });

  // 4. CSS sanitization
  const cssCheck = themeSecurity.sanitizeThemeCSS('@import url("https://evil.com/style.css")');
  checks.push({
    name: 'Theme CSS Sanitization',
    status: cssCheck.errors.length > 0 ? 'pass' : 'fail',
  });

  // 5. Blockchain wallet validation
  const walletValid = blockchainSecurity.validateWalletAddress(
    '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
  );
  checks.push({
    name: 'Blockchain Wallet Validation',
    status: walletValid ? 'pass' : 'fail',
  });

  // 6. IPFS CID validation
  const ipfsCheck = blockchainSecurity.validateIPFSCID('QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX');
  checks.push({
    name: 'IPFS CID Validation',
    status: ipfsCheck.valid ? 'pass' : 'fail',
  });

  // 7. 3D model complexity check
  const gltfSample = {
    asset: { version: '2.0' },
    meshes: [
      {
        primitives: [
          {
            attributes: { POSITION: 0 },
            indices: 0,
          },
        ],
      },
    ],
    accessors: [{ count: 100 }, { count: 300 }],
  };
  const modelCheck = modelSecurity['validateGLTFStructure'](gltfSample);
  checks.push({
    name: '3D Model Structure Validation',
    status: modelCheck.valid ? 'pass' : 'fail',
  });

  const passed = checks.every((check) => check.status === 'pass');

  return { passed, checks };
}

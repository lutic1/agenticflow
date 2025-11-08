/**
 * Input Sanitization and Validation
 * Fixes: V-001 (XSS), V-002 (SSRF), V-003 (Template Injection), V-004 (CSV Injection), V-005 (SVG)
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Fixes: V-001 (CVSS 9.6)
 */
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['href', 'class', 'id'],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false
  });
}

/**
 * Validate and sanitize URLs to prevent SSRF
 * Fixes: V-002 (CVSS 9.1)
 */
export function validateURL(url: string): { valid: boolean; sanitized?: string; error?: string } {
  try {
    const parsed = new URL(url);

    // Block dangerous protocols
    const allowedProtocols = ['http:', 'https:'];
    if (!allowedProtocols.includes(parsed.protocol)) {
      return { valid: false, error: `Protocol ${parsed.protocol} not allowed` };
    }

    // Block private IP ranges (SSRF prevention)
    const hostname = parsed.hostname;

    // Block localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      return { valid: false, error: 'Access to localhost is not allowed' };
    }

    // Block private IP ranges
    const privateIPRegex = /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|169\.254\.)/;
    if (privateIPRegex.test(hostname)) {
      return { valid: false, error: 'Access to private IP ranges is not allowed' };
    }

    // Optional: Whitelist allowed domains
    const allowedDomains = [
      'unsplash.com',
      'pexels.com',
      'pixabay.com',
      'images.unsplash.com',
      'images.pexels.com'
    ];

    const isWhitelisted = allowedDomains.some(domain =>
      hostname === domain || hostname.endsWith(`.${domain}`)
    );

    if (!isWhitelisted) {
      return { valid: false, error: 'Domain not in whitelist' };
    }

    return { valid: true, sanitized: parsed.toString() };
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Sanitize template strings to prevent template injection
 * Fixes: V-003 (CVSS 8.8)
 */
export function sanitizeTemplate(template: string): string {
  // Remove dangerous patterns that could lead to code execution
  const dangerous = [
    /\$\{.*\}/g,           // Template literals
    /eval\(/gi,            // eval()
    /Function\(/gi,        // Function constructor
    /<script/gi,           // Script tags
    /javascript:/gi,       // JavaScript protocol
    /on\w+\s*=/gi         // Event handlers (onclick, onerror, etc.)
  ];

  let sanitized = template;
  dangerous.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  return sanitized;
}

/**
 * Sanitize CSV data to prevent formula injection
 * Fixes: V-004 (CVSS 8.5)
 */
export function sanitizeCSVCell(cell: string): string {
  if (typeof cell !== 'string') {
    return String(cell);
  }

  // Check for formula injection characters
  const formulaChars = ['=', '+', '-', '@'];

  if (formulaChars.some(char => cell.trimStart().startsWith(char))) {
    // Prefix with single quote to prevent formula execution
    return `'${cell}`;
  }

  return cell;
}

/**
 * Sanitize SVG content to prevent malicious code execution
 * Fixes: V-005 (CVSS 8.2)
 */
export function sanitizeSVG(svg: string): string {
  return DOMPurify.sanitize(svg, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_TAGS: ['use'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'foreignObject'],
    FORBID_ATTR: ['onload', 'onerror', 'onclick', 'onmouseover']
  });
}

/**
 * Validate file uploads
 */
export function validateFileUpload(file: File, options: {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
} = {}): { valid: boolean; error?: string } {
  const maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB default
  const allowedTypes = options.allowedTypes || [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ];
  const allowedExtensions = options.allowedExtensions || [
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'
  ];

  // Check file size
  if (file.size > maxSize) {
    return { valid: false, error: `File size ${file.size} exceeds maximum ${maxSize} bytes` };
  }

  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} not allowed` };
  }

  // Check file extension
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(extension)) {
    return { valid: false, error: `File extension ${extension} not allowed` };
  }

  return { valid: true };
}

/**
 * Validate text input length and content
 */
export function validateTextInput(text: string, options: {
  maxLength?: number;
  minLength?: number;
  allowedPattern?: RegExp;
} = {}): { valid: boolean; error?: string } {
  const maxLength = options.maxLength || 10000;
  const minLength = options.minLength || 0;

  if (text.length > maxLength) {
    return { valid: false, error: `Text exceeds maximum length of ${maxLength}` };
  }

  if (text.length < minLength) {
    return { valid: false, error: `Text below minimum length of ${minLength}` };
  }

  if (options.allowedPattern && !options.allowedPattern.test(text)) {
    return { valid: false, error: 'Text contains invalid characters' };
  }

  return { valid: true };
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 60000 // 1 minute
  ) {}

  check(identifier: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];

    // Remove old requests outside the window
    const recentRequests = requests.filter(time => now - time < this.windowMs);

    if (recentRequests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...recentRequests);
      const retryAfter = Math.ceil((oldestRequest + this.windowMs - now) / 1000);
      return { allowed: false, retryAfter };
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);

    return { allowed: true };
  }

  reset(identifier: string): void {
    this.requests.delete(identifier);
  }
}

/**
 * Content Security Policy headers
 */
export const CSP_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Note: 'unsafe-eval' needed for some chart libraries
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.unsplash.com https://api.pexels.com",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'"
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
};

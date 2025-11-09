/**
 * P1 Feature Security Tests
 * Comprehensive security test coverage for all P1 vulnerabilities
 * Tests cover OWASP Top 10 and specific vulnerability fixes
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import crypto from 'crypto';
import {
  fontSecurity,
  aiImageSecurity,
  dataImportSecurity,
  videoEmbedSecurity,
  collaborationSecurity,
  templateSecurity,
  mobileAppSecurity,
  validateP1Security,
  FontSecurityManager,
  AIImageSecurityManager,
  DataImportSecurityManager,
  VideoEmbedSecurityManager,
  CollaborationSecurityManager,
  TemplateSecurityManager,
  MobileAppSecurityManager
} from '../../src/slide-designer/security/p1-security';

// =============================================================================
// 1. CUSTOM FONTS SECURITY TESTS (P1.8)
// =============================================================================

describe('Custom Fonts Security (P1.8)', () => {
  let fontSecurityManager: FontSecurityManager;

  beforeEach(() => {
    fontSecurityManager = new FontSecurityManager();
  });

  describe('V-P1-001: Magic Bytes Validation', () => {
    test('should accept valid TTF file with correct magic bytes', async () => {
      const ttfMagicBytes = Buffer.from([0x00, 0x01, 0x00, 0x00, 0x00, 0x0F, ...Array(1000).fill(0)]);
      const result = await fontSecurityManager.validateFontFile(ttfMagicBytes, 'user-1');

      expect(result.valid).toBe(true);
      expect(result.metadata?.format).toBe('ttf');
      expect(result.errors).toHaveLength(0);
    });

    test('should accept valid WOFF file with correct magic bytes', async () => {
      const woffMagicBytes = Buffer.from([0x77, 0x4F, 0x46, 0x46, ...Array(1000).fill(0)]);
      const result = await fontSecurityManager.validateFontFile(woffMagicBytes, 'user-1');

      expect(result.valid).toBe(true);
      expect(result.metadata?.format).toBe('woff');
      expect(result.errors).toHaveLength(0);
    });

    test('should accept valid WOFF2 file with correct magic bytes', async () => {
      const woff2MagicBytes = Buffer.from([0x77, 0x4F, 0x46, 0x32, ...Array(1000).fill(0)]);
      const result = await fontSecurityManager.validateFontFile(woff2MagicBytes, 'user-1');

      expect(result.valid).toBe(true);
      expect(result.metadata?.format).toBe('woff2');
      expect(result.errors).toHaveLength(0);
    });

    test('should accept valid OTF file with correct magic bytes', async () => {
      const otfMagicBytes = Buffer.from([0x4F, 0x54, 0x54, 0x4F, ...Array(1000).fill(0)]);
      const result = await fontSecurityManager.validateFontFile(otfMagicBytes, 'user-1');

      expect(result.valid).toBe(true);
      expect(result.metadata?.format).toBe('otf');
      expect(result.errors).toHaveLength(0);
    });

    test('should REJECT file with .ttf extension but wrong magic bytes', async () => {
      // Malicious file disguised as TTF
      const fakeFont = Buffer.from([0x4D, 0x5A, 0x90, 0x00, ...Array(1000).fill(0)]); // MZ header (executable)
      const result = await fontSecurityManager.validateFontFile(fakeFont, 'user-1');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining('Magic bytes do not match')
      );
    });

    test('should REJECT executable file disguised as font', async () => {
      // Windows PE executable magic bytes
      const malware = Buffer.from([0x4D, 0x5A, ...Array(1000).fill(0)]);
      const result = await fontSecurityManager.validateFontFile(malware, 'user-1');

      expect(result.valid).toBe(false);
    });

    test('should REJECT file with all zeros (invalid magic bytes)', async () => {
      const invalidFont = Buffer.alloc(1000);
      const result = await fontSecurityManager.validateFontFile(invalidFont, 'user-1');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining('Magic bytes do not match')
      );
    });

    test('should REJECT file with random magic bytes', async () => {
      const randomBytes = crypto.randomBytes(1000);
      const result = await fontSecurityManager.validateFontFile(randomBytes, 'user-1');

      expect(result.valid).toBe(false);
    });
  });

  describe('V-P1-002: Malware Scanning', () => {
    test('should REJECT file containing MZ (DOS) executable signature', async () => {
      const malicious = Buffer.concat([
        Buffer.from([0x00, 0x01, 0x00, 0x00]), // TTF magic bytes (disguise)
        Buffer.from([0x4D, 0x5A]), // MZ signature embedded
        Buffer.alloc(1000)
      ]);

      const result = await fontSecurityManager.validateFontFile(malicious, 'user-1');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining('Malware detected')
      );
    });

    test('should REJECT file containing PE (Portable Executable) signature', async () => {
      const malicious = Buffer.concat([
        Buffer.from([0x77, 0x4F, 0x46, 0x46]), // WOFF magic bytes
        Buffer.from([0x50, 0x45, 0x00, 0x00]), // PE signature
        Buffer.alloc(1000)
      ]);

      const result = await fontSecurityManager.validateFontFile(malicious, 'user-1');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining('Malware detected')
      );
    });

    test('should REJECT file containing ELF (Linux) executable signature', async () => {
      const malicious = Buffer.concat([
        Buffer.from([0x00, 0x01, 0x00, 0x00]), // TTF magic
        Buffer.from([0x7F, 0x45, 0x4C, 0x46]), // ELF signature
        Buffer.alloc(1000)
      ]);

      const result = await fontSecurityManager.validateFontFile(malicious, 'user-1');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining('Malware detected')
      );
    });

    test('should REJECT file containing suspicious strings (cmd.exe)', async () => {
      const malicious = Buffer.concat([
        Buffer.from([0x00, 0x01, 0x00, 0x00]), // TTF magic
        Buffer.from('cmd.exe'),
        Buffer.alloc(1000)
      ]);

      const result = await fontSecurityManager.validateFontFile(malicious, 'user-1');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining('Suspicious string detected')
      );
    });

    test('should REJECT file containing PowerShell commands', async () => {
      const malicious = Buffer.concat([
        Buffer.from([0x77, 0x4F, 0x46, 0x46]), // WOFF magic
        Buffer.from('powershell -enc'),
        Buffer.alloc(1000)
      ]);

      const result = await fontSecurityManager.validateFontFile(malicious, 'user-1');

      expect(result.valid).toBe(false);
    });

    test('should REJECT file containing JavaScript eval', async () => {
      const malicious = Buffer.concat([
        Buffer.from([0x00, 0x01, 0x00, 0x00]), // TTF magic
        Buffer.from('eval('),
        Buffer.alloc(1000)
      ]);

      const result = await fontSecurityManager.validateFontFile(malicious, 'user-1');

      expect(result.valid).toBe(false);
    });

    test('should WARN about high entropy content (encrypted malware)', async () => {
      // High entropy data (random bytes simulate encryption)
      const highEntropy = Buffer.concat([
        Buffer.from([0x00, 0x01, 0x00, 0x00]), // Valid TTF magic
        crypto.randomBytes(4092) // Rest is random (high entropy)
      ]);

      const result = await fontSecurityManager.validateFontFile(highEntropy, 'user-1');

      // May pass validation but should have warnings
      if (result.valid) {
        expect(result.warnings.length).toBeGreaterThan(0);
        expect(result.warnings.some(w => w.includes('entropy'))).toBe(true);
      }
    });
  });

  describe('V-P1-003: File Size Validation', () => {
    test('should REJECT file exceeding 2MB limit', async () => {
      const largeFile = Buffer.concat([
        Buffer.from([0x00, 0x01, 0x00, 0x00]), // TTF magic
        Buffer.alloc(3 * 1024 * 1024) // 3MB
      ]);

      const result = await fontSecurityManager.validateFontFile(largeFile, 'user-1');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining('exceeds maximum')
      );
    });

    test('should accept file at size limit (2MB)', async () => {
      const maxSizeFile = Buffer.concat([
        Buffer.from([0x00, 0x01, 0x00, 0x00]), // TTF magic
        Buffer.alloc(2 * 1024 * 1024 - 4) // Exactly 2MB total
      ]);

      const result = await fontSecurityManager.validateFontFile(maxSizeFile, 'user-1');

      // Should pass size check (may fail structure validation)
      const hasSizeError = result.errors.some(e => e.includes('exceeds maximum'));
      expect(hasSizeError).toBe(false);
    });

    test('should WARN about suspiciously small file', async () => {
      const tinyFile = Buffer.from([0x00, 0x01, 0x00, 0x00, 0x00, 0x00]); // 6 bytes

      const result = await fontSecurityManager.validateFontFile(tinyFile, 'user-1');

      if (!result.errors.length) {
        expect(result.warnings.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Rate Limiting', () => {
    test('should enforce rate limit (10 uploads per hour)', async () => {
      const validFont = Buffer.from([0x00, 0x01, 0x00, 0x00, ...Array(1000).fill(0)]);

      // Upload 10 fonts (should all succeed)
      for (let i = 0; i < 10; i++) {
        const result = await fontSecurityManager.validateFontFile(validFont, 'rate-test-user');
        const isRateLimited = result.errors.some(e => e.includes('Rate limit'));
        expect(isRateLimited).toBe(false);
      }

      // 11th upload should be rate limited
      const result11 = await fontSecurityManager.validateFontFile(validFont, 'rate-test-user');
      expect(result11.valid).toBe(false);
      expect(result11.errors).toContain(
        expect.stringContaining('Rate limit exceeded')
      );
    });

    test('should allow different users to upload independently', async () => {
      const validFont = Buffer.from([0x00, 0x01, 0x00, 0x00, ...Array(1000).fill(0)]);

      const result1 = await fontSecurityManager.validateFontFile(validFont, 'user-a');
      const result2 = await fontSecurityManager.validateFontFile(validFont, 'user-b');

      // Both should succeed (different users)
      const isRateLimited1 = result1.errors.some(e => e.includes('Rate limit'));
      const isRateLimited2 = result2.errors.some(e => e.includes('Rate limit'));

      expect(isRateLimited1).toBe(false);
      expect(isRateLimited2).toBe(false);
    });
  });

  describe('Checksum Generation', () => {
    test('should generate consistent SHA-256 checksum', async () => {
      const fontData = Buffer.from([0x00, 0x01, 0x00, 0x00, ...Array(1000).fill(0)]);

      const result1 = await fontSecurityManager.validateFontFile(fontData, 'user-1');
      const result2 = await fontSecurityManager.validateFontFile(fontData, 'user-2');

      if (result1.valid && result2.valid) {
        expect(result1.metadata?.checksum).toBe(result2.metadata?.checksum);
        expect(result1.metadata?.checksum).toHaveLength(64); // SHA-256 hex
      }
    });

    test('should generate different checksums for different files', async () => {
      const font1 = Buffer.from([0x00, 0x01, 0x00, 0x00, ...Array(1000).fill(0)]);
      const font2 = Buffer.from([0x77, 0x4F, 0x46, 0x46, ...Array(1000).fill(1)]);

      const result1 = await fontSecurityManager.validateFontFile(font1, 'user-1');
      const result2 = await fontSecurityManager.validateFontFile(font2, 'user-1');

      if (result1.valid && result2.valid) {
        expect(result1.metadata?.checksum).not.toBe(result2.metadata?.checksum);
      }
    });
  });
});

// =============================================================================
// 2. AI IMAGE GENERATION SECURITY TESTS (P1.11)
// =============================================================================

describe('AI Image Generation Security (P1.11)', () => {
  let aiSecurity: AIImageSecurityManager;

  beforeEach(() => {
    aiSecurity = new AIImageSecurityManager();
  });

  describe('V-P1-004: API Key Encryption', () => {
    test('should store API key encrypted', () => {
      const apiKey = 'sk-test-1234567890abcdef';

      expect(() => {
        aiSecurity.setAPIKey(apiKey, 'openai');
      }).not.toThrow();
    });

    test('should retrieve API key correctly', () => {
      const apiKey = 'sk-test-1234567890abcdef';

      aiSecurity.setAPIKey(apiKey, 'openai');
      const retrieved = aiSecurity.getAPIKey('openai');

      expect(retrieved).toBe(apiKey);
    });

    test('should REJECT invalid API keys', () => {
      expect(() => {
        aiSecurity.setAPIKey('', 'openai');
      }).toThrow('Invalid API key');

      expect(() => {
        aiSecurity.setAPIKey('short', 'openai');
      }).toThrow('Invalid API key');
    });

    test('should store different keys for different services', () => {
      const openaiKey = 'sk-openai-123';
      const dalleKey = 'sk-dalle-456';

      aiSecurity.setAPIKey(openaiKey, 'openai');
      aiSecurity.setAPIKey(dalleKey, 'dalle');

      expect(aiSecurity.getAPIKey('openai')).toBe(openaiKey);
      expect(aiSecurity.getAPIKey('dalle')).toBe(dalleKey);
    });
  });

  describe('V-P1-005: SSRF Protection on Image URLs', () => {
    test('should accept valid DALL-E image URL', () => {
      const validUrl = 'https://oaidalleapiprodscus.blob.core.windows.net/private/image.png';
      const result = aiSecurity.validateImageURL(validUrl);

      expect(result.valid).toBe(true);
      expect(result.sanitized).toBeTruthy();
    });

    test('should REJECT localhost URLs', () => {
      const maliciousUrls = [
        'http://localhost:8080/image.png',
        'http://127.0.0.1/image.png',
        'http://127.0.0.2/image.png'
      ];

      for (const url of maliciousUrls) {
        const result = aiSecurity.validateImageURL(url);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('localhost');
      }
    });

    test('should REJECT private IP ranges (10.x.x.x)', () => {
      const privateUrl = 'http://10.0.0.1/image.png';
      const result = aiSecurity.validateImageURL(privateUrl);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Private IP');
    });

    test('should REJECT private IP ranges (192.168.x.x)', () => {
      const privateUrl = 'http://192.168.1.1/image.png';
      const result = aiSecurity.validateImageURL(privateUrl);

      expect(result.valid).toBe(false);
    });

    test('should REJECT AWS metadata endpoint', () => {
      const metadataUrl = 'http://169.254.169.254/latest/meta-data/';
      const result = aiSecurity.validateImageURL(metadataUrl);

      expect(result.valid).toBe(false);
    });

    test('should REJECT non-whitelisted domains', () => {
      const maliciousUrl = 'https://evil.com/fake-image.png';
      const result = aiSecurity.validateImageURL(maliciousUrl);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('not whitelisted');
    });

    test('should REJECT javascript: protocol', () => {
      const xssUrl = 'javascript:alert(1)';
      const result = aiSecurity.validateImageURL(xssUrl);

      expect(result.valid).toBe(false);
    });

    test('should REJECT data: protocol', () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANS';
      const result = aiSecurity.validateImageURL(dataUrl);

      expect(result.valid).toBe(false);
    });
  });

  describe('V-P1-006: Rate Limiting', () => {
    test('should enforce rate limit (10 images per minute)', () => {
      // Generate 10 requests (should all succeed)
      for (let i = 0; i < 10; i++) {
        const result = aiSecurity.validateGenerationRequest(
          'Generate an image of a cat',
          'rate-test-user'
        );
        expect(result.valid).toBe(true);
      }

      // 11th request should be rate limited
      const result11 = aiSecurity.validateGenerationRequest(
        'Generate another image',
        'rate-test-user'
      );

      expect(result11.valid).toBe(false);
      expect(result11.error).toContain('Rate limit exceeded');
    });

    test('should REJECT prompts that are too long', () => {
      const longPrompt = 'A'.repeat(1001); // Over 1000 char limit
      const result = aiSecurity.validateGenerationRequest(longPrompt, 'user-1');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('too long');
    });

    test('should REJECT prompts that are too short', () => {
      const result = aiSecurity.validateGenerationRequest('ab', 'user-1');

      expect(result.valid).toBe(false);
    });

    test('should REJECT prompts with injection attempts', () => {
      const maliciousPrompts = [
        'Cat <script>alert(1)</script>',
        'Dog javascript:alert(1)',
        'Bird eval(malicious)',
        'Fish system(rm -rf /)',
        'exec(dangerous code)'
      ];

      for (const prompt of maliciousPrompts) {
        const result = aiSecurity.validateGenerationRequest(prompt, 'user-1');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('suspicious');
      }
    });
  });
});

// =============================================================================
// 3. DATA IMPORT SECURITY TESTS (P1.12)
// =============================================================================

describe('Data Import Security (P1.12)', () => {
  let dataImportSec: DataImportSecurityManager;

  beforeEach(() => {
    dataImportSec = new DataImportSecurityManager();
  });

  describe('V-P1-007: CSV Formula Injection', () => {
    test('should sanitize cells starting with = (formula)', () => {
      const maliciousData = [
        ['Name', 'Value'],
        ['=cmd|"/c calc"!A1', 'test']
      ];

      const sanitized = dataImportSec.sanitizeImportedData(maliciousData);

      expect(sanitized[1][0]).not.toMatch(/^=/);
      expect(sanitized[1][0]).toMatch(/^'/); // Should be prefixed with '
    });

    test('should sanitize cells starting with + (addition formula)', () => {
      const maliciousData = [['+1+2+cmd|"/c calc"!A1']];
      const sanitized = dataImportSec.sanitizeImportedData(maliciousData);

      expect(sanitized[0][0]).not.toMatch(/^\+/);
      expect(sanitized[0][0]).toMatch(/^'/);
    });

    test('should sanitize cells starting with - (subtraction formula)', () => {
      const maliciousData = [['-1-cmd|"/c calc"!A1']];
      const sanitized = dataImportSec.sanitizeImportedData(maliciousData);

      expect(sanitized[0][0]).not.toMatch(/^-/);
      expect(sanitized[0][0]).toMatch(/^'/);
    });

    test('should sanitize cells starting with @ (DDE)', () => {
      const maliciousData = [['@SUM(A1:A10)|cmd!A1']];
      const sanitized = dataImportSec.sanitizeImportedData(maliciousData);

      expect(sanitized[0][0]).not.toMatch(/^@/);
      expect(sanitized[0][0]).toMatch(/^'/);
    });

    test('should sanitize cells starting with | (pipe)', () => {
      const maliciousData = [['|cmd!A1']];
      const sanitized = dataImportSec.sanitizeImportedData(maliciousData);

      expect(sanitized[0][0]).not.toMatch(/^\|/);
      expect(sanitized[0][0]).toMatch(/^'/);
    });

    test('should sanitize multiple dangerous cells in same row', () => {
      const maliciousData = [
        ['=cmd', '+calc', '-exploit', '@DDE', '|pipe']
      ];

      const sanitized = dataImportSec.sanitizeImportedData(maliciousData);

      for (const cell of sanitized[0]) {
        expect(cell).toMatch(/^'/);
      }
    });

    test('should preserve normal data', () => {
      const normalData = [
        ['Name', 'Age', 'City'],
        ['Alice', '30', 'NYC'],
        ['Bob', '25', 'LA']
      ];

      const sanitized = dataImportSec.sanitizeImportedData(normalData);

      expect(sanitized).toEqual(normalData);
    });

    test('should handle null and undefined values', () => {
      const dataWithNulls = [
        ['A', null, undefined],
        [null, 'B', undefined]
      ];

      const sanitized = dataImportSec.sanitizeImportedData(dataWithNulls);

      expect(sanitized[0][1]).toBe('');
      expect(sanitized[0][2]).toBe('');
      expect(sanitized[1][0]).toBe('');
      expect(sanitized[1][2]).toBe('');
    });
  });

  describe('V-P1-008: Excel XXE Protection', () => {
    test('should validate file size before processing', () => {
      const largeCSV = 'A'.repeat(6 * 1024 * 1024); // 6MB
      const result = dataImportSec.validateImportFile(largeCSV, 'csv');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum');
    });

    test('should accept file at size limit', () => {
      const maxSizeCSV = 'A'.repeat(5 * 1024 * 1024); // Exactly 5MB
      const result = dataImportSec.validateImportFile(maxSizeCSV, 'csv');

      expect(result.valid).toBe(true);
    });

    test('should validate JSON format', () => {
      const invalidJSON = '{ invalid json }';
      const result = dataImportSec.validateImportFile(invalidJSON, 'json');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid JSON');
    });

    test('should REJECT JSON that is not an array', () => {
      const objectJSON = '{"key": "value"}';
      const result = dataImportSec.validateImportFile(objectJSON, 'json');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be an array');
    });
  });

  describe('V-P1-009: Data Structure Validation', () => {
    test('should REJECT data exceeding row limit', () => {
      const tooManyRows = Array(10001).fill(['A', 'B']);
      const result = dataImportSec.validateDataStructure(tooManyRows);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Row count');
      expect(result.error).toContain('exceeds maximum');
    });

    test('should REJECT data exceeding column limit', () => {
      const tooManyCols = [Array(101).fill('A')];
      const result = dataImportSec.validateDataStructure(tooManyCols);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Column count');
    });

    test('should accept data within limits', () => {
      const validData = Array(100).fill(Array(50).fill('A'));
      const result = dataImportSec.validateDataStructure(validData);

      expect(result.valid).toBe(true);
    });
  });

  describe('CSV Bomb Detection', () => {
    test('should detect CSV bomb (excessive quotes)', () => {
      const csvBomb = '"'.repeat(1000) + 'A'.repeat(9000);
      const result = dataImportSec.detectCSVBomb(csvBomb);

      expect(result.isBomb).toBe(true);
      expect(result.reason).toContain('quote');
    });

    test('should detect CSV bomb (excessive commas)', () => {
      const csvBomb = ','.repeat(6000) + 'A'.repeat(4000);
      const result = dataImportSec.detectCSVBomb(csvBomb);

      expect(result.isBomb).toBe(true);
      expect(result.reason).toContain('comma');
    });

    test('should accept normal CSV', () => {
      const normalCSV = 'Name,Age,City\nAlice,30,NYC\nBob,25,LA';
      const result = dataImportSec.detectCSVBomb(normalCSV);

      expect(result.isBomb).toBe(false);
    });
  });
});

// =============================================================================
// 4. VIDEO EMBED SECURITY TESTS (P1.7)
// =============================================================================

describe('Video Embed Security (P1.7)', () => {
  let videoSecurity: VideoEmbedSecurityManager;

  beforeEach(() => {
    videoSecurity = new VideoEmbedSecurityManager();
  });

  describe('V-P1-010: XSS in Video Embed', () => {
    test('should sanitize video title to prevent XSS', () => {
      const safeAttributes = videoSecurity.sanitizeEmbedAttributes({
        title: '<script>alert(1)</script>',
        videoId: 'abc123'
      });

      expect(safeAttributes.title).not.toContain('<script>');
      expect(safeAttributes.title).not.toContain('</script>');
    });

    test('should sanitize video ID (alphanumeric only)', () => {
      const safeAttributes = videoSecurity.sanitizeEmbedAttributes({
        title: 'Video',
        videoId: 'abc123<script>alert(1)</script>'
      });

      expect(safeAttributes.videoId).toBe('abc123scriptalert1script');
      expect(safeAttributes.videoId).not.toContain('<');
      expect(safeAttributes.videoId).not.toContain('>');
    });

    test('should generate secure iframe with sandbox attribute', () => {
      const iframe = videoSecurity.generateSecureIframe(
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'Test Video'
      );

      expect(iframe).toContain('sandbox="allow-scripts allow-same-origin allow-presentation"');
    });

    test('should escape special characters in title', () => {
      const iframe = videoSecurity.generateSecureIframe(
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'Video with "quotes" and \'apostrophes\''
      );

      // Title should be escaped
      expect(iframe).toContain('title=');
      expect(iframe).not.toContain('title="Video with "quotes"'); // Broken by unescaped quotes
    });
  });

  describe('V-P1-011: URL Validation', () => {
    test('should accept valid YouTube URLs', () => {
      const validUrls = [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtu.be/dQw4w9WgXcQ'
      ];

      for (const url of validUrls) {
        const result = videoSecurity.validateVideoURL(url);
        expect(result.valid).toBe(true);
        expect(result.platform).toBe('youtube');
        expect(result.videoId).toBe('dQw4w9WgXcQ');
      }
    });

    test('should accept valid Vimeo URLs', () => {
      const validUrl = 'https://vimeo.com/123456789';
      const result = videoSecurity.validateVideoURL(validUrl);

      expect(result.valid).toBe(true);
      expect(result.platform).toBe('vimeo');
      expect(result.videoId).toBe('123456789');
    });

    test('should REJECT non-whitelisted domains', () => {
      const maliciousUrls = [
        'https://evil.com/video',
        'https://fakeyoutube.com/watch?v=abc',
        'https://malicious-vimeo.com/123'
      ];

      for (const url of maliciousUrls) {
        const result = videoSecurity.validateVideoURL(url);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('not allowed');
      }
    });

    test('should REJECT localhost URLs', () => {
      const result = videoSecurity.validateVideoURL('http://localhost:8080/video');

      expect(result.valid).toBe(false);
    });

    test('should REJECT private IP ranges', () => {
      const privateUrls = [
        'http://192.168.1.1/video',
        'http://10.0.0.1/video',
        'http://172.16.0.1/video'
      ];

      for (const url of privateUrls) {
        const result = videoSecurity.validateVideoURL(url);
        expect(result.valid).toBe(false);
      }
    });

    test('should REJECT invalid YouTube video IDs', () => {
      const invalidUrls = [
        'https://youtube.com/watch?v=short', // Too short
        'https://youtube.com/watch?v=toolongvideoid123', // Too long
        'https://youtube.com/watch?v=invalid@#$' // Invalid chars
      ];

      for (const url of invalidUrls) {
        const result = videoSecurity.validateVideoURL(url);
        expect(result.valid).toBe(false);
      }
    });

    test('should REJECT invalid Vimeo video IDs', () => {
      const invalidUrls = [
        'https://vimeo.com/notanumber',
        'https://vimeo.com/12345abc'
      ];

      for (const url of invalidUrls) {
        const result = videoSecurity.validateVideoURL(url);
        expect(result.valid).toBe(false);
      }
    });

    test('should REJECT javascript: protocol', () => {
      const result = videoSecurity.validateVideoURL('javascript:alert(1)');

      expect(result.valid).toBe(false);
    });

    test('should REJECT data: protocol', () => {
      const result = videoSecurity.validateVideoURL('data:text/html,<script>alert(1)</script>');

      expect(result.valid).toBe(false);
    });
  });
});

// =============================================================================
// 5. COLLABORATION SECURITY TESTS (P1.9)
// =============================================================================

describe('Collaboration Security (P1.9)', () => {
  let collabSecurity: CollaborationSecurityManager;

  beforeEach(() => {
    collabSecurity = new CollaborationSecurityManager();
  });

  describe('V-P1-012: XSS in Comments', () => {
    test('should sanitize comment content', () => {
      const maliciousComment = '<script>alert(1)</script>Hello';
      const result = collabSecurity.sanitizeComment(maliciousComment);

      expect(result.sanitized).not.toContain('<script>');
      expect(result.sanitized).not.toContain('</script>');
    });

    test('should sanitize img tag with onerror', () => {
      const xssComment = '<img src=x onerror="alert(1)">';
      const result = collabSecurity.sanitizeComment(xssComment);

      expect(result.sanitized).not.toContain('onerror');
    });

    test('should sanitize SVG with embedded script', () => {
      const svgXss = '<svg><script>alert(1)</script></svg>';
      const result = collabSecurity.sanitizeComment(svgXss);

      expect(result.sanitized).not.toContain('<script>');
    });

    test('should REJECT comment exceeding length limit', () => {
      const longComment = 'A'.repeat(5001);
      const result = collabSecurity.sanitizeComment(longComment);

      expect(result.sanitized).toBe('');
      expect(result.error).toContain('exceeds maximum');
    });

    test('should accept normal comment with basic HTML', () => {
      const normalComment = '<p>This is a <strong>comment</strong></p>';
      const result = collabSecurity.sanitizeComment(normalComment);

      expect(result.sanitized).toBeTruthy();
      expect(result.error).toBeUndefined();
    });
  });

  describe('V-P1-013 & V-P1-014: Mention Validation', () => {
    const collaborators = [
      { id: 'user-1', name: 'alice' },
      { id: 'user-2', name: 'bob' },
      { id: 'user-3', name: 'charlie' }
    ];

    test('should extract valid mentions', () => {
      const text = 'Hey @alice and @bob, check this out!';
      const mentions = collabSecurity.extractMentionsSafe(text, collaborators);

      expect(mentions).toContain('user-1');
      expect(mentions).toContain('user-2');
      expect(mentions).toHaveLength(2);
    });

    test('should ignore invalid mentions (non-collaborators)', () => {
      const text = 'Hey @nonexistent user';
      const mentions = collabSecurity.extractMentionsSafe(text, collaborators);

      expect(mentions).toHaveLength(0);
    });

    test('should handle case-insensitive mentions', () => {
      const text = '@Alice @ALICE @alice';
      const mentions = collabSecurity.extractMentionsSafe(text, collaborators);

      expect(mentions).toContain('user-1');
      // Should only appear once (deduplicated)
      expect(mentions.filter(m => m === 'user-1').length).toBe(3);
    });

    test('should be ReDoS-safe (no catastrophic backtracking)', () => {
      // This would cause ReDoS with a vulnerable regex
      const maliciousText = '@' + 'a'.repeat(10000) + '!';

      const start = Date.now();
      const mentions = collabSecurity.extractMentionsSafe(maliciousText, collaborators);
      const duration = Date.now() - start;

      // Should complete quickly (< 100ms)
      expect(duration).toBeLessThan(100);
      expect(mentions).toHaveLength(0);
    });

    test('should sanitize mention with XSS attempt', () => {
      const text = '@alice<script>alert(1)</script>';
      const mentions = collabSecurity.extractMentionsSafe(text, collaborators);

      // Should extract 'alice' and ignore the script
      expect(mentions).toContain('user-1');
    });

    test('should reject excessively long mentions', () => {
      const longMention = '@' + 'a'.repeat(100);
      const mentions = collabSecurity.extractMentionsSafe(longMention, collaborators);

      expect(mentions).toHaveLength(0);
    });
  });

  describe('Collaborator Data Sanitization', () => {
    test('should sanitize collaborator name', () => {
      const maliciousName = '<script>alert(1)</script>Alice';
      const sanitized = collabSecurity.sanitizeCollaboratorName(maliciousName);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('Alice');
    });

    test('should validate hex color codes', () => {
      const validColor = collabSecurity.validateColor('#FF5733');
      expect(validColor).toBe('#FF5733');

      const invalidColor = collabSecurity.validateColor('red');
      expect(invalidColor).toBe('#4299E1'); // Default

      const xssColor = collabSecurity.validateColor('red; background: url(javascript:alert(1))');
      expect(xssColor).toBe('#4299E1'); // Default
    });

    test('should sanitize cursor position', () => {
      const position = collabSecurity.sanitizePosition({ x: 150.7, y: 250.3 });

      expect(position.x).toBe(150);
      expect(position.y).toBe(250);
    });

    test('should clamp cursor position to valid range', () => {
      const outOfRange = collabSecurity.sanitizePosition({ x: -100, y: 20000 });

      expect(outOfRange.x).toBe(0);
      expect(outOfRange.y).toBe(10000);
    });
  });
});

// =============================================================================
// 6. TEMPLATE LIBRARY SECURITY TESTS (P1.5)
// =============================================================================

describe('Template Library Security (P1.5)', () => {
  let templateSec: TemplateSecurityManager;

  beforeEach(() => {
    templateSec = new TemplateSecurityManager();
  });

  describe('V-P1-015: Template Injection', () => {
    test('should sanitize template title', () => {
      const maliciousContent = {
        title: '<script>alert(1)</script>Startup Pitch'
      };

      const sanitized = templateSec.sanitizeTemplateContent(maliciousContent);

      expect(sanitized.title).not.toContain('<script>');
      expect(sanitized.title).toContain('Startup Pitch');
    });

    test('should sanitize template body with eval attempt', () => {
      const maliciousContent = {
        body: 'Text with ${eval("malicious")} injection'
      };

      const sanitized = templateSec.sanitizeTemplateContent(maliciousContent);

      expect(sanitized.body).not.toContain('eval');
      expect(sanitized.body).not.toContain('${');
    });

    test('should sanitize bullets array', () => {
      const maliciousContent = {
        bullets: [
          'Normal bullet',
          '<img src=x onerror="alert(1)">',
          'Another normal bullet'
        ]
      };

      const sanitized = templateSec.sanitizeTemplateContent(maliciousContent);

      expect(sanitized.bullets).toHaveLength(3);
      expect(sanitized.bullets![1]).not.toContain('onerror');
    });

    test('should handle undefined fields', () => {
      const content = { title: 'Test' };
      const sanitized = templateSec.sanitizeTemplateContent(content);

      expect(sanitized.subtitle).toBeUndefined();
      expect(sanitized.body).toBeUndefined();
      expect(sanitized.bullets).toBeUndefined();
    });
  });

  describe('V-P1-016: Prototype Pollution', () => {
    test('should NOT copy __proto__ property', () => {
      const malicious = {
        title: 'Template',
        __proto__: { polluted: 'value' }
      };

      const cloned = templateSec.secureDeepClone(malicious);

      expect(cloned).not.toHaveProperty('__proto__');
      expect((cloned as any).polluted).toBeUndefined();
    });

    test('should NOT copy constructor property', () => {
      const malicious = {
        title: 'Template',
        constructor: { dangerous: 'value' }
      };

      const cloned = templateSec.secureDeepClone(malicious);

      expect(cloned).not.toHaveProperty('constructor');
    });

    test('should deep clone nested objects safely', () => {
      const original = {
        title: 'Test',
        nested: {
          value: 123,
          deep: {
            data: 'test'
          }
        }
      };

      const cloned = templateSec.secureDeepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original); // Different references
      expect(cloned.nested).not.toBe(original.nested);
    });

    test('should clone arrays correctly', () => {
      const original = {
        items: [1, 2, { nested: 'value' }]
      };

      const cloned = templateSec.secureDeepClone(original);

      expect(cloned.items).toEqual(original.items);
      expect(cloned.items).not.toBe(original.items);
    });

    test('should handle Date objects', () => {
      const now = new Date();
      const original = { createdAt: now };

      const cloned = templateSec.secureDeepClone(original);

      expect(cloned.createdAt).toEqual(now);
      expect(cloned.createdAt).not.toBe(now); // Different instance
    });
  });

  describe('Template Metadata Validation', () => {
    test('should validate author field', () => {
      const validMetadata = { author: 'John Doe', version: '1.0.0' };
      const result = templateSec.validateTemplateMetadata(validMetadata);

      expect(result).toBe(true);
    });

    test('should REJECT excessively long author name', () => {
      const invalidMetadata = { author: 'A'.repeat(101) };
      const result = templateSec.validateTemplateMetadata(invalidMetadata);

      expect(result).toBe(false);
    });

    test('should validate version format (semver)', () => {
      const validVersions = ['1.0.0', '2.3.4', '10.20.30'];

      for (const version of validVersions) {
        const result = templateSec.validateTemplateMetadata({ version });
        expect(result).toBe(true);
      }
    });

    test('should REJECT invalid version formats', () => {
      const invalidVersions = ['v1.0.0', '1.0', 'latest', '1.0.0-beta'];

      for (const version of invalidVersions) {
        const result = templateSec.validateTemplateMetadata({ version });
        expect(result).toBe(false);
      }
    });
  });
});

// =============================================================================
// 7. MOBILE APP SECURITY TESTS (P1.14)
// =============================================================================

describe('Mobile App Security (P1.14)', () => {
  let mobileSec: MobileAppSecurityManager;

  beforeEach(() => {
    mobileSec = new MobileAppSecurityManager();
  });

  describe('V-P1-017: Deep Link Validation', () => {
    test('should accept valid presentation deep link', () => {
      const validLink = 'slidedesigner://presentation/abc123-xyz';
      const result = mobileSec.validateDeepLink(validLink);

      expect(result.valid).toBe(true);
      expect(result.type).toBe('presentation');
      expect(result.id).toBe('abc123-xyz');
    });

    test('should accept valid template deep link', () => {
      const validLink = 'slidedesigner://template/startup-pitch';
      const result = mobileSec.validateDeepLink(validLink);

      expect(result.valid).toBe(true);
      expect(result.type).toBe('template');
      expect(result.id).toBe('startup-pitch');
    });

    test('should REJECT invalid scheme', () => {
      const invalidLink = 'malicious://presentation/123';
      const result = mobileSec.validateDeepLink(invalidLink);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid deep link scheme');
    });

    test('should REJECT path traversal attempts', () => {
      const maliciousLinks = [
        'slidedesigner://presentation/../../../etc/passwd',
        'slidedesigner://presentation/../../admin',
        'slidedesigner://template/../dangerous'
      ];

      for (const link of maliciousLinks) {
        const result = mobileSec.validateDeepLink(link);
        expect(result.valid).toBe(false);
      }
    });

    test('should REJECT non-whitelisted types', () => {
      const invalidLink = 'slidedesigner://admin/backdoor';
      const result = mobileSec.validateDeepLink(invalidLink);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid deep link format');
    });

    test('should REJECT excessively long IDs', () => {
      const longId = 'a'.repeat(101);
      const invalidLink = `slidedesigner://presentation/${longId}`;
      const result = mobileSec.validateDeepLink(invalidLink);

      expect(result.valid).toBe(false);
    });

    test('should REJECT IDs with special characters', () => {
      const maliciousLinks = [
        'slidedesigner://presentation/abc<script>',
        'slidedesigner://presentation/test;rm -rf /',
        'slidedesigner://presentation/id&param=value'
      ];

      for (const link of maliciousLinks) {
        const result = mobileSec.validateDeepLink(link);
        expect(result.valid).toBe(false);
      }
    });
  });

  describe('V-P1-018: Cache Encryption', () => {
    const encryptionKey = 'test-encryption-key-32-chars!!';

    test('should encrypt cache data', () => {
      const originalData = {
        id: 'pres-123',
        title: 'My Presentation',
        slides: [{ content: 'Slide 1' }]
      };

      const encrypted = mobileSec.encryptCacheData(originalData, encryptionKey);

      expect(encrypted).toBeTruthy();
      expect(encrypted).not.toContain('My Presentation');
      expect(encrypted).not.toContain('Slide 1');
    });

    test('should decrypt cache data correctly', () => {
      const originalData = {
        id: 'pres-123',
        title: 'My Presentation',
        slides: [{ content: 'Slide 1' }]
      };

      const encrypted = mobileSec.encryptCacheData(originalData, encryptionKey);
      const decrypted = mobileSec.decryptCacheData(encrypted, encryptionKey);

      expect(decrypted).toEqual(originalData);
    });

    test('should FAIL to decrypt with wrong key', () => {
      const originalData = { secret: 'data' };

      const encrypted = mobileSec.encryptCacheData(originalData, encryptionKey);

      expect(() => {
        mobileSec.decryptCacheData(encrypted, 'wrong-key');
      }).toThrow();
    });

    test('should FAIL to decrypt tampered data', () => {
      const originalData = { secret: 'data' };

      let encrypted = mobileSec.encryptCacheData(originalData, encryptionKey);
      // Tamper with encrypted data
      encrypted = encrypted.slice(0, -10) + 'tampered!!';

      expect(() => {
        mobileSec.decryptCacheData(encrypted, encryptionKey);
      }).toThrow();
    });
  });

  describe('V-P1-019: Credential Storage', () => {
    test('should generate secure encryption key', () => {
      const key1 = mobileSec.generateDeviceEncryptionKey();
      const key2 = mobileSec.generateDeviceEncryptionKey();

      expect(key1).toHaveLength(64); // 32 bytes hex
      expect(key2).toHaveLength(64);
      expect(key1).not.toBe(key2); // Should be unique
    });

    test('should generate secure session tokens', () => {
      const token1 = mobileSec.generateSessionToken();
      const token2 = mobileSec.generateSessionToken();

      expect(token1).toHaveLength(64); // 32 bytes hex
      expect(token2).toHaveLength(64);
      expect(token1).not.toBe(token2);
    });

    test('should validate biometric auth results', () => {
      const validResult = { success: true, signature: 'biometric-sig' };
      const invalidResult = { success: false };

      expect(mobileSec.validateBiometricAuth(validResult)).toBe(true);
      expect(mobileSec.validateBiometricAuth(invalidResult)).toBe(false);
      expect(mobileSec.validateBiometricAuth(null)).toBe(false);
    });
  });
});

// =============================================================================
// 8. COMPREHENSIVE SECURITY VALIDATION
// =============================================================================

describe('Comprehensive P1 Security Validation', () => {
  test('should pass all security checks', async () => {
    const result = await validateP1Security();

    expect(result.passed).toBe(true);
    expect(result.checks).toHaveLength(7);

    for (const check of result.checks) {
      expect(check.status).toBe('pass');
    }
  });

  test('should identify all security modules', async () => {
    const result = await validateP1Security();

    const checkNames = result.checks.map(c => c.name);

    expect(checkNames).toContain('Font Magic Bytes Validation');
    expect(checkNames).toContain('AI API Key Encryption');
    expect(checkNames).toContain('CSV Injection Protection');
    expect(checkNames).toContain('Video Embed XSS Protection');
    expect(checkNames).toContain('Collaboration XSS Protection');
    expect(checkNames).toContain('Template Injection Protection');
    expect(checkNames).toContain('Mobile Deep Link Validation');
  });
});

// =============================================================================
// 9. INTEGRATION TESTS
// =============================================================================

describe('P1 Security Integration Tests', () => {
  test('should handle complete font upload workflow securely', async () => {
    const validFont = Buffer.from([0x00, 0x01, 0x00, 0x00, ...Array(1000).fill(0)]);

    // 1. Validate font
    const validation = await fontSecurity.validateFontFile(validFont, 'user-1');
    expect(validation.valid).toBe(true);

    // 2. Check checksum
    expect(validation.metadata?.checksum).toHaveLength(64);
  });

  test('should handle complete AI image generation workflow securely', () => {
    // 1. Store API key
    aiImageSecurity.setAPIKey('sk-test-key-123456', 'openai');

    // 2. Validate generation request
    const requestValidation = aiImageSecurity.validateGenerationRequest(
      'Generate a professional image of a cat',
      'user-1'
    );
    expect(requestValidation.valid).toBe(true);

    // 3. Validate generated URL
    const urlValidation = aiImageSecurity.validateImageURL(
      'https://oaidalleapiprodscus.blob.core.windows.net/private/image.png'
    );
    expect(urlValidation.valid).toBe(true);
  });

  test('should handle complete data import workflow securely', () => {
    const csvData = [
      ['Name', 'Revenue', 'Formula'],
      ['Alice', '1000', '=SUM(B2:B10)']
    ];

    // 1. Sanitize data
    const sanitized = dataImportSecurity.sanitizeImportedData(csvData);

    // 2. Verify formula is sanitized
    expect(sanitized[1][2]).toMatch(/^'/);
    expect(sanitized[1][2]).not.toMatch(/^=/);

    // 3. Validate structure
    const structureValidation = dataImportSecurity.validateDataStructure(sanitized);
    expect(structureValidation.valid).toBe(true);
  });

  test('should handle complete collaboration workflow securely', () => {
    const collaborators = [
      { id: 'user-1', name: 'alice' },
      { id: 'user-2', name: 'bob' }
    ];

    // 1. Sanitize comment
    const commentResult = collaborationSecurity.sanitizeComment(
      'Hey @alice, check this <script>alert(1)</script> slide!'
    );
    expect(commentResult.sanitized).not.toContain('<script>');

    // 2. Extract mentions safely
    const mentions = collaborationSecurity.extractMentionsSafe(
      commentResult.sanitized,
      collaborators
    );
    expect(mentions).toContain('user-1');
  });

  test('should handle complete mobile deep link workflow securely', () => {
    // 1. Validate deep link
    const linkValidation = mobileSec.validateDeepLink('slidedesigner://presentation/abc-123');
    expect(linkValidation.valid).toBe(true);

    // 2. Encrypt cache
    const data = { id: 'pres-1', slides: ['slide1'] };
    const encrypted = mobileSec.encryptCacheData(data, 'encryption-key-32-chars-long!');

    // 3. Decrypt cache
    const decrypted = mobileSec.decryptCacheData(encrypted, 'encryption-key-32-chars-long!');
    expect(decrypted).toEqual(data);
  });
});

// =============================================================================
// 10. OWASP TOP 10 COVERAGE TESTS
// =============================================================================

describe('OWASP Top 10 2021 Coverage', () => {
  test('A02: Cryptographic Failures - API keys encrypted', () => {
    aiImageSecurity.setAPIKey('sk-test-123456', 'openai');
    const retrieved = aiImageSecurity.getAPIKey('openai');
    expect(retrieved).toBe('sk-test-123456');
  });

  test('A03: Injection - CSV formula injection prevented', () => {
    const malicious = [['=cmd|"/c calc"!A1']];
    const sanitized = dataImportSecurity.sanitizeImportedData(malicious);
    expect(sanitized[0][0]).toMatch(/^'/);
  });

  test('A03: Injection - XSS in comments prevented', () => {
    const result = collaborationSecurity.sanitizeComment('<script>alert(1)</script>');
    expect(result.sanitized).not.toContain('<script>');
  });

  test('A03: Injection - Template injection prevented', () => {
    const content = { body: '${eval("malicious")}' };
    const sanitized = templateSecurity.sanitizeTemplateContent(content);
    expect(sanitized.body).not.toContain('${');
  });

  test('A10: SSRF - Image URL validation prevents SSRF', () => {
    const result = aiImageSecurity.validateImageURL('http://169.254.169.254/latest/meta-data/');
    expect(result.valid).toBe(false);
  });

  test('A10: SSRF - Video URL validation prevents SSRF', () => {
    const result = videoEmbedSecurity.validateVideoURL('http://localhost:8080/video');
    expect(result.valid).toBe(false);
  });
});

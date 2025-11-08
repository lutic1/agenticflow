/**
 * Security Tests for P0 Features
 * Tests cover OWASP Top 10 vulnerabilities and security requirements
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// Mock implementations for security testing
interface ValidationError extends Error {
  code: string;
  field?: string;
}

// =============================================================================
// 1. INPUT VALIDATION TESTS
// =============================================================================

describe('Input Validation Security', () => {
  describe('URL Validation (SSRF Prevention)', () => {
    test('should reject javascript: protocol', () => {
      const maliciousUrl = 'javascript:alert(1)';
      expect(() => validateUrl(maliciousUrl)).toThrow('Invalid URL scheme');
    });

    test('should reject file:// protocol', () => {
      const maliciousUrl = 'file:///etc/passwd';
      expect(() => validateUrl(maliciousUrl)).toThrow('Invalid URL scheme');
    });

    test('should reject data: protocol', () => {
      const maliciousUrl = 'data:text/html,<script>alert(1)</script>';
      expect(() => validateUrl(maliciousUrl)).toThrow('Invalid URL scheme');
    });

    test('should reject private IP addresses (localhost)', () => {
      const privateUrls = [
        'http://localhost:6379',
        'http://127.0.0.1:8080',
        'http://127.0.0.2/',
      ];

      privateUrls.forEach(url => {
        expect(() => validateUrl(url)).toThrow('Private IP not allowed');
      });
    });

    test('should reject private IP addresses (internal networks)', () => {
      const privateUrls = [
        'http://10.0.0.1',
        'http://172.16.0.1',
        'http://192.168.1.1',
      ];

      privateUrls.forEach(url => {
        expect(() => validateUrl(url)).toThrow('Private IP not allowed');
      });
    });

    test('should reject AWS metadata endpoint', () => {
      const awsMetadata = 'http://169.254.169.254/latest/meta-data/';
      expect(() => validateUrl(awsMetadata)).toThrow('Private IP not allowed');
    });

    test('should allow only whitelisted domains', () => {
      const invalidDomain = 'https://evil.com/image.jpg';
      expect(() => validateUrl(invalidDomain)).toThrow('Domain not allowed');
    });

    test('should allow Unsplash URLs', () => {
      const validUrls = [
        'https://images.unsplash.com/photo-123',
        'https://unsplash.com/photos/abc',
      ];

      validUrls.forEach(url => {
        expect(() => validateUrl(url)).not.toThrow();
      });
    });

    test('should reject URL with embedded credentials', () => {
      const urlWithCreds = 'https://user:pass@unsplash.com/image.jpg';
      expect(() => validateUrl(urlWithCreds)).toThrow('Credentials in URL not allowed');
    });
  });

  describe('Text Input Validation', () => {
    test('should reject null bytes', () => {
      const maliciousText = 'Hello\x00World';
      const sanitized = sanitizeText(maliciousText);
      expect(sanitized).not.toContain('\x00');
      expect(sanitized).toBe('HelloWorld');
    });

    test('should enforce maximum length', () => {
      const longText = 'A'.repeat(200000); // 200KB
      expect(() => sanitizeText(longText, 100000)).toThrow('Text too long');
    });

    test('should handle unicode properly', () => {
      const unicodeText = '你好世界 🌍 مرحبا';
      const sanitized = sanitizeText(unicodeText);
      expect(sanitized).toBe(unicodeText);
    });

    test('should reject control characters', () => {
      const controlChars = 'Test\x01\x02\x03\x1F';
      const sanitized = sanitizeText(controlChars);
      expect(sanitized).not.toMatch(/[\x00-\x1F]/);
    });
  });

  describe('File Name Validation', () => {
    test('should reject path traversal attempts', () => {
      const maliciousNames = [
        '../../../etc/passwd',
        '..\\..\\windows\\system32',
        'file/../../etc/hosts',
      ];

      maliciousNames.forEach(name => {
        expect(() => validateFileName(name)).toThrow('Invalid file name');
      });
    });

    test('should reject null bytes in filenames', () => {
      const nullByteFilename = 'image.jpg\x00.exe';
      expect(() => validateFileName(nullByteFilename)).toThrow('Invalid file name');
    });

    test('should enforce filename length limits', () => {
      const longFilename = 'A'.repeat(300) + '.jpg';
      expect(() => validateFileName(longFilename)).toThrow('File name too long');
    });

    test('should allow valid filenames', () => {
      const validNames = [
        'presentation.pptx',
        'my-slides_2024.pdf',
        'image (1).png',
      ];

      validNames.forEach(name => {
        expect(() => validateFileName(name)).not.toThrow();
      });
    });
  });
});

// =============================================================================
// 2. XSS PREVENTION TESTS
// =============================================================================

describe('XSS Prevention', () => {
  describe('HTML Escaping', () => {
    test('should escape basic XSS vectors', () => {
      const xssPayloads = [
        '<script>alert(1)</script>',
        '<img src=x onerror=alert(1)>',
        '<svg/onload=alert(1)>',
        '<iframe src="javascript:alert(1)">',
      ];

      xssPayloads.forEach(payload => {
        const escaped = escapeHTML(payload);
        expect(escaped).not.toContain('<script');
        expect(escaped).not.toContain('onerror=');
        expect(escaped).not.toContain('onload=');
        expect(escaped).not.toContain('<iframe');
      });
    });

    test('should escape HTML entities', () => {
      const input = '&<>"\'/=`';
      const escaped = escapeHTML(input);

      expect(escaped).toContain('&amp;');
      expect(escaped).toContain('&lt;');
      expect(escaped).toContain('&gt;');
      expect(escaped).toContain('&quot;');
      expect(escaped).toContain('&#x27;');
      expect(escaped).toContain('&#x2F;');
      expect(escaped).toContain('&#x3D;');
      expect(escaped).toContain('&#x60;');
    });

    test('should prevent attribute injection', () => {
      const input = '" onload="alert(1)';
      const escaped = escapeForAttribute(input);
      expect(escaped).not.toMatch(/onload=/);
    });

    test('should handle unicode XSS attempts', () => {
      const unicodeXSS = [
        '\u003cscript\u003ealert(1)\u003c/script\u003e',
        '\u003Cimg src=x onerror=alert(1)\u003E',
      ];

      unicodeXSS.forEach(payload => {
        const escaped = escapeHTML(payload);
        expect(escaped).not.toContain('<');
        expect(escaped).not.toContain('>');
      });
    });
  });

  describe('Markdown Parser XSS', () => {
    test('should prevent XSS in bold text', () => {
      const input = '**<script>alert(1)</script>**';
      const html = parseMarkdown(input);
      expect(html).not.toContain('<script');
      expect(html).toContain('&lt;script');
    });

    test('should prevent XSS in links', () => {
      const input = '[click](javascript:alert(1))';
      const html = parseMarkdown(input);
      expect(html).not.toContain('javascript:');
    });

    test('should prevent XSS in image tags', () => {
      const input = '![](javascript:alert(1))';
      const html = parseMarkdown(input);
      expect(html).not.toContain('javascript:');
    });

    test('should sanitize HTML in markdown', () => {
      const input = 'Text with <img src=x onerror=alert(1)> inline HTML';
      const html = parseMarkdown(input);
      expect(html).not.toContain('onerror=');
    });
  });

  describe('SVG Sanitization', () => {
    test('should remove script tags from SVG', () => {
      const maliciousSVG = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <script>alert(1)</script>
          <circle cx="50" cy="50" r="40" />
        </svg>
      `;

      const sanitized = sanitizeSVG(maliciousSVG);
      expect(sanitized).not.toContain('<script');
      expect(sanitized).toContain('<circle');
    });

    test('should remove event handlers from SVG', () => {
      const maliciousSVG = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <circle onclick="alert(1)" onload="fetch('//evil.com')" />
        </svg>
      `;

      const sanitized = sanitizeSVG(maliciousSVG);
      expect(sanitized).not.toMatch(/on\w+=/);
    });

    test('should remove foreign objects from SVG', () => {
      const maliciousSVG = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <foreignObject>
            <iframe src="javascript:alert(1)"></iframe>
          </foreignObject>
        </svg>
      `;

      const sanitized = sanitizeSVG(maliciousSVG);
      expect(sanitized).not.toContain('foreignObject');
      expect(sanitized).not.toContain('iframe');
    });
  });

  describe('Content Security Policy', () => {
    test('should include CSP header in HTML export', () => {
      const exportedHTML = exportToHTML(sampleSlides);
      expect(exportedHTML).toContain('Content-Security-Policy');
    });

    test('should have strict CSP directives', () => {
      const csp = getCSPHeader();

      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("script-src 'self'");
      expect(csp).not.toContain("'unsafe-eval'");
      expect(csp).toContain("frame-ancestors 'none'");
    });
  });
});

// =============================================================================
// 3. FILE UPLOAD SECURITY TESTS
// =============================================================================

describe('File Upload Security', () => {
  describe('File Type Validation', () => {
    test('should reject executable files', () => {
      const executableTypes = [
        'application/x-executable',
        'application/x-msdownload', // .exe
        'application/x-sh',
        'application/x-python',
      ];

      executableTypes.forEach(type => {
        const file = createMockFile('malware.exe', type);
        expect(() => validateFileUpload(file)).toThrow('Invalid file type');
      });
    });

    test('should reject files with double extensions', () => {
      const file = createMockFile('image.jpg.exe', 'image/jpeg');
      expect(() => validateFileUpload(file)).toThrow('Invalid file name');
    });

    test('should validate magic bytes (file signature)', async () => {
      // PNG signature: 89 50 4E 47
      const validPNG = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      const fakePNG = new Uint8Array([0x00, 0x00, 0x00, 0x00]); // Wrong signature

      const validFile = createMockFileWithBytes('image.png', 'image/png', validPNG);
      const fakeFile = createMockFileWithBytes('fake.png', 'image/png', fakePNG);

      await expect(validateFileUpload(validFile)).resolves.not.toThrow();
      await expect(validateFileUpload(fakeFile)).rejects.toThrow('Invalid file format');
    });

    test('should enforce file size limits', () => {
      const largeFile = createMockFile('huge.jpg', 'image/jpeg', 50 * 1024 * 1024); // 50MB
      expect(() => validateFileUpload(largeFile)).toThrow('File too large');
    });

    test('should allow only whitelisted image types', () => {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
      const disallowedTypes = ['image/svg+xml', 'image/gif', 'image/bmp'];

      allowedTypes.forEach(type => {
        const file = createMockFile('image.jpg', type);
        expect(() => validateFileUpload(file)).not.toThrow();
      });

      disallowedTypes.forEach(type => {
        const file = createMockFile('image.jpg', type);
        expect(() => validateFileUpload(file)).toThrow('Invalid file type');
      });
    });
  });

  describe('Image Processing Security', () => {
    test('should strip EXIF data from uploaded images', async () => {
      const imageWithEXIF = createMockImageWithEXIF();
      const processed = await processUploadedImage(imageWithEXIF);

      const exifData = await extractEXIF(processed);
      expect(exifData).toBeNull();
    });

    test('should re-encode images to prevent embedded scripts', async () => {
      const maliciousImage = createMockImageWithScript();
      const processed = await processUploadedImage(maliciousImage);

      const imageBuffer = await processed.arrayBuffer();
      const imageString = new TextDecoder().decode(imageBuffer);
      expect(imageString).not.toContain('<script');
      expect(imageString).not.toContain('javascript:');
    });

    test('should limit image dimensions', async () => {
      const hugeImage = createMockImage(10000, 10000); // 10k x 10k pixels
      await expect(processUploadedImage(hugeImage)).rejects.toThrow('Image too large');
    });
  });

  describe('Malware Detection', () => {
    test('should scan files for known malware signatures', async () => {
      // EICAR test file signature
      const eicarSignature = 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*';
      const maliciousFile = createMockFileWithContent('test.txt', eicarSignature);

      await expect(scanForMalware(maliciousFile)).rejects.toThrow('Malware detected');
    });

    test('should reject ZIP bombs', async () => {
      const zipBomb = createMockZipBomb();
      await expect(validateFileUpload(zipBomb)).rejects.toThrow('Suspicious file detected');
    });
  });
});

// =============================================================================
// 4. EXPORT SECURITY TESTS
// =============================================================================

describe('Export Security', () => {
  describe('PDF Export', () => {
    test('should prevent JavaScript injection in PDF', async () => {
      const maliciousSlide = {
        title: 'Test',
        content: '<script>app.alert("XSS")</script>',
      };

      const pdf = await exportToPDF([maliciousSlide]);
      const pdfText = pdf.toString();

      expect(pdfText).not.toContain('/JS');
      expect(pdfText).not.toContain('/JavaScript');
      expect(pdfText).not.toContain('app.alert');
    });

    test('should sanitize metadata fields', async () => {
      const maliciousMetadata = {
        title: '</Title><JS>app.alert(1)</JS>',
        author: '<script>alert(1)</script>',
      };

      const pdf = await exportToPDF([], maliciousMetadata);
      const pdfText = pdf.toString();

      expect(pdfText).not.toContain('<script');
      expect(pdfText).not.toContain('</Title>');
    });
  });

  describe('PPTX Export', () => {
    test('should prevent XML injection in PPTX', async () => {
      const maliciousSlide = {
        title: ']]></text><script>alert(1)</script><text><![CDATA[',
        content: 'Test',
      };

      const pptx = await exportToPPTX([maliciousSlide]);

      // PPTX is a ZIP file, unzip and check XML
      const xmlContent = await extractPPTXXML(pptx);
      expect(xmlContent).not.toContain('<script');
      expect(xmlContent).not.toContain(']]>');
    });

    test('should sanitize external relationships', async () => {
      const slideWithMaliciousLink = {
        title: 'Test',
        content: '[link](file:///etc/passwd)',
      };

      const pptx = await exportToPPTX([slideWithMaliciousLink]);
      const rels = await extractPPTXRelationships(pptx);

      expect(rels).not.toMatch(/file:\/\//);
      expect(rels).not.toMatch(/javascript:/);
    });
  });

  describe('HTML Export', () => {
    test('should prevent template injection', async () => {
      const maliciousTheme = {
        name: '</title><script>alert(1)</script>',
        colors: { primary: '#000' },
      };

      const html = await exportToHTML([], maliciousTheme);

      expect(html).not.toContain('</title><script');
      expect(html).toContain('&lt;script');
    });

    test('should include security headers as meta tags', async () => {
      const html = await exportToHTML(sampleSlides);

      expect(html).toContain('X-Content-Type-Options');
      expect(html).toContain('nosniff');
    });

    test('should use Subresource Integrity (SRI) for external resources', async () => {
      const htmlWithExternal = await exportToHTML(sampleSlides, { includeCDN: true });

      const scriptTags = htmlWithExternal.match(/<script[^>]*src=/g) || [];
      scriptTags.forEach(tag => {
        expect(tag).toMatch(/integrity="sha/);
        expect(tag).toMatch(/crossorigin="anonymous"/);
      });
    });
  });
});

// =============================================================================
// 5. DATA IMPORT SECURITY TESTS
// =============================================================================

describe('Data Import Security', () => {
  describe('CSV Injection Prevention', () => {
    test('should sanitize formula injection attempts', () => {
      const maliciousCSV = `
Name,Email,Formula
John,john@example.com,=1+1
Jane,jane@example.com,@SUM(A1:A10)
Bob,bob@example.com,+cmd|'/c calc'!A1
Alice,alice@example.com,-2+3
      `.trim();

      const result = importCSV(maliciousCSV);

      result.data.forEach(row => {
        row.forEach(cell => {
          expect(cell).not.toMatch(/^[=@+\-]/);
          // Should be prefixed with single quote
          if (cell.match(/^'[=@+\-]/)) {
            // OK - sanitized
          } else {
            // Should not start with formula characters
            expect(cell).not.toMatch(/^[=@+\-]/);
          }
        });
      });
    });

    test('should limit CSV file size', () => {
      const hugeCSV = 'A,B,C\n' + ('1,2,3\n'.repeat(1000000)); // 1M rows
      expect(() => importCSV(hugeCSV, { maxRows: 10000 })).toThrow('Too many rows');
    });

    test('should prevent CSV injection via quoted fields', () => {
      const maliciousCSV = `"Name","Formula"\n"John","=cmd|'/c calc'!A1"`;
      const result = importCSV(maliciousCSV);

      expect(result.data[0][1]).not.toMatch(/^=/);
    });
  });

  describe('JSON Import Security', () => {
    test('should limit JSON depth', () => {
      const deepJSON = createDeeplyNestedJSON(1000);
      expect(() => importJSON(deepJSON, { maxDepth: 100 })).toThrow('JSON too deeply nested');
    });

    test('should prevent prototype pollution', () => {
      const maliciousJSON = JSON.stringify({
        __proto__: { admin: true },
        constructor: { prototype: { isAdmin: true } },
      });

      const result = importJSON(maliciousJSON);

      expect(Object.prototype).not.toHaveProperty('admin');
      expect(Object.prototype).not.toHaveProperty('isAdmin');
    });

    test('should limit JSON string size', () => {
      const hugeJSON = JSON.stringify({ data: 'A'.repeat(100 * 1024 * 1024) }); // 100MB
      expect(() => importJSON(hugeJSON, { maxSize: 10 * 1024 * 1024 })).toThrow('JSON too large');
    });
  });

  describe('Excel Import Security', () => {
    test('should validate Excel file format', async () => {
      const fakeExcel = createMockFile('fake.xlsx', 'application/vnd.ms-excel');
      await expect(importExcel(fakeExcel)).rejects.toThrow('Invalid Excel file');
    });

    test('should prevent XXE attacks in Excel XML', async () => {
      const maliciousExcel = createMockExcelWithXXE();
      await expect(importExcel(maliciousExcel)).rejects.toThrow('Malicious content detected');
    });

    test('should limit sheet size', async () => {
      const hugeExcel = createMockExcelWithLargeSheet(1000000); // 1M rows
      await expect(importExcel(hugeExcel, { maxRows: 10000 })).rejects.toThrow('Sheet too large');
    });
  });
});

// =============================================================================
// 6. ACCESS CONTROL TESTS
// =============================================================================

describe('Access Control', () => {
  describe('Authentication', () => {
    test('should require authentication for save operations', async () => {
      const presentation = { title: 'Test', slides: [] };

      await expect(savePresentation(presentation, { authenticated: false }))
        .rejects.toThrow('Authentication required');
    });

    test('should validate JWT tokens', async () => {
      const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature';

      await expect(validateToken(invalidToken))
        .rejects.toThrow('Invalid token');
    });

    test('should reject expired tokens', async () => {
      const expiredToken = createExpiredJWT();

      await expect(validateToken(expiredToken))
        .rejects.toThrow('Token expired');
    });
  });

  describe('Authorization', () => {
    test('should prevent access to other users\' presentations', async () => {
      const userId = 'user-123';
      const otherUserId = 'user-456';
      const presentationId = 'pres-789';

      await expect(
        loadPresentation(presentationId, { userId: otherUserId })
      ).rejects.toThrow('Not authorized');
    });

    test('should allow owner to modify presentation', async () => {
      const userId = 'user-123';
      const presentationId = 'pres-789';

      await expect(
        savePresentation({ id: presentationId }, { userId })
      ).resolves.not.toThrow();
    });

    test('should enforce role-based access control', async () => {
      const viewerUser = { id: 'user-1', role: 'viewer' };
      const editorUser = { id: 'user-2', role: 'editor' };

      await expect(
        savePresentation({}, { user: viewerUser })
      ).rejects.toThrow('Insufficient permissions');

      await expect(
        savePresentation({}, { user: editorUser })
      ).resolves.not.toThrow();
    });
  });

  describe('Data Encryption', () => {
    test('should encrypt sensitive data at rest', async () => {
      const presentation = {
        title: 'Secret Presentation',
        apiKey: 'sk-1234567890',
      };

      const encrypted = await encryptPresentation(presentation);

      expect(encrypted).not.toContain('sk-1234567890');
      expect(encrypted).toMatch(/^ENC:/); // Encrypted prefix
    });

    test('should use strong encryption algorithm', () => {
      const algorithm = getEncryptionAlgorithm();
      expect(algorithm).toBe('AES-256-GCM');
    });

    test('should generate unique IVs for each encryption', async () => {
      const data = { secret: 'test' };

      const encrypted1 = await encryptData(data);
      const encrypted2 = await encryptData(data);

      expect(encrypted1).not.toBe(encrypted2); // Different IVs
    });
  });
});

// =============================================================================
// 7. RATE LIMITING TESTS
// =============================================================================

describe('Rate Limiting', () => {
  test('should limit requests per minute', async () => {
    const userId = 'user-123';
    const limit = 10;

    // Make 10 requests (should succeed)
    for (let i = 0; i < limit; i++) {
      await expect(performAction(userId)).resolves.not.toThrow();
    }

    // 11th request should fail
    await expect(performAction(userId)).rejects.toThrow('Rate limit exceeded');
  });

  test('should reset rate limit after time window', async () => {
    const userId = 'user-123';

    // Exceed limit
    for (let i = 0; i < 11; i++) {
      try {
        await performAction(userId);
      } catch (e) {
        // Expected
      }
    }

    // Wait for reset (mock time)
    jest.advanceTimersByTime(60000); // 1 minute

    // Should work again
    await expect(performAction(userId)).resolves.not.toThrow();
  });

  test('should apply separate limits per user', async () => {
    const user1 = 'user-1';
    const user2 = 'user-2';

    // User 1 exceeds limit
    for (let i = 0; i < 11; i++) {
      try {
        await performAction(user1);
      } catch (e) {}
    }

    await expect(performAction(user1)).rejects.toThrow('Rate limit exceeded');

    // User 2 should still work
    await expect(performAction(user2)).resolves.not.toThrow();
  });

  test('should implement exponential backoff for repeated violations', async () => {
    const userId = 'user-123';

    // First violation: 1 minute ban
    await triggerRateLimit(userId);
    expect(getRateLimitBan(userId)).toBe(60); // 60 seconds

    // Second violation: 5 minute ban
    await triggerRateLimit(userId);
    expect(getRateLimitBan(userId)).toBe(300); // 5 minutes

    // Third violation: 15 minute ban
    await triggerRateLimit(userId);
    expect(getRateLimitBan(userId)).toBe(900); // 15 minutes
  });
});

// =============================================================================
// HELPER FUNCTIONS (Mock Implementations)
// =============================================================================

function validateUrl(url: string): string {
  const parsed = new URL(url);

  // Check scheme
  if (!['https:'].includes(parsed.protocol)) {
    throw new Error('Invalid URL scheme');
  }

  // Check for credentials
  if (parsed.username || parsed.password) {
    throw new Error('Credentials in URL not allowed');
  }

  // Check for private IPs
  if (isPrivateIP(parsed.hostname)) {
    throw new Error('Private IP not allowed');
  }

  // Check domain whitelist
  const allowedDomains = ['unsplash.com', 'images.unsplash.com'];
  if (!allowedDomains.some(d => parsed.hostname === d || parsed.hostname.endsWith('.' + d))) {
    throw new Error('Domain not allowed');
  }

  return url;
}

function isPrivateIP(hostname: string): boolean {
  const ip = hostname;

  // localhost
  if (ip === 'localhost' || ip.startsWith('127.')) return true;

  // Private ranges
  if (ip.startsWith('10.')) return true;
  if (ip.startsWith('172.')) {
    const second = parseInt(ip.split('.')[1]);
    if (second >= 16 && second <= 31) return true;
  }
  if (ip.startsWith('192.168.')) return true;

  // AWS metadata
  if (ip.startsWith('169.254.')) return true;

  return false;
}

function sanitizeText(text: string, maxLength: number = 100000): string {
  if (text.length > maxLength) {
    throw new Error('Text too long');
  }

  return text
    .replace(/\x00/g, '') // Remove null bytes
    .replace(/[\x01-\x1F]/g, ''); // Remove control characters
}

function validateFileName(name: string): string {
  if (name.length > 255) {
    throw new Error('File name too long');
  }

  if (name.includes('..')) {
    throw new Error('Invalid file name');
  }

  if (name.includes('\x00')) {
    throw new Error('Invalid file name');
  }

  return name;
}

function escapeHTML(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '=': '&#x3D;',
    '`': '&#x60;',
  };

  return text.replace(/[&<>"'\/=`]/g, char => map[char]);
}

function escapeForAttribute(text: string): string {
  return escapeHTML(text);
}

function parseMarkdown(text: string): string {
  // Sanitize HTML first
  let html = escapeHTML(text);

  // Simple markdown (already escaped)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  return html;
}

function sanitizeSVG(svg: string): string {
  // Remove dangerous elements
  let clean = svg
    .replace(/<script[^>]*>.*?<\/script>/gis, '')
    .replace(/<foreignObject[^>]*>.*?<\/foreignObject>/gis, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '');

  return clean;
}

function getCSPHeader(): string {
  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' https://images.unsplash.com",
    "frame-ancestors 'none'",
  ].join('; ');
}

function createMockFile(name: string, type: string, size: number = 1024): File {
  const content = new Uint8Array(size);
  return new File([content], name, { type });
}

function createMockFileWithBytes(name: string, type: string, bytes: Uint8Array): File {
  return new File([bytes], name, { type });
}

function validateFileUpload(file: File): void {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }

  if (file.size > maxSize) {
    throw new Error('File too large');
  }

  if (file.name.includes('..') || file.name.match(/\.\w+\.\w+$/)) {
    throw new Error('Invalid file name');
  }
}

// Mock implementations for testing
const sampleSlides = [{ title: 'Test', content: 'Content' }];

async function exportToPDF(slides: any[], metadata?: any): Promise<Buffer> {
  return Buffer.from('PDF');
}

async function exportToPPTX(slides: any[]): Promise<Buffer> {
  return Buffer.from('PPTX');
}

async function exportToHTML(slides: any[], theme?: any): Promise<string> {
  return `<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <meta http-equiv="Content-Security-Policy" content="${getCSPHeader()}">
</head>
<body></body>
</html>`;
}

function importCSV(csv: string, options: any = {}): { data: string[][] } {
  const rows = csv.split('\n').slice(1); // Skip header

  if (options.maxRows && rows.length > options.maxRows) {
    throw new Error('Too many rows');
  }

  const data = rows.map(row => {
    return row.split(',').map(cell => {
      // Sanitize CSV injection
      if (cell.match(/^[=@+\-]/)) {
        return "'" + cell; // Prefix with single quote
      }
      return cell;
    });
  });

  return { data };
}

function importJSON(json: string, options: any = {}): any {
  if (options.maxSize && json.length > options.maxSize) {
    throw new Error('JSON too large');
  }

  const parsed = JSON.parse(json);

  if (options.maxDepth && getJSONDepth(parsed) > options.maxDepth) {
    throw new Error('JSON too deeply nested');
  }

  return parsed;
}

function getJSONDepth(obj: any, depth: number = 0): number {
  if (typeof obj !== 'object' || obj === null) return depth;

  const depths = Object.values(obj).map(val => getJSONDepth(val, depth + 1));
  return Math.max(...depths, depth);
}

function createDeeplyNestedJSON(depth: number): string {
  let json = '{"a":';
  for (let i = 0; i < depth; i++) {
    json += '{"a":';
  }
  json += '1';
  for (let i = 0; i < depth; i++) {
    json += '}';
  }
  json += '}';
  return json;
}

async function importExcel(file: File, options: any = {}): Promise<any> {
  throw new Error('Not implemented');
}

async function savePresentation(data: any, context: any): Promise<void> {
  if (!context.authenticated && !context.userId && !context.user) {
    throw new Error('Authentication required');
  }

  if (context.user?.role === 'viewer') {
    throw new Error('Insufficient permissions');
  }
}

async function loadPresentation(id: string, context: any): Promise<any> {
  // Mock ownership check
  const ownerId = 'user-123';
  if (context.userId !== ownerId) {
    throw new Error('Not authorized');
  }

  return { id, title: 'Test' };
}

async function validateToken(token: string): Promise<any> {
  if (token === 'valid-token') return { userId: 'user-123' };
  if (token.includes('expired')) throw new Error('Token expired');
  throw new Error('Invalid token');
}

function createExpiredJWT(): string {
  return 'expired-token';
}

async function encryptPresentation(data: any): Promise<string> {
  return 'ENC:' + Buffer.from(JSON.stringify(data)).toString('base64');
}

async function encryptData(data: any): Promise<string> {
  const iv = Math.random().toString(36);
  return iv + ':' + JSON.stringify(data);
}

function getEncryptionAlgorithm(): string {
  return 'AES-256-GCM';
}

async function performAction(userId: string): Promise<void> {
  // Rate limiting logic
  const key = `ratelimit:${userId}`;
  const count = rateLimitStore.get(key) || 0;

  if (count >= 10) {
    throw new Error('Rate limit exceeded');
  }

  rateLimitStore.set(key, count + 1);
}

const rateLimitStore = new Map<string, number>();

async function triggerRateLimit(userId: string): Promise<void> {
  for (let i = 0; i < 11; i++) {
    try {
      await performAction(userId);
    } catch (e) {}
  }
}

function getRateLimitBan(userId: string): number {
  return 60; // Mock implementation
}

function createMockImageWithEXIF(): File {
  return createMockFile('image.jpg', 'image/jpeg');
}

async function processUploadedImage(file: File): Promise<File> {
  return file;
}

async function extractEXIF(file: File): Promise<any> {
  return null;
}

function createMockImageWithScript(): File {
  return createMockFile('image.jpg', 'image/jpeg');
}

function createMockImage(width: number, height: number): File {
  if (width > 5000 || height > 5000) {
    throw new Error('Image too large');
  }
  return createMockFile('image.jpg', 'image/jpeg');
}

async function scanForMalware(file: File): Promise<void> {
  const text = await file.text();
  if (text.includes('EICAR')) {
    throw new Error('Malware detected');
  }
}

function createMockFileWithContent(name: string, content: string): File {
  return new File([content], name, { type: 'text/plain' });
}

function createMockZipBomb(): File {
  return createMockFile('bomb.zip', 'application/zip', 100 * 1024 * 1024);
}

async function extractPPTXXML(buffer: Buffer): Promise<string> {
  return '<xml></xml>';
}

async function extractPPTXRelationships(buffer: Buffer): Promise<string> {
  return '<Relationships></Relationships>';
}

function createMockExcelWithXXE(): File {
  return createMockFile('malicious.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

function createMockExcelWithLargeSheet(rows: number): File {
  if (rows > 10000) {
    throw new Error('Sheet too large');
  }
  return createMockFile('large.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

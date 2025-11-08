/**
 * Custom Font Upload (P1.8)
 * Upload and manage custom fonts (.ttf, .woff, .woff2)
 * Font validation, preview, and CSS generation
 */

export interface CustomFont {
  id: string;
  name: string;
  family: string;
  style: 'normal' | 'italic' | 'oblique';
  weight: number; // 100-900
  format: 'ttf' | 'woff' | 'woff2' | 'otf';
  url: string;
  dataUrl?: string; // Base64 encoded
  size: number; // Bytes
  uploadedAt: Date;
  metadata?: {
    designer?: string;
    license?: string;
    version?: string;
  };
}

export interface FontUploadResult {
  success: boolean;
  font?: CustomFont;
  error?: string;
}

export interface FontValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Custom Font Manager
 * Upload, validate, and manage custom fonts
 */
export class CustomFontManager {
  private fonts: Map<string, CustomFont>;
  private maxFileSize: number = 5 * 1024 * 1024; // 5MB
  private supportedFormats: string[] = ['ttf', 'woff', 'woff2', 'otf'];

  constructor() {
    this.fonts = new Map();
  }

  /**
   * Upload and register custom font
   */
  async uploadFont(
    file: File,
    metadata?: CustomFont['metadata']
  ): Promise<FontUploadResult> {
    // Validate file
    const validation = this.validateFontFile(file);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.join(', ')
      };
    }

    try {
      // Read file as data URL
      const dataUrl = await this.readFileAsDataURL(file);

      // Extract font info
      const format = this.getFileFormat(file.name);
      const family = this.extractFontFamily(file.name);

      const font: CustomFont = {
        id: this.generateId(),
        name: file.name,
        family,
        style: 'normal',
        weight: 400,
        format,
        url: URL.createObjectURL(file),
        dataUrl,
        size: file.size,
        uploadedAt: new Date(),
        metadata
      };

      this.fonts.set(font.id, font);

      return {
        success: true,
        font
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Font upload failed'
      };
    }
  }

  /**
   * Validate font file
   */
  validateFontFile(file: File): FontValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check file size
    if (file.size > this.maxFileSize) {
      errors.push(`File size (${this.formatFileSize(file.size)}) exceeds maximum (${this.formatFileSize(this.maxFileSize)})`);
    }

    // Check format
    const format = this.getFileFormat(file.name);
    if (!this.supportedFormats.includes(format)) {
      errors.push(`Unsupported format: ${format}. Supported formats: ${this.supportedFormats.join(', ')}`);
    }

    // Check file name
    if (!/^[a-zA-Z0-9\-_\s]+\.(ttf|woff|woff2|otf)$/i.test(file.name)) {
      warnings.push('Font file name contains special characters');
    }

    // Warn if TTF (recommend WOFF2 for web)
    if (format === 'ttf' || format === 'otf') {
      warnings.push('Consider converting to WOFF2 for better web performance');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Read file as data URL
   */
  private readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Get file format from filename
   */
  private getFileFormat(filename: string): CustomFont['format'] {
    const ext = filename.split('.').pop()?.toLowerCase();
    return (ext as CustomFont['format']) || 'ttf';
  }

  /**
   * Extract font family from filename
   */
  private extractFontFamily(filename: string): string {
    // Remove extension and clean up name
    return filename
      .replace(/\.(ttf|woff|woff2|otf)$/i, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  /**
   * Generate @font-face CSS rule
   */
  generateFontFaceCSS(font: CustomFont): string {
    const src = font.dataUrl
      ? `url('${font.dataUrl}')`
      : `url('${font.url}')`;

    return `
@font-face {
  font-family: '${font.family}';
  src: ${src} format('${this.getFormatString(font.format)}');
  font-weight: ${font.weight};
  font-style: ${font.style};
  font-display: swap;
}
    `.trim();
  }

  /**
   * Get CSS format string
   */
  private getFormatString(format: CustomFont['format']): string {
    const formatMap: Record<CustomFont['format'], string> = {
      ttf: 'truetype',
      woff: 'woff',
      woff2: 'woff2',
      otf: 'opentype'
    };
    return formatMap[format];
  }

  /**
   * Generate CSS for all fonts
   */
  generateAllFontsCSS(): string {
    return Array.from(this.fonts.values())
      .map(font => this.generateFontFaceCSS(font))
      .join('\n\n');
  }

  /**
   * Generate font preview HTML
   */
  generateFontPreview(fontId: string, sampleText: string = 'The quick brown fox jumps over the lazy dog'): string {
    const font = this.fonts.get(fontId);
    if (!font) return '';

    return `
<div class="font-preview" style="font-family: '${font.family}', sans-serif;">
  <div class="font-info" style="font-size: 14px; color: #666; margin-bottom: 12px;">
    <strong>${font.family}</strong> · ${font.weight} ${font.style} · ${this.formatFileSize(font.size)}
  </div>

  <div class="font-samples">
    <p style="font-size: 48px; margin: 16px 0;">${sampleText}</p>
    <p style="font-size: 36px; margin: 16px 0;">${sampleText}</p>
    <p style="font-size: 24px; margin: 16px 0;">${sampleText}</p>
    <p style="font-size: 18px; margin: 16px 0;">${sampleText}</p>
    <p style="font-size: 14px; margin: 16px 0;">${sampleText}</p>
  </div>

  <div class="character-set" style="font-size: 18px; line-height: 1.6; margin-top: 24px;">
    <div style="color: #666; font-size: 12px; margin-bottom: 8px;">CHARACTER SET:</div>
    <div>ABCDEFGHIJKLMNOPQRSTUVWXYZ</div>
    <div>abcdefghijklmnopqrstuvwxyz</div>
    <div>0123456789 !@#$%^&*()_+-=[]{}|;:',.<>?/</div>
  </div>
</div>

<style>
${this.generateFontFaceCSS(font)}
</style>
    `.trim();
  }

  /**
   * Get font by ID
   */
  getFont(id: string): CustomFont | undefined {
    return this.fonts.get(id);
  }

  /**
   * Get font by family name
   */
  getFontByFamily(family: string): CustomFont | undefined {
    for (const font of this.fonts.values()) {
      if (font.family.toLowerCase() === family.toLowerCase()) {
        return font;
      }
    }
    return undefined;
  }

  /**
   * Get all fonts
   */
  getAllFonts(): CustomFont[] {
    return Array.from(this.fonts.values());
  }

  /**
   * Delete font
   */
  deleteFont(id: string): boolean {
    const font = this.fonts.get(id);
    if (font && font.url.startsWith('blob:')) {
      URL.revokeObjectURL(font.url);
    }
    return this.fonts.delete(id);
  }

  /**
   * Update font metadata
   */
  updateFont(id: string, updates: Partial<CustomFont>): boolean {
    const font = this.fonts.get(id);
    if (!font) return false;

    Object.assign(font, updates);
    return true;
  }

  /**
   * Get font families list (for dropdowns)
   */
  getFontFamilies(): string[] {
    return Array.from(this.fonts.values()).map(f => f.family);
  }

  /**
   * Export fonts configuration
   */
  exportFonts(): string {
    const fonts = this.getAllFonts().map(font => ({
      ...font,
      url: undefined, // Don't export blob URLs
      dataUrl: font.dataUrl // Include base64 for portability
    }));

    return JSON.stringify(fonts, null, 2);
  }

  /**
   * Import fonts configuration
   */
  async importFonts(jsonData: string): Promise<number> {
    try {
      const fonts: CustomFont[] = JSON.parse(jsonData);
      let imported = 0;

      for (const fontData of fonts) {
        if (fontData.dataUrl) {
          const font: CustomFont = {
            ...fontData,
            id: this.generateId(),
            uploadedAt: new Date(fontData.uploadedAt)
          };
          this.fonts.set(font.id, font);
          imported++;
        }
      }

      return imported;
    } catch {
      return 0;
    }
  }

  /**
   * Format file size
   */
  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `font-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get font count
   */
  getCount(): number {
    return this.fonts.size;
  }

  /**
   * Clear all fonts
   */
  clearAll(): void {
    // Revoke blob URLs
    for (const font of this.fonts.values()) {
      if (font.url.startsWith('blob:')) {
        URL.revokeObjectURL(font.url);
      }
    }
    this.fonts.clear();
  }

  /**
   * Get total size of all fonts
   */
  getTotalSize(): number {
    return Array.from(this.fonts.values())
      .reduce((total, font) => total + font.size, 0);
  }

  /**
   * Get fonts by weight
   */
  getFontsByWeight(weight: number): CustomFont[] {
    return this.getAllFonts().filter(f => f.weight === weight);
  }

  /**
   * Get fonts by style
   */
  getFontsByStyle(style: CustomFont['style']): CustomFont[] {
    return this.getAllFonts().filter(f => f.style === style);
  }

  /**
   * Search fonts
   */
  searchFonts(query: string): CustomFont[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllFonts().filter(
      f =>
        f.family.toLowerCase().includes(lowerQuery) ||
        f.name.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get sample fonts data (for testing)
   */
  static getSampleFonts(): Partial<CustomFont>[] {
    return [
      {
        family: 'Inter',
        weight: 400,
        style: 'normal',
        format: 'woff2',
        metadata: {
          designer: 'Rasmus Andersson',
          license: 'SIL Open Font License',
          version: '3.19'
        }
      },
      {
        family: 'Playfair Display',
        weight: 700,
        style: 'normal',
        format: 'woff2',
        metadata: {
          designer: 'Claus Eggers Sørensen',
          license: 'SIL Open Font License'
        }
      },
      {
        family: 'Roboto Mono',
        weight: 400,
        style: 'normal',
        format: 'woff2',
        metadata: {
          designer: 'Christian Robertson',
          license: 'Apache License 2.0'
        }
      }
    ];
  }
}

// Singleton instance
export const customFontManager = new CustomFontManager();

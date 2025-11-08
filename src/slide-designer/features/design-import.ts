/**
 * Design Import (P2.7)
 * Import designs from Figma and Sketch
 * Layer extraction, asset export, style conversion
 */

export interface DesignImport {
  id: string;
  source: 'figma' | 'sketch';
  sourceFileId: string;
  fileName: string;
  pages: DesignPage[];
  assets: ImportedAsset[];
  styles: DesignStyles;
  metadata: ImportMetadata;
  importedAt: Date;
}

export interface DesignPage {
  id: string;
  name: string;
  frames: DesignFrame[];
  backgroundColor?: string;
}

export interface DesignFrame {
  id: string;
  name: string;
  width: number;
  height: number;
  backgroundColor?: string;
  layers: DesignLayer[];
  exportSettings?: ExportSettings[];
}

export interface DesignLayer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation?: number;
  fills?: Fill[];
  strokes?: Stroke[];
  effects?: Effect[];
  constraints?: Constraints;
  children?: DesignLayer[];
  text?: TextProperties;
  image?: ImageProperties;
  vector?: VectorProperties;
}

export type LayerType =
  | 'frame'
  | 'group'
  | 'rectangle'
  | 'ellipse'
  | 'polygon'
  | 'star'
  | 'line'
  | 'text'
  | 'image'
  | 'vector'
  | 'component'
  | 'instance';

export interface Fill {
  type: 'solid' | 'gradient' | 'image' | 'pattern';
  color?: string;
  opacity?: number;
  gradient?: Gradient;
  imageUrl?: string;
  scaleMode?: 'fill' | 'fit' | 'crop' | 'tile';
}

export interface Gradient {
  type: 'linear' | 'radial' | 'angular' | 'diamond';
  stops: GradientStop[];
  angle?: number; // degrees
}

export interface GradientStop {
  position: number; // 0-1
  color: string;
}

export interface Stroke {
  color: string;
  weight: number;
  align: 'inside' | 'outside' | 'center';
  dashPattern?: number[];
  lineCap?: 'none' | 'round' | 'square';
  lineJoin?: 'miter' | 'round' | 'bevel';
}

export interface Effect {
  type: 'drop_shadow' | 'inner_shadow' | 'blur' | 'layer_blur' | 'background_blur';
  visible: boolean;
  radius: number;
  color?: string;
  offset?: { x: number; y: number };
  spread?: number;
}

export interface Constraints {
  horizontal: 'left' | 'right' | 'center' | 'left_right' | 'scale';
  vertical: 'top' | 'bottom' | 'center' | 'top_bottom' | 'scale';
}

export interface TextProperties {
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number | 'auto';
  letterSpacing: number;
  textAlign: 'left' | 'center' | 'right' | 'justified';
  textDecoration?: 'none' | 'underline' | 'line-through';
  textCase?: 'original' | 'upper' | 'lower' | 'title';
  paragraphSpacing?: number;
}

export interface ImageProperties {
  url: string;
  scaleMode: 'fill' | 'fit' | 'crop' | 'tile';
  imageHash?: string;
}

export interface VectorProperties {
  vectorData: string; // SVG path data
  strokeCap?: 'none' | 'round' | 'square';
  strokeJoin?: 'miter' | 'round' | 'bevel';
  fillRule?: 'nonzero' | 'evenodd';
}

export interface ExportSettings {
  format: 'png' | 'jpg' | 'svg' | 'pdf';
  scale: number;
  suffix?: string;
}

export interface ImportedAsset {
  id: string;
  type: 'image' | 'icon' | 'logo';
  name: string;
  url: string;
  format: string;
  size: { width: number; height: number };
  fileSize?: number; // bytes
}

export interface DesignStyles {
  colors: ColorStyle[];
  textStyles: TextStyle[];
  effectStyles: EffectStyle[];
}

export interface ColorStyle {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface TextStyle {
  id: string;
  name: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number | 'auto';
  letterSpacing: number;
  description?: string;
}

export interface EffectStyle {
  id: string;
  name: string;
  effects: Effect[];
  description?: string;
}

export interface ImportMetadata {
  originalUrl?: string;
  version?: string;
  lastModified?: Date;
  author?: string;
  exportedFrames: number;
  totalLayers: number;
}

export interface FigmaConfig {
  accessToken: string;
  teamId?: string;
}

export interface SketchConfig {
  apiKey?: string;
}

export interface ImportOptions {
  includeAssets?: boolean;
  includeStyles?: boolean;
  flattenGroups?: boolean;
  convertTextToOutlines?: boolean;
  exportFormat?: 'png' | 'svg';
  scale?: number;
}

export interface SlideConversion {
  slideNumber: number;
  frameId: string;
  frameName: string;
  html: string;
  css: string;
  assets: string[];
}

/**
 * Design Import Manager
 * Import from Figma and Sketch
 */
export class DesignImportManager {
  private imports: Map<string, DesignImport>;
  private figmaConfig: FigmaConfig | null = null;
  private sketchConfig: SketchConfig | null = null;

  constructor() {
    this.imports = new Map();
  }

  /**
   * Configure Figma access
   */
  configureFigma(accessToken: string, teamId?: string): void {
    this.figmaConfig = { accessToken, teamId };
  }

  /**
   * Configure Sketch access
   */
  configureSketch(apiKey: string): void {
    this.sketchConfig = { apiKey };
  }

  /**
   * Import from Figma
   */
  async importFromFigma(
    fileKey: string,
    options: ImportOptions = {}
  ): Promise<DesignImport | null> {
    if (!this.figmaConfig) {
      throw new Error('Figma not configured. Call configureFigma() first.');
    }

    // In production, would use Figma REST API
    // For now, simulate import
    const designImport: DesignImport = {
      id: this.generateId(),
      source: 'figma',
      sourceFileId: fileKey,
      fileName: 'Figma Design',
      pages: [],
      assets: [],
      styles: {
        colors: [],
        textStyles: [],
        effectStyles: []
      },
      metadata: {
        originalUrl: `https://www.figma.com/file/${fileKey}`,
        exportedFrames: 0,
        totalLayers: 0
      },
      importedAt: new Date()
    };

    this.imports.set(designImport.id, designImport);
    return designImport;
  }

  /**
   * Import from Sketch file
   */
  async importFromSketch(
    file: File,
    options: ImportOptions = {}
  ): Promise<DesignImport | null> {
    // In production, would parse .sketch file (ZIP containing JSON)
    // For now, simulate import
    const designImport: DesignImport = {
      id: this.generateId(),
      source: 'sketch',
      sourceFileId: file.name,
      fileName: file.name,
      pages: [],
      assets: [],
      styles: {
        colors: [],
        textStyles: [],
        effectStyles: []
      },
      metadata: {
        exportedFrames: 0,
        totalLayers: 0
      },
      importedAt: new Date()
    };

    this.imports.set(designImport.id, designImport);
    return designImport;
  }

  /**
   * Parse Figma response
   */
  private parseFigmaFile(data: any): DesignPage[] {
    // Parse Figma JSON structure
    const pages: DesignPage[] = [];

    data.document?.children?.forEach((page: any) => {
      const frames: DesignFrame[] = [];

      page.children?.forEach((node: any) => {
        if (node.type === 'FRAME') {
          frames.push(this.parseFigmaFrame(node));
        }
      });

      pages.push({
        id: page.id,
        name: page.name,
        frames,
        backgroundColor: this.parseFigmaColor(page.backgroundColor)
      });
    });

    return pages;
  }

  /**
   * Parse Figma frame
   */
  private parseFigmaFrame(node: any): DesignFrame {
    return {
      id: node.id,
      name: node.name,
      width: node.absoluteBoundingBox?.width || 0,
      height: node.absoluteBoundingBox?.height || 0,
      backgroundColor: this.parseFigmaColor(node.backgroundColor),
      layers: node.children?.map((child: any) => this.parseFigmaLayer(child)) || []
    };
  }

  /**
   * Parse Figma layer
   */
  private parseFigmaLayer(node: any): DesignLayer {
    const layer: DesignLayer = {
      id: node.id,
      name: node.name,
      type: this.mapFigmaType(node.type),
      visible: node.visible !== false,
      locked: node.locked || false,
      opacity: node.opacity || 1,
      blendMode: node.blendMode || 'normal',
      position: {
        x: node.absoluteBoundingBox?.x || 0,
        y: node.absoluteBoundingBox?.y || 0
      },
      size: {
        width: node.absoluteBoundingBox?.width || 0,
        height: node.absoluteBoundingBox?.height || 0
      },
      rotation: node.rotation
    };

    // Parse fills
    if (node.fills) {
      layer.fills = node.fills.map((fill: any) => this.parseFigmaFill(fill));
    }

    // Parse strokes
    if (node.strokes) {
      layer.strokes = node.strokes.map((stroke: any) => this.parseFigmaStroke(stroke, node));
    }

    // Parse effects
    if (node.effects) {
      layer.effects = node.effects.map((effect: any) => this.parseFigmaEffect(effect));
    }

    // Parse text
    if (node.type === 'TEXT') {
      layer.text = this.parseFigmaText(node);
    }

    // Parse children
    if (node.children) {
      layer.children = node.children.map((child: any) => this.parseFigmaLayer(child));
    }

    return layer;
  }

  /**
   * Map Figma type to LayerType
   */
  private mapFigmaType(figmaType: string): LayerType {
    const typeMap: Record<string, LayerType> = {
      'FRAME': 'frame',
      'GROUP': 'group',
      'RECTANGLE': 'rectangle',
      'ELLIPSE': 'ellipse',
      'POLYGON': 'polygon',
      'STAR': 'star',
      'LINE': 'line',
      'TEXT': 'text',
      'VECTOR': 'vector',
      'COMPONENT': 'component',
      'INSTANCE': 'instance'
    };
    return typeMap[figmaType] || 'frame';
  }

  /**
   * Parse Figma color
   */
  private parseFigmaColor(color: any): string {
    if (!color) return '#000000';
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /**
   * Parse Figma fill
   */
  private parseFigmaFill(fill: any): Fill {
    if (fill.type === 'SOLID') {
      return {
        type: 'solid',
        color: this.parseFigmaColor(fill.color),
        opacity: fill.opacity || 1
      };
    } else if (fill.type === 'GRADIENT_LINEAR' || fill.type === 'GRADIENT_RADIAL') {
      return {
        type: 'gradient',
        gradient: {
          type: fill.type === 'GRADIENT_LINEAR' ? 'linear' : 'radial',
          stops: fill.gradientStops?.map((stop: any) => ({
            position: stop.position,
            color: this.parseFigmaColor(stop.color)
          })) || []
        }
      };
    }
    return { type: 'solid', color: '#000000' };
  }

  /**
   * Parse Figma stroke
   */
  private parseFigmaStroke(stroke: any, node: any): Stroke {
    return {
      color: this.parseFigmaColor(stroke.color),
      weight: node.strokeWeight || 1,
      align: node.strokeAlign?.toLowerCase() || 'center'
    };
  }

  /**
   * Parse Figma effect
   */
  private parseFigmaEffect(effect: any): Effect {
    return {
      type: effect.type?.toLowerCase().replace('_', '_'),
      visible: effect.visible !== false,
      radius: effect.radius || 0,
      color: effect.color ? this.parseFigmaColor(effect.color) : undefined,
      offset: effect.offset ? { x: effect.offset.x, y: effect.offset.y } : undefined,
      spread: effect.spread
    };
  }

  /**
   * Parse Figma text
   */
  private parseFigmaText(node: any): TextProperties {
    const style = node.style || {};
    return {
      content: node.characters || '',
      fontFamily: style.fontFamily || 'Inter',
      fontSize: style.fontSize || 16,
      fontWeight: style.fontWeight || 400,
      lineHeight: style.lineHeightPx || 'auto',
      letterSpacing: style.letterSpacing || 0,
      textAlign: style.textAlignHorizontal?.toLowerCase() || 'left',
      textDecoration: style.textDecoration?.toLowerCase(),
      textCase: style.textCase?.toLowerCase()
    };
  }

  /**
   * Convert frame to slide
   */
  convertFrameToSlide(importId: string, frameId: string): SlideConversion | null {
    const designImport = this.imports.get(importId);
    if (!designImport) return null;

    const frame = this.findFrame(designImport, frameId);
    if (!frame) return null;

    const { html, css } = this.generateHTMLCSS(frame);

    return {
      slideNumber: 0,
      frameId: frame.id,
      frameName: frame.name,
      html,
      css,
      assets: []
    };
  }

  /**
   * Find frame by ID
   */
  private findFrame(designImport: DesignImport, frameId: string): DesignFrame | null {
    for (const page of designImport.pages) {
      const frame = page.frames.find(f => f.id === frameId);
      if (frame) return frame;
    }
    return null;
  }

  /**
   * Generate HTML and CSS from frame
   */
  private generateHTMLCSS(frame: DesignFrame): { html: string; css: string } {
    const html = `
<div class="slide" style="width: ${frame.width}px; height: ${frame.height}px; background: ${frame.backgroundColor || '#fff'};">
  ${frame.layers.map(layer => this.layerToHTML(layer)).join('\n  ')}
</div>
    `.trim();

    const css = `
.slide {
  position: relative;
  overflow: hidden;
}
${frame.layers.map(layer => this.layerToCSS(layer)).join('\n')}
    `.trim();

    return { html, css };
  }

  /**
   * Convert layer to HTML
   */
  private layerToHTML(layer: DesignLayer, parentId: string = ''): string {
    const id = `layer-${layer.id}`;

    if (layer.type === 'text' && layer.text) {
      return `<div id="${id}" class="layer layer-text">${layer.text.content}</div>`;
    } else if (layer.type === 'image' && layer.image) {
      return `<img id="${id}" class="layer layer-image" src="${layer.image.url}" />`;
    } else if (layer.type === 'rectangle' || layer.type === 'ellipse') {
      return `<div id="${id}" class="layer layer-${layer.type}"></div>`;
    } else if (layer.children) {
      return `
<div id="${id}" class="layer layer-${layer.type}">
  ${layer.children.map(child => this.layerToHTML(child, id)).join('\n  ')}
</div>`;
    }

    return `<div id="${id}" class="layer"></div>`;
  }

  /**
   * Convert layer to CSS
   */
  private layerToCSS(layer: DesignLayer): string {
    const id = `#layer-${layer.id}`;
    const styles: string[] = [
      `position: absolute`,
      `left: ${layer.position.x}px`,
      `top: ${layer.position.y}px`,
      `width: ${layer.size.width}px`,
      `height: ${layer.size.height}px`,
      `opacity: ${layer.opacity}`
    ];

    if (layer.rotation) {
      styles.push(`transform: rotate(${layer.rotation}deg)`);
    }

    if (layer.fills && layer.fills.length > 0) {
      const fill = layer.fills[0];
      if (fill.type === 'solid') {
        styles.push(`background-color: ${fill.color}`);
      }
    }

    if (layer.type === 'ellipse') {
      styles.push(`border-radius: 50%`);
    }

    if (layer.text) {
      styles.push(`font-family: ${layer.text.fontFamily}`);
      styles.push(`font-size: ${layer.text.fontSize}px`);
      styles.push(`font-weight: ${layer.text.fontWeight}`);
      styles.push(`text-align: ${layer.text.textAlign}`);
    }

    return `${id} {\n  ${styles.join(';\n  ')};\n}`;
  }

  /**
   * Export assets from import
   */
  async exportAssets(
    importId: string,
    format: 'png' | 'svg' = 'png',
    scale: number = 1
  ): Promise<ImportedAsset[]> {
    const designImport = this.imports.get(importId);
    if (!designImport) return [];

    // In production, would export actual assets
    // For now, return simulated assets
    return designImport.assets;
  }

  /**
   * Extract design tokens
   */
  extractDesignTokens(importId: string): {
    colors: Record<string, string>;
    typography: Record<string, any>;
    spacing: Record<string, string>;
  } {
    const designImport = this.imports.get(importId);
    if (!designImport) {
      return { colors: {}, typography: {}, spacing: {} };
    }

    const colors: Record<string, string> = {};
    designImport.styles.colors.forEach((style, index) => {
      colors[style.name || `color-${index}`] = style.color;
    });

    const typography: Record<string, any> = {};
    designImport.styles.textStyles.forEach((style, index) => {
      typography[style.name || `text-${index}`] = {
        fontFamily: style.fontFamily,
        fontSize: `${style.fontSize}px`,
        fontWeight: style.fontWeight,
        lineHeight: style.lineHeight,
        letterSpacing: `${style.letterSpacing}px`
      };
    });

    // Extract common spacing values
    const spacing: Record<string, string> = {
      'xs': '4px',
      'sm': '8px',
      'md': '16px',
      'lg': '24px',
      'xl': '32px'
    };

    return { colors, typography, spacing };
  }

  /**
   * Get all imports
   */
  getImports(): DesignImport[] {
    return Array.from(this.imports.values())
      .sort((a, b) => b.importedAt.getTime() - a.importedAt.getTime());
  }

  /**
   * Get import by ID
   */
  getImport(importId: string): DesignImport | undefined {
    return this.imports.get(importId);
  }

  /**
   * Delete import
   */
  deleteImport(importId: string): boolean {
    return this.imports.delete(importId);
  }

  /**
   * Get import statistics
   */
  getStats(): {
    totalImports: number;
    figmaImports: number;
    sketchImports: number;
    totalFrames: number;
    totalAssets: number;
  } {
    const imports = Array.from(this.imports.values());

    return {
      totalImports: imports.length,
      figmaImports: imports.filter(i => i.source === 'figma').length,
      sketchImports: imports.filter(i => i.source === 'sketch').length,
      totalFrames: imports.reduce((sum, i) => sum + i.metadata.exportedFrames, 0),
      totalAssets: imports.reduce((sum, i) => sum + i.assets.length, 0)
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all imports
   */
  clearAll(): void {
    this.imports.clear();
  }
}

// Singleton instance
export const designImportManager = new DesignImportManager();

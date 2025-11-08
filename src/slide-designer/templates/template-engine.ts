/**
 * Template Engine - Professional Slide Template Renderer
 * Handles template processing, variable substitution, and asset injection
 */

import * as fs from 'fs';
import * as path from 'path';

export interface TemplateVariables {
  [key: string]: string | number | boolean | TemplateVariables | Array<any>;
}

export interface SlideData {
  type: 'title' | 'content' | 'image' | 'data' | 'closing';
  title?: string;
  subtitle?: string;
  content?: string | string[];
  image?: {
    url: string;
    alt: string;
    caption?: string;
  };
  layout?: 'single' | 'two-column' | 'three-column' | 'split';
  items?: Array<{
    title?: string;
    content: string;
    icon?: string;
  }>;
  chart?: {
    type: 'bar' | 'line' | 'pie' | 'scatter';
    data: any;
  };
  footer?: string;
  notes?: string;
}

export interface RenderOptions {
  theme?: string;
  customCSS?: string;
  includeAnimations?: boolean;
  printMode?: boolean;
}

export class TemplateEngine {
  private templatesDir: string;
  private templateCache: Map<string, string> = new Map();

  constructor(templatesDir?: string) {
    this.templatesDir = templatesDir || path.join(__dirname);
  }

  /**
   * Render a slide from template
   */
  async renderSlide(slideData: SlideData, options: RenderOptions = {}): Promise<string> {
    const templateName = this.getTemplateName(slideData.type);
    const template = await this.loadTemplate(templateName);

    // Prepare variables
    const variables = this.prepareVariables(slideData, options);

    // Render template
    let rendered = this.substituteVariables(template, variables);

    // Inject assets
    rendered = this.injectAssets(rendered, slideData);

    // Apply theme
    if (options.theme) {
      rendered = this.applyTheme(rendered, options.theme);
    }

    return rendered;
  }

  /**
   * Render multiple slides as a complete presentation
   */
  async renderPresentation(
    slides: SlideData[],
    options: RenderOptions = {}
  ): Promise<string> {
    const baseTemplate = await this.loadTemplate('base.html');

    // Render all slides
    const renderedSlides = await Promise.all(
      slides.map(slide => this.renderSlide(slide, options))
    );

    // Combine slides
    const slidesHTML = renderedSlides.join('\n');

    // Substitute into base template
    const variables = {
      slides: slidesHTML,
      theme: options.theme || 'corporate-blue',
      customCSS: options.customCSS || '',
      includeAnimations: options.includeAnimations !== false,
      printMode: options.printMode || false,
    };

    return this.substituteVariables(baseTemplate, variables);
  }

  /**
   * Load template from file
   */
  private async loadTemplate(name: string): Promise<string> {
    // Check cache first
    if (this.templateCache.has(name)) {
      return this.templateCache.get(name)!;
    }

    const templatePath = path.join(this.templatesDir, name);

    try {
      const template = fs.readFileSync(templatePath, 'utf-8');
      this.templateCache.set(name, template);
      return template;
    } catch (error) {
      throw new Error(`Failed to load template: ${name}`);
    }
  }

  /**
   * Get template name from slide type
   */
  private getTemplateName(type: SlideData['type']): string {
    const templates: Record<SlideData['type'], string> = {
      title: 'title-slide.html',
      content: 'content-slide.html',
      image: 'image-slide.html',
      data: 'data-slide.html',
      closing: 'closing-slide.html',
    };

    return templates[type];
  }

  /**
   * Prepare variables for template substitution
   */
  private prepareVariables(slideData: SlideData, options: RenderOptions): TemplateVariables {
    const vars: TemplateVariables = {
      ...slideData,
      title: slideData.title || '',
      subtitle: slideData.subtitle || '',
      content: this.formatContent(slideData.content),
      layout: slideData.layout || 'single',
      footer: slideData.footer || '',
      animationClass: options.includeAnimations ? 'slide-animate' : '',
    };

    // Format items if present
    if (slideData.items) {
      vars.itemsHTML = this.formatItems(slideData.items);
    }

    // Format image if present
    if (slideData.image) {
      vars.imageHTML = this.formatImage(slideData.image);
    }

    return vars;
  }

  /**
   * Substitute variables in template
   */
  private substituteVariables(template: string, variables: TemplateVariables): string {
    let result = template;

    // Simple variable substitution {{variable}}
    result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = variables[key];
      if (value === undefined) return match;
      return String(value);
    });

    // Conditional blocks {{#if condition}}...{{/if}}
    result = result.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, key, content) => {
      return variables[key] ? content : '';
    });

    // Loop blocks {{#each items}}...{{/each}}
    result = result.replace(/\{\{#each (\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, key, content) => {
      const items = variables[key];
      if (!Array.isArray(items)) return '';

      return items.map(item => {
        let itemContent = content;
        if (typeof item === 'object') {
          Object.keys(item).forEach(itemKey => {
            itemContent = itemContent.replace(
              new RegExp(`\\{\\{${itemKey}\\}\\}`, 'g'),
              String(item[itemKey])
            );
          });
        }
        return itemContent;
      }).join('');
    });

    return result;
  }

  /**
   * Format content (string or array) to HTML
   */
  private formatContent(content?: string | string[]): string {
    if (!content) return '';

    if (Array.isArray(content)) {
      return `<ul class="content-list">
${content.map(item => `  <li>${this.escapeHTML(item)}</li>`).join('\n')}
</ul>`;
    }

    return `<div class="content-text">${this.escapeHTML(content)}</div>`;
  }

  /**
   * Format items to HTML
   */
  private formatItems(items: SlideData['items']): string {
    if (!items || items.length === 0) return '';

    return items.map(item => `
<div class="content-item">
  ${item.icon ? `<div class="item-icon">${item.icon}</div>` : ''}
  <div class="item-content">
    ${item.title ? `<h3 class="item-title">${this.escapeHTML(item.title)}</h3>` : ''}
    <p class="item-text">${this.escapeHTML(item.content)}</p>
  </div>
</div>
    `.trim()).join('\n');
  }

  /**
   * Format image to HTML
   */
  private formatImage(image: SlideData['image']): string {
    if (!image) return '';

    return `
<figure class="slide-image">
  <img src="${this.escapeHTML(image.url)}" alt="${this.escapeHTML(image.alt)}" />
  ${image.caption ? `<figcaption>${this.escapeHTML(image.caption)}</figcaption>` : ''}
</figure>
    `.trim();
  }

  /**
   * Inject assets (images, icons) into rendered HTML
   */
  private injectAssets(html: string, slideData: SlideData): string {
    let result = html;

    // Inject image if present
    if (slideData.image && !result.includes('{{imageHTML}}')) {
      const imageHTML = this.formatImage(slideData.image);
      result = result.replace('</div>', `${imageHTML}</div>`);
    }

    return result;
  }

  /**
   * Apply theme to rendered HTML
   */
  private applyTheme(html: string, theme: string): string {
    // Theme is typically applied via CSS variables in the base template
    // This method can add theme-specific classes or inline styles
    return html.replace('<div class="slide', `<div class="slide theme-${theme}`);
  }

  /**
   * Escape HTML special characters
   */
  private escapeHTML(text: string): string {
    const escapeMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    return text.replace(/[&<>"']/g, char => escapeMap[char]);
  }

  /**
   * Clear template cache
   */
  clearCache(): void {
    this.templateCache.clear();
  }

  /**
   * Preload all templates
   */
  async preloadTemplates(): Promise<void> {
    const templates = [
      'base.html',
      'title-slide.html',
      'content-slide.html',
      'image-slide.html',
      'data-slide.html',
      'closing-slide.html',
    ];

    await Promise.all(templates.map(name => this.loadTemplate(name)));
  }

  /**
   * Export presentation to HTML file
   */
  async exportToHTML(
    slides: SlideData[],
    outputPath: string,
    options: RenderOptions = {}
  ): Promise<void> {
    const html = await this.renderPresentation(slides, options);
    fs.writeFileSync(outputPath, html, 'utf-8');
  }
}

export default TemplateEngine;

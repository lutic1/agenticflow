/**
 * HTML Renderer
 * Generates beautiful HTML slides from slide data
 */

import {
  Slide,
  Theme,
  HTMLSlideOptions,
  HTMLGenerationResult,
  SlideDesignerError,
} from '../types/index.js';
import { getLayoutEngine } from './layout-engine.js';

/**
 * HTML Renderer for generating slide presentations
 */
export class HTMLRenderer {
  private layoutEngine = getLayoutEngine();

  /**
   * Render complete slide presentation to HTML
   */
  async renderPresentation(
    slides: Slide[],
    theme: Theme,
    options: Partial<HTMLSlideOptions> = {}
  ): Promise<HTMLGenerationResult> {
    const fullOptions: HTMLSlideOptions = {
      includeCSS: true,
      includeJS: true,
      responsive: true,
      printable: true,
      exportFormat: 'standalone',
      ...options,
    };

    const slidesHTML = slides.map((slide, index) =>
      this.renderSlide(slide, index, theme)
    ).join('\n');

    const css = fullOptions.includeCSS ? this.generateCSS(theme) : '';
    const js = fullOptions.includeJS ? this.generateJS() : '';

    const html = fullOptions.exportFormat === 'standalone'
      ? this.wrapStandalone(slidesHTML, css, js, theme)
      : slidesHTML;

    return {
      html,
      css,
      js,
      assets: slides.flatMap(s => s.assets?.map(a => a.url || '') || []),
      warnings: this.validateSlides(slides),
    };
  }

  /**
   * Render a single slide
   */
  private renderSlide(slide: Slide, index: number, theme: Theme): string {
    const classes = this.layoutEngine.getLayoutClasses(slide.layout).join(' ');
    const contentHTML = this.renderContent(slide, theme);
    const assetsHTML = this.renderAssets(slide);

    return `
    <section class="${classes}" data-slide-id="${slide.id}" data-slide-index="${index}">
      <div class="slide__container">
        ${this.renderHeader(slide, theme)}
        <div class="slide__content">
          ${contentHTML}
          ${assetsHTML}
        </div>
        ${slide.metadata.notes ? this.renderNotes(slide.metadata.notes) : ''}
      </div>
    </section>`;
  }

  /**
   * Render slide header (title)
   */
  private renderHeader(slide: Slide, theme: Theme): string {
    if (!slide.title) return '';

    const isHero = slide.layout === 'title-slide';
    const tag = isHero ? 'h1' : 'h2';

    return `
    <header class="slide__header">
      <${tag} class="slide__title">${this.escapeHTML(slide.title)}</${tag}>
    </header>`;
  }

  /**
   * Render slide content
   */
  private renderContent(slide: Slide, theme: Theme): string {
    const content = slide.content;

    // Parse markdown-style formatting
    let html = this.parseMarkdown(content);

    // Wrap in content container
    return `
    <div class="slide__text">
      ${html}
    </div>`;
  }

  /**
   * Render slide assets (images, icons, charts)
   */
  private renderAssets(slide: Slide): string {
    if (!slide.assets || slide.assets.length === 0) return '';

    const assetsHTML = slide.assets.map(asset => {
      const placement = asset.placement;
      const style = `
        width: ${placement.width};
        height: ${placement.height};
        ${placement.x !== undefined ? `left: ${placement.x}px;` : ''}
        ${placement.y !== undefined ? `top: ${placement.y}px;` : ''}
      `.trim();

      if (asset.type === 'image') {
        return `
        <div class="slide__asset slide__asset--image slide__asset--${placement.position}" style="${style}">
          <img src="${asset.url || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\'/%3E'}"
               alt="${this.escapeHTML(asset.alt)}"
               loading="lazy" />
        </div>`;
      } else if (asset.type === 'icon') {
        return `
        <div class="slide__asset slide__asset--icon slide__asset--${placement.position}" style="${style}">
          <i class="icon" aria-label="${this.escapeHTML(asset.alt)}"></i>
        </div>`;
      } else {
        return `
        <div class="slide__asset slide__asset--${asset.type} slide__asset--${placement.position}" style="${style}">
          <div class="asset-placeholder">${asset.type}</div>
        </div>`;
      }
    }).join('\n');

    return `<div class="slide__assets">${assetsHTML}</div>`;
  }

  /**
   * Render speaker notes
   */
  private renderNotes(notes: string): string {
    return `
    <aside class="slide__notes" aria-label="Speaker notes">
      ${this.escapeHTML(notes)}
    </aside>`;
  }

  /**
   * Parse markdown-style formatting
   */
  private parseMarkdown(content: string): string {
    let html = content;

    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Bold and italic
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Bullet lists
    html = html.replace(/^[-*+] (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Numbered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
    // Note: This is simplified, production code would need better list detection

    // Paragraphs
    html = html.split('\n\n').map(para => {
      if (para.trim() && !para.startsWith('<')) {
        return `<p>${para.trim()}</p>`;
      }
      return para;
    }).join('\n');

    return html;
  }

  /**
   * Generate CSS for the presentation
   */
  private generateCSS(theme: Theme): string {
    const { colors, typography, spacing, effects } = theme;

    return `
:root {
  --color-primary: ${colors.primary};
  --color-secondary: ${colors.secondary};
  --color-accent: ${colors.accent};
  --color-background: ${colors.background};
  --color-text: ${colors.text};
  --color-text-secondary: ${colors.textSecondary};
  --color-border: ${colors.border || colors.textSecondary};

  --font-family: ${typography.fontFamily};
  --font-heading: ${typography.headingFont || typography.fontFamily};
  --font-size-base: ${typography.baseSize};
  --line-height: ${typography.lineHeight};

  --spacing-small: ${spacing.small};
  --spacing-base: ${spacing.base};
  --spacing-medium: ${spacing.medium};
  --spacing-large: ${spacing.large};
  --spacing-xlarge: ${spacing.xlarge};

  --border-radius: ${effects?.borderRadius || '8px'};
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  line-height: var(--line-height);
  color: var(--color-text);
  background: var(--color-background);
}

.presentation {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.slide {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xlarge);
  position: relative;
  ${effects?.animations ? 'transition: all 0.5s ease;' : ''}
}

.slide__container {
  max-width: 1200px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.slide__header {
  margin-bottom: var(--spacing-large);
}

.slide__title {
  font-family: var(--font-heading);
  font-size: ${typography.headingSizes.h1};
  font-weight: ${typography.weights.bold};
  color: var(--color-primary);
  line-height: 1.2;
}

.slide--title-slide .slide__title {
  font-size: ${typography.headingSizes.h1};
  text-align: center;
}

.slide__content {
  flex: 1;
  display: flex;
  gap: var(--spacing-large);
  align-items: center;
}

.slide__text {
  flex: 1;
}

.slide__text h2 {
  font-size: ${typography.headingSizes.h2};
  font-weight: ${typography.weights.bold};
  margin-bottom: var(--spacing-base);
  color: var(--color-primary);
}

.slide__text h3 {
  font-size: ${typography.headingSizes.h3};
  font-weight: ${typography.weights.medium};
  margin-bottom: var(--spacing-small);
  color: var(--color-secondary);
}

.slide__text p {
  margin-bottom: var(--spacing-base);
  font-size: var(--font-size-base);
  color: var(--color-text);
}

.slide__text ul,
.slide__text ol {
  margin-left: var(--spacing-medium);
  margin-bottom: var(--spacing-base);
}

.slide__text li {
  margin-bottom: var(--spacing-small);
  color: var(--color-text);
}

.slide__text strong {
  font-weight: ${typography.weights.bold};
  color: var(--color-primary);
}

.slide__text em {
  font-style: italic;
  color: var(--color-secondary);
}

.slide__assets {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide__asset img {
  width: 100%;
  height: auto;
  border-radius: var(--border-radius);
  ${effects?.shadows ? 'box-shadow: 0 10px 30px rgba(0,0,0,0.1);' : ''}
}

.slide--split .slide__content {
  flex-direction: row;
}

.slide--centered {
  text-align: center;
}

.slide--centered .slide__content {
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.slide--quote .slide__text {
  font-size: 2em;
  font-style: italic;
  text-align: center;
  color: var(--color-secondary);
  border-left: 5px solid var(--color-accent);
  padding-left: var(--spacing-large);
}

.slide__notes {
  position: absolute;
  bottom: -100%;
  left: 0;
  right: 0;
  padding: var(--spacing-base);
  background: rgba(0,0,0,0.8);
  color: white;
  font-size: 0.9em;
  transition: bottom 0.3s ease;
}

.slide:hover .slide__notes {
  bottom: 0;
}

@media print {
  .slide {
    page-break-after: always;
    height: auto;
    min-height: 100vh;
  }

  .slide__notes {
    position: relative;
    bottom: 0;
    background: transparent;
    color: var(--color-text);
    border-top: 1px solid var(--color-border);
    margin-top: var(--spacing-base);
  }
}

@media (max-width: 768px) {
  .slide {
    padding: var(--spacing-medium);
  }

  .slide__title {
    font-size: ${typography.headingSizes.h2};
  }

  .slide--split .slide__content {
    flex-direction: column;
  }
}
`.trim();
  }

  /**
   * Generate JavaScript for slide navigation
   */
  private generateJS(): string {
    return `
(function() {
  let currentSlide = 0;
  const slides = document.querySelectorAll('.slide');

  function showSlide(index) {
    if (index < 0 || index >= slides.length) return;

    slides.forEach((slide, i) => {
      slide.style.display = i === index ? 'flex' : 'none';
    });

    currentSlide = index;
    updateURL();
  }

  function nextSlide() {
    if (currentSlide < slides.length - 1) {
      showSlide(currentSlide + 1);
    }
  }

  function prevSlide() {
    if (currentSlide > 0) {
      showSlide(currentSlide - 1);
    }
  }

  function updateURL() {
    history.replaceState(null, '', '#' + currentSlide);
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'Home') {
      e.preventDefault();
      showSlide(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      showSlide(slides.length - 1);
    }
  });

  // Touch navigation
  let touchStartX = 0;
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  });

  document.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  });

  // Initialize from URL hash
  const hash = parseInt(window.location.hash.slice(1)) || 0;
  showSlide(hash);
})();
`.trim();
  }

  /**
   * Wrap HTML in standalone document
   */
  private wrapStandalone(
    slidesHTML: string,
    css: string,
    js: string,
    theme: Theme
  ): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="generator" content="Agentic Slide Designer">
  <title>Presentation</title>
  <style>${css}</style>
</head>
<body>
  <div class="presentation">
    ${slidesHTML}
  </div>
  <script>${js}</script>
</body>
</html>`;
  }

  /**
   * Validate slides and return warnings
   */
  private validateSlides(slides: Slide[]): string[] {
    const warnings: string[] = [];

    slides.forEach((slide, index) => {
      if (!slide.title && slide.layout !== 'section-header') {
        warnings.push(`Slide ${index + 1}: Missing title`);
      }

      if (slide.content.length > 500) {
        warnings.push(`Slide ${index + 1}: Content may be too long (${slide.content.length} chars)`);
      }

      if (slide.assets && slide.assets.length > 3) {
        warnings.push(`Slide ${index + 1}: Many assets (${slide.assets.length}) may clutter the slide`);
      }
    });

    return warnings;
  }

  /**
   * Escape HTML special characters
   */
  private escapeHTML(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, char => map[char]);
  }
}

/**
 * Singleton instance
 */
let rendererInstance: HTMLRenderer | null = null;

/**
 * Get or create HTML renderer instance
 */
export function getHTMLRenderer(): HTMLRenderer {
  if (!rendererInstance) {
    rendererInstance = new HTMLRenderer();
  }
  return rendererInstance;
}

/**
 * Theme Manager - Professional Theme System
 * Manages color schemes, typography, and layout variations
 */

export interface ColorScheme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  gradient?: string;
}

export interface TypographyPairing {
  name: string;
  heading: string;
  headingWeight: number;
  body: string;
  bodyWeight: number;
  fallback: string;
  googleFonts?: string[];
}

export interface LayoutVariation {
  name: string;
  contentWidth: string;
  spacing: string;
  titleSize: string;
  headingSize: string;
  bodySize: string;
  lineHeight: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  colorScheme: ColorScheme;
  typography: TypographyPairing;
  layout: LayoutVariation;
  style: 'corporate' | 'modern' | 'creative' | 'minimal' | 'tech' | 'academic';
}

export class ThemeManager {
  private themes: Map<string, Theme> = new Map();
  private currentTheme?: Theme;

  constructor() {
    this.initializeThemes();
  }

  /**
   * Initialize professional themes
   */
  private initializeThemes(): void {
    // Corporate Professional Theme
    this.addTheme({
      id: 'corporate-blue',
      name: 'Corporate Blue',
      description: 'Professional corporate theme with blue accent',
      style: 'corporate',
      colorScheme: {
        name: 'Corporate Blue',
        primary: '#1e40af',
        secondary: '#3b82f6',
        accent: '#60a5fa',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1e293b',
        textSecondary: '#64748b',
        border: '#e2e8f0',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        gradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
      },
      typography: {
        name: 'Professional Sans',
        heading: 'Inter',
        headingWeight: 700,
        body: 'Inter',
        bodyWeight: 400,
        fallback: 'system-ui, -apple-system, sans-serif',
        googleFonts: ['Inter:400,600,700'],
      },
      layout: {
        name: 'Balanced',
        contentWidth: '1200px',
        spacing: '2rem',
        titleSize: '3.5rem',
        headingSize: '2.5rem',
        bodySize: '1.25rem',
        lineHeight: '1.6',
      },
    });

    // Modern Gradient Theme
    this.addTheme({
      id: 'modern-gradient',
      name: 'Modern Gradient',
      description: 'Contemporary design with vibrant gradients',
      style: 'modern',
      colorScheme: {
        name: 'Modern Gradient',
        primary: '#8b5cf6',
        secondary: '#ec4899',
        accent: '#f472b6',
        background: '#ffffff',
        surface: '#faf5ff',
        text: '#1f2937',
        textSecondary: '#6b7280',
        border: '#e5e7eb',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
      },
      typography: {
        name: 'Modern Sans',
        heading: 'Poppins',
        headingWeight: 700,
        body: 'Inter',
        bodyWeight: 400,
        fallback: 'system-ui, sans-serif',
        googleFonts: ['Poppins:600,700', 'Inter:400,500'],
      },
      layout: {
        name: 'Modern',
        contentWidth: '1100px',
        spacing: '2.5rem',
        titleSize: '4rem',
        headingSize: '2.75rem',
        bodySize: '1.25rem',
        lineHeight: '1.7',
      },
    });

    // Creative Bold Theme
    this.addTheme({
      id: 'creative-bold',
      name: 'Creative Bold',
      description: 'Bold and creative design for innovative presentations',
      style: 'creative',
      colorScheme: {
        name: 'Creative Bold',
        primary: '#f59e0b',
        secondary: '#ef4444',
        accent: '#fb923c',
        background: '#fefce8',
        surface: '#ffffff',
        text: '#292524',
        textSecondary: '#78716c',
        border: '#fde68a',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
      },
      typography: {
        name: 'Bold Creative',
        heading: 'Montserrat',
        headingWeight: 800,
        body: 'Open Sans',
        bodyWeight: 400,
        fallback: 'sans-serif',
        googleFonts: ['Montserrat:700,800', 'Open Sans:400,600'],
      },
      layout: {
        name: 'Bold',
        contentWidth: '1150px',
        spacing: '3rem',
        titleSize: '4.5rem',
        headingSize: '3rem',
        bodySize: '1.375rem',
        lineHeight: '1.65',
      },
    });

    // Minimal Clean Theme
    this.addTheme({
      id: 'minimal-clean',
      name: 'Minimal Clean',
      description: 'Clean minimalist design with focus on content',
      style: 'minimal',
      colorScheme: {
        name: 'Minimal Clean',
        primary: '#0f172a',
        secondary: '#475569',
        accent: '#64748b',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#0f172a',
        textSecondary: '#64748b',
        border: '#cbd5e1',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #475569 100%)',
      },
      typography: {
        name: 'Minimal',
        heading: 'IBM Plex Sans',
        headingWeight: 600,
        body: 'IBM Plex Sans',
        bodyWeight: 400,
        fallback: 'system-ui, sans-serif',
        googleFonts: ['IBM Plex Sans:400,600'],
      },
      layout: {
        name: 'Minimal',
        contentWidth: '1000px',
        spacing: '2rem',
        titleSize: '3rem',
        headingSize: '2.25rem',
        bodySize: '1.125rem',
        lineHeight: '1.75',
      },
    });

    // Tech Innovation Theme
    this.addTheme({
      id: 'tech-innovation',
      name: 'Tech Innovation',
      description: 'Modern tech-focused design with dark accents',
      style: 'tech',
      colorScheme: {
        name: 'Tech Innovation',
        primary: '#06b6d4',
        secondary: '#0ea5e9',
        accent: '#22d3ee',
        background: '#0f172a',
        surface: '#1e293b',
        text: '#f8fafc',
        textSecondary: '#cbd5e1',
        border: '#334155',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
      },
      typography: {
        name: 'Tech Modern',
        heading: 'Space Grotesk',
        headingWeight: 700,
        body: 'Inter',
        bodyWeight: 400,
        fallback: 'monospace, sans-serif',
        googleFonts: ['Space Grotesk:600,700', 'Inter:400,500'],
      },
      layout: {
        name: 'Tech',
        contentWidth: '1200px',
        spacing: '2.5rem',
        titleSize: '4rem',
        headingSize: '2.5rem',
        bodySize: '1.25rem',
        lineHeight: '1.6',
      },
    });

    // Academic Professional Theme
    this.addTheme({
      id: 'academic-pro',
      name: 'Academic Professional',
      description: 'Classic academic presentation style',
      style: 'academic',
      colorScheme: {
        name: 'Academic',
        primary: '#7c3aed',
        secondary: '#a78bfa',
        accent: '#c4b5fd',
        background: '#ffffff',
        surface: '#f5f3ff',
        text: '#1e1b4b',
        textSecondary: '#6366f1',
        border: '#e0e7ff',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        gradient: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
      },
      typography: {
        name: 'Academic',
        heading: 'Merriweather',
        headingWeight: 700,
        body: 'Source Sans Pro',
        bodyWeight: 400,
        fallback: 'serif, sans-serif',
        googleFonts: ['Merriweather:700,900', 'Source Sans Pro:400,600'],
      },
      layout: {
        name: 'Academic',
        contentWidth: '1100px',
        spacing: '2.25rem',
        titleSize: '3.25rem',
        headingSize: '2.5rem',
        bodySize: '1.25rem',
        lineHeight: '1.7',
      },
    });
  }

  /**
   * Add theme to library
   */
  private addTheme(theme: Theme): void {
    this.themes.set(theme.id, theme);
  }

  /**
   * Get theme by ID
   */
  getTheme(id: string): Theme | undefined {
    return this.themes.get(id);
  }

  /**
   * Get all themes
   */
  getAllThemes(): Theme[] {
    return Array.from(this.themes.values());
  }

  /**
   * Get themes by style
   */
  getThemesByStyle(style: Theme['style']): Theme[] {
    return Array.from(this.themes.values()).filter(theme => theme.style === style);
  }

  /**
   * Set current theme
   */
  setCurrentTheme(themeId: string): boolean {
    const theme = this.themes.get(themeId);
    if (theme) {
      this.currentTheme = theme;
      return true;
    }
    return false;
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): Theme | undefined {
    return this.currentTheme;
  }

  /**
   * Generate CSS variables from theme
   */
  generateCSSVariables(theme?: Theme): string {
    const t = theme || this.currentTheme;
    if (!t) return '';

    return `
:root {
  /* Colors */
  --color-primary: ${t.colorScheme.primary};
  --color-secondary: ${t.colorScheme.secondary};
  --color-accent: ${t.colorScheme.accent};
  --color-background: ${t.colorScheme.background};
  --color-surface: ${t.colorScheme.surface};
  --color-text: ${t.colorScheme.text};
  --color-text-secondary: ${t.colorScheme.textSecondary};
  --color-border: ${t.colorScheme.border};
  --color-success: ${t.colorScheme.success};
  --color-warning: ${t.colorScheme.warning};
  --color-error: ${t.colorScheme.error};
  --gradient-primary: ${t.colorScheme.gradient};

  /* Typography */
  --font-heading: '${t.typography.heading}', ${t.typography.fallback};
  --font-body: '${t.typography.body}', ${t.typography.fallback};
  --font-weight-heading: ${t.typography.headingWeight};
  --font-weight-body: ${t.typography.bodyWeight};

  /* Layout */
  --content-width: ${t.layout.contentWidth};
  --spacing: ${t.layout.spacing};
  --font-size-title: ${t.layout.titleSize};
  --font-size-heading: ${t.layout.headingSize};
  --font-size-body: ${t.layout.bodySize};
  --line-height: ${t.layout.lineHeight};
}
    `.trim();
  }

  /**
   * Generate Google Fonts import URL
   */
  getGoogleFontsURL(theme?: Theme): string {
    const t = theme || this.currentTheme;
    if (!t || !t.typography.googleFonts) return '';

    const fonts = t.typography.googleFonts.join('&family=');
    return `https://fonts.googleapis.com/css2?family=${fonts}&display=swap`;
  }

  /**
   * Get theme recommendation based on content
   */
  recommendTheme(context: {
    industry?: string;
    audience?: string;
    tone?: 'formal' | 'casual' | 'creative' | 'technical';
  }): Theme {
    const { industry, audience, tone } = context;

    // Business/Corporate
    if (industry?.toLowerCase().includes('business') || tone === 'formal') {
      return this.themes.get('corporate-blue')!;
    }

    // Creative/Design
    if (industry?.toLowerCase().includes('creative') || tone === 'creative') {
      return this.themes.get('creative-bold')!;
    }

    // Technology
    if (industry?.toLowerCase().includes('tech') || tone === 'technical') {
      return this.themes.get('tech-innovation')!;
    }

    // Academic
    if (audience?.toLowerCase().includes('academic') || industry?.toLowerCase().includes('education')) {
      return this.themes.get('academic-pro')!;
    }

    // Default to modern gradient
    return this.themes.get('modern-gradient')!;
  }

  /**
   * Create custom theme
   */
  createCustomTheme(
    id: string,
    name: string,
    config: Partial<Theme>
  ): Theme {
    const defaultTheme = this.themes.get('corporate-blue')!;

    const customTheme: Theme = {
      id,
      name,
      description: config.description || `Custom theme: ${name}`,
      style: config.style || 'modern',
      colorScheme: { ...defaultTheme.colorScheme, ...config.colorScheme },
      typography: { ...defaultTheme.typography, ...config.typography },
      layout: { ...defaultTheme.layout, ...config.layout },
    };

    this.themes.set(id, customTheme);
    return customTheme;
  }
}

export default ThemeManager;

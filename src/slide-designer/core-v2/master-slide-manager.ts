/**
 * Master Slide Manager (V2)
 * PowerPoint-style master slide system for consistent branding
 * Global styles that cascade to all slides
 */

export interface MasterSlide {
  id: string;
  name: string;
  description: string;

  // Global typography
  typography: {
    displayFont: string;  // Titles
    bodyFont: string;     // Body text
    monoFont: string;     // Code
  };

  // Global color palette
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: {
      primary: string;
      secondary: string;
      inverse: string;
    };
  };

  // Global layout constraints
  layout: {
    padding: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    safeArea: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };

  // Persistent elements (appear on every slide)
  persistent: {
    logo?: {
      src: string;
      alt: string;
      position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
      size: { width: number; height: number };
    };

    footer?: {
      text: string;
      position: 'left' | 'center' | 'right';
      fontSize: number;
      color: string;
    };

    slideNumber?: {
      enabled: boolean;
      format: 'number' | 'number/total' | 'text';
      position: 'bottom-left' | 'bottom-right' | 'bottom-center';
      fontSize: number;
      color: string;
    };

    branding?: {
      watermark?: {
        text: string;
        opacity: number;
        rotation: number;
      };
      accentBar?: {
        height: number;
        color: string;
        position: 'top' | 'bottom';
      };
    };
  };

  // CSS template
  cssTemplate?: string;
}

export interface SlideOverrides {
  backgroundColor?: string;
  hideFooter?: boolean;
  hideSlideNumber?: boolean;
  hideLogo?: boolean;
  customPadding?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

export interface BrandKit {
  companyName: string;
  logo?: {
    url: string;
    alt: string;
  };
  fonts?: {
    heading?: string;
    body?: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  footer?: string;
}

/**
 * Master Slide Manager
 * Manages master slides and applies global styling
 */
export class MasterSlideManager {
  private masters: Map<string, MasterSlide> = new Map();
  private activeMasterId: string = 'corporate-modern';

  constructor() {
    // Initialize built-in master slides
    this.initializeBuiltInMasters();
  }

  /**
   * Initialize 5 built-in master slides
   */
  private initializeBuiltInMasters(): void {
    // 1. Corporate Modern
    this.masters.set('corporate-modern', {
      id: 'corporate-modern',
      name: 'Corporate Modern',
      description: 'Clean, professional design for corporate presentations',
      typography: {
        displayFont: "'Montserrat', sans-serif",
        bodyFont: "'Open Sans', sans-serif",
        monoFont: "'Fira Code', monospace"
      },
      colors: {
        primary: '#1A365D',
        secondary: '#2B6CB0',
        accent: '#F59E0B',
        background: '#FFFFFF',
        text: {
          primary: '#1F2937',
          secondary: '#6B7280',
          inverse: '#F9FAFB'
        }
      },
      layout: {
        padding: {
          top: 48,
          right: 48,
          bottom: 48,
          left: 48
        },
        safeArea: {
          x: 80,
          y: 80,
          width: 1760,
          height: 920
        }
      },
      persistent: {
        slideNumber: {
          enabled: true,
          format: 'number/total',
          position: 'bottom-right',
          fontSize: 14,
          color: '#6B7280'
        },
        branding: {
          accentBar: {
            height: 4,
            color: '#1A365D',
            position: 'top'
          }
        }
      }
    });

    // 2. Tech Minimal
    this.masters.set('tech-minimal', {
      id: 'tech-minimal',
      name: 'Tech Minimal',
      description: 'Minimalist design for technology and startups',
      typography: {
        displayFont: "'Inter', sans-serif",
        bodyFont: "'Inter', sans-serif",
        monoFont: "'JetBrains Mono', monospace"
      },
      colors: {
        primary: '#111827',
        secondary: '#6366F1',
        accent: '#10B981',
        background: '#FFFFFF',
        text: {
          primary: '#111827',
          secondary: '#6B7280',
          inverse: '#FFFFFF'
        }
      },
      layout: {
        padding: {
          top: 64,
          right: 64,
          bottom: 64,
          left: 64
        },
        safeArea: {
          x: 100,
          y: 100,
          width: 1720,
          height: 880
        }
      },
      persistent: {
        slideNumber: {
          enabled: true,
          format: 'number',
          position: 'bottom-center',
          fontSize: 12,
          color: '#9CA3AF'
        }
      }
    });

    // 3. Creative Bold
    this.masters.set('creative-bold', {
      id: 'creative-bold',
      name: 'Creative Bold',
      description: 'Bold, colorful design for creative presentations',
      typography: {
        displayFont: "'Poppins', sans-serif",
        bodyFont: "'Lato', sans-serif",
        monoFont: "'Source Code Pro', monospace"
      },
      colors: {
        primary: '#DC2626',
        secondary: '#FB923C',
        accent: '#8B5CF6',
        background: '#FFFFFF',
        text: {
          primary: '#1F2937',
          secondary: '#6B7280',
          inverse: '#FFFFFF'
        }
      },
      layout: {
        padding: {
          top: 40,
          right: 40,
          bottom: 40,
          left: 40
        },
        safeArea: {
          x: 70,
          y: 70,
          width: 1780,
          height: 940
        }
      },
      persistent: {
        slideNumber: {
          enabled: true,
          format: 'number/total',
          position: 'bottom-left',
          fontSize: 16,
          color: '#DC2626'
        },
        branding: {
          accentBar: {
            height: 8,
            color: '#FB923C',
            position: 'bottom'
          }
        }
      }
    });

    // 4. Finance Professional
    this.masters.set('finance-professional', {
      id: 'finance-professional',
      name: 'Finance Professional',
      description: 'Conservative, trustworthy design for financial presentations',
      typography: {
        displayFont: "'Merriweather', serif",
        bodyFont: "'Open Sans', sans-serif",
        monoFont: "'Roboto Mono', monospace"
      },
      colors: {
        primary: '#065F46',
        secondary: '#10B981',
        accent: '#F59E0B',
        background: '#FFFFFF',
        text: {
          primary: '#111827',
          secondary: '#6B7280',
          inverse: '#F9FAFB'
        }
      },
      layout: {
        padding: {
          top: 56,
          right: 56,
          bottom: 56,
          left: 56
        },
        safeArea: {
          x: 90,
          y: 90,
          width: 1740,
          height: 900
        }
      },
      persistent: {
        footer: {
          text: 'Confidential',
          position: 'center',
          fontSize: 12,
          color: '#9CA3AF'
        },
        slideNumber: {
          enabled: true,
          format: 'number/total',
          position: 'bottom-right',
          fontSize: 12,
          color: '#6B7280'
        }
      }
    });

    // 5. Academic Clean
    this.masters.set('academic-clean', {
      id: 'academic-clean',
      name: 'Academic Clean',
      description: 'Classic design for academic and educational presentations',
      typography: {
        displayFont: "'Lora', serif",
        bodyFont: "'Source Sans Pro', sans-serif",
        monoFont: "'Courier Prime', monospace"
      },
      colors: {
        primary: '#3730A3',
        secondary: '#6366F1',
        accent: '#F59E0B',
        background: '#FFFFFF',
        text: {
          primary: '#1F2937',
          secondary: '#6B7280',
          inverse: '#F9FAFB'
        }
      },
      layout: {
        padding: {
          top: 48,
          right: 48,
          bottom: 48,
          left: 48
        },
        safeArea: {
          x: 80,
          y: 80,
          width: 1760,
          height: 920
        }
      },
      persistent: {
        slideNumber: {
          enabled: true,
          format: 'number/total',
          position: 'bottom-center',
          fontSize: 14,
          color: '#6B7280'
        }
      }
    });
  }

  /**
   * Get master slide by ID
   */
  getMaster(id: string): MasterSlide | undefined {
    return this.masters.get(id);
  }

  /**
   * Get all available masters
   */
  getAllMasters(): MasterSlide[] {
    return Array.from(this.masters.values());
  }

  /**
   * Set active master
   */
  setActiveMaster(id: string): void {
    if (!this.masters.has(id)) {
      throw new Error(`Master slide "${id}" not found`);
    }
    this.activeMasterId = id;
  }

  /**
   * Get active master
   */
  getActiveMaster(): MasterSlide {
    const master = this.masters.get(this.activeMasterId);
    if (!master) {
      throw new Error('No active master slide set');
    }
    return master;
  }

  /**
   * Apply master slide to HTML content
   */
  applyMasterToSlide(
    slideHTML: string,
    slideNumber: number,
    totalSlides: number,
    overrides?: SlideOverrides
  ): string {
    const master = this.getActiveMaster();

    // Generate persistent elements
    const persistentHTML = this.generatePersistentElements(master, slideNumber, totalSlides, overrides);

    // Wrap slide content with master styling
    return `
<div class="slide-master" data-master-id="${master.id}">
  ${persistentHTML.top}
  <div class="slide-content" style="padding: ${this.getPaddingCSS(master, overrides)};">
    ${slideHTML}
  </div>
  ${persistentHTML.bottom}
</div>`;
  }

  /**
   * Generate CSS for master slide
   */
  generateMasterCSS(masterId?: string): string {
    const master = masterId ? this.getMaster(masterId) : this.getActiveMaster();
    if (!master) return '';

    return `
/* Master Slide: ${master.name} */
.slide-master[data-master-id="${master.id}"] {
  font-family: ${master.typography.bodyFont};
  background-color: ${master.colors.background};
  color: ${master.colors.text.primary};
  width: 100%;
  height: 100%;
  position: relative;
  box-sizing: border-box;
}

.slide-master[data-master-id="${master.id}"] h1,
.slide-master[data-master-id="${master.id}"] h2,
.slide-master[data-master-id="${master.id}"] h3 {
  font-family: ${master.typography.displayFont};
  color: ${master.colors.text.primary};
}

.slide-master[data-master-id="${master.id}"] code,
.slide-master[data-master-id="${master.id}"] pre {
  font-family: ${master.typography.monoFont};
}

.slide-master[data-master-id="${master.id}"] .accent {
  color: ${master.colors.accent};
}

.slide-master[data-master-id="${master.id}"] .secondary-text {
  color: ${master.colors.text.secondary};
}

/* Persistent elements */
.slide-master[data-master-id="${master.id}"] .master-logo {
  position: absolute;
  z-index: 100;
}

.slide-master[data-master-id="${master.id}"] .master-footer {
  position: absolute;
  bottom: ${master.layout.padding.bottom / 2}px;
  font-size: ${master.persistent.footer?.fontSize || 12}px;
  color: ${master.persistent.footer?.color || master.colors.text.secondary};
}

.slide-master[data-master-id="${master.id}"] .master-slide-number {
  position: absolute;
  bottom: ${master.layout.padding.bottom / 2}px;
  font-size: ${master.persistent.slideNumber?.fontSize || 14}px;
  color: ${master.persistent.slideNumber?.color || master.colors.text.secondary};
}

.slide-master[data-master-id="${master.id}"] .master-accent-bar {
  position: absolute;
  left: 0;
  right: 0;
  height: ${master.persistent.branding?.accentBar?.height || 0}px;
  background-color: ${master.persistent.branding?.accentBar?.color || master.colors.primary};
}

/* Safe area guide (for development) */
.slide-master[data-master-id="${master.id}"].show-safe-area::before {
  content: '';
  position: absolute;
  top: ${master.layout.safeArea.y}px;
  left: ${master.layout.safeArea.x}px;
  width: ${master.layout.safeArea.width}px;
  height: ${master.layout.safeArea.height}px;
  border: 2px dashed rgba(255, 0, 0, 0.3);
  pointer-events: none;
  z-index: 9999;
}
`;
  }

  /**
   * Generate persistent elements HTML
   */
  private generatePersistentElements(
    master: MasterSlide,
    slideNumber: number,
    totalSlides: number,
    overrides?: SlideOverrides
  ): { top: string; bottom: string } {
    let topHTML = '';
    let bottomHTML = '';

    // Accent bar (top)
    if (master.persistent.branding?.accentBar?.position === 'top') {
      topHTML += '<div class="master-accent-bar" style="top: 0;"></div>';
    }

    // Logo
    if (master.persistent.logo && !overrides?.hideLogo) {
      const { position, size, src, alt } = master.persistent.logo;
      const positionStyle = this.getLogoPositionCSS(position, master);
      topHTML += `<img src="${src}" alt="${alt}" class="master-logo" style="${positionStyle} width: ${size.width}px; height: ${size.height}px;" />`;
    }

    // Footer
    if (master.persistent.footer && !overrides?.hideFooter) {
      const { position, text } = master.persistent.footer;
      const alignStyle = position === 'left' ? 'left: 48px;' : position === 'right' ? 'right: 48px;' : 'left: 50%; transform: translateX(-50%);';
      bottomHTML += `<div class="master-footer" style="${alignStyle}">${text}</div>`;
    }

    // Slide number
    if (master.persistent.slideNumber?.enabled && !overrides?.hideSlideNumber) {
      const { position, format } = master.persistent.slideNumber;
      const numberText = format === 'number' ? `${slideNumber}` : `${slideNumber} / ${totalSlides}`;
      const positionStyle = this.getSlideNumberPositionCSS(position);
      bottomHTML += `<div class="master-slide-number" style="${positionStyle}">${numberText}</div>`;
    }

    // Accent bar (bottom)
    if (master.persistent.branding?.accentBar?.position === 'bottom') {
      bottomHTML += '<div class="master-accent-bar" style="bottom: 0;"></div>';
    }

    return { top: topHTML, bottom: bottomHTML };
  }

  /**
   * Get logo position CSS
   */
  private getLogoPositionCSS(
    position: MasterSlide['persistent']['logo']['position'],
    master: MasterSlide
  ): string {
    const padding = master.layout.padding;
    switch (position) {
      case 'top-left':
        return `top: ${padding.top / 2}px; left: ${padding.left / 2}px;`;
      case 'top-right':
        return `top: ${padding.top / 2}px; right: ${padding.right / 2}px;`;
      case 'bottom-left':
        return `bottom: ${padding.bottom / 2}px; left: ${padding.left / 2}px;`;
      case 'bottom-right':
        return `bottom: ${padding.bottom / 2}px; right: ${padding.right / 2}px;`;
      default:
        return '';
    }
  }

  /**
   * Get slide number position CSS
   */
  private getSlideNumberPositionCSS(
    position: MasterSlide['persistent']['slideNumber']['position']
  ): string {
    switch (position) {
      case 'bottom-left':
        return 'left: 48px;';
      case 'bottom-right':
        return 'right: 48px;';
      case 'bottom-center':
        return 'left: 50%; transform: translateX(-50%);';
      default:
        return 'right: 48px;';
    }
  }

  /**
   * Get padding CSS with overrides
   */
  private getPaddingCSS(master: MasterSlide, overrides?: SlideOverrides): string {
    const padding = master.layout.padding;
    const custom = overrides?.customPadding;

    return `${custom?.top ?? padding.top}px ${custom?.right ?? padding.right}px ${custom?.bottom ?? padding.bottom}px ${custom?.left ?? padding.left}px`;
  }

  /**
   * Create custom master from brand kit
   */
  createCustomMaster(brandKit: BrandKit): MasterSlide {
    const id = `custom-${Date.now()}`;

    const customMaster: MasterSlide = {
      id,
      name: `${brandKit.companyName} Brand`,
      description: `Custom brand master for ${brandKit.companyName}`,
      typography: {
        displayFont: brandKit.fonts?.heading || "'Montserrat', sans-serif",
        bodyFont: brandKit.fonts?.body || "'Open Sans', sans-serif",
        monoFont: "'Fira Code', monospace"
      },
      colors: {
        primary: brandKit.colors.primary,
        secondary: brandKit.colors.secondary,
        accent: brandKit.colors.accent,
        background: '#FFFFFF',
        text: {
          primary: '#1F2937',
          secondary: '#6B7280',
          inverse: '#F9FAFB'
        }
      },
      layout: {
        padding: {
          top: 48,
          right: 48,
          bottom: 48,
          left: 48
        },
        safeArea: {
          x: 80,
          y: 80,
          width: 1760,
          height: 920
        }
      },
      persistent: {
        logo: brandKit.logo ? {
          src: brandKit.logo.url,
          alt: brandKit.logo.alt,
          position: 'top-right',
          size: { width: 120, height: 40 }
        } : undefined,
        footer: brandKit.footer ? {
          text: brandKit.footer,
          position: 'center',
          fontSize: 12,
          color: '#6B7280'
        } : undefined,
        slideNumber: {
          enabled: true,
          format: 'number/total',
          position: 'bottom-right',
          fontSize: 14,
          color: '#6B7280'
        }
      }
    };

    this.masters.set(id, customMaster);
    return customMaster;
  }

  /**
   * Update master slide
   */
  updateMaster(id: string, updates: Partial<MasterSlide>): void {
    const master = this.masters.get(id);
    if (!master) {
      throw new Error(`Master slide "${id}" not found`);
    }

    Object.assign(master, updates);
  }

  /**
   * Delete custom master
   */
  deleteMaster(id: string): void {
    if (id === this.activeMasterId) {
      throw new Error('Cannot delete active master slide');
    }

    if (!id.startsWith('custom-')) {
      throw new Error('Cannot delete built-in master slides');
    }

    this.masters.delete(id);
  }
}

// Singleton instance
export const masterSlideManager = new MasterSlideManager();

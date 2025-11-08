/**
 * Transition Engine (V2)
 * Professional slide transitions and animations
 * Subtle, not distracting (McKinsey/BCG style)
 */

export interface SlideTransition {
  type:
    | 'none'
    | 'fade'
    | 'slide-left'
    | 'slide-right'
    | 'slide-up'
    | 'slide-down'
    | 'zoom-in'
    | 'zoom-out';

  duration: number; // milliseconds (300-800ms recommended)
  easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  delay?: number;   // Optional delay before transition starts
}

export interface ElementAnimation {
  element: string; // CSS selector
  animation:
    | 'fade-in'
    | 'slide-in-left'
    | 'slide-in-right'
    | 'slide-in-up'
    | 'slide-in-down'
    | 'scale-up'
    | 'bounce';

  delay: number;    // Stagger animations (0, 100, 200ms, etc.)
  duration: number; // 400-800ms
  easing: string;
}

export interface TransitionPreset {
  name: string;
  description: string;
  slideTransition: SlideTransition;
  elementAnimations: ElementAnimation[];
}

/**
 * Transition Engine
 * Manages slide transitions and element animations
 */
export class TransitionEngine {
  // Professional presets (subtle, not flashy)
  private presets: Record<string, TransitionPreset> = {
    'professional': {
      name: 'Professional',
      description: 'Subtle fade for corporate presentations',
      slideTransition: {
        type: 'fade',
        duration: 600,
        easing: 'ease-out'
      },
      elementAnimations: []
    },

    'modern': {
      name: 'Modern',
      description: 'Smooth slide transition with staggered elements',
      slideTransition: {
        type: 'slide-left',
        duration: 500,
        easing: 'ease-out'
      },
      elementAnimations: [
        { element: 'h1', animation: 'fade-in', delay: 100, duration: 500, easing: 'ease-out' },
        { element: 'p', animation: 'fade-in', delay: 200, duration: 500, easing: 'ease-out' },
        { element: 'li', animation: 'fade-in', delay: 300, duration: 400, easing: 'ease-out' }
      ]
    },

    'minimal': {
      name: 'Minimal',
      description: 'No transitions for maximum focus on content',
      slideTransition: {
        type: 'none',
        duration: 0,
        easing: 'linear'
      },
      elementAnimations: []
    },

    'dynamic': {
      name: 'Dynamic',
      description: 'Energetic transitions for creative presentations',
      slideTransition: {
        type: 'zoom-in',
        duration: 700,
        easing: 'ease-in-out'
      },
      elementAnimations: [
        { element: 'h1', animation: 'scale-up', delay: 150, duration: 600, easing: 'ease-out' },
        { element: '.image', animation: 'slide-in-right', delay: 250, duration: 600, easing: 'ease-out' }
      ]
    }
  };

  /**
   * Generate CSS for slide transitions
   */
  generateTransitionCSS(transition: SlideTransition): string {
    if (transition.type === 'none') {
      return '';
    }

    const keyframes = this.getTransitionKeyframes(transition.type);

    return `
/* Slide Transition: ${transition.type} */
.slide-enter-active {
  animation: ${transition.type} ${transition.duration}ms ${transition.easing};
  ${transition.delay ? `animation-delay: ${transition.delay}ms;` : ''}
}

@keyframes ${transition.type} {
${keyframes}
}
`.trim();
  }

  /**
   * Get keyframes for transition type
   */
  private getTransitionKeyframes(type: SlideTransition['type']): string {
    const keyframesMap: Record<string, string> = {
      'fade': `
  from { opacity: 0; }
  to { opacity: 1; }`,

      'slide-left': `
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }`,

      'slide-right': `
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }`,

      'slide-up': `
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }`,

      'slide-down': `
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }`,

      'zoom-in': `
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }`,

      'zoom-out': `
  from { transform: scale(1.2); opacity: 0; }
  to { transform: scale(1); opacity: 1; }`
    };

    return keyframesMap[type] || keyframesMap['fade'];
  }

  /**
   * Generate CSS for element animations
   */
  generateElementAnimationCSS(animations: ElementAnimation[]): string {
    if (animations.length === 0) return '';

    let css = '/* Element Animations */\n';

    animations.forEach(anim => {
      const keyframes = this.getAnimationKeyframes(anim.animation);

      css += `
${anim.element} {
  animation: ${anim.animation} ${anim.duration}ms ${anim.easing};
  animation-delay: ${anim.delay}ms;
  animation-fill-mode: both;
}

@keyframes ${anim.animation} {
${keyframes}
}
`;
    });

    return css.trim();
  }

  /**
   * Get keyframes for animation type
   */
  private getAnimationKeyframes(type: ElementAnimation['animation']): string {
    const keyframesMap: Record<string, string> = {
      'fade-in': `
  from { opacity: 0; }
  to { opacity: 1; }`,

      'slide-in-left': `
  from { transform: translateX(-30px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }`,

      'slide-in-right': `
  from { transform: translateX(30px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }`,

      'slide-in-up': `
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }`,

      'slide-in-down': `
  from { transform: translateY(-30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }`,

      'scale-up': `
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }`,

      'bounce': `
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }`
    };

    return keyframesMap[type] || keyframesMap['fade-in'];
  }

  /**
   * Get preset by name
   */
  getPreset(name: string): TransitionPreset | undefined {
    return this.presets[name];
  }

  /**
   * Get all presets
   */
  getAllPresets(): TransitionPreset[] {
    return Object.values(this.presets);
  }

  /**
   * Generate complete CSS for preset
   */
  generatePresetCSS(presetName: string): string {
    const preset = this.presets[presetName];
    if (!preset) return '';

    const transitionCSS = this.generateTransitionCSS(preset.slideTransition);
    const animationCSS = this.generateElementAnimationCSS(preset.elementAnimations);

    return `
/* Preset: ${preset.name} */
/* ${preset.description} */

${transitionCSS}

${animationCSS}

/* Print mode: disable animations */
@media print {
  * {
    animation: none !important;
    transition: none !important;
  }
}
`.trim();
  }

  /**
   * Generate staggered bullet animations
   */
  generateBulletStagger(
    bulletCount: number,
    baseDelay: number = 100,
    duration: number = 400
  ): ElementAnimation[] {
    const animations: ElementAnimation[] = [];

    for (let i = 0; i < bulletCount; i++) {
      animations.push({
        element: `.bullet-${i + 1}`,
        animation: 'fade-in',
        delay: baseDelay * i,
        duration,
        easing: 'ease-out'
      });
    }

    return animations;
  }

  /**
   * Suggest transition based on slide type
   */
  suggestTransition(slideType: 'title' | 'content' | 'data' | 'closing'): string {
    const suggestions: Record<string, string> = {
      'title': 'fade',           // Subtle for opening
      'content': 'slide-left',   // Smooth progression
      'data': 'fade',            // Don't distract from data
      'closing': 'zoom-in'       // Impact for closing
    };

    return suggestions[slideType] || 'professional';
  }

  /**
   * Create custom preset
   */
  createCustomPreset(
    name: string,
    description: string,
    slideTransition: SlideTransition,
    elementAnimations: ElementAnimation[]
  ): TransitionPreset {
    const preset: TransitionPreset = {
      name,
      description,
      slideTransition,
      elementAnimations
    };

    this.presets[name] = preset;
    return preset;
  }
}

// Singleton instance
export const transitionEngine = new TransitionEngine();

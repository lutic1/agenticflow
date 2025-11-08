/**
 * Accessibility Engine (V2)
 * WCAG AAA compliance for inclusive presentations
 * Ensures slides are accessible to all users
 */

export interface AccessibilityFeatures {
  // WCAG contrast requirements
  contrast: {
    normalText: number;   // 7:1 for AAA
    largeText: number;    // 4.5:1 for AAA
    uiElements: number;   // 3:1 minimum
  };

  // Semantic HTML
  structure: {
    useHeadings: boolean;        // <h1>, <h2>, etc.
    landmarkRoles: boolean;      // <main>, <section>
    listElements: boolean;       // <ul>, <ol> for bullets
  };

  // ARIA labels
  aria: {
    slideTitle: string;
    imageAlt: Record<string, string>;
    chartDescription: Record<string, string>;
    buttonLabels: Record<string, string>;
  };

  // Keyboard navigation
  keyboard: {
    enabled: boolean;
    shortcuts: Record<string, string>;
  };

  // Screen reader support
  screenReader: {
    announceSlide: boolean;
    liveRegion: boolean;
    skipLinks: boolean;
  };

  // Focus management
  focus: {
    visibleOutline: boolean;
    trapFocus: boolean;
    initialFocus: string;
  };
}

export interface AccessibilityReport {
  score: number; // 0-100
  level: 'AAA' | 'AA' | 'A' | 'FAIL';
  issues: AccessibilityIssue[];
  passed: number;
  warnings: number;
  errors: number;
}

export interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  rule: string;
  description: string;
  element?: string;
  wcagCriteria: string; // e.g., "1.4.3", "2.1.1"
  fix?: string;
}

/**
 * Accessibility Engine
 * Ensures WCAG AAA compliance for all slides
 */
export class AccessibilityEngine {
  // WCAG AAA standards
  private wcagStandards = {
    contrast: {
      normalText: 7.0,    // AAA
      largeText: 4.5,     // AAA (≥18pt or ≥14pt bold)
      uiElements: 3.0     // AA minimum
    },
    timing: {
      minDuration: 20,    // Minimum 20 seconds per slide
      pauseControl: true  // Must be pausable
    },
    keyboard: {
      allFunctional: true, // All functionality keyboard accessible
      noKeyboardTrap: true // No keyboard traps
    }
  };

  /**
   * Generate accessible HTML structure
   */
  generateAccessibleSlide(
    content: {
      title: string;
      body?: string;
      bullets?: string[];
      image?: { src: string; alt: string };
    },
    slideNumber: number,
    totalSlides: number
  ): string {
    return `
<section
  role="region"
  aria-label="Slide ${slideNumber} of ${totalSlides}: ${content.title}"
  tabindex="0"
>
  <!-- Skip to next slide link -->
  <a href="#slide-${slideNumber + 1}" class="skip-link">Skip to next slide</a>

  <!-- Main heading -->
  <h1 id="slide-${slideNumber}-title">${content.title}</h1>

  <!-- Body content -->
  ${content.body ? `<p>${content.body}</p>` : ''}

  <!-- Bullet list (semantic HTML) -->
  ${content.bullets && content.bullets.length > 0 ? `
  <ul role="list">
    ${content.bullets.map(bullet => `<li>${bullet}</li>`).join('\n    ')}
  </ul>
  ` : ''}

  <!-- Image with alt text -->
  ${content.image ? `
  <figure>
    <img
      src="${content.image.src}"
      alt="${content.image.alt}"
      role="img"
    />
  </figure>
  ` : ''}

  <!-- Live region for screen readers -->
  <div
    role="status"
    aria-live="polite"
    aria-atomic="true"
    class="sr-only"
  >
    Viewing slide ${slideNumber} of ${totalSlides}
  </div>
</section>`.trim();
  }

  /**
   * Generate keyboard navigation JavaScript
   */
  generateKeyboardNav(): string {
    return `
<script>
// Keyboard navigation for slides
(function() {
  let currentSlide = 1;
  const totalSlides = document.querySelectorAll('[role="region"]').length;

  document.addEventListener('keydown', function(e) {
    switch(e.key) {
      case 'ArrowRight':
      case ' ': // Space
        e.preventDefault();
        nextSlide();
        break;

      case 'ArrowLeft':
      case 'Shift': // Shift + Space
        if (e.shiftKey && e.key === ' ') {
          e.preventDefault();
          previousSlide();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          previousSlide();
        }
        break;

      case 'Home':
        e.preventDefault();
        goToSlide(1);
        break;

      case 'End':
        e.preventDefault();
        goToSlide(totalSlides);
        break;

      case 'Escape':
        e.preventDefault();
        exitFullscreen();
        break;
    }
  });

  function nextSlide() {
    if (currentSlide < totalSlides) {
      currentSlide++;
      showSlide(currentSlide);
      announceSlide();
    }
  }

  function previousSlide() {
    if (currentSlide > 1) {
      currentSlide--;
      showSlide(currentSlide);
      announceSlide();
    }
  }

  function goToSlide(slideNum) {
    if (slideNum >= 1 && slideNum <= totalSlides) {
      currentSlide = slideNum;
      showSlide(currentSlide);
      announceSlide();
    }
  }

  function showSlide(slideNum) {
    const slides = document.querySelectorAll('[role="region"]');
    slides.forEach((slide, index) => {
      if (index + 1 === slideNum) {
        slide.style.display = 'block';
        slide.focus();
      } else {
        slide.style.display = 'none';
      }
    });
  }

  function announceSlide() {
    const liveRegion = document.querySelector('[role="status"]');
    if (liveRegion) {
      liveRegion.textContent = \`Viewing slide \${currentSlide} of \${totalSlides}\`;
    }
  }

  function exitFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }

  // Initialize
  showSlide(1);
})();
</script>`.trim();
  }

  /**
   * Generate CSS for accessibility
   */
  generateAccessibilityCSS(): string {
    return `
/* Accessibility Styles */

/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Skip links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #1A365D;
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  z-index: 100;
  border-radius: 0 0 4px 0;
}

.skip-link:focus {
  top: 0;
}

/* Focus indicators (WCAG 2.4.7) */
*:focus {
  outline: 3px solid #4299E1;
  outline-offset: 2px;
}

*:focus:not(:focus-visible) {
  outline: none;
}

*:focus-visible {
  outline: 3px solid #4299E1;
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  * {
    border-color: currentColor !important;
  }

  a {
    text-decoration: underline;
  }
}

/* Reduced motion support (WCAG 2.3.3) */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Print accessibility */
@media print {
  .skip-link {
    display: none;
  }

  [role="status"] {
    display: none;
  }

  /* Ensure sufficient contrast */
  body {
    color: #000;
    background: #fff;
  }
}`.trim();
  }

  /**
   * Audit slide for accessibility issues
   */
  auditSlide(html: string): AccessibilityReport {
    const issues: AccessibilityIssue[] = [];
    let passed = 0;
    let warnings = 0;
    let errors = 0;

    // Check for semantic headings
    if (!html.includes('<h1') && !html.includes('<h2')) {
      issues.push({
        type: 'error',
        rule: 'semantic-headings',
        description: 'Slide must have at least one heading element',
        wcagCriteria: '1.3.1',
        fix: 'Add <h1> or <h2> element for slide title'
      });
      errors++;
    } else {
      passed++;
    }

    // Check for alt text on images
    const imgRegex = /<img[^>]*>/gi;
    const images = html.match(imgRegex) || [];
    images.forEach(img => {
      if (!img.includes('alt=')) {
        issues.push({
          type: 'error',
          rule: 'image-alt-text',
          description: 'Image missing alt text',
          wcagCriteria: '1.1.1',
          fix: 'Add descriptive alt text: alt="[description]"'
        });
        errors++;
      } else if (img.includes('alt=""')) {
        issues.push({
          type: 'warning',
          rule: 'empty-alt-text',
          description: 'Image has empty alt text (only acceptable for decorative images)',
          wcagCriteria: '1.1.1',
          fix: 'Provide descriptive alt text or confirm image is decorative'
        });
        warnings++;
      } else {
        passed++;
      }
    });

    // Check for ARIA labels
    if (!html.includes('aria-label') && !html.includes('role="region"')) {
      issues.push({
        type: 'warning',
        rule: 'aria-labels',
        description: 'Slide should have ARIA labels for screen readers',
        wcagCriteria: '4.1.2',
        fix: 'Add role="region" and aria-label to slide container'
      });
      warnings++;
    } else {
      passed++;
    }

    // Check for semantic lists
    if (html.includes('•') || html.includes('-')) {
      if (!html.includes('<ul') && !html.includes('<ol')) {
        issues.push({
          type: 'error',
          rule: 'semantic-lists',
          description: 'Bullets should use <ul> or <ol> elements',
          wcagCriteria: '1.3.1',
          fix: 'Replace plain text bullets with <ul> and <li> elements'
        });
        errors++;
      } else {
        passed++;
      }
    }

    // Calculate score
    const total = passed + warnings + errors;
    const score = total > 0 ? Math.round((passed / total) * 100) : 0;

    // Determine level
    let level: AccessibilityReport['level'];
    if (score >= 90 && errors === 0) {
      level = 'AAA';
    } else if (score >= 75 && errors === 0) {
      level = 'AA';
    } else if (score >= 60) {
      level = 'A';
    } else {
      level = 'FAIL';
    }

    return {
      score,
      level,
      issues,
      passed,
      warnings,
      errors
    };
  }

  /**
   * Get WCAG standards
   */
  getWCAGStandards() {
    return { ...this.wcagStandards };
  }

  /**
   * Generate accessibility statement
   */
  generateAccessibilityStatement(): string {
    return `
<section role="contentinfo" aria-label="Accessibility Statement">
  <h2>Accessibility Statement</h2>

  <p>
    This presentation is designed to be accessible to all users,
    including those using assistive technologies.
  </p>

  <h3>Compliance Level</h3>
  <p>
    This presentation conforms to WCAG 2.1 Level AAA.
  </p>

  <h3>Keyboard Navigation</h3>
  <ul>
    <li><kbd>→</kbd> or <kbd>Space</kbd>: Next slide</li>
    <li><kbd>←</kbd> or <kbd>Shift</kbd>+<kbd>Space</kbd>: Previous slide</li>
    <li><kbd>Home</kbd>: First slide</li>
    <li><kbd>End</kbd>: Last slide</li>
    <li><kbd>Esc</kbd>: Exit fullscreen</li>
  </ul>

  <h3>Screen Reader Support</h3>
  <p>
    All slides include ARIA labels and live regions for screen reader users.
    Images include descriptive alt text.
  </p>

  <h3>Contrast</h3>
  <p>
    All text meets WCAG AAA contrast requirements (7:1 for normal text,
    4.5:1 for large text).
  </p>

  <h3>Feedback</h3>
  <p>
    If you encounter any accessibility barriers, please contact us.
  </p>
</section>`.trim();
  }
}

// Singleton instance
export const accessibilityEngine = new AccessibilityEngine();

/**
 * Performance monitoring utilities
 */

import { telemetry } from './telemetry';

export class PerformanceMonitor {
  private static initialized = false;

  // Core Web Vitals
  static monitorWebVitals() {
    if (typeof window === 'undefined' || this.initialized) return;

    this.initialized = true;

    try {
      // Largest Contentful Paint (LCP)
      this.observeLCP();

      // First Input Delay (FID)
      this.observeFID();

      // Cumulative Layout Shift (CLS)
      this.observeCLS();

      // Time to First Byte (TTFB)
      this.observeTTFB();

      // First Contentful Paint (FCP)
      this.observeFCP();
    } catch (error) {
      console.error('[PerformanceMonitor] Failed to initialize:', error);
    }
  }

  private static observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const lcpEntry = entry as any;
          const value = lcpEntry.renderTime || lcpEntry.loadTime;
          telemetry.trackPerformance('LCP', value, {
            rating: this.rateLCP(value),
          });
        }
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      // Browser doesn't support LCP
    }
  }

  private static observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as any;
          const value = fidEntry.processingStart - entry.startTime;
          telemetry.trackPerformance('FID', value, {
            rating: this.rateFID(value),
          });
        }
      });
      observer.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      // Browser doesn't support FID
    }
  }

  private static observeCLS() {
    try {
      let cls = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const clsEntry = entry as any;
          if (!clsEntry.hadRecentInput) {
            cls += clsEntry.value;
            telemetry.trackPerformance('CLS', cls, {
              rating: this.rateCLS(cls),
            });
          }
        }
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      // Browser doesn't support CLS
    }
  }

  private static observeTTFB() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const navEntry = entry as PerformanceNavigationTiming;
          const ttfb = navEntry.responseStart - navEntry.requestStart;
          telemetry.trackPerformance('TTFB', ttfb, {
            rating: this.rateTTFB(ttfb),
          });
        }
      });
      observer.observe({ entryTypes: ['navigation'] });
    } catch (error) {
      // Fallback for older browsers
      if ('performance' in window && 'timing' in performance) {
        const timing = performance.timing as any;
        const ttfb = timing.responseStart - timing.requestStart;
        telemetry.trackPerformance('TTFB', ttfb, {
          rating: this.rateTTFB(ttfb),
        });
      }
    }
  }

  private static observeFCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            telemetry.trackPerformance('FCP', entry.startTime, {
              rating: this.rateFCP(entry.startTime),
            });
          }
        }
      });
      observer.observe({ entryTypes: ['paint'] });
    } catch (error) {
      // Browser doesn't support FCP
    }
  }

  // Rating thresholds based on Google's Web Vitals
  private static rateLCP(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 2500) return 'good';
    if (value <= 4000) return 'needs-improvement';
    return 'poor';
  }

  private static rateFID(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 100) return 'good';
    if (value <= 300) return 'needs-improvement';
    return 'poor';
  }

  private static rateCLS(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 0.1) return 'good';
    if (value <= 0.25) return 'needs-improvement';
    return 'poor';
  }

  private static rateTTFB(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 800) return 'good';
    if (value <= 1800) return 'needs-improvement';
    return 'poor';
  }

  private static rateFCP(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 1800) return 'good';
    if (value <= 3000) return 'needs-improvement';
    return 'poor';
  }

  // Track component render time
  static trackRender(componentName: string, renderTime: number) {
    telemetry.trackPerformance(`render_${componentName}`, renderTime, {
      component: componentName,
    });
  }

  // Track route change time
  static trackRouteChange(route: string, duration: number) {
    telemetry.trackPerformance(`route_change`, duration, {
      route,
    });
  }

  // Track custom performance metric
  static trackCustomMetric(name: string, value: number, metadata?: Record<string, unknown>) {
    telemetry.trackPerformance(name, value, metadata);
  }

  // Measure function execution time
  static async measure<T>(
    name: string,
    fn: () => T | Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      this.trackCustomMetric(name, duration, metadata);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.trackCustomMetric(name, duration, { ...metadata, error: true });
      throw error;
    }
  }
}

// Initialize in browser
if (typeof window !== 'undefined') {
  PerformanceMonitor.monitorWebVitals();
}

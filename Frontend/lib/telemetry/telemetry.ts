/**
 * Lightweight telemetry service
 *
 * Features:
 * - API timing metrics
 * - Error tagging and categorization
 * - User journey breadcrumbs
 * - Performance monitoring
 * - Zero impact on production performance
 */

export type TelemetryEvent = {
  type: 'api_call' | 'user_action' | 'error' | 'performance' | 'navigation';
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, unknown>;
  timestamp: number;
  sessionId: string;
  userId?: string;
};

export class TelemetryService {
  private events: TelemetryEvent[] = [];
  private sessionId: string;
  private userId?: string;
  private batchTimer?: NodeJS.Timeout;
  private batchedEvents: TelemetryEvent[] = [];
  private readonly BATCH_INTERVAL = 5000; // 5 seconds
  private readonly MAX_EVENTS = 1000; // Prevent memory leaks

  constructor() {
    this.sessionId = this.generateSessionId();
    if (typeof window !== 'undefined') {
      this.userId = localStorage.getItem('user_id') || undefined;
      this.startBatching();
    }
  }

  // API call timing
  trackAPICall(endpoint: string, duration: number, success: boolean, metadata?: Record<string, unknown>) {
    this.track({
      type: 'api_call',
      category: 'backend',
      action: endpoint,
      label: success ? 'success' : 'error',
      value: duration,
      metadata: {
        endpoint,
        duration,
        success,
        ...metadata,
      },
    });
  }

  // User actions
  trackUserAction(action: string, metadata?: Record<string, unknown>) {
    this.track({
      type: 'user_action',
      category: 'interaction',
      action,
      metadata,
    });
  }

  // Errors
  trackError(error: Error, context?: string, metadata?: Record<string, unknown>) {
    this.track({
      type: 'error',
      category: 'error',
      action: error.name,
      label: context,
      metadata: {
        message: error.message,
        stack: error.stack,
        context,
        ...metadata,
      },
    });
  }

  // Performance metrics
  trackPerformance(metric: string, value: number, metadata?: Record<string, unknown>) {
    this.track({
      type: 'performance',
      category: 'performance',
      action: metric,
      value,
      metadata,
    });
  }

  // Navigation
  trackNavigation(from: string, to: string, metadata?: Record<string, unknown>) {
    this.track({
      type: 'navigation',
      category: 'navigation',
      action: 'page_view',
      label: to,
      metadata: { from, to, ...metadata },
    });
  }

  // Core tracking
  private track(event: Omit<TelemetryEvent, 'timestamp' | 'sessionId' | 'userId'>) {
    const fullEvent: TelemetryEvent = {
      ...event,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
    };

    // Add to in-memory store
    this.events.push(fullEvent);

    // Prevent memory leaks
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }

    // Add to batch queue
    this.batchedEvents.push(fullEvent);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Telemetry]', fullEvent);
    }
  }

  // Batching logic
  private startBatching() {
    this.batchTimer = setInterval(() => {
      this.flushBatch();
    }, this.BATCH_INTERVAL);
  }

  private async flushBatch() {
    if (this.batchedEvents.length === 0) return;

    const eventsToSend = [...this.batchedEvents];
    this.batchedEvents = [];

    try {
      await this.sendToBackend(eventsToSend);
    } catch (error) {
      // Silently fail - don't impact user experience
      if (process.env.NODE_ENV === 'development') {
        console.error('[Telemetry] Failed to send events:', error);
      }
    }
  }

  private async sendToBackend(events: TelemetryEvent[]) {
    // TODO: Implement actual backend endpoint
    // For now, just log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Telemetry] Would send ${events.length} events to backend`);
    }

    // Example implementation:
    // await fetch('/api/telemetry', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ events }),
    // });
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get events for debugging
  getEvents(filter?: Partial<TelemetryEvent>): TelemetryEvent[] {
    if (!filter) return this.events;
    return this.events.filter(event =>
      Object.entries(filter).every(([key, value]) =>
        event[key as keyof TelemetryEvent] === value
      )
    );
  }

  // Get statistics
  getStats() {
    const apiCalls = this.events.filter(e => e.type === 'api_call');
    const errors = this.events.filter(e => e.type === 'error');
    const userActions = this.events.filter(e => e.type === 'user_action');

    const apiSuccesses = apiCalls.filter(e => e.label === 'success');
    const apiFailures = apiCalls.filter(e => e.label === 'error');

    const totalAPITime = apiCalls.reduce((sum, e) => sum + (e.value || 0), 0);
    const avgAPITime = apiCalls.length > 0 ? totalAPITime / apiCalls.length : 0;

    return {
      totalEvents: this.events.length,
      apiCalls: {
        total: apiCalls.length,
        successes: apiSuccesses.length,
        failures: apiFailures.length,
        successRate: apiCalls.length > 0 ? (apiSuccesses.length / apiCalls.length) * 100 : 0,
        avgTime: avgAPITime,
        totalTime: totalAPITime,
      },
      errors: {
        total: errors.length,
        byType: this.groupBy(errors, 'action'),
      },
      userActions: {
        total: userActions.length,
        byAction: this.groupBy(userActions, 'action'),
      },
      sessionId: this.sessionId,
      userId: this.userId,
    };
  }

  private groupBy(events: TelemetryEvent[], key: keyof TelemetryEvent): Record<string, number> {
    return events.reduce((acc, event) => {
      const value = String(event[key]);
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  // Export logs
  exportLogs(): string {
    return JSON.stringify({
      sessionId: this.sessionId,
      userId: this.userId,
      exportedAt: new Date().toISOString(),
      stats: this.getStats(),
      events: this.events,
    }, null, 2);
  }

  // Cleanup
  cleanup() {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }
    this.flushBatch();
  }
}

// Singleton instance
export const telemetry = new TelemetryService();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    telemetry.cleanup();
  });
}

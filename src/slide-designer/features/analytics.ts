/**
 * Presentation Analytics (P1.13)
 * Track viewer engagement, slide time, interactions
 * Heatmaps, engagement metrics, audience insights
 */

export interface AnalyticsEvent {
  id: string;
  sessionId: string;
  timestamp: Date;
  type: AnalyticsEventType;
  slideNumber?: number;
  metadata?: Record<string, any>;
}

export type AnalyticsEventType =
  | 'presentation_start'
  | 'presentation_end'
  | 'slide_view'
  | 'slide_change'
  | 'link_click'
  | 'video_play'
  | 'video_pause'
  | 'download'
  | 'share'
  | 'feedback';

export interface SessionMetrics {
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // seconds
  totalSlides: number;
  slidesViewed: number;
  slideMetrics: SlideMetrics[];
  viewer?: ViewerInfo;
  deviceInfo?: DeviceInfo;
  completion: number; // percentage
}

export interface SlideMetrics {
  slideNumber: number;
  viewCount: number;
  totalTimeSpent: number; // seconds
  averageTimeSpent: number; // seconds
  bounceRate: number; // percentage
  interactions: number;
  heatmap?: HeatmapData;
}

export interface ViewerInfo {
  id?: string;
  name?: string;
  email?: string;
  location?: string;
  referrer?: string;
}

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  browser: string;
  screenResolution: string;
  isMobile: boolean;
}

export interface HeatmapData {
  clicks: Array<{ x: number; y: number; timestamp: Date }>;
  scrollDepth: number; // percentage
  focusAreas: Array<{ element: string; duration: number }>;
}

export interface AnalyticsSummary {
  totalSessions: number;
  totalViews: number;
  averageDuration: number;
  completionRate: number;
  topSlides: Array<{ slideNumber: number; views: number }>;
  deviceBreakdown: Record<string, number>;
  geographicDistribution: Record<string, number>;
}

/**
 * Presentation Analytics Manager
 * Track and analyze presentation engagement
 */
export class PresentationAnalyticsManager {
  private events: Map<string, AnalyticsEvent[]>;
  private sessions: Map<string, SessionMetrics>;
  private currentSession: string | null = null;
  private trackingEnabled: boolean = true;

  constructor() {
    this.events = new Map();
    this.sessions = new Map();
  }

  /**
   * Start tracking session
   */
  startSession(totalSlides: number, viewer?: ViewerInfo): string {
    const sessionId = this.generateSessionId();
    const deviceInfo = this.detectDevice();

    const session: SessionMetrics = {
      sessionId,
      startTime: new Date(),
      duration: 0,
      totalSlides,
      slidesViewed: 0,
      slideMetrics: Array.from({ length: totalSlides }, (_, i) => ({
        slideNumber: i + 1,
        viewCount: 0,
        totalTimeSpent: 0,
        averageTimeSpent: 0,
        bounceRate: 0,
        interactions: 0
      })),
      viewer,
      deviceInfo,
      completion: 0
    };

    this.sessions.set(sessionId, session);
    this.currentSession = sessionId;

    // Track start event
    this.trackEvent('presentation_start', { totalSlides });

    return sessionId;
  }

  /**
   * End tracking session
   */
  endSession(sessionId?: string): void {
    const sid = sessionId || this.currentSession;
    if (!sid) return;

    const session = this.sessions.get(sid);
    if (!session) return;

    session.endTime = new Date();
    session.duration = Math.floor(
      (session.endTime.getTime() - session.startTime.getTime()) / 1000
    );

    // Calculate completion
    session.completion = Math.round(
      (session.slidesViewed / session.totalSlides) * 100
    );

    // Track end event
    this.trackEvent('presentation_end', {
      duration: session.duration,
      completion: session.completion
    });

    if (this.currentSession === sid) {
      this.currentSession = null;
    }
  }

  /**
   * Track slide view
   */
  trackSlideView(slideNumber: number, duration?: number): void {
    if (!this.currentSession) return;

    const session = this.sessions.get(this.currentSession);
    if (!session) return;

    const slideMetric = session.slideMetrics[slideNumber - 1];
    if (!slideMetric) return;

    // Update metrics
    slideMetric.viewCount++;
    if (duration) {
      slideMetric.totalTimeSpent += duration;
      slideMetric.averageTimeSpent = slideMetric.totalTimeSpent / slideMetric.viewCount;
    }

    // Update session
    const uniqueSlidesViewed = session.slideMetrics.filter(m => m.viewCount > 0).length;
    session.slidesViewed = uniqueSlidesViewed;

    // Track event
    this.trackEvent('slide_view', { slideNumber, duration });
  }

  /**
   * Track slide change
   */
  trackSlideChange(fromSlide: number, toSlide: number): void {
    this.trackEvent('slide_change', { fromSlide, toSlide });
  }

  /**
   * Track interaction
   */
  trackInteraction(
    type: 'link_click' | 'video_play' | 'video_pause' | 'download' | 'share',
    metadata?: Record<string, any>
  ): void {
    if (!this.currentSession) return;

    const session = this.sessions.get(this.currentSession);
    if (!session || !metadata?.slideNumber) return;

    const slideMetric = session.slideMetrics[metadata.slideNumber - 1];
    if (slideMetric) {
      slideMetric.interactions++;
    }

    this.trackEvent(type, metadata);
  }

  /**
   * Track heatmap data
   */
  trackHeatmap(slideNumber: number, data: Partial<HeatmapData>): void {
    if (!this.currentSession) return;

    const session = this.sessions.get(this.currentSession);
    if (!session) return;

    const slideMetric = session.slideMetrics[slideNumber - 1];
    if (!slideMetric) return;

    if (!slideMetric.heatmap) {
      slideMetric.heatmap = {
        clicks: [],
        scrollDepth: 0,
        focusAreas: []
      };
    }

    // Merge heatmap data
    if (data.clicks) {
      slideMetric.heatmap.clicks.push(...data.clicks);
    }
    if (data.scrollDepth !== undefined) {
      slideMetric.heatmap.scrollDepth = Math.max(
        slideMetric.heatmap.scrollDepth,
        data.scrollDepth
      );
    }
    if (data.focusAreas) {
      slideMetric.heatmap.focusAreas.push(...data.focusAreas);
    }
  }

  /**
   * Track generic event
   */
  private trackEvent(
    type: AnalyticsEventType,
    metadata?: Record<string, any>
  ): void {
    if (!this.trackingEnabled || !this.currentSession) return;

    const event: AnalyticsEvent = {
      id: this.generateEventId(),
      sessionId: this.currentSession,
      timestamp: new Date(),
      type,
      slideNumber: metadata?.slideNumber,
      metadata
    };

    if (!this.events.has(this.currentSession)) {
      this.events.set(this.currentSession, []);
    }

    this.events.get(this.currentSession)!.push(event);
  }

  /**
   * Get session metrics
   */
  getSessionMetrics(sessionId: string): SessionMetrics | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get all sessions
   */
  getAllSessions(): SessionMetrics[] {
    return Array.from(this.sessions.values()).sort(
      (a, b) => b.startTime.getTime() - a.startTime.getTime()
    );
  }

  /**
   * Get events for session
   */
  getSessionEvents(sessionId: string): AnalyticsEvent[] {
    return this.events.get(sessionId) || [];
  }

  /**
   * Get analytics summary
   */
  getSummary(): AnalyticsSummary {
    const sessions = this.getAllSessions();

    const totalSessions = sessions.length;
    const totalViews = sessions.reduce((sum, s) => sum + s.slidesViewed, 0);
    const averageDuration = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length
      : 0;
    const completionRate = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + s.completion, 0) / sessions.length
      : 0;

    // Top slides by views
    const slideCounts: Record<number, number> = {};
    sessions.forEach(session => {
      session.slideMetrics.forEach(metric => {
        if (metric.viewCount > 0) {
          slideCounts[metric.slideNumber] = (slideCounts[metric.slideNumber] || 0) + metric.viewCount;
        }
      });
    });

    const topSlides = Object.entries(slideCounts)
      .map(([slideNumber, views]) => ({ slideNumber: parseInt(slideNumber), views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Device breakdown
    const deviceBreakdown: Record<string, number> = {};
    sessions.forEach(session => {
      if (session.deviceInfo) {
        const device = session.deviceInfo.isMobile ? 'Mobile' : 'Desktop';
        deviceBreakdown[device] = (deviceBreakdown[device] || 0) + 1;
      }
    });

    // Geographic distribution
    const geographicDistribution: Record<string, number> = {};
    sessions.forEach(session => {
      if (session.viewer?.location) {
        const location = session.viewer.location;
        geographicDistribution[location] = (geographicDistribution[location] || 0) + 1;
      }
    });

    return {
      totalSessions,
      totalViews,
      averageDuration,
      completionRate,
      topSlides,
      deviceBreakdown,
      geographicDistribution
    };
  }

  /**
   * Get slide engagement metrics
   */
  getSlideEngagement(slideNumber: number): {
    totalViews: number;
    averageTime: number;
    bounceRate: number;
    interactionRate: number;
  } {
    const sessions = this.getAllSessions();

    let totalViews = 0;
    let totalTime = 0;
    let bounces = 0;
    let totalInteractions = 0;

    sessions.forEach(session => {
      const metric = session.slideMetrics[slideNumber - 1];
      if (metric) {
        totalViews += metric.viewCount;
        totalTime += metric.totalTimeSpent;
        totalInteractions += metric.interactions;

        // Count as bounce if view time < 3 seconds
        if (metric.averageTimeSpent < 3) {
          bounces++;
        }
      }
    });

    return {
      totalViews,
      averageTime: totalViews > 0 ? totalTime / totalViews : 0,
      bounceRate: totalViews > 0 ? (bounces / totalViews) * 100 : 0,
      interactionRate: totalViews > 0 ? (totalInteractions / totalViews) * 100 : 0
    };
  }

  /**
   * Get funnel analysis (drop-off by slide)
   */
  getFunnelAnalysis(): Array<{ slideNumber: number; viewers: number; dropOff: number }> {
    const sessions = this.getAllSessions();
    if (sessions.length === 0) return [];

    const totalSlides = sessions[0]?.totalSlides || 0;
    const funnel: Array<{ slideNumber: number; viewers: number; dropOff: number }> = [];

    for (let i = 1; i <= totalSlides; i++) {
      const viewers = sessions.filter(s =>
        s.slideMetrics[i - 1]?.viewCount > 0
      ).length;

      const prevViewers = i === 1 ? sessions.length : funnel[i - 2].viewers;
      const dropOff = prevViewers > 0
        ? ((prevViewers - viewers) / prevViewers) * 100
        : 0;

      funnel.push({ slideNumber: i, viewers, dropOff });
    }

    return funnel;
  }

  /**
   * Detect device information
   */
  private detectDevice(): DeviceInfo {
    if (typeof navigator === 'undefined') {
      return {
        userAgent: 'Unknown',
        platform: 'Unknown',
        browser: 'Unknown',
        screenResolution: 'Unknown',
        isMobile: false
      };
    }

    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);

    // Detect browser
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    const screenResolution = typeof window !== 'undefined'
      ? `${window.screen.width}x${window.screen.height}`
      : 'Unknown';

    return {
      userAgent,
      platform,
      browser,
      screenResolution,
      isMobile
    };
  }

  /**
   * Export analytics data
   */
  export(format: 'json' | 'csv'): string {
    if (format === 'json') {
      return JSON.stringify({
        sessions: Array.from(this.sessions.entries()),
        events: Array.from(this.events.entries()),
        summary: this.getSummary()
      }, null, 2);
    } else {
      // CSV format
      const sessions = this.getAllSessions();
      const headers = 'Session ID,Start Time,Duration,Slides Viewed,Completion,Device,Browser\n';
      const rows = sessions.map(s =>
        `${s.sessionId},${s.startTime.toISOString()},${s.duration},${s.slidesViewed},${s.completion}%,${s.deviceInfo?.isMobile ? 'Mobile' : 'Desktop'},${s.deviceInfo?.browser || 'Unknown'}`
      ).join('\n');

      return headers + rows;
    }
  }

  /**
   * Import analytics data
   */
  import(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);

      this.sessions.clear();
      this.events.clear();

      data.sessions.forEach(([id, session]: [string, any]) => {
        this.sessions.set(id, {
          ...session,
          startTime: new Date(session.startTime),
          endTime: session.endTime ? new Date(session.endTime) : undefined
        });
      });

      data.events.forEach(([id, events]: [string, any[]]) => {
        this.events.set(id, events.map(e => ({
          ...e,
          timestamp: new Date(e.timestamp)
        })));
      });

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clear all analytics data
   */
  clearAll(): void {
    this.sessions.clear();
    this.events.clear();
    this.currentSession = null;
  }

  /**
   * Enable/disable tracking
   */
  setTrackingEnabled(enabled: boolean): void {
    this.trackingEnabled = enabled;
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate event ID
   */
  private generateEventId(): string {
    return `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get total sessions count
   */
  getSessionCount(): number {
    return this.sessions.size;
  }

  /**
   * Get total events count
   */
  getEventCount(): number {
    return Array.from(this.events.values()).reduce((sum, events) => sum + events.length, 0);
  }
}

// Singleton instance
export const presentationAnalytics = new PresentationAnalyticsManager();

/**
 * User journey breadcrumbs
 * Track user flow through the application
 */

import { telemetry } from './telemetry';

export interface Breadcrumb {
  action: string;
  path: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

class BreadcrumbManager {
  private breadcrumbs: Breadcrumb[] = [];
  private readonly MAX_BREADCRUMBS = 50;

  track(action: string, metadata?: Record<string, unknown>) {
    const breadcrumb: Breadcrumb = {
      action,
      path: typeof window !== 'undefined' ? window.location.pathname : '',
      timestamp: Date.now(),
      metadata,
    };

    this.breadcrumbs.push(breadcrumb);

    // Limit breadcrumbs to prevent memory leaks
    if (this.breadcrumbs.length > this.MAX_BREADCRUMBS) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.MAX_BREADCRUMBS);
    }

    // Track with telemetry
    telemetry.trackUserAction(action, {
      ...metadata,
      breadcrumb: true,
      path: breadcrumb.path,
    });
  }

  getBreadcrumbs(): Breadcrumb[] {
    return [...this.breadcrumbs];
  }

  getRecentBreadcrumbs(count: number = 10): Breadcrumb[] {
    return this.breadcrumbs.slice(-count);
  }

  getUserJourney(): string {
    return this.breadcrumbs
      .map(b => `${new Date(b.timestamp).toISOString()} - ${b.action} (${b.path})`)
      .join('\n');
  }

  clear() {
    this.breadcrumbs = [];
  }
}

const breadcrumbManager = new BreadcrumbManager();

// Core application events
export const trackBreadcrumb = (action: string, metadata?: Record<string, unknown>) => {
  breadcrumbManager.track(action, metadata);
};

// Presentation events
export const trackPresentationCreated = (presentationId: string, metadata?: Record<string, unknown>) => {
  trackBreadcrumb('presentation_created', { presentationId, ...metadata });
};

export const trackPresentationOpened = (presentationId: string, metadata?: Record<string, unknown>) => {
  trackBreadcrumb('presentation_opened', { presentationId, ...metadata });
};

export const trackPresentationDeleted = (presentationId: string, metadata?: Record<string, unknown>) => {
  trackBreadcrumb('presentation_deleted', { presentationId, ...metadata });
};

// Slide events
export const trackSlideAdded = (slideId: string, metadata?: Record<string, unknown>) => {
  trackBreadcrumb('slide_added', { slideId, ...metadata });
};

export const trackSlideEdited = (slideId: string, metadata?: Record<string, unknown>) => {
  trackBreadcrumb('slide_edited', { slideId, ...metadata });
};

export const trackSlideDeleted = (slideId: string, metadata?: Record<string, unknown>) => {
  trackBreadcrumb('slide_deleted', { slideId, ...metadata });
};

export const trackSlideReordered = (fromIndex: number, toIndex: number, metadata?: Record<string, unknown>) => {
  trackBreadcrumb('slide_reordered', { fromIndex, toIndex, ...metadata });
};

// Content events
export const trackContentGenerated = (contentType: string, metadata?: Record<string, unknown>) => {
  trackBreadcrumb('content_generated', { contentType, ...metadata });
};

export const trackTemplateApplied = (templateId: string, metadata?: Record<string, unknown>) => {
  trackBreadcrumb('template_applied', { templateId, ...metadata });
};

export const trackThemeChanged = (themeId: string, metadata?: Record<string, unknown>) => {
  trackBreadcrumb('theme_changed', { themeId, ...metadata });
};

// Export events
export const trackExportStarted = (format: string, metadata?: Record<string, unknown>) => {
  trackBreadcrumb('export_started', { format, ...metadata });
};

export const trackExportCompleted = (format: string, metadata?: Record<string, unknown>) => {
  trackBreadcrumb('export_completed', { format, ...metadata });
};

export const trackExportFailed = (format: string, error: string, metadata?: Record<string, unknown>) => {
  trackBreadcrumb('export_failed', { format, error, ...metadata });
};

// Collaboration events
export const trackCollaboratorAdded = (collaboratorId: string, metadata?: Record<string, unknown>) => {
  trackBreadcrumb('collaborator_added', { collaboratorId, ...metadata });
};

export const trackCollaboratorRemoved = (collaboratorId: string, metadata?: Record<string, unknown>) => {
  trackBreadcrumb('collaborator_removed', { collaboratorId, ...metadata });
};

export const trackCommentAdded = (commentId: string, metadata?: Record<string, unknown>) => {
  trackBreadcrumb('comment_added', { commentId, ...metadata });
};

// Feature usage events
export const trackFeatureUsed = (featureId: string, metadata?: Record<string, unknown>) => {
  trackBreadcrumb('feature_used', { featureId, ...metadata });
};

export const trackFeatureEnabled = (featureId: string, metadata?: Record<string, unknown>) => {
  trackBreadcrumb('feature_enabled', { featureId, ...metadata });
};

export const trackFeatureDisabled = (featureId: string, metadata?: Record<string, unknown>) => {
  trackBreadcrumb('feature_disabled', { featureId, ...metadata });
};

// Error recovery events
export const trackErrorRecovered = (errorType: string, metadata?: Record<string, unknown>) => {
  trackBreadcrumb('error_recovered', { errorType, ...metadata });
};

export const trackRetryAttempted = (action: string, attemptNumber: number, metadata?: Record<string, unknown>) => {
  trackBreadcrumb('retry_attempted', { action, attemptNumber, ...metadata });
};

// Utility functions
export const getBreadcrumbs = () => breadcrumbManager.getBreadcrumbs();
export const getRecentBreadcrumbs = (count?: number) => breadcrumbManager.getRecentBreadcrumbs(count);
export const getUserJourney = () => breadcrumbManager.getUserJourney();
export const clearBreadcrumbs = () => breadcrumbManager.clear();

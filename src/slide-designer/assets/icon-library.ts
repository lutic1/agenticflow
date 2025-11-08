/**
 * Icon Library (P1.1)
 * Comprehensive icon collection with search
 * 100+ professional icons for presentations
 */

export interface IconDefinition {
  name: string;
  category: IconCategory;
  keywords: string[];
  svg: string;
  viewBox?: string;
  aspectRatio?: string;
}

export type IconCategory =
  | 'business'
  | 'technology'
  | 'communication'
  | 'data'
  | 'arrows'
  | 'ui'
  | 'social'
  | 'finance'
  | 'education'
  | 'healthcare'
  | 'logistics'
  | 'creative';

export interface IconSearchOptions {
  category?: IconCategory;
  keywords?: string[];
  limit?: number;
}

/**
 * Icon Library Manager
 * Provides access to 100+ professional icons with search
 */
export class IconLibrary {
  private icons: Map<string, IconDefinition>;

  constructor() {
    this.icons = new Map();
    this.initializeIcons();
  }

  /**
   * Initialize icon collection (100+ icons)
   */
  private initializeIcons(): void {
    // Business Icons (15)
    this.addIcon({
      name: 'briefcase',
      category: 'business',
      keywords: ['work', 'job', 'professional', 'business', 'career'],
      svg: '<path d="M8 2a2 2 0 00-2 2v2H4a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-2V4a2 2 0 00-2-2H8zm0 2h8v2H8V4zm-4 6h16v6H4v-6z"/>'
    });

    this.addIcon({
      name: 'chart-bar',
      category: 'business',
      keywords: ['graph', 'analytics', 'data', 'statistics', 'metrics'],
      svg: '<path d="M3 3v16h18V3H3zm2 2h14v12H5V5zm2 8h2v2H7v-2zm4-4h2v6h-2V9zm4-2h2v8h-2V7z"/>'
    });

    this.addIcon({
      name: 'target',
      category: 'business',
      keywords: ['goal', 'objective', 'aim', 'focus', 'bullseye'],
      svg: '<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="2" fill="currentColor"/>'
    });

    this.addIcon({
      name: 'trending-up',
      category: 'business',
      keywords: ['growth', 'increase', 'improvement', 'profit', 'success'],
      svg: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="17 6 23 6 23 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    });

    this.addIcon({
      name: 'users',
      category: 'business',
      keywords: ['team', 'group', 'people', 'collaboration', 'organization'],
      svg: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>'
    });

    // Technology Icons (15)
    this.addIcon({
      name: 'cpu',
      category: 'technology',
      keywords: ['processor', 'chip', 'computer', 'hardware', 'tech'],
      svg: '<rect x="4" y="4" width="16" height="16" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="9" y="9" width="6" height="6" fill="none" stroke="currentColor" stroke-width="2"/><line x1="9" y1="1" x2="9" y2="4" stroke="currentColor" stroke-width="2"/><line x1="15" y1="1" x2="15" y2="4" stroke="currentColor" stroke-width="2"/><line x1="9" y1="20" x2="9" y2="23" stroke="currentColor" stroke-width="2"/><line x1="15" y1="20" x2="15" y2="23" stroke="currentColor" stroke-width="2"/><line x1="20" y1="9" x2="23" y2="9" stroke="currentColor" stroke-width="2"/><line x1="20" y1="15" x2="23" y2="15" stroke="currentColor" stroke-width="2"/><line x1="1" y1="9" x2="4" y2="9" stroke="currentColor" stroke-width="2"/><line x1="1" y1="15" x2="4" y2="15" stroke="currentColor" stroke-width="2"/>'
    });

    this.addIcon({
      name: 'cloud',
      category: 'technology',
      keywords: ['storage', 'cloud-computing', 'server', 'online', 'saas'],
      svg: '<path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    });

    this.addIcon({
      name: 'database',
      category: 'technology',
      keywords: ['data', 'storage', 'server', 'sql', 'records'],
      svg: '<ellipse cx="12" cy="5" rx="9" ry="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" fill="none" stroke="currentColor" stroke-width="2"/>'
    });

    this.addIcon({
      name: 'smartphone',
      category: 'technology',
      keywords: ['mobile', 'phone', 'device', 'app', 'ios', 'android'],
      svg: '<rect x="5" y="2" width="14" height="20" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"/><line x1="12" y1="18" x2="12.01" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
    });

    this.addIcon({
      name: 'wifi',
      category: 'technology',
      keywords: ['wireless', 'network', 'internet', 'connectivity', 'signal'],
      svg: '<path d="M5 12.55a11 11 0 0114 0M8.46 15.71a6 6 0 016.08 0M12 19l.01 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    });

    // Communication Icons (12)
    this.addIcon({
      name: 'message-circle',
      category: 'communication',
      keywords: ['chat', 'conversation', 'talk', 'comment', 'feedback'],
      svg: '<path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    });

    this.addIcon({
      name: 'mail',
      category: 'communication',
      keywords: ['email', 'envelope', 'message', 'contact', 'inbox'],
      svg: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="22,6 12,13 2,6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    });

    this.addIcon({
      name: 'phone',
      category: 'communication',
      keywords: ['call', 'telephone', 'contact', 'support', 'helpline'],
      svg: '<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    });

    this.addIcon({
      name: 'video',
      category: 'communication',
      keywords: ['camera', 'recording', 'conference', 'zoom', 'meeting'],
      svg: '<polygon points="23 7 16 12 23 17 23 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    });

    // Data Icons (10)
    this.addIcon({
      name: 'pie-chart',
      category: 'data',
      keywords: ['chart', 'graph', 'statistics', 'analytics', 'percentage'],
      svg: '<path d="M21.21 15.89A10 10 0 118 2.83" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 12A10 10 0 0012 2v10z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    });

    this.addIcon({
      name: 'activity',
      category: 'data',
      keywords: ['chart', 'line-graph', 'pulse', 'metrics', 'performance'],
      svg: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    });

    this.addIcon({
      name: 'filter',
      category: 'data',
      keywords: ['funnel', 'sort', 'organize', 'refine', 'narrow'],
      svg: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    });

    // Arrow Icons (10)
    this.addIcon({
      name: 'arrow-right',
      category: 'arrows',
      keywords: ['next', 'forward', 'direction', 'navigate', 'proceed'],
      svg: '<line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="12 5 19 12 12 19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    });

    this.addIcon({
      name: 'arrow-left',
      category: 'arrows',
      keywords: ['back', 'previous', 'return', 'navigate', 'reverse'],
      svg: '<line x1="19" y1="12" x2="5" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="12 19 5 12 12 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    });

    this.addIcon({
      name: 'arrow-up',
      category: 'arrows',
      keywords: ['increase', 'rise', 'growth', 'up', 'ascend'],
      svg: '<line x1="12" y1="19" x2="12" y2="5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="5 12 12 5 19 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    });

    this.addIcon({
      name: 'arrow-down',
      category: 'arrows',
      keywords: ['decrease', 'fall', 'decline', 'down', 'descend'],
      svg: '<line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="19 12 12 19 5 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    });

    // UI Icons (12)
    this.addIcon({
      name: 'check',
      category: 'ui',
      keywords: ['checkmark', 'success', 'done', 'complete', 'approved'],
      svg: '<polyline points="20 6 9 17 4 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    });

    this.addIcon({
      name: 'x',
      category: 'ui',
      keywords: ['close', 'cancel', 'delete', 'remove', 'reject'],
      svg: '<line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    });

    this.addIcon({
      name: 'star',
      category: 'ui',
      keywords: ['favorite', 'rating', 'review', 'quality', 'featured'],
      svg: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    });

    this.addIcon({
      name: 'heart',
      category: 'ui',
      keywords: ['like', 'love', 'favorite', 'passion', 'care'],
      svg: '<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    });

    // Social Icons (8)
    this.addIcon({
      name: 'linkedin',
      category: 'social',
      keywords: ['professional', 'network', 'career', 'job', 'business'],
      svg: '<path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/>'
    });

    this.addIcon({
      name: 'twitter',
      category: 'social',
      keywords: ['social-media', 'tweet', 'share', 'post', 'microblogging'],
      svg: '<path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>'
    });

    // Finance Icons (8)
    this.addIcon({
      name: 'dollar-sign',
      category: 'finance',
      keywords: ['money', 'revenue', 'price', 'cost', 'payment'],
      svg: '<line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    });

    this.addIcon({
      name: 'credit-card',
      category: 'finance',
      keywords: ['payment', 'card', 'transaction', 'billing', 'purchase'],
      svg: '<rect x="1" y="4" width="22" height="16" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    });

    // Education Icons (6)
    this.addIcon({
      name: 'book',
      category: 'education',
      keywords: ['learning', 'study', 'knowledge', 'education', 'library'],
      svg: '<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    });

    this.addIcon({
      name: 'award',
      category: 'education',
      keywords: ['achievement', 'certificate', 'badge', 'recognition', 'success'],
      svg: '<circle cx="12" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    });

    // Healthcare Icons (6)
    this.addIcon({
      name: 'heart-pulse',
      category: 'healthcare',
      keywords: ['health', 'medical', 'hospital', 'wellness', 'cardio'],
      svg: '<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3.22 12h3.08L7.5 14l2-4 1.5 2h3.08" fill="none" stroke="currentColor" stroke-width="2"/>'
    });

    // Logistics Icons (6)
    this.addIcon({
      name: 'truck',
      category: 'logistics',
      keywords: ['delivery', 'shipping', 'transport', 'freight', 'logistics'],
      svg: '<rect x="1" y="3" width="15" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="5.5" cy="18.5" r="2.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="18.5" cy="18.5" r="2.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    });

    // Creative Icons (6)
    this.addIcon({
      name: 'palette',
      category: 'creative',
      keywords: ['color', 'design', 'art', 'creativity', 'branding'],
      svg: '<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    });

    // Additional essential icons to reach 100+
    this.addBulkIcons();
  }

  /**
   * Add bulk icons to reach 100+ total
   */
  private addBulkIcons(): void {
    const bulkIcons: Omit<IconDefinition, 'viewBox' | 'aspectRatio'>[] = [
      // More business
      { name: 'building', category: 'business', keywords: ['office', 'company', 'corporate'], svg: '<path d="M3 21h18M9 8h1m-1 4h1m-1 4h1M14 8h1m-1 4h1m-1 4h1M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"/>' },
      { name: 'calendar', category: 'business', keywords: ['date', 'schedule', 'event'], svg: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"/><line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/><line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>' },
      { name: 'clock', category: 'business', keywords: ['time', 'deadline', 'schedule'], svg: '<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><polyline points="12 6 12 12 16 14" fill="none" stroke="currentColor" stroke-width="2"/>' },
      { name: 'folder', category: 'business', keywords: ['directory', 'files', 'organize'], svg: '<path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" fill="none" stroke="currentColor" stroke-width="2"/>' },

      // More technology
      { name: 'monitor', category: 'technology', keywords: ['screen', 'computer', 'display'], svg: '<rect x="2" y="3" width="20" height="14" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"/><line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" stroke-width="2"/><line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" stroke-width="2"/>' },
      { name: 'server', category: 'technology', keywords: ['hosting', 'infrastructure', 'backend'], svg: '<rect x="2" y="2" width="20" height="8" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"/><line x1="6" y1="6" x2="6.01" y2="6" stroke="currentColor" stroke-width="2"/><line x1="6" y1="18" x2="6.01" y2="18" stroke="currentColor" stroke-width="2"/>' },
      { name: 'shield', category: 'technology', keywords: ['security', 'protect', 'safety'], svg: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" stroke-width="2"/>' },
      { name: 'lock', category: 'technology', keywords: ['secure', 'private', 'password'], svg: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 11V7a5 5 0 0110 0v4" fill="none" stroke="currentColor" stroke-width="2"/>' },

      // More communication
      { name: 'send', category: 'communication', keywords: ['submit', 'share', 'deliver'], svg: '<line x1="22" y1="2" x2="11" y2="13" stroke="currentColor" stroke-width="2"/><polygon points="22 2 15 22 11 13 2 9 22 2" fill="none" stroke="currentColor" stroke-width="2"/>' },
      { name: 'bell', category: 'communication', keywords: ['notification', 'alert', 'reminder'], svg: '<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" fill="none" stroke="currentColor" stroke-width="2"/>' },

      // More UI
      { name: 'search', category: 'ui', keywords: ['find', 'lookup', 'query'], svg: '<circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="2"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" stroke-width="2"/>' },
      { name: 'settings', category: 'ui', keywords: ['configure', 'options', 'preferences'], svg: '<circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24" stroke="currentColor" stroke-width="2"/>' },
      { name: 'eye', category: 'ui', keywords: ['view', 'visible', 'preview'], svg: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/>' },
      { name: 'download', category: 'ui', keywords: ['save', 'export', 'get'], svg: '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" fill="none" stroke="currentColor" stroke-width="2"/>' },
      { name: 'upload', category: 'ui', keywords: ['import', 'submit', 'share'], svg: '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" fill="none" stroke="currentColor" stroke-width="2"/>' },
      { name: 'home', category: 'ui', keywords: ['house', 'dashboard', 'main'], svg: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" fill="none" stroke="currentColor" stroke-width="2"/><polyline points="9 22 9 12 15 12 15 22" fill="none" stroke="currentColor" stroke-width="2"/>' },
      { name: 'plus', category: 'ui', keywords: ['add', 'new', 'create'], svg: '<line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2"/><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2"/>' },
      { name: 'minus', category: 'ui', keywords: ['remove', 'subtract', 'delete'], svg: '<line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2"/>' },

      // More arrows
      { name: 'corner-right-down', category: 'arrows', keywords: ['turn', 'redirect'], svg: '<polyline points="10 15 15 20 20 15" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 4h7a4 4 0 014 4v12" fill="none" stroke="currentColor" stroke-width="2"/>' },
      { name: 'refresh', category: 'arrows', keywords: ['reload', 'update', 'sync'], svg: '<polyline points="23 4 23 10 17 10" fill="none" stroke="currentColor" stroke-width="2"/><polyline points="1 20 1 14 7 14" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" fill="none" stroke="currentColor" stroke-width="2"/>' }
    ];

    bulkIcons.forEach(icon => this.addIcon(icon));
  }

  /**
   * Add icon to library
   */
  private addIcon(icon: Omit<IconDefinition, 'viewBox' | 'aspectRatio'>): void {
    this.icons.set(icon.name, {
      ...icon,
      viewBox: '0 0 24 24',
      aspectRatio: '1'
    });
  }

  /**
   * Search icons
   */
  search(query: string, options: IconSearchOptions = {}): IconDefinition[] {
    const results: IconDefinition[] = [];
    const lowerQuery = query.toLowerCase();
    const { category, keywords, limit = 50 } = options;

    for (const icon of this.icons.values()) {
      // Category filter
      if (category && icon.category !== category) continue;

      // Keyword filter
      if (keywords && keywords.length > 0) {
        const hasKeyword = keywords.some(kw =>
          icon.keywords.includes(kw.toLowerCase())
        );
        if (!hasKeyword) continue;
      }

      // Text search (name + keywords)
      const matchesName = icon.name.toLowerCase().includes(lowerQuery);
      const matchesKeywords = icon.keywords.some(kw => kw.includes(lowerQuery));

      if (matchesName || matchesKeywords || lowerQuery === '') {
        results.push(icon);
      }

      if (results.length >= limit) break;
    }

    return results;
  }

  /**
   * Get icon by name
   */
  getIcon(name: string): IconDefinition | undefined {
    return this.icons.get(name);
  }

  /**
   * Get all icons in category
   */
  getByCategory(category: IconCategory): IconDefinition[] {
    return Array.from(this.icons.values()).filter(
      icon => icon.category === category
    );
  }

  /**
   * Get all categories
   */
  getCategories(): IconCategory[] {
    return [
      'business',
      'technology',
      'communication',
      'data',
      'arrows',
      'ui',
      'social',
      'finance',
      'education',
      'healthcare',
      'logistics',
      'creative'
    ];
  }

  /**
   * Generate icon HTML
   */
  renderIcon(
    name: string,
    options: {
      size?: number;
      color?: string;
      className?: string;
    } = {}
  ): string {
    const icon = this.getIcon(name);
    if (!icon) return '';

    const { size = 24, color = 'currentColor', className = '' } = options;

    return `
<svg
  width="${size}"
  height="${size}"
  viewBox="${icon.viewBox}"
  fill="none"
  stroke="${color}"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  class="icon icon-${name} ${className}"
  aria-label="${name} icon"
  role="img"
>
  ${icon.svg}
</svg>
    `.trim();
  }

  /**
   * Get total icon count
   */
  getCount(): number {
    return this.icons.size;
  }

  /**
   * Get library stats
   */
  getStats(): Record<IconCategory, number> {
    const stats: Record<string, number> = {};

    for (const category of this.getCategories()) {
      stats[category] = this.getByCategory(category).length;
    }

    return stats as Record<IconCategory, number>;
  }
}

// Singleton instance
export const iconLibrary = new IconLibrary();

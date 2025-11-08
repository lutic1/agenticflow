/**
 * Collaboration Features (P1.9)
 * Multi-user editing with comments and presence
 * Real-time collaboration, comments, mentions
 */

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string; // For cursor/presence
  role: 'owner' | 'editor' | 'viewer';
  status: 'active' | 'idle' | 'offline';
  lastSeen: Date;
  currentSlide?: number;
}

export interface Comment {
  id: string;
  slideId: string;
  slideNumber: number;
  author: Collaborator;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  resolved: boolean;
  replies: CommentReply[];
  position?: { x: number; y: number }; // Position on slide
  mentions?: string[]; // User IDs mentioned
}

export interface CommentReply {
  id: string;
  author: Collaborator;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  mentions?: string[];
}

export interface PresenceUpdate {
  collaboratorId: string;
  slideNumber?: number;
  cursor?: { x: number; y: number };
  selection?: { slideId: string; elementId: string };
  timestamp: Date;
}

export interface CollaborationSession {
  id: string;
  presentationId: string;
  collaborators: Map<string, Collaborator>;
  comments: Map<string, Comment>;
  presenceUpdates: Map<string, PresenceUpdate>;
  createdAt: Date;
}

/**
 * Collaboration Manager
 * Multi-user editing and commenting
 */
export class CollaborationManager {
  private session: CollaborationSession | null = null;
  private currentUser: Collaborator | null = null;
  private onPresenceUpdate?: (update: PresenceUpdate) => void;
  private onCommentAdded?: (comment: Comment) => void;
  private onCollaboratorJoined?: (collaborator: Collaborator) => void;
  private onCollaboratorLeft?: (collaboratorId: string) => void;

  constructor() {}

  /**
   * Start collaboration session
   */
  startSession(
    presentationId: string,
    currentUser: Omit<Collaborator, 'status' | 'lastSeen'>
  ): CollaborationSession {
    const user: Collaborator = {
      ...currentUser,
      status: 'active',
      lastSeen: new Date()
    };

    this.session = {
      id: this.generateId(),
      presentationId,
      collaborators: new Map([[user.id, user]]),
      comments: new Map(),
      presenceUpdates: new Map(),
      createdAt: new Date()
    };

    this.currentUser = user;

    return this.session;
  }

  /**
   * Join existing session
   */
  joinSession(
    sessionId: string,
    user: Omit<Collaborator, 'status' | 'lastSeen'>
  ): boolean {
    if (!this.session || this.session.id !== sessionId) return false;

    const collaborator: Collaborator = {
      ...user,
      status: 'active',
      lastSeen: new Date()
    };

    this.session.collaborators.set(collaborator.id, collaborator);
    this.currentUser = collaborator;

    // Notify others
    this.onCollaboratorJoined?.(collaborator);

    return true;
  }

  /**
   * Leave session
   */
  leaveSession(): void {
    if (!this.session || !this.currentUser) return;

    this.session.collaborators.delete(this.currentUser.id);
    this.session.presenceUpdates.delete(this.currentUser.id);

    // Notify others
    this.onCollaboratorLeft?.(this.currentUser.id);

    this.currentUser = null;
  }

  /**
   * Update presence (cursor, current slide)
   */
  updatePresence(update: Partial<PresenceUpdate>): void {
    if (!this.session || !this.currentUser) return;

    const presenceUpdate: PresenceUpdate = {
      collaboratorId: this.currentUser.id,
      slideNumber: update.slideNumber,
      cursor: update.cursor,
      selection: update.selection,
      timestamp: new Date()
    };

    this.session.presenceUpdates.set(this.currentUser.id, presenceUpdate);
    this.currentUser.lastSeen = new Date();

    // Notify others
    this.onPresenceUpdate?.(presenceUpdate);
  }

  /**
   * Add comment
   */
  addComment(
    slideId: string,
    slideNumber: number,
    content: string,
    position?: { x: number; y: number }
  ): Comment | null {
    if (!this.session || !this.currentUser) return null;

    // Extract mentions (@username)
    const mentions = this.extractMentions(content);

    const comment: Comment = {
      id: this.generateId(),
      slideId,
      slideNumber,
      author: this.currentUser,
      content,
      createdAt: new Date(),
      resolved: false,
      replies: [],
      position,
      mentions
    };

    this.session.comments.set(comment.id, comment);

    // Notify others
    this.onCommentAdded?.(comment);

    return comment;
  }

  /**
   * Reply to comment
   */
  replyToComment(commentId: string, content: string): CommentReply | null {
    if (!this.session || !this.currentUser) return null;

    const comment = this.session.comments.get(commentId);
    if (!comment) return null;

    const mentions = this.extractMentions(content);

    const reply: CommentReply = {
      id: this.generateId(),
      author: this.currentUser,
      content,
      createdAt: new Date(),
      mentions
    };

    comment.replies.push(reply);
    comment.updatedAt = new Date();

    return reply;
  }

  /**
   * Extract @mentions from text
   */
  private extractMentions(text: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      const username = match[1];
      // Find collaborator by name
      const collaborator = Array.from(this.session?.collaborators.values() || []).find(
        c => c.name.toLowerCase() === username.toLowerCase()
      );
      if (collaborator) {
        mentions.push(collaborator.id);
      }
    }

    return mentions;
  }

  /**
   * Resolve comment
   */
  resolveComment(commentId: string): boolean {
    if (!this.session) return false;

    const comment = this.session.comments.get(commentId);
    if (!comment) return false;

    comment.resolved = true;
    comment.updatedAt = new Date();

    return true;
  }

  /**
   * Unresolve comment
   */
  unresolveComment(commentId: string): boolean {
    if (!this.session) return false;

    const comment = this.session.comments.get(commentId);
    if (!comment) return false;

    comment.resolved = false;
    comment.updatedAt = new Date();

    return true;
  }

  /**
   * Delete comment
   */
  deleteComment(commentId: string): boolean {
    if (!this.session) return false;

    const comment = this.session.comments.get(commentId);
    if (!comment || comment.author.id !== this.currentUser?.id) return false;

    return this.session.comments.delete(commentId);
  }

  /**
   * Edit comment
   */
  editComment(commentId: string, newContent: string): boolean {
    if (!this.session) return false;

    const comment = this.session.comments.get(commentId);
    if (!comment || comment.author.id !== this.currentUser?.id) return false;

    comment.content = newContent;
    comment.updatedAt = new Date();
    comment.mentions = this.extractMentions(newContent);

    return true;
  }

  /**
   * Get comments for slide
   */
  getCommentsForSlide(slideNumber: number): Comment[] {
    if (!this.session) return [];

    return Array.from(this.session.comments.values())
      .filter(c => c.slideNumber === slideNumber)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  /**
   * Get unresolved comments
   */
  getUnresolvedComments(): Comment[] {
    if (!this.session) return [];

    return Array.from(this.session.comments.values())
      .filter(c => !c.resolved)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  /**
   * Get mentions for user
   */
  getMentionsForUser(userId: string): Comment[] {
    if (!this.session) return [];

    return Array.from(this.session.comments.values())
      .filter(c => c.mentions?.includes(userId) ||
        c.replies.some(r => r.mentions?.includes(userId)))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get active collaborators
   */
  getActiveCollaborators(): Collaborator[] {
    if (!this.session) return [];

    return Array.from(this.session.collaborators.values())
      .filter(c => c.status === 'active')
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get all collaborators
   */
  getAllCollaborators(): Collaborator[] {
    if (!this.session) return [];

    return Array.from(this.session.collaborators.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get presence for collaborator
   */
  getPresence(collaboratorId: string): PresenceUpdate | undefined {
    if (!this.session) return undefined;
    return this.session.presenceUpdates.get(collaboratorId);
  }

  /**
   * Update collaborator status
   */
  updateCollaboratorStatus(collaboratorId: string, status: Collaborator['status']): void {
    if (!this.session) return;

    const collaborator = this.session.collaborators.get(collaboratorId);
    if (collaborator) {
      collaborator.status = status;
      collaborator.lastSeen = new Date();
    }
  }

  /**
   * Set event handlers
   */
  on(
    event: 'presenceUpdate',
    handler: (update: PresenceUpdate) => void
  ): void;
  on(
    event: 'commentAdded',
    handler: (comment: Comment) => void
  ): void;
  on(
    event: 'collaboratorJoined',
    handler: (collaborator: Collaborator) => void
  ): void;
  on(
    event: 'collaboratorLeft',
    handler: (collaboratorId: string) => void
  ): void;
  on(event: string, handler: any): void {
    if (event === 'presenceUpdate') {
      this.onPresenceUpdate = handler;
    } else if (event === 'commentAdded') {
      this.onCommentAdded = handler;
    } else if (event === 'collaboratorJoined') {
      this.onCollaboratorJoined = handler;
    } else if (event === 'collaboratorLeft') {
      this.onCollaboratorLeft = handler;
    }
  }

  /**
   * Generate cursor HTML for collaborator
   */
  generateCursorHTML(collaborator: Collaborator, position: { x: number; y: number }): string {
    return `
<div class="collaborator-cursor" style="
  position: absolute;
  left: ${position.x}px;
  top: ${position.y}px;
  pointer-events: none;
  z-index: 9999;
">
  <svg width="20" height="20" viewBox="0 0 20 20" fill="${collaborator.color}">
    <path d="M0 0 L0 16 L5 11 L8 18 L10 17 L7 10 L12 10 Z" />
  </svg>
  <div style="
    background: ${collaborator.color};
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
    margin-left: 20px;
    margin-top: -10px;
    white-space: nowrap;
  ">${collaborator.name}</div>
</div>
    `.trim();
  }

  /**
   * Export comments
   */
  exportComments(): string {
    if (!this.session) return '[]';

    return JSON.stringify(
      Array.from(this.session.comments.values()),
      null,
      2
    );
  }

  /**
   * Get collaboration statistics
   */
  getStats(): {
    totalCollaborators: number;
    activeCollaborators: number;
    totalComments: number;
    unresolvedComments: number;
    averageCommentsPerSlide: number;
  } {
    if (!this.session) {
      return {
        totalCollaborators: 0,
        activeCollaborators: 0,
        totalComments: 0,
        unresolvedComments: 0,
        averageCommentsPerSlide: 0
      };
    }

    const totalComments = this.session.comments.size;
    const unresolvedComments = this.getUnresolvedComments().length;

    // Get unique slides with comments
    const slidesWithComments = new Set(
      Array.from(this.session.comments.values()).map(c => c.slideNumber)
    );

    return {
      totalCollaborators: this.session.collaborators.size,
      activeCollaborators: this.getActiveCollaborators().length,
      totalComments,
      unresolvedComments,
      averageCommentsPerSlide: slidesWithComments.size > 0
        ? totalComments / slidesWithComments.size
        : 0
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `collab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current user
   */
  getCurrentUser(): Collaborator | null {
    return this.currentUser;
  }

  /**
   * Get session
   */
  getSession(): CollaborationSession | null {
    return this.session;
  }
}

// Singleton instance
export const collaborationManager = new CollaborationManager();

/**
 * Live Presentation Mode (P1.15)
 * Remote live presenting with real-time sync
 * Audience view, presenter control, Q&A
 */

export interface LiveSession {
  id: string;
  presentationId: string;
  presenter: Presenter;
  status: 'waiting' | 'active' | 'paused' | 'ended';
  currentSlide: number;
  totalSlides: number;
  startTime?: Date;
  endTime?: Date;
  attendees: Map<string, Attendee>;
  questions: Question[];
  polls: Poll[];
  shareUrl: string;
}

export interface Presenter {
  id: string;
  name: string;
  avatar?: string;
}

export interface Attendee {
  id: string;
  name?: string;
  joinedAt: Date;
  currentSlide: number;
  isViewing: boolean;
  reactions?: Reaction[];
}

export interface Question {
  id: string;
  attendeeId: string;
  content: string;
  timestamp: Date;
  answered: boolean;
  upvotes: number;
  upvotedBy: string[];
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdAt: Date;
  active: boolean;
  slideNumber: number;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters: string[];
}

export interface Reaction {
  type: '👍' | '❤️' | '😄' | '👏' | '🎉' | '🤔';
  timestamp: Date;
}

export interface LiveControlMessage {
  type: 'slideChange' | 'pause' | 'resume' | 'end';
  data?: any;
  timestamp: Date;
}

/**
 * Live Presentation Manager
 * Remote live presenting with audience sync
 */
export class LivePresentationManager {
  private session: LiveSession | null = null;
  private onSlideChange?: (slideNumber: number) => void;
  private onAttendeeJoin?: (attendee: Attendee) => void;
  private onQuestionReceived?: (question: Question) => void;
  private onReactionReceived?: (attendeeId: string, reaction: Reaction) => void;

  constructor() {}

  /**
   * Start live session
   */
  startLiveSession(
    presentationId: string,
    totalSlides: number,
    presenter: Presenter
  ): LiveSession {
    const sessionId = this.generateSessionId();
    const shareUrl = this.generateShareUrl(sessionId);

    this.session = {
      id: sessionId,
      presentationId,
      presenter,
      status: 'waiting',
      currentSlide: 1,
      totalSlides,
      attendees: new Map(),
      questions: [],
      polls: [],
      shareUrl
    };

    return this.session;
  }

  /**
   * Begin presentation
   */
  beginPresentation(): void {
    if (!this.session || this.session.status !== 'waiting') return;

    this.session.status = 'active';
    this.session.startTime = new Date();
  }

  /**
   * End presentation
   */
  endPresentation(): void {
    if (!this.session) return;

    this.session.status = 'ended';
    this.session.endTime = new Date();

    // Broadcast end message to attendees
    this.broadcastControl({ type: 'end', timestamp: new Date() });
  }

  /**
   * Pause presentation
   */
  pausePresentation(): void {
    if (!this.session || this.session.status !== 'active') return;

    this.session.status = 'paused';
    this.broadcastControl({ type: 'pause', timestamp: new Date() });
  }

  /**
   * Resume presentation
   */
  resumePresentation(): void {
    if (!this.session || this.session.status !== 'paused') return;

    this.session.status = 'active';
    this.broadcastControl({ type: 'resume', timestamp: new Date() });
  }

  /**
   * Navigate to slide
   */
  goToSlide(slideNumber: number): void {
    if (!this.session) return;

    if (slideNumber < 1 || slideNumber > this.session.totalSlides) return;

    this.session.currentSlide = slideNumber;

    // Broadcast to attendees
    this.broadcastControl({
      type: 'slideChange',
      data: { slideNumber },
      timestamp: new Date()
    });

    this.onSlideChange?.(slideNumber);
  }

  /**
   * Next slide
   */
  nextSlide(): void {
    if (!this.session) return;

    if (this.session.currentSlide < this.session.totalSlides) {
      this.goToSlide(this.session.currentSlide + 1);
    }
  }

  /**
   * Previous slide
   */
  previousSlide(): void {
    if (!this.session) return;

    if (this.session.currentSlide > 1) {
      this.goToSlide(this.session.currentSlide - 1);
    }
  }

  /**
   * Join as attendee
   */
  joinAsAttendee(sessionId: string, name?: string): string {
    if (!this.session || this.session.id !== sessionId) {
      throw new Error('Invalid session');
    }

    const attendeeId = this.generateId();

    const attendee: Attendee = {
      id: attendeeId,
      name,
      joinedAt: new Date(),
      currentSlide: this.session.currentSlide,
      isViewing: true,
      reactions: []
    };

    this.session.attendees.set(attendeeId, attendee);
    this.onAttendeeJoin?.(attendee);

    return attendeeId;
  }

  /**
   * Leave as attendee
   */
  leaveAsAttendee(attendeeId: string): void {
    if (!this.session) return;

    this.session.attendees.delete(attendeeId);
  }

  /**
   * Submit question
   */
  submitQuestion(attendeeId: string, content: string): Question | null {
    if (!this.session) return null;

    const question: Question = {
      id: this.generateId(),
      attendeeId,
      content,
      timestamp: new Date(),
      answered: false,
      upvotes: 0,
      upvotedBy: []
    };

    this.session.questions.push(question);
    this.onQuestionReceived?.(question);

    return question;
  }

  /**
   * Upvote question
   */
  upvoteQuestion(questionId: string, attendeeId: string): boolean {
    if (!this.session) return false;

    const question = this.session.questions.find(q => q.id === questionId);
    if (!question) return false;

    // Check if already upvoted
    if (question.upvotedBy.includes(attendeeId)) {
      // Remove upvote
      question.upvotes--;
      question.upvotedBy = question.upvotedBy.filter(id => id !== attendeeId);
    } else {
      // Add upvote
      question.upvotes++;
      question.upvotedBy.push(attendeeId);
    }

    return true;
  }

  /**
   * Mark question as answered
   */
  markQuestionAnswered(questionId: string): boolean {
    if (!this.session) return false;

    const question = this.session.questions.find(q => q.id === questionId);
    if (!question) return false;

    question.answered = true;
    return true;
  }

  /**
   * Create poll
   */
  createPoll(question: string, options: string[], slideNumber: number): Poll {
    if (!this.session) {
      throw new Error('No active session');
    }

    const poll: Poll = {
      id: this.generateId(),
      question,
      options: options.map(text => ({
        id: this.generateId(),
        text,
        votes: 0,
        voters: []
      })),
      createdAt: new Date(),
      active: true,
      slideNumber
    };

    this.session.polls.push(poll);

    return poll;
  }

  /**
   * Vote in poll
   */
  voteInPoll(pollId: string, optionId: string, attendeeId: string): boolean {
    if (!this.session) return false;

    const poll = this.session.polls.find(p => p.id === pollId);
    if (!poll || !poll.active) return false;

    // Remove previous vote if exists
    poll.options.forEach(option => {
      if (option.voters.includes(attendeeId)) {
        option.votes--;
        option.voters = option.voters.filter(id => id !== attendeeId);
      }
    });

    // Add new vote
    const option = poll.options.find(o => o.id === optionId);
    if (!option) return false;

    option.votes++;
    option.voters.push(attendeeId);

    return true;
  }

  /**
   * Close poll
   */
  closePoll(pollId: string): boolean {
    if (!this.session) return false;

    const poll = this.session.polls.find(p => p.id === pollId);
    if (!poll) return false;

    poll.active = false;
    return true;
  }

  /**
   * Send reaction
   */
  sendReaction(attendeeId: string, type: Reaction['type']): void {
    if (!this.session) return;

    const attendee = this.session.attendees.get(attendeeId);
    if (!attendee) return;

    const reaction: Reaction = {
      type,
      timestamp: new Date()
    };

    if (!attendee.reactions) {
      attendee.reactions = [];
    }

    attendee.reactions.push(reaction);
    this.onReactionReceived?.(attendeeId, reaction);

    // Clean up old reactions (keep last 10)
    if (attendee.reactions.length > 10) {
      attendee.reactions = attendee.reactions.slice(-10);
    }
  }

  /**
   * Get live statistics
   */
  getLiveStats(): {
    totalAttendees: number;
    activeViewers: number;
    questions: number;
    unansweredQuestions: number;
    reactions: number;
  } {
    if (!this.session) {
      return {
        totalAttendees: 0,
        activeViewers: 0,
        questions: 0,
        unansweredQuestions: 0,
        reactions: 0
      };
    }

    const activeViewers = Array.from(this.session.attendees.values()).filter(
      a => a.isViewing
    ).length;

    const unansweredQuestions = this.session.questions.filter(
      q => !q.answered
    ).length;

    const totalReactions = Array.from(this.session.attendees.values()).reduce(
      (sum, a) => sum + (a.reactions?.length || 0),
      0
    );

    return {
      totalAttendees: this.session.attendees.size,
      activeViewers,
      questions: this.session.questions.length,
      unansweredQuestions,
      reactions: totalReactions
    };
  }

  /**
   * Get questions sorted by upvotes
   */
  getTopQuestions(limit: number = 10): Question[] {
    if (!this.session) return [];

    return [...this.session.questions]
      .filter(q => !q.answered)
      .sort((a, b) => b.upvotes - a.upvotes)
      .slice(0, limit);
  }

  /**
   * Get poll results
   */
  getPollResults(pollId: string): Poll | undefined {
    if (!this.session) return undefined;

    return this.session.polls.find(p => p.id === pollId);
  }

  /**
   * Broadcast control message to attendees
   */
  private broadcastControl(message: LiveControlMessage): void {
    // In production, would use WebSocket or similar
    console.log('Broadcasting control message:', message);
  }

  /**
   * Generate share URL
   */
  private generateShareUrl(sessionId: string): string {
    return `${window.location.origin}/live/${sessionId}`;
  }

  /**
   * Set event handlers
   */
  on(event: 'slideChange', handler: (slideNumber: number) => void): void;
  on(event: 'attendeeJoin', handler: (attendee: Attendee) => void): void;
  on(event: 'questionReceived', handler: (question: Question) => void): void;
  on(event: 'reactionReceived', handler: (attendeeId: string, reaction: Reaction) => void): void;
  on(event: string, handler: any): void {
    if (event === 'slideChange') {
      this.onSlideChange = handler;
    } else if (event === 'attendeeJoin') {
      this.onAttendeeJoin = handler;
    } else if (event === 'questionReceived') {
      this.onQuestionReceived = handler;
    } else if (event === 'reactionReceived') {
      this.onReactionReceived = handler;
    }
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `live-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current session
   */
  getSession(): LiveSession | null {
    return this.session;
  }

  /**
   * Get attendees
   */
  getAttendees(): Attendee[] {
    if (!this.session) return [];
    return Array.from(this.session.attendees.values());
  }

  /**
   * Export session data
   */
  exportSession(): string {
    if (!this.session) return '{}';

    return JSON.stringify({
      ...this.session,
      attendees: Array.from(this.session.attendees.entries())
    }, null, 2);
  }
}

// Singleton instance
export const livePresentationManager = new LivePresentationManager();

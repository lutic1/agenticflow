/**
 * Interactive Elements (P2.4)
 * Embedded polls, quizzes, Q&A, and feedback forms
 * Real-time interaction and results visualization
 */

export interface Poll {
  id: string;
  slideId: string;
  question: string;
  options: PollOption[];
  allowMultiple: boolean;
  showResults: 'never' | 'after_vote' | 'always';
  anonymous: boolean;
  active: boolean;
  createdAt: Date;
  closedAt?: Date;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters: string[]; // User IDs
}

export interface Quiz {
  id: string;
  slideId: string;
  title: string;
  questions: QuizQuestion[];
  timeLimit?: number; // seconds per question
  passingScore?: number; // percentage
  showCorrectAnswers: 'never' | 'after_submit' | 'after_complete';
  allowRetry: boolean;
  active: boolean;
  createdAt: Date;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: QuizOption[];
  correctAnswer: string | string[];
  points: number;
  explanation?: string;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  userName?: string;
  answers: QuizAnswer[];
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  startedAt: Date;
  completedAt?: Date;
  timeSpent: number; // seconds
}

export interface QuizAnswer {
  questionId: string;
  answer: string | string[];
  isCorrect: boolean;
  points: number;
}

export interface QnASession {
  id: string;
  slideId: string;
  title: string;
  questions: Question[];
  moderationEnabled: boolean;
  allowAnonymous: boolean;
  active: boolean;
  createdAt: Date;
}

export interface Question {
  id: string;
  content: string;
  askedBy: string;
  userName?: string;
  timestamp: Date;
  upvotes: number;
  upvotedBy: string[];
  answered: boolean;
  answer?: string;
  answeredBy?: string;
  answeredAt?: Date;
  pinned: boolean;
  flagged: boolean;
}

export interface FeedbackForm {
  id: string;
  slideId: string;
  title: string;
  fields: FeedbackField[];
  anonymous: boolean;
  active: boolean;
  createdAt: Date;
}

export interface FeedbackField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'rating' | 'scale' | 'choice';
  required: boolean;
  options?: string[]; // For choice type
  min?: number; // For scale/rating
  max?: number; // For scale/rating
}

export interface FeedbackResponse {
  id: string;
  formId: string;
  userId?: string;
  userName?: string;
  responses: Record<string, any>;
  submittedAt: Date;
}

export interface InteractionAnalytics {
  totalPolls: number;
  totalVotes: number;
  totalQuizzes: number;
  totalAttempts: number;
  averageQuizScore: number;
  totalQuestions: number;
  answeredQuestions: number;
  totalFeedbackResponses: number;
}

/**
 * Interactive Elements Manager
 * Polls, quizzes, Q&A, and feedback forms
 */
export class InteractiveElementsManager {
  private polls: Map<string, Poll>;
  private quizzes: Map<string, Quiz>;
  private quizAttempts: Map<string, QuizAttempt[]>;
  private qnaSessions: Map<string, QnASession>;
  private feedbackForms: Map<string, FeedbackForm>;
  private feedbackResponses: Map<string, FeedbackResponse[]>;

  constructor() {
    this.polls = new Map();
    this.quizzes = new Map();
    this.quizAttempts = new Map();
    this.qnaSessions = new Map();
    this.feedbackForms = new Map();
    this.feedbackResponses = new Map();
  }

  /**
   * Create poll
   */
  createPoll(
    slideId: string,
    question: string,
    options: string[],
    settings?: {
      allowMultiple?: boolean;
      showResults?: Poll['showResults'];
      anonymous?: boolean;
    }
  ): Poll {
    const poll: Poll = {
      id: this.generateId(),
      slideId,
      question,
      options: options.map(text => ({
        id: this.generateId(),
        text,
        votes: 0,
        voters: []
      })),
      allowMultiple: settings?.allowMultiple || false,
      showResults: settings?.showResults || 'after_vote',
      anonymous: settings?.anonymous || false,
      active: true,
      createdAt: new Date()
    };

    this.polls.set(poll.id, poll);
    return poll;
  }

  /**
   * Vote in poll
   */
  votePoll(pollId: string, optionIds: string[], userId: string): boolean {
    const poll = this.polls.get(pollId);
    if (!poll || !poll.active) return false;

    // Remove previous votes if not allowing multiple
    if (!poll.allowMultiple) {
      poll.options.forEach(option => {
        if (option.voters.includes(userId)) {
          option.votes--;
          option.voters = option.voters.filter(id => id !== userId);
        }
      });
    }

    // Add new votes
    optionIds.forEach(optionId => {
      const option = poll.options.find(o => o.id === optionId);
      if (option && !option.voters.includes(userId)) {
        option.votes++;
        option.voters.push(userId);
      }
    });

    return true;
  }

  /**
   * Get poll results
   */
  getPollResults(pollId: string): {
    poll: Poll;
    totalVotes: number;
    results: Array<{ option: string; votes: number; percentage: number }>;
  } | null {
    const poll = this.polls.get(pollId);
    if (!poll) return null;

    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

    const results = poll.options.map(option => ({
      option: option.text,
      votes: option.votes,
      percentage: totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0
    }));

    return { poll, totalVotes, results };
  }

  /**
   * Close poll
   */
  closePoll(pollId: string): boolean {
    const poll = this.polls.get(pollId);
    if (!poll) return false;

    poll.active = false;
    poll.closedAt = new Date();
    return true;
  }

  /**
   * Create quiz
   */
  createQuiz(
    slideId: string,
    title: string,
    questions: Omit<QuizQuestion, 'id'>[],
    settings?: {
      timeLimit?: number;
      passingScore?: number;
      showCorrectAnswers?: Quiz['showCorrectAnswers'];
      allowRetry?: boolean;
    }
  ): Quiz {
    const quiz: Quiz = {
      id: this.generateId(),
      slideId,
      title,
      questions: questions.map(q => ({
        id: this.generateId(),
        ...q,
        options: q.options?.map(opt => ({
          id: this.generateId(),
          text: opt.text,
          isCorrect: opt.isCorrect
        }))
      })),
      timeLimit: settings?.timeLimit,
      passingScore: settings?.passingScore || 70,
      showCorrectAnswers: settings?.showCorrectAnswers || 'after_complete',
      allowRetry: settings?.allowRetry !== false,
      active: true,
      createdAt: new Date()
    };

    this.quizzes.set(quiz.id, quiz);
    return quiz;
  }

  /**
   * Start quiz attempt
   */
  startQuizAttempt(quizId: string, userId: string, userName?: string): string {
    const quiz = this.quizzes.get(quizId);
    if (!quiz || !quiz.active) {
      throw new Error('Quiz not found or inactive');
    }

    const attempt: QuizAttempt = {
      id: this.generateId(),
      quizId,
      userId,
      userName,
      answers: [],
      score: 0,
      maxScore: quiz.questions.reduce((sum, q) => sum + q.points, 0),
      percentage: 0,
      passed: false,
      startedAt: new Date(),
      timeSpent: 0
    };

    if (!this.quizAttempts.has(quizId)) {
      this.quizAttempts.set(quizId, []);
    }

    this.quizAttempts.get(quizId)!.push(attempt);
    return attempt.id;
  }

  /**
   * Submit quiz answer
   */
  submitAnswer(
    attemptId: string,
    questionId: string,
    answer: string | string[]
  ): { correct: boolean; points: number } | null {
    const attempt = this.findAttempt(attemptId);
    if (!attempt) return null;

    const quiz = this.quizzes.get(attempt.quizId);
    if (!quiz) return null;

    const question = quiz.questions.find(q => q.id === questionId);
    if (!question) return null;

    // Check if correct
    let isCorrect = false;
    if (Array.isArray(question.correctAnswer)) {
      const answerArray = Array.isArray(answer) ? answer : [answer];
      isCorrect = question.correctAnswer.length === answerArray.length &&
        question.correctAnswer.every(a => answerArray.includes(a));
    } else {
      isCorrect = answer === question.correctAnswer;
    }

    const points = isCorrect ? question.points : 0;

    // Store answer
    const quizAnswer: QuizAnswer = {
      questionId,
      answer,
      isCorrect,
      points
    };

    // Remove previous answer if exists
    attempt.answers = attempt.answers.filter(a => a.questionId !== questionId);
    attempt.answers.push(quizAnswer);

    return { correct: isCorrect, points };
  }

  /**
   * Complete quiz attempt
   */
  completeQuizAttempt(attemptId: string): QuizAttempt | null {
    const attempt = this.findAttempt(attemptId);
    if (!attempt || attempt.completedAt) return null;

    const quiz = this.quizzes.get(attempt.quizId);
    if (!quiz) return null;

    // Calculate score
    attempt.score = attempt.answers.reduce((sum, a) => sum + a.points, 0);
    attempt.percentage = (attempt.score / attempt.maxScore) * 100;
    attempt.passed = attempt.percentage >= (quiz.passingScore || 70);
    attempt.completedAt = new Date();
    attempt.timeSpent = Math.floor(
      (attempt.completedAt.getTime() - attempt.startedAt.getTime()) / 1000
    );

    return attempt;
  }

  /**
   * Get quiz results
   */
  getQuizResults(quizId: string): {
    quiz: Quiz;
    totalAttempts: number;
    completedAttempts: number;
    averageScore: number;
    passRate: number;
    topScores: QuizAttempt[];
  } | null {
    const quiz = this.quizzes.get(quizId);
    if (!quiz) return null;

    const attempts = this.quizAttempts.get(quizId) || [];
    const completed = attempts.filter(a => a.completedAt);

    const averageScore = completed.length > 0
      ? completed.reduce((sum, a) => sum + a.percentage, 0) / completed.length
      : 0;

    const passRate = completed.length > 0
      ? (completed.filter(a => a.passed).length / completed.length) * 100
      : 0;

    const topScores = [...completed]
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 10);

    return {
      quiz,
      totalAttempts: attempts.length,
      completedAttempts: completed.length,
      averageScore,
      passRate,
      topScores
    };
  }

  /**
   * Find quiz attempt
   */
  private findAttempt(attemptId: string): QuizAttempt | undefined {
    for (const attempts of this.quizAttempts.values()) {
      const attempt = attempts.find(a => a.id === attemptId);
      if (attempt) return attempt;
    }
    return undefined;
  }

  /**
   * Create Q&A session
   */
  createQnASession(
    slideId: string,
    title: string,
    options?: {
      moderationEnabled?: boolean;
      allowAnonymous?: boolean;
    }
  ): QnASession {
    const session: QnASession = {
      id: this.generateId(),
      slideId,
      title,
      questions: [],
      moderationEnabled: options?.moderationEnabled || false,
      allowAnonymous: options?.allowAnonymous || false,
      active: true,
      createdAt: new Date()
    };

    this.qnaSessions.set(session.id, session);
    return session;
  }

  /**
   * Ask question in Q&A
   */
  askQuestion(
    sessionId: string,
    content: string,
    userId: string,
    userName?: string
  ): Question | null {
    const session = this.qnaSessions.get(sessionId);
    if (!session || !session.active) return null;

    const question: Question = {
      id: this.generateId(),
      content,
      askedBy: userId,
      userName,
      timestamp: new Date(),
      upvotes: 0,
      upvotedBy: [],
      answered: false,
      pinned: false,
      flagged: false
    };

    session.questions.push(question);
    return question;
  }

  /**
   * Answer question
   */
  answerQuestion(
    sessionId: string,
    questionId: string,
    answer: string,
    answeredBy: string
  ): boolean {
    const session = this.qnaSessions.get(sessionId);
    if (!session) return false;

    const question = session.questions.find(q => q.id === questionId);
    if (!question) return false;

    question.answered = true;
    question.answer = answer;
    question.answeredBy = answeredBy;
    question.answeredAt = new Date();

    return true;
  }

  /**
   * Upvote question
   */
  upvoteQuestion(sessionId: string, questionId: string, userId: string): boolean {
    const session = this.qnaSessions.get(sessionId);
    if (!session) return false;

    const question = session.questions.find(q => q.id === questionId);
    if (!question) return false;

    if (question.upvotedBy.includes(userId)) {
      // Remove upvote
      question.upvotes--;
      question.upvotedBy = question.upvotedBy.filter(id => id !== userId);
    } else {
      // Add upvote
      question.upvotes++;
      question.upvotedBy.push(userId);
    }

    return true;
  }

  /**
   * Get top questions
   */
  getTopQuestions(sessionId: string, limit: number = 10): Question[] {
    const session = this.qnaSessions.get(sessionId);
    if (!session) return [];

    return [...session.questions]
      .filter(q => !q.answered)
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return b.upvotes - a.upvotes;
      })
      .slice(0, limit);
  }

  /**
   * Create feedback form
   */
  createFeedbackForm(
    slideId: string,
    title: string,
    fields: Omit<FeedbackField, 'id'>[],
    anonymous: boolean = true
  ): FeedbackForm {
    const form: FeedbackForm = {
      id: this.generateId(),
      slideId,
      title,
      fields: fields.map(f => ({
        id: this.generateId(),
        ...f
      })),
      anonymous,
      active: true,
      createdAt: new Date()
    };

    this.feedbackForms.set(form.id, form);
    return form;
  }

  /**
   * Submit feedback
   */
  submitFeedback(
    formId: string,
    responses: Record<string, any>,
    userId?: string,
    userName?: string
  ): FeedbackResponse | null {
    const form = this.feedbackForms.get(formId);
    if (!form || !form.active) return null;

    // Validate required fields
    const requiredFields = form.fields.filter(f => f.required);
    const missingFields = requiredFields.filter(f => !responses[f.id]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.map(f => f.label).join(', ')}`);
    }

    const response: FeedbackResponse = {
      id: this.generateId(),
      formId,
      userId: form.anonymous ? undefined : userId,
      userName: form.anonymous ? undefined : userName,
      responses,
      submittedAt: new Date()
    };

    if (!this.feedbackResponses.has(formId)) {
      this.feedbackResponses.set(formId, []);
    }

    this.feedbackResponses.get(formId)!.push(response);
    return response;
  }

  /**
   * Get feedback summary
   */
  getFeedbackSummary(formId: string): {
    form: FeedbackForm;
    totalResponses: number;
    fieldSummaries: Array<{
      field: string;
      type: string;
      averageRating?: number;
      distribution?: Record<string, number>;
      responses?: string[];
    }>;
  } | null {
    const form = this.feedbackForms.get(formId);
    if (!form) return null;

    const responses = this.feedbackResponses.get(formId) || [];

    const fieldSummaries = form.fields.map(field => {
      const fieldResponses = responses.map(r => r.responses[field.id]).filter(Boolean);

      if (field.type === 'rating' || field.type === 'scale') {
        const sum = fieldResponses.reduce((acc, val) => acc + Number(val), 0);
        return {
          field: field.label,
          type: field.type,
          averageRating: fieldResponses.length > 0 ? sum / fieldResponses.length : 0
        };
      } else if (field.type === 'choice') {
        const distribution: Record<string, number> = {};
        fieldResponses.forEach(val => {
          distribution[String(val)] = (distribution[String(val)] || 0) + 1;
        });
        return {
          field: field.label,
          type: field.type,
          distribution
        };
      } else {
        return {
          field: field.label,
          type: field.type,
          responses: fieldResponses.map(String)
        };
      }
    });

    return {
      form,
      totalResponses: responses.length,
      fieldSummaries
    };
  }

  /**
   * Export poll results to CSV
   */
  exportPollCSV(pollId: string): string {
    const results = this.getPollResults(pollId);
    if (!results) return '';

    const headers = 'Option,Votes,Percentage\n';
    const rows = results.results.map(r =>
      `"${r.option}",${r.votes},${r.percentage.toFixed(2)}%`
    ).join('\n');

    return headers + rows;
  }

  /**
   * Export quiz results to CSV
   */
  exportQuizCSV(quizId: string): string {
    const attempts = this.quizAttempts.get(quizId) || [];
    const completed = attempts.filter(a => a.completedAt);

    const headers = 'User,Score,Percentage,Passed,Time Spent (s),Completed At\n';
    const rows = completed.map(a =>
      `"${a.userName || a.userId}",${a.score},${a.percentage.toFixed(2)}%,${a.passed},${a.timeSpent},"${a.completedAt?.toISOString()}"`
    ).join('\n');

    return headers + rows;
  }

  /**
   * Get interaction analytics
   */
  getAnalytics(): InteractionAnalytics {
    const totalVotes = Array.from(this.polls.values()).reduce(
      (sum, poll) => sum + poll.options.reduce((s, opt) => s + opt.votes, 0),
      0
    );

    const allAttempts = Array.from(this.quizAttempts.values()).flat();
    const completedAttempts = allAttempts.filter(a => a.completedAt);

    const averageQuizScore = completedAttempts.length > 0
      ? completedAttempts.reduce((sum, a) => sum + a.percentage, 0) / completedAttempts.length
      : 0;

    const allQuestions = Array.from(this.qnaSessions.values()).reduce(
      (sum, session) => sum + session.questions.length,
      0
    );

    const answeredQuestions = Array.from(this.qnaSessions.values()).reduce(
      (sum, session) => sum + session.questions.filter(q => q.answered).length,
      0
    );

    const totalFeedbackResponses = Array.from(this.feedbackResponses.values()).reduce(
      (sum, responses) => sum + responses.length,
      0
    );

    return {
      totalPolls: this.polls.size,
      totalVotes,
      totalQuizzes: this.quizzes.size,
      totalAttempts: allAttempts.length,
      averageQuizScore,
      totalQuestions: allQuestions,
      answeredQuestions,
      totalFeedbackResponses
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `int-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all data
   */
  clearAll(): void {
    this.polls.clear();
    this.quizzes.clear();
    this.quizAttempts.clear();
    this.qnaSessions.clear();
    this.feedbackForms.clear();
    this.feedbackResponses.clear();
  }
}

// Singleton instance
export const interactiveElementsManager = new InteractiveElementsManager();

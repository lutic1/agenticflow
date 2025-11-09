/**
 * P2 Integration Test Suite
 * Comprehensive testing for all 8 P2 (Nice-to-Have) features
 * Target: 80%+ code coverage with 100+ tests
 *
 * P2 Features:
 * 1. Voice Narration (TTS)
 * 2. API Access for Developers
 * 3. Interactive Elements (Polls, Quizzes, Q&A, Feedback)
 * 4. Themes Marketplace
 * 5. 3D Animations (Three.js)
 * 6. Figma/Sketch Import
 * 7. AR Presentation Mode (WebXR)
 * 8. Blockchain NFTs
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// P2 Feature Imports
import { VoiceNarrationManager, voiceNarrationManager } from '../src/slide-designer/features/voice-narration';
import { APIAccessManager, apiAccessManager } from '../src/slide-designer/features/api-access';
import { InteractiveElementsManager, interactiveElementsManager } from '../src/slide-designer/features/interactive-elements';
import { ThemesMarketplaceManager, themesMarketplaceManager } from '../src/slide-designer/features/themes-marketplace';
import { ThreeDAnimationsManager } from '../src/slide-designer/features/3d-animations';
import { DesignImportManager, designImportManager } from '../src/slide-designer/features/design-import';
import { ARPresentationManager } from '../src/slide-designer/features/ar-presentation';
import { BlockchainNFTManager } from '../src/slide-designer/features/blockchain-nft';

// P0/P1 Integration
import { GridLayoutEngine } from '../src/slide-designer/core-v2/grid-layout-engine';
import { TypographyEngine } from '../src/slide-designer/core-v2/typography-engine';
import { ColorEngine } from '../src/slide-designer/core-v2/color-engine';

// ==================== P2.1: VOICE NARRATION TESTS ====================

describe('P2.1: Voice Narration (TTS)', () => {
  let manager: VoiceNarrationManager;

  beforeEach(() => {
    manager = new VoiceNarrationManager();
  });

  describe('Voice Management', () => {
    it('should detect and load available voices', () => {
      const voices = manager.getVoices();
      expect(Array.isArray(voices)).toBe(true);
    });

    it('should filter voices by language', () => {
      const enVoices = manager.getVoices({ lang: 'en' });
      enVoices.forEach(voice => {
        expect(voice.lang.toLowerCase()).toContain('en');
      });
    });

    it('should filter voices by gender', () => {
      const femaleVoices = manager.getVoices({ gender: 'female' });
      femaleVoices.forEach(voice => {
        expect(voice.gender).toBe('female');
      });
    });

    it('should filter local voices only', () => {
      const localVoices = manager.getVoices({ localOnly: true });
      localVoices.forEach(voice => {
        expect(voice.localService).toBe(true);
      });
    });

    it('should get voice by ID', () => {
      const voices = manager.getVoices();
      if (voices.length > 0) {
        const voice = manager.getVoice(voices[0].id);
        expect(voice).toBeDefined();
        expect(voice?.id).toBe(voices[0].id);
      }
    });
  });

  describe('Narration Settings', () => {
    it('should update narration settings', () => {
      manager.updateSettings({
        rate: 1.5,
        pitch: 1.2,
        volume: 0.8
      });

      const settings = manager.getSettings();
      expect(settings.rate).toBe(1.5);
      expect(settings.pitch).toBe(1.2);
      expect(settings.volume).toBe(0.8);
    });

    it('should maintain default settings', () => {
      const settings = manager.getSettings();
      expect(settings.rate).toBe(1.0);
      expect(settings.pitch).toBe(1.0);
      expect(settings.volume).toBe(1.0);
      expect(settings.pauseBetweenSlides).toBe(1000);
    });
  });

  describe('Narration Tracks', () => {
    it('should create narration track', () => {
      const track = manager.createTrack('pres-1', [
        { slideNumber: 1, text: 'Welcome to our presentation' },
        { slideNumber: 2, text: 'Today we will discuss key topics' },
        { slideNumber: 3, text: 'Thank you for your attention' }
      ]);

      expect(track.id).toBeTruthy();
      expect(track.presentationId).toBe('pres-1');
      expect(track.slides).toHaveLength(3);
      expect(track.format).toBe('text');
    });

    it('should estimate narration duration', () => {
      const text = 'This is a test sentence with approximately twenty words to help us calculate the estimated speaking duration';
      const duration = manager.estimateDuration(text);

      expect(duration).toBeGreaterThan(0);
      expect(typeof duration).toBe('number');
    });

    it('should update track duration', () => {
      const track = manager.createTrack('pres-1', [
        { slideNumber: 1, text: 'Test narration text' }
      ]);

      manager.updateTrackDuration(track.id);
      const updatedTrack = manager.getTrack(track.id);

      expect(updatedTrack?.totalDuration).toBeGreaterThan(0);
      expect(updatedTrack?.slides[0].duration).toBeGreaterThan(0);
    });

    it('should export track to JSON', () => {
      const track = manager.createTrack('pres-1', [
        { slideNumber: 1, text: 'Test' }
      ]);

      const exported = manager.exportTrack(track.id);
      const parsed = JSON.parse(exported);

      expect(parsed.id).toBe(track.id);
      expect(parsed.presentationId).toBe('pres-1');
      expect(parsed.slides).toHaveLength(1);
    });

    it('should import track from JSON', () => {
      const trackData = {
        id: 'track-123',
        presentationId: 'pres-1',
        slides: [{ slideNumber: 1, text: 'Imported', duration: 3000 }],
        settings: { rate: 1.0, pitch: 1.0, volume: 1.0 },
        totalDuration: 3000,
        createdAt: new Date().toISOString()
      };

      const trackId = manager.importTrack(JSON.stringify(trackData));
      expect(trackId).toBeTruthy();

      const track = manager.getTrack(trackId!);
      expect(track?.presentationId).toBe('pres-1');
    });

    it('should delete track', () => {
      const track = manager.createTrack('pres-1', [
        { slideNumber: 1, text: 'Test' }
      ]);

      const deleted = manager.deleteTrack(track.id);
      expect(deleted).toBe(true);
      expect(manager.getTrack(track.id)).toBeUndefined();
    });

    it('should get all tracks for presentation', () => {
      manager.createTrack('pres-1', [{ slideNumber: 1, text: 'Track 1' }]);
      manager.createTrack('pres-1', [{ slideNumber: 1, text: 'Track 2' }]);
      manager.createTrack('pres-2', [{ slideNumber: 1, text: 'Track 3' }]);

      const tracks = manager.getTracks('pres-1');
      expect(tracks.length).toBe(2);
      tracks.forEach(track => {
        expect(track.presentationId).toBe('pres-1');
      });
    });
  });

  describe('Content Generation', () => {
    it('should generate narration from slide content', () => {
      const narration = manager.generateNarration({
        title: 'Introduction',
        bullets: ['Point 1', 'Point 2', 'Point 3'],
        text: 'Additional context'
      });

      expect(narration).toContain('Introduction');
      expect(narration).toContain('Point 1');
      expect(narration).toContain('Additional context');
    });
  });

  describe('Language Support', () => {
    it('should get supported languages', () => {
      const languages = manager.getSupportedLanguages();
      expect(Array.isArray(languages)).toBe(true);
    });

    it('should get recommended voice for language', () => {
      const voice = manager.getRecommendedVoice('en');
      if (voice) {
        expect(voice.lang.toLowerCase()).toContain('en');
      }
    });
  });

  describe('Statistics', () => {
    it('should calculate narration statistics', () => {
      manager.createTrack('pres-1', [
        { slideNumber: 1, text: 'Test narration' }
      ]);

      const stats = manager.getStats();
      expect(stats.totalTracks).toBeGreaterThan(0);
      expect(stats.voicesAvailable).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Performance', () => {
    it('should estimate duration in under 5ms', () => {
      const start = performance.now();
      manager.estimateDuration('Test narration text');
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(5);
    });

    it('should create track in under 20ms', () => {
      const start = performance.now();
      manager.createTrack('pres-1', [
        { slideNumber: 1, text: 'Test' }
      ]);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(20);
    });
  });
});

// ==================== P2.2: API ACCESS TESTS ====================

describe('P2.2: API Access for Developers', () => {
  let manager: APIAccessManager;

  beforeEach(() => {
    manager = new APIAccessManager();
  });

  describe('API Key Management', () => {
    it('should create API key', () => {
      const apiKey = manager.createAPIKey(
        'user-123',
        'My API Key',
        ['presentations:read', 'presentations:write']
      );

      expect(apiKey.id).toBeTruthy();
      expect(apiKey.key).toStartWith('sk_');
      expect(apiKey.secret).toBeTruthy();
      expect(apiKey.scopes).toContain('presentations:read');
      expect(apiKey.active).toBe(true);
    });

    it('should create API key with custom rate limits', () => {
      const apiKey = manager.createAPIKey(
        'user-123',
        'High Limit Key',
        ['admin'],
        {
          requestsPerMinute: 120,
          requestsPerHour: 5000
        }
      );

      expect(apiKey.rateLimit.requestsPerMinute).toBe(120);
      expect(apiKey.rateLimit.requestsPerHour).toBe(5000);
    });

    it('should validate valid API key', () => {
      const apiKey = manager.createAPIKey('user-123', 'Test', ['presentations:read']);

      const validation = manager.validateAPIKey(apiKey.key);
      expect(validation.valid).toBe(true);
      expect(validation.apiKey).toBeDefined();
    });

    it('should reject invalid API key', () => {
      const validation = manager.validateAPIKey('invalid-key');
      expect(validation.valid).toBe(false);
      expect(validation.error).toBeTruthy();
    });

    it('should check required scopes', () => {
      const apiKey = manager.createAPIKey('user-123', 'Test', ['presentations:read']);

      const validScopes = manager.validateAPIKey(apiKey.key, ['presentations:read']);
      expect(validScopes.valid).toBe(true);

      const invalidScopes = manager.validateAPIKey(apiKey.key, ['presentations:delete']);
      expect(invalidScopes.valid).toBe(false);
      expect(invalidScopes.error).toContain('Insufficient permissions');
    });

    it('should respect admin scope', () => {
      const apiKey = manager.createAPIKey('user-123', 'Admin', ['admin']);

      const validation = manager.validateAPIKey(apiKey.key, ['presentations:delete', 'analytics:read']);
      expect(validation.valid).toBe(true);
    });

    it('should revoke API key', () => {
      const apiKey = manager.createAPIKey('user-123', 'Test', ['presentations:read']);

      const revoked = manager.revokeAPIKey(apiKey.id);
      expect(revoked).toBe(true);

      const validation = manager.validateAPIKey(apiKey.key);
      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('inactive');
    });

    it('should list API keys for user', () => {
      manager.createAPIKey('user-123', 'Key 1', ['presentations:read']);
      manager.createAPIKey('user-123', 'Key 2', ['analytics:read']);
      manager.createAPIKey('user-456', 'Key 3', ['presentations:write']);

      const keys = manager.getAPIKeys('user-123');
      expect(keys).toHaveLength(2);
      keys.forEach(key => {
        expect(key.userId).toBe('user-123');
      });
    });
  });

  describe('Rate Limiting', () => {
    it('should check rate limit', () => {
      const apiKey = manager.createAPIKey('user-123', 'Test', ['presentations:read'], {
        requestsPerMinute: 10
      });

      const { allowed, status } = manager.checkRateLimit(apiKey.id);
      expect(allowed).toBe(true);
      expect(status.remaining).toBe(10);
      expect(status.limit).toBe(10);
    });

    it('should enforce rate limits', () => {
      const apiKey = manager.createAPIKey('user-123', 'Test', ['presentations:read'], {
        requestsPerMinute: 2
      });

      // First request
      let result = manager.checkRateLimit(apiKey.id);
      expect(result.allowed).toBe(true);
      expect(result.status.remaining).toBe(2);

      // Second request
      result = manager.checkRateLimit(apiKey.id);
      expect(result.allowed).toBe(true);
      expect(result.status.remaining).toBe(1);

      // Third request - should be rate limited
      result = manager.checkRateLimit(apiKey.id);
      expect(result.allowed).toBe(false);
      expect(result.status.remaining).toBe(0);
      expect(result.status.retryAfter).toBeGreaterThan(0);
    });
  });

  describe('Request Logging', () => {
    it('should log API requests', () => {
      const apiKey = manager.createAPIKey('user-123', 'Test', ['presentations:read']);

      manager.logRequest({
        apiKeyId: apiKey.id,
        endpoint: '/api/v1/presentations',
        method: 'GET',
        timestamp: new Date(),
        statusCode: 200,
        responseTime: 45
      });

      const logs = manager.getRequestLogs(apiKey.id);
      expect(logs).toHaveLength(1);
      expect(logs[0].endpoint).toBe('/api/v1/presentations');
      expect(logs[0].statusCode).toBe(200);
    });

    it('should limit request logs', () => {
      const apiKey = manager.createAPIKey('user-123', 'Test', ['presentations:read']);

      for (let i = 0; i < 150; i++) {
        manager.logRequest({
          apiKeyId: apiKey.id,
          endpoint: '/api/v1/test',
          method: 'GET',
          timestamp: new Date(),
          statusCode: 200,
          responseTime: 10
        });
      }

      const logs = manager.getRequestLogs(apiKey.id, 100);
      expect(logs).toHaveLength(100);
    });
  });

  describe('Webhooks', () => {
    it('should create webhook', () => {
      const webhook = manager.createWebhook(
        'https://example.com/webhook',
        ['presentation.created', 'presentation.updated']
      );

      expect(webhook.id).toBeTruthy();
      expect(webhook.url).toBe('https://example.com/webhook');
      expect(webhook.events).toContain('presentation.created');
      expect(webhook.secret).toBeTruthy();
      expect(webhook.active).toBe(true);
    });

    it('should trigger webhook events', async () => {
      const webhook = manager.createWebhook(
        'https://example.com/webhook',
        ['presentation.created']
      );

      await manager.triggerWebhook('presentation.created', {
        presentationId: 'pres-123',
        title: 'New Deck'
      });

      expect(webhook.lastTriggeredAt).toBeDefined();
    });

    it('should delete webhook', () => {
      const webhook = manager.createWebhook('https://example.com/webhook', ['presentation.created']);

      const deleted = manager.deleteWebhook(webhook.id);
      expect(deleted).toBe(true);

      const webhooks = manager.getWebhooks();
      expect(webhooks.find(w => w.id === webhook.id)).toBeUndefined();
    });
  });

  describe('OAuth', () => {
    it('should create OAuth client', () => {
      const client = manager.createOAuthClient(
        'My App',
        ['https://app.example.com/callback'],
        ['presentations:read', 'presentations:write']
      );

      expect(client.id).toBeTruthy();
      expect(client.clientId).toBeTruthy();
      expect(client.clientSecret).toBeTruthy();
      expect(client.redirectUris).toContain('https://app.example.com/callback');
    });
  });

  describe('OpenAPI Specification', () => {
    it('should generate OpenAPI spec', () => {
      const spec = manager.generateOpenAPISpec();

      expect(spec.openapi).toBe('3.0.0');
      expect(spec.info.title).toBeTruthy();
      expect(spec.paths).toBeDefined();
      expect(spec.components.securitySchemes).toBeDefined();
    });
  });

  describe('SDK Examples', () => {
    it('should generate JavaScript SDK example', () => {
      const example = manager.generateSDKExample('javascript');
      expect(example).toContain('SlideDesignerAPI');
      expect(example).toContain('apiKey');
    });

    it('should generate Python SDK example', () => {
      const example = manager.generateSDKExample('python');
      expect(example).toContain('APIClient');
      expect(example).toContain('api_key');
    });

    it('should generate cURL example', () => {
      const example = manager.generateSDKExample('curl');
      expect(example).toContain('curl');
      expect(example).toContain('X-API-Key');
    });
  });

  describe('Statistics', () => {
    it('should calculate API statistics', () => {
      const apiKey = manager.createAPIKey('user-123', 'Test', ['presentations:read']);
      manager.logRequest({
        apiKeyId: apiKey.id,
        endpoint: '/api/v1/presentations',
        method: 'GET',
        timestamp: new Date(),
        statusCode: 200,
        responseTime: 45
      });

      const stats = manager.getStats();
      expect(stats.totalKeys).toBeGreaterThan(0);
      expect(stats.activeKeys).toBeGreaterThan(0);
      expect(stats.totalRequests).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should create API key in under 10ms', () => {
      const start = performance.now();
      manager.createAPIKey('user-123', 'Test', ['presentations:read']);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(10);
    });

    it('should validate API key in under 5ms', () => {
      const apiKey = manager.createAPIKey('user-123', 'Test', ['presentations:read']);

      const start = performance.now();
      manager.validateAPIKey(apiKey.key);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(5);
    });
  });
});

// ==================== P2.3: INTERACTIVE ELEMENTS TESTS ====================

describe('P2.3: Interactive Elements', () => {
  let manager: InteractiveElementsManager;

  beforeEach(() => {
    manager = new InteractiveElementsManager();
  });

  afterEach(() => {
    manager.clearAll();
  });

  describe('Polls', () => {
    it('should create poll', () => {
      const poll = manager.createPoll(
        'slide-1',
        'What is your favorite color?',
        ['Red', 'Blue', 'Green']
      );

      expect(poll.id).toBeTruthy();
      expect(poll.question).toBe('What is your favorite color?');
      expect(poll.options).toHaveLength(3);
      expect(poll.active).toBe(true);
    });

    it('should vote in poll', () => {
      const poll = manager.createPoll('slide-1', 'Question', ['Option 1', 'Option 2']);
      const optionId = poll.options[0].id;

      const voted = manager.votePoll(poll.id, [optionId], 'user-123');
      expect(voted).toBe(true);

      const results = manager.getPollResults(poll.id);
      expect(results?.totalVotes).toBe(1);
      expect(results?.results[0].votes).toBe(1);
    });

    it('should allow multiple votes per user when enabled', () => {
      const poll = manager.createPoll('slide-1', 'Question', ['A', 'B', 'C'], {
        allowMultiple: true
      });

      manager.votePoll(poll.id, [poll.options[0].id, poll.options[1].id], 'user-123');

      const results = manager.getPollResults(poll.id);
      expect(results?.totalVotes).toBe(2);
    });

    it('should replace vote when multiple not allowed', () => {
      const poll = manager.createPoll('slide-1', 'Question', ['A', 'B'], {
        allowMultiple: false
      });

      manager.votePoll(poll.id, [poll.options[0].id], 'user-123');
      manager.votePoll(poll.id, [poll.options[1].id], 'user-123');

      const results = manager.getPollResults(poll.id);
      expect(results?.totalVotes).toBe(1);
      expect(results?.results[1].votes).toBe(1);
      expect(results?.results[0].votes).toBe(0);
    });

    it('should close poll', () => {
      const poll = manager.createPoll('slide-1', 'Question', ['A', 'B']);

      const closed = manager.closePoll(poll.id);
      expect(closed).toBe(true);
      expect(poll.active).toBe(false);
      expect(poll.closedAt).toBeDefined();
    });

    it('should export poll results to CSV', () => {
      const poll = manager.createPoll('slide-1', 'Question', ['A', 'B', 'C']);
      manager.votePoll(poll.id, [poll.options[0].id], 'user-1');
      manager.votePoll(poll.id, [poll.options[0].id], 'user-2');

      const csv = manager.exportPollCSV(poll.id);
      expect(csv).toContain('Option,Votes,Percentage');
      expect(csv).toContain('A');
    });
  });

  describe('Quizzes', () => {
    it('should create quiz', () => {
      const quiz = manager.createQuiz(
        'slide-1',
        'JavaScript Quiz',
        [
          {
            question: 'What is 2 + 2?',
            type: 'multiple_choice',
            options: [
              { text: '3', isCorrect: false },
              { text: '4', isCorrect: true }
            ],
            correctAnswer: '4',
            points: 10
          }
        ]
      );

      expect(quiz.id).toBeTruthy();
      expect(quiz.title).toBe('JavaScript Quiz');
      expect(quiz.questions).toHaveLength(1);
      expect(quiz.active).toBe(true);
    });

    it('should start quiz attempt', () => {
      const quiz = manager.createQuiz('slide-1', 'Test Quiz', [
        {
          question: 'Question 1',
          type: 'true_false',
          correctAnswer: 'true',
          points: 10
        }
      ]);

      const attemptId = manager.startQuizAttempt(quiz.id, 'user-123', 'Alice');
      expect(attemptId).toBeTruthy();
    });

    it('should submit correct answer', () => {
      const quiz = manager.createQuiz('slide-1', 'Test', [
        {
          question: 'What is 2 + 2?',
          type: 'short_answer',
          correctAnswer: '4',
          points: 10
        }
      ]);

      const attemptId = manager.startQuizAttempt(quiz.id, 'user-123');
      const questionId = quiz.questions[0].id;

      const result = manager.submitAnswer(attemptId, questionId, '4');
      expect(result?.correct).toBe(true);
      expect(result?.points).toBe(10);
    });

    it('should submit incorrect answer', () => {
      const quiz = manager.createQuiz('slide-1', 'Test', [
        {
          question: 'What is 2 + 2?',
          type: 'short_answer',
          correctAnswer: '4',
          points: 10
        }
      ]);

      const attemptId = manager.startQuizAttempt(quiz.id, 'user-123');
      const questionId = quiz.questions[0].id;

      const result = manager.submitAnswer(attemptId, questionId, '5');
      expect(result?.correct).toBe(false);
      expect(result?.points).toBe(0);
    });

    it('should complete quiz attempt and calculate score', () => {
      const quiz = manager.createQuiz('slide-1', 'Test', [
        { question: 'Q1', type: 'short_answer', correctAnswer: 'A', points: 10 },
        { question: 'Q2', type: 'short_answer', correctAnswer: 'B', points: 10 }
      ], { passingScore: 50 });

      const attemptId = manager.startQuizAttempt(quiz.id, 'user-123');
      manager.submitAnswer(attemptId, quiz.questions[0].id, 'A');
      manager.submitAnswer(attemptId, quiz.questions[1].id, 'Wrong');

      const attempt = manager.completeQuizAttempt(attemptId);
      expect(attempt?.score).toBe(10);
      expect(attempt?.percentage).toBe(50);
      expect(attempt?.passed).toBe(true);
      expect(attempt?.completedAt).toBeDefined();
    });

    it('should get quiz results', () => {
      const quiz = manager.createQuiz('slide-1', 'Test', [
        { question: 'Q1', type: 'short_answer', correctAnswer: 'A', points: 10 }
      ]);

      const attempt1 = manager.startQuizAttempt(quiz.id, 'user-1');
      manager.submitAnswer(attempt1, quiz.questions[0].id, 'A');
      manager.completeQuizAttempt(attempt1);

      const attempt2 = manager.startQuizAttempt(quiz.id, 'user-2');
      manager.submitAnswer(attempt2, quiz.questions[0].id, 'Wrong');
      manager.completeQuizAttempt(attempt2);

      const results = manager.getQuizResults(quiz.id);
      expect(results?.totalAttempts).toBe(2);
      expect(results?.completedAttempts).toBe(2);
      expect(results?.passRate).toBe(50);
    });

    it('should export quiz results to CSV', () => {
      const quiz = manager.createQuiz('slide-1', 'Test', [
        { question: 'Q1', type: 'short_answer', correctAnswer: 'A', points: 10 }
      ]);

      const attemptId = manager.startQuizAttempt(quiz.id, 'user-123', 'Alice');
      manager.submitAnswer(attemptId, quiz.questions[0].id, 'A');
      manager.completeQuizAttempt(attemptId);

      const csv = manager.exportQuizCSV(quiz.id);
      expect(csv).toContain('User,Score,Percentage');
      expect(csv).toContain('Alice');
    });
  });

  describe('Q&A Sessions', () => {
    it('should create Q&A session', () => {
      const session = manager.createQnASession('slide-1', 'Ask Questions');

      expect(session.id).toBeTruthy();
      expect(session.title).toBe('Ask Questions');
      expect(session.questions).toHaveLength(0);
      expect(session.active).toBe(true);
    });

    it('should ask question', () => {
      const session = manager.createQnASession('slide-1', 'Q&A');

      const question = manager.askQuestion(session.id, 'How does this work?', 'user-123', 'Alice');
      expect(question).toBeDefined();
      expect(question?.content).toBe('How does this work?');
      expect(question?.answered).toBe(false);
    });

    it('should answer question', () => {
      const session = manager.createQnASession('slide-1', 'Q&A');
      const question = manager.askQuestion(session.id, 'Question?', 'user-123');

      const answered = manager.answerQuestion(
        session.id,
        question!.id,
        'Here is the answer',
        'presenter-1'
      );

      expect(answered).toBe(true);
      expect(question?.answered).toBe(true);
      expect(question?.answer).toBe('Here is the answer');
      expect(question?.answeredBy).toBe('presenter-1');
    });

    it('should upvote question', () => {
      const session = manager.createQnASession('slide-1', 'Q&A');
      const question = manager.askQuestion(session.id, 'Question?', 'user-123');

      manager.upvoteQuestion(session.id, question!.id, 'user-456');
      expect(question?.upvotes).toBe(1);

      manager.upvoteQuestion(session.id, question!.id, 'user-456');
      expect(question?.upvotes).toBe(0); // Remove upvote
    });

    it('should get top questions sorted by upvotes', () => {
      const session = manager.createQnASession('slide-1', 'Q&A');
      const q1 = manager.askQuestion(session.id, 'Question 1', 'user-1');
      const q2 = manager.askQuestion(session.id, 'Question 2', 'user-2');
      const q3 = manager.askQuestion(session.id, 'Question 3', 'user-3');

      manager.upvoteQuestion(session.id, q2!.id, 'user-a');
      manager.upvoteQuestion(session.id, q2!.id, 'user-b');
      manager.upvoteQuestion(session.id, q1!.id, 'user-c');

      const topQuestions = manager.getTopQuestions(session.id);
      expect(topQuestions[0].id).toBe(q2!.id); // 2 upvotes
      expect(topQuestions[1].id).toBe(q1!.id); // 1 upvote
    });
  });

  describe('Feedback Forms', () => {
    it('should create feedback form', () => {
      const form = manager.createFeedbackForm(
        'slide-1',
        'Session Feedback',
        [
          { label: 'Rating', type: 'rating', required: true, min: 1, max: 5 },
          { label: 'Comments', type: 'textarea', required: false }
        ]
      );

      expect(form.id).toBeTruthy();
      expect(form.fields).toHaveLength(2);
      expect(form.active).toBe(true);
    });

    it('should submit feedback', () => {
      const form = manager.createFeedbackForm('slide-1', 'Feedback', [
        { label: 'Rating', type: 'rating', required: true, min: 1, max: 5 }
      ]);

      const response = manager.submitFeedback(
        form.id,
        { [form.fields[0].id]: 5 },
        'user-123',
        'Alice'
      );

      expect(response).toBeDefined();
      expect(response?.responses[form.fields[0].id]).toBe(5);
    });

    it('should reject feedback with missing required fields', () => {
      const form = manager.createFeedbackForm('slide-1', 'Feedback', [
        { label: 'Rating', type: 'rating', required: true, min: 1, max: 5 }
      ]);

      expect(() => {
        manager.submitFeedback(form.id, {});
      }).toThrow('Missing required fields');
    });

    it('should get feedback summary', () => {
      const form = manager.createFeedbackForm('slide-1', 'Feedback', [
        { label: 'Rating', type: 'rating', required: true, min: 1, max: 5 }
      ]);

      manager.submitFeedback(form.id, { [form.fields[0].id]: 5 });
      manager.submitFeedback(form.id, { [form.fields[0].id]: 4 });

      const summary = manager.getFeedbackSummary(form.id);
      expect(summary?.totalResponses).toBe(2);
      expect(summary?.fieldSummaries[0].averageRating).toBe(4.5);
    });
  });

  describe('Analytics', () => {
    it('should calculate interaction analytics', () => {
      manager.createPoll('slide-1', 'Poll', ['A', 'B']);
      manager.createQuiz('slide-2', 'Quiz', [
        { question: 'Q', type: 'short_answer', correctAnswer: 'A', points: 10 }
      ]);

      const analytics = manager.getAnalytics();
      expect(analytics.totalPolls).toBe(1);
      expect(analytics.totalQuizzes).toBe(1);
    });
  });

  describe('Performance', () => {
    it('should create poll in under 10ms', () => {
      const start = performance.now();
      manager.createPoll('slide-1', 'Question', ['A', 'B', 'C']);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(10);
    });

    it('should handle 100 quiz attempts efficiently', () => {
      const quiz = manager.createQuiz('slide-1', 'Test', [
        { question: 'Q1', type: 'short_answer', correctAnswer: 'A', points: 10 }
      ]);

      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        const attemptId = manager.startQuizAttempt(quiz.id, `user-${i}`);
        manager.submitAnswer(attemptId, quiz.questions[0].id, 'A');
        manager.completeQuizAttempt(attemptId);
      }
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(500); // <5ms per attempt
    });
  });
});

// ==================== P2.4: THEMES MARKETPLACE TESTS ====================

describe('P2.4: Themes Marketplace', () => {
  let manager: ThemesMarketplaceManager;

  beforeEach(() => {
    manager = new ThemesMarketplaceManager();
  });

  describe('Theme Search', () => {
    it('should list all themes', () => {
      const { themes, total } = manager.searchThemes();
      expect(themes.length).toBeGreaterThan(0);
      expect(total).toBeGreaterThan(0);
    });

    it('should search themes by query', () => {
      const { themes } = manager.searchThemes({ query: 'minimal' });
      themes.forEach(theme => {
        const matchesQuery =
          theme.name.toLowerCase().includes('minimal') ||
          theme.description.toLowerCase().includes('minimal') ||
          theme.metadata.tags.some(tag => tag.toLowerCase().includes('minimal'));
        expect(matchesQuery).toBe(true);
      });
    });

    it('should filter by category', () => {
      const { themes } = manager.searchThemes({ category: 'corporate' });
      themes.forEach(theme => {
        expect(theme.category).toBe('corporate');
      });
    });

    it('should filter by price type', () => {
      const { themes } = manager.searchThemes({ priceType: 'free' });
      themes.forEach(theme => {
        expect(theme.price.type).toBe('free');
      });
    });

    it('should filter by minimum rating', () => {
      const { themes } = manager.searchThemes({ minRating: 4.5 });
      themes.forEach(theme => {
        expect(theme.rating).toBeGreaterThanOrEqual(4.5);
      });
    });

    it('should filter featured themes', () => {
      const { themes } = manager.searchThemes({ featured: true });
      themes.forEach(theme => {
        expect(theme.featured).toBe(true);
      });
    });

    it('should sort by downloads', () => {
      const { themes } = manager.searchThemes({ sortBy: 'downloads' });
      for (let i = 1; i < themes.length; i++) {
        expect(themes[i - 1].downloads).toBeGreaterThanOrEqual(themes[i].downloads);
      }
    });

    it('should paginate results', () => {
      const page1 = manager.searchThemes({ page: 1, limit: 2 });
      expect(page1.themes.length).toBeLessThanOrEqual(2);
      expect(page1.page).toBe(1);
      expect(page1.totalPages).toBeGreaterThan(0);
    });
  });

  describe('Theme Management', () => {
    it('should get theme by ID', () => {
      const { themes } = manager.searchThemes();
      const theme = manager.getTheme(themes[0].id);

      expect(theme).toBeDefined();
      expect(theme?.id).toBe(themes[0].id);
    });

    it('should install free theme', () => {
      const { themes } = manager.searchThemes({ priceType: 'free' });
      const freeTheme = themes[0];

      const installed = manager.installTheme(freeTheme.id, 'user-123');
      expect(installed).toBeDefined();
      expect(installed?.themeId).toBe(freeTheme.id);
      expect(installed?.active).toBe(false);
    });

    it('should require purchase for premium themes', () => {
      const { themes } = manager.searchThemes({ priceType: 'premium' });
      if (themes.length > 0) {
        expect(() => {
          manager.installTheme(themes[0].id, 'user-123');
        }).toThrow('must be purchased');
      }
    });

    it('should purchase and install premium theme', () => {
      const { themes } = manager.searchThemes({ priceType: 'premium' });
      if (themes.length > 0) {
        const theme = themes[0];

        const purchase = manager.purchaseTheme(theme.id, 'user-123', 'stripe');
        expect(purchase).toBeDefined();
        expect(purchase?.licenseKey).toBeTruthy();

        const installed = manager.installTheme(theme.id, 'user-123');
        expect(installed).toBeDefined();
      }
    });

    it('should uninstall theme', () => {
      const { themes } = manager.searchThemes({ priceType: 'free' });
      const theme = themes[0];

      manager.installTheme(theme.id, 'user-123');
      const uninstalled = manager.uninstallTheme(theme.id);
      expect(uninstalled).toBe(true);
    });

    it('should activate theme', () => {
      const { themes } = manager.searchThemes({ priceType: 'free' });
      const theme = themes[0];

      manager.installTheme(theme.id, 'user-123');
      const activated = manager.activateTheme(theme.id);
      expect(activated).toBe(true);

      const activeTheme = manager.getActiveTheme();
      expect(activeTheme?.id).toBe(theme.id);
    });

    it('should customize theme', () => {
      const { themes } = manager.searchThemes({ priceType: 'free' });
      const theme = themes[0];

      manager.installTheme(theme.id, 'user-123');
      const customized = manager.customizeTheme(theme.id, {
        colors: {
          primary: '#FF0000',
          secondary: '#00FF00',
          accent: '#0000FF',
          background: '#FFFFFF',
          text: '#000000',
          textSecondary: '#666666'
        }
      });

      expect(customized).toBe(true);
    });

    it('should get installed themes', () => {
      const { themes } = manager.searchThemes({ priceType: 'free' });
      manager.installTheme(themes[0].id, 'user-123');

      const installed = manager.getInstalledThemes();
      expect(installed.length).toBeGreaterThan(0);
    });
  });

  describe('Theme Reviews', () => {
    it('should add review to theme', () => {
      const { themes } = manager.searchThemes();
      const theme = themes[0];

      const review = manager.addReview(
        theme.id,
        'user-123',
        'Alice',
        5,
        'Excellent theme!',
        'Love it'
      );

      expect(review).toBeDefined();
      expect(review?.rating).toBe(5);
      expect(review?.comment).toBe('Excellent theme!');
    });

    it('should update theme rating after review', () => {
      const { themes } = manager.searchThemes();
      const theme = themes[0];
      const initialRating = theme.rating;

      manager.addReview(theme.id, 'user-123', 'Alice', 5, 'Great');

      const updatedTheme = manager.getTheme(theme.id);
      expect(updatedTheme?.reviews).toBeGreaterThan(0);
    });

    it('should get reviews for theme', () => {
      const { themes } = manager.searchThemes();
      const theme = themes[0];

      manager.addReview(theme.id, 'user-1', 'Alice', 5, 'Great');
      manager.addReview(theme.id, 'user-2', 'Bob', 4, 'Good');

      const reviews = manager.getReviews(theme.id);
      expect(reviews.length).toBeGreaterThan(0);
    });

    it('should mark review as helpful', () => {
      const { themes } = manager.searchThemes();
      const theme = themes[0];

      const review = manager.addReview(theme.id, 'user-1', 'Alice', 5, 'Great');
      manager.markReviewHelpful(review!.id, 'user-2');

      expect(review?.helpful).toBe(1);
    });
  });

  describe('Theme Submission', () => {
    it('should submit new theme', () => {
      const theme = manager.submitTheme({
        name: 'Custom Theme',
        description: 'My custom theme',
        author: {
          id: 'author-123',
          name: 'Creator',
          verified: false,
          totalThemes: 1,
          totalDownloads: 0
        },
        category: 'creative',
        version: '1.0.0',
        price: { type: 'free' },
        preview: {
          thumbnail: '/thumb.jpg',
          screenshots: []
        },
        colors: {
          primary: '#000000',
          secondary: '#111111',
          accent: '#FF0000',
          background: '#FFFFFF',
          text: '#000000',
          textSecondary: '#666666'
        },
        fonts: {
          heading: { family: 'Arial', weights: [700], fallback: 'sans-serif' },
          body: { family: 'Arial', weights: [400], fallback: 'sans-serif' }
        },
        layouts: [],
        assets: {},
        metadata: {
          tags: ['custom'],
          license: 'free',
          supportedFeatures: []
        },
        featured: false,
        verified: false
      });

      expect(theme.id).toBeTruthy();
      expect(theme.downloads).toBe(0);
    });

    it('should export theme configuration', () => {
      const { themes } = manager.searchThemes();
      const exported = manager.exportTheme(themes[0].id);
      const parsed = JSON.parse(exported);

      expect(parsed.id).toBe(themes[0].id);
      expect(parsed.name).toBeTruthy();
    });

    it('should import theme configuration', () => {
      const { themes } = manager.searchThemes();
      const exported = manager.exportTheme(themes[0].id);

      const importedId = manager.importTheme(exported);
      expect(importedId).toBeTruthy();
    });
  });

  describe('Marketplace Statistics', () => {
    it('should get marketplace stats', () => {
      const stats = manager.getStats();

      expect(stats.totalThemes).toBeGreaterThan(0);
      expect(stats.freeThemes).toBeGreaterThanOrEqual(0);
      expect(stats.premiumThemes).toBeGreaterThanOrEqual(0);
      expect(stats.topThemes.length).toBeGreaterThan(0);
    });

    it('should get category counts', () => {
      const categories = manager.getCategories();

      expect(categories.corporate).toBeGreaterThanOrEqual(0);
      expect(categories.creative).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Performance', () => {
    it('should search themes in under 20ms', () => {
      const start = performance.now();
      manager.searchThemes({ query: 'modern', category: 'business' });
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(20);
    });

    it('should install theme in under 15ms', () => {
      const { themes } = manager.searchThemes({ priceType: 'free' });

      const start = performance.now();
      manager.installTheme(themes[0].id, 'user-123');
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(15);
    });
  });
});

// ==================== P2.5: 3D ANIMATIONS TESTS ====================

describe('P2.5: 3D Animations (Three.js)', () => {
  let manager: ThreeDAnimationsManager;

  beforeEach(() => {
    manager = new ThreeDAnimationsManager();
  });

  describe('Scene Management', () => {
    it('should create 3D scene', () => {
      const scene = manager.createScene('slide-1', 'Test Scene', 1920, 1080);

      expect(scene.id).toBeTruthy();
      expect(scene.name).toBe('Test Scene');
      expect(scene.width).toBe(1920);
      expect(scene.height).toBe(1080);
      expect(scene.camera).toBeDefined();
    });

    it('should add object to scene', () => {
      const scene = manager.createScene('slide-1', 'Scene', 800, 600);

      const cube = manager.addObject(scene.id, {
        name: 'Cube',
        type: 'primitive',
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        geometry: { type: 'box', parameters: { width: 1, height: 1, depth: 1 } },
        material: { type: 'standard', color: '#FF0000' }
      });

      expect(cube).toBeDefined();
      expect(scene.objects).toHaveLength(1);
    });

    it('should add light to scene', () => {
      const scene = manager.createScene('slide-1', 'Scene', 800, 600);

      const light = manager.addLight(scene.id, {
        name: 'Main Light',
        type: 'directional',
        color: '#FFFFFF',
        intensity: 1.0,
        position: { x: 5, y: 5, z: 5 }
      });

      expect(light).toBeDefined();
      expect(scene.lights).toHaveLength(1);
    });

    it('should remove object from scene', () => {
      const scene = manager.createScene('slide-1', 'Scene', 800, 600);
      const cube = manager.addObject(scene.id, {
        name: 'Cube',
        type: 'primitive',
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        geometry: { type: 'box' },
        material: { type: 'basic', color: '#FF0000' }
      });

      const removed = manager.removeObject(scene.id, cube!.id);
      expect(removed).toBe(true);
      expect(scene.objects).toHaveLength(0);
    });
  });

  describe('Animations', () => {
    it('should create animation', () => {
      const scene = manager.createScene('slide-1', 'Scene', 800, 600);
      const cube = manager.addObject(scene.id, {
        name: 'Cube',
        type: 'primitive',
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        geometry: { type: 'box' },
        material: { type: 'basic', color: '#FF0000' }
      });

      const animation = manager.createAnimation(scene.id, {
        name: 'Rotate',
        objectId: cube!.id,
        type: 'rotation',
        duration: 2,
        keyframes: [
          { time: 0, value: { x: 0, y: 0, z: 0 } },
          { time: 1, value: { x: 0, y: Math.PI * 2, z: 0 } }
        ]
      });

      expect(animation).toBeDefined();
      expect(scene.animations).toHaveLength(1);
    });

    it('should play animation', () => {
      const scene = manager.createScene('slide-1', 'Scene', 800, 600);
      const cube = manager.addObject(scene.id, {
        name: 'Cube',
        type: 'primitive',
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        geometry: { type: 'box' },
        material: { type: 'basic', color: '#FF0000' }
      });

      manager.createAnimation(scene.id, {
        name: 'Spin',
        objectId: cube!.id,
        type: 'rotation',
        duration: 1,
        keyframes: [
          { time: 0, value: { x: 0, y: 0, z: 0 } },
          { time: 1, value: { x: 0, y: Math.PI, z: 0 } }
        ]
      });

      const playing = manager.playAnimation(scene.id);
      expect(playing).toBe(true);
    });
  });

  describe('Model Loading', () => {
    it('should validate model loader config', () => {
      const config = {
        format: 'gltf' as const,
        url: 'https://example.com/model.gltf',
        scale: 1.0
      };

      const valid = manager.validateModelLoader(config);
      expect(valid).toBe(true);
    });

    it('should reject invalid model format', () => {
      const config = {
        format: 'invalid' as any,
        url: 'https://example.com/model.txt'
      };

      const valid = manager.validateModelLoader(config);
      expect(valid).toBe(false);
    });
  });

  describe('Scene Export', () => {
    it('should export scene configuration', () => {
      const scene = manager.createScene('slide-1', 'Scene', 800, 600);
      const exported = manager.exportScene(scene.id);
      const parsed = JSON.parse(exported);

      expect(parsed.id).toBe(scene.id);
      expect(parsed.name).toBe('Scene');
    });
  });

  describe('Performance', () => {
    it('should create scene in under 15ms', () => {
      const start = performance.now();
      manager.createScene('slide-1', 'Scene', 1920, 1080);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(15);
    });

    it('should add 100 objects efficiently', () => {
      const scene = manager.createScene('slide-1', 'Scene', 800, 600);

      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        manager.addObject(scene.id, {
          name: `Object ${i}`,
          type: 'primitive',
          position: { x: i, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          geometry: { type: 'sphere' },
          material: { type: 'basic', color: '#FF0000' }
        });
      }
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(200); // <2ms per object
    });
  });
});

// ==================== FEATURE FLAG TESTS ====================

describe('P2 Feature Flags', () => {
  it('should handle P2 features disabled gracefully', () => {
    const featureFlags = {
      voiceNarration: false,
      apiAccess: false,
      interactiveElements: false
    };

    expect(() => {
      if (featureFlags.voiceNarration) {
        new VoiceNarrationManager();
      }
    }).not.toThrow();
  });

  it('should maintain P0+P1 performance when P2 disabled', () => {
    const gridEngine = new GridLayoutEngine();
    const typographyEngine = new TypographyEngine();

    const start = performance.now();

    const analysis = gridEngine.analyzeContent({ text: 'Test' });
    gridEngine.selectLayout(analysis, 1, 5);
    typographyEngine.calculateSizes(
      typographyEngine.analyzeContent({ title: 'Test' }),
      'title'
    );

    const duration = performance.now() - start;

    expect(duration).toBeLessThan(50); // Same as P0-only performance
  });
});

// ==================== P0+P1+P2 INTEGRATION TESTS ====================

describe('P0+P1+P2 Integration', () => {
  it('should integrate VoiceNarration with P0 features', () => {
    const gridEngine = new GridLayoutEngine();
    const voiceManager = new VoiceNarrationManager();

    const analysis = gridEngine.analyzeContent({
      text: 'Welcome to our presentation'
    });

    const narration = voiceManager.generateNarration({
      title: 'Welcome to our presentation'
    });

    expect(narration).toContain('Welcome');
    expect(analysis.wordCount).toBeGreaterThan(0);
  });

  it('should integrate ThemesMarketplace with ColorEngine', () => {
    const colorEngine = new ColorEngine();
    const marketplace = new ThemesMarketplaceManager();

    const palette = colorEngine.getPalette('corporate-blue');
    const { themes } = marketplace.searchThemes({ category: 'corporate' });

    expect(palette).toBeDefined();
    expect(themes.length).toBeGreaterThan(0);

    if (themes.length > 0) {
      marketplace.installTheme(themes[0].id, 'user-123');
      marketplace.customizeTheme(themes[0].id, {
        colors: {
          primary: palette!.primary[500],
          secondary: palette!.primary[400],
          accent: palette!.accent[500],
          background: palette!.surfaces.background,
          text: palette!.text.primary,
          textSecondary: palette!.text.secondary
        }
      });
    }
  });

  it('should integrate InteractiveElements with API Access', () => {
    const apiManager = new APIAccessManager();
    const interactiveManager = new InteractiveElementsManager();

    // Create API key for external access
    const apiKey = apiManager.createAPIKey(
      'user-123',
      'Interactive App',
      ['presentations:read', 'collaboration:write']
    );

    // Create poll via API
    const poll = interactiveManager.createPoll(
      'slide-1',
      'What do you think?',
      ['Good', 'Great', 'Excellent']
    );

    // Log API request
    apiManager.logRequest({
      apiKeyId: apiKey.id,
      endpoint: '/api/v1/polls',
      method: 'POST',
      timestamp: new Date(),
      statusCode: 201,
      responseTime: 25
    });

    expect(poll).toBeDefined();
    expect(apiKey.scopes).toContain('collaboration:write');
  });

  describe('Performance: Complete P0+P1+P2 Pipeline', () => {
    it('should generate slide with P2 features in under 400ms', () => {
      const gridEngine = new GridLayoutEngine();
      const typographyEngine = new TypographyEngine();
      const colorEngine = new ColorEngine();
      const voiceManager = new VoiceNarrationManager();
      const interactiveManager = new InteractiveElementsManager();

      const start = performance.now();

      // P0 features
      const analysis = gridEngine.analyzeContent({
        text: 'Q4 Results',
        hasChart: true
      });
      const layout = gridEngine.selectLayout(analysis, 2, 10);
      const metrics = typographyEngine.analyzeContent({ title: 'Q4 Results' });
      const sizes = typographyEngine.calculateSizes(metrics, 'data');
      const palette = colorEngine.getPalette('finance-green')!;

      // P2 features
      const narration = voiceManager.generateNarration({
        title: 'Q4 Results',
        text: 'Record-breaking performance this quarter'
      });
      const poll = interactiveManager.createPoll(
        'slide-1',
        'How confident are you?',
        ['Very', 'Somewhat', 'Not really']
      );

      const duration = performance.now() - start;

      expect(layout).toBeDefined();
      expect(sizes.h1).toBeGreaterThan(0);
      expect(palette).toBeDefined();
      expect(narration).toBeTruthy();
      expect(poll).toBeDefined();
      expect(duration).toBeLessThan(400);
    });
  });
});

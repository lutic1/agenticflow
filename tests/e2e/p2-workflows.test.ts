/**
 * P2 E2E Workflow Tests
 * End-to-end testing of P2 feature workflows
 * Tests complete user journeys combining multiple P2 features
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { VoiceNarrationManager } from '../../src/slide-designer/features/voice-narration';
import { APIAccessManager } from '../../src/slide-designer/features/api-access';
import { InteractiveElementsManager } from '../../src/slide-designer/features/interactive-elements';
import { ThemesMarketplaceManager } from '../../src/slide-designer/features/themes-marketplace';
import { ThreeDAnimationsManager } from '../../src/slide-designer/features/3d-animations';
import { DesignImportManager } from '../../src/slide-designer/features/design-import';
import { ARPresentationManager } from '../../src/slide-designer/features/ar-presentation';
import { BlockchainNFTManager } from '../../src/slide-designer/features/blockchain-nft';
import { GridLayoutEngine } from '../../src/slide-designer/core-v2/grid-layout-engine';
import { TypographyEngine } from '../../src/slide-designer/core-v2/typography-engine';
import { ColorEngine } from '../../src/slide-designer/core-v2/color-engine';

// ==================== E2E WORKFLOW TESTS ====================

describe('P2 E2E Workflows', () => {

  // ==================== Workflow 1: Voice-Narrated Interactive Presentation ====================

  describe('Workflow 1: Create Voice-Narrated Interactive Presentation', () => {
    it('should create presentation with voice narration and polls', () => {
      const voiceManager = new VoiceNarrationManager();
      const interactiveManager = new InteractiveElementsManager();
      const gridEngine = new GridLayoutEngine();

      // Step 1: Create presentation structure
      const slides = [
        { number: 1, title: 'Welcome', text: 'Welcome to our interactive presentation' },
        { number: 2, title: 'Topic Overview', text: 'Today we discuss key innovations' },
        { number: 3, title: 'Audience Poll', text: 'What interests you most?' }
      ];

      // Step 2: Generate layouts
      const layouts = slides.map(slide => {
        const analysis = gridEngine.analyzeContent({ text: slide.text });
        return gridEngine.selectLayout(analysis, slide.number - 1, slides.length);
      });

      expect(layouts).toHaveLength(3);

      // Step 3: Create voice narration track
      const narrationTrack = voiceManager.createTrack('pres-1', slides.map(slide => ({
        slideNumber: slide.number,
        text: voiceManager.generateNarration({ title: slide.title, text: slide.text })
      })));

      expect(narrationTrack.slides).toHaveLength(3);
      voiceManager.updateTrackDuration(narrationTrack.id);
      expect(narrationTrack.totalDuration).toBeGreaterThan(0);

      // Step 4: Add interactive poll
      const poll = interactiveManager.createPoll(
        'slide-3',
        'What interests you most?',
        ['Technology', 'Design', 'Business Strategy']
      );

      expect(poll.active).toBe(true);

      // Step 5: Simulate user votes
      interactiveManager.votePoll(poll.id, [poll.options[0].id], 'user-1');
      interactiveManager.votePoll(poll.id, [poll.options[0].id], 'user-2');
      interactiveManager.votePoll(poll.id, [poll.options[1].id], 'user-3');

      const results = interactiveManager.getPollResults(poll.id);
      expect(results?.totalVotes).toBe(3);
      expect(results?.results[0].percentage).toBeCloseTo(66.67, 1);

      // Complete workflow validation
      expect(narrationTrack.id).toBeTruthy();
      expect(poll.id).toBeTruthy();
      expect(layouts.every(l => l.name)).toBe(true);
    });
  });

  // ==================== Workflow 2: Theme Marketplace with API Access ====================

  describe('Workflow 2: Purchase Theme and Access via API', () => {
    it('should purchase theme, customize it, and expose via API', () => {
      const marketplace = new ThemesMarketplaceManager();
      const apiManager = new APIAccessManager();

      // Step 1: Browse marketplace
      const { themes } = marketplace.searchThemes({
        category: 'corporate',
        minRating: 4.5,
        sortBy: 'downloads'
      });

      expect(themes.length).toBeGreaterThan(0);
      const selectedTheme = themes[0];

      // Step 2: Purchase if premium
      if (selectedTheme.price.type === 'premium') {
        const purchase = marketplace.purchaseTheme(
          selectedTheme.id,
          'user-123',
          'stripe'
        );
        expect(purchase?.licenseKey).toBeTruthy();
      }

      // Step 3: Install and activate theme
      const installed = marketplace.installTheme(selectedTheme.id, 'user-123');
      expect(installed).toBeDefined();

      const activated = marketplace.activateTheme(selectedTheme.id);
      expect(activated).toBe(true);

      // Step 4: Customize theme colors
      const customized = marketplace.customizeTheme(selectedTheme.id, {
        colors: {
          primary: '#1A365D',
          secondary: '#2C5282',
          accent: '#ED8936',
          background: '#F7FAFC',
          text: '#1A202C',
          textSecondary: '#4A5568'
        }
      });

      expect(customized).toBe(true);

      // Step 5: Create API key for theme access
      const apiKey = apiManager.createAPIKey(
        'user-123',
        'Theme API',
        ['presentations:read', 'templates:read']
      );

      expect(apiKey.key).toStartWith('sk_');

      // Step 6: Validate API access
      const validation = apiManager.validateAPIKey(
        apiKey.key,
        ['presentations:read']
      );

      expect(validation.valid).toBe(true);

      // Step 7: Log API request
      apiManager.logRequest({
        apiKeyId: apiKey.id,
        endpoint: '/api/v1/themes',
        method: 'GET',
        timestamp: new Date(),
        statusCode: 200,
        responseTime: 35
      });

      const logs = apiManager.getRequestLogs(apiKey.id);
      expect(logs.length).toBeGreaterThan(0);

      // Complete workflow validation
      const activeTheme = marketplace.getActiveTheme();
      expect(activeTheme?.id).toBe(selectedTheme.id);
      expect(apiKey.active).toBe(true);
    });
  });

  // ==================== Workflow 3: 3D Animated Presentation with Quiz ====================

  describe('Workflow 3: 3D Animated Presentation with Quiz', () => {
    it('should create 3D scene with animations and embedded quiz', () => {
      const threeDManager = new ThreeDAnimationsManager();
      const interactiveManager = new InteractiveElementsManager();
      const typographyEngine = new TypographyEngine();

      // Step 1: Create 3D scene
      const scene = threeDManager.createScene(
        'slide-1',
        'Product Showcase',
        1920,
        1080
      );

      expect(scene.id).toBeTruthy();

      // Step 2: Add 3D objects
      const product = threeDManager.addObject(scene.id, {
        name: 'Product Model',
        type: '3d_model',
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        modelUrl: 'https://example.com/product.glb',
        material: {
          type: 'physical',
          color: '#FFFFFF',
          metalness: 0.8,
          roughness: 0.2
        }
      });

      expect(product).toBeDefined();

      // Step 3: Add lighting
      const mainLight = threeDManager.addLight(scene.id, {
        name: 'Main Light',
        type: 'directional',
        color: '#FFFFFF',
        intensity: 1.0,
        position: { x: 5, y: 5, z: 5 },
        castShadow: true
      });

      expect(mainLight).toBeDefined();

      // Step 4: Create rotation animation
      const animation = threeDManager.createAnimation(scene.id, {
        name: 'Product Spin',
        objectId: product!.id,
        type: 'rotation',
        duration: 4,
        loop: true,
        keyframes: [
          { time: 0, value: { x: 0, y: 0, z: 0 } },
          { time: 1, value: { x: 0, y: Math.PI * 2, z: 0 } }
        ]
      });

      expect(animation).toBeDefined();

      // Step 5: Add product knowledge quiz
      const quiz = interactiveManager.createQuiz(
        'slide-1',
        'Product Knowledge Quiz',
        [
          {
            question: 'What material is this product made of?',
            type: 'multiple_choice',
            options: [
              { text: 'Aluminum', isCorrect: true },
              { text: 'Plastic', isCorrect: false },
              { text: 'Steel', isCorrect: false }
            ],
            correctAnswer: 'Aluminum',
            points: 10,
            explanation: 'Our product uses premium aerospace-grade aluminum'
          },
          {
            question: 'What is the weight of the product?',
            type: 'multiple_choice',
            options: [
              { text: '500g', isCorrect: false },
              { text: '750g', isCorrect: true },
              { text: '1kg', isCorrect: false }
            ],
            correctAnswer: '750g',
            points: 10
          }
        ],
        { passingScore: 70 }
      );

      expect(quiz.questions).toHaveLength(2);

      // Step 6: Simulate quiz attempt
      const attemptId = interactiveManager.startQuizAttempt(quiz.id, 'user-123', 'Alice');
      interactiveManager.submitAnswer(attemptId, quiz.questions[0].id, 'Aluminum');
      interactiveManager.submitAnswer(attemptId, quiz.questions[1].id, '750g');

      const attempt = interactiveManager.completeQuizAttempt(attemptId);
      expect(attempt?.score).toBe(20);
      expect(attempt?.percentage).toBe(100);
      expect(attempt?.passed).toBe(true);

      // Complete workflow validation
      expect(scene.objects).toHaveLength(1);
      expect(scene.lights).toHaveLength(1);
      expect(scene.animations).toHaveLength(1);
      expect(quiz.active).toBe(true);
    });
  });

  // ==================== Workflow 4: AR Presentation with Blockchain NFT ====================

  describe('Workflow 4: AR Presentation Minted as NFT', () => {
    it('should create AR presentation and mint as NFT', async () => {
      const arManager = new ARPresentationManager();
      const nftManager = new BlockchainNFTManager();

      // Step 1: Check AR support
      const supported = await arManager.isARSupported();

      // Step 2: Create AR markers for slides
      const marker1 = arManager.createMarker(
        'Slide 1 Marker',
        'https://example.com/marker1.png',
        0.1, // 10cm
        1,
        'show_slide'
      );

      expect(marker1).toBeDefined();

      // Step 3: Create AR session (mock)
      const sessionConfig = {
        presentationId: 'pres-ar-1',
        settings: {
          autoPlaceSlides: true,
          slideDistance: 2.0,
          slideSize: 1.0,
          enableGestures: true,
          showParticipantAvatars: true
        }
      };

      // Step 4: Connect wallet (mock)
      const walletConnected = nftManager.connectWallet({
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        provider: 'metamask',
        network: 'polygon',
        balance: 1.5
      });

      expect(walletConnected).toBe(true);

      // Step 5: Upload to IPFS (mock)
      const ipfsUpload = nftManager.uploadToIPFS({
        presentationId: 'pres-ar-1',
        title: 'AR Product Demo',
        file: new Blob(['mock presentation data'])
      });

      expect(ipfsUpload.cid).toBeTruthy();

      // Step 6: Mint presentation as NFT
      const mintRequest = {
        presentationId: 'pres-ar-1',
        title: 'AR Product Demonstration',
        description: 'Interactive AR presentation showcasing our latest product',
        coverImage: 'https://ipfs.io/ipfs/QmExample',
        blockchain: 'polygon' as const,
        royaltyPercentage: 10,
        price: 0.5,
        listForSale: true
      };

      const nft = nftManager.mintNFT(mintRequest);

      expect(nft).toBeDefined();
      expect(nft?.tokenId).toBeTruthy();
      expect(nft?.metadata.properties.category).toBe('ar-presentation');

      // Step 7: List on marketplace
      const listing = nftManager.listNFT(
        nft!.tokenId,
        'opensea',
        0.8,
        'MATIC'
      );

      expect(listing).toBeDefined();
      expect(listing?.status).toBe('active');

      // Complete workflow validation
      expect(marker1.id).toBeTruthy();
      expect(nft?.blockchain).toBe('polygon');
      expect(listing?.price).toBe(0.8);
    });
  });

  // ==================== Workflow 5: Figma Import with Themes and API ====================

  describe('Workflow 5: Import Figma Design, Apply Theme, Expose via API', () => {
    it('should import Figma design, apply custom theme, and expose via API', () => {
      const designImport = new DesignImportManager();
      const marketplace = new ThemesMarketplaceManager();
      const apiManager = new APIAccessManager();

      // Step 1: Configure Figma access (mock)
      designImport.configureFigma({
        accessToken: 'figma-token-mock',
        teamId: 'team-123'
      });

      // Step 2: Import Figma file (mock)
      const imported = designImport.importFromFigma({
        fileId: 'figma-file-123',
        pages: ['Cover', 'Content', 'Conclusion']
      });

      expect(imported).toBeDefined();
      expect(imported?.pages.length).toBeGreaterThan(0);

      // Step 3: Convert frames to slides
      const slides = designImport.convertToSlides(imported!.id);

      expect(slides.length).toBeGreaterThan(0);

      // Step 4: Browse and select theme
      const { themes } = marketplace.searchThemes({
        category: 'creative',
        priceType: 'free'
      });

      const theme = themes[0];
      marketplace.installTheme(theme.id, 'user-123');
      marketplace.activateTheme(theme.id);

      // Step 5: Apply theme to imported slides
      const themedSlides = designImport.applyTheme(
        imported!.id,
        theme.id
      );

      expect(themedSlides.length).toBe(slides.length);

      // Step 6: Create API key for external access
      const apiKey = apiManager.createAPIKey(
        'user-123',
        'Figma Integration API',
        ['presentations:read', 'presentations:write']
      );

      // Step 7: Generate OpenAPI documentation
      const apiSpec = apiManager.generateOpenAPISpec();

      expect(apiSpec.paths['/api/v1/presentations']).toBeDefined();

      // Step 8: Create webhook for presentation updates
      const webhook = apiManager.createWebhook(
        'https://example.com/webhooks/presentations',
        ['presentation.created', 'presentation.updated']
      );

      expect(webhook.active).toBe(true);

      // Complete workflow validation
      expect(imported?.source).toBe('figma');
      expect(marketplace.getActiveTheme()?.id).toBe(theme.id);
      expect(apiKey.scopes).toContain('presentations:write');
      expect(webhook.events).toContain('presentation.updated');
    });
  });

  // ==================== Workflow 6: Live Presentation with Q&A and Voice Narration ====================

  describe('Workflow 6: Live Interactive Presentation', () => {
    it('should conduct live presentation with Q&A, polls, and voice narration', () => {
      const voiceManager = new VoiceNarrationManager();
      const interactiveManager = new InteractiveElementsManager();

      // Step 1: Create narration track
      const narrationTrack = voiceManager.createTrack('pres-live-1', [
        { slideNumber: 1, text: 'Welcome everyone to today\'s presentation' },
        { slideNumber: 2, text: 'Let me introduce our key findings' },
        { slideNumber: 3, text: 'Now let\'s discuss the implementation strategy' }
      ]);

      voiceManager.updateTrackDuration(narrationTrack.id);

      // Step 2: Create Q&A session
      const qna = interactiveManager.createQnASession(
        'slide-3',
        'Questions & Answers',
        { moderationEnabled: true, allowAnonymous: false }
      );

      expect(qna.active).toBe(true);

      // Step 3: Participants ask questions
      const q1 = interactiveManager.askQuestion(
        qna.id,
        'How does this compare to competitors?',
        'user-1',
        'Alice'
      );

      const q2 = interactiveManager.askQuestion(
        qna.id,
        'What is the timeline for implementation?',
        'user-2',
        'Bob'
      );

      const q3 = interactiveManager.askQuestion(
        qna.id,
        'What are the cost implications?',
        'user-3',
        'Charlie'
      );

      // Step 4: Upvote questions
      interactiveManager.upvoteQuestion(qna.id, q1!.id, 'user-4');
      interactiveManager.upvoteQuestion(qna.id, q1!.id, 'user-5');
      interactiveManager.upvoteQuestion(qna.id, q2!.id, 'user-6');

      // Step 5: Get top questions
      const topQuestions = interactiveManager.getTopQuestions(qna.id, 3);

      expect(topQuestions[0].upvotes).toBe(2); // q1
      expect(topQuestions[1].upvotes).toBe(1); // q2

      // Step 6: Answer top questions
      interactiveManager.answerQuestion(
        qna.id,
        topQuestions[0].id,
        'Our solution offers 40% better performance with 30% lower costs',
        'presenter-1'
      );

      interactiveManager.answerQuestion(
        qna.id,
        topQuestions[1].id,
        'Implementation will take 6-8 weeks with phased rollout',
        'presenter-1'
      );

      // Step 7: Create feedback form
      const feedback = interactiveManager.createFeedbackForm(
        'slide-final',
        'Session Feedback',
        [
          { label: 'Overall Rating', type: 'rating', required: true, min: 1, max: 5 },
          { label: 'Most Valuable Insight', type: 'textarea', required: false },
          { label: 'Clarity of Presentation', type: 'scale', required: true, min: 1, max: 10 }
        ]
      );

      // Step 8: Submit feedback
      interactiveManager.submitFeedback(
        feedback.id,
        {
          [feedback.fields[0].id]: 5,
          [feedback.fields[1].id]: 'The competitive analysis was excellent',
          [feedback.fields[2].id]: 9
        },
        'user-1',
        'Alice'
      );

      interactiveManager.submitFeedback(
        feedback.id,
        {
          [feedback.fields[0].id]: 4,
          [feedback.fields[2].id]: 8
        },
        'user-2',
        'Bob'
      );

      const summary = interactiveManager.getFeedbackSummary(feedback.id);

      // Complete workflow validation
      expect(narrationTrack.totalDuration).toBeGreaterThan(0);
      expect(qna.questions).toHaveLength(3);
      expect(topQuestions[0].answered).toBe(true);
      expect(summary?.totalResponses).toBe(2);
      expect(summary?.fieldSummaries[0].averageRating).toBe(4.5);
    });
  });

  // ==================== Workflow 7: Multi-User AR Collaboration ====================

  describe('Workflow 7: Multi-User AR Collaboration', () => {
    it('should enable multi-user AR presentation with spatial anchors', async () => {
      const arManager = new ARPresentationManager();

      // Step 1: Presenter starts AR session
      const session = await arManager.startARSession('pres-ar-2', {
        autoPlaceSlides: false,
        enableGestures: true,
        enableHandTracking: true,
        showParticipantAvatars: true
      });

      if (session) {
        expect(session.status).toBe('active');
        expect(session.participants.length).toBeGreaterThan(0);

        // Step 2: Presenter places slides in space
        const slide1 = arManager.anchorObject(session.id, {
          type: 'slide',
          content: { slideNumber: 1 },
          anchor: {
            type: 'plane',
            position: { x: 0, y: 1.5, z: -2 },
            rotation: { x: 0, y: 0, z: 0, w: 1 },
            planeType: 'vertical'
          }
        });

        expect(slide1).toBeDefined();

        // Step 3: Add 3D model annotation
        const annotation = arManager.anchorObject(session.id, {
          type: 'model',
          content: {
            modelUrl: 'https://example.com/arrow.glb',
            size: { width: 0.3, height: 0.3 }
          },
          anchor: {
            type: 'world',
            position: { x: 0.5, y: 1.8, z: -2 },
            rotation: { x: 0, y: 0, z: 0, w: 1 }
          }
        });

        expect(annotation).toBeDefined();

        // Step 4: Viewers join session
        arManager.joinARSession(session.id, {
          id: 'viewer-1',
          name: 'Alice',
          role: 'viewer',
          device: {
            type: 'smartphone',
            platform: 'ios',
            capabilities: {
              worldTracking: true,
              planeDetection: true,
              handTracking: false,
              hitTest: true
            }
          }
        });

        expect(session.participants).toHaveLength(2);

        // Step 5: Handle gestures
        const gesture = arManager.handleGesture(session.id, {
          type: 'tap',
          position: { x: 0, y: 1.5, z: -2 },
          timestamp: new Date()
        });

        expect(gesture).toBeDefined();

        // Step 6: End session
        arManager.endARSession(session.id);
        expect(session.status).toBe('ended');
      }
    });
  });

  // ==================== Workflow 8: Complete Publishing Workflow ====================

  describe('Workflow 8: Create, Customize, Publish, and Monetize', () => {
    it('should complete full presentation lifecycle', () => {
      const gridEngine = new GridLayoutEngine();
      const typographyEngine = new TypographyEngine();
      const colorEngine = new ColorEngine();
      const marketplace = new ThemesMarketplaceManager();
      const apiManager = new APIAccessManager();
      const nftManager = new BlockchainNFTManager();

      // Step 1: Create presentation structure (P0)
      const slides = [
        { title: 'Introduction', text: 'Welcome to our presentation' },
        { title: 'Main Content', text: 'Here are the key points' },
        { title: 'Conclusion', text: 'Thank you for your attention' }
      ];

      const layouts = slides.map((slide, index) => {
        const analysis = gridEngine.analyzeContent(slide);
        return gridEngine.selectLayout(analysis, index, slides.length);
      });

      // Step 2: Apply typography (P0)
      const typography = slides.map(slide => {
        const metrics = typographyEngine.analyzeContent({ title: slide.title, body: slide.text });
        return typographyEngine.calculateSizes(metrics, 'content');
      });

      // Step 3: Select color palette (P0)
      const palette = colorEngine.getPalette('corporate-blue')!;
      expect(palette).toBeDefined();

      // Step 4: Install and customize theme (P2)
      const { themes } = marketplace.searchThemes({ category: 'business', priceType: 'free' });
      marketplace.installTheme(themes[0].id, 'user-123');
      marketplace.customizeTheme(themes[0].id, {
        colors: {
          primary: palette.primary[500],
          secondary: palette.primary[400],
          accent: palette.accent[500],
          background: palette.surfaces.background,
          text: palette.text.primary,
          textSecondary: palette.text.secondary
        }
      });

      // Step 5: Create API key for sharing (P2)
      const apiKey = apiManager.createAPIKey(
        'user-123',
        'Public API',
        ['presentations:read']
      );

      // Step 6: Generate OpenAPI documentation (P2)
      const apiSpec = apiManager.generateOpenAPISpec();
      expect(apiSpec.openapi).toBe('3.0.0');

      // Step 7: Connect wallet (P2)
      nftManager.connectWallet({
        address: '0x1234567890abcdef1234567890abcdef12345678',
        provider: 'metamask',
        network: 'ethereum',
        balance: 2.5
      });

      // Step 8: Upload to IPFS (P2)
      const ipfsUpload = nftManager.uploadToIPFS({
        presentationId: 'pres-final',
        title: 'Corporate Presentation',
        file: new Blob(['presentation data'])
      });

      expect(ipfsUpload.cid).toBeTruthy();

      // Step 9: Mint as NFT (P2)
      const nft = nftManager.mintNFT({
        presentationId: 'pres-final',
        title: 'Premium Corporate Presentation',
        description: 'Professional business presentation with custom theme',
        coverImage: `https://ipfs.io/ipfs/${ipfsUpload.cid}/cover.jpg`,
        blockchain: 'ethereum',
        royaltyPercentage: 5,
        price: 0.1,
        listForSale: true
      });

      expect(nft?.tokenId).toBeTruthy();

      // Step 10: List on marketplace (P2)
      const listing = nftManager.listNFT(nft!.tokenId, 'opensea', 0.15, 'ETH');
      expect(listing?.status).toBe('active');

      // Complete workflow validation
      expect(layouts).toHaveLength(3);
      expect(typography).toHaveLength(3);
      expect(palette.text.primary).toBeTruthy();
      expect(apiKey.key).toStartWith('sk_');
      expect(nft?.metadata.properties.slideCount).toBe(3);
      expect(listing?.marketplace).toBe('opensea');
    });
  });

  // ==================== Performance Tests ====================

  describe('P2 Workflow Performance', () => {
    it('should complete voice + interactive workflow in under 500ms', () => {
      const voiceManager = new VoiceNarrationManager();
      const interactiveManager = new InteractiveElementsManager();

      const start = performance.now();

      // Create narration
      const track = voiceManager.createTrack('pres-1', [
        { slideNumber: 1, text: 'Welcome' },
        { slideNumber: 2, text: 'Content' }
      ]);

      // Create poll
      const poll = interactiveManager.createPoll('slide-1', 'Question', ['A', 'B', 'C']);

      // Create quiz
      const quiz = interactiveManager.createQuiz('slide-2', 'Quiz', [
        { question: 'Q1', type: 'short_answer', correctAnswer: 'A', points: 10 }
      ]);

      const duration = performance.now() - start;

      expect(track.id).toBeTruthy();
      expect(poll.id).toBeTruthy();
      expect(quiz.id).toBeTruthy();
      expect(duration).toBeLessThan(500);
    });

    it('should complete theme + API workflow in under 300ms', () => {
      const marketplace = new ThemesMarketplaceManager();
      const apiManager = new APIAccessManager();

      const start = performance.now();

      // Search themes
      const { themes } = marketplace.searchThemes({ priceType: 'free' });

      // Install theme
      marketplace.installTheme(themes[0].id, 'user-123');

      // Create API key
      const apiKey = apiManager.createAPIKey('user-123', 'Test', ['presentations:read']);

      // Validate key
      apiManager.validateAPIKey(apiKey.key);

      const duration = performance.now() - start;

      expect(duration).toBeLessThan(300);
    });
  });
});

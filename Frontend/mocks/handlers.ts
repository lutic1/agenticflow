import { http, HttpResponse, delay } from 'msw';

/**
 * Mock Service Worker (MSW) handlers for API mocking in tests
 * These handlers intercept API requests and return mock responses
 */

// Mock data generators
const generateMockSlide = (id: string, index: number) => ({
  id,
  title: `Slide ${index + 1}`,
  content: `This is the content for slide ${index + 1}`,
  layout: index % 2 === 0 ? '2-col' : 'full-width',
  theme: 'corporate',
  backgroundColor: '#ffffff',
  textColor: '#333333',
  order: index,
});

const generateMockPresentation = (slideCount = 5) => ({
  id: 'pres-mock-123',
  title: 'Mock Presentation',
  description: 'AI in Healthcare - A comprehensive overview',
  reasoning: 'Generated based on AI healthcare trends and best practices',
  slidePlan: Array.from({ length: slideCount }, (_, i) => ({
    slideNumber: i + 1,
    title: `Slide ${i + 1}`,
    purpose: `Purpose for slide ${i + 1}`,
    layout: i % 2 === 0 ? '2-col' : 'full-width',
  })),
  slides: Array.from({ length: slideCount }, (_, i) =>
    generateMockSlide(`slide-mock-${i}`, i)
  ),
  metadata: {
    created: Date.now(),
    updated: Date.now(),
    version: 1,
    author: 'test-user',
  },
});

export const handlers = [
  // ========================================
  // Presentation Generation
  // ========================================

  http.post('/api/generate-slides', async () => {
    await delay(1000); // Simulate network delay
    return HttpResponse.json(generateMockPresentation(10));
  }),

  http.post('/api/presentations/:id/regenerate', async ({ params }) => {
    await delay(800);
    return HttpResponse.json(generateMockPresentation(10));
  }),

  // ========================================
  // Presentation CRUD
  // ========================================

  http.get('/api/presentations', async () => {
    return HttpResponse.json({
      presentations: [
        generateMockPresentation(5),
        { ...generateMockPresentation(8), id: 'pres-mock-456', title: 'Another Presentation' },
      ],
      total: 2,
    });
  }),

  http.get('/api/presentations/:id', async ({ params }) => {
    return HttpResponse.json(generateMockPresentation(10));
  }),

  http.put('/api/presentations/:id', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      ...generateMockPresentation(10),
      ...(typeof body === 'object' && body !== null ? body : {}),
      metadata: {
        created: Date.now() - 3600000,
        updated: Date.now(),
        version: 2,
        author: 'test-user',
      },
    });
  }),

  http.delete('/api/presentations/:id', async () => {
    return HttpResponse.json({ success: true });
  }),

  // ========================================
  // P0 Features - Grid Layout
  // ========================================

  http.get('/api/p0/grid-layout/:slideId', async ({ params }) => {
    return HttpResponse.json({
      slideId: params.slideId,
      layout: '2-col',
      columns: 2,
      rows: 1,
      gap: '24px',
      areas: [
        { id: 'area-1', gridArea: '1 / 1 / 2 / 2', content: 'Left column' },
        { id: 'area-2', gridArea: '1 / 2 / 2 / 3', content: 'Right column' },
      ],
    });
  }),

  http.put('/api/p0/grid-layout/:slideId', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      layout: body,
    });
  }),

  // ========================================
  // P0 Features - Typography
  // ========================================

  http.get('/api/p0/typography/:slideId', async ({ params }) => {
    return HttpResponse.json({
      slideId: params.slideId,
      fontFamily: 'Inter, sans-serif',
      fontSize: {
        h1: '48px',
        h2: '36px',
        h3: '28px',
        body: '18px',
      },
      fontWeight: {
        heading: 700,
        body: 400,
      },
      lineHeight: 1.6,
      letterSpacing: '0.02em',
    });
  }),

  http.put('/api/p0/typography/:slideId', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      typography: body,
    });
  }),

  // ========================================
  // P0 Features - Color Palette
  // ========================================

  http.get('/api/p0/colors/:slideId', async ({ params }) => {
    return HttpResponse.json({
      slideId: params.slideId,
      palette: 'corporate',
      colors: {
        primary: '#003366',
        secondary: '#0066cc',
        accent: '#ff6600',
        background: '#ffffff',
        text: '#333333',
        textSecondary: '#666666',
      },
    });
  }),

  http.put('/api/p0/colors/:slideId', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      colors: body,
    });
  }),

  // ========================================
  // P0 Features - Export
  // ========================================

  http.post('/api/p0/export/:presentationId', async ({ params, request }) => {
    const body = await request.json() as { format?: string };
    const format = body?.format || 'pptx';

    await delay(2000); // Simulate export time

    return HttpResponse.json({
      downloadUrl: `/downloads/${params.presentationId}.${format}`,
      format,
      size: 2458112,
      expiresAt: Date.now() + 3600000,
    });
  }),

  // ========================================
  // P1 Features - Collaboration
  // ========================================

  http.get('/api/p1/collaboration/:presentationId/users', async ({ params }) => {
    return HttpResponse.json({
      users: [
        { id: 'user-1', name: 'Alice', online: true, cursor: { x: 100, y: 200 } },
        { id: 'user-2', name: 'Bob', online: true, cursor: { x: 300, y: 400 } },
      ],
    });
  }),

  http.post('/api/p1/collaboration/:presentationId/cursor', async ({ request }) => {
    return HttpResponse.json({ success: true });
  }),

  // ========================================
  // P1 Features - Version History
  // ========================================

  http.get('/api/p1/versions/:presentationId', async ({ params }) => {
    return HttpResponse.json({
      versions: [
        {
          id: 'v1',
          version: 1,
          timestamp: Date.now() - 7200000,
          author: 'test-user',
          message: 'Initial version',
        },
        {
          id: 'v2',
          version: 2,
          timestamp: Date.now() - 3600000,
          author: 'test-user',
          message: 'Updated slide 3',
        },
        {
          id: 'v3',
          version: 3,
          timestamp: Date.now(),
          author: 'test-user',
          message: 'Current version',
        },
      ],
    });
  }),

  http.post('/api/p1/versions/:presentationId/restore', async ({ request }) => {
    const body = await request.json() as { versionId?: string };
    return HttpResponse.json({
      success: true,
      presentationId: body?.versionId,
    });
  }),

  // ========================================
  // P2 Features - Voice Narration
  // ========================================

  http.post('/api/p2/voice-narration/:slideId', async ({ request }) => {
    await delay(3000); // Simulate TTS processing
    return HttpResponse.json({
      audioUrl: '/audio/narration-123.mp3',
      duration: 45.5,
      text: 'This is the voice narration for this slide.',
    });
  }),

  // ========================================
  // P2 Features - AR Presentation
  // ========================================

  http.get('/api/p2/ar/:presentationId', async ({ params }) => {
    return HttpResponse.json({
      arUrl: `/ar/${params.presentationId}/scene.usdz`,
      supported: true,
      devices: ['ios', 'android'],
    });
  }),

  // ========================================
  // Error Scenarios
  // ========================================

  http.get('/api/error/500', () => {
    return HttpResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }),

  http.get('/api/error/401', () => {
    return HttpResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }),

  http.get('/api/error/timeout', async () => {
    await delay(60000); // Simulate timeout
    return HttpResponse.json({ success: true });
  }),
];

/**
 * Mock Data for Testing
 * Provides realistic test data for slide generation tests
 */

export const mockGeminiResponses = {
  titleSlide: {
    content: '# Introduction to Artificial Intelligence\n\nA Comprehensive Overview of Modern AI Technologies',
    tokensUsed: 234,
    finishReason: 'stop' as const
  },
  contentSlide: {
    content: '# What is Artificial Intelligence?\n\nArtificial Intelligence (AI) refers to computer systems that can perform tasks typically requiring human intelligence. This includes learning, reasoning, problem-solving, perception, and language understanding.',
    tokensUsed: 456,
    finishReason: 'stop' as const
  },
  bulletSlide: {
    content: '# Key AI Technologies\n\n* Machine Learning - Systems that learn from data\n* Natural Language Processing - Understanding human language\n* Computer Vision - Interpreting visual information\n* Robotics - Physical AI systems\n* Expert Systems - Knowledge-based decision making',
    tokensUsed: 389,
    finishReason: 'stop' as const
  },
  conclusionSlide: {
    content: '# The Future of AI\n\nAI will continue to transform industries and society. Thank you for your attention!',
    tokensUsed: 178,
    finishReason: 'stop' as const
  }
};

export const mockAssets = {
  images: [
    {
      id: 'img-001',
      url: 'https://example.com/images/ai-network.jpg',
      thumbnailUrl: 'https://example.com/images/thumbs/ai-network.jpg',
      width: 1920,
      height: 1080,
      type: 'image' as const,
      source: 'Unsplash',
      license: 'free',
      attribution: 'Photo by AI Researcher on Unsplash'
    },
    {
      id: 'img-002',
      url: 'https://example.com/images/machine-learning.jpg',
      thumbnailUrl: 'https://example.com/images/thumbs/machine-learning.jpg',
      width: 1600,
      height: 900,
      type: 'image' as const,
      source: 'Pexels',
      license: 'free',
      attribution: 'Photo by Tech User on Pexels'
    },
    {
      id: 'img-003',
      url: 'https://example.com/images/neural-network.jpg',
      thumbnailUrl: 'https://example.com/images/thumbs/neural-network.jpg',
      width: 800,
      height: 1200,
      type: 'image' as const,
      source: 'Pixabay',
      license: 'free',
      attribution: 'Image from Pixabay'
    }
  ],
  icons: [
    {
      id: 'icon-001',
      url: 'https://example.com/icons/brain.svg',
      thumbnailUrl: 'https://example.com/icons/thumbs/brain.svg',
      width: 512,
      height: 512,
      type: 'icon' as const,
      source: 'Font Awesome',
      license: 'free',
      attribution: 'Font Awesome Free Icons'
    },
    {
      id: 'icon-002',
      url: 'https://example.com/icons/chart.svg',
      thumbnailUrl: 'https://example.com/icons/thumbs/chart.svg',
      width: 512,
      height: 512,
      type: 'icon' as const,
      source: 'Material Icons',
      license: 'free',
      attribution: 'Material Design Icons'
    }
  ]
};

export const mockSlides = [
  {
    number: 1,
    title: 'Introduction to AI',
    content: 'Artificial Intelligence is transforming our world',
    layout: 'title',
    images: [],
    icons: []
  },
  {
    number: 2,
    title: 'What is AI?',
    content: 'AI refers to systems that can perform tasks requiring human intelligence',
    layout: 'content',
    images: [mockAssets.images[0].url],
    icons: []
  },
  {
    number: 3,
    title: 'Key Technologies',
    content: '* Machine Learning\n* Natural Language Processing\n* Computer Vision',
    layout: 'bullet',
    images: [],
    icons: [mockAssets.icons[0].url]
  },
  {
    number: 4,
    title: 'Applications',
    content: 'AI is used in healthcare, finance, transportation, and more',
    layout: 'content',
    images: [mockAssets.images[1].url],
    icons: []
  },
  {
    number: 5,
    title: 'The Future',
    content: 'AI will continue to evolve and transform society',
    layout: 'conclusion',
    images: [],
    icons: []
  }
];

export const mockPresentation = {
  title: 'Introduction to Artificial Intelligence',
  slides: mockSlides,
  metadata: {
    generatedAt: new Date('2024-01-01T00:00:00Z'),
    totalSlides: 5,
    wordCount: 150,
    estimatedDuration: 10
  },
  html: '<div class="slide">...</div>',
  css: '.slide { padding: 2rem; }'
};

export const mockLayouts = {
  title: {
    type: 'title' as const,
    columns: 1,
    gridRows: 3,
    textAlignment: 'center' as const,
    spacing: 'relaxed' as const,
    elements: [
      {
        type: 'text' as const,
        position: { x: 0.1, y: 0.3, width: 0.8, height: 0.2 },
        content: 'Title Here',
        style: { fontSize: 48, fontWeight: 'bold' }
      }
    ]
  },
  content: {
    type: 'content' as const,
    columns: 1,
    gridRows: 4,
    textAlignment: 'left' as const,
    spacing: 'normal' as const,
    elements: [
      {
        type: 'text' as const,
        position: { x: 0.1, y: 0.1, width: 0.8, height: 0.15 },
        content: 'Title',
        style: { fontSize: 32, fontWeight: 'bold' }
      },
      {
        type: 'text' as const,
        position: { x: 0.1, y: 0.3, width: 0.8, height: 0.6 },
        content: 'Content here',
        style: { fontSize: 20 }
      }
    ]
  },
  bullet: {
    type: 'bullet' as const,
    columns: 1,
    gridRows: 4,
    textAlignment: 'left' as const,
    spacing: 'normal' as const,
    elements: [
      {
        type: 'text' as const,
        position: { x: 0.1, y: 0.1, width: 0.8, height: 0.15 },
        content: 'Title',
        style: { fontSize: 32, fontWeight: 'bold' }
      },
      {
        type: 'list' as const,
        position: { x: 0.15, y: 0.3, width: 0.75, height: 0.6 },
        content: ['Point 1', 'Point 2', 'Point 3'],
        style: { fontSize: 20 }
      }
    ]
  }
};

export const mockDesignRules = {
  typography: {
    minFontSize: 16,
    maxFontSize: 72,
    titleFontSize: 48,
    bodyFontSize: 20,
    lineHeight: 1.5,
    maxLineLength: 80,
    fontFamilies: ['Inter', 'Roboto', 'Open Sans']
  },
  color: {
    contrastRatio: 4.5,
    maxColorsPerSlide: 5,
    allowedThemes: ['light', 'dark', 'corporate', 'modern']
  },
  spacing: {
    minMargin: 5,
    maxContentWidth: 90,
    elementSpacing: 1,
    sectionSpacing: 2
  },
  accessibility: {
    minContrastRatio: 4.5,
    requireAltText: true,
    maxAnimationDuration: 3000,
    keyboardNavigable: true
  },
  content: {
    maxBulletsPerSlide: 7,
    maxWordsPerSlide: 50,
    maxWordsPerBullet: 15,
    maxLinesPerSlide: 10
  }
};

export const mockConfigs = {
  gemini: {
    apiKey: 'test-api-key-12345',
    model: 'gemini-pro',
    temperature: 0.7,
    maxTokens: 2048
  },
  layout: {
    width: 1920,
    height: 1080,
    aspectRatio: '16:9' as const,
    theme: 'modern' as const,
    fontFamily: 'Inter, sans-serif',
    primaryColor: '#2563eb',
    secondaryColor: '#64748b'
  },
  slideGenerator: {
    geminiApiKey: 'test-key',
    theme: 'modern' as const,
    aspectRatio: '16:9' as const,
    includeImages: true,
    includeIcons: true
  }
};

export const mockValidationResults = {
  passed: {
    valid: true,
    errors: [],
    warnings: [],
    score: 95
  },
  failed: {
    valid: false,
    errors: [
      {
        rule: 'color.maxColorsPerSlide',
        message: 'Too many colors: 8 > 5',
        severity: 'error' as const
      },
      {
        rule: 'typography.minFontSize',
        message: 'Font size too small: 12 < 16',
        severity: 'error' as const
      }
    ],
    warnings: [
      {
        rule: 'content.maxWordsPerSlide',
        message: 'Too many words: 75 > 50',
        suggestion: 'Consider splitting content across multiple slides'
      }
    ],
    score: 52
  }
};

export const mockTopics = [
  'Introduction to Machine Learning',
  'Data Science Fundamentals',
  'Cloud Computing Architecture',
  'Cybersecurity Best Practices',
  'Agile Project Management',
  'Digital Marketing Strategies',
  'Financial Planning 101',
  'Sustainable Business Practices',
  'Product Design Thinking',
  'Team Leadership Skills'
];

export const mockSwarmData = {
  topology: 'mesh',
  agents: [
    { type: 'researcher', id: 'agent-001', status: 'active' },
    { type: 'coder', id: 'agent-002', status: 'active' },
    { type: 'tester', id: 'agent-003', status: 'active' },
    { type: 'reviewer', id: 'agent-004', status: 'active' }
  ],
  memory: {
    'swarm/researcher/findings': ['Finding 1', 'Finding 2', 'Finding 3'],
    'swarm/coder/output': { code: 'function test() {}', files: ['file1.ts'] },
    'swarm/tester/results': { passed: true, coverage: 92 }
  },
  metrics: {
    totalTasks: 10,
    completedTasks: 8,
    failedTasks: 0,
    averageDuration: 1234,
    agentUtilization: {
      researcher: 3,
      coder: 4,
      tester: 2,
      reviewer: 1
    }
  }
};

export function createMockSlide(overrides: Partial<any> = {}) {
  return {
    number: 1,
    title: 'Test Slide',
    content: 'Test content',
    layout: 'content',
    images: [],
    icons: [],
    ...overrides
  };
}

export function createMockPresentation(slideCount: number = 5) {
  const slides = Array.from({ length: slideCount }, (_, i) =>
    createMockSlide({
      number: i + 1,
      title: `Slide ${i + 1}`,
      layout: i === 0 ? 'title' : i === slideCount - 1 ? 'conclusion' : 'content'
    })
  );

  return {
    title: 'Test Presentation',
    slides,
    metadata: {
      generatedAt: new Date(),
      totalSlides: slideCount,
      wordCount: slideCount * 20,
      estimatedDuration: slideCount * 2
    },
    html: '<div class="slide">Test</div>',
    css: '.slide { padding: 2rem; }'
  };
}

export function createMockAsset(type: 'image' | 'icon' = 'image') {
  return {
    id: `${type}-${Math.random().toString(36).substr(2, 9)}`,
    url: `https://example.com/${type}s/test.jpg`,
    thumbnailUrl: `https://example.com/${type}s/thumb.jpg`,
    width: type === 'icon' ? 512 : 1920,
    height: type === 'icon' ? 512 : 1080,
    type,
    source: 'Test Source',
    license: 'free',
    attribution: 'Test Attribution'
  };
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function generateRandomTopic(): string {
  return mockTopics[Math.floor(Math.random() * mockTopics.length)];
}

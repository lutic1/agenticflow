// Agentic Slide Designer

Professional AI-powered slide presentation generator using Gemini 2.5 Flash and intelligent multi-agent architecture.

## Features

- **🤖 Multi-Agent Architecture**: Five specialized agents work together
  - Research Agent: Topic research and information gathering
  - Content Agent: Outline and content generation
  - Design Agent: Theme and layout decisions
  - Asset Agent: Visual asset finder
  - Generator Agent: HTML code generation

- **🎨 Intelligent Design**:
  - Automatic layout selection based on content analysis
  - Smart theme generation
  - Image vs icon decision logic
  - Typography hierarchy optimization
  - Whitespace and visual balance

- **⚡ Gemini 2.5 Flash Integration**:
  - Content generation
  - Image search query generation
  - Layout suggestions
  - Theme creation

- **🏗️ Beautiful HTML Output**:
  - Responsive design
  - Print-friendly
  - Keyboard navigation
  - Touch support
  - Accessible markup

## Installation

```bash
npm install @google/generative-ai
```

## Environment Setup

Create a `.env` file:

```env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.0-flash-exp
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=2048
```

Get your API key from: https://aistudio.google.com/apikey

## Quick Start

```typescript
import { generatePresentation } from './slide-designer';

// Simple usage
const result = await generatePresentation('AI in Healthcare', {
  slideCount: 10,
  tone: 'formal',
  theme: 'professional',
  includeImages: true,
});

// Save HTML
import fs from 'fs';
fs.writeFileSync('presentation.html', result.html);

console.log(`Generated ${result.slides.length} slides`);
console.log(`Theme: ${result.theme.name}`);
console.log(`Processing time: ${result.metadata.processingTime}ms`);
```

## Advanced Usage

### Manual Agent Control

```typescript
import {
  getSlideGenerator,
  getResearchAgent,
  getContentAgent,
  getDesignAgent,
  getAssetAgent,
  getGeneratorAgent,
} from './slide-designer';

const generator = getSlideGenerator();

// Generate with progress tracking
const result = await generator.generateWithProgress(
  {
    topic: 'Machine Learning Fundamentals',
    slideCount: 15,
    tone: 'technical',
    includeImages: true,
  },
  (phase, progress, message) => {
    console.log(`[${progress}%] ${phase}: ${message}`);
  }
);
```

### Custom Theme

```typescript
import { Theme } from './slide-designer';

const customTheme: Theme = {
  name: 'Corporate Blue',
  colors: {
    primary: '#003366',
    secondary: '#0066cc',
    accent: '#ff6600',
    background: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
  },
  typography: {
    fontFamily: "'Arial', sans-serif",
    baseSize: '18px',
    lineHeight: 1.6,
    headingSizes: {
      h1: '48px',
      h2: '36px',
      h3: '28px',
    },
    weights: {
      normal: 400,
      medium: 500,
      bold: 700,
    },
  },
  spacing: {
    base: '16px',
    small: '8px',
    medium: '24px',
    large: '48px',
    xlarge: '64px',
  },
};
```

### Individual Agent Usage

```typescript
// Research only
const researchAgent = getResearchAgent();
const research = await researchAgent.research('Quantum Computing', 'comprehensive');
console.log(research.keyPoints);

// Content generation only
const contentAgent = getContentAgent();
const outline = await contentAgent.generateOutline('Cloud Architecture', research);
console.log(outline.sections);

// Design decisions only
const designAgent = getDesignAgent();
const decisions = await designAgent.makeDesignDecisions(outline, slideContents);
console.log(decisions.theme);
```

## Architecture

### Core Components

- **SlideGenerator**: Main orchestrator
- **GeminiClient**: API integration
- **ContentAnalyzer**: Content intelligence
- **LayoutEngine**: Layout decisions
- **HTMLRenderer**: HTML generation

### Agents

Each agent is independent and can be used standalone:

1. **ResearchAgent**: Web search and topic analysis
2. **ContentAgent**: Outline and slide content
3. **DesignAgent**: Theme and layout decisions
4. **AssetAgent**: Visual asset discovery
5. **GeneratorAgent**: Final HTML generation

### Design Intelligence

The system makes intelligent decisions about:

- When to use images vs icons
- Layout type based on content
- Typography hierarchy
- Color schemes
- Whitespace optimization
- Asset placement

## Configuration

### Design Rules

Located in `config/design-config.ts`:

- `THEMES`: Predefined theme collection
- `LAYOUT_RULES`: Layout decision rules
- `DESIGN_RULES`: Design intelligence rules
- `CONTAINER_RULES`: Box placement logic
- `ANIMATION_SETTINGS`: Transitions and effects

### Gemini Configuration

Located in `config/gemini-config.ts`:

- Model selection
- Temperature and token settings
- Rate limiting
- Retry logic
- Prompt templates

## API Reference

### generatePresentation(topic, options)

Generate a complete presentation.

**Parameters:**
- `topic` (string): Presentation topic
- `options` (object):
  - `slideCount` (number): Target slide count
  - `tone` ('formal' | 'casual' | 'technical'): Presentation tone
  - `theme` (string): Theme name
  - `includeImages` (boolean): Include visual assets

**Returns:** `SlideGenerationResult`

### SlideGenerator Methods

- `generatePresentation(request)`: Full generation
- `generateWithProgress(request, callback)`: With progress tracking
- `getStats()`: Agent statistics
- `clearHistory()`: Clear agent histories

### Individual Agents

All agents have similar methods:

- `getTaskHistory()`: Get execution history
- `getStats()`: Get performance statistics
- `clearHistory()`: Clear task history

## Error Handling

```typescript
import { SlideDesignerError, GeminiAPIError } from './slide-designer';

try {
  const result = await generatePresentation('My Topic');
} catch (error) {
  if (error instanceof GeminiAPIError) {
    console.error('Gemini API error:', error.message);
    console.error('Details:', error.details);
  } else if (error instanceof SlideDesignerError) {
    console.error('Generation error:', error.code);
  }
}
```

## Logging

```typescript
import { getLogger, LogLevel } from './slide-designer';

const logger = getLogger();
logger.setMinLevel(LogLevel.DEBUG);

// Logs are automatically captured
const logs = logger.getLogs();
const errorLogs = logger.getLogsByLevel(LogLevel.ERROR);
const agentLogs = logger.getLogsByAgent('research');
```

## Output Formats

### HTML (default)

```typescript
const result = await generatePresentation('My Topic');
fs.writeFileSync('presentation.html', result.html);
```

### Markdown

```typescript
const generatorAgent = getGeneratorAgent();
const markdown = await generatorAgent.exportPresentation(
  result.slides,
  result.theme,
  'markdown'
);
```

## Performance

Typical generation times (Gemini 2.5 Flash):

- 5 slides: 15-20 seconds
- 10 slides: 30-40 seconds
- 20 slides: 60-90 seconds

Factors affecting performance:

- Slide count
- Asset generation
- Content complexity
- API rate limits

## Best Practices

1. **API Key Security**: Always use environment variables
2. **Error Handling**: Implement proper try-catch blocks
3. **Rate Limiting**: Respect API limits
4. **Content Length**: Keep slide content concise (<200 words)
5. **Asset Count**: Limit to 2-3 assets per slide
6. **Theme Selection**: Choose appropriate theme for audience

## Examples

See `/examples` directory for:

- Basic presentation generation
- Custom theme usage
- Progress tracking
- Individual agent usage
- Batch generation
- Export formats

## Troubleshooting

### "GEMINI_API_KEY not found"

Ensure `.env` file is present and loaded:

```typescript
import dotenv from 'dotenv';
dotenv.config();
```

### Rate limit errors

Increase retry delay in `config/gemini-config.ts`:

```typescript
export const RATE_LIMITS = {
  requestsPerMinute: 30, // Reduce if needed
  retryDelay: 2000, // Increase delay
};
```

### Poor layout decisions

Adjust `LAYOUT_RULES` in `config/design-config.ts` or provide custom layout map.

## Contributing

This is part of the AgenticFlow project. See main repository for contribution guidelines.

## License

MIT License - See main repository for details.

## Credits

- Built with Gemini 2.5 Flash
- Part of the AgenticFlow ecosystem
- Designed for Claude Code integration

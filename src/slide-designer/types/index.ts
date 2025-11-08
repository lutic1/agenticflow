/**
 * Type Definitions for Agentic Slide Designer
 * Comprehensive types for slides, layouts, themes, and agent coordination
 */

// ===== Core Slide Types =====

export interface Slide {
  id: string;
  title: string;
  content: string;
  layout: LayoutType;
  theme: Theme;
  assets?: Asset[];
  metadata: SlideMetadata;
}

export interface SlideMetadata {
  order: number;
  duration?: number;
  transitions?: string;
  notes?: string;
  tags?: string[];
}

export interface Asset {
  type: 'image' | 'icon' | 'chart' | 'diagram';
  url?: string;
  description: string;
  placement: AssetPlacement;
  size: AssetSize;
  alt: string;
}

export interface AssetPlacement {
  position: 'left' | 'right' | 'center' | 'background' | 'top' | 'bottom';
  width: string;
  height: string;
  x?: number;
  y?: number;
}

export interface AssetSize {
  width: number;
  height: number;
  unit: 'px' | '%' | 'em' | 'rem';
}

// ===== Layout Types =====

export type LayoutType =
  | 'title-slide'
  | 'content-only'
  | 'content-image-split'
  | 'image-focus'
  | 'bullet-points'
  | 'two-column'
  | 'quote'
  | 'section-header'
  | 'comparison'
  | 'timeline';

export interface LayoutDecision {
  layoutType: LayoutType;
  reasoning: string;
  confidence: number;
  alternatives?: LayoutType[];
  designRules: DesignRule[];
}

export interface DesignRule {
  rule: string;
  applied: boolean;
  impact: 'high' | 'medium' | 'low';
}

// ===== Theme Types =====

export interface Theme {
  name: string;
  colors: ColorScheme;
  typography: Typography;
  spacing: Spacing;
  effects?: VisualEffects;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  textSecondary: string;
  border?: string;
}

export interface Typography {
  fontFamily: string;
  headingFont?: string;
  baseSize: string;
  lineHeight: number;
  headingSizes: {
    h1: string;
    h2: string;
    h3: string;
  };
  weights: {
    normal: number;
    medium: number;
    bold: number;
  };
}

export interface Spacing {
  base: string;
  small: string;
  medium: string;
  large: string;
  xlarge: string;
}

export interface VisualEffects {
  shadows?: boolean;
  gradients?: boolean;
  borderRadius?: string;
  animations?: boolean;
}

// ===== Content Analysis Types =====

export interface ContentAnalysis {
  wordCount: number;
  sentenceCount: number;
  hasLists: boolean;
  hasQuotes: boolean;
  hasCode: boolean;
  hasNumbers: boolean;
  complexity: 'simple' | 'medium' | 'complex';
  tone: 'formal' | 'casual' | 'technical';
  keyPoints: string[];
  suggestedAssets: AssetSuggestion[];
}

export interface AssetSuggestion {
  type: 'image' | 'icon' | 'chart';
  description: string;
  relevance: number;
  searchQuery: string;
}

// ===== Gemini API Types =====

export interface GeminiConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  topP?: number;
  topK?: number;
}

export interface GeminiRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  format?: 'text' | 'json';
}

export interface GeminiResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason?: string;
}

// ===== Agent Types =====

export interface AgentTask {
  id: string;
  type: AgentType;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  startTime?: Date;
  endTime?: Date;
}

export type AgentType =
  | 'research'
  | 'content'
  | 'design'
  | 'asset'
  | 'generator';

export interface ResearchResult {
  topic: string;
  summary: string;
  keyPoints: string[];
  sources: string[];
  relatedTopics: string[];
  confidence: number;
}

export interface ContentOutline {
  title: string;
  sections: OutlineSection[];
  totalSlides: number;
  estimatedDuration: number;
  tone: string;
}

export interface OutlineSection {
  title: string;
  points: string[];
  slideCount: number;
  hasVisuals: boolean;
}

export interface DesignDecision {
  theme: Theme;
  layoutMap: Map<number, LayoutType>;
  assetStrategy: AssetStrategy;
  reasoning: string;
}

export interface AssetStrategy {
  useImages: boolean;
  useIcons: boolean;
  imageStyle: 'photographic' | 'illustration' | 'abstract' | 'minimal';
  iconStyle: 'line' | 'filled' | 'duotone';
  placement: 'balanced' | 'image-heavy' | 'minimal';
}

// ===== Generation Types =====

export interface SlideGenerationRequest {
  topic: string;
  slideCount?: number;
  tone?: 'formal' | 'casual' | 'technical';
  audience?: string;
  includeImages?: boolean;
  themePreference?: string;
}

export interface SlideGenerationResult {
  slides: Slide[];
  outline: ContentOutline;
  theme: Theme;
  metadata: GenerationMetadata;
  html: string;
}

export interface GenerationMetadata {
  generatedAt: Date;
  totalSlides: number;
  totalAssets: number;
  processingTime: number;
  agentTasks: AgentTask[];
  version: string;
}

// ===== HTML Generation Types =====

export interface HTMLSlideOptions {
  includeCSS: boolean;
  includeJS: boolean;
  responsive: boolean;
  printable: boolean;
  exportFormat: 'standalone' | 'embed';
}

export interface HTMLGenerationResult {
  html: string;
  css: string;
  js?: string;
  assets: string[];
  warnings?: string[];
}

// ===== Error Types =====

export class SlideDesignerError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'SlideDesignerError';
  }
}

export class GeminiAPIError extends SlideDesignerError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'GEMINI_API_ERROR', details);
    this.name = 'GeminiAPIError';
  }
}

export class LayoutEngineError extends SlideDesignerError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'LAYOUT_ENGINE_ERROR', details);
    this.name = 'LayoutEngineError';
  }
}

export class AgentError extends SlideDesignerError {
  constructor(message: string, public agentType: AgentType, details?: Record<string, unknown>) {
    super(message, 'AGENT_ERROR', { agentType, ...details });
    this.name = 'AgentError';
  }
}

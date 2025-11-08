/**
 * Quality Control Layer
 * Revolutionary AI-powered quality assurance systems
 */

export {
  LLMJudge,
  llmJudge,
  type JudgeConfig,
  type JudgeVerdict,
  type PresentationContext,
  type GeneratedSlide,
  type PresentationEvaluation
} from './llm-judge';

export {
  ContentValidator,
  contentValidator,
  type ValidationRule,
  type SlideContent,
  type ValidationError,
  type ValidationReport
} from './content-validator';

/**
 * LLM-as-Judge Quality Control System
 * Revolutionary AI-powered slide quality evaluation
 * NO COMPETITOR HAS THIS - Our unique competitive advantage
 */

import { GeminiClient } from '../core/gemini-client';

export interface JudgeConfig {
  model: 'gemini-2.5-flash';

  // Scoring weights (must sum to 1.0)
  weights: {
    visualHierarchy: number;  // 25%
    whitespace: number;       // 20%
    readability: number;      // 25%
    relevance: number;        // 15%
    professionalism: number;  // 15%
  };

  // Quality thresholds
  thresholds: {
    approve: number;      // ≥85: Auto-approve
    revise: number;       // 70-84: Auto-revise
    reject: number;       // <70: Reject
    maxIterations: number; // Max improvement attempts
  };

  // Prompt configuration
  prompt: {
    temperature: number;
    maxTokens: number;
    responseFormat: 'json';
  };
}

export interface JudgeVerdict {
  // Individual scores (0-100 each)
  scores: {
    visualHierarchy: number;
    whitespace: number;
    readability: number;
    relevance: number;
    professionalism: number;
  };

  // Overall score (weighted average)
  overallScore: number; // 0-100

  // Verdict
  verdict: 'APPROVE' | 'REVISE' | 'REJECT';

  // Feedback
  feedback: {
    strengths: string[];               // What's good (2-3 points)
    weaknesses: string[];              // What's bad (2-3 points)
    actionableImprovements: string[];  // How to fix (3-5 actions)
  };

  // Metadata
  metadata: {
    evaluatedAt: Date;
    model: string;
    tokensUsed: number;
    evaluationTime: number; // milliseconds
  };
}

export interface PresentationContext {
  topic: string;
  audience: string;
  purpose: string;
  slideNumber: number;
  totalSlides: number;
}

export interface GeneratedSlide {
  html: string;
  slideNumber: number;
  metadata?: {
    improved?: boolean;
    improvementIteration?: number;
    previousScore?: number;
  };
}

export interface PresentationEvaluation {
  slides: JudgeVerdict[];
  overallScore: number;
  verdict: 'APPROVE' | 'NEEDS_IMPROVEMENT' | 'REJECT';
  slidesNeedingImprovement: number[];
  timestamp: Date;
}

/**
 * LLM-as-Judge
 * AI-powered slide quality control system
 */
export class LLMJudge {
  private geminiClient: GeminiClient;
  private config: JudgeConfig;

  constructor(config?: Partial<JudgeConfig>) {
    this.config = {
      model: 'gemini-2.5-flash',
      weights: {
        visualHierarchy: 0.25,
        whitespace: 0.20,
        readability: 0.25,
        relevance: 0.15,
        professionalism: 0.15
      },
      thresholds: {
        approve: 85,
        revise: 70,
        reject: 70,
        maxIterations: 2
      },
      prompt: {
        temperature: 0.3,
        maxTokens: 1500,
        responseFormat: 'json'
      },
      ...config
    };

    this.geminiClient = new GeminiClient({
      apiKey: process.env.GEMINI_API_KEY || '',
      model: 'gemini-2.5-flash'
    });
  }

  /**
   * Main evaluation method
   */
  async evaluateSlide(
    slide: GeneratedSlide,
    context: PresentationContext
  ): Promise<JudgeVerdict> {
    const startTime = Date.now();

    // Build evaluation prompt
    const prompt = this.buildEvaluationPrompt(slide, context);

    try {
      // Call Gemini for scoring
      const response = await this.geminiClient.generateContent(prompt, {
        temperature: this.config.prompt.temperature,
        maxOutputTokens: this.config.prompt.maxTokens,
        responseMimeType: 'application/json'
      });

      // Parse JSON response
      const rawVerdict = JSON.parse(response.text);

      // Calculate weighted overall score
      const overallScore = this.calculateOverallScore(rawVerdict.scores);

      // Determine verdict based on thresholds
      const verdict: JudgeVerdict['verdict'] =
        overallScore >= this.config.thresholds.approve
          ? 'APPROVE'
          : overallScore >= this.config.thresholds.revise
          ? 'REVISE'
          : 'REJECT';

      return {
        scores: rawVerdict.scores,
        overallScore,
        verdict,
        feedback: rawVerdict.feedback,
        metadata: {
          evaluatedAt: new Date(),
          model: this.config.model,
          tokensUsed: response.usageMetadata?.totalTokenCount || 0,
          evaluationTime: Date.now() - startTime
        }
      };
    } catch (error) {
      console.error('LLM Judge evaluation failed:', error);
      // Return neutral verdict on error
      return {
        scores: {
          visualHierarchy: 75,
          whitespace: 75,
          readability: 75,
          relevance: 75,
          professionalism: 75
        },
        overallScore: 75,
        verdict: 'REVISE',
        feedback: {
          strengths: ['Slide generated successfully'],
          weaknesses: ['Automated evaluation failed'],
          actionableImprovements: ['Manual review recommended']
        },
        metadata: {
          evaluatedAt: new Date(),
          model: this.config.model,
          tokensUsed: 0,
          evaluationTime: Date.now() - startTime
        }
      };
    }
  }

  /**
   * Calculate weighted overall score
   */
  private calculateOverallScore(scores: JudgeVerdict['scores']): number {
    const weighted =
      scores.visualHierarchy * this.config.weights.visualHierarchy +
      scores.whitespace * this.config.weights.whitespace +
      scores.readability * this.config.weights.readability +
      scores.relevance * this.config.weights.relevance +
      scores.professionalism * this.config.weights.professionalism;

    return Math.round(weighted * 10) / 10; // Round to 1 decimal
  }

  /**
   * Improve slide based on feedback
   */
  async improveSlide(
    slide: GeneratedSlide,
    verdict: JudgeVerdict,
    context: PresentationContext,
    iteration: number = 0
  ): Promise<{ slide: GeneratedSlide; verdict: JudgeVerdict }> {
    if (iteration >= this.config.thresholds.maxIterations) {
      throw new Error(
        `Max improvement iterations (${this.config.thresholds.maxIterations}) reached. ` +
        `Final score: ${verdict.overallScore}/100. ` +
        `Weaknesses: ${verdict.feedback.weaknesses.join(', ')}`
      );
    }

    // Build improvement prompt
    const prompt = this.buildImprovementPrompt(slide, verdict, context);

    try {
      // Regenerate slide with improvements
      const improvedHTML = await this.geminiClient.generateContent(prompt);

      const improvedSlide: GeneratedSlide = {
        html: improvedHTML.text,
        slideNumber: slide.slideNumber,
        metadata: {
          improved: true,
          improvementIteration: iteration + 1,
          previousScore: verdict.overallScore
        }
      };

      // Re-evaluate improved slide
      const newVerdict = await this.evaluateSlide(improvedSlide, context);

      // Check if improvement succeeded
      if (newVerdict.overallScore >= this.config.thresholds.approve) {
        // Success! Return approved slide
        return {
          slide: improvedSlide,
          verdict: newVerdict
        };
      } else if (newVerdict.overallScore > verdict.overallScore) {
        // Improved but not enough, try again
        return this.improveSlide(improvedSlide, newVerdict, context, iteration + 1);
      } else {
        // Worse or same score, return original
        console.warn(
          `Improvement iteration ${iteration + 1} made slide worse ` +
          `(${verdict.overallScore} → ${newVerdict.overallScore}). Keeping original.`
        );
        return { slide, verdict };
      }
    } catch (error) {
      console.error('Slide improvement failed:', error);
      return { slide, verdict }; // Return original on error
    }
  }

  /**
   * Build evaluation prompt
   */
  private buildEvaluationPrompt(
    slide: GeneratedSlide,
    context: PresentationContext
  ): string {
    return `
You are a world-class presentation designer evaluating a slide for a professional business presentation.

**CONTEXT:**
- Topic: ${context.topic}
- Audience: ${context.audience}
- Purpose: ${context.purpose}
- Slide Position: ${slide.slideNumber} of ${context.totalSlides}

**SLIDE HTML:**
\`\`\`html
${slide.html}
\`\`\`

**YOUR TASK:**
Evaluate this slide on 5 criteria, scoring each 0-100. Be strict but fair. This slide will be presented to executives, so it must be professional-grade.

---

## CRITERION 1: Visual Hierarchy (0-100)

**Question:** Is the most important information visually prominent?

**Check:**
- Title is largest element (≥44px)?
- Subtitles clearly secondary (≥28px)?
- Body text readable (≥18px)?
- Eye flows naturally top-to-bottom?
- Contrast highlights key points?

**Scoring:**
- 90-100: Perfect hierarchy, title dominates, clear flow
- 75-89: Good hierarchy, minor issues
- 60-74: Weak hierarchy, multiple competing elements
- 40-59: Poor hierarchy, title blends with body
- 0-39: No hierarchy, all elements same size

---

## CRITERION 2: Whitespace (0-100)

**Question:** Is 40-60% of the slide empty (breathing room)?

**Check:**
- Whitespace ≥40%?
- Generous margins (≥48px)?
- Padding between elements (≥24px)?
- Content doesn't touch edges?
- Feels airy, not cramped?

**Scoring:**
- 90-100: 50-60% whitespace, generous spacing, airy
- 75-89: 40-49% whitespace, adequate spacing
- 60-74: 30-39% whitespace, feels a bit cramped
- 40-59: 20-29% whitespace, cluttered
- 0-39: <20% whitespace, overwhelming

---

## CRITERION 3: Readability (0-100)

**Question:** Can the audience read and understand this in 3 seconds? (Nancy Duarte test)

**Check:**
- Word count ≤75?
- Bullet points ≤5?
- Font size ≥18px body, ≥32px title?
- High contrast (readable)?
- Simple language (grade 8-10)?

**Scoring:**
- 90-100: Passes 3-second test, ≤50 words, ≤3 bullets
- 75-89: Readable in 5 seconds, ≤75 words, ≤5 bullets
- 60-74: Takes 7-10 seconds, ≤100 words, ≤7 bullets
- 40-59: Slow to read, >100 words, >7 bullets
- 0-39: Impossible to scan quickly, >150 words

---

## CRITERION 4: Relevance (0-100)

**Question:** Does the content directly support the topic "${context.topic}"?

**Check:**
- Information accurate?
- Every bullet adds value?
- No filler content?
- Self-contained (understandable without speaker)?

**Scoring:**
- 90-100: Every word essential, directly supports topic
- 75-89: Mostly relevant, 1-2 unnecessary points
- 60-74: Some off-topic content, could be tighter
- 40-59: Significant filler, weak connection to topic
- 0-39: Off-topic, irrelevant information

---

## CRITERION 5: Professionalism (0-100)

**Question:** Does this look like a $10,000 McKinsey/BCG consulting deck? Is it free of "AI slop"?

**Check:**
- Sophisticated design (not template-y)?
- High-quality images (professional)?
- Subtle colors (not gaudy)?
- Clean typography (consistent fonts)?
- No generic buzzwords?

**Red Flags (-20 points each):**
- Comic Sans or unprofessional fonts
- Clipart or low-res images
- Rainbow gradients
- Generic stock photos (handshakes, lightbulbs)
- Buzzwords without substance ("synergy", "disrupt")

**Scoring:**
- 90-100: McKinsey-grade, would present to Fortune 500 CEO
- 75-89: Professional, suitable for business meeting
- 60-74: Corporate but generic, "PowerPoint template" feel
- 40-59: Amateur, obvious AI generation
- 0-39: Unprofessional, clipart, Comic Sans

---

## OUTPUT JSON

Respond with ONLY valid JSON (no markdown, no explanation):

{
  "scores": {
    "visualHierarchy": 85,
    "whitespace": 90,
    "readability": 80,
    "relevance": 95,
    "professionalism": 88
  },
  "feedback": {
    "strengths": [
      "Clear title hierarchy with 48px bold title",
      "Generous whitespace (55%) creates professional look"
    ],
    "weaknesses": [
      "Too many bullet points (6, should be ≤5)",
      "Body font size is 16px (should be ≥18px)"
    ],
    "actionableImprovements": [
      "Combine bullets 4 and 5 into one concise point",
      "Increase body font size from 16px to 20px",
      "Add 8px more padding between bullets for breathing room"
    ]
  }
}
`;
  }

  /**
   * Build improvement prompt
   */
  private buildImprovementPrompt(
    slide: GeneratedSlide,
    verdict: JudgeVerdict,
    context: PresentationContext
  ): string {
    return `
You are a professional presentation designer improving a slide based on feedback.

**CONTEXT:**
- Topic: ${context.topic}
- Audience: ${context.audience}
- Current Quality Score: ${verdict.overallScore}/100 (need ≥${this.config.thresholds.approve})

**CURRENT SLIDE HTML:**
\`\`\`html
${slide.html}
\`\`\`

**FEEDBACK FROM EVALUATOR:**

**Strengths (keep these):**
${verdict.feedback.strengths.map((s) => `- ${s}`).join('\n')}

**Weaknesses (fix these):**
${verdict.feedback.weaknesses.map((w) => `- ${w}`).join('\n')}

**Specific Improvements Needed:**
${verdict.feedback.actionableImprovements.map((a) => `- ${a}`).join('\n')}

---

**YOUR TASK:**

Generate an improved version of this slide that addresses ALL weaknesses while maintaining the strengths.

**Requirements:**
1. Fix every issue mentioned in "Specific Improvements Needed"
2. Maintain the original content meaning (don't change facts)
3. Keep the same slide structure (title, bullets, image positions)
4. Output ONLY the improved HTML (no explanation, no markdown)
5. Ensure the improved slide would score ≥${this.config.thresholds.approve}/100

**OUTPUT:**
[Improved HTML only]
`;
  }

  /**
   * Batch evaluate multiple slides (parallel)
   */
  async evaluatePresentation(
    slides: GeneratedSlide[],
    context: Omit<PresentationContext, 'slideNumber'>
  ): Promise<PresentationEvaluation> {
    const evaluations = await Promise.all(
      slides.map((slide, index) =>
        this.evaluateSlide(slide, { ...context, slideNumber: index + 1 })
      )
    );

    const avgScore =
      evaluations.reduce((sum, e) => sum + e.overallScore, 0) / evaluations.length;

    const slidesNeedingImprovement = evaluations
      .map((e, i) => (e.verdict === 'REVISE' || e.verdict === 'REJECT' ? i + 1 : -1))
      .filter(i => i !== -1);

    return {
      slides: evaluations,
      overallScore: avgScore,
      verdict:
        avgScore >= this.config.thresholds.approve
          ? 'APPROVE'
          : slidesNeedingImprovement.length > 0
          ? 'NEEDS_IMPROVEMENT'
          : 'REJECT',
      slidesNeedingImprovement,
      timestamp: new Date()
    };
  }

  /**
   * Get configuration
   */
  getConfig(): JudgeConfig {
    return { ...this.config };
  }
}

// Default export
export const llmJudge = new LLMJudge();

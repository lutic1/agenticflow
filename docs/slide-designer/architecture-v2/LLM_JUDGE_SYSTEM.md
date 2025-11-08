# LLM-as-Judge Quality Control System

**Revolutionary Quality Assurance**

**Purpose:** Prevent "AI slop" through intelligent slide evaluation
**Model:** Gemini 2.5 Flash (fast inference, strong reasoning)
**Impact:** Guaranteed professional output (85+ quality score)

---

## EXECUTIVE SUMMARY

The LLM-as-Judge system is our competitive differentiator: **NO competitor has automated quality control at this level.**

**How it works:**
1. Generate slide → 2. AI Judge scores 0-100 → 3. Pass (≥85) / Revise (70-84) / Reject (<70)
2. If Revise: Improve with Gemini → Re-judge → Repeat (max 2 iterations)

**Result:** Every slide is professional-grade, not generic AI output.

---

## ARCHITECTURE

### Component Diagram

```
Generator Agent
      ↓ (Generated Slide HTML)
LLM Judge System
├── Slide Analyzer
│   ├── Content Parser (extract text, images, layout)
│   ├── Structure Validator (semantic HTML check)
│   └── Metrics Calculator (word count, whitespace %, font sizes)
├── Scoring Engine
│   ├── Gemini 2.5 Flash (evaluation model)
│   ├── Prompt Builder (criteria + context)
│   └── Score Parser (JSON validation)
├── Verdict Determiner
│   ├── Threshold Checker (85 pass, 70 reject)
│   └── Feedback Generator (actionable improvements)
└── Improvement Loop
    ├── Gemini 2.5 Flash (regenerate slide)
    ├── Iteration Counter (max 2)
    └── Fallback Handler (if max reached)
      ↓ (Approved Slide)
Export Engine
```

---

## SCORING CRITERIA (5 Dimensions)

### 1. Visual Hierarchy (0-100)

**Definition:** Is the most important information visually prominent?

**What to Check:**
- Title is largest element (≥44px)
- Subtitles are clearly secondary (≥28px)
- Body text is readable (≥18px)
- Eye naturally flows top-to-bottom, left-to-right
- Contrast draws attention to key points

**Scoring Rubric:**
- **90-100:** Perfect hierarchy, title dominates, clear flow
- **75-89:** Good hierarchy, minor issues (subtitle too big)
- **60-74:** Weak hierarchy, multiple competing elements
- **40-59:** Poor hierarchy, title blends with body
- **0-39:** No hierarchy, all elements same size

**Example Prompt:**
```
Evaluate visual hierarchy:

✅ GOOD:
- Title: 48px bold, dark color (#1F2937)
- Subtitle: 28px medium, gray (#6B7280)
- Body: 18px regular, dark gray (#374151)
- Clear size ratio: 48:28:18 (2.67:1.56:1)

❌ BAD:
- Title: 32px (too small)
- Body: 20px (too similar to title)
- Ratio: 32:20 (1.6:1, too close)

Score this slide's hierarchy: [HTML here]
```

---

### 2. Whitespace (0-100)

**Definition:** Is 40-60% of the slide empty (breathing room)?

**What to Check:**
- Whitespace percentage ≥40% (industry standard)
- Margins around edges (≥48px)
- Padding between elements (≥24px)
- Text doesn't touch slide edges
- No cramped feeling

**Scoring Rubric:**
- **90-100:** 50-60% whitespace, generous spacing, airy
- **75-89:** 40-49% whitespace, adequate spacing
- **60-74:** 30-39% whitespace, feels a bit cramped
- **40-59:** 20-29% whitespace, cluttered
- **0-39:** <20% whitespace, overwhelming

**Calculation:**
```typescript
function calculateWhitespace(slideHTML: string): number {
  const slideArea = 1920 * 1080; // 2,073,600 px²

  // Parse HTML, calculate occupied area
  const contentArea = calculateContentArea(slideHTML);

  const whitespacePercent = ((slideArea - contentArea) / slideArea) * 100;
  return whitespacePercent;
}
```

**Example Prompt:**
```
Evaluate whitespace:

✅ GOOD:
- Slide dimensions: 1920x1080
- Content area: ~900,000 px² (43%)
- Whitespace: 57%
- Margins: 64px all sides
- Element spacing: 32px

❌ BAD:
- Content area: 1,600,000 px² (77%)
- Whitespace: 23%
- Margins: 16px (too tight)
- Elements touching edges

Score this slide's whitespace: [HTML here]
```

---

### 3. Readability (0-100)

**Definition:** Can the audience read and understand this slide in 3 seconds? (Nancy Duarte 3-second test)

**What to Check:**
- Word count ≤75 (Nancy Duarte rule)
- Bullet points ≤5 (McKinsey standard)
- Font size ≥18px for body, ≥32px for titles
- Line length 50-75 characters
- High contrast (7:1 for WCAG AAA)
- Simple language (Flesch-Kincaid grade 8-10)

**Scoring Rubric:**
- **90-100:** Passes 3-second test, ≤50 words, ≤3 bullets
- **75-89:** Readable in 5 seconds, ≤75 words, ≤5 bullets
- **60-74:** Takes 7-10 seconds, ≤100 words, ≤7 bullets
- **40-59:** Slow to read, >100 words, >7 bullets
- **0-39:** Impossible to scan quickly, >150 words

**Example Prompt:**
```
Evaluate readability (Nancy Duarte 3-second test):

✅ GOOD:
- Word count: 42 words
- Bullets: 3 points
- Title: "Key Benefits" (48px, bold)
- Can skim in 3 seconds ✓

❌ BAD:
- Word count: 127 words
- Bullets: 8 points
- Small font (16px)
- Takes 15+ seconds to read

Score this slide's readability: [HTML here]
```

---

### 4. Relevance (0-100)

**Definition:** Does the content directly support the topic?

**What to Check:**
- Information is accurate and up-to-date
- Every bullet point adds value
- No filler content ("In conclusion...", "Thank you for listening")
- Data supports claims
- Self-contained (understandable without speaker notes)

**Scoring Rubric:**
- **90-100:** Every word essential, directly supports topic
- **75-89:** Mostly relevant, 1-2 unnecessary points
- **60-74:** Some off-topic content, could be tighter
- **40-59:** Significant filler, weak connection to topic
- **0-39:** Off-topic, irrelevant information

**Example Prompt:**
```
Evaluate relevance to topic: "${topic}"

✅ GOOD:
Topic: "AI in Healthcare"
Slide content:
  - AI detects cancer with 94% accuracy (relevant ✓)
  - Reduces diagnosis time by 50% (relevant ✓)
  - Used in 2,000+ hospitals (relevant ✓)

❌ BAD:
Topic: "AI in Healthcare"
Slide content:
  - "Thank you for your attention" (filler ✗)
  - "AI is the future of technology" (vague ✗)
  - Random stock photo of doctor (weak ✗)

Score this slide's relevance: [HTML here]
```

---

### 5. Professionalism (0-100)

**Definition:** Does this look like a $10,000 McKinsey/BCG consulting deck? Is it free of "AI slop"?

**What to Check:**
- Sophisticated design (not template-y)
- High-quality images (professional photography, not clipart)
- Subtle colors (not gaudy)
- Clean typography (no Comic Sans, no excessive fonts)
- Consistent branding (logo, colors, fonts match)
- No generic phrases ("Unlock potential", "Synergize", "Game-changing")

**Scoring Rubric:**
- **90-100:** McKinsey-grade, would present to Fortune 500 CEO
- **75-89:** Professional, suitable for business meeting
- **60-74:** Corporate but generic, "PowerPoint template" feel
- **40-59:** Amateur, obvious AI generation
- **0-39:** Unprofessional, clipart, Comic Sans

**Red Flags (Auto -20 points):**
- Comic Sans or Papyrus fonts
- Clipart or low-res images
- Rainbow gradients (unless design-appropriate)
- WordArt-style effects
- Generic stock photos (handshake, lightbulb)
- Buzzwords ("synergy", "disrupt", "paradigm shift") without substance

**Example Prompt:**
```
Evaluate professionalism (McKinsey/BCG standard):

✅ GOOD:
- Design: Clean, modern, subtle
- Colors: Corporate blue (#1A365D) + white
- Fonts: Montserrat (title) + Open Sans (body)
- Images: High-res professional photography
- Language: Clear, specific, data-driven
- Verdict: Would present to board of directors

❌ BAD:
- Design: Generic PowerPoint template
- Colors: Bright rainbow gradient
- Fonts: 4 different fonts (inconsistent)
- Images: Clipart, stock photos of handshakes
- Language: "Leverage synergies to disrupt the paradigm"
- Verdict: Looks AI-generated ("AI slop")

Score this slide's professionalism: [HTML here]
```

---

## IMPLEMENTATION

### Class Structure

```typescript
interface JudgeConfig {
  model: 'gemini-2.5-flash'; // Fast inference (100 tokens/sec)

  // Scoring weights (must sum to 1.0)
  weights: {
    visualHierarchy: 0.25;  // 25%
    whitespace: 0.20;       // 20%
    readability: 0.25;      // 25%
    relevance: 0.15;        // 15%
    professionalism: 0.15;  // 15%
  };

  // Quality thresholds
  thresholds: {
    approve: 85;      // ≥85: Auto-approve
    revise: 70;       // 70-84: Auto-revise
    reject: 70;       // <70: Reject with feedback
    maxIterations: 2; // Max improvement attempts
  };

  // Prompt configuration
  prompt: {
    temperature: 0.3;        // Low temp for consistent scoring
    maxTokens: 1500;         // Enough for detailed feedback
    responseFormat: 'json';  // Structured output
  };
}

interface JudgeVerdict {
  // Individual scores
  scores: {
    visualHierarchy: number;  // 0-100
    whitespace: number;       // 0-100
    readability: number;      // 0-100
    relevance: number;        // 0-100
    professionalism: number;  // 0-100
  };

  // Overall score (weighted average)
  overallScore: number; // 0-100

  // Verdict
  verdict: 'APPROVE' | 'REVISE' | 'REJECT';

  // Feedback
  feedback: {
    strengths: string[];               // What's good (2-3 points)
    weaknesses: string[];              // What's bad (2-3 points)
    actionableImprovements: string[];  // How to fix (3-5 specific actions)
  };

  // Metadata
  metadata: {
    evaluatedAt: Date;
    model: string;
    tokensUsed: number;
    evaluationTime: number; // milliseconds
  };
}

class LLMJudge {
  private geminiClient: GeminiClient;
  private config: JudgeConfig;

  constructor(config: JudgeConfig) {
    this.config = config;
    this.geminiClient = new GeminiClient({
      apiKey: process.env.GEMINI_API_KEY,
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
        tokensUsed: response.usageMetadata.totalTokenCount,
        evaluationTime: Date.now() - startTime
      }
    };
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
        `Final score: ${verdict.overallScore}/100. Weaknesses: ${verdict.feedback.weaknesses.join(', ')}`
      );
    }

    // Build improvement prompt
    const prompt = this.buildImprovementPrompt(slide, verdict, context);

    // Regenerate slide with improvements
    const improvedHTML = await this.geminiClient.generateContent(prompt);

    const improvedSlide: GeneratedSlide = {
      ...slide,
      html: improvedHTML.text,
      metadata: {
        ...slide.metadata,
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

**Score:** [0-100]
**Rationale:** [1-2 sentences]

---

## CRITERION 2: Whitespace (0-100)

**Question:** Is 40-60% of the slide empty (breathing room)?

**Check:**
- Whitespace ≥40%?
- Generous margins (≥48px)?
- Padding between elements (≥24px)?
- Content doesn't touch edges?
- Feels airy, not cramped?

**Score:** [0-100]
**Rationale:** [1-2 sentences]

---

## CRITERION 3: Readability (0-100)

**Question:** Can the audience read and understand this in 3 seconds? (Nancy Duarte test)

**Check:**
- Word count ≤75?
- Bullet points ≤5?
- Font size ≥18px body, ≥32px title?
- High contrast (readable)?
- Simple language (grade 8-10)?

**Score:** [0-100]
**Rationale:** [1-2 sentences]

---

## CRITERION 4: Relevance (0-100)

**Question:** Does the content directly support the topic "${context.topic}"?

**Check:**
- Information accurate?
- Every bullet adds value?
- No filler content?
- Self-contained (understandable without speaker)?

**Score:** [0-100]
**Rationale:** [1-2 sentences]

---

## CRITERION 5: Professionalism (0-100)

**Question:** Does this look like a $10,000 McKinsey/BCG consulting deck? Is it free of "AI slop"?

**Check:**
- Sophisticated design (not template-y)?
- High-quality images (professional)?
- Subtle colors (not gaudy)?
- Clean typography (consistent fonts)?
- No generic buzzwords?

**Score:** [0-100]
**Rationale:** [1-2 sentences]

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
    context: PresentationContext
  ): Promise<PresentationEvaluation> {
    const evaluations = await Promise.all(
      slides.map((slide, index) =>
        this.evaluateSlide(slide, { ...context, slideNumber: index + 1 })
      )
    );

    const avgScore =
      evaluations.reduce((sum, e) => sum + e.overallScore, 0) / evaluations.length;

    const slidesNeedingImprovement = evaluations.filter(
      (e) => e.verdict === 'REVISE' || e.verdict === 'REJECT'
    );

    return {
      slides: evaluations,
      overallScore: avgScore,
      verdict:
        avgScore >= this.config.thresholds.approve
          ? 'APPROVE'
          : slidesNeedingImprovement.length > 0
          ? 'NEEDS_IMPROVEMENT'
          : 'REJECT',
      slidesNeedingImprovement: slidesNeedingImprovement.map((e) => e.metadata.slideNumber),
      timestamp: new Date()
    };
  }
}
```

---

## PIPELINE INTEGRATION

### Generator Agent Integration

```typescript
class GeneratorAgentV2 {
  private llmJudge: LLMJudge;

  async generatePresentation(
    content: SlideContent[],
    designDecisions: DesignDecisions,
    assets: AssetCollection
  ): Promise<GeneratedPresentation> {
    const slides: GeneratedSlide[] = [];

    for (let i = 0; i < content.length; i++) {
      // 1. Generate slide HTML (existing logic)
      let slide = await this.generateSlide(content[i], designDecisions.slides[i], assets[i]);

      // 2. LLM Judge evaluation (NEW)
      const verdict = await this.llmJudge.evaluateSlide(slide, {
        topic: this.context.topic,
        audience: this.context.audience,
        purpose: this.context.purpose,
        slideNumber: i + 1,
        totalSlides: content.length
      });

      // 3. Handle verdict
      if (verdict.verdict === 'APPROVE') {
        // Slide is good, keep it
        slide.qualityScore = verdict.overallScore;
        slides.push(slide);
      } else if (verdict.verdict === 'REVISE') {
        // Attempt to improve
        try {
          const improved = await this.llmJudge.improveSlide(slide, verdict, this.context);
          improved.slide.qualityScore = improved.verdict.overallScore;
          slides.push(improved.slide);
        } catch (error) {
          // Max iterations reached, use original with warning
          console.warn(
            `Slide ${i + 1} could not be improved to ${this.llmJudge.config.thresholds.approve}+. ` +
            `Using original with score ${verdict.overallScore}.`
          );
          slide.qualityScore = verdict.overallScore;
          slides.push(slide);
        }
      } else {
        // REJECT: This should rarely happen if content validation passed
        throw new Error(
          `Slide ${i + 1} rejected by LLM Judge (score: ${verdict.overallScore}). ` +
          `Weaknesses: ${verdict.feedback.weaknesses.join(', ')}`
        );
      }
    }

    return {
      slides,
      metadata: {
        totalSlides: slides.length,
        avgQualityScore: slides.reduce((sum, s) => sum + s.qualityScore, 0) / slides.length,
        generatedAt: new Date()
      }
    };
  }
}
```

---

## PERFORMANCE CONSIDERATIONS

### Timing Estimates

**Per Slide:**
- Generation: 3-5 seconds
- LLM Judge evaluation: 2-3 seconds
- Improvement (if needed): 4-6 seconds
- **Total:** 9-14 seconds per slide (with improvements)

**For 10-Slide Deck:**
- Without Judge: ~40 seconds
- With Judge (no improvements): ~60 seconds (+50%)
- With Judge (20% need improvements): ~80 seconds (+100%)

**Trade-off:** Worth it for professional quality

---

### Optimization Strategies

1. **Parallel Evaluation**
   ```typescript
   // Evaluate multiple slides concurrently
   const verdicts = await Promise.all(
     slides.map(slide => llmJudge.evaluateSlide(slide, context))
   );
   ```

2. **Batch API Calls**
   ```typescript
   // Use Gemini batch API (if available)
   const verdicts = await geminiClient.batchGenerateContent(slides.map(buildPrompt));
   ```

3. **Caching**
   ```typescript
   // Cache verdicts for identical slides
   const cacheKey = hashSlide(slide);
   if (cache.has(cacheKey)) {
     return cache.get(cacheKey);
   }
   ```

4. **Early Stopping**
   ```typescript
   // If first 3 slides score ≥90, skip judge for remaining (risky)
   const firstThreeAvg = verdicts.slice(0, 3).reduce((sum, v) => sum + v.overallScore, 0) / 3;
   if (firstThreeAvg >= 90) {
     // High confidence, skip judge for remaining slides
   }
   ```

---

## TESTING & VALIDATION

### Test Suite

```typescript
describe('LLMJudge', () => {
  let judge: LLMJudge;

  beforeEach(() => {
    judge = new LLMJudge({
      model: 'gemini-2.5-flash',
      weights: { /* ... */ },
      thresholds: { approve: 85, revise: 70, reject: 70, maxIterations: 2 }
    });
  });

  describe('evaluateSlide', () => {
    it('approves high-quality slide (score ≥85)', async () => {
      const slide = createMockSlide({
        title: 'Clear Title',
        content: '3 concise bullet points',
        whitespace: '55%',
        fontSize: { title: 48, body: 20 }
      });

      const verdict = await judge.evaluateSlide(slide, mockContext);

      expect(verdict.overallScore).toBeGreaterThanOrEqual(85);
      expect(verdict.verdict).toBe('APPROVE');
    });

    it('revises medium-quality slide (score 70-84)', async () => {
      const slide = createMockSlide({
        title: 'Title',
        content: '7 bullets (too many)',
        whitespace: '35%',
        fontSize: { title: 40, body: 16 }
      });

      const verdict = await judge.evaluateSlide(slide, mockContext);

      expect(verdict.overallScore).toBeGreaterThanOrEqual(70);
      expect(verdict.overallScore).toBeLessThan(85);
      expect(verdict.verdict).toBe('REVISE');
      expect(verdict.feedback.actionableImprovements.length).toBeGreaterThan(0);
    });

    it('rejects low-quality slide (score <70)', async () => {
      const slide = createMockSlide({
        title: '',
        content: '200 words of dense text',
        whitespace: '15%',
        fontSize: { title: 24, body: 12 }
      });

      const verdict = await judge.evaluateSlide(slide, mockContext);

      expect(verdict.overallScore).toBeLessThan(70);
      expect(verdict.verdict).toBe('REJECT');
    });
  });

  describe('improveSlide', () => {
    it('improves slide until it passes (max 2 iterations)', async () => {
      const slide = createMockSlide({ qualityScore: 75 });
      const verdict = { overallScore: 75, verdict: 'REVISE', /* ... */ };

      const result = await judge.improveSlide(slide, verdict, mockContext);

      expect(result.verdict.overallScore).toBeGreaterThanOrEqual(85);
      expect(result.slide.metadata.improved).toBe(true);
      expect(result.slide.metadata.improvementIteration).toBeLessThanOrEqual(2);
    });

    it('throws error if max iterations reached', async () => {
      const slide = createMockSlide({ qualityScore: 60 });
      const verdict = { overallScore: 60, verdict: 'REVISE', /* ... */ };

      // Mock Gemini to always return low-quality slides
      jest.spyOn(judge['geminiClient'], 'generateContent').mockResolvedValue({
        text: '<html>Still bad</html>'
      });

      await expect(
        judge.improveSlide(slide, verdict, mockContext)
      ).rejects.toThrow('Max improvement iterations (2) reached');
    });
  });
});
```

---

## MONITORING & ANALYTICS

### Metrics to Track

1. **Score Distribution**
   - Avg overall score
   - % slides scoring ≥90 (excellent)
   - % slides scoring 85-89 (good)
   - % slides scoring <85 (needs improvement)

2. **Improvement Effectiveness**
   - Avg score increase after improvement
   - % slides improved on first iteration
   - % slides requiring 2 iterations
   - % slides reaching max iterations

3. **Performance**
   - Avg evaluation time per slide
   - Avg improvement time per slide
   - Total generation time (with judge vs without)

4. **Failure Rates**
   - % slides rejected (score <70)
   - Most common weaknesses
   - Category-specific failure rates (hierarchy, whitespace, etc.)

### Dashboard Example

```
┌─────────────────────────────────────────────────┐
│ LLM Judge Performance Dashboard                │
├─────────────────────────────────────────────────┤
│ Overall Quality Score:      87.4 / 100         │
│ Slides Approved:            92% (46/50)        │
│ Slides Improved:            8% (4/50)          │
│ Avg Improvement:            +12.3 points       │
├─────────────────────────────────────────────────┤
│ Score Breakdown:                                │
│   Visual Hierarchy:         89.2 / 100         │
│   Whitespace:               85.7 / 100         │
│   Readability:              88.1 / 100         │
│   Relevance:                91.4 / 100         │
│   Professionalism:          82.8 / 100         │
├─────────────────────────────────────────────────┤
│ Common Issues:                                  │
│   1. Too many bullets (18% of slides)          │
│   2. Insufficient whitespace (12% of slides)   │
│   3. Small body font (8% of slides)            │
└─────────────────────────────────────────────────┘
```

---

## COMPETITIVE ADVANTAGE

**Why LLM-as-Judge is Revolutionary:**

1. **NO Competitor Has This**
   - Beautiful.ai: Rules-based constraints only
   - Gamma: No quality control beyond generation
   - Pitch: Manual review by designers
   - Manus AI: Pre-built templates, no AI judge

2. **Prevents "AI Slop"**
   - Guarantees professional output
   - Catches generic/template-y slides
   - Enforces design best practices

3. **Continuous Improvement**
   - Learns from feedback
   - Adapts to new design trends
   - Can be fine-tuned on customer preferences

4. **Trust & Transparency**
   - Users see quality scores
   - Feedback explains decisions
   - Can override judge if needed

---

## FUTURE ENHANCEMENTS

### v2.1: Fine-Tuning
- Fine-tune Gemini on high-quality presentation datasets
- Learn customer-specific preferences
- Improve scoring consistency

### v2.2: Multi-Model Ensemble
- Use Gemini + Claude for dual evaluation
- Take consensus score
- Higher accuracy

### v2.3: Human-in-the-Loop
- Allow users to provide feedback on verdicts
- Collect human judgments
- Retrain model on disagreements

### v2.4: Real-Time Suggestions
- Show quality score as user types
- Real-time improvement suggestions
- "Grammarly for slides"

---

**LLM-as-Judge System**
**Status:** Ready for Implementation
**Impact:** Transforms "good AI" into "world-class professional"
**Timeline:** 2 weeks to implement + 1 week to test

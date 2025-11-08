/**
 * Research Agent
 * Performs web search and topic research for presentations
 */

import {
  ResearchResult,
  AgentTask,
  AgentError,
  GeminiResponse,
} from '../types/index.js';
import { getGeminiClient } from '../core/gemini-client.js';

/**
 * Research Agent for gathering information on topics
 */
export class ResearchAgent {
  private gemini = getGeminiClient();
  private taskHistory: AgentTask[] = [];

  /**
   * Research a topic for presentation content
   */
  async research(topic: string, depth: 'quick' | 'comprehensive' = 'quick'): Promise<ResearchResult> {
    const taskId = `research-${Date.now()}`;
    const task: AgentTask = {
      id: taskId,
      type: 'research',
      description: `Research topic: ${topic}`,
      priority: 'high',
      status: 'in_progress',
      input: { topic, depth },
      startTime: new Date(),
    };

    this.taskHistory.push(task);

    try {
      const prompt = this.buildResearchPrompt(topic, depth);
      const response = await this.gemini.generate({
        prompt,
        format: 'json',
        temperature: 0.7,
      });

      const result = this.parseResearchResult(response, topic);

      task.status = 'completed';
      task.output = result;
      task.endTime = new Date();

      return result;
    } catch (error) {
      task.status = 'failed';
      task.error = (error as Error).message;
      task.endTime = new Date();

      throw new AgentError(
        `Research failed for topic: ${topic}`,
        'research',
        { originalError: (error as Error).message }
      );
    }
  }

  /**
   * Build research prompt based on depth
   */
  private buildResearchPrompt(topic: string, depth: 'quick' | 'comprehensive'): string {
    const basePrompt = `You are a professional researcher. Research the topic: "${topic}"`;

    if (depth === 'quick') {
      return `${basePrompt}

Provide:
- A concise summary (2-3 sentences)
- 5-7 key points that would be valuable in a presentation
- 2-3 related topics worth exploring
- Confidence score (0-1) on the completeness of information

Return JSON:
{
  "topic": "${topic}",
  "summary": "Summary text",
  "keyPoints": ["Point 1", "Point 2", ...],
  "sources": ["Conceptual source 1", "Source 2"],
  "relatedTopics": ["Topic 1", "Topic 2"],
  "confidence": 0.85
}`;
    } else {
      return `${basePrompt}

Provide comprehensive research including:
- Detailed summary (4-6 sentences)
- 10-15 key points organized by category
- Historical context and current trends
- 5+ related topics and subtopics
- Expert perspectives
- Confidence score (0-1)

Return JSON:
{
  "topic": "${topic}",
  "summary": "Detailed summary",
  "keyPoints": ["Point 1", "Point 2", ...],
  "sources": ["Source 1", "Source 2", ...],
  "relatedTopics": ["Topic 1", "Topic 2", ...],
  "confidence": 0.9,
  "additionalContext": {
    "trends": ["Trend 1", "Trend 2"],
    "challenges": ["Challenge 1", "Challenge 2"],
    "opportunities": ["Opportunity 1", "Opportunity 2"]
  }
}`;
    }
  }

  /**
   * Parse Gemini response into ResearchResult
   */
  private parseResearchResult(response: GeminiResponse, topic: string): ResearchResult {
    try {
      const data = JSON.parse(response.content);

      return {
        topic: data.topic || topic,
        summary: data.summary || '',
        keyPoints: Array.isArray(data.keyPoints) ? data.keyPoints : [],
        sources: Array.isArray(data.sources) ? data.sources : [],
        relatedTopics: Array.isArray(data.relatedTopics) ? data.relatedTopics : [],
        confidence: typeof data.confidence === 'number' ? data.confidence : 0.7,
      };
    } catch (error) {
      throw new AgentError(
        'Failed to parse research results',
        'research',
        { parseError: (error as Error).message, rawContent: response.content }
      );
    }
  }

  /**
   * Validate topic before research
   */
  validateTopic(topic: string): { valid: boolean; reason?: string } {
    if (!topic || topic.trim().length === 0) {
      return { valid: false, reason: 'Topic cannot be empty' };
    }

    if (topic.length < 3) {
      return { valid: false, reason: 'Topic is too short (minimum 3 characters)' };
    }

    if (topic.length > 200) {
      return { valid: false, reason: 'Topic is too long (maximum 200 characters)' };
    }

    // Check for inappropriate content patterns
    const inappropriatePatterns = [
      /\b(hack|exploit|illegal|harmful)\b/i,
    ];

    for (const pattern of inappropriatePatterns) {
      if (pattern.test(topic)) {
        return { valid: false, reason: 'Topic contains inappropriate content' };
      }
    }

    return { valid: true };
  }

  /**
   * Enhance research with additional context
   */
  async enhanceResearch(
    initialResearch: ResearchResult,
    focusArea?: string
  ): Promise<ResearchResult> {
    const prompt = `Enhance this research with more depth${focusArea ? ` focusing on: ${focusArea}` : ''}

Initial Research:
Topic: ${initialResearch.topic}
Summary: ${initialResearch.summary}
Key Points: ${initialResearch.keyPoints.join(', ')}

Provide:
- Deeper insights
- More specific examples
- Additional key points
- Updated confidence score

Return enhanced research as JSON in the same format.`;

    const response = await this.gemini.generate({
      prompt,
      format: 'json',
      temperature: 0.6,
    });

    return this.parseResearchResult(response, initialResearch.topic);
  }

  /**
   * Research multiple related topics
   */
  async researchRelatedTopics(mainTopic: string, relatedTopics: string[]): Promise<Map<string, ResearchResult>> {
    const results = new Map<string, ResearchResult>();

    // Research main topic first
    const mainResult = await this.research(mainTopic, 'comprehensive');
    results.set(mainTopic, mainResult);

    // Research related topics in parallel (simulated - in production use Promise.all)
    for (const topic of relatedTopics.slice(0, 3)) {
      try {
        const result = await this.research(topic, 'quick');
        results.set(topic, result);
      } catch (error) {
        console.warn(`Failed to research related topic: ${topic}`, error);
      }
    }

    return results;
  }

  /**
   * Get task history for this agent
   */
  getTaskHistory(): AgentTask[] {
    return [...this.taskHistory];
  }

  /**
   * Get agent statistics
   */
  getStats() {
    const completed = this.taskHistory.filter(t => t.status === 'completed').length;
    const failed = this.taskHistory.filter(t => t.status === 'failed').length;
    const avgConfidence = this.taskHistory
      .filter(t => t.output && 'confidence' in t.output)
      .reduce((sum, t) => sum + ((t.output as ResearchResult).confidence || 0), 0) /
      Math.max(completed, 1);

    return {
      totalTasks: this.taskHistory.length,
      completed,
      failed,
      successRate: completed / Math.max(this.taskHistory.length, 1),
      averageConfidence: avgConfidence,
    };
  }

  /**
   * Clear task history
   */
  clearHistory(): void {
    this.taskHistory = [];
  }
}

/**
 * Singleton instance
 */
let researchAgentInstance: ResearchAgent | null = null;

/**
 * Get or create research agent instance
 */
export function getResearchAgent(): ResearchAgent {
  if (!researchAgentInstance) {
    researchAgentInstance = new ResearchAgent();
  }
  return researchAgentInstance;
}

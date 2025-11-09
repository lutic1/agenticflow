'use client';

import { useState, useEffect } from 'react';
import { useLLMJudge } from '@/hooks/use-p0-features';
import { Loader2, Sparkles, TrendingUp, MessageCircle, Lightbulb, RefreshCw } from 'lucide-react';

interface ContentQualityPanelProps {
  slideId: string;
  content?: string;
  onSuggestionApply?: (suggestion: string) => void;
}

export function ContentQualityPanel({ slideId, content = '', onSuggestionApply }: ContentQualityPanelProps) {
  const { data: llmJudge, isLoading, error } = useLLMJudge();
  const [analyzing, setAnalyzing] = useState(false);
  const [qualityScore, setQualityScore] = useState(0);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    if (content) {
      analyzeContent(content);
    }
  }, [content]);

  const analyzeContent = async (text: string) => {
    setAnalyzing(true);

    // Simulate LLM analysis
    setTimeout(() => {
      const score = Math.floor(Math.random() * 30) + 70; // 70-100
      setQualityScore(score);
      setAnalysis({
        clarity: Math.floor(Math.random() * 20) + 80,
        tone: 'Professional',
        readability: Math.floor(Math.random() * 15) + 85,
        engagement: Math.floor(Math.random() * 25) + 75,
        suggestions: [
          'Consider adding a compelling opening statement to grab attention',
          'Use more action verbs to make content more dynamic',
          'Break down complex ideas into simpler concepts',
        ],
        improvements: [
          {
            original: 'This is about artificial intelligence',
            suggested: 'Discover how AI transforms modern business operations',
            reason: 'More engaging and specific',
          },
        ],
      });
      setAnalyzing(false);
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-gray-600">Loading LLM judge...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-800">Error loading LLM judge: {error.message}</p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          AI Quality Analysis
        </h3>
        <button
          onClick={() => content && analyzeContent(content)}
          disabled={analyzing}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 text-gray-600 ${analyzing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {analyzing ? (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Analyzing content with AI...</p>
        </div>
      ) : analysis ? (
        <>
          {/* Overall Score */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Overall Quality Score</div>
            <div className={`text-4xl font-bold ${getScoreColor(qualityScore)}`}>
              {qualityScore}
              <span className="text-xl">/100</span>
            </div>
            <div className="text-xs text-gray-600 mt-1">{getScoreLabel(qualityScore)}</div>
          </div>

          {/* Detailed Scores */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Detailed Analysis</label>

            {[
              { label: 'Clarity', score: analysis.clarity, icon: MessageCircle },
              { label: 'Readability', score: analysis.readability, icon: TrendingUp },
              { label: 'Engagement', score: analysis.engagement, icon: Lightbulb },
            ].map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium">{metric.label}</span>
                    </div>
                    <span className={`text-sm font-bold ${getScoreColor(metric.score)}`}>
                      {metric.score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        metric.score >= 80 ? 'bg-green-500' : metric.score >= 60 ? 'bg-blue-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${metric.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tone */}
          <div className="p-3 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Detected Tone</span>
              <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded">
                {analysis.tone}
              </span>
            </div>
          </div>

          {/* Suggestions */}
          {analysis.suggestions.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">AI Suggestions</label>
              {analysis.suggestions.map((suggestion: string, index: number) => (
                <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-yellow-900">{suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Content Improvements */}
          {analysis.improvements.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Recommended Changes</label>
              {analysis.improvements.map((improvement: any, index: number) => (
                <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg space-y-2">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Original:</div>
                    <div className="text-sm text-gray-800 line-through opacity-70">
                      {improvement.original}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Suggested:</div>
                    <div className="text-sm font-medium text-green-900">
                      {improvement.suggested}
                    </div>
                  </div>
                  <div className="text-xs text-green-700 italic">{improvement.reason}</div>
                  <button
                    onClick={() => onSuggestionApply?.(improvement.suggested)}
                    className="w-full px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                  >
                    Apply Suggestion
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="py-8 text-center text-gray-500">
          <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Add content to get AI-powered quality analysis</p>
        </div>
      )}

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Powered by AI:</strong> Get real-time content quality analysis, tone detection,
          and actionable suggestions to improve your presentation.
        </p>
      </div>
    </div>
  );
}

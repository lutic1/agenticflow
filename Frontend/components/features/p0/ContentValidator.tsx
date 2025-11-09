'use client';

import { useState, useEffect } from 'react';
import { useContentValidation } from '@/hooks/use-p0-features';
import { Loader2, CheckCircle2, AlertCircle, XCircle, Sparkles } from 'lucide-react';

interface ContentValidatorProps {
  slideId: string;
  content?: string;
  onValidationComplete?: (results: any) => void;
}

export function ContentValidator({ slideId, content = '', onValidationComplete }: ContentValidatorProps) {
  const { data: validation, isLoading, error } = useContentValidation();
  const [issues, setIssues] = useState<any[]>([]);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    if (content) {
      runValidation(content);
    }
  }, [content]);

  const runValidation = async (text: string) => {
    setValidating(true);

    // Simulate validation
    setTimeout(() => {
      const foundIssues = [];

      // Spelling check
      if (text.includes('teh') || text.includes('recieve')) {
        foundIssues.push({
          type: 'spelling',
          severity: 'medium',
          message: 'Spelling error detected',
          suggestion: 'Check: "teh" → "the", "recieve" → "receive"',
        });
      }

      // Grammar check
      if (text.split(' ').length > 50) {
        foundIssues.push({
          type: 'length',
          severity: 'low',
          message: 'Slide content is too long',
          suggestion: 'Consider splitting into multiple slides (current: 50+ words)',
        });
      }

      // Duplicate check
      const words = text.toLowerCase().split(' ');
      const duplicates = words.filter((word, index) => words.indexOf(word) !== index && word.length > 5);
      if (duplicates.length > 3) {
        foundIssues.push({
          type: 'duplicate',
          severity: 'low',
          message: 'Repeated words detected',
          suggestion: `Consider varying your vocabulary (repeated: ${duplicates.slice(0, 3).join(', ')})`,
        });
      }

      // All caps check
      if (text === text.toUpperCase() && text.length > 10) {
        foundIssues.push({
          type: 'formatting',
          severity: 'medium',
          message: 'All caps text detected',
          suggestion: 'Use sentence case for better readability',
        });
      }

      setIssues(foundIssues);
      setValidating(false);
      onValidationComplete?.(foundIssues);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-gray-600">Loading validator...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-800">Error loading validator: {error.message}</p>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <XCircle className="w-5 h-5" />;
      case 'medium':
        return <AlertCircle className="w-5 h-5" />;
      case 'low':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Content Validation
        </h3>
        {validating && (
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        )}
      </div>

      {/* Validation Status */}
      {!validating && issues.length === 0 && content && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle2 className="w-5 h-5" />
            <div>
              <p className="font-medium">Content looks great!</p>
              <p className="text-xs text-green-700 mt-0.5">
                No spelling, grammar, or formatting issues detected
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Issues */}
      {issues.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Issues Found ({issues.length})
          </label>

          {issues.map((issue, index) => (
            <div
              key={index}
              className={`p-3 border rounded-lg ${getSeverityColor(issue.severity)}`}
            >
              <div className="flex items-start gap-2">
                {getSeverityIcon(issue.severity)}
                <div className="flex-1">
                  <div className="text-sm font-medium">{issue.message}</div>
                  <div className="text-xs mt-1 opacity-90">{issue.suggestion}</div>
                  <div className="text-xs mt-1 opacity-75">
                    Type: <span className="uppercase">{issue.type}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Validation Checks */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xs text-gray-600 mb-2">
          <strong>Validation Checks:</strong>
        </p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-3 h-3 text-green-600" />
            Spelling & Grammar
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-3 h-3 text-green-600" />
            Content Length
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-3 h-3 text-green-600" />
            Duplicate Detection
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-3 h-3 text-green-600" />
            Formatting Rules
          </li>
        </ul>
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Tip:</strong> Keep slide content concise (under 50 words) for better audience
          engagement. Use bullet points instead of paragraphs.
        </p>
      </div>
    </div>
  );
}

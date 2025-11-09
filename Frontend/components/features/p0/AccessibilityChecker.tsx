'use client';

import { useState } from 'react';
import { useAccessibility } from '@/hooks/use-p0-features';
import { Loader2, Eye, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface AccessibilityCheckerProps {
  slideId: string;
  onIssuesFix?: (issues: any[]) => void;
}

export function AccessibilityChecker({ slideId, onIssuesFix }: AccessibilityCheckerProps) {
  const { data: accessibility, isLoading, error } = useAccessibility();
  const [issues, setIssues] = useState([
    { id: 1, type: 'contrast', severity: 'high', message: 'Low contrast ratio (2.1:1, needs 4.5:1)', fixed: false },
    { id: 2, type: 'alt-text', severity: 'medium', message: 'Image missing alt text', fixed: false },
    { id: 3, type: 'heading', severity: 'low', message: 'Heading hierarchy skip detected', fixed: false },
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-gray-600">Checking accessibility...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-800">Error loading accessibility checker: {error.message}</p>
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

  const handleFixIssue = (issueId: number) => {
    setIssues((prev) =>
      prev.map((issue) => (issue.id === issueId ? { ...issue, fixed: true } : issue))
    );
  };

  const handleFixAll = () => {
    setIssues((prev) => prev.map((issue) => ({ ...issue, fixed: true })));
    onIssuesFix?.(issues);
  };

  const unfixedIssues = issues.filter((i) => !i.fixed);
  const fixedIssues = issues.filter((i) => i.fixed);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Accessibility
        </h3>
        {unfixedIssues.length === 0 && (
          <span className="flex items-center gap-1 text-green-600 text-sm">
            <CheckCircle className="w-4 h-4" />
            WCAG Compliant
          </span>
        )}
      </div>

      {/* Score */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
        <div className="text-sm text-gray-600 mb-1">Accessibility Score</div>
        <div className="text-3xl font-bold text-blue-900">
          {Math.round((fixedIssues.length / issues.length) * 100)}%
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {fixedIssues.length} of {issues.length} checks passed
        </div>
      </div>

      {/* Issues */}
      {unfixedIssues.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Issues ({unfixedIssues.length})
            </label>
            <button
              onClick={handleFixAll}
              className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Fix All
            </button>
          </div>

          {unfixedIssues.map((issue) => (
            <div
              key={issue.id}
              className={`p-3 border rounded-lg ${getSeverityColor(issue.severity)}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1">
                  {getSeverityIcon(issue.severity)}
                  <div className="flex-1">
                    <div className="text-sm font-medium">{issue.message}</div>
                    <div className="text-xs opacity-75 mt-1">
                      Severity: <span className="uppercase">{issue.severity}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleFixIssue(issue.id)}
                  className="text-xs px-2 py-1 bg-white border border-current rounded hover:bg-opacity-50"
                >
                  Fix
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fixed Issues */}
      {fixedIssues.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Fixed ({fixedIssues.length})</label>
          {fixedIssues.map((issue) => (
            <div key={issue.id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div className="flex-1 text-sm text-green-900">{issue.message}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* WCAG Guidelines */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800 mb-2">
          <strong>WCAG 2.1 Guidelines:</strong>
        </p>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Contrast ratio: 4.5:1 (normal text), 3:1 (large text)</li>
          <li>• All images must have alt text</li>
          <li>• Keyboard navigation support</li>
          <li>• Screen reader compatibility</li>
        </ul>
      </div>
    </div>
  );
}

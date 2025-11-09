'use client';

import { useState } from 'react';
import { useTextOverflow } from '@/hooks/use-p0-features';
import { Loader2, AlertTriangle, Type, FileText } from 'lucide-react';

interface TextOverflowManagerProps {
  slideId: string;
  onStrategyChange?: (strategy: string) => void;
}

export function TextOverflowManager({ slideId, onStrategyChange }: TextOverflowManagerProps) {
  const { data: overflowStrategy, isLoading, error } = useTextOverflow();
  const [selectedStrategy, setSelectedStrategy] = useState<string>('truncate');
  const [textOverflowing, setTextOverflowing] = useState(true);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-gray-600">Loading overflow settings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-800">Error loading overflow settings: {error.message}</p>
      </div>
    );
  }

  const strategies = [
    {
      id: 'truncate',
      name: 'Truncate with Ellipsis',
      description: 'Cut text and add "..."',
      icon: Type,
    },
    {
      id: 'resize',
      name: 'Auto-Resize Font',
      description: 'Reduce font size to fit',
      icon: Type,
    },
    {
      id: 'split',
      name: 'Split to New Slide',
      description: 'Create additional slide',
      icon: FileText,
    },
    {
      id: 'fade',
      name: 'Fade Out',
      description: 'Fade at the bottom',
      icon: Type,
    },
  ];

  const handleStrategySelect = (strategyId: string) => {
    setSelectedStrategy(strategyId);
    onStrategyChange?.(strategyId);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Text Overflow</h3>
        {textOverflowing && (
          <div className="flex items-center gap-1 text-orange-600">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs">Overflow detected</span>
          </div>
        )}
      </div>

      {/* Overflow Detection */}
      {textOverflowing && (
        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800 font-medium mb-2">
            Text overflow detected on slide {slideId}
          </p>
          <p className="text-xs text-orange-700">
            Your content is too long for the current slide layout. Choose a strategy below to fix this.
          </p>
        </div>
      )}

      {/* Strategy Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Overflow Strategy</label>
        <div className="space-y-2">
          {strategies.map((strategy) => {
            const Icon = strategy.icon;
            const isSelected = selectedStrategy === strategy.id;

            return (
              <button
                key={strategy.id}
                onClick={() => handleStrategySelect(strategy.id)}
                className={`w-full p-3 border-2 rounded-lg transition-all text-left hover:border-blue-400 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 mt-0.5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                  <div className="flex-1">
                    <div className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                      {strategy.name}
                    </div>
                    <div className="text-xs text-gray-500">{strategy.description}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Apply Button */}
      <button
        onClick={() => onStrategyChange?.(selectedStrategy)}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Apply Strategy
      </button>

      {/* Preview */}
      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-white">
        <p className="text-xs text-gray-500 mb-2">Preview ({selectedStrategy}):</p>
        {selectedStrategy === 'truncate' && (
          <p className="text-sm">This is a long text that will be truncated...</p>
        )}
        {selectedStrategy === 'resize' && (
          <p className="text-xs">This is a long text that has been resized to fit the available space in the slide layout.</p>
        )}
        {selectedStrategy === 'split' && (
          <div className="space-y-2">
            <p className="text-sm">Slide 1: First part of content</p>
            <p className="text-sm text-gray-400">Slide 2: Remaining content →</p>
          </div>
        )}
        {selectedStrategy === 'fade' && (
          <div className="relative">
            <p className="text-sm">
              This is a long text that will fade out at the bottom to indicate more content...
            </p>
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
          </div>
        )}
      </div>
    </div>
  );
}

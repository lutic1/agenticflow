'use client';

import { useState } from 'react';
import { useBasicTransitions } from '@/hooks/use-p0-features';
import { Loader2, Sparkles, ArrowRight, ZoomIn, RotateCw } from 'lucide-react';

interface TransitionSelectorProps {
  slideId: string;
  onTransitionChange?: (transition: any) => void;
}

export function TransitionSelector({ slideId, onTransitionChange }: TransitionSelectorProps) {
  const { data: transitions, isLoading, error } = useBasicTransitions();
  const [selectedTransition, setSelectedTransition] = useState('fade');
  const [duration, setDuration] = useState(500);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-gray-600">Loading transitions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-800">Error loading transitions: {error.message}</p>
      </div>
    );
  }

  const transitionTypes = [
    { id: 'fade', name: 'Fade', icon: Sparkles, description: 'Smooth fade transition' },
    { id: 'slide', name: 'Slide', icon: ArrowRight, description: 'Slide from right' },
    { id: 'zoom', name: 'Zoom', icon: ZoomIn, description: 'Zoom in effect' },
    { id: 'flip', name: 'Flip', icon: RotateCw, description: '3D flip transition' },
  ];

  const durations = [
    { value: 300, label: 'Fast (0.3s)' },
    { value: 500, label: 'Normal (0.5s)' },
    { value: 800, label: 'Slow (0.8s)' },
    { value: 1200, label: 'Very Slow (1.2s)' },
  ];

  const handleTransitionSelect = (transitionId: string) => {
    setSelectedTransition(transitionId);
    onTransitionChange?.({ type: transitionId, duration });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Transitions
        </h3>
      </div>

      {/* Transition Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Transition Type</label>
        <div className="grid grid-cols-2 gap-2">
          {transitionTypes.map((transition) => {
            const Icon = transition.icon;
            const isSelected = selectedTransition === transition.id;

            return (
              <button
                key={transition.id}
                onClick={() => handleTransitionSelect(transition.id)}
                className={`p-3 border-2 rounded-lg transition-all hover:border-blue-400 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                  <div className="text-center">
                    <div className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                      {transition.name}
                    </div>
                    <div className="text-xs text-gray-500">{transition.description}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Duration */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Duration</label>
        <div className="grid grid-cols-2 gap-2">
          {durations.map((dur) => {
            const isSelected = duration === dur.value;

            return (
              <button
                key={dur.value}
                onClick={() => {
                  setDuration(dur.value);
                  onTransitionChange?.({ type: selectedTransition, duration: dur.value });
                }}
                className={`p-2 border-2 rounded-lg transition-all text-sm ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-blue-400 text-gray-900'
                }`}
              >
                {dur.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview Button */}
      <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
        Preview Transition
      </button>

      {/* Animation Preview */}
      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 overflow-hidden">
        <p className="text-xs text-gray-500 mb-3">Preview:</p>
        <div className="relative h-24 bg-white rounded border border-gray-200">
          <div
            className={`absolute inset-0 flex items-center justify-center text-sm font-medium transition-all ${
              selectedTransition === 'fade' ? 'opacity-100' : ''
            } ${
              selectedTransition === 'slide' ? 'transform translate-x-0' : ''
            } ${
              selectedTransition === 'zoom' ? 'transform scale-100' : ''
            } ${
              selectedTransition === 'flip' ? 'transform rotateY-0' : ''
            }`}
            style={{ transitionDuration: `${duration}ms` }}
          >
            Slide Content
          </div>
        </div>
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Tip:</strong> Use subtle transitions (fade, slide) for professional presentations.
          Save dramatic effects (zoom, flip) for creative or casual settings.
        </p>
      </div>
    </div>
  );
}

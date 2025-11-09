'use client';

import { useState } from 'react';
import { useSlideDuplication } from '@/hooks/use-p1-features';
import { Loader2, Plus, Trash2, Copy } from 'lucide-react';

interface SlideManagerProps {
  presentationId: string;
}

export function SlideManager({ presentationId }: SlideManagerProps) {
  const { slides, isLoading, error, duplicateSlide } = useSlideDuplication(presentationId);
  const [selectedSlides, setSelectedSlides] = useState<Set<string>>(new Set());

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-gray-600">Loading slides...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-800">Error loading slides</p>
      </div>
    );
  }

  if (!slides || slides.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">No slides available</p>
      </div>
    );
  }

  const toggleSlideSelection = (slideId: string) => {
    const newSelected = new Set(selectedSlides);
    if (newSelected.has(slideId)) {
      newSelected.delete(slideId);
    } else {
      newSelected.add(slideId);
    }
    setSelectedSlides(newSelected);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Slides</h3>
        <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedSlides.size > 0 && (
        <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm text-blue-800">
            {selectedSlides.size} selected
          </span>
          <button className="ml-auto p-2 hover:bg-blue-100 rounded-lg transition-colors">
            <Copy className="w-4 h-4 text-blue-600" />
          </button>
          <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}

      {/* Slide Thumbnails */}
      <div className="space-y-2">
        {slides.map((slide) => {
          const isSelected = selectedSlides.has(slide.id);

          return (
            <div
              key={slide.id}
              onClick={() => toggleSlideSelection(slide.id)}
              className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-24 h-16 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-400">
                    {slide.order}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    Slide {slide.order}
                  </div>
                  <div className="text-xs text-gray-500">
                    {slide.content?.title || 'Untitled'}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateSlide(slide.id);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

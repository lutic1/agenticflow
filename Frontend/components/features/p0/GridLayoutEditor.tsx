'use client';

import { useState } from 'react';
import { useGridLayout } from '@/hooks/use-p0-features';
import { Loader2, Grid3x3, Columns2, Columns3, LayoutGrid } from 'lucide-react';

interface GridLayoutEditorProps {
  slideId: string;
  onLayoutChange?: (layout: string) => void;
}

export function GridLayoutEditor({ slideId, onLayoutChange }: GridLayoutEditorProps) {
  const { data: gridSystem, isLoading, error } = useGridLayout();
  const [selectedLayout, setSelectedLayout] = useState<string>('2-col');

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-gray-600">Loading grid layouts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-800">Error loading grid layouts: {error.message}</p>
      </div>
    );
  }

  if (!gridSystem) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">No grid layouts available</p>
      </div>
    );
  }

  const layouts = [
    { id: '1-col', name: '1 Column', icon: Columns2, description: 'Single column layout' },
    { id: '2-col', name: '2 Columns', icon: Columns2, description: 'Two equal columns' },
    { id: '3-col', name: '3 Columns', icon: Columns3, description: 'Three equal columns' },
    { id: '1-2-col', name: '1-2 Column', icon: LayoutGrid, description: '1/3 and 2/3 split' },
    { id: '2-1-col', name: '2-1 Column', icon: LayoutGrid, description: '2/3 and 1/3 split' },
    { id: 'grid-4', name: '4 Grid', icon: Grid3x3, description: '2x2 grid' },
  ];

  const handleLayoutSelect = (layoutId: string) => {
    setSelectedLayout(layoutId);
    onLayoutChange?.(layoutId);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Grid Layout</h3>
        <span className="text-xs text-gray-500">Slide: {slideId}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {layouts.map((layout) => {
          const Icon = layout.icon;
          const isSelected = selectedLayout === layout.id;

          return (
            <button
              key={layout.id}
              onClick={() => handleLayoutSelect(layout.id)}
              className={`p-3 border-2 rounded-lg transition-all hover:border-blue-400 ${
                isSelected
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <Icon
                  className={`w-8 h-8 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`}
                />
                <div className="text-center">
                  <div className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                    {layout.name}
                  </div>
                  <div className="text-xs text-gray-500">{layout.description}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Tip:</strong> Grid layouts automatically adjust content to fit the selected
          structure. Try different layouts to find the best fit for your content.
        </p>
      </div>
    </div>
  );
}

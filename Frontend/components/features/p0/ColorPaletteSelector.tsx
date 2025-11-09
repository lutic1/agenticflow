'use client';

import { useState } from 'react';
import { useColorPalettes } from '@/hooks/use-p0-features';
import { Loader2, Palette, Check } from 'lucide-react';

interface ColorPaletteSelectorProps {
  presentationId: string;
  onPaletteChange?: (palette: any) => void;
}

export function ColorPaletteSelector({ presentationId, onPaletteChange }: ColorPaletteSelectorProps) {
  const { data: palettes, isLoading, error } = useColorPalettes();
  const [selectedPalette, setSelectedPalette] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-gray-600">Loading color palettes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-800">Error loading palettes: {error.message}</p>
      </div>
    );
  }

  if (!palettes || palettes.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">No color palettes available</p>
      </div>
    );
  }

  const predefinedPalettes = [
    {
      id: 'professional',
      name: 'Professional',
      colors: ['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'],
    },
    {
      id: 'vibrant',
      name: 'Vibrant',
      colors: ['#dc2626', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'],
    },
    {
      id: 'earthy',
      name: 'Earthy',
      colors: ['#78350f', '#92400e', '#b45309', '#d97706', '#f59e0b'],
    },
    {
      id: 'ocean',
      name: 'Ocean',
      colors: ['#0c4a6e', '#0369a1', '#0284c7', '#0ea5e9', '#38bdf8'],
    },
    {
      id: 'sunset',
      name: 'Sunset',
      colors: ['#7c2d12', '#c2410c', '#ea580c', '#f97316', '#fb923c'],
    },
    {
      id: 'nature',
      name: 'Nature',
      colors: ['#14532d', '#166534', '#15803d', '#16a34a', '#22c55e'],
    },
  ];

  const handlePaletteSelect = (paletteId: string, colors: string[]) => {
    setSelectedPalette(paletteId);
    onPaletteChange?.({ id: paletteId, colors });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Color Palettes
        </h3>
      </div>

      <div className="space-y-3">
        {predefinedPalettes.map((palette) => {
          const isSelected = selectedPalette === palette.id;

          return (
            <button
              key={palette.id}
              onClick={() => handlePaletteSelect(palette.id, palette.colors)}
              className={`w-full p-3 border-2 rounded-lg transition-all hover:border-blue-400 ${
                isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                  {palette.name}
                </span>
                {isSelected && (
                  <Check className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div className="flex gap-2">
                {palette.colors.map((color, index) => (
                  <div
                    key={index}
                    className="flex-1 h-8 rounded border border-gray-200"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {selectedPalette && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Applied:</strong> {predefinedPalettes.find((p) => p.id === selectedPalette)?.name} palette
          </p>
        </div>
      )}

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Tip:</strong> Choose a color palette that matches your presentation's tone and
          audience. Professional for business, vibrant for creative topics.
        </p>
      </div>
    </div>
  );
}

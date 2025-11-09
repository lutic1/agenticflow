'use client';

import { useState } from 'react';
import { useTypography } from '@/hooks/use-p0-features';
import { Loader2, Type, AlignLeft, Bold } from 'lucide-react';

interface TypographyControlsProps {
  slideId: string;
  onTypographyChange?: (config: any) => void;
}

export function TypographyControls({ slideId, onTypographyChange }: TypographyControlsProps) {
  const { data: typeScale, isLoading, error } = useTypography();
  const [selectedFont, setSelectedFont] = useState('Inter');
  const [selectedSize, setSelectedSize] = useState('body');
  const [selectedWeight, setSelectedWeight] = useState('normal');

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-gray-600">Loading typography...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-800">Error loading typography: {error.message}</p>
      </div>
    );
  }

  if (!typeScale) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">No typography settings available</p>
      </div>
    );
  }

  const fonts = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Playfair Display',
    'Merriweather',
  ];

  const sizes = [
    { id: 'h1', label: 'Heading 1', size: '48px' },
    { id: 'h2', label: 'Heading 2', size: '36px' },
    { id: 'h3', label: 'Heading 3', size: '28px' },
    { id: 'body', label: 'Body', size: '16px' },
    { id: 'small', label: 'Small', size: '14px' },
  ];

  const weights = [
    { id: 'light', label: 'Light', value: '300' },
    { id: 'normal', label: 'Normal', value: '400' },
    { id: 'medium', label: 'Medium', value: '500' },
    { id: 'semibold', label: 'Semibold', value: '600' },
    { id: 'bold', label: 'Bold', value: '700' },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Type className="w-5 h-5" />
          Typography
        </h3>
      </div>

      {/* Font Family */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Font Family</label>
        <select
          value={selectedFont}
          onChange={(e) => {
            setSelectedFont(e.target.value);
            onTypographyChange?.({ font: e.target.value, size: selectedSize, weight: selectedWeight });
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {fonts.map((font) => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Size</label>
        <div className="grid grid-cols-2 gap-2">
          {sizes.map((size) => (
            <button
              key={size.id}
              onClick={() => {
                setSelectedSize(size.id);
                onTypographyChange?.({ font: selectedFont, size: size.id, weight: selectedWeight });
              }}
              className={`p-2 border-2 rounded-lg transition-all text-left ${
                selectedSize === size.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-400'
              }`}
            >
              <div className={`text-sm font-medium ${selectedSize === size.id ? 'text-blue-900' : 'text-gray-900'}`}>
                {size.label}
              </div>
              <div className="text-xs text-gray-500">{size.size}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Font Weight */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Weight</label>
        <div className="grid grid-cols-3 gap-2">
          {weights.map((weight) => (
            <button
              key={weight.id}
              onClick={() => {
                setSelectedWeight(weight.id);
                onTypographyChange?.({ font: selectedFont, size: selectedSize, weight: weight.id });
              }}
              className={`p-2 border-2 rounded-lg transition-all ${
                selectedWeight === weight.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-400'
              }`}
            >
              <div
                className={`text-sm text-center ${selectedWeight === weight.id ? 'text-blue-900' : 'text-gray-900'}`}
                style={{ fontWeight: weight.value }}
              >
                {weight.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-white">
        <p className="text-xs text-gray-500 mb-2">Preview:</p>
        <p
          style={{
            fontFamily: selectedFont,
            fontSize: sizes.find((s) => s.id === selectedSize)?.size || '16px',
            fontWeight: weights.find((w) => w.id === selectedWeight)?.value || '400',
          }}
        >
          The quick brown fox jumps over the lazy dog
        </p>
      </div>
    </div>
  );
}

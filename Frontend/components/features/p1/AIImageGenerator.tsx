'use client';

import { useState } from 'react';
import { useAIImageGeneration } from '@/hooks/use-p1-features';
import { Loader2, Sparkles, Download } from 'lucide-react';
import Image from 'next/image';

interface AIImageGeneratorProps {
  slideId: string;
}

export function AIImageGenerator({ slideId }: AIImageGeneratorProps) {
  const { generateImage, isGenerating, generatedImage } = useAIImageGeneration();
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<'256x256' | '512x512' | '1024x1024'>('512x512');

  const handleGenerate = () => {
    if (!prompt) return;
    generateImage({ prompt, size });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">AI Image Generator</h3>
        <Sparkles className="w-5 h-5 text-purple-500" />
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            Describe your image
          </label>
          <textarea
            placeholder="E.g., A futuristic city skyline at sunset with flying cars..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 resize-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            Image Size
          </label>
          <div className="flex gap-2">
            {(['256x256', '512x512', '1024x1024'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`flex-1 py-2 px-3 border-2 rounded-lg text-sm transition-colors ${
                  size === s
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-medium'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!prompt || isGenerating}
          className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Image</span>
            </>
          )}
        </button>
      </div>

      {generatedImage && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="relative aspect-square bg-gray-100">
            <Image
              src={generatedImage.url}
              alt={generatedImage.prompt}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-3 bg-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-600 truncate flex-1">
              {generatedImage.prompt}
            </p>
            <button className="ml-2 p-2 hover:bg-gray-200 rounded-lg transition-colors">
              <Download className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <p className="text-xs text-purple-800">
          <strong>Powered by DALL-E 3:</strong> Generate unique images from text descriptions.
        </p>
      </div>
    </div>
  );
}

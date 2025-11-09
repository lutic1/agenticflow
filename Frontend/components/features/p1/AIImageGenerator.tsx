/**
 * IMPROVED AI Image Generator Component
 *
 * Changes from original:
 * 1. Added AIBadge at top to clearly mark as AI-powered
 * 2. Added gradient background to differentiate from manual tools
 * 3. Changed header icon to Sparkles (was Sparkles before, now more prominent)
 * 4. Added pulsing animation to AI badge
 * 5. Improved visual hierarchy
 * 6. Better spacing (8px grid)
 */

'use client';

import { useState } from 'react';
import { useAIImageGeneration } from '@/hooks/use-p1-features';
import { Loader2, Sparkles, Download, Zap } from 'lucide-react';
import Image from 'next/image';
import { AIBadge } from '@/components/ui/AIBadge';
import { Button } from '@/components/ui/button';

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
    // Gradient background container
    <div className="relative overflow-hidden">
      {/* Subtle gradient background to differentiate from manual tools */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/70 via-transparent to-blue-50/70 -z-10" />

      <div className="p-6 space-y-6">
        {/* Header with AI Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Image Generator</h3>
              <p className="text-xs text-gray-600">Powered by DALL-E 3</p>
            </div>
          </div>
          <AIBadge variant="default" glow>
            AI POWERED
          </AIBadge>
        </div>

        {/* Info Banner */}
        <div className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <Zap className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-purple-900 mb-1">AI-Powered Image Generation</p>
            <p className="text-xs text-purple-700">
              Describe your vision and our AI will generate a unique image in seconds.
            </p>
          </div>
        </div>

        {/* Prompt Input */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900">
            Describe your image
            <span className="ml-2 text-xs font-normal text-gray-500">(be specific for best results)</span>
          </label>
          <textarea
            placeholder="E.g., A futuristic city skyline at sunset with flying cars and neon lights..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 resize-none transition-all"
          />
        </div>

        {/* Size Selector */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900">Image Size</label>
          <div className="grid grid-cols-3 gap-2">
            {(['256x256', '512x512', '1024x1024'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`py-2.5 px-3 border-2 rounded-lg text-sm font-medium transition-all ${
                  size === s
                    ? 'border-purple-600 bg-gradient-to-br from-purple-50 to-blue-50 text-purple-900 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button - AI Variant */}
        <Button
          variant="ai"
          size="lg"
          onClick={handleGenerate}
          disabled={!prompt || isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating with AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Image with AI</span>
            </>
          )}
        </Button>

        {/* Generated Image Preview */}
        {generatedImage && (
          <div className="space-y-3 animate-fade-in">
            <div className="relative rounded-lg overflow-hidden border-2 border-purple-200 shadow-lg">
              <div className="relative aspect-square bg-gray-100">
                <Image
                  src={generatedImage.url}
                  alt={generatedImage.prompt}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-t border-purple-200">
                <p className="text-xs text-gray-700 mb-2 line-clamp-2">
                  <strong>Prompt:</strong> {generatedImage.prompt}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    /* Download logic */
                  }}
                >
                  <Download className="w-4 h-4" />
                  <span>Download Image</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs font-semibold text-blue-900 mb-2">💡 Pro Tips:</p>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Be specific about style, lighting, and mood</li>
            <li>• Include details like "photorealistic" or "minimalist illustration"</li>
            <li>• Larger sizes take longer but provide better quality</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

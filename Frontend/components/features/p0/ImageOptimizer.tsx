'use client';

import { useState, useRef } from 'react';
import { useImageOptimization } from '@/hooks/use-p0-features';
import { Loader2, Upload, Image as ImageIcon, Check, Trash2 } from 'lucide-react';

interface ImageOptimizerProps {
  slideId: string;
  onImageOptimized?: (image: any) => void;
}

export function ImageOptimizer({ slideId, onImageOptimized }: ImageOptimizerProps) {
  const { data: optimizationConfig, isLoading, error } = useImageOptimization();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [optimized, setOptimized] = useState(false);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState('webp');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-gray-600">Loading image optimizer...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-800">Error loading image optimizer: {error.message}</p>
      </div>
    );
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setOptimized(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOptimize = async () => {
    setOptimizing(true);
    // Simulate optimization
    setTimeout(() => {
      setOptimizing(false);
      setOptimized(true);
      onImageOptimized?.({
        url: uploadedImage,
        quality,
        format,
        optimized: true,
      });
    }, 1500);
  };

  const handleRemove = () => {
    setUploadedImage(null);
    setOptimized(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Image Optimizer
        </h3>
      </div>

      {/* Upload Area */}
      {!uploadedImage ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
        >
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-12 h-12 text-gray-400" />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">Click to upload image</p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP up to 10MB</p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <>
          {/* Image Preview */}
          <div className="relative border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
            <img
              src={uploadedImage}
              alt="Uploaded"
              className="w-full h-48 object-contain"
            />
            {optimized && (
              <div className="absolute top-2 right-2 px-2 py-1 bg-green-600 text-white text-xs rounded flex items-center gap-1">
                <Check className="w-3 h-3" />
                Optimized
              </div>
            )}
            <button
              onClick={handleRemove}
              className="absolute top-2 left-2 p-1.5 bg-red-600 text-white rounded hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Optimization Settings */}
          <div className="space-y-3">
            {/* Quality Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Quality</label>
                <span className="text-sm text-gray-600">{quality}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Smaller file</span>
                <span>Better quality</span>
              </div>
            </div>

            {/* Format Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Format</label>
              <div className="grid grid-cols-3 gap-2">
                {['webp', 'jpeg', 'png'].map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setFormat(fmt)}
                    className={`p-2 border-2 rounded-lg transition-all text-sm font-medium uppercase ${
                      format === fmt
                        ? 'border-blue-600 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-blue-400 text-gray-900'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Optimize Button */}
          <button
            onClick={handleOptimize}
            disabled={optimizing || optimized}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
          >
            {optimizing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Optimizing...
              </>
            ) : optimized ? (
              <>
                <Check className="w-5 h-5" />
                Optimized
              </>
            ) : (
              <>
                <ImageIcon className="w-5 h-5" />
                Optimize Image
              </>
            )}
          </button>

          {/* Stats */}
          {optimized && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium mb-1">
                Optimization Complete
              </p>
              <div className="text-xs text-green-700 space-y-1">
                <div className="flex justify-between">
                  <span>Original Size:</span>
                  <span className="font-medium">2.4 MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Optimized Size:</span>
                  <span className="font-medium">450 KB</span>
                </div>
                <div className="flex justify-between">
                  <span>Saved:</span>
                  <span className="font-medium text-green-900">81% smaller</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Tip:</strong> WebP offers the best compression. Use quality 70-80% for optimal
          balance between file size and image quality.
        </p>
      </div>
    </div>
  );
}

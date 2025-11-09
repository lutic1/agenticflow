'use client';

import { useCallback } from 'react';
import { useCustomFonts } from '@/hooks/use-p1-features';
import { useDropzone } from 'react-dropzone';
import { Loader2, Upload, Type, Trash2 } from 'lucide-react';

interface FontUploaderProps {
  presentationId: string;
}

export function FontUploader({ presentationId }: FontUploaderProps) {
  const { fonts, isLoading, uploadFont, isUploading } = useCustomFonts(presentationId);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        uploadFont(file);
      });
    },
    [uploadFont]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'font/ttf': ['.ttf'],
      'font/otf': ['.otf'],
      'font/woff': ['.woff'],
      'font/woff2': ['.woff2'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-gray-600">Loading fonts...</span>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Custom Fonts</h3>
        <Type className="w-5 h-5 text-gray-400" />
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
        {isDragActive ? (
          <p className="text-sm text-blue-600">Drop font files here...</p>
        ) : (
          <div>
            <p className="text-sm text-gray-700 mb-1">
              Drag and drop font files, or click to browse
            </p>
            <p className="text-xs text-gray-500">
              Supports .ttf, .otf, .woff, .woff2 (max 5MB)
            </p>
          </div>
        )}
      </div>

      {isUploading && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span className="text-sm text-blue-800">Uploading font...</span>
        </div>
      )}

      {/* Font List */}
      {fonts && fonts.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Uploaded Fonts</div>
          {fonts.map((font) => (
            <div
              key={font.id}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
            >
              <div>
                <div className="text-sm font-medium text-gray-900">{font.name}</div>
                <div className="text-xs text-gray-500">{font.family}</div>
              </div>
              <button
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Delete font"
              >
                <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-600" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Tip:</strong> Uploaded fonts will be available in the typography controls.
        </p>
      </div>
    </div>
  );
}

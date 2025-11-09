/**
 * Design Importer Component (P2.7)
 * Import designs from Figma and Sketch
 */

'use client';

import { useState } from 'react';
import { useDesignImport } from '@/hooks/use-p2-features';
import { ExternalLink, Download, CheckCircle, Loader2, Image } from 'lucide-react';

export function DesignImporter() {
  const { data: importFeature, isLoading } = useDesignImport();
  const [isConnected, setIsConnected] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedFrames, setSelectedFrames] = useState<Set<string>>(new Set());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!importFeature) {
    return null;
  }

  const handleConnect = async () => {
    try {
      await importFeature.connectFigma();
      setIsConnected(true);
      const figmaFiles = await importFeature.getFigmaFiles();
      setFiles(figmaFiles);
    } catch (error) {
      console.error('Failed to connect to Figma:', error);
    }
  };

  const handleImport = async () => {
    if (!selectedFile || selectedFrames.size === 0) return;

    try {
      for (const frameId of selectedFrames) {
        await importFeature.importFrame(selectedFile, frameId);
      }
      // Success feedback
      setSelectedFrames(new Set());
    } catch (error) {
      console.error('Failed to import frames:', error);
    }
  };

  const toggleFrame = (frameId: string) => {
    const newSelection = new Set(selectedFrames);
    if (newSelection.has(frameId)) {
      newSelection.delete(frameId);
    } else {
      newSelection.add(frameId);
    }
    setSelectedFrames(newSelection);
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-gray-200">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
          <ExternalLink className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Connect to Figma
        </h3>
        <p className="text-sm text-gray-600 text-center mb-6 max-w-md">
          Import your Figma designs directly into your presentations.
          We'll convert frames to slides while preserving your styles.
        </p>
        <button
          onClick={handleConnect}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium"
        >
          <ExternalLink className="w-5 h-5" />
          Connect Figma Account
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-sm text-gray-600">Connected to Figma</span>
        </div>
        <button
          onClick={() => setIsConnected(false)}
          className="text-sm text-purple-600 hover:text-purple-700"
        >
          Disconnect
        </button>
      </div>

      {/* File Browser */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Your Figma Files</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file) => (
            <button
              key={file.id}
              onClick={() => setSelectedFile(file.id)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedFile === file.id
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={file.thumbnail}
                alt={file.name}
                className="w-full h-32 object-cover rounded mb-2"
              />
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {file.frames.length} frames
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Frame Selection */}
      {selectedFile && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">
            Select Frames to Import
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            {files
              .find((f) => f.id === selectedFile)
              ?.frames.map((frame: any) => (
                <div
                  key={frame.id}
                  className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedFrames.has(frame.id)
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleFrame(frame.id)}
                >
                  {selectedFrames.has(frame.id) && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="w-full h-32 bg-gray-100 rounded mb-2 flex items-center justify-center">
                    <Image className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {frame.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {frame.width} × {frame.height}
                  </p>
                </div>
              ))}
          </div>

          {selectedFrames.size > 0 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                {selectedFrames.size} frame{selectedFrames.size !== 1 ? 's' : ''} selected
              </p>
              <button
                onClick={handleImport}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Import Selected Frames
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

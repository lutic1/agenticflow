/**
 * 3D Animation Editor Component (P2.1)
 * Create and edit 3D animations using Three.js
 *
 * NOTE: This component should be lazy loaded due to Three.js bundle size
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useThreeDAnimation } from '@/hooks/use-p2-features';
import { Box, Sphere, Cylinder, Upload, Play, Download, Sun, Camera, Loader2 } from 'lucide-react';

export function ThreeDAnimationEditor({ slideId }: { slideId: string }) {
  const { data: threeDFeature, isLoading } = useThreeDAnimation();
  const [scene, setScene] = useState<any>(null);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!threeDFeature || !canvasRef.current) return;

    // Initialize 3D scene
    const newScene = threeDFeature.createScene();
    setScene(newScene);

    // TODO: Setup Three.js renderer
    // This would normally initialize the WebGL context and start rendering loop
  }, [threeDFeature]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-2" />
        <p className="text-sm text-gray-600">Loading 3D editor...</p>
      </div>
    );
  }

  if (!threeDFeature) {
    return null;
  }

  const handleAddPrimitive = async (type: 'cube' | 'sphere' | 'cylinder') => {
    // Add primitive shape to scene
    console.log('Adding primitive:', type);
  };

  const handleUploadModel = async (file: File) => {
    if (!scene) return;
    try {
      await threeDFeature.addModel(scene.id, file);
    } catch (error) {
      console.error('Failed to upload model:', error);
    }
  };

  const handleExportGIF = async () => {
    if (!scene) return;
    try {
      const blob = await threeDFeature.exportGIF(scene.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `animation-${slideId}.gif`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export GIF:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
        <div className="flex gap-1">
          <button
            onClick={() => handleAddPrimitive('cube')}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            title="Add Cube"
          >
            <Box className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleAddPrimitive('sphere')}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            title="Add Sphere"
          >
            <Sphere className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleAddPrimitive('cylinder')}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            title="Add Cylinder"
          >
            <Cylinder className="w-5 h-5" />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300" />

        <label className="p-2 hover:bg-gray-100 rounded-md transition-colors cursor-pointer">
          <Upload className="w-5 h-5" />
          <input
            type="file"
            accept=".gltf,.glb"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUploadModel(file);
            }}
            className="hidden"
          />
        </label>

        <div className="w-px h-6 bg-gray-300" />

        <button
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          title="Camera Controls"
        >
          <Camera className="w-5 h-5" />
        </button>
        <button
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          title="Lighting"
        >
          <Sun className="w-5 h-5" />
        </button>

        <div className="flex-1" />

        <button
          className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
        >
          <Play className="w-4 h-4" />
          Preview
        </button>
        <button
          onClick={handleExportGIF}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
        >
          <Download className="w-4 h-4" />
          Export GIF
        </button>
      </div>

      {/* 3D Canvas */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ height: '500px' }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
        <div className="absolute bottom-4 left-4 text-white text-xs bg-black/50 px-2 py-1 rounded">
          Drag to rotate • Scroll to zoom
        </div>
      </div>

      {/* Properties Panel */}
      {selectedObject && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Object Properties</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position X
              </label>
              <input
                type="range"
                min="-10"
                max="10"
                step="0.1"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position Y
              </label>
              <input
                type="range"
                min="-10"
                max="10"
                step="0.1"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position Z
              </label>
              <input
                type="range"
                min="-10"
                max="10"
                step="0.1"
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Animation Timeline */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Animation Timeline</h3>
        <div className="h-24 bg-gray-50 rounded border border-gray-200 flex items-center justify-center text-gray-400 text-sm">
          Keyframe timeline (coming soon)
        </div>
      </div>
    </div>
  );
}

/**
 * AR Presentation Mode Component (P2.2)
 * Present slides in Augmented Reality using WebXR
 *
 * NOTE: This component should be lazy loaded and check for device support
 */

'use client';

import { useState, useEffect } from 'react';
import { useARPresentation } from '@/hooks/use-p2-features';
import { Smartphone, Users, QrCode, X, Loader2, AlertCircle } from 'lucide-react';

interface ARPresentationModeProps {
  presentationId: string;
  slides: any[];
}

export function ARPresentationMode({ presentationId, slides }: ARPresentationModeProps) {
  const { data: arFeature, isLoading } = useARPresentation();
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [session, setSession] = useState<any>(null);
  const [shareUrl, setShareUrl] = useState<string>('');

  useEffect(() => {
    if (!arFeature) return;

    // Check if AR is supported on this device
    const supported = arFeature.checkSupport();
    setIsSupported(supported);
  }, [arFeature]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!arFeature) {
    return null;
  }

  if (isSupported === false) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-yellow-50 rounded-lg border border-yellow-200">
        <AlertCircle className="w-12 h-12 text-yellow-600 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          AR Not Supported
        </h3>
        <p className="text-sm text-gray-600 text-center max-w-md">
          Your device doesn't support WebXR for augmented reality.
          Try accessing this on a mobile device with AR capabilities.
        </p>
      </div>
    );
  }

  const handleStartAR = async () => {
    try {
      const newSession = await arFeature.startSession();
      setSession(newSession);

      // Generate share URL for multi-user AR
      const url = await arFeature.shareSession(newSession.id);
      setShareUrl(url);
    } catch (error) {
      console.error('Failed to start AR session:', error);
    }
  };

  const handlePlaceSlide = (position: [number, number, number]) => {
    if (!session) return;
    arFeature.placeSlide(session.id, position);
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-gray-200">
        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
          <Smartphone className="w-10 h-10 text-purple-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          AR Presentation Mode
        </h3>
        <p className="text-sm text-gray-600 text-center mb-6 max-w-md">
          Present your slides in augmented reality. Place slides in your physical space
          and walk around them. Perfect for immersive presentations!
        </p>

        <div className="flex flex-col gap-3 w-full max-w-sm">
          <button
            onClick={handleStartAR}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium"
          >
            <Smartphone className="w-5 h-5" />
            Start AR Session
          </button>

          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">Requirements:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>✓ iOS 12+ or Android 9+</li>
              <li>✓ ARCore/ARKit support</li>
              <li>✓ Camera permission</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* AR Session Active */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <div>
              <p className="font-semibold text-gray-900">AR Session Active</p>
              <p className="text-sm text-gray-600">
                {session.participants} participant{session.participants !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSession(null)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">AR Controls</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <span className="text-sm text-gray-700">Tap surface to place slide</span>
            <span className="text-xs text-gray-500">Single tap</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <span className="text-sm text-gray-700">Pinch to scale slide</span>
            <span className="text-xs text-gray-500">Two fingers</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <span className="text-sm text-gray-700">Swipe to change slide</span>
            <span className="text-xs text-gray-500">Horizontal swipe</span>
          </div>
        </div>
      </div>

      {/* Share Session */}
      {shareUrl && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Multi-User Session</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Share this QR code for others to join your AR session:
          </p>
          <div className="flex flex-col items-center gap-3">
            <div className="w-48 h-48 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
              <QrCode className="w-32 h-32 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 font-mono">{shareUrl}</p>
          </div>
        </div>
      )}

      {/* Slide Navigator */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Slides</h3>
        <div className="grid grid-cols-4 gap-2">
          {slides.map((slide, index) => (
            <button
              key={index}
              className="aspect-video bg-gray-100 rounded border-2 border-transparent hover:border-purple-600 transition-colors"
            >
              <span className="text-xs text-gray-600">{index + 1}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

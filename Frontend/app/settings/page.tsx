/**
 * Settings Page
 * Configure P2 experimental features
 */

'use client';

import { useState } from 'react';
import { useToggleP2Feature } from '@/hooks/use-p2-features';
import { useP2Feature } from '@backend/frontend-integration/hooks/use-backend';
import { Settings, Zap, Loader2 } from 'lucide-react';
import type { P2FeatureId } from '@backend/frontend-integration/types/backend';

interface P2Feature {
  id: P2FeatureId;
  name: string;
  description: string;
  warning?: string;
}

const p2Features: P2Feature[] = [
  {
    id: 'voice-narration',
    name: 'Voice Narration',
    description: 'Text-to-speech for slides with multiple voice options',
  },
  {
    id: 'api-access',
    name: 'API Access',
    description: 'Programmatic access to Slide Designer features',
  },
  {
    id: 'interactive-elements',
    name: 'Interactive Elements',
    description: 'Polls, quizzes, and Q&A sessions in presentations',
  },
  {
    id: 'themes-marketplace',
    name: 'Themes Marketplace',
    description: 'Browse and purchase professional themes',
  },
  {
    id: '3d-animations',
    name: '3D Animations',
    description: 'Three.js powered 3D objects and animations',
    warning: 'Large download (~600KB). May impact performance.',
  },
  {
    id: 'design-import',
    name: 'Figma/Sketch Import',
    description: 'Import designs directly from Figma',
  },
  {
    id: 'ar-presentation',
    name: 'AR Presentation Mode',
    description: 'Present slides in augmented reality using WebXR',
    warning: 'Requires AR-capable device (iOS 12+ or Android 9+)',
  },
  {
    id: 'blockchain-nft',
    name: 'Blockchain NFTs',
    description: 'Mint presentations as NFTs on Ethereum',
    warning: 'Requires crypto wallet and ETH for gas fees',
  },
];

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>
        <p className="text-gray-600">
          Configure your Slide Designer experience
        </p>
      </div>

      {/* Experimental Features Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-purple-50 border-b border-purple-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Experimental Features
            </h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Enable beta features. These may be unstable or change without notice.
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {p2Features.map((feature) => (
            <FeatureToggle key={feature.id} feature={feature} />
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Experimental features are in active development.
          They may have bugs or incomplete functionality. Use at your own discretion.
        </p>
      </div>
    </div>
  );
}

function FeatureToggle({ feature }: { feature: P2Feature }) {
  const { data, isLoading } = useP2Feature(feature.id);
  const { enable, disable, isEnabling, isDisabling } = useToggleP2Feature(feature.id);
  const [isExpanded, setIsExpanded] = useState(false);

  const isEnabled = !isLoading && !!data;
  const isUpdating = isEnabling || isDisabling;

  const handleToggle = () => {
    if (isEnabled) {
      disable();
    } else {
      enable();
    }
  };

  return (
    <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">{feature.name}</h3>
            {isEnabled && (
              <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                BETA
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">{feature.description}</p>
          {feature.warning && isExpanded && (
            <div className="mt-2 flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
              <span className="font-semibold">⚠</span>
              <span>{feature.warning}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {feature.warning && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-yellow-600 hover:text-yellow-700"
            >
              {isExpanded ? 'Less' : 'Info'}
            </button>
          )}

          <button
            onClick={handleToggle}
            disabled={isLoading || isUpdating}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              isEnabled ? 'bg-purple-600' : 'bg-gray-200'
            }`}
          >
            <span className="sr-only">Toggle {feature.name}</span>
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
            {isUpdating && (
              <Loader2 className="absolute inset-0 m-auto w-4 h-4 animate-spin text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

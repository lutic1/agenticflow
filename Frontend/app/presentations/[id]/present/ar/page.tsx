/**
 * AR Presentation Mode Page (P2.2)
 * Present slides in augmented reality
 */

'use client';

import dynamic from 'next/dynamic';
import { FeatureFlagGuard } from '@/components/FeatureFlagGuard';
import { Loader2 } from 'lucide-react';

// Lazy load AR component due to WebXR library size
const ARPresentationMode = dynamic(
  () => import('@/components/features/p2').then((mod) => ({ default: mod.ARPresentationMode })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
          <p className="text-gray-600">Loading AR mode...</p>
        </div>
      </div>
    ),
  }
);

interface ARPresentationPageProps {
  params: {
    id: string;
  };
}

export default function ARPresentationPage({ params }: ARPresentationPageProps) {
  // TODO: Fetch presentation data
  const mockSlides = Array.from({ length: 10 }, (_, i) => ({ id: i }));

  return (
    <div className="min-h-screen bg-gray-50">
      <FeatureFlagGuard feature="ar-presentation">
        <div className="container mx-auto px-4 py-8">
          <ARPresentationMode
            presentationId={params.id}
            slides={mockSlides}
          />
        </div>
      </FeatureFlagGuard>
    </div>
  );
}

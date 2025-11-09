/**
 * API Documentation Page (P2.6)
 * Developer portal for API access
 */

'use client';

import { APIAccessPanel } from '@/components/features/p2';
import { FeatureFlagGuard } from '@/components/FeatureFlagGuard';

export default function APIDocsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <FeatureFlagGuard feature="api-access">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Developer API
          </h1>
          <p className="text-lg text-gray-600">
            Programmatic access to Slide Designer features
          </p>
        </div>

        <APIAccessPanel />
      </FeatureFlagGuard>
    </div>
  );
}

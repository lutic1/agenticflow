/**
 * Feature Flag Guard Component
 * Conditionally renders children based on feature availability
 * Shows BETA badge for experimental features
 */

'use client';

import { ReactNode } from 'react';
import { useP2Feature } from '@backend/frontend-integration/hooks/use-backend';
import type { P2FeatureId } from '@backend/frontend-integration/types/backend';

interface FeatureFlagGuardProps {
  feature: P2FeatureId;
  children: ReactNode;
  fallback?: ReactNode;
  showBetaBadge?: boolean;
}

export function FeatureFlagGuard({
  feature,
  children,
  fallback = null,
  showBetaBadge = true,
}: FeatureFlagGuardProps) {
  const { data, isLoading, error } = useP2Feature(feature);

  // Don't render if feature is not available
  if (isLoading) {
    return <div className="animate-pulse bg-gray-100 rounded p-4">Loading feature...</div>;
  }

  if (error || !data) {
    return <>{fallback}</>;
  }

  return (
    <div className="relative">
      {showBetaBadge && <BetaBadge />}
      {children}
    </div>
  );
}

function BetaBadge() {
  return (
    <div className="absolute top-0 right-0 z-10">
      <span className="inline-flex items-center gap-1 text-xs font-medium bg-purple-100 text-purple-700 px-2 py-1 rounded-md shadow-sm">
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        BETA
      </span>
    </div>
  );
}

/**
 * Hook to check if a P2 feature is enabled
 */
export function useIsP2FeatureEnabled(feature: P2FeatureId): boolean {
  const { data, isLoading } = useP2Feature(feature);
  return !isLoading && !!data;
}

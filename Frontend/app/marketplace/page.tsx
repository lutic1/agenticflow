/**
 * Themes Marketplace Page (P2.5)
 * Browse and purchase presentation themes
 */

'use client';

import { ThemesMarketplace } from '@/components/features/p2';
import { FeatureFlagGuard } from '@/components/FeatureFlagGuard';

export default function MarketplacePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <FeatureFlagGuard feature="themes-marketplace">
        <ThemesMarketplace />
      </FeatureFlagGuard>
    </div>
  );
}

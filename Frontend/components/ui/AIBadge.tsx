/**
 * AI Badge Component
 *
 * Purpose: Clearly differentiate AI-powered features from manual tools
 * Usage: Add to all LLM-based features (AI Image Gen, Voice Narration, LLM Judge)
 *
 * Features:
 * - Gradient background (purple to blue)
 * - Sparkle icon
 * - Custom text support
 * - Multiple variants (default, compact, large)
 * - Glow effect on hover
 */

'use client';

import { Sparkles } from 'lucide-react';

type AIBadgeVariant = 'default' | 'compact' | 'large';

interface AIBadgeProps {
  children?: React.ReactNode;
  variant?: AIBadgeVariant;
  className?: string;
  showIcon?: boolean;
  glow?: boolean;
}

export function AIBadge({
  children = 'AI POWERED',
  variant = 'default',
  className = '',
  showIcon = true,
  glow = false,
}: AIBadgeProps) {
  const variants = {
    compact: 'px-2 py-0.5 text-[10px] gap-1',
    default: 'px-2.5 py-1 text-xs gap-1.5',
    large: 'px-3 py-1.5 text-sm gap-2',
  };

  const iconSizes = {
    compact: 'w-2.5 h-2.5',
    default: 'w-3 h-3',
    large: 'w-4 h-4',
  };

  return (
    <div
      className={`
        inline-flex items-center justify-center
        ${variants[variant]}
        bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600
        text-white rounded-full font-bold tracking-wide
        shadow-md
        ${glow ? 'shadow-purple-500/40 hover:shadow-purple-500/60' : ''}
        transition-shadow duration-300
        ${className}
      `}
    >
      {showIcon && <Sparkles className={`${iconSizes[variant]} animate-pulse`} />}
      <span>{children}</span>
    </div>
  );
}

/**
 * AI Feature Badge - Larger badge with tooltip support (backward compatibility)
 */
interface AIFeatureBadgeProps {
  feature?: string;
  variant?: AIBadgeVariant;
  showIcon?: boolean;
  glow?: boolean;
}

export function AIFeatureBadge({
  feature = 'AI-Powered',
  variant = 'default',
  showIcon = true,
  glow = false,
}: AIFeatureBadgeProps) {
  return <AIBadge variant={variant} showIcon={showIcon} glow={glow}>{feature}</AIBadge>;
}

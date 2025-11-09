/**
 * AI Badge Component
 * Displays a visual indicator for AI-powered features
 * Used to differentiate LLM-based features from standard UI tools
 */

'use client';

import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIBadgeProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Custom className */
  className?: string;
  /** Show icon */
  showIcon?: boolean;
  /** Show text label */
  showText?: boolean;
  /** Animate on hover */
  animate?: boolean;
}

export function AIBadge({
  size = 'sm',
  className,
  showIcon = true,
  showText = true,
  animate = true,
}: AIBadgeProps) {
  const sizeStyles = {
    sm: 'text-xs px-1.5 py-0.5 gap-1',
    md: 'text-sm px-2 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-md',
        sizeStyles[size],
        animate && 'transition-all hover:shadow-lg hover:scale-105',
        className
      )}
    >
      {showIcon && (
        <Sparkles
          className={cn(
            iconSizes[size],
            animate && 'animate-pulse'
          )}
        />
      )}
      {showText && <span>AI</span>}
    </span>
  );
}

/**
 * AI Feature Badge - Larger badge with tooltip support
 */
interface AIFeatureBadgeProps extends AIBadgeProps {
  /** Feature name */
  feature?: string;
}

export function AIFeatureBadge({
  feature = 'AI-Powered',
  ...props
}: AIFeatureBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2">
      <AIBadge {...props} />
      {feature && (
        <span className="text-xs text-gray-500 font-medium">{feature}</span>
      )}
    </div>
  );
}

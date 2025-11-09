/**
 * Centralized Button Component
 *
 * Purpose: Consistent button styling across the application
 *
 * Variants:
 * - primary: Main actions (Export, Save)
 * - secondary: Default buttons
 * - ghost: Subtle actions (Cancel, Close)
 * - danger: Destructive actions (Delete)
 * - ai: AI-powered features (with gradient)
 *
 * Sizes: sm, md, lg, xl
 *
 * Features:
 * - Icon support (left or right)
 * - Loading state
 * - Disabled state
 * - Full width option
 * - Keyboard shortcuts display
 */

'use client';

import { Loader2 } from 'lucide-react';
import { forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'ai';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  shortcut?: string;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      icon,
      iconRight,
      loading = false,
      fullWidth = false,
      shortcut,
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:
        'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-md hover:shadow-lg',
      secondary:
        'bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 border border-gray-300',
      ghost:
        'hover:bg-gray-100 active:bg-gray-200 text-gray-600 hover:text-gray-900',
      danger:
        'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-md',
      ai: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 active:from-purple-800 active:to-blue-800 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50',
    };

    const sizes = {
      sm: 'px-2 py-1 text-xs gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2.5',
      xl: 'px-8 py-4 text-lg gap-3',
    };

    const iconSizes = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
      xl: 'w-6 h-6',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center
          rounded-lg font-medium
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? 'w-full' : ''}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
          hover:scale-102 active:scale-95
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <Loader2 className={`${iconSizes[size]} animate-spin`} />
        ) : icon ? (
          <span className={iconSizes[size]}>{icon}</span>
        ) : null}

        <span>{children}</span>

        {iconRight && !loading && (
          <span className={iconSizes[size]}>{iconRight}</span>
        )}

        {shortcut && !loading && (
          <kbd className="ml-2 px-1.5 py-0.5 bg-black/10 rounded text-[10px] font-mono">
            {shortcut}
          </kbd>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

/**
 * Usage Examples:
 *
 * // Primary action
 * <Button variant="primary" size="lg" icon={<Download />}>
 *   Export Presentation
 * </Button>
 *
 * // AI-powered feature
 * <Button variant="ai" icon={<Sparkles />} loading={isGenerating}>
 *   Generate Image
 * </Button>
 *
 * // Secondary with keyboard shortcut
 * <Button variant="secondary" icon={<Save />} shortcut="Ctrl+S">
 *   Save
 * </Button>
 *
 * // Ghost button (subtle)
 * <Button variant="ghost" size="sm">
 *   Cancel
 * </Button>
 *
 * // Danger button
 * <Button variant="danger" icon={<Trash />}>
 *   Delete Slide
 * </Button>
 *
 * // Full width
 * <Button variant="primary" fullWidth>
 *   Continue
 * </Button>
 */

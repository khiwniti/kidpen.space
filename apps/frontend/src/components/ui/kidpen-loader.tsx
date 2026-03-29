'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface KidpenLoaderProps {
  /**
   * Size preset for the loader
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  /**
   * Animation speed multiplier (affects spin duration)
   * @default 1.2
   */
  speed?: number;
  /**
   * Custom size in pixels (overrides size preset)
   */
  customSize?: number;
  /**
   * Additional className for the container
   */
  className?: string;
  /**
   * Additional style for the container
   */
  style?: React.CSSProperties;
  /**
   * Whether the animation should autoPlay
   * @default true
   */
  autoPlay?: boolean;
  /**
   * Whether the animation should loop
   * @default true
   */
  loop?: boolean;
  /**
   * Force a specific loader variant (overrides auto-detection)
   * - 'white': White loader (for dark backgrounds)
   * - 'black': Black loader (for light backgrounds)
   * - 'gold': Gold/brand loader (Kidpen brand color)
   * - 'auto': Auto-detect based on theme (default)
   */
  variant?: 'white' | 'black' | 'gold' | 'auto';
  /**
   * @deprecated Use 'variant' instead
   */
  forceTheme?: 'light' | 'dark';
}

const SIZE_MAP = {
  small: 20,
  medium: 40,
  large: 80,
  xlarge: 120,
} as const;

/**
 * KidpenLoader - A unified circular loading animation component
 *
 * Uses a CSS-based circular spinner that adapts to light/dark themes.
 * Features Kidpen brand gold color option.
 *
 * **Automatic Behavior:**
 * - Light mode → Black loader (for white backgrounds)
 * - Dark mode → White loader (for dark backgrounds)
 *
 * **Manual Override (for special cases):**
 * Use the `variant` prop when the background doesn't match the theme.
 * For example, a dark button in light mode needs `variant="white"`.
 *
 * @example
 * ```tsx
 * // Auto-themed (default)
 * <KidpenLoader />
 *
 * // Kidpen brand gold (for special emphasis)
 * <KidpenLoader variant="gold" />
 *
 * // Always white (for dark backgrounds in any theme)
 * <KidpenLoader variant="white" />
 *
 * // Custom size
 * <KidpenLoader size="large" />
 * ```
 */
export function KidpenLoader({
  size = 'medium',
  speed = 1.2,
  customSize,
  className,
  style,
  autoPlay = true,
  loop = true,
  variant = 'auto',
  forceTheme, // deprecated, but kept for backwards compatibility
}: KidpenLoaderProps) {
  const { resolvedTheme } = useTheme();
  const loaderSize = customSize || SIZE_MAP[size];

  // Track mounted state to prevent hydration mismatch
  const [mounted, setMounted] = React.useState(false);

  // Set mounted on client
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Determine which variant to use
  let effectiveVariant: 'white' | 'black' | 'gold';

  if (variant !== 'auto') {
    // Explicit variant set
    effectiveVariant = variant;
  } else if (forceTheme) {
    // Backwards compatibility with forceTheme
    effectiveVariant = forceTheme === 'dark' ? 'white' : 'black';
  } else {
    // Auto-detect from theme
    const isDark = (resolvedTheme || 'dark') === 'dark';
    effectiveVariant = isDark ? 'white' : 'black';
  }

  // Calculate border width based on size (roughly 1/16 of the size, min 2px)
  const borderWidth = Math.max(2, Math.round(loaderSize / 16));

  // Calculate animation duration based on speed (lower = faster)
  const animationDuration = 0.8 / speed;

  // Colors based on variant - Kidpen brand colors
  const getColors = () => {
    switch (effectiveVariant) {
      case 'gold':
        return {
          border: 'rgba(245, 166, 35, 0.2)',  // Kidpen gold with opacity
          spinner: '#F5A623',  // Kidpen brand gold
        };
      case 'white':
        return {
          border: 'rgba(255, 255, 255, 0.15)',
          spinner: '#ffffff',
        };
      case 'black':
      default:
        return {
          border: 'rgba(0, 0, 0, 0.1)',
          spinner: '#1A1B2E',  // Kidpen text primary
        };
    }
  };

  const colors = getColors();

  // Don't render during SSR - render a placeholder instead
  if (!mounted) {
    return (
      <div
        className={cn('flex items-center justify-center', className)}
        style={style}
      >
        <div
          style={{
            width: loaderSize,
            height: loaderSize
          }}
        />
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center', className)} style={style}>
      <div
        style={{
          width: loaderSize,
          height: loaderSize,
          border: `${borderWidth}px solid ${colors.border}`,
          borderTopColor: colors.spinner,
          borderRadius: '50%',
          animation: autoPlay && loop
            ? `kidpen-spin ${animationDuration}s linear infinite`
            : autoPlay
              ? `kidpen-spin ${animationDuration}s linear`
              : 'none',
        }}
      />
      <style jsx>{`
        @keyframes kidpen-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

// Backwards compatibility alias
export const KortixLoader = KidpenLoader;

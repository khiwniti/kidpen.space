'use client';

import { cn } from '@/lib/utils';

interface KidpenLogoProps {
  size?: number;
  variant?: 'symbol' | 'logomark';
  className?: string;
}

export function KidpenLogo({ size = 24, variant = 'symbol', className }: KidpenLogoProps) {
  // For logomark variant, use logomark-white.svg which is already white
  // and invert it for light mode using CSS (no JS needed)
  if (variant === 'logomark') {
    return (
      <img
        src="/logomark-white.svg"
        alt="Kidpen"
        className={cn('invert dark:invert-0 flex-shrink-0', className)}
        style={{ height: `${size}px`, width: 'auto' }}
        suppressHydrationWarning
      />
    );
  }

  // Default symbol variant behavior - invert for dark mode
  return (
    <img
      src="/kidpen-symbol.svg"
      alt="Kidpen"
      className={cn('dark:invert flex-shrink-0', className)}
      style={{ width: `${size}px`, height: `${size}px` }}
      suppressHydrationWarning
    />
  );
}

// Backwards compatibility alias
export const KortixSymbol = KidpenLogo;

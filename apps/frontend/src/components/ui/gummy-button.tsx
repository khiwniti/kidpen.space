'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * GummyButton - Duolingo-style bouncy button with 3D press effect
 * 
 * Design Philosophy:
 * - Buttons should feel "squishy" like gummy candy
 * - 4px shadow creates depth, reduces on press
 * - Slight Y-translation on hover/active for tactile feel
 * - Pill-shaped (rounded-full) by default
 */

const gummyButtonVariants = cva(
  // Base styles: bouncy, raised, pill-shaped
  [
    'inline-flex items-center justify-center gap-2',
    'font-bold font-sans rounded-full',
    'transition-all duration-150 ease-out',
    'cursor-pointer select-none',
    'disabled:pointer-events-none disabled:opacity-50',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    // Gummy press effect
    'translate-y-0 active:translate-y-[2px]',
  ].join(' '),
  {
    variants: {
      variant: {
        // Primary gold (brand)
        primary: [
          'bg-kidpen-gold text-white',
          'shadow-[0_4px_0_0_#C47A06]',
          'hover:bg-[#FFB940] hover:-translate-y-[1px] hover:shadow-[0_5px_0_0_#C47A06]',
          'active:shadow-[0_2px_0_0_#C47A06]',
          'focus-visible:ring-kidpen-gold',
        ].join(' '),
        
        // Secondary dark
        secondary: [
          'bg-kidpen-dark text-white',
          'shadow-[0_4px_0_0_#0D0E17]',
          'hover:bg-kidpen-dark/90 hover:-translate-y-[1px] hover:shadow-[0_5px_0_0_#0D0E17]',
          'active:shadow-[0_2px_0_0_#0D0E17]',
          'focus-visible:ring-kidpen-dark',
        ].join(' '),
        
        // Math (blue)
        math: [
          'bg-kidpen-blue text-white',
          'shadow-[0_4px_0_0_#1E40AF]',
          'hover:bg-kidpen-blueHover hover:-translate-y-[1px] hover:shadow-[0_5px_0_0_#1E40AF]',
          'active:shadow-[0_2px_0_0_#1E40AF]',
          'focus-visible:ring-kidpen-blue',
        ].join(' '),
        
        // Science (green)
        science: [
          'bg-kidpen-green text-white',
          'shadow-[0_4px_0_0_#047857]',
          'hover:bg-kidpen-greenHover hover:-translate-y-[1px] hover:shadow-[0_5px_0_0_#047857]',
          'active:shadow-[0_2px_0_0_#047857]',
          'focus-visible:ring-kidpen-green',
        ].join(' '),
        
        // Physics (orange)
        physics: [
          'bg-kidpen-orange text-white',
          'shadow-[0_4px_0_0_#C2410C]',
          'hover:bg-kidpen-orangeHover hover:-translate-y-[1px] hover:shadow-[0_5px_0_0_#C2410C]',
          'active:shadow-[0_2px_0_0_#C2410C]',
          'focus-visible:ring-kidpen-orange',
        ].join(' '),
        
        // Coding (purple)
        coding: [
          'bg-kidpen-purple text-white',
          'shadow-[0_4px_0_0_#6D28D9]',
          'hover:bg-kidpen-purpleHover hover:-translate-y-[1px] hover:shadow-[0_5px_0_0_#6D28D9]',
          'active:shadow-[0_2px_0_0_#6D28D9]',
          'focus-visible:ring-kidpen-purple',
        ].join(' '),
        
        // Outline (secondary action)
        outline: [
          'bg-kidpen-cream text-kidpen-dark',
          'border-2 border-kidpen-dark/10',
          'shadow-none',
          'hover:bg-kidpen-gold/10 hover:border-kidpen-gold/30',
          'focus-visible:ring-kidpen-gold',
        ].join(' '),
        
        // Ghost / link
        ghost: [
          'text-kidpen-gold',
          'shadow-none',
          'hover:text-kidpen-goldHover',
          'underline decoration-2 underline-offset-4',
          'focus-visible:ring-kidpen-gold',
        ].join(' '),
      },
      size: {
        sm: 'py-2 px-4 text-sm',
        md: 'py-3 px-6 text-base',
        lg: 'py-3 px-8 text-lg',
        xl: 'py-4 px-12 text-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface GummyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof gummyButtonVariants> {
  asChild?: boolean;
  icon?: React.ReactNode;
}

const GummyButton = React.forwardRef<HTMLButtonElement, GummyButtonProps>(
  ({ className, variant, size, asChild = false, icon, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(gummyButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
      </Comp>
    );
  }
);
GummyButton.displayName = 'GummyButton';

export { GummyButton, gummyButtonVariants };

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { brandAvatar } from '@/lib/brand-identity';

/**
 * KidpenAvatar - AI avatar component showing "ก" (first letter of คิดเป็น)
 * 
 * Brand identity: Gold circle with white "ก" text
 * Used in chat bubbles, headers, and loading states
 */

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface KidpenAvatarProps {
  size?: AvatarSize;
  className?: string;
  variant?: 'ai' | 'student';
  studentInitial?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-lg',
  lg: 'w-12 h-12 text-xl',
  xl: 'w-16 h-16 text-2xl',
};

export function KidpenAvatar({
  size = 'md',
  className,
  variant = 'ai',
  studentInitial,
}: KidpenAvatarProps) {
  const isAI = variant === 'ai';
  
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold shadow-sm flex-shrink-0',
        sizeClasses[size],
        isAI ? 'bg-kidpen-gold text-white' : 'bg-kidpen-blue text-white',
        className
      )}
    >
      {isAI ? brandAvatar.ai.text : (studentInitial || '👤')}
    </div>
  );
}

/**
 * KidpenWordmark - Logo wordmark "kidpen.space"
 * 
 * Brand identity: "kidpen" in dark + ".space" in gold
 */
interface KidpenWordmarkProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showDomain?: boolean;
}

const wordmarkSizes = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
};

export function KidpenWordmark({
  className,
  size = 'md',
  showDomain = true,
}: KidpenWordmarkProps) {
  return (
    <span className={cn('font-bold tracking-tight', wordmarkSizes[size], className)}>
      {brandAvatar.wordmark.text}
      {showDomain && (
        <span className="text-kidpen-gold">{brandAvatar.wordmark.accent}</span>
      )}
    </span>
  );
}

/**
 * KidpenBrandHeader - Combined avatar + wordmark for headers
 */
interface KidpenBrandHeaderProps {
  className?: string;
  avatarSize?: AvatarSize;
  wordmarkSize?: 'sm' | 'md' | 'lg';
}

export function KidpenBrandHeader({
  className,
  avatarSize = 'lg',
  wordmarkSize = 'md',
}: KidpenBrandHeaderProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <KidpenAvatar size={avatarSize} />
      <KidpenWordmark size={wordmarkSize} />
    </div>
  );
}

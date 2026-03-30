'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * SubjectCard - Course/subject card with mastery progress
 * 
 * Design:
 * - Rounded corners with colored border
 * - Colored icon badge with subtle rotation on hover
 * - Progress bar with mastery percentage
 * - Background accent shape in corner
 */

export type SubjectType = 'math' | 'science' | 'coding' | 'physics' | 'data';

interface SubjectCardProps {
  id: string;
  name: string;
  icon: string;
  mastery: number;
  subject: SubjectType;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

const subjectStyles: Record<SubjectType, {
  color: string;
  border: string;
  bgLight: string;
  text: string;
  progress: string;
}> = {
  math: {
    color: 'bg-kidpen-blue text-white',
    border: 'border-kidpen-blue/20 hover:border-kidpen-blue/50',
    bgLight: 'bg-kidpen-blue/10',
    text: 'text-kidpen-blue',
    progress: 'bg-kidpen-blue',
  },
  science: {
    color: 'bg-kidpen-green text-white',
    border: 'border-kidpen-green/20 hover:border-kidpen-green/50',
    bgLight: 'bg-kidpen-green/10',
    text: 'text-kidpen-green',
    progress: 'bg-kidpen-green',
  },
  coding: {
    color: 'bg-kidpen-purple text-white',
    border: 'border-kidpen-purple/20 hover:border-kidpen-purple/50',
    bgLight: 'bg-kidpen-purple/10',
    text: 'text-kidpen-purple',
    progress: 'bg-kidpen-purple',
  },
  physics: {
    color: 'bg-kidpen-orange text-white',
    border: 'border-kidpen-orange/20 hover:border-kidpen-orange/50',
    bgLight: 'bg-kidpen-orange/10',
    text: 'text-kidpen-orange',
    progress: 'bg-kidpen-orange',
  },
  data: {
    color: 'bg-teal-500 text-white',
    border: 'border-teal-500/20 hover:border-teal-500/50',
    bgLight: 'bg-teal-500/10',
    text: 'text-teal-500',
    progress: 'bg-teal-500',
  },
};

export function SubjectCard({
  id,
  name,
  icon,
  mastery,
  subject,
  selected = false,
  onClick,
  className,
}: SubjectCardProps) {
  const styles = subjectStyles[subject];
  
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white border-2 p-6 rounded-3xl relative overflow-hidden',
        'group transition-all cursor-pointer h-[160px]',
        styles.border,
        selected && 'ring-4 ring-kidpen-gold/30 ring-offset-2',
        className
      )}
      style={{
        boxShadow: selected ? '0 4px 0 0 rgba(245, 166, 35, 0.5)' : 'none',
        transform: selected ? 'translateY(-2px)' : 'none',
      }}
    >
      {/* Background accent shape */}
      <div className={cn(
        'absolute top-0 right-0 w-32 h-32 rounded-bl-full -z-0',
        styles.bgLight
      )} />
      
      {/* Content */}
      <div className="relative z-10 flex gap-4 h-full">
        {/* Icon badge */}
        <div className={cn(
          'w-16 h-16 rounded-2xl flex items-center justify-center text-3xl',
          'shadow-md transition-transform shrink-0',
          'rotate-3 group-hover:rotate-6',
          styles.color
        )}>
          {icon}
        </div>
        
        {/* Text and progress */}
        <div className="flex flex-col justify-center flex-1">
          <h3 className="text-lg font-bold mb-2 font-thai">{name}</h3>
          <div className="flex flex-col gap-1 w-full">
            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-1000',
                  styles.progress
                )}
                style={{ width: `${mastery}%` }}
              />
            </div>
            <span className={cn('text-xs font-bold', styles.text)}>
              {mastery}% Mastery
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export { subjectStyles };

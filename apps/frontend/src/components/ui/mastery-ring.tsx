'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * MasteryRing - Circular progress indicator for pyBKT mastery
 * 
 * Design:
 * - SVG circular progress ring
 * - Color changes based on mastery level
 * - Shows percentage in center
 * - Scaffold level badge below
 */

type MasteryLevel = 'mastered' | 'learning' | 'struggling';

interface MasteryRingProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  scaffoldLevel?: number;
  className?: string;
}

function getMasteryLevel(percentage: number): MasteryLevel {
  if (percentage >= 80) return 'mastered';
  if (percentage >= 40) return 'learning';
  return 'struggling';
}

const masteryStyles: Record<MasteryLevel, {
  stroke: string;
  text: string;
  badge: string;
  badgeText: string;
  label: string;
  labelTh: string;
}> = {
  mastered: {
    stroke: 'text-kidpen-green',
    text: 'text-kidpen-green',
    badge: 'bg-kidpen-green/10',
    badgeText: 'text-kidpen-green',
    label: 'Mastered',
    labelTh: 'เข้าใจลึกซึ้ง',
  },
  learning: {
    stroke: 'text-kidpen-gold',
    text: 'text-kidpen-gold',
    badge: 'bg-kidpen-gold/10',
    badgeText: 'text-kidpen-gold',
    label: 'Learning',
    labelTh: 'กำลังเรียนรู้',
  },
  struggling: {
    stroke: 'text-red-500',
    text: 'text-red-500',
    badge: 'bg-red-100',
    badgeText: 'text-red-600',
    label: 'Struggling',
    labelTh: 'เพิ่งเริ่มต้น',
  },
};

const scaffoldLabels: Record<number, string> = {
  1: 'Level 1: Scaffolding',
  2: 'Level 2: Guided',
  3: 'Level 3: Independent',
  4: 'Level 4: Challenge',
};

const sizeStyles = {
  sm: { size: 48, stroke: 3, fontSize: 'text-xs' },
  md: { size: 64, stroke: 4, fontSize: 'text-sm' },
  lg: { size: 80, stroke: 5, fontSize: 'text-base' },
};

export function MasteryRing({
  percentage,
  size = 'md',
  showLabel = true,
  scaffoldLevel,
  className,
}: MasteryRingProps) {
  const level = getMasteryLevel(percentage);
  const styles = masteryStyles[level];
  const sizeConfig = sizeStyles[size];
  
  // SVG calculations
  const radius = (sizeConfig.size - sizeConfig.stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(percentage / 100) * circumference}, ${circumference}`;
  
  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      {/* Ring */}
      <div 
        className="relative flex items-center justify-center"
        style={{ width: sizeConfig.size, height: sizeConfig.size }}
      >
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox={`0 0 ${sizeConfig.size} ${sizeConfig.size}`}
        >
          {/* Background track */}
          <circle
            className="text-gray-100"
            cx={sizeConfig.size / 2}
            cy={sizeConfig.size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={sizeConfig.stroke}
          />
          {/* Progress arc */}
          <circle
            className={cn('transition-all duration-1000', styles.stroke)}
            cx={sizeConfig.size / 2}
            cy={sizeConfig.size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={sizeConfig.stroke}
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
          />
        </svg>
        {/* Center percentage */}
        <span className={cn(
          'absolute font-bold',
          sizeConfig.fontSize,
          styles.text
        )}>
          {percentage}%
        </span>
      </div>
      
      {/* Label */}
      {showLabel && (
        <span className={cn(
          'text-sm font-bold font-thai text-center',
          styles.text
        )}>
          {styles.labelTh} ({styles.label})
        </span>
      )}
      
      {/* Scaffold level badge */}
      {scaffoldLevel && (
        <span className={cn(
          'text-xs font-bold px-2 py-1 rounded',
          styles.badge,
          styles.badgeText
        )}>
          {scaffoldLabels[scaffoldLevel] || `Level ${scaffoldLevel}`}
        </span>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Flame,
  Trophy,
  Heart,
  Pencil,
  Star,
  Zap,
  Crown,
  Target,
  Medal,
} from 'lucide-react';

// Badge types
export type BadgeType = 'xp' | 'streak' | 'league' | 'mentor' | 'creator' | 'mastery' | 'challenge' | 'champion' | 'perfect' | 'helper';

export type LeagueTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface BaseBadgeProps {
  /** Optional CSS class */
  className?: string;
  /** Badge size */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to animate */
  animate?: boolean;
  /** Whether to show label */
  showLabel?: boolean;
}

export interface XPBadgeProps extends BaseBadgeProps {
  /** XP amount */
  xp: number;
}

export interface StreakBadgeProps extends BaseBadgeProps {
  /** Streak days */
  days: number;
}

export interface LeagueBadgeProps extends BaseBadgeProps {
  /** League tier */
  tier: LeagueTier;
}

export interface MentorBadgeProps extends BaseBadgeProps {
  /** Number of students helped */
  helped: number;
}

export interface CreatorBadgeProps extends BaseBadgeProps {
  /** Number of lessons created */
  created: number;
}

export interface MasteryBadgeProps extends BaseBadgeProps {
  /** Subject mastered */
  subject: string;
  /** Mastery percentage */
  percentage: number;
}

// Size configurations
const sizeConfig = {
  sm: {
    container: 'h-6 px-2 gap-1 text-xs',
    icon: 'w-3 h-3',
  },
  md: {
    container: 'h-8 px-3 gap-1.5 text-sm',
    icon: 'w-4 h-4',
  },
  lg: {
    container: 'h-10 px-4 gap-2 text-base',
    icon: 'w-5 h-5',
  },
};

// League tier configurations
const leagueConfig: Record<LeagueTier, { label: string; gradient: string; textColor: string }> = {
  bronze: {
    label: 'บรอนซ์',
    gradient: 'from-amber-600 to-amber-800',
    textColor: 'text-amber-900',
  },
  silver: {
    label: 'ซิลเวอร์',
    gradient: 'from-gray-300 to-gray-500',
    textColor: 'text-gray-700',
  },
  gold: {
    label: 'โกลด์',
    gradient: 'from-yellow-400 to-amber-500',
    textColor: 'text-amber-800',
  },
  platinum: {
    label: 'แพลตินัม',
    gradient: 'from-cyan-300 to-blue-400',
    textColor: 'text-blue-800',
  },
  diamond: {
    label: 'ไดมอนด์',
    gradient: 'from-purple-400 to-indigo-500',
    textColor: 'text-purple-800',
  },
};

/**
 * XP Badge - Shows experience points earned
 */
export function XPBadge({
  xp,
  className,
  size = 'md',
  animate = false,
  showLabel = true,
}: XPBadgeProps) {
  const config = sizeConfig[size];

  // Format XP (1240 → 1.2K)
  const formatXP = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-semibold',
        'bg-gradient-to-r from-yellow-400 to-amber-500',
        'text-amber-900 shadow-sm',
        config.container,
        animate && 'animate-pulse',
        className,
      )}
    >
      <Sparkles className={cn(config.icon, 'fill-current')} />
      <span className="font-bold tabular-nums">{formatXP(xp)}</span>
      {showLabel && <span className="opacity-80">XP</span>}
    </div>
  );
}

/**
 * Streak Badge - Shows consecutive days of learning
 */
export function StreakBadge({
  days,
  className,
  size = 'md',
  animate = false,
  showLabel = true,
}: StreakBadgeProps) {
  const config = sizeConfig[size];

  // Determine flame intensity
  const isHot = days >= 7;
  const isBlazing = days >= 30;

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-semibold',
        'bg-gradient-to-r from-orange-400 to-red-500',
        'text-white shadow-sm',
        config.container,
        animate && 'animate-pulse',
        className,
      )}
    >
      <Flame
        className={cn(
          config.icon,
          'fill-current',
          isBlazing && 'text-yellow-200',
          isHot && !isBlazing && 'text-orange-100',
        )}
      />
      <span className="font-bold tabular-nums">{days}</span>
      {showLabel && <span className="opacity-90">วัน</span>}
    </div>
  );
}

/**
 * League Badge - Shows competitive tier
 */
export function LeagueBadge({
  tier,
  className,
  size = 'md',
  animate = false,
  showLabel = true,
}: LeagueBadgeProps) {
  const config = sizeConfig[size];
  const tierConfig = leagueConfig[tier];

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-semibold',
        `bg-gradient-to-r ${tierConfig.gradient}`,
        tierConfig.textColor,
        'shadow-sm',
        config.container,
        animate && 'animate-bounce',
        className,
      )}
    >
      <Trophy className={cn(config.icon, 'fill-current opacity-80')} />
      {showLabel && <span className="font-bold">{tierConfig.label}</span>}
    </div>
  );
}

/**
 * Mentor Badge - Shows peer tutoring contribution
 */
export function MentorBadge({
  helped,
  className,
  size = 'md',
  animate = false,
  showLabel = true,
}: MentorBadgeProps) {
  const config = sizeConfig[size];

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-semibold',
        'bg-gradient-to-r from-purple-400 to-violet-500',
        'text-white shadow-sm',
        config.container,
        animate && 'animate-pulse',
        className,
      )}
    >
      <Heart className={cn(config.icon, 'fill-current')} />
      <span className="font-bold tabular-nums">{helped}</span>
      {showLabel && <span className="opacity-90">ช่วยแล้ว</span>}
    </div>
  );
}

/**
 * Creator Badge - Shows content creation
 */
export function CreatorBadge({
  created,
  className,
  size = 'md',
  animate = false,
  showLabel = true,
}: CreatorBadgeProps) {
  const config = sizeConfig[size];

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-semibold',
        'bg-gradient-to-r from-teal-400 to-cyan-500',
        'text-white shadow-sm',
        config.container,
        animate && 'animate-pulse',
        className,
      )}
    >
      <Pencil className={cn(config.icon, 'fill-current')} />
      <span className="font-bold tabular-nums">{created}</span>
      {showLabel && <span className="opacity-90">สร้าง</span>}
    </div>
  );
}

/**
 * Mastery Badge - Shows subject mastery
 */
export function MasteryBadge({
  subject,
  percentage,
  className,
  size = 'md',
  animate = false,
  showLabel = true,
}: MasteryBadgeProps) {
  const config = sizeConfig[size];

  // Determine color based on percentage
  const getGradient = () => {
    if (percentage >= 90) return 'from-emerald-400 to-green-500';
    if (percentage >= 70) return 'from-blue-400 to-indigo-500';
    if (percentage >= 50) return 'from-amber-400 to-orange-500';
    return 'from-gray-400 to-gray-500';
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-semibold',
        `bg-gradient-to-r ${getGradient()}`,
        'text-white shadow-sm',
        config.container,
        animate && 'animate-pulse',
        className,
      )}
    >
      <Star className={cn(config.icon, 'fill-current')} />
      {showLabel && <span className="font-bold">{subject}</span>}
      <span className="font-bold tabular-nums">{percentage}%</span>
    </div>
  );
}

/**
 * Achievement Badge - Generic achievement display
 */
export interface AchievementBadgeProps extends BaseBadgeProps {
  /** Badge type */
  type: BadgeType;
  /** Badge label */
  label: string;
  /** Badge value (optional) */
  value?: number | string;
  /** Whether badge is unlocked */
  unlocked?: boolean;
}

export function AchievementBadge({
  type,
  label,
  value,
  unlocked = true,
  className,
  size = 'md',
  animate = false,
}: AchievementBadgeProps) {
  const config = sizeConfig[size];

  // Icon mapping
  const IconMap: Record<BadgeType, typeof Star> = {
    xp: Sparkles,
    streak: Flame,
    league: Trophy,
    mentor: Heart,
    creator: Pencil,
    mastery: Star,
    challenge: Zap,
    champion: Crown,
    perfect: Target,
    helper: Medal,
  };

  // Color mapping
  const colorMap: Record<BadgeType, string> = {
    xp: 'from-yellow-400 to-amber-500 text-amber-900',
    streak: 'from-orange-400 to-red-500 text-white',
    league: 'from-blue-400 to-indigo-500 text-white',
    mentor: 'from-purple-400 to-violet-500 text-white',
    creator: 'from-teal-400 to-cyan-500 text-white',
    mastery: 'from-emerald-400 to-green-500 text-white',
    challenge: 'from-pink-400 to-rose-500 text-white',
    champion: 'from-yellow-500 to-orange-500 text-white',
    perfect: 'from-indigo-400 to-purple-500 text-white',
    helper: 'from-cyan-400 to-blue-500 text-white',
  };

  const Icon = IconMap[type];
  const colors = colorMap[type];

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-semibold shadow-sm',
        `bg-gradient-to-r ${colors}`,
        config.container,
        !unlocked && 'opacity-40 grayscale',
        animate && unlocked && 'animate-pulse',
        className,
      )}
    >
      <Icon className={cn(config.icon, 'fill-current')} />
      <span className="font-bold">{label}</span>
      {value !== undefined && (
        <span className="font-bold tabular-nums opacity-90">{value}</span>
      )}
    </div>
  );
}

/**
 * Badge Collection Display
 */
export interface BadgeCollectionProps {
  /** Array of badges to display */
  badges: Array<{
    type: BadgeType;
    label: string;
    value?: number | string;
    unlocked?: boolean;
  }>;
  /** Size of badges */
  size?: 'sm' | 'md' | 'lg';
  /** Maximum badges to show */
  maxVisible?: number;
  /** CSS class */
  className?: string;
}

export function BadgeCollection({
  badges,
  size = 'sm',
  maxVisible = 5,
  className,
}: BadgeCollectionProps) {
  const visibleBadges = badges.slice(0, maxVisible);
  const hiddenCount = badges.length - maxVisible;

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {visibleBadges.map((badge, index) => (
        <AchievementBadge
          key={`${badge.type}-${index}`}
          type={badge.type}
          label={badge.label}
          value={badge.value}
          unlocked={badge.unlocked}
          size={size}
          showLabel={false}
        />
      ))}
      {hiddenCount > 0 && (
        <span className="text-xs text-muted-foreground font-medium">
          +{hiddenCount} อื่นๆ
        </span>
      )}
    </div>
  );
}

// Export all components
export default {
  XPBadge,
  StreakBadge,
  LeagueBadge,
  MentorBadge,
  CreatorBadge,
  MasteryBadge,
  AchievementBadge,
  BadgeCollection,
};

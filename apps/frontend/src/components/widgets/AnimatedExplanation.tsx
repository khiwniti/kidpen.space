'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Maximize2,
} from 'lucide-react';
import {
  BaseWidgetProps,
  WidgetInteraction,
  WidgetResult,
} from './types';

// Animation frame definition
export interface AnimationFrame {
  id: string;
  /** Duration in milliseconds */
  duration: number;
  /** Visual content (can be HTML/SVG string or React element key) */
  content: string;
  /** Narration text */
  narration?: string;
  /** Audio URL for this frame */
  audioUrl?: string;
  /** Highlight areas (for interactivity) */
  highlights?: { x: number; y: number; width: number; height: number; label: string }[];
}

// Animated explanation props
export interface AnimatedExplanationProps extends BaseWidgetProps {
  /** Title text */
  title: string;
  /** Description */
  description?: string;
  /** Animation frames */
  frames: AnimationFrame[];
  /** Auto-play on load */
  autoPlay?: boolean;
  /** Loop animation */
  loop?: boolean;
  /** Show controls */
  showControls?: boolean;
  /** Show progress bar */
  showProgress?: boolean;
  /** Show narration text */
  showNarration?: boolean;
  /** Animation height */
  animationHeight?: number;
  /** Pause at end of each frame */
  pauseAtFrameEnd?: boolean;
  /** Custom renderer for frames */
  renderFrame?: (frame: AnimationFrame, index: number) => React.ReactNode;
}

// Default frame renderer (SVG-based math animations)
const DefaultFrameRenderer: Record<string, React.ReactNode> = {
  // Pythagorean theorem frames
  'pythagoras-1': (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      <rect x="50" y="150" width="100" height="100" fill="#2563EB" opacity="0.3" stroke="#2563EB" strokeWidth="2" />
      <text x="100" y="210" textAnchor="middle" fill="#2563EB" fontSize="16">a²</text>
    </svg>
  ),
  'pythagoras-2': (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      <rect x="50" y="150" width="100" height="100" fill="#2563EB" opacity="0.3" stroke="#2563EB" strokeWidth="2" />
      <rect x="170" y="150" width="80" height="80" fill="#10B981" opacity="0.3" stroke="#10B981" strokeWidth="2" />
      <text x="100" y="210" textAnchor="middle" fill="#2563EB" fontSize="16">a²</text>
      <text x="210" y="200" textAnchor="middle" fill="#10B981" fontSize="16">b²</text>
    </svg>
  ),
  'pythagoras-3': (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      <rect x="50" y="150" width="100" height="100" fill="#2563EB" opacity="0.3" stroke="#2563EB" strokeWidth="2" />
      <rect x="170" y="150" width="80" height="80" fill="#10B981" opacity="0.3" stroke="#10B981" strokeWidth="2" />
      <rect x="270" y="100" width="120" height="120" fill="#F5A623" opacity="0.3" stroke="#F5A623" strokeWidth="2" />
      <text x="100" y="210" textAnchor="middle" fill="#2563EB" fontSize="16">a²</text>
      <text x="210" y="200" textAnchor="middle" fill="#10B981" fontSize="16">b²</text>
      <text x="330" y="170" textAnchor="middle" fill="#F5A623" fontSize="16">c²</text>
      <text x="200" y="280" textAnchor="middle" fill="#374151" fontSize="18" fontWeight="bold">a² + b² = c²</text>
    </svg>
  ),
  // Fraction animation frames
  'fraction-1': (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      <rect x="100" y="100" width="200" height="100" fill="#2563EB" opacity="0.3" stroke="#2563EB" strokeWidth="2" rx="8" />
      <text x="200" y="160" textAnchor="middle" fill="#2563EB" fontSize="24" fontWeight="bold">1 whole</text>
    </svg>
  ),
  'fraction-2': (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      <rect x="100" y="100" width="98" height="100" fill="#2563EB" opacity="0.3" stroke="#2563EB" strokeWidth="2" rx="8" />
      <rect x="202" y="100" width="98" height="100" fill="#10B981" opacity="0.3" stroke="#10B981" strokeWidth="2" rx="8" />
      <line x1="200" y1="100" x2="200" y2="200" stroke="#374151" strokeWidth="2" strokeDasharray="5,5" />
      <text x="148" y="160" textAnchor="middle" fill="#2563EB" fontSize="20">½</text>
      <text x="252" y="160" textAnchor="middle" fill="#10B981" fontSize="20">½</text>
    </svg>
  ),
  'fraction-3': (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      <rect x="100" y="100" width="65" height="100" fill="#2563EB" opacity="0.3" stroke="#2563EB" strokeWidth="2" rx="8" />
      <rect x="168" y="100" width="65" height="100" fill="#10B981" opacity="0.3" stroke="#10B981" strokeWidth="2" rx="8" />
      <rect x="235" y="100" width="65" height="100" fill="#8B5CF6" opacity="0.3" stroke="#8B5CF6" strokeWidth="2" rx="8" />
      <text x="132" y="160" textAnchor="middle" fill="#2563EB" fontSize="16">⅓</text>
      <text x="200" y="160" textAnchor="middle" fill="#10B981" fontSize="16">⅓</text>
      <text x="267" y="160" textAnchor="middle" fill="#8B5CF6" fontSize="16">⅓</text>
    </svg>
  ),
};

/**
 * AnimatedExplanation Widget
 *
 * Step-by-step animated explanations for complex concepts.
 * Supports custom SVG animations, narration, and interactive highlights.
 *
 * Note: For production, integrate with Rive or Lottie for advanced animations.
 * This implementation uses CSS transitions and SVG for basic animation.
 *
 * Part of the Kidpen "Spark of Joy" Widget Library
 */
export function AnimatedExplanation({
  id,
  className,
  subject = 'math',
  disabled = false,
  showHints = true,
  title,
  description,
  frames,
  autoPlay = false,
  loop = false,
  showControls = true,
  showProgress = true,
  showNarration = true,
  animationHeight = 300,
  pauseAtFrameEnd = true,
  renderFrame,
  onInteract,
  onComplete,
}: AnimatedExplanationProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Get subject color classes
  const getSubjectColorClass = (variant: 'bg' | 'text' | 'border' | 'ring') => {
    const colorMap: Record<string, Record<string, string>> = {
      math: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
        ring: 'ring-blue-500/20',
      },
      science: {
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800',
        ring: 'ring-emerald-500/20',
      },
      coding: {
        bg: 'bg-violet-100 dark:bg-violet-900/30',
        text: 'text-violet-600 dark:text-violet-400',
        border: 'border-violet-200 dark:border-violet-800',
        ring: 'ring-violet-500/20',
      },
      physics: {
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800',
        ring: 'ring-orange-500/20',
      },
    };
    return colorMap[subject]?.[variant] || colorMap.math[variant];
  };

  // Animate progress within current frame
  const animate = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const frame = frames[currentFrame];
      const elapsed = timestamp - startTimeRef.current;
      const frameProgress = Math.min(elapsed / frame.duration, 1);

      setProgress(frameProgress);

      if (frameProgress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Frame complete
        if (pauseAtFrameEnd) {
          setIsPlaying(false);
        }

        // Move to next frame or loop/complete
        if (currentFrame < frames.length - 1) {
          if (!pauseAtFrameEnd) {
            setCurrentFrame((prev) => prev + 1);
            startTimeRef.current = 0;
            animationRef.current = requestAnimationFrame(animate);
          }
        } else {
          // Animation complete
          if (loop) {
            setCurrentFrame(0);
            startTimeRef.current = 0;
            if (!pauseAtFrameEnd) {
              animationRef.current = requestAnimationFrame(animate);
            }
          } else if (!hasCompleted) {
            setHasCompleted(true);
            const result: WidgetResult = {
              success: true,
              score: 100,
              attempts: 1,
              timeSpent: Date.now() - startTime,
              data: { framesWatched: frames.length },
            };
            onComplete?.(result);
          }
        }
      }
    },
    [currentFrame, frames, pauseAtFrameEnd, loop, hasCompleted, startTime, onComplete],
  );

  // Play/pause control
  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, animate]);

  // Handle play/pause toggle
  const handlePlayPause = useCallback(() => {
    if (disabled) return;

    setIsPlaying((prev) => !prev);

    const interaction: WidgetInteraction = {
      type: 'click',
      timestamp: Date.now(),
      data: { action: isPlaying ? 'pause' : 'play', frame: currentFrame },
    };
    onInteract?.(interaction);
  }, [disabled, isPlaying, currentFrame, onInteract]);

  // Go to previous frame
  const handlePrevFrame = useCallback(() => {
    if (currentFrame > 0) {
      setCurrentFrame((prev) => prev - 1);
      setProgress(0);
      startTimeRef.current = 0;
    }
  }, [currentFrame]);

  // Go to next frame
  const handleNextFrame = useCallback(() => {
    if (currentFrame < frames.length - 1) {
      setCurrentFrame((prev) => prev + 1);
      setProgress(0);
      startTimeRef.current = 0;
      setIsPlaying(true);
    }
  }, [currentFrame, frames.length]);

  // Reset animation
  const handleReset = useCallback(() => {
    setCurrentFrame(0);
    setProgress(0);
    setIsPlaying(false);
    startTimeRef.current = 0;
    setHasCompleted(false);
  }, []);

  // Render frame content
  const renderFrameContent = useCallback(
    (frame: AnimationFrame, index: number) => {
      if (renderFrame) {
        return renderFrame(frame, index);
      }

      // Use default renderer or raw content
      if (DefaultFrameRenderer[frame.content]) {
        return DefaultFrameRenderer[frame.content];
      }

      // Raw HTML/SVG content
      return (
        <div
          className="w-full h-full flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: frame.content }}
        />
      );
    },
    [renderFrame],
  );

  const currentFrameData = frames[currentFrame];

  return (
    <Card
      id={id}
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        'border-2 shadow-kidpen hover:shadow-kidpen-lg',
        getSubjectColorClass('border'),
        disabled && 'opacity-60 pointer-events-none',
        className,
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-outfit font-semibold flex items-center gap-2">
              <Play className={cn('w-5 h-5', getSubjectColorClass('text'))} />
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="text-sm text-muted-foreground">
                {description}
              </CardDescription>
            )}
          </div>

          <Badge
            variant="outline"
            className={cn(
              'text-xs px-3 py-1',
              getSubjectColorClass('bg'),
              getSubjectColorClass('text'),
              getSubjectColorClass('border'),
            )}
          >
            {currentFrame + 1} / {frames.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Animation Display */}
        <div
          className={cn(
            'relative rounded-lg border-2 overflow-hidden bg-white dark:bg-gray-900',
            getSubjectColorClass('border'),
          )}
          style={{ height: animationHeight }}
        >
          <div
            className="w-full h-full transition-opacity duration-500"
            style={{ opacity: progress > 0.1 ? 1 : 0.5 }}
          >
            {renderFrameContent(currentFrameData, currentFrame)}
          </div>

          {/* Frame Progress */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
            <div
              className="h-full bg-kidpen-gold transition-all duration-100"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        {showControls && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleReset}
              disabled={disabled}
              className="h-10 w-10"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevFrame}
              disabled={disabled || currentFrame === 0}
              className="h-10 w-10"
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button
              onClick={handlePlayPause}
              disabled={disabled}
              className={cn(
                'h-12 w-12 rounded-full',
                'bg-kidpen-gold hover:bg-kidpen-gold/90 text-white shadow-kidpen',
              )}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNextFrame}
              disabled={disabled || currentFrame >= frames.length - 1}
              className="h-10 w-10"
            >
              <SkipForward className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
              disabled={disabled}
              className="h-10 w-10"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>
        )}

        {/* Progress Bar (overall) */}
        {showProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>ขั้นตอนที่ {currentFrame + 1}</span>
              <span>{frames.length} ขั้นตอน</span>
            </div>
            <div className="flex gap-1">
              {frames.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentFrame(index);
                    setProgress(0);
                    startTimeRef.current = 0;
                  }}
                  className={cn(
                    'flex-1 h-2 rounded-full transition-colors',
                    index < currentFrame
                      ? 'bg-kidpen-gold'
                      : index === currentFrame
                        ? 'bg-kidpen-gold/50'
                        : 'bg-gray-200 dark:bg-gray-700',
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {/* Narration */}
        {showNarration && currentFrameData.narration && (
          <div
            className={cn(
              'p-4 rounded-lg text-sm',
              getSubjectColorClass('bg'),
            )}
          >
            <p className="leading-relaxed">{currentFrameData.narration}</p>
          </div>
        )}

        {/* Completion Badge */}
        {hasCompleted && (
          <div className="flex items-center justify-center">
            <Badge className="bg-emerald-500 text-white px-4 py-1">
              ✓ ดูจบแล้ว!
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AnimatedExplanation;

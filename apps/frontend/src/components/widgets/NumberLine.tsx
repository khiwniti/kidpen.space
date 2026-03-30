'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Check,
  RotateCcw,
  Lightbulb,
  Circle,
  ArrowLeft,
  ArrowRight,
  Ruler,
} from 'lucide-react';
import {
  BaseWidgetProps,
  WidgetInteraction,
  WidgetResult,
} from './types';

// Number line specific types
export interface NumberLineMarker {
  id: string;
  value: number;
  label?: string;
  color?: string;
  draggable?: boolean;
}

export interface NumberLineProblem {
  /** Target value to place */
  targetValue: number;
  /** Acceptable range around target (for continuous values) */
  tolerance?: number;
  /** Label for the target */
  label?: string;
}

export interface NumberLineProps extends BaseWidgetProps {
  /** Title text */
  title: string;
  /** Description/instructions */
  description?: string;
  /** Minimum value on the line */
  min: number;
  /** Maximum value on the line */
  max: number;
  /** Step/interval between major ticks */
  step: number;
  /** Fixed markers to display */
  markers?: NumberLineMarker[];
  /** Problem configuration (if interactive) */
  problem?: NumberLineProblem;
  /** Whether to show tick labels */
  showLabels?: boolean;
  /** Whether to show minor ticks */
  showMinorTicks?: boolean;
  /** Unit for display */
  unit?: string;
}

/**
 * NumberLine Widget
 *
 * Interactive number line for number placement and interval exercises.
 *
 * Example use cases:
 * - Place numbers on a line
 * - Identify intervals
 * - Compare fractions
 * - Negative number understanding
 *
 * Part of the Kidpen "Spark of Joy" Widget Library
 */
export function NumberLine({
  id,
  className,
  subject = 'math',
  disabled = false,
  showHints = true,
  title,
  description,
  min,
  max,
  step,
  markers = [],
  problem,
  showLabels = true,
  showMinorTicks = true,
  unit = '',
  onInteract,
  onComplete,
}: NumberLineProps) {
  const [placedValue, setPlacedValue] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());

  // Calculate tick positions
  const ticks = useMemo(() => {
    const result: number[] = [];
    for (let v = min; v <= max; v += step) {
      result.push(v);
    }
    return result;
  }, [min, max, step]);

  // Minor ticks (half-step)
  const minorTicks = useMemo(() => {
    if (!showMinorTicks) return [];
    const result: number[] = [];
    const minorStep = step / 2;
    for (let v = min + minorStep; v < max; v += step) {
      if (!ticks.includes(v)) {
        result.push(v);
      }
    }
    return result;
  }, [min, max, step, ticks, showMinorTicks]);

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

  // Convert value to percentage position
  const valueToPercent = useCallback(
    (value: number) => {
      return ((value - min) / (max - min)) * 100;
    },
    [min, max],
  );

  // Convert click position to value
  const positionToValue = useCallback(
    (clientX: number, rect: DOMRect) => {
      const percent = (clientX - rect.left) / rect.width;
      const rawValue = min + percent * (max - min);
      // Snap to nearest step/2
      const snapStep = step / 2;
      return Math.round(rawValue / snapStep) * snapStep;
    },
    [min, max, step],
  );

  // Handle click on number line
  const handleLineClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || submitted || !problem) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const value = positionToValue(e.clientX, rect);

      // Clamp to range
      const clampedValue = Math.max(min, Math.min(max, value));
      setPlacedValue(clampedValue);

      const interaction: WidgetInteraction = {
        type: 'click',
        timestamp: Date.now(),
        data: { value: clampedValue },
      };
      onInteract?.(interaction);
    },
    [disabled, submitted, problem, positionToValue, min, max, onInteract],
  );

  // Handle drag
  const handleDrag = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || submitted || !isDragging || !problem) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const value = positionToValue(e.clientX, rect);
      const clampedValue = Math.max(min, Math.min(max, value));
      setPlacedValue(clampedValue);
    },
    [disabled, submitted, isDragging, problem, positionToValue, min, max],
  );

  // Check answer
  const handleSubmit = useCallback(() => {
    if (placedValue === null || !problem) return;

    setAttempts((prev) => prev + 1);
    setSubmitted(true);

    const tolerance = problem.tolerance ?? step / 4;
    const isCorrect = Math.abs(placedValue - problem.targetValue) <= tolerance;

    const result: WidgetResult = {
      success: isCorrect,
      score: isCorrect ? 100 : 0,
      attempts: attempts + 1,
      timeSpent: Date.now() - startTime,
      data: { placedValue, targetValue: problem.targetValue, difference: Math.abs(placedValue - problem.targetValue) },
    };
    onComplete?.(result);
  }, [placedValue, problem, step, attempts, startTime, onComplete]);

  // Reset
  const handleReset = useCallback(() => {
    setPlacedValue(null);
    setSubmitted(false);
  }, []);

  // Check if answer is correct
  const isCorrect = useMemo(() => {
    if (!submitted || placedValue === null || !problem) return null;
    const tolerance = problem.tolerance ?? step / 4;
    return Math.abs(placedValue - problem.targetValue) <= tolerance;
  }, [submitted, placedValue, problem, step]);

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
              <Ruler className={cn('w-5 h-5', getSubjectColorClass('text'))} />
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="text-sm text-muted-foreground">
                {description}
              </CardDescription>
            )}
          </div>

          {problem && (
            <Badge
              variant="outline"
              className={cn(
                'font-mono text-sm px-3 py-1',
                getSubjectColorClass('bg'),
                getSubjectColorClass('text'),
                getSubjectColorClass('border'),
              )}
            >
              วาง: {problem.label || problem.targetValue}
              {unit}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Number Line */}
        <div className="pt-8 pb-4 px-4">
          <div
            className={cn(
              'relative h-16 cursor-crosshair select-none',
              disabled && 'cursor-not-allowed',
            )}
            onClick={handleLineClick}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onMouseMove={handleDrag}
          >
            {/* Main line */}
            <div
              className={cn(
                'absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 rounded-full',
                getSubjectColorClass('bg'),
              )}
            />

            {/* Arrows */}
            <ArrowLeft
              className={cn(
                'absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-4 h-4',
                getSubjectColorClass('text'),
              )}
            />
            <ArrowRight
              className={cn(
                'absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-4 h-4',
                getSubjectColorClass('text'),
              )}
            />

            {/* Major ticks */}
            {ticks.map((tick) => (
              <div
                key={tick}
                className="absolute top-1/2 -translate-y-1/2"
                style={{ left: `${valueToPercent(tick)}%` }}
              >
                <div
                  className={cn(
                    'w-0.5 h-6 -translate-x-1/2 rounded-full',
                    getSubjectColorClass('bg'),
                  )}
                />
                {showLabels && (
                  <span
                    className={cn(
                      'absolute top-8 left-1/2 -translate-x-1/2 text-xs font-medium',
                      getSubjectColorClass('text'),
                    )}
                  >
                    {tick}
                  </span>
                )}
              </div>
            ))}

            {/* Minor ticks */}
            {minorTicks.map((tick) => (
              <div
                key={tick}
                className="absolute top-1/2 -translate-y-1/2"
                style={{ left: `${valueToPercent(tick)}%` }}
              >
                <div
                  className={cn(
                    'w-0.5 h-3 -translate-x-1/2 rounded-full opacity-50',
                    getSubjectColorClass('bg'),
                  )}
                />
              </div>
            ))}

            {/* Fixed markers */}
            {markers.map((marker) => (
              <div
                key={marker.id}
                className="absolute top-1/2 -translate-y-1/2"
                style={{ left: `${valueToPercent(marker.value)}%` }}
              >
                <div
                  className={cn(
                    'w-4 h-4 -translate-x-1/2 rounded-full border-2 bg-white dark:bg-gray-900',
                    marker.color ? `border-${marker.color}` : getSubjectColorClass('border'),
                  )}
                />
                {marker.label && (
                  <span
                    className={cn(
                      'absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap',
                      marker.color ? `text-${marker.color}` : getSubjectColorClass('text'),
                    )}
                  >
                    {marker.label}
                  </span>
                )}
              </div>
            ))}

            {/* Placed value marker */}
            {placedValue !== null && (
              <div
                className="absolute top-1/2 -translate-y-1/2 transition-all duration-100"
                style={{ left: `${valueToPercent(placedValue)}%` }}
              >
                <div
                  className={cn(
                    'w-6 h-6 -translate-x-1/2 rounded-full border-3 flex items-center justify-center',
                    'shadow-lg transition-colors',
                    submitted && isCorrect && 'bg-emerald-500 border-emerald-600',
                    submitted && !isCorrect && 'bg-red-500 border-red-600',
                    !submitted && 'bg-kidpen-gold border-kidpen-gold',
                  )}
                >
                  <Circle className="w-2 h-2 fill-white text-white" />
                </div>
                <span
                  className={cn(
                    'absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-bold whitespace-nowrap px-1.5 py-0.5 rounded',
                    submitted && isCorrect && 'bg-emerald-100 text-emerald-700',
                    submitted && !isCorrect && 'bg-red-100 text-red-700',
                    !submitted && 'bg-kidpen-gold/20 text-kidpen-gold',
                  )}
                >
                  {placedValue}
                  {unit}
                </span>
              </div>
            )}

            {/* Target indicator (after submit, if wrong) */}
            {submitted && !isCorrect && problem && (
              <div
                className="absolute top-1/2 -translate-y-1/2"
                style={{ left: `${valueToPercent(problem.targetValue)}%` }}
              >
                <div className="w-6 h-6 -translate-x-1/2 rounded-full border-3 border-emerald-500 border-dashed flex items-center justify-center bg-emerald-50">
                  <Check className="w-3 h-3 text-emerald-600" />
                </div>
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-bold whitespace-nowrap px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                  {problem.targetValue}
                  {unit}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {problem && (
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={disabled || placedValue === null}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              เริ่มใหม่
            </Button>

            {!submitted ? (
              <Button
                onClick={handleSubmit}
                disabled={disabled || placedValue === null}
                className={cn(
                  'gap-2',
                  'bg-kidpen-gold hover:bg-kidpen-gold/90 text-white shadow-kidpen',
                )}
              >
                <Check className="w-4 h-4" />
                ตรวจคำตอบ
              </Button>
            ) : (
              <Badge
                className={cn(
                  'gap-1 px-3 py-1.5',
                  isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white',
                )}
              >
                {isCorrect ? '✓ ถูกต้อง!' : '✗ ลองอีกครั้ง'}
              </Badge>
            )}
          </div>
        )}

        {/* Hint */}
        {showHints && !submitted && problem && (
          <div
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg text-sm',
              getSubjectColorClass('bg'),
              getSubjectColorClass('text'),
            )}
          >
            <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p className="text-xs">
              คลิกบนเส้นจำนวนเพื่อวางตำแหน่งของ {problem.label || problem.targetValue}
              {unit}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default NumberLine;

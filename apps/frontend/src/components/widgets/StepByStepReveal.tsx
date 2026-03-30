'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Lightbulb,
  CheckCircle2,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import {
  StepByStepRevealProps,
  RevealStep,
  WidgetInteraction,
  WidgetResult,
} from './types';

/**
 * StepByStepReveal Widget
 *
 * A progressive revelation component for step-by-step solutions.
 * Students work through problems one step at a time, promoting active learning.
 *
 * Example use cases:
 * - Mathematical problem solving
 * - Science experiment procedures
 * - Coding algorithm walkthroughs
 * - Logic puzzles
 *
 * Part of the Kidpen "Spark of Joy" Widget Library
 */
export function StepByStepReveal({
  id,
  className,
  subject = 'math',
  disabled = false,
  showHints = true,
  title,
  steps,
  requireAttempt = false,
  autoAdvance = false,
  onInteract,
  onComplete,
}: StepByStepRevealProps) {
  // Track which steps are revealed
  const [revealedSteps, setRevealedSteps] = useState<Set<string>>(new Set());
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showExplanations, setShowExplanations] = useState<Set<string>>(new Set());
  const [startTime] = useState(Date.now());

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

  // Reveal a step
  const handleRevealStep = useCallback(
    (stepId: string, stepIndex: number) => {
      if (disabled) return;

      setRevealedSteps((prev) => new Set([...prev, stepId]));

      // Auto advance to next step
      if (autoAdvance && stepIndex < steps.length - 1) {
        setCurrentStepIndex(stepIndex + 1);
      }

      // Track interaction
      const interaction: WidgetInteraction = {
        type: 'click',
        timestamp: Date.now(),
        data: { action: 'reveal', stepId, stepIndex },
      };
      onInteract?.(interaction);

      // Check if all steps revealed
      if (revealedSteps.size + 1 === steps.length) {
        const result: WidgetResult = {
          success: true,
          attempts: 1,
          timeSpent: Date.now() - startTime,
          data: { stepsCompleted: steps.length },
        };
        onComplete?.(result);
      }
    },
    [disabled, autoAdvance, steps.length, revealedSteps.size, startTime, onInteract, onComplete],
  );

  // Toggle explanation
  const toggleExplanation = useCallback(
    (stepId: string) => {
      setShowExplanations((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(stepId)) {
          newSet.delete(stepId);
        } else {
          newSet.add(stepId);
        }
        return newSet;
      });
    },
    [],
  );

  // Reveal all steps
  const handleRevealAll = useCallback(() => {
    if (disabled) return;
    setRevealedSteps(new Set(steps.map((step) => step.id)));

    const result: WidgetResult = {
      success: true,
      attempts: 1,
      timeSpent: Date.now() - startTime,
      data: { stepsCompleted: steps.length, revealedAll: true },
    };
    onComplete?.(result);
  }, [disabled, steps, startTime, onComplete]);

  // Reset
  const handleReset = useCallback(() => {
    setRevealedSteps(new Set());
    setCurrentStepIndex(0);
    setShowExplanations(new Set());
  }, []);

  // Calculate progress
  const progress = Math.round((revealedSteps.size / steps.length) * 100);
  const allRevealed = revealedSteps.size === steps.length;

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
              <BookOpen className={cn('w-5 h-5', getSubjectColorClass('text'))} />
              {title}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              คลิกแต่ละขั้นตอนเพื่อเรียนรู้ทีละส่วน
            </CardDescription>
          </div>

          <Badge
            variant="outline"
            className={cn(
              'font-mono text-xs px-3 py-1',
              allRevealed
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                : cn(getSubjectColorClass('bg'), getSubjectColorClass('text'), getSubjectColorClass('border')),
            )}
          >
            {allRevealed && <CheckCircle2 className="w-3 h-3 mr-1" />}
            {revealedSteps.size}/{steps.length}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              allRevealed ? 'bg-emerald-500' : 'bg-kidpen-gold',
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Steps List */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const isRevealed = revealedSteps.has(step.id);
            const isCurrent = index === currentStepIndex;
            const isLocked = requireAttempt && !isRevealed && index > 0 && !revealedSteps.has(steps[index - 1].id);
            const hasExplanation = !!step.explanation;
            const isExplanationShown = showExplanations.has(step.id);

            return (
              <div
                key={step.id}
                className={cn(
                  'rounded-xl border-2 transition-all duration-300',
                  isRevealed
                    ? cn('bg-white dark:bg-gray-900', getSubjectColorClass('border'))
                    : 'border-dashed border-muted-foreground/30',
                  isCurrent && !isRevealed && !isLocked && 'ring-2 ring-offset-2',
                  isCurrent && !isRevealed && !isLocked && getSubjectColorClass('ring'),
                  isLocked && 'opacity-50',
                )}
              >
                {/* Step Header */}
                <button
                  onClick={() => !isLocked && !isRevealed && handleRevealStep(step.id, index)}
                  disabled={disabled || isLocked || isRevealed}
                  className={cn(
                    'w-full p-4 flex items-start gap-3 text-left',
                    'transition-colors duration-200',
                    !isRevealed && !isLocked && 'hover:bg-muted/50 cursor-pointer',
                    isRevealed && 'cursor-default',
                  )}
                >
                  {/* Step Number */}
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm',
                      isRevealed
                        ? cn(getSubjectColorClass('bg'), getSubjectColorClass('text'))
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {isRevealed ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    {isRevealed ? (
                      <div className="space-y-2">
                        <p className="font-medium text-foreground">{step.content}</p>
                        {step.hint && showHints && (
                          <p
                            className={cn(
                              'text-xs p-2 rounded-lg',
                              getSubjectColorClass('bg'),
                              getSubjectColorClass('text'),
                            )}
                          >
                            💡 {step.hint}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        {isLocked ? 'เปิดขั้นตอนก่อนหน้าก่อน' : 'คลิกเพื่อดูขั้นตอนนี้'}
                      </p>
                    )}
                  </div>

                  {/* Reveal Indicator */}
                  <div className="flex-shrink-0">
                    {isRevealed ? (
                      hasExplanation && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExplanation(step.id);
                          }}
                          className={cn(
                            'p-1.5 rounded-lg transition-colors',
                            'hover:bg-muted',
                            getSubjectColorClass('text'),
                          )}
                        >
                          {isExplanationShown ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      )
                    ) : (
                      <Eye className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Explanation Panel */}
                {isRevealed && hasExplanation && isExplanationShown && (
                  <div
                    className={cn(
                      'px-4 pb-4 pt-0 border-t',
                      getSubjectColorClass('border'),
                    )}
                  >
                    <div
                      className={cn(
                        'mt-3 p-3 rounded-lg text-sm',
                        getSubjectColorClass('bg'),
                        getSubjectColorClass('text'),
                      )}
                    >
                      <p className="font-medium mb-1 flex items-center gap-1">
                        <Lightbulb className="w-4 h-4" />
                        คำอธิบาย:
                      </p>
                      <p className="opacity-90">{step.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={disabled || revealedSteps.size === 0}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            เริ่มใหม่
          </Button>

          {!allRevealed && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRevealAll}
              disabled={disabled}
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              ดูทั้งหมด
            </Button>
          )}

          {allRevealed && (
            <Badge
              className={cn(
                'gap-1 px-3 py-1.5',
                'bg-emerald-500 text-white',
              )}
            >
              <CheckCircle2 className="w-4 h-4" />
              เสร็จสมบูรณ์!
            </Badge>
          )}
        </div>

        {/* Hint Section */}
        {showHints && !allRevealed && (
          <div
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg text-sm',
              getSubjectColorClass('bg'),
              getSubjectColorClass('text'),
            )}
          >
            <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p className="text-xs">
              พยายามคิดก่อนเปิดดูแต่ละขั้นตอน - การคิดเองจะช่วยให้จำได้ดีขึ้น!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default StepByStepReveal;

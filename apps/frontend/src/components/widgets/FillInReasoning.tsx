'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Check,
  X,
  RotateCcw,
  Lightbulb,
  PenLine,
  ChevronRight,
} from 'lucide-react';
import {
  BaseWidgetProps,
  WidgetInteraction,
  WidgetResult,
} from './types';

// Fill-in specific types
export interface BlankConfig {
  id: string;
  /** Accepted answers (case-insensitive comparison) */
  acceptedAnswers: string[];
  /** Placeholder text */
  placeholder?: string;
  /** Hint text */
  hint?: string;
  /** Width of the input (narrow, normal, wide) */
  width?: 'narrow' | 'normal' | 'wide';
}

export interface FillInReasoningProps extends BaseWidgetProps {
  /** Title/question text */
  title: string;
  /** The content with blanks marked as {{blank_id}} */
  content: string;
  /** Configuration for each blank */
  blanks: BlankConfig[];
  /** Whether to show hints for blanks */
  showBlankHints?: boolean;
  /** Whether answers are case-sensitive */
  caseSensitive?: boolean;
  /** Allow partial credit */
  partialCredit?: boolean;
}

/**
 * FillInReasoning Widget
 *
 * Fill-in-the-blank component for reasoning exercises.
 * Students complete sentences or equations by filling in missing parts.
 *
 * Example use cases:
 * - Complete math equations
 * - Fill in scientific formulas
 * - Complete logical sequences
 * - Thai vocabulary exercises
 *
 * Part of the Kidpen "Spark of Joy" Widget Library
 */
export function FillInReasoning({
  id,
  className,
  subject = 'math',
  disabled = false,
  showHints = true,
  title,
  content,
  blanks,
  showBlankHints = true,
  caseSensitive = false,
  partialCredit = true,
  onInteract,
  onComplete,
}: FillInReasoningProps) {
  // Track answers for each blank
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    return blanks.reduce(
      (acc, blank) => {
        acc[blank.id] = '';
        return acc;
      },
      {} as Record<string, string>,
    );
  });

  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, boolean>>({});
  const [attempts, setAttempts] = useState(0);
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

  // Handle input change
  const handleChange = useCallback(
    (blankId: string, value: string) => {
      if (disabled || submitted) return;

      setAnswers((prev) => ({ ...prev, [blankId]: value }));

      const interaction: WidgetInteraction = {
        type: 'input',
        timestamp: Date.now(),
        data: { blankId, value },
      };
      onInteract?.(interaction);
    },
    [disabled, submitted, onInteract],
  );

  // Check if answer is correct
  const isAnswerCorrect = useCallback(
    (blankId: string, answer: string) => {
      const blank = blanks.find((b) => b.id === blankId);
      if (!blank) return false;

      const normalizedAnswer = caseSensitive ? answer.trim() : answer.trim().toLowerCase();
      return blank.acceptedAnswers.some((accepted) => {
        const normalizedAccepted = caseSensitive ? accepted.trim() : accepted.trim().toLowerCase();
        return normalizedAnswer === normalizedAccepted;
      });
    },
    [blanks, caseSensitive],
  );

  // Check answers
  const handleSubmit = useCallback(() => {
    setAttempts((prev) => prev + 1);
    setSubmitted(true);

    const newFeedback: Record<string, boolean> = {};
    let correctCount = 0;

    blanks.forEach((blank) => {
      const isCorrect = isAnswerCorrect(blank.id, answers[blank.id]);
      newFeedback[blank.id] = isCorrect;
      if (isCorrect) correctCount++;
    });

    setFeedback(newFeedback);

    const allCorrect = correctCount === blanks.length;
    const score = partialCredit
      ? Math.round((correctCount / blanks.length) * 100)
      : allCorrect
        ? 100
        : 0;

    const result: WidgetResult = {
      success: allCorrect,
      score,
      attempts: attempts + 1,
      timeSpent: Date.now() - startTime,
      data: { answers, correctCount, totalBlanks: blanks.length },
    };
    onComplete?.(result);
  }, [blanks, answers, isAnswerCorrect, partialCredit, attempts, startTime, onComplete]);

  // Reset
  const handleReset = useCallback(() => {
    setAnswers(
      blanks.reduce(
        (acc, blank) => {
          acc[blank.id] = '';
          return acc;
        },
        {} as Record<string, string>,
      ),
    );
    setFeedback({});
    setSubmitted(false);
  }, [blanks]);

  // Parse content and replace blanks with inputs
  const renderedContent = useMemo(() => {
    const parts = content.split(/(\{\{[^}]+\}\})/g);

    return parts.map((part, index) => {
      const match = part.match(/\{\{([^}]+)\}\}/);
      if (!match) {
        return <span key={index}>{part}</span>;
      }

      const blankId = match[1];
      const blank = blanks.find((b) => b.id === blankId);
      if (!blank) {
        return <span key={index}>{part}</span>;
      }

      const widthClass = {
        narrow: 'w-16',
        normal: 'w-24',
        wide: 'w-40',
      }[blank.width || 'normal'];

      const isCorrect = feedback[blankId];
      const showResult = submitted;

      return (
        <span key={index} className="inline-flex items-center gap-1 mx-1">
          <Input
            type="text"
            value={answers[blankId]}
            onChange={(e) => handleChange(blankId, e.target.value)}
            placeholder={blank.placeholder || '...'}
            disabled={disabled || submitted}
            className={cn(
              'inline-flex h-8 text-center font-medium',
              widthClass,
              !showResult && 'border-dashed',
              !showResult && getSubjectColorClass('border'),
              showResult && isCorrect && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30',
              showResult && !isCorrect && 'border-red-500 bg-red-50 dark:bg-red-900/30',
            )}
          />
          {showResult && (
            <span
              className={cn(
                'flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center',
                isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white',
              )}
            >
              {isCorrect ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            </span>
          )}
        </span>
      );
    });
  }, [content, blanks, answers, feedback, submitted, disabled, handleChange, getSubjectColorClass]);

  // Check if all blanks are filled
  const allFilled = Object.values(answers).every((a) => a.trim().length > 0);

  // Calculate score for display
  const correctCount = Object.values(feedback).filter(Boolean).length;
  const scorePercent = blanks.length > 0 ? Math.round((correctCount / blanks.length) * 100) : 0;

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
              <PenLine className={cn('w-5 h-5', getSubjectColorClass('text'))} />
              {title}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              เติมคำตอบในช่องว่าง
            </CardDescription>
          </div>

          {submitted && (
            <Badge
              variant="outline"
              className={cn(
                'font-mono text-xs px-3 py-1',
                scorePercent === 100
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : scorePercent >= 50
                    ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400',
              )}
            >
              {correctCount}/{blanks.length} ถูก
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Content with blanks */}
        <div
          className={cn(
            'p-4 rounded-xl border-2 bg-white dark:bg-gray-900',
            'text-lg leading-relaxed',
            getSubjectColorClass('border'),
          )}
        >
          {renderedContent}
        </div>

        {/* Blank hints */}
        {showBlankHints && !submitted && (
          <div className="space-y-2">
            {blanks
              .filter((b) => b.hint)
              .map((blank) => (
                <div
                  key={blank.id}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-lg text-xs',
                    getSubjectColorClass('bg'),
                    getSubjectColorClass('text'),
                  )}
                >
                  <ChevronRight className="w-3 h-3" />
                  <span className="font-medium">{blank.placeholder || blank.id}:</span>
                  <span>{blank.hint}</span>
                </div>
              ))}
          </div>
        )}

        {/* Correct answers after submit */}
        {submitted && (
          <div className="space-y-2">
            {blanks
              .filter((blank) => !feedback[blank.id])
              .map((blank) => (
                <div
                  key={blank.id}
                  className="flex items-center gap-2 p-2 rounded-lg text-sm bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
                >
                  <Lightbulb className="w-4 h-4 flex-shrink-0" />
                  <span>
                    คำตอบที่ถูกต้อง: <strong>{blank.acceptedAnswers[0]}</strong>
                  </span>
                </div>
              ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={disabled || (!submitted && Object.values(answers).every((a) => !a))}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            เริ่มใหม่
          </Button>

          {!submitted ? (
            <Button
              onClick={handleSubmit}
              disabled={disabled || !allFilled}
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
                scorePercent === 100 ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white',
              )}
            >
              {scorePercent === 100 ? '✓ ยอดเยี่ยม!' : `${scorePercent}% ถูกต้อง`}
            </Badge>
          )}
        </div>

        {/* Hint */}
        {showHints && !submitted && (
          <div
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg text-sm',
              getSubjectColorClass('bg'),
              getSubjectColorClass('text'),
            )}
          >
            <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p className="text-xs">
              พิมพ์คำตอบลงในช่องว่างแต่ละช่อง แล้วกดตรวจคำตอบเมื่อพร้อม
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default FillInReasoning;

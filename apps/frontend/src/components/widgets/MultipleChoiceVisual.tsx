'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Check,
  X,
  RotateCcw,
  Lightbulb,
  Shuffle,
  ImageIcon,
} from 'lucide-react';
import {
  BaseWidgetProps,
  WidgetInteraction,
  WidgetResult,
} from './types';

// Multiple choice specific types
export interface ChoiceOption {
  id: string;
  content: string;
  image?: string;
  isCorrect?: boolean;
  explanation?: string;
}

export interface MultipleChoiceVisualProps extends BaseWidgetProps {
  /** Title/question text */
  question: string;
  /** Optional question image */
  questionImage?: string;
  /** Available choices */
  options: ChoiceOption[];
  /** Whether to allow multiple selections */
  allowMultiple?: boolean;
  /** Whether to show images in options */
  showImages?: boolean;
  /** Whether to shuffle options on load */
  shuffleOptions?: boolean;
  /** Grid layout columns (1, 2, or 4) */
  columns?: 1 | 2 | 4;
}

/**
 * MultipleChoiceVisual Widget
 *
 * Visual multiple choice component with image support.
 * Designed for visual learners and younger students.
 *
 * Example use cases:
 * - Identify shapes, animals, elements
 * - Match images to concepts
 * - Visual math problems
 * - Science identification
 *
 * Part of the Kidpen "Spark of Joy" Widget Library
 */
export function MultipleChoiceVisual({
  id,
  className,
  subject = 'science',
  disabled = false,
  showHints = true,
  question,
  questionImage,
  options,
  allowMultiple = false,
  showImages = true,
  shuffleOptions = false,
  columns = 2,
  onInteract,
  onComplete,
}: MultipleChoiceVisualProps) {
  // Shuffle options if needed
  const [shuffledOptions] = useState(() => {
    if (shuffleOptions) {
      return [...options].sort(() => Math.random() - 0.5);
    }
    return options;
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
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
    return colorMap[subject]?.[variant] || colorMap.science[variant];
  };

  // Handle option selection
  const handleSelect = useCallback(
    (optionId: string) => {
      if (disabled || submitted) return;

      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        if (allowMultiple) {
          if (newSet.has(optionId)) {
            newSet.delete(optionId);
          } else {
            newSet.add(optionId);
          }
        } else {
          newSet.clear();
          newSet.add(optionId);
        }
        return newSet;
      });

      // Track interaction
      const interaction: WidgetInteraction = {
        type: 'click',
        timestamp: Date.now(),
        data: { action: 'select', optionId },
      };
      onInteract?.(interaction);
    },
    [disabled, submitted, allowMultiple, onInteract],
  );

  // Check answer
  const handleSubmit = useCallback(() => {
    if (selectedIds.size === 0) return;

    setAttempts((prev) => prev + 1);
    setSubmitted(true);

    const correctIds = new Set(options.filter((o) => o.isCorrect).map((o) => o.id));
    const selectedArray = Array.from(selectedIds);
    const correctArray = Array.from(correctIds);

    const isCorrect =
      selectedArray.length === correctArray.length &&
      selectedArray.every((id) => correctIds.has(id));

    const result: WidgetResult = {
      success: isCorrect,
      score: isCorrect ? 100 : 0,
      attempts: attempts + 1,
      timeSpent: Date.now() - startTime,
      data: { selected: selectedArray, correct: correctArray },
    };
    onComplete?.(result);
  }, [selectedIds, options, attempts, startTime, onComplete]);

  // Reset
  const handleReset = useCallback(() => {
    setSelectedIds(new Set());
    setSubmitted(false);
  }, []);

  // Get grid columns class
  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    4: 'grid-cols-2 md:grid-cols-4',
  }[columns];

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
        <CardTitle className="text-lg font-outfit font-semibold flex items-center gap-2">
          <ImageIcon className={cn('w-5 h-5', getSubjectColorClass('text'))} />
          {question}
        </CardTitle>
        {allowMultiple && (
          <CardDescription className="text-sm text-muted-foreground">
            เลือกได้มากกว่า 1 ตัวเลือก
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question Image */}
        {questionImage && (
          <div className="flex justify-center">
            <img
              src={questionImage}
              alt="คำถาม"
              className={cn(
                'max-h-48 rounded-xl border-2 object-contain',
                getSubjectColorClass('border'),
              )}
            />
          </div>
        )}

        {/* Options Grid */}
        <div className={cn('grid gap-3', gridColsClass)}>
          {shuffledOptions.map((option) => {
            const isSelected = selectedIds.has(option.id);
            const isCorrect = option.isCorrect;
            const showResult = submitted;

            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                disabled={disabled || submitted}
                className={cn(
                  'relative p-4 rounded-xl border-2 transition-all duration-200',
                  'flex flex-col items-center gap-3 text-center',
                  !submitted && !isSelected && 'hover:scale-105 hover:shadow-md bg-white dark:bg-gray-900',
                  !submitted && isSelected && cn(
                    'scale-105 shadow-md ring-2 ring-offset-2',
                    getSubjectColorClass('bg'),
                    getSubjectColorClass('border'),
                    getSubjectColorClass('ring'),
                  ),
                  showResult && isSelected && isCorrect && 'bg-emerald-100 border-emerald-500 dark:bg-emerald-900/30',
                  showResult && isSelected && !isCorrect && 'bg-red-100 border-red-500 dark:bg-red-900/30',
                  showResult && !isSelected && isCorrect && 'bg-emerald-50 border-emerald-300 dark:bg-emerald-900/20 dark:border-emerald-700',
                  !submitted && !isSelected && 'border-muted-foreground/20',
                )}
              >
                {/* Option Image */}
                {showImages && option.image && (
                  <img
                    src={option.image}
                    alt={option.content}
                    className="w-16 h-16 object-contain rounded-lg"
                  />
                )}

                {/* Option Content */}
                <span className="text-sm font-medium">{option.content}</span>

                {/* Result Indicator */}
                {showResult && (
                  <div
                    className={cn(
                      'absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center',
                      isSelected && isCorrect && 'bg-emerald-500 text-white',
                      isSelected && !isCorrect && 'bg-red-500 text-white',
                      !isSelected && isCorrect && 'bg-emerald-200 text-emerald-700',
                    )}
                  >
                    {isCorrect ? <Check className="w-4 h-4" /> : isSelected && <X className="w-4 h-4" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation after submit */}
        {submitted && (
          <div className="space-y-2">
            {shuffledOptions
              .filter((o) => o.isCorrect && o.explanation)
              .map((option) => (
                <div
                  key={option.id}
                  className={cn(
                    'p-3 rounded-lg text-sm',
                    'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200',
                  )}
                >
                  <p className="font-medium">💡 {option.content}</p>
                  <p className="mt-1 opacity-90">{option.explanation}</p>
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
            disabled={disabled || (!submitted && selectedIds.size === 0)}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            เริ่มใหม่
          </Button>

          {!submitted ? (
            <Button
              onClick={handleSubmit}
              disabled={disabled || selectedIds.size === 0}
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
                Array.from(selectedIds).every((id) =>
                  options.find((o) => o.id === id)?.isCorrect,
                ) &&
                  Array.from(selectedIds).length ===
                    options.filter((o) => o.isCorrect).length
                  ? 'bg-emerald-500 text-white'
                  : 'bg-red-500 text-white',
              )}
            >
              {Array.from(selectedIds).every((id) =>
                options.find((o) => o.id === id)?.isCorrect,
              ) &&
              Array.from(selectedIds).length ===
                options.filter((o) => o.isCorrect).length
                ? '✓ ถูกต้อง!'
                : '✗ ลองอีกครั้ง'}
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
              {allowMultiple
                ? 'เลือกตัวเลือกที่ถูกต้องทั้งหมด แล้วกดตรวจคำตอบ'
                : 'เลือกตัวเลือกที่ถูกต้องที่สุด'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MultipleChoiceVisual;

'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Check,
  RotateCcw,
  Lightbulb,
  Scale,
  Plus,
  Minus,
  X,
  Divide,
} from 'lucide-react';
import {
  BaseWidgetProps,
  WidgetInteraction,
  WidgetResult,
} from './types';

// Balance Scale specific types
export interface ScaleItem {
  id: string;
  /** Display value (can include variable like "x", "2x", "5") */
  display: string;
  /** Numeric weight for balance calculation */
  weight: number;
  /** Whether this is a variable (affects display) */
  isVariable?: boolean;
  /** Color for the item */
  color?: string;
}

export interface BalanceScaleProps extends BaseWidgetProps {
  /** Title text */
  title: string;
  /** Description/instructions */
  description?: string;
  /** Items on the left side of the scale */
  leftItems: ScaleItem[];
  /** Items on the right side of the scale */
  rightItems: ScaleItem[];
  /** Target variable to solve for (optional) */
  targetVariable?: string;
  /** Expected solution (for validation) */
  expectedSolution?: number;
  /** Whether students can add/remove items */
  interactive?: boolean;
  /** Available operations */
  operations?: ('add' | 'subtract' | 'multiply' | 'divide')[];
}

/**
 * BalanceScale Widget
 *
 * Visual equation solving using a balance scale metaphor.
 * Students manipulate both sides to isolate variables.
 *
 * Example use cases:
 * - Solve linear equations (2x + 3 = 11)
 * - Understand equation balancing
 * - Visualize algebraic operations
 *
 * Part of the Kidpen "Spark of Joy" Widget Library
 */
export function BalanceScale({
  id,
  className,
  subject = 'math',
  disabled = false,
  showHints = true,
  title,
  description,
  leftItems: initialLeft,
  rightItems: initialRight,
  targetVariable,
  expectedSolution,
  interactive = true,
  operations = ['add', 'subtract', 'multiply', 'divide'],
  onInteract,
  onComplete,
}: BalanceScaleProps) {
  const [leftItems, setLeftItems] = useState<ScaleItem[]>(initialLeft);
  const [rightItems, setRightItems] = useState<ScaleItem[]>(initialRight);
  const [operationValue, setOperationValue] = useState<string>('');
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ left: ScaleItem[]; right: ScaleItem[] }>>([]);
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());

  // Calculate total weight on each side
  const leftWeight = useMemo(
    () => leftItems.reduce((sum, item) => sum + item.weight, 0),
    [leftItems],
  );
  const rightWeight = useMemo(
    () => rightItems.reduce((sum, item) => sum + item.weight, 0),
    [rightItems],
  );

  // Determine balance state
  const balanceState = useMemo(() => {
    const diff = leftWeight - rightWeight;
    if (Math.abs(diff) < 0.001) return 'balanced';
    return diff > 0 ? 'left-heavy' : 'right-heavy';
  }, [leftWeight, rightWeight]);

  // Calculate tilt angle
  const tiltAngle = useMemo(() => {
    const diff = leftWeight - rightWeight;
    const maxTilt = 15;
    const normalizedDiff = Math.max(-1, Math.min(1, diff / 20));
    return normalizedDiff * maxTilt;
  }, [leftWeight, rightWeight]);

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

  // Apply operation to both sides
  const applyOperation = useCallback(
    (op: string, value: number) => {
      if (disabled || submitted || value === 0) return;

      // Save history for undo
      setHistory((prev) => [...prev, { left: [...leftItems], right: [...rightItems] }]);

      const newItem: ScaleItem = {
        id: `op-${Date.now()}`,
        display: `${op === 'add' ? '+' : op === 'subtract' ? '-' : ''}${value}`,
        weight: op === 'add' ? value : op === 'subtract' ? -value : 0,
        color: 'amber',
      };

      if (op === 'add' || op === 'subtract') {
        setLeftItems((prev) => [...prev, { ...newItem, id: `${newItem.id}-L` }]);
        setRightItems((prev) => [...prev, { ...newItem, id: `${newItem.id}-R` }]);
      } else if (op === 'multiply' && value !== 0) {
        setLeftItems((prev) =>
          prev.map((item) => ({
            ...item,
            weight: item.weight * value,
            display: value === 1 ? item.display : `${value}(${item.display})`,
          })),
        );
        setRightItems((prev) =>
          prev.map((item) => ({
            ...item,
            weight: item.weight * value,
            display: value === 1 ? item.display : `${value}(${item.display})`,
          })),
        );
      } else if (op === 'divide' && value !== 0) {
        setLeftItems((prev) =>
          prev.map((item) => ({
            ...item,
            weight: item.weight / value,
            display: `(${item.display})/${value}`,
          })),
        );
        setRightItems((prev) =>
          prev.map((item) => ({
            ...item,
            weight: item.weight / value,
            display: `(${item.display})/${value}`,
          })),
        );
      }

      setSelectedOperation(null);
      setOperationValue('');

      // Track interaction
      const interaction: WidgetInteraction = {
        type: 'click',
        timestamp: Date.now(),
        data: { operation: op, value, leftWeight, rightWeight },
      };
      onInteract?.(interaction);
    },
    [disabled, submitted, leftItems, rightItems, leftWeight, rightWeight, onInteract],
  );

  // Undo last operation
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setLeftItems(lastState.left);
    setRightItems(lastState.right);
    setHistory((prev) => prev.slice(0, -1));
  }, [history]);

  // Reset to initial state
  const handleReset = useCallback(() => {
    setLeftItems(initialLeft);
    setRightItems(initialRight);
    setHistory([]);
    setSubmitted(false);
    setSelectedOperation(null);
    setOperationValue('');
  }, [initialLeft, initialRight]);

  // Check if solved
  const handleSubmit = useCallback(() => {
    setAttempts((prev) => prev + 1);
    setSubmitted(true);

    // Check if variable is isolated and solution matches
    const hasOnlyVariable = leftItems.length === 1 && leftItems[0].isVariable;
    const isCorrect =
      hasOnlyVariable &&
      expectedSolution !== undefined &&
      Math.abs(rightWeight - expectedSolution) < 0.001;

    const result: WidgetResult = {
      success: isCorrect,
      score: isCorrect ? 100 : 0,
      attempts: attempts + 1,
      timeSpent: Date.now() - startTime,
      data: {
        leftItems,
        rightItems,
        leftWeight,
        rightWeight,
        expectedSolution,
      },
    };
    onComplete?.(result);
  }, [leftItems, rightWeight, expectedSolution, attempts, startTime, onComplete, rightItems, leftWeight]);

  // Operation button
  const OperationButton = ({
    op,
    icon: Icon,
    label,
  }: {
    op: string;
    icon: typeof Plus;
    label: string;
  }) => (
    <Button
      variant={selectedOperation === op ? 'default' : 'outline'}
      size="sm"
      onClick={() => setSelectedOperation(selectedOperation === op ? null : op)}
      disabled={disabled || submitted || !operations.includes(op as any)}
      className={cn(
        'gap-1',
        selectedOperation === op && 'bg-kidpen-gold hover:bg-kidpen-gold/90',
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Button>
  );

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
              <Scale className={cn('w-5 h-5', getSubjectColorClass('text'))} />
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
              'font-mono text-xs px-3 py-1',
              balanceState === 'balanced'
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                : 'bg-amber-100 text-amber-700 border-amber-200',
            )}
          >
            {balanceState === 'balanced' ? '⚖️ สมดุล' : '⚠️ ไม่สมดุล'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Scale Visualization */}
        <div className="relative h-64 flex items-center justify-center">
          {/* Base/Stand */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-32 bg-gradient-to-t from-gray-400 to-gray-300 rounded-t-lg" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-gray-500 rounded-lg" />

          {/* Beam */}
          <div
            className={cn(
              'absolute top-16 left-1/2 -translate-x-1/2 w-80 h-3 rounded-full',
              'bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400',
              'shadow-lg transition-transform duration-500',
            )}
            style={{ transform: `translateX(-50%) rotate(${tiltAngle}deg)` }}
          >
            {/* Fulcrum */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-600 rounded-full" />

            {/* Left Pan */}
            <div
              className="absolute -left-4 top-full pt-2"
              style={{ transform: `rotate(${-tiltAngle}deg)` }}
            >
              <div className="w-4 h-16 bg-gray-300 mx-auto" />
              <div
                className={cn(
                  'w-28 h-20 rounded-xl border-2 flex flex-wrap items-center justify-center gap-1 p-2',
                  'bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30',
                  'border-blue-200 dark:border-blue-700',
                )}
              >
                {leftItems.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      'px-2 py-1 rounded-md text-xs font-bold',
                      item.isVariable
                        ? 'bg-violet-500 text-white'
                        : 'bg-blue-500 text-white',
                    )}
                  >
                    {item.display}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Pan */}
            <div
              className="absolute -right-4 top-full pt-2"
              style={{ transform: `rotate(${-tiltAngle}deg)` }}
            >
              <div className="w-4 h-16 bg-gray-300 mx-auto" />
              <div
                className={cn(
                  'w-28 h-20 rounded-xl border-2 flex flex-wrap items-center justify-center gap-1 p-2',
                  'bg-gradient-to-b from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30',
                  'border-emerald-200 dark:border-emerald-700',
                )}
              >
                {rightItems.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      'px-2 py-1 rounded-md text-xs font-bold',
                      item.isVariable
                        ? 'bg-violet-500 text-white'
                        : 'bg-emerald-500 text-white',
                    )}
                  >
                    {item.display}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Equation Display */}
        <div
          className={cn(
            'p-3 rounded-xl text-center font-mono text-lg font-bold',
            getSubjectColorClass('bg'),
            getSubjectColorClass('text'),
          )}
        >
          {leftItems.map((item) => item.display).join(' + ')} ={' '}
          {rightItems.map((item) => item.display).join(' + ')}
        </div>

        {/* Operations Panel */}
        {interactive && !submitted && (
          <div className="space-y-4 p-4 rounded-xl border-2 border-dashed border-muted-foreground/30">
            <p className="text-sm font-medium text-center text-muted-foreground">
              ทำกับทั้งสองข้างพร้อมกัน:
            </p>

            <div className="flex flex-wrap justify-center gap-2">
              <OperationButton op="add" icon={Plus} label="บวก" />
              <OperationButton op="subtract" icon={Minus} label="ลบ" />
              <OperationButton op="multiply" icon={X} label="คูณ" />
              <OperationButton op="divide" icon={Divide} label="หาร" />
            </div>

            {selectedOperation && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-medium">
                  {selectedOperation === 'add' && 'บวก'}
                  {selectedOperation === 'subtract' && 'ลบ'}
                  {selectedOperation === 'multiply' && 'คูณ'}
                  {selectedOperation === 'divide' && 'หารด้วย'}
                </span>
                <Input
                  type="number"
                  value={operationValue}
                  onChange={(e) => setOperationValue(e.target.value)}
                  placeholder="ใส่ตัวเลข"
                  className="w-24 text-center"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    const value = parseFloat(operationValue);
                    if (!isNaN(value)) {
                      applyOperation(selectedOperation, value);
                    }
                  }}
                  disabled={!operationValue || isNaN(parseFloat(operationValue))}
                  className="bg-kidpen-gold hover:bg-kidpen-gold/90"
                >
                  ทำ
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={disabled || history.length === 0 || submitted}
              className="gap-2"
            >
              ↩️ ย้อนกลับ
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={disabled}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              เริ่มใหม่
            </Button>
          </div>

          {!submitted ? (
            <Button
              onClick={handleSubmit}
              disabled={disabled}
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
                leftItems.length === 1 &&
                  leftItems[0].isVariable &&
                  expectedSolution !== undefined &&
                  Math.abs(rightWeight - expectedSolution) < 0.001
                  ? 'bg-emerald-500 text-white'
                  : 'bg-amber-500 text-white',
              )}
            >
              {leftItems.length === 1 &&
              leftItems[0].isVariable &&
              expectedSolution !== undefined &&
              Math.abs(rightWeight - expectedSolution) < 0.001
                ? `✓ ${targetVariable} = ${expectedSolution}`
                : 'ยังไม่ถูกต้อง - ลองอีกครั้ง'}
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
              ทำการคำนวณกับทั้งสองข้างพร้อมกันเพื่อรักษาสมดุล เป้าหมายคือแยก{' '}
              {targetVariable || 'ตัวแปร'} ให้อยู่ข้างเดียว
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default BalanceScale;
